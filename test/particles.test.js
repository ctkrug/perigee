import { describe, expect, it } from "vitest";
import { createBurst } from "../src/game/particles.js";

describe("createBurst", () => {
  it("generates the requested particle count", () => {
    expect(createBurst(16, () => 0)).toHaveLength(16);
    expect(createBurst(0, () => 0)).toHaveLength(0);
    expect(createBurst(1, () => 0)).toHaveLength(1);
  });

  it("defaults to a 16-particle burst", () => {
    expect(createBurst()).toHaveLength(16);
  });

  it("keeps every particle's travel distance within the designed range", () => {
    const particles = createBurst(24);
    for (const particle of particles) {
      expect(particle.distance).toBeGreaterThanOrEqual(60);
      expect(particle.distance).toBeLessThanOrEqual(120);
      expect(particle.delayMs).toBeGreaterThanOrEqual(0);
      expect(particle.delayMs).toBeLessThanOrEqual(80);
    }
  });

  it("derives dx/dy from angle and distance deterministically for a fixed random source", () => {
    const particles = createBurst(4, () => 0);
    expect(particles[0]).toEqual({ angle: 0, distance: 60, dx: 60, dy: 0, delayMs: 0 });
  });

  it("spreads particles around the full circle rather than clustering", () => {
    const particles = createBurst(8, () => 0);
    const angles = particles.map((p) => p.angle);
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(Math.PI);
  });
});
