import { GEO_BY_ID } from "./geometry.js";

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
  // ── ions ──
  { f: "OH-", atoms: ["O", "H"], charge: -1 },
  { f: "CN-", atoms: ["C", "N"], charge: -1 },
  { f: "NH4+", atoms: ["N", "H", "H", "H", "H"], charge: 1 },
  { f: "H3O+", atoms: ["O", "H", "H", "H"], charge: 1 },
  { f: "NO2-", atoms: ["N", "O", "O"], charge: -1,
    resNote: "The double bond could sit on either O — both drawings are right, and the real bonds are each 1½." },
  { f: "NO3-", atoms: ["N", "O", "O", "O"], charge: -1,
    resNote: "Any of the three O's could hold the double bond — your version is one of three equal drawings, and every N–O bond is really 1⅓. (The favorite, built by hand.)" },
  { f: "CO3^2-", atoms: ["C", "O", "O", "O"], charge: -2,
    resNote: "Three equivalent drawings again — carbonate is nitrate's story with a kinder central atom." },
  { f: "SO4^2-", atoms: ["S", "O", "O", "O", "O"], charge: -2,
    resNote: "The two doubles can sit on any pair of O's — six equivalent drawings, S allowed its expanded octet." },
];
