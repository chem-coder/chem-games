// Generates shared/data/acids-bases.json — the canonical acid/base reference reused across every
// acid–base trainer. Authored here (classifications match the Acid/Base Sorter; Ka/Kb from the
// CHEM 1415 course reference tables), then pKa/pKb and ASCII formulas are COMPUTED so they can't
// drift or carry a typo. Re-run with:  node tools/build-acid-base-db.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Ka/Kb are stepwise arrays. "strong" marks a step that ionizes ~completely (K ≫ 1). null Kb =
// sparingly soluble hydroxide (characterized by Ksp, not Kb).
const S = "strong";

// ── ACIDS: [formula, name, type, protons, Ka[] ] ──
const ACIDS = [
  ["HCl", "hydrochloric acid", "binary", 1, [S]],
  ["HBr", "hydrobromic acid", "binary", 1, [S]],
  ["HI", "hydroiodic acid", "binary", 1, [S]],
  ["HNO₃", "nitric acid", "oxyacid", 1, [S]],
  ["HClO₄", "perchloric acid", "oxyacid", 1, [S]],
  ["HClO₃", "chloric acid", "oxyacid", 1, [S]],
  ["H₂SO₄", "sulfuric acid", "oxyacid", 2, [S, 1.2e-2]],
  ["HF", "hydrofluoric acid", "binary", 1, [6.8e-4]],
  ["HCN", "hydrocyanic acid", "binary", 1, [6.2e-10]],
  ["H₂S", "hydrosulfuric acid", "binary", 2, [1.0e-7, 1.0e-19]],
  ["HC₂H₃O₂", "acetic acid", "oxyacid", 1, [1.8e-5]],
  ["HNO₂", "nitrous acid", "oxyacid", 1, [4.5e-4]],
  ["HClO₂", "chlorous acid", "oxyacid", 1, [1.1e-2]], // not in the course table — standard value
  ["HClO", "hypochlorous acid", "oxyacid", 1, [3.5e-8]],
  ["HBrO", "hypobromous acid", "oxyacid", 1, [2.0e-9]],
  ["H₂CO₃", "carbonic acid", "oxyacid", 2, [4.3e-7, 5.6e-11]],
  ["H₂SO₃", "sulfurous acid", "oxyacid", 2, [1.5e-2, 6.3e-8]],
  ["H₃PO₄", "phosphoric acid", "oxyacid", 3, [7.5e-3, 6.2e-8, 4.8e-13]],
  ["H₂C₂O₄", "oxalic acid", "oxyacid", 2, [5.9e-2, 6.4e-5]],
  ["HCOOH", "formic acid", "oxyacid", 1, [1.8e-4]],
  ["C₆H₅COOH", "benzoic acid", "oxyacid", 1, [6.5e-5]],
  ["HC₃H₅O₃", "lactic acid", "oxyacid", 1, [1.4e-4]],
  ["CH₂ClCOOH", "chloroacetic acid", "oxyacid", 1, [1.4e-3]],
  ["HOI", "hypoiodous acid", "oxyacid", 1, [2.3e-11]],
  ["HIO₃", "iodic acid", "oxyacid", 1, [1.7e-1]],
  ["H₃PO₃", "phosphorous acid", "oxyacid", 2, [1.0e-2, 2.6e-7]] // diprotic despite 3 H
];

// ── BASES: [formula, name, form, acceptsOrOH, Kb[] ] ──
// form: "hydroxide" | "molecular". acceptsOrOH = OH⁻ per formula (hydroxides) or H⁺ accepted (molecular).
const BASES = [
  ["LiOH", "lithium hydroxide", "hydroxide", 1, [S]],
  ["NaOH", "sodium hydroxide", "hydroxide", 1, [S]],
  ["KOH", "potassium hydroxide", "hydroxide", 1, [S]],
  ["RbOH", "rubidium hydroxide", "hydroxide", 1, [S]],
  ["CsOH", "cesium hydroxide", "hydroxide", 1, [S]],
  ["Ca(OH)₂", "calcium hydroxide", "hydroxide", 2, [S]],
  ["Sr(OH)₂", "strontium hydroxide", "hydroxide", 2, [S]],
  ["Ba(OH)₂", "barium hydroxide", "hydroxide", 2, [S]],
  ["NH₃", "ammonia", "molecular", 1, [1.8e-5]],
  ["CH₃NH₂", "methylamine", "molecular", 1, [3.7e-4]],
  ["C₂H₅NH₂", "ethylamine", "molecular", 1, [6.4e-4]],
  ["(CH₃)₂NH", "dimethylamine", "molecular", 1, [5.4e-4]],
  ["C₅H₅N", "pyridine", "molecular", 1, [1.8e-9]],
  ["(CH₃)₃N", "trimethylamine", "molecular", 1, [6.5e-5]],
  ["C₃H₇NH₂", "propylamine", "molecular", 1, [5.1e-4]],
  ["C₅H₁₁N", "piperidine", "molecular", 1, [1.3e-3]],
  ["N₂H₄", "hydrazine", "molecular", 2, [8.9e-7]], // diacidic (second step negligible)
  ["C₆H₅NH₂", "aniline", "molecular", 1, [4.3e-10]],
  ["Al(OH)₃", "aluminum hydroxide", "hydroxide", 3, [null]],
  ["Fe(OH)₃", "iron(III) hydroxide", "hydroxide", 3, [null]],
  ["Fe(OH)₂", "iron(II) hydroxide", "hydroxide", 2, [null]],
  ["Zn(OH)₂", "zinc hydroxide", "hydroxide", 2, [null]],
  ["Cu(OH)₂", "copper(II) hydroxide", "hydroxide", 2, [null]]
];

const toPlain = (f) => f.replace(/[₀-₉]/g, (c) => c.charCodeAt(0) - 0x2080);
const idOf = (f) => toPlain(f).toLowerCase().replace(/[^a-z0-9]/g, "");
const pK = (arr) => arr.map((k) => (k === S || k == null ? null : Number((-Math.log10(k)).toFixed(2))));

const acids = ACIDS.map(([formula, name, type, protons, Ka]) => ({
  id: idOf(formula),
  formula,
  formulaPlain: toPlain(formula),
  name,
  strength: Ka[0] === S ? "strong" : "weak",
  type,
  protons,
  proticity: protons > 1 ? "polyprotic" : "monoprotic",
  Ka,
  pKa: pK(Ka)
}));

const bases = BASES.map(([formula, name, form, oh, Kb]) => ({
  id: idOf(formula),
  formula,
  formulaPlain: toPlain(formula),
  name,
  strength: Kb[0] === S ? "strong" : "weak",
  form,
  hydroxides: form === "hydroxide" ? oh : null,
  protonsAccepted: oh,
  acidity: oh > 1 ? "polyacidic" : "monoacidic",
  Kb,
  pKb: pK(Kb)
}));

const db = {
  _meta: {
    title: "Acids & Bases — Chem Games shared reference",
    description: "Canonical species table for acid–base trainers. Classifications match the Acid/Base Sorter; Ka/Kb come from the CHEM 1415 course reference tables (25 °C).",
    version: "2026-06-22",
    sources: [
      "Species + classifications: acid-base-sorter deck",
      "Ka/Kb: CHEM 1415 Exam reference Tables I & II, 25 °C",
      "HClO₂ (chlorous) Ka is a standard textbook value — not in the course table"
    ],
    notes: [
      "Ka/Kb are arrays of STEPWISE constants (Ka1, Ka2, …).",
      "'strong' marks a step that ionizes essentially completely (K ≫ 1).",
      "Weak metal hydroxides (Al, Fe, Zn, Cu) are sparingly soluble — described by Ksp, not Kb; their Kb is null.",
      "pKa/pKb = -log10 of each step (null where the step is 'strong' or null).",
      "'formula' uses unicode subscripts; 'formulaPlain' is ASCII for search/matching.",
      "Extensible: the full course table has more weak species (citric, tartaric, arsenic, codeine, …) not yet needed by a game."
    ],
    counts: { acids: acids.length, bases: bases.length }
  },
  acids,
  bases
};

const out = join(root, "shared/data/acids-bases.json");
writeFileSync(out, JSON.stringify(db, null, 2) + "\n");
console.log(`wrote ${out} — ${acids.length} acids, ${bases.length} bases`);
