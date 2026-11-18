/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/objectives.js — objective definitions + machine-checkable validators.
 *   1:1 port of src/lib/lab/objectives.ts: same ids, same checks, same
 *   tolerance rules, same feedback strings (word for word).
 * Each objective anchors to a specific detail of N10-009 3.1.
 * ========================================================================= */
(function () {
  "use strict";

  var D = window.LabData;

  /* ------------------------------------------------------ input helpers - */

  var norm = function (v) {
    return (v == null ? "" : v.toString()).trim().toLowerCase().replace(/\s+/g, " ");
  };

  var num = function (v) {
    var m = (v == null ? "" : v.toString()).replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  };

  var ip = function (v) {
    var n = (v == null ? "" : v.toString()).trim();
    // accept full IP or last-octet shorthand like ".13"
    if (/^\.\d+$/.test(n)) return "10.20.10" + n;
    return n;
  };

  function assetIds(s) {
    var out = [];
    Object.keys(s.inventory.flags).forEach(function (k) {
      if (s.inventory.flags[k]) out.push(k);
    });
    return out;
  }

  /* -------------------------------------------------------------- MEDIUM - */

  var M1 = {
    id: "M1", mode: "medium", sheet: "diagrams", pillar: "P1",
    title: "File all 8 detail chips onto the correct sheet: PHYSICAL or LOGICAL.",
    anchor: "Physical vs. logical diagrams — what each shows",
    check: function (s) {
      var placed = D.DIAGRAM_CHIPS.filter(function (c) { return s.diagrams.sort[c.id] != null; }).length;
      var right = D.DIAGRAM_CHIPS.filter(function (c) { return s.diagrams.sort[c.id] === c.bin; }).length;
      if (right === D.DIAGRAM_CHIPS.length)
        return { pass: true, feedback: "All 8 filed correctly. Rule of thumb: if you can photograph it (rooms, racks, cables), it is physical; if it lives only in configs (VLANs, IPs, policy), it is logical. Every drawing you maintain is one of these two lenses — knowing which lens a stakeholder needs is the first exam skill." };
      return { pass: false, feedback: "Filed correctly so far: " + right + "/8 (" + placed + " placed). Re-read the chips still on the desk — the config-born ones (VLANs, DHCP, policy, routing) never belong on the physical sheet." };
    },
  };

  var M2 = {
    id: "M2", mode: "medium", sheet: "diagrams", pillar: "P2",
    title: "Use the physical diagram to answer the three location questions below it.",
    anchor: "Physical diagram reading; IDF/MDF topology",
    check: function (s) {
      var a = s.diagrams.read.room === D.MAP_QUESTIONS.room.answer;
      var b = s.diagrams.read.idfs === D.MAP_QUESTIONS.idfs.answer;
      var c = s.diagrams.read.uplink === D.MAP_QUESTIONS.uplink.answer;
      if (a && b && c)
        return { pass: true, feedback: "You read the map like a field tech: core in the basement MDF, two IDF closets, and IDF-3 daisy-chained through IDF-2. That last fact silently decides how far an outage spreads — you will reuse it in the fiber-cut audit later." };
      return { pass: false, feedback: "Not all three are right yet (" + [a, b, c].filter(Boolean).length + "/3). A physical diagram is read bottom-up: find the MDF first, then count closets that are NOT the main one, then follow the fiber lines." };
    },
  };

  var M3 = {
    id: "M3", mode: "medium", sheet: "rack", pillar: "P2",
    title: "Mount all six devices in Rack A at their correct U positions.",
    anchor: "Rack diagrams — U ordering and placement conventions",
    check: function (s) {
      var wrong = Object.keys(D.RACK_SOLUTION).filter(function (dev) {
        return D.RACK_SOLUTION[dev].indexOf(s.rack.slots[dev] || "") === -1;
      });
      var placed = Object.keys(s.rack.slots).filter(function (k) { return s.rack.slots[k]; }).length;
      var distinct = Object.keys(s.rack.slots)
        .filter(function (k) { return s.rack.slots[k]; })
        .map(function (k) { return s.rack.slots[k]; })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).length;
      if (wrong.length === 0 && placed === 6 && distinct === 6)
        return { pass: true, feedback: "Rack A is documented correctly: UPS low (it is 96 kg), entry chain router→firewall→core flowing upward, patch panels directly above the core they patch into, and the U4 gap preserves airflow. Anyone can now find 'unit 7' without entering the basement." };
      if (placed === 6 && distinct < 6)
        return { pass: false, feedback: "Two devices are documented in the SAME rack slot — a rack drawing where units overlap is physically impossible and would send a tech looking for hardware that isn't there. Give every device its own U." };
      if (placed < 6)
        return { pass: false, feedback: "You have placed " + placed + "/6 devices. Every slot dropdown must be set — undrawn devices are invisible to the next technician." };
      return { pass: false, feedback: "Not yet. Check the three conventions: heaviest at the very bottom, the entry chain (router → firewall → core) stacked upward from U5, and patch panels directly ABOVE the switch they serve." };
    },
  };

  var M4 = {
    id: "M4", mode: "medium", sheet: "cable", pillar: "P2",
    title: "Trace workstation WS-204's full patch chain: wall port → panel port → switch port.",
    anchor: "Cable maps — three-link chain, labels, troubleshooting use",
    check: function (s) {
      var w = s.cable.wall === "204-A";
      var p = s.cable.panel === "pp-idf2-1-12";
      var t = s.cable.port === "gi1-0-12";
      if (w && p && t)
        return { pass: true, feedback: "Complete chain: 204-A → PP-IDF2-1 port 12 → Gi1/0/12, one cable ID (C-204-A) tying all three links. This is why cable maps exist — you just traced a drop from the desk to the closet without a toner kit." };
      if (!w)
        return { pass: false, feedback: "Start at the desk: WS-204 sits in Room 204, and its DATA drop is the one patching the workstation (the B drop is the phone). Pick the wall port first." };
      if (w && !p)
        return { pass: false, feedback: "Right wall port. Now follow cable ID C-204-A into the closet: which numbered port on PP-IDF2-1 does the map say it lands on?" };
      return { pass: false, feedback: "Chain nearly complete — finish it at the switch: the panel port's number must match the access port number documented for VLAN 10 STAFF." };
    },
  };

  var M5 = {
    id: "M5", mode: "medium", sheet: "netdiagram", pillar: "P3",
    title: "Compare the L3 diagram against the discovery output and click the ONE element that is wrong.",
    anchor: "Network diagrams — L3 content, validating against device reality",
    check: function (s) {
      if (s.netdiagram.flagged === "vlan99")
        return { pass: true, feedback: "Caught it: the sheet draws VLAN 99 as 10.20.98.0/24 while " + D.DIAGRAM_DISCOVERY[4] + " and IPAM both say 10.20.99.0/24. A diagram that disagrees with device reality is worse than no diagram — it actively misroutes the next troubleshooter. Redraw, bump the revision letter." };
      if (s.netdiagram.flagged)
        return { pass: false, feedback: "That element matches the discovery output. Cross-check every subnet bubble one octet at a time — 'show ip interface brief' is ground truth for gateways and subnets." };
      return { pass: false, feedback: "Click an element on the diagram to flag it. Audit method: read the discovery CLI, then verify each of the four VLAN bubbles against it." };
    },
  };

  var M6 = {
    id: "M6", mode: "medium", sheet: "inventory", pillar: "P3",
    title: "Flag the stale inventory records using the discovery scan — exactly two records are wrong.",
    anchor: "Asset inventory — reconciliation against discovery",
    check: function (s) {
      var picked = assetIds(s);
      var right = D.INVENTORY_STALE;
      var exact = picked.length === right.length && right.every(function (r) { return picked.indexOf(r) >= 0; });
      if (exact)
        return { pass: true, feedback: "Both ghosts caught: SW-IDF2-2's chassis label reads a different serial than the record, and PRN-003 was recycled but never retired. A stale inventory breaks warranty claims, depreciation audits and incident response ('which device is THAT?'). Reconciliation against discovery is what keeps the database truthful." };
      return { pass: false, feedback: "You flagged " + picked.length + " record(s) but that is not the audit result. Discovery tells you two stories: a chassis whose label does not match its record, and a device that no longer exists. Compare serials and existence, not just names." };
    },
  };

  var M7 = {
    id: "M7", mode: "medium", sheet: "ipam", pillar: "P3",
    title: "On the IPAM worksheet, record the duplicate IP conflict, then assign PRN-206 its correct next free address.",
    anchor: "IPAM — conflicts, block plan, allocation",
    check: function (s) {
      var dupOk = ip(s.ipam.dupIp) === D.IPAM_DUP_ANSWER || norm(s.ipam.dupIp) === ".23" || norm(s.ipam.dupIp) === "10.20.10.23";
      var prnOk = ip(s.ipam.prnIp) === D.IPAM_PRN_ANSWER;
      if (dupOk && prnOk)
        return { pass: true, feedback: "Recorded: PC-FIN-12 and PC-OPS-3 both claim 10.20.10.23 (one will intermittently lose its connection), and PRN-206 was parked at .77 — inside the DHCP pool, where a lease could collide with it any morning. Moving the printer to .13 keeps every block doing exactly one job. That is IPAM's whole purpose." };
      if (!dupOk)
        return { pass: false, feedback: "Scan the device list for two different devices documented with the SAME static address — that is the conflict. Enter it in dotted form." };
      return { pass: false, feedback: "The duplicate is found. Now allocate PRN-206 properly: its current .77 sits inside the DHCP pool (.50–.149). Printer block is .10–.19 and .10–.12 are taken — hand out the next free one." };
    },
  };

  var M8 = {
    id: "M8", mode: "medium", sheet: "sla", pillar: "P1",
    title: "Calculate the maximum downtime Gold (99.9%) allows on a 30-day service month, in minutes.",
    anchor: "SLA — uptime math on a defined service month",
    check: function (s) {
      var v = num(s.sla.downtimeMin);
      if (!isNaN(v) && Math.abs(v - D.SLA_MATH.answer) <= D.SLA_MATH.tolerance)
        return { pass: true, feedback: "43.2 minutes. 30 days × 24 h × 60 min = 43,200 minutes; 0.1% of that is 43.2. Memorize the yearly cousin too: 99.9% ≈ 8.77 h/year, 99.99% ≈ 52.6 min/year. Contracts are only useful when someone can do this math in a dispute." };
      if (!isNaN(v))
        return { pass: false, feedback: "Not 43.2. Convert the month to minutes first (days × 24 × 60), then multiply by 0.001 — not 0.9." };
      return { pass: false, feedback: "Enter a number of minutes. Start from 30 × 24 × 60." };
    },
  };

  var M9 = {
    id: "M9", mode: "medium", sheet: "sla", pillar: "P4",
    title: "Assign each business service the SLA tier that fits its real need — no over-buying, no under-protecting.",
    anchor: "SLA — tier selection and cost trade-offs",
    check: function (s) {
      var ok = D.SLA_SERVICES.every(function (svc) { return s.sla.tiers[svc.id] === svc.answer; });
      if (ok)
        return { pass: true, feedback: "Right-sized: revenue-critical checkout on Gold (24×7, 1 h response), the bulletin board on Bronze, the scanning app on Silver. SLA selection is a business-impact decision — paying Gold for a bulletin board wastes budget, and Bronze for checkout risks revenue every outage." };
      return { pass: false, feedback: "Read each service's 'needs' line again: who is hurt by an outage, and how long can they wait? Response time and 24×7 coverage, not just the uptime number, decide the tier." };
    },
  };

  var M10 = {
    id: "M10", mode: "medium", sheet: "wireless", pillar: "P2",
    title: "On the heat map, click the dead-zone cell, name its cause, and set AP-303 to a non-overlapping channel.",
    anchor: "Wireless surveys — heat maps, attenuation, 1/6/11 plan",
    check: function (s) {
      var cell = s.wireless.deadCell === D.HEATMAP_DEAD;
      var cause = s.wireless.cause === D.WIRELESS_CAUSE_ANSWER;
      var ch = s.wireless.ch303 === "11";
      if (cell && cause && ch)
        return { pass: true, feedback: "Survey complete: r1c8 at −88 dBm is unusable, the new concrete break-room wall is the attenuator, and AP-303 moving 6→11 ends the co-channel fight with AP-302. Heat maps turn invisible RF into actionable drawings." };
      if (!cell)
        return { pass: false, feedback: "Find the weakest cell — anything near −85 dBm or worse is effectively unusable. The corner cells are the suspects." };
      if (!cause)
        return { pass: false, feedback: "Right cell. The survey notes mention new construction near that corner — what does thick masonry do to 2.4 GHz?" };
      return { pass: false, feedback: "AP-301 is on 1 and AP-302 on 6. If AP-303 also sits on 6 and their cells overlap, the two APs contend for the same airtime. Which of the three non-overlapping channels remains?" };
    },
  };

  var M11 = {
    id: "M11", mode: "medium", sheet: "index", pillar: "P4",
    title: "For all six scenarios at The Index, pull the one document that answers the need.",
    anchor: "Cross-cutting: choosing the right document per task",
    check: function (s) {
      var ok = D.INDEX_SCENARIOS.every(function (sc) { return s.index.match[sc.id] === sc.answer; });
      if (ok)
        return { pass: true, feedback: "Perfect filing instinct: ports→cable map, mounting→rack diagram, addressing→IPAM, serials/warranty→inventory, coverage→heat map, contract terms→SLA. In the exam (and the job) half the battle is knowing WHICH artifact answers the question." };
      return { pass: false, feedback: "Some pulls are wrong. Test each: does this sheet contain ports and drops? addresses? serials? coverage? contract terms? mounting positions? Only one matches per scenario." };
    },
  };

  var M12 = {
    id: "M12", mode: "medium", sheet: "index", pillar: "P1",
    title: "Match all six vocabulary terms to their definitions.",
    anchor: "Chapter vocabulary (rack unit, patch panel, logical, DHCP pool, dead zone, IPAM)",
    check: function (s) {
      var ok = Object.keys(D.INDEX_TERM_ANSWERS).every(function (t) {
        return s.index.terms[t] === D.INDEX_TERM_ANSWERS[t];
      });
      if (ok)
        return { pass: true, feedback: "Full vocabulary locked in. These six terms carry disproportionate exam weight because they describe the artifacts themselves — 1U = 1.75 in, panels terminate, logical = VLANs/subnets, pools are dynamic, dead zones are measured, IPAM is management." };
      return { pass: false, feedback: "Not all matches hold. Giveaway: the definition with '1.75 inches' belongs to rack unit; 'dynamic lease range' is the DHCP pool." };
    },
  };

  /* --------------------------------------------------------------- HARD -- */

  var H1 = {
    id: "H1", mode: "hard", sheet: "rack", pillar: "P3",
    title: "AUDIT Rack B: fix all four documentation discrepancies against the discovery record (UPS slot, switch model, panel slot, missing device).",
    anchor: "Rack diagrams — full audit vs. noisy discovery data",
    check: function (s) {
      var a = s.rack.audit;
      var okU = a.upsSlot === D.RACK_B_AUDIT.upsSlot.answer;
      var okM = a.swModel === D.RACK_B_AUDIT.swModel.answer;
      var okP = a.ppSlot === D.RACK_B_AUDIT.ppSlot.answer;
      var okX = a.missing === D.RACK_B_AUDIT.missing.answer;
      var n = [okU, okM, okP, okX].filter(Boolean).length;
      if (n === 4)
        return { pass: true, feedback: "Rack B is now truthful: UPS at U1 (as photographed), SW-IDF2-2 corrected to the 48-port model its chassis claims, PP-IDF2-2 moved directly above it at U12, and the undocumented PDU added. Four drifts that would each have cost a technician real time during the expansion project." };
      return { pass: false, feedback: "Audit incomplete: " + n + "/4 corrections accepted. A rack audit is photo-vs-drawing: position, model, adjacency (panel above its switch), and completeness (what exists but is not drawn). One of the four is a device that exists in the closet but in NO document." };
    },
  };

  var H2 = {
    id: "H2", mode: "hard", sheet: "ipam", pillar: "P3",
    title: "RECONCILE the /24: identify ALL three addressing discrepancies, then commit the three corrective values.",
    anchor: "IPAM — full reconciliation: duplicates, pool violations, gateway drift",
    check: function (s) {
      var found = {};
      s.ipam.issues.forEach(function (i) { found[i] = true; });
      var allFound = D.IPAM_ISSUES.every(function (i) { return found[i.id]; });
      var f = s.ipam.fixes;
      var okDup = ip(f.dup) === D.IPAM_H_DUP_ANSWER;
      var okPrn = ip(f.prn) === D.IPAM_PRN_ANSWER;
      var okGw = ip(f.gw) === D.IPAM_H_GW_ANSWER;
      if (allFound && okDup && okPrn && okGw)
        return { pass: true, feedback: "Clean reconciliation: duplicate static .23 caught, the DHCP-pool squatter PRN-206 moved to .13, PC-OPS-3 reallocated to .45, and the gateway cell corrected to .1 to match the switch's actual SVI. Every block now means exactly what it says." };
      if (!allFound)
        return { pass: false, feedback: "You identified " + Object.keys(found).length + "/3 discrepancies — an audit that misses one leaves a live fault in the plan. Re-walk the block plan: one address appears twice, one static sits in the DHCP range, and one infrastructure value disagrees with the switch's interface table." };
      return { pass: false, feedback: "All three discrepancies identified, but your corrective values reintroduce drift. Dup fix must go to the next free ADMIN-static slot; the printer must land in the PRINTER block; the gateway must match 'show ip interface brief'." };
    },
  };

  var H3 = {
    id: "H3", mode: "hard", sheet: "sla", pillar: "P4",
    title: "VERIFY September against the Gold contract: total outage minutes, achieved availability, and whether the SLA was breached.",
    anchor: "SLA — effectiveness verification against incident data",
    check: function (s) {
      var v = s.sla.verify;
      var okTotal = num(v.total) === D.SLA_VERIFY.total;
      var okAvail = !isNaN(num(v.availability)) && Math.abs(num(v.availability) - D.SLA_VERIFY.availability) <= 0.005;
      var okBreach = norm(v.breach) === D.SLA_VERIFY.breach;
      var n = [okTotal, okAvail, okBreach].filter(Boolean).length;
      if (n === 3)
        return { pass: true, feedback: "61 minutes across three incidents; (43,200 − 61)/43,200 = 99.86% availability; Gold's 43.2-minute allowance is exceeded, so credits are owed — though the month would have passed at Silver (216 min). You just did the exact math a contract dispute turns on." };
      return { pass: false, feedback: n + "/3 verified. Sum the three outage durations first; availability = (43,200 − total)/43,200 × 100; then compare against Gold's 43.2-minute allowance for the month." };
    },
  };

  var H4 = {
    id: "H4", mode: "hard", sheet: "wireless", pillar: "P4",
    title: "REDESIGN floor 3: commit the channel plan for the three APs, the minimum hardware change, and the wall material from the survey notes.",
    anchor: "Wireless surveys — coverage redesign from survey evidence",
    check: function (s) {
      var r = s.wireless.redesign;
      var okCh = r.channels === D.WIRELESS_REDESIGN.channels.answer;
      var okAp = r.apCount === D.WIRELESS_REDESIGN.apCount.answer;
      var okWall = r.wall === D.WIRELESS_REDESIGN.wall.answer;
      var n = [okCh, okAp, okWall].filter(Boolean).length;
      if (n === 3)
        return { pass: true, feedback: "Design approved: 1/6/11 across the three APs (the only non-overlapping 2.4 GHz plan), one additional AP on the break-room side of the concrete wall, and the wall material recorded as the attenuation cause. Minimum hardware, maximum coverage — the survey data drove every choice." };
      return { pass: false, feedback: n + "/3 design decisions accepted. Anchor on the physics: three non-overlapping channels exist; the dead corner sits behind new construction; the fix is the minimum hardware that covers the measured gap." };
    },
  };

  var H5 = {
    id: "H5", mode: "hard", sheet: "cable", pillar: "P3",
    title: "AUDIT the two cable runs: identify the mislabeled run and commit the corrected switch-port label.",
    anchor: "Cable maps — end-to-end label audit and correction",
    check: function (s) {
      var okRun = s.cable.audit.run === "c-201-b";
      var okPort = s.cable.audit.fixedPort === D.CABLE_FIX_ANSWER;
      if (okRun && okPort)
        return { pass: true, feedback: "C-201-B relabeled: the tone lands on PP-IDF2-1 p22 as documented, but the lit switch port is Gi1/0/24 — the panel label was right, the switch label had drifted. Relabeled and revision-bumped, the next trace takes 30 seconds instead of an hour." };
      if (!okRun)
        return { pass: false, feedback: "One run's discovery shows tone and lit port AGREEING; the other shows them disagreeing. A documentation audit trusts the physical test over the paper." };
      return { pass: false, feedback: "Right run. The panel port matched the test — the mismatch is at the switch end. Which Gi1/0/xx port actually lit up?" };
    },
  };

  var H6 = {
    id: "H6", mode: "hard", sheet: "inventory", pillar: "P4",
    title: "APPLY the three lifecycle tickets: add SW-IDF3-2 with its exact chassis serial, dispose PRN-003, move LT-0388.",
    anchor: "Asset inventory — lifecycle maintenance (add / dispose / move)",
    check: function (s) {
      var okSer = norm(s.inventory.newSwitchSerial) === norm(D.LIFECYCLE_SERIAL_ANSWER);
      var okPrn = s.inventory.prnStatus === D.LIFECYCLE_PRN_ANSWER;
      var okLt = s.inventory.ltLocation === D.LIFECYCLE_LT_ANSWER;
      var n = [okSer, okPrn, okLt].filter(Boolean).length;
      if (n === 3)
        return { pass: true, feedback: "Lifecycle complete: the new switch exists on paper with serial HL-SW-88220 (warranty claims now possible), PRN-003 is formally disposed (the ghost is gone), and LT-0388 tracks to RM 302. An inventory is a living document — tickets are how it stays true." };
      return { pass: false, feedback: n + "/3 ticket actions applied. The serial must be entered EXACTLY as printed on the chassis; a disposal needs a status change, not a deletion; a move updates the location field without losing history." };
    },
  };

  var H7 = {
    id: "H7", mode: "hard", sheet: "netdiagram", pillar: "P2",
    title: "FIBER CUT (MDF↔IDF-2): answer in order — which closets lose connectivity, which document you consult first, and which systems stay up.",
    anchor: "Physical vs. logical diagrams — combined use under incident pressure",
    check: function (s) {
      var b = s.netdiagram.blast;
      var okClosets =
        D.BLAST_CLOSETS_ANSWER.every(function (c) { return b.closets.indexOf(c) >= 0; }) && b.closets.length === 2;
      var okDoc = b.doc === D.BLAST_DOC_ANSWER;
      var okSys = b.systems === D.BLAST_SYSTEMS_ANSWER;
      var n = [okClosets, okDoc, okSys].filter(Boolean).length;
      if (n === 3)
        return { pass: true, feedback: "Textbook blast-radius read: the daisy chain means IDF-2 AND IDF-3 drop while the basement (MDF, servers, firewall) stays alive; the physical diagram is the first sheet open; the logical diagram then explains which VLANs those floors were serving. Two drawings, one incident, zero guesswork." };
      return { pass: false, feedback: n + "/3 parts accepted — and parts must be reasoned in order. Start from the topology line on the physical diagram: 'MDF → IDF-2 → IDF-3, daisy-chained'. What is downstream of a cut in that first fiber span, and what never needed to cross it?" };
    },
  };

  var H8 = {
    id: "H8", mode: "hard", sheet: "netdiagram", pillar: "P1",
    title: "REBUILD from interface facts: set the access VLAN for Gi1/0/24 and the VLAN 20 gateway so the L2/L3 sheet matches device truth.",
    anchor: "Network diagrams — L2/L3 element accuracy",
    check: function (s) {
      var okV = s.netdiagram.rebuild.portVlan === D.REBUILD_PORT_ANSWER;
      var okGw = ip(s.netdiagram.rebuild.gwVlan) === D.REBUILD_GW_ANSWER;
      if (okV && okGw)
        return { pass: true, feedback: "Sheet matches reality: Gi1/0/24 is the STAFF access drop for Room 201-B (VLAN 10), and VLAN 20's gateway is 10.20.20.1 straight from the SVI table. Layer 2 (which VLAN a port carries) and Layer 3 (which gateway serves it) are now consistent on paper and in the switch." };
      if (!okV)
        return { pass: false, feedback: "Follow the drop: Room 201-B is the workstation DATA drop (its voice sibling is 201-A to a phone). Workstation data lives in the STAFF subnet." };
      return { pass: false, feedback: "The gateway is not guessed — the 'show ip interface brief' excerpt lists Vlan20 with its address. Copy device truth onto the sheet." };
    },
  };

  var H9 = {
    id: "H9", mode: "hard", sheet: "index", pillar: "P4",
    title: "AUDIT DAY: five changes are scheduled this week — name the one sheet that becomes false for each change if you do nothing.",
    anchor: "Cross-cutting — documentation change-impact thinking",
    check: function (s) {
      var answers = { c1: "inventory", c2: "ipam", c3: "cable", c4: "rack", c5: "sla" };
      var ok = Object.keys(answers).every(function (k) { return s.index.match[k] === answers[k]; });
      if (ok)
        return { pass: true, feedback: "Change-impact thinking unlocked: every operational change invalidates at least one sheet, and you named the victim each time. This reflex — 'what document does this change make stale?' — is what keeps a documentation set alive after the auditors leave." };
      return { pass: false, feedback: "Five changes, five sheets. For each: what physical or logical fact does the change alter — hardware existence, addressing, patching, rack layout, or contractual promise?" };
    },
  };

  var MEDIUM_OBJECTIVES = [M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12];
  var HARD_OBJECTIVES = [H1, H2, H3, H4, H5, H6, H7, H8, H9];

  function objectivesFor(mode) {
    return mode === "medium" ? MEDIUM_OBJECTIVES : HARD_OBJECTIVES;
  }

  // Capstone change scenarios for H9 (kept with validator answers, as in the original)
  var INDEX_CHANGES = [
    { id: "c1", text: "RMA replaces failed SW-IDF2-2 with a brand-new chassis (new serial).", answer: "inventory" },
    { id: "c2", text: "Guest Wi-Fi is re-homed to a brand-new VLAN and subnet.", answer: "ipam" },
    { id: "c3", text: "Desk 201-B is re-patched from panel port 22 to panel port 30.", answer: "cable" },
    { id: "c4", text: "The IDF-2 UPS is swapped for a different 2U model.", answer: "rack" },
    { id: "c5", text: "The ISP contract is renewed, now promising 99.99% uptime.", answer: "sla" },
  ];

  window.LabObjectives = {
    MEDIUM_OBJECTIVES: MEDIUM_OBJECTIVES,
    HARD_OBJECTIVES: HARD_OBJECTIVES,
    objectivesFor: objectivesFor,
    INDEX_CHANGES: INDEX_CHANGES,
  };
})();
