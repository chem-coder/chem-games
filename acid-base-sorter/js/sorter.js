// Acid / Base Sorter — pure stack + grading logic. No DOM, no globals. ESM for `node --test`.
//
// A deck is played as a stack (queue of card ids). The student classifies the front card on every
// axis; Check grades it. A fully-correct card leaves the stack (mastered); any miss sends the card
// to the BACK to come around again — flashcard spaced-repetition-lite.

// Grade a card against the student's per-axis selections. Pure: returns per-axis correctness and
// whether every axis is right. Selections may be partial (missing axis -> that axis is wrong).
export function gradeCard(axes, card, selections) {
  const perAxis = {};
  let allCorrect = true;
  for (const ax of axes) {
    const ok = selections[ax.id] === card.answers[ax.id];
    perAxis[ax.id] = ok;
    if (!ok) allCorrect = false;
  }
  return { perAxis, allCorrect };
}

// Advance the stack after grading the front card. Correct -> drop it; miss -> rotate to the back.
export function requeue(queue, allCorrect) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return allCorrect ? rest : [...rest, head];
}

// Every axis selected? (Check is only allowed once the card is fully classified.)
export function isComplete(axes, selections) {
  return axes.every((ax) => selections[ax.id] != null);
}

// Default round length. Short rounds (saved progress handles full coverage over time).
export const DEFAULT_STACK_SIZE = 8;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build one round, COVERAGE-AWARE. Using saved stats, prefer cards the student hasn't mastered
// yet, least-seen first (so rounds rotate through the whole pool instead of repeating the same
// few); top up with already-mastered cards only if there aren't enough unmastered ones to fill
// the round. rng is injectable for tests. stats is the saved-progress object (see stats.js).
export function buildStack(deck, stats = {}, size = DEFAULT_STACK_SIZE, rng = Math.random) {
  const d = stats[deck.id] || {};
  const decorated = deck.cards.map((c) => {
    const rec = d[c.id] || {};
    return { card: c, tier: rec.mastered ? 1 : 0, seen: rec.seen || 0, r: rng() };
  });
  // unmastered before mastered; within a tier, least-seen first; random tiebreak
  decorated.sort((a, b) => a.tier - b.tier || a.seen - b.seen || a.r - b.r);
  const chosen = decorated.slice(0, Math.min(size, decorated.length)).map((x) => x.card);
  return shuffle(chosen, rng); // shuffle so play order isn't the priority order
}
