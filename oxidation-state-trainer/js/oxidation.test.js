import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseFormula, knownOxidation, oxidationStateOf, signedOx, parseSigned, gradeOx, buildHints, buildProblem,
  halfReactionOf, buildHalfReaction, gradeHalf
} from "./oxidation.js";
import { TIERS } from "./content.js";

// ── parsing ──────────────────────────────────────────────────────────────────
test("parseFormula splits symbols and counts, defaulting a missing count to 1", () => {
  assert.deepEqual(parseFormula("MnO4"), [{ el: "Mn", count: 1 }, { el: "O", count: 4 }]);
  assert.deepEqual(parseFormula("Cr2O7"), [{ el: "Cr", count: 2 }, { el: "O", count: 7 }]);
  assert.deepEqual(parseFormula("Cl2"), [{ el: "Cl", count: 2 }]);
  assert.deepEqual(parseFormula("Na"), [{ el: "Na", count: 1 }]);
  assert.throws(() => parseFormula("xY"), /can't parse/); // lowercase-led junk isn't a symbol
  assert.throws(() => parseFormula(""), /can't parse/);
});

// ── the assignment rules ──────────────────────────────────────────────────────
test("knownOxidation assigns the by-sight states, and nothing else", () => {
  assert.equal(knownOxidation("F"), -1);
  assert.equal(knownOxidation("O"), -2);
  assert.equal(knownOxidation("H"), 1);
  assert.equal(knownOxidation("Na"), 1);
  assert.equal(knownOxidation("Ca"), 2);
  assert.equal(knownOxidation("Cl"), -1);
  assert.equal(knownOxidation("Mn"), null); // a transition metal must be solved for, never assigned
  assert.equal(knownOxidation("S"), null);
});

// ── the solver (the headline cases) ───────────────────────────────────────────
test("oxidationStateOf solves the central / variable atom", () => {
  assert.equal(oxidationStateOf({ formula: "MnO4", charge: -1, target: "Mn" }).targetOx, 7);
  assert.equal(oxidationStateOf({ formula: "Cr2O7", charge: -2, target: "Cr" }).targetOx, 6);
  assert.equal(oxidationStateOf({ formula: "SO4", charge: -2, target: "S" }).targetOx, 6);
  assert.equal(oxidationStateOf({ formula: "NH3", charge: 0, target: "N" }).targetOx, -3);
  assert.equal(oxidationStateOf({ formula: "N2O", charge: 0, target: "N" }).targetOx, 1);
  assert.equal(oxidationStateOf({ formula: "O2", charge: 0, target: "O" }).targetOx, 0); // free element
  assert.equal(oxidationStateOf({ formula: "Al", charge: 3, target: "Al" }).targetOx, 3); // monatomic ion
});

test("the solver reports the reasoning the hint ladder needs", () => {
  const s = oxidationStateOf({ formula: "Cr2O7", charge: -2, target: "Cr" });
  assert.equal(s.targetCount, 2);
  assert.equal(s.knownTotal, -14);           // 7 × (−2)
  assert.deepEqual(s.assigned, [{ el: "O", count: 7, ox: -2, subtotal: -14 }]);
});

test("the solver throws on an un-assignable partner or a non-integer answer (malformed item guard)", () => {
  assert.throws(() => oxidationStateOf({ formula: "MnFe", charge: 0, target: "Mn" }), /can't assign/); // Fe isn't sight-known
  assert.throws(() => oxidationStateOf({ formula: "Fe3O4", charge: 0, target: "Fe" }), /whole/); // mixed-valence: +8/3 isn't an integer
});

// ── the ORACLE: every ox-state item's computed value matches its hand-entered expected ──
for (const tier of TIERS.filter((t) => t.kind === "oxstate")) {
  for (const item of tier.items) {
    test(`oracle ${tier.id}: ${item.id} → ${item.expected}`, () => {
      const got = oxidationStateOf(item).targetOx;
      assert.equal(got, item.expected, `${item.formula} (charge ${item.charge}) target ${item.target}`);
    });
  }
}

test("content is well-formed: unique ids; ox-state items solvable; half-reaction items balanced", () => {
  const ids = new Set();
  for (const tier of TIERS) {
    for (const item of tier.items) {
      assert.ok(!ids.has(item.id), `duplicate id ${item.id}`);
      ids.add(item.id);
      if (tier.kind === "oxstate") {
        assert.doesNotThrow(() => oxidationStateOf(item)); // throws if a non-target atom isn't assignable
      } else {
        const h = halfReactionOf(item);
        assert.ok(h.electrons > 0, `${item.id} moves electrons`);
        assert.ok(h.direction === "oxidation" || h.direction === "reduction", `${item.id} has a direction`);
      }
    }
  }
});

// ── formatting + grading ──────────────────────────────────────────────────────
test("signedOx writes oxidation states sign-first (+7, −2, 0)", () => {
  assert.equal(signedOx(7), "+7");
  assert.equal(signedOx(-2), "−2");
  assert.equal(signedOx(0), "0");
});

test("parseSigned is forgiving on positives but requires the sign on negatives", () => {
  assert.equal(parseSigned("+7"), 7);
  assert.equal(parseSigned("7"), 7);    // a bare number is positive
  assert.equal(parseSigned("-2"), -2);
  assert.equal(parseSigned("−2"), -2);  // unicode minus
  assert.equal(parseSigned("0"), 0);
  assert.ok(Number.isNaN(parseSigned("two")));
  assert.ok(Number.isNaN(parseSigned("")));
});

test("gradeOx: a sign error is wrong (typing 2 for −2)", () => {
  assert.equal(gradeOx(7, "+7").correct, true);
  assert.equal(gradeOx(7, "7").correct, true);
  assert.equal(gradeOx(-2, "−2").correct, true);
  assert.equal(gradeOx(-2, "2").correct, false);  // the trap: missing sign → +2 ≠ −2
  assert.equal(gradeOx(0, "0").correct, true);
});

// ── hint ladder ───────────────────────────────────────────────────────────────
test("tier-1 items get a single rule hint; molecules/ions get the 3-rung walk", () => {
  const free = buildHints(oxidationStateOf({ formula: "O2", charge: 0, target: "O" }));
  assert.equal(free.length, 1);
  assert.match(free[0], /free element/i);

  const ion = buildHints(oxidationStateOf({ formula: "Na", charge: 1, target: "Na" }));
  assert.equal(ion.length, 1);
  assert.match(ion[0], /monatomic ion/i);

  const mno4 = buildHints(oxidationStateOf({ formula: "MnO4", charge: -1, target: "Mn" }));
  assert.equal(mno4.length, 3);
  assert.match(mno4[1], /Oxygen is <strong>−2<\/strong>.*oxygens.*−8/); // assign step names the atom (… oxygens …)
  assert.match(mno4[2], /x = \+7/);                                        // solve step sets up x and lands on +7
});

test("buildProblem bundles the answer + the x-equation hints for the UI", () => {
  const p = buildProblem({ formula: "Cr2O7", charge: -2, target: "Cr" });
  assert.equal(p.answer, "+6");
  assert.equal(p.targetOx, 6);
  assert.equal(p.hints.length, 3);
  assert.match(p.hints[2], /2·x \+ \(−14\) = −2/); // the equation is built with x for the 2 Cr
  assert.match(p.hints[2], /x = \+6/);
});

test("gradeOx nudges a sign-LAST charge (the 2− habit) instead of hard-failing it", () => {
  assert.equal(gradeOx(-2, "−2").correct, true);
  assert.equal(gradeOx(-2, "2−").correct, false);
  assert.equal(gradeOx(-2, "2−").nudge, "signfirst"); // right number, wrong order → retry
  assert.equal(gradeOx(-2, "2-").nudge, "signfirst");  // ascii hyphen too
  assert.equal(gradeOx(2, "2+").nudge, "signfirst");
  assert.equal(gradeOx(2, "+2").correct, true);
  assert.equal(gradeOx(7, "+5").nudge, null);          // genuinely wrong value → no nudge, just wrong
  assert.equal(gradeOx(7, "+5").correct, false);
});

// ── half-reactions (the redox rung) ────────────────────────────────────────────
test("half-reactions: electrons = atoms × |charge|, direction from the ion's sign", () => {
  const cases = {
    "Na->": [1, "oxidation"], "Mg->": [2, "oxidation"], "Al->": [3, "oxidation"], "H2->": [2, "oxidation"],
    "Cl2->": [2, "reduction"], "O2->": [4, "reduction"], "N2->": [6, "reduction"], "S->": [2, "reduction"]
  };
  const byId = Object.fromEntries(TIERS.find((t) => t.id === "half").items.map((i) => [i.id, i]));
  for (const [id, [electrons, direction]] of Object.entries(cases)) {
    const h = buildHalfReaction(byId[id]);
    assert.equal(h.electrons, electrons, `${id} electrons`);
    assert.equal(h.direction, direction, `${id} direction`);
  }
});

test("gradeHalf needs BOTH the electron count and the direction", () => {
  const mg = buildHalfReaction({ element: "Mg", ion: "Mg", ionCharge: 2, ionCount: 1 });
  assert.equal(gradeHalf(mg, "2", "oxidation").correct, true);
  assert.equal(gradeHalf(mg, "2", "reduction").correct, false); // right count, wrong direction
  assert.equal(gradeHalf(mg, "3", "oxidation").correct, false); // wrong count
  const o2 = buildHalfReaction({ element: "O2", ion: "O", ionCharge: -2, ionCount: 2 });
  assert.equal(gradeHalf(o2, "4", "reduction").correct, true);
  const partial = gradeHalf(o2, "4", "oxidation");
  assert.deepEqual([partial.countOk, partial.dirOk], [true, false]);
});

test("half-reaction hints walk OIL RIG and land on the count + direction", () => {
  const h = buildHalfReaction({ element: "O2", ion: "O", ionCharge: -2, ionCount: 2 });
  assert.equal(h.hints.length, 3);
  assert.match(h.hints[0], /OIL RIG/);
  assert.match(h.hints[1], /electrons total/);   // "… 2 oxygens → 4 electrons total"
  assert.match(h.hints[2], /reduction/);
});
