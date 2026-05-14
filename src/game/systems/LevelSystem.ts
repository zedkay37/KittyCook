import type { LevelDefinition } from "../types";

export class LevelSystem {
  constructor(private readonly level: LevelDefinition) {}

  getLevel(): LevelDefinition {
    return this.level;
  }
}
