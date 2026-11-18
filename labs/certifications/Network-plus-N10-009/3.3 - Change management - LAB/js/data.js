/* ================================================================
   js/data.js
   All lab content as data: glossary, option sets, tickets, evidence
   artifacts (configs, audit trail, syslog, inventory, IPAM/DNS), policy,
   topology, objectives, concept drill, quiz bank, knowledge core, debrief.
   Data only - no logic. Logic lives in state.js / objectives.js / quiz.js / ui.js.
   ================================================================ */
"use strict";
/* ================================================================
   DATA LAYER — all synthetic, fictional, labeled training data
   ================================================================ */
const GLOSSARY={
  "change management":"Process that controls how network changes are requested, approved, scheduled, implemented and documented, to minimize disruption.",
  "change request (RFC)":"The formal request describing a proposed change: purpose & scope, affected systems, risk, plan, window, rollback.",
  "requester / change owner":"The person accountable for proposing a change and driving it through every gate.",
  "service request":"A routine user-initiated request (e.g., a laptop or a VPN token) handled by the service desk — not a network change.",
  "change board / CAB":"The Change Advisory Board: the group that approves, defers or rejects normal and emergency changes.",
  "standard change":"A routine, low-risk, pre-approved change type from a catalog (e.g., replacing a failed device with an identical model).",
  "normal change":"A change that goes through the complete review-and-approval cycle before it may be scheduled.",
  "emergency change":"An incident-driven change approved on an expedited path, implemented now, documented and reviewed retroactively.",
  "maintenance window":"The scheduled date/time/duration — normally off-hours — in which a change is allowed to be implemented.",
  "impact analysis":"Identifying every system, service and user group a change could touch — its blast radius.",
  "risk level":"Assessed likelihood × consequence of the change failing or disrupting service (low / medium / high / critical).",
  "rollback / backout plan":"Pre-planned, tested steps that restore service if a change fails.",
  "sandbox / test environment":"Isolated environment where a change is validated before production deployment.",
  "validation":"Post-implementation confirmation — tests plus monitoring telemetry — that the change achieved its purpose.",
  "configuration drift":"Untracked divergence of a device's running configuration from its approved baseline/golden configuration.",
  "baseline / golden configuration":"The approved reference configuration used for comparison; backup configurations preserve each device's last known good state.",
  "audit trail":"The tracked record of who changed what, when, and under which approved request.",
  "IPAM":"IP address management — the documented IP address schema (blocks/scopes) and address assignments.",
  "EOL / EOS":"End-of-life / end-of-support dates that drive life-cycle planning for hardware and software.",
  "unauthorized change":"Any change made without a matching approved request — treated as a fault and remediated through the process."
};
const gi=(t)=>`<span class="glossterm" tabindex="0" data-def="${GLOSSARY[t].replace(/"/g,'&quot;')}">${t}</span>`;

const TYPE_OPTS=[
  ["standard","Standard — pre-approved catalog change"],
  ["normal","Normal — full review & approval"],
  ["emergency","Emergency — incident expedite path"],
  ["service request","Service request — route to service desk"]
];
const RISK_OPTS=[
  ["low","Low — routine, minimal blast radius"],
  ["medium","Medium — some user impact, easy fallback"],
  ["high","High — service-wide or multi-site impact"],
  ["critical","Critical — whole-organization outage risk"]
];
const MONITOR_CARDS=[
  ["ha","HA failover event log","FW-A ↔ FW-B failover records"],
  ["vpn","VPN tunnel status board","3 depot tunnels + remote users"],
  ["dhcp","DHCP lease renewal stats","leases granted / renewals OK"],
  ["lldp","Port & LLDP neighbor status","link up, neighbors discovered"],
  ["dns","DNS sinkhole query log","blocked-domain resolution attempts"],
  ["vrrp","VRRP status","gateway redundancy state"]
];
const WINDOW_SLOTS=[
  ["A","Wed Nov 12 · 23:00–01:00","Weekday overnight. Depots start dispatching freight at 05:00 Mon–Fri — VPN risk exposure.","no"],
  ["B","Sat Nov 15 · 02:00–04:30","Weekend overnight. 2.5 h ≥ 2 h estimate + rollback time. Meets policy R4.","yes"],
  ["C","Sun Nov 16 · 14:00–16:00","Daytime — violates the overnight rule for high-risk changes (R4).","no"],
  ["D","Fri Nov 14 · 18:00–19:00","Only 1 h — shorter than the estimate; also peak dispatch.","no"]
];

/* ---------- Tickets ---------- */
const TICKETS={
 "CHG-0418":{
  title:"Perimeter firewall firmware security patch", requester:"a.chen (senior netops)",
  desc:"Vendor released a security patch build (FPR-4.2.7-281) for the HA firewall pair FW-A/FW-B fixing a management-interface flaw. Upgrade is staged: standby first, controlled failover, then the peer.",
  correctType:"normal", riskAssess:"high",
  affectedOpts:[["fw-a","FW-A — perimeter firewall (active)"],["fw-b","FW-B — perimeter firewall (standby)"],["vpn","Site-to-site VPN tunnels — 3 depots"],["ravpn","Remote-access VPN — home-office staff"],["core","HQ-CORE-01 — core switch"],["wifi","Depot Wi-Fi access points"],["dnssrv","Internal DNS server"],["phones","IP phone VLAN"]],
  affectedOk:["fw-a","fw-b","vpn","ravpn"],
  riskOk:"high",
  rollbackOpts:[
    ["downgrade","Downgrade to the previous firmware image (4.2.6-275) from the standby image partition","tested: image swap, ~20 min, config preserved"],
    ["cfgrestore","Restore the configuration backup to both firewalls","config files are correct — the firmware binary is the failing part"],
    ["reboot","Reboot FW-A into its last known good state","no image rollback; reboots don't remove a bad image"],
    ["vendor","Raise a vendor support ticket and wait","not a plan — service stays at risk while waiting"]],
  rollbackOk:"downgrade",
  window:"B", windowBy:"student",
  seqSteps:["Announce rollback start; notify stakeholders","Fail over traffic to FW-B (HA: FW-B active)","Downgrade FW-A to image 4.2.6-275","Fail traffic back to FW-A; confirm session sync","Downgrade FW-B to image 4.2.6-275","Verify HA pair healthy + all 3 VPN tunnels re-established"],
  monOk:["ha","vpn"], monQ:"Which telemetry proves the staged upgrade succeeded and service survived the failover?",
  docField:{key:"fwver",label:"Asset inventory — firmware version",opts:[["v281","FPR-4.2.7-281 (security patch build)"],["v275","FPR-4.2.6-275 (previous image)"],["vshort","4.2.7"],["vnone","Not recorded"]],ok:"v281"},
  approveJOpts:[
    ["j1","Off-hours window, upgrade staged via HA failover, tested downgrade path exists — residual risk acceptable",""],
    ["j2","The requester is a senior engineer, so review is unnecessary",""],
    ["j3","Firmware patches can never disrupt traffic",""]],
  approveJOk:"j1",
  execLines:["[02:00] window open — stakeholders notified","[02:03] suspending HA preemption","[02:05] upgrading standby FW-B → 4.2.7-281 … ok","[02:21] controlled failover → FW-B active, sessions synced","[02:26] upgrading FW-A → 4.2.7-281 … ok","[02:39] HA pair healthy — 3/3 VPN tunnels up","[02:41] implementation complete — enter validation"]
 },
 "CHG-0419":{
  title:"Replace failed access switch — Depot East (identical model)", requester:"d.okafor (depot tech)",
  desc:"DEPOT-E-ASW-02 failed hard Monday night (PSU). Catalog item SC-114 covers swapping it with the identical model; config restore is part of the procedure. This is the textbook pre-approved change.",
  correctType:"standard", riskAssess:"low",
  cfgOpts:[
    ["backup","Restore this switch's most recent backup configuration (SC-114 step 4)","this device's own last-known-good state — port config and VLANs exactly as approved"],
    ["golden","Apply the golden configuration template for access switches","golden = generic approved template; device-specific port config would be lost"],
    ["copy","Copy the running config from Depot West's switch","different device, different port assignments"],
    ["hand","Factory-default and configure by hand in the window","slow and error-prone — why backups exist"]],
  cfgOk:"backup",
  monOk:["lldp"], monQ:"Which telemetry proves the replacement switch is passing traffic correctly?",
  docField:{key:"serial",label:"Asset inventory — serial number",opts:[["snew","SN-MFL-90377 (new unit)"],["sold","SN-MFL-88412 (failed unit)"],["sunk","Unknown"],["ssc","SC-114"]],ok:"snew"},
  execLines:["[01:00] pre-approved standard change SC-114 — no CAB wait","[01:02] failed unit powered down, fiber/patch labeled","[01:14] new unit racked, SN-MFL-90377 logged","[01:20] backup configuration restored","[01:26] uplinks green — LLDP neighbors re-discovered","[01:28] implementation complete — enter validation"]
 },
 "CHG-0420":{
  title:"Upgrade open-source DHCP/DNS package (dnsmasq 2.89 → 2.90) on NETOPS-SRV", requester:"s.ivanova (netops)",
  desc:"Bug-fix release for the DHCP/DNS service that serves all depots. Low risk, but the service is shared — policy requires a sandbox regression before production. Rollback = reinstall previous package version.",
  correctType:"normal", riskAssess:"low",
  monOk:["dhcp"], monQ:"Which telemetry proves the DHCP/DNS service is healthy after the upgrade?",
  approveJOpts:[
    ["j1","Sandbox regression passed before production; low blast radius; instant package rollback available",""],
    ["j2","It is open source, so it cannot fail",""],
    ["j3","The server is unimportant",""]],
  approveJOk:"j1",
  execLines:["[01:00] window open","[01:01] deploying package build 2.90 …","[01:04] service restarted","[01:05] implementation complete — enter validation"],
  execLinesFail:["[01:00] window open","[01:01] deploying package build 2.90 …","[01:04] service restarted","[01:06] ⚠ telemetry anomaly — lease renewals failing for 12% of depot clients","[01:07] implementation FAILED validation — execute the rollback plan"],
  rollbackLines:["[01:09] rollback: reinstalling package 2.89 … ok","[01:11] service restarted — lease renewals 100%","[01:12] service stable on previous version"]
 },
 "CHG-0421":{
  title:"Re-address depot East Wi-Fi VLAN to the new IP schema (IPAM)", requester:"s.ivanova (netops)",
  desc:"Align VLAN 40 (depot-east-wifi) to schema v2. ⚠ INTAKE REVIEW: the request as submitted is INCOMPLETE — three required elements are missing. Complete the RFC before it can reach the board.",
  correctType:"normal", riskAssess:"high", defective:true,
  rfcMissingOpts:[["purpose","Purpose, goal & scope"],["affected","Affected systems"],["risk","Risk level"],["window","Maintenance window"],["rollback","Rollback / backout plan"],["test","Test plan"],["approvals","Approval record"],["docs","Documentation plan"]],
  rfcMissingOk:["purpose","rollback","test"],
  purposeOpts:[
    ["p1","Re-align depot East Wi-Fi VLAN 40 to schema-v2 block 10.40.20.0/24 so addressing stays consistent across all depots",""],
    ["p2","Make the depot Wi-Fi faster",""],
    ["p3","Replace the depot Wi-Fi access points",""],
    ["p4","Upgrade the DHCP server package",""]],
  purposeOk:"p1",
  rollbackOpts:[
    ["r1","Revert the DHCP scope and gateway to the previous schema (10.40.10.0/24) and re-verify client leases","tested: scope revert, ~30 min"],
    ["r2","No rollback needed — the change is small","no change is too small for a rollback plan"],
    ["r3","Reboot all access points","reboots don't restore addressing"],
    ["r4","Restore the golden configuration on HQ-CORE-01","wrong device; the switch isn't changing"]],
  rollbackOk:"r1",
  testOpts:[
    ["t1","Pilot the new scope on 5 sandbox APs; verify leases + gateway reachability, then a client revert test",""],
    ["t2","Test directly on production during the window","that is implementation, not a test"],
    ["t3","No test needed — IP changes are trivial","addressing errors propagate to every client"],
    ["t4","Ask Marketing to try the Wi-Fi afterwards","users are not a test plan"]],
  testOk:"t1",
  approveJOpts:[
    ["j1","RFC repaired first: purpose, tested rollback and sandbox pilot plan now on file",""],
    ["j2","IP changes never fail",""],
    ["j3","The depot is small, so review is unnecessary",""]],
  approveJOk:"j1",
  monOk:["dhcp"], monQ:"Which telemetry proves clients re-addressed correctly?",
  ipamOpts:[
    ["i1","VLAN 40 depot-east-wifi → 10.40.20.0/24 (schema v2 — supersedes 10.40.10.0/24)",""],
    ["i2","VLAN 40 depot-east-wifi → 10.40.10.0/24 (unchanged)",""],
    ["i3","Add 10.40.20.5 to the printer list",""],
    ["i4","Delete all depot entries",""]],
  ipamOk:"i1",
  schemaOpts:[
    ["sc1","Schema change — a new address block/scope design; the IPAM schema record is updated",""],
    ["sc2","Assignment change — individual devices receive new specific addresses",""],
    ["sc3","Both a schema and an assignment change",""],
    ["sc4","Neither — IPAM only tracks printers",""]],
  schemaOk:"sc1",
  execLines:["[01:00] window open","[01:02] DHCP scope VLAN 40 → 10.40.20.0/24 deployed","[01:05] gateway + helper addresses updated","[01:09] sandbox AP group re-leased on new scope … ok","[01:12] implementation complete — enter validation"]
 },
 "CHG-0422":{
  title:"Add redundant uplink HQ-CORE-01 → FW-B (gateway redundancy, VRRP VIP — simplified)", requester:"a.chen (senior netops)",
  desc:"Second uplink from the core switch to the standby firewall path, with a VRRP virtual IP (10.10.0.1) for first-hop gateway redundancy. Adds equipment + configuration; topology diagram must be updated at close.",
  correctType:"normal", riskAssess:"high",
  affectedPrefilled:"medium",
  affectedOpts:[["core","HQ-CORE-01 — core switch"],["fwb","FW-B — firewall path"],["hqgw","HQ wired clients — default-gateway traffic"],["depvpn","Depot VPN tunnels"],["wifiaps","Depot Wi-Fi APs"],["prvl","Printer VLAN"]],
  affectedOk:["core","fwb","hqgw"],
  rollbackOpts:[
    ["r1","Disable the new link and remove the VRRP VIP configuration (revert to baseline configuration)","tested in sandbox; ~15 min"],
    ["r2","Unplug the new cable","leaves orphan config behind"],
    ["r3","No rollback — redundancy can only help","mis-configured redundancy can cause outages"]],
  rollbackOk:"r1",
  rollbackPrefilled:"medium",
  monOk:["vrrp"], monQ:"Which telemetry proves gateway redundancy is actually working?",
  approveJOpts:[
    ["j1","Removes a single point of failure; rollback is a config revert; overnight window",""],
    ["j2","More cables are always an improvement",""],
    ["j3","VRRP makes outages impossible",""]],
  approveJOk:"j1",
  execLines:["[23:00] window open","[23:04] new fiber pair patched CORE-01 ↔ FW-B","[23:12] VRRP group 1 configured — VIP 10.10.0.1","[23:20] failover test: FW-B path takes over … ok","[23:24] implementation complete — enter validation"]
 },
 "CHG-0423":{
  title:"EMERGENCY: block ransomware C2 domain at the perimeter + patch VPN gateways", requester:"noc-duty (incident INC-8841)",
  desc:"Active ransomware incident. Malware is beaconing to c2-cdn.example. Duty manager requests an immediate perimeter block plus the hotfix for the VPN gateway package. The emergency path exists exactly for this.",
  correctType:"emergency", riskAssess:"critical",
  empathOpts:[
    ["e1","Expedited approval — NOC duty manager approves now; full CAB reviews it retroactively within 24 h",""],
    ["e2","Standard CAB review at Tuesday's meeting","the incident will not wait for a meeting"],
    ["e3","No approval needed during an incident","expedited ≠ absent: the duty manager approves NOW"],
    ["e4","Ask the requester to re-submit next week",""]],
  empathOk:"e1",
  monOk:["dns"], monQ:"Which telemetry proves the block is working?",
  execLines:["[now] incident INC-8841 active — expedite path","[now] duty manager approval logged (retro-CAB ≤24h)","[now] c2-cdn.example → DNS sinkhole 198.51.100.66","[now] VPN gateway hotfix applied","[now] implementation complete — enter validation"]
 },
 "CHG-0424":{
  title:"Replace HQ core switch this Friday night — no test plan, no rollback provided", requester:"r.santana (junior net admin)",
  desc:"“The core switch is old, let's just swap it Friday night. I'll figure out the details later.” No affected-systems list, no rollback, no test plan, no backup-restore step. The board's job is to say no — and coach.",
  correctType:"normal", riskAssess:"high",
  rejectJOpts:[
    ["x1","No rollback or test plan; a core switch swap without a fallback risks the entire HQ campus",""],
    ["x2","The requester is too junior to have ideas",""],
    ["x3","Core switches may never be replaced",""],
    ["x4","Friday night is inconvenient for the board",""]],
  rejectJOk:"x1",
  execLines:[],
  monOk:[], monQ:"",
  docField:null
 },
 "SR-0917":{
  title:"Marketing needs a laptop imaged + a VPN token issued", requester:"m.reyes (marketing)",
  desc:"A routine user request. It consumes service-desk capacity but touches no network device configuration. Routing it into the change pipeline would drown the board — and the board would drown it.",
  correctType:"service request"
 },
 "DRIFT-0066":{
  title:"INVESTIGATION: HQ-CORE-01 config hash ≠ baseline (config-monitor alert)", requester:"config-monitor (automated)",
  desc:"Monday 08:05 — configuration monitoring flagged HQ-CORE-01: the running configuration differs from its baseline/golden configuration, and no request in the log matches the delta. Investigate the evidence locker, then classify and remediate."
 }
};
const QUEUE_ORDER=["DRIFT-0066","CHG-0423","CHG-0418","CHG-0421","CHG-0422","CHG-0420","CHG-0419","CHG-0424","SR-0917"];
const PRIORITY_ITEMS=["CHG-0423","CHG-0418","CHG-0421","CHG-0422","CHG-0420","CHG-0419"];
const PRIORITY_OK={"CHG-0423":"1","CHG-0418":"2","CHG-0421":"3","CHG-0422":"4","CHG-0420":"5","CHG-0419":"6"};
const STAGES=["Intake","Risk & Impact","Approval","Scheduled","Implemented","Validated","Documented","Closed"];

/* ---------- Evidence ---------- */
const DIFFS={
 "HQ-CORE-01":[
  ["hunk","@@ vlan section — ~26 lines unchanged @@ (baseline has VLAN 10 only)"],
  ["ctx","vlan 10"],
  ["ctx"," name HQ-LAN"],
  ["add","+ vlan 66"],
  ["add","+  name GUEST-TEMP"],
  ["hunk","@@ interface GigabitEthernet1/0/24 @@"],
  ["ctx"," interface GigabitEthernet1/0/24"],
  ["del","-  switchport access vlan 10"],
  ["add","+  switchport access vlan 66"],
  ["add","+  description 'visitor demo — temp'"]
 ],
 "FW-B":[
  ["hunk","@@ banner @@"],
  ["ctx"," banner motd ^",""],
  ["del","- Authorized access only.",""],
  ["add","+ AUTHORIZED ACCESS ONLY — MFL-FW-B — change CHG-0416 (approved 2026-11-03, CAB minute #12).",""],
  ["ctx"," ~58 lines unchanged",""]
 ],
 "DEPOT-E-ASW-02":[
  ["hunk","@@ full comparison @@"],
  ["ctx","(no differences from baseline/golden configuration)",""]
 ]
};
const AUDIT_LOG=[
 ["2026-11-03 10:14","cfg-commit","FW-B banner","a.chen","RFC ref: CHG-0416 ✓ approved"],
 ["2026-11-05 21:38","cfg-commit","HQ-CORE-01 vlan 66 + Gi1/0/24","j.moreau (network intern)","NO RFC REFERENCE ⚠"],
 ["2026-11-06 08:05","config-monitor","HQ-CORE-01 hash mismatch vs baseline","svc-monitor","auto-flagged → DRIFT-0066"],
 ["2026-11-06 09:12","case-open","DRIFT-0066","a.chen","investigation started"]
];
const SYSLOG=[
 ["Nov 6 07:58","HQ-CORE-01","%LINK-3-FLAP Gi1/0/17 ×3 — depot-east uplink (carrier ticket NET-2211, unrelated to changes)","warn"],
 ["Nov 6 08:05","HQ-CORE-01","%CONFIG-I-DIFF: running config differs from baseline/golden","warn"],
 ["Nov 6 09:30","FW-B","%HA-INFO: peer FW-A healthy, session sync OK","info"],
 ["Nov 6 11:40","NETOPS-SRV","%PKG: dnsmasq 2.89 up 214 days","info"]
];
const HELPDESK_NOTE="Helpdesk snippet (Tue): “j.moreau says he 'just added a temp VLAN for a visitor demo on Tuesday night, will document later'. No paperwork on file.”";
const INVENTORY=[
 ["HQ-CORE-01","core switch","SN-MFL-70104","IOS 9.3.10","active","—"],
 ["FW-A","perimeter firewall","SN-MFL-55011","FPR 4.2.6-275","active","see CHG-0418"],
 ["FW-B","perimeter firewall","SN-MFL-55012","FPR 4.2.6-275","active","see CHG-0418"],
 ["DEPOT-E-ASW-02","access switch","SN-MFL-88412","IOS 8.2.1","FAILED → see CHG-0419","SC-114"],
 ["NETOPS-SRV","DHCP/DNS server","SVR-MFL-2201","dnsmasq 2.89","active","see CHG-0420"]
];
const IPAM_ROWS=[
 ["VLAN 10","hq-lan","10.10.0.0/24","schema v2","—"],
 ["VLAN 20","hq-voice","10.10.20.0/24","schema v2","—"],
 ["VLAN 40","depot-east-wifi","10.40.10.0/24","schema v1","re-address → CHG-0421"],
 ["VLAN 30","depot-north-lan","10.30.10.0/24","schema v2","—"],
 ["(undocumented)","(none)","—","—","⚠ unauthorized entries appear here when drift is confirmed"]
];
const DNS_ROWS=[
 ["netops.meridianfreight.example","A","198.51.100.20","NETOPS-SRV"],
 ["vpn-gw.meridianfreight.example","A","198.51.100.10","EDGE-RTR"],
 ["sinkhole.meridianfreight.example","A","198.51.100.66","C2 block target (CHG-0423)"]
];
const POLICY_HTML=`
 <div class="policy">
  <b>Change-management policy MFL-CM-01 (extract)</b>
  <ul style="margin:8px 0 0;padding-left:18px">
   <li><b>R1 —</b> Every change request must document: purpose &amp; scope, affected systems, risk level, maintenance window, <u>rollback plan</u>, <u>test plan</u>.</li>
   <li><b>R2 —</b> <u>Standard</u> changes come from the pre-approved catalog (low-risk, routine — e.g., SC-114 identical switch swap) and skip board review.</li>
   <li><b>R3 —</b> <u>Emergency</u> changes: NOC duty manager approves immediately; notifications go out; the full board reviews retroactively within 24 h.</li>
   <li><b>R4 —</b> <u>High-risk</u> changes are implemented only in a <u>weekend overnight window</u> at least as long as estimate + rollback time.</li>
   <li><b>R5 —</b> Nothing is implemented outside its window. Sandbox before production wherever the change allows it.</li>
   <li><b>R6 —</b> A request closes only after <u>validation telemetry</u> and <u>documentation updates</u> (diagrams, asset inventory, IPAM/DNS).</li>
   <li><b>R7 —</b> <u>Configuration drift is a fault</u>: remediate through the change process, never silently.</li>
   <li><b>Dispatch priority —</b> emergency first → then high risk (ties by ticket ID) → then low risk → standard catalog last. Rejected requests leave the queue.</li>
  </ul>
 </div>`;
const TOPOLOGY_SVG=(installed)=>`
<div class="topo"><svg viewBox="0 0 520 320" role="img" aria-label="Meridian Freight network topology diagram">
 <ellipse cx="260" cy="26" rx="52" ry="16" fill="none" stroke="var(--line2)"/><text x="260" y="30" text-anchor="middle">INTERNET</text>
 <rect x="228" y="58" width="64" height="24" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="260" y="74" text-anchor="middle" class="nlab">EDGE-RTR</text>
 <line x1="260" y1="42" x2="260" y2="58" stroke="var(--line2)" stroke-width="2"/>
 <rect x="118" y="110" width="70" height="26" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="153" y="127" text-anchor="middle" class="nlab">FW-A</text>
 <rect x="332" y="110" width="70" height="26" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="367" y="127" text-anchor="middle" class="nlab">FW-B</text>
 <line x1="244" y1="82" x2="166" y2="110" stroke="var(--line2)" stroke-width="2"/>
 <line x1="276" y1="82" x2="346" y2="110" stroke="var(--line2)" stroke-width="2"/>
 <rect x="225" y="168" width="84" height="28" rx="4" fill="var(--panel2)" stroke="var(--amber-dim)"/><text x="267" y="186" text-anchor="middle" class="nlab">HQ-CORE-01</text>
 <line x1="160" y1="136" x2="243" y2="168" stroke="var(--line2)" stroke-width="2"/>
 <line x1="352" y1="136" x2="295" y2="168" stroke="var(--line2)" stroke-width="2"/>
 <rect x="118" y="238" width="92" height="26" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="164" y="255" text-anchor="middle" class="nlab">DEPOT-N</text>
 <rect x="220" y="238" width="92" height="26" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="266" y="255" text-anchor="middle" class="nlab">DEPOT-E</text>
 <rect x="322" y="238" width="92" height="26" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="368" y="255" text-anchor="middle" class="nlab">DEPOT-W</text>
 <line x1="176" y1="196" x2="176" y2="238" stroke="var(--line2)" stroke-width="2" stroke-dasharray="5 4"/>
 <line x1="266" y1="196" x2="266" y2="238" stroke="var(--line2)" stroke-width="2" stroke-dasharray="5 4"/>
 <line x1="358" y1="196" x2="358" y2="238" stroke="var(--line2)" stroke-width="2" stroke-dasharray="5 4"/>
 <text x="196" y="228">IPsec VPN</text>
 <rect x="420" y="168" width="86" height="28" rx="4" fill="var(--panel2)" stroke="var(--line2)"/><text x="463" y="186" text-anchor="middle" class="nlab">NETOPS-SRV</text>
 <line x1="309" y1="182" x2="420" y2="182" stroke="var(--line2)" stroke-width="2"/>
 <g class="candidate${installed?" installed":""}" ${installed?"":'role="button" tabindex="0" aria-label="Candidate redundant uplink — activate when CHG-0422 is documented"'} id="candLink">
   <path d="M 267 168 C 300 130, 330 130, 356 136" fill="none" stroke="#0a0f0d" stroke-width="18" style="cursor:pointer"/>
   <path d="M 267 168 C 300 130, 330 130, 356 136" fill="none" stroke="${installed?"var(--teal)":"var(--amber)"}" stroke-width="2.5" ${installed?"":"stroke-dasharray='6 4'"}/>
   <text x="312" y="118" text-anchor="middle" style="cursor:pointer">${installed?"VRRP VIP 10.10.0.1 ✓":"candidate uplink"}</text>
 </g>
 <text x="14" y="308" style="fill:var(--red-dim)">TRAINING DATA — SYNTHETIC TOPOLOGY</text>
</svg></div>
${installed?"":'<p class="small" style="margin-top:6px">Dashed amber = candidate redundant uplink (CHG-0422). It becomes a real, documented link only when that request reaches its Documentation gate.</p>'}`;
/* ---------- Objectives ---------- */
const OBJECTIVES={
medium:[
 {id:"OBJ-M1",pillar:"P1",v:"m1",loc:"each ticket → Intake gate",
  text:"Classify all 8 queue items at their Intake gate: standard, normal, emergency, or service request.",
  why:"Type decides the route: standard changes skip the board, normal changes get full review, emergencies use the expedite path, and service requests never enter the pipeline at all. Mis-routing either blocks real work or fast-tracks risk.",
  hints:["Queue items whose type chip reads “unclassified” still need a decision at their Intake gate.","SC-114 (identical switch swap) is the catalog standard change; INC-8841's firewall block is the emergency; the laptop imaging is a service request.","The Intake gate select sits under each ticket's description — set all 8, including CHG-0424 and SR-0917."]},
 {id:"OBJ-M2",pillar:"P2",v:"m2",loc:"CHG-0421 → Risk & Impact gate (intake review)",
  text:"Identify exactly which required elements are missing from CHG-0421's request.",
  why:"An RFC without purpose, rollback or test plan is a promise without a plan. Policy R1 makes those fields mandatory precisely because the audit after a failed change starts with what was written down before it.",
  hints:["Compare the ticket's fields against policy R1's mandatory list in the Evidence → Policy tab.","The review checklist lists 8 elements; 5 are present, 3 are marked “(not documented)”.","Missing: the reason for the change, the way back out of it, and how it was tested before touching production."]},
 {id:"OBJ-M3",pillar:"P2",v:"m3",loc:"CHG-0418 → Risk & Impact gate · Evidence → Topology",
  text:"Complete CHG-0418's impact analysis: select ALL systems the firewall upgrade can affect.",
  why:"Impact analysis sets the blast radius — everything on this list must be watched during the window and checked in validation. Miss the depot tunnels and Saturday morning starts with three depots that cannot dispatch.",
  hints:["Everything that sends traffic THROUGH the firewalls is affected — trace the flows on the topology map.","Both firewalls, the site-to-site tunnels, and remote-access users ride the upgrade. Core switch, APs, DNS and phones connect around it.","Correct set: FW-A, FW-B, site-to-site VPN, remote-access VPN — four chips, no more."]},
 {id:"OBJ-M4",pillar:"P2",v:"m4",loc:"CHG-0418 → Risk gate + Scheduled gate · policy R4",
  text:"Assign CHG-0418 its risk level, then lock a compliant maintenance window.",
  why:"Risk level drives the rules that follow: a high-risk change may only run in a weekend overnight window long enough to include the rollback (policy R4). Getting this wrong schedules outages during freight dispatch.",
  hints:["Firewalls carry ALL depot and remote-user traffic — where does that sit on the low→critical scale?","High risk. Now read R4: weekend overnight, ≥ estimate + rollback time. Check each calendar slot's fine print.","Saturday 02:00–04:30 is the only slot that satisfies R4."]},
 {id:"OBJ-M5",pillar:"P4",v:"m5",loc:"CHG-0418 + CHG-0419 → plan fields",
  text:"Choose the correct rollback for CHG-0418 and the correct configuration source for CHG-0419's restore.",
  why:"A rollback plan is only real if it reverses the actual failure: the firewall's problem is its firmware image, so you downgrade the image. The new switch's problem is that it is blank, so you restore THAT device's backup configuration — not the generic template.",
  hints:["Ask: what exactly breaks in each scenario? For the firewall it's the code; for the switch it's the missing configuration.","Golden configuration = generic approved template. Backup configuration = this device's last known good state.","Downgrade image 4.2.6-275 for the firewall; backup configuration (SC-114 step 4) for the switch."]},
 {id:"OBJ-M6",pillar:"P4",v:"m6",loc:"CHG-0420 → plan buttons",
  text:"Route CHG-0420 through sandbox testing BEFORE its production deployment.",
  why:"Sandbox-first catches regressions while they are cheap. The sequence is the point: the deploy button stays locked until the sandbox regression has run — that lock is the process protecting a service every depot depends on.",
  hints:["The plan gate offers two buttons. One of them unlocks the other.","Run the sandbox lease regression first; the production deploy unlocks when it passes.","Order: sandbox regression → production deploy. Both state markers must be green."]},
 {id:"OBJ-M7",pillar:"P4",v:"m7",loc:"each ticket → Approval gate · policy R2/R3",
  text:"Act as the change board: decide every request — and use the right emergency path for CHG-0423.",
  why:"The board's value is judgment, not paperwork: approve what is planned, reject what is reckless (CHG-0424 has no fallback), and never let an emergency become an excuse for skipping approval entirely — the duty manager approves NOW and the board reviews it within 24 h.",
  hints:["Decide each ticket at its Approval gate; CHG-0423 also needs its approval PATH chosen.","Approve 0418, 0420, 0421 (after its RFC is repaired), 0422; reject 0424. For 0423 pick the expedited duty-manager path.","“Approve” on a defective RFC fails by design — finish OBJ-M2's repair first."]},
 {id:"OBJ-M8",pillar:"P3",v:"m8",loc:"DRIFT-0066 → investigation · Evidence → Configs",
  text:"Find the unauthorized change: name the drifted device and describe the delta.",
  why:"Configuration monitoring found a hash mismatch; the diff against the baseline/golden configuration is the ground truth of what actually changed on that box.",
  hints:["Evidence → Configs diffs three devices against baseline. One of them is clean, one is authorized.","Only HQ-CORE-01 differs without an RFC: VLAN 66 “GUEST-TEMP” plus a port re-pointed into it.","Device: HQ-CORE-01. Delta: VLAN 66 + Gi1/0/24 moved into it — both absent from baseline."]},
 {id:"OBJ-M9",pillar:"P3",v:"m9",loc:"DRIFT-0066 → investigation · Evidence → Logs → audit trail",
  text:"Trace the audit trail to the account behind the drift, classify it, and choose the correct remediation.",
  why:"The audit trail answers who/what/when; the classification decides the response. Drift is a fault, not a favor — it gets a remediation request and a revert to baseline, never a quiet after-hours fix, or the records and reality diverge forever.",
  hints:["The audit trail shows a config-commit with NO RFC reference — that's your line.","j.moreau committed VLAN 66 at 21:38 with no RFC. Classification: unauthorized change — configuration drift.","Remediation: raise a remediation request and revert to the baseline/golden configuration."]},
 {id:"OBJ-M10",pillar:"P3",v:"m10",loc:"each implemented ticket → Validated gate",
  text:"Validate three implemented changes with the correct monitoring telemetry.",
  why:"A change is not done when the command succeeds — it is done when telemetry proves the service works: failover logs and tunnel status for the firewall, port/LLDP status for the switch, lease renewals for DHCP.",
  hints:["Each Validated gate lists six telemetry cards; pick only the ones that can actually prove success.","Firewall: HA failover log + VPN tunnel board. Switch: port/LLDP status. DHCP: lease renewal stats.","Two cards for CHG-0418, one each for CHG-0419 and CHG-0420."]},
 {id:"OBJ-M11",pillar:"P4",v:"m11",loc:"CHG-0419 + CHG-0421 → Documented gate · Evidence → Topology",
  text:"Close the documentation loop: asset serial, IPAM record (schema vs. assignment), and the topology diagram.",
  why:"R6 closes requests only after documentation updates — the auditor's two-day hunt happened because this step was skipped. And IPAM nuance matters: VLAN 40 got a new schema block, not just new addresses for a few devices.",
  hints:["The Documented gate of each ticket holds its documentation field; the topology candidate link is clickable in Evidence.","Serial SN-MFL-90377 for the new switch; IPAM row for VLAN 40 → 10.40.20.0/24 schema v2, classified as a schema change.","Click the dashed amber candidate uplink on the topology diagram after CHG-0422 is implemented."]},
 {id:"OBJ-M12",pillar:"P1",v:"m12",loc:"Knowledge Core → cards 2, 4, 5",
  text:"Sort four statements into change management, configuration management, life-cycle management, and service requests.",
  why:"The exam blends these four on one objective. Approval tracking belongs to change management, baseline comparison to configuration management, EOL/EOS planning to life-cycle management, and a laptop request to the service desk.",
  hints:["Ask what each statement is ABOUT: approval records, config comparison, hardware aging, or a user's routine request?","Card 4 covers the configuration trio; card 5 covers life-cycle and service requests.","“Who approved it” = change; “compare against golden” = configuration; “end-of-support next quarter” = life-cycle; “VPN token” = service request."]}
],
hard:[
 {id:"OBJ-H1",pillar:"P1",v:"h1",loc:"all tickets",
  text:"Triage the whole queue: set every item's type AND dispatch priority order (policy card rule).",
  why:"Triage is the first quality gate of the shift: the emergency goes first, high-risk requests follow (ties by ticket ID), low-risk next, catalog standard last. A mis-ordered queue spends the night window on the wrong work.",
  hints:["Read the dispatch-priority rule at the bottom of the policy card, then order the six routine-track requests.","Emergency 0423 → 1; high-risk 0418, 0421, 0422 → 2/3/4 by ID; low-risk 0420 → 5; standard 0419 → 6.","Type set on all 8 items; priority selects sit on each change ticket's card panel."]},
 {id:"OBJ-H2",pillar:"P2",v:"h2",loc:"CHG-0421 → intake review + repair fields",
  text:"Repair CHG-0421's defective RFC end-to-end: missing elements, purpose, rollback, test plan, and the schema-vs-assignment call.",
  why:"A repaired RFC is the difference between a defensible change and an unexplainable outage. The schema-vs-assignment distinction decides how IPAM is updated at close: a new block rewrites the schema record.",
  hints:["Three required elements are missing per policy R1; the review checklist names them.","Purpose: align VLAN 40 to 10.40.20.0/24. Rollback: revert scope+gateway to 10.40.10.0/24. Test: sandbox AP pilot with client revert.","The schema-vs-assignment select sits next to the IPAM documentation field — this is a schema change."]},
 {id:"OBJ-H3",pillar:"P2",v:"h3",loc:"CHG-0418 → Risk & Impact gate · Evidence → Topology",
  text:"Map CHG-0418's full blast radius — every system riding the firewalls, distractors included.",
  why:"Over-scoping wastes window time; under-scoping blinds the window crew to real impact. Only traffic that traverses the firewall pair belongs on this list.",
  hints:["The topology shows who routes THROUGH FW-A/FW-B and who does not.","Both firewalls, the three depot tunnels, and remote-access VPN users — nothing else.","Core switch, APs, DNS server and phone VLAN are distractors: they share the rack, not the data path."]},
 {id:"OBJ-H4",pillar:"P3",v:"h4",loc:"DRIFT-0066 · Evidence → Configs + Logs",
  text:"Isolate the true drift among three config diffs and two noisy alerts: device, delta, classification, remediation — and dismiss the red herrings explicitly.",
  why:"Real floors drown you in diffs: one real drift (no RFC behind it), one cosmetic-but-approved banner change, one clean device, one unrelated link flap. The mark-reviewed actions force you to commit to which evidence matters and why.",
  hints:["Two diffs deserve dismissal: FW-B's banner cites an approved request; the flap alert cites a carrier ticket.","The drift lives on HQ-CORE-01: VLAN 66 “GUEST-TEMP” + Gi1/0/24, committed by j.moreau with NO RFC reference.","Classification: unauthorized change (configuration drift). Remediation: remediation request + revert to baseline/golden."]},
 {id:"OBJ-H5",pillar:"P4",v:"h5",loc:"CHG-0418 → rollback plan (sequencer)",
  text:"Build CHG-0418's rollback in exact order — six steps, no swaps.",
  why:"Rollback plans execute under stress at 03:00. The order is the safety logic: announce, shift traffic to the standby, fix one device at a time, return traffic, fix the other, then prove the pair and the tunnels are whole.",
  hints:["Never downgrade both firewalls at once — HA failover exists to keep one path alive.","1 announce → 2 fail over to FW-B → 3 downgrade FW-A → 4 fail back → 5 downgrade FW-B → 6 verify HA + tunnels.","Click the steps in order; the ordinals lock as you go."]},
 {id:"OBJ-H6",pillar:"P4",v:"h6",loc:"each ticket → Approval gate · policy R1/R2/R3",
  text:"Run the board with reasons: decision AND justification for every request — including deferring CHG-0422 until its rollback exists.",
  why:"Approvals without recorded reasons cannot survive an audit, and a redundancy build without a rollback plan is a new single point of failure wearing a safety costume. CHG-0422's plan field must be completed before its approval can stand.",
  hints:["CHG-0422 arrives without a rollback plan — complete its plan field (config revert) before approving.","Approve 0418/0420/0421 (after repair)/0422 (after plan), expedite 0423 via duty manager, reject 0424.","Each justification select must match the policy reason: tested fallback, sandbox pass, repaired RFC, incident path."]},
 {id:"OBJ-H7",pillar:"P3",v:"h7",loc:"DRIFT-0066 → detection sources panel",
  text:"Select every evidence source that can reveal an unauthorized change — and none that cannot.",
  why:"Detection engineering starts with source selection: config diffs prove WHAT changed, audit trails prove WHO and WHEN, inventory reconciliation catches undocumented hardware. SLA reports, heat maps and battery logs see none of it.",
  hints:["Ask of each source: could it ever show a change that no request explains?","Production-vs-baseline config diff, change/audit trail review, asset inventory reconciliation.","SLA availability report, Wi-Fi heat map and UPS battery log measure health — not change provenance."]},
 {id:"OBJ-H8",pillar:"P3",v:"h8",loc:"implemented tickets → Validated gates",
  text:"Validate the implemented changes — and catch the one that fails, executing its rollback.",
  why:"Validation is where a change is judged by telemetry, not by optimism. This night, dnsmasq 2.90 fails its lease regression: the correct move is the pre-planned rollback to 2.89, then documenting that the attempt failed and service stayed safe.",
  hints:["One deployment will report an anomaly instead of success — follow its console output.","Pick HA+VPN for 0418, LLDP for 0419, DNS sinkhole for 0423; when 0420's deploy fails, execute its rollback and validate lease stats on 2.89.","A rolled-back request still closes — documented as attempted, failed, reverted. That is the process winning."]},
 {id:"OBJ-H9",pillar:"P4",v:"h9",loc:"Documented gates + Evidence → Topology",
  text:"Execute the full documentation cascade with exact values: serial, IPAM schema record, topology link, firmware version.",
  why:"Documentation is the deliverable the auditor reads. Exact values — serials, CIDR blocks, image builds — are what separate a record you can trust from one that merely sounds complete.",
  hints:["Each Documented gate carries its field; the topology link activates on the diagram itself.","Serial SN-MFL-90377 · VLAN 40 → 10.40.20.0/24 schema v2 (schema change) · candidate uplink click · FPR-4.2.7-281.","Four updates, four exact values — near-misses like “4.2.7” or the old serial are rejected."]}
]};
const CONCEPT_ITEMS=[
 ["k1","Tracking who approved a firmware upgrade, when it ran, and where it is recorded","change"],
 ["k2","Comparing a switch's running configuration against its baseline/golden configuration","config"],
 ["k3","Planning replacement of a firewall that reaches end-of-support next quarter","lifecycle"],
 ["k4","A user asks for a VPN token for a new laptop","sr"]
];
const CONCEPT_OPTS=[["change","Change management"],["config","Configuration management"],["lifecycle","Life-cycle management"],["sr","Service request handling"]];
const QUIZ={
medium:[
 {q:"What is the PRIMARY purpose of change management?",t:"purpose of the process",
  o:["To make every change ship faster without review steps","To remove the need for changes by freezing the network","To reduce disruption risk while keeping the environment stable","To shift responsibility for network changes onto the end users"],c:2,
  e:"“Faster” and “freeze everything” are the two classic traps: the process trades a little speed for reliability, and it governs change rather than preventing it. Users never own network changes. The primary purpose is minimizing disruption risk while the environment stays stable and documented."},
 {q:"Which item is NOT normally required in a change request?",t:"RFC required elements",
  o:["Purpose, goal and scope","Rollback / backout plan","Affected systems and risk","The requester's password"],c:3,
  e:"R1 lists what a request must document — what will change, what it can break, and how to get back. The password is the odd one out: credentials never belong in tickets, where they are an audit and security finding of their own."},
 {q:"A firewall patch will run Saturday 02:00 after a full board review on Wednesday. Which change type is this?",t:"change types",
  o:["Standard","Normal","Emergency","Service request"],c:1,
  e:"Planned work with full review = normal. The distractors fail differently: standard would have skipped the board (pre-approved catalog), emergency would need an active incident, and a service request never enters the pipeline at all."},
 {q:"A failed access switch must be swapped for an identical model under a pre-approved catalog procedure. Which type is this?",t:"change types",
  o:["Standard","Normal","Emergency","Service request"],c:0,
  e:"Low risk + routine + already approved by policy = standard change. Normal would demand board time the catalog already saved; emergency needs an incident; the swap is a real change, not a service-desk ask."},
 {q:"A switch's running configuration differs from its baseline/golden configuration and no request matches. What is this?",t:"configuration drift",
  o:["A golden configuration update","A normal implementation artifact","An asset inventory error","Configuration drift needing investigation"],c:3,
  e:"Untracked divergence is configuration drift (policy R7). The diff shows WHAT changed, the audit trail shows WHO/WHEN — and a golden update or implementation artifact would have a request behind it, while an inventory error would not show in the config at all."},
 {q:"A change passed validation. What closes the loop before the request can be marked Closed?",t:"closing the loop",
  o:["Documentation updates plus recorded validation evidence","Nothing — monitoring alone is enough","An announcement email to all staff","Deleting the ticket from the queue"],c:0,
  e:"Policy R6 closes a request only after validation plus documentation — diagrams, inventory, IPAM/DNS. Monitoring shows the service works; the records let the next incident response and the next audit trust it. Announcements and deletions close nothing."}
],
hard:[
 {q:"Monday 10:00 — users report slowness. A junior admin asks to “just reboot the core switch now” with no request on file. What is the correct move?",t:"incident vs change lane",
  o:["Treat slowness as an incident; route fixes through change control","Approve the reboot verbally and move on to next work","File it as a standard catalog change with no review","Refuse all action until the next monthly change board meeting"],c:0,
  e:"Incident response and change management are different lanes: stabilize the service as an incident, and if a change is needed, use the emergency path — duty-manager approval now, retro-CAB within 24 h. Verbal approvals and catalog shortcuts are how drift is born; refusing all action leaves users degraded."},
 {q:"02:10 — the firmware upgrade fails mid-window and traffic is degraded. What executes FIRST?",t:"rollback executes first",
  o:["Update the asset inventory record","Keep troubleshooting the live fault","Execute the pre-planned rollback","Email the vendor for help"],c:2,
  e:"The window exists partly to give the rollback room: revert to the last known good state first, restore service, then analyze. Inventory updates, extended live troubleshooting and vendor email all come after service is safe — a plan only saves you if it runs before improvisation."},
 {q:"Which evidence BEST proves an unauthorized change occurred?",t:"drift evidence",
  o:["The quarterly SLA availability report for the service","A config diff plus the unmatched audit entry","A user satisfaction survey about the recent incidents","The Wi-Fi heat map survey from last month"],c:1,
  e:"Two artifacts, two questions: the diff shows WHAT changed; the unmatched audit entry shows WHO/WHEN with no request behind it. SLA reports, surveys and heat maps measure health or opinion — never change provenance."},
 {q:"An emergency change ran at 03:00 during a ransomware incident. What makes it compliant AFTERWARD?",t:"emergency compliance",
  o:["Nothing — emergencies are exempt from record-keeping duties","Removing the ticket so the queue stays perfectly clean","A new emergency change that undoes the original fix","Retroactive records and board review within 24 h"],c:3,
  e:"The expedite path compresses approval — it never deletes accountability (policy R3): notifications, records of what was done, and the board's retro-review keep the emergency auditable. Undoing the fix or deleting the record would hide an active security response."},
 {q:"A depot Wi-Fi VLAN moves to a new subnet block. In IPAM terms this is:",t:"IPAM schema vs assignment",
  o:["A schema change: the block design itself changed","An assignment change for the specific devices involved","Neither one: IPAM does not cover VLAN records","A hardware change recorded in the asset inventory"],c:0,
  e:"Schema = the design of address blocks and scopes; assignments = specific addresses given to specific devices. Re-blocking a VLAN rewrites the schema record, and the assignment records under it follow. IPAM absolutely covers VLANs, and no hardware is touched."},
 {q:"After replacing a failed switch with an identical model, which configuration source is correct, and why?",t:"backup vs golden configuration",
  o:["The golden template — the very newest approved design on file","Depot West's running config — it demonstrably works there","This device's backup config — its own last known good","Factory defaults — the safest possible starting point available"],c:2,
  e:"Golden configurations are approved templates used to CREATE device configs; a device's backup config preserves what THIS device actually ran — its exact port modes, VLANs and descriptions. A template or another switch's config silently drops port specifics; factory defaults throw the device's identity away."},
 {q:"Which sequence describes a correct normal change?",t:"the gates in order",
  o:["Window → request → approve → implement → validate → document → close","Implement → document → approve → request → schedule → validate → close","Approve → implement → request → window → validate → document → close","Request → plan → approval → window → implement → validate → document"],c:3,
  e:"The gates exist in that order on purpose: you cannot judge (approve) what has no plan, cannot schedule what is not approved, and cannot close what is neither validated nor documented. Every wrong option starts somewhere impossible — check where each one breaks."}
]};
const KNOWLEDGE=[
 ["1 · Why change management exists",
  `<p>Every unplanned modification to a network is a risk taken without a record. <b>${gi("change management")}</b> exists so that the people who own a service can weigh a change <i>before</i> it runs: what it is for, what it can break, when it is safest to do it, and how to undo it when it goes wrong. It is not paperwork for its own sake — it is the difference between an outage with a two-minute answer (“here is the request, the window, and the rollback”) and an outage with a two-day forensic hunt.</p>
   <p>The exam tests this as objective 3.1 (organizational processes and procedures) and expects you to know the request lifecycle, the change types, and how the process leaves a <b>${gi("audit trail")}</b> behind.</p>`],
 ["2 · The life of a request — and its types",
  `<p>A <b>${gi("change request (RFC)")}</b> walks eight gates: <b>intake → risk &amp; impact → approval → scheduled → implemented → validated → documented → closed</b>. What varies is how much scrutiny each gate applies, by type:</p>
   <table class="ktable"><tr><th>Type</th><th>Review</th><th>Typical example</th></tr>
   <tr><td><b>Standard</b></td><td>Pre-approved catalog, no board wait</td><td>Identical switch swap (SC-114)</td></tr>
   <tr><td><b>Normal</b></td><td>Full review + scheduled window</td><td>Firmware patch, re-addressing</td></tr>
   <tr><td><b>Emergency</b></td><td>Expedite now, retro-review ≤ 24 h</td><td>Ransomware C2 block</td></tr>
   <tr><td><b>Service request</b></td><td>Service desk — never a change</td><td>Laptop image, VPN token</td></tr></table>
   <p>Impact analysis (${gi("impact analysis")}) lists everything the change can touch; risk level (${gi("risk level")}) chooses the rules that apply, such as which ${gi("maintenance window")} a high-risk change may use.</p>`],
 ["3 · Tracking — statuses, audit trail, and the board",
  `<p>“Request process tracking” is the exam's phrase for the bookkeeping that makes all of the above verifiable: every request has an ID, a status that advances only through its gates, and an audit trail recording <b>who did what, when, under which request</b>. The ${gi("change board / CAB")} approves, defers or rejects normal changes; emergency changes get a duty-manager approval now and a retroactive board review within the policy deadline.</p>
   <p>Tracking is also how you spot the thing that <i>should not exist</i>: a configuration commit with no matching request. That observation is the heart of the drift investigation in this lab.</p>`],
 ["4 · The configuration trio — and drift",
  `<p>Three configurations do three jobs. The <b>production configuration</b> is what the device runs now. The <b>backup configuration</b> is this device's own last known good state — the restore source after hardware replacement. The <b>${gi("baseline / golden configuration")}</b> is the approved reference: golden is the template a config is <i>built</i> from, baseline is what THIS device was approved to run.</p>
   <p>Compare production against baseline on a schedule (configuration monitoring) and any unexplained difference is <b>${gi("configuration drift")}</b> — the fingerprint of an ${gi("unauthorized change")}. Drift is remediated through the process: a remediation request, a revert to baseline, and a documentation correction.</p>`],
 ["5 · Neighbors: life-cycle management &amp; service requests",
  `<p><b>Life-cycle management</b> is the long view: patches and bug fixes, OS and firmware versions, and the ${gi("EOL / EOS")} dates that decide when equipment is planned for replacement or <b>decommissioning</b>. Every item on that roadmap reaches the network <i>as a change request</i> — the two processes hand work to each other.</p>
   <p>A <b>${gi("service request")}</b> is not a change at all: laptops, tokens, access asks. Routing it into the change pipeline wastes the board's judgment; routing a change into the service desk loses control of it. Knowing the boundary is a tested skill.</p>`]
];
const DEBRIEF={
 detection:["Detection opportunities",
  `<ul>
   <li><b>Configuration monitoring</b> — scheduled diff of production vs. baseline/golden configs; a hash mismatch with no matching request is drift.</li>
   <li><b>Audit trail review</b> — every config-commit must carry an RFC reference; “no RFC reference” is the alarm.</li>
   <li><b>Asset inventory reconciliation</b> — serials and versions in the rack vs. the record; the re-addressed VLAN must appear in IPAM.</li>
   <li><b>Syslog / telemetry</b> — validation signals (HA failover, tunnel state, lease renewals, VRRP, sinkhole hits) prove changes worked; anomalies prove they didn't.</li>
  </ul>`],
 mitigation:["Mitigation playbook",
  `<ul>
   <li><b>Make the request complete before it can advance</b> — purpose/scope, affected systems, risk, window, rollback, test plan (policy R1 here).</li>
   <li><b>Gate by type:</b> catalog for standard, board for normal, duty-manager + retro-review ≤ 24 h for emergency.</li>
   <li><b>Windows that fit the risk:</b> high-risk = weekend overnight ≥ estimate + rollback time; sandbox before production wherever possible.</li>
   <li><b>Close only after validation + documentation</b> (diagrams, inventory, IPAM/DNS) — and treat drift as a fault remediated through the process, never silently.</li>
  </ul>`],
 blue:["Blue-team takeaways",
  `<ul>
   <li>The rollback plan is written <i>before</i> the window and rehearsed; at 02:10 you execute, you don't compose.</li>
   <li>Validate with telemetry that maps to the service, not to the task: tunnels for firewall work, leases for DHCP, LLDP for switching, sinkhole hits for blocks.</li>
   <li>Rejected requests are a success of the process — CHG-0424 gets coached and re-planned, not sneaked in.</li>
   <li>Documentation is part of the change, not an afterthought: the two-day auditor hunt in the briefing is what skipping it costs.</li>
  </ul>`],
 red:["Red-team mindset",
  `<ul>
   <li>“I'm just making a quick change” is the sound of an audit gap being born — attackers and shadow IT both exploit trust in change records.</li>
   <li>Defense evasion loves the process gap: a commit outside the window with no RFC is indistinguishable from a breach IOC until someone checks the audit trail.</li>
   <li>Canary for defenders: your config-monitor hash alert + audit trail is a free intrusion-detection control — tune it and answer it fast (this lab's DRIFT-0066 case).</li>
  </ul>`]
};
const NEXT_LOC={}; Object.keys(OBJECTIVES.medium).forEach(k=>{const o=OBJECTIVES.medium[k];NEXT_LOC[o.id]=o.loc;});
