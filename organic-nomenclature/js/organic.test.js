// Run: node --test organic-nomenclature/js/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALKANES, ALKANE_BY_N, ROOTS, alkaneFormula, condensedFormula, toSubHtml, toChainHtml,
  buildProblem, buildProblemCondensed, LEVELS, gradeAnswer, makeDealer, requeue, DEFAULT_ROUND,
  distinctSlots, unsaturatedName, unsaturatedFormula, unsaturatedCondensed,
  ENE_SPECS, YNE_SPECS, buildProblemUnsaturated, makeUnsaturatedDealer,
  BRANCHED_SPECS, branchedName, branchedFormula, branchedCondensed, makeBranchedDealer,
  ALCOHOL_SPECS, alcoholName, alcoholFormula, alcoholCondensed, makeAlcoholDealer,
  buildAnyStructure,
  FAMILIES, ALDEHYDE_SPECS, KETONE_SPECS, ETHER_SPECS, ACID_SPECS, ESTER_SPECS,
  AMINE_SPECS, AMIDE_SPECS, buildProblemFamily,
  makeCarbonylDealer, makeEtherDealer, makeAcidEsterDealer, makeNitrogenDealer
} from "./organic.js";
import { componentFormulas } from "./chem.js";

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

test("the ladder: two typed rungs, then seven build-only rungs", () => {
  assert.deepEqual(
    LEVELS.map((l) => l.id),
    ["molecular", "condensed", "unsaturated", "branched", "alcohols", "carbonyls", "ethers", "acids", "nitrogen"]
  );
  assert.equal(LEVELS[0].build({ n: 6 }).prompt, "C6H14");
  assert.equal(LEVELS[1].build({ n: 6 }).prompt, "CH3CH2CH2CH2CH2CH3");
  assert.ok(LEVELS.slice(2).every((l) => l.buildOnly), "everything past the alkane spellings is build-only");
  assert.deepEqual(LEVELS[4].trayElements, ["C", "O"], "alcohols put oxygen in the tray");
  assert.deepEqual(LEVELS[8].trayElements, ["C", "N", "O"], "amines & amides add nitrogen");
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

// ── rung 4: branching ───────────────────────────────────────────────────────────
test("branched specs are exactly the valid IUPAC names", () => {
  const names = BRANCHED_SPECS.map(branchedName);
  assert.equal(BRANCHED_SPECS.length, 22);
  assert.ok(names.includes("2-methylpropane"));
  assert.ok(names.includes("2,2-dimethylpropane"));
  assert.ok(names.includes("3-methylpentane"));
  assert.ok(names.includes("2,3-dimethylbutane"));
  assert.ok(!names.includes("3-methylbutane"), "would be 2-methylbutane from the other end");
  assert.ok(!names.includes("3,3-dimethylbutane"), "would be 2,2- from the other end");
  assert.ok(!names.includes("1-methylpropane"), "a branch on C-1 just lengthens the chain");
  // total carbons stay buildable
  assert.ok(BRANCHED_SPECS.every((s) => s.m + s.methyls.length <= 8));
});

test("branched names, formulas, condensed spellings", () => {
  assert.equal(branchedName({ m: 4, methyls: [2] }), "2-methylbutane");
  assert.equal(branchedFormula({ m: 4, methyls: [2] }), "C5H12");
  assert.equal(branchedCondensed({ m: 4, methyls: [2] }), "CH3CH(CH3)CH2CH3");
  assert.equal(branchedCondensed({ m: 3, methyls: [2, 2] }), "CH3C(CH3)2CH3");
  assert.equal(branchedCondensed({ m: 4, methyls: [2, 3] }), "CH3CH(CH3)CH(CH3)CH3");
});

// ── rung 5: alcohols ────────────────────────────────────────────────────────────
test("alcohol names: locant only from three carbons up", () => {
  assert.equal(alcoholName({ n: 1, oh: 1 }), "methanol");
  assert.equal(alcoholName({ n: 2, oh: 1 }), "ethanol");
  assert.equal(alcoholName({ n: 3, oh: 2 }), "propan-2-ol");
  assert.equal(alcoholName({ n: 6, oh: 3 }), "hexan-3-ol");
  assert.equal(ALCOHOL_SPECS.length, 12);
  assert.ok(!ALCOHOL_SPECS.some((s) => s.oh > Math.ceil(s.n / 2)), "no butan-3-ol");
});

test("alcohol formulas and condensed spellings", () => {
  assert.equal(alcoholFormula({ n: 1, oh: 1 }), "CH4O");
  assert.equal(alcoholFormula({ n: 3, oh: 2 }), "C3H8O");
  assert.equal(alcoholCondensed({ n: 1, oh: 1 }), "CH3OH");
  assert.equal(alcoholCondensed({ n: 3, oh: 1 }), "CH3CH2CH2OH");
  assert.equal(alcoholCondensed({ n: 3, oh: 2 }), "CH3CH(OH)CH3");
  assert.equal(alcoholCondensed({ n: 4, oh: 2 }), "CH3CH2CH(OH)CH3");
});

test("buildAnyStructure routes every spec shape to the right problem", () => {
  assert.equal(buildAnyStructure({ n: 4 }).prompt, "butane");
  assert.equal(buildAnyStructure({ n: 4, slot: 2, order: 3 }).prompt, "but-2-yne");
  assert.equal(buildAnyStructure({ m: 4, methyls: [2] }).prompt, "2-methylbutane");
  assert.equal(buildAnyStructure({ n: 3, oh: 2 }).prompt, "propan-2-ol");
});

test("rung 4/5 dealers: five distinct cards per round", () => {
  for (const [make, name] of [[makeBranchedDealer, branchedName], [makeAlcoholDealer, alcoholName]]) {
    const deal = make();
    for (let r = 0; r < 6; r++) {
      const cards = deal();
      assert.equal(cards.length, 5);
      assert.equal(new Set(cards.map(name)).size, 5, "no repeats within a round");
    }
  }
});

// ── rungs 6–9: functional groups ────────────────────────────────────────────────
const ALL_FAMILY_SPECS = [
  ...ALDEHYDE_SPECS, ...KETONE_SPECS, ...ETHER_SPECS,
  ...ACID_SPECS, ...ESTER_SPECS, ...AMINE_SPECS, ...AMIDE_SPECS
];

test("every family target graph reproduces its own molecular formula", () => {
  // the deepest consistency check we have: the graph's derived hydrogens must
  // agree with the family's CnHmX arithmetic, for all 43 specs
  for (const spec of ALL_FAMILY_SPECS) {
    const p = buildProblemFamily(spec);
    assert.deepEqual(componentFormulas(p.target.atoms, p.target.bonds), [p.formula], p.prompt);
  }
});

test("functional-group names", () => {
  assert.equal(FAMILIES.aldehyde.name({ n: 2 }), "ethanal");
  assert.equal(FAMILIES.ketone.name({ n: 3, slot: 2 }), "propan-2-one");
  assert.equal(FAMILIES.ketone.name({ n: 6, slot: 3 }), "hexan-3-one");
  assert.equal(FAMILIES.ether.name({ alkoxy: 1, n: 1, at: 1 }), "methoxymethane");
  assert.equal(FAMILIES.ether.name({ alkoxy: 1, n: 3, at: 2 }), "2-methoxypropane");
  assert.equal(FAMILIES.acid.name({ n: 1 }), "methanoic acid");
  assert.equal(FAMILIES.ester.name({ acyl: 2, alkyl: 1 }), "methyl ethanoate");
  assert.equal(FAMILIES.amine.name({ n: 1, at: 1 }), "methanamine");
  assert.equal(FAMILIES.amine.name({ n: 3, at: 2 }), "propan-2-amine");
  assert.equal(FAMILIES.amide.name({ n: 2 }), "ethanamide");
});

test("functional-group condensed spellings", () => {
  assert.equal(FAMILIES.aldehyde.condensed({ n: 1 }), "HCHO");
  assert.equal(FAMILIES.aldehyde.condensed({ n: 3 }), "CH3CH2CHO");
  assert.equal(FAMILIES.ketone.condensed({ n: 3, slot: 2 }), "CH3COCH3");
  assert.equal(FAMILIES.ketone.condensed({ n: 6, slot: 3 }), "CH3CH2CH2COCH2CH3");
  assert.equal(FAMILIES.ether.condensed({ alkoxy: 1, n: 2, at: 1 }), "CH3OCH2CH3");
  assert.equal(FAMILIES.ether.condensed({ alkoxy: 1, n: 3, at: 2 }), "CH3CH(OCH3)CH3");
  assert.equal(FAMILIES.acid.condensed({ n: 1 }), "HCOOH");
  assert.equal(FAMILIES.acid.condensed({ n: 3 }), "CH3CH2COOH");
  assert.equal(FAMILIES.ester.condensed({ acyl: 2, alkyl: 1 }), "CH3COOCH3");
  assert.equal(FAMILIES.ester.condensed({ acyl: 1, alkyl: 2 }), "HCOOCH2CH3");
  assert.equal(FAMILIES.amine.condensed({ n: 1, at: 1 }), "CH3NH2");
  assert.equal(FAMILIES.amine.condensed({ n: 3, at: 2 }), "CH3CH(NH2)CH3");
  assert.equal(FAMILIES.amide.condensed({ n: 2 }), "CH3CONH2");
});

test("ether reveals carry the trivial name", () => {
  assert.equal(buildProblemFamily({ kind: "ether", alkoxy: 1, n: 1, at: 1 }).answer, "methoxymethane (dimethyl ether)");
  assert.equal(buildProblemFamily({ kind: "ether", alkoxy: 1, n: 3, at: 2 }).answer, "2-methoxypropane");
});

test("functional-group dealer recipes", () => {
  const recipes = [
    [makeCarbonylDealer, (c) => [c.filter((s) => s.kind === "aldehyde").length, c.filter((s) => s.kind === "ketone").length], [2, 3]],
    [makeAcidEsterDealer, (c) => [c.filter((s) => s.kind === "acid").length, c.filter((s) => s.kind === "ester").length], [2, 3]],
    [makeNitrogenDealer, (c) => [c.filter((s) => s.kind === "amine").length, c.filter((s) => s.kind === "amide").length], [3, 2]]
  ];
  for (const [make, split, want] of recipes) {
    const deal = make();
    for (let r = 0; r < 8; r++) {
      const cards = deal();
      assert.equal(cards.length, 5);
      assert.deepEqual(split(cards), want);
    }
  }
  const ethers = makeEtherDealer()();
  assert.equal(ethers.length, 5);
  assert.equal(new Set(ethers.map((s) => FAMILIES.ether.name(s))).size, 5);
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
