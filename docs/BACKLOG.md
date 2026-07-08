# Perigee — Backlog

Epics and stories for the build. Every story lists concrete, checkable acceptance criteria —
build implements to them, QA attacks them. Story 1.1 is the wow moment and must land first.

## Epic 1 — Core slingshot loop

### [ ] 1.1 Drag-to-aim launch with live n-body flight (WOW MOMENT)
- [ ] Dragging from the probe and releasing sets an initial velocity proportional to the drag
      vector and launches the probe.
- [ ] The probe's flight path is computed frame-by-frame by the n-body integrator against every
      planet in the level — not a pre-baked or scripted animation.
- [ ] A shot released to pass within 3x a planet's radius changes the probe's heading by more
      than 15° over the flight, i.e. gravity visibly redirects it rather than a near-straight line.

### [ ] 1.2 Live trajectory ghost path while aiming
- [ ] While dragging, a dashed ghost path renders the predicted flight for the current aim
      vector and updates on every pointer move.
- [ ] The ghost path stops exactly where the real flight would end (planet collision or leaving
      level bounds), so aiming never shows a preview the real shot can't match.

### [ ] 1.3 Goal detection and shot resolution
- [ ] The probe reaching within the goal's radius ends the shot as "Goal reached" and halts
      physics stepping.
- [ ] The probe crashing into a planet ends the shot as "Crashed."
- [ ] The probe leaving the level bounds ends the shot as "Missed."

### [ ] 1.4 Shot counter and par
- [ ] Each launch increments a shot counter visible in the HUD.
- [ ] The level's par value is displayed alongside the shot counter for the whole attempt.

## Epic 2 — Daily levels & progression

### [ ] 2.1 Level data model supports multiple hand-designed levels
- [ ] At least 5 levels exist in the level data, each with a unique id, a distinct planet
      arrangement, and a documented intended gravity-assist solution (comment or doc).
- [ ] Loading a level by id renders that level's planets, probe start, and goal correctly,
      covered by a unit test asserting the loaded level's fields.

### [ ] 2.2 Date-keyed daily level selection
- [ ] The level shown for a given calendar date is deterministic: the same date always resolves
      to the same level id, covered by a unit test.
- [ ] A documented fallback level covers any date outside the authored range so the game never
      fails to load a level.

### [ ] 2.3 Win overlay with run stats and share string
- [ ] Reaching the goal shows an overlay with shots used vs. par.
- [ ] The overlay includes a generated share string (date + shot count only, no solution
      spoilers) that copies to the clipboard on click.

### [ ] 2.4 Design polish — tracking-console chrome
- [ ] The radar-sweep background animation and scanline texture from docs/DESIGN.md are present.
- [ ] Canvas and HUD panel compose correctly at 390px, 768px, and 1440px with no overlap, no
      horizontal scroll, and no dead empty space.

## Epic 3 — Game feel & audio

### [ ] 3.1 Impact and goal juice
- [ ] Colliding with a planet triggers a visible flash plus a brief canvas shake at the impact
      point.
- [ ] Clipping the goal triggers a pulse/fill animation on the goal ring before the win overlay
      appears.
- [ ] `prefers-reduced-motion` disables the shake/particle effects while all game-state changes
      (score, overlay, status text) still occur.

### [ ] 3.2 Synth SFX with persisted mute
- [ ] Launch, collision, and goal events each play a distinct WebAudio-synthesized sound with no
      binary audio assets anywhere in the repo.
- [ ] Toggling mute silences all SFX immediately, and the muted state persists across a page
      reload via localStorage.

### [ ] 3.3 Motion trail and full interaction states
- [ ] The probe renders a short fading trail behind it while in flight.
- [ ] Every interactive control (mute button and any controls added this epic) has themed hover,
      focus-visible, and active states — no naked native defaults.

### [ ] 3.4 Design polish — win celebration
- [ ] The win overlay includes a particle/spark burst matching docs/DESIGN.md's signature detail.
- [ ] The win overlay is dismissible via keyboard and traps focus while open.

## Epic 4 — Ship readiness

### [ ] 4.1 Landing page
- [ ] A landing view exists using the same docs/DESIGN.md tokens as the app, explaining the game
      and linking to play.
- [ ] The landing page has a generated favicon and a designed wordmark treatment — not the
      default globe icon or the heading font used plain.

### [ ] 4.2 Static build deploys cleanly to a subpath
- [ ] `npm run build` outputs a self-contained bundle using only relative asset paths (no
      leading-`/` references in the built HTML/CSS/JS).
- [ ] The built bundle is manually verified to run correctly when served from a non-root
      subpath, noted in the QA pass.

### [ ] 4.3 Physics test coverage stays green in CI
- [ ] `npm test` and `npm run lint` run in CI on every push and pull request and must pass
      before the change is considered ship-ready.
- [ ] Every public function in the physics core (vector, integrator, trajectory) has at least
      one unit test.
