/* The Flat Net Incident — static build (N10-009 4.6).
   js/app.js — Boot: load saved state, render shell, bind global listeners.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= BOOT ================= */
function boot(){
  var had=load();
  if(had && !S.mode){ S=freshState(); }
  renderAll();
  var veil=document.getElementById("veil");
  veil.addEventListener("click",function(e){ if(e.target===veil) closeModal(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape" && veil.classList.contains("show")) closeModal(); });
}
boot();
