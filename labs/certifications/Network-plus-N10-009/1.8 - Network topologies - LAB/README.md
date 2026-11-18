# The Blueprint Room — static lab

An interactive, self-contained practice lab for **CompTIA Network+ (N10-009) · Lesson 1.8: Network topologies** — mesh, hybrid, star/hub-and-spoke, spine-and-leaf, point-to-point, three-tier, and collapsed core (Domain 1.0).

You play a consultant on the (fictional) **Trellis Foods Topology Modernization Project**: seven synthetic as-built drawings, four instruments (Inspector, Failure Rig, Path Tester, Build Board), a 12-objective **Medium** run or a 10-challenge **Hard** run, a Plan Review quiz, and a scored sign-off. All progress saves in your browser (`localStorage` key `blueprint-room-v1`); **Reset** wipes it.

All organizations, devices, tickets and prices are **fictional synthetic training data**.

## Run it

No build, no server, no dependencies — plain HTML/CSS/JS.

- **Local:** double-click `index.html` (works from `file://`), or
  serve the folder: `python3 -m http.server 8000` → open `http://localhost:8000/`.
- **GitHub Pages:** push this folder's *contents* to a repo (root), enable Pages, open `https://<user>.github.io/<repo>/`. All paths are relative; `.nojekyll` is included.

## Layout

```
index.html          entry point (loads scripts in dependency order)
css/styles.css      design tokens + all styling (translated from the original theme)
js/icons.js         inline SVG icons (exact Lucide path data)
js/data.js          ALL lab content: field guide, glossary, handover, site drawings, evidence
js/engine.js        pure graph functions (reachability, cut survival, shortest path, …)
js/objectives.js    the 22 objective definitions + machine-checkable validators
js/quiz.js          Plan Review quiz bank (R4 rotation, R5 length discipline)
js/state.js         state store + reducer + localStorage persistence + scoring
js/ui.js            render functions (HTML string components)
js/app.js           bootstrap, event delegation, keyboard paths
assets/fonts/       bundled Geist / Geist Mono / Space Grotesk (latin, woff2)
assets/favicon.svg  local favicon
.nojekyll           GitHub Pages marker
```

Data is separated from logic: content edits happen in `js/data.js`, objectives/validators in `js/objectives.js`, quiz in `js/quiz.js`.
