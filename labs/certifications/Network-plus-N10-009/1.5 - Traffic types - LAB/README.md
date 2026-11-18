# The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static lab)

A self-contained, dependency-free training lab for **CompTIA Network+ N10-009** (official course
Lesson 1.5 / exam objective 1.4 — traffic types: unicast, multicast, anycast, broadcast).
You play a night-shift dispatcher at a fictional packet bureau: classify traffic on a simulated
LAN, bind broadcasts to their scope, control them with switches and routers, and read NOC counters
to separate storms from baseline. 100% simulated, 100% client-side, no build step.

## Run it

- **Locally:** unzip and double-click `index.html` (works from `file://`), or serve the folder:
  `python3 -m http.server 8000` then open `http://localhost:8000/`.
- **GitHub Pages:** push the folder contents to a repo, enable Pages (branch/root), open
  `https://<user>.github.io/<repo>/`. A `.nojekyll` marker is included so Pages serves files as-is.

## What's inside

```text
index.html      markup skeleton + script wiring
css/styles.css  design tokens (day/night themes) + components
js/data.js      all lab content: topology, frames, quiz bank, objectives, glossary
js/state.js     state store + localStorage persistence + difficulty-mode selection
js/ui.js        shared DOM helpers, station rail, boards, glossary
js/sim.js       dispatch simulation engine, composer, ledger, switchboard, binder
js/objectives.js work-order validation engine, hints, meters, completion certificate
js/quiz.js      exam-hall quiz (submit gate, marking, answer lock)
js/app.js       event wiring, popups, keyboard shortcuts, boot
js/selftest.js  diagnostics harness (?selftest=1)
```

No frameworks, no package manager, no network calls. All progress is saved in your browser's
`localStorage` (key `cyberlab.n10009.trafficTypes.v1`); **RESET** on the masthead wipes it after
confirmation.

## Controls

- Click the station doors (or keys `1`–`8`) to move around; `o` toggles the work-orders drawer;
  `Esc` closes popups; the **shift plate** switches Day (Medium) / Night (Hard) — separate progress.
- DISPATCH sends the selected frame type through the simulated floor; CHECK RESULTS validates each
  work order against the simulation state; hints are free-form (Medium: 3 tiers, Hard: 1 nudge).

*Educational simulation — not affiliated with CompTIA.*
