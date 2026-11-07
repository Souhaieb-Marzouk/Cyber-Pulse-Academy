# StratusPay Evidence Room — static lab

Interactive practice lab for **CompTIA Cloud+ CV0-004 · Lesson 4.4 — Compliance standards: PCI DSS · SOC 2 · ISO/IEC 27001**.

You play a compliance analyst at the fictional StratusPay preparing for a PCI assessment on the fictional CumuloCloud platform: read synthetic evidence on the desk, complete 12 Medium (Audit Prep) or 9 Hard (Field Audit) objectives in the findings ledger, sit the seven-question oral exam, and earn the completion certificate. All organizations, people, hosts and artifacts are fictional training data.

## Run it

No build step, no server, no dependencies — plain HTML/CSS/JS.

- **Locally:** extract and double-click `index.html` (works over `file://`), or serve the folder with any static server.
- **GitHub Pages:** push the folder contents to a repository, then Settings → Pages → deploy from branch/root. The included `.nojekyll` prevents Jekyll processing. The site also works under a subpath (`https://<user>.github.io/<repo>/`).

## Files

```
index.html          page markup (head + body of the lab)
css/styles.css      full stylesheet (paper-and-ink theme, design tokens in :root)
js/data.js          all lab content: icons, glossary, manual, synthetic artifacts,
                    quiz bank, tabs, evidence index — data only, no logic
js/objectives.js    the CHECK RESULTS validation bank (12 Medium + 9 Hard
                    objectives with their per-objective validators)
js/state.js         single state object + localStorage persistence (resume/reset)
js/ui.js            rendering and interaction: widgets, check/hint engine,
                    stage/ledger rendering, completion modal
js/quiz.js          oral exam: cards, answer locking, retake, scoring
js/app.js           bootstrap, event wiring, mode selection, reset
```

Scripts are classic (non-module) `<script>` tags in dependency order so the lab works from `file://` as well as http(s). Persistence key: `cloudplus-44-lab-v1` (localStorage); **Reset lab** clears it and returns to the pristine mode-selection screen.
