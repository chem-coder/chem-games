/*
  Full-Cell Builder — app controller.
  Two rungs: Diagnose (shown a complete cell, predict works/fails before the
  reveal) and Build to order (open bench + customer brief, judged by the rule
  engine — any chemically sound build passes, no answer-matching).
  House rules: tabs on every screen, predict-then-check, misses requeue,
  done screens offer next + revisit + again + home.
*/
import { BENCH } from "../data/bench.js";
import { evaluate, briefCheck, isComplete } from "./rules.js";

const root = document.getElementById("game");
const byId = new Map(BENCH.components.map((c) => [c.id, c]));
const SLOT_KINDS = ["cathode", "anode", "salt", "cyclic", "linear", "film"];

const TIERS = [
  { key: "diagnose", label: "Diagnose" },
  { key: "build", label: "Build to order" },
];

let tierIndex = 0;
let mode = "play"; // play | done
let diag = null;
let bld = null;

/* ---------- formatting ---------- */

const SUBS = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };
const SUPS = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chem(s) {
  return esc(s)
    .replace(/[₀-₉]+/g, (m) => `<sub>${[...m].map((ch) => SUBS[ch]).join("")}</sub>`)
    .replace(/([⁰-⁹]*)([⁺⁻])/g, (m, d, sign) => `<sup>${[...d].map((ch) => SUPS[ch]).join("")}${sign === "⁺" ? "+" : "−"}</sup>`)
    .replace(/[⁰-⁹]+/g, (m) => `<sup>${[...m].map((ch) => SUPS[ch]).join("")}</sup>`);
}

function abbrHtml(c) {
  return esc(c.abbr).replace(/([A-Za-z)\]])(\d+)/g, "$1<sub>$2</sub>");
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
      `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${t.label}</button>`
  ).join("")}</div>`;
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => {
      tierIndex = Number(b.dataset.tier);
      startTier();
    })
  );
}

function startTier() {
  mode = "play";
  if (TIERS[tierIndex].key === "diagnose") {
    diag = {
      queue: shuffled(BENCH.cases).slice(0, 8),
      total: 8, solved: 0, clean: 0,
      missedIds: new Set(), picked: null, revealed: false,
    };
  } else {
    bld = {
      queue: shuffled(BENCH.briefs),
      total: BENCH.briefs.length, done: 0, clean: 0,
      attempts: 0, missedIds: new Set(),
      build: emptyBuild(), checked: null,
    };
  }
  render();
}

function emptyBuild() {
  return { cathode: null, anode: null, salt: null, cyclic: null, linear: null, film: null };
}

/* ---------- bench rendering ---------- */

function slotHtml(kind, build, live) {
  const id = build[kind];
  const c = id ? byId.get(id) : null;
  const chip = c
    ? `<button class="slot-chip kind-${kind}" type="button" data-slot="${kind}" title="${esc(c.name)}${live ? " — click to remove" : ""}" ${live ? "" : "disabled"}>${abbrHtml(c)}</button>`
    : `<span class="slot-empty">—</span>`;
  return `<div class="slot${c ? " is-filled" : ""}">
    <span class="slot-label">${BENCH.kinds[kind].slot}</span>
    ${chip}
  </div>`;
}

function benchHtml(build, live) {
  return `<div class="bench${live ? " is-live" : ""}">${SLOT_KINDS.map((k) => slotHtml(k, build, live)).join("")}</div>`;
}

function traysHtml(build) {
  return `<div class="trays">${SLOT_KINDS.map((kind) => {
    const items = BENCH.components.filter((c) => c.kind === kind);
    return `<div class="tray">
      <span class="tray-label">${BENCH.kinds[kind].label}</span>
      <div class="tray-chips">${items
        .map(
          (c) =>
            `<button class="tray-chip kind-${kind}${build[kind] === c.id ? " is-used" : ""}" type="button" data-id="${c.id}" data-kind="${kind}" title="${esc(c.name)}">${abbrHtml(c)}</button>`
        )
        .join("")}</div>
    </div>`;
  }).join("")}</div>`;
}

function verdictHtml(result, briefLines) {
  const icon = { fail: "✗", warn: "△", ok: "✓" };
  const volts =
    result.voltage != null
      ? `<p class="volt-line">Cell voltage: <strong>${result.voltage.toFixed(2)} V</strong> <span class="volt-math">(cathode − anode, avg vs Li<sup>+</sup>/Li)</span></p>`
      : "";
  const rules = result.findings
    .map((f) => `<li class="finding ${f.level}"><span class="finding-icon">${icon[f.level]}</span>${chem(f.text)}</li>`)
    .join("");
  const brief = briefLines
    ? `<p class="verdict-sub">The brief:</p><ul class="findings">${briefLines
        .map((l) => `<li class="finding ${l.ok ? "ok" : "fail"}"><span class="finding-icon">${l.ok ? "✓" : "✗"}</span>${chem(l.text)}</li>`)
        .join("")}</ul>`
    : "";
  return `<div class="verdict">${volts}<ul class="findings">${rules}</ul>${brief}</div>`;
}

/* ---------- rung 1: diagnose ---------- */

function renderDiagnose() {
  const cs = diag.queue[0];
  const result = diag.revealed ? evaluate(cs.build, byId) : null;
  const right = diag.revealed && (diag.picked === "works") === cs.expectWorks ? true : false;
  root.innerHTML = `
    ${tierTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">Solved ${diag.solved} of ${diag.total}</span>
      <span class="qtype-chip">will it work?</span>
      ${cs.dirty ? '<span class="qtype-chip retry">back for another try</span>' : ""}
    </div>
    <p class="prompt">${chem(cs.hook)}</p>
    ${benchHtml(cs.build, false)}
    ${
      diag.revealed
        ? `<p class="feedback ${right ? "ok" : "no"}">${
            right
              ? `✓ Called it — this cell ${cs.expectWorks ? "works" : "fails"}.`
              : `✗ It actually ${cs.expectWorks ? "works" : "fails"} — the diagnosis is below. It'll come back around.`
          }</p>
          ${verdictHtml(result)}
          <div class="controls"><button class="action primary" id="nextBtn" type="button">Next →</button></div>`
        : `<div class="controls predict-controls">
            <span class="predict-ask">Your call:</span>
            <button class="action ghost" id="worksBtn" type="button">It works</button>
            <button class="action ghost" id="failsBtn" type="button">It fails</button>
          </div>`
    }`;
  wireTabs();
  if (!diag.revealed) {
    root.querySelector("#worksBtn").addEventListener("click", () => predict("works"));
    root.querySelector("#failsBtn").addEventListener("click", () => predict("fails"));
  } else {
    root.querySelector("#nextBtn").addEventListener("click", nextCase);
  }
}

function predict(call) {
  const cs = diag.queue[0];
  diag.picked = call;
  diag.revealed = true;
  const right = (call === "works") === cs.expectWorks;
  if (right) {
    diag.solved += 1;
    if (!cs.dirty) diag.clean += 1;
  } else {
    diag.missedIds.add(cs.id);
    diag.queue.push({ ...cs, dirty: true });
  }
  render();
}

function nextCase() {
  diag.queue.shift();
  diag.picked = null;
  diag.revealed = false;
  if (!diag.queue.length) mode = "done";
  render();
}

/* ---------- rung 2: build to order ---------- */

function renderBuild() {
  const brief = bld.queue[0];
  const checked = bld.checked;
  const success = checked && checked.result.works && checked.brief.met;
  root.innerHTML = `
    ${tierTabs()}
    <div class="quiz-bar">
      <span class="quiz-progress">Built ${bld.done} of ${bld.total}</span>
      <span class="qtype-chip">build to order</span>
    </div>
    <div class="brief">
      <p class="brief-title">${esc(brief.title)}</p>
      <p class="brief-ask">${chem(brief.ask)}</p>
    </div>
    ${benchHtml(bld.build, !success)}
    ${traysHtml(bld.build)}
    ${
      checked
        ? `<p class="feedback ${success ? "ok" : "no"}">${
            success
              ? `✓ Sold — the chemistry holds and the customer signs${bld.attempts === 1 ? " on the first pitch" : ""}.`
              : checked.result.works
                ? "△ The cell works, but it isn't what they ordered — check the brief lines below."
                : "✗ The chemistry itself fails — fix the red lines first."
          }</p>${verdictHtml(checked.result, checked.brief.lines)}`
        : ""
    }
    <div class="controls">
      ${
        success
          ? `<button class="action primary" id="nextBriefBtn" type="button">Next order →</button>`
          : `<button class="action primary" id="checkBtn" type="button" ${isComplete(bld.build) ? "" : "disabled"}>Check the build</button>`
      }
    </div>`;
  wireTabs();
  if (!success) {
    root.querySelectorAll(".tray-chip").forEach((b) =>
      b.addEventListener("click", () => {
        const { id, kind } = b.dataset;
        bld.build[kind] = bld.build[kind] === id ? null : id;
        bld.checked = null;
        render();
      })
    );
    root.querySelectorAll(".slot-chip").forEach((b) =>
      b.addEventListener("click", () => {
        bld.build[b.dataset.slot] = null;
        bld.checked = null;
        render();
      })
    );
    const check = root.querySelector("#checkBtn");
    if (check)
      check.addEventListener("click", () => {
        bld.attempts += 1;
        bld.checked = {
          result: evaluate(bld.build, byId),
          brief: briefCheck(bld.build, bld.queue[0], byId),
        };
        render();
      });
  } else {
    root.querySelector("#nextBriefBtn").addEventListener("click", () => {
      bld.done += 1;
      if (bld.attempts === 1) bld.clean += 1;
      else bld.missedIds.add(bld.queue[0].id);
      bld.queue.shift();
      bld.build = emptyBuild();
      bld.checked = null;
      bld.attempts = 0;
      if (!bld.queue.length) mode = "done";
      render();
    });
  }
}

/* ---------- done (house pattern) ---------- */

function renderDone() {
  const tier = TIERS[tierIndex];
  const isDiag = tier.key === "diagnose";
  const stats = isDiag
    ? `Round done — ${diag.total} cells diagnosed, ${diag.clean} called right first time.`
    : `All orders filled — ${bld.total} briefs, ${bld.clean} sold on the first pitch.`;
  const missed = isDiag
    ? [...diag.missedIds].map((id) => BENCH.cases.find((c) => c.id === id).hook)
    : [...bld.missedIds].map((id) => BENCH.briefs.find((b) => b.id === id).title);
  const missedBlock = missed.length
    ? `<div class="missed-block"><p class="missed-label">Worth another look:</p>
       <div class="chips">${missed.map((m) => `<span class="chip chip-missed">${chem(m)}</span>`).join("")}</div></div>`
    : `<p class="feedback ok">Clean run — every call landed. 🎉</p>`;
  const nextTier = TIERS[tierIndex + 1] || null;
  root.innerHTML = `
    ${tierTabs()}
    <p class="prompt">${stats}</p>
    ${missedBlock}
    <div class="controls two-up done-nav">
      ${nextTier ? `<button class="action primary" id="nextTierBtn" type="button">Next: ${nextTier.label} →</button>` : ""}
      <button class="action ghost" id="againBtn" type="button">Run ${tier.label.toLowerCase()} again</button>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ Battery Lab</a> &nbsp;·&nbsp; <a class="home-link" href="../../">⌂ All Chem Games</a></p>`;
  wireTabs();
  const nextBtn = root.querySelector("#nextTierBtn");
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      tierIndex += 1;
      startTier();
    });
  root.querySelector("#againBtn").addEventListener("click", startTier);
}

/* ---------- dispatcher ---------- */

function render() {
  if (mode === "done") renderDone();
  else if (TIERS[tierIndex].key === "diagnose") renderDiagnose();
  else renderBuild();
}

startTier();
