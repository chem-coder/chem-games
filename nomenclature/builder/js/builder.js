// Type I ionic Name Builder — pure logic. No DOM, no globals. ESM for `node --test`.
//
// Type I = fixed-charge metals (no Roman numeral) + a monoatomic anion. Naming is: the metal keeps
// its element name, the nonmetal becomes root + "-ide", and ionic names use NO Greek prefixes
// (MgCl₂ is "magnesium chloride", never "dichloride"). The student READS the formula and TYPES the
// name — practicing the periodic-table recall (Na → sodium) that tiles would hand them. Stuck
// students can reveal progressive hints.

import { assemble } from "../../js/naming.js?v=20260624-rev7";
import { gradeName, gradeFormula } from "../../js/matching.js?v=20260624-rev7";
import { toRoman } from "../../js/chem.js?v=20260624-rev7";
import { ELEMENTS, CATION_BY_SYMBOL, MONO_ANION_BY_ID, POLY_ANION_BY_ID, POLY_CATION_BY_ID } from "../../data/ions.js?v=20260624-rev7";

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
// Each level builds in one of two DIRECTIONS:
//   "name"    — show the formula, student types the NAME  (the original mode)
//   "formula" — show the NAME, student types the FORMULA  (the reverse pivot)
// Both reuse the same assemble() output; only which side is the prompt vs. the graded target flips.
// Uniform problem shape: { mode, prompt, answer (canonical display for the reveal), target (grading
// object), formula (display, for round-end chips), cation, anion, hints, … }.
function problemForward(spec, built, cation, anion, hints, extra = {}) {
  return {
    spec, mode: "name",
    prompt: built.formula.display, answer: built.name.canonical, target: built.name,
    formula: built.formula.display, cation, anion, hints, ...extra
  };
}
function problemReverse(spec, built, cation, anion, hints, extra = {}) {
  return {
    spec, mode: "formula",
    prompt: built.name.canonical, answer: built.formula.display, target: built.formula,
    formula: built.formula.display, cation, anion, hints, ...extra
  };
}

// Reverse-mode hint ladder (name → formula). Parallel to the forward ladders: the method, then the
// ions with their charges (the recall the student must produce), then the balance that yields it.
function reverseHints({ cLabel, cSym, cCharge, aLabel, aSym, aCharge, display, poly, method }) {
  const m = method || (poly
    ? "Treat the polyatomic as one unit with its own charge. Balance it against the metal — wrap it in parentheses if you need more than one. Drop any 1; reduce."
    : "Write each ion with its charge, then add subscripts so the charges cancel (criss-cross). Drop any 1; reduce.");
  return [
    m,
    `${cap(cLabel)} → ${cSym} ${chg(cCharge)}; ${aLabel} → ${aSym} ${chg(aCharge)}.`,
    `Balance the charges to zero → ${display}.`
  ];
}

export function buildProblem(spec, direction = "name") {
  const built = assemble({ kind: "ionic", cation: spec.cation, anion: spec.anion });
  const cation = ELEMENTS[spec.cation];
  const anionRec = MONO_ANION_BY_ID[spec.anion];
  const anion = anionRec.names[0];
  if (direction === "formula") {
    return problemReverse(spec, built, cation, anion, reverseHints({
      cLabel: cation, cSym: spec.cation, cCharge: CATION_BY_SYMBOL[spec.cation].charge,
      aLabel: anion, aSym: anionRec.symbol, aCharge: anionRec.charge,
      display: built.formula.display, poly: false
    }));
  }
  return problemForward(spec, built, cation, anion, [
    "Name the metal first, then the nonmetal as its root + –ide. Ionic names use no prefixes — the subscripts don't appear in the name.",
    `The metal (${spec.cation}) is ${cation}.`,
    `The nonmetal becomes ${anion}.`
  ]);
}

// Grade a typed answer against the problem's accepted forms (routes by direction). Name grading is
// case/spacing-forgiving; formula grading is case-sensitive (Co ≠ CO) with a caseOnly near-miss flag.
export function gradeAnswer(problem, typed) {
  if (problem.mode === "formula") {
    return gradeFormula({ formula: problem.target }, typed, { neutral: true }); // a compound is neutral → a stray charge is an error
  }
  // Name mode: the grader forgives caps/spacing/junk, but the unifying rule is "formatting → nudge,
  // chemistry → wrong." If the answer is chemically right yet not perfectly formatted, override to a
  // retry-nudge so we teach the tight form (iron(II) sulfide) instead of silently accepting it.
  const g = gradeName({ name: problem.target }, typed);
  if (!g.correct) return { ...g, nudge: null }; // chemistry/spelling wrong → wrong
  const accepted = problem.target.accepted;
  const exact = (s) => String(s).toLowerCase().trim(); // caps forgiven; spacing + symbols must be exact
  if (accepted.some((f) => exact(f) === exact(typed))) return { ...g, nudge: null }; // perfectly formatted
  const spaceless = (s) => String(s).toLowerCase().replace(/\s+/g, "");
  const nudge = accepted.some((f) => spaceless(f) === spaceless(typed)) ? "nspace" : "nsymbol";
  return { ...g, correct: false, nudge };
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

// Cation helpers that also handle ammonium (a polyatomic cation, not a periodic-table metal).
const isVariableCation = (sym) => !!CATION_BY_SYMBOL[sym]?.variable;
const cationName = (sym) => POLY_CATION_BY_ID[sym]?.names?.[0] ?? ELEMENTS[sym];

export function buildProblemII(spec, direction = "name") {
  const built = assemble({ kind: "ionic", cation: spec.cation, cationCharge: spec.cationCharge, anion: spec.anion });
  const metal = ELEMENTS[spec.cation];
  const anionRec = MONO_ANION_BY_ID[spec.anion];
  const anion = anionRec.names[0];
  const roman = toRoman(spec.cationCharge);
  const { cation: cCount, anion: aCount } = built.ratio;
  const totalNeg = anionRec.charge * aCount; // e.g. −3 for three bromides
  if (direction === "formula") {
    return problemReverse(spec, built, metal, anion, reverseHints({
      cLabel: `${metal}(${roman})`, cSym: spec.cation, cCharge: spec.cationCharge,
      aLabel: anion, aSym: anionRec.symbol, aCharge: anionRec.charge,
      display: built.formula.display, poly: false,
      method: "The Roman numeral IS the metal's charge. Pair it with the anion's charge and balance (criss-cross); drop any 1; reduce."
    }), { roman });
  }
  return problemForward(spec, built, metal, anion, [
    "This metal can take more than one charge, so you have to work it out and show it as a Roman numeral. Start from the anion's total negative charge.",
    `${cap(anion)} is ${chg(anionRec.charge)}${aCount > 1 ? `, and there are ${aCount} → ${chg(totalNeg)} total` : ""}.`,
    cap(`${cCount > 1 ? `${cCount} ` : ""}${metal} must total ${chg(-totalNeg)}, so ${cCount > 1 ? "each is" : "it's"} ${chg(spec.cationCharge)} → ${metal}(${roman}).`)
  ], { roman });
}

// ── Polyatomic ionic: a metal (Type I OR Type II) + a named polyatomic ion ───────
// The student must first decide whether the metal is fixed or variable (→ Roman numeral), then
// name the polyatomic ion, which keeps its own name (it does NOT become -ide).
// Fixed-charge cations for the polyatomic level — common metals plus nickel and the ammonium ion.
export const POLY_FIXED_CATIONS = ["Li", "Na", "K", "Mg", "Ca", "Sr", "Ba", "Al", "Zn", "Ag", "Ni", "ammonium"];
// A rich, interesting anion set — the common ones plus the oxyanion families, dichromate, oxalate,
// cyanide, thiosulfate, bicarbonate, and the iodate/periodate pair.
export const POLY_ANION_IDS = [
  "nitrate", "nitrite", "sulfate", "sulfite", "carbonate", "bicarbonate", "phosphate", "hydroxide",
  "acetate", "cyanide", "permanganate", "chromate", "dichromate", "oxalate", "thiosulfate",
  "hypochlorite", "chlorite", "chlorate", "perchlorate", "bromate", "iodate", "periodate"
];

export function polyatomicCompounds() {
  const out = [];
  for (const cation of POLY_FIXED_CATIONS) for (const anion of POLY_ANION_IDS) out.push({ cation, anion });
  for (const cation of TYPE_II_CATIONS) {
    for (const cationCharge of CATION_BY_SYMBOL[cation].states) {
      for (const anion of POLY_ANION_IDS) out.push({ cation, cationCharge, anion });
    }
  }
  return out;
}

export function buildProblemPoly(spec, direction = "name") {
  const variable = isVariableCation(spec.cation);
  const built = assemble({ kind: "ionic", cation: spec.cation, cationCharge: spec.cationCharge, anion: spec.anion });
  const cation = cationName(spec.cation); // "iron", "sodium", or "ammonium"
  const anionRec = POLY_ANION_BY_ID[spec.anion];
  const anion = anionRec.names[0];
  const { cation: cCount, anion: aCount } = built.ratio;
  const total = anionRec.charge * aCount; // the polyatomic's total negative charge
  if (direction === "formula") {
    const cSym = POLY_CATION_BY_ID[spec.cation]?.display ?? spec.cation; // "NH₄" or "Fe"
    const cCharge = variable ? spec.cationCharge : (CATION_BY_SYMBOL[spec.cation]?.charge ?? POLY_CATION_BY_ID[spec.cation]?.charge);
    const cLabel = variable ? `${cation}(${toRoman(spec.cationCharge)})` : cation;
    return problemReverse(spec, built, cation, anion, reverseHints({
      cLabel, cSym, cCharge,
      aLabel: anion, aSym: anionRec.display, aCharge: anionRec.charge,
      display: built.formula.display, poly: true
    }), variable ? { roman: toRoman(spec.cationCharge) } : {});
  }
  const hints = variable
    ? [
        "This metal's charge can vary, so work it out from the polyatomic ion's total charge and write a Roman numeral. The polyatomic keeps its own name — it doesn't become -ide.",
        `${cap(anion)} is ${chg(anionRec.charge)}${aCount > 1 ? `, and there are ${aCount} → ${chg(total)} total` : ""}.`,
        cap(`${cCount > 1 ? `${cCount} ` : ""}${cation} must total ${chg(-total)}, so ${cCount > 1 ? "each is" : "it's"} ${chg(spec.cationCharge)} → ${cation}(${toRoman(spec.cationCharge)}), and the anion is ${anion}.`)
      ]
    : [
        "Name the cation, then the polyatomic ion — keep its own name (not -ide), and this cation needs no charge.",
        `The cation is ${cation}.`,
        `The polyatomic ion is ${anion}.`
      ];
  return problemForward(spec, built, cation, anion, hints, variable ? { roman: toRoman(spec.cationCharge) } : {});
}

// Polyatomic-level cations: the fixed set (incl. ammonium) plus the variable metals.
export const POLY_CATIONS = [...POLY_FIXED_CATIONS, ...TYPE_II_CATIONS];

// The builder's levels: one typed-name + hint + 5-per-round mechanic, different content & intro.
// `cations`/`anions` feed the dealer (gameplay variety); `compounds` is the full set (integrity tests).
export const LEVELS = [
  { id: "type1", label: "Type I", tagline: "fixed-charge metals", cations: TYPE_I_CATIONS, anions: TYPE_I_ANIONS, compounds: typeOneCompounds, build: buildProblem },
  { id: "type2", label: "Type II", tagline: "variable charge → Roman numeral", cations: TYPE_II_CATIONS, anions: TYPE_I_ANIONS, compounds: typeTwoCompounds, build: buildProblemII },
  { id: "poly", label: "Polyatomic", tagline: "metal (I or II) + a polyatomic ion", cations: POLY_CATIONS, anions: POLY_ANION_IDS, compounds: polyatomicCompounds, build: buildProblemPoly }
];

// ── Dealing a varied round ───────────────────────────────────────────────────────
// A bag draws items without replacement, reshuffling only when empty — so the player cycles through
// EVERY item before any repeats (fixes "permanganate four times, dichromate never").
function makeBag(items) {
  let pile = [];
  return (rng) => {
    if (pile.length === 0) pile = shuffle(items, rng);
    return pile.pop();
  };
}

// One spec from a cation + anion: a variable metal gets ONE random oxidation state, so a 4-state
// metal (vanadium) isn't dealt 4× as often as a 2-state one (iron).
function specFor(cation, anion, rng) {
  if (isVariableCation(cation)) {
    const states = CATION_BY_SYMBOL[cation].states;
    return { cation, cationCharge: states[Math.floor(rng() * states.length)], anion };
  }
  return { cation, anion };
}

// A stateful dealer for a level: cation and anion bags persist across rounds (true cycling), and a
// round's cards are kept distinct in both slots. makeDealer(level) → deal(n, rng) → specs[].
export function makeDealer(level) {
  const drawCation = makeBag(level.cations);
  const drawAnion = makeBag(level.anions);
  return function deal(n = DEFAULT_ROUND, rng = Math.random) {
    const cards = [];
    const usedC = new Set();
    const usedA = new Set();
    for (let i = 0; i < n; i += 1) {
      let c = drawCation(rng);
      for (let g = 0; usedC.has(c) && g < level.cations.length; g += 1) c = drawCation(rng);
      let a = drawAnion(rng);
      for (let g = 0; usedA.has(a) && g < level.anions.length; g += 1) a = drawAnion(rng);
      usedC.add(c);
      usedA.add(a);
      cards.push(specFor(c, a, rng));
    }
    return cards;
  };
}

// ── periodic-table memory-aid data (for the intros) ──────────────────────────────
// Type I: each fixed-charge metal → its single charge (Tro Table 5.4).
export const FIXED_CHARGES = Object.fromEntries(TYPE_I_CATIONS.map((s) => [s, CATION_BY_SYMBOL[s].charge]));
// Type II: each variable metal → its possible oxidation states (just to get an idea, not to memorize).
export const VARIABLE_STATES = Object.fromEntries(TYPE_II_CATIONS.map((s) => [s, CATION_BY_SYMBOL[s].states]));

export { CATION_BY_SYMBOL, MONO_ANION_BY_ID };
