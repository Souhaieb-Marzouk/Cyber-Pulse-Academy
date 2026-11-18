# SIGNAL PATH · TOOL BENCH — CompTIA Network+ N10-009 · Lesson 5.5 (static lab)

A self-contained, interactive practice lab for **N10-009 Lesson 5.5 — Tools and protocols**
(protocol analyzers, command-line tools, cable testers, Wi-Fi analyzers). One simulated
troubleshooting shift at Meridian Health Partners: three symptoms, four instruments
(Shell, PacketLens, CableCheck, AirView), objective tracking, knowledge check, completion
report. All content is **simulated training data** — no real networks are touched.

## Run it

- **Double-click `index.html`** — works from `file://` (classic scripts, no modules, no build).
- Or serve the folder with any static server: `python3 -m http.server` → open `/`.
- GitHub Pages: push this folder to a repo, enable Pages, open
  `https://<user>.github.io/<repo>/` (all references are relative; `.nojekyll` included).

## Play

1. Pick a shift — **Medium** (guided, hints, 12 objectives) or **Hard** (black box, 9 objectives).
2. Work the four instruments; the bench auto-validates evidence and CHECK RESULTS forms.
3. Finish the knowledge check; the completion modal rates the shift and lists focus areas.
4. Progress auto-saves to `localStorage` (key `n1009-55-toolbench-v1`); **RESET** wipes it.

## Files

```
index.html        markup (all seven content blocks)
css/styles.css    design tokens + all styling (no frameworks, no CDN)
js/data.js        lab content: packets, cables, Wi-Fi, objectives, quiz bank
js/state.js       state, persistence (localStorage), DOM helpers
js/ui.js          toasts, modals, hints, terminal line writer
js/objectives.js  objective engine: auto-validation, tracker, CHECK RESULTS forms
js/instruments.js terminal, packet analyzer, cable tester, Wi-Fi table, hard-mode boards
js/quiz.js        knowledge check + completion report
js/app.js         bootstrap, mode selection, event wiring
```

No backend, no build step, no external requests, no trackers. Version: static port v4
(includes all audit fixes QA-1…QA-5 from the certified build).
