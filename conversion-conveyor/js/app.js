import { orientFactor, checkAnswer } from "../../shared/js/conversion-engine.js";
import { PACKS } from "../data/problems.js?v=20260621-packs";

const root = document.querySelector("#game");
const switcher = document.querySelector("#packSwitcher");

let packIndex = 0;
let index = 0;
let placed = null; // { flipped } currently in the slot, or null
let solved = false;
let checked = false;
let hintsUsed = 0;
let solvedCount = 0;
let choiceOrder = [false, true];

const pack = () => PACKS[packIndex];
const problems = () => pack().problems;

function plural(unit, n) {
  return n === 1 ? unit : `${unit}s`;
}

// Everyday units pluralize ("wheels"); reaction units are full tokens shown as-is ("mol H₂").
function unitLabel(unit, value, kind) {
  return kind === "reaction" ? unit : plural(unit, value);
}

function renderSwitcher() {
  switcher.innerHTML = PACKS.map(
    (pk, i) =>
      `<button class="pack-choice${i === packIndex ? " is-active" : ""}" data-pack="${i}" type="button" aria-pressed="${i === packIndex}">${pk.label}</button>`
  ).join("");
  switcher.querySelectorAll(".pack-choice").forEach((b) => {
    b.addEventListener("click", () => {
      packIndex = Number(b.dataset.pack);
      solvedCount = 0;
      renderSwitcher();
      loadProblem(0);
    });
  });
}

function loadProblem(i) {
  index = i;
  placed = null;
  solved = false;
  checked = false;
  hintsUsed = 0;
  choiceOrder = Math.random() < 0.5 ? [false, true] : [true, false];
  render();
}

function pick(flipped) {
  if (solved) return;
  placed = { flipped };
  checked = false;
  render();
}

function check() {
  if (!placed || solved) return;
  checked = true;
  const p = problems()[index];
  if (checkAnswer(p, [orientFactor(p.factor, placed.flipped)]).solved) {
    solved = true;
    solvedCount += 1;
  }
  render();
}

function hint() {
  if (hintsUsed < 3) hintsUsed += 1;
  render();
}

function next() {
  if (index + 1 < problems().length) loadProblem(index + 1);
  else renderDone();
}

const solvingFlip = (p) => p.factor.a.unit === p.given.unit;

function hintText(p, n) {
  const g = unitLabel(p.given.unit, 2, p.kind);
  const t = unitLabel(p.targetUnit, 2, p.kind);
  if (n === 1) return `You're converting ${g} → ${t}. Use the factor that links them.`;
  if (n === 2) return `Put ${g} on the bottom so it cancels what you started with.`;
  const o = orientFactor(p.factor, solvingFlip(p));
  return `${p.given.value} × (${o.num.value} ${unitLabel(o.num.unit, o.num.value, p.kind)} ÷ ${o.den.value} ${unitLabel(o.den.unit, o.den.value, p.kind)}) = ${p.answer.value} ${t}.`;
}

function qtyTile(value, unit, kind, { result = false, unsolved = false, cancel = false } = {}) {
  const cls = `qty-tile${result ? " is-result" : ""}${unsolved ? " is-unsolved" : ""}`;
  const unitCls = `unit${cancel ? " is-cancelled" : ""}`;
  return `<div class="${cls}">${value} <span class="${unitCls}">${unitLabel(unit, value, kind)}</span></div>`;
}

function factorFraction(o, kind, { cancelDen = false, wrong = false } = {}) {
  const denCls = `unit${cancelDen ? " is-cancelled" : ""}${wrong ? " clash" : ""}`;
  return `<div class="factor${wrong ? " is-wrong" : ""}">
      <div class="num">${o.num.value} <span class="unit">${unitLabel(o.num.unit, o.num.value, kind)}</span></div>
      <div class="bar"></div>
      <div class="den">${o.den.value} <span class="${denCls}">${unitLabel(o.den.unit, o.den.value, kind)}</span></div>
    </div>`;
}

function render() {
  const p = problems()[index];
  const k = p.kind;
  const wrong = checked && !!placed && !solved;

  const equation = p.equation ? `<p class="equation">${p.equation}</p>` : "";

  const slot = placed
    ? factorFraction(orientFactor(p.factor, placed.flipped), k, { cancelDen: solved, wrong })
    : `<div class="factor is-slot">tap a factor<br>to place it</div>`;

  const resultTile = solved
    ? qtyTile(p.answer.value, p.answer.unit, k, { result: true })
    : `<div class="qty-tile is-result is-unsolved">? <span class="unit">${unitLabel(p.targetUnit, 2, k)}</span></div>`;

  const choices = choiceOrder
    .map((flipped) => {
      const o = orientFactor(p.factor, flipped);
      return `<button class="choice" data-flip="${flipped}" ${solved ? "disabled" : ""}>${factorFraction(o, k)}</button>`;
    })
    .join("");

  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (solved) {
    feedback = `<p class="feedback ok">Correct — the ${unitLabel(p.given.unit, 2, k)} cancel, leaving ${p.answer.value} ${unitLabel(p.answer.unit, p.answer.value, k)}.</p>`;
  } else if (wrong) {
    feedback = `<p class="feedback no">Those units don't cancel — you need ${unitLabel(p.given.unit, 2, k)} on the bottom. Try the other one.</p>`;
  } else if (placed) {
    feedback = `<p class="feedback">Placed — work out the answer in your head, then tap Check.</p>`;
  }

  const hintBlock = hintsUsed > 0 ? `<p class="hint">${hintText(p, hintsUsed)}</p>` : "";

  root.innerHTML = `
    <p class="prompt">${p.prompt}</p>
    ${equation}
    <div class="track">
      ${qtyTile(p.given.value, p.given.unit, k, { cancel: solved })}
      <span class="op">&times;</span>
      ${slot}
      <span class="op">=</span>
      ${resultTile}
    </div>
    <p class="choices-label">Tap how to place the conversion factor:</p>
    <div class="choices">${choices}</div>
    ${feedback}
    ${hintBlock}
    <div class="controls">
      <p class="score">Solved ${solvedCount} of ${problems().length}</p>
      <button class="action ghost" id="hintBtn" ${hintsUsed >= 3 || solved ? "disabled" : ""}>${hintsUsed >= 3 ? "No more hints" : "Hint"}</button>
      ${solved
        ? `<button class="action primary" id="nextBtn">${index + 1 < problems().length ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${placed ? "" : "disabled"}>Check answer</button>`}
    </div>
  `;

  root.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => pick(btn.dataset.flip === "true"));
  });
  root.querySelector("#hintBtn").addEventListener("click", hint);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) nextBtn.addEventListener("click", next);
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
}

function renderDone() {
  root.innerHTML = `
    <p class="prompt">Nice work — you ran all ${problems().length} ${pack().label.toLowerCase()} conversions through the conveyor.</p>
    <div class="controls">
      <button class="action primary" id="againBtn">Play again</button>
    </div>`;
  root.querySelector("#againBtn").addEventListener("click", () => {
    solvedCount = 0;
    loadProblem(0);
  });
}

renderSwitcher();
loadProblem(0);
