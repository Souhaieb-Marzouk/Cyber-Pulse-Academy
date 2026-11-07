# CyberLab “Harbor Control” — Cloud+ CV0-004 Lesson 1.5 (Orchestration)

A self-contained, zero-build practice lab: run the container fleet of the fictional
**Meridian Cartage Co.** and take it from hand-run stand-alone containers to a fully
orchestrated, self-healing, sale-proof deployment. Everything is client-side static —
no server, no build step, no external dependencies, no data leaves the browser.

- **Medium · Day Watch** — 12 guided work orders, pier pointers, 3 hint tiers, 6-question exam.
- **Hard · Night Watch** — 9 strict challenges inside a live midnight incident, noisy radio log, one star-costing nudge, 7-question exam.

Progress saves to `localStorage` (`cyberlab.harbor.v1`) and resumes exactly; RESET
(confirmed) returns the pristine sign-on board. All logs, pods and images are
synthetic training data.

## Run it

- Locally: double-click `index.html` (works over `file://`), or serve the folder with
  any static server, e.g. `python3 -m http.server 8000` and open
  `http://localhost:8000/`.
- GitHub Pages: push the folder contents to a repo, enable Pages on the branch/root,
  and open `https://<user>.github.io/<repo>/`. `.nojekyll` is included, so no Jekyll
  processing touches the files. All internal references are relative, so subpath
  hosting works out of the box.

## Layout

```
index.html          markup (mode select → briefing → control room → modals)
css/styles.css      design tokens (:root) + all styling, plain CSS
js/data.js          all lab content: objectives, quiz banks, glossary, log scripts
js/state.js         state object, localStorage persistence, env accessors
js/objectives.js    CHECK RESULTS validation engine + hint economy
js/quiz.js          examination engine (pick → lock → score → explain)
js/ui.js            renderers (piers, tabs, ledger, log, modals), toasts
js/app.js           simulation tick, actions, event delegation, bootstrap
```

Classic `<script>` tags in dependency order — ES2020-friendly vanilla JS, no
modules, no bundler, readable and commented (it is a teaching repo).

*v4 — includes all QA-audit fixes of the original lab.*
