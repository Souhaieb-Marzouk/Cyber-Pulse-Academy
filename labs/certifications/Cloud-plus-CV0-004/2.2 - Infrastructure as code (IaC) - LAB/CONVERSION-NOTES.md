# CONVERSION NOTES — Blueprint Studio static port (v4)

**Source (frozen, untouched):** Next.js 16 App-Router app, `src/components/lab/**`
(Blueprint Studio · CompTIA Cloud+ CV0-004 · Lesson 2.2 — Infrastructure as Code).
Framework-source snapshot shipped separately as `blueprint-studio-framework-src.zip`.
**Target:** `blueprint-studio-static/` — vanilla HTML/CSS/JS, classic `<script>`
tags, no build step, no backend, no keys, relative paths only.

Read this together with `01-feature-parity-checklist.md` (what had to match) and
`03-verification-report.md` (proof that it does).

---

## 1. Architecture mapping

| Original (Next.js) | Static port | Notes |
|---|---|---|
| `data.ts` (content constants) | `js/data.js` | TypeScript transpiled (type syntax stripped only); runtime content byte-equal, comments preserved |
| `objectives.ts` (env shape + 21 objectives with validators) | `js/objectives.js` | same transpile path; `validate(e)` closures carried over verbatim |
| `store.ts` (zustand + persist, key `cv0004-l22-blueprint-studio-v2`) | `js/state.js` | hand-written port: same key, same `{"state":{…},"version":0}` envelope, same partialize field set, same action semantics (hint caps, latch-on-pass, quiz stamp-and-lock, Fisher–Yates on lab entry), same derived math (`progressFor`, `starScore`, `quizScore`) |
| `ui-bits.tsx` (shared primitives) | `js/ui.js` (`window.BP`) | HTML-string builders; all interpolation escaped |
| `sheets/*.tsx` (00/01/02/03-wrapper/04/06) | `js/sheets.js` (`window.BSheets`) | copy carried 1:1 |
| `panels/*.tsx` (5 workbench drawers) | `js/panels.js` (`window.BPanels`) | interactions via `data-act` / `data-env` delegation |
| `QuizSheet.tsx` | `js/quiz.js` (`window.BQuiz`) | same flow contract (R2/R3) |
| `CompletionModal.tsx` + RESET `AlertDialog` | `js/modal.js` (`window.BModal`) | Radix dialog semantics re-implemented (focus trap, ESC, overlay close, scroll lock) |
| `IacLab.tsx` (shell) | `js/app.js` | title strip, spine, mobile tabs, turner, LEGEND drawer, render loop, delegated events |
| Tailwind/shadcn styling | `css/styles.css` | hand-written vanilla CSS; design tokens in `:root`; same palette, spacing rhythm, breakpoints (640/768/1024), focus-visible rings, scrollbar styling, `prefers-reduced-motion` rule |
| `lucide-react` icons | `js/icons.js` | exact Lucide v0.525.0 SVG path data, rendered inline (no font, no CDN) |
| `next/font` Geist + Geist Mono | `assets/fonts/*.woff2` | same subset files extracted from the framework build, loaded via `@font-face` with matching `unicode-range`s |

Load order (classic scripts, dependency-ordered, `file://`-safe):
`icons → data → objectives → state → ui → panels → sheets → quiz → modal → app`.

## 2. State & persistence parity

- Key: `cv0004-l22-blueprint-studio-v2`; envelope `{"state":{…},"version":0}`.
- Persisted fields exactly as the original's `partialize`: `screen, mode, sheet,
  drawer, env, objectives, quiz, pipelineRun, completedAt`.
- NOT persisted (as in the original): `legendOpen`, `showCompletion`, `lastCheck`, `hydrated`.
- Rehydrate = shallow top-level merge + the original's defensive `quiz.checked`
  normalization; pristine RESET writes the same shape the original's `resetAll` writes.
- Transient UI state (selected pairing term, topology highlight, scanning flag,
  per-objective feedback, open dialogs) lives in memory only, mirroring the
  original's React `useState`.

## 3. Honest deviations (both `degraded` in the checklist)

1. **F-3 — hydration frame.** The original shows "UNROLLING DRAWING SET…" while
   zustand/persist hydrates asynchronously. The static store hydrates
   synchronously from `localStorage`, so the frame is unnecessary. `index.html`
   still ships the frame (with spinner) so first paint is never blank; it is
   replaced within the first script tick. End state after load is identical.
2. **F-51 — favicon.** The original dev server 404s `/favicon.ico`; the static
   port adds `assets/favicon.svg` (linked in `index.html`) so static hosts don't
   log a stray 404. Purely additive, no visual change to the lab.

Nothing else was degraded. There were **no server-dependent features** in the
source lab (no AI tutor, no APIs, no telemetry — the original is a fully
client-side React app), so SC-D3's "client-side equivalent or graceful removal"
path never had to be exercised.

## 4. Behaviors reproduced exactly (highlights)

- CHECK RESULTS engine: attempts increment per press, pass-on-first-attempt
  latches `firstTry`, `done` latches, REJECTED stamp until passed, teaching
  feedback on fail, hint caps (medium 3 tiers / hard 1 paid nudge).
- Quiz: sequential activation (first unstamped active, later items visible but
  dimmed), pick → STAMP ANSWER locks the question permanently (persists across
  reload), only the SELECTED option is colored after stamping (correct answer
  never revealed on a wrong pick), submit gated on all stamped.
- Scoring: `SCORE = round(firstTryPct − penalty)`, medium −2/hint, hard −5/nudge;
  stars at 90/75/60/40 thresholds; focus areas derived from the student's own
  evidence (wrong quiz items, retried/hinted objectives).
- Hard-mode extras: line-flagging with round-trip toggle, H2/H4/H6/H9 shuffled
  orderings with decoy rejection and caps, policy bench with live preview.
- Mode entry reshuffles `benefitOrder`, `toolCatOrder`, `h9CardOrder`,
  `h4StepOrder`, `h6StepOrder` (Fisher–Yates) every entry.

## 5. Known quirks inherited deliberately (reported, not fixed — SC-D1/D8)

- **Pre-stamp quiz borders.** In the original, `isCorrect = locked && picked ===
  item.correct` coerces to `false` for every un-stamped item, so unstamped quiz
  questions show the red border until they are stamped (verified live on the
  original at `localhost:3000` during this port). The port reproduces this
  1:1 (`is-wrong` class). Fixing it would have violated behavioral parity.
- **K-1…K-5** from the framework audit (`iac-lab-audit/REMAINING_KNOWN_ISSUES.md`)
  carry over unchanged (native select truncation on very narrow screens, wrapped
  log pre-blocks, dimmed reading-ahead affordance, hint-cost copy nuance).

## 6. Path & hosting notes

- All asset references are **relative** (`css/…`, `js/…`, `assets/…`), so the
  folder works at any subpath (e.g. `user.github.io/repo/blueprint-studio-static/`)
  and from `file://` (verified).
- The only absolute URLs in the bundle are the six **Sheet 06 reference links**
  (`comptia.org`, `attack.mitre.org` ×3, `hashicorp.com`, `ansible.com`) — these
  are plain `<a target="_blank" rel="noopener noreferrer">` hyperlinks inherited
  1:1 from the original's content. They are never fetched at runtime (network
  audit: 0 external requests — see doc 03).
- `.nojekyll` included so GitHub Pages serves the folder as-is.
- `README.md` ships inside the folder (per the porting spec's deliverable list);
  every other file name is lowercase kebab-case.

## 7. Port-time defect found & fixed in the port (not in the original)

- `applyEnvPath` in the first cut of `js/app.js` parsed env paths with
  `^([A-Za-z]+)[:.#](.+)$`, which cannot match object names containing digits
  (`h7:…`, `h9:…`) — those selects silently no-oped. Fixed to
  `[A-Za-z0-9]+` and covered by the hard-mode gold path (H7/H9 select answers).
  The original has no equivalent defect (it uses explicit setters per field).
