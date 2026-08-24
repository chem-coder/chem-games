// Study guides attached to each deck — PDFs live in imat-decks/study-guides/.
// Keyed by deck id (see decks.js). Each entry: { label, file }.
// Several decks deliberately share a guide: atomic-structure and periodic-table
// were taught as one lesson, as were equilibrium and kinetics.
// Add a deck id here and the disclosure appears on that row automatically;
// omit one and the row renders exactly as it did before.

export const SCHEDULE = {
  label: "Malcolm's four-week study schedule",
  file: "study-schedule.pdf",
  note: "Twelve sessions from 24 August to the exam on 21 September.",
};

const set = (stem, opts = {}) => [
  { label: "Study sheet", file: `${stem}-study-sheet.pdf` },
  { label: "Worksheet · set 1", file: `${stem}-worksheet-1.pdf` },
  { label: "Answers · set 1", file: `${stem}-answers-1.pdf` },
  { label: "Worksheet · set 2", file: `${stem}-worksheet-2.pdf` },
  { label: "Answers · set 2", file: `${stem}-answers-2.pdf` },
  ...(opts.extra || []),
];

export const GUIDES = {
  "matter-states-mixtures": set("matter-measurement"),

  "atomic-structure": set("atomic-periodic"),
  "periodic-table": set("atomic-periodic"),

  "chemical-bond": [
    { label: "Study sheet · bonding I — structure, shape, polarity", file: "bonding-1-study-sheet.pdf" },
    { label: "Worksheet · bonding I", file: "bonding-1-worksheet.pdf" },
    { label: "Answers · bonding I", file: "bonding-1-answers.pdf" },
    { label: "Study sheet · bonding II — intermolecular forces", file: "bonding-2-study-sheet.pdf" },
    { label: "Worksheet · bonding II", file: "bonding-2-worksheet.pdf" },
    { label: "Answers · bonding II", file: "bonding-2-answers.pdf" },
    { label: "Worksheet · set 2 (both halves)", file: "bonding-worksheet-2.pdf" },
    { label: "Answers · set 2 (both halves)", file: "bonding-answers-2.pdf" },
  ],

  "inorganic-nomenclature": set("nomenclature"),

  "stoichiometry": set("stoichiometry"),

  "solutions": set("solutions", {
    extra: [
      { label: "Worksheet · colligative properties", file: "colligative-properties-worksheet.pdf" },
      { label: "Answers · colligative properties", file: "colligative-properties-answers.pdf" },
    ],
  }),

  "gas-laws": [
    { label: "Study sheet", file: "gas-laws-study-sheet.pdf" },
    { label: "Worksheet", file: "gas-laws-worksheet.pdf" },
    { label: "Answers", file: "gas-laws-answers.pdf" },
    { label: "Practice set · 50 questions", file: "gas-laws-practice-50.pdf" },
    { label: "Worked solutions · 50 questions", file: "gas-laws-practice-50-answers.pdf" },
  ],

  "equilibrium": set("equilibrium-kinetics"),
  "kinetics": set("equilibrium-kinetics"),

  "acids-bases": set("acids-bases"),

  "redox-electrochem": set("redox", {
    extra: [
      { label: "Beyond the exam · electrochemical cells — study sheet", file: "extra-electrochem-amines-study-sheet.pdf" },
      { label: "Beyond the exam · cells worksheet 1", file: "extra-electrochem-worksheet-1.pdf" },
      { label: "Beyond the exam · cells answers 1", file: "extra-electrochem-answers-1.pdf" },
      { label: "Beyond the exam · cells worksheet 2", file: "extra-electrochem-worksheet-2.pdf" },
      { label: "Beyond the exam · cells answers 2", file: "extra-electrochem-answers-2.pdf" },
    ],
  }),

  "organic-structure": set("organic-structure", {
    extra: [{ label: "Reference · functional groups chart", file: "functional-groups-chart.pdf" }],
  }),

  "organic-nomenclature-groups": [
    { label: "Study sheet · nomenclature", file: "nomenclature-study-sheet.pdf" },
    { label: "Worksheet · set 1", file: "nomenclature-worksheet-1.pdf" },
    { label: "Answers · set 1", file: "nomenclature-answers-1.pdf" },
    { label: "Worksheet · set 2", file: "nomenclature-worksheet-2.pdf" },
    { label: "Answers · set 2", file: "nomenclature-answers-2.pdf" },
    { label: "Reference · functional groups chart", file: "functional-groups-chart.pdf" },
  ],

  "organic-reactions": [
    { label: "Beyond the exam · amines & amides — study sheet", file: "extra-electrochem-amines-study-sheet.pdf" },
    { label: "Worksheet · set 1", file: "extra-amines-amides-worksheet-1.pdf" },
    { label: "Answers · set 1", file: "extra-amines-amides-answers-1.pdf" },
    { label: "Worksheet · set 2", file: "extra-amines-amides-worksheet-2.pdf" },
    { label: "Answers · set 2", file: "extra-amines-amides-answers-2.pdf" },
  ],
};
