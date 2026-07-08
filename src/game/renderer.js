import { drawStarfield } from "./starfield.js";

// Maps world coordinates (level space, origin at center) to canvas pixel
// coordinates, so levels can be authored independent of screen size.
export function worldToScreen(point, view) {
  return {
    x: view.width / 2 + point.x * view.scale,
    y: view.height / 2 + point.y * view.scale,
  };
}

export function drawScene(ctx, view, { stars, level, probe, ghostPath }) {
  const { width, height } = view;
  ctx.clearRect(0, 0, width, height);

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
  ctx.strokeStyle = "#7fff9f";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(goal.x, goal.y, level.goal.radius * view.scale, 0, Math.PI * 2);
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

  const p = worldToScreen(probe.position, view);
  ctx.fillStyle = "#ffd9a0";
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(probe.radius * view.scale, 3), 0, Math.PI * 2);
  ctx.fill();
}
