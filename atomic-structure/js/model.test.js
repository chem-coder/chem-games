import { test } from "node:test";
import assert from "node:assert/strict";
import { shellOccupancy, electronCount, neutronCount, chargeLabel, isIon } from "./model.js";

test("neutral atoms fill 2-8-8-2 up to Z = 20", () => {
  assert.deepEqual(shellOccupancy({ z: 1, mass: 1 }), [1, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 2, mass: 4 }), [2, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 12, mass: 24 }), [2, 8, 2, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 18, mass: 40 }), [2, 8, 8, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 19, mass: 39 }), [2, 8, 8, 1, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 20, mass: 40 }), [2, 8, 8, 2, 0, 0, 0]);
});

test("beyond Z = 20 the third shell keeps filling under the fourth", () => {
  assert.deepEqual(shellOccupancy({ z: 26, mass: 56 }), [2, 8, 14, 2, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 36, mass: 84 }), [2, 8, 18, 8, 0, 0, 0]);
});

test("cations lose electrons from the outermost shell", () => {
  assert.deepEqual(shellOccupancy({ z: 12, mass: 24, charge: 2 }), [2, 8, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 11, mass: 23, charge: 1 }), [2, 8, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 13, mass: 27, charge: 3 }), [2, 8, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 20, mass: 40, charge: 2 }), [2, 8, 8, 0, 0, 0, 0]);
});

test("anions gain electrons into the open shell", () => {
  assert.deepEqual(shellOccupancy({ z: 8, mass: 16, charge: -2 }), [2, 8, 0, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 17, mass: 35, charge: -1 }), [2, 8, 8, 0, 0, 0, 0]);
  assert.deepEqual(shellOccupancy({ z: 7, mass: 14, charge: -3 }), [2, 8, 0, 0, 0, 0, 0]);
});

test("counts and labels", () => {
  assert.equal(electronCount({ z: 12, charge: 2 }), 10);
  assert.equal(neutronCount({ z: 12, mass: 24 }), 12);
  assert.equal(chargeLabel(0), "");
  assert.equal(chargeLabel(1), "+");
  assert.equal(chargeLabel(-1), "−");
  assert.equal(chargeLabel(2), "2+");
  assert.equal(chargeLabel(-3), "3−");
  assert.equal(isIon({ z: 12, mass: 24 }), false);
  assert.equal(isIon({ z: 12, mass: 24, charge: 2 }), true);
});
