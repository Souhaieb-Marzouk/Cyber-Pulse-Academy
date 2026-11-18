/* ═══════════════════════════════════════════════════════════════════════════
   objectives.js — the 21 objectives (12 Medium + 9 Hard) with their
   CHECK RESULTS validation rules, hint tiers and teaching feedback.
   Ported 1:1 from src/lib/lab/objectives.ts. Check functions read the lab
   `env` (answers stored by widgets) exactly like the original closures.
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_OBJECTIVES = (function () {
  "use strict";

  const D = window.LAB_DATA;

  // ── comparison helpers (identical semantics to the original) ──
  const arr = (v) => (Array.isArray(v) ? v : []);
  const mapS = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const mapV = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const mapB = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const setEq = (a, b) => a.length === b.length && b.every((x) => a.includes(x));
  const mapEq = (a, b) => Object.keys(b).every((k) => a[k] === b[k]) && Object.keys(a).length >= Object.keys(b).length;
  const mapVEq = (a, b) => Object.keys(b).every((k) => a[k] && a[k].v === b[k].v && (!b[k].r || a[k].r === b[k].r));
  const seqEq = (a, b) => a.join("|") === b.join("|");

  // config panels tolerate untouched controls by falling back to their
  // initial values (M8 / M11)
  const configOk = (spec, stored) =>
    Object.entries(spec.answer).every(([k, v]) => {
      const val = stored[k];
      if (val === undefined) {
        const t = spec.toggles.find((x) => x.id === k);
        const s = spec.selects.find((x) => x.id === k);
        const init = t ? t.initial : s ? s.initial : undefined;
        return init === v;
      }
      return val === v;
    });

  const OBJECTIVES = [
    // ═══════════ MEDIUM ═══════════
    {
      id: "OBJ-M1",
      mode: "medium",
      title: "Classify the audits in the correspondence file",
      task: "Open the four letters on the desk and sort each engagement by who performs it: first-party (internal), second-party (a customer/partner), third-party (independent) — one letter is an assessment, not an audit.",
      pillar: "P1",
      anchor: "Audit parties — first/second/third-party; assessment vs audit",
      zone: "briefing",
      envKey: "m1",
      hints: [
        "First-party = Meridian's own people auditing Meridian. Second-party = someone we do business with auditing us. Third-party = an independent firm with no stake either way.",
        "The BalticSupply letter is the contract-driven one — a customer auditing its supplier. The Halloway & Brand letter stresses independence.",
        "Leo's Friday vulnerability scan measures posture but verifies nothing against a standard — that is an assessment. The remaining four letters sort by who performs them.",
      ],
      check: (e) => mapEq(mapS(e["m1"]), { a: "first", b: "second", c: "third", d: "assess", e: "first" }),
      success:
        "Exactly. Independence rises from first → third party, and assurance rises with it: your internal pre-audit prepares, BalticSupply's second-party audit enforces the contract, and Halloway & Brand's third-party assessment is what the card brands accept. And Leo's scan is an assessment — it finds gaps but verifies nothing against a standard.",
      fail: "Re-read who is doing the auditing in each letter — the writer's relationship to Meridian (self, customer, or independent outsider) determines the party. Watch for the one letter that isn't an audit at all.",
    },
    {
      id: "OBJ-M2",
      mode: "medium",
      title: "Sort nine claims onto the framework wall",
      task: "Nine claims are pinned to the Library wall. Place each under the framework that owns it: PCI DSS, GDPR, or data locality.",
      pillar: "P1",
      anchor: "Framework attributes — kind of rule, applicability, sanctions, concepts",
      zone: "library",
      envKey: "m2",
      hints: [
        "Ask two questions per claim: is it about card data or personal data? Is it a contract, a law, or a geographic fact?",
        "€20 million / 4 %, 72 hours and controller-vs-processor belong to GDPR. Contractual teeth, CHD applicability and segmentation belong to PCI DSS.",
        "Anything about where data physically lives — regions, in-country mandates, geography-driven law — goes under data locality.",
      ],
      check: (e) =>
        mapEq(mapS(e["m2"]), {
          s1: "pci", s2: "pci", s3: "gdpr", s4: "gdpr", s5: "gdpr",
          s6: "loc", s7: "loc", s8: "loc", s9: "pci",
        }),
      success:
        "The wall now reads correctly: PCI DSS is contractual and about cardholder data; GDPR is statutory and about personal data of people in the EU/EEA; data locality is the geographic layer that decides whose rules reach a dataset. Exams love trading these attributes between frameworks — now you own the differences.",
      fail: "Separate the three axes first: contract vs law vs geography. Then attach the details — fines and 72 hours to GDPR, processing-loss to PCI, in-country mandates to locality.",
    },
    {
      id: "OBJ-M3",
      mode: "medium",
      title: "Decode the attestation in the vendor file",
      task: "Read Ticketron's SOC 2 Type II excerpt in the correspondence file, then answer the three questions beside it: what the document is, why Meridian may rely on it, and which document will close our own PCI assessment the same way.",
      pillar: "P1",
      anchor: "Attestation — definition, independent issuer, AOC",
      zone: "briefing",
      envKey: "m3",
      hints: [
        "An attestation is a formal, signed statement by an auditor that controls met criteria — look for who signs the SOC 2 and what they state.",
        "The auditor's value is independence: Pratt & Lin has no stake in Ticketron's success.",
        "PCI DSS assessments close with an attestation of their own — Halloway & Brand's letter names it: the Attestation of Compliance.",
      ],
      check: (e) => { const m = mapS(e["m3"]); return m.q1 === "att" && m.q2 === "indep" && m.q3 === "aoc"; },
      success:
        "An attestation = independent issuer + formal opinion + defined period. That is why Meridian can trust Ticketron's SOC 2 without auditing Ticketron itself — and why our own assessment ends with an Attestation of Compliance issued by the QSA, not by us.",
      fail: "Two anchors: who signs the SOC 2 (and whether they are independent), and which PCI document is an attestation rather than evidence or paperwork. Nothing in this file was issued by Meridian's own staff.",
    },
    {
      id: "OBJ-M4",
      mode: "medium",
      title: "Mark the CDE on the data-center diagram",
      task: "On the MRG-DC1 diagram, select every asset that belongs to the cardholder data environment (CDE) — the systems that store, process or transmit cardholder data, plus the security control that guards the boundary. Six assets qualify.",
      pillar: "P2",
      anchor: "CDE scope; PCI DSS applicability (store/process/transmit CHD)",
      zone: "datacenter",
      envKey: "m4",
      hints: [
        "Follow the card data: swipe → payment VLAN → payment app → card DB → gateway to the processor. Everything on that path is in scope.",
        "The CDE boundary has its own firewall (FW2) — the control that draws the boundary is inside the scope.",
        "HR files, e-mail, guest Wi-Fi and the marketing store never touch card data. 'Personal data' and 'cardholder data' are different triggers.",
      ],
      check: (e) => setEq(arr(e["m4"]), ["fw2", "posswitch", "payapp", "carddb", "posterm", "paygw"]),
      success:
        "Six assets, one boundary. The CDE is everything that touches CHD plus FW2, the control that guards it. Every asset you keep out of this circle is a system the QSA never has to assess — that is why segmentation is the cheapest scope control in PCI.",
      fail: "Trace the card number's path rather than counting servers. If a system never stores, processes or transmits CHD — even personal-data-heavy ones like the HR server — it stays outside the CDE.",
    },
    {
      id: "OBJ-M5",
      mode: "medium",
      title: "Flag the locality violations in StratusCloud",
      task: "Open the StratusCloud storage console and flag every dataset that violates Meridian's data-locality rules. Not everything outside the EU is wrong — check what each dataset contains.",
      pillar: "P2",
      anchor: "Data locality & sovereignty; replicas/backups inherit classification",
      zone: "cloudops",
      envKey: "m5",
      hints: [
        "Locality rules attach to the data's content and origin, not to the region per se — EU personal data abroad is the problem.",
        "IP addresses are personal data under GDPR. And an encrypted backup is still a copy of the dataset.",
        "The product catalog contains no personal data — its US region is perfectly legal. Tokenized records with the PAN removed are not CHD.",
      ],
      check: (e) => setEq(arr(e["m5"]), ["D2", "D5", "D7"]),
      success:
        "Three violations, three lessons: an analytics replica re-creates EU personal data abroad (D2), IP addresses are personal data (D5), and backups count as data — encryption does not relocate the obligation (D7). Meanwhile D4 shows the opposite lesson: no personal data, no locality problem.",
      fail: "Check each row's classification first. 'Personal data' rows in non-EU regions are candidates; then decide whether a copy (replica, backup) inherits its source's rules. Non-personal data can live anywhere.",
    },
    {
      id: "OBJ-M6",
      mode: "medium",
      title: "Find the card numbers hiding in the logs",
      task: "Leo exported the payment application's syslog. Click the log lines that expose cardholder data in violation of PCI DSS — there are two. Then read why this is a finding.",
      pillar: "P2",
      anchor: "Protect CHD — no PANs in logs (Req 3/10); audit evidence",
      zone: "datacenter",
      envKey: "m6",
      hints: [
        "Look for 16-digit numbers in card format — a full PAN in any log line makes that line cardholder data.",
        "One is an INFO line quoting the card number of an order; the other is a DEBUG line dumping the raw request.",
        "Failed SSH logins and NTP lines are noise — real evidence, but not violations.",
      ],
      check: (e) => setEq(arr(e["m6"]), ["L2", "L4"]),
      success:
        "Two lines, one systemic flaw: an application that logs full PANs (and in the DEBUG case, expiry data too). Under Req 3 those logs are now cardholder data — they join the CDE, they must be encrypted, retained and purged. The fix is at the source: never log CHD, redact what arrives, and let DLP-style pattern detection watch for recurrences.",
      fail: "Scan for the card-number shape — four groups of four digits. The DEBUG line is deliberately easy to skim past; failed logins and time-sync lines are normal operations, not violations.",
    },
    {
      id: "OBJ-M7",
      mode: "medium",
      title: "Verdict the firewall ruleset against segmentation",
      task: "Review all eight rules on the MRG-DC1 firewall and stamp each as COMPLIANT or FINDING for CDE segmentation. Three rules break the boundary.",
      pillar: "P3",
      anchor: "Segmentation enforcement — firewall rules (PCI Req 1)",
      zone: "datacenter",
      envKey: "m7",
      hints: [
        "Ask per rule: does this let traffic bypass the CDE boundary, or is it a controlled path that belongs there?",
        "Corporate LAN → card database is a segmentation failure, and so is anything that ignores source and destination entirely.",
        "Guest Wi-Fi touching a payment server is never compliant. Logging flows out of the CDE are fine — you cannot audit what you cannot see.",
      ],
      check: (e) => {
        const m = mapV(e["m7"]);
        return D.FIREWALL_RULES.every((r) => m[r.id] && m[r.id].v === (r.finding ? 0 : 1));
      },
      success:
        "R-102, R-104 and R-107 each dissolve the CDE boundary — corporate reach-in, an any→any wildcard, and guest traffic into the payment app. The compliant rules share a pattern: specific source, specific destination, a reason to exist. That pattern is exactly what an assessor reads for.",
      fail: "Judge each rule's path, not its action: 'allow' can be legitimate (POS → gateway) and even 'deny' can sit next to a disaster. Which rules connect untrusted or broad sources to CDE systems?",
    },
    {
      id: "OBJ-M8",
      mode: "medium",
      title: "Bring the logging controls to audit standard",
      task: "Open the logging control panel and set it to what PCI DSS expects: synchronized time, 12-month retention, tamper-protected logs, and the SIEM feed running.",
      pillar: "P3",
      anchor: "PCI Req 10 — NTP sync, 12-month retention, tamper protection, SIEM",
      zone: "datacenter",
      envKey: "m8",
      hints: [
        "Unsynchronized clocks make logs impossible to correlate across systems — an assessor cannot reconstruct an incident from drifting timestamps.",
        "Retention must cover 12 months, with the most recent three months immediately available; tamper protection keeps the evidence trustworthy.",
        "The SIEM feed is already correct — the fix is NTP, retention and tamper protection.",
      ],
      check: (e) => configOk(D.LOG_CONFIG, mapB(e["m8"])),
      success:
        "Logs are only evidence if they are synchronized (NTP), complete (12 months, 3 hot), and provably unaltered (tamper protection) — that is Req 10's recipe. The SIEM feed then turns thousands of lines into reviewable, alertable evidence. A 90-day, drifting, unprotected log trail equals no evidence at all.",
      fail: "Three of the four controls are wrong. Think about what an auditor needs to trust a log: correct time, long retention, proof it was not edited — and the collector feed that was already healthy.",
    },
    {
      id: "OBJ-M9",
      mode: "medium",
      title: "Run the 72-hour breach clock",
      task: "Leo's incident ticket INC-8841 confirms exposure of EU customer records. Slide the marker to the notification deadline, then choose who Meridian notifies first.",
      pillar: "P3",
      anchor: "GDPR Art. 33 — 72 hours, supervisory authority, DPO",
      zone: "findings",
      envKey: "m9",
      hints: [
        "The clock starts when the controller becomes aware — Monday 09:12 — and Art. 33 gives 72 hours.",
        "The notification goes to the supervisory authority (the data protection regulator), coordinated by the DPO.",
        "Card brands are a PCI matter; affected customers are notified separately under Art. 34 if the risk is high — the regulator comes first.",
      ],
      check: (e) => {
        const m = mapS(e["m9"]);
        const h = Number(m.h);
        return Number.isFinite(h) && h >= 70 && h <= 74 && m.who === "supervisory";
      },
      success:
        "Confirmed at Monday 09:12 → deadline Thursday 09:12: seventy-two hours to the supervisory authority, documented and led by the DPO. Data subjects get informed under Art. 34 if the risk to them is high — hashed passwords are still personal data, so the clock was never in doubt. A delayed notification must carry written reasons for the delay.",
      fail: "Two decisions: how long between awareness and the regulatory deadline (Art. 33), and which body receives it first. 'Became aware' is Monday 09:12 — the regulator, not the card brands, is the addressee.",
    },
    {
      id: "OBJ-M10",
      mode: "medium",
      title: "Prescribe the control for every finding",
      task: "Five findings sit on the desk. Assign the correct control to each — every control is used exactly once.",
      pillar: "P4",
      anchor: "Mitigations — segmentation, log hygiene, locality, access control, Req 10",
      zone: "findings",
      envKey: "m10",
      hints: [
        "Match the finding's mechanism to the control's mechanism: network paths → segmentation; data location → region move.",
        "Shared accounts are an identity problem — unique IDs, least privilege, MFA. Drifting clocks and short retention are a logging problem.",
        "PANs in logs cannot be 'encrypted away' — the fix is to stop writing them and purge what exists.",
      ],
      check: (e) => mapEq(mapS(e["m10"]), D.FINDINGS_M10.answer),
      success:
        "Each control targets its finding's mechanism: firewalls fix paths, region migration fixes geography, identity fixes attribution, and log hygiene fixes evidence. Notice the pattern for the exam — the mitigation names the layer (network, data, identity, logging) the finding lives in.",
      fail: "Read each finding for its layer: is the exposure a network path, a stored location, an identity, or an evidence trail? Controls only work when they act on the same layer as the cause.",
    },
    {
      id: "OBJ-M11",
      mode: "medium",
      title: "Configure the EU launch for compliance",
      task: "Set up StratusCloud for the “Loyalty Plus” launch serving EU customers: pick the primary region and set the four options so the deployment survives a data-locality review.",
      pillar: "P4",
      anchor: "Region selection, geo-blocking, replication & backup placement",
      zone: "cloudops",
      envKey: "m11",
      hints: [
        "EU customers → EU region. Frankfurt is Meridian's home region and keeps the master dataset in-jurisdiction.",
        "Replicating to the US re-creates the exact finding you flagged in the storage console — switch it off.",
        "Backups should stay in the selected region, admin access should be fenced to EU office ranges, and customer exports must never sit in a public bucket.",
      ],
      check: (e) => configOk(D.LAUNCH_CONFIG, mapB(e["m11"])),
      success:
        "Frankfurt + EU-only replication + geo-fenced admin + private, regional backups — this launch would pass both the locality review and a GDPR transfer check. Compare it with the console you audited in OBJ-M5: same product family, opposite decisions. That is 'privacy by design' doing its job.",
      fail: "Three options are currently set the wrong way. Follow the data: where do EU customers' records live, where do copies go, who can administer, and can anyone with the URL read the exports?",
    },
    {
      id: "OBJ-M12",
      mode: "medium",
      title: "Sequence the audit lifecycle",
      task: "The Lead Auditor mixed up the audit lifecycle cards. Chain them in the order a well-run assessment actually unfolds.",
      pillar: "P4",
      anchor: "Audit lifecycle — scope → internal → remediate → external → attestation → monitor",
      zone: "findings",
      envKey: "m12",
      hints: [
        "You cannot audit what you have not scoped, and an external audit should never be the first time anyone looks.",
        "Internal audit comes before remediation; remediation comes before the external fieldwork; the attestation follows the fieldwork.",
        "The cycle does not end at the attestation — monitoring and periodic re-audits keep the attestation true.",
      ],
      check: (e) => seqEq(arr(e["m12"]), D.LIFECYCLE_M12.answer),
      success:
        "Scope → internal audit → remediate → external audit → attestation → continuous monitoring. Notice your own week inside it: everything you just did was steps one to three. An attestation issued early — before remediation — would be an opinion about findings that no longer exist.",
      fail: "Two anchors: the external audit cannot be the first look (internal before external), and an attestation describes the state AFTER remediation, not before. End with what keeps it true over time.",
    },

    // ═══════════ HARD ═══════════
    {
      id: "OBJ-H1",
      mode: "hard",
      title: "Scope the CDE from the noisy inventory",
      task: "The QSA's pre-work sheet lists 15 systems. Using the diagram and inventory, select exactly the systems that belong to the CDE. Two rows are deliberate red herrings.",
      pillar: "P2",
      anchor: "CDE scope under noise — CHD touchpoints + boundary control",
      zone: "datacenter",
      envKey: "h1",
      hints: [
        "Scope follows cardholder data, not sensitivity in general: PHI, employee records and catalogs never enter the CDE.",
        "The boundary control (FW2) is in scope; the edge firewall is not.",
        "Watch the log archive — if it contains PANs, it contains CHD, regardless of what it is called.",
      ],
      check: (e) => setEq(arr(e["h1"]), ["I01", "I02", "I03", "I04", "I05", "I06", "I07"]),
      success:
        "Seven in, eight out. The traps were the ones that 'feel' sensitive: the HIPAA server (a different regime, zero card data), the HR server (personal data — GDPR, not CHD) and the catalog. And the log archive teaches the sharp lesson: contents define scope, so a PAN-bearing log file is CDE until purged.",
      fail: "Near-miss rejected. Re-derive scope from the data: which rows store, process or transmit CHD — including one archive whose contents contradict its name? PHI and employee records belong to other regimes.",
    },
    {
      id: "OBJ-H2",
      mode: "hard",
      title: "Triage eight findings across the regimes",
      task: "Classify each of the eight triage cards: PCI DSS finding, GDPR finding, both, or not a finding for this audit. Two cards are red herrings.",
      pillar: "P3",
      anchor: "Regime applicability — CHD vs personal data vs neither",
      zone: "findings",
      envKey: "h2",
      hints: [
        "Card data → PCI. Personal data of EU people → GDPR. A cardholder name IS personal data, so exports with names can trigger both.",
        "IP addresses are personal data. Health records of US patients are HIPAA's problem, not this audit's.",
        "Out-of-scope systems (corporate laptops) and non-personal data (catalogs) generate no finding under either regime.",
      ],
      check: (e) => mapEq(mapS(e["h2"]), D.TRIAGE_H2.answer),
      success:
        "Perfect triage. The export with PANs + names hit BOTH regimes (card data and personal data at once) — the exam's favorite composite. The analytics IPs are GDPR-only, the catalog and PHI server are other regimes' business, and out-of-scope laptops generate findings for the office IT audit, not this one.",
      fail: "For each card, first ask what data is involved (card / personal / neither), then whose jurisdiction reaches it. One card carries two kinds of data at once — that one lands in 'both'.",
    },
    {
      id: "OBJ-H3",
      mode: "hard",
      title: "Rule on five transfers under policy P-7",
      task: "Read policy P-7, then rule ALLOW or BLOCK on each of the five transfers and pick the controlling reason for each verdict. Near-misses fail.",
      pillar: "P2",
      anchor: "Locality rules — law, contract, backup inheritance",
      zone: "cloudops",
      envKey: "h3",
      hints: [
        "Three rule sources exist in P-7: EU personal data (EU regions), card data (Frankfurt by contract), non-EU personal data (unrestricted).",
        "Backups and replicas inherit their source's classification — 'it's just a backup' is not a defense.",
        "V5 is the subtle one: Dublin is inside the EU but the card-data contract names Frankfurt specifically.",
      ],
      check: (e) => mapVEq(mapV(e["h3"]), D.LOCALITY_H3.answer),
      success:
        "Five verdicts, four distinct reasons. The Dublin card-export block is the exam-grade subtlety: EU membership does not satisfy a contract that names Frankfurt — contract can be stricter than law. And V4 proves backups inherit classification. You just argued locality the way an auditor would.",
      fail: "One or more verdicts don't hold. Check each row against all three P-7 rules in order: EU personal data, then card data by contract, then non-EU personal data — and remember replicas/backups inherit their source's rules.",
    },
    {
      id: "OBJ-H4",
      mode: "hard",
      title: "Repair the ruleset with the minimal change set",
      task: "Select the exact set of rules to REMOVE to restore CDE segmentation, then choose the single correct replacement rule that preserves controlled administration of the card database.",
      pillar: "P4",
      anchor: "Segmentation repair — minimal removal + controlled admin path",
      zone: "datacenter",
      envKey: "h4",
      hints: [
        "Minimal set: only rules that connect broad or untrusted sources into the CDE — not rules with a legitimate CDE-internal purpose.",
        "Three rules qualify for removal. Removing R-103 or R-106 would break payment processing or evidence collection.",
        "Admin access to the card DB should enter through a dedicated, logged bastion — not straight from the corporate LAN, and never from guest Wi-Fi.",
      ],
      check: (e) => {
        const m = mapS(e["h4"]);
        const rm = arr(m.remove);
        return setEq(rm, D.FIREWALL_FIX_H4.removeAnswer) && m.replace === D.FIREWALL_FIX_H4.replaceAnswer;
      },
      success:
        "R-102, R-104, R-107 out; one logged bastion path in. That is the minimal, reversible, evidence-friendly repair: it removes every uncontrolled path into the CDE without touching the flows the business runs on. An assessor will ask for exactly this kind of rationale — path by path.",
      fail: "Either the removal set misses a boundary-breaker or removes something the business needs (POS → gateway, DB → syslog), or the replacement re-opens the hole you just closed. A bastion with logging is the pattern assessors accept.",
    },
    {
      id: "OBJ-H5",
      mode: "hard",
      title: "Assemble the evidence pack for the QSA",
      task: "Map each of the six artifacts to the PCI requirement it evidences. Every artifact lands exactly once.",
      pillar: "P3",
      anchor: "Audit evidence mapped to PCI Req 1/3/4/8/10/11",
      zone: "findings",
      envKey: "h5",
      hints: [
        "Read artifacts for what they PROVE, not what they mention: a ruleset export proves network controls; a key-management record proves stored-data protection.",
        "MFA enrollment is identity (Req 8); NTP + archive index is logging (Req 10).",
        "Only one artifact is a periodic test result — that is Req 11 (ASV scan).",
      ],
      check: (e) => mapEq(mapS(e["h5"]), D.EVIDENCE_H5.answer),
      success:
        "A complete evidence matrix: design artifacts (ruleset, key records, TLS config) prove the controls exist; operational artifacts (MFA enrollment, log archive) prove they run; the ASV report proves independent testing. That design/runs/tested trio is how every PCI requirement gets validated.",
      fail: "Sort by requirement intent: network paths, stored data, transmitted data, identity, logs, testing. One artifact mentions both NTP and archives — it proves the logging requirement, nothing else.",
    },
    {
      id: "OBJ-H6",
      mode: "hard",
      title: "Match each regime to its teeth",
      task: "Four consequences hang beside four failures. Match them — the differences between contractual, statutory and private enforcement are the whole point.",
      pillar: "P4",
      anchor: "Consequences per regime — PCI (contract), GDPR (statute), contract schedules",
      zone: "library",
      envKey: "h6",
      hints: [
        "PCI DSS consequences flow through the acquirer/card brands — the payment relationship is the lever.",
        "GDPR's upper tier is the famous one: €20 million or 4 % of worldwide turnover, whichever is higher.",
        "A private customer's contractual audit right ends in contract remedies — penalties, re-audit, termination — not in regulator fines.",
      ],
      check: (e) => mapEq(mapS(e["h6"]), D.CONSEQUENCES_H6.answer),
      success:
        "Four regimes, four levers: card brands squeeze payment processing, regulators fine by statute, breach law forces notification, and private contracts carry their own remedies. Knowing WHO can do WHAT to you is half of compliance literacy — and a gift of a question type on exam day.",
      fail: "Separate the enforcement channels: payment-relationship (PCI), statutory regulator (GDPR), breach-specific duties (Art. 33/34), and private contract (BalticSupply). Each consequence names its own channel.",
    },
    {
      id: "OBJ-H7",
      mode: "hard",
      title: "Chain the full engagement, end to end",
      task: "Eight lifecycle cards, one correct order — from kick-off to the standing re-assessment rhythm. Strict sequence.",
      pillar: "P2",
      anchor: "Engagement lifecycle incl. gap reporting and continuous monitoring",
      zone: "briefing",
      envKey: "h7",
      hints: [
        "Group first: preparation (kick-off, evidence), internal loop (pre-audit, remediate), external loop (fieldwork, gap report), then closure and the standing rhythm.",
        "Gap reporting follows fieldwork; the attestation follows the management response.",
        "The final card is not an event but a rhythm: quarterly ASV scans, annual re-assessment.",
      ],
      check: (e) => seqEq(arr(e["h7"]), D.LIFECYCLE_H7.answer),
      success:
        "The full arc: prepare → self-check → fix → external test → respond → attest → keep proving it. Adding gap reporting and the standing monitoring rhythm turns the Medium-mode lifecycle into something an engagement letter would actually describe. This is the shape of every compliance year Meridian will ever have.",
      fail: "The order breaks somewhere around the external phase. Fieldwork precedes the gap report, the report precedes management's response, and the attestation can only describe the post-remediation state.",
    },
    {
      id: "OBJ-H8",
      mode: "hard",
      title: "Decide the attestation",
      task: "The assessment is done. Answer the three decision questions: who may issue the attestation, which document it is, and what residual item the report must note.",
      pillar: "P4",
      anchor: "Attestation closure — issuer independence, AOC, residual statements",
      zone: "findings",
      envKey: "h8",
      hints: [
        "Issuers must be independent and qualified — inside staff cannot attest to their own work.",
        "PCI closes with an AOC; a SOC 2 belongs to whoever's controls it describes (Ticketron's, not Meridian's).",
        "Attestations can carry qualifications — the pending PAN-log purge, with compensating controls, is exactly the kind of residual an honest report notes.",
      ],
      check: (e) => {
        const m = mapS(e["h8"]);
        return Object.entries(D.ATTESTATION_H8.answer).every(([k, v]) => m[k] === v);
      },
      success:
        "Independent QSA + AOC + an honest residual note. That combination is what the acquirer actually receives, and the residual item shows the report's integrity — attestations describe reality, including the work that remains. Meridian is now formally attested; the monitoring cycle keeps it true.",
      fail: "One or more answers break the logic of attestation: issuer independence, the document's name and owner, or whether honest reports carry residual statements. A SOC 2 describing Ticketron can never close Meridian's PCI assessment.",
    },
    {
      id: "OBJ-H9",
      mode: "hard",
      title: "Spotlight: which regime governs each case?",
      task: "Six one-line cases hang on the spotlight wall. Assign each to PCI DSS, GDPR, data locality, or 'neither — different regime'. Two cases belong to regimes this chapter only name-drops.",
      pillar: "P1",
      anchor: "Regime recognition incl. HIPAA/SOX distractors",
      zone: "library",
      envKey: "h9",
      hints: [
        "Ask 'what data, whose people, what rule source' for every case — the answer pattern is card data / EU people / geography / other.",
        "US patient records are HIPAA; US public-company reporting is SOX. Both are 'neither'.",
        "Erasure on request is a GDPR right; SCCs are a GDPR Chapter-V transfer mechanism; in-country metadata mandates are localization.",
      ],
      check: (e) => mapEq(mapS(e["h9"]), D.SPOTLIGHT_H9.answer),
      success:
        "Six cases, clean instincts: PAN storage → PCI, erasure requests and SCCs → GDPR, in-country mandates → locality, and the two US regimes (HIPAA, SOX) correctly declined. Distinguishing 'nearby but different' regimes is precisely what the exam's hardest multiple-choice items test.",
      fail: "Two cases belong to other regimes entirely — look for the data type (health records) and the rule source (financial reporting law) rather than the word 'compliance' in the case line.",
    },
  ];

  const OBJ_BY_ID = Object.fromEntries(OBJECTIVES.map((o) => [o.id, o]));
  const objectivesFor = (mode) => OBJECTIVES.filter((o) => o.mode === mode);

  return { OBJECTIVES, OBJ_BY_ID, objectivesFor };
})();
