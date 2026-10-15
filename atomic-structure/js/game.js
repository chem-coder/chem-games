// Atomic Structure — the exercise ladder. Tier 1: build an atom from Z and A.
// Board = the renderer in build mode. One gesture, one meaning: tap a dispenser or an
// energy level to add one particle there, tap a placed particle to remove it, hold to
// repeat. Shells enforce nothing; judged only on Check (Dalia's rulings).
import { detectLang, makeT, applyStatic, elementName } from "../../shared/js/i18n.js";
import { ELEMENTS } from "../../periodic-table/memorizer/data/pt-data.js";
import { NAMES_RU } from "../../periodic-table/memorizer/data/pt-names.ru.js";
import { createAtomRenderer } from "./renderer.js";
import { SHELLS, chargeLabel } from "./model.js";
import { judge, deal } from "./judge.js";
import { TIERS, DECK_SIZE } from "../data/rounds.js";
import en from "../locale/en.js";
import ru from "../locale/ru.js";

const lang = detectLang();
const t = makeT({ en, ru }, lang);
document.documentElement.lang = lang;
document.title = t("title");
applyStatic(t);

// Tier-specific copy: "build-ion:intro_h2" wins over "intro_h2" when the tier defines it.
const tk = (k, vars) => { const key = `${TIERS[state.tier].id}:${k}`; return key in en ? t(key, vars) : t(k, vars); };
const byZ = Object.fromEntries(ELEMENTS.map((e) => [e.z, e]));
// Element names are common nouns: lowercase mid-sentence in every language.
const nameOf = (sp) => elementName(byZ[sp.z], lang, NAMES_RU).toLowerCase();
const root = document.querySelector("#game");

const state = { tier: 0, deck: [], index: 0, solved: 0, hints: 0, checked: false, renderer: null };

// ---- screens -----------------------------------------------------------------------
function tabsHtml() {
  return `<div class="level-tabs">${TIERS.map((tier, i) =>
    `<button type="button" class="level-tab${i === state.tier ? " is-active" : ""}" data-tier="${i}" ${tier.soon ? "disabled" : ""}>${i + 1} · ${t("tier_" + tier.id)}${tier.soon ? ` <small>(${t("soon")})</small>` : ""}</button>`).join("")}</div>`;
}

function showIntro() {
  root.innerHTML = `${tabsHtml()}
    <div class="intro-card">
      <h2>${tk("intro_h2")}</h2>
      <p class="intro-lede">${tk("intro_p1")}</p>
      <ol class="steps">
        <li><span class="step-num">1</span><span class="step-text">${tk("intro_s1")}</span></li>
        <li><span class="step-num">2</span><span class="step-text">${tk("intro_s2")}</span></li>
        <li><span class="step-num">3</span><span class="step-text">${tk("intro_s3")}</span></li>
        <li><span class="step-num">4</span><span class="step-text">${tk("intro_s4")}</span></li>
      </ol>
      <div class="controls"><button type="button" class="action primary" id="start">${tk("start", { n: DECK_SIZE })}</button></div>
    </div>`;
  wireTabs();
  root.querySelector("#start").addEventListener("click", startDeck);
}

function startDeck() {
  state.deck = deal(TIERS[state.tier].pool, DECK_SIZE);
  state.index = 0; state.solved = 0;
  showRound();
}

function nuclideHtml(sp) {
  const charge = sp.charge ? `<sup class="nuclide-charge">${chargeLabel(sp.charge)}</sup>` : "";
  return `<span class="nuclide"><span class="nuclide-nums"><sup>${sp.mass}</sup><sub>${sp.z}</sub></span><span class="nuclide-sym">${byZ[sp.z].symbol}</span>${charge}</span>`;
}

function showRound() {
  const sp = state.deck[state.index];
  state.hints = 0; state.checked = false;
  root.innerHTML = `${tabsHtml()}
    <p class="score">${t("score", { solved: state.solved, total: DECK_SIZE, left: DECK_SIZE - state.index })}</p>
    <div class="prompt">
      <p class="prompt-line">${tk("build_prompt", { name: nameOf(sp) })}</p>
      <p class="prompt-nums">${nuclideHtml(sp)} <span class="prompt-sep">·</span> <span>${t("atomic_number")} <b>${sp.z}</b></span> <span class="prompt-sep">·</span> <span>${t("mass_number")} <b>${sp.mass}</b></span>${sp.charge ? ` <span class="prompt-sep">·</span> <span>${t("charge")} <b>${Math.abs(sp.charge)}${sp.charge > 0 ? "+" : "−"}</b></span>` : ""}</p>
    </div>
    <div class="board">
      <div class="stage"></div>
      <div class="tray" aria-label="${t("tray")}">
        <button type="button" class="dispenser proton" data-kind="proton"><span class="disp-bubble"><span>+</span></span><span class="disp-label">${t("legend_p")}</span></button>
        <button type="button" class="dispenser neutron" data-kind="neutron"><span class="disp-bubble"></span><span class="disp-label">${t("legend_n")}</span></button>
        <div class="dispenser electron is-note"><span class="disp-bubble"><span>−</span></span><span class="disp-label">${t("legend_e")}</span><span class="disp-sub">${t("electron_note")}</span></div>
        <p class="tray-note">${t("tray_note")}</p>
      </div>
    </div>
    <ul class="counts"><li class="p"></li><li class="n"></li><li class="e"></li></ul>
    <p class="feedback" id="feedback"></p>
    <div class="hint-box" id="hintBox"></div>
    <div class="controls">
      <button type="button" class="action primary" id="check">${t("check")}</button>
      <button type="button" class="action ghost" id="hint">${t("hint")}</button>
      <button type="button" class="action ghost" id="reset">${t("reset")}</button>
    </div>`;
  wireTabs();
  const r = createAtomRenderer(root.querySelector(".stage"));
  state.renderer = r;
  r.setBuild({ p: 0, n: 0, shells: new Array(SHELLS).fill(0) }, sp.z * 1000 + sp.mass);
  updateCounts();
  wireTap();
  root.querySelector("#check").addEventListener("click", () => check(sp));
  root.querySelector("#hint").addEventListener("click", showHint);
  root.querySelector("#reset").addEventListener("click", () => { r.setBuild({ p: 0, n: 0, shells: new Array(SHELLS).fill(0) }); updateCounts(); });
}

function updateCounts() {
  const b = state.renderer.build;
  const [lp, ln, le] = root.querySelectorAll(".counts li");
  const e = b.shells.reduce((a, c) => a + c, 0);
  lp.innerHTML = `<b>${b.p}</b> ${t("protons", { n: b.p })}`;
  ln.innerHTML = `<b>${b.n}</b> ${t("neutrons", { n: b.n })}`;
  le.innerHTML = `<b>${e}</b> ${t("electrons", { n: e })}`;
}

const HINTS = ["hint_1", "hint_2", "hint_3", "hint_4"];
function showHint() {
  if (state.hints >= HINTS.length) return;
  const box = root.querySelector("#hintBox");
  const li = document.createElement("div");
  li.className = "hint";
  li.innerHTML = `<span class="step-num">${state.hints + 1}</span><span class="step-text">${tk(HINTS[state.hints])}</span>`;
  box.appendChild(li);
  state.hints++;
  if (state.hints >= HINTS.length) root.querySelector("#hint").disabled = true;
  else root.querySelector("#hint").textContent = t("hint_more");
}

function check(sp) {
  if (state.checked) return;
  const v = judge(state.renderer.build, sp);
  const fb = root.querySelector("#feedback");
  if (!v.ok) {
    const pr = v.problems[0];
    const key = pr.part === "shell" ? `wrong_shell_${pr.dir}` : `wrong_${pr.part}_${pr.dir}`;
    fb.className = "feedback is-wrong";
    fb.textContent = tk(key, { n: pr.shell });
    return;
  }
  state.checked = true;
  state.solved++;
  fb.className = "feedback is-right";
  fb.textContent = state.hints ? tk("ok_hints") : tk("ok_clean");
  state.renderer.reveal();
  const controls = root.querySelector(".controls");
  controls.innerHTML = `<button type="button" class="action primary" id="next">${state.index + 1 < DECK_SIZE ? t("next") : t("finish")}</button>`;
  controls.querySelector("#next").addEventListener("click", () => {
    state.index++;
    if (state.index < DECK_SIZE) showRound(); else showDone();
  });
}

function showDone() {
  root.innerHTML = `${tabsHtml()}
    <div class="intro-card">
      <h2>${t("done_h2", { tier: t("tier_" + TIERS[state.tier].id) })}</h2>
      <p class="done-line">${tk("done_line", { solved: state.solved, total: DECK_SIZE })}</p>
      <div class="controls two-up done-nav">
        ${TIERS[state.tier + 1] && !TIERS[state.tier + 1].soon ? `<button type="button" class="action primary" id="nextTier">${t("next_tier", { tier: t("tier_" + TIERS[state.tier + 1].id) })}</button>` : ""}
        <button type="button" class="action ${TIERS[state.tier + 1] && !TIERS[state.tier + 1].soon ? "ghost" : "primary"}" id="again">${t("replay")}</button>
        <button type="button" class="action ghost" id="revisit">${t("revisit")}</button>
      </div>
      <p class="home-line"><a href="../periodic-table/">${t("to_topic")}</a> · <a href="../">${t("to_home")}</a></p>
    </div>`;
  wireTabs();
  root.querySelector("#again").addEventListener("click", startDeck);
  root.querySelector("#revisit").addEventListener("click", showIntro);
  root.querySelector("#nextTier")?.addEventListener("click", () => { state.tier++; showIntro(); });
}

function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) => b.addEventListener("click", () => { state.tier = Number(b.dataset.tier); showIntro(); }));
}

// ---- tap to add, tap to remove, hold to repeat ---------------------------------------
function wireTap() {
  const r = state.renderer;
  const stage = root.querySelector(".stage");
  let timer = 0, interval = 0;

  function stopRepeat() { clearTimeout(timer); clearInterval(interval); timer = 0; interval = 0; }
  function repeat(action) {
    action();
    stopRepeat();
    timer = setTimeout(() => { interval = setInterval(action, 220); }, 420);
  }
  function add(kind, n) {
    const b = r.build;
    if (kind === "proton") b.p++;
    else if (kind === "neutron") b.n++;
    else b.shells[n - 1]++;
    r.setBuild(b);
    updateCounts();
    root.querySelector("#feedback").textContent = "";
  }
  function remove(g) {
    const b = r.build;
    const kind = g.dataset.kind;
    if (kind === "electron") b.shells[Number(g.dataset.n) - 1]--;
    else if (kind === "proton") b.p--;
    else b.n--;
    r.setBuild(b);
    updateCounts();
    root.querySelector("#feedback").textContent = "";
  }

  root.querySelectorAll("button.dispenser").forEach((d) => {
    d.addEventListener("pointerdown", (ev) => {
      if (state.checked) return;
      ev.preventDefault();
      repeat(() => add(d.dataset.kind));
    });
  });
  stage.addEventListener("pointerdown", (ev) => {
    if (state.checked) return;
    ev.preventDefault();
    const g = ev.target.closest?.(".bubble");
    if (g) { remove(g); return; }
    const q = r.toLocal(ev.clientX, ev.clientY);
    const zone = r.zoneAt(q.x, q.y);
    if (zone?.zone === "ring") repeat(() => add("electron", zone.n));
  });
  window.addEventListener("pointerup", stopRepeat);
  window.addEventListener("pointercancel", stopRepeat);
  stage.addEventListener("pointerleave", stopRepeat);
}

showIntro();
