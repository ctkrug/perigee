import { describe, expect, it } from "vitest";
import { flashAlpha, pulseScale, shakeOffset } from "../src/game/effects.js";

describe("shakeOffset", () => {
  it("is zero before the effect starts", () => {
    expect(shakeOffset(-5)).toEqual({ x: 0, y: 0 });
  });

  it("is non-zero partway through the effect", () => {
    const offset = shakeOffset(50);
    expect(offset.x !== 0 || offset.y !== 0).toBe(true);
  });

  it("decays to zero once the duration has elapsed", () => {
    expect(shakeOffset(1000)).toEqual({ x: 0, y: 0 });
  });

  it("is suppressed entirely when reduced motion is requested", () => {
    expect(shakeOffset(50, true)).toEqual({ x: 0, y: 0 });
  });
});

describe("flashAlpha", () => {
  it("starts at full brightness", () => {
    expect(flashAlpha(0)).toBe(1);
  });

  it("fades linearly toward zero", () => {
    const early = flashAlpha(10);
    const late = flashAlpha(150);
    expect(early).toBeGreaterThan(late);
  });

  it("is zero once the flash has finished", () => {
    expect(flashAlpha(9999)).toBe(0);
  });

  it("is zero before the effect starts", () => {
    expect(flashAlpha(-1)).toBe(0);
  });
});

describe("pulseScale", () => {
  it("rests at 1 before the pulse starts", () => {
    expect(pulseScale(-1)).toBe(1);
  });

  it("grows above 1 mid-pulse", () => {
    expect(pulseScale(130)).toBeGreaterThan(1);
  });

  it("settles back to 1 once the pulse has finished", () => {
    expect(pulseScale(9999)).toBe(1);
  });
});
