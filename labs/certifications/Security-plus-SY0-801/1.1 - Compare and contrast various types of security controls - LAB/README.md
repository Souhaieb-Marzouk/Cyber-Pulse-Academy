# Controls Bridge — Static Lab

**CompTIA Security+ SY0-801 · Lesson 1.1: Compare and contrast various types of security controls**

An interactive cybersecurity lab covering security control categories (Technical / Managerial / Operational / Physical), control functions (Preventive / Detective / Corrective / Deterrent / Compensating / Directive / Mitigating), and defense in depth across 5 layers (Perimeter → Network → Host → Application → Data).

## How to open

**Option 1 — Direct file open:** Double-click `index.html` to open it in your browser. Works immediately with no server required.

**Option 2 — Local server:** If you prefer a server, run any static file server in this folder:
```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `controls-bridge-lab`).
2. Upload the contents of this folder to the repository root (or push the folder as a subdirectory).
3. Go to **Settings → Pages** in the repository.
4. Under **Source**, select your branch (e.g., `main`) and **Root** (or the folder path if you uploaded as a subdirectory).
5. Click **Save**.
6. Wait 1-2 minutes, then open `https://<your-username>.github.io/<repo-name>/`.

The `.nojekyll` file in this folder prevents GitHub Pages from running Jekyll processing, ensuring all files are served as-is.

## What's inside

```
controls-bridge-static-v4/
  index.html              — HTML shell
  css/styles.css          — Slate + Amber theme (plain CSS, custom properties)
  js/data.js              — All lab content (controls, objectives, quiz, glossary)
  js/state.js             — State management + localStorage persistence
  js/objectives.js        — CHECK RESULTS validation engine
  js/tutor.js             — Built-in offline tutor (rule-based, no API)
  js/ui.js                — Rendering functions + inline SVG icons
  js/app.js               — Bootstrap + event wiring
  .nojekyll               — Prevents GitHub Pages Jekyll processing
  README.md               — This file
```

## Features

- **Two difficulty modes:** Medium (12 guided objectives, hints, offline tutor) and Hard (10 challenge objectives, red herrings, capstone).
- **Controls Bridge:** 5 defense-in-depth spans with 30 control plates to classify by Category × Function.
- **CHECK RESULTS engine:** 9 validation kinds (select-one, select-many, classify, sequence, bridge-state, free-text-regex, composite).
- **Quiz:** Sequential one-at-a-time with answer lock, R3-compliant coloring (only selected answer highlighted).
- **Persistence:** Auto-saves to localStorage; resume exactly where you left off; RESET wipes everything.
- **Accessibility:** Keyboard navigable, ARIA labels, 44px touch targets, WCAG AA contrast.
- **Responsive:** Desktop multi-panel bridge → mobile stacked at 390px.
- **No dependencies:** Zero frameworks, zero CDNs, zero build step, zero server.

## Technical notes

- The offline tutor in `js/tutor.js` is a **rule-based helper** that matches keywords to pre-written guidance. It maintains the same educational tone as the original AI-backed tutor (never gives direct answers) but runs entirely client-side.
- All content is **synthetic training data**. The scenario organization (Meridian Health Systems) is fictional. No real PII, no real infrastructure.
- The lab uses the **same localStorage key** (`controls-bridge-lab-v1`) as the original Next.js version, so state is shared if you use both.
