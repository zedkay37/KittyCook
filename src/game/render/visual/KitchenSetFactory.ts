import * as THREE from "three";
import { visualTheme } from "./VisualTheme";
import { box, cylinder, makePawPrint, ring } from "./meshHelpers";

export function createKitchenSet(): THREE.Group {
  const group = new THREE.Group();

  group.add(createFloor());
  group.add(createCounters());
  group.add(createSign());
  group.add(createSoftProps());

  return group;
}

function createFloor(): THREE.Group {
  const group = new THREE.Group();
  group.add(box([10.2, 0.16, 7.4], visualTheme.world.floor, [0, -0.08, 0]));

  for (let x = -4; x <= 4; x += 1) {
    const seam = box([0.025, 0.02, 7.2], visualTheme.world.floorDark, [x, 0.015, 0]);
    group.add(seam);
  }

  for (let z = -3; z <= 3; z += 1) {
    const seam = box([9.8, 0.02, 0.025], visualTheme.world.floorDark, [0, 0.016, z]);
    group.add(seam);
  }

  const rug = box([2.1, 0.035, 1.05], visualTheme.world.cushion, [-2.1, 0.045, -0.8]);
  rug.name = "cushion-rug";
  group.add(rug);

  return group;
}

function createCounters(): THREE.Group {
  const group = new THREE.Group();
  const counters: Array<[number, number, number, number]> = [
    [0, 3.38, 9.8, 0.42],
    [0, -3.38, 9.8, 0.42],
    [-5.08, 0, 0.42, 6.4],
    [5.08, 0, 0.42, 6.4],
  ];

  for (const [x, z, width, depth] of counters) {
    group.add(box([width, 0.42, depth], visualTheme.world.counter, [x, 0.12, z]));
    group.add(box([width, 0.08, depth], visualTheme.world.counterTop, [x, 0.37, z]));
  }

  return group;
}

function createSign(): THREE.Group {
  const group = new THREE.Group();
  group.position.set(0, 0.52, 3.08);
  group.add(box([2.2, 0.1, 0.18], visualTheme.ui3d.warning, [0, 0.35, 0]));
  group.add(box([1.8, 0.08, 0.2], visualTheme.ui3d.cream, [0, 0.52, 0]));

  const leftEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.3, 4),
    new THREE.MeshStandardMaterial({ color: visualTheme.ui3d.warning }),
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

  return group;
}

function createSoftProps(): THREE.Group {
  const group = new THREE.Group();
  const pawPositions: Array<[number, number]> = [
    [-3.2, -0.4],
    [-1.5, 0.65],
    [1.25, -1.2],
    [3.05, 0.75],
  ];

  for (const [x, z] of pawPositions) {
    const paw = makePawPrint("#91a5a6");
    paw.position.set(x, 0.065, z);
    paw.rotation.z = x * 0.3;
    group.add(paw);
  }

  const serviceGlow = ring(0.42, 0.62, visualTheme.ui3d.warning, [3.2, 0.07, -1.8], 0.24);
  group.add(serviceGlow);

  return group;
}
