import * as THREE from "three";
import type { StationState } from "../../types";
import { visualTheme } from "./VisualTheme";
import { box, cone, cylinder, ring, sphere } from "./meshHelpers";

export function createStationModel(station: StationState): THREE.Group {
  const group = new THREE.Group();
  const color = visualTheme.stations[station.type];

  if (station.type === "ingredient") {
    buildIngredientCrate(group, station, color);
  } else if (station.type === "plate") {
    buildPlateStack(group);
  } else if (station.type === "cut") {
    buildCutStation(group);
  } else if (station.type === "cook") {
    buildCookStation(group);
  } else if (station.type === "assemble") {
    buildAssemblyStation(group);
  } else if (station.type === "serve") {
    buildServeStation(group);
  } else if (station.type === "trash") {
    buildTrashStation(group);
  } else {
    group.add(box([0.95, 0.5, 0.95], color, [0, 0, 0]));
  }

  addProgressBar(group);
  addStationHalo(group, color);

  return group;
}

export function updateStationModel(group: THREE.Group, station: StationState): void {
  const fill = group.getObjectByName("progress-fill");
  const back = group.getObjectByName("progress-back");
  const flame = group.getObjectByName("station-flame");
  const ratio = station.progressMax > 0 ? station.progress / station.progressMax : 0;
  const visible = station.status === "processing" || station.status === "burning";

  if (fill && back) {
    fill.visible = visible;
    back.visible = visible;
    fill.scale.x = Math.max(0.03, ratio);
    fill.position.x = -0.39 + 0.39 * ratio;

    const material = (fill as THREE.Mesh).material;

    if (material instanceof THREE.MeshBasicMaterial) {
      material.color.set(station.status === "burning" ? visualTheme.ui3d.danger : visualTheme.ui3d.teal);
    }
  }

  if (flame) {
    flame.visible = station.status === "processing" || station.status === "burning";
    flame.scale.setScalar(station.status === "burning" ? 1.25 : 0.9);
  }
}

function buildIngredientCrate(group: THREE.Group, station: StationState, color: string): void {
  group.add(box([0.98, 0.46, 0.78], "#7a5a40", [0, 0.02, 0]));
  group.add(box([1.08, 0.08, 0.88], color, [0, 0.28, 0]));
  group.add(box([1.08, 0.08, 0.08], visualTheme.ui3d.cream, [0, 0.48, 0.36]));
  group.add(box([1.08, 0.08, 0.08], visualTheme.ui3d.cream, [0, 0.48, -0.36]));

  const icon =
    station.provides === "bread"
      ? box([0.38, 0.16, 0.28], visualTheme.ingredients.bread, [0, 0.58, 0])
      : station.provides === "herb"
        ? cone(0.2, 0.36, visualTheme.ingredients.herb, [0, 0.62, 0], 7)
        : sphere(0.22, visualTheme.ingredients.fish, [0, 0.58, 0], [1.35, 0.62, 0.82]);

  icon.name = "station-icon";
  group.add(icon);
}

function buildPlateStack(group: THREE.Group): void {
  group.add(box([0.9, 0.42, 0.74], "#6e5642", [0, 0, 0]));

  for (let index = 0; index < 5; index += 1) {
    group.add(cylinder(0.31, 0.31, 0.045, visualTheme.ui3d.cream, [0, 0.29 + index * 0.055, 0], 28));
  }
}

function buildCutStation(group: THREE.Group): void {
  group.add(box([1.05, 0.5, 0.86], "#6e5642", [0, 0, 0]));
  group.add(box([0.82, 0.08, 0.55], "#e9bd76", [0, 0.31, 0]));
  const knife = box([0.44, 0.035, 0.08], "#dfe8e8", [0.12, 0.39, 0.02]);
  knife.rotation.y = -0.45;
  group.add(knife);
}

function buildCookStation(group: THREE.Group): void {
  group.add(box([1.02, 0.58, 0.92], "#4a4e55", [0, 0.04, 0]));
  group.add(box([0.88, 0.08, 0.78], visualTheme.stations.cook, [0, 0.37, 0]));
  group.add(ring(0.17, 0.24, visualTheme.ui3d.ink, [0, 0.43, 0], 0.9));
  const pan = cylinder(0.32, 0.28, 0.08, "#22282d", [0, 0.49, 0], 28);
  pan.name = "pan";
  group.add(pan);
  const flame = cone(0.13, 0.26, visualTheme.ui3d.danger, [0, 0.67, 0], 9);
  flame.name = "station-flame";
  flame.visible = false;
  group.add(flame);
}

function buildAssemblyStation(group: THREE.Group): void {
  group.add(box([1.12, 0.46, 0.92], "#6e5642", [0, 0, 0]));
  group.add(box([0.96, 0.08, 0.76], visualTheme.stations.assemble, [0, 0.31, 0]));
  group.add(ring(0.22, 0.29, visualTheme.ui3d.cream, [0, 0.38, 0], 0.95));
}

function buildServeStation(group: THREE.Group): void {
  group.add(box([1.16, 0.58, 0.82], "#75583e", [0, 0.06, 0]));
  group.add(box([1.26, 0.1, 0.92], visualTheme.stations.serve, [0, 0.4, 0]));
  group.add(cylinder(0.13, 0.16, 0.1, visualTheme.ui3d.cream, [0, 0.57, 0], 22));
  group.add(sphere(0.06, visualTheme.ui3d.warning, [0, 0.66, 0]));
}

function buildTrashStation(group: THREE.Group): void {
  group.add(cylinder(0.34, 0.28, 0.62, "#66707a", [0, 0.12, 0], 8));
  group.add(cylinder(0.38, 0.38, 0.08, visualTheme.stations.trash, [0, 0.48, 0], 8));
  group.add(box([0.38, 0.08, 0.04], visualTheme.ui3d.ink, [0, 0.66, 0]));
}

function addProgressBar(group: THREE.Group): void {
  const barBack = box([0.82, 0.055, 0.09], visualTheme.ui3d.ink, [0, 0.86, -0.58]);
  barBack.name = "progress-back";
  barBack.visible = false;
  group.add(barBack);

  const barFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.065, 0.1),
    new THREE.MeshBasicMaterial({ color: visualTheme.ui3d.teal }),
  );
  barFill.name = "progress-fill";
  barFill.position.set(0, 0.875, -0.58);
  barFill.visible = false;
  group.add(barFill);
}

function addStationHalo(group: THREE.Group, color: string): void {
  const halo = ring(0.48, 0.55, color, [0, 0.025, 0], 0.34);
  halo.name = "station-halo";
  group.add(halo);
}
