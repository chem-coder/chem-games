// Thin localStorage wrapper for the Polyatomic Ion Trainer's saved mastery. Safe try/catch so a
// blocked or full store never breaks the game — progress is a nicety, not essential.
const KEY = "chem-games:polyatomic-trainer";

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function resetStats() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Record one graded card. Mastery is tracked per deck as a set of ion ids the student got fully
// right at least once. Returns the updated stats object (caller persists it).
export function recordMastery(stats, deckId, ionId) {
  const next = { ...stats };
  const mastered = new Set(next[deckId] || []);
  mastered.add(ionId);
  next[deckId] = [...mastered];
  return next;
}

export function masteredCount(stats, deckId) {
  return (stats[deckId] || []).length;
}
