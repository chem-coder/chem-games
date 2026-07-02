import { test } from "node:test";
import assert from "node:assert/strict";

import {
  toRoman, fromRoman, prefixFor, applyPrefix, gcd, crissCross, deduceCationCharge,
  toUnicodeSub, fromUnicodeSub, toSubHtml
} from "./chem.js";
import { assemble } from "./naming.js";
import { gradeName, gradeFormula, normalizeName, normalizeFormula } from "./matching.js";
import { POLY_ANIONS, MONO_ANIONS, POLY_CATIONS } from "../data/ions.js";

// ── primitives ───────────────────────────────────────────────────────────────
test("toRoman / fromRoman round-trip the oxidation states we name", () => {
  assert.equal(toRoman(1), "I");
  assert.equal(toRoman(4), "IV");
  assert.equal(toRoman(7), "VII");
  assert.equal(fromRoman("vi"), 6);
  assert.equal(fromRoman("nope"), null);
  assert.throws(() => toRoman(0));
});

test("crissCross gives the lowest whole-number ratio", () => {
  assert.deepEqual(crissCross(1, -1), { cation: 1, anion: 1 }); // NaCl
  assert.deepEqual(crissCross(2, -2), { cation: 1, anion: 1 }); // BaS (reduced from 2:2)
  assert.deepEqual(crissCross(3, -2), { cation: 2, anion: 3 }); // Al2O3
  assert.deepEqual(crissCross(2, -3), { cation: 3, anion: 2 }); // Fe3(PO4)2
  assert.equal(gcd(0, 0), 1);
});

test("deduceCationCharge is the reverse criss-cross used for type-II metals", () => {
  assert.equal(deduceCationCharge(-1, 1, 3), 3); // FeBr3 → iron(III)
  assert.equal(deduceCationCharge(-2, 2, 5), 5); // V2O5 → vanadium(V)
  assert.equal(deduceCationCharge(-2, 2, 1), 1); // Au2S → gold(I)
  assert.equal(deduceCationCharge(-1, 1, 6), 6); // Cr(OH)6 → chromium(VI)
  assert.equal(deduceCationCharge(-2, 3, 2), null); // non-integer → ungradable
});

test("applyPrefix drops mono on the first element and elides a/o before oxide", () => {
  assert.deepEqual(applyPrefix(1, "carbon", { first: true }), { canonical: "carbon", variants: [] });
  assert.equal(applyPrefix(1, "oxide").canonical, "monoxide");
  assert.equal(applyPrefix(2, "oxide").canonical, "dioxide");
  const penta = applyPrefix(5, "oxide");
  assert.equal(penta.canonical, "pentoxide");          // Dalia-preferred
  assert.deepEqual(penta.variants, ["pentaoxide"]);    // also accepted (her WS8 key)
  const tetraArsenic = applyPrefix(4, "arsenic", { first: true });
  assert.equal(tetraArsenic.canonical, "tetraarsenic"); // no elision before a non-"oxide" vowel root
});

test("subscript helpers convert between plain / unicode / html", () => {
  assert.equal(toUnicodeSub("H2O"), "H₂O");
  assert.equal(fromUnicodeSub("Fe₂O₃"), "Fe2O3");
  assert.equal(toSubHtml("Fe₂O₃"), "Fe<sub>2</sub>O<sub>3</sub>");
  assert.equal(toSubHtml("(NH4)2Cr2O7"), "(NH<sub>4</sub>)<sub>2</sub>Cr<sub>2</sub>O<sub>7</sub>");
});

// ── the oracle: assemble() must reproduce the worksheet ────────────────────────
// Hand-verified against the 100-question Basics worksheet (and cross-checked vs the WS8 key).
// Double-entry: the formula must equal the worksheet's, and the worksheet's name must be accepted.
const FIXTURES = [
  // I — ionic, fixed cation
  { spec: { kind: "ionic", cation: "Na", anion: "bromide" }, formula: "NaBr", name: "sodium bromide" },
  { spec: { kind: "ionic", cation: "Mg", anion: "bromide" }, formula: "MgBr2", name: "magnesium bromide" },
  { spec: { kind: "ionic", cation: "Mg", anion: "selenide" }, formula: "MgSe", name: "magnesium selenide" },
  { spec: { kind: "ionic", cation: "Na", anion: "nitride" }, formula: "Na3N", name: "sodium nitride" },
  { spec: { kind: "ionic", cation: "Ag", anion: "bromide" }, formula: "AgBr", name: "silver bromide" },
  { spec: { kind: "ionic", cation: "Al", anion: "oxide" }, formula: "Al2O3", name: "aluminum oxide" },

  // II — variable cation, Roman numeral deduced
  { spec: { kind: "ionic", cation: "Fe", cationCharge: 3, anion: "bromide" }, formula: "FeBr3", name: "iron(III) bromide" },
  { spec: { kind: "ionic", cation: "Fe", cationCharge: 2, anion: "bromide" }, formula: "FeBr2", name: "iron(II) bromide" },
  { spec: { kind: "ionic", cation: "V", cationCharge: 5, anion: "oxide" }, formula: "V2O5", name: "vanadium(V) oxide" },
  { spec: { kind: "ionic", cation: "Fe", cationCharge: 3, anion: "oxide" }, formula: "Fe2O3", name: "iron(III) oxide" },
  { spec: { kind: "ionic", cation: "Au", cationCharge: 3, anion: "sulfide" }, formula: "Au2S3", name: "gold(III) sulfide" },
  { spec: { kind: "ionic", cation: "Au", cationCharge: 1, anion: "sulfide" }, formula: "Au2S", name: "gold(I) sulfide" },
  { spec: { kind: "ionic", cation: "Pb", cationCharge: 4, anion: "chloride" }, formula: "PbCl4", name: "lead(IV) chloride" },
  { spec: { kind: "ionic", cation: "V", cationCharge: 5, anion: "nitride" }, formula: "V3N5", name: "vanadium(V) nitride" },
  { spec: { kind: "ionic", cation: "Zn", anion: "phosphide" }, formula: "Zn3P2", name: "zinc phosphide" },

  // mercury(I) — the diatomic Hg₂²⁺ exception (oxidation state I, but balances as a 2+ pair)
  { spec: { kind: "ionic", cation: "Hg", cationCharge: 1, anion: "chloride" }, formula: "Hg2Cl2", name: "mercury(I) chloride" },
  { spec: { kind: "ionic", cation: "Hg", cationCharge: 1, anion: "fluoride" }, formula: "Hg2F2", name: "mercury(I) fluoride" },
  { spec: { kind: "ionic", cation: "Hg", cationCharge: 2, anion: "chloride" }, formula: "HgCl2", name: "mercury(II) chloride" },

  // III/IV — polyatomics (with type II where present)
  { spec: { kind: "ionic", cation: "Fe", cationCharge: 2, anion: "phosphate" }, formula: "Fe3(PO4)2", name: "iron(II) phosphate" },
  { spec: { kind: "ionic", cation: "Fe", cationCharge: 2, anion: "chromate" }, formula: "FeCrO4", name: "iron(II) chromate" },
  { spec: { kind: "ionic", cation: "Mg", anion: "nitrate" }, formula: "Mg(NO3)2", name: "magnesium nitrate" },
  { spec: { kind: "ionic", cation: "ammonium", anion: "sulfate" }, formula: "(NH4)2SO4", name: "ammonium sulfate" },
  { spec: { kind: "ionic", cation: "ammonium", anion: "nitrate" }, formula: "NH4NO3", name: "ammonium nitrate" },
  { spec: { kind: "ionic", cation: "Cu", cationCharge: 1, anion: "carbonate" }, formula: "Cu2CO3", name: "copper(I) carbonate" },
  { spec: { kind: "ionic", cation: "K", anion: "permanganate" }, formula: "KMnO4", name: "potassium permanganate" },
  { spec: { kind: "ionic", cation: "Sc", anion: "oxalate" }, formula: "Sc2(C2O4)3", name: "scandium oxalate" },
  { spec: { kind: "ionic", cation: "Li", anion: "acetate" }, formula: "LiC2H3O2", name: "lithium acetate" },
  { spec: { kind: "ionic", cation: "Cr", cationCharge: 6, anion: "hydroxide" }, formula: "Cr(OH)6", name: "chromium(VI) hydroxide" },
  { spec: { kind: "ionic", cation: "Al", anion: "hydroxide" }, formula: "Al(OH)3", name: "aluminum hydroxide" },
  { spec: { kind: "ionic", cation: "Ba", anion: "cyanide" }, formula: "Ba(CN)2", name: "barium cyanide" },
  { spec: { kind: "ionic", cation: "Na", anion: "bicarbonate" }, formula: "NaHCO3", name: "sodium bicarbonate" },

  // V — oxyanion families (hypo-/-ite/-ate/per-)
  { spec: { kind: "ionic", cation: "Li", anion: "hypochlorite" }, formula: "LiClO", name: "lithium hypochlorite" },
  { spec: { kind: "ionic", cation: "Li", anion: "chlorite" }, formula: "LiClO2", name: "lithium chlorite" },
  { spec: { kind: "ionic", cation: "Li", anion: "chlorate" }, formula: "LiClO3", name: "lithium chlorate" },
  { spec: { kind: "ionic", cation: "Li", anion: "perchlorate" }, formula: "LiClO4", name: "lithium perchlorate" },
  { spec: { kind: "ionic", cation: "Ba", anion: "hypobromite" }, formula: "Ba(BrO)2", name: "barium hypobromite" },
  { spec: { kind: "ionic", cation: "Al", anion: "iodate" }, formula: "Al(IO3)3", name: "aluminum iodate" },

  // VIII — covalent (Greek prefixes; elision; mono- dropped on the first element)
  { spec: { kind: "covalent", parts: [["N", 1], ["Cl", 3]] }, formula: "NCl3", name: "nitrogen trichloride" },
  { spec: { kind: "covalent", parts: [["I", 1], ["Cl", 1]] }, formula: "ICl", name: "iodine monochloride" },
  { spec: { kind: "covalent", parts: [["P", 1], ["Cl", 5]] }, formula: "PCl5", name: "phosphorus pentachloride" },
  { spec: { kind: "covalent", parts: [["C", 1], ["Cl", 4]] }, formula: "CCl4", name: "carbon tetrachloride" },
  { spec: { kind: "covalent", parts: [["C", 1], ["O", 2]] }, formula: "CO2", name: "carbon dioxide" },
  { spec: { kind: "covalent", parts: [["C", 1], ["O", 1]] }, formula: "CO", name: "carbon monoxide" },
  { spec: { kind: "covalent", parts: [["P", 4], ["O", 6]] }, formula: "P4O6", name: "tetraphosphorus hexoxide" },
  { spec: { kind: "covalent", parts: [["N", 2], ["O", 1]] }, formula: "N2O", name: "dinitrogen monoxide" },
  { spec: { kind: "covalent", parts: [["N", 2], ["O", 5]] }, formula: "N2O5", name: "dinitrogen pentoxide" },

  // VI — acids (binary then oxy)
  { spec: { kind: "acid", anion: "chloride" }, formula: "HCl", name: "hydrochloric acid" },
  { spec: { kind: "acid", anion: "fluoride" }, formula: "HF", name: "hydrofluoric acid" },
  { spec: { kind: "acid", anion: "bromide" }, formula: "HBr", name: "hydrobromic acid" },
  { spec: { kind: "acid", anion: "iodide" }, formula: "HI", name: "hydroiodic acid" },
  { spec: { kind: "acid", anion: "cyanide" }, formula: "HCN", name: "hydrocyanic acid" },
  { spec: { kind: "acid", anion: "sulfide" }, formula: "H2S", name: "hydrosulfuric acid" },
  { spec: { kind: "acid", anion: "nitrate" }, formula: "HNO3", name: "nitric acid" },
  { spec: { kind: "acid", anion: "nitrite" }, formula: "HNO2", name: "nitrous acid" },
  { spec: { kind: "acid", anion: "sulfate" }, formula: "H2SO4", name: "sulfuric acid" },
  { spec: { kind: "acid", anion: "sulfite" }, formula: "H2SO3", name: "sulfurous acid" },
  { spec: { kind: "acid", anion: "carbonate" }, formula: "H2CO3", name: "carbonic acid" },
  { spec: { kind: "acid", anion: "phosphate" }, formula: "H3PO4", name: "phosphoric acid" },
  { spec: { kind: "acid", anion: "acetate" }, formula: "HC2H3O2", name: "acetic acid" },
  { spec: { kind: "acid", anion: "oxalate" }, formula: "H2C2O4", name: "oxalic acid" },
  { spec: { kind: "acid", anion: "chlorate" }, formula: "HClO3", name: "chloric acid" },
  { spec: { kind: "acid", anion: "perchlorate" }, formula: "HClO4", name: "perchloric acid" },
  { spec: { kind: "acid", anion: "hypochlorite" }, formula: "HClO", name: "hypochlorous acid" },
  { spec: { kind: "acid", anion: "chlorite" }, formula: "HClO2", name: "chlorous acid" }
];

for (const fx of FIXTURES) {
  test(`assemble: ${fx.formula} ⇄ ${fx.name}`, () => {
    const out = assemble(fx.spec);
    assert.equal(out.formula.canonical, fx.formula, `formula for ${fx.name}`);
    assert.ok(
      out.name.accepted.map(normalizeName).includes(normalizeName(fx.name)),
      `"${fx.name}" should be an accepted name; got [${out.name.accepted.join(" | ")}]`
    );
  });
}

// ── mercury(I): the diatomic Hg₂²⁺ exception ───────────────────────────────────
test("mercury(I) is modeled as the pair Hg₂²⁺ — balances 2+, formula carries Hg₂, numeral stays I", () => {
  const cl = assemble({ kind: "ionic", cation: "Hg", cationCharge: 1, anion: "chloride" });
  assert.equal(cl.formula.canonical, "Hg2Cl2");           // not HgCl
  assert.equal(cl.name.canonical, "mercury(I) chloride");
  assert.equal(assemble({ kind: "ionic", cation: "Hg", cationCharge: 1, anion: "nitrate" }).formula.canonical, "Hg2(NO3)2");
  assert.equal(assemble({ kind: "ionic", cation: "Hg", cationCharge: 1, anion: "phosphate" }).formula.canonical, "(Hg2)3(PO4)2"); // pair parenthesised when >1
  assert.equal(assemble({ kind: "ionic", cation: "Hg", cationCharge: 2, anion: "chloride" }).formula.canonical, "HgCl2"); // Hg(II) unchanged
  assert.equal(gradeFormula(cl, "Hg2Cl2").correct, true);
  assert.equal(gradeFormula(cl, "HgCl").correct, false);  // the naive monatomic answer is wrong
});

// ── the accepted-set payoff: multi-spelling ions grade correctly ───────────────
test("acetate is accepted in all three formula spellings (the thing regex couldn't do)", () => {
  const liAcetate = assemble({ kind: "ionic", cation: "Li", anion: "acetate" });
  for (const f of ["LiC2H3O2", "LiCH3COO", "LiCH3CO2", "LiC₂H₃O₂"]) {
    assert.equal(gradeFormula(liAcetate, f).correct, true, `${f} should grade correct`);
  }
  assert.equal(gradeFormula(liAcetate, "LiC3H2O2").correct, false);
});

test("bicarbonate / hydrogen carbonate are interchangeable, and the other is revealed", () => {
  const c = assemble({ kind: "ionic", cation: "Na", anion: "bicarbonate" });
  const viaHydrogen = gradeName(c, "sodium hydrogen carbonate");
  assert.equal(viaHydrogen.correct, true);
  assert.ok(viaHydrogen.alsoAccepted.some((n) => /bicarbonate/.test(n)), "should reveal the bicarbonate form");
  assert.equal(gradeName(c, "sodium bicarbonate").correct, true);
});

test("formula grading ignores a trailing charge sign without eating a subscript digit", () => {
  assert.equal(normalizeFormula("NH4+"), "NH4");   // ammonium written with its charge
  assert.equal(normalizeFormula("NO3-"), "NO3");   // the trap: keep the 3, drop only the sign
  assert.equal(normalizeFormula("OH−"), "OH");     // true-minus sign
  assert.equal(normalizeFormula("SO4²⁻"), "SO4");  // unicode superscript charge
  assert.equal(normalizeFormula("Cr2O7"), "Cr2O7"); // no sign → untouched
});

test("name grading is forgiving about Roman-numeral spacing and case", () => {
  const feBr3 = assemble({ kind: "ionic", cation: "Fe", cationCharge: 3, anion: "bromide" });
  assert.equal(gradeName(feBr3, "iron (III) bromide").correct, true);
  assert.equal(gradeName(feBr3, "IRON(iii) Bromide").correct, true);
  assert.equal(gradeName(feBr3, "iron(II) bromide").correct, false); // wrong charge stays wrong
});

test("both vowel-elision forms of a covalent oxide are accepted", () => {
  const p4o6 = assemble({ kind: "covalent", parts: [["P", 4], ["O", 6]] });
  assert.equal(gradeName(p4o6, "tetraphosphorus hexoxide").correct, true);
  assert.equal(gradeName(p4o6, "tetraphosphorus hexaoxide").correct, true);
  assert.equal(p4o6.name.canonical, "tetraphosphorus hexoxide"); // preferred form is the elided one
});

// ── content integrity (mirrors the sorter's "never ship a wrong fact" guard) ───
test("every anion record is well-formed", () => {
  for (const a of [...MONO_ANIONS, ...POLY_ANIONS]) {
    assert.ok(a.names?.length, `${a.id} has at least one name`);
    assert.ok(a.charge < 0, `${a.id} has a negative charge`);
  }
  for (const a of POLY_ANIONS) assert.ok(a.formulas?.length, `${a.id} has at least one formula`);
  for (const c of POLY_CATIONS) assert.ok(c.charge > 0 && c.formulas?.length && c.names?.length);
});

test("normalizers are stable", () => {
  assert.equal(normalizeName("  Iron (III)  Bromide. "), "iron(iii) bromide");
  assert.equal(normalizeFormula("Fe₂O₃ "), "Fe2O3");
});
