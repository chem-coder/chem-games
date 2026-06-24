// Oxidation-states reference — renders the full periodic table from shared/data/periodic-elements.json.
// Each cell shows the element and its oxidation states, shaded by how commonly each is met
// (primary darkest, common mid, rare faint). f-block (lanthanides/actinides) sits in a strip below.
// Pure render, no logic worth testing here; the data + its tiers are validated by the generator.

const DATA_URL = "../../shared/data/periodic-elements.json";

// data category (from elements.json subtype) → cell tint class
const CAT = {
  "alkali metal": "alkali",
  "alkaline earth metal": "alkaline",
  "transition metal": "transition",
  "post-transition metal": "post",
  "metalloid": "metalloid",
  "reactive nonmetal": "nonmetal",
  "halogen": "halogen",
  "noble gas": "noble",
  "lanthanide": "lanthanide",
  "actinide": "actinide"
};
const CAT_LABEL = {
  alkali: "alkali metal", alkaline: "alkaline earth", transition: "transition metal",
  post: "post-transition", metalloid: "metalloid", nonmetal: "reactive nonmetal",
  halogen: "halogen", noble: "noble gas", lanthanide: "lanthanide", actinide: "actinide"
};

const sign = (n) => (n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

function cell(e) {
  const cat = CAT[e.category] || "post";
  const states = e.states.length
    ? `<span class="ox-list">${e.states.map((s) => `<span class="ox ${s.tier}">${sign(s.ox)}</span>`).join("")}</span>`
    : `<span class="ox-list ox-none">unknown</span>`;
  const at = e.fBlock
    ? `grid-column:${e.fIndex + 1};grid-row:${e.fBlock === "lanthanide" ? 1 : 2}`
    : `grid-column:${e.group};grid-row:${e.period}`;
  return `<div class="el cat-${cat}" style="${at}" title="${e.name} (${e.Z})">
    <span class="z">${e.Z}</span>
    <span class="sym">${e.symbol}</span>
    ${states}
  </div>`;
}

function legend() {
  const tiers = [
    ["primary", "most common"],
    ["common", "common"],
    ["rare", "rare"]
  ].map(([t, label]) => `<span class="leg-item"><span class="ox ${t}">+n</span>${label}</span>`).join("");
  const cats = Object.entries(CAT_LABEL)
    .map(([c, label]) => `<span class="leg-item"><i class="sw cat-${c}"></i>${label}</span>`).join("");
  return `<div class="legend">
    <div class="leg-row"><span class="leg-title">How common</span>${tiers}</div>
    <div class="leg-row leg-cats">${cats}</div>
    <p class="leg-note">Commonness is curated from standard references (common vs rare), not a measured natural abundance.</p>
  </div>`;
}

async function render() {
  const board = document.querySelector("#board");
  let data;
  try {
    data = await (await fetch(DATA_URL)).json();
  } catch (err) {
    board.innerHTML = `<p class="load-error">Couldn't load the element data. ${err}</p>`;
    return;
  }
  const main = data.filter((e) => !e.fBlock).map(cell).join("");
  const fblock = data.filter((e) => e.fBlock).map(cell).join("");
  board.innerHTML = `
    <div class="ptable-scroll">
      <div class="ptable">${main}</div>
      <div class="fstrip">${fblock}</div>
    </div>
    ${legend()}`;
}

render();
