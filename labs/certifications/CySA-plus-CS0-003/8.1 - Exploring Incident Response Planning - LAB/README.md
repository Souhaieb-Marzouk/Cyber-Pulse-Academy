# CyberLab — Atlas IR Program Binder (static)

Interactive practice lab for **CompTIA CySA+ CS0-003 · Lesson 8.1 — Exploring Incident Response
Planning**. Build the fictional Atlas Freight & Logistics IR Program Binder, earn the verification
stamp on every section, pass the knowledge check, and collect CISO sign-off — in two difficulty
tracks (Field Drill / Live Audit).

This is a **fully static** port of the original Next.js lab: plain HTML + CSS + JavaScript, no
build step, no server, no external runtime dependencies. All lab data is synthetic training data
for a fictional organization; defensive/educational purpose only.

## Open / deploy

- **Locally:** unzip and open `index.html` in any modern browser (works over `file://`), or serve
  the folder with any static file server.
- **GitHub Pages:** push the folder contents to a repository, then enable Pages
  (Settings → Pages → deploy from branch, root). All asset paths are relative, so the site works
  under `https://<user>.github.io/<repo>/` subpaths.

## Files

```text
index.html        entry point (meta, favicon, script tags in dependency order)
css/styles.css    design tokens + all component styles (vanilla CSS, custom properties)
js/data.js        all lab content (objectives, quiz bank, artifacts, glossary, MITRE map)
js/icons.js       inline-SVG icon registry (Lucide geometry, extracted verbatim)
js/state.js       state store + localStorage persistence + pub/sub
js/objectives.js  CHECK RESULTS validation engine + scoring (readiness, stars)
js/ui.js          shared widgets (stamp, sequencer, assign rows, dialogs…)
js/sections.js    the ten binder sections
js/quiz.js        knowledge check annex
js/app.js         bootstrap, mode selection, binder shell, clipboard, dialogs
```

## Behavior notes

- Progress persists in `localStorage` under the key `cyberlab-irp-cs003-8-1` (same as the
  original). **Reset** (header) wipes everything after a confirmation dialog.
- The lab runs 100% client-side. The only outbound links are the official references
  (MITRE ATT&CK / D3FEND, NIST, CompTIA) in the Notes annex and sign-off modal.
