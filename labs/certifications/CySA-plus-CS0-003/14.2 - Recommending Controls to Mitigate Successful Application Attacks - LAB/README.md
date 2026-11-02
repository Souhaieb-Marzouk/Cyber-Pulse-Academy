# GATEHOUSE — Application Attack Controls Lab

An interactive, self-contained practice lab for **CompTIA CySA+ CS0-003 · Lesson 14.2 —
Recommending Controls to Mitigate Successful Application Attacks** (exam objectives 2.4 + 3.2).

You investigate a (fictional, synthetic) successful application attack against the
"VeriScript Rx" patient portal — an upload that became a web shell — then recommend and
configure the controls that defeat it: input validation and sanitization, access control,
encryption — and prove your configuration against live simulated traffic.

## Features

- **Two difficulty modes** — Medium (guided, 12 objectives, three-tier hints) and
  Hard (red-team re-test, 10 challenges, strict validation, red herrings).
- **Checkpoints**: Briefing → Doctrine → Evidence locker → Gates (control board +
  request-pipeline simulator) → Triage → Knowledge check → Debrief.
- **Objectives tracker** with machine-checked `CHECK RESULTS` rules, hints and
  per-pillar recap (Understand / Recognize / Detect / Mitigate).
- **Knowledge check** (6 medium / 8 hard items) with explanations and answer lock.
- **Star rating** based on first-try accuracy and hint discipline.
- **Progress auto-saves** to your browser's localStorage and resumes on reload;
  RESET (header) wipes it after confirmation.

## Run it

No build step, no server, no dependencies. Any of these works:

1. **Double-click `index.html`** — the lab runs from `file://` too.
2. **Any static file server**, e.g. `python3 -m http.server` in this folder.
3. **GitHub Pages** — push this folder's contents to a repo, enable Pages on the
   branch/root, and open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is
   included so Pages serves everything as-is.

## Layout

```
index.html          entry point (loads scripts in dependency order)
css/styles.css      all styling (design tokens + components, no framework)
js/data.js          all lab content: logs, memos, cards, quiz bank, glossary
js/engine.js        control gates, request verdicts, upload-rule matching
js/objectives.js    objective definitions + CHECK RESULTS validation engine
js/icons.js         inline Lucide SVG path data
js/state.js         state store + localStorage persistence + actions
js/ui.js            DOM builder, icons, shared components
js/app.js           shell, checkpoint stages, rail, dialogs
assets/favicon.svg  favicon
.nojekyll           GitHub Pages marker (skip Jekyll processing)
```

All lab data is synthetic and clearly labeled as training data (fictional
organization, no real PII). Defensive framing only.
