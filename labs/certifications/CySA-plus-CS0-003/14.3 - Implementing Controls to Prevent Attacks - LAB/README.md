# Defense Controls Audit — CySA+ Lesson 14.3 (Static Lab)

A faithful, self-contained static port of the interactive CyberLab for
**CompTIA CySA+ CS0-003 — Lesson 14.3 "Implementing Controls to Prevent Attacks."**

Map mitigations to the eight CS0-003 attack classes, score the client's live
control estate for coverage, close the worst gaps, and verify that deployed
controls actually function — in **Guided (Medium)** or **Blank-Page (Hard)** mode.

> All client data, hosts, logs and incidents are **synthetic training data**.
> Defensive/educational use only.

## Run it

No build step, no server, no dependencies. Either:

- **Open directly:** double-click `index.html` (works from `file://`), or
- **Serve statically:** `python3 -m http.server` in this folder, then open the printed URL.

## Deploy to GitHub Pages

1. Create a repository and upload/push the **contents of this folder**.
2. Repo → Settings → Pages → deploy from branch, root.
3. Open `https://<user>.github.io/<repo>/`.

(All references are relative and `.nojekyll` is included, so subpath hosting
and Jekyll processing are both handled.)

## Structure

```
index.html          shell + script tags (classic scripts, dependency order)
css/styles.css      design tokens + all component styles (vanilla CSS)
js/icons.js         inline Lucide SVG library (exact path data, no CDN)
js/data.js          ALL lab content (objectives, quiz bank, estate, glossary…) — 1:1 from the original
js/objectives.js    validation/coverage/scoring engine — 1:1 from the original
js/state.js         state store + pub/sub + localStorage persistence
js/ui.js            shared components (selects, switches, modals, toast, tooltip)
js/quiz.js          examination section (one-question-at-a-time flow)
js/app.js           section renderers + event wiring + bootstrap
```

## Persistence

Progress auto-saves to `localStorage` under the key `cysa143-lab-v1` (identical
to the original framework lab): mode, section, checklist markings, estate
changes, quiz answers, hints and results survive a reload. **Reset** (masthead)
clears storage and returns the lab to its pristine state.

## Content links

The only external references are the official MITRE ATT&CK / CompTIA pages
linked in Field Notes — they open in a new tab and are never requested at
runtime. Everything else runs 100% offline.
