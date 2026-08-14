// Shape Lab — the Model Kit. The digital ball-and-stick kit: a fixed periodic-
// table inventory (main groups, rows 1–4 — the same for every question, like a
// real kit's box of parts), a free-electron dispenser, and a bench. Drag
// elements from the table onto the bench; atoms bond when they touch; click a
// bond to cycle single → double → triple → gone. Drop any atom back onto the
// inventory to throw its whole molecule out. Electrons come from and return to
// the dispenser — the Check does the bookkeeping.

import { GEOMETRIES } from "./geometry.js";

export const VALENCE = {
  H: 1, He: 2,
  Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  I: 7, Xe: 8,
};
const ROW3PLUS = new Set(["Al", "Si", "P", "S", "Cl", "Ar", "Ga", "Ge", "As", "Se", "Br", "Kr", "I", "Xe"]);

// The inventory: main-group periodic table, rows 1–4 (Dalia's 4×8 matrix).
const PT_ROWS = [
  ["H", null, null, null, null, null, null, "He"],
  ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Ga", "Ge", "As", "Se", "Br", "Kr"],
];

const ATOM_R = 24;
const DOT_RING = ATOM_R + 10;
const DOT_R = 3.4;
const COMPASS = [-90, 0, 90, 180];
const LERP_POS = 0.16, LERP_ANG = 0.14;
const TOUCH_GAP = 22; // atoms bond when their edges come within this — no full overlap needed

const EL_FILL = {
  C: "#322e27", O: "#c0492f", H: "#e6dac2", N: "#436074", S: "#ce9b22",
  P: "#b4502f", F: "#7a9a52", Cl: "#7a9a52", Br: "#8a5a3a", I: "#835f7d",
  B: "#c9a06a", Be: "#a8b8a0", Xe: "#6b8f9c", Si: "#8a7f66",
};
const LIGHT_INK = new Set(["C", "N", "P", "I", "O", "Br", "Xe", "Si"]);

const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;
const angDiff = (a, b) => { let d = ((a - b + 540) % 360) - 180; return d; };

// createKit(canvas, targetEls, opts): targetEls is the composition the Check
// expects (null for a free-play bench). The bench always starts EMPTY — parts
// come from the inventory.
export function createKit(canvas, targetEls, opts = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  let W = 0, H = 0;

  const target = targetEls ? targetEls.slice() : null;
  const TARGET_VALENCE = target ? target.reduce((s, el) => s + (VALENCE[el] ?? 0), 0) : 0;

  const atoms = []; // {id, el, lone, x, y, tx, ty, dots}
  const bonds = []; // {a, b, order} — atom IDS, not indices
  let nextId = 1;
  let charge = 0;
  let frozen = false;
  let drag = null; // {kind:"atom"|"dot"|"freeDot", id, px, py, moved}
  let raf = null;
  let suppressClick = false;

  const byId = (id) => atoms.find((a) => a.id === id);
  const bondsOf = (id) => bonds.filter((b) => b.a === id || b.b === id);
  const orderSum = (id) => bondsOf(id).reduce((s, b) => s + b.order, 0);
  const partner = (b, id) => (b.a === id ? b.b : b.a);

  function setCharge(q) { charge = q; }

  // ── inventory geometry (bottom bar of the canvas) ──
  const INV = { cell: 27, cols: 8, rows: 4, x: 12, y: 0, dispW: 44 };
  function invRect() {
    INV.y = H - INV.rows * INV.cell - 10;
    return { x: 0, y: INV.y - 8, w: W, h: H - (INV.y - 8) };
  }
  function invCellAt(p) {
    const c = Math.floor((p.x - INV.x) / INV.cell), r = Math.floor((p.y - INV.y) / INV.cell);
    if (r < 0 || r >= INV.rows || c < 0 || c >= INV.cols) return null;
    return PT_ROWS[r][c];
  }
  function dispenserRect() {
    return { x: INV.x + INV.cols * INV.cell + 14, y: INV.y + 8, w: INV.dispW, h: INV.rows * INV.cell - 16 };
  }
  const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

  // ── the bench population ──
  function spawn(el, x, y) {
    const at = { id: nextId++, el, lone: VALENCE[el] ?? 0, x, y, tx: x, ty: y, dots: [] };
    atoms.push(at);
    opts.onChange?.();
    return at;
  }
  // Dropping any atom back on the inventory throws out its WHOLE molecule.
  function deleteMolecule(id) {
    const seen = new Set([id]), stack = [id];
    while (stack.length) bondsOf(stack.pop()).forEach((b) => {
      [b.a, b.b].forEach((x) => { if (!seen.has(x)) { seen.add(x); stack.push(x); } });
    });
    for (let i = bonds.length - 1; i >= 0; i--) if (seen.has(bonds[i].a) || seen.has(bonds[i].b)) bonds.splice(i, 1);
    for (let i = atoms.length - 1; i >= 0; i--) if (seen.has(atoms[i].id)) atoms.splice(i, 1);
    opts.onChange?.();
  }

  // ── electron moves: the dispenser is the reservoir ──
  function dispenseTo(id) {
    const at = byId(id); if (!at) return;
    at.lone += 1; opts.onChange?.();
  }
  function discardFrom(id) {
    const at = byId(id); if (!at || at.lone < 1) return;
    at.lone -= 1; opts.onChange?.();
  }
  // Dalia's ruling (2026-08-14): electrons hand over atom-to-atom directly —
  // drag a dot from one atom onto another. This is where formal charge comes
  // from: the donor ends up one short, the receiver one over.
  function handOver(fromId, toId) {
    const A = byId(fromId), B = byId(toId);
    if (!A || !B || fromId === toId || A.lone < 1) return false;
    A.lone -= 1; B.lone += 1;
    opts.onChange?.();
    return true;
  }

  // ── bonding ──
  function relax(id) {
    const at = byId(id); if (!at) return;
    const nbrs = bondsOf(id).map((b) => byId(partner(b, id))).filter(Boolean);
    if (nbrs.length < 2) return;
    const withAngle = nbrs.map((n) => ({ n, a: Math.atan2(n.y - at.y, n.x - at.x) })).sort((p, q) => p.a - q.a);
    const spacing = (Math.PI * 2) / withAngle.length;
    const start = withAngle[0].a;
    withAngle.forEach((p, i) => {
      const ang = start + i * spacing;
      p.n.tx = at.x + Math.cos(ang) * 96;
      p.n.ty = at.y + Math.sin(ang) * 96;
    });
  }

  function tryBond(a, b) {
    if (a === b || a == null || b == null) return false;
    const A = byId(a), B = byId(b);
    if (!A || !B || A.lone < 1 || B.lone < 1) return false;
    if (bonds.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a))) return false;
    bonds.push({ a, b, order: 1 });
    A.lone -= 1; B.lone -= 1;
    relax(a); relax(b);
    opts.onChange?.();
    return true;
  }

  function cycleBond(b) {
    const A = byId(b.a), B = byId(b.b);
    if (b.order < 3 && A.lone > 0 && B.lone > 0) {
      b.order += 1; A.lone -= 1; B.lone -= 1;
    } else {
      A.lone += b.order; B.lone += b.order;
      bonds.splice(bonds.indexOf(b), 1);
    }
    opts.onChange?.();
  }

  function settleApart(movedId, anchorId) {
    const M = byId(movedId), A = byId(anchorId);
    if (!M || !A) return;
    let ang = Math.atan2(M.y - A.y, M.x - A.x);
    if (Math.hypot(M.x - A.x, M.y - A.y) < 2) ang = -Math.PI / 2;
    M.tx = A.x + Math.cos(ang) * 96;
    M.ty = A.y + Math.sin(ang) * 96;
  }

  // nearest bondable neighbor of a dragged atom, by EDGE distance (touch, not overlap)
  function touchTarget(id) {
    const M = byId(id); if (!M) return null;
    let best = null, bestD = Infinity;
    for (const at of atoms) {
      if (at.id === id) continue;
      const d = Math.hypot(M.x - at.x, M.y - at.y);
      if (d < ATOM_R * 2 + TOUCH_GAP && d < bestD) { bestD = d; best = at.id; }
    }
    return best;
  }

  // ── dot choreography ──
  function dotTargets(atom) {
    const bondDirs = bondsOf(atom.id).map((b) => {
      const p = byId(partner(b, atom.id));
      return deg(Math.atan2(p.y - atom.y, p.x - atom.x));
    });
    const slots = COMPASS
      .map((s) => ({ s, score: bondDirs.length ? Math.min(...bondDirs.map((d) => Math.abs(angDiff(s, d)))) : 999 }))
      .filter((x) => x.score > 28)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
    if (!slots.length) slots.push(...COMPASS);
    // Free atoms spread singles first (showing valence); bonded atoms draw PAIRS.
    const counts = slots.map(() => 0);
    if (bondDirs.length) {
      let rem = atom.lone;
      for (let i = 0; i < slots.length && rem > 0; i++) { const take = Math.min(2, rem); counts[i] = take; rem -= take; }
    } else {
      for (let i = 0; i < atom.lone; i++) counts[i % slots.length] < 2 ? counts[i % slots.length]++ : counts[(i + 1) % slots.length]++;
    }
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
    atom.dots.forEach((d, i) => { d.a += angDiff(targets[i], d.a) * LERP_ANG; });
  }

  // ── sizing ──
  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (Math.abs(w - W) < 1 && Math.abs(h - H) < 1)) return;
    W = w; H = h;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();

  // ── drawing ──
  function edgePoint(from, to, offset) {
    const a = Math.atan2(to.y - from.y, to.x - from.x);
    const px = Math.cos(a + Math.PI / 2) * offset, py = Math.sin(a + Math.PI / 2) * offset;
    return {
      x1: from.x + Math.cos(a) * ATOM_R + px, y1: from.y + Math.sin(a) * ATOM_R + py,
      x2: to.x - Math.cos(a) * ATOM_R + px, y2: to.y - Math.sin(a) * ATOM_R + py,
    };
  }

  function drawAtomBall(x, y, el, r) {
    const fill = EL_FILL[el] || "#d8c9a8";
    const g = ctx.createRadialGradient(x - r / 3, y - r / 2.7, r / 6, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(0.3, fill); g.addColorStop(1, fill);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(45,42,35,0.4)"; ctx.stroke();
    ctx.fillStyle = LIGHT_INK.has(el) ? "#fffdf8" : "#2d2a23";
    ctx.font = `700 ${el.length > 1 ? r * 0.58 : r * 0.7}px Lexend, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(el, x, y + 1);
  }

  function drawInventory() {
    const bar = invRect();
    ctx.fillStyle = "rgba(247,241,230,0.92)";
    ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
    ctx.strokeStyle = "#e5dbc9"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bar.x, bar.y); ctx.lineTo(bar.x + bar.w, bar.y); ctx.stroke();
    // the PT matrix
    for (let r = 0; r < INV.rows; r++) for (let c = 0; c < INV.cols; c++) {
      const el = PT_ROWS[r][c];
      if (!el) continue;
      const x = INV.x + c * INV.cell, y = INV.y + r * INV.cell;
      ctx.fillStyle = "#fffdf8";
      ctx.strokeStyle = "#e5dbc9"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x + 1, y + 1, INV.cell - 2, INV.cell - 2, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2d2a23";
      ctx.font = `600 ${el.length > 1 ? 10.5 : 12}px Lexend, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(el, x + INV.cell / 2, y + INV.cell / 2 + 0.5);
    }
    // the electron dispenser
    const d = dispenserRect();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#835f7d"; ctx.lineWidth = 1.6;
    ctx.fillStyle = "rgba(236,225,234,0.75)";
    ctx.beginPath(); ctx.roundRect(d.x, d.y, d.w, d.h, 9);
    ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#134f48";
    ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h / 2 - 8, DOT_R + 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b4d68";
    ctx.font = "600 11px Lexend, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("e⁻", d.x + d.w / 2, d.y + d.h / 2 + 2);
    // a quiet label for the throw-out affordance
    ctx.fillStyle = "#897f6d";
    ctx.font = "500 10px Lexend, sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("atoms: drag from the table · electrons: drag from e⁻, between atoms, or back · drop an atom here to throw its molecule out", d.x + d.w + 12, INV.y + 6);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // bonds
    bonds.forEach((b) => {
      const A = byId(b.a), B = byId(b.b);
      for (let k = 0; k < b.order; k++) {
        const off = (k - (b.order - 1) / 2) * 6;
        const e = edgePoint(A, B, off);
        ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2);
        ctx.lineWidth = 2.6; ctx.strokeStyle = "#897f6d"; ctx.lineCap = "round"; ctx.stroke();
      }
    });
    // carried electron: the dot rides the hand, slightly enlarged — no
    // trajectory line (Dalia's ruling: carry things, don't draw paths)
    if (drag?.kind === "dot" || drag?.kind === "freeDot") {
      const t = hitAtom({ x: drag.px, y: drag.py }, 14);
      if (t !== null && !(drag.kind === "dot" && t === drag.id)) {
        const at = byId(t); // plum ring: this atom would receive the electron
        ctx.beginPath(); ctx.arc(at.x, at.y, ATOM_R + 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(131,95,125,0.7)"; ctx.lineWidth = 2.4; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(drag.px, drag.py, DOT_R * 1.7, 0, Math.PI * 2);
      ctx.fillStyle = "#134f48"; ctx.fill();
    }
    // touch hint: ring the atom a dragged atom would bond with
    if (drag?.kind === "atom" && drag.moved) {
      const t = touchTarget(drag.id);
      if (t !== null) {
        const at = byId(t), M = byId(drag.id);
        const bonded = bonds.some((b) => (b.a === drag.id && b.b === t) || (b.b === drag.id && b.a === t));
        const can = !bonded && M.lone > 0 && at.lone > 0;
        ctx.beginPath(); ctx.arc(at.x, at.y, ATOM_R + 8, 0, Math.PI * 2);
        ctx.strokeStyle = can ? "rgba(30,114,104,0.7)" : "rgba(137,127,109,0.5)";
        ctx.lineWidth = 2.4; ctx.stroke();
      }
      // deleting? tint the inventory bar
      if (inRect({ x: drag.px, y: drag.py }, invRect())) {
        const bar = invRect();
        ctx.fillStyle = "rgba(180,80,47,0.08)";
        ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
      }
    }
    // atoms + dots (the grabbed thing rides the hand, ever-so-slightly enlarged)
    atoms.forEach((at) => {
      const held = drag?.kind === "atom" && drag.id === at.id && drag.moved;
      const r = held ? ATOM_R * 1.08 : ATOM_R;
      const ring = held ? DOT_RING + 2 : DOT_RING;
      drawAtomBall(at.x, at.y, at.el, r);
      at.render = at.dots.map((d, i) => {
        const x = at.x + Math.cos(rad(d.a)) * ring, y = at.y + Math.sin(rad(d.a)) * ring;
        const lifted = drag?.kind === "dot" && drag.id === at.id && drag.idx === i;
        if (!lifted) { // the carried dot is drawn at the hand, not on its old seat
          ctx.beginPath(); ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = "#134f48"; ctx.fill();
        }
        return { x, y };
      });
    });
    // ion brackets around the bench (kept above the inventory bar)
    if (charge !== 0 && atoms.length) {
      const xs = atoms.map((a) => a.x), ys = atoms.map((a) => a.y);
      const x0 = Math.min(...xs) - 52, x1 = Math.max(...xs) + 52;
      const y0 = Math.max(10, Math.min(...ys) - 52), y1 = Math.min(invRect().y - 6, Math.max(...ys) + 52);
      ctx.lineWidth = 2.4; ctx.strokeStyle = "#835f7d";
      ctx.beginPath(); ctx.moveTo(x0 + 12, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x0 + 12, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - 12, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y1); ctx.lineTo(x1 - 12, y1); ctx.stroke();
      ctx.fillStyle = "#835f7d"; ctx.font = "700 15px Lexend, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      const q = Math.abs(charge) === 1 ? "" : String(Math.abs(charge));
      ctx.fillText(q + (charge > 0 ? "+" : "−"), x1 + 5, y0 + 6);
    }
    drawInventory();
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
    for (const at of atoms) {
      const rd = at.render || [];
      for (let i = 0; i < rd.length; i++)
        if (Math.hypot(p.x - rd[i].x, p.y - rd[i].y) < 11) return { id: at.id, idx: i };
    }
    return null;
  }
  function hitAtom(p, generous = 0) {
    for (const at of atoms)
      if (Math.hypot(p.x - at.x, p.y - at.y) < ATOM_R + generous) return at.id;
    return null;
  }
  function hitBond(p) {
    for (const b of bonds) {
      const A = byId(b.a), B = byId(b.b);
      const L2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
      if (!L2) continue;
      let t = ((p.x - A.x) * (B.x - A.x) + (p.y - A.y) * (B.y - A.y)) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(p.x - (A.x + t * (B.x - A.x)), p.y - (A.y + t * (B.y - A.y)));
      if (d < 9) return b;
    }
    return null;
  }

  // The hand: open over anything grabbable, clamped while carrying — the
  // native grab/grabbing cursors are exactly the hand-then-fist Dalia asked for.
  function cursorFor(p) {
    if (frozen) return "default";
    if (hitDot(p) || hitAtom(p, 4) !== null) return "grab";
    if (inRect(p, dispenserRect()) || invCellAt(p)) return "grab";
    if (hitBond(p)) return "pointer";
    return "default";
  }

  function onDown(e) {
    if (frozen) return;
    try { canvas.setPointerCapture?.(e.pointerId); } catch { /* synthetic events */ }
    const p = pos(e);
    if (inRect(p, dispenserRect())) { drag = { kind: "freeDot", px: p.x, py: p.y }; }
    else {
      const cellEl = invCellAt(p);
      const dot = cellEl ? null : hitDot(p);
      if (cellEl) {
        const at = spawn(cellEl, p.x, p.y);
        drag = { kind: "atom", id: at.id, moved: true, fresh: true };
      } else if (dot) {
        drag = { kind: "dot", id: dot.id, idx: dot.idx, px: p.x, py: p.y };
      } else {
        const atomId = hitAtom(p, 4);
        if (atomId !== null) drag = { kind: "atom", id: atomId, moved: false };
      }
    }
    if (drag) canvas.style.cursor = "grabbing";
  }
  function onMove(e) {
    if (frozen) return;
    const p = pos(e);
    if (!drag) { canvas.style.cursor = cursorFor(p); return; }
    if (drag.kind === "atom") {
      const at = byId(drag.id); if (!at) { drag = null; return; }
      if (Math.hypot(p.x - at.tx, p.y - at.ty) > 4) drag.moved = true;
      at.tx = p.x; at.ty = p.y;
      drag.px = p.x; drag.py = p.y;
    } else { drag.px = p.x; drag.py = p.y; }
  }
  function onUp(e) {
    if (frozen || !drag) return;
    const p = pos(e);
    let acted = false;
    if (drag.kind === "atom" && drag.moved) {
      acted = true;
      if (inRect(p, invRect())) {
        deleteMolecule(drag.id); // back in the box — the whole molecule leaves
      } else {
        const t = touchTarget(drag.id);
        if (t !== null) {
          if (tryBond(drag.id, t)) settleApart(drag.id, t);
          else settleApart(drag.id, t); // already bonded / no electrons: just un-stack
        }
      }
    } else if (drag.kind === "dot") {
      const t = hitAtom(p, 14);
      if (t !== null && t !== drag.id) { handOver(drag.id, t); acted = true; } // atom-to-atom hand-over
      else if (inRect(p, invRect())) { discardFrom(drag.id); acted = true; }   // back to the dispenser
    } else if (drag.kind === "freeDot") {
      const t = hitDot(p)?.id ?? hitAtom(p, 14);
      if (t !== null && t !== undefined) { dispenseTo(t); acted = true; }
    }
    suppressClick = acted || (drag.kind === "atom" && drag.moved);
    drag = null;
    canvas.style.cursor = cursorFor(p);
  }
  function onClick(e) {
    if (frozen) return;
    if (suppressClick) { suppressClick = false; return; }
    const p = pos(e);
    if (inRect(p, invRect()) || hitDot(p) !== null || hitAtom(p) !== null) return;
    const b = hitBond(p);
    if (b) cycleBond(b);
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("click", onClick);

  // ── the Lewis judge ──
  function check(targetCharge) {
    const issues = [];
    if (charge !== targetCharge) issues.push("That's not this molecule's charge — count again.");
    // Composition first: the bench must hold exactly the recipe.
    if (target) {
      const want = {}, have = {};
      target.forEach((el) => { want[el] = (want[el] || 0) + 1; });
      atoms.forEach((a) => { have[a.el] = (have[a.el] || 0) + 1; });
      const missing = [], extra = [];
      for (const el of new Set([...Object.keys(want), ...Object.keys(have)])) {
        const d = (want[el] || 0) - (have[el] || 0);
        if (d > 0) missing.push(`${d}× ${el}`);
        if (d < 0) extra.push(`${-d}× ${el}`);
      }
      if (missing.length) issues.push(`The bench is missing ${missing.join(", ")} — fetch what's needed from the table.`);
      if (extra.length) issues.push(`${extra.join(", ")} on the bench ${extra.length > 1 ? "don't" : "doesn't"} belong to this formula — drop the surplus back on the table.`);
      if (issues.length) return { ok: false, issues: issues.slice(0, 2) };
    }
    if (!atoms.length) return { ok: false, issues: ["The bench is empty — drag atoms down from the table."] };
    // Step 1 is the law: the drawing must hold exactly the counted electrons.
    const inDrawing = atoms.reduce((s, a) => s + a.lone, 0) + 2 * bonds.reduce((s, b) => s + b.order, 0);
    const required = (target ? TARGET_VALENCE : atoms.reduce((s, a) => s + (VALENCE[a.el] ?? 0), 0)) - targetCharge;
    if (inDrawing !== required) {
      issues.push(inDrawing > required
        ? `The drawing holds ${inDrawing} electrons, but the count says ${required} — ${inDrawing - required} too many. Return some to the dispenser.`
        : `The drawing holds ${inDrawing} electrons, but the count says ${required} — ${required - inDrawing} missing. The dispenser has plenty.`);
    }
    // connectivity
    if (atoms.length > 1) {
      const seen = new Set([atoms[0].id]), stack = [atoms[0].id];
      while (stack.length) bondsOf(stack.pop()).forEach((b) => {
        [b.a, b.b].forEach((id) => { if (!seen.has(id)) { seen.add(id); stack.push(id); } });
      });
      if (seen.size < atoms.length) issues.push("Some atoms are still floating free — every atom must connect to the rest.");
    }
    // Step 5 is law too: |FC| ≥ 2 means the drawing is lying.
    for (const at of atoms) {
      const fc = (VALENCE[at.el] ?? 0) - at.lone - orderSum(at.id);
      if (Math.abs(fc) >= 2 && orderSum(at.id) > 0) {
        issues.push(`This ${at.el} carries a formal charge of ${fc > 0 ? "+" + fc : fc} — too big to be real. ${ROW3PLUS.has(at.el) ? "Row 3 can expand: trade lone pairs on the neighbors for double bonds." : "Rebalance who keeps which electrons."}`);
      }
    }
    // octets
    for (const at of atoms) {
      const shell = 2 * orderSum(at.id) + at.lone;
      if (at.el === "H") {
        if (shell !== 2) issues.push(`H holds exactly 2 electrons — one bond, nothing more, nothing left over.`);
      } else if (at.el === "Be") {
        if (shell !== 4 && shell !== 8) issues.push(`Be is an octet rebel — it wants just 4 electrons here.`);
      } else if (at.el === "B") {
        if (shell !== 6 && shell !== 8) issues.push(`B is an octet rebel — 6 electrons is its happy place.`);
      } else if (ROW3PLUS.has(at.el)) {
        if (![8, 10, 12, 14].includes(shell)) issues.push(`This ${at.el} has ${shell} electrons around it — aim for a full octet.`);
      } else if (shell !== 8) {
        issues.push(shell < 8
          ? `This ${at.el} has only ${shell} electrons around it — it wants a full 8. Share more.`
          : `This ${at.el} has ${shell} electrons — more than 8, and a row-2 atom can never expand. Undo a bond.`);
      }
    }
    return { ok: issues.length === 0, issues: [...new Set(issues)].slice(0, 2) };
  }

  // ── the reward: the built molecule's real 3D pose ──
  function derive3D() {
    if (!atoms.length) return null;
    let center = atoms[0];
    for (const at of atoms) if (orderSum(at.id) > orderSum(center.id)) center = at;
    const nbrs = bondsOf(center.id).map((b) => byId(partner(b, center.id)).el);
    const lps = Math.floor(center.lone / 2);
    if (nbrs.length === 1) {
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
    atoms.length = 0;
    opts.onChange?.();
  }

  loop();
  return {
    setCharge, check, derive3D, clear,
    debug: {
      atoms, bonds, spawn, tryBond, cycleBond, dispenseTo, discardFrom, handOver, deleteMolecule,
      // one manual frame — settles positions, choreographs dots, paints. Lets
      // tests drive real pointer gestures when a hidden pane pauses rAF.
      step() { fit(); atoms.forEach((at) => { at.x = at.tx; at.y = at.ty; stepDots(at); }); draw(); },
    },
    freeze() { frozen = true; },
    destroy() {
      if (raf !== null) cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("click", onClick);
    },
  };
}
