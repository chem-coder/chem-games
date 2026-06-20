// Conversion Builder — pure grid logic. No DOM, no globals. ESM for `node --test`.
//
// The learner CONSTRUCTS a dimensional-analysis grid from tiles instead of picking a
// ready-made factor's orientation (that's the Conveyor). A finished mole-ratio grid is:
//
//     | given  | target coeff |
//     |   1    | given coeff  |   = answer
//
// Each column is an oriented factor { num, den }. We fold them through the SHARED engine
// starting from a dimensionless 1, so the given's "over 1" first step has to cancel the
// starting unit — placing that 1 is part of the puzzle (the bit Malcolm skips).

import { runChain, approxEqual } from "../../shared/js/conversion-engine.js";

// The four slots of a 2-column grid, in render order.
export const SLOTS = ["givenNum", "factorNum", "givenDen", "factorDen"];

// A tile is { id, value, unit }. The dimensionless "1" carries unit "1".
export const ONE_UNIT = "1";

// Find the species coefficient tile whose unit matches `unit` (e.g. "mol H₂").
function speciesFor(round, unit) {
  return round.species.find((s) => s.unit === unit) || null;
}

// The intended factor column for a question: target coefficient over given coefficient.
export function factorFor(round, question) {
  return {
    num: speciesFor(round, question.targetUnit), // e.g. 2 mol H₂O
    den: speciesFor(round, round.given.unit) // e.g. 2 mol H₂
  };
}

// The intended placement (the answer key) as { slot: {value, unit} }.
export function correctGrid(round, question) {
  const factor = factorFor(round, question);
  return {
    givenNum: { value: round.given.value, unit: round.given.unit },
    givenDen: { value: 1, unit: ONE_UNIT },
    factorNum: { value: factor.num.value, unit: factor.num.unit },
    factorDen: { value: factor.den.value, unit: factor.den.unit }
  };
}

// Turn placed tiles into the engine's oriented-factor chain (given column, then factor column).
export function gridToChain(placed) {
  return [
    { num: placed.givenNum, den: placed.givenDen },
    { num: placed.factorNum, den: placed.factorDen }
  ];
}

export function isComplete(placed) {
  return SLOTS.every((s) => placed[s]);
}

// Run the built grid and judge it. Never reveals the answer — only what failed to cancel.
export function checkGrid(round, question, placed) {
  if (!isComplete(placed)) {
    return { ready: false };
  }
  const chain = gridToChain(placed);
  const run = runChain({ value: 1, unit: ONE_UNIT }, chain);
  const reachedTarget = run.ok && run.result.unit === question.targetUnit;
  const valueMatches = reachedTarget && approxEqual(run.result.value, question.answer.value);
  const solved = reachedTarget && valueMatches;

  return {
    ready: true,
    solved,
    reachedTarget,
    valueMatches,
    result: run.result,
    steps: run.steps,
    diagnostic: solved ? null : diagnose(round, question, placed, run)
  };
}

// A diagnostic points at the first thing that doesn't cancel — without giving the number.
function diagnose(round, question, placed, run) {
  // First column failed: the given isn't sitting over a plain 1, so nothing starts cancelling.
  const firstBad = run.steps.findIndex((s) => !s.ok);
  if (firstBad === 0) {
    return "Nothing cancels yet — the given has to sit over a plain 1 to start the chain.";
  }
  if (firstBad === 1) {
    const carry = run.steps[0].unit; // the unit coming out of the given column
    return `The ${carry} don't cancel — what needs to be on the bottom of your fraction so they do?`;
  }
  // Units all cancelled. Either we ended on the wrong species, or the numbers are off.
  if (!run.ok) {
    return "Something doesn't cancel — line the units up top-and-bottom.";
  }
  if (!run.result || run.result.unit !== question.targetUnit) {
    return `You landed in ${run.result.unit}, but the question asks for ${question.targetUnit}.`;
  }
  return `The units cancel and you reached ${question.targetUnit} — but check your numbers against the equation's coefficients.`;
}

// Deterministic tile bank: the four correct tiles plus derived distractors. The UI shuffles.
// Distractors are DERIVED (no hand-authoring): the reaction's other species coefficients are
// already in `species`, plus the classic "just relabel the given" trap (given number, target unit).
export function buildTileBank(round, question) {
  const tiles = [];
  let n = 0;
  const add = (value, unit) => tiles.push({ id: `t${n++}`, value, unit });

  add(1, ONE_UNIT); // the literal 1 — placing it is the lesson
  add(round.given.value, round.given.unit); // the given itself (e.g. 6 mol H₂)
  for (const s of round.species) add(s.value, s.unit); // every coefficient tile off the equation

  // Trap: the given's number wearing the target's unit (6 mol H₂ → "6 mol H₂O").
  if (round.given.value !== coeffValue(round, question.targetUnit)) {
    add(round.given.value, question.targetUnit);
  }

  return dedupe(tiles);
}

function coeffValue(round, unit) {
  const s = speciesFor(round, unit);
  return s ? s.value : null;
}

// Drop exact value+unit duplicates (keep the first), so the bank never shows two identical tiles.
function dedupe(tiles) {
  const seen = new Set();
  const out = [];
  for (const t of tiles) {
    const key = `${t.value}|${t.unit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}
