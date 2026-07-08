// Pure, time-sampled feedback curves for impact/goal juice. Kept free of
// timers or DOM so the renderer just asks "how much effect right now" each
// frame, and the curves themselves are unit-testable without a canvas.

const SHAKE_DURATION_MS = 220;
const SHAKE_MAGNITUDE = 8;
const FLASH_DURATION_MS = 180;
const PULSE_DURATION_MS = 260;

// A decaying oscillation for camera shake on planet collision. Returns a
// zero offset once the effect has finished, before it started, or when
// reduced motion is requested.
export function shakeOffset(elapsedMs, reduceMotion = false) {
  if (reduceMotion || elapsedMs < 0 || elapsedMs >= SHAKE_DURATION_MS) return { x: 0, y: 0 };

  const t = elapsedMs / SHAKE_DURATION_MS;
  const decay = 1 - t;
  const angle = t * Math.PI * 10;
  return {
    x: Math.sin(angle) * SHAKE_MAGNITUDE * decay,
    y: Math.cos(angle * 1.3) * SHAKE_MAGNITUDE * decay,
  };
}

// Linear fade from full brightness to zero for the impact flash.
export function flashAlpha(elapsedMs) {
  if (elapsedMs < 0 || elapsedMs >= FLASH_DURATION_MS) return 0;
  return 1 - elapsedMs / FLASH_DURATION_MS;
}

// A single grow-then-settle pulse for the goal ring, peaking mid-duration
// and returning to its resting scale of 1.
export function pulseScale(elapsedMs) {
  if (elapsedMs < 0 || elapsedMs >= PULSE_DURATION_MS) return 1;
  const t = elapsedMs / PULSE_DURATION_MS;
  return 1 + Math.sin(t * Math.PI) * 0.6;
}
