// Minimal 2D vector math. Plain {x, y} objects rather than a class so the
// physics core can stay allocation-light in the integration hot loop.

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a, s) {
  return { x: a.x * s, y: a.y * s };
}

export function length(a) {
  return Math.hypot(a.x, a.y);
}

export function normalize(a) {
  const len = length(a);
  if (len === 0) return { x: 0, y: 0 };
  return { x: a.x / len, y: a.y / len };
}

export function distance(a, b) {
  return length(sub(a, b));
}
