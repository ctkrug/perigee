// A gravitational body. Planets are static wells (fixed position, infinite
// effective inertia) — only the probe is ever integrated. This keeps daily
// levels reproducible: the planets a player sees are exactly the planets
// everyone else sees, with no drift between attempts.

export function createPlanet({ position, mass, radius }) {
  return { position, mass, radius };
}

export function createProbe({ position, velocity, radius = 4 }) {
  return { position, velocity, radius };
}
