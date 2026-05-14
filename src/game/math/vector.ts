import type { Vector2 } from "../types";

export const zeroVector: Vector2 = { x: 0, y: 0 };

export function length(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vector2): Vector2 {
  const vectorLength = length(vector);

  if (vectorLength <= 0.0001) {
    return { ...zeroVector };
  }

  return {
    x: vector.x / vectorLength,
    y: vector.y / vectorLength,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function distanceSquared(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return dx * dx + dy * dy;
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt(distanceSquared(a, b));
}
