import type { IngredientId, ItemInstance, RecipeDefinition, RecipeStep } from "../types";

const ingredientNames: Record<IngredientId, string> = {
  fish: "fish",
  bread: "bread",
  herb: "herb",
};

export class RecipeSystem {
  private readonly recipes = new Map<string, RecipeDefinition>();
  private readonly recipeOrder: RecipeDefinition[];

  constructor(recipeDefinitions: RecipeDefinition[]) {
    this.recipeOrder = recipeDefinitions;

    for (const recipe of recipeDefinitions) {
      this.recipes.set(recipe.id, recipe);
    }
  }

  getRecipe(id: string): RecipeDefinition | null {
    return this.recipes.get(id) ?? null;
  }

  getFirstRecipe(): RecipeDefinition {
    const recipe = this.recipeOrder[0];

    if (!recipe) {
      throw new Error("RecipeSystem needs at least one recipe.");
    }

    return recipe;
  }

  getRecipes(): RecipeDefinition[] {
    return this.recipeOrder.map((recipe) => ({
      ...recipe,
      steps: recipe.steps.map((step) => ({ ...step })),
    }));
  }

  getRecipeByIndex(index: number): RecipeDefinition {
    const recipe = this.recipeOrder[index % this.recipeOrder.length];

    if (!recipe) {
      throw new Error("RecipeSystem needs at least one recipe.");
    }

    return recipe;
  }

  matchesRecipe(recipeId: string, item: ItemInstance): boolean {
    const recipe = this.getRecipe(recipeId);

    if (!recipe || item.state === "burned") {
      return false;
    }

    const itemSteps = this.getItemSteps(item);

    if (itemSteps.length !== recipe.steps.length) {
      return false;
    }

    return recipe.steps.every((requiredStep) =>
      itemSteps.some(
        (itemStep) =>
          itemStep.ingredient === requiredStep.ingredient && itemStep.state === requiredStep.state,
      ),
    );
  }

  getItemSteps(item: ItemInstance): RecipeStep[] {
    if (item.kind === "ingredient" && item.ingredientId) {
      return [{ ingredient: item.ingredientId, state: item.state }];
    }

    return item.contents.map((step) => ({ ...step }));
  }

  formatSteps(steps: RecipeStep[]): string {
    return steps.map((step) => `${step.state} ${ingredientNames[step.ingredient]}`).join(" + ");
  }
}
