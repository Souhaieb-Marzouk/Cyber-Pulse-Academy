# ORBIT — Cloud+ CV0-004 Lesson 3.1: Lifecycle Management Lab (static build)

A self-contained, interactive cybersecurity practice lab for **CompTIA Cloud+ CV0-004 ·
Lesson 3.1 — Lifecycle management** (provisioning, scaling, updates, deprovisioning).
Static port of the original Next.js CyberLab: same content, same objectives, same
validation, same Medium/Hard modes, same persistence — zero build step, zero server,
zero external requests.

All scenario data (hosts, CVEs, telemetry, people) is **synthetic training data**.

## Run it

- **GitHub Pages / any static host:** upload this folder's contents to a repo,
  enable Pages, open `https://<user>.github.io/<repo>/`. All paths are relative,
  so subpath hosting works out of the box.
- **Locally:** double-click `index.html` (works from `file://`) or serve the folder
  with any static server, e.g. `python3 -m http.server 8000`.

## Structure

```
index.html          entry point
css/styles.css      design tokens + all component styles (plain CSS)
js/icons.js         inline Lucide SVG icon data (no icon fonts, no CDNs)
js/data.js          all lab content: fleet, telemetry, objectives, quiz, manual, glossary
js/objectives.js    CHECK RESULTS validation engine + scoring
js/state.js         state store, localStorage persistence, simulators
js/ui.js            component render functions (HTML strings)
js/app.js           bootstrap, event delegation, overlays, focus management
assets/fonts/       bundled Geist variable fonts (woff2, latin subset)
assets/favicon.svg  inline favicon
```

## Features

- Two difficulty modes: **Day shift (Medium)** — 12 guided objectives with 3-tier
  hints; **Night shift (Hard)** — 9 multi-step objectives with traps and a single
  scored nudge.
- Interactive stations: Fleet Deck (dossiers, drift flagging, triage board),
  Launch (lifecycle + rollout sequencers, IaC decision), Scale (auto-scaler
  console, two live simulators, trigger matching), Patch Bay (update + patch
  strategy planners, blue-green cutover), Deorbit (orphan selection, decommission
  sequencers, policy pack, cost triage), Telemetry (evidence stream, incident
  replay).
- Per-objective CHECK RESULTS validation with teaching feedback, hint tiers,
  mastery scoring with stars, 7-question cert check per mode, mission debrief,
  completion report.
- Progress auto-saves to `localStorage` (key `orbit-cv0004-lifecycle-v2`) and
  resumes exactly; RESET wipes both shifts after confirmation.

Accessibility: keyboard-operable controls, ARIA roles/live regions, visible
focus, 44 px touch targets, responsive from ~390 px to desktop.
