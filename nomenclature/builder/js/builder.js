// Type I ionic Name Builder — pure logic. No DOM, no globals. ESM for `node --test`.
//
// Type I = fixed-charge metals (no Roman numeral) + a monoatomic anion. Naming is: the metal keeps
// its element name, the nonmetal becomes root + "-ide", and ionic names use NO Greek prefixes
// (MgCl₂ is "magnesium chloride", never "dichloride"). The student READS the formula and TYPES the
// name — practicing the periodic-table recall (Na → sodium) that tiles would hand them. Stuck
// students can reveal progressive hints.

import { assemble } from "../../js/naming.js";
import { gradeName } from "../../js/matching.js";
import { ELEMENTS, CATION_BY_SYMBOL, MONO_ANION_BY_ID } from "../../data/ions.js";

// The quizzed sets — familiar fixed-charge metals and common monoatomic anions.
export const TYPE_I_CATIONS = ["Li", "Na", "K", "Rb", "Cs", "Mg", "Ca", "Sr", "Ba", "Al", "Zn", "Ag"];
export const TYPE_I_ANIONS = ["fluoride", "chloride", "bromide", "iodide", "oxide", "sulfide", "selenide", "nitride", "phosphide"];

// Every type-I compound as a spec (fixed cation symbol + monoatomic anion id).
export function typeOneCompounds() {
  const out = [];
  for (const cation of TYPE_I_CATIONS) {
    for (const anion of TYPE_I_ANIONS) out.push({ cation, anion });
  }
  return out;
}

// Build one problem: the formula to read, the grading target, the two name parts, and the hint
// ladder (method → reveal the metal → reveal the anion). Deterministic.
export function buildProblem(spec) {
  const built = assemble({ kind: "ionic", cation: spec.cation, anion: spec.anion });
  const cation = ELEMENTS[spec.cation];
  const anion = MONO_ANION_BY_ID[spec.anion].names[0];
  return {
    spec,
    formula: built.formula.display, // unicode-subscripted, e.g. "MgCl₂"
    target: built.name, // { canonical, accepted } — for the matcher
    cation, // "magnesium"
    anion, // "chloride"
    hints: [
      "Name the metal first, then the nonmetal as its root + –ide. Ionic names use no prefixes — the subscripts don't appear in the name.",
      `The metal (${spec.cation}) is ${cation}.`,
      `The nonmetal becomes ${anion}.`
    ]
  };
}

// Grade a TYPED name against the problem's accepted forms (case/spacing-forgiving; spelling counts).
export function gradeAnswer(problem, typed) {
  return gradeName({ name: problem.target }, typed); // { correct, matched, canonical, alsoAccepted }
}

// A round is a short shuffled sample — 5 keeps it brisk (15-at-a-time was brutal).
export const DEFAULT_ROUND = 5;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRound(specs, size = DEFAULT_ROUND, rng = Math.random) {
  return shuffle(specs, rng).slice(0, Math.min(size, specs.length));
}

// Advance the queue: mastered → drop; missed → rotate to the back for another pass.
export function requeue(queue, allCorrect) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return allCorrect ? rest : [...rest, head];
}

// Guard helper (tests): a type-I name is exactly "<metal> <anion-ide>" — two words, no Roman
// numeral, no Greek prefix.
export function isWellFormedTypeOneName(name) {
  return /^[a-z]+ [a-z]+ide$/.test(name) && !/\(/.test(name);
}

export { CATION_BY_SYMBOL, MONO_ANION_BY_ID };
