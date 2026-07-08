// A level is a fixed, hand-designed layout: static planets, a probe start
// position, and a goal to thread. Coordinates are in world units — the
// renderer maps world space to canvas pixels, so levels stay resolution
// independent.

export const WORLD_BOUNDS = { minX: -400, maxX: 400, minY: -300, maxY: 300 };

export const DAILY_LEVEL = {
  id: "2026-07-08",
  par: 2,
  probeStart: { x: -340, y: -220 },
  goal: { position: { x: 320, y: 200 }, radius: 16 },
  planets: [
    { position: { x: -60, y: -40 }, mass: 3200, radius: 22 },
    { position: { x: 120, y: 90 }, mass: 5200, radius: 30 },
  ],
};

export function getDailyLevel() {
  return DAILY_LEVEL;
}
