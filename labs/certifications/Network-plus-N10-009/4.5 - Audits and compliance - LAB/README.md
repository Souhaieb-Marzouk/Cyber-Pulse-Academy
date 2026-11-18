# The Compliance Field Audit — static lab

An interactive, self-contained cybersecurity practice lab for **CompTIA Network+ (N10-009) — Audits and compliance** (data locality, PCI DSS, GDPR). This is the static port of the framework lab: pure HTML/CSS/JavaScript, **no build step, no server, no external dependencies**.

## What's inside

```
compliance-field-audit-static/
├── index.html          # single page (classic <script> tags, relative paths)
├── css/styles.css      # hand-written theme ("paper & ink" design tokens + components)
├── js/
│   ├── data.js         # ALL lab content: objectives' data, letters, logs, firewall
│   │                   #   rules, cloud stores, quiz bank, glossary (data only)
│   ├── objectives.js   # the 21 objectives (12 Medium / 9 Hard) + CHECK RESULTS rules
│   ├── state.js        # state store, localStorage persistence, scoring, stars
│   ├── ui.js           # shared components + interactive widgets (boards, sequencer,
│   │                   #   diagram, log viewer, firewall tools, breach clock…)
│   ├── zones.js        # the five walk-through areas
│   ├── quiz.js         # the Exit Interview
│   └── app.js          # bootstrap, shell, overlays, tooltips, event wiring
├── assets/fonts/       # Geist + Geist Mono (latin subsets), bundled — no CDNs
├── README.md
└── .nojekyll           # keeps GitHub Pages from processing the folder
```

## How to open

- **GitHub Pages (recommended):** deploy the folder contents to a repo and enable Pages — see the deploy note in the release. The lab also works when the site is served from a subpath (`https://<user>.github.io/<repo>/`), because every reference is relative.
- **Locally:** unzip and open `index.html` in any modern browser (`file://` works), or serve the folder with any static file server (`python3 -m http.server`).

## Lab features

- **Two difficulty modes:** *Guided Internal Review* (Medium — 12 objectives, 3-tier hints) and *Independent Assessment* (Hard — 9 deep objectives, noisy evidence with red herrings, 1 score-costing nudge).
- **Machine-verified objectives:** every answer is checked client-side (exact sets, maps, sequences, config states, a 72-hour window) with teaching feedback on every attempt.
- **Seven areas:** Briefing Room, Compliance Library, Card Data Center, Cloud Operations, Findings Desk, Exit Interview (quiz), Audit Report & Debrief.
- **Progress persistence:** saves automatically to `localStorage` (key `mrg-audit-lab-n10094-v1`); RESET returns the case file to pristine.
- **Accessible:** keyboard-operable widgets, ARIA roles/labels, focus-visible rings, live regions, skip link.

All organizations, people, hosts and card numbers are fictional training data (PANs use the industry-standard synthetic test numbers). Nothing here is a real audit finding.
