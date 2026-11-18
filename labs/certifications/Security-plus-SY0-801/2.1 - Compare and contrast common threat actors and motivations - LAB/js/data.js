/* == js/data.js — ALL lab content: suspects, evidence, motivations, glossary, case files,
/* == objectives, acts, quiz bank. Content only — no logic. (Source: single-file lab, carried 1:1.) */
/* ============ THE QUIET WARD — DATA ============ */
const SUSPECTS = [
 {id:'nationstate', slot:'SUSPECT 01', name:'Nation-State Actor', aline:'a.k.a. the quiet professionals',
  desc:'State-sponsored operators: deep pockets, long patience, strategic goals. Quiet, precise, and gone before anyone notices.'},
 {id:'unskilled', slot:'SUSPECT 02', name:'Unskilled Attacker', aline:'a.k.a. script kiddie',
  desc:'Borrowed tools, easy targets, loud mistakes. In it for thrills and bragging rights — the easiest pin on the board.'},
 {id:'hacktivist', slot:'SUSPECT 03', name:'Hacktivist', aline:'a.k.a. the loud conscience',
  desc:'Attack as protest. Wants headlines, not your data: defacements, floods, and a manifesto to go with them.'},
 {id:'insider', slot:'SUSPECT 04', name:'Insider Threat', aline:'a.k.a. the person with the badge',
  desc:'Already inside the walls — access granted, not stolen. Ranges from honest mistakes to deliberate revenge.'},
 {id:'orgcrime', slot:'SUSPECT 05', name:'Organized Crime', aline:'a.k.a. the enterprise',
  desc:'Crime run as a business: industrial ransomware, professional negotiators, leak sites. Follows the money, every time.'},
 {id:'shadowit', slot:'SUSPECT 06', name:'Shadow IT', aline:'a.k.a. the helpful workarounds',
  desc:'Not an intruder at all: your own staff wiring up unsanctioned apps and services. The door opens from within.'}
];
const SNAME = Object.fromEntries(SUSPECTS.map(s=>[s.id, s.name]));

const TABS = [
 {id:'siem', label:'SIEM & Identity'},
 {id:'cloud', label:'Cloud & SaaS'},
 {id:'web', label:'Web & Social'},
 {id:'hr', label:'HR · DLP · Badge'},
 {id:'partner', label:'Partner & Perimeter'}
];

const EVIDENCE = [
 {id:'E1', tab:'siem', src:'VPN / IDENTITY LOG', title:'VPN burst at 02:00', primary:true, pin:'nationstate',
  body:`02:01–03:34 · 214 failed logins
accounts: svc-backup, svc-imaging, svc-fax
source: 198.51.100.77 (AS64512 ORBITAL-TRANSIT,
        no prior history, residential-grade VPS)
03:41 · SUCCESS svc-imaging — MFA exempted
        ("legacy device" profile)
03:44–05:12 · imaging archive enumerated,
        read-only, 11 GB touched, no downloads
— hvrmc-vpn01, simulated SIEM events 4625/4624`},
 {id:'E2', tab:'cloud', src:'CASB DISCOVERY', title:'The helpful workspace', primary:true, pin:'shadowit',
  body:`App: DriftStore (personal tier, UNSANCTIONED)
Owner: marketing-shared@hvrmc.example
4,120 files synced in 3 weeks
212 files flagged with PHI patterns
Not in the asset inventory · no DLP policy
Origin: "new shared workspace" invite link`},
 {id:'E3', tab:'web', src:'PASTE SITE', title:'Bragging rights', primary:true, pin:'unskilled',
  body:`pastezone.example/p/8fj21
"TOTAL PWN of Halcyon Vale Hospital!!
 defaced the careers page, screenshot
 attached. sqlmap default payload worked,
 admin/admin on the CMS lol
 next: the WHOLE network?? (need to
 find the password first)"
handle @ZeroDayZack · stock-skull avatar
account created yesterday`},
 {id:'E4', tab:'web', src:'SOCIAL MEDIA CLAIM', title:'#OpGreyCoat', primary:true, pin:'hacktivist',
  body:`09:12 post: "HVRMC profits from shadow
labs. We gave them six dark hours to
think about it. This is only the
beginning. No patient records touched —
we are not criminals."
Attached: patient-portal downtime graph
09:00–15:00 · volumetric UDP flood ~80 Gbps
No intrusion indicators · no data claimed`},
 {id:'E5', tab:'web', src:'RANSOM NOTE + CHAT', title:'The negotiation', primary:true, pin:'orgcrime',
  body:`README-RESTORE.txt: "Your network is
encrypted. Your data is with us. 14 BTC
in 72h or the patient archive goes
public — your leak-site listing is
already drafted."
Chat: fluent English, ticket numbers,
"our compliance team deletes your data
upon payment" — leak-site template
matches 40+ other victims`},
 {id:'E6', tab:'hr', src:'DLP + HR TICKET', title:'The departing analyst', primary:true, pin:'insider',
  body:`Endpoint FIN-WS-2214 · R. Okafor,
billing analyst, 11 years' service
21:40 · 9,300 billing records staged to
D:\\temp, copied to personal USB CRUZER-6
Context: resignation letter dated 10 Feb
Grievance filed 2 Dec: "passed over, again"
User comment: "they owe me. I built half
those reports."`},
 {id:'E7', tab:'hr', src:'MAIL GATEWAY', title:'Reads on the tablet', primary:true, pin:'insider',
  body:`Auto-forward rule on research mailbox
(Dr. T. Vance, immunology): every mail
with attachment "TRIAL-*" forwarded to
t.vance.personal@mail.example since Nov.
User (interview): "I just wanted to read
drafts on my tablet. Nobody said I
couldn't." No grievance, no notice
period, no unusual access patterns.`},
 {id:'E8', tab:'hr', src:'BADGE LOG', title:'Impossible travel', primary:false, pin:'insider',
  body:`04 Mar · card 4471 (R. Okafor)
07:58 Building A — east entrance
08:02 Data Center — biometric failover,
same card
4 minutes apart, 1.2 km across campus.
Parking lot B: closed for repaving all
week (no vehicle route under 9 min).`},
 {id:'R1', tab:'partner', src:'PERIMETER IDS', title:'The night scan', primary:false, herring:true, pin:'NOISE',
  body:`02:14–03:50 · aggressive scan of VPN
portal from 198.51.100.23
fingerprint: SCANMASTER v4.8 · targets
match last quarter's approved asset list
HELPDESK TICKET GSEC-881: "approved
penetration test — vendor Stonebridge
Security, window 02:00–04:00, PO 77031"`},
 {id:'R2', tab:'partner', src:'DECOY HONEYPOT', title:'Background chatter', primary:false, herring:true, pin:'NOISE',
  body:`decoy-02 (honeypot: no data, no
production adjacency) · 3,412 SSH auth
attempts overnight
usernames: admin, root, oracle, pi —
classic dictionary patterns
Recurring internet background noise,
botnet churn. Decoy untouched since
deployment.`}
];

const MOTIVATIONS = [
 ['Data exfiltration','Quietly copying out valuable data — blueprints, records, client lists.'],
 ['Espionage','Spying for strategic advantage: state secrets, research, M&A intel.'],
 ['Service disruption','Knocking services offline to cause damage or make the news.'],
 ['Blackmail','"Pay, or we publish." Extortion using stolen leverage.'],
 ['Financial gain','Money as the goal: ransomware, fraud, carding, theft.'],
 ['Philosophical / political','Acting on beliefs or a cause — protest, ideology, pressure.'],
 ['Ethical','Acting on conscience: exposing flaws to get them fixed, not to profit.'],
 ['Revenge','Hurt people hurting back: grudges, terminations, passed-over promotions.'],
 ['Disruption / chaos','For the lulz — breaking things because they can.'],
 ['War','Nation-on-nation conflict carried into networks: pre-positioning, sabotage.']
];

const GLOSSARY = [
 ['Threat actor','The person or group behind an attack — the WHO of the incident.'],
 ['Nation-state actor','Sponsored by a government; highest funding and capability; strategic goals like espionage or sabotage.'],
 ['APT','Advanced Persistent Threat — a well-resourced actor (usually nation-state) that stays undetected for a long time.'],
 ['Unskilled attacker','Script kiddie: reuses other people\'s tools against easy targets; loud, clumsy, but still dangerous in volume.'],
 ['Hacktivist','Motivated by philosophical or political beliefs; attacks to make a point publicly.'],
 ['Insider threat','Risk from people with legitimate access — malicious insiders, or unintentional ones (negligent, tricked).'],
 ['Organized crime','Professional criminal enterprises; profit-driven; ransomware-as-a-service, extortion, fraud at scale.'],
 ['Shadow IT','Employees deploying unsanctioned apps/devices/services — no malice, but it creates real exposure.'],
 ['Attribution','Judging who is behind activity, from evidence — always provisional, never certain.'],
 ['Motivation','Why the actor does it: money, beliefs, revenge, chaos, espionage, war.'],
 ['Sophistication / capability','The actor\'s technical skill and tradecraft — from default passwords to custom zero-days.'],
 ['Resources / funding','What the actor can spend — a teenager\'s allowance vs a state budget.'],
 ['TTP','Tactics, Techniques and Procedures — how an actor operates; more stable and reliable for attribution than IOCs.'],
 ['DLP','Data Loss Prevention — endpoint/network controls that spot and block sensitive data leaving (staging, USB copies, uploads).'],
 ['EDR','Endpoint Detection and Response — telemetry and behavioral alerting on laptops and servers; often the first sensor to catch misuse.'],
 ['CASB','Cloud Access Security Broker — sees which SaaS apps staff use and what flows into them; the shadow-IT sensor.'],
 ['UEBA','User and Entity Behavior Analytics — correlates identity, badge and endpoint behavior per person (e.g., impossible travel).'],
 ['PHI','Protected Health Information — patient health or payment data; regulated (e.g., HIPAA), hence ransomware leverage.'],
 ['OPSEC','Operational security — the habits that keep an actor (or a defender) from being observed and identified; its absence leaves fingerprints.'],
 ['Data exfiltration','Moving data out of the environment, often quietly and in small doses to avoid detection.'],
 ['Extortion / blackmail','Monetizing leverage: encrypt, steal, or threaten — then demand payment.']
];

const MITRE_CASES = [
 {g:'G0007', n:'APT28', t:'Nation-state', d:'Long-running espionage group attributed to Russia\'s military intelligence (GRU); spearphishing and credential harvesting against governments and defense.'},
 {g:'G0016', n:'APT29', t:'Nation-state', d:'Cozy Bear — attributed to Russia\'s SVR foreign intelligence; patient espionage against diplomatic and think-tank targets.'},
 {g:'G0032', n:'Lazarus Group', t:'Nation-state (financially driven)', d:'North Korean state-sponsored group that also steals cryptocurrency — proof that a state actor can chase financial gain.'},
 {g:'G0046', n:'FIN7', t:'Organized crime', d:'"Financially-motivated threat group … active since 2013" (MITRE): point-of-sale (POS) malware, then big-game ransomware and its own ransomware-as-a-service (RaaS).'},
 {g:'G1004', n:'LAPSUS$', t:'Organized crime (hacktivist-flavored)', d:'"Cyber criminal threat group … active since at least mid-2021" (MITRE): mass social engineering, extortion, destructive attacks without ransomware.'},
 {g:'G1015', n:'Scattered Spider', t:'Organized crime (social engineering)', d:'English-speaking criminal group: help-desk impersonation and MFA fatigue to hijack identity — people, not exploits, as the attack surface.'},
 {g:'G1027', n:'CyberAv3ngers', t:'Hacktivist-styled, state-aligned', d:'Defacements of industrial devices with loud political branding, yet suspected IRGC affiliation — a hacktivist costume on a nation-state actor.'}
];
/* ============ OBJECTIVES, QUIZ, ACTS ============ */
const OPT_FUND = ['Low','Moderate','High','Varies by person'];
const OPT_SOPH = ['Low','Moderate','High','Varies by person'];
const OPT_ORG = ['Internal','External'];
const MOT_NAMES = MOTIVATIONS.map(m=>m[0]);
const OPT_MOT = MOT_NAMES.concat(['Unintentional (convenience)']);
const OPT_DS = ['VPN & identity logs','CASB / SaaS logs','NetFlow & DDoS telemetry','UEBA & endpoint DLP','Badge access logs'];

const OBJ = {};
function defObj(id, spec){ OBJ[id] = Object.assign({id:id}, spec); }

/* ---------- MEDIUM ---------- */
defObj('M1',{act:'act2',pillar:'P1',anchor:'Actor definitions (all six types)',
 q:'Match each field-note to the suspect it describes.',
 widget:{type:'match',key:'m1match',rows:[
  {t:'State-sponsored professionals with deep resources, long patience, and strategic goals.'},
  {t:'Borrowed tools against easy targets, for thrills and bragging rights — leaving noisy fingerprints.'},
  {t:'Attacks to make a political or social point — publicly, disruptively, with a manifesto.'},
  {t:'Risk from someone already inside the walls — from honest negligence to deliberate sabotage.'},
  {t:'Industrial, profit-driven crime run like a business: ransomware, extortion, fraud at scale.'},
  {t:'Employees wiring up unsanctioned apps and services — no malice, real exposure.'}],
  answer:['nationstate','unskilled','hacktivist','insider','orgcrime','shadowit']},
 fbGood:'Line-up complete. Notice the pattern: motivation and access split the six classes cleanly — strategy, thrills, protest, access, profit, convenience. On the exam, locate those two clues inside any actor description before answering.',
 fbBad:'Each definition hides two clues: where the actor operates from (inside vs outside) and what they want. Cross-check against the suspect cards in this act — the wording mirrors them.',
 hints:['Each note hides two clues: where the actor operates from (inside vs outside) and what they want.',
        'The suspect cards in this act describe each class almost word for word — compare phrasing.',
        'Order: 1 strategy, 2 thrills, 3 protest, 4 access, 5 profit, 6 convenience.']});

defObj('M2',{act:'act2',pillar:'P1',anchor:'Motivations: financial gain, philosophical/political, revenge, espionage, blackmail, war, service disruption, data exfiltration, disruption/chaos',
 q:'Nine wanted posters came in overnight. For each, pick the PRIMARY motivation and the most likely actor.',
 widget:{type:'match2',key:'m2posters',rows:[
  {t:'Locks 3,000 workstations, demands 40 BTC, drafts a leak-site page: "pay or publish."', m:'Financial gain', s:'orgcrime'},
  {t:'Defaces a hospital careers page over lab practices they protest, posts a 900-word manifesto.', m:'Philosophical / political', s:'hacktivist'},
  {t:'An admin copies the HR salary database to a personal drive after being passed over for promotion — twice.', m:'Revenge', s:'insider'},
  {t:'For two quiet years, a unit maps a neighboring ministry\'s satellite uplinks. Nothing broken; everything learned.', m:'Espionage', s:'nationstate'},
  {t:'An email lands on the CEO\'s desk: "Transfer 200k, or your private messages go to the board and the press."', m:'Blackmail', s:'orgcrime'},
  {t:'During an armed conflict, malware is pre-positioned inside a rival state\'s power-grid control network.', m:'War', s:'nationstate'},
  {t:'The transit ticketing site falls over for six hours on marathon day; a collective posts the downtime as a trophy.', m:'Service disruption', s:'hacktivist'},
  {t:'Weeks of quiet share-crawling end with crown-jewel blueprints leaving through an encrypted tunnel.', m:'Data exfiltration', s:'nationstate'},
  {t:'A 16-year-old wipes a fan community\'s servers with a downloaded script — and posts the screenshot for followers.', m:'Disruption / chaos', s:'unskilled'}]},
 fbGood:'Nine for nine. Remember: motive-to-actor is a strong tendency, not a law — Lazarus (G0032) is a state group chasing financial gain, and organized crime happily blackmails. The exam asks you to match the CLASSIC pairing, then spot the exceptions.',
 fbBad:'Some pairings repeat (organized crime appears twice — blackmail is extortion\'s business model). Re-read the motivation shelf in Act I, and remember: war and espionage belong to states; thrills and chaos to the unskilled.',
 hints:['Motive and actor usually rhyme: profit→organized crime, protest→hacktivist, grudge→insider, strategy→nation-state.',
        'Posters 1 and 5 are both organized crime: extortion IS their business model, whether by lock or by leak.',
        'Poster 8 is quiet and patient with state-level targets — espionage-style data exfiltration, not robbery.']});

defObj('M3',{act:'act2',pillar:'P1',anchor:'Attributes: internal/external, resources/funding, sophistication/capability',
 q:'Complete the booking sheets: set origin, funding, and sophistication for three suspects.',
 widget:{type:'dials',key:'m3dials',cards:[
  {sid:'nationstate',fields:[{k:'org',l:'Origin',opts:OPT_ORG,a:'External'},{k:'fund',l:'Funding',opts:OPT_FUND,a:'High'},{k:'soph',l:'Sophistication',opts:OPT_SOPH,a:'High'}]},
  {sid:'unskilled',fields:[{k:'org',l:'Origin',opts:OPT_ORG,a:'External'},{k:'fund',l:'Funding',opts:OPT_FUND,a:'Low'},{k:'soph',l:'Sophistication',opts:OPT_SOPH,a:'Low'}]},
  {sid:'insider',fields:[{k:'org',l:'Origin',opts:OPT_ORG,a:'Internal'},{k:'fund',l:'Funding',opts:OPT_FUND,a:'Varies by person'},{k:'soph',l:'Sophistication',opts:OPT_SOPH,a:'Varies by person'}]}]},
 fbGood:'Booking sheets complete. The insider line is the exam\'s favorite trap: insiders are defined by granted ACCESS, not by skill or budget — both vary person to person. The other two extremes anchor the scale: state actors fund and train; script kiddies borrow and spray.',
 fbBad:'Two anchors: nation-state = external + high + high; unskilled = external + low + low. The insider is internal — and for funding/sophistication, remember the class is defined by access, so the honest answer covers every person.',
 hints:['Two of these cards sit at the extreme ends of the scale in the Act I booking-sheet table.',
        'Origin is about where access comes from, not nationality: the insider holds a badge.',
        'For the insider, skill and money are per-person — the attribute that never varies is internal access.']});

defObj('M4',{act:'act3',pillar:'P2',anchor:'Recognize all six actor types in primary evidence E1–E6',
 q:'Work the bench: pin each of the six primary slips to the suspect it implicates.',
 widget:{type:'pinref',key:'pins',evs:['E1','E2','E3','E4','E5','E6']},
 fbGood:'Board pinned. You just did attribution the way analysts do: tradecraft (E1), artifact (E2), braggadocio (E3), claim (E4), business model (E5), access + grievance (E6). Note how different the six signatures are — that contrast is the whole objective.',
 fbBad:'Distinguishing pairs: E2 (unsanctioned cloud app, no targeting) is shadow IT — an exposure, not an attack; E6 (staged files, grievance, USB) is a person using granted access — an insider. E1\'s patience and MFA-exempt valid accounts point stateward; E3\'s OPSEC failures point to borrowed tools.',
 hints:['Signature first, then pin: patience and precision = state; noise = unskilled; headlines = hacktivist; business model = organized crime.',
        'E2 and E6 look alike (both "data leaving") — but one is an unmanaged app, the other a person with a grudge.',
        'E1→Nation-state, E2→Shadow IT, E3→Unskilled, E4→Hacktivist, E5→Organized crime, E6→Insider.']});

defObj('M5',{act:'act3',pillar:'P2',anchor:'Insider variants: malicious vs unintentional; response per intent',
 q:'Insider split: stamp both insider slips, then choose the single best first response for the unintentional one.',
 widget:{type:'stamp',key:'m5stamp',items:[
  {id:'E6',l:'E6 — the departing analyst',d:'9,300 billing records to personal USB; grievance on file; "they owe me."'},
  {id:'E7',l:'E7 — reads on the tablet',d:'Auto-forward of trial drafts to personal mail; "nobody said I couldn\'t."'}],
  choices:[{v:'Malicious (deliberate)',label:'MALICIOUS'},{v:'Unintentional (negligent)',label:'UNINTENTIONAL',green:true}],
  answer:{E6:'Malicious (deliberate)',E7:'Unintentional (negligent)'}},
 widget2:{type:'radio',key:'m5ctrl',q:'Best first response for E7 (the unintentional one)?',
  opts:[{v:'Terminate immediately',label:'Terminate immediately'},{v:'Security-awareness and data-handling training',label:'Security-awareness & data-handling training (M1017)'},{v:'Ignore — no harm done',label:'Ignore — no harm done'},{v:'Refer to law enforcement',label:'Refer to law enforcement'}],
  answer:'Security-awareness and data-handling training'},
 fbGood:'Intent changes the playbook: malicious insider → IR + HR + legal, preserve evidence, revoke on schedule; negligent insider → train and fix the process (policy, DLP prompt at send time). CompTIA cares about this split constantly — "insider threat" is not a synonym for "bad person."',
 fbBad:'E6 has motive, staging, and exfiltration — deliberate. E7 has convenience and no grievance — negligent, and negligence is fixed with training (M1017) plus a mail-transport rule, not termination.',
 hints:['Look for motive evidence in each slip: grievance and comments vs an innocent explanation.',
        'The first slip stages and copies out deliberately; the second just wanted a bigger screen.',
        'E6 = MALICIOUS, E7 = UNINTENTIONAL → training.']});

defObj('M6',{act:'act3',pillar:'P2',anchor:'Sophistication/capability contrast across E1, E5, E3',
 q:'Read the OPSEC: order the three intrusions from MOST to LEAST capable actor.',
 widget:{type:'order',key:'m6order',items:[
  {id:'E1',txt:'VPN burst → MFA-exempt valid account → 11 GB of imaging archives touched quietly (E1)'},
  {id:'E5',txt:'Professional double-extortion negotiation, leak-site template, 72-hour clock (E5)'},
  {id:'E3',txt:'Default-credentials CMS defacement, bragging on a paste site the same day (E3)'}],
  answer:['E1','E5','E3']},
 fbGood:'Capability read from tradecraft: valid accounts plus an MFA exemption and patient enumeration beats scripted ransomware-as-a-service beats default-credential defacement. On the exam, sophistication is judged from BEHAVIOR, never from claimed skill.',
 fbBad:'Rank by tradecraft, not impact: E1\'s valid-account patience is the most capable signature; E3 confesses on day one with default passwords — the least capable. The professional ransom operation sits between: polished, but a repeatable template, not custom work.',
 hints:['Ask three questions per slip: Did they need skill? Did they hide? Did they improvise anything custom?',
        'The paste-site author literally wrote down the default password. That settles the bottom of the list.',
        'Most→least: E1, E5, E3.']});

defObj('M7',{act:'act4',pillar:'P3',anchor:'Detection data sources per actor behavior',
 q:'Detection desk, part 1: for each scenario, which data source surfaces it FIRST?',
 widget:{type:'match',key:'m7rows',opts:OPT_DS,rows:[
  {t:'An analyst stages 2 GB to a USB stick over lunch.'},
  {t:'The patient portal times out for six hours under a traffic flood.'},
  {t:'214 failed VPN logins against service accounts at 02:00.'},
  {t:'Thousands of files land in an unsanctioned cloud drive.'}],
  answer:['UEBA & endpoint DLP','NetFlow & DDoS telemetry','VPN & identity logs','CASB / SaaS logs']},
 fbGood:'First-signal thinking: match the artifact to the sensor that sees it earliest — host for USB, network edge for floods, identity for login bursts, cloud for unsanctioned apps. Every actor class has a natural "first tripwire"; knowing them is detection design, not luck.',
 fbBad:'Trace the artifact: a USB write happens on the endpoint (UEBA/DLP), a flood is visible in flow data at the edge, a login burst lives in identity logs, and an unsanctioned app is a cloud-visibility (CASB) finding.',
 hints:['The sensor must sit where the artifact is born — host, edge, identity, or cloud.',
        'Scenario 2 is pure volume: only telemetry that counts packets sees it.',
        'USB→UEBA/DLP, flood→NetFlow/DDoS, bursts→VPN/identity, cloud drive→CASB.']});

defObj('M8',{act:'act4',pillar:'P3',anchor:'True vs false positives; tuning with documentation',
 q:'Stamp the overnight alerts: true positive or false positive?',
 widget:{type:'stamp',key:'m8stamp',items:[
  {id:'AL1',l:'AL1 — impossible travel',d:'Badge 4471 in Building A at 07:58, Data Center at 08:02; 1.2 km; parking closed.'},
  {id:'AL2',l:'AL2 — 02:00 VPN scan',d:'Aggressive scan from 198.51.100.23; fingerprint SCANMASTER; ticket GSEC-881 = approved vendor test.'},
  {id:'AL3',l:'AL3 — honeypot spray',d:'3,412 SSH attempts on decoy-02; no data, no production adjacency.'}],
  choices:[{v:'True positive',label:'TRUE POSITIVE'},{v:'False positive',label:'FALSE POSITIVE',green:true}],
  answer:{AL1:'True positive',AL2:'False positive',AL3:'False positive'}},
 fbGood:'Two FPs and one TP — and the FPs matter: AL2 is a documented, approved activity (tune it out, annotate the ticket), AL3 is internet noise hitting a sensor that costs nothing. AL1 stays a TP because physics says the badge lied. Tuning = documented decisions, never silent deletion.',
 fbBad:'Look for exculpatory evidence: a matching change ticket (AL2) and a sensor with no production value (AL3) are FPs. AL1 has no innocent explanation — 1.2 km in four minutes with the lot closed is a TP.',
 hints:['One alert has a paper trail that explains it. Another fires on a box that exists to absorb noise.',
        'FPs are still workflow: annotate and tune, don\'t delete — the tuning note is what protects the next analyst.',
        'AL1 = TRUE, AL2 = FALSE (ticket GSEC-881), AL3 = FALSE (decoy).']});

defObj('M9',{act:'act5',pillar:'P4',anchor:'Control-to-actor mapping',
 q:'Map the controls: which actor class does each control BEST mitigate?',
 widget:{type:'match',key:'m9rows',opts:['nationstate','unskilled','hacktivist','insider','orgcrime','shadowit'],rows:[
  {t:'Inventory and sanction SaaS usage; broker every unsanctioned app.'},
  {t:'DDoS scrubbing service plus CDN rate limiting.'},
  {t:'Role-based data-handling training with offboarding checkpoints.'},
  {t:'Patch the internet-facing VPN appliance within 48h of a critical advisory.'},
  {t:'Remove default credentials; lock down exposed admin panels.'},
  {t:'Immutable off-site backups; segment clinical VLANs from billing.'}],
  answer:['shadowit','hacktivist','insider','nationstate','unskilled','orgcrime']},
 fbGood:'Control-to-actor mapping done. Read it as a threat model: each control removes a specific actor\'s cheapest path. No control covers everyone — that layered map IS "defense in depth," and it is exactly how mitigation questions are built.',
 fbBad:'Ask "whose favorite door does this close?" Sanctioning closes shadow IT\'s door; scrubbing closes the flood; training closes negligence; 48h patching closes the state actor\'s exploit window; removing default creds closes the borrowed-tools crowd; backups plus segmentation take the profit out of ransomware.',
 hints:['Match the control to the attack it makes pointless, then name the actor whose favorite attack that is.',
        'The VPN patch matters because state actors specialize in unpatched edge devices.',
        'Order: shadow IT, hacktivist, insider, nation-state, unskilled, organized crime.']});

defObj('M10',{act:'act5',pillar:'P4',anchor:'Mitigation sequencing: the offboarding window',
 q:'Offboard the risk: order the four actions for the resigning analyst.',
 widget:{type:'order',key:'m10order',items:[
  {id:'o1',txt:'Revoke remote and privileged access the moment resignation is announced'},
  {id:'o2',txt:'Enable endpoint DLP watch and block USB writes on the analyst\'s host'},
  {id:'o3',txt:'HR-led exit interview: recover assets, transfer knowledge'},
  {id:'o4',txt:'Disable the account and archive the mailbox on the last day'}],
  answer:['o1','o2','o3','o4']},
 fbGood:'Sequenced correctly: lock the access before resentment peaks, watch the data while notice runs, recover knowledge while the person still wants to help, and kill the account last. Offboarding is a time-boxed incident window — order is the control.',
 fbBad:'The window runs announcement → last day: access first (before motives harden), monitoring during notice, knowledge recovery in the interview, and account disablement last — an account you still need for the handover should not be killed on day one.',
 hints:['Think in time: what must be true at announcement? At the exit interview? At midnight on the last day?',
        'You cannot interview someone whose account died a week early — disabling is the LAST step.',
        'Revoke → watch → recover knowledge → disable.']});

defObj('M11',{act:'act5',pillar:'P1',anchor:'Attacker value: what each actor wants from THIS organization',
 q:'Know the prize: match each suspect to the HVRMC asset it most wants.',
 widget:{type:'match',key:'m11match',opts:['nationstate','unskilled','hacktivist','insider','orgcrime','shadowit'],rows:[
  {t:'The billing vault: 9,300 patients\' financial records.'},
  {t:'Clinical-trial data wanted by a foreign government sponsor.'},
  {t:'Public trust — uptime and reputation, on the evening news.'},
  {t:'The front page of your website, defaced for followers.'},
  {t:'A resignation letter, a grievance, and an open USB port.'},
  {t:'The unsanctioned cloud drive holding 4,120 synced files.'}],
  answer:['orgcrime','nationstate','hacktivist','unskilled','insider','shadowit']},
 fbGood:'Targeting follows value. "Why organizations are targeted" is objective 2.1 in one sentence: the same hospital is six different prizes to six different actors — money, strategy, headlines, laughs, leverage, convenience. Defenders prioritize by asking which prize their name is on.',
 fbBad:'Match prize to motive: financial records buy ransom leverage (organized crime); trial data serves strategy (nation-state); uptime IS a hacktivist\'s message; a defaceable front page is script-kiddie currency; grievance plus access is the insider\'s prize; the unmanaged drive is shadow IT\'s own footprint.',
 hints:['Each line maps to one motivation: money, espionage, message, notoriety, revenge, convenience.',
        'The state wants the research, not the cash.',
        'Billing→organized crime, trials→nation-state, trust→hacktivist, front page→unskilled, resignation→insider, drive→shadow IT.']});

defObj('M12',{act:'act4',pillar:'P3',anchor:'Detection ordering: earliest tripwire in the ransomware chain',
 q:'Earliest tripwire: which single signal flags the ransomware intrusion (E5) first?',
 widget:{type:'radio',key:'m12radio',opts:[
  {v:'edr',label:'EDR behavioral alert on the phished billing admin\'s host — credential misuse and staging, hours before encryption'},
  {v:'backup',label:'Backup-job integrity gap alert'},
  {v:'egress',label:'Egress spike to a paste-site CDN'},
  {v:'help',label:'Help-desk report of repeated MFA prompts'}],
  answer:'edr'},
 fbGood:'Detections have an order of operations: initial-access behavior (the phished host misusing credentials) fires before encryption artifacts (backup gaps), before extortion artifacts (egress to leak infrastructure). Early signals buy response time — late ones only buy a post-mortem.',
 fbBad:'Walk the attack clock: phishing and staging happen while files are still intact; backup gaps appear when encryption starts; the paste-site spike appears only when extortion begins. The earliest of these is the host behaving badly on day one.',
 hints:['Sort the options by where they sit in the intrusion timeline, not by how loud they are.',
        'Anything that requires files to already be encrypted is late by definition.',
        'The EDR behavioral alert is the only signal that fires BEFORE damage.']});

/* ---------- HARD ---------- */
defObj('H1',{act:'act3',pillar:'P2',anchor:'Full attribution incl. 2 red herrings (R1, R2)',
 q:'Pin the full wall: all ten slips — eight implicate a suspect, two are noise. Commit every pin.',
 widget:{type:'pinref',key:'pins',evs:['E1','E2','E3','E4','E5','E6','E7','E8','R1','R2'],withNoise:true},
 fbGood:'Wall pinned and herrings rejected. R1 fails attribution the moment you check the paper trail (ticket GSEC-881, approved vendor, PO on file) and R2 is noise by design — a sensor with nothing to steal. Rejecting attribution with evidence is the harder half of this skill.',
 fbBad:'Re-examine the two partner slips: R1 has an approved ticket matching the window and targets; R2 fires on a decoy with no data and no adjacency. Neither supports attribution — both belong in the NOISE bin. E7 and E8 both point at a person using granted access (insider).',
 hints:['Two slips have paper trails or architecture that break their own implication.',
        'R1: read ticket GSEC-881 to the end. R2: ask what a honeypot is FOR.',
        'E1→nation-state, E2→shadow IT, E3→unskilled, E4→hacktivist, E5→organized crime, E6/E7/E8→insider, R1/R2→NOISE.']});

defObj('H2',{act:'act3',pillar:'P2',anchor:'Rebutting wrong attribution with evidence (E6, E8)',
 q:'CTI-WIRE-0042 reads: "HVRMC breach attributed to APT28 following scan activity from a foreign network." Tear it down: choose the correct rebuttal, then the two slips that prove it, then justify in one sentence.',
 widget:{type:'radio',key:'h2who',opts:[
  {v:'apt',label:'Stand by it — foreign scan means foreign APT.'},
  {v:'insider',label:'Reject it — the evidence shows an internal actor using VALID, granted credentials.'},
  {v:'crime',label:'Reject it — this is ransomware pre-positioning.'},
  {v:'hack',label:'Reject it — a hacktivist collective claimed the outage.'}],
  answer:'insider'},
 widget2:{type:'multi',key:'h2proof',opts:[
  {v:'E1',label:'E1 — the VPN burst'},{v:'E5',label:'E5 — the ransom note'},{v:'E6',label:'E6 — the departing analyst'},{v:'E8',label:'E8 — impossible travel'}],
  answer:['E6','E8']},
 widget3:{type:'text',key:'h2text',placeholder:'One sentence: why the wire report is wrong…',keywords:['credential','valid','inside','internal','badge','resign','depart','grievance','usb','dlp','hr','access'],min:2},
 fbGood:'Attribution overturned with evidence, not opinion: the scan (R1/E1 noise) is timing coincidence; the access was VALID — a badge impossible to duplicate (E8) and a staging event with motive (E6). Geography is not attribution; credentials are. Reports like CTI-WIRE-0042 are how wrong threat models get funded.',
 fbBad:'The wire conflated three things: a foreign scan (R1 — an approved vendor), an unrelated login burst (E1 — a different incident), and the actual leak. The proof is internal: E6 (motive + staging + USB) and E8 (impossible travel with granted access). Your sentence must cite credentials/badge/inside evidence — geography alone is never proof.',
 hints:['The wire\'s logic is "foreign IP → foreign actor." Find the slip where the access required no intrusion at all.',
        'E8\'s badge cannot be borrowed across campus in four minutes — and it belongs to an employee.',
        'Rebuttal = internal actor with valid credentials; proof = E6 + E8; sentence must mention credentials, badge, or inside access.']});

defObj('H3',{act:'act2',pillar:'P1',anchor:'Full actor dossier: attributes + primary/secondary motivation (organized crime, E5)',
 q:'Build the dossier: complete the full profile for the ransom negotiation suspect (E5) — origin, funding, sophistication, primary and secondary motivation.',
 widget:{type:'dials',key:'h3dials',cards:[
  {sid:'orgcrime',fields:[{k:'org',l:'Origin',opts:OPT_ORG,a:'External'},{k:'fund',l:'Funding',opts:OPT_FUND,a:'High'},{k:'soph',l:'Sophistication',opts:OPT_SOPH,a:'High'},{k:'mot1',l:'Primary motivation',opts:MOT_NAMES,a:'Financial gain'},{k:'mot2',l:'Secondary motivation',opts:MOT_NAMES,a:'Blackmail'}]}]},
 fbGood:'Dossier complete: external, high, high — financial gain with blackmail as the pressure mechanism. That two-motive structure is the double-extortion business model: encryption is leverage, the leak site is leverage, and both monetize the same theft. FIN7 (G0046) is this exact profile at industry scale.',
 fbBad:'The chat shows funding (infrastructure, negotiators, template reuse) and tradecraft (ticketing, SLAs), yet the slip is external — nobody in that negotiation holds a badge. Money is the goal; publishing stolen PHI is the LEVERAGE, which makes blackmail the secondary motivation.',
 hints:['Two fields come straight from the booking-sheet pattern; two need the motivation shelf.',
        'If the goal were only encryption, there would be no leak-site draft. The draft is a threat with a price.',
        'External · High · High · Financial gain · Blackmail.']});

defObj('H4',{act:'act4',pillar:'P3',anchor:'Detection engineering: rule priority + required data sources (insider)',
 q:'Design the insider tripwire: deploy the five alert rules in priority order, then select the two data sources the program cannot live without.',
 widget:{type:'order',key:'h4order',items:[
  {id:'r1',txt:'Impossible-travel & badge-anomaly correlation (UEBA)'},
  {id:'r2',txt:'Mass file staging & USB-write detection (endpoint DLP)'},
  {id:'r3',txt:'Off-hours privilege-escalation alerts (identity analytics)'},
  {id:'r4',txt:'Personal-cloud upload detection (CASB)'},
  {id:'r5',txt:'Auto-forward to personal domains (mail gateway)'}],
  answer:['r1','r2','r3','r4','r5']},
 widget2:{type:'multi',key:'h4multi',opts:[
  {v:'ueba',label:'UEBA & badge records'},{v:'dlp',label:'Endpoint DLP'},{v:'casb',label:'CASB / SaaS logs'},{v:'net',label:'NetFlow'},{v:'av',label:'Antivirus quarantine reports'}],
  answer:['ueba','dlp']},
 fbGood:'Priority follows confidence and earliness: badge physics (r1) and staging (r2) catch the active insider before loss, escalation (r3) catches access expansion, and r4/r5 catch slower leaks. The two load-bearing sources are UEBA/badge and endpoint DLP — without them, E6 and E8 simply never exist as alerts.',
 fbBad:'Ask two questions per rule: how early does it fire, and how confident is it? Badge physics and USB staging fire earliest with the least ambiguity; mail forwarding is real but slow and noisier. And a program that cannot correlate badges (UEBA) or watch the endpoint (DLP) is blind to exactly the evidence E6 and E8 provided.',
 hints:['Rank by (earliest signal) × (fewest false positives) — physics beats heuristics.',
        'The two incidents that actually happened in this case used two specific sensors; a program without them would have seen nothing.',
        'Order: r1→r5. Sources: UEBA/badge + endpoint DLP.']});

defObj('H5',{act:'act5',pillar:'P4',anchor:'Mitigation selection & sequencing under constraints (M1032, M1026, M1030, M1017)',
 q:'Fund the board: the CIO green-lights exactly FOUR initiatives this quarter, in priority order. Constraints: EDR is already deployed; backups are already funded; the confirmed entry vector was phishing; the post-incident review blamed a FLAT network for lateral spread. Sequence your four.',
 widget:{type:'order',key:'h5order',items:[
  {id:'c1',txt:'Phishing-resistant MFA for all remote and privileged access (M1032)'},
  {id:'c2',txt:'Privileged Account Management — least privilege, vaulted credentials (M1026)'},
  {id:'c3',txt:'Segment clinical VLANs from billing and admin networks (M1030)'},
  {id:'c4',txt:'Role-based data-handling training refresh (M1017)'},
  {id:'c5',txt:'Company-wide screensaver posters warning about hackers'},
  {id:'c6',txt:'Deploy a second antivirus engine alongside the existing EDR'}],
  pick:4,
  answer:['c1','c2','c3','c4']},
 fbGood:'Funded in the right order: M1032 kills the confirmed phishing/credential path; M1026 contains any account that still gets phished; M1030 removes the flat-network lateral path the review blamed; M1017 fixes the human layer those three assume will still be attacked. Posters are theater, and a second AV duplicates a control you already run — selection means declining options too.',
 fbBad:'Match each constraint to a control: phishing entry → M1032; "contains a phished account" → M1026; flat network → M1030; human layer → M1017. Posters (c5) change nothing measurable, and EDR already covers c6 — funding either means NOT funding something that works.',
 hints:['Four constraints, four controls — pair them one to one and drop the two unpaired items.',
        '"Already deployed" and "already funded" items are decoys; so is anything with no measurable behavior change.',
        'Order: M1032 → M1026 → M1030 → M1017.']});

defObj('H6',{act:'act5',pillar:'P4',anchor:'Residual risk: nation-state + compensating controls (M1041, M1037)',
 q:'Name the residual risk: after your four funded controls, which actor class remains least mitigated — and which two catalog controls best compensate?',
 widget:{type:'radio',key:'h6who',opts:[
  {v:'nationstate',label:'Nation-state — custom exploit chains, zero-days, and patience outlast prevention budgets'},
  {v:'insider',label:'Insider — no control can watch a person with a badge'},
  {v:'unskilled',label:'Unskilled attacker — volume beats any single control'},
  {v:'hacktivist',label:'Hacktivist — motives cannot be patched'}],
  answer:'nationstate'},
 widget2:{type:'multi',key:'h6multi',opts:[
  {v:'enc',label:'Encrypt sensitive data at rest and in transit (M1041)'},
  {v:'egress',label:'Filter network traffic — egress allow-listing (M1037)'},
  {v:'av',label:'Update antivirus signatures weekly (M1049)'},
  {v:'pwd',label:'Longer passwords changed once a year (M1027)'}],
  answer:['enc','egress']},
 fbGood:'Honest threat modeling: against a nation-state, prevention WILL fail eventually — zero-days bypass MFA-era controls and patience defeats quarterly budgets. Compensation shifts the goal to making theft worthless and visible: M1041 means stolen ciphertext is inert, M1037 means exfiltration has to cross a choke point you monitor.',
 fbBad:'The funded controls all target credential theft and lateral movement — a state actor simply brings a zero-day and patience, so "nation-state" is the residual risk. Among the catalog, M1041 and M1037 change what theft is worth; weekly signature updates (M1049) and annual passwords (M1027) do not touch a custom exploit.',
 hints:['Which actor\'s toolkit makes your four funded controls irrelevant rather than merely inconvenient?',
        'Zero-days defeat prevention; compensation must limit VALUE and VISIBILITY of what they steal.',
        'Nation-state; M1041 + M1037.']});

defObj('H7',{act:'act2',pillar:'P2',anchor:'Capability ladder across four artifacts (E3, E4, E5, E1)',
 q:'Capability ladder: order the four artifacts from LEAST to MOST capable actor.',
 widget:{type:'order',key:'h7order',items:[
  {id:'X3',txt:'Paste-site defacement brag, default credentials, same-day confession (E3)'},
  {id:'X4',txt:'80 Gbps UDP flood with claim post — loud, rented, no intrusion (E4)'},
  {id:'X5',txt:'Double-extortion negotiation, leak-site template, ticketing discipline (E5)'},
  {id:'X1',txt:'MFA-exempt valid-account operation, 11 GB enumerated quietly (E1)'}],
  answer:['X3','X4','X5','X1']},
 fbGood:'The ladder: E3 confesses with borrowed tools; E4 rents volume — money substitutes for skill, but zero stealth; E5 runs a professional operation with repeatable infrastructure; E1 shows custom tradecraft, patience, and quiet. Note the teaching point: impact ordering and capability ordering are NOT the same — the flood was the loudest and among the least capable.',
 fbBad:'Capability is tradecraft under your forensics: E3 leaves the password in the post (least), E4 rents power but hides nothing, E5 is polished but templated, E1 shows live-person persistence and quiet movement (most). Loudness is not skill.',
 hints:['Separate skill from impact: the flood was huge but required nobody to get inside.',
        'Look for who had to improvise versus who followed a script versus who wrote their own.',
        'Least→most: X3, X4, X5, X1.']});

defObj('H8',{act:'act4',pillar:'P3',anchor:'Incident response under a hacktivist DDoS (E4): action set + tuning discipline',
 q:'09:00: the flood from E4 begins. Select the EXACT correct action set — four of the six options.',
 widget:{type:'multi',key:'h8multi',opts:[
  {v:'scrub',label:'Turn on scrubbing / CDN rate limiting; lean on anycast capacity'},
  {v:'comms',label:'Publish a status page with pre-drafted patient and press communications'},
  {v:'forensics',label:'Preserve flow and firewall logs for law-enforcement referral'},
  {v:'internal',label:'Move patient-care workflows to internal channels until the flood subsides'},
  {v:'pay',label:'Pay the "protection fee" posted in the claim thread'},
  {v:'shut',label:'Shut the public portal down indefinitely until the attackers get bored'}],
  answer:['scrub','comms','forensics','internal']},
 fbGood:'Four right calls: absorb (scrubbing), communicate (status page — silence is the hacktivist\'s win condition), preserve (evidence for referral), and protect care delivery (internal channels). The two rejects teach the economics: paying a hacktivist funds nothing but the next flood, and an indefinite shutdown delivers their objective — service disruption — for free.',
 fbBad:'Two options fail on economics: a hacktivist has no monetization to halt — paying achieves nothing; and an indefinite shutdown completes their stated goal (service disruption) on your own initiative. The correct set is scrubbing, communications, evidence preservation, and internal continuity for care.',
 hints:['Ask of each option: does it absorb the flood, protect patients, preserve evidence, or keep the org\'s voice?',
        'One option hands the attacker exactly what they demanded; another does it for them.',
        'Correct: scrub, comms, preserve logs, internal channels. Reject: pay, indefinite shutdown.']});

defObj('H9',{act:'act5',pillar:'P1',anchor:'Capstone compare/contrast matrix: motivation + origin for all six suspects',
 q:'Final verdict matrix: for each suspect in THIS case, set the evidenced motivation and origin. This is the compare-and-contrast exam objective, materialized.',
 widget:{type:'dials',key:'h9dials',cards:[
  {sid:'nationstate',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Espionage'},{k:'org',l:'Origin',opts:OPT_ORG,a:'External'}]},
  {sid:'unskilled',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Disruption / chaos'},{k:'org',l:'Origin',opts:OPT_ORG,a:'External'}]},
  {sid:'hacktivist',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Philosophical / political'},{k:'org',l:'Origin',opts:OPT_ORG,a:'External'}]},
  {sid:'insider',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Revenge'},{k:'org',l:'Origin',opts:OPT_ORG,a:'Internal'}]},
  {sid:'orgcrime',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Financial gain'},{k:'org',l:'Origin',opts:OPT_ORG,a:'External'}]},
  {sid:'shadowit',fields:[{k:'mot',l:'Motivation',opts:OPT_MOT,a:'Unintentional (convenience)'},{k:'org',l:'Origin',opts:OPT_ORG,a:'Internal'}]}]},
 fbGood:'Matrix closed — six suspects, two axes, one glance at the whole objective: the three EXTERNAL actors split by motive (strategy, chaos, money), the two INTERNAL ones by intent (revenge vs convenience), and the exam\'s compare/contrast item is now muscle memory. Note the honest wrinkles: Lazarus is a state group chasing money, and insiders range from E6\'s revenge to E7\'s convenience.',
 fbBad:'Two anchors resolve most rows: the three outside actors are External with motive = what they took (data→espionage, uptime→political, money→financial gain); the two inside actors are Internal, split by intent — the USB had a grievance, the auto-forward had a tablet. For shadow IT the honest motivation is "unintentional."',
 hints:['Sort the six into external (three) and internal (two-plus) first — origin is the easy half.',
        'Motivation follows the evidence: quiet archive reading, loud flood, ransom clock, grievance note, invite link.',
        'E: Espionage, Disruption/chaos, Philosophical/political · I: Revenge, Financial gain, Unintentional (convenience).']});

/* ---------- QUIZ ---------- */
const QUIZ_M = [
 {q:'Which attribute sets an insider threat apart from every other actor on the board?', topic:'Insider attributes',
  opts:['Technical skill on par with state teams','Access granted by the organization, never stolen','Funding tied to a state-level budget','Ransomware use for financial gain'],a:1,
  exp:'Access is the defining attribute: insiders hold authorized, internal access. Skill and funding vary person to person — which is exactly why the other three fail: none of them separates the insider from a well-funded, capable outsider.'},
 {q:'A group defaces a ministry website during an election and posts a manifesto. Primary motivation?', topic:'Hacktivist motivation',
  opts:['Financial gain from the operation','Espionage against the ministry','Philosophical or political beliefs','Blackmail of ministry officials'],a:2,
  exp:'Public defacement plus a manifesto is messaging — the hacktivist signature. Espionage avoids being noticed, blackmail would demand something, and nothing here is monetized, so financial gain fits no evidence in the scenario.'},
 {q:'Which pattern most suggests an unskilled attacker?', topic:'Unskilled attacker signatures',
  opts:['Cleaned logs and valid service accounts','A zero-day in an edge appliance','Slow staging of files over months','Public tool, default password, same-day brag'],a:3,
  exp:'Borrowed tooling, default credentials, and immediate bragging are the unskilled signature — noise is the fingerprint. Cleaned logs and zero-days require real capability, and slow patient staging reads as an insider or espionage, not thrills.'},
 {q:'Shadow IT is best described as…', topic:'Shadow IT',
  opts:['Staff adopting unsanctioned apps without malice','Criminal outsourcing of attack tooling','Contractors planting malware for pay','State spies inside the supply chain'],a:0,
  exp:'No malice, real exposure: convenience drives it, which is why sanctioning and governance — not punishment — is the primary fix. The other options all describe deliberate malicious actors, which shadow IT is not.'},
 {q:'Nation-state vs organized crime — the sharpest contrast?', topic:'Nation-state vs organized crime',
  opts:['Criminal groups avoid stealing data','Strategy-driven states vs profit-driven crime','Crime groups hold larger budgets','States always deploy zero-day exploits'],a:1,
  exp:'Purpose and purse: states pursue strategy with budgets; criminal enterprises pursue margin. Lazarus (G0032) shows the line blurs — a state actor chasing financial gain — and absolutes like "always" are exam traps.'},
 {q:'In the objective\'s motivation list, an "Ethical" motivation means…', topic:'Ethical motivation',
  opts:['Encrypting stolen data as a courtesy','Scanning that the compliance team approved','Working under a paid bug-bounty contract','Acting on conscience to expose flaws'],a:3,
  exp:'Ethical motivation sits under philosophical/political: the actor\'s goal is fixing or exposing, not profit. Contracted, approved testing is authorized work — a different thing entirely — and nothing about courtesy encryption is a motivation.'}
];
const QUIZ_H = [
 {q:'Triage E1 as a whole: valid service-account login after 214 failures, an MFA exemption, 11 GB enumerated, logs intact. Who, and why?', topic:'Attribution: nation-state tradecraft',
  opts:['Script kiddie — automated tooling noise','Organized crime — ransomware pre-staging','Nation-state — quiet, valid-account espionage','Hacktivist — foreign-IP protest action'],a:2,
  exp:'No noise, no claim, no ransom: selective read-only access via valid accounts with a legacy-profile exemption is patient, strategic collection — the espionage signature. Automated noise would keep failing, and extortion or protest would announce itself.'},
 {q:'E5\'s chat: fluent negotiator, ticket numbers, leak-site SLA, treasury wallet. Actor + motivation pair?', topic:'Attribution: organized crime',
  opts:['Nation-state — espionage with political pressure','Organized crime — profit plus blackmail','Hacktivist — fundraising for a cause','Insider — an admin monetizing access'],a:1,
  exp:'Professional infrastructure plus monetization (ransom plus leak-site threat) is the criminal-enterprise model: financial gain primary, blackmail as the pressure mechanism. Espionage stays quiet, no cause is claimed, and the operation is clearly external.'},
 {q:'Your CFO gets an urgent help-desk password reset after a voice-cloned call. Which actor class and control pair stops the next one?', topic:'Social engineering defenses',
  opts:['Nation-state espionage; deploy additional firewalls','Hacktivist protest; publish a public rebuttal','Shadow IT; restrict help-desk permissions','Criminal social engineering; callbacks plus MFA'],a:3,
  exp:'Identity hijacking for profit is criminal social engineering (Scattered Spider, G1015, is the reference case). Firewalls, rebuttals and permission trims do not touch a voice clone — out-of-band callbacks and phishing-resistant MFA (M1032) attack exactly that path.'},
 {q:'A resignation is announced. Which data source catches file staging earliest?', topic:'Insider detection sources',
  opts:['Endpoint DLP staging and USB-write rules','Quarterly reviews of user access rights','Annual awareness surveys for all staff','Month-end reports from backup jobs'],a:0,
  exp:'Staging happens on the endpoint, on day one — only host telemetry sees it in time. Reviews and surveys are periodic by design, and backups only report once damage exists.'},
 {q:'Alert: 5,000 failed SSH attempts on a honeypot with no data and no production adjacency. Correct disposition?', topic:'False positives & tuning',
  opts:['True positive — isolate the VPN concentrator now','True positive — engage scrubbing immediately','False positive — document, tune the rule, keep listening','False positive — delete the alert, silence the source'],a:2,
  exp:'Noise on a sensor built to absorb noise is an FP — but FPs get documented and tuned, never deleted: the annotation protects the next analyst, and the decoy keeps earning intelligence. Isolation and scrubbing respond to a threat that does not exist here.'},
 {q:'Ransomware season starts Monday; you may fund ONE initiative. Which, and why?', topic:'Resilience: backups (M1053)',
  opts:['Tested, immutable, off-site backups','A laminated anti-phishing poster push','A ninety-minute all-staff webinar','Renaming every internal file share'],a:0,
  exp:'Resilience beats deterrence: verified restores convert ransomware from catastrophe to inconvenience (M1053). Posters, webinars and share renames have no measurable effect on any actor class — that is why they lose the budget.'},
 {q:'Which actor class remains hardest to fully mitigate even with MFA, training, and backups — and what is the honest strategy?', topic:'Residual risk: nation-state',
  opts:['Unskilled attacker — volume alone defeats them','Nation-state — assume breach; encrypt, filter, hunt','Hacktivist — motives cannot be patched away','Insider — badges cannot simply be revoked'],a:1,
  exp:'Custom exploits and institutional patience outlast point controls. Against states you minimize VALUE (M1041) and VISIBILITY (M1037) of theft, and hunt for the quiet — the lab\'s residual-risk answer.'}
];

/* ---------- ACTS ---------- */
const ACTS_MED = [
 {id:'act1',no:'ACT I',title:'The Briefing',kind:'brief'},
 {id:'act2',no:'ACT II',title:'The Suspect Line',kind:'suspects',objs:['M1','M2','M3']},
 {id:'act3',no:'ACT III',title:'The Evidence Bench',kind:'evidence',objs:['M4','M5','M6']},
 {id:'act4',no:'ACT IV',title:'The Detection Desk',kind:'detect',objs:['M7','M8','M12']},
 {id:'act5',no:'ACT V',title:'The Hardening Board',kind:'harden',objs:['M9','M10','M11']},
 {id:'act6',no:'ACT VI',title:'Cross-Examination',kind:'quiz'},
 {id:'act7',no:'ACT VII',title:'Case Closed',kind:'debrief'}
];
const ACTS_HARD = [
 {id:'act1',no:'ACT I',title:'The Briefing',kind:'brief'},
 {id:'act2',no:'ACT II',title:'The Suspect Line',kind:'suspects',objs:['H3','H7']},
 {id:'act3',no:'ACT III',title:'The Evidence Bench',kind:'evidence',objs:['H1','H2']},
 {id:'act4',no:'ACT IV',title:'The Detection Desk',kind:'detect',objs:['H4','H8']},
 {id:'act5',no:'ACT V',title:'The Hardening Board',kind:'harden',objs:['H5','H6','H9']},
 {id:'act6',no:'ACT VI',title:'Cross-Examination',kind:'quiz'},
 {id:'act7',no:'ACT VII',title:'Case Closed',kind:'debrief'}
];
const ACT_INTRO = {
 suspects:'Six suspects were booked at intake. Read each card, then work the objectives beneath — profiles, posters, and booking sheets.',
 evidence:'Every slip below is synthetic training data pulled from the simulated HVRMC estate. Pin each to a suspect — or, on the night shift, to NOISE.',
 detect:'The desk where alerts become decisions: first-signal sources, true versus false positives, and the order of operations in a detection program.',
 harden:'Controls cost money and attention. Map them to the actors they stop, sequence them against the calendar, and name what you did not buy.',
 quiz:'Counsel is ready. Answer each question — the explanation follows your choice, wrong or right.',
 debrief:'Field notes for the next shift: what to watch, what to buy, what to remember. The case closes when you say so.'
};
const HARD_NUDGES_USED_MAX = 1;
/* [port] knowledge-core booking-sheet copy (view content, moved from ENGINE B for data/logic separation) */
const KNOW_PROFILES=[
 {id:'nationstate',mot:'Espionage · War · Disruption',attr:'External · High funding · High sophistication'},
 {id:'unskilled',mot:'Disruption / chaos · Notoriety',attr:'External · Low funding · Low sophistication'},
 {id:'hacktivist',mot:'Philosophical / political · Service disruption',attr:'External · Moderate funding · Low–High sophistication'},
 {id:'insider',mot:'Revenge · Financial gain · (or none — negligence)',attr:'Internal · Funding varies · Skill varies — defined by ACCESS'},
 {id:'orgcrime',mot:'Financial gain · Blackmail',attr:'External · High funding · High sophistication'},
 {id:'shadowit',mot:'Unintentional exposure (convenience)',attr:'Internal · No "funding" · No tradecraft — a process failure'}
];
/* [port] debrief content tables: detection rows + MITRE mitigation recommendations (moved from ENGINE B) */
const DETECT_ROWS=[
 ['Badge & UEBA correlation','Two badge events, distance ÷ time below walking speed (E8)','Impossible travel on privileged or notice-period staff'],
 ['Endpoint DLP / UEBA','&gt;1,000 files staged or USB write by staff with an HR change event (E6)','Mass staging during notice periods'],
 ['CASB / SaaS logs','Upload to unsanctioned app AND pii/PHI detector match (E2)','Any PHI pattern leaving for an unknown tenant'],
 ['VPN & identity logs','&gt;100 failures / 15 min on service accounts, then success (E1)','Success after a burst — especially with MFA exemptions'],
 ['Mail gateway','New forward rule to a non-corporate domain (E7)','Any auto-forward created on executive or research mailboxes'],
 ['NetFlow / CDN telemetry','Volumetric flood on public VIPs (E4)','Sustained &gt;5× baseline inbound to one service']
];
const MIT_RECS=[
 ['M1032','Multi-factor Authentication','Phishing-resistant MFA on every remote and privileged path — kills the credential-replay playbook of E1 and the phished-host path of E5.'],
 ['M1026','Privileged Account Management','Vaulted, least-privilege service accounts — no more "legacy device" MFA exemptions on svc-* accounts.'],
 ['M1030','Network Segmentation','Clinical VLANs separate from billing — the flat network is what turned one phished host into enterprise-wide encryption.'],
 ['M1017','User Training','Role-based data handling — converts negligent insiders (E7) and phished staff into sensors instead of victims.'],
 ['M1018','User Account Management','Offboarding runbook: revoke at announcement, disable at exit — closes the resignation window E6 exploited.'],
 ['M1053','Data Backup','Immutable, tested, off-site restores — takes the profit out of the E5 business model.'],
 ['M1037','Filter Network Traffic','Egress allow-listing — paste-site and personal-cloud exfiltration must cross a monitored choke point.'],
 ['M1041','Encrypt Sensitive Information','Encryption at rest on PHI and trial data — stolen ciphertext is worthless without the key.'],
 ['M1016','Vulnerability Scanning','Continuous scanning of internet-facing assets — removes the default-credential surface E3 stumbles into.'],
 ['M1051','Update Software','48-hour SLA on critical edge appliances — closes the window nation-state actors specialize in.']
];
