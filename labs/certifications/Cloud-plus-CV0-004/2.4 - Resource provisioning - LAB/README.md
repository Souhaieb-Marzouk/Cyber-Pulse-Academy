# CyberLab — CV0-004 · Lesson 2.4: Resource Provisioning (static lab)

An interactive, self-contained practice lab for **CompTIA Cloud+ CV0-004, Domain 2.0,
Objective 2.4 — "Provision and configure cloud resources effectively."** You draft, build,
verify, audit and remediate a fictional EU cloud deployment (Meridian Health Insights)
across five pipeline stages, with 12 guided objectives (Medium) or 9 review-board
challenges (Hard), a certification drill, hints, persistence and a completion report.

**100% synthetic training data.** All organizations, domains, IPs, prices and logs are
invented for practice. Defensive/educational purpose only.

## Run it

No build step, no server, no dependencies:

- **Locally:** extract and double-click `index.html` (works from `file://`), or
- **Any static host:** serve the folder as-is.

## Deploy to GitHub Pages

1. Create a repository and push this folder's contents (keep `index.html` at the root).
2. Repo **Settings → Pages** → Source: your branch, folder `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves the files as-is (no Jekyll processing).
All references are relative, so the lab also works under a subpath
(`user.github.io/repo-name/`).

## Structure

    index.html            markup (mode screen, drafting desk, stages, knowledge core, quiz)
    css/styles.css        design tokens + component styles
    js/data.js            all lab content: objectives, quiz banks, findings, glossary…
    js/state.js           state object + localStorage persistence (same keys/semantics)
    js/objectives.js      CHECK RESULTS validation engine
    js/quiz.js            certification drill (commit-and-lock, in-order gating)
    js/ui.js              rendering: builders, console/map, ledger, modals, header
    js/app.js             bootstrap, event wiring, init, automation hook

Progress auto-saves in the browser (localStorage key `cv0004-lab-2-4-v1`); **Reset lab**
returns everything to pristine after confirmation.

Static port v4 — includes all fixes from the QA audit (quiz commit-and-lock flow,
answer-color contract, drift flagging, focus areas, accessibility and touch targets).
