import type { OrderState, RecipeDefinition } from "../types";

export class ScoreSystem {
  private score = 0;

  reset(): void {
    this.score = 0;
  }

  addDelivery(order: OrderState, recipe: RecipeDefinition): number {
    const urgencyMultiplier = order.urgent ? 1 : 1.2;
    const timeRatio = order.remainingSeconds / order.maxSeconds;
    const value = Math.round(recipe.scoreValue * urgencyMultiplier + timeRatio * 80);

    this.score += value;

    return value;
  }

  addPenalty(value: number): number {
    this.score = Math.max(0, this.score - value);

    return this.score;
  }

  getScore(): number {
    return this.score;
  }
}
