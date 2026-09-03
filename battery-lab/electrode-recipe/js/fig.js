/*
  Electrode Recipe — schematic figures for the non-molecular cards
  (pure — no DOM). Same visual grammar as the other Battery Lab figure
  renderers: 320×216 viewBox, CSS-classed shapes, caption strip that the
  stylesheet hides inside .quiz-fig.
  Kinds: carbonblack (bead-chain percolation), cnt (wire percolation),
  foil (cu | al collector stack).
*/

const W = 320;
const H = 216;

function r(n) {
  return Math.round(n * 100) / 100;
}

function circle(x, y, rad, cls) {
  return `<circle class="${cls}" cx="${r(x)}" cy="${r(y)}" r="${r(rad)}"/>`;
}

function caption(text) {
  return `<text class="fig-caption" x="${W / 2}" y="${H - 8}" text-anchor="middle">${text}</text>`;
}

/* two active-material grains that both carbon figures must bridge */
function grains() {
  return circle(72, 100, 44, "fig-active") + circle(248, 100, 44, "fig-active");
}

function carbonblack() {
  // a chain of beads arcing between the grains + a stray cluster
  const beads = [];
  const chain = [
    [116, 92], [130, 82], [145, 76], [160, 74], [175, 76], [190, 82], [204, 92],
  ];
  for (const [x, y] of chain) beads.push(circle(x, y, 7, "fig-cb"));
  // a second, lower chain with a gap — point contacts are fragile
  const chain2 = [[118, 122], [133, 130], [149, 134], [180, 134], [196, 130], [202, 122]];
  for (const [x, y] of chain2) beads.push(circle(x, y, 7, "fig-cb"));
  const cluster = [[46, 34], [58, 28], [52, 42], [66, 38]];
  for (const [x, y] of cluster) beads.push(circle(x, y, 7, "fig-cb"));
  return (
    grains() +
    beads.join("") +
    caption("~40 nm beads · point-contact chains bridge the grains — a few percent to percolate")
  );
}

function cnt() {
  // long thin wires threading around and between the grains
  const wires = [
    `<path class="fig-cnt" d="M 20 60 C 90 20, 190 30, 300 78"/>`,
    `<path class="fig-cnt" d="M 16 128 C 110 168, 200 158, 304 108"/>`,
    `<path class="fig-cnt" d="M 60 176 C 140 120, 220 60, 296 40"/>`,
  ];
  return (
    grains() +
    wires.join("") +
    caption("μm-long wires · network connectivity at a tenth of carbon black's dose")
  );
}

function foil(variant) {
  const foilCls = variant === "cu" ? "fig-foil-cu" : "fig-foil-al";
  const label = variant === "cu" ? "Cu" : "Al";
  // coating slab of particles sitting on the foil
  const parts = [
    `<rect class="fig-coating" x="30" y="52" width="260" height="98" rx="8"/>`,
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      parts.push(circle(66 + i * 64, 82 + j * 40, 17, "fig-active"));
    }
  }
  parts.push(`<rect class="${foilCls}" x="22" y="152" width="276" height="14" rx="3"/>`);
  parts.push(`<text class="fig-foil-label" x="34" y="178" text-anchor="start">${label} foil</text>`);
  const cap =
    variant === "cu"
      ? "the anode's floor: no Li alloying at 0 V — but heavy, and soluble on overdischarge"
      : "the cathode's floor: alive at 4 V by Al₂O₃/AlF₃ armor alone";
  return parts.join("") + caption(cap);
}

/**
 * Render one card's figure as an SVG string.
 * opts: { className, aria } — aria becomes the accessible name.
 */
export function figSvg(card, opts = {}) {
  const f = card.fig;
  const body = f.kind === "carbonblack" ? carbonblack() : f.kind === "cnt" ? cnt() : foil(f.variant);
  const aria = opts.aria ? ` role="img" aria-label="${opts.aria}"` : ` aria-hidden="true"`;
  return `<svg class="mol figrec${opts.className ? " " + opts.className : ""}" viewBox="0 0 ${W} ${H}"${aria} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
