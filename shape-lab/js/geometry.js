// Shape Lab — the VSEPR geometry catalog.
// Every molecular geometry the course meets, with real 3D unit vectors for the
// renderer. Orientation convention: y is "up" on screen, z is depth — shapes are
// posed the way Dalia's handouts draw them (lone pairs up, axial bonds vertical).

const T = 1 / Math.sqrt(3);

// Trig-pyramid pose: one slot straight up, three tilted down (109.5° apart).
const UP = [0, 1, 0];
const DOWN3 = [
  [0.943, -0.333, 0],
  [-0.471, -0.333, 0.816],
  [-0.471, -0.333, -0.816],
];

export const GEOMETRIES = [
  {
    id: "linear-2", name: "Linear", regions: 2, bonds: 2, lonePairs: 0,
    eGeo: "linear", angle: "180°",
    examples: ["CO2", "BeF2", "HCN"],
    demo: { center: "C", outer: ["O", "O"] },
    coords: [[1, 0, 0], [-1, 0, 0]], lpCoords: [],
    facts: [
      "All three atoms sit on one straight axis — nothing to bend.",
      "Nonpolar when both ends match (CO2): the two bond dipoles cancel exactly, even though each C=O bond is strongly polar.",
      "BeF2 is a famous octet rebel — Be is content with just 4 electrons.",
    ],
  },
  {
    id: "trigonal-planar", name: "Trigonal planar", regions: 3, bonds: 3, lonePairs: 0,
    eGeo: "trigonal planar", angle: "120°",
    examples: ["BF3", "SO3", "NO3-", "CO3^2-"],
    demo: { center: "B", outer: ["F", "F", "F"] },
    coords: [[1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]], lpCoords: [],
    facts: [
      "Perfectly flat — all four atoms share one plane, 120° apart.",
      "Nonpolar when the three outer atoms match; swap one and the symmetry (and the cancellation) breaks.",
      "BF3: boron holds only 6 electrons and is fine with it — the other octet rebel.",
    ],
  },
  {
    id: "bent-3", name: "Bent (3 regions)", regions: 3, bonds: 2, lonePairs: 1,
    eGeo: "trigonal planar", angle: "≈119° (just under 120°)",
    examples: ["SO2", "O3"],
    demo: { center: "S", outer: ["O", "O"] },
    coords: [[0.862, -0.508, 0], [-0.862, -0.508, 0]], lpCoords: [[0, 1, 0]],
    facts: [
      "One corner of the trigonal plane is claimed by a lone pair — the atoms trace a shallow V.",
      "The lone pair pushes a little harder than bonds do, squeezing the angle just below 120°.",
      "Always polar: the two bond dipoles point down-left and down-right and add up instead of cancelling.",
    ],
  },
  {
    id: "tetrahedral", name: "Tetrahedral", regions: 4, bonds: 4, lonePairs: 0,
    eGeo: "tetrahedral", angle: "109.5°",
    examples: ["CH4", "CCl4", "SO4^2-", "NH4+"],
    demo: { center: "C", outer: ["H", "H", "H", "H"] },
    coords: [UP, ...DOWN3], lpCoords: [],
    facts: [
      "The 3D default — four regions spread as far apart as space allows: 109.5°, not 90°.",
      "Nonpolar when all four outer atoms match (CH4, CCl4). Replace even one (CH3Cl) and it turns polar.",
      "All four positions are perfectly equivalent — no axial/equatorial drama here.",
    ],
  },
  {
    id: "trigonal-pyramidal", name: "Trigonal pyramidal", regions: 4, bonds: 3, lonePairs: 1,
    eGeo: "tetrahedral", angle: "≈107°",
    examples: ["NH3", "PCl3", "H3O+"],
    demo: { center: "N", outer: ["H", "H", "H"] },
    coords: DOWN3, lpCoords: [UP],
    facts: [
      "A tetrahedron with a lone pair on top — the atoms form a low three-legged pyramid.",
      "The lone pair squeezes 109.5° down to about 107°.",
      "Always polar. That exposed lone pair is exactly why ammonia grabs protons — it's the business end of a base.",
    ],
  },
  {
    id: "bent-4", name: "Bent (4 regions)", regions: 4, bonds: 2, lonePairs: 2,
    eGeo: "tetrahedral", angle: "≈104.5°",
    examples: ["H2O", "H2S", "OF2"],
    demo: { center: "O", outer: ["H", "H"] },
    coords: [[0.791, -0.612, 0], [-0.791, -0.612, 0]],
    lpCoords: [[0, 0.612, 0.791], [0, 0.612, -0.791]],
    facts: [
      "Two lone pairs squeeze harder than one: 109.5° → 104.5°.",
      "Always polar — this V-shape is water's whole personality (and the reason ice floats, drops bead, and salts dissolve).",
      "Same recipe as bent-3, different parent: count the regions to tell them apart.",
    ],
  },
  {
    id: "trigonal-bipyramidal", name: "Trigonal bipyramidal", regions: 5, bonds: 5, lonePairs: 0,
    eGeo: "trigonal bipyramidal", angle: "90° axial · 120° equatorial",
    examples: ["PF5", "PCl5"],
    demo: { center: "P", outer: ["F", "F", "F", "F", "F"] },
    coords: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]],
    lpCoords: [],
    facts: [
      "The first shape with two DIFFERENT kinds of seat: two axial (poles, 90°) and three equatorial (waist, 120°).",
      "Axial bonds are slightly longer and weaker than equatorial ones.",
      "With mixed atoms, the more electronegative ones (like F over Br) take the axial seats; lone pairs and double bonds insist on the roomier equator.",
      "Five bonds means an expanded octet — the central atom must be row 3 or lower (P, S, …). Never nitrogen.",
    ],
  },
  {
    id: "seesaw", name: "See-saw", regions: 5, bonds: 4, lonePairs: 1,
    eGeo: "trigonal bipyramidal", angle: "≈90° and ≈120° (both squeezed)",
    examples: ["SF4", "XeO2F2"],
    demo: { center: "S", outer: ["F", "F", "F", "F"] },
    coords: [[0, 1, 0], [0, -1, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]],
    lpCoords: [[1, 0, 0]],
    facts: [
      "A trigonal bipyramid whose lone pair grabbed an equatorial seat — the roomiest spot, 120° from two neighbors instead of 90° from three.",
      "Tip it sideways and the four atoms rock like a playground see-saw.",
      "Always polar — the lone pair's side is electron-rich and nothing balances it.",
    ],
  },
  {
    id: "t-shape", name: "T-shape", regions: 5, bonds: 3, lonePairs: 2,
    eGeo: "trigonal bipyramidal", angle: "≈90°",
    examples: ["ClF3", "BrF3"],
    demo: { center: "Cl", outer: ["F", "F", "F"] },
    coords: [[0, 1, 0], [0, -1, 0], [1, 0, 0]],
    lpCoords: [[-0.5, 0, 0.866], [-0.5, 0, -0.866]],
    facts: [
      "Both lone pairs take equatorial seats, leaving the two poles plus one equatorial atom — a capital T.",
      "Angles pinch slightly below 90° as the lone pairs lean on the axial bonds.",
      "Always polar.",
    ],
  },
  {
    id: "linear-5", name: "Linear (5 regions)", regions: 5, bonds: 2, lonePairs: 3,
    eGeo: "trigonal bipyramidal", angle: "180°",
    examples: ["XeF2", "I3-"],
    demo: { center: "Xe", outer: ["F", "F"] },
    coords: [[0, 1, 0], [0, -1, 0]],
    lpCoords: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]],
    facts: [
      "All three lone pairs ring the equator, pushing the two atoms straight through the poles: 180°.",
      "Looks identical to plain linear from the outside — only the electron count betrays the crowd at the waist.",
      "Nonpolar when both ends match (XeF2).",
    ],
  },
  {
    id: "octahedral", name: "Octahedral", regions: 6, bonds: 6, lonePairs: 0,
    eGeo: "octahedral", angle: "90°",
    examples: ["SF6"],
    demo: { center: "S", outer: ["F", "F", "F", "F", "F", "F"] },
    coords: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]],
    lpCoords: [],
    facts: [
      "Six identical seats, all 90° apart — the most symmetric shape in the catalog.",
      "Nonpolar when all six atoms match: every dipole has an exact opposite.",
      "Six bonds = seriously expanded octet (12 electrons) — row 3+ central atoms only.",
    ],
  },
  {
    id: "square-pyramidal", name: "Square pyramidal", regions: 6, bonds: 5, lonePairs: 1,
    eGeo: "octahedral", angle: "≈90°",
    examples: ["BrF5", "IF5"],
    demo: { center: "Br", outer: ["F", "F", "F", "F", "F"] },
    coords: [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]],
    lpCoords: [[0, -1, 0]],
    facts: [
      "An octahedron with one lone pair underneath — a square base with one atom on the roof.",
      "Always polar: the lone-pair side has no atom to answer the one on top.",
    ],
  },
  {
    id: "square-planar", name: "Square planar", regions: 6, bonds: 4, lonePairs: 2,
    eGeo: "octahedral", angle: "90°",
    examples: ["XeF4"],
    demo: { center: "Xe", outer: ["F", "F", "F", "F"] },
    coords: [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]],
    lpCoords: [[0, 1, 0], [0, -1, 0]],
    facts: [
      "The two lone pairs take opposite poles — never adjacent seats — leaving a perfectly flat square of atoms.",
      "Nonpolar when all four atoms match: the square cancels itself.",
      "The classic exam trap: 6 regions, but the ATOMS are flat. Count regions first, always.",
    ],
  },
];

export const GEO_BY_ID = Object.fromEntries(GEOMETRIES.map((g) => [g.id, g]));

// Group for the table: one row per electron geometry, lone pairs increasing.
export const GEO_GROUPS = [
  { label: "2 regions — linear", ids: ["linear-2"] },
  { label: "3 regions — trigonal planar", ids: ["trigonal-planar", "bent-3"] },
  { label: "4 regions — tetrahedral", ids: ["tetrahedral", "trigonal-pyramidal", "bent-4"] },
  { label: "5 regions — trigonal bipyramidal", ids: ["trigonal-bipyramidal", "seesaw", "t-shape", "linear-5"] },
  { label: "6 regions — octahedral", ids: ["octahedral", "square-pyramidal", "square-planar"] },
];

// Formula strings above use plain digits ("CO2"), trailing charges ("NO3-", "NH4+"),
// or caret charges ("SO4^2-"); render with proper sub/superscripts.
export function fmtFormula(s) {
  let core = s, charge = "";
  const m = s.match(/(?:\^(\d+[+-])|([+-]))$/);
  if (m) { charge = m[1] || m[2]; core = s.slice(0, -m[0].length); }
  const sub = core.replace(/(\d+)/g, "<sub>$1</sub>");
  return charge ? `${sub}<sup>${charge.replace("-", "−")}</sup>` : sub;
}
