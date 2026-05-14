import type { GameSnapshot, IngredientId, ItemState, RecipeStep } from "../game/types";

const ingredientNames: Record<IngredientId, string> = {
  fish: "poisson",
  bread: "pain",
  herb: "herbes",
};

const stateNames: Record<ItemState, string> = {
  raw: "",
  cut: "coupé",
  cooked: "cuit",
  burned: "brûlé",
  dirty: "sale",
  plated: "dressé",
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
    const heldSummary = snapshot.players.map((player) => player.heldItem?.label ?? "rien").join(" / ");

    this.levelName.textContent = snapshot.levelName;
    this.activeOrder.textContent = order
      ? `${order.recipeName}: ${this.formatSteps(order.recipeSteps)} - ${Math.ceil(
          order.remainingSeconds,
        )}s`
      : "Service terminé";
    this.scoreValue.textContent = String(snapshot.score);
    this.roundTimer.textContent =
      snapshot.roundState === "finished" ? "Fini" : this.formatTimer(snapshot.roundRemainingSeconds);
    this.meowStatus.textContent =
      firstPlayer && firstPlayer.meowCooldownSeconds > 0
        ? `${Math.ceil(firstPlayer.meowCooldownSeconds)}s`
        : "Prêt";
    this.statusMessage.textContent = this.formatStatus(snapshot, heldSummary);
  }

  private formatStatus(snapshot: GameSnapshot, heldSummary: string): string {
    if (snapshot.roundState === "finished") {
      return `Service terminé. Score final ${snapshot.score}. Appuie sur R pour rejouer.`;
    }

    return `${snapshot.statusMessage} Pattes : ${heldSummary}`;
  }

  private formatSteps(steps: RecipeStep[]): string {
    return steps
      .map((step) => this.formatStep(step))
      .join(" + ");
  }

  private formatStep(step: RecipeStep): string {
    if (step.state === "raw") {
      return ingredientNames[step.ingredient];
    }

    if (step.ingredient === "herb" && step.state === "cut") {
      return "herbes coupées";
    }

    return `${ingredientNames[step.ingredient]} ${stateNames[step.state]}`;
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
      throw new Error(`Élément HUD introuvable : ${selector}`);
    }

    return element;
  }
}
