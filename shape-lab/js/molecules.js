// Shape Lab — the quiz molecule bank.
// Each entry: formula (fmtFormula notation), central atom, bonded-atom count,
// lone pairs ON THE CENTER, and the geometry id it resolves to. The quiz
// generates the reasoning line from the geometry catalog, so chemistry lives
// in exactly one place per molecule.

export const MOLECULES = [
  // 2 regions
  { f: "CO2", center: "C", bonds: 2, lps: 0, geo: "linear-2" },
  { f: "HCN", center: "C", bonds: 2, lps: 0, geo: "linear-2" },
  { f: "BeCl2", center: "Be", bonds: 2, lps: 0, geo: "linear-2" },
  // 3 regions
  { f: "BF3", center: "B", bonds: 3, lps: 0, geo: "trigonal-planar" },
  { f: "SO3", center: "S", bonds: 3, lps: 0, geo: "trigonal-planar" },
  { f: "NO3-", center: "N", bonds: 3, lps: 0, geo: "trigonal-planar" },
  { f: "CO3^2-", center: "C", bonds: 3, lps: 0, geo: "trigonal-planar" },
  { f: "SO2", center: "S", bonds: 2, lps: 1, geo: "bent-3" },
  { f: "O3", center: "O", bonds: 2, lps: 1, geo: "bent-3" },
  { f: "NO2-", center: "N", bonds: 2, lps: 1, geo: "bent-3" },
  // 4 regions
  { f: "CH4", center: "C", bonds: 4, lps: 0, geo: "tetrahedral" },
  { f: "CCl4", center: "C", bonds: 4, lps: 0, geo: "tetrahedral" },
  { f: "NH4+", center: "N", bonds: 4, lps: 0, geo: "tetrahedral" },
  { f: "SO4^2-", center: "S", bonds: 4, lps: 0, geo: "tetrahedral" },
  { f: "PO4^3-", center: "P", bonds: 4, lps: 0, geo: "tetrahedral" },
  { f: "NH3", center: "N", bonds: 3, lps: 1, geo: "trigonal-pyramidal" },
  { f: "PCl3", center: "P", bonds: 3, lps: 1, geo: "trigonal-pyramidal" },
  { f: "H3O+", center: "O", bonds: 3, lps: 1, geo: "trigonal-pyramidal" },
  { f: "H2O", center: "O", bonds: 2, lps: 2, geo: "bent-4" },
  { f: "H2S", center: "S", bonds: 2, lps: 2, geo: "bent-4" },
  { f: "OF2", center: "O", bonds: 2, lps: 2, geo: "bent-4" },
  { f: "SCl2", center: "S", bonds: 2, lps: 2, geo: "bent-4" },
  // 5 regions
  { f: "PF5", center: "P", bonds: 5, lps: 0, geo: "trigonal-bipyramidal" },
  { f: "PCl5", center: "P", bonds: 5, lps: 0, geo: "trigonal-bipyramidal" },
  { f: "SF4", center: "S", bonds: 4, lps: 1, geo: "seesaw" },
  { f: "XeO2F2", center: "Xe", bonds: 4, lps: 1, geo: "seesaw" },
  { f: "ClF3", center: "Cl", bonds: 3, lps: 2, geo: "t-shape" },
  { f: "BrF3", center: "Br", bonds: 3, lps: 2, geo: "t-shape" },
  { f: "XeF2", center: "Xe", bonds: 2, lps: 3, geo: "linear-5" },
  { f: "I3-", center: "I", bonds: 2, lps: 3, geo: "linear-5" },
  // 6 regions
  { f: "SF6", center: "S", bonds: 6, lps: 0, geo: "octahedral" },
  { f: "BrF5", center: "Br", bonds: 5, lps: 1, geo: "square-pyramidal" },
  { f: "IF5", center: "I", bonds: 5, lps: 1, geo: "square-pyramidal" },
  { f: "XeF4", center: "Xe", bonds: 4, lps: 2, geo: "square-planar" },
];

// The Model Kit's v1 build bank — neutral molecules only, where every bond takes
// exactly one electron from each side and nobody has to hand an electron over.
// Ions (nitrate!) join once the Kit learns electron transfer; the charge question
// is asked from day one so the mechanic is already in the student's hands.
export const BUILD_BANK = [
  { f: "H2O", atoms: ["O", "H", "H"], charge: 0 },
  { f: "CH4", atoms: ["C", "H", "H", "H", "H"], charge: 0 },
  { f: "NH3", atoms: ["N", "H", "H", "H"], charge: 0 },
  { f: "HF", atoms: ["F", "H"], charge: 0 },
  { f: "CO2", atoms: ["C", "O", "O"], charge: 0 },
  { f: "HCN", atoms: ["C", "H", "N"], charge: 0 },
  { f: "BF3", atoms: ["B", "F", "F", "F"], charge: 0 },
  { f: "PCl3", atoms: ["P", "Cl", "Cl", "Cl"], charge: 0 },
  { f: "OF2", atoms: ["O", "F", "F"], charge: 0 },
  { f: "H2S", atoms: ["S", "H", "H"], charge: 0 },
  { f: "N2", atoms: ["N", "N"], charge: 0 },
  { f: "BeF2", atoms: ["Be", "F", "F"], charge: 0 },
];
