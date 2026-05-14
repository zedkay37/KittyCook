import type { OrderState } from "../types";
import { RecipeSystem } from "./RecipeSystem";

export class OrderSystem {
  private readonly orders: OrderState[];

  constructor(recipes: RecipeSystem) {
    const firstRecipe = recipes.getFirstRecipe();

    this.orders = [
      {
        id: "order-001",
        recipeId: firstRecipe.id,
        recipeName: firstRecipe.name,
        maxSeconds: 90,
        remainingSeconds: 90,
        urgent: false,
      },
    ];
  }

  tick(deltaSeconds: number): void {
    for (const order of this.orders) {
      order.remainingSeconds = Math.max(0, order.remainingSeconds - deltaSeconds);
      order.urgent = order.remainingSeconds <= order.maxSeconds * 0.3;
    }
  }

  completeFirstOrder(): OrderState | null {
    const order = this.orders.shift();

    return order ?? null;
  }

  getOrders(): OrderState[] {
    return this.orders.map((order) => ({ ...order }));
  }
}
