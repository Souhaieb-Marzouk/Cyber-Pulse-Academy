/* ===================
   The Network Clinic — CV0-004 Lesson 6.4 static port — objective engine: validation, vitals, hints, where-to-work
   Vanilla ES2020+, classic scripts, load order: data -> state -> objectives -> quiz -> ui -> app.
   Bodies are verbatim from the audited build; only code motion, no logic edits.
   ============================================================ */
"use strict";

const OBJMAP = {};
OBJECTIVES.forEach((o) => { OBJMAP[o.id] = o; });

function alertsOk() { const a = S.env.alerts; return ALERTS.every((x) => a[x.id] === x.cls); }
function preventOk() {
  const tick = (g) => S.env["prev_" + g] || [];
  for (const g of Object.keys(PREVENTION)) {
    const ids = tick(g);
    for (const c of PREVENTION[g]) { if (c.req && !ids.includes(c.id)) return false; if (c.trap && ids.includes(c.id)) return false; }
  }
  return true;
}

function ntpSourcesValid() { const s = S.env.ntpSources; return s.filter((x) => x !== "legacy").length >= 2 && !s.includes("legacy"); }
function allGreenNow() { return ["portal", "vmpool", "batch"].every((p) => vitalsFor(p).every((r) => r.ok)); }
const VAL = {
  M1: () => { const r = S.env.roles; return r.r1 === "dhcp" && r.r2 === "dns" && r.r3 === "ntp" && r.r4 === "none"; },
  M2: () => { const a = S.env.symptoms; return SYMPTOMS.every((s) => a[s.id] === s.cls); },
  M3: () => { const a = (S.obj.M3 || {}).a || {}; return norm(a.ip) === CORRECT.portalA_old && a.meaning === "stale"; },
  M4: () => { const a = (S.obj.M4 || {}).a || {}; return norm(a.ip) === CORRECT.apipa && a.cause === "exhausted"; },
  M5: () => { const a = (S.obj.M5 || {}).a || {}; return (norm(a.drift) === "872" || norm(a.drift) === "-872") && a.dir === "behind" && !!a.f_tls && !!a.f_kerb && !a.f_disk && !a.f_cpu; },
  M6: alertsOk,
  M7: () => S.env.mon_dns === true && S.env.mon_dhcp === "80" && S.env.mon_ntp === "1s",
  M8: () => S.env.dnsApplied && norm(S.env.dnsA) === CORRECT.portalA_new && norm(S.env.dnsTtl) === CORRECT.ttl_new && apiFixed(S),
  M9: () => S.env.poolAFixApplied && S.env.poolAFix === "r26" && S.env.poolBOptionApplied && norm(S.env.poolBOption) === CORRECT.opt003_new && S.env.dhcpRenewed,
  M10: () => S.env.ntpResynced && ntpSourcesValid() && S.env.rechecked.batch,
  M11: () => ["portal", "vmpool", "batch"].every((p) => S.env.rechecked[p]) && allGreenNow() && preventOk(),
  H1: () => { const a = S.env.anatomy; return ANATOMY.every((x) => a[x.id] === x.cls); },
  H2: () => { const a = (S.obj.H2 || {}).a || {}; return norm(a.ip) === CORRECT.portalA_old && norm(a.apipa) === CORRECT.apipa && norm(a.drift) === "872"; },
  H3: () => { const a = (S.obj.H3 || {}).a || {}; return norm(a.cur) === CORRECT.portalA_old && norm(a.newv) === CORRECT.portalA_new && norm(a.ttlNow) === CORRECT.ttl_old && norm(a.ttlSet) === CORRECT.ttl_new && norm(a.pname) === CORRECT.api_name && norm(a.pip) === CORRECT.api_ip; },
  H4: () => { const a = (S.obj.H4 || {}).a || {}; return norm(a.free) === "7" && a.fix === "r26" && norm(a.opt) === CORRECT.opt003_new && a.root === "copied"; },
  H5: () => { const a = (S.obj.H5 || {}).a || {}; return (norm(a.drift) === "872" || norm(a.drift) === "-872") && a.dir === "behind" && a.mech === "behind" && a.src === "poolcloud" && a.why === "decommissioned"; },
  H6: () => { const q = S.env.seq; return SEQ.correct.every((v, i) => q[i] === v); },
  H7: () => { const a = (S.obj.H7 || {}).a || {}; return a.q1 === "active" && a.q2 === "80" && a.q3 === "offset"; },
  H8: alertsOk,
  H9: preventOk,
  H10: () => { const q = S.env.timeline; return TL.correct.every((v, i) => q[i] === v); }
};

/* ---------- vitals ---------- */
function vitalsFor(pid) {
  const e = S.env;
  if (pid === "portal") {
    const res = e.dnsApplied && norm(e.dnsA) === CORRECT.portalA_new && norm(e.dnsTtl) === CORRECT.ttl_new;
    const api = apiFixed(S);
    return [
      { n: "Public name resolution", ok: res, val: res ? "portal \u2192 203.0.113.20 (TTL 300)" : "portal \u2192 " + portalIpNow(S) + " (TTL " + (e.dnsApplied ? (e.dnsTtl || "86400") : "86400") + ")" },
      { n: "Internal API resolution", ok: api, val: api ? "api.internal \u2192 10.20.30.40" : "api.internal \u2192 NXDOMAIN" },
      { n: "HTTP 200 rate", ok: res && api, val: res && api ? "99.9%" : "41%" }
    ];
  }
  if (pid === "vmpool") {
    const cap = scopeAFixed(S), gw = gwBOk(S), lease = gw && e.dhcpRenewed;
    return [
      { n: "VMPOOL-A free leases", ok: cap, val: cap ? CORRECT.poolA_free_after + " of 311" : CORRECT.poolA_free + " of 249" },
      { n: "VMPOOL-B gateway (Opt 003)", ok: gw, val: gw ? "10.20.31.254 \u2713" : "10.20.30.1 \u2014 wrong subnet" },
      { n: "Client leases healthy", ok: lease, val: lease ? "re-leased into working config" : "stale leases pending renewal" }
    ];
  }
  if (pid === "batch") {
    const ok = ntpOk(S);
    return [
      { n: "Clock offset vs reference", ok: ok, val: ok ? "+0.3 s \u2014 in tolerance" : "\u2212872 s (behind)" },
      { n: "Auth handshake (Kerberos/TLS)", ok: ok, val: ok ? "TGT acquired \u00b7 TLS OK" : "KRB_AP_ERR_SKEW \u00b7 TLS not-yet-valid" }
    ];
  }
  if (pid === "mailrelay") return [{ n: "SMTP flow", ok: true, val: "nominal" }, { n: "Queue depth", ok: true, val: "12 (baseline)" }, { n: "Certificate validity", ok: true, val: "38 days remaining" }];
  if (pid === "objstore") return [{ n: "p99 latency", ok: false, val: "840 ms (elevated)" }, { n: "DNS / DHCP / NTP involvement", ok: true, val: "none \u2014 storage-tier metric" }];
  return [{ n: "Maintenance window", ok: true, val: "scheduled 09:00\u201311:00" }, { n: "Service health", ok: true, val: "planned, not sick" }];
}

function checkObjective(id) {
  const o = ensureObj(id); o.attempts++;
  const ok = VAL[id] && VAL[id]();
  if (ok && !o.solved) { o.firstAttempt = o.attempts === 1 && !(o.hintsUsed > 0); }
  o.solved = ok;
  const d = OBJMAP[id];
  o.fb = ok ? d.okMsg : d.failMsg; o.fbOk = ok;
  logAdd((ok ? "OBJECTIVE PASSED" : "Objective check failed") + " [" + id + "] " + d.title + ".");
  save(); renderTaskList(); updateTaskListMeta(); renderWard(); renderChart();
  toast(ok ? id + " passed — " + d.title : id + " not yet — teaching note added under the task card.", ok ? "" : "warn");
}

function showHint(id) {
  const o = ensureObj(id); const d = OBJMAP[id]; const max = S.mode === "medium" ? 3 : 1;
  if (o.hintsUsed >= max) { toast(S.mode === "medium" ? "All three hints for " + id + " are already on the card." : "Night shift allows one nudge only — it is already on the card.", "warn"); return; }
  o.hintsUsed++;
  if (S.mode === "hard") toast("Nudge used for " + id + " — this visibly costs score at sign-off.", "warn");
  save(); renderTaskList();
}

function showWhere(id) {
  const d = OBJMAP[id]; if (!d) return;
  const map = { roleBoard: ["#roleBoard", null], symptomBoard: ["#symptomBoard", null], coldTriage: ["#coldTriage", null], chartPortal: ["#chartArea", "portal"], chartVmpool: ["#chartArea", "vmpool"], chartBatch: ["#chartArea", "batch"], triageFeed: ["#triageFeed", null], monitorDesk: ["#monitorDesk", null], planningDesk: ["#planningDesk", null], preventionBoard: ["#preventionBoard", null] };
  const m = map[d.where] || ["#wardBoard", null];
  if (m[1]) { admit(m[1]); if (id.indexOf("M8") === 0 || id.indexOf("M9") === 0 || id.indexOf("M10") === 0) { S.tab = "treatment"; } else if (d.mode === "M" && ["M3", "M4", "M5"].includes(id)) { S.tab = "assessment"; } else if (["H3", "H4", "H5"].includes(id)) { S.tab = "assessment"; } save(); renderChart(); }
  const el = $(m[0]); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
}
