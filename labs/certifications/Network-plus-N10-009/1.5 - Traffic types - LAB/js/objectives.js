/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Work-order validation engine, hints, meter, stars, completion certificate.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

function renderCharts(el, dataset, title){
  const vms=Object.keys(dataset);
  el.innerHTML=vms.map(vm=>{
    const d=dataset[vm]; const W=240,H=110,base=100,max=1400;
    const bw=9,gap=14;
    const bars=d.bcast.map((v,i)=>{
      const h=Math.max(1,Math.round(v/max*(base-8)));
      return `<rect x="${10+i*23}" y="${base-h}" width="${bw}" height="${h}" fill="var(--brass)"><title>min ${i+1}: ${v} pps broadcast</title></rect>`+
             `<rect x="${10+i*23+bw+2}" y="${base-Math.max(1,Math.round(d.mcast[i]/max*(base-8)))}" width="5" height="${Math.max(1,Math.round(d.mcast[i]/max*(base-8)))}" fill="var(--blue)"><title>min ${i+1}: ${d.mcast[i]} pps multicast</title></rect>`+
             `<text x="${10+i*23+7}" y="${base+9}" text-anchor="middle" style="font-size:6px;fill:var(--ink2)">${i+1}</text>`;
    }).join("");
    const peak=Math.max(...d.bcast);
    return `<div class="mchart"><h4>${esc(title||"")} ${vm.replace("VLAN","VLAN ")} · peak bcast ${peak} pps</h4>
      <svg class="meterSVG" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title||"")} ${vm}: broadcast bars, peak ${peak} packets per second">${bars}</svg>
      <div class="legend"><span><i style="background:var(--brass)"></i>broadcast pps</span><span><i style="background:var(--blue)"></i>multicast pps</span></div></div>`;
  }).join("");
}
function runWindow(){
  const hard=state.mode==="hard";
  const dataset=hard ? (state.noc.hardApplied ? NOC_CLEAN : NOC_HARD) : NOC_MEDIUM;
  state.noc.runs[hard?"hard":"medium"]=hard ? (state.noc.hardApplied?"clean":"dirty") : true;
  renderCharts($("#meterCharts"),dataset,hard?(state.noc.hardApplied?"POST-RUNBOOK":""):"");
  save(); updateMeter();
  announce("Window run. "+(hard&&state.noc.hardApplied?"Counters normalized.":"Read the three charts."));
}
function testH4(){
  const thr=parseInt(state.bench.h4thr,10), win=parseInt(state.bench.h4win,10);
  state.bench.h4Tested=true;
  const el=$("#h4Matrix");
  if(isNaN(thr)||isNaN(win)){ el.innerHTML=`<span style="color:var(--red)">Pick both a threshold and a window, then test.</span>`; save(); return; }
  const alert=day=>{ let run=0; for(const v of NOC_DAYS[day].VLAN10.bcast){ run=v>thr?run+1:0; if(run>=win) return true; } return false; };
  const rows=[["Day A (storm)","page","YES"],["Day B (WoL batch)","no page","NO"],["Day C (quiet)","no page","NO"]];
  el.innerHTML=`<table class="tbl">${rows.map(r=>{
    const got=alert(r[0].slice(5,6))?"PAGES":"silent";
    const good=(r[0].startsWith("Day A")&&got==="PAGES")||(!r[0].startsWith("Day A")&&got==="silent");
    return `<tr><td>${r[0]}</td><td>wanted: ${r[1]}</td><td style="color:${good?"var(--moss)":"var(--red)"}">${got}</td></tr>`; }).join("")}</table>
    <p style="font-size:.8rem;color:var(--ink2)">Threshold ${thr} pps · window ${win} min. CHECK work order H4 when all three rows behave.</p>`;
  save();
}

/* ---------- bench ---------- */
function renderOrders(){
  const m=state.mode; if(!m) { $("#ordersList").innerHTML=""; $("#ordersList2").innerHTML=""; return; }
  const defs=OBJS_OF(m); const st=state.objs[m];
  const card=o=>{
    const s=st[o.id]||{done:false,attempts:0,hints:0,firstTry:false};
    const hintLabel = m==="medium" ? (s.hints<3?`Hint ${s.hints+1}/3`:"All hints shown") : (s.hints===0?"Spend the nudge (−score)":"Nudge spent");
    return `<div class="order ${s.done?"done":""}" data-obj="${o.id}">
      <div class="oid"><span class="pill ${o.pillar.toLowerCase().replace("p","p")}">${o.pillar} · ${o.pillar==="P1"?"UNDERSTAND":o.pillar==="P2"?"RECOGNIZE":o.pillar==="P3"?"DETECT":"MITIGATE"}</span><span>${o.id}</span>${s.done?`<span class="done-stamp">DONE</span>`:""}</div>
      <div class="ot">${esc(o.title)}</div>
      ${m==="medium"&&!s.done?`<div style="font-size:.76rem;color:var(--ink2);margin-bottom:.35rem">👀 ${esc(o.where)}</div>`:""}
      <div class="orow">
        ${!s.done?`<button class="obtn" data-hint="${o.id}" ${((m==="medium"&&s.hints>=3)||(m==="hard"&&s.hints>0))?"disabled":""}>${hintLabel}</button>`:""}
        ${!s.done?`<button class="obtn primary" data-check="${o.id}">✔ Check</button>`:""}
      </div>
      <div class="ofeed" data-feed="${o.id}" style="display:${s.fb?"block":"none"}">${s.fb?esc(s.fb):""}</div>
    </div>`;
  };
  const html=defs.map(card).join("");
  $("#ordersList").innerHTML=html; $("#ordersList2").innerHTML=html;
  $$("[data-check]").forEach(b=>b.addEventListener("click",()=>checkObj(b.dataset.check)));
  $$("[data-hint]").forEach(b=>b.addEventListener("click",()=>giveHint(b.dataset.hint)));
  syncRail(); updateMeter();
}
function checkObj(id){
  const m=state.mode; const def=OBJ_DEFS.find(o=>o.id===id); if(!def||!m) return;
  const st=state.objs[m]; const s=st[id]||{done:false,attempts:0,hints:0,firstTry:false};
  if(s.done) return;
  let res={}; try{ res=def.validate(state)||{}; }catch(e){ res={pass:false,fail:"Validator error — check the console."}; }
  if(res.pass){
    s.done=true; s.firstTry=(s.attempts===0&&s.hints===0); s.fb=res.ok||"Objective complete.";
  } else {
    s.attempts=(s.attempts||0)+1; s.fb=res.fail||"Not yet — try again.";
  }
  st[id]=s; save(); renderOrders();
  announce((res.pass?"Objective "+id+" complete. ":"Check failed for "+id+". ")+(res.pass?res.ok:res.fail));
  if(res.pass) maybeCert();
}
function giveHint(id){
  const m=state.mode; const def=OBJ_DEFS.find(o=>o.id===id); if(!def||!m) return;
  const st=state.objs[m]; const s=st[id]||{done:false,attempts:0,hints:0,firstTry:false};
  if(s.done) return;
  if(m==="medium"){
    const lvl=Math.min(s.hints,def.hints.length-1);
    s.hints=(s.hints||0)+1;
    const feed=$(`[data-feed="${id}"]`); // shows in both copies; set state then rerender
    s.fb=`💡 Hint ${s.hints}: ${def.hints[Math.min(lvl,def.hints.length-1)]}`;
    st[id]=s; save(); renderOrders();
    announce("Hint revealed for "+id+".");
  } else {
    if((s.hints||0)>0) return;
    s.hints=1; s.fb=`🌙 Nudge spent (score cost visible in your certificate): ${def.hints[0]}`;
    st[id]=s; save(); renderOrders();
    announce("Nudge spent for "+id+".");
  }
}

/* ---------- meter (progress) ---------- */
function updateMeter(){
  const m=state.mode; if(!m) return;
  const defs=OBJS_OF(m); const st=state.objs[m];
  const done=defs.filter(o=>st[o.id]&&st[o.id].done).length;
  const bank=QUIZ[m]; const answered=Object.keys(state.quiz[m].answers).filter(k=>state.quiz[m].answers[k]!==undefined).length;
  $("#meterLabel").textContent=`WORK ORDERS ${done}/${defs.length} · QUIZ ${answered}/${bank.length}`;
  const bar=$("#meterBar"); const pct=Math.round(done/defs.length*100);
  bar.firstElementChild.style.width=pct+"%"; bar.setAttribute("aria-valuenow",String(pct));
  $("#orderMeter").textContent=`${done}/${defs.length}`;
  $("#drawerCount").textContent=`${done}/${defs.length}`;
  const cb=$("#certBtn");
  if(cb) cb.hidden=!(done===defs.length && state.quiz[m].submitted);
}

/* ---------- certificate ---------- */
function starCalc(){
  const m=state.mode; const defs=OBJS_OF(m); const st=state.objs[m];
  let ft=0,h=0,total=defs.length;
  defs.forEach(o=>{ const s=st[o.id]; if(s&&s.done){ if(s.firstTry) ft++; } if(s&&s.hints>0) h++; });
  const objScore=0.65*(ft/total)+0.35*(1-h/total);
  const acc=(state.quiz[m].score??0)/QUIZ[m].length;
  const overall=0.75*objScore+0.25*acc;
  const stars=Math.max(1,Math.min(5,Math.round(1+4*overall)));
  return {stars,ft,h,acc,objScore,overall};
}
function maybeCert(){
  const m=state.mode; if(!m) return;
  const defs=OBJS_OF(m); const st=state.objs[m];
  const allDone=defs.every(o=>st[o.id]&&st[o.id].done);
  const quizDone=state.quiz[m].submitted;
  // per-shift auto-open: finishing either shift presents its own report once
  if(allDone&&quizDone&&!state.seen.certSeen[m]){ state.seen.certSeen[m]=true; save(); openCert(); }
}
function openCert(){
  const m=state.mode; if(!m) return;
  const defs=OBJS_OF(m); const st=state.objs[m];
  const done=defs.filter(o=>st[o.id]&&st[o.id].done).length;
  const c=starCalc();
  $("#certSub").innerHTML=`${m==="hard"?"Night":"Day"} shift — ${done}/${defs.length} work orders stamped · quiz ${state.quiz[m].score}/${QUIZ[m].length}`;
  $("#certStars").innerHTML=[1,2,3,4,5].map(i=>`<span class="${i<=c.stars?"":"off"}" aria-hidden="true">⭐</span>`).join("")+
    `<span class="sr-only">${c.stars} of 5 stars</span>`;
  const byPillar=["P1","P2","P3","P4"].map(p=>{
    const ds=defs.filter(o=>o.pillar===p); const d=ds.filter(o=>st[o.id]&&st[o.id].done).length;
    return `<span class="pill ${p.toLowerCase().replace("p","p")}">${p} ${d}/${ds.length}</span>`;
  }).join(" ");
  $("#certPillars").innerHTML=`<p style="margin:.5rem 0 .2rem"><b>Objective recap by pillar:</b></p><p>${byPillar}</p>`;
  $("#certTable").innerHTML=`
    <tr><td>First-attempt accuracy</td><td>${c.ft}/${defs.length} work orders</td></tr>
    <tr><td>Hint / nudge usage</td><td>${c.h} of ${defs.length} work orders</td></tr>
    <tr><td>Quiz accuracy</td><td>${state.quiz[m].score}/${QUIZ[m].length}</td></tr>
    <tr><td>Rating basis</td><td>70% first-try &amp; hint economy · 30% quiz</td></tr>`;
  // R8: focus areas derived from THIS student's evidence — extra check attempts,
  // spent hints, and wrong quiz answers — each with an actionable next step.
  const focus=[];
  defs.forEach(o=>{
    const s=st[o.id]; if(!s) return;
    const topic=OBJ_TOPICS[o.id]||o.title;
    if(s.attempts>0) focus.push(`<b>${esc(topic)}</b> — needed ${s.attempts+1} check${(s.attempts+1)>1?"s":""} before it stamped. Re-do it from scratch and say the rule out loud.`);
    else if(s.hints>0) focus.push(`<b>${esc(topic)}</b> — solved only after a ${m==="hard"?"nudge":"hint"}. Re-run that station without hints.`);
  });
  QUIZ[m].forEach((item,i)=>{
    if(state.quiz[m].answers[i]!==item.correct)
      focus.push(`<b>${esc(item.topic)}</b> — quiz Q${i+1} was answered wrong. Re-read the matching panel in the knowledge core, then re-test yourself.`);
  });
  $("#certFocus").innerHTML = focus.length
    ? `<p style="margin:.6rem 0 .2rem"><b>Focus before exam day</b> (from your own attempts):</p><ul class="tight" style="font-size:.86rem">${focus.map(f=>`<li>${f}</li>`).join("")}</ul>`
    : `<p style="margin:.6rem 0 .2rem"><b>Focus before exam day:</b> none flagged — every work order stamped first try and the sheet was clean. Do one full pass of the reference shelf as spaced review.</p>`;
  $("#certNext").innerHTML=`<b>What to learn next:</b> the rest of objective 1.4 (protocol/port table, IP types: ICMP/TCP/UDP/GRE/IPsec), then 1.7 “IPv4 network addressing”, then 2.1 “routing technologies” — plus N10-009 domain weights: Networking Concepts 23%, Implementation 20%, Operations 19%, Security 14%, Troubleshooting 24%.`;
  $("#certModal").hidden=false; $("#certClose").focus();
}
