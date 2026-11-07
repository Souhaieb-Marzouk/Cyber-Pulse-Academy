# Blueprint Studio — CV0-004 · Lesson 2.2 IaC Lab (static port)

A fully self-contained, offline-capable port of the **Blueprint Studio** interactive
lab (CompTIA Cloud+ CV0-004 · Lesson 2.2 — Infrastructure as Code). Vanilla
HTML/CSS/JS only — no build step, no backend, no external requests.

## Run it

- **Any static host** (GitHub Pages, Netlify, S3, nginx): upload this folder as-is.
  GitHub Pages: repo → Settings → Pages → *Deploy from branch* → pick the branch
  and `/ (root)` (or place the folder in `/docs` and pick `/docs`). `.nojekyll`
  is included, so underscore-free paths need no extra config.
- **Locally**: double-click `index.html` (works from `file://`) or serve the
  folder with any static server.
- **Subpath hosting** (e.g. `username.github.io/repo-name/`) works: every asset
  reference is relative.

Progress (answers, stamps, quiz results, environment changes) auto-saves to
`localStorage` under the key `cv0004-l22-blueprint-studio-v2`. The **RESET**
control in the title strip shreds the drawing set after confirmation.

## Structure

```
index.html          entry point + classic <script> tags (dependency order)
css/styles.css      hand-written vanilla CSS (design tokens in :root, no framework)
js/icons.js         inline Lucide SVG set (window.BlueprintIcons)
js/data.js          all lab content: template, plan, drift, findings, runs, glossary, quiz banks
js/objectives.js    environment shape + 12 medium + 9 hard objectives with validators
js/state.js         persistent store (localStorage + pub/sub, port of the zustand store)
js/ui.js            shared drafting-room primitives (window.BP)
js/panels.js        Sheet 03 workbench drawers (window.BPanels)
js/sheets.js        Sheets 00/01/02/03-wrapper/04/06 (window.BSheets)
js/quiz.js          Sheet 05 inspection stamps (window.BQuiz)
js/modal.js         completion modal + reset dialog (window.BModal)
js/app.js           root shell, event delegation, render loop
assets/fonts/       Geist + Geist Mono woff2 (bundled, same subsets as next/font)
assets/favicon.svg
.nojekyll           keeps GitHub Pages from running Jekyll
```

## Content notice

All companies, credentials, logs, resources and incidents in this lab are
**synthetic training data**. Any resemblance to real infrastructure is
educational dramatization. Do not reuse any value found here in a real system.

See `CONVERSION-NOTES.md` for the full original→static parity record.
