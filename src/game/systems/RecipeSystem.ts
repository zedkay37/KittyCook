import type { RecipeDefinition } from "../types";

export class RecipeSystem {
  private readonly recipes = new Map<string, RecipeDefinition>();

  constructor(recipeDefinitions: RecipeDefinition[]) {
    for (const recipe of recipeDefinitions) {
      this.recipes.set(recipe.id, recipe);
    }
  }

  getRecipe(id: string): RecipeDefinition | null {
    return this.recipes.get(id) ?? null;
  }

  getFirstRecipe(): RecipeDefinition {
    const recipe = this.recipes.values().next().value;

    if (!recipe) {
      throw new Error("RecipeSystem needs at least one recipe.");
    }

    return recipe;
  }
}
