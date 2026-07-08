# Perigee — Vision

## The problem

Physics puzzle games usually pick one of two unsatisfying lanes. Either the "physics" is a
canned animation dressed up to look like simulation (the trajectory was authored, not computed),
or the game is an open sandbox with real physics but no objective — fun to poke at, nothing to
solve. Neither delivers the specific pleasure of *reading* a gravity well correctly and watching
a single, committed decision play out exactly as predicted.

## Who it's for

Players who liked the parabola-reading satisfaction of Angry Birds or the orbital intuition of
Kerbal Space Program, but want it in a **daily, five-minute** format rather than an open-ended
sandbox or a long campaign. Someone who wants one sharp puzzle at lunch, not another app that
asks for an hour.

## The core idea

Every level is a fixed arrangement of planets, a probe, and a target. The player gets exactly one
input: drag out an aim vector, release. From that moment, a real n-body gravitational simulation
takes over — the probe's path is *computed*, not authored, integrating the pull of every planet
in the level every frame. While the player is still dragging, the same simulation runs forward
as a live "ghost path" preview, so aiming is a feedback loop (drag, watch the curve, adjust,
drag again) rather than a blind guess. The puzzle is entirely in reading the gravity correctly;
there is no execution skill, no timing, no second chance to steer mid-flight.

## Key design decisions

- **Planets are static, the probe is dynamic.** Full mutual n-body (planets also drifting under
  each other's gravity) would make daily levels non-reproducible and chaotic to hand-design.
  Fixing planet positions keeps every level a solvable, shareable, exact puzzle — while the
  probe itself still integrates gravity from every planet in the level simultaneously, which is
  what makes multi-planet slingshots and threading passes possible.
- **Velocity-Verlet integration**, not simple Euler. Euler integration visibly drifts energy over
  a multi-second flight, and a level's puzzle only reads as "fair" if a close flyby looks sharp
  but doesn't blow up numerically. Verlet's stability is what makes tight slingshots possible
  without either fudging the physics or capping how close a pass can get.
- **A softened gravity well.** True 1/r² blows up at zero distance; a small softening term keeps
  a near-miss dramatic without becoming an undefined-behavior spike in the integrator.
- **One input, no mid-flight control.** The entire skill of the game is aiming, not piloting.
  Removing thrust/steering after launch is deliberate — it's what makes each level a puzzle with
  a correct answer rather than a dexterity test.
- **Daily, not endless.** One hand-designed level a day (seeded by date) beats procedural
  generation for this genre: gravity-assist puzzles need a human to verify the intended solution
  actually reads as satisfying, and a shared daily gives every player the same puzzle to compare
  notes on.
- **Static site, no backend.** Levels ship as data in the client bundle; "daily" is enforced by
  date-keyed level selection, not a server. This keeps the game free to host and trivial to
  deploy to a static subpath.

## What "v1 done" looks like

- The wow moment is real end to end: drag an aim vector, release, watch the probe curve around at
  least one planet under live n-body gravity, and either clip the goal or clearly miss.
- A handful of hand-designed levels (not just one placeholder), each solvable and each teaching a
  distinct gravity-assist idea (a single slingshot, a multi-planet threading pass, a near-capture).
  A par shot count for each.
- Live trajectory prediction while aiming, so the player is reading the physics before they
  commit, not discovering it after.
- A win state with the run's stats and a shareable result string — no spoilers, just the shot
  count and the date.
- The full design standard in `docs/DESIGN.md` is executed: the amber CRT tracking-console
  aesthetic, synth SFX with a persisted mute, and juice on every launch/impact/win.
- `npm run build` produces a self-contained static bundle deployable to a subpath with no server.
