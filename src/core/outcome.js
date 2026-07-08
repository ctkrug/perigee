import { distance } from "./vector.js";
import { surfaceDistance } from "./integrator.js";

// The single source of truth for "what does this instant of flight mean,"
// checked in the same goal-then-crash-then-bounds priority order every
// substep in main.js's flight loop: reaching the goal wins even if a planet
// is also technically within collision range this same substep, and a
// collision is detected before a same-substep out-of-bounds check would
// otherwise fire. Returns null while the shot is still in progress.
export function resolveShotOutcome(probe, goal, planets, bounds) {
  if (distance(probe.position, goal.position) <= goal.radius) return "Goal reached";

  if (planets.some((planet) => surfaceDistance(probe, planet) <= 0)) return "Crashed";

  const { x, y } = probe.position;
  if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) return "Missed";

  return null;
}
