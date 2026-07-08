import { describe, expect, it } from "vitest";
import { add, distance, length, normalize, scale, sub } from "../src/core/vector.js";

describe("vector", () => {
  it("adds two vectors component-wise", () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it("subtracts two vectors component-wise", () => {
    expect(sub({ x: 5, y: 1 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 0 });
  });

  it("scales a vector by a scalar", () => {
    expect(scale({ x: 2, y: -3 }, 2)).toEqual({ x: 4, y: -6 });
  });

  it("computes vector length", () => {
    expect(length({ x: 3, y: 4 })).toBe(5);
  });

  it("normalizes a vector to unit length", () => {
    const n = normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
  });

  it("normalize of the zero vector is the zero vector", () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it("computes distance between two points", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
