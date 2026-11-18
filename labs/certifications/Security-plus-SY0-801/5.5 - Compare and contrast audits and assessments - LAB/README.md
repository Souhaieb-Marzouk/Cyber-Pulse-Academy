# The Assurance Bureau — SY0-801 5.5 Static Lab

A fully static, self-contained copy of the interactive practice lab for
**CompTIA Security+ SY0-801 · Lesson 5.5 — "Compare and contrast audits and
assessments"** (sub-bullet: *participate in audits, reviews, testing, and
assessments*).

Simulated engagement at the fictional **Halcyon Credit Union** — every
document is labeled **TRAINING DATA — SYNTHETIC**. Two difficulty modes
(Guided Fieldwork / Solo Engagement), 12 + 9 worksheets, a control-test rig,
a findings ledger, a 6/7-item knowledge check, and a scored field report.

## Run it

No build step, no server, no dependencies. Any of these works:

- **GitHub Pages** — push this folder to a repo (root or `/docs`), enable
  Pages, open `https://<user>.github.io/<repo>/`.
- **Any static file host** — upload the folder as-is.
- **Locally** — double-click `index.html` (works over `file://` too).

## Files

```
index.html            entry point (root, required by GitHub Pages)
css/styles.css        design tokens + component styles (plain CSS)
js/data.js            ALL lab content (documents, objectives, quiz, glossary)
js/objectives.js      validation engine + scoring + focus areas (pure functions)
js/state.js           store: state, pub/sub, localStorage persistence, actions
js/ui.js              component library (widgets, cards, chrome)
js/quiz.js            knowledge check + field report modal
js/app.js             bootstrap + delegated event wiring
assets/fonts/         Geist Sans & Geist Mono (woff2, latin subset, bundled)
assets/favicon.svg    local favicon
.nojekyll             disables GitHub Pages Jekyll processing
```

## Persistence

Progress auto-saves to `localStorage` under the key
`assurance-bureau-sy0801-55-v1` — the same key the original framework lab
uses, so a save from either version resumes in the other. RESET (masthead
stamp) shreds the file and returns to the mode-selection screen. No data
ever leaves your device; the lab makes zero network calls.
