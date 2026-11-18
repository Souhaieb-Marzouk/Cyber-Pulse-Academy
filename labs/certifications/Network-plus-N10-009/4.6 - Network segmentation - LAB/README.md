# The Flat Net Incident — Network Segmentation Lab (static build)

A self-contained, zero-dependency copy of the interactive training lab for
CompTIA Network+ N10-009 Objective 4.6: network segmentation of IoT, IIoT,
SCADA/ICS, OT, guest and BYOD estates. All scenario data is synthetic.

This is the audited v2 lab (all 13 audit findings fixed), repackaged as plain
HTML/CSS/JS. No build step, no framework, no server, no external runtime
dependencies — it runs from any static file host, a subpath, or a double-click
on `index.html` (file://).

## Run it

- Local preview: `python3 -m http.server 8000` in this folder, then open
  `http://localhost:8000/` — or just open `index.html` directly.
- GitHub Pages: push this folder's contents to a repository root (or `/docs`),
  enable Pages, and open `https://<user>.github.io/<repo>/`.

## Structure

| File | Role |
| --- | --- |
| `index.html` | Shell: head, skip link, app root, toast, modal veil |
| `css/styles.css` | All styling — design tokens as custom properties, dark console theme |
| `js/data.js` | Lab content: zones, devices, configs, alerts, evidence, quiz bank, glossary, timeline |
| `js/objectives.js` | Objective definitions and CHECK RESULTS rules (Medium/Hard) |
| `js/state.js` | State, localStorage persistence (`flatnet-lab-v2`), scoring |
| `js/ui.js` | Toast/modal/glossary, inline SVG icons, shell render, mode select, dispatch |
| `js/stations.js` | Stations 1–5 renderers |
| `js/check.js` | CHECK RESULTS engine |
| `js/quiz.js` | Station 6 knowledge check |
| `js/completion.js` | Station 7 handover + completion report |
| `js/app.js` | Boot: load state, render, bind global listeners |

Classic `<script>` tags in dependency order — no modules, so `file://` works.

## Notes

- Progress persists in `localStorage` under `flatnet-lab-v2`; RESET returns the
  lab to pristine after confirmation.
- The only outbound links are MITRE ATT&CK / D3FEND reference anchors inside
  the content; the lab itself makes zero network requests.
- Provenance: extracted verbatim from the single-file lab v2
  (`download/flat-net-segmentation-lab.html`), which remains untouched.
