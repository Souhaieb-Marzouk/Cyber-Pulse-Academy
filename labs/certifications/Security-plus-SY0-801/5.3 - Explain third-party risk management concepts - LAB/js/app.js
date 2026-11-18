"use strict";
/* =========================================================================
   js/app.js — bootstrap and event wiring
   One delegated "change" listener (answers -> state.env + persistence),
   one delegated "click" listener (all buttons/phases/checks/overlays),
   one "keydown" listener (ESC closes dialogs). Boot: load persisted state
   and resume exactly, or show the mode selection screen.
   ========================================================================= */

/* ---------- Mode & chrome ---------- */
function showModeScreen(){
  document.body.classList.remove("in-lab");
  document.body.classList.remove("mode-medium");
  document.body.classList.remove("mode-hard");
  window.scrollTo(0,0);
}
function startMode(mode, isRestore){
  state.mode = mode;
  if (!isRestore) state.phase = mode === "medium" ? 1 : 1;
  document.body.classList.add("in-lab");
  document.body.classList.toggle("mode-medium", mode === "medium");
  document.body.classList.toggle("mode-hard", mode === "hard");
  $("mast-title").textContent = mode === "medium" ? "Vendor Risk Review Binder" : "Vendor Risk War Room";
  $("mast-sub").textContent = mode === "medium" ? "Q3 cycle · guided review · SY0-801 5.3" : "Peregrine incident · challenge desk · SY0-801 5.3";
  $("stat-mode").textContent = mode === "medium" ? "Medium" : "Hard";
  if (mode === "medium") renderRail();
  renderStage();
  renderLedger();
  updateStats();
  save();
  if (!isRestore) window.scrollTo(0,0);
}
function modeObjs(){ return state.mode === "medium" ? OBJ_MED.concat(OBJ_MED2) : OBJ_HARD; }
function phaseObjs(p){ return modeObjs().filter(function(o){ return o.phase === p; }); }

/* ---------- Event delegation ---------- */
document.addEventListener("change", function(ev){
  var t = ev.target;
  if (t && t.getAttribute){
    var key = t.getAttribute("data-env");
    if (key){
      if (t.type === "checkbox"){
        if (t.checked) state.env[key] = "on"; else delete state.env[key];
        var wrap = t.closest(".choice"); if (wrap) wrap.classList.toggle("checked", t.checked);
      } else {
        state.env[key] = t.value;
        if (t.name && t.name.indexOf("g_") === 0){
          var labels = document.querySelectorAll('input[name="'+t.name+'"]');
          for (var i=0;i<labels.length;i++){ var w = labels[i].closest(".choice"); if (w) w.classList.toggle("checked", labels[i].checked); }
        }
      }
      save();
    }
  }
});
document.addEventListener("click", function(ev){
  var t = ev.target;
  if (!t || !t.closest) return;
  var el;
  if ((el = t.closest("[data-mode-btn]"))) { startMode(el.getAttribute("data-mode-btn")); return; }
  if ((el = t.closest("#btn-mode-medium"))) { startMode("medium"); return; }
  if ((el = t.closest("#btn-mode-hard"))) { startMode("hard"); return; }
  if ((el = t.closest("[data-phase]"))) {
    state.phase = parseInt(el.getAttribute("data-phase"),10); save(); renderStage(); renderLedger(); updateStats(); window.scrollTo(0,0); return;
  }
  if ((el = t.closest("[data-goto-phase]"))) {
    state.phase = parseInt(el.getAttribute("data-goto-phase"),10); save(); renderStage(); renderLedger(); updateStats(); window.scrollTo(0,0); return;
  }
  if ((el = t.closest("[data-check]"))) { checkObjective(el.getAttribute("data-check")); return; }
  if ((el = t.closest("[data-hint]"))) { useHint(el.getAttribute("data-hint")); return; }
  if ((el = t.closest("[data-look]"))) { lookAt(el.getAttribute("data-look")); return; }
  if ((el = t.closest("[data-quiz-check]"))) { checkQuiz(el.getAttribute("data-quiz-check")); return; }
  if ((el = t.closest("[data-seq-add]"))) { seqAction("add", el.getAttribute("data-seq-add")); return; }
  if ((el = t.closest("[data-seq-up]"))) { seqAction("up", el.getAttribute("data-seq-up")); return; }
  if ((el = t.closest("[data-seq-down]"))) { seqAction("down", el.getAttribute("data-seq-down")); return; }
  if ((el = t.closest("[data-seq-remove]"))) { seqAction("remove", el.getAttribute("data-seq-remove")); return; }
  if ((el = t.closest("#btn-conclude"))) { conclude(); return; }
  if ((el = t.closest("#ledger-fab"))) {
    var led = $("ledger"); var open = led.classList.toggle("open");
    el.setAttribute("aria-expanded", open ? "true" : "false");
    return;
  }
  if ((el = t.closest("#btn-reset"))) {
    openOverlay("reset-overlay");
    return;
  }
  if ((el = t.closest("#reset-cancel"))) { closeOverlay("reset-overlay"); return; }
  if ((el = t.closest("#reset-x"))) { closeOverlay("reset-overlay"); return; }
  if ((el = t.closest("#reset-confirm"))) { doReset(); return; }
  if ((el = t.closest("#done-close"))) { closeOverlay("done-overlay"); return; }
  if ((el = t.closest("#done-x"))) { closeOverlay("done-overlay"); return; }
  if ((el = t.closest("#done-reset"))) { doReset(); return; }
  if (t.classList && t.classList.contains("overlay")) { closeOverlay(t.id); return; }
});
document.addEventListener("keydown", function(ev){
  if (ev.key === "Escape"){
    ["reset-overlay","done-overlay"].forEach(function(id){
      var o = $(id);
      if (o && !o.hidden){ closeOverlay(id); }
    });
  }
});

/* ---------- Init ---------- */
load();
if (state.mode === "medium" || state.mode === "hard"){ startMode(state.mode, true); }
else { showModeScreen(); }


/* ----- storage-unavailable announcement (pub/sub consumer) ----- */
onChange(function(reason){
  if (reason === "storage-unavailable"){
    var n = document.getElementById("sr-announcer");
    if (n) n.textContent = "Progress saving is unavailable in this browser session.";
  }
});
