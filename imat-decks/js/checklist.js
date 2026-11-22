// Topic checklist — the student's marks. Pure functions over a plain object so they
// can be tested; the store is localStorage "cg-imat-topic-checklist" in the browser.
//
// state = { done: { "topic/sub": true }, level: { "topic" | "topic/sub": 1 | 2 | 3 } }
// Levels: 1 = not comfortable at all (red), 2 = somewhat comfortable (yellow),
// 3 = very comfortable (green). No entry = not rated.
//
// Only subtopics carry a "done" mark. A topic counts as covered when every one of its
// subtopics is covered, so the two can never disagree.
const KEY = "cg-imat-topic-checklist";

export const LEVELS = [
  { level: 1, name: "Not comfortable at all" },
  { level: 2, name: "Somewhat comfortable" },
  { level: 3, name: "Very comfortable" },
];

export function emptyState() {
  return { done: {}, level: {} };
}

export function loadState(store) {
  const st = store ?? (typeof localStorage !== "undefined" ? localStorage : null);
  try {
    const raw = st?.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { done: { ...saved.done }, level: { ...saved.level } };
    }
  } catch { /* ignore */ }
  return emptyState();
}

export function saveState(state, store) {
  const st = store ?? (typeof localStorage !== "undefined" ? localStorage : null);
  try { st?.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  return state;
}

export const subKey = (topic, sub) => `${topic.id}/${sub.id}`;

export function setDone(state, key, on) {
  if (on) state.done[key] = true;
  else delete state.done[key];
  return state;
}

// Clicking the level that is already set clears it.
export function toggleLevel(state, key, level) {
  if (state.level[key] === level) delete state.level[key];
  else state.level[key] = level;
  return state;
}

export function doneCount(state, topic) {
  return topic.subs.filter((sub) => state.done[subKey(topic, sub)]).length;
}

// "all" | "some" | "none"
export function topicStatus(state, topic) {
  const n = doneCount(state, topic);
  if (n === 0) return "none";
  return n === topic.subs.length ? "all" : "some";
}

export function setTopicDone(state, topic, on) {
  for (const sub of topic.subs) setDone(state, subKey(topic, sub), on);
  return state;
}

export function totals(state, topics) {
  let total = 0, done = 0;
  for (const topic of topics) {
    total += topic.subs.length;
    done += doneCount(state, topic);
  }
  return { total, done };
}
