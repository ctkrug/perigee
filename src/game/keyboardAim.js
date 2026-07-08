// Pure aim-state math for the keyboard control scheme: arrow keys rotate an
// angle and adjust a power scalar, mirroring what a pointer drag's angle and
// distance would produce. Kept free of DOM so it can be unit tested directly;
// input.js wires it to keydown events and main.js turns the result into a
// launch velocity exactly like a pointer-driven shot.
const TWO_PI = Math.PI * 2;

export const AIM_ANGLE_STEP = Math.PI / 24; // 7.5° per key press
export const AIM_POWER_STEP = 8;
export const AIM_POWER_MIN = 8;
export const AIM_POWER_MAX = 400;

function wrapAngle(angle) {
  const wrapped = angle % TWO_PI;
  return wrapped < 0 ? wrapped + TWO_PI : wrapped;
}

function clampPower(power) {
  return Math.min(AIM_POWER_MAX, Math.max(AIM_POWER_MIN, power));
}

// Returns the next aim state for a key, or the same state if the key isn't
// one of the four aim keys (callers should only invoke this for those keys).
export function stepAimState(state, key) {
  switch (key) {
    case "ArrowLeft":
      return { ...state, angle: wrapAngle(state.angle - AIM_ANGLE_STEP) };
    case "ArrowRight":
      return { ...state, angle: wrapAngle(state.angle + AIM_ANGLE_STEP) };
    case "ArrowUp":
      return { ...state, power: clampPower(state.power + AIM_POWER_STEP) };
    case "ArrowDown":
      return { ...state, power: clampPower(state.power - AIM_POWER_STEP) };
    default:
      return state;
  }
}

export function velocityFromAim({ angle, power }) {
  return { x: Math.cos(angle) * power, y: Math.sin(angle) * power };
}

// A reasonable starting aim: pointed from `from` toward `to` at a moderate
// power, so opening keyboard aim already suggests a plausible shot rather
// than an arbitrary default like "straight right".
export function initialAimState(from, to) {
  return {
    angle: Math.atan2(to.y - from.y, to.x - from.x),
    power: 150,
  };
}
