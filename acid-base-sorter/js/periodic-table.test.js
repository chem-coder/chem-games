import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPeriodicTable, ELEMENT_SYMBOLS } from "./periodic-table.js";
import { DECKS } from "../data/decks.js";

test("the table includes the elements the strong-list mnemonics point at", () => {
  for (const s of ["H", "Li", "Na", "K", "Rb", "Cs", "Be", "Mg", "Ca", "Sr", "Ba", "F", "Cl", "Br", "I", "U", "Lu", "Og"]) {
    assert.ok(ELEMENT_SYMBOLS.has(s), `${s} is on the table`);
  }
});

test("renderPeriodicTable returns an SVG and colors highlighted cells", () => {
  const svg = renderPeriodicTable(
    { Na: "strong" },
    { strong: { fill: "#d6f2df", stroke: "#1f9d5a", text: "#356b45" } }
  );
  assert.match(svg, /^<svg/);
  assert.match(svg, /<\/svg>$/);
  assert.match(svg, />Na</, "the highlighted symbol is rendered");
  assert.match(svg, /#1f9d5a/, "the highlight stroke color is applied");
});

// Every deck carries a well-formed intro: real elements, palette-backed legend, complete concepts.
for (const deck of DECKS) {
  test(`${deck.id}: intro is well-formed and every highlighted element is real`, () => {
    const intro = deck.intro;
    assert.ok(intro && intro.blurb, "has a blurb");
    assert.ok(intro.concepts.length >= 2, "has concept explainers");
    for (const cn of intro.concepts) {
      assert.ok(cn.title && cn.text, `${deck.id} concept has title + text`);
      assert.ok(cn.examples.length >= 1, `${deck.id} concept has examples`);
    }
    if (!intro.pt) return; // the mix deck's intro has no periodic table — that's fine
    const pt = intro.pt;
    for (const sym of Object.keys(pt.highlight)) {
      assert.ok(ELEMENT_SYMBOLS.has(sym), `${deck.id} highlights real element "${sym}"`);
      // a highlight value may be a single category or an array of two (dual-role, split fill)
      const cats = [].concat(pt.highlight[sym]);
      for (const c of cats) {
        assert.ok(pt.palette[c], `${deck.id}: "${sym}" category "${c}" has a palette entry`);
      }
    }
    for (const l of pt.legend) {
      assert.ok(pt.palette[l.cat], `${deck.id} legend cat "${l.cat}" has a palette entry`);
    }
  });
}

const acids = DECKS.find((d) => d.id === "acids");
const bases = DECKS.find((d) => d.id === "bases");

test("acids PT: N and S are highlighted as oxyanion central atoms", () => {
  for (const sym of ["N", "S"]) {
    assert.ok([].concat(acids.intro.pt.highlight[sym]).includes("central"), `${sym} is a central atom`);
  }
});

test("acids PT: Cl shows its dual role (binary halogen AND oxyacid central atom)", () => {
  const cats = [].concat(acids.intro.pt.highlight.Cl);
  assert.ok(cats.includes("halide"), "Cl is a binary-acid halogen");
  assert.ok(cats.includes("central"), "Cl is also an oxyacid central atom");
  assert.equal(cats.length, 2, "Cl carries exactly its two roles");
});

test("acids PT: F is still flagged as the weak exception", () => {
  assert.equal(acids.intro.pt.highlight.F, "exception");
});

test("bases PT: Fr is a footnote category, not a memorize-list 'strong'", () => {
  assert.ok("Fr" in bases.intro.pt.highlight, "Fr appears on the table");
  assert.notEqual(bases.intro.pt.highlight.Fr, "strong", "Fr must not read as a plain strong base");
});

test("renderPeriodicTable splits a dual-role cell into both category colors", () => {
  const svg = renderPeriodicTable(
    { Cl: ["halide", "central"] },
    {
      halide: { fill: "#e0ebe5", stroke: "#1e7268", text: "#134f48" },
      central: { fill: "#ece1ea", stroke: "#835f7d", text: "#6b4d68" }
    }
  );
  assert.match(svg, />Cl</, "Cl is rendered");
  assert.match(svg, /#e0ebe5/, "first role's color is present");
  assert.match(svg, /#ece1ea/, "second role's color is present");
});
