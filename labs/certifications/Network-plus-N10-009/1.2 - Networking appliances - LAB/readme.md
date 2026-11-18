# The Staging Bay — Networking Appliances Practice Lab (static)

A faithful **static port** of "The Staging Bay", an interactive single-page practice lab for
**CompTIA Network+ N10-009 · Objective 1.2 — networking appliances** (routers, switches, firewalls,
IDS/IPS, load balancers, proxies, NAS, SAN, wireless devices). All training content is **synthetic**
(fictional org "Meridian Components Group", RFC 5737 documentation IPs).

## Open / deploy

- **Locally:** extract this folder anywhere and open `index.html` directly in a browser — no server,
  no build, no dependencies. Classic scripts only, so `file://` works.
- **GitHub Pages:** push the folder contents to a repo, enable Pages (branch/root), open
  `https://<user>.github.io/<repo>/`. A `.nojekyll` marker is included so Pages serves everything as-is.
  All asset references are relative, so subpath hosting "just works".

## Layout

```
index.html          entry point (loads the scripts below in dependency order)
css/styles.css      full theme — vanilla CSS + custom properties (no framework)
js/data.js          ALL lab content: objectives, quiz bank, logs, glossary, field manual (window.LAB)
js/icons.js         inline SVG icon geometry (Lucide, ISC license)
js/state.js         state + reducer + localStorage persistence + pub/sub store
js/objectives.js    CHECK RESULTS validation engine (20 validators) + scoring
js/ui.js            shared UI kit: overlays, toasts, switch/select/slider/tabs/accordion, hovers
js/quiz.js          exam deck (per-question answer lock, forward-only flow)
js/app.js           bootstrap: mode gate, HUD, depot, floor, consoles, evidence wall, tracker, modal
assets/fonts/       bundled woff2 fonts (JetBrains Mono, Saira Condensed) — no font CDN
assets/favicon.svg  local favicon
.nojekyll           GitHub Pages marker
```

## Modes

- **Medium** — guided build: 11 objectives, "where to look" affordances, 3-tier hints, tolerant checking.
- **Hard** — cold site: 9 deep objectives, noisy evidence with red herrings, strict checks, 1 nudge.

Progress auto-saves in the browser (localStorage key `staging-bay-n10009-v2`, identical to the
original build); RESET wipes it after an explicit confirmation.

## Licenses & credits

- Lab content and code: teaching material, synthetic data only.
- Icons: [Lucide](https://lucide.dev) v0.525.0, ISC License — inline SVG path data copied unmodified.
- Fonts: JetBrains Mono, Saira Condensed — bundled woff2 from Google Fonts (OFL). Body text uses the system sans stack, exactly as the original renders.
