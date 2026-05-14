import type {
  GameSnapshot,
  LevelDefinition,
  PlayerInputState,
  PlayerState,
  RecipeDefinition,
  SimulationEvent,
  StationState,
} from "../types";
import { clamp, distanceSquared, normalize } from "../math/vector";
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

export class GameSimulation {
  private readonly level: LevelDefinition;
  private readonly recipes: RecipeSystem;
  private readonly orders: OrderSystem;
  private readonly stations: StationSystem;
  private readonly score = new ScoreSystem();
  private readonly players: PlayerState[];

  private elapsedSeconds = 0;
  private statusMessage = "Move with WASD or a gamepad";

  constructor(options: GameSimulationOptions) {
    this.level = options.level;
    this.recipes = new RecipeSystem(options.recipes);
    this.orders = new OrderSystem(this.recipes);
    this.stations = new StationSystem(options.level.stations);

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
        heldItemId: null,
        lastInteraction: null,
      };
    });
  }

  getPlayerSlots(): number[] {
    return this.players.map((player) => player.slot);
  }

  tick(deltaSeconds: number, inputs: Map<number, PlayerInputState>): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    this.elapsedSeconds += deltaSeconds;
    this.orders.tick(deltaSeconds);

    for (const player of this.players) {
      const input = inputs.get(player.slot);

      if (!input) {
        continue;
      }

      this.movePlayer(player, input, deltaSeconds);

      if (input.interactPressed) {
        events.push(this.handleInteraction(player));
      }

      if (input.meowPressed) {
        this.statusMessage = `${player.name} motivates the brigade with a meow.`;
        events.push({ type: "meow", message: this.statusMessage });
      }
    }

    return events;
  }

  getSnapshot(): GameSnapshot {
    return {
      elapsedSeconds: this.elapsedSeconds,
      levelName: this.level.name,
      players: this.players.map((player) => ({ ...player, position: { ...player.position } })),
      stations: this.stations.getStations(),
      orders: this.orders.getOrders(),
      score: this.score.getScore(),
      statusMessage: this.statusMessage,
    };
  }

  private movePlayer(player: PlayerState, input: PlayerInputState, deltaSeconds: number): void {
    const speed = input.dashPressed ? 5.2 : 3.6;
    const movement = normalize(input.move);

    player.velocity = {
      x: movement.x * speed,
      y: movement.y * speed,
    };

    if (Math.abs(movement.x) + Math.abs(movement.y) > 0.01) {
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

  private handleInteraction(player: PlayerState): SimulationEvent {
    const nearestStation = this.findNearestStation(player);

    if (!nearestStation) {
      this.statusMessage = `${player.name} pawed at empty air.`;
      return { type: "error", message: this.statusMessage };
    }

    player.lastInteraction = nearestStation.id;

    if (nearestStation.type === "serve") {
      const order = this.orders.completeFirstOrder();

      if (order) {
        const value = this.score.addDelivery(order);
        this.statusMessage = `${player.name} served ${order.recipeName} for ${value} points.`;
        return { type: "score", message: this.statusMessage };
      }
    }

    this.statusMessage = `${player.name} used ${nearestStation.label}.`;
    return { type: "interact", message: this.statusMessage };
  }

  private findNearestStation(player: PlayerState): StationState | null {
    let nearest: StationState | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const station of this.stations.getStations()) {
      const rangeSquared = station.radius * station.radius;
      const currentDistance = distanceSquared(player.position, station.position);

      if (currentDistance <= rangeSquared && currentDistance < nearestDistance) {
        nearest = station;
        nearestDistance = currentDistance;
      }
    }

    return nearest;
  }
}
