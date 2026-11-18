# The Program Yard — Security Awareness Lab (SY0-801 · 5.6)

A self-contained, zero-build practice lab for **CompTIA Security+ SY0-801, Lesson 5.6 —
“Promote security awareness practices”**. You play the new Security Awareness Program Lead at
Harborline Freight Co.: triage real attack evidence, sweep the yard for physical/data risks,
build the phishing campaign, plan the program, and run the year-end inspection.

Static port **v4** (includes all QA-audit fixes: rotated quiz answers, sequential locked quiz
with red/green feedback, shuffled option sets, completion focus areas, full popup close paths,
unload-safe persistence).

## Run it

- **Easiest:** open `index.html` directly in any modern browser (`file://` works).
- **GitHub Pages:** push this folder to a repo, enable Pages on the branch/root, open
  `https://<user>.github.io/<repo>/`. A `.nojekyll` marker is included.
- **Any static host:** it is one HTML page + plain CSS + classic JS. No build step, no server,
  no external runtime dependencies. (The Debrief Locker contains *citation links* to
  attack.mitre.org and comptia.org — they open only when clicked.)

## Structure

```
index.html        page shell (semantic HTML, ARIA labels)
css/styles.css    design tokens + all styles (vanilla CSS, custom properties)
js/data.js        all lab content (objectives, artifacts, quiz banks, hints, glossary…)
js/state.js       state store + localStorage persistence (key: hbf-progyard-v1, save v2)
js/objectives.js  CHECK RESULTS validation engine, tracker, unlock chain, hints, stars
js/quiz.js        sequential quiz engine (lock, color contract, resume, review)
js/ui.js          screens, docks, modals, completion report with focus areas
```

## Notes

- Difficulty modes: **Medium — guided day shift** (12 objectives) and **Hard — solo night run**
  (9 objectives, strict exact-match validation, nudges cost stars).
- Progress autosaves per browser (localStorage). **Reset** (header button) wipes it after an
  explicit confirm. On `file://`, storage is per-browser/per-path; on Pages it is per-origin.
- Keyboard operable throughout; modals close via button, ESC and click-outside.
