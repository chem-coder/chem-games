(function () {
  "use strict";

  const canvas = document.querySelector("#balloonCanvas");
  const ctx = canvas.getContext("2d");
  const tempSlider = document.querySelector("#temperatureSlider");
  const tempReadout = document.querySelector("#temperatureReadout");

  const state = {
    temperatureC: Number(tempSlider.value),
    previousTemperatureC: Number(tempSlider.value),
    trend: "up",
    frame: 0,
    snow: [],
    leaves: [],
    particles: []
  };

  function makeSnowflake() {
    return {
      x: Math.random(),
      y: Math.random(),
      r: 1.4 + Math.random() * 2.8,
      speed: 0.001 + Math.random() * 0.002,
      sway: Math.random() * Math.PI * 2
    };
  }

  function makeLeaf() {
    return {
      x: Math.random(),
      y: Math.random(),
      r: 4 + Math.random() * 5,
      speed: 0.0012 + Math.random() * 0.0022,
      sway: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? "#c96f2d" : "#b34d34"
    };
  }

  function makeParticle() {
    return {
      x: (Math.random() - 0.5) * 1.2,
      y: (Math.random() - 0.5) * 1.2,
      vx: (Math.random() - 0.5) * 0.013,
      vy: (Math.random() - 0.5) * 0.013,
      r: 3 + Math.random() * 2.5
    };
  }

  for (let i = 0; i < 95; i += 1) {
    state.snow.push(makeSnowflake());
  }

  for (let i = 0; i < 44; i += 1) {
    state.leaves.push(makeLeaf());
  }

  for (let i = 0; i < 34; i += 1) {
    state.particles.push(makeParticle());
  }

  function season() {
    if (state.temperatureC < 0) {
      return "winter";
    }
    if (state.temperatureC >= 25) {
      return "summer";
    }
    return state.trend === "down" ? "autumn" : "spring";
  }

  function temperatureScale() {
    return (state.temperatureC - Number(tempSlider.min)) / (Number(tempSlider.max) - Number(tempSlider.min));
  }

  function balloonGeometry() {
    const w = canvas.width;
    const h = canvas.height;
    const scale = 0.75 + temperatureScale() * 0.38;
    return {
      cx: w * 0.47,
      cy: h * 0.45,
      rx: 122 * scale,
      ry: 152 * scale,
      neck: 22 * scale
    };
  }

  function updateReadout() {
    tempReadout.textContent = `${state.temperatureC} C`;
  }

  function setTemperature(value) {
    state.previousTemperatureC = state.temperatureC;
    state.temperatureC = Number(value);
    if (state.temperatureC > state.previousTemperatureC) {
      state.trend = "up";
    } else if (state.temperatureC < state.previousTemperatureC) {
      state.trend = "down";
    }
    updateReadout();
  }

  function draw() {
    const activeSeason = season();
    const geometry = balloonGeometry();
    drawEnvironment(activeSeason, geometry);
    drawTemperatureArrow(activeSeason);
    drawBalloon(geometry);
    drawThread(geometry);
    state.frame += 1;
    requestAnimationFrame(draw);
  }

  function drawEnvironment(activeSeason, geometry) {
    if (activeSeason === "winter") {
      drawSky("#c8d7e5", "#edf6fb");
      drawGround("#f1f7fa", "#dfeef5");
      drawBareTrees();
      drawSnow(geometry);
      return;
    }

    if (activeSeason === "summer") {
      drawSky("#7fc8f2", "#dff5ff");
      drawSun(canvas.width * 0.83, canvas.height * 0.17, 52);
      drawGround("#5cad53", "#2d833f");
      drawSummerTrees();
      return;
    }

    if (activeSeason === "autumn") {
      drawSky("#f3c27a", "#f8e1bd");
      drawSun(canvas.width * 0.82, canvas.height * 0.18, 38);
      drawGround("#b48a47", "#856b35");
      drawAutumnTrees();
      drawLeaves(geometry);
      return;
    }

    drawSky("#9fd7f0", "#e8f9ff");
    drawSun(canvas.width * 0.82, canvas.height * 0.18, 42);
    drawGround("#81bf6b", "#449851");
    drawSpringTrees();
    drawFlowers();
  }

  function drawSky(top, bottom) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(0.68, bottom);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGround(top, bottom) {
    const y = canvas.height * 0.73;
    const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.25, y - 22, canvas.width * 0.55, y + 20, canvas.width, y - 8);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function drawSun(x, y, r) {
    const glow = ctx.createRadialGradient(x, y, 5, x, y, r * 2.3);
    glow.addColorStop(0, "rgba(255, 231, 118, 0.95)");
    glow.addColorStop(0.45, "rgba(255, 204, 68, 0.45)");
    glow.addColorStop(1, "rgba(255, 204, 68, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd45a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTree(x, baseY, trunkH, canopyColor, bare) {
    ctx.strokeStyle = "#4b3222";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY - trunkH);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, baseY - trunkH * 0.55);
    ctx.lineTo(x - 38, baseY - trunkH * 0.95);
    ctx.moveTo(x, baseY - trunkH * 0.62);
    ctx.lineTo(x + 35, baseY - trunkH * 0.98);
    ctx.stroke();

    if (bare) {
      return;
    }

    ctx.fillStyle = canopyColor;
    for (let i = 0; i < 7; i += 1) {
      const angle = (i / 7) * Math.PI * 2;
      const px = x + Math.cos(angle) * 33;
      const py = baseY - trunkH - 8 + Math.sin(angle) * 22;
      ctx.beginPath();
      ctx.arc(px, py, 38, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBareTrees() {
    const base = canvas.height * 0.77;
    drawTree(canvas.width * 0.15, base, 120, "#8aa68a", true);
    drawTree(canvas.width * 0.88, base + 10, 105, "#8aa68a", true);
  }

  function drawSummerTrees() {
    const base = canvas.height * 0.77;
    drawTree(canvas.width * 0.14, base, 130, "#2e8b43", false);
    drawTree(canvas.width * 0.88, base + 12, 115, "#287d3d", false);
  }

  function drawSpringTrees() {
    const base = canvas.height * 0.77;
    drawTree(canvas.width * 0.14, base, 120, "#78b95d", false);
    drawTree(canvas.width * 0.88, base + 12, 112, "#6fbf6a", false);
  }

  function drawAutumnTrees() {
    const base = canvas.height * 0.77;
    drawTree(canvas.width * 0.14, base, 122, "#d17c32", false);
    drawTree(canvas.width * 0.88, base + 12, 112, "#b84f35", false);
  }

  function drawFlowers() {
    ctx.fillStyle = "#f7f1f4";
    for (let i = 0; i < 42; i += 1) {
      const x = (i * 73) % canvas.width;
      const y = canvas.height * (0.79 + ((i * 17) % 16) / 100);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function isInsideBalloon(x, y, geometry) {
    const dx = (x - geometry.cx) / (geometry.rx * 1.05);
    const dy = (y - geometry.cy) / (geometry.ry * 1.05);
    return dx * dx + dy * dy < 1;
  }

  function drawSnow(geometry) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    state.snow.forEach((flake) => {
      flake.y += flake.speed;
      flake.sway += 0.018;
      if (flake.y > 1.02) {
        flake.y = -0.04;
        flake.x = Math.random();
      }
      const x = flake.x * canvas.width + Math.sin(flake.sway) * 20;
      const y = flake.y * canvas.height;
      if (isInsideBalloon(x, y, geometry)) {
        return;
      }
      ctx.beginPath();
      ctx.arc(x, y, flake.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawLeaves(geometry) {
    state.leaves.forEach((leaf) => {
      leaf.y += leaf.speed;
      leaf.sway += 0.025;
      if (leaf.y > 1.03) {
        leaf.y = -0.04;
        leaf.x = Math.random();
      }
      const x = leaf.x * canvas.width + Math.sin(leaf.sway) * 24;
      const y = leaf.y * canvas.height;
      if (isInsideBalloon(x, y, geometry)) {
        return;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(leaf.sway) * 0.8);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.r * 1.6, leaf.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawTemperatureArrow(activeSeason) {
    const x = canvas.width * 0.78;
    const y = canvas.height * 0.43;
    const goingUp = activeSeason === "spring" || activeSeason === "summer";
    const arrowColor = goingUp ? "#c33863" : "#286bd8";
    const top = goingUp ? y - 70 : y + 70;
    const bottom = goingUp ? y + 48 : y - 48;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.strokeStyle = "rgba(45, 67, 78, 0.18)";
    ctx.lineWidth = 2;
    roundRect(x - 54, y - 96, 108, 176, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#253942";
    ctx.font = "900 58px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T", x - 12, y - 4);

    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 28, bottom);
    ctx.lineTo(x + 28, top);
    ctx.stroke();

    ctx.beginPath();
    if (goingUp) {
      ctx.moveTo(x + 28, top - 12);
      ctx.lineTo(x + 10, top + 18);
      ctx.lineTo(x + 46, top + 18);
    } else {
      ctx.moveTo(x + 28, top + 12);
      ctx.lineTo(x + 10, top - 18);
      ctx.lineTo(x + 46, top - 18);
    }
    ctx.closePath();
    ctx.fill();

    ctx.font = "800 18px system-ui, sans-serif";
    ctx.fillText(goingUp ? "up" : "down", x, y + 58);
    ctx.restore();
  }

  function drawBalloonPath(geometry) {
    const { cx, cy, rx, ry, neck } = geometry;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.bezierCurveTo(cx - rx * 0.95, cy - ry * 0.95, cx - rx * 1.05, cy + ry * 0.12, cx - rx * 0.48, cy + ry * 0.78);
    ctx.bezierCurveTo(cx - neck * 1.2, cy + ry * 1.05, cx + neck * 1.2, cy + ry * 1.05, cx + rx * 0.48, cy + ry * 0.78);
    ctx.bezierCurveTo(cx + rx * 1.05, cy + ry * 0.12, cx + rx * 0.95, cy - ry * 0.95, cx, cy - ry);
    ctx.closePath();
  }

  function drawBalloon(geometry) {
    drawBalloonPath(geometry);
    ctx.save();
    ctx.clip();
    moveGasParticles(geometry);
    drawGasParticles(geometry);
    ctx.restore();

    drawBalloonPath(geometry);
    const fill = ctx.createRadialGradient(
      geometry.cx - geometry.rx * 0.18,
      geometry.cy - geometry.ry * 0.14,
      geometry.rx * 0.1,
      geometry.cx,
      geometry.cy,
      geometry.rx * 1.05
    );
    fill.addColorStop(0, "rgba(255, 170, 194, 0.12)");
    fill.addColorStop(0.55, "rgba(255, 97, 150, 0.22)");
    fill.addColorStop(0.82, "rgba(218, 45, 105, 0.56)");
    fill.addColorStop(1, "rgba(164, 14, 70, 0.82)");
    ctx.fillStyle = fill;
    ctx.fill();

    drawBalloonPath(geometry);
    ctx.strokeStyle = "rgba(132, 11, 57, 0.86)";
    ctx.lineWidth = 5;
    ctx.stroke();

    const highlight = ctx.createRadialGradient(
      geometry.cx - geometry.rx * 0.45,
      geometry.cy - geometry.ry * 0.48,
      0,
      geometry.cx - geometry.rx * 0.45,
      geometry.cy - geometry.ry * 0.48,
      geometry.rx * 0.62
    );
    highlight.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlight;
    drawBalloonPath(geometry);
    ctx.fill();
  }

  function moveGasParticles(geometry) {
    const speed = 0.45 + temperatureScale() * 1.8;
    state.particles.forEach((particle) => {
      particle.x += particle.vx * speed;
      particle.y += particle.vy * speed;
      const edge = (particle.x * particle.x) + (particle.y * particle.y);
      if (edge > 0.82) {
        particle.vx *= -1;
        particle.vy *= -1;
        particle.x *= 0.96;
        particle.y *= 0.96;
      }
      particle.x = Math.max(-0.92, Math.min(0.92, particle.x));
      particle.y = Math.max(-0.92, Math.min(0.92, particle.y));
    });
  }

  function drawGasParticles(geometry) {
    const hot = temperatureScale();
    const particleColor = hot > 0.65 ? "#d84f3f" : hot < 0.25 ? "#2a72c7" : "#7d4eb0";
    state.particles.forEach((particle) => {
      const x = geometry.cx + particle.x * geometry.rx * 0.72;
      const y = geometry.cy + particle.y * geometry.ry * 0.68;
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(x, y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawThread(geometry) {
    const neckY = geometry.cy + geometry.ry * 0.9;
    const startX = geometry.cx;
    const startY = neckY - 8;
    const endY = canvas.height * 0.88;

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX - 28, startY + 70, startX + 28, startY + 126, startX, endY);
    ctx.stroke();

    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.ellipse(startX, startY, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function handleTemperatureInput() {
    setTemperature(tempSlider.value);
  }

  tempSlider.addEventListener("input", handleTemperatureInput);
  tempSlider.addEventListener("change", handleTemperatureInput);

  updateReadout();
  draw();
})();
