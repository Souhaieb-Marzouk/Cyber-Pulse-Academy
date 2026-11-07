/* ─────────────────────────────────────────────────────────────────────────────
 * objectives.js — the Shield Ledger: 12 Medium + 9 Hard objectives with the
 * CHECK RESULTS validation engine. Ported 1:1 from src/lib/lab/objectives.ts —
 * same prompts, same hints, same feedback, same pass conditions.
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── shared validator helpers ─────────────────────────────────────────────── */

function _d(s, id) {
  return s.deployed[id];
}

function _sgOpenClosed(s) {
  var r = s.sgRules.find(function (x) {
    return x.port === "22";
  });
  return !!r && r.src === LAB.SG_MGMT_CIDR;
}

function _edrCoversApp(s) {
  var e = _d(s, "edr");
  return !!e && (e.targets || []).indexOf("app-vm-01") > -1;
}

function _isMfaOn(s) {
  return !!_d(s, "mfa");
}
function _isSiemOn(s) {
  return !!_d(s, "siem");
}
function _isDlpBlock(s) {
  return !!_d(s, "dlp") && _d(s, "dlp").mode === "block";
}
function _isDlpOn(s) {
  return !!_d(s, "dlp");
}
function _isWafBlock(s) {
  return !!_d(s, "waf") && _d(s, "waf").mode === "block";
}
function _isWafOn(s) {
  return !!_d(s, "waf");
}
function _isIpsBlock(s) {
  return !!_d(s, "ips") && _d(s, "ips").mode === "block";
}
function _isIpsOn(s) {
  return !!_d(s, "ips");
}

function _isStrMap(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function _arrEqSorted(a, want) {
  return a.slice().sort().join() === want.slice().sort().join();
}

/* ─── MEDIUM — 12 objectives (Understand ×4, Recognize ×2, Detect ×2, Mitigate ×4) ── */

var OBJECTIVES_MEDIUM = [
  {
    id: "OBJ-M1",
    pillar: "understand",
    bloom: "Understand",
    title: "Sort the control alphabet",
    prompt:
      "Classify each of the four safeguards into its category: technical, administrative, or physical. Categories describe the NATURE of a control.",
    where: "Ledger → widget “Categories”.",
    hints: [
      "Ask: is it software/hardware logic (technical), a process people follow (administrative), or something you can touch at a site (physical)?",
      "The badge-and-mantrap gate is site hardware → physical. The change-approval board is a process → administrative.",
      "EDR and the backup/restore service both run as software logic → technical.",
    ],
    feedbackPass:
      "Every control has all three dimensions in play — in cloud projects the technical controls get the budget, but administrative ones (like change approval) decide whether deployments are safe, and physical ones stay with the provider under shared responsibility.",
    feedbackFail:
      "Re-check the definitions: technical = logic/technology enforces it; administrative = policy/process directs people; physical = site and hardware access. Then re-sort.",
    zone: "ledger",
    widget: "M1",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.edr === "technical" &&
        a.badge === "physical" &&
        a.cab === "administrative" &&
        a.backup === "technical";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M2",
    pillar: "understand",
    bloom: "Understand",
    title: "Cover the control spectrum",
    prompt:
      "Assign each safeguard its TYPE: preventive, detective, corrective, deterrent, compensating, directive. Each type is used exactly once.",
    where: "Ledger → widget “Types”.",
    hints: [
      "Types answer WHEN the control acts: before (preventive), during/after by watching (detective), after by repairing (corrective), by scaring off (deterrent), instead-of (compensating), by instructing (directive).",
      "The VPN banner works through the attacker's head, not the wire → deterrent. The acceptable-use policy instructs behavior → directive.",
      "Restore-from-snapshot repairs after damage → corrective. The jump-host arrangement exists BECAUSE the preferred control is impossible → compensating.",
    ],
    feedbackPass:
      "A mature control library deliberately covers the whole spectrum. Most teams over-buy preventive controls and under-invest in detective and corrective ones — until their first incident proves where the gaps were.",
    feedbackFail:
      "One safeguard fits each type: WAF rule=preventive, SIEM alert=detective, restore=corrective, banner=deterrent, jump-host-for-legacy=compensating, AUP=directive. Re-map.",
    zone: "ledger",
    widget: "M2",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.waf === "preventive" &&
        a.aup === "directive" &&
        a.siem === "detective" &&
        a.restore === "corrective" &&
        a.banner === "deterrent" &&
        a.jump === "compensating";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M3",
    pillar: "understand",
    bloom: "Understand",
    title: "Split the responsibilities",
    prompt:
      "Under the shared responsibility model, assign each duty to its owner: the cloud service provider (CSP) or you, the customer.",
    where: "Ledger → widget “Shared responsibility”.",
    hints: [
      "Rule of thumb: the CSP secures the cloud (facilities, hypervisor, managed-service internals); the customer secures in the cloud (data, identities, configuration).",
      "If you can log into it — a VM's guest OS, the console, your data labels — you own it.",
      "Hypervisor patching, CCTV and the managed Postgres engine are provider work; guest OS, admin MFA and classification are yours.",
    ],
    feedbackPass:
      "Shared responsibility failures are the #1 source of cloud breaches: controls the customer assumed 'the provider does that' simply never get deployed. Always name the owner when you plan a control.",
    feedbackFail:
      "Provider: hypervisor, physical CCTV, managed-DB engine patching. Customer: guest OS patching, admin MFA, data classification. Re-assign.",
    zone: "ledger",
    widget: "M3",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.hypervisor === "csp" &&
        a.cctv === "csp" &&
        a.dbengine === "csp" &&
        a.guestos === "customer" &&
        a.mfa === "customer" &&
        a.classification === "customer";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M4",
    pillar: "understand",
    bloom: "Understand",
    title: "Build the depth of the stack",
    prompt:
      "Defense in depth: place each control on the deck where it belongs in Northwind's cutaway. Placement is part of the control.",
    where: "Ledger → widget “Layer placement”.",
    hints: [
      "Match each control to what it inspects: HTTP requests (edge), network flows (network), processes on a host (compute), stored bytes (data), logins (identity).",
      "A WAF terminates TLS at the load balancer — it lives at the edge, before the network even routes the packet.",
      "KMS encrypts stored volumes → data deck. MFA gates console logins → identity deck.",
    ],
    feedbackPass:
      "Correct layering means an attacker must defeat independent controls at every depth — the principle behind zero trust's 'never trust, always verify'. The cutaway you just built IS the lab's map for the hands-on work below.",
    feedbackFail:
      "WAF→Edge, IPS→Network, EDR→Compute, KMS→Data, MFA→Identity. Think about what each control physically inspects, then re-place.",
    zone: "ledger",
    widget: "M4",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.waf === "edge" &&
        a.ips === "network" &&
        a.edr === "compute" &&
        a.kms === "data" &&
        a.mfa === "identity";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M5",
    pillar: "recognize",
    bloom: "Apply",
    title: "Triage the posture audit",
    prompt:
      "The CSPM audit returned six findings. Select the four that represent genuine missing security controls — ignore noise, tuning notes and closed tickets.",
    where: "Ledger → widget “Audit triage”.",
    hints: [
      "Read each finding's verb tense: something disabled/missing = a gap; something recommended/informational = tuning; something already done = closed.",
      "The CDN TTL item is a performance recommendation. The TLS item says 'disabled last sprint' — that is already fixed.",
      "Genuine gaps: unencrypted orders-db, MFA off on two admins, SSH open to the world, no EDR on app-vm-01.",
    ],
    feedbackPass:
      "Triage is a daily SOC skill: every scanner drowns you in informational output, and the real skill is separating a control GAP from a tuning note or a closed ticket. Your four selections drive every hands-on task that follows.",
    feedbackFail:
      "Genuine gaps: unencrypted orders-db, MFA disabled on admin-02/03, SSH 0.0.0.0/0 on TCP 22, no EDR on app-vm-01. TTL and TLS items are noise.",
    zone: "ledger",
    widget: "triage-medium",
    validate: function (_s, a) {
      var raw = Array.isArray(a)
        ? a
        : _isStrMap(a) && Array.isArray(a.sel)
          ? a.sel
          : null;
      if (!raw) return { pass: false };
      var sel = raw.slice().sort();
      var want = ["f-db", "f-edr", "f-mfa", "f-sg"];
      return { pass: sel.length === 4 && sel.join() === want.join() };
    },
  },
  {
    id: "OBJ-M6",
    pillar: "recognize",
    bloom: "Apply",
    title: "Close the front door",
    prompt:
      "Open the Network deck's security-group editor and remove world access to SSH: restrict TCP/22 to the management CIDR, leaving the business rules intact.",
    where: "Cutaway → Deck 2 · Network → Security groups.",
    hints: [
      "The rule table lists each flow with its source CIDR. The offending row is the one whose note says 'open to the world'.",
      "The management CIDR is 10.0.2.0/24 — it is pre-listed in the editor.",
      "Apply the change to rule r1 (TCP/22); do not touch 443 or 5432.",
    ],
    feedbackPass:
      "You just remediated the most common cloud misconfiguration. Security groups are stateless-permit preventive controls: least privilege at the port level. Note in the log how the next replay reacts to the closed port.",
    feedbackFail:
      "Rule r1 (TCP/22) must have source 10.0.2.0/24 — use 'Restrict to mgmt CIDR' in the security-group card. Leave 443 and 5432 as they are.",
    zone: "cutaway",
    jumpDeck: "network",
    validate: function (s) {
      return { pass: _sgOpenClosed(s) };
    },
  },
  {
    id: "OBJ-M7",
    pillar: "detect",
    bloom: "Apply",
    title: "Deploy the watchers, prove they watch",
    prompt:
      "Deploy the IPS/IDS sensor and the SIEM pipeline, then run Replay A (SQL injection). Read the trace to confirm the attack was detected and an alert exists.",
    where: "Cutaway → Deck 2 (sensor) + Deck 5 (SIEM) → Replay Bay.",
    hints: [
      "For this objective the sensor may stay in IDS (detect) mode — the goal is detection evidence, not blocking.",
      "After deploying both controls, run Replay A from the Replay Bay, then read the trace.",
      "Success looks like: verdict 'detected', a signature-hit line in the trace, and an alert listed in the SIEM feed.",
    ],
    feedbackPass:
      "You now have evidence, not hope: the sensor's signature hit and the SIEM alert prove the detective layer works. This is why verification beats assumption — a control that is 'installed' but produces no telemetry is a hole in your detection story.",
    feedbackFail:
      "Needed: IPS deployed (any mode), SIEM started, Replay A executed while both were live, and a detection line in the trace. Try running the replay again after deploying.",
    zone: "cutaway",
    jumpDeck: "network",
    validate: function (s) {
      var run = s.runs["sqli"];
      var ok = _isIpsOn(s) && _isSiemOn(s) && !!run && run.verdict !== "passed";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M8",
    pillar: "detect",
    bloom: "Analyze",
    title: "Separate signal from noise",
    prompt:
      "The SIEM feed shows four alerts. Classify each as a true or false positive, then act: contain the compromised account, escalate the recon, and tune out the noise.",
    where: "Cutaway → Deck 5 · Identity → SIEM feed.",
    hints: [
      "Look for corroboration: a burst followed by a SUCCESS is never noise; a scheduled job to an internal destination is.",
      "Impossible travel can be real — check whether the lab's badge records confirm approved travel first.",
      "Actions: e1 → Contain, e2 → Tune (suppress), e3 → Tune (suppress), e4 → Escalate.",
    ],
    feedbackPass:
      "You tuned a noisy feed the way a working SOC does: suppress with evidence, never blanket-silence; contain what shows success after failure; escalate recon before it becomes intrusion. Alert fatigue is the real adversary of every detective control.",
    feedbackFail:
      "Expected: e1 TP+Contain (500 fails then success), e2 FP+Tune (scheduled backup), e3 FP+Tune (approved travel), e4 TP+Escalate (deliberate recon).",
    zone: "cutaway",
    jumpDeck: "identity",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.e1 === "tp-contain" &&
        a.e2 === "fp-suppress" &&
        a.e3 === "fp-suppress" &&
        a.e4 === "tp-escalate";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-M9",
    pillar: "mitigate",
    bloom: "Apply",
    title: "Shield the workload",
    prompt:
      "Give app-vm-01 its last line of defense: install the endpoint protection agent on it, then run the patch job that fixes the critical CVE.",
    where: "Cutaway → Deck 3 · Compute → agent card + patch card.",
    hints: [
      "The EDR drawer lets you pick targets — app-vm-01 is the one with no coverage (api-vm-02 already has the agent).",
      "pricing-vm cannot take agents; the drawer will refuse it and explain — that case is objective M11.",
      "After the agent is installed, run the patch job card (backup → patch → verify is handled for you in the drawer).",
    ],
    feedbackPass:
      "Endpoint protection + patching close the compute deck: prevention for the unknown malware, correction for the known flaw. In the replay, malware execution on app-vm-01 will now be stopped instead of running free.",
    feedbackFail:
      "State check failed: the EDR agent must cover app-vm-01 AND the CVE-2024-9681 patch job must be executed from Deck 3.",
    zone: "cutaway",
    jumpDeck: "compute",
    validate: function (s) {
      var patched = !!_d(s, "patch");
      return { pass: _edrCoversApp(s) && patched };
    },
  },
  {
    id: "OBJ-M10",
    pillar: "mitigate",
    bloom: "Apply",
    title: "Lock the vault",
    prompt:
      "On the Data deck: encrypt orders-db under KMS, schedule the nightly backups, and apply the DLP policy to the file share.",
    where: "Cutaway → Deck 4 · Data → three control cards.",
    hints: [
      "Three separate cards: KMS encryption, backup schedule, DLP policy — each has its own drawer.",
      "DLP has two modes; either mode completes this objective, but read both descriptions — you will meet the difference in Replay D.",
      "The 4.5 official bullets in play: encryption at rest, backups as corrective recovery, and data loss prevention.",
    ],
    feedbackPass:
      "The data deck now holds all three protection postures: encryption (preventive — useless if stolen), backups (corrective — recoverable when destroyed), DLP (detective/preventive — watches content leaving). Data is what attackers want; depth here pays for every other deck's mistake.",
    feedbackFail:
      "State check failed: orders-db must be encrypted, a backup schedule enabled, and a DLP policy applied to file-share — three cards on Deck 4.",
    zone: "cutaway",
    jumpDeck: "data",
    validate: function (s) {
      var kms = !!_d(s, "kms");
      var bkp = !!_d(s, "backups");
      var dlp = _isDlpOn(s);
      return { pass: kms && bkp && dlp };
    },
  },
  {
    id: "OBJ-M11",
    pillar: "mitigate",
    bloom: "Evaluate",
    title: "Grant the legacy exception",
    prompt:
      "pricing-vm cannot run any security agent — the vendor forbids it. Choose the compensating control that reduces the same risk a different way, then deploy it.",
    where: "Cutaway → Deck 3 · Compute → “Legacy exception” card.",
    hints: [
      "A compensating control must address the SAME risk (malware/lateral movement on pricing-vm) through a DIFFERENT mechanism.",
      "More backups do not prevent malware; a signed policy does not stop an execution.",
      "The right answer isolates the VM, choke-points admin access through a hardened jump host, and allowlists its binaries.",
    ],
    feedbackPass:
      "This is what 'compensating' means in practice: equivalent risk reduction when the primary control is infeasible — and auditors will ask you to justify exactly this trade-off. Note it also applies zero trust to a host that cannot defend itself.",
    feedbackFail:
      "Pick the jump-host + allowlist + isolation option and deploy it from the Legacy exception card. The other options reduce different risks, not this one.",
    zone: "ledger",
    widget: "legacy",
    validate: function (s, a) {
      var okChoice = a === "jump-allowlist";
      return { pass: !!okChoice && !!_d(s, "jumphost") };
    },
  },
  {
    id: "OBJ-M12",
    pillar: "mitigate",
    bloom: "Apply",
    title: "Sequence the WAF rollout",
    prompt:
      "Deploying a blocking control in front of live business traffic has a safe order. Sequence the five WAF rollout steps from first to last.",
    where: "Ledger → widget “Rollout order”.",
    hints: [
      "Never block on day one: you do not yet know what legitimate traffic looks like.",
      "The pattern is: observe → tune → enforce → verify → write it down.",
      "Detect-mode baseline first; documentation and continuous monitoring last.",
    ],
    feedbackPass:
      "That sequence — detect, tune, block, verify, document — is the safe cutover pattern for every in-line control (WAF, IPS, DLP). Skipping the tuning step is how teams block their own checkout flow and roll the control straight back off.",
    feedbackFail:
      "Correct order: detect-mode baseline → analyze & tune rules → switch to block → run a replay to verify → document & monitor. Observation always precedes enforcement.",
    zone: "ledger",
    widget: "seq",
    validate: function (_s, a) {
      if (!Array.isArray(a)) return { pass: false };
      var want = ["detect", "tune", "block", "verify", "document"];
      return { pass: a.join() === want.join() };
    },
  },
];

/* ─── HARD — 9 objectives (Analyze/Evaluate/Create; noisy evidence; strict checks) ── */

var OBJECTIVES_HARD = [
  {
    id: "OBJ-H1",
    pillar: "recognize",
    bloom: "Analyze",
    title: "Audit under noise",
    prompt:
      "The full CSPM export lists ten findings, three of which are red herrings (informational, already-remediated, or clean-result noise). Select the seven genuine gaps and assign each to its deck.",
    where: "Ledger → widget “Audit under noise”.",
    hints: [
      "Red herrings: one is a vendor tuning recommendation, one says the issue was disabled last sprint, one reports zero problems found.",
      "Genuine gaps live on every deck except none: edge ×1, network ×1, compute ×1, data ×3, identity ×1.",
      "Genuine: WAF absent, SSH open, no EDR on app-vm-01, DB unencrypted, no backups, no DLP, MFA off on admins.",
    ],
    feedbackPass:
      "That is a complete gap inventory with owners by layer — exactly what you would put in front of a change board. Notice you found one gap per replay vector: this inventory predicts every attack the Replay Bay will fly.",
    feedbackFail:
      "Expected exactly the 7 genuine findings with decks: WAF→edge, SSH→network, EDR→compute, encryption/backups/DLP→data, MFA→identity. Check the red-herring filters again.",
    zone: "ledger",
    widget: "triage-hard",
    validate: function (_s, a) {
      if (!_isStrMap(a)) return { pass: false };
      var sel = Array.isArray(a.sel) ? a.sel.slice().sort() : [];
      var want = ["f-db", "f-dlp", "f-edr", "f-mfa", "f-sg", "f-waf", "f-backup"].sort();
      if (sel.join() !== want.join()) return { pass: false };
      var decks = a.decks;
      if (!_isStrMap(decks)) return { pass: false };
      var okDecks =
        decks["f-db"] === "data" &&
        decks["f-dlp"] === "data" &&
        decks["f-edr"] === "compute" &&
        decks["f-mfa"] === "identity" &&
        decks["f-sg"] === "network" &&
        decks["f-waf"] === "edge" &&
        decks["f-backup"] === "data";
      return { pass: okDecks };
    },
  },
  {
    id: "OBJ-H2",
    pillar: "understand",
    bloom: "Analyze",
    title: "Classify the tricky five",
    prompt:
      "Assign each safeguard BOTH its type and its category. These five were chosen because they are commonly misclassified — trust the mechanism, not the label.",
    where: "Ledger → widget “Tricky five”.",
    hints: [
      "Mechanism test: what does the control physically DO, and does it need technology, process, or a site to work?",
      "The CAB approval is a process deciding what may change → administrative + preventive. The mantrap+guard is site hardware that stops entry → physical + preventive.",
      "The honeypot's whole purpose is recording attacker behavior → detective + technical.",
    ],
    feedbackPass:
      "Classification drives budget and expectation: a preventive control that fails silently is worse than a detective one that fires. When you can defend type+category for the tricky cases, the easy ones never trip you on the exam.",
    feedbackFail:
      "Expected: banner=deterrent/technical, restore-after-ransomware=corrective/technical, CAB approval=preventive/administrative, mantrap+guard=preventive/physical, honeypot=detective/technical.",
    zone: "ledger",
    widget: "H2",
    validate: function (_s, a) {
      if (!_isStrMap(a)) return { pass: false };
      var want = {
        banner: "deterrent|technical",
        restore: "corrective|technical",
        cab: "preventive|administrative",
        mantrap: "preventive|physical",
        honeypot: "detective|technical",
      };
      var pass = Object.keys(want).every(function (k) {
        return _isStrMap(a[k]) && a[k].type + "|" + a[k].cat === want[k];
      });
      return { pass: pass };
    },
  },
  {
    id: "OBJ-H3",
    pillar: "mitigate",
    bloom: "Evaluate",
    title: "Own the matrix edges",
    prompt:
      "Six duties across Northwind's IaaS VMs, managed Postgres and SaaS email. Assign every duty to its owner: CSP or customer. No 'shared' cop-outs this time.",
    where: "Ledger → widget “Responsibility matrix”.",
    hints: [
      "Provider duties are invisible to you: buildings, hypervisor, the internals of managed services.",
      "Anything you configure, label, or log into is yours — SaaS makes this sharpest: the vendor patches the suite; you enforce MFA on the tenant.",
      "Expected split: physical, hypervisor, managed-DB engine → CSP; application code, tenant MFA, data classification → customer.",
    ],
    feedbackPass:
      "The SaaS row is the one that catches organizations: 'the provider secures it' is true for the software and false for everything you configure inside it. Zero-trust practice starts with owning your half explicitly.",
    feedbackFail:
      "Expected: physical datacenter=CSP, hypervisor patching=CSP, managed DB engine=CSP, application code=Customer, tenant MFA enforcement=Customer, data classification=Customer.",
    zone: "ledger",
    widget: "H3",
    validate: function (_s, a) {
      var ok =
        _isStrMap(a) &&
        a.physical === "csp" &&
        a.hypervisor === "csp" &&
        a.dbengine === "csp" &&
        a.appcode === "customer" &&
        a.tenantmfa === "customer" &&
        a.classification === "customer";
      return { pass: !!ok };
    },
  },
  {
    id: "OBJ-H4",
    pillar: "mitigate",
    bloom: "Create",
    title: "Draft the hardening runbook",
    prompt:
      "Sequence the six steps of the patch + sensor hardening runbook so that no step can undo or blindside another.",
    where: "Ledger → widget “Hardening runbook”.",
    hints: [
      "Two chains interleave: the patch chain (back up → test → deploy) and the sensor chain (observe → tune → enforce).",
      "Restore capability must exist BEFORE you patch: a failed patch is an outage waiting for a rollback.",
      "The sensor must learn normal traffic BEFORE it can block safely — same rule as the WAF sequence.",
    ],
    feedbackPass:
      "Backup-before-change plus observe-before-enforce: these two orderings prevent the two classic self-inflicted outages. A runbook with this ordering is exam-ready AND production-ready.",
    feedbackFail:
      "Expected: snapshot/backup → patch staging → patch production → IPS detect-mode → tune signatures → IPS block-mode.",
    zone: "ledger",
    widget: "seq",
    validate: function (_s, a) {
      if (!Array.isArray(a)) return { pass: false };
      var want = ["backup", "staging", "prod", "detect", "tune", "block"];
      return { pass: a.join() === want.join() };
    },
  },
  {
    id: "OBJ-H5",
    pillar: "mitigate",
    bloom: "Evaluate",
    title: "Justify the compensations",
    prompt:
      "Two constrained scenarios, two compensating controls. Pick the correct alternative for each and justify it in one line — the justification must name the exact mechanism you would enable.",
    where: "Ledger → widget “Compensations”.",
    hints: [
      "Scenario A's mechanism keywords: the VM is isolated, admin access funnels through a hardened jump host, and an allowlist governs execution.",
      "Scenario B's mechanism keywords: enable audit logging and alerting on anomalous exports — detective, because the technical layer is untouchable.",
      "Reject options that reduce a DIFFERENT risk: backups reduce loss, policies reduce accidents — neither compensates for a missing execution/monitoring control.",
    ],
    feedbackPass:
      "You argued risk-for-risk equivalence — the exact standard auditors and the CV0-004 exam apply to compensating controls. Note that both answers pair a technical measure with monitoring: compensation without verification is just a hope.",
    feedbackFail:
      "A: jump host + allowlist + isolation (justify with 'allowlist'/'isolation'/'jump host'). B: database audit logging + alerts on anomalous exports (justify with 'audit'/'log'/'monitor'/'alert'). Both justifications must name the mechanism.",
    zone: "ledger",
    widget: "H5",
    validate: function (_s, a) {
      if (!_isStrMap(a)) return { pass: false };
      var kwA = /allowlist|allow-list|allow list|jump ?host|isolat|segment/i.test(
        String(a.justA || "")
      );
      var kwB = /audit|log|monitor|alert/i.test(String(a.justB || ""));
      return {
        pass:
          a.choiceA === "jump" &&
          a.choiceB === "auditlog" &&
          kwA &&
          kwB &&
          String(a.justA || "").trim().length > 8 &&
          String(a.justB || "").trim().length > 8,
      };
    },
  },
  {
    id: "OBJ-H6",
    pillar: "detect",
    bloom: "Analyze",
    title: "Triage the live feed",
    prompt:
      "Eight SIEM events, two are a compromise chain and its consequence. Mark every event true/false positive, then deploy the missing control the true positives expose.",
    where: "Cutaway → Deck 5 · Identity → SIEM feed, then Deck 4 for the missing control.",
    hints: [
      "Correlate timestamps: the 01:40 account compromise and the 04:10 decoy-segment touch are the same intruder.",
      "The 02:26 bulk export to a personal cloud drive rides trusted channels — no firewall in the catalog can see it.",
      "The control the TPs expose is the DLP policy on the file share, in block mode.",
    ],
    feedbackPass:
      "You correlated a chain instead of reading tickets: compromise → persistence → lateral movement → exfiltration, and chose the control that would have stopped the last mile. That chain-thinking is the difference between an analyst and an alert-closer.",
    feedbackFail:
      "Expected TPs: h-e2 (contain), h-e4 (contain), h-e7 (escalate). All others false positives. Then apply the DLP policy in BLOCK mode on Deck 4.",
    zone: "ledger",
    widget: "siem-hard",
    validate: function (s, a) {
      if (!_isStrMap(a)) return { pass: false };
      function mark(k) {
        return String(a[k] || "").split("-")[0];
      }
      var okMarks =
        mark("h-e2") === "tp" &&
        mark("h-e4") === "tp" &&
        mark("h-e7") === "tp" &&
        ["h-e1", "h-e3", "h-e5", "h-e6", "h-e8"].every(function (k) {
          return mark(k) === "fp";
        });
      return { pass: okMarks && _isDlpBlock(s) };
    },
  },
  {
    id: "OBJ-H7",
    pillar: "mitigate",
    bloom: "Evaluate",
    title: "Spend the budget once",
    prompt:
      "Budget covers exactly one network project this quarter, and the observed risk is attackers pivoting between the 40 east–west workloads. Choose the project and justify it with the traffic direction you are defending.",
    where: "Ledger → widget “Budget call”.",
    hints: [
      "The risk is INSIDE the estate, not at its border — match the control to the traffic direction.",
      "A bigger internet firewall hardens north–south; your adversary is already inside.",
      "Justify with the words 'east–west', 'lateral', or 'segment' — and pick micro-segmentation.",
    ],
    feedbackPass:
      "Control-to-risk alignment is the whole discipline: you spent once, on the exact direction the adversary moves. A bigger perimeter firewall would have felt productive and defended a boundary the attacker had already crossed.",
    feedbackFail:
      "Pick micro-segmentation and justify with 'east–west' (or 'lateral'/'segment'). The internet firewall defends north–south — the wrong direction for this risk.",
    zone: "ledger",
    widget: "H7",
    validate: function (_s, a) {
      if (!_isStrMap(a)) return { pass: false };
      var kw = /east.?west|lateral|segment/i.test(String(a.just || ""));
      return {
        pass: a.choice === "microseg" && kw && String(a.just || "").trim().length > 8,
      };
    },
  },
  {
    id: "OBJ-H8",
    pillar: "detect",
    bloom: "Create",
    title: "Design the verification plan",
    prompt:
      "The change board will only sign off controls that come with an effectiveness test. Select exactly the four verification activities that prove the deployed controls work — no more, no fewer.",
    where: "Ledger → widget “Verification plan”.",
    hints: [
      "A verification activity must generate EVIDENCE about the control, not comfort about the process.",
      "Reading vendor documentation proves nothing about YOUR deployment.",
      "Correct four: restore drill, adversarial replay test, alert-fires test, log/coverage review.",
    ],
    feedbackPass:
      "Your plan hits all four evidence types: recoverability (restore drill), prevention (replay), detection (alert fires), and coverage (log review). This is purple-team thinking — controls earn trust by being attacked and watched, not by being purchased.",
    feedbackFail:
      "Expected exactly: restore drill, replay/adversarial test, alert-fires test, log coverage review. The other three generate no evidence about control effectiveness.",
    zone: "ledger",
    widget: "H8",
    validate: function (_s, a) {
      if (!Array.isArray(a)) return { pass: false };
      var want = ["restore-drill", "replay-test", "alert-fire", "log-review"];
      return { pass: _arrEqSorted(a, want) };
    },
  },
  {
    id: "OBJ-H9",
    pillar: "mitigate",
    bloom: "Create",
    title: "Run the go-live gate",
    prompt:
      "Fly all four replays, read every trace, and fill the attribution table with the verdict and the deck that acted. Then make the one passing attack fail — and re-run to prove it.",
    where: "Replay Bay (all four) → attribution table → Deck 4 → re-run.",
    hints: [
      "Block verdicts you can engineer: WAF or IPS in block mode (A), closed SSH port or IPS block (B), MFA (C), DLP in block mode (D).",
      "Replay D will pass every perimeter control you own — it uses legitimate, trusted tooling. Only content inspection stops it.",
      "The gate passes when all four verdicts read BLOCKED and D's blocking deck is Data.",
    ],
    feedbackPass:
      "Go-live gate passed with evidence: four attacks, four blocks, four accountable decks. Replay D taught the deepest lesson of 4.5 — exfiltration rides trusted channels, and only content-aware controls (DLP) see it. This is how you prove defense in depth to a board.",
    feedbackFail:
      "Required: all four replays run with final verdict BLOCKED (A: edge/network, B: network, C: identity, D: data via DLP block mode), and the attribution table must match. Deploy the missing control, re-run, then re-check.",
    zone: "ledger",
    widget: "H9",
    validate: function (s, a) {
      var ids = ["sqli", "ssh", "creds", "exfil"];
      var allRun = ids.every(function (id) {
        return !!s.runs[id];
      });
      if (!allRun) return { pass: false };
      var allBlocked = ids.every(function (id) {
        return s.runs[id].verdict === "blocked";
      });
      if (!allBlocked) return { pass: false };
      if (!_isStrMap(a)) return { pass: false };
      var t = a.table;
      if (!_isStrMap(t)) return { pass: false };
      var ok =
        t.sqli === "blocked" &&
        t.ssh === "blocked" &&
        t.creds === "blocked" &&
        t.exfil === "blocked" &&
        (t.deckSqli === "edge" || t.deckSqli === "network") &&
        t.deckSsh === "network" &&
        t.deckCreds === "identity" &&
        t.deckExfil === "data";
      return { pass: ok };
    },
  },
];
