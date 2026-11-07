"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/quiz.js
   CAPTAIN'S EXAMINATION — pick/lock/score and the Examination tab renderer.
   Answers lock on submit; a missed item shows its explanation without revealing
   the correct option in green (audit rule R3).
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

/* ---------------- quiz ---------------- */
function quizPick(qi,oi){
  if(S.quiz.locked[qi]!==undefined) return;
  S.quiz.answers[qi]=oi; S.quiz.locked[qi]=true;
  var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED;
  logEvent(oi===qz[qi].a?"ok":"info","examination: question "+(qi+1)+" answered "+(oi===qz[qi].a?"correctly":"incorrectly"));
  saveSoon(); renderExam(); renderStatus(); maybeComplete();
}
function quizScore(){ var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED; var n=0; for(var i=0;i<qz.length;i++){ if(S.quiz.answers[i]===qz[i].a) n++; } return n; }

function renderExam(){
  var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED;
  var h='<div class="stencil">Captain\u2019s examination — '+(S.mode==="hard"?"7 scenario items":"6 concept questions")+"</div>"
   +'<p class="note">Each answer locks and explains itself — treat wrong turns as free teaching. Best taken after the work orders.</p>';
  var correct=quizScore();
  qz.forEach(function(q,qi){
    var locked=S.quiz.locked[qi]!==undefined, pick=S.quiz.answers[qi];
    h+='<div class="qcard"><div class="qn">Q'+(qi+1)+(locked?(pick===q.a?" · CORRECT":" · MISSED"):"")+'</div><div class="qtext">'+esc(q.q)+"</div>";
    q.opts.forEach(function(o,oi){
      var cls="qopt"; if(locked){ if(oi===pick) cls+=(pick===q.a?" correct":" wrong"); }
      h+='<label class="'+cls+'"><input type="radio" name="q'+qi+'" data-act="quiz" data-q="'+qi+'" data-opt="'+oi+'" '+(locked?"disabled":"")+(pick===oi?" checked":"")+'><span>'+esc(o)+"</span></label>";
    });
    if(locked) h+='<div class="qwhy">'+(pick===q.a?"":"<b>Correct answer:</b> "+esc(q.opts[q.a])+" — ")+esc(q.why)+"</div>";
    h+="</div>";
  });
  var n=Object.keys(S.quiz.locked).length;
  h+='<p class="note"><b>'+correct+"/"+qz.length+" correct</b> · "+n+"/"+qz.length+" answered.</p>";
  $("wb-exam").innerHTML=h;
}
