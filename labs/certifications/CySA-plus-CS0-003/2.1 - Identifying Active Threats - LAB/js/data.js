// ─────────────────────────────────────────────────────────────────────────────
// js/data.js — ALL lab content (The OSINT Bureau · Case 2.1 CRIMSON-CRATE)
// Sources, evidence, observables, boards, quiz banks, glossary. Pure data —
// no logic. Loaded first; every later script reads these constants.
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_META = {
    P1: { name: 'Understand', blurb: 'What it is, how it works, why it matters' },
    P2: { name: 'Recognize', blurb: 'Spot it and analyze it in realistic evidence' },
    P3: { name: 'Detect', blurb: 'Data sources, detections, true vs false positives' },
    P4: { name: 'Mitigate', blurb: 'Controls, sharing decisions, residual risk' },
};

// ─────────────────────────────────────────────────────────────────────────────
// THE OSINT BUREAU — Lab data
// CompTIA CySA+ CS0-003 · Lesson 2.1: Identifying Active Threats
// ALL ORGANIZATIONS, ACTORS, DOMAINS, IPs AND IDENTIFIERS ARE FICTIONAL
// TRAINING DATA. IPs use RFC 5737 documentation ranges. CVE-2025-44107 is an
// invented, clearly-labeled training ID. MITRE ATT&CK technique IDs/names are
// used accurately for defensive education only.
// ─────────────────────────────────────────────────────────────────────────────
// ── Sources (the rack) ───────────────────────────────────────────────────────
const SOURCES = [
    { id: 'social', name: 'Social Pulse', kind: 'Social media', desc: 'Researcher accounts, vendor alerts, scam posts. Fast, noisy, unverified.' },
    { id: 'news', name: 'Wire & Press', kind: 'News articles', desc: 'Mainstream and trade press. Sector impact and scale, rarely raw indicators.' },
    { id: 'blogs', name: 'Research Blogs', kind: 'Blog posts', desc: 'Vendor and independent research. Rich technical detail and IOCs.' },
    { id: 'forums', name: 'Chat & Forums', kind: 'Chat forums', desc: 'Underground markets and chatter. Early warning, heavy noise.' },
    { id: 'paste', name: 'Paste Dumps', kind: 'Paste sites', desc: 'Anonymously pasted data leaks. Often contains exposed credentials.' },
    { id: 'repos', name: 'Code Repositories', kind: 'Code repositories', desc: 'Public commits and kits. Attack tooling leaves public traces.' },
    { id: 'dns', name: 'Domain & WHOIS', kind: 'Domain registry', desc: 'Registrations, nameservers, certificate logs. Infrastructure intent.' },
    { id: 'advisory', name: 'Official Advisories', kind: 'CERT/vendor advisories', desc: 'Curated, corroborated, attributed. The highest-confidence starting point.' },
];
// ── Clips (interactive spans across evidence) ────────────────────────────────
const CLIPS = {
    'c-hash': { id: 'c-hash', label: '9f2b41c7d88e5c1f0a67b2d4e8f3a9c155d0b7e6f4c2a8d1b3e5f7a9c0d2e4f6', obsType: 'hash', confidence: 'high' },
    'c-kit': { id: 'c-kit', label: 'Krateshipper v2', obsType: 'tool', confidence: 'medium' },
    'c-btc': { id: 'c-btc', label: '2.4 BTC', benign: true, benignWhy: 'A price tag is not an observable — it is scam-post window dressing.' },
    'c-11': { id: 'c-11', label: 'at least 11 carriers', benign: true, benignWhy: 'Scale context, not an indicator — useful for impact briefing, useless for detection.' },
    'c-ip77': { id: 'c-ip77', label: '198.51.100.77', obsType: 'ipv4', known: true, confidence: 'high' },
    'c-cdn': { id: 'c-cdn', label: 'cdn.mailroute.net', benign: true, benignWhy: 'Shared newsletter CDN serving many benign senders — blocking it is a classic false positive.' },
    'c-actor': { id: 'c-actor', label: 'CRATE-BROKER', benign: true, benignWhy: 'An intrusion-set (actor) label is context for correlation, not an observable you can detect in logs.' },
    'c-fleet': { id: 'c-fleet', label: 'FleetNode Agent', obsType: 'tool', known: true, confidence: 'medium' },
    'c-price': { id: 'c-price', label: '3.2 BTC', benign: true, benignWhy: 'Another price tag — window dressing, not evidence.' },
    'c-mercer': { id: 'c-mercer', label: 'd.mercer@halvard-logistics.com', obsType: 'email', confidence: 'high' },
    'c-count': { id: 'c-count', label: '412 employee addresses', benign: true, benignWhy: 'Exposure scale, not an indicator. It tells you the blast radius, not what to block.' },
    'c-cred': { id: 'c-cred', label: '$2b$12$KX9fT…', obsType: 'hash', sensitive: true },
    'c-scanner': { id: 'c-scanner', label: '192.0.2.9', benign: true, benignWhy: 'RFC 5737 documentation range used by our own training scanner — treating it as attacker infra is a classic false positive.' },
    'c-track2': { id: 'c-track2', label: 'track-shipment-two.net', obsType: 'domain', confidence: 'medium' },
    'c-url': { id: 'c-url', label: 'https://halvard-portal-secure[.]com/shiptrack/login', obsType: 'url', confidence: 'high' },
    'c-regex': { id: 'c-regex', label: '^shipment[ _-]?#?\\d{4}', obsType: 'hash' },
    'c-hps': { id: 'c-hps', label: 'halvard-portal-secure[.]com', obsType: 'domain', confidence: 'high' },
    'c-date': { id: 'c-date', label: '2026-01-09', benign: true, benignWhy: 'A registration date is context that sharpens the story, not an observable to detect on.' },
    'c-ns1': { id: 'c-ns1', label: 'ns1.cloudspin.net', obsType: 'domain', confidence: 'medium' },
    'c-fraghost': { id: 'c-fraghost', label: 'FRAGHOST LLC', benign: true, benignWhy: 'A registrar org name is WHOIS context — you cannot alert on it in perimeter telemetry.' },
    'c-cve': { id: 'c-cve', label: 'CVE-2025-44107 (fictional training ID)', obsType: 'cve' },
    'c-geo': { id: 'c-geo', label: 'sleeps 24 hours, then beacons', obsType: 'behavior', confidence: 'medium' },
};
// ── Evidence items (13, incl. 4 hard-mode red herrings) ──────────────────────
const EVIDENCE = [
    {
        id: 'e1', sourceId: 'social', title: 'Kit watch post', author: '@MalwareMarta (researcher)', date: '4 days ago',
        segments: [
            'Kit watch: the ', { c: 'c-kit' }, ' phishing kit is circulating again — sample sha256 ',
            { c: 'c-hash' }, '. Tracks to fake carrier portals; expect the usual logistics lures. #threatintel',
        ],
        caseRelevant: true, h1Tag: 'ioc', campaign: true,
        credibility: 'Established researcher, posts reproducible samples. Good corroboration source.',
    },
    {
        id: 'e2', sourceId: 'social', title: 'Breach claim', author: '@CargoLeakz (new account)', date: '2 days ago',
        segments: ['"HOT SALE — Halvard Logistics internal data for ', { c: 'c-btc' }, '. DM me, first buyer takes everything."'],
        caseRelevant: false,
        credibility: 'No samples, no history, crypto-DM sales pitch — classic extortion-scam pattern. Unverified claim: monitor credibility, never amplify.',
    },
    {
        id: 'e3', sourceId: 'news', title: 'File-transfer attacks hit carriers', author: 'The Freight Ledger (trade press)', date: '5 days ago',
        segments: [
            'At least ', { c: 'c-11' }, ' reported intrusions last quarter after crews exploited unpatched managed file-transfer appliances. Investigators link several incidents to one access-broker crew.',
        ],
        caseRelevant: true, h1Tag: 'sector', campaign: true,
        credibility: 'Trade press quoting a carriers association — reliable for sector impact, not for raw indicators.',
    },
    {
        id: 'e4', sourceId: 'news', title: 'Hospital network restores systems', author: 'MedCity Health Wire', date: '1 day ago',
        segments: ['Regional hospital network restores systems after ransomware; patient portal back online.'],
        caseRelevant: false,
        credibility: 'Different sector, zero shared indicators — not our case.',
    },
    {
        id: 'e5', sourceId: 'blogs', title: 'Crimson Crate v2: infrastructure update', author: 'RailFence Security blog', date: '3 days ago',
        segments: [
            'v2 re-activates the known staging host ', { c: 'c-ip77' },
            ' and pairs it with fresh lookalike carrier-portal domains. Note: the same IP also serves ', { c: 'c-cdn' },
            ', a shared newsletter CDN used by many benign senders — measure twice before blocking. Attribution patterns remain consistent with the broker we track as ', { c: 'c-actor' }, '.',
        ],
        caseRelevant: true, h1Tag: 'ioc', campaign: true,
        credibility: 'Vendor research with telemetry; highest-quality technical source in the rack.',
    },
    {
        id: 'e6', sourceId: 'blogs', title: '2025 logistics threat landscape', author: 'Northline Analytics', date: '2 weeks ago',
        segments: [
            'Broker-driven initial access keeps rising in logistics; exploitation of internet-exposed appliances remains the top technical vector; mid-market carriers remain under-reported.',
        ],
        caseRelevant: false,
        credibility: 'Solid strategic context for briefings — but it is trend material, not case evidence.',
    },
    {
        id: 'e7', sourceId: 'forums', title: 'Access-for-sale thread', author: 'GrayGarden /b/access-market', date: '6 days ago',
        segments: [
            '"WTS: foothold access to a logistics company portal (EU region). RMM pre-loaded: ', { c: 'c-fleet' },
            '. Broker: ', { c: 'c-actor' }, ' affiliates only. Price: ', { c: 'c-price' }, '. Escrow via known middleman."',
        ],
        caseRelevant: true, h1Tag: 'target', campaign: true,
        credibility: 'Access-market chatter fits the campaign M.O. Single-source — treat as medium confidence until corroborated.',
    },
    {
        id: 'e8', sourceId: 'forums', title: 'Account spam thread', author: 'GrayGarden /b/misc', date: '1 day ago',
        segments: ['"Selling 1000x game accounts, cheap, weekly restock, vouches inside."'],
        caseRelevant: false,
        credibility: 'Unrelated underground spam.',
    },
    {
        id: 'e9', sourceId: 'paste', title: 'Staff address dump', author: 'DumpPad paste #8841', date: '4 days ago',
        segments: [
            '"halvard-logistics dump part1 — ', { c: 'c-count' },
            ' in full list. First lines: ', { c: 'c-mercer' }, ', bcrypt sample ', { c: 'c-cred' },
            '. Scrape note: pulled via ', { c: 'c-scanner' }, '."',
        ],
        caseRelevant: true, h1Tag: 'target', campaign: true,
        credibility: 'Contains our own staff addresses — first-hand evidence of targeting, and a privacy incident in its own right.',
    },
    {
        id: 'e10', sourceId: 'paste', title: 'Crypto spam paste', author: 'DumpPad paste #8842', date: '1 day ago',
        segments: ['"FREE USDT DOUBLE — send 0.1, get 0.2 back instantly, trusted since 2019."'],
        caseRelevant: false,
        credibility: 'Crypto scam spam.',
    },
    {
        id: 'e11', sourceId: 'repos', title: 'Kit template commit', author: 'github.com/krateshipper-kit/portal-templates', date: '3 days ago',
        segments: [
            'Commit by "n0nsuch": "update config for EU carrier build" — template default domain now ',
            { c: 'c-track2' }, ', harvest path ', { c: 'c-url' }, ', subject regex ', { c: 'c-regex' }, '.',
        ],
        caseRelevant: true, h1Tag: 'ioc', campaign: true,
        credibility: 'Public commit matching the kit family — strong technical corroboration.',
    },
    {
        id: 'e12', sourceId: 'dns', title: 'WHOIS extract', author: 'Registry record', date: '5 days ago',
        segments: [
            'Domain ', { c: 'c-hps' }, ' — created ', { c: 'c-date' },
            ' (days before the first lures), registrar ', { c: 'c-fraghost' },
            ', privacy-protected. Nameserver ', { c: 'c-ns1' },
            ' overlaps infrastructure tagged in the regional advisory.',
        ],
        caseRelevant: true, h1Tag: 'ioc', campaign: true,
        credibility: 'Registry facts: verifiable and timestamped. High-value for infrastructure pivot.',
    },
    {
        id: 'e13', sourceId: 'advisory', title: 'Bulletin B-2026-014: Crimson Crate v2', author: 'Regional CERT (TLP:AMBER excerpt)', date: '2 days ago',
        segments: [
            'Phishing emails with fake "Shipment # Pending" invoices (T1566.001) now paired with links to cloned carrier portals (T1566.002); lookalike domain registration observed (T1583.001); separate incidents involve exploitation of unpatched file-transfer appliances (',
            { c: 'c-cve' }, ') (T1190); post-compromise beaconing over HTTPS (T1071.001). One implant family exits geo-fenced ranges, ',
            { c: 'c-geo' }, ' — recommend monitoring DNS and proxy logs.',
        ],
        caseRelevant: true, h1Tag: 'official', campaign: true,
        credibility: 'Curated, corroborated, attributed. The anchor document for the whole case.',
    },
];
// ── Behaviors (ATT&CK board) ─────────────────────────────────────────────────
const BEHAVIORS = [
    { id: 'b1', label: 'Fake "Shipment # Pending" invoice emails', detail: 'Targets staff with spoofed carrier notices carrying an invoice attachment.', technique: 'T1566.001' },
    { id: 'b2', label: 'Registers lookalike carrier-portal domains', detail: 'Fresh typosquat domains imitating our shipment portal before lures begin.', technique: 'T1583.001' },
    { id: 'b3', label: 'Harvests credentials on a cloned portal page', detail: 'Emails carry links to the cloned "shiptrack/login" page.', technique: 'T1566.002' },
    { id: 'b4', label: 'Exploits the unpatched file-transfer appliance', detail: 'Direct exploitation of CVE-2025-44107 (fictional training ID) on the internet-facing appliance.', technique: 'T1190' },
    { id: 'b5', label: 'Beacons to C2 over HTTPS', detail: 'Implants blend into normal web traffic to the staging host.', technique: 'T1071.001' },
];
const ATTACK_OPTIONS = [
    { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment', tactic: 'Initial Access' },
    { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
    { id: 'T1583.001', name: 'Acquire Infrastructure: Domains', tactic: 'Resource Development' },
    { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
    { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
    { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Stealth (formerly Defense Evasion), Persistence, Privilege Escalation, Initial Access' },
    { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration' },
    { id: 'T1684.001', name: 'Social Engineering: Impersonation', tactic: 'Stealth' },
];
const TELEMETRY_OPTIONS = [
    { id: 'email', label: 'Email gateway logs' },
    { id: 'web', label: 'Web server & WAF logs (appliance)' },
    { id: 'proxy', label: 'Proxy & DNS logs' },
    { id: 'registrar', label: 'Registrar & certificate-transparency monitoring' },
    { id: 'epp', label: 'Endpoint process logs' },
    { id: 'cloud', label: 'Cloud audit logs' },
];
// ── ShareGrid platform (threat-intelligence sharing) ─────────────────────────
const GRID_RECORD = {
    name: 'Crimson Crate',
    recordId: 'CMP-2025-114',
    firstSeen: '2025-11-04',
    actor: 'CRATE-BROKER — intrusion set (access broker)',
    motivation: 'Sells foothold access to ransomware affiliates',
    targets: 'Regional logistics & freight operators',
    confidence: 'High — corroborated by 4 partner reports + vendor telemetry',
    v1Summary: 'v1 (Nov): mass phishing with fake shipment-invoice ATTACHMENTS (T1566.001) pointing at track-shipment-one[.]com; staging host 198.51.100.42; kit sha256 4d1a…b902; affiliate tooling: FleetNode Agent RMM.',
    v1Iocs: [
        'track-shipment-one.com — domain (sinkholed 2025-12-02)',
        '198.51.100.42 — staging IPv4 (v1, retired)',
        '198.51.100.77 — staging IPv4 (v1-era, dormant — re-activated in v2)',
        '4d1a…b902 — kit sha256 (v1 build)',
        'FleetNode Agent — RMM tooling used by affiliates',
    ],
    v1Ttps: ['T1566.001 — Spearphishing Attachment', 'T1105 — Ingress Tool Transfer'],
};
const TIMELINE_CHANGES = [
    { id: 't1', label: 'v2 adds the lookalike domain halvard-portal-secure[.]com', true: true, evolve: 'registrar' },
    { id: 't2', label: 'v2 adds a credential-harvest page reached by email links', true: true, evolve: 'proxy' },
    { id: 't3', label: 'v2 narrows targeting from mass spam to named ops staff', true: true, evolve: 'awareness' },
    { id: 't4', label: 'v2 adds exploitation of the file-transfer appliance', true: true, evolve: 'patch' },
    { id: 't5', label: 'v2 switches C2 traffic from HTTPS to ICMP', true: false },
    { id: 't6', label: 'The crew rebranded to "Crimson Container"', true: false },
    { id: 't7', label: 'v2 moves targeting to the energy sector', true: false },
];
const EVOLVE_OPTIONS = [
    { id: 'registrar', label: 'Watch registrar & certificate-transparency feeds for new lookalikes' },
    { id: 'proxy', label: 'Tune proxy/mail-link defenses against the harvest page' },
    { id: 'awareness', label: 'Send targeted awareness to the named ops roles' },
    { id: 'patch', label: 'Patch / virtual-patch the file-transfer appliance' },
    { id: 'cloud', label: 'Review cloud audit logs' },
];
const DISPATCH_PACKAGES = [
    { id: 'p1', label: 'Sanitized IOC pack — 6 observables, no victim data', to: 'isac' },
    { id: 'p2', label: 'Raw paste dump incl. employee credentials', to: 'withhold' },
    { id: 'p3', label: 'Campaign TTP summary for peer CSIRTs', to: 'misp' },
    { id: 'p4', label: 'Unverified @CargoLeakz breach claim', to: 'monitor' },
];
const DISPATCH_DESTINATIONS = [
    { id: 'isac', label: 'Sector ISAC via TAXII' },
    { id: 'misp', label: 'Partner platform (MISP community)' },
    { id: 'internal', label: 'Internal SOC watchlist only' },
    { id: 'monitor', label: 'Do not share — monitor credibility' },
    { id: 'withhold', label: 'Withhold — internal only (contains PII)' },
];
const TLP_ARTIFACTS = [
    { id: 'a1', label: 'Sanitized IOC pack for sector partners', to: 'green' },
    { id: 'a2', label: 'Raw paste dump with staff credentials', to: 'red' },
    { id: 'a3', label: 'Partner TTP summary for CSIRT peers', to: 'amber' },
    { id: 'a4', label: 'Quoted public CERT advisory (its already-public web version)', to: 'clear' },
    { id: 'a5', label: 'Internal draft listing affected staff names', to: 'amber' },
];
const TLP_LEVELS = [
    { id: 'red', label: 'TLP:RED', desc: 'Strict — named recipients only, never spread' },
    { id: 'amber', label: 'TLP:AMBER', desc: 'Limited — recipient org and its clients, need-to-know only' },
    { id: 'green', label: 'TLP:GREEN', desc: 'Community — share within your sector/community' },
    { id: 'clear', label: 'TLP:CLEAR', desc: 'Public — may be shared freely' },
];
// ── Case-file boards ─────────────────────────────────────────────────────────
const INTAKE_CARDS = [
    { id: 'i1', text: 'Forum user is selling VPN access to "a logistics firm in our region".', cls: 'active' },
    { id: 'i2', text: 'Our appliance model has a published critical CVE (fictional CVE-2025-44107).', cls: 'vuln' },
    { id: 'i3', text: 'Sector report: logistics targeting up 40% year over year.', cls: 'context' },
    { id: 'i4', text: 'Paste dump publishes 412 staff email addresses from our domain.', cls: 'active' },
    { id: 'i5', text: 'A dev server is exposed to the Internet and unpatched.', cls: 'vuln' },
    { id: 'i6', text: 'An anonymous social account claims we were breached — no proof offered.', cls: 'context' },
];
const INTAKE_CLASSES = [
    { id: 'active', label: 'Active threat', desc: 'Observed in motion against us or our sector — monitor now' },
    { id: 'vuln', label: 'Vulnerability', desc: 'Internal weakness that could be exploited — remediate' },
    { id: 'context', label: 'Context / unverified', desc: 'Background trend or unproven claim — track, don\u2019t act yet' },
];
const LIFECYCLE_PHASES = [
    { id: 'lc-plan', label: 'Planning & direction' },
    { id: 'lc-coll', label: 'Collection' },
    { id: 'lc-proc', label: 'Processing' },
    { id: 'lc-anal', label: 'Analysis' },
    { id: 'lc-disse', label: 'Dissemination' },
    { id: 'lc-feed', label: 'Feedback' },
];
const LIFECYCLE_CORRECT = ['lc-plan', 'lc-coll', 'lc-proc', 'lc-anal', 'lc-disse', 'lc-feed'];
const DISCIPLINE_SNIPPETS = [
    { id: 's1', text: 'Captured network telemetry showing a beacon to a staging host.', cls: 'sigint' },
    { id: 's2', text: 'A recruited reseller insider confirms who the broker sells to.', cls: 'humint' },
    { id: 's3', text: 'A public forum thread offering portal access to the highest bidder.', cls: 'osint' },
    { id: 's4', text: 'Satellite imagery of a warehouse tied to the cash-out operation.', cls: 'geoint' },
    { id: 's5', text: 'Shell-company transaction records funding the crew.', cls: 'finint' },
];
const DISCIPLINES = [
    { id: 'osint', label: 'OSINT — open sources' },
    { id: 'humint', label: 'HUMINT — human sources' },
    { id: 'sigint', label: 'SIGINT — signals/network data' },
    { id: 'geoint', label: 'GEOINT — geospatial' },
    { id: 'finint', label: 'FININT — financial' },
];
const ALTITUDE_PRODUCTS = [
    { id: 'alt1', text: 'IOC pack — domains, IPs, hashes for blocklist automation', cls: 'tactical' },
    { id: 'alt2', text: 'CRATE-BROKER profile — reseller model, motivation, target sectors', cls: 'operational' },
    { id: 'alt3', text: '2025 logistics threat landscape — broker access + appliance exploits', cls: 'strategic' },
];
const ALTITUDES = [
    { id: 'tactical', label: 'Tactical', desc: 'Day-to-day IOCs for the SOC — hours to weeks' },
    { id: 'operational', label: 'Operational', desc: 'Campaigns & actor capability — months' },
    { id: 'strategic', label: 'Strategic', desc: 'Trends & risk posture — quarters to years' },
];
const HARDENING_OPTIONS = [
    { id: 'h1', text: 'Block the lookalike domains and sender addresses at DNS filter and email gateway', good: true },
    { id: 'h2', text: 'Patch the file-transfer appliance; restrict its admin interface', good: true },
    { id: 'h3', text: 'Deploy email-gateway rules for "Shipment #" lure patterns + link rewriting', good: true },
    { id: 'h4', text: 'Targeted awareness refresh for freight-ops staff on shipment phishing', good: true },
    { id: 'h5', text: 'Disable all Internet egress company-wide', good: false },
    { id: 'h6', text: 'Replace the firewall vendor', good: false },
    { id: 'h7', text: 'Re-IP the whole fleet and rotate the ASN', good: false },
];
const RESPONSE_STEPS = [
    'r1', 'r2', 'r3', 'r4', 'r5', 'r6',
];
const RESPONSE_CORRECT = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
/** Fixed SHUFFLED display orders — remaining-button rows must never render in the
 *  correct sequence (that would be a giveaway). */
const RESPONSE_DISPLAY = ['r3', 'r1', 'r6', 'r2', 'r5', 'r4'];
const CHAIN_DISPLAY = ['b4', 'b2', 'b5', 'b3'];
const RESPONSE_ACTIONS = [
    { id: 'r1', label: 'Block indicators: lookalike domains, senders, hashes (contain)' },
    { id: 'r2', label: 'Patch the file-transfer appliance; restrict exposure' },
    { id: 'r3', label: 'Retro-hunt the IoCs across 90 days of email/proxy/DNS logs' },
    { id: 'r4', label: 'Enable watchlist detections and alert routing (monitor)' },
    { id: 'r5', label: 'Sanitize findings; share with the sector ISAC via TAXII' },
    { id: 'r6', label: 'Debrief; update playbooks and awareness content' },
];
// ── Feed sweep (Hard H1) ─────────────────────────────────────────────────────
const H1_TOKENS = [
    { id: 'ioc', label: 'IOC / technical match' },
    { id: 'official', label: 'Official corroboration' },
    { id: 'target', label: 'Targeting / sale evidence' },
    { id: 'sector', label: 'Sector impact' },
];
// ── Executive brief (Hard H9) ────────────────────────────────────────────────
const BRIEF_OPTIONS = [
    { id: 'w1', label: '"Block these 6 IoCs tonight and patch the appliance." (a to-do list)' },
    { id: 'w2', label: '"An access broker is actively selling logistics footholds; our sector is a standing target — sustained monitoring, patch discipline and sector sharing cut our exposure." (trend + posture)' },
    { id: 'w3', label: '"Crimson Crate v2 switched from attachments to a cloned-portal link page." (one campaign update)' },
];
const RISK_OPTIONS = [
    { id: 'k1', label: 'Appliance stays unpatched until the change window — residual exploitation risk' },
    { id: 'k2', label: 'Partner intel quality varies; unverified claims can drive false positives and fatigue' },
    { id: 'k3', label: 'Employees find awareness training dull' },
    { id: 'k4', label: 'Cyber-insurance renewal is due next quarter' },
    { id: 'k5', label: 'The board prefers quarterly reporting cadence' },
];
// ── Tripwire (Hard H7) ───────────────────────────────────────────────────────
const RULE_FIELDS = [
    { id: 'dest_domain', label: 'dest_domain' },
    { id: 'email_subject', label: 'email_subject' },
    { id: 'uri_path', label: 'uri_path' },
    { id: 'source_ip', label: 'source_ip' },
];
const RULE_OPS = [
    { id: 'equals', label: 'equals' },
    { id: 'startswith', label: 'startswith' },
    { id: 'contains', label: 'contains' },
];
const RULE_VALUES = [
    { id: 'halvard-portal-secure[.]com', label: 'halvard-portal-secure[.]com' },
    { id: 'track-shipment-two.net', label: 'track-shipment-two.net' },
    { id: 'Shipment #', label: 'Shipment #' },
    { id: 'shipment', label: 'shipment' },
    { id: '/shiptrack/login', label: '/shiptrack/login' },
    { id: '192.0.2.9', label: '192.0.2.9' },
];
const LOG_LINES = [
    { id: 'L-A', time: '12:04', text: 'proxy: GET https://halvard-portal-secure[.]com/shiptrack/login from 10.2.14.9', alert: true },
    { id: 'L-B', time: '12:06', text: 'mail: newsletter from updates@vendornews.cdn.mailroute.net', alert: false },
    { id: 'L-C', time: '12:09', text: 'mail: subject "Shipment #4471 — customs fee due" with link', alert: true },
    { id: 'L-D', time: '12:11', text: 'proxy: GET track.carrierone.example/tracking?id=88', alert: false },
    { id: 'L-E', time: '12:14', text: 'scanner: 192.0.2.9 POST /login on our own portal', alert: false },
    { id: 'L-F', time: '12:17', text: 'mail: subject "Parcel update — your delivery window changed"', alert: false },
    { id: 'L-G', time: '12:19', text: 'dns: query track-shipment-two.net A record', alert: true },
];
// ── Glossary ─────────────────────────────────────────────────────────────────
const GLOSSARY = [
    { term: 'Active threat', def: 'A threat currently in motion against your organization or sector — observed, not hypothetical; it must be identified and monitored.' },
    { term: 'OSINT', def: 'Open-Source Intelligence — collecting and analyzing publicly available information (social media, blogs, news, forums, registries).' },
    { term: 'Threat intelligence (CTI)', def: 'Evidence-based knowledge about adversaries, produced through the intelligence lifecycle, to inform defensive decisions.' },
    { term: 'IOC', def: 'Indicator of Compromise — an observable (domain, IP, hash, email) tied to malicious activity.' },
    { term: 'Atomic indicator', def: 'Simplest indicator form: a plain observable value such as a domain, IP address or email address.' },
    { term: 'Computed indicator', def: 'Indicator derived from data through an algorithm — file/credential hashes, regular expressions.' },
    { term: 'Behavioral indicator', def: 'A pattern composed of multiple atomic/computed indicators describing behavior, e.g. beacon-then-sleep timing.' },
    { term: 'STIX', def: 'Structured Threat Information eXpression — the JSON format for exchanging threat intel objects (simplified here).' },
    { term: 'TAXII', def: 'Trusted Automated eXchange of Intelligence Information — the transport protocol that moves STIX content between systems.' },
    { term: 'MISP', def: 'Open-source threat-intelligence sharing platform used by CSIRT communities to exchange events and attributes.' },
    { term: 'ISAC', def: 'Information Sharing & Analysis Center — sector-based sharing body (e.g. a Logistics-ISAC); ISAO is the broader category.' },
    { term: 'TLP 2.0', def: 'Traffic Light Protocol handling rules: RED strict, AMBER limited, GREEN community, CLEAR public.' },
    { term: 'Confidence level', def: 'Analyst rating of how trustworthy an indicator/report is, based on source quality and corroboration.' },
    { term: 'Indicator fatigue', def: 'Degraded detection quality caused by too many low-quality/stale indicators — avoided by confidence scoring and aging.' },
    { term: 'RMM', def: 'Remote Monitoring and Management — legitimate administrator tooling that attackers abuse for persistence and remote control (the fictional FleetNode Agent is one).' },
    { term: 'CTI lifecycle', def: 'Planning & direction → Collection → Processing → Analysis → Dissemination → Feedback.' },
    { term: 'TTP', def: 'Tactics, Techniques, and Procedures — the "how" of an adversary\u2019s behavior; ATT&CK is the shared catalog that names them.' },
    { term: 'SIEM', def: 'Security Information and Event Management — the central platform that collects and correlates your own log telemetry for detection.' },
    { term: 'WAF', def: 'Web Application Firewall — inspects and filters HTTP traffic to an application; rules can "virtual-patch" a flaw until the real fix ships.' },
    { term: 'CT log', def: 'Certificate Transparency log — a public, append-only record of every TLS certificate issued; new entries expose fresh infrastructure days before lures.' },
    { term: 'IR', def: 'Incident Response — the structured handling of a confirmed or suspected security incident (contain, eradicate, recover, learn).' },
    { term: 'DPO', def: 'Data Protection Officer — the role accountable for personal-data compliance; engaged whenever exposed credentials or PII surface.' },
    { term: 'ASN', def: 'Autonomous System Number — a network operator\u2019s routing identity; "rotating the ASN" means re-homing the whole network, a drastic and disruptive move.' },
];
// ── Quiz ─────────────────────────────────────────────────────────────────────
const QUIZ_MEDIUM = [
    {
        id: 'qm1', anchor: 'OBJ-M1', q: 'What makes a threat an ACTIVE threat (as opposed to a vulnerability or a trend)?',
        options: [
            'It is any weakness inside our own systems, regardless of whether it is patched',
            'It is any attack technique described in a vendor\u2019s annual report',
            'It is happening against our sector right now, so it must be monitored',
            'It is any malware sample kept in a research sandbox archive',
        ], correct: 2,
        explain: 'Active = in motion against us or our sector right now — which is exactly why it demands continuous monitoring. Option 1 is a vulnerability (our weakness), option 2 is background reading (a trend), option 4 is a stored sample (context). The active threat is what those become when someone weaponizes them against carriers this week.',
    },
    {
        id: 'qm2', anchor: 'OBJ-M4', q: 'Which of these is NOT an OSINT source?',
        options: ['A paste-site leak dump', 'A public WHOIS registry record', 'A vendor research blog', 'Your own SIEM alert queue'],
        correct: 3,
        explain: 'OSINT is publicly available information anyone could collect. Your SIEM alerts are your own private telemetry — closed-source by definition, even though they are excellent evidence. Paste dumps, WHOIS records and vendor blogs are all published for anyone to read, which is exactly what makes them open-source.',
    },
    {
        id: 'qm3', anchor: 'OBJ-M2', q: 'Which phase of the CTI lifecycle comes FIRST?',
        options: [
            'Raw data is pulled from the chosen sources',
            'Requirements are defined before any data is gathered',
            'Cleaned data is merged into one working picture',
            'Analysts turn processed data into finished judgments',
        ],
        correct: 1,
        explain: 'Planning & direction opens the lifecycle: intelligence requirements decide what to collect and why. The distractors describe the later phases — pulling raw data is Collection, cleaning and merging is Processing, turning data into judgments is Analysis — and none of them can start before the requirements exist, or you drown in undirected data.',
    },
    {
        id: 'qm4', anchor: 'OBJ-M9', q: 'What is the relationship between STIX and TAXII?',
        options: [
            'STIX transports data; TAXII formats it',
            'They are competing formats from different vendors',
            'STIX formats the intelligence; TAXII transports it',
            'Both are SIEM query languages',
        ], correct: 2,
        explain: 'STIX is the structured language (the "what" — indicators, campaigns, intrusion-sets), TAXII is the transfer protocol (the "how it travels"). Option 1 reverses the roles, option 2 is wrong because OASIS designed them as a pair, and neither is a SIEM query language.',
    },
    {
        id: 'qm5', anchor: 'OBJ-M6', q: 'A sha256 hash of a malicious file is which type of indicator?',
        options: ['Atomic', 'Computed', 'Behavioral', 'Strategic'],
        correct: 1,
        explain: 'Computed indicators are derived from data by an algorithm — hashes and regular expressions. Plain values like a domain or IP are atomic; multi-step patterns like beacon-then-sleep timing are behavioral. "Strategic" is an intelligence altitude, not an indicator type.',
    },
    {
        id: 'qm6', anchor: 'OBJ-M9', q: 'Why should an organization join its sector ISAC?',
        options: [
            'Peers see the adversary first, so shared intel gives early warning',
            'It replaces in-house monitoring so analysts can rotate to other duties',
            'It guarantees public attribution of whoever attacks the sector next',
            'It is legally mandated for every logistics operator in the EU',
        ], correct: 0,
        explain: 'Sharing platforms turn one organization\u2019s incident into everyone\u2019s early warning — origin, methods, targets. Option 2 is the classic trap: membership complements, never replaces, your own monitoring. Attribution is rarely guaranteed, and ISAC membership is voluntary good practice, not an EU legal mandate.',
    },
];
const QUIZ_HARD = [
    {
        id: 'qh1', anchor: 'OBJ-H1', q: 'A paste dump publishes 400+ employee emails. What is the BEST first move?',
        options: [
            'Repost the list on the internal wiki so staff can self-check',
            'Block the paste site at the firewall and close the case',
            'Verify scope, alert IR, reset exposed credentials, involve the DPO',
            'Send an abuse report to the paste site and wait for a reply',
        ], correct: 2,
        explain: 'An exposure dump is both intel and a privacy incident: verify, scope, contain (credential resets), and involve the privacy owner — never republish. Option 1 spreads the PII further, option 2 changes nothing (the data is already out), option 4 alone is too slow and passive for exposed credentials.',
    },
    {
        id: 'qh2', anchor: 'OBJ-H3', q: 'A partner feed sends an IOC with LOW confidence and a 10-month-old timestamp. What do you do?',
        options: [
            'Push it straight onto the firewall blocklist because being safe beats being sorry',
            'Discard it immediately — low confidence means the data is wrong anyway',
            'Ask the partner to delete and then re-issue the indicator with better data',
            'Corroborate it with other sources; if kept, watchlist it with an expiry',
        ], correct: 3,
        explain: 'Low confidence + stale age is the recipe for indicator fatigue and false positives — but low confidence does not mean WRONG, so discarding (option 2) throws away a lead. Corroborate first; if it survives, keep it on the watchlist with aging rules. Never auto-block stale low-confidence intel.',
    },
    {
        id: 'qh3', anchor: 'OBJ-H4', q: 'In STIX 2.1, which object type best represents the crew behind a campaign?',
        options: ['indicator', 'intrusion-set', 'attack-pattern', 'identity'],
        correct: 1,
        explain: 'STIX models actor groups as intrusion-set objects; ATT&CK "groups" map to intrusion-sets. attack-pattern models a TTP, indicator models a detection-ready observable, and identity models an organization — none of those is the crew itself.',
    },
    {
        id: 'qh4', anchor: 'OBJ-H5', q: 'You want the EARLIEST possible warning of new lookalike domains. Which telemetry wins?',
        options: [
            'Registrar & CT-log monitoring — it sees the domain at registration',
            'Proxy logs, which catch users the moment they visit the lookalike',
            'Email gateway logs, which catch lures containing the new domain',
            'Endpoint logs, which catch the payload after someone takes the bait',
        ], correct: 0,
        explain: 'Certificates are published to CT logs the moment they are issued — days or weeks before any lure is sent. Options 2\u20134 all fire only after a human interacts with the malicious infrastructure; the earlier you see it in the chain, the cheaper and safer the action.',
    },
    {
        id: 'qh5', anchor: 'OBJ-H3', q: 'The staging IP 198.51.100.77 also serves a shared newsletter CDN. What is the right call?',
        options: [
            'Block the IP at once — a little collateral damage is an acceptable trade-off for safety',
            'Do not block: shared hosting means likely false positive — monitor and block precise domains',
            'Block it after business hours so any user impact lands outside the peak time',
            'Drop the indicator entirely — an IP address you cannot safely block is useless to us',
        ], correct: 1,
        explain: 'Shared infrastructure means blocking hurts benign senders (classic false positive) while the actor simply migrates. But dropping it entirely (option 4) wastes context: keep the IP on monitor, alert on connections, and block the precise domains and hashes instead. Timing (option 3) does not fix collateral damage.',
    },
    {
        id: 'qh6', anchor: 'OBJ-H6', q: 'A peer sends a TLP:AMBER report. Which action is compliant?',
        options: [
            'Quote it in the public blog post the team writes each month',
            'Post the full report in the all-staff chat channel for visibility',
            'Forward it to an ISAC from another sector so they can prepare too',
            'Share it on a need-to-know basis within your organization and its clients',
        ], correct: 3,
        explain: 'FIRST TLP 2.0: AMBER = limited disclosure, need-to-know within the recipient organization and its clients. Option 1 is public (CLEAR-only), option 3 leaves your org+clients circle entirely, and option 2 fails the need-to-know test even though it stays inside the org — AMBER is need-to-know, not broadcast.',
    },
    {
        id: 'qh7', anchor: 'OBJ-H9', q: 'The board asks: "Are we safe from Crimson Crate?" Best answer?',
        options: [
            'No — residual risk remains while the appliance waits; monitoring and patching continue',
            'Yes — we blocked every indicator within the hour, so the case is closed for good',
            'Yes for now — the actor is very unlikely to ever learn that our company exists',
            'Yes — our firewall vendor\u2019s enterprise contract guarantees protection against this crew',
        ], correct: 0,
        explain: 'Honest posture reporting names actions taken, monitoring in place, and the residual risk you accept — boards decide better with truth than comfort. Option 2 overclaims permanence (campaigns evolve — v2 proved it), option 3 tempts fate (brokers scan whole sectors, not chosen victims), and vendors do not guarantee protection.',
    },
];
// ── Objectives ───────────────────────────────────────────────────────────────
