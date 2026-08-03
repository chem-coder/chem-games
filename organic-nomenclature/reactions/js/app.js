// Organic Reactions prototype — DOM layer. Deck/logic in reactions.js, canvas from the
// game's lab.js, grading from chem.js. Same rhythm as the build direction: intro →
// 5-card round → done; the play screen renders once per card and patches sub-areas so
// a hint click can never wipe a half-built product.
import { toSubHtml } from "../../js/organic.js";
import { gradeIsomorphic } from "../../js/chem.js";
import { createLab } from "../../js/lab.js";
import { REACTION_INFO, hintsFor, makeReactionDealer } from "./reactions.js";

const root = document.querySelector("#game");
const deal = makeReactionDealer();

let mode = "intro"; // "intro" | "play" | "done"
let queue = [];
let roundTotal = 0;
let card = null;
let hintsShown = 0;
let checked = false;
let correct = false;
let solvedName = "";
let mastered = 0;
let cleanSolves = 0;
let missed = [];
let lab = null;

function killLab() {
  if (lab) { lab.destroy(); lab = null; }
}

function reagentHtml(c) {
  return `${toSubHtml(c.reagent)}${c.conditions ? ` <span class="conditions">(${c.conditions})</span>` : ""}`;
}

function startRound() {
  queue = deal();
  roundTotal = queue.length;
  mastered = 0;
  cleanSolves = 0;
  missed = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  card = queue[0];
  hintsShown = 0;
  checked = false;
  correct = false;
  solvedName = "";
  render();
}

function check() {
  if (checked || !lab || lab.atoms().length === 0) return;
  const allowed = [...new Set([...card.elements, "C"])];
  const hit = card.targets.find((t) => gradeIsomorphic(lab.atoms(), lab.bonds(), t.mol, allowed).ok);
  correct = Boolean(hit);
  solvedName = hit ? hit.name : "";
  checked = true;
  lab.setLocked(true);
  if (correct) {
    mastered += 1;
    if (hintsShown === 0) cleanSolves += 1;
  } else {
    missed.push(card);
  }
  updateAfterCheck();
}

function next() {
  queue = correct ? queue.slice(1) : [...queue.slice(1), queue[0]];
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── rendering ──
function render() {
  killLab();
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  renderPlay();
}

function renderIntro() {
  const rows = Object.values(REACTION_INFO).map((i) =>
    `<tr><td><strong>${i.label}</strong></td><td>${i.adds}</td><td>${i.result}</td></tr>`
  ).join("");
  root.innerHTML = `<div class="intro">
    <p class="intro-eyebrow">Reactions · Act A · addition to alkenes</p>
    <p class="intro-lede">One idea, four costumes: the C=C double bond <strong>opens</strong>, and each of its two carbons picks up one new piece.</p>
    <table class="rxn-table">
      <thead><tr><th>Reaction</th><th>adds…</th><th>giving…</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <ul class="pt-points">
      <li>The carbon skeleton <strong>never changes</strong> — addition only spends the double bond.</li>
      <li>When H and X (or H and OH) add to an unsymmetric alkene, two products are possible. The major one puts X/OH on the carbon with <strong>fewer hydrogens</strong> (Markovnikov) — the reveal shows which, and both honest answers count.</li>
      <li>You build the <strong>product</strong>: read the reactant, apply the reagent, drag the answer together. Hydrogens balance themselves, as always.</li>
    </ul>
    <div class="controls two-up">
      <button class="action primary alt" id="startBtn">Run the reactions</button>
    </div>
  </div>`;
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

function renderPlay() {
  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How addition reactions work</button>
    <div class="formula-card">
      <span class="card-tag">Organic · Reactions · ${REACTION_INFO[card.type].label.toLowerCase()}</span>
      <p class="rxn-prompt">${toSubHtml(card.reactant.condensed)} <span class="rxn-plus">+</span> ${reagentHtml(card)} <span class="rxn-arrow">→</span> <span class="rxn-q">?</span></p>
    </div>

    <p class="build-label">Build the product</p>
    <canvas class="lab-canvas" id="labCanvas"></canvas>
    <div id="hintArea"></div>
    <div id="verdictArea"></div>
    <div class="controls">
      <p class="score" id="scoreLine"></p>
      <button class="action primary" id="checkBtn" disabled>Check</button>
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelector("#checkBtn").addEventListener("click", check);
  updateHints();
  updateScore();

  lab = createLab(root.querySelector("#labCanvas"), {
    elements: card.elements,
    onChange() {
      const btn = root.querySelector("#checkBtn");
      if (btn && !checked) btn.disabled = lab.atoms().length === 0;
    }
  });
}

function updateScore() {
  root.querySelector("#scoreLine").textContent = `Solved ${mastered} of ${roundTotal} · ${queue.length} left`;
}

function updateHints() {
  const area = root.querySelector("#hintArea");
  if (!area || checked) return;
  const hints = hintsFor(card);
  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  area.innerHTML = `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length
        ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>`
        : ""}
    </div>`;
  const btn = area.querySelector("#hintBtn");
  if (btn) btn.addEventListener("click", () => { hintsShown += 1; updateHints(); });
}

function updateAfterCheck() {
  root.querySelector("#hintArea").innerHTML = "";
  const major = card.targets[0];
  const alt = card.targets.length > 1 && solvedName && solvedName !== major.name
    ? ` <span class="minor-note">(you built the minor product — accepted; the major is ${major.name})</span>`
    : "";
  const feedback = correct
    ? `<p class="feedback ok">${hintsShown ? "Correct." : "Solved clean — no hints. 💪"} It leaves the stack.${alt}</p>`
    : `<p class="feedback no">Not quite — this one comes back around.</p>`;
  const reveal = `<p class="reveal">${toSubHtml(card.reactant.condensed)} + ${reagentHtml(card)} → <strong>${major.name}</strong> &nbsp;·&nbsp; ${toSubHtml(major.condensed)}${card.targets.length > 1 ? ` <span class="minor-note">(major)</span>` : ""}</p>`;
  root.querySelector("#verdictArea").innerHTML = `${reveal}${feedback}`;
  const controls = root.querySelector(".controls");
  controls.innerHTML = `
    <p class="score" id="scoreLine"></p>
    <button class="action primary" id="nextBtn">${queue.length > 1 || !correct ? "Next →" : "Finish"}</button>`;
  updateScore();
  const nextBtn = root.querySelector("#nextBtn");
  nextBtn.addEventListener("click", next);
  nextBtn.focus();
}

function renderDone() {
  const missedChips = missed.map((c) =>
    `<span class="chip">${toSubHtml(c.reactant.condensed)} + ${toSubHtml(c.reagent)}</span>`).join("");
  const missedBlock = missed.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another pass — you stumbled on ${missed.length}:</p>
        <div class="chips">${missedChips}</div>
      </div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} solved with no hints. 🎉</p>`;

  root.innerHTML = `
    <p class="prompt">Round done — ${roundTotal} reactions, ${cleanSolves} solved hint-free.</p>
    ${missedBlock}
    <p class="done-next">Every round covers all four additions: H2, X2, HX, and water.</p>
    <div class="controls two-up">
      <button class="action primary alt" id="startBtn">Run another round</button>
    </div>`;
  root.querySelector("#startBtn").addEventListener("click", startRound);
}

render();

// Debug handle for headless verification — not part of the game surface.
window.__rxn = { get lab() { return lab; }, get card() { return card; }, check, next };
