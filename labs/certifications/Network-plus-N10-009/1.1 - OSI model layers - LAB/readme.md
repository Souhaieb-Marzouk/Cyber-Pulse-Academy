# The Protocol Tower — static lab (v4)

A faithful, self-contained static port of the interactive practice lab for
**CompTIA Network+ (N10-009) · Lesson 1.1 — OSI model layers & encapsulation
concepts**. All interaction runs in the browser: no build step, no server, no
external dependencies.

## What it is

- **Two shift modes** — Day Shift (Medium, guided, tiered hints) and Night Shift
  (Hard, noisy evidence, strict near-miss rejection).
- **13 medium / 9 hard work orders** with instant machine-checked validation
  (CHECK RESULTS), teaching feedback, and a hint ladder.
- **7-question shift quiz** per mode (one-shot, explanations after each answer).
- **Tower Manual** (7 floor accordions), **Shift Handover** field notes, and a
  **completion report** with stars, pillar recap and evidence-derived focus areas.
- Progress **auto-saves to localStorage** (`osi-protocol-tower-v1`) and resumes
  exactly; **Reset** wipes back to pristine after confirmation.
- All evidence (frames, consoles, configs) is **synthetic training data** for a
  fictional campus (RFC 5737 / RFC 7042 addresses).

## Run it

- **Locally:** extract and double-click `index.html` (works from `file://`), or
  serve the folder with any static file server.
- **GitHub Pages:** push the folder contents to a repo, enable Pages
  (branch/root), open `https://<user>.github.io/<repo>/`. All paths are relative,
  so subpath hosting works as-is. `.nojekyll` disables Jekyll processing.

## Files

```
index.html        entry point
css/styles.css    theme (design tokens + component classes)
css/font-faces.css  bundled @font-face rules
js/data.js        all lab content (objectives, quiz, glossary, briefing, handover)
js/objectives.js  CHECK RESULTS validation engine
js/state.js       store + localStorage persistence + pub/sub
js/ui.js          rendering + components (gate, chrome, widgets, dialogs, bell)
js/quiz.js        quiz kiosk
js/app.js         bootstrap + event wiring
js/icons.js       inline SVG icon node data (lucide, ISC)
assets/fonts/     bundled woff2 fonts (Barlow Condensed, Inter, JetBrains Mono)
assets/favicon.svg
```

Educational use only; defensive framing; nothing here is operational security tooling.
