# 1.2 - Exploring Control Types and Method - LAB

An interactive, self-contained cybersecurity training lab for **CompTIA CySA+ CS0-003 · Lesson 1.2 — Exploring Control Types and Method** (difficulty: Medium "Field Orientation" and Hard "Red Cell Audit").

You are a security analyst at the fictional **Northgate Logistics Group**. An assessor's binder just landed on your desk: classify every safeguard on the **3×6 Control Grid** (category × type), verify which controls actually work, close the gaps, and survive a live ransomware incident — the hard mode injects red herrings, strict validation and a costly single nudge.

**Everything is synthetic training data. Defensive framing only.**

## Run it

No build step, no server, no dependencies.

- **Locally:** extract the folder and double-click `index.html` (works from `file://`), or
- **Any static host:** upload the folder contents as-is. For GitHub Pages: repo → Settings → Pages → deploy from branch root. The included `.nojekyll` prevents Jekyll processing.

## What's inside

```
index.html        entry point
css/styles.css    all styling (design tokens at the top)
js/data.js        all lab content (objectives, quiz, glossary, debrief)
js/state.js       state + localStorage persistence (key: cyberlab.control-grid.v1)
js/objectives.js  CHECK RESULTS validation engine
js/quiz.js        knowledge check
js/ui.js          shared components, dialogs, tooltips, icons (inline SVG)
js/engines.js     the eight interaction engines
js/app.js         screens, rails, event wiring, bootstrap
assets/           favicon
```

Progress auto-saves in your browser and resumes exactly; **Reset** (console header) returns the lab to pristine state.

Original concept and content: The Control Grid lab (CompTIA CySA+ CS0-003, Lesson 1.2). This static version is a faithful port of the original single-page lab.
