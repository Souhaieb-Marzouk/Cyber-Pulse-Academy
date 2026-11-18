# Trust Fabric Commissioning — SY0-801 1.3 Cryptographic Solutions Lab (static)

A fully static, self-contained copy of the interactive Security+ (SY0-801 objective 1.3)
practice lab: you are the Cryptographic Controls Lead at the fictional Aurelia Regional
Health Network and must commission the trust fabric — key pairs, PKI, encryption levels,
hashing/signatures, key lifecycle — then pass the Final Sign-Off. Includes all
post-audit fixes (answer locking, quiz lock/next enforcement, option shuffling,
popup easy-close, performance-derived focus areas, unload-safe persistence).

## Run it

No build, no server required. Any of these works:

- **Local file:** double-click `index.html` (or open it in any modern browser).
- **Any static host:** upload the folder as-is.
- **GitHub Pages:** push the folder contents to a repo, enable Pages, open
  `https://<user>.github.io/<repo>/`.

## Deploy (5 steps)

1. Create a GitHub repository.
2. Upload/push the extracted folder contents (keep `index.html` at the repo root).
3. Settings → Pages → deploy from branch, root.
4. Open `https://<user>.github.io/<repo>/`.
5. Confirm the mode-select screen renders and the lab loads.

## Structure

```text
index.html          markup + relative script/style references
css/styles.css      design tokens (custom properties) + component styles
js/data.js          all lab content: objectives, check rules, hints, quiz bank, evidence
js/state.js         state object, localStorage persistence, DOM/hash utilities
js/objectives.js    ledger, hint ladder, CHECK RESULTS engine, answer locking
js/quiz.js          Final Sign-Off quiz engine
js/ui.js            station rendering, instrument boards, completion report
js/app.js           event wiring and bootstrap
.nojekyll           disables GitHub Pages Jekyll processing
```

All JavaScript is classic (non-module) for `file://` compatibility. Persistence uses
`localStorage` (key `arhn-trust-fabric-v1`); RESET wipes it after confirmation.
Works offline; the only outbound links are optional reading citations (CompTIA/MITRE).
