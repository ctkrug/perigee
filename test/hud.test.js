import { describe, expect, it } from "vitest";
import { renderHud } from "../src/game/hud.js";

// A duck-typed stand-in for the real HUD <div> — renderHud only ever reads
// dataset and writes innerHTML, so a plain object avoids pulling in jsdom.
function fakeHudEl() {
  return { dataset: {}, innerHTML: "" };
}

describe("renderHud", () => {
  it("writes shots, par, and status into the HUD", () => {
    const el = fakeHudEl();
    renderHud(el, { shots: 2, par: 3, status: "Flying" });
    expect(el.innerHTML).toContain("2");
    expect(el.innerHTML).toContain("3");
    expect(el.innerHTML).toContain("Flying");
  });

  it("skips re-rendering when shots/par/status are unchanged", () => {
    const el = fakeHudEl();
    renderHud(el, { shots: 0, par: 2, status: "Ready" });
    const firstRender = el.innerHTML;
    el.innerHTML = "sentinel";
    renderHud(el, { shots: 0, par: 2, status: "Ready" });
    expect(el.innerHTML).toBe("sentinel");
    expect(firstRender).not.toBe("sentinel");
  });

  it("re-renders as soon as any field changes", () => {
    const el = fakeHudEl();
    renderHud(el, { shots: 0, par: 2, status: "Ready" });
    renderHud(el, { shots: 1, par: 2, status: "Flying" });
    expect(el.innerHTML).toContain("Flying");
  });
});
