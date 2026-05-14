import * as THREE from "three";
import { basicMaterial, standardMaterial, visualTheme } from "./VisualTheme";

export function box(
  size: [number, number, number],
  color: string,
  position: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), standardMaterial(color));
  mesh.position.set(...position);
  return mesh;
}

export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  color: string,
  position: [number, number, number] = [0, 0, 0],
  segments = 24,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    standardMaterial(color),
  );
  mesh.position.set(...position);
  return mesh;
}

export function sphere(
  radius: number,
  color: string,
  position: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), standardMaterial(color));
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return mesh;
}

export function cone(
  radius: number,
  height: number,
  color: string,
  position: [number, number, number] = [0, 0, 0],
  segments = 16,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, segments), standardMaterial(color));
  mesh.position.set(...position);
  return mesh;
}

export function ring(
  inner: number,
  outer: number,
  color: string,
  position: [number, number, number] = [0, 0, 0],
  opacity = 1,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 36),
    basicMaterial(color, opacity),
  );
  mesh.position.set(...position);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function makeGroundShadow(radius = 0.42): THREE.Mesh {
  return ring(radius * 0.1, radius, visualTheme.world.shadow, [0, 0.012, 0], 0.22);
}

export function makePawPrint(color: string = visualTheme.ui3d.cream): THREE.Group {
  const group = new THREE.Group();
  group.add(sphere(0.075, color, [0, 0.01, 0], [1.1, 0.18, 0.9]));

  const toes: Array<[number, number]> = [
    [-0.1, -0.08],
    [-0.035, -0.13],
    [0.035, -0.13],
    [0.1, -0.08],
  ];

  for (const [x, z] of toes) {
    group.add(sphere(0.035, color, [x, 0.025, z], [1, 0.2, 1]));
  }

  return group;
}

export function makeTail(color: string): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.18, 0.1, 0.18),
    new THREE.Vector3(-0.08, 0.26, 0.34),
    new THREE.Vector3(0.12, 0.34, 0.26),
  ]);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.035, 8), standardMaterial(color));
}

export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry.dispose();

    if (Array.isArray(child.material)) {
      for (const material of child.material) {
        material.dispose();
      }
    } else {
      child.material.dispose();
    }
  });
}
