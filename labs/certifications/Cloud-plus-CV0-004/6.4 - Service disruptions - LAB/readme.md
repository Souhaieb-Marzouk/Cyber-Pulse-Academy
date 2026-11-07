# The Network Clinic — CompTIA Cloud+ CV0-004 Lesson 6.4 lab (static)

A self-contained, browser-only training lab: triage a noisy monitoring feed, diagnose
DNS / DHCP / NTP service disruptions with a simulated diagnostics cart, treat them,
verify recovery, take the board exam, and get a scored attending sign-off.
Two difficulty modes (guided Day Shift, solo Night Shift), progress persistence and
reset via localStorage. 100% client-side — no server, no build step, no external
runtime dependencies.

## Run it

- Double-click `index.html` (works from `file://`), or
- Serve the folder with any static server, or
- Push to a GitHub repository and enable GitHub Pages (Settings → Pages → branch/root).

## Structure

- `index.html` — single page: mode select, ward, charts, diagnostics cart, exam, debrief
- `css/styles.css` — design tokens (custom properties) + all component styles
- `js/data.js` — all lab content: patients, alerts, symptoms, tools + simulators, objectives, quiz bank, glossary, knowledge core, prevention controls, sequencing/timeline data
- `js/state.js` — state store, localStorage persistence, shared helpers
- `js/objectives.js` — CHECK RESULTS validation engine, vitals, hint system
- `js/quiz.js` — board exam rendering, scoring, answer lock
- `js/ui.js` — toasts, modals, all renderers, completion report with focus areas
- `js/app.js` — actions, global event wiring, bootstrap

Content, objectives, validation rules, hints, quiz answers and feedback are identical
to the audited original single-file lab (audit fixes included).
