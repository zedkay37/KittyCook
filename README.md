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

Build Milestone 1: Micro Prototype Fun.

The milestone is successful only if players understand the objective quickly,
laugh during greybox playtests, and ask to replay.
