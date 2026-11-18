# GATEHOUSE — N10-009 4.1 Logical Security Lab (static port, v4)

A fully self-contained, zero-build port of the GATEHOUSE interactive security lab
(CompTIA Network+ N10-009 · Objective 4.1 — Logical security). Vanilla HTML/CSS/JS,
no framework, no server, no keys, no network calls. All evidence is simulated
training data for the fictional Meridian Regional Medical Center.

## Run it

Open `index.html` in any modern browser — that's the whole setup. Double-clicking
the file works (tested via `file://`), and so does any static file server.

## Deploy to GitHub Pages (5 steps)

1. Unzip `gatehouse-static-v4.zip` — you get one folder with this file in it.
2. Push the folder's **contents** to a GitHub repository (keep `index.html` at the
   repo root), or upload them via "Add file → Upload files".
3. In the repo: **Settings → Pages → Source: "Deploy from a branch"**, branch
   `main`, folder `/ (root)`, then **Save**.
4. The site goes live at `https://<user>.github.io/<repo>/` — every path is
   relative and `.nojekyll` is included, so subpath hosting works as-is.
5. Local preview: just open `index.html` directly (no server, no build step).

## What's inside

```
index.html          page shell + script load order (classic <script>, no modules)
css/styles.css      design tokens + full stylesheet (ported from Tailwind theme)
js/shuffle.js       deterministic FNV-1a + mulberry32 display shuffles
js/icons.js         Lucide v0.525.0 SVG path data (inline-rendered, ISC)
js/content.js       Knowledge Core, glossary, quiz banks, debrief content
js/data.js          stations, widget data + ANSWER KEYS (synthetic training data)
js/evidence.js      evidence console files (all synthetic)
js/objectives.js    objective catalog + pure validation engine + stats
js/state.js         store + localStorage persistence + pub/sub (same key & shape
                    as the framework lab: gatehouse-n10009-41-v1)
js/ui.js            shared widgets + accessible select/dialog/sheet/tabs primitives
js/stations.js      the ten station workspaces
js/app.js           mode select, shell, circuit rail, tracker, ledger, dialogs
assets/fonts/       Inter / Space Grotesk / JetBrains Mono (latin woff2, bundled)
.nojekyll           disables GitHub Pages Jekyll processing
```

## Features

- Two difficulty modes: **Day Shift (Medium)** — 12 guided objectives with 3-tier
  hints; **Night Shift (Hard)** — 9 objectives, all stations open, one paid nudge.
- 10 hands-on stations covering all 14 sub-topics of N10-009 4.1: encryption in
  transit/at rest, PKI, IAM, MFA, SSO, RADIUS, LDAP, SAML, TACACS+, time-based
  authentication, authorization, least privilege, RBAC, geofencing.
- CHECK RESULTS engine with per-objective feedback, attempts, first-try tracking.
- AAA ledger strip: a live accounting demo (AUTHN/AUTHZ/ACCT) of your actions.
- Final quiz per mode, debrief, knowledge core, glossary, completion grade with
  evidence-derived focus areas.
- Progress persists in `localStorage`; RESET (with confirmation) restores the
  pristine lab. Keyboard-operable, screen-reader labelled, responsive to 390px,
  `prefers-reduced-motion` respected.

## Provenance & license notes

- Ported 1:1 from the framework lab (Next.js + Tailwind + shadcn/ui + Radix +
  Framer Motion); conversion decisions are documented in the Conversion Notes.
- Lucide icons: ISC license (https://lucide.dev). Font subsets are bundled
  locally (no CDN). MITRE/CompTIA links point to the official public sites.
