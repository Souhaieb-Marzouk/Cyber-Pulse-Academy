# The Access Bureau — static practice lab

An interactive, self-contained cybersecurity practice lab for
**CompTIA CySA+ CS0-003 · Domain 3 · Lesson 3.2 — Exploring Identity and Access Management**.

This is the static (no-build, no-server) edition of the lab: plain HTML + CSS + JS.
**v3** — audited & fixed release: quiz options rebalanced (no length/format giveaways),
correct-answer positions rotated, matching-desk dropdowns de-diagonalized, exam review
color contract fixed (wrong = red only), completion report now includes evidence-derived
focus areas, containment-tray DOM/state sync fix, 44px hit areas on switches/checkboxes/
radios, exam header count corrected.

## Open it

- **Locally:** extract the folder and double-click `index.html` (works via `file://`).
- **GitHub Pages:** push the folder contents to a repository, enable Pages on the
  branch/root, then open `https://<user>.github.io/<repo>/`. All references are
  relative, so subpath hosting works out of the box. A `.nojekyll` file is included.

## What's inside

```
index.html          entry point
css/styles.css      design tokens + component styles
js/icons.js         inline Lucide SVG icons
js/data.js          ALL lab content (objectives, quiz, ledger, accounts, glossary)
js/state.js         state store + localStorage persistence (key: access-bureau-v1)
js/objectives.js    CHECK RESULTS validation engine
js/ui.js            shared controls (select/slider/switch/checkbox/radio/dialogs)
js/quiz.js          final exam + scoring + completion modal
js/desks.js         the six environment desks
js/sections.js      mode select, ticket queue, debrief
js/app.js           bootstrap + header chrome + tab router
assets/             favicon
```

## Modes

- **Medium — Analyst (Guided Audit):** 11 tickets, 3-tier hints, forgiving checks.
- **Hard — Lead Investigator (Live Incident):** 9 mandates, noisy evidence with red
  herrings, strict checks (exact MITRE IDs, sequences, precise sets), at most one nudge.

Progress auto-saves to the browser (localStorage). A clearly-labeled **RESET**
returns the lab to its pristine intake state.

## Content notice

TRAINING SIMULATION — all organizations, accounts, IP addresses (RFC 5737 / RFC 1918)
and events are synthetic. "Meridian Credit Union" is fictional. Defensive/educational
use only. Icons: Lucide (ISC license).
