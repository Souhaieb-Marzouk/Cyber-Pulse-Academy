# Cloud+ CV0-004 · Lesson 4.5 — Security Controls Lab (static version)

A faithful, self-contained **static** copy of the "Control Cutaway" interactive
lab for **CompTIA Cloud+ CV0-004, Domain 4.0, objective 4.5 — "Given a scenario,
apply security controls in the cloud."** You play the cloud security engineer at
the fictional **Northwind Cargo Systems** (freight-booking SaaS, go-live in nine
days): triage a CSPM audit, deploy and configure controls across five decks of a
cutaway (Edge → Network → Compute → Data → Identity & Visibility), and prove the
estate holds by flying synthetic adversary replays.

All data is synthetic training data. The framing is defensive.

## What's inside

```
index.html          ← open this
css/styles.css      ← design system (petrol-charcoal blueprint palette)
js/data.js          ← all lab content (controls, findings, SIEM events, replays, glossary)
js/state.js         ← state + localStorage persistence + pub/sub + seeded shuffle
js/objectives.js    ← 12 Medium + 9 Hard objectives and their CHECK RESULTS validators
js/quiz.js          ← certification probe banks (6 Medium / 7 Hard items)
js/engine.js        ← replay engine, posture score, star rating, focus areas
js/widgets.js       ← ledger widget renderers (sorters, triage, sequencer, …)
js/ui.js            ← section/component rendering
js/app.js           ← bootstrap, event wiring, toasts, dialogs
assets/fonts/       ← bundled woff2 fonts (Space Grotesk, IBM Plex Mono, Geist — OFL)
assets/favicon.svg
.nojekyll           ← keeps GitHub Pages off Jekyll processing
```

No build step, no server, no external requests, no dependencies — plain HTML +
CSS + JavaScript (classic script tags, ES2020 features only).

## Run it

- **Locally:** double-click `index.html` (works from `file://`) or serve the
  folder with any static server.
- **GitHub Pages:** push the folder contents to a repository, enable Pages on
  the branch/root, open `https://<user>.github.io/<repo>/`. All paths are
  relative, so subpath hosting works out of the box.

## How to play

1. Pick **Guided Retrofit** (Medium: 12 guided objectives, 3-tier hints) or
   **Field Test** (Hard: 9 broad challenges, noisy evidence, red herrings,
   strict validation, one score-costing nudge).
2. Work the five decks: open control cards, configure and deploy, fix the
   security-group rule, triage the SIEM feed.
3. Verify in the **Replay Bay** — each replay is computed from the live estate
   state (blocked / detected / passed).
4. Check objectives in the **Shield Ledger**; every check teaches.
5. Take the certification probe; reach the go-live gate for your star rating.
6. Progress auto-saves to `localStorage` (key `cv0004-l45-cutaway-v1`);
   **Reset** (top bar, confirmed) returns the lab to pristine state.

This static lab is behaviorally identical to the original framework version; the few documented
deviations (bundled font subsets, native form controls, CSS-translated animations) do not change
any content, rule or interaction.
