// Polyatomic-Ion Trainer — pure stack + grading logic. No DOM, no globals. ESM for node --test.
//
// The trainer drills the three things Dalia wants connected for each ion: formula (with subscripts),
// name, and charge. A round is a short flashcard stack (5–10 ions — longer was "brutal"). Each card
// shows ONE facet and asks the student to produce the other two, charge always among them:
//   • "recall"    — show the NAME      → type the FORMULA + pick the CHARGE
//   • "recognize" — show the FORMULA   → type the NAME + pick the CHARGE
// A fully-correct card leaves the stack; any miss rotates to the back to come around again
// (same spaced-repetition-lite loop as the Acid/Base Sorter).

import { gradeFormula, gradeName } from "./matching.js";

export const DEFAULT_ROUND = 8;

// Adapt an ion record (from ions.js) into the { name, formula } shape the matcher expects.
export function ionTarget(ion) {
  return {
    name: { canonical: ion.names[0], accepted: ion.names },
    formula: { canonical: ion.formulas[0], accepted: ion.formulas }
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build one round: a shuffled sample of the deck's ions, capped at the sweet-spot size.
export function buildRound(ions, size = DEFAULT_ROUND, rng = Math.random) {
  return shuffle(ions, rng).slice(0, Math.min(size, ions.length));
}

// Advance the stack: correct → drop the front card; miss → rotate it to the back.
export function requeue(queue, allCorrect) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return allCorrect ? rest : [...rest, head];
}

// The student's input for the asked facets. Charge is always asked; the text field is the formula
// (recall) or the name (recognize). Check is gated until both asked facets are filled.
export function isComplete(direction, input) {
  const text = direction === "recall" ? input.formula : input.name;
  return Boolean(text && String(text).trim()) && input.charge != null;
}

// Grade a card. Pure: returns per-facet correctness, the all-correct flag, and the target (so the UI
// can reveal canonical forms + equivalents). A missing facet counts as wrong, never a crash.
export function gradeTriad(ion, direction, input) {
  const target = ionTarget(ion);
  const facets = {};
  if (direction === "recall") {
    facets.formula = gradeFormula(target, input.formula ?? "").correct;
  } else {
    facets.name = gradeName(target, input.name ?? "").correct;
  }
  facets.charge = Number(input.charge) === ion.charge;
  const allCorrect = Object.values(facets).every(Boolean);
  return { facets, allCorrect, target };
}
