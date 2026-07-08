// A static field of stars generated once per canvas size and redrawn every
// frame from a plain array, rather than regenerated — cheap, and keeps the
// background from shimmering/re-randomizing on every render.

export function createStarfield(width, height, count = 140) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.5 + 0.3,
    });
  }
  return stars;
}

export function drawStarfield(ctx, stars) {
  ctx.save();
  for (const star of stars) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#ffd9a0";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
