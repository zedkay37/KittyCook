import type { PlayerInputState } from "../types";
import { normalize } from "../math/vector";

type KeyboardBinding = {
  up: string;
  down: string;
  left: string;
  right: string;
  interact: string;
  cancel: string;
  dash: string;
  meow: string;
  reset: string;
};

const neutralInput: PlayerInputState = {
  move: { x: 0, y: 0 },
  interactPressed: false,
  cancelPressed: false,
  dashPressed: false,
  meowPressed: false,
  resetPressed: false,
};

const keyboardBindings: Record<number, KeyboardBinding> = {
  1: {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    interact: "Space",
    cancel: "KeyQ",
    dash: "ShiftLeft",
    meow: "KeyE",
    reset: "KeyR",
  },
  2: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    interact: "Enter",
    cancel: "Backspace",
    dash: "ShiftRight",
    meow: "Slash",
    reset: "KeyR",
  },
};

export class InputManager {
  private readonly keysDown = new Set<string>();
  private readonly keysPressed = new Set<string>();
  private readonly previousGamepadButtons = new Map<number, boolean[]>();

  constructor(target: Window) {
    target.addEventListener("keydown", (event) => {
      if (!this.keysDown.has(event.code)) {
        this.keysPressed.add(event.code);
      }

      this.keysDown.add(event.code);
    });

    target.addEventListener("keyup", (event) => {
      this.keysDown.delete(event.code);
    });

    target.addEventListener("blur", () => {
      this.keysDown.clear();
      this.keysPressed.clear();
    });
  }

  readPlayerInputs(playerSlots: number[]): Map<number, PlayerInputState> {
    const inputs = new Map<number, PlayerInputState>();

    for (const slot of playerSlots) {
      inputs.set(slot, this.readPlayerInput(slot));
    }

    this.keysPressed.clear();

    return inputs;
  }

  private readPlayerInput(slot: number): PlayerInputState {
    const keyboard = this.readKeyboardInput(slot);
    const gamepad = this.readGamepadInput(slot);

    return {
      move: normalize({
        x: keyboard.move.x + gamepad.move.x,
        y: keyboard.move.y + gamepad.move.y,
      }),
      interactPressed: keyboard.interactPressed || gamepad.interactPressed,
      cancelPressed: keyboard.cancelPressed || gamepad.cancelPressed,
      dashPressed: keyboard.dashPressed || gamepad.dashPressed,
      meowPressed: keyboard.meowPressed || gamepad.meowPressed,
      resetPressed: keyboard.resetPressed || gamepad.resetPressed,
    };
  }

  private readKeyboardInput(slot: number): PlayerInputState {
    const binding = keyboardBindings[slot];

    if (!binding) {
      return neutralInput;
    }

    return {
      move: normalize({
        x: Number(this.keysDown.has(binding.right)) - Number(this.keysDown.has(binding.left)),
        y: Number(this.keysDown.has(binding.up)) - Number(this.keysDown.has(binding.down)),
      }),
      interactPressed: this.keysPressed.has(binding.interact),
      cancelPressed: this.keysPressed.has(binding.cancel),
      dashPressed: this.keysPressed.has(binding.dash),
      meowPressed: this.keysPressed.has(binding.meow),
      resetPressed: this.keysPressed.has(binding.reset),
    };
  }

  private readGamepadInput(slot: number): PlayerInputState {
    const gamepad = navigator.getGamepads()[slot - 1];

    if (!gamepad) {
      return neutralInput;
    }

    const deadZone = 0.22;
    const xAxis = Math.abs(gamepad.axes[0] ?? 0) > deadZone ? gamepad.axes[0] ?? 0 : 0;
    const yAxis = Math.abs(gamepad.axes[1] ?? 0) > deadZone ? -(gamepad.axes[1] ?? 0) : 0;
    const previousButtons = this.previousGamepadButtons.get(slot) ?? [];
    const currentButtons = gamepad.buttons.map((button) => button.pressed);
    const pressedThisFrame = (index: number) =>
      Boolean(currentButtons[index]) && !Boolean(previousButtons[index]);

    this.previousGamepadButtons.set(slot, currentButtons);

    return {
      move: normalize({ x: xAxis, y: yAxis }),
      interactPressed: pressedThisFrame(0),
      cancelPressed: pressedThisFrame(1),
      dashPressed: Boolean(gamepad.buttons[2]?.pressed),
      meowPressed: pressedThisFrame(3),
      resetPressed: pressedThisFrame(9),
    };
  }
}
