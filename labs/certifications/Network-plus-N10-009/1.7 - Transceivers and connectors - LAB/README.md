# The Patch Bench — N10-009 Obj 1.7 Practice Lab (static)

A self-contained, zero-build copy of the interactive CompTIA Network+ **N10-009 Objective 1.7 —
Transceivers and connectors (SC, LC, ST, MPO, RJ11, RJ45, F-type, BNC)** practice lab.
Plain HTML + CSS + vanilla JS. No package.json, no bundler, no server, no external runtime
dependencies, no secrets. All training data is synthetic and embedded in `js/`.

## Run it

- **Local:** double-click `index.html` (works from `file://`), or serve the folder:
  `python3 -m http.server 8000` → open `http://localhost:8000/`
- **GitHub Pages:** push this folder's *contents* to a repo (keep `.nojekyll`), enable
  Pages on the branch → `https://<user>.github.io/<repo>/`. All paths are relative, so any
  subpath works.

## Structure

```text
index.html            entry point (loads the scripts in dependency order)
css/styles.css        design tokens + all styling (translated from Tailwind)
js/data.js            parts catalog, bench ports, link rules, site manual, glossary
js/objectives.js      12 Apprentice + 10 Journeyman work orders & CHECK RESULTS validators
js/quiz.js            counter exam banks (6 medium / 7 hard questions)
js/state.js           state reducer, localStorage persistence, session shuffle, stars
js/ui.js              glyphs + icons (inline SVG) and all view templates
js/app.js             bootstrap, event wiring, dialogs, keyboard support
assets/fonts/         Inter, IBM Plex Mono, Space Grotesk (woff2, bundled)
```

## Notes

- Progress auto-saves to the browser (`localStorage` key `patchbench-n10009-obj17-v1`); RESET wipes it.
- Two difficulty modes: **Apprentice** (guided, 3-tier hints) and **Journeyman** (strict checks, red herrings).
- Works offline. The only outbound link is the CompTIA objectives page (a normal hyperlink).
