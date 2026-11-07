# HARBOR-7 — Container Security Lab (static edition)

An interactive, self-contained training lab for **CompTIA Cloud+ (CV0-004), Lesson 4.3 — Container security**: safeguarding containerized applications and resources.

You are a cloud security engineer on the night shift at a fictional freight-analytics harbor. Audit what the company BUILDS (Dry Dock), what it SHIPS (Customs Gate) and what it RUNS (The Berths); triage a live runtime incident feed; then harden the whole harbor. Two selectable shifts: **Medium (Cadet, 12 guided objectives)** and **Hard (Inspector, 10 strict challenges)** — switchable at any time without losing inspected evidence.

All organizations, domains, credentials and events are fictional training data. MITRE ATT&CK technique/mitigation IDs were verified against official MITRE data.

## Run it

No build step, no server, no dependencies. Either:

- **Open directly:** unzip and double-click `index.html` (works from `file://`), or
- **Serve the folder:** `python3 -m http.server 8000` inside this folder, then open `http://localhost:8000/`, or
- **Deploy:** push to a GitHub repository and enable Pages (see below).

## Deploy to GitHub Pages (5 lines)

1. Create a new GitHub repository.
2. Upload the contents of this folder (or push the folder as the repo root).
3. Repo Settings → Pages → Deploy from branch → select branch `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the HARBOR-7 intro screen loads — done (a `.nojekyll` is already included).

## Structure

```
index.html          single-page shell
css/styles.css      design tokens + all component styles (vanilla CSS)
js/data.js          all lab content (objectives' evidence, quiz bank, glossary, debrief)
js/shuffle.js       deterministic seeded shuffles (pool orders never reveal answers)
js/objectives.js    objectives + hints + CHECK RESULTS validation engine
js/state.js         state store, actions, localStorage persistence, scoring
js/quiz.js          quiz bank access + sequential-unlock rules
js/ui.js            rendering components (template functions) + icons
js/app.js           bootstrap, event wiring, overlays, focus management
assets/             fonts (woff2, bundled) + favicon
```

Progress is saved automatically to `localStorage` (key `harbor7.lab.v1`) and restored on reload; **RESET** (with confirmation) returns the lab to pristine.
