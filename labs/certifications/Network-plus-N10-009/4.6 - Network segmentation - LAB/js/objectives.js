/* The Flat Net Incident — static build (N10-009 4.6).
   js/objectives.js — Objective definitions and CHECK RESULTS rules (M/H tracks).
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
function O(id,st,pill,title,why,hints,check,hard){
  return {id:id,st:st,p:pill,title:title,why:why,hints:hints,check:check,hard:!!hard};
}
function ruleKey(r){ return r.a+"|"+r.s+">"+r.d+"|"+r.v; }
function reqKey(p){ return p[0]+"|"+p[1]+">"+p[2]+"|"+p[3]; }
function hasRule(rules,key){ return rules.some(function(r){return ruleKey(r)===key;}); }
function broadAllowError(rules){
  var bad=[];
  rules.forEach(function(r){ if(r.a==="allow"&&(r.s==="IoT"||r.s==="GST")&&r.d!=="INT") bad.push(r.s+"→"+r.d); if(r.a==="allow"&&r.s==="CRP"&&r.d==="L2") bad.push("CRP→L2"); });
  return bad;
}
var M_RULES = [
  ["deny","IoT","ALL","any"],["deny","GST","ALL","any"],
  ["deny","BYD","L1","any"],["deny","BYD","L2","any"],["deny","BYD","L3","any"],
  ["deny","L1","INT","any"],
  ["allow","IIoT","L2","mqtt"],["allow","L2","L1","modbus"]
];
var H_RULES = M_RULES.concat([
  ["allow","CRP","L35","https"],["allow","L35","L2","mqtt"],["allow","L2","L3","bacnet"]
]);
function rulesMsg(rules,req){
  var missing = req.filter(function(k){return !hasRule(rules,k);});
  var broad = broadAllowError(rules);
  var m = "";
  if(missing.length) m += "Missing required rules: "+missing.map(function(k){var p=k.split("|");return p[1].replace(">"," → ")+" ("+p[0]+(p[2]!=="any"?" "+p[2]:"")+")";}).join("; ")+". ";
  if(broad.length) m += "Near-miss rejected: broad allow rule(s) "+broad.join(", ")+" would reintroduce the exact pivot path this policy exists to kill — a 'read-only' allow is still a route. Default-deny plus the listed exceptions is the whole design.";
  if(!m) m = "Every required gate is in place and nothing punches a hole through it. This is M1030's deny-by-default in action: anything not on the list dies at the boundary, and the attacker's chain from the briefing now stops at the first gate.";
  return {ok:!missing.length&&!broad.length, msg:m};
}
var OBJECTIVES = [
  /* ---------- MEDIUM ---------- */
  O("M1",1,"U","Mark the four outcomes segmentation actually delivers","Segmentation is sold with myths attached. Pick the real value propositions before you redesign anything.",
    ["Read each card as a promise. Which promises can a network boundary actually keep?",
     "Think blast radius: what does a boundary contain, shrink or keep local? What does it NOT do?",
     "Select b1, b2, b3 and b4 — containment, attack surface, performance, compliance. It cannot patch, block email, or replace inventory."],
    function(s){ var pick=s.picks.M1||[]; var ok = pick.length===4 && ["b1","b2","b3","b4"].every(function(x){return pick.indexOf(x)>=0;});
      return {ok:ok, msg: ok ? "Correct — containment, attack-surface reduction, local performance and compliance scope are the real returns. Segmenting does NOT patch devices, filter phishing, or replace inventory: zones make failures visible, they do not make them impossible."
        : "Not the right four. A zone boundary contains breaches, shrinks reachable attack surface, keeps chatter local and shrinks audit scope — but it cannot patch devices (b5), stop phishing delivery (b6, that is T1566 at Initial Access) or replace inventory (b7). Deselect the myths."}; }, false),
  O("M3",2,"U","Match all six device classes to their definitions","The exam terms IoT, IIoT, SCADA/ICS, OT, guest and BYOD look similar but name different worlds. Nail the vocabulary first.",
    ["Each definition names WHO owns the device and WHERE it acts. Consumer end devices vs industrial instrumentation vs control stack vs physical-process tech vs visitor vs employee-owned.",
     "IIoT = sensors feeding plant data. SCADA/ICS = PLCs/RTUs/HMIs. OT = anything acting on physical processes (HVAC, fire, badge).",
     "Answers in order: IoT, IIoT, SCADA/ICS, OT, Guest, BYOD."],
    function(s){ var m=s.defMatch||{}; var ok = DEFS.every(function(d){return m[d[0]]===d[0];});
      return {ok:ok, msg: ok ? "Vocabulary locked. Watch the subtle pair: SCADA/ICS is the control stack (PLCs, RTUs, HMIs); OT is broader — the refrigeration controller and fire panel are OT, not ICS."
        : "Some pairs are off. The classic trap: 'OT' is broader than SCADA/ICS — the HVAC, refrigeration and fire controllers act on physical processes but are not part of the SCADA stack. Re-check the matching."}; }, false),
  O("M2",2,"U","Mark which attacker behaviors M1030 officially limits — and name the mitigation ID","Tie the lesson to its MITRE anchor: M1030 Network Segmentation officially addresses specific techniques.",
    ["M1030's table includes discovery and post-compromise behaviors. Delivery tricks and removable media are not in it.",
     "T1046 (scanning), T1210 (exploiting remote services), T1021.001 (RDP) and T1565.003 (runtime data manipulation) ARE listed; T1566 (phishing) and T1091 (removable media) are NOT.",
     "Select the four techniques and type M1030."],
    function(s){ var pick=s.picks.M2||[]; var id=(s.midInput||"").toUpperCase().replace(/[\s-]/g,"");
      var ok = pick.length===4 && ["t1","t2","t3","t4"].every(function(x){return pick.indexOf(x)>=0;}) && /^M1030$/.test(id);
      return {ok:ok, msg: ok ? "M1030 Network Segmentation officially addresses T1046, T1210, T1021.001 and T1565.003 — the scan, the remote-service pivot and the runtime manipulation you are about to reconstruct. Phishing (T1566) is Initial Access, and removable media (T1091) crosses even air gaps, so segmentation alone never claims them."
        : "Check the official M1030 mapping: it addresses T1046, T1210, T1021.001 and T1565.003. Phishing (T1566) happens at Initial Access — before segmentation helps — and T1091 rides removable media across physical gaps. And the mitigation ID is M1030."}; }, false),
  O("M4",3,"R","Classify the 12 flagged devices from their attributes","The inventory shows protocols, locations and owners — but no trust class. Assign each flagged device its chapter class.",
    ["Who owns it and what does it act on? Cameras/TVs/copiers/thermostats = IoT. Sensors feeding plant data = IIoT. Anything driving machinery = SCADA/ICS.",
     "fridge-ctl, fire-panel act on physical processes but are NOT part of the SCADA stack — that is exactly OT. Visitor devices = Guest; employee-owned = BYOD.",
     "cam-lobby and cam-dock: IoT · meter-power and sensor-vib: IIoT · plc-pasteur, rtu-tank, hmi-line: SCADA/ICS · fridge-ctl, fire-panel: OT · vis-laptop: Guest · phone-sales, lap-byod: BYOD."],
    function(s){ var t=s.tags||{}; var bad=TAGSET.filter(function(id){return t[id]!==DEV[id].cls;});
      return {ok:bad.length===0, msg: bad.length? ("Not yet — re-check: "+bad.slice(0,4).map(function(id){return DEV[id].n;}).join(", ")+(bad.length>4?"…":"")+". Ask: who owns it, what does it act on, is it part of the supervisory stack?") : "All 12 classified. The hard ones were fridge-ctl and fire-panel: they act on physical processes (OT) without being part of the SCADA/ICS stack — exactly the boundary the exam draws."}; }, false),
  O("M5",3,"R","Reconstruct the breach: entry, method, pivot, action, target","Work the evidence like an incident responder and rebuild the five key links of the chain.",
    ["Start at 02:13 in the flow logs. What device was exposed, and how did the attacker authenticate?",
     "Follow the sweep at 02:31 to the SMB session at 02:47, then the Modbus write at 03:02, then the blocked-by-luck attempt at 03:05.",
     "cam-lobby · default credentials on an internet-exposed camera · hmi-line · Modbus fc6 write to setpoint register 40108 · fridge-ctl."],
    function(s){ var a=s.breach||{}; var ok = BREACH_Q.slice(0,5).every(function(q){return a[q.id]===q.ans;});
      return {ok:ok, msg: ok ? "Chain reconstructed: exposed camera → default credentials → HMI via SMB → Modbus setpoint write → refrigeration attempt. Three different trust classes crossed in 54 minutes — on one VLAN, with zero gates in the way."
        : "One or more links are wrong. Read the NetFlow and Modbus artifacts in order: 02:13 (auth method), 02:31 (sweep source), 02:47 (SMB target), 03:02 (what kind of Modbus message), 03:05 (what was attempted next)."}; }, false),
  O("M6",3,"R","Tag the four policy-violating lines in the as-built configs","The configs themselves confess. Click the four lines that directly violate segmentation policy.",
    ["One line lets devices punch inbound holes. One publishes a camera to the internet. One puts 48 ports in one broadcast domain. One bridges guest Wi-Fi into that same domain.",
     "Ignore hardening-adjacent lines that are actually fine (HTTPS management, RSTP, established-session permits).",
     "Tag: 'upnp enable', the static NAT to 10.44.1.51:554, 'switchport access vlan 1' on all 48 ports, and the guest 'wlan bridging vlan 1'."],
    function(s){ var t=s.tagged||{}; var sel=Object.keys(t).filter(function(k){return t[k];});
      var ok = M6_SET.every(function(x){return sel.indexOf(x)>=0;}) && sel.length===M6_SET.length;
      return {ok:ok, msg: ok ? "All four as-built failures tagged: uPnP, an inbound port-forward to a camera, 48 ports on VLAN 1, and guest Wi-Fi bridged into it. Together they are the whole incident in four lines."
        : "The set is not exactly the four policy breaks. Lines that merely look dated (HTTPS server, RSTP, established permits) are not violations. Find: the inbound-hole enabler, the camera exposure, the flat VLAN, and the guest bridge."}; }, false),
  O("M7",5,"D","Pick the four data sources that expose zone-policy violations","Detection starts with the right telemetry. Which four sources actually see segmentation failures?",
    ["Violations live at zone gates and at admission points: flows crossing boundaries, devices joining, wireless associations, and unsafe protocol writes.",
     "If a source cannot tell you WHICH zone a packet came from or whether a device was admitted, it cannot see a zone violation.",
     "Select: zone-gate firewall/NetFlow, NAC/802.1X logs, wireless controller logs, OT protocol audit. Toner, social media and thermostat schedules see none of this."],
    function(s){ var pick=s.sources||[]; var ok=pick.length===4 && ["d1","d2","d3","d4"].every(function(x){return pick.indexOf(x)>=0;});
      return {ok:ok, msg: ok ? "Right four. Zone-gate flow logs show policy violations as events; NAC logs show unadmitted devices; wireless logs show rogue associations; OT protocol audits show unsafe writes like the fc6. Together they cover the whole failure surface."
        : "Not those. Ask of each source: can it see a packet crossing a zone boundary, a device being admitted, or a protocol write? Toner levels, social feeds and thermostat schedules cannot — drop them."}; }, false),
  O("M8",5,"D","Triage six alerts: verdict plus the correct reason","Six alerts from the incident window. Mark each as a true policy violation or a false positive — and say why.",
    ["Two herrings are vendor-ish habits (hourly telemetry, a nightly bulk transfer). One alert is expected IIoT traffic once the design is right.",
     "True violations: an untrusted-zone sweep, a guest device touching ERP, and a control-zone device calling the internet.",
     "A1 true/lateral · A2 false/telemetry · A3 true/guest · A4 false/backup · A5 true/egress · A6 false/expected IIoT path."],
    function(s){ var a=s.alerts||{}; var ok=ALERTS.every(function(al){return a[al.id]&&a[al.id].verdict===al.verdict&&a[al.id].reason===al.reason;});
      return {ok:ok, msg: ok ? "Clean triage. Note the pattern: violations cross a trust boundary (sweep, guest→ERP, PLC→internet); benign flows stay within their expected path (telemetry out, backup inside IT, IIoT→historian). That is exactly how gate-based detection stays quiet."
        : "Some verdicts or reasons are off. Ask per alert: does this flow cross a trust boundary it should never cross (true), or does it sit on an expected path (false: brewer telemetry, nightly backup, IIoT→historian)?"}; }, false),
  O("M9",4,"M","Build the eight gate rules that enforce the core policy","Deny-by-default (M1030) plus eight exceptions. Build the rule set on the Zone Board, then check it here.",
    ["First deny every untrusted class from going internal; then deny L1 reaching the internet; then allow exactly two protocol-specific exceptions.",
     "Untrusted classes: IoT and Guest (deny to ALL internal), BYOD (deny to L1/L2/L3). Then L1→INTERNET deny. Allows: IIoT→L2 MQTT, L2→L1 Modbus.",
     "Set: deny IoT→ALL(any) · deny GST→ALL(any) · deny BYD→L1/L2/L3(any) · deny L1→INT(any) · allow IIoT→L2(mqtt) · allow L2→L1(modbus)."],
    function(s){ return rulesMsg(s.rules||[], M_RULES.map(reqKey)); }, false),
  O("M10",4,"M","Assign every device tile to its correct zone","The redesign core: pull all 29 movable tiles out of FLATNET and land them in the zone the chapter prescribes for their class.",
    ["The zone usually equals the device class: IoT devices→IoT zone, sensors→IIoT, control gear→L1/L2, building tech→L3, visitors→Guest, personal→BYOD, managed IT→Corporate.",
     "The two DMZ hosts are pre-placed and locked. Every other tile has a select — work zone by zone.",
     "Check classes in the Evidence Locker if unsure: fridge/fire/badge/bms → L3; HMI/historian/eng-ws → L2; PLCs/RTU → L1."],
    function(s){ var z=s.zones||{}; var bad=MOVESET.filter(function(id){return (z[id]||"FLAT")!==DEV[id].z;});
      return {ok:bad.length===0, msg: bad.length? ("Not aligned yet — "+bad.length+" tile(s) still off-target (e.g. "+(DEV[bad[0]]?DEV[bad[0]].n:bad[0])+" should sit in "+ZONE[DEV[bad[0]].z].name+").") : "Full zoning achieved: 29 devices live in nine purpose-built zones behind nine gates. The flat trunk is empty — blast radius now stops at the first boundary."}; }, false),
  O("M11",5,"M","Match seven zone needs to the right control","Each need has one best-fit control from the toolbox. Match all seven.",
    ["Portal+isolation for guest; MDM for BYOD admission; NAC/802.1X for unknown wired devices; protocol-aware firewall for PLC writes.",
     "Corporate-to-historian without routes into L2 = jump server in the DMZ. Cameras calling home = egress allow-list. Legacy OT visibility without active scanning = passive monitor.",
     "K1 captive · K2 mdm · K3 nac · K4 icsfw · K5 jump · K6 egress · K7 passive."],
    function(s){ var c=s.controls||{}; var bad=NEEDS.filter(function(n){return c[n.id]!==n.ans;});
      return {ok:bad.length===0, msg: bad.length? ("Not matched yet — "+bad.length+" need(s) still mispaired.") : "All seven matched. Notice none of the needs wanted 'more antivirus': segmentation controls are about admission, boundaries and visibility — admission (NAC/MDM/portal), boundaries (ICS firewall, jump server, egress filter) and visibility (passive monitor)."}; }, false),
  O("M12",5,"M","Decide the refrigeration controller's treatment — and name the residual risk","fridge-ctl is legacy, food-safety critical, and was the attacker's final target. Pick the correct treatment bundle.",
    ["Availability first: production cannot stop. But 'no change' is negligence and 'shut it down' is an outage.",
     "The right bundle keeps it running, moves it behind the L3 boundary, watches it passively, and books a maintenance-window patch.",
     "Select f1, f2, f3 and f4. Reject f5 (self-inflicted outage) and f6 (leaves the attacker's target untouched)."],
    function(s){ var pick=s.fridge||[]; var ok=pick.length===4 && ["f1","f2","f3","f4"].every(function(x){return pick.indexOf(x)>=0;});
      return {ok:ok, msg: ok ? "That is the OT playbook: keep the process alive (availability-first), isolate behind the boundary, monitor passively, patch in a window. Residual risk you must still carry: until the patch lands, the controller remains legacy firmware inside a watched cage — segmentation reduces its blast radius; it does not make the vulnerability disappear."
        : "Wrong bundle. Two traps: f5 turns a security fix into a production outage, and f6 leaves the exact device the attacker targeted untouched. Keep it running, isolate it, monitor it, patch it in a window."}; }, false),
  /* ---------- HARD ---------- */
  O("H1",3,"R","Reconstruct the full kill chain — seven fields, strict","From the raw evidence, rebuild the chain and reason about it like a defender: entry, method, pivot, action, target, tactic, root cause.",
    ["The evidence locker holds every answer: flows, Modbus audit, configs.",
     "Two fields go beyond the story: the ATT&CK tactic of the camera→HMI hop, and the structural reason every hop worked.",
     "cam-lobby · default credentials · hmi-line · Modbus fc6 write 40108 · fridge-ctl · Lateral Movement · Flat VLAN 1 — no zone gates existed."],
    function(s){ var a=s.breach||{}; var ok=BREACH_Q.every(function(q){return a[q.id]===q.ans;});
      return {ok:ok, msg: ok ? "Full reconstruction accepted. The tactic answer matters: camera→HMI was Lateral Movement — segmentation's home turf (M1030). The root cause answer matters more: not weak Wi-Fi, not missing antivirus — the flat VLAN meant there was nothing to cross." : "Rejected — exact values required. Every field is answerable from the artifacts: check the flow table (02:13/02:31/02:47), the Modbus audit (03:02), the attempted target (03:05), then reason about tactic and root cause."}; }, true),
  O("H2",3,"R","Tag all six policy-violating lines — and know what each endangers","Six lines across four configs directly violate segmentation policy. Tag exactly those six.",
    ["Four are the Medium set; two more hide in the wireless and Modbus configs.",
     "The wireless one is about admission control, not bridging. The Modbus one is about who may WRITE.",
     "r1, r2, s4, w2, w4 (shared PSK, no 802.1X/MDM), m3 (HMI write to PLC)."],
    function(s){ var t=s.tagged||{}; var sel=Object.keys(t).filter(function(k){return t[k];});
      var ok=H2_SET.every(function(x){return sel.indexOf(x)>=0;}) && sel.length===H2_SET.length;
      return {ok:ok, msg: ok ? "Six for six. Each endangers a different class: uPnP+port-forward expose IoT; VLAN 1 flattens every class into one blast radius; the guest bridge betrays visitors; the shared PSK admits unmanaged BYOD; the HMI write endangers the whole ICS stack." : "Not the exact six. Re-scan the wireless config for the ADMISSION failure (a shared PSK) and the Modbus audit for the WRITE from a host that is not eng-ws. Cosmetic or correct lines (HTTPS server, RSTP, eng-ws writes) are not violations."}; }, true),
  O("H9",3,"D","Mark all eight noisy flows: violation or benign","The Hard evidence table mixes six violations with two legitimate-but-noisy flows. Verdict every row — the herrings cost you if mislabeled.",
    ["Ask of every row: does it cross a trust boundary it must never cross?",
     "Two rows are real operational traffic: a vendor reorder API and the runbook backup. They LOOK sinister in a flat net.",
     "N1-N6 are violations (sweep, SMB pivot, Modbus write, guest→ERP, BYOD→HMI, PLC egress). N7 (brew telemetry) and N8 (backup) are benign."],
    function(s){ var n=s.noisy||{}; var ok=NOISY.every(function(r){return n[r.id]===((r.v)?"v":"b");});
      return {ok:ok, msg: ok ? "All eight verdicted. The two benign rows are the lesson: in a segmented net they would be visible, allow-listed and quiet — in the flat net they drown the six real violations. Noise is a segmentation failure too." : "Some verdicts are wrong. Re-check N5 (a personal BYOD laptop RDP-ing into the HMI is a textbook violation) and remember the runbook backup (N8) and brewer telemetry (N7) are legitimate."}; }, true),
  O("H3",4,"M","Full redesign: every device zoned AND the complete 11-rule policy","The commissioning exam: zone all 29 movable tiles and write the complete policy — the 8 core gates plus the 3 brokered paths for IIoT telemetry, corporate historian reads and L2 BACnet collection.",
    ["Start from the 8-rule core (deny untrusted classes, deny L1→internet, allow IIoT→L2 MQTT and L2→L1 Modbus).",
     "Add the brokered paths: CRP→L35 HTTPS (to the jump server), L35→L2 MQTT (historian reads), L2→L3 BACnet (collection via bms-gw).",
     "All 11: deny IoT→ALL · deny GST→ALL · deny BYD→L1/L2/L3 · deny L1→INT · allow IIoT→L2(mqtt) · allow L2→L1(modbus) · allow CRP→L35(https) · allow L35→L2(mqtt) · allow L2→L3(bacnet)."],
    function(s){ var z=s.zones||{}; var bad=MOVESET.filter(function(id){return (z[id]||"FLAT")!==DEV[id].z;});
      var r=rulesMsg(s.rules||[], H_RULES.map(reqKey));
      var ok = bad.length===0 && r.ok;
      var m = bad.length ? "Zoning incomplete: "+bad.length+" tile(s) not in target zones. Fix zoning first — rules on a half-moved network enforce nothing." : r.msg;
      return {ok:ok, msg:m}; }, true),
  O("H4",4,"M","Resolve the historian conflict WITHOUT broad allows","Corporate analysts demand historian dashboards. Someone proposes: allow CRP→L2. That single rule quietly rebuilds the attacker's highway. Broker it instead.",
    ["The DMZ exists precisely for this: corporate talks TO the DMZ, the DMZ talks to L2. No rule ever spans CRP→L2.",
     "Two rules, two hops: allow CRP→L35 (HTTPS) and allow L35→L2 (MQTT).",
     "Required: the brokered pair present; a CRP→L2 allow absent. Any broad allow is rejected with rationale."],
    function(s){ var rules=s.rules||[]; var pairOK = hasRule(rules,"allow|CRP>L35|https") && hasRule(rules,"allow|L35>L2|mqtt");
      var broad = broadAllowError(rules).some(function(x){return x==="CRP→L2";});
      return {ok:pairOK&&!broad, msg: pairOK&&!broad ? "Brokered correctly: CRP→L35→L2 gives analysts their dashboards while CRP and L2 never share a direct route — the jump server owns that boundary. This is M1030's DMZ measure doing real work." : (broad ? "Rejected: an allow CRP→L2 rule makes the corporate zone directly routable into supervisory space — one phishing click on a finance workstation and the attacker is back on the highway to the HMI. Delete it and broker through L3.5 instead." : "The brokered pair is incomplete: you need allow CRP→L35 (https) AND allow L35→L2 (mqtt), and no CRP→L2 allow at all.")}; }, true),
  O("H5",5,"M","Sequence the legacy-PLC rollout (4 of 7 steps, exact order)","plc-line1 runs 2011 firmware and cannot be patched in place during production. Order the four correct moves from the seven candidates.",
    ["Availability first: shutting production down is sq1, and vendor remote access is sq6 — both are traps.",
     "The safe arc: preserve knowledge → isolate → watch → patch on schedule.",
     "sq2 (offline backups) → sq3 (deny-by-default microsegment) → sq4 (passive monitoring) → sq5 (maintenance-window patch)."],
    function(s){ var q=s.seq||{}; var ok=SEQ_ANS.every(function(id,i){return q[String(i+1)]===id;});
      return {ok:ok, msg: ok ? "Sequence accepted: back up, isolate, monitor, patch in a window. Residual risk you carry: the PLC stays vulnerable until sq5 lands — the microsegment and the setpoint-change alerts are the compensating controls that make that window survivable." : "Order rejected. sq1 sacrifices production and sq6 rebuilds the attacker's door — both stay unused. The defensible arc preserves knowledge first (backups), shrinks reach (isolation), adds eyes (passive monitoring), then patches on schedule."}; }, true),
  O("H6",5,"D","Build the zone-gate detection and whitelist the two benign flows","Detection engineering: select the four conditions that catch policy violations without flooding the SOC, then whitelist the two known-benign flows.",
    ["Good conditions share one shape: a flow crossing a boundary it should never cross, or a write from a host with no write rights, or a device never admitted.",
     "Two candidates are noise generators: 'any BACnet' (fires on every legit OT packet) and 'flow > 1 GB' (fires on backups, misses scans).",
     "Select c1, c2, c3 and c6; whitelist A2 (brewer telemetry) and A4 (nightly backup)."],
    function(s){ var c=s.conds||[]; var w=s.whitelist||[];
      var ok=c.length===4 && ["c1","c2","c3","c6"].every(function(x){return c.indexOf(x)>=0;}) && w.indexOf("A2")>=0 && w.indexOf("A4")>=0 && w.length===2;
      return {ok:ok, msg: ok ? "Detection accepted. c1/c3 catch boundary crossings, c2 catches unauthorized Modbus writes, c6 catches unadmitted devices — and whitelisting A2/A4 keeps the SOC's trust. That is a tuned, explainable rule set, not a noise machine." : "Not there yet. c4 and c5 are noise traps — 'any BACnet' fires on legitimate OT every second and '> 1 GB' alarms on the backup while missing a 200-packet sweep. The good set is c1, c2, c3, c6 with exactly A2 and A4 whitelisted."}; }, true),
  O("H7",5,"M","Hardened guest and BYOD wireless config (10 exact settings)","Rebuild the wireless controller: every guest and BYOD switch and VLAN must land in its hardened state.",
    ["Guest: portal on, isolation on, bandwidth cap on, LAN access OFF, VLAN GST. BYOD: 802.1X on, PSK off, MDM check on, certificates on, VLAN BYD.",
     "The two OFF switches matter as much as the ON ones — a wrong 'allow' is a policy hole.",
     "Guest: portal✓ iso✓ cap✓ lan✗ vlan=GST · BYOD: 8021x✓ psk✗ mdm✓ cert✓ vlan=BYD."],
    function(s){ var w=s.wlan||{};
      var needOn=["g-portal","g-iso","g-cap","b-8021x","b-mdm","b-cert"], needOff=["g-lan","b-psk"];
      var ok = needOn.every(function(x){return w[x]===true;}) && needOff.every(function(x){return w[x]!==true;}) && w["g-vlan"]==="GST" && w["b-vlan"]==="BYD";
      return {ok:ok, msg: ok ? "Wireless hardened. Guests are internet-only behind a portal; BYOD devices must authenticate (802.1X), prove management (MDM) and carry certificates before they even associate — and neither class touches VLAN 1 again." : "Config rejected — exact state required. Compare every switch: guest portal/isolation/cap ON, guest LAN access OFF (untouched counts as OFF), BYOD 802.1X/MDM/cert ON, shared PSK OFF, and both VLAN selects moved off FLAT."}; }, true),
  O("H8",5,"M","Pick the one best control for three scenarios","Three scenarios, one best control each from the toolbox. Justification is built into the feedback.",
    ["Each scenario names its constraint: impossible return path, work/personal separation, outbound-only reach.",
     "Match the constraint to the control mechanism, not to the loudest brand name.",
     "P1 diode · P2 mdm (containerization) · P3 egress allow-list."],
    function(s){ var p=s.picksH8||{}; var ok=PICKS.every(function(x){return p[x.id]===x.ans;});
      return {ok:ok, msg: ok ? "Three for three. The diode makes a return path physically impossible (stronger than any rule); containerization is what actually separates work from personal on BYOD; egress allow-listing constrains a chatty IoT class to exactly its vendor." : "Some picks are off. P1's key words are 'NO possible return path' — only the data diode promises that. P2 is about separation on the device itself → MDM/containerization. P3 is about outbound destinations → egress filtering."}; }, true)
];
