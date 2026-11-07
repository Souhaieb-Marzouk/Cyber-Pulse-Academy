# Exercise CLOUDBURST — static lab (v4)

Interactive, self-contained cybersecurity training lab:
**CompTIA Cloud+ CV0-004 · Lesson 6.3 — Security incidents** (leaked credentials &
privilege escalation), ported 1:1 from the framework (Next.js) lab to plain
HTML/CSS/JS. No build step, no server, no external runtime dependencies.

**All data is synthetic training data.** Organizations, people, accounts, keys,
IPs (RFC 5737 ranges) and events are fictional. MITRE ATT&CK mappings are
accurate to the official pages.

## Run it

Any of these works:

- **Double-click `index.html`** — the lab also runs from `file://`.
- **Any static file server**, e.g. `python3 -m http.server` in this folder.
- **GitHub Pages** — push this folder's *contents* to a repo, enable Pages
  (branch/root), open `https://<user>.github.io/<repo>/`. `.nojekyll` is included.

## The lab

Two difficulty modes share one evidence core:

- **Responder (Medium)** — 12 guided objectives, 3-tier hints, tolerant checking.
- **Commander (Hard)** — 9 broad objectives, live mission clock that plants new
  attacker activity, red herrings, strict validation, one score-costing nudge.

Flow: mode select → briefing → ops wall (alert inbox, cloud audit trail,
identity & access console, repository evidence, hardening board) → incident
record (12/9 machine-validated objectives with CHECK RESULTS) → knowledge check
quiz → debrief → After-Action Report. Progress auto-saves to `localStorage`
(key `cloudburst-cv0004-63-v1`); RESET is armed double-click.

## Layout

```
index.html          page shell; loads scripts in dependency order
css/styles.css      design tokens + all component styles (vanilla CSS)
js/data.js          all lab content (objectives' contexts, alerts, audit events,
                    quiz bank, glossary, hardening cards, debrief) — synthetic
js/objectives.js    objective definitions + CHECK RESULTS validation engine
js/state.js         reducer, persistence, scoring + the tiny store (pub/sub)
js/icons.js         inline Lucide SVG icon nodes + ic() helper
js/ui.js            component templates (HTML string functions)
js/app.js           bootstrap, region rendering, event delegation, dialogs
assets/fonts/       Geist Sans/Mono (latin variable woff2, self-hosted)
assets/favicon.svg  favicon
.nojekyll           GitHub Pages marker (skip Jekyll processing)
```

Everything runs client-side; the only network requests are the lab's own files.
MITRE/CompTIA reference links open attack.mitre.org / comptia.org in a new tab.
