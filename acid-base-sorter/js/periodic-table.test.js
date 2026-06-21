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
    const pt = intro.pt;
    for (const sym of Object.keys(pt.highlight)) {
      assert.ok(ELEMENT_SYMBOLS.has(sym), `${deck.id} highlights real element "${sym}"`);
      assert.ok(pt.palette[pt.highlight[sym]], `${deck.id}: "${sym}" category has a palette entry`);
    }
    for (const l of pt.legend) {
      assert.ok(pt.palette[l.cat], `${deck.id} legend cat "${l.cat}" has a palette entry`);
    }
  });
}
