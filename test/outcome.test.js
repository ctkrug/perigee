import { describe, expect, it } from "vitest";
import { resolveShotOutcome } from "../src/core/outcome.js";

const bounds = { minX: -100, maxX: 100, minY: -100, maxY: 100 };
const goal = { position: { x: 50, y: 0 }, radius: 10 };
const planet = { position: { x: -50, y: 0 }, radius: 8 };

function probeAt(x, y, radius = 2) {
  return { position: { x, y }, velocity: { x: 0, y: 0 }, radius };
}

describe("resolveShotOutcome", () => {
  it("returns null mid-flight, away from the goal, planets, and bounds", () => {
    expect(resolveShotOutcome(probeAt(0, 0), goal, [planet], bounds)).toBeNull();
  });

  it("returns 'Goal reached' inside the goal radius", () => {
    expect(resolveShotOutcome(probeAt(50, 0), goal, [planet], bounds)).toBe("Goal reached");
  });

  it("returns 'Goal reached' exactly at the goal radius boundary", () => {
    expect(resolveShotOutcome(probeAt(60, 0), goal, [planet], bounds)).toBe("Goal reached");
  });

  it("returns null just outside the goal radius", () => {
    expect(resolveShotOutcome(probeAt(60.5, 0), goal, [planet], bounds)).toBeNull();
  });

  it("returns 'Crashed' when overlapping a planet's surface", () => {
    expect(resolveShotOutcome(probeAt(-50, 0), goal, [planet], bounds)).toBe("Crashed");
  });

  it("returns null just outside a planet's surface", () => {
    // planet.radius(8) + probe.radius(2) = 10; 10.5 away is clear.
    expect(resolveShotOutcome(probeAt(-50 + 10.5, 0), goal, [planet], bounds)).toBeNull();
  });

  it("returns 'Missed' once outside the world bounds", () => {
    expect(resolveShotOutcome(probeAt(150, 0), goal, [planet], bounds)).toBe("Missed");
  });

  it("checks all four bounds edges", () => {
    expect(resolveShotOutcome(probeAt(-150, 0), goal, [planet], bounds)).toBe("Missed");
    expect(resolveShotOutcome(probeAt(0, 150), goal, [planet], bounds)).toBe("Missed");
    expect(resolveShotOutcome(probeAt(0, -150), goal, [planet], bounds)).toBe("Missed");
  });

  it("prioritizes the goal over a simultaneous planet collision", () => {
    const overlappingGoal = { position: { x: -50, y: 0 }, radius: 20 };
    expect(resolveShotOutcome(probeAt(-50, 0), overlappingGoal, [planet], bounds)).toBe("Goal reached");
  });

  it("prioritizes a crash over being simultaneously out of bounds", () => {
    const edgePlanet = { position: { x: 100, y: 0 }, radius: 8 };
    expect(resolveShotOutcome(probeAt(105, 0), goal, [edgePlanet], bounds)).toBe("Crashed");
  });

  it("checks every planet in a multi-planet level, not just the first", () => {
    const farPlanet = { position: { x: 0, y: 90 }, radius: 5 };
    expect(resolveShotOutcome(probeAt(0, 90), goal, [planet, farPlanet], bounds)).toBe("Crashed");
  });
});
