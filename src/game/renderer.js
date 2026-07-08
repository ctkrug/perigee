import { drawStarfield } from "./starfield.js";
import { flashAlpha, pulseScale, shakeOffset } from "./effects.js";

// Maps world coordinates (level space, origin at center) to canvas pixel
// coordinates, so levels can be authored independent of screen size.
export function worldToScreen(point, view) {
  return {
    x: view.width / 2 + point.x * view.scale,
    y: view.height / 2 + point.y * view.scale,
  };
}

export function screenToWorld(point, view) {
  return {
    x: (point.x - view.width / 2) / view.scale,
    y: (point.y - view.height / 2) / view.scale,
  };
}

export function drawScene(
  ctx,
  view,
  { stars, level, probe, ghostPath, trail = [], fx = {}, time = 0, reduceMotion = false },
) {
  const { width, height } = view;
  // fx.crashAt/goalAt are timestamps (ms); leaving them unset yields an
  // infinite elapsed time, which every effect curve treats as "finished."
  const crashElapsed = fx.crashAt != null ? time - fx.crashAt : Infinity;
  const goalElapsed = fx.goalAt != null ? time - fx.goalAt : Infinity;
  const shake = shakeOffset(crashElapsed, reduceMotion);

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(shake.x, shake.y);

  drawStarfield(ctx, stars);

  for (const planet of level.planets) {
    const p = worldToScreen(planet.position, view);
    const r = planet.radius * view.scale;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.6);
    gradient.addColorStop(0, "#ffb000");
    gradient.addColorStop(0.55, "#ff6b35");
    gradient.addColorStop(1, "rgba(255, 107, 53, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1f180f";
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const goal = worldToScreen(level.goal.position, view);
  const goalPulse = pulseScale(goalElapsed);
  ctx.strokeStyle = "#7fff9f";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(goal.x, goal.y, level.goal.radius * view.scale * goalPulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  if (ghostPath && ghostPath.length > 1) {
    ctx.strokeStyle = "rgba(255, 217, 160, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ghostPath.forEach((point, i) => {
      const s = worldToScreen(point, view);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let i = 0; i < trail.length; i += 1) {
    const s = worldToScreen(trail[i], view);
    const fade = (i + 1) / trail.length;
    ctx.globalAlpha = fade * 0.35;
    ctx.fillStyle = "#ffd9a0";
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(probe.radius * view.scale * fade, 1), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const p = worldToScreen(probe.position, view);
  ctx.fillStyle = "#ffd9a0";
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(probe.radius * view.scale, 3), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Drawn after restore() so the flash isn't shifted by the shake translate.
  const flash = flashAlpha(crashElapsed);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 107, 53, ${flash * 0.5})`;
    ctx.fillRect(0, 0, width, height);
  }
}
