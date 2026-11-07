# Identity Control Plane — Cloud+ CV0-004 Lesson 4.2 IAM Lab (static)

An interactive, fully client-side practice lab for **CompTIA Cloud+ CV0-004 · Lesson 4.2 —
Identity and Access Management** (exam objective 4.3: *given a scenario, implement identity
and access management*).

You play the new IAM administrator of the fictional **Larkspur Retail Group** on the fictional
**StratusForge Cloud**: repair over-permissive policies in a live JSON policy engine, enforce
MFA and conditional access, offboard a departed employee, rotate a leaked service key, triage
a synthetic audit trail, and contain a live incident — then take a knowledge check.

**Everything is synthetic training data.** No organization, identity, IP or event is real, and
nothing leaves your browser: the lab is a single static folder with **zero build step, zero
server, zero external requests**.

## Run it

- **Locally:** double-click `index.html` (or serve the folder with any static file server).
- **GitHub Pages:** push the folder contents to a repository and enable Pages — all paths are
  relative, so it works under `https://<user>.github.io/<repo>/` without configuration.

## Features

- Two difficulty modes sharing one console: **Medium** (12 guided objectives, where-to-look
  links, 3-tier hints) and **Hard** (9 multi-step objectives, noisy audit trail with red
  herrings, strict validation).
- A real policy evaluation engine (explicit Deny → Allow → implicit deny, glob resources,
  CIDR + MFA conditions) with a request simulator and AAA journey trace.
- Per-objective **CHECK RESULTS** validation with educational feedback, hint tiers, and
  first-attempt/hint-based star scoring.
- Knowledge check (quiz) with per-item explanations, completion report with evidence-derived
  focus areas, glossary drawer, mission briefing and concept deck.
- Auto-save to `localStorage` (key `sf-iam-lab-v1` — compatible with the original framework
  lab's saves) and a confirmed, labeled RESET.

## Structure

```
index.html          entry point
css/styles.css      design tokens + all styling (vanilla CSS)
js/icons.js         inline Lucide SVG icon map (no icon font, no CDN)
js/data.js          ALL lab content: identities, policies, audit events, objectives, quiz
js/engine.js        policy engine, login simulation, objective validators, scoring
js/store.js         state + pub/sub + localStorage persistence
js/ui.js            render functions (templates) for every view
js/app.js           bootstrap, event delegation, keyboard & focus management
assets/favicon.svg  local favicon
.nojekyll           disables GitHub Pages Jekyll processing
```

## Accessibility & privacy

- Keyboard operable (tabs with arrow keys, ESC closes every popup, focus is trapped in
  dialogs and restored after re-renders), ARIA roles/labels, 44 px minimum touch targets,
  WCAG-AA contrast, reduced-motion support.
- No cookies, no analytics, no network calls. Progress never leaves the browser.

## Credits

MITRE ATT&CK technique/mitigation IDs (T1078, T1098, T1528, M1032, M1036, M1027, M1018,
M1017, M1047) reference the official catalogue at attack.mitre.org. Icons: Lucide (ISC).
