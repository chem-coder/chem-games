// Periodic Table Memorizer — "fill the table" game. DOM layer; pure logic lives in game.js.
// Click a blank square (it shows the atomic number), type the symbol, press Enter. Correct → the
// cell locks in and focus auto-advances to the next empty element. Sporcle-style.
import { ELEMENTS } from "../data/pt-data.js?v=20260623-pt2";
import { TOTAL, normalizeSymbol, isCorrectSymbol, nextUnfilled, neighbor } from "./game.js?v=20260623-pt2";

const root = document.querySelector("#game");
const elByZ = (z) => ELEMENTS[z - 1]; // elements are z-sorted, so index = z − 1

let earned = new Set(); // symbols typed correctly
let revealed = false; // gave up → show the rest, styled distinctly
let activeZ = null; // atomic number of the cell being typed into
let buffer = "";
let misses = 0;

function activate(z) {
  if (revealed || earned.has(elByZ(z).symbol)) return;
  activeZ = z;
  buffer = "";
  render();
}

function submit() {
  if (activeZ == null) return;
  const el = elByZ(activeZ);
  if (isCorrectSymbol(el, buffer)) {
    earned.add(el.symbol);
    const next = nextUnfilled(earned, el.z);
    activeZ = next ? next.z : null;
    buffer = "";
    render();
  } else {
    misses += 1;
    buffer = "";
    render();
    root.querySelector(".cell.active")?.classList.add("shake"); // brief "nope" wiggle, then retry
  }
}

// Arrow navigation: if the typed buffer is correct, count it first ("type + arrow" still scores),
// then move to the nearest cell in that direction.
function arrow(dir) {
  if (activeZ == null) {
    const start = nextUnfilled(earned, 0);
    if (start) { activeZ = start.z; buffer = ""; render(); }
    return;
  }
  const el = elByZ(activeZ);
  if (isCorrectSymbol(el, buffer)) earned.add(el.symbol); // correct + arrow → counts
  buffer = "";
  const nb = neighbor(el, dir);
  if (nb) activeZ = nb.z;
  render();
}

function reveal() { revealed = true; activeZ = null; buffer = ""; render(); }
function reset() { earned = new Set(); revealed = false; activeZ = null; buffer = ""; misses = 0; render(); }

// One document-level key handler; only acts while a cell is active.
const ARROWS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
document.addEventListener("keydown", (e) => {
  if (e.key in ARROWS) { e.preventDefault(); return arrow(ARROWS[e.key]); }
  if (activeZ == null) return;
  if (e.key === "Enter") { e.preventDefault(); submit(); }
  else if (e.key === "Backspace") { e.preventDefault(); buffer = buffer.slice(0, -1); render(); }
  else if (e.key === "Escape") { e.preventDefault(); activeZ = null; buffer = ""; render(); }
  else if (/^[a-zA-Z]$/.test(e.key) && buffer.length < 3) { e.preventDefault(); buffer += e.key; render(); }
});

// Delegated clicks (the grid is re-rendered each change).
root.addEventListener("click", (e) => {
  const c = e.target.closest(".cell");
  if (c) return activate(Number(c.dataset.z));
  if (e.target.closest("#revealBtn")) return reveal();
  if (e.target.closest("#resetBtn")) return reset();
});

function cellHtml(el) {
  const isEarned = earned.has(el.symbol);
  const show = isEarned || revealed;
  const isActive = activeZ === el.z;
  let cls = `cell type-${el.type}`;
  if (isEarned) cls += " earned";
  else if (revealed) cls += " revealed";
  if (isActive) cls += " active";
  if (el.row >= 8) cls += " fblock";

  let main = "";
  if (show) main = `<span class="sym">${el.symbol}</span>`;
  else if (isActive) main = `<span class="sym typing">${buffer}<i class="caret"></i></span>`;

  return `<div class="${cls}" data-z="${el.z}" style="grid-row:${el.row + 1};grid-column:${el.col + 1}" title="${el.name}"><span class="z">${el.z}</span>${main}</div>`;
}

function render() {
  const done = earned.size === TOTAL;
  const status = done
    ? `<p class="pt-status ok">🎉 Complete — all ${TOTAL}! ${misses ? `(${misses} miss${misses === 1 ? "" : "es"})` : "flawless."}</p>`
    : revealed
      ? `<p class="pt-status">Revealed. You'd earned <strong>${earned.size}</strong> of ${TOTAL}. Reset to try again.</p>`
      : activeZ != null
        ? `<p class="pt-status">Filling in <strong>#${activeZ}</strong> — type the symbol, then Enter or an arrow key. (Esc to cancel.)</p>`
        : `<p class="pt-status">Click a square (or press an arrow key to start), type its symbol.</p>`;

  root.innerHTML = `
    <div class="pt-head">
      <p class="count"><strong>${earned.size}</strong> <span>/ ${TOTAL}</span></p>
      <div class="pt-actions">
        <button class="btn ghost" id="revealBtn" type="button" ${done ? "disabled" : ""}>Reveal all</button>
        <button class="btn ghost" id="resetBtn" type="button">Reset</button>
      </div>
    </div>
    ${status}
    <div class="ptwrap"><div class="ptgrid">${ELEMENTS.map(cellHtml).join("")}</div></div>`;
}

render();
