# 1.1 - Understanding Cybersecurity Leadership Concepts - LAB

An interactive practice lab for **CompTIA CySA+ CS0-003 — Lesson 1.1:
Understanding Cybersecurity Leadership Concepts**. A fictional, defensive-only
training simulation: every organization, person, message and log is synthetic
training data.

You play the newly hired CISO of Novara Health Logistics. Work the memos on
your desk, file every objective, survive the exit interview — in two modes:

- **Guided Orientation** (medium): 12 guided objectives, "where to look"
  pointers, 3-tier hints.
- **Live Fire** (hard): 9 broad challenges, noisy evidence with red herrings,
  exact validation, one score-costing nudge.

Everything runs client-side in plain HTML/CSS/JS. No build step, no server,
no external dependencies, no data collection.

## Run it

Option A — just open the file:

1. Extract the folder (keep the structure intact).
2. Double-click `index.html`.

Option B — serve it (recommended, matches GitHub Pages):

```bash
# from the folder that contains index.html
python3 -m http.server 8080
# open http://localhost:8080/
```

## Deploy to GitHub Pages

1. Create a repository and upload the contents of this folder
   (`index.html` must sit at the repo root).
2. Repo → Settings → Pages → deploy from branch, pick the branch and `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves files as-is.

## Progress

Progress (mode, answers, score, quiz) is saved automatically in your browser's
`localStorage` under the key `cyberlab-cysa-leadership-v1`. **Reset** (in the
in-lab toolbar) shreds the case file back to pristine state. No data ever
leaves your machine.

## Layout

```
index.html        entry point
css/styles.css    design tokens + all styling (no framework)
js/data.js        lab content (objectives, quiz, evidence, glossary…) — synthetic
js/objectives.js  validation engine (pure functions)
js/state.js       state store + localStorage persistence
js/widgets.js     the six interaction widget archetypes
js/panels.js      cover, panes, reference shelf, dialogs, completion modal
js/quiz.js        exit interview workspace
js/app.js         bootstrap + render orchestration
js/icons.js       inline SVG icons (lucide, ISC license)
assets/           fonts (Geist, bundled) + favicon
```
