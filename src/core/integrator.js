import { add, distance, scale } from "./vector.js";

// Newton's gravitational constant, in game units rather than SI — tuned per
// level design, not real-world physics, so orbits happen on a scale players
// can see and steer through in a few seconds.
export const DEFAULT_G = 6000;

// Softens the 1/r^2 singularity as the probe approaches a planet's center,
// so a close pass produces a sharp but finite slingshot instead of the
// probe's velocity blowing up.
const SOFTENING = 4;

export function acceleration(position, planets, G = DEFAULT_G) {
  let ax = 0;
  let ay = 0;
  for (const planet of planets) {
    const dx = planet.position.x - position.x;
    const dy = planet.position.y - position.y;
    const distSq = dx * dx + dy * dy + SOFTENING * SOFTENING;
    const dist = Math.sqrt(distSq);
    const strength = (G * planet.mass) / (distSq * dist);
    ax += dx * strength;
    ay += dy * strength;
  }
  return { x: ax, y: ay };
}

// Advances a probe one step using velocity-Verlet integration, which is
// symmetric and energy-stable — critical here, since a slow energy drift
// would make a slingshot look subtly wrong even at a fixed level layout.
export function step(probe, planets, dt, G = DEFAULT_G) {
  const a0 = acceleration(probe.position, planets, G);
  const nextPosition = add(add(probe.position, scale(probe.velocity, dt)), scale(a0, 0.5 * dt * dt));
  const a1 = acceleration(nextPosition, planets, G);
  const nextVelocity = add(probe.velocity, scale(add(a0, a1), 0.5 * dt));
  return {
    position: nextPosition,
    velocity: nextVelocity,
    radius: probe.radius,
  };
}

// Distance from the probe's center to a planet's surface, negative once the
// probe has crashed into it.
export function surfaceDistance(probe, planet) {
  return distance(probe.position, planet.position) - planet.radius - probe.radius;
}
