// pH Lab — pure logic. No DOM here; app.js renders, content.js supplies the item pools.
// Rung 1 (Powers of Ten): every quantity is a clean power of ten, so every conversion is
// exponent arithmetic — flip a sign, or make two numbers meet 14. No logs, no calculator,
// exactly like the exam.

// The four corners of the pH square and the conversions between them (rung 1).
// Every rung-1 item is { kind, n } where n is the magnitude of the GIVEN exponent (or the
// given pH/pOH). n may be 0 (a 1 M strong acid → pH 0) through 14.
//
// Rung 2 (Strong Stuff) items carry a species instead: { kind, species, ions, mantissa, exp }
// for concentration cards (concentration = mantissa × 10^−exp; ions = H⁺ or OH⁻ released per
// unit), and { kind, species, mass, vol, molar } for the grams → moles → M → pH chain.
export const KINDS = {
  "h-to-ph":     { given: "H",    ask: "pH",  answerKind: "integer" },
  "ph-to-h":     { given: "pH",   ask: "H",   answerKind: "exponent" },
  "ph-to-poh":   { given: "pH",   ask: "pOH", answerKind: "integer" },
  "poh-to-ph":   { given: "pOH",  ask: "pH",  answerKind: "integer" },
  "h-to-oh":     { given: "H",    ask: "OH",  answerKind: "exponent" },
  "oh-to-ph":    { given: "OH",   ask: "pH",  answerKind: "integer" },
  "strong-acid": { given: "conc", ask: "pH",  answerKind: "integer" },
  "strong-base": { given: "conc", ask: "pH",  answerKind: "integer" },
  "mass-acid":   { given: "mass", ask: "pH",  answerKind: "integer" },
  "mass-base":   { given: "mass", ask: "pH",  answerKind: "integer" }
};

// [ion] = ions × mantissa × 10^−exp must itself be a clean power of ten — that's the whole
// no-calculator promise. Allowed: 1 × 10^−exp (→ exp) and 2 × 5 × 10^−exp = 10^−(exp−1).
function ionExp(item) {
  const product = item.ions * item.mantissa;
  if (product === 1) return item.exp;
  if (product === 10) return item.exp - 1;
  throw new Error(`not a clean power of ten: ions ${item.ions} × mantissa ${item.mantissa}`);
}

// The mass chain: concentration = (mass ÷ molar) ÷ vol, which must land exactly on 10^−exp.
export function massExp(item) {
  const conc = item.mass / item.molar / item.vol;
  const exp = Math.round(-Math.log10(conc));
  if (Math.abs(conc * 10 ** exp - 1) > 1e-9) throw new Error(`mass chain is not a clean power of ten: ${conc}`);
  return exp;
}

// The single source of numeric truth: what is the answer for this item?
// Integer answers are pH/pOH values (always 0..14 here); exponent answers are the signed
// exponent of a concentration (always negative or zero... in fact always ≤ 0, usually < 0).
export function solve(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph":   return n;            // [H+] = 10^-n  → pH = n
    case "ph-to-h":   return -n;           // pH = n        → [H+] = 10^-n
    case "ph-to-poh": return 14 - n;       // pH + pOH = 14
    case "poh-to-ph": return 14 - n;
    case "h-to-oh":   return -(14 - n);    // exponents sum to −14 (Kw)
    case "oh-to-ph":  return 14 - n;       // [OH-] = 10^-n → pOH = n → pH = 14 − n
    case "strong-acid": return ionExp(item);        // fully dissociated → [H+] read directly
    case "strong-base": return 14 - ionExp(item);   // [OH-] → pOH → pH
    case "mass-acid":   return massExp(item);       // g → mol → M, then as a strong acid
    case "mass-base":   return 14 - massExp(item);
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// Where the solution sits on the 0–14 spine (for the reveal marker). Every problem resolves
// to a pH, even when the ASKED quantity is a concentration or a pOH.
export function solutionPh(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph":   return n;
    case "ph-to-h":   return n;
    case "ph-to-poh": return n;
    case "poh-to-ph": return 14 - n;
    case "h-to-oh":   return n;
    case "oh-to-ph":  return 14 - n;
    // Rung 2 always asks for the pH, so the solution sits exactly where the answer says.
    case "strong-acid": case "strong-base": case "mass-acid": case "mass-base": return solve(item);
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// ── hints: a progressive ladder per kind — rule first, method second, this-card last ──
export function buildHints(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph": return [
      `<strong>pH = −log₁₀[H⁺]</strong>. When the concentration is a power of ten, the pH is just the exponent with its sign flipped.`,
      `[H⁺] = 10<sup>−n</sup> → pH = <strong>n</strong>. No calculating — read the exponent.`,
      `Here the exponent is <strong>−${n}</strong>. Flip its sign.`
    ];
    case "ph-to-h": return [
      `Run the definition backwards: <strong>[H⁺] = 10<sup>−pH</sup></strong>.`,
      `A pH of n means [H⁺] = 10<sup>−n</sup> — put the minus back on.`,
      `Here pH = <strong>${n}</strong>, so the exponent you type is its negative.`
    ];
    case "ph-to-poh": return [
      `<strong>pH + pOH = 14</strong> (at 25 °C). The two always share 14 between them.`,
      `Subtract the one you have from 14.`,
      `14 − <strong>${n}</strong>.`
    ];
    case "poh-to-ph": return [
      `<strong>pH + pOH = 14</strong> (at 25 °C). The two always share 14 between them.`,
      `Subtract the one you have from 14.`,
      `14 − <strong>${n}</strong>.`
    ];
    case "h-to-oh": return [
      `<strong>[H⁺] · [OH⁻] = K<sub>w</sub> = 10⁻¹⁴</strong> (at 25 °C).`,
      `Multiplying powers of ten means <strong>adding exponents</strong> — so the two exponents must add to −14.`,
      `−14 − (−${n}) = the exponent you need.`
    ];
    case "oh-to-ph": return [
      `Two steps: [OH⁻] first tells you the <strong>pOH</strong>, then <strong>pH + pOH = 14</strong> finishes it.`,
      `[OH⁻] = 10<sup>−${n}</sup> → pOH = ${n}.`,
      `pH = 14 − <strong>${n}</strong>.`
    ];
    case "strong-acid": return item.ions === 2 ? [
      `${fmtSpecies(item.species)} is strong <em>and</em> <strong>diprotic</strong> — every unit releases <strong>2 H⁺</strong>, so [H⁺] = 2 × the concentration.`,
      `2 × ${concStr(item)} = <strong>${expStr(ionExp(item))} M</strong> — now it IS a clean power of ten.`,
      `Flip the exponent's sign: pH = <strong>${ionExp(item)}</strong>.`
    ] : [
      `<strong>Strong</strong> means fully dissociated — every unit releases its H⁺, so <strong>[H⁺] = the acid's concentration</strong>.`,
      `${concStr(item)} = ${expStr(item.exp)} M. Flip the exponent's sign.`,
      `pH = <strong>${item.exp}</strong>.`
    ];
    case "strong-base": return [
      item.ions === 2
        ? `A strong base fully dissociates, and this one carries <strong>2 OH⁻</strong> per unit: [OH⁻] = 2 × the concentration. Work out the <strong>pOH</strong> first.`
        : `A strong base fully dissociates: <strong>[OH⁻] = the base's concentration</strong>. Work out the <strong>pOH</strong> first.`,
      `[OH⁻] = ${expStr(ionExp(item))} M → pOH = ${ionExp(item)}.`,
      `pH = 14 − ${ionExp(item)} = <strong>${14 - ionExp(item)}</strong>.`
    ];
    case "mass-acid": case "mass-base": {
      const moles = trimNum(item.mass / item.molar);
      const conc = expStr(massExp(item));
      const acid = item.kind === "mass-acid";
      return [
        `Concentration first: <strong>moles = mass ÷ M<sub>r</sub></strong> → ${item.mass} ÷ ${item.molar} = <strong>${moles} mol</strong>.`,
        `<strong>M = moles ÷ litres</strong> → ${moles} ÷ ${item.vol} = <strong>${conc} M</strong>.`,
        acid
          ? `Now it's a strong-acid card: pH = <strong>${massExp(item)}</strong>.`
          : `Now it's a strong-base card: pOH = ${massExp(item)}, so pH = 14 − ${massExp(item)} = <strong>${14 - massExp(item)}</strong>.`
      ];
    }
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// Plain-ish formatters used inside hints (HTML sup allowed there).
// Formula digits become real subscripts: "H2SO4" → H₂SO₄, "Ba(OH)2" → Ba(OH)₂.
export const fmtSpecies = (formula) => formula.replace(/(\d+)/g, "<sub>$1</sub>");
const trimNum = (x) => String(Number(x.toPrecision(10)));
const expStr = (exp) => (exp <= 3 ? trimNum(10 ** -exp) : `10<sup>−${exp}</sup>`);
export function concStr(item) {
  const value = item.mantissa * 10 ** -item.exp;
  return item.exp <= 3 ? `${trimNum(value)} M` : `${item.mantissa === 1 ? "" : `${item.mantissa} × `}10<sup>−${item.exp}</sup> M`;
}

export function buildProblem(item) {
  const meta = KINDS[item.kind];
  if (!meta) throw new Error(`unknown kind: ${item.kind}`);
  return { ...item, ...meta, answer: solve(item), ph: solutionPh(item), hints: buildHints(item) };
}

// ── grading ──────────────────────────────────────────────────────────────────
// Typed answers are bare integers ("12") for pH/pOH, signed exponents ("−3" / "-3") for
// concentrations. Normalize unicode minus and stray spaces; a leading "+" is fine.
export function parseTyped(text) {
  const cleaned = String(text).replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/^\+/, "");
  if (!/^-?\d{1,2}$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

// Sign near-misses get a nudge and a retry, not a burned card (house pattern from the
// Oxidation-State Trainer). Everything else grades right/wrong.
export function grade(problem, typed) {
  const value = parseTyped(typed);
  if (Number.isNaN(value)) return { correct: false, value, nudge: null };
  if (value === problem.answer) return { correct: true, value, nudge: null };
  if (problem.answerKind === "exponent" && value === -problem.answer && problem.answer !== 0) {
    return { correct: false, value, nudge: "exponent-negative" };
  }
  if (problem.answerKind === "integer" && value === -problem.answer && problem.answer !== 0) {
    return { correct: false, value, nudge: "scale-positive" };
  }
  return { correct: false, value, nudge: null };
}

// Pretty-print an answer for the reveal: "pH 5", "pOH 9", or "10⁻³ M" with a real superscript.
const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const supNum = (x) => String(x).split("").map((c) => SUP[c] ?? c).join("");
export function formatAnswer(problem) {
  if (problem.answerKind === "exponent") return `10${supNum(problem.answer)} M`;
  return `${problem.ask} ${problem.answer}`;
}
