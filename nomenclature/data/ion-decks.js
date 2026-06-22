// Polyatomic-Ion Trainer decks. Content only. A deck is either a flat list (`ionIds`) or a set of
// grouped `columns` of related ions that render as mini-card columns in the intro. The quiz stack is
// kept to the 4–10 sweet spot (15-at-a-time was brutal). Decks run easiest → pattern-building.
//
// `columns`: [{ head, ids }] — each column is a related family, rendered top → bottom.
// `referenceIds`: ids shown for context (the parent "OG" ion) but NOT quizzed — e.g. carbonate is
//   shown above bicarbonate to make the +H⁺ relationship visible, but only bicarbonate is drilled.

import { POLY_ANION_BY_ID, POLY_CATION_BY_ID, MONO_ANION_BY_ID } from "./ions.js";

export const ION_DECKS = [
  {
    id: "common",
    label: "The common 6",
    blurb: "The everyday polyatomic ions — memorize these first. Watch the charges: most are −1, but sulfate and carbonate are −2 and phosphate is −3.",
    ionIds: ["ammonium", "hydroxide", "nitrate", "sulfate", "carbonate", "phosphate"]
  },
  {
    id: "less-common",
    label: "Less common & interesting",
    blurb: "The next tier you'll meet often. The carboxylates show a neat pattern: charge climbs with the number of –COO⁻ groups (acetate −1, oxalate −2, citrate −3).",
    columns: [
      { head: "Carboxylates", ids: ["acetate", "oxalate", "citrate"] },
      { head: "Metal oxyanions", ids: ["permanganate", "chromate", "dichromate"] },
      { head: "Others", ids: ["cyanide", "thiosulfate"] }
    ]
  },
  {
    id: "ate-ite",
    label: "-ate vs -ite",
    blurb: "Same element, one oxygen apart. The charge does NOT change between -ate and -ite — only the oxygen count and the name ending do.",
    columns: [
      { head: "Nitrogen", ids: ["nitrite", "nitrate"] },
      { head: "Sulfur", ids: ["sulfite", "sulfate"] }
    ]
  },
  {
    id: "chlorine-oxy",
    label: "Chlorine oxyanions",
    blurb: "The full hypo-/-ite/-ate/per- ladder on one element. Every one is −1, including the tinted parent (chloride) — only the oxygen count climbs, 0 → 4.",
    columns: [
      { head: "Chlorine", ids: ["chloride", "hypochlorite", "chlorite", "chlorate", "perchlorate"] }
    ],
    referenceIds: ["chloride"]
  },
  {
    id: "halogen-oxy",
    label: "Bromine & iodine oxyanions",
    blurb: "The same ladder transfers to bromine and iodine — learn one halogen and you know them all. Every one is −1, from the tinted parent halide up through the four oxyanions.",
    columns: [
      { head: "Bromine", ids: ["bromide", "hypobromite", "bromite", "bromate", "perbromate"] },
      { head: "Iodine", ids: ["iodide", "hypoiodite", "iodite", "iodate", "periodate"] }
    ],
    referenceIds: ["bromide", "iodide"]
  },
  {
    id: "hydrogen-ions",
    label: "Hydrogen (bi-) ions",
    blurb: "Add an H⁺ to a polyatomic and the charge rises by one (sulfate −2 → bisulfate −1). The tinted parent ion sits above each. Many have two names: bisulfate or hydrogen sulfate.",
    columns: [
      { head: "Carbonate", ids: ["carbonate", "bicarbonate"] },
      { head: "Sulfate", ids: ["sulfate", "bisulfate"] },
      { head: "Sulfite", ids: ["sulfite", "bisulfite"] },
      { head: "Phosphate", ids: ["phosphate", "biphosphate", "dihydrogen-phosphate"] }
    ],
    referenceIds: ["carbonate", "sulfate", "sulfite", "phosphate"]
  }
];

// Resolve an ion id to its record. Polyatomics (and ammonium) come ready-made; monoatomic anions
// (chloride, bromide, iodide — used as the tinted "parent" of an oxyanion ladder) carry only a
// symbol, so normalize them to the same { display, formulas } shape the display layer expects.
export function resolveIon(id) {
  const poly = POLY_ANION_BY_ID[id] || POLY_CATION_BY_ID[id];
  if (poly) return poly;
  const mono = MONO_ANION_BY_ID[id];
  if (mono) return { ...mono, formulas: [mono.symbol], display: mono.symbol };
  throw new Error(`ion-decks: unknown ion id "${id}"`);
}

// All ids a deck displays, in order (flattening columns).
function allIds(deck) {
  return deck.columns ? deck.columns.flatMap((c) => c.ids) : deck.ionIds;
}

// The QUIZZED ions (the stack) — display ids minus any reference-only ones.
export function deckIons(deck) {
  const ref = new Set(deck.referenceIds || []);
  return allIds(deck).filter((id) => !ref.has(id)).map(resolveIon);
}

// The intro display: grouped columns with a per-ion reference flag, or null for a flat deck.
export function studyColumns(deck) {
  if (!deck.columns) return null;
  const ref = new Set(deck.referenceIds || []);
  return deck.columns.map((col) => ({
    head: col.head,
    items: col.ids.map((id) => ({ ion: resolveIon(id), isReference: ref.has(id) }))
  }));
}
