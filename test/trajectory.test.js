import { describe, expect, it } from "vitest";
import { predict } from "../src/core/trajectory.js";

describe("predict", () => {
  it("returns a straight-line path with no planets", () => {
    const probe = { position: { x: 0, y: 0 }, velocity: { x: 10, y: 0 }, radius: 2 };
    const path = predict(probe, [], { dt: 1, steps: 5 });
    expect(path).toHaveLength(6);
    expect(path[5]).toEqual({ x: 50, y: 0 });
  });

  it("stops early on a planet collision", () => {
    const planet = { position: { x: 30, y: 0 }, mass: 100, radius: 10 };
    const probe = { position: { x: 0, y: 0 }, velocity: { x: 5, y: 0 }, radius: 2 };
    const path = predict(probe, [planet], { dt: 0.05, steps: 200 });
    expect(path.length).toBeLessThan(201);
  });

  it("stops early once the path leaves the level bounds", () => {
    const probe = { position: { x: 0, y: 0 }, velocity: { x: 100, y: 0 }, radius: 2 };
    const bounds = { minX: -50, maxX: 50, minY: -50, maxY: 50 };
    const path = predict(probe, [], { dt: 1, steps: 20, bounds });
    expect(path.length).toBeLessThan(21);
  });
});
