// Grading for the Nomenclature engine. Pure, no DOM. ESM for node --test.
//
// Grading is membership in an accepted set, never a regex. `assemble()` produced every spelling the
// course accepts; here we normalise the student's input the same way and check whether it lands in
// that set. On a hit we also report the *other* accepted names so the UI can teach the equivalent
// ("✓ bicarbonate — also written hydrogen carbonate").

import { fromUnicodeSub } from "./chem.js";

// Names: case-insensitive; collapse whitespace; tidy the Roman-numeral parens so "iron (III)" and
// "iron(iii)" both match "iron(III)". Also forgive stray punctuation a student might fat-finger
// (a trailing "\", ".", ",", "/") — only at the ends, so it never alters the chemistry.
export function normalizeName(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/^[^a-z(]+/, "")   // strip leading junk (must start with a letter or "(")
    .replace(/[^a-z)]+$/, "")   // strip trailing junk (must end with a letter or ")")
    .replace(/\s*\(\s*/g, "(") // tidy space around an opening paren
    .replace(/\s*\)/g, ")")    // …and before a closing paren, but keep the separator after it
    .replace(/\s+/g, " ")
    .trim();
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

const CHARGE_RUN = /[²³¹⁰⁴-⁹⁺⁻+\-−]+$/; // a trailing charge: superscript digits/signs or ASCII +/-/−

// Grade a typed FORMULA against an assembled compound.
//
// Two contexts:
//  - ION grading (default): a free-standing ion may legitimately carry its charge (NH₄⁺), so a
//    trailing charge is stripped and all whitespace collapsed (the triad trainer relies on this).
//  - NEUTRAL COMPOUND grading ({ neutral: true }, the Name Builder): the unifying rule is
//    "formatting → nudge, chemistry → wrong." If the chemistry (symbols, subscripts, counts,
//    parentheses) is right but the format is off, we return correct:false plus a `nudge` category
//    so the UI can teach and let the student retry. A stray charge is a real error here (a compound
//    is neutral). Categories: charge / fspace (no spaces in a formula) / fsymbol (extra characters)
//    / caps (Co≠CO). caseOnly/chargeOnly are kept for back-compat. Truly wrong → nudge:null.
export function gradeFormula(target, input, { neutral = false } = {}) {
  const accepted = target.formula.accepted;
  const canonical = target.formula.canonical;
  if (!neutral) {
    const { correct, matched, alsoAccepted } = grade(accepted, input, normalizeFormula);
    const caseOnly = !correct && grade(accepted, input, (s) => normalizeFormula(s).toLowerCase()).correct;
    return { correct, matched, canonical, alsoAccepted, caseOnly, chargeOnly: false, nudge: null };
  }
  const sub = (s) => fromUnicodeSub(String(s));
  const exact = (s) => sub(s).trim();                          // perfect format (case-sensitive, no extras)
  const chem = (s) => exact(s).toLowerCase().replace(/\s+/g, "").replace(/[/.,\\]+$/, "").replace(CHARGE_RUN, ""); // pure chemistry
  const r = grade(accepted, input, exact);
  if (r.correct) return { ...r, canonical, caseOnly: false, chargeOnly: false, nudge: null };
  const chemOk = accepted.some((f) => chem(f) === chem(input));
  if (!chemOk) return { correct: false, matched: null, canonical, alsoAccepted: [], caseOnly: false, chargeOnly: false, nudge: null };
  // chemistry is right, format is off → classify the slip (one at a time; the student fixes & retries)
  const t = exact(input);
  const nudge = CHARGE_RUN.test(t) ? "charge" : /\s/.test(t) ? "fspace" : /[/.,\\]+$/.test(t) ? "fsymbol" : "caps";
  return { correct: false, matched: null, canonical, alsoAccepted: [], caseOnly: nudge === "caps", chargeOnly: nudge === "charge", nudge };
}
