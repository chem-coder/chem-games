// Pure chemistry primitives for nomenclature. No DOM, no data dependencies. ESM so the whole
// engine can be exercised with `node --test`. Everything here is small, total, and deterministic —
// the things the worksheet calls "criss-cross", "Roman numerals", and "Greek prefixes".

// ── Roman numerals ───────────────────────────────────────────────────────────
// 1..12 covers every oxidation state we ever name (highest in the worksheet is VII).
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function toRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n >= ROMAN.length) {
    throw new Error(`toRoman: ${n} is out of range (1..${ROMAN.length - 1})`);
  }
  return ROMAN[n];
}

export function fromRoman(s) {
  const i = ROMAN.indexOf(String(s).toUpperCase());
  return i > 0 ? i : null;
}

// ── Greek multiplying prefixes (covalent naming) ─────────────────────────────
const PREFIXES = [
  "", "mono", "di", "tri", "tetra", "penta",
  "hexa", "hepta", "octa", "nona", "deca"
];

export function prefixFor(count) {
  if (!Number.isInteger(count) || count < 1 || count >= PREFIXES.length) {
    throw new Error(`prefixFor: ${count} is out of range (1..${PREFIXES.length - 1})`);
  }
  return PREFIXES[count];
}

// Attach a Greek prefix to an element root, applying the two rules the worksheet teaches:
//   • mono- is dropped on the FIRST element of a name (carbon dioxide, not monocarbon dioxide).
//   • the prefix's trailing a/o elides before a vowel-initial root — but the course only does this
//     reliably for "oxide" (pentoxide, monoxide). Dalia's ruling: the elided form is preferred,
//     but BOTH are accepted, so we return { canonical, variants } and let matching accept either.
// Returns { canonical, variants } where variants are extra accepted spellings (never the canonical).
export function applyPrefix(count, root, { first = false } = {}) {
  const prefix = prefixFor(count);
  if (first && prefix === "mono") {
    return { canonical: root, variants: [] };
  }
  const elides = /^o/i.test(root) && /[ao]$/i.test(prefix); // only before "oxide" in practice
  const elided = prefix.slice(0, -1) + root;
  const full = prefix + root;
  if (!elides) return { canonical: full, variants: [] };
  // Preferred = elided (pentoxide); also accept the un-elided form (pentaoxide) from Dalia's key.
  return { canonical: elided, variants: [full] };
}

// ── gcd / criss-cross (ionic subscripts) ─────────────────────────────────────
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

// Criss-cross: a cation of charge +c and an anion of charge −a combine in the lowest whole-number
// ratio that nets to zero. Returns the two subscripts (already reduced), e.g. (+2,−2)→1:1, (+3,−2)→2:3.
export function crissCross(cationCharge, anionCharge) {
  const c = Math.abs(cationCharge);
  const a = Math.abs(anionCharge);
  const g = gcd(c, a);
  return { cation: a / g, anion: c / g };
}

// Reverse criss-cross: given the anion's (known) charge and the two subscripts read off a formula,
// deduce the cation's charge. This is the core type-II skill — neutrality means
//   cationCount · x + anionCount · (anionCharge) = 0.
// Returns null if it doesn't come out to a positive integer (a malformed/ungradable formula).
export function deduceCationCharge(anionCharge, cationCount, anionCount) {
  if (!cationCount) return null;
  const x = (Math.abs(anionCharge) * anionCount) / cationCount;
  return Number.isInteger(x) && x > 0 ? x : null;
}

// ── subscript rendering ──────────────────────────────────────────────────────
// House rule (see memory: subscript-rendering-rule): formulas render digits as real <sub> so CSS
// controls their size (≥50% of normal). These helpers convert between the three representations:
//   plain "H2O"  ⇄  unicode "H₂O"  ⇄  html "H<sub>2</sub>O".
const SUB_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

export function toUnicodeSub(plain) {
  return String(plain).replace(/\d/g, (d) => SUB_DIGITS[Number(d)]);
}

export function fromUnicodeSub(s) {
  return String(s).replace(/[₀-₉]/g, (ch) => String(ch.charCodeAt(0) - 0x2080));
}

// Wrap every run of digits (plain OR unicode) in <sub>…</sub> with plain digits inside.
export function toSubHtml(s) {
  const plain = fromUnicodeSub(s);
  return plain.replace(/\d+/g, (run) => `<sub>${run}</sub>`);
}

// Format an ion charge for display: 1 → "+", -1 → "−", -2 → "2−", 3 → "3+" (true minus sign).
export function formatCharge(n) {
  if (!n) return "";
  const sign = n > 0 ? "+" : "−";
  const mag = Math.abs(n);
  return mag === 1 ? sign : `${mag}${sign}`;
}
