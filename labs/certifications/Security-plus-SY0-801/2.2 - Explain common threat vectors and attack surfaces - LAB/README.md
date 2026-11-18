# Night Dispatch — Threat Vectors & Attack Surfaces (static lab)

An interactive, fully client-side practice lab for **CompTIA Security+ (SY0-801) Lesson 2.2 — Explain common threat vectors and attack surfaces**. You are the overnight dispatcher at Meridian Interchange: read synthetic evidence, stamp every consignment with its threat vector (approach line) and attack surface (destination district), set mitigation levers, sit the review board and hand over clean notes.

This is the **static port** of the lab: plain HTML + CSS + JavaScript. No build step, no server, no framework, no external requests.

## Two shift modes

- **Training shift (Medium)** — 13 objectives introduced in order, 3 free hint levels each, tolerant checking, explanations after every answer.
- **Night shift solo (Hard)** — the full 18-consignment board with decoys, 9 multi-step challenges, strict validation (near misses rejected), one paid radio call.

Both modes share the same synthetic evidence core and auto-save to your browser (`localStorage`). A clearly labeled **Reset lab** button restores the pristine board.

## How to run it

Any of these works:

1. **Just open it** — double-click `index.html` (everything runs from `file://`).
2. **Any static file server** — e.g. `python3 -m http.server` in this folder, then open the printed URL.
3. **GitHub Pages** — push this folder to a repository, enable Pages (branch/root), and open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is included; all asset references are relative, so subpath hosting works out of the box.

## Layout

```
index.html          entry point (loads the scripts in dependency order)
css/styles.css      night-rail theme: tokens + component styles
js/data.js          all lab content (briefings, taxonomy, evidence board,
                    widget definitions, objective metadata, quiz bank)
js/objectives.js    CHECK RESULTS validation engine
js/state.js         state store, reducer, persistence, scoring
js/ui.js            icons, seeded shuffles, shared components, overlays
js/quiz.js          review board (quiz) views
js/app.js           views, event wiring, render loop
assets/favicon.svg  local favicon (no CDN)
.nojekyll           keeps GitHub Pages from processing the site
```

## Notes

- All training content is synthetic (fictional operator: Meridian Valley Transit & Freight, RFC-5737-style addresses, invented hashes). Defensive, educational framing only.
- External links (CompTIA, MITRE ATT&CK) appear only on the Handover page as references; the lab itself makes zero network requests.
- Content maps to CompTIA Security+ SY0-801 objective 2.2 as published on comptia.org (V8 summary page).
