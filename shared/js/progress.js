// Chem Games — the student's progress on the skills map. Pure functions over a plain
// object so it can be tested; the store is localStorage "cg-progress" in the browser.
//
// progress = { mode: "campaign" | "free" | null, levels: { skillId: [true, false, …] },
//              storyboards: { id: true }, points: { skillId: n } }
const KEY = "cg-progress";

export function emptyProgress() {
  return { mode: null, levels: {}, storyboards: {}, points: {} };
}

export function loadProgress(store) {
  const st = store ?? (typeof localStorage !== "undefined" ? localStorage : null);
  try {
    const raw = st?.getItem(KEY);
    if (raw) return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return emptyProgress();
}

export function saveProgress(p, store) {
  const st = store ?? (typeof localStorage !== "undefined" ? localStorage : null);
  try { st?.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
  return p;
}

// Finishing a level is worth 1 point; finishing it without hints is worth 2 (once).
export function completeLevel(p, skillId, levelIndex, { clean = false } = {}) {
  const levels = (p.levels[skillId] ||= []);
  const already = levels[levelIndex] || 0;
  const value = clean ? 2 : 1;
  if (value > already) {
    p.points[skillId] = (p.points[skillId] || 0) + (value - already);
    levels[levelIndex] = value;
  }
  return p;
}

export function seeStoryboard(p, id, skillId) {
  if (!p.storyboards[id]) {
    p.storyboards[id] = true;
    if (skillId) p.points[skillId] = (p.points[skillId] || 0) + 1;
  }
  return p;
}

export function pointsOf(p, skillId) {
  return p.points[skillId] || 0;
}

export function levelsDone(p, skillId) {
  return (p.levels[skillId] || []).filter(Boolean).length;
}

// A skill is open when every prerequisite has reached its unlock threshold, or when the
// student plays in free mode. Mastered: every level done.
export function skillState(p, skill, skillsById, mode = p.mode) {
  const done = levelsDone(p, skill.id);
  if (skill.levels > 0 && done >= skill.levels) return "mastered";
  if (done > 0 || (skill.levels === 0 && p.storyboards[skill.storyboard])) return "progress";
  if (mode === "free") return "open";
  const ok = (skill.requires || []).every((req) => {
    const pre = skillsById[req.skill];
    return pre && pointsOf(p, req.skill) >= (req.points ?? pre.unlock ?? 1);
  });
  return ok ? "open" : "locked";
}
