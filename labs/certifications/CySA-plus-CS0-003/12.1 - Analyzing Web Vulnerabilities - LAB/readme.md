# CyberLab BENCH-01 — Analyzing Web Vulnerabilities (static build)

An interactive, self-contained defensive-security training lab for
**CompTIA CySA+ CS0-003 · Lesson 12.1 — Analyzing Web Vulnerabilities**.

One bench, eight instruments, one synthetic staging target: static analysis,
dynamic scanning, fuzzing, debugging, configuration review and triage — from
"I read about this" to "I can prove it and fix it".

- **Medium — Training Shift**: 12 guided objectives, tiered hints, forgiving retries.
- **Hard — Redline Audit**: 9 broad challenges, noisy evidence, strict validation, one nudge.

Everything is **synthetic training data** (fictional org: MeridianCare). Defensive framing only.

## Run it

No build step, no server, no dependencies:

- **Option A (any static host):** deploy this folder as-is. Relative paths only, so
  GitHub Pages subpaths (`user.github.io/repo/`) work out of the box.
- **Option B (local):** open `index.html` directly in a browser (`file://`) or serve the
  folder with any static file server.

Progress autosaves to `localStorage` (key `cyberlab-121-appsec-v1`); **Reset** wipes it
after confirmation.

## Layout

```
index.html        shell + boot splash
css/styles.css    full design system (vanilla CSS, design tokens up top)
js/icons.js       inline Lucide SVG icons (path data verbatim)
js/data.js        all lab content (target, tools, alerts, config, glossary, briefing…)
js/objectives.js  objective banks + machine-checkable validators
js/quiz.js        knowledge-check banks (Medium 6 / Hard 7)
js/state.js       state store + localStorage persistence + derived selectors
js/ui.js          shared bench chrome (bezels, LEDs, badges, controls)
js/instruments.js the eight bench instruments
js/app.js         phase router, workbench, ledger, quiz, debrief, completion
assets/           favicon
```

Data is separated from logic; code is intentionally readable (public teaching repo).

## Deploy note (GitHub Pages)

1. Create a repository on GitHub.
2. Upload the *contents* of this folder to the repo root (keep `index.html` at root).
3. Settings → Pages → deploy from branch (e.g. `main` / root). A `.nojekyll` file is included.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the bench boots: mode select → briefing → bench.
