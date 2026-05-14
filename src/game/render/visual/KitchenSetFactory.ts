import * as THREE from "three";
import type { LevelVisualVariant } from "../../types";
import { visualTheme } from "./VisualTheme";
import { box, cylinder, makePawPrint, ring, sphere } from "./meshHelpers";

export function createKitchenSet(variant: LevelVisualVariant): THREE.Group {
  const group = new THREE.Group();
  const palette = visualTheme.variants[variant];

  group.add(createFloor(palette));
  group.add(createCounters(palette));
  group.add(createSign(palette, variant));
  group.add(createSoftProps(palette, variant));
  group.add(createStringLights(palette, variant));
  group.add(createWindows(palette, variant));

  return group;
}

function createFloor(palette: (typeof visualTheme.variants)[LevelVisualVariant]): THREE.Group {
  const group = new THREE.Group();
  group.add(box([10.2, 0.16, 7.4], palette.floor, [0, -0.08, 0]));

  for (let x = -4; x <= 4; x += 1) {
    const seam = box([0.025, 0.02, 7.2], palette.floorDark, [x, 0.015, 0]);
    group.add(seam);
  }

  for (let z = -3; z <= 3; z += 1) {
    const seam = box([9.8, 0.02, 0.025], palette.floorDark, [0, 0.016, z]);
    group.add(seam);
  }

  const rug = box([2.1, 0.035, 1.05], palette.rug, [-2.1, 0.045, -0.8]);
  rug.name = "cushion-rug";
  group.add(rug);

  return group;
}

function createCounters(palette: (typeof visualTheme.variants)[LevelVisualVariant]): THREE.Group {
  const group = new THREE.Group();
  const counters: Array<[number, number, number, number]> = [
    [0, 3.38, 9.8, 0.42],
    [0, -3.38, 9.8, 0.42],
    [-5.08, 0, 0.42, 6.4],
    [5.08, 0, 0.42, 6.4],
  ];

  for (const [x, z, width, depth] of counters) {
    group.add(box([width, 0.42, depth], palette.counter, [x, 0.12, z]));
    group.add(box([width, 0.08, depth], palette.counterTop, [x, 0.37, z]));
  }

  return group;
}

function createSign(
  palette: (typeof visualTheme.variants)[LevelVisualVariant],
  variant: LevelVisualVariant,
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(0, 0.52, 3.08);
  group.add(box([2.2, 0.1, 0.18], palette.glow, [0, 0.35, 0]));
  group.add(box([1.8, 0.08, 0.2], visualTheme.ui3d.cream, [0, 0.52, 0]));

  const leftEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.3, 4),
    new THREE.MeshStandardMaterial({ color: palette.glow }),
  );
  leftEar.position.set(-0.72, 0.7, 0);
  leftEar.rotation.y = Math.PI * 0.25;
  group.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.x = 0.72;
  group.add(rightEar);

  for (let index = 0; index < 5; index += 1) {
    const dot = cylinder(0.04, 0.04, 0.035, visualTheme.ui3d.ink, [-0.48 + index * 0.24, 0.54, 0.12], 12);
    dot.rotation.x = Math.PI / 2;
    group.add(dot);
  }

  if (variant === "moonlit-bakery") {
    const moon = sphere(0.16, palette.glow, [0.92, 0.62, 0.08], [1, 1, 0.28]);
    moon.name = "moon-sign";
    group.add(moon);
  }

  return group;
}

function createSoftProps(
  palette: (typeof visualTheme.variants)[LevelVisualVariant],
  variant: LevelVisualVariant,
): THREE.Group {
  const group = new THREE.Group();
  const pawPositions: Array<[number, number]> = [
    [-3.2, -0.4],
    [-1.5, 0.65],
    [1.25, -1.2],
    [3.05, 0.75],
  ];

  for (const [x, z] of pawPositions) {
    const paw = makePawPrint(variant === "moonlit-bakery" ? "#8996b7" : "#91a5a6");
    paw.position.set(x, 0.065, z);
    paw.rotation.z = x * 0.3;
    group.add(paw);
  }

  const serviceGlow = ring(0.42, 0.62, palette.glow, [3.2, 0.07, -1.8], 0.28);
  group.add(serviceGlow);

  const cushionPositions: Array<[number, number, number]> = [
    [-4.25, 0.36, 2.45],
    [4.2, 0.36, -2.35],
    [2.2, 0.36, 2.65],
  ];

  for (const [x, y, z] of cushionPositions) {
    const cushion = sphere(0.24, palette.rug, [x, y, z], [1.5, 0.35, 1]);
    cushion.name = "soft-cushion";
    group.add(cushion);
  }

  return group;
}

function createStringLights(
  palette: (typeof visualTheme.variants)[LevelVisualVariant],
  variant: LevelVisualVariant,
): THREE.Group {
  const group = new THREE.Group();
  const z = variant === "moonlit-bakery" ? -3.05 : 3.05;

  for (let index = 0; index < 9; index += 1) {
    const x = -3.6 + index * 0.9;
    const cord = box([0.72, 0.025, 0.025], visualTheme.world.trim, [x + 0.35, 0.82, z]);
    group.add(cord);

    const bulb = sphere(0.07, index % 2 === 0 ? palette.glow : palette.accent, [x, 0.72, z], [1, 1.15, 1]);
    bulb.name = "warm-bulb";
    group.add(bulb);
  }

  return group;
}

function createWindows(
  palette: (typeof visualTheme.variants)[LevelVisualVariant],
  variant: LevelVisualVariant,
): THREE.Group {
  const group = new THREE.Group();
  const windowColor = variant === "moonlit-bakery" ? "#243252" : "#294a50";
  const glowColor = variant === "moonlit-bakery" ? "#d9c4ff" : "#ffd98a";

  for (const x of [-2.4, 2.4]) {
    group.add(box([1.15, 0.08, 0.14], palette.counter, [x, 0.76, 3.18]));
    group.add(box([0.92, 0.04, 0.12], windowColor, [x, 0.93, 3.24]));
    group.add(ring(0.2, 0.32, glowColor, [x, 0.98, 3.31], 0.2));
  }

  return group;
}
