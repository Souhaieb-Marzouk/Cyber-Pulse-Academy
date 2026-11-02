# SKYSCAN — Cloud Posture Assessment Lab (static)

An interactive, self-contained cybersecurity practice lab for
**CompTIA CySA+ CS0-003 · Lesson 12.2 — Analyzing Cloud Vulnerabilities**.

You operate **SKYSCAN**, a (fictional) cloud platform assessment tool at
**NimbusStack Retail**: run assessments across six estate domains, analyze a
noisy 18-line findings report, flag misconfigurations, apply report
remediations, verify with a re-assessment, and close out a knowledge check —
in two difficulty tracks.

> 100% synthetic training data. Every org, resource, CVE and advisory in this
> lab is fictional and labeled as such. Defensive/educational use only.

## Run it

No build step, no server, no dependencies. Either:

- **Open directly**: double-click `index.html` (works from `file://`), or
- **Serve statically** (recommended, e.g. for GitHub Pages):
  any static file server pointed at this folder, e.g.
  `python3 -m http.server 8000` then open `http://localhost:8000/`.

## Deploy to GitHub Pages (5 steps)

1. Create a new GitHub repository.
2. Upload the **contents of this folder** (or push the folder itself).
3. Settings → Pages → Source: your branch, `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the lab loads — pick a track and run the initial assessment.

## Features

- **Two difficulty tracks** — Medium (guided, 12 objectives, 3-tier hints,
  tolerant checks) and Hard (9 broad challenges, planted false positives,
  strict validation with rationale).
- **Assessment console** — animated scan, filterable findings report (18
  findings, 6 domains), raw resource inspector (16 resources), remediation
  deck with ordered/multi-step actions, drill widgets (9 kinds).
- **Knowledge check** — 6 concept items (Medium) / 7 scenario items (Hard),
  with explanations after every answer.
- **Progress that persists** — auto-saves to your browser's localStorage
  (key: `skyscan-cloudposture-lab-v1`). RESET (top bar) wipes it after an
  explicit confirmation.
- **Completion rating** — 1–5 stars from first-attempt accuracy, hint usage
  and quiz score, plus performance-derived focus areas.
- **Accessible** — keyboard operable, ARIA roles/labels/live regions,
  44px touch targets, responsive from ~390px phones to desktop.

## Folder structure

```
index.html            entry point
css/styles.css        all styling (vanilla CSS, design tokens at the top)
js/data.js            all lab content: estate, findings, objectives, quiz, glossary
js/state.js           state store + localStorage persistence + environment derivation
js/objectives.js      CHECK RESULTS validation engine + star rating + quiz scoring
js/ui.js              rendering primitives: icons, badges, posture dial, modals, selects
js/components.js      section renderers (mode select, console, deck, drills, rail, debrief…)
js/quiz.js            knowledge check renderer
js/app.js             bootstrap, event wiring, scan controller
assets/favicon.svg    favicon
```

All references are relative, so the lab works at the root of a domain **and**
under a subpath (e.g. `user.github.io/repo/`), with or without a server.

— Part of the SKYSCAN training lab family. v4 static build.
