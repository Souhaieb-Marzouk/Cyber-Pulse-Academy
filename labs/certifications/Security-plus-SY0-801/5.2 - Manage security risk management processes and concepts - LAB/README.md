# The Risk Tower — Harborline Risk Management Lab (static)

An interactive, self-contained learning lab for **CompTIA Security+ SY0-801 Objective 5.2 —
"Explain the impact of risk management processes on the security of the organization."**
You play the risk manager of Harborline Freight: file risks, score them on a 5×5 harbor chart,
choose treatments, run reviews and brief the board — then pass the certification drill.

- **Two difficulty watches:** Medium — Watch Officer (tolerant, teaching feedback, 3-tier hints)
  and Hard — Harbor Master (strict, costly nudges, live intake channel).
- **12 Medium / 9 Hard objectives** across the four 5.2 pillars, a 6- / 7-item certification
  drill, completion report with star rating and personal focus areas.
- **100% client-side.** No build step, no server, no external requests, no tracking.
  Progress persists in `localStorage` (`harborline-risk-tower-v1`); RESET returns the lab
  to pristine.

## Run it

- Easiest: double-click `index.html` (works over `file://`).
- Or serve the folder with any static server, e.g. `python3 -m http.server` →
  open `http://localhost:8000/`.

## Deploy to GitHub Pages

1. Create a repository (e.g. `risk-tower-lab`).
2. Upload/push the CONTENTS of this folder to the repo root.
3. Settings → Pages → Deploy from branch → pick the branch and `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-selection screen renders; done — everything runs in the browser.

## Structure

```
index.html      markup (semantic, inline SVG icons, no external assets)
css/styles.css  all styling; design tokens as :root custom properties
js/data.js      lab content: artifacts, register rows, quiz banks, objective content
js/state.js     state store + localStorage persistence + shared accessors
js/ui.js        renderers for every panel
js/objectives.js the CHECK RESULTS engine (validation + feedback + hints)
js/quiz.js      certification drill (per-question lock flow)
js/app.js       event wiring + bootstrap + built-in self-test harness
```

The engine is modern vanilla JavaScript loaded as classic scripts in dependency order
(no modules, no bundler), so the lab also runs from `file://` after extraction.
`window.__selfTest(mode)` in `js/app.js` is a dev harness that replays the full golden
path in the console; it is not part of the learning path.
