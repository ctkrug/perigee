import { step, surfaceDistance } from "./integrator.js";

// Simulates a probe forward without mutating game state, so the drag-to-aim
// UI can render a "ghost path" before the player commits to a shot. Stops
// early on a planet collision or once the path leaves the level bounds —
// there's no point predicting a trajectory the player will never see fly.
export function predict(probe, planets, { dt, steps, bounds }) {
  const path = [{ x: probe.position.x, y: probe.position.y }];
  let current = probe;

  for (let i = 0; i < steps; i += 1) {
    current = step(current, planets, dt);
    path.push({ x: current.position.x, y: current.position.y });

    const collided = planets.some((planet) => surfaceDistance(current, planet) <= 0);
    if (collided) break;

    if (bounds) {
      const { x, y } = current.position;
      if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) break;
    }
  }

  return path;
}
