/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Bench event wiring, init()/boot, popups, keyboard shortcuts.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

function bindBench(){
  const bindSel=(id,key)=>{ const el=$("#"+id); if(!el) return;
    el.value=state.bench[key]||"";
    el.addEventListener("change",()=>{ state.bench[key]=el.value; save(); }); };
  ["m7vlan","m7cause","m9control","m9reason","h2domains","h2recipients","h2crosses","h2reach","h3v10","h3v20","h3v30","h5mode","h6reason","h10group","h10purpose"].forEach(id=>bindSel(id,id));
  bindSel("h3peak","h3peak");
  bindSel("thrSel","h4thr"); bindSel("winSel","h4win");
  bindSel("ndAnswer","m11");
  // H7 checkboxes
  $$("#h7stmts input").forEach(cb=>{
    cb.checked=!!(state.bench.h7&&state.bench.h7[cb.value]);
    cb.addEventListener("change",()=>{ state.bench.h7=state.bench.h7||{};
      if(cb.checked) state.bench.h7[cb.value]=true; else delete state.bench.h7[cb.value]; save(); });
  });
  // H8 options
  $$("select[data-h8]").forEach(sel=>{
    sel.innerHTML=opt("","— choose —",state.bench[sel.id])+H8_OPTIONS.map(o=>opt(o.v,o.t)).join("");
    sel.value=state.bench[sel.id]||"";
    sel.addEventListener("change",()=>{ state.bench[sel.id]=sel.value; save(); });
  });
  // H9 rows — display order must not correlate with the answer order (a plain
  // reversal would hand the sequence over step by step), so use a fixed neutral shuffle.
  const h9display=["segment","monitor","stormctl","snooping","stop-loop"];
  $("#h9rows").innerHTML=[0,1,2,3,4].map(i=>`
    <div class="frow" style="margin:.3rem 0"><div class="field" style="flex:.5"><label>Step ${i+1}</label></div>
    <div class="field" style="flex:3"><select data-h9="${i}" aria-label="Action for step ${i+1}">
      ${opt("","— pick the action —",(state.bench.h9order||[])[i])}
      ${h9display.map(id=>opt(id,RUNBOOK.find(r=>r.id===id).t)).join("")}
    </select></div></div>`).join("");
  $$("select[data-h9]").forEach(sel=>sel.addEventListener("change",()=>{
    const arr=state.bench.h9order||[]; arr[parseInt(sel.dataset.h9,10)]=sel.value;
    state.bench.h9order=arr; save();
  }));
  $("#h9apply").addEventListener("click",()=>{
    const got=state.bench.h9order||[]; const want=RUNBOOK.map(r=>r.id);
    const okSel=got.length===5&&got.every(v=>v)&&want.every((id,i)=>got[i]===id);
    if(okSel){
      state.env.snoopingSW1=true; state.env.snoopingSW2=true; state.env.querier=true; state.env.stormCtrl=true;
      state.noc.hardApplied=true;
      state.env.flagIndex["querier"]=state.env.history.length;
      renderPlates(); save();
      $("#h9state").innerHTML=`<span style="color:var(--moss)">Runbook applied — snooping SW1/SW2, querier and storm control are ON. Now re-run the monitored window in the meter room and confirm the counters normalized.</span>`;
      announce("Runbook applied. Re-run the meter room window.");
    } else {
      $("#h9state").innerHTML=`<span style="color:var(--red)">Order is not exact yet — runbook NOT applied. Stop the cause before stabilizing; stabilize before restructuring; restructure before instrumenting.</span>`;
    }
  });
  $("#h4Test").addEventListener("click",testH4);
  $("#dayBtnA").addEventListener("click",()=>renderCharts($("#dayCharts"),NOC_DAYS.A,"Day A ·"));
  $("#dayBtnB").addEventListener("click",()=>renderCharts($("#dayCharts"),NOC_DAYS.B,"Day B ·"));
  $("#dayBtnC").addEventListener("click",()=>renderCharts($("#dayCharts"),NOC_DAYS.C,"Day C ·"));
}

/* ---------- quiz ---------- */
/* ================================================================
   PART 5 — INIT & WIRING
   ================================================================ */
function init(){
  load();
  renderGlossary(); buildInstrKey();
  renderComposer(); renderPlates(); renderGroups(); renderEdges(); bindBench();

  /* masthead */
  $("#shiftPlate").addEventListener("click", openModeOverlay);
  const modalOpeners={};
  // one close path for every popup: X / Cancel / Esc / backdrop click all work,
  // and focus returns to whichever control opened the popup
  const openModal=(id,opener)=>{ modalOpeners[id]=opener||document.activeElement; $("#"+id).hidden=false;
    const f=$("#"+id).querySelector("[data-autofocus]") || $("#"+id).querySelector("button:not([disabled])"); if(f) f.focus(); };
  const closeModal=id=>{ $("#"+id).hidden=true; let op=modalOpeners[id];
    if(op && !document.contains(op)) op=null;
    if(!op && id==="certModal") op=document.getElementById("certBtn");
    if(op) op.focus(); modalOpeners[id]=null; };
  $("#glossBtn").addEventListener("click", e=>openModal("glossModal",e.currentTarget));
  $("#glossBtn2").addEventListener("click", e=>openModal("glossModal",e.currentTarget));
  $("#glossClose").addEventListener("click", ()=>closeModal("glossModal"));
  $("#certClose").addEventListener("click", ()=>closeModal("certModal"));
  $("#resetBtn").addEventListener("click", e=>openModal("resetModal",e.currentTarget));
  $("#resetYes").addEventListener("click", ()=>{ try{ localStorage.removeItem(LAB_KEY); }catch(e){} location.reload(); });
  $("#resetNo").addEventListener("click", ()=>closeModal("resetModal"));
  ["certModal","glossModal","resetModal"].forEach(id=>{
    $("#"+id).addEventListener("click", e=>{ if(e.target===e.currentTarget) closeModal(id); });
  });
  /* certificate button lives in the masthead and is gated on full completion */
  const certBtn=document.createElement("button");
  certBtn.className="ghostbtn"; certBtn.id="certBtn"; certBtn.textContent="🎓 Certificate"; certBtn.hidden=true;
  certBtn.addEventListener("click", ()=>{ openCert(); });
  $(".mast-in").insertBefore(certBtn, $("#resetBtn"));

  /* mode overlay */
  $$("[data-pickmode]").forEach(b=>b.addEventListener("click", ()=>pickMode(b.dataset.pickmode)));

  /* composer */
  $("#srcSel").addEventListener("change", ()=>{ refreshDest(); });
  $("#ipVerSel").addEventListener("change", ()=>{ refreshDest(); });
  $$('input[name="dmode"]').forEach(r=>r.addEventListener("change", ()=>{ refreshDest(); }));
  $("#dispatchBtn").addEventListener("click", doDispatch);

  /* meter room + quiz */
  $("#runBtn").addEventListener("click", runWindow);
  $("#quizSubmit").addEventListener("click", submitQuiz);

  /* work-order drawer */
  $("#drawerBtn").addEventListener("click", ()=>{ $("#drawerSheet").classList.add("open"); });
  $$("[data-close-drawer]").forEach(el=>el.addEventListener("click", ()=>{ $("#drawerSheet").classList.remove("open"); }));

  /* instructor answer-key gate */
  $("#instrUnlock").addEventListener("click", ()=>{
    const v=$("#instrPass").value.trim().toUpperCase();
    if(v==="INSTRUCTOR"){ $("#instrKey").classList.remove("vis-hidden"); announce("Instructor key unlocked."); }
    else { announce("Wrong gate phrase."); }
  });

  /* glossary inline terms — open the dictionary AND jump to the term */
  document.addEventListener("click", e=>{
    const t=e.target.closest(".glossterm");
    if(t){ openModal("glossModal", t);
      const g=t.dataset.g;
      if(g){ const dt=$$("#glossList dt").find(d=>d.textContent.trim().startsWith(g));
        if(dt){ setTimeout(()=>{ dt.scrollIntoView({block:"center"}); dt.style.background="var(--brassbg)";
          setTimeout(()=>{ dt.style.background=""; },1600); },60); } } }
  });

  /* keyboard: 1-8 stations, o = work orders drawer, Esc closes overlays */
  document.addEventListener("keydown", e=>{
    const tag=(e.target.tagName||"").toLowerCase();
    if(tag==="input"||tag==="select"||tag==="textarea") return;
    if(e.key==="Escape"){
      ["certModal","glossModal","resetModal"].forEach(id=>{ const el=$("#"+id); if(el&&!el.hidden) closeModal(id); });
      $("#drawerSheet").classList.remove("open");
      return;
    }
    if(e.altKey||e.ctrlKey||e.metaKey) return;
    if(e.key>="1"&&e.key<="8"&&state.mode){ showStation(STATIONS[parseInt(e.key,10)-1].id); }
    else if(e.key==="o"&&state.mode){ $("#drawerSheet").classList.toggle("open"); }
  });

  /* resume or first-run overlay */
  if(state.mode){ $("#modeOverlay").hidden=true; applyMode(); showStation(state.seen.lastStation||"briefing"); }
  else { openModeOverlay(); }
  if(!state.lsOk){ announce("Note: this browser blocks local storage, so progress will not persist."); }
  updateMeter();
  renderBoard();
  const ld=lastD(state);
  if(ld){ renderDelivery(ld); $("#lastVerdict").innerHTML='<span class="stamp '+ld.vclass+'">'+esc(ld.verdict)+'</span>'; }
}
init();
