# The Migration Drafting Room — Cloud+ CV0-004 · Lesson 2.1 (static lab)

An interactive, self-contained practice lab for **CompTIA Cloud+ CV0-004, Lesson 2.1 —
System requirements: analyzing requirements for workload migrations**. You play a migration
consultant drafting a requirements dossier for a fictional company: read the evidence, fill
the planning sheets, and stamp every objective on the clipboard. Two difficulty modes
(Medium · 12 objectives, Hard · 9 objectives), an exam drill with per-item feedback, a
derived focus-areas debrief, and full progress persistence.

This is the **static port**: plain HTML + CSS + vanilla JavaScript, no framework, no build
step, no server, no external dependencies, no tracking.

## Open it

- Locally: double-click `index.html` (works from `file://`), or
- serve the folder with any static server, e.g. `python3 -m http.server` in this folder,
  then open <http://localhost:8000/>.

## Deploy to GitHub Pages (5 steps)

1. Create a new GitHub repository (any name, e.g. `cv0004-lesson2-1-lab`).
2. Upload/push the **contents of this folder** to the repository root.
3. Repo → Settings → Pages → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/` after the first build finishes (~1 min).
5. Confirm the lab loads and stamps an objective — done; it needs nothing else.

## Layout

```
index.html        page shell (head, body markup, script tags)
css/styles.css    all styling (design tokens as CSS custom properties)
js/data-core.js   core content: manual, glossary, mode/briefing data
js/data-folders.js  evidence content: all folder sheets (telemetry, specs, ledger, ...)
js/data-quiz.js   exam-drill quiz bank (13 items, both modes)
js/objectives.js  objectives + CHECK RESULTS validation engine
js/app.js         state, persistence, rendering, events, overlays
.nojekyll         tells GitHub Pages to serve files as-is (no Jekyll processing)
```

## Notes

- Progress is saved in your browser's `localStorage` under the key `cv0004l21lab-v1`;
  **Reset lab** (in the header) returns the lab to pristine after confirmation.
- Everything runs client-side: the lab makes **zero network requests** beyond loading its
  own files. The two CompTIA links in the Debrief/Completion screens are ordinary
  citations that open in a new tab.
- Synthetic training environment: the organization, provider and data are fictional.

*Source: single-file original lab, ported 1:1 (same content, validation, persistence and
styling) — see the QA Audit Pack / Conversion Notes for details.*
