/* ================= BOOT — wiring & init ================= */

function renderYard(){
  document.body.dataset.mode = S.mode || "";
  renderYardHead();
  renderClipboard();
  renderNotices();
  renderDepot();
  renderBench();
  renderGateZone();
  renderLedger();
  renderCore();
  renderQuiz();
}

/* static event wiring — runs ONCE per page load */
function wireStaticEvents(){
  /* mode gate */
  $("#pick-medium").addEventListener("click", () => startMode("medium"));
  $("#pick-hard").addEventListener("click", () => startMode("hard"));
  $("#resume-btn").addEventListener("click", () => {
    const saved = loadSaved();
    if(saved){ S = saved; enterYard(); }
  });
  $("#fresh-btn").addEventListener("click", () => {
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    S = defaultState();
    renderGate();
    toast("Saved shift discarded — pick a shift below.");
  });
  $("#back-gate").addEventListener("click", () => { S.screen = "gate"; save(); showScreen("gate"); renderGate(); });
  $("#begin-shift").addEventListener("click", () => { S.briefingSeen = true; enterYard(); });

  /* clipboard delegation */
  $("#wo-list").addEventListener("click", ev => {
    const chk = ev.target.closest("[data-check]");
    if(chk){ runCheck(chk.dataset.check); return; }
    const hint = ev.target.closest(".hint-btn");
    if(hint){ showHint(hint.dataset.obj); return; }
    const zj = ev.target.closest(".zone-jump");
    if(zj){ jumpToZone(zj.dataset.zone); return; }
  });

  /* mobile clipboard toggle */
  $("#clip-fab").addEventListener("click", () => {
    const cl = $("#clipboard");
    const open = cl.classList.toggle("open");
    $("#clip-fab").setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", ev => {
    const cl = $("#clipboard");
    if(cl && cl.classList.contains("open") && window.innerWidth <= 980 &&
       !ev.target.closest("#clipboard") && !ev.target.closest("#clip-fab")){
      cl.classList.remove("open");
      $("#clip-fab").setAttribute("aria-expanded","false");
    }
  });

  /* quiz delegation (single listener) */
  $("#quiz-body").addEventListener("change", handleQuizChange);

  /* toast close affordance (R7) */
  $("#toast-close").addEventListener("click", hideToast);

  /* manifest */
  $("#manifest-btn").addEventListener("click", () => {
    renderManifest();
    $("#manifest-backdrop").classList.remove("hidden");
    $("#manifest-close").focus();
    announce("Shipping manifest opened.");
  });
  $("#manifest-close").addEventListener("click", () => {
    $("#manifest-backdrop").classList.add("hidden");
    $("#manifest-btn").focus();
  });
  $("#manifest-backdrop").addEventListener("click", ev => {
    if(ev.target === $("#manifest-backdrop")) $("#manifest-backdrop").classList.add("hidden");
  });

  /* reset */
  $("#reset-btn").addEventListener("click", () => {
    $("#reset-backdrop").classList.remove("hidden");
    $("#reset-confirm").focus();
  });
  $("#reset-cancel").addEventListener("click", () => {
    $("#reset-backdrop").classList.add("hidden");
    $("#reset-btn").focus();
  });
  $("#reset-confirm").addEventListener("click", doReset);
  $("#reset-backdrop").addEventListener("click", ev => {
    if(ev.target === $("#reset-backdrop")) $("#reset-backdrop").classList.add("hidden");
  });

  /* escape closes modals / mobile clipboard */
  document.addEventListener("keydown", ev => {
    if(ev.key === "Escape"){
      if(!$("#manifest-backdrop").classList.contains("hidden")){
        $("#manifest-backdrop").classList.add("hidden"); $("#manifest-btn").focus();
      }
      if(!$("#reset-backdrop").classList.contains("hidden")){
        $("#reset-backdrop").classList.add("hidden"); $("#reset-btn").focus();
      }
      const cl = $("#clipboard");
      if(cl.classList.contains("open")){ cl.classList.remove("open"); }
      /* glossary tooltip behaves as a popover — ESC must dismiss it (R7) */
      const ae = document.activeElement;
      if(ae && ae.classList && ae.classList.contains("g-term")){ ae.blur(); }
    }
  });
}

function boot(){
  const saved = loadSaved();
  S = (saved && saved.v === 1 && saved.mode) ? saved : defaultState();
  const firstWo = S.mode === "hard" ? "H1" : "M1";
  if(!S.wo || !S.wo[firstWo]){
    S.wo = freshWoList();
  }
  wireStaticEvents();
  if(S.screen === "yard" && S.mode){
    enterYard();
    toast("Welcome back — your shift resumed exactly where you left it.");
  } else if(S.screen === "briefing" && S.mode){
    showScreen("briefing");
    renderBriefing();
  } else {
    S.screen = "gate";
    showScreen("gate");
    renderGate();
  }
}

document.addEventListener("DOMContentLoaded", boot);
