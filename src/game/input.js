import { stepAimState, velocityFromAim } from "./keyboardAim.js";

const AIM_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

// Perigee's control scheme is one gesture — drag from the probe to set an
// aim vector, release to launch — with a keyboard equivalent for players
// who can't use a pointer: arrow keys rotate/power the same aim vector,
// Enter or Space launches it, Escape cancels. This module only reports
// input state via callbacks; it has no opinion on physics or rendering.
// Pointer callbacks receive a screen-space point; keyboard callbacks
// receive a world-space velocity directly (via keyboardAim.js) and a
// `{ fromKeyboard: true }` meta argument so main.js can tell them apart.
export function attachAimInput(canvas, { onAimStart, onAimMove, onLaunch, onAimCancel, getInitialAim }) {
  let dragging = false;
  let keyAiming = false;
  let keyState = null;

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handleDown(event) {
    dragging = true;
    canvas.setPointerCapture(event.pointerId);
    onAimStart(pointFromEvent(event));
  }

  function handleMove(event) {
    if (!dragging) return;
    onAimMove(pointFromEvent(event));
  }

  function handleUp(event) {
    if (!dragging) return;
    dragging = false;
    onLaunch(pointFromEvent(event));
  }

  function handleCancel() {
    if (!dragging) return;
    dragging = false;
    onAimCancel?.();
  }

  function endKeyAim() {
    keyAiming = false;
    keyState = null;
  }

  function handleKeyDown(event) {
    if (dragging) return;

    if (event.key === "Escape") {
      if (!keyAiming) return;
      endKeyAim();
      onAimCancel?.();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      // Always suppress the native behavior (Space scrolls the page) even
      // when there's no aim in progress to launch — the canvas has focus,
      // so nothing else should react to these keys while it does.
      event.preventDefault();
      if (!keyAiming) return;
      const velocity = velocityFromAim(keyState);
      endKeyAim();
      onLaunch(velocity, { fromKeyboard: true });
      return;
    }

    if (!AIM_KEYS.has(event.key)) return;
    event.preventDefault();

    if (!keyAiming) {
      keyAiming = true;
      keyState = getInitialAim ? getInitialAim() : { angle: 0, power: 150 };
      onAimStart(null, { fromKeyboard: true });
    }
    keyState = stepAimState(keyState, event.key);
    onAimMove(velocityFromAim(keyState), { fromKeyboard: true });
  }

  canvas.addEventListener("pointerdown", handleDown);
  canvas.addEventListener("pointermove", handleMove);
  canvas.addEventListener("pointerup", handleUp);
  canvas.addEventListener("pointercancel", handleCancel);
  canvas.addEventListener("keydown", handleKeyDown);

  return function detach() {
    canvas.removeEventListener("pointerdown", handleDown);
    canvas.removeEventListener("pointermove", handleMove);
    canvas.removeEventListener("pointerup", handleUp);
    canvas.removeEventListener("pointercancel", handleCancel);
    canvas.removeEventListener("keydown", handleKeyDown);
  };
}
