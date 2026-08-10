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
  }
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));
