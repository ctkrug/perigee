// A level is a fixed, hand-designed layout: static planets, a probe start
// position, and a goal to thread. Coordinates are in world units — the
// renderer maps world space to canvas pixels, so levels stay resolution
// independent.

export const WORLD_BOUNDS = { minX: -400, maxX: 400, minY: -300, maxY: 300 };

// Every level documents its intended gravity-assist solution so QA can
// verify the puzzle reads as designed, not just "technically passes."
export const LEVELS = [
  {
    id: "single-slingshot",
    par: 2,
    probeStart: { x: -340, y: -220 },
    goal: { position: { x: 320, y: 200 }, radius: 16 },
    planets: [
      { position: { x: -60, y: -40 }, mass: 3200, radius: 22 },
      { position: { x: 120, y: 90 }, mass: 5200, radius: 30 },
    ],
    solution:
      "Aim just above-right of the first planet; its pull curves the probe " +
      "toward the second, which slings it into the goal.",
  },
  {
    id: "wraparound",
    par: 1,
    probeStart: { x: -360, y: 0 },
    goal: { position: { x: 360, y: 60 }, radius: 18 },
    planets: [{ position: { x: 0, y: 0 }, mass: 7000, radius: 34 }],
    solution:
      "A shot aimed slightly below center swings around the planet's far " +
      "side and comes back out on a slingshot arc toward the goal.",
  },
  {
    id: "threading-pass",
    par: 3,
    probeStart: { x: -360, y: -260 },
    goal: { position: { x: 360, y: 240 }, radius: 16 },
    planets: [
      { position: { x: -140, y: -100 }, mass: 2600, radius: 18 },
      { position: { x: 20, y: 40 }, mass: 3800, radius: 24 },
      { position: { x: 200, y: 160 }, mass: 3000, radius: 20 },
    ],
    solution:
      "Thread between the first two planets on a shallow diagonal; the " +
      "third planet's pull bends the path down into the goal.",
  },
  {
    id: "near-capture",
    par: 2,
    probeStart: { x: -300, y: -260 },
    goal: { position: { x: 0, y: 260 }, radius: 16 },
    planets: [{ position: { x: -40, y: -40 }, mass: 9000, radius: 26 }],
    solution:
      "Aimed to pass close on the planet's near side, the probe is nearly " +
      "captured, whipping most of the way around before flinging north to " +
      "the goal.",
  },
  {
    id: "twin-well-balance",
    par: 2,
    probeStart: { x: -380, y: 0 },
    goal: { position: { x: 380, y: 0 }, radius: 18 },
    planets: [
      { position: { x: -100, y: -140 }, mass: 4200, radius: 22 },
      { position: { x: 100, y: 140 }, mass: 4200, radius: 22 },
    ],
    solution:
      "Aim through the gap between the two wells; their opposing pulls " +
      "curve the path into an S-bend lined up with the goal.",
  },
];

export const FALLBACK_LEVEL = LEVELS[0];

// The first authored day of the daily rotation — any earlier date has no
// authored level and resolves to the fallback so the game never fails to
// load.
const ROTATION_START_UTC = Date.UTC(2026, 6, 8);
const DAY_MS = 24 * 60 * 60 * 1000;

export function getLevelById(id) {
  return LEVELS.find((level) => level.id === id) ?? FALLBACK_LEVEL;
}

// Deterministic date -> level id mapping: whole calendar days since the
// rotation start, cycling through the authored levels. Any date before the
// rotation start, or any unparsable input, falls back to the first level.
export function levelIdForDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return FALLBACK_LEVEL.id;

  const dayUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const daysSinceStart = Math.floor((dayUtc - ROTATION_START_UTC) / DAY_MS);
  if (daysSinceStart < 0) return FALLBACK_LEVEL.id;

  return LEVELS[daysSinceStart % LEVELS.length].id;
}

export function getLevelForDate(date) {
  return getLevelById(levelIdForDate(date));
}

export function getDailyLevel() {
  return getLevelForDate(new Date());
}
