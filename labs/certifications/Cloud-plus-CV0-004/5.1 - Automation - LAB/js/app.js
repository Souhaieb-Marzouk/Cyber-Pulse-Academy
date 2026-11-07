/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/app.js — event delegation, completion modal, reset, bootstrap/init

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
/* ===== EVENT DELEGATION ===== */
/* ================= EVENT DELEGATION ================= */
document.addEventListener("click", (e) => {
  if(e.target.id==="modal" && S && $("modal").classList.contains("show")){ closeModal(); return; }
  const t = e.target.closest("button, .socket");
  if(!t) return;
  /* --- widget controls --- */
  const w = t.dataset.w;
  if(w){
    const f = findWidget(w); if(!f) return;
    const st = getE(w);
    if(t.classList.contains("bkt")){
      const i = t.dataset.i, b = t.dataset.b;
      st.sel = st.sel || {};
      st.sel[i] = (st.sel[i]===b ? "" : b);
      _focus = `.bkt[data-w="${w}"][data-i="${i}"][data-b="${b}"]`; refreshWidget(w); save(); return;
    }
    if(t.classList.contains("chip")){
      const c = t.dataset.c;
      st.place = st.place || {}; st.picked = st.picked || "";
      const placedOn = Object.keys(st.place).find(k => st.place[k]===c);
      if(placedOn){ delete st.place[placedOn]; st.picked = ""; }
      else st.picked = (st.picked===c ? "" : c);
      _focus = `.chip[data-w="${w}"][data-c="${c}"]`; refreshWidget(w); save(); return;
    }
    if(t.classList.contains("socket") || t.dataset.s!==undefined){
      const s = t.dataset.s;
      st.place = st.place || {}; st.picked = st.picked || "";
      if(st.picked){ st.place[s] = st.picked; st.picked = ""; }
      else if(st.place[s]){ delete st.place[s]; }
      _focus = `.socket[data-w="${w}"][data-s="${s}"]`; refreshWidget(w); save(); return;
    }
    if(t.classList.contains("seqItem")){
      const i = t.dataset.i;
      st.order = st.order || [];
      if(!st.order.includes(i)) st.order.push(i);
      _focus = `.seqItem[data-w="${w}"][data-i="${i}"]`; refreshWidget(w); save(); return;
    }
    if(t.dataset.rm){
      st.order = (st.order||[]).filter(x => x!==t.dataset.rm);
      _focus = `.seqItem[data-w="${w}"][data-i="${t.dataset.rm}"]`; refreshWidget(w); save(); return;
    }
    if(t.dataset.clear){ st.order = []; refreshWidget(w); save(); return; }
    if(t.classList.contains("opt") || t.dataset.o!==undefined){
      const o = t.dataset.o;
      st.sel = st.sel || [];
      if(f.w.multi){ st.sel = st.sel.includes(o) ? st.sel.filter(x=>x!==o) : st.sel.concat(o); }
      else st.sel = (st.sel[0]===o ? [] : [o]);
      _focus = `.opt[data-w="${w}"][data-o="${o}"]`; refreshWidget(w); save(); return;
    }
    if(t.classList.contains("flagBtn")){
      const fl = t.dataset.f;
      st.flagged = st.flagged || [];
      st.flagged = st.flagged.includes(fl) ? st.flagged.filter(x=>x!==fl) : st.flagged.concat(fl);
      _focus = `.flagBtn[data-w="${w}"][data-f="${fl}"]`; refreshWidget(w); save(); return;
    }
    if(t.dataset.l){
      st.picked = (st.picked===t.dataset.l ? "" : t.dataset.l);
      _focus = `.logline[data-w="${w}"][data-l="${t.dataset.l}"]`; refreshWidget(w); save(); return;
    }
    if(t.dataset.m){
      const id = t.dataset.m;
      if(f.w.type==="mark"){
        st.converged = true;
        const stateEl = $("drift-"+w+"-state");
        if(stateEl) stateEl.textContent = "CONVERGED — live state now matches the code of record.";
        t.disabled = true;
        announce("Re-apply complete. The inspector's live column now matches the desired state.");
      } else {
        st.log = st.log || [];
        st.log.push(id);
        if(f.wodef.hook) f.wodef.hook(w, st.log.slice());
      }
      save(); return;
    }
    if(t.dataset.mreset){ st.log = []; if(f.wodef.hook) f.wodef.hook(w, []); save(); return; }
    return;
  }
  /* --- lab controls --- */
  if(t.dataset.qi!==undefined){ quizAnswer(+t.dataset.qi, +t.dataset.oi); return; }
  if(t.dataset.stamp){ stamp(t.dataset.stamp); return; }
  if(t.dataset.hint){ useHint(t.dataset.hint); return; }
  if(t.dataset.cvdot){ jumpTo(t.dataset.cvdot); return; }
  if(t.dataset.st || t.dataset.oid){ jumpTo(t.dataset.st || stationOf(t.dataset.oid)); return; }
  if(t.id==="btnQuizFinish"){ finishQuiz(); return; }
  if(t.id==="btnModalClose"){ closeModal(); return; }
  if(t.id==="btnModalReport"){ $("modal").classList.remove("show"); jumpTo("sec-debrief"); return; }
  if(t.id==="btnDrawer"){ const d = $("drawer"); const open = d.classList.toggle("open"); t.setAttribute("aria-expanded", open?"true":"false"); return; }
  if(t.id==="btnReset"){ resetLab(t); return; }
  if(t.dataset.plaque!==undefined){ openModal(); return; }
});
document.addEventListener("keydown", (e) => {
  if(e.key==="Escape"){
    if(S && $("modal").classList.contains("show")){ closeModal(); return; }
    const d = $("drawer");
    if(d && d.classList.contains("open")){ d.classList.remove("open"); const b=$("btnDrawer"); if(b) b.setAttribute("aria-expanded","false"); }
    return;
  }
  if(e.target && /^(button|input|textarea|select|a)$/i.test(e.target.tagName)){
    if((e.key==="Enter"||e.key===" ") && e.target.classList.contains("socket")){ e.preventDefault(); e.target.click(); return; }
    if(e.key!=="[" && e.key!=="]" && e.key.toLowerCase()!=="o") return;
  }
  if(!S || !S.mode) return;
  if(e.key==="[" || e.key==="]"){ e.preventDefault(); stepStation(e.key==="]"?1:-1); }
  else if(e.key.toLowerCase()==="o"){ const d=$("drawer"); if(d) { const open=d.classList.toggle("open"); $("btnDrawer").setAttribute("aria-expanded", open?"true":"false"); } }
});

/* ===== COMPLETION (C7) ===== */
/* ================= COMPLETION (C7) ================= */
function computeStars(){
  const objs = WOS(); const n = objs.length;
  const firstTry = objs.filter(o=>S.obj[o.obj]&&(S.attempts[o.obj]||0)===1).length;
  const hints = Object.values(S.hints).reduce((a,b)=>a+b,0);
  const pct = firstTry/n;
  return (pct>=0.9 && hints<=3) ? 3 : (pct>=0.7 || hints<=8) ? 2 : 1;
}
function maybeComplete(){
  const allDone = WOS().every(o=>S.obj[o.obj]&&S.obj[o.obj].done);
  if(allDone && S.quiz.done && !S.completed){
    S.completed = true; S.stars = computeStars(); save();
    renderQuiz();
    openModal();
  }
}
function openModal(){
  const objs = WOS(); const n = objs.length;
  const firstTry = objs.filter(o=>S.obj[o.obj]&&(S.attempts[o.obj]||0)===1).length;
  const hints = Object.values(S.hints).reduce((a,b)=>a+b,0);
  const qs = QUIZ[S.mode];
  $("starsRow").innerHTML = [1,2,3].map(i=>STAR_SVG.replace('class="star"', `class="star ${i<=S.stars?"lit":""}"`)).join("");
  $("starsRow").setAttribute("aria-label", `${S.stars} of 3 stars`);
  $("scoreBig").textContent = `${n}/${n} WORK ORDERS STAMPED`;
  $("modalSub").textContent = `${S.mode==="hard"?"Night Shift":"Day Shift"} · quiz ${S.quiz.score}/${qs.length} · hints used ${hints} · first-attempt passes ${firstTry}/${n}`;
  const groups = [["P1","UNDERSTAND — what & why"],["P2","RECOGNIZE — spot it in evidence"],["P3","DETECT — read the telemetry"],["P4","MITIGATE — guardrail it"],["SYN","CAPSTONE — the full shift"]];
  $("recapBox").innerHTML = groups.map(([p,label]) => {
    const items = objs.filter(o=>o.pillarShort===p);
    if(!items.length) return "";
    return `<div class="pillarRow"><h4>${label}</h4><div class="pill2">${items.map(o=>`<span class="tag ${S.obj[o.obj]?"teal":"red"}">${esc(o.obj)} ${esc(o.short)}</span>`).join("")}</div></div>`;
  }).join("");
  const weak = [];
  QUIZ[S.mode].forEach((q,qi)=>{ if(S.quiz.ans[qi]!==undefined && S.quiz.ans[qi]!==q.correct) weak.push(`Quiz Q${qi+1} — ${q.focus}: rework this item and reread its explanation.`); });
  objs.forEach(o=>{
    const att = S.attempts[o.obj]||0, hint = S.hints[o.obj]||0;
    if(att>1) weak.push(`${o.obj} — ${o.short}: took ${att} stamps; redo it cold from the work-order ticket.`);
    else if(hint>0) weak.push(`${o.obj} — ${o.short}: solved with hints; rerun it without them.`);
  });
  if(!weak.length) weak.push("Clean shift — every work order first-attempt, no hints, full quiz. Keep the habits and move to the next lesson.");
  $("focusBox").innerHTML = `<h4>Focus areas — study these next</h4><ul class="focusList">${weak.slice(0,6).map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`;
  $("modal").classList.add("show");
  $("btnModalClose").focus();
}
function closeModal(){
  $("modal").classList.remove("show");
  const back = $("btnPlaque");
  if(back) back.focus(); else jumpTo("sec-quiz");
}

/* ===== RESET (two-step confirm) ===== */
/* ================= RESET (two-step confirm) ================= */
let resetTimer = null;
function resetLab(btn){
  if(btn.dataset.armed){
    clearTimeout(resetTimer);
    try{ localStorage.removeItem(LSKEY); }catch(e){}
    location.reload();
    return;
  }
  btn.dataset.armed = "1";
  btn.innerHTML = "CONFIRM RESET?";
  btn.style.borderColor = "var(--red)"; btn.style.color = "#ffb9af";
  announce("Press reset again within five seconds to wipe all progress.");
  resetTimer = setTimeout(()=>{ delete btn.dataset.armed; btn.innerHTML = 'Reset'; btn.style.borderColor = ""; btn.style.color = ""; }, 5000);
}

/* ===== MODE ENTER / INIT ===== */
/* ================= MODE ENTER / INIT ================= */
function enterLab(){
  $("modeSelect").classList.add("hidden");
  $("lab").classList.remove("hidden");
  renderAll();
  announce(S.mode==="hard" ? "Night Shift started. All stations are open and the evidence is noisy. Nine deep work orders await." : "Day Shift started. Station 01, the Receiving Dock, is unlocked. Work through the stations in order.");
  jumpTo("sec-brief");
}
function renderAll(){ renderStations(); updateStats(); renderQuiz(); }
function renderStations(){
  STATION_ORDER.forEach(s => {
    const host = $("st"+s.sid.slice(-2)+"Body");
    if(host) host.innerHTML = stationObjs(s.sid).map(renderWO).join("");
  });
  WOS().forEach(w => {
    const mw = w.widgets.find(x=>x.type==="machine");
    if(mw && w.hook){ const log = getE(mw.key).log||[]; if(log.length) w.hook(mw.key, log.slice()); }
  });
}

/* ===== INIT ===== */
/* ================= INIT ================= */
(function initLab(){
  const g = $("glossaryList");
  if(g) g.innerHTML = GLOSSARY.map(t=>`<div class="kv"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></div>`).join("");
  $("btnDay").addEventListener("click", ()=>{ S = freshState("medium"); save(); enterLab(); });
  $("btnNight").addEventListener("click", ()=>{ S = freshState("hard"); save(); enterLab(); });
  const saved = loadState();
  if(saved && saved.mode && saved.v===1){
    S = saved;
    if(!S.env) S.env = {}; if(!S.skip) S.skip = {};
    enterLab();
  }
})();
