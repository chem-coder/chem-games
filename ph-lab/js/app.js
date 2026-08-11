// pH Lab — DOM layer. Pure logic lives in ph.js; content in content.js.
// Rung 1 (Powers of Ten): read a corner of the pH square, type the corner you're sent to,
// Check. Predict-then-Check spine with a progressive hint ladder — same skeleton as the
// Oxidation-State Trainer, so the family keeps one feel.
import { buildProblem, grade, supNum, formatAnswer, fmtSpecies, concStr, parseTyped,
  ladderSolve, ladderGrade, ladderHints, ladderChip,
  saltGrade, saltHints, saltRuling, parentStrength } from "./ph.js";
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
let scratch = "";          // ephemeral per-card working space (Strong Stuff tier), never graded

// ── bench state (Dilution Bench, phase 1) ──
let sessionIdx = 0;        // which scripted session
let stepIdx = 0;           // which step within it
let benchPh = 0;           // the beaker's CURRENT (revealed) pH
let benchSolved = 0;
let benchTotal = 0;
let benchMisses = [];      // step labels for the round report (bench steps never requeue)

// ── ladder state (pH Ladder, rung 4) ──
let puzzle = null;         // current ordering puzzle
let placed = [];           // slot index → species | null
let trayOrder = [];        // shuffled display order of the puzzle's species
let selected = null;       // { species, from: "tray" | slotIndex } — the tap-tap half-gesture
let ladderGraded = null;   // { correct, perSlot, expected }

// ── court state (Salt Court, rung 5) ──
let salt = null;           // current case
let picks = null;          // { baseParent, baseStrength, acidParent, acidStrength, verdict }
let courtGraded = null;    // saltGrade() result
let choiceOrder = null;    // shuffled candidate display order per case

const NUDGE_MSG = {
  "exponent-negative": `Almost — the minus is the message. Concentrations here run from 1 M (10⁰) <em>down</em> to 10⁻¹⁴ M, so the exponent is <strong>negative</strong>.`,
  "scale-positive": `Almost — pH and pOH are themselves <strong>positive</strong> numbers (0–14). The minus already lives inside the formula.`
};

// ── rendering helpers ──
const conc = (species, n) => `[${species}] = 10<sup>−${n}</sup> M`;
const H = "H⁺", OH = "OH⁻";

// Equation strings: subscript digits only when they follow a symbol — coefficients stay big.
const fmtEqn = (eq) => eq.replace(/([A-Za-z)])(\d+)/g, "$1<sub>$2</sub>");

// The given quantity, as the big card line.
function renderGiven(p) {
  if (p.kind === "titr-conc" || p.kind === "titr-gl") return `${p.unknown.v} cm³ of ${fmtSpecies(p.unknown.species)}`;
  if (p.kind === "titr-vol") return `${p.known.v} cm³ of ${p.known.c} M ${fmtSpecies(p.known.species)}`;
  if (p.kind === "titr-excess") return `${p.acid.v} cm³ of ${p.acid.c} M ${fmtSpecies(p.acid.species)} <span class="split-plus">+</span> ${p.base.v} cm³ of ${p.base.c} M ${fmtSpecies(p.base.species)}`;
  if (p.kind === "dilute-made") return `${p.startVolMl} mL of ${concStr({ mantissa: 1, exp: p.exp })} ${fmtSpecies(p.species)}`;
  if (p.kind === "dilute-add") return `${p.startVolMl} mL at pH ${p.startPh}`;
  if (p.kind === "dilute-factor") return `pH ${p.startPh} → pH ${p.targetPh}`;
  if (p.kind === "dilute-by") return `a pH ${p.startPh} solution`;
  if (p.given === "conc") return `${concStr(p)} ${fmtSpecies(p.species)}`;
  if (p.given === "mass") return `${p.mass} g ${fmtSpecies(p.species)} in ${p.vol} L`;
  if (p.given === "H") return conc(H, p.n);
  if (p.given === "OH") return conc(OH, p.n);
  return `${p.given} = ${p.n}`;
}
// The second card line: Mr on mass cards (exam-style), the dilution action on rung-3 cards,
// the neutralization setup + printed equation on rung-6 cards.
function renderCardSub(p) {
  if (p.kind === "titr-conc" || p.kind === "titr-gl") {
    const mr = p.kind === "titr-gl" ? ` &nbsp;·&nbsp; M<sub>r</sub>(${fmtSpecies(p.unknown.species)}) = ${p.unknown.molar}` : "";
    return `<p class="card-sub">exactly neutralized by ${p.known.v} cm³ of ${p.known.c} M ${fmtSpecies(p.known.species)}</p>
      <p class="card-sub card-eqn">${fmtEqn(p.equation)}${mr}</p>`;
  }
  if (p.kind === "titr-vol") return `<p class="card-sub">to be neutralized with ${p.unknown.c} M ${fmtSpecies(p.unknown.species)}</p>
      <p class="card-sub card-eqn">${fmtEqn(p.equation)}</p>`;
  if (p.kind === "titr-excess" && p.mode === "indicator") return `<p class="card-sub">a few drops of universal indicator are added</p>`;
  if (p.given === "mass") return `<p class="card-sub">M<sub>r</sub>(${fmtSpecies(p.species)}) = ${p.molar}</p>`;
  if (p.kind === "dilute-made") return `<p class="card-sub">made up to ${p.endVolL} L with water</p>`;
  if (p.kind === "dilute-add") return `<p class="card-sub">target: pH ${p.targetPh}</p>`;
  if (p.kind === "dilute-by") return `<p class="card-sub">diluted ×${10 ** p.factorK}</p>`;
  return "";
}
// What the card asks for, in words.
function renderAsk(p) {
  if (p.ask === "H") return `what is [${H}]?`;
  if (p.ask === "OH") return `what is [${OH}]?`;
  if (p.ask === "vol") return `how much water must you <strong>add</strong>, in mL?`;
  if (p.ask === "factor") return `what dilution factor is needed?`;
  if (p.ask === "conc") return `what is its concentration, in mol/L?`;
  if (p.ask === "vol-cm3") return `what volume is needed, in cm³?`;
  if (p.ask === "gl") return `what is its concentration, in g/L?`;
  if (p.ask === "excess") return p.mode === "indicator" ? `what colour does the indicator turn?` : `what does the mixture become?`;
  return `what is the ${p.ask}?`;
}

// The autumn spine: 0–14 gradient bar, teal at 7. Marker only after Check (predict first).
function spine(ph = null, tag = null) {
  const marker = ph === null ? "" :
    `<span class="spine-marker" style="left:${(ph / 14) * 100}%"><span class="spine-marker-tag">${tag ?? ph}</span></span>`;
  return `<div class="spine-wrap">
    <div class="spine">${marker}</div>
    <div class="spine-scale"><span>0</span><span class="spine-mid">7</span><span>14</span></div>
    <div class="spine-labels"><span>acid</span><span class="spine-mid">neutral</span><span>base</span></div>
  </div>`;
}

// ── the beaker: liquid color sampled from the spine gradient, one swatch per pH ──
const PH_COLORS = ["#8a3b22", "#a04628", "#b4502f", "#c26b41", "#cf8a55", "#d8ac7e", "#e0cfa8",
  "#1e7268", "#6f8f6a", "#5f8160", "#4a7355", "#3f664c", "#345a44", "#2d5440", "#274e3c"];

const session = () => tier().sessions[sessionIdx];
const benchStep = () => session().steps[stepIdx];
// A bench step graded like a card: generic hints that never leak the ≈7 ceiling.
function benchHints() {
  const s = benchStep();
  return [
    `Each <strong>×10</strong> of dilution moves the pH <strong>one step toward 7</strong>.`,
    `This is ×10<sup>${s.k}</sup> — ${s.k} step${s.k === 1 ? "" : "s"} from pH ${benchApproxNow() ? "≈" : ""}${benchPh}.`
  ];
}
let benchWasApprox = false;                       // did the CURRENT beaker already clamp?
let benchFormal = null;                           // the un-clamped arithmetic value of the last step
const benchApproxNow = () => benchWasApprox;

// ── flow ──
function startRound() {
  if (tier().sessions) return startBench();
  if (tier().puzzles) return startLadder();
  if (tier().salts) return startCourt();
  startCards();
}

// ── court flow ──
function startCourt() {
  queue = shuffle(tier().salts).slice(0, DEFAULT_ROUND);
  roundTotal = queue.length;
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  mode = "court";
  loadCase();
}
function loadCase() {
  salt = queue[0];
  picks = { baseParent: null, baseStrength: null, acidParent: null, acidStrength: null, verdict: null };
  choiceOrder = { base: shuffle(salt.baseChoices), acid: shuffle(salt.acidChoices) };
  courtGraded = null; hintsShown = 0; checked = false;
  render();
}
const allPicked = () => picks && Object.values(picks).every(Boolean);
function courtCheck() {
  if (checked || !allPicked()) return;
  courtGraded = saltGrade(picks, salt);
  graded = { correct: courtGraded.correct };
  checked = true;
  if (courtGraded.correct) { solvedThisRound += 1; if (hintsShown === 0) cleanSolves += 1; }
  else missedThisRound.push(salt);
  render();
}
function courtNext() {
  queue = requeue(queue, courtGraded.correct);
  if (queue.length === 0) { mode = "done"; render(); } else loadCase();
}

// ── ladder flow ──
const displaySpecies = (s) => s === "H2O" ? "pure H<sub>2</sub>O" : fmtSpecies(s);
function startLadder() {
  queue = shuffle(tier().puzzles).slice(0, DEFAULT_ROUND);   // 5 of the pool — bonus salts mix in
  roundTotal = queue.length;
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  mode = "ladder";
  loadPuzzle();
}
function loadPuzzle() {
  puzzle = queue[0];
  placed = Array(puzzle.species.length).fill(null);
  trayOrder = shuffle(puzzle.species);
  selected = null; ladderGraded = null; hintsShown = 0; checked = false;
  render();
}
const trayPool = () => trayOrder.filter((s) => !placed.includes(s));
// One placement semantic serves both gestures: put `sel` into slot i. A tray card bumps
// any occupant back to the tray; a card moved between slots swaps with the occupant.
function placeInto(slotIdx, sel) {
  const occupant = placed[slotIdx];
  if (sel.from === "tray") placed[slotIdx] = sel.species;
  else { placed[sel.from] = occupant; placed[slotIdx] = sel.species; }
  selected = null;
  render();
}
function returnToTray(sel) {
  if (sel.from !== "tray") placed[sel.from] = null;
  selected = null;
  render();
}
function ladderCheck() {
  if (checked || placed.includes(null)) return;
  ladderGraded = ladderGrade(placed, puzzle);
  graded = { correct: ladderGraded.correct };
  checked = true; selected = null;
  if (ladderGraded.correct) { solvedThisRound += 1; if (hintsShown === 0) cleanSolves += 1; }
  else missedThisRound.push(puzzle);
  render();
}
function ladderNext() {
  queue = requeue(queue, ladderGraded.correct);
  if (queue.length === 0) { mode = "done"; render(); } else loadPuzzle();
}
function startCards() {
  queue = shuffle(tier().items).slice(0, Math.min(DEFAULT_ROUND, tier().items.length));
  roundTotal = queue.length;
  solvedThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}
function startBench() {
  sessionIdx = 0; stepIdx = 0;
  benchPh = session().startPh; benchWasApprox = false;
  benchSolved = 0; benchMisses = [];
  benchTotal = tier().sessions.reduce((n, s) => n + s.steps.length, 0);
  solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
  typed = ""; hintsShown = 0; checked = false; graded = null; nudge = null;
  mode = "bench";
  render();
}
function benchCheck() {
  if (checked || !typed.trim()) return;
  const value = parseTyped(typed);
  const s = benchStep();
  graded = { correct: value === s.expected, value };
  checked = true;
  if (graded.correct) benchSolved += 1;
  else benchMisses.push(`${session().label} · pH ${benchApproxNow() ? "≈" : ""}${benchPh} ×10${supNum(s.k)}`);
  // What the arithmetic alone would say — quoted by the discovery panel when the meter disagrees.
  benchFormal = session().side === "acid" ? benchPh + s.k : benchPh - s.k;
  // The beaker updates only on reveal: color shifts to the new pH, discovery text may fire.
  benchWasApprox = s.approx;
  benchPh = s.expected;
  render();
}
function benchNext() {
  stepIdx += 1;
  if (stepIdx >= session().steps.length) {
    sessionIdx += 1; stepIdx = 0;
    if (sessionIdx >= tier().sessions.length) return startCards();   // phase 2
    benchPh = session().startPh; benchWasApprox = false;
  }
  typed = ""; hintsShown = 0; checked = false; graded = null;
  render();
}
function loadCard() {
  problem = buildProblem(queue[0]);
  typed = ""; hintsShown = 0; checked = false; graded = null; nudge = null; scratch = "";
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
function showHint() {
  const hints = mode === "bench" ? benchHints()
    : mode === "ladder" ? ladderHints(puzzle)
    : mode === "court" ? saltHints(salt)
    : problem.hints;
  if (hintsShown < hints.length) hintsShown += 1;
  render();
}
function next() {
  queue = requeue(queue, graded.correct);
  if (queue.length === 0) { mode = "done"; render(); } else loadCard();
}

// ── render ──
function render() {
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  if (mode === "bench") return renderBench();
  if (mode === "ladder") return renderLadder();
  if (mode === "court") return renderCourt();
  renderPlay();
}

function renderCourt() {
  const ion = (i) => `${fmtSpecies(i.f)}<sup class="ion-q">${i.q}</sup>`;
  const mark = (part) => checked ? (courtGraded.parts[part] ? " ok" : " no") : "";

  const panel = (side) => {
    const isBase = side === "base";
    const chosenParent = isBase ? picks.baseParent : picks.acidParent;
    const chosenStr = isBase ? picks.baseStrength : picks.acidStrength;
    const choices = isBase ? choiceOrder.base : choiceOrder.acid;
    const parentPart = isBase ? "baseParent" : "acidParent";
    const strengthPart = isBase ? "baseStrength" : "acidStrength";
    return `<div class="parent-panel">
      <p class="panel-h">the ${ion(isBase ? salt.cation : salt.anion)} came from…</p>
      <div class="cand-row${mark(parentPart)}">${choices.map((c) =>
        `<button type="button" class="cand-btn${chosenParent === c ? " sel" : ""}" data-side="${side}" data-parent="${c}" ${checked ? "disabled" : ""}>${fmtSpecies(c)}</button>`).join("")}
      </div>
      <div class="str-row${mark(strengthPart)}">${["strong", "weak"].map((s) =>
        `<button type="button" class="str-btn${chosenStr === s ? " sel" : ""}" data-side="${side}" data-str="${s}" ${checked ? "disabled" : ""}>${s}</button>`).join("")}
      </div>
    </div>`;
  };

  const verdicts = ["acidic", "neutral", "basic"];
  const verdictRow = `<div class="verdict-row${mark("verdict")}">${verdicts.map((v) =>
    `<button type="button" class="verdict-btn v-${v}${picks.verdict === v ? " sel" : ""}" data-verdict="${v}" ${checked ? "disabled" : ""}>${v}</button>`).join("")}</div>`;

  const hints = saltHints(salt);
  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  let ruling = "", feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    const r = saltRuling(salt);
    feedback = courtGraded.correct
      ? `<p class="feedback ok">${hintsShown ? "Case closed." : "Case closed — no hints. 💪"} It leaves the docket.</p>`
      : `<p class="feedback no">The court disagrees — this case returns to the docket.</p>`;
    ruling = `<div class="court-ruling">
      <p class="ruling-h">Verdict: <strong class="v-${salt.expected}-text">${salt.expected}</strong></p>
      <p class="ruling-line">${fmtSpecies(salt.parentAcid)} is <strong>${r.acidStr}</strong> · ${fmtSpecies(salt.parentBase)} is <strong>${r.baseStr}</strong> — ${r.clause}.</p>
    </div>`;
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How the court works</button>
    <div class="formula-card">
      <span class="card-tag">${tier().label}</span>
      <p class="formula ph-formula">${fmtSpecies(salt.salt)}</p>
      <p class="ion-split">${ion(salt.cation)} <span class="split-plus">+</span> ${ion(salt.anion)}</p>
      <p class="ox-ask">dissolved in water — what does the solution become?</p>
    </div>
    <div class="parent-panels">${panel("base")}${panel("acid")}</div>
    <p class="build-label">Your verdict</p>
    ${verdictRow}
    ${hintBlock}
    ${ruling}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${queue.length} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !courtGraded.correct ? "Next case →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${allPicked() ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelectorAll(".cand-btn").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.side === "base") picks.baseParent = b.dataset.parent;
    else picks.acidParent = b.dataset.parent;
    render();
  }));
  root.querySelectorAll(".str-btn").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.side === "base") picks.baseStrength = b.dataset.str;
    else picks.acidStrength = b.dataset.str;
    render();
  }));
  root.querySelectorAll(".verdict-btn").forEach((b) => b.addEventListener("click", () => {
    picks.verdict = b.dataset.verdict;
    render();
  }));
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", courtCheck);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", courtNext); nextBtn.focus(); }
}

function renderLadder() {
  const n = puzzle.species.length;
  const dec = puzzle.direction === "dec";
  const isSel = (species, from) => selected && selected.species === species &&
    String(selected.from) === String(from);

  const cardHtml = (species, from) =>
    `<span class="ladder-card${isSel(species, from) ? " sel" : ""}" data-species="${species}" data-from="${from}">${displaySpecies(species)}</span>`;

  const slots = placed.map((s, i) => {
    const mark = checked ? (ladderGraded.perSlot[i] ? " ok" : " no") : "";
    return `<div class="ladder-slot${s ? " filled" : ""}${mark}" data-slot="${i}">
      ${s ? cardHtml(s, i) : `<span class="slot-num">${i + 1}</span>`}
    </div>`;
  }).join("");

  const pool = trayPool();
  const tray = checked ? "" : `<div class="ladder-tray" id="ladderTray">
      ${pool.length ? pool.map((s) => cardHtml(s, "tray")).join("") : `<span class="tray-empty">all placed — Check when you're sure</span>`}
    </div>`;

  const hints = ladderHints(puzzle);
  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  let reveal = "", feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = ladderGraded.correct
      ? `<p class="feedback ok">${hintsShown ? "Ordered." : "Ordered — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this ordering comes back around.</p>`;
    reveal = `<div class="ladder-answer">
      <p class="ladder-answer-h">The ladder, ${dec ? "highest" : "lowest"} pH first:</p>
      <div class="ladder-answer-row">${ladderGraded.expected.map((s) =>
        `<span class="ladder-answer-card">${displaySpecies(s)}<span class="class-chip">${ladderChip(s)}</span></span>`).join("")}</div>
    </div>`;
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How the ladder works</button>
    <p class="ladder-direction${dec ? " dir-dec" : ""}">${dec
      ? `⚠ Order by <strong>DECREASING</strong> pH — highest first. All solutions 0.1 M.`
      : `Order by <strong>increasing</strong> pH — lowest first. All solutions 0.1 M.`}</p>
    <div class="ladder-slots">${slots}</div>
    ${dec ? "" : spine()}
    ${tray}
    ${hintBlock}
    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">Solved ${solvedThisRound} of ${roundTotal} &middot; ${queue.length} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !ladderGraded.correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${placed.includes(null) ? "disabled" : ""}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", ladderCheck);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", ladderNext); nextBtn.focus(); }
  if (!checked) wireLadderGestures();
}

// ── placement gestures: pointer-drag, with tap-card-then-tap-slot as the same meaning ──
function wireLadderGestures() {
  const fromOf = (el) => el.dataset.from === "tray" ? "tray" : Number(el.dataset.from);

  root.querySelectorAll(".ladder-card").forEach((card) => {
    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const sel = { species: card.dataset.species, from: fromOf(card) };
      let ghost = null, dragged = false;
      const startX = e.clientX, startY = e.clientY;

      const move = (ev) => {
        if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        if (!ghost) {
          dragged = true;
          ghost = card.cloneNode(true);
          ghost.classList.add("ghost");
          document.body.appendChild(ghost);
          card.classList.add("dragging");
        }
        ghost.style.left = `${ev.clientX}px`;
        ghost.style.top = `${ev.clientY}px`;
      };
      const up = (ev) => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        if (ghost) { ghost.remove(); card.classList.remove("dragging"); }
        if (!dragged) {   // a tap
          // Holding a selection and tapping a card that sits IN A SLOT places there (swap);
          // any other tap just moves the selection.
          if (selected && !isSameSel(sel) && sel.from !== "tray") { placeInto(sel.from, selected); return; }
          selected = isSameSel(sel) ? null : sel;
          render();
          return;
        }
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const slotEl = under && under.closest(".ladder-slot");
        if (slotEl) placeInto(Number(slotEl.dataset.slot), sel);
        else if (under && under.closest("#ladderTray")) returnToTray(sel);
        else render();   // dropped nowhere — snap back
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
  });

  // Tapping a slot completes the tap-tap gesture (or retrieves nothing if no selection).
  root.querySelectorAll(".ladder-slot").forEach((slotEl) => {
    slotEl.addEventListener("pointerup", (e) => {
      if (!selected) return;
      if (e.target.closest(".ladder-card")) return;   // the card's own handler owns this tap
      placeInto(Number(slotEl.dataset.slot), selected);
    });
  });
  const trayEl = root.querySelector("#ladderTray");
  if (trayEl) trayEl.addEventListener("pointerup", (e) => {
    if (!selected || e.target.closest(".ladder-card")) return;
    returnToTray(selected);
  });
}
const isSameSel = (sel) => selected && selected.species === sel.species && String(selected.from) === String(sel.from);

function renderBench() {
  const s = benchStep();
  const side = session().side;
  const atStart = stepIdx === 0 && !checked;
  const stateLine = atStart
    ? `In the beaker: <strong>${session().startText}</strong> — pH <strong>${benchPh}</strong>`
    : `In the beaker: pH <strong>${benchWasApprox ? "≈7" : benchPh}</strong>`;
  const action = `💧 Water is added until the total volume is <strong>×${10 ** s.k}</strong> what it was.`;

  // The announced water is already IN the beaker (level up) — but the color only changes
  // when the meter reads, at Check. Predict first; the liquid keeps its old face till then.
  const level = Math.min(25 + (stepIdx + 1) * 13, 90);
  const beaker = `<div class="beaker" role="img" aria-label="beaker of solution">
      <div class="beaker-liquid" style="height:${level}%; background:${PH_COLORS[benchPh]}"></div>
    </div>`;

  const answerArea = checked
    ? `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${Number.isNaN(graded.value) ? "—" : `pH ${graded.value}`}</span></div>`
    : `<input class="answer-input" id="answerInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="pH = ?" value="${typed.replace(/"/g, "&quot;")}">`;

  const hints = benchHints();
  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>` : ""}
    </div>`;

  let reveal = "", feedback = `<p class="feedback">&nbsp;</p>`, discovery = "";
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">Predicted it. ${benchWasApprox ? "You saw the ceiling coming." : ""}</p>`
      : `<p class="feedback no">The meter disagrees — watch it land.</p>`;
    reveal = spine(benchPh, benchWasApprox ? "≈7" : null);
    if (benchWasApprox) {
      discovery = side === "acid"
        ? `<div class="discovery"><p class="discovery-h">The meter stalls.</p><p>The arithmetic says pH ${benchFormal} — but dilution can never carry an acid <em>past</em> 7. As the acid's H⁺ fades away, <strong>water's own H⁺ (10⁻⁷ M) takes over</strong>. The meter walks toward 7 and stops at the door.</p></div>`
        : `<div class="discovery"><p class="discovery-h">The ceiling holds from this side too.</p><p>The arithmetic says pH ${benchFormal} — but the same wall stands on the basic side: as the base's OH⁻ fades, <strong>water's own OH⁻ takes over</strong>. Dilution brings every solution toward 7, and no further.</p></div>`;
    }
  }

  const isLastStep = stepIdx === session().steps.length - 1;
  const isLastSession = sessionIdx === tier().sessions.length - 1;
  const nextLabel = !isLastStep ? "Next step →" : (!isLastSession ? "Next: the base session →" : "To the card stack →");

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How dilution works</button>
    <div class="bench-stage">
      ${beaker}
      <div class="bench-info">
        <p class="bench-session-tag">The Bench · ${session().label}</p>
        <p class="bench-state">${stateLine}</p>
        <p class="bench-action">${action}</p>
      </div>
    </div>
    <p class="build-label">Predict the pH — then the meter reads</p>
    <div class="answer-row">${answerArea}</div>
    ${hintBlock}
    ${checked ? `<div class="bench-reveal">${reveal}</div>` : ""}
    ${discovery}
    ${feedback}
    <div class="controls">
      <p class="score">Prediction ${sessionIdx === 0 ? stepIdx + 1 : tier().sessions[0].steps.length + stepIdx + 1} of ${benchTotal}</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${nextLabel}</button>`
        : `<button class="action primary" id="checkBtn" ${typed.trim() ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => {
      typed = input.value;
      const b = root.querySelector("#checkBtn"); if (b) b.disabled = !typed.trim();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); benchCheck(); } });
    input.focus();
  }
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", benchCheck);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", benchNext); nextBtn.focus(); }
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

// The strong species worth knowing on sight — the Sorter crossover.
function strongChips() {
  const acids = ["HCl", "HBr", "HI", "HNO3", "H2SO4"];
  const bases = ["NaOH", "KOH", "Ba(OH)2", "Ca(OH)2"];
  const chip = (f) => `<span class="em-chip">${fmtSpecies(f)}</span>`;
  return `<div class="elem-molecules">
    <p class="em-lead"><strong>Know the strong ones on sight</strong> — everything else is weak, and weak stays qualitative on the IMAT:</p>
    <div class="em-row"><span class="em-tag">strong acids</span><span class="em-chips">${acids.map(chip).join("")}</span></div>
    <div class="em-row"><span class="em-tag">strong bases</span><span class="em-chips">${bases.map(chip).join("")}</span></div>
  </div>`;
}

function introStrong() {
  return `<div class="intro">
    <p class="intro-eyebrow">Strong Stuff · fully dissociated</p>
    <p class="intro-lede"><strong>Strong</strong> means every unit falls apart completely in water. So nothing is hidden: the concentration on the bottle tells you [H⁺] or [OH⁻] <em>directly</em> — then it's rung-1 arithmetic.</p>
    ${strongChips()}
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>Strong acid:</strong> [H⁺] = the concentration — <strong>× 2 if diprotic</strong> (H₂SO₄). Then pH = the flipped exponent. <span class="muted-ex">0.01 M HCl → pH 2</span></span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>Strong base:</strong> [OH⁻] = the concentration (× 2 for Ba(OH)₂) → <strong>pOH first</strong>, then pH = 14 − pOH. <span class="muted-ex">0.01 M NaOH → pOH 2 → pH 12</span></span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>Given grams?</strong> Build the concentration first: <strong>moles = g ÷ M<sub>r</sub></strong>, then <strong>M = moles ÷ litres</strong>. <span class="muted-ex">the M<sub>r</sub> is always printed on the card</span></span></li>
    </ol>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — 0.005 M H<sub>2</sub>SO<sub>4</sub>. What is the pH?</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">Diprotic: [H⁺] = 2 × 0.005 = <strong>0.01 M</strong> = 10<sup>−2</sup> M.</span></li>
        <li><span class="step-num">2</span><span class="step-text">Flip the exponent: <strong>pH 2</strong>. The ×2 turned an awkward 5 × 10⁻³ into a clean power of ten — the exam picks numbers that do this.</span></li>
      </ol>
    </div>
    ${startControls()}
  </div>`;
}

function introDilution() {
  // Deliberately silent about the ≈7 ceiling — that's the Bench's discovery to make.
  return `<div class="intro">
    <p class="intro-eyebrow">Dilution Bench · water changes everything</p>
    <p class="intro-lede">Adding water spreads the same ions through more volume. The concentration drops by the dilution factor — and because pH lives in exponents, <strong>every ×10 of dilution is exactly one pH step</strong>.</p>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>Factor first:</strong> final volume ÷ starting volume. "10 mL made up to 1 L" is ×100. <span class="muted-ex">×10<sup>k</sup> means k steps</span></span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>Steps move toward 7:</strong> acids climb (pH 2 → 3 → 4…), bases descend (pH 12 → 11 → 10…). Dilution always weakens what's there. <span class="muted-ex">0.01 M HCl ×10 → 0.001 M → pH 3</span></span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>Adding vs total:</strong> "make the volume ×100" and "add 100 mL" are different sentences. The exam knows the difference. <span class="muted-ex">watch for it in the card stack</span></span></li>
    </ol>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — 1 mL of pH 2 HCl, made up to 10 mL</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">Factor: 10 ÷ 1 = <strong>×10</strong> → one step.</span></li>
        <li><span class="step-num">2</span><span class="step-text">Acid, so the step goes up: <strong>pH 3</strong>.</span></li>
      </ol>
    </div>
    <p class="spine-note">First the Bench: two dilution runs where you call the meter's reading before it lands. Then the card stack.</p>
    ${startControls()}
  </div>`;
}

function introLadder() {
  const band = [["H₂SO₄", "strong acid · 2 H⁺"], ["HCl", "strong acid"], ["CH₃COOH", "weak acid"],
    ["NaCl · H₂O", "neutral · 7"], ["NH₃", "weak base"], ["NaOH", "strong base"], ["Ba(OH)₂", "strong base · 2 OH⁻"]];
  return `<div class="intro">
    <p class="intro-eyebrow">pH Ladder · classify, then order</p>
    <p class="intro-lede">Same concentration, different pH. No numbers to compute here — every card has a <strong>class</strong>, and the classes have a fixed order around 7:</p>
    <div class="rule-band">${band.map(([f, c], i) =>
      `<span class="rule-step${i === 3 ? " rule-seven" : ""}"><span class="rule-formula">${f}</span><span class="rule-class">${c}</span></span>`
    ).join(`<span class="rule-lt">&lt;</span>`)}</div>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>Classify every card first</strong> — strong or weak, acid or base, or neutral. The order falls out of the classes, never out of memory.</span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>Strong beats weak</strong> at pulling away from 7 — and a diprotic acid (or 2 OH⁻ base) pulls hardest of all.</span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>Read the direction.</strong> The exam asks increasing <em>and</em> decreasing — the ladder will too.</span></li>
    </ol>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — 0.1 M each: NaOH, HCl, NaCl, increasing pH</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">Classify: HCl strong acid · NaCl neutral salt · NaOH strong base.</span></li>
        <li><span class="step-num">2</span><span class="step-text">Order around 7: <strong>HCl &lt; NaCl &lt; NaOH</strong>.</span></li>
      </ol>
    </div>
    ${startControls()}
  </div>`;
}

function introCourt() {
  return `<div class="intro">
    <p class="intro-eyebrow">Salt Court · the strong parent wins</p>
    <p class="intro-lede">Every salt is the child of an acid and a base. Dissolve it in water and the parents' strengths decide what the solution becomes — <strong>no salt list to memorize, ever</strong>. You rebuild the parents; the verdict follows.</p>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>Split the salt into its ions.</strong> The cation walked in from a <em>base</em>, the anion from an <em>acid</em>. <span class="muted-ex">NaF → Na⁺ (from NaOH) + F⁻ (from HF)</span></span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>Judge each parent:</strong> strong or weak. The strong ones you already know on sight from Strong Stuff.</span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>The strong parent wins.</strong> Strong acid + weak base → acidic. Weak acid + strong base → basic. Both strong → a draw at exactly 7.</span></li>
    </ol>
    ${strongChips()}
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — NaF in water</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">Split: Na⁺ + F⁻. Parents: <strong>NaOH</strong> (base) and <strong>HF</strong> (acid).</span></li>
        <li><span class="step-num">2</span><span class="step-text">NaOH is <strong>strong</strong>; HF is <strong>weak</strong>.</span></li>
        <li><span class="step-num">3</span><span class="step-text">The strong parent is the base → the solution is <strong>basic</strong>.</span></li>
      </ol>
    </div>
    ${startControls()}
  </div>`;
}

function introTitration() {
  return `<div class="intro">
    <p class="intro-eyebrow">Neutral Ground · the equivalence point</p>
    <p class="intro-lede">Neutralization is a meeting: <strong>moles of H⁺ meet moles of OH⁻</strong>. Every card is the same three moves — and the volumes speak the exam's language: <strong>cm³, which is just mL</strong> (÷ 1000 → L).</p>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>n = c × V</strong> — start on the side where you know both, volume in litres. <span class="muted-ex">25 cm³ of 0.2 M → 0.025 × 0.2 = 0.005 mol</span></span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>The printed equation is the exchange rate.</strong> H₂SO₄ + 2 NaOH means every acid mole meets <em>two</em> base moles — read the ratio, don't recall it.</span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>At equivalence, solve the unknown</strong> (c = n÷V, V = n÷c, g/L = c × M<sub>r</sub>). Off equivalence, <strong>the leftover rules the flask</strong>: <span class="ind-chip ind-red">acid → red</span> <span class="ind-chip ind-green">neutral → green</span> <span class="ind-chip ind-blue">base → blue</span></span></li>
    </ol>
    <div class="ox-worked">
      <p class="ox-worked-h">Worked example — 10 cm³ of 0.1 M H<sub>2</sub>SO<sub>4</sub>, neutralized by 0.2 M NaOH. What volume?</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">n(H₂SO₄) = 0.010 × 0.1 = <strong>0.001 mol</strong>.</span></li>
        <li><span class="step-num">2</span><span class="step-text">Ratio 1 : 2 → n(NaOH) = <strong>0.002 mol</strong>.</span></li>
        <li><span class="step-num">3</span><span class="step-text">V = 0.002 ÷ 0.2 = 0.01 L = <strong>10 cm³</strong>.</span></li>
      </ol>
    </div>
    <p class="spine-note">Answers here aren't pH values — type concentrations and volumes (comma or dot decimals both count), or rule the flask.</p>
    ${startControls()}
  </div>`;
}

function renderIntro() {
  const body = tier().id === "strong" ? introStrong()
    : tier().id === "dilution" ? introDilution()
    : tier().id === "ladder" ? introLadder()
    : tier().id === "salts" ? introCourt()
    : tier().id === "titration" ? introTitration()
    : introPowers();
  root.innerHTML = `${tierTabs()}${body}`;
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
      ${renderCardSub(problem)}
      <p class="ox-ask">${renderAsk(problem)}</p>
    </div>`;

  const isChoice = problem.answerKind === "choice";
  const isDecimal = problem.answerKind === "decimal";
  // Exponent answers type INTO the superscript slot of "10^▢ M"; choice answers are a
  // button row; everything else is a plain box.
  const buildLabel = isExp ? "Type the exponent"
    : isChoice ? "Your ruling"
    : isDecimal ? `Type the number (${problem.unit})`
    : problem.answerKind === "volume" ? `Type the volume (${problem.unit ?? "mL"})`
    : `Type the ${problem.ask}`;
  const CHOICE_CLASS = { acidic: "c-red", red: "c-red", neutral: "c-teal", green: "c-green", basic: "c-green", blue: "c-blue" };
  let answerArea;
  if (checked) {
    answerArea = `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${graded.correct ? formatAnswer(problem) : (isChoice ? graded.value : Number.isNaN(graded.value) ? "—" : (isExp ? `10${supNum(graded.value)} M` : `${graded.value}${problem.unit ? ` ${problem.unit}` : ""}`))}</span></div>`;
  } else if (isChoice) {
    answerArea = `<div class="choice-row">${problem.options.map((o) =>
      `<button type="button" class="choice-btn ${CHOICE_CLASS[o]}${typed === o ? " sel" : ""}" data-choice="${o}">${o}</button>`).join("")}</div>`;
  } else if (isExp) {
    answerArea = `<label class="exp-label">[${problem.ask === "H" ? H : OH}] = 10<input class="answer-input exp-input" id="answerInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="?" value="${typed.replace(/"/g, "&quot;")}"><span class="exp-unit">M</span></label>`;
  } else if (isDecimal) {
    answerArea = `<label class="exp-label"><input class="answer-input" id="answerInput" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="?" value="${typed.replace(/"/g, "&quot;")}"><span class="exp-unit">${problem.unit}</span></label>`;
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
    reveal = `<p class="reveal">${renderGiven(problem)} &nbsp;→&nbsp; <strong>${formatAnswer(problem)}</strong></p>${problem.ph == null ? "" : spine(problem.ph, problem.approx ? "≈7" : null)}`;
    // The add-vs-total arithmetic, spelled out — the 99-mL trap's teaching line.
    if (problem.kind === "dilute-add") {
      const total = problem.answer + problem.startVolMl;
      reveal += `<p class="reveal-note">Total needed = ${problem.startVolMl} mL × ${total / problem.startVolMl} = <strong>${total} mL</strong> — minus the ${problem.startVolMl} mL already in the flask → <strong>${problem.answer} mL added</strong>.</p>`;
    }
  }

  const nudgeHtml = (!checked && nudge) ? `<p class="ox-nudge">${nudge}</p>` : "";
  // Scratch space on the multi-step tiers — ephemeral working room, never graded (house pattern).
  const scratchHtml = (!checked && ["strong", "titration"].includes(tier().id))
    ? `<div class="scratch"><p class="scratch-label">Scratch space (not saved):</p><textarea class="scratch-pad" id="scratchPad" rows="2" autocomplete="off" spellcheck="false" placeholder="work it out here…"></textarea></div>`
    : "";
  const introLabel = tier().id === "strong" ? "How strong stuff works"
    : tier().id === "dilution" ? "How dilution works"
    : tier().id === "titration" ? "How neutral ground works"
    : "How the pH square works";

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ ${introLabel}</button>
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
  root.querySelectorAll(".choice-btn").forEach((b) => b.addEventListener("click", () => {
    typed = b.dataset.choice;
    render();
  }));
  // Restore + persist the scratch text across re-renders (revealing a hint rebuilds the screen).
  const pad = root.querySelector("#scratchPad");
  if (pad) { pad.value = scratch; pad.addEventListener("input", () => { scratch = pad.value; }); }
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
}

function renderDone() {
  const isBenchTier = !!tier().sessions;
  const chipOf = (p) => p.salt ? fmtSpecies(p.salt)
    : p.species && Array.isArray(p.species) ? p.species.map(displaySpecies).join(" · ")
    : renderGiven(p);
  const missedChips = missedThisRound.map((p) => `<span class="chip">${chipOf(p)}</span>`).join("")
    + (isBenchTier ? benchMisses.map((m) => `<span class="chip">${m}</span>`).join("") : "");
  const missCount = missedThisRound.length + (isBenchTier ? benchMisses.length : 0);
  const missedBlock = missCount
    ? `<div class="missed-block"><p class="missed-label">Worth another pass — you stumbled on ${missCount}:</p><div class="chips">${missedChips}</div></div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} with no hints. 🎉</p>`;
  const headline = isBenchTier
    ? `Bench done — ${benchSolved} of ${benchTotal} predictions called, ${solvedThisRound} of ${roundTotal} cards solved.`
    : tier().puzzles
      ? `Round done — ${roundTotal} orderings, ${cleanSolves} solved hint-free.`
      : tier().salts
        ? `Docket cleared — ${roundTotal} cases, ${cleanSolves} ruled hint-free.`
        : `Round done — ${roundTotal} conversions, ${cleanSolves} solved hint-free.`;

  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">${headline}</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <p class="done-next">Go again below — more rungs of the ladder are on the way.</p>
    ${startControls()}`;

  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); mode = "intro"; render(); }));
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => {
    queue = missedThisRound.slice();
    roundTotal = queue.length; solvedThisRound = 0; cleanSolves = 0; missedThisRound = [];
    if (tier().puzzles) { mode = "ladder"; loadPuzzle(); }
    else if (tier().salts) { mode = "court"; loadCase(); }
    else { mode = "play"; loadCard(); }
  });
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

render();
