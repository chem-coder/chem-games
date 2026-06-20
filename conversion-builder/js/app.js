import {
  ONE_UNIT,
  checkGrid,
  buildTileBank
} from "./builder.js";
import { ROUNDS } from "../data/problems.js?v=20260621-builder";

const root = document.querySelector("#game");
const switcher = document.querySelector("#roundSwitcher");

const EMPTY = { givenNum: null, givenDen: null, factorNum: null, factorDen: null };

// Strip the "mol " prefix for compact map labels: "mol H₂O" -> "H₂O".
const shortSpecies = (unit) => unit.replace(/^mol\s+/, "");

// Flatten every (round, question) into one ordered list — this is what the player steps and
// jumps through. Each entry carries a "given → target" label and its reaction equation.
const QUESTIONS = [];
ROUNDS.forEach((r, ri) =>
  r.questions.forEach((q, qi) =>
    QUESTIONS.push({
      ri,
      qi,
      equation: r.equation,
      label: `${shortSpecies(r.given.unit)} → ${shortSpecies(q.targetUnit)}`
    })
  )
);
const totalQuestions = QUESTIONS.length;

let cur = 0; // index into QUESTIONS
let placed = { ...EMPTY }; // slot -> tile {id,value,unit}
let bank = []; // tiles not yet placed (shuffled)
let selectedId = null; // tile tapped from the bank, awaiting a slot
let checked = false;
let solved = false;
let hintsUsed = 0;
let lastResult = null;
const solvedSet = new Set(); // flat indices already solved (drives the map's progress dots)

const round = () => ROUNDS[QUESTIONS[cur].ri];
const question = () => round().questions[QUESTIONS[cur].qi];

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadCurrent() {
  placed = { ...EMPTY };
  selectedId = null;
  checked = false;
  solved = solvedSet.has(cur);
  hintsUsed = 0;
  lastResult = null;
  bank = shuffle(buildTileBank(round(), question()));
  renderSwitcher();
  render();
}

function goTo(i) {
  cur = i;
  loadCurrent();
}

// ── interactions ────────────────────────────────────────────────────────────
function selectTile(id) {
  if (solved) return;
  selectedId = selectedId === id ? null : id;
  render();
}

function tapSlot(slot) {
  if (solved) return;
  checked = false;

  if (selectedId) {
    const tile = bank.find((t) => t.id === selectedId);
    if (!tile) return;
    if (placed[slot]) bank.push(placed[slot]); // bump the old occupant back to the bank
    placed[slot] = tile;
    bank = bank.filter((t) => t.id !== tile.id);
    selectedId = null;
  } else if (placed[slot]) {
    bank.push(placed[slot]); // tap a filled slot with nothing selected → pull the tile back
    placed[slot] = null;
  }
  render();
}

function check() {
  const out = checkGrid(round(), question(), placed);
  if (!out.ready) return;
  checked = true;
  lastResult = out;
  if (out.solved) {
    solved = true;
    solvedSet.add(cur);
  }
  renderSwitcher();
  render();
}

function hint() {
  if (hintsUsed < 3) hintsUsed += 1;
  render();
}

function next() {
  if (cur + 1 < totalQuestions) goTo(cur + 1);
  else renderDone();
}

function hintText(n) {
  const g = round().given.unit;
  const t = question().targetUnit;
  if (n === 1) return `Every conversion starts with what you're given — place ${round().given.value} ${g} on top, over a plain 1.`;
  if (n === 2) return `Whatever unit you're carrying has to appear on the bottom of the next fraction so it cancels.`;
  return `Read the ratio off the equation: ${t} on top (what you want), ${g} on the bottom (what you're carrying) — using each species' coefficient.`;
}

// ── rendering ───────────────────────────────────────────────────────────────
function tileFace(tile, { cancel = false } = {}) {
  if (tile.unit === ONE_UNIT) return `${tile.value}`;
  const unitCls = `unit${cancel ? " is-cancelled" : ""}`;
  return `${tile.value} <span class="${unitCls}">${tile.unit}</span>`;
}

function slotHtml(slot, { cancel = false } = {}) {
  const tile = placed[slot];
  if (!tile) {
    return `<button class="slot is-empty" data-slot="${slot}" ${solved ? "disabled" : ""}>tap</button>`;
  }
  return `<button class="slot is-filled" data-slot="${slot}" ${solved ? "disabled" : ""}>${tileFace(tile, { cancel })}</button>`;
}

function columnHtml(numSlot, denSlot, { cancelNum = false, cancelDen = false } = {}) {
  return `<div class="col">
      ${slotHtml(numSlot, { cancel: cancelNum })}
      <div class="bar"></div>
      ${slotHtml(denSlot, { cancel: cancelDen })}
    </div>`;
}

function render() {
  const r = round();
  const q = question();
  const wrong = checked && !solved;

  // On a solve, the given's unit (numerator of column 1) cancels the ratio's denominator unit.
  const grid = `<div class="grid">
      ${columnHtml("givenNum", "givenDen", { cancelNum: solved })}
      <span class="op">&times;</span>
      ${columnHtml("factorNum", "factorDen", { cancelDen: solved })}
      <span class="op">=</span>
      ${solved
        ? `<div class="result is-solved">${q.answer.value} <span class="unit">${q.answer.unit}</span></div>`
        : `<div class="result is-unsolved">? <span class="unit">${q.targetUnit}</span></div>`}
    </div>`;

  const tiles = bank
    .map(
      (t) =>
        `<button class="tile${t.id === selectedId ? " is-selected" : ""}" data-tile="${t.id}" ${solved ? "disabled" : ""}>${tileFace(t)}</button>`
    )
    .join("");

  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (solved) {
    feedback = `<p class="feedback ok">Correct — the ${r.given.unit} cancel, leaving ${q.answer.value} ${q.answer.unit}.</p>`;
  } else if (wrong && lastResult) {
    feedback = `<p class="feedback no">${lastResult.diagnostic}</p>`;
  } else if (selectedId) {
    feedback = `<p class="feedback">Now tap a slot to drop it in.</p>`;
  }

  const hintBlock = hintsUsed > 0 ? `<p class="hint">${hintText(hintsUsed)}</p>` : "";

  root.innerHTML = `
    <p class="equation">${r.equation}</p>
    <p class="given">Given: <strong>${r.given.value} ${r.given.unit}</strong></p>
    <p class="prompt">${q.prompt}</p>
    ${grid}
    <p class="bank-label">Build the grid — tap a tile, then tap a slot:</p>
    <div class="bank">${tiles || '<span class="bank-empty">All tiles placed.</span>'}</div>
    ${feedback}
    ${hintBlock}
    <div class="controls">
      <p class="score">Solved ${solvedSet.size} of ${totalQuestions}</p>
      <button class="action ghost" id="hintBtn" ${hintsUsed >= 3 || solved ? "disabled" : ""}>${hintsUsed >= 3 ? "No more hints" : "Hint"}</button>
      ${solved
        ? `<button class="action primary" id="nextBtn">${cur + 1 < totalQuestions ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn">Check answer</button>`}
    </div>
  `;

  root.querySelectorAll(".tile").forEach((b) =>
    b.addEventListener("click", () => selectTile(b.dataset.tile))
  );
  root.querySelectorAll(".slot").forEach((b) =>
    b.addEventListener("click", () => tapSlot(b.dataset.slot))
  );
  root.querySelector("#hintBtn").addEventListener("click", hint);
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) nextBtn.addEventListener("click", next);
}

// The conversion map: one jump-button per question, grouped under its equation, with the
// current one highlighted and solved ones ticked. Tap any to go straight to that question.
function renderSwitcher() {
  let html = "";
  let i = 0;
  while (i < QUESTIONS.length) {
    const eq = QUESTIONS[i].equation;
    let tiles = "";
    while (i < QUESTIONS.length && QUESTIONS[i].equation === eq) {
      const q = QUESTIONS[i];
      const cls = `q-choice${i === cur ? " is-active" : ""}${solvedSet.has(i) ? " is-solved" : ""}`;
      tiles += `<button class="${cls}" data-i="${i}" type="button" aria-pressed="${i === cur}">${q.label}</button>`;
      i += 1;
    }
    html += `<div class="map-group"><span class="map-eq">${eq}</span><div class="map-tiles">${tiles}</div></div>`;
  }
  switcher.innerHTML = html;
  switcher.querySelectorAll(".q-choice").forEach((b) =>
    b.addEventListener("click", () => goTo(Number(b.dataset.i)))
  );
}

function renderDone() {
  renderSwitcher();
  root.innerHTML = `
    <p class="prompt">Nice work — you solved ${solvedSet.size} of ${totalQuestions} conversions. Given any one amount, you found all the others. Tap any tile in the map above to revisit one.</p>
    <div class="controls">
      <button class="action primary" id="againBtn">Start over</button>
    </div>`;
  root.querySelector("#againBtn").addEventListener("click", () => {
    solvedSet.clear();
    goTo(0);
  });
}

goTo(0);
