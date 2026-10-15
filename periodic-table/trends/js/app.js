// Trend Ladder — DOM layer. Gesture grammar mirrors pH Lab's ladder rung:
// pointer-drag with a ghost, and tap-card-then-tap-slot as the same meaning.
import { TIERS, expectedKeys, endLabels, grade, shuffledTray, speciesByKey } from "./game.js?v=20261015-ru2";
import { detectLang, makeT, applyStatic, langToggleHtml, wireLangToggle } from "../../../shared/js/i18n.js?v=20261015-ru2";
import en from "../locale/en.js?v=20261015-ru2";
import ru from "../locale/ru.js?v=20261015-ru2";

const root = document.getElementById("game");
const lang = detectLang();
const L = { en, ru };
const t = makeT(L, lang);
const OVER = L[lang] || {};          // content overlay for this language (tiers/rounds/properties/chips)
document.documentElement.lang = lang;
document.title = t("title");
applyStatic(t);
document.querySelector("#langToggle").innerHTML = langToggleHtml(lang);
wireLangToggle(document);

// Localized views of the English content in rounds.js. Missing pieces fall back to English.
const tierText = (tr, field) => OVER.tiers?.[tr.id]?.[field] ?? tr[field];
const roundText = (r, field) => OVER.rounds?.[r.id]?.[field] ?? r[field];
const propGen = (prop) => OVER.properties?.[prop]?.gen ?? prop;
const endFmt = (kind, prop) => {
  const o = OVER.properties?.[prop];
  if (o) return kind === "smallest" ? o.least : o.most;
  return t(kind, { property: prop });
};
const chip = (text) => (OVER.chips || []).reduce((acc, [from, to]) => acc.split(from).join(to), text);

let tierIdx = Math.max(0, TIERS.findIndex((t) => "#" + t.id === location.hash));
let mode = "intro";          // intro | play | done
let queue = [];              // round objects still to solve this tier
let roundTotal = 0;
let solved = 0;
let placed = [];             // slot index -> species key | null
let selected = null;         // { key, from: "tray" | slotIndex }
let checked = false;
let graded = null;
let hintsShown = 0;

const tier = () => TIERS[tierIdx];
const round = () => queue[0];

function startTier(idx, skipIntro = false) {
  tierIdx = idx;
  history.replaceState(null, "", "#" + tier().id);
  queue = [...tier().rounds];
  roundTotal = queue.length;
  solved = 0;
  mode = skipIntro ? "play" : "intro";
  dealRound();
  render();
}

function dealRound() {
  if (!queue.length) { mode = "done"; return; }
  placed = new Array(round().species.length).fill(null);
  trayKeys = shuffledTray(round());
  selected = null; checked = false; graded = null; hintsShown = 0;
}

let trayKeys = [];
const trayPool = () => trayKeys.filter((k) => !placed.includes(k));

function placeInto(slot, sel) {
  // A displaced occupant simply reappears in the tray: the pool is derived
  // (trayKeys minus placed), so overwriting the slot is enough.
  const displaced = placed[slot];
  if (sel.from === "tray") placed[slot] = sel.key;
  else { placed[sel.from] = displaced === sel.key ? null : displaced; placed[slot] = sel.key; }
  selected = null;
  render();
}
function returnToTray(sel) {
  if (sel.from !== "tray") placed[sel.from] = null;
  selected = null;
  render();
}

function check() {
  graded = grade(round(), placed);
  checked = true;
  render();
}
function next() {
  const r = queue.shift();
  if (graded && graded.correct) solved += 1;
  else queue.push(r);   // wrong orderings come back around
  dealRound();
  if (!queue.length) mode = "done";
  render();
}
function showHint() { hintsShown += 1; render(); }

// ── shared chrome ──────────────────────────────────────────────────────────
function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map((t, i) =>
    `<button class="level-tab${i === tierIdx ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIdx}">${tierText(t, "label")}</button>`).join("")}</div>`;
}
function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => startTier(Number(b.dataset.tier))));
}

// ── intro diagrams (tiny inline SVG, autumn tokens via currentColor) ───────
function arrowsDiagram(labels) {
  return `<svg class="intro-svg" viewBox="0 0 340 150" role="img" aria-label="periodic table with trend arrows">
    <rect x="60" y="30" width="250" height="100" rx="8" fill="none" stroke="var(--line)" stroke-width="2"/>
    <rect x="60" y="30" width="34" height="100" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <rect x="276" y="30" width="34" height="100" rx="8" fill="var(--plum-soft)" stroke="var(--plum)"/>
    <line x1="110" y1="14" x2="290" y2="14" stroke="var(--accent-dark)" stroke-width="3" marker-end="url(#tl-arr)"/>
    <text x="196" y="9" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-dark)">${labels.across} →</text>
    <line x1="36" y1="44" x2="36" y2="116" stroke="var(--plum-dark)" stroke-width="3" marker-end="url(#tl-arr)"/>
    <text x="26" y="84" text-anchor="middle" font-size="12" font-weight="700" fill="var(--plum-dark)" transform="rotate(-90 26 84)">${labels.down} ↓</text>
    <defs><marker id="tl-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="currentColor"/></marker></defs>
  </svg>`;
}
function isoDiagram() {
  const circle = (cx, r, p, sym) => `
    <circle cx="${cx}" cy="62" r="${r}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="${cx}" y="66" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ink)">${p}</text>
    <text x="${cx}" y="128" text-anchor="middle" font-size="13" font-weight="700" fill="var(--muted)">${sym}</text>`;
  return `<svg class="intro-svg" viewBox="0 0 420 140" role="img" aria-label="three ions with the same electron cloud shrinking as protons increase">
    ${circle(100, 44, "8 p⁺", "O²⁻")}${circle(210, 36, "10 p⁺", "Ne")}${circle(316, 27, "12 p⁺", "Mg²⁺")}
    <text x="210" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent-dark)">${t("iso_caption")}</text>
  </svg>`;
}

// ── screens ────────────────────────────────────────────────────────────────
function renderIntro() {
  const tr = tier();
  const steps = tierText(tr, "introSteps").map((s, i) =>
    `<li><span class="step-num">${i + 1}</span><span class="step-text">${s}</span></li>`).join("");
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro-card">
      <h2>${tierText(tr, "introTitle")}</h2>
      ${tr.diagram === "iso" ? isoDiagram() : arrowsDiagram(tierText(tr, "diagramLabels"))}
      <ol class="steps">${steps}</ol>
      <div class="controls two-up">
        <button class="action primary" id="startBtn">${t("start", { n: tr.rounds.length })}</button>
      </div>
    </div>`;
  wireTabs();
  root.querySelector("#startBtn").addEventListener("click", () => { mode = "play"; render(); });
}

function renderDone() {
  const tr = tier();
  const nextTier = TIERS[tierIdx + 1];
  const plain = (x) => String(x).replace(/&amp;/g, "&");
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro-card done-card">
      <h2>${t("done_h2", { tier: plain(tierText(tr, "label")) })}</h2>
      <p class="done-line">${t("done_line", { n: roundTotal })}</p>
      <div class="controls two-up">
        ${nextTier ? `<button class="action primary" id="nextTierBtn">${t("next_tier", { tier: plain(tierText(nextTier, "label")) })}</button>` : ""}
        <button class="action ghost" id="replayBtn">${t("replay")}</button>
        <a class="action ghost" href="../#trends">${t("to_topic")}</a>
        <a class="action ghost" href="../../">${t("to_home")}</a>
      </div>
    </div>`;
  wireTabs();
  const nb = root.querySelector("#nextTierBtn");
  if (nb) nb.addEventListener("click", () => startTier(tierIdx + 1));
  root.querySelector("#replayBtn").addEventListener("click", () => startTier(tierIdx, true));
}

function renderPlay() {
  const r = round();
  const dec = r.direction === "dec";
  const ends = endLabels(r, endFmt);
  const hints = roundText(r, "hints");
  const isSel = (key, from) => selected && selected.key === key && String(selected.from) === String(from);

  const cardHtml = (key, from) => {
    const s = speciesByKey(r, key);
    return `<span class="ladder-card${isSel(key, from) ? " sel" : ""}" data-key="${key}" data-from="${from}">${s.label}</span>`;
  };

  const slots = placed.map((k, i) => {
    const mark = checked ? (graded.perSlot[i] ? " ok" : " no") : "";
    return `<div class="ladder-slot${k ? " filled" : ""}${mark}" data-slot="${i}">
      ${k ? cardHtml(k, i) : `<span class="slot-num">${i + 1}</span>`}
    </div>`;
  }).join("");

  const tray = checked ? "" : `<div class="ladder-tray" id="ladderTray">
      ${trayPool().length ? trayPool().map((k) => cardHtml(k, "tray")).join("") : `<span class="tray-empty">${t("tray_empty")}</span>`}
    </div>`;

  const shown = hints.slice(0, hintsShown).map((h) => `<li>${h}</li>`).join("");
  const hintBlock = checked ? "" : `<div class="hints">
      ${hintsShown ? `<ul class="hint-list">${shown}</ul>` : ""}
      ${hintsShown < hints.length ? `<button class="hint-btn" id="hintBtn" type="button">${hintsShown ? t("hint_more") : t("hint")}</button>` : ""}
    </div>`;

  let reveal = "", feedback = `<p class="feedback">&nbsp;</p>`;
  if (checked) {
    feedback = graded.correct
      ? `<p class="feedback ok">${t(hintsShown ? "ok_hints" : "ok_clean")}</p>`
      : `<p class="feedback no">${t("wrong")}</p>`;
    reveal = `<div class="ladder-answer">
      <p class="ladder-answer-h">${ends.left} → ${ends.right}</p>
      <div class="ladder-answer-row">${expectedKeys(r).map((k) => {
        const s = speciesByKey(r, k);
        return `<span class="ladder-answer-card">${s.label}<span class="value-chip">${chip(s.chip)}</span></span>`;
      }).join("")}</div>
      <p class="why-line">${roundText(r, "why")}</p>
    </div>`;
  }

  root.innerHTML = `
    ${tierTabs()}
    <button class="intro-link" id="introBtn" type="button">${t("how")}</button>
    <p class="ladder-direction${dec ? " dir-dec" : ""}">${t(dec ? "dir_dec" : "dir_inc", { property: propGen(r.property) })}</p>
    <div class="strip-ends"><span>${ends.left}</span><span>${ends.right}</span></div>
    <div class="ladder-slots">${slots}</div>
    ${tray}
    ${hintBlock}
    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">${t("score", { solved, total: roundTotal, left: queue.length })}</p>
      ${checked
        ? `<button class="action primary" id="nextBtn">${queue.length > 1 || !graded.correct ? t("next") : t("finish")}</button>`
        : `<button class="action primary" id="checkBtn" ${placed.includes(null) ? "disabled" : ""}>${t("check")}</button>`}
    </div>`;

  root.querySelector("#introBtn").addEventListener("click", () => { mode = "intro"; render(); });
  wireTabs();
  const hintBtn = root.querySelector("#hintBtn"); if (hintBtn) hintBtn.addEventListener("click", showHint);
  const checkBtn = root.querySelector("#checkBtn"); if (checkBtn) checkBtn.addEventListener("click", check);
  const nextBtn = root.querySelector("#nextBtn"); if (nextBtn) { nextBtn.addEventListener("click", next); nextBtn.focus(); }
  if (!checked) wireGestures();
}

// ── gestures: pointer-drag with ghost; tap-then-tap as the same meaning ────
function wireGestures() {
  const fromOf = (el) => el.dataset.from === "tray" ? "tray" : Number(el.dataset.from);
  const isSameSel = (sel) => selected && selected.key === sel.key && String(selected.from) === String(sel.from);

  root.querySelectorAll(".ladder-card").forEach((card) => {
    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const sel = { key: card.dataset.key, from: fromOf(card) };
      let ghost = null, dragged = false;
      const startX = e.clientX, startY = e.clientY;

      const move = (ev) => {
        if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        if (!ghost) {
          dragged = true;
          ghost = card.cloneNode(true);
          ghost.classList.add("ghost");
          document.body.appendChild(ghost);
          card.classList.add("dragging");
        }
        ghost.style.left = `${ev.clientX}px`;
        ghost.style.top = `${ev.clientY}px`;
      };
      const up = (ev) => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        if (ghost) { ghost.remove(); card.classList.remove("dragging"); }
        if (!dragged) {   // a tap
          if (selected && !isSameSel(sel) && sel.from !== "tray") { placeInto(sel.from, selected); return; }
          selected = isSameSel(sel) ? null : sel;
          render();
          return;
        }
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const slotEl = under && under.closest(".ladder-slot");
        if (slotEl) placeInto(Number(slotEl.dataset.slot), sel);
        else if (under && under.closest("#ladderTray")) returnToTray(sel);
        else render();   // dropped nowhere — snap back
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
  });

  root.querySelectorAll(".ladder-slot").forEach((slotEl) => {
    slotEl.addEventListener("pointerup", (e) => {
      if (!selected) return;
      if (e.target.closest(".ladder-card")) return;
      placeInto(Number(slotEl.dataset.slot), selected);
    });
  });
  const trayEl = root.querySelector("#ladderTray");
  if (trayEl) trayEl.addEventListener("pointerup", (e) => {
    if (!selected || e.target.closest(".ladder-card")) return;
    returnToTray(selected);
  });
}

function render() {
  if (mode === "intro") renderIntro();
  else if (mode === "done") renderDone();
  else renderPlay();
}

startTier(tierIdx);
