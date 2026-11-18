# Copper Kettle Signal Bench — Network+ N10-009 · 5.4 Performance Issues Lab (static)

A self-contained, build-free port of the CKCR Signal Bench training lab: troubleshoot
congestion, latency, loss and RF interference on a simulated ISP/coffee-company network
across four instrument bays, in Training-shift (guided) and Incident-shift (hard) modes,
then sit the operator exam and get an end-of-shift report with focus areas.

Everything runs client-side. No build step, no server, no external runtime dependencies,
no API keys. All fixes from the v4 audit pass are included.

## Open it

- **Locally:** double-click `index.html` (works from `file://`), or
  `python3 -m http.server` in this folder and open `http://localhost:8000/`.
- **GitHub Pages:** push this folder's contents to a repo, enable Pages, open
  `https://<user>.github.io/<repo>/`. `.nojekyll` is included; all paths are relative,
  so subpath hosting works out of the box.

## Layout

```
index.html          markup only
css/styles.css      full stylesheet (design tokens as custom properties)
js/data.js          all lab content: instruments, banks, objectives, exam banks
js/state.js         state + localStorage persistence + identity
js/objectives.js    objective registry + CHECK RESULTS validation engine
js/quiz.js          operator exam (render, color contract, scoring, retake)
js/ui.js            bench panels, SVG instruments, objective widget builders
js/app.js           objective cards, check flow, progress, modals, bootstrap
```

Classic `<script>` tags in dependency order (no ES modules) so `file://` works.
Progress persists per browser via `localStorage` key `ckcr_signalbench_v1`;
Master Reset returns the lab to pristine.
