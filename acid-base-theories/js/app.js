import { THEORIES, ROLES, litTheories, asksTheory, gradeSpecies, isComplete, requeue, buildRound, recordResult, DEFAULT_ROUND } from "./engine.js?v=1";
import { REACTIONS } from "../data/reactions.js?v=1";

const KEY = "chem-games:acid-base-theories";
const loadStats = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saveStats = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* progress is a nicety */ } };
const resetStats = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

const ROLE_LABEL = { acid: "Acid", base: "Base", ca: "Conjugate acid", cb: "Conjugate base", neither: "Neither (salt, water or adduct)" };
const ROLE_TAG = { acid: "acid", base: "base", ca: "conj. acid", cb: "conj. base", neither: "neither" };
const THEORY_LABEL = { arrhenius: "Arrhenius", bronsted: "Brønsted-Lowry", lewis: "Lewis" };

const root = document.querySelector("#game");
const tabs = document.querySelector("#tabs");

let mode = "intro"; // intro | play | done
let queue = [];
let roundTotal = 0;
let speciesIndex = 0;
let results = []; // per species of the current reaction: { ok }
let sel = {};
let checked = false;
let graded = null;
let missedThisRound = new Set();
let masteredThisRound = new Set();
let stats = loadStats();

const reaction = () => REACTIONS.find((r) => r.id === queue[0]);
const species = () => reaction().species[speciesIndex];

function beginRound(ids) {
  queue = ids;
  roundTotal = ids.length;
  missedThisRound = new Set();
  masteredThisRound = new Set();
  resetReaction();
}
function resetReaction() { speciesIndex = 0; results = []; resetSpecies(); }
function resetSpecies() { sel = {}; checked = false; graded = null; render(); }

function startRound() { mode = "play"; beginRound(buildRound(REACTIONS, stats, DEFAULT_ROUND)); }
function showIntro() { mode = "intro"; render(); }

function pick(axis, value) {
  if (checked) return;
  sel[axis] = value;
  render();
}

function check() {
  if (checked || !isComplete(species(), sel)) return;
  graded = gradeSpecies(species(), sel);
  checked = true;
  results[speciesIndex] = { ok: graded.ok };
  render();
}

function next() {
  const r = reaction();
  if (speciesIndex < r.species.length - 1) { speciesIndex += 1; resetSpecies(); return; }
  const allOk = results.every((x) => x.ok);
  if (allOk) masteredThisRound.add(r.id); else missedThisRound.add(r.id);
  stats = recordResult(stats, r.id, allOk);
  saveStats(stats);
  queue = requeue(queue, allOk);
  if (queue.length === 0) { mode = "done"; render(); } else resetReaction();
}

// ── rendering ──
function renderTabs() {
  tabs.innerHTML = [
    ["intro", "How it works"],
    ["play", mode === "done" ? "Round done" : "Play"]
  ].map(([id, label]) => `<button class="deck-choice ${mode === id || (id === "play" && mode === "done") ? "is-active" : ""}" data-tab="${id}">${label}</button>`).join("");
  tabs.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.tab === "intro") showIntro();
    else if (mode === "intro") (queue.length ? (mode = "play", render()) : startRound());
  }));
}

function renderIntro() {
  const mastered = Object.values(stats).filter((x) => x.mastered).length;
  root.innerHTML = `
    <p class="why">In NH<sub>3</sub> + BF<sub>3</sub> no proton moves. Under which theory is ammonia a base, and which others does that imply?</p>
    <div class="concept">
      <h3>Three theories, three different questions</h3>
      <p><strong>Arrhenius</strong> is a property of the substance alone. Put it in water and watch H<sup>+</sup> or OH<sup>−</sup> rise.</p>
      <ul class="roles arr">
        <li><b>HCl</b><span>is an Arrhenius acid, whatever it reacts with later: in water it produces H<sup>+</sup>.</span></li>
        <li><b>NH<sub>4</sub><sup>+</sup></b><span>is not an Arrhenius acid. Arrhenius acids are compounds you can put in water, HA → H<sup>+</sup> + A<sup>−</sup>; an ion is not a compound. Ammonium comes into the water inside a salt such as NH<sub>4</sub>Cl, and the solution turns acidic because the ion hands a proton to water, which is Brønsted-Lowry.</span></li>
        <li><b>NaOH</b><span>is an Arrhenius base, whatever it reacts with later: in water it releases OH<sup>−</sup>.</span></li>
        <li><b>OH<sup>−</sup></b><span>by itself is not an Arrhenius base. Arrhenius bases are compounds you can put in water, MOH → M<sup>+</sup> + OH<sup>−</sup>; the hydroxide ion OH<sup>−</sup> by itself is not a compound. Hydroxide comes into the water inside a base such as NaOH, and the solution turns basic because the hydroxide ions attract free protons in the water, which is Brønsted-Lowry.</span></li>
      </ul>
      <p><strong>Brønsted-Lowry</strong> asks who gets the proton in <em>this reaction</em>. The acid gives up a proton, the base takes it, and the partner decides the role. Water is not an Arrhenius acid (it does not raise H<sup>+</sup> in water), but facing ammonia it gives up a proton, so in that reaction water is a Brønsted-Lowry acid. HCl(g) + NH<sub>3</sub>(g) → NH<sub>4</sub>Cl(s) has no water at all; Arrhenius has nothing to say, Brønsted-Lowry still names HCl the acid.</p>
      <p><strong>Lewis</strong> asks where the electron pair goes. The base donates it, the acid accepts it. No proton is needed, so BF<sub>3</sub> and Cu<sup>2+</sup> can be acids.</p>
    <div class="circles">
      <svg viewBox="0 0 380 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three nested definitions: Lewis contains Brønsted-Lowry, which contains Arrhenius">
        <ellipse cx="190" cy="140" rx="178" ry="122" style="fill:var(--plum-soft);stroke:var(--plum);stroke-width:1.5"/>
        <ellipse cx="190" cy="160" rx="122" ry="86" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5"/>
        <ellipse cx="190" cy="182" rx="70" ry="48" style="fill:var(--surface);stroke:var(--accent-dark);stroke-width:1.5"/>
        <text x="190" y="42" text-anchor="middle" style="fill:var(--plum-dark)">Lewis</text>
        <text x="190" y="60" text-anchor="middle" class="small">e<tspan baseline-shift="super" font-size="0.8em">−</tspan> pair acceptor / donor</text>
        <text x="190" y="100" text-anchor="middle">Brønsted-Lowry</text>
        <text x="190" y="118" text-anchor="middle" class="small">H<tspan baseline-shift="super" font-size="0.8em">+</tspan> donor / acceptor</text>
        <text x="190" y="178" text-anchor="middle">Arrhenius</text>
        <text x="190" y="197" text-anchor="middle" class="small">H<tspan baseline-shift="super" font-size="0.8em">+</tspan>, OH<tspan baseline-shift="super" font-size="0.8em">−</tspan> in water</text>
      </svg>
    </div>

      <p>Every Arrhenius acid is also a Brønsted-Lowry acid (the H<sup>+</sup> it produces is a proton it gave up) and every Brønsted-Lowry acid is also a Lewis acid (the proton accepts an electron pair). Not the other way round. So pick the <strong>narrowest</strong> theory that fits: click Arrhenius and all three light up, click Brønsted-Lowry and Lewis lights with it, click Lewis and it stands alone.</p>
    </div>
    <div class="concept">
      <h3>The roles</h3>
      <ul class="roles">
        <li><b>Acid</b><span>the reactant that gives up the proton (Brønsted-Lowry), or accepts the electron pair (Lewis). An Arrhenius acid is one that would raise H<sup>+</sup> on its own in water.</span></li>
        <li><b>Base</b><span>the reactant that takes the proton (Brønsted-Lowry), or donates the electron pair (Lewis). An Arrhenius base is one that would raise OH<sup>−</sup> on its own in water.</span></li>
        <li><b>Conjugate acid</b><span>the base plus one proton. A product.</span></li>
        <li><b>Conjugate base</b><span>the acid minus one proton. A product.</span></li>
        <li><b>Neither</b><span>a salt or water in a molecular equation, or the adduct of a Lewis reaction, where nothing was a conjugate of anything.</span></li>
      </ul>
    </div>
    ${mastered ? `<p class="progress-line">Saved progress: <strong>${mastered} of ${REACTIONS.length}</strong> reactions mastered so far. <button class="reset-link" id="resetBtn">reset</button></p>` : ""}
    <div class="controls"><button class="action primary" id="startBtn">Start: ${Math.min(DEFAULT_ROUND, REACTIONS.length)} reactions</button></div>`;
  root.querySelector("#startBtn").addEventListener("click", startRound);
  root.querySelector("#resetBtn")?.addEventListener("click", () => { resetStats(); stats = {}; render(); });
}

function equationHtml(r) {
  const parts = [];
  let seenArrow = false;
  r.species.forEach((s, i) => {
    const firstProduct = !seenArrow && (s.role === "ca" || s.role === "cb" || s.role === "neither");
    if (firstProduct) { parts.push(`<span class="op">${r.arrow}</span>`); seenArrow = true; }
    else if (i > 0) parts.push(`<span class="op">+</span>`);
    let cls = "sp";
    if (i === speciesIndex) cls += " is-current";
    else if (i < speciesIndex) cls += " is-done" + (results[i]?.ok ? "" : " was-wrong");
    else cls += " is-pending";
    const tag = i < speciesIndex || (i === speciesIndex && checked) ? `<span class="tag">${ROLE_TAG[s.role]}</span>` : "";
    parts.push(`<span class="${cls}">${s.f}${tag}</span>`);
  });
  return `<p class="equation">${parts.join("")}</p>`;
}

function optBtn(axis, value, label) {
  let cls = "opt";
  const picked = sel[axis] === value;
  const lit = axis === "theory" && !picked && litTheories(sel.theory).includes(value);
  if (checked) {
    const answer = axis === "role" ? species().role : species().theory;
    const answerLit = axis === "theory" && litTheories(answer).includes(value);
    if (value === answer) cls += " is-answer";
    else if (answerLit) cls += " is-answer is-lit";
    else if (picked) cls += " is-wrong";
  } else if (picked) cls += " is-picked";
  else if (lit) cls += " is-lit";
  return `<button class="${cls}" data-axis="${axis}" data-val="${value}" ${checked ? "disabled" : ""}>${label}</button>`;
}

function renderPlay() {
  const r = reaction();
  const s = species();
  const theoryRow = asksTheory(s) ? `
    <div class="axis"><span class="axis-label">Under which theory? ${checked ? (graded.theory ? '<span class="mark ok">✓</span>' : '<span class="mark no">✗</span>') : ""}</span>
      <div class="opts">${THEORIES.map((t) => optBtn("theory", t, THEORY_LABEL[t])).join("")}</div>
      <p class="axis-hint">Pick the narrowest one; the wider theories light up with it.</p></div>` : "";
  const feedback = checked ? `<div class="feedback ${graded.ok ? "ok" : "no"}"><strong>${graded.ok ? "Right." : "Not quite."}</strong> ${s.why}</div>` : "";
  const last = speciesIndex === r.species.length - 1;
  root.innerHTML = `
    <div class="card-face"><span class="card-tag">Reaction ${roundTotal - queue.length + 1} of ${roundTotal} · species ${speciesIndex + 1} of ${r.species.length}</span>${equationHtml(r)}</div>
    <p class="prompt">What is <span class="f">${s.f}</span> in this reaction?</p>
    <div class="axes">
      <div class="axis"><span class="axis-label">Role ${checked ? (graded.role ? '<span class="mark ok">✓</span>' : '<span class="mark no">✗</span>') : ""}</span>
        <div class="opts">${ROLES.map((x) => optBtn("role", x, ROLE_LABEL[x])).join("")}</div></div>
      ${theoryRow}
    </div>
    ${feedback}
    <div class="controls">
      <span class="score">Mastered this round: ${masteredThisRound.size} · missed: ${missedThisRound.size}</span>
      ${checked
        ? `<button class="action primary" id="nextBtn">${last ? (queue.length > 1 || results.some((x) => !x.ok) ? "Next reaction →" : "Finish") : "Next species →"}</button>`
        : `<button class="action primary" id="checkBtn" ${isComplete(s, sel) ? "" : "disabled"}>Check</button>`}
    </div>`;
  root.querySelectorAll("[data-axis]").forEach((b) => b.addEventListener("click", () => pick(b.dataset.axis, b.dataset.val)));
  root.querySelector("#checkBtn")?.addEventListener("click", check);
  root.querySelector("#nextBtn")?.addEventListener("click", next);
}

function renderDone() {
  const missed = [...missedThisRound].map((id) => REACTIONS.find((r) => r.id === id));
  const mastered = Object.values(stats).filter((x) => x.mastered).length;
  root.innerHTML = `
    <div class="card-face"><p class="equation">Round done: ${masteredThisRound.size} of ${roundTotal} reactions right first time.</p></div>
    ${missed.length ? `<div class="missed-block"><p class="missed-label">Missed at least once:</p><div class="missed-chips">${missed.map((r) => `<span class="ex-chip">${r.species.filter((s) => s.role === "acid" || s.role === "base").map((s) => s.f).join(" + ")}</span>`).join("")}</div></div>` : ""}
    <p class="progress-line">Saved progress: <strong>${mastered} of ${REACTIONS.length}</strong> reactions mastered all-time.</p>
    <div class="controls two-up">
      ${missed.length ? `<button class="action primary" id="missedBtn">Review the missed ones</button>` : ""}
      <button class="action ${missed.length ? "ghost" : "primary"}" id="againBtn">New round</button>
      <button class="action ghost" id="introBtn">How it works</button>
    </div>
    <p class="done-next"><a class="home-link" href="../acids-bases-guide/01-definitions.html">Guide: Definitions and Classification</a> &nbsp;·&nbsp; <a class="home-link" href="../acid-base-sorter/">Next: Acid / Base Sorter</a> &nbsp;·&nbsp; <a class="home-link" href="../">⌂ All Chem Games</a></p>`;
  root.querySelector("#missedBtn")?.addEventListener("click", () => { mode = "play"; beginRound([...missedThisRound]); });
  root.querySelector("#againBtn").addEventListener("click", startRound);
  root.querySelector("#introBtn").addEventListener("click", showIntro);
}

function render() {
  renderTabs();
  if (mode === "intro") renderIntro();
  else if (mode === "done") renderDone();
  else renderPlay();
}

render();
