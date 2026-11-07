// ── data.js — ALL lab content, separated from logic ───────────────────────────
// Ported 1:1 from the original Continuity Desk lab (Next.js sources:
// src/lib/lab/content.ts, evidence.ts, quizzes.ts). Every log line, hash,
// email, answer key, hint and explanation is identical to the original.
// All data is synthetic training data (see DISCLAIMER below).

// ── Organization + disclaimer ──────────────────────────────────────────────────
const ORG = {
  name: "Halcyon Foods",
  blurb:
    "Fictional mid-market grocery retailer: 40 stores, 2 distribution centers, workloads on the fictional NimbusCloud platform plus an on-site NAS in the HQ data room.",
  provider: "NimbusCloud (fictional)",
};

const DISCLAIMER =
  "SYNTHETIC TRAINING DATA — Halcyon Foods, NimbusCloud, DARKMOSS and every log line, hash, email and IP below are fictional, generated for CompTIA Cloud+ CV0-004 Lesson 3.2 practice. 198.51.100.77 belongs to the TEST-NET-2 documentation range. No real organization or person is represented.";

// ── Business impact: assets and recovery tiers (Medium M2) ────────────────────
const ASSETS = [
  { id: "pay-db", name: "Payment DB", kind: "PostgreSQL cluster — card & order transactions" },
  { id: "web-store", name: "Online store", kind: "Containerized web storefront" },
  { id: "img-bucket", name: "Product images bucket", kind: "Object storage, ~1.9 TB static assets" },
  { id: "hr-share", name: "HR archive share", kind: "Cold documents, accessed quarterly" },
];
const TIERS = [
  { id: "T1", rpo: "15 min", rto: "1 h", gloss: "Continuous log shipping + hot standby" },
  { id: "T2", rpo: "1 h", rto: "4 h", gloss: "Hourly replication + warm standby" },
  { id: "T3", rpo: "24 h", rto: "24 h", gloss: "Nightly backup + next-day rebuild" },
  { id: "T4", rpo: "24 h", rto: "72 h", gloss: "Nightly backup + restore from vault" },
];

// ── Planner: this week's scheduled jobs (Medium M1, M6) ───────────────────────
const JOBS = [
  { id: "JOB-101", day: "Sun", time: "22:00", size: "4.2 TB", note: "Reads every block of every protected workload." },
  { id: "JOB-102", day: "Mon", time: "22:00", size: "210 GB", note: "Copies only blocks changed since yesterday's backup of any type." },
  { id: "JOB-103", day: "Tue", time: "22:00", size: "238 GB", note: "Copies only blocks changed since yesterday's backup of any type." },
  { id: "JOB-104", day: "Wed", time: "22:00", size: "225 GB", note: "Copies only blocks changed since yesterday's backup of any type." },
  { id: "JOB-105", day: "Thu", time: "22:00", size: "241 GB", note: "Copies only blocks changed since yesterday's backup of any type." },
  { id: "JOB-106", day: "Fri", time: "22:00", size: "2.1 TB", note: "Copies every block changed since Sunday's full." },
  { id: "JOB-107", day: "Sat", time: "22:00", size: "— (0 B read from source)", note: "Agent builds a fresh logical full from the existing week chain without re-reading production." },
];
const JOB_TYPES = [
  { id: "full", label: "Full", def: "Everything, every run — largest window, simplest restore." },
  { id: "incremental", label: "Incremental", def: "Changes since the last backup of any type — smallest, chain-dependent restore." },
  { id: "differential", label: "Differential", def: "Changes since the last full — grows all week, only full + latest diff needed." },
  { id: "synthetic", label: "Synthetic full", def: "Rebuilt full assembled from existing copies — no production impact." },
];
const JOB_TYPE_ANSWERS = {
  "JOB-101": "full", "JOB-102": "incremental", "JOB-103": "incremental",
  "JOB-104": "incremental", "JOB-105": "incremental", "JOB-106": "differential", "JOB-107": "synthetic",
};

// ── Vault: the three copies (Medium M9) ───────────────────────────────────────
const COPY_TARGETS = [
  { id: "nas", label: "On-site NAS (HQ data room, disk)" },
  { id: "cloud-std", label: "NimbusCloud standard bucket — same region as production" },
  { id: "cloud-xreg", label: "NimbusCloud archive — cross-region, object-lock capable" },
];
const COPIES = [
  { id: "copy-1", label: "COPY-1 · nas-01", media: "Disk (NAS)", site: "HQ data room — same site as production", role: "Fast local restores", startTarget: "nas", startLock: false },
  { id: "copy-2", label: "COPY-2 · cloud-std", media: "Object storage", site: "Same NimbusCloud region as production", role: "Cloud working copy", startTarget: "cloud-std", startLock: false },
  { id: "copy-3", label: "COPY-3 · cloud-lock", media: "Object storage (archive tier)", site: "Different NimbusCloud region", role: "Last-resort copy", startTarget: "cloud-xreg", startLock: false },
];

// ── Vault: tape rack + GFS rotation (Medium M10) ──────────────────────────────
const TAPE_PLAN = {
  daily: 7, weekly: 4, monthly: 3, holds: 1,
  rule: "Rotation plan: 7 daily tapes recycled each weekday, 4 weekly tapes kept a month, 3 monthly tapes kept a year, and 1 tape on legal hold.",
};
const TAPES = (function () {
  const tapes = [];
  for (let i = 0; i < 7; i++) tapes.push({ id: `T-${String(i + 1).padStart(2, "0")}`, slot: `Rack A-${i + 1}`, used: "Last written Mon" });
  for (let i = 0; i < 4; i++) tapes.push({ id: `T-${String(i + 8).padStart(2, "0")}`, slot: `Rack B-${i + 1}`, used: "Last written Sun" });
  for (let i = 0; i < 3; i++) tapes.push({ id: `T-${String(i + 12).padStart(2, "0")}`, slot: `Rack C-${i + 1}`, used: "Last written 1st" });
  tapes.push({ id: "T-15", slot: "Rack C-4 (sealed)", used: "HR litigation — evidence copy" });
  return tapes;
})();
const TAPE_LABELS = ["D", "W", "M", "HOLD"];
const TAPE_ANSWERS = (function () {
  const answers = {};
  for (let i = 0; i < 7; i++) answers[`T-${String(i + 1).padStart(2, "0")}`] = "D";
  for (let i = 0; i < 4; i++) answers[`T-${String(i + 8).padStart(2, "0")}`] = "W";
  for (let i = 0; i < 3; i++) answers[`T-${String(i + 12).padStart(2, "0")}`] = "M";
  answers["T-15"] = "HOLD";
  return answers;
})();

// ── Vault: verification runner (Medium M7) ────────────────────────────────────
const VERIFICATION_ARTIFACTS = [
  { id: "ART-01", label: "pay-db · Sun full", manifest: "a3f1c04e…9c2e", stored: "a3f1c04e…9c2e", ok: true },
  { id: "ART-02", label: "file-share · Sun full", manifest: "77bd91aa…41aa", stored: "77bd91aa…41aa", ok: true },
  { id: "ART-03", label: "web-store · Mon incr", manifest: "0c9e7b21…b7d3", stored: "0c9e7b21…b7d3", ok: true },
  { id: "ART-04", label: "file-share · Tue incr (NAS)", manifest: "4de29f0a…ff0a", stored: "4de90f7a…ff0a", ok: false },
  { id: "ART-05", label: "pay-db · Mon incr", manifest: "b18c33d2…2f60", stored: "b18c33d2…2f60", ok: true },
  { id: "ART-06", label: "img-bucket · Mon incr", manifest: "5a33c8d1…c0d1", stored: "5a33c8d1…c0d1", ok: true },
];
const CORRUPT_ARTIFACT = "ART-04";

// ── Vault: pager policy board (Medium M8) ─────────────────────────────────────
const PAGER_EVENTS = [
  { id: "EV1", label: "Backup job failed", detail: "Any protected asset failed its scheduled job.", page: true },
  { id: "EV2", label: "Verification checksum mismatch", detail: "Stored bytes no longer match the manifest hash.", page: true },
  { id: "EV3", label: "DELETE call on a backup copy", detail: "Copy or restore-point deletion API invoked.", page: true },
  { id: "EV4", label: "Replication lag beyond RPO threshold", detail: "Async replica fell far enough behind to threaten the asset's RPO.", page: true },
  { id: "EV5", label: "Monthly retention job succeeded", detail: "Expected housekeeping completed on schedule.", page: false },
  { id: "EV6", label: "Scheduled dedupe window opened", detail: "Planned maintenance started exactly as configured.", page: false },
];
const PAGER_ANSWERS = PAGER_EVENTS.filter((e) => e.page).map((e) => e.id);

// ── Vault: hardening panel (Medium M12) ───────────────────────────────────────
const HARDENING_SWITCHES = [
  { id: "enc-rest", label: "AES-256 encryption at rest on every copy target", detail: "Protects stolen media and exposed buckets.", correct: true },
  { id: "enc-transit", label: "TLS 1.3 for backup traffic in transit", detail: "Stops interception between source and target.", correct: true },
  { id: "mfa-number", label: "Number-matching MFA on the backup console", detail: "Blocks push-fatigue approval of stolen sessions.", correct: true },
  { id: "sep-acct", label: "Dedicated least-privilege backup admin account", detail: "No email, no workstation login — shrinks phishing surface.", correct: true },
  { id: "no-comp", label: "Disable compression to speed up restores", detail: "Restores rarely are CPU-bound on decompression; this triples transfer size.", correct: false },
  { id: "portal", label: "Public restore portal for contractors", detail: "Exposes the backup estate to the internet — attacker goldmine.", correct: false },
  { id: "auto-clean", label: "Auto-delete copies older than 30 days (ignore retention policy)", detail: "Silently destroys archives, legal holds and long recovery chains.", correct: false },
];

// ── Vault: Hard H6 control bundle ─────────────────────────────────────────────
const BUNDLE_OPTIONS = [
  { id: "B1", label: "Object-lock WORM archive tier, compliance mode, 7-year retention", correct: true },
  { id: "B2", label: "Quarterly offline LTO tape rotation, stored offsite", correct: true },
  { id: "B3", label: "Async replication of daily incrementals (~180 GB/night — inside the 500 GB cap)", correct: true },
  { id: "B4", label: "Second active datacenter in another region", correct: false },
  { id: "B5", label: "Hot standby DR site running 24/7", correct: false },
  { id: "B6", label: "Provider-managed snapshots in the same storage account", correct: false },
  { id: "B7", label: "All-tape strategy — no cloud copies at all", correct: false },
  { id: "B8", label: "Public read bucket with signed URLs for auditors", correct: false },
];
const BUNDLE_CONSTRAINTS = [
  "Regulator: financial records need 7-year tamper-evident retention.",
  "Budget: a second datacenter / hot site is not fundable this year.",
  "Bandwidth: cross-region traffic is capped at 500 GB per night.",
];

// ── Vault: Hard H7 alert triage ───────────────────────────────────────────────
const ALERT_SCENARIOS = [
  { id: "AL-1", text: "DELETE API call against a backup copy, outside any approved change window." },
  { id: "AL-2", text: "Verification sweep reports a checksum mismatch on one copy." },
  { id: "AL-3", text: "Monthly retention job completed successfully, nothing flagged." },
  { id: "AL-4", text: "Cross-region replication lag reached 3× the asset's RPO threshold." },
  { id: "AL-5", text: "Backup report email bounced — the IT mailbox rejected it." },
];
const ALERT_ANSWERS = { "AL-1": "PAGE", "AL-2": "PAGE", "AL-3": "SUPPRESS", "AL-4": "PAGE", "AL-5": "TICKET" };

// ── Planner: Hard H3 rebuild plan ─────────────────────────────────────────────
const PLAN_ASSETS = [
  { id: "pay-db", name: "Payment DB", rpo: "15 min", rto: "1 h" },
  { id: "file-share", name: "HQ file share", rpo: "24 h", rto: "4 h" },
];
const PLAN_OPTIONS = {
  freq: [
    { id: "daily", label: "Nightly job only" },
    { id: "hourly", label: "Hourly jobs" },
    { id: "continuous", label: "Continuous log shipping (every 15 min)" },
  ],
  repl: [
    { id: "none", label: "No replication" },
    { id: "async-15m", label: "Async cross-region replication, ≤15 min lag" },
    { id: "async-daily", label: "Async cross-region copy, daily (~180 GB/night)" },
    { id: "sync", label: "Synchronous cross-region replication" },
  ],
  media: [
    { id: "cloud-std", label: "Standard cloud bucket, no lock" },
    { id: "cloud-lock", label: "Immutable object-lock bucket (WORM)" },
    { id: "tape-only", label: "Offline tape only" },
  ],
};
const PLAN_ANSWERS = {
  "pay-db": { freq: "continuous", repl: "async-15m", media: "cloud-lock" },
  "file-share": { freq: "daily", repl: "async-daily", media: "cloud-lock" },
};

// ── Planner: continuity map (Medium M11) ──────────────────────────────────────
const DR_BUS = [
  { id: "bu-pay", name: "Payment platform", note: "RTO 1 h — card payments cannot stop." },
  { id: "bu-file", name: "HQ file share", note: "RTO 4 h — staff blocked after half a day." },
  { id: "bu-hr", name: "HR archive", note: "RTO 72 h — paper process survives the weekend." },
];
const DR_SITES = [
  { id: "hot", label: "Hot site", def: "Fully running replica — minutes to hours to switch." },
  { id: "warm", label: "Warm site", def: "Equipped but idle — data shipped/replicated, services started on declaration." },
  { id: "cold", label: "Cold site", def: "Space + power only — restore everything from backups, days." },
];
const DR_ANSWERS = { "bu-pay": "hot", "bu-file": "warm", "bu-hr": "cold" };

// ── Drill Floor: threat board (Medium M3) ─────────────────────────────────────
const ATTACK_REASONS = [
  { id: "R1", text: "Destroying backups removes the victim's last recovery option — it pressures them to pay the ransom.", isMotive: true },
  { id: "R2", text: "Backup jobs run with high-privilege service accounts, so one stolen credential can reach every copy at once.", isMotive: true },
  { id: "R3", text: "Backups are always encrypted, so stealing them is pointless.", isMotive: false },
  { id: "R5", text: "Snapshots stored in the same account are enough to defeat ransomware.", isMotive: false },
];
const IMMUTABLE_REASONS = [
  { id: "R4", text: "Object-locked (WORM) copies reject deletion at the API even when the attacker holds valid admin credentials.", correct: true },
  { id: "R6", text: "Immutable copies are encrypted with a different algorithm ransomware cannot brute-force.", correct: false },
  { id: "R7", text: "Immutable copies are stored on faster media so restores finish before ransomware runs.", correct: false },
];

// ── Drill Floor: restore workbench (Medium M6) ────────────────────────────────
const RESTORE_INCIDENT = {
  when: "Thursday 10:12",
  what: "A bad deploy overwrote the HQ file share with garbage. Restore point: Thursday 09:45 (last clean state).",
  answer: ["JOB-101", "JOB-102", "JOB-103", "JOB-104", "JOB-105"],
};

// ── Drill Floor: Hard H4 sequencer + H5 calculator ────────────────────────────
const DRILL_STEPS = [
  { id: "D1", text: "Isolate the affected host and disable share access." },
  { id: "D2", text: "Verify checksums of the restore chain (full + incrementals)." },
  { id: "D3", text: "Select the restore point — Thu 09:45, last clean chain." },
  { id: "D4", text: "Restore to a clean volume; do not overwrite originals yet." },
  { id: "D5", text: "Validate restored files and run an anti-malware scan." },
  { id: "D6", text: "Re-enable services and repoint users to the restored share." },
  { id: "D7", text: "Monitor, fail back, and schedule the post-incident review." },
];
const DRILL_ORDER = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];
const BREACH_METHODS = [
  { id: "pitr", label: "Point-in-time recovery from transaction logs (05:31)" },
  { id: "full", label: "Full restore from Sunday's verified full" },
  { id: "snap", label: "Restore the 3-day-old volume snapshot" },
  { id: "rebuild", label: "Rebuild the database from application exports" },
];
const BREACH_FACTS = [
  "Payment DB — async cross-region log shipping, every 15 min.",
  "Last log shipped: 05:31. Replication lag at incident: 42 min.",
  "Last verified full: Sunday 22:00.",
  "Incident detected: Saturday 06:10. Recovery RPO: 15 min.",
];

// ── Evidence: Hard H1 answer keys ─────────────────────────────────────────────
const H1_VECTORS = [
  { id: "phish", label: "Credential phishing of the backup admin" },
  { id: "vpn", label: "Unpatched VPN appliance exploit" },
  { id: "insider", label: "Malicious insider with console access" },
  { id: "vendor", label: "Compromised supplier update" },
];
const H1_ACCOUNTS = ["svc-backupadm", "mdelgado (human admin)", "svc-devdeploys", "svc-scheduler"];
const H1_COPIES = [
  { id: "nas-01", label: "COPY-1 · nas-01 (on-site NAS)" },
  { id: "cloud-std", label: "COPY-2 · cloud-std (same-region bucket)" },
  { id: "cloud-lock", label: "COPY-3 · cloud-lock (object-locked archive)" },
];
const H1_WHY = [
  { id: "worm", label: "Object lock (WORM compliance mode) rejected the DELETE call" },
  { id: "creds", label: "The attacker's credentials were revoked before the call" },
  { id: "hidden", label: "The copy was hidden and never discovered" },
  { id: "offline", label: "The copy was on an air-gapped tape" },
];

// ── Evidence: Hard H2 answer keys ─────────────────────────────────────────────
const H2_CAUSES = [
  { id: "quota", label: "QUOTA — storage pool exhausted" },
  { id: "window", label: "WINDOW — job collided with planned maintenance" },
  { id: "cred", label: "CRED — agent authentication failed" },
  { id: "net", label: "NET — transfer link saturated" },
];

// ── Evidence: Hard H8 statements ──────────────────────────────────────────────
const H8_STATEMENTS = [
  { id: "S1", text: "The estate failed 3-2-1-1-0: only one copy was immutable and that copy had never been restore-tested.", correct: true },
  { id: "S2", text: "Number-matching MFA would likely have blocked the four-push fatigue approval.", correct: true },
  { id: "S3", text: "The 04:07 and 04:11 deletions were logged, but no alert fired on deletion events.", correct: true },
  { id: "S4", text: "The replication report shows the payment DB RPO was breached by about 39 minutes.", correct: true },
  { id: "S5", text: "The immutable copy survived because object lock rejected the DELETE call — not because credentials were revoked.", correct: true },
  { id: "F1", text: "Encryption of the backups would have prevented their deletion.", correct: false },
  { id: "F2", text: "Cloud copies are immutable by default.", correct: false },
  { id: "F3", text: "Same-account snapshots would have survived the compromise.", correct: false },
  { id: "F4", text: "Paying the ransom would have guaranteed full recovery.", correct: false },
];

// ── MITRE anchors (verified names/descriptions; deep links open new tab) ──────
const MITRE = [
  { id: "T1486", name: "Data Encrypted for Impact", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1486/", desc: "Adversaries may encrypt data on target systems or on large numbers of systems in a network to interrupt availability to system and network resources." },
  { id: "T1490", name: "Inhibit System Recovery", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1490/", desc: "Adversaries may delete or remove built-in operating system data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery. Mitigated by M1053 Data Backup." },
  { id: "T1485", name: "Data Destruction", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1485/", desc: "Adversaries may destroy data and files on specific systems or in large numbers in a network to interrupt availability." },
  { id: "T1078", name: "Valid Accounts", tactic: "Defense Evasion, Persistence, Privilege Escalation, Initial Access", url: "https://attack.mitre.org/techniques/T1078/", desc: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion." },
];
const EXAMPLE_ACTORS = [
  "Olympic Destroyer — deleted shadow copies via WMI before its wiper payload (documented under T1490).",
  "Wizard Spider (G0102) — Ryuk/Conti-era ransomware operator known for destroying recovery options before encryption (T1486/T1490).",
  "Numerous modern ransomware families pair encryption (T1486) with backup/console credential abuse (T1078) and recovery inhibition (T1490).",
];

// ── Glossary (14 entries — backup types consolidated into one family entry) ───
const GLOSSARY = [
  { term: "RPO (Recovery Point Objective)", def: "Maximum tolerable data loss measured in time — how far back your last good copy may be." },
  { term: "RTO (Recovery Time Objective)", def: "Maximum tolerable downtime — how fast the service must be working again." },
  { term: "Backup types", def: "Full: every block, every run. Incremental: changes since the last backup of any type (restore = full + chain, in order). Differential: changes since the last full (restore = full + latest diff). Synthetic full: a full assembled from existing copies without touching production." },
  { term: "Backup window", def: "The scheduled time slot in which backup jobs must finish without impacting production." },
  { term: "GFS rotation", def: "Grandfather-Father-Son: daily tapes recycled weekly, weeklies kept a month, monthlies kept a year." },
  { term: "3-2-1-1-0", def: "3 copies, 2 media types, 1 offsite, 1 immutable/offline, 0 verification errors." },
  { term: "Snapshot", def: "Point-in-time pointer on the same storage — usually same account/region and lifecycle-coupled to the source. Not a backup." },
  { term: "Object lock (WORM)", def: "Write-once-read-many retention that rejects modification/deletion at the API for a set period — the immutability behind copy #3." },
  { term: "Replication (sync/async)", def: "Copying data changes to a second location. Sync: zero data loss, write latency. Async: small lag. Replication is availability — it is not backup." },
  { term: "Failover / failback", def: "Switching service to the standby site on failure, and switching back once the primary is healthy." },
  { term: "PITR (point-in-time recovery)", def: "Database recovery to an exact moment by replaying transaction logs on top of a base backup." },
  { term: "Archive tier", def: "Deep-cold cloud storage class — cheap, slow retrieval, ideal for long retention copies." },
  { term: "Verification job", def: "Scheduled checksum/hash comparison of stored copies against manifests — the '0 errors' of 3-2-1-1-0." },
  { term: "Legal hold", def: "Retention override for litigation or investigation — a held copy must not be recycled, whatever the schedule says." },
];

// ── Evidence inbox documents (all synthetic) ──────────────────────────────────
const EVIDENCE_DOCS = [
  {
    id: "doc-jobreport",
    title: "Backup job report — week 45",
    kind: "JOB REPORT",
    modes: ["medium"],
    stationHint: "Feeds M4 (failed job).",
    lines: [
      { id: "J1", text: "JOB-2836 · pay-db · full · Sun 22:04 · 4.2 TB · SUCCESS (41 min)" },
      { id: "J2", text: "JOB-2837 · file-share · full · Sun 22:47 · 1.1 TB · SUCCESS (18 min)" },
      { id: "J3", text: "JOB-2838 · web-store · incremental · Mon 22:02 · 84 GB · SUCCESS (6 min)" },
      { id: "J4", text: "JOB-2839 · pay-db · incremental · Mon 22:31 · 12 GB · SUCCESS (2 min)" },
      { id: "J5", text: "JOB-2840 · img-bucket · incremental · Mon 23:01 · 33 GB · SUCCESS (4 min)" },
      { id: "J6", text: "JOB-2841 · file-share · incremental · Tue 22:02 · 96 GB · FAILED — target nas-pool-01: insufficient space (pool 97.9% used)", tone: "bad" },
      { id: "J7", text: "JOB-2842 · pay-db · incremental · Tue 22:31 · 11 GB · SUCCESS (2 min)" },
      { id: "J8", text: "JOB-2843 · web-store · incremental · Tue 22:02 · 79 GB · SUCCESS (6 min)" },
      { id: "J9", text: "Report note: Tuesday dedupe maintenance window closed 03:11, OK (planned).", tone: "info" },
    ],
  },
  {
    id: "doc-storage-events",
    title: "Storage events log — Wednesday",
    kind: "STORAGE EVENTS",
    modes: ["medium"],
    stationHint: "Feeds M5 (snapshot vs backup tagging).",
    lines: [
      { id: "SE-1", text: "09:14 · volume snapshot created for img-bucket (NimbusCloud, same region) · retention 3 days · lifecycle-linked to source bucket", tone: "info" },
      { id: "SE-2", text: "22:02 · nightly image backup of web-store written to offsite object storage · SHA-256 manifest attached · retention 30 days", tone: "info" },
      { id: "SE-3", text: "every hour · snapshot chain on pay-db volume · crash-consistent · chain deleted if source volume is deleted", tone: "info" },
      { id: "SE-4", text: "Sun 23:40 · weekly logical dump of pay-db exported to immutable archive bucket (cross-region) · restore verified quarterly", tone: "info" },
    ],
  },
  {
    id: "doc-audit",
    title: "Backup console audit log — Saturday",
    kind: "AUDIT LOG",
    modes: ["hard"],
    stationHint: "Feeds H1 (attack path).",
    lines: [
      { id: "L01", text: "02:58 · svc-devdeploys mounted share ml-datasets (40 GB) onto nas-pool-01 — change #CH-8801", tone: "info" },
      { id: "L02", text: "03:14 · svc-scheduler opened planned dedupe maintenance window (03:14–05:10)", tone: "info" },
      { id: "L03", text: "03:41 · LOGIN svc-backupadm from 198.51.100.77 — ASN 'Ridgeline Telecom' (not on allow-list) · MFA push #1 DENIED", tone: "warn" },
      { id: "L04", text: "03:42 · MFA push #2 DENIED", tone: "warn" },
      { id: "L05", text: "03:43 · MFA push #3 DENIED", tone: "warn" },
      { id: "L06", text: "03:44 · MFA push #4 APPROVED — no number-matching policy configured", tone: "bad" },
      { id: "L07", text: "03:45 · session s-9921 created · role BackupAdmin · MFA method: push", tone: "bad" },
      { id: "L08", text: "03:52 · GET /copies — full inventory listing", tone: "warn" },
      { id: "L09", text: "04:07 · DELETE /copies/nas-01 → 200 OK", tone: "bad" },
      { id: "L10", text: "04:11 · DELETE /copies/cloud-std → 200 OK", tone: "bad" },
      { id: "L11", text: "04:12 · DELETE /copies/cloud-lock → 409 CONFLICT — 'object lock: WORM compliance mode'", tone: "ok" },
      { id: "L12", text: "04:15 · POST /export — 2.1 TB restore-point export to external endpoint 198.51.100.77", tone: "bad" },
      { id: "L13", text: "04:31 · LOGOUT · session s-9921 closed" },
      { id: "L14", text: "05:10 · svc-scheduler closed dedupe window — reclaimed 2.2 GB, OK", tone: "info" },
      { id: "L15", text: "06:05 · file-share endpoint EDR: ransom note 'DARKMOSS_README.txt' dropped", tone: "bad" },
      { id: "L16", text: "06:10 · SOC declared P1 — production and backup estate untrusted", tone: "bad" },
    ],
  },
  {
    id: "doc-phish",
    title: "Phishing report — Monday (mdelgado)",
    kind: "MAIL TRIAGE",
    modes: ["hard"],
    stationHint: "Supports H1 (initial access).",
    lines: [
      { id: "P1", text: "From: storage-alerts@nimbus-notify.example-login.com (synthetic look-alike domain)", tone: "bad" },
      { id: "P2", text: "To: m.delgado@halcyonfoods.example (backup administrator)", tone: "info" },
      { id: "P3", text: "Subject: URGENT — your NimbusCloud backup storage quota expires in 24 h" },
      { id: "P4", text: "Body: 'Validate your service credentials to avoid job failures.' → hxxps://nimbus-notify.example-login.com/quota", tone: "bad" },
      { id: "P5", text: "User action: clicked and entered service-account credentials on the look-alike page (reported by user, Monday 09:12)", tone: "bad" },
      { id: "P6", text: "Mail triage verdict: credential harvesting phishing (synthetic training artifact)", tone: "info" },
    ],
  },
  {
    id: "doc-sat-fail",
    title: "Saturday full-backup failure bundle",
    kind: "AGENT LOG + CAPACITY",
    modes: ["hard"],
    stationHint: "Feeds H2 (root cause).",
    lines: [
      { id: "A1", text: "00:00 · JOB-312 (full · file-share → nas-pool-01) dispatched" },
      { id: "A2", text: "00:41 · transferring 612 GB — rate 310 MB/s, stable" },
      { id: "A3", text: "01:10 · ERR_INSUFFICIENT_SPACE pool=nas-pool-01 free=2.1%", tone: "bad" },
      { id: "A4", text: "01:10 · retry #1 → same error", tone: "warn" },
      { id: "A5", text: "01:12 · JOB-312 FAILED (22 min in window, 04:00 window not reached)", tone: "bad" },
      { id: "S1", text: "scheduler · 00:00 · dedupe maintenance window open (planned — no policy conflict)", tone: "info" },
      { id: "S2", text: "scheduler · 00:00 · JOB-312 dispatched normally, credentials valid", tone: "info" },
      { id: "C1", text: "capacity · nas-pool-01 97.9% used — Monday 22:00 baseline: 81%", tone: "bad" },
      { id: "C2", text: "capacity · Δ +40.0 GB after ml-datasets mount (svc-devdeploys, change #CH-8801)", tone: "warn" },
      { id: "C3", text: "capacity · dedupe reclaimed 2.2 GB inside planned window — no anomaly", tone: "info" },
    ],
  },
  {
    id: "doc-repl",
    title: "Replication report — payment DB",
    kind: "REPLICATION",
    modes: ["hard"],
    stationHint: "Feeds H5 (RPO breach math).",
    lines: [
      { id: "RP1", text: "Mode: async cross-region log shipping · interval 15 min" },
      { id: "RP2", text: "Last log shipped: Saturday 05:31" },
      { id: "RP3", text: "Replication lag at incident: 42 min (regional backbone degradation)" },
      { id: "RP4", text: "Last verified full: Sunday 22:00" },
      { id: "RP5", text: "Incident detected: Saturday 06:10 · recovery RPO: 15 min" },
    ],
  },
  {
    id: "doc-runbook",
    title: "DR runbook v3 — file-share restore",
    kind: "RUNBOOK",
    modes: ["hard"],
    stationHint: "Feeds H4 (drill sequencing).",
    lines: [
      { id: "RB1", text: "Scope: HQ file share ransomware restore · Target RTO: 4 h" },
      { id: "RB2", text: "Steps are listed alphabetically by owner — assemble them in execution order on the Drill Floor." },
      { id: "RB3", text: "Owners: D1 SOC · D2 backup admin · D3 incident commander · D4 storage team · D5 storage team · D6 service desk · D7 continuity lead" },
      { id: "RB4", text: "Known drill finding 2024: a missing internal DNS record cost 40 min — updated in v3." },
    ],
  },
  {
    id: "doc-alerts",
    title: "Alert scenarios sheet — pager tuning",
    kind: "ALERT POLICY",
    modes: ["hard"],
    stationHint: "Feeds H7 (alert triage).",
    lines: [
      { id: "AA1", text: "AL-1 · DELETE API call against a backup copy, outside any approved change window." },
      { id: "AA2", text: "AL-2 · Verification sweep reports a checksum mismatch on one copy." },
      { id: "AA3", text: "AL-3 · Monthly retention job completed successfully, nothing flagged." },
      { id: "AA4", text: "AL-4 · Cross-region replication lag reached 3× the asset's RPO threshold." },
      { id: "AA5", text: "AL-5 · Backup report email bounced — the IT mailbox rejected it." },
    ],
  },
  {
    id: "doc-memo",
    title: "Incident review memo (draft) — for the post-incident report",
    kind: "REVIEW MEMO",
    modes: ["hard"],
    stationHint: "Feeds H8 (defensible statements).",
    lines: [
      { id: "M0", text: "Draft statements — strike everything a regulator or insurer could challenge." },
    ],
  },
];

// ── Knowledge check banks (C5) ────────────────────────────────────────────────
// QA fixes carried over from the original: R4 correct-answer rotation
// (M=[2,0,3,1,2,0], H=[2,0,3,1,2,0,3]) and R5 length discipline. Each item
// carries a `topic` for the completion report's focus areas (R8).
const QUIZ_MEDIUM = [
  {
    id: "MQ1",
    topic: "Restore chains (full + incrementals, differential math)",
    q: "Schedule: Sunday full + daily incrementals Mon–Sat. Corruption hits Saturday 20:00. Which restores to Friday 23:59?",
    options: [
      "Sunday's full + Saturday's incremental only",
      "Friday's incremental replayed from scratch",
      "Sunday's full + the Mon–Sat incrementals",
      "Sunday's full + Friday's differential only",
    ],
    answer: 2,
    explain: "An incremental chain is base + every incremental since, replayed in order — skip one link and the chain breaks. A alone misses six links; B has no base to replay onto; D describes a differential scheme, which would need Friday's diff instead of the week's incrementals (bigger transfers all week, far more robust at restore time).",
  },
  {
    id: "MQ2",
    topic: "RPO vs RTO definitions",
    q: "The ops lead says: 'We can tolerate losing at most 1 hour of orders, and the store must be selling again within 4 hours.' What are these numbers?",
    options: [
      "RPO 1 h / RTO 4 h",
      "RTO 1 h / RPO 4 h",
      "RPO 4 h / RTO 1 h",
      "RPO 1 h / RTO 1 h",
    ],
    answer: 0,
    explain: "RPO = Recovery Point Objective — maximum tolerable DATA LOSS (1 h of orders). RTO = Recovery Time Objective — maximum tolerable DOWNTIME (4 h to sell again). B, C and D swap or collapse the two numbers; only A keeps loss-time paired with data and repair-time paired with service. RPO drives backup frequency; RTO drives site tier and replication.",
  },
  {
    id: "MQ3",
    topic: "3-2-1-1-0 rule semantics",
    q: "An estate already has 3 copies on 2 media, 1 offsite. Which single addition upgrades it to 3-2-1-1-0?",
    options: [
      "A third media type across every copy",
      "Switching every job to full-only runs",
      "A fourth copy inside the same account",
      "An immutable copy plus zero errors",
    ],
    answer: 3,
    explain: "The first '1' is immutability or air gap (survives credential theft — DELETE returns 409); the '0' is zero verification errors (checksums prove the copies are restorable). A adds media nobody requires, B wastes windows without adding protection, and C deepens the same-account blast radius instead of escaping it.",
  },
  {
    id: "MQ4",
    topic: "Snapshot vs backup (shared fate)",
    q: "Why is a same-account volume snapshot NOT a backup?",
    options: [
      "Snapshots cannot be scheduled on any rota",
      "It shares the account, region and lifecycle",
      "Snapshots are always crash-consistent by design",
      "Snapshots are slower to create than backups",
    ],
    answer: 1,
    explain: "A snapshot is a point-in-time pointer on the same storage: compromise of the account, bulk deletion or a regional failure takes source and snapshots together. A, C and D are false capability claims — snapshots CAN be scheduled and CAN be application-consistent; the fatal flaw is shared fate, not capability.",
  },
  {
    id: "MQ5",
    topic: "DR site tiers vs RTO/budget",
    q: "A business unit has RTO 72 h and almost no budget. Which DR site tier fits?",
    options: [
      "Hot site",
      "Warm site",
      "Cold site",
      "Warm site lease",
    ],
    answer: 2,
    explain: "Cold site = space, power and connectivity, restored from backups over days — exactly what a 72 h RTO tolerates. A hot site pays for minutes nobody needs here, and either warm option buys hours the budget cannot justify. Pay for availability the RTO actually requires.",
  },
  {
    id: "MQ6",
    topic: "Immutability (WORM) vs encryption",
    q: "Ransomware holds valid BackupAdmin credentials and DELETEs every copy it can reach. Which control saves the recovery?",
    options: [
      "An object-locked (WORM) copy",
      "AES-256 encryption at rest",
      "TLS 1.3 for traffic in transit",
      "Compression on every target",
    ],
    answer: 0,
    explain: "Deletion is an API call against the storage layer (MITRE T1490 Inhibit System Recovery). B and C protect confidentiality and the wire — neither refuses a DELETE; D is irrelevant to survivability. Object lock rejects the call itself even with admin credentials: that is mitigation M1053 Data Backup doing its job.",
  },
];

const QUIZ_HARD = [
  {
    id: "HQ1",
    topic: "Restoring from verified chains under failure",
    q: "Saturday's full failed (pool 97.9%). You must restore the file share NOW (RTO 4 h). Which set do you use?",
    options: [
      "Last night's full, which failed at 97.9%",
      "The same-account volume snapshot from Thursday",
      "Sunday full + Mon–Fri incrementals in order",
      "Friday's differential, but without its base",
    ],
    answer: 2,
    explain: "Restore from what exists and verifies: the base full plus the incremental chain to the last clean point. A does not exist, C is not restorable without its base, and B shares the incident's blast radius on the same account.",
  },
  {
    id: "HQ2",
    topic: "PITR / transaction-log recovery",
    q: "Payment DB: last transaction log shipped 05:31, incident detected 06:10. What is the correct recovery approach?",
    options: [
      "Point-in-time recovery replaying to 05:31",
      "Full restore from Sunday's last verified full",
      "The three-day-old volume snapshot restore",
      "Rebuild from the application-level exports",
    ],
    answer: 0,
    explain: "PITR replays transaction logs on top of the base backup to an exact moment — 05:31 — losing only the unshipped 39 minutes. B would discard six days of committed transactions; C shares the blast radius; D throws away database consistency. PITR is precisely why databases ship their own logs.",
  },
  {
    id: "HQ3",
    topic: "DR site tier selection under RTO+budget",
    q: "The payment platform needs RTO 1 h; budget allows exactly one site tier. Which do you buy?",
    options: [
      "A warm site tier",
      "A cold site tier",
      "No site — tapes only",
      "A hot site tier",
    ],
    answer: 3,
    explain: "A 1-h RTO needs infrastructure already running: hot tier (or DRaaS hot). A takes hours to provision and start, B takes days, and C measures media restore, not service recovery — tapes alone never meet a service RTO.",
  },
  {
    id: "HQ4",
    topic: "Backup-console hardening (MFA + object lock)",
    q: "Audit log: valid BackupAdmin session issues DELETE calls at 04:07. Which control PAIR prevents a repeat?",
    options: [
      "Encryption at rest + faster disks",
      "Number-matching MFA + object lock",
      "Longer windows + more full backups",
      "Compression + tighter backup windows",
    ],
    answer: 1,
    explain: "Attack the two links in the chain: number-matching MFA stops push-fatigue approval of the stolen session; object lock makes the DELETE call itself fail with 409 regardless of the caller. A, C and D optimize performance or scheduling — none changes survivability.",
  },
  {
    id: "HQ5",
    topic: "Replication vs backup under ransomware",
    q: "'Replication is availability, not backup.' Why doesn't cross-region replication alone defeat ransomware?",
    options: [
      "Replicated data skips integrity verification jobs",
      "Replication runs on slower links than backups",
      "It mirrors destructive changes to the replica",
      "Replica regions fail at the same time",
    ],
    answer: 2,
    explain: "Replication mirrors changes — including malicious ones — within minutes. It defeats hardware and region failure, not destructive logic. A is false (replicas can be verified), B is irrelevant to the threat, and D describes synchronous-coupled failure, not ransomware behavior. You still need independent, versioned, immutable restore points the production side cannot reach.",
  },
  {
    id: "HQ6",
    topic: "Restore drill ordering (contain → clean → serve)",
    q: "Ransomware confirmed on the file share. What is the FIRST step of the restore drill?",
    options: [
      "Isolate the host; disable shares",
      "Restore the latest backup in place",
      "Run a full verification sweep first",
      "Email users a holding status note",
    ],
    answer: 0,
    explain: "Contain before you clean: restoring into a live infection re-encrypts the restored data. B re-infects, C is step two (verify the chain after isolation), D is communication, not containment. Isolation is step one of every documented runbook — then verify, restore to a clean volume, validate, and only then repoint users.",
  },
  {
    id: "HQ7",
    topic: "Compliance-driven control selection",
    q: "Constraints: 7-year tamper-evident retention, no second DC, 500 GB/night cap. Which design is compliant?",
    options: [
      "Same-account snapshots with a 7-year lifecycle plan",
      "A public read bucket with signed auditor URLs",
      "A second datacenter in another cloud region",
      "WORM archive, offline tape, async incrementals",
    ],
    answer: 3,
    explain: "WORM archive satisfies tamper-evidence at the storage layer; the offline tape adds an air-gapped copy beyond the cloud account; ~180 GB/night async fits the cap. A shares the account's blast radius, B creates the exposure it claims to solve, and C violates the budget constraint outright.",
  },
];
