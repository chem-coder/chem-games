/*
  Battery Lab — Cathode Materials: app controller.
  Mirrors the electrolytes game: study (flashcard gallery) → quiz → done,
  house rules throughout (tabs everywhere, predict-then-Check, misses
  requeue, done screen offers next + revisit + again + home).
  Structures here are schematic lattices (js/lattice.js), not molecules.
*/
import { DECK } from "../data/cards.js";
import { latticeSvg } from "./lattice.js";
import { buildRound, buildQuestion } from "../../../shared/js/mcq-quiz.js";

const root = document.getElementById("game");

const TIERS = ["layered", "spinel", "olivine", "all"].map((key) => ({
  key,
  label: DECK.categories[key].label,
  blurb: DECK.categories[key].blurb,
}));

const TYPE_LABELS = {
  structName: "lattice → material",
  nameStruct: "material → lattice",
  claimWho: "fact → material",
  whoClaim: "material → fact",
};

let tierIndex = 0;
let mode = "study"; // study | quiz | done
let openIds = new Set();
let quiz = null;

const cardById = new Map(DECK.cards.map((c) => [c.id, c]));

function tierCards() {
  const key = TIERS[tierIndex].key;
  return key === "all" ? DECK.cards : DECK.cards.filter((c) => c.category === key);
}

/* ---------- formatting helpers ---------- */

const SUBS = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };
const SUPS = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Unicode sub/superscripts → real markup so CSS controls the size (house
   subscript rule). Applied to facts, claims, taglines, specs. */
function chem(s) {
  return esc(s)
    .replace(/[₀-₉]+/g, (m) => `<sub>${[...m].map((ch) => SUBS[ch]).join("")}</sub>`)
    .replace(/([⁰-⁹]*)([⁺⁻])/g, (m, digits, sign) =>
      `<sup>${[...digits].map((ch) => SUPS[ch]).join("")}${sign === "⁺" ? "+" : "−"}</sup>`
    )
    .replace(/[⁰-⁹]+/g, (m) => `<sup>${[...m].map((ch) => SUPS[ch]).join("")}</sup>`);
}

function catChip(card) {
  const cat = DECK.categories[card.category];
  return `<span class="cat-chip cat-${card.category}">${cat.label.replace(/s$/, "")}</span>`;
}

/* ---------- navigation (house rules: tabs on every screen) ---------- */

function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map(
    (t, i) =>
      `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${t.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => {
      tierIndex = Number(b.dataset.tier);
      mode = "study";
      quiz = null;
      openIds = new Set();
      render();
    })
  );
}

/* ---------- study screen ---------- */

function studyCard(card) {
  const open = openIds.has(card.id);
  const showChip = TIERS[tierIndex].key === "all";
  const head = `
    <button class="mol-head" type="button" data-id="${card.id}" aria-expanded="${open}">
      <div class="mol-figure">${latticeSvg(card, { aria: card.name })}</div>
      <div class="mol-title">
        <span class="mol-abbr">${esc(card.abbr)}</span>
        <span class="mol-formula">${card.formulaHtml}</span>
        <span class="mol-name">${esc(card.name)}</span>
      </div>
      ${showChip ? catChip(card) : ""}
      <span class="mol-flip" aria-hidden="true">${open ? "▾" : "▸"}</span>
    </button>`;
  const back = open
    ? `<div class="mol-back">
        <p class="mol-tagline">${chem(card.tagline)}</p>
        <ol class="steps">
          ${card.facts
            .map(
              (f, i) =>
                `<li><span class="step-num">${i + 1}</span><span class="step-text">${chem(f)}</span></li>`
            )
            .join("")}
        </ol>
        <div class="chips spec-chips">
          <span class="chip chip-formula">${card.formulaHtml}</span>
          ${card.specs.map((s) => `<span class="chip">${chem(s)}</span>`).join("")}
        </div>
      </div>`
    : "";
  return `<article class="mol-card${open ? " is-open" : ""}">${head}${back}</article>`;
}

function renderStudy() {
  const tier = TIERS[tierIndex];
  const cards = tierCards();
  const roundLen = Math.min(10, cards.length * 2);
  root.innerHTML = `
    ${tierTabs()}
    <p class="cat-blurb">${chem(tier.blurb)}</p>
    <p class="study-hint">Click a card to flip it open. The lattice sketches share one style — 2D planes, 3D channels, 1D tunnels — so the family reads at a glance.</p>
    <div class="study-grid">${cards.map(studyCard).join("")}</div>
    <div class="controls quiz-launch">
      <button class="action primary" id="quizBtn" type="button">Start the ${tier.label.toLowerCase()} quiz →</button>
      <span class="quiz-note">${roundLen} questions · lattices, formulas, and facts, mixed both ways</span>
    </div>`;
  wireTabs();
  root.querySelectorAll(".mol-head").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      openIds.has(id) ? openIds.delete(id) : openIds.add(id);
      render();
    })
  );
  root.querySelector("#quizBtn").addEventListener("click", startQuiz);
}

/* ---------- quiz screen ---------- */

function startQuiz(fromCards) {
  const cards = Array.isArray(fromCards) && fromCards.length ? fromCards : tierCards();
  // pool = the active tab, so small-tab quizzes stay within-family
  const pool = tierCards();
  const queue = buildRound(cards, pool, Math.random, Math.min(10, cards.length * 2));
  quiz = { queue, pool, total: queue.length, solved: 0, clean: 0, missedIds: new Set(), picked: null, checked: false };
  mode = "quiz";
  render();
}

function optionInner(opt, q) {
  if (q.type === "nameStruct") {
    const c = cardById.get(opt.cardId);
    return latticeSvg(c, { aria: "lattice option", className: "quiz-fig" });
  }
  if (q.type === "whoClaim") return `<span class="opt-claim">${chem(opt.text)}</span>`;
  const c = cardById.get(opt.cardId);
  return `<span class="opt-abbr">${esc(c.abbr)}</span><span class="opt-name">${esc(c.name)}</span>`;
}

function questionBlock(q) {
  const card = cardById.get(q.cardId);
  if (q.type === "structName") {
    return {
      prompt: "Which cathode material is this lattice?",
      stage: `<div class="mol-stage">${latticeSvg(card, { aria: "mystery lattice", className: "quiz-fig" })}</div>`,
    };
  }
  if (q.type === "nameStruct") {
    return {
      prompt: `Which lattice is <strong>${esc(card.name)}</strong> (${esc(card.abbr)})?`,
      stage: "",
    };
  }
  if (q.type === "claimWho") {
    return {
      prompt: "Which material does this describe?",
      stage: `<blockquote class="claim">${chem(q.claim)}</blockquote>`,
    };
  }
  return {
    prompt: `Which statement is true of <strong>${esc(card.abbr)}</strong> — ${esc(card.name)}?`,
    stage: "",
  };
}

function renderQuiz() {
  const q = quiz.queue[0];
  const { prompt, stage } = questionBlock(q);
  const molOpts = q.type === "nameStruct";
  root.innerHTML = `
    ${tierTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">Solved ${quiz.solved} of ${quiz.total}</span>
      <span class="qtype-chip">${TYPE_LABELS[q.type]}</span>
      ${q.dirty ? '<span class="qtype-chip retry">back for another try</span>' : ""}
    </div>
    <p class="prompt">${prompt}</p>
    ${stage}
    <div class="opts${molOpts ? " opts-mol" : ""}">
      ${q.options
        .map(
          (o, i) =>
            `<button class="opt${quiz.picked === i ? " is-picked" : ""}" type="button" data-i="${i}" ${quiz.checked ? "disabled" : ""}>${optionInner(o, q)}</button>`
        )
        .join("")}
    </div>
    <div id="verdict"></div>
    <div class="controls">
      <button class="action ghost" id="backBtn" type="button">↩ Back to the cards</button>
      ${quiz.checked
        ? '<button class="action primary" id="nextBtn" type="button">Next →</button>'
        : `<button class="action primary" id="checkBtn" type="button" ${quiz.picked == null ? "disabled" : ""}>Check</button>`}
    </div>`;
  wireTabs();
  root.querySelector("#backBtn").addEventListener("click", () => {
    mode = "study";
    quiz = null;
    render();
  });
  if (!quiz.checked) {
    root.querySelectorAll(".opt").forEach((b) =>
      b.addEventListener("click", () => {
        quiz.picked = Number(b.dataset.i);
        render();
      })
    );
    root.querySelector("#checkBtn").addEventListener("click", check);
  } else {
    paintVerdict(q);
    root.querySelector("#nextBtn").addEventListener("click", next);
  }
}

function check() {
  if (quiz.picked == null) return;
  const q = quiz.queue[0];
  const right = q.options[quiz.picked].correct;
  quiz.checked = true;
  if (right) {
    quiz.solved += 1;
    if (!q.dirty) quiz.clean += 1;
  } else {
    quiz.missedIds.add(q.cardId);
    // requeue with freshly generated options so position can't be memorized
    const card = cardById.get(q.cardId);
    const retry = buildQuestion(card, quiz.pool, q.type, Math.random);
    retry.dirty = true;
    quiz.queue.push(retry);
  }
  render();
}

function paintVerdict(q) {
  const card = cardById.get(q.cardId);
  const right = q.options[quiz.picked].correct;
  const opts = root.querySelectorAll(".opt");
  q.options.forEach((o, i) => {
    if (o.correct) opts[i].classList.add("is-right");
    else if (i === quiz.picked) opts[i].classList.add("is-wrong");
  });
  const verdict = root.querySelector("#verdict");
  if (right) {
    verdict.innerHTML = `<p class="feedback ok">✓ ${esc(card.abbr)} — ${chem(card.tagline)}</p>`;
  } else {
    const correctLine =
      q.type === "whoClaim"
        ? `the true statement is highlighted`
        : `this ${q.type === "nameStruct" ? "one is highlighted" : `is ${esc(card.abbr)} — ${esc(card.name)}`}`;
    verdict.innerHTML = `<p class="feedback no">✗ Not quite — ${correctLine}. This one comes back around.</p>`;
  }
}

function next() {
  quiz.queue.shift();
  quiz.picked = null;
  quiz.checked = false;
  if (!quiz.queue.length) mode = "done";
  render();
}

/* ---------- done screen (house pattern: next + revisit + again + home) --- */

function renderDone() {
  const tier = TIERS[tierIndex];
  const nextTier = TIERS[tierIndex + 1] || null;
  const missed = [...quiz.missedIds].map((id) => cardById.get(id));
  const missedBlock = missed.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another look:</p>
        <div class="chips">${missed.map((c) => `<span class="chip chip-missed">${esc(c.abbr)}</span>`).join("")}</div>
      </div>`
    : `<p class="feedback ok">Clean run — every lattice and fact landed on the first try. 🎉</p>`;
  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${quiz.total} questions, ${quiz.clean} solved clean on the first try.</p>
    ${missedBlock}
    ${missed.length ? `<div class="controls"><button class="action ghost" id="redrillBtn" type="button">Redrill the ${missed.length} you missed →</button></div>` : ""}
    <div class="controls two-up done-nav">
      ${nextTier ? `<button class="action primary" id="nextTierBtn" type="button">Next: ${nextTier.label} →</button>` : ""}
      <button class="action ghost" id="revisitBtn" type="button">↩ Revisit the ${tier.label.toLowerCase()} cards</button>
    </div>
    <p class="done-next">Or run it again:</p>
    <div class="controls two-up">
      <button class="action ghost" id="againBtn" type="button">Another ${tier.label.toLowerCase()} round</button>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ Battery Lab</a> &nbsp;·&nbsp; <a class="home-link" href="../../">⌂ All Chem Games</a></p>`;
  wireTabs();
  const redrill = root.querySelector("#redrillBtn");
  if (redrill) redrill.addEventListener("click", () => startQuiz(missed));
  const nextBtn = root.querySelector("#nextTierBtn");
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      tierIndex += 1;
      mode = "study";
      quiz = null;
      openIds = new Set();
      render();
    });
  root.querySelector("#revisitBtn").addEventListener("click", () => {
    mode = "study";
    quiz = null;
    render();
  });
  root.querySelector("#againBtn").addEventListener("click", () => startQuiz());
}

/* ---------- dispatcher ---------- */

function render() {
  if (mode === "quiz") renderQuiz();
  else if (mode === "done") renderDone();
  else renderStudy();
}

render();
