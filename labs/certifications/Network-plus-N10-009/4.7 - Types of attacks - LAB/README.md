# Harborview Port Watch — N10-009 Lesson 4.7 (static port v4)

An interactive, self-contained learning lab for **CompTIA Network+ N10-009,
Lesson 4.7 / Objective 4.2 — “Types of Attacks”**. You play the on-duty
operator at Harborview Cold Chain & Freight: six consoles, 12 guided missions
(Day Watch) or 9 strict challenges (Night Watch), a knowledge check, and a
change-over report.

Everything runs **client-side** — no build step, no server, no external
runtime dependencies, no API keys.

## Run it

- **Double-click `index.html`** — the lab works from a plain `file://` open.
- Or serve the folder statically (recommended for classroom use):
  `python3 -m http.server 8000` → open `http://localhost:8000/`.

## Deploy on GitHub Pages

1. Create a repository (e.g. `port-watch-lab`).
2. Upload/push the **contents** of this folder to the repository root.
3. Keep `.nojekyll` in place (it disables Jekyll processing).
4. Settings → Pages → Deploy from branch → select the branch and `/ (root)`.
5. Open `https://<user>.github.io/<repo>/` — all paths are relative, so
   subpath hosting works out of the box.

## Repo layout

```
index.html          markup shell, loads the six modules below
css/styles.css      the lab's full design system (control-room theme)
js/data.js          all content: attack families, glossary, evidence, objectives, quiz banks
js/state.js         state object + localStorage persistence (key: hccf-portwatch-v1)
js/ui.js            the six consoles, tab strip, in-world hardening controls, manual/debrief
js/objectives.js    mission ledger + CHECK RESULTS engine (validation, locks, stars)
js/quiz.js          knowledge check (color contract, answer locking, scoring)
js/app.js           bootstrap + event wiring (modes, overlays, ticker, completion report)
assets/             (not needed — icons are inline SVG, fonts are the system stack)
.nojekyll           GitHub Pages marker (empty)
```

## Notes

- Progress persists in `localStorage` under `hccf-portwatch-v1` and survives
  reloads; **Reset** (ribbon) returns the lab to pristine after confirmation.
- External links (CompTIA exam page, MITRE ATT&CK) are documentation
  references only — the lab never fetches anything.
- All incident data is synthetic and labeled as such; real-world references
  are documented public incidents, summarized conservatively.
