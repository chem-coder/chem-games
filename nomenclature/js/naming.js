// Nomenclature assembly engine. Pure, no DOM. ESM for node --test.
//
// Content is authored as compact "specs" (what ions/elements a compound is made of); this engine
// derives EVERYTHING else — the formula, the canonical name, and the full set of accepted spellings
// — by composing the chem primitives with the ion data. Because the formula and the name come from
// one source, the game can show a formula and grade a name (or vice-versa) without ever parsing a
// string it didn't generate. The same derivation, run over the transcribed answer key, is the test
// oracle (naming.test.js).
//
// Spec shapes:
//   { kind: "ionic",   cation: "Fe", cationCharge: 3, anion: "bromide" }   // charge only if variable
//   { kind: "ionic",   cation: "ammonium", anion: "sulfate" }              // polyatomic cation
//   { kind: "covalent", parts: [["P", 4], ["O", 6]] }
//   { kind: "acid",    anion: "nitrate" }                                  // oxy- or binary by suffix

import { toRoman, crissCross, applyPrefix, toUnicodeSub } from "./chem.js";
import {
  ELEMENTS, CATION_BY_SYMBOL, POLY_CATION_BY_ID, MONO_ANION_BY_ID, POLY_ANION_BY_ID, MONO_ANIONS
} from "../data/ions.js";

// symbol → "-ide" name, for the second element of a covalent compound (O → "oxide").
const IDE_ROOT_BY_SYMBOL = Object.fromEntries(MONO_ANIONS.map((a) => [a.symbol, a.names[0]]));

// Render one ion unit with its subscript, parenthesising a polyatomic when there's more than one.
function renderUnit(formula, count, isPoly) {
  if (count === 1) return formula;
  return isPoly && formula.length > 1 ? `(${formula})${count}` : `${formula}${count}`;
}

// Cartesian product of accepted spellings for each slot, joined in order → list of accepted strings.
function combine(slots) {
  return slots.reduce(
    (acc, options) => acc.flatMap((prefix) => options.map((o) => prefix + o)),
    [""]
  );
}

function uniq(list) {
  return [...new Set(list)];
}

// ── cation / anion resolution ────────────────────────────────────────────────
function resolveCation(spec) {
  const poly = POLY_CATION_BY_ID[spec.cation];
  if (poly) {
    return {
      charge: poly.charge,
      nameForms: poly.names,
      formulaForms: poly.formulas,
      isPoly: true
    };
  }
  const metal = CATION_BY_SYMBOL[spec.cation];
  if (!metal) throw new Error(`unknown cation: ${spec.cation}`);
  const charge = metal.variable ? spec.cationCharge : metal.charge;
  if (charge == null) throw new Error(`${spec.cation} needs a cationCharge (variable metal)`);
  const base = ELEMENTS[spec.cation];
  // Variable metals carry the Roman numeral as part of the cation name: iron(III).
  const name = metal.variable ? `${base}(${toRoman(charge)})` : base;
  return { charge, nameForms: [name], formulaForms: [spec.cation], isPoly: false };
}

function resolveAnion(id) {
  const poly = POLY_ANION_BY_ID[id];
  if (poly) {
    return {
      charge: poly.charge, nameForms: poly.names, formulaForms: poly.formulas,
      isPoly: true, acidStem: poly.acidStem
    };
  }
  const mono = MONO_ANION_BY_ID[id];
  if (!mono) throw new Error(`unknown anion: ${id}`);
  return {
    charge: mono.charge, nameForms: mono.names, formulaForms: [mono.symbol],
    isPoly: false, acidStem: mono.acidStem
  };
}

// ── ionic ──────────────────────────────────────────────────────────────────────
function assembleIonic(spec) {
  const cation = resolveCation(spec);
  const anion = resolveAnion(spec.anion);
  const ratio = crissCross(cation.charge, anion.charge);

  const formulaForms = uniq(
    combine([
      cation.formulaForms.map((f) => renderUnit(f, ratio.cation, cation.isPoly)),
      anion.formulaForms.map((f) => renderUnit(f, ratio.anion, anion.isPoly))
    ])
  );
  const nameForms = uniq(
    combine([cation.nameForms.map((n) => n + " "), anion.nameForms])
  );

  return result("ionic", formulaForms, nameForms, { ratio, cationCharge: cation.charge, anionCharge: anion.charge });
}

// ── covalent ─────────────────────────────────────────────────────────────────
function assembleCovalent(spec) {
  const [[sym1, n1], [sym2, n2]] = spec.parts;
  const root1 = ELEMENTS[sym1];
  const root2 = IDE_ROOT_BY_SYMBOL[sym2];
  if (!root1 || !root2) throw new Error(`unknown covalent element in ${JSON.stringify(spec.parts)}`);

  const first = applyPrefix(n1, root1, { first: true });
  const second = applyPrefix(n2, root2);

  // Name forms = every combination of {elided, un-elided} on each element.
  const nameForms = uniq(
    combine([
      [first.canonical, ...first.variants].map((s) => s + " "),
      [second.canonical, ...second.variants]
    ])
  );
  const formula = (n1 === 1 ? sym1 : sym1 + n1) + (n2 === 1 ? sym2 : sym2 + n2);
  return result("covalent", [formula], nameForms);
}

// ── acids ────────────────────────────────────────────────────────────────────
// Suffix of the anion name decides the form: -ide → hydro…ic, -ate → …ic, -ite → …ous.
function assembleAcid(spec) {
  const anion = resolveAnion(spec.anion);
  if (!anion.acidStem) throw new Error(`anion ${spec.anion} has no acidStem for an acid name`);
  const anionName = anion.nameForms[0];
  let name;
  if (anionName.endsWith("ide")) name = `hydro${anion.acidStem}ic acid`;
  else if (anionName.endsWith("ate")) name = `${anion.acidStem}ic acid`;
  else if (anionName.endsWith("ite")) name = `${anion.acidStem}ous acid`;
  else throw new Error(`can't form an acid name from "${anionName}"`);

  // Formula: H_n + anion, where n balances the anion charge. H goes first; accept each anion form.
  const n = Math.abs(anion.charge);
  const hydrogens = n === 1 ? "H" : `H${n}`;
  const formulaForms = uniq(anion.formulaForms.map((f) => hydrogens + f));
  return result("acid", formulaForms, [name]);
}

// Uniform return shape. canonical = first form; display = unicode-subscripted canonical formula.
function result(type, formulaForms, nameForms, extra = {}) {
  return {
    type,
    formula: { canonical: formulaForms[0], display: toUnicodeSub(formulaForms[0]), accepted: formulaForms },
    name: { canonical: nameForms[0], accepted: nameForms },
    ...extra
  };
}

export function assemble(spec) {
  switch (spec.kind) {
    case "ionic": return assembleIonic(spec);
    case "covalent": return assembleCovalent(spec);
    case "acid": return assembleAcid(spec);
    default: throw new Error(`unknown spec kind: ${spec.kind}`);
  }
}
