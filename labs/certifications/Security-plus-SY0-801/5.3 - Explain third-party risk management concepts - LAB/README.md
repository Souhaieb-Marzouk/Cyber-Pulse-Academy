# CyberLab — The Vendor Risk Review Binder (SY0-801 · 5.3) — static build

A self-contained, static web lab for **CompTIA Security+ SY0-801, Objective 5.3 —
"Summarize the elements of effective security compliance / third-party risk
management"** (guided Medium mode: 12 objectives in 5 phases; Hard mode: the
"Peregrine breach" war room with 10 evidence-driven challenges; two knowledge
checks; completion report; localStorage persistence; confirmed reset).

All training data (vendors, people, documents, figures) is **fictional** and
labeled as such inside the lab.

## Run it

- **Locally:** just open `index.html` in any modern browser (double-click works —
  no build, no server).
- **GitHub Pages:** push this folder to a repository, enable Pages
  (branch root), open `https://<user>.github.io/<repo>/`.
- Any dumb static file host works: everything is relative-path, zero runtime
  network requests, zero dependencies.

## Layout

```
index.html          markup shell (semantic HTML, ARIA, skip link)
css/styles.css      vanilla CSS, design tokens as custom properties
js/data.js          ALL lab content: texts, objectives content, evidence, quiz bank
js/state.js         state store, localStorage persistence, pub/sub, reset
js/ui.js            DOM helpers + rendering (templates as string builders)
js/objectives.js    objective engine (CHECK RESULTS) + the 22 objectives
js/quiz.js          knowledge checks + scoring + completion modal
js/app.js           bootstrap + event wiring
```

No build step, no package.json, no external fonts or CDNs (system font stacks
only). Progress is saved to `localStorage` under the key
`mvhn-cyberlab-sy0801-53-v1` and RESET clears it after confirmation.
