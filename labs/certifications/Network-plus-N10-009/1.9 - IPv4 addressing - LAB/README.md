# The Octet Works — IPv4 Addressing Lab (static)

A faithful, fully self-contained static copy of the interactive cybersecurity
practice lab **"The Octet Works"** for **CompTIA Network+ (N10-009) · Lesson 1.9:
IPv4 addressing**. No build step, no server, no external runtime dependencies —
just static `.html` / `.css` / `.js` (plus bundled fonts and a favicon).

## What it is

You are a technician at *Meridian Industrial Co.'s* (fictional) IPv4 addressing
plant. Addresses arrive as raw 32-bit stock; your shift sorts them, machines
subnets from them, and troubleshoots the hosts that hold them. Two shifts:

- **Day Shift (Medium)** — 12 guided work orders, "where to look" pointers,
  3 hint tiers, tolerant answer checking (Understand → Apply).
- **Night Shift (Hard)** — 9 broad incidents, decoys and red herrings, exact
  values required, one optional nudge that costs a full star (Analyze → Create).

Features: six plant zones (Dock, Machining Floor, Dispatch/Loadout, Test Bench,
Training Wall, Shift Debrief), a machine-checkable CHECK RESULTS engine,
a diagnostics terminal, a 32-bit BitRail visualizer, a 6/7-item knowledge check,
an end-of-shift report with star rating, localStorage auto-save/resume and a
confirmed RESET.

All hosts, addresses and logs are **synthetic training data** (public-looking
addresses use RFC 5737 documentation ranges).

## Run it

1. Extract the folder.
2. Open `index.html` in any modern browser (works via `file://`), or
3. Serve it statically: `python3 -m http.server 8000` inside the folder →
   <http://localhost:8000>.

## Deploy to GitHub Pages

1. Create a repository and upload/push the **contents of this folder** (keep
   `index.html` at the repo root; `.nojekyll` is already included).
2. Repo → Settings → Pages → deploy from branch, root.
3. Open `https://<user>.github.io/<repo>/`.

## Folder layout

```
index.html          single page, classic <script> tags (no modules, no build)
css/styles.css      vanilla CSS with design tokens (translated from the original)
js/icons.js         inline Lucide SVG icon data (exact paths)
js/net.js           IPv4 math utilities
js/data.js          ALL lab content (tickets, presses, truth tables, quiz, glossary)
js/state.js         state store + localStorage persistence (key: octet-works-lab-v2)
js/objectives.js    21 objectives + machine-checkable validators + hints
js/ui.js            shared UI primitives, dialogs, glossary popovers
js/quiz.js          knowledge-check runner + end-of-shift report
js/zones.js         the six plant zone renderers
js/app.js           bootstrap, chrome, foreman's board, event hub
assets/fonts/       Geist + Geist Mono variable woff2 (bundled, OFL-licensed)
assets/logo.svg     favicon
.nojekyll           disables GitHub Pages Jekyll processing
```

## Licenses

- Lab content and code: teaching material for the CyberLab series.
- Geist & Geist Mono fonts: SIL Open Font License 1.1 (© Vercel) — see
  `assets/fonts/OFL.txt`.
- Icons: Lucide (ISC), embedded as inline SVG path data.
