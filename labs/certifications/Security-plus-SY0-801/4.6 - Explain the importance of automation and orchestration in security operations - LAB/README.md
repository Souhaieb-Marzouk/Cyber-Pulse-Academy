# The Automation Operations Floor (Static)

A self-contained, **build-free, server-free** static copy of the interactive
practice lab for **CompTIA Security+ SY0-801 — Lesson 4.6: Explain the
importance of automation and orchestration in security operations**.

Everything runs client-side. No framework, no bundler, no npm, no server, no
external runtime dependencies, no API keys. Progress auto-saves to
`localStorage` and resumes on reload.

## Open it

Just open `index.html` in any modern browser — it works from `file://`,
any static file server, or GitHub Pages.

## Deploy to GitHub Pages

1. Create a new public repository (e.g. `secplus-labs`).
2. Upload the **contents** of this folder to the repo root (or push the folder
   as a subdirectory).
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch**, pick your branch and `/root` (or the folder).
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the lab loads and the Automation Operations Floor appears.

The `.nojekyll` file prevents GitHub Pages from running Jekyll so the
`css/` and `js/` folders are served verbatim.

## What's inside

```
automation-operations-floor-static-v4/
  index.html         # page shell + script tags (relative paths only)
  css/styles.css     # design tokens + components (dark control-room theme)
  js/data.js         # all content: objectives + check rules, quiz, glossary
  js/state.js        # state + localStorage persistence + pub/sub
  js/ui.js           # inline SVG icons + render functions
  js/app.js          # bootstrap + event delegation + keyboard
  README.md          # this file
  .nojekyll          # empty marker for GitHub Pages
```

## Features (parity with the original)

- Two difficulty modes (Medium: 12 guided objectives; Hard: 8 deep challenges).
- Eight console panels: Playbook, Integrations, Triage, Detection, AI
  Workflows, Metrics, Post-Mortem, Roadmap (Hard only).
- Per-question quiz with answer lock, next-question enforcement, R3 coloring
  (green correct / red wrong; correct never revealed green on a wrong pick),
  rotated correct-answer positions, balanced option lengths.
- Performance-derived focus areas in the completion report.
- Persistence (save → reload → resume) and confirmed RESET.
- Responsive 390 px → desktop; 44 px touch targets; keyboard + ARIA.

All data is synthetic and labeled as training data. MITRE ATT&CK IDs
referenced are accurate to the official source.
