import { test } from "node:test";
import assert from "node:assert/strict";

import { ionTarget, buildRound, requeue, isComplete, gradeTriad, DEFAULT_ROUND } from "./triad.js";
import { ION_DECKS, deckIons, resolveIon } from "../data/ion-decks.js";
import { formatCharge } from "./chem.js";

const sulfate = resolveIon("sulfate");
const acetate = resolveIon("acetate");
const bicarbonate = resolveIon("bicarbonate");
const ammonium = resolveIon("ammonium");

// ── stack engine ───────────────────────────────────────────────────────────────
test("buildRound caps at the sweet spot and never exceeds the deck", () => {
  const ions = deckIons(ION_DECKS[0]); // 6 ions
  const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  let i = 0;
  const rng = () => seq[i++ % seq.length];
  assert.equal(buildRound(ions, 4, rng).length, 4);
  assert.equal(buildRound(ions, 50, rng).length, ions.length); // can't draw more than exist
  assert.equal(DEFAULT_ROUND, 8);
});

test("requeue drops a mastered ion and rotates a missed one", () => {
  assert.deepEqual(requeue(["a", "b", "c"], true), ["b", "c"]);
  assert.deepEqual(requeue(["a", "b", "c"], false), ["b", "c", "a"]);
  assert.deepEqual(requeue([], true), []);
});

test("isComplete needs the asked text facet AND a charge in both directions", () => {
  assert.equal(isComplete("recall", { formula: "SO4", charge: -2 }), true);
  assert.equal(isComplete("recall", { formula: "SO4" }), false); // charge missing
  assert.equal(isComplete("recall", { formula: "", charge: -2 }), false); // formula missing
  assert.equal(isComplete("recognize", { name: "sulfate", charge: -2 }), true);
  assert.equal(isComplete("recognize", { charge: -2 }), false);
});

// ── grading both directions ─────────────────────────────────────────────────────
test("recall: name shown → formula + charge graded independently", () => {
  const right = gradeTriad(sulfate, "recall", { formula: "SO4", charge: -2 });
  assert.deepEqual(right.facets, { formula: true, charge: true });
  assert.equal(right.allCorrect, true);

  const wrongCharge = gradeTriad(sulfate, "recall", { formula: "SO₄", charge: -1 });
  assert.equal(wrongCharge.facets.formula, true); // unicode subscript still accepted
  assert.equal(wrongCharge.facets.charge, false);
  assert.equal(wrongCharge.allCorrect, false);
});

test("recognize: formula shown → name + charge; multi-name ions accept either name", () => {
  const viaHydrogen = gradeTriad(bicarbonate, "recognize", { name: "hydrogen carbonate", charge: -1 });
  assert.equal(viaHydrogen.allCorrect, true);
  const viaBi = gradeTriad(bicarbonate, "recognize", { name: "bicarbonate", charge: -1 });
  assert.equal(viaBi.allCorrect, true);
});

test("acetate's three formula spellings all pass in recall", () => {
  for (const f of ["C2H3O2", "CH3COO", "CH3CO2"]) {
    assert.equal(gradeTriad(acetate, "recall", { formula: f, charge: -1 }).allCorrect, true);
  }
});

test("a blank facet is wrong, not a crash", () => {
  assert.equal(gradeTriad(sulfate, "recall", { charge: -2 }).facets.formula, false);
  assert.equal(gradeTriad(sulfate, "recognize", { charge: -2 }).facets.name, false);
});

test("ionTarget exposes canonical + accepted for the matcher", () => {
  const t = ionTarget(ammonium);
  assert.equal(t.formula.canonical, "NH4");
  assert.ok(t.name.accepted.includes("ammonium"));
});

// ── charge formatting ───────────────────────────────────────────────────────────
test("formatCharge renders sign + magnitude", () => {
  assert.equal(formatCharge(1), "+");
  assert.equal(formatCharge(-1), "−");
  assert.equal(formatCharge(-2), "2−");
  assert.equal(formatCharge(3), "3+");
  assert.equal(formatCharge(0), "");
});

// ── deck content integrity ──────────────────────────────────────────────────────
test("every deck resolves, stays in the sweet spot, and has well-formed ions", () => {
  assert.ok(ION_DECKS.length > 0);
  for (const deck of ION_DECKS) {
    assert.ok(deck.id && deck.label && deck.blurb, `${deck.id} has id/label/blurb`);
    const ions = deckIons(deck); // throws on an unknown id
    assert.ok(ions.length >= 4 && ions.length <= 10, `${deck.id} has 4–10 ions (got ${ions.length})`);
    for (const ion of ions) {
      assert.ok(ion.names?.length && ion.formulas?.length, `${ion.id} has names + formulas`);
      assert.ok(Number.isInteger(ion.charge) && ion.charge !== 0, `${ion.id} has a nonzero charge`);
    }
  }
});

// Guards against a rung silently going missing (the earlier bromite/iodite gap): every column of an
// oxyanion-family deck must carry the complete hypo-/-ite/-ate/per- set (excluding the parent halide).
test("oxyanion-family decks carry the full hypo-/-ite/-ate/per- set per element", () => {
  const families = ION_DECKS.filter((d) => d.id === "chlorine-oxy" || d.id === "halogen-oxy");
  assert.equal(families.length, 2);
  const rung = (n) =>
    n.startsWith("hypo") ? "hypo" : n.startsWith("per") ? "per" : n.endsWith("ite") ? "ite" : n.endsWith("ate") ? "ate" : "?";
  for (const deck of families) {
    const ref = new Set(deck.referenceIds || []);
    for (const col of deck.columns) {
      const names = col.ids.filter((id) => !ref.has(id)).map((id) => resolveIon(id).names[0]);
      assert.equal(names.length, 4, `${deck.id} / ${col.head} has exactly four oxyanions`);
      assert.deepEqual([...new Set(names.map(rung))].sort(), ["ate", "hypo", "ite", "per"],
        `${deck.id} / ${col.head} has one of each rung`);
    }
  }
});
