import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeCard, requeue, isComplete } from "./sorter.js";
import { DECKS } from "../data/decks.js";

const acids = DECKS.find((d) => d.id === "acids");
const bases = DECKS.find((d) => d.id === "bases");

// Canonical taught sets — the test asserts "strong" iff membership here.
const STRONG_ACIDS = new Set(["HCl", "HBr", "HI", "HNO₃", "HClO₄", "HClO₃", "H₂SO₄"]);
const STRONG_BASES = new Set(["LiOH", "NaOH", "KOH", "RbOH", "CsOH", "Ca(OH)₂", "Sr(OH)₂", "Ba(OH)₂"]);

// ── engine ──
test("gradeCard marks each axis and reports all-correct only when every axis matches", () => {
  const card = acids.cards.find((c) => c.id === "h2so4");
  const right = gradeCard(acids.axes, card, { strength: "strong", protons: "poly", type: "oxy" });
  assert.equal(right.allCorrect, true);
  assert.deepEqual(right.perAxis, { strength: true, protons: true, type: true });

  const wrong = gradeCard(acids.axes, card, { strength: "weak", protons: "poly", type: "oxy" });
  assert.equal(wrong.allCorrect, false);
  assert.equal(wrong.perAxis.strength, false);
  assert.equal(wrong.perAxis.type, true);
});

test("a missing selection counts as wrong, not a crash", () => {
  const card = acids.cards[0];
  const out = gradeCard(acids.axes, card, { strength: "strong" });
  assert.equal(out.allCorrect, false);
});

test("requeue drops a mastered card and rotates a missed one to the back", () => {
  assert.deepEqual(requeue(["a", "b", "c"], true), ["b", "c"]);
  assert.deepEqual(requeue(["a", "b", "c"], false), ["b", "c", "a"]);
  assert.deepEqual(requeue([], true), []);
});

test("isComplete requires every axis selected", () => {
  assert.equal(isComplete(acids.axes, { strength: "strong", protons: "mono" }), false);
  assert.equal(isComplete(acids.axes, { strength: "strong", protons: "mono", type: "binary" }), true);
});

// ── content integrity (mirrors validate-reactions: never ship a wrong fact) ──
for (const deck of DECKS) {
  test(`${deck.id}: every card has a name and an answer for every axis`, () => {
    assert.ok(deck.cards.length > 0);
    for (const c of deck.cards) {
      assert.ok(c.formula && c.name, `${c.id} has formula + name`);
      for (const ax of deck.axes) {
        const ans = c.answers[ax.id];
        assert.ok(ax.options.some((o) => o.id === ans), `${c.id}.${ax.id} = "${ans}" is a real option`);
      }
    }
  });
}

test("acids: strength matches the canonical strong-acid set exactly", () => {
  for (const c of acids.cards) {
    const expected = STRONG_ACIDS.has(c.formula) ? "strong" : "weak";
    assert.equal(c.answers.strength, expected, `${c.formula} should be ${expected}`);
  }
});

test("bases: strength matches the canonical strong-base set exactly", () => {
  for (const c of bases.cards) {
    const expected = STRONG_BASES.has(c.formula) ? "strong" : "weak";
    assert.equal(c.answers.strength, expected, `${c.formula} should be ${expected}`);
  }
});

test("acids: type is oxyacid iff the formula contains oxygen", () => {
  for (const c of acids.cards) {
    const expected = c.formula.includes("O") ? "oxy" : "binary";
    assert.equal(c.answers.type, expected, `${c.formula} type should be ${expected}`);
  }
});

test("acids: polyprotic formulas start with H₂ or H₃ (sanity guard)", () => {
  for (const c of acids.cards) {
    if (c.answers.protons === "poly") {
      assert.match(c.formula, /^H[₂₃]/, `${c.formula} is marked polyprotic`);
    }
  }
});

test("bases: form is metal hydroxide iff the formula contains OH", () => {
  for (const c of bases.cards) {
    const expected = c.formula.includes("OH") ? "hydroxide" : "molecular";
    assert.equal(c.answers.form, expected, `${c.formula} form should be ${expected}`);
  }
});

test("bases: OH-count is polyacidic iff the formula shows (OH)₂/₃ (else monoacidic)", () => {
  for (const c of bases.cards) {
    const expected = /\(OH\)[₂₃]/.test(c.formula) ? "poly" : "mono";
    assert.equal(c.answers.ohcount, expected, `${c.formula} OH-count should be ${expected}`);
  }
});
