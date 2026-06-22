// Tiny schematic Lewis structures for molecular bases. Pure — each value is an SVG string.
// The point is the LONE PAIR (two dots on N): that's the site that accepts an H⁺, so it's the
// visual clue for how many protons a molecular base can take. No bond lines — just letters and
// dots, kept deliberately clean. Marked class="lone-pair" so a test can confirm it's drawn.

const lonePair = (x, y) =>
  `<g class="lone-pair" fill="var(--plum-dark)">` +
  `<circle cx="${x - 5}" cy="${y}" r="2.7"/><circle cx="${x + 5}" cy="${y}" r="2.7"/></g>`;

const letter = (x, y, s, size = 21) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-display)" font-size="${size}" font-weight="700" fill="var(--ink)">${s}</text>`;

// "H₃C": H, a clearly-sized subscript 3 (not a tiny unicode glyph), then a full-size C —
// the dy steps down for the 3 and back up to the baseline for the C.
const h3c = (x, y) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-display)" font-size="21" font-weight="700" fill="var(--ink)">` +
  `H<tspan font-size="15" dy="5">3</tspan><tspan font-size="21" dy="-5">C</tspan></text>`;

// Ammonia: N, its lone pair, and three H. Letters and dots only.
const ammonia =
  `<svg class="lewis" viewBox="0 0 150 112" role="img" aria-label="Ammonia, NH3, with a lone pair on nitrogen">` +
  lonePair(75, 40) +
  letter(75, 68, "N") +
  letter(46, 94, "H") + letter(104, 94, "H") + letter(75, 100, "H") +
  `</svg>`;

// Methylamine: H₃C and N (with its two H and lone pair). Letters and dots only.
const methylamine =
  `<svg class="lewis" viewBox="0 0 210 112" role="img" aria-label="Methylamine, CH3NH2, with a lone pair on nitrogen">` +
  lonePair(126, 40) +
  h3c(60, 74) +
  letter(126, 74, "N") +
  letter(168, 74, "H") + letter(126, 102, "H") +
  `</svg>`;

export const STRUCTURES = { ammonia, methylamine };
