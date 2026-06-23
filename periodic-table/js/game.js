// Periodic Table Memorizer — pure logic. No DOM, no globals. ESM for `node --test`.
// The "fill the table" game: each blank cell shows an atomic number; the student types the symbol.

import { ELEMENTS } from "../data/pt-data.js";

export const TOTAL = ELEMENTS.length; // 118
export const BY_SYMBOL = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, e]));

// Difficulty scopes — start beginners on the first rows. Each "row" is a period; the atomic-number
// cutoff is the end of that period (18 = end of row 3, 36 = row 4, …). poolFor returns the in-scope
// elements (a z-sorted prefix of the table).
export const SCOPES = [
  { id: "r3", label: "Rows 1–3", maxZ: 18 },
  { id: "r4", label: "Rows 1–4", maxZ: 36 },
  { id: "r5", label: "Rows 1–5", maxZ: 54 },
  { id: "all", label: "Whole table", maxZ: 118 }
];
export function poolFor(maxZ) {
  return ELEMENTS.filter((e) => e.z <= maxZ);
}

// Element symbols are Title-case (Fe, Cl, H). Accept any case the student types.
export function normalizeSymbol(s) {
  const t = String(s).trim();
  return t ? t[0].toUpperCase() + t.slice(1).toLowerCase() : "";
}

export function isCorrectSymbol(el, typed) {
  return normalizeSymbol(typed) === el.symbol;
}

// After filling one cell, jump to the next still-empty element (by atomic number, wrapping) within
// `pool` (the in-scope elements — a full table or just the first few rows). Returns null when the
// pool is complete. currentZ = 0 starts at the first element.
export function nextUnfilled(filledSet, currentZ = 0, pool = ELEMENTS) {
  const n = pool.length;
  if (!n) return null;
  let start = pool.findIndex((e) => e.z > currentZ);
  if (start === -1) start = 0; // past the end → wrap to the first
  for (let k = 0; k < n; k += 1) {
    const e = pool[(start + k) % n];
    if (!filledSet.has(e.symbol)) return e;
  }
  return null;
}

// Arrow-key navigation: the nearest in-pool element in one grid direction (skipping gaps — e.g.
// right of Mg lands on Al). Returns null at an edge. dir ∈ left|right|up|down.
export function neighbor(el, dir, pool = ELEMENTS) {
  let cands;
  if (dir === "left") cands = pool.filter((e) => e.row === el.row && e.col < el.col).sort((a, b) => b.col - a.col);
  else if (dir === "right") cands = pool.filter((e) => e.row === el.row && e.col > el.col).sort((a, b) => a.col - b.col);
  else if (dir === "up") cands = pool.filter((e) => e.col === el.col && e.row < el.row).sort((a, b) => b.row - a.row);
  else if (dir === "down") cands = pool.filter((e) => e.col === el.col && e.row > el.row).sort((a, b) => a.row - b.row);
  else return null;
  return cands[0] || null;
}
