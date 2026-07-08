import { describe, expect, it } from "vitest";
import { createPlanet, createProbe } from "../src/core/body.js";

describe("createPlanet", () => {
  it("builds a static body from position, mass, and radius", () => {
    const planet = createPlanet({ position: { x: 10, y: -5 }, mass: 4000, radius: 20 });
    expect(planet).toEqual({ position: { x: 10, y: -5 }, mass: 4000, radius: 20 });
  });
});

describe("createProbe", () => {
  it("builds a moving body from position and velocity", () => {
    const probe = createProbe({ position: { x: 0, y: 0 }, velocity: { x: 5, y: -5 } });
    expect(probe.position).toEqual({ x: 0, y: 0 });
    expect(probe.velocity).toEqual({ x: 5, y: -5 });
  });

  it("defaults radius to 4 when not provided", () => {
    const probe = createProbe({ position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } });
    expect(probe.radius).toBe(4);
  });

  it("honors an explicit radius override", () => {
    const probe = createProbe({ position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, radius: 9 });
    expect(probe.radius).toBe(9);
  });
});
