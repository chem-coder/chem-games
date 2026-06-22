// Tiny schematic Lewis structures for molecular bases. Pure — each value is an SVG string.
// The point is the LONE PAIR (two dots on N): that's the site that accepts an H⁺, so it's the
// visual clue for how many protons a molecular base can take. No bond lines — just letters and
// dots. Marked class="lone-pair" so a test can confirm it's drawn.
//
// Methylamine reuses ammonia's exact trigonal-pyramidal geometry: the carbon sits where NH₃'s
// leftmost H is, with the methyl H₃ tucked to its left. Same shape, one H swapped for CH₃.

const lonePair = (x, y) =>
  `<g class="lone-pair" fill="var(--plum-dark)">` +
  `<circle cx="${x - 5}" cy="${y}" r="2.7"/><circle cx="${x + 5}" cy="${y}" r="2.7"/></g>`;

const letter = (x, y, s, size = 21) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-display)" font-size="${size}" font-weight="700" fill="var(--ink)">${s}</text>`;

// Trigonal-pyramidal template positions (shared by both molecules).
const N_X = 75, N_Y = 68;
const LP_Y = 40;            // lone pair, just above N
const H_LEFT = [46, 94];    // ← ammonia's leftmost H; becomes the methyl carbon in methylamine
const H_RIGHT = [104, 94];
const H_BOTTOM = [75, 100];

// Ammonia: N, its lone pair, and three H.
const ammonia =
  `<svg class="lewis" viewBox="0 0 150 112" role="img" aria-label="Ammonia, NH3, with a lone pair on nitrogen">` +
  lonePair(N_X, LP_Y) +
  letter(N_X, N_Y, "N") +
  letter(H_LEFT[0], H_LEFT[1], "H") + letter(H_RIGHT[0], H_RIGHT[1], "H") + letter(H_BOTTOM[0], H_BOTTOM[1], "H") +
  `</svg>`;

// Methylamine: identical geometry, but the leftmost H is replaced by a methyl group — the carbon
// sits exactly at H_LEFT, with "H₃" (subscript 3, full-size C) tucked to its left.
const methylamine =
  `<svg class="lewis" viewBox="0 0 150 112" role="img" aria-label="Methylamine, CH3NH2, with a lone pair on nitrogen">` +
  lonePair(N_X, LP_Y) +
  letter(N_X, N_Y, "N") +
  `<text x="${H_LEFT[0] - 12}" y="${H_LEFT[1]}" text-anchor="end" font-family="var(--font-display)" font-size="21" font-weight="700" fill="var(--ink)">H<tspan font-size="15" dy="5">3</tspan></text>` +
  letter(H_LEFT[0], H_LEFT[1], "C") +
  letter(H_RIGHT[0], H_RIGHT[1], "H") + letter(H_BOTTOM[0], H_BOTTOM[1], "H") +
  `</svg>`;

export const STRUCTURES = { ammonia, methylamine };
