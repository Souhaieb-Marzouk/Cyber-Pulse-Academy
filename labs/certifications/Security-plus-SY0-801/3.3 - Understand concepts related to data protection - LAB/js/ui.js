// UI — sections, glossary, workbench widgets, renderers, certificate, layers — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
/* ================= SECTIONS ================= */
const SECS=["briefing","handbook","floor","audit","exam","notes"];
function switchSec(name){
  SECS.forEach(s=>{ $("#sec-"+s).classList.toggle("active",s===name); });
  $$(".sbtn").forEach(b=>b.setAttribute("aria-current", b.dataset.sec===name ? "true":"false"));
  S.sec=name; S.seen[name]=1; updateDots(); save();
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateDots(){
  const all = S.mode ? objsFor(S.mode).every(id=>S.obj[id]&&S.obj[id].pass) : false;
  $$(".sdot").forEach(d=>{
    const s=d.dataset.dot; let on=false;
    if(s==="floor"||s==="audit") on=all;
    else if(s==="exam") on=!!(S.quiz&&S.quiz.done);
    else on=!!S.seen[s];
    d.classList.toggle("on",on);
  });
}
function gotoBench(id){
  const o=OBJ[id]; switchSec("floor");
  const bench=$("#bench-"+o.bench);
  if(bench){ bench.scrollIntoView({behavior:"smooth",block:"start"});
    bench.classList.remove("flash"); void bench.offsetWidth; bench.classList.add("flash"); }
}
/* keyboard shortcuts */

/* ================= GLOSSARY ================= */
function buildGlossary(){
  const dl=$("#glossList");
  dl.innerHTML=Object.keys(GLOSS).filter(k=>GLOSS[k][2]===1)
    .map(k=>`<dt>${GLOSS[k][0]}</dt><dd>${GLOSS[k][1]}</dd>`).join("");
}
let tipTimer=null; let tipFor=null;
function showTip(el){
  const g=GLOSS[el.dataset.g]; if(!g) return;
  const tip=$("#tip"); tip.textContent=g[0]+" — "+g[1];
  tip.style.display="block";
  const r=el.getBoundingClientRect();
  const top=Math.min(window.innerHeight-140, r.bottom+8);
  const left=Math.max(8, Math.min(window.innerWidth-310, r.left));
  tip.style.top=(top+window.scrollY)+"px"; tip.style.left=left+"px";
  clearTimeout(tipTimer);
}
function hideTip(){ const t=$("#tip"); if(t) t.style.display="none"; }

/* ================= WIDGETS ================= */
function envKey(objId,partKey){ return objId+"."+partKey; }
function getEnv(k){ return S.env[k]; }
function setEnv(k,v){ S.env[k]=v; save(); }

function partDefault(part){
  if(part.type==="order") return [];
  if(part.type==="sel"){ const o={}; part.rows.forEach(r=>o[r.id]=""); return o; }
  if(part.type==="checks") return part.fields.filter(f=>f.on).map(f=>f.v);
  if(part.type==="tri"){ const o={}; part.events.forEach(()=>{}); return o; }
  if(part.type==="tog") return false;
  return null;
}
function ensureEnv(objId,part){
  const k=envKey(objId,part.key);
  if(!(k in S.env)){ const d=partDefault(part); if(d!==null) S.env[k]=d; }
  return k;
}
function buildOrder(objId,part){
  const wrap=document.createElement("div");
  wrap.innerHTML=`<div class="orderline" data-ol="${objId}.${part.key}"><span class="slot">Custody order — click a stage to route it:</span></div>
  <div class="picks" role="group" aria-label="Stages to route"></div>`;
  const line=$(".orderline",wrap), picks=$(".picks",wrap);
  const lbl={}; part.items.forEach(i=>lbl[i[0]]=i[1]);
  function render(){
    const cur=getEnv(ensureEnv(objId,part))||[];
    line.innerHTML=`<span class="slot">Custody order — click a stage to route it:</span>`+
      cur.map((v,i)=>`<button type="button" class="ochip" data-rm="${esc(v)}" aria-label="Remove ${esc(lbl[v])} from position ${i+1}"><i>${i+1}</i>${esc(lbl[v])} ×</button>`).join("");
    picks.innerHTML=part.items.filter(i=>!cur.includes(i[0]))
      .map(i=>`<button type="button" class="pick" data-add="${esc(i[0])}">${esc(i[1])}</button>`).join("");
  }
  wrap.addEventListener("click",e=>{
    const a=e.target.closest("[data-add]"); const r=e.target.closest("[data-rm]");
    const k=ensureEnv(objId,part); const cur=(getEnv(k)||[]).slice();
    if(a){ if(!cur.includes(a.dataset.add)) cur.push(a.dataset.add); }
    else if(r){ cur.splice(cur.indexOf(r.dataset.rm),1); }
    else return;
    setEnv(k,cur); render();
  });
  render();
  return wrap;
}
function buildSel(objId,part){
  const wrap=document.createElement("div");
  wrap.innerHTML=part.rows.map(r=>`
    <div class="row"><span class="rlab">${r.label}${r.small?`<small>${r.small}</small>`:""}</span>
    <select data-sel="${r.id}" aria-label="${esc(r.label.replace(/<[^>]*>/g,""))}">${r.opts.map(o=>`<option value="${o[0]}">${esc(o[1])}</option>`).join("")}</select></div>`).join("");
  const k=ensureEnv(objId,part); const cur=getEnv(k)||{};
  part.rows.forEach(r=>{ const s=$(`select[data-sel="${r.id}"]`,wrap); if(cur[r.id]) s.value=cur[r.id];
    s.addEventListener("change",()=>{ const v=getEnv(k)||{}; v[r.id]=s.value; setEnv(k,v); }); });
  return wrap;
}
function buildChecks(objId,part){
  const wrap=document.createElement("div"); wrap.setAttribute("role","group");
  wrap.innerHTML=`<p class="lbl" style="margin:.2em 0 .4em">Checklist — tick what applies, untick what does not:</p>
  <div class="checkfields">${part.fields.map(f=>`
    <label class="cfield"><input type="checkbox" value="${f.v}" ${f.on?"checked":""}> ${esc(f.label)}</label>`).join("")}</div>`;
  const k=ensureEnv(objId,part);
  const cur0=getEnv(k);
  $$("input[type=checkbox]",wrap).forEach(inp=>{ if(cur0) inp.checked=cur0.includes(inp.value); });
  wrap.addEventListener("change",()=>{
    setEnv(k,$$("input:checked",wrap).map(i=>i.value));
  });
  return wrap;
}
function buildTri(objId,part){
  const labels=part.retMode?["Destroy","Keep"]:["Violation","Benign"];
  const src = part.retMode? RETENTION.map(r=>({id:r.id,meta:r.name,text:r.note,v:r.ans==="destroy"}))
                          : EVENTS.filter(e=>part.events.includes(e.id)).map(e=>({id:e.id,meta:e.time+" · "+e.user,text:e.text,v:e.v,vec:e.vec}));
  const wrap=document.createElement("div");
  wrap.innerHTML=src.map(ev=>`
   <div class="evt" data-ev="${ev.id}">
     <div class="emeta">${part.retMode?`<span>${esc(ev.meta)}</span>`:`<span>${esc(ev.id)}</span><span>${esc(ev.meta)}</span>`}</div>
     <div class="etext">${esc(ev.text)}</div>
     <div class="tri">
       <label class="vio"><input type="radio" name="tri-${objId}-${ev.id}" value="v"> ${labels[0]}</label>
       <label><input type="radio" name="tri-${objId}-${ev.id}" value="b"> ${labels[1]}</label>
     </div>
     ${part.vectors?`<div class="evector"><label style="font-size:.85rem">Exfiltration vector:
       <select data-vec="${ev.id}"><option value="">— choose vector —</option>${OPTS.vectors.map(v=>`<option value="${v[0]}">${esc(v[1])}</option>`).join("")}</select></label></div>`:""}
   </div>`).join("");
  const k=ensureEnv(objId,part);
  wrap.addEventListener("change",e=>{
    const evEl=e.target.closest(".evt"); if(!evEl) return;
    const id=evEl.dataset.ev; const v=getEnv(k)||{};
    if(e.target.name&&e.target.name.startsWith("tri-")){ v[id]=e.target.value; evEl.classList.toggle("hasvio",e.target.value==="v"&&!!part.vectors); }
    if(e.target.dataset&&e.target.dataset.vec){ v[id+"_vec"]=e.target.value; }
    setEnv(k,v);
  });
  /* restore */
  const cur=getEnv(k)||{};
  src.forEach(ev=>{
    if(cur[ev.id]){ const r=$(`input[name="tri-${objId}-${ev.id}"][value="${cur[ev.id]}"]`,wrap); if(r) r.checked=true; }
    if(part.vectors&&cur[ev.id+"_vec"]){ const s=$(`select[data-vec="${ev.id}"]`,wrap); if(s) s.value=cur[ev.id+"_vec"]; }
    if(part.vectors&&cur[ev.id]==="v"){ const el=$(`.evt[data-ev="${ev.id}"]`,wrap); if(el) el.classList.add("hasvio"); }
  });
  return wrap;
}
function buildTog(objId,part){
  const wrap=document.createElement("div");
  wrap.innerHTML=`<button type="button" class="switchbtn" aria-pressed="false"><span class="knob" aria-hidden="true"></span><span class="tglab">${part.label}</span></button>`;
  const k=ensureEnv(objId,part); const btn=$(".switchbtn",wrap);
  if(getEnv(k)) btn.setAttribute("aria-pressed","true");
  btn.addEventListener("click",()=>{
    const on=btn.getAttribute("aria-pressed")!=="true";
    btn.setAttribute("aria-pressed",String(on)); setEnv(k,on);
  });
  return wrap;
}
const BUILDERS={order:buildOrder,sel:buildSel,checks:buildChecks,tri:buildTri,tog:buildTog};
function validatePart(objId,part){
  const k=envKey(objId,part.key); const v=getEnv(k);
  if(part.type==="order"){ const cur=v||[]; return cur.length===part.answer.length&&part.answer.every((x,i)=>cur[i]===x); }
  if(part.type==="sel"){ return part.rows.every(r=>v&&v[r.id]===r.ans); }
  if(part.type==="checks"){ const cur=(v||[]).slice().sort(); const ans=part.answer.slice().sort();
    return cur.length===ans.length&&cur.every((x,i)=>x===ans[i]); }
  if(part.type==="tri"){
    const src = part.retMode? RETENTION : EVENTS.filter(e=>part.events.includes(e.id));
    return src.every(ev=>{
      const want = part.retMode ? (ev.ans==="destroy"?"v":"b") : (ev.v?"v":"b");
      if(!v||v[ev.id]!==want) return false;
      if(part.vectors&&want==="v"&&v[ev.id+"_vec"]!==ev.vec) return false;
      return true;
    });
  }
  if(part.type==="tog"){ return !!v===part.answer; }
  return false;
}
/* ================= RENDERERS ================= */
function renderShelf(){
  const host=$("#shelfHost"); host.innerHTML="";
  DOCS.filter(d=>!d.hard||S.mode==="hard").forEach(d=>{
    const b=document.createElement("button");
    b.className="dossier"+(d.hard?" decoy":""); b.dataset.doc=d.id;
    b.innerHTML=`<span><span class="dname">${esc(d.name)}</span><br><span class="dmeta">${esc(d.meta)}</span></span>
      <svg class="eyeball" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;
    host.appendChild(b);
  });
  $("#shelfHint").textContent = S.mode==="hard"
    ? "Open a dossier to read it in the Inspector. Not everything on this shelf matters — two items are decoys."
    : "Open a dossier to read its full contents in the Inspector.";
}
function objBlock(id){
  const o=OBJ[id];
  const hintBtn = id[0]==="m"
    ? `<button class="hbtn" data-hint="${id}">Hint (0/3)</button>`
    : `<button class="hbtn" data-nudge="${id}">Spend the nudge (costs stars)</button>`;
  return `<article class="obj" id="obj-${id}">
    <header class="obj-head"><span class="pill p-${o.pillar}">${PILL[o.pillar]}</span><span class="oid">${id.toUpperCase()}</span><b>${o.title}</b></header>
    <p class="obj-prompt">${o.prompt}</p>
    <div class="wparts"></div>
    <div class="objbar"><span class="status">Unchecked</span>${hintBtn}<button class="cbtn" data-check="${id}">Check results</button></div>
    <div class="feedback"><b class="tag"></b><span></span></div>
    <div class="hbox" style="display:none"></div>
  </article>`;
}
function renderBenches(){
  const host=$("#benches"); host.innerHTML="";
  BENCHES.forEach(b=>{
    if(b.medium&&S.mode!=="medium") return;
    if(b.hard&&S.mode!=="hard") return;
    const ids=objsFor(S.mode).filter(id=>OBJ[id].bench===b.id);
    if(!ids.length) return;
    const art=document.createElement("article");
    art.className="bench"; art.id="bench-"+b.id;
    art.innerHTML=`<header><span class="stno">${b.no}</span><h3>${b.name}</h3><span class="bstat">Station complete</span></header>
      <div class="bbody"><p class="lbl" style="margin:0 0 12px">${b.blurb}</p>${ids.map(objBlock).join("")}</div>`;
    host.appendChild(art);
    ids.forEach(id=>{
      const el=$("#obj-"+id,art);
      const wparts=$(".wparts",el);
      OBJ[id].parts.forEach(p=>wparts.appendChild(BUILDERS[p.type](id,p)));
      restoreObjUI(id,el);
    });
    updateBenchState(b.id);
  });
}
function restoreObjUI(id,el){
  const st=S.obj[id]; if(!st) return;
  if(st.pass){ el.classList.add("passed","done"); setStatus(el,"pass");
    const bar=$(".objbar",el); if(bar&&!$(".stampok",bar)) bar.insertAdjacentHTML("beforeend",'<span class="stampok" aria-hidden="true"></span>');
  } else if(st.attempts>0){ setStatus(el,"fail"); }
  if(st.fb) showFb(el,st.fbGood?"good":"bad",st.pass?"Checked & filed":"Not yet — read why",st.fb);
  if(st.hintShown){ const hb=$(".hbox",el); hb.style.display="block";
    hb.innerHTML=(id[0]==="m"?`<b>Hint ${st.hints} of 3:</b> `:`<b>Nudge spent (star cost):</b> `)+st.hintShown; }
  const hbtn=$(".hbtn",el);
  if(hbtn){ if(id[0]==="m"){ hbtn.textContent=`Hint (${st.hints||0}/3)`; if((st.hints||0)>=3) hbtn.disabled=true; }
    else if((st.hints||0)>=1) hbtn.disabled=true; }
}
function updateBenchState(bid){
  const art=$("#bench-"+bid); if(!art) return;
  const ids=objsFor(S.mode).filter(id=>OBJ[id].bench===bid);
  if(ids.length&&ids.every(id=>S.obj[id]&&S.obj[id].pass)) art.classList.add("alldone");
}
function renderAudit(){
  const ol=$("#auditList"); const ids=objsFor(S.mode);
  $("#auditLead").innerHTML = S.mode==="medium"
   ? "Twelve objectives. Open a workbench, do the work, press <b>Check results</b> — every check explains what a defender does next."
   : "Nine missions, strict grading: near-misses are rejected with a reason, and the single nudge costs stars.";
  ol.innerHTML=ids.map((id,i)=>{ const o=OBJ[id]; const st=S.obj[id]||{};
    return `<li data-audit="${id}" class="${st.pass?"passed":""}${st.fb?" hasfb":""}">
      <span class="adot" aria-hidden="true">${st.pass?"✓":i+1}</span>
      <span class="atit"><span class="oid">${id.toUpperCase()}</span> ${o.title}</span>
      <span class="ameta"><span class="pill p-${o.pillar}">${PILL[o.pillar]}</span><button class="btn ghost" data-open="${id}" style="min-height:38px;padding:.25em .8em">Open workbench</button></span>
      <span class="fb"><b>${st.pass?"Filed:":"Awaiting:"}</b> ${st.fb?esc(st.fb):"Not yet checked."}</span>
    </li>`; }).join("");
}
function buildTicker(){
  const line=EVENTS.map(e=>`${e.time} ${e.id} — ${e.text}`).join("   ·   ");
  $("#tickerStrip").textContent=line+"   ·   "+line+"   ·   ";
}

/* ================= CERTIFICATE ================= */
function openCert(){
  if(!S.mode) return;
  const ids=objsFor(S.mode), total=ids.length;
  const clean=ids.filter(id=>S.obj[id]&&S.obj[id].clean).length;
  const pct=total?Math.round(clean/total*100):0;
  const stars= pct>=95?5: pct>=80?4: pct>=60?3: pct>=40?2:1;
  const starEl=$("#certStars");
  starEl.innerHTML="★".repeat(stars)+(5-stars?`<span class="off">${"★".repeat(5-stars)}</span>`:"");
  starEl.setAttribute("aria-label",stars+" of 5 stars");
  $("#certScore").textContent=`First-attempt precision: ${clean} of ${total} objectives clean (${pct}%) — stars reward clean first-check runs; retries still count as progress.`;
  const byP={U:[0,0],R:[0,0],D:[0,0],M:[0,0]};
  ids.forEach(id=>{ byP[OBJ[id].pillar][1]++; if(S.obj[id]&&S.obj[id].pass) byP[OBJ[id].pillar][0]++; });
  $("#certRecap").innerHTML=Object.keys(byP).map(p=>
    `<div class="pr"><div class="prh">${PILL[p]}</div><div class="prn">${byP[p][0]} / ${byP[p][1]}</div>
     <div class="meter"><i style="width:${byP[p][1]?Math.round(byP[p][0]/byP[p][1]*100):0}%"></i></div></div>`).join("");
  /* R8: focus areas derived from THIS student's actual evidence */
  const focus=[];
  ids.forEach(id=>{ const st=S.obj[id];
    if(st&&!st.clean) focus.push(`<li><b>${id.toUpperCase()} — ${OBJ[id].title}</b> (${PILL[OBJ[id].pillar]}): ${st.pass?(st.hints?`passed with ${st.hints} hint${st.hints>1?"s":""} — revisit ${OBJ[id].anchor}.`:`needed ${st.attempts} checks — revisit ${OBJ[id].anchor}.`):"not passed — rework this bench with the handbook open."}</li>`); });
  (QUIZ[S.mode]||[]).forEach((it,i)=>{ const a=(S.quiz.answers||{})[i];
    if(a===undefined) focus.push(`<li>Examination item ${i+1} — ${it.topic}: left unanswered.</li>`);
    else if(a!==it.a) focus.push(`<li>Examination item ${i+1} — ${it.topic}: answered wrong.</li>`); });
  $("#certFocus").innerHTML=`<h3>Focus areas for your next study block</h3>`+
    (focus.length?`<ul>${focus.join("")}</ul>`
      :`<ul><li>None — every objective passed clean on the first check and the examination is flawless. Move on to the next domain and keep your field notes handy.</li></ul>`);
  $("#certQuiz").textContent = S.quiz.done
    ? `Examination: ${S.quiz.score} / ${QUIZ[S.mode].length} correct.`
    : "The examination (section 05) is still open — finish it to complete the review.";
  $("#certNext").innerHTML=`<b>Next on the syllabus:</b> pair objective 3.3 with the resilience objectives (backups &amp; recovery) and Domain 4 incident response, then reread your field notes. Official references are linked there.`;
  openLayer("certModal");
  S.certSeen=true; save();
}

/* ================= LAYERS, MODE, RESET ================= */
let lastFocus=null;
function openLayer(id){ lastFocus=document.activeElement; const el=$("#"+id); if(!el) return; el.hidden=false;
  const f=el.querySelector("h2,.xbtn,.go"); if(f) f.focus(); }
function closeLayer(id){ const el=$("#"+id); if(!el||el.hidden) return;
  if(id==="glossDrawer"){ el.classList.remove("open"); el.hidden=true; } else { el.hidden=true; }
  if(lastFocus&&lastFocus.focus){ lastFocus.focus(); } lastFocus=null; }
function toggleGloss(){ const d=$("#glossDrawer");
  if(d.hidden){ d.hidden=false; d.classList.add("open"); const f=d.querySelector(".xbtn"); if(f) f.focus(); }
  else { d.classList.remove("open"); d.hidden=true; } }
function openDoc(id){
  const doc=DOCS.find(d=>d.id===id); if(!doc) return;
  $("#inspH").textContent=doc.name; $("#inspMeta").textContent=doc.meta; $("#inspBody").textContent=doc.body;
  openLayer("inspector");
}
function renderMode(){ renderShelf(); renderBenches(); renderAudit(); renderQuiz(); progress(); advancePointer(); updateDots(); }
