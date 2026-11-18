/* ================= QUIZ — foreman's knowledge check =================
   Locked until every work order passes. One-shot answers (R2),
   only-the-selected-option coloring (R3), verdict announced and focus
   moved to the next unanswered question (R2). */

/* ---------- quiz ---------- */
function renderQuiz(){
  const dock = $("#quiz-dock");
  const list = woList();
  const allDone = list.every(o => woState(o.id).passed);
  const body = $("#quiz-body");
  if(!allDone){
    dock.classList.remove("hidden");
    $("#quiz-hintline").textContent = "Locked — finish the work orders first (" +
      list.filter(o=>woState(o.id).passed).length + "/" + list.length + ")";
    body.innerHTML = '<p style="color:#c3cbd4;font-size:14px">The foreman quizzes clerks who finished the floor. Complete every work order, then the clipboard unlocks here.</p>';
    return;
  }
  dock.classList.remove("hidden");
  const qs = S.mode === "hard" ? QUIZ_HARD : QUIZ_MED;
  $("#quiz-hintline").textContent = S.mode === "hard" ? "Scenario triage — choose, then read the debrief" : "Concept check — every answer teaches";
  body.innerHTML = '<div class="quiz-score-strip" id="quiz-strip">Score <b id="quiz-score">' + S.quiz.correct + '/' + qs.length + '</b>' +
    (S.quiz.done ? ' · <span style="color:#63d494">Quiz complete — debriefed below</span>' : ' · answer each question; it locks with an explanation') + '</div>';
  qs.forEach((q, qi) => {
    const answered = S.quiz.answers[qi] !== undefined;
    const qEl = document.createElement("div");
    qEl.className = "quiz-q";
    qEl.innerHTML = '<div class="q-num">Question ' + (qi+1) + ' of ' + qs.length + '</div><h3>'+esc(q.q)+'</h3>' +
      '<div class="quiz-opts" role="radiogroup" aria-label="Question '+(qi+1)+'">' +
      q.o.map((opt, oi) => {
        let cls = "quiz-opt";
        /* R3: only the SELECTED option is colored — green if it was right, red if wrong.
           The correct answer is never revealed by color on a wrong submission;
           the explanation text below carries the teaching instead. */
        if(answered && S.quiz.answers[qi] === oi){
          cls += " " + (oi === q.a ? "correct" : "wrong");
        }
        return '<label class="'+cls+'"><input type="radio" name="q'+qi+'" value="'+oi+'" '+(S.quiz.answers[qi]===oi?"checked":"")+(answered?" disabled":"")+'> '+esc(opt)+'</label>';
      }).join("") + '</div>' +
      (answered ? '<div class="quiz-expl" tabindex="0"><b>'+(S.quiz.answers[qi]===q.a?"Correct.":"Not quite.")+'</b> '+esc(q.e)+'</div>' : "");
    body.appendChild(qEl);
  });
}

/* quiz answer handler — delegated once from boot */
function handleQuizChange(ev){
  const radio = ev.target.closest("input[type=radio]");
  if(!radio || !radio.name.startsWith("q")) return;
  const qi = parseInt(radio.name.slice(1), 10);
  if(S.quiz.answers[qi] !== undefined) return;
  S.quiz.answers[qi] = parseInt(radio.value, 10);
  const qs2 = S.mode === "hard" ? QUIZ_HARD : QUIZ_MED;
  const isRight = S.quiz.answers[qi] === qs2[qi].a;
  S.quiz.correct = qs2.reduce((n,q,i)=> n + (S.quiz.answers[i]===q.a?1:0), 0);
  S.quiz.scorePct = Math.round(S.quiz.correct/qs2.length*100);
  S.quiz.done = qs2.every((q,i)=>S.quiz.answers[i]!==undefined);
  save();
  renderQuiz();
  updateProgress();
  /* R2: the answer is locked (radios disabled + state guard above) and the student
     is moved on — verdict announced, focus handed to the next unanswered question. */
  const verdict = (isRight ? "Correct. " : "Not quite. ") + qs2[qi].e;
  announce(S.quiz.done ? verdict + " Quiz complete: " + S.quiz.correct + " out of " + qs2.length + "." : verdict, !isRight);
  const nextQi = qs2.findIndex((q,i)=>S.quiz.answers[i]===undefined);
  if(nextQi !== -1){
    const qEl = document.querySelectorAll(".quiz-q")[nextQi];
    if(qEl){
      qEl.scrollIntoView({behavior:"smooth", block:"center"});
      const inp = qEl.querySelector(".quiz-opt input");
      if(inp) inp.focus({preventScroll:true});
    }
  }
  if(S.quiz.done){
    toast("Quiz complete: " + S.quiz.correct + "/" + qs2.length + " — open the Shipping Manifest.");
    const mb = $("#manifest-btn"); if(mb) mb.focus();
  }
}
