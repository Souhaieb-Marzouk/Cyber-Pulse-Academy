/* ===================
   The Network Clinic — CV0-004 Lesson 6.4 static port — app: actions, event wiring, bootstrap
   Vanilla ES2020+, classic scripts, load order: data -> state -> objectives -> quiz -> ui -> app.
   Bodies are verbatim from the audited build; only code motion, no logic edits.
   ============================================================ */
"use strict";

function startMode(mode) {
  S = defaultState(); S.mode = mode; S.started = true;
  logAdd("Shift started — " + (mode === "medium" ? "DAY SHIFT (guided rounds)" : "NIGHT SHIFT (solo triage)") + ". Three services are down; the feed is noisy.");
  save(); renderAll();
  $("#briefing").scrollIntoView({ behavior: "smooth" });
  toast(mode === "medium" ? "Day shift begun — work the task list top to bottom." : "Night shift begun — no labels, one nudge maximum. Evidence decides.", mode === "medium" ? "" : "warn");
}
function admit(pid) { if (!S.admitted.includes(pid)) { S.admitted.push(pid); logAdd("Admitted patient " + pid.toUpperCase() + " — chart opened, history taken."); } S.active = pid; S.tab = "vitals"; save(); renderWard(); renderChart(); }
function openChart(pid) { S.active = pid; S.tab = "vitals"; save(); renderWard(); renderChart(); $("#chartArea").scrollIntoView({ behavior: "smooth", block: "start" }); }
function setTab(t) { S.tab = t; save(); renderChart(); }
function runTool() {
  const t = TOOLS.find((x) => x.id === S.tool.tool); if (!t) return;
  if (!t.targets.includes(S.tool.target)) S.tool.target = t.targets[0];
  const out = t.run(S, S.tool.target);
  $("#termOut").textContent = "$ " + t.name + " → " + (TARGET_LABELS[S.tool.target] || S.tool.target) + "\n\n" + out;
  logAdd("Diagnostics: " + t.name + " on " + (TARGET_LABELS[S.tool.target] || S.tool.target) + ".");
  save();
}
function dnsCommit() {
  if (!S.env.dnsA || !S.env.dnsTtl) { toast("Select the A record and the TTL before committing.", "warn"); return; }
  S.env.dnsApplied = true;
  const ok = norm(S.env.dnsA) === CORRECT.portalA_new && norm(S.env.dnsTtl) === CORRECT.ttl_new && apiFixed(S);
  logAdd("Committed zone changes: portal → " + S.env.dnsA + " (TTL " + S.env.dnsTtl + ")" + (apiFixed(S) ? "; api.internal → " + S.env.dnsPrivIp : "; api.internal record still missing") + ".");
  save(); renderChart(); renderWard();
  toast(ok ? "Zone committed — dig now answers with the live LB at TTL 300. Verify from the cart." : "Zone committed as configured — but the vitals tell you whether the config was right. Re-run dig.", ok ? "" : "warn");
}
function poolAApply() {
  if (!S.env.poolAFix) { toast("Choose a Pool-A remediation first.", "warn"); return; }
  S.env.poolAFixApplied = true;
  const good = S.env.poolAFix === "r26";
  logAdd("Pool-A change applied: " + S.env.poolAFix + ".");
  save(); renderChart(); renderWard();
  toast(good ? "Secondary range 10.20.28.0/26 active — free leases jump from 7 to 69." : "Applied — but re-read the DHCP console: does this option actually cover tonight's +30 VMs with headroom?", good ? "" : "warn");
}
function optBApply() {
  if (!S.env.poolBOption) { toast("Choose the Option 003 value first.", "warn"); return; }
  S.env.poolBOptionApplied = true;
  const good = norm(S.env.poolBOption) === CORRECT.opt003_new;
  logAdd("Option 003 set to " + S.env.poolBOption + " for VMPOOL-B.");
  save(); renderChart(); renderWard();
  toast(good ? "Option 003 corrected — new leases will hand out the real gateway. Now renew the affected leases." : "Applied — Option 003 now hands out " + S.env.poolBOption + ". Re-check which subnet that router actually lives in.", good ? "" : "warn");
}
function renewLeases() {
  S.env.dhcpRenewed = true;
  if (!gwBOk(S)) { toast("Renewed — but Option 003 still hands out " + (S.env.poolBOptionApplied ? S.env.poolBOption : CORRECT.opt003_wrong) + ": clients just re-leased the same bad gateway. Fix the option, then renew again.", "bad"); }
  else { toast("Leases renewed against the corrected option — VMPOOL-B clients can now reach their gateway."); }
  logAdd("Leases renewed on VMPOOL-B" + (gwBOk(S) ? " into the corrected config." : " — BEFORE the option fix (sequencing lesson)."));
  save(); renderChart(); renderWard();
}
function ntpResync() {
  const sel = S.env.ntpSources || [];
  if (!sel.length) { toast("Tick at least one time source before resyncing.", "warn"); return; }
  if (S.mode === "hard" && sel.includes("legacy")) { toast("Rejected on night shift: 10.40.50.60 was decommissioned in CHG-2481 — a dead source in config is drift waiting to happen. Remove it and resync.", "bad"); logAdd("Resync attempt rejected: config still references decommissioned source 10.40.50.60."); save(); return; }
  S.env.ntpResynced = true;
  const ok = ntpOk(S);
  logAdd("Saved sources (" + sel.join(", ") + ") and forced resync. Offset now " + (ok ? "+0.3 s — in tolerance." : "still out of tolerance — check which sources you actually kept."));
  save(); renderChart(); renderWard();
  toast(ok ? "Resync complete — offset +0.3 s. Kerberos and TLS failures stop here. Prove it: recheck vitals." : "Resync ran, but the surviving source set cannot discipline the clock. Remove dead sources and keep ≥2 live ones.", ok ? "" : "bad");
}
function recheck(pid) {
  if (pid && S.env.rechecked.hasOwnProperty(pid)) S.env.rechecked[pid] = true;
  const rows = vitalsFor(pid); const g = rows.filter((r) => r.ok).length;
  logAdd("Vitals rechecked for " + pid.toUpperCase() + ": " + g + "/" + rows.length + " green" + (g === rows.length ? " — verified." : " — not done yet."));
  save(); renderChart(); renderWard(); renderPrevention();
  toast("Recheck — " + pid.toUpperCase() + ": " + g + "/" + rows.length + " green." + (g === rows.length ? " Verified: the fix is real." : " Red trace remains — return to Treatment."), g === rows.length ? "" : "warn");
}
function recheckAll() {
  ["portal", "vmpool", "batch"].forEach((p) => { S.env.rechecked[p] = true; });
  const lines = ["portal", "vmpool", "batch"].map((p) => p.toUpperCase() + " " + vitalsFor(p).filter((r) => r.ok).length + "/" + vitalsFor(p).length).join(" · ");
  logAdd("Full vitals recheck: " + lines + ".");
  save(); renderWard(); renderChart(); renderPrevention();
  toast("Full recheck: " + lines + (allGreenNow() ? " — all green, discharge-ready." : " — red traces remain."), allGreenNow() ? "" : "warn");
}

function confirmReset() {
  openModal('<h2>' + ico("i-reset") + ' Start a new shift?</h2><p>This clears <strong>all progress saved in this browser</strong> — mode, findings, treatments, quiz results and sign-off — and returns the ward to its pristine 08:52 state.</p><div class="apply-row"><button class="btn btn-ghost" type="button" data-act="closemodal">Cancel</button><button class="btn btn-danger" type="button" data-act="resetgo">Yes — new shift</button></div>');
}
function doReset() { try { localStorage.removeItem(LS_KEY); } catch (e) { } closeModal(); S = defaultState(); save(); renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); }

function seqMove(arg, dir) {
  const [key, idxStr] = arg.split(":"); const i = parseInt(idxStr, 10); const arr = S.env[key]; const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  save(); renderPlanning();
}

/* ---------- global event delegation ---------- */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el || el.disabled) return;
  const a = el.dataset;
  switch (a.act) {
    case "admit": admit(a.arg); break;
    case "open": openChart(a.arg); break;
    case "tab": setTab(a.arg); break;
    case "check": checkObjective(a.arg); break;
    case "hint": showHint(a.arg); break;
    case "where": showWhere(a.arg); break;
    case "dnscommit": dnsCommit(); break;
    case "poola": poolAApply(); break;
    case "optb": optBApply(); break;
    case "renew": renewLeases(); break;
    case "resync": ntpResync(); break;
    case "recheck": recheck(a.arg); break;
    case "recheckall": recheckAll(); break;
    case "quizsubmit": quizSubmit(); break;
    case "signoff": signoff(); break;
    case "reset": confirmReset(); break;
    case "resetgo": doReset(); break;
    case "closemodal": closeModal(); break;
    case "seqmove": seqMove(a.arg, parseInt(a.dir, 10)); break;
    case "role": { const [rid, val] = a.arg.split(":"); S.env.roles[rid] = val; save(); renderRole(); break; }
  }
});
document.addEventListener("change", (e) => {
  const el = e.target; const f = el.dataset && el.dataset.field; if (!f) return;
  const parts = f.split(":"); const kind = parts[0];
  if (kind === "obj") { const o = ensureObj(parts[1]); o.a[parts[3]] = el.type === "checkbox" ? el.checked : el.value; }
  else if (kind === "env") { S.env[parts[1]] = el.type === "checkbox" ? el.checked : el.value; }
  else if (kind === "envsym") { S.env.symptoms[parts[1]] = el.value; }
  else if (kind === "envanatomy") { S.env.anatomy[parts[1]] = el.value; }
  else if (kind === "envalert") { S.env.alerts[parts[1]] = el.value; }
  else if (kind === "envarr") { const [key, val] = parts[1].split("|"); S.env[key] = S.env[key] || []; if (el.checked) { if (!S.env[key].includes(val)) S.env[key].push(val); } else S.env[key] = S.env[key].filter((x) => x !== val); }
  else if (kind === "envprev") { const [g, id] = parts[1].split("|"); S.env["prev_" + g] = S.env["prev_" + g] || []; const k = "prev_" + g; if (el.checked) { if (!S.env[k].includes(id)) S.env[k].push(id); } else S.env[k] = S.env[k].filter((x) => x !== id); }
  else if (kind === "quiz") { S.quiz.a[parts[1]] = el.value; }
  else if (kind === "tool") { S.tool[parts[1]] = el.value; if (parts[1] === "tool") renderToolTargets(); save(); return; }
  save(); updateTaskListMeta();
  if (kind === "envprev") renderPrevention();
});

/* ---------- init ---------- */
(function init() {
  load();
  if (!S.env.seq) S.env.seq = SEQ.init.slice();
  if (!S.env.timeline) S.env.timeline = TL.init.slice();
  const pm = $("#pickMedium"), ph = $("#pickHard");
  if (pm) pm.addEventListener("click", () => startMode("medium"));
  if (ph) ph.addEventListener("click", () => startMode("hard"));
  const rb = $("#resetBtn"); if (rb) rb.addEventListener("click", confirmReset);
  const rt = $("#runToolBtn"); if (rt) rt.addEventListener("click", runTool);
  const ra = $("#recheckAllBtn"); if (ra) ra.addEventListener("click", recheckAll);
  const qs = $("#quizSubmitBtn"); if (qs) qs.addEventListener("click", quizSubmit);
  const so = $("#signoffBtn"); if (so) so.addEventListener("click", signoff);
  const ts = $("#toolSel"); if (ts) ts.addEventListener("change", () => { S.tool.tool = ts.value; renderToolTargets(); save(); });
  const tg = $("#targetSel"); if (tg) tg.addEventListener("change", () => { S.tool.target = tg.value; save(); });
  renderAll();
})();
