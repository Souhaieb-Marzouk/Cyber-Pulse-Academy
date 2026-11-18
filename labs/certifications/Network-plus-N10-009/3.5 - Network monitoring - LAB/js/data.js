// SIGNALPATH lab — simulated evidence data (100% synthetic, deterministic)
// Fictional org: Meridian Freight Systems. External IPs use RFC 5737 TEST-NET ranges.
// Static port of src/lib/lab/data.ts (content identical) plus component-level
// constants (DEVICE_NOTES, pollable lists) moved here so data stays separate from logic.
window.SP_DATA = (function () {
  "use strict";

  var SIM_NOTICE =
    "SYNTHETIC TRAINING DATA — Meridian Freight Systems is fictional. External addresses use RFC 5737 documentation ranges. Nothing here is real network evidence.";

  var DEVICES = [
    { id: "ISP", label: "ISP", role: "Upstream carrier", ip: "—", x: 8, y: 22, selectable: false },
    { id: "FW1", label: "FW1", role: "Edge firewall", ip: "10.10.255.1", x: 22, y: 22, selectable: true },
    { id: "R1", label: "R1", role: "HQ core router", ip: "10.10.255.2", x: 38, y: 22, selectable: true },
    { id: "R2", label: "R2", role: "Branch router", ip: "10.40.255.1", x: 38, y: 62, selectable: true },
    { id: "SW1", label: "SW1", role: "HQ core switch", ip: "10.10.255.3", x: 54, y: 22, selectable: true },
    { id: "SW2", label: "SW2", role: "Office access", ip: "10.10.255.4", x: 72, y: 8, selectable: true },
    { id: "SW3", label: "SW3", role: "Fleet-ops access", ip: "10.20.255.1", x: 72, y: 24, selectable: true },
    { id: "SW4", label: "SW4", role: "Server access", ip: "10.30.255.1", x: 72, y: 40, selectable: true },
    { id: "OFF-WS", label: "Office PCs", role: "18 workstations", ip: "10.10.7.0/24", x: 90, y: 8, selectable: false },
    { id: "FLEET-WS", label: "Fleet PCs", role: "22 workstations · WS-FRT-217 = Gi0/14", ip: "10.20.14.0/24", x: 90, y: 24, selectable: false },
    { id: "FS1", label: "FS1", role: "File server", ip: "10.30.0.11", x: 90, y: 40, selectable: false },
    { id: "DC1", label: "DC1", role: "Domain controller", ip: "10.30.0.12", x: 90, y: 50, selectable: false },
    { id: "BK1", label: "BK1", role: "Backup server", ip: "10.30.0.13", x: 90, y: 60, selectable: false },
    { id: "PRN", label: "PRN-HQ1", role: "Legacy printer · SNMPv2c 'public'", ip: "10.20.99.50", x: 72, y: 56, selectable: false },
    { id: "BR-WS", label: "Branch PCs", role: "9 workstations", ip: "10.40.9.0/24", x: 90, y: 76, selectable: false },
  ];

  var LINKS = [
    { id: "l-isp-fw1", from: "ISP", to: "FW1", label: "WAN 200 Mb/s" },
    { id: "l-fw1-r1", from: "FW1", to: "R1", label: "LAN uplink" },
    { id: "l-r1-sw1", from: "R1", to: "SW1", label: "trunk" },
    { id: "l-r1-r2", from: "R1", to: "R2", label: "branch VPN", vpn: true },
    { id: "l-sw1-sw2", from: "SW1", to: "SW2", label: "VLAN 10 office" },
    { id: "l-sw1-sw3", from: "SW1", to: "SW3", label: "VLAN 20 fleet" },
    { id: "l-sw1-sw4", from: "SW1", to: "SW4", label: "VLAN 30 servers" },
    { id: "l-r2-brws", from: "R2", to: "BR-WS", label: "branch LAN" },
  ];

  var MON1_IP = "10.30.0.20";

  var C2 = { ip: "203.0.113.66", beaconPort: 443, exfilPort: 8443 };
  var VICTIM = { id: "WS-FRT-217", ip: "10.20.14.217", port: "Gi0/14", switch: "SW3" };

  // ---------- baseline week (tape 1) ----------
  var BASELINE_STATS = {
    window: "Mon 26 Oct – Sun 01 Nov (7 days)",
    edgeUtilBusiness: "34% avg / 71% peak (Tue 14:00)",
    edgeUtilNight: "6% avg",
    latency: "12 ms intra-site · 28 ms branch VPN",
    jitter: "2.1 ms avg",
    loss: "0.03%",
    p95EgressWorkstation: "410 MB/h",
    backup: "23:00–01:00 · FS1 → BK1 · ~40 GB nightly",
    patch: "Sat 22:00–24:00 patch window (elevated SW CPU, heavy WS→WS2K traffic)",
    topTalkers: "1) FS1→BK1 (backup)  2) DC1↔clients (auth)  3) office web egress",
  };

  // ---------- SNMP ----------
  var SNMP_TRAPS = {
    baseline: [
      { ts: "Tue 13:59:04", source: "SW1", oid: "1.3.6.1.6.3.1.1.5.4 (linkUp)", text: "Gi1/0/12 linkUp — patch task in window" },
      { ts: "Sat 22:00:11", source: "SW1", oid: "coldStart", text: "SW1 restarted for firmware maintenance (scheduled)" },
    ],
    incident: [
      { ts: "03:01:48", source: "SW3", oid: "1.3.6.1.6.3.1.1.5.3 (linkDown)", text: "Gi0/14 linkDown — WS-FRT-217 link flap" },
      { ts: "03:01:52", source: "SW3", oid: "1.3.6.1.6.3.1.1.5.4 (linkUp)", text: "Gi0/14 linkUp — 4 s outage" },
      { ts: "03:15:00", source: "FW1", oid: "1.3.6.1.4.1.9.9.109.1.1.1.1.7 (cpuHigh)", text: "FW1 CPU 91% > threshold 85% — sustained egress load" },
    ],
  };

  function SNMP_HEALTH(cpuFw1, utilFw1) {
    if (utilFw1 === undefined) utilFw1 = "77% out";
    return [
      { device: "FW1", cpu: cpuFw1, mem: 63, util: utilFw1, status: "online" },
      { device: "R1", cpu: 31, mem: 44, util: "52% out", status: "online" },
      { device: "R2", cpu: 18, mem: 39, util: "9% out", status: "online" },
      { device: "SW1", cpu: 22, mem: 51, util: "41%", status: "online" },
      { device: "SW3", cpu: 12, mem: 35, util: "18%", status: "online" },
    ];
  }

  // ---------- flow data ----------
  var FLOWS_BASELINE = [
    { id: "fb1", src: "10.30.0.11 (FS1)", dst: "10.30.0.13 (BK1)", dport: 445, proto: "TCP", sessions: 7, bytes: "40.1 GB", window: "23:00–01:00 nightly", tag: "backup", note: "Scheduled backup job — largest nightly talker" },
    { id: "fb2", src: "10.10.7.0/24 (office)", dst: "external web", dport: 443, proto: "TCP/TLS", sessions: 3120, bytes: "9.6 GB", window: "08:00–18:00", tag: "normal", note: "Business-hours browsing profile" },
    { id: "fb3", src: "10.40.9.0/24 (branch)", dst: "10.30.0.11 (FS1)", dport: 445, proto: "TCP", sessions: 540, bytes: "3.2 GB", window: "business hrs", tag: "normal", note: "File shares over branch VPN" },
    { id: "fb4", src: "10.30.0.12 (DC1)", dst: "internal", dport: 88, proto: "TCP", sessions: 8800, bytes: "1.8 GB", window: "business hrs", tag: "normal", note: "Kerberos/LDAP authentication" },
  ];

  var FLOWS_INCIDENT = [
    { id: "fi1", src: "10.20.14.217 (WS-FRT-217)", dst: "203.0.113.66", dport: 443, proto: "TCP/TLS", sessions: 108, bytes: "270 KB", window: "03:04–04:52 · every ~60 s", tag: "beacon", note: "108 near-identical short sessions to ONE external peer" },
    { id: "fi2", src: "10.20.14.217 (WS-FRT-217)", dst: "203.0.113.66", dport: 8443, proto: "TCP/TLS", sessions: 23, bytes: "2.4 GB", window: "03:10–05:41", tag: "exfil", note: "Sustained upload bursts to same external peer" },
    { id: "fi3", src: "10.30.0.13 (BK1)", dst: "198.51.100.20", dport: 443, proto: "TCP/TLS", sessions: 4, bytes: "45 GB", window: "02:30–03:40", tag: "vendor", note: "Change calendar #CHG-2291: quarterly vendor archive sync" },
    { id: "fi4", src: "10.20.14.91 (WS-FRT-091)", dst: "198.51.100.44/.61/.90", dport: 6881, proto: "TCP", sessions: 210, bytes: "3.1 GB", window: "02:05–04:20", tag: "p2p", note: "Peer-to-peer transfers — HR policy issue, unrelated pattern" },
    { id: "fi5", src: "10.10.7.0/24 (office)", dst: "external web", dport: 443, proto: "TCP/TLS", sessions: 34, bytes: "0.4 GB", window: "02:00–06:00", tag: "normal", note: "Night-shift idle browsing — matches baseline" },
    { id: "fi6", src: "10.30.0.11 (FS1)", dst: "10.30.0.13 (BK1)", dport: 445, proto: "TCP", sessions: 7, bytes: "40.1 GB", window: "23:00–01:00", tag: "backup", note: "Normal nightly backup — completed 01:02" },
  ];

  // ---------- packet capture ----------
  function beaconPackets() {
    var rows = [];
    var no = 1;
    // 03:04:12 + 60s cadence, 6 samples shown
    for (var i = 0; i < 6; i++) {
      var base = 3 * 3600 + 4 * 60 + 12 + i * 60;
      var ts = pad2(Math.floor(base / 3600)) + ":" + pad2(Math.floor((base % 3600) / 60)) + ":" + pad2(base % 60);
      var d = i * 60;
      rows.push({ no: no++, time: ts, src: VICTIM.ip, dst: C2.ip, proto: "TCP", len: 62, info: "49712 → 443 [SYN] Seq=0 Win=64240", detail: "Beacon #" + (i + 1) + ". Inter-arrival from previous SYN: " + (d === 0 ? "—" : "60.0 s (±1.8 s)") + ". Same 5-tuple every cycle; client cert handshake follows." });
      rows.push({ no: no++, time: ts, src: C2.ip, dst: VICTIM.ip, proto: "TCP", len: 62, info: "443 → 49712 [SYN, ACK]", detail: "Server reply, TLS 1.3 handshake (EncryptedExtensions, Finished)." });
      rows.push({ no: no++, time: ts, src: VICTIM.ip, dst: C2.ip, proto: "TCP", len: 517, info: "TLSv1.3 Application Data", detail: "Single small upload (~2.1 KB sent total per cycle), ~0.4 KB received, session closed in <1 s." });
    }
    return rows;
  }

  function exfilPackets() {
    var rows = [];
    var no = 19; // continue after the 18 beacon frames
    for (var i = 0; i < 5; i++) {
      var ts = "03:1" + i + ":00";
      rows.push({ no: no++, time: ts, src: VICTIM.ip, dst: C2.ip, proto: "TCP", len: 1514, info: "53110 → 8443 [ACK, PSH] Seq=1 Len=1460", detail: "Full-length data frames in one direction (upload). Same peer as beacon session, different port." });
    }
    rows.push({ no: no++, time: "03:14:02", src: VICTIM.ip, dst: C2.ip, proto: "TCP", len: 66, info: "53110 → 8443 [FIN, ACK]", detail: "Upload burst #1 closes. 22 more bursts repeat every ~7 min until 05:41." });
    return rows;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  var PACKETS_BASELINE = [
    { no: 1, time: "10:14:02", src: "10.10.7.33", dst: "10.30.0.12", proto: "TCP", len: 78, info: "51422 → 88 [SYN]", detail: "Kerberos auth — normal office traffic." },
    { no: 2, time: "10:14:02", src: "10.30.0.12", dst: "10.10.7.33", proto: "TCP", len: 90, info: "88 → 51422 [SYN, ACK]", detail: "DC reply." },
    { no: 3, time: "10:14:07", src: "10.10.7.33", dst: "23.55.0.0", proto: "TCP", len: 1434, info: "51430 → 443 [ACK, PSH]", detail: "TLS application data — ordinary web browsing." },
    { no: 4, time: "10:14:09", src: "10.20.14.201", dst: "10.30.0.11", proto: "TCP", len: 1514, info: "49152 → 445 [ACK, PSH] Len=1460", detail: "SMB file read — expected for fleet ops." },
  ];

  function packetsIncident() {
    return beaconPackets().concat(exfilPackets());
  }

  // ---------- syslog ----------
  var LOGS_BASELINE = [
    { id: "lb1", ts: "23:00:01", host: "BK1", sev: 6, facility: "daemon", msg: "backup job #4182 started (FS1 → BK1, est. 40 GB)", tag: "routine" },
    { id: "lb2", ts: "01:02:44", host: "BK1", sev: 6, facility: "daemon", msg: "backup job #4182 completed OK (40.1 GB in 1h02m)", tag: "routine" },
    { id: "lb3", ts: "22:00:03", host: "SW1", sev: 4, facility: "daemon", msg: "firmware maintenance window open (change #CHG-2204)", tag: "routine" },
  ];

  var LOGS_INCIDENT = [
    { id: "li1", ts: "02:00:00", host: "MON1", sev: 6, facility: "daemon", msg: "incident tape loaded — overnight shift begins", tag: "routine" },
    { id: "li2", ts: "02:30:00", host: "BK1", sev: 6, facility: "daemon", msg: "vendor archive sync started → 198.51.100.20 (change #CHG-2291, approved)", tag: "routine" },
    { id: "li3", ts: "02:41:19", host: "SW2", sev: 7, facility: "daemon", msg: "port Gi1/0/3 link up (office coffee dock)", tag: "noise" },
    { id: "li4", ts: "03:01:48", host: "SW3", sev: 3, facility: "daemon", msg: "%LINK-3-UPDOWN: interface Gi0/14, changed state to down (WS-FRT-217)", tag: "suspicious" },
    { id: "li5", ts: "03:01:52", host: "SW3", sev: 5, facility: "daemon", msg: "%LINK-5-CHANGED: interface Gi0/14, changed state to up", tag: "suspicious" },
    { id: "li6", ts: "03:02:11", host: "DC1", sev: 5, facility: "security", msg: "EventID 4625 — logon FAILED: account svc_patch on WS-FRT-217 (0xC000006A)", tag: "suspicious" },
    { id: "li7", ts: "03:02:39", host: "DC1", sev: 5, facility: "security", msg: "EventID 4624 — logon SUCCESS: account svc_patch on WS-FRT-217 (type 3, network)", tag: "suspicious" },
    { id: "li8", ts: "03:04:12", host: "FW1", sev: 6, facility: "local7", msg: "egress session: 10.20.14.217 → 203.0.113.66:443 (TLS, new peer for this host)", tag: "suspicious" },
    { id: "li9", ts: "03:10:00", host: "FW1", sev: 6, facility: "local7", msg: "egress session: 10.20.14.217 → 203.0.113.66:8443 (TLS, 1.2 GB in first 40 min)", tag: "suspicious" },
    { id: "li10", ts: "03:15:00", host: "FW1", sev: 4, facility: "local7", msg: "cpu threshold exceeded: 91% for 5 min (threshold 85%)", tag: "suspicious" },
    { id: "li11", ts: "03:22:10", host: "PRN", sev: 6, facility: "lpr", msg: "print job queue: 14 jobs (fleet manifests) — normal batch", tag: "noise" },
    { id: "li12", ts: "03:40:12", host: "BK1", sev: 6, facility: "daemon", msg: "vendor archive sync completed OK (45 GB, change #CHG-2291)", tag: "routine" },
    { id: "li13", ts: "04:05:55", host: "R2", sev: 6, facility: "ntp", msg: "NTP sync ok with 10.30.0.12, offset 3 ms", tag: "noise" },
    { id: "li14", ts: "05:03:41", host: "SW3", sev: 7, facility: "daemon", msg: "Gi0/22 link up — WS-FRT-091 heavy P2P peer churn observed", tag: "noise" },
  ];

  // ---------- API console (simulated in-browser — no network calls) ----------
  var API_ENDPOINTS = [
    {
      method: "GET",
      path: "/api/v1/devices/FW1/health",
      desc: "Firewall health snapshot (performance monitoring)",
      response: function (s) {
        return {
          device: "FW1",
          cpuPercent: s.cpuFw1,
          memPercent: 63,
          wan: { interface: "wan0", ifOperStatus: "up", utilOutPercent: 77 },
          timestamp: "2026-11-02T03:40:11Z (simulated)",
        };
      },
    },
    {
      method: "GET",
      path: "/api/v1/devices/SW3/ports/Gi0-14",
      desc: "Fleet switch port state (configuration / availability monitoring)",
      response: function (s) {
        return {
          device: "SW3",
          port: "Gi0/14",
          connectedHost: "WS-FRT-217 (10.20.14.217)",
          adminStatus: s.portDisabled ? "down (admin — shutdown applied)" : "up",
          ifOperStatus: s.portDisabled ? "down" : "up",
          lastFlap: "03:01:48 → 03:01:52 (4 s)",
          countersInOctets: 88412231,
          countersOutOctets: 2611900442,
        };
      },
    },
    {
      method: "GET",
      path: "/api/v1/monitoring/config",
      desc: "Monitoring server self-audit (configuration monitoring)",
      response: function () {
        return {
          snmp: { version: "v2c", community: "public", note: "legacy default — remediation recommended" },
          syslog: { listener: "0.0.0.0:514", transport: "UDP (cleartext)" },
          api: { auth: "token", token: "default-install-token", readOnly: false },
        };
      },
    },
  ];

  // ---------- alert queue ----------
  var ALERTS = [
    {
      id: "a1",
      title: "45 GB egress BK1 → 198.51.100.20 (02:30–03:40)",
      detail: "Single destination, TLS, steady 1 GB/min cadence.",
      truth: "fp",
      why: "Scheduled vendor archive sync — present in the change calendar (#CHG-2291) and consistent with the quarterly pattern; source is the backup server, not a workstation.",
    },
    {
      id: "a2",
      title: "WS-FRT-217 → 203.0.113.66:443 — 108 sessions at ~60 s intervals",
      detail: "Near-constant session size (~2.1 KB up), never seen before for this host.",
      truth: "tp",
      why: "Fixed-interval, fixed-size sessions to a brand-new external peer is classic C2 beaconing (ATT&CK T1071.001); it deviates from the baseline and correlates with the 03:02 logon chain.",
    },
    {
      id: "a3",
      title: "SW2 CPU 12% — informational health notice",
      detail: "Office access switch CPU well within normal range.",
      truth: "fp",
      why: "An informational threshold notice for a metric sitting comfortably inside the baseline envelope is exactly the kind of alert a tuned system should suppress.",
    },
    {
      id: "a4",
      title: "FW1 CPU > 90% for 2.5 h starting 03:10",
      detail: "Concurrent with a 2.4 GB upload burst series from VLAN 20.",
      truth: "tp",
      why: "Correlates in time and topology with the exfiltration from WS-FRT-217 — the firewall is busy TLS-inspecting/routing the exfil stream.",
    },
  ];

  // ---------- responses ----------
  var RESPONSE_ACTIONS = [
    { id: "port", label: "Admin-down WS-FRT-217 switch port (SW3 Gi0/14)", note: "Stops host network I/O instantly at the access layer." },
    { id: "block", label: "Block 203.0.113.66 at FW1 egress", note: "Cuts C2/exfil destination for any other infected host." },
    { id: "evidence", label: "Preserve volatile evidence (memory image, port counters)", note: "Volatile data dies at re-image — collect first." },
    { id: "creds", label: "Rotate svc_patch credentials + review account scope", note: "Valid-account abuse (T1078) requires credential response." },
    { id: "reimage", label: "Schedule full re-image of WS-FRT-217", note: "Only after evidence preservation — trust of host OS is lost." },
    { id: "broadcast", label: "Email all staff asking 'did anyone click something?'", note: "Not a containment action; tips off attacker, destroys evidence quality." },
  ];

  var CHANGE_CALENDAR_NOTE =
    "Change calendar (context): #CHG-2291 vendor archive sync BK1 → 198.51.100.20, window 02:00–04:00, approved by Ops Dir. #CHG-2204 SW1 firmware maintenance Sat 22:00.";

  // ---------- component-level constants (moved from components for tidiness) ----------
  var DEVICE_NOTES = {
    FW1: "Egress point. Flow export from here sees every WAN conversation. CPU traps fire under heavy TLS load — watch for correlation with internal hosts.",
    R1: "HQ core router. SNMP health polling shows interface utilization and CPU — a path bottleneck here affects everyone.",
    R2: "Branch router. Remote site — syslog from here should be encrypted (TLS) or it leaks branch events in cleartext.",
    SW1: "HQ core switch. The trunk all VLAN 10/20/30 traffic crosses — the primary flow export point.",
    SW2: "Office access switch. Mostly predictable VLAN 10 traffic — a good syslog source, a poor SPAN target.",
    SW3: "Fleet-ops access switch. Hosts live HERE — mirror VLAN 20 on this box to see workstation conversations at frame level.",
    SW4: "Server access switch. Servers don't egress; mirroring here wastes switch resources on duplicate data.",
    PRN: "Legacy printer: only speaks SNMP v2c with community 'public'. Can't upgrade — compensate: strong community + poller ACL + management VLAN.",
    "FLEET-WS": "22 fleet workstations including WS-FRT-217 (10.20.14.217, port Gi0/14 on SW3).",
    "OFF-WS": "18 office workstations — baseline shows predictable business-hours browsing.",
    FS1: "File server. Source of the nightly 23:00 backup — the biggest legitimate talker in the baseline.",
    DC1: "Domain controller. Security event log (4624/4625 logons) — the identity side of the story.",
    BK1: "Backup server. Backup target AND the source of the quarterly vendor sync (change #CHG-2291).",
    "BR-WS": "9 branch workstations behind R2 — reach HQ via the site-to-site VPN.",
    ISP: "Upstream carrier hand-off. 200 Mb/s WAN circuit.",
  };

  var POLLABLE = ["FW1", "R1", "R2", "SW1", "SW2", "SW3", "SW4"];
  var FLOWABLE = ["FW1", "R1", "SW1", "SW4"];
  var SYSLOGABLE = ["FW1", "R1", "R2", "SW2", "SW3", "SW4", "DC1"];

  return {
    SIM_NOTICE: SIM_NOTICE,
    DEVICES: DEVICES,
    LINKS: LINKS,
    MON1_IP: MON1_IP,
    C2: C2,
    VICTIM: VICTIM,
    BASELINE_STATS: BASELINE_STATS,
    SNMP_TRAPS: SNMP_TRAPS,
    SNMP_HEALTH: SNMP_HEALTH,
    FLOWS_BASELINE: FLOWS_BASELINE,
    FLOWS_INCIDENT: FLOWS_INCIDENT,
    PACKETS_BASELINE: PACKETS_BASELINE,
    packetsIncident: packetsIncident,
    LOGS_BASELINE: LOGS_BASELINE,
    LOGS_INCIDENT: LOGS_INCIDENT,
    API_ENDPOINTS: API_ENDPOINTS,
    ALERTS: ALERTS,
    RESPONSE_ACTIONS: RESPONSE_ACTIONS,
    CHANGE_CALENDAR_NOTE: CHANGE_CALENDAR_NOTE,
    DEVICE_NOTES: DEVICE_NOTES,
    POLLABLE: POLLABLE,
    FLOWABLE: FLOWABLE,
    SYSLOGABLE: SYSLOGABLE,
  };
})();
