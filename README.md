# Old Oyo Kingdom Simulation

This project contains a lightweight simulation of Old Oyo leadership style and
cultural dynamics.

It models:
- The Alaafin (central royal authority)
- The Oyo Mesi (political council)
- The Ogboni (institutional and moral balancing body)
- Cultural cohesion through festivals and ritual life
- Trade, tribute flow, military readiness, and periodic shocks

## Run

Requirements:
- Python 3.10+

Command:

python3 old_oyo_simulation.py

Optional arguments:

python3 old_oyo_simulation.py --years 20 --seed 7

## Web Dashboard

The project also includes a browser-based interactive dashboard with:
- Line charts for legitimacy, prosperity, and stability over time
- Scenario presets:
	- Peaceful Reign
	- Council Conflict
	- Trade Boom
	- Succession Crisis
- Slider controls for years, authority balance, trade base, culture base, and
	shock intensity

To run locally:

cd web
python3 -m http.server 8000

Then open:

http://localhost:8000

Main web files:
- web/index.html
- web/styles.css
- web/app.js

## Hosting On The Web

The repo is set up for static hosting on GitHub Pages.

Publish the `docs/` folder as the site root, then use the landing page at:

- `docs/index.html` in the repo
- your GitHub Pages URL in the browser

That landing page links to both simulations:

- `docs/web/` for the Old Oyo dashboard
- `docs/solar_grade7/` for the Grade 7 solar system simulation

If you are setting up Pages for the first time:

1. Open the repository settings on GitHub.
2. Go to Pages.
3. Choose the branch that contains this repo.
4. Set the source folder to `docs/`.
5. Save and wait for the public URL to activate.

### Keep Files In Sync

This repository keeps working copies in the root folders and publish copies in
`docs/` for GitHub Pages. When you update a simulation, mirror the same changes
in both places before you push.

Checklist before deploy:

1. Update the simulation files in `web/` or `solar_grade7/`.
2. Copy the same updates into `docs/web/` or `docs/solar_grade7/`.
3. Confirm links still work from `docs/index.html`.
4. Commit and push.

## Grade 7 Solar System Simulation

This repository now includes a second interactive simulation designed for
Grade 7 science learning.

Features:
- Animated solar system with 8 planets orbiting the Sun
- Speed and planet size sliders
- Pause and reset controls
- Orbit-line toggle
- Click-to-learn planet fact cards

Run locally:

cd solar_grade7
python3 -m http.server 8010

Then open:

http://localhost:8010

Main files:
- solar_grade7/index.html
- solar_grade7/styles.css
- solar_grade7/app.js

## What The Simulation Produces

- Year-by-year event narrative
- State metrics for prosperity, legitimacy, military strength, cohesion,
	political balance, loyalty, and population index
- Final stability score and leadership snapshot

## Notes

- This is an educational and exploratory model.
- It simplifies complex historical realities and should not be treated as a
	complete historical reconstruction.