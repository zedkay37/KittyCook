import type { SimulationEvent } from "../types";

export class AudioManager {
  private readonly context: AudioContext | null;

  constructor() {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
    this.context = AudioContextConstructor ? new AudioContextConstructor() : null;
  }

  playEvents(events: SimulationEvent[]): void {
    for (const event of events) {
      this.playCue(event.type);
    }
  }

  private playCue(type: SimulationEvent["type"]): void {
    if (!this.context) {
      return;
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    const frequencies: Record<SimulationEvent["type"], number> = {
      pickup: 540,
      drop: 320,
      interact: 520,
      meow: 760,
      score: 920,
      error: 180,
      cook: 460,
      cut: 680,
      burn: 120,
      slip: 240,
      order: 360,
      reset: 620,
    };

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;

    oscillator.frequency.value = frequencies[type];
    oscillator.type = "triangle";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.14);
  }
}
