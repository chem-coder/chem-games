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

// ── stack building: every strong species is ALWAYS tested; the weak fill varies ──
const strongIds = (deck) => deck.cards.filter((c) => c.answers.strength === "strong").map((c) => c.id);
const weakIds = (deck) => deck.cards.filter((c) => c.answers.strength !== "strong").map((c) => c.id);

for (const deck of DECKS) {
  test(`${deck.id}: a built stack ALWAYS contains every strong card`, () => {
    // try a range of target sizes, and with the real RNG several times
    for (const size of [0, 3, DEFAULT_STACK_SIZE, 999]) {
      for (let run = 0; run < 8; run += 1) {
        const ids = buildStack(deck, size).map((c) => c.id);
        for (const sid of strongIds(deck)) {
          assert.ok(ids.includes(sid), `${deck.id} stack (size ${size}) is missing strong card ${sid}`);
        }
      }
    }
  });

  test(`${deck.id}: a built stack is strong + a weak sample, no duplicates, weak drawn only from the pool`, () => {
    const stack = buildStack(deck, DEFAULT_STACK_SIZE, () => 0); // deterministic rng
    const ids = stack.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, "no duplicate cards");
    const strong = strongIds(deck);
    const expectedLen = strong.length + Math.min(weakIds(deck).length, Math.max(0, DEFAULT_STACK_SIZE - strong.length));
    assert.equal(ids.length, expectedLen, "stack size = all strong + weak fill to the target");
    const pool = new Set(weakIds(deck));
    for (const id of ids) {
      if (!strong.includes(id)) assert.ok(pool.has(id), `${id} came from the weak pool`);
    }
  });

  test(`${deck.id}: the weak pool is bigger than its stack slots, so the fill genuinely varies`, () => {
    const slots = DEFAULT_STACK_SIZE - strongIds(deck).length;
    assert.ok(weakIds(deck).length > slots, `${deck.id} needs more weak cards (${weakIds(deck).length}) than slots (${slots})`);
  });
}
