# KittyCook Strategy

Version: 0.1
Status: Source of truth for product, gameplay, tech, art, and AI-agent decisions.

This document is the global strategy for KittyCook. Read it before implementing
features, creating assets, writing tasks, or asking an AI agent to modify the
project.

KittyCook is a web-only 3D isometric cooperative party game about a brigade of
cat chefs trying to survive an adorable kitchen service on the edge of collapse.

## North Star

KittyCook must feel like saving an impossible dinner service with a brigade of
adorable cats, where every disaster becomes a shared joke.

This is the most important product sentence. If a feature does not support this
feeling, it is either secondary or should be cut.

## Product Positioning

KittyCook is not a cooking game with cats pasted on top.
KittyCook is a feline cooperative comedy where cat behavior becomes gameplay.

The game must deliver:

- Local party chaos for 2 to 4 players.
- Immediate understanding in less than 30 seconds.
- Short, replayable rounds of 3 to 4 minutes.
- Readable panic, not random confusion.
- Strong feline identity through mechanics, animation, audio, and UI.
- Browser-first access with keyboard and gamepad support.
- A future path to phone controllers and Windows packaging.

The game must avoid:

- Copying Overcooked level and recipe structures directly.
- Building online co-op before local party fun is proven.
- Producing lots of content before the core loop makes people laugh.
- Adding voice, webcam, versus, or meta-progression before the MVP works.
- Hiding gameplay rules inside unclear physics or visual noise.

## Target Audience

Primary:

- 2 to 4 players on the same screen.
- Friends, couples, families, casual party players.
- Players who enjoy shouting plans, laughing at mistakes, and replaying for a
  better score.

Secondary:

- Solo players who want to learn levels.
- Streamers who want expressive, readable chaos.
- Web players who try a link without installing anything.

Solo support matters, but it must not drive the initial design.

## Core Design Pillars

### 1. Readable Chaos

Chaos is allowed only when players can understand what happened and how to
respond next.

Gameplay implications:

- Every hazard needs a clear visual or audio warning.
- Each level should have one dominant chaos rule at first.
- Mistakes should be funny and recoverable.

Forbidden:

- Random punishments with no telegraph.
- Multiple major hazards firing at the same time in early levels.
- VFX that hide ingredients, stations, timers, or players.

Example:

- A milk puddle shines for one second before becoming slippery.

### 2. Expressive Cooperation

Players should naturally talk, assign roles, blame each other playfully, and
save each other from mistakes.

Gameplay implications:

- Levels should create temporary roles: cutter, cook, washer, runner, server.
- Tasks should cross player paths without creating permanent traffic jams.
- The best moments should be recoveries, not perfect execution.

Forbidden:

- Long periods where each player can work alone without communication.
- Systems that make one expert player control the whole round.

Example:

- A moving counter splits the kitchen, forcing one player to prepare while
  another catches and serves.

### 3. Feline Mechanics First

The cat identity must be systemic. Cat jokes should be playable rules, not only
skins or decoration.

Gameplay implications:

- Meows, paws, tails, boxes, naps, whiskers, fur, scratching, and curiosity can
  become verbs, hazards, or power-ups.
- Cat animations should explain state: panic, pride, slipping, carrying,
  waiting, burning food.

Forbidden:

- Generic chef gameplay with cat models.
- Cosmetic-only cat references in the MVP.

Example:

- A "motivational meow" briefly speeds up nearby teammates but has a cooldown.

### 4. 30-Second Accessibility

A new player must understand the basic goal almost immediately.

Gameplay implications:

- Use one primary interaction button at MVP.
- Use large recipe icons and consistent station shapes.
- First levels must teach by doing, not by text.

Forbidden:

- Long tutorials.
- Recipes with too many early steps.
- Ambiguous station silhouettes.

Example:

- First recipe: take fish, cut fish, cook fish, serve fish.

### 5. Web-First Instant Play

The first release is a browser game, not a desktop game that happens to run in a
browser.

Gameplay implications:

- Fast load.
- Keyboard and gamepad first.
- No account required for local play.
- DOM HUD for readable UI.
- Assets optimized for web delivery.

Forbidden:

- Mandatory backend for local play.
- Huge unoptimized 3D assets.
- Heavy menus before the first playable screen.

Example:

- "Start Party" launches a local 2-player test quickly from the browser.

### 6. Scope Must Stay Testable

Every major feature must be testable in greybox before final art.

Gameplay implications:

- Prototype mechanics with simple shapes.
- Kill weak mechanics early.
- Content expands only after fun is proven.

Forbidden:

- Building 20 levels before 5 serious playtests.
- Adding features because they sound good but cannot be evaluated quickly.

Example:

- Test phone controllers with one phone controlling Player 2 before designing a
  full mobile UI.

## Core Gameplay Loop

1. Read active customer orders.
2. Grab ingredients.
3. Prepare them at stations: cut, cook, assemble, wash, serve.
4. Avoid or recover from feline chaos.
5. Deliver correct dishes before timers expire.
6. Score points, combos, speed bonuses, and recovery moments.
7. Replay for better coordination and funnier disasters.

Ideal round length:

- 3 minutes for early levels.
- 3 minutes 30 seconds for standard levels.
- 4 minutes maximum for advanced levels.

Failure model:

- Individual orders can expire.
- Food can burn.
- Objects can be dropped or thrown away.
- The round should almost never hard-fail early.

The player should finish a bad round thinking:

"We can do better now that we understand what went wrong."

## MVP Feature Target

The MVP exists to prove the local party fun, not to impress with content volume.

MVP must include:

- Browser build.
- 3D isometric camera.
- 2 to 4 local players.
- Keyboard support.
- Gamepad support.
- One-button contextual interaction.
- Pickup, drop, prepare, cook, serve.
- At least 3 recipes.
- At least 2 levels.
- Score and round result.
- Customer order timers.
- Burning food.
- One slippery hazard.
- One feline mechanic, preferably motivational meow or box shortcut.
- Basic sound feedback.
- Basic readable HUD.

MVP should not include:

- Online co-op.
- Phone controllers as required input.
- Voice commands.
- Webcam interactions.
- Versus mode.
- Long campaign.
- Character progression.
- Level editor.
- Complex physics.
- Final-quality art across all assets.

## Roadmap

### 1. Micro Prototype Fun

Duration:

- 1 to 2 weeks.

Goal:

- Prove that movement, pickup, cooking, serving, and one accident are already
  funny.

Deliver:

- Greybox kitchen.
- 1 to 2 players.
- 1 recipe.
- Cutting, cooking, serving.
- One score screen.
- One simple hazard.

Acceptance criteria:

- Two players can finish a 3-minute round.
- A new player understands the objective in less than 2 minutes.
- At least 3 out of 5 test groups laugh spontaneously.
- At least 60 percent of groups ask to replay.

Go decision:

- Continue only if the loop is fun in greybox.

### 2. Playable Prototype

Duration:

- 4 to 6 weeks.

Goal:

- Make a real local party prototype for 2 to 4 players.

Deliver:

- 4 local players.
- Keyboard and gamepad input.
- 3 recipes.
- 2 levels.
- Burning, washing, scoring, customer order queue.
- Initial HUD and audio.

Acceptance criteria:

- 4 players can complete a level without blocking bugs.
- No player confuses cutting, cooking, washing, and serving stations.
- Frame rate stays above 50 FPS on a mid-range laptop.

### 3. Vertical Slice

Duration:

- 6 to 8 weeks.

Goal:

- Show what the final game feels like in miniature.

Deliver:

- 5 levels.
- 4 playable cats.
- 8 recipes.
- 1 strong biome.
- Polished HUD direction.
- Strong feline audio and animation samples.
- Tutorial level.

Acceptance criteria:

- Players cite the cat identity without being prompted.
- At least 5 levels feel meaningfully different.
- New players understand the first level without verbal explanation.

### 4. Alpha Party

Duration:

- 8 to 10 weeks.

Goal:

- Build enough variety for a 45-minute party session.

Deliver:

- 12 to 15 levels.
- 4 biomes.
- 10 to 12 recipes.
- Family/easy mode.
- First phone-controller prototype.

Acceptance criteria:

- A 45-minute session does not feel repetitive.
- Mixed-skill groups can still have fun.
- Phone controller prototype works for at least one player.

### 5. Beta Content

Duration:

- 8 to 12 weeks.

Goal:

- Complete and balance the public content set.

Deliver:

- 20 to 24 levels.
- 15 recipes.
- 6 playable cats.
- 6 customer types.
- Full scoring and star thresholds.
- Accessibility and settings.

Acceptance criteria:

- 80 percent of levels are understood on first attempt.
- No major input bugs.
- Stable performance above target.

### 6. Web Release

Duration:

- 4 to 6 weeks.

Goal:

- Ship a credible public web version.

Deliver:

- Hosted build.
- Local save.
- Input settings.
- Shareable result screen.
- Performance pass.
- Bug fixing and onboarding polish.

Acceptance criteria:

- Initial load target under 10 seconds on reasonable connection.
- No account required.
- 95 percent of sessions reach the main menu successfully.

### 7. Windows Package

Duration:

- 2 to 4 weeks after web release.

Goal:

- Package the existing web game without rewriting it.

Recommendation:

- Prefer Tauri for a lighter package.
- Use Electron only if web integration or tooling makes it significantly faster.

Acceptance criteria:

- Same gameplay as web.
- Fullscreen works.
- Gamepads are recognized.
- Local save works.

### 8. Extensions And Experimental Modes

Possible additions:

- Phone controllers.
- Chaos mode.
- Versus.
- Teams.
- Voice commands.
- Webcam emotes.
- New biome packs.

Rule:

- Experimental modes must be optional and removable. They must never become
  required for the core game to work.

## Technical Strategy

Recommended MVP stack:

- TypeScript.
- Vite.
- Three.js.
- DOM HUD.
- Gamepad API.
- LocalStorage for early save data.
- GLB/glTF assets.
- Custom simple 2.5D collisions at first.

Recommended ambitious stack:

- TypeScript.
- Vite.
- Three.js or React Three Fiber if the app becomes React-heavy.
- Rapier for advanced collision and physics, only when needed.
- WebSocket server for phone controllers.
- IndexedDB for larger save/config data if needed.
- glTF Transform for asset optimization.
- Tauri for Windows packaging.

Do not over-engineer early:

- No deterministic online netcode.
- No complex ECS unless the codebase genuinely needs it.
- No full physics simulation for kitchen interactions.
- No procedural recipe system.
- No editor-first tooling before level design stabilizes.

### Architecture Rule

Simulation must be separate from rendering.

The simulation owns:

- Entities.
- Player state.
- Object state.
- Timers.
- Recipes.
- Orders.
- Scores.
- Level events.
- Collision decisions.

The renderer owns:

- Three.js scene.
- Meshes.
- Materials.
- Animation playback.
- Camera.
- Particles.
- Visual interpolation.

The UI owns:

- Menus.
- HUD.
- Settings.
- Result screens.
- Accessibility controls.

Never make Three.js objects the source of gameplay truth.

## Core Modules

### GameSimulation

Role:

- Owns the authoritative game state and fixed-timestep update.

Main data:

- Players, items, stations, orders, timers, score, level state.

Responsibilities:

- Advance gameplay rules.
- Emit snapshots for rendering and UI.
- Stay serializable where possible.

Avoid:

- References to Three.js meshes or DOM nodes.

### PlayerController

Role:

- Converts player actions into simulation intent.

Main data:

- Player id, movement vector, held item, current action.

Responsibilities:

- Move, interact, cancel, dash, meow.

Avoid:

- Reading keyboard or gamepad directly.

### InputManager

Role:

- Maps physical devices to gameplay actions.

Main data:

- Device id, player slot, bindings, action states.

Responsibilities:

- Keyboard, gamepad, later phone controller.

Avoid:

- Hardcoded assumptions that Player 1 always uses keyboard.

### RecipeSystem

Role:

- Validates recipe states and dish completion.

Main data:

- Recipe definitions, required ingredients, required states.

Responsibilities:

- Validate plates, reject wrong dishes, expose UI data.

Avoid:

- Recipes that can only be understood through text.

### OrderSystem

Role:

- Manages customer orders and timers.

Main data:

- Active orders, timers, urgency state, customer type.

Responsibilities:

- Spawn orders, expire orders, mark delivery success.

Avoid:

- Too many simultaneous orders for beginners.

### StationSystem

Role:

- Defines station behavior.

Main data:

- Station type, occupancy, progress timer, output rules.

Responsibilities:

- Cutting, cooking, washing, assembly, service, trash.

Avoid:

- Duplicating station logic inside level scripts.

### LevelSystem

Role:

- Loads layouts and controls level-specific events.

Main data:

- Spawn points, station positions, colliders, event timelines.

Responsibilities:

- Level start, moving parts, hazards, biome rules.

Avoid:

- Hardcoding level logic inside the main game loop.

### ScoreSystem

Role:

- Calculates points, combos, penalties, stars, and result highlights.

Main data:

- Score, combo, deliveries, failures, star thresholds.

Responsibilities:

- Keep scoring understandable and beginner-friendly.

Avoid:

- Punishments that make weak players feel useless.

### AudioManager

Role:

- Plays prioritized sound and music cues.

Main data:

- Audio bus, cue id, priority, cooldown.

Responsibilities:

- Make actions readable and fun through sound.

Avoid:

- Layering too many meows or alarms at once.

### UIManager

Role:

- Presents orders, score, timers, prompts, menus, results.

Main data:

- UI snapshot from simulation, input prompts, settings.

Responsibilities:

- Keep the game readable at party distance.

Avoid:

- Tiny text or canvas-only HUD for text-heavy information.

### NetworkControllerInput

Role:

- Later module for phone-as-controller support.

Main data:

- Room code, connected phones, input packets.

Responsibilities:

- QR join, WebSocket input relay, player slot assignment.

Avoid:

- Treating phone controllers as online co-op.

### AssetPipeline

Role:

- Owns asset manifests, loading, optimization, and naming stability.

Main data:

- Manifest keys, GLB paths, texture paths, audio paths.

Responsibilities:

- Load assets predictably and keep web payload small.

Avoid:

- Using raw filenames as gameplay identifiers.

## Gameplay Systems

### Movement

MVP decision:

- Orthographic isometric camera.
- Movement on a flat gameplay plane.
- Player capsule collisions.
- Soft player bumping.
- Stable speed with short acceleration.

Initial target:

- Speed around 3.5 to 4 world units per second.
- Slip loss-of-control max 0.8 seconds.
- No camera rotation in MVP.

### Interaction

MVP decision:

- One primary contextual button.
- Optional cancel/drop button.
- Target highlight before action.

Interaction priority:

1. Object held plus valid station.
2. Nearby object pickup.
3. Station action.
4. Service/trash.

Advanced:

- Short throw can be added after the core interaction is reliable.

### Recipes

MVP recipe complexity:

- 1 to 3 steps.
- Clear ingredient states: raw, cut, cooked, burned.
- Recipe UI shown as icons, not sentences.

Release recipe complexity:

- 3 to 5 steps maximum.
- Complex recipes should appear only after players master stations.

### Chaos

Approved early chaos:

- Burning food.
- Slippery milk.
- Soft player bump.
- Simple moving platform or door.
- One feline mechanic.

Forbidden early chaos:

- Random object theft.
- Long stuns.
- Unclear physics piles.
- Multiple simultaneous hazards.

### Feline Mechanics

Best MVP candidates:

1. Motivational meow: short area speed buff with cooldown.
2. Box shortcut: fixed pair of boxes acting as a simple teleport.
3. Fur contamination: one station slows until cleaned.

Best later candidates:

- Paw reach.
- Tail carry.
- Scratching post buff.
- Purr to calm impatient customers.
- Catnip speed chaos, only in chaos mode.

## Art Direction

Style:

- Stylized 3D cartoon.
- Big silhouettes.
- Round cats, chunky props, readable stations.
- Expressive animation over detail.

Camera readability:

- Low props near gameplay lanes.
- Strong shadows or ground circles under players.
- Held objects displayed above or clearly in front of players.
- No tall decor blocking stations.

Palette:

- Warm and friendly base.
- Strong functional colors:
  - Cutting: green.
  - Cooking: red/orange.
  - Washing: blue.
  - Service: yellow.
  - Danger: red/magenta.

Character direction:

- Cats must be readable by silhouette, not only texture.
- Each playable cat should have one dominant shape trait.
- Animation should communicate state instantly.

HUD direction:

- Large recipe icons.
- Minimal text during gameplay.
- Clear player colors.
- Timer urgency shown visually and with short audio.

Audio direction:

- Short, memorable cues.
- Meows must be useful, not constant noise.
- Music can intensify near the end of a round.

## Initial Content Direction

### MVP Content

Levels:

- 2 levels.

Ingredients:

- Fish, bread, milk, herb.

Recipes:

- Sardine toast.
- Grilled fish.
- Purring soup.

Stations:

- Cut.
- Cook.
- Assemble.
- Serve.
- Trash.

Hazards:

- Milk puddle.
- Burning food.

### Vertical Slice Content

Levels:

- 5 levels.

Add:

- Washing.
- One strong biome.
- 4 cats.
- 8 recipes.
- One level transformation.
- First polished audio identity.

### Release Content Target

Levels:

- 24 to 30.

Recipes:

- 15 to 18.

Playable cats:

- 6.

Biomes:

- 6 to 8.

Customer types:

- 6 to 8.

## First 12 Level Concepts

1. Cushion Counter
   - Simple cafe tutorial with a central bump lane.

2. Sardineville Rooftops
   - Wind pushes light objects across safe roof lanes.

3. Midnight Market
   - Ingredient stalls shift positions on a timer.

4. Meow Express Train
   - Kitchen cars separate briefly, forcing planning.

5. Thunder Tuna Boat
   - Deck tilt creates controlled sliding.

6. Scratching Post Hotel
   - Service and prep are separated by a simple elevator.

7. Wild Herb Greenhouse
   - Plants temporarily block routes.

8. Clockwork Kitchen
   - Doors open and close rhythmically.

9. Suspension Food Truck
   - Road bumps create short, readable movement disruptions.

10. Lantern Festival Stand
    - Service windows alternate.

11. Laundry Canteen
    - Washing and cooking compete for route priority.

12. Croquette Observatory
    - Low-gravity object drift, reserved for late content.

## Playtest Strategy

Frequency:

- Weekly from the first playable prototype.
- Twice weekly during Vertical Slice and Beta.

Groups:

- 2 novice players.
- 4 party players.
- Mixed skill family group.
- One experienced game group.

Protocol:

1. Give less than 30 seconds of explanation.
2. Let players play one full round.
3. Observe without helping unless blocked.
4. Let them replay if they ask.
5. Ask short questions after the session.

Measure:

- Time to first laugh.
- Spontaneous communications per minute.
- Number of "what do I do?" moments.
- Errors understood versus errors not understood.
- Replay request rate.
- Stress level from 1 to 5.
- Station confusion.
- FPS and input issues.

Fun signals:

- Players shout useful plans.
- Players laugh at recoverable mistakes.
- Players blame themselves and each other playfully.
- Players ask to replay immediately.

Frustration signals:

- Silence.
- Repeated confusion about the same station.
- Players blame controls or camera.
- Players stop moving.
- Players cannot explain why they failed.

Kill criteria:

- No spontaneous laughter after 5 minutes.
- More than 30 percent of mistakes are not understood.
- Two or more groups confuse the same station.
- Any hazard feels random or unfair.
- Performance drops below 45 FPS on target hardware.

## Feature Priority Matrix

### Must Have

- 2 to 4 local players.
- Isometric 3D kitchen.
- Keyboard input.
- Gamepad input.
- Pickup/drop.
- Cutting.
- Cooking.
- Serving.
- Orders and timers.
- Score and result screen.
- Readable HUD.
- At least one funny hazard.
- At least one feline mechanic.

### Should Have

- Washing dishes.
- Combos.
- Star ratings.
- Tutorial level.
- Family/easy mode.
- 5-level vertical slice.
- Strong audio feedback.
- 4 playable cats.
- Level-specific moving elements.

### Could Have

- Phone controllers.
- Chaos mode.
- More power-ups.
- Customer special behaviors.
- Shareable result screen.
- Local challenge mode.

### Later

- Versus mode.
- Team mode.
- More advanced solo.
- New biome packs.
- Packaged Windows version.

### Dream

- Voice commands.
- Webcam interactions.
- Online co-op.
- Level editor.
- Procedural campaigns.

## Hard Cuts For The Beginning

Cut immediately from early production:

- Online co-op.
- Webcam.
- Voice.
- Versus.
- Campaign map.
- Cosmetic shop.
- Deep progression.
- Complex AI customers.
- Full physics simulation.
- Final art for all levels.

These are not bad ideas. They are dangerous because they delay the proof of fun.

## 30-Day Plan

### Week 1

Goal:

- Prove movement and interaction.

Tasks:

- Set up Vite, TypeScript, Three.js.
- Add fixed simulation loop.
- Add isometric camera.
- Add one player capsule.
- Add keyboard action map.
- Add pickup and drop.

Deliverable:

- One player can move around a greybox kitchen and carry objects.

Go/No-Go:

- Movement must feel responsive before recipes are expanded.

### Week 2

Goal:

- Complete one cooking loop.

Tasks:

- Add cutting station.
- Add cooking station.
- Add serving station.
- Add one recipe.
- Add order timer.
- Add basic HUD.
- Add score.

Deliverable:

- One 3-minute round can be completed.

Go/No-Go:

- If players need long verbal explanation, rebuild HUD and station readability.

### Week 3

Goal:

- Add cooperation and first chaos.

Tasks:

- Add second player.
- Add soft bumping.
- Add burning state.
- Add milk puddle slip.
- Add basic audio feedback.
- Add result screen.

Deliverable:

- Two-player greybox party prototype.

Go/No-Go:

- If there is no spontaneous laughter in playtests, change the chaos mechanic.

### Week 4

Goal:

- Add feline identity and replay value.

Tasks:

- Add motivational meow or box shortcut.
- Add second simple level.
- Add one extra recipe.
- Add basic player colors.
- Run 5 playtests.

Deliverable:

- Micro Prototype Fun v1.

Go/No-Go:

- Continue only if at least 60 percent of groups ask to replay.

## First 20 Development Tasks

1. Create project scaffold with Vite, TypeScript, and Three.js.
2. Implement fixed timestep GameSimulation.
3. Implement orthographic isometric camera.
4. Implement InputManager with action mapping.
5. Implement one PlayerController.
6. Implement simple capsule movement and wall collisions.
7. Implement interaction target highlighting.
8. Implement item pickup and drop.
9. Implement cutting station.
10. Implement cooking station with burned state.
11. Implement service station.
12. Implement RecipeSystem with one recipe.
13. Implement OrderSystem with one timed order.
14. Implement DOM HUD for active order.
15. Implement ScoreSystem with final result.
16. Build first greybox level.
17. Add second local player.
18. Add soft player bump.
19. Add milk puddle slip hazard.
20. Run first structured playtest and record metrics.

## AI Agent Operating Rules

Any AI agent working on this project should follow these rules:

1. Preserve the North Star.
2. Prefer small playable increments over broad rewrites.
3. Keep simulation, rendering, input, UI, and assets separated.
4. Do not add a feature unless it can be playtested.
5. Do not add content before the core loop is fun.
6. Keep early UI readable at party distance.
7. Avoid copying level structures from other cooking party games.
8. Use feline mechanics as gameplay, not only decoration.
9. Keep browser performance and loading time in mind.
10. When in doubt, build the smallest version that can produce laughter.

## Current Strategic Decision

The next concrete decision is to lock the MVP technical stack:

- TypeScript.
- Vite.
- Three.js vanilla.
- DOM HUD.
- Keyboard and gamepad input.
- Local play first.

After that, build the Micro Prototype Fun. Do not start content production until
the greybox prototype proves that KittyCook is funny.
