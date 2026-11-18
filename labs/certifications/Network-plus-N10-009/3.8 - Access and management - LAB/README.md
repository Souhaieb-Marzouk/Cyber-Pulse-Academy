# NOC Access Patchbay — Static Lab

A fully self-contained, build-free copy of the **CompTIA Network+ N10-009 · Lesson 3.8 —
Access & Management** interactive lab ("Cascade Freightworks // NOC Access Patchbay").

Everything runs in the browser: **no server, no build step, no external runtime
dependencies** (fonts and icons ship with the lab). It works from a static host, a
GitHub Pages **subpath**, or by double-clicking `index.html` over `file://`.

> All hosts, logs, IP addresses (RFC 1918 / RFC 5737 / TEST-NET) and credentials in
> this lab are **synthetic training data**. Nothing here connects to a real network.

## Run it

| How | Steps |
| --- | --- |
| Local file | Unzip, open `index.html` in any modern browser. |
| Any static host | Upload the folder as-is; it is pure HTML/CSS/JS. |
| GitHub Pages | Push the folder contents to a repo, enable Pages. `.nojekyll` is included, all paths are relative, so **project pages subpaths work unchanged**. |

Optional local preview: `python3 -m http.server 8000` inside the folder, then open
`http://localhost:8000/`.

## What's inside

```
index.html          entry point; loads scripts in dependency order
css/styles.css      full console theme (design tokens, self-hosted Geist fonts)
js/data.js          lab content — topology, logs, configs, docs, glossary, manual
js/quiz.js          wrap-up quiz banks (Medium: 6 concept · Hard: 7 scenario)
js/objectives.js    objective definitions + machine-checkable validators
js/state.js         state store: pub/sub regions + localStorage persistence
js/ui.js            shared console primitives (panels, LED, answer fields, hints…)
js/icons.js         exact Lucide SVG path data (inline SVG, no icon font)
js/app.js           rendering regions, delegated events, dialogs, boot
assets/fonts/       Geist Sans + Geist Mono woff2 (local, no CDN)
```

## Features (1:1 with the original React lab)

- **Two modes** — Standard Shift (Medium, 12 guided objectives) and Storm Watch
  (Hard, 9 deep challenges with noise/red herrings).
- **Six access channels** — VPN (full/split tunnel simulator), SSH terminal, web GUI,
  REST API workbench, OOB console via terminal server, and the hardening rack bench.
- **Objectives ledger** — per-objective CHECK RESULTS validation, educational feedback,
  tiered hints (Medium: 3 free tiers · Hard: 1 nudge that costs score), progress ring.
- **Evidence drawer** — LOGS / CONFIG / MATRIX / DOCS / MANUAL / GLOSSARY / NOTES tabs,
  incl. true/false-positive judging, storm-recovery ordering, detection builder,
  decision matrix, and auto-saved field notes.
- **Wrap-up quiz** with per-answer explanations; **end-of-shift report** with star
  rating (first-attempt accuracy + hint usage) and focus areas derived from your run.
- **Persistence** — progress auto-saves to `localStorage` under the key
  `cyberlab-cascade-access-mgmt-v1` (same key and shape as the original). RESET wipes
  it via the status-bar button.
- **Keyboard** — `1`–`6` patch channels (ignored while typing), `ESC` closes the
  quiz / report / reset dialogs.

## Privacy & network

The lab is 100% client-side: no API calls, no analytics, no CDN requests. Progress
lives only in your browser's `localStorage`. The two "official references" links in
the NOTES tab are normal `<a target="_blank">` links that open only when clicked.

## Implementation notes

- The original Next.js/React/Tailwind app was ported to classic scripts + native CSS.
  Data, state and rendering are separated; code is unminified and commented.
- Rendering uses small pub/sub "regions" — the static equivalent of the original's
  `useLab()` selector subscriptions — so interaction feel and visuals match 1:1.
- Icons are inline SVGs using exact Lucide path data (Lucide is MIT-licensed).
- Fonts are self-hosted Geist Sans / Geist Mono woff2 files.

## Browser support

Any current evergreen browser (Chrome/Edge/Firefox/Safari). Uses only broadly
supported APIs: `localStorage`, CSS custom properties, flexbox/grid, inline SVG.
