# Harbor Watch — SY0-801 AI Security Risks Lab (static build)

A self-contained, dependency-free port of the **Harbor Watch — AI Risk Control Room** lab:
an interactive, synthetic training environment for the CompTIA Security+ (SY0-801)
objective *"summarize the threats and vulnerabilities associated with AI usage"*
(courseware lesson 2.5).

- **Zero build step, zero server, zero external runtime dependencies.**
  Plain HTML + CSS + vanilla JavaScript (classic `<script>` tags in dependency order,
  so it also works when opened directly from disk via `file://`).
- Two difficulty modes (**Medium** — 11 guided objectives, **Hard** — 9 broad challenges),
  a 13-risk index, evidence bays (transcripts, metrics, logs, configs), a detection-rule
  workbench, a launch-gate control deck, a knowledge check with per-answer explanations,
  a completion report with focus areas, and localStorage persistence with a confirmed reset.
- **All data is fictional and clearly labeled synthetic** (Saltmarsh Credit Union).

## Run it

- Simplest: double-click `index.html` (works from `file://`), or
- any static file server, e.g. `python3 -m http.server` in this folder, then open
  `http://localhost:8000/`.

## Deploy to GitHub Pages

1. Create a repository and push this folder's contents to the branch you serve from.
2. Repo -> Settings -> Pages -> Source: that branch, `/` (root).
3. Open `https://<user>.github.io/<repo>/`. (`.nojekyll` is included; all paths are
   relative, so subpath hosting under `user.github.io/<repo>/` works as-is.)

## Structure

```
index.html            markup + script tags (dependency order)
css/styles.css        full design system (custom-property tokens)
js/data.js            all lab content (verbatim constants)
js/state.js           state + localStorage persistence + tiny pub/sub
js/objectives.js      CHECK RESULTS engine, hints, completion report
js/quiz.js            knowledge check
js/ui.js              renderers, ledger, modals
js/app.js             event wiring + bootstrap
.nojekyll             GitHub Pages marker
```

Progress saves in your browser under the key `harborwatch-lab-v1`; the in-app
**Reset lab** button (with confirmation) returns everything to pristine.
