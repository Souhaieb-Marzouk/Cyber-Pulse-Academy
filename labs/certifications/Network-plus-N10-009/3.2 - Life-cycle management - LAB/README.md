# The Lifecycle Yard — N10-009 Lesson 3.2 training lab (static)

An interactive, fully client-side training lab for **CompTIA Network+ N10-009,
Domain 3.0, objective 3.1 — Life-cycle management** (EOL, EOS, software
management, decommissioning). You play a yard clerk at the fictional
Trailhead Freight IT depot: classify gear, plan safe software changes, route
retiring assets through the disposal gate, close the paperwork, then take the
foreman's knowledge check.

Two shipped difficulty modes:

- **Day shift · Medium** — 11 guided work orders with 3-level hints.
- **Night shift · Hard** — 9 broad challenges across a noisy yard (marketing
  flyers, red herrings, a third-party-support trap), one optional paid nudge,
  strict validation.

Everything runs in the browser: no server, no build step, no external
dependencies, no tracking. All company/vendor/device/CVE data is synthetic
training data.

## Run it

Any of these works:

1. **Double-click `index.html`** — the lab runs from a plain `file://` open.
2. Serve the folder: `python3 -m http.server 8000` then open
   <http://localhost:8000/> (from inside this folder).
3. Deploy to any static host (GitHub Pages, etc.) — see below.

Progress is saved in your browser's `localStorage` under the key
`n10_009_lab32_v1` and resumes exactly where you left off. "Reset yard"
wipes it (with a confirmation).

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload/push the **contents** of this folder (index.html, css/, js/,
   README.md, .nojekyll) to the repository root.
3. Settings → Pages → Deploy from branch → pick the branch and `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode gate renders and start a shift.

`.nojekyll` (empty marker file) is included so GitHub Pages serves the
folder as-is.

## Structure

```
index.html          page structure (3 screens + modals)
css/styles.css      the whole design system (custom properties, depot theme)
js/data.js          all lab content: devices, notices, objectives, quizzes…
js/state.js         state object, localStorage persistence, reset
js/ui.js            rendering: screens, clipboard, zones, scoring, manifest
js/objectives.js    CHECK RESULTS validation engine (20 rule functions)
js/quiz.js          knowledge check: rendering + one-shot answer flow
js/app.js           bootstrap: renderYard, event wiring, boot
```

Classic `<script>` tags in dependency order — no modules, no bundler — so the
lab also works when opened directly from disk.
