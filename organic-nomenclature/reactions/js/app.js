// Organic Reactions — DOM layer. Deck/logic in reactions.js, canvas from the game's
// lab.js, grading from chem.js. Two quizzes share this page:
//   BUILD — reactant + reagent → assemble the product on the canvas
//   MARKOVNIKOV — reaction + both products shown, pick the major (50/50)
// Build cards render once and patch sub-areas so hint clicks never wipe a half-built
// product. Three Dalia-spec features (2026-08-03):
//   · "Check my reactant" — non-graded, formalizes her build-then-transform workflow
//   · explicit H tokens — the reagent's delivered H is placed by hand, because the
//     auto-hydrogens were hiding the very decision addition teaches
//   · structure-right-but-H-implicit is a NUDGE, not a wrong (house rule: formatting
//     nudges, chemistry wrongs)
import { toSubHtml } from "../../js/organic.js";
import { gradeIsomorphic, stripExplicitH, splitComponents } from "../../js/chem.js";
import { createLab } from "../../js/lab.js";
import { REACTION_INFO, hintsFor, makeReactionDealer, makeMarkovnikovDealer } from "./reactions.js";

const root = document.querySelector("#game");
const dealBuild = makeReactionDealer();
const dealMk = makeMarkovnikovDealer();

let mode = "intro";       // "intro" | "play" | "mk" | "done"
let quiz = "build";       // which quiz the round (and done screen) belongs to
let queue = [];
let roundTotal = 0;
let card = null;
let options = [];          // mk: shuffled option order
let picked = -1;           // mk: selected option index
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

function startRound(which) {
  quiz = which;
  queue = which === "build" ? dealBuild() : dealMk();
  roundTotal = queue.length;
  mastered = 0;
  cleanSolves = 0;
  missed = [];
  mode = which === "build" ? "play" : "mk";
  loadCard();
}

function loadCard() {
  card = queue[0];
  hintsShown = 0;
  checked = false;
  correct = false;
  solvedName = "";
  picked = -1;
  if (mode === "mk") options = Math.random() < 0.5 ? [...card.options] : [...card.options].reverse();
  render();
}

function next() {
  queue = correct ? queue.slice(1) : [...queue.slice(1), queue[0]];
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── build-quiz checking ──
function explicitHs() {
  return lab.atoms().filter((a) => a.el === "H");
}

function hBondedToHeavy(h) {
  const bond = lab.bonds().find((b) => b.a === h.id || b.b === h.id);
  if (!bond) return false;
  const otherId = bond.a === h.id ? bond.b : bond.a;
  return lab.atoms().find((a) => a.id === otherId)?.el !== "H";
}

function nudge(msg) {
  const area = root.querySelector("#nudgeArea");
  if (!area) return;
  area.innerHTML = `<p class="nudge">${msg}</p>`;
  clearTimeout(nudge.timer);
  nudge.timer = setTimeout(() => { if (root.querySelector("#nudgeArea")) root.querySelector("#nudgeArea").innerHTML = ""; }, 6000);
}

function checkReactant() {
  if (checked || !lab) return;
  const stripped = stripExplicitH(lab.atoms(), lab.bonds());
  if (stripped.atoms.length === 0) return nudge("The canvas is empty — build the reactant first.");
  // component-wise: having the reagent (or spares) alongside is fine — students
  // reasonably build both reactants before making them meet
  const comps = splitComponents(stripped.atoms, stripped.bonds);
  const ok = comps.some((g) => gradeIsomorphic(g.atoms, g.bonds, card.reactant.mol, ["C"]).ok);
  nudge(ok
    ? `✓ That's ${card.reactant.name}${comps.length > 1 ? " (spare pieces aside)" : ""} — now make it react with ${toSubHtml(card.reagent)}.`
    : `Not ${card.reactant.name} yet — check the carbon count and where the double bond sits.`);
}

function check() {
  if (checked || !lab || lab.atoms().length === 0) return;
  if (lab.openSlotCount() > 0) {
    return nudge("That blinking carbon still needs a partner — the opened double bond freed a seat, and something must bond there.");
  }
  const hs = explicitHs();
  if (hs.some((h) => !hBondedToHeavy(h))) {
    return nudge("Every hydrogen token needs a carbon to hold onto — one is still loose.");
  }
  const stripped = stripExplicitH(lab.atoms(), lab.bonds());
  const allowed = card.elements.filter((e) => e !== "H");
  const matchOf = (g) => card.targets.find((t) => gradeIsomorphic(g.atoms, g.bonds, t.mol, allowed).ok);
  const hit = matchOf(stripped);
  // the right molecule with spare pieces floating is housekeeping, not chemistry
  if (!hit) {
    const comps = splitComponents(stripped.atoms, stripped.bonds);
    if (comps.length > 1 && comps.some(matchOf)) {
      return nudge("That IS the product — now clear the leftover pieces (drop them on the tray) so only the product remains.");
    }
  }
  // structure right but the reagent's hydrogens weren't placed → teach, don't punish
  if (hit && card.explicitH > 0 && hs.length < card.explicitH) {
    return nudge(`The structure is right — but show me the reagent's hydrogen${card.explicitH > 1 ? "s" : ""}: drag ${card.explicitH > 1 ? "them" : "it"} from the tray onto the molecule (${hs.length} of ${card.explicitH} placed).`);
  }
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

// ── mk-quiz checking ──
function checkMk() {
  if (checked || picked < 0) return;
  correct = Boolean(options[picked].major);
  checked = true;
  if (correct) {
    mastered += 1;
    cleanSolves += 1;
  } else {
    missed.push(card);
  }
  renderMk();
}

// ── rendering ──
function render() {
  killLab();
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  if (mode === "mk") return renderMk();
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
      <li>You build the <strong>product</strong>: many players build the reactant first, check it, then make it react — the <em>Check my reactant</em> button is there for exactly that.</li>
      <li>The reagent's own hydrogen arrives in the tray: <strong>place it</strong>. Where the H goes is half the chemistry.</li>
    </ul>

    <div class="mk-teach">
      <h3>Markovnikov's rule</h3>
      <p>When H–Br or H–OH adds to an <strong>unsymmetric</strong> alkene, two products are possible — and they are not equally likely.</p>
      <p class="mk-worked">${toSubHtml("CH2=CHCH3")} + ${toSubHtml("HBr")}: &nbsp;C-1 of the double bond holds <strong>two</strong> H's, C-2 holds <strong>one</strong>. The new H joins the carbon that already has more — <em>the rich get richer</em> — so H goes to C-1 and the Br takes C-2: <strong>2-bromopropane</strong> is the <strong>major</strong> product. 1-bromopropane still forms, as the <strong>minor</strong>.</p>
      <p>Count the hydrogens on the two double-bond carbons; the H joins the richer one, the X or OH takes the poorer one. That's the whole rule.</p>
    </div>

    <div class="controls two-up">
      <button class="action primary alt" id="startBuild">Build the products</button>
      <button class="action primary" id="startMk">Major or minor? · quiz</button>
    </div>
  </div>`;
  root.querySelector("#startBuild").addEventListener("click", () => startRound("build"));
  root.querySelector("#startMk").addEventListener("click", () => startRound("mk"));
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
    <div id="nudgeArea"></div>
    <div id="hintArea"></div>
    <div id="verdictArea"></div>
    <div class="controls">
      <p class="score" id="scoreLine"></p>
      <span class="btn-row">
        <button class="action ghost" id="reactantBtn" type="button">Check my reactant</button>
        <button class="action primary" id="checkBtn" disabled>Check</button>
      </span>
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelector("#checkBtn").addEventListener("click", check);
  root.querySelector("#reactantBtn").addEventListener("click", checkReactant);
  updateHints();
  updateScore();

  lab = createLab(root.querySelector("#labCanvas"), {
    elements: card.elements,
    additionMode: true,   // arrivals attack the π bond; the far carbon shows an open seat
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
  root.querySelector("#nudgeArea").innerHTML = "";
  const major = card.targets[0];
  const builtMinor = card.targets.length > 1 && solvedName && solvedName !== major.name;
  const feedback = correct
    ? `<p class="feedback ok">${hintsShown ? "Correct." : "Solved clean — no hints. 💪"} It leaves the stack.</p>${builtMinor
        ? `<p class="regio-note">You built the <strong>minor</strong> product — real, accepted. The <strong>major</strong> is ${major.name}: Markovnikov puts the ${card.type === "hydration" ? "OH" : "halogen"} on the double-bond carbon with fewer H's.</p>`
        : ""}`
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

// ── Markovnikov quiz screen ──
function renderMk() {
  killLab();
  const optionTiles = options.map((o, i) => `
    <button class="mk-option${picked === i ? " is-picked" : ""}${checked ? (o.major ? " is-major" : " is-minor") : ""}"
      data-i="${i}" type="button" ${checked ? "disabled" : ""}>
      <span class="mk-formula">${toSubHtml(o.condensed)}</span>
      <span class="mk-name">${o.name}</span>
      ${checked ? `<span class="mk-verdict">${o.major ? "MAJOR" : "minor"}</span>` : ""}
    </button>`).join("");

  const verdict = checked
    ? `<p class="feedback ${correct ? "ok" : "no"}">${correct ? "Correct — that's the major product. 💪" : "Not this one — it forms, but as the minor."}</p>
       <p class="regio-note">${card.why}</p>`
    : "";

  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ Markovnikov's rule</button>
    <div class="formula-card">
      <span class="card-tag">Organic · Reactions · major or minor?</span>
      <p class="rxn-prompt">${toSubHtml(card.reactant.condensed)} <span class="rxn-plus">+</span> ${toSubHtml(card.reagent)} <span class="rxn-arrow">→</span></p>
    </div>
    <p class="build-label">Both products form — which is the MAJOR one?</p>
    <div class="mk-options">${optionTiles}</div>
    ${verdict}
    <div class="controls">
      <p class="score">Solved ${mastered} of ${roundTotal} · ${queue.length} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${picked < 0 ? "disabled" : ""}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelectorAll(".mk-option").forEach((b) =>
    b.addEventListener("click", () => { picked = Number(b.dataset.i); renderMk(); }));
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", checkMk);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
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
    <p class="prompt">Round done — ${roundTotal} ${quiz === "mk" ? "Markovnikov calls" : "reactions"}, ${cleanSolves} solved ${quiz === "mk" ? "first try" : "hint-free"}.</p>
    ${missedBlock}
    <p class="done-next">${quiz === "mk"
      ? "Count the H's on the two double-bond carbons — the rule never changes."
      : "Every round covers all four additions: H2, X2, HX, and water."}</p>
    <div class="controls two-up">
      <button class="action primary alt" id="startBuild">Build the products</button>
      <button class="action primary" id="startMk">Major or minor? · quiz</button>
    </div>`;
  root.querySelector("#startBuild").addEventListener("click", () => startRound("build"));
  root.querySelector("#startMk").addEventListener("click", () => startRound("mk"));
}

render();

// Debug handle for headless verification — not part of the game surface.
window.__rxn = {
  get lab() { return lab; }, get card() { return card; }, get options() { return options; },
  get mode() { return mode; },
  pick(i) { picked = i; renderMk(); },
  check, checkMk, checkReactant, next
};
