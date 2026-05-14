import type { StationDefinition, StationState } from "../types";

export class StationSystem {
  private readonly stations: StationState[];

  constructor(stationDefinitions: StationDefinition[]) {
    this.stations = stationDefinitions.map((station) => ({
      ...station,
      progress: 0,
    }));
  }

  getStations(): StationState[] {
    return this.stations.map((station) => ({
      ...station,
      position: { ...station.position },
    }));
  }
}
