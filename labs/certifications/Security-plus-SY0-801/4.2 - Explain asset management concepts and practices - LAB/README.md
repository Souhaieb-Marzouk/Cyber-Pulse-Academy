# The Registry — SY0-801 4.2 Asset Management Lab (static build v4)

A hands-on, self-contained training lab for **CompTIA Security+ SY0-801, Objective 4.2** —
*Explain the security implications of proper hardware, software, and data asset management*.
You play the IT Asset & Compliance Coordinator at the fictional Corvane Mutual Insurance:
walk the five lifecycle stages, reconcile the registry, flag shadow IT, and retire FILE01
properly. All data is synthetic training data.

This is a **pure static port**: no build step, no server, no external runtime dependencies.
Everything runs client-side in one page.

## Run it

- **Local:** open `index.html` in any modern browser (works from `file://` after extraction), or
  serve the folder with any static file server, e.g. `python3 -m http.server` and open
  `http://localhost:8000/`.
- **GitHub Pages:** push this folder's contents to a repository (root or `/docs`), enable
  Pages, and open `https://<user>.github.io/<repo>/`. `.nojekyll` is included; all paths are
  relative so subpath hosting works out of the box.

## Structure

```
index.html          page markup (mode select, world, modals, toast)
css/styles.css      all styling — design tokens in :root, plain CSS, no frameworks
js/data.js          all lab content: knowledge core, glossary, quiz banks, environments,
                    objectives (with validation rules, hints, feedback), desk registry
js/state.js         state object + localStorage persistence + setters (key:
                    sy0801-42-asset-lab-v1, in-memory fallback, confirmed RESET)
js/objectives.js    CHECK RESULTS validation engine, hint tiers/nudges, star scoring
js/quiz.js          knowledge check (sequential unlock, answers lock on submit)
js/ui.js            renderers: rail, stations, objectives tracker, completion report
js/app.js           event wiring (delegated clicks/changes, modals, RESET) + boot
assets/favicon.svg  favicon
.nojekyll           GitHub Pages marker (skips Jekyll processing)
```

## Features

- Two difficulty modes: **Medium** (guided audit, 12 objectives, 3-tier hints) and
  **Hard** (noisy full audit, 8 deep objectives, red herrings, one nudge max).
- Objectives tracker with per-objective CHECK RESULTS, hints, and completion report
  (stars + focus areas + certificate).
- Knowledge check quiz (6 medium / 7 hard items) with sequential unlock, answer locking,
  and per-item explanations.
- Progress auto-saves in your browser (localStorage) and resumes exactly; RESET returns
  the lab to pristine after confirmation.

## Scope & sources

Mapped to SY0-801 Objective 4.2; MITRE ATT&CK entities cited in the debrief
(T1200, T1567.002, M1033, M1034, M1035, M1051, M1017) link to attack.mitre.org.
The lab itself never calls the network — links open in a new tab as reference material.
