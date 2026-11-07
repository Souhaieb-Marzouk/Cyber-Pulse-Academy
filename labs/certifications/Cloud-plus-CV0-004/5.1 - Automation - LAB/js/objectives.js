/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/objectives.js — work-order engine: render, CHECK RESULTS, hints, unlock, tracker

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
/* ===== WORK-ORDER RENDERING + CHECK PIPELINE ===== */
/* ================= WORK-ORDER RENDERING + CHECK PIPELINE ================= */
function renderWO(wodef){
  const done = S.obj[wodef.obj] && S.obj[wodef.obj].done;
  const attempts = S.attempts[wodef.obj] || 0;
  const hintsUsed = S.hints[wodef.obj] || 0;
  const maxHints = wodef.hints.length;
  const body = wodef.widgets.map(w => `<div data-widget="${w.key}">${ENGINES[w.type](w)}</div>`).join("");
  const hintLines = wodef.hints.slice(0, hintsUsed).map((h,i)=>`<div class="hintLine"><b>Hint ${i+1}/${maxHints}:</b> ${esc(h)}</div>`).join("");
  const hintBtnLabel = (S.mode==="hard" ? "PAID NUDGE" : (hintsUsed>=maxHints ? "HINTS USED" : `HINT (${hintsUsed}/${maxHints})`));
  return `<div class="wo ${done?"done":""}" id="wo-${wodef.obj}">
    <div class="woHead"><span class="woNo">${esc(wodef.no)}</span><span class="woTitle">${esc(wodef.title)}</span>
      <div class="woChips"><span class="tag outline">${esc(wodef.obj)}</span><span class="tag">${esc(wodef.pillar)}</span></div></div>
    <p class="woBrief">${wodef.brief}</p>
    <div class="woBody">${body}</div>
    <div class="woActions">
      <button type="button" class="stampBtn ${done?"passed":""}" data-stamp="${wodef.obj}">${done?"PASSED ✓":"STAMP RESULTS"}</button>
      <button type="button" class="ghostBtn" data-hint="${wodef.obj}" ${hintsUsed>=maxHints?"disabled":""}>${hintBtnLabel}</button>
      ${attempts?`<span class="tag ${done?"teal":"red"}">attempts: ${attempts}</span>`:""}
    </div>
    <div class="fb" data-fb="${wodef.obj}" role="status"></div>
    <div class="hintBox ${hintsUsed?"show":""}" data-hintbox="${wodef.obj}">${hintLines}</div>
  </div>`;
}
function showFB(obj, kind, html){
  const fb = document.querySelector(`[data-fb="${obj}"]`);
  if(fb){ fb.className = `fb show ${kind}`; fb.innerHTML = html; }
}
function stamp(objId){
  const wodef = WOS().find(w=>w.obj===objId);
  if(!wodef) return;
  const done = S.obj[objId] && S.obj[objId].done;
  if(done){ showFB(objId,"good", wodef.passMsg); announce("Work order already passed."); return; }
  S.attempts[objId] = (S.attempts[objId]||0) + 1;
  const res = wodef.check(S.env);
  if(res.pass){
    S.obj[objId] = { done:true };
    showFB(objId,"good", wodef.passMsg);
    announce(`Work order ${wodef.no} passed. ${wodef.short}`);
    const st = document.querySelector(`[data-stamp="${objId}"]`);
    if(st){ st.classList.add("passed"); st.textContent = "PASSED ✓"; }
    const wo = $("wo-"+objId); if(wo) wo.classList.add("done");
  } else {
    showFB(objId,"bad", res.msg);
    announce(`Work order ${wodef.no} not yet correct — see the ticket for teaching feedback.`);
  }
  // skip-ahead affordance (D5): after 2+ attempts on a station, foreman waves you through
  if(S.mode==="medium" && !res.pass){
    const idx = STATION_ORDER.indexOf(wodef.station);
    const stObjs = WOS().filter(w=>w.station===wodef.station).map(w=>w.obj);
    const eligible = stObjs.every(o => (S.attempts[o]||0) >= 2);
    if(eligible && !S.skip[wodef.station]){
      S.skip[wodef.station] = true;
      announce("The foreman waves you through — the next station is unlocked. You can come back and finish this work order.");
      showFB(objId,"info","The foreman waves you through: the <b>next station is unlocked</b> so you are never blocked. Come back and stamp this ticket when ready.");
    }
  }
  save(); renderAll();
  showFB(objId, res.pass ? "good" : "bad", res.pass ? wodef.passMsg : res.msg);
  if(!res.pass && S.mode==="medium" && S.skip[wodef.station])
    showFB(objId,"info","The foreman waves you through: the <b>next station is unlocked</b> so you are never blocked. Come back and stamp this ticket when ready.");
}
function useHint(objId){
  const wodef = WOS().find(w=>w.obj===objId);
  if(!wodef) return;
  const used = S.hints[objId] || 0;
  if(used >= wodef.hints.length) return;
  S.hints[objId] = used + 1;
  const box = document.querySelector(`[data-hintbox="${objId}"]`);
  if(box){ box.classList.add("show"); box.innerHTML = wodef.hints.slice(0, used+1).map((h,i)=>`<div class="hintLine"><b>Hint ${i+1}/${wodef.hints.length}:</b> ${esc(h)}</div>`).join(""); }
  const btn = document.querySelector(`[data-hint="${objId}"]`);
  if(btn){ btn.textContent = (S.mode==="hard" ? "PAID NUDGE USED" : (used+1>=wodef.hints.length ? "HINTS USED" : `HINT (${used+1}/${wodef.hints.length})`)); if(used+1>=wodef.hints.length) btn.disabled = true; }
  announce(`Hint ${used+1} revealed for ${wodef.no}. Hints reduce the final star rating but never block progress.`);
  save(); updateStats();
}

/* ===== NAVIGATION / UNLOCK ===== */
/* ================= NAVIGATION / UNLOCK ================= */
function stationOf(objId){ const w = WOS().find(x=>x.obj===objId); return w ? w.station : STATION_ORDER[0].sid; }
function stationObjs(sid){ return WOS().filter(w=>w.station===sid); }
function stationPassed(sid){ return stationObjs(sid).every(w => S.obj[w.obj] && S.obj[w.obj].done); }
function stationTried(sid){ return stationObjs(sid).every(w => (S.attempts[w.obj]||0) >= 2); }
function isUnlocked(i){
  if(S.mode!=="medium" || i===0) return true;
  for(let j=0;j<i;j++){ const sid = STATION_ORDER[j].sid; if(!stationPassed(sid) && !S.skip[sid]) return false; }
  return true;
}
function firstOpenIdx(){ for(let i=0;i<STATION_ORDER.length;i++){ if(isUnlocked(i) && !stationPassed(STATION_ORDER[i].sid)) return i; } return STATION_ORDER.length-1; }
function jumpTo(sid){ const el = document.getElementById(sid.startsWith("sec-") ? sid : "sec-"+sid); if(el){ el.scrollIntoView({behavior:"smooth", block:"start"}); } }
function stepStation(dir){
  const cur = firstOpenIdx();
  let i = cur;
  for(let k=0;k<STATION_ORDER.length;k++){ i = (i+dir+STATION_ORDER.length)%STATION_ORDER.length; if(isUnlocked(i)) break; }
  jumpTo(STATION_ORDER[i].sid);
}

/* ===== TRACKER / CONVEYOR / STATS ===== */
/* ================= TRACKER / CONVEYOR / STATS ================= */
function renderConveyor(){
  const c = $("conveyor"); if(!c) return;
  const curIdx = firstOpenIdx();
  c.innerHTML = STATION_ORDER.map((s,i) => {
    const unlocked = isUnlocked(i);
    const cls = ["cvDot", unlocked?"on":"lock", (i===curIdx && unlocked)?"cur":""].join(" ");
    const passed = stationPassed(s.sid);
    return `<button type="button" class="${cls}" data-cvdot="${s.sid}" aria-label="Station ${s.num} ${esc(s.name)} — ${passed?"passed":unlocked?"open":"locked"}">${s.num}</button><span class="cvLink" aria-hidden="true"></span>`;
  }).join("");
}
function renderTracker(){
  const objs = WOS();
  const doneCount = objs.filter(o=>S.obj[o.obj]&&S.obj[o.obj].done).length;
  const firstTry = objs.filter(o=>S.obj[o.obj]&&S.obj[o.obj].done&&(S.attempts[o.obj]||0)===1).length;
  const mk = (list) => { list.innerHTML = objs.map(o => {
    const d = S.obj[o.obj]&&S.obj[o.obj].done;
    return `<button type="button" class="objItem ${d?"done":""}" data-st="${stationOf(o.obj)}" data-oid="${o.obj}" role="listitem" title="${esc(o.short)}"><span class="oid">${esc(o.obj)}</span><span>${esc(o.short)}</span><span class="objPillar">${esc(o.pillarShort)}</span></button>`;
  }).join(""); };
  mk($("objList")); mk($("objListM"));
  const pct = objs.length ? Math.round(doneCount/objs.length*100) : 0;
  $("progBar").style.width = pct+"%"; $("progBarM").style.width = pct+"%";
  $("progLine").textContent = `${doneCount} of ${objs.length} stamped · ${firstTry} first-attempt`;
  $("progLineM").textContent = `${doneCount}/${objs.length}`;
}
function updateStats(){
  const objs = WOS();
  const doneCount = objs.filter(o=>S.obj[o.obj]&&S.obj[o.obj].done).length;
  const hints = Object.values(S.hints).reduce((a,b)=>a+b,0);
  $("statObj").innerHTML = `Work orders <b>${doneCount}/${objs.length}</b>`;
  $("statHints").innerHTML = `Hints <b>${hints}</b>`;
  $("modePill").textContent = S.mode==="hard" ? "NIGHT SHIFT" : "DAY SHIFT";
  STATION_ORDER.forEach(s => {
    const tag = $("st"+s.sid.slice(-2)+"Tag");
    if(tag){ const os = stationObjs(s.sid); tag.textContent = "WORK ORDER" + (os.length>1?"S":"") + ": " + os.map(o=>o.obj).join(" · "); }
    const sec = $("sec-"+s.sid); const lock = $("st"+s.sid.slice(-2)+"Lock");
    const i = STATION_ORDER.indexOf(s);
    if(sec) sec.classList.toggle("locked", !isUnlocked(i));
    if(lock){ lock.textContent = isUnlocked(i) ? "" : "LOCKED — pass the previous station first"; lock.classList.toggle("hidden", isUnlocked(i)); }
  });
  renderConveyor(); renderTracker();
}

/* ===== VALIDATION HELPERS ===== */
const seqOK   = (k,arr) => JSON.stringify(getE(k).order||[]) === JSON.stringify(arr);
const assignOK= (k,map) => Object.keys(map).every(s => (getE(k).place||{})[s] === map[s]) && Object.keys(getE(k).place||{}).length === Object.keys(map).length;
const pickOK  = (k,ids) => JSON.stringify((getE(k).sel||[]).slice().sort()) === JSON.stringify(ids.slice().sort());
const sortOK  = (k,map) => Object.keys(map).every(i => (getE(k).sel||{})[i] === map[i]);
const flagOK  = (k,ids) => JSON.stringify((getE(k).flagged||[]).slice().sort()) === JSON.stringify(ids.slice().sort());
const logOK   = (k,id)  => getE(k).picked === id;
const machOK  = (k,arr) => JSON.stringify(getE(k).log||[]) === JSON.stringify(arr);
