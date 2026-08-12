// Shape Lab — from Lewis structures to 3D shapes. See documentation/BONDING_GAME_DESIGN.md.
// v0.1: the Geometries rung (visual table + rotating 3D popups). The other rungs are
// designed and stubbed — their intros say what's coming, and the tabs never dead-end.

import { GEOMETRIES, GEO_BY_ID, GEO_GROUPS, fmtFormula } from "./geometry.js";
import { makeSpinner } from "./render3d.js";

const root = document.getElementById("game");

const TIERS = [
  { id: "formal-charge", label: "Formal charge", built: false,
    blurb: "The bookkeeping skill: FC = valence e⁻ − (dots + sticks). Zero and ±1 are welcome, negative charges belong on the more electronegative atom, and ±2/±3 mean you've drawn something nature won't keep. Intro cards, click-through examples, and a practice quiz." },
  { id: "lewis", label: "Lewis structures", built: false,
    blurb: "Dalia's six steps, one card each — then a clickable table of examples (nitrate first, of course) where every molecule walks you through its own construction, brackets and charges included." },
  { id: "geometries", label: "Geometries", built: true },
  { id: "build", label: "Build molecules", built: false,
    blurb: "The Model Kit: pick atoms, watch their valence electrons settle at the compass points, drag dot to dot to bond, then Check — and a correct molecule snaps into 3D and slowly turns." },
  { id: "polarity", label: "Polarity", built: false,
    blurb: "Rotating molecules wrapped in semitransparent electron clouds, red→blue from the negative end to the positive one. See why CO₂ cancels and H₂O doesn't." },
];
let tierIndex = 2; // land on the built rung while the ladder fills in
const tier = () => TIERS[tierIndex];

let activeSpinners = [];
function stopSpinners() { activeSpinners.forEach((s) => s.stop()); activeSpinners = []; }

// ── navigation (house rules: tabs on every screen, no dead ends) ──
function tierTabs() {
  return `<div class="level-tabs" role="tablist">${TIERS.map((t, i) =>
    `<button class="level-tab${i === tierIndex ? " is-active" : ""}" data-tier="${i}" type="button" role="tab" aria-selected="${i === tierIndex}">${t.label}</button>`
  ).join("")}</div>`;
}
function wireTabs() {
  root.querySelectorAll(".level-tab").forEach((b) =>
    b.addEventListener("click", () => { tierIndex = Number(b.dataset.tier); render(); }));
}

function render() {
  stopSpinners();
  closeModal();
  if (tier().built) renderGeometries();
  else renderStub();
}

// ── stub intros for the designed-but-unbuilt rungs ──
function renderStub() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · ${tier().label}</p>
      <p class="intro-lede">${tier().blurb}</p>
      <p class="stub-note">This rung is designed and on the bench — see the Geometries tab for what's playable today.</p>
    </div>
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;
  wireTabs();
}

// ── the Geometries rung: the visual table ──
function geoCell(id) {
  const g = GEO_BY_ID[id];
  return `<button class="geo-cell" data-geo="${g.id}" type="button" aria-label="${g.name}, ${g.angle}">
    <canvas class="geo-thumb" width="120" height="110"></canvas>
    <span class="geo-name">${g.name}</span>
    <span class="geo-meta">${g.bonds} bond${g.bonds > 1 ? "s" : ""}${g.lonePairs ? ` · ${g.lonePairs} lone pair${g.lonePairs > 1 ? "s" : ""}` : ""}</span>
    <span class="geo-angle">${g.angle}</span>
  </button>`;
}

function renderGeometries() {
  root.innerHTML = `
    ${tierTabs()}
    <div class="intro">
      <p class="intro-eyebrow">Shape Lab · the geometry catalog</p>
      <p class="intro-lede">Count the <strong>electron density regions</strong> around the central atom — bonds of any order count once, lone pairs count once. The count picks the row; the lone pairs slide you rightward along it. <strong>Click any shape</strong> to see it turn in 3D with its angles and its quirks.</p>
    </div>
    ${GEO_GROUPS.map((grp) => `
      <div class="geo-group">
        <p class="geo-group-label">${grp.label}</p>
        <div class="geo-row">${grp.ids.map(geoCell).join("")}</div>
      </div>`).join("")}
    <p class="done-next"><a class="home-link" href="../">⌂ All Chem Games</a></p>`;

  wireTabs();
  root.querySelectorAll(".geo-cell").forEach((cell) => {
    const g = GEO_BY_ID[cell.dataset.geo];
    const spinner = makeSpinner(cell.querySelector(".geo-thumb"), g, { small: true, startAngle: 0.6 });
    spinner.drawFrame(0.6); // static pose in the table; motion is the popup's reward
    cell.addEventListener("click", () => openModal(g));
  });
}

// ── the popup: one geometry, big and turning ──
let modal = null;
function closeModal() {
  if (!modal) return;
  stopSpinners();
  modal.remove();
  modal = null;
  document.removeEventListener("keydown", onModalKey);
}
function onModalKey(e) { if (e.key === "Escape") closeModal(); }

function openModal(g) {
  closeModal();
  modal = document.createElement("div");
  modal.className = "geo-modal";
  modal.innerHTML = `
    <div class="geo-modal-card" role="dialog" aria-label="${g.name}">
      <button class="geo-close" type="button" aria-label="Close">✕</button>
      <canvas class="geo-stage" width="360" height="320"></canvas>
      <div class="geo-info">
        <h2>${g.name}</h2>
        <p class="geo-line"><strong>${g.regions} regions</strong> · ${g.bonds} bonding, ${g.lonePairs} lone pair${g.lonePairs === 1 ? "" : "s"} · electron geometry: <strong>${g.eGeo}</strong></p>
        <p class="geo-line">Bond angle${g.angle.includes("·") ? "s" : ""}: <strong>${g.angle}</strong></p>
        <ul class="geo-facts">${g.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
        <p class="geo-examples">Examples: ${g.examples.map((e) => `<span class="chip">${fmtFormula(e)}</span>`).join(" ")}</p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const spinner = makeSpinner(modal.querySelector(".geo-stage"), g, { startAngle: 0.4 });
  spinner.start();
  activeSpinners.push(spinner);

  modal.querySelector(".geo-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", onModalKey);
}

render();
