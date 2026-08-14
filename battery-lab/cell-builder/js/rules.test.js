/* node --test battery-lab/cell-builder/js/rules.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, briefCheck, isComplete } from "./rules.js";
import { BENCH } from "../data/bench.js";

const byId = new Map(BENCH.components.map((c) => [c.id, c]));
const ofKind = (k) => BENCH.components.filter((c) => c.kind === k);

test("roster integrity: ids unique, kinds known, cathode/anode potentials set", () => {
  const ids = new Set(BENCH.components.map((c) => c.id));
  assert.equal(ids.size, BENCH.components.length);
  for (const c of BENCH.components) {
    assert.ok(BENCH.kinds[c.kind], `${c.id} has unknown kind ${c.kind}`);
    if (c.kind === "cathode" || c.kind === "anode") {
      assert.equal(typeof c.v, "number", `${c.id} needs a potential`);
    }
  }
});

test("every diagnose case matches the engine's verdict and is complete", () => {
  for (const cs of BENCH.cases) {
    assert.ok(isComplete(cs.build), `${cs.id} build incomplete`);
    const r = evaluate(cs.build, byId);
    assert.equal(
      r.works,
      cs.expectWorks,
      `${cs.id}: card says ${cs.expectWorks ? "works" : "fails"} but engine says ${r.works ? "works" : "fails"} — ${JSON.stringify(r.findings)}`
    );
    // failing cases must explain themselves
    if (!cs.expectWorks) {
      assert.ok(r.findings.some((f) => f.level === "fail"), `${cs.id} fails without a reason`);
    }
  }
});

test("diagnose deck balance: both verdicts well represented", () => {
  const works = BENCH.cases.filter((c) => c.expectWorks).length;
  assert.ok(works >= 4 && BENCH.cases.length - works >= 4, "keep works/fails near balance so neither answer is safe to spam");
});

function* allBuilds() {
  for (const c of ofKind("cathode"))
    for (const a of ofKind("anode"))
      for (const s of ofKind("salt"))
        for (const cy of ofKind("cyclic"))
          for (const l of ofKind("linear"))
            for (const f of [null, ...ofKind("film")])
              yield { cathode: c.id, anode: a.id, salt: s.id, cyclic: cy.id, linear: l.id, film: f?.id ?? null };
}

test("every brief is solvable: a working build exists that meets it (brute force)", () => {
  for (const brief of BENCH.briefs) {
    let solutions = 0;
    for (const b of allBuilds()) {
      if (!evaluate(b, byId).works) continue;
      if (briefCheck(b, brief, byId).met) solutions += 1;
    }
    assert.ok(solutions > 0, `brief '${brief.id}' has no valid solution`);
    assert.ok(solutions > 1, `brief '${brief.id}' has exactly one solution — the engine, not answer-matching, should judge; give it room`);
  }
});

test("no brief is trivial: a working build exists that does NOT meet it", () => {
  for (const brief of BENCH.briefs) {
    let counter = 0;
    for (const b of allBuilds()) {
      if (evaluate(b, byId).works && !briefCheck(b, brief, byId).met) {
        counter += 1;
        break;
      }
    }
    assert.ok(counter > 0, `brief '${brief.id}' is met by every working build — it demands nothing`);
  }
});

test("spot rules: the classics behave", () => {
  const B = (o) => ({ film: null, ...o });
  // LP30 works
  assert.ok(evaluate(B({ cathode: "lfp", anode: "graphite", salt: "lipf6", cyclic: "ec", linear: "dmc" }), byId).works);
  // TFSI + high-V cathode fails, + LFP passes
  assert.ok(!evaluate(B({ cathode: "lco", anode: "graphite", salt: "litfsi", cyclic: "ec", linear: "dmc" }), byId).works);
  assert.ok(evaluate(B({ cathode: "lfp", anode: "graphite", salt: "litfsi", cyclic: "ec", linear: "dmc" }), byId).works);
  // PC/graphite fails naked, passes with VC film or LiBOB salt, and is fine on LTO
  assert.ok(!evaluate(B({ cathode: "lco", anode: "graphite", salt: "lipf6", cyclic: "pc", linear: "dec" }), byId).works);
  assert.ok(evaluate(B({ cathode: "lco", anode: "graphite", salt: "lipf6", cyclic: "pc", linear: "dec", film: "vc" }), byId).works);
  assert.ok(evaluate(B({ cathode: "lco", anode: "lto", salt: "lipf6", cyclic: "pc", linear: "dec" }), byId).works);
  // voltage arithmetic
  assert.equal(evaluate(B({ cathode: "lfp", anode: "lto", salt: "lipf6", cyclic: "ec", linear: "emc" }), byId).voltage, 1.85);
});
