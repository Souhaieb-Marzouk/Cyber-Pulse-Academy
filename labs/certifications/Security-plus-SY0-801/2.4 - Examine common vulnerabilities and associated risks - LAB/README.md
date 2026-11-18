# Vulnerability Council — Static Port (v4)

Interactive practice lab for **CompTIA Security+ SY0-801 Objective 2.4 —
"Given a scenario, analyze common vulnerabilities and associated risks."**

You are the Risk Officer at Meridian Health Systems. Triage the findings
into the weekly Patch Council queue: classify each card by vulnerability
type and attack surface, score it with the CVSS v3.1 calculator, then
route the right ones into the council queue.

This is a **self-contained static port** of the original Next.js/React/Tailwind
lab. It runs from any dumb file host (GitHub Pages, S3, a USB stick) with
**zero build step, zero server, zero external runtime dependencies**.

---

## What's in the box

```
vulnerability-council-static-v4/
  index.html        ← shell + script load order
  css/styles.css    ← design tokens + all component styles
  js/data.js        ← evidence cards, objectives, quiz, glossary, debrief,
                      interaction data constants
  js/cvss.js        ← CVSS v3.1 calculator (official formula, roundup,
                      scope-changed impact, 0.915 env cap, vector builder/parser)
  js/state.js       ← state store + localStorage persistence + pub/sub
                      (same keys as the original: lab-2-4-mode/progress/state/quiz)
  js/objectives.js  ← CHECK RESULTS validation engine
  js/quiz.js        ← quiz modal — R2 answer lock + R3 only-selected highlighting
  js/ui.js          ← all UI rendering helpers (mode select, scenario banner,
                      evidence vault, case file, CVSS calc, priority queue,
                      objectives tracker, objective interactions, glossary,
                      debrief, completion modal) + inline SVG icons + seeded shuffle
  js/app.js         ← bootstrap, event wiring, mobile tabs, modal lifecycle
  README.md         ← this file
  .nojekyll         ← empty marker so GitHub Pages serves the folder as-is
```

No `node_modules`, no `package.json`, no bundler config. Total size well
under 1 MB.

---

## How to open

### Option A — open directly

Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
Because all scripts are classic `<script>` tags (NOT ES modules), the lab
works from `file://` too.

### Option B — serve locally

```bash
cd vulnerability-council-static-v4
python3 -m http.server 8080
# then open http://localhost:8080/
```

### Option C — deploy to GitHub Pages

1. Push the `vulnerability-council-static-v4/` folder to the root of a
   GitHub repo (or to a `docs/` subfolder if you prefer).
2. In repo Settings → Pages, set the source to the branch and folder.
3. The `.nojekyll` file at the root tells GitHub Pages to skip Jekyll
   processing and serve everything verbatim.
4. Open `https://<your-username>.github.io/<repo>/`.

No build step. No CI. No environment variables.

---

## Features

- **Two modes** — Medium (12 objectives, tiered hints) and Hard
  (9 objectives, hints cost 10 points, strict validation).
- **14 evidence cards** — synthetic findings covering unsupported systems,
  hardcoded secrets, default credentials, misconfigurations, cryptographic
  weaknesses, TOCTOU races, fail-open exception handling, LLM tool scope,
  rogue devices, shadow IT, and 2 red-herring "control verified" cards.
- **CVSS v3.1 calculator** — full official formula with the roundup function
  (integer-math trick to avoid float drift), scope-changed impact formula,
  environmental metrics with the 0.915 cap, band classifier, and vector
  string builder/parser.
- **12+9 objectives** — match, sort, classify, multi-select, sequence,
  CVSS banding, control matching, queue ranking, full triage, environmental
  CVSS with reasoning, LLM mitigation plan, signed-update reasoning, IdP
  sequence, bucket review, lifecycle table, top-5 ranking, peer review.
- **Knowledge Check** — 6-question quiz per mode with locked answers,
  per-question retry, and only-selected highlighting.
- **Debrief notes** — detection opportunities, MITRE CWE links, blue-team
  and red-team takeaways, and "what to learn next" references.
- **Completion modal** — score, stars, focus areas derived from actual
  performance, recap by pillar, and a restart confirmation dialog.
- **Responsive** — desktop 3-zone workbench (Evidence Vault left, Case File
  center, Council Queue right, Objectives Tracker bottom) collapses to a
  4-tab mobile layout at <1024px. Touch targets ≥44px throughout.
- **Persistence** — your mode, per-objective progress, case-file state,
  classifications, queue, and quiz answers all save to localStorage and
  restore on reload.

---

## Audit-fix behaviors (carried over from the original)

| Code | Behavior |
|------|----------|
| R2 | Quiz answers lock after pick (cannot change without Retry). Objective controls lock after Check (disabled `<fieldset>`) until Reset. |
| R3 | Quiz: picked-correct → green only on that option; picked-wrong → red only on that option; correct answer is NOT revealed in green on wrong pick. |
| R4 | Quiz correct-answer positions are the same as in the (fixed) original. |
| R5 | Quiz options are the same as in the (fixed) original — correct answer is never the longest. |
| R6 | OBJ-M1 (fix-availability-match) and OBJ-M2 (type-surface-sort) items are shuffled with a seeded mulberry32 PRNG — stable per session, not identity order. |
| R7 | Every modal closes via X button, ESC key, and click-outside overlay. Close affordances are ≥44px. |
| R8 | Completion modal includes a "Focus areas" section derived from actual performance (objectives with attempts>1, hints>0, or incorrect; missed quiz questions). |

---

## Conversion notes (what changed vs. the original React app)

- **Framework stripped.** Next.js / React / Tailwind → vanilla ES2020
  JavaScript with classic `<script>` tags. No JSX, no virtual DOM, no
  build step. The store is a plain object with a subscribe/notify
  mechanism; rendering is HTML-string concatenation assigned to
  `innerHTML`.
- **Fonts degraded to system stacks.** The original loaded Oswald, Inter,
  and JetBrains Mono via `next/font/google`. SC-D5 forbids font CDNs, so
  this port uses system font stacks as the primary with the original
  design intent preserved via fallbacks (`'Arial Narrow'` for Oswald's
  condensed feel, `system-ui` for Inter, `'Consolas'` for JetBrains Mono).
- **Icons inlined.** Lucide-react icons are replaced with inline SVG
  strings (paths copied from the lucide source). No icon CDN, no icon font.
- **Tailwind utilities → named CSS classes.** Every `className="…"` string
  in the original components has been replaced by a small, named semantic
  CSS class in `css/styles.css`. The dark "council workbench" palette,
  focus-visible styles, WCAG AA contrast, styled scrollbars, and 44px
  touch targets are all preserved.
- **shadcn/ui Dialog/AlertDialog/Collapsible → custom modal/collapse.**
  The modal markup is hand-built; R7 close affordances (X button, ESC,
  click-outside) are implemented in `app.js`.
- **State persistence keys unchanged.** Same `lab-2-4-mode`,
  `lab-2-4-progress`, `lab-2-4-state`, `lab-2-4-quiz` localStorage keys
  and same save/restore/RESET semantics as the original.

---

## Verification

Run the lab locally and check the golden path:

1. Serve the folder: `python3 -m http.server 8080 --directory vulnerability-council-static-v4`
2. Open `http://localhost:8080/`.
3. Confirm:
   - Zero console errors.
   - Mode select renders (Medium + Hard cards).
   - Click **Medium** → 3-zone workbench renders.
   - Evidence Vault shows 12 cards (10 with CVSS, 2 without).
   - Open an evidence card → Case File shows the body + classification chips.
   - CVSS calculator works: set AV:N / AC:L / PR:N / UI:N / S:U / C:H / I:H / A:H → **9.8 Critical**.
   - Complete one objective (e.g. OBJ-M5 checkboxes) → Check → feedback → locked.
   - Open Knowledge Check → pick a wrong answer → only red on picked, correct NOT green → locked.
   - Quiz Retry → unlocks that question.
   - Resize to ~390px wide → mobile tabs appear.
   - No nav bar, no footer, no external requests.

---

## Source

This static port was produced from the Next.js/React/Tailwind source in
`src/lib/lab-data.ts` (1134 lines), `src/lib/cvss.ts` (266 lines),
`src/lib/storage.ts` (122 lines), and the React components in
`src/components/lab/*.tsx` (~3000 lines combined). All content — every
objective title, hint, feedback message, quiz question, quiz option,
quiz explanation, glossary term, evidence card body, debrief text — is
copied verbatim. The CVSS v3.1 calculator and the validators are ported
line-for-line from the TypeScript originals.
