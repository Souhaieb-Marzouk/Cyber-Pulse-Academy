# Commission Room 104 — N10-009 Lesson 2.4 Physical Installations Lab

A self-contained, offline teaching lab for the **CompTIA Network+ (N10-009) objective 2.4 —
"Explain important factors of physical installations"**. You commission the (fictional)
network room C-104 of Ridgeline Utilities Cooperative: rack the gear, size the power,
fix the airflow, place sensors, triage the event log and pass commissioning sign-off.

## Run it

- **Easiest:** unzip anywhere and open `index.html` in a modern browser (double-click).
  No build step, no server, no dependencies — plain HTML/CSS/JS.
- **Or serve it** (recommended for classroom use): `python3 -m http.server` in this
  folder, then open <http://localhost:8000/>.

## Deploy to GitHub Pages

1. Create a repository and push **the contents of this folder** to the default branch
   (`index.html` must sit at the repository root).
2. Repo **Settings → Pages → Source: Deploy from a branch**, pick the branch and `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`. A `.nojekyll` file is included, so no
   Jekyll processing runs. All paths are relative, so subpath hosting just works.

## What's inside

| File | Role |
| --- | --- |
| `index.html` | Page shell: splash / mode select, room cross-section (SVG), consoles host, modals |
| `css/styles.css` | Design tokens + all component styles (dark terminal theme) |
| `js/data.js` | All lab content: devices, objectives, quiz banks, logs, incidents, exam, glossary, hints |
| `js/state.js` | State container + `localStorage` persistence (`n1009-24-lab-v1`) |
| `js/domain.js` | Derived rules/math shared by renderers and validators (loads, SPOF, rack rules, air band) |
| `js/objectives.js` | CHECK RESULTS validators, hint tiers, star scoring |
| `js/quiz.js` | Knowledge check, glossary, debrief, completion modal |
| `js/app.js` | Event wiring and boot (saved-session resume) |

## Lab features

- **Two modes:** Medium (day shift — 12 objectives, tiered hints, coaching) and
  Hard (night shift — 9 objectives, strict validation, noisy logs, no hints,
  one emergency nudge costs a star).
- **Live room cross-section:** clickable equipment hotspots, sensor spots, airflow
  arrows, rack locks — all reflect state in real time.
- **Five consoles:** Briefing (vocabulary matching), Rack Works (15U elevation editor
  + cable drill), Power Works (power chain, UPS/circuit sizing, A/B feeds), Climate
  Works (airflow, setpoints, sensors, log triage, recovery sim), Sign-off Desk
  (commissioning plan, work-order audit, incident tickets, exam).
- **Scoring:** objective stars (70 %) + knowledge-check best (30 %), with an
  evidence-based focus-areas report at sign-off.
- **Persistence:** progress auto-saves; a confirmed Reset returns the room to pristine.

All data is fictional; standards figures (80 % circuit rule, PF 0.8, 18–27 °C / 40–60 % RH,
1U = 1.75 in) are used in simplified teaching form and labeled as such in the lab itself.
