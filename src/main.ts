import { levelOptions, type LevelOption } from "./data/levels";
import { recipes } from "./data/recipes";
import { AudioManager } from "./game/audio/AudioManager";
import { InputManager } from "./game/input/InputManager";
import { GameRenderer } from "./game/render/GameRenderer";
import { GameSimulation } from "./game/simulation/GameSimulation";
import type { SimulationEvent } from "./game/types";
import { LevelMenu } from "./ui/LevelMenu";
import { UIManager } from "./ui/UIManager";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (!root) {
  throw new Error("Missing #game-root element.");
}

const input = new InputManager(window);
const renderer = new GameRenderer(root);
const ui = new UIManager(document);
const audio = new AudioManager();
let simulation = createSimulation(levelOptions[0]);

const fixedStepSeconds = 1 / 60;
let previousTime = performance.now();
let accumulator = 0;

const levelMenu = new LevelMenu(document, {
  levels: levelOptions,
  onStart: (level) => {
    simulation = createSimulation(level);
    accumulator = 0;
  },
});

levelMenu.open();

function frame(now: number) {
  const frameSeconds = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  accumulator += frameSeconds;
  const frameEvents: SimulationEvent[] = [];
  const menuOpen = document.body.classList.contains("is-menu-open");

  if (menuOpen) {
    accumulator = 0;
  }

  while (!menuOpen && accumulator >= fixedStepSeconds) {
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

function createSimulation(level: LevelOption): GameSimulation {
  return new GameSimulation({
    level: level.level,
    recipes,
    playerCount: 2,
  });
}
