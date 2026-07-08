import { beforeEach, describe, expect, it } from "vitest";
import { createAudioEngine } from "../src/game/audio.js";

// The audio engine reads `window`/`localStorage` as ambient globals rather
// than injected dependencies (it's meant to be dropped into a page, not a
// framework). Stubbing both lets these tests run under plain Node without
// pulling in a DOM environment.
function stubBrowserGlobals({ withAudioContext = false } = {}) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
  globalThis.window = withAudioContext ? { AudioContext: class {} } : {};
}

beforeEach(() => {
  stubBrowserGlobals();
});

describe("createAudioEngine — mute persistence", () => {
  it("defaults to unmuted when localStorage has no stored value", () => {
    expect(createAudioEngine().isMuted()).toBe(false);
  });

  it("starts muted if localStorage already has the mute flag set", () => {
    globalThis.localStorage.setItem("perigee:muted", "true");
    expect(createAudioEngine().isMuted()).toBe(true);
  });

  it("persists a mute toggle to localStorage for the next session", () => {
    const engine = createAudioEngine();
    engine.setMuted(true);
    expect(globalThis.localStorage.getItem("perigee:muted")).toBe("true");

    const reloaded = createAudioEngine();
    expect(reloaded.isMuted()).toBe(true);
  });
});

describe("createAudioEngine — no AudioContext available", () => {
  it("never throws when playing sounds without a WebAudio implementation", () => {
    const engine = createAudioEngine();
    expect(() => {
      engine.unlock();
      engine.playLaunch();
      engine.playCollision();
      engine.playGoal();
      engine.playUiClick();
    }).not.toThrow();
  });
});
