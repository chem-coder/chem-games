import { test } from "node:test";
import assert from "node:assert/strict";

import {
  typeOneCompounds, buildProblem, gradeAnswer, buildRound, requeue,
  isWellFormedTypeOneName, DEFAULT_ROUND, TYPE_I_CATIONS, TYPE_I_ANIONS,
  typeTwoCompounds, buildProblemII, TYPE_II_CATIONS, LEVELS,
  FIXED_CHARGES, VARIABLE_STATES,
  polyatomicCompounds, buildProblemPoly, POLY_ANION_IDS,
  makeDealer, CATION_BY_SYMBOL
} from "./builder.js";

function seq(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

// ── content ──
test("typeOneCompounds covers every fixed-cation × monoatomic-anion pair", () => {
  assert.equal(typeOneCompounds().length, TYPE_I_CATIONS.length * TYPE_I_ANIONS.length);
});

test("every type-I name is '<metal> <anion-ide>' — no Roman numeral, no prefix", () => {
  for (const spec of typeOneCompounds()) {
    assert.ok(isWellFormedTypeOneName(buildProblem(spec).target.canonical));
  }
});

test("worksheet Part I names come out right", () => {
  const expect = {
    "Na/bromide": "sodium bromide",
    "Mg/bromide": "magnesium bromide",
    "Mg/selenide": "magnesium selenide",
    "Na/nitride": "sodium nitride",
    "Ag/bromide": "silver bromide"
  };
  for (const [key, name] of Object.entries(expect)) {
    const [cation, anion] = key.split("/");
    assert.equal(buildProblem({ cation, anion }).target.canonical, name);
  }
});

// ── problem shape + hint ladder ──
test("buildProblem exposes the formula, parts, and a 3-rung hint ladder", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" });
  assert.equal(p.formula, "MgCl₂");
  assert.equal(p.cation, "magnesium");
  assert.equal(p.anion, "chloride");
  assert.equal(p.hints.length, 3);
  assert.ok(/no prefix/i.test(p.hints[0]), "first hint teaches the method");
  assert.ok(p.hints[1].includes("magnesium"), "second hint reveals the metal");
  assert.ok(p.hints[2].includes("chloride"), "third hint reveals the anion");
});

// ── typed grading (case/spacing-forgiving via the shared matcher) ──
test("name grading: caps forgiven, spacing nudged, wrong chemistry wrong", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" });
  assert.equal(gradeAnswer(p, "magnesium chloride").correct, true);
  assert.equal(gradeAnswer(p, "Magnesium Chloride").correct, true);   // caps forgiven for names
  assert.equal(gradeAnswer(p, "  magnesium chloride ").correct, true); // end-spaces trimmed
  assert.equal(gradeAnswer(p, "magnesium   chloride").nudge, "nspace"); // extra internal spaces → nudge
  assert.equal(gradeAnswer(p, "magnesium bromide").correct, false);
  assert.equal(gradeAnswer(p, "magnesium dichloride").correct, false); // prefixes are wrong
  assert.equal(gradeAnswer(p, "").correct, false);
});

// ── round/stack engine ──
test("buildRound defaults to 5 and never exceeds the pool", () => {
  assert.equal(DEFAULT_ROUND, 5);
  const specs = typeOneCompounds();
  assert.equal(buildRound(specs, DEFAULT_ROUND, seq([0.1, 0.9, 0.3])).length, 5);
  assert.equal(buildRound(specs, 9999, seq([0.5])).length, specs.length);
});

test("requeue drops a mastered item and rotates a missed one", () => {
  assert.deepEqual(requeue(["a", "b", "c"], true), ["b", "c"]);
  assert.deepEqual(requeue(["a", "b", "c"], false), ["b", "c", "a"]);
  assert.deepEqual(requeue([], true), []);
});

// ── Type II: charge → Roman numeral ──
test("typeTwoCompounds covers every variable metal × its course charges × anions", () => {
  const all = typeTwoCompounds();
  // each metal contributes states.length × anion-count compounds
  assert.ok(all.length > TYPE_II_CATIONS.length * TYPE_I_ANIONS.length); // at least 2 states each
  assert.ok(all.every((s) => Number.isInteger(s.cationCharge)));
});

test("worksheet Part II names deduce the Roman numeral correctly", () => {
  const expect = {
    "Fe/3/bromide": "iron(III) bromide",
    "Fe/2/bromide": "iron(II) bromide",
    "V/5/oxide": "vanadium(V) oxide",
    "Au/3/sulfide": "gold(III) sulfide",
    "Au/1/sulfide": "gold(I) sulfide",
    "Pb/4/chloride": "lead(IV) chloride"
  };
  for (const [key, name] of Object.entries(expect)) {
    const [cation, q, anion] = key.split("/");
    assert.equal(buildProblemII({ cation, cationCharge: Number(q), anion }).target.canonical, name);
  }
});

test("the Type II hint ladder walks the charge deduction", () => {
  const p = buildProblemII({ cation: "Fe", cationCharge: 3, anion: "bromide" }); // FeBr₃
  assert.equal(p.formula, "FeBr₃");
  assert.equal(p.hints.length, 3);
  assert.match(p.hints[0], /Roman numeral/i);
  assert.match(p.hints[1], /Bromide is 1−.*3.*3−/); // anion's total negative charge
  assert.match(p.hints[2], /iron must total 3\+.*iron\(III\)/i); // balance → the metal's Roman numeral
});

test("Type II grading: caps forgiven, Roman-numeral spacing nudged, wrong charge wrong", () => {
  const p = buildProblemII({ cation: "V", cationCharge: 5, anion: "oxide" });
  assert.equal(gradeAnswer(p, "vanadium(V) oxide").correct, true);
  assert.equal(gradeAnswer(p, "VANADIUM(v) oxide").correct, true);   // caps + roman-case forgiven
  assert.equal(gradeAnswer(p, "vanadium (V) oxide").nudge, "nspace"); // space before numeral → nudge
  assert.equal(gradeAnswer(p, "vanadium oxide").correct, false); // missing the charge
  assert.equal(gradeAnswer(p, "vanadium(IV) oxide").correct, false); // wrong charge
});

test("FIXED_CHARGES matches Tro Table 5.4 (the memory-aid set)", () => {
  assert.deepEqual(FIXED_CHARGES, {
    Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, // group 1
    Mg: 2, Ca: 2, Sr: 2, Ba: 2,       // group 2
    Al: 3, Zn: 2, Ag: 1               // Al, and the two "*" exceptions
  });
});

test("VARIABLE_STATES lists each variable metal's possible oxidation states", () => {
  assert.deepEqual(VARIABLE_STATES.Fe, [2, 3]);
  assert.deepEqual(VARIABLE_STATES.Cu, [1, 2]);
  assert.deepEqual(VARIABLE_STATES.Cr, [2, 3, 6]);
  assert.equal(Object.keys(VARIABLE_STATES).length, TYPE_II_CATIONS.length);
  for (const states of Object.values(VARIABLE_STATES)) assert.ok(states.length >= 2);
});

// ── Polyatomic: metal (fixed or variable) + a named polyatomic ──
test("polyatomic names come out right for both fixed and variable metals", () => {
  const expect = {
    "Mg//nitrate": "magnesium nitrate", // Type I cation
    "K//phosphate": "potassium phosphate",
    "Na//sulfate": "sodium sulfate",
    "Fe/3/sulfate": "iron(III) sulfate", // Type II → deduced Roman numeral
    "Cu/2/nitrate": "copper(II) nitrate",
    "Fe/2/carbonate": "iron(II) carbonate"
  };
  for (const [key, name] of Object.entries(expect)) {
    const [cation, q, anion] = key.split("/");
    const spec = q ? { cation, cationCharge: Number(q), anion } : { cation, anion };
    assert.equal(buildProblemPoly(spec).target.canonical, name);
  }
});

test("polyatomic hints differ for fixed vs variable, and the polyatomic keeps its name", () => {
  const fixed = buildProblemPoly({ cation: "Mg", anion: "nitrate" });
  assert.equal(fixed.formula, "Mg(NO₃)₂");
  assert.match(fixed.hints[2], /nitrate/);
  assert.ok(!/Roman/i.test(fixed.hints[0]), "a fixed metal needs no Roman-numeral hint");

  const variable = buildProblemPoly({ cation: "Fe", cationCharge: 3, anion: "sulfate" }); // Fe₂(SO₄)₃
  assert.match(variable.hints[0], /Roman numeral/i);
  assert.match(variable.hints[1], /Sulfate is 2−.*3.*6−/); // the polyatomic's total charge
  assert.match(variable.hints[2], /iron\(III\).*sulfate/i);
});

test("every polyatomic compound names the metal then the polyatomic ion verbatim", () => {
  for (const spec of polyatomicCompounds()) {
    const p = buildProblemPoly(spec);
    assert.ok(p.target.canonical.endsWith(p.anion), `"${p.target.canonical}" should end in "${p.anion}"`);
  }
  assert.ok(POLY_ANION_IDS.length >= 20, "a rich anion set, not just the common few");
});

// ── dealing: variety without repetition ──
test("a dealt round keeps both slots distinct (no four-permanganates / four-vanadiums)", () => {
  const poly = LEVELS.find((l) => l.id === "poly");
  const deal = makeDealer(poly);
  const round = deal(5, seq([0.13, 0.47, 0.81, 0.29, 0.6, 0.05, 0.9]));
  assert.equal(round.length, 5);
  assert.equal(new Set(round.map((c) => c.anion)).size, 5, "5 distinct anions");
  assert.equal(new Set(round.map((c) => c.cation)).size, 5, "5 distinct cations");
});

test("the dealer cycles through EVERY anion before any repeats", () => {
  const poly = LEVELS.find((l) => l.id === "poly");
  const deal = makeDealer(poly);
  const big = deal(poly.anions.length, seq([0.2, 0.7, 0.4, 0.9, 0.1, 0.55]));
  assert.equal(new Set(big.map((c) => c.anion)).size, poly.anions.length, "all anions, no repeat in a full cycle");
});

test("a variable metal is dealt ONE oxidation state (so 4-state metals aren't over-dealt)", () => {
  const t2 = LEVELS.find((l) => l.id === "type2");
  const deal = makeDealer(t2);
  for (const card of deal(20, seq([0.3, 0.8, 0.1, 0.6, 0.45]))) {
    const states = CATION_BY_SYMBOL[card.cation].states;
    assert.ok(states.includes(card.cationCharge), `${card.cation} charge ${card.cationCharge} is one of its states`);
  }
});

test("LEVELS exposes Type I, Type II, and Polyatomic with a build + compounds each", () => {
  assert.deepEqual(LEVELS.map((l) => l.id), ["type1", "type2", "poly"]);
  for (const lvl of LEVELS) {
    assert.ok(typeof lvl.build === "function" && typeof lvl.compounds === "function");
    const spec = lvl.compounds()[0];
    assert.ok(lvl.build(spec).target.canonical.length > 0);
  }
});

// ── reverse mode: name → formula ──
test("buildProblem reverse: shows the name, grades the formula", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" }, "formula");
  assert.equal(p.mode, "formula");
  assert.equal(p.prompt, "magnesium chloride"); // name is the prompt now
  assert.equal(p.answer, "MgCl₂"); // subscripted formula is the reveal
  assert.equal(p.hints.length, 3);
});

test("reverse gradeAnswer: correct formula passes, wrong fails", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" }, "formula");
  assert.equal(gradeAnswer(p, "MgCl2").correct, true);
  assert.equal(gradeAnswer(p, "MgCl2").caseOnly, false);
  assert.equal(gradeAnswer(p, "MgCl3").correct, false);
});

// Formatting near-miss → nudge (chemistry right, format off); chemistry wrong → wrong.
test("reverse formula: caps near-miss → nudge 'caps'", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" }, "formula");
  const g = gradeAnswer(p, "mgcl2");
  assert.equal(g.correct, false);
  assert.equal(g.nudge, "caps");
});

test("reverse formula: a stray charge on a neutral compound → nudge 'charge'", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" }, "formula");
  assert.equal(gradeAnswer(p, "MgCl2-").nudge, "charge");
  assert.equal(gradeAnswer(p, "MgCl2+").nudge, "charge");
  assert.equal(gradeAnswer(p, "MgCl2-").correct, false);
});

test("reverse formula: internal space → nudge 'fspace'; trailing junk → nudge 'fsymbol'", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" }, "formula");
  assert.equal(gradeAnswer(p, "  MgCl2  ").correct, true); // ends trimmed = perfect
  assert.equal(gradeAnswer(p, "Mg Cl2").nudge, "fspace");  // internal space (was hard-wrong)
  assert.equal(gradeAnswer(p, "MgCl2///").nudge, "fsymbol"); // extra characters (was silently passed)
  assert.equal(gradeAnswer(p, "MgCl3").nudge, null);       // wrong chemistry → no nudge, just wrong
  assert.equal(gradeAnswer(p, "MgCl3").correct, false);
});

test("name mode: bad Roman-numeral spacing → nudge 'nspace' (teach iron(II))", () => {
  const p = buildProblemII({ cation: "Fe", cationCharge: 2, anion: "sulfide" }, "name");
  assert.equal(gradeAnswer(p, "iron(II) sulfide").correct, true);   // tight = perfect
  assert.equal(gradeAnswer(p, "Iron(II) Sulfide").correct, true);   // caps forgiven for names
  assert.equal(gradeAnswer(p, "iron (II) sulfide").nudge, "nspace");  // space before numeral
  assert.equal(gradeAnswer(p, "iron(II)  sulfide").nudge, "nspace");  // double space between words
  assert.equal(gradeAnswer(p, "iron(III) sulfide").nudge, null);     // wrong charge → wrong, no nudge
});

test("reverse Type II: iron(III) bromide → FeBr3 with parenthesis-free entry", () => {
  const p = buildProblemII({ cation: "Fe", cationCharge: 3, anion: "bromide" }, "formula");
  assert.equal(p.mode, "formula");
  assert.equal(p.prompt, "iron(III) bromide");
  assert.equal(gradeAnswer(p, "FeBr3").correct, true);
});

test("reverse Poly: iron(III) sulfate → Fe2(SO4)3 with parentheses", () => {
  const p = buildProblemPoly({ cation: "Fe", cationCharge: 3, anion: "sulfate" }, "formula");
  assert.equal(p.mode, "formula");
  assert.equal(p.prompt, "iron(III) sulfate");
  assert.equal(gradeAnswer(p, "Fe2(SO4)3").correct, true);
});
