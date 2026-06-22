// Grading for the Nomenclature engine. Pure, no DOM. ESM for node --test.
//
// Grading is membership in an accepted set, never a regex. `assemble()` produced every spelling the
// course accepts; here we normalise the student's input the same way and check whether it lands in
// that set. On a hit we also report the *other* accepted names so the UI can teach the equivalent
// ("✓ bicarbonate — also written hydrogen carbonate").

import { fromUnicodeSub } from "./chem.js";

// Names: case-insensitive; collapse whitespace; tidy the Roman-numeral parens so "iron (III)" and
// "iron(iii)" both match "iron(III)". Drop a trailing period.
export function normalizeName(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/\.$/, "")
    .replace(/\s*\(\s*/g, "(") // tidy space around an opening paren
    .replace(/\s*\)/g, ")")    // …and before a closing paren, but keep the separator after it
    .replace(/\s+/g, " ");
}

// Formulas: subscripts may be typed as plain digits or unicode — fold to plain digits. Strip spaces.
// Case is meaningful in a formula (Co ≠ CO), so it is preserved. The charge has its own field, but
// students naturally write it into the formula too (NH4+, NO3⁻), so drop a trailing charge sign —
// only the sign characters, never a digit (NO3- must stay NO3, not collapse to NO).
export function normalizeFormula(s) {
  return fromUnicodeSub(String(s))
    .replace(/\s+/g, "")
    // Strip a trailing charge run: superscript digits (²³ live outside the ⁰-⁹ block), superscript
    // signs, and ASCII +/-/−. ASCII digits are deliberately excluded so NO3- → NO3, not NO.
    .replace(/[²³¹⁰⁴-⁹⁺⁻+\-−]+$/, "");
}

// Shared core: does `input` match any accepted form (under `normalize`)? Report the equivalents.
function grade(accepted, input, normalize) {
  const want = normalize(input);
  const matchedIndex = accepted.findIndex((form) => normalize(form) === want);
  const correct = matchedIndex !== -1;
  // "Also accepted" = the other forms that differ once normalised (skip pure case/spacing twins).
  const seen = new Set([want]);
  const alsoAccepted = [];
  accepted.forEach((form, i) => {
    if (i === matchedIndex) return;
    const n = normalize(form);
    if (seen.has(n)) return;
    seen.add(n);
    alsoAccepted.push(form);
  });
  return { correct, matched: correct ? accepted[matchedIndex] : null, alsoAccepted };
}

// Grade a typed NAME against an assembled compound (or any { name: { canonical, accepted } }).
export function gradeName(target, input) {
  const { correct, matched, alsoAccepted } = grade(target.name.accepted, input, normalizeName);
  return { correct, matched, canonical: target.name.canonical, alsoAccepted };
}

// Grade a typed FORMULA against an assembled compound (reverse mode: name → formula).
export function gradeFormula(target, input) {
  const { correct, matched, alsoAccepted } = grade(target.formula.accepted, input, normalizeFormula);
  return { correct, matched, canonical: target.formula.canonical, alsoAccepted };
}
