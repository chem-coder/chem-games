// Shape Lab — from Lewis structures to 3D shapes. See documentation/BONDING_GAME_DESIGN.md.
// v0.1: the Geometries rung (visual table + rotating 3D popups). The other rungs are
// designed and stubbed — their intros say what's coming, and the tabs never dead-end.

import { GEOMETRIES, GEO_BY_ID, GEO_GROUPS, fmtFormula } from "./geometry.js";
import { makeSpinner } from "./render3d.js";
import { MOLECULES } from "./molecules.js";

const root = document.getElementById("game");
const ROUND_SIZE = 8;

const TIERS = [
  { id: "formal-charge", label: "Formal charge", built: false,
    blurb: "The bookkeeping skill: FC = valence e⁻ − (dots + sticks). Zero and ±1 are welcome, negative charges belong on the more electronegative atom, and ±2/±3 mean you've drawn something nature won't keep. Intro cards, click-through examples, and a practice quiz." },
  { id: "lewis", label: "Lewis structures", built: false,
    blurb: "Dalia's six steps, one card each — then a clickable table of examples (nitrate first, of course) where every molecule walks you through its own construction, brackets and charges included." },
  { id: "geometries", label: "Geometries", built: true },
  { id: "build", label: "Build molecules", built: false,
    blurb: "The Model Kit: pick atoms, watch their valence electrons settle at the compass points, drag dot to dot to bond, then Check — and a correct molecule snaps into 3D and slowly turns." },
  { id: "polarity", label: "Polarity", built: false,
    blurb: "Rotating molecules wrapped in semitransparent electron clouds, red→blue from the negative end to the positive one. See why CO₂ cancels and H₂O doesn't." },
];
let tierIndex = 2; // land on the built rung while the ladder fills in
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

function render() {
  stopSpinners();
  closeModal();
  if (!tier().built) return renderStub();
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
