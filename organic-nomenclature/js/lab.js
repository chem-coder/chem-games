// Molecule-building canvas, packaged as a factory so the game (build direction) and the
// prototype lab page share one implementation. Chemistry truth lives in chem.js; this
// file animates it. The hydrogen ballet, per Dalia's spec (2026-07-29):
//   · every carbon arrives saturated — 4 H's riding its rim, alive, sliding to spread out
//   · bonding sheds the paid hydrogens with a slow fall (a little faster than snowflakes)
//   · cycling a bond's order re-balances H's INSTANTLY — no animation
import { hydrogenCount, canBond, nextOrder, componentFormulas } from "./chem.js";

// ── tuning ──
const R_C = 26;            // carbon radius, px
const R_H = 13;            // hydrogen radius
const H_ORBIT = R_C + R_H - 7;  // tucked against the rim, adhesion-style
const SNAP = 74;           // center distance at which two carbons bond
const FALL_V = 95;         // falling H speed, px/s — brisker than snow
const TRAY_H = 92;
const INK = "#2d2a23", LINE = "#8d8474";

// Ball styling per element. Oxygen wears the True-Autumn brick red (chemistry's
// conventional red, warmed to the house palette); its letter goes light for contrast.
const ELEMENT_STYLE = {
  C: { fill: "#beb5a2", stroke: LINE, text: INK, label: "Carbon" },
  O: { fill: "#b4502f", stroke: "#8a3c22", text: "#fff7ef", label: "Oxygen" },
  N: { fill: "#1e7268", stroke: "#134f48", text: "#eef6f2", label: "Nitrogen" }
};

export function createLab(canvas, { onChange = () => {}, elements = ["C"] } = {}) {
  const ctx = canvas.getContext("2d");

  let atoms = [];            // {id, el, x, y, hs: [{angle, vel, phase}]}
  let bonds = [];            // {a, b, order}
  let falling = [];          // {x, y, phase}
  let nextId = 1;
  let drag = null;
  let bondHit = null;
  let locked = false;
  let now = 0;

  const byId = () => Object.fromEntries(atoms.map((a) => [a.id, a]));
  const wrap = (a) => ((a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

  // ── hydrogen bookkeeping: sync the visual H's to the derived count ──
  function syncH(atom, { fall = false, towardAngle = null } = {}) {
    const target = hydrogenCount(atom, bonds);
    while (atom.hs.length > target) {
      let idx = 0;
      if (towardAngle !== null) {  // the H's displaced by the new bond are the ones that drop
        idx = atom.hs.reduce((best, h, i) =>
          Math.abs(wrap(h.angle - towardAngle)) < Math.abs(wrap(atom.hs[best].angle - towardAngle)) ? i : best, 0);
      }
      const [h] = atom.hs.splice(idx, 1);
      if (fall) {
        falling.push({
          x: atom.x + Math.cos(h.angle) * H_ORBIT,
          y: atom.y + Math.sin(h.angle) * H_ORBIT,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    while (atom.hs.length < target) {
      const dirs = bondAngles(atom);
      const away = dirs.length
        ? Math.atan2(-dirs.reduce((s, a) => s + Math.sin(a), 0), -dirs.reduce((s, a) => s + Math.cos(a), 0))
        : Math.random() * Math.PI * 2;
      atom.hs.push({ angle: away + (Math.random() - 0.5) * 1.2, vel: 0, phase: Math.random() * Math.PI * 2 });
    }
  }

  function bondAngles(atom) {
    return bonds
      .filter((b) => b.a === atom.id || b.b === atom.id)
      .map((b) => {
        const other = byId()[b.a === atom.id ? b.b : b.a];
        return Math.atan2(other.y - atom.y, other.x - atom.x);
      });
  }

  function spawnAtom(x, y, el = "C") {
    const atom = { id: nextId++, el, x, y, hs: [] };
    atoms.push(atom);
    syncH(atom);
    return atom;
  }

  function removeAtom(atom) {
    const partners = bonds
      .filter((b) => b.a === atom.id || b.b === atom.id)
      .map((b) => byId()[b.a === atom.id ? b.b : b.a]);
    bonds = bonds.filter((b) => b.a !== atom.id && b.b !== atom.id);
    atoms = atoms.filter((a) => a !== atom);
    partners.forEach((p) => syncH(p));   // instant H restore
    onChange();
  }

  function tryBond(dragged) {
    for (const other of atoms) {
      if (other === dragged) continue;
      const d = Math.hypot(other.x - dragged.x, other.y - dragged.y);
      if (d < SNAP && canBond(dragged, other, bonds)) {
        bonds.push({ a: dragged.id, b: other.id, order: 1 });
        syncH(dragged, { fall: true, towardAngle: Math.atan2(other.y - dragged.y, other.x - dragged.x) });
        syncH(other, { fall: true, towardAngle: Math.atan2(dragged.y - other.y, dragged.x - other.x) });
        onChange();
      }
    }
  }

  function cycleBond(bond) {
    const o = nextOrder(bond, byId(), bonds);
    const endpoints = [byId()[bond.a], byId()[bond.b]];
    if (o === 0) bonds = bonds.filter((b) => b !== bond);
    else bond.order = o;
    endpoints.forEach((a) => syncH(a));  // spec: bond changes re-balance with no animation
    onChange();
  }

  // ── geometry / hit testing ──
  let W = 0, H = 0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const trayRect = () => ({ x: 14, y: H - TRAY_H - 14, w: W - 28, h: TRAY_H });
  const inTray = (x, y) => { const t = trayRect(); return x > t.x && x < t.x + t.w && y > t.y && y < t.y + t.h; };

  function atomAt(x, y) {
    for (let i = atoms.length - 1; i >= 0; i--) {
      if (Math.hypot(atoms[i].x - x, atoms[i].y - y) < R_C + 4) return atoms[i];
    }
    return null;
  }

  function bondAt(x, y) {
    const map = byId();
    for (const b of bonds) {
      const p = map[b.a], q = map[b.b];
      const L2 = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (!L2) continue;
      let t = ((x - p.x) * (q.x - p.x) + (y - p.y) * (q.y - p.y)) / L2;
      t = Math.max(0.15, Math.min(0.85, t));  // stay off the atoms themselves
      const d = Math.hypot(x - (p.x + t * (q.x - p.x)), y - (p.y + t * (q.y - p.y)));
      if (d < 10) return b;
    }
    return null;
  }

  // ── pointer wiring ──
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  function onDown(e) {
    if (locked) return;
    const { x, y } = pos(e);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    const atom = atomAt(x, y);
    if (atom) { drag = { id: atom.id, dx: atom.x - x, dy: atom.y - y }; bondHit = null; return; }
    const bond = bondAt(x, y);
    if (bond) { bondHit = bond; return; }
    if (inTray(x, y)) {
      const t = trayRect();
      const section = Math.min(elements.length - 1, Math.floor(((x - t.x) / t.w) * elements.length));
      const a = spawnAtom(x, y, elements[section]);
      drag = { id: a.id, dx: 0, dy: 0 };
      onChange();
    }
  }

  function onMove(e) {
    if (locked) return;
    const { x, y } = pos(e);
    if (drag) {
      const atom = byId()[drag.id];
      if (!atom) { drag = null; return; }
      atom.x = x + drag.dx; atom.y = y + drag.dy;
      tryBond(atom);
    } else {
      canvas.style.cursor = atomAt(x, y) ? "grab" : bondAt(x, y) ? "pointer" : "default";
    }
  }

  function onUp(e) {
    if (locked) return;
    const { x, y } = pos(e);
    if (drag) {
      const atom = byId()[drag.id];
      if (atom && inTray(x, y)) removeAtom(atom);  // tray is also the bin
      drag = null;
    } else if (bondHit && bondHit === bondAt(x, y)) {
      cycleBond(bondHit);
    }
    bondHit = null;
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  window.addEventListener("resize", resize);

  // ── hydrogen slide physics: repulsion from bond directions (strong) and siblings (soft) ──
  function stepH(dt) {
    for (const atom of atoms) {
      const dirs = bondAngles(atom);
      for (const h of atom.hs) {
        let f = 0;
        for (const other of atom.hs) {
          if (other === h) continue;
          const d = wrap(h.angle - other.angle);
          f += Math.sign(d || 1) * 3.2 * Math.max(0, 1 - Math.abs(d) / Math.PI);
        }
        for (const beta of dirs) {
          const d = wrap(h.angle - beta);
          f += Math.sign(d || 1) * 9.5 * Math.max(0, 1 - Math.abs(d) / Math.PI);
        }
        h.vel = (h.vel + f * dt) * 0.86;
        h.angle += h.vel * dt;
      }
    }
  }

  function stepFalling(dt) {
    for (const p of falling) { p.y += FALL_V * dt; }
    falling = falling.filter((p) => p.y < H + R_H);
  }

  // ── drawing ──
  function drawH(x, y, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, R_H, 0, Math.PI * 2);
    ctx.fillStyle = "#f7f3ea"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "#b9ac94"; ctx.stroke();
    ctx.fillStyle = "#6e6553"; ctx.font = "600 11px Lexend, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("H", x, y + 0.5);
    ctx.globalAlpha = 1;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const map = byId();

    for (const b of bonds) {
      const p = map[b.a], q = map[b.b];
      const nx = -(q.y - p.y), ny = q.x - p.x;
      const n = Math.hypot(nx, ny) || 1;
      const offsets = b.order === 1 ? [0] : b.order === 2 ? [-3.5, 3.5] : [-6, 0, 6];
      ctx.lineWidth = 3.5; ctx.strokeStyle = LINE; ctx.lineCap = "round";
      for (const o of offsets) {
        ctx.beginPath();
        ctx.moveTo(p.x + (nx / n) * o, p.y + (ny / n) * o);
        ctx.lineTo(q.x + (nx / n) * o, q.y + (ny / n) * o);
        ctx.stroke();
      }
    }

    // falling hydrogens sway like brisk snowflakes
    for (const p of falling) drawH(p.x + Math.sin(t * 2.1 + p.phase) * 9, p.y, 0.9);

    // atoms: hydrogens first (tucked behind), heavy-atom ball on top
    for (const atom of atoms) {
      for (const h of atom.hs) {
        const a = h.angle + Math.sin(t * 1.6 + h.phase) * 0.055;  // the alive wobble
        drawH(atom.x + Math.cos(a) * H_ORBIT, atom.y + Math.sin(a) * H_ORBIT);
      }
      const st = ELEMENT_STYLE[atom.el];
      ctx.beginPath(); ctx.arc(atom.x, atom.y, R_C, 0, Math.PI * 2);
      ctx.fillStyle = st.fill; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = st.stroke; ctx.stroke();
      ctx.fillStyle = st.text; ctx.font = "700 17px Outfit, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(atom.el, atom.x, atom.y + 1);
    }

    // tray: supply and bin in one, one section per element
    const tr = trayRect();
    ctx.beginPath(); ctx.roundRect(tr.x, tr.y, tr.w, tr.h, 14);
    ctx.fillStyle = "#efe8d8"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "#e5dbc9"; ctx.stroke();
    const secW = tr.w / elements.length;
    elements.forEach((el, i) => {
      const st = ELEMENT_STYLE[el];
      const cx = tr.x + secW * i + secW / 2, cy = tr.y + tr.h / 2 - 6;
      if (i > 0) {
        ctx.beginPath(); ctx.moveTo(tr.x + secW * i, tr.y + 10); ctx.lineTo(tr.x + secW * i, tr.y + tr.h - 10);
        ctx.lineWidth = 1; ctx.strokeStyle = "#e5dbc9"; ctx.stroke();
      }
      for (const o of elements.length > 1 ? [-20, 20] : [-34, 0, 34]) {
        ctx.beginPath(); ctx.arc(cx + o, cy, R_C * 0.78, 0, Math.PI * 2);
        ctx.fillStyle = st.fill; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = st.stroke; ctx.stroke();
        ctx.fillStyle = st.text; ctx.font = "700 14px Outfit, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(el, cx + o, cy + 1);
      }
      ctx.fillStyle = "#897f6d"; ctx.font = "600 12px Lexend, sans-serif";
      ctx.fillText(st.label, cx, tr.y + tr.h - 16);
    });
    ctx.fillStyle = "#b0a691"; ctx.font = "600 10px Lexend, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("drag one out · drop one back to remove it", tr.x + tr.w / 2, tr.y + 12);
  }

  // ── loop ──
  let rafId = 0;
  let last = performance.now() / 1000;
  function frame(ms) {
    now = ms / 1000;
    const dt = Math.min(0.05, now - last);
    last = now;
    stepH(dt);
    stepFalling(dt);
    draw(now);
    rafId = requestAnimationFrame(frame);
  }

  resize();
  rafId = requestAnimationFrame(frame);

  return {
    atoms: () => atoms,
    bonds: () => bonds,
    falling: () => falling,
    formulas: () => componentFormulas(atoms, bonds),
    reset() { atoms = []; bonds = []; falling = []; drag = null; bondHit = null; onChange(); },
    setLocked(v) { locked = v; if (v) { drag = null; bondHit = null; } },
    resize,
    // deterministic stepper for headless testing (rAF is throttled in driven browsers)
    tick(frames = 1, dt = 1 / 60) {
      for (let i = 0; i < frames; i++) { now += dt; stepH(dt); stepFalling(dt); }
      draw(now);
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    }
  };
}
