# SIGNALWATCH — CySA+ CS0-003 · Lesson 10.2 Training Lab (static)

A self-contained, fully client-side copy of the SIGNALWATCH night-shift lab for
**CompTIA CySA+ CS0-003 — Lesson 10.2: Explaining Techniques for Identifying
Malicious Activity**. No build step, no server, no external runtime dependencies.

> TRAINING SIMULATION — synthetic data only (RFC 5737 TEST-NET IPs, `.example`
> domains, defanged command lines). Defensive security education.

## Run it

- **Locally:** extract the folder and open `index.html` in any modern browser.
- **GitHub Pages:** push the folder contents to a repository, then enable
  Pages (branch/root). The site also works under a subpath — all references are
  relative and `.nojekyll` is included.

## What's inside

| Path | Purpose |
| --- | --- |
| `index.html` | Single page; loads scripts in dependency order (classic scripts, no modules) |
| `css/styles.css` | Design tokens + component CSS (vanilla, no framework) |
| `js/data.js` | All lab content: flows, DNS/mail/endpoint evidence, objectives' answer keys, quiz bank, glossary |
| `js/icons.js` | Inline SVG path data (generated from Lucide v0.525.0) |
| `js/objectives.js` | 12 Medium + 8 Hard objectives, CHECK RESULTS validation engine, 3-tier hints, rule-bench simulator |
| `js/state.js` | State store + localStorage persistence (`signalwatch-cysa102-v2`) + derived scoring |
| `js/ui.js`, `js/workset.js` | Shared console primitives |
| `js/panels-*.js` | BRIEF / DISPATCH / evidence modules / ops modules / QUIZ · DEBRIEF · completion |
| `js/app.js` | Bootstrap, mode select, console shell, channel switching, dialogs |
| `assets/fonts/` | Bundled Geist Sans + Geist Mono (latin, variable weight) |
| `assets/favicon.svg` | Radar favicon |

## Features

- Two difficulty modes (Medium · guided, Hard · free-roam triage with red herrings)
- 20 machine-checkable objectives with teaching feedback on every answer
- Evidence floor: FLOWSCOPE, DNS WIRE, MAIL GATE, ENDPOINT TRACE, RULE BENCH,
  ACTION BOARD, ATT&CK BOARD, ALERT QUEUE
- Knowledge check (gated, one-question-at-a-time, locked answers), debrief,
  completion report with stars and personal focus areas
- Auto-save to `localStorage`, exact resume, confirmed RESET
- Keyboard operable, ARIA-labelled, 44 px touch targets, responsive ~390 px → desktop
