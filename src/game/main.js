import { createProbe } from "../core/body.js";
import { distance } from "../core/vector.js";
import { step, surfaceDistance } from "../core/integrator.js";
import { predict } from "../core/trajectory.js";
import { getLevelForDate, WORLD_BOUNDS } from "./levels.js";
import { createStarfield } from "./starfield.js";
import { drawScene, screenToWorld, worldToScreen } from "./renderer.js";
import { attachAimInput } from "./input.js";
import { createAudioEngine } from "./audio.js";
import { renderHud } from "./hud.js";

// Pixel distance dragged, per unit of launch speed. Tuned so a drag across
// roughly a third of the canvas produces a shot that can reach across the
// level in a few seconds.
const AIM_POWER = 2.4;

// Substepping keeps the integrator stable during close planet flybys —
// a single large step per animation frame can blow past a planet's
// gravity well before a collision is ever detected.
const SUBSTEPS_PER_FRAME = 6;
const FRAME_DT = 1 / 60;

export function startGame({ canvas, hudEl, muteButton }) {
  const ctx = canvas.getContext("2d");
  const today = new Date();
  const level = getLevelForDate(today);
  const audio = createAudioEngine();

  const view = { width: 0, height: 0, scale: 1 };
  let stars = [];

  let probe = createProbe({ position: { ...level.probeStart }, velocity: { x: 0, y: 0 } });
  let gameState = "aiming";
  let shots = 0;
  let statusText = "Ready";
  let dragStart = null;
  let ghostPath = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    view.width = rect.width;
    view.height = rect.height;
    const worldWidth = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
    const worldHeight = WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY;
    view.scale = Math.min(rect.width / worldWidth, rect.height / worldHeight);

    stars = createStarfield(rect.width, rect.height);
  }

  function resetProbe() {
    probe = createProbe({ position: { ...level.probeStart }, velocity: { x: 0, y: 0 } });
    gameState = "aiming";
    ghostPath = null;
  }

  function endShot(status) {
    gameState = "ended";
    statusText = status;
    if (status === "Goal reached") audio.playGoal();
    else audio.playCollision();
    window.setTimeout(resetProbe, 1200);
  }

  function updatePhysics() {
    if (gameState !== "flying") return;
    const dt = FRAME_DT / SUBSTEPS_PER_FRAME;
    for (let i = 0; i < SUBSTEPS_PER_FRAME; i += 1) {
      probe = step(probe, level.planets, dt);

      if (distance(probe.position, level.goal.position) <= level.goal.radius) {
        endShot("Goal reached");
        return;
      }
      const crashed = level.planets.some((planet) => surfaceDistance(probe, planet) <= 0);
      if (crashed) {
        endShot("Crashed");
        return;
      }
      const { x, y } = probe.position;
      if (x < WORLD_BOUNDS.minX || x > WORLD_BOUNDS.maxX || y < WORLD_BOUNDS.minY || y > WORLD_BOUNDS.maxY) {
        endShot("Missed");
        return;
      }
    }
  }

  function render() {
    drawScene(ctx, view, { stars, level, probe, ghostPath });
    renderHud(hudEl, { shots, par: level.par, status: statusText });
  }

  function loop() {
    updatePhysics();
    render();
    requestAnimationFrame(loop);
  }

  attachAimInput(canvas, {
    onAimStart(point) {
      if (gameState !== "aiming") return;
      audio.unlock();
      dragStart = point;
    },
    onAimMove(point) {
      if (!dragStart) return;
      const probeScreen = worldToScreen(probe.position, view);
      const delta = screenToWorld({ x: point.x - probeScreen.x, y: point.y - probeScreen.y }, view);
      const velocity = { x: delta.x * AIM_POWER, y: delta.y * AIM_POWER };
      const aimedProbe = { ...probe, velocity };
      ghostPath = predict(aimedProbe, level.planets, {
        dt: FRAME_DT / SUBSTEPS_PER_FRAME,
        steps: 400,
        bounds: WORLD_BOUNDS,
      });
    },
    onLaunch(point) {
      if (!dragStart) return;
      const probeScreen = worldToScreen(probe.position, view);
      const delta = screenToWorld({ x: point.x - probeScreen.x, y: point.y - probeScreen.y }, view);
      probe = { ...probe, velocity: { x: delta.x * AIM_POWER, y: delta.y * AIM_POWER } };
      dragStart = null;
      ghostPath = null;
      shots += 1;
      statusText = "Flying";
      gameState = "flying";
      audio.playLaunch();
    },
    onAimCancel() {
      dragStart = null;
      ghostPath = null;
    },
  });

  muteButton.addEventListener("click", () => {
    audio.setMuted(!audio.isMuted());
    muteButton.setAttribute("aria-pressed", String(audio.isMuted()));
    muteButton.classList.toggle("is-muted", audio.isMuted());
    audio.playUiClick();
  });
  muteButton.setAttribute("aria-pressed", String(audio.isMuted()));
  muteButton.classList.toggle("is-muted", audio.isMuted());

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
}
