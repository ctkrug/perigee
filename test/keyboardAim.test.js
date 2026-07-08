import { describe, expect, it } from "vitest";
import {
  AIM_POWER_MAX,
  AIM_POWER_MIN,
  initialAimState,
  stepAimState,
  velocityFromAim,
} from "../src/game/keyboardAim.js";

describe("stepAimState", () => {
  it("rotates the angle left and right", () => {
    const start = { angle: 0, power: 100 };
    const left = stepAimState(start, "ArrowLeft");
    const right = stepAimState(start, "ArrowRight");
    expect(left.angle).toBeCloseTo(Math.PI * 2 - Math.PI / 24);
    expect(right.angle).toBeCloseTo(Math.PI / 24);
  });

  it("wraps the angle into [0, 2π) rather than drifting unbounded", () => {
    const next = stepAimState({ angle: 0, power: 100 }, "ArrowLeft");
    expect(next.angle).toBeGreaterThanOrEqual(0);
    expect(next.angle).toBeLessThan(Math.PI * 2);
  });

  it("increases and decreases power within bounds", () => {
    const start = { angle: 0, power: 100 };
    expect(stepAimState(start, "ArrowUp").power).toBe(108);
    expect(stepAimState(start, "ArrowDown").power).toBe(92);
  });

  it("clamps power at the minimum", () => {
    const next = stepAimState({ angle: 0, power: AIM_POWER_MIN }, "ArrowDown");
    expect(next.power).toBe(AIM_POWER_MIN);
  });

  it("clamps power at the maximum", () => {
    const next = stepAimState({ angle: 0, power: AIM_POWER_MAX }, "ArrowUp");
    expect(next.power).toBe(AIM_POWER_MAX);
  });

  it("leaves state unchanged for an unrecognized key", () => {
    const start = { angle: 1, power: 50 };
    expect(stepAimState(start, "Tab")).toEqual(start);
  });
});

describe("velocityFromAim", () => {
  it("converts angle 0 into a pure rightward velocity", () => {
    expect(velocityFromAim({ angle: 0, power: 100 })).toEqual({ x: 100, y: 0 });
  });

  it("converts a downward angle into a pure positive-y velocity", () => {
    const { x, y } = velocityFromAim({ angle: Math.PI / 2, power: 50 });
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(50);
  });
});

describe("initialAimState", () => {
  it("points from the start position toward the target", () => {
    const state = initialAimState({ x: 0, y: 0 }, { x: 10, y: 10 });
    expect(state.angle).toBeCloseTo(Math.PI / 4);
    expect(state.power).toBeGreaterThan(0);
  });
});
