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
  // a no-reaction card: building any "product" is the wrong call
  if (card.noReaction) {
    correct = false;
    checked = true;
    lab.setLocked(true);
    missed.push(card);
    return updateAfterCheck();
  }
  // saponification: TWO products, built side by side, matched one-to-one
  if (card.multiTargets) {
    const comps = splitComponents(stripped.atoms, stripped.bonds);
    const [tA, tB] = card.multiTargets;
    const m = (g, t) => gradeIsomorphic(g.atoms, g.bonds, t.mol, allowed).ok;
    const ok = comps.length === 2 && ((m(comps[0], tA) && m(comps[1], tB)) || (m(comps[0], tB) && m(comps[1], tA)));
    if (!ok && comps.length === 1 && (m(comps[0], tA) || m(comps[0], tB))) {
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

function renderIntro() {
  root.innerHTML = `<div class="intro">
    <p class="intro-eyebrow">Reactions · addition · elimination · substitution · carbonyls</p>
    <p class="intro-lede"><strong>Addition</strong>: the C=C double bond opens, and each of its two carbons picks up one new piece.</p>
    <table class="rxn-table">
      <thead><tr><th>Reaction</th><th>adds…</th><th>giving…</th></tr></thead>
      <tbody>${introRows(ADDITION_TYPES)}</tbody>
    </table>
    <p class="intro-lede"><strong>Elimination</strong> is addition run backwards: two neighbor carbons each lose a piece, and the freed valences close into a C=C.</p>
    <table class="rxn-table">
      <thead><tr><th>Reaction</th><th>the molecule…</th><th>giving…</th></tr></thead>
      <tbody>${introRows(ELIMINATION_TYPES)}</tbody>
    </table>
    <p class="intro-lede"><strong>Substitution</strong> swaps one passenger for another on the same carbon — no bond orders change at all.</p>
    <table class="rxn-table">
      <thead><tr><th>Reaction</th><th>the molecule…</th><th>giving…</th></tr></thead>
      <tbody>${introRows(SUBSTITUTION_TYPES)}</tbody>
    </table>
    <p class="intro-lede"><strong>Carbonyl chemistry</strong> — alcohols oxidize, acids and alcohols condense into esters, and esters split back apart.</p>
    <table class="rxn-table">
      <thead><tr><th>Reaction</th><th>the molecule…</th><th>giving…</th></tr></thead>
      <tbody>${introRows(CARBONYL_TYPES)}</tbody>
    </table>
    <ul class="pt-points">
      <li>In every family, the carbon skeleton <strong>never changes</strong>.</li>
      <li>The exam's favorite trap: <strong>KOH concentrated + heat eliminates</strong> (→ alkene), <strong>KOH aqueous substitutes</strong> (→ alcohol). Same reagent — the <em>conditions</em> are part of the answer.</li>
      <li>You build the <strong>product</strong>: many players build the reactant first, check it, then make it react — the <em>Check my reactant</em> button is there for exactly that. In elimination, removing the OH or X and closing the double bond IS the reaction.</li>
      <li>In addition, the reagent's own hydrogen arrives in the tray: <strong>place it</strong>. Where the H goes is half the chemistry.</li>
      <li>Or build the reagent <strong>whole</strong> — assemble H–Br and touch it to the double bond: it <strong>splits across it</strong>, one piece bonding, the other floating free for the blinking carbon.</li>
    </ul>

    <div class="mk-teach">
      <h3>Markovnikov's rule — addition's major</h3>
      <p>When H–Br or H–OH adds to an <strong>unsymmetric</strong> alkene, two products are possible — and they are not equally likely.</p>
      <p class="mk-worked">${toSubHtml("CH2=CHCH3")} + ${toSubHtml("HBr")}: &nbsp;C-1 of the double bond holds <strong>two</strong> H's, C-2 holds <strong>one</strong>. The new H joins the carbon that already has more — <em>the rich get richer</em> — so H goes to C-1 and the Br takes C-2: <strong>2-bromopropane</strong> is the <strong>major</strong> product. 1-bromopropane still forms, as the <strong>minor</strong>.</p>
      <p>Count the hydrogens on the two double-bond carbons; the H joins the richer one, the X or OH takes the poorer one. That's the whole rule.</p>
      <h3>Zaitsev's rule — elimination's major</h3>
      <p>When the double bond could form on <strong>either side</strong> of the leaving group, the <strong>more substituted</strong> alkene — the internal one, with more carbon neighbors on its C=C — is the major. Butan-2-ol dehydrates mostly to <strong>but-2-ene</strong>, only a little to but-1-ene.</p>
      <h3>Oxidation &amp; the 1° / 2° / 3° ladder — including "no reaction"</h3>
      <p>Before oxidizing an alcohol, classify it: <strong>count the carbons attached to the OH-carbon</strong>.</p>
      <p class="mk-worked"><strong>1 carbon → primary</strong> → [O] gives the <strong>aldehyde</strong> — and with excess oxidant under reflux, it runs on to the <strong>carboxylic acid</strong>. &nbsp;·&nbsp; <strong>2 → secondary</strong> → a <strong>ketone</strong>, full stop. &nbsp;·&nbsp; <strong>3 → tertiary</strong> → <strong>NO REACTION</strong>: oxidation must pull an H off the OH-carbon itself, and a tertiary carbon has none to give.</p>
      <p>That last case is a real exam answer, so it's a real button here: when nothing happens, press <strong>No reaction</strong>. Pressing it when a reaction <em>does</em> exist counts as wrong — deciding <em>whether</em> is part of the skill.</p>
    </div>

    <div class="controls two-up">
      <button class="action primary alt" id="startBuild">Build: addition</button>
      <button class="action primary alt" id="startElim">Build: elimination</button>
      <button class="action primary alt" id="startSub">Build: substitution</button>
      <button class="action primary alt" id="startCarb">Build: carbonyls</button>
      <button class="action primary" id="startMk">Major or minor? · quiz</button>
    </div>
  </div>`;
  root.querySelector("#startBuild").addEventListener("click", () => startRound("build"));
  root.querySelector("#startElim").addEventListener("click", () => startRound("elim"));
  root.querySelector("#startSub").addEventListener("click", () => startRound("sub"));
  root.querySelector("#startCarb").addEventListener("click", () => startRound("carb"));
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
        <button class="action ghost" id="resetBtn" type="button" title="Wipe the canvas and start this question fresh">↺ Clear</button>
        <button class="action ghost" id="reactantBtn" type="button">Check my reactant</button>
        ${quiz === "carb" ? `<button class="action ghost no-rxn" id="noRxnBtn" type="button">No reaction</button>` : ""}
        <button class="action primary" id="checkBtn" disabled>Check</button>
      </span>
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  root.querySelector("#checkBtn").addEventListener("click", check);
  root.querySelector("#reactantBtn").addEventListener("click", checkReactant);
  root.querySelector("#resetBtn").addEventListener("click", () => { if (!checked && lab) lab.reset(); });
  const noRxnBtn = root.querySelector("#noRxnBtn");
  if (noRxnBtn) noRxnBtn.addEventListener("click", answerNoReaction);
  updateHints();
  updateScore();

  lab = createLab(root.querySelector("#labCanvas"), {
    elements: card.elements,
    // arrivals attack the π bond only in ADDITION rounds — in elimination the student
    // sets the double bond deliberately, and an auto-break would sabotage the build
    additionMode: quiz === "build",
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
  const builtMinor = card.targets.length > 1 && !evenSplit && solvedName && solvedName !== major.name;
  const minorNote = builtMinor
    ? `<p class="regio-note">You built the <strong>minor</strong> product — real, accepted. The <strong>major</strong> is ${major.name}: ${isElim
        ? "Zaitsev prefers the more substituted (internal) alkene."
        : `Markovnikov puts the ${card.type === "hydration" ? "OH" : "halogen"} on the double-bond carbon with fewer H's.`}</p>`
    : "";
  const feedback = correct
    ? `<p class="feedback ok">${hintsShown ? "Correct." : "Solved clean — no hints. 💪"} It leaves the stack.</p>${minorNote}`
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

  root.innerHTML = `
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
      <button class="action primary alt" id="startBuild">Build: addition</button>
      <button class="action primary alt" id="startElim">Build: elimination</button>
      <button class="action primary alt" id="startSub">Build: substitution</button>
      <button class="action primary alt" id="startCarb">Build: carbonyls</button>
      <button class="action primary" id="startMk">Major or minor? · quiz</button>
    </div>`;
  root.querySelector("#startBuild").addEventListener("click", () => startRound("build"));
  root.querySelector("#startElim").addEventListener("click", () => startRound("elim"));
  root.querySelector("#startSub").addEventListener("click", () => startRound("sub"));
  root.querySelector("#startCarb").addEventListener("click", () => startRound("carb"));
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
