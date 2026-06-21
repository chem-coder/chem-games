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
  const cat = highlight[sym];
  const co = cat ? palette[cat] : null;
  const x = col * CELL;
  const y = row * CELL;
  const fill = co ? co.fill : "var(--surface)";
  const stroke = co ? co.stroke : "var(--line)";
  const text = co ? co.text : "var(--muted)";
  return (
    `<rect x="${x + 1}" y="${y + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="3" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="${co ? 1.5 : 1}"/>` +
    `<text x="${x + CELL / 2}" y="${y + CELL / 2 + FS * 0.35}" text-anchor="middle" ` +
    `font-size="${FS}" font-weight="${co ? 700 : 500}" fill="${text}" font-family="var(--font-display)">${sym}</text>`
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
