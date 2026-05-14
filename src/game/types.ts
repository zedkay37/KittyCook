export type Vector2 = {
  x: number;
  y: number;
};

export type ItemState = "raw" | "cut" | "cooked" | "burned" | "dirty" | "served";

export type StationType = "cut" | "cook" | "assemble" | "wash" | "serve" | "trash";

export type SimulationEventType = "interact" | "meow" | "score" | "error";

export type SimulationEvent = {
  type: SimulationEventType;
  message: string;
};

export type PlayerInputState = {
  move: Vector2;
  interactPressed: boolean;
  cancelPressed: boolean;
  dashPressed: boolean;
  meowPressed: boolean;
};

export type PlayerState = {
  id: string;
  slot: number;
  name: string;
  color: string;
  position: Vector2;
  velocity: Vector2;
  facing: Vector2;
  heldItemId: string | null;
  lastInteraction: string | null;
};

export type StationDefinition = {
  id: string;
  type: StationType;
  label: string;
  position: Vector2;
  radius: number;
};

export type StationState = StationDefinition & {
  progress: number;
};

export type RecipeStep = {
  ingredient: string;
  state: ItemState;
};

export type RecipeDefinition = {
  id: string;
  name: string;
  scoreValue: number;
  steps: RecipeStep[];
};

export type OrderState = {
  id: string;
  recipeId: string;
  recipeName: string;
  remainingSeconds: number;
  maxSeconds: number;
  urgent: boolean;
};

export type LevelBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type LevelDefinition = {
  id: string;
  name: string;
  bounds: LevelBounds;
  playerSpawns: Vector2[];
  stations: StationDefinition[];
};

export type GameSnapshot = {
  elapsedSeconds: number;
  levelName: string;
  players: PlayerState[];
  stations: StationState[];
  orders: OrderState[];
  score: number;
  statusMessage: string;
};
