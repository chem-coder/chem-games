/*
  Cell Numbers — app controller.
  Six quantitative rungs (pH Lab pattern): intro (numbered steps + worked
  example) → drill (typed numeric answers, progressive hints, misses requeue
  as fresh variants) → done (house pattern: next + revisit + again + home).
  Clean solve = right on the first check with no hints.
*/
import { RUNGS, isCorrect } from "./numbers.js";
import { INTROS } from "../data/intros.js";

const root = document.getElementById("game");
const ROUND_LEN = 6;

let rungIndex = 0;
let mode = "intro"; // intro | drill | done
let drill = null;

/* ---------- formatting ---------- */

const SUBS = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9, "₊": "+", "₋": "−" };
const SUPS = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chem(s) {
  return esc(s)
    .replace(/[₀-₉₊₋]+/g, (m) => `<sub>${[...m].map((ch) => SUBS[ch]).join("")}</sub>`)
    .replace(/([⁰-⁹]*)([⁺⁻])/g, (m, d, sign) => `<sup>${[...d].map((ch) => SUPS[ch]).join("")}${sign === "⁺" ? "+" : "−"}</sup>`)
    .replace(/[⁰-⁹]+/g, (m) => `<sup>${[...m].map((ch) => SUPS[ch]).join("")}</sup>`);
}

/* ---------- navigation (house rules: tabs on every screen) ---------- */

function rungTabs() {
  return `<div class="level-tabs" role="tablist">${RUNGS.map(
    (r, i) =>
      `<button class="level-tab${i === rungIndex ? " is-active" : ""}" data-rung="${i}" type="button" role="tab" aria-selected="${i === rungIndex}">${i + 1} · ${r.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => {
      rungIndex = Number(b.dataset.rung);
      mode = "intro";
      drill = null;
      render();
    })
  );
}

/* ---------- intro ---------- */

function renderIntro() {
  const rung = RUNGS[rungIndex];
  const intro = INTROS[rung.key];
  root.innerHTML = `
    ${rungTabs()}
    <p class="cat-blurb">${chem(intro.lede)}</p>
    <ol class="steps">
      ${intro.steps
        .map((s, i) => `<li><span class="step-num">${i + 1}</span><span class="step-text">${chem(s)}</span></li>`)
        .join("")}
    </ol>
    <p class="worked-example"><span class="worked-label">Worked example</span> ${chem(intro.example)}</p>
    <div class="controls">
      <button class="action primary" id="startBtn" type="button">Start: ${ROUND_LEN} questions →</button>
    </div>`;
  wireTabs();
  root.querySelector("#startBtn").addEventListener("click", startDrill);
}

/* ---------- drill ---------- */

function newQuestion(dirty = false) {
  const q = RUNGS[rungIndex].gen(Math.random);
  q.dirty = dirty;
  return q;
}

function startDrill() {
  drill = {
    queue: Array.from({ length: ROUND_LEN }, () => newQuestion()),
    total: ROUND_LEN, solved: 0, clean: 0, missed: 0,
    hintLevel: 0, attempts: 0, state: "asking", // asking | right | shown
  };
  mode = "drill";
  render();
}

function renderDrill() {
  const q = drill.queue[0];
  const rung = RUNGS[rungIndex];
  const showNext = drill.state !== "asking";
  root.innerHTML = `
    ${rungTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">Solved ${Math.min(drill.solved, drill.total)} of ${drill.total}</span>
      <span class="qtype-chip">${rung.label.toLowerCase()}</span>
      ${q.dirty ? '<span class="qtype-chip retry">back for another try</span>' : ""}
    </div>
    <p class="prompt">${chem(q.prompt)}</p>
    <div class="answer-row">
      <input class="answer-input" id="answerInput" type="number" step="any" inputmode="decimal"
        placeholder="?" ${showNext ? "disabled" : ""} aria-label="your answer" />
      <span class="answer-unit">${chem(q.unit)}</span>
      ${!showNext ? `<button class="action primary" id="checkBtn" type="button">Check</button>` : ""}
    </div>
    <p class="tol-note">Within ${q.tol.abs != null ? `±${q.tol.abs.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}` : `±${Math.round(q.tol.rel * 100)} %`} counts.</p>
    <div id="hintBox">
      ${drill.hintLevel >= 1 ? `<p class="hint-line">💡 ${chem(q.hints[0])}</p>` : ""}
      ${drill.hintLevel >= 2 ? `<p class="hint-line">💡 ${chem(q.hints[1])}</p>` : ""}
      ${drill.state === "shown" ? `<p class="hint-line worked">${chem(q.worked)}</p>` : ""}
    </div>
    <div id="verdict">${
      drill.state === "right"
        ? `<p class="feedback ok">✓ ${chem(q.worked)}</p>`
        : ""
    }</div>
    <div class="controls">
      ${
        showNext
          ? `<button class="action primary" id="nextBtn" type="button">Next →</button>`
          : `<button class="action ghost" id="hintBtn" type="button">${
              drill.hintLevel === 0 ? "Hint" : drill.hintLevel === 1 ? "Another hint" : "Show me"
            }</button>`
      }
    </div>`;
  wireTabs();
  const input = root.querySelector("#answerInput");
  if (!showNext) {
    input.focus();
    const check = () => {
      const val = parseFloat(input.value);
      if (!Number.isFinite(val)) return;
      drill.attempts += 1;
      if (isCorrect(q, val)) {
        drill.state = "right";
        drill.solved += 1;
        if (drill.attempts === 1 && drill.hintLevel === 0 && !q.dirty) drill.clean += 1;
        render();
      } else {
        flashWrong();
      }
    };
    root.querySelector("#checkBtn").addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });
    root.querySelector("#hintBtn").addEventListener("click", () => {
      if (drill.hintLevel < 2) {
        drill.hintLevel += 1;
      } else {
        // "Show me" — reveal, count as missed, requeue a fresh variant
        drill.state = "shown";
        drill.missed += 1;
        drill.queue.push(newQuestion(true));
      }
      render();
      root.querySelector("#answerInput")?.focus();
    });
  } else {
    root.querySelector("#nextBtn").addEventListener("click", () => {
      drill.queue.shift();
      drill.hintLevel = 0;
      drill.attempts = 0;
      drill.state = "asking";
      if (!drill.queue.length) mode = "done";
      render();
    });
  }
}

function flashWrong() {
  const input = root.querySelector("#answerInput");
  const verdict = root.querySelector("#verdict");
  verdict.innerHTML = `<p class="feedback no">✗ Not yet — check the arithmetic, or take a hint.</p>`;
  input.classList.add("is-wrong");
  input.select();
  setTimeout(() => input.classList.remove("is-wrong"), 600);
}

/* ---------- done (house pattern) ---------- */

function renderDone() {
  const rung = RUNGS[rungIndex];
  const nextRung = RUNGS[rungIndex + 1] || null;
  const cleanRun = drill.clean === drill.total;
  root.innerHTML = `
    ${rungTabs()}
    <p class="prompt">Round done — ${drill.total} questions, ${drill.clean} solved clean: no hints, first try.</p>
    ${cleanRun ? `<p class="feedback ok">Clean run — the ${rung.label.toLowerCase()} arithmetic is yours. 🎉</p>` : ""}
    <div class="controls two-up done-nav">
      ${nextRung ? `<button class="action primary" id="nextRungBtn" type="button">Next: ${nextRung.label} →</button>` : ""}
      <button class="action ghost" id="revisitBtn" type="button">↩ Revisit the ${rung.label.toLowerCase()} intro</button>
    </div>
    <p class="done-next">Or run it again:</p>
    <div class="controls two-up">
      <button class="action ghost" id="againBtn" type="button">Another round</button>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ Battery Lab</a> &nbsp;·&nbsp; <a class="home-link" href="../../">⌂ All Chem Games</a></p>`;
  wireTabs();
  const nextBtn = root.querySelector("#nextRungBtn");
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      rungIndex += 1;
      mode = "intro";
      render();
    });
  root.querySelector("#revisitBtn").addEventListener("click", () => {
    mode = "intro";
    render();
  });
  root.querySelector("#againBtn").addEventListener("click", startDrill);
}

/* ---------- dispatcher ---------- */

function render() {
  if (mode === "drill") renderDrill();
  else if (mode === "done") renderDone();
  else renderIntro();
}

render();
