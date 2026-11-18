# The Tripwire Room — Deception Technologies Lab (static edition)

An interactive, self-contained practice lab for **CompTIA Network+ (N10-009)**, Domain 4 → objective 4.1:
**deception technologies** (honeypot, honeynet, honeyfile, honeytoken, DNS sinkhole, tarpit) and the security
terminology **risk, vulnerability, exploit, threat** and the **CIA triad**.

This is a fully static port of the original framework lab: plain HTML + CSS + JavaScript, **no build step,
no server, no external dependencies**. All content is synthetic and defense-focused.

## What's inside

| Bay | Content |
|---|---|
| 01 Field Manual | Knowledge core: the deception family, placement & isolation, terminology |
| 02 Trap Rack | Configure the six deception controls (honeypot, honeyfile+canary, honeytoken, sinkhole, tarpit, isolation fence) |
| 03 The Yard | Live asset map of the synthetic network (VLAN 10 production / VLAN 66 decoy yard) |
| 04 Sensor Wall | Reactive recon drill (Medium) or the 14-event overnight capture with triage (Hard) |
| 05 Drill Deck | 12 guided (Medium) / 10 challenge (Hard) machine-validated objectives |
| 06 Debrief Board | 7-question scenario quiz per mode + detection playbook, hardening recs, takeaways |

Two difficulty modes share one environment core; progress is saved **per shift** in `localStorage`
(key `borealis-tripwire-lab-v1`) on your device only. RESET wipes both shifts after confirmation.

## How to open

- **Simplest:** double-click `index.html` (works via `file://`).
- **Recommended:** serve the folder with any static file server, e.g.
  `python3 -m http.server 8000` inside this folder, then open `http://localhost:8000/`.

## Deploy to GitHub Pages (5 steps)

1. Create a new GitHub repository.
2. Upload/push the **contents of this folder** (or the extracted zip) to the repo root — keep `index.html` at the root.
3. In the repo: Settings → Pages → Source: your branch, folder `/ (root)` → Save.
4. Open `https://<user>.github.io/<repo>/` (a `.nojekyll` file is already included so GitHub Pages serves files as-is).
5. Confirm the lab loads and "Waking the station…" gives way to the mode-select screen.

## Notes

- Everything runs client-side; the page makes **zero network requests** (fonts and icons are bundled locally).
- All hosts, IPs (RFC 5737 ranges), domains, credentials and log lines are fictional training data.
- Works in all modern browsers; classic scripts (no modules) so it also runs from `file://` and any subpath.
