# Change Management Dispatch Desk (N10-009) — static lab

A self-contained, build-free teaching lab for the CompTIA Network+ N10-009
change-management topic ("request process tracking", objective 3.1). You play
the duty engineer at a network operations dispatch desk: classify real change
requests, repair an incomplete RFC, plan a compliant maintenance window,
sequence a sandboxed deploy, run the change board, investigate configuration
drift through config diffs and the audit trail, and close the documentation
cascade — with a hint system, a knowledge check, and a completion debrief.

## Run it

- **Locally:** double-click `index.html` (works over plain `file://`).
- **GitHub Pages:** push this folder's contents to a repository, enable Pages
  on the branch/root, then open `https://<user>.github.io/<repo>/`.

No build step, no server, no external runtime dependencies. Everything —
content, validation, persistence — runs client-side.

## Files

```
index.html          markup (mode gate + lab shell)
css/styles.css      all styling (design tokens as CSS custom properties)
js/data.js          lab content: tickets, evidence, objectives, quiz, glossary
js/state.js         state object + localStorage persistence
js/objectives.js    CHECK RESULTS validation engine
js/quiz.js          knowledge-check quiz (sequential unlock + answer lock)
js/ui.js            render engine (queue, workbench, evidence, drawer)
js/app.js           event wiring, gate logic, completion modal, boot
```

## Modes

- **Medium (guided shift):** 12 objectives, all tools unlocked in order.
- **Hard (night shift):** 9 objectives, fewer guardrails — prefilled fields
  become interactive, the deploy genuinely fails and must be rolled back.

Progress persists in `localStorage` (`n1009_chmgmt_dispatch_v1`) and resumes
exactly on reload; RESET returns the lab to pristine after confirmation.

*All tickets, logs and evidence are TRAINING DATA — SYNTHETIC (`.example`
domains, RFC 5737 documentation IPs). Mapped to CompTIA Network+ N10-009
objective 3.1; see the official objectives at CompTIA for scope.*
