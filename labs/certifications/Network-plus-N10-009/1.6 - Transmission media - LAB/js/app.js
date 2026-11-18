/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · app
   APP — event wiring and lifecycle: field change routing, stage tabs/dock/mobile views, mode entry/switch, confirmed reset, and boot() (runs on load, restores saved progress).
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

/* ---------------- field change handlers ---------------- */

function onField(kind, oidWid, key, value, checked){
  if(kind === "widget"){
    var w = st().widgets[oidWid] || (st().widgets[oidWid] = {});
    w[key] = value;
    save();
  } else if(kind === "matrix"){
    var mx = st().matrix[oidWid] || (st().matrix[oidWid] = {});
    mx[key] = value;
    save();
  } else if(kind === "order"){
    var o = st().orders[oidWid] || (st().orders[oidWid] = {fields:{}, certified:false});
    o.fields[key] = checked !== undefined ? checked : value;
    save();
    if(currentOrder === oidWid) updateLive(oidWid);
  }
}

function certifyOrder(oid){
  var ord = ordersFor().filter(function(x){ return x.id === oid; })[0];
  if(!ord) return;
  var res = checkObjective(ord.obj, {fromCertify:true});
  var box = $id("certify-result");
  if(box){
    box.className = "certify-result " + (res.pass ? "ok" : "no");
    box.innerHTML = '<span class="stamp ' + (res.pass ? "ok" : "no") + '">' + (res.pass ? "CERTIFIED" : "FAIL") + '</span> ' + esc(res.why);
    box.scrollIntoView({behavior:"smooth", block:"nearest"});
  }
  sr(res.pass ? "Order certified: " + ord.code + ". " + res.why : "Order failed certification: " + ord.code + ". " + res.why);
  if(res.pass) toast(ord.code + " certified — objective " + ord.obj + " complete");
}

/* ---------------- tabs / dock / chrome ---------------- */

var PANELS = ["orders","matrix","quiz","notes"];
function selectPanel(name){
  PANELS.forEach(function(p){
    $id("panel-" + p).hidden = p !== name;
    $id("tab-" + p).setAttribute("aria-selected", p === name ? "true" : "false");
  });
  if(window.innerWidth <= 719) setView("stage");
}
function setView(v){
  document.body.classList.remove("view-rack", "view-stage");
  document.body.classList.add("view-" + v);
  $id("dockRack").setAttribute("aria-pressed", v === "rack" ? "true" : "false");
  $id("dockStage").setAttribute("aria-pressed", v === "stage" ? "true" : "false");
}
function onMobileView(v){
  if(window.innerWidth <= 719) setView(v);
}
function showCard(){ document.body.classList.add("show-card"); }
function closeCard(){ document.body.classList.remove("show-card"); }


/* ---------------- mode / boot ---------------- */

function enterMode(mode){
  S.mode = mode;
  save();
  $id("modeScreen").hidden = true;
  $id("bench").hidden = false;
  currentOrder = null;
  renderRack();
  renderBoard();
  renderMatrix();
  renderQuiz();
  renderNotes();
  renderCard();
  selectPanel("orders");
  updateMeter();
  if(window.innerWidth <= 719) setView("stage");
  else document.body.classList.remove("view-rack", "view-stage");
  toast(mode === "medium" ? "Medium mode — guided bench. Start anywhere; the cert card points the way." : "Hard mode — strict field bench. Two evidence tags lie. One nudge total.");
}
function switchMode(m){
  closeModal();
  S.mode = m;
  enterMode(m);
  toast("Switched to " + m.toUpperCase() + " — each mode keeps its own progress");
}
function resetAll(){
  try { localStorage.removeItem(LS_KEY); } catch(e){}
  location.reload();
}

function boot(){
  S = load();
  $id("btnModeMedium").addEventListener("click", function(){ enterMode("medium"); });
  $id("btnModeHard").addEventListener("click", function(){ enterMode("hard"); });
  $id("btnReset").addEventListener("click", function(){
    showModal("<h3>Reset the bench?</h3><p>This wipes ALL progress in BOTH modes (objectives, orders, quiz, hints) and restores the pristine lab.</p>",
      [{label:"Cancel", cls:"btn", fn:closeModal},
       {label:"Reset everything", cls:"btn btn-danger", fn:resetAll}]);
  });
  $id("btnSwitch").addEventListener("click", function(){
    var other = S.mode === "medium" ? "hard" : "medium";
    showModal("<h3>Switch to " + other.toUpperCase() + "?</h3><p>Each mode keeps its own objectives, orders and quiz progress — nothing is lost.</p>",
      [{label:"Cancel", cls:"btn", fn:closeModal},
       {label:"Switch to " + other, cls:"btn btn-primary", fn:function(){ switchMode(other); }}]);
  });
  $id("btnCard").addEventListener("click", function(){
    if(window.innerWidth < 1200){
      if(document.body.classList.contains("show-card")) closeCard(); else showCard();
    } else {
      $id("card").scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
  PANELS.forEach(function(p, i){
    var t = $id("tab-" + p);
    t.addEventListener("click", function(){ selectPanel(p); });
    t.setAttribute("tabindex", "0");
    t.addEventListener("keydown", function(e){
      if(e.key === "ArrowRight" || e.key === "ArrowLeft"){
        e.preventDefault();
        var dir = e.key === "ArrowRight" ? 1 : -1;
        var np = PANELS[(PANELS.indexOf(p) + dir + PANELS.length) % PANELS.length];
        selectPanel(np);
        $id("tab-" + np).focus();
      }
    });
  });
  $id("dockRack").addEventListener("click", function(){ onMobileView("rack"); setView("rack"); });
  $id("dockStage").addEventListener("click", function(){ onMobileView("stage"); setView("stage"); });
  $id("dockCard").addEventListener("click", function(){
    if(document.body.classList.contains("show-card")) closeCard(); else showCard();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && !$id("modalRoot").hidden) closeModal();
  });
  $id("modalRoot").addEventListener("click", function(e){
    if(e.target === $id("modalRoot")) closeModal();
  });
  /* field changes (delegated) */
  document.addEventListener("change", function(e){
    var t = e.target;
    var act = t.getAttribute("data-act");
    if(!act) return;
    if(act === "field"){
      var kind = t.getAttribute("data-kind");
      var f = t.getAttribute("data-f");
      if(kind === "widget") onField("widget", t.getAttribute("data-wid"), f, t.value);
      else if(kind === "matrix") onField("matrix", f, t.getAttribute("data-fid"), t.value);
      else if(kind === "order"){
        var form = t.closest("[data-oid]");
        onField("order", form ? form.getAttribute("data-oid") : currentOrder, f, t.value);
      }
    } else if(act === "chk"){
      var form2 = t.closest("[data-oid]");
      onField("order", form2 ? form2.getAttribute("data-oid") : currentOrder, t.getAttribute("data-f"), undefined, t.checked);
    }
  });
  document.addEventListener("input", function(e){
    var t = e.target;
    if(t.matches('input[type="number"][data-act="field"]')){
      var form = t.closest("[data-oid]");
      onField("order", form ? form.getAttribute("data-oid") : currentOrder, t.getAttribute("data-f"), t.value);
    }
  });
  /* quiz clicks (delegated) */
  document.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest('[data-act="quiz"]') : null;
    if(b) answerQuiz(parseInt(b.getAttribute("data-q"), 10), parseInt(b.getAttribute("data-opt"), 10));
  });
  /* resume */
  if(S.mode){
    enterMode(S.mode);
    toast("Progress restored — " + doneCount() + "/" + objListFor().length + " objectives already certified");
  }
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
