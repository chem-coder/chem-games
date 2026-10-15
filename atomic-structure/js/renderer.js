// Atomic Structure — the atom renderer. Vanilla JS + SVG, no framework.
//
// Visual language (Dalia's brief, revised 2026-10-15):
// - Particles are bubbles: translucent, 3D-looking, bright thin rims. Nucleons are
//   bubbles pressed together like foam, sharing flat walls.
// - The nucleus is HARD and FIXED. In the exercise view it is one flat layer (every
//   nucleon visible and countable) and it never moves; a tap only brightens the rims.
//   In the reveal it becomes a 3D cluster that rotates slowly about a tilted axis; its
//   centre never shifts.
// - Electrons are the soft part: 1/3 the nucleon radius, strung on thin wire rings
//   (the 7 shells, n = 1 … 7). They breathe faintly, squish when touched, spring back.
// - reveal() turns the rings into translucent onion-layer spheres with the electrons
//   orbiting their layer in 3D.
import { shellOccupancy, neutronCount, SHELLS } from "./model.js";

const NS = "http://www.w3.org/2000/svg";
const SIZE = 480;
const C = SIZE / 2;
const RING_7 = 222;
let ring1 = 64; // grows with the nucleus so the n = 1 ring always clears it
const ELECTRON_RATIO = 3;
const FACE_POINTS = 48;
const COLORS = {
  proton: "#c9583a",
  protonDark: "#8f3a24",
  neutron: "#a7a197",
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
  return a <= 30 ? 10.5 : 10.5 * Math.sqrt(30 / a);
}

// Evenly spaced electrons that never sit exactly at the north pole (the ring label lives there).
function electronAngles(count) {
  if (count === 1) return [Math.PI / 2];
  const out = [];
  for (let j = 0; j < count; j++) out.push(-Math.PI / 2 + Math.PI / count + (j * 2 * Math.PI) / count);
  return out;
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// ---- nucleus geometry ------------------------------------------------------------------

// Flat layer: start on a Vogel spiral, then relax so every bubble presses into its
// neighbours (centres ~0.86 of the summed radii apart: a real shared wall) while the whole
// layer stays a compact disk. Returns [{x, y}] relative to the centre.
function packFlat(n, radii, rnd) {
  const pts = [];
  const r = radii.reduce((a, b) => a + b, 0) / n;
  for (let k = 0; k < n; k++) {
    const rad = r * 0.95 * Math.sqrt(k);
    const ang = k * GOLDEN + (rnd() - 0.5) * 0.3;
    pts.push({ x: rad * Math.cos(ang), y: rad * Math.sin(ang) });
  }
  if (n === 1) return pts;
  for (let it = 0; it < 90; it++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pts[i], b = pts[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const target = (radii[i] + radii[j]) * 0.86;
        if (d < target) {
          const push = (target - d) / 2 / d;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
      }
    }
    for (const q of pts) { q.x *= 0.975; q.y *= 0.975; }
  }
  return pts;
}

// 3D ball: random start, then relax so spheres touch without overlapping much and the
// whole thing stays compact. Deterministic for a given rnd.
function packBall(n, r, rnd) {
  const R0 = r * Math.cbrt(n) * 1.05;
  const pts = [];
  for (let i = 0; i < n; i++) {
    let x, y, z;
    do { x = (rnd() * 2 - 1); y = (rnd() * 2 - 1); z = (rnd() * 2 - 1); } while (x * x + y * y + z * z > 1);
    pts.push({ x: x * R0, y: y * R0, z: z * R0 });
  }
  const min = 2 * r * 0.9;
  for (let it = 0; it < 80; it++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pts[i], b = pts[j];
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const d = Math.hypot(dx, dy, dz) || 0.001;
        if (d < min) {
          const push = (min - d) / 2 / d;
          a.x -= dx * push; a.y -= dy * push; a.z -= dz * push;
          b.x += dx * push; b.y += dy * push; b.z += dz * push;
        }
      }
    }
    for (const p of pts) { p.x *= 0.985; p.y *= 0.985; p.z *= 0.985; }
  }
  return pts;
}

// Face outline of one flat bubble: a circle whose radius, in each direction, is cut off by
// the wall it shares with any neighbour it overlaps (the radical line of the two circles).
// Fixed point count so it can morph into a plain circle.
function faceRadii(i, pts, radii) {
  const out = new Array(FACE_POINTS);
  const r = radii[i];
  const walls = [];
  for (let j = 0; j < pts.length; j++) {
    if (j === i) continue;
    const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
    const d = Math.hypot(dx, dy);
    if (d >= r + radii[j]) continue;
    const dist = (d * d + r * r - radii[j] * radii[j]) / (2 * d);
    walls.push({ phi: Math.atan2(dy, dx), dist });
  }
  for (let k = 0; k < FACE_POINTS; k++) {
    const th = (k / FACE_POINTS) * 2 * Math.PI;
    let rr = r;
    for (const w of walls) {
      const c = Math.cos(th - w.phi);
      if (c > 0.001) rr = Math.min(rr, w.dist / c);
    }
    out[k] = Math.max(rr, r * 0.35);
  }
  return out;
}

function facePath(radii, scale = 1) {
  let d = "";
  for (let k = 0; k < FACE_POINTS; k++) {
    const th = (k / FACE_POINTS) * 2 * Math.PI;
    const x = radii[k] * scale * Math.cos(th), y = radii[k] * scale * Math.sin(th);
    d += (k ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return d + "Z";
}

export function createAtomRenderer(host, opts = {}) {
  const svg = el("svg", { viewBox: `0 0 ${SIZE} ${SIZE}`, class: "atom-svg", role: "img" });
  svg.style.touchAction = "none";
  host.appendChild(svg);

  // ---- defs ---------------------------------------------------------------------------
  const defs = el("defs", {}, svg);
  function bubbleGradient(id, color, dark) {
    // Transparent body, colour gathering toward the rim, a bright highlight up-left.
    const g = el("radialGradient", { id, cx: "40%", cy: "36%", r: "66%", fx: "34%", fy: "28%" }, defs);
    el("stop", { offset: "0", "stop-color": "#ffffff", "stop-opacity": 0.55 }, g);
    el("stop", { offset: "0.3", "stop-color": color, "stop-opacity": 0.22 }, g);
    el("stop", { offset: "0.8", "stop-color": color, "stop-opacity": 0.5 }, g);
    el("stop", { offset: "0.95", "stop-color": dark, "stop-opacity": 0.78 }, g);
    el("stop", { offset: "1", "stop-color": "#ffffff", "stop-opacity": 0.9 }, g);
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
  const shadow = el("filter", { id: uid("sh"), x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs);
  el("feGaussianBlur", { stdDeviation: 6 }, shadow);

  // ---- layers (z-order) ----------------------------------------------------------------
  const gRings = el("g", { class: "rings" }, svg);
  const gLabels = el("g", { class: "ring-labels", "font-family": "Lexend, sans-serif", "font-size": 11, "text-anchor": "middle" }, svg);
  const gSpheres = el("g", { class: "spheres", opacity: 0 }, svg);
  const gElecBack = el("g", { class: "electrons-back" }, svg);
  const gNucleus = el("g", { class: "nucleus" }, svg);
  const nShadow = el("circle", { cx: C, cy: C, r: 40, fill: "#6f6a62", opacity: 0.16, filter: `url(#${shadow.id})` }, gNucleus);
  const gNuc = el("g", {}, gNucleus);
  const gElec = el("g", { class: "electrons" }, svg);

  const rings = [], labels = [], spheres = [];
  for (let n = 1; n <= SHELLS; n++) {
    rings.push(el("circle", { cx: C, cy: C, r: 0, fill: "none" }, gRings));
    const t = el("text", { x: C, y: 0 }, gLabels);
    t.textContent = `n = ${n}`;
    labels.push(t);
    const sg = el("g", {}, gSpheres);
    el("circle", { cx: C, cy: C, r: 0, fill: `url(#${sphereGrads[n - 1]})`, stroke: COLORS.sphere[n - 1], "stroke-opacity": 0.35, "stroke-width": 1 }, sg);
    el("ellipse", { fill: "#fff", opacity: 0.16 }, sg);
    spheres.push(sg);
  }

  // ---- particle state ------------------------------------------------------------------
  let nucleons = [];  // { kind, r, flat:{x,y}, ball:{x,y,z}, radii2d, g, body, gloss }
  let electrons = []; // { n, angle, bx, by, dx, dy, vx, vy, r, phase, g, orbit }
  let species = null;
  let mode = "flat";  // flat | toSphere | sphere | toFlat
  let modeT0 = 0;
  let revealT0 = 0;
  let pulseT0 = -1e9;
  const pointer = { x: 0, y: 0, active: false };

  function signLines(g, r, label, color) {
    if (label === "+") {
      el("line", { x1: -r * 0.42, x2: r * 0.42, y1: 0, y2: 0, stroke: color, "stroke-width": r * 0.2, "stroke-linecap": "round" }, g);
      el("line", { y1: -r * 0.42, y2: r * 0.42, x1: 0, x2: 0, stroke: color, "stroke-width": r * 0.2, "stroke-linecap": "round" }, g);
    } else if (label === "−") {
      el("line", { x1: -r * 0.5, x2: r * 0.5, y1: 0, y2: 0, stroke: color, "stroke-width": Math.max(0.8, r * 0.26), "stroke-linecap": "round" }, g);
    }
  }

  function makeElectron(r) {
    const g = el("g", { class: "bubble electron" }, gElec);
    el("circle", { r, fill: `url(#${gradE})`, stroke: "#fff", "stroke-opacity": 0.85, "stroke-width": Math.max(0.5, r * 0.12) }, g);
    el("circle", { r: r * 1.02, fill: "none", stroke: COLORS.electronDark, "stroke-opacity": 0.35, "stroke-width": 0.5 }, g);
    el("ellipse", { cx: -r * 0.3, cy: -r * 0.4, rx: r * 0.32, ry: r * 0.18, fill: "#fff", opacity: 0.6, transform: `rotate(-30 ${-r * 0.3} ${-r * 0.4})` }, g);
    signLines(g, r, "−", "#fff");
    return g;
  }

  function clear() {
    gNuc.replaceChildren();
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

    const kinds = [];
    for (let i = 0; i < a; i++) kinds.push(i < p ? "proton" : "neutron");
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }

    const radii = Array.from({ length: a }, () => r * (0.94 + rnd() * 0.12));
    const flat = packFlat(a, radii, rnd);
    const ball = packBall(a, r, rnd);
    let extent = 0;
    flat.forEach((q, i) => { extent = Math.max(extent, Math.hypot(q.x, q.y) + radii[i]); });
    ring1 = Math.max(62, extent + 12);
    nShadow.setAttribute("r", Math.max(24, extent * 0.9));

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
      const kind = kinds[k], rk = radii[k];
      const g = el("g", { class: `bubble ${kind}` }, gNuc);
      const body = el("path", { fill: `url(#${kind === "proton" ? gradP : gradN})`, stroke: "#fff", "stroke-opacity": 0.9, "stroke-width": 1.1, "stroke-linejoin": "round" }, g);
      const rim = el("path", { fill: "none", stroke: kind === "proton" ? COLORS.protonDark : COLORS.neutronDark, "stroke-opacity": 0.35, "stroke-width": 0.6 }, g);
      const gloss = el("ellipse", { cx: -rk * 0.32, cy: -rk * 0.42, rx: rk * 0.3, ry: rk * 0.16, fill: "#fff", opacity: 0.6, transform: `rotate(-30 ${-rk * 0.32} ${-rk * 0.42})` }, g);
      signLines(g, rk, kind === "proton" ? "+" : "", "#fff");
      const radii2d = faceRadii(k, flat, radii);
      const circle = new Array(FACE_POINTS).fill(rk);
      nucleons.push({ kind, r: rk, flat: flat[k], ball: ball[k], radii2d, circle, g, body, rim, gloss });
      body.setAttribute("d", facePath(radii2d));
      rim.setAttribute("d", facePath(radii2d));
      g.setAttribute("transform", `translate(${(C + flat[k].x).toFixed(2)} ${(C + flat[k].y).toFixed(2)})`);
    }

    // Electrons on rings.
    const occ = shellOccupancy(sp);
    const er = r / ELECTRON_RATIO;
    for (let n = 1; n <= SHELLS; n++) {
      const count = occ[n - 1];
      const on = count > 0;
      rings[n - 1].setAttribute("stroke", on ? COLORS.ringOn : COLORS.ringOff);
      rings[n - 1].setAttribute("stroke-width", on ? 2.1 : 1);
      labels[n - 1].setAttribute("fill", on ? COLORS.ringOn : COLORS.ringOff);
      labels[n - 1].setAttribute("font-weight", on ? 600 : 400);
      spheres[n - 1].setAttribute("opacity", on ? 1 : 0.07);
      const rr = ringRadius(n);
      electronAngles(count).forEach((angle) => {
        const g = makeElectron(er);
        const inc = (0.45 + rnd() * 0.8) * (rnd() < 0.5 ? -1 : 1);
        const speed = (2 * Math.PI / (1.4 + 0.3 * (n - 1))) * (0.85 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1);
        electrons.push({
          n, angle, r: er, phase: rnd() * Math.PI * 2, dx: 0, dy: 0, vx: 0, vy: 0, g,
          bx: C + rr * Math.cos(angle), by: C + rr * Math.sin(angle),
          orbit: { rr, inc, speed, theta: 0 }
        });
      });
    }
    if (mode !== "flat") { mode = "flat"; applyModeStatics(0); }
    draw(performance.now());
  }

  // ---- electron physics ---------------------------------------------------------------
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
    gSpheres.setAttribute("opacity", p.toFixed(3));
    gRings.setAttribute("opacity", (1 - 0.92 * p).toFixed(3));
    gLabels.setAttribute("opacity", (1 - 0.6 * p).toFixed(3));
  }

  // ---- nucleus drawing ----------------------------------------------------------------
  // p = 0: flat layer, faces cut by shared walls. p = 1: rotating 3D ball, plain spheres
  // sorted by depth. In between, positions and outlines morph.
  const AXIS = (() => { const v = [1, 0.55, 0.35]; const l = Math.hypot(...v); return v.map((c) => c / l); })();
  function rotate(pt, ang) {
    const [ux, uy, uz] = AXIS, c = Math.cos(ang), s = Math.sin(ang), k = 1 - c;
    return {
      x: pt.x * (c + ux * ux * k) + pt.y * (ux * uy * k - uz * s) + pt.z * (ux * uz * k + uy * s),
      y: pt.x * (uy * ux * k + uz * s) + pt.y * (c + uy * uy * k) + pt.z * (uy * uz * k - ux * s),
      z: pt.x * (uz * ux * k - uy * s) + pt.y * (uz * uy * k + ux * s) + pt.z * (c + uz * uz * k)
    };
  }
  let lastNucP = -1;
  function drawNucleus(t, p) {
    const pulse = Math.max(0, 1 - (t - pulseT0) / 450);
    if (p === 0) {
      if (lastNucP !== 0) {
        for (const b of nucleons) {
          b.body.setAttribute("d", facePath(b.radii2d));
          b.rim.setAttribute("d", facePath(b.radii2d));
          b.g.setAttribute("transform", `translate(${(C + b.flat.x).toFixed(2)} ${(C + b.flat.y).toFixed(2)})`);
          b.g.setAttribute("opacity", 1);
        }
        nucleons.forEach((b) => gNuc.appendChild(b.g)); // flat order
      }
      for (const b of nucleons) b.body.setAttribute("stroke-opacity", (0.9 + 0.1 * pulse).toFixed(2));
      gNucleus.style.filter = pulse > 0 ? `brightness(${(1 + 0.12 * pulse).toFixed(3)})` : "";
      lastNucP = 0;
      return;
    }
    gNucleus.style.filter = "";
    const ang = reduceMotion ? 0.6 : ((t - revealT0) / 1000) * 0.45;
    const order = [];
    for (const b of nucleons) {
      const q = rotate(b.ball, ang);
      const x = (1 - p) * b.flat.x + p * q.x, y = (1 - p) * b.flat.y + p * q.y, z = p * q.z;
      const depth = z / (b.r * 3); // roughly -1 .. 1 across the ball
      const scale = 1 + 0.18 * depth;
      const radii = b.radii2d.map((rr, k) => (1 - p) * rr + p * b.circle[k]);
      b.body.setAttribute("d", facePath(radii, scale));
      b.rim.setAttribute("d", facePath(radii, scale));
      b.g.setAttribute("transform", `translate(${(C + x).toFixed(2)} ${(C + y).toFixed(2)})`);
      b.g.setAttribute("opacity", (0.75 + 0.25 * Math.min(1, (depth + 1) / 2)).toFixed(3));
      order.push({ b, z });
    }
    order.sort((u, v) => u.z - v.z);
    for (const o of order) gNuc.appendChild(o.b.g);
    lastNucP = p;
  }

  let last = 0, raf = 0;
  function draw(t) {
    const dt = Math.min(0.034, last ? (t - last) / 1000 : 0.016);
    last = t;

    let p = mode === "sphere" ? 1 : 0;
    if (mode === "toSphere" || mode === "toFlat") {
      const raw = Math.min(1, (t - modeT0) / (mode === "toSphere" ? 950 : 750));
      p = ease(mode === "toSphere" ? raw : 1 - raw);
      applyModeStatics(p);
      if (raw >= 1) mode = mode === "toSphere" ? "sphere" : "flat";
    }

    drawNucleus(t, p);

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
      const x = p * o.x + (1 - p) * e.bx, y = p * o.y + (1 - p) * e.by;
      const zn = (o.z / e.orbit.rr) * p;
      const scale = 1 + 0.28 * zn;
      e.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`);
      e.g.setAttribute("opacity", (0.45 + 0.55 * (zn + 1) / 2).toFixed(3));
      const want = zn < -0.02 ? gElecBack : gElec;
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
    const q = toLocal(ev);
    pointer.x = q.x; pointer.y = q.y; pointer.active = true;
    // A tap on the nucleus: the rims brighten for a moment. Nothing moves.
    if (Math.hypot(q.x - C, q.y - C) < ring1 - 6) pulseT0 = performance.now();
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
    destroy() { cancelAnimationFrame(raf); svg.remove(); }
  };
}

let uidCounter = 0;
function uid(p) { return `as-${p}-${++uidCounter}`; }
