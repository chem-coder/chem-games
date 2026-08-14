/*
  Schematic figure renderer (pure — no DOM, no data imports).
  Five archetype drawings in one projection style, mirroring the cathode
  lattices' visual grammar (CSS-classed shapes, diffusion/motion arrows,
  caption strip that the quiz CSS hides):

    layers — long parallel graphene sheets with Li in the galleries and an
             arrow entering from the edge (graphite)
    house  — short graphene fragments at odd angles with Li between them
             and clustered in nanopores (hard carbon)
    spinel — TiO₆/Li checkerboard with arrows in three directions = 3D,
             barely-moving frame (LTO)
    alloy  — before/after particle pair: small pristine particle, arrow,
             swollen cracked particle (Si ~300 %; Sn ~260 % + Co–C matrix
             dots for the Nexelion story)
    metal  — flat Li slab with plating arrows and a dendrite spike growing
             toward a separator line (Li metal)

  Colors come from CSS (.fig-* classes) so the palette stays shared.
*/

const W = 320;
const H = 216;

function r(n) {
  return Math.round(n * 100) / 100;
}

/* Li ion */
function li(x, y, rad = 5.5, cls = "") {
  return `<circle class="fig-li ${cls}" cx="${x}" cy="${y}" r="${rad}"/>`;
}

/* TiO6 octahedron as an edge-sharing diamond */
function oct(x, y, s, cls = "fig-ti") {
  return `<polygon class="fig-oct ${cls}" points="${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}"/>`;
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
    `<polygon class="fig-arrowhead" points="${r(tx)},${r(ty)} ${r(tx - sx * h + px * w)},${r(ty - sy * h + py * w)} ${r(tx - sx * h - px * w)},${r(ty - sy * h - py * w)}"/>`;
  return (
    `<line class="fig-arrow" x1="${r(x1 + ux * h)}" y1="${r(y1 + uy * h)}" x2="${r(x2 - ux * h)}" y2="${r(y2 - uy * h)}"/>` +
    head(x2, y2, ux, uy) +
    (both ? head(x1, y1, -ux, -uy) : "")
  );
}

/* caption strip along the bottom */
function caption(text) {
  return `<text class="fig-caption" x="${W / 2}" y="${H - 8}" text-anchor="middle">${text}</text>`;
}

/* ---------------- layers archetype (graphite) ---------------- */

function layers() {
  const parts = [];
  // long parallel graphene sheets
  [38, 74, 110, 146].forEach((y) => {
    parts.push(`<line class="fig-sheet" x1="26" y1="${y}" x2="244" y2="${y}"/>`);
  });
  // Li filling the galleries
  [56, 92, 128].forEach((y) => {
    [54, 96, 138, 180, 222].forEach((x) => parts.push(li(x, y)));
  });
  // Li⁺ entering from the edge
  parts.push(li(296, 56, 5.5, "fig-li-in"));
  parts.push(arrow(302, 92, 258, 92, { both: false }));
  parts.push(`<text class="fig-label" x="290" y="122" text-anchor="middle">Li⁺</text>`);
  return (
    parts.join("") +
    caption("Graphene sheets · Li⁺ enters from the edge — stages 4→3→2→1 to gold LiC₆")
  );
}

/* ---------------- house archetype (hard carbon) ---------------- */

function house() {
  const parts = [];
  // short graphene fragments at odd angles — the "house of cards"
  const frags = [
    [30, 60, 80, 48], [95, 40, 150, 52], [170, 45, 215, 32], [235, 50, 285, 62],
    [45, 95, 100, 108], [120, 90, 165, 78], [185, 95, 240, 88], [255, 100, 295, 90],
    [35, 140, 85, 128], [105, 150, 160, 140], [180, 135, 230, 150], [250, 140, 295, 128],
    [60, 175, 115, 168], [140, 180, 190, 170], [215, 175, 265, 182],
  ];
  frags.forEach(([x1, y1, x2, y2]) =>
    parts.push(`<line class="fig-frag" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
  );
  // Li between fragments…
  [[88, 72], [200, 62], [268, 76], [62, 118], [275, 115], [95, 158], [205, 162]].forEach(
    ([x, y]) => parts.push(li(x, y))
  );
  // …and clustered in nanopores
  [[132, 112], [146, 120], [129, 125], [224, 112], [237, 118]].forEach(([x, y]) =>
    parts.push(li(x, y, 5, "fig-li-pore"))
  );
  return (
    parts.join("") +
    caption("'House of cards' — short fragments · Li between layers and filling nanopores")
  );
}

/* ---------------- spinel archetype (LTO) ---------------- */

function spinel() {
  const parts = [];
  const s = 15;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 40 + 60 * col;
      const y = 36 + 42 * row;
      if ((row + col) % 2 === 0) parts.push(oct(x, y, s));
      else parts.push(li(x, y));
    }
  }
  // three directions = 3D network
  parts.push(arrow(96, 183, 224, 183));
  parts.push(arrow(288, 40, 288, 160));
  parts.push(arrow(58, 168, 130, 96));
  return (
    parts.join("") +
    caption("TiO₆ spinel frame · 3D Li channels — flat 1.55 V, <0.2 % strain")
  );
}

/* ---------------- alloy archetype (Si, Sn) ---------------- */

function alloy(cardId) {
  const parts = [];
  const sn = cardId === "sn";
  // pristine particle
  parts.push(`<circle class="fig-particle" cx="64" cy="92" r="30"/>`);
  parts.push(`<text class="fig-el" x="64" y="97" text-anchor="middle">${sn ? "Sn" : "Si"}</text>`);
  // + Li⁺
  parts.push(arrow(104, 92, 152, 92, { both: false }));
  parts.push(`<text class="fig-label" x="128" y="76" text-anchor="middle">+ Li⁺</text>`);
  // swollen, cracked particle (Si ~300 %, Sn ~260 % — slightly smaller)
  const R = sn ? 48 : 54;
  const cx = sn ? 228 : 232;
  parts.push(`<circle class="fig-particle fig-swollen" cx="${cx}" cy="92" r="${R}"/>`);
  const cracks = sn
    ? ["228,44 222,62 230,76", "186,110 202,102 214,98"]
    : ["232,38 226,58 236,74", "180,80 200,88 214,96", "268,134 256,118 246,104"];
  cracks.forEach((pts) => parts.push(`<polyline class="fig-crack" points="${pts}"/>`));
  if (sn) {
    // inactive Co–C matrix dots (Nexelion)
    [[210, 70], [244, 66], [256, 92], [238, 110], [212, 116], [226, 88], [248, 122], [220, 132]].forEach(
      ([x, y]) => parts.push(`<circle class="fig-matrix" cx="${x}" cy="${y}" r="2.6"/>`)
    );
  }
  parts.push(
    `<text class="fig-el" x="${cx}" y="${sn ? 158 : 164}" text-anchor="middle">${sn ? "Li₄.₄Sn" : "Li₁₅Si₄"}</text>`
  );
  return (
    parts.join("") +
    caption(
      sn
        ? "Alloying: Sn → Li₄.₄Sn · ~260 % swelling — Co–C matrix dots cushion it (Nexelion)"
        : "Alloying: Si → Li₁₅Si₄ · ~300 % swelling — the particle and its SEI crack"
    )
  );
}

/* ---------------- metal archetype (Li metal) ---------------- */

function metal() {
  const parts = [];
  // separator line up top
  parts.push(`<line class="fig-sep" x1="28" y1="34" x2="292" y2="34"/>`);
  parts.push(`<text class="fig-label" x="290" y="24" text-anchor="end">separator</text>`);
  // the bare Li slab
  parts.push(`<rect class="fig-slab" x="28" y="142" width="264" height="44" rx="4"/>`);
  parts.push(`<text class="fig-el" x="160" y="170" text-anchor="middle">Li metal</text>`);
  // Li⁺ plating straight onto the slab
  parts.push(li(70, 58));
  parts.push(arrow(70, 72, 70, 132, { both: false }));
  parts.push(li(240, 68));
  parts.push(arrow(240, 82, 240, 132, { both: false }));
  // dendrite reaching for the separator
  parts.push(`<polyline class="fig-dendrite" points="150,142 158,116 148,96 160,72 154,48"/>`);
  return (
    parts.join("") +
    caption("No host — Li⁺ plates straight onto the slab; a dendrite grows toward the separator")
  );
}

/**
 * Render one card's figure as an SVG string.
 * opts: { className, aria } — aria becomes the accessible name.
 */
export function figSvg(card, opts = {}) {
  const draw = { layers, house, spinel, alloy, metal }[card.fig.kind];
  const body = draw(card.id);
  const aria = opts.aria ? ` role="img" aria-label="${opts.aria}"` : ` aria-hidden="true"`;
  return `<svg class="mol fig${opts.className ? " " + opts.className : ""}" viewBox="0 0 ${W} ${H}"${aria} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
