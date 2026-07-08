# Perigee

Aim once. Then watch physics do the flying.

Perigee is a daily gravity-slingshot puzzle. Each level drops your probe next to a
handful of planets and a target. Drag out an aim vector, release, and a real n-body
gravitational simulation takes over — your probe curves, whips around planets, and
either threads the goal or drifts off into the dark. There's no thrust, no steering,
no second input. Read the gravity well correctly and you clip the target in one
clean arc. Misjudge it and you watch, in real time, exactly why.

## Why

Most "physics puzzle" games either fake the physics (canned animations dressed up as
simulation) or hide it behind an open sandbox with no real objective. Perigee does
neither: the trajectory on screen is the actual output of integrating Newtonian
gravity from every body in the level, live, every frame — including while you're
still aiming, as a predicted ghost path. The puzzle is reading that prediction
correctly, not fighting an opaque black box. And it's daily and bite-sized: one
hand-designed level a day, a par shot count, a shareable result — pick it up in
thirty seconds, not an evening.

## Planned features

- **Real n-body gravity.** Velocity-Verlet integration over every planet in a level;
  no scripted paths, no fudged "close enough" curves.
- **Live trajectory prediction.** While you're dragging the aim vector, a ghost path
  simulates forward so you can see the slingshot before you commit to it.
- **Hand-designed daily levels.** One puzzle a day, seeded and shared by everyone,
  each built around a specific gravity-assist idea (a slingshot, a stable capture, a
  threading-the-needle pass between two wells).
- **Par and share.** Every level has a par shot count; finishing produces a compact,
  shareable result string — no spoilers, just your line.
- **A control scheme with exactly one input.** Drag to aim, release to launch. The
  challenge is entirely in reading the gravity, never in execution skill.

## Stack

- Vanilla JavaScript + HTML5 Canvas — no rendering framework, so the simulation and
  the draw loop stay close together and fast.
- [Vite](https://vitejs.dev/) for local dev and static production builds.
- [Vitest](https://vitest.dev/) for unit tests on the physics core.
- Ships as a static site (`dist/`) — no server, no backend, deployable anywhere.

## Status

Early scaffold. See [`docs/VISION.md`](docs/VISION.md) for the full design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # run the physics unit tests
npm run build    # production build to dist/
```

## License

MIT — see [LICENSE](LICENSE).
