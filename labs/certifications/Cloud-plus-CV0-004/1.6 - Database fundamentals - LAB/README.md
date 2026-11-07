# The Drafting Room — Cloud+ CV0-004 · 1.6 Database Fundamentals Lab (static)

A self-contained, zero-build interactive practice lab for **CompTIA Cloud+ CV0-004
Objective 1.6 — database concepts and their cloud applications**. This is the static
port of the framework lab: plain HTML + CSS + JavaScript, no package manager, no
server, no external runtime dependencies. All lab data (objectives, quiz banks,
logs, glossary) is **synthetic training data** for exam practice.

## Open it

- Locally: unzip and double-click `index.html` (works from `file://`), or
- Serve the folder with any static file server (e.g. `python3 -m http.server`).

## Deploy to GitHub Pages

1. Create a repository (e.g. `drafting-room-lab`).
2. Upload/push the **contents of this folder** to the repository root
   (`index.html` must sit at the root).
3. Settings → Pages → Deploy from branch → pick the branch and `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves the files as-is.

## What's inside

```
index.html          page shell + script loading order
css/base.css        design tokens, bundled Geist webfonts, layout, motion
css/components.css  every component style (translated from the framework UI)
js/icons.js         inline Lucide SVG data (generated, byte-identical paths)
js/data.js          ALL lab content: workloads, journal, quiz banks, glossary…
js/objectives.js    the CHECK RESULTS validation engine (22 objectives)
js/state.js         state + localStorage persistence + scoring (same keys/rules)
js/ui.js            shared components: stamps, review cards, dialogs, modal
js/sheets-a.js      sheets A-000 → X-400 (briefing, core, matcher, sandbox, scale)
js/sheets-b.js      sheets D-500 → M-800 (ops, resilience, security, studio)
js/quiz.js          Q-900 sign-off: sequential knowledge check + completion
js/app.js           bootstrap, mode select, title block, rail, tabs, drawers
assets/             favicon + Geist/Geist Mono woff2 (variable, latin subset)
```

## Features

- **Two difficulty modes** sharing one environment core: *Draftsman* (Medium,
  12 guided review items, 3-tier hints, tolerant checking) and *Lead Architect*
  (Hard, 10 discovery challenges, noisy evidence with red herrings, strict
  validation, one rating-costing nudge).
- **Review-and-stamp workflow**: submit each item for review → animated
  APPROVED / REVISE stamp with a teaching explanation (and near-miss rationale
  in Hard mode).
- **Sequential knowledge check** (7 items per mode) with locked answers,
  enforced progression and a resume pointer.
- **Persistence**: progress auto-saves to this browser's localStorage and is
  restored on reload; **RESET** (title block) restores the pristine lab after
  an explicit confirmation.
- **Scoring**: 70% review items (first-attempt accuracy and hint use) +
  30% knowledge check; 1–3 stars with focus areas derived from your own run.
- **Accessible**: keyboard-operable throughout, ARIA roles/labels/live
  regions, visible focus, ≥44 px touch targets, responsive from desktop
  (rail + margin columns) to 390 px (drawers + stacked layout).

## Disclaimer

Independent training material — not affiliated with or endorsed by CompTIA.
All organisations, names, metrics and logs are fictional. Defensive,
exam-oriented framing only.
