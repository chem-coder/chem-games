// Cathode materials deck — DRAFT content, not yet wired into the app shell.
// Schema matches the electrolytes deck. All voltages vs Li+/Li unless stated.
// Specs chips: [voltage, practical capacity, structure/space group] — exactly 3.

window.LIB_CATHODES_DRAFT = {
  categories: {
    layered:  { label: "Layered oxides",       color: "plum" },
    spinel:   { label: "Spinels",              color: "teal" },
    olivine:  { label: "Olivines / polyanion", color: "amber" },
  },
  cards: [
    // ------------------------------------------------------------ LAYERED
    {
      id: "lco",
      abbr: "LCO",
      name: "Lithium cobalt oxide",
      category: "layered",
      tagline: "Goodenough's 1980 original — it still runs your phone.",
      formulaHtml: "LiCoO<sub>2</sub>",
      specs: ["~3.9 V avg vs Li⁺/Li", "140–165 mAh/g practical", "R-3m layered (O3)"],
      facts: [
        "LCO powers nearly every smartphone and laptop because its dense crystal (~5.1 g/cm³) and high voltage give the best volumetric energy density of any commercial cathode — the property that matters most when the battery must fit inside a thin device.",
        "Theoretical capacity is 274 mAh/g, but only about half the lithium can be removed safely: charging past ~4.35 V vs Li⁺/Li triggers phase transitions, cobalt dissolution, and oxygen loss that collapse the layered structure. Modern doped LCO pushes the cutoff to ~4.45–4.5 V to reach ~165–185 mAh/g.",
        "Goodenough and Mizushima published LiCoO₂ at Oxford in 1980; Sony paired it with a carbon anode in 1991 to launch the first commercial lithium-ion battery. Goodenough shared the 2019 Nobel Prize in Chemistry for this line of work.",
      ],
      claims: [
        "This was the cathode in the first commercial Li-ion cell (Sony, 1991).",
        "Highest volumetric energy density in the deck — which is why it still dominates phones and laptops.",
        "Its usable capacity is capped near half the theoretical 274 mAh/g by structural collapse above ~4.35 V.",
      ],
      lattice: {
        kind: "layered",
        note: "O3 stacking: slabs of edge-sharing CoO₆ octahedra alternate with flat Li planes (ABC oxygen stacking, R-3m). Li diffuses in 2D within the interlayer planes — show arrows confined to the Li plane.",
      },
    },
    {
      id: "nmc",
      abbr: "NMC",
      name: "Lithium nickel manganese cobalt oxide (family)",
      category: "layered",
      tagline: "Dial the Ni:Mn:Co ratio — 111 to 811: more nickel, more capacity, more trouble.",
      formulaHtml: "LiNi<sub>x</sub>Mn<sub>y</sub>Co<sub>z</sub>O<sub>2</sub>",
      specs: ["~3.8 V avg vs Li⁺/Li", "160–200 mAh/g practical (111→811)", "R-3m layered"],
      facts: [
        "NMC is the workhorse EV cathode outside China, and each metal has a job: nickel carries the capacity, cobalt keeps the layers ordered and the rate high, manganese sits inert as Mn⁴⁺ and stabilizes the structure. The march 111 → 532 → 622 → 811 was driven by cobalt's cost and the ethics of its Congo-dominated supply chain.",
        "Ni-rich grades fail by well-mapped modes: Ni²⁺ (69 pm, close to Li⁺'s 76 pm) swaps onto Li sites (cation mixing); the H2→H3 phase transition near top of charge abruptly shrinks the c-axis and micro-cracks the polycrystalline secondary particles; and the particle surface reconstructs into inert rock-salt NiO while releasing gas.",
        "NMC811 delivers ~200 mAh/g practical, and the frontier has moved to ≥90% Ni compositions and single-crystal particles, which resist the micro-cracking that fragments conventional polycrystalline ones.",
      ],
      claims: [
        "Its grades are named by transition-metal ratio: 111, 532, 622, 811.",
        "It divides the labor across three metals: Ni for capacity, Co for layer order and rate, Mn as an inactive +4 stabilizer.",
        "Cutting this material's cobalt from one-third of the metal to one-tenth defined the industry's nickel-rich decade.",
      ],
      lattice: {
        kind: "layered",
        note: "Same O3 R-3m framework as LCO, but the transition-metal slab is a mixed Ni/Mn/Co occupancy (color the octahedra three ways at the chosen ratio). 2D Li diffusion between slabs. For the Ni-rich variant, show one or two Ni atoms sitting in the Li plane (cation mixing).",
      },
    },
    {
      id: "nca",
      abbr: "NCA",
      name: "Lithium nickel cobalt aluminum oxide",
      category: "layered",
      tagline: "Nickel-rich with a pinch of aluminum — the Tesla/Panasonic chemistry.",
      formulaHtml: "LiNi<sub>0.8</sub>Co<sub>0.15</sub>Al<sub>0.05</sub>O<sub>2</sub>",
      specs: ["~3.8 V avg vs Li⁺/Li", "~190–200 mAh/g practical", "R-3m layered"],
      facts: [
        "NCA is the chemistry Panasonic mass-produces for Tesla's cylindrical cells (18650, then 2170) — one of the first nickel-rich cathodes in high-volume EV production, on the road since the 2012 Model S.",
        "The aluminum gives no capacity at all: Al³⁺ is electrochemically inactive. Its strong Al–O bonds pin the layered lattice in place, suppressing the damaging phase transitions at high charge and improving thermal stability over what plain nickel oxide would allow.",
        "Pure LiNiO₂ has been known since the 1950s but was never commercialized — it cannot be made perfectly stoichiometric and is dangerously unstable when charged. NCA is the practical fix: keep nickel's capacity, tame it with Co and ~5% Al.",
      ],
      claims: [
        "Aluminum, not manganese, is its stabilizing dopant.",
        "This is the chemistry Panasonic builds for Tesla's cylindrical cells.",
        "It is essentially a tamed LiNiO₂ — about 5% of an inactive metal makes nickel oxide usable.",
      ],
      lattice: {
        kind: "layered",
        note: "O3 R-3m like LCO/NMC. Slab is mostly NiO₆ octahedra with sparse Co and isolated Al octahedra — highlight one Al octahedron as a structural 'pin'. 2D Li diffusion between slabs.",
      },
    },
    {
      id: "lmr",
      abbr: "LMR",
      name: "Lithium- and manganese-rich layered oxide",
      category: "layered",
      tagline: "Extra lithium, oxygen redox, record capacity — and a voltage that fades every cycle.",
      formulaHtml: "xLi<sub>2</sub>MnO<sub>3</sub>·(1−x)LiMO<sub>2</sub>",
      specs: ["~3.6 V avg vs Li⁺/Li (sloping)", "250–300 mAh/g practical", "R-3m + C2/m composite"],
      facts: [
        "Written xLi₂MnO₃·(1−x)LiMO₂: the excess lithium sits inside the transition-metal layer, forming honeycomb-ordered Li₂MnO₃-like domains (monoclinic C2/m) inside the normal layered R-3m framework. The reward is 250–300 mAh/g — the highest capacity of any oxide cathode.",
        "The extra capacity comes from oxidizing the lattice oxygen itself (anion redox), unlocked by a one-time 'activation' plateau near 4.5 V on the first charge — beyond that point the material gives more charge than its transition metals alone can account for.",
        "Its signature failure is voltage fade: transition metals migrate during cycling and the layered domains slowly convert toward spinel-like order, so the average discharge voltage drops cycle after cycle, with large charge/discharge hysteresis. This — not capacity loss — has kept LMR out of mass production for two decades.",
      ],
      claims: [
        "Highest capacity in the deck, 250–300 mAh/g, partly supplied by oxygen (anion) redox.",
        "It needs a one-time activation plateau near 4.5 V on its first charge.",
        "Voltage fade, not capacity fade, is its signature failure mode.",
      ],
      lattice: {
        kind: "layered",
        note: "Layered slabs in which some transition-metal sites are occupied by Li, giving honeycomb LiMn₆ ordering (Li₂MnO₃ C2/m domains) coexisting with normal LiMO₂ regions. Show the honeycomb pattern in plan view of one slab, plus the usual 2D Li planes.",
      },
    },
    // ------------------------------------------------------------- SPINEL
    {
      id: "lmo",
      abbr: "LMO",
      name: "Lithium manganese oxide (spinel)",
      category: "spinel",
      tagline: "The 4 V manganese spinel — cheap and safe until Mn³⁺ starts misbehaving.",
      formulaHtml: "LiMn<sub>2</sub>O<sub>4</sub>",
      specs: ["~4.05 V avg vs Li⁺/Li", "100–120 mAh/g practical", "Fd-3m spinel"],
      facts: [
        "Cheap, abundant manganese plus fast 3D lithium transport made LMO the cathode of power tools and first-generation EVs — the 2011 Nissan Leaf pack was LMO-based (blended with layered oxide) — though its modest capacity keeps it out of modern long-range packs.",
        "Lithium occupies tetrahedral 8a sites and hops through an interconnected 3D channel network (8a–16c–8a paths) in the Mn₂O₄ framework — this three-dimensional diffusion is why spinels handle high current so well.",
        "Its classic failure is manganese chemistry: Mn³⁺ is a Jahn–Teller ion, so when the average Mn oxidation state falls below +3.5 near end of discharge the cubic lattice distorts; worse, Mn³⁺ disproportionates (2Mn³⁺ → Mn⁴⁺ + Mn²⁺) and the dissolved Mn²⁺ — accelerated by HF traces from LiPF₆ — crosses the cell and poisons the graphite anode's SEI. Thackeray identified the spinel in Goodenough's Oxford lab in 1983.",
      ],
      claims: [
        "Its entire capacity rides on the Mn³⁺/Mn⁴⁺ couple — no other metal contributes.",
        "It was the manganese-based cathode blended into the first-generation Nissan Leaf pack.",
        "The 1983 spinel from Thackeray's work in Goodenough's lab — the second of Goodenough's three cathode families.",
      ],
      lattice: {
        kind: "spinel",
        note: "Fd-3m: Mn on 16d octahedral sites forming an edge-sharing Mn₂O₄ framework; Li on 8a tetrahedral sites. Show the 3D interconnected diffusion channels (8a–16c–8a) — arrows in three directions, contrasting with the layered cards' 2D planes.",
      },
    },
    {
      id: "lnmo",
      abbr: "LNMO",
      name: "Lithium nickel manganese oxide (high-voltage spinel)",
      category: "spinel",
      tagline: "The 4.7 V spinel — cobalt-free energy, if only an electrolyte could survive it.",
      formulaHtml: "LiNi<sub>0.5</sub>Mn<sub>1.5</sub>O<sub>4</sub>",
      specs: ["~4.7 V plateau vs Li⁺/Li", "~135 mAh/g practical", "Fd-3m spinel (or P4₃32 ordered)"],
      facts: [
        "Replacing one quarter of LMO's manganese with nickel moves the working couple to Ni²⁺/Ni⁴⁺ at ~4.7 V — the highest operating plateau of any near-commercial cathode. That voltage lets a cobalt-free material reach energy density competitive with NMC.",
        "Manganese ideally stays inert as Mn⁴⁺, sidestepping LMO's Jahn–Teller problem, while the two-electron nickel couple does all the work. It exists in a Ni/Mn-disordered Fd-3m form and an ordered P4₃32 form; the disordered one usually cycles better.",
        "The obstacle is not the cathode but the electrolyte: standard carbonate electrolytes oxidize above ~4.5 V, so LNMO continuously decomposes the electrolyte at its own surface. The material has waited decades for a high-voltage-stable electrolyte to unlock it.",
      ],
      claims: [
        "It operates at ~4.7 V — the highest voltage plateau in the deck.",
        "A cobalt-free chemistry blocked from market not by its own degradation but by electrolyte oxidation above ~4.5 V.",
        "A two-electron Ni²⁺/Ni⁴⁺ couple supplies all its capacity while Mn⁴⁺ only holds the frame.",
      ],
      lattice: {
        kind: "spinel",
        note: "Same Fd-3m spinel framework as LMO, but one in four 16d octahedra is Ni (two-tone octahedra). Optionally show the ordered P4₃32 variant's Ni/Mn pattern. 3D 8a–16c Li channels as in LMO.",
      },
    },
    // ------------------------------------------------------------ OLIVINE
    {
      id: "lfp",
      abbr: "LFP",
      name: "Lithium iron phosphate",
      category: "olivine",
      tagline: "Written off as too slow, rescued by carbon and nano — now in roughly half of new EVs.",
      formulaHtml: "LiFePO<sub>4</sub>",
      specs: ["3.4 V flat plateau vs Li⁺/Li", "~160 mAh/g practical", "Pnma olivine"],
      facts: [
        "LFP is the safety benchmark: strong covalent P–O bonds lock the oxygen into the phosphate, so thermal runaway starts only around ~270 °C — far above nickel-rich layered oxides (~200 °C) — and releases much less heat. Safety plus cheap iron is why CATL and BYD cell-to-pack designs (BYD's Blade) pushed LFP to roughly 40% of the global cathode market.",
        "It works by a two-phase reaction between LiFePO₄ and FePO₄, which produces its famously flat 3.4 V plateau (and makes state-of-charge hard to read from voltage). Lithium moves only through 1D channels along the b-axis, so a single Fe-on-Li antisite defect can block an entire channel.",
        "Padhi and Goodenough published it in 1997 and it was widely dismissed as too insulating (~10⁻⁹ S/cm). Carbon coating (Ravet and Armand, 1999) plus nano-sizing fixed the kinetics — the famous rescue — and after years of patent litigation, expiring patents and Chinese pack engineering made LFP the comeback story of the 2020s.",
      ],
      claims: [
        "It discharges on one dead-flat 3.4 V plateau, the signature of a two-phase reaction.",
        "The safest major cathode: thermal runaway onset around 270 °C.",
        "This is the chemistry inside BYD's Blade battery.",
      ],
      lattice: {
        kind: "olivine",
        note: "Pnma: corner-sharing FeO₆ octahedra braced by PO₄ tetrahedra pillars; Li sits in 1D channels running along [010]. Draw one channel with Li hopping along it, and show an Fe antisite defect plugging a channel to illustrate 1D fragility.",
      },
    },
    {
      id: "lmfp",
      abbr: "LMFP",
      name: "Lithium manganese iron phosphate",
      category: "olivine",
      tagline: "LFP's higher-voltage sibling: swap in manganese, gain a 4.1 V step.",
      formulaHtml: "LiMn<sub>1−x</sub>Fe<sub>x</sub>PO<sub>4</sub>",
      specs: ["4.1 / 3.5 V dual plateaus vs Li⁺/Li", "~150 mAh/g practical", "Pnma olivine"],
      facts: [
        "The Mn²⁺/Mn³⁺ couple in the olivine runs at ~4.1 V versus iron's ~3.5 V, so at similar capacity LMFP stores roughly 15–20% more energy than LFP while keeping the phosphate's safety and cheap-metal logic.",
        "Pure LiMnPO₄ is nearly electrochemically dead — conductivity even worse than uncoated LiFePO₄, plus Jahn–Teller strain from Mn³⁺ at the moving phase boundary. Substituting iron onto the metal site (typically 20–40%) rescues the kinetics; the discharge curve then shows a two-step staircase, one plateau per couple.",
        "It is positioned as the drop-in upgrade for existing LFP lines: CATL announced its M3P chemistry (an LMFP-type phosphate) in 2022–2023, and several Chinese makers ship LMFP blended with LFP or NMC.",
      ],
      claims: [
        "Its discharge is a two-step staircase: ~4.1 V from manganese, then ~3.5 V from iron.",
        "Its pure-manganese end member is almost electrochemically inactive until iron is substituted in.",
        "CATL's M3P is its best-known commercial incarnation.",
      ],
      lattice: {
        kind: "olivine",
        note: "Same Pnma olivine framework as LFP with Mn and Fe mixed on the metal site — draw two-tone MO₆ octahedra plus PO₄ pillars, and the same 1D [010] Li channels.",
      },
    },
  ],
};
