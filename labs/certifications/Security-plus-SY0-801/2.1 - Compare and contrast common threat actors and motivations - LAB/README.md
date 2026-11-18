# The Quiet Ward — Threat Actors & Motivations Lab (static)

A single-page, self-contained security-awareness lab for **CompTIA Security+ SY0-801
Lesson 2.1 — "Compare and contrast common threat actors and motivations."**

You play the night-shift attribution analyst at a fictional hospital: six incidents land in
one quarter, six suspect classes are booked on the wall. Pin evidence, profile the actors,
detect the next attack early, harden the hospital, then defend your calls in a
cross-examination quiz.

> All evidence, memos, logs and chats are **synthetic training data**. No real organization
> or person appears in this lab. MITRE ATT&CK group and mitigation IDs are cited and link
> to the official attack.mitre.org pages.

## Run it

No build step, no server, no dependencies:

- **Locally:** double-click `index.html` (works from `file://`), or
- **Any static host:** serve this folder as-is.

```bash
# optional local server
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a repository and upload/push the contents of this folder to the default branch.
2. Repo → Settings → Pages → Deploy from branch → root (`/`).
3. Open `https://<user>.github.io/<repo>/`.
(`.nojekyll` is included so Pages serves the folder as-is, without Jekyll processing.)

## Structure

```
index.html        page skeleton (mode gate, case board, ledger, modals)
css/styles.css    design tokens + all styles (dark incident-room theme)
js/data.js        ALL lab content: suspects, evidence, objectives, hints, quiz bank, glossary
js/state.js       state store, localStorage persistence, seeded shuffle
js/objectives.js  CHECK RESULTS validation engine
js/quiz.js        cross-examination engine (answer lock + color contract)
js/ui.js          rendering: ledger, acts, widgets, evidence bench, brief, debrief, completion
js/app.js         bootstrap, global wiring, mode selection, RESET
```

Classic `<script>` tags in dependency order — no modules, no bundler, nothing minified.

## Features

- Two difficulty shifts: **Day (guided)** — 12 objectives, three-tier hints; **Night (unsupervised)** —
  9 challenges, red-herring evidence, one nudge per objective, strict validation.
- 10 interactive exercise types (matching, poster pairing, attribute dials, evidence pinning,
  verdict stamps, ranking, control mapping, sequencing, multi-select, written justification).
- Tolerant CHECK RESULTS engine: per-field feedback, synonym tolerance, retry-friendly, star
  rating with attempt accounting.
- Cross-examination quiz with per-answer lock, only-selected highlighting, topic tags.
- Completion report with pillar recap and performance-derived focus areas.
- Seeded shuffling so display order never reveals answers; reseeds on RESET.
- Persistence: progress saves to `localStorage` (`cyberlab-quiet-ward-v1`) and resumes exactly;
  RESET returns the board to pristine.
- Accessible: ARIA roles/labels, `aria-live` announcements, skip link, full keyboard paths,
  44 px touch targets, reduced-motion and print styles.

## Disclaimer

Training material only. The red-team notes describe defensive awareness concepts; nothing
here is operational attack instruction.
