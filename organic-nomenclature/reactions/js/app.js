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
import { REACTION_INFO, hintsFor, makeReactionDealer, makeEliminationDealer, makeSubstitutionDealer, makeCarbonylActDealer, makeMarkovnikovDealer } from "./reactions.js";

const root = document.querySelector("#game");
const dealers = {
  build: makeReactionDealer(),
  elim: makeEliminationDealer(),
  sub: makeSubstitutionDealer(),
  carb: makeCarbonylActDealer(),
  mk: makeMarkovnikovDealer()
};

// The ladder (Dalia's spec, 2026-08-04): one compact study sheet per topic, one button
// to that topic's quiz, and the done screen leads to the next topic — same oval-bookmark
// pattern as the Nomenclature games. Tabs are free-roaming; the order is the suggestion.
const TOPICS = [
  { id: "build", label: "Addition" },
  { id: "elim", label: "Elimination" },
  { id: "sub", label: "Substitution" },
  { id: "carb", label: "Carbonyls" },
  { id: "mk", label: "Major or minor?" }
];
let topicIndex = 0;
const topic = () => TOPICS[topicIndex];

let mode = "intro";       // "intro" | "play" | "mk" | "done"
let quiz = "build";       // which quiz the round (and done screen) belongs to
let phase = "reactants";  // per build card: "reactants" (auto-H, auto-recognized) | "product"
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
let minorAcknowledged = false;  // the minor-product popup must be dismissed before Next exists
let builtMinorFlag = false;     // minor built: explained by popup, then RETURNS to the stack
let lab = null;

function killLab() {
  if (lab) { lab.destroy(); lab = null; }
}

function reagentHtml(c) {
  return `${toSubHtml(c.reagent)}${c.conditions ? ` <span class="conditions">(${c.conditions})</span>` : ""}`;
}

function startRound(which) {
  quiz = which;
  queue = dealers[which]();
  roundTotal = queue.length;
  mastered = 0;
  cleanSolves = 0;
  missed = [];
  mode = which === "mk" ? "mk" : "play";
  loadCard();
}

function loadCard() {
  card = queue[0];
  hintsShown = 0;
  checked = false;
  correct = false;
  solvedName = "";
  picked = -1;
  phase = "reactants";
  minorAcknowledged = false;
  builtMinorFlag = false;
  if (mode === "mk") options = Math.random() < 0.5 ? [...card.options] : [...card.options].reverse();
  render();
}

// ── phase 1 → 2: auto-recognition (Dalia's spec: no button — the game just notices) ──
function molMatches(comp, mol) {
  const els = [...new Set([...comp.atoms, ...mol.atoms].map((a) => a.el).concat("H"))];
  if (gradeIsomorphic(comp.atoms, comp.bonds, mol, els).ok) return true;
  const sm = stripExplicitH(mol.atoms, mol.bonds);
  if (sm.atoms.length === 0) return false;
  const sc = stripExplicitH(comp.atoms, comp.bonds);
  return sc.atoms.length > 0 && gradeIsomorphic(sc.atoms, sc.bonds, sm, els).ok;
}

function reactantsBuilt() {
  // never mid-drag, and every atom must have cleared the inventory zone — otherwise
  // a reagent barely out of the tray triggers the popup before the student has moved
  if (lab.isDragging()) return false;
  const all = lab.atoms();
  if (all.length === 0 || all.some((a) => a.y > lab.stagingLine())) return false;
  const comps = splitComponents(all, lab.bonds());
  if (comps.length !== card.phase1Mols.length) return false;
  const used = new Set();
  for (const mol of card.phase1Mols) {
    const i = comps.findIndex((g, idx) => !used.has(idx) && molMatches(g, mol));
    if (i < 0) return false;
    used.add(i);
  }
  return true;
}

// Recognition LOCKS the bench and raises a real popup; the student must click
// Continue before the workspace opens back up (Dalia: without the explicit action
// the transition read as a freeze).
function onReactantsRecognized() {
  phase = "recognized";
  lab.normalizeLayout();   // the student creates the structure; the computer draws it pretty
  lab.setLocked(true);
  const modal = root.querySelector("#phaseModal");
  if (modal) {
    const task = card.noReaction
      ? `what happens when it meets ${toSubHtml(card.reagent)}?`
      : `predict the ${card.targets && card.targets.length > 1 && !card.targets[0].even ? "<strong>major</strong> product" : "product"}`;
    modal.innerHTML = `<div class="phase-modal">
        <p class="phase-modal-title">✓ The reactant${card.phase1Mols.length > 1 ? "s look" : " looks"} good!</p>
        <p class="phase-modal-sub">Next up: ${task}</p>
        <button class="action primary" id="continueBtn" type="button">Continue → perform the reaction</button>
      </div>`;
    modal.querySelector("#continueBtn").addEventListener("click", continueToProducts);
    modal.querySelector("#continueBtn").focus();
  }
}

function continueToProducts() {
  const modal = root.querySelector("#phaseModal");
  if (modal) modal.innerHTML = "";
  phase = "product";
  lab.explicitizeHydrogens();   // every H becomes a real atom, bond lines showing
  lab.setAutoH(false);
  lab.setAdditionMode(true);    // bonds that must break, break
  lab.setVsepr(true);           // textbook geometry: satisfied atoms ease into 90/120/180
  lab.setLocked(false);
  resetTools();                 // fresh phase, fresh hands: order tool at –, ✕ off
  const label = root.querySelector("#buildLabel");
  if (label) label.textContent = "Step 2 · perform the reaction";
  const btn = root.querySelector("#checkBtn");
  if (btn && !checked) btn.disabled = false;
  nudge("Hydrogens are frozen into real atoms now — every move is yours.");
}

function next() {
  queue = correct ? queue.slice(1) : [...queue.slice(1), queue[0]];
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── build-quiz checking ──
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
  const mols = card.reactant.mols || [card.reactant.mol];
  const found = mols.filter((m) => {
    const els = [...new Set(m.atoms.map((a) => a.el))];
    return comps.some((g) => gradeIsomorphic(g.atoms, g.bonds, m, els).ok);
  }).length;
  if (mols.length > 1) {
    nudge(found === mols.length
      ? `✓ Both reactants built — now let them react.`
      : found > 0
      ? `✓ One reactant down — build the other beside it, or go straight for the product.`
      : `Neither reactant yet — the prompt names both; build them piece by piece.`);
    return;
  }
  nudge(found
    ? `✓ That's ${card.reactant.name}${comps.length > 1 ? " (spare pieces aside)" : ""} — now make it react with ${toSubHtml(card.reagent)}.`
    : `Not ${card.reactant.name} yet — check the atom count and where everything sits.`);
}

// The No-reaction button (Dalia's spec): a REAL answer, trained in the intro.
// Right on a tertiary-alcohol oxidation; wrong anywhere else.
function answerNoReaction() {
  if (checked || !lab) return;
  if (phase !== "product") return nudge("Build the reactant first — then decide whether anything happens to it.");
  correct = Boolean(card.noReaction);
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

function check() {
  if (checked || !lab || lab.atoms().length === 0 || phase !== "product") return;
  if (lab.openSlotCount() > 0) {
    return nudge("That blinking carbon still needs a partner — the opened double bond freed a seat, and something must bond there.");
  }
  const stripped = stripExplicitH(lab.atoms(), lab.bonds());
  const allowed = card.elements.filter((e) => e !== "H");
  // a no-reaction card: building any "product" is the wrong call
  if (card.noReaction) {
    correct = false;
    checked = true;
    lab.setLocked(true);
    missed.push(card);
    return updateAfterCheck();
  }
  // Carbon-free leftovers are SPENT REAGENT — chemically the byproduct (the water of a
  // dehydration, the HX of a substitution). They never count against the answer.
  const comps = splitComponents(stripped.atoms, stripped.bonds);
  const carbonComps = comps.filter((g) => g.atoms.some((a) => a.el === "C"));
  // saponification: TWO products, built side by side, matched one-to-one
  if (card.multiTargets) {
    const [tA, tB] = card.multiTargets;
    const m = (g, t) => gradeIsomorphic(g.atoms, g.bonds, t.mol, allowed).ok;
    const ok = carbonComps.length === 2 &&
      ((m(carbonComps[0], tA) && m(carbonComps[1], tB)) || (m(carbonComps[0], tB) && m(carbonComps[1], tA)));
    if (!ok && carbonComps.length === 1 && (m(carbonComps[0], tA) || m(carbonComps[0], tB))) {
      return nudge("That's ONE of the two products — this reaction gives two molecules; build the other beside it.");
    }
    correct = ok;
    checked = true;
    lab.setLocked(true);
    if (correct) {
      mastered += 1;
      if (hintsShown === 0) cleanSolves += 1;
    } else {
      missed.push(card);
    }
    return updateAfterCheck();
  }
  const matchOf = (g) => card.targets.find((t) => gradeIsomorphic(g.atoms, g.bonds, t.mol, allowed).ok);
  const hit = carbonComps.length === 1 ? matchOf(carbonComps[0]) : null;
  // the right molecule with spare CARBON pieces floating is housekeeping, not chemistry
  if (!hit && carbonComps.length > 1 && carbonComps.some(matchOf)) {
    return nudge("That IS the product — now clear the leftover carbon pieces (drop them on the tray) so only the product remains.");
  }
  // A minor product is real chemistry — but the card leaves the stack only for the
  // MAJOR (Dalia's rule): the popup explains, then the question comes back around.
  builtMinorFlag = Boolean(hit && card.targets.length > 1 && !hit.even && !hit.major);
  correct = Boolean(hit) && !builtMinorFlag;
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

const ADDITION_TYPES = ["hydrogenation", "halogenation", "hydrohalogenation", "hydration"];
const ELIMINATION_TYPES = ["dehydration", "dehydrohalogenation"];
const SUBSTITUTION_TYPES = ["subHalogenation", "subAlcohol", "hydrolysis"];
const CARBONYL_TYPES = ["oxidation", "esterification", "saponification"];

function introRows(types) {
  return types.map((t) => {
    const i = REACTION_INFO[t];
    return `<tr><td><strong>${i.label}</strong></td><td>${i.adds}</td><td>${i.result}</td></tr>`;
  }).join("");
}

function topicTabs() {
  return `<div class="level-tabs" role="tablist">${TOPICS.map((t, i) =>
    `<button class="level-tab${i === topicIndex ? " is-active" : ""}" data-i="${i}" type="button" role="tab" aria-selected="${i === topicIndex}">${t.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { topicIndex = Number(b.dataset.i); mode = "intro"; render(); }));
}

function rxnTable(types, midHeader) {
  return `<table class="rxn-table">
      <thead><tr><th>Reaction</th><th>${midHeader}</th><th>giving…</th></tr></thead>
      <tbody>${introRows(types)}</tbody>
    </table>`;
}

const TWO_PHASE_NOTE = `<li>Every question runs in <strong>two steps</strong>: first <em>build the reactants</em> — the game notices when they're right — then <em>perform the reaction</em>. In step 2 the hydrogens freeze into real atoms and every move is yours; bonds that must break, break by themselves.</li>`;

// One compact study sheet per topic — only the rules THIS quiz needs.
const SHEETS = {
  build: () => `
    <p class="intro-eyebrow">Reactions · topic 1 of 5 · addition</p>
    <p class="intro-lede"><strong>Addition</strong>: the C=C double bond opens, and each of its two carbons picks up one new piece.</p>
    ${rxnTable(ADDITION_TYPES, "adds…")}
    <ul class="pt-points">
      <li>The carbon skeleton <strong>never changes</strong> — addition only spends the double bond.</li>
      ${TWO_PHASE_NOTE}
      <li>Try dragging the intact reagent — the whole H–Br — onto the double bond: it <strong>splits across it</strong>, one piece bonding, the other floating free for the blinking carbon.</li>
    </ul>
    <div class="mk-teach">
      <h3>Markovnikov's rule — addition's major</h3>
      <p>When H–Br or H–OH adds to an <strong>unsymmetric</strong> alkene, two products are possible — and they are not equally likely.</p>
      <p class="mk-worked">${toSubHtml("CH2=CHCH3")} + ${toSubHtml("HBr")}: &nbsp;C-1 of the double bond holds <strong>two</strong> H's, C-2 holds <strong>one</strong>. The new H joins the carbon that already has more — <em>the rich get richer</em> — so the Br takes C-2: <strong>2-bromopropane</strong> is the <strong>major</strong>. 1-bromopropane still forms, as the minor — but only the <strong>major</strong> retires the question here.</p>
    </div>
    <div class="controls two-up"><button class="action primary alt" id="startTopic">Start: addition</button></div>`,

  elim: () => `
    <p class="intro-eyebrow">Reactions · topic 2 of 5 · elimination</p>
    <p class="intro-lede"><strong>Elimination</strong> is addition run backwards: two neighbor carbons each lose a piece, and the freed valences close into a C=C.</p>
    ${rxnTable(ELIMINATION_TYPES, "the molecule…")}
    <ul class="pt-points">
      ${TWO_PHASE_NOTE}
      <li>In step 2 you perform it by hand: drag the leaving group (OH or X) to the tray, take <strong>one H off a neighbor carbon</strong>, then click that C–C bond double. The bond will refuse to close until both seats are free — valence keeps you honest.</li>
    </ul>
    <div class="mk-teach">
      <h3>Zaitsev's rule — elimination's major</h3>
      <p>When the double bond could form on <strong>either side</strong> of the leaving group, the <strong>more substituted</strong> alkene — the internal one — is the major. Butan-2-ol dehydrates mostly to <strong>but-2-ene</strong>, only a little to but-1-ene. Which H you remove <em>is</em> the choice — and only the major retires the question.</p>
    </div>
    <div class="controls two-up"><button class="action primary alt" id="startTopic">Start: elimination</button></div>`,

  sub: () => `
    <p class="intro-eyebrow">Reactions · topic 3 of 5 · substitution</p>
    <p class="intro-lede"><strong>Substitution</strong> swaps one passenger for another on the same carbon — no bond orders change at all.</p>
    ${rxnTable(SUBSTITUTION_TYPES, "the molecule…")}
    <ul class="pt-points">
      ${TWO_PHASE_NOTE}
      <li>The exam's favorite trap: <strong>KOH concentrated + heat eliminates</strong> (→ alkene), <strong>KOH aqueous substitutes</strong> (→ alcohol). Same reagent — the <em>conditions</em> are part of the answer.</li>
    </ul>
    <div class="controls two-up"><button class="action primary alt" id="startTopic">Start: substitution</button></div>`,

  carb: () => `
    <p class="intro-eyebrow">Reactions · topic 4 of 5 · carbonyl chemistry</p>
    <p class="intro-lede">Alcohols oxidize, acids and alcohols condense into esters, and esters split back apart.</p>
    ${rxnTable(CARBONYL_TYPES, "the molecule…")}
    <div class="mk-teach">
      <h3>Oxidation &amp; the 1° / 2° / 3° ladder — including "no reaction"</h3>
      <p>Before oxidizing an alcohol, classify it: <strong>count the carbons attached to the OH-carbon</strong>.</p>
      <p class="mk-worked"><strong>1 → primary</strong> → aldehyde, and with excess oxidant under reflux, the <strong>acid</strong>. &nbsp;·&nbsp; <strong>2 → secondary</strong> → a <strong>ketone</strong>, full stop. &nbsp;·&nbsp; <strong>3 → tertiary</strong> → <strong>NO REACTION</strong>: oxidation must pull an H off the OH-carbon itself, and a tertiary carbon has none.</p>
      <p>That last case is a real exam answer, so it's a real button here: when nothing happens, press <strong>No reaction</strong>. Pressing it when a reaction <em>does</em> exist counts as wrong — deciding <em>whether</em> is part of the skill.</p>
    </div>
    <ul class="pt-points">
      ${TWO_PHASE_NOTE}
      <li>Saponification gives <strong>two</strong> products — build both, side by side.</li>
    </ul>
    <div class="controls two-up"><button class="action primary alt" id="startTopic">Start: carbonyls</button></div>`,

  mk: () => `
    <p class="intro-eyebrow">Reactions · topic 5 of 5 · the major-product quiz</p>
    <p class="intro-lede">Every reaction that can give two products has a favorite. This quiz is pure judgment: the reaction and both products are shown — <strong>pick the major</strong>.</p>
    <div class="mk-teach">
      <h3>The two rules, side by side</h3>
      <p><strong>Markovnikov (addition):</strong> count the H's on the two double-bond carbons — the new H joins the richer one, the X or OH takes the poorer one.</p>
      <p><strong>Zaitsev (elimination):</strong> when the double bond could form on either side of the leaving group, the more substituted — internal — alkene wins.</p>
      <p>Both rules are the same instinct: <em>count the neighbors.</em></p>
    </div>
    <div class="controls two-up"><button class="action primary" id="startTopic">Start the quiz</button></div>`
};

function renderIntro() {
  root.innerHTML = `${topicTabs()}<div class="intro">${SHEETS[topic().id]()}</div>`;
  wireTabs();
  root.querySelector("#startTopic").addEventListener("click", () => startRound(topic().id));
}

function renderPlay() {
  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How addition reactions work</button>
    <div class="formula-card">
      <span class="card-tag">Organic · Reactions · ${REACTION_INFO[card.type].label.toLowerCase()}</span>
      <p class="rxn-prompt">${toSubHtml(card.reactant.condensed)} <span class="rxn-plus">+</span> ${reagentHtml(card)} <span class="rxn-arrow">→</span> <span class="rxn-q">?</span></p>
    </div>

    <p class="build-label" id="buildLabel">Step 1 · build the reactant${card.phase1Mols.length > 1 ? "s" : ""} — the game will notice</p>
    <div class="lab-wrap">
      <canvas class="lab-canvas" id="labCanvas"></canvas>
      <div class="bond-tools">
        <button class="tool tool-break" id="toolBreak" type="button" title="Break a bond — one cut, then it switches itself off">✕</button>
        <button class="tool active" id="toolOrder" type="button" title="Change a bond — click a bond to cycle single → double → triple">≡</button>
      </div>
      <div id="phaseModal"></div>
    </div>
    <div id="nudgeArea"></div>
    <div id="hintArea"></div>
    <div id="verdictArea"></div>
    <div class="controls">
      <p class="score" id="scoreLine"></p>
      <span class="btn-row">
        <button class="action ghost" id="resetBtn" type="button" title="Wipe the canvas and restart this question at step 1">↺ Restart question</button>
        ${quiz === "carb" ? `<button class="action ghost no-rxn" id="noRxnBtn" type="button">No reaction</button>` : ""}
        <button class="action primary" id="checkBtn" disabled>Check</button>
      </span>
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelector("#checkBtn").addEventListener("click", check);
  root.querySelector("#resetBtn").addEventListener("click", resetQuestion);
  const noRxnBtn = root.querySelector("#noRxnBtn");
  if (noRxnBtn) noRxnBtn.addEventListener("click", answerNoReaction);
  root.querySelector("#toolBreak").addEventListener("click", () => {
    breakArmed = !breakArmed;
    syncTools();
  });
  root.querySelector("#toolOrder").addEventListener("click", () => {
    // plain mode toggle: switch back from ✕ to the bond tool
    breakArmed = false;
    syncTools();
  });
  updateHints();
  updateScore();

  lab = createLab(root.querySelector("#labCanvas"), {
    elements: card.elements,
    atomScale: 0.72,       // smaller atoms on the reactions bench — room to aim
    additionMode: false,   // phase 1 is the familiar nomenclature engine; phase 2 flips it on
    onChange() {
      if (!checked && phase === "reactants" && reactantsBuilt()) onReactantsRecognized();
      const btn = root.querySelector("#checkBtn");
      if (btn && !checked) btn.disabled = phase !== "product" || lab.atoms().length === 0;
    },
    onBondTool(type) {
      // ✕ is single-use: one cut, then back to the order tool — no forgotten
      // scissors shredding the molecule
      if (type === "break") { breakArmed = false; syncTools(); }
    }
  });
  syncTools();
}

// ── bond tools: two modes, one meaning each ──
// drag moves matter; a bond click applies the lit mode. ✕ breaks (one shot);
// the bond mode [≡] cycles a clicked bond single → double → triple (skipping
// what the atoms can't afford, never through none — that's ✕'s job).
let breakArmed = false;

function syncTools() {
  const bBtn = root.querySelector("#toolBreak");
  const oBtn = root.querySelector("#toolOrder");
  if (!bBtn || !oBtn || !lab) return;
  bBtn.classList.toggle("armed", breakArmed);
  oBtn.classList.toggle("active", !breakArmed);
  lab.setBondTool(breakArmed ? { type: "break" } : { type: "cycle" });
}

function resetTools() {
  breakArmed = false;
  syncTools();
}

function resetQuestion() {
  if (checked || !lab) return;
  lab.reset();
  lab.setAutoH(true);
  lab.setAdditionMode(false);
  lab.setVsepr(false);
  lab.setLocked(false);
  resetTools();
  phase = "reactants";
  const modal = root.querySelector("#phaseModal");
  if (modal) modal.innerHTML = "";
  const label = root.querySelector("#buildLabel");
  if (label) label.textContent = `Step 1 · build the reactant${card.phase1Mols.length > 1 ? "s" : ""} — the game will notice`;
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

// The regiochemistry read-me: gates the verdict — no Next button until "Got it".
function regioModal(title, subHtml) {
  const modal = root.querySelector("#phaseModal");
  if (!modal) return;
  modal.innerHTML = `<div class="phase-modal minor-modal">
      <p class="phase-modal-title">${title}</p>
      <p class="phase-modal-sub">${subHtml}</p>
      <button class="action primary" id="minorOkBtn" type="button">Got it →</button>
    </div>`;
  modal.querySelector("#minorOkBtn").addEventListener("click", () => {
    minorAcknowledged = true;
    modal.innerHTML = "";
    updateAfterCheck();
  });
  modal.querySelector("#minorOkBtn").focus();
}

function updateAfterCheck() {
  root.querySelector("#hintArea").innerHTML = "";
  root.querySelector("#nudgeArea").innerHTML = "";
  // no-reaction and two-product cards carry their own reveals
  if (card.noReaction) {
    const feedback = correct
      ? `<p class="feedback ok">${hintsShown ? "Right — no reaction." : "Right — no reaction, called clean. 💪"}</p><p class="regio-note">${card.whyNo}</p>`
      : `<p class="feedback no">Not quite — nothing happens here. ${card.whyNo}</p>`;
    root.querySelector("#verdictArea").innerHTML =
      `<p class="reveal">${toSubHtml(card.reactant.condensed)} + ${reagentHtml(card)} → <strong>no reaction</strong></p>${feedback}`;
    return finishControls();
  }
  if (card.multiTargets) {
    const [a, b] = card.multiTargets;
    const feedback = correct
      ? `<p class="feedback ok">${hintsShown ? "Correct — both products." : "Both products, solved clean. 💪"} It leaves the stack.</p>${a.note ? `<p class="regio-note">The acid actually leaves ${a.note}.</p>` : ""}`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
    root.querySelector("#verdictArea").innerHTML =
      `<p class="reveal">${toSubHtml(card.reactant.condensed)} + ${reagentHtml(card)} → <strong>${a.name}</strong> + <strong>${b.name}</strong> &nbsp;·&nbsp; ${toSubHtml(a.condensed)} + ${toSubHtml(b.condensed)}</p>${feedback}`;
    return finishControls();
  }
  const major = card.targets[0];
  const isElim = Boolean(REACTION_INFO[card.type].elimination);
  const evenSplit = Boolean(major.even);
  // A minor product must be READ about, not scrolled past (Dalia: "I built a minor
  // product and didn't even notice") — and it RETURNS to the stack: only the major
  // retires the card. The popup gates the verdict; no Next button until dismissed.
  if (builtMinorFlag && !minorAcknowledged) {
    return regioModal(
      "You built the MINOR product",
      `<strong>${solvedName}</strong> is real chemistry — but the <strong>major</strong> product is <strong>${major.name}</strong>: ${isElim
        ? "Zaitsev — the more substituted (internal) alkene wins."
        : `Markovnikov — the ${card.type === "hydration" ? "OH" : "halogen"} goes to the double-bond carbon with FEWER hydrogens.`} This question returns to the stack — build the major when it comes back.`
    );
  }
  // a TRUE tie is its own lesson: Markovnikov can't choose between two equal carbons
  if (correct && evenSplit && !minorAcknowledged) {
    const other = card.targets.find((t) => t.name !== solvedName);
    return regioModal(
      "No major here — a true tie",
      `Both double-bond carbons hold <strong>one hydrogen each</strong>, so Markovnikov has nothing to choose between: <strong>${solvedName}</strong> and <strong>${other ? other.name : "its partner"}</strong> both form in comparable amounts. Either answer is fully correct.`
    );
  }
  const feedback = correct
    ? `<p class="feedback ok">${hintsShown ? "Correct." : "Solved clean — no hints. 💪"} It leaves the stack.</p>`
    : builtMinorFlag
    ? `<p class="feedback no">The minor — explained above — comes back around. Next time: the major.</p>`
    : `<p class="feedback no">Not quite — this one comes back around.</p>`;
  const tag = card.targets.length > 1 ? ` <span class="minor-note">${evenSplit ? "(either forms)" : "(major)"}</span>` : "";
  const by = card.byproduct ? ` + ${toSubHtml(card.byproduct)}` : "";
  const reveal = `<p class="reveal">${toSubHtml(card.reactant.condensed)} + ${reagentHtml(card)} → <strong>${major.name}</strong>${by} &nbsp;·&nbsp; ${toSubHtml(major.condensed)}${tag}</p>`;
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

function finishControls() {
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

  // Progression (Dalia's ladder): the primary action moves to the NEXT topic's sheet;
  // replaying this topic is the ghost. Tabs stay free-roaming above.
  const isLast = topicIndex === TOPICS.length - 1;
  root.innerHTML = `
    ${topicTabs()}
    <p class="prompt">Round done — ${roundTotal} ${quiz === "mk" ? "Markovnikov calls" : "reactions"}, ${cleanSolves} solved ${quiz === "mk" ? "first try" : "hint-free"}.</p>
    ${missedBlock}
    <p class="done-next">${{
      mk: "Markovnikov for addition, Zaitsev for elimination — both are just 'count the neighbors'.",
      elim: "Every round deals three dehydrations and two dehydrohalogenations — Zaitsev decides the major.",
      sub: "Swaps only: H for X under UV, OH for X with HX, X for OH with aqueous KOH.",
      carb: "Classify before you oxidize: 1° → aldehyde → acid, 2° → ketone, 3° → no reaction at all.",
      build: "Every round covers all four additions: H2, X2, HX, and water."
    }[quiz]}</p>
    <div class="controls two-up">
      <button class="action ghost" id="againBtn">Again: ${topic().label}</button>
      ${isLast
        ? `<button class="action primary" id="nextTopicBtn">Back to the top: ${TOPICS[0].label} →</button>`
        : `<button class="action primary" id="nextTopicBtn">Next topic: ${TOPICS[topicIndex + 1].label} →</button>`}
    </div>`;
  wireTabs();
  root.querySelector("#againBtn").addEventListener("click", () => startRound(topic().id));
  root.querySelector("#nextTopicBtn").addEventListener("click", () => {
    topicIndex = isLast ? 0 : topicIndex + 1;
    mode = "intro";
    render();
  });
}

render();

// Debug handle for headless verification — not part of the game surface.
window.__rxn = {
  get lab() { return lab; }, get card() { return card; }, get options() { return options; },
  get mode() { return mode; },
  pick(i) { picked = i; renderMk(); },
  check, checkMk, checkReactant, next
};
