# IR Command Deck — CySA+ CS0-003 · Lesson 8.2 (static lab)

A self-contained, dependency-free port of the interactive incident response
training lab for **CompTIA CySA+ CS0-003, Lesson 8.2 — Performing Incident
Response Activities**. One synthetic incident (Meridian Freight Systems), six
IR lifecycle phases, two difficulty watches (Medium: 12 guided objectives with
phase gates · Hard: 9 free-roam challenges with noise + red herrings), a
knowledge check, and a starred completion report.

**All data is 100% synthetic training data**: the organization, staff,
accounts and logs are fictional; IP addresses use RFC 5737 documentation
ranges. MITRE ATT&CK technique/mitigation IDs were verified against
attack.mitre.org.

## Run it

No build step, no server, no dependencies.

- **GitHub Pages:** push this folder to a repo, enable Pages on the branch
  root, then open `https://<user>.github.io/<repo>/`.
- **Any static file host:** upload the folder as-is (keep the structure).
- **Locally:** double-click `index.html` (works from `file://`) or serve the
  folder with any static server.

## Structure

```
index.html        entry point (classic scripts, no bundler)
css/styles.css    all styling (design tokens + components, no framework)
js/data.js        ALL lab content: evidence, objectives, quiz banks, debrief…
js/state.js       state store + localStorage persistence (resume / reset)
js/objectives.js  CHECK RESULTS validation engine, phase gates, star scoring
js/quiz.js        knowledge-check helpers
js/icons.js       inline SVG icon set (exact Lucide path data, ISC)
js/ui.js          component library (DOM builders + idempotent updaters)
js/app.js         bootstrap, view orchestration, modals
assets/fonts/     bundled Geist + Geist Mono (variable, latin subset)
.nojekyll         disables GitHub Pages Jekyll processing
```

## Behavior notes

- Progress auto-saves to `localStorage` under the key
  `cyberlab-cysa-82-ir-v1` (resume on reload; RESET wipes both watches).
- Works under a subpath (relative paths only) and from `file://`.
- Accessibility: keyboard-operable controls, ARIA roles/labels/live regions,
  amber focus-visible rings, ≥44px touch targets on mobile.
- External links (NIST, CompTIA, MITRE, CISA) open in new tabs; the lab makes
  zero network requests of its own.
