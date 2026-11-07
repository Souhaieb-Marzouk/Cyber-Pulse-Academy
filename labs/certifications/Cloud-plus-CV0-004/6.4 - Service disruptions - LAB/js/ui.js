/* ===================
   The Network Clinic — CV0-004 Lesson 6.4 static port — UI: toasts, modals, all renderers, completion report
   Vanilla ES2020+, classic scripts, load order: data -> state -> objectives -> quiz -> ui -> app.
   Bodies are verbatim from the audited build; only code motion, no logic edits.
   ============================================================ */
"use strict";

/* ---------- tiny UI helpers ---------- */
function toast(msg, kind) {
  const w = $("#toastWrap"); if (!w) return;
  const d = document.createElement("div"); d.className = "toast" + (kind ? " " + kind : ""); d.textContent = msg;
  d.title = "Click to dismiss"; d.setAttribute("role", "status");
  d.addEventListener("click", () => d.remove());
  w.appendChild(d); setTimeout(() => { d.remove(); }, 4600);
}
let modalReturnFocus = null;
function openModal(html) {
  const r = $("#modalRoot");
  modalReturnFocus = document.activeElement;
  r.innerHTML = '<div class="modal-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="Dialog">' + html + '</div></div>';
  r.querySelector(".modal-overlay").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
  const first = r.querySelector("button"); if (first) first.focus();
}
function closeModal() { $("#modalRoot").innerHTML = ""; if (modalReturnFocus && document.contains(modalReturnFocus)) { try { modalReturnFocus.focus(); } catch (e) {} } modalReturnFocus = null; }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
const ico = (id, cls) => '<svg class="' + (cls || "ic") + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
const tagP = (p) => '<span class="tag p' + p.slice(1) + '">' + p + "</span>";

function renderRole() {
  const svc = [["dns", "DNS"], ["dhcp", "DHCP"], ["ntp", "NTP"], ["none", "Not ours"]];
  $("#roleList").innerHTML = ROLES.map((r) => {
    const cur = S.env.roles[r.id];
    return '<div class="role-item"><div class="r-txt">' + esc(r.txt) + '</div><div class="pair-controls">' +
      svc.map(([v, l]) => '<button type="button" data-act="role" data-arg="' + r.id + ":" + v + '" class="' + (cur === v ? "picked" + (v === "none" ? " none" : "") : "") + '" aria-pressed="' + (cur === v) + '">' + l + "</button>").join("") +
      '</div><div class="pair-result">' + (cur ? "assigned \u2192 " + svc.find((s) => s[0] === cur)[1] : "") + "</div></div>";
  }).join("");
}
function renderSymptom() {
  const opts = [["dns", "DNS"], ["dhcp", "DHCP"], ["ntp", "NTP"], ["none", "Not a service-disruption symptom"]];
  $("#symptomList").innerHTML = SYMPTOMS.map((s) =>
    '<div class="field"><label for="sym-' + s.id + '">' + esc(s.txt) + "</label><select id=\"sym-" + s.id + '" data-field="envsym:' + s.id + '" aria-label="Classify symptom">' +
    '<option value="">— classify —</option>' + opts.map(([v, l]) => '<option value="' + v + '"' + (S.env.symptoms[s.id] === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>").join("");
}
function renderCold() {
  const a = (S.obj.H2 || {}).a || {};
  $("#coldList").innerHTML = [
    ["ip", "DNS \u2014 the stale A record value dig returns for the portal", a.ip || "", "198.51.100.77"],
    ["apipa", "DHCP \u2014 the address the stuck VM self-assigned", a.apipa || "", "169.254.x.x"],
    ["drift", "NTP \u2014 drift magnitude in seconds (digits only)", a.drift || "", "872"]
  ].map(([k, lab, val, ph]) => '<div class="field"><label for="cold-' + k + '">' + esc(lab) + '</label><input id="cold-' + k + '" type="text" data-field="obj:H2:a:' + k + '" value="' + esc(val) + '" placeholder="' + ph + '" autocomplete="off" spellcheck="false"></div>').join("");
}
function renderAnatomy() {
  const opts = [["dns", "DNS"], ["dhcp", "DHCP"], ["ntp", "NTP"], ["none", "None of the three"]];
  $("#anatomyList").innerHTML = ANATOMY.map((x) =>
    '<div class="field"><label for="anat-' + x.id + '">' + esc(x.txt) + '</label><select id="anat-' + x.id + '" data-field="envanatomy:' + x.id + '" aria-label="Assign mechanism to a service">' +
    '<option value="">— assign —</option>' + opts.map(([v, l]) => '<option value="' + v + '"' + (S.env.anatomy[x.id] === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>").join("");
}
function renderWard() {
  $("#wardSub").textContent = S.mode === "medium" ? "Admit a patient to open its chart. Walk-ins are part of the flood — assess before treating." : "No service labels are provided. Admit, order diagnostics, and let the evidence name the disease.";
  $("#patientGrid").innerHTML = PATIENTS.map((p) => {
    const rows = vitalsFor(p.id); const green = rows.every((r) => r.ok);
    const admitted = S.admitted.includes(p.id);
    return '<div class="patient ' + (p.walkin ? "okay" : green ? "okay" : "sick") + (S.active === p.id ? " active" : "") + '"><span class="bed">' + esc(p.bed) + "</span><h3>" + esc(p.name) + '</h3><div class="p-desc">' + esc(p.kind) + '</div><div class="vitals-dots" aria-label="Vitals: ' + rows.filter((r) => r.ok).length + ' of ' + rows.length + ' green">' + rows.map((r) => '<span class="dot ' + (r.ok ? "green" : "red") + '"></span>').join("") + (p.walkin ? " walk-in" : "") + '</div><button class="btn btn-sm ' + (admitted ? "btn-ghost" : "btn-primary") + '" type="button" data-act="' + (admitted ? "open" : "admit") + '" data-arg="' + p.id + '">' + (admitted ? "Open chart" : "Admit") + "</button></div>";
  }).join("");
}
function chartTabs() {
  const t = [["vitals", "Vitals"], ["assessment", "Assessment"], ["treatment", "Treatment"], ["notes", "Notes"]];
  const p = PATIENTS.find((x) => x.id === S.active);
  const tabs = p && p.walkin ? [["vitals", "Vitals"], ["notes", "Notes"]] : t;
  return '<div class="tabs" role="tablist">' + tabs.map(([id, l]) => '<button type="button" role="tab" aria-selected="' + (S.tab === id) + '" data-act="tab" data-arg="' + id + '"' + (tabs.every(([x]) => x !== S.tab) && id === "vitals" ? "" : "") + ">" + l + "</button>").join("") + "</div>";
}
function radioRow(name, fieldBase, options, cur) {
  return options.map(([v, l, trap]) => '<label class="choice' + (trap ? " trap" : "") + '"><input type="radio" name="' + name + '" data-field="' + fieldBase + '" value="' + v + '"' + (cur === v ? " checked" : "") + "><span>" + l + "</span></label>").join("");
}
function checkRow(fieldBase, label, cur) {
  return '<label class="choice"><input type="checkbox" data-field="' + fieldBase + '"' + (cur ? " checked" : "") + "><span>" + label + "</span></label>";
}
function assessmentFor(pid) {
  const g = (id) => (S.obj[id] || {}).a || {};
  if (pid === "portal") {
    if (S.mode === "medium") { const a = g("M3");
      return '<h4>Chart assessment — the DNS answer (OBJ-M3)</h4><p class="sub">Run <strong>dig</strong> from the Diagnostics cart (target: portal.nimbuscare.example), read the ANSWER SECTION, then record:</p>' +
        '<div class="field"><label for="m3ip">A record value dig returned</label><input id="m3ip" type="text" data-field="obj:M3:a:ip" value="' + esc(a.ip || "") + '" placeholder="e.g. 203.0.113.20" autocomplete="off" spellcheck="false"></div>' +
        '<div class="field"><span class="lab">Interpretation</span>' + radioRow("m3m", "obj:M3:a:meaning", [["stale", "Stale record — points at the decommissioned LB"], ["propagating", "New record still propagating — wait it out"], ["poison", "Cache poisoning — escalate to security"], ["fine", "Record is correct — no action"]], a.meaning) + "</div>";
    }
    const a = g("H3");
    return '<h4>Record autopsy (OBJ-H2) — exact values</h4><p class="sub">Evidence: dig, zone file, change log. All six fields must be exact.</p>' +
      [["cur", "Current A record value (as served now)"], ["newv", "Correct A record value (live LB per change log)"], ["ttlNow", "Current TTL (seconds)"], ["ttlSet", "TTL to set for change windows (seconds)"], ["pname", "Missing private-zone record (full name)"], ["pip", "Missing private-zone record (IP)"]].map(([k, lab]) => '<div class="field"><label for="h2-' + k + '">' + esc(lab) + '</label><input id="h2-' + k + '" type="text" data-field="obj:H3:a:' + k + '" value="' + esc(a[k] || "") + '" autocomplete="off" spellcheck="false"></div>').join("");
  }
  if (pid === "vmpool") {
    if (S.mode === "medium") { const a = g("M4");
      return '<h4>Chart assessment — the addressless VM (OBJ-M4)</h4><p class="sub">Run <strong>ipconfig /all</strong> (target VMPOOL-A-NEW-01) and the <strong>DHCP console</strong> (target Scope VMPOOL-A), then record:</p>' +
        '<div class="field"><label for="m4ip">Address the stuck VM self-assigned</label><input id="m4ip" type="text" data-field="obj:M4:a:ip" value="' + esc(a.ip || "") + '" placeholder="169.254.x.x" autocomplete="off" spellcheck="false"></div>' +
        '<div class="field"><span class="lab">Root cause</span>' + radioRow("m4c", "obj:M4:a:cause", [["exhausted", "DHCP scope exhausted — no free addresses to offer"], ["option", "Wrong DHCP option handed to clients"], ["rogue", "A rogue DHCP server is answering"], ["nic", "NIC driver fault on the new VMs"]], a.cause) + "</div>";
    }
    const a = g("H4");
    return '<h4>DHCP deep dive (OBJ-H3) — capacity math + the copy-paste option</h4>' +
      '<div class="field"><label for="h3free">Free leases in Pool A right now (exact number)</label><input id="h3free" type="text" inputmode="numeric" data-field="obj:H4:a:free" value="' + esc(a.free || "") + '" autocomplete="off"></div>' +
      '<div class="field"><span class="lab">Correct expansion for +30 VMs tonight with \u226520% headroom</span>' + radioRow("h3f", "obj:H4:a:fix", [["r26", "Add secondary range 10.20.28.0/26 (+62 usable)"], ["r28", "Add secondary range 10.20.28.0/28 (+14 usable)"], ["lease", "Shorten the lease to 15 minutes"], ["static", "Static-assign every VM manually"]], a.fix) + "</div>" +
      '<div class="field"><label for="h3opt">Pool B\u2019s correct Option 003 (router) value</label><input id="h3opt" type="text" data-field="obj:H4:a:opt" value="' + esc(a.opt || "") + '" placeholder="10.20.x.x" autocomplete="off" spellcheck="false"></div>' +
      '<div class="field"><span class="lab">Root configuration error</span>' + radioRow("h3r", "obj:H4:a:root", [["copied", "Option 003 was copy-pasted from Pool A\u2019s config — it points into the wrong subnet"], ["relay", "The DHCP relay agent is down"], ["exhausted", "Pool B\u2019s scope is exhausted"], ["fw", "A host firewall blocks ICMP"]], a.root) + "</div>";
  }
  if (pid === "batch") {
    if (S.mode === "medium") { const a = g("M5");
      return '<h4>Chart assessment — the drifting clock (OBJ-M5)</h4><p class="sub">Run <strong>timedatectl</strong>, <strong>ntpq -p</strong> and the <strong>auth &amp; TLS log</strong> (target BATCH-01), then record:</p>' +
        '<div class="field"><label for="m5d">Drift magnitude (seconds)</label><input id="m5d" type="text" inputmode="numeric" data-field="obj:M5:a:drift" value="' + esc(a.drift || "") + '" autocomplete="off"></div>' +
        '<div class="field"><span class="lab">Direction</span>' + radioRow("m5dir", "obj:M5:a:dir", [["behind", "Clock is BEHIND real time"], ["ahead", "Clock is AHEAD of real time"]], a.dir) + "</div>" +
        '<div class="field"><span class="lab">Downstream failures the log actually shows</span>' + checkRow("obj:M5:a:f_tls", "TLS: “certificate is not yet valid”", a.f_tls) + checkRow("obj:M5:a:f_kerb", "Kerberos: KRB_AP_ERR_SKEW", a.f_kerb) + checkRow("obj:M5:a:f_disk", "Disk corruption", a.f_disk) + checkRow("obj:M5:a:f_cpu", "Abnormally high CPU", a.f_cpu) + "</div>";
    }
    const a = g("H5");
    return '<h4>NTP deep dive (OBJ-H4) — drift, mechanism, sources</h4>' +
      '<div class="field"><label for="h4d">Drift magnitude (seconds)</label><input id="h4d" type="text" inputmode="numeric" data-field="obj:H5:a:drift" value="' + esc(a.drift || "") + '" autocomplete="off"></div>' +
      '<div class="field"><span class="lab">Direction</span>' + radioRow("h4dir", "obj:H5:a:dir", [["behind", "Behind"], ["ahead", "Ahead"]], a.dir) + "</div>" +
      '<div class="field"><span class="lab">Which TLS failure mechanism applies?</span>' + radioRow("h4m", "obj:H5:a:mech", [["behind", "Clock BEHIND \u2192 fresh certs read “not yet valid”"], ["ahead", "Clock AHEAD \u2192 certs read “expired”"], ["revoked", "The certificate was revoked"], ["bug", "A TLS library bug"]], a.mech) + "</div>" +
      '<div class="field"><span class="lab">Correct source set</span>' + radioRow("h4s", "obj:H5:a:src", [["poolcloud", "Internal pool (ntp01\u201303) + StratusCloud Time Sync"], ["legacy", "Keep 10.40.50.60 as the only source"], ["cloudonly", "Provider time service only, no internal pool"], ["none", "Leave unsynchronized; fix later"]], a.src) + "</div>" +
      '<div class="field"><span class="lab">Why must 10.40.50.60 be removed?</span>' + radioRow("h4w", "obj:H5:a:why", [["decommissioned", "It was decommissioned in CHG-2481 — it never answers"], ["slow", "It answers but is slow"], ["stratum", "Its stratum number is too high"], ["license", "Its NTP license expired"]], a.why) + "</div>";
  }
  return "";
}
function treatmentFor(pid) {
  const e = S.env;
  if (pid === "portal") {
    return '<h4>Zone treatment (OBJ-M8)</h4>' +
      '<div class="field"><span class="lab">A record for portal.nimbuscare.example</span><select data-field="env:dnsA" aria-label="A record value"><option value="">— choose —</option>' +
      [["198.51.100.77", "198.51.100.77 — current (decommissioned LB)"], ["203.0.113.20", "203.0.113.20 — the live portal LB (per change log)"], ["203.0.113.99", "203.0.113.99 — payments app LB"], ["10.20.30.40", "10.20.30.40 — internal API"]].map(([v, l]) => '<option value="' + v + '"' + (e.dnsA === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div class="field"><span class="lab">TTL for the change window</span><select data-field="env:dnsTtl" aria-label="TTL value"><option value="">— choose —</option>' +
      [["86400", "86400 — 24 h (current)"], ["3600", "3600 — 1 h"], ["300", "300 — 5 min (change-window practice)"], ["60", "60"]].map(([v, l]) => '<option value="' + v + '"' + (e.dnsTtl === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div class="field"><span class="lab">Missing private-zone record (split horizon)</span><select data-field="env:dnsPrivName" aria-label="Private record name"><option value="">— choose name —</option>' +
      [["api.internal.nimbuscare.example", "api.internal.nimbuscare.example"], ["portal.nimbuscare.example", "portal.nimbuscare.example (already public)"]].map(([v, l]) => '<option value="' + v + '"' + (e.dnsPrivName === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
      '<input type="text" data-field="env:dnsPrivIp" value="' + esc(e.dnsPrivIp || "") + '" placeholder="record IP, e.g. 10.20.30.40" aria-label="Private record IP" autocomplete="off" spellcheck="false" style="margin-top:.4rem"></div>' +
      '<div class="apply-row"><button class="btn btn-primary" type="button" data-act="dnscommit">Commit zone changes</button></div>' +
      (e.dnsApplied ? '<p class="note ok" style="border-left-color:var(--green);background:var(--green-soft)">Committed: portal \u2192 ' + esc(portalIpNow(S)) + " (TTL " + esc(e.dnsTtl || "86400") + ")" + (apiFixed(S) ? " \u00b7 api.internal \u2192 10.20.30.40" : " \u00b7 api.internal still missing") + ". Re-run dig from the cart to verify.</p>" : '<p class="sub">Nothing committed yet. Re-run dig after committing to see the answer change.</p>');
  }
  if (pid === "vmpool") {
    return '<h4>Scope treatment (OBJ-M9)</h4>' +
      '<div class="field"><span class="lab">VMPOOL-A — address shortage (7 free, +30 VMs tonight)</span>' +
      radioRow("poolafix", "env:poolAFix", [["r26", "Add secondary range 10.20.28.0/26 — +62 usable addresses, router 10.20.28.1"], ["r28", "Add secondary range 10.20.28.0/28 — +14 usable addresses"], ["lease", "Shorten the lease to 15 minutes"], ["static", "Assign static IPs to tonight\u2019s VMs"]], e.poolAFix) + "</div>" +
      '<div class="field"><span class="lab">VMPOOL-B — Option 003 (router)</span><select data-field="env:poolBOption" aria-label="Option 003 value"><option value="">— choose —</option>' +
      [["10.20.30.1", "10.20.30.1 — current (Pool A\u2019s router; wrong subnet)"], ["10.20.31.254", "10.20.31.254 — this subnet\u2019s actual router"], ["10.20.30.254", "10.20.30.254 — VMPOOL-A infrastructure"], ["0.0.0.0", "0.0.0.0"]].map(([v, l]) => '<option value="' + v + '"' + (e.poolBOption === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div class="apply-row"><button class="btn btn-primary" type="button" data-act="poola">Apply Pool-A change</button><button class="btn btn-primary" type="button" data-act="optb">Apply Option 003</button><button class="btn btn-ghost" type="button" data-act="renew">Renew affected leases</button></div>' +
      '<p class="sub">State: Pool-A change ' + (e.poolAFixApplied ? "applied (" + esc(e.poolAFix) + ")" : "not applied") + " \u00b7 Option 003 " + (e.poolBOptionApplied ? "applied (" + esc(e.poolBOption) + ")" : "not applied") + " \u00b7 leases " + (e.dhcpRenewed ? "renewed" : "not renewed") + "</p>";
  }
  if (pid === "batch") {
    const sel = e.ntpSources || [];
    return '<h4>Time treatment (OBJ-M10)</h4>' +
      '<div class="field"><span class="lab">Time sources for the fleet (tick every source to configure)</span>' +
      [["pool1", "ntp01.nimbuscare.example (10.40.50.11) — internal pool"], ["pool2", "ntp02.nimbuscare.example (10.40.50.12) — internal pool"], ["pool3", "ntp03.nimbuscare.example (10.40.50.13) — internal pool"], ["cloud", "StratusCloud Time Sync (169.254.169.123) — provider"], ["legacy", "10.40.50.60 — legacy on-prem NTP (see change log)"]].map(([v, l]) => checkRow("envarr:ntpSources|" + v, l, sel.includes(v))).join("") + "</div>" +
      '<div class="apply-row"><button class="btn btn-primary" type="button" data-act="resync">Save sources &amp; force resync</button></div>' +
      '<p class="sub">State: sources ' + (sel.length ? sel.join(", ") : "none selected") + " \u00b7 resync " + (e.ntpResynced ? "performed" : "not performed") + "</p>";
  }
  return "";
}
function renderChart() {
  const area = $("#chartArea"); const p = PATIENTS.find((x) => x.id === S.active);
  if (!p) { area.hidden = true; area.innerHTML = ""; return; }
  area.hidden = false;
  const rows = vitalsFor(p.id);
  const green = rows.every((r) => r.ok);
  let body = "";
  if (S.tab === "vitals") {
    body = rows.map((r) => '<div class="vital-row"><span class="vital-name">' + esc(r.n) + '</span><span class="vital-val' + (r.ok ? "" : " bad") + '">' + esc(r.val) + "</span>" + (r.ok ? pulseSvg() : "") + "</div>").join("") +
      '<p class="sub" style="margin-top:.6rem">' + (p.walkin ? "Walk-in assessment: " + esc(p.desc) : green ? "All vitals green — verify, then consider discharge." : "Abnormal traces above. Work the Assessment tab, treat, then RECHECK VITALS — a fix is not a fix until it is re-measured.") + "</p>";
  } else if (S.tab === "assessment") { body = assessmentFor(p.id) || '<p class="sub">No assessment needed for this walk-in — its findings live in the Triage feed.</p>'; }
  else if (S.tab === "treatment") { body = treatmentFor(p.id) || '<p class="sub">No treatment in this ward\u2019s scope. ' + esc(p.desc) + " Refer to the owning team and move on.</p>"; }
  else { body = '<div class="term" style="max-height:none">' + (S.log.length ? S.log.map((l) => "#" + l.n + " " + esc(l.txt)).join("\n") : "No entries yet — run diagnostics and apply treatments.") + "</div>"; }
  const real = !p.walkin;
  area.innerHTML = '<div class="chart"><div class="chart-head">' + ico("i-med") + "<h3>" + esc(p.name) + '</h3><span class="bed">' + esc(p.bed) + "</span><span class=\"bed\">" + esc(p.kind) + '</span><span class="spacer"></span>' +
    (real ? '<button class="btn btn-sm btn-ghost" type="button" data-act="recheck" data-arg="' + p.id + '" style="border-color:var(--monitor-line);color:#DFF7EE">' + ico("i-pulse") + "Recheck vitals</button>" : "") + "</div>" +
    chartTabs() + '<div class="chart-body">' + body + "</div></div>";
}
function pulseSvg() {
  return '<svg class="pulse-svg" viewBox="0 0 120 26" aria-hidden="true"><polyline points="0,13 20,13 26,13 30,4 35,22 40,13 60,13 66,13 70,6 75,20 80,13 120,13" fill="none" stroke="#39D0A4" stroke-width="2"/></svg>';
}
function renderFeed() {
  const opts = [["dns", "DNS"], ["dhcp", "DHCP"], ["ntp", "NTP"], ["none", "Unrelated"]];
  $("#feedList").innerHTML = ALERTS.map((a) => {
    const cur = S.env.alerts[a.id] || "";
    return '<div class="feed-row"><span class="t">' + esc(a.t) + '</span><span class="sev ' + a.sev + '">' + a.sev + '</span><span class="txt">' + esc(a.txt) + "</span>" +
      '<select data-field="envalert:' + a.id + '" aria-label="Classify alert at ' + a.t + '"><option value="">— triage —</option>' + opts.map(([v, l]) => '<option value="' + v + '"' + (cur === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>";
  }).join("");
}
function renderMonitor() {
  $("#monitorList").innerHTML =
    checkRow("env:mon_dns", "<strong>DNS integrity check</strong> — resolve portal.nimbuscare.example inside + outside the VPC every 60 s; alert when the answer \u2260 expected A record", S.env.mon_dns) +
    '<div class="field"><label for="mondhcp">DHCP scope utilization alert threshold</label><select id="mondhcp" data-field="env:mon_dhcp"><option value="">— choose —</option>' + [["50", "50% — pages on every autoscale run"], ["80", "80% sustained 10 min — early warning"], ["95", "95% — very late"], ["100", "100% — fires when VMs already die"]].map(([v, l]) => '<option value="' + v + '"' + (S.env.mon_dhcp === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
    '<div class="field"><label for="monntp">NTP offset alert threshold</label><select id="monntp" data-field="env:mon_ntp"><option value="">— choose —</option>' + [["100ms", "100 ms — over-sensitive, noisy"], ["1s", "|offset| > 1 s sustained — healthy margin"], ["5min", "5 min — waits for Kerberos to break"], ["never", "Never alert"]].map(([v, l]) => '<option value="' + v + '"' + (S.env.mon_ntp === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>";
  if (S.mode === "hard") {
    const a = (S.obj.H7 || {}).a || {};
    $("#detectionPlan").hidden = false;
    $("#detectionPlan").innerHTML = '<h4 style="margin-top:10px">Night-shift plan defense (OBJ-H6) — pick the check that LEADS</h4>' +
      '<div class="field"><span class="lab">DNS — catch the next bad record before users do</span>' + radioRow("h6q1", "obj:H7:a:q1", [["active", "Resolve the name inside + outside the VPC every 60 s; alert on drift from the expected A record"], ["cpu", "Alert when the DNS server\u2019s CPU exceeds 80%"], ["tickets", "Wait for user tickets, then run dig"]], a.q1) + "</div>" +
      '<div class="field"><span class="lab">DHCP — catch scope exhaustion before VMs stick</span>' + radioRow("h6q2", "obj:H7:a:q2", [["80", "Alert when utilization \u2265 80% sustained for 10 min"], ["100", "Alert when utilization reaches 100%"], ["apipa", "Alert when new VMs report APIPA addresses"]], a.q2) + "</div>" +
      '<div class="field"><span class="lab">NTP — catch drift before authentication breaks</span>' + radioRow("h6q3", "obj:H7:a:q3", [["offset", "Export clock offset as a metric; alert when |offset| > 1 s sustained"], ["kerb", "Alert when KRB_AP_ERR_SKEW appears in the auth log"], ["packets", "Alert when NTP packet volume drops 10%"]], a.q3) + "</div>";
  }
}
function renderPlanning() {
  const mk = (title, key, data, hint) => {
    const arr = S.env[key];
    return "<h4>" + title + "</h4>" + hint + '<ol class="seq-list">' + arr.map((id, i) =>
      '<li><span class="num">' + (i + 1) + '</span><span class="grow">' + esc(data.labels[id]) + '</span><span class="seq-btns">' +
      '<button type="button" data-act="seqmove" data-arg="' + key + ":" + i + '" data-dir="-1" aria-label="Move up">↑</button>' +
      '<button type="button" data-act="seqmove" data-arg="' + key + ":" + i + '" data-dir="1" aria-label="Move down">↓</button></span></li>').join("") + "</ol>";
  };
  $("#seqBoard").innerHTML = mk("Recovery sequencing board (OBJ-H5)", "seq", SEQ, '<p class="sub">Six actions, each with a precondition. Order them so every step\u2019s prerequisite exists before it runs — then check.</p>');
  $("#timelineBoard").innerHTML = mk("Incident timeline reconstruction (OBJ-H9)", "timeline", TL, '<p class="sub">Rebuild the chronology from the change log and the feed timestamps: which event set up which?</p>');
}
function renderPrevention() {
  const heads = { dns: "DNS", dhcp: "DHCP", ntp: "NTP" };
  $("#preventionList").innerHTML = Object.keys(PREVENTION).map((g) => {
    const sel = S.env["prev_" + g] || [];
    return '<div class="pillar-recap"><h4>' + heads[g] + " controls</h4>" + PREVENTION[g].map((c) =>
      '<label class="choice' + (c.trap ? " trap" : "") + '"><input type="checkbox" data-field="envprev:' + g + "|" + c.id + '"' + (sel.includes(c.id) ? " checked" : "") + '><span>' + esc(c.txt) + (c.trap ? " <em>(read carefully)</em>" : "") + "</span></label>").join("") + "</div>";
  }).join("");
  const done = $("#preventionResult");
  if (done && S.env.rechecked.portal && S.env.rechecked.vmpool && S.env.rechecked.batch) {
    const g = ["portal", "vmpool", "batch"].map((p) => vitalsFor(p).filter((r) => r.ok).length + "/" + vitalsFor(p).length);
    done.innerHTML = '<p class="note ' + (g.every((x) => x.startsWith("3/")) || g.every((x) => x.startsWith("2/")) ? "" : "warn") + '">Latest recheck — PORTAL: ' + g[0] + " green \u00b7 VMPOOL: " + g[1] + " green \u00b7 BATCH: " + g[2] + " green. " + (allGreenNow() ? "All traces green — discharge-ready." : "Red traces remain: fix, then recheck again.") + "</p>";
  }
}
function renderKnowledge() {
  $("#knowledgeCards").innerHTML = KNOWLEDGE.map((k) =>
    '<div class="pillar-recap"><h3 style="display:flex;align-items:center;gap:.5rem">' + ico(k.icon) + esc(k.title) + "</h3>" + k.body.map((b) => "<p style=\"font-size:.88rem\">" + esc(b) + "</p>").join("") + "</div>").join("");
  $("#glossaryList").innerHTML = GLOSSARY.map(([t, d]) => "<dt>" + esc(t) + "</dt><dd>" + esc(d) + "</dd>").join("");
}
function renderTaskList() {
  const objs = modeObjs();
  $("#taskList").innerHTML = objs.map((o) => {
    const st = S.obj[o.id] || {};
    const solved = !!st.solved, attempts = st.attempts || 0, hints = st.hintsUsed || 0;
    const maxHints = S.mode === "medium" ? 3 : 1;
    let hintsHtml = "";
    for (let i = 0; i < hints; i++) hintsHtml += '<div class="t-hints"><strong>' + (S.mode === "hard" ? "Nudge (scored)" : "Hint " + (i + 1) + "/3") + ":</strong> " + esc(o.hints[Math.min(i, o.hints.length - 1)]) + "</div>";
    return '<div class="taskcard' + (solved ? " solved" : "") + '" id="task-' + o.id + '">' +
      '<div class="t-head">' + tagP(o.pillar) + '<span class="t-title">' + esc(o.title) + '</span><span class="t-status ' + (solved ? "done" : "open") + '">' + (solved ? "✓ SOLVED" : attempts ? "● " + attempts + " check" + (attempts > 1 ? "s" : "") : "○ OPEN") + "</span></div>" +
      '<div class="t-prompt">' + esc(o.prompt) + "</div>" +
      '<div class="t-actions">' +
      '<button class="btn btn-sm btn-primary" type="button" data-act="check" data-arg="' + o.id + '">Check results</button>' +
      (solved ? "" : '<button class="btn btn-sm btn-ghost" type="button" data-act="hint" data-arg="' + o.id + '"' + (S.mode === "hard" && hints >= 1 ? " disabled" : "") + ">Hint" + (S.mode === "medium" ? " (" + hints + "/3)" : " (1 max)") + "</button>") +
      (S.mode === "medium" ? '<button class="btn btn-sm btn-ghost" type="button" data-act="where" data-arg="' + o.id + '">' + ico("i-eye") + "Where</button>" : "") + "</div>" +
      hintsHtml +
      (st.fb ? '<div class="t-feedback ' + (st.fbOk ? "good" : "bad") + '" aria-live="polite"><strong>' + (st.fbOk ? "Pass — " : "Not yet — ") + "</strong>" + esc(st.fb) + "</div>" : "") +
      "</div>";
  }).join("");
}
function renderRing() {
  const objs = modeObjs(); const total = objs.length;
  const solved = objs.filter((o) => (S.obj[o.id] || {}).solved).length;
  const frac = total ? solved / total : 0;
  const c = 2 * Math.PI * 15;
  $("#ringWrap").innerHTML = '<svg width="36" height="36" viewBox="0 0 40 40" role="img" aria-label="' + solved + ' of ' + total + ' objectives complete"><circle cx="20" cy="20" r="15" fill="none" stroke="#1C3A43" stroke-width="5"/><circle cx="20" cy="20" r="15" fill="none" stroke="#39D0A4" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - frac)) + '" transform="rotate(-90 20 20)"/><text x="20" y="25" text-anchor="middle" font-size="12" fill="#DFF7EE" font-family="monospace">' + solved + "</text></svg><span>of " + total + " rounds · " + (S.quiz.submitted ? "exam scored " + S.quiz.correct + "/" + (S.mode === "medium" ? 6 : 8) : "exam pending") + "</span>";
}
function updateTaskListMeta() {
  const objs = modeObjs(); const solved = objs.filter((o) => (S.obj[o.id] || {}).solved).length;
  $("#taskBarFill").style.width = (objs.length ? (solved / objs.length) * 100 : 0) + "%";
  $("#taskProgressLine").textContent = solved + " / " + objs.length + " objectives solved";
  const quizOk = S.quiz.submitted;
  const btn = $("#signoffBtn");
  btn.disabled = !(solved === objs.length && quizOk);
  btn.title = btn.disabled ? (solved === objs.length ? "Complete the board examination first." : "Solve all objectives first.") : "Ready for sign-off";
  renderRing();
}
function renderCart() {
  $("#toolSel").innerHTML = TOOLS.map((t) => '<option value="' + t.id + '"' + (S.tool.tool === t.id ? " selected" : "") + ">" + esc(t.name) + "</option>").join("");
  renderToolTargets();
}
function renderToolTargets() {
  const t = TOOLS.find((x) => x.id === S.tool.tool) || TOOLS[0];
  if (!t.targets.includes(S.tool.target)) S.tool.target = t.targets[0];
  $("#targetSel").innerHTML = t.targets.map((x) => '<option value="' + x + '"' + (S.tool.target === x ? " selected" : "") + ">" + esc(TARGET_LABELS[x] || x) + "</option>").join("");
}
function renderPanelsVisibility() {
  const med = S.mode === "medium";
  $("#roleBoard").hidden = !med; $("#symptomBoard").hidden = !med; $("#coldTriage").hidden = med; $("#anatomyBoard").hidden = med; $("#planningDesk").hidden = med;
  renderRole(); renderSymptom(); renderCold(); renderAnatomy(); renderFeed(); renderMonitor(); renderPlanning(); renderPrevention();
}
function renderAll() {
  $("#modeScreen").hidden = S.started;
  $("#lab").hidden = !S.started;
  if (!S.started) return;
  const mb = $("#modeBadge");
  mb.textContent = S.mode === "medium" ? "DAY SHIFT" : "NIGHT SHIFT";
  mb.classList.toggle("hard", S.mode !== "medium");
  renderPanelsVisibility(); renderWard(); renderChart(); renderCart(); renderTaskList(); renderQuiz(); renderKnowledge(); updateTaskListMeta();
}

/* ---------- actions ---------- */

function signoff() {
  const objs = modeObjs(); const solved = objs.filter((o) => (S.obj[o.id] || {}).solved).length;
  if (solved < objs.length || !S.quiz.submitted) { toast(solved < objs.length ? "All objectives must pass before sign-off (" + solved + "/" + objs.length + ")." : "Complete the board examination first.", "warn"); return; }
  const hintPoints = objs.reduce((a, o) => { const st = S.obj[o.id] || {}; return a + (st.hintsUsed || 0) * (S.mode === "hard" ? 2 : 1); }, 0);
  const first = objs.filter((o) => (S.obj[o.id] || {}).firstAttempt).length;
  const totalQuiz = S.mode === "medium" ? 6 : 8;
  const objRatio = solved / objs.length, quizRatio = S.quiz.correct / totalQuiz, firstRatio = first / objs.length;
  let score = Math.round((0.6 * objRatio + 0.25 * quizRatio + 0.15 * firstRatio - 0.01 * hintPoints) * 100);
  score = Math.max(0, Math.min(100, score));
  const stars = Math.max(1, Math.round(1 + (score / 100) * 4));
  S.done = true; save();
  const pillars = ["P1", "P2", "P3", "P4"];
  const pnames = { P1: "Understand", P2: "Recognize & analyze", P3: "Detect", P4: "Mitigate & verify" };
  const recap = pillars.map((p) => {
    const items = objs.filter((o) => o.pillar === p);
    return '<div class="pillar-recap"><h4>' + p + " — " + pnames[p] + "</h4><ul>" + items.map((o) => "<li>" + ((S.obj[o.id] || {}).solved ? "✓ " : "○ ") + esc(o.title) + "</li>").join("") + "</ul></div>";
  }).join("");
  const focus = [];
  const quizMine = QUIZ.map((q, i) => ({ ...q, i })).filter((q) => q.m === (S.mode === "medium" ? "M" : "H"));
  const missedTopics = [...new Set(quizMine.filter((q) => String(S.quiz.a[q.i]) !== String(q.a)).map((q) => q.t))];
  missedTopics.forEach((t) => focus.push("The board exam caught a gap in “" + t + "” — re-read that part of the Attending's reference, then redo the exam cold."));
  const rechecked = objs.filter((o) => ((S.obj[o.id] || {}).attempts || 0) > 1);
  if (rechecked.length) focus.push("Needed more than one check: " + rechecked.map((o) => "“" + o.title + "”").join(", ") + " — walk those scenarios again from the Diagnostics cart until one clean pass.");
  const hinted = objs.filter((o) => (S.obj[o.id] || {}).hintsUsed > 0);
  if (hinted.length) focus.push((S.mode === "hard" ? "Nudges were spent on: " : "Hints were needed on: ") + hinted.map((o) => "“" + o.title + "”").join(", ") + " — redo these cold and aim for zero.");
  if (!focus.length) focus.push("Clean sweep — first-check objectives, no hints, perfect exam. Take the other shift for harder terrain.");
  const focusHtml = '<h3>Focus areas for your next shift</h3><ul style="font-size:.9rem">' + focus.map((f) => "<li>" + esc(f) + "</li>").join("") + "</ul>";
  const starHtml = '<div class="stars" role="img" aria-label="' + stars + ' of 5 stars">' + [1, 2, 3, 4, 5].map((n) => '<svg class="' + (n <= stars ? "" : "off") + '" style="width:30px;height:30px;color:' + (n <= stars ? "var(--amber-bright)" : "#D8D2C2") + ';fill:' + (n <= stars ? "var(--amber-bright)" : "none") + '"><use href="#i-star"/></svg>').join("") + "</div>";
  openModal(
    "<h2>" + ico("i-med") + " Attending sign-off</h2>" +
    "<p><strong>NimbusCare Network Clinic — service-disruption ward.</strong> You worked the shift to discharge: triaged a noisy feed, diagnosed all three disruptions with the right tools, treated them, and verified recovery. That is the Cloud+ Lesson 6.4 loop, end to end.</p>" +
    starHtml +
    '<table class="kv-table"><tbody>' +
    "<tr><th scope=\"row\">Objectives</th><td>" + solved + " / " + objs.length + " solved</td></tr>" +
    "<tr><th scope=\"row\">First-attempt checks</th><td>" + first + " / " + objs.length + "</td></tr>" +
    "<tr><th scope=\"row\">Hints / nudges used</th><td>" + hintPoints + " point" + (hintPoints === 1 ? "" : "s") + "</td></tr>" +
    "<tr><th scope=\"row\">Board exam</th><td>" + S.quiz.correct + " / " + totalQuiz + "</td></tr>" +
    "<tr><th scope=\"row\">Composite score</th><td><strong>" + score + " / 100</strong></td></tr>" +
    "</tbody></table>" + recap + focusHtml +
    '<h3>What to learn next</h3><ul style="font-size:.9rem">' +
    "<li>Cloud+ CV0-004 Domain 6.0 (Troubleshooting, 12%): the other service-disruption and misconfiguration scenarios.</li>" +
    "<li>Deepen the DNS detection angle: <a href=\"https://attack.mitre.org/techniques/T1071/004/\" target=\"_blank\" rel=\"noopener\">T1071.004 — DNS as C2</a>.</li>" +
    "<li>Rogue DHCP as attack position: <a href=\"https://attack.mitre.org/techniques/T1557/003/\" target=\"_blank\" rel=\"noopener\">T1557.003 — DHCP Spoofing</a>.</li>" +
    "<li>Why trusted time is a forensic control: <a href=\"https://attack.mitre.org/techniques/T1070/006/\" target=\"_blank\" rel=\"noopener\">T1070.006 — Timestomp</a>.</li></ul>" +
    '<div class="apply-row"><button class="btn btn-primary" type="button" data-act="closemodal">Close</button><button class="btn btn-ghost" type="button" data-act="reset">Try the other shift</button></div>'
  );
  logAdd("ATTENDING SIGN-OFF — score " + score + "/100, " + stars + "/5 stars.");
}
