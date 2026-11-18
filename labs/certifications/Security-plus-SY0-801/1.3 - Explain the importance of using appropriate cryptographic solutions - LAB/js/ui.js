"use strict";

/* ============================================================================
   js/ui.js — rendering: station navigation, lamps/dial/guidance, instrument boards
   (with deterministic R6 shuffles), dossier, hash bench / salting / signature
   renderers, environment->UI restore, completion report incl. focus areas (R8).
   ============================================================================ */

function announce(msg){ const el = $("#srLive"); if(el){ el.textContent = ""; setTimeout(()=>{ el.textContent = msg; }, 30); } }

function setInline(id, ok, msg){ const el = $(id); if(!el) return; el.className = "inlineFb " + (ok ? "ok" : "bad"); el.textContent = msg; }

/* ---------- navigation ---------- */

function showStation(st){
  if(!state) return;
  state.active = st;
  $$(".panel").forEach(p=>p.classList.remove("on"));
  const target = st==="dossier" ? "panel-intro" : "panel-"+st;
  const el = document.getElementById(target);
  if(el) el.classList.add("on");
  $$(".stationBtn").forEach(b=>b.classList.toggle("active", b.dataset.station===st));
  if(st==="quiz") renderQuiz();
  if(st==="debrief") state.debriefSeen = true;
  refreshLamps(); save();
}

function stationDone(st){
  if(!state) return false;
  if(st==="quiz") return quizComplete();
  if(st==="debrief" && state.mode==="medium") return !!state.debriefSeen;
  const ids = MODE_DEFS[state.mode].map(o=>o.id).filter(id=>STATION_OBJ[st] && STATION_OBJ[st].includes(id));
  if(!ids.length) return null; // no objectives bound
  return ids.every(id=>state.obj[id] && state.obj[id].done);
}

function stationTouched(st){
  if(!state) return false;
  const e = state.env;
  switch(st){
    case "k": return Object.keys(e.lane).length>0 || e.escrow || e.escrowWhy;
    case "c": return Object.keys(e.ca).length>0 || Object.keys(e.ctype).length>0 || Object.keys(e.rev).length>0 || e.h2check;
    case "e": return Object.keys(e.symasym).length>0 || Object.keys(e.levels).length>0 || e.proto || Object.keys(e.posture).length>0;
    case "h": return e.hashA || e.hashB || e.saltOn || e.sign.length>0 || e.verdict || e.h5verdict;
    case "m": return Object.keys(e.cal).length>0 || e.h7seq.length>0;
    case "debrief": return Object.keys(e.mitre).length>0 || Object.keys(e.props9).length>0;
    default: return false;
  }
}

function refreshLamps(){
  $$(".stationBtn").forEach(b=>{
    const st = b.dataset.station;
    const lamp = b.querySelector(".lamp");
    const tick = b.querySelector(".tick");
    if(!lamp) return;
    const done = st==="intro" ? true : stationDone(st);
    if(done === true){ lamp.className = "lamp done"; if(tick) tick.classList.add("show"); }
    else if(stationTouched(st) || st===state.active){ lamp.className = "lamp on"; if(tick) tick.classList.remove("show"); }
    else { lamp.className = "lamp"; if(tick) tick.classList.remove("show"); }
  });
}

function refreshDial(){
  const defs = MODE_DEFS[state.mode];
  const done = defs.filter(o=>state.obj[o.id] && state.obj[o.id].done).length;
  const quizPart = quizComplete() ? 1 : 0;
  const total = defs.length + 1;
  const pct = Math.round(((done + quizPart) / total) * 100);
  $("#dial").style.setProperty("--p", pct);
  $("#dialPct").textContent = pct + "%";
}

function currentMediumObjective(){
  if(state.mode!=="medium") return null;
  return MODE_DEFS.medium.find(o=>!(state.obj[o.id] && state.obj[o.id].done)) || null;
}

function refreshGuidance(){
  $$(".stationBtn").forEach(b=>b.classList.remove("guided"));
  const cur = currentMediumObjective();
  const note = $("#spineNote");
  if(cur){
    const st = cur.station;
    const btn = $$('.stationBtn').find(b=>b.dataset.station===st);
    if(btn) btn.classList.add("guided");
    if(note) note.textContent = "Next: " + cur.id + " at " + (btn? btn.querySelector(".st-name").textContent : st) + ". A station lamp turns amber when configured, green when its checks pass.";
  } else if(state.mode==="medium"){
    if(note) note.textContent = "All station checks pass. Finish at the Final Sign-Off quiz, then read the As-Built Records.";
  } else {
    if(note) note.textContent = "Hard mode: free-roam. Check the ledger for the 9 objectives; the dossier is the map.";
  }
}

/* ---------- ledger ---------- */

function renderGlossary(){
  const box = $("#glossaryList");
  box.innerHTML = GLOSSARY.map(g=>'<div class="gEntry"><b>'+g[0]+'</b><p>'+g[1]+'</p></div>').join("");
}

function shuffleOpts(id, opts){ if(opts.length<2) return opts; const hasHead=opts[0][0]===""; const head=hasHead?[opts[0]]:[]; const rest=hasHead?opts.slice(1):opts; let order=stablePermutation("sel-"+id, rest.length, rest.length); if(order.every((v,i)=>v===i)) order.push(order.shift()); return head.concat(order.map(i=>rest[i])); }

/* ---------- builders ---------- */

function makeSelect(id, opts, val){ const so=shuffleOpts(id, opts); const s=el("select"); s.id=id; s.innerHTML=so.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join(""); if(val) s.value=val; return s; }

function buildLaneTasks(){
  const pub=$("#lanePub"), priv=$("#lanePriv"); pub.innerHTML=""; priv.innerHTML="";
  LANE_TASKS.forEach(([key,label])=>{
    const card=el("div","taskCard");
    card.innerHTML='<span>'+label+'</span><span class="assign"><button data-task="'+key+'" data-key="public">Public</button><button data-task="'+key+'" data-key="private">Private</button></span>';
    card.dataset.task=key;
    (state.env.lane[key]==="private"?priv:pub).appendChild(card);
    card.querySelectorAll("button").forEach(b=>b.classList.toggle("sel", state.env.lane[key]===b.dataset.key));
  });
}

function buildLevelBoard(){
  const board=$("#levelBoard"); board.innerHTML="";
  LEVEL_ASSETS.forEach(([key,label])=>{
    const row=el("div","boardRow");
    row.appendChild(el("div","asset",label));
    const s=makeSelect("lv-"+key, LEVEL_OPTS, state.env.levels[key]||"");
    s.addEventListener("change",()=>{ if(isKeyLocked("levels")){ announce(LOCK_MSG); s.value=state.env.levels[key]||""; return; } state.env.levels[key]=s.value; save(); refreshLamps(); refreshDial(); });
    row.appendChild(s); board.appendChild(row);
  });
}

function buildPostureBoard(){
  const board=$("#postureBoard"); board.innerHTML="";
  POSTURE_ROWS.forEach(([key,label,opts])=>{
    const row=el("div","boardRow");
    row.appendChild(el("div","asset",label));
    const s=makeSelect("post-"+key, opts, state.env.posture[key]||"");
    s.addEventListener("change",()=>{ if(isKeyLocked("posture")){ announce(LOCK_MSG); s.value=state.env.posture[key]||""; return; } state.env.posture[key]=s.value; save(); refreshLamps(); refreshDial(); });
    row.appendChild(s); board.appendChild(row);
  });
}

function buildCalBoard(){
  const board=$("#calBoard"); board.innerHTML="";
  const rows=[["rot","TLS portal signing key","select",CAL_ROT],["escrow","Backup archive master key (INC-003)","toggle",null],["destroy","Decommissioned fileserver key","select",CAL_DESTROY],["len","Legacy RSA-1024 key","select",CAL_LEN]];
  rows.forEach(([key,label,kind,opts])=>{
    const row=el("div","calRow");
    row.appendChild(el("span","kname",label));
    if(kind==="select"){
      const s=makeSelect("cal-"+key, opts, state.env.cal[key]||"");
      s.addEventListener("change",()=>{ if(isKeyLocked("cal")){ announce(LOCK_MSG); s.value=state.env.cal[key]||""; return; } state.env.cal[key]=s.value; save(); refreshLamps(); refreshDial(); });
      row.appendChild(s);
    } else {
      const b=el("button","btn-ghost btn-sm", state.env.cal.escrow==="on" ? "Escrow: ON (custodian holds copies)" : "Escrow: OFF (single custodian)");
      b.id="calEscrowBtn";
      b.addEventListener("click",()=>{ if(isKeyLocked("cal")){ announce(LOCK_MSG); return; } state.env.cal.escrow = state.env.cal.escrow==="on" ? "off" : "on"; b.textContent = state.env.cal.escrow==="on" ? "Escrow: ON (custodian holds copies)" : "Escrow: OFF (single custodian)"; save(); refreshLamps(); refreshDial(); });
      row.appendChild(b);
    }
    board.appendChild(row);
  });
}

function buildMitreBoard(){
  const board=$("#mitreBoard"); board.innerHTML="";
  MITRE_ROWS.forEach(([key,label,opts])=>{
    const row=el("div","boardRow");
    row.appendChild(el("div","asset",label));
    const s=makeSelect("mit-"+key, opts, state.env.mitre[key]||"");
    s.addEventListener("change",()=>{ if(isKeyLocked("mitre")){ announce(LOCK_MSG); s.value=state.env.mitre[key]||""; return; } state.env.mitre[key]=s.value; save(); refreshLamps(); refreshDial(); });
    row.appendChild(s); board.appendChild(row);
  });
}

function buildPropBoard(){
  const board=$("#propBoard"); board.innerHTML="";
  PROP_ROWS.forEach(([key,label])=>{
    const row=el("div","boardRow");
    row.appendChild(el("div","asset",label));
    const s=makeSelect("prop-"+key, PROP_OPTS, state.env.props9[key]||"");
    s.addEventListener("change",()=>{ if(isKeyLocked("props9")){ announce(LOCK_MSG); s.value=state.env.props9[key]||""; return; } state.env.props9[key]=s.value; save(); refreshLamps(); refreshDial(); });
    row.appendChild(s); board.appendChild(row);
  });
}

function setupPipe(poolId, slotsId, envKey, maxSlots){
  const pool=$("#"+poolId), slots=$$("#"+slotsId+" .pipeSlot");
  function render(){
    const arr=state.env[envKey];
    slots.forEach((s,i)=>{
      const step=arr[i];
      s.className="pipeSlot"+(step?" filled":"");
      s.innerHTML='<span class="num">'+(i+1)+'.</span> '+(step?escapeHtml(SIGN_STEPS[step]||step):"—");
      s.onclick = step ? ()=>{ if(isKeyLocked(envKey)){ announce(LOCK_MSG); return; } const idx=arr.indexOf(step); arr.splice(idx,1); const btn=pool.querySelector('[data-step="'+step+'"]'); if(btn) btn.disabled=false; render(); save(); refreshLamps(); refreshDial(); } : null;
    });
    pool.querySelectorAll("button").forEach(b=>{ b.disabled = arr.includes(b.dataset.step) || arr.length>=maxSlots; });
  }
  pool.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{ if(isKeyLocked(envKey)){ announce(LOCK_MSG); return; } if(state.env[envKey].length<maxSlots && !state.env[envKey].includes(b.dataset.step)){ state.env[envKey].push(b.dataset.step); render(); save(); refreshLamps(); refreshDial(); } }));
  render();
}

function injectDossier(){
  if($("#dossierWidget")) return;
  const lead=$("#panel-intro .lead");
  const widget=el("div","widget"); widget.id="dossierWidget";
  widget.innerHTML='<h4 style="margin-bottom:6px">HCS-11 Audit Dossier — preliminary findings (OBJ-H1)</h4><div class="why">Eight findings. Select EXACTLY the three critical cryptographic findings and tag each with its sub-area. Two entries are noise; two are real but minor.</div>';
  const fOrder=stablePermutation("findings", FINDINGS.length, FINDINGS.length);
  fOrder.forEach(fi=>{
    const [id,text]=FINDINGS[fi];
    const row=el("div","taskCard"); row.style.flexWrap="wrap";
    row.innerHTML='<label style="display:flex;gap:8px;align-items:center;flex:1"><input type="checkbox" data-finding="'+id+'"> <span><b>'+id+'</b> · '+text+'</span></label>';
    const selWrap=el("span"); selWrap.className="assign"; selWrap.style.display="none";
    selWrap.innerHTML='<select data-h1class="'+id+'" aria-label="sub-area for '+id+'">'+shuffleOpts("h1-"+id, H1_CLASSES).map(c=>'<option value="'+c[0]+'">'+c[1]+'</option>').join("")+'</select>';
    row.appendChild(selWrap);
    widget.appendChild(row);
    row.querySelector('[data-finding="'+id+'"]').addEventListener("change",(ev)=>{
      if(isKeyLocked("dossier")){ announce(LOCK_MSG); ev.target.checked=!!state.env.dossier[id]; return; }
      const checked=ev.target.checked;
      state.env.dossier[id]=checked;
      selWrap.style.display=checked?"inline-flex":"none";
      save(); refreshLamps(); refreshDial();
    });
    selWrap.querySelector("select").addEventListener("change",(ev)=>{ if(isKeyLocked("h1class")){ announce(LOCK_MSG); ev.target.value=state.env.h1class[id]||""; return; } state.env.h1class[id]=ev.target.value; save(); });
  });
  lead.insertAdjacentElement("afterend", widget);
}

function setManifest(){
  sha256hex(FILE_A).then(h=>{ const m=$("#manifestEv"); if(m) m.textContent="MANIFEST  audit-report.pdf\n  sha256 (first 32) = "+cut32(h)+" …\n  (bench prints the same width for each digest)"; });
}
/* ---------- hash bench / salt / sign ---------- */

function renderHashOut(){
  const e=state.env, out=$("#hashOut");
  let txt="HASH BENCH (SHA-256, first 32 chars)\n";
  txt += "A archived: " + (e.hashA ? cut32(e.hashA)+" …" : "— not hashed yet —") + "\n";
  txt += "B received: " + (e.hashB ? cut32(e.hashB)+" …" : "— not hashed yet —") + "\n";
  if(e.hashA&&e.hashB) txt += (e.hashA===e.hashB ? "RESULT: digests IDENTICAL" : "RESULT: digests DIFFER — bytes changed") ;
  out.textContent=txt;
}

function renderSalt(){
  const out=$("#saltOut");
  if(!state.env.saltOn){
    out.textContent="USER TABLE (password store, unsalted)\nall three users chose “"+SALT_PW+"”\nhash = SHA-256(password):\n" + SALT_USERS.map(u=>"  "+u[0]+"  ······  → "+cut32("")).join("\n");
    sha256hex(SALT_PW).then(h=>{ if(!state.env.saltOn) out.textContent="USER TABLE (password store, UNSALTED)\nall three users chose “"+SALT_PW+"”\nhash = SHA-256(password) — identical for every row:\n" + SALT_USERS.map(u=>"  "+u[0]+"  "+cut32(h)+" …").join("\n"); });
  } else {
    Promise.all(SALT_USERS.map(u=>sha256hex(SALT_PW+u[1]))).then(hs=>{
      out.textContent="USER TABLE (password store, SALTED per user)\nhash = SHA-256(password + per-user salt) — all different:\n" + SALT_USERS.map((u,i)=>"  "+u[0]+"  salt="+u[1]+"  "+cut32(hs[i])+" …").join("\n")+"\nSame password, three unique digests — precomputed tables die here.";
    });
  }
}

function renderSignOut(){
  const e=state.env, out=$("#signOut");
  const doc='DOCUMENT: HCS-11 self-assessment, section 4.2 '+(e.tampered?'"<span class="tamperMark">Encryptioon</span> levels"':'"Encryption levels"');
  let s=doc+"\nSTATUS: ";
  s += e.sign.join(",")==="hash,priv,attach,verify" ? "signed (pipeline complete)" : "unsigned / pipeline incomplete ("+e.sign.length+"/4 steps)";
  if(e.verified==="pass") s+="\nVERIFICATION: <b style=\"color:#1a7f52\">PASSED</b> — decrypted hash matches recomputed hash";
  if(e.verified==="fail") s+="\nVERIFICATION: <b class=\"tamperMark\">FAILED</b> — decrypted hash ≠ recomputed hash (document changed after signing)";
  if(e.verified==="malformed") s+="\nVERIFICATION: <b class=\"tamperMark\">MALFORMED</b> — pipeline order wrong; not a valid signature";
  out.innerHTML=s;
}
/* ---------- quiz ---------- */

function syncOptButtons(){
  const e=state.env;
  const map=[
    [b=>b.dataset.escrow, b=>e.escrow===b.dataset.escrow],
    [b=>b.dataset.escrowwhy, b=>e.escrowWhy===b.dataset.escrowwhy],
    [b=>b.dataset.ca, b=>e.ca[b.dataset.ca]===b.dataset.val],
    [b=>b.dataset.type, b=>e.ctype[b.dataset.type]===b.dataset.val],
    [b=>b.dataset.rev, b=>e.rev[b.dataset.rev]===b.dataset.val],
    [b=>b.dataset.symasym, b=>e.symasym[b.dataset.symasym]===b.dataset.val],
    [b=>b.dataset.proto, b=>e.proto===b.dataset.proto],
    [b=>b.dataset.kx&&!b.dataset.kxwhy, b=>e.kx===b.dataset.kx],
    [b=>b.dataset.kxwhy, b=>e.kxwhy===b.dataset.kxwhy],
    [b=>b.dataset.verdict, b=>e.verdict===b.dataset.verdict],
    [b=>b.dataset.halgo, b=>e.halgo===b.dataset.halgo],
    [b=>b.dataset.saltwhy, b=>e.saltwhy===b.dataset.saltwhy],
    [b=>b.dataset.h5verdict, b=>e.h5verdict===b.dataset.h5verdict],
    [b=>b.dataset.h5ctrl, b=>e.h5ctrl===b.dataset.h5ctrl],
    [b=>b.dataset.h6vuln, b=>e.h6vuln===b.dataset.h6vuln],
    [b=>b.dataset.h6fix, b=>e.h6fix===b.dataset.h6fix],
    [b=>b.dataset.postwhy, b=>e.postwhy===b.dataset.postwhy],
    [b=>b.dataset.h2check, b=>e.h2check===b.dataset.h2check],
    [b=>b.dataset.h2root, b=>e.h2root===b.dataset.h2root]
  ];
  $$(".optBtn").forEach(b=>{
    let sel=false;
    for(const [get,cmp] of map){ if(get(b)){ sel=cmp(b); break; } }
    b.classList.toggle("sel", !!sel);
  });
}

function applyEnvToUI(){
  const e=state.env;
  syncOptButtons(); buildLaneTasks(); buildLevelBoard(); buildPostureBoard(); buildCalBoard(); buildMitreBoard(); buildPropBoard();
  setupPipe("h2pool","h2seq","h2seq",3); setupPipe("signPool","signPipeline","sign",4); setupPipe("h7pool","h7seq","h7seq",5);
  applyShuffles();
  const props=$$(".propsGrid input"); props.forEach(p=>{ p.checked=!!e.props[p.dataset.prop]; });
  const serial=$("#h2serial"); if(serial) serial.value=e.h2serial||"";
  if(e.saltOn){ const t=$("#saltToggle"); t.textContent="Salt: ON — turn OFF (not recommended)"; }
  renderSalt(); renderHashOut(); renderSignOut();
  FINDINGS.forEach(([id])=>{ const cb=document.querySelector('[data-finding="'+id+'"]'); if(cb){ cb.checked=!!e.dossier[id]; const wrap=cb.closest(".taskCard").querySelector(".assign"); if(wrap) wrap.style.display=cb.checked?"inline-flex":"none"; const sel=wrap&&wrap.querySelector("select"); if(sel) sel.value=e.h1class[id]||""; } });
  const esc=$("#calEscrowBtn"); if(esc) esc.textContent=e.cal.escrow==="on"?"Escrow: ON (custodian holds copies)":"Escrow: OFF (single custodian)";
  renderQuiz();
}
/* ---------- completion ---------- */

function completionStats(){
  const defs=MODE_DEFS[state.mode];
  const done=defs.filter(o=>state.obj[o.id]&&state.obj[o.id].done);
  const first=done.filter(o=>objState(o.id).firstTry).length;
  const hints=defs.reduce((a,o)=>a+objState(o.id).hints,0);
  const quizTotal=QUIZ[state.mode].length;
  const quizCorrect=QUIZ[state.mode].filter((q,i)=>state.env.quiz["q"+i]===q.c).length;
  const quizWrong=quizTotal-quizCorrect;
  let stars=5-0.4*(defs.length-first)-0.25*hints-0.15*quizWrong;
  stars=Math.max(1,Math.min(5,Math.round(stars*2)/2));
  return {done:done.length,total:defs.length,first,hints,quizCorrect,quizTotal,quizWrong,stars};
}

function finishLab(){
  const defs=MODE_DEFS[state.mode];
  const missing=defs.filter(o=>!(state.obj[o.id]&&state.obj[o.id].done)).map(o=>o.id);
  const quizDone=quizComplete();
  if(missing.length||!quizDone){
    const msg="Not ready: "+(missing.length?("objectives "+missing.join(", ")+" outstanding. "):"")+(quizDone?"":"Complete the Final Sign-Off quiz.");
    announce(msg);
    let d=$("#finishMsg");
    if(!d){ d=el("div","inlineFb"); d.id="finishMsg"; $("#panel-debrief").appendChild(d); }
    d.className="inlineFb bad"; d.textContent=msg;
    return;
  }
  const st=completionStats();
  const row=$("#starsRow"); row.innerHTML="";
  const litUpTo=Math.round(st.stars);
  for(let i=1;i<=5;i++){ const s=el("span","star"+(i<=litUpTo?" lit":"")); s.textContent="★"; row.appendChild(s); }
  $("#scoreLine").textContent="Objectives "+st.done+"/"+st.total+" · sign-off "+st.quizCorrect+"/"+st.quizTotal+" · mode "+state.mode.toUpperCase();
  $("#starLine").textContent="Stars: first-attempt checks "+st.first+"/"+st.total+", hints used "+st.hints+", quiz misses "+st.quizWrong+". Fewer hints and first-attempt accuracy raise the rating.";
  const recap=$("#recapBox"); recap.innerHTML="";
  [["P1","Understand"],["P2","Recognize / analyze"],["P3","Detect"],["P4","Mitigate"]].forEach(([p,name])=>{
    const ids=defs.filter(o=>o.pillar===p).map(o=>o.id+(state.obj[o.id].done?"✓":"·")).join(" ");
    recap.appendChild(el("div","rLine","<b>"+p+" · "+name+":</b> "+ids));
  });
  /* R8: focus areas derived from actual performance evidence */
  const focus=$("#focusBox"); focus.innerHTML="";
  const stationName={k:"Key Pairs & PKI",c:"Certificates",e:"Encryption",h:"Hash & Sign",m:"Key Management",debrief:"As-Built Records",dossier:"Audit Dossier"};
  const weak=defs.filter(o=>{ const st=objState(o.id); return st.done && (!st.firstTry || st.hints>0); });
  const wrongQ=QUIZ[state.mode].map((q,i)=>({q,i})).filter(x=>state.env.quiz["q"+x.i]!==undefined && state.env.quiz["q"+x.i]!==x.q.c);
  weak.forEach(o=>{
    const st=objState(o.id);
    const why=[]; if(!st.firstTry) why.push("needed "+st.attempts+" attempts"); if(st.hints>0) why.push(st.hints+" hint"+(st.hints>1?"s":"")+" used");
    focus.appendChild(el("div","rLine","<b>"+o.id+" · "+(stationName[o.station]||o.station)+":</b> "+escapeHtml(o.title)+" ("+why.join(", ")+"). Re-run this station instrument before exam day."));
  });
  wrongQ.forEach(x=>{
    focus.appendChild(el("div","rLine","<b>Sign-off Q"+(x.i+1)+" ("+x.q.t+"):</b> answered wrong — re-read its explanation and the matching station section on "+x.q.t+"."));
  });
  if(!weak.length && !wrongQ.length){
    focus.appendChild(el("div","rLine","No repeat misses detected: every objective passed first-attempt without hints and the sign-off was fully correct. Recommended next challenge: run the other difficulty mode."));
  }
  $("#completeOverlay").classList.add("on");
  state.completedShown=true; save();
  announce("Commissioning complete. "+st.done+" of "+st.total+" objectives, quiz "+st.quizCorrect+" of "+st.quizTotal+", "+st.stars+" stars.");
}
/* ---------- R7 popup helpers ---------- */

function closeComplete(){ $("#completeOverlay").classList.remove("on"); const f=$("#finishBtn"); if(f) f.focus(); }

function closeReset(){ $("#resetOverlay").classList.remove("on"); const f=$("#restartBtn"); if(f) f.focus(); }

function closeGlossary(){ $("#glossaryDrawer").classList.remove("on"); $("#glossaryDrawer").setAttribute("aria-hidden","true"); $("#glossaryBtn").focus(); }
/* ---------- bindings & boot ---------- */
