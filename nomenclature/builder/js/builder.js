// Type I ionic Name Builder — pure logic. No DOM, no globals. ESM for `node --test`.
//
// Type I = fixed-charge metals (no Roman numeral) + a monoatomic anion. Naming is: the metal keeps
// its element name, the nonmetal becomes root + "-ide", and ionic names use NO Greek prefixes
// (MgCl₂ is "magnesium chloride", never "dichloride"). The student READS the formula and TYPES the
// name — practicing the periodic-table recall (Na → sodium) that tiles would hand them. Stuck
// students can reveal progressive hints.

import { assemble } from "../../js/naming.js";
import { gradeName } from "../../js/matching.js";
import { toRoman } from "../../js/chem.js";
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

// ── Type II: variable-charge metals → the charge becomes a Roman numeral ─────────
// Same typed-name mechanic, but now the student must DEDUCE the metal's charge from the formula
// (reverse criss-cross) and write it as a Roman numeral. The hint ladder walks that deduction.
export const TYPE_II_CATIONS = ["Fe", "Cu", "Cr", "V", "Mn", "Co", "Sn", "Pb", "Au", "Hg"];

// Each variable metal in each of its course charges × a monoatomic anion.
export function typeTwoCompounds() {
  const out = [];
  for (const cation of TYPE_II_CATIONS) {
    for (const cationCharge of CATION_BY_SYMBOL[cation].states) {
      for (const anion of TYPE_I_ANIONS) out.push({ cation, cationCharge, anion });
    }
  }
  return out;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const chg = (n) => `${Math.abs(n)}${n > 0 ? "+" : "−"}`; // always show magnitude in prose: 1+, 2−

export function buildProblemII(spec) {
  const built = assemble({ kind: "ionic", cation: spec.cation, cationCharge: spec.cationCharge, anion: spec.anion });
  const metal = ELEMENTS[spec.cation];
  const anionRec = MONO_ANION_BY_ID[spec.anion];
  const anion = anionRec.names[0];
  const { cation: cCount, anion: aCount } = built.ratio;
  const totalNeg = anionRec.charge * aCount; // e.g. −3 for three bromides
  return {
    spec,
    formula: built.formula.display, // e.g. "FeBr₃"
    target: built.name, // { canonical: "iron(III) bromide", accepted }
    cation: metal,
    roman: toRoman(spec.cationCharge),
    anion,
    hints: [
      "This metal can take more than one charge, so you have to work it out and show it as a Roman numeral. Start from the anion's total negative charge.",
      `${cap(anion)} is ${chg(anionRec.charge)}${aCount > 1 ? `, and there are ${aCount} → ${chg(totalNeg)} total` : ""}.`,
      cap(`${cCount > 1 ? `${cCount} ` : ""}${metal} must total ${chg(-totalNeg)}, so ${cCount > 1 ? "each is" : "it's"} ${chg(spec.cationCharge)} → ${metal}(${toRoman(spec.cationCharge)}).`)
    ]
  };
}

// The builder's levels: one typed-name + hint + 5-per-round mechanic, different content & intro.
export const LEVELS = [
  { id: "type1", label: "Type I", tagline: "fixed-charge metals", compounds: typeOneCompounds, build: buildProblem },
  { id: "type2", label: "Type II", tagline: "variable charge → Roman numeral", compounds: typeTwoCompounds, build: buildProblemII }
];

// ── periodic-table memory-aid data (for the intros) ──────────────────────────────
// Type I: each fixed-charge metal → its single charge (Tro Table 5.4).
export const FIXED_CHARGES = Object.fromEntries(TYPE_I_CATIONS.map((s) => [s, CATION_BY_SYMBOL[s].charge]));
// Type II: each variable metal → its possible oxidation states (just to get an idea, not to memorize).
export const VARIABLE_STATES = Object.fromEntries(TYPE_II_CATIONS.map((s) => [s, CATION_BY_SYMBOL[s].states]));

export { CATION_BY_SYMBOL, MONO_ANION_BY_ID };
