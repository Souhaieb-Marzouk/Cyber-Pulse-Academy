# Building B — Service Riser · Network+ N10-009 3.7 Lab (static)

A faithful, self-contained static port of the interactive cybersecurity practice lab for
**CompTIA Network+ N10-009, Objective 3.7 — Network services (DHCP, SLAAC, DNS, NTP, PTP, NTS)**.

One room, two shifts:

- **Day Shift (Medium)** — 12 guided objectives, three-tier hints, tolerant checks, 7-question concept quiz.
- **Night Shift (Hard)** — 9 deep challenges over noisy evidence (red herrings included), one scored nudge, exact checks, 7 scenario items.

Everything is **simulated training data** (documentation IP ranges, fictional organization).
All interactions are defensive-education oriented; detection notes carry simplified MITRE ATT&CK tie-ins.

## Run it

No build step, no server, no dependencies. Options:

1. **Double-click `index.html`** — works from `file://`.
2. **Any static host** — GitHub Pages, Netlify, S3, `python3 -m http.server`, …

## Deploy to GitHub Pages

1. Create a repository and upload/push the **contents of this folder** (keep `index.html` at the root).
2. Repo → Settings → Pages → deploy from branch (e.g. `main` / root).
3. Open `https://<user>.github.io/<repo>/`.
4. Confirm the mode-select screen renders.

`.nojekyll` is included so GitHub Pages serves the files as-is (no Jekyll processing).

## Structure

```
index.html        entry point (relative paths only)
css/styles.css    design tokens + all component styles (plain CSS)
js/data.js        ALL lab content: objectives, quiz bank, glossary, evidence, notes
js/objectives.js  CHECK RESULTS validation engine + scoring (1:1 with the original)
js/state.js       state store, pub/sub, localStorage persistence (same key & semantics)
js/ui.js          component kit (bench, fields, toggles, sequencer, dialogs)
js/quiz.js        Inspector (circuit 08) quiz rendering
js/app.js         bootstrap, world chrome, circuit modules, completion modal
.nojekyll         GitHub Pages marker
```

## Persistence

Progress auto-saves in the browser via `localStorage` key `mcc-lab-n10009-3.7-v1` (per shift).
The header **reset** button (with confirmation) restores the pristine room. No network requests
are made at any point; the favicon is an inline data URI.

## Accessibility

Keyboard-operable end to end: dialogs trap focus (ESC / overlay / ✕ close and restore focus),
quiz options are `role="radio"` groups, toggles are `role="switch"`, feedback uses live
regions, and interactive controls keep ≥44 px touch targets.
