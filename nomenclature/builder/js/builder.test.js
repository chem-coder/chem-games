import { test } from "node:test";
import assert from "node:assert/strict";

import {
  typeOneCompounds, buildProblem, gradeAnswer, buildRound, requeue,
  isWellFormedTypeOneName, DEFAULT_ROUND, TYPE_I_CATIONS, TYPE_I_ANIONS
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
