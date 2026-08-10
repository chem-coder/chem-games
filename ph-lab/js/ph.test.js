import { test } from "node:test";
import assert from "node:assert/strict";

import { solve, solutionPh, buildProblem, parseTyped, grade, supNum, formatAnswer } from "./ph.js";
import { TIERS } from "./content.js";

// ── the six conversions ───────────────────────────────────────────────────────
test("solve handles every corner-to-corner move on the pH square", () => {
  assert.equal(solve({ kind: "h-to-ph", n: 5 }), 5);        // 10⁻⁵ M → pH 5
  assert.equal(solve({ kind: "h-to-ph", n: 0 }), 0);        // 1 M → pH 0
  assert.equal(solve({ kind: "ph-to-h", n: 3 }), -3);       // pH 3 → 10⁻³
  assert.equal(solve({ kind: "ph-to-poh", n: 3 }), 11);     // 14 − 3
  assert.equal(solve({ kind: "poh-to-ph", n: 2 }), 12);
  assert.equal(solve({ kind: "h-to-oh", n: 4 }), -10);      // exponents sum to −14
  assert.equal(solve({ kind: "h-to-oh", n: 7 }), -7);       // neutral is its own partner
  assert.equal(solve({ kind: "oh-to-ph", n: 2 }), 12);      // pOH 2 → pH 12
  assert.throws(() => solve({ kind: "nope", n: 1 }), /unknown kind/);
});

test("solutionPh places every problem on the 0–14 spine", () => {
  assert.equal(solutionPh({ kind: "h-to-ph", n: 5 }), 5);
  assert.equal(solutionPh({ kind: "ph-to-h", n: 3 }), 3);   // the solution IS at pH 3
  assert.equal(solutionPh({ kind: "h-to-oh", n: 9 }), 9);   // basic side
  assert.equal(solutionPh({ kind: "oh-to-ph", n: 10 }), 4); // lots of OH⁻ exponent ≠ basic
});

// ── content cross-check: hand-entered expected vs engine ─────────────────────
test("every content item's hand-entered expected matches the engine", () => {
  for (const tier of TIERS) {
    for (const item of tier.items) {
      assert.equal(solve(item), item.expected, `${tier.id}/${item.id}`);
    }
  }
});

test("content ids are unique and n stays inside 0–14", () => {
  const ids = TIERS.flatMap((t) => t.items.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const tier of TIERS) for (const item of tier.items) {
    assert.ok(item.n >= 0 && item.n <= 14, `${item.id} n out of range`);
  }
});

// ── typed-answer parsing (accepted-set model) ─────────────────────────────────
test("parseTyped accepts plain, signed, spaced, and unicode-minus input", () => {
  assert.equal(parseTyped("12"), 12);
  assert.equal(parseTyped(" +7 "), 7);
  assert.equal(parseTyped("-3"), -3);
  assert.equal(parseTyped("−3"), -3);   // unicode minus
  assert.equal(parseTyped("– 3"), -3);  // en-dash with a space
  assert.ok(Number.isNaN(parseTyped("10^-3"))); // the box IS the exponent — no expressions
  assert.ok(Number.isNaN(parseTyped("three")));
  assert.ok(Number.isNaN(parseTyped("")));
});

// ── grading + sign nudges ─────────────────────────────────────────────────────
test("grade marks the exact answer correct", () => {
  const p = buildProblem({ kind: "h-to-oh", n: 4 });
  assert.deepEqual(grade(p, "-10"), { correct: true, value: -10, nudge: null });
  assert.deepEqual(grade(p, "−10"), { correct: true, value: -10, nudge: null });
});

test("a dropped minus on an exponent answer nudges instead of burning the card", () => {
  const p = buildProblem({ kind: "ph-to-h", n: 3 });      // answer −3
  assert.equal(grade(p, "3").nudge, "exponent-negative");
  assert.equal(grade(p, "3").correct, false);
  assert.equal(grade(p, "-4").nudge, null);               // plain wrong is just wrong
});

test("a spurious minus on a pH/pOH answer nudges too", () => {
  const p = buildProblem({ kind: "h-to-ph", n: 5 });      // answer 5
  assert.equal(grade(p, "-5").nudge, "scale-positive");
  assert.equal(grade(p, "-6").nudge, null);
});

test("pH 0 / exponent 0 never triggers a sign nudge loop", () => {
  const p = buildProblem({ kind: "h-to-ph", n: 0 });      // answer 0
  assert.deepEqual(grade(p, "0"), { correct: true, value: 0, nudge: null });
  assert.equal(grade(p, "-0").correct, true);             // −0 === 0 in JS, and that's fine
});

// ── problems & presentation ──────────────────────────────────────────────────
test("buildProblem carries kind metadata, answer, spine pH, and a hint ladder", () => {
  const p = buildProblem({ kind: "oh-to-ph", n: 5 });
  assert.equal(p.answer, 9);
  assert.equal(p.ph, 9);
  assert.equal(p.answerKind, "integer");
  assert.equal(p.ask, "pH");
  assert.ok(p.hints.length >= 2);
  assert.throws(() => buildProblem({ kind: "nope", n: 1 }), /unknown kind/);
});

test("formatAnswer prints concentrations as real superscript powers", () => {
  assert.equal(supNum(-10), "⁻¹⁰");
  assert.equal(formatAnswer(buildProblem({ kind: "ph-to-h", n: 3 })), "10⁻³ M");
  assert.equal(formatAnswer(buildProblem({ kind: "ph-to-poh", n: 3 })), "pOH 11");
});
