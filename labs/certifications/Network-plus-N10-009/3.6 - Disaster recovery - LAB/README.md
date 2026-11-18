# Operation THAWLINE — Disaster Recovery Practice Lab (static build)

A self-contained, interactive disaster-recovery practice lab for the
**CompTIA Network+ (N10-009)** objectives — RPO, RTO, MTTR, MTBF,
cold/warm/hot sites, active-active/passive redundancy, and DR testing —
framed as a fictional tabletop exercise at **Borealis Cold Chain Logistics**
(all data is synthetic training material).

This is the **static port** of the original Next.js lab: same scenario, same
12 Medium / 9 Hard objectives, same validators, hints, quiz banks, scoring,
persistence and reset — rebuilt as plain HTML/CSS/JS with **zero build step,
zero server and zero external dependencies**.

## Open / deploy

- **Locally:** unzip and double-click `index.html` (works from `file://`).
- **Any static host:** upload the folder as-is. For GitHub Pages: push the
  folder contents to a repository, then Settings → Pages → deploy from
  branch/root. A `.nojekyll` file is included so GitHub Pages serves
  everything verbatim.
- **Subpath-safe:** every reference is relative, so
  `https://<user>.github.io/<repo>/` and any subpath deployment both work.

## Layout

```
index.html          the lab page (all mounting points + dialogs)
css/styles.css      vanilla CSS; design tokens copied from the original theme
js/icons.js         inline Lucide SVGs (path data extracted from lucide-react)
js/data.js          ALL lab content: documents, SLAs, drill data, quiz banks,
                    glossary, board metadata (1:1 with the original data.ts)
js/shuffle.js       seeded Fisher–Yates shuffles (answer-position rotation)
js/objectives.js    the 21 objective definitions + CHECK RESULT validators
js/state.js         state store + localStorage persistence + scoring
js/ui.js            shared components + page chrome (strip, clipboard, wall)
js/boards.js        the seven content boards (briefing … after-action)
js/quiz.js          the Board Review quiz (validate → lock → next lifecycle)
js/app.js           bootstrap, event wiring, re-render graph
assets/fonts/       bundled Archivo + IBM Plex Mono woff2 (no font CDNs)
.nojekyll           GitHub Pages: serve everything as-is
```

## Features

- Mode gate: **MEDIUM (guided)** and **HARD (live audit)** difficulties
- Objectives clipboard with pillar badges, tiered hints (Medium) / paid nudge
  (Hard), CHECK RESULTS validation and coach feedback
- Eight evidence-wall boards: briefing, field manual, records room (8 source
  documents incl. a noise folder), storm-drill decision table, recovery
  ledger, continuity planner, board review quiz, after-action notes
- Auto-save + resume via localStorage (`thawline-dr-lab-v1`); confirmed reset
- Score (70% objectives / 30% quiz), 0.5-star rating steps, completion debrief
  with performance-derived focus areas
- Keyboard-operable, ARIA-labelled, responsive from ~390 px to desktop

All content is fictional training data. No real systems, no telemetry, no
external calls.
