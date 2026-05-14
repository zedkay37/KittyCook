import type { RecipeDefinition } from "../game/types";

export const recipes: RecipeDefinition[] = [
  {
    id: "sardine-toast",
    name: "Sardine Toast",
    scoreValue: 120,
    steps: [
      { ingredient: "fish", state: "cut" },
      { ingredient: "bread", state: "raw" },
    ],
  },
  {
    id: "grilled-fish",
    name: "Grilled Fish",
    scoreValue: 150,
    steps: [{ ingredient: "fish", state: "cooked" }],
  },
  {
    id: "purring-soup",
    name: "Purring Soup",
    scoreValue: 180,
    steps: [
      { ingredient: "fish", state: "cooked" },
      { ingredient: "herb", state: "cut" },
    ],
  },
];
