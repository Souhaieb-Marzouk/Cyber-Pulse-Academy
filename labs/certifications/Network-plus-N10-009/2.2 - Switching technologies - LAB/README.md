# The Fabric Bench — N10-009 · 2.2 Switching Technologies (static lab)

A self-contained, dependency-free static copy of **The Fabric Bench** — an interactive
CompTIA Network+ (N10-009, objective 2.2) practice lab covering VLANs, interface
configuration, spanning tree (STP/RSTP/MSTP/PVST+), MTU and jumbo frames, played on a
live animated 3-switch fabric for the fictional *Meridian College*.

No build step, no server, no framework, no external requests — plain HTML + CSS + JS.

## Play it

- **GitHub Pages:** open `https://<user>.github.io/<repo>/` after pushing this folder.
- **Any static host / subpath:** serve the folder as-is; all references are relative.
- **Locally:** double-click `index.html` (works from `file://` too).

## What's inside

```text
index.html            entry point
css/styles.css        full visual system (design tokens + components)
js/data.js            lab content: environment seed, design table, glossary, STP variants
js/engine.js          simulation engine: autonegotiation, STP, broadcast flood, ping/MTU
js/objectives.js      12 medium + 9 hard objectives and their CHECK RESULTS validators
js/quiz.js            knowledge check bank (6 medium + 7 hard, explanations included)
js/icons.js           inline lucide icon path data
js/state.js           store + localStorage persistence (resume + full reset)
js/ui.js              dialog/form primitives
js/canvas.js          live fabric SVG + frame-pulse animation engine
js/views.js           mode select, work order, manual, exam bench, debrief, completion
js/app.js             bench shell, objectives rail, console, event feed, wiring
assets/               fonts (Geist / Geist Mono, woff2) + favicon
```

## Modes

- **Medium — Guided wiring:** 12 ordered tasks with 3-tier hints and teaching feedback.
- **Hard — On-call engineer:** 9 free-order tickets with red herrings and strict checks.

Progress auto-saves per mode in `localStorage` (`fabric-bench-n10-009-v1`); **Reset**
wipes both modes. All data is synthetic training data.

## Deploy to GitHub Pages (5 steps)

1. Create a new repository on GitHub.
2. Upload the **contents** of this folder (or push the folder itself) to the repo root —
   keep `index.html` at the root level.
3. Repo → *Settings* → *Pages* → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-select screen renders and pick a shift.
