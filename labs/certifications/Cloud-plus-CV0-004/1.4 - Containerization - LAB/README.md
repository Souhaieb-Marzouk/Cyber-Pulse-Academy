# HarborOps — CompTIA Cloud+ CV0-004 · Lesson 1.4 Containerization Lab (static)

A fully self-contained, client-side interactive training lab: dissect the VM-vs-container
architecture, build and pull images in the registry yard, run the crane deck (orchestrator)
through scale-out, self-healing, rolling updates and persistent volumes, route six workloads,
stamp the shared-responsibility split, and close the classic "works on my machine" incident —
then take the Board of Inquiry quiz.

- **Two difficulty modes**: Medium · Dockhand Onboarding (12 guided objectives, 3-tier hints) and
  Hard · Harbormaster Drill (10 strict challenges, red herrings, at most 1 nudge).
- **Everything is machine-graded** by the built-in CHECK RESULTS engine with teaching feedback.
- **Progress persists** in your browser (localStorage key `harborops-cv0-004-lab-v1`).
  RESET LAB (bottom of the Operations Manifest) wipes everything after a confirmation.
- All content is **synthetic training data**; the Port Meridian Freight Authority is fictional.
  MITRE ATT&CK references are awareness-level, defensive/educational framing only.

## Open it

No build step, no server, no dependencies.

- **Locally**: extract the folder and double-click `index.html` (works over `file://`).
- **Any static host**: upload the folder as-is. For GitHub Pages push it to a repo and enable
  Pages on the branch/root — a `.nojekyll` marker is included, and every reference is relative,
  so it also works under a subpath such as `https://<user>.github.io/<repo>/`.

## Layout

```
index.html          entry point
css/styles.css      plain CSS (design tokens + components, no framework)
js/data.js          all lab content: objectives, quiz bank, evidence, glossary
js/state.js         state + localStorage persistence + pub/sub
js/validation.js    CHECK RESULTS validation engine
js/ui.js            rendering primitives
js/zones.js         the seven interactive lab zones + quiz
js/app.js           bootstrap, shell, rail, dialogs, event wiring
js/icons.js         inline Lucide SVG path data (ISC license)
assets/             favicon + self-hosted Geist fonts (woff2)
```

Classic `<script>` tags (no ES modules) so the lab runs from `file://` as well as http(s).

## Deploy note (GitHub Pages)

1. Create a new repository on GitHub.
2. Upload/push the *contents* of this folder to the repo root.
3. Settings → Pages → Deploy from branch → select the branch and `/ (root)`.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-select screen renders and a first objective checks out.
