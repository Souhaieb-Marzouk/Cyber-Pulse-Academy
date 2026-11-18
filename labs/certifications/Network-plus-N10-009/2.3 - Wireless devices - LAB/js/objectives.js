// ── Mastery blueprint: 12 Medium + 9 Hard objectives, machine-validated ──────
// js/objectives.js — the CHECK RESULTS validation engine.
// Validators and every ok/fail message are carried over 1:1 from the original.
"use strict";

var D = window.LabData;

function objNorm(s) { return (s == null ? "" : String(s)).trim().toLowerCase(); }
function objMac(s) { return (s == null ? "" : String(s)).replace(/[^0-9a-f]/gi, "").toUpperCase(); }
function getAp(env, id) { return env.aps.find(function (a) { return a.id === id; }); }
function getSsid(env, id) { return env.ssids.find(function (s) { return s.id === id; }); }
function getField(answers, obj, key) { return objNorm(answers[obj] ? answers[obj][key] : undefined); }
function objExact(a) {
  var vals = Array.prototype.slice.call(arguments, 1);
  return vals.indexOf(a) !== -1;
}

// ─────────────────────────────── MEDIUM ───────────────────────────────────
var MEDIUM = [
  {
    id: "OBJ-M1", mode: "medium", order: 1, pillar: "P1", widget: "band-board",
    title: "Route each client group to its correct frequency band on the Band Assignment board.",
    anchor: "Frequency options: 2.4 GHz (range/legacy), 5 GHz (main capacity), 6 GHz (Wi-Fi 6E/7 only)",
    brief: "Band choice is a trade-off between range, congestion and what the client radios actually support. Assign each of the four site client groups to the band that fits both its radios and its job.",
    hints: [
      "Check each client's radio generation against the band table on Sheet 02 — the band must exist inside the client, not just the AP.",
      "Legacy and low-power IoT gear lives on 2.4 GHz; general tablets are happiest on 5 GHz; only Wi-Fi 6E/7-class laptops can use 6 GHz at all.",
      "Scanners → 2.4, tablets → 5, staff laptops → 6, cameras → 2.4.",
    ],
    validate: function (env, ans) {
      var ok = getField(ans, "OBJ-M1", "scanner") === "2.4" && getField(ans, "OBJ-M1", "tablets") === "5" &&
        getField(ans, "OBJ-M1", "laptops") === "6" && getField(ans, "OBJ-M1", "cameras") === "2.4";
      return {
        pass: ok,
        okMsg: "Correct. Legacy radios constrain the lowest common denominator: 2.4 GHz serves the old scanners and cameras, 5 GHz carries patron capacity, and 6 GHz gives modern staff laptops a clean, exclusive spectrum. A defender next verifies which SSIDs broadcast on which bands (band steering).",
        failMsg: "Not yet. A band only works if the CLIENT supports it: the 2013 scanners and the cameras have 2.4 GHz-only radios; patron tablets are modern 5 GHz-capable; only the new staff laptops have 6 GHz (Wi-Fi 6E/7) radios. Re-read the client specs on the board.",
      };
    },
  },
  {
    id: "OBJ-M2", mode: "medium", order: 2, pillar: "P1", widget: "plan",
    title: "Deconflict the 2.4 GHz plan: set AP-1, AP-2 and AP-3 to non-overlapping channels in ascending order (keep 20 MHz width).",
    anchor: "Channels: only 1, 6 and 11 do not overlap in 2.4 GHz; bonding widens overlap",
    brief: "Every AP shipped from the vendor defaulting to channel 6 — that is co-channel congestion. Set the 2.4 GHz channels of AP-1, AP-2 and AP-3 to the three non-overlapping channels, in ascending order.",
    hints: [
      "In 2.4 GHz only three 20 MHz channels do not overlap at all. They are the lowest, the middle and the highest of the classic set.",
      "Ascending order across AP-1 → AP-2 → AP-3: 1 < 6 < 11.",
      "AP-1 = 1, AP-2 = 6, AP-3 = 11 — and leave every width at 20 MHz; 40 MHz in 2.4 GHz re-creates overlap.",
    ],
    validate: function (env) {
      var a1 = getAp(env, "AP-1") ? getAp(env, "AP-1").radios["2.4"] : undefined;
      var a2 = getAp(env, "AP-2") ? getAp(env, "AP-2").radios["2.4"] : undefined;
      var a3 = getAp(env, "AP-3") ? getAp(env, "AP-3").radios["2.4"] : undefined;
      var ok = a1 && a1.channel === 1 && a2 && a2.channel === 6 && a3 && a3.channel === 11 &&
        a1.widthMhz === 20 && a2.widthMhz === 20 && a3.widthMhz === 20;
      return {
        pass: ok,
        okMsg: "Clean plan: 1 / 6 / 11 with 20 MHz everywhere — zero overlap between neighbors. A defender re-checks this whenever new APs or 'helpful' auto-settings appear, because a single ch6 clone undoes it.",
        failMsg: "The 2.4 GHz band only offers three non-overlapping 20 MHz channels: 1, 6 and 11 — ascending AP-1→1, AP-2→6, AP-3→11. Anything else (3, 9, 40 MHz bonding) overlaps a neighbor and re-creates the congestion you are fixing.",
      };
    },
  },
  {
    id: "OBJ-M3", mode: "medium", order: 3, pillar: "P1", widget: "net-types",
    title: "Classify the five site services by wireless network type.",
    anchor: "Network types: WLAN, WPAN, mesh, ad hoc (IBSS), hotspot",
    brief: "The site runs five different wireless arrangements. Match each service on the classification board to its network type.",
    hints: [
      "Ask two questions per service: is there an AP in the middle? And what scale is it — building, body-worn, or one link?",
      "Badge fobs are body-area radios (WPAN); two laptops sharing directly with no AP is the textbook ad hoc / IBSS case.",
      "Staff Wi-Fi = WLAN, badge fobs = WPAN, annex backhaul = mesh, laptop-to-laptop = ad hoc, phone-tethering kiosk = hotspot.",
    ],
    validate: function (_env, ans) {
      var ok = getField(ans, "OBJ-M3", "staffwifi") === "wlan" && getField(ans, "OBJ-M3", "fobs") === "wpan" &&
        getField(ans, "OBJ-M3", "backhaul") === "mesh" && getField(ans, "OBJ-M3", "laptopshare") === "adhoc" &&
        getField(ans, "OBJ-M3", "kiosk") === "hotspot";
      return {
        pass: ok,
        okMsg: "All five classified. Knowing the type tells you the threat surface: WPAN pairs get hijacked, ad hoc networks bypass the AP entirely, and hotspot tethering drags corporate data off-net. A defender inventories ALL wireless types on site, not just the WLAN.",
        failMsg: "Some types are off. Scale and topology decide: building-wide infrastructure = WLAN; body-worn short-range = WPAN; APs relaying among themselves = mesh; clients talking directly with NO AP = ad hoc (IBSS); a phone sharing its cellular = hotspot.",
      };
    },
  },
  {
    id: "OBJ-M4", mode: "medium", order: 4, pillar: "P2", widget: "rack",
    title: "Fix the SSID drawer: policy names on all three networks, guest renamed from 'linksys', and every SSID broadcasting (un-hide the guest).",
    anchor: "SSID: naming, broadcast vs hidden ('hiding' is not security)",
    brief: "Policy names are NW-Staff, NW-Guest and NW-IoT. The guest drawer still says 'linksys' and someone hid it 'for security'. Fix the names and make all three SSIDs visible again.",
    hints: [
      "A hidden SSID still leaks: probe responses and client Preferred Network Lists reveal it. The name field is not a password.",
      "Rename the guest drawer to exactly NW-Guest and flip 'Hidden' off on every drawer that has it on.",
      "Set: NW-Staff / NW-Guest / NW-IoT, all three broadcasting.",
    ],
    validate: function (env) {
      var st = getSsid(env, "staff"), gu = getSsid(env, "guest"), io = getSsid(env, "iot");
      var ok = !!st && !!gu && !!io && objNorm(st.name) === "nw-staff" && objNorm(gu.name) === "nw-guest" &&
        objNorm(io.name) === "nw-iot" && !st.hidden && !gu.hidden && !io.hidden;
      return {
        pass: ok,
        okMsg: "Drawer fixed: predictable, policy-compliant names, all broadcasting. Hidden SSIDs only break lazy attackers — every client that has ever joined still announces the name in probe requests. A defender treats 'hidden SSID' as a configuration smell, not a control.",
        failMsg: "Check the three drawers: names must be exactly NW-Staff, NW-Guest and NW-IoT (case does not matter to clients, but consistency does for docs), and 'Hidden' must be OFF on all of them. Hiding an SSID does not hide the network — probes and client lists leak it.",
      };
    },
  },
  {
    id: "OBJ-M5", mode: "medium", order: 5, pillar: "P4", widget: "rack",
    title: "Set the strongest sensible security mode per SSID: staff → WPA3-Enterprise, guest → WPA2/WPA3 transition, IoT → WPA2 (CCMP).",
    anchor: "Encryption ladder WEP→TKIP→CCMP→GCMP/SAE; transition modes for mixed fleets",
    brief: "Staff devices are modern; guest devices are whatever patrons carry; the cameras are 2.4 GHz-only units that top out at WPA2-CCMP. Pick the right rung of the encryption ladder for each — and get WEP/TKIP out of the building.",
    hints: [
      "Strongest SENSIBLE: the guest network must still accept older patron phones, so WPA3-only is wrong there even though it is 'stronger'.",
      "The IoT cameras cannot do WPA3 or GCMP — WPA2 with the AES cipher (CCMP) is their ceiling, and it is acceptable for a segmented camera VLAN.",
      "Staff → WPA3-Enterprise (GCMP), Guest → WPA2/WPA3 transition, IoT → WPA2 (CCMP).",
    ],
    validate: function (env) {
      var st = getSsid(env, "staff"), gu = getSsid(env, "guest"), io = getSsid(env, "iot");
      var ok = st && st.security === "wpa3-ent" && gu && gu.security === "wpa2wpa3" && io && io.security === "wpa2-ccmp";
      return {
        pass: ok,
        okMsg: "Ladder correctly applied. WEP and TKIP are gone, staff get SAE/GCMP with per-user credentials, guests in transition mode still admit older phones, and the cameras sit at their CCMP ceiling on a fenced VLAN. A defender re-runs the ladder whenever new device classes arrive.",
        failMsg: "Re-read the ladder: WPA3-Enterprise for staff (their laptops support it), WPA2/WPA3 TRANSITION for guests (patrons carry everything from 2015 on, so WPA3-only locks them out), WPA2-CCMP for the cameras (their 2.4 GHz radios cannot do WPA3 — and CCMP beats the TKIP they're on now). WEP and TKIP must not survive anywhere.",
      };
    },
  },
  {
    id: "OBJ-M6", mode: "medium", order: 6, pillar: "P4", widget: "rack",
    title: "Harden the guest drawer: client isolation ON, captive portal ON, VLAN 60, 10 Mbps rate cap.",
    anchor: "Guest networks: isolation, captive portal, VLAN segmentation, bandwidth caps",
    brief: "A guest network is only a guest network if guests can reach the internet and NOTHING else. Apply the four standard guest controls on the guest drawer.",
    hints: [
      "Think contain → identify → segment → constrain: isolation stops guest-to-guest and guest-to-LAN traffic; the portal identifies and logs; the VLAN separates; the cap protects capacity.",
      "The VLAN must be its own number, not the staff VLAN 10. Set 60.",
      "Isolation ON, Portal ON, VLAN 60, Rate limit 10 Mbps.",
    ],
    validate: function (env) {
      var gu = getSsid(env, "guest");
      var ok = !!gu && gu.isolation && gu.portal && objNorm(gu.vlan) === "60" && gu.rateLimitMbps === 10;
      return {
        pass: ok,
        okMsg: "Guest drawer hardened: isolated clients, a portal that logs who sits down, traffic fenced into VLAN 60, and a cap so one patron cannot starve the hall. A defender's next habit: TEST it (see the hard mode's isolation rig) instead of trusting four toggles.",
        failMsg: "Four controls are expected: client isolation ON, captive portal ON, its own VLAN 60 (not 10!), and a 10 Mbps rate limit. Each maps to a real incident: isolation stops snooping neighbors, the portal creates accountability, the VLAN fences the network, the cap protects the hall.",
      };
    },
  },
  {
    id: "OBJ-M7", mode: "medium", order: 7, pillar: "P4", widget: "rack",
    title: "Move staff authentication to 802.1X/RADIUS (radius.northwindlib.org, port 1812) and disable WPS on GW-1.",
    anchor: "Authentication: 802.1X + RADIUS enterprise path; WPS and its brute-forceable PIN",
    brief: "A shared staff passphrase means one leaked sticky note compromises everyone. Point the staff drawer at per-user 802.1X authentication against the site RADIUS server, and kill the WPS button on the SOHO router.",
    hints: [
      "On the staff drawer, switch Authentication to 802.1X and fill in the RADIUS host and port fields.",
      "RADIUS speaks to 802.1X on UDP port 1812 (the accounting port is 1813 — you want 1812).",
      "Staff: authType 802.1X, host radius.northwindlib.org, port 1812. WPS: OFF on the GW-1 card.",
    ],
    validate: function (env) {
      var st = getSsid(env, "staff");
      var ok = st && st.authType === "dot1x" && objNorm(st.radiusHost).indexOf("radius.northwindlib.org") !== -1 &&
        objNorm(st.radiusPort) === "1812" && env.wpsEnabled === false;
      return {
        pass: ok,
        okMsg: "Staff auth is now per-user: accounts can be revoked the day someone leaves, and the RADIUS log answers 'who was on the staff network at 12:47'. WPS is off — its PIN brute-force accepted whole guesses. A defender's follow-up: connect RADIUS to the directory (LDAP/SSO) so offboarding is automatic.",
        failMsg: "Two moves are missing. Staff drawer: Authentication → 802.1X, host radius.northwindlib.org, port 1812. GW-1 card: WPS switch OFF. A passphrase shared by thirty people is not authentication — it is a rumor; and WPS's PIN check accepts split guesses, so it falls to online brute force.",
      };
    },
  },
  {
    id: "OBJ-M8", mode: "medium", order: 8, pillar: "P2", widget: "plan",
    title: "Fit the antennas to the jobs: keep omni at the hall center (confirm it on the board), panel on the café window AP, Yagi on the annex bridge.",
    anchor: "Antennas: omnidirectional vs directional (panel/Yagi), gain and aiming",
    brief: "Antenna shape is coverage policy. Decide on the Antenna Board which pattern each job needs: an open hall, a window that faces a parking lot, and a long hop to the annex roof.",
    hints: [
      "A window facing the parking lot should not radiate INTO the parking lot — you want a pattern with a back.",
      "A point-to-point roof link wants a long, narrow beam, not a donut.",
      "Hall center → omni, café window → panel (aimed inward), annex bridge → Yagi.",
    ],
    validate: function (env, ans) {
      var a3 = getAp(env, "AP-3"), br = getAp(env, "BR-1");
      var ok = getField(ans, "OBJ-M8", "hall") === "omni" && a3 && a3.antenna === "panel" && br && br.antenna === "yagi";
      return {
        pass: ok,
        okMsg: "Patterns matched to jobs: the omni donut fills the hall, the panel throws coverage into the café and starves the parking lot, and the Yagi's narrow beam makes the annex hop reliable without splashing RF across town. A defender reviews antenna patterns at every exterior wall.",
        failMsg: "Think in shapes: the open hall wants the even donut of an omni; the café window wants a panel aimed INWARD (a flat wall of coverage with a dead back — that dead back is your parking lot); the annex hop wants a Yagi, whose narrow beam buys range and keeps the RF off other people's property.",
      };
    },
  },
  {
    id: "OBJ-M9", mode: "medium", order: 9, pillar: "P3", widget: "plan",
    title: "Place and type the remaining devices: R-1 repeater into the stacks dead zone, BR-1 bridge onto the annex roof, GW-1 integrated router into the staff office.",
    anchor: "Access points: dedicated, integrated (SOHO), repeater, bridge; placement",
    brief: "Three devices are still unassigned on the floor plan. Put each in the slot whose problem it solves, and confirm each device is the right KIND for that job.",
    hints: [
      "Match tool to problem: the stacks need a signal EXTENDER where cabling stops; the annex needs a point-to-point LINK; the staff office just needs a small all-in-one.",
      "The repeater belongs at the stacks junction (S1), the bridge on the annex roof (X1) — it can see the main building — and the integrated router in the staff office (W1).",
      "R-1 → S1 (repeater), BR-1 → X1 (bridge), GW-1 → W1 (integrated). AP-1 stays at A1.",
    ],
    validate: function (env) {
      var r = getAp(env, "R-1"), br = getAp(env, "BR-1"), gw = getAp(env, "GW-1"), a1 = getAp(env, "AP-1");
      var ok = r && r.slotId === "S1" && r.kind === "repeater" && br && br.slotId === "X1" && br.kind === "bridge" &&
        gw && gw.slotId === "W1" && gw.kind === "integrated" && a1 && a1.slotId === "A1";
      return {
        pass: ok,
        okMsg: "Fleet placed: the repeater relays into the shelf canyon, the bridge spans the annex hop on a dedicated 5 GHz link, and the SOHO router serves the small staff office where running controller-grade gear would be overkill. A defender notes each placement on the as-built sheet — undocumented APs become tomorrow's rogues.",
        failMsg: "Match device to problem: a REPEATER extends an existing cell into the stacks (S1); a BRIDGE joins two buildings over a point-to-point 5 GHz link (X1 — it has line of sight); an INTEGRATED SOHO router is perfect for one small office (W1). Dedicated hall APs stay where they are.",
      };
    },
  },
  {
    id: "OBJ-M10", mode: "medium", order: 10, pillar: "P3", widget: "analyzer",
    title: "Tag the air: mark every Meridian-network beacon as authorized, the stronger open clone as unauthorized, and the café next door as neighbor.",
    anchor: "Rogue AP / evil twin recognition (T1557.004): BSSID, vendor, cipher and RSSI tells",
    brief: "The Air Analyzer shows one sweep. Use the controller inventory note and the tells (vendor OUI, encryption, signal strength) to tag b1, b2, b3, b5 as authorized, b4 as unauthorized, and b6 as neighbor.",
    hints: [
      "The controller inventory note under the ledger lists which BSSIDs are genuinely ours — vendor 'Meridian Networks' alone is not proof.",
      "b4 broadcasts our guest's name with a different BSSID, a different vendor, NO encryption, and the strongest signal in the band. That is the evil-twin textbook.",
      "b6 belongs to the café next door: different SSID entirely, different vendor — visible, but not ours and not an attack.",
    ],
    validate: function (env) {
      var t = env.tags;
      var ok = t.b1 === "authorized" && t.b2 === "authorized" && t.b3 === "authorized" && t.b5 === "authorized" &&
        t.b4 === "unauthorized" && t.b6 === "neighbor";
      return {
        pass: ok,
        okMsg: "Triage correct. Same SSID + unexpected BSSID + open cipher + stronger RSSI is the evil-twin signature MITRE's DET0379 analytic hunts for (T1557.004); the neighbor café is noise, not malice. A defender's next step: locate the clone physically (RSSI triangulation) and get it off the air.",
        failMsg: "Use three tells together: (1) is the BSSID in the controller inventory? (2) does the vendor match our fleet? (3) is the cipher what our SSID should use? b4 passes none — same NAME as our guest net, different vendor, open, strongest signal: that is a clone. b6 is a different SSID and vendor altogether — the café next door, not an attack.",
      };
    },
  },
  {
    id: "OBJ-M11", mode: "medium", order: 11, pillar: "P3", widget: "ticket-t101",
    title: "Triage ticket T-101: select every TRUE cause of the stacks drops and the single best fix.",
    anchor: "Verification & troubleshooting: co-channel congestion + rogue legacy device (data-source correlation)",
    brief: "Ticket T-101 blames 'the Wi-Fi'. Correlate the ticket, the analyzer and the rack: which two causes are actually true, and which one fix addresses both?",
    hints: [
      "Every AP (and that old extender) defaulted to channel 6 — everyone talks over everyone in the stacks.",
      "The 2016 'extender' in the maintenance note is b9: our vendor OUI, WEP cipher, still on channel 6. It is both congestion AND an open door.",
      "Causes: ch6 co-channel congestion + the WEP extender. Fix: deconflict channels AND decommission the WEP repeater.",
    ],
    validate: function (_env, ans) {
      var causes = getField(ans, "OBJ-M11", "causes");
      var okFix = getField(ans, "OBJ-M11", "fix") === "deconflict-decommission";
      var c1 = causes.indexOf("ch6") !== -1 && causes.indexOf("wep") !== -1 && causes.indexOf("cafe") === -1 && causes.indexOf("dhcp") === -1 && causes.indexOf("virus") === -1;
      return {
        pass: c1 && okFix,
        okMsg: "True root causes found: co-channel congestion on 6, plus a forgotten WEP extender that clients keep roaming onto. The fix removes both — and removing the WEP device also closes an encryption hole. A defender logs the decommissioning so the as-built sheet matches the air.",
        failMsg: "Re-correlate the evidence: the analyzer shows EVERYTHING on channel 6 (co-channel contention — that's the slowdown), and the maintenance note matches b9, a WEP extender still on ch6 (sessions drop when clients roam onto it; WEP is also broken). The café's ch3 and DHCP are red herrings — no evidence ties them to aisle 4. The fix must remove BOTH true causes.",
      };
    },
  },
  {
    id: "OBJ-M12", mode: "medium", order: 12, pillar: "P1", widget: "standards-match",
    title: "Match each 802.11 standard to its Wi-Fi generation and band support.",
    anchor: "Frequency options & standards literacy: n / ac / ax / be ↔ Wi-Fi 4/5/6(6E)/7",
    brief: "Clients introduce themselves by standard, not by band. Complete the matching board so you can read a spec sheet at a glance.",
    hints: [
      "The generations count up from 4: n→4, ac→5, ax→6, be→7.",
      "6 GHz support begins with Wi-Fi 6E (the 'ax on 6 GHz' variant) and continues in Wi-Fi 7.",
      "n = Wi-Fi 4 (2.4/5), ac = Wi-Fi 5 (5), ax = Wi-Fi 6/6E (2.4/5/6), be = Wi-Fi 7 (2.4/5/6).",
    ],
    validate: function (_env, ans) {
      var ok = getField(ans, "OBJ-M12", "n") === "wifi4" && getField(ans, "OBJ-M12", "ac") === "wifi5" &&
        getField(ans, "OBJ-M12", "ax") === "wifi6" && getField(ans, "OBJ-M12", "be") === "wifi7";
      return {
        pass: ok,
        okMsg: "Standards mapped. This is the vocabulary that makes band decisions mechanical: a 'Wi-Fi 4' label on a device means 2.4/5 GHz only — no 6 GHz dreams. A defender uses exactly this mapping when triaging 'why can't my device see the network' tickets.",
        failMsg: "Count generations upward: 802.11n is Wi-Fi 4 (2.4 & 5 GHz), ac is Wi-Fi 5 (5 GHz only), ax is Wi-Fi 6 — whose 6 GHz variant is marketed Wi-Fi 6E — and be is Wi-Fi 7 (2.4/5/6).",
      };
    },
  },
];

// ──────────────────────────────── HARD ────────────────────────────────────
var HARD = [
  {
    id: "OBJ-H1", mode: "hard", order: 1, pillar: "P2", widget: "analyzer",
    title: "Full rogue census: tag ALL NINE beacons — authorized, unauthorized, or neighbor. Two are red herrings.",
    anchor: "Rogue/evil-twin recognition at depth (T1557.004 / DET0379): inventory, vendor OUI, cipher, RSSI, ad hoc, hotspot",
    brief: "One sweep, nine transmitters, no guidance. Tag every beacon. Two findings are deliberately harmless — proving you can leave them alone is part of the exercise.",
    hints: [
      "Inventory first, vendor second, cipher third: our four inventory BSSIDs are b1/b2/b3/b5.",
      "b7 (ad hoc printer net) and b8 (personal hotspot) violate policy even though neither attacks anyone. b9 runs WEP on OUR vendor OUI — a rogue CONFIG, not a rogue vendor.",
    ],
    validate: function (env) {
      var t = env.tags;
      var want = { b1: "authorized", b2: "authorized", b3: "authorized", b5: "authorized", b6: "neighbor", b4: "unauthorized", b7: "unauthorized", b8: "unauthorized", b9: "unauthorized" };
      var wrong = Object.keys(want).filter(function (k) { return t[k] !== want[k]; });
      return {
        pass: wrong.length === 0,
        okMsg: "Perfect census — including the discipline to NOT promote the neighbor café to an incident. Ad hoc and hotspot findings are policy violations; the WEP extender is our own rogue config (worst kind: it is inside our vendor OUI and our building). A defender feeds this census into the WIPS and opens disposal tickets for b7/b8/b9.",
        failMsg: "Re-judge: " + wrong.join(", ") + ". Tells: inventory BSSIDs (b1/b2/b3/b5) = authorized; b6 is the café's own network (neighbor, not an incident); b4 (clone: open, stronger, wrong vendor), b7 (ad hoc IBSS), b8 (personal hotspot), b9 (WEP on our own OUI) are unauthorized.",
      };
    },
  },
  {
    id: "OBJ-H2", mode: "hard", order: 2, pillar: "P3", widget: "plan",
    title: "Design the 5 GHz channel plan: AP-1…AP-4 all on DISTINCT channels at 80 MHz, at least one DFS channel in play; every 2.4 GHz radio back at 20 MHz.",
    anchor: "Channels/bonding at depth: width trade-offs, DFS radar obligations, per-band plans",
    brief: "Four co-channel APs is a planning failure, not a config bug. Build a real 5 GHz plan from the channel list — distinct centers, 80 MHz width, deliberately using DFS — and pin all 2.4 GHz radios at 20 MHz.",
    hints: [
      "Distinct means pairwise different: 36/36/36/36 is the failure you are fixing.",
      "DFS channels (52–144) are legal and plentiful — using one shows you understand the radar-evacuation obligation.",
      "Example that passes: 36 / 52 / 100 / 149, all at 80 MHz.",
    ],
    validate: function (env) {
      var ids = ["AP-1", "AP-2", "AP-3", "AP-4"];
      var r5 = ids.map(function (id) { var a = getAp(env, id); return a ? a.radios["5"] : undefined; });
      var chans = r5.map(function (r) { return r && r.channel != null ? r.channel : null; });
      var distinct = new Set(chans).size === 4 && chans.every(function (c) { return c !== null; });
      var legal = chans.every(function (c) { return c !== null && D.CHANNELS_5.indexOf(c) !== -1; });
      var dfs = chans.some(function (c) { return c !== null && D.DFS_CHANNELS.indexOf(c) !== -1; });
      var w80 = r5.every(function (r) { return r && r.widthMhz === 80; });
      var w24 = ids.every(function (id) { var a = getAp(env, id); return a && a.radios["2.4"] && a.radios["2.4"].widthMhz === 20; });
      var ok = distinct && legal && dfs && w80 && w24;
      return {
        pass: ok,
        okMsg: "A deployable plan: pairwise-distinct 80 MHz centers (more spectrum per client), deliberate DFS use with the radar obligation acknowledged, and 2.4 GHz pinned narrow. A defender documents the DFS choice — operations must know the AP may hop when radar appears.",
        failMsg: "Constraints: four DISTINCT legal 5 GHz channels (yours: " + (chans.join(", ") || "unset") + "), at least one from the DFS set 52–144, all four 5 GHz radios at 80 MHz, and every 2.4 GHz radio at 20 MHz. Duplicate channels leave clients contending for the same air.",
      };
    },
  },
  {
    id: "OBJ-H3", mode: "hard", order: 3, pillar: "P4", widget: "rack",
    title: "Execute the guest lockdown IN ORDER (isolation → portal → VLAN 60 → 10 Mbps cap), then make the isolation test rig pass.",
    anchor: "Guest hardening as sequenced controls + verification (test, don't trust)",
    brief: "Sequence matters: contain first, then identify, then segment, then constrain. If the drawer is already dirty, use 'Restore factory guest config' (Hard tools) and perform the four controls in the stated order — the bench records your order. Finish by running the isolation test rig until all four checks pass.",
    hints: [
      "If toggles were flipped earlier in another order, restore the factory guest config first — the recorder tracks from that moment.",
      "The order encodes risk: an identified-but-uncontained guest (portal before isolation) is worse than an unnamed but contained one.",
    ],
    validate: function (env) {
      var gu = getSsid(env, "guest");
      var order = ["isolation", "portal", "vlan", "rateLimit"];
      var idx = order.map(function (f) {
        return env.actionLog.findIndex(function (r) { return r.field === f; });
      });
      var inOrder = idx.every(function (i) { return i >= 0; }) && idx.every(function (i, k) { return k === 0 || i > idx[k - 1]; });
      var flags = !!gu && gu.isolation && gu.portal && objNorm(gu.vlan) === "60" && gu.rateLimitMbps === 10;
      return {
        pass: inOrder && flags && env.guestTest === "pass",
        okMsg: "Sequence executed and PROVEN: the rig shows portal up, staff share unreachable, VLAN 60 tags and the cap applied. Contain-before-identify is the professional order — a portal-only guest network logs breaches, isolation prevents them. A defender archives the rig output with the change ticket.",
        failMsg: "Status: flags " + (flags ? "set" : "incomplete") + ", rig " + (env.guestTest === "pass" ? "passing" : "not passing") + ", recorded order " + (env.actionLog.map(function (r) { return r.field; }).join(" → ") || "empty") + ". Required: restore factory guest config, then isolation → portal → VLAN 60 → 10 Mbps, in that order, then run the rig. The rig failing means at least one toggle is not actually effective.",
      };
    },
  },
  {
    id: "OBJ-H4", mode: "hard", order: 4, pillar: "P4", widget: "legacy-desk",
    title: "Evict weak crypto: assign the correct disposition to the WEP extender, the TKIP-only scanner laptop, and WPS — and make the rack reflect the WPS decision.",
    anchor: "Legacy eviction: WEP/TKIP decommissioning, WPS disablement (cf. T1110 brute force)",
    brief: "Three findings, three different right answers: a WEP repeater we own, a scanner laptop whose 2.4 radio tops out at TKIP, and WPS enabled on GW-1. 'Monitor it' is not a disposition. Choose per item, and disable WPS in the rack.",
    hints: [
      "Disposal, not observation: the WEP device can be sniffed in minutes and it is INSIDE our building.",
      "The scanner may be salvageable — a firmware/driver update can lift it to CCMP; if the vendor never shipped one, it is a replacement item.",
      "WEP extender → decommission; scanner laptop → firmware-or-replace; WPS → disable (and actually flip the switch).",
    ],
    validate: function (env, ans) {
      var ok = getField(ans, "OBJ-H4", "wep") === "decommission" &&
        getField(ans, "OBJ-H4", "tkip") === "firmware-or-replace" &&
        getField(ans, "OBJ-H4", "wps") === "disable" &&
        env.wpsEnabled === false;
      return {
        pass: ok,
        okMsg: "Disposition matrix correct: the unfixable legacy device leaves the network, the salvageable one gets a firmware path (with replacement as the fallback), and WPS is off in fact, not on paper. A defender re-scans quarterly — legacy crypto returns through procurement backdoors.",
        failMsg: "'Monitor' leaves a crackable device transmitting. The WEP extender must be DECOMMISSIONED (it cannot be saved). The scanner laptop gets FIRMWARE-OR-REPLACE (check the vendor's TKIP→CCMP update). WPS must be DISABLED in the rack — flipping the switch IS the mitigation.",
      };
    },
  },
  {
    id: "OBJ-H5", mode: "hard", order: 5, pillar: "P2", widget: "incident-card",
    title: "Fill the incident card for the clone: exact BSSID, the ATT&CK technique it maps to, and the data source that proves it.",
    anchor: "T1557.004 Evil Twin (tactics: Credential Access, Collection; DET0379 analytic; M1031/M1017)",
    brief: "You found it in M-mode triage — now write it up like an incident responder. Clone BSSID (exact), ATT&CK technique ID, and which data source carries the proof among the options given.",
    hints: [
      "The clone is the open beacon whose SSID mimics ours but whose BSSID is absent from the controller inventory.",
      "ATT&CK has a dedicated sub-technique for cloned Wi-Fi APs: Adversary-in-the-Middle → Evil Twin, T1557.004.",
    ],
    validate: function (_env, ans) {
      var ok = objMac(ans["OBJ-H5"] ? ans["OBJ-H5"].bssid : undefined) === "9C2F1A447C09" &&
        objExact(getField(ans, "OBJ-H5", "technique"), "t1557.004", "t1557") &&
        getField(ans, "OBJ-H5", "source") === "controller-logs";
      return {
        pass: ok,
        okMsg: "Incident card complete: 9C:2F:1A:44:7C:09, mapped to T1557.004 (Evil Twin — Credential Access/Collection), proven by the controller-log diff (BSSID not in inventory). The official mitigations are WIPS scanning (M1031) and user training against open APs (M1017). A defender hands this card to whoever owns the physical space.",
        failMsg: "Three fields: the clone's EXACT BSSID (it is the open 'Northwind-Guest' with the AirCess vendor — 9C:2F:1A:44:7C:09), the ATT&CK ID T1557.004 (Evil Twin, under Adversary-in-the-Middle), and the proof source — the controller logs, because 'not in inventory' is the fact that survives review.",
      };
    },
  },
  {
    id: "OBJ-H6", mode: "hard", order: 6, pillar: "P1", widget: "bonding-desk",
    title: "Rule on channel bonding: pin every 2.4 GHz radio at 20 MHz, keep the hall's 5 GHz at 80 MHz, and select the TWO engineering reasons.",
    anchor: "Bonding/width trade-offs: contention vs capacity per band",
    brief: "A junior admin proposes bonding 2.4 GHz to 40 MHz 'for speed'. Set the radios right and pick the two reasons that justify the rule from the five options.",
    hints: [
      "40 MHz in 2.4 GHz does not add speed in a crowded band — it doubles the spectrum you collide with.",
      "The hall's 5 GHz utilization data shows sustained demand: 80 MHz is justified WHERE the spectrum is clean and the clients dense.",
    ],
    validate: function (env, ans) {
      var ids = ["AP-1", "AP-2", "AP-3", "AP-4"];
      var w24 = ids.every(function (id) { var a = getAp(env, id); return a && a.radios["2.4"] && a.radios["2.4"].widthMhz === 20; });
      var a1 = getAp(env, "AP-1"), a2 = getAp(env, "AP-2");
      var w5hall = a1 && a1.radios["5"] && a1.radios["5"].widthMhz === 80 && a2 && a2.radios["5"] && a2.radios["5"].widthMhz === 80;
      var r = getField(ans, "OBJ-H6", "reasons");
      var okReasons = r.indexOf("overlap") !== -1 && r.indexOf("utilization") !== -1 && r.indexOf("power") === -1 && r.indexOf("hide") === -1 && r.indexOf("all40") === -1;
      return {
        pass: w24 && w5hall && okReasons,
        okMsg: "Ruled and justified: 2.4 GHz stays narrow because 40 MHz overlaps the neighbors you just deconflicted; 5 GHz stays wide because its clean spectrum and the hall's utilization justify the capacity. Width is a per-band policy, not a global switch. A defender writes this rationale into the wireless standard.",
        failMsg: "Reasons: (1) 40 MHz in 2.4 GHz OVERLAPS adjacent networks — you re-import the congestion; (2) the hall's 5 GHz UTILIZATION supports 80 MHz where spectrum is clean. Radios: all four 2.4 GHz widths = 20; hall APs' 5 GHz = 80. More transmit power and hidden SSIDs solve nothing here.",
      };
    },
  },
  {
    id: "OBJ-H7", mode: "hard", order: 7, pillar: "P3", widget: "response-planner",
    title: "Build the rogue-AP response plan: order the five steps correctly and pick the TWO data sources the plan depends on.",
    anchor: "Detection engineering: spectrum survey → inventory diff → triangulation → removal → validation (DET0379-style workflow)",
    brief: "The clone is on the air right now, harvesting card numbers. Sequence the five response steps in the planner, then select which two data sources the plan is built on.",
    hints: [
      "You cannot remove what you cannot find, and you cannot know it is rogue without the inventory.",
      "The two sources are the ones that produced today's findings: the controller's BSSID inventory and the spectrum survey. Patron anecdotes are triggers, not evidence.",
    ],
    validate: function (_env, ans) {
      var raw = ans["OBJ-H7"] && ans["OBJ-H7"].order ? ans["OBJ-H7"].order : "";
      var seq = raw.split(">").map(objNorm).filter(Boolean);
      var want = ["survey", "diff", "triangulate", "remove", "validate"];
      var seqOk = seq.length === 5 && seq.every(function (s, i) { return s === want[i]; });
      var src = getField(ans, "OBJ-H7", "sources");
      var srcOk = src.indexOf("controller") !== -1 && src.indexOf("spectrum") !== -1 && src.indexOf("anecdote") === -1 && src.indexOf("social") === -1;
      return {
        pass: seqOk && srcOk,
        okMsg: "Response plan sound: survey the spectrum, diff against the controller inventory, triangulate by RSSI, remove the device, then VALIDATE the air is clean — with the two data sources that make each step falsifiable. This is DET0379's logic as a workflow. A defender adds it to the IR playbook with roles and phone numbers.",
        failMsg: "Order: survey → inventory diff → RSSI triangulation → remove → validate (removal before validation leaves doubt; validation before removal is theater). Sources: wireless controller logs and the spectrum analyzer — complaint tickets and word of mouth trigger the process but cannot prove the clone.",
      };
    },
  },
  {
    id: "OBJ-H8", mode: "hard", order: 8, pillar: "P4", widget: "tradeoff-desk",
    title: "Make the three calls and defend them: staff security mode, SSID broadcast policy, parking-lot bleed control.",
    anchor: "Mitigation trade-offs & residual risk: WPA3-only vs transition, broadcast vs hidden, antenna/power vs coverage",
    brief: "Management wants 'maximum security everywhere' and a 'discreet' network. Choose correctly on all three cards — the wrong-but-popular answers are offered, near-misses rejected.",
    hints: [
      "The staff fleet is modern and centrally managed — they lose nothing with WPA3-Enterprise, and PMF becomes mandatory.",
      "Hiding the SSID buys nothing but support tickets. For the bleed: power alone either leaks or starves — shape the pattern.",
    ],
    validate: function (_env, ans) {
      var ok = getField(ans, "OBJ-H8", "staffsec") === "wpa3-ent" &&
        getField(ans, "OBJ-H8", "broadcast") === "broadcast" &&
        getField(ans, "OBJ-H8", "bleed") === "panel-power";
      return {
        pass: ok,
        okMsg: "Three defensible calls with named residuals: WPA3-Enterprise on staff (residual: legacy exceptions go on a fenced VLAN), SSIDs broadcast (residual: the name is public knowledge — the auth is the control), panel-plus-power for the bleed (residual: verify the café's far corner still passes the test rig). A defender documents residuals so the next admin inherits decisions, not folklore.",
        failMsg: "Maximum security that locks out users gets bypassed by users: staff → WPA3-Enterprise (modern fleet, mandatory PMF), NOT transition mode and not PSK. 'Hidden' SSIDs are found in seconds by any scanner — keep broadcasting. Bleed: panel antenna aimed inward PLUS reduced power; power alone either still leaks or opens a dead zone in the café.",
      };
    },
  },
  {
    id: "OBJ-H9", mode: "hard", order: 9, pillar: "P2", widget: "ticket-t102",
    title: "Close ticket T-102: bring AP-3 to ≤ 50 mW with an inward panel, and select the follow-up that prevents a new dead zone.",
    anchor: "RF leak remediation: power + antenna shaping + coverage follow-up",
    brief: "Full bars in parking lot B is unauthorized reach. Configure AP-3 (power ≤ 50 mW, panel aimed inward) and choose the correct follow-up action — the parking lot must go dark WITHOUT trading away the café.",
    hints: [
      "Power and pattern: 50 mW with an omni still bleeds; 50 mW with an inward panel stops leaking at the glass.",
      "Shrinking a cell always moves the edge — plan for the coverage you removed.",
    ],
    validate: function (env, ans) {
      var a3 = getAp(env, "AP-3");
      var ok = !!a3 && a3.powerMw <= 50 && a3.antenna === "panel" && a3.slotId === "C1" &&
        getField(ans, "OBJ-H9", "followup") === "add-fill-in-ap";
      return {
        pass: ok,
        okMsg: "Leak closed the professional way: pattern shaped inward, power trimmed to 50 mW, and the follow-up compensates for the shrunken cell so the café's far corner keeps service. A defender re-runs the exterior survey — the parking lot should now hear nothing.",
        failMsg: "Configure AP-3: power ≤ 50 mW AND antenna = panel (aimed inward — an omni at 50 mW still leaks a donut into the lot). Follow-up: ADD A FILL-IN AP for the coverage the panel removed. 'Do nothing' leaves the dead zone; 'disable AP-3' kills the café.",
      };
    },
  },
];

var OBJECTIVES = MEDIUM.concat(HARD);

function objectivesFor(mode) {
  return OBJECTIVES
    .filter(function (o) { return o.mode === mode; })
    .sort(function (a, b) { return a.order - b.order; });
}

function findObjective(objId) {
  for (var i = 0; i < OBJECTIVES.length; i++) if (OBJECTIVES[i].id === objId) return OBJECTIVES[i];
  return null;
}

window.LabObjectives = { OBJECTIVES: OBJECTIVES, objectivesFor: objectivesFor, findObjective: findObjective };
