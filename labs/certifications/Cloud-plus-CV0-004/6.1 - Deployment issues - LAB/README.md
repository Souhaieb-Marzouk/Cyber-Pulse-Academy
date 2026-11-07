# Launch Control — Cloud+ CV0-004 6.1: Deployment Issues (static lab)

An interactive, self-contained practice lab for **CompTIA Cloud+ CV0-004,
objective 6.1 — "Given a scenario, troubleshoot deployment issues."** You are
Platform Ops on-call during "Wave 3" launch night: 13 synthetic deployments,
11 faults covering all seven official 6.1 sub-bullets, 2 healthy red herrings.

This is the **static port** (v4) of the original framework lab: pure HTML/CSS/JS,
no build step, no server, no external requests.

## Open it

- **Local:** extract and double-click `index.html` (works from `file://`), or
- **Any static host:** serve the folder as-is. For GitHub Pages: push the
  folder contents to a repo and enable Pages (see below).

## Features

- Two difficulty modes: **Field Technician** (medium, 12 guided objectives,
  3-tier hints) and **Incident Commander** (hard, 9 multi-step objectives,
  red herrings, strict validation, hint scoring penalty).
- 13-deployment evidence board: logs, events, IaC templates, user-data output,
  metrics sparklines, config tables.
- Triage desk with the CV0-004 6.1 taxonomy + a hard-mode 13-row sweep board.
- Field manual: taxonomy, pipeline anatomy, 4 drill widgets, glossary, tips.
- Knowledge check (6 medium / 7 hard items) with explanations.
- Debrief field notes + completion record with evidence-derived focus areas.
- CHECK RESULTS engine with instant teaching feedback; progress auto-saves to
  `localStorage` (key `cobalt-launch-control-v1`) and RESET restores pristine
  state after confirmation.

## Deploy to GitHub Pages (5 steps)

1. Create a new repository on GitHub.
2. Upload/push the **contents** of this folder (index.html at repo root).
3. Repo **Settings → Pages** → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the lab loads and "restoring shift…" is replaced by the mode screen.

A `.nojekyll` file is included so GitHub Pages serves files as-is.

## Structure

```
index.html          single-page shell (no nav, no footer — by design)
css/styles.css      design tokens + all component styles (vanilla CSS)
js/data.js          all lab content (cases, drills, quiz bank, glossary)
js/objectives.js    CHECK RESULTS validation engine + objective definitions
js/state.js         state store + localStorage persistence + pub/sub
js/ui.js            renderers: header, mode select, briefing, floor, quiz, debrief
js/widgets.js       field manual, objectives tracker, completion modal
js/app.js           bootstrap, event wiring, sheets, focus/scroll system
assets/             favicon (fonts are inlined in styles.css as data URIs)
```

All content is **synthetic training data**: fictional provider "NimbusScale",
fictional operator "Cobalt Freight". Nothing touches a real cloud provider.
