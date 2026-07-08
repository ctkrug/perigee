import { describe, expect, it } from "vitest";
import { acceleration, step, surfaceDistance, DEFAULT_G } from "../src/core/integrator.js";

describe("acceleration", () => {
  it("is zero with no planets", () => {
    const a = acceleration({ x: 0, y: 0 }, []);
    expect(a).toEqual({ x: 0, y: 0 });
  });

  it("pulls toward a single planet along the line between them", () => {
    const planet = { position: { x: 100, y: 0 }, mass: 500 };
    const a = acceleration({ x: 0, y: 0 }, [planet]);
    expect(a.x).toBeGreaterThan(0);
    expect(a.y).toBeCloseTo(0);
  });

  it("sums pull from multiple planets", () => {
    const left = { position: { x: -100, y: 0 }, mass: 500 };
    const right = { position: { x: 100, y: 0 }, mass: 500 };
    const a = acceleration({ x: 0, y: 0 }, [left, right]);
    expect(a.x).toBeCloseTo(0);
    expect(a.y).toBeCloseTo(0);
  });
});

describe("step", () => {
  it("moves a probe with no gravity in a straight line", () => {
    const probe = { position: { x: 0, y: 0 }, velocity: { x: 10, y: 0 }, radius: 4 };
    const next = step(probe, [], 1);
    expect(next.position).toEqual({ x: 10, y: 0 });
    expect(next.velocity).toEqual({ x: 10, y: 0 });
  });

  it("curves a probe's path toward a nearby planet", () => {
    const planet = { position: { x: 0, y: 200 }, mass: 2000, radius: 20 };
    let probe = { position: { x: -200, y: 0 }, velocity: { x: 20, y: 0 }, radius: 4 };
    for (let i = 0; i < 30; i += 1) {
      probe = step(probe, [planet], 0.5, DEFAULT_G);
    }
    // Gravity should have pulled the probe's velocity off its original
    // straight-line heading (vy started at 0).
    expect(Math.abs(probe.velocity.y)).toBeGreaterThan(0);
  });

  it("conserves speed roughly across many steps in a single-planet orbit", () => {
    // A near-circular orbit should keep speed within a small band even
    // after many integration steps, which is the practical signature of
    // velocity-Verlet's energy stability for this game's purposes.
    const planet = { position: { x: 0, y: 0 }, mass: 4000, radius: 10 };
    const r = 150;
    const v = Math.sqrt((DEFAULT_G * planet.mass) / r);
    let probe = { position: { x: r, y: 0 }, velocity: { x: 0, y: v }, radius: 2 };
    const speeds = [];
    for (let i = 0; i < 200; i += 1) {
      probe = step(probe, [planet], 0.05, DEFAULT_G);
      speeds.push(Math.hypot(probe.velocity.x, probe.velocity.y));
    }
    const min = Math.min(...speeds);
    const max = Math.max(...speeds);
    expect(max / min).toBeLessThan(1.15);
  });
});

describe("surfaceDistance", () => {
  it("is positive when the probe is clear of the planet", () => {
    const planet = { position: { x: 0, y: 0 }, mass: 100, radius: 10 };
    const probe = { position: { x: 50, y: 0 }, velocity: { x: 0, y: 0 }, radius: 2 };
    expect(surfaceDistance(probe, planet)).toBeCloseTo(38);
  });

  it("is zero or negative once the probe has crashed", () => {
    const planet = { position: { x: 0, y: 0 }, mass: 100, radius: 10 };
    const probe = { position: { x: 5, y: 0 }, velocity: { x: 0, y: 0 }, radius: 2 };
    expect(surfaceDistance(probe, planet)).toBeLessThanOrEqual(0);
  });
});
