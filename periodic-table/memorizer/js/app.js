// Periodic Table Memorizer — DOM layer for both modes. Pure logic lives in game.js (fill) and
// quiz.js (symbol↔name). One page, a mode toggle up top; both share pt-data.js.
import { ELEMENTS } from "../data/pt-data.js?v=20261015-ru1";
import { NAMES_RU, ALIASES_RU } from "../data/pt-names.ru.js?v=20261015-ru1";
import { isCorrectSymbol, normalizeSymbol, nextUnfilled, neighbor, SCOPES, SCOPE_GROUPS, poolForScope, isFamilyScope } from "./game.js?v=20261015-ru1";
import { buildQuizRound, gradeQuiz, requeue, QUIZ_SIZE } from "./quiz.js?v=20261015-ru1";
import { detectLang, makeT, elementName, applyStatic } from "../../../shared/js/i18n.js?v=20261015-ru1";
import en from "../locale/en.js?v=20261015-ru1";
import ru from "../locale/ru.js?v=20261015-ru1";

const lang = detectLang();
const t = makeT({ en, ru }, lang);
const NAMES = { ru: NAMES_RU };
const ALIASES = { ru: ALIASES_RU };
const nameOf = (el) => elementName(el, lang, NAMES[lang]);
const gradeOpts = { lang, names: NAMES[lang], aliases: ALIASES[lang] };
document.documentElement.lang = lang;
document.title = t("title").replace(/&[a-z#0-9]+;/g, "");
applyStatic(t);

const root = document.querySelector("#game");
const fillInput = document.querySelector("#fillInput"); // fill mode's real field — see index.html
const elByZ = (z) => ELEMENTS[z - 1];
const esc = (s) => String(s).replace(/"/g, "&quot;");
const TOUCH = matchMedia("(pointer: coarse)").matches; // phrasing only; input works either way

let mode = "fill"; // "fill" | "quiz"
let scopeIndex = 0; // index into SCOPES; 0 = Rows 1–3 (beginner)
const scope = () => SCOPES[scopeIndex];
const pool = () => poolForScope(scope());

// ── Fill-the-table state ──
let earned = new Set();
let revealed = false;
let activeZ = null;
let buffer = "";
let misses = 0;

// buffer and the input's value must never diverge — both typing paths route through here.
// Title-case as they type (fe → Fe) so phone keyboards never need the shift key; grading
// already accepts any case, so this changes display only.
const setBuffer = (v) => { buffer = normalizeSymbol(v); fillInput.value = buffer; };
// Focus must run synchronously inside the tap/keydown call stack, or mobile Safari
// silently refuses to open the keyboard. preventScroll: the input is fixed-position.
const focusFill = () => fillInput.focus({ preventScroll: true });

function activate(z) {
  if (revealed || earned.has(elByZ(z).symbol)) return;
  activeZ = z; setBuffer(""); focusFill(); render();
}
function submit() {
  if (activeZ == null) return;
  const el = elByZ(activeZ);
  if (isCorrectSymbol(el, buffer)) {
    earned.add(el.symbol);
    const next = nextUnfilled(earned, el.z, pool());
    activeZ = next ? next.z : null; setBuffer("");
    if (!next) fillInput.blur(); // scope complete — let the phone keyboard close
    render();
  } else {
    misses += 1; setBuffer(""); render();
    root.querySelector(".cell.active")?.classList.add("shake");
  }
}
function arrow(dir) {
  if (activeZ == null) { const s = nextUnfilled(earned, 0, pool()); if (s) { activeZ = s.z; setBuffer(""); focusFill(); render(); } return; }
  const el = elByZ(activeZ);
  if (isCorrectSymbol(el, buffer)) earned.add(el.symbol); // correct + arrow → counts
  setBuffer("");
  const nb = neighbor(el, dir, pool());
  if (nb) activeZ = nb.z;
  render();
}
function cancelFill() { activeZ = null; setBuffer(""); fillInput.blur(); render(); }
function reveal() { revealed = true; activeZ = null; setBuffer(""); fillInput.blur(); render(); }
function reset() { earned = new Set(); revealed = false; activeZ = null; setBuffer(""); misses = 0; fillInput.blur(); render(); }

// ── Quiz state ──
let qDir = "toName"; // "toName" (symbol → name) | "toSymbol" (name → symbol)
let qQueue = [];
let qTotal = 0;
let qInput = "";
let qChecked = false;
let qCorrect = false;
let qNamed = 0;
let qMissed = new Set();

function startQuiz() {
  qQueue = buildQuizRound(QUIZ_SIZE, Math.random, pool());
  qTotal = qQueue.length; qNamed = 0; qMissed = new Set();
  loadQuiz();
}
function loadQuiz() { qInput = ""; qChecked = false; qCorrect = false; render(); }
function quizCheck() {
  if (qChecked || !qInput.trim()) return;
  const el = elByZ(qQueue[0]);
  qCorrect = gradeQuiz(el, qDir, qInput, gradeOpts);
  qChecked = true;
  if (qCorrect) qNamed += 1; else qMissed.add(el.z);
  render();
}
function quizNext() { qQueue = requeue(qQueue, qCorrect); qQueue.length ? loadQuiz() : render(); }
function setDir(d) { if (d !== qDir) { qDir = d; startQuiz(); } }
function setMode(m) {
  mode = m;
  if (m === "quiz" && qQueue.length === 0 && qMissed.size === 0 && qNamed === 0) startQuiz();
  else render();
}
function setScope(i) {
  if (i === scopeIndex) return;
  scopeIndex = i;
  activeZ = null; setBuffer(""); fillInput.blur();
  revealed = false; // a new bubble starts un-revealed: cells you earned persist, but any answers
                    // you only peeked at (Reveal all) go back to empty. Reset alone clears earned.
  if (mode === "quiz") startQuiz(); // fresh round in the new scope
  else render(); // fill keeps earned progress; just re-scope the board
}

// ── input handling ──
// Typing lands in fillInput whenever a cell is active (activate() focuses it). Its "input"
// event is the source of truth for text; the document listener below only covers keys
// pressed while it isn't focused, and skips its bubbled events so nothing runs twice.
const ARROWS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
fillInput.addEventListener("input", () => {
  if (mode !== "fill" || activeZ == null) { fillInput.value = ""; return; }
  setBuffer(fillInput.value.replace(/[^a-zA-Z]/g, "").slice(0, 3));
  render();
});
fillInput.addEventListener("beforeinput", (e) => {
  // some mobile keyboards send Go/Enter as insertLineBreak instead of a keydown
  if (mode === "fill" && e.inputType === "insertLineBreak") { e.preventDefault(); submit(); }
});
fillInput.addEventListener("keydown", (e) => {
  if (mode !== "fill") return;
  if (e.key in ARROWS) { e.preventDefault(); return arrow(ARROWS[e.key]); }
  if (e.key === "Enter") { e.preventDefault(); submit(); }
  else if (e.key === "Escape") { e.preventDefault(); cancelFill(); }
  // letters/Backspace: native editing, synced by the "input" listener above
});
document.addEventListener("keydown", (e) => {
  if (mode !== "fill" || e.target === fillInput) return; // quiz has its own input; fillInput events already handled
  if (e.key in ARROWS) { e.preventDefault(); return arrow(ARROWS[e.key]); }
  if (activeZ == null) return;
  if (e.key === "Enter") { e.preventDefault(); submit(); }
  else if (e.key === "Backspace") { e.preventDefault(); setBuffer(buffer.slice(0, -1)); render(); }
  else if (e.key === "Escape") { e.preventDefault(); cancelFill(); }
  else if (/^[a-zA-Z]$/.test(e.key) && buffer.length < 3) { e.preventDefault(); setBuffer(buffer + e.key); render(); }
});

root.addEventListener("click", (e) => {
  const mt = e.target.closest(".mode-tab"); if (mt) return setMode(mt.dataset.mode);
  const st = e.target.closest(".scope-tab"); if (st) return setScope(Number(st.dataset.scope));
  if (mode === "fill") {
    const c = e.target.closest(".cell"); if (c && !c.classList.contains("context")) return activate(Number(c.dataset.z));
    if (e.target.closest("#revealBtn")) return reveal();
    if (e.target.closest("#resetBtn")) return reset();
  } else {
    const dt = e.target.closest(".qdir-choice"); if (dt) return setDir(dt.dataset.dir);
    if (e.target.closest("#qCheckBtn")) return quizCheck();
    if (e.target.closest("#qNextBtn")) return quizNext();
    if (e.target.closest("#qAgainBtn")) return startQuiz();
  }
});

// ── rendering ──
function modeTabs() {
  const tab = (m, label) => `<button class="mode-tab${mode === m ? " is-active" : ""}" data-mode="${m}" type="button">${label}</button>`;
  return `<div class="mode-tabs">${tab("fill", t("mode_fill"))}${tab("quiz", t("mode_quiz"))}</div>`;
}

function scopeTabs() {
  const tab = (s) => {
    const i = SCOPES.indexOf(s);
    return `<button class="scope-tab${i === scopeIndex ? " is-active" : ""}" data-scope="${i}" type="button">${t("scope." + s.id)}</button>`;
  };
  const row = (g) => {
    const inGroup = SCOPES.filter((s) => s.group === g.id);
    if (!inGroup.length) return "";
    return `<div class="scope-row"><span class="scope-label">${t("group." + g.id)}</span><div class="scope-tabs">${inGroup.map(tab).join("")}</div></div>`;
  };
  return `<div class="scope-groups">${SCOPE_GROUPS.map(row).join("")}</div>`;
}

function cellHtml(el, live = true) {
  const isEarned = earned.has(el.symbol);
  const pos = `grid-row:${el.row + 1};grid-column:${el.col + 1}`;
  const fblock = el.row >= 8 ? " fblock" : "";
  // Out-of-family context cell: dimmed, not interactive. Shows its symbol only if already earned
  // elsewhere, so the player still sees the rest of their filled-in table while focused on a family.
  if (!live) {
    const main = isEarned ? `<span class="sym">${el.symbol}</span>` : "";
    return `<div class="cell context type-${el.type}${fblock}" style="${pos}"><span class="z">${el.z}</span>${main}</div>`;
  }
  const show = isEarned || revealed;
  const isActive = activeZ === el.z;
  let cls = `cell type-${el.type}`;
  if (isEarned) cls += " earned"; else if (revealed) cls += " revealed";
  if (isActive) cls += " active";
  cls += fblock;
  let main = "";
  if (show) main = `<span class="sym">${el.symbol}</span>`;
  else if (isActive) main = `<span class="sym typing">${buffer}<i class="caret"></i></span>`;
  return `<div class="${cls}" data-z="${el.z}" style="${pos}"><span class="z">${el.z}</span>${main}</div>`;
}

function fillView() {
  const poolEls = pool();
  const poolSyms = new Set(poolEls.map((e) => e.symbol));
  const target = poolEls.length;
  const got = [...earned].filter((s) => poolSyms.has(s)).length;
  const done = got === target;
  const family = isFamilyScope(scope());
  const scopeLabel = t("scope." + scope().id);
  const caption = family ? `<span class="scope-caption">${scopeLabel}</span>` : "";
  const status = done
    ? `<p class="pt-status ok">${t("status_done", { n: target, misses })}</p>`
    : revealed
      ? `<p class="pt-status">${t("status_revealed", { got, n: target })}</p>`
      : activeZ != null
        ? `<p class="pt-status">${t(TOUCH ? "status_filling_touch" : "status_filling_kbd", { z: activeZ })}</p>`
        : family
          ? `<p class="pt-status">${t(TOUCH ? "status_family_touch" : "status_family_kbd", { scope: scopeLabel.toLowerCase() })}</p>`
          : `<p class="pt-status">${t(TOUCH ? "status_any_touch" : "status_any_kbd")}</p>`;
  // Family scopes ghost the whole table for context; period scopes show just the in-scope prefix.
  const cells = family
    ? ELEMENTS.map((el) => cellHtml(el, poolSyms.has(el.symbol))).join("")
    : poolEls.map((el) => cellHtml(el, true)).join("");
  return `
    <div class="pt-head">
      <p class="count">${caption}<strong>${got}</strong> <span>/ ${target}</span></p>
      <div class="pt-actions">
        <button class="btn ghost" id="revealBtn" type="button" ${done ? "disabled" : ""}>${t("reveal_all")}</button>
        <button class="btn ghost" id="resetBtn" type="button">${t("reset")}</button>
      </div>
    </div>
    ${status}
    <div class="ptwrap"><div class="ptgrid">${cells}</div></div>`;
}

function dirTabs() {
  const tab = (d, label) => `<button class="qdir-choice${qDir === d ? " is-active" : ""}" data-dir="${d}" type="button">${label}</button>`;
  return `<div class="qdir">${tab("toName", t("dir_toName"))}${tab("toSymbol", t("dir_toSymbol"))}</div>`;
}

function quizView() {
  if (qQueue.length === 0) {
    const missed = [...qMissed].map((z) => elByZ(z));
    const missedBlock = missed.length
      ? `<div class="q-missed"><p class="missed-label">${t("missed_label", { n: missed.length })}</p>
          <div class="chips">${missed.map((e) => `<span class="chip">${e.symbol} · ${nameOf(e)}</span>`).join("")}</div></div>`
      : `<p class="pt-status ok">${t("clean_round", { n: qTotal })}</p>`;
    return `${dirTabs()}<p class="q-done">${t(qDir === "toName" ? "round_done_toName" : "round_done_toSymbol", { n: qTotal })}</p>${missedBlock}
      <div class="controls"><button class="action primary" id="qAgainBtn" type="button">${t("new_round")}</button></div>`;
  }
  const el = elByZ(qQueue[0]);
  const remaining = qQueue.length;
  const prompt = qDir === "toName"
    ? `<div class="q-prompt"><span class="q-z">#${el.z}</span><span class="q-sym type-${el.type}">${el.symbol}</span></div><p class="q-ask">${t("ask_name")}</p>`
    : `<div class="q-prompt"><span class="q-word">${nameOf(el)}</span></div><p class="q-ask">${t("ask_symbol")}</p>`;
  const answer = qChecked
    ? `<div class="q-answer ${qCorrect ? "ok" : "no"}">${qInput || "—"}</div>`
    : `<input class="q-input" id="quizInput" type="text" autocomplete="off" autocapitalize="${qDir === "toSymbol" ? "characters" : "none"}" spellcheck="false" placeholder="${qDir === "toName" ? t("ph_name") : t("ph_symbol")}" value="${esc(qInput)}">`;
  let feedback = `<p class="feedback">&nbsp;</p>`, reveal = "";
  if (qChecked) {
    feedback = qCorrect ? `<p class="feedback ok">${t("correct")}</p>` : `<p class="feedback no">${t("not_quite")}</p>`;
    reveal = `<p class="q-reveal"><strong>${el.symbol}</strong> — ${nameOf(el)} <span class="q-revz">(#${el.z})</span></p>`;
  }
  return `${dirTabs()}
    ${prompt}
    <div class="q-answer-row">${answer}</div>
    ${reveal}
    ${feedback}
    <div class="controls">
      <p class="score">${t("score", { got: qNamed, total: qTotal, left: remaining })}</p>
      ${qChecked
        ? `<button class="action primary" id="qNextBtn" type="button">${qQueue.length > 1 || !qCorrect ? t("next") : t("finish")}</button>`
        : `<button class="action primary" id="qCheckBtn" type="button" ${qInput.trim() ? "" : "disabled"}>${t("check")}</button>`}
    </div>`;
}

function render() {
  root.innerHTML = modeTabs() + scopeTabs() + (mode === "fill" ? fillView() : quizView());
  if (mode === "fill" && activeZ != null) {
    // the board is wider than a phone screen; keep the square being filled on-screen
    root.querySelector(".cell.active")?.scrollIntoView({ block: "nearest", inline: "center" });
  }
  if (mode === "quiz") {
    const inp = root.querySelector("#quizInput");
    if (inp) {
      inp.addEventListener("input", () => { qInput = inp.value; const b = root.querySelector("#qCheckBtn"); if (b) b.disabled = !qInput.trim(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); qChecked ? quizNext() : quizCheck(); } });
      inp.focus();
    }
    const nb = root.querySelector("#qNextBtn"); if (nb) nb.focus();
  }
}

render();
