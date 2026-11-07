# The Deployment Factory — static lab (CompTIA Cloud+ CV0-004 · Lesson 5.3: CI/CD pipelines)

A faithful **self-contained static port** of the framework lab "The Deployment Factory": an
interactive practice floor where you inherit a broken CI/CD pipeline at NimbusPay (a fictional
payments fintech), repair all seven stations, close the work orders, pass the final quiz and get
scored — entirely in your browser, with **zero build step, zero server, zero external runtime
dependencies**.

## Open it

- Locally: unzip anywhere and double-click `index.html` (works via `file://`), or
- serve the folder with any static file server (`python3 -m http.server`), or
- deploy to GitHub Pages: push the folder contents to a repo, enable Pages, open
  `https://<user>.github.io/<repo>/`.

## What's inside

```
index.html            — single page, classic <script> tags (no modules, no bundler)
css/styles.css        — vanilla CSS with design tokens (translated from Tailwind/shadcn)
js/data.js            — ALL lab content: objectives, quiz bank, evidence, glossary (1:1 from the framework lab)
js/engine.js          — pipeline simulator, CHECK RESULTS validators, scoring, persistence (1:1)
js/state.js           — plain-JS store + pub/sub + localStorage (same keys and semantics as the original)
js/ui.js              — shared primitives: lamps, badges, dialogs, popovers, controls
js/quiz.js            — Final Quiz binder (lock → explanation → enforced advance → result sheet)
js/app.js             — phases, conveyor, work orders, station inspectors, completion modal
js/icons.js           — exact lucide-react SVG node data, rendered inline
assets/fonts/         — Geist Sans/Mono woff2 (bundled; no font CDN)
assets/logo.svg       — local favicon
.nojekyll             — prevents GitHub Pages Jekyll processing
```

## Features

- **Two difficulty shifts**: Day Shift (guided, 11 work orders, 3-tier hints, 6-question quiz) and
  Night Shift (discovery, 9 deeper work orders with red herrings, 1 scored hint, 7 scenario questions).
- **Pipeline simulator**: RUN THE LINE sweeps all seven stations (source → build → test → scan →
  package → release → production) with colored diagnostic logs; station lamps give instant feedback.
- **Machine-verified work orders**: CHECK RESULTS validates your station configuration, form answers
  and incident-response sequences, with teaching feedback for every pass/fail.
- **Scoring**: work-order mastery (70%) + quiz (30%); stars reward first-attempt accuracy.
- **Persistence**: progress auto-saves to localStorage (`cv0004-l53-deployment-factory-v1`) and
  resumes exactly; the ↺ button (with confirmation) resets to pristine.
- **Accessible**: keyboard-operable, ARIA roles/labels throughout, focus-visible rings, 390 px
  responsive, WCAG-AA contrast on the dark industrial theme.

All data is synthetic and clearly labeled: every domain, host, credential and log line is fictional
and safe. Defensive/educational framing only.
