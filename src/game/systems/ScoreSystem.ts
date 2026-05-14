import type { OrderState } from "../types";

export class ScoreSystem {
  private score = 0;

  addDelivery(order: OrderState): number {
    const urgencyMultiplier = order.urgent ? 1 : 1.2;
    const timeRatio = order.remainingSeconds / order.maxSeconds;
    const value = Math.round(100 * urgencyMultiplier + timeRatio * 80);

    this.score += value;

    return value;
  }

  getScore(): number {
    return this.score;
  }
}
