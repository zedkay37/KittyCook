# KittyCook Agent Guide

This file is for future developers and AI agents.

Before changing the project, read `KITTYCOOK_STRATEGY.md`. It is the source of
truth for product direction, scope cuts, roadmap, and technical boundaries.

## Operating Rules

1. Preserve the North Star.
2. Build small playable increments.
3. Keep simulation separate from rendering.
4. Keep UI in DOM unless there is a strong reason to put it in WebGL.
5. Do not add content before the core loop is fun.
6. Do not add online co-op, voice, webcam, versus, or progression before the MVP.
7. Every gameplay feature must be playtestable in greybox.
8. Cat identity must appear in gameplay, not only in skins.
9. Keep browser loading and frame rate in mind.
10. Prefer clear code boundaries over clever abstractions.

## Architecture Boundaries

- `GameSimulation` owns gameplay state and rules.
- `GameRenderer` owns Three.js objects and visuals.
- `InputManager` maps physical devices to abstract actions.
- `UIManager` presents DOM HUD and menus.
- Systems under `src/game/systems` should stay renderer-agnostic.

Never make Three.js meshes the source of gameplay truth.

## Current Stack

- TypeScript
- Vite
- Three.js
- DOM HUD
- Keyboard and Gamepad API

## First Milestone

Milestone 1 is `Micro Prototype Fun`.

Do not polish visuals before these are working:

- Local movement.
- Pickup/drop.
- Cutting.
- Cooking.
- Serving.
- Order timer.
- Score result.
- One funny hazard.
- One feline mechanic.

## Definition Of Done For Early Work

Early features are done only when:

- They work in the browser.
- They are readable from the isometric camera.
- They do not require verbal explanation beyond the first 30 seconds.
- They keep the simulation/render/input boundaries intact.
