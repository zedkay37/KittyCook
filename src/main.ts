import { microPrototypeLevel } from "./data/levels/microPrototypeLevel";
import { recipes } from "./data/recipes";
import { AudioManager } from "./game/audio/AudioManager";
import { InputManager } from "./game/input/InputManager";
import { GameRenderer } from "./game/render/GameRenderer";
import { GameSimulation } from "./game/simulation/GameSimulation";
import type { SimulationEvent } from "./game/types";
import { UIManager } from "./ui/UIManager";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (!root) {
  throw new Error("Missing #game-root element.");
}

const simulation = new GameSimulation({
  level: microPrototypeLevel,
  recipes,
  playerCount: 2,
});

const input = new InputManager(window);
const renderer = new GameRenderer(root);
const ui = new UIManager(document);
const audio = new AudioManager();

const fixedStepSeconds = 1 / 60;
let previousTime = performance.now();
let accumulator = 0;

function frame(now: number) {
  const frameSeconds = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  accumulator += frameSeconds;
  const frameEvents: SimulationEvent[] = [];

  while (accumulator >= fixedStepSeconds) {
    const inputs = input.readPlayerInputs(simulation.getPlayerSlots());
    const events = simulation.tick(fixedStepSeconds, inputs);
    audio.playEvents(events);
    frameEvents.push(...events);
    accumulator -= fixedStepSeconds;
  }

  const snapshot = simulation.getSnapshot();
  renderer.playEvents(frameEvents, snapshot);
  renderer.update(snapshot);
  renderer.render();
  ui.update(snapshot);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
