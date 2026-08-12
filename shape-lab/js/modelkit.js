// Shape Lab — the Model Kit. The digital ball-and-stick kit: atoms carry their
// valence electrons as dots that live at the compass points (N/E/S/W) and settle
// there when that's the easiest thing in the world — but under strain they slide
// like beads on a ring, compass points as the preferred rest positions.
// Drag dot → dot to bond (again for double/triple); double-click a bond to break it.

import { GEOMETRIES } from "./geometry.js";

export const VALENCE = {
  H: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7,
  P: 5, S: 6, Cl: 7, Br: 7, I: 7, Xe: 8,
};
const ROW3PLUS = new Set(["P", "S", "Cl", "Br", "I", "Xe"]);

const ATOM_R = 24;
const DOT_RING = ATOM_R + 10;
const DOT_R = 3.4;
const COMPASS = [-90, 0, 90, 180]; // N, E, S, W in canvas degrees
const LERP_POS = 0.16, LERP_ANG = 0.14;

const EL_FILL = {
  C: "#322e27", O: "#c0492f", H: "#e6dac2", N: "#436074", S: "#ce9b22",
  P: "#b4502f", F: "#7a9a52", Cl: "#7a9a52", Br: "#8a5a3a", I: "#835f7d",
  B: "#c9a06a", Be: "#a8b8a0", Xe: "#6b8f9c",
};
const LIGHT_INK = new Set(["C", "N", "P", "I", "O", "Br", "Xe"]);

const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;
const angDiff = (a, b) => { let d = ((a - b + 540) % 360) - 180; return d; };

export function createKit(canvas, atomEls, opts = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  let W = 0, H = 0;

  // Spawn on a loose ring, shuffled so the layout never gives the structure away.
  const order = atomEls.map((_, i) => i).sort(() => Math.random() - 0.5);
  const atoms = atomEls.map((el, i) => ({ id: i, el, lone: VALENCE[el] ?? 0, x: 0, y: 0, tx: 0, ty: 0, dots: [] }));

  function scatter() {
    atoms.forEach((at, i) => {
      const k = order[i], n = atoms.length;
      const a = (k / n) * Math.PI * 2 - Math.PI / 2;
      const rx = Math.min(W * 0.30, 150), ry = Math.min(H * 0.30, 110);
      at.tx = W / 2 + Math.cos(a) * rx; at.ty = H / 2 + Math.sin(a) * ry;
      if (at.x === 0 && at.y === 0) { at.x = at.tx; at.y = at.ty; }
    });
  }

  // Adopt the current CSS size each frame — a bench created while the pane is
  // hidden measures 0×0 and must inflate (and re-scatter) once it becomes visible.
  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (Math.abs(w - W) < 1 && Math.abs(h - H) < 1)) return;
    const wasCollapsed = W < 50;
    W = w; H = h;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (wasCollapsed) scatter();
  }
  fit();
  const bonds = []; // {a, b, order}
  let charge = 0;
  let frozen = false;
  let drag = null;   // {kind:"atom"|"bond", id, px, py}
  let raf = null;

  const bondsOf = (id) => bonds.filter((b) => b.a === id || b.b === id);
  const orderSum = (id) => bondsOf(id).reduce((s, b) => s + b.order, 0);
  const partner = (b, id) => (b.a === id ? b.b : b.a);

  function setCharge(q) { charge = q; }

  // ── dot choreography: bonds claim their headings, lone dots take the freest slots ──
  function dotTargets(atom) {
    const bondDirs = bondsOf(atom.id).map((b) => {
      const p = atoms[partner(b, atom.id)];
      return deg(Math.atan2(p.y - atom.y, p.x - atom.x));
    });
    // Score compass slots by distance from the nearest bond heading — freest first.
    const slots = COMPASS
      .map((s) => ({ s, score: bondDirs.length ? Math.min(...bondDirs.map((d) => Math.abs(angDiff(s, d)))) : 999 }))
      .filter((x) => x.score > 28)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
    if (!slots.length) slots.push(...COMPASS);
    // Round-robin the lone dots into the slots (singles first, then pairing — Hund would approve).
    const counts = slots.map(() => 0);
    for (let i = 0; i < atom.lone; i++) counts[i % slots.length] < 2 ? counts[i % slots.length]++ : counts[(i + 1) % slots.length]++;
    const targets = [];
    slots.forEach((s, i) => {
      if (counts[i] === 1) targets.push(s);
      else if (counts[i] === 2) targets.push(s - 11, s + 11);
    });
    return targets.slice(0, atom.lone);
  }

  function stepDots(atom) {
    const targets = dotTargets(atom);
    while (atom.dots.length < targets.length) atom.dots.push({ a: targets[atom.dots.length] });
    atom.dots.length = targets.length;
    atom.dots.forEach((d, i) => { d.a += angDiff(targets[i], d.a) * LERP_ANG; }); // beads on the ring
  }

  // ── drawing ──
  function edgePoint(from, to, offset) {
    const a = Math.atan2(to.y - from.y, to.x - from.x);
    const px = Math.cos(a + Math.PI / 2) * offset, py = Math.sin(a + Math.PI / 2) * offset;
    return {
      x1: from.x + Math.cos(a) * ATOM_R + px, y1: from.y + Math.sin(a) * ATOM_R + py,
      x2: to.x - Math.cos(a) * ATOM_R + px, y2: to.y - Math.sin(a) * ATOM_R + py,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // bonds — parallel lines for double/triple
    bonds.forEach((b) => {
      const A = atoms[b.a], B = atoms[b.b];
      for (let k = 0; k < b.order; k++) {
        const off = (k - (b.order - 1) / 2) * 6;
        const e = edgePoint(A, B, off);
        ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2);
        ctx.lineWidth = 2.6; ctx.strokeStyle = "#897f6d"; ctx.lineCap = "round"; ctx.stroke();
      }
    });
    // rubber band while bonding
    if (drag?.kind === "bond") {
      const A = atoms[drag.id];
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(drag.px, drag.py);
      ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.strokeStyle = "#1e7268"; ctx.stroke();
      ctx.setLineDash([]);
    }
    // atoms + their dots
    atoms.forEach((at) => {
      const fill = EL_FILL[at.el] || "#d8c9a8";
      const g = ctx.createRadialGradient(at.x - 8, at.y - 9, 4, at.x, at.y, ATOM_R);
      g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(0.3, fill); g.addColorStop(1, fill);
      ctx.beginPath(); ctx.arc(at.x, at.y, ATOM_R, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(45,42,35,0.4)"; ctx.stroke();
      ctx.fillStyle = LIGHT_INK.has(at.el) ? "#fffdf8" : "#2d2a23";
      ctx.font = `700 ${at.el.length > 1 ? 15 : 17}px Lexend, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(at.el, at.x, at.y + 1);
      at.render = at.dots.map((d) => {
        const x = at.x + Math.cos(rad(d.a)) * DOT_RING, y = at.y + Math.sin(rad(d.a)) * DOT_RING;
        ctx.beginPath(); ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = "#134f48"; ctx.fill();
        return { x, y };
      });
    });
    // ion brackets, live as soon as a non-zero charge is picked
    if (charge !== 0) {
      const xs = atoms.map((a) => a.x), ys = atoms.map((a) => a.y);
      const x0 = Math.min(...xs) - 52, x1 = Math.max(...xs) + 52;
      const y0 = Math.min(...ys) - 52, y1 = Math.max(...ys) + 52;
      ctx.lineWidth = 2.4; ctx.strokeStyle = "#835f7d";
      ctx.beginPath(); ctx.moveTo(x0 + 12, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x0 + 12, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - 12, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y1); ctx.lineTo(x1 - 12, y1); ctx.stroke();
      ctx.fillStyle = "#835f7d"; ctx.font = "700 15px Lexend, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      const q = Math.abs(charge) === 1 ? "" : String(Math.abs(charge));
      ctx.fillText(q + (charge > 0 ? "+" : "−"), x1 + 5, y0 + 6);
    }
  }

  function loop() {
    fit();
    atoms.forEach((at) => {
      at.x += (at.tx - at.x) * LERP_POS;
      at.y += (at.ty - at.y) * LERP_POS;
      stepDots(at);
    });
    draw();
    raf = requestAnimationFrame(loop);
  }

  // ── pointer interaction ──
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function hitDot(p) {
    for (const at of atoms)
      for (const d of at.render || [])
        if (Math.hypot(p.x - d.x, p.y - d.y) < 11) return at.id;
    return null;
  }
  function hitAtom(p, generous = 0) {
    for (const at of atoms)
      if (Math.hypot(p.x - at.x, p.y - at.y) < ATOM_R + generous) return at.id;
    return null;
  }
  function hitBond(p) {
    for (const b of bonds) {
      const A = atoms[b.a], B = atoms[b.b];
      const L2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
      if (!L2) continue;
      let t = ((p.x - A.x) * (B.x - A.x) + (p.y - A.y) * (B.y - A.y)) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(p.x - (A.x + t * (B.x - A.x)), p.y - (A.y + t * (B.y - A.y)));
      if (d < 9) return b;
    }
    return null;
  }

  function tryBond(a, b) {
    if (a === b || a === null || b === null) return;
    if (atoms[a].lone < 1 || atoms[b].lone < 1) return; // no spare electrons, no bond
    const ex = bonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (ex) { if (ex.order >= 3) return; ex.order += 1; }
    else bonds.push({ a, b, order: 1 });
    atoms[a].lone -= 1; atoms[b].lone -= 1;
    opts.onChange?.();
  }

  function onDown(e) {
    if (frozen) return;
    try { canvas.setPointerCapture?.(e.pointerId); } catch { /* synthetic events have no live pointer */ }
    const p = pos(e);
    const dotAtom = hitDot(p);
    if (dotAtom !== null) { drag = { kind: "bond", id: dotAtom, px: p.x, py: p.y }; return; }
    const atomId = hitAtom(p);
    if (atomId !== null) drag = { kind: "atom", id: atomId };
  }
  function onMove(e) {
    if (frozen || !drag) return;
    const p = pos(e);
    if (drag.kind === "atom") { atoms[drag.id].tx = p.x; atoms[drag.id].ty = p.y; }
    else { drag.px = p.x; drag.py = p.y; }
  }
  function onUp(e) {
    if (frozen || !drag) return;
    if (drag.kind === "bond") {
      const p = pos(e);
      const target = hitDot(p) ?? hitAtom(p, 14);
      tryBond(drag.id, target);
    }
    drag = null;
  }
  function onDbl(e) {
    if (frozen) return;
    const b = hitBond(pos(e));
    if (!b) return;
    b.order -= 1;
    atoms[b.a].lone += 1; atoms[b.b].lone += 1;
    if (b.order === 0) bonds.splice(bonds.indexOf(b), 1);
    opts.onChange?.();
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("dblclick", onDbl);

  // ── the Lewis judge ──
  function check(targetCharge) {
    const issues = [];
    if (charge !== targetCharge) issues.push("That's not this molecule's charge — count again.");
    if (bonds.length < atoms.length - 1) issues.push("Some atoms are still floating free — every atom must connect to the rest.");
    else {
      const seen = new Set([0]), stack = [0];
      while (stack.length) bondsOf(stack.pop()).forEach((b) => {
        [b.a, b.b].forEach((id) => { if (!seen.has(id)) { seen.add(id); stack.push(id); } });
      });
      if (seen.size < atoms.length) issues.push("Some atoms are still floating free — every atom must connect to the rest.");
    }
    for (const at of atoms) {
      const shell = 2 * orderSum(at.id) + at.lone;
      if (at.el === "H") {
        if (shell !== 2) issues.push(`H holds exactly 2 electrons — one bond, nothing more, nothing left over.`);
      } else if (at.el === "Be") {
        if (shell !== 4 && shell !== 8) issues.push(`Be is an octet rebel — it wants just 4 electrons here.`);
      } else if (at.el === "B") {
        if (shell !== 6 && shell !== 8) issues.push(`B is an octet rebel — 6 electrons is its happy place.`);
      } else if (ROW3PLUS.has(at.el)) {
        if (shell !== 8 && shell !== 10 && shell !== 12) issues.push(`This ${at.el} has ${shell} electrons around it — aim for a full octet.`);
      } else if (shell !== 8) {
        issues.push(shell < 8
          ? `This ${at.el} has only ${shell} electrons around it — it wants a full 8. Share more.`
          : `This ${at.el} has ${shell} electrons — more than 8, and a row-2 atom can never expand. Undo a bond.`);
      }
    }
    return { ok: issues.length === 0, issues: [...new Set(issues)].slice(0, 2) };
  }

  // ── the reward: derive the built molecule's real 3D pose from the catalog ──
  function derive3D() {
    let center = atoms[0];
    for (const at of atoms) if (orderSum(at.id) > orderSum(center.id)) center = at;
    const nbrs = bondsOf(center.id).map((b) => atoms[partner(b, center.id)].el);
    const lps = Math.floor(center.lone / 2);
    if (nbrs.length === 1) {
      // diatomic pose — bond east, center's lone pairs fanned west
      const lpCoords = [];
      for (let i = 0; i < lps; i++) {
        const a = Math.PI - 0.85 + (i * 1.7) / Math.max(1, lps - 1 || 1);
        lpCoords.push([Math.cos(a), Math.sin(a) * 0.9, 0]);
      }
      return { coords: [[1, 0, 0]], lpCoords, demo: { center: center.el, outer: nbrs } };
    }
    const g = GEOMETRIES.find((x) => x.bonds === nbrs.length && x.lonePairs === lps);
    if (!g) return null;
    return { coords: g.coords, lpCoords: g.lpCoords, demo: { center: center.el, outer: nbrs } };
  }

  function clear() {
    bonds.length = 0;
    atoms.forEach((at) => { at.lone = VALENCE[at.el] ?? 0; });
    opts.onChange?.();
  }

  loop();
  return {
    setCharge, check, derive3D, clear,
    debug: { atoms, bonds, tryBond }, // dev handle, same spirit as organic's window.__lab
    freeze() { frozen = true; },
    destroy() {
      if (raf !== null) cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("dblclick", onDbl);
    },
  };
}
