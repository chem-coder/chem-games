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
