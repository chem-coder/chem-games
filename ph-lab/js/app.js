// pH Lab — DOM layer. Pure logic lives in ph.js; content in content.js.
// Rung 1 (Powers of Ten): read a corner of the pH square, type the corner you're sent to,
// Check. Predict-then-Check spine with a progressive hint ladder — same skeleton as the
// Oxidation-State Trainer, so the family keeps one feel.
import { buildProblem, grade, supNum, formatAnswer } from "./ph.js";
import { TIERS } from "./content.js";

const root = document.querySelector("#game");

// ── round/stack engine (tiny, local — keeps this game standalone) ──
const DEFAULT_ROUND = 5;
function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const requeue = (queue, correct) => (queue.length === 0 ? queue : correct ? queue.slice(1) : [...queue.slice(1), queue[0]]);

// ── state ──
let tierIndex = 0;
const tier = () => TIERS[tierIndex];
let mode = "intro";        // "intro" | "play" | "done"
let queue = [];
let roundTotal = 0;
let problem = null;
let typed = "";
let hintsShown = 0;
let checked = false;
let graded = null;
let solvedThisRound = 0;
let cleanSolves = 0;
let missedThisRound = [];
let nudge = null;          // sign near-miss — retry, don't burn the card

const NUDGE_MSG = {
  "exponent-negative": `Almost — the minus is the message. Concentrations here run from 1 M (10⁰) <em>down</em> to 10⁻¹⁴ M, so the exponent is <strong>negative</strong>.`,
  "scale-positive": `Almost — pH and pOH are themselves <strong>positive</strong> numbers (0–14). The minus already lives inside the formula.`
};

// ── rendering helpers ──
const conc = (species, n) => `[${species}] = 10<sup>−${n}</sup> M`;
const H = "H⁺", OH = "OH⁻";

// The given quantity, as the big card line.
function renderGiven(p) {
  if (p.given === "H") return conc(H, p.n);
  if (p.given === "OH") return conc(OH, p.n);
  return `${p.given} = ${p.n}`;
}
// What the card asks for, in words.
function renderAsk(p) {
  if (p.ask === "H") return `what is [${H}]?`;
  if (p.ask === "OH") return `what is [${OH}]?`;
  return `what is the ${p.ask}?`;
}

// The autumn spine: 0–14 gradient bar, teal at 7. Marker only after Check (predict first).
function spine(ph = null) {
  const marker = ph === null ? "" :
    `<span class="spine-marker" style="left:${(ph / 14) * 100}%"><span class="spine-marker-tag">${ph}</span></span>`;
  return `<div class="spine-wrap">
    <div class="spine">${marker}</div>
    <div class="spine-scale"><span>0</span><span class="spine-mid">7</span><span>14</span></div>
    <div class="spine-labels"><span>acid</span><span class="spine-mid">neutral</span><span>base</span></div>
  </div>`;
}

// ── flow ──
function startRound() {
  queue = shuffle(tier().items).slice(0, Math.min(DEFAULT_ROUND, tier().items.length));
  roundTotal = queue.length;
  solvedThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}
function loadCard() {
  problem = buildProblem(queue[0]);
  typed = ""; hintsShown = 0; checked = false; graded = null; nudge = null;
  render();
}
function check() {
  if (checked || !typed.trim()) return;
  const g = grade(problem, typed);
  if (!g.correct && g.nudge) { nudge = NUDGE_MSG[g.nudge]; render(); return; }
  nudge = null;
  graded = g;
  checked = true;
  if (graded.correct) { solvedThisRound += 1; if (hintsShown === 0) cleanSolves += 1; }
  else missedThisRound.push(problem);
  render();
}
function showHint() { if (hintsShown < problem.hints.length) hintsShown += 1; render(); }
function next() {
  queue = requeue(queue, graded.correct);
  if (queue.length === 0) { mode = "done"; render(); } else loadCard();
}

// ── render ──
function render() {
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  renderPlay();
}

function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map((t, i) =>
    `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${t.label}</button>`
  ).join("")}</div>`;
}
function startControls() {
  return `<div class="controls two-up"><button class="action primary" id="startBtn">Start the ${tier().label.toLowerCase()} stack →</button></div>`;
}

// The pH square — four corners, and the three moves that connect them.
function phSquare() {
  return `<div class="ph-square" role="img" aria-label="The pH square: H+ and pH connected by flipping the sign, OH- and pOH the same, the columns connected by Kw and by 14.">
    <span class="sq-node">[${H}]</span>
    <span class="sq-edge sq-h">−log ↔ flip the sign</span>
    <span class="sq-node sq-strong">pH</span>
    <span class="sq-edge sq-v">K<sub>w</sub>: exponents<br>sum to −14</span>
    <span class="sq-mid"></span>
    <span class="sq-edge sq-v">pH + pOH<br>= 14</span>
    <span class="sq-node">[${OH}]</span>
    <span class="sq-edge sq-h">−log ↔ flip the sign</span>
    <span class="sq-node">pOH</span>
  </div>`;
}

function introPowers() {
  return `<div class="intro">
    <p class="intro-eyebrow">Powers of Ten · the pH square</p>
    <p class="intro-lede">Every pH question on the exam is one of these moves. The concentrations are always clean powers of ten — so there is <strong>never anything to calculate</strong>, only exponents to read.</p>
    ${phSquare()}
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>pH = −log₁₀[H⁺]</strong> — with a power of ten, the pH is the exponent, sign flipped. <span class="muted-ex">[H⁺] = 10⁻⁵ M → pH 5</span></span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>pH + pOH = 14</strong> — the pair always shares 14. <span class="muted-ex">pH 3 ↔ pOH 11</span></span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>[H⁺]·[OH⁻] = K<sub>w</sub> = 10⁻¹⁴</strong> — multiplying powers of ten adds exponents, so the two exponents sum to −14. <span class="muted-ex">10⁻⁴ pairs with 10⁻¹⁰</span></span></li>
    </ol>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — [${OH}] = 10<sup>−4</sup> M. What is the pH?</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">[${OH}] = 10<sup>−4</sup> → <strong>pOH 4</strong> (flip the sign).</span></li>
        <li><span class="step-num">2</span><span class="step-text">pH = 14 − 4 → <strong>pH 10</strong>. Basic — more OH⁻ than H⁺, just as the pH says.</span></li>
      </ol>
    </div>
    ${spine()}
    <p class="spine-note">The spine runs rust → beige → <strong>teal at 7</strong> → forest. After each Check, your answer takes its place on it.</p>
    ${startControls()}
  </div>`;
}

function renderIntro() {
  root.innerHTML = `${tierTabs()}${introPowers()}`;
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); renderIntro(); }));
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

function renderPlay() {
  const remaining = queue.length;
  const isExp = problem.answerKind === "exponent";

  const promptCard = `<div class="formula-card">
      <span class="card-tag">${tier().label}</span>
      <p class="formula ph-formula">${renderGiven(problem)}</p>
      <p class="ox-ask">${renderAsk(problem)}</p>
    </div>`;

  // Exponent answers type INTO the superscript slot of "10^▢ M"; pH/pOH answers are a plain box.
  const buildLabel = isExp ? "Type the exponent" : `Type the ${problem.ask}`;
  let answerArea;
  if (checked) {
    answerArea = `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${graded.correct ? formatAnswer(problem) : (Number.isNaN(graded.value) ? "—" : (isExp ? `10${supNum(graded.value)} M` : `${problem.ask} ${graded.value}`))}</span></div>`;
  } else if (isExp) {
    answerArea = `<label class="exp-label">[${problem.ask === "H" ? H : OH}] = 10<input class="answer-input exp-input" id="answerInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="?" value="${typed.replace(/"/g, "&quot;")}"><span class="exp-unit">M</span></label>`;
  } else {
    answerArea = `<input class="answer-input" id="answerInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="${problem.ask} = ?" value="${typed.replace(/"/g, "&quot;")}">`;
  }

  const shown = problem.hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < problem.hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  let reveal = "", feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">${hintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
    reveal = `<p class="reveal">${renderGiven(problem)} &nbsp;→&nbsp; <strong>${formatAnswer(problem)}</strong></p>${spine(problem.ph)}`;
  }

  const nudgeHtml = (!checked && nudge) ? `<p class="ox-nudge">${nudge}</p>` : "";

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How the pH square works</button>
    ${promptCard}

    <p class="build-label">${buildLabel}</p>
    <div class="answer-row">${answerArea}</div>
    ${nudgeHtml}
    ${hintBlock}

    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${remaining} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${typed.trim() ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => {
      typed = input.value;
      const b = root.querySelector("#checkBtn"); if (b) b.disabled = !typed.trim();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    input.focus();
  }
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
}

function renderDone() {
  const chipOf = (p) => renderGiven(p);
  const missedChips = missedThisRound.map((p) => `<span class="chip">${chipOf(p)}</span>`).join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block"><p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} with no hints. 🎉</p>`;

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${roundTotal} conversions, ${cleanSolves} solved hint-free.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <p class="done-next">Go again below — more rungs of the ladder are on the way.</p>
    ${startControls()}`;

  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); mode = "intro"; render(); }));
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => {
    queue = missedThisRound.slice();
    roundTotal = queue.length; solvedThisRound = 0; cleanSolves = 0; missedThisRound = []; mode = "play"; loadCard();
  });
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

render();
