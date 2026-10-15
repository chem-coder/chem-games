import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyProgress, completeLevel, seeStoryboard, pointsOf, levelsDone, skillState, loadProgress, saveProgress } from "./progress.js";

const SK = {
  charges: { id: "charges", levels: 0, storyboard: "plus-minus", unlock: 1 },
  atom: { id: "atom", levels: 3, unlock: 2, requires: [{ skill: "charges" }] },
  pt: { id: "pt", levels: 2, requires: [{ skill: "atom", points: 2 }] }
};

test("storyboard awards one point once", () => {
  const p = emptyProgress();
  seeStoryboard(p, "plus-minus", "charges");
  seeStoryboard(p, "plus-minus", "charges");
  assert.equal(pointsOf(p, "charges"), 1);
});

test("level completion: 1 point, clean upgrades to 2, never double-counts", () => {
  const p = emptyProgress();
  completeLevel(p, "atom", 0);
  assert.equal(pointsOf(p, "atom"), 1);
  completeLevel(p, "atom", 0, { clean: true });
  assert.equal(pointsOf(p, "atom"), 2);
  completeLevel(p, "atom", 0);
  assert.equal(pointsOf(p, "atom"), 2);
  assert.equal(levelsDone(p, "atom"), 1);
});

test("gating in campaign mode, everything open in free mode", () => {
  const p = emptyProgress(); p.mode = "campaign";
  assert.equal(skillState(p, SK.charges, SK), "open");
  assert.equal(skillState(p, SK.atom, SK), "locked");
  seeStoryboard(p, "plus-minus", "charges");
  assert.equal(skillState(p, SK.charges, SK), "progress");
  assert.equal(skillState(p, SK.atom, SK), "open");
  assert.equal(skillState(p, SK.pt, SK), "locked");
  completeLevel(p, "atom", 0, { clean: true });
  assert.equal(skillState(p, SK.pt, SK), "open");
  completeLevel(p, "atom", 1); completeLevel(p, "atom", 2);
  assert.equal(skillState(p, SK.atom, SK), "mastered");
  const f = emptyProgress(); f.mode = "free";
  assert.equal(skillState(f, SK.pt, SK), "open");
});

test("load and save round-trip through a store", () => {
  const mem = new Map();
  const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const p = emptyProgress(); p.mode = "campaign"; completeLevel(p, "atom", 0);
  saveProgress(p, store);
  const q = loadProgress(store);
  assert.equal(q.mode, "campaign");
  assert.equal(pointsOf(q, "atom"), 1);
});
