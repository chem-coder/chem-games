// A minus flying among slowly drifting pluses under inverse-square attraction. Pure math, no
// DOM: used by the storyboard and testable in Node.
//
// There is no scripted orbit and no hand-over. The electron always obeys the forces. Energy
// loss (standing in for the light a real capture gives off) is applied in two parts:
//  - the in-out (radial) part of its velocity relative to the nearest plus is damped always,
//    which rounds any path into a circle;
//  - the sideways (tangential) part is damped only while it is still outside the orbit
//    radius, so the orbit shrinks to ORBIT_R and no further.
// A head-on electron has no sideways motion, so it never orbits: it falls through and out. The
// storyboard does not show those rounds; `simulate` reports them as not captured.
export const ORBIT_R = 52;
export const DEFAULTS = { soft: 18, G: 2.2e6, radialDamp: 6, tangentialDamp: 2.2, zone: 3.4, cushion: 2500 };
export const DT = 1 / 120; // fixed integration step: the live screen and the headless check agree

// A plus may carry `home: { x, y, r }`: it drifts freely inside that patch and is turned
// back at its edge, so two pluses never wander into each other or off the stage.
export function createCapture({ pluses, x, y, vx, vy }, opts = {}) {
  const ps = pluses.map((p) => ({ x: p.x, y: p.y, vx: p.vx || 0, vy: p.vy || 0, home: p.home ? { ...p.home } : null }));
  return { pluses: ps, x, y, vx, vy, t: 0, o: { ...DEFAULTS, ...opts }, nearest: null, inOrbitFor: 0, sweep: 0, lastAngle: null };
}

export function step(s, dt) {
  s.t += dt;
  for (const p of s.pluses) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.home) {
      const hx = p.x - p.home.x, hy = p.y - p.home.y, hd = Math.hypot(hx, hy);
      if (hd > p.home.r) {
        // at the patch edge: step back inside and reflect the outward part of the velocity
        const nx = hx / hd, ny = hy / hd;
        p.x = p.home.x + nx * p.home.r; p.y = p.home.y + ny * p.home.r;
        const out = p.vx * nx + p.vy * ny;
        if (out > 0) { p.vx -= 2 * out * nx; p.vy -= 2 * out * ny; }
      }
    }
  }
  // attraction from every plus: full inverse-square pull everywhere, so an orbit at the
  // radius has the force it needs. Inside the radius a smooth, steep cushion pushes back
  // (it should rarely act: the energy loss below removes the inward motion before arrival).
  let ax = 0, ay = 0, nearest = null, nd = Infinity;
  for (const p of s.pluses) {
    const dx = p.x - s.x, dy = p.y - s.y;
    const d2 = dx * dx + dy * dy;
    const d = Math.sqrt(d2) || 1e-6;
    let inv = s.o.G / Math.pow(d2 + s.o.soft * s.o.soft, 1.5);
    if (d < ORBIT_R) inv -= (s.o.cushion * (Math.pow(ORBIT_R / d, 6) - 1)) / d; // cushion is an acceleration in px/s²
    ax += dx * inv; ay += dy * inv;
    if (d2 < nd) { nd = d2; nearest = p; }
  }
  s.vx += ax * dt; s.vy += ay * dt;
  // energy loss, split into radial and tangential parts relative to the nearest plus
  const rx = s.x - nearest.x, ry = s.y - nearest.y, r = Math.hypot(rx, ry) || 1e-6;
  const ux = rx / r, uy = ry / r;
  const vrelx = s.vx - nearest.vx, vrely = s.vy - nearest.vy;
  let vr = vrelx * ux + vrely * uy;
  let vt = -vrelx * uy + vrely * ux;
  // energy loss only in the capture zone around a plus; far away the fly-in is pure inverse-square
  if (r < ORBIT_R * s.o.zone) {
    const w = 1 - r / (ORBIT_R * s.o.zone);                       // 0 at the zone edge, 1 at the centre
    vr *= Math.exp(-s.o.radialDamp * w * dt);
    // sideways motion is drained only while the electron carries more angular momentum than
    // a circular orbit at ORBIT_R needs; then it stops, and the orbit it settles into is that
    // circle at full speed
    const vCirc = Math.sqrt((s.o.G * ORBIT_R * ORBIT_R) / Math.pow(ORBIT_R * ORBIT_R + s.o.soft * s.o.soft, 1.5));
    if (Math.abs(vt) * r > vCirc * ORBIT_R * 1.02) vt *= Math.exp(-s.o.tangentialDamp * w * dt);
  }
  s.vx = nearest.vx + vr * ux - vt * uy;
  s.vy = nearest.vy + vr * uy + vt * ux;
  s.x += s.vx * dt; s.y += s.vy * dt;
  // safety only: the well above keeps the electron out; this clamp should never fire
  for (const p of s.pluses) {
    const fx = s.x - p.x, fy = s.y - p.y, fd = Math.hypot(fx, fy) || 1e-6;
    if (fd < ORBIT_R * 0.85) { s.x = p.x + (fx / fd) * ORBIT_R * 0.85; s.y = p.y + (fy / fd) * ORBIT_R * 0.85; s.clamped = (s.clamped || 0) + 1; }
  }
  // bookkeeping: how long it has stayed near the orbit radius, and how far it has swept
  const r2 = Math.hypot(s.x - nearest.x, s.y - nearest.y);
  const ang = Math.atan2(s.y - nearest.y, s.x - nearest.x);
  if (s.nearest === nearest && r2 > ORBIT_R * 0.5 && r2 < ORBIT_R * 1.6) {
    s.inOrbitFor += dt;
    if (s.lastAngle !== null) { let da = ang - s.lastAngle; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; s.sweep += da; }
  } else { s.inOrbitFor = 0; s.sweep = 0; }
  s.nearest = nearest; s.lastAngle = ang;
  return s;
}

export const captured = (s) => s.inOrbitFor >= 0.7;
export const laps = (s) => Math.abs(s.sweep) / (2 * Math.PI);
export const speed = (s) => Math.hypot(s.vx, s.vy);

// Run a round headlessly: which plus captured it and when, or null if not within `max` s.
// Advance by any wall-clock dt using fixed sub-steps.
export function advance(s, dt) {
  s.acc = (s.acc || 0) + dt;
  while (s.acc >= DT) { step(s, DT); s.acc -= DT; }
  return s;
}

// Also reports the closest the electron ever came to any plus, so a screen can reject rounds
// that dive through a plus before settling.
export function simulate(init, max = 8, dt = DT, opts = {}) {
  const s = createCapture(init, opts);
  let minD = Infinity;
  while (s.t < max) {
    step(s, dt);
    for (const p of s.pluses) minD = Math.min(minD, Math.hypot(s.x - p.x, s.y - p.y));
    if (captured(s)) return { plus: s.pluses.indexOf(s.nearest), t: s.t - s.inOrbitFor, minD };
  }
  return null;
}
