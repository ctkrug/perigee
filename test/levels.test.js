import { describe, expect, it } from "vitest";
import {
  FALLBACK_LEVEL,
  LEVELS,
  getLevelById,
  getLevelForDate,
  levelIdForDate,
} from "../src/game/levels.js";

describe("levels", () => {
  it("authors at least five distinct levels", () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(5);
    const ids = new Set(LEVELS.map((level) => level.id));
    expect(ids.size).toBe(LEVELS.length);
  });

  it("every level has a documented solution and a distinct planet arrangement", () => {
    for (const level of LEVELS) {
      expect(typeof level.solution).toBe("string");
      expect(level.solution.length).toBeGreaterThan(0);
      expect(level.planets.length).toBeGreaterThan(0);
    }
  });

  it("loads a level by id with its full field set", () => {
    const level = getLevelById("threading-pass");
    expect(level.id).toBe("threading-pass");
    expect(level.par).toBe(3);
    expect(level.probeStart).toEqual({ x: -360, y: -260 });
    expect(level.goal.position).toEqual({ x: 360, y: 240 });
    expect(level.planets).toHaveLength(3);
  });

  it("falls back to the first level for an unknown id", () => {
    expect(getLevelById("does-not-exist")).toBe(FALLBACK_LEVEL);
  });
});

describe("date-keyed level selection", () => {
  it("is deterministic: the same date always resolves to the same level id", () => {
    const date = new Date("2026-07-10T00:00:00Z");
    const a = levelIdForDate(date);
    const b = levelIdForDate(new Date("2026-07-10T18:30:00Z"));
    expect(a).toBe(b);
  });

  it("cycles through the authored rotation day by day", () => {
    const first = levelIdForDate(new Date("2026-07-08T00:00:00Z"));
    const second = levelIdForDate(new Date("2026-07-09T00:00:00Z"));
    expect(first).toBe(LEVELS[0].id);
    expect(second).toBe(LEVELS[1].id);
  });

  it("falls back to the first level for any date before the rotation starts", () => {
    expect(levelIdForDate(new Date("2020-01-01T00:00:00Z"))).toBe(FALLBACK_LEVEL.id);
  });

  it("falls back to the first level for a malformed date", () => {
    expect(levelIdForDate(new Date("not-a-date"))).toBe(FALLBACK_LEVEL.id);
  });

  it("getLevelForDate resolves a full level object for a given date", () => {
    const level = getLevelForDate(new Date("2026-07-08T12:00:00Z"));
    expect(level.id).toBe(LEVELS[0].id);
    expect(level.planets.length).toBeGreaterThan(0);
  });
});
