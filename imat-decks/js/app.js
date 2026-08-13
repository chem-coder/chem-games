// IMAT Decks — past-paper drill by topic, in the IMAT track order.
// House rules throughout: predict then Check, misses requeue, done screens
// offer next deck AND revisit AND home. Deck list is one click from everywhere.

import { DECKS } from "../data/decks.js";

const root = document.getElementById("game");

let deckIndex = 0;
let mode = "list"; // list | play | done
let queue = [];
let roundTotal = 0;
let card = null;
let picked = null;
let checked = false;
let wasCorrect = false;
let solved = 0;
let missed = [];

const deck = () => DECKS[deckIndex];

const shuffle = (a) => {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Formulas arrive as plain text (H2O, SO4^2-, 10⁻⁵…): dress digits after element
// symbols/parentheses as subscripts; leave everything else exactly as printed.
function fmt(s) {
  return esc(s)
    .replace(/\^(\d*[+-])/g, "<sup>$1</sup>")
    .replace(/([A-Za-z)\]])(\d+)/g, "$1<sub>$2</sub>");
}

function render() {
  if (mode === "play") return renderPlay();
  if (mode === "done") return renderDone();
  renderList();
}

// ── the deck list ──
function renderList() {
  let lastChapter = null;
  const rows = DECKS.map((d, i) => {
    const head = d.chapter !== lastChapter ? `<p class="chapter-label">${d.chapter}</p>` : "";
    lastChapter = d.chapter;
    const extras = d.questions.filter((q) => q.src === "Extra practice").length;
    return `${head}
      <button class="deck-row" data-deck="${i}" type="button">
        <span class="deck-name">${d.name}</span>
        <span class="deck-count">${d.questions.length} question${d.questions.length === 1 ? "" : "s"}${extras ? ` · ${extras} extra` : ""}</span>
        <span class="deck-go">drill →</span>
      </button>`;
  }).join("");

  root.innerHTML = `
    <div class="intro">
      <p class="intro-eyebrow">the decks, in study order</p>
      <p class="intro-lede">Decks follow the IMAT track: foundations first, the Big Three in the middle, organic at the end. Every card shows its source paper on the reveal — <em>Extra practice</em> marks questions written for this trainer in the exam's style.</p>
    </div>
    ${rows}
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  root.querySelectorAll(".deck-row").forEach((b) =>
    b.addEventListener("click", () => startDeck(Number(b.dataset.deck))));
}

function startDeck(i, cards) {
  deckIndex = i;
  queue = cards ? cards.slice() : shuffle(deck().questions);
  roundTotal = queue.length;
  solved = 0; missed = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  card = queue[0];
  picked = null; checked = false; wasCorrect = false;
  render();
}

// ── the drill ──
function renderPlay() {
  const letters = ["A", "B", "C", "D", "E"].filter((L) => card.options[L] !== undefined);
  const opts = letters.map((L) => {
    let cls = "answer-opt";
    if (!checked && picked === L) cls += " sel";
    if (checked && L === card.answer) cls += " right";
    if (checked && picked === L && L !== card.answer) cls += " wrong";
    return `<button class="${cls}" data-l="${L}" type="button" ${checked ? "disabled" : ""}>
      <span class="opt-letter">${L}</span><span class="opt-text">${fmt(card.options[L])}</span>
    </button>`;
  }).join("");

  const feedback = !checked ? `<p class="feedback">&nbsp;</p>`
    : wasCorrect
      ? `<p class="feedback ok">Correct. It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — the answer is ${card.answer}. This one comes back around.</p>`;
  const src = checked ? `<p class="src-line">${esc(card.src)}${card.sub ? ` · ${esc(card.sub)}` : ""}</p>` : "";

  root.innerHTML = `
    <button class="intro-link" id="listBtn" type="button">↩ All decks</button>
    <p class="deck-head">${deck().name} · ${solved} of ${roundTotal} solved · ${queue.length} left</p>
    <div class="q-card"><p class="q-text">${fmt(card.text)}</p></div>
    <div class="answers">${opts}</div>
    ${src}
    ${feedback}
    <div class="controls">
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !wasCorrect ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" disabled>Check</button>`}
    </div>`;

  root.querySelector("#listBtn").addEventListener("click", () => { mode = "list"; render(); });
  root.querySelectorAll(".answer-opt").forEach((b) => b.addEventListener("click", () => {
    if (checked) return;
    picked = b.dataset.l;
    root.querySelectorAll(".answer-opt").forEach((x) => x.classList.toggle("sel", x.dataset.l === picked));
    root.querySelector("#checkBtn").disabled = false;
  }));
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", () => {
    if (!picked) return;
    checked = true;
    wasCorrect = picked === card.answer;
    if (wasCorrect) solved += 1;
    else if (!missed.includes(card)) missed.push(card);
    render();
  });
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (wasCorrect) queue.shift();
      else queue.push(queue.shift());
      if (queue.length === 0) { mode = "done"; render(); } else loadCard();
    });
    nextBtn.focus();
  }
}

// ── the done screen ──
function renderDone() {
  const nextDeck = deckIndex < DECKS.length - 1 ? DECKS[deckIndex + 1] : null;
  const missedBlock = missed.length
    ? `<p class="missed-label">You stumbled on ${missed.length} — worth another pass before moving on.</p>`
    : `<p class="feedback ok">Clean run — all ${roundTotal} first try. 🎉</p>`;

  root.innerHTML = `
    <p class="prompt">Deck cleared — ${deck().name}: ${roundTotal} questions, ${roundTotal - missed.length} first-try.</p>
    ${missedBlock}
    ${missed.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missed.length} you missed →</button></div>` : ""}
    <div class="controls two-up done-nav">
      ${nextDeck ? `<button class="action primary" id="nextDeckBtn">Next deck: ${nextDeck.name} →</button>` : ""}
      <button class="action ghost" id="listBtn">↩ All decks</button>
    </div>
    <p class="done-next">Or run this deck again:</p>
    <div class="controls two-up"><button class="action primary" id="againBtn">Shuffle &amp; drill again</button></div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  const nextDeckBtn = root.querySelector("#nextDeckBtn");
  if (nextDeckBtn) nextDeckBtn.addEventListener("click", () => startDeck(deckIndex + 1));
  root.querySelector("#listBtn").addEventListener("click", () => { mode = "list"; render(); });
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => startDeck(deckIndex, missed));
  root.querySelector("#againBtn").addEventListener("click", () => startDeck(deckIndex));
}

render();
