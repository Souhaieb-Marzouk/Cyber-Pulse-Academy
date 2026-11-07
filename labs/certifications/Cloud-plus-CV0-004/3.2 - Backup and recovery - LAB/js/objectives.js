// ── objectives.js — mastery blueprint: objective registry + validation engine ─
// Ported 1:1 from the original (src/lib/lab/objectives.ts). Every rule, branch,
// near-miss rejection and feedback message is identical.

// Same synonym tolerance as the original (dossier A5).
function norm(s) {
  return String(s == null ? "" : s).toLowerCase().trim().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function ok(title, message) { return { ok: true, title, message }; }
function no(title, message) { return { ok: false, title, message }; }

// ── MEDIUM ─────────────────────────────────────────────────────────────────────
const m1 = {
  id: "OBJ-M1", mode: "medium", pillar: "P1", station: "planner",
  title: "Label the backup types",
  prompt: "Seven scheduled jobs sit in the planner grid. Set each job's type to full, incremental, differential or synthetic, then CHECK. Look at each job's note and size — the pattern tells you the type.",
  hints: [
    "Sunday reads everything. Weekday jobs that copy 'since yesterday's backup of any type' share one type.",
    "Friday's 2.1 TB job counts all changes since Sunday's full — that prefix defines its type.",
    "Saturday's job builds a full without re-reading the source: full, incremental, incremental, incremental, incremental, differential, synthetic.",
  ],
  check: (env) => {
    const wrong = Object.keys(JOB_TYPE_ANSWERS).filter((j) => env.jobTypes[j] !== JOB_TYPE_ANSWERS[j]);
    if (wrong.length === 0)
      return ok("Chain decoded",
        "Full on Sunday; four incrementals Mon–Thu (tiny, chain-dependent); Friday's differential (grows all week); Saturday's synthetic full (rebuilt without touching production). Restore cost is the trade: incrementals are cheapest to take and most fragile to restore.");
    return no(`${wrong.length} job(s) mislabeled`,
      `Re-read the notes: 'since the last backup of any type' = incremental, 'since Sunday's full' = differential, 'everything' = full, 'rebuilt without re-reading production' = synthetic. Check: ${wrong.join(", ")}.`);
  },
};

const m2 = {
  id: "OBJ-M2", mode: "medium", pillar: "P1", station: "planner",
  title: "Map assets to recovery tiers",
  prompt: "Open the business impact table and assign each of the four assets the recovery tier (RPO/RTO pair) a grocery retailer would realistically buy. CHECK when the four rows are set.",
  hints: [
    "RPO = tolerable data loss, RTO = tolerable downtime. Card payments lose money by the minute.",
    "The storefront tolerates minutes of loss but not hours of downtime; the image bucket and HR archive can wait.",
    "Payment DB → T1 (15 min/1 h), Online store → T2 (1 h/4 h), Images → T3 (24 h/24 h), HR archive → T4 (24 h/72 h).",
  ],
  check: (env) => {
    const answer = { "pay-db": "T1", "web-store": "T2", "img-bucket": "T3", "hr-share": "T4" };
    const wrong = Object.keys(answer).filter((a) => env.assetTiers[a] !== answer[a]);
    if (wrong.length === 0)
      return ok("Business impact honored",
        "RPO/RTO are business decisions, not IT preferences: payment DB gets continuous log shipping (T1), the storefront hourly replication, static images and cold archives nightly backups. Every backup frequency you schedule later flows from this table.");
    return no("Tier mismatch",
      `Re-read the asset descriptions. ${TIERS.map((t) => `${t.id} = RPO ${t.rpo}/RTO ${t.rto}`).join(" · ")}. Which asset loses revenue per minute, and which one is accessed quarterly? Recheck: ${wrong.join(", ")}.`);
  },
};

const m3 = {
  id: "OBJ-M3", mode: "medium", pillar: "P1", station: "drill",
  title: "Think like the attacker",
  prompt: "On the Threat Board: select the TWO reasons ransomware crews target backup infrastructure first, and the ONE defense that breaks that play. CHECK your set.",
  hints: [
    "Attackers follow value and leverage: what hurts the victim most, and what gives one credential maximum reach.",
    "Discard any option that is technically false — encryption does not make backups worthless to delete, and same-account snapshots share the attack's blast radius.",
    "Motives: R1 + R2. The breaker: R4 — object lock rejects deletion at the API (MITRE T1490 is the attack, M1053 Data Backup is the answer).",
  ],
  check: (env) => {
    const motivesOk = env.attackReasons.length === 2 && env.attackReasons.includes("R1") && env.attackReasons.includes("R2");
    const breakerOk = env.immutableReason === "R4";
    if (motivesOk && breakerOk)
      return ok("Threat model aligned",
        "Backups are the last recovery option, so destroying them (T1490 Inhibit System Recovery) forces payment after encryption (T1486). High-privilege service accounts make the estate a single-credential jackpot (T1078). Immutability breaks the play: a WORM-locked copy refuses DELETE even for a valid admin — that is MITRE mitigation M1053 Data Backup in action.");
    if (!motivesOk && breakerOk) return no("Motives need work", "Pick exactly TWO motives: one about leverage over the victim, one about the reach of stolen backup credentials.");
    if (motivesOk && !breakerOk) return no("The breaker is missing", "Which control rejects deletion at the storage API itself, regardless of who calls it? Hint: it lives on copy 3 in the vault.");
    return no("Select 2 motives + 1 breaker", "Use the checkboxes for motives (exactly two) and the radio for the defense that breaks the play (exactly one).");
  },
};

const m4 = {
  id: "OBJ-M4", mode: "medium", pillar: "P2", station: "evidence",
  title: "Triage Monday's job report",
  prompt: "In Evidence, open 'Backup job report — week 45'. Find the failed job: enter its Job ID and classify the failure (missed window / quota / verification / credential). CHECK to submit.",
  hints: [
    "Scan the STATUS column — exactly one row is not SUCCESS.",
    "The error text names the target pool and the reason it refused the write.",
    "JOB-2841 — the target pool filled up: a quota/capacity failure.",
  ],
  check: (env) => {
    const idOk = norm(env.failedJobId).replace("job", "").trim() === "2841";
    const causeOk = ["quota", "storage", "space", "capacity", "insufficient space"].includes(norm(env.failedCause));
    if (idOk && causeOk)
      return ok("Failure classified",
        "JOB-2841 failed because the target pool nas-pool-01 had no room — a capacity/quota failure, not a scheduling or credential problem. Ops triage rule: read the error text, classify the failure class, then fix the class (capacity → free/move data; window → reschedule; verification → quarantine + rebuild; credential → rotate). Watch this same pool again in the Hard mode incident.");
    if (idOk) return no("Job ID right, class wrong", "The error says 'insufficient space (pool 97.9% used)'. Which of the four classes matches a full disk?");
    if (causeOk) return no("Class right, ID wrong", "Only one row in the report is FAILED — capture its exact Job ID.");
    return no("Not yet", "Open the report and look for the row whose status is FAILED. Enter the exact Job ID and pick the matching failure class.");
  },
};

const m5 = {
  id: "OBJ-M5", mode: "medium", pillar: "P2", station: "evidence",
  title: "Snapshot or backup?",
  prompt: "Open 'Storage events log — Wednesday' and tag each of the four events as SNAPSHOT or BACKUP. CHECK the four tags.",
  hints: [
    "Ask: does this copy live on separate storage, offsite, with its own retention — or inside the same account/region as the source?",
    "Lifecycle-coupled copies die with the source. That coupling is the snapshot tell.",
    "SE-1 snapshot · SE-2 backup · SE-3 snapshot · SE-4 backup.",
  ],
  check: (env) => {
    const answer = { "SE-1": "snapshot", "SE-2": "backup", "SE-3": "snapshot", "SE-4": "backup" };
    const wrong = Object.keys(answer).filter((k) => env.eventTags[k] !== answer[k]);
    if (wrong.length === 0)
      return ok("Copies classified like a pro",
        "Snapshots are point-in-time pointers on the same storage — same account, same region, lifecycle-coupled to the source, usually crash-consistent. A backup lives on separate media (ideally offsite) with independent retention and verification. Ransomware deleting the source account takes its snapshots with it — 'replication is availability; backup is recovery.'");
    return no(`${wrong.length} tag(s) off`, `Re-examine ${wrong.join(", ")}: same region/account/lifecycle → snapshot; separate media + own manifest + retention → backup.`);
  },
};

const m6 = {
  id: "OBJ-M6", mode: "medium", pillar: "P2", station: "drill",
  title: "Pick the minimal restore set",
  prompt: "The HQ file share was corrupted Thursday 10:12; you are restoring to Thursday 09:45. On the Restore Workbench, select the MINIMUM set of jobs needed. CHECK the set.",
  hints: [
    "Incremental chains rebuild forward: you need the base, then every incremental up to the restore point.",
    "Anything taken AFTER the restore point is useless for this recovery.",
    "Sunday full + Mon, Tue, Wed, Thu incrementals — five jobs, in that order.",
  ],
  check: (env) => {
    const want = RESTORE_INCIDENT.answer;
    const got = [...env.restoreSet].sort();
    const same = want.length === got.length && want.every((j) => got.includes(j));
    if (same) return ok("Minimal chain assembled",
      "Full (Sun) + four incrementals (Mon–Thu) = the only jobs needed to reach Thursday 09:45. Friday's differential is later than the restore point, and JOB-107 didn't exist yet — extra media means slower restores and a bigger failure surface. With differentials instead, you'd need only Sun full + latest diff: that robustness is exactly why teams mix both.");
    if (got.length > want.length) return no("Too much media", "You selected jobs taken after Thursday 09:45 — they can't help a restore TO that point. Which end of the week can you trim?");
    return no("Chain incomplete", "An incremental chain is base + every incremental up to the restore point. Count the days from Sunday's full to Thursday 09:45.");
  },
};

const m7 = {
  id: "OBJ-M7", mode: "medium", pillar: "P3", station: "vault",
  title: "Run the integrity sweep",
  prompt: "In the Vault, RUN VERIFICATION, study the manifest vs stored checksums, select the mismatched copy and QUARANTINE it. The objective passes when the corrupt artifact is quarantined.",
  hints: [
    "The verification table compares two hashes per artifact — only one row disagrees.",
    "A mismatch means stored bytes differ from the manifest: restore-time corruption waiting to happen.",
    "ART-04 (file-share Tue incremental on the NAS) — quarantine it.",
  ],
  check: (env) => {
    if (!env.verificationRan) return no("Verification not run", "Press RUN VERIFICATION first — the '0 errors' of 3-2-1-1-0 is measured, never assumed.");
    if (env.quarantined.includes("ART-04") && env.quarantined.length === 1)
      return ok("Corrupt copy contained",
        "ART-04's stored hash diverged from its manifest — restoring that incremental would inject corruption mid-chain. Quarantine stops it being used; next step is a fresh incremental tonight. This is the '0' in 3-2-1-1-0: integrity is verified on a schedule, not discovered during a disaster.");
    if (env.quarantined.includes("ART-04")) return no("Only the bad one", "Exactly one artifact mismatched — quarantine just ART-04. Healthy copies stay in rotation.");
    return no("Wrong copy quarantined", "Compare the two hash columns row by row — which artifact's manifest and stored hashes disagree?");
  },
};

const m8 = {
  id: "OBJ-M8", mode: "medium", pillar: "P3", station: "vault",
  title: "Tune the pager policy",
  prompt: "The on-call engineer must sleep. On the Paging Console, select EVERY event that should page a human at 03:00, and leave the noise out. CHECK the selection.",
  hints: [
    "Page = data loss or destruction in progress. Ticket = worth knowing tomorrow. Silence = expected behavior.",
    "'Succeeded as scheduled' events are the definition of noise.",
    "Page on: failed job, checksum mismatch, DELETE call, replication lag beyond RPO. Leave the two routine-success events out.",
  ],
  check: (env) => {
    const got = [...env.pager].sort();
    const want = [...PAGER_ANSWERS].sort();
    const same = want.length === got.length && want.every((e) => got.includes(e));
    if (same)
      return ok("Signal survives, noise sleeps",
        "Four events threaten recovery and page: job failure, checksum mismatch, copy deletion (T1490's fingerprint), replication lag beyond RPO. Retention success and scheduled dedupe are receipts, not alarms — paging on them trains humans to mute the channel. Alert fatigue killed faster incidents than any zero-day.");
    return no("Policy needs tuning",
      got.length > want.length
        ? "Something you paged on is expected daily behavior — would you want a 03:00 call for a successful retention sweep?"
        : "You are missing a destructive or data-loss event. Which four events mean the backup estate itself is in danger?");
  },
};

const m9 = {
  id: "OBJ-M9", mode: "medium", pillar: "P4", station: "vault",
  title: "Fix the vault to 3-2-1-1-0",
  prompt: "Today the vault fails the rule. Re-point COPY-2 to the cross-region archive, switch object lock ON for COPY-3, and leave COPY-1 as the fast local copy. CHECK the vault.",
  hints: [
    "3 copies ✓ · 2 media ✓ (disk + object) — but '1 offsite' fails while COPY-2 shares production's region, and '1 immutable' fails while every lock is off.",
    "Same-region cloud dies with the region. Immutability is a switch on the archive tier — compliance mode cannot be undone, even by an admin.",
    "COPY-1 stays nas · COPY-2 → cloud-xreg · COPY-3 lock ON. That is 3 copies, 2 media, 1 offsite (region B), 1 immutable, 0 errors (M7).",
  ],
  check: (env) => {
    const t2 = env.copyTargets["copy-2"] === "cloud-xreg";
    const l3 = env.copyLocks["copy-3"] === true;
    const t1ok = env.copyTargets["copy-1"] === "nas";
    if (t2 && l3 && t1ok)
      return ok("Vault meets 3-2-1-1-0",
        "3 copies (NAS + 2 cloud), 2 media types (disk + object), 1 offsite (cross-region archive survives a regional disaster), 1 immutable (object-lock WORM — ransomware with full admin creds gets HTTP 409), 0 errors (your M7 sweep). Every term in the rule now maps to a control you personally set.");
    if (!t1ok) return no("Keep a fast local copy", "COPY-1 as on-site NAS is intentional — restores from the local disk are 10× faster than archive retrieval. Put it back.");
    if (!t2) return no("COPY-2 still shares the region", "COPY_OPTIONS: move COPY-2 to the cross-region archive target — same-region buckets fall to the same disaster as production. Options: " + COPY_TARGETS.map((c) => c.id).join(" / ") + ".");
    return no("Almost — immutability missing", "COPY-2 is fixed, but COPY-3's object lock is OFF. Without it, DELETE with stolen credentials returns 200, not 409.");
  },
};

const m10 = {
  id: "OBJ-M10", mode: "medium", pillar: "P4", station: "vault",
  title: "Label the GFS tape rack",
  prompt: "Fifteen tapes, one rotation plan: label each tape D (daily), W (weekly), M (monthly) or HOLD (legal hold). CHECK the rack.",
  hints: [
    "The rotation plan is written above the rack: 7 daily, 4 weekly, 3 monthly… plus one sealed exception.",
    "Rack order follows the plan — A rack is daily, B rack weekly, C rack monthly… but read C-4's slot note.",
    "T-01…T-07 = D · T-08…T-11 = W · T-12…T-14 = M · T-15 = HOLD.",
  ],
  check: (env) => {
    const wrong = Object.keys(TAPE_ANSWERS).filter((t) => env.tapeLabels[t] !== TAPE_ANSWERS[t]);
    if (wrong.length === 0)
      return ok("Rotation restored",
        "GFS: sons (daily) recycled weekly, fathers (weekly) kept a month, grandfathers (monthly) kept a year — a bad backup only lives as long as its cycle. T-15 stays sealed: a legal hold overrides every retention schedule, and recycling evidence tape is the kind of mistake regulators write up.");
    return no(`${wrong.length} tape(s) mislabeled`, `Follow the rack layout and the sealed slot note. Recheck: ${wrong.slice(0, 6).join(", ")}${wrong.length > 6 ? "…" : ""}.`);
  },
};

const m11 = {
  id: "OBJ-M11", mode: "medium", pillar: "P4", station: "planner",
  title: "Choose the DR site tiers",
  prompt: "The continuity map lists three business units with their RTOs and budget reality. Assign each a site type: hot, warm or cold. CHECK the map.",
  hints: [
    "Site tier tracks RTO: minutes → hot, hours → warm, days → cold. Budget falls the same direction.",
    "Card payments at 1 h RTO need a running replica. The HR archive at 72 h can be rebuilt from the vault.",
    "Payment platform → hot · file share → warm · HR archive → cold.",
  ],
  check: (env) => {
    const wrong = Object.keys(DR_ANSWERS).filter((b) => env.drSites[b] !== DR_ANSWERS[b]);
    if (wrong.length === 0)
      return ok("Continuity map costed",
        "Hot (running replica, minutes) for the payment platform, warm (equipped-but-idle, hours) for the file share, cold (space and power, days) for the HR archive. DR tiering is where RTO meets money — buying hot for everything is how continuity programs get cancelled. DRaaS rents you the warm tier when capex is tight.");
    return no("Tiering mismatch", `Match RTO to cost: 1 h → hot, 4 h → warm, 72 h → cold. Recheck: ${wrong.join(", ")}.`);
  },
};

const m12 = {
  id: "OBJ-M12", mode: "medium", pillar: "P4", station: "vault",
  title: "Harden the backup estate",
  prompt: "On the Hardening Panel, switch ON every control the estate needs and leave the three traps OFF. CHECK the panel.",
  hints: [
    "Ask each switch: does it protect confidentiality/integrity of copies, or does it just sound operational?",
    "One trap slows and bloats transfers; one opens the estate to the internet; one silently destroys archives and legal holds.",
    "ON: encryption at rest, TLS in transit, number-matching MFA, dedicated least-privilege account. OFF: no-compression, public portal, auto-delete.",
  ],
  check: (env) => {
    const wrongOn = HARDENING_SWITCHES.filter((s) => s.correct && !env.hardening[s.id]).map((s) => s.id);
    const wrongOff = HARDENING_SWITCHES.filter((s) => !s.correct && env.hardening[s.id]).map((s) => s.id);
    if (wrongOn.length === 0 && wrongOff.length === 0)
      return ok("Estate hardened",
        "Encryption protects stolen media; TLS protects the wire; number-matching MFA kills push-fatigue (the exact trick in this week's incident); a dedicated least-privilege account shrinks the phishing surface. The traps: disabling compression triples transfer size, a public portal hands attackers the keys, and auto-delete would have burned your legal hold and every archive.");
    return no(`Panel not right yet (${wrongOn.length} missing, ${wrongOff.length} wrongly on)`,
      `${wrongOn.length ? "Still off: " + wrongOn.join(", ") + ". " : ""}${wrongOff.length ? "Wrongly on: " + wrongOff.join(", ") + "." : ""} Ask: does this control protect copies, or create new risk?`);
  },
};

// ── HARD ───────────────────────────────────────────────────────────────────────
const h1 = {
  id: "OBJ-H1", mode: "hard", pillar: "P2", station: "evidence",
  title: "Reconstruct the attack path",
  prompt: "P1 declared. From the audit log and mail triage, report: (a) initial access vector, (b) compromised account, (c) EVERY copy destroyed, (d) the surviving copy and why it survived. Exact values only — CHECK grades all four parts.",
  hints: [
    "Two log lines are legitimate operations. Everything that matters happened between 03:41 and 04:31.",
    "Read L03–L07 in order: where did the session come from, and how did MFA fall? Then read L09–L11: which DELETE calls returned 200, and which returned 409?",
    "(a) credential phishing · (b) svc-backupadm · (c) nas-01 + cloud-std · (d) cloud-lock — WORM object lock rejected DELETE (409).",
  ],
  check: (env) => {
    const a = env.h1Vector === "phish";
    const b = env.h1Account === "svc-backupadm";
    const c = env.h1Destroyed.length === 2 && env.h1Destroyed.includes("nas-01") && env.h1Destroyed.includes("cloud-std");
    const d = env.h1Survivor === "cloud-lock" && env.h1SurvivorWhy === "worm";
    if (a && b && c && d)
      return ok("Attack path nailed end-to-end",
        "Phish → svc-backupadm credentials → push-fatigue MFA (no number matching) → BackupAdmin session → DELETE nas-01 (200) and cloud-std (200) — T1078 Valid Accounts enabling T1490 Inhibit System Recovery, then a 2.1 TB export (T1530 Data from Cloud Storage) before encryption (T1486). cloud-lock survived because WORM object lock rejects the API call itself — the control you enabled in Medium mode, catching a live attack.");
    const parts = [a, b, c, d];
    const n = parts.filter(Boolean).length;
    return no(`${n}/4 parts correct`, "Near-misses rejected: check each part against the exact log lines — the account is a service account name, the destroyed list is EVERY copy with a 200 response, and the 'why' is the specific API behavior on L11.");
  },
};

const h2 = {
  id: "OBJ-H2", mode: "hard", pillar: "P3", station: "evidence",
  title: "Root-cause Saturday's missed full",
  prompt: "JOB-312 (file-share full) never completed. From the failure bundle, name the root-cause CODE and cite the TWO evidence lines that prove it (the error line + the change that caused it). CHECK grades code + both line IDs.",
  hints: [
    "The agent log tells you WHAT stopped the job; the capacity report tells you WHY the pool was full.",
    "The dedupe window is a red herring: planned, policy-clean, closed OK. Credential and network theories have no supporting lines.",
    "Cause QUOTA · lines A3 (ERR_INSUFFICIENT_SPACE) + C2 (+40 GB after the ml-datasets mount).",
  ],
  check: (env) => {
    const c = env.h2Cause === "quota";
    const l = env.h2Lines;
    const linesOk = l.includes("A3") && (l.includes("C2") || l.includes("C1")) && l.length === 2;
    if (c && linesOk)
      return ok("Root cause proven, not guessed",
        "A3 is the mechanism (insufficient space), C2 is the origin (an approved 40 GB dev mount pushed the pool to 97.9%). S1/S2/C3 are the red herrings — the dedupe window was planned and clean. Defensible root-cause = what broke + what changed. Process fix: capacity alerting at 85%, and dev mounts go through backup-impact review.");
    if (!c) return no("Wrong cause code", "Credentials were valid (S2), the window didn't collide (S1), transfer rate was stable (A2). What did the agent actually run out of?");
    return no("Citation incomplete", "Exactly two lines: the error line in the agent log, plus the capacity line showing what consumed the pool. Which C-line names the change?");
  },
};

const h3 = {
  id: "OBJ-H3", mode: "hard", pillar: "P4", station: "planner",
  title: "Rebuild the plan to meet RPO/RTO",
  prompt: "Re-architect after the incident. For Payment DB (RPO 15 min/RTO 1 h) and the file share (RPO 24 h/RTO 4 h), set frequency, replication and copy media. Constraints: 500 GB/night cap, no new DC. CHECK grades all six cells.",
  hints: [
    "RPO 15 min cannot be met by any nightly job — only continuous shipping gets inside 15 minutes.",
    "Sync replication buys zero-loss but adds write latency and cost the budget forbids; async with a lag cap meets 15 min RPO.",
    "pay-db: continuous + async-15m + cloud-lock · file-share: daily + async-daily (~180 GB/night) + cloud-lock.",
  ],
  check: (env) => {
    const wrong = [];
    for (const [asset, want] of Object.entries(PLAN_ANSWERS)) {
      const got = env.planHard[asset];
      if (!got) wrong.push(asset);
      else if (got.freq !== want.freq || got.repl !== want.repl || got.media !== want.media) wrong.push(asset);
    }
    if (wrong.length === 0)
      return ok("Architecture meets the objectives",
        "Payment DB: continuous log shipping beats a 15-min RPO, async-15m replication keeps the warm copy close without sync latency, immutable object-lock media survives credential theft. File share: nightly job inside a 24-h RPO, a daily async copy (~180 GB, inside the 500 GB cap), same immutable media. RPO/RTO chose every cell — that is how exam scenarios and real architects decide.");
    return no(`Plan violates constraints (${wrong.join(", ")})`,
      "Rejected: nightly-only for the payment DB breaches a 15-min RPO; sync replication fails budget/latency; no replication leaves the file share region-locked; standard unlocked buckets repeat this week's disaster; tape-only misses a 4-h RTO. Re-derive each cell from the RPO/RTO and the two constraints.");
  },
};

const h4 = {
  id: "OBJ-H4", mode: "hard", pillar: "P3", station: "drill",
  title: "Run the restore drill in order",
  prompt: "On the Drill Floor, execute the file-share restore: add the runbook steps in the exact execution order. Wrong order is rejected with the defender's reason. The incident clock is running.",
  hints: [
    "Contain before you clean: anything touching production before isolation risks reinfection.",
    "Trust, then transfer: verify the chain before you mount it; scan before you serve users.",
    "D1 isolate → D2 verify → D3 select point → D4 clean volume → D5 scan → D6 repoint → D7 monitor/failback.",
  ],
  check: (env) => {
    const got = env.drillSteps;
    if (got.length !== DRILL_ORDER.length)
      return no(`${got.length}/7 steps placed`, "Add all seven steps, in order. Order matters more than speed.");
    for (let i = 0; i < DRILL_ORDER.length; i++) {
      if (got[i] !== DRILL_ORDER[i]) {
        const reasons = {
          "D1": "Restoring before isolating risks reinfecting the clean copy — contain first, always.",
          "D2": "Mounting an unverified chain can inject the corruption you're recovering from — verify before you mount.",
          "D3": "No restore point, no restore — pick the last clean chain before touching storage.",
          "D4": "Never overwrite the only remaining originals before a clean-volume copy is validated.",
          "D5": "Serving unscanned files reintroduces the threat — validate + anti-malware before users return.",
          "D6": "Users return only after validation; repointing earlier spreads bad data.",
          "D7": "Closing without monitoring/failback loses the lesson — the review is part of the runbook (v3, drill finding).",
        };
        return no(`Step ${i + 1} is wrong (${got[i]})`, reasons[got[i]] != null ? reasons[got[i]] : "Sequence broken — re-read the runbook rationale.");
      }
    }
    return ok("Drill executed clean",
      "Isolate → verify → select → clean volume → validate → repoint → monitor/failback. The order encodes three defender instincts: contain before you clean, verify before you trust, validate before you serve. This is the only objective in the lab that is also a rehearsal — schedule it quarterly, like the runbook says.");
  },
};

const h5 = {
  id: "OBJ-H5", mode: "hard", pillar: "P1", station: "drill",
  title: "Compute the RPO breach",
  prompt: "Payment DB incident math: last log shipped 05:31, incident detected 06:10, RPO 15 min. Enter the hours of real data loss (decimal, e.g. 0.75) and pick the correct recovery method. CHECK grades both.",
  hints: [
    "Data loss = detection time − last protected point. The replication lag context explains why shipping stopped at 05:31.",
    "39 minutes of unshipped transactions. Convert to hours, two decimals.",
    "0.65 h — recovered by PITR: replay transaction logs to 05:31 on top of the Sunday full.",
  ],
  check: (env) => {
    const raw = parseFloat(env.breachHours);
    const hoursOk = Number.isFinite(raw) && Math.abs(raw - 0.65) <= 0.02;
    const methodOk = env.breachMethod === "pitr";
    if (hoursOk && methodOk)
      return ok("Breach quantified honestly",
        "06:10 − 05:31 = 39 min ≈ 0.65 h of unshipped transactions — a 15-min RPO breached by more than 4×, caused by replication lag. PITR replays the transaction logs onto the Sunday full to the last shipped log; a full Sunday restore would have thrown away six days. You report the breach in hours because insurers, regulators and SLAs all speak time, not minutes-of-vibes.");
    if (!methodOk && hoursOk) return no("Hours right, method wrong", "You have the Sunday full plus continuous transaction logs. Which method reconstructs the world as of 05:31 exactly?");
    if (methodOk && !hoursOk) return no("Method right, math wrong", "Compute 06:10 − 05:31 in minutes, then divide by 60. Answer in hours to two decimals.");
    return no("Both parts needed", "A decimal in hours + a recovery method. Read the replication report line by line.");
  },
};

const h6 = {
  id: "OBJ-H6", mode: "hard", pillar: "P4", station: "vault",
  title: "Select the compliant control bundle",
  prompt: "Regulator wants 7-year tamper-evident retention; budget kills any second DC or hot site; the nightly cap is 500 GB. Select the exact bundle of controls that satisfies ALL three constraints. Near-misses are rejected.",
  hints: [
    "Three constraints, three controls — one per constraint.",
    "Tamper-evident = the storage layer itself refuses rewrites (WORM). Offline + offsite = tape. Cap-friendly = ~180 GB/night async.",
    "B1 + B2 + B3.",
  ],
  check: (env) => {
    const want = ["B1", "B2", "B3"];
    const got = [...env.bundleHard].sort();
    const same = want.length === got.length && want.every((b) => got.includes(b));
    if (same)
      return ok("Bundle defensible under audit",
        "B1 satisfies the regulator (compliance-mode WORM can't be rewritten, even by root); B2 gives the offline/air-gapped copy for tamper-evidence beyond the cloud account; B3 fits the 500 GB cap at ~180 GB/night. Every rejected option violates exactly one constraint: B4/B5 blow the budget, B6 shares the account's blast radius, B7 misses the 4-h RTO, B8 exposes data. Constraint-driven selection is the exam skill.");
    return no("Bundle rejected",
      got.length > 3
        ? "Too many controls — several violate a constraint outright (budget? cap? blast radius?). Trim to one control per constraint."
        : "Match each constraint to one control: retention → WORM archive; tamper-evidence beyond the account → offline media; nightly volume → async incrementals inside the cap.");
  },
};

const h7 = {
  id: "OBJ-H7", mode: "hard", pillar: "P3", station: "vault",
  title: "Triage five alerts like a duty lead",
  prompt: "The pager board grew up. Classify each of the five scenarios as PAGE (wake a human), TICKET (work tomorrow) or SUPPRESS (tune out). CHECK grades all five.",
  hints: [
    "PAGE = recovery is at risk right now or destruction is in progress.",
    "A bounced report email matters — just not at 03:00. Expected success never pages.",
    "AL-1 PAGE · AL-2 PAGE · AL-3 SUPPRESS · AL-4 PAGE · AL-5 TICKET.",
  ],
  check: (env) => {
    const wrong = Object.keys(ALERT_ANSWERS).filter((a) => env.alertTriage[a] !== ALERT_ANSWERS[a]);
    if (wrong.length === 0)
      return ok("Pager tuned like a veteran",
        "Destruction in progress (DELETE), corruption detected (checksum), and RPO-threatening lag all page — each is an active threat to recovery. Retention success is a receipt: suppress. The bounced report email gets a ticket: it hides results from humans but nothing is lost yet. Three buckets, one doctrine — does this event endanger recovery now, later, or never?");
    return no(`${wrong.length} mis-bucketed`, `Re-ask the doctrine question per scenario: now (PAGE), later (TICKET), never (SUPPRESS). Recheck: ${wrong.join(", ")}.`);
  },
};

const h8 = {
  id: "OBJ-H8", mode: "hard", pillar: "P4", station: "evidence",
  title: "Strike the indefensible statements",
  prompt: "The review memo drafts eight statements. Select the EXACTLY FIVE that would survive a regulator or insurer challenge; leave the five-sounding-but-wrong ones out. CHECK grades the set.",
  hints: [
    "Test each statement against the evidence: logs, replication report, and what object lock actually does.",
    "Three statements make absolute claims encryption/defaults/ransoms can't back up.",
    "Keep S1, S2, S3, S4, S5 — strike F1 (encryption ≠ deletion protection), F2 (cloud is not immutable by default), F3 (same-account snapshots share the blast radius), F4 (ransoms guarantee nothing).",
  ],
  check: (env) => {
    const want = ["S1", "S2", "S3", "S4", "S5"];
    const got = [...env.h8].sort();
    const same = want.length === got.length && want.every((s) => got.includes(s));
    if (same)
      return ok("Memo will survive challenge",
        "Each kept statement cites evidence (logs, replication report, control behavior); each struck one makes an absolute claim: encryption protects confidentiality, not existence; cloud copies are mutable unless you lock them; same-account snapshots die with the account; and ransom payment is a negotiation, not a restore. Reporting discipline = every sentence traceable to a line ID.");
    return no("Set not defensible",
      got.length > 5 ? "More than five kept — at least one absolute claim slipped in. Which statement says something encryption cannot actually deliver?"
        : "You struck something the evidence supports, or kept an absolute claim. Count: exactly five survive.");
  },
};

const OBJECTIVES = [
  m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12,
  h1, h2, h3, h4, h5, h6, h7, h8,
];

function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode);
}

// Star rating (C7): 5.0 base; −0.15 per objective not passed first try; −0.10 per
// hint (medium nudge tiers), −0.25 for the Hard scored nudge; floor 1; displayed
// in 0.5 steps. Identical math to the original.
function computeStars(objectives, ids, mode) {
  let stars = 5;
  let misses = 0;
  let hints = 0;
  for (const id of ids) {
    const p = objectives[id];
    if (!p) continue;
    if (p.firstTry === false) misses++;
    hints += p.hintsUsed;
  }
  stars -= misses * 0.15;
  stars -= hints * (mode === "hard" ? 0.25 : 0.1);
  stars = Math.max(1, stars);
  const rounded = Math.round(stars * 2) / 2;
  return {
    stars: rounded,
    breakdown: `${ids.length - misses}/${ids.length} first-attempt · ${hints} hint${hints === 1 ? "" : "s"} used`,
  };
}
