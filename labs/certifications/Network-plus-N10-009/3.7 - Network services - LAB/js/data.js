// ===================================================================
// Building B — Service Riser · lab content (js/data.js)
// -------------------------------------------------------------------
// ALL lab content lives here, separated from logic: objectives, quiz
// bank, glossary, evidence tables, briefing, handover notes.
// Content is carried over 1:1 from the original framework lab
// (src/lib/lab/content.ts + module-level constants). Do not reword.
// ===================================================================
(function () {
  'use strict'

  // ---------------- meta ----------------
  const PILLAR_META = {
    understand: { label: 'Understand', letter: 'U' },
    recognize: { label: 'Recognize', letter: 'R' },
    detect: { label: 'Detect', letter: 'D' },
    mitigate: { label: 'Mitigate', letter: 'M' },
  }

  const CIRCUITS = [
    { id: 'pinboard', code: '00', name: 'Pinboard', hue: '#8A6A2F', dark: '#4a3c22', blurb: 'Scenario briefing & how this riser works', section: 'ops' },
    { id: 'dhcp', code: '01', name: 'DHCP', hue: '#B0563A', dark: '#4a2f24', blurb: 'Address leases — DORA, scopes, snooping', section: 'services' },
    { id: 'slaac', code: '02', name: 'SLAAC', hue: '#1F6F64', dark: '#1f3f3a', blurb: 'IPv6 self-addressing — RA flags, EUI-64', section: 'services' },
    { id: 'dns', code: '03', name: 'DNS', hue: '#7D4A63', dark: '#3d2a33', blurb: 'Name resolution — records, walk, hardening', section: 'services' },
    { id: 'ntp', code: '04', name: 'NTP', hue: '#B4832A', dark: '#4d3a1c', blurb: 'Wall-clock time — strata, offsets', section: 'services' },
    { id: 'ptp', code: '05', name: 'PTP', hue: '#5F6B37', dark: '#2e331d', blurb: 'Precision time — IEEE 1588 clock roles', section: 'services' },
    { id: 'nts', code: '06', name: 'NTS', hue: '#2F5D3A', dark: '#1e3324', blurb: 'Secured time — NTS-KE, cookies, AEAD', section: 'services' },
    { id: 'nightdesk', code: '07', name: 'Night desk', hue: '#5C5470', dark: '#332f3d', blurb: 'Overnight alerts & SOC triage', section: 'review' },
    { id: 'inspector', code: '08', name: 'Inspector', hue: '#8A4B2F', dark: '#452a1e', blurb: 'Knowledge check before sign-off', section: 'review' },
    { id: 'handover', code: '09', name: 'Handover', hue: '#6B6B45', dark: '#36361f', blurb: 'Field notes & detection playbook', section: 'review' },
  ]

  function circuitOf(id) {
    for (let i = 0; i < CIRCUITS.length; i++) if (CIRCUITS[i].id === id) return CIRCUITS[i]
    return CIRCUITS[0]
  }

  // ---------------- knowledge core (C2) ----------------
  const SERVICE_NOTES = {
    dhcp: {
      what: 'DHCP hands devices an IPv4 address plus options (router, DNS servers, domain name) for a limited lease time, from a scope the admin defines.',
      how: 'A broadcast DORA exchange (Discover → Offer → Request → Acknowledge) over UDP 67 (server) / 68 (client). A relay agent (IP helper) turns client broadcasts into unicast toward a server on another subnet.',
      why: 'Attackers plant rogue DHCP servers to issue hostile gateways/DNS — a classic on-path (AiTM) setup. Defenders answer with DHCP snooping and trusted ports.',
      variants: ['Scopes & superscopes', 'Reservations (fixed IP per MAC)', 'Exclusions (never hand out)', 'Relay / IP helper', 'APIPA 169.254.0.0/16 fallback', 'Legacy options 66/67 for PXE boot'],
    },
    slaac: {
      what: 'SLAAC lets IPv6 hosts build their own addresses from the prefix advertised by the router — no server required for the address itself.',
      how: 'The router multicasts ICMPv6 Router Advertisements (type 134). Its M flag says "use stateful DHCPv6 for addresses", O flag says "use stateless DHCPv6 for options only". Hosts form an EUI-64 interface ID (insert FF:FE into the MAC, flip the U/L bit) and keep a fe80::/10 link-local address; DAD checks for collisions.',
      why: 'A rogue or spoofed RA can hand a whole LAN a hostile prefix/router. RA Guard on switches is the standard counter (adjacent to this lesson, noted as simplified).',
      variants: ['M/O flag combinations', 'EUI-64 vs random stable IDs', 'Temporary/privacy addresses vs stable, allowlist-friendly ones', 'Stateful & stateless DHCPv6 (UDP 546/547)'],
    },
    dns: {
      what: 'DNS maps names to addresses (and back). Clients ask a recursive resolver; the resolver walks root → TLD → authoritative with iterative queries and caches answers until their TTL expires.',
      how: 'Record types carry the data: A (IPv4), AAAA (IPv6), CNAME (alias — never legal at a zone apex), MX (+priority, mail), TXT (SPF and friends), PTR (reverse, in-addr.arpa), plus NS/SOA/SRV/CAA.',
      why: 'Cache poisoning, rogue resolvers, and tampered replies redirect users invisibly. DNSSEC signs answers; DoT (853) and DoH (443) encrypt them on the wire.',
      variants: ['Recursive vs iterative', 'Forward vs reverse zones', 'Caching & TTL/propagation', 'DNSSEC chain of trust', 'DoT/DoH', 'Split DNS (internal/external views)'],
    },
    ntp: {
      what: 'NTP keeps every device wall-clock synchronized (millisecond class) — the glue for log correlation, authentication and certificates. UDP 123.',
      how: 'Clients poll servers in a stratum hierarchy: a reference clock is stratum 0, the appliance attached to it is stratum 1, and each sync hop adds one; stratum 16 means unsynchronized. Offset/drift readings show how far a clock sits from its source.',
      why: 'Plain NTP responses are unauthenticated — a spoofed reply shifts time, corrupting logs and breaking certificate validation. Legacy mode 6/7 queries could also be abused for amplification (simplified).',
      variants: ['Client/server mode', 'Public pools vs internal sources', 'Stratum math', 'Offset & drift', 'Source redundancy'],
    },
    ptp: {
      what: 'PTP (IEEE 1588) synchronizes clocks to sub-microsecond accuracy for finance, industrial control, broadcast and radio logging — where NTP’s milliseconds are not enough.',
      how: 'A grandmaster sources time (e.g., GNSS). Switches participate: boundary clocks terminate and regenerate sync downstream; transparent clocks correct their own forwarding delay. Hardware timestamping in NICs/switches is what makes sub-µs possible.',
      why: 'Ledger and audit timestamps must be defensible. PTP needs capable hardware and design — it is a trade-off, not a free upgrade from NTP.',
      variants: ['Grandmaster / ordinary / boundary / transparent roles', 'Hardware timestamping', 'Profiles (gPTP, power, telecom) — noted, not exam depth'],
    },
    nts: {
      what: 'NTS (Network Time Security, RFC 8915) adds cryptographic authentication to client/server NTP: the server proves its identity, and packets cannot be modified or replayed.',
      how: 'First NTS-KE: a TLS session on TCP 4460 authenticates the server and fills the client’s cookie jar. Then time flows as NTPv4 over UDP 123 carrying NTS extension fields (AEAD); the client presents cookies, so the server keeps no per-client state.',
      why: 'After a spoofed-time incident, NTS is the fix: it defeats spoofed responses and replays. It does NOT encrypt the time itself — authenticity, not confidentiality.',
      variants: ['NTS-KE (TCP 4460)', 'Cookie jar (stateless servers)', 'AEAD extension fields', 'Non-amplification by design'],
    },
  }

  // ---------------- objectives — MEDIUM (12) / HARD (9) ----------------
  const OBJECTIVES = [
    // MEDIUM
    {
      id: 'OBJ-M1', mode: 'medium', pillar: 'understand', circuit: 'dhcp', bench: 'Handshake bench',
      title: 'Sequence the DHCP lease exchange (DORA) and set the correct ports.',
      context: 'Every DHCP lease starts the same way. Order the four messages, then pick the ports each side listens on.',
      hints: [
        'Say the letters out loud: D-O-R-A. The client asks first; the server answers.',
        'Discover → Offer → Request → Acknowledge. Ports: one number for the server process, one for the client process, both UDP.',
        'Order: Discover, Offer, Request, Acknowledge. Server listens on UDP 67, client on UDP 68.',
      ],
      success: 'DORA locked in. Note the flow is broadcast-based at first; a relay agent (IP helper) converts those broadcasts to unicast toward the server’s subnet — that’s why relays matter in multi-VLAN buildings like this one.',
      failure: 'Not quite. Remember the client speaks first (Discover), the server replies (Offer), the client formalizes its choice (Request), and only then does the server commit the lease (Acknowledge). Ports are UDP: 67 = server, 68 = client.',
    },
    {
      id: 'OBJ-M2', mode: 'medium', pillar: 'understand', circuit: 'dhcp', bench: 'Service map',
      title: 'Sort all six 3.7 services into their role bins.',
      context: 'Before configuring anything, make the map: which services assign addresses, which resolve names, which distribute time?',
      hints: [
        'Two services give you an address, one gives you names, three are about time.',
        'Address assignment: DHCP + SLAAC. Name resolution: DNS. Time: NTP, PTP, NTS.',
        'Bins — Address: DHCP, SLAAC · Names: DNS · Time: NTP, PTP, NTS.',
      ],
      success: 'Map complete. DHCP and SLAAC are the two addressing services (server-assisted vs self-assignment), DNS is the directory, and NTP/PTP/NTS form the time stack: general, precision, and secured.',
      failure: 'One or more chips are in the wrong bin. Ask: does this service give me an address (DHCP/SLAAC), a name (DNS), or a clock (NTP/PTP/NTS)?',
    },
    {
      id: 'OBJ-M3', mode: 'medium', pillar: 'recognize', circuit: 'dns', bench: 'Record triage',
      title: 'Pick the correct DNS record type for each of the four tasks.',
      context: 'The civic website meridian.gov needs four things: mail routing, a www alias, an IPv6 host entry, and a reverse entry.',
      hints: [
        'Mail → one record type with a priority number. Alias → a pointer to another name. IPv6 → the AAAA family. Reverse → PTR.',
        'MX routes mail, CNAME aliases, AAAA carries IPv6, PTR answers “which name owns this IP?”.',
        'Answers: mail → MX · www alias → CNAME · IPv6 host → AAAA · reverse → PTR.',
      ],
      success: 'Four for four. PTR records live in reverse zones (in-addr.arpa) — so “a PTR for 203.0.113.44” really means a record in zone 113.0.203.in-addr.arpa. MX carries a priority so backups can be ordered.',
      failure: 'A record type is off. Anchors: MX = mail (+priority) · CNAME = alias (never at the apex!) · AAAA = IPv6 · A = IPv4 · TXT = SPF/notes · PTR = reverse lookup.',
    },
    {
      id: 'OBJ-M4', mode: 'medium', pillar: 'recognize', circuit: 'nightdesk', bench: 'Symptom matcher',
      title: 'Match each symptom to the service that failed.',
      context: 'Three helpdesk tickets came in. Each symptom is a fingerprint of one service in this lesson.',
      hints: [
        'Ticket 1 smells like an address problem, ticket 2 like a name problem, ticket 3 like a clock problem.',
        'Self-assigned 169.254.x.x = DHCP silent. IP works / name fails = DNS. Timestamps disagree = NTP.',
        'Answers: ticket 1 → DHCP (APIPA) · ticket 2 → DNS · ticket 3 → NTP.',
      ],
      success: 'Clean diagnoses. APIPA (169.254.0.0/16) is the giveaway for “no DHCP server answered”; name-vs-IP behaviour isolates DNS; cross-server timestamp gaps point at NTP. These three fingerprints cover most 3.7 troubleshooting questions.',
      failure: 'Re-read each ticket for its fingerprint: an address that starts 169.254 is APIPA (DHCP); “works by IP but not by name” is DNS; clocks disagreeing is NTP.',
    },
    {
      id: 'OBJ-M5', mode: 'medium', pillar: 'recognize', circuit: 'slaac', bench: 'EUI-64 builder',
      title: 'Build the EUI-64 interface ID for MAC 9C:B6:D0:11:22:33 and answer the addressing questions.',
      context: 'The badge-label printer on the renovated floor (RA prefix 2001:db8:40::/64) self-addresses via SLAAC. Build its interface ID, then answer two follow-ups.',
      hints: [
        'Two moves only: splice FF:FE into the middle of the MAC, then flip one bit in the first octet (the U/L bit).',
        '9C:B6:D0 | 11:22:33 → insert ff:fe between the halves → flip the 7th bit of 0x9C: 9C becomes 9E.',
        'Interface ID = 9e:b6:d0:ff:fe:11:22:33. The device always also keeps a fe80::/10 link-local address. Stable, allowlisted device → temporary (privacy) addresses OFF.',
      ],
      success: 'Built correctly — full SLAAC address: 2001:db8:40::9eb6:d0ff:fe11:2233. The U/L flip (0x9C → 0x9E) exists because EUI-64 reuses the 48-bit MAC’s locally-administered bit in a different position. And remember: the fe80::/10 link-local address is always present, and DAD verifies uniqueness.',
      failure: 'Check both moves: FF:FE must sit exactly in the middle (between the 3rd and 4th bytes), and the U/L bit is the 7th bit of the FIRST octet — for 9C (1001 110x) flipping it gives 9E (1001 111x). Stable, allowlisted devices should NOT use temporary/privacy addresses.',
    },
    {
      id: 'OBJ-M6', mode: 'medium', pillar: 'detect', circuit: 'dhcp', bench: 'Scope repair',
      title: 'Repair the VLAN 40 DHCP scope so the test client obtains a lease.',
      context: 'The scope was left half-commissioned after the renovation: option 3 points at a foreign subnet (10.20.44.1), option 6 points at the switch itself, and option 15 is empty. Fix the options, then renew the lease.',
      hints: [
        'VLAN 40 is 10.20.40.0/24. A pool must live inside that subnet, and .1 is usually the gateway.',
        'Pool .100–.199 leaves room for static gear; gateway = 10.20.40.1; DNS = 10.20.40.53 (the resolver); domain = meridian.local.',
        'Example fix: pool 10.20.40.100–10.20.40.199 · option 3 = 10.20.40.1 · option 6 = 10.20.40.53 · option 15 = meridian.local. Then press Renew lease.',
      ],
      success: 'Lease granted — the client now holds an address from 10.20.40.0/24 with a working router and DNS. You just exercised options 3 (router), 6 (DNS) and 15 (domain name): the three options Network+ expects you to know.',
      failure: 'The lease was refused. Verify: pool inside 10.20.40.0/24 with start < end (keep .1 free), gateway 10.20.40.1, DNS 10.20.40.53, domain meridian.local — then renew.',
    },
    {
      id: 'OBJ-M7', mode: 'medium', pillar: 'detect', circuit: 'dns', bench: 'Resolver walk',
      title: 'Walk the resolution of www.meridian.gov in order and classify each hop.',
      context: 'Line up the five steps of a cold (cache-empty) resolution, then classify the two query styles used.',
      hints: [
        'Start local: whose cache is checked first? Then who does the whole walk on the client’s behalf?',
        'Client cache → recursive resolver cache → root → .gov TLD → meridian.gov authoritative. Client→resolver = recursive; resolver→outsiders = iterative.',
        'Order: 1) client stub cache, 2) recursive resolver cache, 3) root servers, 4) .gov TLD, 5) meridian.gov authoritative. Recursive: client→resolver. Iterative: resolver→root/TLD/auth.',
      ],
      success: 'Walk complete. One recursive question from the client, then three iterative referrals by the resolver — and the answer is cached at every layer until its TTL expires. That split is exactly how DNS stays fast and scalable.',
      failure: 'The path is out of order. Caches come before servers, and the hierarchy ascends root → TLD → authoritative. Classification: the client asks its resolver recursively; the resolver asks root/TLD/authoritative iteratively.',
    },
    {
      id: 'OBJ-M8', mode: 'medium', pillar: 'detect', circuit: 'ntp', bench: 'Sync clinic',
      title: 'Diagnose the unsynchronized client: fix the source, open the path, and read the stratum.',
      context: 'A VLAN 40 server shows stratum 16 (“no time”). Its ntpd points at a name it cannot resolve, and the VLAN ACL may be in the way.',
      hints: [
        'Stratum 16 = unsynchronized. Two usual suspects: an unusable server and a blocked UDP 123 path.',
        'Point the client at the campus time appliance 10.20.50.10 and allow UDP/123 from VLAN 40 to it; then restart ntpd.',
        'Fix: server 10.20.50.10, ACL allowed, restart. The appliance is stratum 2, so the client becomes stratum 3.',
      ],
      success: 'Synchronized — offset settled near 0.4 ms. You read the classic evidence (stratum 16, reach 0), fixed source AND path, and predicted the resulting stratum: 2 + 1 = 3. Stratum arithmetic like this is a favourite exam question.',
      failure: 'Still unsynchronized. Check the three dials: server must be the appliance’s IP (10.20.50.10), the VLAN 40 → core UDP/123 rule must be allowed, and ntpd must be restarted after the change. Then answer: appliance stratum 2 ⇒ client stratum 3.',
    },
    {
      id: 'OBJ-M9', mode: 'medium', pillar: 'mitigate', circuit: 'dhcp', bench: 'Rogue capture',
      title: 'Identify the rogue DHCP server in the capture and shut it out with snooping.',
      context: 'VLAN 40 staff report gateway errors. The capture shows Offers from two sources — one of them is not yours.',
      hints: [
        'Compare the server identifiers in the two Offer rows; one address is outside your service VLAN (10.20.50.0/24 where the real server lives).',
        'The rogue is 10.20.40.233. DHCP snooping only forwards DHCP on ports you mark trusted — trust the uplink to the real server.',
        'Enter rogue IP 10.20.40.233, enable DHCP snooping, and trust port Gi1/0/1 (uplink to core).',
      ],
      success: 'Rogue blocked. DHCP snooping builds a binding table from legitimate Offers and drops DHCP messages on untrusted ports — the standard defense against rogue servers handing out hostile gateways or DNS.',
      failure: 'Not there yet. The real server lives at 10.20.50.5; the source answering from 10.20.40.233 is the rogue. Enter that IP, switch snooping on, and mark the uplink Gi1/0/1 as trusted so legitimate Offers still arrive.',
    },
    {
      id: 'OBJ-M10', mode: 'medium', pillar: 'mitigate', circuit: 'nts', bench: 'NTS bench',
      title: 'Sequence the NTS handshake and switch the campus time profile to NTS.',
      context: 'After the spoofed-time incident, NTS is the fix. Order the four steps of a protected time transfer, then enable NTS on the profile.',
      hints: [
        'Key establishment comes first (a TLS session), cookies come next, and only then does time flow — authenticated.',
        '1) TLS to NTS-KE on TCP 4460 · 2) receive the cookie jar · 3) NTPv4 with NTS extension fields on UDP 123 · 4) verify and reject replays.',
        'Order: NTS-KE/TLS 4460 → cookies issued → NTPv4+AEAD over 123 → client verifies & discards used cookies. Then toggle NTS on.',
      ],
      success: 'Time is now authenticated end-to-end: the server proved its identity over TLS, every NTP packet carries AEAD-protected extension fields, and replays are rejected because cookies are single-use. Servers stay stateless — the cookie jar lives entirely on the client.',
      failure: 'The handshake is out of order. Keys before cookies, cookies before time transfer: TLS on TCP 4460 (NTS-KE) → cookie jar filled → NTPv4 + extension fields on UDP 123 → verification/replay rejection.',
    },
    {
      id: 'OBJ-M11', mode: 'medium', pillar: 'mitigate', circuit: 'ptp', bench: 'Clock-role board',
      title: 'Assign the four PTP clock roles and enable hardware timestamping for the dispatch annex.',
      context: 'The annex needs sub-microsecond time for radio logging. Place each device in its IEEE 1588 role.',
      hints: [
        'Time must enter the network at the source device, then be regenerated or corrected by switches as it flows down.',
        'GNSS appliance = grandmaster · core aggregation switch = boundary · annex access switch = transparent · workstations = ordinary (slave).',
        'Assign exactly that, then switch hardware timestamping ON — software timestamps are too coarse for sub-µs.',
      ],
      success: 'Annex timeline aligned to ±120 ns. Boundary clocks stop the hop-count degradation (they regenerate sync), transparent clocks correct residence time without regenerating, and hardware timestamping removes OS jitter — the trio that makes sub-microsecond real.',
      failure: 'Roles are misplaced. Follow the time: GNSS antenna appliance → grandmaster; core aggregation switch → boundary clock (regenerates downstream); annex access switch → transparent clock (corrects residence time); workstations → ordinary/slave clocks. And enable hardware timestamping.',
    },
    {
      id: 'OBJ-M12', mode: 'medium', pillar: 'mitigate', circuit: 'dns', bench: 'Hardening bench',
      title: 'Match each DNS threat to its control and enable all three.',
      context: 'Security review found three DNS risks. Pair each with the right control, then turn everything on.',
      hints: [
        'One control signs answers, one encrypts them on the wire, one stops clients from using resolvers they shouldn’t.',
        'Cache poisoning → DNSSEC. On-path eavesdropping → DoT/DoH. Rogue resolvers → egress filter (allowlist UDP/53).',
        'Match: poisoning→DNSSEC · eavesdropping→DoT/DoH · rogue resolver→egress filtering. Then enable all three toggles.',
      ],
      success: 'All three enabled. DNSSEC proves answers authentic (validation, not encryption), DoT/DoH hide them from on-path eyes, and egress filtering keeps clients from silently asking a rogue resolver. Together: integrity, confidentiality, and path control.',
      failure: 'A pair is off. Think about what each control actually does: DNSSEC = authenticity (anti-poisoning), DoT/DoH = confidentiality on the wire, egress filtering = only YOUR resolver is reachable. Pair accordingly and toggle all three on.',
    },
    // HARD
    {
      id: 'OBJ-H1', mode: 'hard', pillar: 'recognize', circuit: 'nightdesk', bench: 'Overnight bundle',
      title: 'Triage the overnight bundle: classify all six alerts, name the failing service for each real one, and dismiss the noise.',
      context: 'Monitoring dumped six alerts at 03:00. Three are genuine service failures with a single root cause each; three are benign noise. Classify every row.',
      hints: [
        'One real alert per service family (DHCP, DNS, NTP). The “duplicate IP” row is the same virtual MAC used by both members of the gateway pair; the SMB scan had no service impact; a healthy SLAAC host responding to ND is by-design.',
        'A → DHCP (relay can’t reach 10.20.50.5) · B → DNS (forwarder points at itself) · C → NTP (UDP 123 blocked) · D, E, F → noise.',
        'Exact: A=real-dhcp · B=real-dns · C=real-ntp · D=noise (VRRP virtual MAC, by design) · E=noise (unrelated scan) · F=noise (normal ND/SLAAC).',
      ],
      success: 'Perfect triage. The three root causes share a theme: every failure is a PATH or POINTER problem — a relay that can’t reach its server, a forwarder that points at itself, an ACL that blocks UDP 123. The noise rows were decoys precisely because they look abnormal but are by-design (VRRP virtual MACs, background scans, normal neighbour discovery).',
      failure: 'Rejected — some rows are misclassified. The duplicate-IP warning uses the shared VRRP virtual MAC (00:00:5e:… = by design), the SMB scan never touched a lesson service, and an M=0/O=0 RA with a self-assigned host is healthy SLAAC. Real: A = DHCP relay unreachable, B = DNS forwarder loop (10.20.50.53 → itself), C = NTP blocked by ACL.',
    },
    {
      id: 'OBJ-H2', mode: 'hard', pillar: 'understand', circuit: 'slaac', bench: 'RA flag lab',
      title: 'Read the three RA dumps, predict each host outcome, and name the dump that breaks a VLAN with no DHCPv6 server.',
      context: 'Three VLANs, three RA configurations, no DHCPv6 server anywhere. Predict exactly how hosts address themselves in each.',
      hints: [
        'M decides where ADDRESSES come from; O decides where OPTIONS (like DNS) come from. SLAAC always forms the address when M=0.',
        '(0,0): SLAAC only. (0,1): SLAAC address + stateless DHCPv6 for options. (1,0): stateful DHCPv6 for addresses — with no DHCPv6 server, hosts get nothing.',
        'dump1=slaac · dump2=slaac_stateless · dump3=stateful · broken dump = dump3.',
      ],
      success: 'Flawless read. The M flag is the address switch, the O flag is the options switch — and a managed flag with no DHCPv6 server is the classic broken-IPv6 VLAN. Exam trap mastered: DHCPv6 for addresses (M=1) is NOT the same as stateless DHCPv6 for options (O=1).',
      failure: 'One or more outcomes are wrong. With M=0 the host always self-addresses via SLAAC (dump1, dump2). Only M=1 asks DHCPv6 for addresses (dump3) — and O=1 merely fetches options like DNS from a stateless DHCPv6 server. No DHCPv6 server + M=1 = no global addresses at all.',
    },
    {
      id: 'OBJ-H3', mode: 'hard', pillar: 'mitigate', circuit: 'dhcp', bench: 'Plan designer',
      title: 'Design the complete two-VLAN DHCP plan: pools, gateways, relay, reservation, exclusion — every field exact.',
      context: 'Meridian standards: pools .100–.199 per VLAN, gateways .1, the badge printer (9C:B6:D0:11:22:33) pinned at 10.20.40.50, camera control range .240–.254 excluded, and VLAN 40 served across subnets by the server 10.20.50.5.',
      hints: [
        'Eleven fields. Pools per standard, gateway = the .1 of each VLAN, relay reaches the server’s real address, reservation binds MAC→IP, exclusion keeps the camera range out of the pool.',
        'VLAN10 pool 10.20.10.100–199 · VLAN40 pool 10.20.40.100–199 · gateways .1 · relay ON to 10.20.50.5 · printer 9c:b6:d0:11:22:33 → 10.20.40.50 · exclusion 10.20.40.240–254.',
        'Fill: 10.20.10.100 / 10.20.10.199 / 10.20.40.100 / 10.20.40.199 / 10.20.10.1 / 10.20.40.1 / relay on / 10.20.50.5 / 9c:b6:d0:11:22:33 / 10.20.40.50 / 10.20.40.240 / 10.20.40.254.',
      ],
      success: 'Plan approved. This one plan exercises the whole DHCP vocabulary: scopes per subnet, option 3 per VLAN, a relay so broadcasts from VLAN 40 reach the server as unicast, a MAC reservation that beats pool assignment, and an exclusion so static gear is never offered. This is the blueprint-level question Network+ loves.',
      failure: 'The plan was rejected — compare field by field against the Meridian standard: pools exactly .100–.199, gateways .1, relay enabled toward 10.20.50.5, reservation MAC 9c:b6:d0:11:22:33 → 10.20.40.50, exclusion 10.20.40.240–.254. Near-misses (e.g., .200 pool end, relay to the DNS box) are not accepted.',
    },
    {
      id: 'OBJ-H4', mode: 'hard', pillar: 'recognize', circuit: 'dns', bench: 'Zone editor',
      title: 'Build the meridian.gov zone to spec — and keep the apex legal.',
      context: 'Six requirements: apex at 203.0.113.44 · www aliased to the apex · mail host at 203.0.113.60 · @ mail routed to that host (priority 10) · SPF “v=spf1 mx -all” at the apex · reverse entry for the MAIL server’s address.',
      hints: [
        'Create six records. The alias rule has a catch: CNAME may never sit at the zone apex — alias www instead.',
        'Records: @ A 203.0.113.44 · www CNAME @ · mail A 203.0.113.60 · @ MX 10 → mail.meridian.gov · @ TXT v=spf1 mx -all · 203.0.113.60 PTR mail.meridian.gov.',
        'Exact set: [@ A 203.0.113.44] [www CNAME @] [mail A 203.0.113.60] [@ MX 10 mail.meridian.gov] [@ TXT v=spf1 mx -all] [203.0.113.60 PTR mail.meridian.gov].',
      ],
      success: 'Zone builds clean. Note what you avoided: a CNAME at the apex would be illegal (the apex already owns SOA/NS) — aliasing www is the legal pattern. The PTR for the mail server lives in the reverse zone 113.0.203.in-addr.arpa; without it, strict receiving mail servers may reject your mail.',
      failure: 'The zone fails inspection. Requirements: @ A 203.0.113.44 · www CNAME @ (NOT @ CNAME …) · mail A 203.0.113.60 · @ MX priority 10 → mail.meridian.gov · @ TXT “v=spf1 mx -all” · PTR record named 203.0.113.60 → mail.meridian.gov. A CNAME at @ is rejected by every authoritative server.',
    },
    {
      id: 'OBJ-H5', mode: 'hard', pillar: 'detect', circuit: 'dns', bench: 'Resolver walk',
      title: 'Run the full walk of www.meridian.gov, classify both query styles, and read the cached answer’s TTL.',
      context: 'Then prove you know why it resolved that fast the second time: read the TTL on the cached A answer in the zone data.',
      hints: [
        'Same five steps as the cold walk; the zone data panel lists TTLs — the one that matters belongs to the answer for www.',
        'www resolves through its CNAME to the apex A record, which carries TTL 3600. (The NS at 86400 and the MX at 600 are distractors.)',
        'walk order: client cache → resolver cache → root → .gov → authoritative · client→resolver recursive · resolver→others iterative · TTL 3600.',
      ],
      success: 'Walk verified with evidence. TTL 3600 means resolvers everywhere may serve that answer for an hour — which is exactly why DNS changes “propagate” slowly and why attackers who poison a cache get an hour of value per entry. TTLs are the control dial of DNS freshness.',
      failure: 'Not accepted. The walk is: client stub cache → recursive resolver cache → root → .gov TLD → meridian.gov authoritative; the client→resolver leg is recursive, the resolver→root/TLD/authoritative legs are iterative; and the A answer behind www (CNAME → apex A) carries TTL 3600 — not the NS’s 86400 or the MX’s 600.',
    },
    {
      id: 'OBJ-H6', mode: 'hard', pillar: 'detect', circuit: 'ntp', bench: 'Architecture board',
      title: 'Stamp the stratum of all three time nodes and assign the right synchronization tech per service class.',
      context: 'GPS-disciplined appliance → HQ core NTP server → annex secondary server. Then: what does the payment ledger need, what do file servers need, and which tech is disqualified for sub-microsecond work?',
      hints: [
        'Stratum 0 belongs to the reference source itself; every server one hop away adds exactly 1.',
        'Appliance (attached to GNSS) = 1 · HQ core = 2 · annex secondary = 3. Ledger timestamps (audit-grade) → PTP; file servers (±1 s fine) → NTP; and NTP is disqualified for sub-µs.',
        'strata: appliance=1, core=2, annex=3 · ledger→PTP · files→NTP · “not for sub-microsecond”→NTP.',
      ],
      success: 'Architecture stamped. Every sync hop costs one stratum and a little accuracy — which is why the annex server at stratum 3 is fine for wall-clock work, while the ledger moved to PTP with hardware timestamping. Choosing the right tech per service class is the actual exam skill.',
      failure: 'Rejected. Strata: the GNSS-attached appliance is 1 (the reference itself is 0), HQ core syncs to it → 2, annex secondary → 3. The payment ledger’s audit requirement needs PTP (sub-µs), file servers are fine with NTP — and NTP is the tech that can NOT do sub-microsecond.',
    },
    {
      id: 'OBJ-H7', mode: 'hard', pillar: 'mitigate', circuit: 'nts', bench: 'Incident follow-up',
      title: 'Answer the four-part NTS review: ports, protocols, what NTS stops, and what it does NOT do.',
      context: 'The incident report needs precision. NTS runs two sub-protocols — name both transports, both protected failure modes, and the honest limitation.',
      hints: [
        'One TCP port for key establishment, one UDP port for time. Protection is about authenticity — not secrecy.',
        'NTS-KE = TCP 4460; time = NTPv4 UDP 123 with extension fields. It stops spoofed server responses and replays. It does not encrypt the time data itself.',
        'Answers: 4460 / TCP · 123 / UDP · protects: spoofed responses + replay · does NOT provide confidentiality of the time data.',
      ],
      success: 'Report filed accurately. NTS gives identity (X.509 over TLS), authentication and replay protection (AEAD, single-use cookies) — while the time itself stays visible on the wire. Being able to state the limitation is precisely what separates an operator from a marketer.',
      failure: 'Wrong on at least one part. NTS-KE runs over TCP 4460 (TLS); the time transfer is still NTPv4 over UDP 123, protected by NTS extension fields (AEAD + cookies). It prevents spoofed/modified responses and replays — but it does NOT make the time data confidential.',
    },
    {
      id: 'OBJ-H8', mode: 'hard', pillar: 'detect', circuit: 'nightdesk', bench: 'SOC feed',
      title: 'Separate real attacks from decoys in the SOC feed and attach the correct control to each real one.',
      context: 'Four alerts. Three are genuine attacks against lesson services; one is a decoy. Classify, then match controls.',
      hints: [
        'A web crawler hammering the public site is marketing noise, not an attack on a network service.',
        'Alerts 1 (offer flood), 2 (DNS reply tampering) and 3 (NTP query sweep) are real; 4 is the decoy.',
        'Controls: 1→DHCP snooping + trusted ports · 2→DNSSEC + encrypted DNS (DoT/DoH) · 3→restrict NTP queries + NTS.',
      ],
      success: 'Feed cleaned and controls attached. Each real attack targets one service’s trust model: DHCP’s “any server may answer”, DNS’s “any reply may be trusted”, NTP’s “any response may set the clock”. The defenses you matched (snooping, DNSSEC/DoT, restricted queries + NTS) are exactly the controls from the other benches.',
      failure: 'Rejected. Alert 4 is a crawler — noisy but benign; attaching a hardening control to it shows misreading. Real: 1 = rogue DHCP offers (snooping + trusted ports), 2 = DNS reply tampering (DNSSEC + DoT/DoH), 3 = NTP mode 6/7 query sweep (restrict queries + NTS).',
    },
    {
      id: 'OBJ-H9', mode: 'hard', pillar: 'mitigate', circuit: 'nightdesk', bench: 'Change order',
      title: 'Sequence the five-step hardening change order and pick the correct rationale for steps 1→2.',
      context: 'The go-live change window: snooping, trust, a second time source, NTS, DNSSEC. Order matters — one wrong step locks staff out of leases.',
      hints: [
        'Enable a dropping control BEFORE trusting the paths that must survive it — otherwise legitimate servers go silent.',
        'Snooping global → trust uplinks → second NTP source → NTS everywhere → DNSSEC sign+validate.',
        'Order: snoop-global, trust-uplinks, ntp2, nts, dnssec. Rationale: snooping drops DHCP on untrusted ports, so uplinks must be trusted immediately after enabling it.',
      ],
      success: 'Change order signed. You sequenced controls by blast radius: snooping first (but trusted ports in the same window), time redundancy before authentication (so NTS rollout can’t strand clients on a single source), DNSSEC last (it needs signing and validation on both ends). That’s operator-grade ordering.',
      failure: 'Sequence rejected. Enable snooping, THEN trust the uplinks in the same change (it drops DHCP on untrusted ports by default), add the second NTP source before turning on NTS, and sign with DNSSEC last. Steps 1→2 exist because snooping blocks DHCP everywhere except ports you explicitly trust.',
    },
  ]

  // ---------------- quiz (C5) — Medium 7 · Hard 7 ----------------
  const QUIZ = [
    // MEDIUM
    {
      id: 'qm1', mode: 'medium', tag: 'DHCP ports',
      prompt: 'A DHCP server and its client communicate over which ports?',
      options: ['TCP 67 server / TCP 68 client', 'UDP 67 server / UDP 68 client', 'UDP 53 both sides', 'TCP 4460 both sides'],
      answer: 1,
      explain: 'DHCP rides on UDP — 67 on the server, 68 on the client. TCP 4460 is NTS-KE’s port; 53 is DNS.',
    },
    {
      id: 'qm2', mode: 'medium', tag: 'DHCP failure symptoms (APIPA)',
      prompt: 'A client shows the address 169.254.19.7/16. What does this tell you?',
      options: ['A static IP was misconfigured', 'The port sits on a guest VLAN', 'The client is using SLAAC', 'DHCP failed — APIPA kicked in'],
      answer: 3,
      explain: '169.254.0.0/16 is APIPA — the link-local fallback when no DHCP server answers. First suspects: server down, scope exhausted, or relay missing.',
    },
    {
      id: 'qm3', mode: 'medium', tag: 'DNS record types',
      prompt: 'Which record type maps a hostname to an IPv6 address?',
      options: ['AAAA', 'CNAME', 'PTR', 'A'],
      answer: 0,
      explain: 'A = IPv4, AAAA = IPv6 (4 A’s < 6 A’s is the classic mnemonic), PTR = reverse, CNAME = alias.',
    },
    {
      id: 'qm4', mode: 'medium', tag: 'SLAAC RA flags',
      prompt: 'In an RA with the M flag set, where do hosts get their IPv6 addresses?',
      options: ['SLAAC from the advertised prefix', 'From the router’s own address', 'Stateful DHCPv6 assigns them', 'Manually from DNS records'],
      answer: 2,
      explain: 'M = Managed: addresses come from stateful DHCPv6 (UDP 546/547). With M=0 the host self-addresses via SLAAC; O only adds options.',
    },
    {
      id: 'qm5', mode: 'medium', tag: 'NTP stratum',
      prompt: 'An NTP server at stratum 2 gets its time from…',
      options: ['A reference clock directly', 'A stratum 1 server', 'A stratum 3 server', 'Any pool member regardless of stratum'],
      answer: 1,
      explain: 'Stratum 0 is the reference clock itself; every server one hop away adds one. So stratum 2 syncs to stratum 1.',
    },
    {
      id: 'qm6', mode: 'medium', tag: 'NTS purpose',
      prompt: 'What does NTS primarily protect NTP from?',
      options: ['Clock drift over long intervals', 'Port 123 blocked by ACLs', 'Stratum misconfiguration', 'Spoofed replies and replays'],
      answer: 3,
      explain: 'NTS authenticates the server (TLS on 4460) and protects NTPv4 packets with AEAD + single-use cookies — defeating spoofing and replay. Drift and ACLs are not its business.',
    },
    {
      id: 'qm7', mode: 'medium', tag: 'PTP vs NTP precision',
      prompt: 'A trading-desk LAN needs sub-microsecond clock alignment for audit-grade timestamps. The right choice is…',
      options: ['PTP with hardware timestamping', 'NTP with faster polling', 'NTS on the existing switches', 'APIPA with manual clocks'],
      answer: 0,
      explain: 'Only PTP with hardware timestamping (and boundary/transparent-clock switches) reaches sub-microsecond class. NTP is millisecond-class; NTS secures NTP but doesn’t change its precision.',
    },
    // HARD
    {
      id: 'qh1', mode: 'hard', tag: 'DHCP troubleshooting',
      prompt: 'A VLAN 40 client boots to 169.254.19.7. The link light is green. Your FIRST diagnostic move?',
      options: ['Reimage the client’s NIC drivers', 'Switch the client over to SLAAC', 'Check if offers reach the VLAN', 'Assign a static APIPA address'],
      answer: 2,
      explain: 'APIPA + good link = “no offer arrived”. Work the path: server reachable, relay (IP helper) present on the SVI, scope has free addresses. Near-miss: SLAAC is IPv6-only and APIPA is a symptom, not a fix.',
    },
    {
      id: 'qh2', mode: 'hard', tag: 'DNS zone rules',
      prompt: 'A junior added “@ CNAME www” to meridian.gov and the zone stopped serving. Why?',
      options: ['A CNAME at @ is illegal — apex owns SOA/NS', 'CNAME records must point at addresses only', 'The @ label is reserved for PTR records', 'CNAME and MX cannot coexist in a zone'],
      answer: 0,
      explain: 'The apex must own SOA/NS; a CNAME at @ conflicts with them and authoritative servers refuse the zone. The legal pattern is the other way round: www CNAME @. (MX may happily coexist with other records — just never with a CNAME on the SAME name.)',
    },
    {
      id: 'qh3', mode: 'hard', tag: 'SLAAC RA outcomes',
      prompt: 'An RA advertises M=1, O=0 — but the VLAN has no DHCPv6 server. What do IPv6 hosts experience?',
      options: ['They self-address via SLAAC as usual', 'They get stateless DHCPv6 options only', 'They fall back to an APIPA-style address', 'No global address — link-local only'],
      answer: 3,
      explain: 'M=1 means “addresses come from DHCPv6” — with no server, hosts never form a global address (SLAAC is suppressed); they keep only fe80:: link-local. APIPA is the IPv4 analogue, not IPv6.',
    },
    {
      id: 'qh4', mode: 'hard', tag: 'PTP precision',
      prompt: 'Your trading LAN syncs via NTP but the audit shows 4 ms drift and demands sub-microsecond alignment. The correct engineering response?',
      options: ['Add more NTP pool servers, poll faster', 'Adopt PTP with hardware timestamping', 'Enable NTS on the current NTP design', 'Lower the stratum number of clients'],
      answer: 1,
      explain: 'This is a precision problem, not a redundancy or security one: PTP (IEEE 1588) with switch participation and hardware timestamping is the only option reaching sub-µs. NTS secures NTP; it does not change its precision. Clients cannot “lower” stratum — stratum is earned from the source.',
    },
    {
      id: 'qh5', mode: 'hard', tag: 'Time security (NTS)',
      prompt: 'After an intrusion, server logs are shifted by ~10 minutes and investigators can’t correlate events. NTP was never authenticated. Which control closes this hole?',
      options: ['DHCP snooping — it also filters NTP', 'DNSSEC — signed time records can’t be forged', 'NTS — authenticated, replay-proof time', 'A bigger allowed drift threshold'],
      answer: 2,
      explain: 'Time spoofing is an authentication failure: any on-path host could forge replies. NTS gives identity (X.509), packet authentication (AEAD) and replay protection (cookies). DHCP snooping and DNSSEC defend other services entirely.',
    },
    {
      id: 'qh6', mode: 'hard', tag: 'DHCP snooping',
      prompt: 'A rogue DHCP server is discovered on desk port Gi1/0/23. With DHCP snooping enabled, which port configuration is correct?',
      options: ['Trust only the uplink to the server', 'Trust Gi1/0/23 to monitor its offers', 'Trust every port — snooping just logs', 'Disable snooping, watch the lease table'],
      answer: 0,
      explain: 'Snooping’s model is default-deny: DHCP server messages flow only on trusted ports. Desk ports (including the rogue’s) stay untrusted; the uplink to the real server is trusted. Trusting the rogue’s port or everything defeats the feature.',
    },
    {
      id: 'qh7', mode: 'hard', tag: 'DNS forwarders',
      prompt: 'Resolver log: “forwarders { 10.20.50.53; }” — and 10.20.50.53 IS this resolver. Clients time out. The fix?',
      options: ['Add a second forwarder that is also itself', 'Disable recursion on the resolver', 'Lower the TTL on all zone records', 'Point the forwarder upstream and restart'],
      answer: 3,
      explain: 'A forwarder loop makes the resolver ask itself forever. Remove the loop or forward to a real upstream (e.g., the campus egress resolver), then verify end-to-end. Disabling recursion would break the resolver’s job for internal clients; TTLs are unrelated.',
    },
  ]

  // ---------------- glossary (C2) — 15 terms ----------------
  const GLOSSARY = [
    { term: 'Lease', def: 'The time-limited grant of an IP address (and options) made by DHCP to a client.' },
    { term: 'DORA', def: 'The four DHCP messages: Discover, Offer, Request, Acknowledge.' },
    { term: 'Scope', def: 'The configured address pool + options a DHCP server offers on a subnet.' },
    { term: 'Reservation', def: 'A fixed IP mapped to a specific client MAC, served from (or alongside) a scope.' },
    { term: 'Exclusion', def: 'A range inside a scope the server must never hand out.' },
    { term: 'Relay agent (IP helper)', def: 'Router feature converting client DHCP broadcasts into unicast to a server on another subnet.' },
    { term: 'APIPA', def: 'Self-assigned 169.254.0.0/16 address a client uses when no DHCP server answers.' },
    { term: 'RA / M-O flags', def: 'ICMPv6 Router Advertisement; M = managed (stateful DHCPv6 addresses), O = other (stateless DHCPv6 options).' },
    { term: 'EUI-64', def: 'Method turning a 48-bit MAC into a 64-bit interface ID: insert FF:FE mid-MAC, flip the U/L bit.' },
    { term: 'Recursive vs iterative', def: 'Recursive = “resolve this fully for me” (client→resolver); iterative = “give me your best referral” (resolver→root/TLD/auth).' },
    { term: 'TTL', def: 'Seconds a DNS answer may be cached before it must be refreshed.' },
    { term: 'DNSSEC / DoT / DoH', def: 'DNSSEC signs answers for authenticity; DoT (853) and DoH (443) encrypt DNS on the wire.' },
    { term: 'Stratum', def: 'NTP hierarchy level: 0 = reference clock, 1 = appliance attached to it, +1 per hop; 16 = unsynchronized.' },
    { term: 'PTP clock roles', def: 'Grandmaster (source), ordinary (endpoint), boundary (regenerating switch), transparent (residence-time-correcting switch).' },
    { term: 'NTS-KE', def: 'NTS Key Establishment: TLS session on TCP 4460 that authenticates the server and issues cookies before NTP time transfer.' },
  ]

  // ---------------- evidence data (synthetic · TRAINING DATA) ----------------
  const DHCP_CAPTURE = [
    { no: 1, time: '08:41:02.113', srcMac: '9c:b6:d0:aa:40:05', srcIp: '10.20.50.5', msg: 'OFFER', yiaddr: '10.20.40.114', opts: 'gw 10.20.40.1 · dns 10.20.40.53 · lease 8h', note: 'relayed via SVI 10.20.40.1' },
    { no: 2, time: '08:41:02.180', srcMac: '4e:5f:19:aa:23:33', srcIp: '10.20.40.233', msg: 'OFFER', yiaddr: '10.20.40.77', opts: 'gw 10.20.40.254 · dns 203.0.113.66 · lease 24h', note: 'no relay — same L2' },
    { no: 3, time: '08:41:03.902', srcMac: '9c:b6:d0:aa:40:05', srcIp: '10.20.50.5', msg: 'ACK', yiaddr: '10.20.40.114', opts: '—', note: 'lease committed' },
  ]

  const NTP_STATUS_BROKEN = [
    'ntpstat: unsynchronized',
    '     remote           refid      st  when  reach  delay   offset  jitter',
    '====================================================================',
    '  time.meridian.local .INIT.      16    —     0     —       0.000    —',
    'reach 0 ⇒ no response ever received · stratum 16 ⇒ unsynchronized',
  ]
  const NTP_STATUS_FIXED = [
    'ntpstat: synchronized to 10.20.50.10 (stratum 2)',
    '     remote           refid      st  when  reach  delay   offset  jitter',
    '====================================================================',
    '*10.20.50.10      .GNSS.         2    32   377   0.412   0.384   0.102',
    'offset +0.384 ms · drift within policy (±10 ms) · client stratum ⇒ 3',
  ]

  const RA_DUMPS = [
    { id: 'dump1', vlan: 'VLAN 41 · staff', flags: { m: 0, o: 0 }, prefix: '2001:db8:41::/64', dnsNote: 'RDNSS in RA', raw: 'ICMPv6 type=134 · M=0 O=0 · prefix 2001:db8:41::/64 · RDNSS 10.20.50.53' },
    { id: 'dump2', vlan: 'VLAN 42 · guests', flags: { m: 0, o: 1 }, prefix: '2001:db8:42::/64', dnsNote: 'stateless DHCPv6', raw: 'ICMPv6 type=134 · M=0 O=1 · prefix 2001:db8:42::/64 · other-config' },
    { id: 'dump3', vlan: 'VLAN 43 · lab', flags: { m: 1, o: 0 }, prefix: '2001:db8:43::/64', dnsNote: '—', raw: 'ICMPv6 type=134 · M=1 O=0 · prefix 2001:db8:43::/64 · managed' },
  ]

  const ZONE_ROWS = [
    { name: 'meridian.gov.', type: 'NS', value: 'ns1.meridian.gov.', ttl: '86400' },
    { name: 'meridian.gov.', type: 'SOA', value: 'ns1.meridian.gov. hostmaster', ttl: '86400' },
    { name: 'meridian.gov.', type: 'A', value: '203.0.113.44', ttl: '3600' },
    { name: 'www.meridian.gov.', type: 'CNAME', value: 'meridian.gov.', ttl: '3600' },
    { name: 'mail.meridian.gov.', type: 'A', value: '203.0.113.60', ttl: '600' },
    { name: 'meridian.gov.', type: 'MX', value: '10 mail.meridian.gov.', ttl: '600' },
  ]

  const OVERNIGHT_ALERTS = [
    { id: 'A', time: '01:12', text: 'dhcpd: relay 10.20.40.1 relays DHCPDISCOVER → 10.20.50.5 · no OFFER within 30 s (server unreachable)', hint: 'VLAN 40 helper target' },
    { id: 'D', time: '01:37', text: 'kernel: duplicate address 10.20.40.1 detected — MAC 00:00:5e:00:01:28 seen on both gateway SVIs', hint: 'gateway pair' },
    { id: 'B', time: '02:04', text: 'named[412]: forwarders { 10.20.50.53; } — referral loop: forwarding to self for meridian.gov', hint: 'resolver config' },
    { id: 'E', time: '02:33', text: 'fw: single host scanned TCP/445 across 200 addresses in VLAN 10 · no service impact', hint: 'network noise' },
    { id: 'C', time: '03:01', text: 'ntpd[812]: no servers reachable — VLAN40→core ACL denies UDP/123 · stratum 16', hint: 'time client' },
    { id: 'F', time: '03:44', text: 'slaac: host on VLAN 41 received RA (M=0 O=0), self-assigned 2001:db8:41::9e… · responding to ND', hint: 'IPv6 host' },
  ]

  const SOC_FEED = [
    { id: '1', time: '21:04', title: 'DHCP offer flood', text: '46 OFFERs/min from port Gi1/0/23 (MAC 4e:5f:19:aa:23:33) · gateway option 0.0.0.0 · rogue vendor string' },
    { id: '4', time: '21:31', title: 'Web crawler burst', text: '1,200 GET / from single crawler UA against public meridian.gov · rate ~2/s · no service errors' },
    { id: '2', time: '22:02', title: 'DNS replies with TXID mismatch', text: 'Answers to internal clients carry wrong transaction IDs · A records rewritten to 203.0.113.66' },
    { id: '3', time: '22:40', title: 'NTP mode 6/7 query sweep', text: 'External host sweeps mode 6/7 queries across core time servers · responses large (legacy monlist behavior)' },
  ]

  // Tray display order is deliberately shuffled (must not match the solution order).
  const CHANGE_ITEMS = [
    { id: 'nts', label: 'Enable NTS on all time clients and servers (NTS-KE 4460)' },
    { id: 'trust', label: 'Mark uplink/server ports trusted (Gi1/0/1 → core)' },
    { id: 'dnssec', label: 'Sign the internal zone with DNSSEC and enable validation on resolvers' },
    { id: 'snoop', label: 'Enable DHCP snooping globally on the access switches' },
    { id: 'ntp2', label: 'Deploy the second internal NTP source (10.20.50.11, stratum 2)' },
  ]

  const DORA_CARDS = [
    { id: 'offer', label: 'OFFER', text: 'Server proposes an address + options.' },
    { id: 'ack', label: 'ACKNOWLEDGE', text: 'Server commits the lease and its timer.' },
    { id: 'discover', label: 'DISCOVER', text: 'Client broadcasts: “any DHCP server out there?”' },
    { id: 'request', label: 'REQUEST', text: 'Client broadcasts its acceptance of one offer.' },
  ]

  const SERVICE_MAP = {
    services: [
      { id: 'dhcp', label: 'DHCP' },
      { id: 'slaac', label: 'SLAAC' },
      { id: 'dns', label: 'DNS' },
      { id: 'ntp', label: 'NTP' },
      { id: 'ptp', label: 'PTP' },
      { id: 'nts', label: 'NTS' },
    ],
    bins: [
      { id: 'address', label: 'Address assignment' },
      { id: 'name', label: 'Name resolution' },
      { id: 'time', label: 'Time synchronization' },
    ],
    correct: { dhcp: 'address', slaac: 'address', dns: 'name', ntp: 'time', ptp: 'time', nts: 'time' },
  }

  const RECORD_TASKS = [
    { id: 't1', task: 'Route mail for meridian.gov to the mail host (with priority)', answer: 'MX' },
    { id: 't2', task: 'Alias www.meridian.gov to the apex name', answer: 'CNAME' },
    { id: 't3', task: 'Publish the IPv6 address of the web server', answer: 'AAAA' },
    { id: 't4', task: 'Let 203.0.113.44 resolve back to a name (reverse)', answer: 'PTR' },
  ]
  const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'PTR', 'NS', 'SRV', 'CAA']

  const SYMPTOMS = [
    { id: 's1', text: 'Ticket 1 — “My workstation shows 169.254.77.12 and I can’t reach anything.”', answer: 'dhcp' },
    { id: 's2', text: 'Ticket 2 — “Ping 10.20.50.53 works, but ping meridian-intra.meridian.local fails.”', answer: 'dns' },
    { id: 's3', text: 'Ticket 3 — “The two core switches disagree about when last night’s event happened — by 28 minutes.”', answer: 'ntp' },
  ]
  const SYMPTOM_ANSWERS = [
    { id: 'ptp', label: 'PTP' },
    { id: 'dhcp', label: 'DHCP' },
    { id: 'ntp', label: 'NTP' },
    { id: 'dns', label: 'DNS' },
  ]

  const WALK_STEPS = [
    { id: 'tld', label: '.gov TLD servers', note: '“ask meridian.gov’s own servers” — a referral' },
    { id: 'rec', label: 'Recursive resolver cache (10.20.50.53)', note: 'the campus resolver checks its cache' },
    { id: 'auth', label: 'meridian.gov authoritative servers', note: 'the actual answer for www' },
    { id: 'stub', label: 'Client stub resolver cache', note: 'the asking device checks its own cache' },
    { id: 'root', label: 'Root name servers', note: '“ask the .gov servers” — a referral' },
  ]

  const PTP_DEVICES = [
    { id: 'gnss', label: 'GNSS roof antenna (time appliance)', note: 'sourced from satellites' },
    { id: 'agg', label: 'Core aggregation switch', note: 'feeds the whole campus' },
    { id: 'access', label: 'Annex access switch', note: 'in the forwarding path only' },
    { id: 'workstations', label: 'Dispatch workstations', note: 'end devices that consume time' },
  ]
  const PTP_ROLES = [
    { id: 'transparent', label: 'Transparent clock' },
    { id: 'ordinary', label: 'Ordinary (slave) clock' },
    { id: 'grandmaster', label: 'Grandmaster clock' },
    { id: 'boundary', label: 'Boundary clock' },
  ]

  const NTS_STEPS = [
    { id: 'cookies', label: 'Cookie jar filled', note: 'server issues opaque cookies — no server state' },
    { id: 'verify', label: 'Client verifies · discards used cookie · rejects replays', note: 'each cookie works once' },
    { id: 'ke', label: 'TLS session to NTS-KE on TCP 4460', note: 'server proves identity (X.509)' },
    { id: 'ef', label: 'NTPv4 over UDP 123 with NTS extension fields', note: 'AEAD-protected time transfer' },
  ]

  const HARDEN_TASKS = [
    { id: 'poison', threat: 'Cache poisoning — forged answers get cached', answer: 'dnssec' },
    { id: 'snoop', threat: 'On-path eavesdropping of queries/responses', answer: 'enc' },
    { id: 'rogue', threat: 'Clients silently using a rogue resolver', answer: 'egress' },
  ]
  const HARDEN_CONTROLS = [
    { id: 'enc', label: 'Encrypted DNS — DoT (853) / DoH (443)' },
    { id: 'egress', label: 'Egress filter — only the campus resolver may use UDP/53' },
    { id: 'dnssec', label: 'DNSSEC (signing + validation)' },
  ]

  const STRATA_NODES = [
    { id: 'appliance', label: 'GNSS-disciplined time appliance (10.20.50.10)' },
    { id: 'core', label: 'HQ core NTP server (10.20.50.11) — syncs to the appliance' },
    { id: 'annex', label: 'Annex secondary server — syncs to HQ core' },
  ]
  const STRATA_OPTIONS = ['0', '1', '2', '3', '16']
  const TECH_TASKS = [
    { id: 'ledger', text: 'Payment ledger timestamps — audit-grade, must align < 1 µs', answer: 'ptp' },
    { id: 'files', text: 'Windows file servers — ±1 second is plenty', answer: 'ntp' },
    { id: 'notSub', text: 'Which tech is DISQUALIFIED for sub-microsecond work?', answer: 'ntp' },
  ]
  const TECH_OPTIONS = [
    { id: 'ntp', label: 'NTP' },
    { id: 'ptp', label: 'PTP' },
  ]

  const NTS_REVIEW = {
    protects: [
      { id: 'spoof', label: 'Spoofed / modified server responses' },
      { id: 'replay', label: 'Replay of captured time packets' },
      { id: 'conf', label: 'Confidentiality of the time data itself' },
    ],
    notProtects: [
      { id: 'noconf', label: 'It does NOT keep the time data confidential — authenticity only' },
      { id: 'noprec', label: 'It does NOT improve precision beyond NTP’s milliseconds' },
      { id: 'noport', label: 'It does NOT replace NTP with a new transport' },
    ],
  }

  const ATTACK_CONTROLS = {
    '1': [
      { id: 'raguard', label: 'RA Guard' },
      { id: 'snooping', label: 'DHCP snooping + trusted ports' },
      { id: 'dnssec', label: 'DNSSEC' },
    ],
    '2': [
      { id: 'snooping', label: 'DHCP snooping' },
      { id: 'nts', label: 'NTS' },
      { id: 'dnsenc', label: 'DNSSEC + encrypted DNS (DoT/DoH)' },
    ],
    '3': [
      { id: 'doh', label: 'DoH for all clients' },
      { id: 'ntprestrict', label: 'Restrict NTP queries + NTS' },
      { id: 'snooping', label: 'DHCP snooping' },
    ],
  }

  const RA_OUTCOME_OPTIONS = [
    { id: 'stateful', label: 'Stateful DHCPv6 — server hands out addresses' },
    { id: 'slaac', label: 'SLAAC only — host self-addresses from the prefix' },
    { id: 'slaac_stateless', label: 'SLAAC address + stateless DHCPv6 for options' },
  ]

  // ---------------- bench-local option sets ----------------
  const PORT_OPTIONS = [
    { id: '67', label: 'UDP 67' },
    { id: '68', label: 'UDP 68' },
    { id: '53', label: 'UDP 53' },
    { id: '4460', label: 'TCP 4460' },
  ]
  const BIN_OPTIONS = SERVICE_MAP.bins
  const TRUST_PORTS = [
    { id: 'gi1', label: 'Gi1/0/1 — uplink to core (services VLAN 10.20.50.0/24)' },
    { id: 'gi23', label: 'Gi1/0/23 — desk port (the unexpected offers came from here)' },
    { id: 'gi5', label: 'Gi1/0/5 — desk port (printers corner)' },
  ]
  const TRIAGE_OPTIONS = [
    { id: 'real-dhcp', label: 'Real failure — DHCP' },
    { id: 'real-dns', label: 'Real failure — DNS' },
    { id: 'real-ntp', label: 'Real failure — NTP' },
    { id: 'noise', label: 'Noise — benign by design' },
  ]
  const REASONS = [
    { id: 'performance', label: 'Snooping is CPU-intensive, so uplinks go first to reduce load' },
    { id: 'lockout', label: 'Snooping drops DHCP on untrusted ports — uplinks must be trusted immediately after enabling it, or legitimate leases die' },
    { id: 'logging', label: 'Snooping needs trusted ports to build its logs before anything else' },
  ]
  const WALK_MODES = [
    { id: 'iterative', label: 'Iterative — give me your best referral, one hop' },
    { id: 'recursive', label: 'Recursive — resolve the whole walk for me' },
  ]
  const SOC_VERDICTS = [
    { id: 'real', label: 'Real attack' },
    { id: 'decoy', label: 'Decoy / benign' },
  ]
  const SLAAC_LINK_OPTIONS = [
    { id: 'fe80', label: 'A fe80::/10 link-local address' },
    { id: 'db8', label: 'A 2001:db8::/32 global address' },
    { id: 'apipa', label: 'A 169.254.0.0/16 APIPA address' },
  ]
  const SLAAC_PRIVACY_OPTIONS = [
    { id: 'yes', label: 'Yes — rotate addresses for privacy' },
    { id: 'no', label: 'No — keep stable addresses the allowlist can pin' },
  ]
  const NTS_KE_PROTO = [
    { id: 'TCP', label: 'TCP' },
    { id: 'UDP', label: 'UDP' },
  ]

  // ---------------- briefing (C1) ----------------
  const BRIEFING = {
    header: 'Building B — go-live day',
    date: 'Monday, 9 November 2026 · 06:15',
    org: 'Meridian Civic Campus — city hall, records office and the emergency dispatch annex.',
    body: [
      'Building B reopened this morning after a nine-month renovation. The junior tech who wired it resigned on Friday, leaving the service riser half-commissioned: scopes, RA flags, zone data, time sources and hardening controls are all in various states of “almost done”.',
      'Staff arrive at 08:00. Your shift: bring every network service circuit up on the riser board, verify it in evidence, and leave behind a hardened, defensible configuration — then sign the punch list.',
      'Everything in this room is simulated training data for CompTIA Network+ N10-009, Objective 3.7 (Network services: DHCP, SLAAC, DNS, NTP, PTP, NTS). IPs use documentation ranges; nothing here touches a real network.',
    ],
    howTo: [
      'Pick a circuit on the riser board (left). Each opens a bench with instruments and its own check buttons.',
      'The punch list (right) tracks every open item with live results and educational feedback.',
      'Night desk (07) holds the overnight evidence. Inspector (08) is the knowledge check. Handover (09) is your field notes.',
    ],
  }

  // ---------------- handover / debrief (C6) ----------------
  const HANDOVER = {
    detection: [
      { service: 'DHCP', data: 'DHCP offer/ack capture (snooping binding table), lease counters', logic: 'Alert on OFFER/ACK whose server MAC/IP ∉ {legit server, relay} · sudden lease-rate spikes (starvation) · option-3/6 values ∉ allowlist' },
      { service: 'SLAAC', data: 'ICMPv6 RA capture on access ports', logic: 'Alert on RA from any MAC that is not the gateway’s · RA Guard ports policy · new prefixes outside the allowlist' },
      { service: 'DNS', data: 'Resolver query logs, DNSSEC validation failures', logic: 'NXDOMAIN-rate spikes (tunneling/DGA), TXID mismatches, validation-failure bursts, resolvers answering that you don’t own' },
      { service: 'NTP', data: 'ntpq/chrony status, flow logs on UDP 123', logic: 'Stratum 16 / reach 0 on any monitored client · offset beyond policy (±10 ms) · external mode 6/7 queries · time steps > 128 ms' },
      { service: 'PTP', data: 'PTP state telemetry (BMCA elections, offset from master)', logic: 'Unexpected grandmaster change · offset from master above budget · clock-role flapping' },
      { service: 'NTS', data: 'NTS-KE TLS handshake logs (4460), NTPv4 EF drop counters', logic: 'NTS-KE failures/certificate alerts · rise in rejected/replayed packets · clients falling back to unauthenticated NTP' },
    ],
    blueTeam: [
      'Default-deny every “anyone may answer” protocol: DHCP snooping for DHCP, RA Guard for RAs, resolver allowlists + DNSSEC for DNS, NTS for time.',
      'Time is a security control: log correlation, Kerberos-style auth and certificates all silently depend on it — monitor offset like you monitor disk space.',
      'Every service in 3.7 has a “rogue provider” failure mode. The generic detection pattern: know your legitimate provider set, alarm on anyone else.',
      'Change order matters: enable dropping controls and their exceptions in the same window (snooping → trusted ports), add redundancy before authentication (2nd NTP source → NTS).',
    ],
    redTeam: [
      'Why rogue DHCP/DNS are beloved: one spoofed packet set re-routes a whole VLAN’s trust — gateway, resolver, everything (AiTM setup).',
      'Unauthenticated time is unlogged time: shifting clocks breaks correlation, which is worth more to an intruder than deleting logs.',
      'These notes are simplified, defensive-minded teaching mappings — not operational tradecraft.',
    ],
    links: [
      { label: 'RFC 8915 — Network Time Security (NTS)', url: 'https://www.rfc-editor.org/info/rfc8915' },
      { label: 'IEEE 1588 — Precision Time Protocol', url: 'https://standards.ieee.org/ieee/1588/4470/' },
      { label: 'CompTIA Network+ N10-009 (official page)', url: 'https://www.comptia.org/certifications/network' },
    ],
    simplifiedNote: 'Simplified MITRE ATT&CK tie-ins (labeled simplified per lab rules): DNS as a C2/redirect channel → T1071.004; rogue DHCP/AiTM setups → T1557 (Adversary-in-the-Middle); time manipulation is treated conceptually (it undermines log integrity rather than mapping 1:1 to a technique).',
  }

  // export
  window.LabData = {
    PILLAR_META, CIRCUITS, circuitOf, SERVICE_NOTES, OBJECTIVES, QUIZ, GLOSSARY,
    DHCP_CAPTURE, NTP_STATUS_BROKEN, NTP_STATUS_FIXED, RA_DUMPS, ZONE_ROWS,
    OVERNIGHT_ALERTS, SOC_FEED, CHANGE_ITEMS, DORA_CARDS, SERVICE_MAP,
    RECORD_TASKS, RECORD_TYPES, SYMPTOMS, SYMPTOM_ANSWERS, WALK_STEPS,
    PTP_DEVICES, PTP_ROLES, NTS_STEPS, HARDEN_TASKS, HARDEN_CONTROLS,
    STRATA_NODES, STRATA_OPTIONS, TECH_TASKS, TECH_OPTIONS, NTS_REVIEW,
    ATTACK_CONTROLS, RA_OUTCOME_OPTIONS,
    PORT_OPTIONS, BIN_OPTIONS, TRUST_PORTS, TRIAGE_OPTIONS, REASONS,
    WALK_MODES, SOC_VERDICTS, SLAAC_LINK_OPTIONS, SLAAC_PRIVACY_OPTIONS, NTS_KE_PROTO,
    BRIEFING, HANDOVER,
  }
})()
