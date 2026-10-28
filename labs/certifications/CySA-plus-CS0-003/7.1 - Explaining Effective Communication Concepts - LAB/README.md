# THE VULN BULLETIN — static lab

An interactive practice lab for **CompTIA CySA+ CS0-003 · Lesson 7.1 — Explaining Effective Communication
Concepts** (vulnerability management reporting: identify → assess → communicate → review). This is the
self-contained static build of the lab: no build step, no server, no external runtime dependencies.

## What it is

You run the "Program Office Desk" of a fictional logistics company's security program. The wire (scanner
feed) files nine stories — including red herrings and stale data — and you: classify findings, route
report content to the right stakeholder desks, set remediation SLAs, configure the communication plan,
run the quarterly control review, and pitch the CFO.

- **Morning Edition (Medium)** — 12 guided assignments, tiered hints, teaching feedback.
- **Night Edition (Hard)** — 10 deep assignments, strict checks, red herrings and decoys, hints disabled
  by default (one score-costing nudge).

Both editions end with a graded quiz, a retrospective (with official MITRE ATT&CK mitigation references),
and a star-rated final edition. Progress auto-saves to `localStorage` (key `vuln-bulletin-lab-v1`) and
the masthead **Reset** restores the pristine desk.

Everything is 100% synthetic training data. CVE identifiers and CVSS base scores match public NVD
records for reference; "Meridian Logistics" and its incidents are fiction. Defensive education only.

## Run it

Any static hosting works. Two options:

1. **GitHub Pages** — push this folder to a repo, enable Pages on the branch/root. The included
   `.nojekyll` prevents Jekyll processing. Site serves at `https://<user>.github.io/<repo>/`.
2. **Locally** — double-click `index.html` (works over `file://` too), or serve the folder with any
   static file server.

## Structure

```
index.html          entry point (scripts load in dependency order, no modules)
css/styles.css      vanilla CSS, design tokens as custom properties
js/data.js          all lab content (stories, stakeholders, objectives, quiz banks, glossary)
js/icons.js         inline SVG icons (exact Lucide path data, ISC license)
js/state.js         state + localStorage persistence + pub/sub
js/objectives.js    CHECK RESULTS validation engine + scoring
js/quiz.js          quiz logic (one-question-at-a-time, ARIA radio pattern)
js/ui.js            render functions (components as template functions)
js/app.js           bootstrap, event delegation, dialogs/sheet with full close paths
assets/fonts/       Geist + Geist Mono (woff2, bundled — no font CDN)
```

No frameworks, no package.json, no build artifacts. JavaScript is ES2020, commented, data separated
from logic.

## Audit v3 (this build)

This build includes the v3 adversarial-audit fixes, applied to both the original lab and this static
port at root cause:

- **Answer rotation (R4)** — quiz correct-answer positions now rotate across all items
  (Medium `2,0,3,1,0,2`, Hard `3,0,2,0,3,1,2`); previously 6 of 7 Hard items had the correct answer
  at position B.
- **Option length discipline (R5)** — rebuilt items no longer let the correct answer stand out by
  length; all options are comparable in structure and length.
- **Candidate shuffling (R6)** — every matching/sorting/selection exercise (cycle steps, card routing,
  metric bins, report types, queue reasons, risk register, comm-plan dropdowns, milestones, escalation
  drill, participation degrees, buy-in drivers, framing lines, control update options) now shuffles its
  candidate order once per session and re-shuffles on Reset, so display order never reveals the answer
  key. Escalation decoys are no longer visually marked before selection (the teaching distinction still
  appears after a pick, in the executed sequence).
- **Focus areas in the completion report (R8)** — the final edition now includes "Focus areas — from
  this run", derived from the student's actual quiz misses and objectives that needed extra checks or
  hints (never generic filler).
- Verified unchanged: answer lock + enforced next-question flow (R2), red-only wrong / green-only
  correct highlighting (R3), popup close matrix (X / Cancel / ESC / backdrop), persistence +
  reload-resume + confirmed Reset, zero console errors, zero external network requests.
