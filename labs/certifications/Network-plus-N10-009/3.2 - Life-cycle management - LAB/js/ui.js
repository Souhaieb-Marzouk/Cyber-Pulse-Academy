/* ================= UI — rendering =================
   Shared helpers (escape, screen-reader live regions, toast, icons),
   screens and flow, clipboard rail, yard zones, scoring, and the
   completion manifest. Pure rendering + explicit re-render calls. */

/* ---------- tiny helpers ---------- */
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function announce(msg, assertive){
  const box = assertive ? $("#sr-alert") : $("#sr-live");
  if(box){ box.textContent = ""; setTimeout(()=>{ box.textContent = msg; }, 30); }
}
let toastTimer = null;
function toast(msg){
  const t = $("#toast"); if(!t) return;
  $("#toast-msg").textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), 4200);
}
function hideToast(){ const t = $("#toast"); if(t) t.classList.remove("show"); }
const ICONS = {
  firewall:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  switch:'<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  ap:'<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M12 20h.01"/>',
  server:'<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  laptop:'<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  handheld:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  nas:'<line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/>'
};
function icon(name, size){
  size = size || 18;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.server)+'</svg>';
}
const PILLAR_LABEL = {p1:"P1 · Understand", p2:"P2 · Recognize", p3:"P3 · Detect", p4:"P4 · Mitigate"};

/* ---------- screens ---------- */
function showScreen(name){
  S.screen = name;
  if(S.mode) save();   /* nothing to persist before a mode is chosen — keeps RESET truly clean */
  ["gate","briefing","yard"].forEach(s => { const n = $("#"+s); if(n) n.classList.toggle("hidden", s !== name); });
  window.scrollTo(0,0);
}

function renderGate(){
  const saved = loadSaved();
  const strip = $("#resume-strip");
  if(saved && saved.mode && saved.screen !== "gate"){
    $("#resume-text").textContent = "Saved shift found — " + (saved.mode === "hard" ? "Night audit" : "Day shift") +
      ", " + Object.values(saved.wo||{}).filter(w=>w&&w.passed).length + " work orders done.";
    strip.classList.remove("hidden");
  } else {
    strip.classList.add("hidden");
  }
}

function startMode(mode){
  S = defaultState();
  S.mode = mode;
  S.wo = freshWoList();
  showScreen("briefing");
  renderBriefing();
  save();
  announce("Mode selected: " + (mode === "hard" ? "Hard, night audit" : "Medium, day shift") + ". Scenario briefing open.");
}

function renderBriefing(){
  $("#begin-shift").textContent = S.mode === "hard" ? "Clock in — start the audit" : "Clock in — open the yard";
}

function enterYard(){
  showScreen("yard");
  renderYard();
}

/* ---------- yard head ---------- */
function renderYardHead(){
  const badge = $("#mode-badge");
  badge.textContent = S.mode === "hard" ? "Night audit · Hard" : "Day shift · Medium";
  badge.className = "mode-badge " + (S.mode === "hard" ? "hard" : "medium");
  $("#today-line").textContent = TODAY_LINE;
  updateProgress();
}

function updateProgress(){
  const list = woList();
  const done = list.filter(o => woState(o.id).passed).length;
  $("#wo-progress-text").textContent = done + "/" + list.length;
  $("#wo-progress-bar").style.width = Math.round(done/list.length*100) + "%";
  $("#score-text").textContent = computeObjPct() + "%";
  const fc = $("#clip-fab-count"); if(fc) fc.textContent = "(" + done + "/" + list.length + ")";
}

/* ---------- clipboard ---------- */
function renderClipboard(){
  const list = woList();
  const wrap = $("#wo-list");
  wrap.innerHTML = "";
  list.forEach(o => {
    const w = woState(o.id);
    const card = document.createElement("div");
    card.className = "wo " + o.pillar + (w.passed ? " done" : "");
    card.id = "wo-" + o.id;
    let zoneBtn = "";
    if(S.mode !== "hard" && o.zone){
      zoneBtn = '<button type="button" class="btn small ghost zone-jump" data-zone="'+o.zone+'">Where to look</button>';
    }
    let hintBtn = "";
    if(S.mode === "hard"){
      hintBtn = w.hint ? '' : '<button type="button" class="btn small ghost hint-btn" data-obj="'+o.id+'">Nudge (−15 pts)</button>';
    } else {
      hintBtn = w.hint < 3 ? '<button type="button" class="btn small ghost hint-btn" data-obj="'+o.id+'">Hint '+(w.hint+1)+'/3</button>' : '';
    }
    card.innerHTML =
      '<div class="wo-top"><span class="obj-id">'+o.id+'</span>' +
      '<span class="status-chip '+(w.passed?'pass':'open')+'">'+(w.passed?'✔ passed':'open')+'</span></div>' +
      '<h3>'+esc(o.title)+'</h3>' +
      '<div><span class="pillar '+o.pillar+'">'+PILLAR_LABEL[o.pillar]+'</span></div>' +
      '<div class="desc">'+esc(o.desc)+'</div>' +
      '<div class="wo-actions">' +
        '<button type="button" class="btn small check" data-check="'+o.id+'">Check results</button>' +
        hintBtn + zoneBtn +
      '</div>' +
      '<div class="anchor">Maps to: '+esc(o.anchor)+'</div>' +
      '<div class="fb-slot"></div>';
    wrap.appendChild(card);
  });
  $("#wo-count").textContent = "(" + list.filter(o=>woState(o.id).passed).length + "/" + list.length + " done)";
}

function woFeedback(id, kind, text){
  const card = $("#wo-" + id);
  if(!card) return;
  const slot = card.querySelector(".fb-slot");
  slot.innerHTML = '<div class="feedback '+kind+'" tabindex="0">'+text+'</div>';
  announce(text.replace(/<[^>]+>/g," "), kind === "no");
}
function woClearFeedback(id){ const card = $("#wo-"+id); if(card) card.querySelector(".fb-slot").innerHTML = ""; }

function showHint(id){
  const o = woList().find(x=>x.id===id);
  const w = woState(id);
  if(w.passed) return;
  if(S.mode === "hard"){
    if(w.hint) return;
    w.hint = 1;
    const card = $("#wo-"+id);
    card.querySelector(".fb-slot").innerHTML = '<div class="hintbox" tabindex="0"><b>Nudge (−15 pts):</b> '+esc(o.nudge)+'</div>';
    const hb = card.querySelector(".hint-btn"); if(hb) hb.remove();
    toast("Nudge used — 15 points deducted from this work order.");
  } else {
    if(w.hint >= 3) return;
    w.hint += 1;
    const card = $("#wo-"+id);
    card.querySelector(".fb-slot").innerHTML = '<div class="hintbox" tabindex="0"><b>Hint '+w.hint+'/3:</b> '+esc(o.hints[w.hint-1])+'</div>';
    const hb = card.querySelector(".hint-btn");
    if(hb){ if(w.hint >= 3) hb.remove(); else hb.textContent = "Hint " + (w.hint+1) + "/3"; }
  }
  save(); updateProgress();
}

/* ---------- zone jump (Medium guidance) ---------- */
function jumpToZone(zone){
  const map = {core:"#zone-core", notices:"#zone-notices", depot:"#zone-depot", bench:"#zone-bench", gate:"#zone-gate", office:"#zone-office"};
  const target = $(map[zone] || "#zone-core");
  if(target){
    target.scrollIntoView({behavior:"smooth", block:"start"});
    target.style.outline = "2px solid var(--amber)";
    setTimeout(()=>{ target.style.outline = ""; }, 1600);
  }
}

/* ---------- notice board ---------- */
function renderNotices(){
  const wrap = $("#notice-grid");
  wrap.innerHTML = "";
  NOTICES.forEach(n => {
    const d = document.createElement("article");
    d.className = "notice" + (n.lifecycle ? "" : "");
    d.innerHTML =
      '<div class="n-head"><span class="n-id">'+esc(n.id)+'</span><span class="n-date">'+esc(n.date)+'</span></div>' +
      '<div class="n-vendor" style="font-family:var(--mono);font-size:11px;color:#7a4d00">'+esc(n.vendor)+'</div>' +
      '<h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p>' +
      (S.mode === "hard" ?
        '<label class="pick"><input type="checkbox" data-notice="'+n.id+'" '+(S.env.noticePicks[n.id]?'checked':'')+'> Not a vendor lifecycle notice</label>' : '');
    wrap.appendChild(d);
  });
  if(S.mode === "hard"){
    if(!wrap._wired){ wrap._wired = true; wrap.addEventListener("change", ev => {
      const cb = ev.target.closest("input[data-notice]");
      if(cb){ S.env.noticePicks[cb.dataset.notice] = cb.checked; save(); }
    }); }
  }
}

/* ---------- depot floor ---------- */
function renderDepot(){
  const wrap = $("#crate-grid");
  wrap.innerHTML = "";
  const leaving = {lt1:true, lt2:true, md1:true};
  DEVICES.forEach(dev => {
    const d = document.createElement("article");
    d.className = "crate";
    const lamp = S.env.lamps[dev.id] || "";
    const isLeaving = !!leaving[dev.id];
    const lampSel = isLeaving ?
      '<div class="c-lamp-row"><span class="lamp unknown"></span><span style="font-family:var(--mono);font-size:11px;color:var(--ink-faint)">at the disposal gate</span></div>' :
      '<div class="c-lamp-row"><label class="sr-only" for="lamp-'+dev.id+'">Lifecycle status for '+esc(dev.tag)+'</label>' +
        '<select id="lamp-'+dev.id+'" class="lamp-select" data-lamp="'+dev.id+'">' +
          '<option value="">— set lamp —</option>' +
          '<option value="sup"'+(lamp==="sup"?' selected':'')+'>Supported</option>' +
          '<option value="eol"'+(lamp==="eol"?' selected':'')+'>EOL — plan refresh</option>' +
          '<option value="eos"'+(lamp==="eos"?' selected':'')+'>EOS — unsupported</option>' +
        '</select><span class="lamp '+(lamp||'unknown')+'" aria-hidden="true"></span></div>';
    let flagHtml = "";
    if(!isLeaving){
      if(S.mode === "hard"){
        flagHtml =
          '<label class="flagbox"><input type="checkbox" data-flag="'+dev.id+'" '+(S.env.flags[dev.id]?'checked':'')+'> No vendor updates</label>' +
          '<label class="flagbox"><input type="checkbox" data-high="'+dev.id+'" '+(S.env.highFlags[dev.id]?'checked':'')+'> High risk now</label>';
      } else {
        flagHtml = '<label class="flagbox"><input type="checkbox" data-flag="'+dev.id+'" '+(S.env.flags[dev.id]?'checked':'')+'> Urgent risk</label>';
      }
    }
    d.innerHTML =
      '<div class="c-top"><span class="c-icon">'+icon(dev.type,18)+'</span>' +
        '<div><div class="c-tag">'+esc(dev.tag)+'</div><div class="c-model">'+esc(dev.model)+'</div></div></div>' +
      '<span class="c-os">'+esc(dev.os)+'</span>' +
      '<div class="c-dates">end-of-sale: '+esc(dev.eosale)+'<br>end-of-support: '+esc(dev.eos)+'</div>' +
      lampSel + flagHtml +
      '<button type="button" class="detail-toggle" aria-expanded="false" data-detail="'+dev.id+'">Crate details</button>' +
      '<dl class="detail" id="detail-'+dev.id+'">' +
        '<dt>Serial</dt><dd>'+esc(dev.serial)+'</dd>' +
        '<dt>Location</dt><dd>'+esc(dev.loc)+'</dd>' +
        '<dt>Data on board</dt><dd>'+esc(dev.data)+'</dd>' +
        '<dt>Warranty</dt><dd>'+esc(dev.warranty)+'</dd>' +
        '<dt>Yard notes</dt><dd>'+esc(dev.extra)+'</dd>' +
      '</dl>';
    wrap.appendChild(d);
  });
  if(!wrap._wired){ wrap._wired = true; wrap.addEventListener("change", ev => {
    const lamp = ev.target.closest("select[data-lamp]");
    if(lamp){
      S.env.lamps[lamp.dataset.lamp] = lamp.value;
      const dot = lamp.parentElement.querySelector(".lamp");
      if(dot) dot.className = "lamp " + (lamp.value || "unknown");
      save();
    }
    const fl = ev.target.closest("input[data-flag]");
    if(fl){ S.env.flags[fl.dataset.flag] = fl.checked; save(); }
    const hi = ev.target.closest("input[data-high]");
    if(hi){ S.env.highFlags[hi.dataset.high] = hi.checked; save(); }
  }); }
  if(!wrap._wired2){ wrap._wired2 = true; wrap.addEventListener("click", ev => {
    const t = ev.target.closest(".detail-toggle");
    if(t){
      const det = $("#detail-" + t.dataset.detail);
      const open = det.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
      t.textContent = open ? "Close details" : "Crate details";
    }
  }); }
}

/* ---------- workbench ---------- */
function renderBench(){
  const sel = $("#bench-device");
  const opts = DEVICES.filter(d => !["lt1","lt2","md1"].includes(d.id)).map(d =>
    '<option value="'+d.id+'"'+(S.env.bench.device===d.id?" selected":"")+'>'+esc(d.tag+" · "+d.model)+'</option>').join("");
  sel.innerHTML = opts;
  renderBenchDevice();
  if(!sel._wired){ sel._wired = true; sel.addEventListener("change", () => { S.env.bench.device = sel.value || null; save(); renderBenchDevice(); }); }

  if(S.mode === "hard"){
    const oldExtra = $("#bench-hard-extra"); if(oldExtra) oldExtra.remove();
    const extra = document.createElement("div");
    extra.id = "bench-hard-extra";
    extra.innerHTML =
      '<h3 style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#dfe6ee;margin:18px 0 4px">Incident board · fw1 response sequence</h3>' +
      '<p style="font-size:12.5px;color:var(--steel-txt)">Click the steps in operational order — first move to last.</p>' +
      '<div class="seq-slots" id="incident-slots"></div><div class="seq-chips" id="incident-chips"></div>' +
      '<h3 style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#dfe6ee;margin:18px 0 4px">Rollout calendar · software action ordering</h3>' +
      '<p style="font-size:12.5px;color:var(--steel-txt)">Click the four actions in the order you would run them, then tick the rollback commitment.</p>' +
      '<div class="seq-slots" id="rollout-slots"></div><div class="seq-chips" id="rollout-chips"></div>' +
      '<label class="precheck" style="margin-top:10px"><input type="checkbox" id="rollout-rollback" '+(S.env.rolloutRollback?"checked":"")+'> Rollback plan prepared for every action</label>' +
      '<h3 style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#dfe6ee;margin:18px 0 4px">Firmware near-miss · ap1 target image</h3>' +
      '<label class="lbl" for="fw-target" style="font-size:11px;color:#8fa1b3;display:block;margin:4px 0">Target image for THF-AP-208 (A320)</label>' +
      '<select id="fw-target" style="width:100%;min-height:40px;border-radius:8px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;padding:8px;font-size:13px">' +
        '<option value="">— choose —</option>' +
        FW_TARGET_OPTS.map((o,i)=>'<option value="'+i+'"'+(S.env.fwTarget===String(i)?" selected":"")+'>'+esc(o)+'</option>').join("") +
      '</select>' +
      '<label class="lbl" for="fw-reason" style="font-size:11px;color:#8fa1b3;display:block;margin:8px 0">Why the other big-number image is wrong</label>' +
      '<select id="fw-reason" style="width:100%;min-height:40px;border-radius:8px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;padding:8px;font-size:13px">' +
        '<option value="">— choose —</option>' +
        FW_REASON_OPTS.map((o,i)=>'<option value="'+i+'"'+(S.env.fwReason===String(i)?" selected":"")+'>'+esc(o)+'</option>').join("") +
      '</select>';
    $("#bench-actions").appendChild(extra);
    renderSequence("incident");
    renderSequence("rollout");
    $("#rollout-rollback").addEventListener("change", e => { S.env.rolloutRollback = e.target.checked; save(); });
    $("#fw-target").addEventListener("change", e => { S.env.fwTarget = e.target.value; save(); });
    $("#fw-reason").addEventListener("change", e => { S.env.fwReason = e.target.value; save(); });
  }
}

function versionReport(dev){
  const lines = {
    fw1:['<b>Version report — THF-FW-001</b>','Platform: Northcell NC-700','Installed OS: NCware 7.9.1','<span class="vr-warn">Support status: ENDED 2026-03-31 — no updates available</span>','Management interface: 10.62.0.1 (perimeter side)','<span class="vr-warn">Advisory match: CVE-2026-1187 affects NCware 7.x</span>'].join("\n"),
    sw1:['<b>Version report — THF-SW-014</b>','Platform: Corelan CX-9400','Installed OS: Coreware 12.4L','<span class="vr-ok">Support status: ACTIVE until 2027-12-31</span>','<span class="vr-ok">Already on latest release — no update pending</span>'].join("\n"),
    sw2:['<b>Version report — THF-SW-031</b>','Platform: Corelan CX-2100','Installed OS: Coreware 9.2.7','<span class="vr-warn">Support status: ENDED 2025-08-15 — no updates available</span>'].join("\n"),
    sw3:['<b>Version report — THF-SW-055</b>','Platform: Corelan CX-2100','Installed OS: Coreware 9.2.7','<span class="vr-warn">Support status: ENDED 2025-08-15 (vendor)</span>','Note: DepotCare hardware-swap contract active until 2027-06-30','<span class="vr-warn">Vendor security patches: NONE regardless of contract</span>'].join("\n"),
    ap1:['<b>Version report — THF-AP-208</b>','Platform: ApexWire A320','Installed firmware: 6.2.1','<span class="vr-ok">Available: 6.2.3 (supports A320) — security + bug fixes</span>','<span class="vr-warn">Available: 7.0.0 — A550-series hardware ONLY</span>','<span class="vr-warn">Available: 6.2.2 — WITHDRAWN, superseded by 6.2.3</span>'].join("\n"),
    ap2:['<b>Version report — THF-AP-311</b>','Platform: ApexWire A550','Installed firmware: 8.0.2','<span class="vr-ok">Support status: ACTIVE until 2029-06-30 · latest image</span>'].join("\n"),
    srv1:['<b>Version report — THF-SRV-007</b>','Platform: Vantage VS-2','Installed OS: Stratus OS 14.2','<span class="vr-ok">Support status: ACTIVE (14.x supported)</span>','<span class="vr-warn">Pending: security patch SP-2026-11A (CVE-2026-0341)</span>','Pending: bug fix BF-2026-104','UEFI: 2.9 installed · 2.14 available'].join("\n"),
    srv2:['<b>Version report — THF-SRV-012</b>','Platform: Vantage VS-1','Installed OS: Stratus OS 11.4','<span class="vr-warn">Support status: ENDED 2026-05-31 — no updates available</span>','<span class="vr-ok">Upgrade path: Stratus OS 14.2 — requires UEFI 2.14 first</span>','UEFI: 2.9 installed · 2.14 available','App: LedgerLine payroll (data: confidential)'].join("\n"),
    nas1:['<b>Version report — THF-NAS-003</b>','Platform: Yardline NAS-8','Installed OS: YardlineOS 3.1','<span class="vr-ok">Support status: ACTIVE until 2027-08-31 · current</span>','Data: driver-license scans — retention RR-12 until 2031-06-30'].join("\n")
  };
  return lines[dev.id] || '<b>Version report — '+esc(dev.tag)+'</b>\nNo software management items — device is scheduled to leave via the disposal gate.';
}

function renderBenchDevice(){
  const dev = S.env.bench.device ? deviceById(S.env.bench.device) : null;
  const rep = $("#version-report");
  const setA = $("#action-set"), pre = $("#precheck"), note = $("#bench-note");
  setA.innerHTML = ""; pre.innerHTML = ""; note.innerHTML = "";
  if(!dev){
    rep.innerHTML = 'Pick an asset from the rack to open its version report.';
    return;
  }
  rep.innerHTML = versionReport(dev);
  const isLeaving = ["lt1","lt2","md1"].includes(dev.id);
  BENCH_ACTIONS.forEach(a => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "action-chip";
    btn.setAttribute("aria-pressed", S.env.bench.actions[dev.id] === a.id ? "true" : "false");
    btn.textContent = a.label;
    const whyOff = (BENCH_DISABLED[dev.id] && BENCH_DISABLED[dev.id][a.id]) || null;
    /* QA: policy-blocked actions stay pressable so the teaching note is reachable on touch
       (title-only tooltips never show on mobile); leaving devices stay truly disabled. */
    if(isLeaving){ btn.disabled = true; }
    else if(whyOff){ btn.classList.add("policy-off"); btn.title = whyOff; btn.setAttribute("aria-description", whyOff); }
    btn.addEventListener("click", () => {
      if(isLeaving) return;
      if(whyOff){
        note.innerHTML = '<div class="bench-note warn">'+esc(whyOff)+'</div>';
        announce(whyOff, true);
        return;
      }
      S.env.bench.actions[dev.id] = a.id;
      save(); renderBenchDevice();
    });
    setA.appendChild(btn);
  });
  if(isLeaving){
    note.innerHTML = '<div class="bench-note warn">'+esc(dev.tag)+' is leaving the company — its decisions live at the Disposal Gate below.</div>';
  }
  const showInterim = ["fw1","sw2","sw3","srv2"].includes(dev.id);
  BENCH_TOGGLES.forEach(t => {
    if(t.id === "interim" && !showInterim) return;
    const lab = document.createElement("label");
    const on = !!(S.env.bench.toggles[dev.id] && S.env.bench.toggles[dev.id][t.id]);
    lab.innerHTML = '<input type="checkbox" data-toggle="'+t.id+'" '+(on?"checked":"")+'> '+esc(t.label);
    lab.querySelector("input").addEventListener("change", e => {
      S.env.bench.toggles[dev.id] = S.env.bench.toggles[dev.id] || {};
      S.env.bench.toggles[dev.id][t.id] = e.target.checked;
      save();
    });
    pre.appendChild(lab);
  });
}

/* generic click-to-order sequencer */
function renderSequence(kind){
  const steps = kind === "incident" ? INCIDENT_STEPS : ROLLOUT_STEPS;
  const displayOrder = kind === "incident" ? INCIDENT_DISPLAY : ROLLOUT_DISPLAY;
  const chosen = kind === "incident" ? S.env.incidentSeq : S.env.rolloutSeq;
  const usedMap = kind === "incident" ? S.env.incidentUsed : S.env.rolloutUsed;
  const slotsEl = $("#"+kind+"-slots"), chipsEl = $("#"+kind+"-chips");
  if(!slotsEl || !chipsEl) return;
  slotsEl.innerHTML = ""; chipsEl.innerHTML = "";
  for(let i=0;i<steps.length;i++){
    const slot = document.createElement("div");
    slot.className = "seq-slot" + (chosen[i] !== undefined ? " filled" : "");
    slot.textContent = chosen[i] !== undefined ? (i+1) + " · " + steps[chosen[i]] : (i+1) + " · empty";
    if(chosen[i] !== undefined){
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "btn small ghost";
      rm.style.marginLeft = "8px"; rm.style.minHeight = "26px"; rm.style.padding = "2px 8px";
      rm.textContent = "×"; rm.setAttribute("aria-label", "Remove step " + (i+1));
      rm.addEventListener("click", () => {
        usedMap[chosen[i]] = false;
        chosen.splice(i,1);
        save(); renderSequence(kind);
      });
      slot.appendChild(rm);
    }
    slotsEl.appendChild(slot);
  }
  displayOrder.forEach(idx => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "seq-chip" + (usedMap[idx] ? " used" : "");
    chip.textContent = steps[idx];
    chip.disabled = !!usedMap[idx];
    chip.addEventListener("click", () => {
      if(chosen.length >= steps.length) return;
      usedMap[idx] = true;
      chosen.push(idx);
      save(); renderSequence(kind);
    });
    chipsEl.appendChild(chip);
  });
}

/* ---------- disposal gate ---------- */
function gateCandidateSteps(assetId){
  const cands = {
    lt1:["backup","wipe","cert-erase","reset"],
    lt2:["cert-destroy","wipe","backup","cert-erase"],
    md1:["sim-sd","reset","wipe","cert-erase"],
    nas1:["retention","backup","cert-destroy","wipe"],
    fw1:["sanitize","wipe","cert-destroy","retention"],
    sw2:["sanitize","wipe","sim-sd","retention"]
  };
  return cands[assetId] || [];
}
function renderGateZone(){
  const wrap = $("#gate-grid");
  wrap.innerHTML = "";
  GATE_ASSETS.forEach(id => {
    const dev = deviceById(id);
    const card = document.createElement("article");
    card.className = "gate-card";
    const route = S.env.gate.routes[id] || "";
    const stepsHtml = gateCandidateSteps(id).map(sid => {
      const st = GATE_STEPS.find(s=>s.id===sid);
      const on = !!(S.env.gate.steps[id] && S.env.gate.steps[id][sid]);
      return '<label><input type="checkbox" data-gstep="'+id+':'+sid+'" '+(on?"checked":"")+'> '+esc(st.label)+'</label>';
    }).join("");
    card.innerHTML =
      '<h3>'+icon(dev.type,16)+' '+esc(dev.tag)+'</h3>' +
      '<div class="g-meta">'+esc(dev.model)+' · '+esc(GATE_META[id])+'</div>' +
      '<label class="sr-only" for="route-'+id+'">Disposal route for '+esc(dev.tag)+'</label>' +
      '<select id="route-'+id+'" data-groute="'+id+'">' +
        '<option value="">— choose route —</option>' +
        GATE_ROUTES.map(r=>'<option value="'+r.id+'"'+(route===r.id?" selected":"")+'>'+esc(r.label)+'</option>').join("") +
      '</select>' +
      '<div class="gate-steps">'+stepsHtml+'</div>';
    wrap.appendChild(card);
  });
  if(!wrap._wired){ wrap._wired = true; wrap.addEventListener("change", ev => {
    const rs = ev.target.closest("select[data-groute]");
    if(rs){ S.env.gate.routes[rs.dataset.groute] = rs.value; save(); }
    const gs = ev.target.closest("input[data-gstep]");
    if(gs){
      const [dev, step] = gs.dataset.gstep.split(":");
      S.env.gate.steps[dev] = S.env.gate.steps[dev] || {};
      S.env.gate.steps[dev][step] = gs.checked;
      save();
    }
  }); }
  /* Hard mode: sanitization matrix */
  if(S.mode === "hard"){
    const zoneBody = wrap.parentElement;
    const old = $("#matrix-block"); if(old) old.remove();
    const mx = document.createElement("div");
    mx.id = "matrix-block";
    mx.style.marginTop = "14px";
    mx.innerHTML =
      '<h3 style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#dfe6ee;margin:4px 0 8px">Sanitization matrix · match method to media</h3>' +
      '<div class="gate-grid">' +
      MATRIX_CASES.map((c,i)=>
        '<div class="gate-card"><h3 style="font-size:13px">Case '+(i+1)+'</h3><div class="g-meta">'+esc(c.t)+'</div>' +
        '<select data-matrix="'+i+'" aria-label="Sanitization method for case '+(i+1)+'">' +
          '<option value="">— method —</option>' +
          MATRIX_OPTS.map((o,j)=>'<option value="'+j+'"'+(S.env.matrix[i]===String(j)?" selected":"")+'>'+esc(o)+'</option>').join("") +
        '</select></div>').join("") +
      '</div>';
    zoneBody.appendChild(mx);
    mx.addEventListener("change", ev => {
      const sel = ev.target.closest("select[data-matrix]");
      if(sel){ S.env.matrix[sel.dataset.matrix] = sel.value; save(); }
    });
  }
}

/* ---------- records office ---------- */
function renderLedger(){
  const wrap = $("#ledger");
  wrap.innerHTML = "";
  const items = [];
  if(S.mode === "hard"){
    LEDGER_HARD.predone.forEach(it => items.push({id:it.id, t:it.t, locked:true, done:true}));
    LEDGER_HARD.gaps.forEach(it => items.push({id:it.id, t:it.t, locked:false, done:false}));
    LEDGER_HARD.traps.forEach(it => items.push({id:it.id, t:it.t, locked:false, done:false}));
  } else {
    LEDGER_MED.forEach(it => items.push({id:it.id, t:it.t, locked:false, done:false}));
  }
  items.forEach(it => {
    const checked = it.locked ? true : !!S.env.ledger[it.id];
    const li = document.createElement("label");
    li.className = "ledger-item" + (it.locked ? " locked" : "") + (checked && it.locked ? " done-item" : "");
    li.innerHTML =
      '<input type="checkbox" data-ledger="'+it.id+'" '+(checked?"checked":"")+(it.locked?" disabled":"")+'>' +
      '<span class="li-text">'+esc(it.t)+(it.locked?'<small>already filed — done</small>':'')+'</span>';
    if(!it.locked){
      li.querySelector("input").addEventListener("change", e => { S.env.ledger[it.id] = e.target.checked; save(); });
    }
    wrap.appendChild(li);
  });
}

/* ---------- core zone exercises + glossary ---------- */
function renderCore(){
  /* glossary */
  const gl = $("#glossary-list");
  gl.innerHTML = "";
  GLOSSARY.forEach(([term, def]) => {
    const w = document.createElement("span");
    w.className = "gloss";
    w.setAttribute("tabindex","0");
    w.innerHTML = '<button type="button" class="g-term" aria-describedby="gd-'+term.replace(/\W+/g,"")+'">'+esc(term)+'</button>' +
      '<span class="g-def" id="gd-'+term.replace(/\W+/g,"")+'" role="tooltip">'+esc(def)+'</span>';
    gl.appendChild(w);
  });

  /* exercises */
  const grid = $("#zone-core .core-grid");
  const old = $("#core-exercises"); if(old) old.remove();
  const box = document.createElement("div");
  box.className = "core-col";
  box.id = "core-exercises";
  let html = '<h3>Clerk drills</h3>';
  if(S.mode !== "hard"){
    /* M1 timeline */
    html += '<div style="margin-bottom:14px"><b style="font-size:13px">Drill A — order the asset\'s road</b>' +
      '<div class="seq-slots" id="timeline-slots"></div><div class="seq-chips" id="timeline-chips"></div>' +
      '<button type="button" class="btn small ghost" id="timeline-reset" style="margin-top:6px">Clear</button></div>';
    /* M2 definitions */
    html += '<div style="margin-bottom:14px"><b style="font-size:13px">Drill B — definitions</b>' +
      '<label class="lbl" style="display:block;font-size:11px;color:#8fa1b3;margin:6px 0 4px">End-of-life (EOL) means…</label>' +
      '<select id="def-eol" style="width:100%;min-height:40px;border-radius:8px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;padding:8px;font-size:13px">' +
        '<option value="">— choose —</option>' + DEF_EOL_OPTS.map((o,i)=>'<option value="'+i+'"'+(S.env.defs.eol==String(i)?" selected":"")+'>'+esc(o)+'</option>').join("") +
      '</select>' +
      '<label class="lbl" style="display:block;font-size:11px;color:#8fa1b3;margin:8px 0 4px">End-of-support (EOS) means…</label>' +
      '<select id="def-eos" style="width:100%;min-height:40px;border-radius:8px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;padding:8px;font-size:13px">' +
        '<option value="">— choose —</option>' + DEF_EOS_OPTS.map((o,i)=>'<option value="'+i+'"'+(S.env.defs.eos==String(i)?" selected":"")+'>'+esc(o)+'</option>').join("") +
      '</select></div>';
    /* M3 EOS checks */
    html += '<div style="margin-bottom:14px"><b style="font-size:13px">Drill C — what vanishes at EOS?</b><fieldset style="border:none;padding:0;margin:6px 0 0">' +
      EOS_CHECKS.map((c,i)=>'<label style="display:flex;gap:8px;align-items:center;font-size:13px;color:#cfd6de;margin:5px 0;min-height:36px"><input type="checkbox" data-eos="'+i+'" '+(S.env.eosChecks[i]?"checked":"")+' style="width:16px;height:16px;accent-color:#2e9e5b"> '+esc(c.t)+'</label>').join("") +
      '</fieldset></div>';
    /* M5 classify */
    html += '<div style="margin-bottom:14px"><b style="font-size:13px">Drill D — sort the update types</b>' +
      CLASSIFY_ITEMS.map((it,i)=>'<div style="margin:8px 0"><div style="font-size:12.5px;color:#cfd6de">'+esc(it.t)+'</div>' +
        '<select data-classify="'+i+'" aria-label="Type of update '+esc(it.t)+'" style="width:100%;min-height:36px;margin-top:4px;border-radius:6px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;font-size:12.5px;padding:6px">' +
        '<option value="">— type —</option>' + CLASSIFY_OPTS.map((o,j)=>'<option value="'+j+'"'+(S.env.classify[i]==String(j)?" selected":"")+'>'+esc(o)+'</option>').join("") +
        '</select></div>').join("") + '</div>';
    /* M7 evidence */
    html += '<div><b style="font-size:13px">Drill E — name the evidence</b>' +
      EVIDENCE_ROWS.map((r,i)=>'<div style="margin:8px 0"><div style="font-size:12.5px;color:#cfd6de">'+esc(r.q)+'</div>' +
        '<select data-evidence="'+i+'" aria-label="Evidence source '+esc(r.q)+'" style="width:100%;min-height:36px;margin-top:4px;border-radius:6px;border:1px solid #3a424e;background:#1a1e24;color:#e7edf3;font-size:12.5px;padding:6px">' +
        '<option value="">— source —</option>' + r.opts.map((o,j)=>'<option value="'+j+'"'+(S.env.evidence[i]==String(j)?" selected":"")+'>'+esc(o)+'</option>').join("") +
        '</select></div>').join("") + '</div>';
  } else {
    /* H9 facts */
    html += '<div><b style="font-size:13px">Executive risk statement — pick exactly THREE facts</b><fieldset style="border:none;padding:0;margin:6px 0 0">' +
      FACTS.map(f=>'<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#cfd6de;margin:6px 0;min-height:36px"><input type="checkbox" data-fact="'+f.id+'" '+(S.env.riskFacts[f.id]?"checked":"")+' style="width:16px;height:16px;margin-top:3px;accent-color:#c94448"> '+esc(f.t)+'</label>').join("") +
      '</fieldset></div>';
  }
  box.innerHTML = html;
  grid.appendChild(box);

  /* wire exercises */
  if(S.mode !== "hard"){
    renderSequenceTimeline();
    $("#timeline-reset").addEventListener("click", () => {
      S.env.timeline = []; S.env.timelineUsed = {}; save(); renderSequenceTimeline();
    });
    $("#def-eol").addEventListener("change", e => { S.env.defs.eol = e.target.value; save(); });
    $("#def-eos").addEventListener("change", e => { S.env.defs.eos = e.target.value; save(); });
    box.addEventListener("change", e => {
      const eos = e.target.closest("input[data-eos]");
      if(eos){ S.env.eosChecks[eos.dataset.eos] = eos.checked; save(); }
      const cl = e.target.closest("select[data-classify]");
      if(cl){ S.env.classify[cl.dataset.classify] = cl.value; save(); }
      const ev2 = e.target.closest("select[data-evidence]");
      if(ev2){ S.env.evidence[ev2.dataset.evidence] = ev2.value; save(); }
    });
  } else {
    box.addEventListener("change", e => {
      const f = e.target.closest("input[data-fact]");
      if(f){ S.env.riskFacts[f.dataset.fact] = f.checked; save(); }
    });
  }
}

/* timeline uses the same sequencer pattern but separate state */
function renderSequenceTimeline(){
  const slotsEl = $("#timeline-slots"), chipsEl = $("#timeline-chips");
  if(!slotsEl || !chipsEl) return;
  const chosen = S.env.timeline, used = S.env.timelineUsed;
  slotsEl.innerHTML = ""; chipsEl.innerHTML = "";
  for(let i=0;i<TIMELINE_STAGES.length;i++){
    const slot = document.createElement("div");
    slot.className = "seq-slot" + (chosen[i] !== undefined ? " filled" : "");
    slot.textContent = chosen[i] !== undefined ? (i+1) + " · " + TIMELINE_STAGES[chosen[i]] : (i+1) + " · empty";
    if(chosen[i] !== undefined){
      const rm = document.createElement("button");
      rm.type = "button"; rm.className = "btn small ghost";
      rm.style.marginLeft = "8px"; rm.style.minHeight = "26px"; rm.style.padding = "2px 8px";
      rm.textContent = "×"; rm.setAttribute("aria-label", "Remove stage " + (i+1));
      rm.addEventListener("click", () => {
        used[chosen[i]] = false; chosen.splice(i,1);
        save(); renderSequenceTimeline();
      });
      slot.appendChild(rm);
    }
    slotsEl.appendChild(slot);
  }
  TIMELINE_DISPLAY.forEach(idx => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "seq-chip" + (used[idx] ? " used" : "");
    chip.textContent = TIMELINE_STAGES[idx];
    chip.disabled = !!used[idx];
    chip.addEventListener("click", () => {
      if(chosen.length >= TIMELINE_STAGES.length) return;
      used[idx] = true; chosen.push(idx);
      save(); renderSequenceTimeline();
    });
    chipsEl.appendChild(chip);
  });
}

/* ---------- score ---------- */
/* R8 evidence: work orders that needed retries or hints, plus missed quiz items,
   mapped back to the objective each quiz item tests (item tag t). */
function computeFocusAreas(){
  const list = woList();
  const weak = [];
  list.forEach(o=>{
    const w = woState(o.id);
    if(!w.passed) return;
    const hintTxt = S.mode === "hard" ? "the nudge" : w.hint + " hint" + (w.hint>1?"s":"");
    if(w.attempts > 1 && w.hint > 0)
      weak.push({pillar:o.pillar, text:o.id + " — " + o.title + ": took " + w.attempts + " checks and " + hintTxt + ". Re-read: " + o.anchor + "."});
    else if(w.attempts > 1)
      weak.push({pillar:o.pillar, text:o.id + " — " + o.title + ": took " + w.attempts + " checks. Re-read: " + o.anchor + "."});
    else if(w.hint > 0)
      weak.push({pillar:o.pillar, text:o.id + " — " + o.title + ": passed first check but used " + hintTxt + ". Re-read: " + o.anchor + "."});
  });
  const qs2 = S.mode === "hard" ? QUIZ_HARD : QUIZ_MED;
  qs2.forEach((q,i)=>{
    if(S.quiz.answers[i] !== undefined && S.quiz.answers[i] !== q.a){
      const obj = list.find(x=>x.id===q.t);
      weak.push({pillar: obj ? obj.pillar : null,
        text:"Quiz Q" + (i+1) + " (maps to " + q.t + (obj ? " · " + obj.title : "") + ") was missed. Re-read that work order's teaching note."});
    }
  });
  return weak;
}

function computeObjPct(){
  const list = woList();
  let sum = 0;
  list.forEach(o => {
    const w = woState(o.id);
    if(!w.passed) return;
    const base = w.attempts <= 1 ? 100 : w.attempts === 2 ? 70 : 40;
    const hintCost = S.mode === "hard" ? w.hint * 15 : w.hint * 5;
    sum += Math.max(40, base - hintCost);
  });
  return Math.round(sum / (list.length * 100) * 100);
}
function hintCostTotal(){
  const list = woList();
  return list.reduce((n,o)=>{ const w = woState(o.id); return n + (S.mode==="hard" ? w.hint*15 : w.hint*5); }, 0);
}
function computeStars(){
  const objPct = computeObjPct();
  const quizPct = S.quiz.scorePct;
  let stars = objPct >= 85 ? 3 : objPct >= 60 ? 2 : 1;
  if(quizPct >= 80) stars += 1;
  if(hintCostTotal() <= 10) stars += 1;
  return Math.max(1, Math.min(5, stars));
}

/* ---------- manifest (C7) ---------- */
function renderManifest(){
  const list = woList();
  const allDone = list.every(o => woState(o.id).passed);
  const stars = computeStars();
  const objPct = computeObjPct();
  const starHtml = "★★★★★".split("").map((s,i)=>'<span'+(i<stars?'':' class="dim"')+'>'+s+'</span>').join("");
  $("#manifest-stars").innerHTML = starHtml;
  $("#manifest-stars").setAttribute("aria-label", stars + " of 5 stars");
  $("#manifest-score").textContent =
    "Work orders: " + list.filter(o=>woState(o.id).passed).length + "/" + list.length + " (" + objPct + "%)" +
    " · Quiz: " + (S.quiz.done ? S.quiz.correct + "/" + (S.mode==="hard"?QUIZ_HARD.length:QUIZ_MED.length) + " (" + S.quiz.scorePct + "%)" : "pending") +
    " · Hint cost: " + hintCostTotal() + " pts";
  const stamp = $("#manifest-stamp");
  if(allDone && S.quiz.done){
    stamp.textContent = "✔ Cleared for exit"; stamp.className = "stamp";
  } else {
    stamp.textContent = allDone ? "Shift in progress — quiz pending" : "Shift in progress";
    stamp.className = "stamp pending";
  }
  /* recap by pillar */
  const recap = $("#manifest-recap");
  recap.innerHTML = "";
  ["p1","p2","p3","p4"].forEach(p => {
    const items = list.filter(o=>o.pillar===p);
    const box = document.createElement("div");
    box.className = "m-pillar";
    box.innerHTML = '<h3><span class="pillar '+p+'">'+PILLAR_LABEL[p]+'</span></h3><ul>' +
      items.map(o=>{
        const w = woState(o.id);
        return '<li class="'+(w.passed?"done-l":"todo-l")+'">'+(w.passed?"✔ ":"◻ ")+esc(o.title)+'</li>';
      }).join("") + '</ul>';
    recap.appendChild(box);
  });
  /* R8: focus areas derived from THIS run's evidence — retries, hints, quiz misses — never generic filler */
  const weak = computeFocusAreas();
  const focusBox = $("#manifest-focus");
  if(weak.length){
    const pcount = {};
    weak.forEach(w2=>{ if(w2.pillar) pcount[w2.pillar] = (pcount[w2.pillar]||0) + 1; });
    const worst = Object.keys(pcount).sort((a,b)=>pcount[b]-pcount[a])[0];
    focusBox.innerHTML =
      '<h3>Focus areas — where to sharpen before the exam</h3><ul>' +
      weak.map(w2=>'<li>'+esc(w2.text)+'</li>').join("") +
      '</ul><p><b>Weakest pillar: '+PILLAR_LABEL[worst]+'</b> — '+pcount[worst]+' weak signal'+(pcount[worst]>1?'s':'')+
      ' there. Re-run that pillar\'s work orders and drills tomorrow; spaced repetition is what makes it stick.</p>';
  } else {
    focusBox.innerHTML =
      '<h3>Focus areas</h3><p>' + (S.quiz.done ?
      'Clean run — no weak spots recorded: every work order passed on the first check without hints, and the quiz had no misses. For retention, re-read the teaching notes of the mitigation work orders (P4 carries the most objectives in this lesson) tomorrow — spaced repetition beats cramming.' :
      'No weak spots recorded so far — this section fills in with your actual retries, hints and quiz misses as the shift progresses.') + '</p>';
  }

  $("#manifest-next").innerHTML =
    '<h3>Where to walk next</h3>' +
    '<p><b>N10-009 neighbors:</b> 3.1 Documentation (asset inventory, diagrams, SLAs) — the paperwork you just fixed; ' +
    '<b>3.3 Change management</b> — the request process behind every maintenance window and rollback plan you scheduled; ' +
    '<b>3.4 Configuration management</b> — baselines and golden configs that make rollbacks real. ' +
    'After that, Domain 4.0 (Network Security) turns lifecycle hygiene into attack-surface reduction: EOS devices are exactly the boxes attackers hunt.</p>' +
    '<p>Try reading one real vendor EOL bulletin this week and finding: end-of-sale date, end-of-support date, and the migration path.</p>';
}
