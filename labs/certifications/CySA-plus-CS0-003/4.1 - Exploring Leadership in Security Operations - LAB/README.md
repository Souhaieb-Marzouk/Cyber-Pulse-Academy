# CyberLab — SOC Modernization Sprint (static edition)

An interactive, self-contained cybersecurity practice lab for:

**CompTIA CySA+ CS0-003 · Lesson 4.1 — Exploring Leadership in Security Operations**
(automation, SOAR playbooks, continuous compliance, and leadership metrics)

This is the static port of the original Next.js lab: the same lab, objectives,
validation and scoring — with **zero build step, zero server, zero external
dependencies**. After the v3 audit pass it also ships the audit-mandated
improvements: a fully compliant quiz color contract, performance-derived focus
areas in the completion report, balanced multiple-choice options, de-clustered
checklists, and hardened dialog/focus accessibility. All data is 100% synthetic
(fictional org “Corvus Logistics”); the MITRE ATT&CK technique IDs referenced are
real and used in a purely defensive context.

## Run it

- **Easiest:** double-click `index.html` (works from `file://` in any modern browser).
- **Recommended:** serve the folder with any static file server, e.g.
  `python3 -m http.server 8000` inside this folder, then open `http://localhost:8000/`.

## Deploy to GitHub Pages

1. Create a repository on GitHub.
2. Upload the **contents of this folder** (so `index.html` sits at the repo root).
3. Settings → Pages → Deploy from branch → select the branch and `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.

The empty `.nojekyll` file prevents GitHub Pages from running Jekyll processing.

## What's inside

```
index.html          entry point (classic <script> tags, no modules)
css/styles.css      all styling — design tokens + components, plain CSS
js/data.js          ALL lab content (objectives, quiz bank, logs, glossary, answer keys)
js/icons.js         inline-SVG icon set (exact lucide path data)
js/objectives.js    the CHECK RESULTS validation engine (21 objectives)
js/state.js         state store: reducer + localStorage persistence + RESET
js/ui.js            all lab screens/components as template functions
js/app.js           bootstrap, events, timers, dialogs
assets/fonts/       Geist + Geist Mono (variable woff2, latin subset, bundled)
assets/favicon.svg  local favicon
.nojekyll           GitHub Pages marker
```

## Notes

- Progress auto-saves to `localStorage` (key `cyberlab-cysa-cs0-003-4-1-v1`); the
  header **Reset** button wipes it after confirmation.
- Two difficulty modes: **Deputy Lead (Medium, guided)** and **Acting Lead (Hard,
  cold open)** — choose on the start screen.
- No network calls at runtime: fonts, icons and scripts are all local files.
- External links in the Debrief (CompTIA, MITRE ATT&CK) open in a new tab; they are
  ordinary navigation links, not runtime dependencies.
