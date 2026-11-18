# CyberLab — N10-009 Lesson 4.4: Security Terminology (static v4)

A self-contained, interactive cybersecurity training lab (SOC analyst scenario)
covering **risk, vulnerability, exploit, threat and the CIA triad**
(CompTIA Network+ N10-009, Lesson 4.4). 100% client-side — no build step,
no server, no external dependencies.

## Play

- **Locally:** extract this folder anywhere and double-click `index.html`.
- **GitHub Pages:** push the folder contents to a repo, enable Pages on the
  branch/root, then open `https://<user>.github.io/<repo>/`.

## Modes

- **Medium — Guided Response:** 11 guided objectives, 3-tier hints, tolerant
  checking (170 pts).
- **Hard — Incident Surge:** 9 multi-step challenges with red herrings,
  max 1 hint (−5 pts) each (205 pts).

Progress auto-saves in your browser (localStorage). Use **Reset lab** to start
over. All hostnames, IPs, tickets, CVEs, actors and log entries are **synthetic
training data**, written from the defensive analyst's perspective.

## Structure

```
index.html          page skeleton, loads scripts in dependency order
css/styles.css      design tokens (custom properties) + all component styles
js/data.js          lab content: glossary, tickets, logs, assets, intel, DNS log
js/state.js         state, localStorage persistence, pub/sub
js/objectives.js    objective definitions + CHECK RESULTS validators
js/quiz.js          quiz bank + quiz UI
js/ui.js            rendering helpers, screens, modals
js/app.js           bootstrap + event wiring
```

Classic `<script>` tags (no modules) so the lab also works from `file://`.
