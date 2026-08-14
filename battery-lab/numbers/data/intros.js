/*
  Cell Numbers — per-rung intro screens (content only).
  Each: steps (green-circle numbered list, house pattern) + one worked
  example shown inline. Unicode sub/superscripts; app upgrades markup.
*/

export const INTROS = {
  voltage: {
    lede: "Every cell voltage is a subtraction. Both electrodes are measured against the same yardstick — lithium metal — and the cell only ever sees the difference.",
    steps: [
      "Every electrode has an average potential vs Li⁺/Li: LFP 3.4 V, NMC ~3.8 V, graphite 0.1 V, LTO 1.55 V.",
      "Cell voltage = cathode potential − anode potential.",
      "The anode's job is to sit LOW: every volt it perches above lithium is a volt stolen from the cell — LTO's safe 1.55 V perch costs a volt and a half.",
    ],
    example: "NMC 811 on graphite: 3.8 − 0.1 = 3.7 V. The same cathode on LTO: 3.8 − 1.55 = 2.25 V.",
  },
  energy: {
    lede: "Energy is capacity times voltage — and the units are kind: mAh/g × V lands directly in Wh/kg.",
    steps: [
      "Specific energy = specific capacity × average voltage.",
      "mAh/g × V = mWh/g, and mWh/g is numerically identical to Wh/kg. No conversion factor to memorize.",
      "Material-level numbers are the ceiling: a 760 Wh/kg cathode figure becomes a ~280 Wh/kg cell once the anode, electrolyte, foils, separator, and can are weighed.",
    ],
    example: "NMC 811: 200 mAh/g × 3.8 V = 760 Wh/kg (material level).",
  },
  couple: {
    lede: "A cell carries the grams of BOTH electrodes, so capacities don't add — they combine like parallel resistors. This rung is why anode headlines disappoint.",
    steps: [
      "Every mAh must be stored twice: once in the cathode's grams, once in the anode's.",
      "Couple capacity: q = 1 / (1/q₊ + 1/q₋). Always worse than the weaker electrode alone.",
      "The famous consequence: swap graphite (372) for silicon (3579) against a 200 mAh/g cathode and the couple goes 130 → 189 mAh/g. Ten times the anode buys 45 percent.",
    ],
    example: "NMC 811 + graphite: 1/(1/200 + 1/372) = 130 mAh/g of combined electrodes.",
  },
  crate: {
    lede: "C-rate is current normalized by capacity — the field's way of comparing a coin cell and a truck pack in one number.",
    steps: [
      "1C is the current that empties (or fills) the cell in exactly one hour, whatever its size.",
      "Current: I = C-rate × capacity. A 5 Ah cell at 2C draws 10 A.",
      "Time: t = 60 min ÷ C-rate — capacity cancels out entirely.",
    ],
    example: "A 100 Ah EV cell at 0.5C: 50 A, empty in 120 minutes.",
  },
  areal: {
    lede: "The coater doesn't think in mAh/g — it thinks in milligrams per square centimeter. Areal capacity is where materials meet manufacturing.",
    steps: [
      "Areal capacity = loading (mg/cm²) × specific capacity (mAh/g) ÷ 1000.",
      "Commercial electrodes run about 2–4 mAh/cm².",
      "Thicker coatings store more per stack — but ions must cross the whole coating, so rate capability pays for every extra micron.",
    ],
    example: "LFP at 20 mg/cm²: 20 × 160 / 1000 = 3.2 mAh/cm².",
  },
  np: {
    lede: "The N/P ratio is the safety margin between fast charging and lithium plating — the last number checked before any cell design ships.",
    steps: [
      "N/P = negative (anode) areal capacity ÷ positive (cathode) areal capacity, matched face to face.",
      "Below 1.0 the anode overfills and lithium plates as metal — the dendrite scenario.",
      "Too far above 1.0 wastes anode and drags down first-cycle efficiency. Industry sits near 1.05–1.15.",
    ],
    example: "Anode 3.3 mAh/cm² over cathode 3.0 mAh/cm²: N/P = 1.10.",
  },
};
