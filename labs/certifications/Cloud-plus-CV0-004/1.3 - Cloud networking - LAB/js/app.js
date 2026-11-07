/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* Bootstrap: load-or-pristine state, renderAll, event wiring (board, tabs, header buttons, ESC, backdrops, toast) */
/* ---------- render all + init ---------- */
function renderAll(){
  renderTitle(); renderBrief(); renderCanvas(); renderInspector(); renderTasks(); renderDrawer();
  switchTab(S.ui.tab || "traffic");
}
function init(){
  const saved = load();
  if(saved){ S = saved; }
  else { S = {mode:null, world:pristineWorld(), objs:{}, quiz:{i:0, answers:[], done:false}, ui:{sel:null, tab:"traffic"}, finished:false}; }
  renderAll();
  if(!S.mode) openGate();
  // canvas interactions (delegated)
  $id("board").addEventListener("click", e => {
    const g = e.target.closest("[data-node]");
    S.ui.sel = g ? g.dataset.node : null;
    save(); renderCanvas(); renderInspector();
    if(g){ const n = N[g.dataset.node]; announce("Selected "+n.label+": "+nodeStatus(g.dataset.node).sub); }
  });
  $id("board").addEventListener("keydown", e => {
    if(e.key === "Enter" || e.key === " "){
      const g = e.target.closest("[data-node]");
      if(g){ e.preventDefault(); S.ui.sel = g.dataset.node; save(); renderCanvas(); renderInspector(); }
    }
  });
  // drawer tabs
  [["tabTraffic","traffic"],["tabReq","req"],["tabAlerts","alerts"],["tabLogs","logs"]].forEach(([tid, name]) =>
    $id(tid).addEventListener("click", () => switchTab(name)));
  // header buttons
  $id("btnGlossary").addEventListener("click", openGlossary);
  $id("btnNotes").addEventListener("click", openNotes);
  $id("btnReset").addEventListener("click", () => confirmDialog("Reset the sheet?", "This wipes all progress, configuration and quiz results for this mode and re-inks the board to its starting state.", "Reset", () => { setMode(S.mode, true); toast("Sheet reset to pristine state"); }));
  $id("btnSwitch").addEventListener("click", () => confirmDialog("Switch mode?", "Switching between Medium and Hard rebuilds the board for that mode and resets its progress.", "Switch", () => setMode(S.mode === "M" ? "H" : "M", true)));
  $id("btnDrawer").addEventListener("click", () => {
    drawerCollapsed = !drawerCollapsed;
    applyDrawerState();
  });
  // escape closes the topmost (visually last-open) overlay; backdrop click closes dismissable modals
  document.addEventListener("keydown", e => {
    if(e.key !== "Escape") return;
    closeTopOvl();
  });
  ["ovlQuiz","ovlDone","ovlNotes","ovlGloss"].forEach(id => $id(id).addEventListener("click", e => {
    if(e.target && e.target.id === id){ e.currentTarget.classList.remove("on"); restoreFocus(); }
  }));
  // toast close affordance (button re-created per toast, so delegate)
  $id("toast").addEventListener("click", e => {
    if(e.target && e.target.closest && e.target.closest("button")) $id("toast").style.display = "none";
  });
}
init();
