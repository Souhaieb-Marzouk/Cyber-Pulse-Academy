# Larkspur Logistics — INC-2026-0117 · Incident Response Lab

A self-contained, build-free training lab for **CompTIA Security+ SY0-801 · Lesson 4.7 — Implement incident response activities**. You take command of a live extortion incident: prepare, identify, investigate, contain, negotiate, eradicate & recover, notify, and run the post-incident review — 12 guided objectives (Medium) or 9 live-fire challenges (Hard), a sequential quiz, and a completion report with focus areas.

Static port **v4** (includes all audit fixes). 100% client-side vanilla HTML/CSS/JS — no backend, no build step, no external runtime dependencies.

## Run it

- **Easiest:** open `index.html` directly in a modern browser (works from `file://`), or
- **Any static server:** `python3 -m http.server 8080` in this folder → `http://localhost:8080/`, or
- **GitHub Pages:** push this folder's contents to a repo, enable Pages → `https://<user>.github.io/<repo>/`.

Progress saves automatically to your browser's `localStorage` (key `ir47lab.v1`); **Reset** wipes it (with confirmation).

## Structure

```
index.html              markup (mode select → war room → quiz → debrief)
css/styles.css          design tokens + components (dark war-room theme)
js/data-core.js         lifecycle phases, glossary, all evidence artifacts
js/data-objectives.js   objective banks M1–M12 / H1–H9 + validation rules, hints, feedback
js/data-quiz.js         quiz banks + debrief content
js/state.js             state store, persistence, derived selectors, sim clock
js/ui.js                strip, rail, evidence tray, ticker, drawers, glossary, debrief, knowledge core
js/objectives.js        action desk, widget renderers, CHECK RESULTS engine, hints
js/quiz.js              sequential quiz (enforced progression, answer lock, color contract)
js/app.js               completion report, event wiring, RESET, boot (loads last)
assets/favicon.svg      favicon
.nojekyll               disables GitHub Pages Jekyll processing
```

Scripts are classic `<script>` tags in dependency order (no ES modules) so the lab works over http(s) **and** from a plain double-click on `index.html`.

## Notes

- Every artifact is synthetic training data: fictional org, fictional threat actor, RFC 5737 test IPs.
- Reference links (CompTIA exam objectives, NIST SP 800-61, GDPR Art. 33) are plain hyperlinks — nothing is loaded from them at runtime.
- Difficulty modes: **Medium** (guided, hints, tolerant) and **Hard** (noisy evidence, exact answers, scored nudges).
