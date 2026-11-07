# The Engagement Desk — Cloud Models Lab (static build)

An interactive practice lab for **CompTIA Cloud+ CV0-004 · Lesson 1.1 — Cloud
models**: analyzing public, private, hybrid, multi-cloud (and community)
deployment models to support business needs, plus the IaaS/PaaS/SaaS/FaaS
service-model ladder and the shared responsibility model.

You play a new cloud-strategy analyst at a fictional consultancy: read a noisy
client casefile, tag binding constraints, place workloads, stamp decisions,
write a recommendation memo, and pass a competency review. Two difficulty
modes ship in one page (Medium: 12 guided objectives with tiered hints;
Hard: 10 strict challenges with a single score-costing nudge).

> All organizations, people and figures are **TRAINING DATA — SYNTHETIC**.

## What this is

A faithful, self-contained **static port** of the original Next.js framework
lab: zero build step, zero server, zero external runtime dependencies. Only
`.html`, `.css`, `.js`, bundled fonts and docs. All data is embedded
client-side; the lab makes **no network calls** (the only outbound link is the
optional CompTIA reference on the Debrief stage). Progress persists in
`localStorage` under the same key as the original (`cv0004-l11-engagement-desk-v1`),
and the labeled **Reset** control restores the pristine state after confirmation.

## Run it

- **Locally:** unzip and open `index.html` in any modern browser (classic
  scripts, so `file://` works), or serve the folder:
  `python3 -m http.server 8080` → `http://localhost:8080/`.
- **GitHub Pages:** push the folder contents to a repository (`.nojekyll` is
  included), then Settings → Pages → deploy from branch/root. The site works
  under a subpath (`https://<user>.github.io/<repo>/`) because every reference
  is relative.

## Structure

```
index.html            entry point + inline Lucide icon sprite (exact paths)
css/styles.css        design tokens + all component styles (light & dark)
js/data.js            ALL lab content: objectives, quiz bank, casefile docs,
                      glossary, hints, feedback (data separated from logic)
js/state.js           state store, actions, localStorage persistence (v2 schema)
js/objectives.js      CHECK RESULTS validation engine + answer keys
js/quiz.js            sequential Competency Review view logic
js/ui.js              template helpers / shared components (badges, chips, docs)
js/app.js             bootstrap, stage router, instruments, dialogs, events
assets/fonts/         bundled woff2 (Fraunces, IBM Plex Sans/Mono) — no font CDNs
.nojekyll             disables GitHub Pages Jekyll processing
```

## Accessibility & behavior notes

- All controls are real buttons with ARIA roles/labels (`radiogroup`, `tab`,
  `aria-pressed`, `aria-live` feedback), ≥44 px touch targets, full keyboard
  operation (Tab/Enter/Space/Esc; focus is preserved across re-renders; modal
  focus is trapped; Esc closes dialogs/sheets).
- Light/dark "desk lamp" toggle persists like the original.
- Star rating, hint economics, stage gating and reset semantics are identical
  to the original lab; see the conversion notes shipped with this build.
