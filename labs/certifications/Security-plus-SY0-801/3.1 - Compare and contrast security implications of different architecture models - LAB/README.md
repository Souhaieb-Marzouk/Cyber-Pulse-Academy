# The Cascadia Clearance — static lab

Interactive security-training lab for **CompTIA Security+ (SY0-801) objective 2.5 —
"Explain the security risks associated with artificial intelligence"** (AI systems,
models, prompts, privacy, and data exposure).

This is a fully static, self-contained port of the original framework lab:

- **No build step, no server, no dependencies.** Plain HTML + CSS + vanilla JS
  (classic `<script>` tags, ES2020).
- **Works on GitHub Pages** (relative paths only, `.nojekyll` included) and also
  opens directly via `file://` after extraction.
- **Both difficulty modes** (Medium: guided review · Hard: noisy intake queue with
  red herrings), the full objective engine with CHECK RESULTS validation, the
  knowledge-check quiz, the completion report, hint system, and RESET.
- **Progress persists** in `localStorage` under the key `cascadia-clearance-v1`
  (identical to the original).

All artifacts, logs and messages inside the lab are **synthetic training data**
(defensive / educational use only). Fictional organization "Northwind Logistics",
fictional assistant "Cascadia".

## Open it

- Locally: extract and double-click `index.html` (or serve the folder with any
  static file server).
- GitHub Pages: push the folder contents to a repository, enable Pages on the
  branch/root, then open `https://<user>.github.io/<repo>/`.

## Structure

```
index.html          shell (loads scripts in dependency order)
css/styles.css      vanilla-CSS port of the original Tailwind/shadcn theme
js/data.js          all lab content (objectives data, artifacts, quiz bank, glossary)
js/state.js         state store + localStorage persistence (same key as original)
js/objectives.js    CHECK RESULTS validation engine (same rules as original)
js/quiz.js          knowledge-check component
js/ui.js            render functions (mode select, primer, evidence, worksheet, debrief, modal)
js/app.js           bootstrap, header, event wiring, scoped re-rendering
assets/fonts/       Space Grotesk + IBM Plex Mono (woff2, latin subset — no font CDN)
assets/favicon.svg
```

No trackers, no external requests, no API keys.
