// Acid-Base Theories — content only. Each reaction lists its species in equation order.
// role: acid | base | ca (conjugate acid) | cb (conjugate base) | neither (salt, water, adduct).
// theory: the NARROWEST theory under which the reactant plays that role; the wider ones
// follow (Arrhenius ⊂ Brønsted-Lowry ⊂ Lewis). Products carry no theory.
// Formulas are HTML (sub/sup). `why` is the one-line explanation shown after Check.

const H2O = "H<sub>2</sub>O";
const H3O = "H<sub>3</sub>O<sup>+</sup>";
const OH = "OH<sup>−</sup>";
const NH3 = "NH<sub>3</sub>";

export const REACTIONS = [
  { id: "hcl-water", arrow: "→", species: [
    { f: "HCl", role: "acid", theory: "arrhenius", why: "HCl produces H<sup>+</sup> in water. An Arrhenius acid is also a Brønsted-Lowry acid (it donates the proton) and a Lewis acid (the proton accepts an electron pair)." },
    { f: H2O, role: "base", theory: "bronsted", why: "Water accepts the proton. It has no OH<sup>−</sup> to release, so it is not an Arrhenius base." },
    { f: H3O, role: "ca", why: "Water plus one proton: the conjugate acid of water." },
    { f: "Cl<sup>−</sup>", role: "cb", why: "HCl minus one proton: the conjugate base of HCl." }
  ] },
  { id: "hf-water", arrow: "⇌", species: [
    { f: "HF", role: "acid", theory: "arrhenius", why: "HF produces H<sup>+</sup> in water (partly: it is weak, hence the equilibrium arrow). Arrhenius, so also Brønsted-Lowry and Lewis." },
    { f: H2O, role: "base", theory: "bronsted", why: "Water accepts the proton. Not an Arrhenius base: no OH<sup>−</sup> in the formula." },
    { f: H3O, role: "ca", why: "The conjugate acid of water." },
    { f: "F<sup>−</sup>", role: "cb", why: "The conjugate base of HF." }
  ] },
  { id: "acetic-water", arrow: "⇌", species: [
    { f: "CH<sub>3</sub>COOH", role: "acid", theory: "arrhenius", why: "The H on the COOH group comes off as H<sup>+</sup> in water. Arrhenius, so also Brønsted-Lowry and Lewis." },
    { f: H2O, role: "base", theory: "bronsted", why: "Water accepts the proton." },
    { f: "CH<sub>3</sub>COO<sup>−</sup>", role: "cb", why: "Acetic acid minus one proton: its conjugate base." },
    { f: H3O, role: "ca", why: "The conjugate acid of water." }
  ] },
  { id: "ammonia-water", arrow: "⇌", species: [
    { f: NH3, role: "base", theory: "bronsted", why: "Ammonia accepts a proton from water. It has no OH<sup>−</sup> in its formula, so it is not an Arrhenius base; it is a Brønsted-Lowry base and therefore also a Lewis base (the lone pair on N is the electron pair it donates)." },
    { f: H2O, role: "acid", theory: "bronsted", why: "Water gives up a proton here. It is not an Arrhenius acid: it does not produce H<sup>+</sup> in water on its own." },
    { f: "NH<sub>4</sub><sup>+</sup>", role: "ca", why: "Ammonia plus one proton: the conjugate acid of ammonia." },
    { f: OH, role: "cb", why: "Water minus one proton: the conjugate base of water." }
  ] },
  { id: "methylamine-water", arrow: "⇌", species: [
    { f: "CH<sub>3</sub>NH<sub>2</sub>", role: "base", theory: "bronsted", why: "The lone pair on nitrogen takes a proton from water. No OH<sup>−</sup> in the formula, so not Arrhenius." },
    { f: H2O, role: "acid", theory: "bronsted", why: "Water gives up a proton to the amine." },
    { f: "CH<sub>3</sub>NH<sub>3</sub><sup>+</sup>", role: "ca", why: "Methylamine plus one proton." },
    { f: OH, role: "cb", why: "Water minus one proton." }
  ] },
  { id: "water-water", arrow: "⇌", species: [
    { f: H2O, role: "acid", theory: "bronsted", why: "This water molecule gives up a proton to the other one." },
    { f: H2O, role: "base", theory: "bronsted", why: "This water molecule accepts the proton. Water is amphoteric: it plays both roles." },
    { f: H3O, role: "ca", why: "The conjugate acid of water." },
    { f: OH, role: "cb", why: "The conjugate base of water." }
  ] },
  { id: "bicarbonate-hf", arrow: "⇌", species: [
    { f: "HCO<sub>3</sub><sup>−</sup>", role: "base", theory: "bronsted", why: "Bicarbonate accepts a proton from HF. Not Arrhenius: no OH<sup>−</sup>." },
    { f: "HF", role: "acid", theory: "arrhenius", why: "HF donates its proton. It produces H<sup>+</sup> in water, so Arrhenius, and therefore Brønsted-Lowry and Lewis too." },
    { f: "H<sub>2</sub>CO<sub>3</sub>", role: "ca", why: "Bicarbonate plus one proton." },
    { f: "F<sup>−</sup>", role: "cb", why: "HF minus one proton." }
  ] },
  { id: "ammonium-hydroxide", arrow: "→", species: [
    { f: "NH<sub>4</sub><sup>+</sup>", role: "acid", theory: "bronsted", why: "The ammonium ion donates a proton. Brønsted-Lowry (and so Lewis), but not an Arrhenius acid in the classical sense: it is an ion, not a molecular acid HA." },
    { f: OH, role: "base", theory: "bronsted", why: "Hydroxide accepts the proton. The ion itself is the Brønsted-Lowry base; the Arrhenius base is the hydroxide compound that released it." },
    { f: NH3, role: "cb", why: "Ammonium minus one proton." },
    { f: H2O, role: "ca", why: "Hydroxide plus one proton." }
  ] },
  { id: "carbonate-water", arrow: "⇌", species: [
    { f: "CO<sub>3</sub><sup>2−</sup>", role: "base", theory: "bronsted", why: "Carbonate takes a proton from water. This is why a Na<sub>2</sub>CO<sub>3</sub> solution is basic." },
    { f: H2O, role: "acid", theory: "bronsted", why: "Water gives up a proton to the carbonate ion." },
    { f: "HCO<sub>3</sub><sup>−</sup>", role: "ca", why: "Carbonate plus one proton." },
    { f: OH, role: "cb", why: "Water minus one proton." }
  ] },
  { id: "koh-hno3", arrow: "→", species: [
    { f: "KOH", role: "base", theory: "arrhenius", why: "KOH releases OH<sup>−</sup> in water: an Arrhenius base. The OH<sup>−</sup> then accepts a proton (Brønsted-Lowry) by donating an electron pair (Lewis)." },
    { f: "HNO<sub>3</sub>", role: "acid", theory: "arrhenius", why: "HNO<sub>3</sub> produces H<sup>+</sup> in water: an Arrhenius acid, and so Brønsted-Lowry and Lewis." },
    { f: "KNO<sub>3</sub>", role: "neither", why: "The salt. In the molecular equation the products of an Arrhenius neutralization are a salt and water." },
    { f: H2O, role: "neither", why: "The water formed from H<sup>+</sup> and OH<sup>−</sup>. In the molecular equation it is simply the product, not a conjugate." }
  ] },
  { id: "nh3-bf3", arrow: "→", species: [
    { f: NH3, role: "base", theory: "lewis", why: "Ammonia donates its lone pair to boron. No proton moves, so it is a Lewis base only, not Brønsted-Lowry and not Arrhenius." },
    { f: "BF<sub>3</sub>", role: "acid", theory: "lewis", why: "Boron has an empty orbital and accepts the electron pair. No proton anywhere: Lewis acid only." },
    { f: "H<sub>3</sub>N–BF<sub>3</sub>", role: "neither", why: "The adduct: the two joined by the new coordinate covalent bond. Not a conjugate of anything." }
  ] },
  { id: "me3n-bf3", arrow: "→", species: [
    { f: "(CH<sub>3</sub>)<sub>3</sub>N", role: "base", theory: "lewis", why: "Trimethylamine donates the lone pair on nitrogen. No proton moves: Lewis base only." },
    { f: "BF<sub>3</sub>", role: "acid", theory: "lewis", why: "Boron accepts the electron pair into its empty orbital: Lewis acid only." },
    { f: "(CH<sub>3</sub>)<sub>3</sub>N–BF<sub>3</sub>", role: "neither", why: "The adduct." }
  ] },
  { id: "cu-nh3", arrow: "→", species: [
    { f: "Cu<sup>2+</sup>", role: "acid", theory: "lewis", why: "The copper ion accepts four electron pairs. It has no proton to give, so Lewis acid only." },
    { f: "4 " + NH3, role: "base", theory: "lewis", why: "Each ammonia donates its lone pair to copper. No proton moves, so here ammonia is a Lewis base only." },
    { f: "[Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup>", role: "neither", why: "The complex ion is the adduct. The pH does not change in this reaction." }
  ] },
  { id: "ag-nh3", arrow: "→", species: [
    { f: "Ag<sup>+</sup>", role: "acid", theory: "lewis", why: "The silver ion accepts two electron pairs: Lewis acid only." },
    { f: "2 " + NH3, role: "base", theory: "lewis", why: "Ammonia donates its lone pair to silver. No proton moves." },
    { f: "[Ag(NH<sub>3</sub>)<sub>2</sub>]<sup>+</sup>", role: "neither", why: "The complex ion, the adduct." }
  ] },
  { id: "fe-cn", arrow: "→", species: [
    { f: "Fe<sup>3+</sup>", role: "acid", theory: "lewis", why: "The iron(III) ion accepts six electron pairs: Lewis acid only." },
    { f: "6 CN<sup>−</sup>", role: "base", theory: "lewis", why: "Each cyanide donates a lone pair on carbon. No proton moves, so Lewis base only." },
    { f: "[Fe(CN)<sub>6</sub>]<sup>3−</sup>", role: "neither", why: "The complex ion, the adduct." }
  ] },
  { id: "al-water", arrow: "→", species: [
    { f: "Al<sup>3+</sup>", role: "acid", theory: "lewis", why: "The small, highly charged aluminium ion accepts electron pairs from six water molecules: Lewis acid only." },
    { f: "6 " + H2O, role: "base", theory: "lewis", why: "Water donates a lone pair on oxygen to the metal ion. No proton moves in this step, so Lewis base only." },
    { f: "[Al(H<sub>2</sub>O)<sub>6</sub>]<sup>3+</sup>", role: "neither", why: "The hydrated ion, the adduct. (In a later step this ion gives up a proton, which is why Al<sup>3+</sup> salts are acidic.)" }
  ] },
  { id: "co2-oxide", arrow: "→", species: [
    { f: "CO<sub>2</sub>", role: "acid", theory: "lewis", why: "The carbon atom accepts an electron pair from the oxide ion. No proton anywhere: Lewis acid only." },
    { f: "O<sup>2−</sup>", role: "base", theory: "lewis", why: "The oxide ion donates an electron pair: Lewis base only." },
    { f: "CO<sub>3</sub><sup>2−</sup>", role: "neither", why: "The carbonate ion, the adduct." }
  ] }
];
