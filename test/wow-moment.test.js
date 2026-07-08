import { describe, expect, it } from "vitest";
import { step, surfaceDistance } from "../src/core/integrator.js";
import { distance } from "../src/core/vector.js";
import { LEVELS } from "../src/game/levels.js";

// Regression test for the wow moment (BACKLOG 1.1): a shot that passes close
// to a planet must have its heading visibly redirected by gravity, not just
// nudged. This drives the physics core directly with the shipped level data
// and a known-good aim, independent of the drag-to-aim UI.
describe("wow moment — gravity visibly redirects a close flyby", () => {
  it("bends the probe's heading by more than 15 degrees on a flyby within 3x the planet's radius", () => {
    const level = LEVELS[0];
    const planet = level.planets[0];
    const start = level.probeStart;

    // Aimed to pass ~5 planet-radii off-center at a speed that produces a
    // real flyby (closest approach ~2x the planet's radius) rather than an
    // immediate crash or a distant miss.
    const toPlanet = { x: planet.position.x - start.x, y: planet.position.y - start.y };
    const towardMag = Math.hypot(toPlanet.x, toPlanet.y);
    const perp = { x: -toPlanet.y / towardMag, y: toPlanet.x / towardMag };
    const aimTarget = {
      x: planet.position.x + perp.x * planet.radius * 5,
      y: planet.position.y + perp.y * planet.radius * 5,
    };
    const aimDir = { x: aimTarget.x - start.x, y: aimTarget.y - start.y };
    const aimMag = Math.hypot(aimDir.x, aimDir.y);
    const speed = 400;
    const velocity = { x: (aimDir.x / aimMag) * speed, y: (aimDir.y / aimMag) * speed };
    const initialHeading = Math.atan2(velocity.y, velocity.x);

    let probe = { position: { ...start }, velocity, radius: 4 };
    let closestApproach = Infinity;
    let headingDuringFlyby = null;
    const dt = 1 / 360;

    for (let i = 0; i < 20000; i += 1) {
      probe = step(probe, level.planets, dt);
      const centerDistance = distance(probe.position, planet.position);
      closestApproach = Math.min(closestApproach, centerDistance);
      if (centerDistance <= planet.radius * 3 && headingDuringFlyby === null) {
        headingDuringFlyby = Math.atan2(probe.velocity.y, probe.velocity.x);
      }
      expect(surfaceDistance(probe, planet)).toBeGreaterThan(0);
      const { x, y } = probe.position;
      if (Math.abs(x) > 1000 || Math.abs(y) > 1000) break;
    }

    expect(closestApproach).toBeLessThanOrEqual(planet.radius * 3);
    expect(headingDuringFlyby).not.toBeNull();

    let headingDelta = Math.abs(headingDuringFlyby - initialHeading);
    headingDelta = Math.min(headingDelta, Math.PI * 2 - headingDelta);
    const headingDeltaDeg = (headingDelta * 180) / Math.PI;

    expect(headingDeltaDeg).toBeGreaterThan(15);
  });
});
