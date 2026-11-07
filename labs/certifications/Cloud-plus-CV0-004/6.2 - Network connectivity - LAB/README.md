# OrbitCart NOC Bench — Cloud+ CV0-004 · Lesson 6.2 Network Connectivity Lab (static)

A self-contained, zero-build interactive practice lab: troubleshoot network connectivity
faults in a simulated cloud NOC (CompTIA Cloud+ CV0-004 · Domain 6.0 · objective 6.2).
Two difficulty modes (Medium · 12 guided objectives, Hard · 10 multi-step cases), a live
packet-path simulation, a diagnostics console, flow-log/metrics evidence, hint system,
knowledge check with scoring, completion report, and full progress persistence.

All organizations, hosts, IPs, certificates and logs are **synthetic training data** —
OrbitCart and Cumulus Cloud are fictional. Educational/defensive use only.

## Run it

No build step, no server, no dependencies — plain HTML/CSS/JS.

- **Local:** double-click `index.html` (works over `file://`), or serve the folder:
  `python3 -m http.server 8080` then open `http://localhost:8080/`.
- **GitHub Pages:** push the folder contents to a repository, then
  Settings → Pages → deploy from branch (root). A `.nojekyll` marker is included.
  The site also works under a subpath (`https://<user>.github.io/<repo>/`) — every
  reference is relative.

## Layout

```
index.html        page structure (mode select, bench, tabs, modals)
css/styles.css    all styling — design tokens as CSS custom properties
js/data.js        all lab content (objectives, quiz bank, configs, evidence, glossary)
js/state.js       state store, persistence (localStorage), DOM helpers
js/ui.js          topology map + inspector cards + inspector actions
js/engine.js      packet-path simulation + diagnostics console
js/objectives.js  CHECK RESULTS engine + tracker/learn widgets
js/quiz.js        knowledge-check rendering and scoring
js/app.js         ticket rail, tabs, completion report, glossary/reset, bootstrap
assets/           favicon
```

Progress is saved automatically under the localStorage key `cyberlab-cv0004-62-v1`
(same key as the original lab); **Reset** wipes it after confirmation.
