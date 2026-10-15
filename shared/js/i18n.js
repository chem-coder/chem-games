// Chem Games — shared language plumbing. One codebase, per-game locale maps.
//
// Language resolution: ?lang=xx in the URL (and remember it) → remembered choice →
// "en". A dictionary value may be a string with {placeholders} or a function of the
// vars (for plural forms). Missing keys fall back to English, then to the key itself,
// so a half-translated game still renders.
export const LANGS = ["en", "ru"];
const STORE_KEY = "cg-lang";

export function detectLang(search, store) {
  const s = search ?? (typeof location !== "undefined" ? location.search : "");
  const st = store ?? (typeof localStorage !== "undefined" ? localStorage : null);
  const fromUrl = new URLSearchParams(s).get("lang");
  if (fromUrl && LANGS.includes(fromUrl)) {
    try { st?.setItem(STORE_KEY, fromUrl); } catch { /* storage may be blocked */ }
    return fromUrl;
  }
  try {
    const saved = st?.getItem(STORE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  return "en";
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  try { localStorage.setItem(STORE_KEY, lang); } catch { /* ignore */ }
  const u = new URL(location.href);
  u.searchParams.set("lang", lang);
  location.href = u.toString();
}

export function makeT(dicts, lang) {
  const pick = (key) => dicts[lang]?.[key] ?? dicts.en?.[key] ?? key;
  return (key, vars = {}) => {
    const v = pick(key);
    if (typeof v === "function") return v(vars);
    return String(v).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  };
}

// Russian plural forms: 1 ошибка · 2–4 ошибки · 5+ ошибок (and 11–14 → many).
export function pluralRu(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

// Element display name for a language. `names` maps atomic number → localized name.
export function elementName(el, lang, names) {
  return (lang !== "en" && names && names[el.z]) || el.name;
}

// Static page text: every [data-i18n="key"] element gets t(key) as innerHTML.
export function applyStatic(t, doc = document) {
  doc.querySelectorAll("[data-i18n]").forEach((n) => { n.innerHTML = t(n.dataset.i18n); });
  doc.querySelectorAll("[data-i18n-attr]").forEach((n) => {
    const [attr, key] = n.dataset.i18nAttr.split(":");
    n.setAttribute(attr, t(key));
  });
}

export function langToggleHtml(lang) {
  return `<span class="lang-toggle" role="group" aria-label="Language">${LANGS.map((l) =>
    `<button type="button" class="lang-btn${l === lang ? " is-active" : ""}" data-lang="${l}" aria-pressed="${l === lang}">${l.toUpperCase()}</button>`).join("")}</span>`;
}

export function wireLangToggle(root = document) {
  root.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
}
