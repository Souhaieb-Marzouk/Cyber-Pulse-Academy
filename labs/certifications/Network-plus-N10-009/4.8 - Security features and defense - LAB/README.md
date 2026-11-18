# Red-Line Room — static lab (N10-009 Lesson 4.8)

A self-contained, dependency-free static copy of the **Red-Line Room** practice lab for
CompTIA Network+ N10-009 · Lesson 4.8 "Security features and defense". No build step,
no server, no external runtime dependencies — plain HTML/CSS/JS.

## What it is

You are the network engineer at the fictional Northlake Community College. Triage the
reviewer's findings, then draft the network's defenses across seven control families:
device hardening, NAC, key management, ACLs, URL/content filtering, trusted vs.
untrusted zones, and the screened subnet — and prove the design under a 12-sample
traffic rig.

Two difficulty sittings share the same environment:

- **Guided Draft** (medium) — 12 step-by-step specs, 3-tier hints, gentle validation.
- **Audit Trial** (hard) — 9 broad missions driven by a findings memo with red herrings,
  strict validation, hints cost score.

Everything is synthetic training data (fictional college, 203.0.113.x / 10.9.x.x IPs,
invented hostnames and logs). Defensive, educational use only.

## How to run

- **GitHub Pages / any static host:** push this folder's contents to a repository and
  enable Pages. All references are relative, so it also works under a subpath
  (`user.github.io/repo-name/`). The `.nojekyll` marker prevents Jekyll processing.
- **Locally:** serve the folder with any static file server, or simply double-click
  `index.html` (runs from `file://` too).

## Files

```text
index.html          entry point (root, as GitHub Pages expects)
css/styles.css      design tokens + component styles (plain CSS, no framework)
js/icons.js         inline Lucide SVG paths (no icon fonts, no CDNs)
js/data.js          lab content: devices, controls, keys, ACL, filters, traffic, evidence
js/content.js       knowledge-core sections + quiz banks
js/sim.js           ACL evaluation + traffic simulation engine
js/objectives.js    objective definitions with machine-checked validation
js/state.js         state store, reducer, localStorage persistence (key: redline-room-v1)
js/ui.js            shell screens (mode gate, briefing, header, drawing board)
js/panels.js        bench panels (catalog bays, traffic bay, field manual, evidence pack)
js/app.js           spec ledger, quiz, debrief, sign-off, event wiring, bootstrapping
assets/fonts/       bundled Geist Sans/Mono woff2 (same faces as the original lab)
.nojekyll           GitHub Pages marker (empty)
```

Progress auto-saves to this browser's localStorage and resumes exactly; **Reset**
(wipe-the-sheet confirm) returns the lab to its pristine state.
