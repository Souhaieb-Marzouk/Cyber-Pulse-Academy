# CyberLab 101 — "The Analyst's Bench" (static build)

**CompTIA CySA+ CS0-003 · Lesson 10.1 — Identifying Malicious Activity**

A fully self-contained, build-free static copy of the interactive lab. Everything runs
client-side: no server, no framework, no dependencies, no external requests.

## What it is

You are the overnight SOC analyst for the fictional **Alderwood Freight Systems**
(case CS-2024-0417 "HARBORWATCH", synthetic training data only). Work the incident with
the five tool families of the watch floor — endpoint protection (SENTRY-EDR), a simulated
command-line triage console, domain registries (WHOIS), blocklists/reputation feeds, and
a SIEM (SIREN) — complete the objective tracker, pass the knowledge check, and close your
shift with a starred debrief.

- **Guided Watch (Medium)** — 12 objectives, 3-tier hints, forgiving checks, 7-question concept quiz.
- **Night Watch (Hard)** — 10 deeper challenges, red herrings in the alert queue, strict
  validation, one nudge per objective, 8-question scenario quiz.

Progress autosaves to `localStorage` (key `cy101-analyst-bench-v1`); the header **Reset**
button (with confirmation) restores the pristine lab. All data in the lab is synthetic and
labeled as such.

## How to open

Any of these works:

1. **Double-click `index.html`** — the lab runs from `file://` too.
2. Serve the folder with any static file server, e.g.:
   ```bash
   python3 -m http.server 8080
   # → http://localhost:8080/
   ```
3. Deploy to GitHub Pages (see below).

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
2. Upload the **contents of this folder** (or push the folder itself).
3. Repository Settings → Pages → Source: your branch, `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-select screen renders, pick a mode, and you're on the bench.

(A `.nojekyll` file is included so GitHub Pages serves files as-is.)

## Layout

```
index.html          page shell + inline SVG icon sprite (Lucide paths, ISC license)
css/styles.css      all styling — design tokens as CSS custom properties
js/data.js          ALL lab content (objectives, quiz, logs, alerts, glossary…)
js/objectives.js    CHECK RESULTS validation engine (pure functions)
js/shell.js         simulated triage shell command processor (pure)
js/ui.js            DOM helpers, icons, toasts, modals, terminal-line accenting
js/state.js         central store + localStorage persistence + pub/sub
js/quiz.js          knowledge-check instrument
app…                js/app.js — routing, header, rails, instruments
assets/fonts/       Geist + Geist Mono (latin subset, variable weight, woff2)
assets/favicon.svg
```

Defensive/educational use only. Every IP, domain, hash, person and log line is invented
for training; MITRE ATT&CK / D3FEND references are verified against official sources.
