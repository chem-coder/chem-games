import { test } from "node:test";
import assert from "node:assert/strict";

import { ELEMENTS, ROWS, COLS } from "../data/pt-data.js";
import { TOTAL, BY_SYMBOL, normalizeSymbol, isCorrectSymbol, nextUnfilled, neighbor } from "./game.js";

// ── data integrity ──
test("the table holds all 118 elements, each well-formed and uniquely placed", () => {
  assert.equal(TOTAL, 118);
  assert.equal(ELEMENTS.length, 118);
  const zs = new Set(), syms = new Set(), cells = new Set();
  for (const e of ELEMENTS) {
    assert.ok(e.symbol && e.name, `${e.z} has a symbol + name`);
    assert.ok(e.row >= 0 && e.row < ROWS && e.col >= 0 && e.col < COLS, `${e.symbol} sits on the grid`);
    zs.add(e.z); syms.add(e.symbol); cells.add(`${e.row},${e.col}`);
  }
  assert.equal(zs.size, 118, "atomic numbers are unique");
  assert.equal(syms.size, 118, "symbols are unique");
  assert.equal(cells.size, 118, "no two elements share a cell");
});

test("elements are in atomic-number order (so index = z − 1)", () => {
  ELEMENTS.forEach((e, i) => assert.equal(e.z, i + 1));
  assert.equal(BY_SYMBOL.Fe.z, 26);
  assert.equal(BY_SYMBOL.Og.z, 118);
});

// ── grading ──
test("normalizeSymbol fixes case; isCorrectSymbol accepts any case", () => {
  assert.equal(normalizeSymbol("fe"), "Fe");
  assert.equal(normalizeSymbol("CL"), "Cl");
  assert.equal(normalizeSymbol("  h "), "H");
  assert.equal(normalizeSymbol(""), "");
  assert.equal(isCorrectSymbol(BY_SYMBOL.Na, "na"), true);
  assert.equal(isCorrectSymbol(BY_SYMBOL.Na, "Mg"), false);
});

// ── auto-advance ──
test("nextUnfilled walks atomic number, skips filled, wraps, and ends at null", () => {
  assert.equal(nextUnfilled(new Set(), 0).symbol, "H"); // fresh start
  assert.equal(nextUnfilled(new Set(["H"]), 0).symbol, "He"); // H done → He
  assert.equal(nextUnfilled(new Set(), 26).symbol, "Co"); // after Fe (z26) → Co (z27)
  // everything filled except hydrogen → from the end it should wrap back to H
  const allButH = new Set(ELEMENTS.slice(1).map((e) => e.symbol));
  assert.equal(nextUnfilled(allButH, 118).symbol, "H");
  // table complete → null
  assert.equal(nextUnfilled(new Set(ELEMENTS.map((e) => e.symbol)), 10), null);
});

// ── arrow navigation ──
test("neighbor moves across the grid, skipping gaps, and stops at edges", () => {
  assert.equal(neighbor(BY_SYMBOL.Mg, "right").symbol, "Al"); // jumps the empty d-block gap
  assert.equal(neighbor(BY_SYMBOL.Al, "left").symbol, "Mg");
  assert.equal(neighbor(BY_SYMBOL.H, "down").symbol, "Li"); // down a column
  assert.equal(neighbor(BY_SYMBOL.Li, "up").symbol, "H");
  assert.equal(neighbor(BY_SYMBOL.He, "right"), null); // right edge
  assert.equal(neighbor(BY_SYMBOL.H, "left"), null); // left edge
});
