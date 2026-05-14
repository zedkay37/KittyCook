# KittyCook

KittyCook is a web-first 3D isometric cooperative party game about cat chefs
trying to survive an adorable kitchen service on the edge of collapse.

The project starts with a strict goal: prove that the local party loop is funny
in greybox before producing lots of content.

## North Star

KittyCook must feel like saving an impossible dinner service with a brigade of
adorable cats, where every disaster becomes a shared joke.

## Stack

- TypeScript
- Vite
- Three.js
- DOM HUD
- Local keyboard and gamepad input first

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

On this Windows machine, PowerShell may block `npm.ps1`. Use `npm.cmd` if that
happens:

```powershell
npm.cmd install
npm.cmd run dev
```

## Project Structure

```txt
src/
  data/             Static recipes and level definitions
  game/
    audio/          Audio cues and future mixer
    input/          Keyboard, gamepad, and later phone input mapping
    render/         Three.js scene, camera, meshes, VFX
    simulation/     Authoritative gameplay state and fixed-step rules
    systems/        Recipe, order, station, score, and level systems
    types.ts        Shared gameplay types
  ui/               DOM HUD and menus
```

## Required Reading

Before building features, read:

- `KITTYCOOK_STRATEGY.md`
- `AGENTS.md`
- `docs/MILESTONE_01_MICRO_PROTOTYPE.md`

## Current Goal

Build the visual alpha on top of Milestone 1: Micro Prototype Fun.

The current prototype is successful only if players understand the objective
quickly, recognize the cat-chef identity from a screenshot, laugh during
playtests, and ask to replay.

## Current Prototype Controls

Player 1:

- `WASD`: move
- `Space`: interact
- `Q`: drop/cancel
- `E`: motivational meow
- `Left Shift`: dash

Player 2:

- `Arrow keys`: move
- `Enter`: interact
- `Backspace`: drop/cancel
- `/`: motivational meow
- `Right Shift`: dash

Shared:

- `R`: reset/replay the round

Gamepad:

- Left stick: move
- `A`: interact
- `B`: drop/cancel
- `X`: dash
- `Y`: motivational meow
- Start/Menu: reset

## Current Micro Loop

1. Take a plate from `Plates`.
2. Place it on `Assemble`.
3. Take ingredients from crates.
4. Cut fish or herbs at `Cut`.
5. Cook fish at `Cook` and grab it before it burns.
6. Add ingredients to the plate at `Assemble`.
7. Pick up the dish and serve it at `Serve`.
8. Avoid the milk puddle, or slide through it for science.

## Current Visual Alpha Direction

- Procedural Three.js models, no required GLB pipeline yet.
- Cartoon cats with hats, ears, tails, paws, player rings, and simple animation.
- Station silhouettes are intentionally distinct by shape and color.
- The kitchen is dressed as `Cushion Counter` with counters, tile seams, paw
  prints, cushion rug, sign, and readable functional zones.
- VFX are event-driven from simulation events: meow wave, cut sparks, steam,
  burn smoke, slip splash, and score pop.
