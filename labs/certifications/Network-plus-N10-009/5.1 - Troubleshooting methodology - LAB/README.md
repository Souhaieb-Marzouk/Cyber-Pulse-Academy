# Fault Isolation Line — Static Lab (N10-009 · 5.1)

A faithful, self-contained **static port** of the "Fault Isolation Line" interactive lab for
**CompTIA Network+ N10-009, Objective 5.1 — the seven-step network troubleshooting methodology**
(identify → theory → test → plan → implement → verify → document).

One synthetic incident (ticket `MERID-0417` at fictional Northwind Logistics) is walked through
eight stations: Dispatch, Intake, Theory, Test Bench, Plan Board, Change Window, Verification Deck
and KB Desk — in **Medium** (12 guided objectives, 3-tier hints) or **Hard** (10 broad objectives,
red herrings, strict validation) mode, followed by a knowledge-check quiz, a debrief and a
star-rated completion report. All progress persists in `localStorage` under the same key as the
original (`n1009-51-faultline-v1`); a confirmed **Reset** returns everything to pristine.

All content is **synthetic training data** (fictional org, hosts, and tickets).

## Run it

- **Local:** extract the folder and double-click `index.html` (works via `file://`), or
- **Serve:** `python3 -m http.server` in this folder → open `http://localhost:8000/`, or
- **Deploy:** push to GitHub Pages (see below) — no build step, no server, no dependencies.

## Structure

```text
index.html          entry point (root — GitHub Pages ready)
css/styles.css      vanilla CSS (design tokens + component styles)
js/data.js          all lab content (objectives, evidence, quiz, glossary) — data only
js/state.js         state store, reducer, localStorage persistence
js/objectives.js    CHECK RESULTS validation engine + stars + focus areas
js/ui.js            UI primitives (task cards, panels, terminal, rail, drawer)
js/stations.js      the eight station workbenches
js/quiz.js          quiz runner (lock-answer flow, locked-only scoring)
js/flows.js         mode select, debrief board, completion modal
js/app.js           bootstrap, event delegation, wiring
assets/             favicon + bundled woff2 fonts (Space Grotesk, IBM Plex)
.nojekyll           disables GitHub Pages Jekyll processing
```

Classic `<script>` tags (no ES modules) so the lab also works when opened directly from disk.
All references are relative, so it runs under any subpath (e.g. `user.github.io/<repo>/`).

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload / push the **contents** of this folder (keep `index.html` at the repo root).
3. Repo → Settings → Pages → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the lab loads, pick a shift, and check progress survives a reload.

## Notes

- No network requests are made at runtime (fonts and favicon are bundled locally).
- The only external link is the optional, user-initiated CompTIA reference in the Debrief.
- Verified feature parity with the original framework lab — see the Conversion Notes.
