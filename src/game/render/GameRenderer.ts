import * as THREE from "three";
import type { GameSnapshot, PlayerState, StationState } from "../types";

const stationColors = {
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
    for (const station of snapshot.stations) {
      this.updateStation(station);
    }

    for (const player of snapshot.players) {
      this.updatePlayer(player);
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

    group.position.set(player.position.x, 0.28, -player.position.y);
    group.rotation.y = Math.atan2(player.facing.x, player.facing.y);
  }

  private createPlayerMesh(player: PlayerState): THREE.Group {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.26, 0.34, 6, 12),
      new THREE.MeshStandardMaterial({ color: player.color, roughness: 0.62 }),
    );
    body.position.y = 0.26;
    group.add(body);

    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: "#fff8df", roughness: 0.55 }),
    );
    hat.position.y = 0.74;
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
  }

  private createStationMesh(station: StationState): THREE.Group {
    const group = new THREE.Group();
    const color = stationColors[station.type];

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.5, 0.95),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
    );
    group.add(base);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.06, 0.8),
      new THREE.MeshStandardMaterial({ color: "#fff4d6", roughness: 0.5 }),
    );
    top.position.y = 0.29;
    group.add(top);

    return group;
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
