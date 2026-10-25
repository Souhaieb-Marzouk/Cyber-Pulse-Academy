// ─────────────────────────────────────────────────────────────────────────────
// js/objectives.js — CHECK RESULTS validation engine
// 12 medium + 9 hard objective definitions, each with pillar tags, an anchor
// into the single lesson input, tiered hints, teaching feedback and a pure
// machine-checkable rule over EnvState. Also: order/set comparison helpers.
// ─────────────────────────────────────────────────────────────────────────────

const setEq = (a, b) => a.length === b.length && b.every((x) => a.includes(x));
// ORDER-SENSITIVE comparison for sequence objectives (lifecycle, chain, response)
const seqEq = (a, b) => a.length === b.length && a.every((x, i) => b[i] === x);
// Granular UI classes roll up to CompTIA's atomic/computed/behavioral taxonomy
const ATOMIC = new Set(['atomic', 'domain', 'ipv4', 'url', 'email', 'tool', 'cve']);
const COMPUTED = new Set(['computed', 'hash']);
const BEHAVIORAL = new Set(['behavioral', 'behavior']);
const classOf = (v) => (ATOMIC.has(v ?? '') ? 'atomic' : COMPUTED.has(v ?? '') ? 'computed' : BEHAVIORAL.has(v ?? '') ? 'behavioral' : '');
const OBJECTIVES = [
    // ── MEDIUM ──
    {
        id: 'OBJ-M1', mode: 'medium', pillar: ['P1'],
        title: 'Triage the intake tray',
        task: 'On the Case File \u2192 Intake Tray, classify all 6 items: Active threat, Vulnerability, or Context/unverified.',
        anchor: 'Lesson detail: "Active threats represent risks to business operations that need to be identified and monitored."',
        station: 'casefile', hints: [
            'Active = happening now against us/our sector. Vulnerability = our own weakness. Context = trends or unproven claims.',
            'The forum sale, the paste dump: in motion → Active. The CVE and the dev server: our weaknesses → Vulnerability.',
            'i1 Active, i2 Vulnerability, i3 Context, i4 Active, i5 Vulnerability, i6 Context.',
        ],
        feedback: 'You separated what is happening (active threats) from what is weak (vulnerabilities) and what is just weather (context). That triage decides who owns each item: IR, IT, or the briefing deck.',
        check: (env) => {
            const want = { i1: 'active', i2: 'vuln', i3: 'context', i4: 'active', i5: 'vuln', i6: 'context' };
            const wrong = Object.keys(want).filter((k) => env.intake[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Check the classification of: ${wrong.join(', ')}. Re-read each card: is it in motion, a weakness, or unverified noise?` };
        },
    },
    {
        id: 'OBJ-M2', mode: 'medium', pillar: ['P1'],
        title: 'Line up the lifecycle',
        task: 'On the Case File \u2192 Lifecycle Board, order the six CTI lifecycle phases from first to last.',
        anchor: 'Chapter canon: the intelligence lifecycle that powers OSINT + sharing workflows.',
        station: 'casefile', hints: [
            'Start with the phase that defines requirements, end with the one that closes the loop.',
            'Direction comes first; Feedback comes last and feeds back into direction.',
            'Planning & direction → Collection → Processing → Analysis → Dissemination → Feedback.',
        ],
        feedback: 'Collection without direction is hoarding; dissemination without feedback is shouting into the void. Every workflow you ran in this lab — rack → clip → stamp → dispatch — is this loop in miniature.',
        check: (env) => (seqEq(env.lifecycle, LIFECYCLE_CORRECT)
            ? { pass: true }
            : { pass: false, why: 'The order is off. Ask yourself: requirements before or after collection? Processing before or after raw collection? Feedback closes the loop.' }),
    },
    {
        id: 'OBJ-M3', mode: 'medium', pillar: ['P1'],
        title: 'Name the discipline',
        task: 'On the Case File \u2192 Field Log, match all 5 collection snippets to their intelligence discipline.',
        anchor: 'OSINT in context: the lesson names OSINT among the collection disciplines analysts draw on.',
        station: 'casefile', hints: [
            'OSINT = publicly available; HUMINT = people; SIGINT = signals/network captures; GEOINT = imagery/geospatial; FININT = money trails.',
            'The forum thread is public → OSINT. The recruited reseller insider is HUMINT.',
            's1 SIGINT, s2 HUMINT, s3 OSINT, s4 GEOINT, s5 FININT.',
        ],
        feedback: 'This lesson spotlights OSINT because it is the discipline every organization can exercise for free — but a pro analyst knows which other discipline could answer what OSINT cannot.',
        check: (env) => {
            const want = { s1: 'sigint', s2: 'humint', s3: 'osint', s4: 'geoint', s5: 'finint' };
            const wrong = Object.keys(want).filter((k) => env.discipline[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Snippet(s) ${wrong.join(', ')} are misfiled. Public source → OSINT; recruited person → HUMINT; network capture → SIGINT.` };
        },
    },
    {
        id: 'OBJ-M4', mode: 'medium', pillar: ['P2'],
        title: 'Rack the sources',
        task: 'In the Source Rack, open the 8 core items (flagged with a dot) and tag each with its OSINT source category.',
        anchor: 'Lesson detail: "OSINT sources are diverse and include social media, blog posts, news articles, chat forums, and many other sources."',
        station: 'desk', hints: [
            'The 8 categories mirror the 8 racks — the item came FROM that rack.',
            'A paste dump is a paste site; a WHOIS extract is domain registry data.',
            'e1 social, e3 news, e5 blogs, e7 forums, e9 paste, e11 repos, e12 dns, e13 advisory.',
        ],
        feedback: 'Source tagging is how a feed becomes searchable intelligence. Six months from now, "show me every WHOIS record we collected on this crew" only works if items were filed correctly today.',
        check: (env) => {
            const want = { e1: 'social', e3: 'news', e5: 'blogs', e7: 'forums', e9: 'paste', e11: 'repos', e12: 'dns', e13: 'advisory' };
            const wrong = Object.keys(want).filter((k) => env.itemTags[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Item(s) ${wrong.join(', ')} are misfiled. Match each item to the rack it came from.` };
        },
    },
    {
        id: 'OBJ-M5', mode: 'medium', pillar: ['P2'],
        title: 'Clip the indicators',
        task: 'Open the flagged campaign items in the Evidence Desk and CLIP every true IOC span into the basket (at least the 6 key ones). Do not clip distractors.',
        anchor: 'Lesson detail: sharing platforms identify "specific details" — extraction turns public text into actionable observables.',
        station: 'desk', hints: [
            'IOCs are machine-actionable values: domains, IPs, hashes, emails, URLs. Dates, prices and actor names are not.',
            'Must-clips: halvard-portal-secure[.]com, 198.51.100.77, the sha256 hash, d.mercer@…, track-shipment-two.net, ns1.cloudspin.net.',
            'Never clip: cdn.mailroute.net (benign CDN), 192.0.2.9 (doc-range scanner), prices, dates, registrar org names.',
        ],
        feedback: 'Clean observables extracted from public text — this is the processing step of the lifecycle: raw public chatter became structured, platform-ready indicators.',
        check: (env) => {
            const must = ['c-hps', 'c-ip77', 'c-hash', 'c-mercer', 'c-track2', 'c-ns1'];
            const forbid = ['c-cdn', 'c-scanner', 'c-btc', 'c-price', 'c-fraghost', 'c-actor', 'c-date', 'c-count', 'c-11'];
            const miss = must.filter((m) => !env.clips.includes(m));
            const bad = forbid.filter((f) => env.clips.includes(f));
            if (bad.length > 0)
                return { pass: false, why: `You clipped distractor(s): ${bad.join(', ')}. Read the analyst notes on those spans — prices, dates, registrar names and shared/benign infrastructure are not IOCs.` };
            return miss.length === 0 ? { pass: true } : { pass: false, why: `Still missing: ${miss.join(', ')}. Open the flagged campaign items and clip the observable values you can imagine a machine matching on.` };
        },
    },
    {
        id: 'OBJ-M6', mode: 'medium', pillar: ['P2'],
        title: 'Stamp the indicator class',
        task: 'In ShareGrid \u2192 Intake, set the observation class for the 6 tray items: halvard-portal-secure[.]com, 198.51.100.77, d.mercer@… (atomic), the sha256 and the subject regex (computed), the sleep-then-beacon note (behavioral).',
        anchor: 'Chapter canon: atomic vs computed vs behavioral indicators.',
        station: 'grid', hints: [
            'Atomic = plain value; computed = derived by an algorithm (hashes, regexes); behavioral = a multi-step pattern.',
            'A domain, an IP and an email address are plain values. A sha256 and a regex are algorithm outputs.',
            'halvard-portal-secure[.]com = domain, 198.51.100.77 = IPv4, d.mercer@ = email, the sha256 and the subject regex = hash, sleep-then-beacon = behavior.',
        ],
        feedback: 'Classing indicators tells downstream tools how to use them: atomics feed blocklists, computed values feed YARA/Sigma logic, behavioral patterns feed hunting hypotheses and detections.',
        check: (env) => {
            const want = { 'c-hps': 'atomic', 'c-ip77': 'atomic', 'c-mercer': 'atomic', 'c-hash': 'computed', 'c-regex': 'computed', 'c-geo': 'behavioral' };
            const wrong = Object.keys(want).filter((k) => classOf(env.typing[k]) !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Class(es) wrong for: ${wrong.join(', ')}. Plain value = atomic; algorithm output (hash, regex) = computed; multi-step pattern = behavioral.` };
        },
    },
    {
        id: 'OBJ-M7', mode: 'medium', pillar: ['P3'],
        title: 'Work the Grid watchdesk',
        task: 'In ShareGrid \u2192 Watchdesk, mark each of the 4 tray indicators KNOWN (already in the v1 record) or NEW, then set watch actions for the new ones: block, monitor, or escalate.',
        anchor: 'Lesson detail: sharing platforms reveal "origin, methods, and potential targets" — correlation against shared records.',
        station: 'grid', hints: [
            'Open ShareGrid \u2192 Records: the v1 IOC list tells you what is already known.',
            '198.51.100.77 is the v1 staging host (known). The lookalike domain, the new kit hash and the exposed staff email are new.',
            'Domain → block. Kit hash → monitor (sandbox/watch). Exposed staff email → escalate (credential exposure = IR matter).',
        ],
        feedback: 'Correlation before action: known indicators get hunted retroactively, new ones get risk-proportionate handling. Blocking everything blindly is how teams burn trust and create fatigue.',
        check: (env) => {
            const wantKnown = { 'c-hps': 'new', 'c-ip77': 'known', 'c-hash': 'new', 'c-mercer': 'new' };
            const wantWatch = { 'c-hps': 'block', 'c-hash': 'monitor', 'c-mercer': 'escalate' };
            const wk = Object.keys(wantKnown).filter((k) => env.known[k] !== wantKnown[k]);
            if (wk.length)
                return { pass: false, why: `Known/new wrong for: ${wk.join(', ')}. Compare each against the v1 record list in ShareGrid → Records.` };
            const ww = Object.keys(wantWatch).filter((k) => env.watch[k] !== wantWatch[k]);
            return ww.length === 0 ? { pass: true } : { pass: false, why: `Watch action wrong for: ${ww.join(', ')}. Perimeter-visible domain → block; sample hash → monitor/sandbox; exposed staff credential → escalate to IR.` };
        },
    },
    {
        id: 'OBJ-M8', mode: 'medium', pillar: ['P3'],
        title: 'Map and instrument',
        task: 'In ShareGrid \u2192 ATT&CK Board, map behaviors b1, b2, b4, b5 to their ATT&CK technique IDs, then pick the best telemetry source for each.',
        anchor: 'Lesson detail: platforms expose adversary "methods" — ATT&CK is the shared method language.',
        station: 'grid', hints: [
            'Read each behavior\u2019s verbs: registering domains happens BEFORE any attack (Resource Development).',
            'b1 attachment → T1566.001; b2 domains → T1583.001; b4 appliance exploit → T1190; b5 HTTPS beacon → T1071.001.',
            'Telemetry: attachment emails → email gateway; domain registration → registrar/CT monitoring; appliance exploit → web/WAF logs; beacons → proxy & DNS.',
        ],
        feedback: 'ATT&CK IDs make methods shareable across teams and vendors ("we blocked T1583.001 infrastructure"). Picking the right telemetry per technique is what turns a mapping into an actual detection plan.',
        check: (env) => {
            const wantT = { b1: 'T1566.001', b2: 'T1583.001', b4: 'T1190', b5: 'T1071.001' };
            const wantE = { b1: 'email', b2: 'registrar', b4: 'web', b5: 'proxy' };
            const wt = Object.keys(wantT).filter((k) => env.techMap[k] !== wantT[k]);
            if (wt.length)
                return { pass: false, why: `Technique mapping wrong for: ${wt.join(', ')}. Use the lookup board: domain registration = T1583.001, invoice attachment = T1566.001, appliance exploit = T1190, HTTPS beacon = T1071.001.` };
            const we = Object.keys(wantE).filter((k) => env.telemetry[k] !== wantE[k]);
            return we.length === 0 ? { pass: true } : { pass: false, why: `Telemetry wrong for: ${we.join(', ')}. Where would each behavior physically leave a trace? Attachments → email gateway; new domains → registrar/CT logs; appliance exploit → web/WAF; beacons → proxy/DNS.` };
        },
    },
    {
        id: 'OBJ-M9', mode: 'medium', pillar: ['P4'],
        title: 'Route the dispatch',
        task: 'In ShareGrid \u2192 Dispatch Desk, choose the correct destination for all 4 intel packages.',
        anchor: 'Lesson detail: "threat-intelligence sharing platforms" extend to ISACs/TAXII and community platforms like MISP.',
        station: 'grid', hints: [
            'Clean, sanitized, sector-relevant observables are exactly what a TAXII feed is for.',
            'Anything with employee PII stays internal. Unverified claims are monitored, not amplified.',
            'p1 → ISAC via TAXII; p2 → withhold (PII); p3 → MISP community; p4 → do not share, monitor.',
        ],
        feedback: 'Sharing is a two-way contract: you get early warning because you contribute clean intelligence. Sending PII or unverified noise breaks trust (and privacy law) — routing discipline is what keeps the community alive.',
        check: (env) => {
            const want = { p1: 'isac', p2: 'withhold', p3: 'misp', p4: 'monitor' };
            const wrong = Object.keys(want).filter((k) => env.dispatch[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Package(s) ${wrong.join(', ')} misrouted. Sanitized IOCs → ISAC/TAXII; PII → withhold; TTP summary → MISP peers; unverified claim → monitor only.` };
        },
    },
    {
        id: 'OBJ-M10', mode: 'medium', pillar: ['P4'],
        title: 'Harden the perimeter',
        task: 'On the Case File \u2192 Response Board (Medium), select the 4 protective actions that genuinely counter Crimson Crate v2 — and nothing else.',
        anchor: 'Lesson detail: "stay ahead of active threats and protect their operations."',
        station: 'casefile', hints: [
            'Match each candidate to a v2 behavior: domains, the appliance, the lure pattern, the human target.',
            'Blocking domains + patching the appliance + email rules + targeted awareness cover all four.',
            'Reject anything that breaks the business or targets the wrong layer: total egress shutdown, firewall re-vendor, ASN rotation.',
        ],
        feedback: 'Four proportionate controls, each mapped to an observed behavior, nothing that halts the business. That proportionality — and naming what you did NOT do and why — is the defender\u2019s judgment call.',
        check: (env) => (setEq(env.hardening, ['h1', 'h2', 'h3', 'h4'])
            ? { pass: true }
            : { pass: false, why: 'Selection incomplete or overreach. Exactly 4: DNS/email blocking of the new infra, appliance patching, lure-pattern email rules, targeted staff awareness. Total egress shutdown and vendor swaps do not counter THIS campaign proportionately.' }),
    },
    {
        id: 'OBJ-M11', mode: 'medium', pillar: ['P1', 'P3'],
        title: 'File by altitude',
        task: 'On the Case File \u2192 Altitude Shelf, file the 3 intel products as tactical, operational, or strategic.',
        anchor: 'Chapter canon: intelligence products serve different audiences and time horizons.',
        station: 'casefile', hints: [
            'Who consumes it, and for how long? Blocklist = hours. Actor profile = months. Landscape = years.',
            'IOC pack → tactical. Broker profile → operational. Landscape report → strategic.',
            'Tactical feeds the SOC\u2019s tools; strategic feeds the board\u2019s risk decisions.',
        ],
        feedback: 'The same body of intelligence serves three altitudes. Sending the board an IOC pack wastes their attention; sending the SOC a landscape essay wastes the golden hour of containment.',
        check: (env) => {
            const want = { alt1: 'tactical', alt2: 'operational', alt3: 'strategic' };
            const wrong = Object.keys(want).filter((k) => env.altitudes[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Product(s) ${wrong.join(', ')} misfiled. IOC pack = tactical; crew profile = operational; sector landscape = strategic.` };
        },
    },
    {
        id: 'OBJ-M12', mode: 'medium', pillar: ['P3'],
        title: 'Track the drift',
        task: 'In ShareGrid \u2192 Timeline, compare v1 and v2 and select the 4 changes that actually happened between the two snapshots.',
        anchor: 'Lesson detail: platforms let you "track how they evolve."',
        station: 'grid', hints: [
            'Only select changes documented by the records — check the v1 summary and the v2 evidence you processed.',
            'New lookalike domain, new harvest page, narrowed targeting, new appliance exploit.',
            'Reject: ICMP C2 switch, rebranding to "Crimson Container", energy-sector move — nothing supports those.',
        ],
        feedback: 'Threats drift; defenses must drift with them. v1\u2019s blocklist alone would have missed v2\u2019s link-based harvest page — the whole reason monitoring is continuous, not one-and-done.',
        check: (env) => (setEq(env.timeline, ['t1', 't2', 't3', 't4'])
            ? { pass: true }
            : { pass: false, why: 'Selection must be exactly the 4 documented changes. Cross-check each statement against the v1 record summary and the v2 evidence you processed — anything not supported by a source is a decoy.' }),
    },
    // ── HARD ──
    {
        id: 'OBJ-H1', mode: 'hard', pillar: ['P2'],
        title: 'Cut the noise',
        task: 'In the Source Rack, flag EVERY item that belongs to the Crimson Crate v2 case (there are 8), then attach the correct decisive-evidence token to each flagged item. Everything else is noise: scam claims, wrong-sector stories, spam, and context pieces.',
        anchor: 'Lesson detail: OSINT collection must be analyzed and validated — noise is the cost of open sources.',
        station: 'desk', hints: [
            'Case-relevant: the researcher post, the trade article, the vendor blog, the access-sale thread, the staff dump, the kit commit, the WHOIS extract, the CERT bulletin.',
            'Reject: the @CargoLeakz claim (unverified scam pattern), the hospital story (wrong sector), game-account spam, the crypto paste, and the landscape essay (context, not case evidence).',
            'Tokens: technical samples → IOC match; CERT bulletin → official corroboration; sale thread + staff dump → targeting evidence; trade article → sector impact.',
        ],
        feedback: 'Eight of thirteen survived your sweep. This is the analyst\u2019s core skill: open sources are free, but relevance is expensive — and unverified claims about your own breach are handled as rumors, never as facts.',
        check: (env) => {
            const wantSel = ['e1', 'e3', 'e5', 'e7', 'e9', 'e11', 'e12', 'e13'];
            if (!setEq(env.h1Select, wantSel)) {
                const missing = wantSel.filter((x) => !env.h1Select.includes(x));
                const extra = env.h1Select.filter((x) => !wantSel.includes(x));
                if (extra.length)
                    return { pass: false, why: `You flagged noise: ${extra.join(', ')}. Test each: does it carry Crimson Crate v2 evidence or target us specifically? Scam claims, wrong-sector stories and generic spam do not.` };
                return { pass: false, why: `Missed case-relevant item(s): ${missing.join(', ')}. One of them is an official bulletin, one is infrastructure, one is a kit commit…` };
            }
            const wantTags = { e1: 'ioc', e3: 'sector', e5: 'ioc', e7: 'target', e9: 'target', e11: 'ioc', e12: 'ioc', e13: 'official' };
            const badTags = Object.keys(wantTags).filter((k) => env.h1Tags[k] !== wantTags[k]);
            return badTags.length === 0 ? { pass: true } : { pass: false, why: `Token(s) wrong for: ${badTags.join(', ')}. Samples/infra → IOC match; bulletin → official corroboration; sale of OUR access → targeting evidence; sector-wide story → sector impact.` };
        },
    },
    {
        id: 'OBJ-H2', mode: 'hard', pillar: ['P2'],
        title: 'Empty the clip',
        task: 'In ShareGrid \u2192 Intake, set the exact observation class for all 10 case indicators (domain, ipv4, url, email, hash, tool ×2, cve, behavior). Near-misses are rejected. Extra clipped spans (the subject regex, the credential sample) may stay untyped — only the 10 campaign indicators are graded.',
        anchor: 'Lesson detail: shared platforms need correctly-typed "specific details" to automate correlation.',
        station: 'grid', hints: [
            'Tool names are still plain observable strings → type "tool". The CVE ID gets its own "cve" class.',
            'The two domains are both "domain"; the staging IP is "ipv4"; the harvest page is a full "url".',
            'hps+track2 = domain; 198.51.100.77 = ipv4; /shiptrack/login URL = url; mercer email = email; sha256 = hash; Krateshipper + FleetNode = tool; CVE-2025-44107 = cve; sleep-then-beacon = behavior.',
        ],
        feedback: 'Ten correctly-typed observables are now machine-queryable. A mistyped class silently breaks automation — a "tool" in a domain blocklist is harmless, but a domain in a hash field is an undetectable ghost.',
        check: (env) => {
            const want = {
                'c-hps': 'domain', 'c-track2': 'domain', 'c-ip77': 'ipv4', 'c-url': 'url', 'c-hash': 'hash',
                'c-kit': 'tool', 'c-fleet': 'tool', 'c-mercer': 'email', 'c-cve': 'cve', 'c-geo': 'behavior',
            };
            const wrong = Object.keys(want).filter((k) => env.typing[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Class(es) wrong for: ${wrong.join(', ')}. Exact classes required: plain values = atomic family (domain/ipv4/url/email/tool/cve), algorithm outputs = hash family, multi-step pattern = behavior.` };
        },
    },
    {
        id: 'OBJ-H3', mode: 'hard', pillar: ['P3'],
        title: 'Score the truth',
        task: 'In ShareGrid \u2192 Intake (confidence column): rate all 8 rated indicators high/medium/low, and flag exactly the two likely false-positive values.',
        anchor: 'Chapter canon: confidence levels and false positives — the antidote to indicator fatigue.',
        station: 'grid', hints: [
            'Corroboration count drives confidence: WHOIS + advisory + vendor blog = high; single forum/repo claim = medium. The staging IP is corroborated by the v1 record and the vendor blog.',
            'The shared newsletter CDN and the documentation-range scanner IP are your two false positives.',
            'high: hps domain, staging IP, sha256, staff email. medium: track2, Krateshipper, FleetNode, sleep-then-beacon. FP flags: cdn.mailroute.net + 192.0.2.9.',
        ],
        feedback: 'Confidence scoring is what keeps your blocklist from eating the newsletter CDN. Every indicator you push downstream carries this rating — it is how one analyst\u2019s caution becomes the whole SOC\u2019s precision.',
        check: (env) => {
            const wantC = { 'c-hps': 'high', 'c-ip77': 'high', 'c-hash': 'high', 'c-mercer': 'high', 'c-track2': 'medium', 'c-kit': 'medium', 'c-fleet': 'medium', 'c-geo': 'medium' };
            const wc = Object.keys(wantC).filter((k) => env.confidence[k] !== wantC[k]);
            if (wc.length)
                return { pass: false, why: `Confidence wrong for: ${wc.join(', ')}. Multi-source corroboration = high; single-source technical claims = medium.` };
            if (!setEq(env.fpFlag, ['c-cdn', 'c-scanner']))
                return { pass: false, why: 'FP flags must be exactly the shared newsletter CDN and the documentation-range scanner IP — flagging real indicators or missing these creates fatigue or blindness.' };
            return { pass: true };
        },
    },
    {
        id: 'OBJ-H4', mode: 'hard', pillar: ['P3', 'P1'],
        title: 'Chain the techniques',
        task: 'In ShareGrid \u2192 ATT&CK Board (Hard set): map behaviors b2, b3, b4, b5 to exact technique IDs, then order the four along the attack chain.',
        anchor: 'Lesson detail: platforms expose methods AND their sequence — chain position tells you what comes next.',
        station: 'grid', hints: [
            'The link-based harvest page is T1566.002 — the attachment variant (.001) belongs to v1.',
            'Infrastructure preparation happens before any lure is sent.',
            'b2 T1583.001 → b3 T1566.002 → b4 T1190 → b5 T1071.001, in that order.',
        ],
        feedback: 'A mapped chain is a predictive tool: if you see T1583.001 infrastructure spin up, you know what the next email will look like. That is how intelligence shifts a SOC from reactive to anticipatory.',
        check: (env) => {
            const wantT = { b2: 'T1583.001', b3: 'T1566.002', b4: 'T1190', b5: 'T1071.001' };
            const wt = Object.keys(wantT).filter((k) => env.techMap[k] !== wantT[k]);
            if (wt.length)
                return { pass: false, why: `Mapping wrong for: ${wt.join(', ')}. Remember: .001 = attachment, .002 = link; T1583.001 is infrastructure acquisition; T1071.001 is web-protocol C2.` };
            return seqEq(env.chain, ['b2', 'b3', 'b4', 'b5'])
                ? { pass: true }
                : { pass: false, why: 'Chain order off. Domains are acquired BEFORE the phish; the appliance exploit is a separate initial-access path; beacons come last.' };
        },
    },
    {
        id: 'OBJ-H5', mode: 'hard', pillar: ['P3'],
        title: 'Diff the campaign',
        task: 'In ShareGrid \u2192 Timeline (Hard): select the 4 true v1→v2 changes AND pick the telemetry adjustment each change forces — all four adjustments must be correct.',
        anchor: 'Lesson detail: "track how they evolve" — evolution must translate into monitoring changes.',
        station: 'grid', hints: [
            'True: new lookalike domain, new harvest page, narrowed targeting, appliance exploitation. The rest are unsupported.',
            'Each true change forces a specific defensive adjustment — new infra → registrar/CT watch; new harvest page → proxy/mail-link defense; narrowed targets → role-targeted awareness; appliance exploit → patching.',
            'Cloud audit logs adjust nothing in this campaign.',
        ],
        feedback: 'You converted a campaign diff into four concrete monitoring changes. That last mile — intelligence → tuning — is where most programs stall, and exactly what "staying ahead" means in practice.',
        check: (env) => {
            if (!setEq(env.timeline, ['t1', 't2', 't3', 't4']))
                return { pass: false, why: 'The 4 true changes are not selected exactly. Evidence first: only documented changes count.' };
            const want = { t1: 'registrar', t2: 'proxy', t3: 'awareness', t4: 'patch' };
            const wrong = Object.keys(want).filter((k) => env.evolve[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Adjustment wrong for: ${wrong.join(', ')}. New infra → registrar/CT monitoring; harvest page → proxy/mail-link defense; narrower targeting → targeted awareness; appliance exploit → patching.` };
        },
    },
    {
        id: 'OBJ-H6', mode: 'hard', pillar: ['P4'],
        title: 'Clear the dispatch',
        task: 'In ShareGrid \u2192 Dispatch Desk (TLP), assign the correct TLP 2.0 handling tag to all 5 outgoing artifacts.',
        anchor: 'Chapter canon: sharing platforms operate on trust — TLP rules make that trust enforceable.',
        station: 'grid', hints: [
            'Ask for each: who may ever see this? Everyone → CLEAR. The sector community → GREEN. Named need-to-know → AMBER. Almost nobody → RED.',
            'Raw staff credentials are as strict as it gets.',
            'a1 GREEN, a2 RED, a3 AMBER, a4 CLEAR, a5 AMBER.',
        ],
        feedback: 'One mislabeled artifact can leak staff PII to a foreign feed — or over-restrict a warning that peers needed yesterday. TLP fluency is what makes you a trustworthy node in the sharing network.',
        check: (env) => {
            const want = { a1: 'green', a2: 'red', a3: 'amber', a4: 'clear', a5: 'amber' };
            const wrong = Object.keys(want).filter((k) => env.tlp[k] !== want[k]);
            return wrong.length === 0 ? { pass: true } : { pass: false, why: `Tag(s) wrong for: ${wrong.join(', ')}. Sanitized IOCs → GREEN (community); raw creds → RED; need-to-know summaries/drafts → AMBER; quoting a public advisory → CLEAR.` };
        },
    },
    {
        id: 'OBJ-H7', mode: 'hard', pillar: ['P3'],
        title: 'Tune the tripwire',
        task: 'In ShareGrid \u2192 Tripwire: build the two-clause detection rule (exact operators matter), then mark every log line that is a TRUE positive for Crimson Crate v2.',
        anchor: 'Lesson detail: monitoring active threats = tuned detections over the right data sources.',
        station: 'grid', hints: [
            'Broad "contains shipment" would swallow legitimate parcel mail — use startswith on the exact lure prefix and equals on the exact domain.',
            'Clause 1: dest_domain equals halvard-portal-secure[.]com. Clause 2: email_subject startswith "Shipment #".',
            'True positives: the portal GET, the "Shipment #4471" mail, the track-two DNS query. Newsletter, legit carrier tracking, own-portal scanner and "Parcel update" lines are noise.',
        ],
        feedback: 'Your rule trips on the clone portal and the exact lure prefix while ignoring the newsletter CDN — precision detection with a rationale for every rejected line. That rationale is what you write in the tuning ticket.',
        check: (env) => {
            const r = env.rule;
            const ok1 = r[0]?.field === 'dest_domain' && r[0]?.op === 'equals' && r[0]?.value === 'halvard-portal-secure[.]com';
            const ok2 = r[1]?.field === 'email_subject' && r[1]?.op === 'startswith' && r[1]?.value === 'Shipment #';
            if (!ok1 || !ok2)
                return { pass: false, why: `Rule not precise enough${!ok1 ? ' — clause 1 must be dest_domain EQUALS halvard-portal-secure[.]com (broad matches cause false positives)' : ''}${!ok2 ? ' — clause 2 must be email_subject STARTSWITH "Shipment #" (the documented lure prefix, not any parcel mail)' : ''}.` };
            return setEq(env.logCalls, ['L-A', 'L-C', 'L-G'])
                ? { pass: true }
                : { pass: false, why: 'Log triage wrong. True positives: connection to the clone portal, the exact "Shipment #4471" lure, the second lookalike domain query. Newsletter CDN, legitimate carrier tracking, our own scanner and generic parcel mail are noise.' };
        },
    },
    {
        id: 'OBJ-H8', mode: 'hard', pillar: ['P4'],
        title: 'Sequence the response',
        task: 'On the Case File \u2192 Response Board (Hard), order the six response actions from first to last.',
        anchor: 'Lesson detail: protecting operations — the order of controls matters as much as the controls.',
        station: 'casefile', hints: [
            'Stop ongoing harm first; paperwork comes last; sharing happens only after sanitization.',
            'Contain (block) before patching; hunt before you claim you are clean; enable monitoring; then share; then debrief.',
            'Block → Patch → Retro-hunt → Monitor → Share → Debrief.',
        ],
        feedback: 'Containment precedes remediation because an unblocked attacker keeps moving while you patch. Retro-hunting before claiming success, and sanitizing before sharing — sequence is strategy.',
        check: (env) => (seqEq(env.response, RESPONSE_CORRECT)
            ? { pass: true }
            : { pass: false, why: 'Order is off. Contain first (block what you can see now), patch the exploited appliance, retro-hunt to prove scope, turn monitoring on, THEN sanitize and share, and debrief last.' }),
    },
    {
        id: 'OBJ-H9', mode: 'hard', pillar: ['P1', 'P4'],
        title: 'Brief the board',
        task: 'On the Case File \u2192 Executive Brief (Hard): pick the strategic line the board needs, and the two residual risks worth stating.',
        anchor: 'Lesson detail: intelligence exists to "stay ahead of active threats and protect operations" — leadership decides with it.',
        station: 'casefile', hints: [
            'A board needs posture and trend, not a to-do list and not one campaign update.',
            'Residual risks must be about the protection you have NOT yet completed and the intel quality you depend on.',
            'w2 is the strategic line; the appliance change-window gap and partner-intel quality are your two risks.',
        ],
        feedback: 'You gave leadership trend, posture, and honest residual risk — the strategic altitude of the same case file. That completes the loop: one intelligence product, three audiences, zero spin.',
        check: (env) => {
            if (env.h9Brief !== 'w2')
                return { pass: false, why: 'Wrong brief line. Boards need the standing-trend + posture statement (w2), not an IOC to-do list (w1) or a single campaign update (w3).' };
            return setEq(env.h9Risks, ['k1', 'k2'])
                ? { pass: true }
                : { pass: false, why: 'Risks wrong. Name what is still exposed (appliance patch pending) and the dependency you accept (variable partner intel quality). Training morale, insurance dates and board cadence are not intel-derived risks.' };
        },
    },
];
const objectivesForMode = (mode) => OBJECTIVES.filter((o) => o.mode === mode);
