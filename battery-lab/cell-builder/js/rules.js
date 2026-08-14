/*
  Full-Cell Builder — compatibility rule engine (pure: no DOM, no data
  imports; components arrive as a Map).

  A build is { cathode, anode, salt, cyclic, linear, film } — component ids,
  film may be null. evaluate() returns every teaching finding, not just the
  verdict: fails kill the cell, warns cost nothing but say something true,
  oks reinforce the rule that was successfully dodged. Every rule here is a
  fact the three card decks already teach — the builder is where they meet.
*/

/**
 * evaluate(build, byId) → {
 *   voltage: number|null   — cathode V minus anode V (avg vs Li⁺/Li)
 *   findings: [{ level: 'fail'|'warn'|'ok', text }]
 *   works: boolean         — no fail-level findings
 * }
 */
export function evaluate(build, byId) {
  const c = byId.get(build.cathode);
  const a = byId.get(build.anode);
  const salt = byId.get(build.salt);
  const cyc = byId.get(build.cyclic);
  const lin = byId.get(build.linear);
  const film = build.film ? byId.get(build.film) : null;

  const f = [];
  const fail = (text) => f.push({ level: "fail", text });
  const warn = (text) => f.push({ level: "warn", text });
  const ok = (text) => f.push({ level: "ok", text });

  const voltage = c && a ? Math.round((c.v - a.v) * 100) / 100 : null;

  /* ---- safety veto ---- */
  if (salt?.id === "liclo4") {
    fail("Perchlorate is a strong oxidant — with organic solvents this is a lab hazard, not a product. LiClO₄ never ships.");
  }

  /* ---- salt vs aluminum collector ---- */
  if (salt?.id === "litfsi" && c) {
    if (c.v > 3.7) {
      fail(`LiTFSI pits the aluminum collector above ~3.7 V — this cathode averages ${c.v} V. The cell eats its own foil.`);
    } else {
      ok(`LiTFSI would corrode aluminum above ~3.7 V, but ${c.abbr}'s ${c.v} V plateau stays under the threshold.`);
    }
  }

  /* ---- the 4.7 V trap ---- */
  if (c?.id === "lnmo") {
    fail("Nothing on this shelf survives 4.7 V — carbonate electrolytes oxidize above ~4.5 V at the cathode surface. LNMO is still waiting for its electrolyte.");
  }

  /* ---- dissociation needs a high-ε cyclic ---- */
  if (!cyc) {
    fail("No cyclic carbonate — without a high-ε solvent (EC or PC) the salt stays ion-paired and nothing conducts.");
  }

  /* ---- graphite's SEI story ---- */
  if (a?.id === "graphite" && cyc) {
    const protector = salt?.id === "libob" ? salt : film;
    if (cyc.id === "pc" && !protector) {
      fail("PC co-intercalates with Li⁺ and exfoliates graphite — the classic failure that stalled the field until EC. Protect the anode (LiBOB, VC, FEC) or switch the cyclic to EC.");
    } else if (cyc.id === "pc" && protector) {
      ok(`PC would exfoliate graphite, but ${protector.abbr} reduces first and builds the SEI before PC can get in.`);
    } else if (cyc.id === "ec") {
      ok("EC reduces at ~0.8 V on the first charge and builds the passivating SEI — the reaction that made the graphite anode possible.");
    }
  }

  /* ---- silicon's swelling ---- */
  if (a?.id === "si") {
    if (film?.id === "fec") {
      ok("FEC sheds fluorine as LiF and keeps rebuilding the SEI through silicon's ~300 % swelling.");
    } else {
      fail("Silicon swells ~300 % every cycle and shatters an ordinary SEI — without FEC this cell fades within dozens of cycles.");
    }
  }

  /* ---- lithium metal ---- */
  if (a?.id === "limetal") {
    if (salt?.id === "lifsi") {
      ok("LiFSI's LiF-rich interphase is the modern answer to lithium-metal plating — the salt of the Li-metal revival.");
    } else if (salt) {
      fail("Lithium metal plates dendrites in a standard electrolyte — the failure behind the 1989 Moli recall that pushed the industry to intercalation. Use LiFSI.");
    }
  }

  /* ---- honest warnings (true, but not fatal) ---- */
  if (salt?.id === "libf4") {
    warn("LiBF₄ dissociates poorly — room-temperature conductivity dips. Its payoff is the temperature extremes.");
  }
  if (salt?.id === "libob") {
    warn("LiBOB's solubility is marginal as a main salt — commercial cells use it at 1–2 %. Here it earns its keep as the SEI protector.");
  }
  if (lin?.id === "dmc") {
    warn("DMC freezes at 4.6 °C — fine indoors, risky in a cold pack.");
  }
  if (a?.id === "lto") {
    warn("LTO can't plate lithium or grow SEI — but its 1.55 V perch costs the cell a volt and a half of voltage.");
  }

  return { voltage, findings: f, works: !f.some((x) => x.level === "fail") };
}

/* ---------------- brief checks ---------------- */

const CHECKS = {
  cathodeIn: (build, byId, p) => p.ids.includes(build.cathode),
  anodeIn: (build, byId, p) => p.ids.includes(build.anode),
  saltIn: (build, byId, p) => p.ids.includes(build.salt),
  cathodeTag: (build, byId, p) => (byId.get(build.cathode)?.tags || []).includes(p.tag),
  minV: (build, byId, p) => {
    const c = byId.get(build.cathode);
    const a = byId.get(build.anode);
    return !!c && !!a && c.v - a.v >= p.v;
  },
  forbidSolvent: (build, byId, p) => build.cyclic !== p.id && build.linear !== p.id,
  requiresFilm: (build) => !!build.film,
};

/**
 * briefCheck(build, brief, byId) → { lines: [{ok, text}], met: boolean }
 * Checks are declarative { type, text, ...params }; text is the requirement
 * stated for the player, judged true/false against the build.
 */
export function briefCheck(build, brief, byId) {
  const lines = brief.needs.map((n) => ({
    ok: CHECKS[n.type](build, byId, n),
    text: n.text,
  }));
  return { lines, met: lines.every((l) => l.ok) };
}

/** every id slotted into a complete build (film optional) */
export function isComplete(build) {
  return !!(build.cathode && build.anode && build.salt && build.cyclic && build.linear);
}
