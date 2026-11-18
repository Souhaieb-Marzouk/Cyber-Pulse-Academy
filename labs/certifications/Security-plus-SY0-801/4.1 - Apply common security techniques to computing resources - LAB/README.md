# The Hardening Yard - Security+ 4.1 Practice Lab (static)

A self-contained, dependency-free static port of the "Northwind Hardening Yard"
interactive practice lab for **CompTIA Security+ objective 4.1 - "Apply common
security techniques to computing resources"** (securing endpoints, networks,
applications, and data).

Everything in the lab is synthetic training data for a fictional freight
company. Nothing here calls a server: the whole lab runs in the browser.

## What's inside

- Two difficulty modes: **Day Shift** (12 guided medium work orders) and
  **Night Shift** (9 hard work orders with noisy evidence, distractors and
  red herrings).
- A simulated freight yard of 16 assets across 4 zones with live toggle /
  choice controls and a facility "posture" gauge.
- 21 machine-validated work orders (toggles / match / multi / radio / sequence
  exercises), hint system, gate exam quiz with explanations, completion
  modal with star rating, debrief page.
- Progress autosaves to `localStorage` under the key
  `northwind-hardening-yard-v1`; RESET returns the lab to pristine state.

## How to open

No build step. Either:

- double-click `index.html` (works from `file://`), or
- serve the folder with any static server, e.g.
  `python3 -m http.server 8000` and open `http://localhost:8000/`.

## Deploy on GitHub Pages

1. Create a repository and upload the contents of this folder (keep
   `index.html` at the root; keep the included `.nojekyll`).
2. Settings -> Pages -> deploy from branch, root.
3. Open `https://<user>.github.io/<repo>/`.

All references are relative, so subpath hosting works out of the box.

## File layout

- `index.html` - single page shell, loads scripts in dependency order
- `css/styles.css` - design tokens + component styles (dark yard theme)
- `js/data.js` - all lab content (objectives, quiz bank, assets, evidence docs,
  glossary) - auto-dumped 1:1 from the original TypeScript sources
- `js/icons.js` - inline Lucide SVG icon data (no icon fonts, no CDNs)
- `js/state.js` - state store + localStorage persistence
- `js/objectives.js` - CHECK RESULTS validation engine, posture, star scoring
- `js/quiz.js` - gate exam helpers
- `js/ui.js` - render functions for every view
- `js/app.js` - bootstrap, event wiring, actions
