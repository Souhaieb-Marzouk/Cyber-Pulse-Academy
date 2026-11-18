/* ============================================================================
   APP — bootstrap: mode selection, briefing, event wiring, screen routing.
   Loaded LAST: re-hooks progress refresh, then calls boot(). */
function boot(){
  buildGlossary();
  const saved=load();
  if(saved && saved.mode && saved.started){ state=saved; }
  else { state=freshState(); }
  rebuildDockObj();
  document.getElementById("pick-medium").addEventListener("click",()=>chooseMode("medium"));
  document.getElementById("pick-hard").addEventListener("click",()=>chooseMode("hard"));
  document.getElementById("brief-go").addEventListener("click",()=>startApp());
  document.getElementById("brief-back").addEventListener("click",()=>{ document.getElementById("screen-brief").classList.add("hidden"); document.getElementById("screen-mode").classList.remove("hidden"); });
  document.getElementById("btn-reset").addEventListener("click",openReset);
  document.getElementById("btn-finish").addEventListener("click",openCompletion);
  document.querySelectorAll("#docklist button").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  if(state.mode && state.started){ enterApp(true); }
  else if(state.mode){ document.getElementById("screen-mode").classList.add("hidden"); document.getElementById("screen-brief").classList.remove("hidden"); document.getElementById("brief-mode-tag").textContent = state.mode==="hard"?"Hard — solo night run":"Medium — guided day shift"; }
}

function chooseMode(m){
  state=freshState(); state.mode=m; queueSave();
  document.getElementById("screen-mode").classList.add("hidden");
  document.getElementById("screen-brief").classList.remove("hidden");
  document.getElementById("brief-mode-tag").textContent = m==="hard"?"Hard — solo night run":"Medium — guided day shift";
}

function startApp(){ state.started=true; queueSave(); enterApp(false); }

function enterApp(resume){
  document.getElementById("screen-mode").classList.add("hidden");
  document.getElementById("screen-brief").classList.add("hidden");
  document.getElementById("screen-app").classList.remove("hidden");
  const mn=document.getElementById("mode-note");
  mn.innerHTML = state.mode==="hard"
    ? "<b>Night run rules:</b> strict checking, noisy evidence, no where-to-look. One nudge per objective — each costs score."
    : "<b>Day shift rules:</b> docks unlock in order. Hints are free to open (they cost stars, never progress). Every check teaches.";
  document.getElementById("quiz-sub").textContent = state.mode==="hard"
    ? "7 scenario items. They require application, not recall — every answer gets a justification."
    : "6 concept questions. Every answer gets an explanation — the Inspection teaches even when you miss.";
  buildTracker();
  renderBinder(); renderDock1(); renderDock2(); renderDock3(); renderDock4(); renderDock5(); renderQuiz(); renderDebrief();
  rebuildDockObj(); updateUnlock();
  showView(resume && state.view ? state.view : (nextTarget()||"binder"));
  updateProgress(); refreshTracker(); save();
}
document.addEventListener("click",e=>{
  const hint=e.target.closest("[data-hint]");
  if(hint){ onHintClick(hint); return; }
  const nudge=e.target.closest("[data-nudge]");
  if(nudge){ onNudgeClick(nudge); return; }
  const gotob=e.target.closest("[data-goto]");
  if(gotob){ showView(gotob.dataset.goto); return; }
});

const _origUpdateProgress=updateProgress;
updateProgress=function(){ _origUpdateProgress(); refreshNextButtons(); };

/* ---- go ---- */
boot();
