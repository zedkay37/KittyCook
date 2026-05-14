import type { OrderState, RecipeDefinition, SimulationEvent } from "../types";
import { RecipeSystem } from "./RecipeSystem";

export class OrderSystem {
  private readonly orders: OrderState[] = [];
  private orderSequence = 0;

  constructor(private readonly recipes: RecipeSystem) {
    this.reset();
  }

  reset(): void {
    this.orders.length = 0;
    this.orderSequence = 0;
    this.spawnNextOrder();
  }

  tick(deltaSeconds: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    for (const order of this.orders) {
      order.remainingSeconds = Math.max(0, order.remainingSeconds - deltaSeconds);
      order.urgent = order.remainingSeconds <= order.maxSeconds * 0.3;
    }

    if (this.orders[0]?.remainingSeconds === 0) {
      const expired = this.orders.shift();

      if (expired) {
        events.push({
          type: "order",
          message: `${expired.recipeName} timed out. New order incoming.`,
        });
      }

      this.spawnNextOrder();
    }

    return events;
  }

  completeOrder(recipeId: string): OrderState | null {
    const order = this.orders[0];

    if (!order || order.recipeId !== recipeId) {
      return null;
    }

    this.orders.shift();
    this.spawnNextOrder();

    return order;
  }

  getOrders(): OrderState[] {
    return this.orders.map((order) => ({
      ...order,
      recipeSteps: order.recipeSteps.map((step) => ({ ...step })),
    }));
  }

  private spawnNextOrder(): void {
    const recipe = this.recipes.getRecipeByIndex(this.orderSequence);
    this.orderSequence += 1;
    this.orders.push(this.createOrder(recipe, this.orderSequence));
  }

  private createOrder(recipe: RecipeDefinition, sequence: number): OrderState {
    const maxSeconds = 72 + recipe.steps.length * 10;

    return {
      id: `order-${String(sequence).padStart(3, "0")}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeSteps: recipe.steps.map((step) => ({ ...step })),
      maxSeconds,
      remainingSeconds: maxSeconds,
      urgent: false,
    };
  }
}
