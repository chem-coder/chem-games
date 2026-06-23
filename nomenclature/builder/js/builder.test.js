import { test } from "node:test";
import assert from "node:assert/strict";

import {
  typeOneCompounds, buildProblem, gradeAnswer, buildRound, requeue,
  isWellFormedTypeOneName, DEFAULT_ROUND, TYPE_I_CATIONS, TYPE_I_ANIONS,
  typeTwoCompounds, buildProblemII, TYPE_II_CATIONS, LEVELS,
  FIXED_CHARGES, VARIABLE_STATES
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
test("gradeAnswer accepts the typed name regardless of case and spacing", () => {
  const p = buildProblem({ cation: "Mg", anion: "chloride" });
  assert.equal(gradeAnswer(p, "magnesium chloride").correct, true);
  assert.equal(gradeAnswer(p, "  Magnesium   Chloride ").correct, true);
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

test("Type II grading is forgiving about Roman-numeral spacing and case", () => {
  const p = buildProblemII({ cation: "V", cationCharge: 5, anion: "oxide" });
  assert.equal(gradeAnswer(p, "vanadium(V) oxide").correct, true);
  assert.equal(gradeAnswer(p, "VANADIUM (v) oxide").correct, true);
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

test("LEVELS exposes Type I and Type II with a build + compounds each", () => {
  assert.deepEqual(LEVELS.map((l) => l.id), ["type1", "type2"]);
  for (const lvl of LEVELS) {
    assert.ok(typeof lvl.build === "function" && typeof lvl.compounds === "function");
    const spec = lvl.compounds()[0];
    assert.ok(lvl.build(spec).target.canonical.length > 0);
  }
});
