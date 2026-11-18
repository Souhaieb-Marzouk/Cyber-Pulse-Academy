# Continuity Bay — Static Lab

**CompTIA Security+ SY0-801 · Lesson 3.4: Explain the importance of resilience and recovery in security architectures**

A self-contained interactive cybersecurity lab covering backups, redundancy, recovery planning, and testing. No build step, no server, no external runtime dependencies — just open `index.html` in any modern browser.

## Contents

```
continuity-bay-static-v4/
  index.html              — semantic HTML shell
  css/styles.css          — all styling (plain CSS, custom properties)
  js/data.js              — all lab content (objectives, quiz, scenarios, glossary)
  js/state.js             — state management + localStorage persistence
  js/objectives.js        — CHECK RESULTS validation engine
  js/ui.js                — rendering helpers + inline SVG icons
  js/app.js               — station rendering (all 10 panels)
  js/main.js              — bootstrap + event wiring
  assets/                 — (empty; reserved for future assets)
  .nojekyll               — prevents GitHub Pages Jekyll processing
  README.md               — this file
```

## How to open

**Option A — direct file open:** Double-click `index.html` to open it in your default browser. Works via `file://` with no server needed.

**Option B — static server:** Serve the folder with any static file server:
```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## How to deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `continuity-bay-lab`).
2. Upload all contents of this folder to the repository root (or push as a subfolder).
3. Go to **Settings → Pages**.
4. Under **Source**, select the branch (`main`) and folder (`/root` or `/docs`).
5. Click **Save**.
6. Open `https://<your-username>.github.io/<repo-name>/` — the lab loads immediately.

The `.nojekyll` file ensures GitHub Pages serves the files as-is without Jekyll processing.

## What the lab covers

- **Backups:** full / incremental / differential / snapshot / replication / immutability / offsite
- **Redundancy:** load balancing / clustering / NIC teaming / dual PSU / UPS / generators / ISP / platform diversity / multi-cloud
- **Recovery Planning:** BCP / DRP / COOP / hot-warm-cold sites / RTO / RPO / MTTR / MTBF / capacity planning
- **Testing:** tabletop / simulation / failover / parallel / cutover

Two difficulty modes:
- **Medium** — 12 granular guided objectives, 7-question concept quiz, tiered hints, tolerant validation
- **Hard** — 9 deep scenario-first objectives, 8-question scenario quiz, strict validation, one optional nudge

## Features

- localStorage persistence (save → reload → resume exactly where you left off)
- Working RESET (with confirmation dialog)
- Answer locking after Submit (quiz) and after Check Results (objectives)
- R3 coloring contract: wrong → red only; correct → green; no green reveal on wrong submission
- Pairing shuffle (display order doesn't reveal correct answers)
- Focus areas in completion report (derived from actual performance)
- Responsive: desktop multi-panel → 390px stacked
- Accessible: keyboard operable, ARIA roles, visible focus, WCAG AA contrast
- No navigation bar, no footer, single self-contained page

## Technical notes

- Pure vanilla JavaScript (ES2020+), plain CSS, semantic HTML
- No framework, no build step, no npm/node_modules
- Inline SVG icons (no icon fonts or CDNs)
- All paths relative (works under any subpath)
- Total size: ~80 KB (uncompressed)

## License

Educational use. Based on CompTIA Security+ SY0-801 exam objectives. All content is synthetic and fictional (Cypress & Cedar Logistics is a fictional company).
