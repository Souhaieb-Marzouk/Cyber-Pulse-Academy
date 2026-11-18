/* ================= DATA — all synthetic/fictional (training data) ================= */
"use strict";

const TODAY_LINE = "Yard date: Nov 9, 2026";

const LAMP_LABELS = { sup:"Supported", eol:"EOL — plan refresh", eos:"EOS — unsupported" };

/* type: icon key · data: data classification · eosale: end-of-sale, eos: end-of-support */
const DEVICES = [
  {id:"fw1",  tag:"THF-FW-001", type:"firewall",  model:"Northcell NC-700 firewall",      serial:"NC7-88412",  loc:"Boise hub — perimeter edge", os:"NCware 7.9.1",
   eosale:"2023-04-30", eos:"2026-03-31 (PASSED)", warranty:"expired 2024", data:"Perimeter traffic · internal",
   extra:"CVE-2026-1187 (critical) is actively exploited against NCware 7.x. Vendor ships nothing for 7.x since 2026-03-31."},
  {id:"sw1",  tag:"THF-SW-014", type:"switch",    model:"Corelan CX-9400 core switch",    serial:"CX9-55201",  loc:"Boise hub — core", os:"Coreware 12.4L",
   eosale:"2026-06-30 (PASSED)", eos:"2027-12-31", warranty:"active", data:"All inter-depot traffic",
   extra:"Already on the latest Coreware 12.4L. Vendor support continues through 2027-12-31 — replacement planning time."},
  {id:"sw2",  tag:"THF-SW-031", type:"switch",    model:"Corelan CX-2100 edge switch",    serial:"CX2-11840",  loc:"Ontario OR depot — edge", os:"Coreware 9.2.7",
   eosale:"2022-11-30", eos:"2025-08-15 (PASSED)", warranty:"expired", data:"Branch user traffic",
   extra:"Second-life hardware; no spare parts or software fixes available from the vendor."},
  {id:"sw3",  tag:"THF-SW-055", type:"switch",    model:"Corelan CX-2100 edge switch",    serial:"CX2-22706",  loc:"Yard office — edge", os:"Coreware 9.2.7",
   eosale:"2022-11-30", eos:"2025-08-15 (PASSED)", warranty:"expired", data:"Yard office traffic",
   extra:"Documented third-party maintenance with DepotCare Services until 2027-06-30 (hardware swap service — still receives NO vendor security patches)."},
  {id:"ap1",  tag:"THF-AP-208", type:"ap",        model:"ApexWire A320 access point",     serial:"AW-320-7742", loc:"Boise warehouse — Wi-Fi", os:"Firmware 6.2.1",
   eosale:"2026-01-31 (PASSED)", eos:"2027-01-31", warranty:"active", data:"Warehouse Wi-Fi",
   extra:"Firmware 6.2.3 available (security + bug fixes). Image 7.0.0 exists but runs on A550-series hardware only."},
  {id:"ap2",  tag:"THF-AP-311", type:"ap",        model:"ApexWire A550 access point",     serial:"AW-550-1183", loc:"Boise office — Wi-Fi", os:"Firmware 8.0.2",
   eosale:"—", eos:"2029-06-30", warranty:"active", data:"Office Wi-Fi",
   extra:"Current firmware, fully supported. The yard's one truly quiet corner."},
  {id:"srv1", tag:"THF-SRV-007", type:"server",   model:"Vantage VS-2 file/print server", serial:"VS2-30881",  loc:"Boise HQ — server room", os:"Stratus OS 14.2",
   eosale:"—", eos:"— (14.x supported)", warranty:"active", data:"Shared file shares · internal",
   extra:"SR-2026-11 available: security patch SP-2026-11A (CVE-2026-0341 privilege escalation) + bug fix BF-2026-104. UEFI 2.9 installed; 2.14 available."},
  {id:"srv2", tag:"THF-SRV-012", type:"server",   model:"Vantage VS-1 payroll server",    serial:"VS1-10427",  loc:"Boise HQ — server room", os:"Stratus OS 11.4",
   eosale:"2024-12-31", eos:"2026-05-31 (PASSED)", warranty:"expired", data:"Payroll records · CONFIDENTIAL",
   extra:"Runs the LedgerLine payroll app. Vendor has shipped nothing for OS 11.x since 2026-05-31. UEFI 2.9 installed; OS 14 requires UEFI 2.14."},
  {id:"lt1",  tag:"THF-LT-058", type:"laptop",    model:"Polaris ProBook 450 laptop",     serial:"PB-58204",   loc:"Refresh batch — storage room", os:"Stratus OS 14.1",
   eosale:"n/a — leaving", eos:"n/a — leaving", warranty:"n/a", data:"Office docs · internal",
   extra:"Healthy SSD; user already migrated to a new machine. Scheduled for resale."},
  {id:"lt2",  tag:"THF-LT-104", type:"laptop",    model:"Polaris ProBook 450 laptop",     serial:"PB-58977",   loc:"Refresh batch — storage room", os:"Stratus OS 13.2",
   eosale:"n/a — leaving", eos:"n/a — leaving", warranty:"n/a", data:"HR case files · CONFIDENTIAL",
   extra:"HARD DRIVE FAILING — cannot be reliably overwritten. Media must be physically destroyed."},
  {id:"md1",  tag:"THF-MD-021", type:"handheld",  model:"Meridian M7 rugged scanner",     serial:"M7-90233",   loc:"Depot closure — returned", os:"Android 12 (embedded)",
   eosale:"n/a — leaving", eos:"n/a — leaving", warranty:"n/a", data:"Scan logs · internal",
   extra:"Contains an active SIM and an SD card holding scan history."},
  {id:"nas1", tag:"THF-NAS-003", type:"nas",      model:"Yardline NAS-8 records store",   serial:"YL8-41120",  loc:"HQ records room", os:"YardlineOS 3.1",
   eosale:"—", eos:"2027-08-31", warranty:"active", data:"Driver-license scans · RESTRICTED",
   extra:"Records-retention rule RR-12: license scans must be kept until June 30, 2031. Disposal is deferred — data first."}
];
/* Medium core classification set */
const CORE_DEVICES = ["fw1","sw1","sw2","ap1","srv1","srv2"];
const CORE_ANSWERS = {fw1:"eos", sw1:"eol", sw2:"eos", ap1:"eol", srv1:"sup", srv2:"eos"};
/* Hard full classification + high-risk sets */
const HARD_DEVICES = ["fw1","sw1","sw2","sw3","ap1","srv1","srv2"];
const HARD_ANSWERS = {fw1:"eos", sw1:"eol", sw2:"eos", sw3:"eos", ap1:"eol", srv1:"sup", srv2:"eos"};
const H2_NO_UPDATES = ["fw1","sw2","sw3","srv2"];   // receive no vendor security updates
const H2_HIGH_RISK  = ["fw1","srv2"];               // perimeter role / confidential data
const M6_RISK = ["fw1","sw2","srv2"];               // Medium urgent-risk flags

const NOTICES = [
  {id:"NB-2026-041", vendor:"Corelan Networks", date:"2026-02-10", lifecycle:true,
   title:"End-of-sale announced: CX-9400 series",
   body:"Corelan announces end-of-sale for the CX-9400 switch family. Last order date: June 30, 2026. Last day of software support: December 31, 2027. Successor model: NX-9500."},
  {id:"NB-2025-118", vendor:"Northcell Security", date:"2025-09-02", lifecycle:true,
   title:"NCware 7.x reaches end-of-support",
   body:"NCware 7.x (all releases) reaches end-of-support on March 31, 2026. After that date Northcell provides NO security patches, bug fixes, technical support or RMA parts for NCware 7.x. Migration path: NCware 9.x."},
  {id:"NB-2026-052", vendor:"ApexWire", date:"2026-10-20", lifecycle:true,
   title:"Firmware 6.2.3 released for A-series APs",
   body:"Firmware 6.2.3 fixes CVE-2026-0922 (management-interface flaw) and three reported bugs. A320-series hardware remains supported until January 31, 2027. Image 7.0.0 exists but requires A550-series hardware."},
  {id:"NB-2026-009", vendor:"Stratus Software", date:"2026-01-15", lifecycle:true,
   title:"Stratus OS 11 end-of-support: May 31, 2026",
   body:"Stratus OS 11.x reaches end-of-support on May 31, 2026. No security patches or bug fixes will ship for 11.x after that date. Supported path: Stratus OS 14.x."},
  {id:"NB-2025-087", vendor:"Corelan Networks", date:"2025-06-30", lifecycle:true,
   title:"Coreware 9.x end-of-support: August 15, 2025",
   body:"Coreware 9.x reaches end-of-support on August 15, 2025 for CX-2100 and CX-2200 platforms. No further patches, fixes or spare parts."},
  {id:"NB-2026-044", vendor:"Stratus Software", date:"2026-11-02", lifecycle:true,
   title:"Stratus OS 14.2 service release SR-2026-11",
   body:"Ships for OS 14.2: security patch SP-2026-11A (fixes CVE-2026-0341, privilege escalation) and bug fix BF-2026-104 (print jobs stuck in queue)."},
  {id:"MKT-2026-063", vendor:"DepotCare Services", date:"2026-10-28", lifecycle:false,
   title:"“Keep old gear alive!”",
   body:"Third-party maintenance for ANY model, ANY age! Contracts from $19/month!! (Sales flyer — not a vendor lifecycle notice.)"},
  {id:"MKT-2026-058", vendor:"Corelan Marketing", date:"2026-07-01", lifecycle:false,
   title:"Introducing the NX-9500!",
   body:"Faster, greener, more ports! Upgrade today and save! (New-model marketing — contains no lifecycle dates.)"}
];
const H1_NONLIFECYCLE = ["MKT-2026-063","MKT-2026-058"];

/* Timeline stage exercise (M1) — display order shuffled, correct order = index order */
const TIMELINE_STAGES = [
  "In production — fully supported",
  "EOL announced — vendor will stop selling",
  "End-of-sale — no new units",
  "EOS — patches, support and parts end",
  "Decommission — sanitize, dispose, document"
];
const TIMELINE_DISPLAY = [2,4,0,3,1]; // shuffled presentation order (indices into TIMELINE_STAGES)

/* Definitions exercise (M2) — option lengths kept within ~1 word of each other (R5) */
const DEF_EOL_OPTS = [
  "The vendor stops making and selling the product; support may continue",
  "The vendor immediately bricks every deployed unit it has sold",
  "All patches, fixes and parts end for the product forever"
];
const DEF_EOS_OPTS = [
  "The product can no longer be purchased new anywhere",
  "The vendor ends security patches, bug fixes, support and spare parts",
  "The device must be destroyed within 30 days of notice"
];

/* EOS multi-select (M3) */
const EOS_CHECKS = [
  {t:"Security patches", ok:true},
  {t:"Bug fixes", ok:true},
  {t:"Technical support from the vendor", ok:true},
  {t:"Spare parts / RMA units", ok:true},
  {t:"The device stops booting", ok:false},
  {t:"Your data stored on the device", ok:false}
];

/* Update classification (M5) */
const CLASSIFY_ITEMS = [
  {t:"SP-2026-11A — closes privilege-escalation flaw CVE-2026-0341 in Stratus OS 14.2", a:0},
  {t:"BF-2026-104 — fixes print jobs stuck in the queue", a:1},
  {t:"Stratus OS 11.4 → 14.2 on the payroll server", a:2},
  {t:"ApexWire A320 firmware 6.2.1 → 6.2.3", a:3},
  {t:"VS-2 server UEFI 2.9 → 2.14, applied before a major OS upgrade", a:3}
];
const CLASSIFY_OPTS = ["Security patch","Bug fix","OS upgrade","Firmware update"];

/* Evidence mapping (M7) */
const EVIDENCE_ROWS = [
  {q:"Which evidence proves fw1 receives no more vendor patches?", opts:["Vendor lifecycle bulletin","Vendor service-release bulletin","Records-retention policy","Asset crate record (inventory data)"], a:0},
  {q:"Which evidence shows srv1 has an unapplied security patch?", opts:["Vendor lifecycle bulletin","Vendor service-release bulletin","Records-retention policy","Disposal log"], a:1},
  {q:"Which evidence forbids destroying nas1 today?", opts:["Vendor lifecycle bulletin","Vendor service-release bulletin","Records-retention policy","Network diagram"], a:2},
  {q:"Which evidence shows lt2's drive cannot be wiped?", opts:["Vendor lifecycle bulletin","Crate record (inventory data)","Vendor service-release bulletin","IP address plan"], a:1}
];

/* Workbench */
const BENCH_ACTIONS = [
  {id:"patch",   label:"Apply security patch"},
  {id:"bugfix",  label:"Apply bug fix"},
  {id:"os",      label:"Upgrade OS"},
  {id:"fw",      label:"Update firmware"},
  {id:"monitor", label:"Monitor — plan refresh"},
  {id:"replace", label:"Schedule replacement"}
];
const BENCH_TOGGLES = [
  {id:"tested",  label:"Tested in lab first"},
  {id:"window",  label:"Maintenance window scheduled"},
  {id:"rollback",label:"Rollback plan prepared"},
  {id:"interim", label:"Interim compensating controls noted"}
];
const BENCH_VALID = {
  srv1:{action:"patch", toggles:["tested","window","rollback"]},
  ap1:{action:"fw",    toggles:["tested","window","rollback"]},
  srv2:{action:"os",   toggles:["tested","window","rollback"]},
  sw1:{action:"monitor",toggles:[]},
  fw1:{action:"replace",toggles:["interim"]},
  sw2:{action:"replace",toggles:[]}
};
/* Which actions are unavailable per device, with the teaching reason */
const BENCH_DISABLED = {
  fw1:{patch:"No vendor security patch exists — NCware 7.x ended support 2026-03-31.",
       bugfix:"No vendor bug fixes exist for NCware 7.x.",
       os:"The migration to NCware 9.x is a hardware replacement project, not an in-place upgrade for this unit.",
       fw:"Vendor firmware updates ended with support on 2026-03-31."},
  sw2:{patch:"No vendor patch exists — Coreware 9.x ended support 2025-08-15.",
       bugfix:"No vendor bug fixes exist for Coreware 9.x.",
       os:"In-place OS moves are not offered on EOS platforms.",
       fw:"Vendor firmware updates ended with support on 2025-08-15."},
  sw3:{patch:"The vendor ships no patches; the DepotCare contract swaps hardware, it does not patch software.",
       bugfix:"No vendor bug fixes exist for Coreware 9.x.",
       os:"In-place OS moves are not offered on EOS platforms.",
       fw:"Vendor firmware updates ended with support on 2025-08-15."},
  sw1:{patch:"Already current on Coreware 12.4L — nothing to patch today; the job is refresh planning.",
       bugfix:"Already current on Coreware 12.4L.",
       os:"Coreware 12.4L is the latest release for CX-9400.",
       fw:"Already current on Coreware 12.4L."},
  srv1:{replace:"srv1 is supported and current — replacement is not justified by lifecycle.",
        os:"OS 14.2 is already installed."},
  srv2:{patch:"No security patch exists for Stratus OS 11.x past end-of-support.",
        bugfix:"No bug fixes ship for OS 11.x any more.",
        fw:"UEFI 2.14 ships with vendor support — but it is the step BEFORE the OS upgrade (see rollout ordering), not a substitute for it."},
  ap1:{replace:"ap1 is EOL but still supported until 2027-01-31 — update firmware and plan, do not bin it yet.",
       os:"APs take firmware images, not OS upgrades.",
       patch:"APs take firmware images; 6.2.3 carries the security fix.",
       bugfix:"APs take firmware images; 6.2.3 carries the bug fixes."},
  ap2:{replace:"ap2 is fully supported — no lifecycle reason to replace.",
       os:"APs take firmware images, not OS upgrades.",
       patch:"APs take firmware images.",
       bugfix:"APs take firmware images."},
  nas1:{replace:"nas1 holds data under a legal hold until 2031 — its data outlives this decision.",
        patch:"YardlineOS 3.1 is current.",
        bugfix:"YardlineOS 3.1 is current.",
        os:"YardlineOS 3.1 is current for this model."},
  lt1:{patch:"lt1 is leaving the company — it is at the disposal gate, not the workbench.",
       bugfix:"lt1 is leaving the company.", os:"lt1 is leaving the company.",
       fw:"lt1 is leaving the company.", monitor:"lt1 is at the disposal gate — route it, don't babysit it."},
  lt2:{patch:"lt2 is leaving the company — its failing drive belongs at the disposal gate.",
       bugfix:"lt2 is leaving the company.", os:"lt2 is leaving the company.",
       fw:"lt2 is leaving the company.", monitor:"lt2 is at the disposal gate."},
  md1:{patch:"md1 is leaving the company — route it through the disposal gate.",
       bugfix:"md1 is leaving the company.", os:"md1 is leaving the company.",
       fw:"md1 is leaving the company.", monitor:"md1 is at the disposal gate."}
};

/* Disposal gate */
const GATE_ROUTES = [
  {id:"resale",  label:"Wipe → resell"},
  {id:"shred",   label:"Destroy — shred media"},
  {id:"degauss", label:"Degauss (magnetic media only)"},
  {id:"recycle", label:"Recycle as e-waste"},
  {id:"reset",   label:"Factory reset → recycle"},
  {id:"archive", label:"Archive & retain (legal hold)"}
];
const GATE_STEPS = [
  {id:"backup",   label:"Backup & transfer data"},
  {id:"wipe",     label:"Secure wipe performed"},
  {id:"cert-erase",   label:"Erasure certificate filed"},
  {id:"cert-destroy", label:"Destruction certificate filed"},
  {id:"sim-sd",   label:"SIM & SD removed"},
  {id:"reset",    label:"Factory reset done"},
  {id:"retention",label:"Retention hold recorded"},
  {id:"sanitize", label:"Config store sanitized"}
];
const GATE_ASSETS = ["lt1","lt2","md1","nas1","fw1","sw2"];
const GATE_ANSWERS = {
  lt1:{route:"resale", steps:["backup","wipe","cert-erase"]},
  lt2:{route:"shred", steps:["cert-destroy"]},
  md1:{route:"reset", steps:["sim-sd","reset"]},
  nas1:{route:"archive", steps:["retention"]},
  fw1:{route:"recycle", steps:["sanitize"]},
  sw2:{route:"recycle", steps:["sanitize"]}
};
const GATE_META = {
  lt1:"Healthy SSD · internal data · resale candidate",
  lt2:"Failing HDD · confidential HR files · cannot be wiped",
  md1:"Active SIM + SD card · returned from depot closure",
  nas1:"RESTRICTED data · retention rule RR-12 until 2031-06-30",
  fw1:"Replaced EOS firewall · security appliance past support",
  sw2:"Replaced EOS edge switch · second-life hardware"
};

/* Sanitization matrix (H7) */
const MATRIX_CASES = [
  {t:"Working HDD holding confidential data, laptop bound for resale", a:0},
  {t:"Failing HDD that cannot be wiped, holding restricted data", a:2},
  {t:"SSD holding restricted data, media leaving the organization", a:1},
  {t:"Magnetic backup tapes with internal data, leaving the building", a:3}
];
const MATRIX_OPTS = ["Secure wipe (overwrite)","Crypto-erase (SSD-safe)","Shred / destroy","Degauss"];

/* Firmware near-miss (H5) */
const FW_TARGET_OPTS = ["6.2.3","7.0.0","6.2.2 (withdrawn)","Stay on 6.2.1"];
const FW_TARGET_A = 0;
const FW_REASON_OPTS = [
  "7.0.0 needs A550 hardware — 6.2.3 is the newest A320 image",
  "7.0.0 is the biggest number, so it must fit the AP",
  "6.2.2 was released later in the year than 6.2.3",
  "No update is needed until end-of-support arrives in 2027"
];
const FW_REASON_A = 0;

/* Rollout ordering (H4) */
const ROLLOUT_STEPS = [
  "srv1 — apply security patch SP-2026-11A (CVE-2026-0341 is actively exploited)",
  "srv2 — update UEFI firmware to 2.14 (prerequisite for OS 14)",
  "srv2 — upgrade OS 11.4 → 14.2",
  "ap1 — update firmware to 6.2.3 in the warehouse maintenance window"
];
const ROLLOUT_DISPLAY = [2,0,3,1];

/* Incident response sequence (H3) */
const INCIDENT_STEPS = [
  "Confirm exposure — verify fw1 runs affected NCware 7.9.1 on the perimeter",
  "Apply interim compensating controls — isolate management interface, add monitoring",
  "Stand up the replacement firewall on NCware 9.x",
  "Cut over, verify policies and traffic",
  "Decommission fw1 at the disposal gate and update records"
];
const INCIDENT_DISPLAY = [3,0,4,1,2];

/* Risk statement fact pool (H9) */
const FACTS = [
  {id:"f1", t:"Past EOS, the vendor ships no security patches for the firewall OS.", ok:true},
  {id:"f2", t:"CVE-2026-1187 is actively exploited against NCware 7.x, and no fix is coming.", ok:true},
  {id:"f3", t:"Unsupported systems cannot be brought back into compliance during audits.", ok:true},
  {id:"f4", t:"EOS devices stop working the moment support ends.", ok:false},
  {id:"f5", t:"End-of-life means the vendor has gone out of business.", ok:false},
  {id:"f6", t:"A third-party maintenance contract restores vendor security patches.", ok:false},
  {id:"f7", t:"EOL equipment must be destroyed immediately upon announcement.", ok:false}
];

/* Records office ledger */
const LEDGER_MED = [
  {id:"l1", t:"Asset inventory updated — disposed devices marked out of service", ok:true},
  {id:"l2", t:"Network diagram updated — removed devices erased from the drawing", ok:true},
  {id:"l3", t:"Disposal / erasure certificates filed for every media that left", ok:true},
  {id:"l4", t:"Software licenses deactivated or transferred for departing machines", ok:true},
  {id:"l5", t:"Pre-dispatch backups deleted immediately", ok:false},
  {id:"l6", t:"Help-desk ticket history deleted", ok:false},
  {id:"l7", t:"Security patch SP-2026-11A applied to fw1 as a closure step", ok:false},
  {id:"l8", t:"Storage-room crates discarded without records", ok:false}
];
const LEDGER_HARD = {
  predone:[
    {id:"p1", t:"Data on lt1 backed up and transferred before the wipe"},
    {id:"p2", t:"Erasure certificate for lt1 filed"},
    {id:"p3", t:"Retention hold RR-12 recorded for nas1"},
    {id:"p4", t:"Help-desk tickets for the refresh batch closed"}
  ],
  gaps:[
    {id:"g1", t:"Asset inventory updated — fw1, sw2, lt1, lt2, md1 marked disposed", ok:true},
    {id:"g2", t:"Network diagram updated — fw1 removed from the perimeter drawing", ok:true},
    {id:"g3", t:"Destruction certificate for lt2 filed", ok:true},
    {id:"g4", t:"Software licenses deactivated / transferred for lt1 & lt2", ok:true}
  ],
  traps:[
    {id:"t1", t:"Delete the help-desk ticket history entirely", ok:false},
    {id:"t2", t:"Wipe the pre-dispatch backups immediately", ok:false},
    {id:"t3", t:"Apply SP-2026-11A to fw1 as a closure step", ok:false}
  ]
};

/* Glossary */
const GLOSSARY = [
  ["EOL (end-of-life)","Vendor stops making/selling the product; support may continue for a while."],
  ["EOS (end-of-support)","Vendor ends all support: no patches, fixes, tech support or parts (a.k.a. end of service life, EOSL)."],
  ["Patch","Small software fix, often security-related, applied to an existing version."],
  ["Bug fix","Update that corrects faulty behavior without adding features or security changes."],
  ["Security patch","Update that closes a vulnerability — the highest-priority patch class."],
  ["Hotfix","An urgent, targeted fix shipped outside the normal release cadence."],
  ["OS upgrade","Move to a new major operating-system version — planned, tested, reversible."],
  ["Firmware","Low-level software inside a device (switch, AP, firewall, BIOS/UEFI) controlling its hardware."],
  ["Maintenance window","Approved off-hours period in which disruptive changes may be applied."],
  ["Rollback plan","The pre-defined way to undo a change: previous image, config backup, snapshot."],
  ["Legacy system","Old system still in production, often because an app depends on it."],
  ["Media sanitization","Deliberately erasing data so it cannot be recovered (overwrite / crypto-erase)."],
  ["Degaussing","Erasing magnetic media with a strong field — ineffective on SSDs and flash."],
  ["Certificate of destruction","Record proving media were sanitized or destroyed — audit and legal proof."],
  ["Legal hold / retention","A rule that certain data must be kept until a set date, blocking destruction."],
  ["E-waste recycling","Disposing of electronics through certified recycling channels."]
];

/* ================= OBJECTIVES ================= */
const OBJ_MED = [
  {id:"M1", pillar:"p1", zone:"core", title:"Order the asset's road",
   desc:"In the Orientation Shed, click the five lifecycle stages in the order an asset travels them — first to last.",
   anchor:"Life-cycle management · chain position (timeline)", hints:[
     "Start from the day the asset is happily serving traffic.",
     "The vendor's sell-out date comes before the support-cut date.",
     "Order: in production → EOL announced → end-of-sale → EOS → decommission."],
   fb:"That order is the spine of the whole lesson: EOL is a planning signal, EOS is the risk line, decommissioning is the controlled exit. Every exam question about \"what should we do now?\" is answered by finding the device's position on this road."},
  {id:"M2", pillar:"p1", zone:"core", title:"Define EOL vs EOS",
   desc:"In the Orientation Shed, pick the correct definition for end-of-life and for end-of-support from the two dropdowns.",
   anchor:"EOL definition · EOS definition", hints:[
     "One term is about no longer being SOLD; the other is about no longer being SUPPORTED.",
     "EOL: making and selling stop. EOS: patches, fixes, support and parts all stop.",
     "EOL = 'stops making/selling, support may continue'. EOS = 'all patches, fixes, support and parts end'."],
   fb:"EOL vs EOS is the most-tested distinction in this lesson. Selling stops first (EOL/end-of-sale); support dies later (EOS). Mixing them up turns refresh planning into fake emergencies — or real incidents into paperwork."},
  {id:"M3", pillar:"p1", zone:"core", title:"What vanishes at EOS?",
   desc:"Tick every capability that disappears when a product reaches end-of-support — and leave the ones that don't.",
   anchor:"EOS definition — what support includes", hints:[
     "Think about what a support contract actually delivers to you.",
     "Four of the six items vanish; the device itself keeps booting.",
     "Security patches, bug fixes, technical support and spare parts all end."],
   fb:"EOS removes every form of vendor help: security patches, bug fixes, technical support, spare parts. What does NOT happen: the device does not stop working — that's precisely why EOS devices linger dangerously in production."},
  {id:"M4", pillar:"p2", zone:"depot", title:"Lamp the six core devices",
   desc:"On the Depot Floor, set the lifecycle lamp for fw1, sw1, sw2, ap1, srv1 and srv2 — Supported, EOL, or EOS — using the Notice Board and each crate's data (open a crate for dates).",
   anchor:"EOL vs EOS classification across the estate", hints:[
     "Compare each crate's end-of-support date with yard date Nov 9, 2026. Passed = EOS.",
     "End-of-sale passed but end-of-support still ahead = EOL (plan refresh).",
     "fw1 EOS · sw1 EOL · sw2 EOS · ap1 EOL · srv1 Supported · srv2 EOS."],
   fb:"Three lamps go red (fw1, sw2, srv2 — all past EOS), two amber (sw1, ap1 — EOL but still supported), one green (srv1). Amber EOL gear needs a refresh plan, not panic. Red EOS gear needs action now. That split — plan vs act — is the whole management skill."},
  {id:"M5", pillar:"p2", zone:"core", title:"Sort the update types",
   desc:"In the Orientation Shed, classify the five update items as security patch, bug fix, OS upgrade, or firmware update.",
   anchor:"Software management: patches & bug fixes · OS · firmware", hints:[
     "Ask what layer changes: app fix, vulnerability fix, whole OS, or device low-level code.",
     "Print-queue fix = bug fix. Privilege-escalation fix = security patch.",
     "1 security patch · 2 bug fix · 3 OS upgrade · 4 firmware · 5 firmware (UEFI is firmware)."],
   fb:"The exam expects you to name the layer: security patches close CVEs and go first, bug fixes correct behavior, OS upgrades move major versions (plan + rollback), firmware updates rewrite device low-level code (UEFI counts as firmware). Different layers, different risks, different schedules."},
  {id:"M6", pillar:"p3", zone:"depot", title:"Flag the urgent risks",
   desc:"On the Depot Floor, tick the urgent-risk flag on every device that is already PAST end-of-support. Don't flag merely-EOL gear.",
   anchor:"Lifecycle risk detection — EOS devices in production", hints:[
     "Check each core device's end-of-support date against Nov 9, 2026.",
     "Only 'PASSED' EOS dates get a flag.",
     "Flag fw1, sw2 and srv2 — nothing else."],
   fb:"fw1, sw2 and srv2 are past EOS: no security patches will ever come for them while they keep serving traffic. EOL devices (sw1, ap1) are flagged for budgeting, not for emergencies — flagging them 'urgent' would drown the real risks."},
  {id:"M7", pillar:"p3", zone:"core", title:"Name the evidence",
   desc:"In the Orientation Shed, match each question to the evidence source that answers it — bulletins, service releases, policy, or the crate record.",
   anchor:"Evidence sources: bulletins · inventory · policy", hints:[
     "Each row has a different answer — no source is used twice.",
     "'No more patches' lives in a lifecycle bulletin; 'must keep records' lives in policy.",
     "1 bulletin · 2 service-release bulletin · 3 retention policy · 4 crate record."],
   fb:"Lifecycle facts have authoritative sources: vendor bulletins announce EOL/EOS dates, service releases list available patches, retention policies constrain disposal, and the asset inventory itself carries versions and data classifications. Knowing WHERE a fact lives is half of lifecycle management."},
  {id:"M8", pillar:"p4", zone:"bench", title:"Plan the software management",
   desc:"At the Workbench, set the correct decision and preflight toggles for four supported devices: srv1, ap1, srv2, sw1.",
   anchor:"Software management plan: patch / OS / firmware with test-window-rollback", hints:[
     "srv1 has a security patch waiting; ap1 has firmware 6.2.3; srv2 needs the OS upgrade; sw1 needs no change today.",
     "Every APPLY-type action needs all three preflights: tested, window, rollback.",
     "srv1 = security patch + all 3 toggles · ap1 = firmware + all 3 · srv2 = OS upgrade + all 3 · sw1 = Monitor/plan refresh."],
   fb:"This is software management exactly as the exam frames it: patches and firmware updates ship through change control — tested first, applied in a maintenance window, reversible by rollback plan. And sw1 (EOL but supported, already current) gets monitoring and a refresh date, not a change ticket."},
  {id:"M9", pillar:"p4", zone:"bench", title:"Prove patches can't fix EOS",
   desc:"At the Workbench, try to patch the two EOS devices (fw1, sw2), read what happens, then set their real decisions — including interim controls for fw1.",
   anchor:"EOS software cannot be patched → replace + compensating controls", hints:[
     "Try the 'Apply security patch' chip on fw1 and watch the yard's answer.",
     "Past EOS, the only real decision is replacement.",
     "fw1 = Schedule replacement + 'interim controls' toggle · sw2 = Schedule replacement."],
   fb:"The chips were disabled on purpose: past EOS there IS no patch — the vendor will never publish one. The remedy is replacement/upgrade, plus interim compensating controls (isolation, monitoring) to survive the window until the replacement lands."},
  {id:"M10", pillar:"p4", zone:"gate", title:"Route the departures",
   desc:"At the Disposal Gate, choose the correct route and required steps for lt1, lt2, md1, nas1 and fw1.",
   anchor:"Decommissioning: disposal routes · certificates · legal hold", hints:[
     "Match the route to media condition and data sensitivity; one device has a legal hold.",
     "Working drive + resale → wipe. Failing drive → shred. Phone → SIM/SD + reset. Retention rule → archive. Unsupported firewall → recycle, never resell.",
     "lt1 wipe/resell (backup, wipe, cert) · lt2 shred (cert) · md1 reset+recycle (SIM/SD, reset) · nas1 archive (record hold) · fw1 recycle (sanitize config)."],
   fb:"Disposal decisions weigh three things: can the media be sanitized (working vs failing), how sensitive is the data, and what does the law/policy demand (retention holds, certificates). And note fw1: an unsupported security appliance should never be resold into someone else's production."},
  {id:"M11", pillar:"p4", zone:"office", title:"Close the books",
   desc:"In the Records Office, tick the four closure actions that genuinely finish a decommissioning — and leave the three bad ideas unticked.",
   anchor:"Documentation closure: inventory · diagram · certificates · licenses", hints:[
     "Decommissioning ends when the paperwork no longer lies about the network.",
     "Two documents, one certificate, one license action are real; the other three are mistakes.",
     "Tick: inventory, network diagram, certificates, licenses. Leave: deleting backups/tickets, patching EOS gear."],
   fb:"Documentation closure is part of decommissioning: the asset inventory and network diagram must stop showing devices that no longer exist, certificates must be filed as proof, and licenses must be reclaimed. Deleting backups or ticket history destroys evidence, not clutter."}
];

const OBJ_HARD = [
  {id:"H1", pillar:"p2", zone:null, title:"Classify the floor under noise",
   desc:"The board mixes lifecycle notices with marketing. Set the lifecycle lamp for ALL SEVEN Corelan/Northcell/Stratus/Apex devices on the floor, and mark the two notices that are NOT vendor lifecycle notices.",
   anchor:"EOL vs EOS classification + evidence noise (MKT-2026-063, MKT-2026-058)", nudge:"Seven lamps: check each device's end-of-support date against Nov 9, 2026. The two board items without dates or support language are the noise."},
  {id:"H2", pillar:"p3", zone:null, title:"Unsupported & sensitive triage",
   desc:"Part 1: flag urgent-risk on every device that receives NO vendor security updates of any kind (four exist — one hides behind a contract note). Part 2: also flag 'high risk' on the two of them whose role or data makes them immediately dangerous.",
   anchor:"Lifecycle risk detection · third-party-support trap (sw3)", nudge:"Read sw3's crate note carefully: what does DepotCare actually provide? Hardware swaps — not vendor security patches."},
  {id:"H3", pillar:"p4", zone:"bench", title:"The firewall incident sequence",
   desc:"fw1 runs exploited EOS software on the perimeter. Click the five response steps in the correct operational order, first action to last.",
   anchor:"EOS remediation: confirm → compensate → replace → cut over → decommission", nudge:"You cannot fix what you haven't confirmed, and you don't tear out the old firewall before the new one passes traffic."},
  {id:"H4", pillar:"p4", zone:"bench", title:"Rollout ordering with prerequisites",
   desc:"Click the four software actions into the order you would run them across the calendar — dependencies and risk first. Then tick 'rollback plan prepared for every action'.",
   anchor:"Software management sequencing: exploited patch first, firmware prerequisite before OS upgrade", nudge:"One action is a hard prerequisite for another (server firmware before its OS upgrade), and one CVE is being exploited today."},
  {id:"H5", pillar:"p2", zone:"depot", title:"Firmware near-miss",
   desc:"For ap1, pick the correct target firmware version AND the statement that explains why the other big-number image is wrong.",
   anchor:"Firmware version compatibility (NB-2026-052 · crate data)", nudge:"Version numbers don't install on hardware they weren't built for — check which series each image supports."},
  {id:"H6", pillar:"p4", zone:"gate", title:"Route all six departures",
   desc:"At the Disposal Gate, set the correct route AND every required pre-dispatch step for all six leaving assets.",
   anchor:"Decommissioning: routes + certificates + SIM/SD + legal hold", nudge:"lt2's media cannot be wiped, md1 has removable media inside it, nas1's data outlives the hardware, and unsupported security appliances are never resold."},
  {id:"H7", pillar:"p4", zone:"gate", title:"Sanitization matrix",
   desc:"Match each of the four media cases to the correct sanitization method — one case punishes the classic flash-storage mistake.",
   anchor:"Sanitize-or-destroy matched to media type and data sensitivity", nudge:"Degaussing needs magnetic platters to erase. Ask 'does this media even have them?'"},
  {id:"H8", pillar:"p3", zone:"office", title:"Closure audit",
   desc:"The Records Office ledger is half-done. Tick exactly the items that are genuinely still missing before this disposal batch can close — no more, no less.",
   anchor:"Documentation closure audit — find the gaps", nudge:"Two documents still describe the old reality, one certificate is missing, and licenses are still active. Everything already green is done — don't re-tick it."},
  {id:"H9", pillar:"p1", zone:"core", title:"The executive risk statement",
   desc:"In the Orientation Shed, select exactly the three facts that justify to leadership why the EOS firewall must be replaced now — leave the four misconceptions unticked.",
   anchor:"EOS risk articulation · misconceptions as distractors", nudge:"Three facts: what support ending means, what the CVE bulletin says, and what auditors do. Everything about devices dying instantly or vendors going bankrupt is fiction."}
];

/* ================= QUIZZES =================
   R4: correct-answer index rotates across items (no fixed position).
   R5: all options within ~1 word of each other — length never gives away the answer.
   t:  objective the item maps to (drives the completion report's focus areas). */
const QUIZ_MED = [
  {q:"A vendor bulletin says your switch model is “end-of-life”. What does that actually mean?",
   o:["The switch stops forwarding traffic that day","All support and spare parts have ended","The vendor stopped making and selling it","The switch must be destroyed this quarter"], a:2, t:"M2",
   e:"EOL/end-of-sale stops SALES — deployed units keep running and usually keep vendor support until the end-of-support date. “All support and parts have ended” describes EOS, which arrives later; and nothing breaks on EOL day, which is exactly the trap."},
  {q:"End-of-support (EOS) means…",
   o:["The vendor ends patches, fixes, support and parts","You can no longer buy the product new","The warranty flips to third-party support","The device needs a firmware update now"], a:0, t:"M2",
   e:"EOS is the total end of vendor support — all four pillars vanish at once. “Can no longer buy new” describes EOL/end-of-sale, which comes first; and a third-party contract swaps hardware but does not restore vendor patches."},
  {q:"Which date typically arrives first for a product?",
   o:["They always land the same day","End-of-support comes first","Neither — products never expire","End-of-sale / end-of-life comes first"], a:3, t:"M1",
   e:"The road runs: EOL announced → end-of-sale → years of support → end-of-support. The gap between the sale and support dates is the planning window — refresh budgets and migrations live there, not in emergencies."},
  {q:"You must update AP firmware tonight. Which sequence follows best practice?",
   o:["Test first, apply in business hours, verify later","Test, schedule a window, prepare rollback, apply, verify","Schedule the window, apply, ask users to retest","Skip rollback — a firmware update is always reversible"], a:1, t:"M8",
   e:"Safe change control is test → maintenance window → rollback plan → apply → verify. “Always reversible” is exactly the myth the rollback plan exists to defeat, and business-hours applies risk user traffic."},
  {q:"SP-2026-11A closes an actively exploited privilege-escalation flaw; BF-2026-104 fixes stuck print jobs. Tonight there's time for one. Which ships first?",
   o:["SP-2026-11A — actively exploited flaws go first","BF-2026-104 — stuck print jobs annoy users","Either — the two are equally urgent","Neither — wait for the next service pack"], a:0, t:"M5",
   e:"An actively exploited vulnerability outranks convenience: the security patch ships tonight, the bug fix rides the next window. Waiting for a service pack while a hole is open is how breaches happen."},
  {q:"A healthy laptop leaves the company for resale. What must happen before it crosses the gate?",
   o:["Nothing — the new owner will format it","Delete the user profile and the files","Remove the company logo and asset tag","Secure wipe plus a certificate of erasure"], a:3, t:"M10",
   e:"Disposal starts with media sanitization plus documented proof. A new owner's format is neither your control nor your evidence, and a deleted profile leaves data recoverable — the certificate is what survives the audit."},
  {q:"Your NAS holds driver-license scans that a retention rule says must be kept until 2031. The NAS is due for disposal. What do you do?",
   o:["Shred it today — retention rules are rules","Archive and retain the data; defer destruction","Sell the NAS with the drives inside","Format the drives and reuse the NAS"], a:1, t:"M10",
   e:"Records-retention and legal holds outrank the refresh schedule: keep the data until the hold expires, document the deferral, and only then destroy. Selling regulated data or formatting it away is a breach either way."}
];
const QUIZ_HARD = [
  {q:"Branch edge switch THF-SW-031 runs Coreware 9.2.7; NB-2025-087 says Coreware 9.x ended support 2025-08-15. A junior suggests “we'll patch it this weekend.” What is actually true?",
   o:["Patch it — edge switches are low risk","Firmware 6.2.3 will fix the switch","A reboot clears the EOS status","No patch exists — replace, add interim controls"], a:3, t:"H2",
   e:"Past EOS the vendor publishes nothing — the weekend patch can never happen. The remedy is replacement (or upgrade where offered) plus compensating controls meanwhile; 6.2.3 is an access-point image, not a switch fix, and no reboot changes a support date."},
  {q:"fw1 runs actively exploited EOS software on the perimeter. The replacement arrives in 12 days. What is the correct immediate move?",
   o:["Shut the firewall down until replacement arrives","Isolate and monitor now, prepare the cutover","Leave everything — EOS is only paperwork","Flash NCware 9 yourself over the weekend"], a:1, t:"H3",
   e:"Compensating controls (isolate management, add monitoring) plus cutover preparation is the standard EOS incident pattern. Tearing out the perimeter blind, or self-installing an unsupported OS, is not a controlled change — and doing nothing leaves an exploited box exposed."},
  {q:"Which device must NOT be resold — and why?",
   o:["fw1 — an unpatchable firewall lands in another network","lt1 — laptops always hold too many files","md1 — scanners are single-purpose devices","nas1 — NAS units are too heavy to ship"], a:0, t:"H6",
   e:"Sanitization makes ordinary resale safe — file count, purpose and weight are fiction. But a security appliance past EOS is an unpatchable firewall wherever it lands: recycle it, never resell it."},
  {q:"A drive with restricted data failed and cannot be wiped. Correct disposal?",
   o:["Degauss it and resell the laptop","Sell it as-is and disclose the failure","Shred the media, file a destruction certificate","Factory reset from the broken OS"], a:2, t:"H6",
   e:"When media cannot be sanitized, destruction IS the control — with the certificate that proves it. Degaussed drives cannot be resold, a disclosure is not a control, and a failed OS cannot reset anything reliably."},
  {q:"Why is degaussing the wrong method for an SSD?",
   o:["SSD drives are too heavy for the machine","Flash has no magnetic platters to erase","Degaussing works but it is far too slow","The process would void the SSD warranty"], a:1, t:"H7",
   e:"Degaussing corrupts magnetic domains on platters and tapes; flash cells have none, so nothing is sanitized. The SSD-safe routes are crypto-erase/ATA-sanitize — or physical destruction for dead media. Classic exam trap."},
  {q:"srv2's upgrade plan: what must happen before Stratus OS 11.4 → 14.2 on that server?",
   o:["Nothing — the upgrade runs instantly","A full rack relocation comes first","Install the new OS alongside the old","UEFI to 2.14 first, tested, reversible"], a:3, t:"H4",
   e:"Firmware prerequisites gate OS upgrades: Stratus OS 14 requires UEFI 2.14, applied through the same test → window → rollback discipline. Parallel installs are not the supported path, and rack location has nothing to do with it."},
  {q:"What does a certificate of destruction actually do for the organization?",
   o:["Documented proof media were sanitized or destroyed","Proof that the resale price was fair","An extended warranty for new gear","A substitute for the asset inventory"], a:0, t:"H8",
   e:"Certificates turn “we're pretty sure we wiped it” into audit and legal evidence for regulated data. They complement the asset inventory — they don't replace it — and resale price or warranty was never the point."}
];
