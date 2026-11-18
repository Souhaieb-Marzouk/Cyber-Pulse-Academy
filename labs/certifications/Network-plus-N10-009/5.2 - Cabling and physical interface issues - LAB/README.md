# LAYER·1 BENCH — static lab (Network+ N10-009 · 5.2)

A self-contained, interactive CompTIA Network+ **N10-009 objective 5.2** practice lab:
*Cabling & physical interface issues*. One wiring closet (SW-ACCESS-01, IDF-2), five live
tickets, real instruments — cable tester, dB meter, spool rack, optics tray, PoE panel,
punch-down station — with a full objective tracker, tiered hints, a sequential knowledge
check and a mastery sign-off report.

- **Guided mode (Bench Apprentice)** — 12 objectives, 3-tier hints, tolerant checks.
- **On-call mode (Solo On-Call)** — 9 deep challenges, red herrings, strict validation.

All content is synthetic training data for a fictional organization
(Cedar Valley Technical College).

## Run it

No build, no server, no dependencies. Two options:

1. **GitHub Pages / any static host** — push this folder to a repo and enable Pages,
   or drop it into any existing static site. All paths are relative, so subpath hosting
   (`user.github.io/repo-name/`) works out of the box.
2. **Locally** — double-click `index.html` (works from `file://`), or serve the folder:
   `python3 -m http.server 8000` and open `http://localhost:8000/`.

## Files

```text
index.html            entry point
css/styles.css        all styling (design tokens + components)
js/icons.js           inline Lucide SVG icons
js/data.js            lab content: cables, tickets, ports, counters, derived state
js/objectives.js      objective engine: checks, teaching feedback, hints, answer fields
js/quiz.js            knowledge-check bank (both modes)
js/state.js           state store + localStorage persistence + reset
js/ui.js              UI renderers (panels, bays, overlays)
js/app.js             bootstrap, event wiring, focus/scroll management
assets/               bundled Geist fonts + favicon
```

Progress auto-saves to `localStorage` (key `n10-009-52-lab-v1`); **Reset bench**
in the header wipes it back to the mode-selection screen.
