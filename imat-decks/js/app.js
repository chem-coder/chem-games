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

// ── question-body formatting ──
// The bank stores everything as flat text (transcription of the original papers):
// tables flattened to "Row 1: …" prose, figures to [FIGURE: description], data
// given as [Atomic numbers: …]. The DATA stays verbatim; the renderer restores
// the original layouts: real tables, drawn figures where we have them, styled
// description boxes where we don't, and line breaks for numbered statements.

// Hand-drawn figures for specific questions (keyed by source).
function ptFragment(periods, placements) {
  const C = 30, exists = (p, g) => (p === 1 ? g === 1 || g === 8 : p === 7 ? g <= 2 : true);
  let cells = "";
  for (let p = 1; p <= periods; p++) for (let g = 1; g <= 8; g++) {
    if (!exists(p, g)) continue;
    cells += `<rect x="${(g - 1) * C + 1}" y="${(p - 1) * C + 1}" width="${C - 2}" height="${C - 2}" rx="3" fill="#fffdf8" stroke="#d8cfbc"/>`;
  }
  for (const [el, [p, g]] of Object.entries(placements)) {
    cells += `<text x="${(g - 1) * C + C / 2}" y="${(p - 1) * C + C / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="Lexend,sans-serif" font-weight="600" font-size="12" fill="#2d2a23">${el}</text>`;
  }
  return `<svg viewBox="0 0 ${8 * C + 2} ${periods * C + 2}" width="${8 * C + 2}" xmlns="http://www.w3.org/2000/svg" role="img">${cells}</svg>`;
}
const FIGURES = {
  "IMAT 2011 · Q64": () => ptFragment(4, { H: [1, 1], He: [1, 8], Li: [2, 1], C: [2, 4], Ne: [2, 8], Na: [3, 1], S: [3, 6], Cl: [3, 7], Br: [4, 7], Kr: [4, 8] }),
  "IMAT 2012 · Q66": () => ptFragment(5, { Li: [2, 1], Be: [2, 2], Na: [3, 1], Mg: [3, 2], K: [4, 1], Ca: [4, 2], Rb: [5, 1], Sr: [5, 2], C: [2, 4], O: [2, 6], Si: [3, 4], S: [3, 6], Cl: [3, 7], Br: [4, 7], I: [5, 7] }),
  "IMAT 2013 · Q49": () => ptFragment(7, Object.fromEntries([
    ["H",[1,1]],["He",[1,8]],
    ...["Li","Be","B","C","N","O","F","Ne"].map((e,i)=>[e,[2,i+1]]),
    ...["Na","Mg","Al","Si","P","S","Cl","Ar"].map((e,i)=>[e,[3,i+1]]),
    ...["K","Ca","Ga","Ge","As","Se","Br","Kr"].map((e,i)=>[e,[4,i+1]]),
    ...["Rb","Sr","In","Sn","Sb","Te","I","Xe"].map((e,i)=>[e,[5,i+1]]),
    ...["Cs","Ba","Tl","Pb","Bi","Po","At","Rn"].map((e,i)=>[e,[6,i+1]]),
    ["Fr",[7,1]],["Ra",[7,2]],
  ])),
  "IMAT 2023 · Q33": () => `<svg viewBox="0 0 120 64" width="120" xmlns="http://www.w3.org/2000/svg" role="img">
    <text x="58" y="40" font-family="Outfit,sans-serif" font-weight="700" font-size="34" fill="#2d2a23">A</text>
    <text x="52" y="22" text-anchor="end" font-family="Lexend,sans-serif" font-weight="600" font-size="14" fill="#2d2a23">2x+2</text>
    <text x="52" y="56" text-anchor="end" font-family="Lexend,sans-serif" font-weight="600" font-size="14" fill="#2d2a23">x</text>
    <text x="86" y="22" font-family="Lexend,sans-serif" font-weight="600" font-size="14" fill="#2d2a23">2+</text>
  </svg>`,
};

function rowsTable(rows) {
  return `<table class="q-table"><tbody>${rows.map(([label, content]) =>
    `<tr><th>${esc(label)}</th>${content.split("; ").map((c) => `<td>${fmt(c)}</td>`).join("")}</tr>`
  ).join("")}</tbody></table>`;
}

function breakEnumerations(t) {
  if (/\sII\.\s/.test(t)) t = t.replace(/\s(I{1,3}\.|IV\.|V\.)\s/g, "<br>$1 ");
  if (/\s1\.\s/.test(t) && /\s2\.\s/.test(t)) t = t.replace(/\s([1-6]\.)\s(?=[A-Za-z])/g, "<br>$1 ");
  return t;
}

function questionBody(card) {
  const parts = [];
  // split off bracketed blocks, keeping order
  const tokens = card.text.split(/(\[[^\]]+\])/);
  let pendingRows = [];
  const flushRows = () => { if (pendingRows.length) { parts.push(rowsTable(pendingRows)); pendingRows = []; } };
  for (const tok of tokens) {
    if (!tok.trim()) continue;
    if (tok.startsWith("[FIGURE")) {
      flushRows();
      const desc = tok.replace(/^\[FIGURE:?\s*/, "").replace(/\]$/, "");
      const draw = FIGURES[card.src];
      parts.push(draw
        ? `<figure class="q-fig">${draw()}</figure>`
        : `<figure class="q-fig q-fig-desc"><span class="fig-tag">figure</span> ${fmt(desc)}</figure>`);
    } else if (tok.startsWith("[TABLE")) {
      flushRows();
      const body = tok.replace(/^\[TABLE:?\s*/, "").replace(/\]$/, "");
      const rows = body.split(/;?\s*rows?\s*(\d+):\s*/i);
      const pairs = [];
      for (let i = 1; i < rows.length; i += 2) pairs.push([`Row ${rows[i]}`, rows[i + 1].split(", ").join("; ")]);
      parts.push(rowsTable(pairs));
    } else if (tok.startsWith("[")) {
      flushRows();
      parts.push(`<p class="data-note">${fmt(tok.slice(1, -1))}</p>`);
    } else {
      // plain text: pull out "Row N: …" lines as table rows
      for (const line of tok.split("\n")) {
        const m = line.match(/^\s*rows?\s*(\d+):\s*(.+)$/i);
        if (m) pendingRows.push([`Row ${m[1]}`, m[2]]);
        else if (line.trim()) { flushRows(); parts.push(`<p class="q-text">${breakEnumerations(fmt(line))}</p>`); }
      }
    }
  }
  flushRows();
  return parts.join("");
}

// Options whose texts all share the same "label: value; label: value" skeleton
// were tables in the original paper — render them as one.
function optionTableLabels(card) {
  const opts = Object.values(card.options);
  const labelsOf = (o) => {
    const segs = o.split("; ").filter((s) => s.includes(": "));
    return segs.length >= 2 ? segs.map((s) => s.split(": ")[0].trim()) : null;
  };
  const first = labelsOf(opts[0]);
  if (!first) return null;
  return opts.every((o) => JSON.stringify(labelsOf(o)) === JSON.stringify(first)) ? first : null;
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
  const tableLabels = optionTableLabels(card);
  const opts = tableLabels ? `
    <table class="opt-table"><thead><tr><th></th>${tableLabels.map((l) => `<th>${esc(l)}</th>`).join("")}</tr></thead>
    <tbody>${letters.map((L) => {
      let cls = "opt-row";
      if (!checked && picked === L) cls += " sel";
      if (checked && L === card.answer) cls += " right";
      if (checked && picked === L && L !== card.answer) cls += " wrong";
      const cells = card.options[L].split("; ").map((seg) => `<td>${fmt(seg.includes(": ") ? seg.split(": ").slice(1).join(": ") : seg)}</td>`).join("");
      return `<tr class="${cls}" data-l="${L}"><th>${L}</th>${cells}</tr>`;
    }).join("")}</tbody></table>` : letters.map((L) => {
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
    <div class="q-card">${questionBody(card)}</div>
    <div class="answers">${opts}</div>
    ${src}
    ${feedback}
    <div class="controls">
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !wasCorrect ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" disabled>Check</button>`}
    </div>`;

  root.querySelector("#listBtn").addEventListener("click", () => { mode = "list"; render(); });
  root.querySelectorAll(".answer-opt, .opt-row").forEach((b) => b.addEventListener("click", () => {
    if (checked) return;
    picked = b.dataset.l;
    root.querySelectorAll(".answer-opt, .opt-row").forEach((x) => x.classList.toggle("sel", x.dataset.l === picked));
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

// dev helper: jump straight to a question by source fragment, e.g. __jump("2012 · Q66")
window.__jump = (frag) => { const di = DECKS.findIndex((d) => d.questions.some((q) => q.src.includes(frag))); if (di < 0) return "not found"; const q = DECKS[di].questions.find((q) => q.src.includes(frag)); startDeck(di, [q]); return q.src; };
