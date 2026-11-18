# Design Review Board — Security+ SY0-801 · Objective 3.2 Lab (static)

A fully self-contained, zero-build static port of the *Design Review Board* practice lab for
CompTIA Security+ SY0-801 Objective 3.2 ("secure system design, access controls, segmentation,
connectivity"). You play a security architect re-working the as-built network drawing of the
fictional **Northwind Freight & Terminal Co.** after incident IR-2411.

> **All organizations, hosts, accounts and addresses are FICTIONAL TRAINING DATA**
> (RFC 5737 / RFC 1918 addressing only). Nothing describes a real company or network.

## What's inside

| File | Purpose |
|------|---------|
| `index.html` | Single-page shell, loads all scripts in dependency order |
| `css/fonts.css` | Self-hosted Geist / Geist Mono `@font-face` rules (no font CDN) |
| `css/styles.css` | Vanilla CSS design system (vellum drafting-sheet theme) |
| `js/data.js` | All lab content 1:1 — zones, assets, links, evidence, glossary, objectives + validation rules, quiz bank |
| `js/state.js` | State store + localStorage persistence (same key and semantics as the original) |
| `js/objectives.js` | Scoring / stars / focus-area engine |
| `js/quiz.js` | Board exam logic (check → lock → advance contract) |
| `js/ui.js` | Shared primitives + mode-select / briefing / title block |
| `js/views.js` | Schematic SVG, detail sheets, control register, tracker, binder, debrief, dialogs |
| `js/app.js` | Bootstrap, render loop, delegated events, focus management |
| `assets/` | Favicon + bundled woff2 fonts |
| `.nojekyll` | Disables GitHub Pages Jekyll processing |

## How to run

No build step and no server are required:

- **Just open it:** extract and double-click `index.html` (works from `file://`), or
- **Serve it:** `python3 -m http.server` inside this folder, then open `http://localhost:8000/`.

Both difficulty modes (Revision A · Medium guided, Revision B · Hard audit), objective checking,
hints, the board exam, persistence and the RESET flow are identical to the original framework lab.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload the **contents** of this folder (or push the folder itself) to the branch you serve from.
3. Settings → Pages → enable Pages on that branch, root (`/`).
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-select screen renders and one objective checks correctly.

`.nojekyll` is already included, all asset paths are relative (subpath-safe), and every filename is
lowercase kebab-case — the folder is Pages-ready as-is.

## Credits & licenses

- Fonts: [Geist](https://vercel.com/font) and Geist Mono, © Vercel, SIL Open Font License 1.1 —
  bundled as woff2, unchanged.
- Lab content: synthetic training material for CompTIA Security+ (SY0-801) exam objectives.
- MITRE ATT&CK IDs referenced: M1030, M1036, M1037, M1026, M1041, M1042, T1021.002, T1071.
