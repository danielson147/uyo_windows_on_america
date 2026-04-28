const controls = {
  years: document.getElementById("years"),
  seed: document.getElementById("seed"),
  alaafinAuthority: document.getElementById("alaafinAuthority"),
  oyoMesiInfluence: document.getElementById("oyoMesiInfluence"),
  ogboniInfluence: document.getElementById("ogboniInfluence"),
  tradeBase: document.getElementById("tradeBase"),
  culturalBase: document.getElementById("culturalBase"),
  shockIntensity: document.getElementById("shockIntensity"),
};

const valueSpans = {
  years: document.getElementById("yearsValue"),
  alaafinAuthority: document.getElementById("alaafinAuthorityValue"),
  oyoMesiInfluence: document.getElementById("oyoMesiInfluenceValue"),
  ogboniInfluence: document.getElementById("ogboniInfluenceValue"),
  tradeBase: document.getElementById("tradeBaseValue"),
  culturalBase: document.getElementById("culturalBaseValue"),
  shockIntensity: document.getElementById("shockIntensityValue"),
};

const presetDescription = document.getElementById("presetDescription");
const runButton = document.getElementById("runSimulation");
const snapshot = document.getElementById("snapshot");

const presets = {
  peaceful: {
    label: "Peaceful Reign",
    description: "Balanced institutions, strong cohesion, and low shock pressure.",
    values: {
      years: 20,
      alaafinAuthority: 58,
      oyoMesiInfluence: 60,
      ogboniInfluence: 58,
      tradeBase: 56,
      culturalBase: 68,
      shockIntensity: 0.7,
    },
  },
  council: {
    label: "Council Conflict",
    description: "Factional politics increase instability and reduce confidence.",
    values: {
      years: 20,
      alaafinAuthority: 48,
      oyoMesiInfluence: 78,
      ogboniInfluence: 74,
      tradeBase: 50,
      culturalBase: 56,
      shockIntensity: 1.4,
    },
  },
  trade: {
    label: "Trade Boom",
    description: "Expanded market routes amplify prosperity and social confidence.",
    values: {
      years: 20,
      alaafinAuthority: 60,
      oyoMesiInfluence: 58,
      ogboniInfluence: 54,
      tradeBase: 76,
      culturalBase: 62,
      shockIntensity: 0.9,
    },
  },
  succession: {
    label: "Succession Crisis",
    description: "Leadership transitions and shocks strain legitimacy and cohesion.",
    values: {
      years: 20,
      alaafinAuthority: 66,
      oyoMesiInfluence: 52,
      ogboniInfluence: 50,
      tradeBase: 46,
      culturalBase: 50,
      shockIntensity: 1.7,
    },
  },
};

const charts = {
  legitimacy: null,
  prosperity: null,
  stability: null,
};

function clamp(value, low = 0, high = 100) {
  return Math.max(low, Math.min(high, value));
}

function mulberry32(seed) {
  let t = seed;
  return function rng() {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), t | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function randomFactory(seedInput) {
  if (seedInput === "" || Number.isNaN(Number(seedInput))) {
    return Math.random;
  }
  return mulberry32(Number(seedInput));
}

function roll(rng, min, max) {
  return min + rng() * (max - min);
}

function computeStability(state) {
  return (
    0.2 * state.legitimacy +
    0.2 * state.politicalBalance +
    0.18 * state.culturalCohesion +
    0.17 * state.provincialLoyalty +
    0.15 * state.militaryStrength +
    0.1 * state.prosperity
  );
}

function buildInitialState(config) {
  return {
    year: 0,
    prosperity: 55,
    legitimacy: 58,
    militaryStrength: 60,
    culturalCohesion: Number(config.culturalBase),
    politicalBalance: 57,
    tradeNetwork: Number(config.tradeBase),
    populationIndex: 50,
    provincialLoyalty: 56,
    alaafinAuthority: Number(config.alaafinAuthority),
    oyoMesiInfluence: Number(config.oyoMesiInfluence) / 100,
    ogboniInfluence: Number(config.ogboniInfluence) / 100,
  };
}

function yearlyStep(state, rng, shockIntensity) {
  state.year += 1;

  const festivalGain = roll(rng, 1.5, 4.5);
  state.culturalCohesion = clamp(state.culturalCohesion + festivalGain);
  state.legitimacy = clamp(state.legitimacy + festivalGain * 0.45);
  state.tradeNetwork = clamp(state.tradeNetwork + roll(rng, 0.5, 2.5));

  const tension =
    state.alaafinAuthority - (state.oyoMesiInfluence + state.ogboniInfluence) * 50;
  if (tension > 8) {
    state.legitimacy = clamp(state.legitimacy - roll(rng, 1.5, 4.0));
    state.politicalBalance = clamp(state.politicalBalance - roll(rng, 1.0, 3.5));
  } else if (tension < -8) {
    state.militaryStrength = clamp(state.militaryStrength - roll(rng, 0.8, 2.8));
    state.prosperity = clamp(state.prosperity - roll(rng, 0.7, 2.4));
  } else {
    const gain = roll(rng, 1.0, 3.8);
    state.politicalBalance = clamp(state.politicalBalance + gain);
    state.legitimacy = clamp(state.legitimacy + gain * 0.55);
  }

  state.oyoMesiInfluence = clamp(state.oyoMesiInfluence + roll(rng, -0.03, 0.03), 0.35, 0.8);
  state.ogboniInfluence = clamp(state.ogboniInfluence + roll(rng, -0.03, 0.03), 0.35, 0.8);
  state.alaafinAuthority = clamp(state.alaafinAuthority + roll(rng, -2, 2), 35, 80);

  const training = roll(rng, -2.5, 3.5);
  state.militaryStrength = clamp(state.militaryStrength + training);
  if (training >= 0) {
    state.provincialLoyalty = clamp(state.provincialLoyalty + roll(rng, 0.4, 2.1));
  } else {
    state.provincialLoyalty = clamp(
      state.provincialLoyalty - Math.abs(training) * roll(rng, 0.4, 0.8)
    );
  }

  const tributeEfficiency =
    (0.35 * state.legitimacy +
      0.35 * state.militaryStrength +
      0.3 * state.provincialLoyalty) /
    100;
  const prosperityDelta = roll(rng, -3, 4) + (tributeEfficiency - 0.5) * 6;
  state.prosperity = clamp(state.prosperity + prosperityDelta);
  state.tradeNetwork = clamp(state.tradeNetwork + roll(rng, -1.8, 2.2));

  const shockRoll = rng();
  if (shockRoll < 0.1 * shockIntensity) {
    state.legitimacy = clamp(state.legitimacy - roll(rng, 4, 8) * shockIntensity);
    state.politicalBalance = clamp(state.politicalBalance - roll(rng, 3, 7) * shockIntensity);
  } else if (shockRoll < 0.22) {
    state.militaryStrength = clamp(state.militaryStrength + roll(rng, 2, 5.5));
    state.provincialLoyalty = clamp(state.provincialLoyalty + roll(rng, 1.5, 4));
  } else if (shockRoll < 0.34) {
    state.prosperity = clamp(state.prosperity + roll(rng, 2, 5));
    state.tradeNetwork = clamp(state.tradeNetwork + roll(rng, 2, 5));
  }

  const growthSignal =
    (0.45 * state.prosperity + 0.35 * state.culturalCohesion + 0.2 * state.legitimacy) /
    100;
  const conflictPenalty = Math.max(0, (45 - state.militaryStrength) / 40);
  state.populationIndex = clamp(
    state.populationIndex + (growthSignal - 0.5) * 3.2 - conflictPenalty
  );
}

function runSimulation(config) {
  const rng = randomFactory(config.seed);
  const state = buildInitialState(config);
  const points = [];

  for (let i = 0; i < Number(config.years); i += 1) {
    yearlyStep(state, rng, Number(config.shockIntensity));
    points.push({
      year: state.year,
      legitimacy: Number(state.legitimacy.toFixed(2)),
      prosperity: Number(state.prosperity.toFixed(2)),
      stability: Number(computeStability(state).toFixed(2)),
    });
  }

  return { final: state, points };
}

function chartOptions(min = 20, max = 100) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(7, 18, 21, 0.94)",
        borderColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#d9e7de" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        min,
        max,
        ticks: { color: "#d9e7de" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };
}

function makeChart(canvasId, label, data, color) {
  const element = document.getElementById(canvasId);
  return new Chart(element, {
    type: "line",
    data: {
      labels: data.map((point) => point.year),
      datasets: [
        {
          label,
          data: data.map((point) => point[label.toLowerCase()]),
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          tension: 0.28,
          borderWidth: 2.4,
        },
      ],
    },
    options: chartOptions(),
  });
}

function renderCharts(points) {
  if (charts.legitimacy) charts.legitimacy.destroy();
  if (charts.prosperity) charts.prosperity.destroy();
  if (charts.stability) charts.stability.destroy();

  charts.legitimacy = makeChart("legitimacyChart", "Legitimacy", points, "#f2b94b");
  charts.prosperity = makeChart("prosperityChart", "Prosperity", points, "#7ecf8a");
  charts.stability = makeChart("stabilityChart", "Stability", points, "#67c8d2");
}

function renderSnapshot(final, points) {
  const last = points[points.length - 1] || { stability: 0 };
  const rows = [
    ["Final Legitimacy", `${final.legitimacy.toFixed(1)}`],
    ["Final Prosperity", `${final.prosperity.toFixed(1)}`],
    ["Final Stability", `${last.stability.toFixed(1)}`],
    ["Population Index", `${final.populationIndex.toFixed(1)}`],
  ];

  snapshot.innerHTML = rows
    .map(
      ([label, value]) => `
      <article class="metric">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
      </article>
    `
    )
    .join("");
}

function collectConfig() {
  return {
    years: controls.years.value,
    seed: controls.seed.value,
    alaafinAuthority: controls.alaafinAuthority.value,
    oyoMesiInfluence: controls.oyoMesiInfluence.value,
    ogboniInfluence: controls.ogboniInfluence.value,
    tradeBase: controls.tradeBase.value,
    culturalBase: controls.culturalBase.value,
    shockIntensity: controls.shockIntensity.value,
  };
}

function updateRangeLabels() {
  Object.keys(valueSpans).forEach((key) => {
    valueSpans[key].textContent = controls[key].value;
  });
}

function activatePresetButton(presetId) {
  const buttons = document.querySelectorAll(".preset");
  buttons.forEach((button) => {
    if (button.dataset.preset === presetId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function applyPreset(presetId) {
  const preset = presets[presetId];
  if (!preset) return;

  Object.entries(preset.values).forEach(([key, value]) => {
    if (controls[key]) controls[key].value = value;
  });

  presetDescription.textContent = `${preset.label}: ${preset.description}`;
  activatePresetButton(presetId);
  updateRangeLabels();
  executeSimulation();
}

function executeSimulation() {
  const result = runSimulation(collectConfig());
  renderCharts(result.points);
  renderSnapshot(result.final, result.points);
}

Object.values(controls).forEach((control) => {
  control.addEventListener("input", updateRangeLabels);
});

runButton.addEventListener("click", executeSimulation);

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

applyPreset("peaceful");
