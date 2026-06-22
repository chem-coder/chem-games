// Schematic Lewis structures for molecular bases. Pure SVG strings (no DOM).
//
// Design rules (from Dalia's spec):
//  - A lone pair is two dots sitting ON the nitrogen (class "lone-pair" so a test can find it).
//  - Bonds are SHORT: only the middle ~30% of the atom-center-to-atom-center line is drawn
//    (15% each side of the midpoint), in the brand green, a touch thick — so there's a clear gap
//    to each atom and the N–N bond reads as a bond, not a zig-zag.
//  - 3D where it helps: a pyramidal N is drawn with one in-plane line, one solid WEDGE (toward
//    the viewer) and one hashed DASH (into the page).

const GREEN = "var(--accent)";
const INK = "var(--ink)";
const PLUM = "var(--plum-dark)";

// Place a letter centred on the atom point (cx, cy) — baseline sits ~7px below so the glyph
// straddles the point, which is what the bond geometry assumes.
const atom = (cx, cy, s, size = 21) =>
  `<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="var(--font-display)" font-size="${size}" font-weight="700" fill="${INK}">${s}</text>`;

// Two dots centred at (x, y). Put them just at the atom's edge so they read as "on" it.
const dots = (x, y) =>
  `<g class="lone-pair" fill="${PLUM}"><circle cx="${x - 5}" cy="${y}" r="2.7"/><circle cx="${x + 5}" cy="${y}" r="2.7"/></g>`;

// The middle-30% segment of the A→B line; .a end is toward the stereocentre, .b toward substituent.
function seg(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L, px = -uy, py = ux, h = 0.15 * L;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  return { ax: mx - ux * h, ay: my - uy * h, bx: mx + ux * h, by: my + uy * h, px, py };
}
const f = (n) => n.toFixed(1);

// style: "plain" | "wedge" | "dash". wedge/dash narrow at A (the N) and widen toward B.
function bond(ax, ay, bx, by, style = "plain") {
  const s = seg(ax, ay, bx, by);
  if (style === "wedge") {
    const w = 4.2;
    return `<polygon points="${f(s.ax)},${f(s.ay)} ${f(s.bx + s.px * w)},${f(s.by + s.py * w)} ${f(s.bx - s.px * w)},${f(s.by - s.py * w)}" fill="${GREEN}"/>`;
  }
  if (style === "dash") {
    let out = "";
    const n = 4;
    for (let i = 0; i < n; i += 1) {
      const t = i / (n - 1);
      const cx = s.ax + (s.bx - s.ax) * t, cy = s.ay + (s.by - s.ay) * t, hw = 1.3 + t * 3.2;
      out += `<line x1="${f(cx + s.px * hw)}" y1="${f(cy + s.py * hw)}" x2="${f(cx - s.px * hw)}" y2="${f(cy - s.py * hw)}" stroke="${GREEN}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    return out;
  }
  return `<line x1="${f(s.ax)}" y1="${f(s.ay)}" x2="${f(s.bx)}" y2="${f(s.by)}" stroke="${GREEN}" stroke-width="2.6" stroke-linecap="round"/>`;
}

const svg = (body) => `<svg class="lewis" viewBox="0 0 210 150" role="img">${body}</svg>`;

// Ammonia: pyramidal N, three H — in-plane (left) / wedge (middle) / dash (right) — lone pair on top.
const ammonia = svg(
  bond(105, 60, 72, 102, "plain") +
  bond(105, 60, 105, 116, "wedge") +
  bond(105, 60, 138, 102, "dash") +
  atom(72, 102, "H") + atom(105, 116, "H") + atom(138, 102, "H") +
  atom(105, 60, "N") +
  dots(105, 45)
);

// Methylamine: N bonded to a methyl C (in-plane), two H (wedge / dash), one lone pair on top.
const methylamine = svg(
  bond(120, 60, 76, 102, "plain") +
  bond(120, 60, 120, 116, "wedge") +
  bond(120, 60, 152, 102, "dash") +
  `<text x="${67}" y="${109}" text-anchor="end" font-family="var(--font-display)" font-size="21" font-weight="700" fill="${INK}">H<tspan font-size="15" dy="5">3</tspan></text>` +
  atom(76, 102, "C") + atom(120, 116, "H") + atom(152, 102, "H") +
  atom(120, 60, "N") +
  dots(120, 45)
);

// Hydrazine: two pyramidal N joined by an in-plane N–N bond; each N has two H (wedge / dash) and a
// lone pair — placed TRANS (below the left N, above the right N), each sitting on its own N.
const hydrazine = svg(
  bond(80, 74, 130, 74, "plain") + // the N–N bond
  bond(80, 74, 52, 50, "wedge") + bond(80, 74, 88, 42, "dash") +
  bond(130, 74, 158, 98, "wedge") + bond(130, 74, 122, 106, "dash") +
  atom(52, 50, "H") + atom(88, 42, "H") + atom(158, 98, "H") + atom(122, 106, "H") +
  atom(80, 74, "N") + atom(130, 74, "N") +
  dots(80, 92) + dots(130, 56)
);

export const STRUCTURES = { ammonia, methylamine, hydrazine };
