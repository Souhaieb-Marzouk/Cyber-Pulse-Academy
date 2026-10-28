# Operations Visibility Center — CySA+ 3.3 Interactive Lab (static)

A faithful, fully self-contained static port of the **Aurelia Freight & Logistics —
Operations Visibility Center** interactive practice lab for
**CompTIA CySA+ CS0-003 · Lesson 3.3 “Maintaining Operational Visibility”**.

- Two difficulty modes: **DAY WATCH** (guided, 12 tasks) and **NIGHT WATCH** (discovery, 9 tasks).
- Coverage Grid, Sensor Bay, gated evidence feeds, investigation workbenches,
  machine-checked objectives with CHECK RESULTS, tiered hints, knowledge check,
  star scoring, completion clearance.
- Progress auto-saves in your browser (localStorage) and survives reloads;
  **Purge** wipes it back to pristine.

## Run it

No build step, no server, no dependencies.

- **GitHub Pages:** push this folder to a repo and enable Pages — done.
- **Any static host:** upload the folder as-is.
- **Locally:** double-click `index.html` (works from `file://`) or serve the
  folder with any static file server.

All references are relative, so the lab also works under a subpath such as
`https://<user>.github.io/<repo>/`.

## Layout

```text
index.html          entry point
css/styles.css      all styling (design tokens + components, no framework)
js/icons.js         inline SVG icons (lucide path data, ISC)
js/data.js          all lab content (zones, sensors, evidence corpus, glossary…)
js/state.js         state store + localStorage persistence + pub/sub
js/objectives.js    objective definitions + CHECK RESULTS validation engine
js/quiz.js          knowledge-check banks (medium + hard)
js/ui.js            view rendering (mode select → briefing → floor → tasks → quiz → debrief)
js/app.js           bootstrap, event wiring, dialogs, toasts
assets/             favicon + bundled Geist/Geist Mono webfonts
```

All organizations, hosts, accounts, IP addresses (TEST-NET ranges) and log lines
are synthetic training data. Defensive/educational framing only.

## Audit v3 notes

This build includes the third adversarial QA pass (R1–R9 contract):

- **Answer-lock parity (R2):** the Incident Timeline board (OBJ-M10/OBJ-H3) and
  the Dashboard Builder pack (OBJ-M11) now lock after their objective is
  validated, exactly like the other seven workbench desks.
- **Visible close affordance (R7):** the clearance modal and the purge dialog
  have a dedicated ≥44 px X button (ESC / click-outside / action buttons remain).
- **Touch targets (R7/B5):** sensor switches and the toast close button now have
  ≥44 px hit areas; icon buttons render at 32 px.
- **Quiz item quality (R5/B3):** H-Q3 and H-Q6 option sets rebuilt for strict
  length/structure discipline; H-Q1 explanation now rejects the
  daylight-saving distractor explicitly.
- **Jargon at first use (B2):** glossary extended to 19 terms (ACL, DLP, EDR,
  SIEM); NTP expanded at first mention; M1032 title matches official ATT&CK
  casing ("Multi-Factor Authentication").
- **Deliberate divergences from the React original** (both safe directions):
  the static purge dialog also closes on overlay click (the original blocks
  outside-click on destructive confirms), and transient log filters/tab
  selections are retained when switching tabs in the static port while the
  original resets them on tab unmount.
