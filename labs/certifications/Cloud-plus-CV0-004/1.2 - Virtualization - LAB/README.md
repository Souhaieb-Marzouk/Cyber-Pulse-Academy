# The Isolation Foundry — static lab

Interactive practice lab for **CompTIA Cloud+ CV0-004 · Domain 1 · Lesson 1.2 — Virtualization**:
*understanding virtualization technologies and their role in cloud environments.*

Cast tenant workloads into the right isolation molds (VM, container, microVM, function, VDI),
keep a shared two-host floor healthy, triage telemetry, govern resources — then pass the
readiness audit. Fully self-contained: **no build step, no server, no network calls, no
framework** — plain HTML/CSS/JS.

## What's inside

- Two difficulty modes: **MEDIUM** (12 guided work orders, 3-tier hints, 6-question quiz)
  and **HARD** (9 exploratory orders, strict validators with near-miss rejections, 2 planted
  red herrings, trap steps, 7 scenario quiz items).
- CHECK RESULTS validators per objective, star scoring, completion report with focus areas.
- Progress auto-saves to `localStorage` (key `isolation-foundry-v1`); RESET returns the lab
  to a pristine state.

## Run it

Open `index.html` directly in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

## Deploy to GitHub Pages

The folder is Pages-ready: `index.html` at the root, relative paths only, lowercase-kebab
filenames, `.nojekyll` included. Push the folder contents to a repository and enable Pages
on the branch/root — no build pipeline needed.

## Layout

```
index.html        entry point (classic <script> tags, dependency order)
css/styles.css    design tokens + all styling (vanilla CSS, custom properties)
js/icons.js       inline Lucide SVG geometry (no icon fonts, no CDN)
js/data.js        all lab content: objectives, quiz bank, world data, glossary
js/objectives.js  CHECK RESULTS validation engine
js/state.js       state engine: reducer, stars, localStorage persistence, store
js/ui.js          UI primitives (panel, gauge, select, tabs, accordion, dialogs)
js/quiz.js        readiness audit (one-question-at-a-time flow)
js/floor.js       foundry floor: intake deck, mold picker, host stations, benches
js/app.js         shell: header, mode gate, briefing, dock, debrief, completion
assets/fonts/     bundled woff2 subsets (Space Grotesk, JetBrains Mono)
assets/favicon.svg
.nojekyll         disables GitHub Pages Jekyll processing
```

All training data is synthetic and clearly labeled in-lab. Educational, defensive framing.
