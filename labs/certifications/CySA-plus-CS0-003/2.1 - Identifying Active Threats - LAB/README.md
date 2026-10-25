# 2.1 - Identifying Active Threats - LAB

A faithful, fully self-contained static port of the "Identifying Active Threats"
interactive practice lab (Case 2.1 — CRIMSON-CRATE). No build step, no server,
no frameworks, no external requests: plain HTML + CSS + vanilla JavaScript.

## What it is

An interactive cybersecurity training lab for **CompTIA CySA+ CS0-003 · Lesson
2.1 — Identifying Active Threats**. You play the new threat-intel analyst at the
fictional Halvard Logistics CTI cell: collect OSINT from eight source racks,
type and route observables on the ShareGrid sharing platform (STIX/TAXII, MISP,
ISAC, TLP 2.0), map behaviors to MITRE ATT&CK, tune a detection, and brief the
board.

- **Medium mode** — 12 guided objectives, 3-tier hints, tolerant validation, 6-item concept quiz.
- **Hard mode** — 9 broad objectives over a noisy 13-item feed with red herrings, at most one nudge, strict validation, 7-item applied quiz.

Progress auto-saves in the browser (localStorage); RESET restores pristine state
behind a confirmation dialog. All organizations, actors, domains, IPs and
identifiers are fictional training data (IPs use RFC 5737 documentation ranges;
the CVE ID is an invented, clearly-labeled training ID). MITRE ATT&CK IDs and
TLP 2.0 definitions are real and used accurately for defensive education.

## How to run

Any of these works:

1. **Double-click `index.html`** — the lab runs from `file://` too.
2. **Any static server**, e.g. `python3 -m http.server` in this folder, then open `http://localhost:8000/`.
3. **GitHub Pages** — push this folder to a repository, enable Pages
   (branch/root), and open `https://<user>.github.io/<repo>/`. A `.nojekyll`
   marker is included; all asset references are relative, so subpath hosting
   works out of the box.

## Layout

```
index.html          entry page (loads scripts in dependency order)
css/styles.css      design tokens + all styling (plain CSS, no framework)
js/data.js          all lab content: sources, evidence, observables, boards, quiz, glossary
js/objectives.js    CHECK RESULTS engine: 12 medium + 9 hard objective rules
js/state.js         state store, localStorage persistence, scoring/stars
js/icons.js         inline SVG icon registry (exact Lucide path data)
js/ui.js            rendering primitives (paper design system)
js/panels.js        panel renderers (mode select, header, case file, desk, ShareGrid, missions, records, dialogs)
js/app.js           bootstrap, actions, event delegation, dialog a11y
assets/favicon.svg  bureau seal favicon
```

Data is separated from logic: everything a teacher may want to edit (evidence
text, objectives, quiz items, hints, feedback) lives in `js/data.js` and
`js/objectives.js` as plain constants.

## Browser support

Evergreen browsers (Chrome, Edge, Firefox, Safari). Uses only broadly supported
ES2020 JavaScript and CSS. No network calls are made at runtime — the only
external links are the explicit "Official references" in the Debrief, which open
in a new tab.
