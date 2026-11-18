# Over the Air — Wireless Commissioning Lab (static edition)

A faithful, self-contained static port of the **Over the Air** interactive lab for
**CompTIA Network+ (N10-009) objective 2.3 — "Given a scenario, install and configure
wireless networks"** (channels, frequency options, SSID, network types, encryption,
guest networks, authentication, antennas, access points), with a MITRE ATT&CK
defensive-education frame (T1557.004 Evil Twin, DET0379, M1031/M1017, D3-NTA).

All people, MAC addresses, vendors, hostnames and networks are **synthetic training data**.

## Run it

No build step, no server, no dependencies.

- **GitHub Pages:** push this folder to a repo, enable Pages → `https://<user>.github.io/<repo>/`
- **Any static host / subpath:** works — every reference is relative
- **Locally:** just open `index.html` in a browser (works from `file://` too)

## Modes

- **Guided Install (Medium)** — 12 granular objectives, free 3-tier hints, 7-question concept check.
- **Commissioning Trial (Hard)** — 9 broad challenges with red herrings, one scored nudge, 7-scenario exam, isolation test rig and Response Desk.

Both modes share the same bench: RF plan (floor plan + AP fleet), config rack (SSID
drawers, RADIUS, WPS), air analyzer (beacon ledger, tickets, survey log), inspection
checklist, commissioning exam, and as-built notes. Progress auto-saves to
`localStorage` (key `northwind-wifi-commissioning-lab-v1`) and RESET restores the
pristine state.

## Layout

```
index.html          entry point
css/styles.css      design system (drafting-paper theme, vanilla CSS custom properties)
js/icons.js         inline Lucide SVG icons (exact paths, ISC license)
js/data.js          all lab content: environment seed, glossary, knowledge core, quiz bank
js/objectives.js    CHECK RESULTS validation engine (12 Medium + 9 Hard objectives)
js/state.js         state store + localStorage persistence
js/ui.js            shared UI primitives (answer widgets, stamps, tooltips)
js/views.js         view renderers (sheets, bench bays, modals)
js/quiz.js          commissioning exam sheet
js/app.js           bootstrap, event wiring, dialogs
assets/fonts/       Geist + Geist Mono (woff2, bundled)
assets/favicon.svg  local favicon
```

## Licenses & attribution

- Lab content: synthetic training material for CompTIA Network+ N10-009 objective 2.3.
- Icons: [Lucide](https://lucide.dev) v0.525.0, ISC license.
- Fonts: [Geist](https://vercel.com/font) by Vercel, SIL Open Font License 1.1.
- MITRE ATT&CK references link to the official attack.mitre.org pages.
