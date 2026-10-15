// A minus flying among fixed pluses under inverse-square attraction, with light damping so it
// can be captured. Pure math, no DOM: used by the storyboard and testable in Node.
//
// Units are stage pixels and seconds. The force is softened near a plus (so nothing blows up)
// and, once the minus has fallen to the orbit radius around the plus that holds it, the
// motion hands over to a steady circle at that radius (the last metres of a real capture are
// radiation we cannot draw).
export const ORBIT_R = 52;
export const DEFAULTS = { soft: 26, G: 2.2e6, damp: 0.55 };

// pluses: [{ x, y, vx, vy }] — they drift too, slowly; the field follows them.
export function createCapture({ pluses, x, y, vx, vy }, opts = {}) {
  const ps = pluses.map((p) => ({ x: p.x, y: p.y, vx: p.vx || 0, vy: p.vy || 0 }));
  return { pluses: ps, x, y, vx, vy, held: null, angle: 0, omega: 0, t: 0, o: { ...DEFAULTS, ...opts } };
}

export function step(s, dt) {
  s.t += dt;
  for (const p of s.pluses) { p.x += p.vx * dt; p.y += p.vy * dt; }
  if (s.held) {
    s.angle += s.omega * dt;
    s.x = s.held.x + ORBIT_R * Math.cos(s.angle);
    s.y = s.held.y + ORBIT_R * Math.sin(s.angle);
    return s;
  }
  let ax = 0, ay = 0;
  for (const p of s.pluses) {
    const dx = p.x - s.x, dy = p.y - s.y;
    const d2 = dx * dx + dy * dy + s.o.soft * s.o.soft;
    const inv = s.o.G / Math.pow(d2, 1.5);
    ax += dx * inv; ay += dy * inv;
  }
  const damp = Math.exp(-s.o.damp * dt);
  s.vx = (s.vx + ax * dt) * damp;
  s.vy = (s.vy + ay * dt) * damp;
  s.x += s.vx * dt; s.y += s.vy * dt;
  // hand over to a steady orbit once it has fallen to the orbit radius of some plus
  for (const p of s.pluses) {
    const dx = s.x - p.x, dy = s.y - p.y, d = Math.hypot(dx, dy);
    if (d <= ORBIT_R * 1.05) {
      s.held = p;
      s.angle = Math.atan2(dy, dx);
      // keep the turning sense and roughly the speed it arrived with
      const cross = dx * s.vy - dy * s.vx;
      const speed = Math.max(140, Math.min(230, Math.hypot(s.vx, s.vy)));
      s.omega = (cross >= 0 ? 1 : -1) * speed / ORBIT_R;
      s.x = p.x + ORBIT_R * Math.cos(s.angle);
      s.y = p.y + ORBIT_R * Math.sin(s.angle);
      break;
    }
  }
  return s;
}

// Run a round headlessly: returns which plus captured and when (or null if none within `max`).
export function simulate(init, max = 8, dt = 1 / 120, opts = {}) {
  const s = createCapture(init, opts);
  while (s.t < max) {
    step(s, dt);
    if (s.held) return { plus: s.pluses.indexOf(s.held), t: s.t };
  }
  return null;
}
