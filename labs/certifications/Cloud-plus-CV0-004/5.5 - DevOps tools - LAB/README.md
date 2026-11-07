# DevOps Tools Lab — static build (CompTIA Cloud+ CV0-004 · Lesson 5.5)

A faithful, self-contained static copy of the **"DevOps Tools — the automation line"**
practice lab: one fictional retail platform (NimbusCart), one automated release train,
one night that goes wrong. Learn what **Kubernetes**, **Ansible** and **Jenkins** each
do, how CI/CD stages interlock, and how these tools fail or get abused — on a guided
**day shift** (medium) or a solo **night-shift incident** (hard).

Everything is synthetic training data. All interactions run **entirely in your browser**:
no server, no build step, no external requests (fonts are bundled locally).

## Run it

- **Simplest:** unzip and double-click `index.html` (works from `file://`), or
- **Recommended:** serve the folder with any static file server, e.g.
  `python3 -m http.server` and open `http://localhost:8000/`, or
- **GitHub Pages:** push the folder contents to a repo and enable Pages — the lab
  works at the site root and under a subpath (`user.github.io/repo/`), thanks to
  relative-only paths (`.nojekyll` is included so GitHub serves files as-is).

## The lab

- **Mode select** — pick Day shift (12 guided objectives, 3-tier hints) or Night shift
  (10 challenges, noisy evidence, red herrings, one nudge).
- **Line board** — five stations (PLAN → BUILD → CONFIGURE → ORCHESTRATE → OPERATE);
  lamps track completion per station.
- **Dispatch** — objectives with machine-checked widgets (matching, ordering, sorting,
  multi-select, toggles, exact text). CHECK RESULTS validates your work and always
  explains itself.
- **Workbench** — tabbed evidence viewer (Jenkinsfile, playbooks, manifests, consoles,
  audit events, plus night-shift noise files).
- **Signal check** — concept/scenario quiz; answers lock once validated (choose wisely).
- **Field manual** — the knowledge core: tool cards, concepts, verified MITRE ATT&CK
  technique mappings, glossary.
- **Handover notes** — detections, mitigations with official ATT&CK M-IDs, takeaways.
- **End-of-shift report** — star rating (efficiency matters), per-pillar recap, and
  focus areas derived from your actual performance.

Progress auto-saves in `localStorage` (key `cv0-004-l5-5-devops-tools-lab-v1`) and
**Reset** (top right) returns the lab to pristine state.

## File map

```
index.html            entry point (loads scripts in dependency order)
css/styles.css        design tokens + all component styles (plain CSS)
js/data.js            ALL lab content (objectives, quiz, evidence, glossary) — data only
js/state.js           state store + localStorage persistence (same keys as the original)
js/objectives.js      CHECK RESULTS validation engine + progress/star math
js/ui.js              DOM helpers, inline SVG icon set, widgets, tooltip, overlay manager
js/sections.js        section renderers (mode select, line board, dispatch, workbench…)
js/quiz.js            signal check (two-phase answer flow)
js/app.js             bootstrap + event delegation
assets/fonts/         Space Grotesk / Inter / JetBrains Mono (woff2, latin subset)
assets/favicon.svg    train-front favicon
```

No frameworks, no build, no minification — the code is meant to be read. Classic
scripts only, so it also works when opened directly from disk.

## Accessibility & conduct

Keyboard-operable throughout (buttons/selects/switches, Escape closes overlays,
focus is trapped and returned), ARIA-labelled regions and live announcements,
44px minimum touch targets, WCAG-AA contrast on the dark theme, responsive from
desktop multi-panel down to ~390px.

Defensive framing only: MITRE ATT&CK references are for education; all hosts,
tokens and IPs are fictional (`.example`, RFC-5737).
