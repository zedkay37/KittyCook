import * as THREE from "three";
import type { GameSnapshot, SimulationEvent, Vector2 } from "../../types";
import { basicMaterial, visualTheme } from "./VisualTheme";
import { cone, ring, sphere } from "./meshHelpers";

type VfxKind = "ring" | "spark" | "steam" | "score";

type VfxInstance = {
  id: number;
  kind: VfxKind;
  group: THREE.Group;
  age: number;
  duration: number;
};

export class VFXManager {
  private readonly effects: VfxInstance[] = [];
  private nextId = 1;

  constructor(private readonly scene: THREE.Scene) {}

  enqueue(event: SimulationEvent, snapshot: GameSnapshot): void {
    if (event.type === "meow") {
      for (const player of snapshot.players) {
        if (player.speedBoostSeconds > 0) {
          this.addRing(player.position, visualTheme.vfx.meow, 1.1, 0.72);
        }
      }
    }

    if (event.type === "score") {
      this.addScorePop({ x: 3.2, y: 1.8 });
    }

    if (event.type === "cut") {
      const cutStation = snapshot.stations.find((station) => station.type === "cut");
      if (cutStation) {
        this.addSparks(cutStation.position);
      }
    }

    if (event.type === "cook" || event.type === "burn") {
      const cookStation = snapshot.stations.find((station) => station.type === "cook");
      if (cookStation) {
        this.addSteam(cookStation.position, event.type === "burn");
      }
    }

    if (event.type === "slip") {
      const slippingPlayer = snapshot.players.find((player) => player.slipSeconds > 0);
      if (slippingPlayer) {
        this.addRing(slippingPlayer.position, visualTheme.vfx.milk, 0.7, 0.45);
      }
    }
  }

  update(deltaSeconds: number): void {
    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const effect = this.effects[index];
      effect.age += deltaSeconds;
      const t = Math.min(effect.age / effect.duration, 1);

      effect.group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        const material = child.material;

        if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial) {
          material.opacity = Math.max(0, 1 - t);
          material.transparent = true;
        }
      });

      if (effect.kind === "ring") {
        effect.group.scale.setScalar(1 + t * 1.5);
        effect.group.position.y = 0.08 + t * 0.05;
      } else if (effect.kind === "spark") {
        effect.group.position.y += deltaSeconds * 0.8;
        effect.group.rotation.y += deltaSeconds * 5;
      } else if (effect.kind === "steam") {
        effect.group.position.y += deltaSeconds * 0.45;
        effect.group.scale.setScalar(1 + t * 0.8);
      } else {
        effect.group.position.y += deltaSeconds * 1.1;
      }

      if (effect.age >= effect.duration) {
        this.scene.remove(effect.group);
        this.effects.splice(index, 1);
      }
    }
  }

  private addRing(position: Vector2, color: string, radius: number, duration: number): void {
    const group = new THREE.Group();
    group.add(ring(radius * 0.42, radius, color, [0, 0, 0], 0.78));
    group.position.set(position.x, 0.08, -position.y);
    this.addEffect("ring", group, duration);
  }

  private addSparks(position: Vector2): void {
    const group = new THREE.Group();

    for (let index = 0; index < 8; index += 1) {
      const spark = cone(0.035, 0.16, visualTheme.vfx.spark, [0, 0.05, 0], 5);
      spark.position.x = Math.cos(index) * 0.18;
      spark.position.z = Math.sin(index * 1.7) * 0.18;
      spark.rotation.z = index * 0.7;
      group.add(spark);
    }

    group.position.set(position.x, 0.72, -position.y);
    this.addEffect("spark", group, 0.36);
  }

  private addSteam(position: Vector2, burned: boolean): void {
    const group = new THREE.Group();
    const color = burned ? visualTheme.vfx.smoke : visualTheme.vfx.steam;

    for (let index = 0; index < 4; index += 1) {
      group.add(sphere(0.1 + index * 0.02, color, [index * 0.08 - 0.12, index * 0.06, 0], [1, 0.7, 1]));
    }

    group.position.set(position.x, 0.78, -position.y);
    this.addEffect("steam", group, burned ? 1.2 : 0.8);
  }

  private addScorePop(position: Vector2): void {
    const group = new THREE.Group();
    const star = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18, 0),
      basicMaterial(visualTheme.vfx.score, 0.95),
    );
    group.add(star);
    group.position.set(position.x, 1.1, -position.y);
    this.addEffect("score", group, 0.75);
  }

  private addEffect(kind: VfxKind, group: THREE.Group, duration: number): void {
    this.scene.add(group);
    this.effects.push({
      id: this.nextId,
      kind,
      group,
      age: 0,
      duration,
    });
    this.nextId += 1;
  }
}
