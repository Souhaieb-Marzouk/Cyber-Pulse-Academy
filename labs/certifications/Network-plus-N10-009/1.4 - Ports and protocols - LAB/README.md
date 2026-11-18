# The Grand Exchange — static lab

An interactive, self-contained practice lab for **CompTIA Network+ (N10-009) Objective 1.4 —
ports, protocols, services & traffic types**, set on a simulated 1950s telephone exchange
(fictional org: *Harborline Transit Authority*, all data synthetic).

This is the **static port** of the original Next.js lab: plain HTML + CSS + JavaScript with
**zero build step, zero server, zero external dependencies**.

## Run it

- **Locally:** unzip and open `index.html` directly in any modern browser, or
- **Serve:** `python3 -m http.server` (or any static file server) in this folder, or
- **GitHub Pages:** push the folder contents to a repo and enable Pages (see below).

## Deploy to GitHub Pages

1. Create a repository (e.g. `grand-exchange`).
2. Upload/push the **contents** of this folder to the repo root.
3. Repo → Settings → Pages → Deploy from branch → `main` / root.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the shift-select screen loads (all paths are relative, subpaths work).

## What's inside

```
index.html            entry point
css/styles.css        design tokens + component styles (port of the Tailwind theme)
js/data.js            ALL lab content: 13 protocols + line taps, 20 work orders,
                      13 quiz items, manual, glossary, debrief (1:1 from the original)
js/state.js           state store, localStorage persistence, star rating
js/objectives.js      CHECK RESULTS validation engine (all validators + near-misses)
js/ui.js              icons, dialogs/drawers, the 8 exercise widgets
js/app.js             shell: mode select, work orders, docket, quiz, completion
assets/fonts/         Fraunces + IBM Plex Sans/Mono woff2 (bundled, no CDN)
```

## Features

- **Two difficulty modes** — Day Shift (11 guided work orders, 3-tier hints) and
  Night Shift (9 broad challenges, strict checks, one scored nudge).
- **Eight exercise kinds** — sort, match, sequence, recall, triage, payload inspect,
  firewall screening, hardening re-patch.
- **Supervisor's spot-check** (6 concept / 7 scenario items) and a star-rated
  commendation with per-pillar breakdown and focus areas.
- **Persistence** — progress auto-saves to `localStorage`
  (key `harborline-grand-exchange-v1`); confirmed reset returns the lab to pristine.
- **Accessible** — native controls, ARIA roles/labels, 44 px touch targets,
  keyboard-operable end to end; respects `prefers-reduced-motion`.

## Notes

- Everything runs client-side; no network requests beyond the page itself.
- MITRE ATT&CK references (T1040/T1046/T1021) are used defensively and simplified for
  teaching; official pages are linked in the Handover notes.
- Training simulation — fictional organization, synthetic logs, fictional credentials.
