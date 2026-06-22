// Pure progress stats for the Acid/Base Sorter. No DOM, no localStorage (storage.js does that).
// Shape: { [deckId]: { [cardId]: { missed: number, mastered: boolean } } }
//
//  - missed   : how many times the student got this card wrong on a Check (tally, never reset)
//  - mastered : true once they've ever gotten it fully right — sticky, a later miss won't undo it

export function recordResult(stats, deckId, cardId, allCorrect) {
  const deckStats = { ...(stats[deckId] || {}) };
  const prev = deckStats[cardId] || { seen: 0, missed: 0, mastered: false };
  deckStats[cardId] = {
    seen: (prev.seen || 0) + 1,
    missed: prev.missed + (allCorrect ? 0 : 1),
    mastered: prev.mastered || allCorrect
  };
  return { ...stats, [deckId]: deckStats };
}

// How many times a card has been checked (0 if never). Drives coverage — least-seen first.
export function seenCount(stats, deckId, cardId) {
  return stats[deckId]?.[cardId]?.seen || 0;
}

export function masteredIds(stats, deckId) {
  const d = stats[deckId] || {};
  return Object.keys(d).filter((id) => d[id].mastered);
}

export function masteredCount(stats, deckId) {
  return masteredIds(stats, deckId).length;
}
