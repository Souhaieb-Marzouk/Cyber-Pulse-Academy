# Night-Shift Depot — Configuration Management Lab (N10-009)

A self-contained, static training lab for **CompTIA Network+ N10-009**
configuration & change management (Domain 3.0): production / backup /
baseline-golden configurations, configuration drift and monitoring,
backup jobs and restore tests, and the change-management workflow.

You play the night operator at the fictional **Kestrel Valley Transit
Authority** depot. Two difficulty modes share one evidence core:

- **Guided night shift (Medium)** — 11 graded duty items, tiered hints,
  a shift lead pointing you where to look.
- **Solo incident response (Hard)** — 9 strict multi-step challenges,
  red herrings, near-miss rejection with rationale.

Both modes end with a knowledge check and a scored end-of-shift report
(stars + evidence-derived focus areas). All content is synthetic; the
only real-world framing (MITRE ATT&CK M1053/M1026, Cisco Talos
"Static Tundra") is verified and cited in the briefing.

## Run it

No build, no server, no dependencies. Either:

- open `index.html` directly in any modern browser (works from `file://`), or
- serve the folder statically, e.g. `python3 -m http.server` and open
  `http://localhost:8000/`.

Progress auto-saves to `localStorage` (key `kvta-cfglab-v1`) and
resumes on reload. **Reset shift** wipes everything and returns the lab
to its pristine state. Nothing ever leaves the page — zero network
calls at runtime; the only external links are citation anchors.

## Deploy to GitHub Pages

1. Create a repository and upload this folder's contents
   (`index.html` must sit at the repo root).
2. Settings → Pages → deploy from the branch root.
3. Open `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves the folder as-is.
All paths are relative, so subpath hosting
(`user.github.io/repo-name/`) works unchanged.

## Layout

```
index.html          page structure (mode screen, desk, overlays)
css/styles.css      plain CSS, design tokens in :root
js/data.js          ALL lab content: configs, tickets, alerts, glossary,
                    objective sets (incl. answer keys), quiz bank
js/state.js         state + localStorage persistence
js/ui.js            render helpers: rack, file viewer, comparator, tabs
js/objectives.js    duty board + CHECK RESULTS engine
js/quiz.js          knowledge check: render, guard, score, lock
js/app.js           event wiring, completion report, bootstrap
```

Classic `<script>` tags in dependency order — no modules, no bundler,
nothing to install.
