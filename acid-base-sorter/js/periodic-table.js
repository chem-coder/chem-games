// A compact, schematic periodic table as an SVG string. Pure — no DOM. Used by the deck intros
// to show the position mnemonic (strong bases = group 1 + heavy group 2; strong binary acids =
// the halogens below F). Could be promoted to shared/ when the nomenclature game wants it.

// Standard 18-column layout. null = empty cell. f-block is rendered as two strips below.
const MAIN = [
  ["H", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "He"],
  ["Li", "Be", null, null, null, null, null, null, null, null, null, null, "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", null, null, null, null, null, null, null, null, null, null, "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
  ["Cs", "Ba", null, "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
  ["Fr", "Ra", null, "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]
];
const LANTHANIDES = ["La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu"];
const ACTINIDES = ["Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"];

// Every symbol that exists on the table — lets tests catch a typo'd highlight (e.g. "Na " or "K2").
export const ELEMENT_SYMBOLS = new Set(
  [...MAIN.flat(), ...LANTHANIDES, ...ACTINIDES].filter(Boolean)
);

const CELL = 26;
const FS = 10;
const FROW = 8; // y-row where the lanthanide strip starts (gap after period 7)

function cell(sym, row, col, highlight, palette) {
  if (!sym) return "";
  const cats = sym in highlight ? [].concat(highlight[sym]) : [];
  const x = col * CELL;
  const y = row * CELL;
  const w = CELL - 2;
  const ix = x + 1;
  const iy = y + 1;

  if (cats.length === 0) {
    // plain cell
    return (
      `<rect x="${ix}" y="${iy}" width="${w}" height="${w}" rx="3" fill="var(--surface)" stroke="var(--line)" stroke-width="1"/>` +
      label(x, y, sym, "var(--muted)", 500)
    );
  }
  if (cats.length === 1) {
    const co = palette[cats[0]];
    return (
      `<rect x="${ix}" y="${iy}" width="${w}" height="${w}" rx="3" fill="${co.fill}" stroke="${co.stroke}" stroke-width="1.5"/>` +
      label(x, y, sym, co.text, 700)
    );
  }
  // dual-role: split the cell diagonally — top-left = first role, bottom-right = second.
  const a = palette[cats[0]];
  const b = palette[cats[1]];
  return (
    `<polygon points="${ix},${iy} ${ix + w},${iy} ${ix},${iy + w}" fill="${a.fill}"/>` +
    `<polygon points="${ix + w},${iy} ${ix + w},${iy + w} ${ix},${iy + w}" fill="${b.fill}"/>` +
    `<line x1="${ix + w}" y1="${iy}" x2="${ix}" y2="${iy + w}" stroke="var(--surface)" stroke-width="1"/>` +
    `<rect x="${ix}" y="${iy}" width="${w}" height="${w}" rx="3" fill="none" stroke="${a.stroke}" stroke-width="1.5"/>` +
    label(x, y, sym, "var(--ink)", 700)
  );
}

function label(x, y, sym, color, weight) {
  return (
    `<text x="${x + CELL / 2}" y="${y + CELL / 2 + FS * 0.35}" text-anchor="middle" ` +
    `font-size="${FS}" font-weight="${weight}" fill="${color}" font-family="var(--font-display)">${sym}</text>`
  );
}

// highlight: { symbol: categoryId }. palette: { categoryId: { fill, stroke, text } }.
export function renderPeriodicTable(highlight = {}, palette = {}) {
  let cells = "";
  MAIN.forEach((rowArr, r) => rowArr.forEach((sym, c) => (cells += cell(sym, r, c, highlight, palette))));
  // f-block strips, indented to start under group 3
  LANTHANIDES.forEach((sym, i) => (cells += cell(sym, FROW, i + 2, highlight, palette)));
  ACTINIDES.forEach((sym, i) => (cells += cell(sym, FROW + 1, i + 2, highlight, palette)));

  const w = 18 * CELL + 2;
  const h = (FROW + 2) * CELL + 2;
  return `<svg class="ptable" viewBox="0 0 ${w} ${h}" role="img" aria-label="Periodic table with key elements highlighted">${cells}</svg>`;
}
