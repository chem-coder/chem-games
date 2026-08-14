/*
  Cell Numbers — question generators (pure: no DOM; rng injected).
  One generator per rung. Each question:
    { prompt, unit, answer, tol: {abs} | {rel}, hints: [h1, h2], worked }
  hints escalate (formula → plugged numbers); `worked` is the full solution
  shown by "Show me" (which forfeits the clean solve, house hint rules).
  Prompts are plain strings with unicode sub/superscripts; the app upgrades
  them to real markup.
*/
import { VALUES } from "../data/values.js";

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/* rung 1 — cell voltage: subtract the anode's perch */
function genVoltage(rng) {
  const c = pick(VALUES.cathodes, rng);
  const a = pick(VALUES.anodes, rng);
  const answer = round(c.v - a.v);
  return {
    prompt: `${c.abbr} averages ${c.v} V and ${a.abbr} sits at ${a.v} V (both vs Li⁺/Li). What cell voltage does this couple deliver?`,
    unit: "V",
    answer,
    tol: { abs: 0.011 },
    hints: [
      "Cell voltage = cathode potential − anode potential. Both are measured against the same yardstick (Li⁺/Li), so the difference is what the cell sees.",
      `Plug in: ${c.v} − ${a.v}.`,
    ],
    worked: `V(cell) = ${c.v} − ${a.v} = ${answer} V. The anode's job is to sit as low as possible — every volt it perches above lithium is a volt stolen from the cell.`,
  };
}

/* rung 2 — specific energy: capacity × voltage, and the unit magic */
function genEnergy(rng) {
  const m = pick(VALUES.cathodes, rng);
  const answer = round(m.q * m.v, 0);
  return {
    prompt: `${m.abbr} stores ${m.q} mAh/g at an average ${m.v} V. What is its material-level specific energy?`,
    unit: "Wh/kg",
    answer,
    tol: { rel: 0.02 },
    hints: [
      "Specific energy = specific capacity × voltage. The units cooperate: mAh/g × V = mWh/g, and mWh/g is the same number as Wh/kg.",
      `Plug in: ${m.q} × ${m.v}.`,
    ],
    worked: `E = ${m.q} mAh/g × ${m.v} V = ${answer} Wh/kg — material level. Finished cells land near a third of this: the anode, electrolyte, foils, separator, and can all get weighed too.`,
  };
}

/* rung 3 — the couple: capacities combine like resistors in parallel */
function genCouple(rng) {
  const c = pick(VALUES.cathodes, rng);
  const a = pick(VALUES.anodes, rng);
  const answer = round(1 / (1 / c.q + 1 / a.q), 0);
  return {
    prompt: `${c.abbr} gives ${c.q} mAh/g and ${a.abbr} gives ${a.q} mAh/g${a.note ? ` (${a.note})` : ""}. What specific capacity does the couple deliver per gram of BOTH electrodes together?`,
    unit: "mAh/g",
    answer,
    tol: { rel: 0.02 },
    hints: [
      "Every mAh needs its grams on both sides, so capacities combine like parallel resistors: q = 1 / (1/q₊ + 1/q₋). The couple is always worse than its weaker electrode alone.",
      `Plug in: 1 / (1/${c.q} + 1/${a.q}).`,
    ],
    worked: `q(couple) = 1 / (1/${c.q} + 1/${a.q}) = ${answer} mAh/g. This is why a 10× anode doesn't give a 10× cell — the cathode's grams dominate the sum.`,
  };
}

/* rung 4 — C-rate: current or time */
function genCRate(rng) {
  const Q = pick(VALUES.cellCapacities, rng);
  const C = pick(VALUES.cRates, rng);
  if (rng() < 0.5) {
    const answer = round(Q * C);
    return {
      prompt: `A ${Q} Ah cell is cycled at ${C}C. What current is flowing?`,
      unit: "A",
      answer,
      tol: { rel: 0.01 },
      hints: [
        "C-rate names the current relative to capacity: 1C is the current that empties the cell in one hour. Current = C-rate × capacity.",
        `Plug in: ${C} × ${Q}.`,
      ],
      worked: `I = ${C}C × ${Q} Ah = ${answer} A.`,
    };
  }
  const answer = round(60 / C, 0);
  return {
    prompt: `A cell is discharged at a constant ${C}C. How long until it's empty?`,
    unit: "min",
    answer,
    tol: { rel: 0.01 },
    hints: [
      "1C empties the cell in one hour by definition — so the time is one hour divided by the C-rate.",
      `Plug in: 60 min / ${C}.`,
    ],
    worked: `t = 60 / ${C} = ${answer} min. The capacity cancels out — C-rate already normalized it away.`,
  };
}

/* rung 5 — areal capacity: what the coater actually controls */
function genAreal(rng) {
  const m = pick(VALUES.cathodes, rng);
  const L = pick(VALUES.loadings, rng);
  const answer = round((L * m.q) / 1000, 2);
  return {
    prompt: `An ${m.abbr} electrode is coated at ${L} mg/cm² of active material (${m.q} mAh/g). What is its areal capacity?`,
    unit: "mAh/cm²",
    answer,
    tol: { rel: 0.02 },
    hints: [
      "Areal capacity = loading × specific capacity. Watch the units: mg/cm² × mAh/g needs a ÷1000 to reconcile mg with g.",
      `Plug in: ${L} × ${m.q} / 1000.`,
    ],
    worked: `Q(areal) = ${L} mg/cm² × ${m.q} mAh/g ÷ 1000 = ${answer} mAh/cm². Commercial electrodes run ~2–4 mAh/cm² — thicker stores more but the ions can't keep up at rate.`,
  };
}

/* rung 6 — N/P ratio: the plating safety margin */
function genNP(rng) {
  if (rng() < 0.5) {
    const [qa, qc] = pick(VALUES.npPairs, rng);
    const answer = round(qa / qc, 2);
    return {
      prompt: `The anode is coated to ${qa} mAh/cm², the cathode to ${qc} mAh/cm². What is the N/P ratio?`,
      unit: "",
      answer,
      tol: { abs: 0.011 },
      hints: [
        "N/P = negative (anode) areal capacity ÷ positive (cathode) areal capacity — how much spare anode there is to absorb every lithium the cathode sends.",
        `Plug in: ${qa} / ${qc}.`,
      ],
      worked: `N/P = ${qa} / ${qc} = ${answer}. Below 1.0 the anode overfills and lithium plates as metal; too far above 1.0 wastes anode and drags first-cycle efficiency. Industry sits near 1.05–1.15.`,
    };
  }
  const target = pick(VALUES.npTargets, rng);
  const qc = pick([2.5, 3.0, 3.2, 4.0], rng);
  const answer = round(target * qc, 2);
  return {
    prompt: `The cathode is coated to ${qc} mAh/cm² and the design calls for N/P = ${target}. What areal capacity must the anode be coated to?`,
    unit: "mAh/cm²",
    answer,
    tol: { rel: 0.01 },
    hints: [
      "N/P = anode ÷ cathode, so the required anode loading is N/P × cathode areal capacity.",
      `Plug in: ${target} × ${qc}.`,
    ],
    worked: `Q(anode) = ${target} × ${qc} = ${answer} mAh/cm² — the margin that keeps fast-charge lithium going INTO graphite instead of plating onto it.`,
  };
}

export const RUNGS = [
  { key: "voltage", label: "Cell voltage", gen: genVoltage },
  { key: "energy", label: "Specific energy", gen: genEnergy },
  { key: "couple", label: "The couple", gen: genCouple },
  { key: "crate", label: "C-rate", gen: genCRate },
  { key: "areal", label: "Areal capacity", gen: genAreal },
  { key: "np", label: "N/P ratio", gen: genNP },
];

/** answer checking with per-question tolerance */
export function isCorrect(q, value) {
  if (!Number.isFinite(value)) return false;
  const tol = q.tol.abs != null ? q.tol.abs : Math.abs(q.answer) * q.tol.rel;
  return Math.abs(value - q.answer) <= tol;
}
