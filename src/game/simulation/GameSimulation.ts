import type {
  GameSnapshot,
  HazardState,
  IngredientId,
  ItemInstance,
  ItemState,
  LevelDefinition,
  PlayerInputState,
  PlayerState,
  RecipeDefinition,
  RecipeStep,
  RoundState,
  SimulationEvent,
  StationState,
  Vector2,
} from "../types";
import { clamp, distance, distanceSquared, normalize } from "../math/vector";
import { OrderSystem } from "../systems/OrderSystem";
import { RecipeSystem } from "../systems/RecipeSystem";
import { ScoreSystem } from "../systems/ScoreSystem";
import { StationSystem } from "../systems/StationSystem";

type GameSimulationOptions = {
  level: LevelDefinition;
  recipes: RecipeDefinition[];
  playerCount: number;
};

const playerColors = ["#f7c66a", "#9ad2cb", "#e86f68", "#a7d676"];
const playerNames = ["Biscotte", "Miso", "Praline", "Katsu"];
const itemDefinitions: Record<IngredientId | "plate", { name: string; color: string }> = {
  fish: { name: "Poisson", color: "#5bbbd6" },
  bread: { name: "Pain", color: "#d8a85b" },
  herb: { name: "Herbes", color: "#7ac96f" },
  plate: { name: "Assiette", color: "#fff4d6" },
};
const itemStateLabels: Record<ItemState, string> = {
  raw: "",
  cut: "coupé",
  cooked: "cuit",
  burned: "brûlé",
  dirty: "sale",
  plated: "dressé",
};

export class GameSimulation {
  private readonly level: LevelDefinition;
  private readonly recipes: RecipeSystem;
  private readonly orders: OrderSystem;
  private readonly stations: StationSystem;
  private readonly score = new ScoreSystem();
  private readonly players: PlayerState[];
  private readonly hazards: HazardState[];
  private readonly items = new Map<string, ItemInstance>();

  private elapsedSeconds = 0;
  private roundRemainingSeconds: number;
  private roundState: RoundState = "playing";
  private statusMessage = "Prends des ingrédients, prépare-les, dresse une assiette, puis sers-la.";
  private nextItemId = 1;

  constructor(options: GameSimulationOptions) {
    this.level = options.level;
    this.roundRemainingSeconds = options.level.roundDurationSeconds;
    this.recipes = new RecipeSystem(options.recipes);
    this.orders = new OrderSystem(this.recipes);
    this.stations = new StationSystem(options.level.stations);
    this.hazards = options.level.hazards.map((hazard) => ({
      ...hazard,
      position: { ...hazard.position },
    }));

    this.players = Array.from({ length: options.playerCount }, (_, index) => {
      const spawn = options.level.playerSpawns[index] ?? { x: 0, y: 0 };

      return {
        id: `player-${index + 1}`,
        slot: index + 1,
        name: playerNames[index] ?? `Chef ${index + 1}`,
        color: playerColors[index] ?? "#ffffff",
        position: { ...spawn },
        velocity: { x: 0, y: 0 },
        facing: { x: 0, y: 1 },
        heldItem: null,
        lastInteraction: null,
        slipSeconds: 0,
        slipCooldownSeconds: 0,
        slipVelocity: { x: 0, y: 0 },
        speedBoostSeconds: 0,
        meowCooldownSeconds: 0,
      };
    });
  }

  getPlayerSlots(): number[] {
    return this.players.map((player) => player.slot);
  }

  tick(deltaSeconds: number, inputs: Map<number, PlayerInputState>): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    if (this.consumeReset(inputs)) {
      this.reset();
      return [{ type: "reset", message: "Cuisine remise à zéro. Nouveau service !" }];
    }

    if (this.roundState === "finished") {
      return events;
    }

    this.elapsedSeconds += deltaSeconds;
    this.roundRemainingSeconds = Math.max(0, this.roundRemainingSeconds - deltaSeconds);

    if (this.roundRemainingSeconds === 0) {
      this.roundState = "finished";
      this.statusMessage = "Service terminé. Appuie sur R pour rejouer.";
      events.push({ type: "order", message: this.statusMessage });
      return events;
    }

    const orderEvents = this.orders.tick(deltaSeconds);

    if (orderEvents.length > 0) {
      this.statusMessage = orderEvents[orderEvents.length - 1].message;
    }

    events.push(...orderEvents);
    events.push(...this.tickStations(deltaSeconds));

    for (const player of this.players) {
      this.tickPlayerTimers(player, deltaSeconds);
      const input = inputs.get(player.slot);

      if (!input) {
        continue;
      }

      this.movePlayer(player, input, deltaSeconds);

      if (input.interactPressed) {
        events.push(this.handleInteraction(player));
      }

      if (input.cancelPressed) {
        events.push(this.dropHeldItem(player, "drop"));
      }

      if (input.meowPressed) {
        events.push(this.handleMeow(player));
      }
    }

    this.resolvePlayerBumps();
    events.push(...this.tickHazards());

    return events;
  }

  getSnapshot(): GameSnapshot {
    return {
      elapsedSeconds: this.elapsedSeconds,
      levelId: this.level.id,
      levelName: this.level.name,
      levelDescription: this.level.description,
      levelVisualVariant: this.level.visualVariant,
      roundState: this.roundState,
      roundRemainingSeconds: this.roundRemainingSeconds,
      players: this.players.map((player) => ({
        ...player,
        position: { ...player.position },
        velocity: { ...player.velocity },
        facing: { ...player.facing },
        heldItem: player.heldItem ? { ...player.heldItem } : null,
        slipVelocity: { ...player.slipVelocity },
      })),
      stations: this.stations.getStations(),
      items: Array.from(this.items.values()).map((item) => ({
        ...item,
        contents: item.contents.map((step) => ({ ...step })),
        position: { ...item.position },
        location: { ...item.location },
      })),
      hazards: this.hazards.map((hazard) => ({
        ...hazard,
        position: { ...hazard.position },
      })),
      orders: this.orders.getOrders(),
      score: this.score.getScore(),
      statusMessage: this.statusMessage,
    };
  }

  private reset(): void {
    this.elapsedSeconds = 0;
    this.roundRemainingSeconds = this.level.roundDurationSeconds;
    this.roundState = "playing";
    this.statusMessage = "Cuisine relancée. Attrape les ingrédients et sers vite.";
    this.nextItemId = 1;
    this.items.clear();
    this.score.reset();
    this.orders.reset();
    this.stations.reset();

    this.players.forEach((player, index) => {
      const spawn = this.level.playerSpawns[index] ?? { x: 0, y: 0 };
      player.position = { ...spawn };
      player.velocity = { x: 0, y: 0 };
      player.facing = { x: 0, y: 1 };
      player.heldItem = null;
      player.lastInteraction = null;
      player.slipSeconds = 0;
      player.slipCooldownSeconds = 0;
      player.slipVelocity = { x: 0, y: 0 };
      player.speedBoostSeconds = 0;
      player.meowCooldownSeconds = 0;
    });
  }

  private consumeReset(inputs: Map<number, PlayerInputState>): boolean {
    return Array.from(inputs.values()).some((input) => input.resetPressed);
  }

  private tickPlayerTimers(player: PlayerState, deltaSeconds: number): void {
    player.speedBoostSeconds = Math.max(0, player.speedBoostSeconds - deltaSeconds);
    player.meowCooldownSeconds = Math.max(0, player.meowCooldownSeconds - deltaSeconds);
    player.slipCooldownSeconds = Math.max(0, player.slipCooldownSeconds - deltaSeconds);

    if (player.slipSeconds > 0) {
      player.slipSeconds = Math.max(0, player.slipSeconds - deltaSeconds);
      const slipDrag = Math.exp(-1.25 * deltaSeconds);
      player.slipVelocity.x *= slipDrag;
      player.slipVelocity.y *= slipDrag;
    } else {
      player.slipVelocity = { x: 0, y: 0 };
    }
  }

  private movePlayer(player: PlayerState, input: PlayerInputState, deltaSeconds: number): void {
    const movement = normalize(input.move);
    const hasMovementInput = Math.abs(input.move.x) + Math.abs(input.move.y) > 0.01;
    const boosted = player.speedBoostSeconds > 0;
    const baseSpeed = input.dashPressed ? 5 : 3.55;
    const speed = boosted ? baseSpeed * 1.3 : baseSpeed;
    const controlledVelocity = {
      x: movement.x * speed,
      y: movement.y * speed,
    };
    const targetVelocity =
      player.slipSeconds > 0
        ? {
            x: player.slipVelocity.x * 4.15 + controlledVelocity.x * 0.42,
            y: player.slipVelocity.y * 4.15 + controlledVelocity.y * 0.42,
          }
        : controlledVelocity;
    const response = player.slipSeconds > 0 ? 5.5 : hasMovementInput ? 17 : 10;
    const blend = 1 - Math.exp(-response * deltaSeconds);

    player.velocity.x += (targetVelocity.x - player.velocity.x) * blend;
    player.velocity.y += (targetVelocity.y - player.velocity.y) * blend;

    if (!hasMovementInput && player.slipSeconds === 0 && Math.abs(player.velocity.x) + Math.abs(player.velocity.y) < 0.04) {
      player.velocity = { x: 0, y: 0 };
    }

    if (hasMovementInput && player.slipSeconds === 0) {
      player.facing = movement;
    }

    player.position.x += player.velocity.x * deltaSeconds;
    player.position.y += player.velocity.y * deltaSeconds;
    this.clampPlayerPosition(player);
    this.resolveStationCollisions(player);
  }

  private clampPlayerPosition(player: PlayerState): void {
    player.position.x = clamp(player.position.x, this.level.bounds.minX, this.level.bounds.maxX);
    player.position.y = clamp(player.position.y, this.level.bounds.minY, this.level.bounds.maxY);
  }

  private resolveStationCollisions(player: PlayerState): void {
    const playerRadius = 0.31;

    for (const station of this.stations.getMutableStations()) {
      const solidRadius = this.getStationSolidRadius(station);

      if (solidRadius <= 0) {
        continue;
      }

      const minDistance = solidRadius + playerRadius;
      const between = {
        x: player.position.x - station.position.x,
        y: player.position.y - station.position.y,
      };
      const currentDistance = Math.max(Math.hypot(between.x, between.y), 0.001);

      if (currentDistance >= minDistance) {
        continue;
      }

      const fallback = Math.abs(player.facing.x) + Math.abs(player.facing.y) > 0.01 ? player.facing : { x: 1, y: 0 };
      const normal =
        currentDistance > 0.001
          ? { x: between.x / currentDistance, y: between.y / currentDistance }
          : fallback;
      const push = minDistance - currentDistance;

      player.position.x += normal.x * push;
      player.position.y += normal.y * push;
      this.clampPlayerPosition(player);

      const velocityIntoStation = player.velocity.x * normal.x + player.velocity.y * normal.y;

      if (velocityIntoStation < 0) {
        player.velocity.x -= normal.x * velocityIntoStation;
        player.velocity.y -= normal.y * velocityIntoStation;
      }
    }
  }

  private getStationSolidRadius(station: StationState): number {
    if (station.solidRadius !== undefined) {
      return station.solidRadius;
    }

    if (station.type === "ingredient" || station.type === "plate") {
      return 0.38;
    }

    if (station.type === "trash") {
      return 0.34;
    }

    return 0.48;
  }

  private resolvePlayerBumps(): void {
    const minDistance = 0.62;

    for (let i = 0; i < this.players.length; i += 1) {
      for (let j = i + 1; j < this.players.length; j += 1) {
        const first = this.players[i];
        const second = this.players[j];
        const between = {
          x: second.position.x - first.position.x,
          y: second.position.y - first.position.y,
        };
        const currentDistance = Math.max(distance(first.position, second.position), 0.001);

        if (currentDistance >= minDistance) {
          continue;
        }

        const push = (minDistance - currentDistance) * 0.5;
        const normal = {
          x: between.x / currentDistance,
          y: between.y / currentDistance,
        };

        first.position.x = clamp(
          first.position.x - normal.x * push,
          this.level.bounds.minX,
          this.level.bounds.maxX,
        );
        first.position.y = clamp(
          first.position.y - normal.y * push,
          this.level.bounds.minY,
          this.level.bounds.maxY,
        );
        second.position.x = clamp(
          second.position.x + normal.x * push,
          this.level.bounds.minX,
          this.level.bounds.maxX,
        );
        second.position.y = clamp(
          second.position.y + normal.y * push,
          this.level.bounds.minY,
          this.level.bounds.maxY,
        );

        first.velocity.x -= normal.x * 0.28;
        first.velocity.y -= normal.y * 0.28;
        second.velocity.x += normal.x * 0.28;
        second.velocity.y += normal.y * 0.28;
        this.resolveStationCollisions(first);
        this.resolveStationCollisions(second);
      }
    }
  }

  private tickHazards(): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    for (const hazard of this.hazards) {
      if (!hazard.active) {
        continue;
      }

      for (const player of this.players) {
        const onHazard = distanceSquared(player.position, hazard.position) <= hazard.radius * hazard.radius;

        if (!onHazard || player.slipSeconds > 0 || player.slipCooldownSeconds > 0) {
          continue;
        }

        player.slipSeconds = 0.72;
        player.slipCooldownSeconds = 1.05;
        player.slipVelocity = normalize(
          Math.abs(player.velocity.x) + Math.abs(player.velocity.y) > 0.1
            ? player.velocity
            : player.facing,
        );
        this.statusMessage = `${player.name} glisse dans une flaque de lait.`;
        events.push({ type: "slip", message: this.statusMessage });
      }
    }

    return events;
  }

  private tickStations(deltaSeconds: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    for (const station of this.stations.getMutableStations()) {
      if (!station.heldItemId) {
        continue;
      }

      const item = this.items.get(station.heldItemId);

      if (!item) {
        this.clearStation(station);
        continue;
      }

      if (station.status === "processing") {
        station.progress = Math.min(station.progressMax, station.progress + deltaSeconds);

        if (station.progress >= station.progressMax) {
          if (station.type === "cut") {
            item.state = "cut";
            item.label = this.getItemLabel(item);
            station.status = "ready";
            this.statusMessage = `${item.label} est prêt pour l'assiette.`;
            events.push({ type: "cut", message: this.statusMessage });
          }

          if (station.type === "cook") {
            item.state = "cooked";
            item.label = this.getItemLabel(item);
            station.status = "burning";
            station.progress = 0;
            station.progressMax = station.burnAfterSeconds ?? 4;
            this.statusMessage = `${item.label} est prêt. Attrape-le avant qu'il brûle !`;
            events.push({ type: "cook", message: this.statusMessage });
          }
        }
      } else if (station.status === "burning") {
        station.progress = Math.min(station.progressMax, station.progress + deltaSeconds);

        if (station.progress >= station.progressMax) {
          item.state = "burned";
          item.label = this.getItemLabel(item);
          station.status = "burned";
          this.statusMessage = `${item.label} a brûlé. Direction poubelle.`;
          events.push({ type: "burn", message: this.statusMessage });
        }
      }
    }

    return events;
  }

  private handleInteraction(player: PlayerState): SimulationEvent {
    const nearestStation = this.findNearestStation(player);

    player.lastInteraction = nearestStation?.id ?? null;

    if (player.heldItem) {
      if (nearestStation) {
        return this.useStationWithHeldItem(player, nearestStation);
      }

      return this.dropHeldItem(player, "drop");
    }

    if (nearestStation?.heldItemId && nearestStation.status !== "processing") {
      return this.pickupFromStation(player, nearestStation);
    }

    const worldItem = this.findNearestWorldItem(player.position);

    if (worldItem) {
      return this.pickupItem(player, worldItem);
    }

    if (nearestStation) {
      return this.useStationWithEmptyHands(player, nearestStation);
    }

    this.statusMessage = `${player.name} donne un coup de patte dans le vide.`;
    return { type: "error", message: this.statusMessage };
  }

  private useStationWithEmptyHands(player: PlayerState, station: StationState): SimulationEvent {
    if (station.type === "ingredient" && station.provides && station.provides !== "plate") {
      const item = this.createIngredient(station.provides, player.position);
      return this.pickupItem(player, item);
    }

    if (station.type === "plate") {
      const item = this.createPlate(player.position);
      return this.pickupItem(player, item);
    }

    this.statusMessage = `${station.label} a besoin d'un objet.`;
    return { type: "error", message: this.statusMessage };
  }

  private useStationWithHeldItem(player: PlayerState, station: StationState): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} ne porte rien.`;
      return { type: "error", message: this.statusMessage };
    }

    if (station.type === "cut") {
      return this.startCutting(player, station, item);
    }

    if (station.type === "cook") {
      return this.startCooking(player, station, item);
    }

    if (station.type === "assemble") {
      return this.useAssembly(player, station, item);
    }

    if (station.type === "serve") {
      return this.tryServe(player, item);
    }

    if (station.type === "trash") {
      return this.trashHeldItem(player);
    }

    this.statusMessage = `${player.name} ne peut pas utiliser ${item.label} sur ${station.label}.`;
    return { type: "error", message: this.statusMessage };
  }

  private startCutting(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (station.heldItemId || station.status === "processing") {
      this.statusMessage = `${station.label} est déjà occupé.`;
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || item.state !== "raw" || item.ingredientId === "bread") {
      this.statusMessage = `${item.label} ne se coupe pas ici.`;
      return { type: "error", message: this.statusMessage };
    }

    this.placeHeldItemOnStation(player, station);
    station.status = "processing";
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 2.2;
    this.statusMessage = `${player.name} découpe ${item.label}.`;
    return { type: "cut", message: this.statusMessage };
  }

  private startCooking(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (station.heldItemId || station.status === "processing" || station.status === "burning") {
      this.statusMessage = `${station.label} est déjà occupé.`;
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || item.state === "burned" || item.ingredientId !== "fish") {
      this.statusMessage = `${item.label} ne se cuit pas ici.`;
      return { type: "error", message: this.statusMessage };
    }

    this.placeHeldItemOnStation(player, station);
    station.status = "processing";
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 4.2;
    this.statusMessage = `${player.name} lance la cuisson de ${item.label}.`;
    return { type: "cook", message: this.statusMessage };
  }

  private useAssembly(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (!station.heldItemId && (item.kind === "plate" || item.kind === "dish")) {
      this.placeHeldItemOnStation(player, station);
      station.status = "ready";
      this.statusMessage = `${player.name} pose ${item.label} sur l'assemblage.`;
      return { type: "drop", message: this.statusMessage };
    }

    if (!station.heldItemId) {
      this.statusMessage = "L'assemblage demande une assiette d'abord.";
      return { type: "error", message: this.statusMessage };
    }

    const plate = this.items.get(station.heldItemId);

    if (!plate || (plate.kind !== "plate" && plate.kind !== "dish")) {
      this.statusMessage = "L'assemblage est bloqué par le mauvais objet.";
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || !item.ingredientId || item.state === "burned") {
      this.statusMessage = `${item.label} ne va pas sur une assiette.`;
      return { type: "error", message: this.statusMessage };
    }

    plate.kind = "dish";
    plate.definitionId = "dish";
    plate.state = "plated";
    plate.contents.push({ ingredient: item.ingredientId, state: item.state });
    plate.label = this.getItemLabel(plate);
    plate.color = "#fff4d6";
    item.location = { type: "discarded" };
    player.heldItem = null;
    this.statusMessage = `${player.name} ajoute ${this.formatStep({
      ingredient: item.ingredientId,
      state: item.state,
    })}.`;
    return { type: "interact", message: this.statusMessage };
  }

  private tryServe(player: PlayerState, item: ItemInstance): SimulationEvent {
    const activeOrder = this.orders.getOrders()[0];

    if (!activeOrder) {
      this.statusMessage = "Aucune commande n'attend.";
      return { type: "error", message: this.statusMessage };
    }

    if (!this.recipes.matchesRecipe(activeOrder.recipeId, item)) {
      this.statusMessage = `${item.label} ne correspond pas à ${activeOrder.recipeName}.`;
      return { type: "error", message: this.statusMessage };
    }

    const recipe = this.recipes.getRecipe(activeOrder.recipeId);
    const completed = this.orders.completeOrder(activeOrder.recipeId);

    if (!recipe || !completed) {
      this.statusMessage = "La commande a changé juste avant le service.";
      return { type: "error", message: this.statusMessage };
    }

    const value = this.score.addDelivery(completed, recipe);
    item.location = { type: "served" };
    player.heldItem = null;
    this.statusMessage = `${player.name} sert ${completed.recipeName} : +${value} points.`;
    return { type: "score", message: this.statusMessage };
  }

  private pickupFromStation(player: PlayerState, station: StationState): SimulationEvent {
    const item = station.heldItemId ? this.items.get(station.heldItemId) : null;

    if (!item) {
      this.clearStation(station);
      this.statusMessage = `${station.label} est vide.`;
      return { type: "error", message: this.statusMessage };
    }

    player.heldItem = { itemId: item.id, label: item.label };
    item.location = { type: "held", playerId: player.id };
    station.heldItemId = null;
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 0;
    station.status = "idle";
    this.statusMessage = `${player.name} prend ${item.label}.`;
    return { type: "pickup", message: this.statusMessage };
  }

  private pickupItem(player: PlayerState, item: ItemInstance): SimulationEvent {
    player.heldItem = { itemId: item.id, label: item.label };
    item.location = { type: "held", playerId: player.id };
    this.statusMessage = `${player.name} prend ${item.label}.`;
    return { type: "pickup", message: this.statusMessage };
  }

  private dropHeldItem(player: PlayerState, fallbackType: SimulationEvent["type"]): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} n'a rien à poser.`;
      return { type: "error", message: this.statusMessage };
    }

    item.position = this.getDropPosition(player);
    item.location = { type: "world" };
    player.heldItem = null;
    this.statusMessage = `${player.name} pose ${item.label}.`;
    return { type: fallbackType, message: this.statusMessage };
  }

  private trashHeldItem(player: PlayerState): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} n'a rien à jeter.`;
      return { type: "error", message: this.statusMessage };
    }

    item.location = { type: "discarded" };
    player.heldItem = null;
    this.score.addPenalty(10);
    this.statusMessage = `${player.name} jette ${item.label}.`;
    return { type: "drop", message: this.statusMessage };
  }

  private handleMeow(player: PlayerState): SimulationEvent {
    if (player.meowCooldownSeconds > 0) {
      this.statusMessage = `${player.name} attend encore ${Math.ceil(
        player.meowCooldownSeconds,
      )}s avant un autre miaou.`;
      return { type: "error", message: this.statusMessage };
    }

    player.meowCooldownSeconds = 12;

    for (const teammate of this.players) {
      if (distance(player.position, teammate.position) <= 2.4) {
        teammate.speedBoostSeconds = 4;
      }
    }

    this.statusMessage = `${player.name} miaule. La brigade accélère !`;
    return { type: "meow", message: this.statusMessage };
  }

  private placeHeldItemOnStation(player: PlayerState, station: StationState): void {
    const item = this.getHeldItem(player);

    if (!item) {
      return;
    }

    station.heldItemId = item.id;
    item.position = { ...station.position };
    item.location = { type: "station", stationId: station.id };
    player.heldItem = null;
  }

  private createIngredient(ingredientId: IngredientId, position: Vector2): ItemInstance {
    const definition = itemDefinitions[ingredientId];
    const item: ItemInstance = {
      id: this.createItemId(),
      kind: "ingredient",
      definitionId: ingredientId,
      ingredientId,
      state: "raw",
      contents: [],
      label: definition.name,
      color: definition.color,
      position: { ...position },
      location: { type: "world" },
    };

    this.items.set(item.id, item);

    return item;
  }

  private createPlate(position: Vector2): ItemInstance {
    const definition = itemDefinitions.plate;
    const item: ItemInstance = {
      id: this.createItemId(),
      kind: "plate",
      definitionId: "plate",
      ingredientId: null,
      state: "raw",
      contents: [],
      label: definition.name,
      color: definition.color,
      position: { ...position },
      location: { type: "world" },
    };

    this.items.set(item.id, item);

    return item;
  }

  private createItemId(): string {
    const id = `item-${String(this.nextItemId).padStart(3, "0")}`;
    this.nextItemId += 1;

    return id;
  }

  private getHeldItem(player: PlayerState): ItemInstance | null {
    return player.heldItem ? this.items.get(player.heldItem.itemId) ?? null : null;
  }

  private getDropPosition(player: PlayerState): Vector2 {
    const facing = Math.abs(player.facing.x) + Math.abs(player.facing.y) > 0.01 ? player.facing : { x: 0, y: 1 };
    const side = { x: -facing.y, y: facing.x };
    const candidates: Vector2[] = [
      { x: player.position.x + facing.x * 0.7, y: player.position.y + facing.y * 0.7 },
      { x: player.position.x + facing.x * 0.95, y: player.position.y + facing.y * 0.95 },
      { x: player.position.x + side.x * 0.62, y: player.position.y + side.y * 0.62 },
      { x: player.position.x - side.x * 0.62, y: player.position.y - side.y * 0.62 },
      { x: player.position.x - facing.x * 0.52, y: player.position.y - facing.y * 0.52 },
    ].map((position) => this.clampToBounds(position));

    return candidates.find((position) => this.isDropPositionClear(position)) ?? this.clampToBounds(player.position);
  }

  private clampToBounds(position: Vector2): Vector2 {
    return {
      x: clamp(position.x, this.level.bounds.minX, this.level.bounds.maxX),
      y: clamp(position.y, this.level.bounds.minY, this.level.bounds.maxY),
    };
  }

  private isDropPositionClear(position: Vector2): boolean {
    for (const station of this.stations.getMutableStations()) {
      const minDistance = this.getStationSolidRadius(station) + 0.34;

      if (distanceSquared(position, station.position) < minDistance * minDistance) {
        return false;
      }
    }

    for (const item of this.items.values()) {
      if (item.location.type !== "world") {
        continue;
      }

      if (distanceSquared(position, item.position) < 0.3 * 0.3) {
        return false;
      }
    }

    return true;
  }

  private findNearestStation(player: PlayerState): StationState | null {
    let nearest: StationState | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const station of this.stations.getMutableStations()) {
      const rangeSquared = station.radius * station.radius;
      const currentDistance = distanceSquared(player.position, station.position);

      if (currentDistance <= rangeSquared && currentDistance < nearestDistance) {
        nearest = station;
        nearestDistance = currentDistance;
      }
    }

    return nearest;
  }

  private findNearestWorldItem(position: Vector2): ItemInstance | null {
    let nearest: ItemInstance | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const item of this.items.values()) {
      if (item.location.type !== "world") {
        continue;
      }

      const currentDistance = distanceSquared(position, item.position);

      if (currentDistance <= 0.62 * 0.62 && currentDistance < nearestDistance) {
        nearest = item;
        nearestDistance = currentDistance;
      }
    }

    return nearest;
  }

  private clearStation(station: StationState): void {
    station.heldItemId = null;
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 0;
    station.status = "idle";
  }

  private getItemLabel(item: ItemInstance): string {
    if (item.kind === "dish") {
      return item.contents.length > 0
        ? `Assiette : ${this.recipes.formatSteps(item.contents)}`
        : "Assiette vide";
    }

    if (item.kind === "plate") {
      return "Assiette";
    }

    if (item.ingredientId) {
      return this.formatIngredientLabel(item.ingredientId, item.state);
    }

    return "Objet";
  }

  private formatStep(step: RecipeStep): string {
    return this.recipes.formatSteps([step]);
  }

  private formatIngredientLabel(ingredientId: IngredientId, state: ItemState): string {
    const definition = itemDefinitions[ingredientId];

    if (state === "raw") {
      return definition.name;
    }

    if (ingredientId === "herb" && state === "cut") {
      return "Herbes coupées";
    }

    return `${definition.name} ${itemStateLabels[state]}`;
  }
}
