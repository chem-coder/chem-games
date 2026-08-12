// Shape Lab — the 3D molecule renderer.
// Real 3D done cheaply: unit-vector coordinates → rotate about the y-axis →
// tilt toward the viewer → perspective-project onto the canvas. Painter's
// algorithm (far items first) makes the rotation read as genuinely solid.

const TILT = -0.42;          // fixed x-axis tilt so flat shapes show their depth
const PERSPECTIVE = 3.4;     // camera distance in bond-length units
const SPIN_SPEED = 0.00045;  // radians per ms — slow, contemplative

// Element fills — atom colors from the shared palette, warm beige default.
const EL_COLORS = {
  C: "#322e27", O: "#c0492f", H: "#e6dac2", N: "#436074", S: "#ce9b22",
  P: "#b4502f", F: "#7a9a52", Cl: "#7a9a52", Br: "#8a5a3a", I: "#835f7d",
  B: "#c9a06a", Be: "#a8b8a0", Xe: "#6b8f9c",
};
const LIGHT_INK = new Set(["C", "N", "P", "I", "O", "Br", "Xe"]); // dark fills → light labels

function rotate([x, y, z], angle) {
  const cy = Math.cos(angle), sy = Math.sin(angle);
  let x1 = x * cy + z * sy, z1 = -x * sy + z * cy; // spin about y
  const cx = Math.cos(TILT), sx = Math.sin(TILT);
  const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx; // tilt about x
  return [x1, y2, z2];
}

// Create a renderer bound to one canvas. `geo` is a GEOMETRIES entry.
// Returns { drawFrame(angle), start(), stop() } — static callers use drawFrame once.
export function makeSpinner(canvas, geo, opts = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  let cssW = 0, cssH = 0, cx = 0, cy = 0, R = 0, atomR = 0, centerR = 0;

  // Adopt the canvas's current CSS size — re-checked every frame, because a canvas
  // created while the tab/pane is hidden measures 0×0 and would otherwise stay blank.
  function fit() {
    const w = canvas.clientWidth || canvas.width / dpr || 120;
    const h = canvas.clientHeight || canvas.height / dpr || 110;
    if (Math.abs(w - cssW) < 1 && Math.abs(h - cssH) < 1) return;
    cssW = w; cssH = h;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = cssW / 2; cy = cssH / 2;
    R = Math.min(cssW, cssH) * 0.30;                 // bond length in px
    atomR = opts.small ? R * 0.30 : R * 0.26;        // peripheral atom radius
    centerR = atomR * 1.25;
  }
  fit();
  const center = geo.demo?.center || "";
  const outers = geo.demo?.outer || [];
  const showLabels = !opts.small;

  function project([x, y, z]) {
    const s = PERSPECTIVE / (PERSPECTIVE - z);
    return { x: cx + x * R * s, y: cy - y * R * s, s, z };
  }

  function atomFill(el) { return EL_COLORS[el] || "#d8c9a8"; }

  function drawAtom(p, r, el) {
    const rad = r * p.s;
    const g = ctx.createRadialGradient(p.x - rad * 0.35, p.y - rad * 0.4, rad * 0.15, p.x, p.y, rad);
    const fill = atomFill(el);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(0.25, fill);
    g.addColorStop(1, fill);
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(45,42,35,0.35)";
    ctx.stroke();
    if (showLabels && el) {
      ctx.fillStyle = LIGHT_INK.has(el) ? "#fffdf8" : "#2d2a23";
      ctx.font = `600 ${Math.max(11, rad * 0.9)}px Lexend, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el, p.x, p.y + rad * 0.05);
    }
  }

  // Lone pair: translucent plum lobe pointing away from the center, two dots inside.
  function drawLonePair(v, p) {
    const tip = project([v[0] * 1.05, v[1] * 1.05, v[2] * 1.05]);
    const base = project([v[0] * 0.28, v[1] * 0.28, v[2] * 0.28]);
    const w = atomR * 0.75 * p.s;
    const ang = Math.atan2(tip.y - base.y, tip.x - base.x);
    ctx.save();
    ctx.translate((tip.x + base.x) / 2, (tip.y + base.y) / 2);
    ctx.rotate(ang);
    const len = Math.hypot(tip.x - base.x, tip.y - base.y) / 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, len, w, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(131,95,125,0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(131,95,125,0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(107,77,104,0.9)";
    const dotR = Math.max(1.6, w * 0.16);
    ctx.beginPath(); ctx.arc(len * 0.15, -w * 0.28, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(len * 0.15, w * 0.28, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Semitransparent electron clouds: red where the molecule is δ−, blue where δ+.
  // q in EN-difference units; alpha scales with |q| so weak dipoles whisper.
  function drawCloud(p, q, r) {
    const rad = r * p.s;
    const a = Math.min(0.34, 0.10 + Math.abs(q) * 0.16);
    const color = Math.abs(q) < 0.05 ? `216,201,168` : q < 0 ? `180,80,47` : `67,96,116`;
    const g = ctx.createRadialGradient(p.x, p.y, rad * 0.1, p.x, p.y, rad);
    g.addColorStop(0, `rgba(${color},${a})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // The net dipole, drawn through the whole molecule: crossed tail at the
  // positive end, arrowhead at the negative end. Rides the same rotation.
  function drawDipole(angle) {
    const v = rotate(opts.dipole, angle);
    const head = project([v[0] * 1.45, v[1] * 1.45, v[2] * 1.45]);
    const tail = project([-v[0] * 1.45, -v[1] * 1.45, -v[2] * 1.45]);
    ctx.strokeStyle = "#6b4d68"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();
    const a = Math.atan2(head.y - tail.y, head.x - tail.x);
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(head.x - 10 * Math.cos(a - 0.45), head.y - 10 * Math.sin(a - 0.45));
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(head.x - 10 * Math.cos(a + 0.45), head.y - 10 * Math.sin(a + 0.45));
    ctx.stroke();
    // the crossed tail (the "+" of the convention)
    const c = 6;
    ctx.beginPath();
    ctx.moveTo(tail.x - c * Math.cos(a), tail.y - c * Math.sin(a));
    ctx.lineTo(tail.x + c * Math.cos(a), tail.y + c * Math.sin(a));
    ctx.moveTo(tail.x - c * Math.cos(a + Math.PI / 2), tail.y - c * Math.sin(a + Math.PI / 2));
    ctx.lineTo(tail.x + c * Math.cos(a + Math.PI / 2), tail.y + c * Math.sin(a + Math.PI / 2));
    ctx.stroke();
  }

  function drawFrame(angle) {
    fit();
    ctx.clearRect(0, 0, cssW, cssH);
    if (opts.clouds) {
      const clouds = [{ v: [0, 0, 0], q: opts.clouds.center }];
      geo.coords.forEach((v, i) => clouds.push({ v, q: opts.clouds.outer[i] ?? 0 }));
      geo.lpCoords.forEach((v) => clouds.push({ v: [v[0] * 0.8, v[1] * 0.8, v[2] * 0.8], q: -(opts.clouds.lp ?? 0.8) }));
      clouds
        .map((c) => ({ ...c, p: project(rotate(c.v, angle)) }))
        .sort((a, b) => a.p.z - b.p.z)
        .forEach((c) => drawCloud(c.p, c.q, atomR * 2.6));
    }
    const items = [];
    geo.coords.forEach((v, i) => {
      const rv = rotate(v, angle);
      items.push({ z: rv[2] / 2, kind: "bond", to: project(rv) });          // bond midpoint depth
      items.push({ z: rv[2], kind: "atom", p: project(rv), el: outers[i] || outers[0] || "" });
    });
    geo.lpCoords.forEach((v) => {
      const rv = rotate(v, angle);
      items.push({ z: rv[2] * 0.6, kind: "lp", v: rv, p: project(rv) });
    });
    items.push({ z: 0, kind: "center" });
    items.sort((a, b) => a.z - b.z); // far → near

    const c0 = project([0, 0, 0]);
    for (const it of items) {
      if (it.kind === "bond") {
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(it.to.x, it.to.y);
        ctx.lineWidth = Math.max(2, atomR * 0.28 * it.to.s);
        ctx.strokeStyle = "#897f6d";
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (it.kind === "atom") {
        drawAtom(it.p, atomR, it.el);
      } else if (it.kind === "lp") {
        drawLonePair(it.v, it.p);
      } else {
        drawAtom(c0, centerR, center);
      }
    }
    if (opts.dipole) drawDipole(angle);
  }

  let raf = null, t0 = null;
  function tick(t) {
    if (t0 === null) t0 = t;
    drawFrame((opts.startAngle || 0.6) + (t - t0) * SPIN_SPEED);
    raf = requestAnimationFrame(tick);
  }
  return {
    drawFrame,
    start() { if (raf === null) raf = requestAnimationFrame(tick); },
    stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; t0 = null; } },
  };
}
