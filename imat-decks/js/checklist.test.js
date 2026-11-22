import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState, loadState, saveState, subKey, setDone, toggleLevel,
  doneCount, topicStatus, setTopicDone, totals,
} from "./checklist.js";
import { TOPICS } from "../data/topics.js";

const T = { id: "acids", subs: [{ id: "ph" }, { id: "poh" }, { id: "buffers" }] };
const U = { id: "gases", subs: [{ id: "ideal" }] };

const memoryStore = () => {
  const data = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
};

test("a subtopic can be checked and unchecked", () => {
  const s = emptyState();
  setDone(s, subKey(T, T.subs[0]), true);
  assert.equal(doneCount(s, T), 1);
  setDone(s, subKey(T, T.subs[0]), false);
  assert.equal(doneCount(s, T), 0);
  assert.deepEqual(s.done, {});
});

test("topic status follows its subtopics", () => {
  const s = emptyState();
  assert.equal(topicStatus(s, T), "none");
  setDone(s, subKey(T, T.subs[1]), true);
  assert.equal(topicStatus(s, T), "some");
  setTopicDone(s, T, true);
  assert.equal(topicStatus(s, T), "all");
  setTopicDone(s, T, false);
  assert.equal(topicStatus(s, T), "none");
});

test("checking a whole topic leaves other topics alone", () => {
  const s = emptyState();
  setTopicDone(s, T, true);
  assert.equal(topicStatus(s, U), "none");
  assert.deepEqual(totals(s, [T, U]), { total: 4, done: 3 });
});

test("comfort level: set, change, and clear by clicking it again", () => {
  const s = emptyState();
  toggleLevel(s, "acids", 1);
  assert.equal(s.level.acids, 1);
  toggleLevel(s, "acids", 3);
  assert.equal(s.level.acids, 3);
  toggleLevel(s, "acids", 3);
  assert.equal(s.level.acids, undefined);
});

test("topic and subtopic levels are separate", () => {
  const s = emptyState();
  toggleLevel(s, "acids", 3);
  toggleLevel(s, subKey(T, T.subs[2]), 1);
  assert.equal(s.level.acids, 3);
  assert.equal(s.level["acids/buffers"], 1);
});

test("marks survive a save and a load", () => {
  const store = memoryStore();
  const s = emptyState();
  setDone(s, "acids/ph", true);
  toggleLevel(s, "acids/ph", 2);
  saveState(s, store);
  assert.deepEqual(loadState(store), { done: { "acids/ph": true }, level: { "acids/ph": 2 } });
});

test("a broken or empty store gives an empty state", () => {
  assert.deepEqual(loadState(memoryStore()), emptyState());
  assert.deepEqual(loadState({ getItem: () => "{not json" }), emptyState());
});

test("topic data: 14 topics, ids unique, every topic has subtopics", () => {
  assert.equal(TOPICS.length, 14);
  assert.equal(new Set(TOPICS.map((t) => t.id)).size, TOPICS.length);
  for (const t of TOPICS) {
    assert.ok(t.subs.length > 0, t.name);
    assert.equal(new Set(t.subs.map((x) => x.id)).size, t.subs.length, t.name);
  }
});
