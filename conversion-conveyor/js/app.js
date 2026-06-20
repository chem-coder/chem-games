import { orientFactor, checkAnswer } from "./engine.js";
import { PROBLEMS } from "../data/problems.js";

const root = document.querySelector("#game");

let index = 0;
let placed = null; // { flipped } currently in the slot, or null
let solved = false;
let checked = false;
let hintsUsed = 0;
let solvedCount = 0;
let choiceOrder = [false, true];

function plural(unit, n) {
  return n === 1 ? unit : `${unit}s`;
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
  checked = false; // placing no longer reveals the answer — the learner taps Check
  render();
}

function check() {
  if (!placed || solved) return;
  checked = true;
  const oriented = orientFactor(PROBLEMS[index].factor, placed.flipped);
  if (checkAnswer(PROBLEMS[index], [oriented]).solved) {
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
  if (index + 1 < PROBLEMS.length) loadProblem(index + 1);
  else renderDone();
}

function correctFlip(p) {
  // the GIVEN unit must land in the denominator to cancel
  return p.factor.a.unit === p.given.unit;
}

function hintText(p, n) {
  const g = plural(p.given.unit, 2);
  const t = plural(p.targetUnit, 2);
  if (n === 1) return `You're converting ${g} → ${t}. Use the factor that links them.`;
  if (n === 2) return `Put ${g} on the bottom of the fraction so they cancel the ${g} you started with.`;
  const o = orientFactor(p.factor, correctFlip(p));
  return `${p.given.value} × (${o.num.value} ${plural(o.num.unit, o.num.value)} ÷ ${o.den.value} ${plural(o.den.unit, o.den.value)}) = ${p.answer.value} ${t}.`;
}

function qtyTile(value, unit, { result = false, unsolved = false, cancel = false } = {}) {
  const cls = `qty-tile${result ? " is-result" : ""}${unsolved ? " is-unsolved" : ""}`;
  const unitCls = `unit${cancel ? " is-cancelled" : ""}`;
  return `<div class="${cls}">${value} <span class="${unitCls}">${plural(unit, value)}</span></div>`;
}

function factorFraction(o, { cancelDen = false, wrong = false } = {}) {
  const denCls = `unit${cancelDen ? " is-cancelled" : ""}${wrong ? " clash" : ""}`;
  return `<div class="factor${wrong ? " is-wrong" : ""}">
      <div class="num">${o.num.value} <span class="unit">${plural(o.num.unit, o.num.value)}</span></div>
      <div class="bar"></div>
      <div class="den">${o.den.value} <span class="${denCls}">${plural(o.den.unit, o.den.value)}</span></div>
    </div>`;
}

function render() {
  const p = PROBLEMS[index];
  const wrong = checked && !!placed && !solved;

  const slot = placed
    ? factorFraction(orientFactor(p.factor, placed.flipped), { cancelDen: solved, wrong })
    : `<div class="factor is-slot">tap a factor<br>to place it</div>`;

  const resultTile = solved
    ? qtyTile(p.answer.value, p.answer.unit, { result: true })
    : `<div class="qty-tile is-result is-unsolved">? <span class="unit">${plural(p.targetUnit, 2)}</span></div>`;

  const choices = choiceOrder
    .map((flipped) => {
      const o = orientFactor(p.factor, flipped);
      return `<button class="choice" data-flip="${flipped}" ${solved ? "disabled" : ""}>${factorFraction(o)}</button>`;
    })
    .join("");

  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (solved) {
    feedback = `<p class="feedback ok">Correct — the ${plural(p.given.unit, 2)} cancel, leaving ${p.answer.value} ${plural(p.answer.unit, p.answer.value)}.</p>`;
  } else if (wrong) {
    feedback = `<p class="feedback no">Those units don't cancel — you need ${plural(p.given.unit, 2)} on the bottom. Try the other one.</p>`;
  } else if (placed) {
    feedback = `<p class="feedback">Placed — work out the answer in your head, then tap Check.</p>`;
  }

  const hintBlock = hintsUsed > 0 ? `<p class="hint">${hintText(p, hintsUsed)}</p>` : "";

  root.innerHTML = `
    <p class="prompt">${p.prompt}</p>
    <div class="track">
      ${qtyTile(p.given.value, p.given.unit, { cancel: solved })}
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
      <p class="score">Solved ${solvedCount} of ${PROBLEMS.length}</p>
      <button class="action ghost" id="hintBtn" ${hintsUsed >= 3 || solved ? "disabled" : ""}>${hintsUsed >= 3 ? "No more hints" : "Hint"}</button>
      ${solved
        ? `<button class="action primary" id="nextBtn">${index + 1 < PROBLEMS.length ? "Next →" : "Finish"}</button>`
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
    <p class="prompt">Nice work — you ran all ${PROBLEMS.length} conversions through the conveyor.</p>
    <div class="controls">
      <button class="action primary" id="againBtn">Play again</button>
    </div>`;
  root.querySelector("#againBtn").addEventListener("click", () => {
    solvedCount = 0;
    loadProblem(0);
  });
}

loadProblem(0);
