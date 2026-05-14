import type { LevelDefinition } from "../../game/types";
import { microPrototypeLevel } from "./microPrototypeLevel";
import { moonlitBakeryLevel } from "./moonlitBakeryLevel";

export type LevelOption = {
  id: string;
  name: string;
  description: string;
  mood: string;
  level: LevelDefinition;
};

export const levelOptions: LevelOption[] = [
  {
    id: microPrototypeLevel.id,
    name: microPrototypeLevel.name,
    description: microPrototypeLevel.description,
    mood: "Chaos de café cosy",
    level: microPrototypeLevel,
  },
  {
    id: moonlitBakeryLevel.id,
    name: moonlitBakeryLevel.name,
    description: moonlitBakeryLevel.description,
    mood: "Service de nuit tout doux",
    level: moonlitBakeryLevel,
  },
];

export function getLevelOption(levelId: string): LevelOption {
  return levelOptions.find((option) => option.id === levelId) ?? levelOptions[0];
}
