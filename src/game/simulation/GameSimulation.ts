import type {
  GameSnapshot,
  HazardState,
  IngredientId,
  ItemInstance,
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
  fish: { name: "Fish", color: "#5bbbd6" },
  bread: { name: "Bread", color: "#d8a85b" },
  herb: { name: "Herb", color: "#7ac96f" },
  plate: { name: "Plate", color: "#fff4d6" },
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
  private statusMessage = "Grab ingredients, prep them, assemble plates, then serve.";
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
      return [{ type: "reset", message: "Kitchen reset. New service!" }];
    }

    if (this.roundState === "finished") {
      return events;
    }

    this.elapsedSeconds += deltaSeconds;
    this.roundRemainingSeconds = Math.max(0, this.roundRemainingSeconds - deltaSeconds);

    if (this.roundRemainingSeconds === 0) {
      this.roundState = "finished";
      this.statusMessage = "Service finished. Press R to replay.";
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
      levelName: this.level.name,
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
    this.statusMessage = "Kitchen reset. Grab ingredients and serve fast.";
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
    }
  }

  private movePlayer(player: PlayerState, input: PlayerInputState, deltaSeconds: number): void {
    const movement = normalize(input.move);
    const boosted = player.speedBoostSeconds > 0;
    const baseSpeed = input.dashPressed ? 5.2 : 3.6;
    const speed = boosted ? baseSpeed * 1.28 : baseSpeed;
    const controlledVelocity = {
      x: movement.x * speed,
      y: movement.y * speed,
    };

    if (player.slipSeconds > 0) {
      player.velocity = {
        x: player.slipVelocity.x * 4.8 + controlledVelocity.x * 0.25,
        y: player.slipVelocity.y * 4.8 + controlledVelocity.y * 0.25,
      };
    } else {
      player.velocity = controlledVelocity;
    }

    if (Math.abs(movement.x) + Math.abs(movement.y) > 0.01 && player.slipSeconds === 0) {
      player.facing = movement;
    }

    player.position.x = clamp(
      player.position.x + player.velocity.x * deltaSeconds,
      this.level.bounds.minX,
      this.level.bounds.maxX,
    );
    player.position.y = clamp(
      player.position.y + player.velocity.y * deltaSeconds,
      this.level.bounds.minY,
      this.level.bounds.maxY,
    );
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

        player.slipSeconds = 0.75;
        player.slipCooldownSeconds = 1.2;
        player.slipVelocity = normalize(
          Math.abs(player.velocity.x) + Math.abs(player.velocity.y) > 0.1
            ? player.velocity
            : player.facing,
        );
        this.statusMessage = `${player.name} skids through spilled milk.`;
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
            this.statusMessage = `${item.label} is cut.`;
            events.push({ type: "cut", message: this.statusMessage });
          }

          if (station.type === "cook") {
            item.state = "cooked";
            item.label = this.getItemLabel(item);
            station.status = "burning";
            station.progress = 0;
            station.progressMax = station.burnAfterSeconds ?? 4;
            this.statusMessage = `${item.label} is cooked. Grab it before it burns!`;
            events.push({ type: "cook", message: this.statusMessage });
          }
        }
      } else if (station.status === "burning") {
        station.progress = Math.min(station.progressMax, station.progress + deltaSeconds);

        if (station.progress >= station.progressMax) {
          item.state = "burned";
          item.label = this.getItemLabel(item);
          station.status = "burned";
          this.statusMessage = `${item.label} burned. Trash it fast.`;
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

    this.statusMessage = `${player.name} pawed at empty air.`;
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

    this.statusMessage = `${station.label} needs something to work with.`;
    return { type: "error", message: this.statusMessage };
  }

  private useStationWithHeldItem(player: PlayerState, station: StationState): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} is not holding anything.`;
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

    this.statusMessage = `${player.name} cannot use ${item.label} at ${station.label}.`;
    return { type: "error", message: this.statusMessage };
  }

  private startCutting(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (station.heldItemId || station.status === "processing") {
      this.statusMessage = `${station.label} is busy.`;
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || item.state !== "raw" || item.ingredientId === "bread") {
      this.statusMessage = `${item.label} does not need cutting here.`;
      return { type: "error", message: this.statusMessage };
    }

    this.placeHeldItemOnStation(player, station);
    station.status = "processing";
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 2.2;
    this.statusMessage = `${player.name} starts cutting ${item.label}.`;
    return { type: "cut", message: this.statusMessage };
  }

  private startCooking(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (station.heldItemId || station.status === "processing" || station.status === "burning") {
      this.statusMessage = `${station.label} is busy.`;
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || item.state === "burned" || item.ingredientId !== "fish") {
      this.statusMessage = `${item.label} cannot be cooked here.`;
      return { type: "error", message: this.statusMessage };
    }

    this.placeHeldItemOnStation(player, station);
    station.status = "processing";
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 4.2;
    this.statusMessage = `${player.name} starts cooking ${item.label}.`;
    return { type: "cook", message: this.statusMessage };
  }

  private useAssembly(player: PlayerState, station: StationState, item: ItemInstance): SimulationEvent {
    if (!station.heldItemId && (item.kind === "plate" || item.kind === "dish")) {
      this.placeHeldItemOnStation(player, station);
      station.status = "ready";
      this.statusMessage = `${player.name} sets ${item.label} on assembly.`;
      return { type: "drop", message: this.statusMessage };
    }

    if (!station.heldItemId) {
      this.statusMessage = "Assembly needs a plate first.";
      return { type: "error", message: this.statusMessage };
    }

    const plate = this.items.get(station.heldItemId);

    if (!plate || (plate.kind !== "plate" && plate.kind !== "dish")) {
      this.statusMessage = "Assembly is blocked by the wrong item.";
      return { type: "error", message: this.statusMessage };
    }

    if (item.kind !== "ingredient" || !item.ingredientId || item.state === "burned") {
      this.statusMessage = `${item.label} cannot go on a plate.`;
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
    this.statusMessage = `${player.name} adds ${this.formatStep({
      ingredient: item.ingredientId,
      state: item.state,
    })}.`;
    return { type: "interact", message: this.statusMessage };
  }

  private tryServe(player: PlayerState, item: ItemInstance): SimulationEvent {
    const activeOrder = this.orders.getOrders()[0];

    if (!activeOrder) {
      this.statusMessage = "No order is waiting.";
      return { type: "error", message: this.statusMessage };
    }

    if (!this.recipes.matchesRecipe(activeOrder.recipeId, item)) {
      this.statusMessage = `${item.label} does not match ${activeOrder.recipeName}.`;
      return { type: "error", message: this.statusMessage };
    }

    const recipe = this.recipes.getRecipe(activeOrder.recipeId);
    const completed = this.orders.completeOrder(activeOrder.recipeId);

    if (!recipe || !completed) {
      this.statusMessage = "The order changed before service.";
      return { type: "error", message: this.statusMessage };
    }

    const value = this.score.addDelivery(completed, recipe);
    item.location = { type: "served" };
    player.heldItem = null;
    this.statusMessage = `${player.name} served ${completed.recipeName} for ${value} points.`;
    return { type: "score", message: this.statusMessage };
  }

  private pickupFromStation(player: PlayerState, station: StationState): SimulationEvent {
    const item = station.heldItemId ? this.items.get(station.heldItemId) : null;

    if (!item) {
      this.clearStation(station);
      this.statusMessage = `${station.label} is empty.`;
      return { type: "error", message: this.statusMessage };
    }

    player.heldItem = { itemId: item.id, label: item.label };
    item.location = { type: "held", playerId: player.id };
    station.heldItemId = null;
    station.progress = 0;
    station.progressMax = station.processSeconds ?? 0;
    station.status = "idle";
    this.statusMessage = `${player.name} picks up ${item.label}.`;
    return { type: "pickup", message: this.statusMessage };
  }

  private pickupItem(player: PlayerState, item: ItemInstance): SimulationEvent {
    player.heldItem = { itemId: item.id, label: item.label };
    item.location = { type: "held", playerId: player.id };
    this.statusMessage = `${player.name} picks up ${item.label}.`;
    return { type: "pickup", message: this.statusMessage };
  }

  private dropHeldItem(player: PlayerState, fallbackType: SimulationEvent["type"]): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} has nothing to drop.`;
      return { type: "error", message: this.statusMessage };
    }

    item.position = this.getDropPosition(player);
    item.location = { type: "world" };
    player.heldItem = null;
    this.statusMessage = `${player.name} drops ${item.label}.`;
    return { type: fallbackType, message: this.statusMessage };
  }

  private trashHeldItem(player: PlayerState): SimulationEvent {
    const item = this.getHeldItem(player);

    if (!item) {
      this.statusMessage = `${player.name} has nothing to trash.`;
      return { type: "error", message: this.statusMessage };
    }

    item.location = { type: "discarded" };
    player.heldItem = null;
    this.score.addPenalty(10);
    this.statusMessage = `${player.name} trashes ${item.label}.`;
    return { type: "drop", message: this.statusMessage };
  }

  private handleMeow(player: PlayerState): SimulationEvent {
    if (player.meowCooldownSeconds > 0) {
      this.statusMessage = `${player.name} needs ${Math.ceil(
        player.meowCooldownSeconds,
      )}s before another meow.`;
      return { type: "error", message: this.statusMessage };
    }

    player.meowCooldownSeconds = 12;

    for (const teammate of this.players) {
      if (distance(player.position, teammate.position) <= 2.4) {
        teammate.speedBoostSeconds = 4;
      }
    }

    this.statusMessage = `${player.name} meows. The brigade speeds up!`;
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
    return {
      x: clamp(player.position.x + player.facing.x * 0.58, this.level.bounds.minX, this.level.bounds.maxX),
      y: clamp(player.position.y + player.facing.y * 0.58, this.level.bounds.minY, this.level.bounds.maxY),
    };
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
        ? `Plate: ${this.recipes.formatSteps(item.contents)}`
        : "Empty Plate";
    }

    if (item.kind === "plate") {
      return "Plate";
    }

    if (item.ingredientId) {
      const definition = itemDefinitions[item.ingredientId];
      return `${item.state === "raw" ? "" : `${item.state} `}${definition.name}`.trim();
    }

    return "Item";
  }

  private formatStep(step: RecipeStep): string {
    return this.recipes.formatSteps([step]);
  }
}
