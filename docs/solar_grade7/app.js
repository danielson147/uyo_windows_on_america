const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

const speedControl = document.getElementById("speed");
const sizeControl = document.getElementById("size");
const speedValue = document.getElementById("speedValue");
const sizeValue = document.getElementById("sizeValue");
const showOrbits = document.getElementById("showOrbits");
const toggleButton = document.getElementById("toggle");
const resetButton = document.getElementById("reset");
const factCard = document.getElementById("factCard");

const center = { x: canvas.width / 2, y: canvas.height / 2 };

let isRunning = true;
let simulationTime = 0;
let speedMultiplier = Number(speedControl.value);
let sizeMultiplier = Number(sizeControl.value);

const planets = [
  {
    name: "Mercury",
    color: "#b8b8b8",
    orbitRadius: 60,
    radius: 4,
    orbitPeriod: 0.24,
    fact: "Mercury is the closest planet to the Sun and has almost no atmosphere.",
  },
  {
    name: "Venus",
    color: "#e8c67a",
    orbitRadius: 90,
    radius: 7,
    orbitPeriod: 0.62,
    fact: "Venus is the hottest planet because its thick atmosphere traps heat.",
  },
  {
    name: "Earth",
    color: "#59a8ff",
    orbitRadius: 125,
    radius: 7,
    orbitPeriod: 1.0,
    fact: "Earth is the only known planet that supports life and liquid water.",
  },
  {
    name: "Mars",
    color: "#e47f54",
    orbitRadius: 160,
    radius: 6,
    orbitPeriod: 1.88,
    fact: "Mars is called the Red Planet because of iron-rich dust on its surface.",
  },
  {
    name: "Jupiter",
    color: "#d5a36b",
    orbitRadius: 220,
    radius: 15,
    orbitPeriod: 11.86,
    fact: "Jupiter is the largest planet and has a giant storm called the Great Red Spot.",
  },
  {
    name: "Saturn",
    color: "#efd28f",
    orbitRadius: 280,
    radius: 13,
    orbitPeriod: 29.46,
    fact: "Saturn is famous for its bright rings made of ice and rock particles.",
  },
  {
    name: "Uranus",
    color: "#9ae7e5",
    orbitRadius: 330,
    radius: 10,
    orbitPeriod: 84.01,
    fact: "Uranus rotates on its side, so its seasons are very unusual.",
  },
  {
    name: "Neptune",
    color: "#4f7dff",
    orbitRadius: 380,
    radius: 10,
    orbitPeriod: 164.8,
    fact: "Neptune has very fast winds, some of the strongest in the solar system.",
  },
];

function drawBackgroundStars() {
  for (let i = 0; i < 120; i += 1) {
    const x = (i * 73) % canvas.width;
    const y = (i * 137) % canvas.height;
    const brightness = (i % 7) / 7;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + brightness * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function planetPosition(planet) {
  const speedScale = 1 / Math.sqrt(planet.orbitPeriod);
  const angle = simulationTime * 0.005 * speedMultiplier * speedScale;
  return {
    x: center.x + Math.cos(angle) * planet.orbitRadius,
    y: center.y + Math.sin(angle) * planet.orbitRadius,
  };
}

function drawSun() {
  const glow = 22 + Math.sin(simulationTime * 0.03) * 4;
  const gradient = ctx.createRadialGradient(center.x, center.y, 8, center.x, center.y, glow);
  gradient.addColorStop(0, "#fff8c4");
  gradient.addColorStop(0.5, "#ffcc67");
  gradient.addColorStop(1, "rgba(255,176,72,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center.x, center.y, glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd25e";
  ctx.beginPath();
  ctx.arc(center.x, center.y, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbits() {
  if (!showOrbits.checked) return;

  ctx.strokeStyle = "rgba(189, 220, 250, 0.22)";
  ctx.lineWidth = 1;

  planets.forEach((planet) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, planet.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawPlanet(planet) {
  const pos = planetPosition(planet);
  const radius = planet.radius * sizeMultiplier;

  if (planet.name === "Saturn") {
    ctx.strokeStyle = "rgba(244, 228, 181, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, radius + 6, radius + 2, 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = planet.color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "12px Nunito";
  ctx.fillText(planet.name, pos.x + radius + 4, pos.y - radius - 4);

  return { x: pos.x, y: pos.y, radius };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackgroundStars();
  drawOrbits();
  drawSun();

  planets.forEach((planet) => {
    planet.renderInfo = drawPlanet(planet);
  });

  if (isRunning) {
    simulationTime += 1;
  }

  requestAnimationFrame(render);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;

  for (let i = planets.length - 1; i >= 0; i -= 1) {
    const planet = planets[i];
    if (!planet.renderInfo) continue;

    const dx = clickX - planet.renderInfo.x;
    const dy = clickY - planet.renderInfo.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= planet.renderInfo.radius + 2) {
      factCard.innerHTML = `
        <h3>${planet.name}</h3>
        <p>${planet.fact}</p>
      `;
      return;
    }
  }
});

speedControl.addEventListener("input", () => {
  speedMultiplier = Number(speedControl.value);
  speedValue.textContent = `${speedMultiplier.toFixed(1)}x`;
});

sizeControl.addEventListener("input", () => {
  sizeMultiplier = Number(sizeControl.value);
  sizeValue.textContent = `${sizeMultiplier.toFixed(1)}x`;
});

toggleButton.addEventListener("click", () => {
  isRunning = !isRunning;
  toggleButton.textContent = isRunning ? "Pause" : "Resume";
});

resetButton.addEventListener("click", () => {
  simulationTime = 0;
  isRunning = true;
  speedMultiplier = 1;
  sizeMultiplier = 1;
  speedControl.value = "1.0";
  sizeControl.value = "1.0";
  speedValue.textContent = "1.0x";
  sizeValue.textContent = "1.0x";
  toggleButton.textContent = "Pause";
});

render();
