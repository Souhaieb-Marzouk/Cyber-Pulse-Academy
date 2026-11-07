# The Continuity Desk — static lab (v4)

An interactive practice lab for **CompTIA Cloud+ CV0-004 — Lesson 3.2: Backup and recovery** (official Domain 3.0 objective 3.3), focused on implementing strategies that ensure data integrity.

This is the **static, self-contained port** of the Continuity Desk lab: plain HTML + CSS + JavaScript, **no build step, no server, no external runtime dependencies**. Everything (content, quiz banks, validation logic, fonts, icons) ships in this folder.

## Open it

- **Locally:** extract the folder and double-click `index.html` (works from `file://`), or serve it with any static file server (`python3 -m http.server`).
- **GitHub Pages:** push the folder contents to a repository and enable Pages — the lab runs under any subpath (`https://<user>.github.io/<repo>/`) because every reference is relative. A `.nojekyll` marker is included.

## What's inside

```
index.html            the single page (no nav bar, no footer — it's a "world", not a site)
css/styles.css        design tokens + all styling (translated from the original Tailwind theme)
js/data.js            ALL lab content: objectives data, quiz banks, logs, glossary, answer keys
js/state.js           state + localStorage persistence + pub/sub (same key and semantics as the original)
js/objectives.js      CHECK RESULTS validation engine + star math
js/ui.js              shared UI: inline Lucide SVG icons, feedback boxes, dialogs, tooltips
js/stations.js        the four stations: Planner, Vault, Drill Floor, Evidence
js/quiz.js            sequential knowledge check (one question at a time, lock-to-advance)
js/app.js             bootstrap: mode select, briefing, duty bar, objectives rail, completion modal
assets/fonts/         Geist Sans + Geist Mono (woff2, latin subset — the original's webfonts)
assets/favicon.svg    self-hosted favicon
.nojekyll             keeps GitHub Pages from running Jekyll
```

## The lab

- **Mode A — Training rotation (Medium):** 12 guided objectives across the planner, vault, drill floor and evidence inbox; three-tier hints; every check teaches.
- **Mode B — Live incident (Hard):** a P1 ransomware scenario with noisy evidence, red herrings, exact validation, near-miss rejections, a running incident clock and one scored nudge.
- Progress auto-saves to `localStorage` and resumes exactly where you left off; the ↺ button (with confirmation) resets everything.
- Star rating at shift close: −0.15 per objective not passed first try, −0.10 per Medium hint, −0.25 per Hard nudge.

## Notes for maintainers

- Content lives in `js/data.js`; logic never hard-codes lab copy. To edit an objective, its hints, or a quiz item, touch `data.js` (and, for validation rules, `js/objectives.js`).
- All data is **synthetic training data** — Halcyon Foods, NimbusCloud, DARKMOSS, every log line, hash and IP are fictional (198.51.100.77 is TEST-NET-2). MITRE ATT&CK references are real and open in a new tab.
- Defensive-education framing throughout: the lab teaches detection and mitigation (M1053 Data Backup), never attack operationalization.
