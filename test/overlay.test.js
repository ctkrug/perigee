import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWinOverlay } from "../src/game/overlay.js";

// overlay.js's real DOM surface is small and mechanical enough (querySelector,
// textContent, focus, addEventListener, a handful of document/window/navigator
// globals) to fake directly rather than pulling in jsdom — same approach as
// audio.js's global stubs and input.js's fake canvas.
class FakeElement {
  constructor() {
    this.textContent = "";
    this._innerHTML = "";
    this.hidden = false;
    this.dataset = {};
    this.className = "";
    this.style = { properties: {}, setProperty: (k, v) => (this.style.properties[k] = v) };
    this.children = [];
    this._listeners = new Map();
    this.focusCalls = 0;
  }
  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(value) {
    // A real `el.innerHTML = ""` discards existing child nodes; mirror that
    // so spawnParticles()'s reset-then-repopulate actually clears sparks.
    this._innerHTML = value;
    this.children = [];
  }
  addEventListener(type, handler) {
    this._listeners.set(type, handler);
  }
  click() {
    this._listeners.get("click")?.();
  }
  focus() {
    this.focusCalls += 1;
    globalThis.document.activeElement = this;
  }
  appendChild(child) {
    this.children.push(child);
  }
}

function createFakeRoot() {
  const elements = {
    "#win-shots": new FakeElement(),
    "#win-par": new FakeElement(),
    "#win-share": new FakeElement(),
    "#win-dismiss": new FakeElement(),
    ".win-particles": new FakeElement(),
  };
  return {
    hidden: true,
    querySelector: (selector) => elements[selector],
    elements,
  };
}

function setupGlobals() {
  const documentListeners = new Map();
  globalThis.document = {
    activeElement: null,
    addEventListener: (type, handler) => documentListeners.set(type, handler),
    removeEventListener: (type) => documentListeners.delete(type),
    createElement: () => new FakeElement(),
    _listeners: documentListeners,
  };
  globalThis.window = {
    setTimeout: (...args) => globalThis.setTimeout(...args),
    clearTimeout: (...args) => globalThis.clearTimeout(...args),
  };
  globalThis.navigator = { clipboard: { writeText: vi.fn(() => Promise.resolve()) } };
}

beforeEach(() => {
  setupGlobals();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createWinOverlay — show", () => {
  it("populates stats, shows the panel, and focuses the dismiss button", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    const previouslyFocused = new FakeElement();
    globalThis.document.activeElement = previouslyFocused;

    overlay.show({ shots: 3, par: 2, shareText: "Perigee 2026-07-08 — 3 shots (par 2)", reduceMotion: false, dismiss: vi.fn() });

    expect(root.elements["#win-shots"].textContent).toBe("3");
    expect(root.elements["#win-par"].textContent).toBe("2");
    expect(root.hidden).toBe(false);
    expect(root.elements["#win-dismiss"].focusCalls).toBe(1);
  });

  it("spawns particle sparks unless reduced motion is requested", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);

    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: false, dismiss: vi.fn() });
    expect(root.elements[".win-particles"].children.length).toBeGreaterThan(0);

    overlay.hide();
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    expect(root.elements[".win-particles"].children).toHaveLength(0);
  });

  it("registers a document keydown listener while open", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    expect(globalThis.document._listeners.has("keydown")).toBe(true);
  });
});

describe("createWinOverlay — dismiss paths", () => {
  it("hides the panel, restores focus, and calls dismiss on Escape", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    const previouslyFocused = new FakeElement();
    globalThis.document.activeElement = previouslyFocused;
    const dismiss = vi.fn();

    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss });
    const trapFocus = globalThis.document._listeners.get("keydown");
    const escapeEvent = { key: "Escape", preventDefault: vi.fn() };
    trapFocus(escapeEvent);

    expect(escapeEvent.preventDefault).toHaveBeenCalled();
    expect(root.hidden).toBe(true);
    expect(globalThis.document._listeners.has("keydown")).toBe(false);
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(previouslyFocused.focusCalls).toBe(1);
  });

  it("hides and calls dismiss when the dismiss button is clicked", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    const dismiss = vi.fn();
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss });

    root.elements["#win-dismiss"].click();

    expect(root.hidden).toBe(true);
    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call dismiss twice for a second Escape after hide", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    const dismiss = vi.fn();
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss });
    overlay.hide();
    overlay.hide();
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});

describe("createWinOverlay — Tab focus trap", () => {
  it("ignores keys other than Escape and Tab", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    const trapFocus = globalThis.document._listeners.get("keydown");

    const event = { key: "a", preventDefault: vi.fn() };
    trapFocus(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(root.hidden).toBe(false);
  });

  it("wraps focus from the last control back to the first on Tab", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    const trapFocus = globalThis.document._listeners.get("keydown");

    globalThis.document.activeElement = root.elements["#win-dismiss"];
    const tabEvent = { key: "Tab", shiftKey: false, preventDefault: vi.fn() };
    trapFocus(tabEvent);

    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(root.elements["#win-share"].focusCalls).toBe(1);
  });

  it("wraps focus from the first control back to the last on Shift+Tab", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    // show() already focused the dismiss button once as its initial state.
    const focusCallsAfterShow = root.elements["#win-dismiss"].focusCalls;
    const trapFocus = globalThis.document._listeners.get("keydown");

    globalThis.document.activeElement = root.elements["#win-share"];
    const tabEvent = { key: "Tab", shiftKey: true, preventDefault: vi.fn() };
    trapFocus(tabEvent);

    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(root.elements["#win-dismiss"].focusCalls).toBe(focusCallsAfterShow + 1);
  });

  it("does not intercept Tab when focus is in the middle of the trap", () => {
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });
    const trapFocus = globalThis.document._listeners.get("keydown");

    // Only two focusable controls exist, so simulate focus already having
    // left the trap (e.g. dev tools) — the two-branch wrap logic shouldn't
    // fire when activeElement is neither first nor last.
    globalThis.document.activeElement = new FakeElement();
    const tabEvent = { key: "Tab", shiftKey: false, preventDefault: vi.fn() };
    trapFocus(tabEvent);

    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
  });
});

describe("createWinOverlay — share button", () => {
  it("copies the share text and shows confirmation, then resets after a delay", async () => {
    vi.useFakeTimers();
    const root = createFakeRoot();
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "Perigee result", reduceMotion: true, dismiss: vi.fn() });

    root.elements["#win-share"].click();
    await vi.waitFor(() => expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith("Perigee result"));
    expect(root.elements["#win-share"].textContent).toBe("Copied!");

    vi.advanceTimersByTime(1500);
    expect(root.elements["#win-share"].textContent).toBe("Copy result");
  });

  it("shows a failure message when the clipboard write rejects", async () => {
    const root = createFakeRoot();
    globalThis.navigator.clipboard.writeText = vi.fn(() => Promise.reject(new Error("denied")));
    const overlay = createWinOverlay(root);
    overlay.show({ shots: 1, par: 1, shareText: "x", reduceMotion: true, dismiss: vi.fn() });

    root.elements["#win-share"].click();
    await vi.waitFor(() => expect(root.elements["#win-share"].textContent).toBe("Copy failed"));
  });

  it("copies an empty string rather than throwing if clicked with no share text set", async () => {
    const root = createFakeRoot();
    // createWinOverlay() wires the click listener immediately; clicking
    // without ever calling show() means dataset.shareText was never set.
    createWinOverlay(root);

    root.elements["#win-share"].click();
    await vi.waitFor(() => expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith(""));
  });
});
