/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Exam-hall quiz: render, submit gate, marking contract, lock.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

function renderQuiz(){
  const m=state.mode; const body=$("#quizBody");
  if(!m){ body.innerHTML=""; return; }
  const q=state.quiz[m]; const bank=QUIZ[m];
  body.innerHTML=bank.map((item,i)=>{
    const picked=q.answers[i];
    const marked=q.submitted;
    // R3 color contract: only the SELECTED option is highlighted — green if it was
    // correct, red if it was wrong; the correct option is never revealed on a wrong pick.
    return `<div class="qcard"><h4>Q${i+1}. ${esc(item.q)}</h4>
      <div class="qopts">${item.opts.map((o,oi)=>{
        let mark="", cls="";
        if(marked && picked===oi){
          cls = picked===item.correct ? "pick-good" : "pick-bad";
          mark = picked===item.correct ? ` <b style="color:var(--moss)">✓ correct</b>` : ` <b style="color:var(--red)">✗ incorrect</b>`;
        }
        return `<label class="${cls}"><input type="radio" name="qz${i}" value="${oi}" ${picked===oi?"checked":""} ${marked?"disabled":""}>
        <span>${esc(o)}${mark}</span></label>`; }).join("")}</div>
      ${marked?`<div class="qexp ${picked===item.correct?"ok":"bad"}">${picked===item.correct?"✔ Correct.":"✘ Not quite."} ${esc(item.exp)}</div>`:""}
    </div>`;
  }).join("");
  if(!q.submitted){
    $$("#quizBody input[type=radio]").forEach(r=>r.addEventListener("change",()=>{
      const i=parseInt(r.name.slice(2),10); state.quiz[m].answers[i]=parseInt(r.value,10);
      save(); updateMeter();
    }));
  }
  $("#quizSubmit").textContent = q.submitted ? "Sheet marked — answers locked ✓" : "Submit sheet for marking";
  $("#quizSubmit").disabled = q.submitted;
  $("#quizScore").textContent = q.submitted ? `MARKED: ${q.score}/${bank.length} correct` : "";
}
function submitQuiz(){
  const m=state.mode; if(!m) return;
  const bank=QUIZ[m]; const q=state.quiz[m];
  const unanswered=bank.map((_,i)=>i).filter(i=>q.answers[i]===undefined);
  if(unanswered.length){
    $("#quizScore").textContent=`Answer every question first — still open: ${unanswered.map(i=>"Q"+(i+1)).join(", ")}`;
    announce("The sheet is not complete. Questions left: "+unanswered.map(i=>String(i+1)).join(", "));
    return;
  }
  let correct=0; bank.forEach((item,i)=>{ if(q.answers[i]===item.correct) correct++; });
  q.submitted=true; q.score=correct;
  save(); renderQuiz(); updateMeter();
  announce(`Quiz marked: ${correct} of ${bank.length} correct. Answers are now locked.`);
  maybeCert();
}

/* ---------- work orders / check engine ---------- */
