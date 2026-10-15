// Renderer prototype page: two panels (default Mg and Mg2+), a species picker each,
// Reveal / back toggles.
import { detectLang, makeT, applyStatic, elementName } from "../../shared/js/i18n.js";
import { ELEMENTS } from "../../periodic-table/memorizer/data/pt-data.js";
import { NAMES_RU } from "../../periodic-table/memorizer/data/pt-names.ru.js";
import { createAtomRenderer } from "./renderer.js";
import { neutronCount, electronCount, chargeLabel } from "./model.js";
import en from "../locale/en.js";
import ru from "../locale/ru.js";

const lang = detectLang();
const t = makeT({ en, ru }, lang);
document.documentElement.lang = lang;
applyStatic(t);

const byZ = Object.fromEntries(ELEMENTS.map((e) => [e.z, e]));
const SPECIES = [
  { z: 1, mass: 1, charge: 0 }, { z: 2, mass: 4, charge: 0 }, { z: 3, mass: 7, charge: 0 }, { z: 3, mass: 7, charge: 1 },
  { z: 6, mass: 12, charge: 0 }, { z: 7, mass: 14, charge: -3 }, { z: 8, mass: 16, charge: 0 }, { z: 8, mass: 16, charge: -2 },
  { z: 9, mass: 19, charge: -1 }, { z: 10, mass: 20, charge: 0 }, { z: 11, mass: 23, charge: 0 }, { z: 11, mass: 23, charge: 1 },
  { z: 12, mass: 24, charge: 0 }, { z: 12, mass: 24, charge: 2 }, { z: 13, mass: 27, charge: 3 }, { z: 16, mass: 32, charge: -2 },
  { z: 17, mass: 35, charge: 0 }, { z: 17, mass: 35, charge: -1 }, { z: 18, mass: 40, charge: 0 }, { z: 19, mass: 39, charge: 1 },
  { z: 20, mass: 40, charge: 0 }, { z: 20, mass: 40, charge: 2 }, { z: 26, mass: 56, charge: 0 }
];

function symbolHtml(sp) {
  const el = byZ[sp.z];
  return `<sup>${sp.mass}</sup>${el.symbol}${sp.charge ? `<sup>${chargeLabel(sp.charge)}</sup>` : ""}`;
}
function optionText(sp) {
  const el = byZ[sp.z];
  const name = elementName(el, lang, NAMES_RU);
  return `${el.symbol}${chargeLabel(sp.charge)} — ${name}`;
}

const renderers = [];
function panel(initialIndex) {
  const sec = document.createElement("article");
  sec.className = "panel";
  sec.innerHTML = `
    <div class="panel-head">
      <label>${t("species")} <select></select></label>
      <span class="species-name"></span>
    </div>
    <div class="stage"></div>
    <ul class="counts"><li class="p"></li><li class="n"></li><li class="e"></li></ul>
    <div class="controls"><button type="button" class="action reveal"></button></div>`;
  const select = sec.querySelector("select");
  SPECIES.forEach((sp, i) => {
    const o = document.createElement("option");
    o.value = i; o.textContent = optionText(sp);
    select.appendChild(o);
  });
  select.value = initialIndex;
  const r = createAtomRenderer(sec.querySelector(".stage"));
  renderers.push(r);
  const btn = sec.querySelector(".reveal");
  const [lp, ln, le] = sec.querySelectorAll(".counts li");
  function show() {
    const sp = SPECIES[Number(select.value)];
    r.flatten();
    r.setSpecies(sp);
    sec.querySelector(".species-name").innerHTML = symbolHtml(sp);
    lp.innerHTML = `<b>${sp.z}</b> ${t("protons", { n: sp.z })}`;
    ln.innerHTML = `<b>${neutronCount(sp)}</b> ${t("neutrons", { n: neutronCount(sp) })}`;
    le.innerHTML = `<b>${electronCount(sp)}</b> ${t("electrons", { n: electronCount(sp) })}`;
    btn.textContent = t("reveal");
    btn.classList.remove("ghost");
  }
  select.addEventListener("change", show);
  btn.addEventListener("click", () => {
    if (r.revealed) { r.flatten(); btn.textContent = t("reveal"); btn.classList.remove("ghost"); }
    else { r.reveal(); btn.textContent = t("flatten"); btn.classList.add("ghost"); }
  });
  show();
  return sec;
}

const panels = document.querySelector("#panels");
panels.append(panel(SPECIES.findIndex((s) => s.z === 12 && s.charge === 0)), panel(SPECIES.findIndex((s) => s.z === 12 && s.charge === 2)));
