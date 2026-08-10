import { test } from "node:test";
import assert from "node:assert/strict";

import { solve, solutionPh, buildProblem, parseTyped, grade, supNum, formatAnswer, massExp, concStr, dilute, volFactorExp, isApprox,
  ladderRank, ladderChip, ladderSolve, ladderGrade, ladderHints } from "./ph.js";
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
    for (const item of tier.items ?? []) {
      assert.equal(solve(item), item.expected, `${tier.id}/${item.id}`);
    }
  }
});

test("content ids are unique, n stays inside 0–14, and every answer lands on the 0–14 spine", () => {
  const ids = TIERS.flatMap((t) => [...(t.items ?? []), ...(t.puzzles ?? [])].map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const tier of TIERS) for (const item of tier.items ?? []) {
    if ("n" in item) assert.ok(item.n >= 0 && item.n <= 14, `${item.id} n out of range`);
    const ph = solutionPh(item);
    assert.ok(ph >= 0 && ph <= 14, `${item.id} solution pH ${ph} off the spine`);
  }
});

// ── rung 2: strong stuff ──────────────────────────────────────────────────────
test("strong acids read [H+] straight off the label, diprotics double it", () => {
  assert.equal(solve({ kind: "strong-acid", species: "HCl", ions: 1, mantissa: 1, exp: 2 }), 2);
  assert.equal(solve({ kind: "strong-acid", species: "HNO3", ions: 1, mantissa: 1, exp: 0 }), 0);     // 1 M
  assert.equal(solve({ kind: "strong-acid", species: "H2SO4", ions: 2, mantissa: 5, exp: 3 }), 2);    // 0.005 → 0.01
  assert.equal(solve({ kind: "strong-acid", species: "H2SO4", ions: 2, mantissa: 5, exp: 2 }), 1);
});

test("strong bases route through pOH and 14", () => {
  assert.equal(solve({ kind: "strong-base", species: "NaOH", ions: 1, mantissa: 1, exp: 2 }), 12);
  assert.equal(solve({ kind: "strong-base", species: "Ba(OH)2", ions: 2, mantissa: 5, exp: 3 }), 12); // 0.005 → [OH-] 0.01
});

test("unclean ion products throw — the no-calculator promise is enforced", () => {
  assert.throws(() => solve({ kind: "strong-acid", species: "X", ions: 1, mantissa: 5, exp: 3 }), /clean power of ten/);
  assert.throws(() => solve({ kind: "strong-acid", species: "X", ions: 2, mantissa: 1, exp: 3 }), /clean power of ten/);
});

test("the mass chain lands exactly on a power of ten, or throws", () => {
  assert.equal(massExp({ mass: 0.73, vol: 20, molar: 36.5 }), 3);   // 0.02 mol / 20 L = 0.001 M
  assert.equal(solve({ kind: "mass-acid", species: "HCl", mass: 0.73, vol: 20, molar: 36.5 }), 3);
  assert.equal(solve({ kind: "mass-base", species: "NaOH", mass: 4, vol: 10, molar: 40 }), 12);
  assert.throws(() => massExp({ mass: 1, vol: 1, molar: 36.5 }), /clean power of ten/);
});

test("rung-2 problems still grade, nudge, and format like the family", () => {
  const p = buildProblem({ kind: "strong-base", species: "NaOH", ions: 1, mantissa: 1, exp: 2 });
  assert.equal(p.answerKind, "integer");
  assert.equal(p.ph, 12);
  assert.equal(grade(p, "12").correct, true);
  assert.equal(grade(p, "-12").nudge, "scale-positive");
  assert.equal(formatAnswer(p), "pH 12");
  assert.equal(p.hints.length, 3);
});

test("concStr prints exam-style decimals for small exponents", () => {
  assert.equal(concStr({ mantissa: 5, exp: 3 }), "0.005 M");
  assert.equal(concStr({ mantissa: 1, exp: 2 }), "0.01 M");
  assert.equal(concStr({ mantissa: 1, exp: 0 }), "1 M");
});

// ── rung 3: dilution ──────────────────────────────────────────────────────────
test("dilute walks toward 7 and clamps there — from both sides", () => {
  assert.deepEqual(dilute(2, 1, "acid"), { ph: 3, approx: false });
  assert.deepEqual(dilute(1, 3, "acid"), { ph: 4, approx: false });
  assert.deepEqual(dilute(6, 2, "acid"), { ph: 7, approx: true });   // formally 8 — the discovery
  assert.deepEqual(dilute(5, 2, "acid"), { ph: 7, approx: true });   // landing exactly on 7 formally is still ≈
  assert.deepEqual(dilute(12, 2, "base"), { ph: 10, approx: false });
  assert.deepEqual(dilute(8, 1, "base"), { ph: 7, approx: true });
  assert.deepEqual(dilute(7, 3, "acid"), { ph: 10, approx: false }); // degenerate: already at 7 — no clamp claim
  assert.throws(() => dilute(3, 1, "sideways"), /unknown side/);
});

test("volFactorExp reads made-up-to volumes, powers of ten only", () => {
  assert.equal(volFactorExp(10, 1), 2);     // 10 mL → 1 L = ×100
  assert.equal(volFactorExp(50, 5), 2);     // 50 mL → 5 L = ×100
  assert.equal(volFactorExp(1, 0.01), 1);   // 1 mL → 10 mL
  assert.throws(() => volFactorExp(50, 1), /power of ten/);  // ×20 is not clean
});

test("the dilution card kinds solve to exam answers", () => {
  assert.equal(solve({ kind: "dilute-made", side: "acid", exp: 1, startVolMl: 50, endVolL: 5 }), 3);        // 2017 shape
  assert.equal(solve({ kind: "dilute-add", side: "acid", startVolMl: 1, startPh: 3, targetPh: 5 }), 99);    // 2024 shape: ADDED
  assert.equal(solve({ kind: "dilute-add", side: "acid", startVolMl: 10, startPh: 2, targetPh: 3 }), 90);
  assert.equal(solve({ kind: "dilute-factor", side: "acid", startPh: 1, targetPh: 4 }), 1000);
  assert.equal(solve({ kind: "dilute-by", side: "acid", startPh: 6, factorK: 3 }), 7);
  assert.equal(isApprox({ kind: "dilute-by", side: "acid", startPh: 6, factorK: 3 }), true);
  assert.equal(isApprox({ kind: "dilute-by", side: "acid", startPh: 2, factorK: 3 }), false);
});

test("volume and factor answers parse and grade without sign nudges", () => {
  assert.equal(parseTyped("1000"), 1000);
  assert.equal(parseTyped("×1000"), 1000);   // typed with the times sign — accepted
  assert.equal(parseTyped("x100"), 100);
  const add = buildProblem({ kind: "dilute-add", side: "acid", startVolMl: 1, startPh: 3, targetPh: 5 });
  assert.equal(grade(add, "99").correct, true);
  assert.deepEqual(grade(add, "100"), { correct: false, value: 100, nudge: null });  // the trap is WRONG, not a nudge
  const factor = buildProblem({ kind: "dilute-factor", side: "acid", startPh: 1, targetPh: 4 });
  assert.equal(grade(factor, "1000").correct, true);
  assert.equal(formatAnswer(add), "99 mL");
  assert.equal(formatAnswer(factor), "× 1000");
});

test("approx problems accept the typed 7 and format with the ≈", () => {
  const p = buildProblem({ kind: "dilute-by", side: "acid", startPh: 6, factorK: 3 });
  assert.equal(p.approx, true);
  assert.equal(grade(p, "7").correct, true);
  assert.equal(grade(p, "9").correct, false);   // the formal-arithmetic wrong answer
  assert.equal(formatAnswer(p), "pH ≈7");
});

// ── rung 4: the pH Ladder ─────────────────────────────────────────────────────
test("ladder ranks follow the one rule, both directions", () => {
  assert.ok(ladderRank("H2SO4") < ladderRank("HCl"));
  assert.ok(ladderRank("HCl") < ladderRank("CH3COOH"));
  assert.ok(ladderRank("CH3COOH") < ladderRank("NaCl"));
  assert.equal(ladderRank("NaCl"), ladderRank("H2O"));       // both live at 7
  assert.ok(ladderRank("H2O") < ladderRank("NH3"));
  assert.ok(ladderRank("NH3") < ladderRank("NaOH"));
  assert.ok(ladderRank("NaOH") < ladderRank("Ba(OH)2"));
  assert.throws(() => ladderRank("C6H6"), /unknown ladder species/);
  assert.equal(ladderChip("H2SO4"), "strong acid · 2 H⁺");
});

test("ladderSolve orders by class, honors direction, and refuses ties", () => {
  assert.deepEqual(ladderSolve({ direction: "inc", species: ["NaOH", "HCl", "NaCl"] }), ["HCl", "NaCl", "NaOH"]);
  assert.deepEqual(ladderSolve({ direction: "dec", species: ["H2O", "NH3", "HCl", "Ba(OH)2", "HCOOH"] }),
    ["Ba(OH)2", "NH3", "H2O", "HCOOH", "HCl"]);
  assert.throws(() => ladderSolve({ direction: "inc", species: ["HCl", "HNO3", "NaOH"] }), /class tie/);   // two sa1
  assert.throws(() => ladderSolve({ direction: "inc", species: ["NaCl", "H2O", "HCl"] }), /class tie/);    // both at 7
});

test("ladderGrade marks per-slot and overall", () => {
  const p = { direction: "inc", species: ["NaOH", "HCl", "NaCl"] };
  assert.deepEqual(ladderGrade(["HCl", "NaCl", "NaOH"], p).perSlot, [true, true, true]);
  const g = ladderGrade(["NaCl", "HCl", "NaOH"], p);
  assert.equal(g.correct, false);
  assert.deepEqual(g.perSlot, [false, false, true]);
  assert.deepEqual(g.expected, ["HCl", "NaCl", "NaOH"]);
});

test("every ladder puzzle's hand-entered expected matches the engine, tie-free", () => {
  for (const tier of TIERS) {
    if (!tier.puzzles) continue;
    for (const p of tier.puzzles) {
      assert.deepEqual(ladderSolve(p), p.expected, p.id);
      assert.ok(ladderHints(p).length >= 3, `${p.id} hints`);
    }
    assert.ok(tier.puzzles.some((p) => p.direction === "dec"), "one decreasing puzzle must exist");
  }
});

test("every scripted bench step's hand-entered chain matches dilute()", () => {
  for (const tier of TIERS) {
    if (!tier.sessions) continue;
    for (const s of tier.sessions) {
      let ph = s.startPh;
      for (const step of s.steps) {
        const out = dilute(ph, step.k, s.side);
        assert.equal(out.ph, step.expected, `${s.id} step ×10^${step.k} from ${ph}`);
        assert.equal(out.approx, step.approx, `${s.id} approx flag from ${ph}`);
        ph = out.ph;
      }
      assert.equal(ph, 7, `${s.id} must end at the ≈7 wall — that's the discovery`);
    }
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
