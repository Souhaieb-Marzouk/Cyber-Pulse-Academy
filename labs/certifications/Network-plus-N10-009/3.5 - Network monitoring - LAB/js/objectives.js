// SIGNALPATH lab — objective definitions + machine-checkable validators
// Static port of src/lib/lab/objectives.ts — every rule and feedback string identical.
window.SP_OBJECTIVES = (function () {
  "use strict";

  var MON1_IP = window.SP_DATA.MON1_IP;
  var TOOL_MATCH_ANSWER = window.SP_CONTENT.TOOL_MATCH_ANSWER;
  var SOLUTIONS_ANSWER = window.SP_CONTENT.SOLUTIONS_ANSWER;

  function norm(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, " ");
  }
  function hasIp(s, ip) {
    return norm(s).indexOf(ip) !== -1;
  }
  function subset(need, have) {
    return need.every(function (n) { return have.indexOf(n) !== -1; });
  }
  function mkResult(pass, passMsg, failMsg) {
    return { pass: pass, feedback: pass ? passMsg : failMsg };
  }

  // ---------------- MEDIUM (12) ----------------
  var OBJECTIVES_MEDIUM = [
    {
      id: "OBJ-M1",
      stage: "observe",
      pillar: "P1",
      title: "Match each monitoring tool to its signal type",
      detail:
        "In the FIELD MANUAL (right board), complete the tool/function match: connect all 7 technologies to what they actually deliver.",
      anchor: "3.2 Methods — one row per tool family",
      hints: [
        "Think about WHAT each tool returns: counters, conversation rows, frames, a reference profile, event lines, JSON, or a traffic copy.",
        "SNMP = device counters. Flow = conversation metadata. Packet capture = payloads. Baseline = 'normal'. Logs = events in one place. API = programmatic exchange. Port mirroring = the copy mechanism.",
        "Answer key: SNMP→counters/poll-trap; Flow→who↔whom+how much; Packet capture→frames/payloads; Baseline→reference profile; Logs→central events; API→REST/JSON exchange; Port mirroring→copies traffic to instruments.",
      ],
      validate: function (s) {
        var ok = Object.keys(TOOL_MATCH_ANSWER).every(function (tool) {
          return (s.toolMatch[tool] || "") === TOOL_MATCH_ANSWER[tool];
        });
        return mkResult(
          ok,
          "Correct — and notice the structure: every monitoring technology is a SIGNAL TYPE. Choosing a tool is choosing which question you can answer.",
          "Some pairings are off. Re-read each role description: does it talk about counters, conversations, payloads, events, automation, reference data, or traffic copying? Each role maps to exactly one tool."
        );
      },
    },
    {
      id: "OBJ-M2",
      stage: "observe",
      pillar: "P1",
      title: "Pin down SNMP mechanics (ports, MIB, poll vs trap)",
      detail:
        "Deploy the SNMP Poller (rack, module 1), then answer the 3-question mechanics check inside the SNMP view.",
      anchor: "3.2 SNMP — traps, MIB, community strings",
      hints: [
        "Traps are the agent PUSHING events; polls are the manager PULLING counters. They use different ports.",
        "The MIB is a tree; an OID is the address of one object in that tree (e.g., sysUpTime). Traps arrive on 162; agents listen for polls on 161.",
        "Answers: trap destination port = 162; OID = address of one managed object in the MIB tree; traps = agent-initiated unsolicited push.",
      ],
      validate: function (s) {
        var q = s.snmpQuiz;
        var ok = q.trapPort === "162" && q.oid === "oid" && q.trigger === "trap";
        return mkResult(
          ok,
          "Solid. On the exam: UDP 161 = agent listens for polls, UDP 162 = manager receives traps/informs, MIB/OID name the objects being read.",
          "Not quite. Trap port is 162 (161 is where agents listen for polls); an OID addresses ONE object in the MIB tree; a trap is agent-initiated and unsolicited — a poll is manager-initiated."
        );
      },
    },
    {
      id: "OBJ-M3",
      stage: "observe",
      pillar: "P4",
      title: "Harden device polling: SNMPv3 authPriv on FW1 and R1",
      detail:
        "In the SNMP Poller module, select FW1 and R1, choose version v3 and enable authPriv (auth + encryption). Legacy v2c would ship your configs in cleartext.",
      anchor: "3.2 SNMP — versions v2c/v3, authentication, community strings",
      hints: [
        "Community strings in v2c are cleartext — anyone sniffing your management VLAN reads them.",
        "Select exactly FW1 + R1 (the internet-facing path), set Version = v3, then switch Auth mode to authPriv.",
        "Validate state: devices {FW1, R1} + version v3 + authPriv ON.",
      ],
      validate: function (s) {
        var ok =
          subset(["FW1", "R1"], s.snmpDevices) &&
          s.snmpVersion === "v3" &&
          s.snmpAuthPriv;
        return mkResult(
          ok,
          "The monitoring plane is now encrypted and authenticated — you just removed a classic audit finding (cleartext community strings).",
          "Requirement: FW1 + R1 polled via v3 with authPriv enabled. v2c authenticates with a cleartext community string and provides no encryption."
        );
      },
    },
    {
      id: "OBJ-M4",
      stage: "detect",
      pillar: "P3",
      title: "Turn on flow export from the core",
      detail:
        "In the Flow Collector module, enable export on SW1, pick NetFlow v9 or IPFIX, and point it at the monitoring server collector.",
      anchor: "3.2 Flow data — exporter/collector model",
      hints: [
        "The collector is MON1 — check the rack legend for its address (10.30.0.20).",
        "Export port for flow records: 2055. Template-based export = NetFlow v9 or IPFIX.",
        "Validate state: SW1 exporting + version set + collector = 10.30.0.20.",
      ],
      validate: function (s) {
        var ok =
          s.flowDevices.indexOf("SW1") !== -1 &&
          s.flowVersion !== null &&
          s.flowCollector === MON1_IP;
        return mkResult(
          ok,
          "Conversation metadata is flowing. From now on, 'who talked to whom and how much' is answerable for the whole core — without storing a single payload.",
          "Check three things: export enabled on SW1, a version selected (v9 or IPFIX), and the collector set to MON1 at 10.30.0.20 (the port is 2055)."
        );
      },
    },
    {
      id: "OBJ-M5",
      stage: "detect",
      pillar: "P3",
      title: "Mirror the fleet segment for the Packet Scope",
      detail:
        "The fleet-ops VLAN (20) is where overnight oddness was reported. Configure the SPAN: switch SW3, source VLAN 20 → Packet Scope. Then answer the acquisition-method question.",
      anchor: "3.2 Port mirroring — SPAN/TAP placement and cost",
      hints: [
        "Capture where the conversation LIVES: the hosts are on SW3, so mirroring SW3's VLAN 20 sees them without crossing the core.",
        "Mirroring everything costs the switch forwarding effort — scope it to one VLAN. The acquisition question asks what you'd use when the switch itself is overloaded: a TAP copies in hardware.",
        "Validate state: SPAN on SW3, source VLAN 20, and acquisition answer = TAP.",
      ],
      validate: function (s) {
        var ok =
          s.spanSwitch === "SW3" && s.spanSource === "vlan20" && s.acquisitionQ === "tap";
        return mkResult(
          ok,
          "Packet Scope now sees real fleet traffic. Remember the trade: SPAN costs the switch resources; a passive TAP is hardware, fail-safe, and leaves the switch alone.",
          "Two parts: (1) SPAN must be on SW3 with source VLAN 20 — mirroring other switches or all VLANs misses the hosts or overloads the box. (2) A saturated switch calls for a TAP, not SPAN."
        );
      },
    },
    {
      id: "OBJ-M6",
      stage: "detect",
      pillar: "P3",
      title: "Aggregate device logs into the collector",
      detail:
        "In the Syslog Sink module, add SW2, SW3, FW1 and DC1 as sources, set minimum severity to informational (6), and choose the encrypted transport.",
      anchor: "3.2 Log aggregation — syslog collector, severities, transport",
      hints: [
        "Severity 6 = informational: collecting 6 and worse keeps the security logons (which log at 5) while dropping pure debug noise (7).",
        "UDP 514 is the classic but cleartext transport — TCP 6514 carries syslog over TLS.",
        "Validate state: sources {SW2, SW3, FW1, DC1}, min severity 6, transport TLS/6514.",
      ],
      validate: function (s) {
        var ok =
          subset(["SW2", "SW3", "FW1", "DC1"], s.syslogDevices) &&
          s.syslogTransport === "tls-6514" &&
          s.syslogMinSeverity === 6;
        return mkResult(
          ok,
          "Event streams are centralizing over TLS. Correlation across devices — the SIEM's superpower — is now physically possible.",
          "Requirements: all four sources, minimum severity informational (6), transport TLS TCP/6514. UDP 514 is reliable-ish but cleartext, and severity 7 (debug) floods collectors with noise."
        );
      },
    },
    {
      id: "OBJ-M7",
      stage: "baseline",
      pillar: "P3",
      title: "Record the baseline and read it like a defender",
      detail:
        "On the BASELINE WEEK tape, press RECORD BASELINE, then answer the three questions under the baseline metrics panel.",
      anchor: "3.2 Baseline metrics — utilization, scheduled jobs, quality metrics",
      hints: [
        "Read the metrics panel: business-hours edge utilization, the nightly backup window, and which metric pair describes path quality for real-time apps.",
        "Latency + jitter (and loss) define voice/video readiness; CPU and SNMP strings describe devices, not paths.",
        "Answers: ~34% avg business-hours; backup 23:00–01:00; pair = latency + jitter.",
      ],
      validate: function (s) {
        var a = s.baselineAnswers;
        var okUtil = /^3[0-9]\s*%?$/.test(a.util.trim());
        var okBackup = /23:00/.test(a.backup) && /01:00/.test(a.backup);
        var okPair = a.pair === "latency-jitter";
        var ok = s.baselineRecorded && okUtil && okBackup && okPair;
        return mkResult(
          ok,
          "Baseline recorded and understood. This panel is now the measuring stick for every 'is this weird?' judgment tonight.",
          "Three reads: business-hours edge utilization ≈ 34% (peak 71% is a spike, not the average); backup runs 23:00–01:00 (explains the scary nightly 40 GB); path quality = latency + jitter (± loss). And don't forget to press RECORD BASELINE first."
        );
      },
    },
    {
      id: "OBJ-M8",
      stage: "observe",
      pillar: "P3",
      title: "Query device health through the REST API",
      detail:
        "Enable the API Gateway, send GET /api/v1/devices/FW1/health in the API view, then report the returned cpuPercent and WAN ifOperStatus.",
      anchor: "3.2 API integration — REST/JSON programmatic access",
      hints: [
        "The API view only lights up once the gateway module is enabled in the rack.",
        "Read the JSON body: cpuPercent is a top-level field; the WAN object carries ifOperStatus.",
        "Expected values from the 03:40 snapshot: cpuPercent = 91, ifOperStatus = up.",
      ],
      validate: function (s) {
        var ok =
          s.apiEnabled &&
          s.apiQueries.some(function (q) { return q.indexOf("FW1") !== -1; }) &&
          s.apiAnswers.cpu.trim() === "91" &&
          norm(s.apiAnswers.wan) === "up";
        return mkResult(
          ok,
          "That's API integration: tools exchange structured JSON programmatically — this is exactly how ticketing and automation systems enrich incidents.",
          "Enable the gateway, actually send the FW1 health query, then transcribe from the JSON: cpuPercent (91) and wan.ifOperStatus (up). APIs return exact values — copy them, don't guess."
        );
      },
    },
    {
      id: "OBJ-M9",
      stage: "detect",
      pillar: "P2",
      title: "Hunt the anomaly in flow data",
      detail:
        "Switch the deck to the INCIDENT SHIFT tape, open the Flow view, and identify the compromised internal host and its external destination.",
      anchor: "3.2 Flow data as anomaly evidence (traffic analysis)",
      hints: [
        "Look for a host whose conversation profile is impossible: 100+ near-identical sessions, one external peer, small fixed sizes.",
        "Ignore the big rows at first — volume is not malice. Check the change calendar note and who the sender is.",
        "Host = 10.20.14.217 (WS-FRT-217); destination = 203.0.113.66.",
      ],
      validate: function (s) {
        var ok =
          hasIp(s.flowAnswers.host, "10.20.14.217") &&
          hasIp(s.flowAnswers.c2, "203.0.113.66");
        return mkResult(
          ok,
          "You found the beacon: 108 regular sessions to one new peer. Flow metadata — no payloads needed — already indicts the host.",
          "The pattern: 10.20.14.217 (WS-FRT-217) sessions to 203.0.113.66 every ~60 s. The 45 GB vendor sync is sanctioned (#CHG-2291) and the P2P host is a policy issue, not this intrusion."
        );
      },
    },
    {
      id: "OBJ-M10",
      stage: "detect",
      pillar: "P2",
      title: "Confirm the beacon at frame level",
      detail:
        "Open the Packet Scope view (requires the SPAN from OBJ-M5) and read the beacon rhythm: what is the inter-arrival interval, and which pattern do the frames show?",
      anchor: "3.2 Packet capture — beacon signature in frames",
      hints: [
        "Compare the SYN timestamps of consecutive beacon sessions — the delta is suspiciously constant.",
        "Each session is small and identical; the exfil bursts are a different port and full-length frames.",
        "Interval = 60 seconds; pattern = fixed small TLS sessions to one peer.",
      ],
      validate: function (s) {
        var okInt = /^~?60(\.0)?\s*(s|sec|secs|seconds)?$/i.test(s.packetAnswers.interval.trim());
        var okPattern = s.packetAnswers.pattern === "beacon";
        return mkResult(
          okInt && okPattern,
          "Frame-level proof: 60.0 s ± 1.8 s inter-arrival, near-constant byte profile. That regularity is the fingerprint automated detection keys on.",
          "Read the time column: consecutive SYNs are ~60 s apart (fixed cadence = beacon), and each session is a small TLS exchange — not random downloads, DNS queries, or ARP traffic."
        );
      },
    },
    {
      id: "OBJ-M11",
      stage: "correlate",
      pillar: "P2",
      title: "Correlate logs and classify the alert queue",
      detail:
        "In the Syslog view, select the 3 suspicious events that form the intrusion chain. Then classify all 4 alerts in the Alert queue as true or false positives.",
      anchor: "3.2 Log aggregation/SIEM correlation + anomaly alerting TP/FP",
      hints: [
        "The chain: a port flap, then a FAILED service-account logon, then a SUCCESS one — same host, minutes apart.",
        "A false positive isn't 'boring' — it's explainable by baseline or the change calendar.",
        "Suspicious lines: 03:01:48 linkDown (SW3), 03:02:11 4625 FAILED (DC1), 03:02:39 4624 SUCCESS (DC1). Alerts: vendor sync = FP, beaconing = TP, SW2 CPU notice = FP, FW1 CPU during exfil = TP.",
      ],
      validate: function (s) {
        var need = ["li4", "li6", "li7"];
        var selOk = need.every(function (id) { return s.selectedLogIds.indexOf(id) !== -1; }) && s.selectedLogIds.length === 3;
        var wantAlerts = { a1: "fp", a2: "tp", a3: "fp", a4: "tp" };
        var alertsOk = ["a1", "a2", "a3", "a4"].every(function (id) {
          return s.alertsClassified[id] === wantAlerts[id];
        });
        return mkResult(
          selOk && alertsOk,
          "That's SIEM thinking: one host, three sources, minutes apart — flap → failed → success → (you now know) beacon. And the FPs were all explainable by baseline or change calendar.",
          selOk
            ? "Log selection: exactly the three-chain events — 03:01:48 linkDown, 03:02:11 FAILED 4625, 03:02:39 SUCCESS 4624. NTP/print/backup lines are noise. Selecting extra noise dilutes correlation precision."
            : "Alerts: vendor sync = FALSE positive (change #CHG-2291); beaconing = TRUE; SW2 CPU notice = FALSE; FW1 CPU during the exfil window = TRUE (correlates in time + topology)."
        );
      },
    },
    {
      id: "OBJ-M12",
      stage: "respond",
      pillar: "P4",
      title: "Contain the incident — then verify it worked",
      detail:
        "In the Response sequencer, apply containment in the correct order (port → block → credentials), then open the Flow view to verify the beacon has stopped.",
      anchor: "3.2 (applied) monitoring-driven response + verification",
      hints: [
        "Stop the SOURCE first (admin-down the access port), then the DESTINATION (firewall block), then handle the ACCOUNT (credential rotation).",
        "Verification is part of response: after acting, the Flow view must show the beacon rows ceasing.",
        "Order: [disable SW3 Gi0/14] → [block 203.0.113.66] → [rotate svc_patch creds], then check Flow view.",
      ],
      validate: function (s) {
        var want = ["port", "block", "creds"];
        var seq = s.responseActions.slice(0, 3).join(",");
        var okSeq = seq === want.join(",") && s.responseActions.length >= 3 && s.responseActions.indexOf("broadcast") === -1;
        var ok = okSeq && s.containment.portDisabled && s.containment.c2Blocked && s.verifiedStop;
        return mkResult(
          ok,
          "Contained and VERIFIED — the flow table shows sessions ceasing after the port went admin-down. Respond-then-verify closes the monitoring loop.",
          okSeq
            ? "Actions applied, but not verified: open the Flow view and confirm the beacon/exfil rows actually stopped. Response without verification is a hope, not a control."
            : "Correct order: disable the access port (cuts the host's I/O instantly), block the C2 IP at the firewall, rotate the abused credentials. Emailing staff is not containment."
        );
      },
    },
  ];

  // ---------------- HARD (9) ----------------
  var OBJECTIVES_HARD = [
    {
      id: "OBJ-H1",
      stage: "observe",
      pillar: "P3",
      title: "Design the full observation plane from the requirements brief",
      detail:
        "Requirements: (1) SNMP health on FW1, R1, R2 — v3 authPriv; (2) flow export from the two egress points (SW1, FW1); (3) SPAN of fleet VLAN 20 on SW3; (4) syslog from SW2, SW3, FW1, DC1; (5) API gateway enabled. Over-provisioning is a defect — a senior engineer once drowned SW4 mirroring three VLANs.",
      anchor: "3.2 Methods — deployment-level mastery of all families",
      hints: [
        "Egress points = where traffic LEAVES: the core uplink (SW1) and the firewall (FW1). Mirroring every switch is not 'more monitoring', it's load with duplicate data.",
        "One shot per instrument module: SNMP devices {FW1, R1, R2} + v3 + authPriv; Flow {SW1, FW1} + version + collector 10.30.0.20; SPAN SW3/VLAN 20; Syslog {SW2, SW3, FW1, DC1}; API on.",
        "Near-misses (extra flow exporters, missing authPriv, collector unset) are rejected with reasons.",
      ],
      validate: function (s) {
        var snmpOk = subset(["FW1", "R1", "R2"], s.snmpDevices) && s.snmpVersion === "v3" && s.snmpAuthPriv;
        var flowOk = s.flowDevices.indexOf("SW1") !== -1 && s.flowDevices.indexOf("FW1") !== -1 && s.flowDevices.indexOf("SW4") === -1 && s.flowVersion !== null && s.flowCollector === MON1_IP;
        var spanOk = s.spanSwitch === "SW3" && s.spanSource === "vlan20";
        var logOk = subset(["SW2", "SW3", "FW1", "DC1"], s.syslogDevices);
        var apiOk = s.apiEnabled;
        if (!snmpOk) return mkResult(false, "", "SNMP: exactly the internet path boxes (FW1, R1, R2) via v3 with authPriv — v2c is a finding, not a choice.");
        if (!flowOk) return mkResult(false, "", "Flow: exporters on the two egress points (SW1 + FW1) — NOT SW4 (servers don't egress; mirroring there wastes backplane). Version + collector 10.30.0.20 required.");
        if (!spanOk) return mkResult(false, "", "SPAN: SW3, source VLAN 20 only. Mirror where the hosts live, scope to the VLAN in question — three VLANs is the over-provisioning defect.");
        if (!logOk) return mkResult(false, "", "Syslog: SW2, SW3, FW1 and DC1 must forward to the collector.");
        if (!apiOk) return mkResult(false, "", "API gateway must be enabled for programmatic health pulls.");
        return mkResult(true, "Observation plane complete — every requirement met with no over-provisioning. This is the deployment-drawing skill Network+ scenario questions test.", "");
      },
    },
    {
      id: "OBJ-H2",
      stage: "baseline",
      pillar: "P3",
      title: "Baseline discrimination drill — six live judgments",
      detail:
        "Record the baseline, then classify all six situations in the 'judgment drill' under the baseline panel as normal (explainable) or a deviation (and why).",
      anchor: "3.2 Baseline metrics → anomaly alerting/notification",
      hints: [
        "The baseline panel lists: peak 71% Tue 14:00, Sat 22:00 patch window, nightly 23:00 backup, informational device notices.",
        "Volume is not malice; the sender and the calendar decide. A workstation pushing ~1 GB/h at 03:00 is nothing like a server job at 23:00.",
        "Answers: b1 normal, b2 normal (patch window), b3 deviation-abnormal egress, b4 normal (backup), b5 normal, b6 deviation-new external peer.",
      ],
      validate: function (s) {
        var d = s.baselineDiscrim;
        var want = {
          b1: "normal",
          b2: "normal",
          b3: "egress",
          b4: "normal",
          b5: "normal",
          b6: "peer",
        };
        var ok = Object.keys(want).every(function (k) { return d[k] === want[k]; }) && s.baselineRecorded;
        return mkResult(
          ok,
          "Six-for-six. This is the actual skill behind anomaly alerting: deviation is defined BY the baseline and the change calendar, not by scariness.",
          "Judgments: 68% Tue 14:00 = inside the 71% peak envelope; Sat 22:30 = patch window (#CHG-2204); 03:00 workstation 960 MB/h = abnormal EGRESS volume; 23:00 FS1→BK1 = the backup; SW2 12% informational = normal; first contact to 203.0.113.66 = NEW EXTERNAL PEER (C2)."
        );
      },
    },
    {
      id: "OBJ-H3",
      stage: "detect",
      pillar: "P2",
      title: "Flow forensics — four exact fields",
      detail:
        "From the incident flow table, report: the compromised host IP, the external C2 IP, the total exfiltrated volume, and the exfiltration destination port. Exact values required.",
      anchor: "3.2 Flow data — quantitative extraction under distractors",
      hints: [
        "Two flows from the same internal host matter; one is tiny and repetitive, one is bulk.",
        "The 45 GB vendor sync and the P2P flows are distractors — calendar and policy context.",
        "Host 10.20.14.217 → 203.0.113.66, exfil 2.4 GB on port 8443 (beacons on 443).",
      ],
      validate: function (s) {
        var a = s.flowAnswers;
        var ok =
          hasIp(a.host, "10.20.14.217") &&
          hasIp(a.c2, "203.0.113.66") &&
          /^2\.4\s*gb$/.test(norm(a.volume).replace(/\s+/g, "")) &&
          a.port.trim() === "8443";
        return mkResult(
          ok,
          "Exact extraction under noise — the numbers that matter: 10.20.14.217 sent 2.4 GB to 203.0.113.66:8443 after 108 beacon sessions on 443.",
          "Exact values: host = 10.20.14.217, C2 = 203.0.113.66, exfil volume = 2.4 GB (the 45 GB row is the sanctioned vendor sync, the 3.1 GB row is P2P policy noise), exfil port = 8443 (beacons ride 443)."
        );
      },
    },
    {
      id: "OBJ-H4",
      stage: "detect",
      pillar: "P2",
      title: "Frame-level analysis — cadence and payload shape",
      detail:
        "In the Packet Scope, determine the beacon inter-arrival interval and select the frame pattern that matches the exfiltration stream. One attempt at precision — near-misses rejected.",
      anchor: "3.2 Packet capture — beacon + exfil signatures",
      hints: [
        "Diff two consecutive beacon SYNs in the time column.",
        "The exfil frames are full-length (1460 B payload), one-directional, PSH/ACK — the beacon is small and symmetric.",
        "Interval = 60 s; pattern = 'fixed 60 s small sessions + one-way full-length uploads'.",
      ],
      validate: function (s) {
        var okInt = /^~?60(\.0)?\s*(s|sec|secs|seconds)?$/i.test(s.packetAnswers.interval.trim());
        var okPat = s.packetAnswers.pattern === "beacon";
        return mkResult(
          okInt && okPat,
          "60.0 s cadence + one-way 1460-byte PSH/ACK uploads: you just read a C2 channel and its exfil lane from raw frames.",
          "Read again: SYNs are 60 s apart (±1.8 s), and the 8443 stream is full-length one-way uploads. 'Random downloads', 'DNS tunneling' and 'ARP storms' do not match what the capture shows."
        );
      },
    },
    {
      id: "OBJ-H5",
      stage: "detect",
      pillar: "P3",
      title: "Tune the egress detection — threshold and scope",
      detail:
        "The rule 'any flow > 1 GB/h' fires on the sanctioned vendor sync. In the Alert queue panel, set a threshold that catches the 960 MB/h workstation exfil without false-positives on baseline p95 (410 MB/h), and pick the scope.",
      anchor: "3.2 Anomaly alerting/notification — threshold tuning with baseline stats",
      hints: [
        "The threshold must sit between normal (410 MB/h p95) and the attack (960 MB/h) — with margin on both sides.",
        "Scope is half the fix: server jobs live in VLAN 30, the threat is a workstation.",
        "Correct: 800 MB/h, workstation subnets only.",
      ],
      validate: function (s) {
        var ok =
          s.detectionTuning.threshold === "800" &&
          s.detectionTuning.scope === "workstations";
        return mkResult(
          ok,
          "Tuned: 800 MB/h on workstations only — the exfil (960) trips it, normal PCs (p95 410) never will, and server jobs are out of scope entirely.",
          "450 MB/h would page on normal users; 2.5 GB/h misses the exfil until far too late; 'all subnets' re-admits the vendor sync false positive. 800 MB/h scoped to workstations is the only setting that satisfies both constraints."
        );
      },
    },
    {
      id: "OBJ-H6",
      stage: "correlate",
      pillar: "P3",
      title: "Reconstruct the intrusion chain from raw syslog",
      detail:
        "In the Syslog view, build the attack chain IN ORDER using the 'chain+' buttons on exactly four events: the port flap, the failed logon, the successful logon, and the first egress to the new peer. Order matters.",
      anchor: "3.2 Log aggregation — SIEM correlation across sources",
      hints: [
        "Chain events across devices: SW3 says the link bounced; DC1 says an account failed then succeeded; FW1 says where the host went next.",
        "Ignore NTP syncs, print queues and the P2P host — correlation is precision work.",
        "Order: 03:01:48 linkDown → 03:02:11 4625 FAILED → 03:02:39 4624 SUCCESS → 03:04:12 first egress 203.0.113.66.",
      ],
      validate: function (s) {
        var want = ["li4", "li6", "li7", "li8"];
        var ok = s.logOrder.length === 4 && s.logOrder.every(function (id, i) { return id === want[i]; });
        return mkResult(
          ok,
          "A defensible timeline from four lines across three devices — this correlation, not any single event, is what justifies 'compromised, act now'.",
          "The chain: 03:01:48 SW3 Gi0/14 linkDown → 03:02:11 DC1 4625 FAILED svc_patch → 03:02:39 DC1 4624 SUCCESS → 03:04:12 FW1 first egress to 203.0.113.66. Same host, three sources, four minutes."
        );
      },
    },
    {
      id: "OBJ-H7",
      stage: "respond",
      pillar: "P4",
      title: "Run the full containment sequence — with evidence discipline",
      detail:
        "Sequence five actions in the Response sequencer: port admin-down, C2 block, volatile-evidence preservation, credential rotation, re-image scheduling. Then verify in the Flow view. Evidence before re-image — no exceptions.",
      anchor: "3.2 (applied) response sequencing + verification",
      hints: [
        "Order the bleeding first: source (port), then destination (block).",
        "Memory and port counters die when the host is wiped — preservation comes before re-imaging, always.",
        "Exact sequence: port → block → evidence → creds → reimage, then open Flow view to verify.",
      ],
      validate: function (s) {
        var want = ["port", "block", "evidence", "creds", "reimage"];
        var okSeq = s.responseActions.length === 5 && s.responseActions.every(function (id, i) { return id === want[i]; });
        var ok = okSeq && s.verifiedStop;
        return mkResult(
          ok,
          "Full sequence executed with evidence discipline and verified in flow data. That ordering — stop, cut, preserve, rotate, rebuild — is the defensible one.",
          okSeq
            ? "Sequence correct but unverified: open the Flow view and confirm sessions ceased. Verification is part of the response."
            : "Exact order required: admin-down port → block C2 → PRESERVE VOLATILE EVIDENCE → rotate credentials → schedule re-image. Re-imaging before preservation destroys memory, and 'email all staff' is not containment."
        );
      },
    },
    {
      id: "OBJ-H8",
      stage: "respond",
      pillar: "P4",
      title: "Audit and harden the monitoring plane itself",
      detail:
        "Send GET /api/v1/monitoring/config in the API view — the audit JSON exposes four insecure defaults. Fix all four in the Hardening Audit panel: legacy printer SNMP, cleartext branch syslog, default API token, and MON1's own v2c 'public'.",
      anchor: "3.2 SNMP v2c/v3 + syslog transport + API auth (monitoring-plane security)",
      hints: [
        "The audit endpoint lists all four findings in one JSON body — read it line by line.",
        "Where a device can't do v3 (the printer): strong community + poller ACL + management VLAN.",
        "All four fixes live in the Hardening Audit panel below the API view.",
      ],
      validate: function (s) {
        var h = s.hardening;
        var ok = h.printerSnmp && h.branchSyslog && h.apiToken && h.mon1Snmp;
        return mkResult(
          ok,
          "Monitoring plane hardened. Attackers legitimately read monitoring configs — default communities, cleartext syslog and install tokens are a map of your blind spots.",
          "Four fixes: (1) PRN-HQ1 — strong community + ACL (v3 impossible on legacy), (2) branch syslog → TLS 6514 not UDP 514, (3) API — rotate the default install token and scope read-only, (4) MON1 itself — kill v2c 'public', enforce v3 authPriv."
        );
      },
    },
    {
      id: "OBJ-H9",
      stage: "baseline",
      pillar: "P1",
      title: "Classify the five monitoring solutions (official 3.2 Solutions row)",
      detail:
        "In the FIELD MANUAL, match the five scenarios to the solutions from the official objective: network discovery, traffic analysis, performance, availability, configuration monitoring.",
      anchor: "3.2 Solutions — discovery (ad hoc/scheduled), traffic, performance, availability, configuration",
      hints: [
        "Adjectives are the tell: inventory → discovery; trends/capacity → performance; up/down and SLA → availability; running-config vs approved → configuration; who-talks-to-whom → traffic.",
        "'One-off sweep' = ad hoc discovery; 'schedule a sweep monthly' = scheduled discovery.",
        "Answers: s1 discovery, s2 performance, s3 availability, s4 configuration, s5 traffic analysis.",
      ],
      validate: function (s) {
        var ok = Object.keys(SOLUTIONS_ANSWER).every(function (k) { return s.solutionsMatch[k] === SOLUTIONS_ANSWER[k]; });
        return mkResult(
          ok,
          "All five solution types classified — that completes the official objective's second row, not just the methods.",
          "Correct pairs: auditor inventory one-off = discovery (ad hoc); Q3 WAN saturation trend = performance; 99.9% SLA breach alerting = availability; config drift vs approved baseline = configuration monitoring; who-talks-to-whom = traffic analysis."
        );
      },
    },
  ];

  function objectivesFor(mode) {
    return mode === "medium" ? OBJECTIVES_MEDIUM : OBJECTIVES_HARD;
  }

  var STAGE_ORDER = ["observe", "baseline", "detect", "correlate", "respond"];
  var STAGE_LABEL = {
    observe: "OBSERVE",
    baseline: "BASELINE",
    detect: "DETECT",
    correlate: "CORRELATE",
    respond: "RESPOND",
  };

  return {
    OBJECTIVES_MEDIUM: OBJECTIVES_MEDIUM,
    OBJECTIVES_HARD: OBJECTIVES_HARD,
    objectivesFor: objectivesFor,
    STAGE_ORDER: STAGE_ORDER,
    STAGE_LABEL: STAGE_LABEL,
    norm: norm,
  };
})();
