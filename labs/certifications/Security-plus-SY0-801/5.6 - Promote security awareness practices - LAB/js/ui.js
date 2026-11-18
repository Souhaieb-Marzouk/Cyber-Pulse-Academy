/* ============================================================================
   UI — rendering helpers and screens: feedback/toast, views, glossary, modals
   (focus-trapping close paths: button, ESC any focus, click-outside, focus return),
   binder, docks 1–5, completion report with focus areas, debrief locker. */
function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2600);
}

function setMsg(el, ok, title, body){
  el.className="checkmsg "+(ok?"ok":"no");
  el.innerHTML="<b>"+(ok?"✓ Checked — "+title:"✗ Not yet — "+title)+"</b>"+body;
}

function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ---- check engine ---- */

function showView(v){
  if(!dockUnlocked(v)){
    toast("Dock "+v.replace("dock","")+" unlocks when the previous dock’s work orders are stamped.");
    return;
  }
  state.view=v;
  state.visitedDocks[v]=true;
  document.querySelectorAll("[data-panel]").forEach(p=>{
    p.classList.toggle("hidden", p.dataset.panel!==v && p.dataset.panel!=="tracker");
  });
  document.querySelectorAll("#docklist button").forEach(b=>{
    b.setAttribute("aria-current", b.dataset.view===v ? "true":"false");
    b.disabled = !dockUnlocked(b.dataset.view);
  });
  const note=document.getElementById("note-dynamic");
  const nt=nextTarget();
  if(state.mode==="medium" && nt && nt!==v){
    note.innerHTML="<b>Where to look next:</b> objective work remains at <b>"+({binder:"Binder",dock1:"Dock 01 · Evidence Intake",dock2:"Dock 02 · Yard Sweep",dock3:"Dock 03 · Campaign Studio",dock4:"Dock 04 · Training Yard",dock5:"Dock 05 · Metrics House",quiz:"The Inspection"})[nt]+"</b>.";
  } else if(doneCount()===activeObjs().length && !state.quiz.done){
    note.innerHTML="<b>All work orders stamped.</b> Head to <b>The Inspection</b> for the knowledge check.";
  } else if(doneCount()===activeObjs().length && state.quiz.done){
    note.innerHTML="<b>Ready to load out.</b> Use “Load out · finish” for your certificate, or review the Debrief Locker.";
  } else {
    note.innerHTML="<b>Note from the IT Director:</b> “The board wants evidence, not posters. Every dock you complete is something I can show the auditors.”";
  }
  const nav=document.getElementById("nav-"+v);
  if(nav && window.matchMedia("(max-width:680px)").matches){ nav.scrollIntoView({block:"nearest",inline:"nearest"}); }
  window.scrollTo({top:0,behavior:"smooth"});
  refreshTracker(); queueSave();
}

function pillarRecap(){
  const objs=activeObjs();
  const done=objs.filter(o=>state.objectives[o.id].done);
  const byP={P1:[],P2:[],P3:[],P4:[]};
  objs.forEach(o=>byP[o.pillar].push(o.id+(state.objectives[o.id].done?" ✓":" ✗")));
  return Object.keys(PILLARS).map(k=>'<div><b>'+k+' · '+PILLARS[k]+'</b>'+(byP[k].join(", ")||"—")+'</div>').join("");
}
/* QA fix (R8): focus areas derived from the student's actual performance evidence */

function focusAreasHtml(){
  const objs=activeObjs();
  const areas=[];
  const retried=objs.filter(o=>state.objectives[o.id].done&&!state.objectives[o.id].firstTry).map(o=>o.id);
  if(retried.length) areas.push("<b>Re-checked work orders: "+retried.join(", ")+"</b> — these needed more than one attempt. Re-run their docks without hints, then re-test yourself in the other mode.");
  const hinted=objs.filter(o=>state.objectives[o.id].hints>0).map(o=>o.id);
  if(hinted.length) areas.push("<b>Hint-supported work orders: "+hinted.join(", ")+"</b> — mastery there is not yet self-sufficient; redo them cold and compare.");
  const qs=state.mode==="hard"?QUIZ_HARD:QUIZ_MED;
  const wrongTopics=[...new Set(Object.keys(state.quiz.answers).filter(i=>state.quiz.answers[i]&&state.quiz.answers[i].pick!==qs[i].c).map(i=>qs[i].topic))];
  if(state.quiz.done&&wrongTopics.length) areas.push("<b>Knowledge-check topics: "+wrongTopics.join(" · ")+"</b> — re-read the matching Binder sections and retake the Inspection until these are clean.");
  if(!state.quiz.done) areas.push("<b>Inspection not taken</b> — the knowledge check is still open; it is the fastest way to expose theory gaps behind the hands-on wins.");
  if(!areas.length) areas.push("<b>Clean sweep</b> — every work order stamped first-attempt and the Inspection is correct. Move on to SY0-801 objectives 5.1–5.5, or re-run this lab in the other mode without hints.");
  return areas.map(a=>"<li>"+a+"</li>").join("");
}
/* QA fix (R7): one shared modal wiring — visible close button, ESC (any focus), click-outside, focus return */

function wireModal(modalBack, closeBtnSel, onClose){
  const prevFocus=document.activeElement;
  const close=()=>{ modalBack.remove(); document.removeEventListener("keydown",escH,true); if(prevFocus&&prevFocus.focus) prevFocus.focus(); if(onClose) onClose(); };
  const escH=e=>{ if(e.key==="Escape"){ e.stopPropagation(); close(); } };
  modalBack.querySelector(closeBtnSel).addEventListener("click",close);
  document.addEventListener("keydown",escH,true);
  modalBack.addEventListener("mousedown",e=>{ if(e.target===modalBack) close(); });
  modalBack.querySelector(closeBtnSel).focus();
  return close;
}

function openCompletion(){
  const total=activeObjs().length, done=doneCount();
  const stars=computeStars();
  const quizPct=state.quiz.done?Math.round(state.quiz.score/(state.mode==="hard"?QUIZ_HARD.length:QUIZ_MED.length)*100):null;
  const missList=activeObjs().filter(o=>{const st=state.objectives[o.id];return st.done&&!st.firstTry;}).map(o=>o.id);
  const modalBack=document.createElement("div");
  modalBack.className="modal-back";
  modalBack.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Certificate of loading">'+
    '<div class="hazard"></div>'+
    '<span class="tag green">Certificate of Loading · Harborline Freight Co.</span>'+
    '<h2 style="margin-top:.6rem">Program Year Complete</h2>'+
    '<p>'+done+' / '+total+' work orders stamped · mode: <b>'+(state.mode==="hard"?"Hard — solo night run":"Medium — guided day shift")+'</b></p>'+
    '<div class="starrow" aria-label="'+stars+' of 5 stars">'+[1,2,3,4,5].map(i=>'<span class="'+(i<=stars?"on":"off")+'">★</span>').join("")+'</div>'+
    '<p><b>Star math:</b> 5★ base · misses after first check: '+missList.length+(missList.length?' ('+missList.join(", ")+')':'')+' · hint points: '+(state.mode==="hard"?state.nudgesUsed+" nudge(s) ×2":state.hintsUsed)+' · each floor of 3 points −1★ · nudge used −1★.</p>'+
    (quizPct!==null? '<p><b>Inspection score:</b> '+state.quiz.score+' / '+(state.mode==="hard"?QUIZ_HARD.length:QUIZ_MED.length)+' ('+quizPct+'%)</p>' : '<p><b>Inspection:</b> not taken yet — the knowledge check is still open.</p>')+
    '<div class="recap-next" style="border-color:var(--orange)"><b style="letter-spacing:.06em;text-transform:uppercase;font-size:.8rem">Focus areas — from your run</b>'+
    '<ul style="margin:.45rem 0 0;padding-left:1.1rem">'+focusAreasHtml()+'</ul></div>'+
    '<div class="pillarrecap">'+pillarRecap()+'</div>'+
    '<div class="recap-next"><b>What this means:</b> you can now explain why attackers target the human layer, recognize phishing and social-engineering variants in raw evidence, triage anomalous behavior, and design, sequence and measure a real awareness program — the full scope of SY0-801 lesson 5.6.'+
    '<br><br><b>Next on the route:</b> SY0-801 5.1–5.5 (governance, risk, third-party, compliance, audits) · retake this lab in the other mode · try the MITRE technique pages in the Debrief Locker.</div>'+
    '<div style="display:flex;gap:.6rem;margin-top:1rem;flex-wrap:wrap"><button class="btn primary" id="modal-close" type="button">Back to the yard</button></div>'+
    '</div>';
  document.body.appendChild(modalBack);
  wireModal(modalBack,"#modal-close");
}

function openReset(){
  const modalBack=document.createElement("div");
  modalBack.className="modal-back";
  modalBack.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Confirm reset">'+
    '<div class="hazard"></div><h2>Reset the program?</h2>'+
    '<p>This clears your saved progress — mode, all stamped objectives, campaign config, quiz results and stars — and returns the yard to pristine state. This cannot be undone.</p>'+
    '<div style="display:flex;gap:.6rem;margin-top:1rem;flex-wrap:wrap"><button class="btn primary" id="reset-yes" type="button">Yes — reset everything</button><button class="btn ghost" id="reset-no" type="button">Keep my progress</button></div></div>';
  document.body.appendChild(modalBack);
  modalBack.querySelector("#reset-yes").addEventListener("click",()=>{
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    saveSuppressed=true; /* the beforeunload flush must not resurrect cleared state */
    window.location.reload();
  });
  wireModal(modalBack,"#reset-no");
}

/* ---- glossary ---- */

function buildGlossary(){
  const dl=document.getElementById("gloss-list");
  dl.innerHTML=GLOSSARY.map(g=>'<dt>'+g[0]+'</dt><dd>'+g[1]+'</dd>').join("");
  document.getElementById("gloss-toggle").addEventListener("click",function(){
    const open=dl.classList.toggle("hidden");
    this.setAttribute("aria-expanded", String(!open));
    this.textContent = open? "Show glossary":"Hide glossary";
  });
}

/* ---- boot ---- */

function woShell(id, objId, title, bodyHtml, open, withHints, msgId){
  const o=state.objectives[objId];
  return '<details class="workorder" id="wo-'+id+'"'+(open?" open":"")+' data-obj="'+objId+'">'+
    '<summary><span class="tag">'+objId+'</span> '+title+' <span class="wo-status"></span><span class="chev">▶</span></summary>'+
    '<div class="wo-body">'+bodyHtml+((withHints===false)?"":hintButtons(objId))+
    '<div class="checkmsg" id="'+(msgId||("msg-"+objId))+'" aria-live="polite"></div></div></details>';
}

function selHtml(name, options, value, aria){
  return '<select name="'+name+'" data-name="'+name+'" aria-label="'+aria+'"><option value="">— choose —</option>'+
    options.map(o=>'<option value="'+o[0]+'"'+(value===o[0]?" selected":"")+'>'+o[1]+'</option>').join("")+'</select>';
}

function selIdx(name, options, idx, aria){
  return '<select name="'+name+'" data-name="'+name+'" aria-label="'+aria+'"><option value="">— choose —</option>'+
    options.map((o,i)=>'<option value="'+i+'"'+(idx!==null&&idx===i?" selected":"")+'>'+o+'</option>').join("")+'</select>';
}

function refreshNextButtons(){
  const order=DOCK_ORDER;
  DOCK_ORDER.forEach((d,i)=>{
    const objs=DOCK_OBJ[d];
    let complete = d==="quiz" ? state.quiz.done : (objs.length? objs.every(id=>state.objectives[id].done) : !!state.visitedDocks[d]);
    const host=document.getElementById("next-"+d);
    if(!host) return;
    const next=order[i+1];
    if(complete && next && (d!=="debrief")){
      host.innerHTML='<button class="btn dark" data-goto="'+next+'" type="button">Proceed to '+({binder:"Dock 01 · Evidence Intake",dock1:"Dock 02 · Yard Sweep",dock2:"Dock 03 · Campaign Studio",dock3:"Dock 04 · Training Yard",dock4:"Dock 05 · Metrics House",dock5:"The Inspection",quiz:"Debrief Locker"})[d]+' →</button>';
    } else host.innerHTML="";
  });
}

/* ================= BINDER — M1 ================= */

function renderBinder(){
  const why={
    net:"This quarter’s attack never touched the perimeter — it simply asked a person for their password, with a look-alike domain.",
    end:"No malware landed — EDR has nothing to catch yet. The attack is hunting for a human to approve the way in.",
    hum:"Exactly. Social engineering targets the human decision, which makes people the cheapest path past strong technical layers — and the reason Lesson 5.6 exists.",
    data:"The attack hasn’t reached data yet — it is after a person who can open the door to it."
  };
  document.querySelectorAll(".layerbtn").forEach(btn=>{
    if(state.layer===btn.dataset.layer) btn.classList.add("sel");
    btn.addEventListener("click",()=>{
      state.layer=btn.dataset.layer;
      document.querySelectorAll(".layerbtn").forEach(b=>b.classList.toggle("sel",b===btn));
      document.getElementById("layer-why").textContent=why[btn.dataset.layer];
      queueSave();
    });
  });
  const slot=document.getElementById("m1-check-slot");
  slot.innerHTML='<div class="a-actions" style="padding:0"><button class="btn primary" data-check-m1="1" type="button">Confirm your answer</button></div><div class="checkmsg" id="msg-M1" aria-live="polite"></div>';
  slot.addEventListener("click",e=>{
    if(!e.target.closest("[data-check-m1]")) return;
    const ok=state.layer==="hum";
    recordCheck("M1",ok,document.getElementById("msg-M1"),
      "the human layer — exactly why Lesson 5.6 exists",
      "Technical layers make attacks expensive; the human decision is the cheap path. Awareness practices harden that decision and turn reporters into sensors — that is the whole objective.",
      "not this layer",
      "Social engineering doesn’t defeat the firewall or EDR — it asks a person to approve the action. Which of the four layers is a person?");
  });
}

/* ================= DOCK 1 — EVIDENCE INTAKE ================= */

function artifactCard(a, withSelects){
  return '<article class="artifact" id="art-'+a.id+'">'+
    '<div class="a-head"><span class="tag teal">'+a.chan+'</span><span class="who">'+a.who+'</span><span class="tag">'+a.title+'</span></div>'+
    '<div class="msg-meta">'+a.meta.map(m=>'<span>'+m+'</span>').join("")+'</div>'+
    '<div class="a-body">'+a.body+'</div>'+
    '<div class="msg-meta"><span style="border:0">Gateway note: '+a.note+'</span></div>'+
    (withSelects?'<div class="answers">'+
      '<div><label>Attack type</label>'+selIdx("t-"+a.id, TYPES, (state.artifacts[a.id]?state.artifacts[a.id].t:null), "Attack type for "+a.id)+'</div>'+
      '<div><label>Correct action</label>'+selIdx("a-"+a.id, ACTIONS, (state.artifacts[a.id]?state.artifacts[a.id].a:null), "Correct action for "+a.id)+'</div>'+
    '</div>':"")+
    '</article>';
}

function renderDock1(){
  const body=document.getElementById("dock1-body");
  let html="";
  if(state.mode==="medium"){
    for(let i=0;i<4;i++){
      const a=ARTIFACTS[i], obj=["M2","M3","M4","M5"][i];
      html+=woShell(a.id,obj,"WO-"+(i+1)+" · "+a.chan.toLowerCase()+" intake",
        artifactCard(a,true)+
        '<div class="a-actions"><button class="btn primary" data-check-art="'+a.id+'" type="button">Check results</button></div>');
    }
    html+=woShell("safe","M6","WO-5 & WO-6 · responding to reported messages",
      artifactCard(ARTIFACTS[4],true)+artifactCard(ARTIFACTS[5],true)+
      '<div class="a-actions"><button class="btn primary" data-check-art="safe" type="button">Check results</button></div>');
  } else {
    html+=woShell("all","H1","Intake sweep · all six artifacts",
      ARTIFACTS.map(a=>artifactCard(a,true)).join("")+
      '<div class="a-actions"><button class="btn primary" data-check-art="all" type="button">Check results — all six, exact</button></div>');
    html+=woShell("bec","H9","BEC response protocol · sequence the 5 steps",
      '<p>Using WO-4 (the “CEO” wire request): put the finance team’s response steps in the correct order.</p>'+
      '<ul class="seq" id="bec-list"></ul>'+
      '<div class="a-actions"><button class="btn primary" data-check-bec="1" type="button">Check sequence</button></div>');
  }
  html+='<div id="next-dock1"></div>';
  body.innerHTML=html;
  if(state.mode==="hard" && (!state.bec || state.bec.length!==5)) state.bec=["verify-dir","dont-reply","alert-fin","preserve","report-sec"];
  if(state.mode==="hard") drawSeq();
  body.addEventListener("change",e=>{
    const n=e.target.dataset.name; if(!n) return;
    if(n.startsWith("t-")){ const id=n.slice(2); const st=state.artifacts[id]||(state.artifacts[id]={t:null,a:null}); st.t=parseInt(e.target.value,10); }
    if(n.startsWith("a-")){ const id=n.slice(2); const st=state.artifacts[id]||(state.artifacts[id]={t:null,a:null}); st.a=parseInt(e.target.value,10); }
    queueSave();
  });
  body.addEventListener("click",e=>{
    const art=e.target.closest("[data-check-art]");
    if(art){ checkArtifact(art.dataset.checkArt); return; }
    const bec=e.target.closest("[data-check-bec]");
    if(bec){ checkBec(); return; }
    const up=e.target.closest("[data-bec-up]"), down=e.target.closest("[data-bec-down]");
    if(up||down){
      const i=parseInt((up||down).dataset.becUp!==undefined?(up?up.dataset.becUp:0):(down?down.dataset.becDown:0),10);
      const j=up?i-1:i+1;
      if(j>=0&&j<state.bec.length){ const t=state.bec[i];state.bec[i]=state.bec[j];state.bec[j]=t; drawSeq(); queueSave(); }
    }
  });
  refreshNextButtons();
}

function drawSeq(){
  const ul=document.getElementById("bec-list"); if(!ul) return;
  ul.innerHTML=state.bec.map((s,i)=>'<li'+(state.objectives.H9.done?" class=\"ok\"":"")+'><span class="pos">'+(i+1)+'</span><span>'+BEC_STEPS.find(x=>x[0]===s)[1]+'</span>'+
    '<span class="updown"><button class="btn small ghost" data-bec-up="'+i+'" type="button" aria-label="Move step '+(i+1)+' up">↑</button>'+
    '<button class="btn small ghost" data-bec-down="'+i+'" type="button" aria-label="Move step '+(i+1)+' down">↓</button></span></li>').join("");
}

function planSvg(){
  const rooms=[
    ["Warehouse",20,20,240,320],["Meeting room",280,20,180,140],["Dispatch office",480,20,160,140],
    ["Corridor · print corner",280,170,360,60],["Reception lobby",280,240,180,100],["Finance office",480,240,160,100]
  ];
  let s='<svg viewBox="0 0 660 360" role="img" aria-label="Harborline yard floor plan with nine inspectable markers" id="yardplan">';
  rooms.forEach(r=>{ s+='<rect x="'+r[1]+'" y="'+r[2]+'" width="'+r[3]+'" height="'+r[4]+'" rx="8" fill="#efe7d6" stroke="#c9bfa8" stroke-width="2"/>'+
    '<text x="'+(r[1]+10)+'" y="'+(r[2]+18)+'" font-family="SFMono-Regular,monospace" font-size="12" fill="#3e4c44">'+r[0]+'</text>'; });
  s+='<line x1="260" y1="20" x2="260" y2="340" stroke="#c9bfa8" stroke-width="2" stroke-dasharray="6 5"/>';
  PINS.forEach((p,i)=>{
    const found=state.pins[p.id]&&state.pins[p.id].opened;
    s+='<g class="pin'+(found?" found":"")+'" data-pin="'+p.id+'" role="button" tabindex="0" aria-label="'+p.label+' — '+(found?"inspected":"uninspected marker")+'" id="pin-'+p.id+'">'+
      '<circle class="hit" cx="'+p.x+'" cy="'+p.y+'" r="16"></circle><circle class="dot" cx="'+p.x+'" cy="'+p.y+'" r="7" stroke="#f4efe3" stroke-width="2"></circle>'+
      '<text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" font-size="9" font-weight="bold" fill="#f4efe3">'+(i+1)+'</text></g>';
  });
  s+='</svg>';
  return s;
}

function renderDock2(){
  document.getElementById("plan-wrap").innerHTML=planSvg();
  drawPinlist();
  const body=document.getElementById("dock2-body");
  const checkLabel=state.mode==="medium"?"Check sweep status (need ≥ 6 correct)":"Check sweep status (need all 9, exact)";
  document.getElementById("m7-check-slot").innerHTML='<div class="wo-checkzone"><span class="wo-status"></span><button class="btn primary" data-check-yard="1" type="button">'+checkLabel+'</button>'+
    '<div class="checkmsg" id="msg-'+(state.mode==="medium"?"M7":"H2")+'" aria-live="polite"></div></div>';
  const wrap=document.getElementById("plan-wrap");
  wrap.addEventListener("click",e=>{ const g=e.target.closest(".pin"); if(g) openPin(g.dataset.pin); });
  wrap.addEventListener("keydown",e=>{ const g=e.target.closest(".pin"); if(g&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); openPin(g.dataset.pin); } });
  body.addEventListener("click",e=>{
    if(e.target.closest("[data-check-yard]")) checkYard();
    if(e.target.closest("[data-pin-close]")){ document.getElementById("pin-form-slot").innerHTML=""; state.activePin=null; }
    const c=e.target.closest("[data-pin-confirm]");
    if(c) confirmPin(c.dataset.pinConfirm);
  });
  body.addEventListener("change",e=>{
    const n=e.target.dataset.name; if(!n) return;
    if(!state.activePin) return;
    const st=state.pins[state.activePin]; if(!st) return;
    if(n==="risk") st.risk=parseInt(e.target.value,10);
    if(n==="act") st.act=parseInt(e.target.value,10);
    queueSave();
  });
  refreshNextButtons();
}

function drawPinlist(){
  document.getElementById("pinlist").innerHTML=PINS.map((p,i)=>{
    const st=state.pins[p.id];
    let cls=""; if(st&&st.checked){ cls=st.ok?"ok":"err"; }
    return '<span class="pinchip '+cls+'">'+(i+1)+" · "+p.room+(st&&st.opened?" · inspected":"")+'</span>';
  }).join("");
}

function openPin(id){
  const p=PINS.find(x=>x.id===id); if(!p) return;
  state.activePin=id;
  const st=state.pins[id]||(state.pins[id]={opened:true,risk:null,act:null,checked:false,ok:false});
  st.opened=true;
  document.getElementById("plan-wrap").innerHTML=planSvg();
  drawPinlist();
  document.getElementById("pin-form-slot").innerHTML='<div class="pin-form">'+
    '<h4>'+p.label+' — <span class="tag orange">'+p.room+'</span></h4>'+
    '<p style="font-size:.95rem">'+esc(p.find)+'</p>'+
    '<div class="row">'+
    '<div><label style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);display:block;margin-bottom:.25rem">Risk class</label>'+selIdx("risk",PIN_TAGS,st.risk,"Risk class for "+p.id)+'</div>'+
    '<div><label style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);display:block;margin-bottom:.25rem">Correct handling</label>'+selIdx("act",PIN_ACTIONS,st.act,"Handling for "+p.id)+'</div></div>'+
    '<div style="display:flex;gap:.5rem;margin-top:.7rem"><button class="btn primary" data-pin-confirm="'+p.id+'" type="button">Record inspection</button>'+
    '<button class="btn ghost" data-pin-close="1" type="button">Close</button></div></div>';
  queueSave();
}

function confirmPin(id){
  const p=PINS.find(x=>x.id===id);
  const st=state.pins[id];
  st.checked=true;
  st.ok=(st.risk===p.risk&&st.act===p.act);
  drawPinlist();
  document.getElementById("pin-form-slot").innerHTML='<div class="pin-form"><p><span class="tag '+(st.ok?"green":"red")+'">'+(st.ok?"recorded — looks right":"recorded — will show on sweep check")+'</span> '+p.label+'. Keep sweeping: open every marker you suspect, then run the sweep check.</p></div>';
  state.activePin=null; queueSave();
}

function campaignForm(){
  const c=state.campaign;
  let html="";
  if(state.mode==="hard"){
    html+='<div class="case"><b>Handover note</b> — a contractor pre-configured this campaign. The IT Director suspects at least four settings are wrong. Fix everything, then answer the “why”.</div>';
  }
  html+='<div class="fieldrow">';
  Object.keys(CAMPAIGN_FIELDS).forEach(k=>{
    const f=CAMPAIGN_FIELDS[k];
    html+='<fieldset class="fieldset"><legend>'+f.q+'</legend>'+f.opts.map(o=>
      '<div class="radio"><input type="radio" id="'+k+"-"+o[0]+'" name="cam-'+k+'" value="'+o[0]+'"'+(c[k]===o[0]?" checked":"")+'><label for="'+k+"-"+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>';
  });
  html+='<fieldset class="fieldset"><legend>Report telemetry</legend>'+
    '<div class="checkopt"><input type="checkbox" id="cam-report" name="cam-report"'+(c.reportBtn?" checked":"")+'><label for="cam-report">One-click report button live in every mail client</label></div>'+
    '<fieldset class="fieldset" style="margin-top:.5rem"><legend>Metrics tracked</legend>'+
    METRIC_OPTS.map(m=>'<div class="checkopt"><input type="checkbox" id="met-'+m[0]+'" name="met" value="'+m[0]+'"'+(c.metrics.includes(m[0])?" checked":"")+'><label for="met-'+m[0]+'">'+m[1]+'</label></div>').join("")+
    '</fieldset></fieldset>';
  html+='</div>';
  if(state.mode==="hard"){
    html+='<fieldset class="fieldset"><legend>'+REPORT_REASON.q+'</legend>'+REPORT_REASON.opts.map(o=>
      '<div class="radio"><input type="radio" id="reason-'+o[0]+'" name="cam-reason" value="'+o[0]+'"'+(c.reason===o[0]?" checked":"")+'><label for="reason-'+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>';
  }
  html+='<div class="a-actions"><button class="btn primary" data-check-campaign="1" type="button">'+(state.mode==="hard"?"Submit corrected campaign":"Launch & check")+'</button>'+
    '<div class="checkmsg" id="msg-'+(state.mode==="medium"?"M8":"H3")+'" aria-live="polite"></div></div>'+
    '<div id="next-dock3"></div>';
  return html;
}

function renderDock3(){
  const body=document.getElementById("dock3-body");
  body.innerHTML=campaignForm();
  body.addEventListener("change",e=>{
    const n=e.target.name; if(!n) return;
    const c=state.campaign;
    if(n.startsWith("cam-")&&n!=="cam-report"&&n!=="cam-reason"){ c[n.slice(4)]=e.target.value; }
    if(n==="cam-report"){ c.reportBtn=e.target.checked; }
    if(n==="cam-reason"){ c.reason=e.target.value; }
    if(n==="met"){ c.metrics=Array.from(body.querySelectorAll('input[name="met"]:checked')).map(x=>x.value); }
    queueSave();
  });
  body.addEventListener("click",e=>{ if(e.target.closest("[data-check-campaign]")) checkCampaign(); });
  refreshNextButtons();
}

function renderDock4(){
  const body=document.getElementById("dock4-body");
  let html="";
  if(state.mode==="medium"){
    html+=woShell("planner","M9","Gap board · match interventions to gaps",
      '<div class="poolbar">'+POOL.map(p=>'<span class="poolchip" data-pool="'+p[0]+'" id="pool-'+p[0]+'">'+p[1].split(" ")[0]+'</span>').join("")+' <span style="font-size:.8rem;color:var(--ink-soft)">(3 of these are traps — leave them unused)</span></div>'+
      GAPS.map(g=>'<div class="gapcard"><h4>Gap: '+g.title+'</h4><div class="ev">Evidence: '+g.ev+'</div>'+selHtml("gap-"+g.id,POOL_SELECT_ORDER,state.planner[g.id],"Intervention for gap "+g.title)+'</div>').join("")+
      '<div class="a-actions"><button class="btn primary" data-check-planner="1" type="button">Check results</button></div>')+
    woShell("policy","M12","Policy desk · acknowledgment + reporting chain",
      '<p><b>What does a signed policy acknowledgment actually do?</b> Check everything that is true:</p>'+
      [["a-ok2","Establishes behavioral expectations for every user"],["a-no1","Replaces the need for awareness training"],["a-ok1","Records that the user read and understood the AUP and handbooks"],["a-no2","Guarantees users will comply"],["a-ok3","Supports malpractice-liability defense when rules are ignored"]].map(o=>
        '<div class="checkopt"><input type="checkbox" id="pol-'+o[0]+'" name="pol" value="'+o[0]+'"'+(state.policy.ack[o[0]]?" checked":"")+'><label for="pol-'+o[0]+'">'+o[1]+'</label></div>').join("")+
      '<p style="margin-top:.8rem"><b>A dispatcher forwards you a suspicious message.</b> Pick the correct reporting chain:</p>'+
      [["c1","Report via the report button to the security team; preserve the original message"],["c2","Reply to the sender to double-check, then report if it looks real"],["c3","Forward it to coworkers so they can also check it"]].map(o=>
        '<div class="radio"><input type="radio" id="chain-'+o[0]+'" name="chain" value="'+o[0]+'"'+(state.policy.chain===o[0]?" checked":"")+'><label for="chain-'+o[0]+'">'+o[1]+'</label></div>').join("")+
      '<div class="a-actions"><button class="btn primary" data-check-policy="1" type="button">Check results</button></div>');
  } else {
    html+=woShell("seq","H4","Rollout sequencer · 6 development steps",
      '<p>Order the program’s development and execution steps — from first measurement to steady state.</p>'+
      '<ul class="seq" id="seq4-list"></ul>'+
      '<div class="a-actions"><button class="btn primary" data-check-seq="1" type="button">Check sequence</button></div>')+
    woShell("match","H7","Countermeasure matcher · 6 attack patterns",
      MATCH_PAIRS.map((p,i)=>'<div class="gapcard"><h4>'+(i+1)+" · "+p[0]+'</h4>'+selHtml("match-"+i, MATCH_OPTS(), state.match["m"+i],"Countermeasure for pattern "+(i+1))+'</div>').join("")+
      '<div class="a-actions"><button class="btn primary" data-check-match="1" type="button">Check results</button></div>')+
    woShell("remote","H8","Remote-work builder · pick exactly 5",
      '<p>Hybrid/remote environments are an official part of this objective. Build the guidance pack — <b>exactly five</b> practices belong in it.</p>'+
      REMOTE_OPTS.map(o=>'<div class="checkopt"><input type="checkbox" id="rem-'+o[0]+'" name="rem" value="'+o[0]+'"'+(state.remote[o[0]]?" checked":"")+'><label for="rem-'+o[0]+'">'+o[1]+'</label></div>').join("")+
      '<div class="a-actions"><button class="btn primary" data-check-remote="1" type="button">Check results</button></div>');
  }
  html+='<div id="next-dock4"></div>';
  body.innerHTML=html;
  if(state.mode==="hard") drawSeq4();
  body.addEventListener("change",e=>{
    const n=e.target.name; if(!n) return;
    if(n.startsWith("gap-")){ state.planner[n.slice(4)]=e.target.value||null; updatePoolChips(); }
    if(n==="pol"){ state.policy.ack[e.target.value]=e.target.checked; }
    if(n==="chain"){ state.policy.chain=e.target.value; }
    if(n==="rem"){ state.remote[e.target.value]=e.target.checked; }
    if(n.startsWith("match-")){ state.match["m"+n.slice(6)]=e.target.value||null; }
    queueSave();
  });
  body.addEventListener("click",e=>{
    if(e.target.closest("[data-check-planner]")) checkPlanner();
    if(e.target.closest("[data-check-policy]")) checkPolicy();
    if(e.target.closest("[data-check-seq]")) checkSeq();
    if(e.target.closest("[data-check-match]")) checkMatch();
    if(e.target.closest("[data-check-remote]")) checkRemote();
    const up=e.target.closest("[data-seq-up]"), down=e.target.closest("[data-seq-down]");
    if(up||down){
      const i=parseInt((up||down).dataset.seqUp!==undefined?(up?up.dataset.seqUp:0):(down?down.dataset.seqDown:0),10);
      const j=up?i-1:i+1;
      if(j>=0&&j<state.seq.length){ const t=state.seq[i];state.seq[i]=state.seq[j];state.seq[j]=t; drawSeq4(); queueSave(); }
    }
  });
  updatePoolChips(); refreshNextButtons();
}

function MATCH_OPTS(){
  /* QA fix (R6): serve the pre-shuffled constant order — no option index equals its pair index */
  return MATCH_OPTION_ORDER.map(x=>[x,x]);
}

function updatePoolChips(){
  POOL.forEach(p=>{
    const el=document.getElementById("pool-"+p[0]); if(!el) return;
    const used=Object.values(state.planner).includes(p[0]);
    el.classList.toggle("used",used);
    el.title=p[1];
  });
}

function drawSeq4(){
  const ul=document.getElementById("seq4-list"); if(!ul) return;
  ul.innerHTML=state.seq.map((s,i)=>'<li'+(state.objectives.H4.done?" class=\"ok\"":"")+'><span class="pos">'+(i+1)+'</span><span>'+SEQ_STEPS.find(x=>x[0]===s)[1]+'</span>'+
    '<span class="updown"><button class="btn small ghost" data-seq-up="'+i+'" type="button" aria-label="Move step '+(i+1)+' up">↑</button>'+
    '<button class="btn small ghost" data-seq-down="'+i+'" type="button" aria-label="Move step '+(i+1)+' down">↓</button></span></li>').join("");
}

function statCard(label,value,delta){ return '<div class="stat"><b>'+label+'</b><div class="v">'+value+'</div><div class="d">'+(delta||"")+'</div></div>'; }

function spark(vals,max){
  const w=60,h=18;
  const pts=vals.map((v,i)=>[(i*(w/(vals.length-1))).toFixed(1),(h-2-(v/max)*(h-4)).toFixed(1)]);
  return '<svg class="spark" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline fill="none" stroke="#d95b18" stroke-width="2" points="'+pts.map(p=>p[0]+","+p[1]).join(" ")+'"/></svg>';
}

function dashboardHtml(){
  const clickQ=[28.0,17.1,8.8], repQ=[12.2,19.6,25.7];
  let rows="";
  DASH.depts.forEach(d=>{
    const gapQ1=d[1]-d[2];
    rows+='<tr data-dept="'+d[0]+'" class="'+(state.objectives.M11&&state.objectives.M11.done&&d[0]==="Finance"?"worst":"")+'"><td>'+d[0]+' <span style="color:var(--ink-soft)">('+({"Finance":82,"Dispatch":96,"Warehouse":141,"Office/Admin":93}[d[0]])+' staff)</span></td>'+
      '<td>'+d[1]+'% <span class="d" style="color:var(--ink-soft)">Q1</span></td><td>'+d[2]+'%</td><td>'+gapQ1+' pts</td>'+
      '<td>'+spark([d[1],d[3],d[5]],45)+'</td><td>'+spark([d[2],d[4],d[6]],45)+'</td></tr>';
  });
  const worstMarked=state.objectives.M11&&state.objectives.M11.done;
  return '<div class="statgrid">'+
    statCard("Overall click rate","28.0% → 8.8%","Q1 → Q3 · −68.6% relative")+
    statCard("Overall report rate","12.2% → 25.7%","Q1 → Q3 · +110.7% relative")+
    statCard("Median time-to-report","6h02m → 48m","Q1 → Q3")+
    statCard("Repeat clickers","9.2% → 4.7%","Q2 → Q3")+'</div>'+
    '<div class="tablewrap"><table class="mt" aria-label="Campaign results by department">'+
    '<thead><tr><th>Department</th><th>Q1 click</th><th>Q1 report</th><th>Q1 gap</th><th>Click trend</th><th>Report trend</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p style="font-size:.88rem;color:var(--ink-soft)">Q1 reports by count: Finance 2, Dispatch 9, Warehouse 20, Office/Admin 20 of 412 staff. Q3 anomaly alert: <b>Dispatch, week of Oct 20 — clicks 29%, reports 0%</b>, coinciding with a real vishing wave reported by the phone provider (outside the simulation).</p>';
}

function anomalyCards(){
  return ANOMALIES.map((n,i)=>{
    const st=state.anomalies[n.id]||{cls:null,resp:null};
    return '<div class="gapcard"><h4>'+(i+1)+" · "+n.who+'</h4><div class="ev" style="color:var(--ink)">'+n.text+'</div>'+
      '<div class="row"><div>'+selIdx("cls-"+n.id,ANOM_CLASSES,st.cls,"Class for event "+(i+1))+'</div>'+
      '<div>'+selIdx("resp-"+n.id,n.respOpts,st.resp,"Response for event "+(i+1))+'</div></div></div>';
  }).join("");
}

function renderDock5(){
  const body=document.getElementById("dock5-body");
  let html="";
  const isHard=state.mode==="hard";
  html+=woShell(isHard?"tri":"anom",isHard?"H6":"M10","Anomaly board · risky / unexpected / unintentional",
    '<p>Official taxonomy of objective 5.6: <b>risky</b> (deliberately dangerous), <b>unexpected</b> (off-baseline), <b>unintentional</b> (accident). Class all six and choose the response.</p>'+
    anomalyCards()+
    '<div class="a-actions"><button class="btn primary" data-check-anom="1" type="button">Check results</button></div>');
  if(isHard){
    html+=woShell("insider","H6","Insider two-parter · the n4 export",
      '<p>'+INSIDER_Q.q+'</p>'+
      '<fieldset class="fieldset"><legend>First move</legend>'+INSIDER_Q.actionOpts.map(o=>'<div class="radio"><input type="radio" id="ins-'+o[0]+'" name="ins-a" value="'+o[0]+'"'+(state.insider.action===o[0]?" checked":"")+'><label for="ins-'+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>'+
      '<fieldset class="fieldset" style="margin-top:.6rem"><legend>Why</legend>'+INSIDER_Q.whyOpts.map(o=>'<div class="radio"><input type="radio" id="why-'+o[0]+'" name="ins-w" value="'+o[0]+'"'+(state.insider.why===o[0]?" checked":"")+'><label for="why-'+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>'+
      '<div class="a-actions"><button class="btn primary" data-check-insider="1" type="button">Check results</button></div>',false,false,"msg-H6b");
  }
  html+=woShell(isHard?"spike":"dash",isHard?"H5":"M11","Dashboard · read the program year",
    dashboardHtml()+
    (isHard?
      '<fieldset class="fieldset"><legend>'+SPIKE.part1.q+'</legend>'+SPIKE.part1.opts.map(o=>'<div class="radio"><input type="radio" id="sp1-'+esc(o.slice(0,6))+'" name="sp1" value="'+esc(o)+'"'+(state.spike.p1===o?" checked":"")+'><label for="sp1-'+esc(o.slice(0,6))+'">'+o+'</label></div>').join("")+'</fieldset>'+
      '<fieldset class="fieldset" style="margin-top:.6rem"><legend>'+SPIKE.part2.q+'</legend>'+SPIKE.part2.opts.map(o=>'<div class="radio"><input type="radio" id="sp2-'+o[0]+'" name="sp2" value="'+o[0]+'"'+(state.spike.p2===o[0]?" checked":"")+'><label for="sp2-'+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>'+
      '<fieldset class="fieldset" style="margin-top:.6rem"><legend>'+SPIKE.part3.q+'</legend>'+SPIKE.part3.opts.map(o=>'<div class="radio"><input type="radio" id="sp3-'+o[0]+'" name="sp3" value="'+o[0]+'"'+(state.spike.p3===o[0]?" checked":"")+'><label for="sp3-'+o[0]+'">'+o[1]+'</label></div>').join("")+'</fieldset>'
      :
      '<div class="fieldrow">'+
      '<fieldset class="fieldset"><legend>Q1 worst click-to-report gap</legend>'+selHtml("dash-worst",DASH.worstOpts.map(x=>[x,x]),state.dash.worst,"Worst department")+'</fieldset>'+
      '<fieldset class="fieldset"><legend>KPI that matters</legend>'+selHtml("dash-kpi",DASH.kpiOpts,state.dash.kpi,"KPI")+'</fieldset>'+
      '<fieldset class="fieldset"><legend>Program verdict</legend>'+selHtml("dash-verdict",DASH.verdictOpts,state.dash.verdict,"Verdict")+'</fieldset></div>')+
    '<div class="a-actions"><button class="btn primary" data-check-dash="1" type="button">Check results</button></div>');
  html+='<div id="next-dock5"></div>';
  body.innerHTML=html;
  body.addEventListener("change",e=>{
    const n=e.target.name; if(!n) return;
    if(n.startsWith("cls-")){ state.anomalies[n.slice(4)]={cls:parseInt(e.target.value,10),resp:(state.anomalies[n.slice(4)]||{}).resp}; }
    if(n.startsWith("resp-")){ const id=n.slice(5); const st=state.anomalies[id]||{cls:null}; st.resp=parseInt(e.target.value,10); state.anomalies[id]=st; }
    if(n==="ins-a"){ state.insider.action=e.target.value; }
    if(n==="ins-w"){ state.insider.why=e.target.value; }
    if(n==="sp1"){ state.spike.p1=e.target.value; }
    if(n==="sp2"){ state.spike.p2=e.target.value; }
    if(n==="sp3"){ state.spike.p3=e.target.value; }
    if(n==="dash-worst"){ state.dash.worst=e.target.value; }
    if(n==="dash-kpi"){ state.dash.kpi=e.target.value; }
    if(n==="dash-verdict"){ state.dash.verdict=e.target.value; }
    queueSave();
  });
  body.addEventListener("click",e=>{
    if(e.target.closest("[data-check-anom]")){ state.mode==="hard" ? checkH6("tri") : checkAnomalies(); }
    if(e.target.closest("[data-check-insider]")){ checkH6("ins"); }
    if(e.target.closest("[data-check-dash]")){ state.mode==="hard" ? checkSpike() : checkDash(); }
  });
  refreshNextButtons();
}

function renderDebrief(){
  const b=document.getElementById("debrief-body");
  b.innerHTML=
  '<div class="debrief-grid">'+
  '<div class="mini-panel"><h3>Detection opportunities</h3><ul>'+
  '<li><b>Report-button telemetry</b> — every user report is an event: sender, subject, time. Example rule (<i>simplified</i>): <code>≥3 user reports of same sender/subject within 10 min → auto-quarantine campaign-wide + page SOC</code>.</li>'+
  '<li><b>Mail gateway + DMARC/SPF logs</b> — look-alike sender domains (harbor1ine ≠ harborline) and mismatched landing hosts.</li>'+
  '<li><b>UBA / baseline deviations</b> — odd-hours MFA pushes, impossible travel, abnormal exports (the n2/n4 patterns).</li>'+
  '<li><b>Badge & physical systems</b> — door-tail events, visitor escort gaps, printer/bin findings from the sweep.</li>'+
  '<li><b>Campaign metrics as detection KPIs</b> — report rate, time-to-report, repeat clickers.</li></ul></div>'+
  '<div class="mini-panel"><h3>Mitigation recommendations (with IDs)</h3><ul>'+
  '<li>Simulated phishing + report button → defends against <b>T1566</b> (incl. .001/.002/.003/.004) and <b>T1534</b></li>'+
  '<li>Never-share-codes + callback verification → <b>T1621</b> (MFA push bombing)</li>'+
  '<li>Password manager + credential scanner + unique passwords → <b>T1110.004</b>, <b>T1555</b></li>'+
  '<li>Removable-media policy + device control → <b>T1091</b>, <b>T1200</b></li>'+
  '<li>Attachment/link coaching → <b>T1204</b> user execution</li>'+
  '<li>Policy acknowledgment (AUP/handbooks) + malpractice-liability framing → SY0-801 5.6 “policy/handbooks”</li>'+
  '<li>Residual risk: awareness decays without recurring cadence; it mitigates, never guarantees — keep gateway + EDR layers armed.</li></ul></div>'+
  '<div class="mini-panel"><h3>Blue-team takeaways</h3><ul>'+
  '<li>Users are sensors: report rate and time-to-report are first-class detection metrics.</li>'+
  '<li>Blame-free reporting is a control — punitive programs suppress your best telemetry.</li>'+
  '<li>Triage before retraining: a spike with silence may be an incident, not a curriculum problem.</li>'+
  '<li>Feed yard-sweep findings into training topics — evidence beats assumption.</li></ul></div>'+
  '<div class="mini-panel"><h3>Red-team-mindset takeaways</h3><ul>'+
  '<li>Attackers pick the human path because it is cheapest: authority, urgency, secrecy, pretext.</li>'+
  '<li>Channels shift when filters improve: email → SMS → voice → QR. Defenses must train all channels.</li>'+
  '<li>Controls themselves get attacked (MFA fatigue). Train for the control’s failure mode.</li>'+
  '<li>Test like an attacker: purple-team attack simulation + tabletop exercises keep the program honest.</li></ul></div>'+
  '<div class="mini-panel"><h3>Official references (open in new tab)</h3><ul>'+
  '<li><a href="https://attack.mitre.org/techniques/T1566/" target="_blank" rel="noopener">MITRE ATT&CK T1566 — Phishing</a></li>'+
  '<li><a href="https://attack.mitre.org/techniques/T1566/004/" target="_blank" rel="noopener">T1566.004 — Spearphishing Voice</a></li>'+
  '<li><a href="https://attack.mitre.org/techniques/T1621/" target="_blank" rel="noopener">T1621 — MFA Request Generation</a></li>'+
  '<li><a href="https://attack.mitre.org/techniques/T1110/004/" target="_blank" rel="noopener">T1110.004 — Credential Stuffing</a></li>'+
  '<li><a href="https://attack.mitre.org/techniques/T1091/" target="_blank" rel="noopener">T1091 — Replication Through Removable Media</a></li>'+
  '<li><a href="https://www.comptia.org/en-us/certifications/security/" target="_blank" rel="noopener">CompTIA Security+ (SY0-801) certification page</a></li></ul>'+
  '<p style="font-size:.85rem;color:var(--ink-soft)">Exam context: Domain 5 “Security Program Management and Oversight”, 14% of SY0-801; 5.6 is its final content objective.</p></div>'+
  '<div class="mini-panel"><h3>Instructor answer key</h3><details><summary style="cursor:pointer;font-weight:700">Reveal (for instructors only)</summary>'+
  '<ul style="font-size:.85rem">'+
  '<li>M1 human layer · M2 a1: phishing/harvest + report-delete · M3 a2 smishing + report-delete · M4 a3 vishing + no-code-report · M5 a4 whaling + verify-known-channel · M6 a5/a6 legitimate+no action</li>'+
  '<li>M7 tags: h1 creds/lock-note · h2 creds/erase · h3 physical/refuse · h4 media/hand-in · h5 data/retrieve-lock · h6 data/shred-log · h7 media/unplug · h8 physical/escort · h9 visual/reposition</li>'+
  '<li>M8 config: harvest landing page · Finance+Dispatch · escalating · monthly randomized · button ON · educational · report+ttr, no names</li>'+
  '<li>M9 g1 pMfa · g2 pData · g3 pReport · g4 pEngage · g5 pRemote</li>'+
  '<li>M10 n1 risky/resp “Should have handed it to Security unopened” · n2 unexpected/“Deny the push and report it” · n3 unintentional/“Report it now” · n4 unexpected/“Report through the insider-threat procedure” · n5 risky/“Rotate the credential and coach” · n6 risky/“Disconnect, report, VPN-everywhere”</li>'+
  '<li>M11 Finance · k1 · v1 · M12 a-ok1..3 only + chain c1</li>'+
  '<li>H1 all six exact · H2 all nine exact · H3 fix cadence/button/tone/metrics + r1 · H4 baseline→sponsor→policy→train→sim→measure · H5 Dispatch Oct 20 / s1 / a1 · H6 six exact + i1 + j1 · H7 six exact pairs · H8 c1-c5 only · H9 dont-reply→verify-dir→report-sec→alert-fin→preserve</li></ul></details></div>'+
  '</div>';
}
/* hook refreshNextButtons into the engine loop */
