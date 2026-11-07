'use strict';
/* ================= Lab data: constants, catalog, glossary ================= */
const LAB_KEY = 'cv0004l21lab-v1';
const SVG = (inner, s=18) => '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+inner+'</svg>';
const ICONS = {
  manual: SVG('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/>'),
  glossary: SVG('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  debrief: SVG('<path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/>'),
  quiz: SVG('<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5A2.5 2.5 0 1 1 12 13v1.5"/><path d="M12 17.5v.01"/>'),
  ledgerdb: SVG('<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-13"/><path d="M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8"/>'),
  webapp: SVG('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.8 2.7 2.8 14.3 0 17-2.8-2.7-2.8-14.3 0-17z"/>'),
  archive: SVG('<path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8 12 12l8.5-4"/><path d="M12 12v8.5"/>'),
  payroll: SVG('<path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z"/>'),
  reports: SVG('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h7"/>'),
  bom: SVG('<path d="M9 3v5M15 3v5"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>'),
  cards: SVG('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'),
  transfer: SVG('<path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14l4.2-5"/><path d="M3 19h18"/>'),
  scan: SVG('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l6 6"/>'),
  audit: SVG('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/><path d="M8.5 13l2.5 2.5L16 10.5"/>'),
  sizing: SVG('<path d="M12 3v18M5 7h14"/><path d="M5 7l-2.5 5.5h5zM19 7l-2.5 5.5h5z"/>'),
  strategy: SVG('<path d="M12 3 21 8l-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
  waves: SVG('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  budget: SVG('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M15.5 15h2"/>'),
  rollbacks: SVG('<path d="M8 5 3 10l5 5"/><path d="M3 10h11a5 5 0 1 1-1 9.9"/>'),
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'
};
const STAR_ON = '<svg class="star-on" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="star"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const STAR_OFF = '<svg class="star-off" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="empty star"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';

/* Nimbus Cloud price catalog (fictional) */
const INSTANCES = [
  {id:'n-standard-2', label:'n-standard-2 — 2 vCPU / 8 GB',   cpu:2,  ram:8,   $:62},
  {id:'n-standard-4', label:'n-standard-4 — 4 vCPU / 16 GB',  cpu:4,  ram:16,  $:124},
  {id:'n-standard-8', label:'n-standard-8 — 8 vCPU / 32 GB',  cpu:8,  ram:32,  $:248},
  {id:'n-mem-16',     label:'n-mem-16 — 16 vCPU / 64 GB',     cpu:16, ram:64,  $:512},
  {id:'n-mem-16XL',   label:'n-mem-16XL — 16 vCPU / 128 GB',  cpu:16, ram:128, $:968}
];
const TIERS = [
  {id:'std-ssd',     label:'std-ssd — 5,000 provisioned IOPS · $18/TB-mo', $:18},
  {id:'perf-io',     label:'perf-io — 30,000 provisioned IOPS · $55/TB-mo', $:55},
  {id:'cool-object', label:'cool-object — ms latency object store · $4/TB-mo', $:4},
  {id:'archive',     label:'archive — retrieval within 12 h · $1.20/TB-mo', $:1.2}
];
const BYOL_CORE = 180, MANAGED_UPLIFT = 74, EGRESS_02GB = 0.02, BUDGET_CAP = 1380;

/* Fleet roster used across ledgers and planners */
const FLEET = [
  {id:'archive',  name:'Media Archive',   tb:12,   migrating:true},
  {id:'ledgerdb', name:'LedgerDB',        tb:1.8,  migrating:true},
  {id:'webapp',   name:'Storefront Web',  tb:0.45, migrating:true},
  {id:'payroll',  name:'HR Payroll',      tb:0.2,  migrating:true},
  {id:'reports',  name:'Reports Server',  tb:0.9,  migrating:false, note:'retiring'},
  {id:'bom',      name:'BOM Gateway',     tb:0.05, migrating:false, note:'retained'}
];

const GLOSSARY = [
  {id:'g-baseline', t:'Baseline', d:'The measured, normal performance of a workload, collected before any change. Sizing decisions start from the baseline, not from the old server\u2019s shape.'},
  {id:'g-p95', t:'Percentile (p95)', d:'The value below which 95% of samples fall. p95 captures sustained busy levels while ignoring rare outliers \u2014 steadier than the average for sizing.'},
  {id:'g-headroom', t:'Headroom', d:'Spare capacity reserved above measured need. This lab\u2019s policy (stated in the evidence): size to p95, then add \u2265 25% headroom.'},
  {id:'g-rightsize', t:'Right-sizing', d:'Choosing target resources from measured need plus headroom \u2014 not by copying the source server\u2019s specification.'},
  {id:'g-iops', t:'IOPS', d:'Input/output operations per second \u2014 the key capacity metric for transactional storage such as a database volume.'},
  {id:'g-tier', t:'Storage tier', d:'A class of storage trading price against speed or retrieval time: standard SSD, cool object, archive. Match the tier to the access pattern.'},
  {id:'g-deps', t:'Dependency mapping', d:'Charting what a workload talks to, how often, and how fast it must answer. Dependencies dictate placement and wave order.'},
  {id:'g-gravity', t:'Data gravity', d:'Large, chatty datasets pull the services around them toward them \u2014 moving one side far away adds latency that the pair cannot afford.'},
  {id:'g-cutover', t:'Cutover window', d:'The agreed period when traffic switches to the migrated workload. Chosen to minimize business impact (e.g., Sunday 02:00\u201306:00).'},
  {id:'g-rollback', t:'Rollback plan', d:'The pre-agreed way back to the source system if validation fails \u2014 defined before cutover, not improvised after it.'},
  {id:'g-rto', t:'RTO \u2014 Recovery Time Objective', d:'The maximum tolerable time to restore a service after a failure. \u201cRTO 4 h\u201d = back in business within 4 hours.'},
  {id:'g-rpo', t:'RPO \u2014 Recovery Point Objective', d:'The maximum tolerable data loss window, measured backwards in time. \u201cRPO 15 min\u201d = lose at most 15 minutes of transactions.'},
  {id:'g-residency', t:'Data residency', d:'A legal or policy constraint that data must remain inside a given jurisdiction \u2014 satisfied by region pinning, not by encryption alone.'},
  {id:'g-byol', t:'BYOL', d:'Bring Your Own License: reusing existing licenses in the cloud under their existing terms \u2014 which can include unpleasant virtual-core clauses.'},
  {id:'g-sixrs', t:'The Six Rs', d:'Migration strategy vocabulary: Rehost (move as-is), Replatform (minor targeted changes), Refactor (re-architect), Repurchase (replace with a managed product), Retire (decommission), Retain (leave for now).'},
  {id:'g-az', t:'AZ \u2014 Availability Zone', d:'One isolated datacenter group inside a cloud region. Same region but a different AZ adds distance and a small latency penalty \u2014 measured here at p95 16 ms vs 11 ms same-AZ.'},
  {id:'g-rtt', t:'RTT \u2014 Round-Trip Time', d:'The time a request takes to travel to the far end and come back. Dependency budgets (like the 15 ms Storefront\u2194LedgerDB budget) are stated in RTT, measured at p95 under load.'},
  {id:'g-idp', t:'IdP \u2014 Identity Provider', d:'The central service that authenticates users (here: meridian.auth, reachable only over the private WAN link). Apps consume it through SSO (single sign-on); MFA (multi-factor authentication) adds a second proof beyond the password.'},
  {id:'g-egress', t:'Egress', d:'Data transfer OUT of a provider or environment \u2014 billed per GB and often the hidden cost of a migration. This engagement tracks the one-time egress of the initial transfer separately from the monthly cap.'},
  {id:'g-nas', t:'NAS \u2014 Network-Attached Storage', d:'A file-level storage appliance shared over the network (SMB/NFS). The Media Archive\u2019s source, archive-nas-01, is one \u2014 its replacement is a managed cloud object store.'},
  {id:'g-sla', t:'SLA \u2014 Service-Level Agreement', d:'A committed level of service, stated as a measurable target (here: archive retrieval within 12 hours). SLAs convert vague expectations into checkable requirements.'},
  {id:'g-saas', t:'SaaS \u2014 Software as a Service', d:'A complete application run by the vendor (here: the BI platform contracted to replace the Reports Server). Choosing SaaS for a workload is the \u201crepurchase\u201d strategy.'},
  {id:'g-dns', t:'DNS & TTL', d:'The Domain Name System maps names to addresses; TTL (time-to-live) sets how long resolvers may cache an answer. Lowering the TTL days before cutover makes the DNS switch fast and reversible.'}
];

/* Requirement-sorter cards (M1) */
const REQ_CARDS = [
  {id:'c1', txt:'Eastport DC lease ends June 30; every move must be complete by then.'},
  {id:'c2', txt:'Storefront must expose the REST checkout API v2 exactly as it does today.'},
  {id:'c3', txt:'Storefront p95 page render stays under 400 ms at baseline load.'},
  {id:'c4', txt:'One-time migration budget of $40,000 including egress fees.'},
  {id:'c5', txt:'Payroll must run unattended on the last business day of each month.'},
  {id:'c6', txt:'LedgerDB: RTO 4 h and RPO 15 min after any failure.'}
];
const REQ_CLASSES = {business:'Business', functional:'Functional', nonfn:'Non-functional'};
