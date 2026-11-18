// ── Red-Line Room · knowledge core + quiz banks ────────────────────────
// Ported 1:1 from the original framework lab (CORE_SECTIONS / QUIZ_MEDIUM /
// QUIZ_HARD in src/lib/lab/data.ts). Same wording, same correct answers.
"use strict";

window.RL_CONTENT = {
  // ── Knowledge Core (C2) ──────────────────────────────────────────────
  CORE_SECTIONS: [
    {
      id: "hard",
      title: "Device hardening",
      body: [
        "Every device ships loose on purpose: factory passwords, convenience services, management protocols from the 1990s. Hardening is the disciplined removal of those defaults — change credentials, turn off cleartext management (Telnet, HTTP GUI, SNMPv1), close unused ports, update firmware, and back up the config before you change it.",
        "Why attackers love defaults: published vendor defaults are the first thing tried on any exposed device (MITRE calls this T1078.001, Default Accounts). A router reachable on Telnet from the Internet with admin/admin isn't a vulnerability you must find — it's one you must only notice.",
        "Where it sits: hardening is host-level defense in depth. Zones and ACLs decide who may knock; hardening decides how much a knock can do.",
      ],
      mitre: [
        { id: "M1027", label: "Password Policies" },
        { id: "M1051", label: "Update Software" },
        { id: "M1054", label: "Software Configuration" },
      ],
      drill: "Rule of thumb: if a service isn't demonstrably needed, it isn't merely 'not allowed' — it must not exist.",
    },
    {
      id: "nac",
      title: "NAC — Network Access Control",
      body: [
        "NAC answers 'what are you?' before the network says 'come in'. The 802.1X handshake has three roles: the supplicant (the device asking), the authenticator (the switch or AP holding the door), and the authentication server (RADIUS, holding the policy). Until authentication succeeds, the port passes nothing but the handshake itself.",
        "Posture assessment extends the question to 'are you healthy?' — patched, protected, managed. Managed corporate laptops run an agent; BYOD fleets that you can't manage use agentless web-portal checks. Devices that fail land in a quarantine VLAN with remediation access only. Legacy gear that can't speak 802.1X at all (printers) is admitted by MAB — MAC address fallback, deliberately weaker.",
        "Where it sits: NAC is the admission control of the trusted/untrusted boundary — it decides placement before any ACL ever sees the traffic.",
      ],
      mitre: [
        { id: "M1030", label: "Network Segmentation" },
        { id: "M1037", label: "Filter Network Traffic" },
      ],
      drill: "802.1X protects the door. It says nothing about what an authenticated device does inside — that's the ACL's and the filter's job.",
    },
    {
      id: "keys",
      title: "Key management",
      body: [
        "Machines trust each other through secrets: TLS certificates, RADIUS shared secrets, VPN pre-shared keys, Wi-Fi passphrases. Key management is the lifecycle that keeps those secrets meaningful: issue, store, use, rotate, revoke.",
        "The failures are always the same three shapes. Shared too widely (one VPN PSK for 40 contractors — anyone who ever copied it is forever valid until you rotate). Kept too long (an expired TLS certificate, an offboarded admin's tablet still authenticating). Stored too loosely (a private key committed in plaintext to a repository).",
        "Rotation is the control that bounds the damage: a stolen key is worth exactly as long as it keeps working. Revocation is how offboarding works. Secure storage — dedicated vaults or cryptographic hardware — is how copies stop leaking (M1041: store keys on separate cryptographic hardware when possible).",
      ],
      mitre: [
        { id: "M1041", label: "Encrypt Sensitive Information" },
        { id: "M1047", label: "Audit" },
        { id: "M1032", label: "Multi-factor Authentication" },
      ],
      drill: "Attackers hunt these secrets directly — MITRE tracks it as T1552.004, Unsecured Credentials: Private Keys.",
    },
    {
      id: "acl",
      title: "ACLs — Access Control Lists",
      body: [
        "An ACL is a numbered list of permit/deny rules evaluated top-down, first match wins. 'permit ip any any' at the top is not a policy — it's the absence of one: every packet matches it, so nothing below is ever read, and the implicit deny at the end is never reached.",
        "Two structural facts do all the work. First-match: specific rules must sit above general ones (permit the admin workstation to SSH into management BEFORE denying everyone else). Implicit deny: traffic matching no rule is dropped — so a good ACL is mostly permits, with explicit denies reserved for the flows you want logged and documented.",
        "Least privilege in three lines: the world gets 443 to the web server and 25 to the mail gateway; management gets SSH from the admin workstation and nothing else; untrusted sources get nothing toward trusted zones.",
      ],
      mitre: [
        { id: "M1037", label: "Filter Network Traffic" },
        { id: "M1021", label: "Restrict Web-Based Content" },
      ],
      drill: "Read an ACL top-down and ask: which line does THIS packet match first? Order is the whole game (the lab's ACL engine is simplified to src/dst/port — real devices add protocol details).",
    },
    {
      id: "filter",
      title: "URL / content filtering",
      body: [
        "Filtering decides what users may reach and receive. URL/DNS filtering works at the destination level — categories (malware, phishing, gambling, streaming), allowlists and blocklists evaluated before the connection completes. Content filtering works at the payload level — file types, downloads, scripts — regardless of the source site.",
        "The two classic mistakes mirror each other. Under-blocking: guest networks that resolve malware domains because 'nobody tuned the policy'. Over-blocking: a streaming category that eats the biology department's course videos. The fix for false positives is the allowlist — a scalpel exception, not a policy change.",
        "Know the blind spot: domain/category filtering sees the lookup, not the payload. Inside TLS, content filtering needs inspection — that's the honest residual risk you'll name at sign-off.",
      ],
      mitre: [
        { id: "M1021", label: "Restrict Web-Based Content" },
        { id: "M1037", label: "Filter Network Traffic" },
      ],
      drill: "M1021 exists in ATT&CK precisely because this control disrupts real intrusion chains — initial access and C2 both ride web traffic.",
    },
    {
      id: "zones",
      title: "Trusted vs. untrusted zones",
      body: [
        "A zone is a policy label, not a wire: it declares which devices may trust each other. The Internet is untrusted. Guest and student wireless — 9,000 devices you don't manage — is untrusted too, no matter how fast the Wi-Fi is. Staff and records are trusted, and the management zone (where the switches live) is the most trusted of all.",
        "The label only matters because traffic policy hangs off it: untrusted → trusted is denied; trusted → management is reserved for named hosts and protocols. Label a guest network 'trusted' and every rule you write inherits the lie.",
        "Where it sits: zoning is segmentation's vocabulary. The screened subnet, quarantine VLANs and the management zone are all just zones with jobs.",
      ],
      mitre: [{ id: "M1030", label: "Network Segmentation" }],
      drill: "Trust is not transitive: a staff laptop and a guest phone can share a room and must not share a reachable subnet.",
    },
    {
      id: "dmz",
      title: "Screened subnet (DMZ)",
      body: [
        "Public services are a paradox: the world must reach them, but a compromised public server must not be a stepping stone into the college. The screened subnet resolves it — a buffer zone between the untrusted Internet and the trusted LAN, where the web server and mail gateway live behind their own tight rules.",
        "The policy is asymmetric on purpose. Inbound: the world may touch 443 on the web server and 25 on the mail gateway — and nothing else, anywhere. Outbound/insertion: the DMZ cannot initiate into the trusted LAN. If the web server is popped, the attacker lands in a one-room apartment with a barred window — not inside the house.",
        "The failure mode is misplacement: put www on the staff VLAN and every web exploit lands with the records server one hop away.",
      ],
      mitre: [
        { id: "M1030", label: "Network Segmentation" },
        { id: "M1050", label: "Exploit Protection" },
      ],
      drill: "T1190 (Exploit Public-Facing Application) is the attack this zone assumes WILL happen — the zone decides what it's worth afterward.",
    },
  ],

  // ── Quizzes (C5) ─────────────────────────────────────────────────────
  QUIZ_MEDIUM: [
    {
      id: "QM1",
      prompt: "A packet arrives at the border router and matches NO rule in the ACL. What happens?",
      options: [
        "It is forwarded, because ACLs only act on rules they match.",
        "It is logged and forwarded once.",
        "The router re-requests the packet from the source.",
        "It is dropped by the implicit deny ending every ACL.",
      ],
      correct: 3,
      topic: "acl",
      explain: "Every ACL ends in an invisible 'deny any any' — a packet matching nothing falls into it. Forwarding on no-match ignores how first-match ACLs work, and log-then-forward / re-request are not ACL behaviors at all.",
    },
    {
      id: "QM2",
      prompt: "In 802.1X, which component runs ON the switch and relays the handshake to the authentication server?",
      options: [
        "The authenticator",
        "The supplicant",
        "The RADIUS proxy agent",
        "The posture module",
      ],
      correct: 0,
      topic: "nac",
      explain: "Supplicant = the device asking; authenticator = the switch/AP holding the door and relaying; authentication server = RADIUS deciding. There is no 'RADIUS proxy agent' in 802.1X, and posture runs after the relay.",
    },
    {
      id: "QM3",
      prompt: "What is the security PURPOSE of placing the public web server in a screened subnet?",
      options: [
        "It speeds up the site by moving it closer to visitors.",
        "A compromised web server is contained away from the trusted LAN.",
        "It removes the need for TLS certificates on the site.",
        "It lets the server share a VLAN with the records server.",
      ],
      correct: 1,
      topic: "dmz",
      explain: "The screened subnet assumes the public service WILL be attacked (T1190) — containment is the point: breach the DMZ and you land in a buffer zone, not one hop from the records server. Sharing a VLAN with records is the exact misplacement this zone fixes; certificates and latency are unrelated to zoning.",
    },
    {
      id: "QM4",
      prompt: "9,000 student BYOD laptops cannot be centrally managed. Which NAC posture approach fits?",
      options: [
        "Persistent agent installed by IT on every managed laptop",
        "Trust the wireless link encryption instead of any posture",
        "Agentless web-portal checks at join time, no install",
        "Posture checks run only on the printers, not laptops",
      ],
      correct: 2,
      topic: "nac",
      explain: "Agents need management rights you don't have on BYOD fleets — agentless web-portal checks evaluate what they can at join time and quarantine failures. Trusting link encryption confuses Wi-Fi security with admission control; printers-only posture leaves every laptop unassessed.",
    },
    {
      id: "QM5",
      prompt: "Why rotate a VPN pre-shared key that 40 contractors have used since 2023?",
      options: [
        "It makes the VPN tunnel negotiate faster handshake speeds.",
        "It lowers the number of VPN license seats consumed.",
        "It strengthens the wireless signal on the guest network.",
        "It voids every copy of the old shared key.",
      ],
      correct: 3,
      topic: "keys",
      explain: "A shared secret never expires on its own: everyone who ever had it stays valid until it changes. Rotation (plus per-user certificates) bounds that window — handshake speed, licensing and signal strength have nothing to do with the reason.",
    },
    {
      id: "QM6",
      prompt: "Which statement about symmetric vs. asymmetric cryptography is correct?",
      options: [
        "Symmetric: one shared key. Asymmetric: a public/private pair.",
        "Asymmetric always runs faster because it holds two keys.",
        "Symmetric keys handle signing only and cannot encrypt data.",
        "They are two labels for the same cryptographic process.",
      ],
      correct: 0,
      topic: "keys",
      explain: "One shared secret is fast but hard to distribute; a public/private pair solves distribution at a slower cost — real systems use asymmetric to exchange symmetric session keys. 'Two names for one process' and 'signing-only' are simply wrong.",
    },
  ],

  QUIZ_HARD: [
    {
      id: "QH1",
      prompt: "Evidence: 'accepted telnet session to NORTH-GW1 from 203.0.113.77'. Which TWO controls failed to stop this?",
      options: [
        "Posture assessment and certificate management both missed the session.",
        "URL filtering and the quarantine VLAN both missed the session.",
        "Device hardening (Telnet enabled) and the ACL (no port-23 deny).",
        "WPA3 wireless encryption and DNS filtering both missed the session.",
      ],
      correct: 2,
      topic: "hard",
      explain: "Two layers had to fail in sequence: the border ACL should have denied the path to port 23, and hardening should have removed the Telnet service entirely. Wireless encryption, certificates, posture and filtering guard other doors — none of them touches a management-plane session.",
    },
    {
      id: "QH2",
      prompt: "Students report a 'northlake-grades-portal.example.com' login page harvesting credentials. Which control family answers, and what is the surgical action?",
      options: [
        "URL/DNS filtering — blocklist the domain, category covers its siblings.",
        "NAC — quarantine the laptops that visited the fake portal.",
        "Key management — force a password rotation for all students.",
        "Device hardening — patch the web server behind the portal.",
      ],
      correct: 0,
      topic: "filter",
      explain: "The attack lives at the destination, so filtering stops the lookup before the page loads; the blocklist is the scalpel for this domain and the phishing category covers its cousins. Quarantine and password resets are response work, and the web server isn't the thing that's broken.",
    },
    {
      id: "QH3",
      prompt: "A contractor authenticates to the VPN with a pre-shared key 'that everyone on the team has used since 2023'. What is the root cause, in control-family terms?",
      options: [
        "A zoning failure — contractors belong behind their own edge.",
        "A key-management failure — an over-shared secret was never rotated.",
        "An ACL failure — port 443 should be closed to contractors.",
        "A hardening failure — the VPN gateway needs a firmware update.",
      ],
      correct: 1,
      topic: "keys",
      explain: "The issue isn't where the contractor lands but that the secret outlived its need-to-know. Rotation bounds exposure; per-user certificates restore accountability and make revocation possible. Firmware, ACLs and zoning don't touch a credential that is simply too old and too shared.",
    },
    {
      id: "QH4",
      prompt: "A new chemistry building adds a student lab VLAN with 60 shared lab laptops. Where does it belong, and with which controls?",
      options: [
        "The screened subnet, beside the public web and mail servers.",
        "The management VLAN, so the laptops stay easiest to patch.",
        "The trusted staff zone — they are college-owned machines.",
        "Its own segment behind NAC, untrusted toward staff resources.",
      ],
      correct: 3,
      topic: "zones",
      explain: "Shared, high-churn devices in a teaching space are semi-untrusted even when college-owned: own segment, NAC at the door, untrusted toward staff and records. The screened subnet is for public-facing services, and the management VLAN is the last place students belong.",
    },
    {
      id: "QH5",
      prompt: "An ACL reads: 1) permit ip any any  2) deny ip guest staff  3) deny ip any mgmt. What happens to guest traffic aimed at the records server?",
      options: [
        "Denied by rule 2 — denies apply regardless of rule order.",
        "Permitted — rule 1 matches first; the denies are dead letters.",
        "Dropped by the implicit deny before any written rule runs.",
        "Denied by rule 3 — management rules outrank the blanket permit.",
      ],
      correct: 1,
      topic: "acl",
      explain: "First-match wins: the guest→records packet matches rule 1 immediately, so both denies below are dead letters and the implicit deny is never reached. That is exactly the 2016 mistake Northlake's border still carries — specific rules go above general ones, always.",
    },
    {
      id: "QH6",
      prompt: "The www certificate expires mid-semester. Which pairing of immediate and long-term action is right?",
      options: [
        "Immediate: serve plain HTTP. Long-term: wait for procurement to finish.",
        "Immediate: revoke the certificate. Long-term: extend it manually each decade.",
        "Immediate: renew and install. Long-term: automate expiry monitoring and alerts.",
        "Immediate: tell users to click through. Long-term: nothing — expiries are normal.",
      ],
      correct: 2,
      topic: "keys",
      explain: "Renewal restores trust today; automated expiry monitoring removes the silent-failure mode permanently. Revocation is for compromised keys, not expired ones; HTTP downgrades and click-through warnings burn credibility instead of fixing the lifecycle.",
    },
    {
      id: "QH7",
      prompt: "After enabling category filtering on guest Wi-Fi, what still slips through, and honestly why?",
      options: [
        "Encrypted TLS payloads — the filter sees domains, not content.",
        "Nothing else — category rules already cover every malicious connection.",
        "All guest traffic — enabling category filtering blocks DNS entirely.",
        "Only downloads larger than 445 bytes over open ports.",
      ],
      correct: 0,
      topic: "filter",
      explain: "Category/DNS filtering judges destinations; once a domain passes, TLS hides the payload from the filter. Closing that gap needs TLS inspection or DNS-layer security — the honest residual risk you sign off with, not a reason to disable the control.",
    },
  ],
};
