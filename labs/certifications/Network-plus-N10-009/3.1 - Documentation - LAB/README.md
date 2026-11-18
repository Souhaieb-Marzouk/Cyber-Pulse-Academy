# CyberLab — The Documentation Drafting Room (Static Edition)

An interactive, self-contained practice lab for **CompTIA Network+ (N10-009) ·
Domain 3 · Objective 3.1 — Documentation**, set in the fictional
**Harborline Freight Co.** HQ. You play the new Network Documentation
Specialist: verify every drawing, rack, cable map, inventory record, IPAM
worksheet, SLA contract and wireless heat map against what discovery actually
finds — before the auditors arrive.

> TRAINING DATA — Harborline Freight Co. is fictional; every device, serial, IP
> and person in this lab is synthetic.

## What's inside

- **Two difficulty modes** sharing the same drafting room:
  - *Medium · Guided Apprenticeship* — 12 guided work orders, 3-tier hints,
    tolerant checking, 7-question concept quiz.
  - *Hard · Audit Trial* — 9 multi-part audits, noisy discovery data with red
    herrings, strict validation, one costly nudge, 7-question scenario quiz.
- **Nine interactive sheets**: Diagram Pair, Rack Elevation, Cable Map, L3
  Network Diagram, Asset Inventory, IPAM Worksheet, SLA Desk, Wireless Survey,
  The Index — plus Archive (knowledge core + glossary), Inspector's Quiz and
  Field Notes.
- **CHECK RESULTS engine** with per-objective feedback, attempt tracking and a
  1–5★ completion rating (first-attempt accuracy and hint usage).
- **Progress auto-saves** to `localStorage` (key `n10009-31-drafting-room-v1`)
  and resumes exactly where you left off. RESET (with confirmation) returns the
  lab to pristine.

## Run it

No build step, no server, no dependencies — plain HTML/CSS/JS.

- **Locally:** unzip and double-click `index.html` (works from `file://`), or
  serve the folder with any static server, e.g. `python3 -m http.server`.
- **GitHub Pages:** push the folder contents to a repository, enable Pages
  (branch/root), open `https://<user>.github.io/<repo>/`. All paths are
  relative, so subpath hosting works out of the box. `.nojekyll` is included.

## Layout

```
index.html          entry point
css/styles.css      design tokens + all styling (plain CSS)
js/data.js          all lab content (world data, hints) — synthetic
js/quiz.js          quiz bank + grading
js/objectives.js    objective definitions + CHECK validators
js/state.js         state store + localStorage persistence + selectors
js/ui.js            icons, shared UI primitives, chrome, full screens
js/sheets.js        the nine interactive station sheets
assets/logo.svg     favicon
.nojekyll           GitHub Pages marker
```

Code is intentionally unminified and commented — it doubles as a teaching
artifact. Content (data.js/quiz.js) is separated from logic (state/objectives)
and rendering (ui/sheets).
