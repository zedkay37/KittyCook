export type Vector2 = {
  x: number;
  y: number;
};

export type IngredientId = "fish" | "bread" | "herb";

export type ItemState = "raw" | "cut" | "cooked" | "burned" | "dirty" | "plated";

export type ItemKind = "ingredient" | "plate" | "dish";

export type ItemLocationType = "world" | "held" | "station" | "discarded" | "served";

export type StationType =
  | "ingredient"
  | "plate"
  | "cut"
  | "cook"
  | "assemble"
  | "wash"
  | "serve"
  | "trash";

export type StationStatus = "idle" | "processing" | "ready" | "burning" | "burned";

export type RoundState = "playing" | "finished";

export type LevelVisualVariant = "cushion-counter" | "moonlit-bakery";

export type SimulationEventType =
  | "pickup"
  | "drop"
  | "interact"
  | "meow"
  | "score"
  | "error"
  | "cook"
  | "cut"
  | "burn"
  | "slip"
  | "order"
  | "reset";

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
  resetPressed: boolean;
};

export type HeldItem = {
  itemId: string;
  label: string;
};

export type PlayerState = {
  id: string;
  slot: number;
  name: string;
  color: string;
  position: Vector2;
  velocity: Vector2;
  facing: Vector2;
  heldItem: HeldItem | null;
  lastInteraction: string | null;
  slipSeconds: number;
  slipCooldownSeconds: number;
  slipVelocity: Vector2;
  speedBoostSeconds: number;
  meowCooldownSeconds: number;
};

export type StationDefinition = {
  id: string;
  type: StationType;
  label: string;
  position: Vector2;
  radius: number;
  solidRadius?: number;
  provides?: IngredientId | "plate";
  processSeconds?: number;
  burnAfterSeconds?: number;
};

export type StationState = StationDefinition & {
  progress: number;
  progressMax: number;
  status: StationStatus;
  heldItemId: string | null;
};

export type RecipeStep = {
  ingredient: IngredientId;
  state: ItemState;
};

export type RecipeDefinition = {
  id: string;
  name: string;
  scoreValue: number;
  steps: RecipeStep[];
};

export type ItemDefinition = {
  id: IngredientId | "plate";
  kind: "ingredient" | "plate";
  name: string;
  color: string;
};

export type ItemLocation = {
  type: ItemLocationType;
  playerId?: string;
  stationId?: string;
};

export type ItemInstance = {
  id: string;
  kind: ItemKind;
  definitionId: IngredientId | "plate" | "dish";
  ingredientId: IngredientId | null;
  state: ItemState;
  contents: RecipeStep[];
  label: string;
  color: string;
  position: Vector2;
  location: ItemLocation;
};

export type OrderState = {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeSteps: RecipeStep[];
  remainingSeconds: number;
  maxSeconds: number;
  urgent: boolean;
};

export type HazardState = {
  id: string;
  type: "milk-puddle";
  label: string;
  position: Vector2;
  radius: number;
  active: boolean;
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
  description: string;
  visualVariant: LevelVisualVariant;
  bounds: LevelBounds;
  playerSpawns: Vector2[];
  stations: StationDefinition[];
  hazards: HazardState[];
  roundDurationSeconds: number;
};

export type GameSnapshot = {
  elapsedSeconds: number;
  levelId: string;
  levelName: string;
  levelDescription: string;
  levelVisualVariant: LevelVisualVariant;
  roundState: RoundState;
  roundRemainingSeconds: number;
  players: PlayerState[];
  stations: StationState[];
  items: ItemInstance[];
  hazards: HazardState[];
  orders: OrderState[];
  score: number;
  statusMessage: string;
};
