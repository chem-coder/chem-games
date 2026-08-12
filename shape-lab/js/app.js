// Shape Lab — from Lewis structures to 3D shapes. See documentation/BONDING_GAME_DESIGN.md.
// v0.1: the Geometries rung (visual table + rotating 3D popups). The other rungs are
// designed and stubbed — their intros say what's coming, and the tabs never dead-end.

import { GEOMETRIES, GEO_BY_ID, GEO_GROUPS, fmtFormula } from "./geometry.js";
import { makeSpinner } from "./render3d.js";
import { MOLECULES, BUILD_BANK } from "./molecules.js";
import { createKit } from "./modelkit.js";
import { sceneSvg, fcScene, FC_RULES, FC_EXAMPLES, FC_BANK, fcAnswer, LEWIS_STEPS, WALKTHROUGHS } from "./lewis.js";

const root = document.getElementById("game");
const ROUND_SIZE = 8;
const BUILD_ROUND_SIZE = 5;
const FC_ROUND_SIZE = 6;

const TIERS = [
  { id: "formal-charge", label: "Formal charge", built: true },
  { id: "lewis", label: "Lewis structures", built: true },
  { id: "geometries", label: "Geometries", built: true },
  { id: "build", label: "Build molecules", built: true },
  { id: "polarity", label: "Polarity", built: false,
    blurb: "Rotating molecules wrapped in semitransparent electron clouds, red→blue from the negative end to the positive one. See why CO₂ cancels and H₂O doesn't." },
];
let tierIndex = 0; // the ladder starts at formal charge — Dalia's order
const tier = () => TIERS[tierIndex];
let mode = "intro"; // intro (the catalog) | play | done

// ── quiz round state ──
let queue = [];
let roundTotal = 0;
let problem = null;
let selected = null;
let checked = false;
let wasCorrect = false;
let hintsShown = 0;
let solvedThisRound = 0;
let cleanSolves = 0;
let missedThisRound = [];

let activeSpinners = [];
function stopSpinners() { activeSpinners.forEach((s) => s.stop()); activeSpinners = []; }

const shuffle = (a) => {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ── navigation (house rules: tabs on every screen, no dead ends) ──
function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map((t, i) =>
    `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${t.label}</button>`
  ).join("")}</div>`;
}
function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); mode = "intro"; render(); }));
}

let kit = null;
function destroyKit() { if (kit) { kit.destroy(); kit = null; } }

function render() {
  stopSpinners();
  destroyKit();
  closeModal();
  if (!tier().built) return renderStub();
  if (tier().id === "build") {
    if (mode === "play") return renderBuildPlay();
    if (mode === "done") return renderBuildDone();
    return renderBuildIntro();
  }
  if (tier().id === "formal-charge") {
    if (mode === "play") return renderFCPlay();
    if (mode === "done") return renderFCDone();
    return renderFCIntro();
  }
  if (tier().id === "lewis") return renderLewisIntro();
  if (mode === "play") return renderPlay();
  if (mode === "done") return renderDone();
  renderGeometries();
}

// ── quiz round mechanics ──
function startRound(cards) {
  queue = cards ? cards.slice() : shuffle(MOLECULES).slice(0, ROUND_SIZE);
  queue.forEach((m) => { m.options = makeOptions(m); }); // fresh lineup every round
  roundTotal = queue.length;
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  mode = "play";
  loadCard();
}

// Distractors, Dalia's recipe: geometries whose BOND count sits within ±1 of the
// answer's, so nothing in the lineup is obviously wrong — counting regions is the
// only way through. Four distractors + the truth, shuffled.
function makeOptions(m) {
  const g = GEO_BY_ID[m.geo];
  const near = GEOMETRIES.filter((x) => x.id !== g.id && Math.abs(x.bonds - g.bonds) <= 1);
  return shuffle([g, ...shuffle(near).slice(0, 4)]).map((x) => x.id);
}

function loadCard() {
  problem = queue[0];
  selected = null; checked = false; wasCorrect = false; hintsShown = 0;
  render();
}

function hintsFor(m) {
  const g = GEO_BY_ID[m.geo];
  return [
    `Around ${m.center}: <strong>${m.bonds}</strong> bonded atom${m.bonds > 1 ? "s" : ""} and <strong>${m.lps}</strong> lone pair${m.lps === 1 ? "" : "s"} — bonds of any order count once.`,
    `That's <strong>${g.regions} regions</strong> → electron geometry <strong>${g.eGeo}</strong>. Now let the lone pairs take their seats and read what the atoms trace.`,
  ];
}

function reasoning(m) {
  const g = GEO_BY_ID[m.geo];
  return `${m.center}: ${m.bonds} bonded atom${m.bonds > 1 ? "s" : ""} + ${m.lps} lone pair${m.lps === 1 ? "" : "s"} = ${g.regions} regions → ${g.eGeo}${g.lonePairs ? " with the lone pair" + (g.lonePairs > 1 ? "s" : "") + " seated" : ""} → <strong>${g.name}</strong>.`;
}

function check() {
  if (!selected || checked) return;
  checked = true;
  wasCorrect = selected === problem.geo;
  if (wasCorrect) {
    solvedThisRound += 1;
    if (hintsShown === 0) cleanSolves += 1;
  } else if (!missedThisRound.includes(problem)) {
    missedThisRound.push(problem);
  }
  render();
}

function next() {
  if (wasCorrect) queue.shift();
  else queue.push(queue.shift()); // wrong ones come back around
  if (queue.length === 0) { mode = "done"; render(); } else loadCard();
}

function showHint() { hintsShown += 1; render(); }

// ── stub intros for the designed-but-unbuilt rungs ──
function renderStub() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · ${tier().label}</p>
      <p class="intro-lede">${tier().blurb}</p>
      <p class="stub-note">This rung is designed and on the bench — see the Geometries tab for what's playable today.</p>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;
  wireTabs();
}

// ── the Geometries rung: the visual table ──
function geoCell(id) {
  const g = GEO_BY_ID[id];
  return `<button class="geo-cell" data-geo="${g.id}" type="button" aria-label="${g.name}, ${g.angle}">
    <canvas class="geo-thumb" width="120" height="110"></canvas>
    <span class="geo-name">${g.name}</span>
    <span class="geo-meta">${g.bonds} bond${g.bonds > 1 ? "s" : ""}${g.lonePairs ? ` · ${g.lonePairs} lone pair${g.lonePairs > 1 ? "s" : ""}` : ""}</span>
    <span class="geo-angle">${g.angle}</span>
  </button>`;
}

function renderGeometries() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · the geometry catalog</p>
      <p class="intro-lede">Count the <strong>electron density regions</strong> around the central atom — bonds of any order count once, lone pairs count once. The count picks the row; the lone pairs slide you rightward along it. <strong>Click any shape</strong> to see it turn in 3D with its angles and its quirks.</p>
    </div>
    ${GEO_GROUPS.map((grp) => `
      <div class="geo-group">
        <p class="geo-group-label">${grp.label}</p>
        <div class="geo-row">${grp.ids.map(geoCell).join("")}</div>
      </div>`).join("")}
    <div class="controls two-up"><button class="action primary" id="startBtn">Start the shape quiz →</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  root.querySelectorAll(".geo-cell").forEach((cell) => {
    const g = GEO_BY_ID[cell.dataset.geo];
    const spinner = makeSpinner(cell.querySelector(".geo-thumb"), g, { small: true, startAngle: 0.6 });
    spinner.drawFrame(0.6); // static pose in the table; motion is the popup's reward
    cell.addEventListener("click", () => openModal(g));
  });
  root.querySelector("#startBtn").addEventListener("click", () => startRound());
}

// ── the quiz screen ──
function renderPlay() {
  const g = GEO_BY_ID[problem.geo];
  const hints = hintsFor(problem);
  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  const optionBtns = problem.options.map((id) => {
    const opt = GEO_BY_ID[id];
    let cls = "opt";
    if (!checked && id === selected) cls += " sel";
    if (checked && id === problem.geo) cls += " right";
    if (checked && id === selected && id !== problem.geo) cls += " wrong";
    return `<button class="${cls}" data-opt="${id}" type="button" ${checked ? "disabled" : ""}>${opt.name}</button>`;
  }).join("");

  const feedback = !checked ? `<p class="feedback">&nbsp;</p>`
    : wasCorrect
      ? `<p class="feedback ok">${hintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
  const reveal = checked ? `
    <div class="reveal-row">
      <canvas class="reveal-stage" id="revealStage" width="170" height="150"></canvas>
      <p class="reveal-text">${reasoning(problem)}</p>
    </div>` : "";

  root.innerHTML = `
    ${tierTabs()}
    <button class="intro-link" id="introBtn" type="button">↩ Back to the geometry catalog</button>
    <div class="formula-card">
      <span class="card-tag">Shape quiz</span>
      <p class="formula">${fmtFormula(problem.f)}</p>
      <p class="shape-ask">what shape does this molecule take?</p>
    </div>
    <div class="opt-grid">${optionBtns}</div>
    ${hintBlock}
    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${queue.length} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !wasCorrect ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${selected ? "" : "disabled"}>Check</button>`}
    </div>`;

  wireTabs();
  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
    selected = b.dataset.opt;
    root.querySelectorAll(".opt").forEach((x) => x.classList.toggle("sel", x.dataset.opt === selected));
    const cb = root.querySelector("#checkBtn"); if (cb) cb.disabled = false;
  }));
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }

  // The reward: the correct shape, turning. (Static frame if the tab is hidden.)
  const stage = root.querySelector("#revealStage");
  if (stage) {
    const spinner = makeSpinner(stage, g, { small: true, startAngle: 0.5 });
    spinner.drawFrame(0.5);
    spinner.start();
    activeSpinners.push(spinner);
  }
}

// ── shared click-through card player (six steps, FC examples, walkthroughs) ──
function openCards(cards, opts = {}) {
  closeModal();
  let idx = 0;
  modal = document.createElement("div");
  modal.className = "geo-modal";
  const paint = () => {
    modal.innerHTML = `
      <div class="geo-modal-card card-modal" role="dialog" aria-label="${opts.label || "cards"}">
        <button class="geo-close" type="button" aria-label="Close">✕</button>
        <div class="card-body">${cards[idx]}</div>
        <div class="card-nav">
          <button class="action ghost card-prev" type="button" ${idx === 0 ? "disabled" : ""}>← Back</button>
          <span class="step-dots">${cards.map((_, i) => `<span class="dot${i === idx ? " on" : ""}"></span>`).join("")}</span>
          ${idx < cards.length - 1
            ? `<button class="action primary card-next" type="button">Next →</button>`
            : `<button class="action primary card-next" type="button" data-done="1">Done ✓</button>`}
        </div>
      </div>`;
    modal.querySelector(".geo-close").addEventListener("click", closeModal);
    modal.querySelector(".card-prev").addEventListener("click", () => { if (idx > 0) { idx -= 1; paint(); } });
    modal.querySelector(".card-next").addEventListener("click", (e) => {
      if (e.currentTarget.dataset.done) closeModal();
      else { idx += 1; paint(); }
    });
  };
  paint();
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", onModalKey);
  document.body.appendChild(modal);
}

// ── the Formal Charge rung ──
let fcTyped = "", fcChecked = false, fcCorrect = false, fcNudge = null, fcHintsShown = 0;

const fcCard = (ex) => `
  <p class="card-title">${ex.title}</p>
  <div class="fc-sketch">${sceneSvg(fcScene(ex.item), 260, 170)}</div>
  <p class="card-text">${ex.text}</p>`;

function startFCRound(cards) {
  queue = cards ? cards.slice() : shuffle(FC_BANK).slice(0, FC_ROUND_SIZE);
  roundTotal = queue.length;
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  mode = "play";
  loadFCCard();
}
function loadFCCard() {
  problem = queue[0];
  fcTyped = ""; fcChecked = false; fcCorrect = false; fcNudge = null; fcHintsShown = 0;
  render();
}

const fmtFC = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");

function parseFC(s) {
  const t = s.trim().replace(/−/g, "-");
  if (/^[0-3][+-]$/.test(t)) return { nudge: "Right idea — but write the sign first: " + t[1] + t[0] + ", not " + t + "." };
  const m = t.match(/^([+-]?)([0-3])$/);
  if (!m) return { nudge: "Formal charges here run from −3 to +3 — a small signed number." };
  if (!m[1] && m[2] !== "0") return { nudge: "Nonzero charges carry their sign — write it first (+1, −2, …)." };
  return { value: (m[1] === "-" ? -1 : 1) * Number(m[2]) };
}

function fcCheck() {
  if (!fcTyped.trim() || fcChecked) return;
  const p = parseFC(fcTyped);
  if (p.nudge) { fcNudge = p.nudge; render(); return; }
  fcNudge = null;
  fcChecked = true;
  fcCorrect = p.value === fcAnswer(problem);
  if (fcCorrect) { solvedThisRound += 1; if (fcHintsShown === 0) cleanSolves += 1; }
  else if (!missedThisRound.includes(problem)) missedThisRound.push(problem);
  render();
}
function fcNext() {
  if (fcCorrect) queue.shift();
  else queue.push(queue.shift());
  if (queue.length === 0) { mode = "done"; render(); } else loadFCCard();
}

function renderFCIntro() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · formal charge</p>
      <p class="intro-lede">Every atom in a drawing gets a bookkeeping score:</p>
      <p class="fc-formula">FC&nbsp;=&nbsp;valence e⁻&nbsp;−&nbsp;dots&nbsp;−&nbsp;sticks</p>
      <p class="intro-lede">Count the electrons the atom <em>brought</em>, subtract the lone-pair dots it keeps and the bonds it holds. The score tells you whether your Lewis structure is honest — and it comes back again and again: in resonance, in organic, everywhere.</p>
      <ol class="steps">
        ${FC_RULES.map((r, i) => `<li><span class="step-num">${i + 1}</span><span class="step-text">${r}</span></li>`).join("")}
      </ol>
    </div>
    <div class="controls two-up">
      <button class="action ghost" id="examplesBtn">Walk through 3 examples</button>
      <button class="action primary" id="startBtn">Start the drill →</button>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;
  wireTabs();
  root.querySelector("#examplesBtn").addEventListener("click", () => openCards(FC_EXAMPLES.map(fcCard), { label: "Formal charge examples" }));
  root.querySelector("#startBtn").addEventListener("click", () => startFCRound());
}

function renderFCPlay() {
  const hints = [
    `FC = valence − dots − sticks. ${problem.el} brings <strong>${problem.v}</strong> valence electrons.`,
    `Here it keeps <strong>${problem.lp * 2}</strong> dots and holds <strong>${problem.bonds}</strong> stick${problem.bonds === 1 ? "" : "s"}: ${problem.v} − ${problem.lp * 2} − ${problem.bonds}.`,
  ];
  const shown = hints.slice(0, fcHintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = fcChecked ? "" : `<div class="hints">
      ${fcHintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${fcHintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${fcHintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  const answerArea = fcChecked
    ? `<div class="answer-built ${fcCorrect ? "ok" : "no"}"><span>${fmtFC(fcAnswer(problem))}</span></div>`
    : `<input class="answer-input" id="answerInput" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="+1  or  −2  or  0" value="${fcTyped.replace(/"/g, "&quot;")}">`;

  const feedback = !fcChecked ? `<p class="feedback">&nbsp;</p>`
    : fcCorrect
      ? `<p class="feedback ok">${fcHintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — ${problem.el}: ${problem.v} − ${problem.lp * 2} − ${problem.bonds} = ${fmtFC(fcAnswer(problem))}. It comes back around.</p>`;

  root.innerHTML = `
    ${tierTabs()}
    <button class="intro-link" id="introBtn" type="button">↩ How formal charge works</button>
    <div class="formula-card">
      <span class="card-tag">Formal charge</span>
      <div class="fc-sketch">${sceneSvg(fcScene(problem), 260, 150)}</div>
      <p class="shape-ask">${problem.ctx}: <strong>${problem.bonds}</strong> bond${problem.bonds === 1 ? "" : "s"}, <strong>${problem.lp}</strong> lone pair${problem.lp === 1 ? "" : "s"}. Formal charge?</p>
    </div>
    <div class="answer-row">${answerArea}</div>
    ${fcNudge ? `<p class="ox-nudge">${fcNudge}</p>` : ""}
    ${hintBlock}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${queue.length} left</p>
      ${fcChecked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !fcCorrect ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${fcTyped.trim() ? "" : "disabled"}>Check</button>`}
    </div>`;

  wireTabs();
  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => { fcTyped = input.value; const b = root.querySelector("#checkBtn"); if (b) b.disabled = !fcTyped.trim(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); fcCheck(); } });
    input.focus();
  }
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", () => { fcHintsShown += 1; render(); });
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", fcCheck);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", fcNext); nextBtn.focus(); }
}

function renderFCDone() {
  const missedChips = missedThisRound.map((m) => `<span class="chip">${m.ctx}</span>`).join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block"><p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} with no hints. 🎉</p>`;
  const nextTier = TIERS[tierIndex + 1];

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${roundTotal} atoms scored, ${cleanSolves} hint-free.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <div class="controls two-up done-nav">
      <button class="action primary" id="nextTierBtn">Next topic: ${nextTier.label} →</button>
      <button class="action ghost" id="revisitBtn">↩ Revisit formal charge</button>
    </div>
    <p class="done-next">Or run another round:</p>
    <div class="controls two-up"><button class="action primary" id="startBtn">Start the drill →</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  root.querySelector("#nextTierBtn").addEventListener("click", () => { tierIndex += 1; mode = "intro"; render(); });
  root.querySelector("#revisitBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => startFCRound(missedThisRound));
  root.querySelector("#startBtn").addEventListener("click", () => startFCRound());
}

// ── the Lewis Structures rung ──
function walkthroughCards(w) {
  return w.steps.map((s, i) => `
    <p class="card-title">${fmtFormula(w.f)} · step ${i + 1} of ${w.steps.length}</p>
    <div class="fc-sketch walk-scene">${sceneSvg(s.scene, 340, 240)}</div>
    <p class="card-text">${s.t}</p>`);
}

function renderLewisIntro() {
  const rows = WALKTHROUGHS.map((w) => `
    <button class="lew-row${w.ready ? "" : " soon"}" data-walk="${w.id}" type="button" ${w.ready ? "" : "disabled"}>
      <span class="lew-formula">${fmtFormula(w.f)}</span>
      <span class="lew-name">${w.name}</span>
      <span class="lew-go">${w.ready ? "walk through it →" : "coming soon"}</span>
    </button>`).join("");

  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · Lewis structures</p>
      <p class="intro-lede">Six steps, always the same six, and any molecule on the syllabus comes out right: count, sketch, fill, compare, minimize, verify. Learn the steps once — then watch real molecules walk themselves through them below, and take the method to the Model Kit.</p>
    </div>
    <div class="controls two-up"><button class="action primary" id="stepsBtn">The six steps, card by card →</button></div>
    <p class="lew-table-label">Or pick a molecule and watch the method run:</p>
    <div class="lew-table">${rows}</div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  root.querySelector("#stepsBtn").addEventListener("click", () =>
    openCards(LEWIS_STEPS.map((s) => `<p class="card-title">${s.title}</p><p class="card-text">${s.body}</p>`), { label: "The six steps" }));
  root.querySelectorAll(".lew-row[data-walk]:not(.soon)").forEach((row) =>
    row.addEventListener("click", () => {
      const w = WALKTHROUGHS.find((x) => x.id === row.dataset.walk);
      openCards(walkthroughCards(w), { label: w.name });
    }));
}

// ── the Build rung: the Model Kit ──
let buildProblem = null;
let buildFailed = false;   // failed a Check on this card (for clean-solve tracking)
let buildSolved = false;
let chargePicked = null;

function startBuildRound(cards) {
  queue = cards ? cards.slice() : shuffle(BUILD_BANK).slice(0, BUILD_ROUND_SIZE);
  roundTotal = queue.length;
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  mode = "play";
  loadBuildCard();
}

function loadBuildCard() {
  buildProblem = queue[0];
  buildFailed = false; buildSolved = false; chargePicked = null;
  render();
}

function renderBuildIntro() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · the Model Kit</p>
      <p class="intro-lede">Every atom arrives carrying its own valence electrons — little dots resting at the compass points. Your job: share them into bonds until every atom is satisfied. Get it right, and the flat drawing snaps into its true 3D shape and turns.</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text"><strong>Drag atoms</strong> anywhere on the bench — they glide.</span></li>
        <li><span class="step-num">2</span><span class="step-text"><strong>Drag a dot onto another atom's dot</strong> to share a pair — that's a bond. Do it again for a double, once more for a triple.</span></li>
        <li><span class="step-num">3</span><span class="step-text"><strong>Double-click a bond</strong> to hand the electrons back.</span></li>
        <li><span class="step-num">4</span><span class="step-text"><strong>Answer the charge</strong> — a non-zero answer wraps the ion in its brackets.</span></li>
        <li><span class="step-num">5</span><span class="step-text"><strong>Check.</strong> Right: the molecule turns 3D and spins. Wrong: the Kit tells you which atom is unhappy, and why.</span></li>
      </ol>
      <p class="stub-note">Remember the octet rebels: H wants 2, Be is content with 4, B with 6 — and a row-2 atom can never hold more than 8.</p>
    </div>
    <div class="controls two-up"><button class="action primary" id="startBtn">Open the Model Kit →</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;
  wireTabs();
  root.querySelector("#startBtn").addEventListener("click", () => startBuildRound());
}

function renderBuildPlay() {
  const chargeBtns = [-3, -2, -1, 0, 1, 2, 3].map((q) =>
    `<button class="charge-btn${chargePicked === q ? " sel" : ""}" data-q="${q}" type="button" ${buildSolved ? "disabled" : ""}>${q === 0 ? "0" : (Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "−")}</button>`
  ).join("");

  root.innerHTML = `
    ${tierTabs()}
    <button class="intro-link" id="introBtn" type="button">↩ Kit guide</button>
    <div class="build-head">
      <p class="build-title">Build: <span class="build-formula">${fmtFormula(buildProblem.f)}</span></p>
      <div class="charge-ask"><span>What's the charge?</span><div class="charge-row">${chargeBtns}</div></div>
    </div>
    <canvas class="kit-canvas" id="kitCanvas"></canvas>
    <p class="feedback" id="buildFeedback">&nbsp;</p>
    <ul class="nudge-list" id="nudgeList"></ul>
    <div class="controls">
      <p class="score">Built ${solvedThisRound} of ${roundTotal} &middot; ${queue.length} left</p>
      <button class="action ghost" id="clearBtn" type="button">Clear the bench</button>
      <button class="action primary" id="checkBtn" ${chargePicked === null ? "disabled" : ""}>Check</button>
    </div>`;

  wireTabs();
  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });

  const canvas = root.querySelector("#kitCanvas");
  kit = createKit(canvas, buildProblem.atoms);
  window.__kit = kit; // dev handle

  const feedback = root.querySelector("#buildFeedback");
  const nudges = root.querySelector("#nudgeList");
  const checkBtn = root.querySelector("#checkBtn");

  root.querySelectorAll(".charge-btn").forEach((b) => b.addEventListener("click", () => {
    if (buildSolved) return;
    chargePicked = Number(b.dataset.q);
    kit.setCharge(chargePicked);
    root.querySelectorAll(".charge-btn").forEach((x) => x.classList.toggle("sel", Number(x.dataset.q) === chargePicked));
    checkBtn.disabled = false;
  }));

  root.querySelector("#clearBtn").addEventListener("click", () => { if (!buildSolved) { kit.clear(); nudges.innerHTML = ""; feedback.innerHTML = "&nbsp;"; feedback.className = "feedback"; } });

  checkBtn.addEventListener("click", () => {
    if (buildSolved) { // acting as Next
      queue.shift();
      if (queue.length === 0) { mode = "done"; render(); } else loadBuildCard();
      return;
    }
    const result = kit.check(buildProblem.charge);
    if (!result.ok) {
      if (!buildFailed) { buildFailed = true; if (!missedThisRound.includes(buildProblem)) missedThisRound.push(buildProblem); }
      feedback.textContent = "Not yet — the bench disagrees:";
      feedback.className = "feedback no";
      nudges.innerHTML = result.issues.map((i) => `<li>${i}</li>`).join("");
      return;
    }
    // Solved: the reward. The Kit freezes, and the same canvas becomes the 3D stage.
    buildSolved = true;
    solvedThisRound += 1;
    if (!buildFailed) cleanSolves += 1;
    const pose = kit.derive3D();
    kit.freeze(); kit.destroy(); kit = null;
    nudges.innerHTML = "";
    feedback.innerHTML = `Bonded and balanced — this is <strong>${fmtFormula(buildProblem.f)}</strong> in three dimensions. 🎉`;
    feedback.className = "feedback ok";
    if (pose) {
      const spinner = makeSpinner(canvas, pose, { startAngle: 0.5 });
      spinner.drawFrame(0.5);
      spinner.start();
      activeSpinners.push(spinner);
    }
    checkBtn.textContent = queue.length > 1 ? "Next →" : "Finish";
    root.querySelectorAll(".charge-btn").forEach((x) => { x.disabled = true; });
  });
}

function renderBuildDone() {
  const missedChips = missedThisRound.map((m) => `<span class="chip">${fmtFormula(m.f)}</span>`).join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block"><p class="missed-label">The bench argued with you on ${missedThisRound.length} — worth a rebuild:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean bench — every molecule built first try. 🎉</p>`;
  const nextTier = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null;

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Bench cleared — ${roundTotal} molecules built, ${cleanSolves} first-try.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Rebuild the ${missedThisRound.length} that fought back →</button></div>` : ""}
    <div class="controls two-up done-nav">
      ${nextTier ? `<button class="action primary" id="nextTierBtn">Next topic: ${nextTier.label} →</button>` : ""}
      <button class="action ghost" id="revisitBtn">↩ Revisit the Kit guide</button>
    </div>
    <p class="done-next">Or run another round:</p>
    <div class="controls two-up"><button class="action primary" id="startBtn">Open the Model Kit →</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  const nextTierBtn = root.querySelector("#nextTierBtn");
  if (nextTierBtn) nextTierBtn.addEventListener("click", () => { tierIndex += 1; mode = "intro"; render(); });
  root.querySelector("#revisitBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => startBuildRound(missedThisRound));
  root.querySelector("#startBtn").addEventListener("click", () => startBuildRound());
}

// ── the done screen (house pattern: next + revisit + play again + home) ──
function renderDone() {
  const missedChips = missedThisRound.map((m) => `<span class="chip">${fmtFormula(m.f)}</span>`).join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block"><p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} with no hints. 🎉</p>`;
  const nextTier = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null;

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${roundTotal} molecules, ${cleanSolves} solved hint-free.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <div class="controls two-up done-nav">
      ${nextTier ? `<button class="action primary" id="nextTierBtn">Next topic: ${nextTier.label} →</button>` : ""}
      <button class="action ghost" id="revisitBtn">↩ Revisit the geometry catalog</button>
    </div>
    <p class="done-next">Or run another round:</p>
    <div class="controls two-up"><button class="action primary" id="startBtn">Start the shape quiz →</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  const nextTierBtn = root.querySelector("#nextTierBtn");
  if (nextTierBtn) nextTierBtn.addEventListener("click", () => { tierIndex += 1; mode = "intro"; render(); });
  root.querySelector("#revisitBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => startRound(missedThisRound));
  root.querySelector("#startBtn").addEventListener("click", () => startRound());
}

// ── the popup: one geometry, big and turning ──
let modal = null;
function closeModal() {
  if (!modal) return;
  stopSpinners();
  modal.remove();
  modal = null;
  document.removeEventListener("keydown", onModalKey);
}
function onModalKey(e) { if (e.key === "Escape") closeModal(); }

function openModal(g) {
  closeModal();
  modal = document.createElement("div");
  modal.className = "geo-modal";
  modal.innerHTML = `
    <div class="geo-modal-card" role="dialog" aria-label="${g.name}">
      <button class="geo-close" type="button" aria-label="Close">✕</button>
      <canvas class="geo-stage" width="360" height="320"></canvas>
      <div class="geo-info">
        <h2>${g.name}</h2>
        <p class="geo-line"><strong>${g.regions} regions</strong> · ${g.bonds} bonding, ${g.lonePairs} lone pair${g.lonePairs === 1 ? "" : "s"} · electron geometry: <strong>${g.eGeo}</strong></p>
        <p class="geo-line">Bond angle${g.angle.includes("·") ? "s" : ""}: <strong>${g.angle}</strong></p>
        <ul class="geo-facts">${g.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
        <p class="geo-examples">Examples: ${g.examples.map((e) => `<span class="chip">${fmtFormula(e)}</span>`).join(" ")}</p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const spinner = makeSpinner(modal.querySelector(".geo-stage"), g, { startAngle: 0.4 });
  spinner.start();
  activeSpinners.push(spinner);

  modal.querySelector(".geo-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", onModalKey);
}

render();
