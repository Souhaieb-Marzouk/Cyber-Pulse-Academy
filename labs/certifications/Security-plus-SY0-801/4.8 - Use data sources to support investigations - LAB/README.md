# The Evidence Room — SY0-801 4.8 Practice Lab (static)

A self-contained, build-free static port of the "Case HLX-2026-1112 — Data
Sources for Investigations" practice lab for CompTIA Security+ SY0-801,
Objective 4.8. Pure HTML + CSS + vanilla JavaScript — no framework, no build
step, no server, no external runtime dependencies. All records, hosts and
actors are synthetic training data (fictional domains, RFC-5737 IPs).

## Open it

- Locally: double-click `index.html` (works from `file://`), or
- Any static host: upload the folder as-is (GitHub Pages: repo root or
  `/docs`, no Jekyll processing needed — `.nojekyll` is included).

## Structure

- `index.html` — page skeleton, loads the scripts in dependency order
- `css/styles.css` — the evidence-room visual identity (design tokens in `:root`)
- `js/data.js` — all content: sheets, objectives, quiz banks (data only)
- `js/state.js` — state object + localStorage persistence + announcer
- `js/objectives.js` — CHECK RESULTS validation engine + SIEM query model
- `js/quiz.js` — knowledge-check engine
- `js/ui.js` — renderers (board, sheets, objective panels, bench, modals)
- `js/app.js` — bootstrap and event wiring

Progress saves in the browser (localStorage key `hlx408lab_v1`); the labeled
RESET button restores the pristine lab.
