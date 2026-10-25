# The Threat Hunt Expedition — static lab

An interactive practice lab for **CompTIA CySA+ (CS0-003), Lesson 2.2 — "Exploring Threat-Hunting Concepts"**.

You are the threat hunter on the SOC team of a fictional utility (Aldervale Water & Power).
Sweep synthetic telemetry, classify contacts (known-good / known-bad / unknown), build a hunt
hypothesis, navigate by MITRE ATT&CK / Cyber Kill Chain / Diamond Model, profile threat actors,
and share sanitized intel — then take the Field Exam and read the debrief.

This is a **fully static build**: plain HTML + CSS + JavaScript. No server, no build step,
no external runtime dependencies. Everything (content, validation, scoring, progress) runs
locally in your browser.

## Run it

- **GitHub Pages / any static host:** deploy the folder as-is (`index.html` is at the root;
  all paths are relative). Enable Pages on the branch/root and open the site URL.
- **Locally:** unzip and open `index.html` directly in a modern browser (works from `file://`),
  or serve the folder with any static file server.

## Difficulty modes

- **Guided Patrol (Medium)** — 12 granular objectives, 3-tier hints, where-to-look jumps,
  7-question concept exam.
- **Deep Range (Hard)** — 9 broad multi-step challenges, noisy evidence with red herrings,
  strict validation (exact IDs and sequences, near-misses rejected), one optional Field Nudge
  per objective at a score cost, 8-question scenario exam.

## Progress

Progress auto-saves to your browser's localStorage (key `cysa22-threathunt-v1`) after every
interaction and resumes exactly where you left off. **RESET** (masthead) wipes everything and
returns the lab to its pristine state after a confirmation.

## Content notice

Every organization, actor, IP address, domain and telemetry record in this lab is **fictional
synthetic training data**. External documentation links (MITRE ATT&CK, Lockheed Martin, CompTIA)
are references only — the lab makes no network requests on its own.

## Files

```
index.html          entry point (semantic shell + script tags)
css/styles.css      design tokens + all component styles
js/icons.js         inline SVG icon set (lucide geometry)
js/data.js          all lab content: bulletins, telemetry, objectives' option sets,
                    manuals, glossary, debrief, quiz banks (training data)
js/state.js         state + localStorage persistence + star scoring
js/objectives.js    objective definitions + CHECK RESULTS validation engine
js/quiz.js          Field Exam view
js/ui.js            shared widgets (selects, seg buttons, order benches, modals…)
js/app.js           bootstrap, views and event wiring
assets/             favicon + bundled Geist fonts (latin subsets)
```
