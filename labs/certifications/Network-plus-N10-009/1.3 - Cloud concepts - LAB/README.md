# LZ-MERIDIAN — Cloud Concepts Commissioning Lab (static build v4)

A faithful, fully self-contained static copy of the LZ-MERIDIAN interactive lab for
**CompTIA Network+ (N10-009) · Objective 1.3 — Cloud concepts & connectivity**
(NFV, VPC, subnets, NSGs, cloud gateways, deployment & service models).

- **Zero build step** — plain HTML/CSS/JS, classic `<script>` tags, no modules, no bundler.
- **Zero server** — every check, probe and quiz runs client-side.
- **Zero external runtime dependencies** — no CDN fonts, no icon fonts, no analytics;
  the only outbound links are the five user-clicked references in the Handover Pack.
- Works from `file://`, any static file host, and GitHub Pages (including project subpaths
  like `user.github.io/repo/`).

## Run it

- Locally: double-click `index.html` (or `python3 -m http.server` in this folder).
- Deploy: see the five-line GitHub Pages instructions below.

## Deploy to GitHub Pages (5 steps)

1. Create a new repository on GitHub (any name, e.g. `lz-meridian-lab`).
2. Upload the **contents** of this folder to the repository root (Add file → Upload files, or `git push`).
3. Open **Settings → Pages**.
4. Set **Source** to your default branch (`main`) and the `/ (root)` directory, then Save.
5. Open `https://<your-username>.github.io/<repo>/` — the lab's apron should load.

An empty `.nojekyll` file is included so GitHub Pages serves the folder as-is.

## Structure

```
index.html          entry point (title/meta, dialog shells, script tags in dependency order)
css/styles.css      vanilla-CSS translation of the original Tailwind/shadcn styling (design tokens up top)
js/data.js          ALL content: objectives, quiz bank, glossary, debrief, seed NSG rules, probe presets
js/icons.js         inline SVG icon set (exact lucide path data, zero requests)
js/engine.js        packet simulator (gateway gating + first-match NSG evaluation, stateful semantics)
js/validation.js    CHECK RESULTS engine — every medium/hard validator with 1:1 feedback strings
js/state.js         persistence (key lz-meridian-lab-v1), scoring & stars
js/ui.js            view templates for every phase (apron, brief, ground, floor tools, schematic, dock)
js/app.js           controller: render loop, event delegation, quiz/handover/modals, boot
.nojekyll            empty marker for GitHub Pages
```

## Behaviour notes

- Progress auto-saves to `localStorage` under the same key as the original app
  (`lz-meridian-lab-v1`); RESET clears it. Storage failures (private mode, quota) degrade
  gracefully to in-memory play.
- Both modes are fully playable: **Line Check (medium)** — 12 objectives, tolerant checks,
  three-tier hints; **Type Rating (hard)** — 9 discovery challenges, strict checks, one nudge.
- Scoring: 65% first-attempt objective rate + 35% quiz accuracy − hint deductions; stars at
  95/85/70/55. Identical math to the original.
- All training data is synthetic (Aerolune Cargo; RFC 1918 / RFC 5737 address space only).

Version: **v4** (static release; all audit fixes are included in these files — see the
conversion notes shipped alongside this build).
