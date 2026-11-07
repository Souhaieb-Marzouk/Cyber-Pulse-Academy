# Ledgerline — Cloud+ CV0-004 Lesson 6.5: Misconfigurations Lab (static)

An interactive, self-contained practice lab for **CompTIA Cloud+ CV0-004 · Domain 6.5 —
"Misconfigurations: identify and fix misconfigurations in cloud setups."**

You audit a fully synthetic cloud estate (fictional provider *Stratonaut Cloud*, fictional
customer *Nimbus Logistics*): run posture scans, triage findings vs. accepted exceptions,
apply real remediations (bucket guardrails, IAM least privilege, key lifecycle, security-group
CIDRs, IMDSv2, database controls, account guardrails), and verify with a re-scan.

## Modes

- **Guided Audit (Medium)** — 12 guided objectives, tiered hints, "where to look" jump links.
- **Breach Aftermath (Hard)** — 10 broad incident-response challenges driven by a recovered
  audit event log, strict validation (exact values, exact ATT&CK IDs, exact sets), one costly nudge.

Both modes share the same estate, objective engine, quiz (Review Deck), debrief (Posture
Report), knowledge core (Doctrine), completion scoring (score + stars) and localStorage
persistence with a confirmed reset.

## Run it

No build step, no server, no dependencies.

- **Locally:** extract and double-click `index.html` (works from `file://`), or serve the
  folder with any static file server.
- **GitHub Pages:** push the folder contents to a repository, enable Pages on the branch/root,
  and open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is included.

## Structure

```
index.html        entry point (loads scripts in dependency order)
css/styles.css    design tokens (light paper / night-shift skins) + all component styles
js/icons.js       inline Lucide SVG icon data (ISC-licensed path data)
js/data.js        all lab content: resources, policies, evidence, doctrine, glossary
js/findings.js    posture scan engine (22 finding rules + exceptions + scoring)
js/objectives.js  mastery blueprint: 12 Medium + 10 Hard objectives with validators
js/quiz.js        knowledge check banks (6 Medium + 7 Hard items)
js/state.js       state store, reducer, persistence, stars/score math
js/ui.js          screen renderers (template functions)
js/app.js         bootstrap, event delegation, focus & a11y management
assets/           favicon
```

## Notes

- All data is synthetic training material; every organization, key ID, IP address and event is fictional.
- Progress autosaves to `localStorage` under the key `cv0004-l65-ledgerline-v1`; the labelled
  **Reset** button (with confirmation) restores the pristine lab.
- Keyboard operable throughout; ARIA roles/labels mirror the original lab; results are announced
  via a polite live region.
