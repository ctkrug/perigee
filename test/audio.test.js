import { beforeEach, describe, expect, it } from "vitest";
import { createAudioEngine } from "../src/game/audio.js";

// The audio engine reads `window`/`localStorage` as ambient globals rather
// than injected dependencies (it's meant to be dropped into a page, not a
// framework). Stubbing both lets these tests run under plain Node without
// pulling in a DOM environment.
// A minimal fake implementing just enough of the AudioContext/Oscillator/
// Gain surface for audio.js's tone() to run end to end, recording every
// call so tests can assert on what would have been played.
class FakeGainParam {
  constructor() {
    this.value = null;
    this.rampedTo = [];
  }
  exponentialRampToValueAtTime(value, time) {
    this.rampedTo.push({ value, time });
  }
}

class FakeAudioNode {
  connect(target) {
    this.connectedTo = target;
  }
}

class FakeOscillator extends FakeAudioNode {
  constructor() {
    super();
    this.frequency = { value: null };
    this.started = false;
    this.stoppedAt = null;
  }
  start() {
    this.started = true;
  }
  stop(time) {
    this.stoppedAt = time;
  }
}

class FakeGainNode extends FakeAudioNode {
  constructor() {
    super();
    this.gain = new FakeGainParam();
  }
}

// Instances register themselves here so tests can inspect what a
// closure-private `ctx` inside the engine actually did, without the engine
// needing to expose it.
let audioContextInstances = [];

class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
    this.resumed = false;
    this.oscillators = [];
    audioContextInstances.push(this);
  }
  createOscillator() {
    const osc = new FakeOscillator();
    this.oscillators.push(osc);
    return osc;
  }
  createGain() {
    return new FakeGainNode();
  }
  resume() {
    this.resumed = true;
  }
}

function stubBrowserGlobals({ withAudioContext = false } = {}) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
  globalThis.window = withAudioContext ? { AudioContext: FakeAudioContext } : {};
  audioContextInstances = [];
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

describe("createAudioEngine — with a working AudioContext", () => {
  beforeEach(() => {
    stubBrowserGlobals({ withAudioContext: true });
  });

  it("starts and stops an oscillator with the sound's configured type/frequency", () => {
    const engine = createAudioEngine();
    engine.playLaunch();

    expect(audioContextInstances).toHaveLength(1);
    const [osc] = audioContextInstances[0].oscillators;
    expect(osc.type).toBe("sawtooth");
    expect(osc.frequency.value).toBe(220);
    expect(osc.started).toBe(true);
    expect(osc.stoppedAt).toBe(0.18);
  });

  it("connects the oscillator through a gain node to the destination", () => {
    const engine = createAudioEngine();
    engine.playGoal();

    const ctx = audioContextInstances[0];
    const [osc] = ctx.oscillators;
    expect(osc.connectedTo).toBeInstanceOf(FakeGainNode);
    expect(osc.connectedTo.connectedTo).toBe(ctx.destination);
  });

  it("resumes the audio context on unlock", () => {
    const engine = createAudioEngine();
    engine.unlock();
    expect(audioContextInstances[0].resumed).toBe(true);
  });

  it("does not create an audio context at all while muted", () => {
    const engine = createAudioEngine();
    engine.setMuted(true);
    engine.playCollision();
    expect(audioContextInstances).toHaveLength(0);
  });

  it("reuses the same context across multiple sounds instead of recreating it", () => {
    const engine = createAudioEngine();
    engine.playLaunch();
    engine.playGoal();
    engine.playUiClick();
    expect(audioContextInstances).toHaveLength(1);
    expect(audioContextInstances[0].oscillators).toHaveLength(3);
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
