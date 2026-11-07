# Cloud Migration Control Tower — static lab

An interactive, self-contained practice lab for **CompTIA Cloud+ CV0-004 · Objective 2.3 — Workload migrations**
(migration types, the six application migration strategies, the eleven considerations, transfer planning,
wave sequencing, cutover, validation, rollback). Every org, host and figure is **synthetic training data**.

This is a **static port** of the original Next.js lab: no build step, no server, no external runtime
dependencies — plain HTML + CSS + vanilla JS.

## Run it

Any of these works:

1. **Double-click `index.html`** — the lab also runs from `file://` (classic scripts, no modules).
2. **Any static server** from this folder, e.g. `python3 -m http.server 8080` → open `http://localhost:8080/`.
3. **GitHub Pages** — push this folder's *contents* to a repo (root or `/docs`), enable Pages, and open
   `https://<user>.github.io/<repo>/`. All references are relative and an empty `.nojekyll` is included,
   so subpath hosting works unchanged.

## What's inside

```
index.html          the single page
css/styles.css      design tokens + all component styles (vanilla CSS)
js/icons.js         exact Lucide SVG geometry (inlined, no icon fonts)
js/data.js          ALL lab content: workloads, evidence, objectives data, quiz bank, glossary
js/state.js         state + localStorage persistence + engine helpers (same storage key as original)
js/objectives.js    the 21 CHECK RESULTS validators (12 Medium / 9 Hard)
js/ui.js            DOM builder + shared UI primitives
js/panels.js        the screens and console panels
js/app.js           shell, handlers, render loop, transfer simulation
assets/             favicon + bundled woff2 fonts (Geist, Space Grotesk, JetBrains Mono)
```

## Features

- Two difficulty modes sharing one environment: **Medium · Line Check Flight** (12 guided objectives,
  3-tier hints, tolerant checks) and **Hard · Incident Command** (9 objectives, 2 planted red herrings,
  exact-value validation, one costly nudge, the 02:41 incident).
- Departure board → flight plans → transfer radar → clearance (waves, runbook, rollback, incident) →
  evidence locker → learn → debrief → objectives tracker → knowledge check → completion report.
- Progress auto-saves to `localStorage` (`cvt-lab-cv0004-2.3-v1`) and resumes on reload;
  **Reset** wipes it after an explicit confirmation.

All content © training purposes; official references link to comptia.org pages in a new tab.
The lab makes **zero** network requests at runtime.
