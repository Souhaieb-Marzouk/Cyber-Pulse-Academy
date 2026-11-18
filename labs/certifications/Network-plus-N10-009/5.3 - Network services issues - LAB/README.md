# Atlas NOC Command Deck — Network+ N10-009 5.3 Practice Lab (static)

A self-contained, zero-build practice lab for **CompTIA Network+ N10-009 objective 5.3**
(troubleshooting network service issues: switching — STP/VLAN/ACL, routing — table &
default route, DHCP pool exhaustion, wrong gateway / IP / subnet mask).

You play a NOC technician on a simulated "command deck": triage seven tickets on a live
topology, read state-reflecting switch/router consoles, apply fixes, verify with ping /
traceroute / DHCP-renew probes, then pass a gated cert drill. Two difficulty modes:

- **Medium — Guided Work Order** (12 objectives, 3-level hint vault, tolerant checking)
- **Hard — Incident Bridge** (9 incidents, strict validation, red herrings, 1 nudge)

All data is a labeled synthetic training simulation.

## Run it

No build step, no server, no dependencies. Either:

- **Open directly:** double-click `index.html` (works from `file://`), or
- **Serve statically:** `python3 -m http.server 8000` in this folder, then open
  <http://localhost:8000/>.

Progress auto-saves per difficulty mode in your browser (localStorage) and survives
reloads; **Reset lab** wipes the current mode back to the pristine broken network.

## Deploy to GitHub Pages

Push this folder's contents to a repository root (keep `.nojekyll`), then enable
Pages: *Settings → Pages → Deploy from branch → root*. The site is fully relative-path,
so it also works under `https://<user>.github.io/<repo>/` subpaths.

## Structure

    index.html            markup shell (all overlays, panels, script tags)
    css/styles.css        design tokens + all styling (vanilla CSS, custom properties)
    js/data.js            lab content: topology, tickets, logs, devices, probes,
                          control catalogs, field manual, glossary, quiz banks
    js/state.js           utilities, per-mode persistence, derived network facts,
                          topology/tickets/gauges rendering, event log
    js/ui.js              device consoles: show commands, config actions, DHCP UI
    js/probe.js           probe engine + verification sweep
    js/objectives.js      mission board engine (objectives, hints, CHECK RESULTS)
    js/quiz.js            field manual renderer, cert drill, after-action report
    js/app.js             bootstrap, tabs, mode select, reset, completion modal

Classic `<script>` tags in dependency order (no modules, no bundler) so the lab runs
from `file://` as well. No external requests of any kind — fonts are the system stack,
icons are inline SVG, everything else is embedded.

*Content note: every quiz item, hint tier and feedback message is identical to the
audited original lab; this port is a structural repackaging only.*
