// Molecule-building canvas, packaged as a factory so the game (build direction) and the
// prototype lab page share one implementation. Chemistry truth lives in chem.js; this
// file animates it. The hydrogen ballet, per Dalia's spec (2026-07-29):
//   · every carbon arrives saturated — 4 H's riding its rim, alive, sliding to spread out
//   · bonding sheds the paid hydrogens with a slow fall (a little faster than snowflakes)
//   · cycling a bond's order re-balances H's INSTANTLY — no animation
import { hydrogenCount, canBond, nextOrder, componentFormulas, splitComponents } from "./chem.js";

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
  N: { fill: "#1e7268", stroke: "#134f48", text: "#eef6f2", label: "Nitrogen" },
  Cl: { fill: "#356b45", stroke: "#274f33", text: "#eaf3ec", label: "Chlorine" },
  Br: { fill: "#6b4d68", stroke: "#523a50", text: "#f2ecf1", label: "Bromine" },
  // explicit hydrogen — a placeable token for the reactions game, where the delivered H
  // IS the teaching. Styled like the implicit H's so it reads as the same species.
  H: { fill: "#f7f3ea", stroke: "#b9ac94", text: "#6e6553", label: "Hydrogen" }
};

// Two input modes, NEVER mixed within one game (Dalia's rule, 2026-07-31):
//   "drag"  — atoms are dragged out of the tray (the charm, for shorter molecules)
//   "click" — the tray is a palette; tapping the canvas drops the selected element
//             (the fast hand, for long molecules and advanced rungs)
// additionMode (reactions game): when a new atom bonds to a carbon holding a multiple
// bond, that bond automatically drops one order — addition spends the π bond — and the
// FAR carbon gets an open seat: a pulsing dashed stub instead of a silent implicit H.
// The student must put something there. (Dalia's spec, 2026-08-03: "needs to be bonded
// to something".) Chemistry bonus: the attacked carbon keeps all its hydrogens, which
// is what really happens in addition.
export function createLab(canvas, { onChange = () => {}, elements = ["C"], inputMode = "drag", additionMode = false, atomScale = 1 } = {}) {
  // Per-instance atom sizing (Dalia, 2026-08-04): the reactions bench runs smaller
  // atoms so there is room to aim a dropped OH at ONE carbon; the naming builder
  // keeps the full-size chunky look.
  const RC = R_C * atomScale;
  const RH = R_H * atomScale;
  const ORBIT = RC + RH - 7;
  const ctx = canvas.getContext("2d");
  let activeEl = elements[0];
  let additionOn = additionMode;
  // Reaction phase 2 (Dalia's two-engine spec, 2026-08-04): hydrogens stop auto-
  // adjusting entirely — every H is a real placed object and the STUDENT chooses
  // which ones move. Bond auto-adjustment (splits, π attacks) stays.
  let autoH = true;

  let atoms = [];            // {id, el, x, y, hs: [{angle, vel, phase}]}
  let bonds = [];            // {a, b, order}
  let falling = [];          // {x, y, phase}
  // Open seats awaiting a bond (additionMode). Each records the attack that created it,
  // so undoing the attack — removing the attacker, or restoring the double bond —
  // dissolves the seat instead of leaving a phantom that blocks a correct answer.
  let openSlots = [];        // [{farId, nearId, attackerId}]
  const slotsFor = (id) => openSlots.filter((s) => s.farId === id).length;
  let nextId = 1;
  let drag = null;
  let bondHit = null;
  let locked = false;
  let now = 0;

  const byId = () => Object.fromEntries(atoms.map((a) => [a.id, a]));
  const wrap = (a) => ((a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

  // ── hydrogen bookkeeping: sync the visual H's to the derived count ──
  function syncH(atom, { fall = false, towardAngle = null } = {}) {
    // an explicit H token IS a hydrogen — it never grows implicit ones of its own;
    // an open seat is reserved and must NOT be filled by an implicit H
    const reserved = slotsFor(atom.id);
    const target = atom.el === "H" ? 0 : Math.max(0, hydrogenCount(atom, bonds) - reserved);
    while (atom.hs.length > target) {
      let idx = 0;
      if (towardAngle !== null) {  // the H's displaced by the new bond are the ones that drop
        idx = atom.hs.reduce((best, h, i) =>
          Math.abs(wrap(h.angle - towardAngle)) < Math.abs(wrap(atom.hs[best].angle - towardAngle)) ? i : best, 0);
      }
      const [h] = atom.hs.splice(idx, 1);
      if (fall) {
        falling.push({
          x: atom.x + Math.cos(h.angle) * ORBIT,
          y: atom.y + Math.sin(h.angle) * ORBIT,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    while (autoH && atom.hs.length < target) {
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
    openSlots = openSlots.filter((s) => s.farId !== atom.id);
    pruneSlots();
    partners.forEach((p) => syncH(p));   // instant H restore
    onChange();
  }

  function tryBond(dragged) {
    for (const other of atoms) {
      if (other === dragged) continue;
      const d = Math.hypot(other.x - dragged.x, other.y - dragged.y);
      if (d >= SNAP) continue;
      let bondable = canBond(dragged, other, bonds);
      // additionMode — Dalia's rule: "if a new bond forms, the corresponding bonds that
      // break automatically break." Two kinds of pending break make a bond possible:
      //   · the DRAGGED atom is saturated but can SPLIT off its own partner (the Br of
      //     an intact H–Br, either H of H–H, the H of a frozen water)
      //   · the RECEIVER is saturated but holds a π bond — the attack will free the seat
      //     (in phase 2 every H is explicit, so alkene carbons are chemically full)
      if (!bondable && additionOn) {
        const already = bonds.some((b) =>
          (b.a === dragged.id && b.b === other.id) || (b.a === other.id && b.b === dragged.id));
        if (!already) {
          const otherPi = bonds.some((b) => (b.a === other.id || b.b === other.id) && b.order > 1);
          let draggedReady = hydrogenCount(dragged, bonds) > 0;
          const otherReady = hydrogenCount(other, bonds) > 0 || otherPi;
          if (!draggedReady && otherReady) {
            const partnerBonds = bonds.filter((b) => (b.a === dragged.id || b.b === dragged.id) && b.order === 1);
            const pick = partnerBonds.find((b) => byId()[b.a === dragged.id ? b.b : b.a]?.el === "H") || partnerBonds[0];
            if (pick) {
              bonds = bonds.filter((b) => b !== pick);
              const freed = byId()[pick.a === dragged.id ? pick.b : pick.a];
              if (freed) {
                freed.x += 26;
                freed.y -= 38;   // drift the freed atom clear so it reads as "released"
                syncH(freed);
              }
              syncH(dragged);
              draggedReady = hydrogenCount(dragged, bonds) > 0;
            }
          }
          bondable = draggedReady && otherReady;
        }
      }
      if (bondable) {
        // additionMode: an arrival on a multiple-bond carbon ATTACKS the π bond —
        // it drops one order and the far carbon is left with an open seat
        let attacked = false;
        if (additionOn) {
          const multi = bonds.find((b) => (b.a === other.id || b.b === other.id) && b.order > 1);
          if (multi) {
            multi.order -= 1;
            const farId = multi.a === other.id ? multi.b : multi.a;
            openSlots.push({ farId, nearId: other.id, attackerId: dragged.id });
            const far = byId()[farId];
            if (far) syncH(far);
            attacked = true;
          }
        }
        bonds.push({ a: dragged.id, b: other.id, order: 1 });
        // consume an open seat if this arrival is the one filling it
        const seat = openSlots.findIndex((s) => s.farId === other.id);
        if (seat >= 0) openSlots.splice(seat, 1);
        pruneSlots();
        // an arriving explicit H takes an implicit H's seat — a silent swap, not a shed;
        // a π-bond attack also sheds nothing (addition keeps every hydrogen)
        const silent = attacked || dragged.el === "H" || other.el === "H";
        syncH(dragged, { fall: !silent, towardAngle: Math.atan2(other.y - dragged.y, other.x - dragged.x) });
        syncH(other, { fall: !silent, towardAngle: Math.atan2(dragged.y - other.y, dragged.x - other.x) });
        onChange();
      }
    }
  }

  function cycleBond(bond) {
    const o = nextOrder(bond, byId(), bonds);
    const endpoints = [byId()[bond.a], byId()[bond.b]];
    if (o === 0) bonds = bonds.filter((b) => b !== bond);
    else bond.order = o;
    pruneSlots();
    endpoints.forEach((a) => syncH(a));  // spec: bond changes re-balance with no animation
    onChange();
  }

  // A seat is only real while its attack still stands: attacker present and bonded to
  // the near carbon, and the broken bond still single. Undo any of that and the seat
  // dissolves — the implicit hydrogen quietly returns.
  function pruneSlots() {
    const bondBetween = (x, y) =>
      bonds.find((b) => (b.a === x && b.b === y) || (b.a === y && b.b === x));
    const before = openSlots.length;
    openSlots = openSlots.filter((s) =>
      atoms.some((a) => a.id === s.attackerId) &&
      atoms.some((a) => a.id === s.farId) &&
      bondBetween(s.attackerId, s.nearId) &&
      bondBetween(s.farId, s.nearId)?.order === 1
    );
    if (openSlots.length !== before) {
      for (const atom of atoms) syncH(atom);
    }
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
      // hydrogens are small — their hit circle must match, or they steal bond clicks
      const hitR = atoms[i].el === "H" ? RH + 5 : RC + 4;
      if (Math.hypot(atoms[i].x - x, atoms[i].y - y) < hitR) return atoms[i];
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
      if (inputMode === "click") { activeEl = elements[section]; return; } // palette select
      const a = spawnAtom(x, y, elements[section]);
      drag = { id: a.id, dx: 0, dy: 0 };
      onChange();
      return;
    }
    if (inputMode === "click") {
      // tap on open canvas: drop the selected element right here, bonding if in range
      const a = spawnAtom(x, y, activeEl);
      tryBond(a);
      drag = { id: a.id, dx: 0, dy: 0 }; // still adjustable until the finger lifts
      onChange();
    }
  }

  function onMove(e) {
    if (locked) return;
    const { x, y } = pos(e);
    if (drag) {
      const atom = byId()[drag.id];
      if (!atom) { drag = null; return; }
      const dx = (x + drag.dx) - atom.x;
      const dy = (y + drag.dy) - atom.y;
      atom.x += dx; atom.y += dy;
      // phase 2 (explicit-H world): hydrogens RIDE their heavy atom — dragging the O
      // of a water brings its H's along. Dragging an H alone still pulls just the H,
      // so elimination's pluck-an-H-off gesture is untouched.
      if (atom.el !== "H") {
        for (const b of bonds) {
          const otherId = b.a === atom.id ? b.b : b.b === atom.id ? b.a : null;
          if (otherId === null) continue;
          const other = byId()[otherId];
          if (other && other.el === "H") { other.x += dx; other.y += dy; }
        }
      }
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
      onChange();   // a released drag is a settled state — recognition may look now
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
    falling = falling.filter((p) => p.y < H + RH);
  }

  // ── drawing ──
  function drawH(x, y, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, RH, 0, Math.PI * 2);
    ctx.fillStyle = "#f7f3ea"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "#b9ac94"; ctx.stroke();
    ctx.fillStyle = "#6e6553"; ctx.font = `600 ${Math.max(8, Math.round(11 * atomScale))}px Lexend, sans-serif`;
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
        drawH(atom.x + Math.cos(a) * ORBIT, atom.y + Math.sin(a) * ORBIT);
      }
      // open seat: a pulsing dashed stub pointing away from the bonds — "bond me"
      if (slotsFor(atom.id)) {
        const dirs = bondAngles(atom);
        const away = dirs.length
          ? Math.atan2(-dirs.reduce((s, a2) => s + Math.sin(a2), 0), -dirs.reduce((s, a2) => s + Math.cos(a2), 0))
          : -Math.PI / 2;
        const pulse = 0.45 + 0.4 * Math.sin(t * 3.2);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#b4502f";
        ctx.beginPath();
        ctx.moveTo(atom.x + Math.cos(away) * (RC + 2), atom.y + Math.sin(away) * (RC + 2));
        ctx.lineTo(atom.x + Math.cos(away) * (RC + 22), atom.y + Math.sin(away) * (RC + 22));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, RC + 5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      const st = ELEMENT_STYLE[atom.el];
      const radius = atom.el === "H" ? RH + 2 : RC;
      ctx.beginPath(); ctx.arc(atom.x, atom.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = st.fill; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = st.stroke; ctx.stroke();
      ctx.fillStyle = st.text; ctx.font = `700 ${Math.max(9, Math.round((atom.el === "H" ? 12 : 17) * atomScale))}px Outfit, sans-serif`;
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
      if (inputMode === "click" && el === activeEl) {
        ctx.beginPath(); ctx.roundRect(tr.x + secW * i + 5, tr.y + 5, secW - 10, tr.h - 10, 10);
        ctx.fillStyle = "rgba(30, 114, 104, 0.10)"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "#1e7268"; ctx.stroke();
      }
      if (i > 0) {
        ctx.beginPath(); ctx.moveTo(tr.x + secW * i, tr.y + 10); ctx.lineTo(tr.x + secW * i, tr.y + tr.h - 10);
        ctx.lineWidth = 1; ctx.strokeStyle = "#e5dbc9"; ctx.stroke();
      }
      for (const o of elements.length > 1 ? [-20, 20] : [-34, 0, 34]) {
        ctx.beginPath(); ctx.arc(cx + o, cy, RC * 0.78, 0, Math.PI * 2);
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
    ctx.fillText(
      inputMode === "click"
        ? "pick an element here · tap the canvas to place it · drop an atom here to remove it"
        : "drag one out · drop one back to remove it",
      tr.x + tr.w / 2, tr.y + 12
    );
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
    reset() { atoms = []; bonds = []; falling = []; openSlots = []; drag = null; bondHit = null; onChange(); },
    setLocked(v) { locked = v; if (v) { drag = null; bondHit = null; } },
    openSlotCount() { return openSlots.length; },
    setAutoH(v) { autoH = v; },
    setAdditionMode(v) { additionOn = v; },
    isDragging() { return Boolean(drag); },
    // atoms must clear this line to count as "out of the inventory"
    stagingLine() { return H - TRAY_H - 14 - 30; },
    // The prettifier (Dalia's spec, 2026-08-04): the student CREATES the structure,
    // the computer DRAWS it — zigzag chain, uniform bond lengths, centered above the
    // tray. Runs on the reactants at recognition time.
    normalizeLayout() {
      const comps = splitComponents(atoms, bonds);
      // Long bonds and a flat zigzag (~135° interior — deliberately unscientific,
      // Dalia's spec): with short bonds, a dropped OH lands inside TWO carbons' snap
      // radii at once and bridges them. Room to aim beats textbook angles.
      const L = 124;                // uniform heavy-atom bond length
      const ZX = L * Math.cos(Math.PI / 8), ZY = L * Math.sin(Math.PI / 8);
      const laid = [];
      const nbsOf = (id) => bonds
        .filter((b) => b.a === id || b.b === id)
        .map((b) => (b.a === id ? b.b : b.a));
      for (const comp of comps) {
        const heavy = comp.atoms.filter((a) => a.el !== "H");
        const heavyIds = new Set(heavy.map((a) => a.id));
        const pos2 = new Map();
        if (heavy.length === 0) {
          comp.atoms.forEach((a, i) => pos2.set(a.id, { x: i * 40, y: 0 }));
        } else {
          // tree diameter by double sweep = the backbone chain
          const heavyNbs = (id) => nbsOf(id).filter((x) => heavyIds.has(x));
          const far = (start) => {
            const dist = new Map([[start, 0]]);
            const prev = new Map([[start, null]]);
            const q = [start];
            let best = start;
            while (q.length) {
              const cur = q.shift();
              if (dist.get(cur) > dist.get(best)) best = cur;
              for (const nb of heavyNbs(cur)) {
                if (!dist.has(nb)) { dist.set(nb, dist.get(cur) + 1); prev.set(nb, cur); q.push(nb); }
              }
            }
            return { best, prev };
          };
          const a1 = far(heavy[0].id).best;
          const sweep = far(a1);
          const chain = [];
          for (let cur = sweep.best; cur !== null; cur = sweep.prev.get(cur)) chain.push(cur);
          // zigzag backbone
          chain.forEach((id, i) => pos2.set(id, { x: i * ZX, y: (i % 2) * ZY }));
          // substituent heavy atoms hang off their chain carbon, opposite the bend
          const inChain = new Set(chain);
          for (const id of chain) {
            const i = chain.indexOf(id);
            let flip = (i % 2 === 0) ? -1 : 1;
            for (const nb of heavyNbs(id)) {
              if (inChain.has(nb) || pos2.has(nb)) continue;
              pos2.set(nb, { x: pos2.get(id).x, y: pos2.get(id).y + flip * L * 0.8 });
              // anything deeper (branch of a branch) walks straight outward
              let prev2 = id, cur2 = nb, depth = 2;
              for (;;) {
                const next = heavyNbs(cur2).find((x) => x !== prev2 && !pos2.has(x));
                if (!next) break;
                pos2.set(next, { x: pos2.get(id).x, y: pos2.get(id).y + flip * L * 0.8 * depth });
                prev2 = cur2; cur2 = next; depth += 1;
              }
              flip = -flip;
            }
          }
        }
        // explicit H leaves: gap-spread around their heavy atom at uniform reach
        const reach = RC + RH + 16;
        for (const a of comp.atoms) {
          if (a.el === "H" || !pos2.has(a.id)) continue;
          const hKids = nbsOf(a.id).filter((id2) => comp.atoms.find((x) => x.id === id2)?.el === "H");
          if (!hKids.length) continue;
          const dirs = nbsOf(a.id)
            .filter((id2) => pos2.has(id2))
            .map((id2) => Math.atan2(pos2.get(id2).y - pos2.get(a.id).y, pos2.get(id2).x - pos2.get(a.id).x));
          const candidates = Array.from({ length: 16 }, (_, i2) => (i2 / 16) * Math.PI * 2);
          const chosen = [];
          for (let j = 0; j < hKids.length; j++) {
            let best = 0, bestScore = -1;
            for (const cand of candidates) {
              const clearance = Math.min(
                ...dirs.map((d2) => Math.abs(wrap(cand - d2))),
                ...chosen.map((d2) => Math.abs(wrap(cand - d2))),
                Math.PI
              );
              if (clearance > bestScore) { bestScore = clearance; best = cand; }
            }
            chosen.push(best);
            pos2.set(hKids[j], {
              x: pos2.get(a.id).x + Math.cos(best) * reach,
              y: pos2.get(a.id).y + Math.sin(best) * reach
            });
          }
        }
        // bbox for this component
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of pos2.values()) {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        }
        laid.push({ pos2, w: maxX - minX + 2 * RC, h: maxY - minY + 2 * RC, minX, minY });
      }
      // arrange components side by side, centered in the space above the tray;
      // if the long-bond layout overflows the bench, scale it down uniformly
      const gap = 54;
      let totalW = laid.reduce((s, l2) => s + l2.w, 0) + gap * (laid.length - 1);
      if (totalW > W - 30) {
        const s = (W - 30 - gap * (laid.length - 1)) / (totalW - gap * (laid.length - 1));
        for (const l2 of laid) {
          for (const p of l2.pos2.values()) { p.x *= s; p.y *= s; }
          l2.w = (l2.w - 2 * RC) * s + 2 * RC;
          l2.h = (l2.h - 2 * RC) * s + 2 * RC;
          l2.minX *= s;
          l2.minY *= s;
        }
        totalW = laid.reduce((s2, l2) => s2 + l2.w, 0) + gap * (laid.length - 1);
      }
      const regionH = H - TRAY_H - 14;
      let cursor = Math.max(20, (W - totalW) / 2);
      for (const l2 of laid) {
        const ox = cursor - l2.minX + RC;
        const oy = (regionH - l2.h) / 2 - l2.minY + RC;
        for (const [id, p] of l2.pos2) {
          const atom = byId()[id];
          if (atom) { atom.x = p.x + ox; atom.y = p.y + oy; }
        }
        cursor += l2.w + gap;
      }
      onChange();
    },
    // Phase-2 conversion: every implicit H becomes a real, draggable H atom. Placement
    // is recomputed into the GAPS between bonds — never on a bond axis, where an H
    // would sit on top of the C–C line and steal every bond click.
    explicitizeHydrogens() {
      for (const atom of [...atoms]) {
        const k = atom.hs.length;
        if (k === 0) continue;
        const dirs = bondAngles(atom);
        const candidates = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
        const chosen = [];
        for (let j = 0; j < k; j++) {
          let best = null, bestScore = -1;
          for (const cand of candidates) {
            const clearance = Math.min(
              ...dirs.map((d2) => Math.abs(wrap(cand - d2))),
              ...chosen.map((d2) => Math.abs(wrap(cand - d2))),
              Math.PI
            );
            if (clearance > bestScore) { bestScore = clearance; best = cand; }
          }
          chosen.push(best);
        }
        // pushed clear of the carbon so the C–H bond LINE is visible — when building,
        // hydrogens float tucked-in; when reacting, you see the chemical bonds
        const reach = RC + RH + 16;
        for (const angle of chosen) {
          const hAtom = {
            id: nextId++, el: "H",
            x: atom.x + Math.cos(angle) * reach,
            y: atom.y + Math.sin(angle) * reach,
            hs: []
          };
          atoms.push(hAtom);
          bonds.push({ a: atom.id, b: hAtom.id, order: 1 });
        }
        atom.hs = [];
      }
      onChange();
    },
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
