/* The Flat Net Incident — static build (N10-009 4.6).
   js/data.js — Lab content data: zones, devices, configs, alerts, evidence,
   quiz bank, glossary, case links, timeline. No logic.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* =====================================================================
   THE FLAT NET INCIDENT — CompTIA Network+ N10-009 Objective 4.6
   Network segmentation: IoT, IIoT, SCADA, ICS, OT, guest, BYOD.
   100% synthetic training data. MITRE anchors verified 2026-11-09.
   ===================================================================== */
var LS_KEY = "flatnet-lab-v2";

var ZONES = [
  {id:"FLAT", name:"FLATNET (VLAN 1)", color:"#e2695e", desc:"As-built: every port on VLAN 1 — one broadcast domain, no gates."},
  {id:"IoT",  name:"IoT Zone",         color:"#45b8a8", desc:"Consumer and smart devices. No lateral routes; egress allow-list only."},
  {id:"IIoT", name:"IIoT Sensor Zone", color:"#9cbf66", desc:"Industrial sensors. One monitored northbound path to the historian."},
  {id:"L1",   name:"L1 Process Control (ICS)", color:"#e0685a", hazard:true, desc:"PLCs and RTUs. Writes only from the engineering workstation."},
  {id:"L2",   name:"L2 Supervisory (SCADA)",   color:"#e3a23c", hazard:true, desc:"HMI, historian, engineering workstation."},
  {id:"L3",   name:"L3 OT / Site Ops",         color:"#c98a4b", hazard:true, desc:"HVAC, refrigeration, fire, badge, BMS gateway. Passive monitoring."},
  {id:"L35",  name:"L3.5 IT/OT DMZ",           color:"#7aa7e8", desc:"Jump server and patch staging — the only broker between IT and OT."},
  {id:"GST",  name:"Guest Zone",       color:"#b39ae0", desc:"Internet-only. Captive portal + client isolation."},
  {id:"BYD",  name:"BYOD Zone",        color:"#d884b8", desc:"Personal devices, MDM-checked, containerized work apps."},
  {id:"CRP",  name:"Corporate (L4)",   color:"#6f9fc8", desc:"Managed IT endpoints and servers."}
];
var ZONE = {}; ZONES.forEach(function(z){ ZONE[z.id]=z; });
var ZOPTS = ZONES.filter(function(z){return z.id!=="FLAT";}).map(function(z){return z.id;});

/* cls: iot | iiot | ics | ot | gst | byd | corp ; infra items locked in place */
var DEVICES = [
  {id:"cam-lobby",  n:"Lobby Dome Camera",        ip:"10.44.1.51",  p:"RTSP/ONVIF", loc:"HQ lobby",        cls:"iot",  z:"IoT", tag:true, note:"BREACH ENTRY — vendor default credentials, exposed by uPnP port-forward"},
  {id:"cam-dock",   n:"Dock PTZ Camera",          ip:"10.44.1.52",  p:"RTSP",       loc:"Loading dock",    cls:"iot",  z:"IoT", tag:true, note:"Same unpatched firmware family as the lobby camera"},
  {id:"tv-lobby",   n:"Lobby Smart TV",           ip:"10.44.1.53",  p:"HTTPS/DIAL", loc:"HQ lobby",        cls:"iot",  z:"IoT", note:"Auto-updates from vendor cloud"},
  {id:"mfp-hq",     n:"HQ MFP Copier",            ip:"10.44.1.54",  p:"IPP/LDAP",   loc:"Print room",      cls:"iot",  z:"IoT", note:"Scan-to-email stores domain credentials in its web UI"},
  {id:"thermo-hq",  n:"Smart Thermostat",         ip:"10.44.1.55",  p:"MQTT/TLS",   loc:"HQ west wing",    cls:"iot",  z:"IoT", note:"Cloud-controlled HVAC endpoint"},
  {id:"brew-smart", n:"Breakroom Smart Brewer",   ip:"10.44.1.56",  p:"HTTPS",      loc:"Breakroom",       cls:"iot",  z:"IoT", note:"Phones home hourly for bean reorders (red herring traffic)"},
  {id:"meter-power",n:"Plant Power Meter",        ip:"10.44.2.11",  p:"MQTT",       loc:"MCC room",        cls:"iiot", z:"IIoT", tag:true, note:"Feeds consumption dashboards"},
  {id:"sensor-vib", n:"Line 1 Vibration Sensor",  ip:"10.44.2.12",  p:"MQTT",       loc:"Bottling line 1", cls:"iiot", z:"IIoT", tag:true, note:"Streams condition data to the historian"},
  {id:"sensor-flow",n:"Fill Flow Sensor",         ip:"10.44.2.13",  p:"MQTT",       loc:"Filler",          cls:"iiot", z:"IIoT", note:"Flow-rate telemetry"},
  {id:"plc-line1",  n:"Bottling Line 1 PLC",      ip:"10.44.20.11", p:"Modbus/TCP", loc:"Line 1 cabinet",  cls:"ics",  z:"L1", note:"LEGACY — firmware from 2011, vendor EOL (Hard-mode rollout subject)"},
  {id:"plc-line2",  n:"Bottling Line 2 PLC",      ip:"10.44.20.12", p:"Modbus/TCP", loc:"Line 2 cabinet",  cls:"ics",  z:"L1", note:"Supported firmware"},
  {id:"plc-pasteur",n:"Pasteurizer PLC",          ip:"10.44.20.13", p:"Modbus/TCP", loc:"Pasteurizer skid",cls:"ics",  z:"L1", tag:true, note:"ATTACK TARGET — setpoint register 40108 rewritten"},
  {id:"rtu-tank",   n:"Tank Farm RTU",            ip:"10.44.20.21", p:"DNP3",       loc:"Tank farm",       cls:"ics",  z:"L1", tag:true, note:"Telemetry out to L2 master station"},
  {id:"hmi-line",   n:"Line HMI Workstation",     ip:"10.44.20.31", p:"SMB/Modbus", loc:"Line control room",cls:"ics", z:"L2", tag:true, note:"PIVOT TARGET — attacker staged a utility here via SMB"},
  {id:"historian",  n:"Process Historian",        ip:"10.44.20.32", p:"MQTT/SQL",   loc:"Plant server rack",cls:"ics", z:"L2", note:"Collects IIoT + process data; corporate needs read access"},
  {id:"eng-ws",     n:"ICS Engineering Workstation", ip:"10.44.20.33", p:"Modbus/prog", loc:"Plant office", cls:"ics",  z:"L2", note:"The ONLY host allowed to write PLC logic"},
  {id:"hvac-plant", n:"Plant HVAC Controller",    ip:"10.44.30.11", p:"BACnet",     loc:"Plant roof",      cls:"ot",   z:"L3", note:"Availability-critical, legacy"},
  {id:"fridge-ctl", n:"Refrigeration Controller", ip:"10.44.30.12", p:"BACnet",     loc:"Cold storage",    cls:"ot",   z:"L3", tag:true, note:"ATTACKER'S FINAL TARGET — food-safety critical, cannot be patched in place"},
  {id:"fire-panel", n:"Fire Suppression Panel",   ip:"10.44.30.13", p:"BACnet",     loc:"Plant floor",     cls:"ot",   z:"L3", tag:true, note:"Never remotely writable; deserves its own microsegment"},
  {id:"badge-ctrl", n:"Badge Access Controller",  ip:"10.44.30.14", p:"HTTPS",      loc:"Security office", cls:"ot",   z:"L3", note:"Physical-security OT"},
  {id:"bms-gw",     n:"Building Mgmt Gateway",    ip:"10.44.30.15", p:"BACnet",     loc:"Plant office",    cls:"ot",   z:"L3", note:"Aggregates L3 devices for the historian"},
  {id:"jump-box",   n:"IT/OT Jump Server",        ip:"10.44.35.10", p:"RDP/HTTPS",  loc:"DMZ rack",        cls:"corp", z:"L35", locked:true, note:"Pre-placed broker: corporate reaches OT data only through it"},
  {id:"patch-stg",  n:"Patch Staging Server",     ip:"10.44.35.11", p:"SMB/HTTPS",  loc:"DMZ rack",        cls:"corp", z:"L35", locked:true, note:"Pre-placed: vendor updates enter OT from here, never straight from the internet"},
  {id:"vis-laptop", n:"Visitor Laptop",           ip:"10.44.1.201", p:"HTTPS",      loc:"Lobby",           cls:"gst",  z:"GST", tag:true, note:"Vendor representative, posture unknown"},
  {id:"vis-tablet", n:"Vendor Tablet",            ip:"10.44.1.202", p:"HTTPS",      loc:"Dock office",     cls:"gst",  z:"GST", note:"Streams repair videos on guest Wi-Fi (red herring)"},
  {id:"phone-sales",n:"Sales Rep Phone (personal)",ip:"10.44.40.21",p:"Mixed",      loc:"HQ",              cls:"byd",  z:"BYD", tag:true, note:"Unmanaged personal device with work mail"},
  {id:"lap-byod",   n:"Maintenance Tech Laptop (personal)", ip:"10.44.40.22", p:"Mixed", loc:"Plant office", cls:"byd", z:"BYD", tag:true, note:"Has the HMI client installed — reached the supervisory network directly"},
  {id:"ws-finance", n:"Finance Workstation",      ip:"10.44.50.11", p:"SMB/HTTPS",  loc:"HQ",              cls:"corp", z:"CRP", note:"Managed corporate endpoint"},
  {id:"srv-erp",    n:"ERP Server",               ip:"10.44.50.20", p:"SQL/HTTPS",  loc:"HQ server room",  cls:"corp", z:"CRP", note:"Business-critical IT service"},
  {id:"srv-mail",   n:"Mail Server",              ip:"10.44.50.21", p:"SMTP/HTTPS", loc:"HQ server room",  cls:"corp", z:"CRP", note:"Corporate mail"},
  {id:"nas-it",     n:"IT Backup NAS",            ip:"10.44.50.30", p:"SMB",        loc:"HQ server room",  cls:"corp", z:"CRP", note:"Nightly 02:00 backup job to ERP (red herring traffic)"}
];
var DEV = {}; DEVICES.forEach(function(d){ DEV[d.id]=d; });
var TAGSET = DEVICES.filter(function(d){return d.tag;}).map(function(d){return d.id;});
var MOVESET = DEVICES.filter(function(d){return !d.locked;}).map(function(d){return d.id;});
var CLASSES = [["iot","IoT"],["iiot","IIoT"],["ics","SCADA / ICS"],["ot","OT"],["gst","Guest"],["byd","BYOD"],["corp","Corporate"]];

/* click-to-tag config artifacts: v:true = violation */
var CONFIGS = [
  {id:"cfg-router", title:"E1 · Edge router — running-config (excerpt)", lines:[
    {id:"r1", tx:"upnp enable", v:true, why:"uPnP lets any internal device punch inbound holes through the edge — how the camera became internet-reachable."},
    {id:"r2", tx:"ip nat inside source static tcp 10.44.1.51 554 interface Gi0/0 554", v:true, why:"A static inbound port-forward straight to an IoT camera: internet can start sessions inside the network."},
    {id:"r3", tx:"ip access-list extended INGRESS / permit tcp any any established", v:false, why:"Permitting established sessions is normal stateful behavior — not a finding."},
    {id:"r4", tx:"ip http secure-server", v:false, why:"Management over HTTPS is the sane choice here."}
  ]},
  {id:"cfg-switch", title:"E2 · Core switch — show vlan brief (excerpt)", lines:[
    {id:"s1", tx:"hostname CAS-CORE-SW1", v:false, why:"Hostname — cosmetic."},
    {id:"s2", tx:"vlan 1 name DEFAULT", v:false, why:"VLAN 1 existing is normal; everything living in it is the problem."},
    {id:"s3", tx:"interface range gi1/0/1-48", v:false, why:"A port range is only context."},
    {id:"s4", tx:" switchport access vlan 1   ! all 48 ports", v:true, why:"Every access port in VLAN 1 = the flat net: cameras, HMI, ERP and guests in one broadcast domain."},
    {id:"s5", tx:" spanning-tree mode rapid-pvst", v:false, why:"RSTP is standard loop prevention, not a segmentation issue."}
  ]},
  {id:"cfg-wlc", title:"E3 · Wireless controller — WLAN config (excerpt)", lines:[
    {id:"w1", tx:"wlan CAS-Guest 3", v:false, why:"Having a guest WLAN is correct — its wiring is not."},
    {id:"w2", tx:" wlan bridging vlan 1      ! guest clients land on the corporate VLAN", v:true, why:"Guest traffic bridged into VLAN 1 puts visitors directly inside the corporate flat net."},
    {id:"w3", tx:"wlan CAS-BYOD 5", v:false, why:"A BYOD WLAN exists; its admission control is missing."},
    {id:"w4", tx:" security psk ascii ******  ! shared pre-shared key", v:true, why:"A shared PSK with no 802.1X or MDM check means any device can join and nothing is verified."},
    {id:"w5", tx:" no client-isolation       ! guests can reach each other", v:false, why:"Weak hygiene, and worth fixing — but the policy-breaking line is the bridge into VLAN 1 (and the PSK in Hard mode)."}
  ]},
  {id:"cfg-modbus", title:"E4 · Modbus audit — write operations (excerpt)", lines:[
    {id:"m1", tx:"10.44.20.33 (eng-ws) -> 10.44.20.13 (pasteurizer) fc6 addr 40108", v:false, why:"The engineering workstation is the one legitimate PLC writer."},
    {id:"m2", tx:"10.44.20.31 (hmi-line) -> 10.44.20.11 (line1) fc3 read", v:false, why:"HMI reads are normal supervisory behavior."},
    {id:"m3", tx:"10.44.20.31 (hmi-line) -> 10.44.20.13 (pasteurizer) fc6 addr 40108", v:true, why:"A Modbus WRITE from the HMI — policy says only eng-ws may write PLCs. This is the setpoint change."}
  ]}
];
var M6_SET   = ["r1","r2","s4","w2"];              // Medium: tag these 4
var H2_SET   = ["r1","r2","s4","w2","w4","m3"];   // Hard: tag these 6

/* alert triage (M8) — verdict true/false + reason */
var REASONS = [
  ["r-lateral","Unauthorized east-west scan / pivot from an untrusted zone"],
  ["r-telemetry","Expected vendor telemetry from a chatty IoT device"],
  ["r-guest","A guest-zone device reached an internal resource"],
  ["r-backup","Scheduled internal backup job (runbook window)"],
  ["r-egress","A control-zone device attempting internet egress"],
  ["r-expected","Expected IIoT-to-historian telemetry path"]
];
var ALERTS = [
  {id:"A1", t:"02:31:41", src:"cam-lobby",  dst:"10.44.0.0/16",      info:"TCP SYN sweep — ports 445, 3389, 502, 44818",  verdict:true,  reason:"r-lateral"},
  {id:"A2", t:"hourly",   src:"brew-smart", dst:"198.51.100.44:443", info:"TLS to brewcloud.example (bean reorder API)",  verdict:false, reason:"r-telemetry"},
  {id:"A3", t:"11:04:12", src:"vis-laptop", dst:"srv-erp:445",       info:"SMB session to ERP server from guest Wi-Fi",   verdict:true,  reason:"r-guest"},
  {id:"A4", t:"02:00:03", src:"nas-it",     dst:"srv-erp:445",       info:"12.4 GB SMB transfer (nightly)",               verdict:false, reason:"r-backup"},
  {id:"A5", t:"03:12:48", src:"plc-line1",  dst:"198.51.100.9:443",  info:"PLC-initiated internet connection attempt",    verdict:true,  reason:"r-egress"},
  {id:"A6", t:"05:58:01", src:"sensor-vib", dst:"historian:1883",    info:"MQTT publish to process historian",            verdict:false, reason:"r-expected"}
];

/* Hard-mode noisy flow table (H9): 6 violations + 2 benign herrings */
var NOISY = [
  {id:"N1", t:"02:31:41", f:"cam-lobby → 10.44.0.0/16 sweep (445/3389/502)", v:true},
  {id:"N2", t:"02:47:19", f:"cam-lobby → hmi-line SMB 445 (session + utility drop)", v:true},
  {id:"N3", t:"03:02:55", f:"hmi-line → plc-pasteur Modbus fc6 write 40108", v:true},
  {id:"N4", t:"11:04:12", f:"vis-laptop → srv-erp SMB 445", v:true},
  {id:"N5", t:"13:40:02", f:"lap-byod → hmi-line RDP 3389 (personal laptop, HMI client)", v:true},
  {id:"N6", t:"03:12:48", f:"plc-line1 → 198.51.100.9:443 (PLC-initiated egress)", v:true},
  {id:"N7", t:"hourly",   f:"brew-smart → brewcloud.example:443 TLS", v:false},
  {id:"N8", t:"02:00:03", f:"nas-it → srv-erp:445 12.4 GB (runbook backup)", v:false}
];

/* control matching (M11) + hard picks (H8) */
var CONTROLS = [
  {id:"captive", n:"Captive portal + client isolation"},
  {id:"mdm",     n:"MDM enrollment + containerization"},
  {id:"nac",     n:"NAC with 802.1X admission"},
  {id:"icsfw",   n:"Protocol-aware ICS firewall"},
  {id:"jump",    n:"Jump server in the IT/OT DMZ"},
  {id:"egress",  n:"Egress allow-list filtering"},
  {id:"passive", n:"Passive protocol monitor"},
  {id:"diode",   n:"Unidirectional gateway (data diode)"}
];
var NEEDS = [
  {id:"K1", need:"Keep the guest SSID strictly internet-only", ans:"captive"},
  {id:"K2", need:"Make BYOD devices prove management before admission", ans:"mdm"},
  {id:"K3", need:"Stop unknown devices from plugging into plant switches", ans:"nac"},
  {id:"K4", need:"Allow PLC writes only from the engineering workstation", ans:"icsfw"},
  {id:"K5", need:"Let corporate analysts read the historian without routes into L2", ans:"jump"},
  {id:"K6", need:"Let cameras reach only their vendor's cloud endpoints", ans:"egress"},
  {id:"K7", need:"See what legacy OT devices speak — without active scanning that can crash them", ans:"passive"}
];
var PICKS = [
  {id:"P1", sc:"Export historian data to corporate reporting with NO possible return path into the control network.", ans:"diode"},
  {id:"P2", sc:"Separate work data from personal data on employee-owned phones.", ans:"mdm"},
  {id:"P3", sc:"Stop a compromised camera from calling out anywhere except its vendor cloud.", ans:"egress"}
];

/* H5 legacy-PLC rollout: pick these 4 in order from 7 */
var SEQSTEPS = [
  {id:"sq1", n:"Power down the pasteurizer and Line 1 PLCs until patched"},
  {id:"sq2", n:"Back up PLC programs and HMI projects offline"},
  {id:"sq3", n:"Move plc-line1 into a deny-by-default L1 microsegment"},
  {id:"sq4", n:"Deploy passive protocol monitoring with setpoint-change alerts"},
  {id:"sq5", n:"Schedule the vendor firmware update for the next maintenance window"},
  {id:"sq6", n:"Open a temporary allow rule so the vendor can remote in"},
  {id:"sq7", n:"Leave the PLC on the flat net and re-audit next year"}
];
var SEQ_ANS = ["sq2","sq3","sq4","sq5"];

/* H6 detection builder */
var CONDS = [
  {id:"c1", n:"src_zone in [IoT, Guest, BYOD] AND dst_zone is internal", good:true},
  {id:"c2", n:"dst_port = 502 (Modbus) AND src_host != eng-ws", good:true},
  {id:"c3", n:"src_zone = IIoT AND dst_zone not in [L2 or allow-listed vendor]", good:true},
  {id:"c4", n:"any BACnet traffic at all", good:false},
  {id:"c5", n:"flow size > 1 GB", good:false},
  {id:"c6", n:"MAC not present in NAC inventory (unenrolled device)", good:true}
];

/* M12 fridge decision */
var FRIDGE = [
  {id:"f1", n:"Keep the controller in service — cold storage cannot stop during production", good:true},
  {id:"f2", n:"Move it into the L3 OT zone behind the brokered boundary", good:true},
  {id:"f3", n:"Passive protocol monitoring with alerts on any setpoint change", good:true},
  {id:"f4", n:"Vendor firmware update scheduled for the next maintenance window", good:true},
  {id:"f5", n:"Shut it down during production until it is patched", good:false},
  {id:"f6", n:"No change — re-assess at the next annual audit", good:false}
];

/* M1 benefits, M2 techniques, M7 sources */
var BENEFITS = [
  {id:"b1", n:"Contains a breach to one zone (smaller blast radius)", good:true},
  {id:"b2", n:"Reduces the attack surface untrusted devices can reach", good:true},
  {id:"b3", n:"Keeps broadcast chatter local, improving performance", good:true},
  {id:"b4", n:"Shrinks audited compliance scope (e.g., payment data zones)", good:true},
  {id:"b5", n:"Eliminates the need for patching", good:false},
  {id:"b6", n:"Stops phishing emails from being delivered", good:false},
  {id:"b7", n:"Replaces the need for a device inventory", good:false}
];
var TECHS = [
  {id:"t1", n:"T1046 — Network Service Discovery (east-west scans)", good:true},
  {id:"t2", n:"T1210 — Exploitation of Remote Services", good:true},
  {id:"t3", n:"T1021.001 — Remote Services: Remote Desktop Protocol", good:true},
  {id:"t4", n:"T1565.003 — Data Manipulation: Runtime Data Manipulation", good:true},
  {id:"t5", n:"T1566 — Phishing (initial delivery)", good:false},
  {id:"t6", n:"T1091 — Replication Through Removable Media", good:false}
];
var SOURCES = [
  {id:"d1", n:"Zone-gate firewall / NetFlow logs", good:true},
  {id:"d2", n:"NAC / 802.1X admission logs", good:true},
  {id:"d3", n:"Wireless controller association logs", good:true},
  {id:"d4", n:"OT protocol audit (Modbus / BACnet writes)", good:true},
  {id:"d5", n:"Printer toner levels", good:false},
  {id:"d6", n:"Social media feeds", good:false},
  {id:"d7", n:"Room thermostat schedules", good:false}
];

/* M3 class definitions */
var DEFS = [
  ["iot","Consumer or smart end devices — cameras, TVs, printers, thermostats — with weak patching and cloud telemetry"],
  ["iiot","Industrial sensors and actuators that bridge plant-floor data into IT systems"],
  ["ics","The supervisory control stack over field devices: PLCs, RTUs, HMIs, historians (SCADA/ICS)"],
  ["ot","Any hardware or software acting on physical processes — HVAC, refrigeration, fire, badge access"],
  ["gst","Visitor and vendor devices on a shared SSID, posture unknown"],
  ["byd","Employee-owned phones and laptops mixing work and personal data"]
];

/* M5 / H1 breach reconstruction — correct option position varies per field (R4/R6) */
var BREACH_Q = [
  {id:"entry",  q:"Entry device", opts:["cam-dock","cam-lobby","brew-smart","tv-lobby"], ans:"cam-lobby", label:function(id){return DEV[id]?DEV[id].n:id;}},
  {id:"method", q:"How the attacker got in", opts:["A zero-day in the ERP","Phishing email to a line operator","Default credentials on an internet-exposed camera","A stolen badge clone"], ans:"Default credentials on an internet-exposed camera"},
  {id:"pivot",  q:"Pivot target (first internal foothold)", opts:["historian","srv-erp","ws-finance","hmi-line"], ans:"hmi-line", label:function(id){return DEV[id]?DEV[id].n:id;}},
  {id:"action", q:"Action taken against the pasteurizer PLC", opts:["Read-only historian query","BACnet schedule change","Modbus fc6 write to setpoint register 40108","Firmware backup download"], ans:"Modbus fc6 write to setpoint register 40108"},
  {id:"target", q:"Attempted final target (blocked by luck, not by design)", opts:["fire-panel","fridge-ctl","bms-gw","badge-ctrl"], ans:"fridge-ctl", label:function(id){return DEV[id]?DEV[id].n:id;}},
  {id:"tactic", q:"ATT&CK tactic of the camera-to-HMI hop", opts:["Collection","Exfiltration","Initial Access","Lateral Movement"], ans:"Lateral Movement", hard:true},
  {id:"cause",  q:"Why every hop succeeded", opts:["Flat VLAN 1 — no zone gates existed","Weak Wi-Fi encryption","Missing antivirus on the HMI","No SIEM"], ans:"Flat VLAN 1 — no zone gates existed", hard:true}
];

/* H7 wireless hardening: 8 toggles + 2 vlan selects */
var WLAN = {
  guest:[ {id:"g-portal", n:"Captive portal before internet access", d:"Guests must accept terms / authenticate"},
          {id:"g-iso",    n:"Client isolation", d:"Guests cannot reach each other or the wire"},
          {id:"g-cap",    n:"Bandwidth cap", d:"Guests cannot starve plant links"} ],
  guestSel:{id:"g-vlan", n:"Guest VLAN", opts:["FLAT","GST","IoT"], ans:"GST"},
  guestOff:[ {id:"g-lan", n:"Allow guest access to internal resources", d:"Must stay OFF — internet-only"} ],
  byod:[  {id:"b-8021x", n:"802.1X admission", d:"Per-device authentication via RADIUS"},
          {id:"b-mdm",   n:"MDM enrollment check", d:"Only managed devices may associate"},
          {id:"b-cert",  n:"Certificate deployment", d:"Device identity from certs, not shared keys"} ],
  byodOff:[ {id:"b-psk", n:"Shared pre-shared key", d:"Must stay OFF — replace with 802.1X"} ],
  byodSel:{id:"b-vlan", n:"BYOD VLAN", opts:["FLAT","BYD","CRP"], ans:"BYD"}
};
/* ---------- quiz banks ---------- */
var QUIZ_M = [
  {q:"A vendor offers you \"industrial smart sensors\" for your bottling line and a consumer smart camera for the lobby. Under the chapter's terms, which pairing is correct?",
   o:["Both are IoT; anything smart counts as IoT","Both are IIoT; anything inside a plant is industrial","Line sensors are IIoT; the lobby camera is IoT","The camera is IIoT because it records video footage"], a:2,
   w:"IIoT is industrial instrumentation bridging plant data into IT (sensors, meters, actuators); IoT is consumer/smart end devices like cameras, TVs, printers and thermostats. Same fix though: both get their own untrusted zone."},
  {q:"Which statement best captures the SCADA/ICS vs OT distinction the chapter draws?",
   o:["They are exact synonyms; the exam uses either label for either world","SCADA/ICS is the control stack; OT is tech acting on physical processes","OT only means the factory robots on the bottling line","SCADA is simply another name for the plant Wi-Fi network"], a:1,
   w:"SCADA/ICS names the industrial control architecture over PLCs, RTUs and HMIs (Purdue levels 1-2). OT is wider: any hardware/software acting on physical processes — including building management. In this lab the pasteurizer PLC is ICS; the refrigeration and fire systems are OT."},
  {q:"You are designing the guest SSID for the plant. Which bundle matches the chapter's requirements?",
   o:["Full internal access so vendor engineers can work faster","Shared PSK on the corporate VLAN, NAC added later","Open network with only a bandwidth cap for control","Captive portal, client isolation, and an internet-only VLAN"], a:3,
   w:"Guests are posture-unknown: gate them behind a captive portal, isolate them from each other and the wire, and give them no internal routes at all."},
  {q:"Which control set is the chapter's primary answer for BYOD?",
   o:["MDM containerization plus 802.1X admission into a BYOD zone","Ban every personal device and hope the rule holds","One shared PSK for everyone, with no admission checks","Let BYOD join the corporate VLAN with endpoint antivirus"], a:0,
   w:"BYOD devices are unmanaged by default: enroll and manage them (MDM + containerization), authenticate each device (802.1X), and put them in their own zone. In this incident the unmanaged tech laptop reached the HMI directly."},
  {q:"Why do IoT devices like cameras get their own VLAN even when they seem harmless?",
   o:["They use far too much bandwidth for the corporate VLAN","VLANs make their cloud telemetry faster and more reliable","Default credentials and weak firmware; a dedicated zone contains compromise","Because printers and cameras refuse to share a subnet"], a:2,
   w:"The incident here started exactly this way: a camera with default credentials became a beachhead. The VLAN does not fix the camera — it shrinks what a compromised camera can reach and makes its traffic observable at the gate."},
  {q:"What does a unidirectional gateway (data diode) buy you on the historian export?",
   o:["It encrypts all historian traffic in both directions at line rate","Data flows out of the control network with no return path","It is just a faster stateful firewall rule for exports","It compresses historian exports before they leave the plant"], a:1,
   w:"A diode is the strongest answer when corporate needs OT data but the control network must never be reachable: physical one-way flow. Software rules can be misconfigured; a fiber diode cannot phone home."}
];
var QUIZ_H = [
  {q:"Flow log: brew-smart (10.44.1.56) → 198.51.100.44:443 every hour, TLS, ~2 KB. The alert says \"IoT beaconing\". Triage it.",
   o:["True positive; shut the brewer down and reimage it immediately","True positive; the hourly beaconing is definitely command and control traffic","False positive; ignore every piece of IoT telemetry permanently going forward","False positive; expected vendor telemetry, but still zone and allow-list it"], a:3,
   w:"Hourly small TLS to a known vendor reorder API is textbook telemetry, not C2. But \"false positive\" does not mean \"no action\": the brewer still belongs in the IoT zone with an egress allow-list so tomorrow's compromised firmware cannot phone somewhere else."},
  {q:"Facilities installs 40 new smart power meters. Where do they go and what is the one required path?",
   o:["Corporate VLAN so the consumption dashboards keep working","IIoT zone; one monitored MQTT path to the historian","Straight into L1 so the meters can control the process","Guest network because the meters are unmanaged consumer devices"], a:1,
   w:"IIoT instrumentation belongs in its own zone with a single, monitored northbound path to the historian (MQTT/1883 here). Direct routes to IT or to L1 controllers are how sensor fleets become pivot grids."},
  {q:"An executive demands: \"Air-gap the plant. All of it. Monday.\" What is the strongest professional response?",
   o:["Do it Monday; an air gap has zero operational trade-offs","Refuse the demand and change nothing on the network","Segment instead: Purdue zones, an IT/OT DMZ, and monitored gates","One VLAN for everything, but add endpoint antivirus quickly"], a:2,
   w:"A full air gap breaks the data the business runs on (historian reporting, patch staging, BMS telemetry) and is notoriously leaky via removable media — T1091 exists precisely because air gaps get crossed. Defense-in-depth zoning with brokered paths is the workable, testable answer."},
  {q:"Which policy set is correct for the line HMI workstation?",
   o:["Dedicated L2 host; no internet or email; writes only from eng-ws","HMI doubles as the analysts' jump box between the zones","HMI may freely browse vendor manuals over the internet","Anyone on the flat net may write PLCs through the HMI"], a:0,
   w:"The HMI is the crown jewel of the supervisory layer: keep it dedicated, no mixed-use traffic, and enforce that writes to PLCs come only from the engineering workstation — protocol-aware controls exist for exactly this."},
  {q:"Where does the fire suppression panel go, and why there?",
   o:["Corporate VLAN so the safety team can monitor it easily","Guest zone; nobody uses the panel outside annual drills anyway","Anywhere really, since the panel stays offline by its design","Its own read-mostly microsegment that is never remotely writable"], a:3,
   w:"Life-safety systems get the strictest treatment: isolated microsegment, no remote writes, minimal read-only visibility. ATT&CK's TRITON case (S1009 / C0030) showed safety systems are a direct target, not an afterthought."},
  {q:"Procurement is buying 12 new IP cameras. Which pre-deployment segmentation checklist passes?",
   o:["Internet exposure enabled for remote viewing via uPnP port forwarding rules","Change default credentials, join the IoT VLAN, egress allow-list, no inbound","Join the corporate VLAN so the NVR stays reachable","One shared PSK for all cameras on the guest SSID"], a:1,
   w:"Repeat the incident backward: default creds + uPnP exposure + flat VLAN is how it started. Credential hygiene, a dedicated zone, and outbound-only allow-listed paths break every link in that chain."},
  {q:"Which data source most reliably catches guest-to-internal SMB like the visitor laptop reaching the ERP?",
   o:["The ERP application log alone, reviewed after the fact","Endpoint antivirus on the guest device itself","Zone-gate firewall and NetFlow logs at the guest boundary","Printer toner levels from the facilities dashboard"], a:2,
   w:"Zone-gate telemetry is where segmentation violations are visible as events — src_zone=Guest → dst internal is a one-line detection. NAC logs add the admission view; application logs only tell you what already got through."}
];

/* focus-area map per exam item — completion report derives study pointers from actual misses (audit R8) */
var FOCUS_M=["IoT vs IIoT vocabulary","SCADA/ICS vs OT scope","guest zone requirements","BYOD admission controls","why IoT devices get their own zone","what a data diode guarantees"];
var FOCUS_H=["telemetry vs C2 triage discipline","IIoT zoning and the single northbound path","air-gap trade-offs vs segmentation","HMI hardening policy","life-safety system isolation","IoT pre-deployment checklist","detection sources for zone violations"];

/* ---------- glossary (21 terms) ---------- */
var GLOSSARY = [
  ["VLAN","A logical broadcast domain that splits one physical switch fabric into isolated layer-2 segments."],
  ["Subnet","A layer-3 address range; traffic between subnets must cross a router, where policy can be applied."],
  ["ACL","Access control list — ordered permit/deny rules on a router or firewall that filter traffic at a boundary."],
  ["NAC","Network access control — admits, profiles or quarantines devices based on identity and posture before granting network access."],
  ["802.1X","Port-based authentication standard that gates network admission per device or user via a RADIUS server."],
  ["MDM","Mobile device management — enrolls and manages devices, applies policy, and reports posture."],
  ["Containerization","Splitting a BYOD device into a managed work container and a private area, so policy reaches only the work side."],
  ["Captive portal","A web gate that forces guest users to accept terms or authenticate before granting internet-only access."],
  ["Client isolation","Wireless feature that stops clients on the same SSID from talking to each other."],
  ["DMZ","A buffer zone between trust levels — classic internet-facing zone; in OT, the level 3.5 IT/OT DMZ."],
  ["Jump server","A hardened broker in a DMZ: administrators must transit it to reach a protected zone, so the zones stay unrouteable."],
  ["Data diode","A unidirectional gateway: data flows out of a control zone while any return path is physically impossible."],
  ["Purdue model","The Purdue Enterprise Reference Architecture — levels 0-5 stacking process devices, control, supervisory, site operations and enterprise."],
  ["SCADA","Supervisory control and data acquisition — the supervisory architecture over PLCs, RTUs and HMIs in industry."],
  ["ICS","Industrial control system — the integrated hardware/software that controls industrial processes."],
  ["PLC","Programmable logic controller — the industrial computer driving machinery; unauthorized writes to it change physical processes."],
  ["HMI","Human-machine interface — the operator's window into the control process."],
  ["RTU","Remote terminal unit — field telemetry device bridging sensors to the supervisory layer."],
  ["Historian","A database server that collects time-series process data from the control system."],
  ["Air gap","Physical isolation from other networks — imperfect in practice because removable media crosses it."],
  ["Egress filtering","Restricting outbound traffic, e.g., IoT devices may reach only their vendor's cloud endpoints."]
];

/* ---------- case files (MITRE-verified 2026-11-09) ---------- */
var CASES = [
  {id:"S0603", n:"Stuxnet", d:"ATT&CK describes Stuxnet (S0603) as the first publicly reported malware to specifically target industrial control system devices (discovered 2010). Its delivery across a physical boundary via removable media is the canonical lesson that even air-gapped segments need media controls — segmentation alone is not a media policy."},
  {id:"S0604", n:"Industroyer (CRASHOVERRIDE)", d:"ATT&CK associates Industroyer (S0604) with Sandworm Team (G0034) and the December 2016 attack on Ukrainian substations: purpose-built ICS malware. Its lesson: IT/OT connectivity is a pivot path worth segmenting and monitoring at the gate."},
  {id:"S1009", n:"TRITON (campaign C0030)", d:"ATT&CK documents TRITON (S1009) as an attack framework built to interact with Triconex Safety Instrumented System controllers, under campaign C0030, the Triton Safety Instrumented System Attack — discovered because a safety trip fired. Its lesson: safety systems deserve their own zone with the strictest policy."}
];

/* ---------- MITRE links (verified) ---------- */
var LINKS = [
  ["Mitigation M1030 — Network Segmentation","https://attack.mitre.org/mitigations/M1030/"],
  ["T1046 — Network Service Discovery","https://attack.mitre.org/techniques/T1046/"],
  ["T1210 — Exploitation of Remote Services","https://attack.mitre.org/techniques/T1210/"],
  ["T1565 — Data Manipulation","https://attack.mitre.org/techniques/T1565/"],
  ["T1021 — Remote Services","https://attack.mitre.org/techniques/T1021/"],
  ["S0603 — Stuxnet","https://attack.mitre.org/software/S0603/"],
  ["S0604 — Industroyer","https://attack.mitre.org/software/S0604/"],
  ["S1009 — TRITON","https://attack.mitre.org/software/S1009/"],
  ["C0030 — Triton Safety Instrumented System Attack","https://attack.mitre.org/campaigns/C0030/"]
];

/* ---------- briefing timeline ---------- */
var TIMELINE = [
  ["02:11","Internet scanner finds the lobby camera — uPnP on the edge router published its RTSP port."],
  ["02:13","Attacker logs in with vendor default credentials (admin/admin)."],
  ["02:31","Camera sweeps the whole 10.44.0.0/16 flat net for SMB, RDP and Modbus ports."],
  ["02:47","Camera lands on the line HMI workstation over SMB and stages a utility."],
  ["03:02","HMI sends a Modbus fc6 write to the pasteurizer setpoint register 40108."],
  ["03:05","Attacker attempts the refrigeration controller in cold storage."],
  ["03:20","Historian flags a Modbus write from a non-engineering host — SOC opens the incident."]
];

/* ---------- objectives ---------- */
var PILLAR = {U:["U","UNDERSTAND","var(--blue)"],R:["R","RECOGNIZE","var(--teal)"],D:["D","DETECT","var(--violet)"],M:["M","MITIGATE","var(--amber)"]};
