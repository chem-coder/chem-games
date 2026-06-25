// Type I ionic Name Builder — DOM layer. Pure logic lives in builder.js; this wires it to the
// screen. Version-tag internal imports so one release bump busts the whole module graph in cache.
import { toSubHtml, formatCharge } from "../../js/chem.js?v=20260624-rev11";
import { LEVELS, makeDealer, gradeAnswer, requeue, DEFAULT_ROUND, FIXED_CHARGES, VARIABLE_STATES } from "./builder.js?v=20260624-rev11";
import { renderMetalsTable } from "./periodic-table.js?v=20260624-rev11";

const root = document.querySelector("#game");

// One dealer per level, kept for the session so rounds keep cycling through all ions/cations before
// any repeat (rather than re-sampling the full compound set each round).
const dealer = Object.fromEntries(LEVELS.map((l) => [l.id, makeDealer(l)]));

// ── periodic-table memory aids for the intros ──
const TYPE1_PALETTE = {
  c1: { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent-dark)" }, // 1+
  c2: { fill: "var(--plum-soft)", stroke: "var(--plum)", text: "var(--plum-dark)" },       // 2+
  c3: { fill: "var(--warning-soft)", stroke: "var(--warning-line)", text: "#7a5e15" }      // 3+
};
const TYPE2_PALETTE = { v: { fill: "var(--warning-soft)", stroke: "var(--warning-line)", text: "#7a5e15" } };

// Type I: color each metal by its charge (so a whole column shares a color — the memory hook).
function type1Table() {
  const highlight = {}, labels = {};
  for (const [sym, q] of Object.entries(FIXED_CHARGES)) {
    highlight[sym] = q === 1 ? "c1" : q === 2 ? "c2" : "c3";
    labels[sym] = formatCharge(q);
  }
  return renderMetalsTable(highlight, TYPE1_PALETTE, labels);
}

// Type II: highlight the variable metals, label each with its possible oxidation states.
function type2Table() {
  const highlight = {}, labels = {};
  for (const [sym, states] of Object.entries(VARIABLE_STATES)) {
    highlight[sym] = "v";
    labels[sym] = states; // array → laid out as signed charges in a shape
  }
  return renderMetalsTable(highlight, TYPE2_PALETTE, labels);
}

let levelIndex = 0; // 0 = Type I, 1 = Type II
const level = () => LEVELS[levelIndex];

let mode = "intro"; // "intro" | "play" | "done"
let queue = []; // specs, front = current
let roundTotal = 0;
let problem = null;
let typed = "";
let hintsShown = 0; // hints revealed for the current card
let checked = false;
let graded = null;
let masteredThisRound = 0;
let cleanSolves = 0; // got it right with zero hints
let direction = "name"; // "name" = formula→name · "formula" = name→formula (the reverse pivot)
let nudge = null; // reverse near-miss message (caps or stray charge), shown without burning the card
// Formatting near-miss messages (the chemistry is right; teach the format, let them retry).
const NUDGE_MSG = {
  caps: `Almost — check your capitalization. Symbols are case-sensitive (<strong>Cl</strong>, not CL; <strong>Co</strong>, not CO).`,
  charge: `Almost — a compound is <strong>neutral</strong>. The ion charges cancel out, so the formula has no <strong>+</strong> or <strong>−</strong>.`,
  fspace: `Almost — a formula has <strong>no spaces</strong>. Write it solid, like <strong>NaCl</strong>.`,
  fsymbol: `Almost — drop the extra characters. A formula is just symbols and subscripts.`,
  nspace: `So close — mind the spacing: <strong>no space</strong> before the Roman numeral, and <strong>one space</strong> between the metal and the anion, like <strong>iron(II) sulfide</strong>.`,
  nsymbol: `So close — drop the extra characters from the name.`
};

// The "how to find the charge" explainer auto-opens the first time the student lands on the
// Type II tab, then stays collapsed (their choice to reopen). A blocked store just means it
// opens every time — harmless.
const CHARGE_CARD_KEY = "chem-games:builder:charge-card-seen";
function chargeCardSeen() {
  try { return localStorage.getItem(CHARGE_CARD_KEY) === "1"; } catch { return false; }
}
function markChargeCardSeen() {
  try { localStorage.setItem(CHARGE_CARD_KEY, "1"); } catch { /* ignore */ }
}
let missedThisRound = [];

function startRound(dir = "name") {
  direction = dir;
  queue = dealer[level().id](DEFAULT_ROUND);
  roundTotal = queue.length;
  masteredThisRound = 0;
  cleanSolves = 0;
  missedThisRound = [];
  mode = "play";
  loadCard();
}

function loadCard() {
  problem = level().build(queue[0], direction);
  typed = "";
  hintsShown = 0;
  checked = false;
  graded = null;
  nudge = null;
  render();
}

function check() {
  if (checked || !typed.trim()) return;
  const g = gradeAnswer(problem, typed);
  // Formatting near-miss: chemistry's right but the format is off → nudge and let them retry without
  // burning the card or counting it as missed. Keeps prompting until they fix it.
  if (!g.correct && g.nudge) { nudge = NUDGE_MSG[g.nudge]; render(); return; }
  nudge = null;
  graded = g;
  checked = true;
  if (graded.correct) {
    masteredThisRound += 1;
    if (hintsShown === 0) cleanSolves += 1;
  } else {
    missedThisRound.push(problem.spec);
  }
  render();
}

function showHint() {
  if (hintsShown < problem.hints.length) hintsShown += 1;
  render();
}

function next() {
  queue = requeue(queue, graded.correct);
  if (queue.length === 0) { mode = "done"; render(); }
  else loadCard();
}

// ── rendering ──
function render() {
  if (mode === "intro") return renderIntro();
  if (mode === "done") return renderDone();
  renderPlay();
}

function levelTabs() {
  return `<div class="level-tabs" role="tablist">${LEVELS.map((l, i) =>
    `<button class="level-tab${i === levelIndex ? " is-active" : ""}" data-level="${i}" type="button" role="tab" aria-selected="${i === levelIndex}">${l.label}</button>`
  ).join("")}</div>`;
}

// Two ways to drill each level: name from formula (easier, first) or formula from name (harder).
// `activeDir` gets the filled/primary style — on intros that's "name" (the recommended start); on
// the done screen it's the direction just played, so the highlight reflects what you did.
function startControls(activeDir = "name") {
  const cls = (d) => `action${d === activeDir ? " primary" : ""}`;
  return `<div class="controls two-up">
    <button class="${cls("name")}" id="startName">Name the compound</button>
    <button class="${cls("formula")}" id="startFormula">Write the formula</button>
  </div>`;
}

// The visual concept, recreated as our own component from the course slide: a name is two blocks.
// Type I: [metal · cation name] + [nonmetal + -ide]. Type II adds a Roman-numeral charge to the metal.
function introTypeI() {
  return `<div class="intro">
    <p class="intro-eyebrow">Binary ionic · Type I metal (invariant charge)</p>
    <p class="intro-lede">A <strong>binary</strong> compound holds just two different elements. Its name is two blocks:</p>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">metal</span>
        <span class="block-sub">cation name</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main">nonmetal<span class="suffix"> + <em>ide</em></span></span>
        <span class="block-sub"><em>anion name root</em></span>
      </div>
    </div>
    <p class="schema-note">No need to specify the metal's charge — these metals have just one.</p>
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("NaCl")}</span><span class="arrow">→</span><span class="w-cation">sodium</span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("KF")}</span><span class="arrow">→</span><span class="w-cation">potassium</span> <span class="w-anion">fluor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("MgBr2")}</span><span class="arrow">→</span><span class="w-cation">magnesium</span> <span class="w-anion">brom<span class="ide">ide</span></span></div>
    </div>
    <div class="pt-block">
      <p class="pt-heading">The fixed-charge metals — memorize these</p>
      ${type1Table()}
      <div class="pt-legend">
        <span class="leg"><i class="sw c1"></i>1+ · group 1 + silver</span>
        <span class="leg"><i class="sw c2"></i>2+ · group 2 + zinc</span>
        <span class="leg"><i class="sw c3"></i>3+ · aluminum</span>
      </div>
      <ul class="pt-points">
        <li><strong>group 1</strong> → always 1+</li>
        <li><strong>group 2</strong> → always 2+</li>
        <li><strong>aluminum</strong> → 3+</li>
        <li>just know these two: <strong>zinc</strong> is 2+, <strong>silver</strong> is 1+ (not given by the group)</li>
      </ul>
    </div>
    ${startControls()}
  </div>`;
}

// Teaching card: how to deduce a variable metal's charge from a formula. Two routes —
// criss-cross (graphical) and charge-balance (the reliable one) — plus the reduced-formula
// trap that makes balancing the trustworthy method. variant "full" lives on the Type II tab;
// "mini" is a short recap on the Polyatomic tab that points back here.
function chargeCard({ variant = "full", open = false } = {}) {
  const openAttr = open ? " open" : "";
  if (variant === "mini") {
    return `<details class="charge-card cc-mini"${openAttr}>
      <summary class="cc-summary"><span class="cc-chevron" aria-hidden="true"></span><span>Reminder — how to find the metal's charge</span></summary>
      <div class="cc-body">
        <p class="cc-mini-lede">Polyatomic ion = known charge. Balance to zero → read off the metal.</p>
        <p class="cc-mini-ex">${toSubHtml("Fe2(SO4)3")}: three SO<sub>4</sub><sup class="cc-q cc-plum">2−</sup> → <strong>−6</strong>; two Fe share <strong>+6</strong> → each <strong class="cc-teal">+3</strong> → iron(III)</p>
        <p class="cc-mini-foot">Full walkthrough on the <strong>Type&nbsp;II</strong> tab.</p>
      </div>
    </details>`;
  }
  return `<details class="charge-card"${openAttr}>
    <summary class="cc-summary"><span class="cc-chevron" aria-hidden="true"></span><span>How do you find the metal's charge?</span></summary>
    <div class="cc-body">
      <p class="cc-lede">One method always works — one shortcut often does.</p>
      <p class="cc-lede cc-lede-q"><span class="cc-f">${toSubHtml("FeCl3")}</span> — what's iron's charge?</p>
      <div class="cc-methods">
        <div class="cc-method">
          <p class="cc-method-h"><span class="cc-mtag">A</span> Balance the charges</p>
          <p class="cc-method-tag">always works</p>
          <p class="cc-balance">total <span class="q-pos">+</span> = total <span class="q-neg">−</span></p>
          <p class="cc-anchor-lead">Start from a known charge</p>
          <div class="cc-chips">
            <span class="cc-chip">H<sup class="cc-q">+</sup></span>
            <span class="cc-chip">O<sup class="cc-q">2−</sup></span>
            <span class="cc-chip">S<sup class="cc-q">2−</sup></span>
            <span class="cc-chip">N<sup class="cc-q">3−</sup></span>
            <span class="cc-chip">P<sup class="cc-q">3−</sup></span>
            <span class="cc-chip">F<sup class="cc-q">−</sup></span>
            <span class="cc-chip">Cl<sup class="cc-q">−</sup></span>
            <span class="cc-chip">Br<sup class="cc-q">−</sup></span>
            <span class="cc-chip">I<sup class="cc-q">−</sup></span>
            <span class="cc-chip">group 1 metals<sup class="cc-q">+</sup></span>
            <span class="cc-chip">group 2 metals<sup class="cc-q">2+</sup></span>
          </div>
          <ol class="steps cc-steps">
            <li><span class="step-num">1</span><span class="step-text">Cl<sup class="cc-q">−</sup> known → 3 × (−1) = <strong>−3</strong></span></li>
            <li><span class="step-num">2</span><span class="step-text">Fe must cancel it → <strong>+3</strong></span></li>
            <li><span class="step-num">3</span><span class="step-text">One Fe → <strong>+3</strong> → iron(III)</span></li>
          </ol>
          <p class="cc-eg2"><span class="cc-eg2-h">${toSubHtml("Fe2O3")}</span><span>3 × O<sup class="cc-q">2−</sup> = <strong>−6</strong> charge</span><span>2 × Fe → must be <strong>Fe<sup class="cc-q">3+</sup></strong> each</span></p>
        </div>
        <div class="cc-method">
          <p class="cc-method-h"><span class="cc-mtag">B</span> Criss-cross</p>
          <p class="cc-method-tag">often works</p>
          <div class="cc-cross">
            <div class="cc-row">
              <span class="cc-ion"><span class="cc-sym">Fe</span><sup class="cc-q cc-teal">3+</sup></span>
              <span class="cc-ion"><span class="cc-sym">Cl</span><sup class="cc-q cc-plum">1−</sup></span>
            </div>
            <div class="cc-band"><span class="cc-diag d1"></span><span class="cc-diag d2"></span></div>
            <div class="cc-row">
              <span class="cc-res"><span class="cc-sym">Fe</span><sub class="cc-plum">1</sub></span>
              <span class="cc-res"><span class="cc-sym">Cl</span><sub class="cc-teal">3</sub></span>
            </div>
            <p class="cc-cross-out">→ ${toSubHtml("FeCl3")} <span class="cc-aside">(drop the&nbsp;1)</span></p>
          </div>
          <p class="cc-method-foot">Charges often land as the opposite subscripts — but not always (see below)</p>
          <p class="cc-confirm">Confirm with the math!</p>
        </div>
      </div>
      <div class="cc-trap">
        <p class="cc-trap-line"><strong>Why you can't trust criss-cross alone:</strong> run backwards, it can lie.</p>
        <p class="cc-trap-line"><span class="cc-f">${toSubHtml("PbO2")}</span>: shortcut says lead is Pb<sup class="cc-q">2+</sup> — but really it is Pb<sup class="cc-q">4+</sup>.</p>
        <p class="cc-trap-line">Pb<sup class="cc-q">4+</sup> bonds with O<sup class="cc-q">2−</sup>. That's ${toSubHtml("Pb2O4")}! But reduce to the smallest common multiple: ${toSubHtml("Pb2O4")} becomes ${toSubHtml("PbO2")} <span class="cc-aside">(exception: ${toSubHtml("H2O2")} is a real molecule — not reduced to HO)</span>.</p>
        <p class="cc-trap-line">So in ${toSubHtml("PbO2")} the subscripts were reduced from ${toSubHtml("Pb2O4")}, <strong>hiding the charges</strong> — but</p>
        <p class="cc-trap-line cc-trap-punch">Math never slips: <strong>2 × (−2) = −4 → +4</strong></p>
      </div>
    </div>
  </details>`;
}

function introTypeII() {
  return `<div class="intro">
    <p class="intro-eyebrow">Binary ionic · Type II metal (variable charge)</p>
    <p class="intro-lede">Same two blocks — but this metal can carry more than one charge, so you must <strong>say which</strong>, with a Roman numeral.</p>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">metal<span class="roman">(?)</span></span>
        <span class="block-sub">cation name + charge</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main">nonmetal<span class="suffix"> + <em>ide</em></span></span>
        <span class="block-sub"><em>anion name root</em></span>
      </div>
    </div>
    ${(() => { const first = !chargeCardSeen(); markChargeCardSeen(); return chargeCard({ variant: "full", open: first }); })()}
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("CuCl")}</span><span class="arrow">→</span><span class="w-cation">copper<span class="w-roman">(I)</span></span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("CuCl2")}</span><span class="arrow">→</span><span class="w-cation">copper<span class="w-roman">(II)</span></span> <span class="w-anion">chlor<span class="ide">ide</span></span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("Fe2O3")}</span><span class="arrow">→</span><span class="w-cation">iron<span class="w-roman">(III)</span></span> <span class="w-anion">ox<span class="ide">ide</span></span></div>
    </div>
    <div class="pt-block">
      <p class="pt-heading">The variable-charge metals</p>
      ${type2Table()}
      <ul class="pt-points prose">
        <li>Mostly transition metals — the charge <strong>varies</strong>.</li>
        <li>Don't memorize — work it out from the formula.</li>
      </ul>
    </div>
    ${startControls()}
  </div>`;
}

function introPoly() {
  return `<div class="intro">
    <p class="intro-eyebrow">Ionic · metal + polyatomic ion</p>
    <p class="ps-lead">Now the anion is a <strong>polyatomic ion</strong>.</p>
    <ol class="steps">
      <li><span class="step-num">1</span><span class="step-text">Is the metal <strong>Type I</strong> or <strong>Type II</strong>?</span></li>
      <li><span class="step-num">2</span><span class="step-text">Name the <strong>polyatomic</strong> — it keeps its own name.</span></li>
    </ol>
    <div class="schema">
      <div class="block cation">
        <span class="block-main">metal<span class="roman">(?)</span></span>
        <span class="block-sub">+ Roman numeral if Type II</span>
      </div>
      <span class="schema-plus">+</span>
      <div class="block anion">
        <span class="block-main">polyatomic</span>
        <span class="block-sub">its own name — not <em>-ide</em></span>
      </div>
    </div>
    <p class="schema-note">Type I metal → no numeral. Type II metal → balance the polyatomic's charge, then add a Roman numeral.</p>
    ${chargeCard({ variant: "mini", open: false })}
    <div class="ex-maps">
      <div class="ex-map"><span class="ex-f">${toSubHtml("Mg(NO3)2")}</span><span class="arrow">→</span><span class="w-cation">magnesium</span> <span class="w-anion">nitrate</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("Fe2(SO4)3")}</span><span class="arrow">→</span><span class="w-cation">iron<span class="w-roman">(III)</span></span> <span class="w-anion">sulfate</span></div>
      <div class="ex-map"><span class="ex-f">${toSubHtml("K3PO4")}</span><span class="arrow">→</span><span class="w-cation">potassium</span> <span class="w-anion">phosphate</span></div>
    </div>
    <p class="pt-points prose"><a class="intro-link" href="../" target="_blank">↗ Don't know the polyatomic ions cold yet? Open the Ion Trainer in another tab and power through the full deck first.</a></p>
    ${startControls()}
  </div>`;
}

// Acids: H⁺ + an anion, named off the anion's ending. The decision tree is the skill — three rules,
// columns vertically aligned so the ending → rule → example reads straight down.
function introAcid() {
  return `<div class="intro">
    <p class="intro-eyebrow">Acids · H⁺ + an anion</p>
    <p class="intro-lede">An <strong>acid</strong> is H⁺ joined to an anion. Name it from the anion's <strong>ending</strong>.</p>
    <div class="acid-tree">
      <span class="at-end">–ide</span><span class="at-arrow">→</span><span class="at-rule"><strong>hydro</strong>-root-<strong>ic</strong> acid</span><span class="at-ex">${toSubHtml("HCl")} → hydrochloric acid</span>
      <span class="at-end">–ate</span><span class="at-arrow">→</span><span class="at-rule">root-<strong>ic</strong> acid</span><span class="at-ex">${toSubHtml("HNO3")} → nitric acid</span>
      <span class="at-end">–ite</span><span class="at-arrow">→</span><span class="at-rule">root-<strong>ous</strong> acid</span><span class="at-ex">${toSubHtml("HNO2")} → nitrous acid</span>
    </div>
    <p class="acid-note"><strong>hypo-</strong> and <strong>per-</strong> ride along: hypochlorite → hypochlorous acid, perchlorate → perchloric acid.</p>
    <p class="acid-mnemonic">Remember: <strong>-ate → -ic</strong>, <strong>-ite → -ous</strong>.</p>
    ${startControls()}
  </div>`;
}

function renderIntro() {
  const body = level().id === "type1" ? introTypeI()
    : level().id === "type2" ? introTypeII()
    : level().id === "poly" ? introPoly()
    : introAcid();
  root.innerHTML = `${levelTabs()}${body}`;
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { levelIndex = Number(b.dataset.level); renderIntro(); })
  );
  root.querySelector("#startName").addEventListener("click", () => startRound("name"));
  root.querySelector("#startFormula").addEventListener("click", () => startRound("formula"));
}

function renderPlay() {
  const remaining = queue.length;

  // On a correct answer, show the canonical form (proper "metal(II)" spacing) rather than echoing
  // the student's keystrokes — the grader forgives spacing/case, but the display should model it.
  const isFormula = problem.mode === "formula";
  const promptHtml = isFormula ? problem.prompt : toSubHtml(problem.prompt);
  const answerDisplay = isFormula ? toSubHtml(problem.answer) : problem.answer;
  const typedDisplay = isFormula ? toSubHtml(typed || "—") : (typed || "—");
  const answer = checked
    ? `<div class="answer-built ${graded.correct ? "ok" : "no"}"><span>${graded.correct ? answerDisplay : typedDisplay}</span></div>`
    : `<input class="answer-input" id="answerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="${typed.replace(/"/g, "&quot;")}">`;

  // Progressive hints — reveal one per click, à la the equation balancer.
  const shown = problem.hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked
    ? ""
    : `<div class="hints">
        ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
        ${hintsShown < problem.hints.length
          ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? "Another hint" : "Need a hint?"}</button>`
          : ""}
      </div>`;

  let reveal = "";
  let feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">${hintsShown ? "Correct." : "Correct — no hints. 💪"} It leaves the stack.</p>`
      : `<p class="feedback no">Not quite — this one comes back around.</p>`;
    reveal = `<p class="reveal">${promptHtml} &nbsp;=&nbsp; <strong>${answerDisplay}</strong></p>`;
  }

  const nudgeHtml = (!checked && nudge) ? `<p class="cap-nudge">${nudge}</p>` : "";
  const verb = isFormula ? "Built" : "Named";
  root.innerHTML = `
    <button class="intro-link" id="introBtn" type="button">↩ How ${level().label} names work</button>
    <div class="formula-card">
      <span class="card-tag">Ionic · ${level().label}${isFormula ? " · name → formula" : ""}</span>
      <p class="formula${isFormula ? " as-name" : ""}">${promptHtml}</p>
    </div>

    <p class="build-label">${isFormula ? "Write the formula" : "Name this compound"}</p>
    <div class="answer-row">${answer}</div>
    ${nudgeHtml}
    ${hintBlock}

    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">${verb} ${masteredThisRound} of ${roundTotal} &middot; ${remaining} left</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? "Next →" : "Finish"}</button>`
        : `<button class="action primary" id="checkBtn" ${typed.trim() ? "" : "disabled"}>Check</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });

  const input = root.querySelector("#answerInput");
  if (input) {
    input.addEventListener("input", () => {
      typed = input.value;
      const btn = root.querySelector("#checkBtn");
      if (btn) btn.disabled = !typed.trim();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    input.focus();
  }
  const hintBtn = root.querySelector("#hintBtn");
  if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn");
  if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn");
  if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
}

function renderDone() {
  const did = direction === "formula" ? "built" : "named";
  const missedChips = missedThisRound
    .map((s) => `<span class="chip">${toSubHtml(level().build(s).formula)}</span>`)
    .join("");
  const missedBlock = missedThisRound.length
    ? `<div class="missed-block">
        <p class="missed-label">Worth another pass — you stumbled on ${missedThisRound.length}:</p>
        <div class="chips">${missedChips}</div>
      </div>`
    : `<p class="feedback ok">Clean run — ${cleanSolves} of ${roundTotal} ${did} with no hints. 🎉</p>`;

  root.innerHTML = `
    ${levelTabs()}
    <p class="prompt">Round done — ${roundTotal} compounds, ${cleanSolves} ${did} hint-free.</p>
    ${missedBlock}
    ${missedThisRound.length ? `<div class="controls"><button class="action ghost" id="reviewBtn">Redrill the ${missedThisRound.length} you missed →</button></div>` : ""}
    <p class="done-next">Go again below — or switch level above.</p>
    ${startControls(direction)}`;

  // switch level → that level's intro (pick a direction there)
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { levelIndex = Number(b.dataset.level); mode = "intro"; render(); })
  );
  const reviewBtn = root.querySelector("#reviewBtn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => {
    queue = missedThisRound.slice();
    roundTotal = queue.length;
    masteredThisRound = 0;
    cleanSolves = 0;
    missedThisRound = [];
    mode = "play";
    loadCard();
  });
  // a fresh 5 in this level, in whichever direction they pick
  root.querySelector("#startName").addEventListener("click", () => startRound("name"));
  root.querySelector("#startFormula").addEventListener("click", () => startRound("formula"));
}

render();
