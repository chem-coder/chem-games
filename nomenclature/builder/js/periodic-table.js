// Compact periodic table (periods 2–6) for the ionic intros — a memory aid that highlights the
// metals that matter and labels each with its charge (Type I) or its possible oxidation states
// (Type II). Pure SVG string, no DOM. Adapted from acid-base-sorter/js/periodic-table.js.

// Periods 2–6 of the standard 18-column layout (period 1 = H/He dropped; no metals there).
// null = empty cell, drawn faint for context so the shape still reads as the periodic table.
const MAIN = [
  ["Li", "Be", null, null, null, null, null, null, null, null, null, null, "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", null, null, null, null, null, null, null, null, null, null, "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
  ["Cs", "Ba", null, "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"]
];

const CELL = 40;
const FS = 14; // symbol

// Charge/state labels: short ones (Type I charges) are big and bold — they're the thing to learn;
// long state lists (Type II) shrink to fit the cell.
function labelFont(lab) {
  if (lab.length <= 2) return 15; // "2+", "+"
  if (lab.length <= 3) return 12; // "2,3"
  return 9; //                       "2,3,4,7"
}

function symText(x, y, sym, color, weight, hasLabel) {
  const cy = hasLabel ? y + CELL * 0.43 : y + CELL / 2 + FS * 0.35;
  return `<text x="${x + CELL / 2}" y="${cy}" text-anchor="middle" font-size="${FS}" font-weight="${weight}" fill="${color}" font-family="var(--font-display)">${sym}</text>`;
}

function labelText(x, y, lab, color) {
  return `<text x="${x + CELL / 2}" y="${y + CELL * 0.84}" text-anchor="middle" font-size="${labelFont(lab)}" font-weight="800" fill="${color}" font-family="var(--font-display)">${lab}</text>`;
}

// Multiple oxidation states laid out as a small shape under the symbol (house rule: always show
// the sign, never a comma list). 2 → a line, 3 → inverted triangle, 4 → a 2×2 square.
function statesLayout(x, y, states, color) {
  const cx = x + CELL / 2;
  const L = x + CELL * 0.31, R = x + CELL * 0.69;     // two-column x's
  const hi = y + CELL * 0.71, lo = y + CELL * 0.93, mid = y + CELL * 0.85; // rows
  const t = (px, py, n) => `<text x="${px}" y="${py}" text-anchor="middle" font-size="8.5" font-weight="800" fill="${color}" font-family="var(--font-display)">+${n}</text>`;
  const s = states;
  if (s.length === 1) return t(cx, mid, s[0]);
  if (s.length === 2) return t(L, mid, s[0]) + t(R, mid, s[1]);
  if (s.length === 3) return t(L, hi, s[0]) + t(R, hi, s[1]) + t(cx, lo, s[2]);
  return t(L, hi, s[0]) + t(R, hi, s[1]) + t(L, lo, s[2]) + t(R, lo, s[3]); // 4
}

function cell(sym, r, c, highlight, palette, labels) {
  if (!sym) return "";
  const x = c * CELL;
  const y = r * CELL;
  const w = CELL - 2;
  const ix = x + 1;
  const iy = y + 1;
  const cat = highlight[sym];
  const lab = labels[sym];

  if (!cat) {
    // faint context cell — just the outline + a muted symbol
    return `<rect x="${ix}" y="${iy}" width="${w}" height="${w}" rx="4" fill="var(--surface)" stroke="var(--line)" stroke-width="1"/>` +
      symText(x, y, sym, "var(--muted)", 500, false);
  }
  const co = palette[cat];
  const labelSvg = Array.isArray(lab) ? statesLayout(x, y, lab, co.text) : lab ? labelText(x, y, lab, co.text) : "";
  return `<rect x="${ix}" y="${iy}" width="${w}" height="${w}" rx="4" fill="${co.fill}" stroke="${co.stroke}" stroke-width="1.6"/>` +
    symText(x, y, sym, co.text, 800, !!labelSvg) +
    labelSvg;
}

// highlight: { symbol: categoryId }. palette: { categoryId: { fill, stroke, text } }.
// labels: { symbol: "2+" | "2,3" } drawn small under the symbol.
export function renderMetalsTable(highlight = {}, palette = {}, labels = {}) {
  let cells = "";
  MAIN.forEach((row, r) => row.forEach((sym, c) => (cells += cell(sym, r, c, highlight, palette, labels))));
  const w = 18 * CELL + 2;
  const h = MAIN.length * CELL + 2;
  return `<svg class="ptable" viewBox="0 0 ${w} ${h}" role="img" aria-label="Periodic table highlighting the relevant metals and their charges">${cells}</svg>`;
}
