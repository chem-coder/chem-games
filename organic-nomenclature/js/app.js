// Organic Nomenclature — DOM layer. Pure logic lives in organic.js (naming) and chem.js
// (structure grading); the lab canvas comes from lab.js. Same rhythm as the inorganic
// builder: intro → 5-card round → done, progressive hints, missed cards rotate back.
// Two directions per rung: formula → name (typed) and name → structure (built on canvas).
import { toSubHtml, toChainHtml, ALKANES, LEVELS, buildProblemStructure, gradeAnswer, makeDealer, requeue, DEFAULT_ROUND } from "./organic.js";
import { gradeAlkaneBuild } from "./chem.js";
import { createLab } from "./lab.js";

const root = document.querySelector("#game");

// One dealer per rung + one for the build direction (shared across rungs — building
// propane is the same skill whichever spelling tab you came from).
const dealers = { molecular: makeDealer(), condensed: makeDealer(), build: makeDealer() };

let levelIndex = 0; // 0 = molecular, 1 = condensed
const level = () => LEVELS[levelIndex];

let mode = "intro"; // "intro" | "play" | "done"
let direction = "name"; // "name" | "build"
let queue = [];
let roundTotal = 0;
let problem = null;
let typed = "";
let hintsShown = 0;
let checked = false;
let graded = null;
let masteredThisRound = 0;
let cleanSolves = 0;
let missedThisRound = [];
let lab = null; // live canvas instance, build direction only

function killLab() {
  if (lab) { lab.destroy(); lab = null; }
}

function startRound(dir) {
  direction = dir;
  queue = dealers[dir === "build" ? "build" : level().id](DEFAULT_ROUND);
  roundTotal = queue.length;
  masteredThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  problem = direction === "build" ? buildProblemStructure(queue[0]) : level().build(queue[0]);
  typed = "";
  hintsShown = 0;
  checked = false;
  graded = null;
  render();
}

function check() {
  if (checked) return;
  if (direction === "build") {
    if (!lab || lab.atoms().length === 0) return;
    graded = { correct: gradeAlkaneBuild(lab.atoms(), lab.bonds(), problem.n).ok };
    lab.setLocked(true);
  } else {
    if (!typed.trim()) return;
    graded = gradeAnswer(problem, typed);
  }
  checked = true;
  if (graded.correct) {
    masteredThisRound += 1;
    if (hintsShown === 0) cleanSolves += 1;
  } else {
    missedThisRound.push(problem.spec);
  }
  if (direction === "build") updateBuildAfterCheck();
  else render();
}

function showHint() {
  if (hintsShown < problem.hints.length) hintsShown += 1;
  if (direction === "build") updateBuildHints();
  else render();
}

function next() {
  queue = requeue(queue, graded.correct);
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── rendering ──
function render() {
  killLab();
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  if (direction === "build") return renderPlayBuild();
  renderPlayName();
}

function levelTabs() {
  return `<div class="level-tabs" role="tablist">${LEVELS.map((l, i) =>
    `<button class="level-tab${i === levelIndex ? " is-active" : ""}" data-level="${i}" type="button" role="tab" aria-selected="${i === levelIndex}">${l.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { levelIndex = Number(b.dataset.level); mode = "intro"; render(); })
  );
}

// Both directions are live: type the name, or build the structure on the lab canvas.
function startControls() {
  return `<div class="controls two-up">
    <button class="action primary" id="startName">Name the alkane</button>
    <button class="action primary alt" id="startBuild">Build the molecule</button>
  </div>`;
}

function wireStartControls() {
  root.querySelector("#startName").addEventListener("click", () => startRound("name"));
  root.querySelector("#startBuild").addEventListener("click", () => startRound("build"));
}

function introMolecular() {
  return `<div class="intro">
    <p class="intro-eyebrow">Alkanes · molecular formulas</p>
    <p class="intro-lede">Organic names are built from pieces. An alkane's name is two:</p>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">root</span>
        <span class="block-sub">how many carbons</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main"><em class="suffix-ane">ane</em></span>
        <span class="block-sub">the alkane family — all single bonds</span>
      </div>
    </div>
    <p class="schema-note">An alkane is C<sub>n</sub>H<sub>2n+2</sub> — count the <strong>C</strong>, and the H count comes along for free.</p>
    <div class="prefix-grid">${ALKANES.map((a) => `<span><strong>${a.root}</strong> ${a.n}</span>`).join("")}</div>
    <ul class="pt-points">
      <li>The first four are their own words — <strong>M</strong>onkeys <strong>E</strong>at <strong>P</strong>eanut <strong>B</strong>utter.</li>
      <li>From <strong>pent‑</strong> on you already know them: the Greek prefixes from covalent naming (penta, hexa, hepta…).</li>
    </ul>
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("CH4")}</span><span class="arrow">→</span><span class="w-root">meth</span><span class="w-ane">ane</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("C2H6")}</span><span class="arrow">→</span><span class="w-root">eth</span><span class="w-ane">ane</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("C4H10")}</span><span class="arrow">→</span><span class="w-root">but</span><span class="w-ane">ane</span></div>
    </div>
    <p class="pt-note">Out in the wild, butane also gets written carbon-by-carbon: ${toSubHtml("CH3CH2CH2CH3")}. Same molecule — that spelling is the <strong>Condensed formulas</strong> rung above.</p>
    ${startControls()}
  </div>`;
}

function introCondensed() {
  return `<div class="intro">
    <p class="intro-eyebrow">Alkanes · condensed formulas</p>
    <p class="intro-lede">Same ten alkanes — new spelling. A condensed formula writes the chain <strong>carbon by carbon</strong>:</p>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">${toSubHtml("CH3")}</span>
        <span class="block-sub">end cap — starts and ends the chain</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main">${toSubHtml("CH2")}</span>
        <span class="block-sub">chain link — repeats in the middle</span>
      </div>
    </div>
    <p class="schema-note">Every group holds exactly <strong>one carbon</strong> — count the groups and you've counted the carbons.</p>
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("CH3CH3")}</span><span class="arrow">→</span><span class="w-root">eth</span><span class="w-ane">ane</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("CH3CH2CH3")}</span><span class="arrow">→</span><span class="w-root">prop</span><span class="w-ane">ane</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("CH3CH2CH2CH3")}</span><span class="arrow">→</span><span class="w-root">but</span><span class="w-ane">ane</span></div>
    </div>
    <ul class="pt-points">
      <li>${toSubHtml("C4H10")} and ${toSubHtml("CH3CH2CH2CH3")} are the <strong>same butane</strong> — but the condensed spelling also shows the <strong>structure</strong>: one unbranched chain.</li>
      <li>You'll also meet it with dashes — ${toSubHtml("CH3")}–${toSubHtml("CH2")}–${toSubHtml("CH2")}–${toSubHtml("CH3")} — same thing, bonds drawn in.</li>
    </ul>
    ${startControls()}
  </div>`;
}

function renderIntro() {
  const body = level().id === "molecular" ? introMolecular() : introCondensed();
  root.innerHTML = `${levelTabs()}${body}`;
  wireTabs();
  wireStartControls();
}

// ── play: formula → name (typed) ──
function renderPlayName() {
  const remaining = queue.length;
  const condensed = level().id === "condensed";
  const promptHtml = condensed ? toChainHtml(problem.prompt) : toSubHtml(problem.prompt);
  const answer = checked
    ? `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${graded.correct ? problem.answer : (typed || "—")}</span></div>`
    : `<input class="answer-input" id="answerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="${typed.replace(/"/g, "&quot;")}">`;

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
    reveal = `<p class="reveal">${promptHtml} &nbsp;=&nbsp; <strong>${problem.answer}</strong></p>`;
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How alkane names work</button>
    <div class="formula-card">
      <span class="card-tag">Organic · Alkanes · ${condensed ? "condensed" : "molecular"}</span>
      <p class="formula${condensed ? " as-chain" : ""}">${promptHtml}</p>
    </div>

    <p class="build-label">Name this alkane</p>
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

// ── play: name → structure (built on the lab canvas) ──
// This screen renders ONCE per card and then patches sub-areas: a full re-render
// would destroy the canvas — and the student's half-built molecule with it.
function renderPlayBuild() {
  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How alkane names work</button>
    <div class="formula-card">
      <span class="card-tag">Organic · Alkanes · build it</span>
      <p class="build-target">${problem.prompt}</p>
    </div>

    <p class="build-label">Build this molecule</p>
    <canvas class="lab-canvas" id="labCanvas"></canvas>
    <div id="hintArea"></div>
    <div id="verdictArea"></div>
    <div class="controls">
      <p class="score" id="scoreLine"></p>
      <button class="action primary" id="checkBtn" disabled>Check</button>
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelector("#checkBtn").addEventListener("click", check);
  updateBuildHints();
  updateScoreLine();

  lab = createLab(root.querySelector("#labCanvas"), {
    onChange() {
      const btn = root.querySelector("#checkBtn");
      if (btn && !checked) btn.disabled = lab.atoms().length === 0;
    }
  });
}

function updateScoreLine() {
  root.querySelector("#scoreLine").textContent = `Built ${masteredThisRound} of ${roundTotal} · ${queue.length} left`;
}

function updateBuildHints() {
  const area = root.querySelector("#hintArea");
  if (!area || checked) return;
  const shown = problem.hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  area.innerHTML = `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < problem.hints.length
        ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>`
        : ""}
    </div>`;
  const hintBtn = area.querySelector("#hintBtn");
  if (hintBtn) hintBtn.addEventListener("click", showHint);
}

function updateBuildAfterCheck() {
  root.querySelector("#hintArea").innerHTML = "";
  const feedback = graded.correct
    ? `<p class="feedback ok">${hintsShown ? "Correct." : "Built clean — no hints. 💪"} It leaves the stack.</p>`
    : `<p class="feedback no">Not quite — this one comes back around.</p>`;
  // reveal after Check in both outcomes, matching the typed direction — the structure
  // itself stays unrevealed, so a missed card still takes real work when it returns
  const reveal = `<p class="reveal"><strong>${problem.answer}</strong> &nbsp;=&nbsp; ${toSubHtml(problem.formula)} &nbsp;·&nbsp; ${toChainHtml(problem.condensed)}</p>`;
  root.querySelector("#verdictArea").innerHTML = `${reveal}${feedback}`;
  const controls = root.querySelector(".controls");
  controls.innerHTML = `
    <p class="score" id="scoreLine"></p>
    <button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? "Next →" : "Finish"}</button>`;
  updateScoreLine();
  const nextBtn = root.querySelector("#nextBtn");
  nextBtn.addEventListener("click", next);
  nextBtn.focus();
}

// ── done ──
function renderDone() {
  const verb = direction === "build" ? "Built" : "Named";
  const missedChips = missedThisRound
    .map((s) => `<span class="chip">${direction === "build" ? buildProblemStructure(s).answer : toSubHtml(level().build(s).formula)}</span>`)
    .join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p>
        <div class="chips">${missedChips}</div>
      </div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} ${verb.toLowerCase()} with no hints. 🎉</p>`;

  root.innerHTML = `
    ${levelTabs()}
    <p class="prompt">Round done — ${roundTotal} alkanes, ${cleanSolves} ${verb.toLowerCase()} hint-free.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <p class="done-next">Two rounds cover the whole ladder, methane through decane.</p>
    ${startControls()}`;

  wireTabs();
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
  wireStartControls();
}

render();

// Debug handle for headless verification — not part of the game surface.
window.__game = { get lab() { return lab; }, get problem() { return problem; }, check, next };
