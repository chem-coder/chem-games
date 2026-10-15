// Atomic Structure — species pools per tier. Z <= 20 for tiers 1–5 (Dalia's cap).
// Each round: { z, mass, charge }. Tier decks deal 5 distinct species from the pool.
export const DECK_SIZE = 5;

export const ATOMS = [
  { z: 1, mass: 1, charge: 0 }, { z: 2, mass: 4, charge: 0 }, { z: 3, mass: 7, charge: 0 }, { z: 4, mass: 9, charge: 0 },
  { z: 5, mass: 11, charge: 0 }, { z: 6, mass: 12, charge: 0 }, { z: 7, mass: 14, charge: 0 }, { z: 8, mass: 16, charge: 0 },
  { z: 9, mass: 19, charge: 0 }, { z: 10, mass: 20, charge: 0 }, { z: 11, mass: 23, charge: 0 }, { z: 12, mass: 24, charge: 0 },
  { z: 13, mass: 27, charge: 0 }, { z: 14, mass: 28, charge: 0 }, { z: 15, mass: 31, charge: 0 }, { z: 16, mass: 32, charge: 0 },
  { z: 17, mass: 35, charge: 0 }, { z: 18, mass: 40, charge: 0 }, { z: 19, mass: 39, charge: 0 }, { z: 20, mass: 40, charge: 0 }
];

// Common monoatomic ions of the first 20 elements, both signs.
export const IONS = [
  { z: 3, mass: 7, charge: 1 }, { z: 4, mass: 9, charge: 2 }, { z: 7, mass: 14, charge: -3 }, { z: 8, mass: 16, charge: -2 },
  { z: 9, mass: 19, charge: -1 }, { z: 11, mass: 23, charge: 1 }, { z: 12, mass: 24, charge: 2 }, { z: 13, mass: 27, charge: 3 },
  { z: 15, mass: 31, charge: -3 }, { z: 16, mass: 32, charge: -2 }, { z: 17, mass: 35, charge: -1 }, { z: 19, mass: 39, charge: 1 },
  { z: 20, mass: 40, charge: 2 }, { z: 1, mass: 1, charge: -1 }
];

export const TIERS = [
  { id: "build-atom", pool: ATOMS },
  { id: "build-ion", pool: IONS },
  { id: "read-atom", pool: [], soon: true },
  { id: "read-ion", pool: [], soon: true },
  { id: "atom-or-ion", pool: [], soon: true },
  { id: "configuration", pool: [], soon: true }
];
