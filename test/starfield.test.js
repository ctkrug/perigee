import { describe, expect, it } from "vitest";
import { createStarfield } from "../src/game/starfield.js";

// createStarfield is pure data generation — only drawStarfield touches a
// canvas context — so it's tested directly on its bounds/shape rather than
// exact values, since it draws from Math.random() rather than an injectable
// source.
describe("createStarfield", () => {
  it("generates the requested number of stars", () => {
    expect(createStarfield(800, 600, 50)).toHaveLength(50);
  });

  it("defaults to 140 stars when no count is given", () => {
    expect(createStarfield(800, 600)).toHaveLength(140);
  });

  it("returns no stars for a zero count", () => {
    expect(createStarfield(800, 600, 0)).toHaveLength(0);
  });

  it("places every star within the given width/height bounds", () => {
    const stars = createStarfield(200, 100, 60);
    for (const star of stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(200);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(100);
    }
  });

  it("gives every star a positive radius and an alpha within [0.3, 0.8]", () => {
    const stars = createStarfield(400, 300, 60);
    for (const star of stars) {
      expect(star.r).toBeGreaterThanOrEqual(0.3);
      expect(star.r).toBeLessThanOrEqual(1.7);
      expect(star.alpha).toBeGreaterThanOrEqual(0.3);
      expect(star.alpha).toBeLessThanOrEqual(0.8);
    }
  });
});
