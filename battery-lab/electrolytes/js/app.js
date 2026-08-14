/*
  Battery Lab — Electrolyte Components: app controller.
  The only module that knows about DOM, data, renderer, and quiz engine.
  Modes: study (flashcard gallery) → quiz (MCQ round) → done.
  House rules honored: tabs on every screen, predict-then-Check (no
  auto-reveal), misses requeue, done screen offers next + revisit + again
  + home.
*/
import { DECK } from "../data/cards.js";
import { molSvg } from "./structures.js";
import { buildRound, buildQuestion } from "../../../shared/js/mcq-quiz.js";

const root = document.getElementById("game");

const TIERS = ["salt", "solvent", "additive", "all"].map((key) => ({
  key,
  label: DECK.categories[key].label,
  blurb: DECK.categories[key].blurb,
}));

const TYPE_LABELS = {
  structName: "structure → component",
  nameStruct: "name → structure",
  claimWho: "fact → component",
  whoClaim: "component → fact",
};

let tierIndex = 0;
let mode = "study"; // study | quiz | done
let openIds = new Set();
let quiz = null;

const cardById = new Map(DECK.cards.map((c) => [c.id, c]));

function tierCards() {
  const key = TIERS[tierIndex].key;
  if (key === "all") return DECK.cards;
  // cards can hold dual membership (e.g. VC/FEC/CEC: additives that also
  // deal into the Solvents tab as co-solvents)
  return DECK.cards.filter((c) => c.category === key || (c.also || []).includes(key));
}

/* ---------- formatting helpers ---------- */

const SUBS = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Unicode sub/superscripts → real markup so CSS controls the size (house
   subscript rule). Applied to facts, claims, taglines, specs. */
function chem(s) {
  return esc(s)
    .replace(/[₀-₉]+/g, (m) => `<sub>${[...m].map((ch) => SUBS[ch]).join("")}</sub>`)
    .replace(/[⁺⁻]/g, (m) => `<sup>${m === "⁺" ? "+" : "−"}</sup>`);
}

/* "LiPF6" → LiPF<sub>6</sub> for abbreviations kept plain in data. */
function abbrHtml(card) {
  return esc(card.abbr).replace(/([A-Za-z)\]])(\d+)/g, "$1<sub>$2</sub>");
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
  // chip a card whenever it's shown outside its home category
  const showChip = card.category !== TIERS[tierIndex].key;
  const head = `
    <button class="mol-head" type="button" data-id="${card.id}" aria-expanded="${open}">
      <div class="mol-figure">${molSvg(card.mol, { aria: card.name })}</div>
      <div class="mol-title">
        <span class="mol-abbr">${abbrHtml(card)}</span>
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
    <p class="study-hint">Click a card to flip it open. When the structures start looking like old friends, take the quiz.</p>
    <div class="study-grid">${cards.map(studyCard).join("")}</div>
    <div class="controls quiz-launch">
      <button class="action primary" id="quizBtn" type="button">Start the ${tier.label.toLowerCase()} quiz →</button>
      <span class="quiz-note">${roundLen} questions · structures and facts, mixed both ways</span>
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
    return molSvg(c.mol, { aria: "structure option" });
  }
  if (q.type === "whoClaim") return `<span class="opt-claim">${chem(opt.text)}</span>`;
  const c = cardById.get(opt.cardId);
  return `<span class="opt-abbr">${abbrHtml(c)}</span><span class="opt-name">${esc(c.name)}</span>`;
}

function questionBlock(q) {
  const card = cardById.get(q.cardId);
  if (q.type === "structName") {
    return {
      prompt: "Which electrolyte component is this?",
      stage: `<div class="mol-stage">${molSvg(card.mol, { aria: "mystery structure" })}</div>`,
    };
  }
  if (q.type === "nameStruct") {
    return {
      prompt: `Which structure is <strong>${esc(card.name)}</strong> (${abbrHtml(card)})?`,
      stage: "",
    };
  }
  if (q.type === "claimWho") {
    return {
      prompt: "Which component does this describe?",
      stage: `<blockquote class="claim">${chem(q.claim)}</blockquote>`,
    };
  }
  return {
    prompt: `Which statement is true of <strong>${abbrHtml(card)}</strong> — ${esc(card.name)}?`,
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
    const checkBtn = root.querySelector("#checkBtn");
    checkBtn.addEventListener("click", check);
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
    verdict.innerHTML = `<p class="feedback ok">✓ ${abbrHtml(card)} — ${chem(card.tagline)}</p>`;
  } else {
    const correctLine =
      q.type === "whoClaim"
        ? `the true statement is highlighted`
        : `this ${q.type === "nameStruct" ? "one is highlighted" : `is ${abbrHtml(card)} — ${esc(card.name)}`}`;
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
        <div class="chips">${missed.map((c) => `<span class="chip chip-missed">${abbrHtml(c)}</span>`).join("")}</div>
      </div>`
    : `<p class="feedback ok">Clean run — every structure and fact landed on the first try. 🎉</p>`;
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
