import { test } from "node:test";
import assert from "node:assert/strict";

import { ELEMENTS, ROWS, COLS } from "../data/pt-data.js";
import { TOTAL, BY_SYMBOL, normalizeSymbol, isCorrectSymbol, nextUnfilled, neighbor, SCOPES, SCOPE_GROUPS, poolFor, poolForScope, isFamilyScope } from "./game.js";

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

// ── period scopes ──
test("period scopes cut the table at the right period boundaries", () => {
  const periods = SCOPES.filter((s) => s.group === "period");
  assert.deepEqual(periods.map((s) => s.maxZ), [18, 36, 54, 118]);
  assert.equal(poolFor(18).length, 18); // rows 1–3
  assert.equal(poolFor(36).length, 36); // rows 1–4
  assert.equal(poolFor(118).length, 118);
  assert.ok(poolFor(18).every((e) => e.z <= 18));
  // period scopes are not family scopes
  assert.ok(periods.every((s) => !isFamilyScope(s)));
  // nextUnfilled / neighbor respect the pool
  const p3 = poolFor(18);
  assert.equal(nextUnfilled(new Set(p3.map((e) => e.symbol)), 0, p3), null); // pool complete
  assert.equal(neighbor(BY_SYMBOL.Cl, "right", p3).symbol, "Ar"); // stays in rows 1–3
});

// ── family scopes ──
test("poolForScope selects a family by subtype, z-sorted", () => {
  const halogens = poolForScope(SCOPES.find((s) => s.id === "halogen"));
  assert.deepEqual(halogens.map((e) => e.symbol), ["F", "Cl", "Br", "I", "At", "Ts"]);
  assert.ok(halogens.every((e) => e.subtype === "halogen"));
  // z-sorted so nextUnfilled's wrap stays correct
  assert.deepEqual([...halogens].sort((a, b) => a.z - b.z).map((e) => e.z), halogens.map((e) => e.z));
  // reactive nonmetals are their own family — halogens and noble gases are NOT folded in
  const reactive = poolForScope(SCOPES.find((s) => s.id === "reactive-nonmetal"));
  assert.deepEqual(reactive.map((e) => e.symbol), ["H", "C", "N", "O", "P", "S", "Se"]);
});

test("family scopes together cover every element exactly once (all 10 subtypes)", () => {
  const families = SCOPES.filter(isFamilyScope);
  assert.equal(new Set(families.map((s) => s.subtype)).size, families.length); // no repeated subtype
  const covered = families.flatMap((s) => poolForScope(s).map((e) => e.z));
  assert.equal(covered.length, 118, "no element counted twice");
  assert.equal(new Set(covered).size, 118, "every element covered by a family");
  // every family names a subtype that actually exists in the data
  assert.ok(families.every((s) => poolForScope(s).length > 0));
});

test("SCOPE_GROUPS label every scope's group", () => {
  const groupIds = new Set(SCOPE_GROUPS.map((g) => g.id));
  assert.ok(SCOPES.every((s) => groupIds.has(s.group)));
});

test("nextUnfilled and neighbor work on a scattered family pool", () => {
  const halogens = poolForScope(SCOPES.find((s) => s.id === "halogen"));
  assert.equal(nextUnfilled(new Set(), 0, halogens).symbol, "F"); // first halogen
  assert.equal(nextUnfilled(new Set(["F"]), 9, halogens).symbol, "Cl"); // after F → Cl
  assert.equal(nextUnfilled(new Set(halogens.map((e) => e.symbol)), 0, halogens), null); // all done
  // the halogens share a column, so vertical navigation walks the family
  assert.equal(neighbor(BY_SYMBOL.F, "down", halogens).symbol, "Cl");
  assert.equal(neighbor(BY_SYMBOL.F, "right", halogens), null); // no other halogen in row 1
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
