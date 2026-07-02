// Polyatomic Ion Trainer — DOM layer. Pure stack + grading live in triad.js; this wires it to the
// screen. Version-tag internal imports so one release bump busts the whole module graph in cache.
import { buildRound, requeue, isComplete, gradeTriad, DEFAULT_ROUND } from "./triad.js";
import { toSubHtml, formatCharge } from "./chem.js";
import { ION_DECKS, deckIons, studyColumns } from "../data/ion-decks.js";
import { normalizeFormula } from "./matching.js";
import { loadStats, saveStats, resetStats, recordMastery, masteredCount } from "./storage.js";

const root = document.querySelector("#game");
const switcher = document.querySelector("#deckSwitcher");

// Charges offered on the picker — every charge our ions use (plus +2 as an honest distractor),
// laid out most-negative → most-positive: 3−, 2−, −, +, 2+.
const CHARGES = [-3, -2, -1, 1, 2];

let deckIndex = 0;
let direction = "recall"; // "recall" = name→formula+charge; "recognize" = formula→name+charge
let mode = "intro";
let queue = []; // ion ids, front = current
let roundTotal = 0;
let input = { formula: "", name: "", charge: null };
let checked = false;
let formatted = false; // (recall) has the typed formula been "entered" → shown with subscripts yet
let graded = null;
let masteredThisRound = new Set();
let missedThisRound = new Set();
let stats = loadStats();

const deck = () => ION_DECKS[deckIndex];
const ionsById = () => Object.fromEntries(deckIons(deck()).map((i) => [i.id, i]));
const currentIon = () => ionsById()[queue[0]];

// Render an ion's formula with real subscripts and a superscript charge (SO₄ with a small 2−).
function ionHtml(ion) {
  return `${toSubHtml(ion.display)}<sup class="charge">${formatCharge(ion.charge)}</sup>`;
}

function loadDeck(i) {
  deckIndex = i;
  mode = "intro";
  renderSwitcher();
  render();
}

function beginRound(ids) {
  queue = ids;
  roundTotal = ids.length;
  masteredThisRound = new Set();
  missedThisRound = new Set();
  resetCard();
}

function startStack() {
  mode = "play";
  beginRound(buildRound(deckIons(deck()), DEFAULT_ROUND).map((i) => i.id));
}

function reviewMissed() {
  const ids = [...missedThisRound];
  if (!ids.length) return;
  mode = "play";
  beginRound(ids);
}

function resetCard() {
  input = { formula: "", name: "", charge: null };
  checked = false;
  formatted = false;
  graded = null;
  render();
}

function check() {
  if (checked || !isComplete(direction, input)) return;
  const ion = currentIon();
  graded = gradeTriad(ion, direction, input);
  checked = true;
  if (graded.allCorrect) {
    masteredThisRound.add(ion.id);
    stats = recordMastery(stats, deck().id, ion.id);
    saveStats(stats);
  } else {
    missedThisRound.add(ion.id);
  }
  render();
}

function next() {
  queue = requeue(queue, graded.allCorrect);
  if (queue.length === 0) renderDone();
  else resetCard();
}

function setDirection(d) {
  direction = d;
  render();
}

// ── rendering ──
function render() {
  if (mode === "intro") return renderIntro();
  renderCard();
}

function renderSwitcher() {
  switcher.innerHTML = ION_DECKS.map(
    (d, i) =>
      `<button class="deck-choice${i === deckIndex ? " is-active" : ""}" data-deck="${i}" type="button" aria-pressed="${i === deckIndex}">${d.label}</button>`
  ).join("");
  switcher.querySelectorAll(".deck-choice").forEach((b) =>
    b.addEventListener("click", () => loadDeck(Number(b.dataset.deck)))
  );
}

function directionToggle() {
  const opt = (id, label) =>
    `<button class="dir-choice${direction === id ? " is-active" : ""}" data-dir="${id}" type="button" aria-pressed="${direction === id}">${label}</button>`;
  return `<div class="dir-toggle" role="group" aria-label="Quiz direction">
      ${opt("recall", "Name → Formula")}
      ${opt("recognize", "Formula → Name")}
    </div>`;
}

// One study card (formula + name, with any alt names). Reference (parent) ions are tinted.
function studyItem(ion, isReference = false) {
  return `<div class="study-item${isReference ? " is-ref" : ""}">
    <span class="study-formula">${ionHtml(ion)}</span>
    <span class="study-name">${ion.names[0]}${ion.names.length > 1 ? `<span class="alt"> · ${ion.names.slice(1).join(" · ")}</span>` : ""}</span>
  </div>`;
}

function renderIntro() {
  const cols = studyColumns(deck());
  let study;
  if (cols) {
    // Grouped decks: each related family is a column of mini-cards, headed and read top → bottom.
    const hasRef = cols.some((c) => c.items.some((i) => i.isReference));
    study = `<div class="study-columns">${cols
      .map(
        (col) => `<div class="study-col"><span class="study-col-head">${col.head}</span>${col.items
          .map(({ ion, isReference }) => studyItem(ion, isReference))
          .join("")}</div>`
      )
      .join("")}</div>${hasRef ? `<p class="study-note">Tinted cards are the parent ion — shown for context, not in the quiz.</p>` : ""}`;
  } else {
    study = `<div class="study-grid">${deckIons(deck()).map((ion) => studyItem(ion)).join("")}</div>`;
  }

  const total = deckIons(deck()).length;
  const done = masteredCount(stats, deck().id);
  const progress = done
    ? `<p class="progress-line">Saved progress: mastered <strong>${done} of ${total}</strong> in this set so far.</p>`
    : "";

  root.innerHTML = `
    <p class="intro-lede">${deck().blurb}</p>
    ${progress}
    ${study}
    <p class="field-label">Quiz direction — both ask you for the charge</p>
    ${directionToggle()}
    <div class="controls">
      <button class="action primary" id="startBtn">Start the “${deck().label}” stack →</button>
    </div>
  `;
  root.querySelector("#startBtn").addEventListener("click", startStack);
  root.querySelectorAll(".dir-choice").forEach((b) =>
    b.addEventListener("click", () => setDirection(b.dataset.dir))
  );
}

function esc(s) {
  return String(s).replace(/"/g, "&quot;");
}

function renderCard() {
  const ion = currentIon();
  const remaining = queue.length;
  const isRecall = direction === "recall";

  // ── the ion block: the formula box + its charge corner + the charge stack, as ONE unit (the
  // charge belongs to the formula). Recall makes the formula an input; recognize shows it given. ──
  let formulaBox;
  if (!isRecall) {
    formulaBox = `<span class="ion-given"><span class="formula-display">${toSubHtml(ion.display)}</span></span>`;
  } else if (checked) {
    formulaBox = `<span class="ion-built ${graded.facets.formula ? "ok" : "no"}"><span class="formula-display">${toSubHtml(input.formula || "—")}</span></span>`;
  } else if (formatted && input.formula.trim()) {
    formulaBox = `<button class="ion-built editable" id="editFormula" type="button" title="click to edit"><span class="formula-display">${toSubHtml(input.formula)}</span></button>`;
  } else {
    formulaBox = `<input class="formula-input" id="textInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="formula" value="${esc(input.formula)}">`;
  }

  const set = input.charge != null;
  const corner = `<sup class="charge-slot${set ? " is-set" : ""}">${set ? formatCharge(input.charge) : "charge?"}</sup>`;

  const chargeBtns = CHARGES.map((c) => {
    const picked = input.charge === c;
    let cls = "charge-opt";
    if (checked) {
      if (c === ion.charge) cls += " is-answer";
      else if (picked) cls += " is-wrong";
    } else if (picked) cls += " is-picked";
    return `<button class="${cls}" data-charge="${c}" type="button" ${checked ? "disabled" : ""}>${formatCharge(c)}</button>`;
  }).join("");

  const ionBlock = `<div class="ion-block">
    <div class="ion-composer">${formulaBox}${corner}</div>
    <div class="charge-stack" aria-label="Charge">${chargeBtns}</div>
  </div>`;

  // Recognize needs a separate name field below the ion block; recall does not.
  const nameField = isRecall ? "" : (checked
    ? `<div class="name-composer"><span class="name-built ${graded.facets.name ? "ok" : "no"}">${input.name || "—"}</span></div>`
    : `<div class="name-composer"><input class="name-input" id="textInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="name" value="${esc(input.name)}"></div>`);

  const hint = checked ? "" : `<p class="entry-hint">${
    isRecall
      ? (formatted ? "now select the charge →" : "type the formula, then press Enter")
      : "type the name, and select the charge"
  }</p>`;

  const header = isRecall
    ? `<p class="prompt-facet word">${ion.names[0]}</p>`
    : `<p class="prompt-lead">Name this ion and give its charge</p>`;

  let reveal = "";
  if (checked) {
    const alts = [];
    if (ion.formulas.length > 1) alts.push(`also written ${ion.formulas.slice(1).map(toSubHtml).join(", ")}`);
    if (ion.names.length > 1) alts.push(`also called ${ion.names.slice(1).join(", ")}`);
    reveal = `<div class="reveal">
      <p class="reveal-ion">${ionHtml(ion)} <span class="reveal-name">${ion.names[0]}</span></p>
      ${alts.length ? `<p class="reveal-note">${alts.join(" · ")}</p>` : ""}
    </div>`;
  }

  const feedback = checked
    ? graded.allCorrect
      ? `<p class="feedback ok">All three correct — it leaves the stack.</p>`
      : `<p class="feedback no">Not quite — the correct answers are marked. This one comes back around.</p>`
    : `<p class="feedback">&nbsp;</p>`;

  // Capitalization hint: right letters, wrong case. Element symbols are case-sensitive.
  let capHint = "";
  if (checked && isRecall && !graded.facets.formula && input.formula.trim()) {
    const typed = normalizeFormula(input.formula).toLowerCase();
    if (ion.formulas.some((f) => normalizeFormula(f).toLowerCase() === typed)) {
      capHint = `<p class="cap-hint">Right letters — mind the capitalization. Element symbols are case-sensitive: <strong>CO</strong> (carbon + oxygen) isn't <strong>Co</strong> (cobalt).</p>`;
    }
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ Study the set</button>
    <div class="card-face">
      <span class="card-tag">${deck().label} &middot; ${isRecall ? "name → formula" : "formula → name"}</span>
      ${header}
    </div>
    <div class="answer ${isRecall ? "recall" : "recognize"}">
      ${ionBlock}
      ${nameField}
      ${hint}
    </div>
    ${reveal}
    ${feedback}
    ${capHint}
    <div class="controls">
      <p class="score">Mastered ${masteredThisRound.size} of ${roundTotal} &middot; ${remaining} in stack</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.allCorrect ? "Next ion →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${isComplete(direction, input) ? "" : "disabled"}>Check</button>`}
    </div>
  `;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });

  // formula / name text input
  const textInput = root.querySelector("#textInput");
  if (textInput) {
    const field = isRecall ? "formula" : "name";
    textInput.addEventListener("input", () => { input[field] = textInput.value; syncCheckEnabled(); });
    textInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (isRecall && !formatted) {
        if (input.formula.trim()) { formatted = true; render(); } // snap the formula to subscripts
      } else {
        check();
      }
    });
    textInput.focus();
  }

  // click the formatted formula to edit it again
  const editBtn = root.querySelector("#editFormula");
  if (editBtn) editBtn.addEventListener("click", () => { formatted = false; render(); });

  // charge stack — targeted DOM update so a focused text field keeps its caret
  root.querySelectorAll(".charge-opt").forEach((b) =>
    b.addEventListener("click", () => {
      if (checked) return;
      input.charge = Number(b.dataset.charge);
      root.querySelectorAll(".charge-opt").forEach((o) => o.classList.toggle("is-picked", o === b));
      root.querySelectorAll(".charge-slot").forEach((slot) => {
        slot.textContent = formatCharge(input.charge);
        slot.classList.add("is-set");
      });
      syncCheckEnabled();
    })
  );

  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) { nextBtn.addEventListener("click", next); if (checked) nextBtn.focus(); }
}

// Enable/disable Check without a full re-render (so the text field keeps focus while typing).
function syncCheckEnabled() {
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.disabled = !isComplete(direction, input);
}

function renderDone() {
  const byId = ionsById();
  const missed = [...missedThisRound].map((id) => byId[id]).filter(Boolean);
  const done = masteredCount(stats, deck().id);
  const total = deckIons(deck()).length;

  const missedBlock = missed.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another pass — you stumbled on ${missed.length}:</p>
        <div class="missed-chips">${missed.map((ion) => `<span class="ex-chip">${ionHtml(ion)}</span>`).join("")}</div>
      </div>`
    : `<p class="feedback ok">Clean run — no stumbles. 🎉</p>`;

  root.innerHTML = `
    <p class="prompt">Stack cleared — all ${roundTotal} ions in “${deck().label}” recalled.</p>
    ${missedBlock}
    <p class="progress-line">Saved progress: mastered <strong>${done} of ${total}</strong> in this set all-time.</p>
    <div class="controls">
      ${missed.length ? `<button class="action primary" id="reviewBtn">Drill the ${missed.length} you missed →</button>` : ""}
      <button class="action ${missed.length ? "ghost" : "primary"}" id="againBtn">Shuffle &amp; go again</button>
      <button class="reset-link" id="resetBtn" type="button">Reset saved progress</button>
    </div>`;

  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", reviewMissed);
  root.querySelector("#againBtn").addEventListener("click", startStack);
  root.querySelector("#resetBtn").addEventListener("click", () => {
    resetStats();
    stats = {};
    renderDone();
  });
}

renderSwitcher();
loadDeck(0);
