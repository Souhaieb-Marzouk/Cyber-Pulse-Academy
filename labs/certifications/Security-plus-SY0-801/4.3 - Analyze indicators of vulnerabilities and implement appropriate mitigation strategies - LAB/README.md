# Fleet Defense Operations — Security+ SY0-801 Lesson 4.3 (static lab)

A self-contained, browser-only training lab: you run a full vulnerability-management
cycle (**identify → prioritize → remediate → validate**) on a simulated airline IT
estate — scanning consoles, IPAM/CSPM reconciliation, source review, triage boards,
work orders, a return-to-service gate with three validation traps, a knowledge check,
and a completion report. Two difficulty modes (Medium: guided, 12 objectives; Hard:
discovery-based, 9 deep objectives, strict validation). All data is synthetic.

## Run it

No build step, no server, no external dependencies.

- **Locally:** unzip and double-click `index.html` (works over `file://`).
- **GitHub Pages:** push the folder contents to a repository, enable Pages
  (branch/root), open `https://<user>.github.io/<repo>/`. A `.nojekyll` is included
  so Pages serves the tree as-is. All paths are relative, so subpath hosting works.

Everything (state, progress, quiz results) auto-saves in your browser via
localStorage under the key `sy0801-lab-43-v2`; the labeled **Reset** button returns
the lab to pristine. Nothing ever leaves your browser — the only outbound links are
"open in new tab" references to the official MITRE / FIRST / CompTIA pages.

## Structure

```
index.html        markup (single page: mode select → briefing → ops floor + modals)
css/styles.css    vanilla CSS, design tokens as custom properties
js/data.js        all lab content: findings, logs, quiz banks, glossary, objective texts
js/state.js       state object + localStorage persistence (save / load / reset)
js/ui.js          shared UI helpers: navigation, modals, toast, objectives rail
js/objectives.js  CHECK RESULTS engine (per-objective rules), dial, completion report
js/quiz.js        knowledge-check engine (validate → lock → next, shuffled options)
js/bays.js        ops-floor environment logic (bays 01–04, queue, ledger)
js/app.js         event wiring + boot
.nojekyll         GitHub Pages marker (skip Jekyll processing)
```

Educational simulation only — defensive framing, fictional assets, synthetic
vulnerability IDs (MER-xxxx).
