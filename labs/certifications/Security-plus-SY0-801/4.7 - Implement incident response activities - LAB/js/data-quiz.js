/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/data-quiz.js
   Quiz banks (6 medium / 7 hard) + debrief content.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ============ QUIZ BANKS (rebuilt: rotation + equal-length options + distractor feedback) ============ */
const QUIZ_M=[
 {q:'Which ordering matches the official SY0-801 incident-response headings?',
  opts:['Preparation, detection, containment, recovery, lessons learned — five phases, one cycle',
        'Containment first, identification, investigation, preparation, notification, negotiation, eradication, recovery, post-incident',
        'Preparation, identification, investigation, containment, negotiation, eradication and recovery, notification, post-incident',
        'Identification, preparation, containment, investigation, eradication, recovery, then post-incident — notification optional'],
  ok:2, exp:'The official 4.7 structure has eight headings in this order, with negotiation and notification running largely alongside the main line. Tempting but wrong: the five-phase list is your lesson\'s backbone (and older NIST shorthand), not the exam heading set; the scrambled orders put containment before identification — you cannot contain what you have not noticed.'},
 {q:'How do a tabletop exercise and a simulation actually differ?',
  opts:['Tabletops rehearse decisions only; simulations inject events on live tooling',
        'Tabletops run live systems; simulations stay discussion-only around the table',
        'Tabletops test engineers only; simulations are executive-level decision rehearsals',
        'They are interchangeable names — just choose whichever your runbook prefers'],
  ok:0, exp:'Tabletop = decisions without systems; simulation = execution on real tooling (e.g. an injected phishing wave). Tempting but wrong: option two swaps the definitions; the audience split is false (both mix roles); and treating them as synonyms loses why Larkspur needed BOTH — a cyber tabletop for authority gaps and a simulation for reporting muscle memory.'},
 {q:'You reach a workstation that is actively encrypting files. Which single action destroys the MOST evidence?',
  opts:['Photographing the live screen','Pulling the network cable','Writing down the time','Powering the machine off'],
  ok:3, exp:'Power off kills RAM — key material, running processes, connections. Isolation stops spread while preserving state; photographing and noting the time are preservation steps. Tempting but wrong: the cable and the camera both help; only power destroys the memory evidence.'},
 {q:'Under a GDPR-style regime, the 72-hour breach-notification clock starts when…',
  opts:['The exact moment the encryption starts','When the organisation becomes aware','The moment their ransom demand arrives','When forensics completes and confirms facts'],
  ok:1, exp:'The clock runs from awareness — Larkspur became aware Mon 08:20 → deadline Thu 08:20. Tempting but wrong: attacker actions and forensic completion do not start a legal clock, and incomplete facts do not stop it — notify in phases and update.'},
 {q:'Who owns the pay/no-pay decision in an extortion incident?',
  opts:['The incident lead — running the response includes the money decisions',
        'Legal counsel — payment legality makes it purely a legal determination',
        'The executive sponsor — a business call informed by legal and insurance',
        'The hired negotiation specialists — they understand the leverage landscape far better'],
  ok:2, exp:'Command belongs to the incident lead, but paying carries business, legal (sanctions) and insurance weight — it belongs to the executive sponsor. Tempting but wrong: the lead commands everything AROUND the decision; legal advises rather than owns; specialists negotiate within the decided stance.'},
 {q:'Why must eradication finish BEFORE data restoration?',
  opts:['Restoring over surviving persistence means re-encryption the moment systems reconnect',
        'Restoration is slower and needs bandwidth you will not have mid-incident',
        'Backups degrade the longer they sit unrestored after an incident',
        'It does not — parallel restore is fine when fast'],
  ok:0, exp:'The S7 near-miss: persistence or attacker access that survives restoration re-fires on reconnect. Tempting but wrong: bandwidth and backup age are real constraints but not the failure mode, and parallel restore is exactly how FS-07 got re-encrypted.'}];

const QUIZ_H=[
 {q:'EDR shows "vssadmin delete shadows /all" on LK-WKS-051, encryption just starting. Best immediate action?',
  opts:['Power off WKS-051 to halt the encryption','Delete the ransom note from the share','Wait for the incident lead before touching anything','EDR-isolate it — the host stays powered on'],
  ok:3, exp:'Isolate first: stops spread, cuts the C2/exfil channel, preserves RAM and disk state. Tempting but wrong: power-off destroys memory evidence; deleting the note destroys evidence; waiting lets encryption finish — alert the lead in the same breath as isolating.'},
 {q:'The chat wallet is sanctions-flagged; your insurer requires notice within 24h of awareness; 18 hours left. Correct move?',
  opts:['Pay quickly — operations first and then challenge the sanctions question later',
        'Do not pay; notify the insurer, run sanctions and legal review',
        'Ignore the 24-hour clock — insurers surely understand that extortions run long',
        'Ask the crew to move the payment to an unflagged wallet'],
  ok:1, exp:'The insurer clock is contractual — miss it and coverage is at risk; the sanctions flag makes payment potentially unlawful regardless of pressure. Tempting but wrong: "challenge later" accepts unlawful exposure; waiting risks the policy; and nobody reroutes payments with criminals.'},
 {q:'T+60h. Facts are still incomplete (data types being classified). The regulator…',
  opts:['Is notified with available facts marked preliminary — clocks wait for nobody',
        'Is notified only once the complete forensic report has been compiled',
        'Is never notified — no personal data is confirmed at this stage',
        'Is notified by the attacker\'s leak-site publication in their own words'],
  ok:0, exp:'Awareness (Mon 08:20) started the clock; phased notification with updates is expected. Tempting but wrong: waiting for completeness breaches the deadline; "no confirmed data" ignores the duty to assess; and a criminal\'s leak site is not your compliance channel.'},
 {q:'Which practice keeps evidence USABLE in a legal process?',
  opts:['Store the image on a shared team drive','Email the image to a vendor for opinions','Hash at capture plus signed, dated custody transfers','Keep custody informal and rely on colleague trust'],
  ok:2, exp:'Chain of custody = documented, continuous, verifiable control: hash at capture, signed transfers, access log. Tempting but wrong: shared drives and email break verifiability, and "trust" is not a record — the lab\'s 08:58 event showed the permanent version of failing this.'},
 {q:'FS-07 was restored from backup while persistence remained on it; on reconnect it re-encrypted. What does this prove?',
  opts:['The backup copy itself was somehow silently corrupt','Restore-before-eradication fails: surviving persistence re-fired on reconnect','FENNELFOX broke their word — pay them instead','Backups are useless in fast-moving ransomware incidents'],
  ok:1, exp:'The sequence is the lesson, not the backup: door closed → persistence removed → rebuilt from known-good → restored from verified copies → verified clean → reconnect. Tempting but wrong: blaming the backup or the criminals misses that the ORDER was wrong; and backups remain the leverage-killer when used in sequence.'},
 {q:'Which preparation gap most DIRECTLY enabled this breach?',
  opts:['Staff clicked a phishing email that spoofed a known vendor thread','AV failed to block the encryption routine on all three endpoints','No patch SLA — CVE-2026-31337 sat unpatched nine days on edge infra','The attackers brought unusually skilled and fully custom tooling to the intrusion'],
  ok:2, exp:'Root cause lives at the failing control the attacker exploited: an actively exploited edge CVE with no fix deadline. Tempting but wrong: the click started a delivery chain a patched appliance and MFA\'d service accounts would have killed; AV is a contributor; and "skilled attackers" is the weather, not a control gap.'},
 {q:'A playbook, done right, is…',
  opts:['A pre-authored script per incident type, executable under pressure','A board-approved policy statement of response intent and appetite','An escalation contact list with phone trees and out-of-hours numbers','A legal template for regulator notifications and breach disclosures'],
  ok:0, exp:'Playbooks encode the decisions BEFORE the incident: steps, owners, thresholds, comms lines — which is why they feed automation and why an unexercised playbook (Larkspur\'s disguised gap) is a document pretending to be a capability. Tempting but wrong: policy states intent, contact lists route calls, legal templates are one artifact — none of them executes a response.'}];

/* ============ DEBRIEF CONTENT ============ */
const DEB={
 detect:[
  ['EDR / endpoint','Shadow-copy deletion, mass file rename, ransom-note writes','<code>alert on vssadmin.exe "delete shadows /all" OR &gt;1000 file writes/min with extension change</code> — and keep auto-contain ON'],
  ['VPN / identity','Service or shared account from new ASN/geo/fingerprint; no MFA','<code>alert on service-account VPN from unlisted ASN or new device fingerprint; enforce MFA on all shared accounts</code>'],
  ['Mail gateway + advisories','Targeted phishing themes hitting the sector','<code>advisory receipt triggers retro-scan of delivered mail for the theme/sender; named triage owner daily</code>'],
  ['Threat intel (CERT/vendor)','Published IOCs for an active campaign','<code>scheduled sweep of proxy/EDR/auth logs against CERT + vendor IOC lists (here: 198.51.100.44/.77)</code>'],
  ['Backup monitor','Restore tests overdue; backup job anomalies','<code>control check: restore-test age &lt; 90 days; alert on backup-service account anomalies</code>']],
 mitig:[
  'Preparation: train staff + first responders, test restores/isolation quarterly, run a cyber tabletop yearly plus a phishing simulation, maintain per-incident-type playbooks, name every role with a deputy (official heading: Preparation).',
  'Identification: give every detection source an owner with a response time; route internal and external advisories through a daily triage duty; hunt published IOCs (Identification).',
  'Investigation: preserve before you poke — power on, no login, no delete; keep custody records signed and verifiable (Investigation).',
  'Containment: isolate hosts while powered on, cut accounts and egress, protect the exfiltration target first (Containment).',
  'Negotiation: pre-decide the stance at executive level; sanctions screening, legal review, insurer clock and law-enforcement contact are non-optional (Negotiation).',
  'Eradication & recovery: patch the entry vector, remove persistence and rogue accounts, rebuild from known-good, restore from verified offline copies, verify clean before reconnection (Eradication & recovery).',
  'Notification: internal first, contractual then statutory clocks, one spokesperson, out-of-band coordination (Notification & external reporting).',
  'Post-incident: blameless RCA, PIR with changed controls, exercises booked before memories fade (Post-incident).'],
 blue:[
  'Preservation beats speed: the fastest responder who powers off a host just deleted the best evidence.',
  'Advisories are free detection — assign a reader with a deadline, or they are decoration (advisory 2026-101 sat 10 days).',
  'A control you have not tested does not exist: restore tests, isolation drills, contact lists — verify or they are hopes.',
  'Scope precisely: accessed ≠ encrypted. The difference decided Larkspur\'s containment and its regulator notice.',
  'Two clocks run in every extortion incident: the attacker\'s and the law\'s. Only one of them forgives an update.'],
 red:[
  'Attackers count on unread advisories, untested backups and stale contact lists — cheap gaps that decide their leverage.',
  'Shared accounts without MFA are master keys: one login at 02:40 was the whole intrusion. Kill them or enforce MFA.',
  'Your email is their listening post during an incident — out-of-band coordination is operational security, not paranoia.',
  'They monetize staged data first: the file server stayed the target while attention chased the encrypting laptops.'],
 links:[
  ['CompTIA Security+ SY0-801 exam objectives (official)','https://www.comptia.org/training/resources/exam-objectives'],
  ['NIST SP 800-61r2 — Computer Security Incident Handling Guide','https://csrc.nist.gov/pubs/sp/800/61/r2/final'],
  ['GDPR Article 33 — notification of a personal data breach to the supervisory authority','https://gdpr-info.eu/art-33-gdpr/']]
};