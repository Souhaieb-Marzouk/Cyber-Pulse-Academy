# The Registry — Governance Lab (static edition)

An interactive practice lab for **CompTIA Security+ (SY0-801) Objective 5.1 — "Apply
policies, standards, procedures, and security guidance."**

You play a governance clerk at the fictional **Meridian Freight & Logistics (MFL)**:
read the 17-document registry, cite and stamp incoming request tickets, verify audit
claims against the files, work a 12-objective (Medium) or 9-objective (Hard) ledger,
take the knowledge check, and file your final report.

All data is **synthetic training data** — no real organizations, laws quoted verbatim,
or personal data.

## Run it

No build step, no server, no dependencies. Three ways to open it:

1. **Double-click `index.html`** — works directly from `file://` after unzipping.
2. **Any static file server** — `python3 -m http.server` in this folder, then open
   `http://localhost:8000/`.
3. **GitHub Pages** — push this folder to a repository and enable Pages on the
   branch/root. All paths are relative, so it also works under a subpath
   (`https://<user>.github.io/<repo>/`). A `.nojekyll` marker is included.

## Files

```
index.html          entry point (renders the lab via the scripts below)
css/styles.css      all styling (vanilla CSS, design tokens as custom properties)
js/data.js          lab content: registry, glossary, tickets, quiz banks
js/objectives.js    objective definitions + CHECK RESULTS validation engine
js/state.js         state store, localStorage persistence, pub/sub
js/ui.js            icons (inline SVG) + shared UI components
js/panels.js        the seven lab panels (briefing → debrief)
js/app.js           app shell, event wiring, dialogs, bootstrap
assets/favicon.svg  favicon
```

## Features

- Two difficulty modes: **Apprentice Clerk** (Medium, 12 guided objectives,
  3-tier hints) and **Chief Auditor** (Hard, 9 strict objectives, one scored nudge,
  a red-herring ticket and three planted registry defects).
- Document registry with search, glossary and document viewer.
- Request docket: cite a governing document and choose a disposition stamp per ticket.
- Audit desk: confirm exactly the planted defects (false positives fail the audit).
- Objectives ledger with CHECK RESULTS validation, answer locking, clear-and-retry,
  and per-objective feedback that explains the *why*.
- One-at-a-time knowledge check with lock-on-answer and explanations.
- Final report with star score, mastery recap by pillar and evidence-based focus areas.
- Progress auto-saves to `localStorage` (key `govlab-sy0801-51-v1`) and resumes on
  reload; Reset (with confirmation) returns the lab to its pristine state.
- Keyboard operable (ARIA roles/labels, ESC closes dialogs, focus rings, 44px touch
  targets) and responsive from ~390px to desktop.
