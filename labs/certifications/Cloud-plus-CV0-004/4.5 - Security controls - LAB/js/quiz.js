/* ─────────────────────────────────────────────────────────────────────────────
 * quiz.js — Certification Probe banks, carried over 1:1 from the original lab
 * (src/lib/lab/quiz.ts). Rebuilt during the original audit pass (QA-1/QA-2):
 *  · correct-answer positions rotate across items (R4)
 *  · the correct option is never the longest (R5); options share structure
 *  · every explanation covers why the correct answer is right AND why the
 *    tempting distractors fail
 * ───────────────────────────────────────────────────────────────────────────── */

var QUIZ_MEDIUM = [
  {
    id: "q-m1",
    q: "A WAF in block mode stops SQL-injection patterns in front of the public booking API. Primarily, this is which type of control?",
    options: ["Detective", "Deterrent", "Preventive", "Corrective"],
    correct: 2,
    explain:
      "It stops the attack BEFORE it reaches the application — prevention. The same WAF in log-only mode would be detective; a warning banner deters; backups correct. Mode changes type, hardware does not.",
  },
  {
    id: "q-m2",
    q: "Under the shared responsibility model, who patches the guest operating system of your IaaS virtual machine?",
    options: [
      "You — the customer",
      "The cloud service provider",
      "The hypervisor vendor alone",
      "Nobody: managed automatically",
    ],
    correct: 0,
    explain:
      "The provider secures the cloud (facilities, hypervisor, managed engines); you secure IN the cloud — everything you can log into, including an IaaS guest OS. The hypervisor vendor ships patches to the provider, not to you, and nothing about your VM is automatic.",
  },
  {
    id: "q-m3",
    q: "“Defense in depth” is best described as:",
    options: [
      "A single very strong perimeter firewall",
      "Layering independent controls at every depth",
      "Encrypting every stored byte three separate times",
      "A marketing label for zero trust networking",
    ],
    correct: 1,
    explain:
      "Depth means INDEPENDENT layers — edge, network, compute, data, identity — so a miss at one layer is caught at the next. One strong firewall is a single point of failure; triple encryption is one control repeated, not depth; zero trust assumes breach rather than rebranding depth.",
  },
  {
    id: "q-m4",
    q: "Which of the following is a detective control?",
    options: [
      "MFA on privileged console accounts",
      "Application allowlisting on servers",
      "Nightly backups to an isolated vault",
      "SIEM impossible-travel login alert",
    ],
    correct: 3,
    explain:
      "A SIEM alert watches and reports — detection. MFA and allowlisting stop actions before they happen (preventive); backups repair after the fact (corrective). When the control acts names its type.",
  },
  {
    id: "q-m5",
    q: "A legacy appliance cannot run endpoint agents. Isolating it behind a hardened jump host with an allowlist is best classified as:",
    options: [
      "A compensating control: the preferred agent control is impossible",
      "A corrective control: the segment repairs damage after an incident",
      "A deterrent control: the segment discourages attacker attempts",
      "A directive control: the segment documents required staff behavior",
    ],
    correct: 0,
    explain:
      "Compensating means an alternative that reduces the SAME risk when the primary control is infeasible. Corrective repairs after damage, deterrent discourages attempts, directive guides behavior — none restores the lost malware visibility the way the jump-host design does.",
  },
  {
    id: "q-m6",
    q: "What is the main risk of switching a brand-new WAF straight to block mode?",
    options: [
      "The vendor license enters its unenforced trial state",
      "Attackers learn the ruleset and quietly probe other services instead",
      "Legitimate business flows get blocked before rules are tuned",
      "The appliance loses its accumulated detection statistics",
    ],
    correct: 2,
    explain:
      "An untuned in-line control blocks legitimate business traffic — checkout flows, APIs, partner integrations — and gets emergency-switched off, leaving you worse than before. Detect first, tune, then enforce. License state, lost statistics and tipping off attackers are not the primary risk.",
  },
];

var QUIZ_HARD = [
  {
    id: "q-h1",
    scenario: "Audit: security group allows 0.0.0.0/0 → TCP 3389 on a finance subnet.",
    q: "Best first action?",
    options: [
      "Add an IDS rule to watch traffic on 3389",
      "Install antivirus on the finance subnet VMs",
      "Raise the CDN cache TTL for the subnet",
      "Restrict 3389 to the management CIDR",
    ],
    correct: 3,
    explain:
      "Close the exposure first — least privilege on the management port. Watching an open door is not closing it, and antivirus or CDN settings address different risks entirely.",
  },
  {
    id: "q-h2",
    scenario: "Ransomware has just encrypted orders-db.",
    q: "Which previously deployed control makes recovery possible?",
    options: [
      "The WAF in front of lb-01",
      "Immutable nightly backups",
      "The honeypot decoy segment",
      "The CDN edge cache",
    ],
    correct: 1,
    explain:
      "Backups are the corrective control: they do not stop the attack, they undo it. WAF, honeypot and CDN do nothing for an already-encrypted database — and an untested backup is a hope, not a control.",
  },
  {
    id: "q-h3",
    scenario: "The CISO asks for proof that the deployed controls actually work before go-live.",
    q: "Which activity provides it?",
    options: [
      "Adversarial replays and control-effectiveness tests",
      "Reading vendor datasheets and architecture diagrams",
      "Counting deployed agents on every single VM",
      "Buying extra licenses for the security tooling",
    ],
    correct: 0,
    explain:
      "Effectiveness is proven by observing controls act — block, alert, or restore — exactly what the Replay Bay models. Documents describe intent, counts describe inventory, licenses describe spending; none proves behavior.",
  },
  {
    id: "q-h4",
    scenario: "Northwind runs a managed Postgres (PaaS).",
    q: "Which duty is primarily the CUSTOMER's?",
    options: [
      "Patching the managed database engine",
      "Guarding the physical data center",
      "Classifying and labeling the data",
      "Maintaining the hypervisor host",
    ],
    correct: 2,
    explain:
      "The provider patches the engine, guards the facility, maintains the hypervisor; everything about YOUR data — who may read it, how it is labeled, what is encrypted — stays with you under every service model.",
  },
  {
    id: "q-h5",
    scenario: "DLP fires: 4.2 GB of HR exports re-shared to a personal cloud drive.",
    q: "First action?",
    options: [
      "Suppress the noisy rule",
      "Delete the alert ticket",
      "Wait for the next scan cycle",
      "Verify, contain, investigate",
    ],
    correct: 3,
    explain:
      "Bulk PII leaving via trusted channels is the classic true positive that firewalls miss. Verify it is real, contain it (revoke links), investigate scope — suppression is only for evidence-backed false positives, and deleting or waiting makes the loss worse.",
  },
  {
    id: "q-h6",
    scenario: "Budget covers one control. The dominant observed risk: PII leaving via legitimate file-share links.",
    q: "Which control has the highest value?",
    options: [
      "Content-aware DLP on the share",
      "A second, bigger internet firewall",
      "A faster load-balancer tier upgrade",
      "An acceptable-use policy refresh alone",
    ],
    correct: 0,
    explain:
      "Match the control to the risk: the loss rides trusted, authorized channels that no firewall questions — content-aware DLP is the only catalog control that sees it. Firewalls, balancers and policy documents each watch something else.",
  },
  {
    id: "q-h7",
    scenario: "An engineer proposes replacing the DMZ mindset with zero trust.",
    q: "What actually changes?",
    options: [
      "Nothing — internal traffic stays trusted",
      "A bigger firewall at the perimeter edge",
      "Explicit verification of every request",
      "Stronger passwords on the VPN concentrator",
    ],
    correct: 2,
    explain:
      "Zero trust replaces implicit location-based trust with explicit verification of every request plus continuous least privilege. Internal traffic is no longer trusted by default; bigger firewalls and stronger passwords harden the old model instead of replacing it.",
  },
];
