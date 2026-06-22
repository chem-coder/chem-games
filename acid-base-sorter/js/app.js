// Version-tag every internal import so one release bump busts the whole module graph in the
// browser cache (otherwise a returning visitor can load a stale engine against fresh data).
import { gradeCard, requeue, isComplete, buildStack } from "./sorter.js?v=20260622-mix";
import { renderPeriodicTable } from "./periodic-table.js?v=20260622-mix";
import { STRUCTURES } from "./structures.js?v=20260622-mix";
import { recordResult, masteredCount } from "./stats.js?v=20260622-mix";
import { loadStats, saveStats, resetStats } from "./storage.js?v=20260622-mix";
import { DECKS } from "../data/decks.js?v=20260622-mix";

const root = document.querySelector("#game");
const switcher = document.querySelector("#deckSwitcher");

let deckIndex = 0;
let mode = "intro"; // "intro" explainer screen, or "play" the stack
let queue = []; // card ids, front = current card
let roundTotal = 0; // how many cards this round started with (all strong + a weak sample)
let selections = {}; // axisId -> optionId
let checked = false;
let graded = null; // { perAxis, allCorrect }
let missedThisRound = new Set(); // cards missed at least once this round → the review pile
let stats = loadStats(); // saved all-time mastery tally, persisted across sessions
const masteredByDeck = DECKS.map(() => new Set());

const deck = () => DECKS[deckIndex];
const mastered = () => masteredByDeck[deckIndex];
const card = () => deck().cards.find((c) => c.id === queue[0]);

// Render a formula's unicode subscripts (₂, ₃ …) as real <sub> markup so CSS controls their
// size — the bare unicode glyphs render too small, especially in long formulas like C₆H₅COOH.
function formulaHtml(s) {
  return String(s).replace(/[₀-₉]+/g, (run) =>
    "<sub>" + [...run].map((c) => c.charCodeAt(0) - 0x2080).join("") + "</sub>"
  );
}

function loadDeck(i) {
  deckIndex = i;
  mode = "intro";
  masteredByDeck[i].clear();
  // A fresh round, coverage-aware: prefers cards not yet mastered (least-seen first) using the
  // saved progress, so rounds rotate through the whole pool instead of repeating the same few.
  beginRound(buildStack(deck(), stats, deck().roundSize ?? 8).map((c) => c.id), false);
  renderSwitcher();
  render();
}

// Set up a round from a list of card ids. render=false lets loadDeck stay on the intro.
function beginRound(ids, render = true) {
  queue = ids;
  roundTotal = ids.length;
  missedThisRound = new Set();
  masteredByDeck[deckIndex].clear();
  selections = {};
  checked = false;
  graded = null;
  if (render) resetCard();
}

function startStack() {
  mode = "play";
  resetCard();
}

// Re-drill only the cards missed this round (the "missed pile").
function reviewMissed() {
  const ids = [...missedThisRound];
  if (!ids.length) return;
  mode = "play";
  beginRound(ids.slice());
}

function showIntro() {
  mode = "intro";
  render();
}

function resetCard() {
  selections = {};
  checked = false;
  graded = null;
  render();
}

function pick(axisId, optionId) {
  if (checked) return;
  selections[axisId] = optionId;
  render();
}

function check() {
  if (checked || !isComplete(deck().axes, selections)) return;
  graded = gradeCard(deck().axes, card(), selections);
  checked = true;
  if (graded.allCorrect) mastered().add(card().id);
  else missedThisRound.add(card().id);
  // tally into the saved all-time stats
  stats = recordResult(stats, deck().id, card().id, graded.allCorrect);
  saveStats(stats);
  render();
}

function next() {
  queue = requeue(queue, graded.allCorrect);
  if (queue.length === 0) renderDone();
  else resetCard();
}

// ── rendering ──
function axisRow(ax) {
  const buttons = ax.options
    .map((o) => {
      const picked = selections[ax.id] === o.id;
      let cls = "opt";
      if (checked) {
        const isAnswer = card().answers[ax.id] === o.id;
        if (isAnswer) cls += " is-answer"; // the correct option, always highlighted on Check
        else if (picked) cls += " is-wrong"; // the student's incorrect pick
      } else if (picked) {
        cls += " is-picked";
      }
      return `<button class="${cls}" data-axis="${ax.id}" data-opt="${o.id}" ${checked ? "disabled" : ""}>${o.label}</button>`;
    })
    .join("");
  const mark = checked ? (graded.perAxis[ax.id] ? '<span class="mark ok">✓</span>' : '<span class="mark no">✗</span>') : "";
  return `<div class="axis"><span class="axis-label">${ax.label}${mark}</span><div class="opts">${buttons}</div></div>`;
}

function render() {
  if (mode === "intro") return renderIntro();
  renderCard();
}

function chip(label, items) {
  return `<div class="ex"><span class="ex-label">${label}</span><span class="ex-items">${items
    .map((i) => `<span class="ex-chip">${formulaHtml(i)}</span>`)
    .join("")}</span></div>`;
}

function renderIntro() {
  const intro = deck().intro;
  const concepts = intro.concepts
    .map(
      (cn) => `<div class="concept">
        <h3>${cn.title}</h3>
        <p>${cn.text}</p>
        <div class="examples">${cn.examples.map((e) => chip(e.label, e.items)).join("")}</div>
      </div>`
    )
    .join("");

  // Periodic-table block (acids/bases only; the mix intro skips it).
  let ptBlock = "";
  if (intro.pt) {
    const pt = intro.pt;
    const legend = pt.legend
      .map(
        (l) => `<span class="leg"><span class="leg-swatch" style="background:${pt.palette[l.cat].fill};border-color:${pt.palette[l.cat].stroke}"></span>${l.label}</span>`
      )
      .join("");
    ptBlock = `<div class="pt-block">
      <h3>${pt.title}</h3>
      <div class="pt-wrap">${renderPeriodicTable(pt.highlight, pt.palette)}</div>
      <div class="pt-legend">${legend}</div>
      <p class="pt-note">${pt.note}</p>
    </div>`;
  }

  // The complete "memorize these" list, chunked to mirror the periodic table (acids/bases only).
  let memBlock = "";
  if (intro.memorize) {
    const mem = intro.memorize;
    const memChunks = mem.chunks
      .map(
        (ch) => `<div class="mem-chunk">
        <span class="mem-heading">${ch.heading}</span>
        <ul class="mem-items">${ch.items
          .map((it) => `<li><span class="mem-formula">${formulaHtml(it.formula)}</span><span class="mem-name">${it.name}</span></li>`)
          .join("")}</ul>
      </div>`
      )
      .join("");
    memBlock = `<div class="mem-block">
      <h3>${mem.title}</h3>
      <div class="mem-grid">${memChunks}</div>
      ${mem.footnote ? `<p class="mem-foot">* ${mem.footnote}</p>` : ""}
    </div>`;
  }

  // Molecular-base structures (bases only): lone-pair drawings as the proton-accepting clue.
  let molBlock = "";
  if (intro.molecular) {
    const cards = intro.molecular.examples
      .map(
        (ex) => `<figure class="mol-card">${STRUCTURES[ex.structure] || ""}<figcaption>${formulaHtml(ex.formula)} — ${ex.name}</figcaption></figure>`
      )
      .join("");
    molBlock = `<div class="mol-block">
      <h3>Molecular bases — where the H⁺ lands</h3>
      <p>${intro.molecular.text}</p>
      <div class="mol-row">${cards}</div>
    </div>`;
  }

  // Naming aside (acids only): the HCN "binary" explanation.
  const namingBlock = intro.naming ? `<p class="naming-note">${intro.naming}</p>` : "";

  // All-time saved progress (if any).
  const done = masteredCount(stats, deck().id);
  const progressLine = done
    ? `<p class="progress-line">Saved progress: mastered <strong>${done} of ${deck().cards.length}</strong> ${deck().label.toLowerCase()} so far.</p>`
    : "";

  root.innerHTML = `
    <p class="intro-lede">${intro.blurb}</p>
    ${progressLine}
    <div class="concepts">${concepts}</div>
    ${namingBlock}
    ${ptBlock}
    ${memBlock}
    ${molBlock}
    <div class="controls">
      <button class="action primary" id="startBtn">Start the ${deck().label.toLowerCase()} stack →</button>
    </div>
  `;
  root.querySelector("#startBtn").addEventListener("click", startStack);
}

function renderCard() {
  const c = card();
  const remaining = queue.length;

  const nameReveal = checked
    ? `<p class="name-reveal">${formulaHtml(c.formula)} — <strong>${c.name}</strong></p>`
    : `<p class="name-reveal is-hidden">name hidden — classify, then Check</p>`;

  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.allCorrect
      ? `<p class="feedback ok">All correct — mastered. It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — the right answers are highlighted. This card comes back around.</p>`;
  }

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ Intro &amp; periodic-table tips</button>
    <div class="card-face">
      <span class="card-tag">${deck().label.replace(/s$/, "")}</span>
      <p class="formula">${formulaHtml(c.formula)}</p>
    </div>
    ${nameReveal}
    <div class="axes">${deck().axes.map(axisRow).join("")}</div>
    ${feedback}
    <div class="controls">
      <p class="score">Mastered ${mastered().size} of ${roundTotal} &middot; ${remaining} in stack</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.allCorrect ? "Next card →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${isComplete(deck().axes, selections) ? "" : "disabled"}>Check</button>`}
    </div>
  `;

  root.querySelector("#introBtn").addEventListener("click", showIntro);
  root.querySelectorAll(".opt").forEach((b) =>
    b.addEventListener("click", () => pick(b.dataset.axis, b.dataset.opt))
  );
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) nextBtn.addEventListener("click", next);
}

function renderSwitcher() {
  switcher.innerHTML = DECKS.map(
    (d, i) =>
      `<button class="deck-choice${i === deckIndex ? " is-active" : ""}" data-deck="${i}" type="button" aria-pressed="${i === deckIndex}">${d.label}</button>`
  ).join("");
  switcher.querySelectorAll(".deck-choice").forEach((b) =>
    b.addEventListener("click", () => loadDeck(Number(b.dataset.deck)))
  );
}

function renderDone() {
  const label = deck().label.toLowerCase().replace(/s$/, "");
  const missed = [...missedThisRound]
    .map((id) => deck().cards.find((c) => c.id === id))
    .filter(Boolean);
  const done = masteredCount(stats, deck().id);

  const missedBlock = missed.length
    ? `<div class="missed-block">
        <p class="missed-label">You stumbled on ${missed.length} before getting ${missed.length === 1 ? "it" : "them"} — worth another pass:</p>
        <div class="missed-chips">${missed.map((c) => `<span class="ex-chip">${formulaHtml(c.formula)}</span>`).join("")}</div>
      </div>`
    : `<p class="feedback ok">Clean run — no stumbles. 🎉</p>`;

  root.innerHTML = `
    <p class="prompt">Stack cleared — all ${roundTotal} classified, including every strong ${label}.</p>
    ${missedBlock}
    <p class="progress-line">Saved progress: mastered <strong>${done} of ${deck().cards.length}</strong> ${deck().label.toLowerCase()} all-time.</p>
    <div class="controls">
      ${missed.length ? `<button class="action primary" id="reviewBtn">Drill the ${missed.length} you missed →</button>` : ""}
      <button class="action ${missed.length ? "ghost" : "primary"}" id="againBtn">Shuffle &amp; go again</button>
      <button class="reset-link" id="resetBtn" type="button">Reset saved progress</button>
    </div>`;

  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", reviewMissed);
  root.querySelector("#againBtn").addEventListener("click", () => {
    loadDeck(deckIndex);
    startStack();
  });
  root.querySelector("#resetBtn").addEventListener("click", () => {
    resetStats();
    stats = {};
    renderDone();
  });
}

renderSwitcher();
loadDeck(0);
