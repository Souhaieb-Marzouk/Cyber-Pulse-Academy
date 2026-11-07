# Nimbus Tower — CV0-004 Lesson 1.7 Resource Optimization Lab (static)

A faithful, self-contained static port of the **NIMBUS TOWER** interactive
practice lab for **CompTIA Cloud+ CV0-004 — Lesson 1.7: Resource optimization**
(optimizing cloud resources for performance and cost efficiency).

- **Zero build, zero server, zero external dependencies.** Plain HTML/CSS/JS
  (classic scripts, ES2020-friendly) — works from GitHub Pages, any dumb file
  host, or a double-clicked `index.html` (`file://`).
- **Two shifts (difficulty modes):** *Training shift (medium)* — 12 guided
  clearances, 3-tier hints, per-item quiz checks; *Solo night shift (hard)* —
  9 strict challenges, 3 advisor red herrings, 1 paid nudge, submit-once quiz.
- **All data is synthetic training data.** Fictional provider "NimbusGrid",
  simplified economics — labeled as such inside the lab.

## Open it

- Locally: double-click `index.html`, or
  `python3 -m http.server 8080` in this folder → http://localhost:8080
- Progress autosaves in your browser (localStorage key `cv0004-tower-v1`).
  RESET (confirmed) restores a pristine shift; per-shift progress is isolated.

## Deploy to GitHub Pages

1. Create a repository (e.g. `nimbus-tower`).
2. Upload the **contents** of this folder (or push the folder itself).
3. Repo → Settings → Pages → Deploy from branch → pick branch + `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the tower loads ("Choose your shift").

(A `.nojekyll` is included so GitHub Pages serves the folder as-is.)

## Layout

```
index.html          shell + script tags (classic scripts, dependency order)
css/styles.css      design tokens + all components (ATC night palette)
js/data.js          ALL lab content (fleet, storage, spend, findings, glossary,
                    drills, quiz banks, field notes) — no logic
js/state.js         state factory, persistence (same key/shape/migrations as
                    the original), scoring, star gates, focus areas
js/objectives.js    21 clearance definitions (checks + hints + pass/fail copy),
                    savings calculator
js/quiz.js          quiz contract helpers (reveal/lock rules, scoring)
js/ui.js            DOM helpers, inline Lucide SVG icons, atoms, a11y dialogs
js/app.js           bootstrap + renderers for the four channels + dialogs
assets/favicon.svg  local favicon
.nojekyll           GitHub Pages marker
```

## Notes

- No network requests are made at runtime: system font stacks, inline icons,
  local favicon. The CompTIA / MITRE ATT&CK T1496 links are plain outbound
  anchors, not runtime dependencies.
- Accessibility: keyboard-operable tabs (arrow keys), focus-trapped dialogs,
  `role="switch"` toggles, `aria-pressed`/`aria-expanded` states, sr-only
  radar/telemetry digests, ≥44 px touch targets, `prefers-reduced-motion` support.
- Ported 1:1 from the original framework lab (behavioral parity checklist in
  the delivery docs). Anything not replicable 1:1 is listed in the Conversion
  Notes (fonts → system stacks; favicon → local SVG).
