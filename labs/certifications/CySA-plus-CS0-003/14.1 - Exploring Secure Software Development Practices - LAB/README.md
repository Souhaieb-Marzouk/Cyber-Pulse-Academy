# RELEASE TRACK — Secure SDLC Lab (static port)

A faithful, self-contained static copy of the **RELEASE TRACK** practice lab:
**CompTIA CySA+ CS0-003 · Lesson 14.1 — Exploring Secure Software Development
Practices** (Domain 4, objectives 4.1–4.3).

One release (VitalsPortal v2.5), one track, eight SDLC stations. Walk the track,
examine synthetic evidence, pass objective checks and the knowledge check, then
sign off the release. Ships with two difficulty modes:

- **MEDIUM — GUIDED DISPATCH**: 12 granular objectives, 3-tier hints, tolerant validation.
- **HARD — LIVE RELEASE**: 9 deep multi-step challenges, noisy evidence with red
  herrings, strict validation, one optional nudge per objective (costs score).

Everything runs **100% client-side**: no build step, no server, no network
calls, no external fonts/CDNs. All organizations, tickets, CVEs and artifacts
are **synthetic training data** (defensive education only).

## Run it

Any of these works:

1. **Direct open** — unzip and double-click `index.html` (works from `file://`).
2. **Any static server** — e.g. `python3 -m http.server 8080` inside this folder,
   then open `http://localhost:8080/`.
3. **GitHub Pages** — push the folder contents to a repo (root or `/docs`),
   enable Pages, open `https://<user>.github.io/<repo>/`. A `.nojekyll` marker
   is included so GitHub serves the files as-is.

Progress (mode, objectives, hints, quiz, station, tab) auto-saves to
`localStorage` under `cyberlab.release-track.v2` and resumes on reload. **RESET**
(confirmed) returns the lab to its pristine state.

## File map

```
index.html          entry point (root, relative paths only)
css/styles.css      design tokens + all component styles (vanilla CSS)
js/data.js          lab content corpus — 1:1 export of the framework lab's data
js/state.js         state + localStorage persistence
js/objectives.js    CHECK RESULTS validation engine + star rating + shuffles
js/ui.js            icons (inline SVG), task widgets, objective card, track board
js/quiz.js          knowledge-check engine (locked answers, review chips)
js/app.js           bootstrap, HUD/tabs, panels, dialogs, event wiring
assets/favicon.svg  favicon
.nojekyll           GitHub Pages marker
```

Scripts are classic `<script>` tags loaded in dependency order (no ES modules)
so the lab also works when opened directly from disk.
