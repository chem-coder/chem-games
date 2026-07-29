// Run: node --test organic-nomenclature/js/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALKANES, ALKANE_BY_N, ROOTS, alkaneFormula, condensedFormula, toSubHtml, toChainHtml,
  buildProblem, buildProblemCondensed, LEVELS, gradeAnswer, makeDealer, requeue, DEFAULT_ROUND,
  distinctSlots, unsaturatedName, unsaturatedFormula, unsaturatedCondensed,
  ENE_SPECS, YNE_SPECS, buildProblemUnsaturated, makeUnsaturatedDealer
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

test("the ladder: molecular, condensed, then build-only alkenes & alkynes", () => {
  assert.deepEqual(LEVELS.map((l) => l.id), ["molecular", "condensed", "unsaturated"]);
  assert.equal(LEVELS[0].build({ n: 6 }).prompt, "C6H14");
  assert.equal(LEVELS[1].build({ n: 6 }).prompt, "CH3CH2CH2CH2CH2CH3");
  assert.ok(LEVELS[2].buildOnly, "no formula→name direction for enes/ynes");
});

// ── rung 3: alkenes & alkynes ───────────────────────────────────────────────────
test("unsaturated names: locant only when the chain leaves a choice", () => {
  assert.equal(unsaturatedName({ n: 2, slot: 1, order: 2 }), "ethene");
  assert.equal(unsaturatedName({ n: 3, slot: 1, order: 3 }), "propyne");
  assert.equal(unsaturatedName({ n: 4, slot: 1, order: 2 }), "but-1-ene");
  assert.equal(unsaturatedName({ n: 4, slot: 2, order: 3 }), "but-2-yne");
  assert.equal(unsaturatedName({ n: 6, slot: 3, order: 2 }), "hex-3-ene");
});

test("symmetry caps the slots: no pent-3-ene, 25 specs per family", () => {
  assert.equal(distinctSlots(5), 2);   // pent-3-ene is pent-2-ene from the other end
  assert.equal(distinctSlots(10), 5);
  assert.equal(ENE_SPECS.length, 25);
  assert.equal(YNE_SPECS.length, 25);
  assert.ok(ENE_SPECS.every((s) => s.slot <= distinctSlots(s.n) && s.order === 2));
  assert.ok(YNE_SPECS.every((s) => s.order === 3));
});

test("unsaturated formulas: a double bond costs 2 H, a triple costs 4", () => {
  assert.equal(unsaturatedFormula({ n: 4, slot: 1, order: 2 }), "C4H8");
  assert.equal(unsaturatedFormula({ n: 4, slot: 2, order: 3 }), "C4H6");
});

test("condensed spellings draw the bond in", () => {
  assert.equal(unsaturatedCondensed({ n: 2, slot: 1, order: 2 }), "CH2=CH2");
  assert.equal(unsaturatedCondensed({ n: 2, slot: 1, order: 3 }), "CH≡CH");
  assert.equal(unsaturatedCondensed({ n: 4, slot: 1, order: 2 }), "CH2=CHCH2CH3");
  assert.equal(unsaturatedCondensed({ n: 4, slot: 2, order: 3 }), "CH3C≡CCH3");
  assert.equal(unsaturatedCondensed({ n: 3, slot: 1, order: 2 }), "CH2=CHCH3");
});

test("unsaturated problems: name prompt, 3 hints, locant spelled out", () => {
  const p = buildProblemUnsaturated({ n: 5, slot: 2, order: 2 });
  assert.equal(p.prompt, "pent-2-ene");
  assert.equal(p.mode, "build");
  assert.equal(p.hints.length, 3);
  assert.match(p.hints[1], /between C‑2 and C‑3/);
});

test("rung-3 dealer recipe: 1 alkane + 2 alkenes + 2 alkynes, shuffled", () => {
  const deal = makeUnsaturatedDealer();
  for (let round = 0; round < 12; round++) {
    const cards = deal();
    assert.equal(cards.length, 5);
    assert.equal(cards.filter((c) => !c.order).length, 1, "one alkane");
    assert.equal(cards.filter((c) => c.order === 2).length, 2, "two alkenes");
    assert.equal(cards.filter((c) => c.order === 3).length, 2, "two alkynes");
  }
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
