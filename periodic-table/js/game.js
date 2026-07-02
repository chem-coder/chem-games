// Periodic Table Memorizer — pure logic. No DOM, no globals. ESM for `node --test`.
// The "fill the table" game: each blank cell shows an atomic number; the student types the symbol.

import { ELEMENTS } from "../data/pt-data.js";

export const TOTAL = ELEMENTS.length; // 118
export const BY_SYMBOL = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, e]));

// Scopes — the "what to fill" chooser. Two flavours:
//   • period scopes cut the table at a period boundary (18 = end of row 3, 36 = row 4, …).
//   • family scopes pick every element of one subtype (all the halogens, all the noble gases, …).
// Each scope carries a `group` so the UI can lay them out in rows. poolForScope turns any scope
// into its z-sorted list of in-play elements; the fill board, quiz, counter and navigation all
// run off that pool, so they work the same either way.
export const SCOPES = [
  // By period — a z-sorted prefix of the table.
  { id: "r3", label: "Rows 1–3", group: "period", maxZ: 18 },
  { id: "r4", label: "Rows 1–4", group: "period", maxZ: 36 },
  { id: "r5", label: "Rows 1–5", group: "period", maxZ: 54 },
  { id: "all", label: "Whole table", group: "period", maxZ: 118 },
  // By family — every element sharing a subtype.
  { id: "alkali", label: "Alkali metals", group: "family", subtype: "alkali metal" },
  { id: "alkaline-earth", label: "Alkaline earth metals", group: "family", subtype: "alkaline earth metal" },
  { id: "transition", label: "Transition metals", group: "family", subtype: "transition metal" },
  { id: "metalloid", label: "Metalloids", group: "family", subtype: "metalloid" },
  { id: "reactive-nonmetal", label: "Reactive nonmetals", group: "family", subtype: "reactive nonmetal" },
  { id: "halogen", label: "Halogens", group: "family", subtype: "halogen" },
  { id: "noble-gas", label: "Noble gases", group: "family", subtype: "noble gas" },
  // Harder families.
  { id: "post-transition", label: "Post-transition metals", group: "advanced", subtype: "post-transition metal" },
  { id: "lanthanide", label: "Lanthanides", group: "advanced", subtype: "lanthanide" },
  { id: "actinide", label: "Actinides", group: "advanced", subtype: "actinide" }
];

// The button-row headings, in display order. A group with no matching scopes is skipped by the UI.
export const SCOPE_GROUPS = [
  { id: "period", label: "By period" },
  { id: "family", label: "By family" },
  { id: "advanced", label: "Harder families" }
];

export function poolFor(maxZ) {
  return ELEMENTS.filter((e) => e.z <= maxZ);
}

// The in-play elements for any scope, z-sorted (ELEMENTS is z-sorted and filter preserves order,
// so nextUnfilled's wrap and neighbor's grid walk stay correct on a scattered family pool too).
export function poolForScope(scope) {
  if (scope.subtype) return ELEMENTS.filter((e) => e.subtype === scope.subtype);
  return poolFor(scope.maxZ);
}

// A family scope frames itself against the whole table (ghosted context); a period scope doesn't.
export function isFamilyScope(scope) {
  return Boolean(scope.subtype);
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
