import { describe, expect, it } from "vitest";
import { screenToWorld, worldToScreen } from "../src/game/renderer.js";

// worldToScreen/screenToWorld are pure coordinate math with no canvas
// dependency — they just happen to live alongside drawScene(), which is why
// they'd otherwise go untested along with the rest of renderer.js's DOM
// wiring. Both main.js's aim-vector conversion and the ghost-path renderer
// depend on this math being exactly inverse.
describe("worldToScreen / screenToWorld", () => {
  const view = { width: 800, height: 600, scale: 2 };

  it("maps the world origin to the screen center", () => {
    expect(worldToScreen({ x: 0, y: 0 }, view)).toEqual({ x: 400, y: 300 });
  });

  it("maps the screen center back to the world origin", () => {
    expect(screenToWorld({ x: 400, y: 300 }, view)).toEqual({ x: 0, y: 0 });
  });

  it("scales a world offset by view.scale when projecting to screen", () => {
    expect(worldToScreen({ x: 10, y: -5 }, view)).toEqual({ x: 420, y: 290 });
  });

  it("round-trips an arbitrary point through both conversions", () => {
    const worldPoint = { x: 37.5, y: -122.25 };
    const screenPoint = worldToScreen(worldPoint, view);
    expect(screenToWorld(screenPoint, view)).toEqual(worldPoint);
  });

  it("is a strict inverse pair at a non-uniform scale and offset viewport", () => {
    const oddView = { width: 391, height: 845, scale: 0.73 };
    const screenPoint = { x: 12, y: 900 };
    const worldPoint = screenToWorld(screenPoint, oddView);
    const roundTripped = worldToScreen(worldPoint, oddView);
    expect(roundTripped.x).toBeCloseTo(screenPoint.x);
    expect(roundTripped.y).toBeCloseTo(screenPoint.y);
  });
});
