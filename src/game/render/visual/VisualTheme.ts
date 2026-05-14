import * as THREE from "three";
import type { LevelVisualVariant, StationType } from "../../types";

export const visualTheme = {
  world: {
    background: "#162027",
    floor: "#40505a",
    floorDark: "#2c3941",
    counter: "#6e5642",
    counterTop: "#f1c981",
    cushion: "#e86f68",
    trim: "#27343c",
    shadow: "#101820",
  },
  ui3d: {
    cream: "#fff4d6",
    ink: "#172026",
    teal: "#9ad2cb",
    danger: "#e86f68",
    success: "#a7d676",
    warning: "#f7c66a",
  },
  stations: {
    ingredient: "#5bbbd6",
    plate: "#fff4d6",
    cut: "#6fcf97",
    cook: "#f2994a",
    assemble: "#f2c94c",
    wash: "#56ccf2",
    serve: "#f7c66a",
    trash: "#8f98a3",
  } satisfies Record<StationType, string>,
  ingredients: {
    fish: "#5bbbd6",
    bread: "#d8a85b",
    herb: "#7ac96f",
    burned: "#1b1715",
  },
  vfx: {
    milk: "#d7fff6",
    steam: "#f8f4de",
    smoke: "#4e5157",
    spark: "#ffe58a",
    meow: "#9ad2cb",
    score: "#a7d676",
  },
  variants: {
    "cushion-counter": {
      background: "#162027",
      floor: "#40505a",
      floorDark: "#2c3941",
      counter: "#6e5642",
      counterTop: "#f1c981",
      rug: "#e86f68",
      glow: "#f7c66a",
      accent: "#9ad2cb",
    },
    "moonlit-bakery": {
      background: "#151b2a",
      floor: "#3b4656",
      floorDark: "#252d3a",
      counter: "#5f4c58",
      counterTop: "#e4c4a0",
      rug: "#8f79b8",
      glow: "#d9c4ff",
      accent: "#ffd6a4",
    },
  } satisfies Record<
    LevelVisualVariant,
    {
      background: string;
      floor: string;
      floorDark: string;
      counter: string;
      counterTop: string;
      rug: string;
      glow: string;
      accent: string;
    }
  >,
} as const;

export function standardMaterial(color: string, roughness = 0.7): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  });
}

export function basicMaterial(color: string, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
  });
}
