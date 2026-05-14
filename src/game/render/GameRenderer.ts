import * as THREE from "three";
import type {
  GameSnapshot,
  HazardState,
  ItemInstance,
  LevelVisualVariant,
  PlayerState,
  SimulationEvent,
  StationState,
} from "../types";
import { animateCharacterModel, createCharacterModel } from "./visual/CharacterModelFactory";
import { createItemModel } from "./visual/ItemModelFactory";
import { createKitchenSet } from "./visual/KitchenSetFactory";
import { createStationModel, updateStationModel } from "./visual/StationModelFactory";
import { basicMaterial, visualTheme } from "./visual/VisualTheme";
import { disposeObject, ring, sphere } from "./visual/meshHelpers";
import { VFXManager } from "./visual/VFXManager";

export class GameRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly vfx: VFXManager;
  private readonly playerMeshes = new Map<string, THREE.Group>();
  private readonly stationMeshes = new Map<string, THREE.Group>();
  private readonly itemMeshes = new Map<string, THREE.Group>();
  private readonly hazardMeshes = new Map<string, THREE.Group>();
  private readonly moteGroup = new THREE.Group();
  private kitchenSet: THREE.Group | null = null;
  private currentVariant: LevelVisualVariant | null = null;

  private lastRenderTime = performance.now();
  private latestSnapshot: GameSnapshot | null = null;

  constructor(private readonly root: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(visualTheme.world.background);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.root.append(this.renderer.domElement);

    const aspect = this.root.clientWidth / Math.max(this.root.clientHeight, 1);
    const viewSize = 7.8;
    this.camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      100,
    );
    this.camera.position.set(6.4, 7.2, 6.4);
    this.camera.lookAt(0, 0, 0);

    this.vfx = new VFXManager(this.scene);
    this.moteGroup.name = "cozy-motes";
    this.setupScene();
    this.resize();

    window.addEventListener("resize", () => this.resize());
  }

  update(snapshot: GameSnapshot): void {
    this.latestSnapshot = snapshot;
    this.ensureKitchenSet(snapshot.levelVisualVariant);
    this.syncSceneMaps(snapshot);

    for (const hazard of snapshot.hazards) {
      this.updateHazard(hazard);
    }

    for (const station of snapshot.stations) {
      this.updateStation(station);
    }

    for (const player of snapshot.players) {
      this.updatePlayer(player, snapshot.elapsedSeconds);
    }

    for (const item of snapshot.items) {
      this.updateItem(item, snapshot);
    }
  }

  playEvents(events: SimulationEvent[], snapshot: GameSnapshot): void {
    for (const event of events) {
      this.vfx.enqueue(event, snapshot);
    }
  }

  render(): void {
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastRenderTime) / 1000, 0.05);
    this.lastRenderTime = now;
    this.animateScene(deltaSeconds);
    this.vfx.update(deltaSeconds);
    this.renderer.render(this.scene, this.camera);
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(visualTheme.world.background);
    this.scene.fog = new THREE.Fog(visualTheme.world.background, 10, 21);

    const ambient = new THREE.HemisphereLight("#fff7d6", "#22303a", 2.15);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight("#ffffff", 2.65);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight("#9ad2cb", 0.8);
    fill.position.set(-4, 4, -5);
    this.scene.add(fill);
    this.createCozyMotes();

    this.ensureKitchenSet("cushion-counter");
  }

  private animateScene(deltaSeconds: number): void {
    const snapshot = this.latestSnapshot;

    if (!snapshot) {
      return;
    }

    for (const [id, group] of this.hazardMeshes) {
      const hazard = snapshot.hazards.find((candidate) => candidate.id === id);
      const shimmer = Math.sin(snapshot.elapsedSeconds * 4 + id.length) * 0.08;

      if (hazard) {
        group.scale.setScalar(1 + shimmer);
      }
    }

    for (const [id, group] of this.itemMeshes) {
      const item = snapshot.items.find((candidate) => candidate.id === id);

      if (item?.location.type === "held") {
        group.rotation.y += deltaSeconds * 2.2;
      }
    }

    this.moteGroup.children.forEach((mote, index) => {
      mote.position.y = 0.45 + ((snapshot.elapsedSeconds * 0.08 + index * 0.17) % 1.6);
      mote.position.x += Math.sin(snapshot.elapsedSeconds * 0.7 + index) * deltaSeconds * 0.025;
      mote.rotation.y += deltaSeconds * 0.4;
    });
  }

  private ensureKitchenSet(variant: LevelVisualVariant): void {
    if (this.currentVariant === variant && this.kitchenSet) {
      return;
    }

    if (this.kitchenSet) {
      this.scene.remove(this.kitchenSet);
      disposeObject(this.kitchenSet);
    }

    this.currentVariant = variant;
    this.kitchenSet = createKitchenSet(variant);
    this.kitchenSet.name = "kitchen-set";
    this.scene.add(this.kitchenSet);
    const palette = visualTheme.variants[variant];
    this.renderer.setClearColor(palette.background);
    this.scene.background = new THREE.Color(palette.background);
    this.scene.fog = new THREE.Fog(palette.background, 10, 21);
  }

  private createCozyMotes(): void {
    for (let index = 0; index < 32; index += 1) {
      const mote = sphere(0.018 + (index % 3) * 0.006, index % 2 === 0 ? "#ffe2a3" : "#b7fff3", [
        -4.2 + (index % 8) * 1.2,
        0.45 + (index % 5) * 0.26,
        -2.8 + Math.floor(index / 8) * 1.8,
      ]);
      mote.name = "cozy-mote";
      const material = mote.material;

      if (material instanceof THREE.MeshStandardMaterial) {
        material.transparent = true;
        material.opacity = 0.26;
        material.depthWrite = false;
      }

      this.moteGroup.add(mote);
    }

    this.scene.add(this.moteGroup);
  }

  private syncSceneMaps(snapshot: GameSnapshot): void {
    this.removeStale(this.playerMeshes, new Set(snapshot.players.map((player) => player.id)));
    this.removeStale(this.stationMeshes, new Set(snapshot.stations.map((station) => station.id)));
    this.removeStale(this.itemMeshes, new Set(snapshot.items.map((item) => item.id)));
    this.removeStale(this.hazardMeshes, new Set(snapshot.hazards.map((hazard) => hazard.id)));
  }

  private removeStale(meshes: Map<string, THREE.Group>, liveIds: Set<string>): void {
    for (const [id, group] of meshes) {
      if (liveIds.has(id)) {
        continue;
      }

      this.scene.remove(group);
      disposeObject(group);
      meshes.delete(id);
    }
  }

  private updatePlayer(player: PlayerState, elapsedSeconds: number): void {
    let group = this.playerMeshes.get(player.id);

    if (!group) {
      group = createCharacterModel(player);
      this.playerMeshes.set(player.id, group);
      this.scene.add(group);
    }

    const boost = player.speedBoostSeconds > 0;
    const slip = player.slipSeconds > 0;
    group.position.set(player.position.x, 0.1, -player.position.y);
    group.rotation.y = Math.atan2(player.facing.x, player.facing.y);
    group.scale.setScalar(boost ? 1.12 : slip ? 0.96 : 1);
    animateCharacterModel(group, player, elapsedSeconds);
  }

  private updateStation(station: StationState): void {
    let group = this.stationMeshes.get(station.id);

    if (!group) {
      group = createStationModel(station);
      this.stationMeshes.set(station.id, group);
      this.scene.add(group);
    }

    group.position.set(station.position.x, 0.24, -station.position.y);
    updateStationModel(group, station);
  }

  private updateItem(item: ItemInstance, snapshot: GameSnapshot): void {
    let group = this.itemMeshes.get(item.id);
    const visualKey = `${item.kind}-${item.state}-${item.label}-${item.contents
      .map((step) => `${step.ingredient}-${step.state}`)
      .join("|")}`;

    if (group?.userData.visualKey !== visualKey) {
      if (group) {
        this.scene.remove(group);
        disposeObject(group);
      }

      group = createItemModel(item);
      group.userData.visualKey = visualKey;
      this.itemMeshes.set(item.id, group);
      this.scene.add(group);
    }

    const position = this.resolveItemPosition(item, snapshot);
    group.visible = Boolean(position);

    if (position) {
      group.position.copy(position);
    }
  }

  private resolveItemPosition(item: ItemInstance, snapshot: GameSnapshot): THREE.Vector3 | null {
    if (item.location.type === "discarded" || item.location.type === "served") {
      return null;
    }

    if (item.location.type === "held") {
      const player = snapshot.players.find((candidate) => candidate.id === item.location.playerId);

      return player ? new THREE.Vector3(player.position.x, 1.55, -player.position.y) : null;
    }

    if (item.location.type === "station") {
      const station = snapshot.stations.find((candidate) => candidate.id === item.location.stationId);

      return station ? new THREE.Vector3(station.position.x, 1.03, -station.position.y) : null;
    }

    return new THREE.Vector3(item.position.x, 0.18, -item.position.y);
  }

  private updateHazard(hazard: HazardState): void {
    let group = this.hazardMeshes.get(hazard.id);

    if (!group) {
      group = this.createHazardModel(hazard);
      this.hazardMeshes.set(hazard.id, group);
      this.scene.add(group);
    }

    group.visible = hazard.active;
    group.position.set(hazard.position.x, 0.075, -hazard.position.y);
  }

  private createHazardModel(hazard: HazardState): THREE.Group {
    const group = new THREE.Group();
    const puddle = new THREE.Mesh(
      new THREE.CylinderGeometry(hazard.radius, hazard.radius * 0.86, 0.025, 36),
      basicMaterial(visualTheme.vfx.milk, 0.48),
    );
    puddle.name = "milk-puddle";
    group.add(puddle);

    const shine = ring(hazard.radius * 0.18, hazard.radius * 0.32, "#ffffff", [0.16, 0.02, -0.1], 0.56);
    shine.name = "milk-shine";
    group.add(shine);

    for (let index = 0; index < 5; index += 1) {
      const splash = sphere(0.055, visualTheme.vfx.milk, [
        Math.cos(index * 1.3) * hazard.radius * 0.55,
        0.035,
        Math.sin(index * 1.3) * hazard.radius * 0.42,
      ]);
      splash.name = "milk-drop";
      group.add(splash);
    }

    return group;
  }

  private resize(): void {
    const width = Math.max(this.root.clientWidth, 1);
    const height = Math.max(this.root.clientHeight, 1);
    const aspect = width / height;
    const viewSize = 7.8;

    this.camera.left = (-viewSize * aspect) / 2;
    this.camera.right = (viewSize * aspect) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
