// Renders game state into the HUD panel. Kept as plain DOM string
// interpolation rather than a framework — the HUD is a handful of read-only
// fields, not worth a rendering library.
export function renderHud(hudEl, { shots, par, status }) {
  hudEl.innerHTML = `
    <dl class="hud-stats">
      <div><dt>Shots</dt><dd>${shots}</dd></div>
      <div><dt>Par</dt><dd>${par}</dd></div>
      <div><dt>Status</dt><dd>${status}</dd></div>
    </dl>
    <p class="hud-hint">Drag from the probe to aim. Release to launch.</p>
  `;
}
