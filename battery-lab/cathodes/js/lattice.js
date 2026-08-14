/*
  Schematic lattice renderer (pure — no DOM, no data imports).
  Three archetype drawings in one projection style:

    layered — slabs of edge-sharing MO₆ octahedra (diamonds) with flat Li
              planes between; double-headed arrows + ⊙ (out of page) = 2D
    spinel  — interpenetrating octahedra/Li checkerboard; arrows in three
              directions = 3D
    olivine — octahedra walls braced by PO₄ triangles around a single Li
              channel; one arrow = 1D

  Per-card overlays (chosen by card id): NMC three-tone slab + Ni in the Li
  plane, NCA aluminum pin, LMR excess Li inside the slab, LNMO 1-in-4 Ni,
  LFP antisite defect plugging the channel, LMFP two-tone Mn/Fe.
  Colors come from CSS (.lat-* classes) so the palette stays shared.
*/

const W = 320;
const H = 216;

function r(n) {
  return Math.round(n * 100) / 100;
}

/* MO6 octahedron as an edge-sharing diamond */
function oct(x, y, s, cls) {
  return `<polygon class="lat-oct ${cls}" points="${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}"/>`;
}

/* Li ion */
function li(x, y, rad = 5.5, cls = "") {
  return `<circle class="lat-li ${cls}" cx="${x}" cy="${y}" r="${rad}"/>`;
}

/* PO4 tetrahedron as a triangle (dir 1 = pointing down, -1 = up) */
function tet(x, y, s, dir = 1) {
  return `<polygon class="lat-tet" points="${x - s},${y - dir * s * 0.85} ${x + s},${y - dir * s * 0.85} ${x},${y + dir * s}"/>`;
}

/* arrow with optional heads on both ends */
function arrow(x1, y1, x2, y2, { both = true } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const h = 7; // head length
  const w = 4.5; // head half width
  const head = (tx, ty, sx, sy) =>
    `<polygon class="lat-arrowhead" points="${r(tx)},${r(ty)} ${r(tx - sx * h + px * w)},${r(ty - sy * h + py * w)} ${r(tx - sx * h - px * w)},${r(ty - sy * h - py * w)}"/>`;
  return (
    `<line class="lat-arrow" x1="${r(x1 + ux * h)}" y1="${r(y1 + uy * h)}" x2="${r(x2 - ux * h)}" y2="${r(y2 - uy * h)}"/>` +
    head(x2, y2, ux, uy) +
    (both ? head(x1, y1, -ux, -uy) : "")
  );
}

/* ⊙ — "and out of the page" (crystallography convention) */
function outOfPage(x, y) {
  return `<circle class="lat-oop" cx="${x}" cy="${y}" r="6"/><circle class="lat-oop-dot" cx="${x}" cy="${y}" r="1.6"/>`;
}

/* caption strip along the bottom */
function caption(text) {
  return `<text class="lat-caption" x="${W / 2}" y="${H - 8}" text-anchor="middle">${text}</text>`;
}

/* ---------------- layered archetype ---------------- */

function layered(cardId) {
  const parts = [];
  const s = 16;
  const slabY = [36, 101, 166];
  const liY = [68.5, 133.5];

  const slabCls = (slab, k) => {
    if (cardId === "nmc") return ["lat-ni", "lat-mn", "lat-co"][k % 3];
    if (cardId === "nca") {
      if (slab === 1 && k === 4) return "lat-al";
      return k % 5 === 2 ? "lat-co" : "lat-ni";
    }
    if (cardId === "lmr") return "lat-mn";
    return "lat-co";
  };

  slabY.forEach((y, slab) => {
    for (let k = 0; k < 9; k++) {
      const x = 28 + 32 * k;
      // LMR: excess Li sits inside the transition-metal slab (honeycomb hint)
      if (cardId === "lmr" && slab === 1 && (k === 2 || k === 6)) {
        parts.push(li(x, y, 6, "lat-li-inslab"));
      } else {
        parts.push(oct(x, y, s, slabCls(slab, k)));
      }
    }
  });

  liY.forEach((y, row) => {
    for (let k = 0; k < 6; k++) {
      const x = 44 + 32 * k;
      // NMC: one Ni sitting in the Li plane = cation mixing
      if (cardId === "nmc" && row === 0 && k === 3) {
        parts.push(li(x, y, 6, "lat-ni-ball"));
      } else {
        parts.push(li(x, y));
      }
    }
    parts.push(arrow(228, y, 288, y));
    parts.push(outOfPage(304, y));
  });

  const capts = {
    lco: "CoO₆ slabs · Li⁺ between — moves in 2D planes",
    nmc: "Ni/Mn/Co slabs · one Ni in the Li plane (cation mixing) · 2D",
    nca: "Ni-rich slabs · Al octahedron pins the lattice · 2D",
    lmr: "Mn-rich slabs with excess Li inside them · 2D",
  };
  return parts.join("") + caption(capts[cardId] || "MO₆ slabs · 2D Li planes");
}

/* ---------------- spinel archetype ---------------- */

function spinel(cardId) {
  const parts = [];
  const s = 15;
  let octCount = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 40 + 60 * col;
      const y = 36 + 42 * row;
      if ((row + col) % 2 === 0) {
        // LNMO: one in four octahedra is Ni
        const cls = cardId === "lnmo" && octCount % 4 === 1 ? "lat-ni" : "lat-mn";
        parts.push(oct(x, y, s, cls));
        octCount += 1;
      } else {
        parts.push(li(x, y));
      }
    }
  }
  // three directions = 3D network
  parts.push(arrow(96, 183, 224, 183));
  parts.push(arrow(288, 40, 288, 160));
  parts.push(arrow(58, 168, 130, 96));

  const capts = {
    lmo: "MnO₆ framework · Li⁺ on 8a sites — 3D channel network",
    lnmo: "1 in 4 octahedra Ni · same 3D 8a–16c channels",
  };
  return parts.join("") + caption(capts[cardId] || "Spinel framework · 3D channels");
}

/* ---------------- olivine archetype ---------------- */

function olivine(cardId) {
  const parts = [];
  const s = 14;
  const octY = [34, 152];
  const tetY = [62, 124];
  const chanY = 93;

  const octCls = (k) => {
    if (cardId === "lmfp") return k % 2 ? "lat-fe" : "lat-mn";
    return "lat-fe";
  };

  octY.forEach((y) => {
    for (let k = 0; k < 9; k++) parts.push(oct(28 + 32 * k, y, s, octCls(k)));
  });
  tetY.forEach((y, row) => {
    for (let k = 0; k < 8; k++) parts.push(tet(44 + 32 * k, y, 8.5, row === 0 ? 1 : -1));
  });

  // the single 1D channel
  for (let k = 0; k < 3; k++) parts.push(li(40 + 34 * k, chanY));
  if (cardId === "lfp") {
    // antisite defect: an Fe on a Li site plugs the channel
    parts.push(arrow(126, chanY, 204, chanY, { both: false }));
    parts.push(oct(224, chanY, 9.5, "lat-fe lat-antisite"));
    parts.push(`<text class="lat-x" x="224" y="${chanY - 16}" text-anchor="middle">blocked</text>`);
  } else {
    parts.push(arrow(126, chanY, 288, chanY));
  }

  const capts = {
    lfp: "FeO₆ + PO₄ pillars · one 1D Li tunnel — a defect blocks it",
    lmfp: "Mn/Fe octahedra + PO₄ pillars · same 1D Li tunnels",
  };
  return parts.join("") + caption(capts[cardId] || "Olivine · 1D Li tunnels");
}

/**
 * Render one card's lattice as an SVG string.
 * opts: { className, aria } — aria becomes the accessible name.
 */
export function latticeSvg(card, opts = {}) {
  const draw = { layered, spinel, olivine }[card.lattice.kind];
  const body = draw(card.id);
  const aria = opts.aria ? ` role="img" aria-label="${opts.aria}"` : ` aria-hidden="true"`;
  return `<svg class="mol lattice${opts.className ? " " + opts.className : ""}" viewBox="0 0 ${W} ${H}"${aria} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
