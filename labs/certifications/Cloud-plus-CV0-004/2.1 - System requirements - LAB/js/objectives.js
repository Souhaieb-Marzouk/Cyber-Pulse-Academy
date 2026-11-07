'use strict';
/* ================= Objectives: Medium (12) + Hard (9), machine-checked ================= */
const norm = s => String(s==null?'':s).trim().toLowerCase().replace(/\s+/g,' ');
const eq = (a,b) => norm(a)===norm(b) && norm(a)!=='';
const num = (v,target,tol) => { const n=parseFloat(v); return isFinite(n) && Math.abs(n-target)<=tol; };
const sameSet = (arr, expected) => Array.isArray(arr) && arr.length===expected.length && expected.every(x=>arr.includes(x));

const OBJ = [
/* ============================ MEDIUM ============================ */
{ id:'OBJ-M1', mode:'medium', pillar:'P1', title:'Sort six requirement statements into Business / Functional / Non-functional',
  blurb:'Requirements come in three lenses. Classify each statement in the Requirement Sorter.',
  look:{folder:'cards',tab:'sort'}, hints:[
    'Deadlines and budgets serve the organization \u2014 what lens is that?',
    'Business = constraints from the org (lease, budget). Functional = what the system must do (APIs, jobs). Non-functional = how well (latency, RTO/RPO).',
    'c1 Business \u00b7 c2 Functional \u00b7 c3 Non-functional \u00b7 c4 Business \u00b7 c5 Functional \u00b7 c6 Non-functional.'],
  lock:['env.classify'], check:S=>{ const bad=REQ_CARDS.filter(c=>S.env.classify[c.id]!==({c1:'business',c2:'functional',c3:'nonfn',c4:'business',c5:'functional',c6:'nonfn'})[c.id]);
    return bad.length? {ok:false,msg:'Not yet \u2014 recheck statement '+bad[0].id.toUpperCase()+': is it about the organization (business), a feature (functional), or a quality target (non-functional)?'}
      : {ok:true}; },
  why:'All six sorted. A dossier that mixes these lenses invites wrong decisions \u2014 e.g., treating the lease deadline (business) as something autoscaling can fix.'},

{ id:'OBJ-M2', mode:'medium', pillar:'P3', title:'Audit the Storefront draft: find the three missing requirements',
  blurb:'The web team sent Draft v0.9. Tick the three requirements it is missing in the Draft Audit folder.',
  look:{folder:'audit',tab:'webdraft'}, hints:[
    'Read the draft\u2019s bullet list, then judge each candidate against it \u2014 three candidates do not appear anywhere in the draft.',
    'Ask: if validation fails, what is the way back? If traffic grows 40%, does the plan still hold? How fast must the network be? Which of those does the draft answer?',
    'Missing: rollback plan \u00b7 growth/headroom projection \u00b7 network latency/bandwidth requirement.'],
  lock:['env.gaps'], check:S=> sameSet(S.env.gaps,['gap-rollback','gap-growth','gap-network'])? {ok:true}
       : {ok:false,msg:'Not the right set \u2014 exactly three items are missing. Present items (owner, cutover window, volume, DNS, smoke tests, compute plan, shutdown date) must stay unticked; a vendor brochure or asset tag is not a requirement.'},
  why:'Gap hunting is the \u201cdetection\u201d skill of requirements work: a spec without a rollback plan, a growth projection and a network budget looks complete until cutover night. All three now enter the dossier.'},

{ id:'OBJ-M3', mode:'medium', pillar:'P1', title:'Interpret LedgerDB\u2019s DR requirement: RTO 4 h / RPO 15 min',
  blurb:'On LedgerDB \u2192 Inventory, pick the reading that matches the DBA team\u2019s RTO/RPO.',
  look:{folder:'ledgerdb',tab:'inventory'}, hints:[
    'RTO is about time to restore service; RPO is about how much data may be lost. Which option mixes them up?',
    'RTO 4 h = back within 4 hours of failure. RPO 15 min = lose at most the last 15 minutes of transactions.',
    'Correct: \u201cRestore service within 4 h of failure; tolerate at most 15 min of lost transactions.\u201d'],
  lock:['env.rto'], check:S=> eq(S.env.rto,'r-ok')? {ok:true} : {ok:false,msg:'That reading swaps or distorts the two objectives \u2014 RTO bounds downtime (4 h to restore), RPO bounds data loss (15 min backwards in time). Try again.'},
  why:'RTO/RPO are requirements the target platform must meet \u2014 they will later drive backup design and the migration\u2019s validation tests, not just dictionary knowledge.'},

{ id:'OBJ-M4', mode:'medium', pillar:'P2', title:'Size and license LedgerDB from its telemetry',
  blurb:'On LedgerDB \u2192 Spec Sheet set: target instance, storage tier, and licensing approach.',
  look:{folder:'ledgerdb',tab:'spec'}, hints:[
    'Policy: p95 + \u2265 25% headroom, rounded up to the next catalog shape. Compute RAM first \u2014 it binds here.',
    'p95 RAM 56.3 GB \u00d7 1.25 = 70.4 GB \u2192 the 64 GB shape fails, 128 GB fits. IOPS: 11,800 \u00d7 1.25 \u2248 14,750 \u2192 perf-io (30,000), not std-ssd (5,000).',
    'Instance n-mem-16XL \u00b7 storage perf-io \u00b7 licensing: BYOL = 32 cores \u00d7 $180 = $5,760/mo vs managed +$74/mo.'],
  lock:['env.spec.ledgerdb.instance','env.spec.ledgerdb.storage','env.spec.ledgerdb.licensing'], check:S=>{ const sp=S.env.spec.ledgerdb;
    if(!eq(sp.instance,'n-mem-16XL')) return {ok:false,msg:'Instance: p95 RAM 56.3 GB + 25% headroom = 70.4 GB \u2014 the 16 vCPU/64 GB shape cannot hold that. Which catalog shape can?'};
    if(!eq(sp.storage,'perf-io')) return {ok:false,msg:'Storage: 11,800 IOPS p95 \u00d7 1.25 \u2248 14,750 IOPS needed \u2014 std-ssd provisions 5,000. A transactional DB needs the perf-io tier.'};
    if(!eq(sp.licensing,'managed')) return {ok:false,msg:'Licensing: BYOL means 16 vCPU \u00d7 2 = 32 licensed cores \u00d7 $180 = $5,760/mo. The managed edition includes licenses for +$74/mo \u2014 which survives the budget gate?'};
    return {ok:true}; },
  why:'Sized from evidence, not from the old server\u2019s shape \u2014 and the licensing clause turned from a trap into a decision. This is objective 2.1\u2019s core skill: requirements \u2192 concrete target specification.'},

{ id:'OBJ-M5', mode:'medium', pillar:'P2', title:'Set LedgerDB placement to satisfy the 15 ms dependency budget',
  blurb:'Chatty pair, 840 q/s. Set the placement field on LedgerDB\u2019s Spec Sheet (evidence: Dependencies tab).',
  look:{folder:'ledgerdb',tab:'deps'}, hints:[
    'Which placements meet p95 \u2264 15 ms? Check the measured numbers, not the labels.',
    'Cross-region 34 ms and cross-AZ 16 ms both breach the budget at peak; same-AZ gives 11 ms.',
    'Choose \u201cSame region + same AZ as Storefront Web\u201d.'],
  lock:['env.spec.ledgerdb.placement'], check:S=> eq(S.env.spec.ledgerdb.placement,'colocate')? {ok:true}
    : {ok:false,msg:'That placement misses the budget: cross-AZ p95 is 16 ms and cross-region 34 ms under load \u2014 only same-region + same-AZ measures 11 ms. Data gravity: the pair decides placement together.'},
  why:'Dependencies override tidy architecture: blast-radius separation would be nice, but 840 q/s against 15 ms pins the pair together. Documented, the constraint now drives the wave plan too.'},

{ id:'OBJ-M6', mode:'medium', pillar:'P2', title:'Choose Storefront\u2019s compute plan for episodic peaks',
  blurb:'On Storefront Web \u2192 Spec Sheet, pick the compute plan the evidence supports.',
  look:{folder:'webapp',tab:'telemetry'}, hints:[
    'The 91% peaks last < 45 minutes, three times a year. What is the cheapest capacity that still serves them?',
    'Baseline need: p95 CPU 1.4 vCPU + RAM 6.1 GB per server \u2192 n-standard-2 fits. Peaks: ASG scale-out boots in 90 s; the sale ramps over ~4 min.',
    'Choose the autoscale group: n-standard-2, min 2 / max 6, scale at CPU > 60%.'],
  lock:['env.spec.webapp.compute'], check:S=> eq(S.env.spec.webapp.compute,'asg')? {ok:true}
    : eq(S.env.spec.webapp.compute,'fixed8')? {ok:false,msg:'Peak-sized fixed capacity pays for idle hardware 8,760 hours a year to cover ~135 minutes of load. The Nimbus guide says scale-out stays ahead of the ramp \u2014 what does that suggest?'}
    : {ok:false,msg:'Undersized or shape-locked: the p95 baseline needs ~1.7 vCPU and 7.6 GB with headroom per server \u2014 and the flash sales still need somewhere to go. Which plan covers both?'},
  why:'Right-sizing + autoscaling serves p95 baselines and episodic peaks without paying peak prices all year \u2014 a textbook non-functional requirement answered by design, not by bigger hardware.'},

{ id:'OBJ-M7', mode:'medium', pillar:'P3', title:'Mark the true compatibility blockers in the scan',
  blurb:'In Compatibility Scan \u2192 Blockers, tick the findings that genuinely force a design change or veto the move.',
  look:{folder:'scan',tab:'blockers'}, hints:[
    'A blocker breaks something \u2014 cost, law, or physics. \u201cSupported\u201d and \u201cimportable\u201d findings are just facts.',
    'One finding makes the DB license 78\u00d7 more expensive; another breaks the 15 ms budget. The rest are compatible facts.',
    'Blockers: the per-core license doubling (B1) and the 34 ms cross-region RTT vs the 15 ms budget (B2).'],
  lock:['env.blockers'], check:S=> sameSet(S.env.blockers,['B1','B2'])? {ok:true}
    : {ok:false,msg:'Not quite \u2014 VMDK import (B3), Windows Server 2019 support (B4) and SMB 3.0 (B5) are all compatible facts, not blockers. Which two findings actually break cost or latency requirements?'},
  why:'Blocker = a finding that changes the design: the license doubles the DB bill (driving the managed-edition decision) and cross-region latency vetoes a region. Everything else is inventory.'},

{ id:'OBJ-M8', mode:'medium', pillar:'P2', title:'Compute the Media Archive transfer: hours and nights',
  blurb:'On the Bandwidth Ledger, Block A: enter hours on the link and nights needed for the 12 TB seed.',
  look:{folder:'transfer',tab:'ledger'}, hints:[
    'Use the ledger\u2019s equation: hours \u2248 TB \u00d7 3.17 (decimal units, 87.5 MB/s usable).',
    '12 TB \u00d7 3.17 \u2248 38.1 h. Nights: divide by the 4-hour window and round up.',
    '38.1 hours \u2192 10 nights (9 nights \u00d7 4 h = 36 h \u2014 short).'],
  lock:['env.calc.archiveHours','env.calc.archiveNights'], check:S=> (num(S.env.calc.archiveHours,38.1,2) && num(S.env.calc.archiveNights,10,0))? {ok:true}
    : !num(S.env.calc.archiveHours,38.1,2)? {ok:false,msg:'Hours: 12 TB = 12,000,000 MB \u00f7 87.5 MB/s \u00f7 3600 \u2248 38.1 h. Check you used the usable rate (70% of the circuit), not the raw 1 Gbps.'}
    : {ok:false,msg:'Nights: 38.1 h \u00f7 4 h per night = 9.5 \u2192 round UP to 10. Nine nights deliver only 36 hours.'},
  why:'This is why the archive starts first: its seed alone needs ten nights, and the lease ends June 30. Transfer math converts a data volume into a calendar requirement.'},

{ id:'OBJ-M9', mode:'medium', pillar:'P2', title:'Select the Media Archive storage tier',
  blurb:'On Media Archive \u2192 Spec Sheet, pick the tier that matches the access pattern and the 12 h retrieval SLA.',
  look:{folder:'archive',tab:'profile'}, hints:[
    '97% of files were untouched for 90 days. What are you actually paying SSD speeds for?',
    'The SLA says retrieval within 12 h is fine \u2014 exactly the archive tier\u2019s promise, at $1.20/TB-mo.',
    'Choose \u201carchive \u2014 retrieval within 12 h \u00b7 $1.20/TB-mo\u201d ($14.40/mo for 12 TB).'],
  lock:['env.spec.archive.tier'], check:S=> eq(S.env.spec.archive.tier,'archive')? {ok:true}
    : eq(S.env.spec.archive.tier,'cool-object')? {ok:false,msg:'Cool-object is closer, but it still costs 3.3\u00d7 the archive tier for speed the 12 h SLA never asks for. Match the tier to the measured access pattern.'}
    : {ok:false,msg:'SSD tiers provision speed for data that is 97% cold \u2014 $216\u2013$1,980/mo for the same files the archive tier serves at $14.40/mo within the SLA.'},
  why:'Storage requirements are access-pattern requirements: capacity, retrieval time, cost \u2014 in that order here. The tier choice saves ~$200/mo vs SSD while meeting the stated SLA.'},

{ id:'OBJ-M10', mode:'medium', pillar:'P4', title:'Specify HR Payroll\u2019s region and mandated controls',
  blurb:'On HR Payroll \u2192 Spec Sheet: pin the region and tick exactly the three controls the compliance memo mandates.',
  look:{folder:'payroll',tab:'inventory'}, hints:[
    'The memo says the data must remain in an EU region. Which Nimbus region is that?',
    'Residency is about location; the controls are about protection and access: encryption at rest, TLS in transit, SSO+MFA via the corporate IdP.',
    'Region: eu-north. Controls: encrypt, tls, sso \u2014 not a public IP, not a shared account, never disabled audit logs.'],
  lock:['env.spec.payroll.region','env.spec.payroll.controls'], check:S=>{ const c=S.env.spec.payroll.controls;
    if(!eq(S.env.spec.payroll.region,'eu')) return {ok:false,msg:'Region: residency means the data physically stays in the EU \u2014 encryption does not substitute for location. Which region satisfies that?'};
    return sameSet(c,['encrypt','tls','sso'])? {ok:true}
      : {ok:false,msg:'Controls: the memo mandates exactly three \u2014 encryption at rest, TLS 1.2+ in transit, SSO+MFA via the corporate IdP. A public IP, a shared account or disabled audit logging violates it.'}; },
  why:'Residency pinned plus mandated controls recorded \u2014 the payroll spec is now defensible in an audit, and its wave gets a hard gate: EU compliance sign-off before it starts.'},

{ id:'OBJ-M11', mode:'medium', pillar:'P4', title:'Assign a Six-R strategy to the four core workloads',
  blurb:'On the Strategy Board: LedgerDB, Storefront Web, Media Archive, HR Payroll. (The two legacy systems are practice for Hard mode.)',
  look:{folder:'strategy',tab:'six'}, hints:[
    'LedgerDB: managed edition of the same engine = minor targeted change. Storefront: runs as-is on a supported OS. Archive: the NAS product is replaced by a managed service. Payroll: moves as-is with platform controls.',
    '\u201cManaged edition of the same engine\u201d is a replatform, not a repurchase. \u201cRepurchase\u201d means replacing the product with a different one.',
    'LedgerDB \u2192 replatform \u00b7 Storefront \u2192 rehost \u00b7 Media Archive \u2192 repurchase \u00b7 HR Payroll \u2192 rehost.'],
  lock:['env.strategy'], check:S=>{ const st=S.env.strategy, key={ledgerdb:'replatform',webapp:'rehost',archive:'repurchase',payroll:'rehost'};
    for(const k in key){ if(!eq(st[k],key[k])) return {ok:false,msg:'Recheck '+FLEET.find(f=>f.id===k).name+' \u2014 match the R to the evidence: what actually changes during the move? (Definitions: Field Manual / Glossary.)'}; }
    return {ok:true}; },
  why:'Strategy follows requirements, not fashion: the license fix and engine edition make LedgerDB a replatform; nothing changes for Storefront or Payroll (rehost); the Archive\u2019s NAS is replaced by a managed product (repurchase). Two rehosts with different rationales is normal \u2014 real fleets look like this.'},

{ id:'OBJ-M12', mode:'medium', pillar:'P4', title:'Wave-plan the migration within the June 30 deadline',
  blurb:'On the Wave Planner: order the four migrating workloads and mark the two that get no wave.',
  look:{folder:'waves',tab:'plan'}, hints:[
    'The longest transfer starts first (ten nights of seed). The database must validate before the app that depends on it cuts over. Payroll waits for its gate.',
    'Archive seed = 10 nights \u2192 Wave 1. LedgerDB must meet its 15 ms test before Storefront cutover \u2192 DB Wave 2, Storefront Wave 3. Payroll after EU sign-off \u2192 Wave 4.',
    'Waves: 1 Media Archive \u00b7 2 LedgerDB \u00b7 3 Storefront Web \u00b7 4 HR Payroll \u00b7 Reports Server & BOM Gateway: no wave.'],
  lock:['env.waves'], check:S=>{ const w=S.env.waves, key={w1:'archive',w2:'ledgerdb',w3:'webapp',w4:'payroll'};
    for(const k in key){ if(!eq(w[key[k]],k)) return {ok:false,msg:'Wave order: '+k.replace('w','Wave ')+' is wrong \u2014 the 12 TB seed starts first (10 nights), LedgerDB validates before Storefront cutover, payroll follows its compliance gate.'}; }
    if(!eq(w.reports,'none')||!eq(w.bom,'none')) return {ok:false,msg:'Reports Server is retiring (owner directive) and the BOM Gateway cannot meet its 8 ms budget in any region \u2014 neither gets a wave.'};
    return {ok:true}; },
  why:'Sequencing is requirements arithmetic: transfer time, dependency order and compliance gates each constrain the calendar. Marking the exclusions is half the answer \u2014 the plan spends nothing on workloads that stay.'},

/* ============================ HARD ============================ */
{ id:'OBJ-H1', mode:'hard', pillar:'P2', title:'Produce LedgerDB\u2019s complete five-field requirements profile',
  blurb:'Every field on LedgerDB\u2019s Spec Sheet must be defensible from evidence: instance, storage, licensing, placement, transfer window. Strict checking.',
  look:null, hints:['Derive, then commit: p95+25% policy for instance and storage; licensing memo for the model; dependency map for placement; 1.8 TB \u2248 5.7 h of link time for the window.'],
  lock:['env.spec.ledgerdb'], check:S=>{ const sp=S.env.spec.ledgerdb;
    const key={instance:'n-mem-16XL',storage:'perf-io',licensing:'managed',placement:'colocate',window:'nightly'};
    for(const k in key){ if(!eq(sp[k],key[k])) return {ok:false,msg:'Field \u201c'+k+'\u201d is not defensible: re-derive from p95+25% (instance/storage), the licensing memo (model), the 15 ms dependency budget (placement) and 1.8 TB \u2248 5.7 h of link time (window).'}; }
    return {ok:true}; },
  why:'A complete profile: 16 vCPU/128 GB (RAM-bound at 70.4 GB needed), perf-io for 14,750 IOPS, managed edition to dodge a $5,760/mo license, same-AZ for 11 ms p95, nightly window that fits 5.7 h. Each field cites its evidence.'},

{ id:'OBJ-H2', mode:'hard', pillar:'P2', title:'Rule on all three Storefront sizing proposals',
  blurb:'Sizing Review: accept or reject each proposal. Wrong verdicts name the exact rule you missed.',
  look:null, hints:['Apply the policy literally: p95 + \u2265 25% headroom per server, peaks handled by autoscaling \u2014 then check each proposal against it.'],
  lock:['env.sizing'], check:S=>{ const s=S.env.sizing, key={p1:'bad',p2:'bad',p3:'ok'};
    for(const k in key){ if(!eq(s[k],key[k])) return {ok:false,msg:'Proposal '+k.slice(1)+' verdict is wrong. Recall: per server p95 CPU 1.4 vCPU / RAM 6.1 GB (+25% \u2192 ~1.7 vCPU / 7.6 GB) fits n-standard-2; the 91% peaks are episodic (3/yr, <45 min) \u2014 sizing fixed hardware to them wastes 8,600+ hours; sizing to the 12% average breaches the p95 policy.'}; }
    return {ok:true}; },
  why:'Two rejects, one accept \u2014 each for a stated rule: Proposal 1 buys 135 minutes of peak as 8,760 hours of idle; Proposal 2 sizes from an average and ignores the p95 policy; Proposal 3 sizes the baseline to p95+25% and lets the ASG absorb the peaks.'},

{ id:'OBJ-H3', mode:'hard', pillar:'P2', title:'Fleet transfer schedule: volume, hours, nights \u2014 exact',
  blurb:'Bandwidth Ledger, Block B: total TB that actually transfers, hours on the link, nights needed. Strict tolerance (\u00b10.05 TB / \u00b10.5 h).',
  look:null, hints:['\u201cWhat actually migrates\u201d excludes two workloads \u2014 one retiring, one retained. Then hours \u2248 TB \u00d7 3.17 and round nights up.'],
  lock:['env.calc.fleetVolume','env.calc.fleetHours','env.calc.fleetNights'], check:S=>{ const c=S.env.calc;
    if(!num(c.fleetVolume,14.45,0.05)) return {ok:false,msg:'Volume: sum only migrating workloads \u2014 1.8 + 0.45 + 12 + 0.2. The 0.9 TB Reports export and the 0.05 TB gateway never transfer (retire / retain).'};
    if(!num(c.fleetHours,45.9,0.5)) return {ok:false,msg:'Hours: 14.45 TB \u00d7 3.17 \u2248 45.9 h on the usable link. (16.4 TB would be 48.9 h \u2014 that sum includes workloads that stay.)'};
    if(!num(c.fleetNights,12,0)) return {ok:false,msg:'Nights: 45.9 \u00f7 4 = 11.5 \u2192 12. Eleven nights deliver 44 h \u2014 short. Partial nights still count.'};
    return {ok:true}; },
  why:'14.45 TB \u2192 45.9 h \u2192 12 nights: the calendar cost of the migration, with exclusions stated. A plan that summed 16.4 TB would schedule four extra nights of a server that is being wiped.'},

{ id:'OBJ-H4', mode:'hard', pillar:'P3', title:'Pre-review audit of the fleet dossier: find all four missing requirements',
  blurb:'Draft Audit \u2192 Fleet dossier: tick the four requirements missing from v0.9. A brochure attached by the provider is not a requirement.',
  look:null, hints:['v0.9 knows the workloads, their baselines and who talks to whom. Ask what it cannot answer: how bad is failure allowed to be, and what is the way back? Also: does anything define \u201cdone\u201d?'],
  lock:['env.gapsFleet'], check:S=> sameSet(S.env.gapsFleet,['fgap-rto','fgap-rollback','fgap-growth','fgap-accept'])? {ok:true}
    : {ok:false,msg:'Not the right four. Missing from v0.9: per-workload RTO/RPO, rollback plans, growth/headroom projections, acceptance criteria. Inventory/baselines/dependencies/budget/DNS are present; the brochure is marketing, not a requirement.'},
  why:'The four gaps are exactly the ones that surface after cutover: no RTO/RPO means recovery was never specified; no rollback means no way back; no growth projection means the design ages badly; no acceptance criteria means nobody can say whether the migration worked.'},

{ id:'OBJ-H5', mode:'hard', pillar:'P3', title:'Triage the anomaly digest: expose both false alarms',
  blurb:'Compatibility Scan \u2192 False alarms: exactly two of the five anomalies should not drive migration decisions. Tick those two.',
  look:null, hints:['For each anomaly ask: is it a live risk to the migration, or a closed ticket / designed behavior wearing an alert\u2019s clothes?'],
  lock:['env.anomalies'], check:S=> sameSet(S.env.anomalies,['A1','A2'])? {ok:true}
    : {ok:false,msg:'The false alarms are A1 (Saturday CPU spikes = scheduled AV scan, ticket #4192, recurring by design) and A2 (17 failed backups, ticket #2107, closed two years ago \u2014 the job moved arrays). A3\u2013A5 are live risks: licensing, latency, EOL OS.'},
  why:'False alarms are expensive: chasing them burns window time and produces \u201cfixes\u201d for problems that don\u2019t exist. Live risks A3\u2013A5 each already have a place in your dossier \u2014 that\u2019s the difference.'},

{ id:'OBJ-H6', mode:'hard', pillar:'P1', title:'Six-R strategy for all six workloads',
  blurb:'Strategy Board, complete: include the two legacy systems. Graded strictly against the glossary definitions.',
  look:null, hints:['The two extras: one has an owner directive and a successor contracted; the other has a physics problem (8 ms vs 34 ms).'],
  lock:['env.strategy'], check:S=>{ const st=S.env.strategy, key={ledgerdb:'replatform',webapp:'rehost',archive:'repurchase',payroll:'rehost',reports:'retire',bom:'retain'};
    for(const k in key){ if(!eq(st[k],key[k])) return {ok:false,msg:'Recheck '+FLEET.find(f=>f.id===k).name+': match the R to its definition and the workload\u2019s evidence \u2014 what actually changes, and does the business still need it?'}; }
    return {ok:true}; },
  why:'The full spectrum: replatform (managed engine edition), rehost \u00d7 2 (nothing changes but the address), repurchase (NAS \u2192 managed archive service), retire (owner directive + successor), retain (8 ms physics). Six workloads, five different Rs \u2014 strategy is per-workload evidence, not one big decision.'},

{ id:'OBJ-H7', mode:'hard', pillar:'P4', title:'Pass the budget gate with a fully compliant design',
  blurb:'Budget Gate: the design must satisfy every technical requirement AND stay \u2264 $1,380/mo. The gate recomputes from your spec sheets.',
  look:null, hints:['If the gate fails, read the failing line: the license clause and the archive tier are the two expensive ways to fail. Correct technical answers are also the cheap ones here.'],
  lock:['env.spec'], check:S=>{ const b=computeBudget();
    if(!(b.total<=BUDGET_CAP)) return {ok:false,msg:'Over the cap: $'+b.total.toFixed(2)+' > $'+BUDGET_CAP+'. The usual suspects: BYOL ($5,760/mo) or a warm tier on 12 cold TB.'};
    const sp=S.env.spec;
    const okSpec = eq(sp.ledgerdb.instance,'n-mem-16XL') && eq(sp.ledgerdb.storage,'perf-io') && eq(sp.ledgerdb.licensing,'managed')
      && eq(sp.ledgerdb.placement,'colocate') && eq(sp.ledgerdb.window,'nightly') && eq(sp.webapp.compute,'asg')
      && eq(sp.archive.tier,'archive') && eq(sp.payroll.region,'eu') && sameSet(sp.payroll.controls,['encrypt','tls','sso']);
    return okSpec? {ok:true} : {ok:false,msg:'Under the cap but non-compliant: every technical requirement must also hold (sizing, licensing, placement, window, compute plan, tier, region, controls). A cheap wrong design still fails.'};
  },
  why:'The gate passes at $1,353.10/mo: every requirement met and $26.90 of headroom under the cap. Note the pattern \u2014 the technically correct choices were also the cheap ones; oversizing is what breaks budgets.'},

{ id:'OBJ-H8', mode:'hard', pillar:'P4', title:'Wave plan with prerequisite gates \u2014 exact sequence',
  blurb:'Wave Planner: the four waves in order, the two exclusions, AND both gate answers correct.',
  look:null, hints:['Sequence by constraint: longest seed first; the dependency pair validates in dependency order; the regulated workload waits for its legal gate; two workloads never move.'],
  lock:['env.waves','env.gates'], check:S=>{ const w=S.env.waves, key={w1:'archive',w2:'ledgerdb',w3:'webapp',w4:'payroll'};
    for(const k in key){ if(!eq(w[key[k]],k)) return {ok:false,msg:'Sequence: Wave 1 archive (10-night seed), Wave 2 LedgerDB, Wave 3 Storefront (after DB validation), Wave 4 payroll; Reports/BOM get no wave.'}; }
    if(!eq(S.env.gates.payroll,'eu')) return {ok:false,msg:'Payroll gate: the compliance memo makes EU residency sign-off the gate \u2014 budget sign-off and DNS TTL belong to other workstreams.'};
    if(!eq(S.env.gates.webapp,'dbtest')) return {ok:false,msg:'Storefront gate: its 840 q/s dependency means the LedgerDB validation test (connectivity + latency) must pass before cutover completes.'};
    return {ok:true}; },
  why:'Sequence and gates together: archive seeds while nothing else burns window time; the DB validates before the app that depends on it cuts over; payroll waits for its legal gate. The exclusions are decisions too.'},

{ id:'OBJ-H9', mode:'hard', pillar:'P4', title:'Match a rollback plan to each core workload',
  blurb:'Rollback Plans: one strategy per workload, chosen from the pool (distractors included). Defined before cutover \u2014 that\u2019s the point.',
  look:null, hints:['Match the mechanism to the workload\u2019s nature: a database keeps a source; a DNS-served app reverts at the balancer; a seeded file store keeps syncing; a regulated app runs in parallel until sign-off.'],
  lock:['env.rollback'], check:S=>{ const rb=S.env.rollback, key={ledgerdb:'rb-db',webapp:'rb-dns',archive:'rb-dual',payroll:'rb-parallel'};
    for(const k in key){ if(!eq(rb[k],key[k])) return {ok:false,msg:'Recheck '+FLEET.find(f=>f.id===k).name+' \u2014 the rollback must match how the workload cuts over: source kept read-only (DB), warm balancer + short TTL (web), seed + delta syncs (files), parallel runs (regulated app).'}; }
    return {ok:true}; },
  why:'Four rollbacks, four mechanisms \u2014 and the distractors are the ways real outages get worse: no rollback, year-old backups, or decommissioning the source \u201cbefore validation\u201d. The dossier now survives a failed cutover.'}
];

function objsFor(mode){ return OBJ.filter(o=>o.mode===mode); }
