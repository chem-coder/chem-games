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
  "mass-base":   { given: "mass", ask: "pH",  answerKind: "integer" },
  "dilute-made":   { given: "dilution", ask: "pH",     answerKind: "integer" },
  "dilute-by":     { given: "dilution", ask: "pH",     answerKind: "integer" },
  "dilute-add":    { given: "dilution", ask: "vol",    answerKind: "volume" },
  "dilute-factor": { given: "dilution", ask: "factor", answerKind: "factor" }
};

// ── rung 3: dilution ─────────────────────────────────────────────────────────
// Each ×10 dilution moves the pH one step toward 7 — and never past it. The formal
// arithmetic can cross 7; real solutions can't, because water's own ions take over.
// `approx: true` means the value clamped (display "≈7", accept a typed 7).
export function dilute(ph, factorExp, side) {
  if (side === "acid") {
    const formal = ph + factorExp;
    return formal >= 7 && ph < 7 ? { ph: 7, approx: true } : { ph: formal, approx: false };
  }
  if (side === "base") {
    const formal = ph - factorExp;
    return formal <= 7 && ph > 7 ? { ph: 7, approx: true } : { ph: formal, approx: false };
  }
  throw new Error(`unknown side: ${side}`);
}

// "made up to": dilution factor from the two volumes — must be a clean power of ten.
export function volFactorExp(startVolMl, endVolL) {
  const factor = (endVolL * 1000) / startVolMl;
  const k = Math.round(Math.log10(factor));
  if (10 ** k !== factor) throw new Error(`dilution factor ${factor} is not a power of ten`);
  return k;
}
// pH steps between here and the target (always toward 7).
const stepsBetween = (item) => item.side === "acid" ? item.targetPh - item.startPh : item.startPh - item.targetPh;

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
    case "dilute-made": {                            // volumes → factor → steps toward 7
      const startPh = item.side === "acid" ? item.exp : 14 - item.exp;
      return dilute(startPh, volFactorExp(item.startVolMl, item.endVolL), item.side).ph;
    }
    case "dilute-by":     return dilute(item.startPh, item.factorK, item.side).ph;
    case "dilute-add":    return item.startVolMl * 10 ** stepsBetween(item) - item.startVolMl; // ADDED, not total
    case "dilute-factor": return 10 ** stepsBetween(item);
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// Did this problem's answer clamp at the ≈7 ceiling? (Drives the "≈7" display.)
export function isApprox(item) {
  if (item.kind === "dilute-by") return dilute(item.startPh, item.factorK, item.side).approx;
  if (item.kind === "dilute-made") {
    const startPh = item.side === "acid" ? item.exp : 14 - item.exp;
    return dilute(startPh, volFactorExp(item.startVolMl, item.endVolL), item.side).approx;
  }
  return false;
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
    // Rungs 2–3 mostly ask for the pH, so the solution sits where the answer says; the
    // volume/factor cards sit at their TARGET pH.
    case "strong-acid": case "strong-base": case "mass-acid": case "mass-base":
    case "dilute-made": case "dilute-by": return solve(item);
    case "dilute-add": case "dilute-factor": return item.targetPh;
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
    case "dilute-made": {
      const k = volFactorExp(item.startVolMl, item.endVolL);
      return [
        `Dilution factor first: <strong>final volume ÷ starting volume</strong>.`,
        `${item.endVolL} L ÷ ${item.startVolMl} mL = ×10<sup>${k}</sup> — that's <strong>${k} step${k === 1 ? "" : "s"}</strong>, each one pH step toward 7.`,
        `Start at pH ${item.side === "acid" ? item.exp : 14 - item.exp}, take ${k} step${k === 1 ? "" : "s"} toward 7.`
      ];
    }
    case "dilute-by": return [
      `Each <strong>×10</strong> of dilution moves the pH <strong>one step toward 7</strong>.`,
      `×10<sup>${item.factorK}</sup> = ${item.factorK} steps from pH ${item.startPh}.`,
      `Careful near the middle — dilution can bring a solution <em>toward</em> 7, but never past it.`
    ];
    case "dilute-add": {
      const k = stepsBetween(item);
      return [
        `Each pH step toward 7 needs <strong>×10 the total volume</strong>.`,
        `pH ${item.startPh} → pH ${item.targetPh} is ${k} step${k === 1 ? "" : "s"}: total = ${item.startVolMl} mL × 10<sup>${k}</sup> = <strong>${item.startVolMl * 10 ** k} mL</strong>.`,
        `The question asks how much to <strong>ADD</strong> — and some of the total is already in the flask.`
      ];
    }
    case "dilute-factor": {
      const k = stepsBetween(item);
      return [
        `Count the pH steps: ${item.startPh} → ${item.targetPh} is <strong>${k}</strong>.`,
        `Each step is ×10, so the factor is 10<sup>${k}</sup>.`
      ];
    }
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// ── rung 4: the pH Ladder (qualitative ordering at equal concentration) ──────
// One rule: diprotic strong acid < strong acid < weak acid < 7 < weak base <
// strong base < diprotic strong base. Weak species get a PLACE, never a number.
export const LADDER_CLASSES = {
  sa2: { rank: 0, chip: "strong acid · 2 H⁺" },
  sa1: { rank: 1, chip: "strong acid" },
  wa:  { rank: 2, chip: "weak acid" },
  ns:  { rank: 3, chip: "neutral salt · pH 7" },
  w7:  { rank: 3, chip: "pure water · pH 7" },
  wb:  { rank: 4, chip: "weak base" },
  sb1: { rank: 5, chip: "strong base" },
  sb2: { rank: 6, chip: "strong base · 2 OH⁻" }
};
export const LADDER_SPECIES = {
  "HCl": "sa1", "HNO3": "sa1", "H2SO4": "sa2",
  "CH3COOH": "wa", "HCOOH": "wa", "HF": "wa",
  "NaCl": "ns", "KNO3": "ns", "KCl": "ns", "H2O": "w7",
  "NH3": "wb", "NaOH": "sb1", "KOH": "sb1", "Ba(OH)2": "sb2", "Ca(OH)2": "sb2"
};
export function ladderClass(species) {
  const cls = LADDER_SPECIES[species];
  if (!cls) throw new Error(`unknown ladder species: ${species}`);
  return cls;
}
export const ladderRank = (species) => LADDER_CLASSES[ladderClass(species)].rank;
export const ladderChip = (species) => LADDER_CLASSES[ladderClass(species)].chip;

// The correct sequence for a puzzle — throws on class ties (an ambiguous ordering is an
// authoring error, same spirit as the clean-power-of-ten guarantee).
export function ladderSolve(puzzle) {
  const ranks = puzzle.species.map(ladderRank);
  if (new Set(ranks).size !== ranks.length) throw new Error(`ladder puzzle has a class tie: ${puzzle.species.join(", ")}`);
  const sorted = puzzle.species.slice().sort((a, b) => ladderRank(a) - ladderRank(b));
  return puzzle.direction === "dec" ? sorted.reverse() : sorted;
}

// Grade a full placement: overall verdict plus per-slot marks for the reveal.
export function ladderGrade(placed, puzzle) {
  const expected = ladderSolve(puzzle);
  const perSlot = placed.map((s, i) => s === expected[i]);
  return { correct: perSlot.every(Boolean), perSlot, expected };
}

export function ladderHints(puzzle) {
  const hints = [
    `Classify each one first: strong acid, weak acid, neutral, weak base, or strong base. Don't order anything until every card has a class.`,
    `At equal concentration: <strong>strong acid &lt; weak acid &lt; 7 &lt; weak base &lt; strong base</strong>. Neutral salts and pure water sit exactly at 7.`
  ];
  const hasDi = puzzle.species.some((s) => ["sa2", "sb2"].includes(ladderClass(s)));
  hints.push(hasDi
    ? `Count the ions: a <strong>diprotic</strong> acid (or a 2 OH⁻ base) releases twice as much per unit, so it pulls <em>further</em> from 7 than its monoprotic neighbour.`
    : `Weak just means <em>partially</em> dissociated — a weak acid is still an acid, so it sits between the strong acids and 7, never above it.`);
  if (puzzle.direction === "dec") hints.push(`Read the direction again — this ladder runs <strong>highest pH first</strong>.`);
  return hints;
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
  return { ...item, ...meta, answer: solve(item), ph: solutionPh(item), approx: isApprox(item), hints: buildHints(item) };
}

// ── grading ──────────────────────────────────────────────────────────────────
// Typed answers are bare integers ("12") for pH/pOH, signed exponents ("−3" / "-3") for
// concentrations. Normalize unicode minus and stray spaces; a leading "+" is fine.
export function parseTyped(text) {
  const cleaned = String(text).replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/^\+/, "").replace(/^[x×]/i, "");
  if (!/^-?\d{1,4}$/.test(cleaned)) return NaN;   // up to 4 digits: volumes (999) and factors (1000)
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
  if (problem.answerKind === "volume") return `${problem.answer} mL`;
  if (problem.answerKind === "factor") return `× ${problem.answer}`;
  return `${problem.ask} ${problem.approx ? "≈" : ""}${problem.answer}`;
}
