# Change Authority Bureau — CompTIA Security+ SY0-801 Lab (Static)

An interactive practice lab for **CompTIA Security+ (SY0-801) Lesson 1.2: Demonstrate the impact of change management processes on security**.

This is a **fully static, self-contained** lab — no build step, no server, no external dependencies. It runs from any dumb file host (including GitHub Pages) by simply opening `index.html`.

## What's inside

- **Two difficulty modes**: Medium (12 guided objectives + 7 concept-check questions) and Hard (9 discovery challenges + 8 scenario-based questions)
- **Five interactive stations**: Triage Board, Workflow (Process Sequencer + Rollback Builder), Forensics (Drift Inspector + Audit Trail), Compliance (Documentation Vault + Impact Worksheet + Justification Composer), Decision (Failure Matcher + Emergency Decision Panel)
- **All audit fixes included (v4)**: R3 answer coloring, R4 correct-answer position rotation, R5 option length equalization, R6 pairing shuffle, R8 performance-derived focus areas in the completion report
- **Persistence**: progress auto-saves to localStorage; reload resumes exactly where you left off; Reset restores the pristine state

## How to open

### Option 1: Direct file open
Double-click `index.html` — it opens in your browser via `file://`. All features work.

### Option 2: Local static server
```bash
cd change-authority-bureau-static-v4
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `change-authority-bureau-lab`)
2. Upload the **contents** of this folder to the repository root (or push the folder as a subdirectory)
3. Go to **Settings → Pages**
4. Set **Source** to your main branch and **/root** (or the folder if you used a subdirectory)
5. Your lab will be live at `https://<your-username>.github.io/<repo-name>/`

All paths are relative, so it works under any subpath.

## File structure

```
change-authority-bureau-static-v4/
  index.html              — HTML shell (loads scripts in order)
  css/styles.css          — all styling (bureau aesthetic, responsive, accessible)
  js/data.js              — all lab content (objectives, quiz, RFCs, glossary, etc.)
  js/state.js             — state management + localStorage persistence
  js/ui.js                — rendering functions (template strings → HTML)
  js/app.js               — bootstrap, event delegation, rendering orchestration
  .nojekyll               — prevents GitHub Pages Jekyll processing
  README.md               — this file
```

## Technical notes

- **No framework, no build**: vanilla JavaScript (ES2020+), plain CSS, semantic HTML. Scripts are classic `<script>` tags (not ES modules), so the lab works via `file://` too.
- **Icons**: inline SVG (Lucide-style paths copied directly into `data.js`). No icon fonts or CDNs.
- **Fonts**: system font stack only. No web fonts to download.
- **Accessibility**: semantic HTML, ARIA roles, keyboard operability (ESC closes modals, tab navigation works), visible focus styles, WCAG AA contrast.
- **Responsive**: works from ~390px (mobile, stacked) to desktop (multi-panel). Touch targets ≥ 44px.

## Content license

All lab content (scenario, RFCs, quiz questions, objectives) is **synthetic and fictional**, created for educational training. Organizations, persons, tickets, IPs, and incidents are invented. The lab teaches defensive cybersecurity concepts only — no offensive tooling or weaponizable content.
