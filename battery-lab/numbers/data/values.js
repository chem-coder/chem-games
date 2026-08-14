/*
  Cell Numbers — material values (content only).
  Same numbers the decks teach: average potentials vs Li⁺/Li, practical
  specific capacities (graphite/Li shown at their iconic theoretical values —
  372 mAh/g LiC₆ and 3860 mAh/g — because those are the numbers researchers
  actually carry; flags in the prompt say so).
*/

export const VALUES = {
  cathodes: [
    { abbr: "LCO", name: "lithium cobalt oxide", v: 3.9, q: 155 },
    { abbr: "NMC 811", name: "nickel-rich NMC", v: 3.8, q: 200 },
    { abbr: "NCA", name: "nickel cobalt aluminum oxide", v: 3.8, q: 195 },
    { abbr: "LMO", name: "manganese spinel", v: 4.05, q: 110 },
    { abbr: "LFP", name: "lithium iron phosphate", v: 3.4, q: 160 },
    { abbr: "LNMO", name: "high-voltage spinel", v: 4.7, q: 135 },
  ],
  anodes: [
    { abbr: "graphite", name: "graphite", v: 0.1, q: 372, note: "theoretical, LiC₆" },
    { abbr: "silicon", name: "silicon", v: 0.4, q: 3579, note: "Li₁₅Si₄" },
    { abbr: "LTO", name: "lithium titanate", v: 1.55, q: 175 },
    { abbr: "Li metal", name: "lithium metal", v: 0.0, q: 3860, note: "theoretical" },
    { abbr: "hard carbon", name: "hard carbon", v: 0.2, q: 300 },
  ],
  loadings: [10, 15, 20, 25], // mg/cm², realistic coated-electrode range
  cellCapacities: [2, 2.5, 4, 5, 50, 100], // Ah — phone cells to EV cells
  cRates: [0.2, 0.5, 1, 2, 4],
  npPairs: [
    // [anode areal, cathode areal] mAh/cm² — realistic 1.05–1.3 window
    [3.3, 3.0], [3.6, 3.2], [4.4, 4.0], [3.15, 3.0], [2.75, 2.5], [3.9, 3.0],
  ],
  npTargets: [1.05, 1.1, 1.15, 1.2],
};
