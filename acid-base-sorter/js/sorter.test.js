import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeCard, requeue, isComplete, buildStack, DEFAULT_STACK_SIZE } from "./sorter.js";
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

test("bases: for metal hydroxides, OH-count is poly iff the formula shows (OH)₂/₃", () => {
  for (const c of bases.cards.filter((b) => b.answers.form === "hydroxide")) {
    const expected = /\(OH\)[₂₃]/.test(c.formula) ? "poly" : "mono";
    assert.equal(c.answers.ohcount, expected, `${c.formula} OH-count should be ${expected}`);
  }
});

// Molecular bases get their proton capacity from lone-pair sites, not OH groups — so OH-count is
// hand-set (not formula-derivable). Most amines are monoacidic; hydrazine is the di-acidic one.
test("bases: molecular bases carry a valid hand-set mono/poly OH-count", () => {
  for (const c of bases.cards.filter((b) => b.answers.form === "molecular")) {
    assert.ok(["mono", "poly"].includes(c.answers.ohcount), `${c.formula} has a valid OH-count`);
  }
});

test("bases: hydrazine (N₂H₄) is the polyacidic molecular base (the di-acidic exception)", () => {
  const hz = bases.cards.find((c) => c.formula === "N₂H₄");
  assert.ok(hz, "hydrazine is in the base pool");
  assert.equal(hz.answers.strength, "weak");
  assert.equal(hz.answers.form, "molecular");
  assert.equal(hz.answers.ohcount, "poly");
});

// ── stack building: coverage-aware rounds driven by saved progress ──
for (const deck of DECKS) {
  test(`${deck.id}: a round holds size distinct cards, all from the deck`, () => {
    const ids = buildStack(deck, {}, 8).map((c) => c.id);
    assert.equal(ids.length, Math.min(8, deck.cards.length));
    assert.equal(new Set(ids).size, ids.length, "no duplicates");
    const pool = new Set(deck.cards.map((c) => c.id));
    for (const id of ids) assert.ok(pool.has(id), `${id} is a real card`);
  });
}

test("with no saved progress, a round is just a random sample (no forced strong set)", () => {
  const deck = acids;
  const ids = buildStack(deck, {}, 5, () => 0).map((c) => c.id);
  assert.equal(ids.length, 5);
  // nothing requires every strong acid to appear — the old rule is gone
});

test("mastered cards are deprioritised — unmastered cards fill the round first", () => {
  const deck = acids;
  // mark all but two cards mastered; a size-2 round should pick the two UN-mastered ones
  const stats = { acids: {} };
  const unmastered = [deck.cards[0].id, deck.cards[1].id];
  for (const c of deck.cards) {
    if (!unmastered.includes(c.id)) stats.acids[c.id] = { seen: 1, missed: 0, mastered: true };
  }
  const ids = buildStack(deck, stats, 2, () => 0.5).map((c) => c.id);
  assert.deepEqual(new Set(ids), new Set(unmastered), "the two unmastered cards are chosen");
});

test("within unmastered, least-seen cards come first (rotation through the pool)", () => {
  const deck = acids;
  // everything unmastered; give the first card a high seen count so it sorts last
  const stats = { acids: {} };
  deck.cards.forEach((c, i) => { stats.acids[c.id] = { seen: i === 0 ? 99 : 0, missed: 0, mastered: false }; });
  const ids = buildStack(deck, stats, deck.cards.length - 1, () => 0.5).map((c) => c.id);
  assert.ok(!ids.includes(deck.cards[0].id), "the most-seen card is held back when the round can't fit everyone");
});

test("a finished pool (all mastered) still fills the round (review mode)", () => {
  const deck = bases;
  const stats = { bases: {} };
  for (const c of deck.cards) stats.bases[c.id] = { seen: 3, missed: 0, mastered: true };
  const ids = buildStack(deck, stats, 6, () => 0.5).map((c) => c.id);
  assert.equal(ids.length, 6, "mastered cards still come back around for review");
});
