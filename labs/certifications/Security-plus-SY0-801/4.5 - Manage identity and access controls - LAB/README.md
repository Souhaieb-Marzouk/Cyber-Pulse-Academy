# The Access Bureau — IAM Practice Lab (static build)

A faithful, self-contained static port of **The Access Bureau**, an interactive
identity & access management practice lab for **CompTIA Security+ (SY0-801),
Lesson 4.5 — Manage identity and access controls** (authentication,
authorization, federation/SSO, and privileged access management).

All evidence, dossiers and accounts are **synthetic training data** (fictional
organization `Meridian Freight Co.`, fictional domains such as
`idp.meridianfreight.example`).

## Run it

No build step, no server, no dependencies. Any of these works:

- **Local file:** unzip and double-click `index.html` (works via `file://`).
- **Any static host:** serve the folder as-is.
- **GitHub Pages:** push the folder contents to a repo, enable Pages, done.

## Structure

```
index.html          single-page entry point
css/styles.css      vanilla CSS (design tokens + all component styles)
js/icons.js         inline SVG icon geometry (lucide v0.525.0, ISC)
js/data.js          ALL lab content: objectives data, artifacts, quizzes, glossary
js/objectives.js    CHECK RESULTS validation engine (11 medium + 10 hard work orders)
js/state.js         state store + localStorage persistence (key: access-bureau-v1)
js/ui.js            shared UI atoms (stamp button, order rail, choices, tooltips)
js/stations.js      the five interactive desk stations
js/app.js           shell, action routing, tracker, examination, debrief, modal
```

## Modes

- **Standard Audit (Medium)** — guided, 11 work orders, 3 free hint tiers,
  tolerant validation, 6-item concept examination.
- **Critical Audit (Hard)** — incident-grade, 10 deep work orders, noisy
  evidence with red herrings, one costly nudge, exact-value validation,
  7-item scenario examination.

Progress persists in `localStorage` under `access-bureau-v1` and resumes
exactly on reload. The eraser button in the desk rail resets to pristine
state after an explicit confirmation.

Deploy note (GitHub Pages): see the README section "How to run" in the repo
root or the deploy note delivered with the port.
