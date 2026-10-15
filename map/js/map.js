// Chem Games — the game shell: entry (campaign or master by skill), the storyboards, the
// skills map with its side panel, and settings (look, music, sound, language, mode).
import { detectLang, makeT, setLang, hasLangChoice, LANGS } from "../../shared/js/i18n.js?v=20261016-3";
import { THEMES, getTheme, setTheme, applyTheme } from "../../shared/js/theme.js";
import { loadProgress, saveProgress, seeStoryboard, skillState, levelsDone, pointsOf, emptyProgress } from "../../shared/js/progress.js";
import { SKILLS, SKILLS_BY_ID, SYMBOLS } from "../data/skills.js";
import { STORYBOARDS } from "../data/storyboards.js";
import { mountAnimation } from "./storyboard.js";
import en from "../locale/en.js";
import ru from "../locale/ru.js";

const lang = detectLang();
const L = { en, ru };
const t = makeT(L, lang);
const skillName = (id) => L[lang]?.skills?.[id] ?? en.skills[id] ?? id;
document.documentElement.lang = lang;
document.title = t("title");
applyTheme(getTheme() === "autumn" && !localStorage.getItem("cg-theme") ? "jewel" : getTheme());

const app = document.querySelector("#app");
let progress = loadProgress();
let selected = null;
let stopAnim = null;
const AUDIO_KEY = "cg-audio";
const audio = (() => { try { return JSON.parse(localStorage.getItem(AUDIO_KEY)) || { music: false, sound: true }; } catch { return { music: false, sound: true }; } })();
const saveAudio = () => { try { localStorage.setItem(AUDIO_KEY, JSON.stringify(audio)); } catch { /* ignore */ } };

const GEAR = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`;

function stop() { if (stopAnim) { stopAnim(); stopAnim = null; } }

// ---- language choice (the very first screen for a new visitor) ------------------------
const LANG_NAMES = { en: "English", ru: "Русский" };
function showLanguage() {
  stop();
  app.innerHTML = `<div class="entry"><div class="entry-card">
    <h1 class="brand-title">Chem Games<span class="tm">™</span></h1>
    <div class="modes lang-modes">${LANGS.map((l) => `<button type="button" class="mode lang-pick" data-lang="${l}"><h2>${LANG_NAMES[l]}</h2></button>`).join("")}</div>
    <p class="entry-foot">© 2026 Dalia M.</p>
  </div></div>`;
  app.querySelectorAll(".lang-pick").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
}

// ---- entry --------------------------------------------------------------------------
function showEntry() {
  stop();
  app.innerHTML = `<div class="entry"><div class="entry-card">
    <h1 class="brand-title">${t("entry_h1")}<span class="tm">™</span></h1>
    <p class="lede">${t("entry_lede")}</p>
    <div class="modes">
      <button type="button" class="mode" data-mode="campaign"><h2>${t("mode_campaign")}</h2><p>${t("mode_campaign_desc")}</p></button>
      <button type="button" class="mode" data-mode="free"><h2>${t("mode_free")}</h2><p>${t("mode_free_desc")}</p></button>
    </div>
    <p class="entry-foot"><a href="../">${t("library")}</a></p>
  </div></div>`;
  app.querySelectorAll(".mode").forEach((b) => b.addEventListener("click", () => {
    progress.mode = b.dataset.mode;
    saveProgress(progress);
    // Campaign always opens with the storyboard; replaying it never double-counts the point.
    if (progress.mode === "campaign") showStoryboard("plus-minus");
    else showMap();
  }));
}

// ---- storyboard ---------------------------------------------------------------------
function showStoryboard(id, after = showMap) {
  stop();
  const sb = STORYBOARDS[id];
  let i = 0;
  app.innerHTML = `<div class="story"><div class="story-card">
    <div class="story-stage" id="stage"></div>
    <p class="story-text" id="storyText"></p>
    <div class="story-dots" id="dots">${sb.frames.map(() => "<span></span>").join("")}</div>
    <div class="story-nav">
      <button type="button" class="action ghost" id="skip">${t("skip")}</button>
      <button type="button" class="action" id="next"></button>
    </div>
  </div></div>`;
  const frame = () => {
    const f = sb.frames[i];
    stop();
    stopAnim = mountAnimation(app.querySelector("#stage"), f.anim);
    app.querySelector("#storyText").textContent = t(f.text);
    app.querySelectorAll("#dots span").forEach((d, k) => d.classList.toggle("is-on", k === i));
    const last = i === sb.frames.length - 1;
    app.querySelector("#next").textContent = last ? t(sb.next.label) : t("next");
  };
  const finish = () => {
    seeStoryboard(progress, id, sb.skill);
    saveProgress(progress);
  };
  app.querySelector("#next").addEventListener("click", () => {
    if (i < sb.frames.length - 1) { i++; frame(); return; }
    finish();
    location.href = sb.next.href + (lang === "en" ? "" : "?lang=" + lang);
  });
  app.querySelector("#skip").addEventListener("click", () => { finish(); after(); });
  frame();
}

// ---- map ----------------------------------------------------------------------------
const TILE = 112, GAP_X = 150, GAP_Y = 128, PAD = 20;
function tilePos(s) { return { x: PAD + s.col * GAP_X, y: PAD + s.row * GAP_Y }; }

function showMap() {
  stop();
  const cols = Math.max(...SKILLS.map((s) => s.col)) + 1, rows = Math.max(...SKILLS.map((s) => s.row)) + 1;
  const w = PAD * 2 + (cols - 1) * GAP_X + TILE, h = PAD * 2 + (rows - 1) * GAP_Y + TILE + 30;
  const edges = SKILLS.flatMap((s) => (s.requires || []).map((r) => {
    const a = tilePos(SKILLS_BY_ID[r.skill]), b = tilePos(s);
    const lit = skillState(progress, s, SKILLS_BY_ID) !== "locked";
    return `<line x1="${a.x + 56}" y1="${a.y + 38}" x2="${b.x + 56}" y2="${b.y + 38}" class="${lit ? "is-lit" : ""}"/>`;
  })).join("");
  const tiles = SKILLS.map((s) => {
    const st = skillState(progress, s, SKILLS_BY_ID);
    const { x, y } = tilePos(s);
    const done = levelsDone(progress, s.id);
    const lv = s.levels ? `${done}/${s.levels}` : (progress.storyboards[s.storyboard] ? "✓" : "·");
    return `<button type="button" class="tile is-${st}${selected === s.id ? " is-selected" : ""}" data-id="${s.id}" style="left:${x}px;top:${y}px" title="${skillName(s.id)}">
      <span class="tile-disc"><svg viewBox="0 0 40 40"><path d="${SYMBOLS[s.symbol] || ""}"/></svg><span class="tile-levels">${lv}</span></span>
      <span class="tile-name">${skillName(s.id)}</span></button>`;
  }).join("");
  app.innerHTML = `<div class="map-shell">
    <div class="map-bar"><button type="button" class="brand" id="toEntry" title="${t("entry_h1")}">${t("entry_h1")}</button><h1>${t("map_title")}</h1><span class="spacer"></span><a href="../${lang === "en" ? "" : "?lang=" + lang}">${t("library")}</a><button type="button" class="gear" id="gear" aria-label="${t("settings")}">${GEAR}</button></div>
    <div class="map-body">
      <div class="map-scroll"><div class="map-canvas" style="width:${w}px;height:${h}px"><svg class="edges" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${edges}</svg>${tiles}</div></div>
      <aside class="panel" id="panel"></aside>
    </div></div>`;
  app.querySelectorAll(".tile").forEach((b) => b.addEventListener("click", () => { selected = b.dataset.id; showMap(); }));
  app.querySelector("#gear").addEventListener("click", showSettings);
  app.querySelector("#toEntry").addEventListener("click", showEntry);
  renderPanel();
}

function renderPanel() {
  const panel = app.querySelector("#panel");
  if (!selected) { panel.innerHTML = `<p class="empty">${t("entry_lede")}</p>`; return; }
  const s = SKILLS_BY_ID[selected];
  const st = skillState(progress, s, SKILLS_BY_ID);
  const done = levelsDone(progress, s.id);
  const lv = progress.levels[s.id] || [];
  const needs = (s.requires || []).filter((r) => pointsOf(progress, r.skill) < (r.points ?? SKILLS_BY_ID[r.skill].unlock ?? 1)).map((r) => skillName(r.skill));
  const href = s.href ? s.href + (lang === "en" ? "" : "?lang=" + lang) : null;
  panel.innerHTML = `<h2>${skillName(s.id)}</h2>
    <p class="state is-${st}">${t(st === "progress" ? "open" : st)}</p>
    <p class="meta">${s.levels ? t("levels", { done, total: s.levels }) : t("storyboard_only")} · ${t("points", { n: pointsOf(progress, s.id) })}</p>
    ${s.levels ? `<div class="level-dots">${Array.from({ length: s.levels }, (_, i) => `<span class="level-dot${lv[i] === 2 ? " is-clean is-done" : lv[i] ? " is-done" : ""}">${i + 1}</span>`).join("")}</div>` : ""}
    ${st === "locked" && needs.length ? `<p class="meta">${t("needs", { list: needs.join(", ") })}</p>` : ""}
    ${s.storyboard ? `<button type="button" class="action ghost" id="watch">${t("watch")}</button>` : ""}
    ${href && st !== "locked" ? `<a class="action" href="${href}">${t("play")}</a>` : ""}
    ${!s.href && s.levels ? `<p class="meta">${t("not_built")}</p>` : ""}`;
  panel.querySelector("#watch")?.addEventListener("click", () => showStoryboard(s.storyboard, showMap));
}

// ---- settings -----------------------------------------------------------------------
function showSettings() {
  const theme = getTheme();
  const back = document.createElement("div");
  back.className = "modal-back";
  back.innerHTML = `<div class="modal" role="dialog" aria-label="${t("settings")}">
    <h2>${t("settings")}<button type="button" class="x" aria-label="${t("close")}">×</button></h2>
    <div class="setting"><label>${t("design")}</label><span class="seg" id="design">${THEMES.map((th) => `<button type="button" data-theme="${th}" class="${th === theme ? "is-on" : ""}"><span class="swatch" style="background:${{ autumn: "#1e7268", jewel: "#141235", villainess: "#c8102e" }[th]}"></span>${t("design_" + th)}</button>`).join("")}</span></div>
    <div class="setting"><label>${t("music")}</label><span class="seg" id="music"><button type="button" data-v="1" class="${audio.music ? "is-on" : ""}">♪ ${t("on")}</button><button type="button" data-v="0" class="${audio.music ? "" : "is-on"}">${t("off")}</button></span></div>
    <div class="setting"><label>${t("sound")}</label><span class="seg" id="sound"><button type="button" data-v="1" class="${audio.sound ? "is-on" : ""}">🔊 ${t("on")}</button><button type="button" data-v="0" class="${audio.sound ? "" : "is-on"}">${t("off")}</button></span></div>
    <div class="setting"><label>${t("language")}</label><span class="seg" id="langSeg">${LANGS.map((l) => `<button type="button" data-lang="${l}" class="${l === lang ? "is-on" : ""}">${l.toUpperCase()}</button>`).join("")}</span></div>
    <div class="setting"><label>${t("mode")}</label><span class="seg" id="modeSeg"><button type="button" data-mode="campaign" class="${progress.mode === "campaign" ? "is-on" : ""}">${t("mode_campaign")}</button><button type="button" data-mode="free" class="${progress.mode === "free" ? "is-on" : ""}">${t("mode_free")}</button></span></div>
    <div class="setting"><label></label><button type="button" class="danger-link" id="resetProgress">${t("reset_progress")}</button></div>
  </div>`;
  document.body.appendChild(back);
  const close = () => back.remove();
  back.querySelector(".x").addEventListener("click", close);
  back.addEventListener("click", (e) => { if (e.target === back) close(); });
  back.querySelectorAll("#design button").forEach((b) => b.addEventListener("click", () => { setTheme(b.dataset.theme); back.querySelectorAll("#design button").forEach((x) => x.classList.toggle("is-on", x === b)); }));
  const seg = (id, key) => back.querySelectorAll(`#${id} button`).forEach((b) => b.addEventListener("click", () => { audio[key] = b.dataset.v === "1"; saveAudio(); back.querySelectorAll(`#${id} button`).forEach((x) => x.classList.toggle("is-on", x === b)); }));
  seg("music", "music"); seg("sound", "sound");
  back.querySelectorAll("#langSeg button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  back.querySelectorAll("#modeSeg button").forEach((b) => b.addEventListener("click", () => { progress.mode = b.dataset.mode; saveProgress(progress); close(); showMap(); }));
  // Reset = start over as a new visitor: progress gone, language forgotten, first screen again.
  back.querySelector("#resetProgress").addEventListener("click", () => {
    if (!confirm(t("reset_progress") + "?")) return;
    progress = emptyProgress(); saveProgress(progress); selected = null;
    try { localStorage.removeItem("cg-lang"); } catch { /* ignore */ }
    location.href = location.pathname;
  });
}

if (!hasLangChoice()) showLanguage();
else if (!progress.mode) showEntry();
else showMap();
