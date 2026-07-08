// Builds the win-overlay share string. Deliberately carries only the
// calendar date and shot count — never the level id or planet layout — so
// sharing a result never spoils the puzzle's solution for someone who
// hasn't played it yet.

export function formatDateForShare(date) {
  return date.toISOString().slice(0, 10);
}

export function buildShareString({ date, shots, par }) {
  const shotWord = shots === 1 ? "shot" : "shots";
  return `Perigee ${formatDateForShare(date)} — ${shots} ${shotWord} (par ${par})`;
}
