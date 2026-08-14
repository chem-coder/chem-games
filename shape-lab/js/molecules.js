import { GEO_BY_ID } from "./geometry.js";

// Shape Lab — the quiz molecule bank.
// Each entry: formula (fmtFormula notation), central atom, bonded-atom count,
// lone pairs ON THE CENTER, and the geometry id it resolves to. The quiz
// generates the reasoning line from the geometry catalog, so chemistry lives
// in exactly one place per molecule.

export const MOLECULES = [
  // 2 regions
  { f: "CO2", center: "C", bonds: 2, lps: 0, geo: "linear-2" , st: { cl: 0, parts: [["O",2,4,2]] } },
  { f: "HCN", center: "C", bonds: 2, lps: 0, geo: "linear-2" , st: { cl: 0, parts: [["H",1,0,1],["N",3,2,1]] } },
  { f: "BeCl2", center: "Be", bonds: 2, lps: 0, geo: "linear-2" , st: { cl: 0, parts: [["Cl",1,6,2]] } },
  // 3 regions
  { f: "BF3", center: "B", bonds: 3, lps: 0, geo: "trigonal-planar" , st: { cl: 0, parts: [["F",1,6,3]] } },
  { f: "SO3", center: "S", bonds: 3, lps: 0, geo: "trigonal-planar" , st: { cl: 0, parts: [["O",2,4,3]] } },
  { f: "NO3-", center: "N", bonds: 3, lps: 0, geo: "trigonal-planar" , st: { cl: 0, parts: [["O",2,4,1],["O",1,6,2]] }, charge: -1 },
  { f: "CO3^2-", center: "C", bonds: 3, lps: 0, geo: "trigonal-planar" , st: { cl: 0, parts: [["O",2,4,1],["O",1,6,2]] }, charge: -2 },
  { f: "SO2", center: "S", bonds: 2, lps: 1, geo: "bent-3" , st: { cl: 2, parts: [["O",2,4,2]] } },
  { f: "O3", center: "O", bonds: 2, lps: 1, geo: "bent-3" , st: { cl: 2, parts: [["O",2,4,1],["O",1,6,1]] } },
  { f: "NO2-", center: "N", bonds: 2, lps: 1, geo: "bent-3" , st: { cl: 2, parts: [["O",2,4,1],["O",1,6,1]] }, charge: -1 },
  // 4 regions
  { f: "CH4", center: "C", bonds: 4, lps: 0, geo: "tetrahedral" , st: { cl: 0, parts: [["H",1,0,4]] } },
  { f: "CCl4", center: "C", bonds: 4, lps: 0, geo: "tetrahedral" , st: { cl: 0, parts: [["Cl",1,6,4]] } },
  { f: "NH4+", center: "N", bonds: 4, lps: 0, geo: "tetrahedral" , st: { cl: 0, parts: [["H",1,0,4]] }, charge: 1 },
  { f: "SO4^2-", center: "S", bonds: 4, lps: 0, geo: "tetrahedral" , st: { cl: 0, parts: [["O",2,4,2],["O",1,6,2]] }, charge: -2 },
  { f: "PO4^3-", center: "P", bonds: 4, lps: 0, geo: "tetrahedral" , st: { cl: 0, parts: [["O",2,4,1],["O",1,6,3]] }, charge: -3 },
  { f: "NH3", center: "N", bonds: 3, lps: 1, geo: "trigonal-pyramidal" , st: { cl: 2, parts: [["H",1,0,3]] } },
  { f: "PCl3", center: "P", bonds: 3, lps: 1, geo: "trigonal-pyramidal" , st: { cl: 2, parts: [["Cl",1,6,3]] } },
  { f: "H3O+", center: "O", bonds: 3, lps: 1, geo: "trigonal-pyramidal" , st: { cl: 2, parts: [["H",1,0,3]] }, charge: 1 },
  { f: "H2O", center: "O", bonds: 2, lps: 2, geo: "bent-4" , st: { cl: 4, parts: [["H",1,0,2]] } },
  { f: "H2S", center: "S", bonds: 2, lps: 2, geo: "bent-4" , st: { cl: 4, parts: [["H",1,0,2]] } },
  { f: "OF2", center: "O", bonds: 2, lps: 2, geo: "bent-4" , st: { cl: 4, parts: [["F",1,6,2]] } },
  { f: "SCl2", center: "S", bonds: 2, lps: 2, geo: "bent-4" , st: { cl: 4, parts: [["Cl",1,6,2]] } },
  // 5 regions
  { f: "PF5", center: "P", bonds: 5, lps: 0, geo: "trigonal-bipyramidal" , st: { cl: 0, parts: [["F",1,6,5]] } },
  { f: "PCl5", center: "P", bonds: 5, lps: 0, geo: "trigonal-bipyramidal" , st: { cl: 0, parts: [["Cl",1,6,5]] } },
  { f: "SF4", center: "S", bonds: 4, lps: 1, geo: "seesaw" , st: { cl: 2, parts: [["F",1,6,4]] } },
  { f: "XeO2F2", center: "Xe", bonds: 4, lps: 1, geo: "seesaw" , st: { cl: 2, parts: [["O",2,4,2],["F",1,6,2]] } },
  { f: "ClF3", center: "Cl", bonds: 3, lps: 2, geo: "t-shape" , st: { cl: 4, parts: [["F",1,6,3]] } },
  { f: "BrF3", center: "Br", bonds: 3, lps: 2, geo: "t-shape" , st: { cl: 4, parts: [["F",1,6,3]] } },
  { f: "XeF2", center: "Xe", bonds: 2, lps: 3, geo: "linear-5" , st: { cl: 6, parts: [["F",1,6,2]] } },
  { f: "I3-", center: "I", bonds: 2, lps: 3, geo: "linear-5" , st: { cl: 6, parts: [["I",1,6,2]] }, charge: -1 },
  // 6 regions
  { f: "SF6", center: "S", bonds: 6, lps: 0, geo: "octahedral" , st: { cl: 0, parts: [["F",1,6,6]] } },
  { f: "BrF5", center: "Br", bonds: 5, lps: 1, geo: "square-pyramidal" , st: { cl: 2, parts: [["F",1,6,5]] } },
  { f: "IF5", center: "I", bonds: 5, lps: 1, geo: "square-pyramidal" , st: { cl: 2, parts: [["F",1,6,5]] } },
  { f: "XeF4", center: "Xe", bonds: 4, lps: 2, geo: "square-planar" , st: { cl: 4, parts: [["F",1,6,4]] } },
  // ── round two: more of every shape, for replay value ──
  { f: "BeH2", center: "Be", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["H",1,0,2]] } },
  { f: "CS2", center: "C", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["S",2,4,2]] } },
  { f: "BCl3", center: "B", bonds: 3, lps: 0, geo: "trigonal-planar", st: { cl: 0, parts: [["Cl",1,6,3]] } },
  { f: "SiH4", center: "Si", bonds: 4, lps: 0, geo: "tetrahedral", st: { cl: 0, parts: [["H",1,0,4]] } },
  { f: "SiF4", center: "Si", bonds: 4, lps: 0, geo: "tetrahedral", st: { cl: 0, parts: [["F",1,6,4]] } },
  { f: "SiCl4", center: "Si", bonds: 4, lps: 0, geo: "tetrahedral", st: { cl: 0, parts: [["Cl",1,6,4]] } },
  { f: "ClO4-", center: "Cl", bonds: 4, lps: 0, geo: "tetrahedral", st: { cl: 0, parts: [["O",2,4,3],["O",1,6,1]] }, charge: -1 },
  { f: "PH3", center: "P", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["H",1,0,3]] } },
  { f: "NF3", center: "N", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["F",1,6,3]] } },
  { f: "PF3", center: "P", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["F",1,6,3]] } },
  { f: "PBr3", center: "P", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["Br",1,6,3]] } },
  { f: "SO3^2-", center: "S", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["O",2,4,1],["O",1,6,2]] }, charge: -2 },
  { f: "ClO3-", center: "Cl", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["O",2,4,2],["O",1,6,1]] }, charge: -1 },
  { f: "XeO3", center: "Xe", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["O",2,4,3]] } },
  { f: "ICl2-", center: "I", bonds: 2, lps: 3, geo: "linear-5", st: { cl: 6, parts: [["Cl",1,6,2]] }, charge: -1 },
  { f: "IF4-", center: "I", bonds: 4, lps: 2, geo: "square-planar", st: { cl: 4, parts: [["F",1,6,4]] }, charge: -1 },
  // ── round three: the OU E3 advanced band (documentation/OU_MINING.md, unit 5) ──
  { f: "COS", center: "C", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["O",2,4,1],["S",2,4,1]] } },
  { f: "ClCN", center: "C", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["Cl",1,6,1],["N",3,2,1]] } },
  { f: "N3-", center: "N", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["N",2,4,2]] }, charge: -1 },
  { f: "CNO-", center: "N", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["C",3,2,1],["O",1,6,1]] }, charge: -1 },
  { f: "NO2+", center: "N", bonds: 2, lps: 0, geo: "linear-2", st: { cl: 0, parts: [["O",2,4,2]] }, charge: 1 },
  { f: "COCl2", center: "C", bonds: 3, lps: 0, geo: "trigonal-planar", st: { cl: 0, parts: [["O",2,4,1],["Cl",1,6,2]] } },
  { f: "HCO2-", center: "C", bonds: 3, lps: 0, geo: "trigonal-planar", st: { cl: 0, parts: [["O",2,4,1],["O",1,6,1],["H",1,0,1]] }, charge: -1 },
  { f: "BF2-", center: "B", bonds: 2, lps: 1, geo: "bent-3", st: { cl: 2, parts: [["F",1,6,2]] }, charge: -1 },
  { f: "ClO2-", center: "Cl", bonds: 2, lps: 2, geo: "bent-4", st: { cl: 4, parts: [["O",2,4,1],["O",1,6,1]] }, charge: -1 },
  { f: "POCl3", center: "P", bonds: 4, lps: 0, geo: "tetrahedral", st: { cl: 0, parts: [["O",2,4,1],["Cl",1,6,3]] } },
  { f: "AsH3", center: "As", bonds: 3, lps: 1, geo: "trigonal-pyramidal", st: { cl: 2, parts: [["H",1,0,3]] } },
  { f: "AsF5", center: "As", bonds: 5, lps: 0, geo: "trigonal-bipyramidal", st: { cl: 0, parts: [["F",1,6,5]] } },
  { f: "SbF5", center: "Sb", bonds: 5, lps: 0, geo: "trigonal-bipyramidal", st: { cl: 0, parts: [["F",1,6,5]] } },
  { f: "SCl3F", center: "S", bonds: 4, lps: 1, geo: "seesaw", st: { cl: 2, parts: [["Cl",1,6,3],["F",1,6,1]] } },
  { f: "SeF4", center: "Se", bonds: 4, lps: 1, geo: "seesaw", st: { cl: 2, parts: [["F",1,6,4]] } },
  { f: "IF3", center: "I", bonds: 3, lps: 2, geo: "t-shape", st: { cl: 4, parts: [["F",1,6,3]] } },
  { f: "BrF2-", center: "Br", bonds: 2, lps: 3, geo: "linear-5", st: { cl: 6, parts: [["F",1,6,2]] }, charge: -1 },
  { f: "SF5-", center: "S", bonds: 5, lps: 1, geo: "square-pyramidal", st: { cl: 2, parts: [["F",1,6,5]] }, charge: -1 },
  { f: "ICl4-", center: "I", bonds: 4, lps: 2, geo: "square-planar", st: { cl: 4, parts: [["Cl",1,6,4]] }, charge: -1 },
];

// ── polarity ──
// Pauling electronegativities. Partial charges and the net dipole are COMPUTED
// from EN differences and the real 3D pose — polar/nonpolar emerges from the
// same physics the student is learning, not from a hand-typed answer key.
export const EN = {
  H: 2.2, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98,
  P: 2.19, S: 2.58, Cl: 3.16, Br: 2.96, I: 2.66, Xe: 2.6,
};
// A lone pair acts as a small negative region of its own — smaller than a full
// EN-unit bond dipole (0.8 wrongly cancels SO2's bond dipoles; 0.4 gets every
// molecule in the bank right, SO2's dipole correctly pointing toward the oxygens).
const LP_PULL = 0.4;

const HF_GEO = {
  coords: [[1, 0, 0]],
  lpCoords: [[-0.6, 0.7, 0], [-0.9, 0, 0], [-0.6, -0.7, 0]],
};

const POLARITY_SPECS = [
  { f: "H2O", geo: "bent-4", center: "O", outer: ["H", "H"],
    note: "Bent leaves both O–H dipoles pointing the same way — and the lone pairs pile onto the negative end. Water's whole personality." },
  { f: "CO2", geo: "linear-2", center: "C", outer: ["O", "O"],
    note: "Two strongly polar C=O bonds, perfectly opposed. They cancel to exactly zero — shape beats bond polarity." },
  { f: "NH3", geo: "trigonal-pyramidal", center: "N", outer: ["H", "H", "H"],
    note: "Three N–H dipoles lean toward N, and the lone pair caps the negative end. That cap is where the proton lands when ammonia acts as a base." },
  { f: "CH4", geo: "tetrahedral", center: "C", outer: ["H", "H", "H", "H"],
    note: "Four identical bonds in perfect tetrahedral symmetry — nothing to add up." },
  { f: "CH3Cl", geo: "tetrahedral", center: "C", outer: ["Cl", "H", "H", "H"],
    note: "Swap a single H for Cl and the tetrahedron's cancellation breaks. One substitution, instant dipole." },
  { f: "CH2Cl2", geo: "tetrahedral", center: "C", outer: ["Cl", "Cl", "H", "H"],
    note: "A real IMAT favorite: two Cl on one side, two H on the other — the dipoles add instead of cancelling." },
  { f: "CCl4", geo: "tetrahedral", center: "C", outer: ["Cl", "Cl", "Cl", "Cl"],
    note: "Four strong C–Cl dipoles — and perfect symmetry cancels every one of them. Polar bonds ≠ polar molecule." },
  { f: "BF3", geo: "trigonal-planar", center: "B", outer: ["F", "F", "F"],
    note: "Three of the most polar bonds chemistry can offer, at 120° in a flat triangle: net zero." },
  { f: "SO2", geo: "bent-3", center: "S", outer: ["O", "O"],
    note: "Bent again — the two S=O dipoles cooperate instead of cancelling. Compare with CO₂ and you have the whole lesson." },
  { f: "HF", custom: HF_GEO, center: "F", outer: ["H"],
    note: "The biggest EN gap on the syllabus. One bond, one dipole, nothing to cancel it — and hydrogen bonding follows." },
  { f: "SF4", geo: "seesaw", center: "S", outer: ["F", "F", "F", "F"],
    note: "The lone pair takes an equatorial seat and breaks the bipyramid's balance — see-saws are always polar." },
  { f: "XeF4", geo: "square-planar", center: "Xe", outer: ["F", "F", "F", "F"],
    note: "The exam trap: four polar bonds AND two lone pairs — and every one of them has an exact opposite. Flat, square, nonpolar." },
];

function buildPolarityEntry(spec) {
  const base = spec.custom || GEO_BY_ID[spec.geo];
  const geo = { coords: base.coords, lpCoords: base.lpCoords, demo: { center: spec.center, outer: spec.outer } };
  // Per-atom partial charges from EN differences (sign is what the clouds show).
  const outerQ = spec.outer.map((el) => EN[el] - EN[spec.center]);
  const centerQ = -outerQ.reduce((s, q) => s + q, 0) / Math.max(1, spec.outer.length);
  // Net dipole: bond contributions point toward the more electronegative atom;
  // each lone pair pulls the negative end toward itself.
  const mu = [0, 0, 0];
  geo.coords.forEach((v, i) => { for (let k = 0; k < 3; k++) mu[k] += v[k] * outerQ[i]; });
  geo.lpCoords.forEach((v) => { for (let k = 0; k < 3; k++) mu[k] += v[k] * LP_PULL; });
  const muLen = Math.hypot(...mu);
  const polar = muLen > 0.15;
  return {
    f: spec.f, geo, note: spec.note, polar,
    clouds: { center: centerQ, outer: outerQ, lp: LP_PULL },
    dipole: polar ? mu.map((x) => x / muLen) : null,
  };
}

export const POLARITY_BANK = POLARITY_SPECS.map(buildPolarityEntry);

// The Model Kit's build bank. Neutral molecules bond by strict dot-pairing;
// ions add the electron tray (charge grants or demands electrons) and
// atom-to-atom hand-overs — which is exactly where formal charge comes from:
// the donor ends up +1, the receiver −1. resNote appears on success when the
// built ion has equivalent resonance forms.
export const BUILD_BANK = [
  { f: "H2O", atoms: ["O", "H", "H"], charge: 0, geo: "bent-4" },
  { f: "CH4", atoms: ["C", "H", "H", "H", "H"], charge: 0, geo: "tetrahedral" },
  { f: "NH3", atoms: ["N", "H", "H", "H"], charge: 0, geo: "trigonal-pyramidal" },
  { f: "HF", atoms: ["F", "H"], charge: 0 },
  { f: "CO2", atoms: ["C", "O", "O"], charge: 0, geo: "linear-2" },
  { f: "HCN", atoms: ["C", "H", "N"], charge: 0, geo: "linear-2" },
  { f: "BF3", atoms: ["B", "F", "F", "F"], charge: 0, geo: "trigonal-planar" },
  { f: "PCl3", atoms: ["P", "Cl", "Cl", "Cl"], charge: 0, geo: "trigonal-pyramidal" },
  { f: "OF2", atoms: ["O", "F", "F"], charge: 0, geo: "bent-4" },
  { f: "H2S", atoms: ["S", "H", "H"], charge: 0, geo: "bent-4" },
  { f: "N2", atoms: ["N", "N"], charge: 0 },
  { f: "BeF2", atoms: ["Be", "F", "F"], charge: 0, geo: "linear-2" },
  // ── ions ──
  { f: "OH-", atoms: ["O", "H"], charge: -1 },
  { f: "CN-", atoms: ["C", "N"], charge: -1 },
  { f: "NH4+", atoms: ["N", "H", "H", "H", "H"], charge: 1, geo: "tetrahedral" },
  { f: "H3O+", atoms: ["O", "H", "H", "H"], charge: 1, geo: "trigonal-pyramidal" },
  { f: "NO2-", atoms: ["N", "O", "O"], charge: -1, geo: "bent-3",
    resNote: "The double bond could sit on either O — both drawings are right, and the real bonds are each 1½." },
  { f: "NO3-", atoms: ["N", "O", "O", "O"], charge: -1, geo: "trigonal-planar",
    resNote: "Any of the three O's could hold the double bond — your version is one of three equal drawings, and every N–O bond is really 1⅓. (The favorite, built by hand.)" },
  { f: "CO3^2-", atoms: ["C", "O", "O", "O"], charge: -2, geo: "trigonal-planar",
    resNote: "Three equivalent drawings again — carbonate is nitrate's story with a kinder central atom." },
  { f: "SO4^2-", atoms: ["S", "O", "O", "O", "O"], charge: -2, geo: "tetrahedral",
    resNote: "The two doubles can sit on any pair of O's — six equivalent drawings, S allowed its expanded octet." },
];
