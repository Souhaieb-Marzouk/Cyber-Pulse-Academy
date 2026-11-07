# Cloud Ward — CompTIA Cloud+ CV0-004 · Lesson 3.3 Observability Lab (static, v4)

A self-contained, single-page interactive training lab: **monitoring and analyzing
cloud environments for performance optimization**. You are the on-call SRE physician
for Nimbus Cart: read vitals, correlate charts, image the slow request, triage the
board, treat the patient, tune the ward. All telemetry is synthetic training data.

- **Day Rounds (Medium)** — 11 guided objectives, 3-tier hints, tolerant checking, 6-question board quiz.
- **Night Shift (Hard)** — 9 discovery-based multi-step cases, noisy evidence with red herrings, strict validation, 7-question quiz, at most one nudge (costs score).

Progress auto-saves to `localStorage` (key `cloudward-cv0004-l33-observability-v1`)
and can be erased any time via **Reset ward** in the chart binder.

## Run it

No build step, no server, no dependencies.

- **Simplest:** unzip and double-click `index.html` (works from `file://`).
- **Served:** `python3 -m http.server 8000` inside this folder → open <http://localhost:8000/>.
- **GitHub Pages:** push the folder contents to a repo, enable Pages on the branch/root,
  open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is included so GitHub
  serves everything as plain static files. All paths are relative, so subpath hosting
  (`user.github.io/repo/`) works out of the box.

## Layout

```
index.html            entry page (loads scripts in dependency order)
css/fonts.css         self-hosted Geist / Geist Mono @font-face rules
css/styles.css        design system (vanilla CSS, custom-property tokens)
js/icons.js           exact Lucide SVG node data (ISC license, lucide.dev)
js/data.js            ALL lab content: telemetry, logs, traces, alerts,
                      objectives, quizzes, glossary, reference copy
js/state.js           state store + localStorage persistence + pub/sub
js/objectives.js      CHECK RESULTS validation engine (20 rules)
js/ui.js              DOM primitives, icons, chips, charts, drawer/modal
js/bays.js            the 8 examination-bay instruments
js/assess.js          quiz drawer, discharge summary, completion modal
js/app.js             mode gate, status strip, chart binder, bootstrap
assets/               favicon + woff2 fonts
```

Everything is readable, commented, data-separated-from-logic — the lab is meant to be
studied as much as played. No minification, no bundler, no external requests.

## Accessibility

Full keyboard operability (tabs, segmented radio groups, quiz pips, sliders,
drawer focus trap + restore, ESC to close), 44px minimum touch targets, ARIA
roles/live regions for check results, ≥390px responsive layout,
`prefers-reduced-motion` respected.

## Credits & license notes

- Built as a faithful static port of the framework lab (behavioral parity).
- Icons: [Lucide](https://lucide.dev) v0.525.0 — ISC license.
- Fonts: Geist & Geist Mono by Vercel — SIL Open Font License 1.1.
- Exam references: CompTIA Cloud+ (CV0-004) — vendor-neutral concepts; all scenario
  data is fictional (`*.nimbuscart.example`, RFC 5737 addresses).
