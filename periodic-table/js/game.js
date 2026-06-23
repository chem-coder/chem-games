// Periodic Table Memorizer — pure logic. No DOM, no globals. ESM for `node --test`.
// The "fill the table" game: each blank cell shows an atomic number; the student types the symbol.

import { ELEMENTS } from "../data/pt-data.js";

export const TOTAL = ELEMENTS.length; // 118
export const BY_SYMBOL = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, e]));

// Element symbols are Title-case (Fe, Cl, H). Accept any case the student types.
export function normalizeSymbol(s) {
  const t = String(s).trim();
  return t ? t[0].toUpperCase() + t.slice(1).toLowerCase() : "";
}

export function isCorrectSymbol(el, typed) {
  return normalizeSymbol(typed) === el.symbol;
}

// After filling one cell, jump to the next still-empty element by atomic number (wrapping). Returns
// null when the table is complete. currentZ = 0 starts the search at hydrogen.
export function nextUnfilled(filledSet, currentZ = 0) {
  const n = ELEMENTS.length;
  for (let k = 0; k < n; k += 1) {
    const e = ELEMENTS[(currentZ + k) % n]; // index currentZ = the element after currentZ (z−1+1)
    if (!filledSet.has(e.symbol)) return e;
  }
  return null;
}

// Arrow-key navigation: the nearest element in one grid direction (skipping the table's gaps —
// e.g. right of Mg lands on Al). Returns null at an edge. dir ∈ left|right|up|down.
export function neighbor(el, dir) {
  let cands;
  if (dir === "left") cands = ELEMENTS.filter((e) => e.row === el.row && e.col < el.col).sort((a, b) => b.col - a.col);
  else if (dir === "right") cands = ELEMENTS.filter((e) => e.row === el.row && e.col > el.col).sort((a, b) => a.col - b.col);
  else if (dir === "up") cands = ELEMENTS.filter((e) => e.col === el.col && e.row < el.row).sort((a, b) => b.row - a.row);
  else if (dir === "down") cands = ELEMENTS.filter((e) => e.col === el.col && e.row > el.row).sort((a, b) => a.row - b.row);
  else return null;
  return cands[0] || null;
}
