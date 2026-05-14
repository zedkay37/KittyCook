import type { RecipeDefinition } from "../game/types";

export const recipes: RecipeDefinition[] = [
  {
    id: "sardine-toast",
    name: "Tartine de sardine",
    scoreValue: 120,
    steps: [
      { ingredient: "fish", state: "cut" },
      { ingredient: "bread", state: "raw" },
    ],
  },
  {
    id: "grilled-fish",
    name: "Poisson grillé",
    scoreValue: 150,
    steps: [{ ingredient: "fish", state: "cooked" }],
  },
  {
    id: "purring-soup",
    name: "Soupe ronron",
    scoreValue: 180,
    steps: [
      { ingredient: "fish", state: "cooked" },
      { ingredient: "herb", state: "cut" },
    ],
  },
];
