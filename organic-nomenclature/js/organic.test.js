// Run: node --test organic-nomenclature/js/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALKANES, ALKANE_BY_N, ROOTS, alkaneFormula, condensedFormula, toSubHtml, toChainHtml,
  buildProblem, buildProblemCondensed, LEVELS, gradeAnswer, makeDealer, requeue, DEFAULT_ROUND
} from "./organic.js";

// ── the deck: ten alkanes, CnH2n+2, root + -ane ─────────────────────────────────
test("deck holds exactly C1..C10 with CnH2n+2 formulas", () => {
  assert.equal(ALKANES.length, 10);
  for (const a of ALKANES) {
    assert.equal(a.formula, alkaneFormula(a.n));
    const m = a.formula.match(/^C(\d*)H(\d+)$/);
    assert.ok(m, `${a.formula} parses`);
    assert.equal(m[1] === "" ? 1 : Number(m[1]), a.n);
    assert.equal(Number(m[2]), 2 * a.n + 2);
  }
});

test("names are the WS oracle set, root + -ane", () => {
  const expected = ["methane", "ethane", "propane", "butane", "pentane",
    "hexane", "heptane", "octane", "nonane", "decane"];
  assert.deepEqual(ALKANES.map((a) => a.name), expected);
  ALKANES.forEach((a, i) => assert.equal(a.name, ROOTS[i] + "ane"));
});

test("subscript-1 is never written; others render as <sub>", () => {
  assert.equal(ALKANE_BY_N[1].formula, "CH4");
  assert.equal(toSubHtml("C4H10"), "C<sub>4</sub>H<sub>10</sub>");
});

test("chain html breaks only between groups, never before a subscript", () => {
  assert.equal(
    toChainHtml("CH3CH2CH3"),
    "CH<sub>3</sub><wbr>CH<sub>2</sub><wbr>CH<sub>3</sub>" // no trailing <wbr>
  );
});

// ── problems ────────────────────────────────────────────────────────────────────
test("buildProblem: prompt is the formula, answer the name, 3 hints", () => {
  const p = buildProblem({ n: 4 });
  assert.equal(p.mode, "name");
  assert.equal(p.prompt, "C4H10");
  assert.equal(p.answer, "butane");
  assert.equal(p.hints.length, 3);
  assert.match(p.hints[1], /4 carbons/);
  assert.match(p.hints[1], /but/);
});

test("buildProblem refuses the unbuilt formula direction loudly", () => {
  assert.throws(() => buildProblem({ n: 2 }, "formula"));
  assert.throws(() => buildProblemCondensed({ n: 2 }, "formula"));
});

// ── rung 2: condensed spellings ─────────────────────────────────────────────────
test("condensed spelling: CH3 caps around CH2 links, one group per carbon", () => {
  assert.equal(condensedFormula(1), "CH4");           // no chain to cap
  assert.equal(condensedFormula(2), "CH3CH3");
  assert.equal(condensedFormula(4), "CH3CH2CH2CH3");
  assert.equal(condensedFormula(10), "CH3" + "CH2".repeat(8) + "CH3");
  for (const a of ALKANES) {
    const groups = a.condensed.match(/CH\d/g);
    assert.equal(groups.length, a.n, `${a.name}: ${a.n} carbon groups`);
    const h = groups.reduce((sum, g) => sum + Number(g[2]), 0);
    assert.equal(h, 2 * a.n + 2, `${a.name}: H total matches CnH2n+2`);
  }
});

test("condensed problems prompt with the chain and grade the same names", () => {
  const p = buildProblemCondensed({ n: 4 });
  assert.equal(p.prompt, "CH3CH2CH2CH3");
  assert.equal(p.answer, "butane");
  assert.equal(p.hints.length, 3);
  assert.match(p.hints[1], /4 carbons/);
  assert.ok(gradeAnswer(p, " Butane ").correct);
  assert.ok(gradeAnswer(p, "n-butane").correct);
  assert.ok(!gradeAnswer(p, "propane").correct);
});

test("the ladder: molecular then condensed, same deck", () => {
  assert.deepEqual(LEVELS.map((l) => l.id), ["molecular", "condensed"]);
  assert.equal(LEVELS[0].build({ n: 6 }).prompt, "C6H14");
  assert.equal(LEVELS[1].build({ n: 6 }).prompt, "CH3CH2CH2CH2CH2CH3");
});

// ── grading: accepted set, case/space-forgiving, chemistry-strict ───────────────
test("grading forgives case and stray spacing", () => {
  const p = buildProblem({ n: 7 });
  assert.ok(gradeAnswer(p, "heptane").correct);
  assert.ok(gradeAnswer(p, "  Heptane ").correct);
  assert.ok(!gradeAnswer(p, "heptene").correct); // wrong family
  assert.ok(!gradeAnswer(p, "hexane").correct);  // wrong root
});

test("n- prefix accepted from butane up, not below", () => {
  assert.ok(gradeAnswer(buildProblem({ n: 4 }), "n-butane").correct);
  assert.ok(gradeAnswer(buildProblem({ n: 10 }), "N-Decane").correct);
  assert.ok(!gradeAnswer(buildProblem({ n: 3 }), "n-propane").correct);
});

// ── dealing ─────────────────────────────────────────────────────────────────────
test("a round deals distinct cards; two rounds cover all ten", () => {
  const deal = makeDealer();
  const seen = new Set();
  for (const round of [deal(DEFAULT_ROUND), deal(DEFAULT_ROUND)]) {
    assert.equal(round.length, DEFAULT_ROUND);
    assert.equal(new Set(round.map((s) => s.n)).size, DEFAULT_ROUND); // distinct within a round
    round.forEach((s) => seen.add(s.n));
  }
  assert.equal(seen.size, 10); // bag: no repeats until the whole deck is dealt
});

test("requeue drops mastered cards and rotates missed ones", () => {
  const q = [{ n: 1 }, { n: 2 }, { n: 3 }];
  assert.deepEqual(requeue(q, true), [{ n: 2 }, { n: 3 }]);
  assert.deepEqual(requeue(q, false), [{ n: 2 }, { n: 3 }, { n: 1 }]);
  assert.deepEqual(requeue([], true), []);
});
