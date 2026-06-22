import { test } from "node:test";
import assert from "node:assert/strict";
import { DECKS } from "../data/decks.js";
import { STRUCTURES } from "./structures.js";

const acids = DECKS.find((d) => d.id === "acids");
const bases = DECKS.find((d) => d.id === "bases");

// The complete canonical "memorize these" sets. These must never be a partial subset.
const STRONG_ACIDS = ["HCl", "HBr", "HI", "HNO₃", "H₂SO₄", "HClO₄", "HClO₃"];
const STRONG_BASES = ["LiOH", "NaOH", "KOH", "RbOH", "CsOH", "Ca(OH)₂", "Sr(OH)₂", "Ba(OH)₂"];

const memFormulas = (deck) => deck.intro.memorize.chunks.flatMap((c) => c.items.map((i) => i.formula));
const strongCards = (deck) => deck.cards.filter((c) => c.answers.strength === "strong").map((c) => c.formula);

// ── completeness: the displayed list is exactly the canonical set ──
test("acids: the memorize list is the complete set of 7 strong acids", () => {
  assert.deepEqual(new Set(memFormulas(acids)), new Set(STRONG_ACIDS));
  assert.equal(memFormulas(acids).length, 7, "no duplicates, no omissions");
});

test("bases: the memorize list is the complete set of 8 strong bases", () => {
  assert.deepEqual(new Set(memFormulas(bases)), new Set(STRONG_BASES));
  assert.equal(memFormulas(bases).length, 8, "no duplicates, no omissions");
});

test("bases: FrOH is NOT a memorize item (footnote only)", () => {
  assert.ok(!memFormulas(bases).includes("FrOH"), "FrOH must not be in the memorize list");
  assert.ok(bases.intro.memorize.footnote && /Fr/.test(bases.intro.memorize.footnote), "FrOH is footnoted");
});

// ── the displayed list must agree with the deck's strong cards (no drift) ──
for (const deck of DECKS) {
  test(`${deck.id}: memorize list matches the deck's strong cards exactly`, () => {
    assert.deepEqual(new Set(memFormulas(deck)), new Set(strongCards(deck)));
  });
  test(`${deck.id}: every memorize item carries a name`, () => {
    for (const ch of deck.intro.memorize.chunks) {
      for (const it of ch.items) assert.ok(it.formula && it.name, `${it.formula} has a name`);
    }
  });
}

// ── grouping / chunking ──
test("acids: memorize is chunked N&S oxyacids / chlorine oxyacids / binary halogen acids", () => {
  const chunks = acids.intro.memorize.chunks.map((c) => c.items.map((i) => i.formula));
  assert.equal(chunks.length, 3, "three visual chunks");
  assert.deepEqual(chunks[0], ["HNO₃", "H₂SO₄"]);
  assert.deepEqual(chunks[1], ["HClO₃", "HClO₄"]);
  assert.deepEqual(chunks[2], ["HCl", "HBr", "HI"]);
});

test("bases: memorize is two periodic-table columns (Group 1 of 5, Group 2 of 3)", () => {
  const chunks = bases.intro.memorize.chunks;
  assert.equal(chunks.length, 2, "two columns");
  assert.match(chunks[0].heading, /group\s*1/i);
  assert.match(chunks[1].heading, /group\s*2/i);
  assert.deepEqual(chunks[0].items.map((i) => i.formula), ["LiOH", "NaOH", "KOH", "RbOH", "CsOH"]);
  assert.deepEqual(chunks[1].items.map((i) => i.formula), ["Ca(OH)₂", "Sr(OH)₂", "Ba(OH)₂"]);
});

// ── HCN naming note (classification section, not the strong list) ──
test("acids: a naming note explains why HCN is grouped as a binary acid", () => {
  const naming = acids.intro.naming;
  assert.ok(naming, "acids intro has a naming note");
  assert.match(naming, /HCN/, "names HCN");
  assert.match(naming, /hydrocyanic/i, "gives the hydro-…-ic name");
  assert.match(naming, /binary/i, "explains the binary grouping");
  // HCN is weak, so it must not have leaked into the strong-acid memorize list
  assert.ok(!memFormulas(acids).includes("HCN"), "HCN is weak — not a strong acid");
});

// ── molecular bases: show the proton-accepting lone pair ──
test("bases: molecular bases show a lone-pair structure as the proton-accepting clue", () => {
  const mol = bases.intro.molecular;
  assert.ok(mol && mol.text && /lone pair/i.test(mol.text), "explains the lone pair");
  assert.ok(mol.examples.length >= 1, "has at least one example structure");
  for (const ex of mol.examples) {
    assert.ok(ex.name && ex.formula, "example is labelled");
    assert.ok(ex.lonePairs >= 1, `${ex.formula} shows at least one lone pair`);
    const svg = STRUCTURES[ex.structure];
    assert.ok(svg && svg.includes("<svg"), `structure "${ex.structure}" resolves to an SVG`);
    assert.match(svg, /lone-pair/, `${ex.structure} draws the lone pair`);
  }
});
