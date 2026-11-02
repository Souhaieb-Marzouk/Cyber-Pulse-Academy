/**
 * CyberLab: CompTIA CySA+ CS0-003 — Lesson 14.3 "Implementing Controls to Prevent Attacks"
 * ---------------------------------------------------------------------------
 * LAB DOSSIER (embedded provenance):
 *  - Input: CERT_CHAPTER (single source). MITRE_INPUT / CYBERSECURITY_KEYWORDS not provided → none used.
 *  - Family: Certification chapter → emphasis "Mitigate (deep) + Detect (verify)",
 *    pillar weighting: Mitigate 6/12 (Medium), Understand 2, Analyze 2, Detect 2.
 *    Detect is exercised via coverage-gap detection, control-verification design and
 *    misconfiguration hunting (H7/H5) — justified because the chapter's exam objective
 *    (CS0-003 2.4 "Given a scenario, implement controls to mitigate attacks") is prevention-centric.
 *  - Assumption: Lesson 14.3 maps to CS0-003 exam objective 2.4 attack types
 *    (malware, password, application, web, crypto, wireless, protocol abuse, infrastructure)
 *    and their mitigation checklists, per the LESSON_DETAIL's mapping/checklist mandate.
 *  - MITRE data: technique + mitigation IDs verified against attack.mitre.org.
 *    Controls that are SDLC/protocol practices without a formal ATT&CK mitigation ID are
 *    explicitly labeled "SDLC practice" or "cf. M-xxxx" (simplified, per H2).
 *  - All client data, domains, hosts and incidents are SYNTHETIC TRAINING DATA.
 * ---------------------------------------------------------------------------
 * STATIC PORT: content is carried over 1:1 from the original framework lab
 * (src/lib/lab/cysa143/data.ts). Types were stripped; data and wording are
 * identical. All data lives here; logic lives in objectives.js.
 */

/* ================================ ATTACK CLASSES ================================ */

const ATTACK_CLASSES = [
  {
    id: 'malware',
    name: 'Malware & Ransomware',
    short: 'Malware',
    icon: 'bug',
    definition:
      'Malicious code — viruses, trojans, worms, ransomware, rootkits — delivered via phishing, removable media, software supply chains, or unpatched services. Ransomware encrypts data and extorts payment.',
    variants: ['Ransomware (encrypt + extort)', 'Trojan / info-stealer', 'Worm propagation', 'Fileless in-memory code'],
    techniques: ['T1204 · User Execution', 'T1486 · Data Encrypted for Impact', 'T1490 · Inhibit System Recovery'],
    chainNote: 'Arrives via T1566 Phishing or an exploited service (Initial Access → Execution), then drives toward Impact.',
    primary: ['patching', 'av-edr', 'allowlisting', 'code-signing'],
    acceptable: ['backup'],
    redFlags: ['csrf-tokens', 'wpa3-enterprise', 'rate-limiting', 'param-queries'],
  },
  {
    id: 'password',
    name: 'Password & Credential Attacks',
    short: 'Credential',
    icon: 'key-round',
    definition:
      'Attacks that obtain or guess valid credentials: brute force, password spraying, credential stuffing with breached lists, and pass-the-hash reuse of stolen NTLM hashes.',
    variants: ['Brute force / guessing', 'Password spraying', 'Credential stuffing', 'Pass-the-hash'],
    techniques: ['T1110 · Brute Force (.001–.004)', 'T1550.002 · Pass the Hash'],
    chainNote: 'Credential Access — the pivot point into Privilege Escalation and Lateral Movement.',
    primary: ['mfa', 'password-policy', 'lockout', 'cred-protection'],
    acceptable: [],
    redFlags: ['waf', 'input-validation', 'rogue-ap-detection', 'output-encoding'],
  },
  {
    id: 'application',
    name: 'Application Attacks',
    short: 'Application',
    icon: 'terminal',
    definition:
      'Server-side exploitation of software flaws: SQL injection, OS command injection, insecure deserialization, buffer overflows — usually against internet-facing applications.',
    variants: ['SQL injection', 'OS command injection', 'Buffer / heap overflow', 'Insecure deserialization'],
    techniques: ['T1190 · Exploit Public-Facing Application', 'T1505.003 · Web Shell (follow-on)'],
    chainNote: 'Initial Access / Execution — a successful injection commonly yields a web shell and persistence.',
    primary: ['input-validation', 'param-queries', 'waf', 'exploit-protection'],
    acceptable: [],
    redFlags: ['output-encoding', 'csrf-tokens', 'mfa', 'rogue-ap-detection', 'rate-limiting'],
  },
  {
    id: 'web',
    name: 'Web Client & Session Attacks',
    short: 'Web client',
    icon: 'globe',
    definition:
      'Attacks on the browser and its session: cross-site scripting (XSS), cross-site request forgery (CSRF), clickjacking, and drive-by downloads from hostile pages.',
    variants: ['Stored / reflected XSS', 'CSRF', 'Clickjacking', 'Drive-by download'],
    techniques: ['T1059.007 · JavaScript/JScript', 'T1189 · Drive-by Compromise'],
    chainNote: 'Drive-by compromise lands at Initial Access; tokens stolen with XSS become Valid Accounts.',
    primary: ['output-encoding', 'csrf-tokens', 'waf', 'patching'],
    acceptable: ['av-edr'],
    redFlags: ['param-queries', 'mfa', 'disable-wps', 'cred-protection'],
  },
  {
    id: 'crypto',
    name: 'Cryptographic Attacks',
    short: 'Crypto',
    icon: 'lock',
    definition:
      'Attacks that break or bypass encryption: legacy algorithms, protocol downgrades, reduced key spaces, poor key management, and stolen keys or certificates.',
    variants: ['Downgrade to SSLv3 / legacy TLS', 'Reduced key space', 'Stale or leaked keys', 'Weak cipher suites'],
    techniques: ['T1600 · Weaken Encryption', 'T1553.002 · Subvert Trust Controls: Code Signing'],
    chainNote: 'Weakened crypto enables Credential Access and Collection by interception, bypassing host defenses.',
    primary: ['strong-crypto-config', 'key-management', 'tls-in-transit'],
    acceptable: ['enc-at-rest'],
    redFlags: ['csrf-tokens', 'av-edr', 'rogue-ap-detection', 'input-validation'],
  },
  {
    id: 'wireless',
    name: 'Wireless Attacks',
    short: 'Wireless',
    icon: 'wifi',
    definition:
      'Attacks on radio networks: rogue and evil-twin access points, WPS PIN cracking, deauthentication with handshake capture, and sniffing of weakly protected traffic.',
    variants: ['Rogue / evil-twin AP', 'WPS PIN cracking', 'Deauth + handshake capture', 'Rogue devices on the LAN'],
    techniques: ['Related · T1557 Adversary-in-the-Middle', 'Related · T1040 Network Sniffing'],
    chainNote: 'A wireless foothold is an on-premises position for AiTM and lateral movement.',
    primary: ['wpa3-enterprise', 'rogue-ap-detection', 'disable-wps'],
    acceptable: ['nac'],
    redFlags: ['param-queries', 'csrf-tokens', 'waf', 'dlp'],
  },
  {
    id: 'protocol',
    name: 'Protocol Abuse',
    short: 'Protocol',
    icon: 'network',
    definition:
      'Misuse of trusted protocols: DNS tunneling for command-and-control, email spoofing and phishing, legacy SMB exploitation, LLMNR/NBT-NS poisoning.',
    variants: ['DNS tunneling / C2 over DNS', 'Email spoofing & phishing', 'SMBv1 exploitation', 'LLMNR/NBT-NS poisoning'],
    techniques: ['T1071.004 · Application Layer Protocol: DNS', 'T1566 · Phishing', 'T1021.002 · SMB/Admin Shares'],
    chainNote: 'Protocol abuse powers both Command & Control (DNS) and Initial Access (spoofed email).',
    primary: ['egress-filtering', 'dns-filtering', 'email-auth', 'disable-legacy-services'],
    acceptable: ['segmentation'],
    redFlags: ['csrf-tokens', 'rogue-ap-detection', 'enc-at-rest', 'lockout'],
  },
  {
    id: 'infrastructure',
    name: 'Network & Infrastructure Attacks',
    short: 'Infrastructure',
    icon: 'server',
    definition:
      'Attacks on the network fabric itself: denial-of-service floods, ARP poisoning and man-in-the-middle, IP/MAC spoofing, and unrestricted lateral movement on flat networks.',
    variants: ['DDoS flood', 'ARP poisoning / MITM', 'IP & MAC spoofing', 'Flat-network lateral movement'],
    techniques: ['T1498 · Network Denial of Service', 'T1557.002 · ARP Cache Poisoning'],
    chainNote: 'Disruption (Impact) or interception (Credential Access); flat networks amplify every other technique.',
    primary: ['segmentation', 'nips', 'rate-limiting', 'nac'],
    acceptable: ['tls-in-transit'],
    redFlags: ['code-signing', 'output-encoding', 'csrf-tokens', 'password-policy'],
  },
];

/* ================================ CONTROL CATALOG ================================ */

const FAMILIES = ['Endpoint', 'Identity', 'AppSec', 'Network', 'Data & Crypto', 'Wireless'];

const CONTROLS = [
  // --- Endpoint ---
  { id: 'patching', name: 'Patch Management', family: 'Endpoint', mid: 'M1051 · Update Software', desc: 'Timely OS, app and firmware patching closes the known-vulnerability door before exploits arrive.', configNote: 'Fleet compliance 91% · 30-day SLA · WSUS + Intune', deployable: true },
  { id: 'av-edr', name: 'Antivirus / EDR', family: 'Endpoint', mid: 'M1049 · Antivirus/Antimalware', desc: 'Signature plus behavior engines detect and block malicious code on endpoints.', configNote: 'Agents on 99.2% of fleet · behavior engine enabled', deployable: true },
  { id: 'allowlisting', name: 'Application Allowlisting', family: 'Endpoint', mid: 'M1038 · Execution Prevention', desc: 'Only approved executables may run — a denylist can never keep up with new malware.', configNote: 'Not deployed · procurement blocked for 2 quarters', deployable: true },
  { id: 'code-signing', name: 'Code Signing Enforcement', family: 'Endpoint', mid: 'M1045 · Code Signing', desc: 'Reject unsigned or untrusted binaries; raises the cost of dropping tooling. Note: stolen or misused certificates have been abused before (T1553.002).', configNote: 'Policy drafted, not enforced', deployable: true },
  { id: 'backup', name: 'Immutable Offline Backup', family: 'Endpoint', mid: 'M1053 · Data Backup', desc: 'Does not stop malware — limits ransomware IMPACT by guaranteeing a restorable, isolated copy.', configNote: '3-2-1 scheme · last restore test passed', deployable: true },
  { id: 'dlp', name: 'Data Loss Prevention', family: 'Endpoint', mid: 'M1057 · Data Loss Prevention', desc: 'Guards data leaving the organization. Limits exfiltration impact — it does not prevent the attack classes in this register.', configNote: 'Monitor-only pilot per GRC approval until Q3 — functioning as designed', deployable: true },
  // --- Identity ---
  { id: 'mfa', name: 'Multi-Factor Authentication', family: 'Identity', mid: 'M1032 · Multi-factor Authentication', desc: 'A stolen password alone is no longer enough — the single highest-value control against credential attacks.', configNote: 'Enforced for VPN & OWA · Exceptions: group All-Staff-Bypass (312 users) · SMS fallback allowed', deployable: true, hardBroken: true },
  { id: 'password-policy', name: 'Password Policy', family: 'Identity', mid: 'M1027 · Password Policies', desc: 'Length plus breach-screening requirements shrink the space that guessing and stuffing can win.', configNote: 'Legacy 8-character policy · no breach screening', deployable: true },
  { id: 'lockout', name: 'Lockout & Account Use Policies', family: 'Identity', mid: 'M1036 · Account Use Policies', desc: 'Threshold lockout and throttling blunt brute force and spraying campaigns.', configNote: 'No lockout configured on legacy AD', deployable: true },
  { id: 'cred-protection', name: 'Credential Access Protection', family: 'Identity', mid: 'M1043 · Credential Access Protection', desc: 'LSA protection / Credential Guard — blocks pass-the-hash and LSASS credential dumping.', configNote: 'LSA protection off on legacy servers', deployable: true },
  // --- AppSec ---
  { id: 'input-validation', name: 'Input Validation', family: 'AppSec', mid: 'SDLC practice', desc: 'Server-side validation and rejection of malformed input — first structural line against injection.', configNote: 'Ad-hoc per developer; validation framework not adopted', deployable: true },
  { id: 'param-queries', name: 'Parameterized Queries', family: 'AppSec', mid: 'SDLC practice', desc: 'Prepared statements separate code from data — makes SQL injection structurally impossible. The root-cause fix.', configNote: 'Legacy portal uses concatenated query strings', deployable: true },
  { id: 'output-encoding', name: 'Output Encoding + CSP', family: 'AppSec', mid: 'SDLC practice · cf. M1021', desc: 'Context-aware output encoding plus a Content-Security-Policy neutralizes XSS payloads.', configNote: 'Not adopted; CSP absent', deployable: true },
  { id: 'csrf-tokens', name: 'Anti-CSRF Tokens', family: 'AppSec', mid: 'SDLC practice', desc: 'Per-session tokens (with SameSite cookies) stop forged cross-site requests.', configNote: 'Framework tokens disabled in legacy portal', deployable: true },
  { id: 'waf', name: 'Web Application Firewall', family: 'AppSec', mid: 'Compensating control · cf. M1021', desc: 'Filters malicious HTTP in front of applications — a compensating layer, not a code fix.', configNote: 'Procurement stalled at legal review', deployable: true },
  { id: 'exploit-protection', name: 'Exploit Protection', family: 'AppSec', mid: 'M1050 · Exploit Protection', desc: 'ASLR, DEP and control-flow guards raise the cost of memory-corruption exploits.', configNote: 'Baseline not rolled out', deployable: true },
  // --- Network ---
  { id: 'segmentation', name: 'Network Segmentation', family: 'Network', mid: 'M1030 · Network Segmentation', desc: 'Zones and micro-segments contain lateral movement and shield crown-jewel assets.', configNote: 'Flat /16 — segmentation program unfunded', deployable: true },
  { id: 'nips', name: 'Network IPS', family: 'Network', mid: 'M1031 · Network Intrusion Prevention', desc: 'Signature and anomaly engine that should BLOCK exploit and C2 traffic on the wire.', configNote: 'Mode: detect-only · blocking disabled per change #4471 · signatures current', deployable: true, hardBroken: true },
  { id: 'egress-filtering', name: 'Egress Filtering', family: 'Network', mid: 'M1037 · Filter Network Traffic', desc: 'Restrict outbound destinations so implanted malware cannot phone home freely.', configNote: 'Allow-all outbound on core firewall', deployable: true },
  { id: 'dns-filtering', name: 'DNS Filtering', family: 'Network', mid: 'M1037 · Filter Network Traffic', desc: 'Resolve only vetted domains; log and block tunneling-shaped queries.', configNote: 'ISP resolvers only — no filtering layer', deployable: true },
  { id: 'rate-limiting', name: 'Rate Limiting / Anti-DoS', family: 'Network', mid: 'cf. M1037', desc: 'Throttling plus scrubbing services absorb volumetric flood attacks.', configNote: 'No CDN / scrubbing contract', deployable: true },
  { id: 'nac', name: 'Network Access Control', family: 'Network', mid: 'cf. M1035', desc: '802.1X posture checks keep unknown devices off the LAN.', configNote: 'Not deployed', deployable: true },
  { id: 'email-auth', name: 'Email Authentication (SPF/DKIM/DMARC)', family: 'Network', mid: 'cf. M1054 · protocol hardening', desc: 'Cryptographic origin checks stop spoofed senders at the gateway.', configNote: 'SPF pass · DKIM signed · DMARC p=none — upgrade scheduled Q1 (gap, not failure)', deployable: true },
  { id: 'disable-legacy-services', name: 'Disable Legacy Services/Protocols', family: 'Network', mid: 'M1042 · Disable or Remove Feature', desc: 'Turn off SMBv1, LLMNR and unused ports — removes protocol-abuse footholds.', configNote: 'SMBv1 still enabled on 40 legacy hosts', deployable: true },
  // --- Data & Crypto ---
  { id: 'tls-in-transit', name: 'Encryption in Transit (TLS)', family: 'Data & Crypto', mid: 'M1041 · Encrypt Sensitive Information', desc: 'Protects data on the wire — defeats passive sniffing; it is not a fix for a broken cipher config.', configNote: 'TLS 1.2+ on edge · HSTS enabled', deployable: true },
  { id: 'enc-at-rest', name: 'Encryption at Rest', family: 'Data & Crypto', mid: 'M1041 · Encrypt Sensitive Information', desc: 'Protects stolen media and backups. NOTE: it cannot save data from a broken cipher configuration.', configNote: 'Laptops only; database volumes unencrypted', deployable: true },
  { id: 'strong-crypto-config', name: 'Strong Crypto Configuration', family: 'Data & Crypto', mid: 'M1054 · Software Configuration', desc: 'Disable SSLv3 and legacy TLS; mandate modern AEAD suites and forward secrecy.', configNote: 'Legacy TLS 1.0 still accepted on 2 internal apps', deployable: true },
  { id: 'key-management', name: 'Key & Certificate Management', family: 'Data & Crypto', mid: 'cf. M1041', desc: 'Rotation schedules, HSM storage, inventory — a key that never rotates is a key already lost.', configNote: 'No rotation calendar; certificate inventory manual', deployable: true },
  // --- Wireless ---
  { id: 'wpa3-enterprise', name: 'WPA3-Enterprise / 802.1X', family: 'Wireless', mid: 'cf. M1032 / M1035', desc: 'Per-user authentication and modern handshakes replace shared PSKs — an evil twin cannot reuse a captured hash.', configNote: 'WPA2-PSK with shared passphrase', deployable: true },
  { id: 'rogue-ap-detection', name: 'Rogue AP Detection (WIDS)', family: 'Wireless', mid: 'Detection control', desc: 'Continuously scans the spectrum for spoofed or rogue access points.', configNote: 'WIDS disabled', deployable: true },
  { id: 'disable-wps', name: 'Disable WPS', family: 'Wireless', mid: 'M1042 · Disable or Remove Feature', desc: 'The WPS PIN is brute-forceable in hours — turn it off fleet-wide.', configNote: 'WPS disabled on all 14 APs (2022 audit)', deployable: true },
];

const CONTROL_MAP = Object.fromEntries(CONTROLS.map(function (c) { return [c.id, c]; }));

/* Initial estate: what Meridian has DEPLOYED today (state, not student mapping). */
const ESTATE_INITIAL = {
  patching: true,
  'av-edr': true,
  'tls-in-transit': true,
  mfa: true,
  backup: true,
  dlp: true,
  nips: true,
  'email-auth': true,
  'disable-wps': true,
};
for (const c of CONTROLS) if (!(c.id in ESTATE_INITIAL)) ESTATE_INITIAL[c.id] = false;

/* ================================ SCENARIO / BRIEFING ================================ */

const CASE_NO = 'CYSA-14.3-001';
const CLIENT_NAME = 'Meridian Logistics';
const BUREAU_NAME = 'AEGIS ASSURANCE BUREAU';

const BRIEFING = {
  title: 'Case File CYSA-14.3-001',
  classification: 'TRAINING EXERCISE — SYNTHETIC DATA ONLY',
  narrative: [
    `Three freight and logistics firms in the sector were hit in one quarter: one lost dispatch operations for nine days to ransomware, one lost customer accounts to a credential-stuffing run, and one is still cleaning SQL-injection web shells off its quoting portal. The board of ${CLIENT_NAME} (fictional client) has read the news and wants more than antivirus receipts — it wants proof that its controls actually map to the attacks that matter.`,
    `You are a defensive controls analyst with the Aegis Assurance Bureau (fictional). Your engagement: a Defense Controls Audit. Using the checklist method from CySA+ Lesson 14.3, you will map mitigations to the eight attack classes, score the client's live estate for coverage, close the worst gaps, and verify that deployed controls actually function.`,
    `Everything you see — hosts, logs, domains, incidents — is synthetic training data. The method, the control logic, and the MITRE mappings are real. Treat the lesson's core promise as your brief: a mitigation-to-attack map is a checklist that reveals in minutes whether a control estate is comprehensive, or where it falls short in obvious ways.`,
  ],
  scope: [
    'Enumerate the eight attack classes in the client register',
    'Map each class to its prevention checklist (the mitigation→attack matrix)',
    'Score the deployed estate for coverage and expose the worst gap',
    'Remediate with root-cause-first prioritization and phase sequencing',
    'Verify deployed controls with concrete evidence sources',
  ],
  examRelevance:
    'CS0-003 Domain 2 (Vulnerability Management), objective 2.4 — "Given a scenario, implement controls to mitigate attacks." The checklist-mapping skill is tested directly and underpins scenarios across Domains 1 and 3.',
};

/* ================================ KNOWLEDGE CORE ================================ */

const METHOD_STEPS = [
  {
    n: 1,
    title: 'Enumerate the attack classes',
    body: 'List the attack families your organization realistically faces (here: the CS0-003 2.4 register of eight). You cannot map mitigations to attacks you never named.',
  },
  {
    n: 2,
    title: 'Catalog the available controls',
    body: 'Inventory every control you could deploy, with what it actually does — patching removes known flaws, MFA breaks credential reuse, encoding neutralizes XSS payloads.',
  },
  {
    n: 3,
    title: 'Map the checklist per class',
    body: 'For each attack class, mark every control that defends against it. Precision matters in both directions: an unmapped defense is a hidden gap, and an over-mapped one is false comfort.',
  },
  {
    n: 4,
    title: 'Score coverage, find gaps',
    body: 'Coverage = deployed controls ÷ the class checklist. The score makes "are we comprehensive?" a number instead of a feeling, and surfaces obvious shortfalls instantly.',
  },
  {
    n: 5,
    title: 'Close gaps, then verify',
    body: 'Prioritize root-cause fixes over compensating layers, sequence by exposure and effort, and confirm each deployed control with real evidence — a control that silently fails is a gap wearing a green badge.',
  },
];

const MITRE_TABLE = [
  { mid: 'M1032', name: 'Multi-factor Authentication' },
  { mid: 'M1027', name: 'Password Policies' },
  { mid: 'M1036', name: 'Account Use Policies' },
  { mid: 'M1043', name: 'Credential Access Protection' },
  { mid: 'M1049', name: 'Antivirus/Antimalware' },
  { mid: 'M1038', name: 'Execution Prevention (allowlist)' },
  { mid: 'M1045', name: 'Code Signing' },
  { mid: 'M1051', name: 'Update Software' },
  { mid: 'M1053', name: 'Data Backup' },
  { mid: 'M1050', name: 'Exploit Protection' },
  { mid: 'M1048', name: 'Application Isolation and Sandboxing' },
  { mid: 'M1021', name: 'Restrict Web-Based Content' },
  { mid: 'M1041', name: 'Encrypt Sensitive Information' },
  { mid: 'M1054', name: 'Software Configuration' },
  { mid: 'M1037', name: 'Filter Network Traffic' },
  { mid: 'M1031', name: 'Network Intrusion Prevention' },
  { mid: 'M1030', name: 'Network Segmentation' },
  { mid: 'M1035', name: 'Limit Access to Resource Over Network' },
  { mid: 'M1042', name: 'Disable or Remove Feature or Program' },
  { mid: 'M1057', name: 'Data Loss Prevention' },
];

const REAL_EXAMPLES = [
  {
    title: 'WannaCry (2017)',
    body: 'Self-propagating ransomware exploiting unpatched SMBv1 (EternalBlue). The checklist verdict was brutal: patch management (M1051) plus disabling legacy services (M1042) would have closed the door entirely.',
    classes: 'Malware · Protocol abuse',
  },
  {
    title: 'Equifax breach (2017)',
    body: 'Attackers exploited an unpatched Apache Struts flaw on an internet-facing portal. One line in the patching checklist, missed for months — the mapping exists precisely so a gap this obvious cannot hide.',
    classes: 'Application attacks',
  },
  {
    title: 'MOVEit Transfer (2023)',
    body: 'Mass SQL injection against a managed file-transfer product. Where code fixes lagged, WAFs acted as compensating controls — a textbook picture of layered mitigation while the root cause is being closed.',
    classes: 'Application attacks',
  },
  {
    title: 'Colonial Pipeline (2021)',
    body: 'Entry via a dormant VPN account without MFA, impact from ransomware. Two checklist failures with famous consequences: MFA (M1032) on remote access, and segmented, tested backups (M1053/M1030) to blunt impact.',
    classes: 'Password · Malware · Infrastructure',
  },
];

const GLOSSARY = [
  { term: 'Mitigation', def: 'A control or practice that limits or prevents an attack technique from succeeding.' },
  { term: 'Defense in depth', def: 'Layering multiple, overlapping controls so one failure never equals a breach.' },
  { term: 'Compensating control', def: 'A substitute safeguard (e.g., a WAF) that reduces risk while the root-cause fix is pending.' },
  { term: 'Coverage gap', def: 'An attack class whose checklist has deployed controls missing — the audit’s core finding.' },
  { term: 'Residual risk', def: 'The risk that remains after controls are applied; never zero, so it must be monitored.' },
  { term: 'Input validation', def: 'Server-side checking and rejection of malformed or hostile input before processing.' },
  { term: 'Output encoding', def: 'Transforming output so browsers treat it as data, not executable script (anti-XSS).' },
  { term: 'Parameterized query', def: 'A prepared statement that separates SQL code from user data, preventing injection.' },
  { term: 'Allowlist', def: 'An execution model where only explicitly approved software may run (vs. blocking known-bad).' },
  { term: 'Code signing', def: 'Cryptographic verification of software publisher identity before execution.' },
  { term: 'DMARC', def: 'Email policy layer over SPF and DKIM that tells receivers what to do with failed auth.' },
  { term: '802.1X / WPA3-Enterprise', def: 'Per-user network authentication replacing shared pre-shared keys.' },
  { term: 'Network segmentation', def: 'Partitioning the network into zones so movement and blast radius are contained.' },
  { term: 'Attack surface', def: 'The set of points an attacker can try to enter or extract data from.' },
];

/* ================================ OBJECTIVES ================================ */

const OBJECTIVES = {
  medium: [
    {
      id: 'OBJ-M1',
      pillar: 'Understand',
      text: 'Match all eight attack classes to their correct definitions in the Register’s Match-up Tray.',
      anchor: 'CS0-003 2.4 attack types — class definitions',
      where: 'Audit Desk → Register → Match-up Tray',
      hints: [
        'Read each attack card in the Register first — the variants listed on every card echo its definition.',
        'Definition keywords: "encrypt + extort" is ransomware (malware); "breached lists" is credential stuffing (password class).',
        'DNS tunneling belongs to protocol abuse; rogue AP to wireless; ARP poisoning to infrastructure.',
      ],
    },
    {
      id: 'OBJ-M2',
      pillar: 'Mitigate',
      text: 'Mark the full prevention checklist for Malware & Ransomware — every defending control, none that don’t belong.',
      anchor: '2.4 mitigation mapping: malware → patching, AV/EDR, allowlisting, code signing (M1051/M1049/M1038/M1045)',
      where: 'Audit Desk → Checklist Matrix → focus Malware & Ransomware',
      hints: [
        'Open the Checklist Matrix and focus Malware & Ransomware.',
        'Think: what stops code from running at all? What catches what still runs? What closes the delivery door?',
        'The four: Patch Management, Antivirus/EDR, Application Allowlisting, Code Signing. Backups earn partial credit — they limit impact, not infection.',
      ],
    },
    {
      id: 'OBJ-M3',
      pillar: 'Mitigate',
      text: 'Build the credential-attack checklist, then enter the MITRE mitigation ID for Multi-Factor Authentication.',
      anchor: '2.4 mapping: password attacks → M1032/M1027/M1036/M1043; ATT&CK T1110',
      where: 'Checklist Matrix → focus Password & Credential Attacks',
      hints: [
        'Focus Password & Credential Attacks — the Identity family of the catalog holds most of the answer.',
        'MFA, Password Policy, Lockout & Account Use Policies, and Credential Access Protection (LSA/Credential Guard).',
        'The ATT&CK mitigation ID for Multi-Factor Authentication is M1032.',
      ],
    },
    {
      id: 'OBJ-M4',
      pillar: 'Analyze',
      text: 'Complete the Application Attacks variant drill (map each variant to its control), then mark the class’s full checklist.',
      anchor: '2.4 variants: SQLi / command injection / memory corruption and their distinct fixes',
      where: 'Checklist Matrix → focus Application Attacks → Variant Drill',
      hints: [
        'The Variant Drill cards under the Application focus pair each attack variant with its specific fix.',
        'SQL injection dies at prepared statements; command injection dies at server-side input validation; memory corruption meets Exploit Protection (ASLR/DEP).',
        'Checklist: Input Validation, Parameterized Queries, WAF, Exploit Protection. Output encoding is for XSS — a classic wrong answer here.',
      ],
    },
    {
      id: 'OBJ-M5',
      pillar: 'Mitigate',
      text: 'Mark the full prevention checklist for Web Client & Session Attacks (XSS, CSRF).',
      anchor: '2.4 mapping: web attacks → output encoding/CSP, CSRF tokens, WAF, patching',
      where: 'Checklist Matrix → focus Web Client & Session Attacks',
      hints: [
        'Ask what stops a malicious script from executing in the victim’s browser, and what stops a forged request from being trusted.',
        'Encoded output defeats XSS; per-session tokens defeat CSRF; a WAF filters the rest; patched browsers shrink the drive-by surface.',
        'Checklist: Output Encoding + CSP, Anti-CSRF Tokens, WAF, Patch Management.',
      ],
    },
    {
      id: 'OBJ-M6',
      pillar: 'Analyze',
      text: 'Complete the Cryptographic Attacks variant drill, then mark the class’s full checklist.',
      anchor: '2.4 mapping: crypto attacks → strong config, key management, TLS (M1054/M1041); T1600',
      where: 'Checklist Matrix → focus Cryptographic Attacks → Variant Drill',
      hints: [
        'The drill pairs each crypto variant with its fix — downgrades, stale keys, interception.',
        'Downgrades are killed by disabling legacy TLS; leaked keys by rotation and HSM storage; interception by encrypting transit.',
        'Checklist: Strong Crypto Configuration, Key & Certificate Management, TLS in Transit. Encryption at rest earns partial credit only.',
      ],
    },
    {
      id: 'OBJ-M7',
      pillar: 'Mitigate',
      text: 'Mark the full prevention checklist for Wireless Attacks.',
      anchor: '2.4 mapping: wireless → WPA3/802.1X, WIDS, disable WPS',
      where: 'Checklist Matrix → focus Wireless Attacks',
      hints: [
        'Look in the Wireless family of the catalog.',
        'What replaces a shared passphrase? What spots a fake access point? What removes the brute-forceable PIN path?',
        'Checklist: WPA3-Enterprise/802.1X, Rogue AP Detection, Disable WPS. NAC earns partial credit.',
      ],
    },
    {
      id: 'OBJ-M8',
      pillar: 'Detect',
      text: 'Mark the Protocol Abuse checklist, then choose the data source that would expose DNS tunneling.',
      anchor: '2.4 mapping: protocol abuse → M1037 filtering, email auth, M1042; detection via DNS telemetry (T1071.004)',
      where: 'Checklist Matrix → focus Protocol Abuse → Analyst Note',
      hints: [
        'Protocol abuse rides legitimate services — so the checklist filters what those services may carry.',
        'Checklist: Egress Filtering, DNS Filtering, Email Authentication, Disable Legacy Services. Segmentation earns partial credit.',
        'Tunneling is loud in DNS telemetry: TXT-record floods, NXDOMAIN spikes, absurdly long subdomains. The resolver logs are the evidence source.',
      ],
    },
    {
      id: 'OBJ-M9',
      pillar: 'Mitigate',
      text: 'Mark the full prevention checklist for Network & Infrastructure Attacks.',
      anchor: '2.4 mapping: infrastructure → M1030/M1031, rate limiting, NAC',
      where: 'Checklist Matrix → focus Network & Infrastructure Attacks',
      hints: [
        'Fabric attacks need fabric controls — the Network family.',
        'What contains movement? What blocks exploit traffic on the wire? What absorbs floods? What screens new devices?',
        'Checklist: Network Segmentation, Network IPS, Rate Limiting/Anti-DoS, NAC.',
      ],
    },
    {
      id: 'OBJ-M10',
      pillar: 'Detect',
      text: 'Run the Coverage Scan in the Estate tab and identify the worst-covered attack class.',
      anchor: 'Lesson core skill: checklist scoring exposes whether controls are comprehensive',
      where: 'Audit Desk → Estate → Run Coverage Scan',
      hints: [
        'Press Run Coverage Scan, then compare the eight coverage bars.',
        'Coverage = deployed controls ÷ the class checklist. The worst bar is the one with nothing deployed from its checklist.',
        'Application attacks score 0% — no input validation, no parameterized queries, no WAF, no exploit protection is deployed.',
      ],
    },
    {
      id: 'OBJ-M11',
      pillar: 'Mitigate',
      text: 'Remediate: enable the three highest-priority missing controls for that worst class, then re-scan to verify.',
      anchor: '2.4 remediation: root-cause fixes + compensating layer, verified by re-scoring',
      where: 'Audit Desk → Estate → toggles → re-run Coverage Scan',
      hints: [
        'Enable controls with the toggles in the Estate, then press Run Coverage Scan again.',
        'Root cause first: fix the code path (input validation + parameterized queries); then add the compensating layer (WAF).',
        'Enable Input Validation, Parameterized Queries, and WAF — the Application bar should jump to 75%.',
      ],
    },
    {
      id: 'OBJ-M12',
      pillar: 'Understand',
      text: 'Select the statement that correctly explains why residual risk remains even on a fully covered matrix.',
      anchor: 'Defense-in-depth principle and continuous verification (lesson framing)',
      where: 'Audit Desk → Estate → Residual Risk statement (bottom card)',
      hints: [
        'Ask what can still go wrong when every cell of the map is green.',
        'Controls misconfigure and decay over time; attackers chain techniques across classes.',
        'The correct statement begins "No control is perfect…" — layers must overlap AND be verified continuously.',
      ],
    },
  ],
  hard: [
    {
      id: 'OBJ-H1',
      pillar: 'Analyze',
      text: 'Read all six briefs in the Incident Feed and flag the three that show confirmed current hostile activity — not noise, not blocked one-offs.',
      anchor: '2.4 triage: recognize active attack classes in noisy evidence',
      where: 'Audit Desk → Register → Incident Feed',
      hints: ['Three briefs describe hostile action with confirmed current activity; the other three are operational noise or fully blocked one-offs.'],
    },
    {
      id: 'OBJ-H2',
      pillar: 'Mitigate',
      text: 'Complete the full defense checklist: mark every defending control for all eight classes — full sets, zero red flags.',
      anchor: '2.4 full mitigation→attack mapping (the lesson’s core deliverable)',
      where: 'Audit Desk → Checklist Matrix → all eight classes → CHECK in Ledger',
      hints: ['Every class needs its FULL primary set and zero red-flag controls — the CHECK result lists per-class issues.'],
    },
    {
      id: 'OBJ-H3',
      pillar: 'Analyze',
      text: 'Audit IT management’s five malware claims: accept the true ones, reject the two that overstate a control’s guarantee.',
      anchor: '2.4 control limitations: what code signing, DLP and allowlisting actually guarantee',
      where: 'Audit Desk → Register → Claims Review (Hard)',
      hints: ['Two claims confuse impact-limiting controls with prevention, or overstate a cryptographic guarantee.'],
    },
    {
      id: 'OBJ-H4',
      pillar: 'Mitigate',
      text: 'Sequence the remediation program: assign all six work orders to Immediate, 30-day, or 90-day.',
      anchor: '2.4 implementation sequencing by exposure and effort',
      where: 'Audit Desk → Register → Remediation Board (Hard)',
      hints: ['Ask for each: does it stop bleeding this week, need a code or procurement sprint, or require a multi-quarter program?'],
    },
    {
      id: 'OBJ-H5',
      pillar: 'Detect',
      text: 'Design the verification: match each of the five controls to the evidence that proves it actually works.',
      anchor: 'Control effectiveness verification — data sources per control',
      where: 'Audit Desk → Register → Verification Matrix (Hard)',
      hints: ['Match each control to the log or report that would visibly CHANGE if that control silently failed.'],
    },
    {
      id: 'OBJ-H6',
      pillar: 'Mitigate',
      text: 'Budget triage: fund exactly three of six candidates to cover the classes under active attack — root-cause fixes beat compensating layers.',
      anchor: '2.4 prioritization under constraint; compensating vs. root cause',
      where: 'Audit Desk → Register → Budget Triage (Hard)',
      hints: ['Breadth first: one root-cause control per actively-attacked class beats three layers on one class. A WAF is compensating — the code fix is the root cause.'],
    },
    {
      id: 'OBJ-H7',
      pillar: 'Detect',
      text: 'Hunt the phantom controls: find the two deployed controls that are NOT functioning as intended and flag them in the Estate.',
      anchor: 'Detection of control failure — misconfiguration review (verify, don’t trust)',
      where: 'Audit Desk → Estate → Inspect config of every enabled control → flag',
      hints: ['Read every config line. Look for an exceptions group and for a mode that only alerts.'],
    },
    {
      id: 'OBJ-H8',
      pillar: 'Understand',
      text: 'MITRE crosswalk: match each artifact to its correct ATT&CK technique ID.',
      anchor: 'ATT&CK technique accuracy (T1110.004, T1190, T1071.004, T1557.002, T1486)',
      where: 'Audit Desk → Register → MITRE Crosswalk (Hard)',
      hints: ['Stuffing is sub-technique .004 of T1110; DNS C2 is application-layer protocol T1071.004.'],
    },
    {
      id: 'OBJ-H9',
      pillar: 'Understand',
      text: 'Sign-off: complete the three-part final audit statement — residual risk, first verification, and the segmentation M-ID.',
      anchor: 'Synthesis: residual risk + verification sequencing + MITRE mitigation recall',
      where: 'Audit Desk → Register → Audit Sign-off (Hard)',
      hints: ['M1030. And pick the verification that would catch the very control you found broken in the Estate.'],
    },
  ],
};

/* ================================ MATCH-UP TRAY (OBJ-M1) ================================ */

const DEF_OPTION_ORDER = ['web', 'infrastructure', 'malware', 'crypto', 'protocol', 'password', 'wireless', 'application'];

/* ================================ VARIANT DRILLS (OBJ-M4 / M6) ================================ */

const APP_DRILL = {
  options: ['exploit-protection', 'param-queries', 'output-encoding', 'input-validation', 'code-signing', 'waf'],
  variants: [
    { id: 'v1', text: 'SQL injection against the quote-search form', answer: 'param-queries' },
    { id: 'v2', text: 'OS command injection via a crafted upload filename', answer: 'input-validation' },
    { id: 'v3', text: 'Heap overflow in a document-converter service', answer: 'exploit-protection' },
  ],
};

const CRYPTO_DRILL = {
  options: ['tls-in-transit', 'key-management', 'enc-at-rest', 'strong-crypto-config', 'av-edr', 'csrf-tokens'],
  variants: [
    { id: 'c1', text: 'Connections downgraded to SSLv3 / legacy TLS', answer: 'strong-crypto-config' },
    { id: 'c2', text: 'Keys issued in 2019, never rotated, stored on a file share', answer: 'key-management' },
    { id: 'c3', text: 'Passive interception of credentials on the wire', answer: 'tls-in-transit' },
  ],
};

const DNS_SOURCE_OPTIONS = [
  { id: 'dns-logs', text: 'DNS resolver query logs (TXT / NXDOMAIN anomalies)' },
  { id: 'usb', text: 'USB device insertion history from the endpoints' },
  { id: 'wpa', text: 'WPA handshake captures from the wireless controller' },
  { id: 'cpu', text: 'CPU utilization graphs from the monitoring stack' },
];
const DNS_SOURCE_ANSWER = 'dns-logs';

const RESIDUAL_OPTIONS = [
  {
    id: 's1',
    text: 'If every attack class has at least three deployed controls, the residual attack risk is effectively eliminated for the whole business.',
  },
  {
    id: 's2',
    text: 'Residual risk is a compliance paperwork concept with no operational meaning once the control matrix is fully mapped and signed.',
  },
  {
    id: 's3',
    text: 'No control is perfect: controls misconfigure and decay over time, and attackers chain techniques — layers must overlap and be verified continuously.',
  },
  {
    id: 's4',
    text: 'Encryption at rest removes the need for monitoring or any further layers because stored data can no longer be exposed.',
  },
];
const RESIDUAL_ANSWER = 's3';

const MFA_MID_ANSWER = 'M1032';

/* ================================ HARD MODE DATA ================================ */

const INCIDENTS = [
  {
    id: 'i1',
    sev: 'high',
    text: 'VPN appliance: 41,208 failed logins across 917 accounts from residential ASNs within 6 hours; 3 successes from unrelated geos within minutes of the failure bursts.',
    classId: 'password',
    rationale: 'Classic credential stuffing with successes — confirmed credential attacks.',
  },
  {
    id: 'i2',
    sev: 'high',
    text: 'Customer portal (no WAF in front): six requests echoed SQL error strings against /quote/search; scanner signatures observed; app uses concatenated queries.',
    classId: 'application',
    rationale: 'Active SQL-injection probing of a vulnerable public app — confirmed application attacks.',
  },
  {
    id: 'i3',
    sev: 'medium',
    text: 'WKS-2214: 4.2 MB/day of TXT queries, NXDOMAIN-heavy, 60+ character subdomains under rndns-logistics[.]info, steady 15-minute beacons.',
    classId: 'protocol',
    rationale: 'Live DNS tunneling (C2 over DNS) — confirmed protocol abuse.',
  },
  {
    id: 'i4',
    sev: 'info',
    text: 'Print-spooler service restarted 12 times on PRN-01; a vendor firmware advisory confirms a stability bug fixed in 4.2.1. No hostile indicators.',
    classId: null,
    rationale: 'Red herring — an operational stability bug, not an attack.',
  },
  {
    id: 'i5',
    sev: 'info',
    text: 'TLS certificate on STG-APP-03 expired; internal monitoring raised an alert. Staging host only; no hostile indicators observed.',
    classId: null,
    rationale: 'Red herring — an operational misconfiguration, not a cryptographic attack.',
  },
  {
    id: 'i6',
    sev: 'info',
    text: 'One spoofed-invoice email blocked at the gateway; proxy logs confirm zero link fetches; sender domain added to the blocklist.',
    classId: null,
    rationale: 'Red herring — a blocked one-off with no success and no current activity.',
  },
];
const INCIDENT_ANSWER = ['i1', 'i2', 'i3'];

const CLAIMS = [
  { id: 'c1', text: 'Our EDR’s behavior engine catches malware that signature engines miss.', answer: 'accept' },
  { id: 'c2', text: 'Code signing guarantees a signed binary is safe — attackers can’t obtain valid signatures.', answer: 'reject' },
  { id: 'c3', text: 'DLP will stop ransomware from encrypting our file shares.', answer: 'reject' },
  { id: 'c4', text: 'Unpatched internet-facing software remains one of the top ransomware entry paths.', answer: 'accept' },
  { id: 'c5', text: 'Application allowlisting reduces the attack surface available for malware execution.', answer: 'accept' },
];

const PHASE_ITEMS = [
  { id: 'p1', text: 'Clean up the MFA exception group and enforce org-wide', answer: 'immediate' },
  { id: 'p2', text: 'Enable IPS blocking mode (retire change #4471)', answer: 'immediate' },
  { id: 'p3', text: 'Disable SMBv1 on the 40 legacy hosts', answer: 'immediate' },
  { id: 'p4', text: 'Deploy the WAF in front of the customer portal', answer: '30-day' },
  { id: 'p5', text: 'Replace concatenated queries with parameterized queries + a validation framework', answer: '30-day' },
  { id: 'p6', text: 'Fund and execute network segmentation (flat /16 → zones)', answer: '90-day' },
];

const PHASES = [
  { id: 'immediate', label: 'Immediate (this week)', hint: 'Stops active bleeding; configuration-only' },
  { id: '30-day', label: '30-day sprint', hint: 'Needs procurement or a code release' },
  { id: '90-day', label: '90-day program', hint: 'Multi-quarter architecture work' },
];

const VERIFY_CONTROLS = ['mfa', 'waf', 'param-queries', 'segmentation', 'email-auth'];

const VERIFY_EVIDENCE = [
  { id: 'e1', text: 'Auth logs: MFA challenge rate up; zero exception-group logins' },
  { id: 'e2', text: 'WAF telemetry: injection-pattern block counts above zero on routes' },
  { id: 'e3', text: 'Code scan report: zero concatenated-query paths in merged branches' },
  { id: 'e4', text: 'East-west flow map: SMB only between designated server VLANs' },
  { id: 'e5', text: 'DMARC aggregate (rua) reports showing reject/quarantine actions' },
  { id: 'e6', text: 'CPU utilization baseline dashboard from the monitoring tool' },
];
const VERIFY_ANSWER = { mfa: 'e1', waf: 'e2', 'param-queries': 'e3', segmentation: 'e4', 'email-auth': 'e5' };

const BUDGET_CANDIDATES = [
  { id: 'waf', note: 'Compensating layer for the portal' },
  { id: 'input-validation', note: 'Root-cause fix for injection paths' },
  { id: 'password-policy', note: 'Breach-aware policy + length floor' },
  { id: 'dns-filtering', note: 'Blocks and flags tunneling domains' },
  { id: 'dlp', note: 'Limits exfiltration impact' },
  { id: 'segmentation', note: 'Zone servers and the backup vault' },
];
const BUDGET_ACTIVE_CLASSES = ['password', 'application', 'protocol'];
const BUDGET_ANSWER = ['input-validation', 'password-policy', 'dns-filtering'];

const BUDGET_RATIONALES = [
  { id: 'r1', text: 'Maximize breadth: one root-cause control per actively-attacked class beats layering three controls on one class.' },
  { id: 'r2', text: 'Fund the three cheapest line items regardless of which attack class they actually protect.' },
  { id: 'r3', text: 'Fund DLP first — data is the crown jewel and exfiltration is the worst possible outcome here.' },
  { id: 'r4', text: 'Fund only infrastructure protections — they host every workload and face every attack anyway.' },
];
const BUDGET_RATIONALE_ANSWER = 'r1';

const CROSSWALK_ITEMS = [
  { id: 'x1', text: 'Credential stuffing with breached username/password lists', answer: 'T1110.004' },
  { id: 'x2', text: 'SQL injection into a public-facing web application', answer: 'T1190' },
  { id: 'x3', text: 'Command-and-control tunneled over DNS TXT records', answer: 'T1071.004' },
  { id: 'x4', text: 'ARP cache poisoning to intercept LAN traffic', answer: 'T1557.002' },
  { id: 'x5', text: 'Ransomware encrypting files for extortion', answer: 'T1486' },
];

const CROSSWALK_OPTIONS = ['T1110.004', 'T1190', 'T1071.004', 'T1557.002', 'T1486', 'T1566', 'T1040'];

const SIGNOFF_VERIFY_OPTIONS = [
  { id: 'sv1', text: 'Pull VPN auth logs: confirm zero exception-group logins' },
  { id: 'sv2', text: 'Check the DNS resolver uptime statistics for last month' },
  { id: 'sv3', text: 'Print the coverage heat grid for the appendix' },
  { id: 'sv4', text: 'Email all staff a friendly password-hygiene reminder today' },
];
const SIGNOFF_VERIFY_ANSWER = 'sv1';

/* Focus-area topics for the completion report (R8): quiz item → what to review + where. */
const QUIZ_FOCUS_MAP = {
  qm1: { topic: 'Root cause vs. compensating controls', review: 'Checklist Matrix → Application focus' },
  qm2: { topic: 'Email authentication (SPF/DKIM/DMARC)', review: 'Checklist Matrix → Protocol focus' },
  qm3: { topic: 'WPA-Enterprise vs. PSK identity', review: 'Checklist Matrix → Wireless focus' },
  qm4: { topic: 'Anti-stuffing control pairing (M1032/M1027)', review: 'Checklist Matrix → Credential focus' },
  qm5: { topic: 'Reading a coverage-gap score', review: 'Estate → Coverage Scan' },
  qm6: { topic: 'Recognizing compensating controls', review: 'Knowledge Core → method step 5' },
  qh1: { topic: 'Remediation priority: fix code, keep the layer', review: 'Checklist Matrix → Application focus' },
  qh2: { topic: 'DNS tunneling indicators and controls', review: 'Field Notes → detection opportunities' },
  qh3: { topic: 'Verifying MFA enforcement scope', review: 'Estate → inspect MFA configuration' },
  qh4: { topic: 'Evil-twin containment and 802.1X', review: 'Checklist Matrix → Wireless focus' },
  qh5: { topic: 'Immutable, isolated backups (M1053)', review: 'Checklist Matrix → Malware focus' },
  qh6: { topic: 'Handling legacy-crypto dependencies', review: 'Checklist Matrix → Crypto focus' },
  qh7: { topic: 'Fabric attacks: segmentation + DAI', review: 'Checklist Matrix → Infrastructure focus' },
};

/* ================================ QUIZ ================================ */

/*
 * QUIZ — B3/B7 quality contract (auditor pass):
 *  - R4: the correct answer's position ROTATES across items (see answer indices:
 *    2,0,2,3,1,1 / 2,3,1,0,1,3,1 — no position dominates, none fixed).
 *  - R5: all options of an item sit within one word of each other; the correct
 *    answer is never the (uniquely) longest and never stands out by formatting.
 *  - B3: feedback explains why the correct answer is right AND why the tempting
 *    distractors are wrong.
 */
const QUIZ = [
  {
    id: 'qm1',
    mode: 'medium',
    q: 'A legacy portal builds SQL from string concatenation. Which control closes the ROOT CAUSE?',
    options: ['Web Application Firewall', 'Source-IP rate limiting', 'Parameterized queries', 'Output encoding + CSP'],
    answer: 2,
    why: 'Prepared statements separate code from data, making injection structurally impossible. The WAF only filters known patterns in front of the flaw (compensating), rate limiting throttles but never fixes the flaw, and output encoding targets XSS output — not SQL input.',
  },
  {
    id: 'qm2',
    mode: 'medium',
    q: 'DMARC builds on which two mechanisms to authenticate email origin?',
    options: ['SPF and DKIM', 'WPA3 and 802.1X', 'EDR and allowlisting', 'TLS and HSTS'],
    answer: 0,
    why: 'SPF checks the sending server, DKIM signs the message; DMARC adds policy and reporting on top of both — the protocol-hardening layer against spoofing. WPA3/802.1X is wireless identity, EDR/allowlisting is endpoint execution control, and TLS/HSTS protects web transport, not email origin.',
  },
  {
    id: 'qm3',
    mode: 'medium',
    q: 'Why is WPA2-PSK weaker than WPA2/WPA3-Enterprise for a corporate WLAN?',
    options: [
      'PSK always negotiates weaker ciphers than Enterprise',
      'Enterprise mode disables rogue access points automatically',
      'Shared passphrase means no per-user identity or revocation',
      'PSK networks cannot run a WIDS at all',
    ],
    answer: 2,
    why: 'Enterprise (802.1X) authenticates each user individually, so accounts can be revoked and logs attribute actions to people. The cipher suite is not the core difference; no Enterprise mode "disables" rogue APs (that is WIPS plus people); and a WIDS runs fine against PSK networks — it just cannot fix the shared-identity problem.',
  },
  {
    id: 'qm4',
    mode: 'medium',
    q: 'Credential stuffing is best blunted by which pairing?',
    options: ['WAF + DLP', 'Segmentation + NAC', 'Code signing + EDR', 'Breach screening + MFA'],
    answer: 3,
    why: 'Stuffing replays breached passwords: screening (M1027) removes the exact pairs attackers hold, and MFA (M1032) breaks the replay itself. A WAF filters HTTP, DLP limits exfiltration, segmentation/NAC and code signing/EDR address entirely different attack classes.',
  },
  {
    id: 'qm5',
    mode: 'medium',
    q: 'In the checklist method, an attack class with a COMPLETED mapping but ZERO deployed controls means…',
    options: [
      'The mapping must be wrong — mapping implies deployment',
      'A documented coverage gap, ready to prioritize',
      'The class is not exploitable in this organization',
      'Compliance is satisfied by the documentation alone',
    ],
    answer: 1,
    why: 'The map is the assessment; the deployment is the remediation — a mapped-but-empty row is exactly the "obvious shortfall" the method exposes. The mapping can be perfectly right, exploitability is exactly why the gap matters, and paperwork does not stop a single attack.',
  },
  {
    id: 'qm6',
    mode: 'medium',
    q: 'Which of these is the best example of a COMPENSATING control?',
    options: ['Enabling MFA on top of passwords', 'A WAF screening unfixed code', 'Replacing concatenated SQL with prepared statements', 'Patching the outdated internet service'],
    answer: 1,
    why: 'A compensating control reduces risk while the root-cause fix is pending — a WAF stands in front of code that is still vulnerable. MFA layers a good control over passwords (hardening, not compensation), and parameterized queries and patching ARE the root-cause fixes themselves.',
  },
  {
    id: 'qh1',
    mode: 'hard',
    q: 'SCENARIO — Your WAF blocked a spike of SQLi against the portal; code review confirms concatenated queries. Correct remediation priority?',
    options: ['Keep the WAF tuned — no further action', 'Rate-limit the source networks and monitor', 'Deploy parameterized queries; keep the WAF', 'Take the portal offline for good'],
    answer: 2,
    why: 'The WAF is compensating — it filters patterns while the flaw remains exploitable by anything it misses. Fix the root cause in code and keep the WAF as one standing layer of defense in depth. Tuning alone leaves the flaw, rate limiting shifts the problem, and taking the portal down is a business decision of last resort, not remediation.',
  },
  {
    id: 'qh2',
    mode: 'hard',
    q: 'SCENARIO — Resolver logs: 4.2 MB/day of TXT queries, NXDOMAIN-heavy, 60-char subdomains, steady 15-minute beacons. Identify the activity and the control.',
    options: ['Normal CDN behavior — no action is required', 'Password spraying — enforce stricter account lockout thresholds', 'ARP poisoning — deploy dynamic ARP inspection now', 'DNS tunneling — filter DNS and restrict egress'],
    answer: 3,
    why: 'Long encoded subdomains, TXT volume, NXDOMAIN storms and periodic beacons are the signature of DNS tunneling (T1071.004); DNS filtering plus egress restriction (M1037) breaks it. CDN traffic does not beacon every 15 minutes, spraying lives in authentication logs, and ARP poisoning never surfaces as DNS queries.',
  },
  {
    id: 'qh3',
    mode: 'hard',
    q: 'SCENARIO — Stuffing succeeds against accounts that are "with MFA". What do you check FIRST?',
    options: ['The core firewall rule processing order today', 'MFA enforcement scope — exception groups and fallbacks', 'The currently configured password minimum length policy', 'The nightly backup job schedule and retention'],
    answer: 1,
    why: 'An MFA control that "exists" but exempts 312 users — or falls back to weak SMS — is a phantom control; enforcement scope is the first thing to verify. Password length, firewall rules and backup schedules may all deserve attention later, but none explains how stuffing defeats an MFA-enforced login.',
  },
  {
    id: 'qh4',
    mode: 'hard',
    q: 'SCENARIO — WIDS flags an evil-twin AP broadcasting your corporate SSID. Which TWO immediate actions are correct?',
    options: ['Contain the rogue AP and enforce 802.1X', 'Rotate every password and wipe every phone', 'Disable DNS filtering to speed the investigation', 'Buy more APs to overpower the signal'],
    answer: 0,
    why: 'Contain/deauthorize the rogue AP (WIPS) and make clients demand per-user 802.1X — an evil twin cannot relay an enterprise handshake it cannot complete. Mass password rotation treats a phantom compromise, disabling DNS filtering only blinds you, and overpowering a signal is an arms race you lose.',
  },
  {
    id: 'qh5',
    mode: 'hard',
    q: 'SCENARIO — Ransomware executed despite EDR, and backup copies mounted over SMB were encrypted too. Which mitigation gap is proven?',
    options: ['No DLP policy for archive formats', 'No immutable, network-isolated backup copy', 'No code signing on the ransomware binary', 'No DMARC record on the email domain'],
    answer: 1,
    why: 'Backups reachable over the LAN die with the workload — M1053 only delivers value as an isolated, immutable copy (with segmentation keeping ransomware away from it). DLP does not touch the encryption step, code signing would not have stopped already-running malware here, and DMARC governs email origin, not backup reachability.',
  },
  {
    id: 'qh6',
    mode: 'hard',
    q: 'SCENARIO — A vendor application requires legacy TLS 1.0. Correct handling?',
    options: ['Grant a permanent exception on the edge', 'Disable TLS on that vendor application entirely', 'Ignore it — legacy TLS is not exploitable', 'Isolate the app, compensate, and time-box modernization'],
    answer: 3,
    why: 'Vendor dependencies rarely fix overnight: contain the app (segmentation), add compensating controls, and give the exception an expiry with a modernization plan. Blanket permanent exceptions are how weak crypto (T1600) survives for years, disabling TLS breaks the vendor service outright, and downgrade attacks against TLS 1.0 are well documented.',
  },
  {
    id: 'qh7',
    mode: 'hard',
    q: 'SCENARIO — Flat network, ARP-poisoning alerts from the NIDS. Which TWO controls cut this risk the most?',
    options: ['DLP plus a WAF', 'Segmentation + dynamic ARP inspection', 'DMARC plus enforced SPF', 'Application allowlisting and code signing'],
    answer: 1,
    why: 'Segmentation (M1030) shrinks the broadcast domains where ARP poisoning works, and DAI/802.1X rejects spoofed bindings — both attack the fabric where this attack lives. DLP/WAF guard content and HTTP, DMARC/SPF authenticate email, and allowlisting/code signing govern endpoint execution — none of them touches Layer 2 trust.',
  },
];

/* ================================ DEBRIEF ================================ */

const DETECTION_OPPORTUNITIES = [
  { source: 'DNS resolver / passive DNS logs', look: 'TXT-record floods, NXDOMAIN spikes, abnormally long subdomains, periodic beacons', example: 'ALERT WHEN sum(TXT) > baseline AND avg(subdomain_len) > 40 IN 5m' },
  { source: 'Authentication logs (VPN/IdP)', look: 'Bursts of failures across many accounts, then successes (stuffing); logins bypassing MFA challenges', example: 'ALERT WHEN failures/accounts > 20 IN 1h OR mfa_method == "none" AND geo_changed' },
  { source: 'WAF / NIPS telemetry', look: 'Injection-pattern blocks; an IPS in detect-only mode proves nothing is being prevented', example: 'ALERT WHEN waf.action == block AND rule.sqlinjection IN 5m; AUDIT ips.mode weekly' },
  { source: 'Email gateway / DMARC reports', look: 'SPF/DKIM failures from your own domains; DMARC rua aggregates showing spoof attempts', example: 'ALERT WHEN dmarc.result == fail AND header.from IN corporate_domains' },
  { source: 'WIDS / wireless controller', look: 'Rogue or spoofed SSIDs, deauth storms, WPS probe attempts', example: 'ALERT WHEN wids.rogue_ssid IN corporate_ssids' },
  { source: 'Configuration & change audit (M1047)', look: 'Control drift: blocking disabled, exceptions widened, legacy protocols re-enabled', example: 'REVIEW config.diff on security controls EVERY change ticket' },
];

const BLUE_TAKEAWAYS = [
  'Map before you buy: the mitigation→attack checklist turns "do we have enough controls?" into a computable question.',
  'A deployed control is a hypothesis; the verification evidence (OBJ-H5) is the experiment. Re-verify after every change.',
  'Root-cause fixes first (code, configuration, identity), compensating layers second — but keep both layers.',
  'Coverage scores decay: exceptions creep, modes flip to detect-only, legacy protocols return. Re-run the audit on a schedule.',
];

const RED_TAKEAWAYS = [
  'Defenders who keep this checklist watch exactly where you want to walk: unpatched services, MFA exception groups, flat networks, unfiltered DNS.',
  'Chaining matters — every class you force defenders to cover costs budget; the classes missing from their map are your freest paths.',
  'Compensating controls (WAF, IPS in alert mode) are speed bumps, not walls — plan for the code flaw still existing underneath.',
  'Impact-limiting controls (backups, DLP) never stop your execution — but they can blunt your extortion leverage.',
];

const LINKS = [
  { label: 'MITRE ATT&CK — Mitigations index', href: 'https://attack.mitre.org/mitigations/enterprise/' },
  { label: 'MITRE ATT&CK — T1110 Brute Force', href: 'https://attack.mitre.org/techniques/T1110/' },
  { label: 'MITRE ATT&CK — T1190 Exploit Public-Facing Application', href: 'https://attack.mitre.org/techniques/T1190/' },
  { label: 'MITRE ATT&CK — T1071.004 DNS', href: 'https://attack.mitre.org/techniques/T1071/004/' },
  { label: 'CompTIA CySA+ CS0-003 exam objectives', href: 'https://www.comptia.org/certifications/cybersecurity-analyst' },
];

const NEXT_STEPS = [
  'Re-run this audit in Hard mode — the estate hides misconfigurations that Medium never mentions.',
  'CS0-003 Lesson 14 series: continue with attack indicators and detection concepts (Domains 1 and 2).',
  'Pick one class (e.g., Application) and map its sub-variants to specific D3FEND countermeasures.',
  'Read the ATT&CK Mitigations index end-to-end once — you will recognize every M-ID in future audits.',
];
