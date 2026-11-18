# The Custody Bureau — MVHA Data Protection Lab (static, v4)

A self-contained, build-free port of the interactive Security+ (SY0-801 · objective 3.3)
practice lab: protecting data across its lifecycle. Everything is client-side vanilla
HTML/CSS/JS — no framework, no bundler, no server, no external runtime dependencies,
no secrets. All case content (people, records, events) is synthetic training material.

## Run it

- **Locally:** extract this folder anywhere and double-click `index.html` (works over `file://`).
- **GitHub Pages:** push the folder contents to a repository (root), enable Pages
  (branch/root), then open `https://<user>.github.io/<repo>/`. `.nojekyll` is included so
  Pages serves the files as-is. All references are relative, so subpaths work too.

## Modes

- **Registry Apprentice (Medium)** — 12 objectives, free hints (cost stars), tolerant grading.
- **Chief Custodian (Hard)** — 9 objectives, noisy evidence with decoys, strict grading.

Progress, examination results and the completion certificate persist in `localStorage`
(key `mvha-custody-lab-v1`); **Reset lab** (masthead) restores a pristine start.

## Structure

```
index.html        page structure (briefing, handbook, case floor, audit board, exam, field notes)
css/styles.css    design tokens (:root custom properties) + all styling
js/data.js        all lab content: objectives, quiz bank, documents, glossary, media, DLP events
js/state.js       state object + persistence + helpers
js/ui.js          sections, glossary drawer/tooltips, workbench widgets, renderers, certificate, overlays
js/objectives.js  CHECK RESULTS validation engine + hint system
js/quiz.js        examination renderer/grader
js/app.js         event wiring (verbatim, original order) + bootstrap
.nojekyll         GitHub Pages marker (skip Jekyll processing)
```

## Accessibility & keyboard

Skip link · sections 1–6 jump via number keys · `g` opens the glossary · `Esc` closes
overlays and tooltips · focus-visible outlines · ARIA live region for announcements ·
44 px minimum touch targets · responsive from desktop down to ~390 px.

## Notes

- External links (MITRE ATT&CK / D3FEND / CompTIA) are content citations only — the lab
  makes **zero** network calls of its own.
- Ported from the original single-file lab (v4 includes the full QA-audit fix set:
  quiz answer-position rotation, option-length balance, matching shuffles, evidence-derived
  certificate focus areas, honest re-validation, popup close paths, glossary completeness).
