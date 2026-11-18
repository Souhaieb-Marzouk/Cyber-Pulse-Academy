# Indicator Bay 02 — static lab

An interactive practice lab for **CompTIA Security+ SY0-801 — "Analyze indicators of malicious activity"** (official objective 2.5). You are the overnight analyst at the fictional Meridian Freight & Haulage: screen 44 synthetic evidence items across six threat racks plus a noise bin, stamp threat families and attack types in the loupe, tag IoC categories on the beacon board, pair definitions on the clipboards, build an incident-response plan, then take the knowledge check.

Two difficulty shifts share the same evidence:

- **Day shift (guided)** — 12 objectives introduced one by one, 3-tier hints, tolerant checks, 6-question concept quiz.
- **Night shift (strict)** — 9 free-roam objectives, noisy evidence with planted false positives, strict validation, one nudge, 7-question scenario drill.

All data is synthetic training data (fictional `.example` domains, TEST-NET addresses, invented staff). Defensive framing only.

## Run it

No build step, no server, no dependencies. Either:

- open `index.html` directly in a browser (works from `file://`), or
- serve the folder statically, e.g. `python3 -m http.server 8000` and open `http://localhost:8000/`.

## Deploy to GitHub Pages

The folder is Pages-ready: `index.html` at the root, only relative paths, lowercase kebab-case filenames, `.nojekyll` included. Push the folder contents to a repo and enable Pages on the branch root.

## Layout

```
index.html          entry point (pre-JS loading shell + script tags)
css/styles.css      vanilla CSS translation of the original theme
js/data.js          ALL lab content (evidence, objectives, quiz, glossary…)
js/icons.js         inline Lucide SVG markup (exact paths, no CDN)
js/state.js         state store + localStorage persistence + RESET
js/objectives.js    CHECK RESULTS validation engine + scoring + unlock rules
js/ui.js            element factory, chips, badges, selects, section shell
js/board.js         objectives tracker + response-plan editor
js/dock.js          evidence racks + loupe inspector
js/desk.js          beacon board + match clipboards
js/sections.js      briefing, field guide, debrief
js/quiz.js          sequential knowledge check / scenario drill
js/modal.js         completion modal (stars, pillar recap, focus areas)
js/app.js           bootstrap: mode gate, briefing gate, channels, dialogs
assets/             self-hosted Geist fonts + favicon
```

Progress (mode, objectives, stamps, quiz, hints) persists in `localStorage` under `mfh-indicator-bay-v1`; the RESET control wipes back to a pristine shift.
