/* ============================================================================
   QUIZ — sequential knowledge-check engine: one question at a time, answer lock,
   red/green color contract on the selected option only, gated Next, resume at the
   first unanswered item, review mode after finish. */
function activeQuiz(){ return state.mode==="hard"?QUIZ_HARD:QUIZ_MED; }

function answeredCount(){ return Object.keys(state.quiz.answers).length; }

function quizTotal(){ return activeQuiz().length; }

function renderQuiz(){
  const body=document.getElementById("quiz-body");
  if(state.quiz.current==null){
    const qs=activeQuiz();
    const firstUn=qs.findIndex((q,i)=>!state.quiz.answers[i]);
    state.quiz.current=(state.quiz.done||firstUn<0)?qs.length:Math.max(0,firstUn);
  }
  body.innerHTML='<div class="pillbar" id="quiz-progress" aria-live="polite"></div>'+
    '<div id="quiz-card-slot"></div>'+
    '<div class="checkmsg" id="quiz-summary" aria-live="polite"></div>'+
    '<div class="hintbar" id="quiz-reviewbar" style="display:none"><button class="btn small ghost" id="quiz-review" type="button">Review my answers</button></div>';
  body.addEventListener("click",e=>{
    const sub=e.target.closest("[data-quiz-submit]");
    if(sub){ quizSubmit(parseInt(sub.dataset.quizSubmit,10)); return; }
    const next=e.target.closest("[data-quiz-next]");
    if(next){ quizAdvance(parseInt(next.dataset.quizNext,10)); return; }
    if(e.target.closest("#quiz-review")){ drawQuizDone(); }
  });
  if(state.quiz.done) drawQuizDone(); else drawQuizCard();
}

function quizCardHtml(i, review){
  const qs=activeQuiz(); const q=qs[i]; const ans=state.quiz.answers[i];
  const locked=!!ans;
  const opts=q.opts.map((o,oi)=>{
    let cls="",mark="";
    if(locked && ans.pick===oi){
      const good=oi===q.c;
      cls=good?"opt-ok":"opt-no";
      mark=good?' <span class="markglyph" aria-label="correct">✓</span>':' <span class="markglyph" aria-label="wrong">✗</span>';
    }
    return '<div class="radio"><input type="radio" id="q'+i+"o"+oi+'" name="q'+i+'" value="'+oi+'"'+(ans&&ans.pick===oi?" checked":"")+(locked?" disabled":"")+
      '><label class="'+cls+'" for="q'+i+"o"+oi+'">'+o+mark+'</label></div>';
  }).join("");
  const nav = review ? "" : (locked
    ? '<button class="btn primary" data-quiz-next="'+i+'" type="button">'+(i===quizTotal()-1?"Finish inspection":"Next question →")+'</button>'
    : '<button class="btn primary" data-quiz-submit="'+i+'" type="button">Submit answer</button>');
  const expl = locked
    ? '<div class="qexpl '+(ans.pick===q.c?"ok":"no")+'" aria-live="polite"><b>'+
      (ans.pick===q.c?"Correct.":"Missed — the right answer is “"+q.opts[q.c]+"”.")+"</b> "+q.why+'</div>'
    : '<div class="qexpl" aria-live="polite" style="display:none"></div>';
  return '<div class="qcard" id="q-'+i+'"><h4>Q'+(i+1)+' · '+q.topic+'</h4><p class="qq">'+q.q+'</p>'+
    '<fieldset class="qopts-wrap" style="border:0;padding:0;margin:0 0 .4rem"><legend class="sr-only">'+esc(q.q)+'</legend>'+
    '<div class="qopts" role="radiogroup" aria-label="Answer options for question '+(i+1)+'">'+opts+'</div></fieldset>'+nav+expl+'</div>';
}

function drawQuizCard(){
  const i=state.quiz.current;
  document.getElementById("quiz-progress").innerHTML=
    '<span class="pill">Question '+(i+1)+' of '+quizTotal()+'</span><span class="pill">'+answeredCount()+' answered</span>'+
    '<span class="pill">'+(state.mode==="hard"?"strict mode":"tolerant mode")+'</span>';
  document.getElementById("quiz-card-slot").innerHTML=quizCardHtml(i,false);
  const sm=document.getElementById("quiz-summary"); sm.className="checkmsg"; sm.innerHTML="";
  document.getElementById("quiz-reviewbar").style.display="none";
}

function quizSubmit(i){
  const q=activeQuiz()[i];
  const chosen=document.querySelector('#quiz-card-slot input[name="q'+i+'"]:checked');
  if(!chosen){ toast("Pick an answer first — nothing is highlighted until you choose."); return; }
  if(!state.quiz.answers[i]) state.quiz.answers[i]={pick:parseInt(chosen.value,10)};
  /* QA fix (R2): lock the answered question immediately */
  document.querySelectorAll('#quiz-card-slot input[name="q'+i+'"]').forEach(x=>x.disabled=true);
  document.querySelector('#quiz-card-slot [data-quiz-submit="'+i+'"]').disabled=true;
  drawQuizCard(); /* re-renders locked card with ✓/✗ color state, explanation, and the gated Next control */
  queueSave();
}

function quizAdvance(i){
  if(!state.quiz.answers[i]){ toast("Lock in your answer first — submit before moving on."); return; }
  if(i<quizTotal()-1){ state.quiz.current=i+1; drawQuizCard(); queueSave(); return; }
  const qs=activeQuiz();
  state.quiz.score=qs.filter((qq,idx)=>state.quiz.answers[idx]&&state.quiz.answers[idx].pick===qq.c).length;
  state.quiz.done=true;
  drawQuizDone();
  toast("Inspection complete: "+state.quiz.score+"/"+qs.length);
  refreshTracker(); updateProgress(); queueSave();
  if(doneCount()===activeObjs().length) setTimeout(openCompletion,700);
}

function drawQuizDone(){
  const qs=activeQuiz();
  const prog=document.getElementById("quiz-progress");
  prog.innerHTML='<span class="pill">Inspection complete</span><span class="pill">'+state.quiz.score+' / '+quizTotal()+'</span>';
  document.getElementById("quiz-card-slot").innerHTML=qs.map((q,i)=>quizCardHtml(i,true)).join("");
  const sm=document.getElementById("quiz-summary");
  sm.className="checkmsg ok";
  sm.innerHTML="<b>Inspection complete — "+state.quiz.score+" / "+quizTotal()+"</b> · every explanation is the exam rationale; the missed topics also appear in your completion report’s focus areas.";
  document.getElementById("quiz-reviewbar").style.display="none";
}

/* ================= DEBRIEF ================= */
