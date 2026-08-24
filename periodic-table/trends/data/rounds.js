// Trend Ladder — tier and round data. Pure ESM, no DOM.
//
// Each round's `species` list is stored in ASCENDING property order (smallest value
// first); the game shuffles the tray and grades against this order (or its reverse
// for direction "dec"). `chip` is the after-solve reveal: the real value the player
// just constructed the order of — numbers stay hidden until Check, per the
// predict-before-reveal rule.
//
// Values: standard general-chemistry tables (Tro) — atomic radii in pm, Shannon
// ionic radii in pm, first ionization energies in kJ/mol, Pauling electronegativity.
// Ne carries no comparable radius value; its chip shows the proton count only,
// which is the actual reasoning the isoelectronic tier teaches.
// Tier 4 rounds are real OU CHEM 1315 exam stems (see documentation/OU_MINING.md):
// E2 Sp13 Q32/Q36, E3 SP13 Q15, and the N→O dip family.

export const TIERS = [
  {
    id: "radius",
    label: "Atomic Radius",
    introTitle: "How big is the atom?",
    introSteps: [
      "<strong>Down a group</strong>, each row adds a whole electron shell — the atom grows.",
      "<strong>Across a period</strong>, shells stay the same but protons keep coming — the nucleus pulls the same shells in tighter, so the atom shrinks.",
      "Read the position, then build the order. The real sizes appear after you check.",
    ],
    diagram: "arrows",
    diagramLabels: { down: "radius grows", across: "radius shrinks" },
    rounds: [
      {
        id: "r-group1", property: "atomic radius", direction: "inc",
        species: [
          { key: "Li", label: "Li", chip: "152 pm" },
          { key: "Na", label: "Na", chip: "186 pm" },
          { key: "K", label: "K", chip: "227 pm" },
          { key: "Rb", label: "Rb", chip: "248 pm" },
          { key: "Cs", label: "Cs", chip: "265 pm" },
        ],
        hints: [
          "All five sit in <strong>group 1</strong> — the same column. Only one trend is in play.",
          "Each step down the column adds an electron shell. <strong>Li</strong> has 2 shells; <strong>Cs</strong> has 6.",
        ],
        why: "One column, five rows: every step down adds a shell, so the radius climbs from Li to Cs.",
      },
      {
        id: "r-period3", property: "atomic radius", direction: "dec",
        species: [
          { key: "Cl", label: "Cl", chip: "99 pm" },
          { key: "Si", label: "Si", chip: "118 pm" },
          { key: "Al", label: "Al", chip: "143 pm" },
          { key: "Mg", label: "Mg", chip: "160 pm" },
          { key: "Na", label: "Na", chip: "186 pm" },
        ],
        hints: [
          "All five sit in <strong>period 3</strong> — the same row, three shells each.",
          "Same shells, more protons: the further right, the harder the nucleus pulls those shells in.",
        ],
        why: "One row, same three shells: protons climb from Na (11) to Cl (17), pulling the cloud tighter each step right.",
      },
      {
        id: "r-halogens", property: "atomic radius", direction: "inc",
        species: [
          { key: "F", label: "F", chip: "71 pm" },
          { key: "Cl", label: "Cl", chip: "99 pm" },
          { key: "Br", label: "Br", chip: "114 pm" },
          { key: "I", label: "I", chip: "133 pm" },
        ],
        hints: [
          "The halogens — group 17, top to bottom.",
          "Down a group the atom grows: <strong>F</strong> has 2 shells, <strong>I</strong> has 5.",
        ],
        why: "Group 17 top to bottom: each halogen adds a shell on the one above it.",
      },
      {
        id: "r-period2", property: "atomic radius", direction: "inc",
        species: [
          { key: "F", label: "F", chip: "71 pm" },
          { key: "N", label: "N", chip: "75 pm" },
          { key: "B", label: "B", chip: "85 pm" },
          { key: "Be", label: "Be", chip: "112 pm" },
          { key: "Li", label: "Li", chip: "152 pm" },
        ],
        hints: [
          "All five sit in <strong>period 2</strong> — but this time the order asked for runs against the reading direction.",
          "Smallest first means the <strong>right end of the row</strong> leads: F before N before B…",
        ],
        why: "Across period 2 the atom shrinks left to right — so smallest-first reads the row backwards, from F to Li.",
      },
    ],
  },
  {
    id: "iso",
    label: "Isoelectronic Ions",
    introTitle: "Same electrons, different pull",
    introSteps: [
      "An <strong>isoelectronic series</strong> is a set of ions (and sometimes an atom) that all hold the <strong>same number of electrons</strong>.",
      "The electron cloud is identical — what differs is the <strong>proton count</strong> pulling on it. More protons, tighter cloud, smaller ion.",
      "So don't compare sizes — <strong>count protons</strong>. The counts appear after you check.",
    ],
    diagram: "iso",
    rounds: [
      {
        id: "i-neon5", property: "ionic radius", direction: "dec",
        species: [
          { key: "Mg2+", label: "Mg<sup>2+</sup>", chip: "12 p⁺ · 72 pm" },
          { key: "Na+", label: "Na<sup>+</sup>", chip: "11 p⁺ · 102 pm" },
          { key: "F-", label: "F<sup>−</sup>", chip: "9 p⁺ · 133 pm" },
          { key: "O2-", label: "O<sup>2−</sup>", chip: "8 p⁺ · 140 pm" },
          { key: "N3-", label: "N<sup>3−</sup>", chip: "7 p⁺ · 146 pm" },
        ],
        hints: [
          "Every species here holds <strong>10 electrons</strong> — the neon cloud. The clouds match; the nuclei don't.",
          "Count protons: N has 7, Mg has 12. The most protons grip the shared cloud hardest.",
        ],
        why: "All five wear the same 10-electron cloud. Protons climb 7 → 12 across the series, and each extra proton squeezes that cloud smaller.",
      },
      {
        id: "i-neon7", property: "ionic radius", direction: "inc",
        species: [
          { key: "Al3+", label: "Al<sup>3+</sup>", chip: "13 p⁺ · 54 pm" },
          { key: "Mg2+", label: "Mg<sup>2+</sup>", chip: "12 p⁺ · 72 pm" },
          { key: "Na+", label: "Na<sup>+</sup>", chip: "11 p⁺ · 102 pm" },
          { key: "Ne", label: "Ne", chip: "10 p⁺" },
          { key: "F-", label: "F<sup>−</sup>", chip: "9 p⁺ · 133 pm" },
          { key: "O2-", label: "O<sup>2−</sup>", chip: "8 p⁺ · 140 pm" },
          { key: "N3-", label: "N<sup>3−</sup>", chip: "7 p⁺ · 146 pm" },
        ],
        hints: [
          "The full neon family — seven species, one shared 10-electron cloud. Even neutral <strong>Ne</strong> belongs to it.",
          "Smallest first: start from the <strong>most protons</strong> (Al, 13) and walk down to the fewest (N, 7).",
        ],
        why: "The classic series: 13 protons down to 7, all gripping the same 10 electrons. Al³⁺ holds them tightest; N³⁻ barely holds on.",
      },
      {
        id: "i-argon", property: "ionic radius", direction: "dec",
        species: [
          { key: "Ca2+", label: "Ca<sup>2+</sup>", chip: "20 p⁺ · 100 pm" },
          { key: "K+", label: "K<sup>+</sup>", chip: "19 p⁺ · 138 pm" },
          { key: "Cl-", label: "Cl<sup>−</sup>", chip: "17 p⁺ · 181 pm" },
          { key: "S2-", label: "S<sup>2−</sup>", chip: "16 p⁺ · 184 pm" },
          { key: "P3-", label: "P<sup>3−</sup>", chip: "15 p⁺ · 212 pm" },
        ],
        hints: [
          "A new family: every species here holds <strong>18 electrons</strong> — the argon cloud.",
          "Same rule, new numbers: protons run 15 (P) to 20 (Ca).",
        ],
        why: "The argon series: 18 electrons shared by nuclei of 15 to 20 protons. P³⁻ is the loosest grip, Ca²⁺ the tightest.",
      },
    ],
  },
  {
    id: "energy",
    label: "Ionization &amp; Pull",
    introTitle: "Holding on and pulling in",
    introSteps: [
      "<strong>First ionization energy</strong> is the price of removing the outermost electron. A small atom holds that electron close — removing it costs more.",
      "<strong>Electronegativity</strong> is how hard an atom pulls on shared bonding electrons.",
      "Both run <strong>opposite to radius</strong>: up a group and rightward across a period, atoms get smaller and both numbers climb — toward fluorine's corner.",
    ],
    diagram: "arrows",
    diagramLabels: { down: "IE and EN fall", across: "IE and EN climb" },
    rounds: [
      {
        id: "e-ie-group1", property: "first ionization energy", direction: "inc",
        species: [
          { key: "Cs", label: "Cs", chip: "376 kJ/mol" },
          { key: "Rb", label: "Rb", chip: "403 kJ/mol" },
          { key: "K", label: "K", chip: "419 kJ/mol" },
          { key: "Na", label: "Na", chip: "496 kJ/mol" },
          { key: "Li", label: "Li", chip: "520 kJ/mol" },
        ],
        hints: [
          "Group 1 again — but the question flipped from size to <strong>grip</strong>.",
          "The biggest atom holds its outer electron loosest: cheap to remove. IE runs opposite to radius.",
        ],
        why: "Down the column the outer electron sits farther from the nucleus — Cs gives its up cheapest, Li holds tightest.",
      },
      {
        id: "e-ie-period3", property: "first ionization energy", direction: "inc",
        species: [
          { key: "Na", label: "Na", chip: "496 kJ/mol" },
          { key: "Si", label: "Si", chip: "786 kJ/mol" },
          { key: "S", label: "S", chip: "1000 kJ/mol" },
          { key: "Cl", label: "Cl", chip: "1251 kJ/mol" },
          { key: "Ar", label: "Ar", chip: "1521 kJ/mol" },
        ],
        hints: [
          "All period 3, left to right. Smaller atom → outer electron closer to the nucleus → higher price.",
          "The noble gas anchors the top: nothing in the row guards its electrons like <strong>Ar</strong>.",
        ],
        why: "Across period 3 the atom shrinks and the price of the first electron climbs, peaking at the noble gas.",
      },
      {
        id: "e-en-diag", property: "electronegativity", direction: "inc",
        species: [
          { key: "Na", label: "Na", chip: "EN 0.93" },
          { key: "Al", label: "Al", chip: "EN 1.61" },
          { key: "P", label: "P", chip: "EN 2.19" },
          { key: "Cl", label: "Cl", chip: "EN 3.16" },
          { key: "F", label: "F", chip: "EN 3.98" },
        ],
        hints: [
          "Electronegativity climbs toward one corner of the table. Which element owns that corner?",
          "Four of these walk period 3 rightward — then <strong>F</strong> jumps a row up, straight toward the corner.",
        ],
        why: "Pull on bonding electrons climbs up and to the right — fluorine's corner. F outpulls everything.",
      },
      {
        id: "e-en-halogens", property: "electronegativity", direction: "dec",
        species: [
          { key: "I", label: "I", chip: "EN 2.66" },
          { key: "Br", label: "Br", chip: "EN 2.96" },
          { key: "Cl", label: "Cl", chip: "EN 3.16" },
          { key: "F", label: "F", chip: "EN 3.98" },
        ],
        hints: [
          "One family, group 17 — and the strongest puller leads this time.",
          "Down the group the bonding electrons sit farther from the nucleus: the pull weakens.",
        ],
        why: "Within the halogen family the pull fades downward: F grips bonding electrons hardest, I weakest.",
      },
    ],
  },
  {
    id: "exam",
    label: "Exam Band",
    introTitle: "Real exam sets — mixed moves",
    introSteps: [
      "These sets come from real university exams (OU CHEM 1315). They mix <strong>both trends at once</strong> — across and down in the same list.",
      "The demanded direction rotates too: read <strong>increasing or decreasing</strong> before you place a single tile.",
      "And one set hides a stumble the smooth trend doesn't predict. Find it.",
    ],
    diagram: "arrows",
    diagramLabels: { down: "one trend…", across: "…crossed with the other" },
    rounds: [
      {
        id: "x-ie-mixed", property: "first ionization energy", direction: "dec",
        species: [
          { key: "Cs", label: "Cs", chip: "376 kJ/mol" },
          { key: "K", label: "K", chip: "419 kJ/mol" },
          { key: "Ca", label: "Ca", chip: "590 kJ/mol" },
          { key: "Mg", label: "Mg", chip: "738 kJ/mol" },
          { key: "Be", label: "Be", chip: "899 kJ/mol" },
        ],
        hints: [
          "Two families interleaved: Be–Mg–Ca walk down group 2, K and Cs down group 1.",
          "Highest first: the smallest atom of the lot — top of group 2 — leads.",
        ],
        why: "An OU exam classic: group 2 runs Be > Mg > Ca, and the group-1 giants K and Cs trail — the smaller and further right, the higher the price.",
      },
      {
        id: "x-radius-diag", property: "atomic radius", direction: "dec",
        species: [
          { key: "O", label: "O", chip: "73 pm" },
          { key: "S", label: "S", chip: "104 pm" },
          { key: "Si", label: "Si", chip: "118 pm" },
          { key: "Ga", label: "Ga", chip: "135 pm" },
        ],
        hints: [
          "No two of these share a row or a column — combine both trends.",
          "Down-and-left grows the atom: <strong>Ga</strong> sits lowest and leftmost.",
        ],
        why: "A diagonal walk: Ga (period 4, left-ish) is biggest; each step up-and-right — Si, S, O — shrinks the atom.",
      },
      {
        id: "x-radius-mixed", property: "atomic radius", direction: "inc",
        species: [
          { key: "Cl", label: "Cl", chip: "99 pm" },
          { key: "Mg", label: "Mg", chip: "160 pm" },
          { key: "Na", label: "Na", chip: "186 pm" },
          { key: "K", label: "K", chip: "227 pm" },
          { key: "Cs", label: "Cs", chip: "265 pm" },
        ],
        hints: [
          "Three of these share period 3; two drop below it. Sort the row first, then hang the column.",
          "Within period 3: Cl < Mg < Na. Then K and Cs keep growing downward.",
        ],
        why: "Another OU stem: the period-3 trio orders Cl < Mg < Na, and the group-1 column continues Na < K < Cs.",
      },
      {
        id: "x-dip", property: "first ionization energy", direction: "inc",
        species: [
          { key: "C", label: "C", chip: "1086 kJ/mol" },
          { key: "O", label: "O", chip: "1314 kJ/mol" },
          { key: "N", label: "N", chip: "1402 kJ/mol" },
          { key: "F", label: "F", chip: "1681 kJ/mol" },
        ],
        hints: [
          "Four period-2 neighbors in a row — but the smooth left-to-right story has a stumble in the middle.",
          "Nitrogen's outer shell is <strong>2p³</strong> — one electron in each p orbital, a half-filled set. That arrangement is unusually stable.",
          "Oxygen's fourth p electron has to <strong>pair up</strong> in an occupied orbital. The pair repels — that electron is easier to remove than the trend predicts.",
        ],
        why: "The famous N→O dip: N's half-filled 2p³ is extra stable, while O's paired electron leaves cheap — so the order runs C < O < N < F, not C < N < O < F.",
      },
      {
        id: "x-metallic", property: "metallic character", direction: "inc",
        species: [
          { key: "Cl", label: "Cl", chip: "nonmetal" },
          { key: "Si", label: "Si", chip: "metalloid" },
          { key: "Al", label: "Al", chip: "metal" },
          { key: "Mg", label: "Mg", chip: "metal" },
          { key: "Na", label: "Na", chip: "metal" },
        ],
        hints: [
          "Metallic character means: how readily does it <strong>give electrons up</strong>? That's easiest for big atoms with a loose grip.",
          "So the trend mirrors radius: metallic character grows leftward — and this whole set walks period 3.",
        ],
        why: "Across period 3 right to left the grip loosens: Cl hoards electrons (nonmetal), Si sits on the staircase (metalloid), and Al, Mg, Na give them up ever more freely.",
      },
    ],
  },
];
