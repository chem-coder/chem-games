// Home page content: sections and cards, language-independent. Titles, descriptions,
// section headings and tag labels live in home/locale/{en,ru}.js under the same ids.
// `ru: true` marks a game that runs in Russian; the others get an "English only" tag
// on the Russian page. `layout: "path"` draws numbered steps with arrows.
export const SECTIONS = [
  { id: "foundations", layout: "grid", cards: [
    { id: "periodic-system", href: "periodic-table/", tags: ["elements", "memory"], ru: true },
    { id: "trend-ladder", href: "periodic-table/trends/", tags: ["trends", "imat"], ru: true },
    { id: "atomic-structure", href: "atomic-structure/", tags: ["atoms", "new"], ru: true },
    { id: "ion-trainer", href: "nomenclature/", tags: ["ions", "memory"] },
    { id: "nomenclature", href: "nomenclature/builder/", tags: ["nomenclature", "both_directions"], featured: true }
  ] },
  { id: "stoichiometry", layout: "path", cards: [
    { id: "balancer", href: "imat-chem-stoichiometry/", tags: ["balancing"] },
    { id: "ratio-factory", href: "ratio-factory/", tags: ["ratios", "limiting_parts"] },
    { id: "conversion-conveyor", href: "conversion-conveyor/", tags: ["mole_ratios"] },
    { id: "conversion-builder", href: "conversion-builder/", tags: ["dimensional_analysis"] }
  ] },
  { id: "redox", layout: "grid", cards: [
    { id: "oxidation-state-trainer", href: "oxidation-state-trainer/", tags: ["redox", "oxidation_states"] }
  ] },
  { id: "imat", layout: "grid", cards: [
    { id: "imat-decks", href: "imat-decks/", tags: ["imat", "past_papers"] }
  ] },
  { id: "bonding", layout: "grid", cards: [
    { id: "shape-lab", href: "shape-lab/", tags: ["vsepr", "three_d", "imat"] }
  ] },
  { id: "acids-bases", layout: "grid", cards: [
    { id: "acid-base-sorter", href: "acid-base-sorter/", tags: ["classification"] },
    { id: "ph-lab", href: "ph-lab/", tags: ["ph", "imat"] },
    { id: "acids-bases-guide", href: "acids-bases-guide/", tags: ["guide", "new"] },
    { id: "ph-calculator-2", href: "chem-pH-calculator/v2-pH-SW-AB/", tags: ["calculator"], placeholder: true },
    { id: "ph-calculator-1", href: "chem-pH-calculator/pH-1.html", tags: ["calculator"], placeholder: true }
  ] },
  { id: "gas-laws", layout: "grid", cards: [
    { id: "gas-laws", href: "chem-gas-laws/", tags: ["gas_laws", "balloon"] }
  ] },
  { id: "organic", layout: "grid", cards: [
    { id: "organic-nomenclature", href: "organic-nomenclature/", tags: ["organic", "nomenclature"] },
    { id: "organic-reactions", href: "organic-nomenclature/reactions/", tags: ["organic", "reactions", "new"] },
    { id: "molecule-builder", href: "organic-nomenclature/builder/", tags: ["organic", "sandbox"] }
  ] },
  { id: "batteries", layout: "grid", cards: [
    { id: "cell-builder", href: "battery-lab/cell-builder/", tags: ["batteries", "construct", "new"], featured: true },
    { id: "cell-numbers", href: "battery-lab/numbers/", tags: ["batteries", "numbers", "new"] },
    { id: "electrolytes", href: "battery-lab/electrolytes/", tags: ["batteries", "structures", "new"] },
    { id: "cathodes", href: "battery-lab/cathodes/", tags: ["batteries", "lattices", "new"] },
    { id: "anodes", href: "battery-lab/anodes/", tags: ["batteries", "anodes", "new"] },
    { id: "potential-ladder", href: "battery-lab/potential-ladder/", tags: ["batteries", "electrochemistry", "new"] },
    { id: "battery-lab", href: "battery-lab/", tags: ["hub"] }
  ] },
  { id: "reference", layout: "grid", cards: [
    { id: "oxidation-states-reference", href: "reference/oxidation-states/", tags: ["reference", "periodic_table"] },
    { id: "acid-base-constants", href: "acids-bases-guide/reference-tables.html", tags: ["reference", "ph"] }
  ] },
  { id: "archive", layout: "grid", cards: [
    { id: "nomenclature-v4", href: "chem-nomenclature/v4/", tags: ["archive"], placeholder: true },
    { id: "early-game", href: "-Chemistry%20Game/", tags: ["archive"], placeholder: true }
  ] },
  { id: "planned", layout: "grid", cards: [
    { id: "ion-charge-builder", tags: ["planned"], placeholder: true },
    { id: "reaction-studio", tags: ["planned"], placeholder: true }
  ] }
];
