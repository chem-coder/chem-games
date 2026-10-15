// Home page renderer. The language is chosen here and only here: the toggle stores it
// (shared/js/i18n.js) and every card link carries ?lang= so the game opens in that
// language even when storage is blocked. Games read the language; they never offer a toggle.
import { detectLang, langToggleHtml, wireLangToggle } from "../shared/js/i18n.js";
import { SECTIONS } from "./cards.js";
import en from "./locale/en.js";
import ru from "./locale/ru.js";

const L = { en, ru };
const lang = detectLang();
const dict = L[lang] || en;
const pick = (sel) => sel(dict) ?? sel(en);

document.documentElement.lang = lang;
document.title = pick((d) => d.title);
document.querySelector("#eyebrow").innerHTML = pick((d) => d.eyebrow);
document.querySelector("#h1").innerHTML = pick((d) => d.h1);
document.querySelector("#footer").innerHTML = pick((d) => d.footer);
document.querySelector("#langToggle").innerHTML = langToggleHtml(lang);
wireLangToggle(document);

const href = (card) => {
  if (!card.href) return null;
  if (lang === "en") return card.href;
  return card.href + (card.href.includes("?") ? "&" : "?") + "lang=" + lang;
};

function cardHtml(card, index, layout) {
  const title = pick((d) => d.cards?.[card.id]?.title) ?? card.id;
  const desc = pick((d) => d.cards?.[card.id]?.desc) ?? "";
  const tags = [...card.tags];
  if (lang !== "en" && card.href && !card.ru && !card.placeholder) tags.push("english_only");
  const tagRow = tags.map((k) => `<span class="tag${k === "english_only" ? " tag-en" : ""}">${pick((d) => d.tags?.[k]) ?? k}</span>`).join("");
  const cls = ["card", card.featured ? "featured" : "", card.placeholder ? "placeholder" : ""].filter(Boolean).join(" ");
  const step = layout === "path" ? `<span class="step">${index + 1}</span>` : "";
  const inner = `${step}<h2>${title}</h2><p>${desc}</p><div class="tag-row">${tagRow}</div>`;
  const url = href(card);
  return url ? `<a class="${cls}" href="${url}">${inner}</a>` : `<div class="${cls}">${inner}</div>`;
}

const out = [];
for (const s of SECTIONS) {
  const heading = pick((d) => d.sections?.[s.id]?.heading) ?? s.id;
  const note = pick((d) => d.sections?.[s.id]?.note);
  out.push(`<h2 class="section-heading">${heading}</h2>`);
  if (note) out.push(`<p class="section-note">${note}</p>`);
  const cards = s.cards.map((c, i) => cardHtml(c, i, s.layout));
  const body = s.layout === "path" ? cards.join(`<span class="path-arrow" aria-hidden="true">&rarr;</span>`) : cards.join("");
  out.push(`<section class="${s.layout}" aria-label="${heading.replace(/&[a-z#0-9]+;/g, "")}">${body}</section>`);
}
document.querySelector("#sections").innerHTML = out.join("");
