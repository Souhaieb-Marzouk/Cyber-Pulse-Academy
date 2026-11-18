# The Transmission Bench — N10-009 Lesson 1.6 practice lab (static build)

A self-contained, zero-dependency interactive practice lab for **CompTIA Network+
(N10-009) Domain 1, objective 1.5 — "Compare and contrast transmission media and
transceivers"** (courseware lesson 1.6). You play the media certification
technician at Cascadia Ridge College: pick the right transmission medium for
every work order, spot the failing links, and defend your choices.

All organizations, labels and readings are **synthetic training data**.

## Run it

No build step, no server, no packages.

- **Locally:** extract the folder and double-click `index.html` (works over `file://`), or
  `python3 -m http.server` in this folder and open `http://localhost:8000/`.
- **GitHub Pages:** push the folder contents to a repository (root or `/docs`),
  enable Pages, open `https://<user>.github.io/<repo>/`. `.nojekyll` is included
  so Pages serves the files as-is. All references are relative, so subpath
  hosting (`user.github.io/repo-name/`) works unchanged.

## What's inside

```
index.html      page shell + semantic markup (ARIA roles, skip link, live regions)
css/styles.css  all styling; design tokens as :root custom properties
js/data.js      all lab content: glossary, media library, work orders, matrix, quiz bank, field notes
js/state.js     state store + localStorage persistence (key lab-n10-009-l16-transmission-media-v1)
js/objectives.js objective lists (11 medium / 9 hard) + CHECK RESULTS validation engine
js/quiz.js      knowledge-check panel (per-item lock, color contract, explanations)
js/ui.js        rendering: bench surfaces, widgets, live readouts, cert card, modals
js/app.js       event wiring, mode entry/switch, confirmed reset, boot
assets/         favicon only (everything else is inline SVG/CSS)
```

Classic `<script>` tags in dependency order (no ES modules) so the lab runs
from `file://` as well as http(s). No frameworks, no minification — the JS is
written to be read: data in `data.js`, validation in `objectives.js`, rendering
in `ui.js`.

## Features

- **Medium mode** — 11 guided objectives: channel planning (1/6/11 @ 20 MHz),
  fiber spec (SMF/OM grades/LC/LR), satellite orbit matching, coax + splitter
  dB math, DAC policy, fault triage, plus three rack widgets and two matrix
  panels. Live instrument readouts coach you as you choose; three-tier hints.
- **Hard mode** — 9 field challenges: a mislabeled audit dossier (two lying
  evidence tags), feasibility matrix, latency SLA, spectrum forensics,
  remediation plans, link budget math. Strict multi-part checking, near-misses
  rejected with a rationale, one scoring nudge.
- **Quiz** — 6 medium / 7 hard items; answers lock on submit; wrong answers
  never reveal the correct one (the feedback names it in words).
- **Completion report** — stars, pillar recap, and focus areas derived from
  your own attempts, hints and quiz misses.
- **Persistence** — progress auto-saves per browser (both modes independently);
  Reset (with confirmation) returns the lab to pristine.

Content is ported 1:1 from the original single-file lab build; see
`../transmission-media-lab-static-docs/conversion-notes.md` for the porting
decisions and `feature-parity-checklist.md` in the same docs folder for the
full parity audit.
