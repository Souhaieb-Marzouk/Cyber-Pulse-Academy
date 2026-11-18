# SOC Watch Floor — Static Lab

**CompTIA Security+ (SY0-801) — Lesson 4.4: Describe security monitoring and alerting concepts**

*Use logs, alerts, dashboards, and security tools to identify potential threats.*

## What This Is

A self-contained, interactive cybersecurity practice lab built as a single-page
static site. No build step, no server, no external dependencies — just HTML,
CSS, and vanilla JavaScript.

You play the role of a Tier-1 SOC analyst taking over the watch floor at
Northwind Credit Union. Triage 6 alerts, filter multi-source logs, read live
dashboards, inspect security tools, tune noisy detection rules, and reconstruct
a full attack chain mapped to MITRE ATT&CK.

## How to Open

### Option 1 — Direct file open
Double-click `index.html` to open it in any modern browser.

### Option 2 — Local static server
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

### Option 3 — GitHub Pages
See the deploy note below.

## Features

- **Two difficulty modes:** Foundations (Medium, 12 guided objectives) and
  Triage Under Fire (Hard, 9 multi-step challenges)
- **Four mastery pillars:** Understand, Recognize, Detect, Mitigate
- **Interactive SOC console:** log stream, alert queue, dashboards, tool dock
- **CHECK RESULTS engine** with 8 validation types (matching, categorization,
  sequencing, set selection, numeric, exact, state, threshold-tuning)
- **Tiered hint system** (Medium: nudge → direction → demonstration; Hard: 1
  optional nudge)
- **Knowledge check** with 9 questions (5 concept + 4 scenario) and explanatory
  feedback
- **Completion debrief** with star rating, personalized focus areas, blue/red
  team takeaways, and MITRE ATT&CK coverage mapping
- **localStorage persistence** — your progress saves automatically; resume
  exactly where you left off
- **Responsive** — works at 390px (mobile) through desktop widths
- **Accessible** — semantic HTML, ARIA roles, keyboard operability, WCAG AA
  contrast

## File Structure

```
soc-watch-floor-static-v4/
  index.html              — entry point
  css/styles.css          — all styling (compiled from design tokens)
  js/data.js              — all lab content (objectives, quiz, logs, alerts, etc.)
  js/state.js             — state management + localStorage persistence
  js/icons.js             — inline SVG icons (Lucide paths)
  js/objectives.js        — CHECK RESULTS validation engine + 8 renderers
  js/quiz.js              — quiz modal with R3/R4/R5 compliance
  js/debrief.js           — completion debrief with focus areas
  js/ui.js                — panel renderers (logs, alerts, dashboards, tools)
  js/app.js               — bootstrap + event wiring
  assets/                 — (empty; reserved for future assets)
  .nojekyll               — prevents GitHub Pages Jekyll processing
  README.md               — this file
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `soc-watch-floor-lab`)
2. Upload the contents of this folder to the repository root
3. Go to Settings → Pages
4. Source: Deploy from branch → `main` / `root`
5. Open `https://<your-username>.github.io/soc-watch-floor-lab/`

## MITRE ATT&CK Techniques Used

- **T1190** — Initial Access → Exploit Public-Facing Application
- **T1110** — Credential Access → Brute Force
- **T1110.003** — Credential Access → Password Spraying
- **T1071.004** — Command and Control → DNS Application Layer Protocol
- **T1567** — Exfiltration → Exfiltration Over Web Service

All data is synthetic and clearly labeled as training data. Defensive/educational
framing only.
