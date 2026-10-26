# CyberLab — CySA+ CS0-003 · Lesson 9.1: Analyzing Incident Response Activities

A fully static, self-contained copy of the "IR War Room" practice lab for
**CompTIA CySA+ CS0-003 — Lesson 9.1: Analyzing Incident Response Activities**
(case **IR-2317 "BLACKROUTE"** @ Meridian Freight Logistics — a synthetic
ransomware scenario).

Everything runs client-side: **no build step, no server, no framework, no
external runtime dependencies.** Plain HTML + CSS + vanilla JavaScript
(ES2020+, classic script tags).

## What's inside

```text
index.html            entry point (open this)
css/styles.css        design tokens + component styles
js/data.js            all lab content (objectives, artifacts, quiz, glossary…)
js/state.js           state store + localStorage persistence + pub/sub
js/objectives.js      CHECK RESULTS validation engine (21 validators) + scoring
js/quiz.js            knowledge-check station (commit-once, color contract)
js/ui.js              inline Lucide SVG icons + shared widgets
js/app.js             bootstrap, shell rendering, event wiring
assets/favicon.svg    shield favicon
.nojekyll             keeps GitHub Pages from running Jekyll
```

## Features

- **Two difficulty modes** chosen on the opening screen:
  - *Guided Response* — 12 guided objectives, 3-tier hints, tolerant checking.
  - *Live Fire* — 9 broad challenges, 12 intake artifacts with 4 red herrings,
    strict validation, one scored nudge per objective.
- **War-room stations** following the IR lifecycle: Case File, Prepare,
  Detect, Analyze, Contain, Eradicate, Recover, Debrief + Knowledge Check.
- **CHECK RESULTS** validation with teaching feedback; tiered hints;
  scoring with stars (1–3) on completion.
- **Knowledge check** quiz with per-answer explanations.
- **Persistence** — progress autosaves to `localStorage`
  (`cyberlab-cysa-cs0-003-l9-1-v1`), resume on return, confirmed reset.
- **Accessible**: keyboard-operable, ARIA labels/live regions, focus
  management in dialogs, 44 px minimum touch targets.
- **Responsive**: desktop three-column war room → stacked at phone widths.
- All data is **synthetic training data**; ATT&CK IDs were verified against
  attack.mitre.org at build time.

## Run it

Any of these works:

1. **Double-click `index.html`** — the lab also runs from `file://`.
2. Serve the folder with any static server, e.g.:
   `python3 -m http.server 8000` → open `http://localhost:8000/`.
3. **GitHub Pages**: push the folder contents to a repo, enable Pages on the
   branch/root, and open `https://<user>.github.io/<repo>/`. All references
   are relative, so subpath hosting works out of the box.

## Deploy note

1. Create a new GitHub repository.
2. Upload the extracted folder contents (or push the folder as-is).
3. Settings → Pages → Deploy from branch → select branch + `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the lab loads and the mode-select screen appears.

## Disclaimer

Training simulation only. All hosts, users, domains, logs and artifacts are
fictional. Defensive/educational use only.
