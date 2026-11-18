// ─── CHECK RESULTS validation engine (ported 1:1 from src/lib/lab/objectives.ts) ───
// Every check function mirrors the original's exact verdict logic and feedback strings.
// Shared helpers: norm/eqAny/asRec/asTickets/recScore/exactArr.

(function () {
  "use strict";

  // ── helpers (identical semantics to the original) ────────────────────────
  const norm = (s) =>
    String(s ?? "")
      .toLowerCase()
      .replace(/\bbytes?\b/g, "")
      .replace(/[.\s]+$/g, "")
      .trim()
      .replace(/\s+/g, " ");

  const eqAny = (v, accept) => accept.includes(norm(v));

  const asRec = (a) => (a && typeof a === "object" ? a : {});

  const asTickets = (a) => (a && typeof a === "object" ? a : {});

  const recScore = (ans, correct) => {
    let ok = 0;
    for (const [k, v] of Object.entries(correct)) if (ans[k] === v) ok += 1;
    return { ok, total: Object.keys(correct).length };
  };

  const exactArr = (a, correct) =>
    Array.isArray(a) && a.length === correct.length && correct.every((v, i) => a[i] === v);

  const fail = (msg) => ({ pass: false, feedback: msg });

  const O = () => window.LAB.OPTS;

  // ══ MEDIUM MODE — checks (verbatim port) ═════════════════════════════════
  const MEDIUM_CHECKS = {
    "OBJ-M1": (a) =>
      exactArr(a, ["o-app", "o-pres", "o-ses", "o-tra", "o-net", "o-dl", "o-phys"])
        ? {
            pass: true,
            feedback:
              "Tower stacked! Mnemonic top-down: All People Seem To Need Data Processing; bottom-up: Please Do Not Throw Sausage Pizza Away. A dispatcher who can walk the stack in BOTH directions can translate any symptom into a floor number — that is the whole trick of layered troubleshooting.",
          }
        : fail("Not yet — the plates must read top-down from the user-facing floor to the wire. Try the mnemonic: All People Seem To Need Data Processing."),

    "OBJ-M2": (a) => {
      const { ok, total } = recScore(asRec(a), { "7": "fn-a", "6": "fn-b", "5": "fn-c", "4": "fn-d", "3": "fn-e", "2": "fn-f", "1": "fn-g" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Charter wall complete. Notice the pattern: the upper floors (5–7) SHAPE the conversation; the lower floors (1–4) MOVE it. That is exactly why the TCP/IP model squashes 5–7 into one wing — you will map that in Work Order 08.",
          }
        : fail(`${ok} of ${total} charters match. Watch the verbs — routing (3) is not switching (2), and encrypting (6) is not serving (7).`);
    },

    "OBJ-M3": (a) => {
      const { ok, total } = recScore(asRec(a), { "p-bits": "1", "p-frame": "2", "p-pkt": "3", "p-seg": "4", "p-data": "7" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Cargo tagged. One nuance for the exam: “data” spans Floors 5–7 — all three call their payload data; we anchor the tag at Floor 7. From Floor 4 downward it changes name at every floor: segment → packet → frame → bits. Those names are the fastest encapsulation checker you own.",
          }
        : fail(`${ok} of ${total} tags correct. The PDU names are born in strict stack order — bits lowest, data highest.`);
    },

    "OBJ-M4": (a) => {
      const correct = {
        "pr-http": "7", "pr-https": "7", "pr-dns": "7", "pr-dhcp": "7", "pr-smtp": "7", "pr-ssh": "7",
        "pr-tls": "6", "pr-netbios": "5", "pr-rpc": "5", "pr-tcp": "4", "pr-udp": "4",
        "pr-ip": "3", "pr-icmp": "3", "pr-eth": "2", "pr-arp": "2", "pr-wifi": "2", "pr-base": "1",
      };
      const { ok, total } = recScore(asRec(a), correct);
      return ok === total
        ? {
            pass: true,
            feedback:
              "All 17 routed. Boundary notes (simplified, per the Network+ convention): ARP straddles the L2/L3 line but parks at L2 for the exam; DNS and DHCP are application-layer SERVICES riding on UDP; TLS encrypts at L6 (some texts argue L5). On the exam, give the convention — and know where the debates are.",
          }
        : fail(
            ok >= 12
              ? `${ok} of ${total} correct — near-miss! Re-check the boundary chips: ARP (L2/L3), SSL/TLS (L6 vs L5), DNS/DHCP (services, not transport).`
              : `${ok} of ${total} routed. Start with the sure bets: TCP/UDP → 4, IP/ICMP → 3, web & mail services → 7.`
          );
    },

    "OBJ-M5": (a) => {
      const correct = {
        "hd-hub": "1", "hd-rep": "1", "hd-cat": "1", "hd-sw": "2", "hd-nic": "2", "hd-wap": "2",
        "hd-br": "2", "hd-rtr": "3", "hd-mls": "3", "hd-fw": "4", "hd-pxy": "7",
      };
      const { ok, total } = recScore(asRec(a), correct);
      return ok === total
        ? {
            pass: true,
            feedback:
              "Lockers filed. Note the hybrids (simplified): a multilayer switch ALSO routes (L3), a packet-filter firewall reads ports (L4) and modern firewalls climb up to L7 — the exam wants each device's PRIMARY floor. Proxies speak application protocols (HTTP), so they work on Floor 7.",
          }
        : fail(`${ok} of ${total} filed. The classic trio to separate: hub (1, dumb repeating) vs switch (2, MAC tables) vs router (3, IP tables).`);
    },

    "OBJ-M6": (a) =>
      exactArr(a, ["e-data", "e-tcp", "e-ip", "e-eth", "e-bits"])
        ? {
            pass: true,
            feedback:
              "Dispatch complete — that is ENCAPSULATION. The receiver runs it in reverse (DECAPapsulation): FCS-checked frame stripped to packet, to segment, to data. Every floor adds exactly one envelope, and Layer 2 is the only floor that adds a TRAILER. Say the PDU chain in your sleep: data → segment → packet → frame → bits.",
          }
        : fail("The line jammed — each floor wraps the PREVIOUS floor's PDU exactly once, top-down. Follow the cargo names: data → segment → packet → frame → bits."),

    "OBJ-M7": (a) => {
      const { ok, total } = recScore(asRec(a), { f1: "2", f2: "3", f3: "4", f4: "https", f5: "ipv4", f6: "2" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "One frame, three addresses, three floors: MACs serve the local hop (L2), IPs serve the end-to-end path (L3), ports serve the application (L4). Defenders read frames exactly this way — the header stack IS the story, and every RFC 7042-range MAC in this lab behaves like a real NIC's burned-in address.",
          }
        : fail(`${ok} of ${total} answered. Ask of every field: which DEVICE reads it first — a switch, a router, or the receiving application's stack?`);
    },

    "OBJ-M8": (a) => {
      const { ok, total } = recScore(asRec(a), { "t-web": "tcp", "t-call": "udp", "t-dns": "udp", "t-iso": "tcp", "t-voip": "udp", "t-mail": "tcp" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Six for six. Rule of thumb: INTEGRITY first → TCP (web, files, mail); LATENCY first → UDP (live media, lookups, VoIP). Exam nuance: DNS rides UDP 53 for small queries and falls back to TCP for large answers (zone transfers) — that fallback is a favorite trick question.",
          }
        : fail(`${ok} of ${total} right. The divider is one question: “must every byte arrive, in order?” Yes → TCP (handshake, ACKs, retransmits). No → UDP (no handshake, best effort).`);
    },

    "OBJ-M9": (a) => {
      const { ok, total } = recScore(asRec(a), { "7": "app", "6": "app", "5": "app", "4": "transport", "3": "internet", "2": "access", "1": "access" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Blueprint approved — TCP/IP compresses the tower: Floors 5–7 become ONE Application wing. Practical payoff: a “TCP/IP application-layer problem” could be session (5), encryption (6) or service (7); the OSI tower tells you WHICH. That is exactly why Network+ drills both models.",
          }
        : fail(`${ok} of ${total} mapped. Remember: only Floors 5–7 merge (into Application); 4, 3, and 2+1 each keep their own wing.`);
    },

    "OBJ-M10": (a) => {
      const t = asTickets(a);
      const layerAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.layer]));
      const fixAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.fix]));
      const layerOk = recScore(layerAns, { tk1: "1", tk2: "2", tk3: "3", tk4: "4", tk5: "5", tk6: "7" });
      const fixOk = recScore(fixAns, {
        tk1: "fx-cable", tk2: "fx-duplex", tk3: "fx-lease", tk4: "fx-window", tk5: "fx-idle", tk6: "fx-dnssrv",
      });
      const allOk = layerOk.ok === layerOk.total && fixOk.ok === fixOk.total;
      return allOk
        ? {
            pass: true,
            feedback:
              "Six tickets closed at the right floor. The tower turns “the internet is down” into a 10-minute fix: link (1) → frames (2) → addressing (3) → transport (4) → sessions (5) → services (7). Subtlety worth keeping: an L3 SYMPTOM (APIPA) can come from an L7 service failure (DHCP) — diagnosis names the failing floor, but the fix may live one floor up.",
          }
        : fail(
            `Layers: ${layerOk.ok}/6 · Fixes: ${fixOk.ok}/6. Read the tell-tales again — link (1), CRC (2), APIPA (3), retransmits (4), idle drop (5), name resolution (7) — then pick the fix that lives on that floor.`
          );
    },

    "OBJ-M11": (a) => {
      const { ok, total } = recScore(asRec(a), { sc1: "bu", sc2: "td", sc3: "dc" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Routes assigned. Method selection is triage discipline: start at the floor the EVIDENCE points to. “Nothing works” starts at the bottom (power, cables — cheap checks); “one app misbehaves” starts at the top (the app you can see); two plausible distant causes meet in the middle (often with a ping at L3).",
          }
        : fail(`${ok} of ${total} right. Scope is the giveaway: building-wide outage → bottom-up · one app → top-down · two distant suspects → divide-and-conquer.`);
    },

    "OBJ-M12": (a) =>
      a === "lbl-d"
        ? {
            pass: true,
            feedback:
              "Crate burned — good catch. Routers read Layer 3 IPs; Layer 2 MACs belong to switches and NICs on the LOCAL link, and they are rewritten at every router hop. Mixing those two is the #1 L2-vs-L3 exam trap (and it also explains why IP survives across networks while MACs do not).",
          }
        : fail("Not that one — it is true. Test each label against the reading floors: switches read MACs (2), routers read IPs (3)."),

    "OBJ-M13": (a) => {
      const { ok, total } = recScore(asRec(a), { vb1: "v-led", vb2: "v-crc", vb3: "v-lease", vb4: "v-dns", vb5: "v-syn" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Fix bench signed off — every repair got its proof. Closing the loop is what separates a dispatcher from a parts-swapper: a symptom that fades can return (intermittent duplex), so each fix ends with a floor-specific test — the LED for the link floor, port counters for CRC, a fresh lease for DHCP, nslookup for DNS, a live SYN-ACK for a firewall change. Verify, then write it down.",
          }
        : fail(`${ok} of ${total} proofs matched. Tie each test to the failing floor: an LED proves L1, counters prove L2, ipconfig proves DHCP, nslookup proves DNS, and only a real SYN-ACK proves a port is open again.`);
    },
  };

  // ══ HARD MODE — checks (verbatim port) ═══════════════════════════════════
  const HARD_CHECKS = {
    "OBJ-H1": (a) => {
      const { ok, total } = recScore(asRec(a), { h1a: "4", h1b: "2", h1c: "7", h1d: "7", h1e: "herring" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Board cleared: SMTP refused at L4 (RST on SYN = port closed/filtered — the host answered, the port said no), CRC + duplex flaps at L2, DNS SERVFAIL at L7, DHCP silence at L7 (service down; the SYMPTOM is an L3 address). Healthy lines (ICMP, ARP, print, NTP) are noise — defenders who chase every line drown; triage by floor tell-tales.",
          }
        : fail(`Rejected — ${ok}/5. Near-misses count here: RST is a TRANSPORT refusal (not app), CRC is LINK (not physical-socket), and a healthy ping is never an incident.`);
    },

    "OBJ-H8": (a) => {
      const { ok, total } = recScore(asRec(a), { al1: "b12", al2: "b34", al3: "bh", al4: "b57", al5: "bh", al6: "b34" });
      return ok === total
        ? {
            pass: true,
            feedback:
              "Classified. CRC = link floor; RST storm + APIPA = path/transport band (APIPA is an L3 SYMPTOM of an L7 DHCP failure — you classify by where you investigate FIRST); “session expired” = services band; a normal baseline and a green icon are not incidents. Noise costs minutes; classification buys them back.",
          }
        : fail(`Rejected — ${ok}/6. A green icon and a baseline match are NOT alerts; CRC is link-floor; APIPA belongs to the addressing band (3–4).`);
    },

    "OBJ-H3": (a) => {
      const t = asTickets(a);
      const layerAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.layer]));
      const fixAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.fix]));
      const layerOk = recScore(layerAns, { cf1: "2", cf2: "3", cf3: "4", cf4: "7" });
      const fixOk = recScore(fixAns, { cf1: "cfx1", cf2: "cfx2", cf3: "cfx3", cf4: "cfx4" });
      const allOk = layerOk.ok === layerOk.total && fixOk.ok === fixOk.total;
      return allOk
        ? {
            pass: true,
            feedback:
              "Four configs labeled: VLAN = frames (2) · mask/gateway = addressing (3) · port rule = transport (4) · PAC/proxy = application service (7). Same ladder the storm plan uses — and note the trap you avoided: VLANs feel abstract but they tag FRAMES, so they live on Floor 2.",
          }
        : fail(`Rejected — floors ${layerOk.ok}/4, fixes ${fixOk.ok}/4. Label by WHAT the config touches: frames, addresses, ports, or application settings.`);
    },

    "OBJ-H7": (a) => {
      const ans = asRec(a);
      const okCount =
        (ans.h7a === "udp" ? 1 : 0) +
        (eqAny(ans.h7b, ["dns", "domain name system", "domain name service"]) ? 1 : 0) +
        (eqAny(ans.h7c, ["1", "one"]) ? 1 : 0) +
        (ans.h7d === "4" ? 1 : 0) +
        (eqAny(ans.h7e, ["1500"]) ? 1 : 0);
      return okCount === 5
        ? {
            pass: true,
            feedback:
              "Read like an analyst: proto 17 + port 53 = a DNS query inside a UDP datagram (L4 built that header), TTL 63 = exactly one hop down (L3 bookkeeping), MTU 1500 = the ceiling whose violation causes L3 fragmentation. Small pings passing while big transfers die is the classic MTU black hole — keep that signature in your pocket.",
          }
        : fail(`Rejected — ${okCount}/5 exact. Near-misses are not accepted: “2 hops” for TTL 63, “TCP” for proto 17, or “1400” for MTU are all wrong for specific reasons. Re-read the header.`);
    },

    "OBJ-H2": (a) =>
      exactArr(a, ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"])
        ? {
            pass: true,
            feedback:
              "Round trip rebuilt, distractors burned. The symmetry IS the concept: every wrap on the way down has a matching unwrap on the way up; L2 is the only floor that adds a TRAILER (FCS — sender-side only); and ports live in the L4 header, never in IP's. Adjacent-layer interaction: each floor serves only the floor above and below; same-layer interaction: sender L4 talks to receiver L4 through those headers.",
          }
        : fail("Rejected — the trip must use exactly the 10 real cards in order. Two suspects: a receiver-side FCS ADD (receivers STRIP) and ports inside the IP header (ports live in L4)."),

    "OBJ-H6": (a) => {
      const correct = {
        "gs-frame": "2", "gs-rtr": "3", "gs-tcp": "4", "gs-netbios": "5", "gs-tls": "6", "gs-http": "7",
        "gs-hub": "1", "gs-pkt": "3", "gs-sw": "2", "gs-icmp": "3", "gs-bits": "1", "gs-udp": "4",
      };
      const { ok, total } = recScore(asRec(a), correct);
      return ok === total
        ? {
            pass: true,
            feedback:
              "Twelve for twelve, one pass. PDU names (bits/frame/packet), devices (hub/switch/router) and protocols (TCP·UDP → 4, ICMP → 3, NetBIOS → 5, TLS → 6, HTTP → 7) — that is the whole tower in a single crate, which is precisely the fluency the exam tests with matching questions.",
          }
        : fail(`Rejected — ${ok}/12. All-or-nothing floor. The usual suspects: TLS is Floor 6 (not 5 for this exam), ICMP rides Floor 3, NetBIOS manages conversations on Floor 5.`);
    },

    "OBJ-H4": (a) => {
      const t = asTickets(a);
      const layerAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.layer]));
      const fixAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.fix]));
      const layerOk = recScore(layerAns, { "bp-arp": "2", "bp-icmp": "3", "bp-tls": "6", "bp-dns": "7" });
      const fixOk = recScore(fixAns, { "bp-arp": "r-arp", "bp-icmp": "r-icmp", "bp-tls": "r-tls", "bp-dns": "r-dns" });
      const allOk = layerOk.ok === layerOk.total && fixOk.ok === fixOk.total;
      return allOk
        ? {
            pass: true,
            feedback:
              "Boundary protocols judged — placements AND rationales correct. These four are where exams and real stacks disagree slightly (ARP: 2/3 boundary; TLS: 6 vs 5; DNS/DHCP: services over UDP). Saying “the convention is X, the debate is Y” is the senior answer, in exams and in interviews.",
          }
        : fail(`Rejected — placements ${layerOk.ok}/4, rationales ${fixOk.ok}/4. Anchor on function: MACs → 2 · IP's helper → 3 · encryption → 6 · user-visible service → 7.`);
    },

    "OBJ-H9": (a) => {
      const t = asTickets(a);
      const trAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.layer]));
      const rsAns = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.fix]));
      const trOk = recScore(trAns, { "ds-pay": "tcp", "ds-ntp": "udp", "ds-vid": "udp" });
      const rsOk = recScore(rsAns, { "ds-pay": "rs-integrity", "ds-ntp": "rs-lean2", "ds-vid": "rs-speed2" });
      const allOk = trOk.ok === trOk.total && rsOk.ok === rsOk.total;
      return allOk
        ? {
            pass: true,
            feedback:
              "Design desk signed off. Transport selection is a workload decision: TCP when correctness beats latency (payments, files, mail — handshake, ACKs, ordering); UDP when latency beats retransmission (live media, lookups, clock sync). NTP is the subtle one: tiny frequent queries where handshake overhead would dwarf the payload.",
          }
        : fail(`Rejected — transports ${trOk.ok}/3, reasons ${rsOk.ok}/3. Pair the choice with the workload's pain: lost money (TCP) vs lost milliseconds (UDP).`);
    },

    "OBJ-H5": (a) =>
      exactArr(a, ["p1", "p2", "p3", "p4", "p5", "p6"])
        ? {
            pass: true,
            feedback:
              "Plan approved — bottom-up under pressure: cheapest checks first (eyes and LEDs), expensive ones last (services, vendors). Divide-and-conquer is the legitimate alternative when time is short: a single ping at L3 splits the tower in half and tells you which half to storm. Documenting LAST is not bureaucracy — it is how the next shift avoids re-learning your night.",
          }
        : fail("Plan rejected — order the six actions so each floor is trusted before the floor above it. Power and LEDs before switch stats, addressing before ports, services last, documentation as the close-out."),
  };

  // ── derived helpers (ported from store.ts) ───────────────────────────────
  const objectivesFor = (mode) =>
    mode === "medium" ? window.LAB.OBJECTIVES.medium : window.LAB.OBJECTIVES.hard;

  function computeStars(mode, objState) {
    const objs = objectivesFor(mode);
    const n = objs.length || 1;
    const firstTryCount = objs.filter((o) => objState[o.id] && objState[o.id].firstTry === true).length;
    const hints = objs.reduce((acc, o) => acc + ((objState[o.id] && objState[o.id].hintsUsed) || 0), 0);
    const score = (firstTryCount / n) * 100 - hints * 3;
    return score >= 85 ? 3 : score >= 58 ? 2 : 1;
  }

  function quizScore(mode, quizAnswers) {
    const qs = window.LAB.QUIZ[mode];
    const correct = qs.filter((q) => quizAnswers[q.id] === q.correct).length;
    const answered = qs.filter((q) => quizAnswers[q.id] !== undefined).length;
    return { correct, total: qs.length, answered };
  }

  function runObjectiveCheck(obj, answer) {
    const table = obj.mode === "medium" ? MEDIUM_CHECKS : HARD_CHECKS;
    return table[obj.id](answer);
  }

  // exported engine API
  window.LabEngine = {
    norm,
    eqAny,
    asRec,
    asTickets,
    recScore,
    exactArr,
    objectivesFor,
    computeStars,
    quizScore,
    runObjectiveCheck,
    opts: O,
  };
})();
