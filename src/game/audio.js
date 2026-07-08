// All sound is synthesized with WebAudio oscillators/noise — zero binary
// assets. The AudioContext is created lazily on the first user gesture to
// respect browser autoplay policies, and every call is a no-op when the
// context is unavailable (e.g. under a test runner with no WebAudio).
const MUTE_KEY = "perigee:muted";

export function createAudioEngine() {
  let ctx = null;
  let muted = localStorage.getItem(MUTE_KEY) === "true";

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    ctx = new AudioContextCtor();
    return ctx;
  }

  function tone({ frequency, duration, type = "sine", gain = 0.15 }) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gainNode.gain.value = gain;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  return {
    unlock() {
      ensureContext()?.resume?.();
    },
    playLaunch() {
      tone({ frequency: 220, duration: 0.18, type: "sawtooth" });
    },
    playUiClick() {
      tone({ frequency: 880, duration: 0.05, type: "square", gain: 0.08 });
    },
    playCollision() {
      tone({ frequency: 110, duration: 0.25, type: "square", gain: 0.2 });
    },
    playGoal() {
      tone({ frequency: 660, duration: 0.3, type: "triangle" });
    },
    isMuted() {
      return muted;
    },
    setMuted(next) {
      muted = next;
      localStorage.setItem(MUTE_KEY, String(muted));
    },
  };
}
