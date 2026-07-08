// Renders game state into the HUD panel. Kept as plain DOM string
// interpolation rather than a framework — the HUD is a handful of read-only
// fields, not worth a rendering library. Called once per animation frame, so
// it skips the DOM write (and the aria-live announcement it would trigger)
// unless shots/par/status actually changed since the last render.
export function renderHud(hudEl, { shots, par, status }) {
  const key = `${shots}|${par}|${status}`;
  if (hudEl.dataset.renderedKey === key) return;
  hudEl.dataset.renderedKey = key;

  hudEl.innerHTML = `
    <dl class="hud-stats">
      <div><dt>Shots</dt><dd>${shots}</dd></div>
      <div><dt>Par</dt><dd>${par}</dd></div>
      <div><dt>Status</dt><dd>${status}</dd></div>
    </dl>
    <p class="hud-hint">Drag from the probe to aim. Release to launch.</p>
  `;
}
