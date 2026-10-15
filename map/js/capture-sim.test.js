import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate } from "./capture-sim.js";

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// The storyboard's round generator, duplicated here so the test covers what the screen does.
export function round(n) {
  const rnd = mulberry32(n * 15485863 + 11);
  const A = { x: 115 + rnd() * 30, y: 95 + rnd() * 50, vx: (rnd() - 0.5) * 14, vy: (rnd() - 0.5) * 14 };
  const B = { x: 335 + rnd() * 30, y: 95 + rnd() * 50, vx: (rnd() - 0.5) * 14, vy: (rnd() - 0.5) * 14 };
  const nearA = rnd() < 0.5;
  const near = nearA ? A : B, far = nearA ? B : A;
  const f = 0.3 + rnd() * 0.1;
  const px = near.x + (far.x - near.x) * f, py = near.y + (far.y - near.y) * f + (rnd() - 0.5) * 40;
  const ang = rnd() * Math.PI * 2;
  const ex = px + 380 * Math.cos(ang), ey = py + 380 * Math.sin(ang);
  const speed = 150 + rnd() * 60;
  const L = Math.hypot(px - ex, py - ey);
  return { pluses: [A, B], x: ex, y: ey, vx: ((px - ex) / L) * speed, vy: ((py - ey) / L) * speed, nearIndex: nearA ? 0 : 1 };
}

test("every round is captured within a few seconds", () => {
  let late = 0, none = 0;
  for (let n = 0; n < 300; n++) {
    const r = simulate(round(n), 9);
    if (!r) none++; else if (r.t > 6) late++;
  }
  assert.equal(none, 0, "rounds with no capture");
  assert.ok(late <= 3, `rounds captured later than 6 s: ${late}`);
});

test("enough rounds have the nearer plus winning quickly for the screen to pick from", () => {
  let good = 0;
  for (let n = 0; n < 300; n++) {
    const init = round(n);
    const r = simulate(init, 6);
    if (r && r.t <= 4.5 && r.plus === init.nearIndex) good++;
  }
  assert.ok(good >= 90, `only ${good} of 300 rounds usable`);
});

test("single-plus fly-bys are caught quickly with the storyboard's damping", () => {
  let good = 0;
  for (let n = 0; n < 200; n++) {
    const rnd = mulberry32(n * 2654435 + 3);
    const plus = { x: 200 + (rnd() - 0.5) * 60, y: 120 + (rnd() - 0.5) * 50, vx: (rnd() - 0.5) * 14, vy: (rnd() - 0.5) * 14 };
    const ang = rnd() * Math.PI * 2, off = (rnd() < 0.5 ? -1 : 1) * (60 + rnd() * 70);
    const aimx = plus.x + off * Math.cos(ang + Math.PI / 2), aimy = plus.y + off * Math.sin(ang + Math.PI / 2);
    const ex = aimx + 380 * Math.cos(ang), ey = aimy + 380 * Math.sin(ang);
    const speed = 150 + rnd() * 70, L = Math.hypot(aimx - ex, aimy - ey);
    const r = simulate({ pluses: [plus], x: ex, y: ey, vx: ((aimx - ex) / L) * speed, vy: ((aimy - ey) / L) * speed }, 6, 1 / 120, { damp: 0.9 });
    if (r && r.t <= 4.5) good++;
  }
  assert.ok(good >= 100, `only ${good} of 200 fly-bys caught in time`);
});
