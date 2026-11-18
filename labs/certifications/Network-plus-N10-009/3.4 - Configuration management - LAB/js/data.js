'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — data core (100% synthetic training data)
   Fictional org: Kestrel Valley Transit Authority (KVTA)

   Every piece of lab CONTENT lives here: device configs, ledger files,
   tickets, alert feed, chat log, backup-job report, storage options,
   glossary, change records, sequence steps, the two objective sets
   (including each objective's ui template and check rule — the answer
   key is authored content) and the quiz bank.

   No logic beyond pure helpers: rendering, state and wiring live in the
   other js/ modules.
   ===================================================================== */

/* ---------- configuration file bodies ---------- */
const BASE_EDGE = [
'hostname KV-EDGE-RTR-01',
'enable secret 9 $9$TRN-SYNTH-HASH',
'username netops privilege 15 secret 9 $9$TRN-HASH',
'aaa new-model',
'aaa authentication login default group radius local',
'ip domain name depot.kvta.training.invalid',
'logging host 10[.]20[.]0[.]51',
'logging trap warning',
'snmp-server group opsview v3 priv',
'snmp-server user opsview-mon opsview v3 auth sha TRN-HASH',
'ip access-list standard MGMT-VTY',
' permit 10.10.0.0 0.0.0.255',
' permit 10.20.0.0 0.0.0.255',
'line vty 0 4',
' transport input ssh',
' access-class MGMT-VTY in',
'interface Vlan140',
' description fare-gates',
' ip address 10.140.0.1 255.255.255.0',
'interface GigabitEthernet0/0',
' description uplink-to-KV-FW-01',
' ip address 10.10.1.2 255.255.255.252',
'end'];

const RUN_EDGE = [
'hostname KV-EDGE-RTR-01',
'enable secret 9 $9$TRN-SYNTH-HASH',
'username netops privilege 15 secret 9 $9$TRN-HASH',
'username tmpadmin privilege 15 secret 9 $9$TRN-HASH',
'aaa new-model',
'aaa authentication login default group radius local',
'ip domain name depot.kvta.training.invalid',
'logging trap warning',
'snmp-server group opsview v3 priv',
'snmp-server user opsview-mon opsview v3 auth sha TRN-HASH',
'ip access-list standard MGMT-VTY',
' permit 10.10.0.0 0.0.0.255',
' permit 10.20.0.0 0.0.0.255',
' permit 10.99.9.0 0.0.0.255',
'line vty 0 4',
' transport input ssh',
' access-class MGMT-VTY in',
'interface Vlan140',
' description FARE GATES (VLAN140)',
' ip address 10.140.0.1 255.255.255.0',
' ip helper-address 10.10.0.10',
'interface GigabitEthernet0/0',
' description uplink-to-KV-FW-01',
' ip address 10.10.1.2 255.255.255.252',
'access-list 151 remark CHG-2291 fares-to-payments',
'access-list 151 permit ip 10.140.0.0 0.0.0.255 host 10.10.7.25',
'end'];

const BASE_CORE = [
'hostname KV-CORE-SW-01',
'username netops privilege 15 secret 9 $9$TRN-HASH',
'logging host 10[.]20[.]0[.]51',
'spanning-tree mode rapid-pvst',
'vlan 10',' name staff','vlan 20',' name dispatch',
'interface Vlan10',' ip address 10.10.0.2 255.255.255.0',' no shutdown',
'interface GigabitEthernet1/0/1',' description uplink-to-KV-EDGE-RTR-01',' switchport mode trunk',
'end'];

const RUN_CORE = [
'hostname KV-CORE-SW-01',
'username netops privilege 15 secret 9 $9$TRN-HASH',
'logging host 10[.]20[.]0[.]51',
'spanning-tree mode rapid-pvst',
'vlan 10',' name staff','vlan 20',' name dispatch',
'vlan 90',' name printers',
'interface Vlan10',' ip address 10.10.0.2 255.255.255.0',' no shutdown',
'interface GigabitEthernet1/0/1',' description uplink-to-KV-EDGE-RTR-01',' switchport mode trunk',
'end'];

const RUN_FW = [
'hostname KV-FW-01',
'username admin password FireWall-2026!',
'service password-encryption',
'snmp-server community public RO',
'ip http server',
'logging host 10[.]20[.]0[.]51',
'access-list MGMT-ACL permit 10.10.0.0 0.0.0.255',
'line vty 0 4',
' transport input telnet ssh',
'end'];

/* Derived file bodies: the rogue "NEWBASE" contractor file (baseline minus
   syslog, plus the unknown subnet) and the dated archive copies. */
const CFG = { BASE_EDGE, RUN_EDGE, BASE_CORE, RUN_CORE, RUN_FW,
  EDGE_ROGUE: BASE_EDGE.filter(l=>l!=='logging host 10[.]20[.]0[.]51')
    .map(l=>l===' permit 10.20.0.0 0.0.0.255' ? [' permit 10.20.0.0 0.0.0.255',' permit 10.99.9.0 0.0.0.255'] : l)
    .flatMap(l=>l),
  EDGE_BK1108: RUN_EDGE, EDGE_BK1025: BASE_EDGE, FW_BK0814: RUN_FW };

/* ---------- device rack: units and their config-file ledger cards ---------- */
const DEVICES = {
  'KV-EDGE-RTR-01':{ role:'Edge router · fare-gate VLANs', flash:true, files:[
    {id:'edge-run',  name:'running-config (active in RAM)', device:'KV-EDGE-RTR-01', lines:RUN_EDGE, meta:{saved:'live — changes not yet saved to startup', store:'device RAM', by:'—', date:'2026-11-09 05:12', checksum:'9f21c4…e7a1'}},
    {id:'edge-su',   name:'startup-config (loads at boot)', device:'KV-EDGE-RTR-01', lines:BASE_EDGE, meta:{saved:'last write memory', store:'device NVRAM', by:'netops', date:'2026-10-31 21:40', checksum:'c41d8a…9a02'}},
    {id:'edge-gold', name:'kv-edge-rtr-01_GOLDEN.cfg', device:'KV-EDGE-RTR-01', lines:BASE_EDGE, kind:'baseline',
      meta:{saved:'reviewed baseline', store:'cfg-archive (encrypted, offsite)', by:'netops review board', date:'2025-06-14', checksum:'c41d8a…9a02 — recorded in CMDB'}, badges:['GOLDEN','APPROVED']},
    {id:'edge-b1',   name:'kv-edge-rtr-01_2026-11-08_0200.cfg', device:'KV-EDGE-RTR-01', lines:RUN_EDGE, kind:'backup',
      meta:{saved:'nightly job copy', store:'cfg-archive (encrypted, offsite)', by:'backup job edge-nightly', date:'2026-11-08 02:00', checksum:'7be30f…1d55'}, note:'A backup copies production exactly as it was at 02:00 — drift included.'},
    {id:'edge-b2',   name:'kv-edge-rtr-01_2026-10-25_0200.cfg', device:'KV-EDGE-RTR-01', lines:BASE_EDGE, kind:'backup',
      meta:{saved:'nightly job copy', store:'cfg-archive (encrypted, offsite)', by:'backup job edge-nightly', date:'2026-10-25 02:00', checksum:'c41d8a…9a02'}},
    {id:'edge-rog',  name:'kv-edge-rtr-01_NEWBASE_contractor.cfg', device:'KV-EDGE-RTR-01', lines:CFG.EDGE_ROGUE, kind:'unknown',
      meta:{saved:'uploaded in contractor session', store:'cfg-archive /inbox (unreviewed)', by:'p.reyes (vendor)', date:'2026-11-06 23:58', checksum:'none recorded'}, badges:['UNSIGNED']} ]},
  'KV-CORE-SW-01':{ role:'Core switch · staff & dispatch', files:[
    {id:'core-run',  name:'running-config (active in RAM)', device:'KV-CORE-SW-01', lines:RUN_CORE, meta:{saved:'live — changes not yet saved to startup', store:'device RAM', by:'—', date:'2026-11-07 19:22', checksum:'55aa10…b7c3'}},
    {id:'core-su',   name:'startup-config (loads at boot)', device:'KV-CORE-SW-01', lines:BASE_CORE, meta:{saved:'last write memory', store:'device NVRAM', by:'netops', date:'2026-10-31 21:40', checksum:'55aa10…88f1'}},
    {id:'core-gold', name:'kv-core-sw-01_GOLDEN.cfg', device:'KV-CORE-SW-01', lines:BASE_CORE, kind:'baseline',
      meta:{saved:'reviewed baseline', store:'cfg-archive (encrypted, offsite)', by:'netops review board', date:'2025-03-02', checksum:'55aa10…88f1 — recorded in CMDB'}, badges:['GOLDEN','APPROVED']},
    {id:'core-b1',   name:'kv-core-sw-01_2026-11-08_0200.cfg', device:'KV-CORE-SW-01', lines:RUN_CORE, kind:'backup',
      meta:{saved:'nightly job copy', store:'cfg-archive (encrypted, offsite)', by:'backup job core-nightly', date:'2026-11-08 02:00', checksum:'55aa10…b7c3'}} ]},
  'KV-FW-01':{ role:'Firewall · depot perimeter', files:[
    {id:'fw-run',    name:'running-config (active in RAM)', device:'KV-FW-01', lines:RUN_FW, meta:{saved:'live', store:'device RAM', by:'—', date:'2026-11-05 16:03', checksum:'d0e44b…2fa9'}},
    {id:'fw-gold',   name:'kv-fw-01_GOLDEN.cfg', device:'KV-FW-01', lines:RUN_FW, kind:'baseline',
      meta:{saved:'reviewed baseline', store:'cfg-archive (encrypted, offsite)', by:'netops review board', date:'2025-01-10', checksum:'d0e44b…2fa9 — recorded in CMDB'}, badges:['GOLDEN','APPROVED']},
    {id:'fw-b1',     name:'kv-fw-01_2026-08-14_0200.cfg', device:'KV-FW-01', lines:RUN_FW, kind:'backup',
      meta:{saved:'nightly job copy — LAST SUCCESS', store:'cfg-archive (encrypted, offsite)', by:'backup job fw-nightly', date:'2026-08-14 02:00', checksum:'d0e44b…2fa9'}, badges:['STALE']} ]}
};

/* ---------- change tickets (CHG-2291 is the anchor ticket of the story) ---------- */
const TICKETS = {
  chg2291:{id:'CHG-2291', when:'Window: Fri 2026-11-06 23:00 → Sat 01:00 · closed — implemented',
    title:'Fare-gate VLAN service changes — KV-EDGE-RTR-01',
    body:'Requested by fares engineering. Approved by the change board on Thursday. Implementer on site: P. Reyes (vendor contractor). Approved changes:',
    lines:[' ip helper-address 10.10.0.10        (add DHCP relay under Vlan140)',
           'access-list 151 permit ip 10.140.0.0 0.0.0.255 host 10.10.7.25',
           '                                        (fare-gate VLAN → payment server)',
           'rollback plan: restore signed GOLDEN baseline, verify, save']},
  chg2288:{id:'CHG-2288', when:'Closed 2026-11-04', title:'Repair fare-gate label printer port — KV-CORE-SW-01 Gi1/0/12',
    body:'Port flap on a label printer. Repaired and closed before the weekend. Unrelated to fare-gate payment traffic.', lines:[]},
  /* Hard-mode change board: three requests awaiting a decision. The options,
     their explanations and the correct buckets are authored content. */
  h7:{tickets:[
    {id:'CHG-2301', title:'Emergency: rotate local admin credentials on KV-EDGE-RTR-01', when:'Submitted Mon 07:40 · marked emergency',
     body:'During active incident response following the discovery of the unauthorized account. Impact: brief management-plane session drop. Rollback: previous credential set sealed in vault. Evidence and change record attached.',
     opts:['Approve as emergency change','Reject','Defer to next change board'], reasons:{
       'Approve as emergency change':'Correct — it is urgent, scoped, carries a rollback plan, and addresses an active incident. Emergency changes still get recorded and reviewed after the fact.',
       'Reject':'Not the best call — it is urgent, scoped, carries a rollback plan, and addresses an active incident. Delaying credential rotation leaves the unauthorized account usable.',
       'Defer to next change board':'Not the best call — an emergency change exists precisely for this: urgent, risk-assessed work with a rollback plan during an active incident.'}},
    {id:'CHG-2302', title:'Permit branch-office subnet on KV-FW-01', when:'Submitted Mon 09:15',
     body:'“Open the firewall for the new branch office ASAP.” No impact assessment. No rollback plan. Scheduled for Friday 16:30 — Friday afternoon peak. Ticket has one line of text and no test evidence.',
     opts:['Approve as emergency change','Reject','Defer to next change board'], reasons:{
       'Approve as emergency change':'Not defensible — nothing here is urgent except the requester’s mood. No impact assessment, no rollback plan, no test evidence, peak-hour window.',
       'Reject':'Correct — a change with no rollback plan, no impact assessment and no test evidence is exactly what change control exists to stop. Send it back for completion.',
       'Defer to next change board':'Close, but not best — deferral implies it will be heard again as-is. The ticket is incomplete; reject it with the specific gaps named so it can be fixed and resubmitted.'}},
    {id:'CHG-2303', title:'New depot VLAN 90 extension — KV-CORE-SW-01', when:'Submitted Mon 08:02',
     body:'Planned growth: printer VLAN extended to the new depot annex. Tested in the lab rack against the golden baseline. Window requested Sunday 02:00 (lowest traffic). Rollback: remove VLAN 90 extension, re-apply saved baseline. Documentation template attached.',
     opts:['Approve as planned change','Approve as emergency change','Reject','Defer to next change board'], reasons:{
       'Approve as planned change':'Correct — this is a textbook planned change: assessed, lab-tested against the golden baseline, off-peak window, rollback documented. Approve it and schedule the window.',
       'Approve as emergency change':'Wrong bucket — there is nothing emergency about it. It is a textbook planned change: assessed, tested, low-traffic window, rollback documented.',
       'Reject':'Too harsh — this is a model ticket: tested, documented, off-peak window, rollback plan attached. Rejecting well-formed work erodes the process.',
       'Defer to next change board':'Not the best fit — deferral is for tickets that need more information or timing decisions. This one is complete: assess, approve, schedule.'}}
  ]}
};

/* Change-board justifications (H7): shuffled per ticket at render time via
   H7ORD so option position never gives the answer away. */
const H7J=[
  {v:'j1',t:'Urgent, scoped, rollback plan present, addresses an active incident'},
  {v:'j2',t:'No rollback plan, no impact assessment, no test evidence — and a peak-hour window'},
  {v:'j3',t:'Assessed, tested in the lab, off-peak window, rollback documented'}];
const H7WANT={'CHG-2301':'j1','CHG-2302':'j2','CHG-2303':'j3'};
const H7ORD={'CHG-2301':['j2','j3','j1'],'CHG-2302':['j2','j1','j3'],'CHG-2303':['j1','j3','j2']};

/* ---------- monitor tab: alert feed, shift chat, backup-job report ---------- */
const ALERTS = [
  {t:'Mon 07:12', cls:'hot',  m:'<b>Payment-path probe failing</b> — fare-gate VLAN 140 → payment server 10.10.7.25:443, intermittent timeouts since 06:50. Passenger-facing.'},
  {t:'Mon 07:12', cls:'warm', m:'<b>Log silence</b> — syslog collector has received <b>zero events from KV-EDGE-RTR-01 since Sat 01:37</b>.'},
  {t:'Mon 07:05', cls:'cold', m:'Dispatcher radio bridge: “gate readers are slow again — third time this morning.”'},
  {t:'Mon 07:15', cls:'cold', m:'<b>UPS battery test failed — rack B</b> (monthly scheduled test; known nuisance alarm).'},
  {t:'Mon 07:20', cls:'cold', m:'<b>KV-CORE-SW-01 Gi1/0/12 port flap ×3</b> — fare-gate label printer (ticket CHG-2288 hardware).'},
  {t:'Sat 02:00', cls:'cold', m:'Backup job <b>edge-nightly succeeded</b> — 1 file archived to cfg-archive.'},
  {t:'Sat 01:37', cls:'warm', m:'Config session opened on <b>KV-EDGE-RTR-01</b> — user <b>tmpadmin</b>, source IP <b>10.99.9.44</b>. Session ended 01:52.'},
  {t:'Sat 01:10', cls:'cold', m:'Config session closed on KV-EDGE-RTR-01 — user <b>netops</b>, change window CHG-2291 work complete.'},
  {t:'Sun 02:00', cls:'warm', m:'Backup job <b>fw-nightly FAILED</b> — job alerting found <b>disabled</b> (operator set alert=off on 2026-08-14).'},
  {t:'Sun 02:00', cls:'cold', m:'Backup job <b>core-nightly succeeded</b> — 1 file archived.'}];

const CHATLOG = [
  {t:'Mon 07:05', u:'dispatch1', m:'gate readers slow again, third time this morning'},
  {t:'Mon 07:09', u:'netops.mara', m:'UPS alarm in rack B again — ignore it, monthly test'},
  {t:'Mon 07:18', u:'netops.mara', m:'odd — my log search shows zero events from the edge router since the weekend'}];

const JOBS = [
  {device:'KV-EDGE-RTR-01', sched:'nightly 02:00', last:'Sat 2026-11-08 02:00 — success', alert:'ON',  state:'ok'},
  {device:'KV-CORE-SW-01',  sched:'nightly 02:00', last:'Sun 2026-11-08 02:00 — success', alert:'ON',  state:'ok'},
  {device:'KV-FW-01',       sched:'nightly 02:00', last:'<b style="color:var(--red)">2026-08-14 02:00 — 87 days ago</b>', alert:'<b style="color:var(--red)">OFF</b>', state:'bad'}];

/* ---------- storage options (one compliant home, four traps) ---------- */
const STORAGE = [
  {id:'archive', name:'cfg-archive server', good:true,  desc:'Dedicated config archive: AES-256 encrypted at rest, offsite replica, role-based access, versioned, backup-job alerting wired to the duty phone.'},
  {id:'tftp',    name:'TFTP share · dmz-old', good:false, desc:'Unauthenticated TFTP service in the DMZ webroot. Found holding a 2023 router backup in plaintext. TFTP has no encryption and no access control.'},
  {id:'flash',   name:'Each device’s local flash', good:false, desc:'Copies kept only on the device itself. A dead, wiped or stolen device takes its own backup with it.'},
  {id:'usb',     name:'USB drawer · unlocked rack office', good:false, desc:'Loose USB sticks with configs. Unencrypted, unlabeled, walk-away-able. No version history.'},
  {id:'cloud',   name:'Vendor’s shared cloud folder', good:false, desc:'Unencrypted sync folder shared with an outside vendor “for convenience”. Contains credentials — outside the trust boundary.'}];

/* ---------- glossary drawer content ---------- */
const GLOSSARY = [
  ['Production configuration','The configuration currently in effect on a live device — the state your traffic actually experiences.'],
  ['Running config','The in-memory configuration a device is executing right now. It is the production config while the device is up.'],
  ['Startup config','The saved configuration a device loads when it boots. Running ≠ startup means there are unsaved changes that a reboot will erase.'],
  ['Backup configuration','A point-in-time copy of a device configuration stored off the device, taken on a schedule, used for recovery. A backup captures whatever production was — drift included.'],
  ['Baseline / golden configuration','The reviewed, approved, checksummed known-good reference for a device class. Drift and unauthorized changes are measured against it; rollback lands on it.'],
  ['Configuration drift','Any difference between the production state and the approved baseline — whether it came from an approved change, an operator’s stray keystroke, or tampering.'],
  ['Configuration monitoring','Tooling that continuously compares production against baseline and alerts on drift — and watches backup jobs so a silent failure is caught, not discovered in an incident.'],
  ['Change management','The tracked process for requesting, assessing, approving, scheduling, implementing, verifying and documenting changes.'],
  ['Service request / request tracking','The ticket that carries a change through the process; if a line of config is not traceable to a ticket, it is unauthorized by definition.'],
  ['Maintenance window','The approved time slot in which changes may be implemented — chosen to bound the blast radius if the change misbehaves.'],
  ['Rollback plan','The pre-agreed steps that restore the prior known-good state if a change fails. No rollback plan, no change.'],
  ['Config archive','The storage system holding dated backup and baseline configs under access control and encryption.'],
  ['Checksum','A fingerprint of a file that proves which configuration a file really is — the trust anchor when several files claim to be “the baseline”.'],
  ['Restore test','A scheduled exercise proving a backup can actually be restored. A backup nobody has restored is a hope, not a control.']];

/* ---------- the six comparator change records (M5 stamps these) ---------- */
const CHANGE_RECORDS=[
 {id:'r1',op:'+',line:' ip helper-address 10.10.0.10',ctx:'interface Vlan140',auth:true,
  why:'CHG-2291 approved the DHCP relay for the fare-gate VLAN — traceable to a ticket, so authorized.'},
 {id:'r2',op:'+',line:'access-list 151 permit ip 10.140.0.0 0.0.0.255 host 10.10.7.25',ctx:'with remark “CHG-2291 fares-to-payments”',auth:true,
  why:'Second approved CHG-2291 line: fare-gate VLAN → payment server. Traceable, so authorized.'},
 {id:'r3',op:'+',line:'username tmpadmin privilege 15 secret 9 $9$TRN-HASH',ctx:'after the netops account',auth:false,
  why:'No ticket covers this account. A privileged local user is persistence — and mirrors real tradecraft (Static Tundra created privileged local accounts on Cisco devices).'},
 {id:'r4',op:'−',line:'logging host 10[.]20[.]0[.]51',ctx:'syslog removed',auth:false,
  why:'Removing the syslog host blinds monitoring. Tampering with logging to evade detection is standard attacker behavior.'},
 {id:'r5',op:'+',line:' permit 10.99.9.0 0.0.0.255',ctx:'ip access-list standard MGMT-VTY',auth:false,
  why:'An unknown management subnet added to the VTY allow list — new doors into the device, and the session source (10.99.9.44) matches it.'},
 {id:'r6',op:'~',line:' description fare-gates  →  description FARE GATES (VLAN140)',ctx:'interface Vlan140',auth:false,
  why:'Cosmetic, undocumented — and still unauthorized. If a change is not traceable to a ticket, it is unauthorized by definition, however harmless it looks.'}];

/* ---------- sequence-step texts (keyed: s=rollback, c=change workflow,
   q=hard recovery, x=distractor temptations) ---------- */
const SEQ_STEPS={
 s1:'Restore the signed GOLDEN baseline into the running config',
 s2:'Confirm the unknown management subnet (10.99.9.0/24) is refused',
 s3:'Verify fare-gate and payment services are healthy',
 s4:'Save the running config to startup (write memory)',
 s5:'Run an immediate fresh backup to the encrypted archive',
 s6:'Document the incident and submit the report',
 c1:'Submit the service request with change details',
 c2:'Assess impact and risk; prepare the rollback plan',
 c3:'Obtain change-board approval',
 c4:'Schedule the maintenance window',
 c5:'Implement the change during the window',
 c6:'Verify services and the configuration',
 c7:'Document results; update the baseline if the change is approved',
 q1:'Quarantine: remove 10.99.9.0/24 from the VTY ACL and disable tmpadmin',
 q2:'Restore the signed GOLDEN baseline into the running config',
 q3:'Verify fare-gate and payment services',
 q4:'Save the running config to startup (write memory)',
 q5:'Run an immediate fresh backup of the restored config',
 q6:'Document the incident and preserve the evidence chain',
 x1:'Reboot the router and hope the mess clears itself',
 x2:'Restore the Sat 02:00 backup — it is the most recent file',
 x3:'Promote the contractor NEWBASE file to be the new baseline',
 x4:'Delete backups older than 30 days to save space'};

const PILLARS={P1:'Understand',P2:'Recognize & analyze',P3:'Detect',P4:'Mitigate'};

/* ---------- MEDIUM objective set (11 duty items) ----------
   Each item: id, pillar, title, ctx, where-to-look, tiered hints,
   ui(state) template and check(state) rule. The banks passed to seqUI /
   ORD maps are pre-shuffled so option order never reveals the answer. */
const OBJ_MED=[
 {id:'M1',pillar:'P1',title:'Match each configuration type to its purpose',
  ctx:'The exam’s three config-management artifacts, in one breath: what IS running, what CAN be restored, what SHOULD be running.',
  where:'Answer below — the briefing tab repeats the definitions.',hints:[
   'Production is about the present, backup is about recovery, baseline is about intent.',
   '“Known-good reference that drift is measured against” describes exactly one of the three.',
   'Production = in effect right now · Backup = point-in-time copy for recovery · Baseline = approved reference.'],
  ui:e=>{ const M1O={prod:{v:'prod',t:'The configuration in effect on the live device right now'},
      bk:{v:'bk',t:'A point-in-time copy kept off the device for recovery'},
      base:{v:'base',t:'The approved known-good reference drift is measured against'}};
    const ORD={p:['bk','base','prod'],b:['prod','bk','base'],g:['base','prod','bk']};
    return `<div class="obj-ui">
    ${[['p','Production configuration'],['b','Backup configuration'],['g','Baseline / golden configuration']].map(([k,l])=>
    `<div class="abar" style="margin:0"><div class="field" style="flex:1"><label>${l}</label>${sel('m1',e.m1[k],ORD[k].map(v=>M1O[v]),k,l)}</div></div>`).join('')}</div>`;},
  check:e=>{const ok=e.m1.p==='prod'&&e.m1.b==='bk'&&e.m1.g==='base';
   return {ok,msg:ok?'<b>Signed off.</b> Production = live state; backup = recoverable copy; baseline = approved intent. Everything else in this shift hangs off that triangle. Next: see how the three disagree in practice.':'<b>Not yet.</b> Production describes the live present; a backup is a point-in-time copy taken <i>from</i> production; the baseline is the reviewed reference production is <i>judged against</i>. If production and baseline disagree, that difference is drift.'};}},
 {id:'M2',pillar:'P1',title:'Find the device carrying unsaved changes',
  ctx:'Running ≠ startup means a reboot silently reverts work. Find which unit is exposed.',
  where:'Device rack → open each unit → File viewer → “Compare running ↔ startup”. Then select the device here.',
  hints:['The core switch had port work on it last week.','Run the running↔startup comparison on every unit; one shows added lines in running.',
   'KV-CORE-SW-01: VLAN 90 (printers) exists in running but not in startup.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:13px;color:var(--dim)">Device currently selected on the rack:
    <b style="color:var(--paper);font-family:var(--mono)">${esc(e.selDev)}</b> ·
    running↔startup compared for: ${Object.keys(e.rsCompare).filter(k=>e.rsCompare[k]).map(k=>`<b style="color:var(--paper);font-family:var(--mono)">${k}</b>`).join(', ')||'none yet'}</p></div>`,
  check:e=>{const ok=e.selDev==='KV-CORE-SW-01'&&!!e.rsCompare['KV-CORE-SW-01'];
   return {ok,msg:ok?'<b>Signed off.</b> KV-CORE-SW-01 has VLAN 90 in running but not startup — a reboot erases it. Defender habit: after any verified change, <b>write memory</b> (save running → startup) and confirm the backup job picked it up.':'<b>Not yet.</b> Open each device on the rack and use <b>Compare running ↔ startup</b> in the File viewer; then leave the suspect device selected here. One unit shows lines in running that startup has never seen.'};}},
 {id:'M3',pillar:'P2',title:'Tag the four archive cards for KV-EDGE-RTR-01',
  ctx:'Provenance decides trust: who saved it, when, where it lives, whether a checksum is recorded.',
  where:'Rack → KV-EDGE-RTR-01 → read the four archive cards → tag them below.',
  hints:['GOLDEN + APPROVED stamps and a CMDB-recorded checksum mean exactly one thing.',
   'Nightly job copies are backups — even the one that copied a drifted production config.',
   'The unsigned contractor “NEWBASE” file is none of the three trusted types.'],
  ui:e=>`<div class="obj-ui">${[['edge-gold','kv-edge-rtr-01_GOLDEN.cfg · 2025-06-14 · approved review'],
   ['edge-b1','kv-edge-rtr-01_2026-11-08_0200.cfg · nightly job'],['edge-b2','kv-edge-rtr-01_2026-10-25_0200.cfg · nightly job'],
   ['edge-rog','kv-edge-rtr-01_NEWBASE_contractor.cfg · 2026-11-06 · unsigned']].map(([id,l])=>
   `<div class="abar" style="margin:0"><div class="field" style="flex:1"><label>${l}</label>${sel('tag',e.tags[id],[
     {v:'production',t:'Production config'},{v:'backup',t:'Backup copy'},{v:'baseline',t:'Baseline (golden)'},{v:'draft',t:'Untrusted draft'}],id)}</div></div>`).join('')}</div>`,
  check:e=>{const ok=e.tags['edge-gold']==='baseline'&&e.tags['edge-b1']==='backup'&&e.tags['edge-b2']==='backup'&&e.tags['edge-rog']==='draft';
   return {ok,msg:ok?'<b>Signed off.</b> Both nightly copies are backups — note the 11-08 one copied a <i>drifted</i> production, which is why “newest file” ≠ “trusted state”. The NEWBASE file has no approval record and no checksum: untrusted until reviewed.':'<b>Not yet.</b> The two dated nightly-job files are backups. The file with the GOLDEN and APPROVED stamps plus a CMDB-recorded checksum is the baseline. The contractor upload has no approval record — it is an untrusted draft, not a baseline.'};}},
 {id:'M4',pillar:'P2',title:'Run the comparator: how much drift, and name one piece',
  ctx:'Comparator: signed GOLDEN baseline (A) vs live running config (B) on KV-EDGE-RTR-01.',
  where:'Comparator tab → device KV-EDGE-RTR-01, A = GOLDEN, B = running-config → Run comparison. Then answer below.',
  hints:['Six change records appear. Some trace to CHG-2291; some do not.','A cosmetic description edit with no ticket still counts — undocumented is unauthorized.',
   'Four of the six records are unauthorized. Name tmpadmin, the missing logging host, or the 10.99.9.0 subnet.'],
  ui:e=>`<div class="obj-ui"><div class="abar" style="margin:0">
    <div class="field"><label>Unauthorized changes (count)</label><input type="number" min="0" max="9" data-act="m4count" value="${esc(e.m4.count)}" style="width:90px"></div>
    <div class="field" style="flex:1"><label>Name one security-relevant unauthorized change</label>
    <input type="text" data-act="m4name" value="${esc(e.m4.name)}" placeholder="e.g. a username, a removed server, a subnet…"></div></div></div>`,
  check:e=>{const ran=!!e.compRuns['KV-EDGE-RTR-01|edge-gold|edge-run'];
   const ok=ran&&parseInt(e.m4.count,10)===4&&/(tmpadmin|logging|10\.99\.9)/i.test(e.m4.name||'');
   if(!ran)return {ok:false,msg:'<b>Run the comparison first.</b> Comparator tab → KV-EDGE-RTR-01, reference = GOLDEN baseline, candidate = running-config.'};
   return {ok,msg:ok?'<b>Signed off.</b> Four unauthorized records: a privileged local user (<b>tmpadmin</b>), the removed <b>syslog host</b>, an unknown <b>10.99.9.0/24</b> management subnet, and an undocumented description edit. This is drift with attacker fingerprints — production no longer matches approved intent.':'<b>Close, but no.</b> The diff shows six records; two are authorized by CHG-2291. Count the rest — remember the cosmetic description edit is unauthorized too (no ticket). Name something specific: an account, a removed server IP, or a subnet.'};}},
 {id:'M5',pillar:'P2',title:'Classify all six change records against CHG-2291',
  ctx:'The ticket approved exactly two lines. Stamp every record authorized or unauthorized.',
  where:'Ticket tab shows CHG-2291’s approved lines; the comparator lists records r1–r6. Stamp below.',
  hints:['Trace each record to the ticket text — presence on the ticket is the only test.','The helper-address and the ACL permit line are the approved pair.',
   'r3, r4, r5 and r6 have no ticket. Yes — even the description edit.'],
  ui:e=>`<div class="obj-ui">${CHANGE_RECORDS.map(r=>`<div class="abar" style="margin:0;align-items:center">
    <span class="plate dim" style="min-width:30px;text-align:center">${r.id}</span>
    <span style="flex:1;font-family:var(--mono);font-size:12px;line-height:1.4">${esc(r.line)}<br><span style="color:var(--faint);font-size:11px">${esc(r.ctx)}</span></span>
    <span style="display:flex;gap:6px">${stamps('stamp',r.id,e.classify[r.id])}</span></div>`).join('')}</div>`,
  check:e=>{const ok=CHANGE_RECORDS.every(r=>e.classify[r.id]===(r.auth?'auth':'unauth'));
   return {ok,msg:ok?'<b>Signed off.</b> Two authorized, four not — including a “harmless” description edit. Policy point: <b>undocumented ≠ harmless</b>; anything not traceable to a ticket is unauthorized by definition, because the audit trail is the control.':'<b>Not yet.</b> Match each record against CHG-2291’s approved lines: the DHCP helper and the payment-server ACL permit are authorized. The tmpadmin account, the removed logging host, the 10.99.9.0 permit and the description edit appear on no ticket — stamp them unauthorized.'};}},
 {id:'M6',pillar:'P3',title:'Configure the drift monitor before Monday',
  ctx:'Configuration monitoring compares production against the approved reference and alerts on difference.',
  where:'Monitor tab — set the five controls. Then check here.',
  hints:['“Most recent backup” is a trap: the latest backup captured the drifted config.','Compare like with like: approved intent (baseline) vs live production.',
   'KV-EDGE-RTR-01, reference = signed GOLDEN baseline, at least daily, and the alert must reach a human.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Current monitor state:
    ${e.monitor.dev?`${esc(e.monitor.dev)} · vs ${esc(e.monitor.ref||'—')} · ${esc(e.monitor.freq||'—')} · action=${esc(e.monitor.act||'—')}${e.monitor.watch?' · job-watch ON':' · job-watch OFF'}`:'not configured — use the Monitor tab'}</p></div>`,
  check:e=>{const m=e.monitor;
   const ok=m.dev==='KV-EDGE-RTR-01'&&m.ref==='baseline'&&['hourly','daily'].includes(m.freq)&&['alert','ticket'].includes(m.act);
   return {ok,msg:ok?'<b>Signed off.</b> Production-vs-baseline, checked at least daily, alerting a human. Note what you did <i>not</i> compare against: the most recent backup — it copied the drifted config, so drift-to-drift comparison would stay politely green forever.':'<b>Not yet.</b> The reference must be the <b>signed baseline</b> — the most recent backup contains whatever production was, drift included. Watch the edge router at least daily, and make sure the action actually reaches a person (log-only finds out next week).'};}},
 {id:'M7',pillar:'P3',title:'Find the detection blind spot',
  ctx:'The alert feed shows zero syslog events from the edge router since Sat 01:37. One of the unauthorized records did that.',
  where:'Monitor tab → alert feed (warm row). Then pick the responsible record below.',
  hints:['What would the collector need in order to receive events?','One of the six records deleted a line that pointed at the collector.',
   'r4: “logging host 10[.]20[.]0[.]51” was removed — the device stopped shipping logs.'],
  ui:e=>`<div class="obj-ui">${sel('m7',e.m7,CHANGE_RECORDS.map(r=>({v:r.id,t:r.id+' · '+r.line})),0,'Change record responsible for the log silence')}</div>`,
  check:e=>{const ok=e.m7==='r4';
   return {ok,msg:ok?'<b>Signed off.</b> Removing the syslog host is self-concealment: the device keeps working while the defender goes blind. Restore logging first — it is both evidence recovery and re-armament. Real actors do exactly this (Static Tundra altered logging settings on Cisco devices).':'<b>Not yet.</b> The collector receives nothing since Sat 01:37. Which record removed the line that told the device where to ship logs? That is your blind spot.'};}},
 {id:'M8',pillar:'P4',title:'Repair the fw-nightly backup job',
  ctx:'KV-FW-01’s last successful config backup was 87 days ago, and its failure alerting was switched off. Rebuild the job.',
  where:'Storage & jobs tab → “Repair the fw-nightly job”. Then check here.',
  hints:['Restore-test cadence is a field, not an afterthought — a backup never restored is a hope.','A firewall config contains credential material: the destination must be encrypted and access-controlled.',
   'Daily · encrypted offsite archive · 90 versions · monthly restore test · failure alerting ON.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Job state: ${esc(e.fwJob.sched||'—')} ·
    ${esc(e.fwJob.dest||'—')} · retention ${esc(e.fwJob.ret||'—')} · test ${esc(e.fwJob.test||'—')} ·
    alert ${e.fwJob.alert?'ON':'OFF'} — set it in the Storage &amp; jobs tab.</p></div>`,
  check:e=>{const j=e.fwJob;const ok=['daily','hourly'].includes(j.sched)&&j.dest==='archive'&&j.ret==='90'&&j.test==='monthly'&&j.alert;
   return {ok,msg:ok?'<b>Signed off.</b> Daily encrypted offsite copies, 90 versions, monthly restore test, failure alerting on. That is MITRE ATT&CK <b>M1053 (Data Backup)</b> applied to configs — and the restore test is what turns a backup from a hope into a control.':'<b>Not yet.</b> Rebuild it as: daily (or better) · cfg-archive (encrypted, offsite) · keep 90 versions · <b>monthly</b> restore test · failure alerting ON. Local flash dies with the device; the TFTP share and the vendor folder leak credentials.'};}},
 {id:'M9',pillar:'P4',title:'Sequence the rollback for KV-EDGE-RTR-01',
  ctx:'The board approved returning the edge router to its approved state tonight. Order the six actions.',
  where:'Arrange the steps below.',
  hints:['Kill the new doors before you rebuild the house.','Verification comes before saving: never write a bad state to startup.',
   'Restore → confirm the subnet is refused → verify services → save → fresh backup → document.'],
  ui:e=>seqUI('m9',['s3','s5','s1','s6','s2','s4'],e.seq.m9),
  check:e=>{const ok=JSON.stringify(e.seq.m9)===JSON.stringify(['s1','s2','s3','s4','s5','s6']);
   return {ok,msg:ok?'<b>Signed off.</b> Quarantine the new access, restore approved intent, verify, then <b>save and back up immediately</b> — the save matters: an unsaved fix dies on the next reboot, and the fresh backup replaces the drifted 11-08 archive copy.':'<b>Not yet.</b> A safe rollback: remove the attacker’s access first (ACL + account), restore the signed baseline, <b>verify services before saving</b>, write memory, take a fresh backup, document. Saving before verifying would persist an untested state.'};}},
 {id:'M10',pillar:'P4',title:'Choose the compliant home for config backups',
  ctx:'Five storage locations, one keeps configs safe, secret and independent of the device.',
  where:'Storage & jobs tab → storage cards → select, then check here.',
  hints:['Two criteria: confidentiality (configs contain credentials) and independence (must survive the device dying).',
   'The TFTP share has no authentication and no encryption.','The dedicated archive: encrypted, offsite, access-controlled, versioned.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Selected: ${e.storage?esc(STORAGE.find(s=>s.id===e.storage).name):'nothing yet — pick on the Storage &amp; jobs tab'}</p></div>`,
  check:e=>{const ok=e.storage==='archive';
   return {ok,msg:ok?'<b>Signed off.</b> Encrypted + offsite + access-controlled + versioned. Configs are credential-stuffed files; where they sleep is a security decision. This is the storage half of M1053.':'<b>Not yet.</b> Local flash dies with the device; unauthenticated TFTP in a webroot and an unencrypted vendor cloud folder leak credentials; the USB drawer walks away. The dedicated encrypted, offsite, access-controlled archive is the only compliant home.'};}},
 {id:'M11',pillar:'P4',title:'Sequence the change-management workflow',
  ctx:'CHG-2291 worked because the process ran in order. Rebuild that order — it is the exam’s “request process tracking” bullet.',
  where:'Arrange the seven steps below.',
  hints:['Nothing is touched until a ticket exists and a human has approved.','The rollback plan is prepared in the assessment step — not after failure.',
   'Request → assess (with rollback plan) → approve → window → implement → verify → document.'],
  ui:e=>seqUI('m11',['c5','c2','c7','c1','c4','c6','c3'],e.seq.m11),
  check:e=>{const ok=JSON.stringify(e.seq.m11)===JSON.stringify(['c1','c2','c3','c4','c5','c6','c7']);
   return {ok,msg:ok?'<b>Signed off.</b> Request, assess (rollback plan born here), approve, window, implement, verify, document. CHG-2291 followed exactly this — which is why the two authorized lines in the diff were provably safe to trust.':'<b>Not yet.</b> The order is: submit the request → assess impact and <b>prepare the rollback plan</b> → approval → maintenance window → implement → verify → document (updating the baseline if the change is approved). Implementation before approval is how Friday nights go wrong.'};}}
];

/* ---------- HARD objective set (9 incident-response challenges) ----------
   Strict validation: near-misses are rejected with rationale. H7's answer
   key wants decision + matching justification per ticket. */
const OBJ_HARD=[
 {id:'H1',pillar:'P1',title:'Triage: what broke, where, and since when',
  ctx:'Monday 07:12. Fare-gate payments fail intermittently; the log pipeline is silent. Name the device, the category of cause, and the exact moment evidence stops.',
  where:'Alert feed + shift chat (Monitor tab). No further help.',
  hints:['One nudge: the two cold alarms at 07:15 and 07:20 are noise. Follow the warm rows.'],
  ui:e=>`<div class="obj-ui">
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Device that was tampered with</label>
      ${sel('h1dev',e.h1.dev,Object.keys(DEVICES).map(d=>({v:d,t:d})),0,'Device that was tampered with')}</div></div>
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Category of root cause</label>
      ${sel('h1cause',e.h1.cause,[{v:'unauth',t:'Unauthorized config change (tampering)'},{v:'chgerr',t:'Approved change implemented wrong'},
        {v:'hw',t:'Hardware fault'},{v:'bw',t:'Bandwidth saturation'}],0,'Category of root cause')}</div></div>
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Evidence stops at</label>
      ${sel('h1clue',e.h1.clue,[{v:'sat',t:'Sat 01:37'},{v:'sun',t:'Sun 02:00'},{v:'mon',t:'Mon 07:12'},{v:'fri',t:'Fri 23:00'}],0,'Time when the evidence stops')}</div></div></div>`,
  check:e=>{const ok=e.h1.dev==='KV-EDGE-RTR-01'&&e.h1.cause==='unauth'&&e.h1.clue==='sat';
   return {ok,msg:ok?'<b>Correct.</b> The warm rows line up: syslog silence since <b>Sat 01:37</b> on <b>KV-EDGE-RTR-01</b>, and a config session under user <b>tmpadmin</b> from <b>10.99.9.44</b> starting at that exact minute — after the CHG-2291 window closed at 01:00. UPS and the label printer are red herrings.':'<b>Rejected.</b> Follow the warm evidence only: which device does the log-silence alarm name? Which session record matches that timestamp — and does that user appear on any ticket? The UPS test and the printer port flap have honest explanations.'};}},
 {id:'H2',pillar:'P2',title:'Full drift audit — enter every security-relevant unauthorized element',
  ctx:'Run the comparator yourself (GOLDEN vs running on the edge router) and transcribe the three security-relevant unauthorized elements exactly. Near-misses are rejected.',
  where:'Comparator tab, then enter below. Exact values.',
  hints:['One nudge: one record was <i>removed</i>, not added — transcribe the IP that is gone.'],
  ui:e=>`<div class="obj-ui">
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Unauthorized privileged account</label>
      <input type="text" data-act="h2user" value="${esc(e.h2.user)}" placeholder="exact username"></div></div>
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Syslog server removed from the config</label>
      <input type="text" data-act="h2log" value="${esc(e.h2.log)}" placeholder="exact IP address"></div></div>
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Subnet added to the VTY allow list</label>
      <input type="text" data-act="h2sub" value="${esc(e.h2.subnet)}" placeholder="CIDR, e.g. 10.x.x.x/yy"></div></div></div>`,
  check:e=>{const ran=!!e.compRuns['KV-EDGE-RTR-01|edge-gold|edge-run'];
   const ok=ran&&/^tmpadmin$/i.test(e.h2.user.trim())&&/^10\.20\.0\.51$/.test(e.h2.log.trim())
     &&/^10\.99\.9\.0(\/24)?$/.test(e.h2.subnet.trim());
   if(!ran)return {ok:false,msg:'<b>Evidence first.</b> Comparator → KV-EDGE-RTR-01, reference GOLDEN vs candidate running-config. Transcribe from the diff, not from memory.'};
   return {ok,msg:ok?'<b>Audit accepted.</b> tmpadmin (privilege 15) · logging host 10[.]20[.]0[.]51 removed · 10.99.9.0/24 permitted on VTY. Each maps to a known pattern: persistence, evasion, and new remote access — the same trio Static Tundra used on Cisco devices.':'<b>Near-miss — rejected.</b> Exact values required: the account is a single word (check the username line), the removed syslog IP is the one the baseline names, and the VTY subnet is a /24 — the session source 10.99.9.44 lives inside it.'};}},
 {id:'H3',pillar:'P2',title:'Appoint the trustworthy baseline',
  ctx:'Four files claim to define “correct” for the edge router. Pick the one the rollback may land on, and justify it.',
  where:'File cards on the rack carry the provenance. Decide below.',
  hints:['One nudge: recency is not a trust property — provenance is.'],
  ui:e=>`<div class="obj-ui">
    ${[['edge-b1','kv-edge-rtr-01_2026-11-08_0200.cfg — newest archive copy'],
      ['usb','GOLDEN_v2_usb.cfg — found on the contractor’s personal USB, no CMDB record'],
      ['edge-gold','kv-edge-rtr-01_GOLDEN.cfg — 2025-06-14 · review-board approved · checksum in CMDB'],
      ['edge-rog','kv-edge-rtr-01_NEWBASE_contractor.cfg — uploaded in the contractor session']]
     .map(([v,l])=>`<label class="chk"><input type="radio" name="h3f" data-act="h3file" value="${v}" ${e.h3.file===v?'checked':''}>
       <span style="font-family:system-ui;font-size:12.5px">${esc(l)}</span></label>`).join('')}
    <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Justification</label>
      ${sel('h3why',e.h3.why,[{v:'new',t:'It is the newest file, so it must reflect the intended state'},
        {v:'vouch',t:'The contractor vouches for their NEWBASE upload'},
        {v:'ok',t:'Approval record + recorded checksum, independent of the contractor under investigation'}],0,'Justification for the baseline choice')}</div></div></div>`,
  check:e=>{const ok=e.h3.file==='edge-gold'&&e.h3.why==='ok';
   return {ok,msg:ok?'<b>Correct.</b> The signed GOLDEN file is the only candidate with an approval record and a CMDB checksum — trust anchored outside the night in question. The 02:00 backup copied the drifted production; NEWBASE and the USB copy originate with the party under investigation.':'<b>Near-miss — rejected.</b> Newest ≠ correct: the newest copy captured the tampered config. The contractor’s upload and the USB copy come from the party you are investigating. Only the review-board file carries an approval record and an independently recorded checksum.'};}},
 {id:'H4',pillar:'P3',title:'Engineer the drift detection that should have existed',
  ctx:'Build the monitor that fires <i>during</i> the tampering window, not at the next manual review — and notices when recovery assets fail.',
  where:'Monitor tab. Strict combination.',
  hints:['One nudge: two of the five controls watch for a <i>second</i> kind of failure — the kind that ruins the recovery you are planning.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Monitor state:
    ${e.monitor.dev?`${esc(e.monitor.dev)} · vs ${esc(e.monitor.ref||'—')} · ${esc(e.monitor.freq||'—')} · action=${esc(e.monitor.act||'—')}${e.monitor.watch?' · job-watch ON':' · job-watch OFF'}`:'not configured'}</p></div>`,
  check:e=>{const m=e.monitor;const ok=m.dev==='KV-EDGE-RTR-01'&&m.ref==='baseline'&&['hourly','daily'].includes(m.freq)
     &&m.act==='ticket'&&m.watch===true;
   return {ok,msg:ok?'<b>Accepted.</b> Production-vs-baseline at least daily, alert + ticket, and job-failure watch on: the same monitor that catches tampering catches the fw-nightly silence that sat unnoticed for 87 days. Detection engineering covers the control and the safety net.':'<b>Near-miss — rejected.</b> The combination must be: edge router · signed baseline (the latest backup contains the drift — drift-to-drift stays green) · at least daily · <b>alert + ticket</b> (a log line changes nothing at 01:52) · backup-failure watch <b>on</b>.'};}},
 {id:'H5',pillar:'P4',title:'Execute recovery — with the branch the textbook skips',
  ctx:'Six actions recover the router; four temptations must be left in the bank. Then answer why the newest backup is not the restore source.',
  where:'Arrange below. Distractors in the bank.',
  hints:['One nudge: anything the session at 01:37 could have touched must be rebuilt from approved intent, not from recent files.'],
  ui:e=>seqUI('h5',['x2','q4','q1','q6','q2','x1','q5','x3','q3','x4'],e.seq.h5)+
   `<div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Why NOT restore the Sat 02:00 backup?</label>
    ${sel('h5why',e.h5why,[{v:'unrel',t:'Backups from the archive server are unreliable'},
      {v:'enc',t:'It is encrypted, so it cannot be trusted'},
      {v:'ok',t:'It captured the already-drifted production — restoring it reinstates the tampering'}],0,'Why the Sat 02:00 backup is not the restore source')}</div></div>`,
  check:e=>{const ok=JSON.stringify(e.seq.h5)===JSON.stringify(['q1','q2','q3','q4','q5','q6'])&&e.h5why==='ok';
   return {ok,msg:ok?'<b>Correct.</b> Quarantine, restore approved intent, verify, save, fresh backup, preserve evidence — and the newest backup is refused <i>because it is a faithful copy of the drifted state</i>. Backups answer “what was”, baselines answer “what should be”. Recovery lands on the baseline.':'<b>Near-miss — rejected.</b> The sequence must run quarantine → restore signed baseline → verify → write memory → fresh backup → document, with none of the bank’s shortcuts (rebooting hopes the mess away; the NEWBASE upload legitimizes it). And the 02:00 backup? It recorded production <i>after</i> the 01:37 session — restoring it restores the attacker’s changes.'};}},
 {id:'H6',pillar:'P4',title:'Set the archive policy that meets RPO 24 h / RTO 4 h',
  ctx:'The change board wants one standard for all devices. Configure the policy board on the Storage &amp; jobs tab.',
  where:'Storage & jobs tab → “Archive policy board”. Strict.',
  hints:['One nudge: RPO is about data loss between copies; the answer to a failed run must arrive in minutes, not at the monthly review.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Policy state: ${esc(e.polJob.freq||'—')} ·
    failure=${esc(e.polJob.alert||'—')} · retry=${esc(e.polJob.retry||'—')} · storage=${esc(e.polJob.storage||'—')} · test=${esc(e.polJob.test||'—')}</p></div>`,
  check:e=>{const p=e.polJob;const ok=['daily','hourly'].includes(p.freq)&&p.alert==='on'&&p.retry==='auto'&&p.storage==='archive'&&p.test==='monthly';
   return {ok,msg:ok?'<b>Accepted.</b> Daily copies meet RPO 24 h; auto-retry plus immediate paging keeps a failed run from silently consuming the RPO; encrypted versioned offsite storage and a monthly restore test make RTO 4 h credible. Policy, monitoring and proof — all three.':'<b>Near-miss — rejected.</b> “Check in the monthly review” is how an 87-day gap happens; “wait for tomorrow’s run” doubles your real RPO. Daily (or better), page immediately, auto-retry then escalate, encrypted offsite versioned storage, monthly restore test.'};}},
 {id:'H7',pillar:'P4',title:'Sit the change board: three calls, three reasons',
  ctx:'Decide CHG-2301/2302/2303 on the Tickets tab — decision AND justification for each. The board defends its reasons.',
  where:'Tickets tab → change board. State-based check.',
  hints:['One nudge: “urgent” is a property of the risk, not of the requester’s patience — check which ticket carries a rollback plan.'],
  ui:e=>`<div class="obj-ui"><p style="font-size:12.5px;color:var(--dim)">Decisions recorded:
    ${TICKETS.h7.tickets.map(t=>`${t.id}=${esc(e.h7.d[t.id]||'—')}`).join(' · ')} — make them on the Tickets tab.</p></div>`,
  check:e=>{const want={'CHG-2301':'Approve as emergency change','CHG-2302':'Reject','CHG-2303':'Approve as planned change'};
   const t=TICKETS.h7.tickets;
   const ok=t.every(x=>e.h7.d[x.id]===want[x.id]&&e.h7.r[x.id]===H7WANT[x.id]);
   return {ok,msg:ok?'<b>Board adjourned.</b> Emergency approve for the credential rotation (urgent, scoped, rollback sealed); reject the branch-office ticket (no rollback plan, no assessment, Friday peak — reject with named gaps); approve the depot VLAN (tested, off-peak, rollback documented). Consistency between decision and stated reason is what makes the record defensible.':'<b>Near-miss — rejected.</b> 2301: emergency approve. 2302: reject — no rollback plan, no impact assessment, no test evidence, peak window. 2303: it is a model planned change; deferral is for incomplete tickets. Your stated reason must match the decision you recorded.'};}},
 {id:'H8',pillar:'P2',title:'Config review: flag every insecure setting on KV-FW-01',
  ctx:'Open the firewall’s running config on the rack and flag each insecure setting below. Clean lines must stay unflagged.',
  where:'Rack → KV-FW-01 → running-config. Then flag below. Exactly five.',
  hints:['One nudge: one absence is itself a finding — think about what timestamps need.'],
  ui:e=>`<div class="obj-ui">${[['f1','username admin password FireWall-2026! — plaintext local credential'],
    ['f2','snmp-server community public RO — default community string'],
    ['f3','ip http server — unused web management enabled'],
    ['f4','transport input telnet ssh — telnet permitted on VTY'],
    ['f5','No NTP / time source — log timestamps unreliable'],
    ['c1','logging host 10[.]20[.]0[.]51 — syslog configured'],
    ['c2','SSH available on VTY — encrypted management'],
    ['c3','access-list MGMT-ACL restricts VTY sources']]
   .map(([id,l])=>`<label class="chk"><input type="checkbox" data-act="h8chk" data-v="${id}" ${e.h8.includes(id)?'checked':''}>
     <span style="font-family:var(--mono);font-size:12px">${esc(l)}</span></label>`).join('')}</div>`,
  check:e=>{const need=['f1','f2','f3','f4','f5'];const ok=need.every(x=>e.h8.includes(x))&&e.h8.length===5;
   return {ok,msg:ok?'<b>Review accepted.</b> Plaintext credential, default SNMP community, unused HTTP server, telnet on VTY, and no time source (without NTP every log line is chronologically unprovable — which cripples incident timelines). The three clean lines stay clean: flagging everything is not reviewing.':'<b>Near-miss — rejected.</b> Exactly five findings. Check the username line’s <i>password</i> keyword (not secret), the community string everyone knows, a web service nobody uses, a transport that predates encryption, and the setting that is <i>missing</i>. Logging host, SSH and the VTY ACL are the good lines — leave them.'};}},
 {id:'H9',pillar:'P4',title:'Close the incident: lessons that hold, risk that remains',
  ctx:'Pick the three lessons-learned actions the post-incident review should adopt, and the honest residual-risk statement.',
  where:'Choose below. Exactly three actions, one risk statement.',
  hints:['One nudge: two lessons harden the pipeline, one hardens the people — dropping any one reopens the hole you just closed.'],
  ui:e=>`<div class="obj-ui">${[['l1','Reconcile every production-vs-baseline diff against a ticket before sign-off (dual review)'],
    ['l2','Encrypt, isolate and version config backups; restore-test monthly (ATT&CK M1053)'],
    ['l3','Restrict and monitor privileged config-change accounts (ATT&CK M1026)'],
    ['w1','Disable SNMP and syslog entirely — logs attract attackers'],
    ['w2','Let contractors share the netops account for convenience'],
    ['w3','Store the newest backup on the device itself for speed']]
   .map(([id,l])=>`<label class="chk"><input type="checkbox" data-act="h9l" data-v="${id}" ${e.h9.lessons.includes(id)?'checked':''}>
     <span style="font-family:system-ui;font-size:12.5px">${esc(l)}</span></label>`).join('')}
   <div class="abar" style="margin:0"><div class="field" style="flex:1"><label>Residual risk statement</label>
    ${sel('h9risk',e.h9.risk,[{v:'none',t:'With these controls in place, no residual risk remains'},
      {v:'ups',t:'The main residual risk is the UPS battery in rack B'},
      {v:'ok',t:'Even with drift monitoring, an attacker with valid privileged credentials can re-drift configs faster than alerts are read — privileged-account control must complement drift detection'}],0,'Residual risk statement')}</div></div></div>`,
  check:e=>{const ok=['l1','l2','l3'].every(x=>e.h9.lessons.includes(x))&&e.h9.lessons.length===3&&e.h9.risk==='ok';
   return {ok,msg:ok?'<b>Review closed.</b> Ticket-reconciliation catches the next undocumented line; hardened, tested backups make recovery boring; privileged-account control shrinks who can drift anything at all. And the residual risk is stated honestly: controls layer, none is total. That sentence is the difference between a review and a ritual.':'<b>Near-miss — rejected.</b> The three actions map one-to-one onto tonight’s failures: diff-vs-ticket (undocumented lines), M1053 storage+restore-test (the stale firewall backup), M1026 (tmpadmin existed because privilege was loose). “No residual risk” is never an honest statement — pick the one that names what remains.'};}}
];

const OBJSETS={medium:OBJ_MED,hard:OBJ_HARD};

/* ---------- knowledge-check bank ----------
   Correct-answer positions are rotated (a: index), option lengths are
   clustered, and each item carries a concept tag used by the end-of-shift
   focus areas. Explanations address the tempting distractors. */
const QUIZ={
 medium:[
  {tag:'running vs startup (unsaved changes)',
   q:'What primarily distinguishes a startup config from a running config?',
   opts:['The running config is saved into NVRAM; the startup config stays in RAM',
     'The startup config lives on a TFTP server; the running config is local',
     'The startup config loads at boot; the running config executes right now',
     'They are two names for one and the same stored device file'],
   a:2,expl:'RAM and NVRAM are exactly reversed: running lives in memory, startup is the saved copy loaded at boot — and no TFTP server is involved. A change exists only in running until it is saved, which is why an unsaved fix dies on the next reboot.'},
  {tag:'baseline vs backup as diff source',
   q:'Why compare production against the baseline rather than the most recent backup?',
   opts:['The newest backup may contain the drift itself — drift against drift',
     'Baselines are always older than backups, so a baseline diff misses recent work',
     'Devices forbid reading backups, so the comparator cannot open them at all',
     'Backups are always encrypted, so any diff against production comes back empty'],
   a:0,expl:'A backup faithfully copies production at time T — tampering included — so drift-to-drift comparison stays politely green. Encryption never blocks the comparator, recency is not correctness, and devices read backups fine: only the reviewed baseline represents intent.'},
  {tag:'job-failure alerting',
   q:'The fw-nightly backup job failed silently for 87 days. Which control failed first?',
   opts:['Encryption failed, so the archived copies were unreadable',
     'The rollback plan failed the moment the change window closed',
     'The maintenance window was too short for the nightly job to finish',
     'Configuration monitoring — no alert fired when the job stopped running'],
   a:3,expl:'Detection failed before recovery did: the job died on 2026-08-14 and nobody was paged, because failure alerting had been switched off. Monitoring must watch both production drift and the jobs that protect recovery.'},
  {tag:'rollback plan essentials',
   q:'What makes a rollback plan actually safe?',
   opts:['It is written calmly after the change has already failed',
     'It reboots the device quickly, before passengers notice an outage',
     'It deletes the old configuration so the bad state cannot return',
     'It is pre-agreed, lands on the baseline, verifies before saving'],
   a:3,expl:'A rollback plan exists before implementation, restores approved intent, and verifies services before the state is persisted to startup. Written-after-the-fact is a post-mortem; rebooting and deleting are not recovery.'},
  {tag:'backup storage security (M1053)',
   q:'Config files contain credential material. Which practice limits the damage of a stolen backup?',
   opts:['Store it on the unauthenticated TFTP share for fast transfers',
     'Rename the file so attackers cannot guess what it contains',
     'Encrypt at rest, restrict access, keep it offsite from production',
     'Compress it before storing to shrink the stolen archive'],
   a:2,expl:'Configs are credential-stuffed artifacts: renaming and compression change nothing once a copy leaks, and an open TFTP share is the leak itself. Encryption, access control and isolation are the storage half of MITRE ATT&CK M1053 (Data Backup).'},
  {tag:'M1053 purpose and technique mapping',
   q:'MITRE ATT&CK M1053 (Data Backup) exists because adversaries…',
   opts:['…like reading your documentation and studying your network diagrams',
     '…encrypt data for impact and inhibit recovery (T1486, T1490)',
     '…avoid using TFTP and prefer encrypted transfer protocols',
     '…never touch network devices, staying on servers alone'],
   a:1,expl:'M1053 is mapped against T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery) and related techniques: isolated, tested backups take those recovery-destroying moves off the table. Documentation theft is reconnaissance — not what this mitigation answers.'}],
 hard:[
  {tag:'Static Tundra tradecraft recognition',
   q:'A firewall diff shows: + snmp-server community public RW. Real-world echo?',
   opts:['Static Tundra used precisely these insecure read-write community strings',
     'A harmless leftover default that exposes nothing worth worrying about',
     'An improvement, since read-write communities enable better centralized monitoring',
     'A requirement for SNMPv3, which still depends on community strings'],
   a:0,expl:'Cisco Talos (2025) documented Static Tundra using “public”/“anonymous” read-write communities on Cisco devices — alongside privileged local accounts, enabled telnet and altered logging. Defaults plus read-write equals remote config access, not better monitoring; SNMPv3 uses users and keys, not communities.'},
  {tag:'defensible drift-comparison source',
   q:'Which drift-monitor comparison source is defensible?',
   opts:['Production against yesterday’s backup — newest available copy wins',
     'Backup against backup, which highlights anything that changed overnight',
     'Startup against baseline, checked only after scheduled reboots',
     'Production against the signed baseline, the approved reference'],
   a:3,expl:'The baseline is approved intent. A backup mirrors production at time T — drift included — and backup-vs-backup only notices changes between nights; startup waits for a reboot that may never come. Compare live production with what should be.'},
  {tag:'restore-source selection',
   q:'A change fails mid-window. The rollback plan says restore the baseline; last night’s backup is newer. What do you restore?',
   opts:['The newer backup — the newest copy is always the safest restore point',
     'The baseline, per plan — the backup may hold the failed change',
     'Neither — reboot the device and let startup config sort it out',
     'Both, merged by hand so nothing from either copy is lost'],
   a:1,expl:'Recovery lands on approved intent. The newer backup can contain the failed change and anything else that drifted; recency is not a trust property. Hand-merges and hopeful reboots are how one bad night becomes two.'},
  {tag:'save-and-document discipline',
   q:'An approved change was implemented but never saved to startup and never documented. Which two risks follow?',
   opts:['None — if the change works, the state is fine as-is',
     'The device runs measurably faster without the startup write',
     'A reboot reverts the change, and audits cannot prove what changed',
     'The TFTP server fills up with stale archive copies'],
   a:2,expl:'Unsaved means lost on reboot — production instability; undocumented means unauthorized by definition — an audit failure. Save after verification, then document, or the next incident starts from a lie.'},
  {tag:'drift detection placement',
   q:'Which source would have caught the tmpadmin tampering FIRST?',
   opts:['The UPS battery test alarm for rack B',
     'Configuration monitoring — a production-versus-baseline diff alert',
     'The monthly config review by the network team',
     'The label-printer port flap on the core switch'],
   a:1,expl:'Direct drift detection fires within the check interval — minutes, not weeks. The UPS alarm and the port flap are honest but unrelated noise, and the monthly review would have found tmpadmin long after the actor moved on.'},
  {tag:'baseline governance / separation of duties',
   q:'The contractor who made an approved change uploads a “new baseline” including their own work. Approve it?',
   opts:['Yes — the contractor knows this device’s configuration best of anyone',
     'Yes, provided the uploaded file is properly encrypted',
     'No — authors must never bless their own baseline reference',
     'Only while the maintenance window is still officially open'],
   a:2,expl:'Baseline governance is separation of duties: a reference blessed by the party under investigation is not a control. Encryption says nothing about intent, and the window is irrelevant — review, checksum, record, then promote.'},
  {tag:'RPO math and copy intervals',
   q:'Nightly 02:00 backup. A config change lands at 18:00; the device fails at 20:00 and you restore last night’s copy. How much work is lost?',
   opts:['Nothing at all — the 02:00 copy captured tonight’s work',
     'Exactly two hours — only the 18:00 change is affected',
     'Nothing is lost — the change is still in running memory',
     'Up to 18 hours — everything since 02:00 is gone'],
   a:3,expl:'RPO is bounded by copy frequency: the last copy ran at 02:00 and the device failed at 20:00, so up to 18 hours of config work is gone — and the running config died with the device. Failed-run alerting, auto-retry and tighter copy intervals are how an RPO promise stays credible.'}]};
