// Generator for shared/data/periodic-elements.json — the data behind the full-page
// "oxidation-state landscape" reference. Source of element + oxidation-state lists is the existing
// chem-nomenclature/databases/elements.json (all 118, vetted). This script adds the two layers it
// lacks: (1) a COMMONNESS TIER per state — primary / common / rare — and (2) periodic-table layout
// coordinates (period, group, and f-block placement for lanthanides/actinides).
//
// HONEST NOTE ON TIERS: "how common an oxidation state is" is curated judgment, not a measured
// natural-abundance number. Tiers for the teaching-core elements (Z 1–86, main groups + transition
// metals) are solid textbook chemistry. The f-block and superheavy (Z > 86) tiers are best-effort —
// each is given one defensible `primary`; tweak the maps below and re-run to regenerate.
//
// Run: node tools/build-periodic-elements.mjs   (writes shared/data/periodic-elements.json)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = JSON.parse(readFileSync(join(root, "chem-nomenclature/databases/elements.json"), "utf8"));

// The single most characteristic oxidation state per element (rendered darkest).
const PRIMARY = {
  H: 1, He: 0, Li: 1, Be: 2, B: 3, C: 4, N: -3, O: -2, F: -1, Ne: 0,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: -2, Cl: -1, Ar: 0,
  K: 1, Ca: 2, Sc: 3, Ti: 4, V: 5, Cr: 3, Mn: 2, Fe: 3, Co: 2, Ni: 2, Cu: 2, Zn: 2,
  Ga: 3, Ge: 4, As: 3, Se: -2, Br: -1, Kr: 0,
  Rb: 1, Sr: 2, Y: 3, Zr: 4, Nb: 5, Mo: 6, Tc: 7, Ru: 3, Rh: 3, Pd: 2, Ag: 1, Cd: 2,
  In: 3, Sn: 4, Sb: 3, Te: 4, I: -1, Xe: 0,
  Cs: 1, Ba: 2, La: 3, Ce: 3, Pr: 3, Nd: 3, Pm: 3, Sm: 3, Eu: 3, Gd: 3, Tb: 3, Dy: 3,
  Ho: 3, Er: 3, Tm: 3, Yb: 3, Lu: 3, Hf: 4, Ta: 5, W: 6, Re: 7, Os: 4, Ir: 3, Pt: 2,
  Au: 3, Hg: 2, Tl: 1, Pb: 2, Bi: 3, Po: 4, At: -1, Rn: 0,
  Fr: 1, Ra: 2, Ac: 3, Th: 4, Pa: 5, U: 6, Np: 5, Pu: 4, Am: 3, Cm: 3, Bk: 3, Cf: 3,
  Es: 3, Fm: 3, Md: 3, No: 2, Lr: 3,
  Rf: 4, Db: 5, Sg: 6, Bh: 7, Hs: 8, Mt: 3, Ds: 4, Rg: 3, Cn: 2, Nh: 1, Fl: 2, Mc: 1, Lv: 2, Ts: -1, Og: 0
};

// Additional regularly-encountered states (rendered mid-tone). Everything else falls to "rare".
// Calibrated 2026-06-23 against Wikipedia's "List of oxidation states of the elements" (bold = common).
// Corrections applied where WP and chemistry agree my first pass was too generous/too tight:
//   added: S+2, Br+3, I+3, At+1   ·   dropped to rare: O−1, Ti+2, Cr+2, Ni+3, As−3, Nb+3, Bi+5, U+3, Te−2
// Deliberately kept BROADER than WP's strict bold (textbook-common despite WP not bolding):
//   V[2,3,4] (the classic redox series), Cu+1, Os+8 (OsO₄), Au+1, Sm+2/Yb+2 (SmI₂ etc.), Np/Pu extra states.
// Two primaries kept against WP on purpose: Se −2 (group-16 pattern, like O/S) and No +2 (the stable
//   nobelium ion — a real f-block anomaly WP lists as +3).
const COMMON = {
  H: [-1], C: [-4, 2], N: [5, 3], Si: [-4], P: [-3, 3], S: [2, 4, 6], Cl: [1, 3, 5, 7],
  Ti: [3], V: [2, 3, 4], Cr: [6], Mn: [4, 7], Fe: [2], Co: [3], Cu: [1],
  Ge: [2], As: [5], Se: [4, 6], Br: [1, 3, 5],
  Mo: [4], Tc: [4], Ru: [4], Pd: [4], Sn: [2], Sb: [5], Te: [2, 6], I: [1, 3, 5, 7],
  Ce: [4], Sm: [2], Eu: [2], Yb: [2],
  W: [4], Re: [4], Os: [8], Ir: [4], Pt: [4], Au: [1], Hg: [1], Tl: [3], Pb: [4], Po: [2], At: [1],
  U: [4], Np: [4, 6], Pu: [3, 6], No: [3]
};

function place(Z) {
  const m = (period, group) => ({ period, group, fBlock: null, fIndex: null });
  if (Z === 1) return m(1, 1);
  if (Z === 2) return m(1, 18);
  if (Z <= 10) return m(2, Z <= 4 ? Z - 2 : Z + 8);
  if (Z <= 18) return m(3, Z <= 12 ? Z - 10 : Z);
  if (Z <= 36) return m(4, Z - 18);
  if (Z <= 54) return m(5, Z - 36);
  if (Z === 55) return m(6, 1);
  if (Z === 56) return m(6, 2);
  if (Z === 57) return m(6, 3);
  if (Z <= 71) return { period: 6, group: null, fBlock: "lanthanide", fIndex: Z - 58 };
  if (Z <= 86) return m(6, Z - 68);
  if (Z === 87) return m(7, 1);
  if (Z === 88) return m(7, 2);
  if (Z === 89) return m(7, 3);
  if (Z <= 103) return { period: 7, group: null, fBlock: "actinide", fIndex: Z - 90 };
  return m(7, Z - 100);
}

function tierStates(sym, raw) {
  // Mt/Ds/Rg carry "unknown" in the source — honest gap, render with no states.
  const oxList = Array.isArray(raw) ? raw : [];
  if (!oxList.length) return [];
  let primary = PRIMARY[sym];
  if (!oxList.includes(primary)) primary = oxList[0]; // fallback so every element has one primary
  const common = COMMON[sym] || [];
  return oxList
    .slice()
    .sort((a, b) => a - b)
    .map((ox) => ({ ox, tier: ox === primary ? "primary" : common.includes(ox) ? "common" : "rare" }));
}

const out = src.map((e) => {
  const Z = e["atomic number"];
  const pos = place(Z);
  return {
    symbol: e.symbol,
    name: e.name,
    Z,
    mass: e["atomic mass"],
    category: e.subtype,
    period: pos.period,
    group: pos.group,
    fBlock: pos.fBlock,
    fIndex: pos.fIndex,
    states: tierStates(e.symbol, e["oxidation states"])
  };
});

// guard: every element with states has exactly one primary
for (const e of out) {
  if (e.states.length && e.states.filter((s) => s.tier === "primary").length !== 1) {
    throw new Error(`${e.symbol}: expected exactly one primary state`);
  }
}

writeFileSync(join(root, "shared/data/periodic-elements.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote shared/data/periodic-elements.json — ${out.length} elements`);
