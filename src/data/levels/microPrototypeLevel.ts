import type { LevelDefinition } from "../../game/types";

export const microPrototypeLevel: LevelDefinition = {
  id: "micro-prototype-kitchen",
  name: "Cushion Counter",
  bounds: {
    minX: -4.5,
    maxX: 4.5,
    minY: -3.2,
    maxY: 3.2,
  },
  playerSpawns: [
    { x: -1.2, y: -1.4 },
    { x: 1.2, y: -1.4 },
    { x: -1.2, y: 1.2 },
    { x: 1.2, y: 1.2 },
  ],
  stations: [
    {
      id: "cut-01",
      type: "cut",
      label: "Cut",
      position: { x: -3.2, y: 1.8 },
      radius: 0.85,
    },
    {
      id: "cook-01",
      type: "cook",
      label: "Cook",
      position: { x: 0, y: 2 },
      radius: 0.85,
    },
    {
      id: "serve-01",
      type: "serve",
      label: "Serve",
      position: { x: 3.2, y: 1.8 },
      radius: 0.85,
    },
    {
      id: "trash-01",
      type: "trash",
      label: "Trash",
      position: { x: 3.4, y: -2.1 },
      radius: 0.7,
    },
  ],
};
