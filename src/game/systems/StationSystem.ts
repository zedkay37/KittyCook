import type { StationDefinition, StationState } from "../types";

export class StationSystem {
  private readonly stations: StationState[];

  constructor(stationDefinitions: StationDefinition[]) {
    this.stations = stationDefinitions.map((station) => ({
      ...station,
      progress: 0,
      progressMax: station.processSeconds ?? 0,
      status: "idle",
      heldItemId: null,
    }));
  }

  reset(): void {
    for (const station of this.stations) {
      station.progress = 0;
      station.progressMax = station.processSeconds ?? 0;
      station.status = "idle";
      station.heldItemId = null;
    }
  }

  getMutableStations(): StationState[] {
    return this.stations;
  }

  getStation(id: string): StationState | null {
    return this.stations.find((station) => station.id === id) ?? null;
  }

  getStations(): StationState[] {
    return this.stations.map((station) => ({
      ...station,
      position: { ...station.position },
    }));
  }
}
