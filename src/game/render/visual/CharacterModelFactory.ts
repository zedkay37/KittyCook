import * as THREE from "three";
import type { PlayerState } from "../../types";
import { visualTheme } from "./VisualTheme";
import { box, cone, cylinder, makeGroundShadow, makeTail, sphere } from "./meshHelpers";

export function createCharacterModel(player: PlayerState): THREE.Group {
  const group = new THREE.Group();
  group.userData.baseScale = 1;

  const shadow = makeGroundShadow(0.52);
  shadow.name = "shadow";
  group.add(shadow);

  const body = sphere(0.34, player.color, [0, 0.42, 0], [0.88, 1.12, 0.78]);
  body.name = "body";
  group.add(body);

  const belly = sphere(0.2, visualTheme.ui3d.cream, [0, 0.39, 0.24], [0.86, 0.9, 0.36]);
  belly.name = "belly";
  group.add(belly);

  const head = sphere(0.28, player.color, [0, 0.86, 0.02], [1.08, 0.94, 0.95]);
  head.name = "head";
  group.add(head);

  const leftEar = cone(0.12, 0.24, player.color, [-0.17, 1.08, 0.01], 4);
  leftEar.name = "left-ear";
  leftEar.rotation.y = Math.PI * 0.25;
  leftEar.rotation.z = 0.12;
  group.add(leftEar);

  const rightEar = cone(0.12, 0.24, player.color, [0.17, 1.08, 0.01], 4);
  rightEar.name = "right-ear";
  rightEar.rotation.y = Math.PI * 0.25;
  rightEar.rotation.z = -0.12;
  group.add(rightEar);

  const hat = cylinder(0.18, 0.24, 0.18, visualTheme.ui3d.cream, [0, 1.17, 0.01], 18);
  hat.name = "chef-hat";
  group.add(hat);

  const hatPuff = sphere(0.14, visualTheme.ui3d.cream, [0, 1.29, 0.01], [1.25, 0.68, 1.05]);
  hatPuff.name = "chef-hat-puff";
  group.add(hatPuff);

  const apron = box([0.34, 0.28, 0.04], "#ffffff", [0, 0.42, 0.34]);
  apron.name = "apron";
  group.add(apron);

  const leftEye = sphere(0.035, visualTheme.ui3d.ink, [-0.09, 0.9, 0.265], [1, 1.2, 0.55]);
  leftEye.name = "left-eye";
  const rightEye = sphere(0.035, visualTheme.ui3d.ink, [0.09, 0.9, 0.265], [1, 1.2, 0.55]);
  rightEye.name = "right-eye";
  group.add(leftEye, rightEye);

  const nose = sphere(0.028, visualTheme.ui3d.danger, [0, 0.82, 0.29], [1, 0.8, 0.5]);
  nose.name = "nose";
  group.add(nose);

  const leftPaw = sphere(0.075, player.color, [-0.22, 0.2, 0.18], [0.8, 0.48, 1.1]);
  leftPaw.name = "left-paw";
  const rightPaw = sphere(0.075, player.color, [0.22, 0.2, 0.18], [0.8, 0.48, 1.1]);
  rightPaw.name = "right-paw";
  group.add(leftPaw, rightPaw);

  const tail = makeTail(player.color);
  tail.name = "tail";
  tail.position.set(-0.22, 0.35, -0.24);
  tail.rotation.y = -0.55;
  group.add(tail);

  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.47, 32),
    new THREE.MeshBasicMaterial({
      color: player.color,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  marker.name = "player-marker";
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.02;
  group.add(marker);

  return group;
}

export function animateCharacterModel(group: THREE.Group, player: PlayerState, elapsedSeconds: number): void {
  const body = group.getObjectByName("body");
  const head = group.getObjectByName("head");
  const tail = group.getObjectByName("tail");
  const leftPaw = group.getObjectByName("left-paw");
  const rightPaw = group.getObjectByName("right-paw");
  const moving = Math.abs(player.velocity.x) + Math.abs(player.velocity.y) > 0.2;
  const wobble = Math.sin(elapsedSeconds * (moving ? 12 : 3) + player.slot) * (moving ? 0.045 : 0.018);

  if (body) {
    body.position.y = 0.42 + Math.abs(wobble) * 0.8;
  }

  if (head) {
    head.rotation.z = player.slipSeconds > 0 ? Math.sin(elapsedSeconds * 18) * 0.16 : wobble;
  }

  if (tail) {
    tail.rotation.z = Math.sin(elapsedSeconds * (moving ? 9 : 4) + player.slot) * 0.18;
  }

  if (leftPaw && rightPaw) {
    leftPaw.position.y = 0.2 + Math.max(0, wobble);
    rightPaw.position.y = 0.2 + Math.max(0, -wobble);
  }
}
