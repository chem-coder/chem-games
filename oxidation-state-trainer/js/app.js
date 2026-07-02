// Oxidation-State Trainer — DOM layer. Pure logic lives in oxidation.js; content in content.js.
// One direction: read a formula with one atom highlighted, type that atom's oxidation state, Check.
// Predict-then-Check spine with a progressive hint ladder, mirroring the Name Builder.
import { parseFormula, buildProblem, gradeOx, signedOx, buildHalfReaction, gradeHalf } from "./oxidation.js";
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
let queue = [];            // content items, front = current
let roundTotal = 0;
let problem = null;        // buildProblem(item)
let typed = "";
let hintsShown = 0;
let checked = false;
let graded = null;
let solvedThisRound = 0;
let cleanSolves = 0;       // right with zero hints
let missedThisRound = [];
let nudge = null;          // formatting near-miss (e.g. wrote the charge sign-last) — retry, don't burn the card
let scratch = "";          // ephemeral per-card working space (molecules / ions tiers), never graded
let pickedDir = null;      // half-reactions tier: "oxidation" | "reduction"
const isHalf = () => tier().kind === "half";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const NUDGE_MSG = {
  signfirst: `Almost — an oxidation state is written <strong>sign-first</strong>: <strong>−2</strong>, not 2−. (A charge goes sign-last; an oxidation state is the other way round.)`
};

// ── rendering helpers ──
// Render a formula with its target atom highlighted, real subscripts, and a charge superscript.
// Charge is shown sign-LAST (2−) per the ion convention; the ANSWER (oxidation state) is sign-FIRST.
function chargeSup(charge) {
  if (!charge) return "";
  const mag = Math.abs(charge);
  return `<sup class="ox-charge">${mag === 1 ? "" : mag}${charge > 0 ? "+" : "−"}</sup>`;
}
function renderFormula(item) {
  const body = parseFormula(item.formula).map((p) => {
    const sym = p.el === item.target ? `<span class="ox-target">${p.el}</span>` : p.el;
    return sym + (p.count > 1 ? `<sub>${p.count}</sub>` : "");
  }).join("");
  return body + chargeSup(item.charge);
}
const targetName = (item) => `<span class="ox-target-name">${item.target}</span>`;

// Subscriptify a plain formula ("Cl2" → "Cl₂", "Na" → "Na").
function fmt(formula) {
  return parseFormula(formula).map((p) => p.el + (p.count > 1 ? `<sub>${p.count}</sub>` : "")).join("");
}
// A molecular-element chip (no target, no charge) — for the "elements travel as molecules" list.
const diChip = (formula) => `<span class="em-chip">${fmt(formula)}</span>`;

// ── half-reaction display ──
const ionWithCharge = (item) => `${item.ionCount > 1 ? `${item.ionCount} ` : ""}${item.ion}${chargeSup(item.ionCharge)}`;
const renderHalfPrompt = (item) => `${fmt(item.element)} <span class="hr-arrow">→</span> ${ionWithCharge(item)}`;
function renderHalfEquation(item) {
  const eTerm = (item.electrons > 1 ? `${item.electrons}` : "") + "e⁻";
  return item.direction === "oxidation"
    ? `${fmt(item.element)} <span class="hr-arrow">→</span> ${ionWithCharge(item)} + ${eTerm}`
    : `${fmt(item.element)} + ${eTerm} <span class="hr-arrow">→</span> ${ionWithCharge(item)}`;
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
  problem = isHalf() ? buildHalfReaction(queue[0]) : buildProblem(queue[0]);
  typed = ""; hintsShown = 0; checked = false; graded = null; nudge = null; scratch = ""; pickedDir = null;
  render();
}
function check() {
  if (checked) return;
  let g;
  if (isHalf()) {
    if (!typed.trim() || !pickedDir) return;          // need both the count and the direction
    g = gradeHalf(problem, typed, pickedDir);
  } else {
    if (!typed.trim()) return;
    g = gradeOx(problem.targetOx, typed);
    // Formatting near-miss (right number, charge written sign-last): nudge and let them retry.
    if (!g.correct && g.nudge) { nudge = NUDGE_MSG[g.nudge]; render(); return; }
  }
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

// Reusable: the by-sight assignables as common-ion chips — each its own bubble, charge as a big
// superscript (sign-last, ion convention). Its charge magnitude is the oxidation state you plug in.
function knownChips() {
  const ions = [
    ["H", "+"], ["O", "2−"], ["F", "−"], ["Cl", "−"], ["Br", "−"], ["I", "−"],
    ["Group 1", "+"], ["Group 2", "2+"]
  ];
  return `<div class="ox-known">${ions.map(([el, q]) =>
    `<span class="ox-chip${el.startsWith("Group") ? " wide" : ""}">${el}<sup class="ox-chip-charge">${q}</sup></span>`
  ).join("")}</div>`;
}

function introBasics() {
  return `<div class="intro">
    <p class="intro-eyebrow">Oxidation states · the two starting rules</p>
    <p class="warmup-note">A warm-up rung — skip ahead if these are already second nature.</p>
    <p class="intro-lede">An atom's <strong>oxidation state</strong> is the charge it would carry if every bond were pulled fully to the more electronegative atom. Two cases you can read on sight:</p>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text">A <strong>free element</strong> — uncombined, bonded only to itself — is always <strong>0</strong>. <span class="muted-ex">O₂, Na, Cl₂, P₄</span></span></li>
      <li><span class="step-num">2</span><span class="step-text">A <strong>monatomic ion</strong> has an oxidation state equal to its <strong>charge</strong>.
        <span class="ion-egs"><span>Na⁺ → +1</span><span>O²⁻ → −2</span><span>Al³⁺ → +3</span></span>
      </span></li>
    </ol>
    <div class="elem-molecules">
      <p class="em-lead"><strong>Watch out:</strong> many elements don't exist as lone atoms. In nature they travel as molecules. The oxidation state is still <strong>0</strong>, but you have to recognize them on sight:</p>
      <div class="em-row"><span class="em-tag">the 7 diatomic elements</span><span class="em-chips">${["H2", "N2", "O2", "F2", "Cl2", "Br2", "I2"].map(diChip).join("")}</span></div>
      <div class="em-row"><span class="em-tag">other molecular elements</span><span class="em-chips">${["P4", "S8", "O3"].map(diChip).join("")}</span></div>
      <p class="em-foot">So a chlorine you meet is <strong>Cl₂</strong>, not a lone Cl.</p>
    </div>
    <div class="sign-note">
      <p class="sign-note-h">Mind the sign convention</p>
      <p>Oxidation states are written <strong>sign&#8209;first</strong>: <span class="ox-eg">+7</span>, <span class="ox-eg">−2</span>. An ion's <em>charge</em> is the other way round — <strong>sign&#8209;last</strong>: <span class="ox-eg">2−</span>. Same numbers, opposite order.</p>
    </div>
    ${startControls()}
  </div>`;
}
function introMolecules() {
  return `<div class="intro">
    <p class="intro-eyebrow">Molecules · sum to zero</p>
    <p class="intro-lede">In a neutral molecule, the oxidation states add up to <strong>0</strong>.</p>
    <p class="ox-known-lead">Know these by sight</p>
    ${knownChips()}
    <p class="ox-known-note">Their charge is the oxidation state you assign. (Halogens are −1 unless bonded to oxygen or fluorine.)</p>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — ${renderFormula({ formula: "CO2", charge: 0, target: "C" })}</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">Oxygen is <strong>−2</strong>, and there are 2 oxygens → <strong>−4</strong>.</span></li>
        <li><span class="step-num">2</span><span class="step-text">Carbon must cancel that to reach 0 → <strong>+4</strong>.</span></li>
      </ol>
    </div>
    ${startControls()}
  </div>`;
}
function introIons() {
  return `<div class="intro">
    <p class="intro-eyebrow">Polyatomic ions · sum to the charge</p>
    <p class="intro-lede">Exactly the same method, but the atoms now sum to the <strong>ion's overall charge</strong>, not zero.</p>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — ${renderFormula({ formula: "MnO4", charge: -1, target: "Mn" })}</p>
      <p class="we-line">Let <strong>x</strong> = the oxidation state of Mn.</p>
      <ul class="we-list">
        <li>one Mn atom → <strong>1·x</strong></li>
        <li>four oxygens, each −2 → <strong>4·(−2)</strong></li>
        <li>the total must equal the ion's charge → <strong>−1</strong></li>
      </ul>
      <p class="we-eq">1·x + 4·(−2) = −1</p>
      <p class="we-eq">x = +7</p>
      <p class="we-concl">So Mn is <strong>+7</strong> in ${renderFormula({ formula: "MnO4", charge: -1, target: "Mn" })}.</p>
    </div>
    <p class="ladder-teaser">↘ Watch the chlorine oxyanions as you go: <strong>ClO⁻ → ClO₄⁻</strong> climb <strong>+1 · +3 · +5 · +7</strong>. That's the <em>hypo&#8209;/&#8209;ite/&#8209;ate/per&#8209;</em> naming ladder, written in oxidation states.</p>
    ${startControls()}
  </div>`;
}

function introHalf() {
  return `<div class="intro">
    <p class="intro-eyebrow">Half-reactions · electron bookkeeping</p>
    <p class="intro-lede">When an element turns into an ion, it <strong>transfers electrons</strong>. Count them, and name the direction.</p>
    <div class="oilrig">
      <p class="oilrig-h">OIL RIG</p>
      <p><strong>O</strong>xidation <strong>I</strong>s <strong>L</strong>oss &nbsp;·&nbsp; <strong>R</strong>eduction <strong>I</strong>s <strong>G</strong>ain &nbsp;<span class="oilrig-sub">(of electrons)</span></p>
    </div>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text">Element → a <strong>positive</strong> ion: electrons <strong>lost</strong> → <strong>oxidation</strong>. <span class="muted-ex">the oxidation state goes up</span></span></li>
      <li><span class="step-num">2</span><span class="step-text">Element → a <strong>negative</strong> ion: electrons <strong>gained</strong> → <strong>reduction</strong>. <span class="muted-ex">the oxidation state goes down</span></span></li>
    </ol>
    <p class="ox-known-note">Electrons moved = atoms × the size of the charge. A diatomic element gives <strong>2</strong> ions, so it doubles the electrons.</p>
    <div class="ox-worked">
      <p class="ox-worked-h">Two examples</p>
      <p class="we-eq">Na <span class="hr-arrow">→</span> Na<sup class="ox-charge">+</sup> + e⁻ <span class="hr-tag ox">oxidation · 1 lost</span></p>
      <p class="we-eq">Cl<sub>2</sub> + 2e⁻ <span class="hr-arrow">→</span> 2 Cl<sup class="ox-charge">−</sup> <span class="hr-tag red">reduction · 2 gained</span></p>
    </div>
    ${startControls()}
  </div>`;
}

function renderIntro() {
  const body = tier().id === "basics" ? introBasics()
    : tier().id === "molecules" ? introMolecules()
    : tier().id === "ions" ? introIons()
    : introHalf();
  root.innerHTML = `${tierTabs()}${body}`;
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); renderIntro(); }));
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

function renderPlay() {
  const half = isHalf();
  const remaining = queue.length;

  // ── prompt card ──
  const promptCard = half
    ? `<div class="formula-card hr-card">
        <span class="card-tag">${tier().label}</span>
        <p class="formula">${renderHalfPrompt(problem)}</p>
        <p class="ox-ask">how many electrons, and which way?</p>
      </div>`
    : `<div class="formula-card">
        <span class="card-tag">${tier().label}</span>
        <p class="formula">${renderFormula(problem)}</p>
        <p class="ox-ask">oxidation state of ${targetName(problem)}?</p>
      </div>`;

  // ── answer area + per-tier specifics ──
  let answerArea, buildLabel, canCheck;
  if (half) {
    buildLabel = "Count the electrons, then classify";
    canCheck = !!(typed.trim() && pickedDir);
    answerArea = checked
      ? `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${Number.isNaN(graded.value) ? "—" : graded.value} e⁻ · ${pickedDir || "—"}</span></div>`
      : `<div class="hr-inputs">
          <label class="hr-elabel"><input class="answer-input hr-enum" id="answerInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="?" value="${typed.replace(/"/g, "&quot;")}"><span>e⁻</span></label>
          <div class="hr-dir" role="group" aria-label="direction">
            <button type="button" class="hr-dir-btn${pickedDir === "oxidation" ? " sel" : ""}" data-dir="oxidation">Oxidation<span>lost</span></button>
            <button type="button" class="hr-dir-btn${pickedDir === "reduction" ? " sel" : ""}" data-dir="reduction">Reduction<span>gained</span></button>
          </div>
        </div>`;
  } else {
    buildLabel = "Type the oxidation state";
    canCheck = !!typed.trim();
    answerArea = checked
      ? `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${graded.correct ? problem.answer : (Number.isNaN(graded.value) ? "—" : signedOx(graded.value))}</span></div>`
      : `<input class="answer-input" id="answerInput" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="+7  or  −2" value="${typed.replace(/"/g, "&quot;")}">`;
  }

  // ── hints (shared) ──
  const shown = problem.hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < problem.hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  // ── reveal + feedback (shared structure) ──
  let reveal = "", feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">${hintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
    reveal = half
      ? `<p class="reveal">${renderHalfEquation(problem)} &nbsp;·&nbsp; <strong>${cap(problem.direction)}</strong></p>`
      : `<p class="reveal">${renderFormula(problem)} &nbsp;→&nbsp; ${targetName(problem)} is <strong>${problem.answer}</strong></p>`;
  }

  const nudgeHtml = (!checked && nudge) ? `<p class="ox-nudge">${nudge}</p>` : "";
  // Scratch space on the calculating ox-state tiers — ephemeral, never graded (like Ratio Factory).
  const scratchHtml = (!checked && tier().kind === "oxstate" && tier().id !== "basics")
    ? `<div class="scratch"><p class="scratch-label">Scratch space (not saved):</p><textarea class="scratch-pad" id="scratchPad" rows="2" autocomplete="off" spellcheck="false" placeholder="work it out here…"></textarea></div>`
    : "";

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How ${tier().label.toLowerCase()} work</button>
    ${promptCard}

    <p class="build-label">${buildLabel}</p>
    <div class="answer-row">${answerArea}</div>
    ${nudgeHtml}
    ${hintBlock}
    ${scratchHtml}

    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${remaining} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${canCheck ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const updateCheck = () => { const b = root.querySelector("#checkBtn"); if (b) b.disabled = half ? !(typed.trim() && pickedDir) : !typed.trim(); };
  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => { typed = input.value; updateCheck(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    input.focus();
  }
  // direction toggle (half tier) — update selection + check-enabled in place, so the typed count survives
  root.querySelectorAll(".hr-dir-btn").forEach((b) => b.addEventListener("click", () => {
    pickedDir = b.dataset.dir;
    root.querySelectorAll(".hr-dir-btn").forEach((x) => x.classList.toggle("sel", x.dataset.dir === pickedDir));
    updateCheck();
  }));
  // Restore + persist the scratch text across re-renders (revealing a hint rebuilds the screen).
  const pad = root.querySelector("#scratchPad");
  if (pad) { pad.value = scratch; pad.addEventListener("input", () => { scratch = pad.value; }); }
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
}

function renderDone() {
  const chipOf = (p) => isHalf() ? renderHalfPrompt(p) : renderFormula(p);
  const missedChips = missedThisRound.map((p) => `<span class="chip">${chipOf(p)}</span>`).join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block"><p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} with no hints. 🎉</p>`;
  const ladderNote = tier().id === "ions"
    ? `<p class="ladder-teaser done">Did you catch it? The chlorine ladder <strong>ClO⁻ +1 · ClO₂⁻ +3 · ClO₃⁻ +5 · ClO₄⁻ +7</strong> is the same hypo&#8209;/&#8209;ite/&#8209;ate/per&#8209; pattern you name with.</p>`
    : "";

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${roundTotal} ${isHalf() ? "half-reactions" : "atoms"}, ${cleanSolves} solved hint-free.</p>
    ${missedBlock}
    ${ladderNote}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <p class="done-next">Go again below — or switch tier above.</p>
    ${startControls()}`;

  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); mode = "intro"; render(); }));
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => {
    // The built problems still carry their original item fields, so loadCard's builder re-derives them.
    queue = missedThisRound.slice();
    roundTotal = queue.length; solvedThisRound = 0; cleanSolves = 0; missedThisRound = []; mode = "play"; loadCard();
  });
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

render();
