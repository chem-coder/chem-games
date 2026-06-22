// Type I ionic Name Builder — DOM layer. Pure logic lives in builder.js; this wires it to the
// screen. Version-tag internal imports so one release bump busts the whole module graph in cache.
import { toSubHtml } from "../../js/chem.js?v=20260623-typeC";
import {
  typeOneCompounds, buildProblem, gradeAnswer, buildRound, requeue, DEFAULT_ROUND
} from "./builder.js?v=20260623-typeC";

const root = document.querySelector("#game");

let mode = "intro"; // "intro" | "play" | "done"
let queue = []; // specs, front = current
let roundTotal = 0;
let problem = null;
let typed = "";
let hintsShown = 0; // hints revealed for the current card
let checked = false;
let graded = null;
let masteredThisRound = 0;
let cleanSolves = 0; // got it right with zero hints
let missedThisRound = [];

function startRound() {
  queue = buildRound(typeOneCompounds(), DEFAULT_ROUND);
  roundTotal = queue.length;
  masteredThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  problem = buildProblem(queue[0]);
  typed = "";
  hintsShown = 0;
  checked = false;
  graded = null;
  render();
}

function check() {
  if (checked || !typed.trim()) return;
  graded = gradeAnswer(problem, typed);
  checked = true;
  if (graded.correct) {
    masteredThisRound += 1;
    if (hintsShown === 0) cleanSolves += 1;
  } else {
    missedThisRound.push(problem.spec);
  }
  render();
}

function showHint() {
  if (hintsShown < problem.hints.length) hintsShown += 1;
  render();
}

function next() {
  queue = requeue(queue, graded.correct);
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── rendering ──
function render() {
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  renderPlay();
}

// The visual concept, recreated from the course slide: a name is two blocks —
// [name of cation (metal)] + [base name of anion (nonmetal) + -ide].
function renderIntro() {
  root.innerHTML = `
    <div class="intro">
      <p class="intro-eyebrow">Binary ionic · Type I metal (invariant charge)</p>
      <p class="intro-lede">A <strong>binary</strong> compound holds just two different elements. Its name is two blocks:</p>

      <div class="schema">
        <div class="block cation">
          <span class="block-main">metal</span>
          <span class="block-sub">cation name</span>
        </div>
        <span class="schema-plus">+</span>
        <div class="block anion">
          <span class="block-main">nonmetal<span class="suffix"> + <em>ide</em></span></span>
          <span class="block-sub"><em>anion name root</em></span>
        </div>
      </div>

      <p class="schema-note">No need to specify the metal's charge — these metals have just one.</p>

      <div class="ex-maps">
        <div class="ex-map"><span class="ex-f">${toSubHtml("NaCl")}</span><span class="arrow">→</span><span class="w-cation">sodium</span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
        <div class="ex-map"><span class="ex-f">${toSubHtml("KF")}</span><span class="arrow">→</span><span class="w-cation">potassium</span> <span class="w-anion">fluor<span class="ide">ide</span></span></div>
        <div class="ex-map"><span class="ex-f">${toSubHtml("MgBr2")}</span><span class="arrow">→</span><span class="w-cation">magnesium</span> <span class="w-anion">brom<span class="ide">ide</span></span></div>
      </div>

      <div class="controls">
        <button class="action primary" id="startBtn">Start — 5 to name →</button>
      </div>
    </div>`;
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

function renderPlay() {
  const remaining = queue.length;

  const answer = checked
    ? `<div class="answer-built ${graded.correct ? "ok" : "no"}">${typed || "—"}</div>`
    : `<input class="answer-input" id="answerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type the name…" value="${typed.replace(/"/g, "&quot;")}">`;

  // Progressive hints — reveal one per click, à la the equation balancer.
  const shown = problem.hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked
    ? ""
    : `<div class="hints">
        ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
        ${hintsShown < problem.hints.length
          ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>`
          : ""}
      </div>`;

  let reveal = "";
  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">${hintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
    reveal = `<p class="reveal">${toSubHtml(problem.formula)} &nbsp;=&nbsp; <strong>${problem.target.canonical}</strong></p>`;
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How Type I names work</button>
    <div class="formula-card">
      <span class="card-tag">Ionic · Type I</span>
      <p class="formula">${toSubHtml(problem.formula)}</p>
    </div>

    <p class="build-label">Name this compound</p>
    <div class="answer-row">${answer}</div>
    ${hintBlock}

    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">Named ${masteredThisRound} of ${roundTotal} &middot; ${remaining} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${typed.trim() ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });

  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => {
      typed = input.value;
      const btn = root.querySelector("#checkBtn");
      if (btn) btn.disabled = !typed.trim();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    input.focus();
  }
  const hintBtn = root.querySelector("#hintBtn");
  if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
}

function renderDone() {
  const missedChips = missedThisRound
    .map((s) => `<span class="chip">${toSubHtml(buildProblem(s).formula)}</span>`)
    .join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p>
        <div class="chips">${missedChips}</div>
      </div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} named with no hints. 🎉</p>`;

  root.innerHTML = `
    <p class="prompt">Round done — ${roundTotal} compounds, ${cleanSolves} named hint-free.</p>
    ${missedBlock}
    <div class="controls">
      ${missedThisRound.length ? `<button class="action primary" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button>` : ""}
      <button class="action ${missedThisRound.length ? "ghost" : "primary"}" id="againBtn">New 5 →</button>
    </div>`;

  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => {
    queue = missedThisRound.slice();
    roundTotal = queue.length;
    masteredThisRound = 0;
    cleanSolves = 0;
    missedThisRound = [];
    mode = "play";
    loadCard();
  });
  root.querySelector("#againBtn").addEventListener("click", startRound);
}

render();
