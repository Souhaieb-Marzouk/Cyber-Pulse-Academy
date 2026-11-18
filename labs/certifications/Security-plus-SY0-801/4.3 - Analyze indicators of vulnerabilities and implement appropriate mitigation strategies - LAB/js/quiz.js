/* ══════════════════════════════════════════════════════════════════════
   js/quiz.js — Knowledge Check engine: one question at a time,
   validate→lock→mandatory-next, per-question runtime option shuffle
   (persisted, reshuffled on retake), recap + retake. Question data
   lives in js/data.js (QUIZ_M / QUIZ_H). Load order: 5th.
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ QUIZ — one question at a time, validate→lock→next (R2/R3) ══════════════ */
function quizBank(){ return S.mode==="medium"?QUIZ_M:QUIZ_H; }
function quizFresh(){ return {picked:{},checked:{},current:0,done:false,submitted:false,correct:0,total:0,order:{}}; }
function ensureOrder(){ const b=quizBank(); b.forEach((q,i)=>{ if(!S.quiz.order[i]){
  const arr=Array.from(q.o.keys());
  for(let j=arr.length-1;j>0;j--){ const k=Math.floor(Math.random()*(j+1)); [arr[j],arr[k]]=[arr[k],arr[j]]; }
  S.quiz.order[i]=arr; } }); }
function renderQuiz(){ const box=$("quizList"); box.innerHTML="";
  if(!S.mode){ return; }
  const set=quizBank(); ensureOrder();
  $("quizScore").textContent=S.quiz.done?("Final: "+S.quiz.correct+" / "+S.quiz.total+" — retake reshuffles."):"";
  if(S.quiz.done){ const el=document.createElement("div"); el.className="quiz-q";
    el.innerHTML='<div class="q-text"><span class="qn">RESULT</span>Line check scored <b>'+S.quiz.correct+' / '+S.quiz.total+'</b> — full recap below.</div>';
    const recap=document.createElement("div"); recap.className="cb-list";
    set.forEach((q,i)=>{ const ok=S.quiz.picked[i]===q.a;
      const row=document.createElement("div"); row.className="q-opt"+(ok?" right":" wrong");
      const sp=document.createElement("span"); sp.textContent=(ok?"✓ Q"+(i+1)+" — ":"✗ Q"+(i+1)+" — ")+q.topic; row.append(sp); recap.append(row);
      const why=document.createElement("div"); why.className="q-why show "+(ok?"ok":"no"); why.textContent=(ok?"✓ Correct — ":"✗ Wrong pick — ")+q.why; recap.append(why); });
    el.append(recap);
    const retake=document.createElement("button"); retake.className="btn"; retake.style.marginTop="12px";
    retake.textContent="Retake line check (reshuffled)";
    retake.addEventListener("click",()=>{ S.quiz=quizFresh(); ensureOrder(); renderQuiz(); save(); toast("Line check reset — answer order reshuffled."); });
    el.append(retake); box.append(el); return; }
  const i=S.quiz.current; const q=set[i]; const checked=!!S.quiz.checked[i];
  const el=document.createElement("div"); el.className="quiz-q";
  el.innerHTML='<div class="q-text"><span class="qn">Q'+(i+1)+' / '+set.length+'</span>'+esc(q.q)+'</div>';
  const opts=document.createElement("div"); opts.className="q-opts"; opts.setAttribute("role","radiogroup"); opts.setAttribute("aria-label","Question "+(i+1)+" of "+set.length);
  const order=S.quiz.order[i];
  order.forEach(orig=>{ const lab=document.createElement("label"); lab.className="q-opt";
    const r=document.createElement("input"); r.type="radio"; r.name="q"+i; r.value=orig; r.checked=S.quiz.picked[i]===orig; r.disabled=checked;
    r.addEventListener("change",()=>{ if(S.quiz.checked[i]) return; S.quiz.picked[i]=orig; renderQuiz(); save(); });
    lab.append(r); const sp=document.createElement("span"); sp.textContent=q.o[orig]; lab.append(sp);
    if(checked){ if(S.quiz.picked[i]===orig) lab.classList.add(S.quiz.picked[i]===q.a?"right":"wrong"); }
    else if(S.quiz.picked[i]===orig) lab.classList.add("sel");
    opts.append(lab); });
  el.append(opts);
  if(checked){ const ok=S.quiz.picked[i]===q.a;
    const why=document.createElement("div"); why.className="q-why show "+(ok?"ok":"no");
    why.textContent=(ok?"✓ Correct — ":"✗ Wrong — ")+q.why; el.append(why);
    const foot=document.createElement("div"); foot.style.cssText="display:flex;gap:12px;margin-top:12px;align-items:center;flex-wrap:wrap";
    if(i<set.length-1){ const nx=document.createElement("button"); nx.className="btn primary"; nx.textContent="Next question →";
      nx.addEventListener("click",()=>{ S.quiz.current++; renderQuiz(); save(); $("bayQuiz").scrollIntoView({behavior:"smooth"}); });
      const note=document.createElement("span"); note.className="k-label"; note.textContent="answer locked — next question is mandatory";
      foot.append(nx,note); }
    else { const fin=document.createElement("button"); fin.className="btn primary"; fin.textContent="Finish line check";
      fin.addEventListener("click",()=>{ S.quiz.done=true; S.quiz.submitted=true; S.quiz.total=set.length;
        S.quiz.correct=set.filter((qq,j)=>S.quiz.picked[j]===qq.a).length;
        renderQuiz(); maybeComplete(); save(); toast("Line check scored: "+S.quiz.correct+"/"+S.quiz.total); });
      const note=document.createElement("span"); note.className="k-label"; note.textContent="last item — scoring on finish";
      foot.append(fin,note); }
    el.append(foot); }
  else { const row=document.createElement("div"); row.style.cssText="display:flex;gap:12px;margin-top:12px;align-items:center;flex-wrap:wrap";
    const v=document.createElement("button"); v.className="btn primary"; v.textContent="Validate answer";
    v.addEventListener("click",()=>{ if(S.quiz.picked[i]===undefined){ toast("Select an answer first — nothing is highlighted."); return; }
      if(S.quiz.checked[i]) return; S.quiz.checked[i]=true; renderQuiz(); save(); });
    const note=document.createElement("span"); note.className="k-label"; note.textContent="validating locks your answer";
    row.append(v,note); el.append(row); }
  box.append(el); }
