// OBJECTIVES — CHECK RESULTS validation engine + hints — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
/* ================= CHECK ENGINE ================= */
function setStatus(el,kind){
  const s=$(".status",el);
  if(kind==="pass"){ s.textContent="Passed"; s.className="status pass"; }
  else if(kind==="fail"){ s.textContent="Check failed"; s.className="status fail"; }
  else { s.textContent="Unchecked"; s.className="status"; }
}
function showFb(el,kind,tag,text){
  const f=$(".feedback",el); f.className="feedback show "+kind;
  f.innerHTML=`<b class="tag">${tag}</b>${text}`;
}
function checkObj(id){
  const o=OBJ[id];
  const st=S.obj[id]||(S.obj[id]={pass:0,attempts:0,hints:0,firstTry:false,clean:false,fb:"",fbGood:false,hintShown:""});
  const el=$("#obj-"+id); if(!el) return;
  st.attempts++;
  const ok=o.parts.every(p=>validatePart(id,p));
  if(ok){
    const fresh=!st.pass;
    st.pass=1;
    if(fresh){ st.firstTry=st.attempts===1; st.clean=st.attempts===1&&st.hints===0; }
    st.fb=o.why; st.fbGood=true;
    el.classList.add("passed","done");
    const bar=$(".objbar",el); if(!$(".stampok",bar)) bar.insertAdjacentHTML("beforeend",'<span class="stampok" aria-hidden="true"></span>');
    setStatus(el,"pass"); showFb(el,"good",fresh?"Checked & filed":"Re-checked & filed",o.why);
    announce("Objective "+id.toUpperCase()+(fresh?" passed.":" re-verified.")+" "+o.why);
    renderAudit(); progress();
    if(objsFor(S.mode).every(x=>S.obj[x]&&S.obj[x].pass)) setTimeout(openCert,900);
    else advancePointer();
  } else {
    const wasPass=!!st.pass; st.pass=0;
    st.fb=o.no; st.fbGood=false;
    el.classList.remove("passed","done");
    const oldStamp=$(".stampok",el); if(oldStamp) oldStamp.remove();
    setStatus(el,"fail");
    showFb(el,"bad",wasPass?"Evidence changed — back on the bench":"Not yet — read why",o.no);
    announce("Objective "+id.toUpperCase()+(wasPass?" no longer passes — the evidence changed. ":" is not yet passed. ")+o.no);
    renderAudit(); progress();
  }
  save();
}
function useHint(id){
  const o=OBJ[id];
  const st=S.obj[id]||(S.obj[id]={pass:0,attempts:0,hints:0,firstTry:false,clean:false,fb:"",fbGood:false,hintShown:""});
  if(st.pass) return;
  const el=$("#obj-"+id), hb=$(".hbox",el);
  if(id[0]==="m"){
    if(st.hints>=3) return;
    st.hints++; st.hintShown=o.hints[st.hints-1];
    hb.style.display="block"; hb.innerHTML=`<b>Hint ${st.hints} of 3:</b> ${st.hintShown}`;
    const btn=$("[data-hint]",el); btn.textContent=`Hint (${st.hints}/3)`;
    if(st.hints>=3) btn.disabled=true;
    announce("Hint revealed. Hints cost stars, never progress.");
  } else {
    if(st.hints>=1) return;
    st.hints=1; st.hintShown=o.nudge;
    hb.style.display="block"; hb.innerHTML=`<b>Nudge spent (star cost):</b> ${st.hintShown}`;
    $("[data-nudge]",el).disabled=true;
    announce("Nudge revealed. It will cost stars.");
  }
  save();
}
function progress(){
  const ids=objsFor(S.mode); const passed=ids.filter(id=>S.obj[id]&&S.obj[id].pass).length;
  const pct=ids.length?Math.round(passed/ids.length*100):0;
  $("#meterBar i").style.width=pct+"%";
  $("#meterBar").setAttribute("aria-valuenow",String(pct));
  $("#mCount").textContent=`${passed} / ${ids.length} objectives · ${pct}%`;
  $("#mPhase").textContent = ids.length&&passed===ids.length ? "Custody certified" : "Audit in progress";
  BENCHES.forEach(b=>updateBenchState(b.id));
}
function advancePointer(skip){
  const banner=$("#curBanner");
  if(S.mode!=="medium"){ banner.style.display="none"; return; }
  const ids=objsFor("medium");
  const open=ids.filter(id=>!(S.obj[id]&&S.obj[id].pass));
  if(!open.length){ banner.style.display="none"; return; }
  let target=open[0];
  if(skip&&S.curObj&&S.curObj!==target){
    const i=ids.indexOf(S.curObj);
    for(let k=1;k<=ids.length;k++){ const c=ids[(i+k)%ids.length]; if(!(S.obj[c]&&S.obj[c].pass)){ target=c; break; } }
  }
  S.curObj=target;
  banner.style.display="flex";
  $("#curTitle").textContent=`${target.toUpperCase()} — ${OBJ[target].title}`;
}
