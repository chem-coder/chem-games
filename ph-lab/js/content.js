// pH Lab — content. Rung 1 of the six-rung ladder (see documentation/imat-course/ph-lab-plan.md).
// Content only — no logic. Each item is a conversion card: `kind` names the corner-to-corner
// move on the pH square, `n` is the given exponent magnitude (or the given pH/pOH), and
// `expected` is the hand-entered answer so the tests can cross-check the engine's arithmetic.
//
// Numbers are chosen the way IMAT chooses them: clean powers of ten, including the corners
// students wobble on — 1 M acid (pH 0), neutral 10⁻⁷, and the basic far end.

export const TIERS = [
  {
    id: "powers",
    label: "Powers of Ten",
    tagline: "the pH square — flip a sign, or make it 14",
    items: [
      // [H+] → pH: read the exponent
      { id: "h5",  kind: "h-to-ph", n: 5,  expected: 5 },
      { id: "h3",  kind: "h-to-ph", n: 3,  expected: 3 },
      { id: "h7",  kind: "h-to-ph", n: 7,  expected: 7 },   // neutral — worth meeting as a card
      { id: "h0",  kind: "h-to-ph", n: 0,  expected: 0 },   // 1 M strong acid → pH 0, the mind-bender
      { id: "h12", kind: "h-to-ph", n: 12, expected: 12 },  // [H+] tiny → basic, pH is still "of H+"
      // pH → [H+]: put the minus back
      { id: "p2",  kind: "ph-to-h", n: 2,  expected: -2 },
      { id: "p6",  kind: "ph-to-h", n: 6,  expected: -6 },
      { id: "p11", kind: "ph-to-h", n: 11, expected: -11 },
      // pH ↔ pOH: share 14
      { id: "pp3",  kind: "ph-to-poh", n: 3,  expected: 11 },
      { id: "pp10", kind: "ph-to-poh", n: 10, expected: 4 },
      { id: "op2",  kind: "poh-to-ph", n: 2,  expected: 12 },
      { id: "op9",  kind: "poh-to-ph", n: 9,  expected: 5 },
      // [H+] → [OH−]: exponents add to −14 (Kw)
      { id: "ho4",  kind: "h-to-oh", n: 4,  expected: -10 },
      { id: "ho9",  kind: "h-to-oh", n: 9,  expected: -5 },
      { id: "ho7",  kind: "h-to-oh", n: 7,  expected: -7 },  // neutral meets Kw
      // [OH−] → pH: the two-step chain
      { id: "oh2",  kind: "oh-to-ph", n: 2,  expected: 12 },
      { id: "oh5",  kind: "oh-to-ph", n: 5,  expected: 9 },
      { id: "oh10", kind: "oh-to-ph", n: 10, expected: 4 }   // an [OH−] can still mean an acid
    ]
  },
  {
    id: "strong",
    label: "Strong Stuff",
    tagline: "fully dissociated — the concentration IS the answer",
    items: [
      // strong monoprotic acids: [H+] = the concentration, straight off
      { id: "sa-hcl2",   kind: "strong-acid", species: "HCl",     ions: 1, mantissa: 1, exp: 2, expected: 2 },
      { id: "sa-hno3",   kind: "strong-acid", species: "HNO3",    ions: 1, mantissa: 1, exp: 3, expected: 3 },
      { id: "sa-hcl1",   kind: "strong-acid", species: "HCl",     ions: 1, mantissa: 1, exp: 1, expected: 1 },
      { id: "sa-hno0",   kind: "strong-acid", species: "HNO3",    ions: 1, mantissa: 1, exp: 0, expected: 0 },  // 1 M → pH 0
      // the diprotic wrinkle: 2 H⁺ per unit turns 5×10⁻ⁿ into a clean power of ten (2021 Q47's trap)
      { id: "sa-h2so4a", kind: "strong-acid", species: "H2SO4",   ions: 2, mantissa: 5, exp: 3, expected: 2 },
      { id: "sa-h2so4b", kind: "strong-acid", species: "H2SO4",   ions: 2, mantissa: 5, exp: 2, expected: 1 },
      // strong bases: [OH−] first, pOH, then 14 −
      { id: "sb-naoh2",  kind: "strong-base", species: "NaOH",    ions: 1, mantissa: 1, exp: 2, expected: 12 }, // 2016 Q48 verbatim shape
      { id: "sb-koh3",   kind: "strong-base", species: "KOH",     ions: 1, mantissa: 1, exp: 3, expected: 11 },
      { id: "sb-naoh1",  kind: "strong-base", species: "NaOH",    ions: 1, mantissa: 1, exp: 1, expected: 13 },
      { id: "sb-baoh2a", kind: "strong-base", species: "Ba(OH)2", ions: 2, mantissa: 5, exp: 3, expected: 12 },
      { id: "sb-baoh2b", kind: "strong-base", species: "Ba(OH)2", ions: 2, mantissa: 5, exp: 2, expected: 13 },
      // the mass chain: g → mol → M → pH (2022 Q47's shape, Mr given on the card like IMAT
      // does — but our own numbers, never the exam's verbatim)
      { id: "ma-hcl",  kind: "mass-acid", species: "HCl",  mass: 0.73,  vol: 20, molar: 36.5, expected: 3 },
      { id: "ma-hno3", kind: "mass-acid", species: "HNO3", mass: 6.3,   vol: 1,  molar: 63,   expected: 1 },
      { id: "mb-naoh", kind: "mass-base", species: "NaOH", mass: 4,     vol: 10, molar: 40,   expected: 12 },
      { id: "mb-koh",  kind: "mass-base", species: "KOH",  mass: 5.6,   vol: 1,  molar: 56,   expected: 13 }
    ]
  },
  {
    id: "dilution",
    label: "Dilution Bench",
    tagline: "every ×10 is one pH step toward 7 — predict before the meter reads",
    // Phase 1: scripted bench sessions on a continuing beaker. `expected` chains are
    // hand-entered (approx marks the ≈7 clamp — THE discovery; the intro stays silent
    // about it on purpose, so don't leak it in step text).
    sessions: [
      {
        id: "acid-run", side: "acid", label: "the acid",
        startText: "10 mL of 0.1 M HCl", startPh: 1,
        steps: [
          { k: 1, expected: 2,  approx: false },
          { k: 2, expected: 4,  approx: false },
          { k: 1, expected: 5,  approx: false },
          { k: 1, expected: 6,  approx: false },
          { k: 2, expected: 7,  approx: true }   // formally 8 — the meter says otherwise
        ]
      },
      {
        id: "base-run", side: "base", label: "the base",
        startText: "10 mL of 0.1 M NaOH", startPh: 13,
        steps: [
          { k: 1, expected: 12, approx: false },
          { k: 2, expected: 10, approx: false },
          { k: 2, expected: 8,  approx: false },
          { k: 1, expected: 7,  approx: true }   // the ceiling holds from the other side too
        ]
      }
    ],
    // Phase 2: the exam's framings. dilute-add answers are the volume ADDED (the trap).
    items: [
      { id: "dm-hno3", kind: "dilute-made",   side: "acid", species: "HNO3", exp: 1, startVolMl: 50, endVolL: 5, expected: 3 },   // 2017 Q44's shape
      { id: "da-99",   kind: "dilute-add",    side: "acid", startVolMl: 1,  startPh: 3, targetPh: 5, expected: 99 },              // 2024 Q46's shape
      { id: "da-90",   kind: "dilute-add",    side: "acid", startVolMl: 10, startPh: 2, targetPh: 3, expected: 90 },
      { id: "df-1000", kind: "dilute-factor", side: "acid", startPh: 1, targetPh: 4, expected: 1000 },
      { id: "db-asym", kind: "dilute-by",     side: "acid", startPh: 6, factorK: 3, expected: 7 }                                 // ≈7, never 9
    ]
  },
  {
    id: "ladder",
    label: "pH Ladder",
    tagline: "same concentration, different pH — classify, then order",
    // Ordering puzzles (rung 4). Every puzzle is equal-concentration (0.1 M) and
    // tie-free by construction — ladderSolve throws otherwise. `expected` is the
    // hand-entered correct sequence in the puzzle's own direction, cross-checked
    // by the tests. Difficulty climbs; the one "dec" puzzle is late on purpose.
    puzzles: [
      { id: "L1", direction: "inc", species: ["NaOH", "HCl", "NaCl"],
        expected: ["HCl", "NaCl", "NaOH"] },
      { id: "L2", direction: "inc", species: ["KNO3", "HNO3", "CH3COOH", "KOH"],
        expected: ["HNO3", "CH3COOH", "KNO3", "KOH"] },
      { id: "L3", direction: "inc", species: ["HCOOH", "Ca(OH)2", "H2SO4", "KCl", "HCl"],
        expected: ["H2SO4", "HCl", "HCOOH", "KCl", "Ca(OH)2"] },      // the 2023 skill, our species
      { id: "L4", direction: "inc", species: ["NH3", "NaOH", "CH3COOH", "HNO3", "KNO3"],
        expected: ["HNO3", "CH3COOH", "KNO3", "NH3", "NaOH"] },
      { id: "L5", direction: "dec", species: ["H2O", "NH3", "HCl", "Ba(OH)2", "HCOOH"],
        expected: ["Ba(OH)2", "NH3", "H2O", "HCOOH", "HCl"] }         // highest pH first!
    ]
  }
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));
