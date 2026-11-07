/* =========================================================================
   The Engagement Desk — static port (js/data.js)
   -------------------------------------------------------------------------
   ALL lab content, separated from all logic (SC-D7). Every string, key,
   hint and answer is carried over 1:1 from the original framework lab:
     src/lib/lab/content.ts      → PILLARS, MODELS, LADDER, GLOSSARY
     src/lib/lab/evidence.ts     → CLIENT, DOCS, boards, cases, plans…
     src/lib/lab/instruments.ts  → TENANCY_QS … SERVICE_QS, CLASSIFY_CASES
     src/lib/lab/objectives.ts   → OBJECTIVES (definitions only; keys live in
                                   js/objectives.js so data stays data)
     src/lib/lab/quiz.ts         → QUIZ_MEDIUM / QUIZ_HARD
     src/components/lab/*        → labels, stage meta, debrief copy, focus maps
   All evidence is TRAINING DATA — SYNTHETIC (fictional orgs, people, figures).
   ========================================================================= */

window.LabData = (function () {
  "use strict";

  // ---------- The four mastery pillars (family-adapted wording) ----------
  const PILLARS = [
    { id: "P1", label: "Understand", blurb: "What each model is, how it works, why businesses pick it." },
    { id: "P2", label: "Recognize / Analyze", blurb: "Spot the model hiding inside realistic client evidence." },
    { id: "P3", label: "Detect signals", blurb: "Find binding constraints and model-fit signals in noisy requirements." },
    { id: "P4", label: "Recommend & mitigate", blurb: "Select, justify, and control the residual risks of a model." },
  ];

  const PILLAR_LABEL = { P1: "Understand", P2: "Recognize / Analyze", P3: "Detect signals", P4: "Recommend & mitigate" };

  // ---------- Labels / stage meta ----------
  const MODEL_LABELS = { public: "Public", private: "Private", hybrid: "Hybrid", multi: "Multi-cloud", community: "Community" };

  const STAGE_ORDER = ["briefing", "compendium", "desk", "review", "debrief"];
  const STAGE_META = {
    briefing: { label: "Briefing Room", blurb: "The engagement, the client, the mission" },
    compendium: { label: "Model Compendium", blurb: "The five models, the ladder, the vocabulary" },
    desk: { label: "Engagement Desk", blurb: "Evidence, instruments, objectives" },
    review: { label: "Competency Review", blurb: "Knowledge check" },
    debrief: { label: "Debrief & Field Notes", blurb: "Signals, controls, takeaways" },
  };

  // ---------- Client + mode select copy ----------
  const CLIENT = {
    name: "NorthPeak Outfitters",
    file: "ENG-2417",
    firm: "Meridian Advisory Group",
    profile:
      "Mid-size outdoor-gear retailer. 240 stores + 24/7 e-commerce storefront. Seasonal peaks of 6–8× average load around Black Friday. Expanding into the EU. Aging on-premises ERP. Nine-person IT team.",
    ask: "Recommend the cloud model (or combination) that best supports the business — and defend it with the client's own requirements.",
  };

  const MODE_CARDS = [
    {
      id: "medium",
      icon: "ic-graduation-cap",
      title: "Medium — Guided field training",
      line: "Learn the trade with a mentor at your shoulder.",
      points: [
        "12 guided objectives, introduced in order",
        "Tiered hints (nudge → direction → demonstration)",
        "Tolerant checking — wrong answers teach, never punish",
        "Concept quiz after practice",
      ],
      cta: "Start guided engagement",
    },
    {
      id: "hard",
      icon: "ic-shield-check",
      title: "Hard — Unassisted engagement",
      line: "The full, noisy casefile. The partner watches silently.",
      points: [
        "10 broad multi-step challenges",
        "Red herrings planted in the evidence",
        "No hints — one optional nudge that visibly costs score",
        "Strict validation: exact values, sequences, near-misses rejected",
      ],
      cta: "Start unassisted engagement",
    },
  ];

  const MODE_SELECT_INTRO = {
    kicker: "Meridian Advisory Group · Casefile ENG-2417",
    title: "The Engagement Desk",
    sub: 'Cloud models, analyzed like a consultant. CompTIA Cloud+ CV0-004 · Lesson 1.1 — public, private, hybrid, multi-cloud (and their cousin, community) — mapped to real business needs.',
    foot: "Both modes share the same casefile and environment. Progress is saved in your browser; a labeled RESET restores the pristine state. All organizations, people and figures are fictional training data.",
  };

  // ---------- Deployment models ----------
  const MODELS = [
    {
      id: "public",
      name: "Public cloud",
      tagline: "Rent provider capacity, shared with the world",
      definition:
        "Infrastructure owned and operated by a commercial cloud provider and delivered over the internet. Many customers share the same physical hardware (multi-tenant), logically isolated from one another.",
      ownership: "Provider owns the hardware, facilities and core operations.",
      tenancy: "Multi-tenant — many customers on shared physical infrastructure.",
      cost: "Pay-as-you-go OpEx; no up-front hardware spend.",
      strengths: [
        "Provision in minutes; massive elasticity for spiky demand",
        "No hardware lifecycle, refresh or facility burden",
        "Global reach — regions and edge locations near users",
        "Low entry cost; small teams can ship fast",
      ],
      limits: [
        "Least direct control over hardware and platform",
        "Compliance/sovereignty must be solved by region choice and contract, not by owning equipment",
        "Data-transfer (egress) fees can surprise budgets at scale",
        "Dependency on one provider's platform and pricing",
      ],
      fits: ["Startups and SaaS products", "Dev/test and ephemeral environments", "Public-facing storefronts", "Variable or seasonal workloads"],
      avoid: "Scenarios demanding dedicated hardware or regulator-visible direct control.",
      examTip: "Cues: “no infrastructure staff”, “fast growth”, “global users”, “pay only for what we use” → public.",
      pattern:
        "Illustrative pattern (simplified): consumer streaming and e-commerce platforms run seasonal customer-facing tiers on provider regions.",
    },
    {
      id: "private",
      name: "Private cloud",
      tagline: "Your own cloud, dedicated to one organization",
      definition:
        "Cloud capacity dedicated to a single organization. It can run on-premises in your own data center or be hosted by a third party — either way the hardware serves only you (single-tenant, dedicated).",
      ownership: "You (on-premises) or a hosting partner under a dedicated contract.",
      tenancy: "Single-tenant — dedicated infrastructure.",
      cost: "CapEx-heavy on-premises (buy for peak); hosted = recurring but premium.",
      strengths: [
        "Maximum control over hardware, network and configuration",
        "Easier to demonstrate strict regulatory and data-handling requirements",
        "Predictable performance; tight integration with legacy systems",
        "Data sits exactly where you physically place it",
      ],
      limits: [
        "You fund peak capacity even when it idles",
        "Maintenance, patching and hardware refresh are your problem",
        "Slower to scale; capacity planning is manual",
        "Needs skilled operations staff",
      ],
      fits: ["Regulated industries with strict control mandates", "Legacy systems needing OS-level access and low latency", "Steady, predictable core workloads"],
      avoid: "Fast-changing demand with a small team — the friction shows immediately.",
      examTip: "Cues: “dedicated”, “regulator requires we control”, “cannot leave our premises”, “steady load” → private.",
      pattern:
        "Illustrative pattern (simplified): banks and payment processors keep core ledgers on dedicated, auditable infrastructure.",
    },
    {
      id: "hybrid",
      name: "Hybrid cloud",
      tagline: "Private base + public stretch, orchestrated as one",
      definition:
        "Two or more distinct environments — typically a private cloud (often on-premises) plus public cloud — connected and orchestrated so workloads and data move between them as one operating whole.",
      ownership: "Mixed: keep what must stay yours; rent what should flex.",
      tenancy: "Mixed — dedicated where required, shared where sensible.",
      cost: "CapEx where justified, OpEx where it flexes.",
      strengths: [
        "Right home per workload: regulated stays close, spiky goes public",
        "Cloud bursting absorbs seasonal peaks without buying the peak",
        "Phased migration — modernize without a big-bang move",
        "Spreads risk across environments",
      ],
      limits: [
        "Integration and orchestration are real engineering work",
        "Security and compliance must span the boundary",
        "Two sets of skills and two operational playbooks",
        "Depends on reliable connectivity between sites",
      ],
      fits: ["Existing data center plus seasonal overflow", "Regulated core plus agile edge", "Gradual migration programs"],
      avoid: "Greenfield teams with no legacy — plain public is simpler.",
      examTip:
        "Cues: “we already own a data center”, “burst/overflow”, “keep X in-house while Y moves”, “integrated as one” → hybrid. Hybrid ≠ multi-cloud!",
      pattern:
        "Illustrative pattern (simplified): retailers run steady operations on-premises and burst Black Friday traffic into public regions.",
    },
    {
      id: "multi",
      name: "Multi-cloud",
      tagline: "Two or more public providers, deliberately combined",
      definition:
        "Using two or more public cloud providers — for different workloads, or as mutual backup. Every environment is public; the mix is about providers, not ownership types.",
      ownership: "Rented from multiple providers.",
      tenancy: "Multi-tenant on each provider.",
      cost: "OpEx across several bills — visibility needs discipline.",
      strengths: [
        "Avoids single-vendor dependency (lock-in, pricing leverage)",
        "Best-of-breed: pick each provider's strongest services",
        "Extra resilience and negotiating leverage",
        "Can satisfy per-jurisdiction needs via different providers",
      ],
      limits: [
        "Skills, tooling and security models duplicated per provider",
        "Integration and data movement between providers is complex",
        "Cost tracking across bills is harder (FinOps needed)",
        "Governance drift without a central platform strategy",
      ],
      fits: ["Large enterprises reducing vendor dependency", "Merged companies consolidating two estates", "Best-of-breed or resilience requirements"],
      avoid: "Small teams — overhead multiplies with every provider added.",
      examTip: "Cues: “two providers”, “avoid being locked in”, “best of each”, “post-merger” → multi-cloud. It is NOT hybrid by itself.",
      pattern:
        "Illustrative pattern (simplified): global enterprises split workloads across two major providers after mergers, or to keep negotiating leverage.",
    },
    {
      id: "community",
      name: "Community cloud",
      tagline: "Shared cloud for organizations with a common mission",
      definition:
        "Infrastructure shared by several organizations with common concerns — usually the same compliance regime, mission or jurisdiction. Cost and governance are shared between participants.",
      ownership: "Jointly operated, a consortium partner, or a provider under community contract.",
      tenancy: "Several related organizations share one dedicated platform.",
      cost: "Shared between members — between private and public economics.",
      strengths: [
        "Compliance tailored to the community's shared regulator",
        "Collaboration and shared data standards built in",
        "Cost sharing versus every member building private",
      ],
      limits: [
        "Smaller economies of scale than the big public clouds",
        "Governance needs agreement between members",
        "Limited service catalogs",
      ],
      fits: ["Health-data consortiums", "Government agencies with a shared mandate", "Research collaborations"],
      avoid: "Competitors with conflicting interests, or general-purpose workloads.",
      examTip: "Cues: “several organizations”, “same compliance requirements”, “shared platform for our sector” → community.",
      pattern:
        "Illustrative pattern (simplified): regional health networks share one platform under a single health-data compliance regime.",
    },
  ];

  // ---------- Service-model ladder ----------
  const LADDER = [
    {
      id: "iaas",
      name: "IaaS",
      provider: "Hardware · virtualization · networking · storage",
      customer: "OS · runtime · middleware · apps · data",
      example: "Lift-and-shift VMs; OS-level control required.",
    },
    {
      id: "paas",
      name: "PaaS",
      provider: "Everything in IaaS · OS · runtime · database",
      customer: "Your code · your data",
      example: "Managed app runtime for a small team.",
    },
    {
      id: "faas",
      name: "FaaS / serverless",
      provider: "Runs your function on events; scales to zero",
      customer: "Code only (no servers at all)",
      example: "Resize an image whenever one is uploaded; pay per invocation.",
    },
    {
      id: "saas",
      name: "SaaS",
      provider: "The entire application, end to end",
      customer: "Your data · identities · access · configuration",
      example: "Email, HR and CRM suites.",
    },
  ];

  // ---------- Glossary ----------
  const GLOSSARY = [
    { term: "Public cloud", def: "Provider-owned infrastructure delivered over the internet and shared by many organizations (multi-tenant)." },
    { term: "Private cloud", def: "Cloud dedicated to a single organization; on-premises or hosted; single-tenant/dedicated." },
    { term: "Hybrid cloud", def: "Two or more distinct environments (typically private + public) bound by orchestration into one operating whole." },
    { term: "Multi-cloud", def: "Using two or more public cloud providers — distinct from hybrid." },
    { term: "Community cloud", def: "Infrastructure shared by organizations with common compliance or mission concerns; cost and governance shared." },
    { term: "IaaS", def: "Provider supplies hardware, virtualization, network and storage; the customer manages the OS and everything above it." },
    { term: "PaaS", def: "Provider also supplies the OS, runtime and database; the customer supplies code and data." },
    { term: "SaaS", def: "Complete application delivered by the provider; the customer manages data, identity/access and configuration." },
    { term: "FaaS / serverless", def: "Event-driven execution; the customer supplies functions; nothing runs (or costs anything) when idle." },
    { term: "Multi-tenancy", def: "Multiple customers share the same physical infrastructure with logical isolation between them." },
    { term: "Elasticity", def: "Capacity grows and shrinks automatically with demand; you pay for what you use." },
    { term: "Cloud bursting", def: "Hybrid pattern where overflow load “bursts” from a private base into public capacity." },
    { term: "Vendor lock-in", def: "Dependency on one provider's proprietary services that raises the cost and effort of switching." },
    { term: "Data sovereignty / residency", def: "Legal requirement that data be stored and processed within a specific jurisdiction." },
    { term: "Shared responsibility model", def: "Split of duties between provider (“security of the cloud”) and customer (“security in the cloud”); it shifts with the service model." },
    { term: "CapEx vs OpEx", def: "Up-front capital expenditure (buying infrastructure) versus operational, pay-as-you-go expenditure (consuming it)." },
  ];

  // ---------- Casefile documents (training data — synthetic) ----------
  const DOCS = [
    {
      id: "d1",
      code: "D1",
      title: "Engagement Brief",
      kind: "brief",
      from: "Partner — Cloud Strategy Practice",
      date: "2026-10-06",
      lines: [
        { text: "Client: NorthPeak Outfitters. Engagement ENG-2417." },
        { text: CLIENT.profile },
        { text: "The ask: a cloud-model recommendation that supports the business, with justification the board can sign." },
        { text: "Partner's note: separate what the client MUST satisfy from what they merely PREFER. Boards sign requirements, not enthusiasm." },
      ],
    },
    {
      id: "d2",
      code: "D2",
      title: "Requirements Register",
      kind: "register",
      from: "NorthPeak PMO",
      date: "2026-10-08",
      lines: [
        { id: "r1", text: "R1 — EU customer personal data must be stored and processed within EU regions." },
        { id: "r2", text: "R2 — Our QSA requires the cardholder data environment to run on dedicated, physically isolated infrastructure." },
        { id: "r3", text: "R3 — The legacy ERP requires OS-level access and sub-50 ms links to warehouse scanners; it cannot be re-platformed before FY28." },
        { id: "r4", text: "R4 — CFO directive FY26: no material capital expenditure; growth workloads should use variable operating spend." },
        { id: "r5", text: "R5 — The CTO is personally enthusiastic about container platforms." },
        { id: "r6", text: "R6 — Marketing would like “AI-powered” features on the roadmap eventually." },
        { id: "r7", text: "R7 — The storefront must sustain Black Friday peaks of 6–8× average load at 99.9%+ availability." },
        { id: "r8", text: "R8 — A 2019 outage at our former hosting vendor caused two hours of downtime." },
      ],
    },
    {
      id: "d3",
      code: "D3",
      title: "Workload Inventory",
      kind: "inventory",
      from: "NorthPeak IT",
      date: "2026-10-09",
      lines: [
        { text: "Seven workloads in scope for placement. Attributes supplied by the workload owners." },
        { text: "W1 ERP Core — custom-built, 12 years old, OS-level customization, talks to warehouse scanners." },
        { text: "W2 Storefront Web — public-facing, spiky, US-heavy traffic with growing EU share." },
        { text: "W3 Payments (CDE) — cardholder data environment, in PCI-DSS scope." },
        { text: "W4 Email & HR — commodity suites for 1,400 staff, minimal customization." },
        { text: "W5 Burst Compute — overflow capacity for storefront peaks." },
        { text: "W6 EU Customer Analytics — batch analytics over EU customer data." },
        { text: "W7 Dev/Test Sandboxes — ephemeral environments for the two dev squads." },
      ],
    },
    {
      id: "d4",
      code: "D4",
      title: "Cost & SLA Sheet",
      kind: "finance",
      from: "NorthPeak Finance + procurement notes",
      date: "2026-10-10",
      lines: [
        { text: "Cost profiles (synthetic figures for training):" },
        { text: "· On-prem private expansion — ~$1.4M up-front servers & facilities (CapEx); staff to run it; capacity sized for peak." },
        { text: "· Hosted private — no up-front; premium recurring; dedicated hardware; contract terms apply." },
        { text: "· Public cloud — no up-front; metered OpEx; scales with demand; egress fees grow with data movement." },
        { text: "· SaaS — per-seat subscription; least operations; data/config remain the customer's duty." },
        { text: "Provider plan quotes for the public portion (see engagement Hard file): Plan A / Plan B / Plan C." },
      ],
    },
    {
      id: "d5",
      code: "D5",
      title: "CIO Memo — “Standardize on CloudNine”",
      kind: "memo",
      from: "NorthPeak CIO",
      date: "2026-10-11",
      hardOnly: true,
      lines: [
        { text: "I've had promising meetings with CloudNine's sales team — impressive lunches." },
        { text: "I'd like us to standardize on CloudNine across the board. Make it happen." },
        { text: "(Register note from PMO: no requirement in D2 references CloudNine or any provider.)" },
      ],
    },
    {
      id: "d6",
      code: "D6",
      title: "Industry Article — “The Great Cloud Outages of 2025: Why Everything Fails”",
      kind: "article",
      from: "Trade press (clipping)",
      date: "2026-09-30",
      hardOnly: true,
      lines: [
        { text: "Every major provider has region-wide incidents. Uptime happens to other people." },
        { text: "Only a fool trusts the cloud with anything important." },
        { text: "(Analyst note: generic fear piece; no NorthPeak-specific fact, no cited requirement.)" },
      ],
    },
    {
      id: "d7",
      code: "D7",
      title: "Stakeholder Interview Notes",
      kind: "interview",
      from: "Engagement analyst",
      date: "2026-10-12",
      hardOnly: true,
      lines: [
        { id: "i1", text: "IT Manager: “My team is nine people. We have no Kubernetes or multi-cloud tooling experience. Managed services would genuinely save us.”" },
        { id: "i2", text: "Warehouse Ops: “Scanners need sub-50 ms round-trip to the ERP or picking lines stall.”" },
        { id: "i3", text: "CIO's executive assistant: “The CIO prefers providers with nicer dashboards.”" },
      ],
    },
  ];

  // ---------- Kestrel brief (OBJ-M5) ----------
  const KESTREL_DOC = {
    id: "kestrel",
    code: "SB-1",
    title: "Client Brief — Kestrel Analytics",
    kind: "brief",
    from: "Meridian Advisory intake",
    date: "2026-10-14",
    lines: [
      { id: "k1", text: "K1 — Twelve-person SaaS startup; analytics product; users in 30+ countries; growth is real but unpredictable." },
      { text: "K2 (context) — Founders previously sold a company; capital is available but they refuse to spend it on servers." },
      { id: "k3", text: "K3 — No infrastructure staff today, and none planned; everyone writes product code." },
      { id: "k4", text: "K4 — They want to ship to new markets within weeks, not quarters, and pay only while usage runs." },
    ],
  };

  // ---------- Placement boards ----------
  const TARGETS_M = [
    { id: "t-onprem", name: "On-premises private", desc: "NorthPeak's Denver data center" },
    { id: "t-hosted", name: "Hosted private", desc: "Dedicated, provider-operated" },
    { id: "t-pub", name: "Public cloud", desc: "Metered, elastic, multi-tenant" },
    { id: "t-saas", name: "SaaS", desc: "Vendor-run complete application" },
    { id: "t-burst", name: "Burst capacity (hybrid)", desc: "Public overflow from the private base" },
  ];

  const WORKLOADS_M = [
    { id: "w1", name: "ERP Core", attrs: ["Legacy", "OS-level customization", "Low latency to scanners"], note: "Cannot be re-platformed before FY28." },
    { id: "w2", name: "Storefront Web", attrs: ["Public-facing", "24/7 SLA", "Global traffic"], note: "The revenue front door." },
    { id: "w3", name: "Payments (CDE)", attrs: ["PCI-DSS scope", "QSA: dedicated & isolated"], note: "Compliance-critical." },
    { id: "w4", name: "Email & HR", attrs: ["Commodity", "1,400 staff", "Minimal customization"], note: "Nobody wants to patch this." },
    { id: "w5", name: "Burst Compute", attrs: ["Seasonal 6–8× peaks", "Overflow only"], note: "Idle most of the year." },
  ];

  const TARGETS_H = [
    { id: "t-onprem", name: "On-premises private (Denver DC)", desc: "Latency-sensitive, OS-level control" },
    { id: "t-hosted", name: "Hosted private (dedicated)", desc: "Physically isolated, provider-operated" },
    { id: "t-pubus", name: "Public — US regions", desc: "Elastic, metered, multi-tenant" },
    { id: "t-pubue", name: "Public — EU regions", desc: "EU-resident processing & storage" },
    { id: "t-saas", name: "SaaS", desc: "Vendor-run application; data & access stay yours" },
  ];

  const WORKLOADS_H = [
    { id: "w1", name: "ERP Core", attrs: ["R3: OS-level access", "Sub-50 ms to scanners"], note: "Stays put until FY28." },
    { id: "w2", name: "Storefront Web", attrs: ["R7: 6–8× peaks", "99.9%+ SLA"], note: "Needs elastic public capacity." },
    { id: "w3", name: "Payments (CDE)", attrs: ["R2: dedicated & isolated"], note: "QSA mandate." },
    { id: "w4", name: "Email & HR", attrs: ["Commodity", "Small team"], note: "Managed end to end." },
    { id: "w5", name: "Burst Compute", attrs: ["R7 overflow", "Idle off-season"], note: "Paid only while bursting." },
    { id: "w6", name: "EU Customer Analytics", attrs: ["R1: EU residency"], note: "Batch jobs over EU personal data." },
    { id: "w7", name: "Dev/Test Sandboxes", attrs: ["Ephemeral", "Two squads"], note: "Cheap, disposable, no EU data." },
  ];

  // ---------- Cost sheet (M9) ----------
  const COST_ROWS = [
    { model: "On-prem private expansion", upfront: "$1.4M CapEx", run: "Staff + facilities", capacity: "Sized for peak", ops: "You patch & refresh" },
    { model: "Hosted private", upfront: "None", run: "Premium recurring", capacity: "Dedicated, contracted", ops: "Provider runs, you configure" },
    { model: "Public cloud", upfront: "None", run: "Metered OpEx (+egress)", capacity: "Scales to demand", ops: "Provider runs the platform" },
    { model: "SaaS", upfront: "None", run: "Per-seat subscription", capacity: "Vendor's problem", ops: "Vendor runs everything" },
  ];

  const COST_Q1_OPTIONS = [
    { id: "c1a", text: "On-premises private expansion" },
    { id: "c1b", text: "Public cloud consumption" },
    { id: "c1c", text: "Both profiles are identical" },
    { id: "c1d", text: "Neither can work under a CapEx freeze" },
  ];

  const COST_Q2_OPTIONS = [
    { id: "c2a", text: "Public cloud is always cheaper than owning hardware" },
    { id: "c2b", text: "Egress/data-transfer fees can grow significantly at scale and must be modeled" },
    { id: "c2c", text: "Public cloud bills are fixed monthly, like rent" },
    { id: "c2d", text: "OpEx models require large up-front investment" },
  ];

  // ---------- Mini-cases (M10) ----------
  const MINI_CASES = [
    {
      id: "mc1",
      client: "Fairbanks Trust Bank",
      text: "Regional bank. The regulator expects direct customer control over hardware and data location; workloads are steady; a capital budget exists.",
      drivers: [
        { id: "mc1a", text: "Data control & compliance" },
        { id: "mc1b", text: "Elasticity for spikes" },
        { id: "mc1c", text: "Best-of-breed provider services" },
        { id: "mc1d", text: "Fast global launch" },
      ],
    },
    {
      id: "mc2",
      client: "Atlas & Meridian Logistics",
      text: "Post-merger logistics group. Divisions run on two different public providers; leadership wants best-of-breed services and negotiating leverage; no private estate.",
      drivers: [
        { id: "mc2a", text: "Dedicated hardware" },
        { id: "mc2b", text: "Avoid lock-in / keep leverage" },
        { id: "mc2c", text: "OS-level ERP access" },
        { id: "mc2d", text: "Cheapest email" },
      ],
    },
    {
      id: "mc3",
      client: "Vela Retail",
      text: "Retailer with an existing data center and a spiky storefront. Wants overflow capacity in public regions during the holidays, managed as one integrated estate.",
      drivers: [
        { id: "mc3a", text: "Optimize per workload / burst" },
        { id: "mc3b", text: "Maximum customization of email" },
        { id: "mc3c", text: "Multi-provider leverage" },
        { id: "mc3d", text: "Zero ops burden anywhere" },
      ],
    },
  ];

  // ---------- Risks & mitigations (M11 / H7) ----------
  const RISKS_M = [
    { id: "rk1", risk: "Vendor lock-in raises switching costs" },
    { id: "rk2", risk: "Egress fees surprise the budget at scale" },
    { id: "rk3", risk: "Compliance drifts across environments" },
    { id: "rk4", risk: "A nine-person team can't operate everything" },
  ];

  const MITIGATIONS_M = [
    { id: "mt-exit", label: "Exit strategy + portability", detail: "Negotiate exit terms; prefer open standards and containers so workloads can move." },
    { id: "mt-finops", label: "FinOps discipline", detail: "Tag resources, monitor transfer fees, model total cost including egress." },
    { id: "mt-cspm", label: "Continuous compliance", detail: "Monitor posture continuously; enforce data classification and placement rules." },
    { id: "mt-managed", label: "Managed services + training", detail: "Shift to PaaS/SaaS where sensible; train targeted skills for what remains." },
  ];

  const RISKS_H = [
    { id: "rkA", risk: "Vendor lock-in on the public side", signal: "Proprietary services would be tempting for the storefront team" },
    { id: "rkB", risk: "Burst-driven bill growth (egress + peak metering)", signal: "R4/R7: variable spend on 6–8× peaks" },
    { id: "rkC", risk: "Compliance drift across the hybrid boundary", signal: "R1 + R2 obligations span two environments" },
    { id: "rkD", risk: "Single-region outage takes down the storefront", signal: "R7 SLA; a DR runbook exists" },
    { id: "rkE", risk: "Skills gap in a nine-person team", signal: "D7: no Kubernetes or multi-cloud tooling experience" },
    { id: "rkF", risk: "Integration complexity of the hybrid fabric", signal: "R3 keeps ERP on-prem while growth goes public" },
    { id: "rkG", risk: "Shadow spend outside governance", signal: "Not evidenced at NorthPeak" },
  ];

  const MITIGATIONS_H = [
    { id: "mh-exit", label: "Exit strategy + portability", detail: "Documented exit terms; containerized, standards-based workloads." },
    { id: "mh-finops", label: "FinOps + budget alerts", detail: "Tagging, egress monitoring, peak-spend alerts before Black Friday." },
    { id: "mh-cspm", label: "Continuous compliance + placement rules", detail: "Automated checks that EU data and CDE workloads stay where policy says." },
    { id: "mh-dr", label: "Multi-region DR plan", detail: "Runbook failover to a secondary region/provider; tested before the season." },
    { id: "mh-managed", label: "Managed services + targeted training", detail: "PaaS/SaaS for commodity loads; train only for what stays self-run." },
  ];

  // ---------- Provider plans (H6) ----------
  const PLANS = [
    { id: "pa", name: "Plan A", sla: "99.9%", regions: "US only", commitment: "None — pure metered", price: "Lowest metered rate" },
    { id: "pb", name: "Plan B", sla: "99.95%", regions: "US + EU", commitment: "None — pure metered", price: "Mid metered rate" },
    { id: "pc", name: "Plan C", sla: "99.99%", regions: "US + EU", commitment: "3-year minimum spend + up-front reservation", price: "Discounted rate with commitment" },
  ];

  // ---------- Memo composer options (M12 / H8) ----------
  const MEMO_MAPPINGS_M = [
    { id: "map1", text: "EU residency → run EU-bound data workloads in EU public regions" },
    { id: "map2", text: "QSA-dedicated CDE → hosted private environment" },
    { id: "map3", text: "Black Friday peaks → burst into public capacity from the private base" },
    { id: "map4", text: "Legacy ERP → re-platform to SaaS immediately" },
    { id: "map5", text: "Email & HR → dedicated private cluster we patch ourselves" },
    { id: "map6", text: "FY26 CapEx freeze → fund growth workloads as variable OpEx" },
  ];

  const MEMO_TRADEOFFS = [
    { id: "to1", text: "Hybrid adds integration complexity and needs skills across both environments" },
    { id: "to2", text: "Hybrid removes the need for compliance planning" },
    { id: "to3", text: "Hybrid means using two public providers" },
    { id: "to4", text: "Hybrid always costs more than any other model" },
  ];

  const MEMO_MAPPINGS_H = [
    { id: "hm1", text: "EU residency → EU public regions for EU-bound data workloads" },
    { id: "hm2", text: "QSA CDE → hosted private, dedicated and isolated" },
    { id: "hm3", text: "ERP + scanners → stay on-premises (latency, OS access) until FY28" },
    { id: "hm4", text: "Black Friday 6–8× → elastic public burst, paid as OpEx" },
    { id: "hm5", text: "Storefront → move to the retail community cloud" },
    { id: "hm6", text: "Email → custom IaaS cluster we patch ourselves" },
  ];

  const MEMO_EXITS = [
    { id: "ex1", text: "Documented exit strategy + keep workloads portable (containers, open standards)" },
    { id: "ex2", text: "Sign a 5-year proprietary lock-in for better discounts" },
    { id: "ex3", text: "No exit plan — providers never change" },
    { id: "ex4", text: "Exit strategy = deleting the contracts" },
  ];

  // ---------- Architecture patterns (H3) ----------
  const PATTERNS = [
    { id: "p1", text: "Single public provider for everything, including the CDE and ERP" },
    { id: "p2", text: "On-premises private cloud only — no public usage at all" },
    { id: "p3", text: "Hybrid: keep ERP and the cardholder-data environment dedicated/private; run storefront, EU data workloads and burst capacity in public regions" },
    { id: "p4", text: "Multi-cloud: split all workloads across two public providers, nothing on-premises" },
    { id: "p5", text: "Community cloud shared with retail-industry peers" },
  ];

  // ---------- Outage drill (H9) ----------
  const DRILL_ACTIONS = [
    { id: "a1", text: "Declare the incident; fail the storefront over to the secondary provider's US region per the DR runbook." },
    { id: "a2", text: "Verify EU data residency and access controls still hold after failover." },
    { id: "a3", text: "Publish stakeholder status updates and log everything for the post-incident review." },
    { id: "a4", text: "Re-platform the ERP to public IaaS immediately to avoid future outages." },
    { id: "a5", text: "Order permanent on-premises hardware to replace the cloud." },
  ];

  // ---------- Hard-mode elimination panel (H2) ----------
  const ELIMINATE_MODELS = [
    { id: "public", name: "Public cloud only", claim: "Everything — including the CDE — on one public provider" },
    { id: "private", name: "Private cloud only (on-prem)", claim: "Everything back in the Denver data center, nothing public" },
  ];

  const ELIM_REASONS = [
    { id: "r1", text: "R1 — EU residency" },
    { id: "r2", text: "R2 — QSA-dedicated CDE" },
    { id: "r3", text: "R3 — ERP latency & OS access" },
    { id: "r4", text: "R4 — FY26 CapEx freeze" },
    { id: "r7", text: "R7 — 6–8× burst demand" },
    { id: "i1", text: "D7 — team skills gap" },
  ];

  // ---------- Instrument data (panel questions) ----------
  const TENANCY_QS = [
    {
      id: "q-own",
      prompt: "Who owns and operates the physical hardware in a public cloud?",
      options: [
        { id: "o-provider", text: "The cloud provider" },
        { id: "o-customer", text: "Each customer" },
        { id: "o-community", text: "A member consortium" },
        { id: "o-nobody", text: "Nobody — it is virtual" },
      ],
    },
    {
      id: "q-control",
      prompt: "A client demands maximum control over hardware and configuration. Which model fits BEST?",
      options: [
        { id: "o-public", text: "Public cloud" },
        { id: "o-private", text: "Private cloud" },
        { id: "o-hybrid", text: "Hybrid cloud" },
        { id: "o-multi", text: "Multi-cloud" },
      ],
    },
    {
      id: "q-variant",
      prompt: "A private cloud can be delivered as…",
      options: [
        { id: "o-onprem", text: "On-premises only" },
        { id: "o-hosted", text: "On-premises OR hosted by a third party" },
        { id: "o-multitenant", text: "Multi-tenant only" },
        { id: "o-commune", text: "Community-owned only" },
      ],
    },
  ];

  const LADDER_OPTS = [
    { id: "iaas", text: "IaaS" },
    { id: "paas", text: "PaaS" },
    { id: "faas", text: "FaaS / serverless" },
    { id: "saas", text: "SaaS" },
  ];

  const LADDER_QS = [
    { id: "s1", prompt: "Our team wants VMs with full OS access to lift-and-shift a legacy app.", options: LADDER_OPTS },
    { id: "s2", prompt: "A small team wants to deploy code without managing servers, runtime or OS.", options: LADDER_OPTS },
    { id: "s3", prompt: "Commodity email and HR for everyone, managed by the vendor end to end.", options: LADDER_OPTS },
    { id: "s4", prompt: "A task should run only when a file is uploaded — and cost nothing when idle.", options: LADDER_OPTS },
  ];

  const SHARED_QS = [
    {
      id: "q-saas",
      prompt: "Even in SaaS — where the vendor runs the whole application — which duties ALWAYS stay with the customer?",
      options: [
        { id: "sr-hyper", text: "Patching the hypervisor" },
        { id: "sr-data", text: "Managing user identities, access, and the data you put in" },
        { id: "sr-disks", text: "Replacing failed disks" },
        { id: "sr-dc", text: "Securing the physical data center" },
      ],
    },
    {
      id: "q-iaas",
      prompt: "In IaaS, who patches the guest operating system of your virtual machine?",
      options: [
        { id: "sr-you", text: "You — IaaS leaves the OS to the customer" },
        { id: "sr-prov", text: "The provider" },
        { id: "sr-none", text: "Nobody — VMs patch themselves" },
        { id: "sr-hw", text: "The hardware vendor" },
      ],
    },
  ];

  const CLASSIFY_CASES = [
    {
      id: "c1",
      client: "Harbor Retail",
      text: "Runs its loyalty database in its own data center and its storefront in a public provider, connected by an orchestration layer that moves overflow load between them.",
    },
    {
      id: "c2",
      client: "Corvus Media",
      text: "Runs production analytics on Provider A and its customer portal on Provider B — both public, managed separately, with a governance board over both.",
    },
    {
      id: "c3",
      client: "Northline Freight",
      text: "After a merger it runs half its workloads on Provider A and half on Provider B to keep negotiating leverage — no private environment anywhere.",
    },
  ];

  const SERVICE_QS = [
    { id: "s-store", prompt: "The storefront squad is two developers deploying weekly; they want a managed runtime with zero server/OS work.", options: LADDER_OPTS },
    { id: "s-cde", prompt: "The cardholder-data environment needs OS-level hardening agents and QSA-auditable configuration.", options: LADDER_OPTS },
    { id: "s-mail", prompt: "Email & HR for 1,400 staff, run by the vendor end to end.", options: LADDER_OPTS },
    { id: "s-thumb", prompt: "Product images are resized on upload — 40× spikes in November, and it must cost nothing when idle.", options: LADDER_OPTS },
  ];

  // ---------- Match instrument definitions (M1 / H10) ----------
  const MATCH_DEFS = [
    { id: "d1", text: "D1 — Provider-owned infrastructure, shared by many organizations over the internet." },
    { id: "d2", text: "D2 — Dedicated capacity for a single organization; on-premises or hosted." },
    { id: "d3", text: "D3 — Distinct private and public environments bound together by orchestration." },
    { id: "d4", text: "D4 — Two or more public providers used side by side." },
    { id: "d5", text: "D5 — Infrastructure shared by organizations with common compliance concerns." },
  ];

  const MATCH_H_DEFS = [
    { id: "e1", text: "“We run production on Provider A and burst to Provider B during peaks. Every environment is public — we just refuse to depend on one vendor.”" },
    { id: "e2", text: "“Our core ledger stays on dedicated hardware in our own facility; seasonal analytics overflow runs in Provider A's EU region — all orchestrated as one estate.”" },
    { id: "e3", text: "“Fourteen member agencies co-fund one platform, governed together under the regulator we all answer to.”" },
    { id: "e4", text: "“The capacity is dedicated to us alone, but a hosting partner operates it in their facility. Single-tenant, our configuration.”" },
    { id: "e5", text: "“Provider-owned infrastructure, many unrelated customers on the same hardware, logical isolation, delivered over the internet.”" },
  ];

  const MATCH_OPTS = [
    { id: "public", text: "Public" },
    { id: "private", text: "Private" },
    { id: "hybrid", text: "Hybrid" },
    { id: "multi", text: "Multi-cloud" },
    { id: "community", text: "Community" },
  ];

  const CLASSIFY_OPTS = [
    { id: "hybrid", text: "Hybrid cloud" },
    { id: "multi", text: "Multi-cloud" },
  ];

  // ---------- Debrief copy ----------
  const DEBRIEF = {
    kicker: "Stage 05 · Debrief & Field Notes",
    title: "What the engagement taught you",
    sub: "The synthesis a consultant leaves behind: the signals, the controls, and the traps — yours to reuse on the exam and in the field.",
    signalsH: "Requirement signals → model implications",
    signals: [
      { signal: "“No infra staff / ship fast / pay as we go”", says: "Public cloud — elasticity plus OpEx, ops outsourced to the provider" },
      { signal: "“Dedicated / regulator wants direct control”", says: "Private cloud — on-prem or hosted, single-tenant by definition" },
      { signal: "“We own a DC + seasonal overflow / bursting”", says: "Hybrid cloud — private base orchestrated with public stretch" },
      { signal: "“Two public providers / avoid lock-in / best-of-breed”", says: "Multi-cloud — providers vary, not ownership types" },
      { signal: "“Several orgs, one compliance regime, shared platform”", says: "Community cloud — shared cost and governance" },
    ],
    controlsH: "Adoption controls (recommend with every model)",
    defenderH: "Blue-team takeaways",
    defender: [
      { lead: "Classify data before placing workloads.", body: " Residency and cardholder obligations decided NorthPeak's map — never the other way round. Placement rule-breaks are compliance incidents, not architecture debates." },
      { lead: "The shared responsibility gap causes real breaches.", body: " Customers assume the provider absorbed duties that never transferred. In every service model, data and identity/access remain yours." },
      { lead: "Contracts are controls too.", body: " SLA targets, exit terms and region commitments are enforceable boundaries — review them with the same rigor as a firewall rule." },
    ],
    notesH: "Consultant field notes — how this topic bites",
    notes: [
      { lead: "Multi-cloud ≠ hybrid.", body: " Multi mixes public providers; hybrid mixes ownership types under orchestration. Exams love swapping the two in scenario stems." },
      { lead: "Private ≠ automatically secure.", body: " Implementation and shared responsibilities decide security — a misconfigured private estate is breached like anything else." },
      { lead: "Community cloud exists.", body: " “Several organizations, same compliance regime, shared platform” is a full model, not a typo for public." },
      { lead: "Binding beats stated.", body: " Regulators, QSAs, physics and CFO directives constrain designs; enthusiasm and vendor lunches don't. In stems, separate requirements from preferences before answering." },
      { lead: "Cost cues map to models.", body: " “CapEx freeze / variable spend” pushes public consumption; “buy the peak” warnings push away from on-prem expansion; egress is the hidden line item." },
    ],
    refH: "Reference (opens in a new tab)",
    refUrl: "https://www.comptia.org/en-us/certifications/cloud",
    refLabel: "CompTIA Cloud+ (CV0-004) — official exam page",
    resultsCta: "View engagement results",
  };

  const NEXT_STEPS = [
    "Cloud+ Domain 1 continues: service availability — regions, availability zones, and how they shape SLAs.",
    "Then cloud networking — VPCs, VPNs, load balancers, CDNs — the plumbing beneath every model you just placed.",
    "Re-run this desk in the other difficulty mode: guided training and unassisted engagement test different muscles.",
  ];

  // ---------- Completion modal copy ----------
  const MODAL_COPY = {
    title: "Engagement signed off",
    stamp: "Signed",
    descMedium: "Casefile ENG-2417 · Medium — guided field training",
    descHard: "Casefile ENG-2417/H · Hard — unassisted engagement",
    focusH: "Focus areas — study these before the exam",
    focusClean:
      "No repeat misses and no hint spend: every objective fell on the first check and the review came back clean. Keep this run as your reference attempt and go sharpen the next lesson.",
    focusDerived:
      "Derived from this engagement's evidence: objectives that needed more than one check or a hint, and review items answered incorrectly.",
    nextH: "Where to go next",
    back: "Back to debrief",
    restart: "Restart engagement",
    restartTitle: "Restart from the mode selection?",
    restartDesc: "Clears all progress and saved state. The casefile returns to its pristine condition.",
    restartCancel: "Cancel",
    restartAction: "Restart",
    overall: "Overall score",
    starRating: "Star rating",
    craft: "Craft stats",
    firstAttempt: "First-attempt passes:",
    hintsUsed: "Hints used: ",
    nudgesUsed: "Nudges used: ",
    pillarRecap: "Objective recap by mastery pillar",
    star3: "First-attempt precision",
    star2: "Solid consultant work",
    star1: "Engagement delivered",
    star0: "In progress",
  };

  // ---------- Masthead copy ----------
  const MASTHEAD = {
    title: "The Engagement Desk",
    sub: "Cloud models · Cloud+ CV0-004 · Lesson 1.1",
    fileMedium: "ENG-2417",
    fileHard: "ENG-2417/H",
    modeMedium: "Medium · guided",
    modeHard: "Hard · unassisted",
    reset: "Reset",
    resetTitle: "Reopen the casefile from scratch?",
    resetDesc:
      "This clears all progress — objectives, placements, stamps, quiz results and your saved session — and returns the desk to its pristine state.",
    resetCancel: "Keep working",
    resetAction: "Reset everything",
    themeLabel: "Toggle desk lamp (light or dark theme)",
    themeTitle: "Desk lamp — light / dark",
  };

  // ---------- Stage gating copy ----------
  const GATE_COPY = {
    compendiumFirst: "Finish the Model Compendium first",
    objectivesFirst: (done, total) => "Complete all " + total + " desk objectives first (" + done + "/" + total + ")",
    quizFirst: "Finish the Competency Review first",
  };

  // ---------- Focus-area derivation (audit R8) ----------
  const OBJ_FOCUS = {
    "OBJ-M1": { topic: "Deployment-model definitions", action: "Re-classify five ownership/tenancy statements without the Compendium open." },
    "OBJ-M2": { topic: "Tenancy & ownership tells", action: "Drill the “hosted private is still private” distinction with two more client quotes." },
    "OBJ-M3": { topic: "Service-model ladder", action: "Re-sort the IaaS→PaaS→SaaS→FaaS statements by what the customer still manages." },
    "OBJ-M4": { topic: "Shared responsibility", action: "List which duties stay with the customer in every service model (data, identity/access)." },
    "OBJ-M5": { topic: "Evidence triage → model fit", action: "Re-read the Kestrel brief and tag its three public-cloud drivers from memory." },
    "OBJ-M6": { topic: "Hybrid vs multi-cloud boundary", action: "Classify three client profiles by counting ownership types vs provider count." },
    "OBJ-M7": { topic: "Workload placement", action: "Re-place the five NorthPeak workloads, naming the decisive attribute for each." },
    "OBJ-M8": { topic: "Binding vs preference", action: "Sort the Requirements Register into binding constraints and preferences, citing each authority." },
    "OBJ-M9": { topic: "Cost profiles (CapEx/OpEx/egress)", action: "Re-study the cost sheet: which profile has no up-front spend and meters consumption?" },
    "OBJ-M10": { topic: "Scenario selection + driver", action: "Re-match Fairbanks, Atlas & Meridian and Vela to models using their own words." },
    "OBJ-M11": { topic: "Adoption risks → controls", action: "Re-pair lock-in, bill shock, compliance drift and skills gaps with their mitigations." },
    "OBJ-M12": { topic: "Recommendation memo", action: "Rewrite the memo mappings from the five binding constraints before checking." },
    "OBJ-H1": { topic: "Noisy-casefile triage", action: "Re-tag the casefile: authority-backed statements only — regulator, QSA, physics, CFO, SLA, capability gap." },
    "OBJ-H2": { topic: "Constraint-based elimination", action: "Re-run the eliminations citing the single binding constraint that kills each candidate." },
    "OBJ-H3": { topic: "Pattern selection under constraints", action: "Test each candidate pattern against R1–R4 and R7 before choosing." },
    "OBJ-H4": { topic: "Placement under binding constraints", action: "Re-place the seven workloads, then audit each against R1/R2/R3/R7." },
    "OBJ-H5": { topic: "Service-model assignment", action: "Re-assign the four service models using the interview-notes skills evidence." },
    "OBJ-H6": { topic: "SLA & commitment trade-offs", action: "Re-check the three plans against residency, SLA bar and the variable-spend directive." },
    "OBJ-H7": { topic: "Evidence-driven risk register", action: "Re-select the three evidenced risks and re-pair each with its working control." },
    "OBJ-H8": { topic: "Executive justification + exit", action: "Rewrite the memo's four mappings and the exit control from the constraint list." },
    "OBJ-H10": { topic: "Model precision under quoted phrasing", action: "Re-classify the five client quotes watching the hosted-private and orchestrated-mix traps." },
    "OBJ-H9": { topic: "Incident sequencing (DR runbook)", action: "Re-run the outage drill: restore → verify → communicate, no panic moves." },
  };

  const QUIZ_FOCUS = {
    "m-q1": { topic: "Public cloud definition", action: "Restudy the Compendium public card: provider ownership + multi-tenancy + internet delivery." },
    "m-q2": { topic: "Responsibility ladder direction", action: "Walk the ladder again and note what transfers at each rung — and what never does." },
    "m-q3": { topic: "Multi-cloud identification", action: "Classify three two-provider estates; check for any private side before saying hybrid." },
    "m-q4": { topic: "Cloud bursting pattern", action: "Re-read the hybrid card: private base + public overflow under one orchestration." },
    "m-q5": { topic: "SaaS responsibility split", action: "Re-check which duties remain with the customer in SaaS." },
    "m-q6": { topic: "Community cloud fit", action: "Re-read the community card: several organizations, one compliance regime, shared governance." },
    "h-q1": { topic: "Community cloud scenario", action: "Re-run the Cobalt Health profile: co-funded, co-governed, one regulator." },
    "h-q2": { topic: "PaaS selection", action: "Re-check which stack layers PaaS absorbs for a small team." },
    "h-q3": { topic: "Pattern satisfaction of constraints", action: "Re-test each pattern against the dedicated-CDE mandate, the peaks and the existing DC." },
    "h-q4": { topic: "Multi-cloud motivation", action: "Re-read the multi-cloud card: leverage and best-of-breed across public providers." },
    "h-q5": { topic: "FaaS / serverless economics", action: "Re-check event-driven, scale-to-zero, pay-per-invocation against the budget line." },
    "h-q6": { topic: "Sovereignty as a binding constraint", action: "Re-visit the residency cue: it binds region and sometimes the model itself." },
    "h-q7": { topic: "Security is not ownership", action: "Re-study the shared responsibility model and why control ≠ security." },
  };

  // ---------- Objectives (definitions; validation keys live in js/objectives.js) ----------
  const OBJECTIVES_MEDIUM = [
    {
      id: "OBJ-M1",
      title: "Model Match",
      pillar: "P1",
      context:
        "Five deployment models, five defining statements. Ownership and sharing are the fastest tells: who owns the hardware, and who else runs on it.",
      task: "Assign each definition to the model it describes.",
      instrument: "match",
      hints: [
        "Read each definition for two signals: who owns the hardware, and who shares it.",
        "Shared provider-owned kit = public. Dedicated to one org = private. Orchestrated private+public = hybrid. Two public providers = multi. Shared compliance club = community.",
        "Demonstration: D1→Public, D2→Private, D3→Hybrid, D4→Multi-cloud, D5→Community.",
      ],
      feedbackPass:
        "Solid. These five definitions cover every deployment-model question CV0-004 can ask — next you'll read them inside real client evidence.",
      feedbackFail:
        "Re-check the two tells: ownership (provider vs you vs consortium) and tenancy (shared vs dedicated). The Compendium cards show both for every model.",
    },
    {
      id: "OBJ-M2",
      title: "Tenancy & Ownership",
      pillar: "P1",
      context:
        "Tenancy and control separate look-alike models. Public = shared provider hardware. Private = dedicated, on-prem OR hosted — “hosted private” is still private.",
      task: "Answer all three questions.",
      instrument: "tenancy",
      hints: [
        "One question is about ownership, one about control, one about where a private cloud may live.",
        "Private cloud is defined by dedication, not by location — a hosting partner can run it for you.",
        "Demonstration: Q1→Provider, Q2→Private, Q3→On-prem OR hosted.",
      ],
      feedbackPass:
        "Exactly. “Hosted private” trips many candidates: dedication defines private, not the building it sits in.",
      feedbackFail:
        "Review the Compendium ownership/tenancy rows. Public is the only multi-tenant-by-default model; private can be on-prem or hosted.",
    },
    {
      id: "OBJ-M3",
      title: "Service-Model Ladder",
      pillar: "P1",
      context:
        "Deployment model says where workloads live; service model says who manages the stack. Climb IaaS → PaaS → SaaS and the provider absorbs more of it.",
      task: "Match each statement to the service model it describes.",
      instrument: "ladder",
      hints: [
        "Ask per statement: what is the customer still managing?",
        "OS access = IaaS. Code-only = PaaS. Vendor runs everything = SaaS. Runs on events and costs nothing idle = FaaS.",
        "Demonstration: S1→IaaS, S2→PaaS, S3→SaaS, S4→FaaS.",
      ],
      feedbackPass:
        "The ladder is one of CV0-004's highest-frequency items — you now read responsibility splits fluently.",
      feedbackFail:
        "Use the ladder in the Compendium: each rung lists exactly what the provider manages and what remains yours.",
    },
    {
      id: "OBJ-M4",
      title: "Shared Responsibility",
      pillar: "P1",
      context:
        "The shared responsibility model: the provider secures “of the cloud”, you secure what you put “in the cloud”. Two duties never leave the customer: data and identity/access.",
      task: "Answer both responsibility questions.",
      instrument: "shared",
      hints: [
        "Which duties survive even in SaaS, where the vendor runs the whole application?",
        "In IaaS the guest OS is yours — providers patch their hypervisors, not your VMs.",
        "Demonstration: SaaS duties → identities, access & data. IaaS OS patching → you.",
      ],
      feedbackPass:
        "Correct — and it's the #1 gap in real cloud breaches: customers assume the provider absorbed duties that never transferred.",
      feedbackFail:
        "Remember the constant: data and identity/access are ALWAYS customer duties, in every service model.",
    },
    {
      id: "OBJ-M5",
      title: "Triage: Kestrel Analytics",
      pillar: "P2",
      context:
        "First live brief. Kestrel Analytics is a 12-person SaaS startup with global users. Read the intake brief like a consultant: which model fits, and which lines prove it?",
      task: "Stamp the model that fits Kestrel, then tag every brief line that justifies the choice.",
      instrument: "kestrel",
      hints: [
        "Look for: in-house infrastructure capacity, growth shape, and how they want to pay.",
        "No infra staff + unpredictable global growth + pay-while-running — which model is built for exactly that?",
        "Demonstration: stamp Public; tag K1, K3 and K4.",
      ],
      feedbackPass:
        "Clean triage. Startup speed, zero ops staff and usage-based cost are textbook public-cloud drivers — and you proved it from their own words.",
      feedbackFail:
        "Re-read the brief lines and the Compendium “fits” row for public: no ops staff, unpredictable global growth, pay-per-use.",
    },
    {
      id: "OBJ-M6",
      title: "Hybrid vs Multi-cloud",
      pillar: "P2",
      context:
        "The classic exam trap. Hybrid mixes ownership types (private + public) under orchestration. Multi-cloud mixes public PROVIDERS. One estate can even be both — but neither implies the other.",
      task: "Classify each client profile as hybrid or multi-cloud.",
      instrument: "classify",
      hints: [
        "Count ownership types first, then count providers. Are there two kinds of environment, or two vendors?",
        "“Connected to our data center” = hybrid flavor. “Two providers, no private estate” = multi-cloud flavor.",
        "Demonstration: C1→Hybrid, C2→Multi-cloud, C3→Multi-cloud.",
      ],
      feedbackPass:
        "You won't fall for the exam's favorite cloud-model distractor pair again.",
      feedbackFail:
        "Hybrid needs a private (or on-prem) side integrated with public. If everything is public and there are simply two vendors, it's multi-cloud.",
    },
    {
      id: "OBJ-M7",
      title: "Workload Placement",
      pillar: "P2",
      context:
        "Model choice becomes real when workloads get homes. NorthPeak's five core workloads each carry attributes that point to exactly one best-fit target.",
      task: "Place all five workloads into the best-fit environment.",
      instrument: "placeM",
      hints: [
        "Match workload attributes to target descriptions — latency, compliance, spikiness and commodity-ness decide.",
        "Legacy+latency stays on-prem; QSA-dedicated goes hosted private; commodity email is SaaS; spiky storefront is public; overflow is burst.",
        "Demonstration: W1→On-prem, W2→Public, W3→Hosted private, W4→SaaS, W5→Burst.",
      ],
      feedbackPass:
        "This is hybrid thinking in practice — one estate, five homes, each justified by a workload attribute.",
      feedbackFail:
        "One attribute per workload is decisive. Re-read each workload's chips, then each target's description.",
    },
    {
      id: "OBJ-M8",
      title: "Requirement Red Flags",
      pillar: "P3",
      context:
        "Not every statement in a register binds you. Regulations, security mandates and executive directives constrain the design; enthusiasm and vibes don't.",
      task: "Tag every line in the Requirements Register that is a BINDING constraint on the cloud model.",
      instrument: "flags",
      hints: [
        "A binding constraint has an authority behind it: a regulator, a QSA, latency physics, or a CFO directive.",
        "Personal enthusiasm, vague roadmap wishes and past-history anecdotes do not bind the design.",
        "Demonstration: tag R1, R2, R3, R4 and R7.",
      ],
      feedbackPass:
        "Five binding constraints — EU residency, dedicated CDE, ERP latency, CapEx freeze, burst demand. Every recommendation you write must survive these.",
      feedbackFail:
        "You tagged some preference as binding (or skipped a constraint). Count the authorities: regulator/QSA (R2), data protection (R1), physics (R3), CFO (R4), SLA+peaks (R7).",
    },
    {
      id: "OBJ-M9",
      title: "Cost Profile Analysis",
      pillar: "P3",
      context:
        "Cost decides as often as compliance. On-prem = CapEx and you buy the peak. Public = metered OpEx and you pay per use — but egress grows with data movement.",
      task: "Study the Cost & SLA sheet, then answer both questions.",
      instrument: "cost",
      hints: [
        "Q1: which profile has no up-front spend and charges by consumption?",
        "Q2: only one statement about public-cloud cost is factually true — the others overclaim or misstate the model.",
        "Demonstration: Q1→Public cloud consumption; Q2→egress fees must be modeled.",
      ],
      feedbackPass:
        "Right. “Always cheaper” and “fixed rent” are exam bait — metered cost plus egress is the honest picture.",
      feedbackFail:
        "Re-read the sheet: CapEx means buying the peak; OpEx means paying per use; egress is the classic hidden line item.",
    },
    {
      id: "OBJ-M10",
      title: "Mini-case Decisions",
      pillar: "P4",
      context:
        "Three more clients, three different right answers. This is the exam's “given a scenario” format in miniature: pick the model, then pick the driver that justifies it.",
      task: "For each client, stamp the best-fit model AND its primary driver.",
      instrument: "cases",
      hints: [
        "Fairbanks' regulator wants direct control; Atlas & Meridian wants leverage across two public providers; Vela wants overflow from an existing DC.",
        "The driver must come from the client's own words — control, lock-in avoidance, or per-workload optimization.",
        "Demonstration: Fairbanks→Private/control; Atlas & Meridian→Multi-cloud/lock-in; Vela→Hybrid/burst.",
      ],
      feedbackPass:
        "Three scenarios, three different models, each justified by the client's own driver — that's the CV0-004 analysis skill.",
      feedbackFail:
        "Re-read each case for its loudest signal: regulator control → private; two public providers + leverage → multi; existing DC + overflow → hybrid.",
    },
    {
      id: "OBJ-M11",
      title: "Risk & Mitigation Pairing",
      pillar: "P4",
      context:
        "Selecting a model creates residual risks you must control. The four classics: lock-in, bill shock, compliance drift, and skills gaps.",
      task: "Pair each adoption risk with the control that mitigates it.",
      instrument: "risks",
      hints: [
        "Lock-in is answered by exit terms and portability; billing surprises by FinOps; drift by continuous compliance; skill shortfalls by managed services.",
        "Match the control's mechanism to the risk's cause.",
        "Demonstration: lock-in→exit+portability; egress→FinOps; drift→continuous compliance; skills→managed services+training.",
      ],
      feedbackPass:
        "Every recommendation you sign should carry a mitigation column — consultants who skip this deliver time bombs.",
      feedbackFail:
        "Read each mitigation's mechanism: exit terms counter lock-in; egress monitoring counters bill shock; automated checks counter drift; PaaS/SaaS counter skills gaps.",
    },
    {
      id: "OBJ-M12",
      title: "Recommendation Memo",
      pillar: "P4",
      context:
        "The engagement deliverable. Stamp the model you recommend for NorthPeak, map the binding constraints to model roles, and acknowledge the trade-off the board must accept.",
      task: "Stamp the recommended model, select ALL correct requirement mappings, and select the true trade-off.",
      instrument: "memo",
      hints: [
        "Which single model keeps ERP on-prem, gives the CDE dedicated hardware, AND bursts to public?",
        "Four mappings are correct; two are deliberately broken (SaaS-ERP, private-email).",
        "Demonstration: stamp Hybrid; map 1, 2, 3 and 6; trade-off = integration complexity + two skill sets.",
      ],
      feedbackPass:
        "Signed and defensible: hybrid, mapped to NorthPeak's own constraints, trade-off disclosed. This is a complete consultant deliverable.",
      feedbackFail:
        "Re-check: hybrid is the only model that satisfies all five binding constraints at once — and a real memo admits its trade-offs.",
    },
  ];

  const OBJECTIVES_HARD = [
    {
      id: "OBJ-H1",
      title: "Noisy Casefile Triage",
      pillar: "P3",
      context:
        "The full casefile is open: seven documents, and not all of them deserve your pen. Vendor lunches, trade-press fear and old anecdotes are noise. Constraints have authorities behind them.",
      task: "Read the whole casefile, then tag every BINDING constraint across all documents — and nothing else.",
      instrument: "triage",
      hints: ["One nudge maximum — it will cost score. Binding statements trace to a regulator, a QSA, physics, a CFO directive, an SLA commitment, or a capability gap the team admits."],
      feedbackPass:
        "All seven binding constraints, zero noise tagged. You read evidence like the exam wants: authority first, feelings never.",
      feedbackFail:
        "Your set differs from the binding truth. Expected: R1–R4, R7 from the register plus the two evidence-backed facts in the interview notes (D7). The CIO memo, the article and the dashboard preference carry no authority.",
    },
    {
      id: "OBJ-H2",
      title: "Model Elimination",
      pillar: "P2",
      context:
        "Work like a surgeon: eliminate what cannot survive the constraints, and cite the constraint that kills it. Two candidates are already dead on arrival.",
      task: "Eliminate BOTH infeasible pure-model candidates, each with the single binding constraint that rules it out.",
      instrument: "elim",
      hints: ["One nudge maximum — it will cost score. For public-only, find the constraint that physically forbids shared infrastructure. For private-only, find what the Denver DC cannot economically absorb."],
      feedbackPass:
        "Precise elimination with correct citations. What survives — hybrid — is now proven, not guessed.",
      feedbackFail:
        "Citations matter: public-only dies on R2 (QSA-dedicated CDE). Private-only dies on R4 (CapEx freeze) or R7 (6–8× burst economics).",
    },
    {
      id: "OBJ-H3",
      title: "Pattern Selection",
      pillar: "P2",
      context:
        "Five candidate patterns reach the partner's desk. Exactly one survives every binding constraint from your triage.",
      task: "Select the ONE architecture pattern NorthPeak should adopt.",
      instrument: "pattern",
      hints: ["One nudge maximum — it will cost score. The survivor must satisfy R1–R4 and R7 simultaneously."],
      feedbackPass:
        "Hybrid with dedicated CDE + EU public regions + burst. Only this pattern satisfies all seven binding constraints at once.",
      feedbackFail:
        "Test each pattern against R2 (dedicated CDE), R3 (ERP on-prem), R4 (no CapEx) and R7 (burst): only one pattern passes all four.",
    },
    {
      id: "OBJ-H4",
      title: "Placement under Constraints",
      pillar: "P2",
      context:
        "Seven workloads, five targets, zero tolerance: every binding constraint from your triage must hold in the final map. One wrong home breaks a regulation or an SLA.",
      task: "Place ALL seven workloads correctly — the map must violate no binding constraint.",
      instrument: "placeH",
      hints: ["One nudge maximum — it will cost score. EU-resident data has exactly one legal home; the CDE has exactly one compliant home; the ERP has exactly one fast home."],
      feedbackPass:
        "Flawless placement — every regulation, latency bound and SLA holds across the estate.",
      feedbackFail:
        "Audit against the constraints: W3 must be dedicated (R2), W6 must sit in EU regions (R1), W1 must stay next to the scanners (R3/D7), W2+W5 need elastic public US capacity (R7), W4 is commodity SaaS, W7 is disposable public US.",
    },
    {
      id: "OBJ-H5",
      title: "Service-model Assignment",
      pillar: "P3",
      context:
        "Placement done — now the operating model. Team skills from the interview notes decide how much stack the client should keep.",
      task: "Assign the correct service model to each of the four statements.",
      instrument: "service",
      hints: ["One nudge maximum — it will cost score. The nine-person team with no Kubernetes experience buys managed where possible — except where the QSA demands OS-level control."],
      feedbackPass:
        "Managed where possible, controlled where mandated — the service-model split a real architect would sign.",
      feedbackFail:
        "Match statements to stack control: CDE hardening = IaaS; small team deploys code = PaaS; commodity email = SaaS; event-driven + idle-free = FaaS.",
    },
    {
      id: "OBJ-H6",
      title: "SLA & Cost Trade-off",
      pillar: "P3",
      context:
        "Procurement time. The storefront needs ≥99.9% uptime, EU residency is non-negotiable, and the CFO wants variable spend. One plan satisfies all three.",
      task: "Select the provider plan NorthPeak should sign.",
      instrument: "plan",
      hints: ["One nudge maximum — it will cost score. Check regions first (legality), then commitment structure (R4), then whether the SLA clears 99.9%."],
      feedbackPass:
        "Plan B: 99.95% clears the 99.9% bar, US+EU regions satisfy residency, pure metering honors the CapEx freeze. 99.99% looks shiny but the 3-year commitment breaks R4.",
      feedbackFail:
        "Plan A fails residency (US-only). Plan C fails the FY26 variable-spend directive (3-year commitment + reservation). Plan B is the only clean pass.",
    },
    {
      id: "OBJ-H7",
      title: "Risk Register",
      pillar: "P4",
      context:
        "The partner asks for the three risks the EVIDENCE explicitly signals — not the full textbook. Each must carry its mitigation.",
      task: "Select exactly the three risks the casefile evidence signals, then assign each its mitigation.",
      instrument: "riskH",
      hints: ["One nudge maximum — it will cost score. Three of the signals live in R1+R2 (across a boundary), R4+R7 (variable spend on peaks), and the interview notes (team skills)."],
      feedbackPass:
        "The register reads like the casefile: compliance drift across the boundary, burst-driven spend, and the nine-person skills gap — each with a working control.",
      feedbackFail:
        "Expected set: compliance drift (R1+R2 span two environments) → continuous compliance; burst bill growth (R4+R7) → FinOps; skills gap (D7) → managed services + training. Single-region outage is already covered by the DR runbook design; shadow spend and lock-in are real but not evidenced as top-3.",
    },
    {
      id: "OBJ-H8",
      title: "Executive Justification",
      pillar: "P4",
      context:
        "The board memo. Stamp the pattern, map every binding constraint to its role, disclose the trade-off, and prove you can leave the provider if you must.",
      task: "Complete the memo: model, ALL four correct mappings, the true trade-off, and the exit control.",
      instrument: "memoH",
      hints: ["One nudge maximum — it will cost score. Four mappings are correct; two are sabotaged. The exit control is the anti-lock-in clause."],
      feedbackPass:
        "A board-ready memo: defensible selection, constraint-complete mapping, honest trade-off, and a documented exit. This is the competency the exam calls “analyze cloud models to support business needs”.",
      feedbackFail:
        "Re-check the four mappings (EU→EU regions, CDE→hosted private, ERP→on-prem until FY28, peaks→OpEx burst), the integration trade-off, and the portability-based exit strategy.",
    },
    {
      id: "OBJ-H10",
      title: "Precision Models",
      pillar: "P1",
      context:
        "Before the partner signs anything, they probe whether you can tell the models apart at full precision — quoted client phrasing, not textbook lines. Each quote hides exactly one model.",
      task: "Classify each client quote with the model it describes.",
      instrument: "matchH",
      hints: ["One nudge maximum — it will cost score. Two signals per quote: who owns the environment(s), and how many environments/providers are in play."],
      feedbackPass:
        "Full precision — including the hosted-private and orchestrated-mix traps that sink candidates on exam day.",
      feedbackFail:
        "Re-read each quote for ownership and orchestration: dedicated + hosting partner = private; private base + public burst as ONE estate = hybrid; two public providers = multi; co-funded platform under a shared regulator = community; provider-owned multi-tenant = public.",
    },
    {
      id: "OBJ-H9",
      title: "Outage Drill",
      pillar: "P4",
      context:
        "Black Friday, 18:42. The primary public provider's US region fails at peak. Your hybrid estate has a DR runbook — execute it in the right order, and refuse the panic moves.",
      task: "Click the actions in the exact order you would execute them. Select only what should be done.",
      instrument: "drill",
      hints: ["One nudge maximum — it will cost score. Restore revenue first, verify obligations second, communicate and document third."],
      feedbackPass:
        "Textbook incident command: restore service, verify obligations, communicate — and the ERP/hardware panic moves stayed untouched.",
      feedbackFail:
        "Correct sequence: fail over the storefront (a1) → verify EU residency and access (a2) → status updates + post-incident log (a3). Re-platforming the ERP mid-incident or buying hardware is panic, not procedure.",
    },
  ];

  const OBJECTIVES = { medium: OBJECTIVES_MEDIUM, hard: OBJECTIVES_HARD };

  // ---------- Quiz bank ----------
  const QUIZ_MEDIUM = [
    {
      id: "m-q1",
      prompt: "Which deployment model is provider-owned, multi-tenant, and delivered over the internet?",
      options: [
        { id: "a", text: "Private cloud" },
        { id: "b", text: "Public cloud" },
        { id: "c", text: "Hybrid cloud" },
        { id: "d", text: "Community cloud" },
      ],
      answer: "b",
      explanation:
        "Provider ownership + multi-tenancy + internet delivery is the definition of public cloud. Private is dedicated; hybrid is a mix under orchestration; community is shared among organizations with common concerns.",
    },
    {
      id: "m-q2",
      prompt: "As you move from IaaS toward SaaS, the customer's management responsibility…",
      options: [
        { id: "a", text: "Increases" },
        { id: "b", text: "Moves to the regulator" },
        { id: "c", text: "Decreases" },
        { id: "d", text: "Stays identical" },
      ],
      answer: "c",
      explanation:
        "Each step up the ladder transfers more of the stack to the provider. Two duties never transfer: your data and identity/access management.",
    },
    {
      id: "m-q3",
      prompt: "A company runs production on Provider A and analytics on Provider B — both public. This architecture is…",
      options: [
        { id: "a", text: "Multi-cloud" },
        { id: "b", text: "Hybrid cloud" },
        { id: "c", text: "Private cloud" },
        { id: "d", text: "Community cloud" },
      ],
      answer: "a",
      explanation:
        "Two public providers = multi-cloud. Hybrid would require a private/on-premises side integrated with the public side.",
    },
    {
      id: "m-q4",
      prompt: "Overflow capacity bursting from a private base into public regions at peak is a hallmark of…",
      options: [
        { id: "a", text: "Community cloud" },
        { id: "b", text: "Multi-cloud" },
        { id: "c", text: "Single-tenant SaaS" },
        { id: "d", text: "Hybrid cloud" },
      ],
      answer: "d",
      explanation:
        "Cloud bursting — private base, public overflow, one orchestrated estate — is the signature hybrid pattern.",
    },
    {
      id: "m-q5",
      prompt: "Which service model leaves the customer managing only data, identity/access and configuration?",
      options: [
        { id: "a", text: "IaaS" },
        { id: "b", text: "SaaS" },
        { id: "c", text: "FaaS" },
        { id: "d", text: "PaaS" },
      ],
      answer: "b",
      explanation:
        "SaaS hands the entire application to the provider; the customer keeps data, identities, access decisions and configuration.",
    },
    {
      id: "m-q6",
      prompt: "Fourteen clinics under one health-data regulator want a jointly governed shared platform. The best fit is…",
      options: [
        { id: "a", text: "Public cloud" },
        { id: "b", text: "On-premises private" },
        { id: "c", text: "Multi-cloud" },
        { id: "d", text: "Community cloud" },
      ],
      answer: "d",
      explanation:
        "Several organizations with common compliance needs sharing one platform = community cloud, sitting between private and public.",
    },
  ];

  const QUIZ_HARD = [
    {
      id: "h-q1",
      scenario: "Cobalt Health Consortium: 14 clinics, one regulator, one shared platform, members co-fund and co-govern it.",
      prompt: "Which model fits best?",
      options: [
        { id: "a", text: "Public cloud" },
        { id: "b", text: "Multi-cloud" },
        { id: "c", text: "Community cloud" },
        { id: "d", text: "Single-tenant private" },
      ],
      answer: "c",
      explanation:
        "Several organizations + common compliance regime + shared governance = community cloud. Public would lack the shared governance; private would duplicate cost 14×.",
    },
    {
      id: "h-q2",
      scenario: "A fintech with three engineers ships microservices weekly and wants managed runtime and databases — no server or OS work, ever.",
      prompt: "Which service model fits the application tier?",
      options: [
        { id: "a", text: "PaaS" },
        { id: "b", text: "IaaS" },
        { id: "c", text: "SaaS" },
        { id: "d", text: "On-premises private" },
      ],
      answer: "a",
      explanation:
        "PaaS absorbs servers, OS and runtime; the team keeps code and data. IaaS would leave them patching OSes; SaaS would mean buying, not building, their product.",
    },
    {
      id: "h-q3",
      scenario: "A retailer must keep its QSA-mandated cardholder environment on dedicated hardware, absorb 6–8× seasonal peaks, and already owns a data center.",
      prompt: "Which pattern satisfies all three?",
      options: [
        { id: "a", text: "Public cloud only for the estate" },
        { id: "b", text: "Multi-cloud split across two providers" },
        { id: "c", text: "Private on-premises only, no public" },
        { id: "d", text: "Hybrid: dedicated CDE plus public burst" },
      ],
      answer: "d",
      explanation:
        "Dedicated CDE (private) + elastic public burst + existing DC integration = hybrid. Public-only breaks the QSA mandate; private-only cannot economically absorb 8× peaks.",
    },
    {
      id: "h-q4",
      scenario: "Post-merger: divisions run on two different public providers. The CIO wants best-of-breed services and negotiating leverage against both vendors.",
      prompt: "Which model is the CIO describing?",
      options: [
        { id: "a", text: "Hybrid cloud" },
        { id: "b", text: "Multi-cloud" },
        { id: "c", text: "Community cloud" },
        { id: "d", text: "Private cloud" },
      ],
      answer: "b",
      explanation:
        "Two public providers for leverage and best-of-breed is the definition of multi-cloud — no private side is mentioned, so not hybrid.",
    },
    {
      id: "h-q5",
      scenario: "Product thumbnails must resize whenever an image is uploaded; traffic is 40× higher in November; the budget says ~zero cost when idle.",
      prompt: "Which service model fits this task?",
      options: [
        { id: "a", text: "IaaS virtual machines, always on" },
        { id: "b", text: "Reserved private cluster" },
        { id: "c", text: "FaaS functions, event-driven" },
        { id: "d", text: "SaaS email suite" },
      ],
      answer: "c",
      explanation:
        "Event-driven, scale-to-zero, pay-per-invocation is FaaS. A 24/7 VM pays for idle; a dedicated cluster is the opposite of the budget.",
    },
    {
      id: "h-q6",
      scenario: "A regulator forbids customer data from leaving Country X under any circumstance.",
      prompt: "Which decision factor drives the region and model choice?",
      options: [
        { id: "a", text: "SLA tier and uptime" },
        { id: "b", text: "Data sovereignty / residency" },
        { id: "c", text: "Elasticity headroom for peaks" },
        { id: "d", text: "Vendor lock-in and egress" },
      ],
      answer: "b",
      explanation:
        "Residency binds region selection (in-country regions) and sometimes the model itself. SLA tier, elasticity and lock-in are real factors — but none is the one the regulator's prohibition makes binding.",
    },
    {
      id: "h-q7",
      scenario: "A colleague claims: “A private cloud is automatically more secure than public cloud.”",
      prompt: "Evaluate the claim.",
      options: [
        { id: "a", text: "False — security depends on implementation" },
        { id: "b", text: "True — dedicated hardware stops breaches" },
        { id: "c", text: "True — private means isolated by default" },
        { id: "d", text: "False — no cloud can ever be secured" },
      ],
      answer: "a",
      explanation:
        "Control is not security. A misconfigured private cloud is breached as easily as a misconfigured public one; major providers hold deep compliance attestations. What matters is implementation plus the shared responsibility split — which is also why “no cloud can be secured” overstates in the other direction.",
    },
  ];

  const QUIZ = { medium: QUIZ_MEDIUM, hard: QUIZ_HARD };

  // ---------- Quiz stage copy ----------
  const QUIZ_COPY = {
    kicker: "Stage 04 · Competency Review",
    titleHard: "Scenario board",
    titleMedium: "Concept check",
    subHard: "Seven client situations, one at a time. Apply the models — no recall-only items. Each check locks your answer and reveals the reasoning.",
    subMedium: "Six concept questions, one at a time. Each check locks your answer and shows why it matters before you move on.",
    scenario: "scenario",
    concept: "concept",
    check: "Check answer",
    next: "Next question",
    whyRight: "Why it's right: ",
    whyRemember: "Why, and what to remember: ",
    yourAnswerOk: "· your answer ✓",
    yourAnswerNo: "· your answer ✗",
    correct: "correct",
    incorrect: "incorrect",
    lastItem: "Last item checked — seal the review below to open the Debrief.",
    seal: "Seal the review",
    sealed: "Review sealed — open debrief",
    allChecked: "All items checked — seal the review to open the Debrief.",
    notAll: "Answer and check every item — the next question opens after each check.",
    lockedNote: "The Debrief unlocks after the review is sealed.",
    question: "question",
    checked: "checked",
    correctLabel: "correct",
    reviewSealed: "review sealed ·",
  };

  // ---------- Briefing copy ----------
  const BRIEFING = {
    kicker: "Stage 01 · Briefing Room",
    title: "Your first engagement",
    sub: "You are the new cloud strategy analyst at Meridian Advisory Group, a vendor-neutral consultancy. Your principal just dropped a casefile on your desk.",
    letterHead: "MERIDIAN ADVISORY GROUP",
    letterSub: "Cloud Strategy Practice · Internal memo",
    toLabel: "TO:",
    toValue: "You — Cloud Strategy Analyst (new hire)",
    fromLabel: "FROM:",
    fromValue: "Principal Consultant, Cloud Architecture",
    reLabel: "RE:",
    body1: "Welcome aboard. Your first client is ",
    body2: " — ",
    body3: "They asked us one question: ",
    body3em: "“Which cloud model supports our business — and why?” ",
    body4: "This is exactly the competency CompTIA tests on the Cloud+ (CV0-004) exam: ",
    body4strong: "“Analyze cloud models and design solutions to meet business requirements”",
    body4tail:
      " — the top-line skill of Domain 1.0 Cloud Architecture, the exam's heaviest domain at 23%. Model selection drives everything that follows: deployment, security duties, operations and cost.",
    missionH: "Your mission",
    mission: [
      "Learn the five deployment models and the service-model ladder in the Model Compendium.",
      "Work the engagement at the Desk: triage evidence, tag binding constraints, place workloads, stamp decisions, and write the recommendation memo.",
      "Pass the Competency Review, then collect your Debrief & Field Notes.",
    ],
    casefileH: "Casefile contents:",
    casefileT: " documents, from the engagement brief to the cost sheet. Remember the partner's rule — ",
    casefileEm: "boards sign requirements, not enthusiasm.",
    synthNote: "Every document is marked ",
    synthCode: "TRAINING DATA — SYNTHETIC",
    synthTail: ". Fictional client, fictional people, safe figures.",
    cta: "Open the Model Compendium",
    termNote: "New terms arrive dotted and underlined — hover or focus them for one-line definitions, anytime.",
  };

  const COMPENDIUM = {
    kicker: "Stage 02 · Model Compendium",
    title: "Know your clouds before you recommend one",
    sub: "Five deployment models, one service-model ladder, one responsibility split. Everything on the Desk will trace back to this reference — return anytime via the stage rail.",
    modelsH: "The five deployment models",
    ladderH: "The service-model ladder",
    ladderSub: "The deployment model says where workloads live; the service model says who manages the stack. Climb down and the provider absorbs more. The shared responsibility model shifts with every rung — but data, identity and access are always yours.",
    providerManages: "Provider manages",
    customerManages: "Customer manages",
    ladderNote:
      "Where does an on-premises data center sit? Below IaaS — you manage everything from the hardware up. That is the control private cloud can offer, and the burden it carries.",
    glossaryH: "Field glossary",
    cta: "Proceed to the Engagement Desk",
    strengths: "Strengths",
    limits: "Limits",
    fits: "Fits",
    poorFit: "Poor fit",
    examTip: "Exam tip.",
    ownership: "Ownership",
    tenancy: "Tenancy",
    costShape: "Cost shape",
  };

  const DESK_COPY = {
    kicker: "Stage 03 · Engagement Desk · ENG-2417",
    subHard: "The full casefile is open — including two documents that should never have reached your desk.",
    subMedium: "Work the objectives in order; the mentor notes will point you to the right drawer.",
    evidenceBtn: "Evidence",
    objectivesBtn: "Objectives",
    drawerH: "Evidence drawer",
    drawerSubHard: "Full casefile — including two documents that should never have reached your desk. Consultancy rule: authority beats noise.",
    drawerSubMedium: "The client's paper trail. Reading is free; wisdom is choosing what binds you.",
    readLabel: "read",
    trackerH: "Objectives tracker",
    hardFile: " · hard file",
    tagged: "tagged",
    objectivesH: "Objectives",
    complete: "complete",
    upNext: "up next",
    nudgeSpent: "nudge spent",
    hintSpent: (n) => (n > 1 ? n + " hints" : n + " hint"),
    workbench: "Workbench",
    objComplete: "Objective complete",
    checksSuffix: "checks",
    hintsHardLabel: "Nudge (one per engagement — costs score)",
    hintsMediumLabel: "Tiered hints — using them costs stars, never progress",
    nudgeTake: "Take the nudge (−1 star point)",
    nudgeSpentBtn: "Nudge spent",
    hintShown: (n) => "Hint " + n + " shown",
    hintBtn: (n) => "Hint " + n,
    nudgeElsewhere: "The nudge was spent on another objective.",
    checkResults: "Check results",
    nextObjective: "Next objective",
    nextChallenge: "Next challenge",
    looksComplete: "Looks complete — run the check.",
    approved: "Approved",
    rejected: "Rejected",
    nearMiss: "Near-miss review: ",
    again: "Adjust the workbench and check again — wrong answers cost stars only through attempts, never progress.",
    executionQueue: "Your execution queue:",
    queueEmpty: "empty",
    clear: "Clear",
    incident: "Incident · Black Friday · 18:42",
    incidentH: "Primary public provider — US region failure at peak load.",
    incidentSub: "Storefront failing over is covered by the DR runbook. The estate is hybrid: ERP + CDE stay put; storefront, burst and EU workloads run in public regions.",
    queuedNote: "All actions queued — CHECK RESULTS will judge the order and the selection.",
    step1: "Step 1 — select exactly THREE risks (evidence must signal them). Step 2 — assign each a mitigation.",
    step2: (n) => "Step 2 — mitigations (" + n + "/3 selected)",
    signalLabel: "signal:",
    assignNote: "Assign each workload a home. Attribute chips are your evidence; hover a target for its description.",
    serviceNote: "Placement set — now decide how much stack the client keeps. Interview notes (D7) and mandates decide.",
    planNote: "Requirements: storefront SLA ≥ 99.9% · EU residency (R1) · variable spend, no commitments (R4).",
    slaLabel: "SLA: ",
    regionsLabel: "Regions: ",
    commitmentLabel: "Commitment: ",
    memoStampM: "1 — Stamp the model you recommend for NorthPeak Outfitters:",
    memoStampH: "1 — Stamp the pattern (must match your H3 selection):",
    memoMapM: "2 — Select ALL FOUR correct requirement → model mappings:",
    memoMapH: "2 — Select ALL FOUR correct requirement mappings:",
    memoTrade: "3 — Select the TRUE trade-off the board must accept:",
    memoExit: "4 — Select the exit control that keeps the client portable:",
    modelLabel: "Model",
    driverLabel: "Primary driver (from the client's own words)",
    triageNote: (n) => "Tag binding constraints across all documents. Memo lines, articles and preferences can be tagged too — if you can defend them as binding. Tagged so far: ",
    flagsNote: "Tap a line to tag it as a binding constraint. Tap again to untag.",
    kestrelStamp: "1 — Stamp the model that fits Kestrel Analytics:",
    kestrelTag: "2 — Tag every brief line that justifies the choice:",
    costTableCaption: "D4 extract — cost shapes by option (synthetic figures)",
    costQ1: "Q1 — NorthPeak's CFO has frozen capital spend for FY26. Which profile matches a variable, pay-as-you-go cost model?",
    costQ2: "Q2 — Which statement about public-cloud cost is TRUE?",
    elimKiller: "The constraint that kills it:",
    eliminated: "Eliminated",
    eliminate: "Eliminate",
    patternLabel: "Architecture pattern",
    modelFor: (id) => "Model for " + id,
    quoteFor: (id) => "Model for quote " + id,
    classifyFor: (c) => "Classification for " + c,
    placementFor: (w) => "Placement for " + w,
    driverFor: (c) => "Driver for " + c,
    mitigationFor: (r) => "Mitigation for " + r,
    killingFor: (n) => "Killing constraint for " + n,
    answersFor: (n) => "Answers for question " + n,
    loading: "Opening the casefile…",
    loadingAria: "Loading the engagement desk",
    docAria: (code, title) => "Document " + code + ": " + title,
    progressAria: (pct) => "Progress " + pct + "%",
    starsAria: (n) => n + " stars",
    starsOfAria: (n) => n + " of 3 stars",
    stageNavAria: "Engagement stages",
    trackerAria: "Objectives tracker",
    drawerAria: "Evidence drawer",
    riskGroupAria: "Risk selection",
    actionsGroupAria: "Actions to execute in order",
    recModelAria: "Recommended model",
    planGroupAria: "Provider plan",
    q1Label: "Cost question 1",
    q2Label: "Cost question 2",
    mapLabel: "Requirement mappings",
    tradeLabel: "Trade-off",
    exitLabel: "Exit control",
  };

  // Public export
  return {
    PILLARS, PILLAR_LABEL, MODEL_LABELS, STAGE_ORDER, STAGE_META,
    CLIENT, MODE_CARDS, MODE_SELECT_INTRO,
    MODELS, LADDER, GLOSSARY,
    DOCS, KESTREL_DOC,
    TARGETS_M, WORKLOADS_M, TARGETS_H, WORKLOADS_H,
    COST_ROWS, COST_Q1_OPTIONS, COST_Q2_OPTIONS,
    MINI_CASES, RISKS_M, MITIGATIONS_M, RISKS_H, MITIGATIONS_H,
    PLANS, MEMO_MAPPINGS_M, MEMO_TRADEOFFS, MEMO_MAPPINGS_H, MEMO_EXITS,
    PATTERNS, DRILL_ACTIONS, ELIMINATE_MODELS, ELIM_REASONS,
    TENANCY_QS, LADDER_QS, SHARED_QS, CLASSIFY_CASES, SERVICE_QS,
    MATCH_DEFS, MATCH_H_DEFS, MATCH_OPTS, CLASSIFY_OPTS,
    DEBRIEF, NEXT_STEPS, MODAL_COPY, MASTHEAD, GATE_COPY,
    OBJ_FOCUS, QUIZ_FOCUS,
    OBJECTIVES, QUIZ, QUIZ_COPY, BRIEFING, COMPENDIUM, DESK_COPY,
  };
})();
