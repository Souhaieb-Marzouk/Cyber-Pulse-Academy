/* ══════════════════════════════════════════════════════════════════════
   js/objectives.js — CHECK RESULTS validation engine: one rule per
   objective id (CHECKS), manual checks, auto-checks, hint tiers,
   the progress dial and the completion report (certificate with
   evidence-derived focus areas). Load order: 4th.
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ CHECK ENGINE ══════════════ */
const CHECKS = {
  M1:()=>S.phaseOrderOK,
  M2:()=>S.planA==="cred"&&S.planB==="ext"&&S.planC==="safe",
  M3:()=>!!(S.scans["ext-nc"]&&S.discovered.F1),
  M4:()=>!!(S.ipamReconciled&&S.ipamAdded),
  M5:()=>!!(S.cspmRun&&S.discovered.F11&&S.discovered.F12),
  M6:()=>S.codeCorrect,
  M7:()=>S.rankM.join()===RANK_M_OK.join(),
  M8:()=>S.wo.F1==="patch"&&S.wo.F3==="codefix"&&S.wo.F8==="firmware"&&S.wo.F11==="config",
  M9:()=>S.wo.F5==="exception"&&S.exc.isolate&&!!S.exc.owner&&!!S.exc.review&&S.exc.review!=="none",
  M10:()=>!!(S.rts.reboot107&&S.validated.F7==="closed"),
  M11:()=>!!(S.scans["int-c"]&&S.rts.dec106==="fp"),
  M12:()=>S.reportA==="tech"&&S.reportB==="mgmt"&&S.reportC==="audit",
  H1:()=>!!(S.scans["ext-nc"]&&S.scans["int-nc"]&&S.scans["int-c"]&&S.cspmRun&&S.codeCorrect&&S.ipamAdded&&ALL_FINDINGS.every(f=>S.discovered[f])),
  H2:()=>S.rankH.join()===RANK_H_OK.join(),
  H3:()=>S.wo.F1==="patch"&&S.wo.F2==="patch"&&S.wo.F8==="firmware"&&S.wo.F11==="config"
       &&["F3","F4","F7","F9","F12"].every(f=>S.wo[f]==="schedule")
       &&(S.wo.F5==="exception"&&S.exc.isolate&&!!S.exc.owner&&!!S.exc.review&&S.exc.review!=="none"),
  H4:()=>S.exc.isolate&&S.exc.owner==="alvarez"&&S.exc.review==="2025-06-01",
  H5:()=>!!(S.rts.reboot107&&S.validated.F7==="closed"&&S.rts.dec106==="fp"&&S.rts.decSanity==="investigate"&&S.rts.back109),
  H6:()=>S.chain.length===2&&S.chain.includes("F1")&&S.chain.includes("F2"),
  H7:()=>!!(S.wafF1&&S.wo.F1==="patch"&&S.validated.F1==="closed"),
  H8:()=>S.cvssA==="x"&&S.cvssAM==="AV"&&S.cvssB==="x"&&S.cvssBM==="S",
  H9:()=>S.stmts.length===3&&STMTS_OK.every(i=>S.stmts.includes(i))
};

function objList(){ return MODE_OBJS[S.mode]||[]; }
function autoCheck(){ let changed=false;
  for(const id of objList()){ const o=S.obj[id]||{passed:false,tries:0,hints:0,firstTry:false};
    if(!o.passed&&CHECKS[id]()){ o.passed=true; o.ok=true; o.firstTry=(o.tries===0&&o.hints===0); o.fb=OBJ[id].ok;
      S.obj[id]=o; changed=true; toast("✓ Objective "+id+" passed — "+shortOk(id)); } }
  if(changed){ renderObjectives(); renderDial(); renderFocus(); maybeComplete(); save(); } }
function shortOk(id){ const m=OBJ[id].ok; return m.length>64?m.slice(0,61)+"…":m; }
function runCheck(id){ const o=S.obj[id]||(S.obj[id]={passed:false,tries:0,hints:0,firstTry:false});
  o.tries++; const ok=CHECKS[id]();
  if(ok){ if(!o.passed){ o.passed=true; o.ok=true; o.firstTry=(o.tries===1&&o.hints===0); o.fb=OBJ[id].ok; toast("✓ Objective "+id+" passed"); } o.fb=OBJ[id].ok; }
  else{ o.firstTry=false; o.fb=OBJ[id].nx; toast("✗ Objective "+id+" — check the feedback"); }
  renderObjectives(); renderDial(); renderFocus(); if(ok) maybeComplete(); save(); }
function addHint(id){ const o=S.obj[id]||(S.obj[id]={passed:false,tries:0,hints:0,firstTry:false});
  const max=S.mode==="medium"?3:1;
  if(o.hints>=max){ toast("No more hints for "+id+" in "+S.mode+" mode."); return; }
  o.hints++; S.hintsUsed++; o.firstTry=false; o.fb="HINT "+o.hints+"/"+max+" — "+OBJ[id].hints[o.hints-1];
  renderObjectives(); save(); toast("Hint used — costs stars, never progress."); }

function renderDial(){ const ids=objList(); const done=ids.filter(id=>(S.obj[id]||{}).passed).length;
  const pct=ids.length?Math.round(done/ids.length*100):0;
  const arc=2*Math.PI*24; $("dialArc").setAttribute("stroke-dasharray", (arc*pct/100)+" "+arc);
  $("dialPct").textContent=pct+"%"; $("opsScore").textContent=done+" / "+ids.length;
  $("objProgress").textContent=done+" of "+ids.length+" objectives passed"; }

function maybeComplete(){ const ids=objList(); if(!ids.length) return;
  const allDone=ids.every(id=>(S.obj[id]||{}).passed);
  if(allDone&&S.quiz.submitted&&!S.certShown){ S.certShown=true; openModal("modalComplete"); renderCert(); save(); }
  else if(allDone&&!S.quiz.submitted){ toast("All objectives passed — outstanding: submit the Line Check."); } }

function renderCert(){ const ids=objList(); const passed=ids.filter(id=>(S.obj[id]||{}).passed);
  const tries=passed.reduce((a,id)=>a+((S.obj[id]||{}).tries||0),0);
  const firstTry=passed.filter(id=>(S.obj[id]||{}).firstTry).length;
  const ratio=passed.length?firstTry/passed.length:0;
  let stars=1;
  if(passed.length===ids.length){ if(ratio>=0.7&&S.hintsUsed<=4) stars=3; else if(ratio>=0.4) stars=2; }
  else if(passed.length/ids.length>=0.8) stars=2;
  const starHtml="★".repeat(stars)+'<span class="off">'+"★".repeat(3-stars)+"</span>";
  const byP={P1:0,P2:0,P3:0,P4:0}; passed.forEach(id=>byP[OBJ[id].p]++);
  const quizPct=S.quiz.total?Math.round(S.quiz.correct/S.quiz.total*100):0;
  // Focus areas — derived from THIS student's actual evidence (R8), not generic filler
  const focus=[];
  for(const id of objList()){ const o=S.obj[id]||{}; const t=OBJ_TOPIC[id]||"its topic";
    const t2=(o.tries||0)>1, h=(o.hints||0)>0;
    if(t2&&h) focus.push("OBJ-"+id+" ("+t+") — needed "+o.tries+" checks and "+o.hints+" hint(s); re-run that bay and read its feedback.");
    else if(t2) focus.push("OBJ-"+id+" ("+t+") — needed "+o.tries+" checks; re-run that bay and read its feedback.");
    else if(h) focus.push("OBJ-"+id+" ("+t+") — used "+o.hints+" hint(s); review the Knowledge Core note on "+t+"."); }
  const bank=S.mode==="medium"?QUIZ_M:QUIZ_H;
  bank.forEach((q,i)=>{ if(S.quiz.checked[i]&&S.quiz.picked[i]!==q.a)
    focus.push("Line check Q"+(i+1)+" ("+q.topic+") — answered wrong; re-read the debrief card on "+q.topic+"."); });
  const focusHtml = focus.length
    ? '<div class="focus-list"><h4>Focus areas — from this run</h4><ul>'+focus.map(f=>'<li>'+esc(f)+'</li>').join("")+'</ul></div>'
    : '<div class="focus-list"><h4>Focus areas — from this run</h4><ul><li>Clean flight: no objective needed retries or hints, and every line-check item landed. Push deeper: '+(S.mode==="medium"?"re-run in HARD mode and compare your triage order under noise.":"map every finding you fixed today to its MITRE technique (T1190/T1210) from memory.")+'</li></ul></div>';
  const next=S.mode==="medium"
    ?"Next: re-run as HARD (Airworthiness Check Flight) — same fleet, noisy evidence, strict validation. Then read MITRE M1016/M1051 pages and try mapping each finding you fixed to its technique."
    :"Next: teach the cycle to someone in 5 minutes (Identify→Prioritize→Remediate→Validate). Then look up CISA KEV + EPSS — the industrial version of today's 'active exploitation' factor.";
  $("certBody").innerHTML =
    '<p style="color:var(--mut)">Meridian Air · Fleet Defense Operations · TR-043</p>'+
    '<h3 style="margin:6px 0;color:var(--ink)">'+(S.mode==="medium"?"Line Maintenance Training":"Airworthiness Check Flight")+' — '+S.mode.toUpperCase()+' mode</h3>'+
    '<div class="stars" aria-label="'+stars+' of 3 stars">'+starHtml+'</div>'+
    '<p class="mono" style="color:var(--teal2);margin-top:8px">'+passed.length+'/'+ids.length+' objectives · first-attempt '+firstTry+'/'+passed.length+' · hints used '+S.hintsUsed+' · line check '+quizPct+'% ('+S.quiz.correct+'/'+S.quiz.total+')</p>'+
    '<p style="color:var(--dim);font-size:12px;margin-top:6px">Stars: 3 = all objectives + ≥70% first-attempt + ≤4 hints · 2 = all objectives (or ≥80%) with more assistance · 1 = flown, needs another circuit.</p>'+
    '<div class="cert-recap">'+
      ['P1 UNDERSTAND','P2 RECOGNIZE','P3 DETECT / VALIDATE','P4 MITIGATE'].map((n,i)=>'<div class="cr"><b>'+n+'</b><span class="mono" style="color:var(--teal2)">'+byP["P"+(i+1)]+' passed</span></div>').join("")+
    '</div>'+focusHtml+
    '<p style="color:var(--mut);margin-top:14px;font-size:13.5px">'+next+'</p>'; }
