# Night Shift: Cameras & Locks — static lab

A fully self-contained, zero-build static copy of the interactive practice lab for
**CompTIA Network+ (N10-009) · Domain 4 · Lesson 4.2 — Physical security: cameras and locks**.

You are the overnight security tech at a fictional distribution center. Read the night's
evidence (camera wall, facility schematic, badge/keypad logs), reconstruct the intrusion,
and harden the site — then verify with the site audit.

## Run it

No build, no server, no dependencies:

- **GitHub Pages:** push this folder's contents to a repo, enable Pages → `https://<user>.github.io/<repo>/`
- **Any static host / subpath:** works, all references are relative
- **Locally:** double-click `index.html` (works from `file://` too)

## What's inside

```
index.html            entry point
css/styles.css        design system (Night Watch tokens, vanilla CSS)
js/data.js            all lab content: evidence, logs, objectives' data, quiz banks, glossary
js/icons.js           inline SVG icon library (Lucide path data, ISC)
js/objectives.js      CHECK RESULTS validation engine (12 Medium + 8 Hard objectives)
js/state.js           state store + localStorage persistence + RESET
js/ui.js              view templates + targeted DOM updates
js/app.js             bootstrap + event wiring
assets/fonts/         bundled woff2 fonts (Oxanium, Atkinson Hyperlegible, JetBrains Mono)
```

## Modes

- **Guided Shift (Medium)** — 12 guided objectives, 3-level hints, teaching feedback
- **Incident Solo (Hard)** — 8 strict multi-step challenges, alert triage with red herrings

Progress, quiz answers and every control persist in `localStorage`
(key `n1009-42-watchroom-v1`) and survive reloads; **Reset** restores the pristine state.

## Content note

All organizations, people, devices, logs and events are **synthetic training data**.
The lab is 100% defensive/educational; MITRE ATT&CK references (T1200, T1052.001, M1034, M1057)
link to the official pages.
