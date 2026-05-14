import * as THREE from "three";
import type { ItemInstance, RecipeStep } from "../../types";
import { visualTheme } from "./VisualTheme";
import { box, cone, cylinder, ring, sphere } from "./meshHelpers";

export function createItemModel(item: ItemInstance): THREE.Group {
  const group = new THREE.Group();

  if (item.kind === "plate") {
    group.add(createPlate());
    return group;
  }

  if (item.kind === "dish") {
    group.add(createPlate());
    item.contents.forEach((step, index) => addDishComponent(group, step, index));
    return group;
  }

  if (item.ingredientId === "bread") {
    group.add(createBread(item.state === "burned"));
  } else if (item.ingredientId === "herb") {
    group.add(createHerb(item.state === "burned"));
  } else {
    group.add(createFish(item.state));
  }

  if (item.state === "cut") {
    const cutMark = box([0.42, 0.035, 0.045], visualTheme.ui3d.cream, [0, 0.26, 0.01]);
    cutMark.name = "cut-mark";
    cutMark.rotation.y = -0.4;
    group.add(cutMark);
  }

  if (item.state === "cooked" || item.state === "burned") {
    const steam = ring(0.1, 0.13, item.state === "burned" ? visualTheme.vfx.smoke : visualTheme.vfx.steam, [
      0,
      0.42,
      0,
    ], 0.8);
    steam.name = "item-steam-ring";
    steam.rotation.x = Math.PI / 2;
    group.add(steam);
  }

  return group;
}

function createPlate(): THREE.Group {
  const group = new THREE.Group();
  group.add(cylinder(0.32, 0.33, 0.065, visualTheme.ui3d.cream, [0, 0.02, 0], 32));
  group.add(ring(0.19, 0.28, "#d8e0d9", [0, 0.065, 0], 0.85));
  return group;
}

function createFish(state: ItemInstance["state"]): THREE.Group {
  const group = new THREE.Group();
  const color = state === "burned" ? visualTheme.ingredients.burned : state === "cooked" ? "#e8a45f" : visualTheme.ingredients.fish;
  const body = sphere(0.2, color, [0, 0.14, 0], [1.45, 0.68, 0.82]);
  body.name = "fish-body";
  group.add(body);

  const tail = cone(0.13, 0.2, color, [-0.32, 0.14, 0], 3);
  tail.name = "fish-tail";
  tail.rotation.z = Math.PI / 2;
  group.add(tail);

  const eye = sphere(0.025, visualTheme.ui3d.ink, [0.23, 0.2, 0.12], [1, 1, 0.5]);
  eye.name = "fish-eye";
  group.add(eye);
  return group;
}

function createBread(burned: boolean): THREE.Group {
  const group = new THREE.Group();
  group.add(box([0.42, 0.18, 0.3], burned ? visualTheme.ingredients.burned : visualTheme.ingredients.bread, [0, 0.12, 0]));
  const crust = box([0.46, 0.05, 0.34], burned ? "#0e0d0c" : "#a96f37", [0, 0.23, 0]);
  crust.name = "bread-crust";
  group.add(crust);
  return group;
}

function createHerb(burned: boolean): THREE.Group {
  const group = new THREE.Group();
  const color = burned ? visualTheme.ingredients.burned : visualTheme.ingredients.herb;

  for (let index = 0; index < 4; index += 1) {
    const leaf = sphere(0.09, color, [0, 0.15 + index * 0.025, 0], [0.55, 0.28, 1.3]);
    leaf.rotation.y = (Math.PI / 4) * index;
    group.add(leaf);
  }

  return group;
}

function addDishComponent(group: THREE.Group, step: RecipeStep, index: number): void {
  const x = -0.16 + index * 0.16;

  if (step.ingredient === "fish") {
    const fish = createFish(step.state);
    fish.scale.setScalar(0.48);
    fish.position.set(x, 0.12, 0);
    group.add(fish);
  } else if (step.ingredient === "bread") {
    const bread = createBread(false);
    bread.scale.setScalar(0.55);
    bread.position.set(x, 0.09, 0);
    group.add(bread);
  } else {
    const herb = createHerb(false);
    herb.scale.setScalar(0.55);
    herb.position.set(x, 0.12, 0);
    group.add(herb);
  }
}
