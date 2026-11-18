# Meridian Atelier — Static Lab

A self-contained, server-less interactive compliance & privacy lab covering
**CompTIA Security+ (SY0-801) — Lesson 5.4**: Support security compliance and
privacy considerations.

This static port is built with vanilla HTML, CSS, and JavaScript — no build
step, no server, no external runtime dependencies. It behaves identically to
the original Next.js/React lab and can be served from any dumb file host
(including GitHub Pages).

## Quick start

### Option 1 — open directly
Double-click `index.html` (or open it with `file://`). The lab runs entirely
in the browser.

### Option 2 — serve locally
```bash
cd meridian-atelier-static-v4
python3 -m http.server 8080
# then open http://localhost:8080/
```

### Option 3 — deploy to GitHub Pages
1. Create a new public GitHub repository.
2. Upload the **contents** of this folder to the repo root (so `index.html`
   sits at the repo root, not inside a subfolder).
3. In the repo settings → Pages, set the source to your main branch and root.
4. Open `https://<your-username>.github.io/<repo-name>/`.

The `.nojekyll` file in this folder prevents GitHub Pages from running Jekyll
processing on the assets, which is important for files starting with
underscores or containing dots.

## What's inside

```
meridian-atelier-static-v4/
  index.html              # Entry HTML — loads scripts in dependency order
  css/styles.css          # All styling — design tokens + component classes
  js/data.js              # All lab content (regulations, frameworks, quiz, etc.)
  js/objectives.js        # 12 Medium + 9 Hard objective definitions
  js/state.js             # localStorage-backed state + subscribe/notify
  js/ui.js                # HTML helpers + inline SVG icons (no icon CDN)
  js/workstations.js      # All workstation renderers + quiz + debrief + modal
  js/app.js               # Bootstrap, event delegation, CHECK RESULTS validators
  assets/favicon.svg      # Inline SVG favicon
  .nojekyll               # Empty marker — prevents GitHub Pages Jekyll processing
  README.md               # This file
```

## What the lab covers

You play the Junior GRC Analyst at the fictional Meridian Health Finance — a
fintech-health hybrid company — and design the full compliance program:

- **Regulatory mapping**: HIPAA, GLBA, SOX, GDPR, PCI DSS, FISMA, FedRAMP
- **Framework selection**: NIST CSF, ISO 27001, CIS Controls, COBIT
- **Data classification**: 12 sample items across Public/Internal/Confidential/Restricted
- **GDPR data-subject-rights**: erasure with legal hold, portability sequencing
- **Personnel lifecycle**: NDA, onboarding, offboarding, AUP, token rotation
- **Vendor risk**: SOC 2 / ISO 27001 review, sub-processor disclosure, SCCs + TIA
- **Audit evidence triage**: real-evidence vs gap vs red-herring
- **HIPAA penalty tiers**: Civil Tier 1–4, Criminal Tier A–C
- **Retention + destruction**: HIPAA 6-year, PCI crypto-shred, GDPR purpose-limit
- **Data inventory**: controller / processor / sharing / classification

The lab ships **two difficulty modes**:

- **Apprentice (Medium)** — 12 guided objectives, tiered hints, tolerant
  validation. Best for first exposure.
- **Architect (Hard)** — 9 broad multi-step challenges, free-roam studio,
  strict validation, two red herrings in the audit vault.

All progress (mode, objective states, hint usage, quiz answers) is persisted
to `localStorage` under the key `meridian-atelier-state-v1` and resumes
exactly on reload. A RESET button (in the objectives rail or the exit block)
clears everything after a confirmation dialog.

## Accessibility & responsive design

- All interactive elements have visible focus styles (brass outline).
- Touch targets ≥ 44 px on primary buttons (Check, Hint, quiz options).
- ARIA roles and labels on dialog, alertdialog, progressbar, status regions.
- ESC closes any modal or dialog.
- Responsive at 390 px (stacked, mobile drawer for objectives) → 1280 px
  (sticky right rail with progress + stars).
- WCAG AA contrast on the parchment/forest/sienna/brass palette.

## Honesty note

This static port is **behaviorally identical** to the original React/Next.js
lab. The audit fixes from the second audit pass (R3 quiz coloring, R4+R5 quiz
rewrites, R6 M2 dropdown shuffle, R7 ESC modal close, R8 completion focus
areas, QA-6 44 px touch targets, QA-7 to QA-10 R5 polish) are all included.

The only intentional difference is the heading font: the original uses
Crimson Text via Google Fonts; this static port prefers Crimson Text when
available locally but otherwise falls back to the system serif stack
(Georgia / Times New Roman / etc.). The visual identity is preserved —
serif headings + sans body. To bundle the actual Crimson Text woff2, drop
the files into `assets/fonts/` and uncomment the `@font-face` declarations
in `css/styles.css`.
