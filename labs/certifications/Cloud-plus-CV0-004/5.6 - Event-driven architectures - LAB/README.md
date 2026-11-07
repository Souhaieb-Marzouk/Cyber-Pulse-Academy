# EventOps Control Tower — static lab

Self-contained interactive cybersecurity practice lab: **CompTIA Cloud+ CV0-004 · Lesson 5.6 — Event-driven architectures** (fictional org "Aerolink Cargo", all data synthetic).

This folder is a dependency-free static port of the original framework lab. It needs **no build step, no server, no external runtime dependencies**.

## Run it

- **GitHub Pages / any static host:** push this folder's contents to a repo and enable Pages. All references are relative, so subpath hosting (`user.github.io/repo-name/`) works out of the box (`.nojekyll` is included).
- **Locally via a static server:** `python3 -m http.server 8080` inside this folder, then open `http://localhost:8080/`.
- **Directly from disk:** double-click `index.html` — the lab also works over `file://`.

## Structure

```
index.html        entry point
css/styles.css    design tokens + all component styles
js/data.js        lab content (nodes, objectives' data, evidence, glossary) — content only
js/quiz.js        quiz banks (6 medium / 7 hard)
js/objectives.js  CHECK RESULTS validation engine (12 medium / 10 hard objectives)
js/state.js       state + reducer + localStorage persistence + scoring
js/icons.js       inline Lucide SVG markup (bundled, no icon CDN)
js/ui.js          small DOM helpers + shared controls (chips, selects, switches…)
js/tower.js       control-tower board, console, objectives rail, completion modal
js/screens.js     mode select, briefing, quiz, debrief screens
js/app.js         bootstrap, screen orchestration, dialogs, routing-pulse animation
assets/           favicon
```

## Modes

- **MEDIUM — Guided Tower Duty:** 12 objectives, 3-tier hints, tolerant checks, 6-question concept quiz.
- **HARD — Incident Commander:** 10 objectives over noisy evidence with red herrings, 1 nudge each, strict exact-set/sequence checks, 7-question scenario quiz.

Progress autosaves to `localStorage` (key `eda-control-tower-lab-v1`) and resumes on reload; RESET (confirmed) returns the lab to pristine state.

All lab data is synthetic training data. CompTIA and MITRE references are cited for education only.
