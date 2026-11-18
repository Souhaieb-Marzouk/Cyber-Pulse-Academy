# SIGNALPATH — Network Monitoring Lab (static)

**CompTIA Network+ N10-009 · Objective 3.2 (courseware Lesson 3.5): network monitoring technologies.**
A self-contained, 100% client-side interactive training lab: SNMP, flow data, packet capture,
baseline metrics, log aggregation, API integration and port mirroring — taught on a simulated
NOB shift at the fictional *Meridian Freight Systems*. All evidence is synthetic training data
(external IPs use RFC 5737 documentation ranges).

This is the static port (v4) of the Next.js original: same content, same objectives, same
validation, same persistence — plain HTML/CSS/JS with **zero build step and zero server**.

## Modes

- **MEDIUM — guided shift**: 12 guided objectives, where-to-look locator, 3 tiered hints each, tolerant checking.
- **HARD — cold start**: 9 broad multi-step challenges, salted evidence (red herrings), strict exact-value checking, max 1 hint.

Both modes share the same simulated network and evidence deck. A knowledge quiz and a
star-rated completion report close each run.

## Run it

Any of these works:

1. **Double-click `index.html`** (file://) — everything is relative-path and dependency-free.
2. **Any static server**: `python3 -m http.server` in this folder, then open `http://localhost:8000/`.
3. **GitHub Pages**: push the folder contents to a repo, enable Pages on the branch/root
   (`.nojekyll` is included), and open `https://<user>.github.io/<repo>/`.

## Structure

```
index.html          entry page (loads scripts in dependency order)
css/styles.css      vanilla CSS design tokens + component styles (Tailwind/shadcn translation)
js/icons.js         inline SVG icon set (extracted 1:1 from lucide-react)
js/data.js          simulated evidence: devices, flows, packets, logs, endpoints, alerts
js/content.js       teaching content: knowledge cards, glossary, quiz banks, debrief
js/state.js         state store + reducer + localStorage persistence (debounced save)
js/objectives.js    12 Medium + 9 Hard objectives with CHECK RESULTS validators
js/ui.js            DOM builder, icons, selects, switches, modal machinery
js/quiz.js          quiz bay (CHECK → lock → NEXT → finish → review)
js/app.js           all lab components, rendering pipeline, event wiring
assets/fonts/       bundled woff2 fonts (Space Grotesk, Inter, IBM Plex Mono)
.nojekyll           disables GitHub Pages Jekyll processing
```

No frameworks, no package.json, no build artifacts, no network calls. Progress saves to
`localStorage` under the key `signalpath-meridian-n10-009-l32-v1`; **RESET** in the top
strip wipes it (with confirmation).
