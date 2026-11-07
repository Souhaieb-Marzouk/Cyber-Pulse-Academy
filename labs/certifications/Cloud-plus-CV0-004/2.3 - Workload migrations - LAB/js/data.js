// ─────────────────────────────────────────────────────────────────────────────
// js/data.js — ALL lab content for the Cloud Migration Control Tower.
// 1:1 port of the original TypeScript data modules (content.ts, workloads.ts,
// evidence.ts, quiz.ts + the data halves of objectives.ts). Emitted verbatim;
// wording, options, correct answers, hint tiers and feedback are unchanged.
// Every org, host and figure in here is synthetic training data (fictional).
// ─────────────────────────────────────────────────────────────────────────────

const BRIEFING = {
  "org": "Meridian Freight Group",
  "tagline": "Europe-wide freight & logistics · Rotterdam HQ · 2,400 staff",
  "lines": [
    "You are the migration lead for programme HELVETICA: Meridian Freight Group is exiting its aging Rotterdam datacenter (RDM-DC1 — the cooling plant is failing and the lease ends 2027) and consolidating onto EuroCloud, with one workload repatriating back on-premises and one being pulled off the provider the company is exiting.",
    "Twelve workloads are in scope. Some have hard blockers — licenses that cannot move, litigation holds, partner firewalls pinned to IPs. The board wants a plan that survives contact with reality: right workloads, right strategies, right order, with cutover and rollback designed before the night they're needed.",
    "Your tower is cleared for operations: assign flight plans, monitor transfers on radar, sequence the waves, and run the cutover. Objective: land every workload safely — and be able to defend every decision in CompTIA Cloud+ CV0-004 objective 2.3 terms."
  ],
  "certNote": "Certification relevance: CV0-004 Domain 2.0 Deployment (19 % of the exam), objective 2.3 'Summarize aspects of cloud migration' — migration types, resource allocation, eleven considerations, and the six application migration strategies. This lab drills all of them with scenario practice, the same style as the exam's performance-based questions."
};

const KNOWLEDGE_CORE = {
  "intro": [
    "A workload migration moves an application and its data from where it runs today to where it should run next — on-premises → cloud, cloud → on-premises (repatriation), or cloud-to-cloud. CompTIA's CV0-004 objective 2.3 asks you to summarize the types, the considerations, the resource allocation question, and the six application migration strategies. Executing one well (your lesson's focus) adds a planning and execution lifecycle on top: assess, map dependencies, plan transfers, sequence waves, cut over, validate, roll back if needed, and close out."
  ],
  "strategies": [
    {
      "name": "Rehost",
      "aka": "lift-and-shift",
      "text": "Move as-is. Fastest, minimal change; cost savings come from DC exit and right-sizing — not from modernization."
    },
    {
      "name": "Replatform",
      "aka": "lift-tinker-shift",
      "text": "Move with small swaps (managed database, managed load balancing). App code untouched; big win when licensing or ops burden is the pain."
    },
    {
      "name": "Re-architect",
      "aka": "redesign",
      "text": "Change the application architecture (monolith → services, batch → event-driven) to unlock elasticity and managed platforms."
    },
    {
      "name": "Refactor",
      "aka": "rip-and-replace",
      "text": "CompTIA's material: the application is completely rearchitected/rewritten to become cloud-ready. Reserved for code you own and platforms you cannot lift (e.g., SPARC)."
    },
    {
      "name": "Retire",
      "aka": "decommission",
      "text": "Don't migrate — decommission. Frequently paired with a SaaS replacement (industry '7 Rs' calls that repurchase)."
    },
    {
      "name": "Retain",
      "aka": "stay put",
      "text": "Keep on-premises for now. Right answer when licensing blocks you, latency forbids, or cost says no."
    }
  ],
  "types": [
    "On-premises → cloud — the classic datacenter exit (WL-02, WL-05, …).",
    "Cloud → on-premises — repatriation, usually latency, cost or control driven (WL-08).",
    "Cloud → cloud — provider exit/consolidation, often to escape egress fees and a duplicate management plane (WL-09)."
  ],
  "considerations": [
    [
      "Storage",
      "Volume and tiering decide transfer method — 14 TB of 82 % cold archive does not belong on a thin WAN (WL-02)."
    ],
    [
      "Platform compatibility",
      "SPARC doesn't exist in the target cloud; some OS/hypervisor combos don't either (WL-07)."
    ],
    [
      "Compute",
      "Right-size on landing: 8 % CPU on 16 vCPU monsters is pure waste (WL-05, WL-10); spiky workloads want autoscaling (WL-01)."
    ],
    [
      "Cost",
      "TCO beats invoice: FTE lines, per-core licenses, egress fees. Compute it honestly (TCO-PROP)."
    ],
    [
      "Networking",
      "Hardcoded IPs, pinned NAT/egress rules, partner firewalls, fixed DNS names — all break silently (DEPMAP)."
    ],
    [
      "Management overhead",
      "Every provider you keep is another console, another billing model, another on-call surface (WL-09)."
    ],
    [
      "Service availability",
      "Region/AZ choice, cutover windows, and RTO/RPO targets decide how traffic actually moves (POLICY)."
    ],
    [
      "Vendor lock-in",
      "Managed services couple you to provider APIs — price the exit (decoupling re-work + egress) before you buy in."
    ],
    [
      "Environmental (power & cooling)",
      "The reason this programme exists: failing cooling plant, rising power cost, lease end."
    ],
    [
      "Regulatory",
      "Litigation holds and retention chains must survive the move — legal signs off first (WL-11)."
    ],
    [
      "Compliance",
      "PCI scope follows the cardholder data; segmentation and controls must exist in the landing zone (WL-04, WL-05)."
    ]
  ],
  "lifecycle": [
    [
      "Assess & map",
      "Inventory, utilization data, dependency traces, bandwidth tests, licensing and compliance registers (your Evidence Locker)."
    ],
    [
      "Plan",
      "Strategy per workload, transfer methods, right-sized landing zones, wave sequencing, cutover runbook, rollback triggers."
    ],
    [
      "Execute",
      "Seed transfers (appliance/gateway/V2V), delta sync, freeze, verify (checksums + lag), switch, smoke test/UAT."
    ],
    [
      "Validate & cut over",
      "Integrity sweeps and baseline comparisons gate the cutover — never switch onto divergent data."
    ],
    [
      "Roll back if armed",
      "Quantified triggers fire the decision; DNS flip is the fast path; RTO/RPO decide fix-forward vs rollback."
    ],
    [
      "Close out",
      "Hypercare window, decommission after it, CMDB/runbook truth, spend reconciliation, day-30 rightsizing."
    ]
  ],
  "realWorld": [
    [
      "Netflix",
      "2008–2016: exited its own datacenters and re-architected into cloud-native services — the canonical re-architecture story."
    ],
    [
      "Capital One",
      "2014–2020: went 'all-in' on cloud and closed its datacenters — mobile banking on managed platforms."
    ],
    [
      "Dropbox",
      "Mid-2010s: famously repatriated much of its storage infrastructure on-premises — a cloud → on-premises (repatriation) case."
    ],
    [
      "Basecamp / 37signals",
      "2022–2023: repatriated most workloads from the cloud and publicly reported seven-figure annual savings — a cost-driven repatriation."
    ]
  ],
  "examTips": [
    "Exam items give you a scenario and expect the exact term: 'moved as-is' = rehost; 'small tweaks like managed DB' = replatform; 'complete rewrite' = refactor/re-architect; 'shut it down' = retire; 'keep it where it is' = retain.",
    "Migration type = the direction arrow (where it runs today → where it must run). Read the wording for 'currently in cloud' or 'back on-premises'.",
    "Transfer-method arithmetic appears as scenario math: size × 8 ÷ bandwidth, then compare against the deadline.",
    "Considerations are a checklist the question wants you to notice: licensing, latency, residency, lock-in, power/cooling — each maps to a scenario detail."
  ]
};

const DEBRIEF = {
  "validationOps": [
    [
      "Integrity",
      "SHA-256 manifest comparison per disk/image (CKSUM). Mismatch = divergence → re-sync under freeze, re-verify. Never accept."
    ],
    [
      "Performance",
      "Same probes pre/post, compared to baseline (PERF-BASE). p95 > 2× baseline for 30 min = rollback trigger per policy."
    ],
    [
      "Dependency reachability",
      "Post-cutover smoke tests must exercise every mapped dependency (partner AS2, payment gateway, SMTP, batch DNS)."
    ],
    [
      "Compliance gates",
      "Legal sign-off (holds), license mobility approvals, residency checks — gate evidence stored with the change record."
    ]
  ],
  "controls": [
    [
      "Strategy discipline",
      "Six strategies (2.3): rehost / replatform / re-architect / refactor / retain / retire — choose from evidence, not habit."
    ],
    [
      "Transfer controls",
      "Appliance for bulk, dedicated link for latency-critical, VPN for non-prod, gateway for file/object, export/import for SaaS."
    ],
    [
      "Cutover safeguards",
      "TTL ≤ 300 s at T-24h, freeze window, final delta sync, lag+checksum verification before switch, smoke test/UAT after."
    ],
    [
      "Rollback plan",
      "Quantified triggers (error rate, p95, conversion), first action = DNS flip, 14-day rollback window, RTO/RPO from policy."
    ],
    [
      "Post-migration hygiene",
      "Decommission after hypercare, CMDB/runbook truth, spend reconciliation, day-30 rightsizing (lifecycle 3.4)."
    ]
  ],
  "blueTeam": [
    "Write the cutover runbook as if the on-call will execute it at 03:00 without you — exact order, exact values, named rollback point.",
    "Baseline before you move: you cannot detect a 3× regression without the pre-migration numbers.",
    "Keep the rollback window honest: source stays intact, firewall rules stay, reverse data path tested.",
    "Compliance gates are binary: no legal sign-off, no move. No mobility approval, no license in the cloud."
  ],
  "redTeam": [
    "Think like the failure: what breaks first? Hardcoded IPs and pinned NAT rules — always audit them before the wave, not during it.",
    "Bandwidth optimism is the classic plan-killer: headline Mbps ≠ contended Mbps. Test with the real number of streams.",
    "The dangerous migration is the one with no quantified rollback triggers — 'we'd know when to go back' is not a plan.",
    "Silent divergence (checksum mismatch) is worse than loud failure: it ships corrupted state to production. Verify, then switch."
  ],
  "links": [
    {
      "label": "CompTIA Cloud+ (CV0-004) — official page",
      "url": "https://www.comptia.org/en-us/certifications/cloud/"
    },
    {
      "label": "CompTIA Cloud+ CV0-004 exam objectives (PDF)",
      "url": "https://www.comptia.org/training/resources/exam-objectives"
    }
  ],
  "nextSteps": [
    "Next in Domain 2.0: 2.4 'use code to deploy and configure cloud resources' (IaC/CaC) and 2.5 'provision the appropriate cloud resources'.",
    "Then: 6.1 deployment troubleshooting (incompatibility, misconfiguration, outages) — the failure half of this lesson.",
    "Revisit: 1.2 availability (RTO/RPO) and 3.4 lifecycle (decommissioning) — both reappear inside migration scenarios."
  ]
};

const STRATEGY_LABELS = {
  "rehost": "Rehost (lift-and-shift)",
  "replatform": "Replatform (lift-tinker-shift)",
  "rearchitect": "Re-architect",
  "refactor": "Refactor (rip-and-replace rewrite)",
  "retain": "Retain (stay put)",
  "retire": "Retire (decommission / replace)"
};

const STRATEGY_DEFS = {
  "rehost": "Move the workload as-is to cloud VMs. Fast, minimal change, but you carry legacy constraints with you.",
  "replatform": "Move with small optimizations (e.g., swap the database engine for a provider-managed service) without redesigning the application.",
  "rearchitect": "Redesign the application architecture itself (e.g., monolith → microservices/serverless) to unlock cloud-native elasticity.",
  "refactor": "Full in-house rewrite — 'rip and replace' — of the codebase for the cloud platform. Highest effort, reserved for code you own and must fundamentally rework.",
  "retain": "Keep the workload where it is (usually on-premises) for now — revisit later. Right answer when cost, licensing or latency outweighs the benefit.",
  "retire": "Decommission the workload instead of migrating it — often paired with a SaaS replacement (industry '7 Rs' calls the replacement move repurchase)."
};

const TYPE_LABELS = {
  "onprem-to-cloud": "On-premises → cloud",
  "cloud-to-onprem": "Cloud → on-premises (repatriation)",
  "cloud-to-cloud": "Cloud → cloud"
};

const TRANSFER_LABELS = {
  "v2v-direct": "V2V replication — dedicated direct connection (predictable bandwidth)",
  "v2v-vpn": "V2V replication — site-to-site VPN (shared bandwidth)",
  "appliance": "Offline transfer appliance (ship sealed storage, seed + delta sync)",
  "gateway": "Storage gateway (incremental sync of file/object data)",
  "saas": "SaaS cutover (export → import → validate in SaaS)",
  "none": "N/A — no data transfer needed (retain / rebuild in place)"
};

const WORKLOADS = [
  {
    "id": "WL-01",
    "name": "TrackTrace API",
    "kind": "Customer shipment-tracking API (Java monolith)",
    "os": "RHEL 8",
    "hypervisor": "VMware ESXi",
    "dataTB": 0.4,
    "tier": "STANDARD",
    "downtime": "Low tolerance (public-facing)",
    "depsOut": [
      "WL-04"
    ],
    "origin": "onprem",
    "notes": "Traffic spikes 6× during holiday peaks. Monolith, 9-year-old codebase, owned in-house.",
    "story": "The public tracking API serves retailers across the EU. Marketing wants elastic scaling for seasonal peaks instead of yearly over-provisioning. The team owns the code and wants to restructure it into loosely-coupled services on a managed container platform — accepting deeper coupling to provider services in exchange for elasticity.",
    "sizing": {
      "current": "4 × 8 vCPU / 32 GB fixed VMs",
      "question": "Target compute allocation for the cloud landing zone?",
      "options": [
        {
          "id": "s1",
          "label": "4 × 8 vCPU / 32 GB fixed VMs (as-is)"
        },
        {
          "id": "s2",
          "label": "Managed container platform with horizontal autoscaling"
        },
        {
          "id": "s3",
          "label": "1 × 64 vCPU / 256 GB super-VM"
        }
      ],
      "correct": "s2"
    },
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "rearchitect",
      "transfer": "gateway"
    }
  },
  {
    "id": "WL-02",
    "name": "Filer-01",
    "kind": "Windows file server + archive (SMB shares)",
    "os": "Windows Server 2019",
    "hypervisor": "VMware ESXi",
    "dataTB": 14,
    "tier": "STANDARD",
    "downtime": "High (users tolerate cold storage lag)",
    "depsOut": [],
    "origin": "onprem",
    "notes": "14 TB total, 82 % cold/inactive. WAN headlink 250 Mbps shared with replication streams.",
    "story": "The corporate file share holds 14 TB, of which ~82 % has not been touched in 18 months. The pilot replication run found the 250 Mbps WAN headlink degrades to ~25 Mbps per stream when five migration streams run concurrently. The datacenter exit deadline is 30 days out.",
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "rehost",
      "transfer": "appliance"
    }
  },
  {
    "id": "WL-03",
    "name": "CRM 7",
    "kind": "On-premises CRM (vendor end-of-support)",
    "os": "Windows Server 2016",
    "hypervisor": "Hyper-V",
    "dataTB": 0.6,
    "tier": "GDPR",
    "downtime": "High (weekend cutover OK)",
    "depsOut": [],
    "origin": "onprem",
    "notes": "Vendor support ended. SaaS CRM contract signed. 320 GB contact/activity data to cut over.",
    "story": "The vendor ended support for CRM 7 last quarter. A SaaS CRM has already been contracted. The on-premises instance will be decommissioned and its 320 GB of customer data exported and imported into the SaaS platform after field mapping.",
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "retire",
      "transfer": "saas"
    }
  },
  {
    "id": "WL-04",
    "name": "PayCard DB",
    "kind": "PCI-scoped card-payment database (Oracle RAC)",
    "os": "Oracle Linux 8",
    "hypervisor": "Bare metal",
    "dataTB": 2.1,
    "tier": "PCI",
    "downtime": "Very low (payment windows)",
    "depsOut": [
      "WL-07"
    ],
    "origin": "onprem",
    "notes": "Oracle host-based licenses are pinned to physical cores; mobility to cloud needs vendor approval that is NOT granted yet.",
    "story": "The PCI-scoped card database is latency-sensitive, bound to strict compliance controls, and its Oracle host-based licenses cannot move to cloud infrastructure without a mobility approval the vendor has explicitly declined for this license class. Finance also flags that cloud egress for nightly settlement files adds cost with no identified benefit yet.",
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "retain",
      "transfer": "none"
    }
  },
  {
    "id": "WL-05",
    "name": "WebShop",
    "kind": "E-commerce front (LAMP ×3 behind LB)",
    "os": "Ubuntu 22.04",
    "hypervisor": "VMware ESXi",
    "dataTB": 3.2,
    "tier": "PCI",
    "downtime": "Very low (revenue-critical)",
    "depsOut": [
      "WL-12",
      "PAYGATEWAY",
      "WL-06"
    ],
    "origin": "onprem",
    "notes": "3 VMs at 16 vCPU / 64 GB each but 8 % average CPU. Direct 250 Mbps connection to EuroCloud available.",
    "story": "The revenue-critical shop front runs on three heavily over-provisioned VMs (16 vCPU / 64 GB each, 8 % average CPU). Commodity LAMP stack, no rework planned — move it as-is, right-size on landing, and cut over via DNS during the weekend freeze.",
    "sizing": {
      "current": "3 × 16 vCPU / 64 GB (8 % avg CPU)",
      "question": "Target compute allocation in the cloud landing zone?",
      "options": [
        {
          "id": "s1",
          "label": "3 × 16 vCPU / 64 GB (as-is)"
        },
        {
          "id": "s2",
          "label": "3 × 4 vCPU / 16 GB, right-sized, with autoscaling headroom"
        },
        {
          "id": "s3",
          "label": "1 × 48 vCPU / 192 GB (consolidated)"
        }
      ],
      "correct": "s2"
    },
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "rehost",
      "transfer": "v2v-direct"
    }
  },
  {
    "id": "WL-06",
    "name": "Reporting BI",
    "kind": "SQL Server + SSRS reporting stack",
    "os": "Windows Server 2019",
    "hypervisor": "VMware ESXi",
    "dataTB": 1.1,
    "tier": "STANDARD",
    "downtime": "Medium (nights OK)",
    "depsOut": [
      "SMTPRELAY"
    ],
    "origin": "onprem",
    "notes": "Per-core SQL licenses — cloud per-core cost would triple. Provider-managed DB is license-included.",
    "story": "The reporting stack is licensed per-core; lifting it as VMs would triple license spend in the cloud. Rehosting with one small change — moving the database onto the provider-managed, license-included database service — keeps the app tier untouched and fixes the cost problem.",
    "sizing": {
      "current": "2 × 12 vCPU / 96 GB + SQL per-core licenses",
      "question": "Target allocation that controls license cost?",
      "options": [
        {
          "id": "s1",
          "label": "2 × 12 vCPU / 96 GB with bring-your-own per-core licenses"
        },
        {
          "id": "s2",
          "label": "App VMs as-is + provider-managed database (license-included)"
        },
        {
          "id": "s3",
          "label": "Buy additional per-core licenses for burst headroom"
        }
      ],
      "correct": "s2"
    },
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "replatform",
      "transfer": "gateway"
    }
  },
  {
    "id": "WL-07",
    "name": "Forecast Engine",
    "kind": "In-house inventory forecasting engine",
    "os": "Solaris 11 (SPARC)",
    "hypervisor": "SPARC T8 (bare metal)",
    "dataTB": 0.3,
    "tier": "STANDARD",
    "downtime": "High (batch, nightly)",
    "depsOut": [],
    "origin": "onprem",
    "notes": "SPARC architecture is not available in any target cloud. Codebase fully owned in-house.",
    "story": "The forecasting engine runs on SPARC hardware that no target cloud provides. The codebase is fully in-house. The platform team decided on a complete rip-and-replace rewrite for the cloud platform (managed queues + GPU batch), retiring the Solaris system after parallel-run validation.",
    "sizing": {
      "current": "SPARC T8-4 (32 threads, 512 GB)",
      "question": "Target compute for the rewritten engine?",
      "options": [
        {
          "id": "s1",
          "label": "Emulate SPARC on x86 cloud VMs"
        },
        {
          "id": "s2",
          "label": "Batch jobs on managed compute with GPU option for model training"
        },
        {
          "id": "s3",
          "label": "Ship the SPARC server to a colocation site and keep it"
        }
      ],
      "correct": "s2"
    },
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "refactor",
      "transfer": "none"
    }
  },
  {
    "id": "WL-08",
    "name": "Plant Analytics",
    "kind": "Factory-floor analytics (PLC telemetry correlation)",
    "os": "Ubuntu 20.04",
    "hypervisor": "AtlantCloud (public cloud)",
    "dataTB": 0.9,
    "tier": "STANDARD",
    "downtime": "Medium (plant window Sunday)",
    "depsOut": [],
    "origin": "cloud",
    "notes": "Pilot mistake: 40 ms RTT to factory PLCs from the distant cloud region. Must move back on-prem.",
    "story": "A proof-of-concept left the plant analytics stack running in a distant cloud region; correlation with factory PLC telemetry now suffers 40 ms RTT and brief automation reports lag. The stack must move back on-premises onto the hyperconverged cluster at RDM-DC1 — a cloud-to-on-premises (repatriation) move.",
    "expected": {
      "migrationType": "cloud-to-onprem",
      "strategy": "rehost",
      "transfer": "gateway"
    }
  },
  {
    "id": "WL-09",
    "name": "Marketing Assets",
    "kind": "Marketing site + media assets (VMs + object storage)",
    "os": "Debian 12",
    "hypervisor": "AtlantCloud (public cloud)",
    "dataTB": 1.8,
    "tier": "STANDARD",
    "downtime": "High (static content)",
    "depsOut": [],
    "origin": "cloud",
    "notes": "Trapped on AtlantCloud which the company is exiting. Egress fees apply; second management plane to maintain.",
    "story": "The marketing site and media library live on AtlantCloud, the provider Meridian is exiting. Consolidating onto EuroCloud ends the second management plane and the per-egress fee drain — a cloud-to-cloud move executed via storage gateway replication and object-copy tooling.",
    "expected": {
      "migrationType": "cloud-to-cloud",
      "strategy": "rehost",
      "transfer": "gateway"
    }
  },
  {
    "id": "WL-10",
    "name": "Dev/Test Estate",
    "kind": "37 dev/test VMs (mixed)",
    "os": "Mixed",
    "hypervisor": "VMware ESXi",
    "dataTB": 2.6,
    "tier": "STANDARD",
    "downtime": "None needed (non-prod)",
    "depsOut": [
      "WL-06"
    ],
    "origin": "onprem",
    "notes": "Idle nights and weekends. Perfect pilot wave candidate: low risk, fast lessons.",
    "story": "Thirty-seven dev/test VMs, idle at night and on weekends. Low business risk makes this the ideal pilot wave: it exercises tooling, network paths and runbooks before anything revenue-critical moves. Most VMs are over-sized; most can be right-sized and scheduled off when idle.",
    "sizing": {
      "current": "37 VMs, average 8 vCPU / 32 GB, 6 % utilization",
      "question": "Target allocation strategy for the estate?",
      "options": [
        {
          "id": "s1",
          "label": "Lift all 37 as-is, optimize later"
        },
        {
          "id": "s2",
          "label": "Right-size fleet on landing + scheduled shutdown when idle"
        },
        {
          "id": "s3",
          "label": "Upgrade all to GPU instances for future AI work"
        }
      ],
      "correct": "s2"
    },
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "rehost",
      "transfer": "v2v-vpn"
    }
  },
  {
    "id": "WL-11",
    "name": "Mail Archive",
    "kind": "Compliance email archive (PST store)",
    "os": "Windows Server 2016",
    "hypervisor": "Hyper-V",
    "dataTB": 4.2,
    "tier": "RETENTION",
    "downtime": "High (read-mostly)",
    "depsOut": [],
    "origin": "onprem",
    "notes": "Under litigation hold — retention chain must be preserved and legal must sign off before any move.",
    "story": "The email archive is under litigation hold: retention metadata and audit chains must survive intact, and legal must sign off before anything moves. The plan is to replatform it onto a managed archive service with the same retention classes once legal approves.",
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "replatform",
      "transfer": "gateway"
    }
  },
  {
    "id": "WL-12",
    "name": "EDI Gateway",
    "kind": "Partner EDI gateway (AS2, 40 partners)",
    "os": "RHEL 8",
    "hypervisor": "VMware ESXi",
    "dataTB": 0.8,
    "tier": "STANDARD",
    "downtime": "Low (partner file windows)",
    "depsOut": [],
    "origin": "onprem",
    "notes": "40 partner firewalls pin WL-12's current IP. Must move in the SAME wave as WL-05, immediately after it.",
    "story": "The EDI gateway exchanges AS2 files with 40 logistics partners whose firewalls pin the gateway's current IP. It shares the commerce wave with WebShop (WL-05) and must cut over immediately after it, with partner firewall rules updated in the agreed window.",
    "expected": {
      "migrationType": "onprem-to-cloud",
      "strategy": "rehost",
      "transfer": "v2v-direct"
    }
  }
];

const WAVE_GROUPS = [
  {
    "id": "W1",
    "label": "Pilot — Dev/Test estate",
    "members": [
      "WL-10"
    ],
    "why": "Low-risk pilot proves tooling, network paths and runbooks before revenue-critical work."
  },
  {
    "id": "W2",
    "label": "Commerce core — WebShop + EDI",
    "members": [
      "WL-05",
      "WL-12"
    ],
    "why": "WL-12 depends on WL-05's cutover; they share the freeze window and partner firewall maintenance slot."
  },
  {
    "id": "W3",
    "label": "Bulk data — Filer",
    "members": [
      "WL-02"
    ],
    "why": "Appliance lead time runs in parallel; bulk lands between commerce waves."
  },
  {
    "id": "W4",
    "label": "Data services — BI + Archive",
    "members": [
      "WL-06",
      "WL-11"
    ],
    "why": "Managed-database replatform and the (legal-gated) archive move share gateway tooling."
  },
  {
    "id": "W5",
    "label": "Cloud-native — TrackTrace",
    "members": [
      "WL-01"
    ],
    "why": "The re-architecture lands last so the new platform is proven by earlier waves."
  }
];

const WAVE_START_ORDER = ["W3","W5","W1","W4","W2"];

const CUTOVER_STEPS = [
  {
    "id": "S1",
    "label": "Publish change-freeze window to all teams",
    "detail": "Announce the freeze so no writes/changes land during final sync."
  },
  {
    "id": "S2",
    "label": "Lower DNS TTL to 300 s (T-24 h)",
    "detail": "Propagate a short TTL ahead of time so the final switch is fast and reversible."
  },
  {
    "id": "S3",
    "label": "Run final delta sync",
    "detail": "Catch up changes accumulated since the seed copy."
  },
  {
    "id": "S4",
    "label": "Freeze source writes",
    "detail": "Stop changes at the source so the copies converge exactly."
  },
  {
    "id": "S5",
    "label": "Verify zero replication lag + checksums",
    "detail": "Confirm the target matches the source before switching traffic."
  },
  {
    "id": "S6",
    "label": "Switch DNS / load balancer to cloud endpoints",
    "detail": "The traffic cut. Rollback point: before this step completes."
  },
  {
    "id": "S7",
    "label": "Smoke test + UAT sign-off",
    "detail": "Prove key journeys work against the cloud stack."
  },
  {
    "id": "S8",
    "label": "Close freeze — start hypercare monitoring",
    "detail": "Keep the rollback window open while the team watches dashboards."
  }
];

const FREEZE_OPTIONS = ["Fri 18:00 – Sat 06:00","Sat 22:00 – Sun 06:00","Sun 06:00 – Sun 18:00","Any weekday night"];

const CUTOVER_DAY_OPTIONS = ["Friday","Saturday","Sunday","Monday"];

const ROLLBACK_TRIGGERS = [
  {
    "id": "T1",
    "label": "Checkout error rate > 5 % sustained 10 min"
  },
  {
    "id": "T2",
    "label": "p95 latency > 2× baseline for 30 min"
  },
  {
    "id": "T3",
    "label": "Order conversion drop > 20 % vs 7-day baseline"
  },
  {
    "id": "T4",
    "label": "A developer says the app 'feels slow'"
  },
  {
    "id": "T5",
    "label": "A single 404 appears in the access logs"
  },
  {
    "id": "T6",
    "label": "Cloud cost dashboard exceeds the daily budget"
  }
];

const VALID_TRIGGERS = ["T1","T2","T3"];

const ROLLBACK_FIRST_OPTIONS = [
  {
    "id": "A",
    "label": "Flip DNS / load balancer back to on-prem endpoints (TTL is already 300 s)"
  },
  {
    "id": "B",
    "label": "Reboot the cloud database cluster"
  },
  {
    "id": "C",
    "label": "Open a vendor support ticket and wait"
  },
  {
    "id": "D",
    "label": "Increase cloud database capacity first"
  }
];

const INCIDENT_ACTION_OPTIONS = [
  {
    "id": "I1",
    "label": "Update the app-tier connection config to the cloud DB endpoint"
  },
  {
    "id": "I2",
    "label": "Flush DNS / clear cached entries on the app tier"
  },
  {
    "id": "I3",
    "label": "Verify connection-pool health and error rate"
  },
  {
    "id": "I4",
    "label": "Resume hypercare monitoring"
  }
];

const INCIDENT_CORRECT_ACTIONS = ["I1","I2","I3","I4"];

const FINDINGS = [
  {
    "id": "F1",
    "workload": "WL-05",
    "kind": "integrity",
    "title": "Checksum mismatch — disk D",
    "detail": "SHA-256 of webshop-diskD.vmdk differs from manifest CKSUM. Delta sync overlapped active writes during the pilot window."
  },
  {
    "id": "F2",
    "workload": "WL-05",
    "kind": "performance",
    "title": "p95 latency 3× pre-migration baseline",
    "detail": "Baseline 210 ms → measured 640 ms. Trace shows chatty calls still resolving to the on-prem payment gateway (egress hairpin)."
  },
  {
    "id": "F3",
    "workload": "WL-10",
    "kind": "clean",
    "title": "All checks green",
    "detail": "Checksums match manifest; p95 within 10 % of baseline."
  },
  {
    "id": "F4",
    "workload": "WL-02",
    "kind": "clean",
    "title": "All checks green",
    "detail": "Appliance seed verified; delta-sync manifest matches; restore test passed."
  }
];

const DISPOSITIONS = [
  {
    "id": "accept",
    "label": "Accept as-is"
  },
  {
    "id": "resync",
    "label": "Re-sync data & re-verify"
  },
  {
    "id": "rollback",
    "label": "Roll back to source"
  }
];

const TRIAGE_DOCS = [
  {
    "id": "BW-TEST",
    "label": "BW-TEST — Bandwidth & Contention Test"
  },
  {
    "id": "LIC-INV",
    "label": "LIC-INV — Licensing Inventory & Mobility Notice"
  },
  {
    "id": "COMP-REG",
    "label": "COMP-REG — Compliance Register"
  },
  {
    "id": "ASSESS-2026",
    "label": "ASSESS-2026 — Infrastructure Assessment"
  },
  {
    "id": "ARCHIVE-2019",
    "label": "ARCHIVE-2019 — 2019 draft assessment"
  },
  {
    "id": "PRINT-QUOTE",
    "label": "PRINT-QUOTE — Print-fleet refresh quote"
  },
  {
    "id": "DEPMAP",
    "label": "DEPMAP — Dependency Map"
  }
];

const TRIAGE_EXPECTED_DOCS = ["BW-TEST","LIC-INV","COMP-REG"];

const TRIAGE_CHANGE_OPTIONS = {
  "BW-TEST": [
    {
      "id": "bw1",
      "label": "Nothing — 250 Mbps is enough for all streams"
    },
    {
      "id": "bw2",
      "label": "Switch WL-02 bulk data to the offline appliance; keep online for hot data"
    },
    {
      "id": "bw3",
      "label": "Buy a second WAN headlink before anything moves"
    }
  ],
  "LIC-INV": [
    {
      "id": "li1",
      "label": "Nothing — all licenses move freely"
    },
    {
      "id": "li2",
      "label": "Confirm WL-04 stays on-prem (host-based licenses locked); replatform WL-06 to license-included managed DB"
    },
    {
      "id": "li3",
      "label": "File a retroactive mobility waiver after moving WL-04"
    }
  ],
  "COMP-REG": [
    {
      "id": "cr1",
      "label": "Nothing — compliance is a post-migration topic"
    },
    {
      "id": "cr2",
      "label": "Gate WL-11 on legal sign-off (litigation hold) and keep PCI scope for WL-04/WL-05 landing zones"
    },
    {
      "id": "cr3",
      "label": "Delete the archive at source early to reduce transfer size"
    }
  ]
};

const TRIAGE_EXPECTED_CHANGES = {
  "BW-TEST": "bw2",
  "LIC-INV": "li2",
  "COMP-REG": "cr2"
};

const AUDIT_DEPS = [
  {
    "id": "D1",
    "label": "WL-12 → WL-05: hardcoded IP in partner-facing config"
  },
  {
    "id": "D2",
    "label": "WL-05 → PaymentGW: egress rule pinned to on-prem NAT address"
  },
  {
    "id": "D3",
    "label": "WL-06 → SMTPRELAY: hardcoded on-prem relay for report mail"
  },
  {
    "id": "D4",
    "label": "Nightly batch → WL-06 via fixed DNS name 'bi.internal'"
  },
  {
    "id": "D5",
    "label": "WL-10 → WL-06: shared test dataset mount"
  },
  {
    "id": "D6",
    "label": "WL-02 → none: standalone file shares"
  },
  {
    "id": "D7",
    "label": "WL-01 → WL-04: reads card status nightly (stays put with WL-04)"
  }
];

const AUDIT_EXPECTED_DEPS = ["D1","D2","D3","D4"];

const AUDIT_FIX_OPTIONS = {
  "D1": [
    {
      "id": "f1",
      "label": "Re-IP + update partner firewalls in the agreed window (co-schedule with WL-05)"
    },
    {
      "id": "f2",
      "label": "Have each partner add the new IP after go-live, one ticket at a time"
    },
    {
      "id": "f3",
      "label": "Move WL-12 in a later wave, a month after WL-05"
    }
  ],
  "D2": [
    {
      "id": "f1",
      "label": "Update the egress rule to the cloud NAT address before cutover"
    },
    {
      "id": "f2",
      "label": "Route the payment flow through the site-to-site VPN instead"
    },
    {
      "id": "f3",
      "label": "Update the rule reactively after the first failed settlement run"
    }
  ],
  "D3": [
    {
      "id": "f1",
      "label": "Co-migrate the relay or swap to the provider's managed SMTP"
    },
    {
      "id": "f2",
      "label": "Keep the on-prem relay and route report mail over the VPN"
    },
    {
      "id": "f3",
      "label": "Switch report delivery to the EDI channel"
    }
  ],
  "D4": [
    {
      "id": "f1",
      "label": "Cut over the DNS name with a short TTL + keep an alias during transition"
    },
    {
      "id": "f2",
      "label": "Edit the batch job's config at 02:00 on cutover night"
    },
    {
      "id": "f3",
      "label": "Keep 'bi.internal' pointing at both stacks indefinitely"
    }
  ]
};

const AUDIT_EXPECTED_FIXES = {
  "D1": "f1",
  "D2": "f1",
  "D3": "f1",
  "D4": "f1"
};

const VIOLATION_OPTIONS = [
  {
    "id": "V1",
    "label": "WL-04 Oracle host-based licenses moved to cloud without mobility approval"
  },
  {
    "id": "V2",
    "label": "WL-11 archive deletion at source scheduled before legal sign-off"
  },
  {
    "id": "V3",
    "label": "EU customer PII staged to a US test region for 'faster validation'"
  },
  {
    "id": "V4",
    "label": "PCI card-flow (WL-05 payments) placed in an unsegmented, non-scoped VPC"
  },
  {
    "id": "V5",
    "label": "Runbooks updated to the new architecture"
  },
  {
    "id": "V6",
    "label": "Decommission checklist created for source VMs (post-hypercare)"
  },
  {
    "id": "V7",
    "label": "Backup retention extended to 35 days on the new platform"
  }
];

const VIOLATIONS_EXPECTED = ["V1","V2","V3","V4"];

const PROPOSAL_OPTIONS = [
  {
    "id": "A",
    "label": "Proposal A — managed services platform, €18k/month, minimal ops burden, higher exit cost"
  },
  {
    "id": "B",
    "label": "Proposal B — self-managed IaaS, €11k/month + 1.5 FTE ops (~€70k/FTE·yr), lower exit cost"
  }
];

const EXIT_COST_OPTIONS = [
  {
    "id": "E1",
    "label": "Re-architecture work to decouple provider-managed services"
  },
  {
    "id": "E2",
    "label": "Large-scale data egress charges when leaving"
  },
  {
    "id": "E3",
    "label": "Extra WAN bandwidth consumed during the transfer itself"
  },
  {
    "id": "E4",
    "label": "Re-training staff on the incumbent platform's tooling"
  },
  {
    "id": "E5",
    "label": "Dual-running costs during the hypercare window"
  }
];

const EXIT_COSTS_EXPECTED = ["E1","E2"];

const MEDIUM_QUIZ = [
  {
    "id": "QM1",
    "topic": "Application migration strategies",
    "question": "An application is moved to cloud VMs exactly as it is, with no changes. Which strategy is this?",
    "options": [
      "Refactor",
      "Replatform",
      "Rehost",
      "Retire"
    ],
    "answer": 2,
    "explanation": "Rehost ('lift-and-shift') moves the workload unchanged. Replatform would make small optimizations (e.g., managed DB); Refactor/Re-architect change the application itself; Retire decommissions it."
  },
  {
    "id": "QM2",
    "topic": "Application migration strategies",
    "question": "A company replaces its self-hosted, end-of-support CRM with a SaaS CRM and decommissions the old system. In CompTIA's six-strategy vocabulary, the old system is…",
    "options": [
      "Retained in place",
      "Refactored for the cloud",
      "Rehosted unchanged",
      "Retired and replaced"
    ],
    "answer": 3,
    "explanation": "The legacy instance is retired; the industry '7 Rs' calls the replace-with-SaaS part repurchase. CompTIA's list uses Retire — the replacement detail is the scenario wrapper."
  },
  {
    "id": "QM3",
    "topic": "Cutover & DNS TTL",
    "question": "Why is the DNS TTL lowered to ~300 s a full day BEFORE a cutover?",
    "options": [
      "So caches expire quickly",
      "To cut DNS hosting costs",
      "To comply with GDPR rules",
      "To raise cache hit rates"
    ],
    "answer": 0,
    "explanation": "A TTL of 86400 s means resolvers may serve the old address for up to 24 h. Lowering it in advance means the final switch propagates in minutes and can be flipped back just as fast — the backbone of a controlled cutover. Cost, GDPR and hit rates are unrelated."
  },
  {
    "id": "QM4",
    "topic": "Transfer planning math",
    "scenario": "A 6 TB file share must move. The WAN link is 100 Mbps and migration windows total 7 days. (6 TB × 8 = 48 Tb; ÷ 100 Mbps = 480,000 s ≈ 5.6 days of perfect dedication.)",
    "question": "What is the most defensible plan?",
    "options": [
      "Copy all data online over the WAN",
      "Send the data in email batches",
      "Seed bulk offline, sync the tail",
      "Refuse until bandwidth doubles"
    ],
    "answer": 2,
    "explanation": "5.6 days assumes 100 % of a shared link, no retries, no contention. The robust plan seeds bulk via appliance and delta-syncs the hot tail — time-safe and bandwidth-safe. This mirrors the WL-02 calculation (52 days at contended speeds)."
  },
  {
    "id": "QM5",
    "topic": "Considerations: cost & licensing",
    "question": "Which pair of considerations from objective 2.3 does per-core database licensing most directly threaten?",
    "options": [
      "Compute and storage performance",
      "Cost and platform compatibility",
      "Environmental and regulatory fit",
      "Service availability and lock-in"
    ],
    "answer": 1,
    "explanation": "Per-core licensing can explode cloud costs (cost) and shape which platform the workload may land on (platform compatibility) — the WL-06 lesson: replatform to a license-included managed database."
  },
  {
    "id": "QM6",
    "topic": "Post-migration hygiene",
    "question": "Which post-migration task is genuinely REQUIRED (not optional hygiene)?",
    "options": [
      "Close all on-prem firewall rules now",
      "Delete the pre-migration baselines",
      "Re-image every migrated VM",
      "Validate baselines; update CMDB"
    ],
    "answer": 3,
    "explanation": "Validation against baselines and documentation truth are core close-out. Firewall rules must survive the rollback window; baselines are your comparison point; re-imaging would undo the migration."
  }
];

const HARD_QUIZ = [
  {
    "id": "QH1",
    "topic": "Transfer planning math",
    "scenario": "Pilot shows the 250 Mbps link delivering 25 Mbps/stream under 5-stream contention. Exit deadline: 30 days. Bulk: 14 TB.",
    "question": "Best plan?",
    "options": [
      "Four parallel streams — ~13 days",
      "Request a 60-day deadline extension",
      "Compress 10:1 and stream online",
      "Appliance seed + online delta-sync"
    ],
    "answer": 3,
    "explanation": "Even at an optimistic 100 Mbps aggregate, 14 TB ≈ 13 days of perfect transfer — before retries, verification and the rest of the migration sharing the link. Appliance seed + delta sync is the standard time-safe answer (and the WL-02 lesson). Compression ratios on random file data rarely hold, and an extension concedes the window."
  },
  {
    "id": "QH2",
    "topic": "Rollback & incident decisions",
    "scenario": "Cutover night: error rate hits 8 % (trigger T1 fires). Telemetry: app tier throws DB connection storms to the OLD database IP; the config change was missed. Rollback would take ~25 min and re-import divergence; the config fix takes ~3 min. Tier-1 RTO is 15 min.",
    "question": "Command decision?",
    "options": [
      "Roll back — a trigger fired",
      "Fix forward — inside the RTO",
      "Wait — errors often self-settle",
      "Add database capacity first"
    ],
    "answer": 1,
    "explanation": "Triggers ARM the decision, they don't dictate it. With a 3-min fix inside a 15-min RTO vs a 25-min rollback that breaches RTO and re-diverges data, fix-forward is correct. Capacity is irrelevant — packets aren't reaching the right endpoint."
  },
  {
    "id": "QH3",
    "topic": "Validation & integrity",
    "scenario": "Checksum mismatch on webshop-diskD. Timeline: delta sync started 22:10; the source application took orders until 22:40; the freeze was announced but not enforced.",
    "question": "Root cause and correct response?",
    "options": [
      "Faulty disk — open a vendor ticket",
      "Manifest stale — regenerate it",
      "Sync overlapped writes — re-sync",
      "Accept it — one disk of four"
    ],
    "answer": 2,
    "explanation": "A checksum mismatch after writes-overlapped-sync is a process failure, not hardware: stop writes, re-sync, re-verify. Regenerating the manifest validates the copy against itself — circular. Accepting divergence corrupts the cutover."
  },
  {
    "id": "QH4",
    "topic": "Compliance & licensing",
    "scenario": "Plan review: 'Stage EU customer PII to the US test region for faster validation'; 'Delete the archived mailboxes at source on Friday, legal sign-off expected Monday'; 'Move WL-04's Oracle host-based licenses to cloud VMs'.",
    "question": "How many violations and which types?",
    "options": [
      "Three — residency, hold, licensing",
      "Two — residency and licensing mobility",
      "One — data residency only",
      "None — all standard practice"
    ],
    "answer": 0,
    "explanation": "Three: EU PII in a US region (GDPR residency), deletion before legal sign-off under active litigation hold (regulatory/retention), and license mobility that the vendor explicitly denied (compliance/licensing). Each is a 2.3 'considerations' bullet."
  },
  {
    "id": "QH5",
    "topic": "Dependency sequencing",
    "scenario": "Dependency audit: WL-12 (EDI, 40 partner firewalls pinned to its IP), WL-05 (payment egress rule pinned to on-prem NAT), nightly batch → 'bi.internal' fixed DNS.",
    "question": "Which sequencing decision is most defensible?",
    "options": [
      "Migrate the three independently",
      "Rebuild the EDI gateway before anything else moves",
      "Co-schedule; pre-set NAT; short TTL",
      "Keep everything on-prem for good"
    ],
    "answer": 2,
    "explanation": "Dependencies become schedule constraints: co-wave the gateway with the shop, pre-update the NAT/egress rule, and cut fixed DNS names with short TTLs. Independent migration breaks the pinned references at cutover; a rebuild and a permanent stay don't answer the plan."
  },
  {
    "id": "QH6",
    "topic": "TCO, staffing & lock-in",
    "scenario": "Proposal A: €18k/mo managed services, ~0.2 FTE ops. Proposal B: €11k/mo IaaS + 1.5 FTE ops (€70k/FTE·yr). Team capacity: 0.5 FTE. Horizon: 3 years.",
    "question": "Choose and justify:",
    "options": [
      "B — the monthly invoice is lower",
      "A — lower TCO; fits 0.5 FTE",
      "A — managed always beats self-run",
      "B — lower lock-in always wins"
    ],
    "answer": 1,
    "explanation": "Honest TCO includes the FTE line: B costs €711k over 3 years (€396k + €315k) and demands 3× the available staffing. A costs €648k and is feasible. Lock-in matters (exit costs = decoupling re-work + egress) but is priced into A's number, not a tiebreaker."
  },
  {
    "id": "QH7",
    "topic": "Migration types & repatriation",
    "scenario": "A latency-sensitive factory analytics workload was placed in a distant cloud region during a PoC (40 ms RTT to PLCs). The business asks what to do.",
    "question": "Which answer uses the correct migration type and strategy vocabulary?",
    "options": [
      "Cloud → on-premises; rehost on HCI",
      "On-prem → cloud; replatform",
      "Cloud → cloud; refactor",
      "Retain in cloud — latency is normal"
    ],
    "answer": 0,
    "explanation": "Direction: cloud → on-premises (repatriation). Strategy: rehost — move as-is to on-premises hyperconverged infrastructure. The exam tests exactly this directional + strategic vocabulary (CV0-004 2.3 migration types)."
  }
];

const GLOSSARY = [
  {
    "term": "Rehost",
    "def": "Move a workload to the cloud as-is ('lift-and-shift') — fastest path, minimal change, carries legacy constraints along."
  },
  {
    "term": "Replatform",
    "def": "Move with small optimizations (e.g., swap the DB engine for a provider-managed service) without redesigning the app ('lift-tinker-shift')."
  },
  {
    "term": "Re-architect",
    "def": "Redesign the application architecture (e.g., monolith → microservices/serverless) to unlock cloud-native capabilities."
  },
  {
    "term": "Refactor",
    "def": "CompTIA usage: 'rip and replace' — a complete in-house rewrite of the codebase for the cloud platform. (Close cousin of Re-architect; the lab splits them crisply.)"
  },
  {
    "term": "Retain",
    "def": "Keep the workload where it is (usually on-prem) and revisit later — right answer when cost, licensing or latency outweigh migration benefit."
  },
  {
    "term": "Retire",
    "def": "Decommission instead of migrating — often paired with a SaaS replacement (industry '7 Rs' calls that part repurchase)."
  },
  {
    "term": "Repatriation",
    "def": "A cloud → on-premises migration, typically for latency, cost or control reasons (one of the three 2.3 migration types)."
  },
  {
    "term": "Migration wave",
    "def": "A risk-graded batch of workloads that migrates together; waves are sequenced so each de-risks the next."
  },
  {
    "term": "Dependency mapping",
    "def": "Discovering and documenting what calls what (IPs, DNS names, firewalls, relays) so nothing breaks silently mid-move."
  },
  {
    "term": "Cutover",
    "def": "The controlled switch of production traffic from source to target — the point of no return if done without safeguards."
  },
  {
    "term": "Freeze window",
    "def": "An approved change-stop during which no writes/changes land, so final sync can converge and cutover is safe."
  },
  {
    "term": "Delta sync",
    "def": "Final incremental catch-up copy of changes accumulated since the seed transfer, run right before the switch."
  },
  {
    "term": "Checksum (SHA-256)",
    "def": "A cryptographic fingerprint of data; comparing source vs copy proves integrity — a mismatch means divergence."
  },
  {
    "term": "DNS TTL",
    "def": "How long resolvers may cache a DNS record. Lowering it (≤300 s) ~24 h before cutover makes the switch fast and reversible."
  },
  {
    "term": "RTO / RPO",
    "def": "Recovery Time Objective (max acceptable downtime) / Recovery Point Objective (max acceptable data loss) — they quantify rollback feasibility."
  },
  {
    "term": "Vendor lock-in",
    "def": "Dependency on one provider's services that raises the cost/effort of leaving; managed services add convenience and coupling."
  },
  {
    "term": "Data sovereignty",
    "def": "Data subject to the laws of the country/region where it resides — drives EU-residency constraints in this lab."
  },
  {
    "term": "BYOL",
    "def": "Bring Your Own License — reusing existing licenses in the cloud; some license classes (host-based) may not be mobile at all."
  },
  {
    "term": "Rightsizing",
    "def": "Matching target instance size to actual utilization — the antidote to lifting over-provisioned (and over-priced) VMs."
  },
  {
    "term": "Transfer appliance",
    "def": "A sealed, shippable storage device used to seed bulk data offline, followed by online delta sync."
  }
];

const EVIDENCE_DOCS = [
  {
    "id": "ASSESS-2026",
    "title": "Infrastructure Assessment 2026",
    "type": "Discovery report",
    "meta": "RDM-DC1 · generated 2026-09 · CONFIDENTIAL (training data)",
    "body": [
      "## Summary",
      "Full discovery of RDM-DC1 (Rotterdam). 12 in-scope workloads identified for the EuroCloud migration programme 'HELVETICA'. Datacenter exit driver: aging UPS + cooling plant, rising power cost, lease end 2027.",
      "## Key figures",
      "| Total data | 32.0 TB across 12 workloads |",
      "| WAN headlink to EuroCloud | 250 Mbps (dedicated direct connection) + site-to-site VPN |",
      "| Average virtualization fit | 78 % of VMs over-provisioned by 4× or more |",
      "| Aging | 3 workloads on unsupported OS; 1 vendor EOL application (CRM 7) |",
      "## Notes",
      "- WL-05 payment flow passes the on-prem payment gateway (PAYGATEWAY); its egress rule is pinned to the RDM-DC1 NAT address.",
      "- WL-06 report mail leaves via the on-prem SMTPRELAY (hardcoded).",
      "- Nightly batch job reaches WL-06 via fixed DNS name 'bi.internal'.",
      "- WL-08 runs on AtlantCloud since the 2025 PoC and must be repatriated (see repatriation ticket OPS-441).",
      "- WL-09 remains on AtlantCloud; egress billing applies to its exit."
    ]
  },
  {
    "id": "DEPMAP",
    "title": "Dependency Map — application flows",
    "type": "Network/dependency trace",
    "meta": "4-week passive trace + CMDB cross-check · training data",
    "body": [
      "## Flows discovered (in-scope)",
      "| WL-12 | → | WL-05 | AS2 gateway calls shop order API — HARDCODED IP 10.20.5.31 (partner-visible) |",
      "| WL-05 | → | PAYGATEWAY | payment authorization — egress firewall rule pinned to on-prem NAT 85.14.203.9 |",
      "| WL-06 | → | SMTPRELAY | report delivery — hardcoded relay host 'smtp.rdm.local' |",
      "| BATCH | → | WL-06 | nightly extract via fixed DNS 'bi.internal' |",
      "| WL-10 | → | WL-06 | shared test dataset mount (non-prod) |",
      "| WL-01 | → | WL-04 | nightly card-status read (WL-04 is retained on-prem) |",
      "| WL-02 | — | none | standalone file shares |",
      "## Wave implications",
      "- WL-12 must cut over in the SAME wave as WL-05 and AFTER it, with 40 partner firewall rule updates booked in the EDI partner maintenance slot.",
      "- Anything calling on-prem endpoints (PAYGATEWAY, SMTPRELAY, bi.internal) needs re-pointing or co-migration planning."
    ]
  },
  {
    "id": "BW-TEST",
    "title": "Bandwidth & Contention Test Report",
    "type": "Pilot measurement",
    "meta": "Wave-0 pilot · 5-day run · training data",
    "body": [
      "## Headline vs reality",
      "| Contracted direct connection | 250 Mbps |",
      "| Measured single-stream (pilot, alone) | 236–248 Mbps |",
      "| Measured per-stream with 5 concurrent migration streams | 24–27 Mbps (~25 Mbps) |",
      "## Implication for WL-02 (14 TB)",
      "At an effective 25 Mbps per stream under contention, 14 TB ≈ 52 days — far beyond the 30-day datacenter-exit window. At the headline 250 Mbps it would be ≈ 5 days.",
      "Formula used: time = size × 8 ÷ bandwidth. (14 TB × 8 = 112 Tb; ÷ 25 Mbps = 4,480,000 s ≈ 52 days.)",
      "## Recommendation",
      "Seed the cold bulk (≈ 11.5 TB, 82 %) via OFFLINE TRANSFER APPLIANCE; keep online replication for the hot 2.5 TB with delta sync at cutover."
    ]
  },
  {
    "id": "LIC-INV",
    "title": "Licensing Inventory & Mobility Notice",
    "type": "License register + vendor notice",
    "meta": "Fleet licensing office · training data",
    "body": [
      "| WL-04 | Oracle RAC — HOST-BASED licenses pinned to physical cores | Vendor mobility to cloud NOT permitted for this license class (notice 2026-08, explicit) |",
      "| WL-06 | SQL Server — PER-CORE | Cloud per-core spend would ~3×; provider-managed DB is license-included |",
      "| WL-05/WL-10 | OS: standard | Cloud license-included pricing OK |",
      "| WL-03 | CRM 7 | Vendor END-OF-SUPPORT reached; SaaS replacement contracted |",
      "| WL-09 | AtlantCloud egress | $0.08/GB class egress applies at exit |",
      "## Consequence",
      "WL-04 cannot migrate with its current licenses → retain on-premises (revisit at next contract cycle). WL-06 should replatform its database to the managed service."
    ]
  },
  {
    "id": "COMP-REG",
    "title": "Compliance Register — migration-relevant entries",
    "type": "Compliance register extract",
    "meta": "DPO + PCI ISSO sign-off pending · training data",
    "body": [
      "| WL-04 | PCI DSS scope | Cardholder data environment — segmentation + controls required in ANY landing zone |",
      "| WL-05 | PCI scope (payments flow) | Cloud VPC must remain in PCI-scoped, segmented segment |",
      "| WL-11 | Litigation hold ACTIVE | Retention chain + audit trail must be preserved; LEGAL SIGN-OFF REQUIRED before any move or deletion |",
      "| ALL | GDPR — EU data residency | Customer PII must remain in EU regions (eu-west-1 / eu-central-1). Staging in non-EU regions is a violation |",
      "| WL-08 | None | Internal telemetry only |"
    ]
  },
  {
    "id": "TCO-PROP",
    "title": "TCO Snapshot & Proposals A/B",
    "type": "Finance paper",
    "meta": "3-year horizon, EUR · training data",
    "body": [
      "## Proposal A — managed services platform",
      "€18,000 / month all-in (managed containers, managed DB, archive service). Minimal ops burden (~0.2 FTE). Higher exit cost (service coupling + egress).",
      "3-year TCO: €18,000 × 36 = €648,000.",
      "## Proposal B — self-managed IaaS",
      "€11,000 / month infrastructure + 1.5 FTE operations (€70k/FTE·year). Lower exit cost. 3-year TCO: €396,000 + €315,000 = €711,000.",
      "## Constraint reminder",
      "Platform team has only 0.5 FTE available for cloud operations (hiring freeze)."
    ]
  },
  {
    "id": "POLICY",
    "title": "Change & Cutover Policy",
    "type": "Governance policy",
    "meta": "CAB-approved v4.1 · training data",
    "body": [
      "## Change freeze windows",
      "Standard freeze: Sat 22:00 – Sun 06:00. No changes outside approved windows for Tier-1 services.",
      "## DNS",
      "Public DNS TTL currently 86400 s. Cutover plans MUST lower TTL to ≤ 300 s at least 24 h in advance.",
      "## Recovery targets",
      "Tier-1 (revenue): RTO 15 min, RPO 5 min. Tier-2: RTO 4 h, RPO 1 h. Tier-3: RTO 24 h, RPO 24 h.",
      "## External slots",
      "EDI partner firewall maintenance is available SUNDAYS 02:00–14:00 only (40 partners).",
      "## Rollback",
      "Every Tier-1 cutover carries quantified rollback triggers, a designated first action, and a rollback window of 14 days of hypercare before source decommissioning."
    ]
  },
  {
    "id": "CKSUM",
    "title": "Checksum Manifest (transfer integrity)",
    "type": "Integrity manifest",
    "meta": "SHA-256 per disk image · training data",
    "body": [
      "| webshop-diskA.vmdk | expected 9f2a…c41d | computed 9f2a…c41d | MATCH |",
      "| webshop-diskB.vmdk | expected 77b1…9e02 | computed 77b1…9e02 | MATCH |",
      "| webshop-diskC.vmdk | expected 5d83…12fa | computed 5d83…12fa | MATCH |",
      "| webshop-diskD.vmdk | expected a3e7…b5c9 | computed f01c…7d22 | MISMATCH |",
      "| devtest-* (37 disks) | — | — | MATCH |",
      "| filer-seed.img (appliance) | — | — | MATCH |",
      "Manifest is compared automatically by the Radar integrity sweep. A mismatch means the copy diverged — typically delta sync overlapping active writes."
    ]
  },
  {
    "id": "PERF-BASE",
    "title": "Performance Baselines (pre-migration)",
    "type": "Measurement baseline",
    "meta": "30-day average before migration · training data",
    "body": [
      "| WL-05 | p95 API latency 210 ms | 1,400 orders/min peak |",
      "| WL-10 | p95 job runtime 96 s | 37 VMs, 6 % avg CPU |",
      "| WL-02 | file open p95 45 ms (hot tier) | cold tier N/A |",
      "| WL-06 | report render p95 3.1 s | — |",
      "Post-migration comparison uses the same probes. p95 > 2× baseline for 30 min is a rollback trigger (policy POLICY)."
    ]
  },
  {
    "id": "ARCHIVE-2019",
    "title": "Migration Assessment (2019 draft, superseded)",
    "type": "Obsolete draft",
    "meta": "Found in network share /archive/drafts · training data",
    "redHerring": true,
    "body": [
      "## WARNING: OUTDATED",
      "This 2019 draft predates the current estate. It references 'Project ATLAS', a different datacenter (AMS-DC2), 5 workloads that have since been decommissioned, and a 2019 lease that has been renewed twice.",
      "It claims 'the datacenter has 5 years left' — true in 2019, false now.",
      "Do NOT use for planning. Retained for records only."
    ]
  },
  {
    "id": "PRINT-QUOTE",
    "title": "Facilities — Print Fleet Refresh Quote",
    "type": "Facilities quote",
    "meta": "Vendor quote Q3 · training data",
    "redHerring": true,
    "body": [
      "## Out of scope",
      "Quote for refreshing 14 office printers across Rotterdam and Frankfurt offices, including toner contracts and maintenance.",
      "Not related to the workload migration programme. Included in the shared drive by accident."
    ]
  }
];

const MEDIUM_OBJECTIVE_DATA = [
  {
    "id": "OBJ-M1",
    "pillar": "P1",
    "title": "Match the six CompTIA migration strategies",
    "instruction": "Open the Flight Plan for each of these six workloads and assign its migration strategy: WL-01, WL-03, WL-04, WL-05, WL-06, WL-07. Read each workload's story — the correct strategy follows from what the business actually decided.",
    "anchor": "CV0-004 2.3 — Application migration strategies (Rehost, Replatform, Re-architect, Retain, Retire, Refactor)",
    "where": "Flight Plan → select each workload → Strategy",
    "hints": [
      {
        "level": 1,
        "text": "One per strategy: elasticity redesign, vendor end-of-life, licenses that cannot move, commodity as-is move, per-core license fix via managed service, and an in-house rewrite."
      },
      {
        "level": 2,
        "text": "WL-05 = Rehost · WL-06 = Replatform · WL-04 = Retain · WL-03 = Retire · WL-01 = Re-architect · WL-07 = Refactor."
      },
      {
        "level": 3,
        "text": "Set exactly those values in the Flight Plan for each workload. Definitions are in the Learn tab."
      }
    ],
    "feedback": "These six names are the exact vocabulary of objective 2.3 — exam questions describe a scenario and expect the matching term. Next: notice WHY each scenario forces its term (licensing, EOL, elasticity, cost)."
  },
  {
    "id": "OBJ-M2",
    "pillar": "P1",
    "title": "Classify the three migration routes",
    "instruction": "Three workloads travel unusual routes. In their Flight Plans, set the Migration route: WL-08 (runs in a distant cloud region, factory needs it local), WL-09 (trapped on AtlantCloud, the provider being exited), and WL-02 (runs in RDM-DC1).",
    "anchor": "CV0-004 2.3 — Migration types (on-premises→cloud, cloud→on-premises, cloud-to-cloud)",
    "where": "Flight Plan → WL-08 / WL-09 / WL-02 → Migration route",
    "hints": [
      {
        "level": 1,
        "text": "One of each: a repatriation back on-premises, a move between two providers, and a classic datacenter exit."
      },
      {
        "level": 2,
        "text": "WL-08 = Cloud → on-premises · WL-09 = Cloud → cloud · WL-02 = On-premises → cloud."
      },
      {
        "level": 3,
        "text": "Set those three routes in the Flight Plans."
      }
    ],
    "feedback": "Cloud→on-premises (repatriation) and cloud-to-cloud are on the exam just as much as the classic datacenter exit. WL-09 also shows WHY cloud-to-cloud happens: exit fees and duplicated management planes (a 'vendor lock-in' and 'management overhead' consideration)."
  },
  {
    "id": "OBJ-M3",
    "pillar": "P2",
    "title": "Read the dependency map",
    "instruction": "Open Evidence → DEPMAP. Answer three questions below (they appear once you've read the map): which workload must move in the same wave as WL-05, what dependency type binds them, and what must be booked with the EDI partners.",
    "anchor": "CV0-004 2.3 — Networking consideration + [lesson extension] dependency mapping",
    "where": "Evidence → DEPMAP, then answer here in Objectives",
    "hints": [
      {
        "level": 1,
        "text": "The map shows WL-12 calling WL-05 over a hardcoded IP, and 40 partner firewalls pinning WL-12's address."
      },
      {
        "level": 2,
        "text": "Same wave: WL-12. Binding: hardcoded IP firewall rule. Book: firewall rule updates in the partner maintenance window."
      },
      {
        "level": 3,
        "text": "Select exactly: Q1 = WL-12, Q2 = 'Hardcoded IP firewall rule', Q3 = 'Firewall rule updates for new IP ranges'."
      }
    ],
    "feedback": "Hardcoded IPs and pinned firewall rules are the classic networking consideration of 2.3. A dependency map turns 'it should work' into a sequenced, co-scheduled cutover."
  },
  {
    "id": "OBJ-M4",
    "pillar": "P2",
    "title": "Run the bandwidth math",
    "instruction": "Evidence → BW-TEST: the 250 Mbps link degrades to ~25 Mbps per stream under contention. Compute how many DAYS the 14 TB of WL-02 needs at 25 Mbps (whole days, e.g. '52'), then choose the correct conclusion below.",
    "anchor": "CV0-004 2.3 — Storage consideration + [lesson extension] bandwidth/transfer planning",
    "where": "Evidence → BW-TEST, then answer here in Objectives",
    "hints": [
      {
        "level": 1,
        "text": "time = size × 8 ÷ bandwidth. Work in bits: 14 TB = 112 Tb."
      },
      {
        "level": 2,
        "text": "112 Tb ÷ 25 Mbps = 4,480,000 seconds ≈ 51.9 days. The window is 30 days — online transfer fails."
      },
      {
        "level": 3,
        "text": "Answer 52 and pick 'offline appliance for the cold bulk + delta sync for hot data'."
      }
    ],
    "feedback": "This is the storage consideration in action: tiering (cold 82 %) plus a bandwidth reality check decides the transfer method. Exam questions love exactly this arithmetic pattern."
  },
  {
    "id": "OBJ-M5",
    "pillar": "P4",
    "title": "Assign transfer methods",
    "instruction": "In the Flight Plan, set the Transfer method for: WL-02 (14 TB bulk, thin WAN), WL-05 (predictable bandwidth needed for a tight cutover), WL-10 (37 small VMs, idle nights, shared link), WL-03 (moving to SaaS).",
    "anchor": "CV0-004 2.3 — [lesson extension] transfer methods (appliance, V2V direct/VPN, gateway, SaaS cutover)",
    "where": "Flight Plan → each workload → Transfer method",
    "hints": [
      {
        "level": 1,
        "text": "Match constraint to method: too much data → ship it; revenue-critical timing → dedicated link; non-prod bulk → shared VPN; SaaS → export/import."
      },
      {
        "level": 2,
        "text": "WL-02 = appliance · WL-05 = V2V direct · WL-10 = V2V VPN · WL-03 = SaaS cutover."
      },
      {
        "level": 3,
        "text": "Set exactly those four in the Flight Plans."
      }
    ],
    "feedback": "Transfer method selection is a planning decision with real cost/time consequences — the same lesson the BW-TEST report teaches numerically."
  },
  {
    "id": "OBJ-M6",
    "pillar": "P4",
    "title": "Right-size the landing zone",
    "instruction": "Three Flight Plans have a Resource allocation question: WL-05 (8 % CPU on 16 vCPU monsters), WL-10 (6 % utilization fleet), WL-01 (spiky public traffic). Pick the allocation that fits the utilisation data and the story.",
    "anchor": "CV0-004 2.3 — Resource allocation + Compute consideration",
    "where": "Flight Plan → WL-05 / WL-10 / WL-01 → Resource allocation",
    "hints": [
      {
        "level": 1,
        "text": "8 % CPU means you are paying for air. Spiky public traffic wants autoscaling, not a bigger fixed box."
      },
      {
        "level": 2,
        "text": "WL-05 = right-sized 3 × 4 vCPU/16 GB with autoscale headroom · WL-10 = right-size + scheduled shutdown · WL-01 = managed containers with autoscaling."
      },
      {
        "level": 3,
        "text": "Select exactly those three options in the Flight Plans."
      }
    ],
    "feedback": "Lifting oversized VMs as-is is the most common cloud-cost self-inflicted wound. Allocation decisions belong in the migration plan, not in a post-migration apology."
  },
  {
    "id": "OBJ-M7",
    "pillar": "P3",
    "title": "Detect the migration blockers",
    "instruction": "Read LIC-INV and COMP-REG in the Evidence Locker. From the checklist below (in the Objectives panel), tick every workload with a genuine blocker or mandatory gate — leave the clean ones unticked.",
    "anchor": "CV0-004 2.3 — Regulatory + Compliance + Cost considerations",
    "where": "Evidence → LIC-INV and COMP-REG, then answer here in Objectives",
    "hints": [
      {
        "level": 1,
        "text": "One license cannot move at all; one license class gets triple-expensive; one workload needs legal sign-off. The rest are clean."
      },
      {
        "level": 2,
        "text": "Blockers: WL-04 (license mobility denied), WL-06 (per-core cost spike), WL-11 (litigation hold → legal gate)."
      },
      {
        "level": 3,
        "text": "Tick exactly WL-04, WL-06, WL-11."
      }
    ],
    "feedback": "Compliance gates discovered late stop migrations cold. 'Regulatory' and 'compliance' are separate bullets in 2.3: the hold is regulatory/retention, the PCI scope and license terms are compliance/cost."
  },
  {
    "id": "OBJ-M8",
    "pillar": "P3",
    "title": "Validate the arrivals",
    "instruction": "In Radar, run the Integrity sweep and the Performance comparison for the arrived workloads. Findings will appear — set a disposition for each WL-05 finding (one checksum mismatch, one latency regression).",
    "anchor": "CV0-004 2.3 — [lesson extension] validation: checksums + performance baselines",
    "where": "Radar → Run integrity sweep → Run performance comparison → set dispositions",
    "hints": [
      {
        "level": 1,
        "text": "A checksum mismatch means the copy diverged — never 'accept'. A 3× latency regression traced to a co-migrated dependency is fixable forward."
      },
      {
        "level": 2,
        "text": "Both WL-05 findings → 'Re-sync data & re-verify' (then re-run)."
      },
      {
        "level": 3,
        "text": "Set both dispositions to resync and re-run the sweeps."
      }
    ],
    "feedback": "Checksums prove the bits arrived; baselines prove the experience survived. Both are exam-favourite 'given a scenario' setups — and both are your exit criteria before cutover sign-off."
  },
  {
    "id": "OBJ-M9",
    "pillar": "P4",
    "title": "Sequence the cutover runbook",
    "instruction": "In Clearance → Cutover, order the eight steps (use ↑/↓), set the DNS TTL to the policy value, then submit. POLICY in the Evidence Locker has the TTL standard.",
    "anchor": "CV0-004 2.3 — [lesson extension] cutover: freeze → sync → verify → switch → smoke test",
    "where": "Clearance → Cutover runbook (order + TTL field)",
    "hints": [
      {
        "level": 1,
        "text": "Announce before you sync, sync before you freeze, freeze before you verify, verify before you switch, test after switching."
      },
      {
        "level": 2,
        "text": "S1 → S8 in the listed order works; TTL = 300 s (policy requires ≤ 300 s, 24 h ahead)."
      },
      {
        "level": 3,
        "text": "Exact order: S1,S2,S3,S4,S5,S6,S7,S8. TTL 300."
      }
    ],
    "feedback": "The eight steps encode the safe pattern: converge data while the source is still live, then freeze, verify, switch, prove, and watch. Miss the verify step and you switch traffic onto divergent data."
  },
  {
    "id": "OBJ-M10",
    "pillar": "P4",
    "title": "Arm the rollback triggers",
    "instruction": "In Clearance → Rollback: tick the three quantified triggers that justify a rollback (leave opinion-based and unrelated ones unticked) and select the correct first rollback action.",
    "anchor": "CV0-004 2.3 — [lesson extension] rollback planning, RTO/RPO discipline",
    "where": "Clearance → Rollback triggers + first action",
    "hints": [
      {
        "level": 1,
        "text": "A trigger must be measurable and pre-agreed. 'Feels slow' is not a trigger; a cost dashboard is not an availability trigger."
      },
      {
        "level": 2,
        "text": "Triggers: checkout error rate, p95 > 2× baseline, conversion drop. First action: flip DNS/LB back (TTL is already 300 s)."
      },
      {
        "level": 3,
        "text": "Tick T1, T2, T3; first action = A."
      }
    ],
    "feedback": "Rollback planning is mitigation for the migration itself. Pre-agreed triggers remove the mid-incident debate about whether things are 'bad enough' — the threshold decides, not the loudest voice."
  },
  {
    "id": "OBJ-M11",
    "pillar": "P4",
    "title": "Sequence the migration waves",
    "instruction": "In Clearance → Wave board, order the five wave groups: pilot first, dependency pairs together, re-architecture last. Submit the order.",
    "anchor": "CV0-004 2.3 — [lesson extension] wave sequencing (risk-graded rollout)",
    "where": "Clearance → Wave board (↑/↓ then Submit)",
    "hints": [
      {
        "level": 1,
        "text": "Prove the pipeline on non-prod, then revenue-critical pairs, then bulk, then data services, and let the rebuild land last."
      },
      {
        "level": 2,
        "text": "Pilot (dev/test) → commerce (WL-05+WL-12) → filer bulk → BI+archive → TrackTrace re-architecture."
      },
      {
        "level": 3,
        "text": "Order: W1, W2, W3, W4, W5."
      }
    ],
    "feedback": "Wave planning is where dependency mapping (M3) becomes an executable schedule. On the exam, 'what should migrate first?' questions are answered with risk and dependency logic, not alphabetically."
  },
  {
    "id": "OBJ-M12",
    "pillar": "P4",
    "title": "Close out the migration",
    "instruction": "Execute the cutover simulation in Clearance, then tick the required post-migration tasks below (in Objectives). Careful: two 'obvious' tasks are actually wrong.",
    "anchor": "CV0-004 2.3 — [lesson extension] post-migration hygiene; 3.4 decommissioning",
    "where": "Clearance → 'Begin live cutover (simulation)', then tick tasks here",
    "hints": [
      {
        "level": 1,
        "text": "Keep the rollback window means keeping source firewall rules; documentation must reflect reality; money must be reconciled."
      },
      {
        "level": 2,
        "text": "Tick: decommission after hypercare, update CMDB/runbooks, reconcile spend vs TCO, schedule day-30 rightsizing."
      },
      {
        "level": 3,
        "text": "Tick the first four; leave 'delete baselines' and 'close all on-prem rules at cutover' unticked."
      }
    ],
    "feedback": "The migration isn't done at 'traffic moved'. Hygiene items (CMDB, runbooks, decommission lists, cost reconciliation) are what CompTIA frames as lifecycle management (3.4) — and what auditors ask about first."
  }
];

const HARD_OBJECTIVE_DATA = [
  {
    "id": "OBJ-H1",
    "pillar": "P2",
    "title": "Triage the assessment package",
    "instruction": "The Evidence Locker holds 11 documents; two are planted noise. Identify the THREE documents that materially change the migration plan, and record the required plan change for each. Answer in Evidence → Triage verdict.",
    "anchor": "CV0-004 2.3 — Storage/licensing/compliance considerations vs. noise",
    "where": "Evidence → read all docs → Triage verdict card",
    "hints": [
      {
        "level": 1,
        "text": "One document invalidates the online-transfer plan, one locks a workload in place, one freezes a workload behind legal."
      },
      {
        "level": 2,
        "text": "BW-TEST (→ appliance for WL-02 bulk), LIC-INV (→ WL-04 retained, WL-06 replatform), COMP-REG (→ WL-11 legal gate)."
      },
      {
        "level": 3,
        "text": "Select exactly BW-TEST, LIC-INV, COMP-REG and match each to its required change (option 2 in each dropdown)."
      }
    ],
    "feedback": "Real assessment packages contain obsolete drafts and irrelevant docs. Triage — deciding what changes the plan — is the first hour of any migration engagement."
  },
  {
    "id": "OBJ-H2",
    "pillar": "P1",
    "title": "Full strategy board — all 12 workloads",
    "instruction": "Assign the exact CompTIA strategy to ALL 12 workloads in their Flight Plans. Strict: Re-architect (architecture redesign, WL-01) and Refactor (in-house rip-and-replace rewrite, WL-07) must not be swapped.",
    "anchor": "CV0-004 2.3 — all six application migration strategies across the estate",
    "where": "Flight Plan → every workload → Strategy",
    "hints": [
      {
        "level": 1,
        "text": "Count check: 5 Rehost · 2 Replatform · 1 Re-architect · 1 Refactor · 1 Retain · 1 Retire (WL-02, WL-05, WL-09, WL-10, WL-12 = rehost)."
      },
      {
        "level": 2,
        "text": "WL-01 rearchitect · WL-02 rehost · WL-03 retire · WL-04 retain · WL-05 rehost · WL-06 replatform · WL-07 refactor · WL-08 rehost · WL-09 rehost · WL-10 rehost · WL-11 replatform · WL-12 rehost."
      },
      {
        "level": 3,
        "text": "Set exactly that mapping in the 12 Flight Plans."
      }
    ],
    "feedback": "The six strategies are not vibes — each maps to concrete evidence (licensing, EOL, elasticity, platform availability). This board is your two-second-recall training for scenario questions."
  },
  {
    "id": "OBJ-H3",
    "pillar": "P4",
    "title": "Engineer the transfer schedule",
    "instruction": "Wave-2 moves WL-05 (3.2 TB), WL-12 (0.8 TB), WL-06 (1.1 TB) over the single 250 Mbps direct connection. In Clearance → Transfer scheduling: pick the allocation strategy, give TOTAL hours to move all three (one decimal), and name the first workload.",
    "anchor": "CV0-004 2.3 — [lesson extension] transfer planning + bandwidth contention",
    "where": "Clearance → Transfer scheduling card",
    "hints": [
      {
        "level": 1,
        "text": "Splitting bandwidth three ways makes everything finish when the LAST stream finishes. Serial dedication finishes when the SUM finishes — which is smaller here?"
      },
      {
        "level": 2,
        "text": "Serial at full 250 Mbps: 28.4 + 7.1 + 9.8 = 45.3 h. Parallel-equal (83.3 Mbps each) finishes at 85.3 h. Start with the revenue-critical stream."
      },
      {
        "level": 3,
        "text": "Plan = serial-by-priority · total = 45.3 (±1) · first = WL-05."
      }
    ],
    "feedback": "Bandwidth contention is the hidden schedule-killer of every datacenter exit. Serial dedication of the pipe by business priority is usually the fastest total plan — the math, not intuition, decides."
  },
  {
    "id": "OBJ-H4",
    "pillar": "P3",
    "title": "Audit the dependency breakage",
    "instruction": "From DEPMAP + ASSESS-2026: in Clearance → Dependency audit, tick ALL dependencies that BREAK under lift-and-shift (four are planted), and choose the correct remediation for each. Distractors are dependencies that survive or are explicitly out of scope.",
    "anchor": "CV0-004 2.3 — Networking consideration; hardcoded endpoints, NAT pinning, DNS",
    "where": "Clearance → Dependency audit card",
    "hints": [
      {
        "level": 1,
        "text": "Look for: hardcoded IPs, pinned NAT/egress rules, hardcoded relay hosts, fixed DNS names. Shared mounts that move together survive."
      },
      {
        "level": 2,
        "text": "Break: D1 (WL-12→WL-05 IP), D2 (payment NAT rule), D3 (SMTP relay), D4 (bi.internal DNS). D5 moves with both ends; D6 has no dependency; D7 stays put with WL-04."
      },
      {
        "level": 3,
        "text": "Tick D1–D4; remediation = option 1 in each dropdown."
      }
    ],
    "feedback": "Lift-and-shift doesn't lift the assumptions: hardcoded IPs, pinned NAT rules, relay hosts and fixed DNS names all break silently. The audit converts them into scheduled work items."
  },
  {
    "id": "OBJ-H5",
    "pillar": "P4",
    "title": "Cutover plan under real constraints",
    "instruction": "In Clearance → Cutover: sequence all 8 steps exactly, set TTL to policy value, set the freeze window per POLICY, and pick the cutover day that satisfies BOTH the freeze window and the EDI partner maintenance slot.",
    "anchor": "CV0-004 2.3 — [lesson extension] cutover planning; freeze windows, DNS TTL, external slots",
    "where": "Clearance → Cutover runbook + config fields",
    "hints": [
      {
        "level": 1,
        "text": "The EDI slot exists only on Sunday mornings; the standard freeze covers Sat 22:00–Sun 06:00. Find the overlap."
      },
      {
        "level": 2,
        "text": "Order S1→S8 · TTL 300 · freeze 'Sat 22:00 – Sun 06:00' · day Sunday (02:00–06:00 overlaps both windows)."
      },
      {
        "level": 3,
        "text": "Set exactly: seq S1…S8, TTL 300, freeze = option 2, day = Sunday."
      }
    ],
    "feedback": "Cutover planning is constraint algebra: policy ∩ partner availability ∩ replication lag. Writing it down beforehand is what makes the night boring — which is the goal."
  },
  {
    "id": "OBJ-H6",
    "pillar": "P3",
    "title": "Root-cause the validation failure",
    "instruction": "Radar shows WL-05 disk D checksum mismatch + 3× p95 latency. In Clearance → Validation verdict: pick the root cause, then order the four corrective actions exactly.",
    "anchor": "CV0-004 2.3 — [lesson extension] validation + root-cause discipline (cf. 6.1 troubleshooting)",
    "where": "Radar (run sweeps) → Clearance → Validation verdict card",
    "hints": [
      {
        "level": 1,
        "text": "The manifest note says divergence happens when delta sync overlaps active writes. Which process step was skipped?"
      },
      {
        "level": 2,
        "text": "Cause: delta sync ran during active writes (freeze not enforced). Actions: stop/freeze writes → re-run delta sync → re-verify checksum → confirm performance."
      },
      {
        "level": 3,
        "text": "Cause = option about freeze not enforced; action order = the four in their listed logical sequence."
      }
    ],
    "feedback": "This is exam item DNA: symptom (checksum) → mechanism (sync vs writes) → skipped control (freeze) → ordered remediation. Root-cause before remediation, always."
  },
  {
    "id": "OBJ-H7",
    "pillar": "P4",
    "title": "Incident command during cutover",
    "instruction": "Execute the cutover in Clearance. The incident fires at 02:41: app tier throws DB connection storms (cached old IP). Decide fix-forward vs rollback, enter the Tier-1 RTO and RPO (minutes, from POLICY), and order the four response actions.",
    "anchor": "CV0-004 2.3 — [lesson extension] incident decisioning; 1.2 RTO/RPO; POLICY targets",
    "where": "Clearance → incident panel (after executing cutover)",
    "hints": [
      {
        "level": 1,
        "text": "Rollback re-exports divergence risk and burns the RTO; the fix is a config line + DNS flush. POLICY: Tier-1 RTO/RPO."
      },
      {
        "level": 2,
        "text": "Decision = fix forward · RTO 15 · RPO 5 · order: update connection config → flush DNS → verify pools → resume hypercare."
      },
      {
        "level": 3,
        "text": "Set decision 'fix forward', RTO 15, RPO 5, actions in the listed order."
      }
    ],
    "feedback": "Rollback is a mitigation, not a religion: when the rollback path is slower than the fix and would re-introduce data divergence, fix forward — inside the RTO, with ordered verification."
  },
  {
    "id": "OBJ-H8",
    "pillar": "P3",
    "title": "Audit the plan for compliance violations",
    "instruction": "A colleague's draft plan contains 7 statements; 4 violate LIC-INV / COMP-REG / POLICY. In Clearance → Compliance audit, tick exactly the 4 violations.",
    "anchor": "CV0-004 2.3 — Regulatory + Compliance considerations; license mobility; residency",
    "where": "Clearance → Compliance audit card",
    "hints": [
      {
        "level": 1,
        "text": "One license class may not move; one deletion jumps a legal gate; one region breaks residency; one VPC breaks PCI segmentation."
      },
      {
        "level": 2,
        "text": "V1 (Oracle mobility), V2 (pre-signoff deletion), V3 (US staging of EU PII), V4 (unsegmented PCI flow). The rest are good practice."
      },
      {
        "level": 3,
        "text": "Tick exactly V1, V2, V3, V4."
      }
    ],
    "feedback": "Compliance review of the PLAN (not the aftermath) is the cheap place to fail safely. Residency and segmentation violations discovered post-migration mean re-migration."
  },
  {
    "id": "OBJ-H9",
    "pillar": "P4",
    "title": "Decide the platform proposal",
    "instruction": "TCO-PROP holds Proposals A/B and a staffing constraint. In Clearance → TCO decision: pick the proposal the facts support, and tick the two genuine exit-cost (vendor lock-in) elements.",
    "anchor": "CV0-004 2.3 — Cost + Management overhead + Vendor lock-in considerations",
    "where": "Clearance → TCO decision card",
    "hints": [
      {
        "level": 1,
        "text": "Compute B honestly: €11k×36 + 1.5 FTE×€70k×3. Then check the team's actual capacity against B's staffing demand."
      },
      {
        "level": 2,
        "text": "A = €648k vs B = €711k, and B needs 1.5 FTE the team doesn't have. Lock-in = service coupling re-work + egress at scale."
      },
      {
        "level": 3,
        "text": "Proposal A · exit costs E1 + E2."
      }
    ],
    "feedback": "Cost, management overhead and vendor lock-in are three separate 2.3 bullets that collide in one decision. Honest TCO includes the FTE line and the exit line — not just the invoice."
  }
];

const MEDIUM_ANSWER_FIELDS = {
  "OBJ-M3": [
    {
      "key": "M3-WAVE",
      "label": "Q1 — Which workload must cut over in the same wave, immediately after WL-05?",
      "options": [
        "WL-02|WL-02 Filer-01",
        "WL-06|WL-06 Reporting BI",
        "WL-12|WL-12 EDI Gateway",
        "WL-01|WL-01 TrackTrace API"
      ]
    },
    {
      "key": "M3-TYPE",
      "label": "Q2 — What binds WL-12 to WL-05's cutover?",
      "options": [
        "shared|A shared database",
        "hardip|A hardcoded IP firewall rule",
        "dns|A pinned DNS record",
        "kafka|A Kafka topic"
      ]
    },
    {
      "key": "M3-BOOK",
      "label": "Q3 — What must be booked with the 40 EDI partners?",
      "options": [
        "firewall|Firewall rule updates for the new IP ranges",
        "certs|Re-issued AS2 certificates for every partner",
        "bandwidth|A temporary bandwidth upgrade",
        "press|A joint press release"
      ]
    }
  ],
  "OBJ-M4": [
    {
      "key": "M4-DAYS",
      "label": "Days needed for 14 TB at 25 Mbps (whole days):",
      "options": []
    },
    {
      "key": "M4-CHOICE",
      "label": "Conclusion:",
      "options": [
        "appliance|Offline appliance for cold bulk + delta sync for hot data",
        "online|Keep everything online — 25 Mbps is fine",
        "delay|Delay the datacenter exit by 3 months"
      ]
    }
  ],
  "OBJ-M7": [
    {
      "key": "M7-WL04",
      "label": "WL-04 PayCard DB — genuine blocker or mandatory gate",
      "options": []
    },
    {
      "key": "M7-WL05",
      "label": "WL-05 WebShop — genuine blocker or mandatory gate",
      "options": []
    },
    {
      "key": "M7-WL06",
      "label": "WL-06 Reporting BI — genuine blocker or mandatory gate",
      "options": []
    },
    {
      "key": "M7-WL09",
      "label": "WL-09 Marketing assets — genuine blocker or mandatory gate",
      "options": []
    },
    {
      "key": "M7-WL10",
      "label": "WL-10 Dev/Test estate — genuine blocker or mandatory gate",
      "options": []
    },
    {
      "key": "M7-WL11",
      "label": "WL-11 Mail Archive — genuine blocker or mandatory gate",
      "options": []
    }
  ],
  "OBJ-M12": [
    {
      "key": "M12-P1",
      "label": "Decommission source VMs after the 14-day hypercare window",
      "options": []
    },
    {
      "key": "M12-P2",
      "label": "Update CMDB, network diagrams and runbooks to the new reality",
      "options": []
    },
    {
      "key": "M12-P3",
      "label": "Reconcile actual cloud spend against the TCO model",
      "options": []
    },
    {
      "key": "M12-P4",
      "label": "Schedule a day-30 rightsizing review",
      "options": []
    },
    {
      "key": "M12-D1",
      "label": "Delete all performance baselines — they're pre-migration data",
      "options": []
    },
    {
      "key": "M12-D2",
      "label": "Close every on-prem firewall rule immediately at cutover",
      "options": []
    }
  ]
};

const CHECKBOX_FIELD_KEYS = ["M7-WL04","M7-WL05","M7-WL06","M7-WL09","M7-WL10","M7-WL11","M12-P1","M12-P2","M12-P3","M12-P4","M12-D1","M12-D2"];

const NAV = {
  "OBJ-M1": {
    "tab": "flight"
  },
  "OBJ-M2": {
    "tab": "flight"
  },
  "OBJ-M3": {
    "tab": "evidence"
  },
  "OBJ-M4": {
    "tab": "evidence"
  },
  "OBJ-M5": {
    "tab": "flight"
  },
  "OBJ-M6": {
    "tab": "flight"
  },
  "OBJ-M7": {
    "tab": "evidence"
  },
  "OBJ-M8": {
    "tab": "radar"
  },
  "OBJ-M9": {
    "tab": "clearance"
  },
  "OBJ-M10": {
    "tab": "clearance"
  },
  "OBJ-M11": {
    "tab": "clearance"
  },
  "OBJ-M12": {
    "tab": "clearance"
  },
  "OBJ-H1": {
    "tab": "evidence"
  },
  "OBJ-H2": {
    "tab": "flight"
  },
  "OBJ-H3": {
    "tab": "clearance"
  },
  "OBJ-H4": {
    "tab": "clearance"
  },
  "OBJ-H5": {
    "tab": "clearance"
  },
  "OBJ-H6": {
    "tab": "radar"
  },
  "OBJ-H7": {
    "tab": "clearance"
  },
  "OBJ-H8": {
    "tab": "clearance"
  },
  "OBJ-H9": {
    "tab": "clearance"
  }
};

const HARD_ANSWER_FIELDS = {
  "OBJ-H6": {
    "causes": [
      {
        "id": "disk",
        "label": "The cloud disk hardware is slower than on-prem"
      },
      {
        "id": "freeze",
        "label": "Delta sync ran during active writes — the freeze step was not enforced"
      },
      {
        "id": "driver",
        "label": "The transfer appliance driver corrupted the image"
      },
      {
        "id": "baseline",
        "label": "The pre-migration baseline was measured wrong"
      },
      {
        "id": "cosmic",
        "label": "A random in-transit bit error — accept the copy"
      }
    ],
    "actions": [
      {
        "id": "H6A1",
        "label": "Stop/freeze writes at the source"
      },
      {
        "id": "H6A2",
        "label": "Re-run the delta sync"
      },
      {
        "id": "H6A3",
        "label": "Re-verify checksums against the manifest"
      },
      {
        "id": "H6A4",
        "label": "Confirm performance vs baseline"
      }
    ],
    "correctOrder": [
      "H6A1",
      "H6A2",
      "H6A3",
      "H6A4"
    ]
  }
};

// Convenience maps (same as the original module-level exports)
const WORKLOAD_MAP = Object.fromEntries(WORKLOADS.map((w) => [w.id, w]));
const EVIDENCE_MAP = Object.fromEntries(EVIDENCE_DOCS.map((d) => [d.id, d]));
