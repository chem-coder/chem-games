// Tiny schematic Lewis structures for molecular bases. Pure — each value is an SVG string.
// The point is the LONE PAIR (two dots on N): that's the site that accepts an H⁺, so it's the
// visual clue for how many protons a molecular base can take. Marked class="lone-pair" so a test
// can confirm it's drawn.

const lonePair = (x, y) =>
  `<g class="lone-pair" fill="var(--plum-dark)">` +
  `<circle cx="${x - 4}" cy="${y}" r="2.4"/><circle cx="${x + 4}" cy="${y}" r="2.4"/></g>`;

const atom = (x, y, label, sub = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-display)" font-size="18" font-weight="700" fill="var(--ink)">${label}<tspan font-size="12" dy="4">${sub}</tspan></text>`;

const bond = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--ink)" stroke-width="1.6"/>`;

// Ammonia: N with three H and one lone pair (accepts 1 H⁺).
const ammonia =
  `<svg class="lewis" viewBox="0 0 150 110" role="img" aria-label="Ammonia, NH3, with a lone pair on nitrogen">` +
  lonePair(75, 26) +
  bond(75, 34, 45, 70) + bond(75, 34, 105, 70) + bond(75, 40, 75, 84) +
  atom(75, 52, "N") +
  atom(36, 80, "H") + atom(114, 80, "H") + atom(75, 98, "H") +
  `</svg>`;

// Methylamine: a methyl group on N, two H, one lone pair (also accepts 1 H⁺).
const methylamine =
  `<svg class="lewis" viewBox="0 0 200 110" role="img" aria-label="Methylamine, CH3NH2, with a lone pair on nitrogen">` +
  lonePair(118, 26) +
  bond(64, 56, 104, 56) +
  bond(118, 40, 118, 84) + bond(126, 50, 156, 78) +
  atom(40, 62, "H", "₃C") +
  atom(118, 52, "N") +
  atom(118, 98, "H") + atom(166, 84, "H") +
  `</svg>`;

export const STRUCTURES = { ammonia, methylamine };
