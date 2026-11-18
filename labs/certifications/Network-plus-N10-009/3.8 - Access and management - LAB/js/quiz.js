// Quiz banks — Medium: concept checks · Hard: scenario application (SYNTHETIC lab)
// QA rebuild (R4/R5): correct-answer position rotates; option lengths balanced.
// 1:1 static port — same items, options, correct indices, explanations, topics.

// Quiz banks — Medium: concept checks · Hard: scenario application (SYNTHETIC lab)
// QA rebuild (R4/R5): correct-answer position rotates across items; option lengths are
// balanced so the correct answer is never the longest; distractors stay on-domain.

const QUIZ_MEDIUM = [
  {
    id: 1,
    q: "Cascade's new Denver depot needs its network permanently joined to HQ. Which VPN type fits?",
    options: ["Client-to-site VPN", "Clientless HTML5 VPN", "Site-to-site VPN", "Full-tunnel client VPN"],
    correct: 2,
    why: "Site-to-site VPNs permanently join two NETWORKS (usually over IPsec). Client-to-site connects a single USER or device; clientless is browser-only; a full-tunnel client VPN is a routing mode, not a site link.",
    topic: "VPN types",
  },
  {
    id: 2,
    q: "A field tech's laptop uses a split tunnel with an ACL covering only 10.20.0.0/16. What happens to the tech's public web browsing?",
    options: ["It rides the VPN tunnel encrypted", "It exits locally, off the VPN", "It is dropped by the gateway", "It gets converted to Telnet"],
    correct: 1,
    why: "Split tunnel = ACL-selected destinations ride the tunnel; everything else exits locally. Public browsing skips your filtering and monitoring — the trade-off vs a full tunnel.",
    topic: "Split tunnel routing",
  },
  {
    id: 3,
    q: "Why is Telnet considered unacceptable for device management today?",
    options: ["It sends passwords in cleartext", "Firewalls block it on port 23", "It cannot run show commands", "It works only over serial cables"],
    correct: 0,
    why: "Telnet has no encryption: a sniffer on the path reads credentials and configs. Port 23 is not inherently blocked, show commands display fine, and Telnet runs over any IP path — the plaintext is the problem.",
    topic: "Telnet vs SSH",
  },
  {
    id: 4,
    q: "What is the purpose of a jump box (bastion host)?",
    options: ["It terminates every user VPN tunnel", "It stores nightly config backups", "It replaces the console port", "A single hardened admin doorway"],
    correct: 3,
    why: "A bastion host concentrates in-band management through one locked-down, fully-audited server — one door to guard instead of forty. VPN termination, backups and the console port are separate functions.",
    topic: "Jump box",
  },
  {
    id: 5,
    q: "The WAN fiber is cut. Which management path still reaches Yard 7's router?",
    options: ["SSH session across the WAN circuit", "OOB console via terminal server", "Web GUI session over the WAN circuit", "SNMP trap telemetry"],
    correct: 1,
    why: "In-band methods (SSH/GUI) ride the production network and die with it; SNMP traps can't reconfigure a router. OOB management uses a dedicated independent path — console port → terminal server → LTE/modem — built exactly for this.",
    topic: "OOB management",
  },
  {
    id: 6,
    q: "When is a clientless (HTML5/TLS) VPN the right choice?",
    options: ["When building a permanent branch-to-HQ link", "When maximum full-tunnel filtering is required", "Zero-install access on locked-down kiosks", "When a device lacks a serial console port"],
    correct: 2,
    why: "Clientless VPN = the browser IS the client. Zero install, works on locked-down/kiosk machines — with less reach than a full client, so scope what it can touch. Branch links and filtering strength are different jobs.",
    topic: "Clientless VPN",
  },
];

const QUIZ_HARD = [
  {
    id: 1,
    q: "SCENARIO — 23:40, storm has cut the HQ↔Yard 7 fiber. The Yard 7 router's WAN ACL was corrupted by a bad deploy. First move?",
    options: ["Retry SSH to 10.30.0.1 until the route returns", "Console via TERM-SRV01, patch S2, fix config", "Wait for the fiber crew, then manage via the GUI", "Push a corrected config through the API"],
    correct: 1,
    why: "Every in-band path (SSH/GUI/API) crosses the dead WAN — waiting or retrying burns the outage window. OOB console via the terminal server is the channel that exists precisely for this moment.",
    topic: "OOB recovery",
  },
  {
    id: 2,
    q: "SCENARIO — VPN logs show contractor a.moreau connected with tunnel=split (V-2203). Policy: contractors get full tunnel + MFA. First action?",
    options: ["Disable MFA checks to avoid confusion", "Block every contractor VPN connection", "Move a.moreau to the clientless portal", "Force full tunnel for the whole role"],
    correct: 3,
    why: "Close the policy gap for the whole ROLE at the gateway (then re-authenticate the session and investigate how the split was accepted). Blocking everyone over-reacts; the clientless portal doesn't fix the policy hole.",
    topic: "VPN policy enforcement",
  },
  {
    id: 3,
    q: "SCENARIO — A legacy switch runs a vendor app that REQUIRES Telnet, and you can't disable it yet. Best compensating control?",
    options: ["ACL TCP/23 to vendor subnet + alerting", "Expose it to the internet for vendor support", "Change Telnet to port 2323 for safety", "Permit Telnet only on weekends"],
    correct: 0,
    why: "Can't remove the risk? Shrink its exposure: least-privilege ACL + full logging/alerting + a dated retirement plan. Port-shuffling isn't encryption, and weekend-only is not a control.",
    topic: "Legacy service controls",
  },
  {
    id: 4,
    q: "SCENARIO — You find a NOC API token committed in a public repo. The audit shows it already called /config/deploy from an unknown IP. Correct sequence?",
    options: ["Leave it — the repo is removed next quarter", "Rename the token and keep using it", "Revoke, audit deploys, restrict, vault", "Disable the entire API for good"],
    correct: 2,
    why: "Assume the leaked token is live until proven dead: revoke first (stops the bleeding), audit what it deployed, tighten source restrictions, and move the secret into a vault. Renaming changes nothing.",
    topic: "Token incident response",
  },
  {
    id: 5,
    q: "SCENARIO — 400 devices need config backups every night at 02:00. Which method, and why?",
    options: ["Web GUI — dashboards prove the backups ran", "API scheduled jobs — scriptable at scale", "Console sessions to each device nightly", "SSH interactively, one box at a time"],
    correct: 1,
    why: "Automation at scale is the API's reason to exist. GUI/console/interactive-SSH are per-device human actions — fine for spot checks, hopeless at 400×365. Dashboards show results; they don't run the backups.",
    topic: "Scale & automation",
  },
  {
    id: 6,
    q: "SCENARIO — Leadership wants split tunnel for EVERYONE so video calls run smoother. Best answer as the network admin?",
    options: ["Risk-based split by role, monitored", "Agree — bandwidth beats security", "Refuse permanently, no discussion", "Switch everyone to Telnet to save CPU"],
    correct: 0,
    why: "Split tunnel is a trade-off decision, not a slogan: grant it deliberately, scoped by role (contractors and high-risk users stay full tunnel), with monitoring on the bypassed traffic. Blanket yes/no answers skip the analysis.",
    topic: "Split-tunnel governance",
  },
  {
    id: 7,
    q: "SCENARIO — Audit finds a switch running 'ip ssh version 1' with a 768-bit RSA key. Correct remediation?",
    options: ["Enable Telnet as the fallback path", "Move SSH to another port and move on", "Disable SSH, keep the plain HTTP GUI", "SSH v2 only + 2048-bit host key"],
    correct: 3,
    why: "SSHv1 has cryptographic design flaws and 768-bit keys are within reach of determined attackers. Version 2 + strong keys (2048+ RSA, or ECDSA/Ed25519) is the fix — then re-verify clients can connect. Telnet or port-shuffling fixes nothing.",
    topic: "SSH hardening",
  },
];
