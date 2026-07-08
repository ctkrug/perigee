// Perigee's entire control scheme is one gesture: drag from the probe to
// set an aim vector, release to launch. This module only reports pointer
// state via callbacks — it has no opinion on physics or rendering.
export function attachAimInput(canvas, { onAimStart, onAimMove, onLaunch, onAimCancel }) {
  let dragging = false;

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

  canvas.addEventListener("pointerdown", handleDown);
  canvas.addEventListener("pointermove", handleMove);
  canvas.addEventListener("pointerup", handleUp);
  canvas.addEventListener("pointercancel", handleCancel);

  return function detach() {
    canvas.removeEventListener("pointerdown", handleDown);
    canvas.removeEventListener("pointermove", handleMove);
    canvas.removeEventListener("pointerup", handleUp);
    canvas.removeEventListener("pointercancel", handleCancel);
  };
}
