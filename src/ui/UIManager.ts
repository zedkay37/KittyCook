import type { GameSnapshot, IngredientId, ItemState, RecipeStep } from "../game/types";

const ingredientNames: Record<IngredientId, string> = {
  fish: "fish",
  bread: "bread",
  herb: "herb",
};

const stateNames: Record<ItemState, string> = {
  raw: "raw",
  cut: "cut",
  cooked: "cooked",
  burned: "burned",
  dirty: "dirty",
  plated: "plated",
};

export class UIManager {
  private readonly levelName: HTMLElement;
  private readonly activeOrder: HTMLElement;
  private readonly scoreValue: HTMLElement;
  private readonly roundTimer: HTMLElement;
  private readonly meowStatus: HTMLElement;
  private readonly statusMessage: HTMLElement;

  constructor(documentRef: Document) {
    this.levelName = this.requireElement(documentRef, "#level-name");
    this.activeOrder = this.requireElement(documentRef, "#active-order");
    this.scoreValue = this.requireElement(documentRef, "#score-value");
    this.roundTimer = this.requireElement(documentRef, "#round-timer");
    this.meowStatus = this.requireElement(documentRef, "#meow-status");
    this.statusMessage = this.requireElement(documentRef, "#status-message");
  }

  update(snapshot: GameSnapshot): void {
    const order = snapshot.orders[0];
    const firstPlayer = snapshot.players[0];
    const heldSummary = snapshot.players.map((player) => player.heldItem?.label ?? "empty").join(" / ");

    this.levelName.textContent = snapshot.levelName;
    this.activeOrder.textContent = order
      ? `${order.recipeName}: ${this.formatSteps(order.recipeSteps)} - ${Math.ceil(
          order.remainingSeconds,
        )}s`
      : "Service complete";
    this.scoreValue.textContent = String(snapshot.score);
    this.roundTimer.textContent =
      snapshot.roundState === "finished" ? "Done" : this.formatTimer(snapshot.roundRemainingSeconds);
    this.meowStatus.textContent =
      firstPlayer && firstPlayer.meowCooldownSeconds > 0
        ? `${Math.ceil(firstPlayer.meowCooldownSeconds)}s`
        : "Ready";
    this.statusMessage.textContent = this.formatStatus(snapshot, heldSummary);
  }

  private formatStatus(snapshot: GameSnapshot, heldSummary: string): string {
    if (snapshot.roundState === "finished") {
      return `Service done. Final score ${snapshot.score}. Press R to replay.`;
    }

    return `${snapshot.statusMessage} Paws: ${heldSummary}`;
  }

  private formatSteps(steps: RecipeStep[]): string {
    return steps
      .map((step) => `${stateNames[step.state]} ${ingredientNames[step.ingredient]}`)
      .join(" + ");
  }

  private formatTimer(seconds: number): string {
    const wholeSeconds = Math.ceil(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = wholeSeconds % 60;

    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  }

  private requireElement(documentRef: Document, selector: string): HTMLElement {
    const element = documentRef.querySelector<HTMLElement>(selector);

    if (!element) {
      throw new Error(`Missing HUD element: ${selector}`);
    }

    return element;
  }
}
