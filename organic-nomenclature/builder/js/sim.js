// Prototype lab page — thin wrapper over the shared lab factory (js/lab.js).
// This page keeps the live formula readout; the in-game build direction hides it
// (predict-before-reveal: the student builds toward a NAME, then Checks).
import { createLab } from "../../js/lab.js";

const readout = document.querySelector("#readout");

const lab = createLab(document.querySelector("#lab"), {
  onChange() {
    const fs = lab.formulas();
    readout.innerHTML = fs.length
      ? `On the canvas: ${fs.map((f) => `<strong>${f.replace(/\d+/g, (d) => `<sub>${d}</sub>`)}</strong>`).join(" &nbsp;·&nbsp; ")}`
      : "The canvas is empty — drag a carbon out of the tray.";
  }
});

document.querySelector("#resetBtn").addEventListener("click", () => lab.reset());
lab.reset(); // paints the initial readout

// Debug/driving handle for headless verification — not part of the game surface.
window.__lab = lab;
