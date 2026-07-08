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
  core/            physics + core game rules — pure, framework-free, fully unit tested
    vector.js        {x, y} math: add/sub/scale/length/normalize/distance
    body.js           createPlanet / createProbe factories
    integrator.js     velocity-Verlet step() + acceleration() + surfaceDistance()
    trajectory.js     predict() — runs step() forward without mutating game state,
                       used for the ghost path while aiming
    outcome.js        resolveShotOutcome() — the goal/crash/bounds priority check
                       that decides how every shot ends, called once per substep
                       from main.js's flight loop

  game/            browser wiring — DOM/canvas/WebAudio. Every module's pure logic
                   is unit tested directly; the residual DOM/canvas-touching code
                   (drawScene, drawStarfield, the animation loop itself) is exercised
                   by manual/scripted browser play-testing (Playwright) instead
    levels.js         LEVELS data + getLevelById/getLevelForDate (pure, tested)
    effects.js        shakeOffset/flashAlpha/pulseScale — pure time-sampled curves
                       for impact/goal juice (pure, tested)
    particles.js      createBurst() — win-celebration spark data (pure, tested)
    share.js          buildShareString()/formatDateForShare() — no-spoiler result
                       string (pure, tested)
    keyboardAim.js     stepAimState/velocityFromAim/initialAimState — pure angle+power
                       math for the keyboard control scheme (pure, tested)
    starfield.js      createStarfield() (pure, tested) + drawStarfield() (canvas, untested)
    renderer.js       worldToScreen()/screenToWorld() (pure, tested) + drawScene(),
                       the only place that touches CanvasRenderingContext2D; samples
                       effects.js each frame from fx timestamps (canvas, untested)
    input.js          attachAimInput() — pointer AND keyboard input -> the same
                       onAimStart/Move/onLaunch/onAimCancel callbacks, no physics/
                       rendering opinion. Keyboard callbacks pass a world-space
                       velocity (via keyboardAim.js) plus `{ fromKeyboard: true }`;
                       pointer callbacks pass a screen-space point — main.js branches
                       on the meta flag to tell them apart. Tested against a fake
                       canvas (addEventListener/removeEventListener registry) rather
                       than a real DOM.
    audio.js          createAudioEngine() — WebAudio oscillator SFX, lazy AudioContext,
                       localStorage-persisted mute; every call is a safe no-op without
                       a WebAudio implementation, and reads/writes to localStorage are
                       wrapped so a throwing store (private browsing, sandboxed iframe)
                       degrades instead of crashing startup. Tested against fake
                       window/localStorage/AudioContext globals detailed enough to
                       exercise the real oscillator/gain wiring, not just the no-op path.
    hud.js            renderHud() — shots/par/status readout (plain DOM strings)
    overlay.js        createWinOverlay() — win-dialog DOM wiring: shows stats, spawns
                       the particle burst, copies the share string, traps focus/Escape.
                       Tested against a fake root element + document/window/navigator
                       globals.
    main.js           startGame() — owns all mutable game state and the animation
                       loop; wires every module above together. Not unit tested (real
                       requestAnimationFrame loop + canvas sizing); exercised by manual/
                       scripted browser play-testing.

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
   flybys numerically stable), appending to the motion `trail` and calling
   `outcome.resolveShotOutcome()` every substep to check goal/collision/bounds in
   that priority order.
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

Everything pure — core physics, the shot-outcome rule, level lookup, effect curves,
particle generation, the share string, the keyboard aim-state math, and the pure
coordinate/data-generation halves of `renderer.js`/`starfield.js` — has unit tests
covering the happy path and boundaries (empty/zero/max/malformed input, and for
`outcome.js` specifically, priority ordering when two conditions are true in the same
substep). DOM/canvas code that has no meaningful existence outside a real browser
(`main.js`'s animation loop and canvas sizing, `drawScene()`, `drawStarfield()`) is
exercised by manual/scripted browser play-testing (Playwright) instead. Everything
else that merely *touches* browser globals (`audio.js`, `input.js`, `overlay.js`) is
still unit tested, against fakes for exactly the globals/DOM methods each one calls
(`window`/`localStorage`/`AudioContext`, an event-listener-registry fake canvas, a
fake root element + `document`/`navigator`) rather than a real DOM — the same
principle as stubbing in any other test, just applied to browser APIs instead of a
database or network call.
