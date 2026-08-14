/*
  Skeletal-structure SVG renderer (pure — no DOM, no data imports).
  Draws literature-style zig-zag structures from the mol format described in
  data/cards.js: unlabeled vertices are carbons, heteroatoms carry labels,
  double bonds render as parallel pairs, wedge/hash bonds for 3D centers.
  Colors and fonts come from CSS classes (.mol, .bond, .at-*) so the drawing
  follows the shared palette.
*/

const DOUBLE_GAP = 2.7;   // half-gap of symmetric double bonds
const RING_OFFSET = 4.6;  // offset of the short inner line of ring doubles

function trimmedSegment(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ta = a.trim || 0;
  const tb = b.trim || 0;
  return {
    x1: a.x + ux * ta, y1: a.y + uy * ta,
    x2: b.x - ux * tb, y2: b.y - uy * tb,
    ux, uy,
    px: -uy, py: ux, // unit perpendicular
  };
}

function line(x1, y1, x2, y2, cls = "bond") {
  return `<line class="${cls}" x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}"/>`;
}

function r(n) {
  return Math.round(n * 100) / 100;
}

function drawBond(a, b, order, opts = {}) {
  const s = trimmedSegment(a, b);
  if (opts.kind === "wedge") {
    const w = 4.4; // half-width at the wide end
    return `<polygon class="wedge" points="${r(s.x1)},${r(s.y1)} ${r(s.x2 + s.px * w)},${r(s.y2 + s.py * w)} ${r(s.x2 - s.px * w)},${r(s.y2 - s.py * w)}"/>`;
  }
  if (opts.kind === "hash") {
    const strokes = [];
    const n = 5;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.35);
      const cx = s.x1 + (s.x2 - s.x1) * t;
      const cy = s.y1 + (s.y2 - s.y1) * t;
      const w = 1.6 + 3.1 * t; // grows toward the far end, like a squashed wedge
      strokes.push(line(cx - s.px * w, cy - s.py * w, cx + s.px * w, cy + s.py * w, "bond hash"));
    }
    return strokes.join("");
  }
  if (order === 2 && opts.style === "sym") {
    return (
      line(s.x1 + s.px * DOUBLE_GAP, s.y1 + s.py * DOUBLE_GAP, s.x2 + s.px * DOUBLE_GAP, s.y2 + s.py * DOUBLE_GAP) +
      line(s.x1 - s.px * DOUBLE_GAP, s.y1 - s.py * DOUBLE_GAP, s.x2 - s.px * DOUBLE_GAP, s.y2 - s.py * DOUBLE_GAP)
    );
  }
  if (order === 2) {
    // ring-style double: full main line + a shorter parallel line to one side
    const side = opts.side || 1;
    const ox = s.px * RING_OFFSET * side;
    const oy = s.py * RING_OFFSET * side;
    const shrink = 0.16;
    const ix1 = s.x1 + (s.x2 - s.x1) * shrink + ox;
    const iy1 = s.y1 + (s.y2 - s.y1) * shrink + oy;
    const ix2 = s.x2 - (s.x2 - s.x1) * shrink + ox;
    const iy2 = s.y2 - (s.y2 - s.y1) * shrink + oy;
    return line(s.x1, s.y1, s.x2, s.y2) + line(ix1, iy1, ix2, iy2);
  }
  return line(s.x1, s.y1, s.x2, s.y2);
}

/* Element class for coloring: single-element labels get .at-<El>; group
   labels (CF3, F3C) stay in carbon ink. */
function labelClass(label) {
  const m = label.match(/^([A-Z][a-z]?)$/);
  return m ? `at at-${m[1]}` : "at";
}

/* Break a label like "F3C" into tspans: digits become subscripts (house
   rule: >=50% size, slightly lowered). */
function labelTspans(label) {
  return label
    .split(/(\d+)/)
    .filter(Boolean)
    .map((seg) =>
      /^\d+$/.test(seg)
        ? `<tspan class="at-sub" dy="3.5">${seg}</tspan><tspan dy="-3.5">​</tspan>`
        : `<tspan>${seg}</tspan>`
    )
    .join("");
}

function drawAtom(a) {
  if (!a.label) return "";
  const cls = labelClass(a.label);
  const charge = a.charge
    ? `<tspan class="at-charge" dy="-6">${a.charge === "-" ? "−" : "+"}</tspan>`
    : "";
  return `<text class="${cls}" x="${r(a.x)}" y="${r(a.y)}" text-anchor="middle" dominant-baseline="central">${labelTspans(a.label)}${charge}</text>`;
}

/**
 * Render one molecule as an SVG string.
 * opts: { className, aria } — aria becomes the accessible name.
 */
export function molSvg(mol, opts = {}) {
  const pad = 24;
  const xs = mol.atoms.map((a) => a.x);
  const ys = mol.atoms.map((a) => a.y);
  let minX = Math.min(...xs) - pad;
  let maxX = Math.max(...xs) + pad;
  let minY = Math.min(...ys) - pad;
  let maxY = Math.max(...ys) + pad;

  const parts = [];
  for (const [ai, bi, order, o] of mol.bonds) {
    parts.push(drawBond(mol.atoms[ai], mol.atoms[bi], order, o));
  }
  for (const a of mol.atoms) {
    parts.push(drawAtom(a));
  }

  if (mol.counterion) {
    minX -= 8;
    minY -= 12;
    const ion = mol.counterion.replace(/\+$/, "");
    parts.push(
      `<text class="at counterion" x="${r(minX + 6)}" y="${r(minY + 16)}" text-anchor="start">${ion}<tspan class="at-charge" dy="-6">+</tspan></text>`
    );
  }

  const aria = opts.aria ? ` role="img" aria-label="${opts.aria}"` : ` aria-hidden="true"`;
  return `<svg class="mol${opts.className ? " " + opts.className : ""}" viewBox="${r(minX)} ${r(minY)} ${r(maxX - minX)} ${r(maxY - minY)}"${aria} xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
}

export const _internals = { trimmedSegment, labelTspans, labelClass };
