// Syncs Malcolm's study-guide PDFs from the working master into the published folder,
// then checks the deck page's links against what actually landed.
//
//   node tools/sync-study-guides.mjs           copy anything that changed, then verify
//   node tools/sync-study-guides.mjs --check   verify only, write nothing (exit 1 if stale)
//
// WHY THIS EXISTS. There are two copies on purpose:
//
//   "Malcolm's study guides/"    working master — .md + .docx + .pdf, GITIGNORED
//   imat-decks/study-guides/     published PDFs — flat, web-safe names, TRACKED
//
// The master is where you edit and re-export; the published copy is what GitHub Pages
// serves. Without this script the two drift silently: you fix a worksheet, rebuild the
// PDF, and the site keeps serving yesterday's. Files are compared by content hash, so
// re-exporting a PDF with no real change (LibreOffice rewrites timestamps) copies nothing.
//
// The master is gitignored, so on a fresh clone it is absent. That is not an error —
// the script says so and verifies the published folder on its own.
//
// ADDING A LESSON: append to LESSONS if it follows the five-file pattern, or to EXTRAS
// if it does not. Then add the labels to imat-decks/data/guides.js — this script will
// tell you if you forget, because the verify step reads that file.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const MASTER = join(root, "Malcolm's study guides");
const PUBLISHED = join(root, "imat-decks", "study-guides");
const GUIDES_JS = join(root, "imat-decks", "data", "guides.js");

const checkOnly = process.argv.includes("--check");

// ── the five-file lessons ───────────────────────────────────────────────────
// dir = folder under the master · stem = published filename prefix
// then the four source basenames, in the order: sheet, worksheet 1, answers 1,
// worksheet 2, answers 2. Note lesson 10 uses "ANSWER KEY" where the rest use
// "Solutions" — the topic is called Solutions, so "Solutions - Solutions.pdf"
// was too confusing to keep.
const LESSONS = [
  { dir: "01 - Acids and Bases", stem: "acids-bases", base: "Acids and Bases",
    sheet: "IMAT Key Principles - Acids and Bases.pdf", ans: "Solutions" },
  { dir: "04 - Stoichiometry", stem: "stoichiometry", base: "Stoichiometry",
    sheet: "IMAT Key Principles - Stoichiometry.pdf", ans: "Solutions" },
  { dir: "05 - Organic Structure and Biomolecules", stem: "organic-structure", base: "Organic Structure",
    sheet: "IMAT Key Principles - Organic Structure and Biomolecules.pdf", ans: "Solutions" },
  { dir: "06 - Redox and Oxidation Numbers", stem: "redox", base: "Redox",
    sheet: "IMAT Key Principles - Redox and Oxidation Numbers.pdf", ans: "Solutions" },
  { dir: "08 - Atomic Structure and the Periodic Table", stem: "atomic-periodic",
    sheet: "IMAT Key Principles - Atomic Structure and the Periodic Table.pdf", ans: "Solutions",
    q1: "Atomic Structure and Periodic Table - Questions.pdf",
    a1: "Atomic Structure and Periodic Table - Solutions.pdf",
    q2: "Atomic and Periodic Set 2 - Questions.pdf",
    a2: "Atomic and Periodic Set 2 - Solutions.pdf" },
  { dir: "09 - Matter, Mixtures and Measurement", stem: "matter-measurement", base: "Matter and Measurement",
    sheet: "IMAT Key Principles - Matter, Mixtures and Measurement.pdf", ans: "Solutions" },
  { dir: "10 - Solutions", stem: "solutions", base: "Solutions",
    sheet: "IMAT Key Principles - Solutions.pdf", ans: "ANSWER KEY" },
  { dir: "11 - Equilibrium and Kinetics", stem: "equilibrium-kinetics", base: "Equilibrium and Kinetics",
    sheet: "IMAT Key Principles - Equilibrium and Kinetics.pdf", ans: "Solutions" },
  { dir: "12 - Nomenclature", stem: "nomenclature", base: "Nomenclature",
    sheet: "IMAT Key Principles - Nomenclature.pdf", ans: "Solutions" },
];

// ── everything that breaks the pattern ──────────────────────────────────────
const BONDING_1 = "02 - Bonding I - Structure, Shape and Polarity";
const BONDING_2 = "03 - Bonding II - Intermolecular Forces";
const GAS = "07 - Gas Laws";
const EXTRA = "Extra - Electrochemistry & Amines-Amides";

const EXTRAS = {
  "STUDY SCHEDULE - four weeks to the IMAT.pdf": "study-schedule.pdf",

  // bonding is two lessons with one shared set 2
  [`${BONDING_1}/IMAT Key Principles - Bonding I.pdf`]: "bonding-1-study-sheet.pdf",
  [`${BONDING_1}/Bonding I - Questions.pdf`]: "bonding-1-worksheet.pdf",
  [`${BONDING_1}/Bonding I - Solutions.pdf`]: "bonding-1-answers.pdf",
  [`${BONDING_1}/Bonding Set 2 (lessons 2 and 3) - Questions.pdf`]: "bonding-worksheet-2.pdf",
  [`${BONDING_1}/Bonding Set 2 (lessons 2 and 3) - Solutions.pdf`]: "bonding-answers-2.pdf",
  [`${BONDING_2}/IMAT Key Principles - Bonding II.pdf`]: "bonding-2-study-sheet.pdf",
  [`${BONDING_2}/Bonding II - Questions.pdf`]: "bonding-2-worksheet.pdf",
  [`${BONDING_2}/Bonding II - Solutions.pdf`]: "bonding-2-answers.pdf",

  "05 - Organic Structure and Biomolecules/Functional Groups Chart (reference).pdf":
    "functional-groups-chart.pdf",

  // gas laws has one set plus the earlier 50-question practice paper
  [`${GAS}/IMAT Key Principles - Gas Laws.pdf`]: "gas-laws-study-sheet.pdf",
  [`${GAS}/Gas Laws - Questions.pdf`]: "gas-laws-worksheet.pdf",
  [`${GAS}/Gas Laws - Solutions.pdf`]: "gas-laws-answers.pdf",
  [`${GAS}/Gas Law - Practice Set (earlier, 50 questions).pdf`]: "gas-laws-practice-50.pdf",
  [`${GAS}/Gas Law Practice Set - WORKED SOLUTIONS.pdf`]: "gas-laws-practice-50-answers.pdf",

  "10 - Solutions/Solutions and Colligative Properties - Questions (from earlier set).pdf":
    "colligative-properties-worksheet.pdf",
  "10 - Solutions/Solutions and Colligative Properties - ANSWER KEY (for the earlier set).pdf":
    "colligative-properties-answers.pdf",

  // off-track material, kept because it is written and useful
  [`${EXTRA}/IMAT Key Principles - Electrochemistry, Amines and Amides.pdf`]: "extra-electrochem-amines-study-sheet.pdf",
  [`${EXTRA}/Electrochemistry - Questions.pdf`]: "extra-electrochem-worksheet-1.pdf",
  [`${EXTRA}/Electrochemistry - Solutions.pdf`]: "extra-electrochem-answers-1.pdf",
  [`${EXTRA}/Electrochemistry Set 2 - Questions.pdf`]: "extra-electrochem-worksheet-2.pdf",
  [`${EXTRA}/Electrochemistry Set 2 - Solutions.pdf`]: "extra-electrochem-answers-2.pdf",
  [`${EXTRA}/Amines and Amides - Questions.pdf`]: "extra-amines-amides-worksheet-1.pdf",
  [`${EXTRA}/Amines and Amides - Solutions.pdf`]: "extra-amines-amides-answers-1.pdf",
  [`${EXTRA}/Amines and Amides Set 2 - Questions.pdf`]: "extra-amines-amides-worksheet-2.pdf",
  [`${EXTRA}/Amines and Amides Set 2 - Solutions.pdf`]: "extra-amines-amides-answers-2.pdf",
};

function buildMap() {
  const map = { ...EXTRAS };
  for (const L of LESSONS) {
    const b = L.base;
    map[`${L.dir}/${L.sheet}`] = `${L.stem}-study-sheet.pdf`;
    map[`${L.dir}/${L.q1 ?? `${b} - Questions.pdf`}`] = `${L.stem}-worksheet-1.pdf`;
    map[`${L.dir}/${L.a1 ?? `${b} - ${L.ans}.pdf`}`] = `${L.stem}-answers-1.pdf`;
    map[`${L.dir}/${L.q2 ?? `${b} Set 2 - Questions.pdf`}`] = `${L.stem}-worksheet-2.pdf`;
    map[`${L.dir}/${L.a2 ?? `${b} Set 2 - ${L.ans}.pdf`}`] = `${L.stem}-answers-2.pdf`;
  }
  return map;
}

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

// ── copy ────────────────────────────────────────────────────────────────────
function sync(map) {
  if (!existsSync(MASTER)) {
    console.log("· master folder not present (it is gitignored) — verifying published files only\n");
    return { copied: [], missing: [], skipped: true };
  }
  if (!existsSync(PUBLISHED)) mkdirSync(PUBLISHED, { recursive: true });

  const copied = [], missing = [];
  for (const [src, dst] of Object.entries(map)) {
    const from = join(MASTER, src), to = join(PUBLISHED, dst);
    if (!existsSync(from)) { missing.push(src); continue; }
    if (existsSync(to) && sha(from) === sha(to)) continue;
    if (!checkOnly) writeFileSync(to, readFileSync(from));
    copied.push(dst);
  }
  return { copied, missing, skipped: false };
}

// ── verify the deck page's links ────────────────────────────────────────────
async function verify() {
  const { GUIDES, SCHEDULE } = await import(pathToFileURL(GUIDES_JS).href);
  const referenced = new Set([SCHEDULE.file]);
  for (const items of Object.values(GUIDES)) for (const g of items) referenced.add(g.file);

  const present = new Set(
    existsSync(PUBLISHED) ? readdirSync(PUBLISHED).filter((f) => f.endsWith(".pdf")) : []
  );
  return {
    broken: [...referenced].filter((f) => !present.has(f)).sort(),   // link → 404
    orphan: [...present].filter((f) => !referenced.has(f)).sort(),   // shipped, unreachable
    referenced: referenced.size,
  };
}

// ── run ─────────────────────────────────────────────────────────────────────
const map = buildMap();
const { copied, missing, skipped } = sync(map);
const { broken, orphan, referenced } = await verify();

const verb = checkOnly ? "would be copied" : "copied";
console.log(`${Object.keys(map).length} files mapped · ${referenced} referenced by guides.js`);
if (copied.length) {
  console.log(`\n${copied.length} ${verb}:`);
  for (const f of copied) console.log(`  ${f}`);
} else if (!skipped) {
  console.log("\npublished copy is up to date");
}
if (missing.length) {
  console.log(`\n⚠ ${missing.length} mapped but not found in the master (renamed or deleted?):`);
  for (const f of missing) console.log(`  ${f}`);
}
if (broken.length) {
  console.log(`\n✗ ${broken.length} linked from guides.js but NOT published — these are 404s:`);
  for (const f of broken) console.log(`  ${f}`);
}
if (orphan.length) {
  console.log(`\n· ${orphan.length} published but not linked from guides.js (harmless, just unreachable):`);
  for (const f of orphan) console.log(`  ${f}`);
}

const stale = checkOnly && copied.length > 0;
if (broken.length || missing.length || stale) {
  if (stale) console.log("\nRun without --check to bring the published copy up to date.");
  process.exit(1);
}
console.log("\n✓ all good");
