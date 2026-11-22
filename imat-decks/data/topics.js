// IMAT chemistry topics and subtopics for the checklist page (topics.html).
// Source: Dalia's IMAT_Chemistry_Study_Topics list (2025), one topic per row there,
// subtopics separated by commas. Bracketed details from that list stay on the same
// line as `detail`.
//
// The ids are what the saved marks are keyed by. Change a label freely; do not change
// an id, or the student's marks for that line are lost.

const s = (id, label, detail) => ({ id, label, detail });

export const TOPICS = [
  { id: "atomic-structure", name: "Atomic Structure", subs: [
    s("atomic-number", "Atomic number"),
    s("mass-number", "Mass number"),
    s("isotopes", "Isotopes"),
    s("electron-configuration", "Electron configuration"),
    s("quantum-numbers", "Quantum numbers"),
  ] },
  { id: "periodic-table", name: "Periodic Table", subs: [
    s("groups", "Groups"),
    s("periods", "Periods"),
    s("classification", "Element classification", "alkali metals, alkaline earth metals, halogens, noble gases"),
    s("trends", "Trends", "electronegativity, ionization energy, atomic radius"),
  ] },
  { id: "chemical-bonding", name: "Chemical Bonding", subs: [
    s("ionic", "Ionic bonds"),
    s("covalent", "Covalent bonds"),
    s("polar-covalent", "Polar covalent bonds"),
    s("hydrogen-bonds", "Hydrogen bonds"),
    s("metallic", "Metallic bonds"),
    s("bond-length", "Bond length"),
    s("bond-energy", "Bond energy"),
    s("hybridization", "Hybridization", "sp, sp<sup>2</sup>, sp<sup>3</sup>"),
    s("molecular-geometry", "Molecular geometry", "VSEPR"),
  ] },
  { id: "stoichiometry", name: "Stoichiometry", subs: [
    s("molar-mass", "Molar mass"),
    s("mole-concept", "Mole concept"),
    s("avogadro", "Avogadro's number"),
    s("mass-mole-volume", "Mass-mole-volume relationships"),
    s("balancing", "Balancing equations"),
  ] },
  { id: "states-of-matter", name: "States of Matter", subs: [
    s("gases", "Gases", "ideal gas law, gas mixtures"),
    s("liquids", "Liquids", "vapor pressure, boiling point, freezing point depression, colligative properties"),
    s("solids", "Solids", "crystal structures"),
  ] },
  { id: "chemical-reactions", name: "Chemical Reactions", subs: [
    s("types", "Types of reactions", "synthesis, decomposition, single and double displacement, redox"),
    s("balancing-redox", "Balancing redox reactions"),
    s("oxidation-numbers", "Oxidation numbers"),
  ] },
  { id: "thermochemistry", name: "Thermochemistry", subs: [
    s("endo-exo", "Endothermic and exothermic processes"),
    s("enthalpy", "Enthalpy changes"),
    s("calorimetry", "Calorimetry"),
  ] },
  { id: "acids-bases", name: "Acids and Bases", subs: [
    s("ph", "pH"),
    s("poh", "pOH"),
    s("strong-weak", "Strong and weak acids and bases"),
    s("neutralization", "Neutralization"),
    s("buffers", "Buffers"),
    s("titrations", "Titrations"),
  ] },
  { id: "solutions", name: "Solutions", subs: [
    s("concentration-units", "Concentration units", "molarity, molality, % w/v, % v/v"),
    s("solubility", "Solubility"),
    s("precipitation", "Precipitation reactions"),
    s("colligative", "Colligative properties"),
  ] },
  { id: "electrochemistry", name: "Electrochemistry", subs: [
    s("oxidation-reduction", "Oxidation-reduction"),
    s("cells", "Galvanic and electrolytic cells"),
    s("cell-potential", "Cell potential"),
  ] },
  { id: "organic-chemistry", name: "Organic Chemistry", subs: [
    s("functional-groups", "Functional groups", "alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, amides"),
    s("isomerism", "Isomerism", "structural, cis-trans"),
    s("reactions", "Reactions", "hydrogenation, halogenation, oxidation, esterification"),
  ] },
  { id: "biochemistry", name: "Biochemistry", subs: [
    s("lipids", "Lipids"),
    s("carbohydrates", "Carbohydrates"),
    s("proteins", "Proteins"),
    s("nucleic-acids", "Nucleic acids"),
    s("enzymes", "Enzymes"),
    s("amino-acids", "Amino acids"),
    s("peptide-bonds", "Peptide bonds"),
  ] },
  { id: "laboratory-techniques", name: "Laboratory Techniques", subs: [
    s("chromatography", "Chromatography", "TLC, GC, ion exchange, gel filtration"),
    s("calorimetry", "Calorimetry"),
    s("spectroscopy", "Spectroscopy basics"),
  ] },
  { id: "general-science", name: "General Science", subs: [
    s("physics-concepts", "Basic physics concepts related to chemistry", "energy, electromagnetic radiation"),
    s("lab-equipment", "Common lab equipment"),
  ] },
];
