# THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 Automation practice lab

A self-contained, zero-build interactive practice lab for **CompTIA Cloud+ CV0-004,
Domain 5.0 DevOps Fundamentals — Lesson 5.1: "Automation — using tools to streamline
cloud operations"**. You play a plant-floor rotation at the fictional NimbusRail
Logistics: stamp work orders across nine stations (source control, the nine DevOps
tools, CI/CD, integration styles, benefits & risks, drift, judgment, telemetry,
capstone), take the QA-office quiz, and earn the certification plaque.

Pure static site: plain HTML + CSS + vanilla JavaScript. No framework, no build
step, no server, no network calls, no trackers. All data is synthetic training data
(`nimbusrail.example`, RFC 5737 ranges).

## Run it

- **Easiest:** double-click `index.html` (works from `file://`), or
- serve the folder with any static file server, e.g. `python3 -m http.server`.

Progress auto-saves to your browser's `localStorage` (key
`cyberlab-automation-works-v1`); the header **Reset** button (press twice) wipes it.

## Deploy to GitHub Pages (5 lines)

1. Create a new GitHub repository.
2. Upload the **contents of this folder** (or push the folder as the repo root).
3. Repo → Settings → Pages → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the shift-select screen renders and stamp a work order.

A `.nojekyll` file is included so GitHub Pages serves the site as-is (no Jekyll
processing).

## Layout

```
index.html          markup for all seven content blocks
css/styles.css      design tokens (:root) + all component styles
js/data.js          all lab content: glossary, stations, 12 medium + 9 hard
                    work orders (with check rules), quiz bank
js/state.js         state store, localStorage persistence, shared helpers
js/ui.js            widget component engines (sort/assign/seq/pick/mark/log/machine)
js/objectives.js    work-order engine: render, CHECK RESULTS, hints, unlock, tracker
js/quiz.js          knowledge check (answer-lock, explanations, scoring)
js/app.js           event delegation, completion modal, reset, bootstrap
```

Scripts are classic (non-module) `<script>` tags loaded in dependency order
(`state → ui → data → objectives → quiz → app`; `data` must come after `ui`
because work-order machine hooks call `cvHook` at load), so the lab also runs
from `file://`. All objectives map to the official CV0-004 Exam Objectives v1.2,
Domain 5.0 (5.1–5.4).
