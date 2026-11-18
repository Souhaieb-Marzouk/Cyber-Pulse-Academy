"use strict";
/* =====================================================================
   Harbor Watch — js/objectives.js
   Objective engine ported verbatim from the original framework lab:
   objective sets (Medium/Hard), CHECK RESULTS validation rules,
   check/hint flow with lock-on-pass, mastery analytics (lit risks,
   focus areas) and the completion report.
   ===================================================================== */

const OBJS = {medium:OBJ_M, hard:OBJ_H};
function objs(){return OBJS[S.mode]||[];}
function objById(id){return objs().find(o=>o.id===id);}
const PCLASS = {p1:"benign",p2:"prompt injection",p3:"hallucination",p4:"jailbreaking",p5:"code execution",p6:"benign",p7:"benign",p8:"benign",p9:"session hijacking"};
const PAIRS = [["p1","t1","t1b"],["p2","t2","t2b"],["p3","t3","t3b"],["p4","t4","t4b"],["p5","t5","t5b"],["p6","t6","t6b"],["p7","t7","t7b"],["p8","t8","t8b"],["p9","t9"]];
const ANCHORS = {M1:"brief-vocab",M2:"brief-tax",M8:"brief-controls",M3:"hc-transcript",M7:"hc-rule",H2:"hc-transcript",H5:"hc-rule",H4:"hc-deepdive",M4:"fs-dataset",M5:"fs-metrics",M6:"fs-logs",M10:"fs-bias",H8:"fs-bias",H3:"fs-autopsy",H1:"fs-seq",M9:"dm-corpus",H9:"dm-podium",M11:"infra-deck",H6:"infra-deck",H7:"infra-exposure"};
const PILLAR = {1:"P1 Understand",2:"P2 Recognize",3:"P3 Detect",4:"P4 Mitigate"};
const FAILS = {
 M1:"Some pairings are off — compare each select against the glossary wording.",
 M2:"Re-sort: attacker-driven = manipulation, poisoning, injection, jailbreaking, evasion, hijacking, code execution, data loss; the rest are inherent.",
 M3:"Not every pair is classified correctly — five malicious moments exist.",
 M4:"Row set or annotator wrong: look for a shared merchant + pattern match + one unusual annotator.",
 M5:"Both parts must be right: training-side inflation (poisoning) vs inference-side collapse (evasion).",
 M6:"Each of the three must point at a different artifact — beware the approved nightly ETL.",
 M7:"Rule fields AND all four judgments must be right.",
 M8:"One or more mappings don't fit — each item has exactly one clearly best control.",
 M9:"Required: exclude payroll + complaints, encrypt cache, retention 30 days — and nothing else.",
 M10:"Check the hint-3 wording for all three answers.",
 M11:"Every register risk needs its control ON, and FS-9 must require human review.",
 H1:"Sequence wrong — order strictly by timestamps and exclude the two noise cards.",
 H2:"All nine pairs must be exact; the two suspicious-but-benign exchanges stay benign.",
 H3:"Exact values required: poisoning · 0.80 → 0.45 · fs-web-3391 · evasion.",
 H4:"Extract exactly: HC-7742 · Portland & Miami · metrics.telemetry-cdn.example · system prompt + past-due member records.",
 H5:"Rule, all six judgments, and the single tuning change must all be right.",
 H6:"Exactly five controls ON and the coverage meter at 100%.",
 H7:"Each path needs its best-fit control (the retention path accepts two valid answers).",
 H8:"ZIP-proxy disparity · reason codes / feature attributions · human review before adverse decisions.",
 H9:"Verdicts: Harbor Chat ship-with-controls · FraudSentry hold · DeskMate hold — justifications must cite the right risk classes."
};

/* ---------- state helpers ---------- */

function setBind(path, val){
 const parts = path.split(".");
 let o = S;
 for(let i=0;i<parts.length-1;i++){ o = o[parts[i]]; }
 o[parts[parts.length-1]] = val;
}
function getBind(path){
 const parts = path.split(".");
 let o = S;
 for(let i=0;i<parts.length;i++){ o = o[parts[i]]; }
 return o;
}
function objState(id){ if(!S.obj[id]) S.obj[id]={done:false,attempts:0,hints:0,fb:null}; return S.obj[id]; }
function doneCount(){ return objs().filter(o=>objState(o.id).done).length; }
function allDone(){ return objs().length>0 && objs().every(o=>objState(o.id).done); }

function earned(){
 let pts = objs().reduce((a,o)=> a + (objState(o.id).done ? o.pts : 0), 0);
 pts += S.quiz.score;
 pts -= S.penalty;
 return Math.max(0, pts);
}
function maxPts(){ return objs().reduce((a,o)=>a+o.pts,0) + (S.mode==="hard"?42:30); }

/* ---------- validation ---------- */

function ruleOK(){
 const r = S.env.rule;
 const thOK = r.thresh==="1" || r.thresh==="2";
 return r.source==="0" && r.pats.p1===true && r.pats.p2===true && thOK && (r.action==="1"||r.action==="2");
}
function eventsOK(list){ return list.every(e=> S.env.ev[e.id] === (e.tp?"TP":"FP")); }
function deckCov(riskId){ return DECK_CTLS.some(c=> S.env.deck[c.id] && c.cov.includes(riskId)); }
function covPct(){ const n = REGISTER.filter(r=>deckCov(r.risk)).length; return Math.round(n/REGISTER.length*100); }
function deckOnCount(){ return DECK_CTLS.filter(c=>S.env.deck[c.id]).length; }


const CHECKS = {
 M1(){ return VOCAB.every(v=> S.env.vocab[v[0]]===v[0]); },
 M2(){ return RISKS.every(r=> S.env.sort[r.id]===(r.atk?"A":"I")); },
 M3(){ return PAIRS.every(p=> (S.env.turns[p[0]]||"")===PCLASS[p[0]]); },
 M4(){
  const f = S.env.dsFlags;
  const rowsOK = POISON_ROWS.every(r=>f[r]) && DATASET.every(d=> !f[d.id] || POISON_ROWS.includes(d.id));
  return rowsOK && /temp-contractor-9/i.test(S.env.dsAnn||"");
 },
 M5(){ return S.env.m5a==="0" && S.env.m5b==="1"; },
 M6(){ return S.env.m6a==="1" && S.env.m6b==="1" && S.env.m6c==="4"; },
 M7(){ return ruleOK() && eventsOK(RULE_EVENTS_M); },
 M8(){ return M8_ITEMS.every((it,i)=> String(S.env.m8["m8"+i])===String(it.good)); },
 M9(){
  const c=S.env.corpus;
  return c.c1===true && c.c2===true && c.c4===true && c.c3!==true && c.c5!==true && S.env.ret==="2";
 },
 M10(){ return S.env.biasA==="1" && S.env.biasB==="0" && S.env.biasC==="1"; },
 M11(){ return REGISTER.every(r=> S.env.deck[r.need]) && S.env.ethics==="1"; },
 H1(){ return (S.env.seq.join("|"))===SEQ_ORDER.join("|"); },
 H2(){ return CHECKS.M3(); },
 H3(){
  const h=S.env.h3;
  return h.a==="0" && parseFloat(h.t1)===0.80 && parseFloat(h.t2)===0.45 &&
   (h.c||"").trim().toLowerCase()==="fs-web-3391" && h.d==="1";
 },
 H4(){
  const h=S.env.h4;
  const sidOK = /hc-7742/i.test(h.sid||"");
  const citiesOK = (h.c1==="0"&&h.c2==="1")||(h.c1==="1"&&h.c2==="0");
  const hostOK = (h.host||"").toLowerCase().includes("metrics.telemetry-cdn.example");
  return sidOK && citiesOK && hostOK && h.d1===true && h.d2===true && h.d3!==true;
 },
 H5(){ return ruleOK() && eventsOK(RULE_EVENTS_H) && S.env.tune==="1"; },
 H6(){ return deckOnCount()===5 && REGISTER.every(r=> deckCov(r.risk)); },
 H7(){ return H7_PATHS.every((p,i)=> p.good.map(String).includes(String(S.env.h7["h7"+i]))); },
 H8(){ return CHECKS.M10(); },
 H9(){
  return S.env.verd.hc==="1" && S.env.verd.fs==="2" && S.env.verd.dm==="2" &&
   S.env.just.hc==="0" && S.env.just.fs==="1" && S.env.just.dm==="0";
 }
};


function litRisks(){
 const lit = new Set();
 objs().forEach(o=>{ if(objState(o.id).done) (o.risks||[]).forEach(r=>lit.add(r)); });
 return lit;
}

function checkObj(id){
 const o = objById(id); if(!o) return;
 const st = objState(id);
 const pass = CHECKS[id] && CHECKS[id]();
 st.attempts++;
 if(pass){
  if(!st.done){
   st.done = true;
   /* R2: re-render the owning bay so applyLock disables the just-passed answer surface immediately. */
   const bayRenders = {brief:renderBrief, hc:renderHC, fs:renderFS, dm:renderDM, infra:renderInfra};
   if(bayRenders[o.bay]) bayRenders[o.bay]();
  }
  showFB(id, "pass", "<strong>Objective "+id+" complete.</strong> "+esc(o.pf));
  announce("Objective "+id+" passed. "+o.pf);
 } else {
  showFB(id, "fail", "<strong>Not yet.</strong> "+esc(FAILS[id]||"Re-check the evidence."));
  announce("Objective "+id+" not passed yet. "+(FAILS[id]||""));
 }
 save(); updateHeader(); renderTiles(); renderLedger(); renderQuiz();
 if(allDone() && S.quiz.done && !S.done) complete();
}
function hintObj(id){
 const o = objById(id); if(!o) return;
 const st = objState(id);
 if(st.hints >= o.hints.length) return;
 if(S.mode==="hard"){ S.penalty += 3; toast("Hint used — 3 pts deducted"); }
 const txt = o.hints[st.hints];
 st.hints++;
 showFB(id, "hint", "<strong>Hint "+st.hints+":</strong> "+esc(txt));
 save(); updateHeader(); renderLedger();
}


function focusAreas(){
 const out=[];
 objs().forEach(o=>{
  const st = objState(o.id);
  if(!st.done) out.push("<b>"+o.id+"</b> is still open — "+esc(o.t));
  else if(st.attempts>1) out.push("<b>"+o.id+"</b> took "+st.attempts+" checks — revisit: "+esc(o.a)+".");
  if(st.done && st.hints>0) out.push("<b>"+o.id+"</b> used "+st.hints+" hint"+(st.hints>1?"s":"")+" — practice that skill: "+esc(o.a)+".");
 });
 (S.mode==="hard"?QUIZ_H:QUIZ_M).forEach((q,i)=>{
  if(S.quiz.ans[i]!==undefined && S.quiz.ans[i]!==q.a) out.push("Quiz item "+(i+1)+" was missed — review "+(q.map||"its topic")+" and the matching Risk Index tiles.");
 });
 const unlit = RISKS.filter(r=>!litRisks().has(r.id)).map(r=>r.n);
 if(unlit.length) out.push("Risk Index tiles not yet demonstrated: "+esc(unlit.join(", "))+".");
 if(S.penalty>0) out.push("Hints cost "+S.penalty+" pts this run — aim for a hint-free pass next time.");
 if(out.length===0) out.push("Clean first-attempt run with no hints — no weak areas detected. Replay the other mode and follow the MITRE ATLAS links in the Debrief.");
 return out.slice(0,8);
}
function stars(){
 const pct = earned()/maxPts();
 let base = pct>=0.9?5 : pct>=0.75?4 : pct>=0.6?3 : pct>=0.4?2 : 1;
 const hints = objs().reduce((a,o)=>a+objState(o.id).hints,0);
 const hintPen = S.mode==="hard" ? (hints>0?1:0) : (hints>4?1:0);
 return Math.max(1, base - hintPen);
}
function complete(){
 S.done = true; S.stars = stars(); save();
 const pct = Math.round(earned()/maxPts()*100);
 const byP = {1:[0,0],2:[0,0],3:[0,0],4:[0,0]};
 objs().forEach(o=>{ byP[o.p][1]++; if(objState(o.id).done) byP[o.p][0]++; });
 const recap = Object.keys(byP).map(p=>`<div class="pr-box"><div class="pr-lab">${PILLAR[p]}</div><div class="pr-val">${byP[p][0]}/${byP[p][1]}</div></div>`).join("");
 const olist = objs().map(o=>`<li><strong>${o.id}</strong> — ${PILLAR[o.p]}: ${esc(o.a)}</li>`).join("");
 openModal(`<h3>SHIFT COMPLETE — Harbor Watch</h3>
  <div class="complete-stars" aria-label="${S.stars} of 5 stars">${"★".repeat(S.stars)}${"☆".repeat(5-S.stars)}</div>
  <p>Score <strong>${earned()}/${maxPts()}</strong> (${pct}%) · mode <strong>${S.mode}</strong>${S.penalty?` · hint penalty −${S.penalty} pts`:""} · stars factor in first-attempt accuracy and hint usage.</p>
  <div class="pillar-recap">${recap}</div>
  <p><strong>Focus areas (from your actual run):</strong></p>
  <ul class="focus-list" style="font-size:.85rem">${focusAreas().map(f=>`<li>${f}</li>`).join("")}</ul>
  <p><strong>Objective recap:</strong></p><ul style="font-size:.8rem">${olist}</ul>
  <div class="next-steps"><strong>What next?</strong>
   <ul><li>Read the Debrief tab end-to-end, then re-derive the 13 risks from memory.</li>
   <li>Official reference: <a href="https://www.comptia.org/training/by-certification/security/security-plus" target="_blank" rel="noopener noreferrer">CompTIA Security+ (SY0-801)</a></li>
   <li>Adversary view: <a href="https://atlas.mitre.org/" target="_blank" rel="noopener noreferrer">MITRE ATLAS</a> — trace AML.T0051, T0020, T0015, T0024, T0018.</li>
   <li>Try the other difficulty mode for the second half of the experience.</li></ul></div>
  <div class="m-actions"><button class="obtn" data-act="close-modal">Back to the lab</button></div>`);
 announce("Lab complete. Score "+earned()+" of "+maxPts()+", "+S.stars+" stars.");
}

