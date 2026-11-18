# Gateway Operations Center — Lab 001 (static build)

An interactive, self-contained practice lab for **CompTIA Network+ N10-009 · Objective 2.1 —
Routing technologies**: static & dynamic routing (BGP · EIGRP · OSPF), route selection,
NAT, PAT, FHRP, VIP and subinterfaces.

You play the night watch at the fictional **Atlas Freight & Cartage Co-op** gateway operations
center. Two modes share the same simulated estate:

- **MEDIUM · Shift Sheet** — 12 guided orders, spotlights, 3-tier hints, tolerant teaching checks.
- **HARD · Case File** — 9 interlocking incidents on a noisy estate with red herrings, one
  score-costing nudge, strict exact-value validation.

Close every order, pass the comms check (quiz) and the shift debrief opens with a 1–5 star
signal rating and evidence-derived focus areas. Progress auto-saves in your browser
(`localStorage` key `goc-lab-n10-009-v1`); the header reset button wipes it after confirmation.

All telemetry is a **labeled training simulation** — fictional freight co-op, RFC 1918 +
RFC 5737 documentation addresses only. No real networks are touched; nothing leaves your
browser (the page makes **zero network requests**).

## Run it

No build, no server, no dependencies.

- **Locally:** unzip and open `index.html` in any modern browser (double-click works).
- **GitHub Pages:** push the folder contents to a repo, then
  Settings → Pages → Deploy from branch → root. (`index.html` sits at the root; an empty
  `.nojekyll` is included so Pages skips Jekyll processing. All paths are relative, so it
  also works under a project subpath like `user.github.io/repo/`.)

## Layout

```text
index.html          entry point
css/styles.css      "Signal Slate" theme (design tokens as custom properties)
js/data.js          ALL lab content: topology, route seeds, 21 objectives, quiz bank,
                    knowledge core, glossary, debrief, per-mode environment seeds
js/engine.js        simulation: IPv4 math, route selection, packet runs, FHRP election,
                    OSPF neighbor view, star scoring, focus areas
js/objectives.js    CHECK RESULTS engine — all 21 objective validators
js/state.js         state + persistence + actions (pub/sub store)
js/icons.js         inline lucide SVG path data (no icon fonts, no CDNs)
js/ui.js            rendering primitives: badges, tables, order pickers, the live Atlas SVG
js/quiz.js          comms check modal (answer lock, auto-advance, summary)
js/app.js           bootstrap, phase router, ops floor, ledger, drawers, modals
assets/favicon.svg  favicon
.nojekyll           GitHub Pages marker
```

Classic `<script>` tags in dependency order — ES2020, no modules, no minification, so the
lab also runs from `file://` after unzipping.
