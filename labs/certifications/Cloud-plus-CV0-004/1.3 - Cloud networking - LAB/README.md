# CyberLab · Cloud+ CV0-004 · Lesson 1.3 — Cloud Networking Deployment Board (static)

A self-contained, single-page interactive lab for CompTIA Cloud+ (CV0-004) Lesson 1.3
(Cloud networking): students configure a hybrid-cloud cutover for the fictional
"Meridian Analytics" project — CIDR planning, subnets, gateways, site-to-site VPN,
VPC peering, DNS, security groups / NACLs, flow-log analysis and fault triage — then
pass a Review Board quiz and earn a completion seal.

Pure HTML + CSS + vanilla JavaScript. **No build step, no server, no external
runtime dependencies, no secrets.** All lab data (objectives, quiz banks, logs,
glossary, alert board) lives in `js/data.js`; logic is split into small readable
modules. Two difficulty modes (Medium · Guided Build / Hard · Break-Fix), progress
persists in `localStorage` per browser, RESET re-inks the sheet to pristine state.

## Run it

- **Locally:** extract and double-click `index.html` (works from `file://`), or
  `python3 -m http.server` in this folder and open `http://localhost:8000/`.
- **GitHub Pages:** push the folder contents to a repo (`.nojekyll` is included),
  enable Pages on the branch/root, open `https://<user>.github.io/<repo>/`.

## Layout

```
index.html          page shell (title block, board SVG, rail, tray, overlays)
css/styles.css      all styling (drafting-board theme, custom properties, responsive)
js/data.js          lab content: objectives, quiz banks, logs, alerts, glossary
js/state.js         state store, persistence, toasts, overlay/mode helpers
js/objectives.js    CHECK RESULTS validation engine + hints + task rail
js/quiz.js          Review Board quiz, scoring, focus areas, completion seal
js/ui.js            traffic simulation, schematic, inspector, drawer, popups
js/app.js           bootstrap + event wiring
```

Training data is synthetic; networking semantics are a simplified single-provider
model labeled as such in the lab. Curriculum references: CompTIA Cloud+ CV0-004,
Domain 1.0 (primary), 4.0 and 6.0 (reinforced).
