// Storyboard animations in the bubble language: a plus (proton) and minuses (electrons)
// on a small SVG stage. Each animation is a function of time; the frame decides which one.
const NS = "http://www.w3.org/2000/svg";
const W = 480, H = 240;
const P = { color: "#c9583a", dark: "#8f3a24", r: 22 };
const E = { color: "#2a8c80", dark: "#134f48", r: 8 };

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

let uid = 0;
function bubble(svg, defs, spec, sign) {
  const id = `sb-g-${++uid}`;
  const g = el("radialGradient", { id, cx: "40%", cy: "36%", r: "66%", fx: "34%", fy: "28%" }, defs);
  el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": 0.6 }, g);
  el("stop", { offset: "0.3", "stop-color": spec.color, "stop-opacity": 0.3 }, g);
  el("stop", { offset: "0.8", "stop-color": spec.color, "stop-opacity": 0.6 }, g);
  el("stop", { offset: "0.95", "stop-color": spec.dark, "stop-opacity": 0.8 }, g);
  el("stop", { offset: "1", "stop-color": "#fff", "stop-opacity": 0.9 }, g);
  const node = el("g", {}, svg);
  el("circle", { r: spec.r, fill: `url(#${id})`, stroke: "#fff", "stroke-opacity": 0.9, "stroke-width": 1.2 }, node);
  el("ellipse", { cx: -spec.r * 0.32, cy: -spec.r * 0.42, rx: spec.r * 0.3, ry: spec.r * 0.16, fill: "#fff", opacity: 0.6, transform: `rotate(-30 ${-spec.r * 0.32} ${-spec.r * 0.42})` }, node);
  const sw = Math.max(1.2, spec.r * 0.2);
  el("line", { x1: -spec.r * 0.45, x2: spec.r * 0.45, y1: 0, y2: 0, stroke: "#fff", "stroke-width": sw, "stroke-linecap": "round" }, node);
  if (sign === "+") el("line", { y1: -spec.r * 0.45, y2: spec.r * 0.45, x1: 0, x2: 0, stroke: "#fff", "stroke-width": sw, "stroke-linecap": "round" }, node);
  return node;
}

// ---- motion helpers ------------------------------------------------------------------
// Animation rules used here: attraction eases IN (accelerates, like the real pull), repulsion
// eases OUT (strong push, then coasting), moving things stretch along their velocity and
// squash when they stop, arrivals overshoot a little and settle (follow-through).
const breathe = (t, ph = 0) => 1 + 0.03 * Math.sin(t * 1.7 + ph);
const easeIn = (p) => Math.pow(p, 2.4);
const easeOut = (p) => 1 - Math.pow(1 - p, 2.6);
const clamp01 = (p) => Math.max(0, Math.min(1, p));
// Damped overshoot after an arrival: 1 + small decaying oscillation.
const settle = (u, amp = 0.18, freq = 9, decay = 4.5) => 1 + amp * Math.exp(-decay * u) * Math.sin(freq * u);

// Place a node and give it squash-and-stretch from its own velocity (estimated from the
// previous frame). `stretch` scales the effect; 0 disables it.
const prev = new WeakMap();
function place(node, x, y, t, breathPhase = 0, stretch = 1) {
  const last = prev.get(node);
  let sx = 1, sy = 1, ang = 0;
  if (last && stretch > 0) {
    const dt = Math.max(0.001, t - last.t);
    const vx = (x - last.x) / dt, vy = (y - last.y) / dt;
    const v = Math.hypot(vx, vy);
    const k = Math.min(0.22, (v / 900) * 0.22) * stretch;
    sx = 1 + k; sy = 1 - k * 0.8;
    ang = (Math.atan2(vy, vx) * 180) / Math.PI;
    // sudden stop (deceleration) → squash instead of stretch
    const dv = v - last.v;
    if (dv < -400) { const q = Math.min(0.18, (-dv / 3000) * 0.18); sx = 1 - q; sy = 1 + q; }
    prev.set(node, { x, y, t, v });
  } else {
    prev.set(node, { x, y, t, v: 0 });
  }
  const b = breathe(t, breathPhase);
  node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(sx * b).toFixed(3)} ${(sy / b).toFixed(3)}) rotate(${(-ang).toFixed(1)})`);
}

// Each animation: setup(svg, defs) → draw(t seconds). Loops by design.
const ANIMS = {
  "two-apart": {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      // Gentle drifting arcs, nothing pulling yet.
      place(o.p, 150 + 4 * Math.sin(t * 0.9), 120 + 3 * Math.sin(t * 1.3), t, 0, 0.3);
      place(o.e, 330 + 5 * Math.cos(t * 1.1), 120 + 4 * Math.sin(t * 0.8 + 2), t, 1, 0.3);
    }
  },
  attract: {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      // Capture like a landing: the minus comes in on a spiral, speeding up as the radius
      // shrinks, and by the far side of the plus it is in orbit. Then it just circles.
      const cyc = t % 9;
      const cx = 200, cy = 120, R = 70, start = 235, T = 3.2;
      place(o.p, cx, cy, t, 0, 0);
      let r, a;
      if (cyc < T) {
        const u = cyc / T;
        r = R + (start - R) * Math.pow(1 - u, 1.7);   // radius closes faster near the end
        a = 1.45 * Math.PI * Math.pow(u, 1.5);         // sweep accelerates as it falls in
      } else {
        r = R;
        a = 1.45 * Math.PI + (cyc - T) * 3.0;          // steady orbit at matching speed
      }
      place(o.e, cx + r * Math.cos(a), cy + r * Math.sin(a), t, 1, 0.6);
    }
  },
  repel: {
    // Two minuses push apart; then two pluses do the same. Alternates every cycle.
    setup(svg, defs) { return { a: bubble(svg, defs, E, "−"), b: bubble(svg, defs, E, "−"), c: bubble(svg, defs, P, "+"), d: bubble(svg, defs, P, "+") }; },
    draw(o, t) {
      const cyc = t % 8;
      const minuses = cyc < 4;
      const c = cyc % 4;
      const gap = minuses ? 15 : 30;
      const [a, b, h1, h2] = minuses ? [o.a, o.b, o.c, o.d] : [o.c, o.d, o.a, o.b];
      let k;
      if (c < 0.9) k = 0;                       // sitting too close: a beat of tension
      else k = easeOut(clamp01((c - 0.9) / 1.7)); // strong push, then coasting to a stop
      const jitter = c < 0.9 ? 1.5 * Math.sin(t * 40) : 0; // anticipation: a tiny tremble before the push
      place(a, 240 - gap - 110 * k + jitter, 120, t, 0);
      place(b, 240 + gap + 110 * k - jitter, 120, t, 1);
      place(h1, -100, -100, t, 0, 0); place(h2, -100, -100, t, 0, 0);
    }
  },
  closer: {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), near: bubble(svg, defs, E, "−"), far: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      place(o.p, 180, 120, t, 0, 0);
      // the close one whips around fast; the far one drifts on a wide slow ellipse
      place(o.near, 180 + 50 * Math.cos(t * 4.2), 120 + 50 * Math.sin(t * 4.2), t, 1, 0.6);
      place(o.far, 180 + 180 * Math.cos(t * 0.7), 120 + 95 * Math.sin(t * 0.7), t, 2, 0.6);
    }
  },
  hydrogen: {
    setup(svg, defs) {
      el("circle", { cx: 240, cy: 120, r: 80, fill: "none", stroke: "#3a3630", "stroke-opacity": 0.5, "stroke-width": 1.6 }, svg);
      return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") };
    },
    draw(o, t) {
      place(o.p, 240, 120, t, 0, 0);
      place(o.e, 240 + 80 * Math.cos(t * 2.4), 120 + 80 * Math.sin(t * 2.4), t, 1, 0.5);
    }
  }
};

export function mountAnimation(host, id) {
  host.replaceChildren();
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" }, host);
  const defs = el("defs", {}, svg);
  const anim = ANIMS[id] || ANIMS["two-apart"];
  const objs = anim.setup(svg, defs);
  const t0 = performance.now();
  let raf = 0;
  const loop = (now) => { anim.draw(objs, (now - t0) / 1000); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
