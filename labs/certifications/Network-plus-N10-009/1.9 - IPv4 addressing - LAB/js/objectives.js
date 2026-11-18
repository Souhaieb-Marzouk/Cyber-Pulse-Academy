// ── Objective definitions + machine-checkable validators ────────────────────
// Faithful port of src/lib/lab/objectives.ts — ids, pillars, titles, texts,
// where-pointers, hint tiers, anchors, validators and feedback wording are 1:1.
"use strict";

var H1_FAULTY = ["T-102", "T-104", "T-105", "T-107", "T-108", "T-109"];

var OBJECTIVES = (function () {
  const { normIp, normPrefix, blockInfo } = NET;

  // helper: cidr string normalize "ip/prefix"
  const normCidr = (s) => {
    const [ip, p] = s.split("/");
    if (!ip || p === undefined) return s.trim();
    return `${normIp(ip)}/${Number(p.trim())}`;
  };

  const setEq = (a, b) =>
    a.length === b.length && new Set(a).size === new Set(b).size && b.every((x) => a.includes(x));

  return [
    // ── MEDIUM · Day Shift ──────────────────────────────────────────────────
    {
      id: "OBJ-M1",
      pillar: "P1",
      title: "Class the billets",
      text: "On the Machining Floor, stamp each of the 6 billet addresses with its class (A–E).",
      zone: "floor",
      where: "Machining Floor → Class Press",
      hints: [
        "Only the FIRST octet decides the class.",
        "A: 1–126 · B: 128–191 · C: 192–223 · D: 224–239 · E: 240–255.",
        "Example: 198.51.100.7 → first octet 198 → Class C.",
      ],
      anchor: "Address classes (A, B, C, D, E)",
      validate: (env) => {
        const all = M1_ADDRS.every((a) => env.press.m1[a] === M1_TRUTH[a]);
        return all
          ? {
              pass: true,
              feedback:
                "Stamped true. First octet rules: A 1–126 (mask /8), B 128–191 (/16), C 192–223 (/24), D 224–239 multicast, E 240–255 experimental. Remember: 127 inside 'A space' is the loopback block, and 0 is the 'this network' block.",
            }
          : {
              pass: false,
              feedback:
                "Not yet — read only the FIRST octet: A: 1–126, B: 128–191, C: 192–223, D: 224–239 (multicast), E: 240–255 (experimental).",
            };
      },
    },
    {
      id: "OBJ-M2",
      pillar: "P1",
      title: "RFC1918 estates",
      text: "Mark exactly which of the 8 intake addresses sit inside the three RFC 1918 private blocks.",
      zone: "floor",
      where: "Machining Floor → Private Press",
      hints: [
        "Private = only three blocks: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.",
        "The 172.16/12 block ENDS at 172.31.255.255 — 172.32 is public. Same idea for 192.169.",
        "172.31.200.1 → private · 172.32.7.7 → public · 192.169.5.5 → public.",
      ],
      anchor: "RFC1918 + public vs private",
      validate: (env) => {
        const selected = env.press.m2;
        const truth = M2_ADDRS.filter((a) => M2_TRUTH[a]);
        return setEq(selected, truth)
          ? {
              pass: true,
              feedback:
                "Clean pick: 10.140.9.9, 172.16.4.99, 172.31.200.1, 192.168.50.1 are RFC 1918; 172.15.x, 172.32.x, 192.169.x and 8.8.8.8 are public. The /12 boundary (ends 172.31.255.255) is a favorite exam trap.",
            }
          : {
              pass: false,
              feedback:
                "Re-check the boundaries: private = 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255. Watch 172.32.x and 192.169.x — both are public.",
            };
      },
    },
    {
      id: "OBJ-M3",
      pillar: "P2",
      title: "APIPA at the dock",
      text: "Open work order T-102 at the Dock, name the root cause of its address, and pick the correct fix.",
      zone: "dock",
      where: "Dock → work order T-102 → diagnosis panel",
      hints: [
        "Look at the address the scanner actually holds: 169.254.197.88.",
        "169.254.0.0/16 is APIPA — self-assigned when DHCP never answers.",
        "Fix the cause (DHCP), then renew and verify a real 192.168.x lease.",
      ],
      anchor: "APIPA (169.254.0.0/16): cause, mechanism, remediation",
      validate: (env) => {
        const ok = env.dock.m3cause === "dhcp" && env.dock.m3fix === "renew";
        return ok
          ? {
              pass: true,
              feedback:
                "Diagnosis stamped: no DHCP answer → the host self-assigned 169.254.197.88/16 with no gateway (APIPA). It can only talk on its own segment. A defender restores/reaches DHCP, renews, and verifies a real lease — APIPA is a symptom, never a solution.",
            }
          : {
              pass: false,
              feedback: `Re-read T-102's report: an Autoconfiguration address 169.254.x.x with no gateway is the APIPA signature (DHCP got no answer). Cause: "${
                (M3_CAUSES.find((c) => c.key === env.dock.m3cause) || {}).label ?? "none picked"
              }" and fix "${
                (M3_FIXES.find((f) => f.key === env.dock.m3fix) || {}).label ?? "none picked"
              }" don't hold together — the fix must address DHCP and end with a verified real lease.`,
            };
      },
    },
    {
      id: "OBJ-M4",
      pillar: "P2",
      title: "Evidence sorting press",
      text: "Press-sort the 6 evidence addresses into private / public / loopback / APIPA / multicast bins.",
      zone: "floor",
      where: "Machining Floor → Type Press",
      hints: [
        "Shortcuts: first octet 127 → loopback; 169.254 → APIPA; 224–239 → multicast.",
        "Then apply RFC 1918 (10/8, 172.16/12, 192.168/16) — whatever remains is public.",
        "192.168.1.50 → private · 172.20.1.5 → private.",
      ],
      anchor: "Public vs private, loopback, APIPA, multicast recognition",
      validate: (env) => {
        const ok = M4_ADDRS.every((a) => env.press.m4[a] === M4_TRUTH[a]);
        return ok
          ? {
              pass: true,
              feedback:
                "Sorted clean. Recognition order that never fails: 127.x → loopback, 169.254.x → APIPA, 224–239 → multicast, RFC 1918 → private, everything else → public. That's the reflex the exam (and a SOC triage) rewards.",
            }
          : {
              pass: false,
              feedback:
                "Sort again: 127.0.0.1 loopback · 169.254.88.2 APIPA · 239.255.255.250 multicast · 172.20.1.5 & 192.168.1.50 private · 203.0.113.44 public.",
            };
      },
    },
    {
      id: "OBJ-M5",
      pillar: "P3",
      title: "Loopback first",
      text: "At the Test Bench, ping 127.0.0.1, then ping the gateway 192.168.10.1, and choose the correct interpretation.",
      zone: "bench",
      where: "Test Bench → run the two pings → interpretation dial",
      hints: [
        "Run `ping 127.0.0.1` and `ping 192.168.10.1` on the bench host (WS-TRN-02).",
        "Run `ipconfig` too — what address did the bench host actually get?",
        "Loopback OK + everything else dead = the stack is fine; the fault is beyond the host.",
      ],
      anchor: "Loopback 127.0.0.0/8 as the first triage step",
      validate: (env) => {
        const ranL = env.bench.ran.includes("ping 127.0.0.1");
        const ranG = env.bench.ran.includes("ping 192.168.10.1");
        const ok = ranL && ranG && env.bench.m5interp === "ok_beyond";
        if (ok)
          return {
            pass: true,
            feedback:
              "Textbook triage: loopback replies (stack healthy), gateway times out, and ipconfig shows the bench host on 169.254.44.10 — APIPA. The host is innocent; DHCP/network is the suspect. This ordering saves hours in real outages.",
          };
        const dial = (M5_OPTIONS.find((o) => o.key === env.bench.m5interp) || {}).label;
        return {
          pass: false,
          feedback: `Need all three pieces: run ping 127.0.0.1, run ping 192.168.10.1, then set the interpretation dial. ${
            dial ? `Current dial: "${dial}".` : "No interpretation set yet."
          }`,
        };
      },
    },
    {
      id: "OBJ-M6",
      pillar: "P3",
      title: "Wrong-mask case",
      text: "Open work order T-104: identify the addressing fault and enter the mask that should be on this /24 floor.",
      zone: "dock",
      where: "Dock → work order T-104 → fault + corrected mask field",
      hints: [
        "192.168.10.77 works with .10.x but not .11.x — what does the mask claim is 'local'?",
        "255.255.0.0 declares ALL of 192.168.x.x local, so 192.168.11.20 is ARPed, not routed.",
        "This floor is 192.168.10.0/24 → mask 255.255.255.0.",
      ],
      anchor: "Subnet mask troubleshooting (wrong-mask symptoms)",
      validate: (env) => {
        const ok = env.dock.m6fault === "broad" && normIp(env.dock.m6mask) === "255.255.255.0";
        return ok
          ? {
              pass: true,
              feedback:
                "Confirmed: mask 255.255.0.0 hides the router — the host believes 192.168.11.20 is on-link and ARPs forever. Corrected to 255.255.255.0, the print server becomes a routed hop. The mask defines where 'local' ends; get it wrong and routing silently dies.",
            }
          : {
              pass: false,
              feedback: `Fault pick: "${
                (M6_FAULTS.find((f) => f.key === env.dock.m6fault) || {}).label ?? "none"
              }". Compare the mask in the report (255.255.0.0) with the floor's real /24 design, and enter the corrected mask as four dotted octets.`,
            };
      },
    },
    {
      id: "OBJ-M7",
      pillar: "P4",
      title: "Prefix press",
      text: "Machine the conversions: three prefixes → masks, three masks → prefixes.",
      zone: "floor",
      where: "Machining Floor → Conversion Press",
      hints: [
        "Count network bits, then fill octets left to right: 8 bits per octet.",
        "/20 = 255.240.0.0 (second octet: 8 ones then 4 zeros → 128+64+32+16 = 240).",
        "Defaults still matter: /8 = 255.0.0.0, /16 = 255.255.0.0, /24 = 255.255.255.0.",
      ],
      anchor: "CIDR notation ↔ dotted-decimal masks (incl. class defaults /8 /16 /24)",
      validate: (env) => {
        const want = { "/26": "255.255.255.192", "/20": "255.255.240.0", "/29": "255.255.255.248" };
        const a = M7_TO_MASK.every((p) => normIp(env.solver.m7a[p] ?? "") === want[p]);
        const wantB = { "255.0.0.0": "/8", "255.255.255.0": "/24", "255.255.0.0": "/16" };
        const b = M7_TO_PREFIX.every((m) => normPrefix(env.solver.m7b[m] ?? "") === wantB[m]);
        return a && b
          ? {
              pass: true,
              feedback:
                "Machined perfectly. Method to keep: for /n, light n bits (128,192,224,240,248,252,254,255 per partial octet) and zero the rest. /26 → 255.255.255.192, /20 → 255.255.240.0, /29 → 255.255.255.248.",
            }
          : {
              pass: false,
              feedback:
                "One or more conversions are off. Bit values inside an octet: 128, 192, 224, 240, 248, 252, 254, 255. E.g. /26 = 24 network bits + 2 in the 4th octet → 128+64=192 → 255.255.255.192.",
            };
      },
    },
    {
      id: "OBJ-M8",
      pillar: "P4",
      title: "Network math bench",
      text: "For billet 192.168.40.117/26: machine the network address, broadcast address, and first/last usable host.",
      zone: "floor",
      where: "Machining Floor → Subnet Solver (the 32-bit rail lights the block)",
      hints: [
        "/26 blocks are 64 wide: 0, 64, 128, 192. Which block holds 117?",
        "117 lives in 64–127 → network 192.168.40.64, broadcast 192.168.40.127.",
        "Usable range excludes both ends: .65 through .126.",
      ],
      anchor: "Network/broadcast/first/last-usable computation",
      validate: (env) => {
        const b = blockInfo(M8_IP, M8_PREFIX);
        const g = env.solver.m8;
        const ok =
          normIp(g.network) === b.network &&
          normIp(g.broadcast) === b.broadcast &&
          normIp(g.first) === b.first &&
          normIp(g.last) === b.last;
        return ok
          ? {
              pass: true,
              feedback:
                "Machined to spec: 192.168.40.64/26 → hosts .65–.126 (62 usable), broadcast .127. Block-size arithmetic (64) gives you every answer in one line — this is the exam's bread and butter.",
            }
          : {
              pass: false,
              feedback:
                "Use the block method: /26 = 64-address blocks starting at 0, 64, 128, 192. 117 falls in 64–127: network .64, broadcast .127, usable .65–.126.",
            };
      },
    },
    {
      id: "OBJ-M9",
      pillar: "P4",
      title: "Capacity planner",
      text: "Pick the smallest prefix that still fits each order: 50 hosts, 300 hosts, and a 2-host router link.",
      zone: "floor",
      where: "Machining Floor → Capacity Planner",
      hints: [
        "Usable hosts = 2^hostbits − 2. So: /26→62, /25→126, /24→254, /23→510, /30→2.",
        "50 hosts need ≥50 usable → /26 (62). 300 need ≥300 → /23 (510); a /24 gives only 254.",
        "Point-to-point link: /30 is the classic — exactly 2 usable.",
      ],
      anchor: "Host-count math 2^h − 2 and smallest-fitting-prefix selection",
      validate: (env) => {
        const ok = Object.keys(M9_TRUTH).every((k) => normPrefix(env.solver.m9[k] ?? "") === M9_TRUTH[k]);
        return ok
          ? {
              pass: true,
              feedback:
                "Sized right: 50→/26 (62 usable), 300→/23 (510), point-to-point→/30 (2). Smallest-fitting-prefix discipline is what keeps address space (and route tables) from rotting.",
            }
          : {
              pass: false,
              feedback:
                "Recompute 2^h − 2 per candidate: /27→30, /26→62, /25→126, /24→254, /23→510, /30→2. Pick the smallest that still fits the order.",
            };
      },
    },
    {
      id: "OBJ-M10",
      pillar: "P4",
      title: "Assignment plan",
      text: "At Dispatch, choose the right address type for each of the 5 roles on the site plan.",
      zone: "loadout",
      where: "Loadout → Assignment Plan board",
      hints: [
        "Anything facing the ISP directly needs a PUBLIC address.",
        "Inside the plant: private. Static when it must be findable (server, printer), DHCP for crowds.",
        "A machine that only ever tests its own stack talks to 127.0.0.1 — loopback.",
      ],
      anchor: "Public vs private + NAT; address-type decisions per role",
      validate: (env) => {
        const ok = M10_DEVICES.every((d) => env.plan.m10[d.key] === M10_TRUTH[d.key]);
        return ok
          ? {
              pass: true,
              feedback:
                "Plan approved: public only where the internet must reach in (WAN, with NAT protecting the inside); private static for things that must be found; private DHCP for the crowd; loopback for the self-test bench. APIPA is never a plan — it's what happens when plans fail.",
            }
          : {
              pass: false,
              feedback:
                "Re-assign: WAN→public (routable, NAT at the edge), server & printer→private-static, workstations→private-dhcp, QA self-test bench→loopback (127.0.0.1). APIPA fits none of these.",
            };
      },
    },
    {
      id: "OBJ-M11",
      pillar: "P2",
      title: "The reject bin",
      text: "Among the 9 intake addresses, flag every one that can NEVER be assigned to a host interface.",
      zone: "floor",
      where: "Machining Floor → Reject Bin",
      hints: [
        "Every subnet's first address (network) and last address (broadcast) are spoken for.",
        "0.0.0.0 = 'this host/unspecified'; 255.255.255.255 = limited broadcast to everyone.",
        "224.0.0.5 is Class D multicast; 240.5.5.5 is Class E experimental — neither goes on a host NIC.",
      ],
      anchor: "Special/reserved addresses (0.0.0.0, limited broadcast, network/broadcast, Class D/E)",
      validate: (env) => {
        const truth = M11_ADDRS.filter((a) => M11_TRUTH[a]);
        return setEq(env.press.m11, truth)
          ? {
              pass: true,
              feedback:
                "Rejects stamped: 192.168.10.0 (network), 192.168.10.255 (broadcast), 240.5.5.5 (Class E), 0.0.0.0 (unspecified), 255.255.255.255 (limited broadcast), 224.0.0.5 (multicast). Assignable: .1, 172.16.9.9, 198.51.100.25.",
            }
          : {
              pass: false,
              feedback:
                "Count carefully: network & broadcast of the block, 0.0.0.0, 255.255.255.255, multicast 224.0.0.5, and Class E 240.5.5.5 are all unassignable. The other three are ordinary host addresses.",
            };
      },
    },
    {
      id: "OBJ-M12",
      pillar: "P4",
      title: "VLSM load-out",
      text: "Load four departments (100/50/25/10 hosts) onto 192.168.50.0/24 largest-first, then give ONE summary route for the whole site.",
      zone: "loadout",
      where: "Loadout → VLSM Load-out table + summary manifest",
      hints: [
        "Sort by size: 100→/25 (126), 50→/26 (62), 25→/27 (30), 10→/28 (14).",
        "Largest-first from the base: Sales 192.168.50.0/25; next free address is .128.",
        "Eng .128/26 → next free .192; Fin .192/27 → next free .224; IT .224/28. The whole site is one /24 → summary 192.168.50.0/24.",
      ],
      anchor: "VLSM right-sizing (largest-first) + route summarization",
      validate: (env) => {
        const rowsOk = M12_DEPTS.every(
          (d) =>
            normPrefix((env.loadout.m12[d.key] || {}).prefix ?? "") === M12_TRUTH[d.key].prefix &&
            normIp((env.loadout.m12[d.key] || {}).network ?? "") === M12_TRUTH[d.key].network
        );
        const sumOk = normCidr(env.loadout.m12sum || "") === M12_SUM;
        return rowsOk && sumOk
          ? {
              pass: true,
              feedback:
                "Load-out accepted: .0/25 → .128/26 → .192/27 → .224/28, zero waste, zero overlap — and the whole site summarizes as 192.168.50.0/24. That's VLSM plus aggregation in one motion: small route tables, tidy address space.",
            }
          : {
              pass: false,
              feedback:
                "Check each row: Sales 192.168.50.0/25, Engineering 192.168.50.128/26, Finance 192.168.50.192/27, IT 192.168.50.224/28, largest first, and the summary is the base block 192.168.50.0/24.",
            };
      },
    },

    // ── HARD · Night Shift ──────────────────────────────────────────────────
    {
      id: "OBJ-H1",
      pillar: "P3",
      title: "Night triage",
      text: "Ten work orders on the night board. Read the reports and flag EVERY device with a genuine addressing fault — decoys included.",
      zone: "dock",
      where: "No pointers on night shift — the queue is the queue.",
      hints: [
        "Faults hide in plain sight: compare each address against RFC 1918 boundaries, the floor's /24 design, and duplicate statics.",
      ],
      anchor: "APIPA, duplicate IP, wrong mask, wrong-subnet static, public-range-on-LAN",
      validate: (env) => {
        const ok = setEq(env.dock.h1, H1_FAULTY);
        return ok
          ? {
              pass: true,
              feedback:
                "All six caught: T-102 (APIPA), T-104 (mask too broad), T-105+T-107 (duplicate 192.168.10.20), T-108 (public-range 172.32.14.7 on an internal NIC), T-109 (static on the wrong subnet). T-101/T-106 healthy, T-103's multicast is normal, T-110 is a documentation-range DMZ host.",
            }
          : {
              pass: false,
              feedback:
                "Not the full set (or a decoy slipped in). Six devices are faulty; four tickets are healthy noise — including one 'slow Wi-Fi' and one 'suspicious public IP' that is actually a legitimate documentation-range DMZ host. Check 172.32.14.7 against the 172.16/12 boundary.",
            };
      },
    },
    {
      id: "OBJ-H2",
      pillar: "P4",
      title: "Full VLSM load-out",
      text: "Carve 10.20.0.0/24 into five right-sized subnets for Operations (120), Secure lab (60), Guest Wi-Fi (30), Cameras (12) and UPS/PDU (6). Largest-first, zero overlap.",
      zone: "loadout",
      where: "No pointers on night shift.",
      hints: ["Largest-first from the base, each next subnet starts at the first free address."],
      anchor: "VLSM design on a fresh base block (5 subnets)",
      validate: (env) => {
        const rowsOk = H2_DEPTS.every(
          (d) =>
            normPrefix((env.loadout.h2[d.key] || {}).prefix ?? "") === H2_TRUTH[d.key].prefix &&
            normIp((env.loadout.h2[d.key] || {}).network ?? "") === H2_TRUTH[d.key].network
        );
        return rowsOk
          ? {
              pass: true,
              feedback:
                "Plan verified: Ops 10.20.0.0/25 · Lab 10.20.0.128/26 · Guests 10.20.0.192/27 · Cameras 10.20.0.224/28 · UPS 10.20.0.240/29. Contiguous, non-overlapping, minimal waste — a defensible design you could defend in a change-review board.",
            }
          : {
              pass: false,
              feedback:
                "Rejected — near-misses cost real outages. Largest-first from 10.20.0.0: /25 (0–127), /26 (128–191), /27 (192–223), /28 (224–239), /29 (240–247). Every network address must land on its own block boundary and every dept must actually fit.",
            };
      },
    },
    {
      id: "OBJ-H3",
      pillar: "P2",
      title: "Summarize the manifest",
      text: "The edge router holds four Plant-A routes. Enter the single tightest summary (CIDR) that covers exactly those four.",
      zone: "loadout",
      where: "No pointers on night shift.",
      hints: ["Four contiguous /24s starting at an even /22 boundary collapse into one /22."],
      anchor: "Route summarization / CIDR aggregation",
      validate: (env) => {
        const ok = normCidr(env.loadout.h3sum || "") === H3_SUM;
        return ok
          ? { pass: true, feedback: "Advertised: 172.16.8.0/22 — one route replaces four. Note the distractor: summarizing toward 0.0.0.0/0 would blackhole the site." }
          : { pass: false, feedback: "Not tight (or too wide). The four /24s 172.16.8.0–172.16.11.255 span exactly a /22 whose third octet starts at 8 (8 is divisible by 4). The default route is a trap." };
      },
    },
    {
      id: "OBJ-H4",
      pillar: "P2",
      title: "Deep machining",
      text: "Machine 172.20.100.77/22 (network, broadcast, usable count) and the network address of 10.77.203.14/13.",
      zone: "floor",
      where: "No pointers on night shift.",
      hints: ["/22 blocks are 4 wide in the third octet; /13 blocks are 8 wide in the second octet."],
      anchor: "Non-boundary prefixes (/22, /13): network/broadcast/usable math",
      validate: (env) => {
        const b = blockInfo(H4A_IP, H4A_PREFIX);
        const g = env.solver.h4a;
        const okA = normIp(g.network) === b.network && normIp(g.broadcast) === b.broadcast && g.usable.trim() === String(b.usable);
        const okB = normIp(env.solver.h4b) === "10.72.0.0";
        return okA && okB
          ? {
              pass: true,
              feedback:
                "Machined clean: 172.20.100.0/22 → broadcast 172.20.103.255, 1022 usable. 10.77.203.14/13 → network 10.72.0.0 (blocks of 8 in the 2nd octet: 72–79). If you can do /13 and /22 in your head, the exam's subnetting items are free points.",
            }
          : {
              pass: false,
              feedback:
                "Anchor on block sizes: /22 → third octet in blocks of 4 (100–103) → network 172.20.100.0, broadcast 172.20.103.255, usable 2^10−2 = 1022. /13 → second octet in blocks of 8 (72–79) → network 10.72.0.0.",
            };
      },
    },
    {
      id: "OBJ-H5",
      pillar: "P1",
      title: "Boundary audit",
      text: "Classify all 10 audit addresses into the seven categories — every classic trap is on this bench.",
      zone: "floor",
      where: "No pointers on night shift.",
      hints: ["Verify BOTH ends of every private block before stamping; three addresses sit exactly one octet outside."],
      anchor: "Classes, RFC1918 boundaries, APIPA, loopback, multicast, Class E, limited broadcast",
      validate: (env) => {
        const ok = H5_ADDRS.every((a) => env.press.h5[a] === H5_TRUTH[a]);
        return ok
          ? {
              pass: true,
              feedback:
                "Audit passed: 172.31.255.9 private (last /12 octet!) · 172.32.1.9 & 192.169.1.1 & 8.8.8.8 & 198.51.100.9 public · 169.254.100.5 APIPA · 127.8.8.8 loopback · 240.1.1.1 Class E · 224.0.0.251 multicast · 255.255.255.255 limited broadcast.",
            }
          : {
              pass: false,
              feedback:
                "Some stamps are wrong. Private = 10/8 + 172.16.0.0–172.31.255.255 + 192.168/16 only. 127.x is loopback, 169.254.x is APIPA, 224–239 multicast, 240–255 experimental, 255.255.255.255 limited broadcast.",
            };
      },
    },
    {
      id: "OBJ-H6",
      pillar: "P3",
      title: "Repair sequence",
      text: "A floor-wide DHCP outage has hosts on 169.254.x. Gather bench evidence (loopback ping + ipconfig), then order the repair steps — one listed step is a trap that must be left out.",
      zone: "bench",
      where: "No pointers on night shift.",
      hints: ["Diagnose before you change anything, verify after you fix; the static APIPA 'fix' is the trap."],
      anchor: "APIPA remediation as an ordered, verified procedure",
      validate: (env) => {
        const ran = env.bench.ran.includes("ping 127.0.0.1") && env.bench.ran.includes("ipconfig");
        const seqOk = env.bench.h6.length === H6_ORDER.length && env.bench.h6.every((id, i) => id === H6_ORDER[i]);
        return ran && seqOk
          ? {
              pass: true,
              feedback:
                "Sequence certified: symptom → config → path → root cause (DHCP) → renew → verify lease → verify end-to-end. You left the static-169.254 trap on the bench — hard-coding a link-local address would have outlived the outage.",
            }
          : {
              pass: false,
              feedback: `${ran ? "" : "Bench evidence missing: run ping 127.0.0.1 and ipconfig first. "}${
                seqOk ? "" : "The order must go symptom → evidence → path → DHCP root cause → renew → verify lease → verify end-to-end, and one step is a trap that never belongs in the plan."
              }`,
            };
      },
    },
    {
      id: "OBJ-H7",
      pillar: "P4",
      title: "Edge plan",
      text: "A public web server goes live behind the plant edge. Pick the correct addressing plan and justify it (name the mechanism and the address class you rely on).",
      zone: "loadout",
      where: "No pointers on night shift.",
      hints: ["Exactly one plan uses public space only where the internet must reach, private space inside, and translation between them."],
      anchor: "Public vs private + NAT/PAT at the edge",
      validate: (env) => {
        const just = (env.plan.h7just || "").toLowerCase();
        const ok = env.plan.h7plan === H7_TRUTH && just.includes("nat") && just.includes("private");
        return ok
          ? {
              pass: true,
              feedback:
                "Plan A ratified: public /29 on the WAN, RFC 1918 inside, NAT/PAT translating at the edge. Public space stays scarce, internal hosts stay unaddressable from outside, and the server's private interface never routes. (Beyond-lesson link: that unaddressability is also why segmentation blunts attacks like external remote-service exposure.)",
            }
          : {
              pass: false,
              feedback:
                "Rejected. B puts a private address on the WAN (unroutable), C leaves the edge on APIPA, D burns public addresses on every LAN host. The correct plan pairs a public WAN with a private LAN and names the translation mechanism — and your justification must actually say NAT and private.",
            };
      },
    },
    {
      id: "OBJ-H8",
      pillar: "P3",
      title: "Rogue DHCP",
      text: "The DHCP log shows two servers answering. Name the rogue server's IP, mark every client it leased, and choose the containment action.",
      zone: "dock",
      where: "No pointers on night shift — the DHCP log tab is on the Dock.",
      hints: ["One lease source is not your authorized 192.168.10.5 scope."],
      anchor: "DHCP evidence analysis + containment (rogue DHCP)",
      validate: (env) => {
        const okIp = normIp(env.dock.h8ip) === H8_IP;
        const okHosts = setEq(env.dock.h8hosts, H8_HOSTS_TRUTH);
        const okAct = env.dock.h8action === "snooping";
        return okIp && okHosts && okAct
          ? {
              pass: true,
              feedback:
                "Contained: rogue = 192.168.99.1 leasing WS-07, WS-12, WS-15; snooping + port shutdown + single authorized server is the standard counter. A rogue DHCP server controls where clients point their gateways — that's a man-in-the-middle primitive, not a fat-finger nuisance. (Beyond-lesson link: ATT&CK Adversary-in-the-Middle.)",
            }
          : {
              pass: false,
              feedback: `Check the three answers: rogue server IP (the one NOT matching your 192.168.10.5 scope), the exact clients holding its leases (WS-22 and WS-FIN-021 are legit), and an action that removes the rogue rather than the legit server. Currently: IP ${okIp ? "✓" : "✗"} · hosts ${okHosts ? "✓" : "✗"} · action ${okAct ? "✓" : "✗"}.`,
            };
      },
    },
    {
      id: "OBJ-H9",
      pillar: "P4",
      title: "Broadcast domain fix",
      text: "Warehouse: 300 devices on one 192.168.60.0/24, congestion + exhaustion. Choose the fix that solves BOTH, and enter the usable-host count of a /23 as your math check.",
      zone: "loadout",
      where: "No pointers on night shift.",
      hints: ["More addresses ≠ fewer broadcasts. Only routing splits a broadcast domain."],
      anchor: "Broadcast-domain sizing, 2^h−2 math, growth limits of a flat /24",
      validate: (env) => {
        const ok = env.plan.h9plan === H9_TRUTH && env.plan.h9fig.trim() === H9_FIGURE;
        return ok
          ? {
              pass: true,
              feedback:
                "Fix ratified: routed, right-sized subnets (VLSM) — they add capacity AND shrink broadcast domains. A /23 would fit 510 devices but keep one giant broadcast domain; public re-IP and APIPA fail on their own terms.",
            }
          : {
              pass: false,
              feedback:
                "Reconsider: /23 (usable = 2^23−2… count hosts: 510) answers exhaustion but leaves every device in one broadcast domain; public addressing and APIPA are non-starters. Pick the routed design and enter the /23's usable count to prove the math.",
            };
      },
    },
  ];
})();

// ground-truth highlighting in debrief (exported by the original as well)
var H1_FAULTY_TRUTH = H1_FAULTY;
