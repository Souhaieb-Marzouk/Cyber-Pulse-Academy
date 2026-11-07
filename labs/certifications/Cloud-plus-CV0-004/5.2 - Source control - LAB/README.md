# THE SWITCH YARD — Static Lab

Interactive practice lab for **CompTIA Cloud+ CV0-004 · Domain 5.0 (DevOps Fundamentals) · Source control** —
commits, branches, merges, pull requests, reviews, pushes, tags, secret hygiene and audit triage.

This is a **fully static port** of the framework lab: plain HTML + CSS + JavaScript.
**No build step, no server, no external runtime dependencies, no API keys.**

## What it is

- Fictional training scenario (NimbusFreight Logistics / `nf-cloud-platform` repo) — all data is synthetic and embedded in `js/data.js`.
- Two selectable shift modes: **YARDMASTER (Medium)** — 12 guided objectives, 3-tier hints, concept exam — and **DISPATCHER (Hard)** — 9 broad challenges, 1 hint max, strict validation, scenario exam.
- A working mini-Git simulation: stage, commit, branch, merge (with real diff3 conflict markers), tag, push, PR + review, revert, secret scanning, audit-log triage, CI gate ordering, RBAC.
- CHECK RESULTS engine with educational feedback, star rubric, exam with enforced progression, completion "dispatch clearance" report with focus areas.
- Progress auto-saves to `localStorage` (key `cv0004-l52-switchyard-v2`) and resumes on reload; **RESET** (top right, with confirm) restores the pristine yard.

## Run it

Any of these works:

1. **Double-click `index.html`** — the lab runs from `file://`.
2. Serve the folder with any static server, e.g. `python3 -m http.server 8000` → open `http://localhost:8000/`.
3. Deploy to **GitHub Pages**: push this folder's contents to a repo, enable Pages (branch/root), open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is included so Pages serves everything as-is.

## Files

```
index.html      — page shell (header, tabs, modal) + script tags
css/styles.css  — design tokens + all component styles (dark rail-yard theme)
js/data.js      — all lab content (seed repo, objectives, quizzes, glossary, texts)
js/git.js       — mini-Git engine (diff3 merge, status, all repo actions)
js/state.js     — state store + localStorage persistence + pub/sub
js/objectives.js— CHECK RESULTS validation engine + star rubric
js/ui.js        — rendering primitives + YARD views (board, workbench, map, history, desks)
js/views.js     — mode select, briefing, rulebook, safety review, completion recap
js/quiz.js      — exam stepper
js/app.js       — bootstrap, event wiring, modal
.nojekyll       — GitHub Pages marker (skip Jekyll processing)
```

Everything runs client-side. No tracking, no network calls, no build artifacts.
