/* ══════════════════════════════════════════════════════════════════════
   js/bays.js — operations-floor environment logic: phase-order widget,
   defect queue, Bay 01 finders (scan console, IPAM, CSPM, source
   review, profile drill), Bay 02 triage (ranking, chain, statements),
   Bay 03 work orders, Bay 04 return-to-service gate + endings ledger.
   Load order: 6th.
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ RENDER: phase order widget ══════════════ */
function renderOrder(){ const w=$("orderWidget"); w.innerHTML="";
  S.phaseOrder.forEach((name,i)=>{ const row=document.createElement("div"); row.className="order-row";
    row.innerHTML='<span class="ord-num">'+(i+1)+'</span><span class="ord-name">'+esc(name)+'</span>';
    const btns=document.createElement("div"); btns.className="order-btns";
    const up=document.createElement("button"); up.textContent="↑"; up.setAttribute("aria-label","Move "+name+" up"); up.disabled=i===0;
    const dn=document.createElement("button"); dn.textContent="↓"; dn.setAttribute("aria-label","Move "+name+" down"); dn.disabled=i===S.phaseOrder.length-1;
    up.addEventListener("click",()=>{ [S.phaseOrder[i-1],S.phaseOrder[i]]=[S.phaseOrder[i],S.phaseOrder[i-1]]; S.phaseOrderOK=false; renderOrder(); checkOrder(); save(); });
    dn.addEventListener("click",()=>{ [S.phaseOrder[i+1],S.phaseOrder[i]]=[S.phaseOrder[i],S.phaseOrder[i+1]]; S.phaseOrderOK=false; renderOrder(); checkOrder(); save(); });
    btns.append(up,dn); row.append(btns); w.append(row); }); }
function checkOrder(){ if(S.phaseOrder.join()===PHASES_OK.join()){ S.phaseOrderOK=true;
  $("orderMsg").textContent="✓ Correct cycle: Identify → Prioritize → Remediate → Validate — then it repeats."; $("orderMsg").style.color="var(--ok)"; autoCheck(); }
  else { $("orderMsg").textContent="Not yet — what must exist before you can rank it?"; $("orderMsg").style.color="var(--med)"; } }

/* ══════════════ RENDER: defect queue ══════════════ */
function findingState(f){ const v=S.validated[f];
  if(v==="closed") return ["VALIDATED — CLOSED","st-validated","c-ok"];
  if(v==="fp") return ["FALSE POSITIVE — CLOSED","st-fp",""];
  if(v==="deferred") return ["DEFERRED — EXCEPTION OPEN","st-deferred","c-teal"];
  if(f==="F6") return S.scans["int-c"]?["GATE PENDING — EVIDENCE READY","","c-med"]:["DISCOVERED — VERIFY FIRST","","c-med"];
  if(S.wo[f]) return ["WORK ORDER — "+S.wo[f].toUpperCase(),"","c-amber"];
  return ["DISCOVERED — UNTRIAGED","",""]; }
function renderQueue(){ const list=$("queueList"); list.innerHTML="";
  const ids=ALL_FINDINGS.filter(f=>S.discovered[f]);
  const open=ids.filter(f=>!["closed","fp"].includes(S.validated[f]||"")).length;
  $("queueCount").textContent=ids.length+" reports · "+open+" open";
  $("queueEmpty").classList.toggle("hidden",ids.length>0);
  ids.forEach(f=>{ const d=FINDINGS[f]; const [st,cls,chipCls]=findingState(f);
    const card=document.createElement("div"); card.className="dq "+(cls||("s-"+d.sev));
    card.innerHTML='<div class="dq-top"><span class="dq-id">'+f+' · '+esc(d.vid)+'</span><span class="chip '+chipCls+'">'+st+'</span></div>'+
      '<div class="dq-asset">'+esc(d.asset)+' — CVSS '+d.score.toFixed(1)+' '+d.sev.toUpperCase()+'</div>'+
      '<div class="dq-title">'+esc(d.title)+'</div>'+
      '<div class="dq-chips">'+d.chips.map(c=>'<span class="chip '+c[0]+'">'+c[1]+'</span>').join("")+'</div>'+
      '<div class="mono" style="font-size:10.5px;color:var(--dim)">'+esc(d.vector)+' · '+esc(d.facts)+'</div>'+
      '<div class="dq-state">'+st+'</div>';
    list.append(card); }); }

/* ══════════════ BAY 01: scan console ══════════════ */
function scanProfile(){ const scope=$("scanScope").value==="external"?"ext":"int";
  return scope+"-"+($("scanCred").value==="cred"?"c":"nc")+($("scanIntr").value==="intr"?"-intr":""); }
function updateScanHint(){ $("scanHint").textContent="profile: "+$("scanScope").value+" · "+$("scanCred").value+" · "+($("scanIntr").value==="intr"?"intrusive":"safe checks"); }
function runScan(){ const prof=scanProfile(); const log=$("scanLog");
  log.innerHTML="";
  if(prof==="ext-nc"||prof==="ext-c"){
    const r=SCAN_RESULTS[prof]; r.lines.forEach(l=>logLine(log,l)); r.finds.forEach(f=>discover(f));
    S.scans["ext-nc"]=true; if(prof==="ext-c") logLine(log,"[info] credentialed external — same view; treated as ext-nc");
  } else if(prof==="int-nc"||prof==="int-nc-intr"||prof==="int-c"||prof==="int-c-intr"){
    const cred=prof.startsWith("int-c"); const key=cred?"int-c":"int-nc";
    const r=SCAN_RESULTS[key]; r.lines.forEach(l=>logLine(log,l)); r.finds.forEach(f=>discover(f));
    S.scans[key]=true;
    if(prof.endsWith("-intr")){ S.crashLesson=true;
      logLine(log,"<span class='lg-err'>[crash] MR-105 legacy-linx — fragile file service crashed under intrusive checks.</span>");
      logLine(log,"<span class='lg-warn'>[lesson] Fragile devices get SAFE checks — not exclusion, not crashes. Re-run non-intrusive; the host reboots fine.</span>");
      logLine(log,"$ Legacy host recovered by ops. Findings above remain valid.");
    }
  }
  logLine(log,"$ Defect Queue updated.");
  renderQueue(); renderWo(); autoCheck(); save(); }

function discover(f){ if(!S.discovered[f]){ S.discovered[f]=true; } }

function renderIpam(){ const tb=$("ipamBody"); tb.innerHTML="";
  IPAM_ROWS.forEach(r=>{ const tr=document.createElement("tr");
    const rogueFound=r.rogue&&S.ipamReconciled&&!S.ipamAdded;
    const rogueDone=r.rogue&&S.ipamAdded;
    tr.className=(r.rogue&&(rogueFound))?"rogue":((r.rogue&&rogueDone)?"":"covered");
    tr.innerHTML='<td>'+r.ip+'</td><td>'+(rogueDone?"shadow-backup (forgotten backup server)":esc(r.name))+'</td>'+
      '<td>'+((r.scope||rogueDone)?"<span class='chip c-ok'>IN SCOPE</span>":"<span class='chip'>NOT SCANNED</span>")+'</td>'+
      '<td>'+(r.rogue?(rogueFound?"<span class='chip c-med'>UNREGISTERED</span>":(rogueDone?"<span class='chip c-ok'>REGISTERED · CLEAN</span>":"<span class='chip'>?</span>")):"<span class='chip c-teal'>CMDB MATCH</span>")+'</td>';
    tb.append(tr); }); }

function reconcileIpam(){ S.ipamReconciled=true; const log=$("ipamLog"); log.classList.remove("hidden"); log.innerHTML="";
  logLine(log,"$ reconcile: registered hosts vs scan coverage…");
  logLine(log,"<span class='lg-warn'>[gap] 10.20.7.44 — present in IPAM/ARP, absent from CMDB and every scan scope.</span>");
  logLine(log,"<span class='lg-info'>[rule] An unknown host enters scan scope BEFORE any other decision — you can't triage what you never scan.</span>");
  $("ipamAdd").classList.remove("hidden"); renderIpam(); autoCheck(); save(); }
function addRogue(){ S.ipamAdded=true; const log=$("ipamLog");
  logLine(log,"$ scanning 10.20.7.44 … clean. Registered as 'shadow-backup' — a forgotten backup server, now in scope and in the CMDB.");
  renderIpam(); renderQueue(); autoCheck(); save(); toast("10.20.7.44 registered — scope gap closed."); }

function runCspm(){ S.cspmRun=true; discover("F11"); discover("F12");
  const log=$("cspmLog"); log.classList.remove("hidden"); log.innerHTML="";
  logLine(log,"$ CSPM posture check — account meridian-cloud-prod (read-only provider APIs)…");
  logLine(log,"<span class='lg-err'>[CSPM-003] storage bucket mr-passenger-docs: PUBLIC ACL — passenger documents internet-readable.</span>");
  logLine(log,"<span class='lg-warn'>[CSPM-004] cloud audit logging: DISABLED — no trail of who did what.</span>");
  logLine(log,"$ Host scanners can never see this layer. Two findings appended.");
  renderQueue(); renderWo(); autoCheck(); save(); }

function renderCode(){ const box=$("codeLines"); box.innerHTML="";
  CODE_LINES.forEach(l=>{ const b=document.createElement("button"); b.className="code-line"; b.type="button";
    if(S.codeCorrect&&l.pick==="right") b.classList.add("correct");
    b.innerHTML='<span class="ln">'+l.n+'</span><span>'+esc(l.t)+'</span>';
    b.addEventListener("click",()=>pickLine(l)); box.append(b); }); }
function pickLine(l){ const m=$("codeMsg");
  if(l.pick==="right"){ S.codeCorrect=true; discover("F3"); renderQueue(); renderWo();
    m.textContent="✓ Line "+l.n+": the authorization check that should exist — and doesn't. Logic flaw: any caller can export any crew member's schedule (missing authorization). No scanner finds an absent gate; only review does."; m.style.color="var(--ok)"; renderCode(); autoCheck(); }
  else{ S.codeCorrect=false; m.textContent="Line "+l.n+" is "+(l.n===7?"input validation — it checks a parameter exists, not WHO is asking.":"legitimate logic. Look for what is MISSING — who is allowed to call this?"); m.style.color="var(--med)"; }
  save(); }

/* scan-profile drill */
function bindPlan(){ ["planA","planB","planC"].forEach(k=>{ $("scanPlan"+k.slice(4)).addEventListener("change",()=>{ 
  S["plan"+k.slice(4)]=$("scanPlan"+k.slice(4)).value; planFeedback(); save(); }); }); }
function planFeedback(){ const m=$("planMsg"); const set=S.planA&&S.planB&&S.planC;
  if(!set){ m.textContent=""; return; }
  if(CHECKS.M2()){ m.textContent="✓ A credentialed (patch truth) · B external (attacker's view) · C safe checks — fragile devices get safety, not exclusion."; m.style.color="var(--ok)"; }
  else{ const why=[]; if(S.planA!=="cred") why.push("A needs to READ patch levels → credentialed"); if(S.planB!=="ext") why.push("B is the outside attacker's view → external"); if(S.planC!=="safe") why.push("C must not crash a fragile service → safe, never exclusion"); m.textContent="✗ "+why.join(" · "); m.style.color="var(--med)"; }
  autoCheck(); }

/* ══════════════ BAY 02: ranking ══════════════ */
function renderRank(){ renderRankList("rankM",S.rankM,(i)=>{ [S.rankM[i-1],S.rankM[i]]=[S.rankM[i],S.rankM[i-1]]; },{down:(i)=>{ [S.rankM[i+1],S.rankM[i]]=[S.rankM[i],S.rankM[i+1]]; }});
  renderRankList("rankH",S.rankH,null,null); }
function renderRankList(cid,arr,unused1,unused2){ const box=$(cid); box.innerHTML="";
  arr.forEach((f,i)=>{ const d=FINDINGS[f]; const item=document.createElement("div"); item.className="rank-item";
    item.innerHTML='<span class="rk-pos">'+(i+1)+'</span><div class="rk-body">'+
      '<span class="rk-name">'+f+' · '+esc(d.asset)+' — CVSS '+d.score.toFixed(1)+' '+d.sev.toUpperCase()+'</span>'+
      '<span class="rk-sub">'+esc(d.facts)+'</span>'+
      '<span class="rk-facts">'+d.chips.map(c=>'<span class="chip '+c[0]+'">'+c[1]+'</span>').join("")+'</span></div>';
    const btns=document.createElement("div"); btns.className="order-btns";
    const up=document.createElement("button"); up.textContent="↑"; up.disabled=i===0; up.setAttribute("aria-label","Move "+f+" up");
    const dn=document.createElement("button"); dn.textContent="↓"; dn.disabled=i===arr.length-1; dn.setAttribute("aria-label","Move "+f+" down");
    up.addEventListener("click",()=>{ [arr[i-1],arr[i]]=[arr[i],arr[i-1]]; renderRankList(cid,arr); save(); });
    dn.addEventListener("click",()=>{ [arr[i+1],arr[i]]=[arr[i],arr[i+1]]; renderRankList(cid,arr); save(); });
    btns.append(up,dn); item.append(btns); box.append(item); }); }

function renderChain(){ const box=$("chainBox"); box.innerHTML="";
  CHAIN_OPTS.forEach(f=>{ const d=FINDINGS[f]; const row=document.createElement("label"); row.className="q-opt";
    const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=S.chain.includes(f);
    cb.addEventListener("change",()=>{ if(cb.checked){ if(!S.chain.includes(f)) S.chain.push(f); } else S.chain=S.chain.filter(x=>x!==f);
      $("chainMsg").textContent = S.chain.length===2 ? "Two selected — run the H6 check when ready." : (S.chain.length>2?"Too many — exactly two findings break the chain.":"");
      save(); });
    row.append(cb); const sp=document.createElement("span"); sp.innerHTML='<b class="mono">'+f+'</b> — '+esc(d.facts); row.append(sp); box.append(row); }); }

/* ══════════════ BAY 03: work orders ══════════════ */
function renderWo(){ const box=$("woList"); box.innerHTML="";
  const ids=ALL_FINDINGS.filter(f=>S.discovered[f]&&f!=="F6");
  const hard=S.mode==="hard";
  $("woSub").textContent=hard
    ?"CAB approved FOUR emergency slots tonight. Emergency = exploited, exposed or PCI-reachable. Everything fixable rides the standard window; MR-105 gets the exception path."
    :"One correct action per defect. The dropdown tells you what is possible; the queue tells you what it is.";
  if(!ids.length){ box.innerHTML='<p style="color:var(--dim);font-size:13px">No discovered findings yet — the work-order bay fills as Bay 01 finds things.</p>'; return; }
  ids.forEach(f=>{ const d=FINDINGS[f]; const row=document.createElement("div"); row.className="wo-row";
    row.innerHTML='<div><div class="wo-name">'+f+' · '+esc(d.asset)+' — '+d.score.toFixed(1)+' '+d.sev.toUpperCase()+'</div><div class="wo-sub">'+esc(d.title)+'</div></div>';
    const sel=document.createElement("select"); sel.setAttribute("aria-label","Action for "+f);
    WO_OPTIONS.forEach(([v,label])=>{ const o=document.createElement("option"); o.value=v; o.textContent=label; sel.append(o); });
    sel.value=S.wo[f]||"";
    sel.addEventListener("change",()=>{ S.wo[f]=sel.value; renderQueue(); renderLedger(); autoCheck(); save(); });
    row.append(sel); box.append(row); });
  $("excForm").classList.toggle("hidden",!S.discovered.F5);
  $("wafF1").disabled=!S.discovered.F1; }

/* ══════════════ BAY 04: return to service ══════════════ */
function runRts(){ const R=S.rts; R.ran=true; R.sweeps++;
  const log=$("rtsSummary"); log.classList.remove("hidden"); log.innerHTML="";
  logLine(log,"$ re-inspection sweep — method matched to discovery: rescan · posture re-check · re-review");
  // gate evidence panels — revealed whenever their trigger exists
  if(S.wo.F7==="patch"&&!S.rts.reboot107){ $("dec107Panel").classList.remove("hidden");
      $("ev107").textContent="MR-107 dc-dns — credentialed re-inspection:\n  KB (patch MER-2025-034): INSTALLED 14:02 today\n  SMB service: RUNNING — started 6 days ago\n  Rescan: flaw still present.\n→ Installed ≠ running. The vulnerable process was never replaced."; }
    // F6 evidence
    if(S.discovered.F6){ $("dec106Panel").classList.remove("hidden");
      $("ev106").textContent=S.scans["int-c"]
        ?"MR-106 mail-relay — evidence comparison:\n  banner (non-credentialed): reports vulnerable OpenSSL version string\n  credentialed patch-level query: distro BACKPORTED the fix; no vulnerable code present\n→ Banner evidence ≠ patch truth. This is a false positive with proof attached."
        :"MR-106 mail-relay — evidence: banner-only (no credentialed check has run). You cannot call it an FP without patch-level proof — run the internal credentialed scan first."; }
    // sanity trap
    $("decSanityPanel").classList.remove("hidden");
    $("evSanity").textContent="Sweep coverage: 11 assets in scope · 10 responded · 1 did NOT respond:\n  MR-109 hr-fileserver — no response (silent since ~02:00).\nOpen findings that could NOT be re-verified because their host was dark: 1 (F9 on MR-109).\n→ A drop in findings must be checked against a stable asset count — a silent host mimics a fix.";
  // validate each remediated finding
  const outcomes=[];
  ALL_FINDINGS.filter(f=>S.discovered[f]).forEach(f=>{
    if(f==="F6") return; // decided at the gate
    if(f==="F5"){ if(S.wo.F5==="exception"&&S.exc.isolate&&S.exc.owner&&S.exc.review&&S.exc.review!=="none"){ S.validated.F5="deferred"; outcomes.push("F5 legacy-linx → DEFERRED: isolated, exception open until review date. Deferral is a managed ending, not a fix."); }
      else outcomes.push("F5 legacy-linx → still open: exception incomplete (isolation + owner + review date)."); return; }
    if(f==="F7"){ if(S.wo.F7==="patch"&&R.reboot107){ S.validated.F7="closed"; outcomes.push("F7 dc-dns → VALIDATED CLOSED: patch live, service restarted, rescan clean."); }
      else if(S.wo.F7==="patch") outcomes.push("F7 dc-dns → still open: patch installed but service not restarted (see gate).");
      else if(S.wo.F7==="schedule") outcomes.push("F7 dc-dns → scheduled (standard window) — not due for re-inspection tonight.");
      else outcomes.push("F7 dc-dns → no work order yet."); return; }
    const need={F1:"patch",F2:"patch",F3:"codefix",F4:"imagefix",F8:"firmware",F9:"schedule",F11:"config",F12:"config"}[f];
    if(S.wo[f]===need&&need!=="schedule"){ S.validated[f]="closed"; outcomes.push(f+" "+FINDINGS[f].asset+" → VALIDATED CLOSED (re-inspection clean)."); }
    else if(f==="F1"&&S.wafF1&&S.wo.F1!=="patch"){ outcomes.push("F1 booking-web → STILL OPEN: WAF virtual patch mitigates but does not remediate — the vulnerable code is still on the host."); }
    else if(S.wo[f]==="schedule"){ outcomes.push(f+" "+FINDINGS[f].asset+" → scheduled (standard window) — not due tonight."); }
    else outcomes.push(f+" "+FINDINGS[f].asset+" → still open — no work order (or wrong action).");
  });
  if(!outcomes.length) outcomes.push("Nothing remediated yet — assign work orders in Bay 03, then sweep again.");
  outcomes.forEach(o=>logLine(log,"$ "+o));
  if(S.discovered.F6&&S.scans["int-c"]&&!S.validated.F6) logLine(log,"$ MR-106: credentialed evidence ready — record the FP decision at the gate.");
  renderLedger(); renderQueue(); autoCheck(); save(); }

function decide107(){ const v=$("dec107").value; const m=$("msg107"); if(!v){ m.textContent="Pick a decision first."; m.style.color="var(--med)"; return; }
  S.rts.dec107=v;
  if(v==="reboot"){ S.rts.reboot107=true; m.textContent="✓ Service restarting… re-run the sweep — the rescan must PROVE it, not assume it."; m.style.color="var(--ok)"; }
  else if(v==="vendor"){ m.textContent="✗ Re-read the evidence: the patch IS installed — the vulnerable process just never restarted. Vendor won't help here."; m.style.color="var(--err)"; S.validated.F7="open"; }
  else{ m.textContent="✗ The credentialed evidence shows the patch is installed and flawed code was present — that's a true positive pending restart, not an FP."; m.style.color="var(--err)"; S.validated.F7="open"; }
  renderLedger(); save(); }
function decide106(){ const v=$("dec106").value; const m=$("msg106"); if(!v){ m.textContent="Pick a decision first."; m.style.color="var(--med)"; return; }
  S.rts.dec106=v;
  if(v==="fp"&&S.scans["int-c"]){ S.validated.F6="fp"; m.textContent="✓ Closed as FALSE POSITIVE with credentialed proof attached. Banner strings lie after backports — evidence beats version strings."; m.style.color="var(--ok)"; }
  else if(v==="fp"){ m.textContent="✗ No credentialed evidence yet — run the internal credentialed scan in Bay 01 first."; m.style.color="var(--err)"; }
  else if(v==="patch"){ m.textContent="✗ Patching a false positive is an unnecessary production change — verify first."; m.style.color="var(--err)"; }
  else{ m.textContent="✗ Accepting risk without evidence is neither mitigation nor validation."; m.style.color="var(--err)"; }
  renderLedger(); renderQueue(); autoCheck(); save(); }
function decideSanity(){ const v=$("decSanity").value; const m=$("msgSanity"); if(!v){ m.textContent="Pick a decision first."; m.style.color="var(--med)"; return; }
  S.rts.decSanity=v;
  if(v==="investigate"){ m.textContent="✓ Before trusting any findings-drop: locate MR-109. (It failed an update overnight and went dark — its open finding F9 was never re-verified.)"; m.style.color="var(--ok)"; $("mr109Back").classList.remove("hidden"); }
  else{ m.textContent="✗ Rejected — closing findings on a sweep where an asset went dark is how real fixes get missed. 9/11 responding is not a clean bill."; m.style.color="var(--err)"; }
  save(); }
function back109(){ S.rts.back109=true; const m=$("msgSanity");
  m.textContent+=" | MR-109 hr-fileserver back online — its finding F9 re-verified (still open, scheduled). Sweep now stable: 11/11. Any findings-drop must match a stable asset count.";
  renderLedger(); autoCheck(); save(); toast("MR-109 back in the sweep — coverage stable."); }

function renderLedger(){ const el=$("endingsLedger");
  const ids=ALL_FINDINGS.filter(f=>S.discovered[f]);
  if(!ids.length){ el.textContent="$ No re-inspection recorded yet."; return; }
  const st=f=>({closed:"VALIDATED CLOSED",fp:"FALSE POSITIVE — CLOSED",deferred:"DEFERRED — EXCEPTION OPEN"}[S.validated[f]]||(S.wo[f]==="schedule"?"SCHEDULED":(S.wo[f]?"WO SET — AWAITING SWEEP":"OPEN — UNTRIAGED")));
  el.innerHTML=ids.map(f=>"$ "+f+" "+FINDINGS[f].asset.padEnd(28).slice(0,28)+" → "+st(f)).join("\n"); }

function renderStmts(){ const box=$("stmtBox"); box.innerHTML="";
  STMTS.forEach((t,i)=>{ const row=document.createElement("label"); row.className="q-opt";
    const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=S.stmts.includes(i);
    cb.addEventListener("change",()=>{ if(cb.checked){ if(!S.stmts.includes(i)) S.stmts.push(i); } else S.stmts=S.stmts.filter(x=>x!==i); save(); });
    row.append(cb); const sp=document.createElement("span"); sp.textContent=t; row.append(sp); box.append(row); }); }
