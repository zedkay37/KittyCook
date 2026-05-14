import * as THREE from "three";
import type { GameSnapshot, HazardState, ItemInstance, PlayerState, StationState } from "../types";

const stationColors = {
  ingredient: "#5bbbd6",
  plate: "#fff4d6",
  cut: "#6fcf97",
  cook: "#f2994a",
  assemble: "#f2c94c",
  wash: "#56ccf2",
  serve: "#f7c66a",
  trash: "#8f98a3",
} as const;

export class GameRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly playerMeshes = new Map<string, THREE.Group>();
  private readonly stationMeshes = new Map<string, THREE.Group>();
  private readonly itemMeshes = new Map<string, THREE.Group>();
  private readonly hazardMeshes = new Map<string, THREE.Mesh>();

  constructor(private readonly root: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor("#172026");
    this.root.append(this.renderer.domElement);

    const aspect = this.root.clientWidth / Math.max(this.root.clientHeight, 1);
    const viewSize = 7.2;
    this.camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      100,
    );
    this.camera.position.set(6, 7, 6);
    this.camera.lookAt(0, 0, 0);

    this.setupScene();
    this.resize();

    window.addEventListener("resize", () => this.resize());
  }

  update(snapshot: GameSnapshot): void {
    for (const hazard of snapshot.hazards) {
      this.updateHazard(hazard);
    }

    for (const station of snapshot.stations) {
      this.updateStation(station);
    }

    for (const player of snapshot.players) {
      this.updatePlayer(player);
    }

    for (const item of snapshot.items) {
      this.updateItem(item, snapshot);
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color("#172026");

    const ambient = new THREE.HemisphereLight("#fff7d6", "#25313a", 2.3);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(4, 8, 5);
    this.scene.add(key);

    const floorGeometry = new THREE.BoxGeometry(10, 0.18, 7.2);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "#334149",
      roughness: 0.82,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.1;
    this.scene.add(floor);

    const laneGeometry = new THREE.BoxGeometry(8.4, 0.02, 1.1);
    const laneMaterial = new THREE.MeshStandardMaterial({
      color: "#40515a",
      roughness: 0.9,
    });
    const lane = new THREE.Mesh(laneGeometry, laneMaterial);
    lane.position.set(0, 0.02, -1.1);
    this.scene.add(lane);
  }

  private updatePlayer(player: PlayerState): void {
    let group = this.playerMeshes.get(player.id);

    if (!group) {
      group = this.createPlayerMesh(player);
      this.playerMeshes.set(player.id, group);
      this.scene.add(group);
    }

    const boost = player.speedBoostSeconds > 0;
    const slip = player.slipSeconds > 0;
    group.position.set(player.position.x, 0.28, -player.position.y);
    group.rotation.y = Math.atan2(player.facing.x, player.facing.y);
    group.scale.setScalar(boost ? 1.12 : slip ? 0.94 : 1);
  }

  private createPlayerMesh(player: PlayerState): THREE.Group {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.26, 0.34, 6, 12),
      new THREE.MeshStandardMaterial({ color: player.color, roughness: 0.62 }),
    );
    body.position.y = 0.26;
    group.add(body);

    const leftEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.18, 4),
      new THREE.MeshStandardMaterial({ color: player.color, roughness: 0.62 }),
    );
    leftEar.position.set(-0.14, 0.66, 0.02);
    leftEar.rotation.y = Math.PI * 0.25;
    group.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.14;
    group.add(rightEar);

    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: "#fff8df", roughness: 0.55 }),
    );
    hat.position.y = 0.78;
    group.add(hat);

    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.39, 24),
      new THREE.MeshBasicMaterial({ color: player.color, side: THREE.DoubleSide }),
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.01;
    group.add(marker);

    return group;
  }

  private updateStation(station: StationState): void {
    let group = this.stationMeshes.get(station.id);

    if (!group) {
      group = this.createStationMesh(station);
      this.stationMeshes.set(station.id, group);
      this.scene.add(group);
    }

    group.position.set(station.position.x, 0.26, -station.position.y);
    this.updateStationProgress(group, station);
  }

  private createStationMesh(station: StationState): THREE.Group {
    const group = new THREE.Group();
    const color = stationColors[station.type];

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.5, 0.95),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
    );
    base.name = "base";
    group.add(base);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.06, 0.8),
      new THREE.MeshStandardMaterial({ color: "#fff4d6", roughness: 0.5 }),
    );
    top.position.y = 0.29;
    group.add(top);

    if (station.type === "ingredient" || station.type === "plate") {
      const icon = this.createProviderIcon(station);
      icon.position.y = 0.48;
      group.add(icon);
    }

    const barBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.04, 0.08),
      new THREE.MeshBasicMaterial({ color: "#11181f" }),
    );
    barBack.name = "progress-back";
    barBack.position.set(0, 0.74, -0.54);
    group.add(barBack);

    const barFill = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.05, 0.09),
      new THREE.MeshBasicMaterial({ color: "#9ad2cb" }),
    );
    barFill.name = "progress-fill";
    barFill.position.set(0, 0.75, -0.54);
    group.add(barFill);

    return group;
  }

  private updateStationProgress(group: THREE.Group, station: StationState): void {
    const fill = group.getObjectByName("progress-fill");
    const back = group.getObjectByName("progress-back");
    const ratio = station.progressMax > 0 ? station.progress / station.progressMax : 0;
    const visible = station.status === "processing" || station.status === "burning";

    if (fill && back) {
      fill.visible = visible;
      back.visible = visible;
      fill.scale.x = Math.max(0.02, ratio);
      fill.position.x = -0.34 + 0.34 * ratio;

      const material = (fill as THREE.Mesh).material;

      if (material instanceof THREE.MeshBasicMaterial) {
        material.color.set(station.status === "burning" ? "#e86f68" : "#9ad2cb");
      }
    }
  }

  private createProviderIcon(station: StationState): THREE.Object3D {
    if (station.type === "plate") {
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.08, 24),
        new THREE.MeshStandardMaterial({ color: "#fff4d6", roughness: 0.5 }),
      );
    }

    return new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 10),
      new THREE.MeshStandardMaterial({
        color:
          station.provides === "herb"
            ? "#7ac96f"
            : station.provides === "bread"
              ? "#d8a85b"
              : "#5bbbd6",
      }),
    );
  }

  private updateItem(item: ItemInstance, snapshot: GameSnapshot): void {
    let group = this.itemMeshes.get(item.id);
    const visualKey = `${item.kind}-${item.state}-${item.label}-${item.contents.length}`;

    if (group?.userData.visualKey !== visualKey) {
      if (group) {
        this.scene.remove(group);
      }

      group = this.createItemMesh(item);
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

      return player ? new THREE.Vector3(player.position.x, 1.12, -player.position.y) : null;
    }

    if (item.location.type === "station") {
      const station = snapshot.stations.find((candidate) => candidate.id === item.location.stationId);

      return station ? new THREE.Vector3(station.position.x, 0.9, -station.position.y) : null;
    }

    return new THREE.Vector3(item.position.x, 0.24, -item.position.y);
  }

  private createItemMesh(item: ItemInstance): THREE.Group {
    const group = new THREE.Group();

    if (item.kind === "plate") {
      group.add(this.createPlateMesh("#fff4d6"));
      return group;
    }

    if (item.kind === "dish") {
      group.add(this.createPlateMesh("#fff4d6"));

      item.contents.forEach((step, index) => {
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 8),
          new THREE.MeshStandardMaterial({
            color: step.ingredient === "fish" ? "#5bbbd6" : step.ingredient === "bread" ? "#d8a85b" : "#7ac96f",
            roughness: 0.62,
          }),
        );
        bead.position.set(-0.12 + index * 0.12, 0.11, 0);
        group.add(bead);
      });

      return group;
    }

    const material = new THREE.MeshStandardMaterial({
      color: item.state === "burned" ? "#171717" : item.color,
      roughness: 0.68,
    });
    const mesh =
      item.ingredientId === "bread"
        ? new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.28), material)
        : item.ingredientId === "herb"
          ? new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 6), material)
          : new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), material);

    mesh.position.y = 0.08;
    group.add(mesh);

    if (item.state === "cut") {
      const cutLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.03, 0.04),
        new THREE.MeshBasicMaterial({ color: "#fff4d6" }),
      );
      cutLine.position.y = 0.23;
      group.add(cutLine);
    }

    if (item.state === "cooked" || item.state === "burned") {
      const steam = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.012, 6, 18),
        new THREE.MeshBasicMaterial({ color: item.state === "burned" ? "#5b5b5b" : "#fff4d6" }),
      );
      steam.position.y = 0.32;
      steam.rotation.x = Math.PI / 2;
      group.add(steam);
    }

    return group;
  }

  private createPlateMesh(color: string): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.06, 28),
      new THREE.MeshStandardMaterial({ color, roughness: 0.48 }),
    );
  }

  private updateHazard(hazard: HazardState): void {
    let mesh = this.hazardMeshes.get(hazard.id);

    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(hazard.radius, hazard.radius, 0.025, 36),
        new THREE.MeshBasicMaterial({
          color: "#d7fff6",
          transparent: true,
          opacity: 0.54,
          depthWrite: false,
        }),
      );
      mesh.rotation.x = 0;
      this.hazardMeshes.set(hazard.id, mesh);
      this.scene.add(mesh);
    }

    mesh.visible = hazard.active;
    mesh.position.set(hazard.position.x, 0.035, -hazard.position.y);
  }

  private resize(): void {
    const width = Math.max(this.root.clientWidth, 1);
    const height = Math.max(this.root.clientHeight, 1);
    const aspect = width / height;
    const viewSize = 7.2;

    this.camera.left = (-viewSize * aspect) / 2;
    this.camera.right = (viewSize * aspect) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
