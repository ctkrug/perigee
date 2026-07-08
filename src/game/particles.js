// Generates the spark-burst data for the win overlay's signature
// celebration. Pure data generation, separate from the DOM writes, so the
// distribution (count, spread, timing) is unit-testable without a browser.
// `random` is injectable so tests can assert exact output with a fixed
// sequence instead of only bounds-checking Math.random().
export function createBurst(count = 16, random = Math.random) {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + random() * 0.3;
    const distance = 60 + random() * 60;
    particles.push({
      angle,
      distance,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      delayMs: random() * 80,
    });
  }
  return particles;
}
