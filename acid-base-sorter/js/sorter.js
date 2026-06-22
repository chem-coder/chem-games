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

// Default round length. A round always tests EVERY strong species, then fills the rest with a
// random sample of weak ones — so the strong list is fully drilled while the round stays varied.
export const DEFAULT_STACK_SIZE = 15;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build one round: ALL strong cards (guaranteed — the memory test must be exhaustive) plus a
// random sample of weak cards up to targetSize, then shuffled. rng is injectable for tests.
export function buildStack(deck, targetSize = DEFAULT_STACK_SIZE, rng = Math.random) {
  const strong = deck.cards.filter((c) => c.answers.strength === "strong");
  const weak = deck.cards.filter((c) => c.answers.strength !== "strong");
  const need = Math.max(0, targetSize - strong.length);
  const chosenWeak = shuffle(weak, rng).slice(0, need);
  return shuffle([...strong, ...chosenWeak], rng);
}
