import {
  ONE_UNIT,
  correctGrid,
  checkGrid,
  buildTileBank
} from "./builder.js";
import { ROUNDS } from "../data/problems.js?v=20260621-builder";

const root = document.querySelector("#game");
const switcher = document.querySelector("#roundSwitcher");

const EMPTY = { givenNum: null, givenDen: null, factorNum: null, factorDen: null };

let roundIndex = 0;
let questionIndex = 0;
let placed = { ...EMPTY }; // slot -> tile {id,value,unit}
let bank = []; // tiles not yet placed (shuffled)
let selectedId = null; // tile tapped from the bank, awaiting a slot
let checked = false;
let solved = false;
let hintsUsed = 0;
let solvedCount = 0;

const round = () => ROUNDS[roundIndex];
const question = () => round().questions[questionIndex];
const totalQuestions = ROUNDS.reduce((n, r) => n + r.questions.length, 0);

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestion() {
  placed = { ...EMPTY };
  selectedId = null;
  checked = false;
  solved = false;
  hintsUsed = 0;
  bank = shuffle(buildTileBank(round(), question()));
  render();
}

function loadRound(i) {
  roundIndex = i;
  questionIndex = 0;
  loadQuestion();
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
  if (out.solved) {
    solved = true;
    solvedCount += 1;
  }
  lastResult = out;
  render();
}

let lastResult = null;

function hint() {
  if (hintsUsed < 3) hintsUsed += 1;
  render();
}

function next() {
  if (questionIndex + 1 < round().questions.length) {
    questionIndex += 1;
    loadQuestion();
  } else if (roundIndex + 1 < ROUNDS.length) {
    loadRound(roundIndex + 1);
  } else {
    renderDone();
  }
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
  const qNo = round().questions.length > 1 ? ` <span class="q-of">(${questionIndex + 1} of ${round().questions.length})</span>` : "";

  root.innerHTML = `
    <p class="equation">${r.equation}</p>
    <p class="given">Given: <strong>${r.given.value} ${r.given.unit}</strong></p>
    <p class="prompt">${q.prompt}${qNo}</p>
    ${grid}
    <p class="bank-label">Build the grid — tap a tile, then tap a slot:</p>
    <div class="bank">${tiles || '<span class="bank-empty">All tiles placed.</span>'}</div>
    ${feedback}
    ${hintBlock}
    <div class="controls">
      <p class="score">Solved ${solvedCount} of ${totalQuestions}</p>
      <button class="action ghost" id="hintBtn" ${hintsUsed >= 3 || solved ? "disabled" : ""}>${hintsUsed >= 3 ? "No more hints" : "Hint"}</button>
      ${solved
        ? `<button class="action primary" id="nextBtn">${questionIndex + 1 < round().questions.length || roundIndex + 1 < ROUNDS.length ? "Next →" : "Finish"}</button>`
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

function renderSwitcher() {
  switcher.innerHTML = ROUNDS.map(
    (r, i) =>
      `<button class="round-choice${i === roundIndex ? " is-active" : ""}" data-round="${i}" type="button" aria-pressed="${i === roundIndex}">${r.name}</button>`
  ).join("");
  switcher.querySelectorAll(".round-choice").forEach((b) =>
    b.addEventListener("click", () => {
      loadRound(Number(b.dataset.round));
      renderSwitcher();
    })
  );
}

function renderDone() {
  root.innerHTML = `
    <p class="prompt">Nice work — you built every grid and solved ${solvedCount} of ${totalQuestions} questions. Given any one amount, you found all the others.</p>
    <div class="controls">
      <button class="action primary" id="againBtn">Play again</button>
    </div>`;
  root.querySelector("#againBtn").addEventListener("click", () => {
    solvedCount = 0;
    loadRound(0);
    renderSwitcher();
  });
}

renderSwitcher();
loadRound(0);
