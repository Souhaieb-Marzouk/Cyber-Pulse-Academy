"use strict";
/* =============================================================================
   js/objectives.js — the CHECK RESULTS validation engine: objective records,
   check/hint flows, feedback surfacing, and the star scoring formula.
   All pass/fail rules and messages come from data.js (OBJS) — untouched.
   ========================================================================== */

function doCheck(id){const o=OBJS.find(x=>x.id===id);if(!o)return;const r=rec(id);
  const res=o.validate(S);r.attempts++;
  if(res.ok){if(!r.done){r.done=true;r.firstTry=r.attempts===1;}r.ok=true;r.msg=o.pass;}
  else{r.ok=false;r.msg=res.msg;}
  save();renderTracker();updateRing();
  showFeedback(id,res.ok,res.ok?o.pass:res.msg);}
function showFeedback(id,ok,msg){
  $$('[data-fb="'+id+'"]').forEach(el=>{el.className="feedback show "+(ok?"pass":"fail");
    el.innerHTML=(ok?'<span class="stamp">Pass</span>':'<span class="stamp">Retry</span>')+msg;});
  toast(ok?"✔ Objective "+id+" passed":"✖ "+id+" — see feedback");
  announce((ok?"Objective "+id+" passed. ":"Objective "+id+" not yet correct. ")+msg);
  const card=$("#objc-"+id);if(card&&!S.open.includes(id)){S.open.push(id);renderTracker();}}
function doHint(id){const o=OBJS.find(x=>x.id===id);if(!o)return;const r=rec(id);
  if(S.mode==="hard"){if(r.hints>=1){toast("Only one nudge per objective in Hard mode — already used.");return;}
    r.hints++;r.msg="Nudge used (score cost): "+o.hints[0];r.ok=null;save();renderTracker();
    $$('[data-hb="'+id+'"]').forEach(el=>{el.className="hintbox show";el.innerHTML="<b>Nudge:</b> "+o.hints[0];});
    toast("Nudge revealed — it will cost stars.");announce("Nudge for "+id+": "+o.hints[0]);return;}
  if(r.hints>=3){toast("All three hint tiers already shown.");return;}
  r.hints++;const tier=["Nudge","Direction","Demonstration"][r.hints-1];
  save();renderTracker();
  $$('[data-hb="'+id+'"]').forEach(el=>{el.className="hintbox show";el.innerHTML="<b>"+tier+":</b> "+o.hints[r.hints-1];});
  announce(tier+" for "+id+": "+o.hints[r.hints-1]);}
function toggleObj(id){const i=S.open.indexOf(id);if(i>=0)S.open.splice(i,1);else S.open.push(id);save();renderTracker();}

function starCount(){const list=objs();const total=list.length||1;
  const ft=list.filter(o=>(S.obj[o.id]||{}).firstTry).length;const ratio=ft/total;
  const hints=list.reduce((a,o)=>a+((S.obj[o.id]||{}).hints||0),0);
  const pen=S.mode==="medium"?0.25:0.5;
  return Math.max(1,Math.min(5,Math.round(1+4*ratio-hints*pen)));}
