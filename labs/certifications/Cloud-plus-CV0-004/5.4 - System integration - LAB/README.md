# The Central Exchange — Cloud+ CV0-004 · 5.4 System Integration Lab (static)

A faithful, self-contained **static port** of the interactive "Central Exchange" practice lab for
**CompTIA Cloud+ CV0-004 · Domain 5.0 · Objective 5.4 — System integration: APIs, webhooks and
message queues**. No build step, no server, no framework, no external runtime dependencies:
plain HTML + CSS + vanilla JavaScript.

> All content is **SYNTHETIC TRAINING DATA** on a fictional organization (Cobalt Courier).

## What it teaches

Patch a vintage crossbar switchboard to integrate a hybrid estate (on-prem DepotERP, cloud
FleetHub, SaaS ParcelCRM, cloud BillingSvc), then harden the three classic integration failure
modes (duplicate work from retries, dead dependencies, poison messages), wire the detection
plane, respond to live faults on the teleprinter tape, and handle a leaked integration key —
with **11 objectives in Medium** (guided, 3-tier hints) and **9 in Hard** (incident-first free
roam, red herrings, exact answers), plus a per-mode knowledge check and an evidence-derived
completion report.

## Run it

Any of these works:

- **GitHub Pages:** push the folder contents to a repo → Settings → Pages → deploy from branch
  root → open `https://<user>.github.io/<repo>/`.
- **Any static file host:** upload the folder as-is (relative paths only; `.nojekyll` included).
- **Local:** `python3 -m http.server` in this folder → open `http://localhost:8000/`.
- **Directly:** double-click `index.html` (works from `file://` too).

## Layout

```
index.html          single page (mode gate + lab)
css/styles.css      design tokens + component styles (Tailwind/shadcn → plain CSS)
js/data.js          all lab content (objectives, quiz, incidents, evidence, glossary, icons)
js/engine.js        CHECK RESULTS validation engine + health/gauge derivation (pure functions)
js/state.js         store + actions + localStorage persistence (key: interchange-lab-v1)
js/ui.js            view layer (template functions + targeted DOM updates)
js/app.js           bootstrap, region dirty-checks, ambient teleprinter ticker
assets/fonts/       Geist / Geist Mono woff2 (latin subsets, self-hosted)
assets/favicon.svg  local favicon
```

Progress (mode, objectives, hints, quiz, environment state) auto-saves to `localStorage` and
survives reloads; **RESET** in the masthead wipes it after confirmation.

MITRE ATT&CK references used for vocabulary reinforcement: T1552.001, T1550.001, T1499.002,
T1190, M1017/M1022/M1030/M1035/M1036/M1037/M1041/M1047.
