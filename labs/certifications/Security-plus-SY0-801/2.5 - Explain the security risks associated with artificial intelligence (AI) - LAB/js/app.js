"use strict";
/* =====================================================================
   Harbor Watch — js/app.js
   Event wiring, tabs/drawers, difficulty-mode gate and bootstrap,
   ported verbatim from the original framework lab. The quiz answer/next
   bodies were moved to js/quiz.js (called from the dispatcher unchanged).
   ===================================================================== */

/* ---------- events ---------- */
document.addEventListener("click", e=>{
 const b = e.target.closest("[data-act]");
 if(!b) return;
 const act = b.dataset.act;
 if(act==="tab"){ showTab(b.id.replace("tab-","")); }
 else if(act==="check"){ checkObj(b.dataset.obj); }
 else if(act==="hint"){ hintObj(b.dataset.obj); }
 else if(act==="jump"){ jumpTo(b.dataset.obj); }
 else if(act==="glos"){ glossaryModal(); }
 else if(act==="risk"){ riskModal(b.dataset.id); }
 else if(act==="reset"){ resetModal(); }
 else if(act==="reset-yes"){ try{localStorage.removeItem(LSKEY);}catch(err){} location.reload(); }
 else if(act==="close-modal"){ closeModal(); }
 else if(act==="toast-close"){ const t=$("toast"); if(t) t.hidden=true; }
 else if(act==="mode"){ startMode(b.dataset.mode); }
 else if(act==="pat"){ const id=b.dataset.id; S.env.rule.pats[id]=!S.env.rule.pats[id]; save(); renderHC(); }
 else if(act==="tpfp"){ const ev=b.dataset.ev, v=b.dataset.val; S.env.ev[ev] = S.env.ev[ev]===v ? "" : v; save(); renderHC(); }
 else if(act==="deck"){ const id=b.dataset.id; S.env.deck[id]=!S.env.deck[id]; save(); renderInfra(); updateHeader(); }
 else if(act==="seq-add"){ const id=b.dataset.id; if(!S.env.seq.includes(id) && SEQ_EVENTS.find(x=>x.id===id).chain) S.env.seq.push(id); save(); renderFS(); }
 else if(act==="seq-rm"){ const id=b.dataset.id; S.env.seq = S.env.seq.filter(x=>x!==id); save(); renderFS(); }
 else if(act==="quiz-ans"){ quizAnswer(b); }
 else if(act==="quiz-next"){ quizNext(); }
 else if(act==="rail-toggle"){ togglePanel("rail", b); }
 else if(act==="ledger-toggle"){ togglePanel("ledger", b); }
});

document.addEventListener("change", e=>{
 const t = e.target;
 if(!t.dataset || !t.dataset.bind) return;
 setBind(t.dataset.bind, t.type==="checkbox" ? t.checked : t.value);
 save();
 if(t.dataset.bind.startsWith("env.dsFlags")){ t.closest("tr").classList.toggle("poison-hit", t.checked); }
 if(t.dataset.bind.startsWith("env.corpus")){ t.closest(".chx").classList.toggle("checked", t.checked); }
 if(t.dataset.bind.startsWith("env.deck")){ renderInfra(); }
 if(t.dataset.bind==="env.ethics" || t.dataset.bind.startsWith("env.m8") || t.dataset.bind.startsWith("env.h7") || t.dataset.bind.startsWith("env.verd") || t.dataset.bind.startsWith("env.just") || t.dataset.bind==="env.tune"){ /* selections persisted */ }
 updateHeader();
});


/* ---------- mode gate & init ---------- */
function startMode(m){
 S.mode = m;
 const fresh = freshState(); fresh.mode = m; S = fresh;
 save();
 boot();
}
function boot(){
 load();
 $("btn-mode-medium").dataset.act = "mode"; $("btn-mode-medium").dataset.mode = "medium";
 $("btn-mode-hard").dataset.act = "mode"; $("btn-mode-hard").dataset.mode = "hard";
 $("btn-glos").dataset.act = "glos"; $("btn-glos-2").dataset.act = "glos";
 $("btn-reset").dataset.act = "reset";
 $("btn-rail").dataset.act = "rail-toggle"; $("btn-ledger").dataset.act = "ledger-toggle";
 if(!S.mode){ return; } // gate stays visible; buttons wired
 $("modegate").hidden = true;
 $("app").hidden = false;
 $("quiz-title").textContent = S.mode==="hard" ? "Scenario knowledge check" : "Knowledge check";
 $("quiz-desc").textContent = S.mode==="hard"
  ? "7 scenario items — justify every call like you would in the room. 6 pts each."
  : "6 concept questions — an explanation follows every answer. 5 pts each.";
 renderTiles(); renderBrief(); renderHC(); renderFS(); renderDM(); renderInfra(); renderQuiz(); renderDebrief(); renderLedger();
 showTab("brief");
 updateHeader();
}

document.addEventListener("keydown", e=>{
 if(e.key==="Escape" && $("modal-root").innerHTML) closeModal();
});

/* static-port addition (behavior-neutral): header sync now subscribes to the
   state store's notify — the original called updateHeader() inline at these
   same persisted-mutation points. */
subscribe(updateHeader);
boot();
