# The Billing Audit Desk — static lab (Cloud+ CV0-004 · 1.8 Billing management)

An interactive CompTIA Cloud+ **CV0-004 Lesson 1.8 (Billing management)** practice lab:
audit the fictional October invoice of TrailGear Outfitters on the fictional SkyLoft Cloud,
master billing models, resource metering, tagging/attribution, budgets & anomaly alerts and
rightsizing — and catch the cryptojacking spike (MITRE ATT&CK T1496.001) hiding in the ledger.

This is the **static port** of the lab: plain HTML/CSS/JS, no build step, no server, no
external dependencies, no data collection. 100% of the content is fictional training data.

## Modes

- **Medium** — guided learning: 12 granular objectives with "where to look" cues and 3-tier hints.
- **Hard** — challenge: 9 broad multi-step challenges, strict validation, one paid nudge, red herrings.

Progress auto-saves in your browser (`localStorage` key `cloudplus-billing-lab-v1`); the masthead
**Reset** button shreds the case file back to pristine.

## Run it

Option A — just open the file: double-click `index.html` (works from `file://`).

Option B — any static server (recommended):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a repository and upload/push the contents of this folder (keep `index.html` at the root).
2. Settings → Pages → deploy from branch, root.
3. Open `https://<user>.github.io/<repo>/`.

All references are relative, so subpath hosting (project pages) works out of the box.
`.nojekyll` prevents GitHub Pages from running Jekyll over the files.

## Folder map

```
index.html          page skeleton + script load order
css/styles.css      design tokens + all styling (translated from the original Tailwind theme)
js/icons.js         inline lucide SVG path data (no icon fonts, no CDN)
js/data.js          ALL lab content: invoice, pricing sheet, usage/tag-audit evidence,
                    change log, guardrail metrics, CFO memo, glossary (synthetic data)
js/objectives.js    the 12 Medium + 9 Hard objectives with machine-checkable validators
js/quiz.js          knowledge-check banks (6 Medium / 7 Hard items)
js/state.js         state store, localStorage persistence, scoring & star rating
js/ui.js            shared UI templates (stamps, panels, cards, drawer, tracker, gate)
js/stations.js      the seven audit stations + completion seal templates
js/app.js           bootstrap, event wiring, dialogs, keyboard support
assets/favicon.svg  local favicon (the original pointed at a CDN icon)
```
