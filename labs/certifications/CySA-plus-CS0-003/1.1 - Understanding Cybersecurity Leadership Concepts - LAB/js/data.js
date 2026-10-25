/**
 * CyberLab — CASE FILE CS0-003-1.1 "The Leadership Ledger" — LAB DATA
 * CompTIA CySA+ CS0-003 — Lesson 1.1: Understanding Cybersecurity Leadership Concepts
 *
 * Ported 1:1 (machine-transpiled, not hand-copied) from the original TypeScript lab.
 * ALL DATA IS SYNTHETIC TRAINING DATA. Fictional organization, fictional people,
 * fictional evidence. Regulatory summaries are simplified and labeled as such.
 * MITRE references are illustrative defensive context (verified IDs):
 *   T1566 Phishing (Initial Access) · T1486 Data Encrypted for Impact (Impact)
 *   M1032 Multi-Factor Authentication · M1051 Update Software · M1053 Data Backup
 *
 * This file is pure content. The validation engine lives in objectives.js.
 * Loaded as a classic script: its top-level consts are shared with later scripts.
 */
/**
 * CyberLab — CASE FILE CS0-003-1.1 "The Leadership Ledger"
 * CompTIA CySA+ CS0-003 — Lesson 1.1: Understanding Cybersecurity Leadership Concepts
 *
 * ALL DATA IS SYNTHETIC TRAINING DATA. Fictional organization, fictional people,
 * fictional evidence. Regulatory summaries are simplified and labeled as such.
 * MITRE references are illustrative defensive context (verified IDs):
 *   T1566 Phishing (Initial Access) · T1486 Data Encrypted for Impact (Impact)
 *   M1032 Multi-Factor Authentication · M1051 Update Software · M1053 Data Backup
 */
/* ------------------------------------------------------------------ */
/* Pillar metadata                                                     */
/* ------------------------------------------------------------------ */
const PILLARS = {
    P1: { label: 'UNDERSTAND', color: '#8a5a00', bg: '#fdf0d2', desc: 'What leadership means: vision → goals → assets' },
    P2: { label: 'RECOGNIZE', color: '#7c2a2a', bg: '#f8e3e3', desc: 'Spot leadership quality (or failure) in real evidence' },
    P3: { label: 'DECIDE & DETECT', color: '#4d7c0f', bg: '#e9f3d8', desc: 'Sense the signal, decide under pressure, escalate' },
    P4: { label: 'ACT & ADVISE', color: '#57534e', bg: '#ece9e4', desc: 'Choose controls, advise protection, resolve conflict' },
};
/* ------------------------------------------------------------------ */
/* C1 — Scenario briefing                                              */
/* ------------------------------------------------------------------ */
const BRIEFING = {
    caseNo: 'CS0-003-1.1',
    codename: 'THE LEADERSHIP LEDGER',
    org: 'Novara Health Logistics',
    orgDesc: 'A regional healthcare supply distributor: 500 staff, 14 warehouses, hospital supply contracts across three states, and device telemetry from partner clinics. When a hospital cannot receive its order, care is delayed.',
    story: [
        'Last quarter, ransomware began encrypting file server FS-04 — which holds patient-supply schedules. The technology worked: alerts fired, backups held. The leadership did not: for three hours nobody knew who could decide anything, legal learned about the incident from a hallway rumor, and a well-meaning engineer nearly wiped the evidence.',
        'The board now calls that night "the Meridian Close Call" — named for the Meridian Street warehouse where FS-04 sits — and it is why they hired you. You start today as Chief Information Security Officer. Your job is not to plug cables. It is to give the security team a vision and goals, advise the business on the right level of protection, understand the technical and legal terrain, decide fast when it counts, and communicate so that technical and non-technical stakeholders actually hear the same message.',
        'This case file walks that entire mandate. Every memo on your desk is drawn from Lesson 1.1 of CompTIA CySA+ CS0-003: understanding cybersecurity leadership concepts.',
    ],
    mastery: [
        'Explain what a cybersecurity leader is for: vision, goals, protection levels, decisions, people.',
        'Recognize strong vs. failed leadership in raw evidence — reports, memos, incident feeds.',
        'Build escalation paths, communication matrices and SMART goals that survive a 02:14 page.',
        'Apply legal duties (GDPR, HIPAA, PCI DSS, SOX, GLBA, FERPA — simplified cards) and a board risk-appetite statement to real proposals.',
    ],
    disclaimer: 'TRAINING SIMULATION — every organization, person, message and log in this lab is fictional synthetic data built for defensive education. No real PII, no offensive tooling.',
};
const STAKEHOLDERS = [
    { id: 'ceo', name: 'Dr. Amara Chen', role: 'Chief Executive Officer', tech: 'Non-technical', cares: 'Growth, patient-safety reputation, the whole risk picture in one page', channel: 'Short brief or 10-minute verbal brief', quote: 'Tell me what this means for our hospitals — not how the firewall works.', initials: 'AC' },
    { id: 'cfo', name: 'Viktor Reyes', role: 'Chief Financial Officer', tech: 'Non-technical', cares: 'Cost, cyber-insurance premiums, fine exposure, budget trade-offs', channel: 'Cost/benefit table at finance review', quote: 'What does the risk cost us — and what does the fix cost?', initials: 'VR' },
    { id: 'legal', name: 'Priya Nair', role: 'General Counsel', tech: 'Legal-technical', cares: 'Regulatory duties, notification deadlines, liability, privilege, evidence', channel: 'Privileged secure email, legal brief', quote: 'Before anyone speaks publicly, I need the facts and the clock.', initials: 'PN' },
    { id: 'itops', name: 'Tomas Lindgren', role: 'Director of IT Operations', tech: 'Technical', cares: 'Uptime, change windows, ticket load, patching feasibility', channel: 'Ops bridge call, ticketing system', quote: 'If you take my systems down mid-peak, I need to know who signs off.', initials: 'TL' },
    { id: 'soc', name: 'Jules Okafor', role: 'SOC Lead', tech: 'Deep technical', cares: 'Detections, tooling coverage, alert quality, analyst fatigue', channel: 'SITREP and technical deep-dive', quote: 'Give me the IOCs and the timeline — I will handle the rest.', initials: 'JO' },
    { id: 'board', name: 'Helena Duarte', role: 'Board Chair', tech: 'Non-technical', cares: 'Fiduciary duty, oversight, risk governance, disclosure obligations', channel: 'Board memo, quarterly risk dashboard', quote: 'Are we taking the right risks — and would we know in time?', initials: 'HD' },
    { id: 'pr', name: 'Sam Whitfield', role: 'Communications Lead', tech: 'Non-technical', cares: 'Public messaging, timing, consistency, holding statements', channel: 'Pre-approved holding statements, comms plan', quote: 'I can only say what legal has cleared — give me the line.', initials: 'SW' },
];
/* ------------------------------------------------------------------ */
/* Risk appetite (reference)                                           */
/* ------------------------------------------------------------------ */
const RISK_APPETITE = {
    title: 'Board Risk-Appetite Statement (simplified)',
    lines: [
        'Patient data (PHI) and payment data — MINIMAL risk: controls mandatory; exceptions need CISO + General Counsel sign-off AND compensating controls.',
        'Business-operations systems — LOW risk: cost-justified controls expected.',
        'Back-office / comfort systems — MODERATE risk acceptable: prefer low-cost measures.',
        'Every control proposal must state: cost, risk reduction, residual risk. Spend not tied to risk reduction is "security theater".',
    ],
};
const REGULATIONS = [
    { id: 'gdpr', name: 'GDPR', scope: "EU residents' personal data (EU/EEA)", duty: 'Notify the supervisory authority within 72 hours of becoming aware of a breach that risks people\u2019s rights and freedoms (Art. 33); notify affected people if risk is high (Art. 34).', watch: 'The clock starts at awareness — not when forensics finishes.' },
    { id: 'hipaa', name: 'HIPAA', scope: 'US protected health information (PHI)', duty: 'Notify affected individuals without unreasonable delay, no later than 60 days; if 500+ residents affected, notify HHS and prominent media within 60 days (simplified).', watch: 'Vendors handling PHI count — your supply chain inherits the duty.' },
    { id: 'pci', name: 'PCI DSS', scope: 'Payment card data (cardholder data environment)', duty: 'Contract/brand-driven standard, not a statute: annual validation; after a breach an independent forensic investigator (PFI) is typically required (simplified).', watch: 'It is a standard you contract into — not a law with a 72-hour clock.' },
    { id: 'sox', name: 'SOX', scope: 'US public companies — financial reporting integrity', duty: 'Management certifies internal controls over financial reporting; systems feeding financial reports need controlled access and change management (Sections 302/404, simplified).', watch: 'Ask: which systems feed the numbers investors see?' },
    { id: 'glba', name: 'GLBA', scope: 'US financial institutions & their service providers', duty: 'Safeguards Rule requires a written information security program protecting customer financial data (simplified).', watch: 'Partner banks will flow this requirement down to you in contracts.' },
    { id: 'ferpa', name: 'FERPA', scope: 'US student education records', duty: 'Consent required to disclose education records; narrow "school official" exceptions for vendors under direct control (simplified).', watch: 'Ed-tech pilots touching gradebooks need this review first.' },
];
const GLOSSARY = [
    { term: 'Vision', def: 'The aspirational future state a leader commits to — where the team is going, in words people can repeat.' },
    { term: 'Mission', def: 'What the team does every day to move toward the vision — the ongoing purpose.' },
    { term: 'Goal', def: 'A specific, dated step on the way to the mission — measurable and assignable.' },
    { term: 'SMART', def: 'Goal quality bar: Specific, Measurable, Achievable, Relevant, Time-bound.' },
    { term: 'Stakeholder', def: 'Anyone who affects, or is affected by, your security program — from SOC analysts to the board.' },
    { term: 'Risk appetite', def: 'The amount and type of risk the organization is willing to accept in pursuit of its objectives.' },
    { term: 'Risk tolerance', def: 'The acceptable variation around specific objectives — appetite applied to a concrete area.' },
    { term: 'Due care', def: 'Doing what a reasonable organization would do to protect assets; falling short invites liability.' },
    { term: 'Due diligence', def: 'Continuously verifying that the protections you claim are actually operating.' },
    { term: 'Escalation path', def: 'The pre-agreed chain of who is told what, when — so a 02:14 incident never waits for someone to "wake up".' },
    { term: 'RACI', def: 'Decision-authority map: Responsible, Accountable, Consulted, Informed — for every key security decision.' },
    { term: 'KPI', def: 'Key Performance Indicator — how well the security program itself is performing.' },
    { term: 'KRI', def: 'Key Risk Indicator — an early-warning signal that risk is building before it becomes an incident.' },
    { term: 'Tabletop exercise', def: 'A rehearsal where the team walks an incident on paper — cheap tuition for an expensive night.' },
    { term: 'Business impact', def: 'What a technical event means for patients, money, operations and trust — the language of leadership.' },
];
const KNOWLEDGE = [
    {
        id: 'job',
        label: 'The leader\u2019s job',
        points: [
            'Create a vision: the future state worth working toward, in words a warehouse manager could repeat.',
            'Set goals that turn the vision into dated, measurable steps for the team — not vibes.',
            'Secure organizational assets: people, technology, data and process — not only servers.',
            'Lead ≠ manage: managers maintain the machine; leaders decide where the machine goes and own the risk story.',
        ],
        example: 'Field example: after the Meridian Close Call, Novara\u2019s board asked for "a leader, not another admin." The difference they named: someone who could state what right looks like — and prove progress.',
    },
    {
        id: 'legal',
        label: 'Technical & legal compass',
        points: [
            'Advising on "appropriate levels of protection" means knowing the technology AND the law that shapes it.',
            'Regulatory duties set hard floors: notification clocks, control requirements, vendor flow-down (see the quick-cards).',
            'Industry nuance matters: healthcare supply chains carry HIPAA exposure, care-chain ransomware and device telemetry risks that a generic program misses.',
            'Due care / due diligence: protection you claim must actually operate — that is what audits and courts examine.',
        ],
        example: 'Field example: adversaries start with people — phishing (MITRE ATT&CK T1566) remains the top initial-access vector — so awareness goals are as "technical" as any firewall. Ransomware\u2019s blast maps to T1486, Data Encrypted for Impact.',
    },
    {
        id: 'decide',
        label: 'Deciding under pressure',
        points: [
            'Leaders decide quickly and confidently — because the escalation path, authority map (RACI) and appetite statement were agreed before the incident.',
            'Containment usually precedes certainty: isolate first, investigate second, communicate third.',
            'Evidence survives decisions: never wipe before imaging.',
            'Urgency is a weapon: "expires in one hour" pressure that bypasses process is exactly how social engineering works on leaders.',
        ],
        example: 'Field example: post-incident reviews of major breaches repeatedly find the same failure — not missing tools, but missing decision authority. The Meridian Close Call froze for three hours for exactly that reason.',
    },
    {
        id: 'people',
        label: 'People & messaging',
        points: [
            'Interpersonal skills are controls: listening, negotiating, resolving conflict, delegating, motivating.',
            'Same incident, different audiences: technical detail to engineers; business impact to executives; duties to legal; timing to PR.',
            'A board memo without business impact and a clear ask is noise — it will not produce a decision.',
            'Measurement earns trust: a small KPI/KRI scorecard beats a wall of raw alert counts.',
        ],
        example: 'Field example: controls like MFA (MITRE M1032), patching (M1051) and backups (M1053) only land when a leader negotiates the change windows — the tech is easy; the org chart is hard.',
    },
];
/* ------------------------------------------------------------------ */
/* Shared option sets                                                  */
/* ------------------------------------------------------------------ */
const CHOICE_IMPACT = [
    { id: 'imp-a', label: 'One file server was touched; patient and payment data were not; hospital deliveries ran on schedule.' },
    { id: 'imp-b', label: 'Our mean-time-to-detect regressed 12% quarter over quarter, 47 alerts fired, and three warehouse servers still run unsupported operating systems.' },
    { id: 'imp-c', label: 'The attack never truly reached us: monitoring stopped it at the perimeter, so there is no business impact to report for this quarter.' },
];
const IMPACT_EXPLAINS = {
    'imp-a': 'Patients, money, operations — in one sentence. That is the "so what" a board can act on.',
    'imp-b': 'Tempting because the numbers look rigorous — but tool metrics are not business impact; directors still cannot tell what changed for the organization.',
    'imp-c': 'Tempting because it is reassuring — but it contradicts the evidence: the attacker WAS inside and reached FS-04; spin destroys credibility.',
};
const CHOICE_ASK = [
    { id: 'ask-a', label: 'We request approval of $40K to extend monitoring to the warehouse network, so this class of attack is caught before it spreads.' },
    { id: 'ask-b', label: 'We request approval of $40K for an emergency incident-response retainer and EDR license expansion, so we are contractually protected before the next audit cycle.' },
    { id: 'ask-c', label: 'No decision is needed today; we will return next quarter with a full monitoring-expansion proposal once the warehouse network assessment is complete.' },
];
const ASK_EXPLAINS = {
    'ask-a': 'One decision, priced, tied to the exact gap the incident proved — that is what produces a board vote.',
    'ask-b': 'Tempting because it sounds protective — but it funds a retainer, not the warehouse gap the report actually identified.',
    'ask-c': 'Tempting because it is patient — but it hands the board no decision at all; they asked "what do you need?"',
};
/* ------------------------------------------------------------------ */
/* Objectives — MEDIUM (12)                                            */
/* ------------------------------------------------------------------ */
const OBJECTIVES = [
    /* ---------------- M1 vision / mission / goal ---------------- */
    {
        id: 'OBJ-M1', mode: 'medium', index: 1, code: 'M-01',
        title: 'Sort the leader\u2019s three sentences',
        task: 'Assign each statement from your onboarding pack to its layer — Vision, Mission, or Goal. Getting the layers right is step one of creating direction for the team.',
        pillar: 'P1',
        anchor: 'Lesson detail: "creating a vision and setting goals for a team"',
        where: 'Knowledge Core tab "The leader\u2019s job" + the wording of each card.',
        hints: [
            'Vision paints a future nobody has reached yet; mission describes what you do every day; a goal has a number and a date.',
            'Look for grammar cues: "a world where…" = vision; "we protect / we hunt" = mission; "by December 31" = goal.',
            'Two cards end in dated targets (goals), two describe daily purpose (mission), two describe an aspirational future (vision).',
        ],
        parts: [
            {
                kind: 'classify',
                prompt: 'Assign each statement to its layer.',
                buckets: [
                    { id: 'vision', label: 'Vision' },
                    { id: 'mission', label: 'Mission' },
                    { id: 'goal', label: 'Goal' },
                ],
                items: [
                    { id: 'v1', text: 'A regional care chain where no patient is ever harmed by a cyberattack.', correct: 'vision', explain: 'Aspirational future, no deadline — this orients every other decision. That is a vision.' },
                    { id: 'v2', text: 'To be the most trusted link in every partner\u2019s healthcare supply chain.', correct: 'vision', explain: 'A future reputation to grow into — vision layer.' },
                    { id: 'm1', text: 'We protect Novara\u2019s patients, partners and data by finding and stopping threats faster than they can do harm.', correct: 'mission', explain: 'Ongoing daily purpose — the mission that serves both visions above.' },
                    { id: 'm2', text: 'Our team hunts, contains and neutralizes threats every day so care never stops.', correct: 'mission', explain: 'What the team does continuously — mission layer.' },
                    { id: 'g1', text: 'Cut critical-patch time from 21 days to 7 by the end of Q3.', correct: 'goal', explain: 'Number + deadline + owner — a goal (SMART form). Patching speed also answers MITRE M1051, Update Software.' },
                    { id: 'g2', text: 'Raise phishing-simulation pass rate above 95% by December 31.', correct: 'goal', explain: 'Measurable, dated, and it hardens the human layer that phishing (T1566) attacks — a goal.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. You can now name the three layers of direction: vision (where), mission (what we do), goal (what changes by when). Boards fund goals; teams rally around vision and mission.',
        feedbackWrong: 'Returned. Re-read the grammar: a vision is a future state ("a chain where…"), a mission is daily purpose ("we protect…"), a goal is a measurable dated step. Layer confusion is the most common reason security strategies stall.',
    },
    /* ---------------- M2 SMART ---------------- */
    {
        id: 'OBJ-M2', mode: 'medium', index: 2, code: 'M-02',
        title: 'Make the goal SMART',
        task: 'Your predecessor left the goal "Improve security awareness." Pick the rewrite that genuinely satisfies SMART, then identify which criterion the runner-up breaks.',
        pillar: 'P1',
        anchor: 'Lesson detail: "setting goals for a team" — SMART goal quality bar',
        where: 'Glossary entry "SMART"; the three options below.',
        hints: [
            'SMART = Specific, Measurable, Achievable, Relevant, Time-bound — test each option against all five.',
            'The correct option names the metric (phishing pass rate), the baseline and target, the population, the method and the deadline.',
            '"Significantly" and "as much as possible" cannot be scored — either phrasing kills the M in SMART.',
        ],
        parts: [
            {
                kind: 'choice',
                prompt: 'Which rewrite is genuinely SMART?',
                options: [
                    { id: 's-a', label: 'Raise phishing-simulation pass rate from 78% to 95% across all 500 staff through monthly 10-minute micro-trainings by December 31.' },
                    { id: 's-b', label: 'Boost the phishing-simulation pass rate significantly across all staff with monthly micro-trainings, reviewed at each management meeting so momentum never stalls.' },
                    { id: 's-c', label: 'Reduce security incidents caused by human error as much as possible next year by improving overall awareness across every department and shift.' },
                ],
                correct: 's-a',
                explains: {
                    's-a': 'Every element is checkable: metric (phishing pass rate), baseline 78%, target 95%, population (500 staff), method (monthly micro-trainings), deadline (Dec 31).',
                    's-b': 'Tempting because it names a metric and reviews — but "significantly" sets no target and no date, so progress can never be scored.',
                    's-c': 'Tempting because it names an outcome — but "as much as possible" gives no number and "next year" no date.',
                },
                second: {
                    prompt: 'And which SMART criterion does option B fail most clearly?',
                    options: [
                        { id: 'f-spec', label: 'Specific' },
                        { id: 'f-meas', label: 'Measurable' },
                        { id: 'f-time', label: 'Time-bound' },
                    ],
                    correct: 'f-meas',
                },
            },
        ],
        feedbackCorrect: 'Filed. Option A specifies the metric, baseline, target, population, method and deadline — every element is checkable, so progress is provable to the board. Leadership runs on goals that can be scored.',
        feedbackWrong: 'Returned. A goal without a metric or a date cannot be managed, defended, or funded. "Significantly, reviewed monthly" fails Measurable; "as much as possible next year" fails Specific and Time-bound.',
    },
    /* ---------------- M3 assets ---------------- */
    {
        id: 'OBJ-M3', mode: 'medium', index: 3, code: 'M-03',
        title: 'Map the assets the team secures',
        task: 'A vision says the team secures the organization\u2019s assets — but "assets" is broader than servers. Classify each planned initiative by the asset class it primarily protects.',
        pillar: 'P1',
        anchor: 'Lesson detail: "secure an organization\u2019s assets" (people / technology / data / process)',
        where: 'Knowledge Core tab "The leader\u2019s job" (assets bullet).',
        hints: [
            'Ask: what would break if this initiative were missing — a person fooled, a machine infected, data stolen, or a process collapsing?',
            'Training and champions protect people; EDR and MFA protect technology; encryption and DLP protect data; runbooks and change gates protect process.',
            'Initiatives have secondary effects, but pick the PRIMARY asset class each one exists for.',
        ],
        parts: [
            {
                kind: 'classify',
                prompt: 'Classify each initiative by primary asset protected.',
                buckets: [
                    { id: 'people', label: 'People' },
                    { id: 'tech', label: 'Technology' },
                    { id: 'data', label: 'Data' },
                    { id: 'process', label: 'Process' },
                ],
                items: [
                    { id: 'a1', text: 'Phishing simulations and a security-champions program', correct: 'people', explain: 'Targets the human layer that phishing (T1566) exploits — primary asset: people.' },
                    { id: 'a2', text: 'Role-based secure-coding training for engineers', correct: 'people', explain: 'Skill-building for staff — primary asset: people.' },
                    { id: 'a3', text: 'EDR deployed on every endpoint and server', correct: 'tech', explain: 'Endpoint telemetry and blocking — primary asset: technology.' },
                    { id: 'a4', text: 'MFA enforced on all remote access (MITRE M1032)', correct: 'tech', explain: 'Access control on systems — primary asset: technology.' },
                    { id: 'a5', text: 'Encryption of backups containing patient data (MITRE M1053)', correct: 'data', explain: 'Confidentiality and recoverability of the data itself — primary asset: data.' },
                    { id: 'a6', text: 'Data-loss-prevention rules on file shares', correct: 'data', explain: 'Stops sensitive data leaving — primary asset: data.' },
                    { id: 'a7', text: 'Tested incident-response runbooks and quarterly tabletops', correct: 'process', explain: 'Institutional muscle memory — primary asset: process.' },
                    { id: 'a8', text: 'Change-management gates for firewall rules', correct: 'process', explain: 'Controlled modification discipline — primary asset: process.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. You just demonstrated the full asset spectrum a leader must cover: people, technology, data, process. A program strong on tech but silent on people and process is how ransomware lands anyway.',
        feedbackWrong: 'Returned. Hint: EDR/MFA = technology; encryption/DLP = data; training/champions = people; runbooks/change gates = process. Leaders budget across all four classes, not just machines.',
    },
    /* ---------------- M4 stakeholder tailoring ---------------- */
    {
        id: 'OBJ-M4', mode: 'medium', index: 4, code: 'M-04',
        title: 'Tailor the same incident to seven stakeholders',
        task: 'Open the Stakeholder Wall and read the dossiers. Then decide what each stakeholder needs MOST from you about the FS-04 incident — the same event, seven different headlines.',
        pillar: 'P2',
        anchor: 'Lesson detail: "communicate effectively with a wide range of technical and non-technical stakeholders"',
        where: 'Left panel — Stakeholder Wall dossiers.',
        hints: [
            'Each dossier lists what the person cares about — match the message type to the care.',
            'Engineers want technical detail and timelines; executives want business impact; counsel wants duties; comms wants timing.',
            'When in doubt, re-read the stakeholder quote on their dossier — it is the answer in their own words.',
        ],
        parts: [
            {
                kind: 'match',
                prompt: 'What does each stakeholder need most?',
                rows: [
                    { id: 'ceo', text: 'Dr. Amara Chen — CEO', correct: 'biz', explain: 'CEO: one-page meaning — patients, money, reputation. Business impact first.' },
                    { id: 'cfo', text: 'Viktor Reyes — CFO', correct: 'biz', explain: 'CFO: cost of risk vs cost of fix, fines, insurance — business impact with numbers.' },
                    { id: 'legal', text: 'Priya Nair — General Counsel', correct: 'legal', explain: 'Counsel: legal duties, notification clocks, privilege — before anyone speaks publicly.' },
                    { id: 'itops', text: 'Tomas Lindgren — IT Operations', correct: 'tech', explain: 'Ops: system lists, containment steps, change windows — technical detail and timelines.' },
                    { id: 'soc', text: 'Jules Okafor — SOC Lead', correct: 'tech', explain: 'SOC: IOCs, timeline, detection changes — the deepest technical detail you have.' },
                    { id: 'board', text: 'Helena Duarte — Board Chair', correct: 'biz', explain: 'Board: fiduciary oversight — risk picture and decisions, not packet captures.' },
                    { id: 'pr', text: 'Sam Whitfield — Communications', correct: 'pub', explain: 'Comms: what may be said publicly, when, in what order — messaging and timing.' },
                ],
                options: [
                    { id: 'biz', label: 'Business impact & risk picture' },
                    { id: 'tech', label: 'Technical detail & timelines' },
                    { id: 'legal', label: 'Legal duties & liability' },
                    { id: 'pub', label: 'Public messaging & timing' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Seven stakeholders, one incident, four message types. Tailoring is not dumbing down — it is respect for what each role must do next. This matrix is half of your communication plan.',
        feedbackWrong: 'Returned. Match the message to the dossier\u2019s "cares" line: executives → business impact; engineers → technical detail; counsel → legal duties; comms → public timing. Sending everyone the same email fails all of them.',
    },
    /* ---------------- M5 failed report ---------------- */
    {
        id: 'OBJ-M5', mode: 'medium', index: 5, code: 'M-05',
        title: 'Diagnose the report that lost the room',
        task: 'Your SOC lead emailed the board directly after the incident. The board replied with one line: "We don\u2019t understand what we\u2019re being asked." Identify the three communication failures in this report.',
        pillar: 'P2',
        anchor: 'Lesson detail: interpersonal/communication skills — audience-appropriate reporting',
        where: 'The evidence box below (Jules\u2019 email to the board).',
        hints: [
            'Judge the email as a board document, not a technical one: can a director answer "so what?" and "what do you need from us?"',
            'Three failures: one about vocabulary, one about meaning, one about the missing decision.',
            'Things that are NOT failures: being concise, using email as a channel, and quoting numbers.',
        ],
        evidence: [
            {
                title: 'Email — SOC Lead → Board of Directors (synthetic training data)',
                body: 'From: jules.okafor@novara-health.example\nTo: board@novara-health.example\nSubject: Alert summary\n\nLateral movement detection triggered 47 alerts from our EDR correlation engine last night. Sigma rule misfire on SMB T1036 masquerading, MTTD is up 12% QoQ. We need to tune exclusions and deploy EDR to the OT segment. — J.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Select the THREE genuine communication failures.',
                pick: 3,
                items: [
                    { id: 'm1', text: 'Unexplained jargon (T1036, sigma rule, MTTD, EDR)', correct: true, explain: 'Correct — jargon without translation forces directors to guess; most will disengage.' },
                    { id: 'm2', text: 'No business impact — nobody can tell what this means for patients, money or operations', correct: true, explain: 'Correct — without the "so what", the board cannot weigh importance.' },
                    { id: 'm3', text: 'No clear ask — nothing for the board to decide, approve or fund', correct: true, explain: 'Correct — a report without an ask cannot produce a decision; the board replied exactly that.' },
                    { id: 'd1', text: 'It is too short — board emails must be long and thorough', correct: false, explain: 'Not a failure — concise is a virtue for executives; the problem is what is missing, not the length.' },
                    { id: 'd2', text: 'It used email instead of the ticketing system', correct: false, explain: 'Not a failure — the board is precisely the audience email suits; tickets are for operations.' },
                    { id: 'd3', text: 'It quotes a number (47 alerts) — boards dislike numbers', correct: false, explain: 'Not a failure — numbers are good WITH context; 47 alerts alone is meaningless, 47 alerts + impact is powerful.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Jargon without translation, no business impact, no ask — the three horsemen of unreadable leadership writing. Fix these three and the same incident becomes a fundable decision.',
        feedbackWrong: 'Returned. The three real failures: jargon, missing business impact, missing ask. Length, channel and numbers were fine. Re-check the evidence box with "so what?" and "what do you need?" in mind.',
    },
    /* ---------------- M6 rewrite ---------------- */
    {
        id: 'OBJ-M6', mode: 'medium', index: 6, code: 'M-06',
        title: 'Rewrite for the board',
        task: 'Now do it right: choose the board-ready version of the same incident summary.',
        pillar: 'P2',
        anchor: 'Lesson detail: communicating with non-technical stakeholders — business-impact framing',
        where: 'The rewrite options below; compare each to the three failures you found in M-05.',
        hints: [
            'A good board summary: plain language, business impact, and one concrete ask.',
            'Option B still speaks SOC dialect; option C trades jargon for panic. Neither produces a calm decision.',
            'The right version answers: what happened, what it means, what you need — in that order.',
        ],
        parts: [
            {
                kind: 'choice',
                prompt: 'Which version is board-ready?',
                options: [
                    { id: 'r-a', label: 'Last night attackers tried to move deeper into our network after an initial break-in. Our monitoring stopped them at one file server within hours. No patient or payment data was touched and hospital deliveries ran normally. We ask the board to approve $40K to extend monitoring to the warehouse network, which would catch this class of attack earlier.' },
                    { id: 'r-b', label: 'Last night a lateral movement attempt traversed SMB through the jump host; our EDR correlation engine raised 47 alerts, and sigma tuning plus EDR expansion to the OT segment are the recommended remediations.' },
                    { id: 'r-c', label: 'We need to be honest: attackers were inside our network last night and only good fortune stopped them from reaching patient data, so we urgently request a major budget increase to make sure this never happens again.' },
                ],
                correct: 'r-a',
                explains: {
                    'r-a': 'Plain words, honest scope, real impact, one priced ask — what happened, what it means, what you need.',
                    'r-b': 'Tempting because it is calm and factual — but it is SOC dialect: no director can answer "so what?" or "what do you need?"',
                    'r-c': 'Tempting because it is plain and urgent — but "good fortune" and an unpriced "major increase" trade evidence for panic; boards stop funding alarmists.',
                },
            },
        ],
        feedbackCorrect: 'Filed. Plain words, honest scope, real impact, one ask with a price. This is the version that gets approved — and it took the same facts. That transformation is the interpersonal skill the lesson means.',
        feedbackWrong: 'Returned. Option B is the jargon trap again; option C is alarmism without evidence — boards stop trusting alarmists. Build: what happened → what it means for patients/money → the one ask.',
    },
    /* ---------------- M7 regulatory matching ---------------- */
    {
        id: 'OBJ-M7', mode: 'medium', index: 7, code: 'M-07',
        title: 'Which law is knocking? (regulatory scan)',
        task: 'Six matters landed on the legal-ops desk. Match each to the regulation that primarily drives your duty. Leaders advise on these constantly — simplified cards are on your Reference Shelf.',
        pillar: 'P3',
        anchor: 'Lesson detail: "understand the technical and legal aspects of the industry"',
        where: 'Reference Shelf → Regulations quick-cards.',
        hints: [
            'Identify the data type first: health records, EU personal data, card data, financial reporting, banking, student records.',
            'GDPR = EU personal data + 72-hour authority notification. HIPAA = US health data. PCI DSS = card environment (a standard, not a law).',
            'SOX = public-company financial reporting controls. GLBA = financial institutions\u2019 safeguards. FERPA = student education records.',
        ],
        parts: [
            {
                kind: 'match',
                prompt: 'Match each matter to its primary regulation.',
                rows: [
                    { id: 'q1', text: 'Appointment records of a partner clinic\u2019s patients are exposed online.', correct: 'hipaa', explain: 'US clinic + PHI → HIPAA breach-notification duties (individuals ≤60 days; simplified).' },
                    { id: 'q2', text: 'A misconfigured cloud bucket leaks 5,200 EU customers\u2019 contact details.', correct: 'gdpr', explain: 'EU residents\u2019 personal data → GDPR: authority notification within 72 hours of awareness if risk exists (Art. 33, simplified).' },
                    { id: 'q3', text: 'An auditor asks for evidence of controls over the card-payment environment.', correct: 'pci', explain: 'Cardholder data environment → PCI DSS — a contractual standard, not a statute.' },
                    { id: 'q4', text: 'The CFO wants assurance the billing system feeding financial reports is controlled.', correct: 'sox', explain: 'Public-company financial reporting integrity → SOX Sections 302/404 (simplified).' },
                    { id: 'q5', text: 'A partner bank requires a written information security program before integration.', correct: 'glba', explain: 'Customer financial data + financial-institution flow-down → GLBA Safeguards Rule (simplified).' },
                    { id: 'q6', text: 'An ed-tech pilot wants to sync student gradebook data into our platform.', correct: 'ferpa', explain: 'Student education records → FERPA consent/school-official rules (simplified).' },
                ],
                options: [
                    { id: 'gdpr', label: 'GDPR' },
                    { id: 'hipaa', label: 'HIPAA' },
                    { id: 'pci', label: 'PCI DSS' },
                    { id: 'sox', label: 'SOX' },
                    { id: 'glba', label: 'GLBA' },
                    { id: 'ferpa', label: 'FERPA' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Data type → duty: that two-step is how leaders answer legal questions fast. Novara touches health (HIPAA), EU contacts (GDPR), cards (PCI DSS) and public-company reporting (SOX) — industry nuance is not optional.',
        feedbackWrong: 'Returned. Start from the data, not the scenario dressing: health → HIPAA, EU personal → GDPR, cards → PCI DSS, financial reporting → SOX, banking partners → GLBA, student records → FERPA. The quick-cards have one-line versions.',
    },
    /* ---------------- M8 appetite decisions ---------------- */
    {
        id: 'OBJ-M8', mode: 'medium', index: 8, code: 'M-08',
        title: 'Advise on protection levels (appetite in action)',
        task: 'Four control proposals reached your desk. Apply the board risk-appetite statement (left panel) and advise: approve, defer, or reject each.',
        pillar: 'P4',
        anchor: 'Lesson detail: "advise on the best approaches for providing appropriate levels of protection"',
        where: 'Left panel — the Risk Appetite card.',
        hints: [
            'The appetite statement sets zones: PHI/payment = minimal risk (controls mandatory); operations = low; back-office = moderate.',
            '"Security theater" = spend not tied to risk reduction — the appetite memo explicitly warns about it.',
            'Defer is for good ideas at the wrong cost/risk fit; reject is for proposals that violate the appetite outright.',
        ],
        parts: [
            {
                kind: 'decision',
                prompt: 'Advise on each proposal.',
                actions: [
                    { id: 'approve', label: 'Approve' },
                    { id: 'defer', label: 'Defer' },
                    { id: 'reject', label: 'Reject' },
                ],
                rows: [
                    { id: 'p1', text: 'MFA + session logging on all systems touching patient data — $40K/yr', correct: 'approve', explain: 'PHI zone = minimal risk: controls are mandatory. Approve — this is exactly where the appetite points (cf. M1032).' },
                    { id: 'p2', text: '$500K rebuild of the guest Wi-Fi as a "zero-trust showcase"', correct: 'defer', explain: 'Back-office zone tolerates moderate risk; $500K is not cost-justified here. Defer and request a risk-ranked alternative.' },
                    { id: 'p3', text: 'Ship courier tablets that display patient delivery details without encryption; accept the risk', correct: 'reject', explain: 'PHI-adjacent = minimal-risk zone: accepting unencrypted patient data violates the appetite outright. Reject (or compensating controls + CISO/GC sign-off).' },
                    { id: 'p4', text: 'Quarterly executive tabletop exercise program — $15K/yr', correct: 'approve', explain: 'Cheap rehearsal against the exact failure mode of the Meridian Close Call (decision freeze). Approve.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. You just did the core leadership advisory loop: read appetite → rank risk → match spend. Note that "defer" exists: leadership is not approve/reject only, it is sequencing under constraint.',
        feedbackWrong: 'Returned. Anchor on the appetite zones: PHI proposals that reduce risk get approved; unencrypted PHI gets rejected; over-priced back-office polish gets deferred. Costly guest-Wi-Fi showcases are security theater by the memo\u2019s own definition.',
    },
    /* ---------------- M9 incident decision sequence ---------------- */
    {
        id: 'OBJ-M9', mode: 'medium', index: 9, code: 'M-09',
        title: 'The 02:14 call — first five directives',
        task: 'Encryption confirmed on FS-04 (patient-supply schedules). Build your first five directives in order. Some suggestions you will hear tonight are traps — leave them out.',
        pillar: 'P3',
        anchor: 'Lesson detail: "make decisions quickly and confidently" (incident decision sequence)',
        where: 'Knowledge Core tab "Deciding under pressure".',
        hints: [
            'Contain → declare → escalate → legal → comms. Each step protects the next.',
            'Never wipe before imaging (evidence); never pay before exec+legal decide; never speak publicly before facts.',
            'Directive one stops the spread — everything else can survive a few minutes; the spread cannot.',
        ],
        parts: [
            {
                kind: 'sequence',
                prompt: 'Add the five directives in the order you would issue them. Trap suggestions stay out of the sequence.',
                items: [
                    { id: 'i1', text: 'Isolate FS-04 from the network to stop the encryption spreading', explain: 'Containment precedes certainty — stop the blast (T1486) first.' },
                    { id: 'i2', text: 'Declare an incident and activate the IR plan', explain: 'A formal declaration switches on the runbook, logging and legal privilege.' },
                    { id: 'i3', text: 'Escalate to the on-call CISO and open the executive bridge', explain: 'Execs make spend/ransom/publicity decisions — wake the path, don\u2019t improvise one.' },
                    { id: 'i4', text: 'Engage Legal to assess notification duties and preserve privilege', explain: 'Notification clocks (GDPR 72h, HIPAA 60d) and privilege start with legal engagement.' },
                    { id: 'i5', text: 'Brief Communications to hold all public statements until facts are confirmed', explain: 'PR speaks once, accurately — after legal clears the line.' },
                    { id: 'x1', text: 'Pay the ransom immediately to stop the clock', explain: 'Trap — a ransom decision belongs to executives with legal advice, not to the first minutes; funding attacks is also discouraged.' },
                    { id: 'x2', text: 'Wipe and reimage FS-04 right away', explain: 'Trap — destroys evidence and the recovery picture; image first, rebuild later.' },
                    { id: 'x3', text: 'Post a public warning on social media now', explain: 'Trap — premature statements create legal exposure and panic; comms waits for facts.' },
                ],
                correctOrder: ['i1', 'i2', 'i3', 'i4', 'i5'],
            },
        ],
        feedbackCorrect: 'Filed. Isolate → declare → escalate → legal → comms. Notice the pattern: the leader\u2019s first job is protecting the organization\u2019s ability to decide — not doing every task personally.',
        feedbackWrong: 'Returned. The canonical order: isolate (stop spread) → declare incident → escalate to executives → engage legal → hold public statements. Ransom, wiping and public posting are traps that each break one of those protections.',
    },
    /* ---------------- M10 escalation chain + channel ---------------- */
    {
        id: 'OBJ-M10', mode: 'medium', index: 10, code: 'M-10',
        title: 'Build the escalation path that never sleeps',
        task: 'The Meridian Close Call froze because nobody knew who to wake. Construct the escalation chain for a live incident, then pick the right channel to reach the CISO at 02:14.',
        pillar: 'P4',
        anchor: 'Lesson detail: leadership structures — escalation and stakeholder channels',
        where: 'Stakeholder Wall roles + Knowledge Core "Deciding under pressure".',
        hints: [
            'Escalation follows authority: shift → shift lead → CISO → executives → board.',
            'The chain includes only people with decision or oversight roles — vendors and journalists are not on it.',
            'At 02:14 the channel that actually reaches a human beats the channel that files a record.',
        ],
        parts: [
            {
                kind: 'sequence',
                prompt: 'Build the escalation chain, first to be woken → last.',
                items: [
                    { id: 'e1', text: 'SOC analyst on shift', explain: 'First detection and triage — already awake, starts the clock.' },
                    { id: 'e2', text: 'SOC lead (Jules Okafor)', explain: 'First management decision layer; can declare and escalate.' },
                    { id: 'e3', text: 'CISO (you)', explain: 'Owns the security response and the executive bridge.' },
                    { id: 'e4', text: 'CEO & executive team', explain: 'Spend, ransom, and enterprise decisions above CISO authority.' },
                    { id: 'e5', text: 'Board of directors', explain: 'Governance notification — same day for material incidents.' },
                    { id: 'e6', text: 'The vendor\u2019s support hotline', explain: 'Not an authority layer — a resource you may call, not someone who is escalated to.' },
                    { id: 'e7', text: 'A journalist contact', explain: 'Never part of an internal escalation path; press goes through Communications.' },
                ],
                correctOrder: ['e1', 'e2', 'e3', 'e4', 'e5'],
            },
            {
                kind: 'choice',
                prompt: 'It is 02:14 and encryption is active. Which channel reaches the CISO appropriately fast?',
                options: [
                    { id: 'c1', label: 'Phone bridge — call the on-call number immediately' },
                    { id: 'c2', label: 'Email with full details and wait for the morning stand-up' },
                    { id: 'c3', label: 'Open a ticket in the queue and set normal priority' },
                    { id: 'c4', label: 'Post in a chat channel and hope someone is reading' },
                ],
                correct: 'c1',
            },
        ],
        feedbackCorrect: 'Filed. Shift → lead → CISO → executives → board, and a phone for the 02:14 reality. An escalation path is a leadership control: it converts "someone should do something" into "the right person decides within minutes."',
        feedbackWrong: 'Returned. The chain follows authority (analyst → SOC lead → CISO → executives → board); vendors and journalists are resources or channels, not escalation targets. And at 02:14, synchronous voice wins.',
    },
    /* ---------------- M11 conflict ---------------- */
    {
        id: 'OBJ-M11', mode: 'medium', index: 11, code: 'M-11',
        title: 'The patch-window standoff',
        task: 'Tomas (IT Ops) refuses the Saturday patch window during peak flu-season deliveries: "Your maintenance window is my stock-out." Choose the response that shows leadership\u2019s interpersonal skill set.',
        pillar: 'P2',
        anchor: 'Lesson detail: "strong interpersonal skills" — listening, negotiation, conflict resolution',
        where: 'Stakeholder dossier for Tomas + Knowledge Core "People & messaging".',
        hints: [
            'The lesson names listening, negotiation and conflict resolution — the right option uses all three.',
            'Watch for the false shortcut: escalating over someone\u2019s head wins the battle and loses the operation.',
            'A good trade acknowledges his risk, restates the shared goal, and proposes a mechanism (canary + off-peak + rollback).',
        ],
        parts: [
            {
                kind: 'choice',
                prompt: 'Choose your move.',
                options: [
                    { id: 'n-a', label: 'Meet Tomas, acknowledge the uptime risk, restate the shared goal (no stock-outs AND no unpatched criticals), propose a staged rollout with a canary group and an off-peak window, and document residual risk.' },
                    { id: 'n-b', label: 'Escalate to the CEO tonight, have Tomas overruled, and lock the Saturday window — his operational concerns can be reviewed after the criticals are closed.' },
                    { id: 'n-c', label: 'Stand with Tomas: cancel the Saturday window entirely, accept the patch-SLA risk yourself, and revisit patching once flu-season deliveries calm down.' },
                    { id: 'n-d', label: 'Email Tomas a formal directive: the Saturday window is mandatory, no exceptions — his uptime concerns are noted in the ticket for the next ops review.' },
                ],
                correct: 'n-a',
                explains: {
                    'n-a': 'Listen → shared goal → mechanism (canary + off-peak + rollback) → documented residual risk. It resolves the deadlock AND keeps the patch.',
                    'n-b': 'Tempting because it guarantees the patch — but bypassing Tomas plants resentment and kills the relationship you will need at 02:14.',
                    'n-c': 'Tempting because it protects the operation — but it abandons the risk posture and teaches the organization that stalling works.',
                    'n-d': 'Tempting because it is decisive — but it is command without listening; mandates breed the "accidental" rescheduling they try to prevent.',
                },
            },
        ],
        feedbackCorrect: 'Filed. Listen → shared goal → trade-off → documented residual risk. That sequence protects both the supply chain and the patch SLA — and it builds the working relationship you will need at 02:14.',
        feedbackWrong: 'Returned. B buys compliance and plants sabotage; C abandons the risk posture; D is command without listening — the exact pattern that produces "accidental" rescheduling. Leadership negotiates mechanisms, not decrees.',
    },
    /* ---------------- M12 KPI/KRI ---------------- */
    {
        id: 'OBJ-M12', mode: 'medium', index: 12, code: 'M-12',
        title: 'Separate your KPIs from your KRIs',
        task: 'The board wants a small metrics set. Classify each candidate: is it a KPI (how the program performs) or a KRI (early warning that risk is building)?',
        pillar: 'P1',
        anchor: 'Lesson detail: deep industry understanding — measuring and steering the program',
        where: 'Glossary: KPI and KRI entries.',
        hints: [
            'KPI = performance of something we DO (patching speed, detection speed, exercises completed).',
            'KRI = exposure that exists whether or not we act yet (unpatched internet-facing CVEs, click rates, open criticals on PHI).',
            'If the metric describes exposure already sitting in the estate, it is usually a KRI.',
        ],
        parts: [
            {
                kind: 'classify',
                prompt: 'Classify each metric.',
                buckets: [
                    { id: 'kpi', label: 'KPI — program performance' },
                    { id: 'kri', label: 'KRI — risk early warning' },
                ],
                items: [
                    { id: 'k1', text: '% of critical systems patched within the 7-day SLA', correct: 'kpi', explain: 'Measures how well the patching program runs (M1051 in motion) — KPI.' },
                    { id: 'k2', text: 'Mean time to detect confirmed incidents', correct: 'kpi', explain: 'Performance of detection engineering — KPI.' },
                    { id: 'k3', text: 'Tabletop exercises completed per quarter', correct: 'kpi', explain: 'Throughput of the preparedness program — KPI.' },
                    { id: 'k4', text: 'Internet-facing systems running unpatched critical CVEs', correct: 'kri', explain: 'Standing exposure waiting to be exploited — KRI.' },
                    { id: 'k5', text: 'Share of staff clicking simulated phishing emails', correct: 'kri', explain: 'Human-layer exposure to T1566-style attacks building up — KRI.' },
                    { id: 'k6', text: 'Open critical vulnerabilities on patient-data systems', correct: 'kri', explain: 'Live risk mass in the minimal-risk zone — KRI.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. KPIs prove the engine works; KRIs warn where the next fire starts. A board scorecard with both answers "are we performing?" AND "should we be worried?" — which is the honest version of "are we secure?"',
        feedbackWrong: 'Returned. Rule of thumb: if the number describes OUR activity speed (patch SLA, MTTD, tabletops) it is a KPI; if it describes EXPOSURE sitting in the estate (unpatched internet-facing CVEs, click rates, open criticals) it is a KRI.',
    },
];
/* ------------------------------------------------------------------ */
/* Objectives — HARD (9)                                               */
/* ------------------------------------------------------------------ */
const HARD_OBJECTIVES = [
    {
        id: 'OBJ-H1', mode: 'hard', index: 1, code: 'H-01',
        title: 'Build the executive brief from raw SOC output',
        task: 'The board meets in 40 minutes about last night\u2019s incident. Transform Jules\u2019 raw technical report into a board brief: strip the jargon, choose the business-impact line, and state the ask. Multi-part — all three parts must be correct.',
        pillar: 'P2',
        anchor: 'Lesson detail: communicating with non-technical stakeholders (full brief construction)',
        where: '',
        hints: ['Boards read three things: money, patients, decisions. Everything else is translation work.'],
        evidence: [
            {
                title: 'Raw SOC report — Jules Okafor, 03:12 (synthetic training data)',
                body: 'Hunting query flagged credential-dump tooling on FS-04 (T1003.001), then 47 EDR alerts on SMB lateral movement. Sigma rule misfire on T1036 masquerading. MTTD up 12% QoQ. Movement stopped at the jump host; no patient data affected. We need $40K to extend monitoring to the warehouse network.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Part 1 — select the THREE phrases that must be translated for directors.',
                pick: 3,
                items: [
                    { id: 'j1', text: 'T1003.001', correct: true, explain: 'A bare MITRE sub-technique ID means nothing to directors — say "a known credential-stealing technique".' },
                    { id: 'j2', text: 'Sigma rule misfire on T1036 masquerading', correct: true, explain: 'Detection-engineer shorthand — say "one automated detection rule initially matched the wrong pattern".' },
                    { id: 'j3', text: 'MTTD up 12% QoQ', correct: true, explain: 'Acronym soup — say "it took us 12% longer than last quarter to notice intrusions".' },
                    { id: 'd1', text: '$40K', correct: false, explain: 'Money is the board\u2019s native language — keep it.' },
                    { id: 'd2', text: 'No patient data affected', correct: false, explain: 'Plain, honest, exactly what directors need to hear — keep it.' },
                    { id: 'd3', text: 'Extend monitoring to the warehouse network', correct: false, explain: 'Plain action statement — keep it.' },
                ],
            },
            {
                kind: 'choice',
                prompt: 'Part 2 — choose the business-impact line.',
                options: CHOICE_IMPACT,
                correct: 'imp-a',
                explains: IMPACT_EXPLAINS,
            },
            {
                kind: 'choice',
                prompt: 'Part 3 — choose the ask.',
                options: CHOICE_ASK,
                correct: 'ask-a',
                explains: ASK_EXPLAINS,
            },
        ],
        feedbackCorrect: 'Filed. Jargon translated, impact stated, ask priced. The board can now decide in one reading — which is the entire craft of executive communication.',
        feedbackWrong: 'Returned. Near-misses are rejected deliberately: keep money and plain facts; translate bare technique IDs, detection shorthand and metric acronyms; impact = patients/money/operations; ask = one decision with a price.',
    },
    {
        id: 'OBJ-H2', mode: 'hard', index: 2, code: 'H-02',
        title: 'The breach communication matrix',
        task: '03:40 — a vendor\u2019s misconfigured storage exposes appointment reminders for 5,200 EU patients (name, phone, clinic). Contained in 40 minutes. Build the communication matrix: exact timing and exact channel per stakeholder. No partial credit.',
        pillar: 'P4',
        anchor: 'Lesson detail: stakeholder communication + legal duties (full comms planning)',
        where: '',
        hints: ['Sequence follows dependency: legal duties first, public statements last. Phones for decisions, memos for governance, briefs for privilege.'],
        evidence: [
            {
                title: 'Incident note — 03:40 (synthetic training data)',
                body: 'Vendor cloud storage misconfiguration exposed appointment reminders (name, phone, clinic) for 5,200 EU patients. Vendor secured the bucket at 04:20. Exposure window ~36 hours. Forensic scoping in progress. You own the communication matrix.',
            },
        ],
        parts: [
            {
                kind: 'match',
                prompt: 'Part 1 — timing (exact).',
                rows: [
                    { id: 'legal', text: 'Priya Nair — General Counsel', correct: 't-now', explain: 'Legal first: duties, privilege and the 72-hour GDPR clock start with her engagement.' },
                    { id: 'itops', text: 'IT Ops & SOC', correct: 't-now', explain: 'Containment and evidence preservation start immediately, in parallel.' },
                    { id: 'ceo', text: 'Dr. Amara Chen — CEO', correct: 't-1h', explain: 'Executive awareness within the hour — she may get calls the moment news leaks.' },
                    { id: 'board', text: 'Helena Duarte — Board Chair', correct: 't-day', explain: 'Governance awareness same day; no action needed from the board yet.' },
                    { id: 'pr', text: 'Sam Whitfield — Communications', correct: 't-legal', explain: 'PR prepares, publishes only after legal confirms duties and the line.' },
                ],
                options: [
                    { id: 't-now', label: 'Immediately' },
                    { id: 't-1h', label: 'Within 1 hour' },
                    { id: 't-day', label: 'Same day' },
                    { id: 't-legal', label: 'Only after legal confirms duties' },
                ],
            },
            {
                kind: 'match',
                prompt: 'Part 2 — channel (exact).',
                rows: [
                    { id: 'legal', text: 'Priya Nair — General Counsel', correct: 'ch-priv', explain: 'Privileged legal brief by secure email — protects privilege and the record.' },
                    { id: 'itops', text: 'IT Ops & SOC', correct: 'ch-bridge', explain: 'Ops bridge + incident ticket — the working channel for containment and evidence.' },
                    { id: 'ceo', text: 'Dr. Amara Chen — CEO', correct: 'ch-phone', explain: 'A phone call — decisions and heads-up travel by voice.' },
                    { id: 'board', text: 'Helena Duarte — Board Chair', correct: 'ch-memo', explain: 'Short board memo — governance record, right-sized.' },
                    { id: 'pr', text: 'Sam Whitfield — Communications', correct: 'ch-hold', explain: 'Draft holding statement for review — ready, not published.' },
                ],
                options: [
                    { id: 'ch-phone', label: 'Phone call' },
                    { id: 'ch-priv', label: 'Privileged legal brief (secure email)' },
                    { id: 'ch-bridge', label: 'Ops bridge + incident ticket' },
                    { id: 'ch-memo', label: 'Short board memo' },
                    { id: 'ch-hold', label: 'Draft holding statement for review' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Legal → ops immediately; CEO within the hour; board same day; PR gated behind legal. Dependency-ordered comms with the right medium per audience — this matrix is the difference between a controlled breach and a chaotic one.',
        feedbackWrong: 'Returned. Exact matching required: legal and ops move immediately (ops in parallel), CEO within the hour, board same day, PR only after legal. Channels: privileged brief / ops bridge / phone / board memo / holding statement. Anything else leaks privilege, panic or both.',
    },
    {
        id: 'OBJ-H3', mode: 'hard', index: 3, code: 'H-03',
        title: 'The 72-hour clock',
        task: 'Friday 14:00 — you become aware that a partner leaked appointment data of 4,000 EU patients. Forensics needs two weeks. Build the correct action sequence, then make the Article 33 notification decision. The timeline contains deliberate traps.',
        pillar: 'P3',
        anchor: 'Lesson detail: legal aspects — GDPR notification duty (simplified quick-card)',
        where: '',
        hints: ['The GDPR clock starts when the organization becomes AWARE — not when forensics ends. Containment and scoping come before notification paperwork.'],
        evidence: [
            {
                title: 'Timeline — Friday (synthetic training data)',
                body: '14:00 — Partner confirms leak of 4,000 EU patients\u2019 appointment data (name, clinic, time).\n14:20 — Vendor proposes: "we notify everything ourselves in 2–3 weeks, after forensics."\n14:25 — An exec suggests: "it\u2019s only contact details — skip it."\nForensic estimate: 10–14 business days.',
            },
        ],
        parts: [
            {
                kind: 'sequence',
                prompt: 'Part 1 — order your actions. Trap suggestions stay out.',
                items: [
                    { id: 'g1', text: 'Contain the exposure and stop further data flow', explain: 'Stop the bleeding first; the clock is running but containment dominates.' },
                    { id: 'g2', text: 'Scope the data and affected people; start the clock log', explain: 'Awareness started the clock — document from minute one.' },
                    { id: 'g3', text: 'Notify the supervisory authority within 72 hours if there is risk to people', explain: 'Art. 33 (simplified): awareness Friday 14:00 → authority by Monday 14:00.' },
                    { id: 'g4', text: 'Document decisions and evidence while forensics continues', explain: 'The record protects the org and the notification\u2019s accuracy.' },
                    { id: 'g5', text: 'Notify affected patients if the risk to them is high', explain: 'Art. 34 (simplified): high risk to individuals → data-subject notification.' },
                    { id: 'gx1', text: 'Wait for the full forensic report — the 72-hour clock starts after forensics', explain: 'Trap — the clock starts at AWARENESS, not at forensic completion.' },
                    { id: 'gx2', text: 'Say nothing; contact details are not really personal data', explain: 'Trap — names + phone + clinic tied to health context is personal data with real risk.' },
                ],
                correctOrder: ['g1', 'g2', 'g3', 'g4', 'g5'],
            },
            {
                kind: 'choice',
                prompt: 'Part 2 — the Article 33 decision (simplified).',
                options: [
                    { id: 'd-a', label: 'Yes — notify the authority by Monday 14:00: patient appointment data is personal data with risk to people\u2019s rights and freedoms; forensics may continue in parallel ("staged notification").' },
                    { id: 'd-b', label: 'No — notify the authority only after forensics confirms exactly which patients are affected; premature figures risk publishing inaccurate counts and eroding trust.' },
                    { id: 'd-c', label: 'Yes — but the 72-hour clock only starts once the forensic scope is final, so schedule the authority notification for two weeks out.' },
                ],
                correct: 'd-a',
                explains: {
                    'd-a': 'Awareness started the clock Friday 14:00; appointment data in a health context is personal data with risk to people; staged notification lets forensics refine later.',
                    'd-b': 'Tempting because accuracy matters — but Art. 33 (simplified) runs from awareness, and staged notification exists precisely for incomplete scoping.',
                    'd-c': 'Tempting because the instinct to notify is right — but the clock starts at awareness, not at forensic completion.',
                },
            },
        ],
        feedbackCorrect: 'Filed. Awareness starts the clock; containment and scoping precede paperwork; "staged notification" lets forensics refine later. You just handled the hardest kind of legal decision: one with a deadline attached to an investigation that is not finished.',
        feedbackWrong: 'Returned. Traps rejected by design: the 72-hour clock starts at awareness (not after forensics), and contact details in a health context ARE personal data. Sequence: contain → scope → notify authority → document → notify people if high risk.',
    },
    {
        id: 'OBJ-H4', mode: 'hard', index: 4, code: 'H-04',
        title: 'Vision-traceability audit',
        task: 'Your predecessor left six team goals. The vision: "A regional care chain where no patient is ever harmed by a cyberattack, with Novara as the most trusted link in the supply chain." Audit them: find the three goals that do NOT trace to the vision, then re-align each.',
        pillar: 'P1',
        anchor: 'Lesson detail: creating a vision and setting goals — traceability from vision to goals',
        where: '',
        hints: ['A goal traces to the vision if achieving it plausibly reduces harm to the care chain or builds supply-chain trust. Procurement percentages, server renaming and conference junkets fail that test.'],
        evidence: [
            {
                title: 'Team goals — inherited (synthetic training data)',
                body: 'G1. Cut critical-patch time from 21 to 7 days by Q3.\nG2. Lift phishing-simulation pass rate above 95% by Dec 31.\nG3. Achieve a 100% supplier contract renewal rate this year.\nG4. Cut mean time to detect confirmed incidents below 6 hours.\nG5. Rename all 1,200 servers to the new naming convention by Q4.\nG6. Send 4 analysts to a security conference in Cancun.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Part 1 — select the THREE goals that do not trace to the vision.',
                pick: 3,
                items: [
                    { id: 'g3', text: 'G3 — 100% supplier contract renewal rate', correct: true, explain: 'A procurement metric; renewing contracts neither reduces cyber harm nor builds security trust.' },
                    { id: 'g5', text: 'G5 — rename all 1,200 servers by Q4', correct: true, explain: 'Cosmetic housekeeping — zero causal path to "no patient harmed".' },
                    { id: 'g6', text: 'G6 — send 4 analysts to Cancun', correct: true, explain: 'A perk unless tied to a capability the vision needs; as written it traces nowhere.' },
                    { id: 'g1', text: 'G1 — patch criticals in 7 days', correct: false, explain: 'Directly shrinks the window attackers exploit — traces to the vision.' },
                    { id: 'g2', text: 'G2 — phishing pass rate >95%', correct: false, explain: 'Hardens the human layer that T1566 attacks — traces to the vision.' },
                    { id: 'g4', text: 'G4 — MTTD under 6 hours', correct: false, explain: 'Faster detection means less harm done — traces to the vision.' },
                ],
            },
            {
                kind: 'match',
                prompt: 'Part 2 — choose the re-aligned replacement for each misaligned goal.',
                rows: [
                    { id: 'r-g3', text: 'G3 replacement', correct: 'f-supplier', explain: 'Turns procurement into a security control: breach-notice and audit rights reduce third-party harm.' },
                    { id: 'r-g5', text: 'G5 replacement', correct: 'f-harden', explain: 'Same asset inventory effort, repointed at actual risk reduction (baseline hardening).' },
                    { id: 'r-g6', text: 'G6 replacement', correct: 'f-cert', explain: 'Same people-investment, repointed at a capability the vision needs: cloud incident response.' },
                ],
                options: [
                    { id: 'f-supplier', label: 'Require security addenda (breach notice, audit rights) in 100% of new supplier contracts by Q4' },
                    { id: 'f-harden', label: 'Harden all 1,200 servers to the CIS baseline and verify by Q4' },
                    { id: 'f-cert', label: 'Certify 4 analysts on cloud incident response by year end' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Every goal now has a visible line to "no patient harmed, most trusted link." Vision-traceability is how leaders kill zombie projects and defend budgets: if it does not serve the vision, it does not get funded.',
        feedbackWrong: 'Returned. Test each goal: does achieving it plausibly reduce harm to the care chain or build trust? Renewal rate, server renaming and junkets fail; patch speed, phishing resilience and MTTD pass. Then re-align, don\u2019t just delete.',
    },
    {
        id: 'OBJ-H5', mode: 'hard', index: 5, code: 'H-05',
        title: 'The $180K portfolio decision',
        task: 'You have $180K this quarter. Five proposals are on the table (evidence box). Select the exact portfolio to fund — it must fit the budget, fit the appetite zones, and close the biggest real risks. Then identify the "security theater" proposal.',
        pillar: 'P4',
        anchor: 'Lesson detail: advising on appropriate levels of protection (portfolio-level advisory)',
        where: '',
        hints: ['Cover the minimal-risk zone first (PHI), then the gap the last incident exposed, then the human layer attackers actually use. Sum to ≤ $180K.'],
        evidence: [
            {
                title: 'Proposals — Q3 budget cycle (synthetic training data)',
                body: 'P1. MFA + privileged access management on patient-data systems — $90K — closes standing PHI exposure.\nP2. Extend EDR to the warehouse/OT network — $70K — closes the gap from last night\u2019s incident.\nP3. Security-awareness micro-training program — $20K — addresses the phishing (T1566) human layer.\nP4. Biometric turnstiles for HQ lobby — $120K — premium look; HQ already access-controlled; low risk reduction.\nP5. Cyber-insurance uplift — $25K — transfers residual risk; complements (not replaces) controls.\nBudget: $180K. Appetite: PHI = minimal risk; ops = low; back-office = moderate.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Part 1 — select the exact portfolio to fund (all and only the right proposals).',
                pick: 3,
                items: [
                    { id: 'p1', text: 'P1 — MFA + PAM on patient-data systems ($90K)', correct: true, explain: 'Minimal-risk zone first: mandatory controls on PHI. In.' },
                    { id: 'p2', text: 'P2 — EDR extension to warehouse/OT ($70K)', correct: true, explain: 'Closes the exact gap last night proved real. In.' },
                    { id: 'p3', text: 'P3 — Awareness micro-training ($20K)', correct: true, explain: 'The human layer that phishing (T1566) actually attacks. In. Total: $180K exactly.' },
                    { id: 'p4', text: 'P4 — Biometric lobby turnstiles ($120K)', correct: false, explain: 'Out alone — but P1+P2+P4 = $280K busts the budget, and HQ lobby is already access-controlled: spend not tied to risk reduction.' },
                    { id: 'p5', text: 'P5 — Insurance uplift ($25K)', correct: false, explain: 'Defensible at $145K total… but leaving P3 (the actual attack vector) unfunded to buy insurance is a weaker portfolio; $180K fits P1+P2+P3 exactly.' },
                ],
            },
            {
                kind: 'choice',
                prompt: 'Part 2 — which proposal is the clearest "security theater" per the appetite memo?',
                options: [
                    { id: 'th-a', label: 'P4 — biometric turnstiles for an already-access-controlled lobby' },
                    { id: 'th-b', label: 'P1 — MFA + PAM on patient-data systems' },
                    { id: 'th-c', label: 'P5 — cyber-insurance uplift' },
                ],
                correct: 'th-a',
            },
        ],
        feedbackCorrect: 'Filed. P1+P2+P3 = $180K: PHI zone closed, incident gap closed, human layer funded, exactly on budget. Portfolio advisory is appetite applied under constraint — and naming the theater keeps future proposals honest.',
        feedbackWrong: 'Returned. Near-misses rejected with rationale: P1+P2+P4 busts the budget AND skips the human layer; P1+P2+P5 leaves T1566-funded humans unfunded. The minimal-zone-first stack is P1+P2+P3 = $180K. Theater = P4.',
    },
    {
        id: 'OBJ-H6', mode: 'hard', index: 6, code: 'H-06',
        title: 'Command the noisy 02:14 bridge',
        task: 'Eight messages hit the bridge in 15 minutes — including at least two red herrings. Identify the herrings, sequence your four first-hour actions, then pick the escalation rationale. Strict validation.',
        pillar: 'P3',
        anchor: 'Lesson detail: decision-making under pressure + escalation (noisy realistic conditions)',
        where: '',
        hints: ['Urgency + sales language and unrelated infrastructure noise are the two classic herring shapes. Real actions: isolate, activate, preserve, gate comms.'],
        evidence: [
            {
                title: 'Bridge feed 02:14–02:29 (synthetic training data)',
                body: '02:14 SOC canary: mass file writes on FS-04 (patient-supply schedules); encryption-pattern entropy.\n02:16 On-call IT: "FS-04 shares doubling in used space. Cable-pull?"\n02:18 VendorSecureAlert (sales): "ACT NOW — emergency IR retainer, 30% off, expires in 1 hour!"\n02:21 Facilities: "3 printers offline on 2F, queue errors; unrelated maintenance."\n02:24 SOC: encryption confirmed on FS-04 share; DFS replication could spread it to two mirrors.\n02:26 Help desk: users report slow email; quota cleanup ticket from this morning.\n02:27 Legal (paged): standing by; privilege requested.\n02:29 PR: reporter called asking about "a hack"; holding statement ready for review.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Part 1 — select the TWO red herrings (unrelated to this incident).',
                pick: 2,
                items: [
                    { id: 'h1', text: '02:18 VendorSecureAlert "30% emergency retainer — expires in 1 hour"', correct: true, explain: 'Sales urgency impersonating an alert — the same lever phishing (T1566) pulls on humans. Not part of the incident.' },
                    { id: 'h2', text: '02:21 Facilities: three printers offline on 2F', correct: true, explain: 'Unrelated maintenance noise; printers are not in the encryption path. Not part of the incident.' },
                    { id: 'k1', text: '02:14 SOC canary: mass writes on FS-04', correct: false, explain: 'Core detection — the incident itself.' },
                    { id: 'k2', text: '02:16 On-call IT: cable-pull question', correct: false, explain: 'Containment decision input — real.' },
                    { id: 'k3', text: '02:24 SOC: DFS replication could spread it', correct: false, explain: 'Blast-radius fact that shapes directive one — real.' },
                    { id: 'k4', text: '02:27 Legal paged / 02:29 PR reporter call', correct: false, explain: 'Duty and comms pressure — real stakeholder traffic, not noise.' },
                ],
            },
            {
                kind: 'sequence',
                prompt: 'Part 2 — sequence your four first-hour actions.',
                items: [
                    { id: 's1', text: 'Isolate FS-04 AND pause DFS replication', explain: 'Contains the blast and the mirrors in one move.' },
                    { id: 's2', text: 'Activate the IR plan and open the executive bridge', explain: 'Formal declaration switches on authority and logging.' },
                    { id: 's3', text: 'Image FS-04 to preserve evidence before any cleanup', explain: 'Evidence before repair — always.' },
                    { id: 's4', text: 'Route all external statements through Legal and Communications', explain: 'The reporter gets nothing until privilege and facts align.' },
                    { id: 'sx1', text: 'Accept the 30% retainer before it expires', explain: 'Trap — urgency pricing is a social-engineering pattern; procurement follows process even at 02:00.' },
                    { id: 'sx2', text: 'Restart the 2F printers and close the ticket', explain: 'Trap — unrelated noise; touching it spends attention you do not have.' },
                ],
                correctOrder: ['s1', 's2', 's3', 's4'],
            },
            {
                kind: 'choice',
                prompt: 'Part 3 — the escalation rationale you give the bridge.',
                options: [
                    { id: 'r-a', label: 'Active encryption touching patient-adjacent data = minimal-risk zone → executive escalation is required NOW, not at the morning review.' },
                    { id: 'r-b', label: 'Hold executive escalation until the morning review unless projected losses exceed $1M — the appetite statement reserves wake-ups for material financial impact.' },
                    { id: 'r-c', label: 'Escalate once we have attribution — executives can decide better when they know which actor group is inside and what they typically want.' },
                ],
                correct: 'r-a',
                explains: {
                    'r-a': 'Ties escalation to the appetite zone (patient-adjacent data = minimal risk) — criteria agreed before the night, applied during it.',
                    'r-b': 'Tempting because it sounds disciplined — but the appetite zones key on data sensitivity, not dollar thresholds; waiting loses decision hours.',
                    'r-c': 'Tempting because attribution feels important — but containment and authority come first; attribution is an investigation outcome, not an escalation trigger.',
                },
            },
        ],
        feedbackCorrect: 'Filed. Herrings filtered, containment first, evidence preserved, comms gated — and the escalation rationale tied to the appetite zones, not to dollar thresholds. That is confident decision-making: criteria agreed before the night, applied during it.',
        feedbackWrong: 'Returned. Herrings: sales urgency and unrelated printer noise. Actions: isolate+DFS pause → activate IR/bridge → image before cleanup → gate statements through legal/PR. Rationale: appetite zones trigger escalation, not dollar amounts or attacker attribution.',
    },
    {
        id: 'OBJ-H7', mode: 'hard', index: 7, code: 'H-07',
        title: 'Forensics on leadership itself',
        task: 'The Meridian Close Call post-incident review lists eight findings. Leadership owns some; technology owns others. Mark exactly the FOUR leadership failures — the ones a leader, not a firewall, prevents.',
        pillar: 'P2',
        anchor: 'Lesson detail: leadership responsibilities — authority, escalation, legal readiness, comms readiness',
        where: '',
        hints: ['Ask of each finding: would pre-agreed authority, an escalation path, legal engagement or comms templates have prevented it? If yes — leadership.'],
        evidence: [
            {
                title: 'Post-incident review — "the Meridian Close Call" (synthetic training data)',
                body: 'F1. No pre-agreed decision authority for ransom demands — the bridge froze for 3 hours.\nF2. No escalation path — on-call waited for "someone to wake up."\nF3. Legal counsel had never seen the IR plan — notification assessment started 20 hours late.\nF4. No communication templates existed — PR improvised statements overnight.\nF5. EDR agents on FS-04 were two versions old.\nF6. A firewall rule allowed SMB from user VLANs to server VLANs.\nF7. The FS-04 backup job silently failed for 6 days.\nF8. FS-04 runs an OS past vendor support.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Select the FOUR leadership failures.',
                pick: 4,
                items: [
                    { id: 'f1', text: 'F1 — no pre-agreed ransom decision authority', correct: true, explain: 'Leadership: authority mapping (RACI) is set before incidents, by the leader.' },
                    { id: 'f2', text: 'F2 — no escalation path', correct: true, explain: 'Leadership: the wake-up chain is designed, tested and owned by leadership.' },
                    { id: 'f3', text: 'F3 — legal never saw the IR plan', correct: true, explain: 'Leadership: legal readiness (notification assessment, privilege) is an organizational duty.' },
                    { id: 'f4', text: 'F4 — no communication templates', correct: true, explain: 'Leadership: comms readiness per stakeholder is planned, approved and rehearsed.' },
                    { id: 'f5', text: 'F5 — EDR agents outdated', correct: false, explain: 'Technical: tooling hygiene — engineer-owned (still fix it, but it is not a leadership failure).' },
                    { id: 'f6', text: 'F6 — SMB allowed user-VLAN → server-VLAN', correct: false, explain: 'Technical: segmentation control gap.' },
                    { id: 'f7', text: 'F7 — backup job silently failed 6 days', correct: false, explain: 'Technical: monitoring of M1053 controls — engineering ownership.' },
                    { id: 'f8', text: 'F8 — unsupported OS on FS-04', correct: false, explain: 'Technical: lifecycle management gap.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. F1–F4: authority, escalation, legal readiness, comms readiness — the leader\u2019s four preventable failures. The technical findings still need fixing, but only a leader can make the org decide, wake up, and speak on schedule.',
        feedbackWrong: 'Returned. The pattern: if the fix is "we should have agreed/engaged/planned this in advance," it is leadership (F1–F4). If the fix is configuration, patching or monitoring (F5–F8), it is technical. Post-incident reviews that blur this line fix tools and repeat leadership failures.',
    },
    {
        id: 'OBJ-H8', mode: 'hard', index: 8, code: 'H-08',
        title: 'Negotiate the patch war',
        task: 'Rebuild the negotiation with Tomas (IT Ops) from cold: sequence the four moves that resolve the deadlock, and leave the two destructive shortcuts out.',
        pillar: 'P4',
        anchor: 'Lesson detail: interpersonal skills — negotiation and conflict resolution (applied)',
        where: '',
        hints: ['Listen fully → restate the shared goal → propose the mechanism → close with a review date. Shortcuts skip steps; they always resurface.'],
        parts: [
            {
                kind: 'sequence',
                prompt: 'Sequence the four moves. Destructive shortcuts stay out.',
                items: [
                    { id: 'n1', text: 'Ask Tomas to walk through his uptime concerns — listen fully', explain: 'Listening first is the interpersonal skill; you cannot trade what you have not heard.' },
                    { id: 'n2', text: 'Restate the shared goal: no stock-outs AND no unpatched criticals', explain: 'Converts "me vs you" into "us vs the risk".' },
                    { id: 'n3', text: 'Propose the trade: canary group + off-peak window + rollback plan', explain: 'A concrete mechanism that pays both sides — the heart of negotiation.' },
                    { id: 'n4', text: 'Agree on a review date and document residual risk', explain: 'Closes the loop: the decision is dated, owned and reversible if reality disagrees.' },
                    { id: 'nx1', text: 'Bypass Tomas — have the CEO order the patch', explain: 'Shortcut — wins tonight, plants sabotage and kills the relationship you need at 02:14.' },
                    { id: 'nx2', text: 'Concede: drop patching until after peak season', explain: 'Shortcut — abandons the risk posture and teaches the org that stalling works.' },
                ],
                correctOrder: ['n1', 'n2', 'n3', 'n4'],
            },
        ],
        feedbackCorrect: 'Filed. Listen → shared goal → mechanism → review date. Four moves, zero decrees. This is "strong interpersonal skills" made procedural — repeatable under pressure, which is what makes it leadership rather than charm.',
        feedbackWrong: 'Returned. The two shortcuts (CEO bypass, full concession) each win a moment and lose a quarter. The durable sequence: listen fully, restate the shared goal, propose the canary/window/rollback trade, close with a dated review.',
    },
    {
        id: 'OBJ-H9', mode: 'hard', index: 9, code: 'H-09',
        title: 'Design the board scorecard',
        task: 'The board chair wants ONE scorecard slide. Of the eight metric candidates (evidence box), select exactly the FOUR that belong — decision-relevant, risk-relevant, honest. Reject the vanity and activity metrics.',
        pillar: 'P2',
        anchor: 'Lesson detail: deep industry understanding — measuring and steering the program honestly',
        where: '',
        hints: ['Keep metrics a director can act on: performance (KPIs) and exposure (KRIs) tied to this business. Drop raw counts, activity tallies and finance deltas.'],
        evidence: [
            {
                title: 'Metric candidates (synthetic training data)',
                body: 'M1. Critical systems patched within 7-day SLA (%).\nM2. Mean time to detect confirmed incidents.\nM3. Internet-facing systems with unpatched critical CVEs (count).\nM4. Staff failing phishing simulation (%).\nM5. Trainings delivered (count).\nM6. Raw "attacks blocked" counter.\nM7. Security budget spent vs plan (%).\nM8. Tickets closed per week.',
            },
        ],
        parts: [
            {
                kind: 'multiselect',
                prompt: 'Select the FOUR scorecard metrics.',
                pick: 4,
                items: [
                    { id: 'm1', text: 'M1 — criticals patched within SLA (%)', correct: true, explain: 'KPI on the patching program (M1051 in motion) — a director can act on a slip.' },
                    { id: 'm2', text: 'M2 — mean time to detect', correct: true, explain: 'KPI on detection speed — the metric that decides incident blast radius.' },
                    { id: 'm3', text: 'M3 — internet-facing unpatched criticals (count)', correct: true, explain: 'KRI: standing exposure on the front door — early warning.' },
                    { id: 'm4', text: 'M4 — phishing simulation failure (%)', correct: true, explain: 'KRI: human-layer exposure to T1566-style attacks — early warning.' },
                    { id: 'm5', text: 'M5 — trainings delivered (count)', correct: false, explain: 'Activity, not outcome — 100 trainings can coexist with a 40% click rate.' },
                    { id: 'm6', text: 'M6 — raw "attacks blocked" counter', correct: false, explain: 'Context-free vanity — blocks scale with scanning noise, not with risk.' },
                    { id: 'm7', text: 'M7 — budget spent vs plan (%)', correct: false, explain: 'A finance view, not a risk view — it belongs in the CFO pack, not the risk scorecard.' },
                    { id: 'm8', text: 'M8 — tickets closed per week', correct: false, explain: 'Ops throughput — fine for the ops dashboard; not board risk-relevant.' },
                ],
            },
        ],
        feedbackCorrect: 'Filed. Two KPIs (M1, M2) + two KRIs (M3, M4): performance and exposure, all decision-relevant, all honest. That is the scorecard that answers "are we secure?" with integrity: here is how we perform, here is where risk sits, here is what we are doing.',
        feedbackWrong: 'Returned. Activity counts, vanity counters, finance deltas and ops throughput fail the director-action test (M5–M8). Keep: patch SLA %, MTTD, internet-facing unpatched criticals, phishing failure rate — two KPIs, two KRIs.',
    },
];
/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */
const QUIZ = [
    /* Medium — concept (7) */
    {
        id: 'qm1', mode: 'medium',
        prompt: 'Which statement is a VISION?',
        options: [
            { id: 'a', label: 'A regional care chain where no patient is ever harmed by a cyberattack.' },
            { id: 'b', label: 'We will patch every critical system within seven days of disclosure, starting from next quarter onward.' },
            { id: 'c', label: 'Our analysts monitor alerts around the clock from the security operations center, every single day.' },
        ],
        correct: 'a',
        explain: 'A vision is the aspirational future state ("a chain where no patient is harmed"). The patching line is a dated goal and the monitoring line is ongoing mission — neither paints a future worth rallying around.',
    },
    {
        id: 'qm2', mode: 'medium',
        prompt: 'What does SMART stand for in goal setting?',
        options: [
            { id: 'a', label: 'Specific, Measurable, Achievable, Relevant, Time-bound' },
            { id: 'b', label: 'Strategic, Managed, Approved, Recorded, Tested' },
            { id: 'c', label: 'Simple, Modular, Agile, Robust, Traceable' },
        ],
        correct: 'a',
        explain: 'The SMART bar is what makes a goal checkable — and therefore fundable and steerable. Option B borrows management vocabulary; option C borrows engineering vocabulary; neither is the goal-quality bar.',
    },
    {
        id: 'qm3', mode: 'medium',
        prompt: '02:14 — encryption is confirmed on FS-04. Your FIRST directive is to…',
        options: [
            { id: 'a', label: 'Isolate FS-04 to stop the spread' },
            { id: 'b', label: 'Decide on the ransom payment' },
            { id: 'c', label: 'Email the board the full alert log' },
        ],
        correct: 'a',
        explain: 'Containment precedes certainty: stop the blast (T1486) first; decisions and comms follow the runbook. A ransom call belongs to executives with legal advice, and alert logs are not a board message — both fail the first-minutes test.',
    },
    {
        id: 'qm4', mode: 'medium',
        prompt: 'A partner clinic\u2019s US patient records are exposed. Which duty primarily applies?',
        options: [
            { id: 'a', label: 'HIPAA breach notification' },
            { id: 'b', label: 'PCI DSS validation' },
            { id: 'c', label: 'SOX controls certification' },
        ],
        correct: 'a',
        explain: 'US health data (PHI) → HIPAA: individuals no later than 60 days (simplified). PCI DSS owns card data and SOX owns financial reporting — match the data type to the duty.',
    },
    {
        id: 'qm5', mode: 'medium',
        prompt: 'In a board briefing about an incident, lead with…',
        options: [
            { id: 'a', label: 'Business impact: patients, money, operations — then the ask' },
            { id: 'b', label: 'Alert counts, tool names and the full detection timeline with rule-coverage statistics' },
            { id: 'c', label: 'The overtime your analysts logged, the headcount request and the recruiting pipeline status' },
        ],
        correct: 'a',
        explain: 'Directors allocate attention to meaning, not mechanics: jargon burying the headline (B) and ops trivia (C) both fail the "so what?" test.',
    },
    {
        id: 'qm6', mode: 'medium',
        prompt: 'Risk appetite is best defined as…',
        options: [
            { id: 'a', label: 'The amount and type of risk the organization is willing to accept in pursuit of its objectives' },
            { id: 'b', label: 'The maximum regulatory fine and lawsuit exposure the organization could absorb in a worst-case year' },
            { id: 'c', label: 'The insurance deductible and premium band the CFO has approved for the coming fiscal year' },
        ],
        correct: 'a',
        explain: 'B and C describe exposure ceilings and transfer mechanisms — appetite is the board\u2019s standing answer to "how much risk will we accept?", applied when advising on controls.',
    },
    {
        id: 'qm7', mode: 'medium',
        prompt: 'Novara ships hospital supplies and receives device telemetry from clinics. Why does industry context matter to a security leader?',
        options: [
            { id: 'a', label: 'The sector drives which laws (HIPAA, GDPR via EU partners) and which threats (care-chain ransomware, supply-chain) dominate the risk picture' },
            { id: 'b', label: 'It mostly shapes the marketing language used when presenting the program to hospital partners at conferences' },
            { id: 'c', label: 'All industries face identical threats, so a generic control set transfers between sectors without adjustment' },
        ],
        correct: 'a',
        explain: 'Sector nuance drives which duties and which adversaries dominate — B undercounts it to PR, and C denies it entirely.',
    },
    /* Hard — scenario (7) */
    {
        id: 'qh1', mode: 'hard',
        prompt: '02:14: FS-04 (patient-adjacent) is encrypting. As incident commander, your first command pair is…',
        options: [
            { id: 'a', label: 'Isolate FS-04 — and nothing gets wiped before imaging' },
            { id: 'b', label: 'Wipe FS-04 — then decide whether to investigate' },
            { id: 'c', label: 'Get a ransom decision made — containment can wait' },
        ],
        correct: 'a',
        explain: 'Contain and preserve: isolation stops the blast; imaging protects the evidence and the recovery picture. Wiping destroys that evidence, and a ransom call belongs to executives with legal advice — neither is a first command.',
    },
    {
        id: 'qh2', mode: 'hard',
        prompt: 'CFO: "Cut the $15K tabletops to save money." The strongest leadership response…',
        options: [
            { id: 'a', label: 'Show the cost of an untested response — tie it to the 3-hour decision freeze and the appetite statement — then keep a leaner version if needed' },
            { id: 'b', label: 'Agree to the cut and protect the relationship — the team can practice informally during regular staff meetings instead' },
            { id: 'c', label: 'Refuse the cut outright and tell the CFO that rehearsal is non-negotiable and already as lean as it can get' },
        ],
        correct: 'a',
        explain: 'B trades preparedness for goodwill; C is rigidity without a business case. Leaders advise with the risk math in the organization\u2019s language: cost of unpreparedness vs cost of rehearsal.',
    },
    {
        id: 'qh3', mode: 'hard',
        prompt: 'Full containment detail (VLANs, hashes, timeline) goes to…',
        options: [
            { id: 'a', label: 'SOC lead & IT Operations via the ops bridge' },
            { id: 'b', label: 'The board memo, in full, so directors have complete situational awareness on record' },
            { id: 'c', label: 'An all-staff email, so rumors do not fill the information vacuum first' },
        ],
        correct: 'a',
        explain: 'Technical depth follows the people who act on it. Boards get impact and decisions (see the M-04 matrix), and an all-staff blast creates rumor risk without actionability.',
    },
    {
        id: 'qh4', mode: 'hard',
        prompt: 'EU patient contact data breached; discovered Friday 14:00. The authority-notification deadline (simplified GDPR) is…',
        options: [
            { id: 'a', label: 'Monday 14:00 — 72 hours from awareness, even while forensics continues' },
            { id: 'b', label: '72 days — notification can wait for the final forensic report' },
            { id: 'c', label: 'None — contact details are not personal data' },
        ],
        correct: 'a',
        explain: 'The clock starts at awareness; "staged notification" lets you refine later. B waits for forensics (the exact trap in H-03) and C denies the data\u2019s status — contact details in a health context ARE personal data.',
    },
    {
        id: 'qh5', mode: 'hard',
        prompt: 'Appetite says MINIMAL risk on PHI. A vendor offers a cheap-but-weak control for a PHI system. You…',
        options: [
            { id: 'a', label: 'Reject — require a control that meets the minimal-risk bar, or compensating controls with CISO + GC sign-off' },
            { id: 'b', label: 'Accept the vendor price — a cheaper control still reduces risk, and the savings can fund awareness training next quarter' },
            { id: 'c', label: 'Send it back to procurement and the vendor with no risk opinion — control selection is not the CISO\u2019s call at this price point' },
        ],
        correct: 'a',
        explain: 'Minimal-risk PHI means the minimal-risk BAR, not the cheapest option: B fails the appetite outright, and a CISO who abstains from the risk view (C) abdicates the advisory role the lesson demands.',
    },
    {
        id: 'qh6', mode: 'hard',
        prompt: 'You ordered Tomas to patch Saturday without discussion; ops "accidentally" reschedules. The root leadership failure…',
        options: [
            { id: 'a', label: 'No listening and no shared goal — mandate without negotiation breeds workarounds' },
            { id: 'b', label: 'Tomas is being insubordinate — the fix is HR escalation, a formal warning, and replacement if the behavior repeats' },
            { id: 'c', label: 'The patch tooling failed and must be replaced before anyone can fairly be held accountable for the miss' },
        ],
        correct: 'a',
        explain: 'B misreads cause as character and C hides a leadership failure inside a tooling story. The interpersonal skills ARE the control: listen → shared goal → mechanism → review date (see H-08).',
    },
    {
        id: 'qh7', mode: 'hard',
        prompt: 'Board Chair: "Are we secure?" The most professional answer…',
        options: [
            { id: 'a', label: 'An honest, risk-based framing: what we protect to which level, top residual risks, how we know, and what would change the picture — never a bare "yes"' },
            { id: 'b', label: '"Yes — we bought EDR, MFA and a backup appliance this year, so we are as secure as anyone in our sector."' },
            { id: 'c', label: '"No — we were breached last quarter, and until the remediation plan finishes nobody can claim otherwise."' },
        ],
        correct: 'a',
        explain: 'B is reassurance without evidence; C is honesty without context or trajectory. Absolute answers are unsound — leaders report risk with evidence and a trajectory, which is what earns board trust.',
    },
];
/* ------------------------------------------------------------------ */
/* C6 — Field notes (debrief)                                          */
/* ------------------------------------------------------------------ */
const FIELD_NOTES = {
    earlyWarning: [
        'An IR plan nobody has rehearsed — tabletops are the detection control for leadership gaps.',
        'An escalation path that exists only in someone\u2019s head (no RACI, no wake-up list).',
        'Stakeholders who learn about incidents from the news — your comms matrix failed.',
        'Goals without metrics, or a scorecard full of activity counts.',
        'A risk-appetite statement that no approval workflow ever consults.',
        'Reports to executives full of untranslated jargon and no ask.',
    ],
    recommendations: [
        'Maintain a tested IR plan with a RACI decision map and a wake-up escalation path; rehearse quarterly.',
        'Keep per-stakeholder communication templates (exec brief, board memo, holding statement) pre-cleared by legal.',
        'Align every goal to the vision; run a small KPI+KRI scorecard for the board.',
        'Enforce the appetite statement in control approvals; document exceptions with compensating controls.',
        'Where advice lands technically: MFA (MITRE M1032), Update Software (M1051), Data Backup (M1053) — negotiated into real change windows.',
        'Treat urgency pressure ("expires in 1 hour") as hostile until verified — it is the leader-facing version of phishing (T1566).',
    ],
    blueTeam: [
        'Your detection pipeline is only as good as the decision pipeline behind it — rehearse both.',
        'Write for the audience: one incident, four versions (tech detail, business impact, legal duty, public line).',
        'Evidence discipline (no wipe before imaging) is a rule leaders must enforce in the first five minutes.',
    ],
    redTeamMindset: [
        'Defenders\u2019 process gaps are attackers\u2019 force multipliers: a 3-hour decision freeze is worth more to an intruder than any zero-day.',
        'Urgency, authority and scarcity are the same levers used on leaders as on end users — social engineering scales upward.',
        'If you can predict that a victim org will pay quickly or stay silent, you can price your intrusion — resilience is a negotiation position too.',
    ],
    links: [
        { label: 'CompTIA CySA+ CS0-003 exam objectives (official)', href: 'https://www.comptia.org/training/resources/exam-objectives' },
        { label: 'MITRE ATT&CK — official site', href: 'https://attack.mitre.org/' },
        { label: 'MITRE D3FEND — countermeasure knowledge base', href: 'https://d3fend.mitre.org/' },
    ],
};
/* ------------------------------------------------------------------ */
/* Validation engine                                                   */
/* ------------------------------------------------------------------ */

/* Red-herring decoy memo shown in Hard mode agenda (content, not engine logic) */
const DECOY_MEMO = {
    code: 'X-00',
    title: 'URGENT — complete the cafeteria survey by EOD',
    body: 'Facilities requests ALL leadership complete the "Preferred coffee-machine firmware" survey before end of day. Deadline: today. This is urgent.',
    payoff: 'You paused on it anyway — good instinct. Urgency + trivial stakes + vague sender is the exact shape of executive-targeted social engineering (the leader-facing cousin of phishing, T1566). File under "verified noise" and move on.',
};
