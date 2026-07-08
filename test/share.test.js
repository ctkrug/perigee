import { describe, expect, it } from "vitest";
import { buildShareString, formatDateForShare } from "../src/game/share.js";

describe("formatDateForShare", () => {
  it("formats a date as YYYY-MM-DD in UTC", () => {
    expect(formatDateForShare(new Date("2026-07-08T23:59:00Z"))).toBe("2026-07-08");
  });
});

describe("buildShareString", () => {
  it("includes the date, shot count, and par with pluralized 'shots'", () => {
    const result = buildShareString({ date: new Date("2026-07-08T00:00:00Z"), shots: 3, par: 2 });
    expect(result).toBe("Perigee 2026-07-08 — 3 shots (par 2)");
  });

  it("uses singular 'shot' for exactly one shot", () => {
    const result = buildShareString({ date: new Date("2026-07-08T00:00:00Z"), shots: 1, par: 2 });
    expect(result).toBe("Perigee 2026-07-08 — 1 shot (par 2)");
  });

  it("never includes level ids or planet data — no solution spoilers", () => {
    const result = buildShareString({ date: new Date("2026-07-08T00:00:00Z"), shots: 5, par: 1 });
    expect(result).not.toMatch(/slingshot|planet|threading|capture/i);
  });
});
