"use strict";

/* ============================================================================
   js/quiz.js — Final Sign-Off quiz: one-question-at-a-time flow (select -> Submit
   locks -> Next enforced), only-chosen coloring contract (R3), deterministic
   correct-position rotation (R4).
   ============================================================================ */

function quizComplete(){ return QUIZ[state.mode].every((q,i)=>state.env.quiz["q"+i]!==undefined); }

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

const ROT_SALT="t2"; /* tuned so correct-answer positions rotate across all QCM items (see audit report) */

function stablePermutation(modeName, qi, n){ /* deterministic so re-renders and reloads keep the same display order */
  let seed=0; const s=modeName+"|"+qi+"|"+ROT_SALT; for(let i=0;i<s.length;i++) seed=(seed*31+s.charCodeAt(i))|0;
  const rnd=mulberry32(seed); const arr=Array.from({length:n},(_,k)=>k);
  for(let i=n-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

function renderQuiz(){
  /* R2/D10: one question at a time — select, Submit (validates + locks), Next enforced. R3: only the chosen option is colored. */
  const box=$("#quizPanel"); box.innerHTML="";
  const data=QUIZ[state.mode];
  const i=Math.min(state.quizIdx||0, data.length-1);
  const q=data[i];
  const chosen=state.env.quiz["q"+i];
  const answered=data.filter((_,k)=>state.env.quiz["q"+k]!==undefined).length;
  const correctCount=data.filter((q2,k)=>state.env.quiz["q"+k]===q2.c).length;
  const lead=$("#quizLead");
  if(lead) lead.textContent="One question at a time. Select an answer, press Submit — the answer locks and Next unlocks. Score: "+correctCount+"/"+answered+" answered.";
  const card=el("div","qCard");
  card.innerHTML='<div class="qNum">Sign-off question '+(i+1)+' / '+data.length+' · '+q.t+'</div><div class="qText">'+q.q+'</div>';
  const order=stablePermutation(state.mode,i,q.o.length);
  const opts=el("div","qOpts");
  let pending=null; let sub=null;
  order.forEach((origOi)=>{
    const b=el("button", null, escapeHtml(q.o[origOi]));
    if(chosen!==undefined){
      b.disabled=true;
      if(origOi===chosen) b.classList.add(chosen===q.c ? "right" : "wrong");
    } else {
      b.addEventListener("click",()=>{ pending=origOi; opts.querySelectorAll("button").forEach(x=>x.classList.remove("selQ")); b.classList.add("selQ"); if(sub) sub.disabled=false; });
    }
    opts.appendChild(b);
  });
  card.appendChild(opts);
  if(chosen!==undefined){
    card.appendChild(el("div","qVerdict "+(chosen===q.c?"vok":"vbad"), chosen===q.c ? "Correct ✓" : "Not correct ✗"));
    card.appendChild(el("div","qExpl show", q.x));
    const row=el("div","actionRow");
    const nxt=el("button","btn", i+1<data.length ? "Next question →" : "Finish sign-off → As-Built Records");
    nxt.addEventListener("click",()=>{ if(i+1<data.length){ state.quizIdx=i+1; save(); renderQuiz(); } else { showStation("debrief"); } });
    row.appendChild(nxt); card.appendChild(row);
  } else {
    const row=el("div","actionRow");
    sub=el("button","btn","Submit answer"); sub.disabled=true;
    sub.addEventListener("click",()=>{
      if(pending===null) return;
      state.env.quiz["q"+i]=pending; save(); renderQuiz(); refreshDial(); refreshLamps();
      announce("Answer submitted and locked for question "+(i+1)+".");
    });
    row.appendChild(sub); card.appendChild(row);
  }
  box.appendChild(card);
  const prog=el("div","sub2"); prog.style.marginTop="10px";
  prog.textContent="Answered "+answered+" of "+data.length+". Answers lock at Submit; you cannot skip ahead.";
  box.appendChild(prog);
}
/* ---------- environment restore ---------- */
