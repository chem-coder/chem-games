// Atomic Structure — the atom renderer. Vanilla JS + SVG, no framework.
//
// Visual language (Dalia's brief): particles are bubbles, not granite balls. Nucleons are
// soft, translucent, 3D-looking spheres stuck together (frog eggs / foam): a gooey SVG
// filter merges their outlines, a radial-gradient face gives each one depth, and a small
// spring model makes every bubble yield when the pointer presses on it. They never pop.
// Electrons are the same material, 4–5x smaller radius, strung on thin wire rings
// (the 7 shells, n = 1 … 7). Rings are rigid. After a correct answer, reveal() turns
// the rings into translucent onion-layer spheres and the electrons orbit their layer
// in 3D; the nucleus does not change.
import { shellOccupancy, neutronCount, SHELLS } from "./model.js";

const NS = "http://www.w3.org/2000/svg";
const SIZE = 480;
const C = SIZE / 2;
const RING_7 = 222;
let ring1 = 64; // grows with the nucleus so the n = 1 ring always clears it
const COLORS = {
  proton: "#c9583a",
  protonDark: "#8f3a24",
  neutron: "#aaa49b",
  neutronDark: "#6f6a62",
  electron: "#2a8c80",
  electronDark: "#134f48",
  ringOn: "#3a3630",
  ringOff: "#cfc6b6",
  sphere: ["#1e7268", "#835f7d", "#b4502f", "#ce9b22", "#436074", "#356b45", "#6b4d68"]
};
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

// Small deterministic PRNG so a species always packs its nucleus the same way.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ringRadius(n) {
  return ring1 + ((n - 1) * (RING_7 - ring1)) / 6;
}

function nucleonRadius(a) {
  return a <= 30 ? 10 : 10 * Math.sqrt(30 / a);
}

// Evenly spaced electrons that never sit exactly at the north pole (the ring label lives there).
function electronAngles(count) {
  const out = [];
  if (count === 1) return [Math.PI / 2];
  for (let j = 0; j < count; j++) out.push(-Math.PI / 2 + Math.PI / count + (j * 2 * Math.PI) / count);
  return out;
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export function createAtomRenderer(host, opts = {}) {
  let electronRatio = opts.electronRatio ?? 4.5;
  const svg = el("svg", { viewBox: `0 0 ${SIZE} ${SIZE}`, class: "atom-svg", role: "img" });
  svg.style.touchAction = "none";
  host.appendChild(svg);

  // ---- defs ---------------------------------------------------------------------------
  const defs = el("defs", {}, svg);
  const goo = el("filter", { id: uid("goo"), x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
  el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 3.2, result: "blur" }, goo);
  el("feColorMatrix", { in: "blur", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8", result: "goo" }, goo);
  el("feComposite", { in: "SourceGraphic", in2: "goo", operator: "atop" }, goo);

  function bubbleGradient(id, color, dark) {
    const g = el("radialGradient", { id, cx: "38%", cy: "32%", r: "68%", fx: "32%", fy: "26%" }, defs);
    el("stop", { offset: "0", "stop-color": "#ffffff", "stop-opacity": 0.78 }, g);
    el("stop", { offset: "0.32", "stop-color": color, "stop-opacity": 0.42 }, g);
    el("stop", { offset: "0.78", "stop-color": color, "stop-opacity": 0.72 }, g);
    el("stop", { offset: "1", "stop-color": dark, "stop-opacity": 0.9 }, g);
    return id;
  }
  const gradP = bubbleGradient(uid("gp"), COLORS.proton, COLORS.protonDark);
  const gradN = bubbleGradient(uid("gn"), COLORS.neutron, COLORS.neutronDark);
  const gradE = bubbleGradient(uid("ge"), COLORS.electron, COLORS.electronDark);
  const sphereGrads = COLORS.sphere.map((color, i) => {
    const g = el("radialGradient", { id: uid("gs" + i), cx: "50%", cy: "50%", r: "50%" }, defs);
    el("stop", { offset: "0", "stop-color": color, "stop-opacity": 0.0 }, g);
    el("stop", { offset: "0.7", "stop-color": color, "stop-opacity": 0.05 }, g);
    el("stop", { offset: "0.92", "stop-color": color, "stop-opacity": 0.22 }, g);
    el("stop", { offset: "1", "stop-color": color, "stop-opacity": 0.5 }, g);
    return g.id;
  });

  // ---- layers (z-order) ----------------------------------------------------------------
  const gRings = el("g", { class: "rings" }, svg);
  const gLabels = el("g", { class: "ring-labels", "font-family": "Lexend, sans-serif", "font-size": 11, "text-anchor": "middle" }, svg);
  const gSpheres = el("g", { class: "spheres", opacity: 0 }, svg);
  const gElecBack = el("g", { class: "electrons-back" }, svg);
  const gNucleus = el("g", { class: "nucleus" }, svg);
  const gHalo = el("g", { filter: `url(#${goo.id})`, opacity: 0.38 }, gNucleus);
  const gGoo = el("g", { filter: `url(#${goo.id})`, opacity: 0.5 }, gNucleus);
  const gFaces = el("g", {}, gNucleus);
  const gElec = el("g", { class: "electrons" }, svg);

  const rings = [], labels = [], spheres = [];
  for (let n = 1; n <= SHELLS; n++) {
    const r = ringRadius(n);
    rings.push(el("circle", { cx: C, cy: C, r, fill: "none" }, gRings));
    const t = el("text", { x: C, y: C - r - 4 }, gLabels);
    t.textContent = `n = ${n}`;
    labels.push(t);
    const sg = el("g", {}, gSpheres);
    el("circle", { cx: C, cy: C, r, fill: `url(#${sphereGrads[n - 1]})`, stroke: COLORS.sphere[n - 1], "stroke-opacity": 0.35, "stroke-width": 1 }, sg);
    el("ellipse", { cx: C - r * 0.3, cy: C - r * 0.42, rx: r * 0.3, ry: r * 0.12, fill: "#fff", opacity: 0.16, transform: `rotate(-35 ${C - r * 0.3} ${C - r * 0.42})` }, sg);
    spheres.push(sg);
  }

  // ---- particle state ------------------------------------------------------------------
  let nucleons = [];  // { kind, bx, by, dx, dy, vx, vy, r, phase, body, face }
  let electrons = []; // { n, angle, bx, by, dx, dy, vx, vy, r, phase, g, orbit }
  let species = null;
  let mode = "flat";  // flat | toSphere | sphere | toFlat
  let modeT0 = 0;
  let revealT0 = 0;
  const pointer = { x: 0, y: 0, down: false, active: false };

  function makeBubble(parent, kind, r, label) {
    const g = el("g", { class: `bubble ${kind}` }, parent);
    const grad = kind === "proton" ? gradP : kind === "neutron" ? gradN : gradE;
    const dark = kind === "proton" ? COLORS.protonDark : kind === "neutron" ? COLORS.neutronDark : COLORS.electronDark;
    el("circle", { r, fill: `url(#${grad})`, stroke: dark, "stroke-opacity": 0.35, "stroke-width": Math.max(0.4, r * 0.06) }, g);
    el("ellipse", { cx: -r * 0.3, cy: -r * 0.4, rx: r * 0.34, ry: r * 0.2, fill: "#fff", opacity: 0.55, transform: `rotate(-30 ${-r * 0.3} ${-r * 0.4})` }, g);
    if (label === "+") {
      el("line", { x1: -r * 0.42, x2: r * 0.42, y1: 0, y2: 0, stroke: "#fff", "stroke-width": r * 0.2, "stroke-linecap": "round" }, g);
      el("line", { y1: -r * 0.42, y2: r * 0.42, x1: 0, x2: 0, stroke: "#fff", "stroke-width": r * 0.2, "stroke-linecap": "round" }, g);
    } else if (label === "−") {
      el("line", { x1: -r * 0.5, x2: r * 0.5, y1: 0, y2: 0, stroke: "#fff", "stroke-width": Math.max(0.6, r * 0.28), "stroke-linecap": "round" }, g);
    }
    return g;
  }

  function clear() {
    gHalo.replaceChildren();
    gGoo.replaceChildren();
    gFaces.replaceChildren();
    gElec.replaceChildren();
    gElecBack.replaceChildren();
    nucleons = [];
    electrons = [];
  }

  function setSpecies(sp) {
    species = sp;
    clear();
    const rnd = mulberry32((sp.z * 1000 + sp.mass) * 31 + (sp.charge || 0) + 7);
    const p = sp.z, nn = neutronCount(sp), a = p + nn;
    const r = nucleonRadius(a);

    // Pack the nucleus on a sunflower spiral with overlap (stuck-together spheres), mixing
    // protons and neutrons: interleave by a shuffled kind list.
    const kinds = [];
    for (let i = 0; i < a; i++) kinds.push(i < p ? "proton" : "neutron");
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
    const spacing = r * 0.82; // Vogel spiral: neighbours end up ~1.45 r apart, overlapping
    const extent = a === 1 ? r : spacing * Math.sqrt(a - 1) + r;
    ring1 = Math.max(62, extent + 12);
    for (let n = 1; n <= SHELLS; n++) {
      const rr = ringRadius(n);
      rings[n - 1].setAttribute("r", rr);
      labels[n - 1].setAttribute("y", C - rr - 4);
      const [sc, se] = spheres[n - 1].children;
      sc.setAttribute("r", rr);
      se.setAttribute("cx", C - rr * 0.3); se.setAttribute("cy", C - rr * 0.42);
      se.setAttribute("rx", rr * 0.3); se.setAttribute("ry", rr * 0.12);
      se.setAttribute("transform", `rotate(-35 ${C - rr * 0.3} ${C - rr * 0.42})`);
    }
    for (let k = 0; k < a; k++) {
      const rad = spacing * Math.sqrt(k);
      const ang = k * GOLDEN + rnd() * 0.3;
      const bx = C + rad * Math.cos(ang) + (rnd() - 0.5) * 2.5;
      const by = C + rad * Math.sin(ang) + (rnd() - 0.5) * 2.5;
      const kind = kinds[k];
      const rk = r * (0.94 + rnd() * 0.12);
      const halo = el("circle", { cx: 0, cy: 0, r: rk * 1.22, fill: "#fff" }, gHalo);
      const body = el("circle", { cx: 0, cy: 0, r: rk, fill: kind === "proton" ? COLORS.proton : COLORS.neutron }, gGoo);
      const face = makeBubble(gFaces, kind, rk, kind === "proton" ? "+" : "");
      nucleons.push({ kind, bx, by, dx: 0, dy: 0, vx: 0, vy: 0, r: rk, phase: rnd() * Math.PI * 2, halo, body, face });
    }

    // Electrons on rings.
    const occ = shellOccupancy(sp);
    const er = r / electronRatio;
    for (let n = 1; n <= SHELLS; n++) {
      const count = occ[n - 1];
      const on = count > 0;
      rings[n - 1].setAttribute("stroke", on ? COLORS.ringOn : COLORS.ringOff);
      rings[n - 1].setAttribute("stroke-width", on ? 2.1 : 1);
      labels[n - 1].setAttribute("fill", on ? COLORS.ringOn : COLORS.ringOff);
      labels[n - 1].setAttribute("font-weight", on ? 600 : 400);
      spheres[n - 1].setAttribute("opacity", on ? 1 : 0.07);
      const rr = ringRadius(n);
      electronAngles(count).forEach((angle, j) => {
        const g = makeBubble(gElec, "electron", er, "−");
        const inc = (0.45 + rnd() * 0.8) * (rnd() < 0.5 ? -1 : 1);
        const speed = (2 * Math.PI / (1.4 + 0.3 * (n - 1))) * (0.85 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1);
        electrons.push({
          n, angle, r: er, phase: rnd() * Math.PI * 2, dx: 0, dy: 0, vx: 0, vy: 0, g,
          bx: C + rr * Math.cos(angle), by: C + rr * Math.sin(angle),
          orbit: { rr, inc, speed, x: 0, y: 0, z: 0, fx: 0, fy: 0 }
        });
      });
    }
    if (mode !== "flat") { mode = "flat"; applyModeStatics(0); }
    draw(performance.now());
  }

  // ---- physics ------------------------------------------------------------------------
  function springStep(b, dt, reach, maxPush, k, damp) {
    let tx = 0, ty = 0;
    if (pointer.active) {
      const x = b.bx + b.dx, y = b.by + b.dy;
      const ddx = x - pointer.x, ddy = y - pointer.y;
      const d = Math.hypot(ddx, ddy) || 0.001;
      const R = b.r + reach;
      if (d < R) {
        const push = ((R - d) / R) * maxPush;
        tx = (ddx / d) * push; ty = (ddy / d) * push;
      }
    }
    const ax = k * (tx - b.dx) - damp * b.vx;
    const ay = k * (ty - b.dy) - damp * b.vy;
    b.vx += ax * dt; b.vy += ay * dt;
    b.dx += b.vx * dt; b.dy += b.vy * dt;
  }

  function bubbleTransform(b, x, y, t, breathe) {
    const m = Math.min(1, Math.hypot(b.dx, b.dy) / (b.r * 0.8));
    const th = (Math.atan2(b.dy, b.dx) * 180) / Math.PI;
    const squash = 1 - 0.28 * m, widen = 1 + 0.2 * m;
    const br = reduceMotion ? 0 : breathe * Math.sin(t * 0.0017 + b.phase);
    return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${th.toFixed(1)}) scale(${(squash * (1 + br)).toFixed(3)} ${(widen * (1 - br)).toFixed(3)}) rotate(${(-th).toFixed(1)})`;
  }

  // Orbit of electron e at orbital angle theta: the plane contains the 2D slot direction
  // (theta = 0 is exactly the 2D position) and is tilted by e.orbit.inc.
  function orbitPoint(e, theta) {
    const { rr, inc } = e.orbit;
    const ca = Math.cos(e.angle), sa = Math.sin(e.angle);
    const ct = Math.cos(theta), st = Math.sin(theta);
    const e2x = -sa * Math.cos(inc), e2y = ca * Math.cos(inc), e2z = Math.sin(inc);
    return { x: C + rr * (ct * ca + st * e2x), y: C + rr * (ct * sa + st * e2y), z: rr * st * e2z };
  }

  function applyModeStatics(p) {
    // p: 0 = flat wires, 1 = spheres.
    gSpheres.setAttribute("opacity", p.toFixed(3));
    gRings.setAttribute("opacity", (1 - 0.92 * p).toFixed(3));
    gLabels.setAttribute("opacity", (1 - 0.6 * p).toFixed(3));
  }

  let last = 0, raf = 0;
  function draw(t) {
    const dt = Math.min(0.034, last ? (t - last) / 1000 : 0.016);
    last = t;

    for (const b of nucleons) {
      springStep(b, dt, 24, 9, 150, 11);
      const tr = bubbleTransform(b, b.bx + b.dx, b.by + b.dy, t, 0.035);
      b.halo.setAttribute("transform", tr);
      b.body.setAttribute("transform", tr);
      b.face.setAttribute("transform", tr);
    }

    let p = mode === "sphere" ? 1 : 0;
    if (mode === "toSphere" || mode === "toFlat") {
      const raw = Math.min(1, (t - modeT0) / (mode === "toSphere" ? 950 : 750));
      p = ease(mode === "toSphere" ? raw : 1 - raw);
      applyModeStatics(p);
      if (raw >= 1) mode = mode === "toSphere" ? "sphere" : "flat";
    }

    for (const e of electrons) {
      if (p === 0) {
        springStep(e, dt, 14, 5, 170, 12);
        if (e.g.parentNode !== gElec) gElec.appendChild(e.g);
        e.g.setAttribute("transform", bubbleTransform(e, e.bx + e.dx, e.by + e.dy, t, 0.05));
        e.g.setAttribute("opacity", 1);
        continue;
      }
      const theta = e.orbit.speed * ((t - revealT0) / 1000) * (mode === "toSphere" ? p : 1);
      const o = orbitPoint(e, mode === "toFlat" ? e.orbit.theta : theta);
      if (mode !== "toFlat") e.orbit.theta = theta;
      // During toFlat, glide from the frozen 3D point back to the 2D slot.
      const x = p * o.x + (1 - p) * e.bx, y = p * o.y + (1 - p) * e.by;
      const zn = (o.z / e.orbit.rr) * p; // -1 .. 1
      const scale = 1 + 0.28 * zn;
      e.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`);
      e.g.setAttribute("opacity", (0.45 + 0.55 * (zn + 1) / 2).toFixed(3));
      const back = zn < -0.02;
      const want = back ? gElecBack : gElec;
      if (e.g.parentNode !== want) want.appendChild(e.g);
    }
    raf = requestAnimationFrame(draw);
  }

  // ---- pointer ------------------------------------------------------------------------
  function toLocal(ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: -1e4, y: -1e4 };
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }
  svg.addEventListener("pointermove", (ev) => {
    const q = toLocal(ev);
    pointer.x = q.x; pointer.y = q.y; pointer.active = true;
  });
  svg.addEventListener("pointerleave", () => { pointer.active = false; });
  svg.addEventListener("pointerdown", (ev) => {
    // A tap is a poke: every nucleon near the point gets a radial impulse and the
    // whole cluster jiggles. Nothing pops.
    const q = toLocal(ev);
    pointer.x = q.x; pointer.y = q.y; pointer.active = true;
    for (const b of nucleons.concat(electrons)) {
      const ddx = b.bx - q.x, ddy = b.by - q.y;
      const d = Math.hypot(ddx, ddy) || 0.001;
      const f = Math.max(0, 1 - d / 70) * 90;
      b.vx += (ddx / d) * f; b.vy += (ddy / d) * f;
    }
    svg.setPointerCapture?.(ev.pointerId);
  });
  svg.addEventListener("pointerup", (ev) => { if (ev.pointerType !== "mouse") pointer.active = false; });

  raf = requestAnimationFrame(draw);

  return {
    svg,
    setSpecies,
    get species() { return species; },
    get revealed() { return mode === "sphere" || mode === "toSphere"; },
    reveal() {
      if (mode === "sphere" || mode === "toSphere") return;
      mode = "toSphere"; modeT0 = performance.now(); revealT0 = modeT0;
    },
    flatten() {
      if (mode === "flat" || mode === "toFlat") return;
      mode = "toFlat"; modeT0 = performance.now();
    },
    toggle() { this.revealed ? this.flatten() : this.reveal(); },
    setElectronRatio(r) { electronRatio = r; if (species) setSpecies(species); },
    destroy() { cancelAnimationFrame(raf); svg.remove(); }
  };
}

let uidCounter = 0;
function uid(p) { return `as-${p}-${++uidCounter}`; }
