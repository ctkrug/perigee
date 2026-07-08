# Perigee — Architecture

A map of the codebase for anyone (including a future build/QA run) picking this up cold.

## Run it

```sh
npm install
npm run dev      # Vite dev server
npm test         # vitest run — physics core + pure game logic
npm run coverage # vitest run --coverage
npm run lint     # eslint src/ test/
npm run build    # static production build to dist/, relative paths (subpath-safe)
```

## Layered structure

```
src/
  core/            physics — pure, framework-free, fully unit tested
    vector.js        {x, y} math: add/sub/scale/length/normalize/distance
    body.js           createPlanet / createProbe factories
    integrator.js     velocity-Verlet step() + acceleration() + surfaceDistance()
    trajectory.js     predict() — runs step() forward without mutating game state,
                       used for the ghost path while aiming

  game/            browser wiring — DOM/canvas/WebAudio, not unit tested except
                   where the logic is pure (levels, effects, particles, share)
    levels.js         LEVELS data + getLevelById/getLevelForDate (pure, tested)
    effects.js        shakeOffset/flashAlpha/pulseScale — pure time-sampled curves
                       for impact/goal juice (pure, tested)
    particles.js      createBurst() — win-celebration spark data (pure, tested)
    share.js          buildShareString()/formatDateForShare() — no-spoiler result
                       string (pure, tested)
    starfield.js      static star-field generation + draw
    renderer.js       drawScene() — the only place that touches CanvasRenderingContext2D;
                       samples effects.js each frame from fx timestamps
    keyboardAim.js     stepAimState/velocityFromAim/initialAimState — pure angle+power
                       math for the keyboard control scheme (pure, tested)
    input.js          attachAimInput() — pointer AND keyboard input -> the same
                       onAimStart/Move/onLaunch/onAimCancel callbacks, no physics/
                       rendering opinion. Keyboard callbacks pass a world-space
                       velocity (via keyboardAim.js) plus `{ fromKeyboard: true }`;
                       pointer callbacks pass a screen-space point — main.js branches
                       on the meta flag to tell them apart.
    audio.js          createAudioEngine() — WebAudio oscillator SFX, lazy AudioContext,
                       localStorage-persisted mute; every call is a safe no-op without
                       a WebAudio implementation
    hud.js            renderHud() — shots/par/status readout (plain DOM strings)
    overlay.js        createWinOverlay() — win-dialog DOM wiring: shows stats, spawns
                       the particle burst, copies the share string, traps focus/Escape
    main.js           startGame() — owns all mutable game state and the animation
                       loop; wires every module above together

src/main.js        entry point: grabs the DOM elements and calls startGame()
src/style.css      design tokens (docs/DESIGN.md) + all layout/theming
index.html         single page: topbar (wordmark/tagline/mute), scene-frame (canvas +
                   radar-sweep overlay), HUD panel, win-overlay dialog
```

## Data flow for one shot

1. `input.js` reports aim input from two sources: pointer down/move/up as screen
   coordinates, or arrow-key/Enter/Escape as a `keyboardAim.js` angle+power state.
2. `main.js` converts either into a world-space velocity — screen deltas via
   `renderer.screenToWorld` and `AIM_POWER`, or keyboard state via
   `keyboardAim.velocityFromAim()` — branching on the `fromKeyboard` meta flag
   `input.js` passes alongside each callback.
3. While aiming, `main.js` calls `trajectory.predict()` with that velocity to get the
   ghost path, which `renderer.drawScene()` renders as a dashed line.
4. On release/launch, `main.js` sets the probe's real velocity and flips `gameState`
   to `"flying"`.
5. Each animation frame, `main.js.updatePhysics()` advances the probe through
   `integrator.step()` in `SUBSTEPS_PER_FRAME` substeps (substepping keeps close
   flybys numerically stable), appending to the motion `trail` and checking goal/
   collision/bounds conditions every substep.
6. On goal/collision, `main.js.endShot()` stamps `fx.goalAt`/`fx.crashAt` (used by
   `renderer.js` to sample the pulse/shake/flash curves), plays the matching SFX, and
   either shows the win overlay (`overlay.js`, goal) or auto-resets after a beat
   (crash/miss).

## Level data & the daily rotation

`levels.js` holds five hand-designed `LEVELS`, each documenting its intended
gravity-assist solution. `levelIdForDate(date)` maps a calendar date to a level id
deterministically: whole days since a fixed rotation-start date, modulo the level
count, so the same date always resolves to the same level and the rotation repeats
indefinitely. Any date before the rotation start, or an unparsable date, falls back
to `LEVELS[0]`. `main.js` calls `getLevelForDate(new Date())` once at startup — there
is no server, so "daily" is enforced purely by this deterministic mapping running in
the client.

## Design system

`docs/DESIGN.md` is the single source of truth for the amber-CRT tracking-console
direction (tokens, layout intent, juice plan). `src/style.css` implements it: CSS
custom properties for the palette/spacing/motion tokens, the `.scene-frame` scanline
+ radar-sweep overlays (the signature detail), and themed states (hover/focus-visible/
active) on every interactive control. Nothing in `renderer.js` duplicates these as
canvas draws — they're CSS so they layer over the canvas without extra per-frame cost.

## Testing philosophy

Everything pure (core physics including the `body.js` factories, level lookup, effect
curves, particle generation, the share string, the keyboard aim-state math in
`keyboardAim.js`) has unit tests covering the happy path and boundaries (empty/zero/
max/malformed input). DOM/canvas wiring (`main.js`, `renderer.js`, `input.js`,
`hud.js`, `overlay.js`) is deliberately kept thin and is exercised by manual/scripted
browser play-testing (Playwright) rather than unit tests — `audio.js` is the one
exception: it's tested by stubbing the ambient globals it reads (`window`,
`localStorage`) with fakes detailed enough to exercise the real oscillator/gain
wiring, not just the "no WebAudio" no-op branch, without pulling in a DOM environment.
