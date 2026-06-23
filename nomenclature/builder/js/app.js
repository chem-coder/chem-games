// Type I ionic Name Builder — DOM layer. Pure logic lives in builder.js; this wires it to the
// screen. Version-tag internal imports so one release bump busts the whole module graph in cache.
import { toSubHtml, formatCharge } from "../../js/chem.js?v=20260623-type3c";
import { LEVELS, gradeAnswer, buildRound, requeue, DEFAULT_ROUND, FIXED_CHARGES, VARIABLE_STATES } from "./builder.js?v=20260623-type3c";
import { renderMetalsTable } from "./periodic-table.js?v=20260623-type3c";

const root = document.querySelector("#game");

// ── periodic-table memory aids for the intros ──
const TYPE1_PALETTE = {
  c1: { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent-dark)" }, // 1+
  c2: { fill: "var(--plum-soft)", stroke: "var(--plum)", text: "var(--plum-dark)" },       // 2+
  c3: { fill: "var(--warning-soft)", stroke: "var(--warning-line)", text: "#7a5e15" }      // 3+
};
const TYPE2_PALETTE = { v: { fill: "var(--warning-soft)", stroke: "var(--warning-line)", text: "#7a5e15" } };

// Type I: color each metal by its charge (so a whole column shares a color — the memory hook).
function type1Table() {
  const highlight = {}, labels = {};
  for (const [sym, q] of Object.entries(FIXED_CHARGES)) {
    highlight[sym] = q === 1 ? "c1" : q === 2 ? "c2" : "c3";
    labels[sym] = formatCharge(q);
  }
  return renderMetalsTable(highlight, TYPE1_PALETTE, labels);
}

// Type II: highlight the variable metals, label each with its possible oxidation states.
function type2Table() {
  const highlight = {}, labels = {};
  for (const [sym, states] of Object.entries(VARIABLE_STATES)) {
    highlight[sym] = "v";
    labels[sym] = states.join(",");
  }
  return renderMetalsTable(highlight, TYPE2_PALETTE, labels);
}

let levelIndex = 0; // 0 = Type I, 1 = Type II
const level = () => LEVELS[levelIndex];

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
  queue = buildRound(level().compounds(), DEFAULT_ROUND);
  roundTotal = queue.length;
  masteredThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  problem = level().build(queue[0]);
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

function levelTabs() {
  return `<div class="level-tabs" role="tablist">${LEVELS.map((l, i) =>
    `<button class="level-tab${i === levelIndex ? " is-active" : ""}" data-level="${i}" type="button" role="tab" aria-selected="${i === levelIndex}">${l.label}</button>`
  ).join("")}</div>`;
}

// The visual concept, recreated as our own component from the course slide: a name is two blocks.
// Type I: [metal · cation name] + [nonmetal + -ide]. Type II adds a Roman-numeral charge to the metal.
function introTypeI() {
  return `<div class="intro">
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
    <div class="pt-block">
      <p class="pt-heading">The fixed-charge metals — memorize these</p>
      ${type1Table()}
      <div class="pt-legend">
        <span class="leg"><i class="sw c1"></i>1+ · group 1 + silver</span>
        <span class="leg"><i class="sw c2"></i>2+ · group 2 + zinc</span>
        <span class="leg"><i class="sw c3"></i>3+ · aluminum</span>
      </div>
      <ul class="pt-points">
        <li><strong>group 1</strong> → always 1+</li>
        <li><strong>group 2</strong> → always 2+</li>
        <li><strong>aluminum</strong> → 3+</li>
        <li>just know these two: <strong>zinc</strong> is 2+, <strong>silver</strong> is 1+ (not given by the group)</li>
      </ul>
    </div>
    <div class="controls"><button class="action primary" id="startBtn">Start — 5 to name →</button></div>
  </div>`;
}

function introTypeII() {
  return `<div class="intro">
    <p class="intro-eyebrow">Binary ionic · Type II metal (variable charge)</p>
    <p class="intro-lede">Same two blocks — but this metal can carry more than one charge, so you must <strong>say which</strong>, with a Roman numeral.</p>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">metal <span class="roman">(?)</span></span>
        <span class="block-sub">cation name + charge</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main">nonmetal<span class="suffix"> + <em>ide</em></span></span>
        <span class="block-sub"><em>anion name root</em></span>
      </div>
    </div>
    <p class="schema-note">Find the charge from the formula: balance the anion's total, then read off the metal's.</p>
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("CuCl")}</span><span class="arrow">→</span><span class="w-cation">copper</span><span class="w-roman">(I)</span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("CuCl2")}</span><span class="arrow">→</span><span class="w-cation">copper</span><span class="w-roman">(II)</span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("Fe2O3")}</span><span class="arrow">→</span><span class="w-cation">iron</span><span class="w-roman">(III)</span> <span class="w-anion">ox<span class="ide">ide</span></span></div>
    </div>
    <div class="pt-block">
      <p class="pt-heading">The variable-charge metals — just get the idea</p>
      ${type2Table()}
      <ul class="pt-points prose">
        <li>These are mostly transition metals, and they can take more than one charge.</li>
        <li>The small numbers are their common oxidation states.</li>
        <li>Don't memorize them — just know the charge <strong>varies</strong>.</li>
        <li>So you have to work it out from each formula.</li>
      </ul>
    </div>
    <div class="controls"><button class="action primary" id="startBtn">Start — 5 to name →</button></div>
  </div>`;
}

function renderIntro() {
  root.innerHTML = `${levelTabs()}${level().id === "type1" ? introTypeI() : introTypeII()}`;
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { levelIndex = Number(b.dataset.level); renderIntro(); })
  );
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
    <button class="intro-link" id="introBtn" type="button">↩ How ${level().label} names work</button>
    <div class="formula-card">
      <span class="card-tag">Ionic · ${level().label}</span>
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
    .map((s) => `<span class="chip">${toSubHtml(level().build(s).formula)}</span>`)
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
