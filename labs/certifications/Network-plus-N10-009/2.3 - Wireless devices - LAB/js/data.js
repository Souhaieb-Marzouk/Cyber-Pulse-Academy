// ── Over the Air: Northwind Regional Library — Wireless Commissioning Lab ───
// js/data.js — ALL lab content: synthetic environment seed, glossary,
// knowledge core, debrief blocks, quiz bank, labels and options.
// Every MAC, vendor, hostname and network below is FICTIONAL training data.
// Content is carried over 1:1 from the original framework lab.
"use strict";

// ── Persistence key (identical to the original lab) ──────────────────────────
var STORAGE_KEY = "northwind-wifi-commissioning-lab-v1";

var BAND_LABEL = { "2.4": "2.4 GHz", "5": "5 GHz", "6": "6 GHz" };
var BAND_COLOR = { "2.4": "#B45309", "5": "#0F766E", "6": "#6D28D9" };
// Simplified ring-radius attenuation factor per band (labeled "simplified" in the UI)
var BAND_FACTOR = { "2.4": 1.25, "5": 1.0, "6": 0.75 };

// Channel choices offered per band (regulatory domain: FCC-class, labeled simplified)
var CHANNELS_24 = [1, 3, 6, 9, 11];
var DFS_CHANNELS = [52, 56, 60, 64, 100, 104];
var CHANNELS_5 = [36, 40, 44, 48].concat(DFS_CHANNELS, [149, 153, 157, 161]);
var CHANNELS_6 = [5, 21, 37, 53, 69, 85]; // valid 20 MHz numbering, sampled
var WIDTHS = { "2.4": [20, 40], "5": [20, 40, 80, 160], "6": [20, 40, 80, 160] };

var SECURITY_OPTIONS = [
  { value: "open", label: "Open (no encryption)", note: "Anyone can read the traffic. Even guests deserve better." },
  { value: "wep", label: "WEP", note: "Broken for two decades. Cracked in minutes." },
  { value: "wpa-tkip", label: "WPA (TKIP)", note: "1999 stop-gap cipher. Deprecated and banned by later standards." },
  { value: "wpa2-tkip", label: "WPA2 (TKIP)", note: "Still the weak cipher inside a modern shell." },
  { value: "wpa2-ccmp", label: "WPA2 (CCMP / AES)", note: "The 2004–2018 workhorse. Acceptable floor for legacy-only devices." },
  { value: "wpa2wpa3", label: "WPA2/WPA3 transition (CCMP+GCMP)", note: "Serves older clients while WPA3 clients get SAE." },
  { value: "wpa3-sae", label: "WPA3-Personal (SAE / GCMP)", note: "Modern personal security; SAE resists offline password guessing." },
  { value: "wpa3-ent", label: "WPA3-Enterprise (802.1X / GCMP)", note: "Per-user credentials via RADIUS. The staff-network gold standard." },
];

var AP_KIND_LABEL = {
  dedicated: "Dedicated / autonomous AP",
  integrated: "Integrated AP (SOHO router)",
  repeater: "Repeater / extender",
  bridge: "Point-to-point bridge",
};

var ANTENNA_LABEL = {
  omni: "Omnidirectional — even donut of coverage",
  panel: "Directional panel — one hemisphere, inward",
  yagi: "Directional Yagi — long, narrow beam",
};

// ── Floor plan geometry (viewBox 0 0 820 570) ────────────────────────────────
var PLAN_ZONES = [
  { id: "reading", x: 40, y: 40, w: 300, h: 250, label: "READING HALL" },
  { id: "stacks", x: 40, y: 310, w: 240, h: 140, label: "STACKS" },
  { id: "staff", x: 360, y: 40, w: 180, h: 140, label: "STAFF WING" },
  { id: "lab", x: 360, y: 200, w: 180, h: 120, label: "COMMUNITY LAB" },
  { id: "cafe", x: 560, y: 200, w: 200, h: 250, label: "CAFÉ" },
  { id: "annex", x: 560, y: 40, w: 200, h: 110, label: "ANNEX (ROOF)" },
];

var PLAN_SLOTS = [
  { id: "A1", x: 190, y: 165, zone: "Reading Hall — center ceiling", hint: "Open hall,serve the whole room" },
  { id: "A2", x: 310, y: 250, zone: "Reading Hall — east wall", hint: "East edge of the hall" },
  { id: "S1", x: 160, y: 380, zone: "Stacks — aisle junction", hint: "Dead zone among metal shelves" },
  { id: "W1", x: 450, y: 110, zone: "Staff Wing — office core", hint: "Staff-only area" },
  { id: "L1", x: 450, y: 260, zone: "Community Lab — rear", hint: "Training lab room" },
  { id: "C1", x: 660, y: 330, zone: "Café — window wall", hint: "Faces the parking lot!" },
  { id: "X1", x: 660, y: 95, zone: "Annex roof", hint: "Line-of-sight to the annex" },
];

// ── AP fleet (pristine state deliberately flawed) ────────────────────────────
var INITIAL_APS = [
  {
    id: "AP-1", label: "AP-1 · Reading Hall", kind: "dedicated", slotId: "A1",
    bands: ["2.4", "5", "6"],
    radios: { "2.4": { channel: 6, widthMhz: 20 }, "5": { channel: 36, widthMhz: 80 }, "6": { channel: 37, widthMhz: 80 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "AP-2", label: "AP-2 · Reading Hall east", kind: "dedicated", slotId: "A2",
    bands: ["2.4", "5"],
    radios: { "2.4": { channel: 6, widthMhz: 20 }, "5": { channel: 36, widthMhz: 80 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "AP-3", label: "AP-3 · Café window", kind: "dedicated", slotId: "C1",
    bands: ["2.4", "5"],
    radios: { "2.4": { channel: 6, widthMhz: 20 }, "5": { channel: 36, widthMhz: 80 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "AP-4", label: "AP-4 · Community Lab", kind: "dedicated", slotId: "L1",
    bands: ["2.4", "5", "6"],
    radios: { "2.4": { channel: 6, widthMhz: 20 }, "5": { channel: 36, widthMhz: 80 }, "6": { channel: 37, widthMhz: 80 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "R-1", label: "R-1 · unassigned extender", kind: "repeater", slotId: null,
    bands: ["2.4"], radios: { "2.4": { channel: null, widthMhz: 20 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "BR-1", label: "BR-1 · unassigned bridge", kind: "bridge", slotId: null,
    bands: ["5"], radios: { "5": { channel: null, widthMhz: 80 } },
    powerMw: 100, antenna: "omni",
  },
  {
    id: "GW-1", label: "GW-1 · unassigned SOHO router", kind: "integrated", slotId: null,
    bands: ["2.4"], radios: { "2.4": { channel: 1, widthMhz: 20 } },
    powerMw: 100, antenna: "omni",
  },
];

// ── SSID rack (pristine state deliberately flawed) ───────────────────────────
var INITIAL_SSIDS = [
  { id: "staff", name: "NW-Staff", hidden: false, security: "wpa2-ccmp", authType: "psk", radiusHost: "", radiusPort: "", isolation: false, portal: false, vlan: "10", rateLimitMbps: 0 },
  { id: "guest", name: "linksys", hidden: true, security: "wep", authType: "psk", radiusHost: "", radiusPort: "", isolation: false, portal: false, vlan: "", rateLimitMbps: 0 },
  { id: "iot", name: "NW-IoT", hidden: false, security: "wpa-tkip", authType: "psk", radiusHost: "", radiusPort: "", isolation: false, portal: false, vlan: "30", rateLimitMbps: 0 },
];

// ── Air Analyzer: one sweep of the 2.4/5 GHz bands (synthetic capture) ───────
var BEACONS = [
  { id: "b1", ssid: "NW-Staff", bssid: "0C:80:63:11:02:A1", band: "5", channel: 36, rssi: -52, cipher: "WPA3 (GCMP)", auth: "802.1X", vendor: "Meridian Networks", flags: ["IN CONTROLLER INVENTORY"], note: "Our staff fleet vendor." },
  { id: "b2", ssid: "NW-Staff", bssid: "0C:80:63:11:02:A2", band: "5", channel: 52, rssi: -63, cipher: "WPA3 (GCMP)", auth: "802.1X", vendor: "Meridian Networks", flags: ["IN CONTROLLER INVENTORY", "DFS"], note: "Radar-protected channel." },
  { id: "b3", ssid: "NW-Guest", bssid: "0C:80:63:11:02:B1", band: "2.4", channel: 6, rssi: -58, cipher: "WPA2/WPA3 (CCMP)", auth: "Captive portal", vendor: "Meridian Networks", flags: ["IN CONTROLLER INVENTORY"], note: "Our guest SSID." },
  { id: "b4", ssid: "Northwind-Guest", bssid: "9C:2F:1A:44:7C:09", band: "2.4", channel: 11, rssi: -41, cipher: "Open (none)", auth: "Open", vendor: "AirCess", flags: ["OPEN", "STRONGEST SIGNAL IN BAND"], note: "Same name as our guest SSID. Not our vendor." },
  { id: "b5", ssid: "NW-IoT", bssid: "0C:80:63:11:02:C1", band: "2.4", channel: 1, rssi: -66, cipher: "WPA2 (CCMP)", auth: "PSK", vendor: "Meridian Networks", flags: ["IN CONTROLLER INVENTORY"], note: "Camera & sensor network." },
  { id: "b6", ssid: "CafeCorner_Guest", bssid: "4A:6B:2D:90:E3:11", band: "2.4", channel: 3, rssi: -71, cipher: "WPA2 (CCMP)", auth: "PSK", vendor: "Tandem Systems", flags: [], note: "Channel 3 overlaps channel 1 and 6." },
  { id: "b7", ssid: "HPL-PrintDirect", bssid: "3E:71:C4:58:0F:2A", band: "2.4", channel: 9, rssi: -74, cipher: "Open (none)", auth: "Ad hoc (IBSS)", vendor: "PrintKraft", flags: ["AD HOC"], note: "Laptop-to-laptop style network, no AP." },
  { id: "b8", ssid: "Maya-Phone-Hotspot", bssid: "A2:D9:3B:77:12:C4", band: "5", channel: 149, rssi: -67, cipher: "WPA2 (CCMP)", auth: "PSK", vendor: "Sundial Mobile", flags: ["PERSONAL HOTSPOT"], note: "Tethering radio inside the building." },
  { id: "b9", ssid: "NW-Ext-Old", bssid: "0C:80:63:31:07:55", band: "2.4", channel: 6, rssi: -69, cipher: "WEP", auth: "PSK", vendor: "Meridian Networks", flags: ["LEGACY"], note: "Our vendor OUI — an ancient extender nobody remembered." },
];

var CONTROLLER_INVENTORY_NOTE =
  "Controller inventory says the following BSSIDs are legitimate: 0C:80:63:11:02:A1, 0C:80:63:11:02:A2, 0C:80:63:11:02:B1, 0C:80:63:11:02:C1 (all vendor Meridian Networks).";

var SURVEY_LOG = [
  "12:04  Break-room microwave cycle — brief 2.4 GHz noise-floor spike. Expected, not a device.",
  "12:31  CafeCorner_Guest visible from the lobby at stable RSSI — unchanged since the original site survey.",
  "12:47  NEW BEACON 'Northwind-Guest' BSSID 9C:2F:1A:44:7C:09 — not present in the controller inventory.",
  "12:52  North reading tables: three patrons report a 'sign in with library card number' page on 'Northwind-Guest'.",
];

var TICKETS = [
  {
    id: "T-101",
    title: "Stacks aisle 4 — constant drops",
    body: "Patrons in the stacks keep losing 'NW-Staff'. Phones prefer it because it's the only network that reaches aisle 4, but pages take forever and sessions drop. A maintenance note from 2016 mentions an 'extender' still plugged in back there.",
    from: "Circulation desk",
  },
  {
    id: "T-102",
    title: "Full bars in parking lot B?",
    body: "I'm sitting in parking lot B with my phone on 'NW-Guest' — full bars and the portal loads. Should the library's guest Wi-Fi really reach out here?",
    from: "Café regular",
  },
  {
    id: "T-103",
    title: "Suspicious 'Northwind-Guest'",
    body: "A network called 'Northwind-Guest' with no password asked three of us to 'sign in with library card number' at the north tables. The bars were stronger than the real guest network usually is.",
    from: "Front desk",
  },
];

// ── Guest isolation test rig (synthetic verification) ────────────────────────
function runGuestChecks(ssids) {
  var guest = null;
  for (var i = 0; i < ssids.length; i++) if (ssids[i].id === "guest") guest = ssids[i];
  if (!guest) return [];
  return [
    { label: "Captive portal reachable from guest client", ok: guest.portal },
    { label: "Staff file share (VLAN 10) UNREACHABLE from guest", ok: guest.isolation && guest.vlan === "60" },
    { label: "Guest traffic tagged into its own VLAN (60)", ok: guest.vlan === "60" },
    { label: "Rate cap applied (≤ 10 Mbps)", ok: guest.rateLimitMbps > 0 && guest.rateLimitMbps <= 10 },
  ];
}

// ── Knowledge Core (Sheet 02), glossary, and Debrief (Sheet 06) content ──────
var GLOSSARY = [
  { term: "SSID", def: "The network name an AP advertises — what clients see and select. Max 32 octets." },
  { term: "BSSID", def: "The MAC address of one AP radio. The only reliable way to tell a clone from the original." },
  { term: "ESSID", def: "One logical network (name) spread across many APs so clients can roam seamlessly." },
  { term: "Channel bonding", def: "Widening a channel (40/80/160 MHz) for throughput — at the cost of overlapping more neighbors." },
  { term: "DFS", def: "Dynamic Frequency Selection: 5 GHz radar-protected channels that an AP must vacate within minutes when radar appears." },
  { term: "WEP", def: "1999-era encryption with a broken RC4 implementation — crackable in minutes. Never acceptable." },
  { term: "TKIP", def: "WPA's emergency cipher (still RC4-based). Deprecated; banned by later 802.11 revisions." },
  { term: "CCMP", def: "WPA2's cipher: AES in Counter Mode with CBC-MAC. The 2004–2018 workhorse." },
  { term: "GCMP", def: "WPA3's cipher (AES-GCMP), paired with mandatory Protected Management Frames (PMF)." },
  { term: "SAE", def: "WPA3-Personal's handshake (Dragonfly) that replaces the pre-shared key and resists offline dictionary attacks." },
  { term: "802.1X", def: "Port-based authentication framework. In Wi-Fi, the enterprise path: the AP relays EAP to a backend." },
  { term: "RADIUS", def: "The AAA server behind 802.1X — validates credentials (often against LDAP/AD/SSO) and returns policy like VLAN." },
  { term: "Captive portal", def: "The browser interstitial (terms, room number, credentials) that gates and logs guest access." },
  { term: "Client isolation", def: "AP-level blocking of client-to-client traffic — guests see the internet, not each other or the LAN." },
  { term: "Evil twin", def: "A rogue AP cloning a legitimate SSID to lure devices and harvest data — ATT&CK T1557.004." },
];

var INLINE_TERMS = {
  "WPS": "Wi-Fi Protected Setup: push-button/PIN onboarding. Its PIN check accepts half-guesses — disable it.",
  "MIMO": "Multiple Input, Multiple Output: several antennas/radios sending parallel streams for speed and reliability.",
  "MU-MIMO": "Multi-User MIMO: the AP serves several clients with simultaneous streams instead of taking turns.",
  "dBi": "Antenna gain in decibels vs an ideal isotropic radiator. More dBi = a narrower, longer-reaching beam — not more total energy.",
  "Yagi": "A directional antenna with a long, narrow beam — the classic building-to-building link choice.",
  "CAPWAP": "Control And Provisioning of Wireless APs: the tunnel protocol lightweight APs use to talk to a WLAN controller.",
  "WLC": "Wireless LAN Controller: the brain that centrally configures and supervises lightweight APs.",
  "IBSS": "Independent Basic Service Set — 'ad hoc': clients talk directly with no AP in the middle.",
  "WPAN": "Wireless Personal Area Network: body-scale radios like Bluetooth and Zigbee.",
  "OWE": "Opportunistic Wireless Encryption: encryption for otherwise-open networks, no password — better than nothing.",
  "PMF": "Protected Management Frames: encrypts deauth/disassoc management traffic, blunting trivial deauth tricks.",
  "DCS": "Dynamic Channel Selection: the AP auto-picks a less busy channel from what it hears.",
  "Band steering": "Nudging dual-band clients toward 5/6 GHz to relieve the 2.4 GHz band.",
  "Rogue AP": "Any wireless AP on the air that is not sanctioned by the network owner — the config or the device is unauthorized.",
  "T1557.004": "MITRE ATT&CK sub-technique 'Adversary-in-the-Middle: Evil Twin' — tactics: Credential Access, Collection.",
};

var REFERENCE = [
  {
    id: "why",
    title: "Why configuring wireless well IS security",
    kicker: "Objective 2.3 framing",
    paragraphs: [
      "A wireless network is the only part of your infrastructure that is installed in public. The floor plan stops at the wall; the RF does not. Every choice in this lesson — band, channel, SSID, encryption, authentication, antenna, AP type — is simultaneously a performance decision and a security decision, because each one defines where the network's edge physically sits and who can stand on it.",
      "Objective 2.3 of CompTIA Network+ N10-009 ('Given a scenario, install and configure wireless networks') tests exactly this duality: you are graded on deploying a working network AND on the defensive properties of that deployment. The exam's sub-topics are channels, frequency options, SSID, network types, encryption, guest networks, authentication, antennas, and access points — this lab turns each into a hands-on exercise.",
    ],
  },
  {
    id: "bands",
    title: "Frequency options: the three bands",
    kicker: "Trade-offs first",
    paragraphs: [
      "Band selection is the first fork in any wireless design, because the band decides range, congestion and client compatibility all at once. Higher frequency buys more spectrum but attenuates faster — it goes through fewer walls and covers less floor for the same transmit power.",
    ],
    table: {
      head: ["Band", "Channels (20 MHz)", "Range/penetration", "Congestion", "Client support"],
      rows: [
        ["2.4 GHz", "3 non-overlapping (1/6/11, FCC)", "Longest, best through walls", "Worst: microwaves, Bluetooth, legacy IoT", "Everything, including 2005 hardware"],
        ["5 GHz", "Many (24+, incl. DFS 52–144)", "Medium", "Moderate", "Wi-Fi 4/5/6-era and newer"],
        ["6 GHz", "Widest allocation (~1200 MHz)", "Shortest", "Cleanest — no legacy devices", "Wi-Fi 6E/7 only (802.11ax on 6 GHz, 802.11be)"],
      ],
    },
    bullets: [
      "60 GHz (WiGig, 802.11ad/ay) exists for ultra-short, ultra-wide links (docks, VR) — niche, not part of exam scenarios beyond recognition.",
      "Rule of thumb: legacy and low-data IoT live on 2.4 GHz; capacity clients move to 5/6 GHz (band steering automates the nudge).",
    ],
  },
  {
    id: "channels",
    title: "Channels, bonding and DFS",
    kicker: "Sharing the air politely",
    paragraphs: [
      "Wi-Fi is a shared medium: two transmitters on the same channel (co-channel) take turns and slow each other; two on overlapping channels (adjacent-channel) corrupt each other's frames — worse than co-channel. In 2.4 GHz, only 1, 6 and 11 (FCC domain) are pairwise non-overlapping at 20 MHz.",
      "Channel bonding widens a channel to carry more data — 40/80/160 MHz. Bonding in 5/6 GHz is usually a win; bonding 2.4 GHz to 40 MHz overlaps your neighbors and re-imports the congestion you just engineered away. Width is a per-band policy.",
      "DFS channels (5 GHz, roughly 52–144) are shared with radar: when radar pulses appear, the AP must evacuate within minutes. That is an obligation, not an inconvenience to configure away — but DFS channels are plentiful and should be used deliberately.",
    ],
  },
  {
    id: "ssid",
    title: "SSID, BSSID, ESSID — and the 'hidden network' myth",
    kicker: "Names are not secrets",
    paragraphs: [
      "The SSID is the name; the BSSID is the MAC of one specific AP radio; the ESSID is one name spanning many APs for roaming. The BSSID is your forensic anchor: when two beacons carry the same SSID, only the BSSID (plus vendor OUI) tells clone from original.",
      "Hiding an SSID disables beacon broadcasting but the AP still answers probes and every client that ever joined re-announces the name from its Preferred Network List. Free scanners recover it in seconds. Hiding is not a security control — it is a support-ticket generator. Authentication is the control.",
    ],
  },
  {
    id: "types",
    title: "Network types: WLAN, WPAN, mesh, ad hoc",
    kicker: "Topology is threat surface",
    paragraphs: [
      "WLAN (infrastructure): clients talk through APs — controllable, monitorable, the default. WPAN: body-scale radios (Bluetooth fobs, Zigbee sensors) — often forgotten in inventories. Mesh: APs relay among themselves to cover cable-hostile sites; secure the backhaul like a trunk. Ad hoc (IBSS): clients talk directly with no AP — bypasses every portal and NAC you run, so most enterprises ban it. Hotspot/tethering: a phone shares its cellular link — unmonitored data egress from inside your building.",
    ],
  },
  {
    id: "encryption",
    title: "The encryption ladder",
    kicker: "WEP → WPA → WPA2 → WPA3",
    paragraphs: [
      "Each rung of the ladder exists because the rung below was broken. WEP (RC4, 1999) falls in minutes. WPA (TKIP) was its emergency patch — deprecated since. WPA2 (CCMP/AES, 2004) was the standard for 14 years and remains the floor for legacy-only devices. WPA3 (2018) brings GCMP, mandatory Protected Management Frames, and SAE — the handshake that finally makes offline passphrase cracking impractical.",
      "Real fleets are mixed, so the transition mode (WPA2/WPA3) serves older clients while WPA3-capable ones negotiate SAE. The policy rule: WEP and TKIP are evicted, not tolerated; 'strongest sensible' means the strongest mode every client on that SSID can actually use.",
    ],
    table: {
      head: ["Mode", "Cipher", "Personal auth", "Enterprise auth", "Verdict"],
      rows: [
        ["WEP", "RC4", "Static key", "—", "Broken. Evict."],
        ["WPA", "TKIP (RC4)", "PSK", "802.1X", "Deprecated. Evict."],
        ["WPA2", "CCMP (AES)", "PSK", "802.1X", "Acceptable floor (CCMP only)."],
        ["WPA2/WPA3", "CCMP+GCMP", "PSK / SAE", "802.1X", "Transition mode for mixed fleets."],
        ["WPA3", "GCMP + PMF", "SAE", "802.1X", "Target state."],
      ],
    },
  },
  {
    id: "guest",
    title: "Guest networks: four controls",
    kicker: "Hospitality with a fence",
    paragraphs: [
      "A guest network is a service you offer strangers on infrastructure you own — so you contain first, then identify, then constrain. The four standard controls: client isolation (guests cannot see each other or the LAN), a captive portal (terms + accountability + logging), a dedicated VLAN (traffic leaves the staff world entirely), and a rate cap (one patron cannot starve the hall).",
      "The order matters when deploying: isolation before portal means an unauthenticated visitor is contained, not just unidentified. And verification is part of the configuration: test from a guest device that the staff share is NOT reachable. Trust toggles only after the rig passes.",
    ],
  },
  {
    id: "auth",
    title: "Authentication paths",
    kicker: "From open to per-user",
    paragraphs: [
      "Open: no gate — acceptable only with OWE-style encryption or on a fully isolated guest fence. Personal (PSK/SAE): one shared secret (WPA2) or a resistant handshake (WPA3-SAE) — fine for homes and small sites, weak for organizations because one leaked passphrase compromises everyone with no per-user trail.",
      "Enterprise: 802.1X/EAP — the AP is only a relay; a RADIUS (AAA) server validates each user, typically against the directory (LDAP/Active Directory/SSO), and can push per-user policy like VLAN. Offboarding becomes a delete-keypress, and the RADIUS log answers 'who was on the staff network at 12:47'.",
      "WPS: push-button/PIN onboarding designed for convenience. Its PIN verification accepts guesses in halves, collapsing the search space — an online brute force recovers it quickly (the attack family ATT&CK catalogs as T1110 Brute Force). Policy: disable WPS everywhere.",
      "Captive portals authenticate guests for accountability — they are a log, not a fence; isolation and VLAN do the fencing.",
    ],
  },
  {
    id: "antennas",
    title: "Antennas: shaping the edge",
    kicker: "Pattern is policy",
    paragraphs: [
      "An omnidirectional antenna radiates a donut: even coverage, everywhere — including where you don't own floor. Directional antennas (panel, Yagi, parabolic dish) trade breadth for reach: a panel throws one hemisphere inward at a glass wall; a Yagi makes the long building-to-building hop. Gain (dBi) reshapes the same energy into narrower beams — it does not create more.",
      "MIMO/MU-MIMO is the radio-level cousin: several antennas transmit parallel streams (to one user, or multiple users simultaneously) for speed and reliability. And transmit power is a coverage decision too: every milliwatt past the wall is unauthorized reach — see the parking-lot ticket in this lab.",
    ],
  },
  {
    id: "aps",
    title: "Access point types",
    kicker: "Right brain for the job",
    paragraphs: [
      "Dedicated/autonomous AP: full-featured, self-configured — the workhorse of small sites. Integrated AP: the Wi-Fi inside a SOHO router — fine for one office; beware convenience features like WPS. Lightweight AP + WLAN controller (CAPWAP): enterprise fleets push config from one brain — consistency at scale. Repeater/extender: relays a cell where cabling stops — half-duplex overhead, last-resort tool. Bridge: point-to-point link between buildings on a dedicated channel. Mesh node: APs backhaul among themselves. Cloud-managed: controller logic in the vendor's cloud.",
    ],
  },
  {
    id: "defense",
    title: "Defense context: where this appears in MITRE ATT&CK",
    kicker: "Verified mapping",
    paragraphs: [
      "ATT&CK documents 'Adversary-in-the-Middle: Evil Twin' (T1557.004, tactics: Credential Access and Collection): adversaries host seemingly genuine Wi-Fi APs, cloning SSIDs, offering stronger signal, and answering probe requests for known networks; victims meet fake captive portals that harvest credentials. ATT&CK explicitly names libraries among the high-concentration public-Wi-Fi locations targeted.",
      "Its official mitigations are M1031 (Network Intrusion Prevention — WIPS scanning for evil twins/rogue APs) and M1017 (User Training — suspicion of open networks and certificate errors). Its detection strategy (DET0379 / analytic AN1069) hunts beacons with the same SSID but unexpected BSSIDs or inconsistent encryption. Open networks invite T1040 (Network Sniffing); WPS PINs fall to the T1110 (Brute Force) family. The countermeasure lens is D3-NTA (Network Traffic Analysis) — watch the air like you watch the wire.",
    ],
  },
];

var DEBRIEF_DETECTION = {
  title: "Detection opportunities",
  kicker: "What a defender watches",
  bullets: [
    "Wireless controller logs — the ground truth inventory. Example analytic (after MITRE DET0379/AN1069): alert when a beacon's SSID matches a corporate SSID but its BSSID is not in the controller inventory, or its cipher differs from the corporate profile.",
    "Spectrum analyzer / site survey sweeps — catches transmitters that never join your controller, including ad hoc IBSS nets and hotspots; also separates 'rogue device' from 'microwave oven'.",
    "WIPS (Wireless Intrusion Prevention) — continuous evil-twin and rogue-AP scanning (official mitigation M1031 for T1557.004).",
    "Client-side signals — sudden 'certificate error' spikes or portal pages that differ from the corporate template (feeds user training, M1017).",
    "Anomaly example in plain words: 'beacon Northwind-Guest appeared 12:47, vendor not in fleet, open cipher, RSSI -41 (strongest in band)' → rogue, triangulate by RSSI, then physically locate.",
  ],
};

var DEBRIEF_MITIGATION = {
  title: "Mitigation recommendations",
  kicker: "Controls with receipts",
  bullets: [
    "Staff: WPA3-Enterprise via 802.1X → RADIUS tied to the directory (per-user credentials, instant offboarding). Residual: legacy exceptions go on a fenced VLAN.",
    "Guest: dedicated SSID + VLAN 60, client isolation, captive portal, rate cap — and VERIFY with a test rig, not trust. Residual: portal logs who, isolation fences where.",
    "Kill WEP/TKIP (decommission or firmware-lift devices) and disable WPS fleet-wide (PIN brute force, cf. T1110).",
    "WIPS monitoring per official T1557.004 mitigation M1031 + user training per M1017 ('that open clone with the stronger bars is the trap').",
    "RF hygiene: DFS compliance documented, antenna patterns shaped at exterior walls (panel inward), power budgets reviewed — every milliwatt past the wall is someone else's coverage area.",
    "Countermeasure lens: D3-NTA (Network Traffic Analysis) — treat the air as traffic you analyze, not a utility you assume.",
  ],
};

var DEBRIEF_BLUE = {
  title: "Blue-team takeaways",
  kicker: "Operate like commissioning",
  bullets: [
    "Configuration is evidence: an as-built sheet (what is on the air, where, with which crypto) is your baseline for every future 'new beacon' alert.",
    "Test, don't trust: the guest isolation rig, the channel plan and the exterior survey are acceptance tests — rerun them after every change.",
    "Inventory beats memory: the clone was provable ONLY because the controller inventory existed to diff against.",
    "Legacy crypto returns through procurement: quarterly re-scan for WEP/TKIP/WPS, not a one-time purge.",
  ],
};

var DEBRIEF_RED = {
  title: "Red-team mindset (defensive use)",
  kicker: "Know why the tricks work",
  bullets: [
    "An evil twin needs no exploits: clone the name, run open, out-signal the real AP, wait — devices with a hidden-SSID PNL or a user chasing bars do the rest. Which is exactly why inventory + WIPS + training exist.",
    "The 4-way handshake of a PSK network is a gift to offline crackers — SAE exists because of this. Know which of your SSIDs still use PSK.",
    "RF leaves the building at the speed of light: the parking-lot bleed ticket is a real intrusion path (unauthorized reach) — pattern and power are controls.",
    "Every forgotten device (a 2016 WEP extender) is a standing invitation; your own fleet vendor's OUI on an unknown BSSID is the finding worth escalating.",
  ],
};

var LINKS = [
  { label: "MITRE ATT&CK — T1557.004 Evil Twin", href: "https://attack.mitre.org/techniques/T1557/004/", note: "The technique this lab's rogue AP emulates (tactics: Credential Access, Collection)." },
  { label: "MITRE ATT&CK — T1557 Adversary-in-the-Middle", href: "https://attack.mitre.org/techniques/T1557/", note: "Parent technique and its other sub-techniques." },
  { label: "MITRE ATT&CK — Detection Strategy DET0379", href: "https://attack.mitre.org/detectionstrategies/DET0379/", note: "The evil-twin detection analytic this lab's debrief paraphrases." },
  { label: "MITRE D3FEND — D3-NTA Network Traffic Analysis", href: "https://d3fend.mitre.org/technique/d3f:NetworkTrafficAnalysis", note: "The countermeasure lens for watching the air." },
  { label: "CompTIA Network+ N10-009", href: "https://www.comptia.org/en-us/certifications/network/", note: "Official certification page — objective 2.3 bullet list." },
];

var PILLAR_META = {
  P1: { label: "Understand", cls: "pillar-p1" },
  P2: { label: "Recognize", cls: "pillar-p2" },
  P3: { label: "Detect / Verify", cls: "pillar-p3" },
  P4: { label: "Mitigate", cls: "pillar-p4" },
};

// ── Knowledge check: Medium concept quiz (7) + Hard scenario exam (7) ────────
// Item discipline (audited to the B3/R4/R5 standard):
//  - correct-answer positions rotate (Medium: 2,0,3,1,3,0,2 · Hard: 3,0,2,0,3,1,2)
//  - the correct option is never the longest; all options are length- and
//    tone-matched so formatting never gives the answer away
var QUIZ_MEDIUM = [
  {
    id: "QM1", mode: "medium", topic: "2.4 GHz channel plan",
    q: "Which channel set provides the three non-overlapping 20 MHz channels in the 2.4 GHz band (FCC region)?",
    options: ["1, 3, and 5", "2, 7, and 12", "1, 6, and 11", "3, 6, and 9"],
    answer: 2,
    why: "1, 6 and 11 sit far enough apart that their 20 MHz skirts never touch — the only such trio in the band. Channels 3 and 9 fall between the classic anchors and overlap BOTH neighbors (so options 1 and 4 just spread the congestion around), and 12 exceeds the FCC 1–11 range while 2/7 collide anyway (option 2).",
  },
  {
    id: "QM2", mode: "medium", topic: "Hidden-SSID myth",
    q: "A colleague hides the staff SSID 'so attackers can't see it'. What is the actual security effect?",
    options: [
      "None — probes and client lists leak the name",
      "Attackers can no longer discover the network at all",
      "The beacons get encrypted against all passive scanners",
      "Evil twins can no longer clone the network name",
    ],
    answer: 0,
    why: "Nothing is hidden from anyone determined: the AP still answers directed probes and every client that ever joined re-announces the name from its Preferred Network List. Discovery is not actually blocked (option 2), beacons were never encrypted by this setting (option 3), and cloning needs no beacon at all — the clone simply broadcasts the same name (option 4). Authentication, not name secrecy, is the control.",
  },
  {
    id: "QM3", mode: "medium", topic: "WPA3 / SAE",
    q: "WPA3-Personal's SAE handshake replaces which mechanism, and resists which attack?",
    options: [
      "Replaces CCMP; resists rainbow tables",
      "Replaces WPS; resists evil twins",
      "Replaces 802.1X; resists deauth floods",
      "Replaces PSK; resists offline guessing",
    ],
    answer: 3,
    why: "SAE (Dragonfly) swaps the pre-shared key handshake for one where each passphrase guess demands an online exchange — so a captured handshake can no longer be cracked offline at GPU speed. CCMP is a cipher, not a handshake (option 1); WPS onboarding and 802.1X relaying are different mechanisms entirely (options 2 and 3).",
  },
  {
    id: "QM4", mode: "medium", topic: "Guest fencing",
    q: "Which single control stops a guest client from reaching the staff file server?",
    options: [
      "The 10 Mbps rate cap",
      "Client isolation + dedicated VLAN",
      "The captive portal login page",
      "Disabling the SSID broadcast setting",
    ],
    answer: 1,
    why: "Isolation blocks guest-to-LAN frames at the AP and a dedicated VLAN cuts the Layer-2/3 path entirely — the file server simply is not reachable. The portal only gates WHO logs in (option 3), the rate cap only limits bandwidth (option 1), and broadcast settings affect discoverability, never reachability (option 4).",
  },
  {
    id: "QM5", mode: "medium", topic: "Band trade-offs",
    q: "Compared with 2.4 GHz, what does the 5 GHz band offer?",
    options: [
      "Better wall penetration and fewer usable channels",
      "Longer effective range but more interference overall",
      "The same channel count at higher transmit power",
      "More channels and less congestion, shorter range",
    ],
    answer: 3,
    why: "Higher frequency buys spectrum — many more non-overlapping channels and less legacy congestion — but attenuates faster, so range and wall penetration drop. That physics is why 2.4 GHz still 'reaches' while drowning in noise. Penetration does not improve (option 1), range does not grow (option 2), and power limits never change the channel count (option 3).",
  },
  {
    id: "QM6", mode: "medium", topic: "DFS obligations",
    q: "A DFS channel such as 52 looks attractive for capacity. What obligation comes with it?",
    options: [
      "The AP must vacate when radar is detected",
      "The AP must lower power below 50 mW",
      "Only 20 MHz operation is permitted on it",
      "Clients must re-authenticate against the portal",
    ],
    answer: 0,
    why: "Dynamic Frequency Selection protects weather and military radar: the moment radar pulses appear, the AP must leave the channel — a regulatory obligation, not a preference. It is why capacity planning treats DFS channels as 'plentiful but hop-prone'. Power limits (option 2), width restrictions (option 3) and portal re-auth (option 4) are not part of the DFS rules.",
  },
  {
    id: "QM7", mode: "medium", topic: "802.1X / RADIUS",
    q: "In an enterprise deployment, 802.1X on the Wi-Fi network hands credentials to which backend for validation?",
    options: [
      "The AP's local user list",
      "The site's DHCP server",
      "A RADIUS (AAA) server",
      "The captive portal service",
    ],
    answer: 2,
    why: "The AP is only the authenticator: it relays the EAP exchange to a RADIUS server, which validates the credentials — usually against the directory (LDAP/AD/SSO) — and returns policy such as VLAN assignment. DHCP only hands out addresses (option 2), the portal is a guest web-gate (option 4), and the AP keeps no credential store of its own (option 1).",
  },
];

var QUIZ_HARD = [
  {
    id: "QH1", mode: "hard", topic: "Evil-twin identification",
    scenario: "Air sweep: two beacons broadcast 'Airport-Free-WiFi'. Beacon A: BSSID 8C:1F:… vendor matches the airport's AP fleet, WPA3 with portal. Beacon B: BSSID 9C:2F:… vendor unknown, open, RSSI -38 (strongest in band).",
    q: "Which beacon is the evil twin, and which tell gives it away?",
    options: [
      "A — its captive portal branding looks slightly different",
      "A — its RSSI is stronger than the norm",
      "B — its stronger signal alone proves malicious intent",
      "B — cloned SSID, unknown vendor, open encryption",
    ],
    answer: 3,
    why: "B fails every inventory check while mimicking a legitimate name: the BSSID/vendor are absent from the fleet, the cipher is weaker, and the strong signal is the lure — exactly the combination MITRE's DET0379 analytic (T1557.004) hunts for. Signal strength and portal looks prove nothing on their own — a genuine AP can be the strongest (so A's signal is normal, option 2) and branding impressions are not evidence (option 1); signal alone never proves intent (option 3).",
  },
  {
    id: "QH2", mode: "hard", topic: "Band/client compatibility",
    scenario: "A warehouse scanner (2014 model, 2.4 GHz/802.11n radio) cannot see the new 5 GHz-only SSID at all.",
    q: "Root cause and correct fix?",
    options: [
      "Band mismatch — that radio physically cannot see a 5 GHz SSID",
      "Driver corruption — reinstall the wireless driver from the vendor",
      "DFS conflict — move the AP from channel 52 back to 36",
      "Weak signal — raise the AP transmit power to maximum",
    ],
    answer: 0,
    why: "A 2.4 GHz-only radio cannot tune a 5 GHz frequency — no driver, DFS change or power setting changes physics. The fix is a properly secured 2.4 GHz SSID (WPA2-CCMP minimum, fenced VLAN) or hardware refresh. DFS only affects clients already on the band (option 3), drivers add no frequency ranges (option 2), and power never creates spectrum (option 4).",
  },
  {
    id: "QH3", mode: "hard", topic: "DFS behavior",
    scenario: "Monday morning: the AP on channel 100 (DFS) logs radar pulses and switches to channel 36. Two conference-room clients drop for 20 seconds.",
    q: "Why did the AP move, and is this a fault?",
    options: [
      "Rogue interference — someone walked a rogue AP past the room",
      "Width mismatch — the clients negotiated a narrower channel",
      "Regulatory DFS radar evacuation — expected behavior; plan for it",
      "Implementation bug — disable DFS channels across the whole site",
    ],
    answer: 2,
    why: "Radar on a DFS channel legally forces an evacuation; the AP hops and clients re-follow within seconds. It is a designed obligation — document which APs sit on DFS and keep continuity-critical rooms on non-DFS channels. A rogue would surface in the sweep, not in the AP's radar log (option 1); width negotiation does not move center channels (option 2); and abandoning DFS throws away legal spectrum to dodge a non-fault (option 4).",
  },
  {
    id: "QH4", mode: "hard", topic: "Guest isolation",
    scenario: "Guest Wi-Fi has a captive portal, yet a pentest report shows a guest device mounting \\\\filesrv\\finance from the same table.",
    q: "Which missing control explains it, and what closes it?",
    options: [
      "Client isolation plus a dedicated guest VLAN",
      "A tighter rate limit — set it to 10 Mbps",
      "WPA3 on the guest SSID — stronger encryption",
      "A hidden guest SSID — stop advertising it",
    ],
    answer: 0,
    why: "The portal authenticated the guest; it never fenced them. Without client isolation and a dedicated VLAN the guest bridge shares a Layer-2 path with staff resources — mounting \\\\filesrv\\finance is ordinary reachability. Encryption strength (option 3), rate caps (option 2) and SSID hiding (option 4) change none of that path.",
  },
  {
    id: "QH5", mode: "hard", topic: "WPS risk",
    scenario: "An audit finds WPS enabled on 12 branch SOHO routers. Management asks why it matters if the PIN is '8 digits'.",
    q: "The correct justification is:",
    options: [
      "Its PIN check accepts half-guesses — thousands of tries, not billions",
      "Eight digits mean 100 million combinations — purely theoretical at scale",
      "WPS is a proprietary mechanism that attackers have never studied",
      "WPS only matters on networks that still run WEP today",
    ],
    answer: 3,
    why: "WPS's external registrar reveals whether the first half of a PIN guess is right before the second half is tried — the effective search space collapses from 10^8 to roughly 11,000 online attempts. It is a standardized, well-studied protocol (option 2 is false), it is fatal on WPA2 networks too (option 4), and '100 million' is the pre-collapse number, not the real one (option 1).",
  },
  {
    id: "QH6", mode: "hard", topic: "Bridges & antennas",
    scenario: "Two library buildings, 300 m apart, clear line of sight, no cabling path between them.",
    q: "Which AP/antenna arrangement is the textbook solution?",
    options: [
      "Omnidirectional APs on both rooftops, both running at full power",
      "Two dedicated bridges with directional antennas pointed at each other",
      "A repeater mounted halfway, out in the parking lot",
      "Mesh nodes on every floor of both buildings",
    ],
    answer: 1,
    why: "A point-to-point hop is the bridge's job, and directional antennas (Yagi/parabolic) concentrate gain along the path while keeping RF off everything else. Omnis spray coverage in every direction including sideways into the sky (option 1); a parking-lot repeater is a range hack with an outage footprint (option 3); mesh solves multi-floor coverage, not one long hop (option 4).",
  },
  {
    id: "QH7", mode: "hard", topic: "WPA2 vs SAE",
    scenario: "You capture a 4-way handshake from a WPA2-PSK network and one from a WPA3-SAE network.",
    q: "Why is the WPA2 capture more dangerous in an attacker's hands?",
    options: [
      "There is no meaningful security difference once either one is captured",
      "WPA2 handshakes contain the user's password in encrypted form",
      "The WPA2 capture can be brute-forced offline; SAE cannot",
      "WPA3 handshakes expire immediately after their first use",
    ],
    answer: 2,
    why: "A recorded WPA2-PSK handshake lets the attacker verify passphrase guesses offline at full GPU speed — billions per second. SAE is engineered so every guess requires an online interaction with the real AP, which kills offline cracking. WPA2 handshakes never contain the password itself (option 2), WPA3 handshakes do not 'expire' — they are simply not usable for offline verification (option 4), so the captures are absolutely not equivalent (option 1).",
  },
];

// Export to global namespace (classic scripts, no modules — file:// friendly)
window.LabData = {
  STORAGE_KEY: STORAGE_KEY, BAND_LABEL: BAND_LABEL, BAND_COLOR: BAND_COLOR, BAND_FACTOR: BAND_FACTOR,
  CHANNELS_24: CHANNELS_24, DFS_CHANNELS: DFS_CHANNELS, CHANNELS_5: CHANNELS_5, CHANNELS_6: CHANNELS_6,
  WIDTHS: WIDTHS, SECURITY_OPTIONS: SECURITY_OPTIONS, AP_KIND_LABEL: AP_KIND_LABEL, ANTENNA_LABEL: ANTENNA_LABEL,
  PLAN_ZONES: PLAN_ZONES, PLAN_SLOTS: PLAN_SLOTS, INITIAL_APS: INITIAL_APS, INITIAL_SSIDS: INITIAL_SSIDS,
  BEACONS: BEACONS, CONTROLLER_INVENTORY_NOTE: CONTROLLER_INVENTORY_NOTE, SURVEY_LOG: SURVEY_LOG,
  TICKETS: TICKETS, runGuestChecks: runGuestChecks,
  GLOSSARY: GLOSSARY, INLINE_TERMS: INLINE_TERMS, REFERENCE: REFERENCE,
  DEBRIEF_DETECTION: DEBRIEF_DETECTION, DEBRIEF_MITIGATION: DEBRIEF_MITIGATION,
  DEBRIEF_BLUE: DEBRIEF_BLUE, DEBRIEF_RED: DEBRIEF_RED, LINKS: LINKS, PILLAR_META: PILLAR_META,
  QUIZ_MEDIUM: QUIZ_MEDIUM, QUIZ_HARD: QUIZ_HARD,
};
