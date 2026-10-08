# T1059 — Command and Scripting Interpreter — exercise batches

Owner-facing notes for this topic folder. The public page is `topics/t1059.html`; the hub loads
each batch into a same-origin iframe from the paths below.

## What exists here

| Batch | File | Status | Lens |
|---|---|---|---|
| 1 | `exercises/t1059/batch-1.html` | **published** | Detection & Triage: log and alert analysis, SIEM-style queries, prioritisation, blue-team lens. |
| 2 | `exercises/t1059/batch-2.html` | **missing** | Response & Hands-on: terminal emulator, configuration and policy completion, decision trees, spot-the-mistake, incident timeline ordering. |
| 3 | `exercises/t1059/batch-3.html` | **missing** | Adversarial & Cross-domain: red-team perspective, evasion, dual-perspective pairs, ATT&CK mapping, risk ranking, report drafting. |

Batch 1 is the complete standalone deliverable: 20 questions, mixed mechanics, immediate
explanations, a results screen at `#cm-results`, and the `CYBERPULSE_SCORE` postMessage contract
with `location.origin` as the target, wrapped in `try`/`catch` so it also runs when opened directly.
Batches 2 and 3 are still to be written and are marked `missing` in `data/techniques/t1059.json`.

## Publishing a new batch

1. Write the batch at the exact path above, under 250 KB, self-contained: inline CSS and JS only,
   no external request of any kind, `id="cm-results"` on the results container, the
   `cm-exercise-meta` JSON block, and the score `postMessage` on completion.
2. Set that batch's `status` to `published` in `data/techniques/t1059.json` (change it from
   `missing`; the validator fails if the file exists while the status still says `missing`).
3. Run the pipeline, in this order, from the repository root:

   ```
   python scripts/build_catalog.py
   python scripts/generate_pages.py
   python scripts/validate.py
   ```

4. `validate.py` must exit 0. It enforces the size cap, the reserved batch paths, internal links,
   the external-host allow-list, the placeholder markers, and the defanged-indicator rules.

## Content safety rules for this folder

- Defensive training only: no working exploit code, no real credentials, no live malware or hashes,
  and nothing that reads as a procedure to follow.
- Defang every indicator in prose and in log excerpts: `hxxp://host[.]example`, `192.0.2.14`,
  `user[at]example[.]test`. Never the live, clickable form.
- Address literals only from the RFC 5737 ranges 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24.
  Host names only from the RFC 2606 example domains.
- Log excerpts are analyst-facing telemetry to interpret — command lines, parent-child
  relationships, task registration, audit records. They are never instructions.
- Base64 or otherwise encoded values may appear only as data to decode offline, redacted or
  truncated, and never as a complete payload.
- Every batch must explain its reasoning after each answer and must work with the keyboard alone.
