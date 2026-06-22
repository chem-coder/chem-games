// Thin localStorage wrapper for the Acid/Base Sorter's saved progress. Keeps the safe try/catch
// so a blocked or full storage never breaks the game. All the real logic lives in stats.js.
const KEY = "chem-games:acid-base-sorter";

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
    /* ignore — progress is a nicety, not essential */
  }
}

export function resetStats() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
