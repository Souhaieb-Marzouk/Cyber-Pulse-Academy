# 3.1 - Reviewing System and Network Architecture Concepts - LAB

A fully static, dependency-free copy of the "Drafting Room" network security
architecture training lab (CompTIA CySA+ CS0-003, Objective 1.1 — "Explain the
importance of system and network architecture concepts in security operations").

Everything runs client-side: no build step, no server, no external requests,
no secrets. All training data is synthetic (fictional org "Meridian Logistics").

## Run it

Any of these works:

- **Double-click `index.html`** — the lab also runs from `file://` after extraction.
- **Any static file server**, e.g. `python3 -m http.server 8000` in this folder,
  then open `http://localhost:8000/`.
- **GitHub Pages** — push this folder to a repo, enable Pages on the branch/root.
  `.nojekyll` is included so GitHub serves the files as-is.

## Structure

```
index.html          entry point (classic <script> tags, dependency order)
css/styles.css      all styling (design tokens as CSS custom properties)
js/icons.js         inline SVG icon set (exact lucide path data)
js/data.js          ALL lab content: zones, log types, telemetry, artifacts,
                    defense stack, NAC devices, glossary, quiz banks, 21 objectives
js/state.js         state factory + localStorage persistence (same key/semantics
                    as the original framework lab)
js/objectives.js    CHECK RESULTS validation engine (21 machine-checked rules)
                    + mastery scoring (0.6 × first-attempt + 0.4 × quiz − hint penalty)
js/store.js         reactive store: actions, announcements, toasts, pulse targeting
js/ui.js            accessible widgets: listbox selects, popovers, tabs, switches,
                    modals, toasts
js/sheets.js        the six lab sheets (brief, blueprint, hosts, defense, quiz, notes)
js/rail.js          survey checklist rail + sign-off completion modal
js/app.js           bootstrap: mode gate → lab shell, title block, reset dialog
assets/favicon.svg
```

## Features

- Two modes sharing one data core: **Guided Survey** (12 objectives, tiered
  hints) and **Red-Team Audit** (9 hard challenges, strict validation,
  sabotaged telemetry rack).
- Machine-checked objectives with CHECK RESULTS, per-objective feedback,
  hint tiers and "where to look" pulse targeting.
- 7-item knowledge check per mode (first answer locks, explanations shown).
- Mastery score + 1–5 star sign-off, pillar recap and objective ledger.
- Progress auto-saves to this browser's localStorage; confirmed RESET returns
  the lab to its pristine mode-selection screen.

## Deploying to GitHub Pages

1. Create a repository.
2. Upload/push the **contents** of this folder (with `index.html` at the root).
3. Settings → Pages → deploy from branch (root).
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode gate renders and pick a mode.
