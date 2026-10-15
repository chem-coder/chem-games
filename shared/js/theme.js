// Chem Games — the student's chosen look. Applied as html[data-theme] from localStorage
// "cg-theme"; shared/css/themes.css carries the token overrides. Default: "autumn" (the
// token set in tokens.css).
export const THEMES = ["autumn", "jewel", "villainess"];
const KEY = "cg-theme";

export function getTheme() {
  try { const t = localStorage.getItem(KEY); if (THEMES.includes(t)) return t; } catch { /* blocked */ }
  return "autumn";
}

export function applyTheme(theme = getTheme()) {
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  try { localStorage.setItem(KEY, theme); } catch { /* blocked */ }
  applyTheme(theme);
}
