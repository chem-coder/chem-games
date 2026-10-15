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

const place = (n, x, y, s = 1) => n.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
const breathe = (t, ph = 0) => 1 + 0.03 * Math.sin(t * 1.7 + ph);
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// Each animation: setup(svg, defs) → draw(t seconds). Loops by design.
const ANIMS = {
  "two-apart": {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") }; },
    draw(o, t) { place(o.p, 150, 120 + 3 * Math.sin(t), breathe(t)); place(o.e, 330, 120 + 3 * Math.sin(t + 2), breathe(t, 1)); }
  },
  attract: {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      const cyc = t % 5;
      place(o.p, 200, 120, breathe(t));
      if (cyc < 2.2) {
        const k = ease(cyc / 2.2);
        place(o.e, 420 - 150 * k, 120, breathe(t, 1));
      } else {
        const a = (cyc - 2.2) * 3.2;
        place(o.e, 200 + 70 * Math.cos(a), 120 + 70 * Math.sin(a), breathe(t, 1));
      }
    }
  },
  repel: {
    setup(svg, defs) { return { a: bubble(svg, defs, E, "−"), b: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      const cyc = t % 4;
      const k = cyc < 1 ? 0 : ease(Math.min(1, (cyc - 1) / 1.6));
      place(o.a, 225 - 110 * k, 120, breathe(t));
      place(o.b, 255 + 110 * k, 120, breathe(t, 1));
    }
  },
  closer: {
    setup(svg, defs) { return { p: bubble(svg, defs, P, "+"), near: bubble(svg, defs, E, "−"), far: bubble(svg, defs, E, "−") }; },
    draw(o, t) {
      place(o.p, 180, 120, breathe(t));
      place(o.near, 180 + 50 * Math.cos(t * 4), 120 + 50 * Math.sin(t * 4), breathe(t, 1));
      place(o.far, 180 + 180 * Math.cos(t * 0.8), 120 + 95 * Math.sin(t * 0.8), breathe(t, 2));
    }
  },
  hydrogen: {
    setup(svg, defs) {
      el("circle", { cx: 240, cy: 120, r: 80, fill: "none", stroke: "#3a3630", "stroke-opacity": 0.5, "stroke-width": 1.6 }, svg);
      return { p: bubble(svg, defs, P, "+"), e: bubble(svg, defs, E, "−") };
    },
    draw(o, t) { place(o.p, 240, 120, breathe(t)); place(o.e, 240 + 80 * Math.cos(t * 2.4), 120 + 80 * Math.sin(t * 2.4), breathe(t, 1)); }
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
