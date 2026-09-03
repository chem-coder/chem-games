/*
  Potential Ladder — app controller.
  Three rungs: the ladder (place every species at its potential), half-
  reactions & who moves (MCQ with corrupted-bookkeeping decoys + typed
  redox questions), collectors & corrosion (order the owner's four-step
  Al-corrosion mechanism + MCQ/typed). House rules: tabs everywhere,
  predict-then-Check, misses requeue, done screens with next + revisit +
  again + home. Every correct answer replies with the why.
*/
import { LADDER } from "../data/ladder.js";
import { matches } from "../../../shared/js/typed-recall.js";

const root = document.getElementById("game");

const TIERS = [
  { key: "ladder", label: "The ladder" },
  { key: "half", label: "Half-reactions" },
  { key: "corrosion", label: "Collectors & corrosion" },
];

let tierIndex = 0;
let mode = "intro"; // intro | play | done
let t1 = null; // ladder placement state
let qz = null; // question-queue state (rungs 2 and 3)

/* ---------- formatting ---------- */

const SUBS = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9, "₊": "+", "₋": "−", "ₓ": "x" };
const SUPS = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chem(s) {
  return esc(s)
    .replace(/[₀-₉₊₋ₓ]+/g, (m) => `<sub>${[...m].map((ch) => SUBS[ch]).join("")}</sub>`)
    .replace(/([⁰¹²³⁴-⁹]*)([⁺⁻])/g, (m, d, sign) => `<sup>${[...d].map((ch) => SUPS[ch]).join("")}${sign === "⁺" ? "+" : "−"}</sup>`)
    .replace(/[⁰¹²³⁴-⁹]+/g, (m) => `<sup>${[...m].map((ch) => SUPS[ch]).join("")}</sup>`);
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- navigation ---------- */

function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map(
    (t, i) =>
      `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${i + 1} · ${t.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => {
      tierIndex = Number(b.dataset.tier);
      mode = "intro";
      t1 = null;
      qz = null;
      render();
    })
  );
}

/* ---------- intro (house pattern: steps + worked example) ---------- */

function renderIntro() {
  const tier = TIERS[tierIndex];
  const intro = LADDER.intros[tier.key];
  const startLabel =
    tier.key === "ladder" ? "Build the ladder →" : tier.key === "half" ? "Start: 8 questions →" : "Start: corrosion round →";
  root.innerHTML = `
    ${tierTabs()}
    <p class="cat-blurb">${chem(intro.lede)}</p>
    <ol class="steps">
      ${intro.steps.map((s, i) => `<li><span class="step-num">${i + 1}</span><span class="step-text">${chem(s)}</span></li>`).join("")}
    </ol>
    <p class="worked-example"><span class="worked-label">${tier.key === "corrosion" ? "The four steps" : "Worked example"}</span> ${chem(intro.example)}</p>
    <div class="controls">
      <button class="action primary" id="startBtn" type="button">${startLabel}</button>
    </div>`;
  wireTabs();
  root.querySelector("#startBtn").addEventListener("click", () => {
    if (tier.key === "ladder") startLadder();
    else startQueue(tier.key);
  });
}

/* ================= rung 1: the ladder (placement) ================= */

function startLadder() {
  trayOrder = null;
  t1 = {
    assign: new Map(), // v -> speciesId
    locked: new Set(), // v values confirmed right
    selected: null,
    checks: 0,
    clean: new Set(),
    missed: new Set(),
  };
  mode = "play";
  render();
}

const slotList = () => LADDER.species.slice().sort((a, b) => b.v - a.v);
const speciesById = new Map(LADDER.species.map((s) => [s.id, s]));

function zoneClass(v) {
  if (v >= 4.5) return " zone-high";
  if (v <= 0.8) return " zone-low";
  return "";
}

function renderLadder() {
  const placedIds = new Set(t1.assign.values());
  const tray = shuffledStable(LADDER.species.filter((s) => !placedIds.has(s.id)));
  const allPlaced = t1.assign.size === LADDER.species.length;
  root.innerHTML = `
    ${tierTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">${t1.locked.size} of ${LADDER.species.length} locked in</span>
      <span class="qtype-chip">place each species at its potential</span>
    </div>
    <p class="prompt">Click a species, then its rung. Tinted rows are outside the carbonate window — the SEI zone below, oxidation above.</p>
    <div class="ladder-wrap">
      <div class="ladder">
        ${slotList()
          .map((s) => {
            const id = t1.assign.get(s.v);
            const locked = t1.locked.has(s.v);
            const chip = id
              ? `<button class="lchip${locked ? " is-locked" : ""}" type="button" data-unplace="${s.v}" ${locked ? "disabled" : ""}>${chem(speciesById.get(id).label)}</button>`
              : `<button class="rung-empty" type="button" data-slot="${s.v}" aria-label="rung at ${s.v} volts"></button>`;
            return `<div class="rung${zoneClass(s.v)}"><span class="rung-v">${s.v.toFixed(2)} V</span>${chip}</div>`;
          })
          .join("")}
      </div>
      <div class="tray-side">
        <p class="tray-title">${tray.length ? "To place:" : "All placed."}</p>
        <div class="tray-chips">
          ${tray
            .map((s) => `<button class="lchip tray${t1.selected === s.id ? " is-picked" : ""}" type="button" data-chip="${s.id}">${chem(s.label)}</button>`)
            .join("")}
        </div>
      </div>
    </div>
    <div id="verdict"></div>
    <div class="controls">
      <button class="action primary" id="checkBtn" type="button" ${allPlaced ? "" : "disabled"}>Check the ladder</button>
    </div>`;
  wireTabs();
  root.querySelectorAll("[data-chip]").forEach((b) =>
    b.addEventListener("click", () => {
      t1.selected = t1.selected === b.dataset.chip ? null : b.dataset.chip;
      render();
    })
  );
  root.querySelectorAll("[data-slot]").forEach((b) =>
    b.addEventListener("click", () => {
      if (!t1.selected) return;
      t1.assign.set(Number(b.dataset.slot), t1.selected);
      t1.selected = null;
      render();
    })
  );
  root.querySelectorAll("[data-unplace]").forEach((b) =>
    b.addEventListener("click", () => {
      t1.assign.delete(Number(b.dataset.unplace));
      render();
    })
  );
  root.querySelector("#checkBtn").addEventListener("click", checkLadder);
}

/* stable shuffle for the tray so chips don't jump on every re-render */
let trayOrder = null;
function shuffledStable(items) {
  if (!trayOrder) trayOrder = shuffled(LADDER.species.map((s) => s.id));
  return trayOrder.map((id) => items.find((s) => s.id === id)).filter(Boolean);
}

function checkLadder() {
  t1.checks += 1;
  let wrong = 0;
  for (const [v, id] of [...t1.assign]) {
    const sp = speciesById.get(id);
    if (sp.v === v) {
      t1.locked.add(v);
      if (t1.checks === 1) t1.clean.add(id);
    } else {
      t1.assign.delete(v);
      t1.missed.add(id);
      wrong += 1;
    }
  }
  if (t1.locked.size === LADDER.species.length) {
    mode = "done";
    render();
    return;
  }
  render();
  root.querySelector("#verdict").innerHTML = `<p class="feedback no">✗ ${wrong} bounced back to the tray — the locked rungs are set, try the rest again.</p>`;
}

function renderLadderDone() {
  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Ladder built — ${LADDER.species.length} species, ${t1.clean.size} placed clean on the first check.</p>
    ${t1.clean.size === LADDER.species.length ? '<p class="feedback ok">Clean run — the axis is yours. 🎉</p>' : ""}
    <p class="study-hint">The ladder, annotated — this picture is the whole rung:</p>
    <div class="ladder done-ladder">
      ${slotList()
        .map(
          (s) => `<div class="rung${zoneClass(s.v)}">
            <span class="rung-v">${s.v.toFixed(2)} V</span>
            <div class="rung-done">
              <span class="lchip is-locked as-label">${chem(s.label)}</span>
              <span class="rung-note">${chem(s.note)}</span>
            </div>
          </div>`
        )
        .join("")}
    </div>
    ${doneNav("Half-reactions")}`;
  wireTabs();
  wireDoneNav(startLadder);
}

/* ============ rungs 2 & 3: question queues (mcq / typed / order) ========= */

function makeQueue(kind) {
  if (kind === "half") {
    return shuffled(LADDER.halfBank).slice(0, 8).map(instantiate);
  }
  const orderQ = instantiate({ type: "order" });
  return [orderQ, ...shuffled(LADDER.collectorBank).slice(0, 6).map(instantiate)];
}

function instantiate(bankItem) {
  const q = { src: bankItem, type: bankItem.type, dirty: bankItem.dirty || false };
  if (bankItem.type === "mcq") q.options = shuffled(bankItem.options);
  if (bankItem.type === "order") {
    q.steps = shuffled(LADDER.corrosionSteps.map((text, i) => ({ text, truePos: i })));
    q.picked = []; // indices into q.steps in click order
  }
  return q;
}

function startQueue(kind) {
  qz = {
    kind,
    queue: makeQueue(kind),
    total: 0, solved: 0, clean: 0, missed: 0,
    picked: null, state: "asking", attempts: 0, // asking | right | shown
  };
  qz.total = qz.queue.length;
  mode = "play";
  render();
}

function renderQueue() {
  const q = qz.queue[0];
  const showNext = qz.state !== "asking";
  const body =
    q.type === "mcq" ? mcqBody(q, showNext) : q.type === "typed" ? typedBody(q, showNext) : orderBody(q, showNext);
  root.innerHTML = `
    ${tierTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">Solved ${Math.min(qz.solved, qz.total)} of ${qz.total}</span>
      <span class="qtype-chip">${q.type === "order" ? "put the steps in order" : q.type === "mcq" ? "pick the honest bookkeeping" : "type the answer"}</span>
      ${q.dirty ? '<span class="qtype-chip retry">back for another try</span>' : ""}
    </div>
    ${body}
    <div id="verdict">${
      qz.state === "right" ? `<p class="feedback ok">✓ ${chem(rightWhy(q))}</p>` : qz.state === "shown" ? `<p class="hint-line worked">${chem(rightWhy(q))}</p>` : ""
    }</div>
    <div class="controls">
      ${showNext
        ? `<button class="action primary" id="nextBtn" type="button">Next →</button>`
        : q.type === "mcq"
          ? `<button class="action primary" id="checkBtn" type="button" ${qz.picked == null ? "disabled" : ""}>Check</button>`
          : `<button class="action ghost" id="showBtn" type="button">Show me</button>
             <button class="action primary" id="checkBtn" type="button" ${q.type === "order" && q.picked.length !== q.steps.length ? "disabled" : ""}>Check</button>`}
    </div>`;
  wireTabs();
  if (showNext) {
    root.querySelector("#nextBtn").addEventListener("click", nextQ);
    return;
  }
  if (q.type === "mcq") wireMcq(q);
  else if (q.type === "typed") wireTyped(q);
  else wireOrder(q);
}

function rightWhy(q) {
  if (q.type === "order") return "①→④ in the corrosion order: armor breaks, metal oxidizes, complexes form, complexes dissolve. Stop any one step and the foil lives.";
  if (q.type === "typed" && qz.state === "shown") return `${q.src.answer.abbr} — ${q.src.answer.name}. ${q.src.why}`;
  return q.src.why;
}

/* --- mcq --- */
function mcqBody(q, showNext) {
  return `
    <p class="prompt">${chem(q.src.prompt)}</p>
    <div class="opts">
      ${q.options
        .map(
          (o, i) =>
            `<button class="opt${qz.picked === i ? " is-picked" : ""}" type="button" data-i="${i}" ${showNext ? "disabled" : ""}><span class="opt-claim">${chem(o.text)}</span></button>`
        )
        .join("")}
    </div>`;
}

function wireMcq(q) {
  root.querySelectorAll(".opt").forEach((b) =>
    b.addEventListener("click", () => {
      qz.picked = Number(b.dataset.i);
      render();
    })
  );
  root.querySelector("#checkBtn").addEventListener("click", () => {
    const right = q.options[qz.picked].correct;
    qz.state = right ? "right" : "shown";
    if (right) {
      qz.solved += 1;
      if (!q.dirty) qz.clean += 1;
    } else {
      qz.missed += 1;
      const retry = instantiate(q.src);
      retry.dirty = true;
      qz.queue.push(retry);
    }
    render();
    const opts = root.querySelectorAll(".opt");
    q.options.forEach((o, i) => {
      if (o.correct) opts[i].classList.add("is-right");
      else if (i === qz.picked && !right) opts[i].classList.add("is-wrong");
    });
  });
}

/* --- typed --- */
function typedBody(q, showNext) {
  return `
    <p class="prompt">${chem(q.src.prompt)}</p>
    <div class="answer-row">
      <input class="answer-input answer-text" id="answerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
        placeholder="symbol or name" ${showNext ? "disabled" : ""} aria-label="your answer" />
    </div>`;
}

function wireTyped(q) {
  const input = root.querySelector("#answerInput");
  input.focus();
  const check = () => {
    if (!input.value.trim()) return;
    qz.attempts += 1;
    if (matches(q.src.answer, input.value)) {
      qz.state = "right";
      qz.solved += 1;
      if (qz.attempts === 1 && !q.dirty) qz.clean += 1;
      render();
    } else {
      root.querySelector("#verdict").innerHTML = `<p class="feedback no">✗ Not that one — try again, or Show me.</p>`;
      input.classList.add("is-wrong");
      input.select();
      setTimeout(() => input.classList.remove("is-wrong"), 600);
    }
  };
  root.querySelector("#checkBtn").addEventListener("click", check);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") check();
  });
  root.querySelector("#showBtn").addEventListener("click", () => showMe(q));
}

/* --- order --- */
function orderBody(q, showNext) {
  return `
    <p class="prompt">Aluminum corrosion at high voltage — click the steps in the order they happen:</p>
    <div class="order-list">
      ${q.steps
        .map((s, i) => {
          const pos = q.picked.indexOf(i);
          return `<button class="order-step${pos >= 0 ? " is-set" : ""}" type="button" data-i="${i}" ${showNext ? "disabled" : ""}>
            <span class="order-badge">${pos >= 0 ? pos + 1 : "·"}</span>
            <span class="order-text">${chem(s.text)}</span>
          </button>`;
        })
        .join("")}
    </div>
    ${!showNext && q.picked.length ? `<p class="study-hint"><button class="linklike" id="resetOrder" type="button">↺ reset the order</button></p>` : ""}`;
}

function wireOrder(q) {
  root.querySelectorAll(".order-step").forEach((b) =>
    b.addEventListener("click", () => {
      const i = Number(b.dataset.i);
      if (q.picked.includes(i)) return;
      q.picked.push(i);
      render();
    })
  );
  const reset = root.querySelector("#resetOrder");
  if (reset)
    reset.addEventListener("click", () => {
      q.picked = [];
      render();
    });
  const checkBtn = root.querySelector("#checkBtn");
  checkBtn.addEventListener("click", () => {
    qz.attempts += 1;
    const right = q.picked.every((stepIdx, pos) => q.steps[stepIdx].truePos === pos);
    if (right) {
      qz.state = "right";
      qz.solved += 1;
      if (qz.attempts === 1 && !q.dirty) qz.clean += 1;
      render();
    } else {
      q.picked = [];
      render();
      root.querySelector("#verdict").innerHTML = `<p class="feedback no">✗ Not that order — think: what has to break before the metal is exposed?</p>`;
    }
  });
  root.querySelector("#showBtn").addEventListener("click", () => showMe(q));
}

function showMe(q) {
  qz.state = "shown";
  qz.missed += 1;
  if (q.type === "order") q.picked = q.steps.map((s, i) => i).sort((a, b) => q.steps[a].truePos - q.steps[b].truePos);
  const retry = instantiate(q.src.type ? q.src : { type: "order" });
  retry.dirty = true;
  qz.queue.push(retry);
  render();
}

function nextQ() {
  qz.queue.shift();
  qz.picked = null;
  qz.attempts = 0;
  qz.state = "asking";
  if (!qz.queue.length) mode = "done";
  render();
}

function renderQueueDone() {
  const tier = TIERS[tierIndex];
  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">Round done — ${qz.total} questions, ${qz.clean} solved clean on the first try.</p>
    ${qz.clean === qz.total ? '<p class="feedback ok">Clean run — the bookkeeping never caught you out. 🎉</p>' : ""}
    ${doneNav(tierIndex === 1 ? "Collectors & corrosion" : null)}`;
  wireTabs();
  wireDoneNav(() => startQueue(tier.key));
}

/* ---------- shared done-nav (house pattern) ---------- */

function doneNav(nextLabel) {
  return `
    <div class="controls two-up done-nav">
      ${nextLabel ? `<button class="action primary" id="nextTierBtn" type="button">Next: ${nextLabel} →</button>` : ""}
      <button class="action ghost" id="revisitBtn" type="button">↩ Revisit the intro</button>
    </div>
    <p class="done-next">Or run it again:</p>
    <div class="controls two-up">
      <button class="action ghost" id="againBtn" type="button">Another round</button>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ Battery Lab</a> &nbsp;·&nbsp; <a class="home-link" href="../../">⌂ All Chem Games</a></p>`;
}

function wireDoneNav(again) {
  const nextBtn = root.querySelector("#nextTierBtn");
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      tierIndex += 1;
      mode = "intro";
      t1 = null;
      qz = null;
      render();
    });
  root.querySelector("#revisitBtn").addEventListener("click", () => {
    mode = "intro";
    t1 = null;
    qz = null;
    render();
  });
  root.querySelector("#againBtn").addEventListener("click", () => {
    trayOrder = null;
    again();
  });
}

/* ---------- dispatcher ---------- */

function render() {
  const key = TIERS[tierIndex].key;
  if (mode === "intro") renderIntro();
  else if (mode === "done") (key === "ladder" ? renderLadderDone : renderQueueDone)();
  else if (key === "ladder") renderLadder();
  else renderQueue();
}

render();
