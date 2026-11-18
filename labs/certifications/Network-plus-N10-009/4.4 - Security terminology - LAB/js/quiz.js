'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/quiz.js — knowledge quiz bank + quiz UI ============ */
/* ================= Knowledge quizzes (C5) ================= */
const QUIZ = {
  medium:[
    {q:'A weakness in a system, process or control that can be taken advantage of is a…',o:['Threat','Vulnerability','Exploit','Mitigation'],a:1},
    {q:'"Likelihood of harm × impact of harm" best describes…',o:['Risk','Threat actor','Attack vector','Confidentiality'],a:0},
    {q:'A doctor views records of patients they are not treating. Which CIA pillar is harmed?',o:['Confidentiality','Integrity','Availability','None'],a:0},
    {q:'Ransomware that encrypts a file server primarily attacks which pillar?',o:['Confidentiality','Integrity','Availability','Risk'],a:2},
    {q:'Code written to take advantage of a specific weakness is called…',o:['A vulnerability','An exploit','A threat actor','A control'],a:1},
    {q:'Which action is a mitigation that reduces risk?',o:['Publishing the vulnerability publicly','Deploying the vendor patch','Ignoring the intel bulletin','Disabling backups'],a:1}
  ],
  hard:[
    {q:'For a threat actor to cause an incident, it typically needs an exploit and a…',o:['Firewall','Vulnerability','Backup','Dashboard'],a:1},
    {q:'Lab result values were silently changed in storage. Which pillar?',o:['Confidentiality','Integrity','Availability','Scalability'],a:1},
    {q:'Which of these is a compensating control?',o:['Buying a new hospital','Isolating an unpatchable host on a restricted VLAN with logging','Deleting the asset inventory','Turning off alerts'],a:1},
    {q:'A risk score of 12 (5×5 matrix) falls in which band?',o:['Low (1–4)','Medium (5–9)','High (10–14)','Critical (15–25)'],a:2},
    {q:'An alert matches your authorized vulnerability scanner\u2019s schedule and source IP. First step?',o:['Declare a breach immediately','Verify it against the scan schedule and asset list before responding','Unplug the whole network','Pay a ransom'],a:1},
    {q:'A compromised host with an active web shell is confirmed. The FIRST containment action is…',o:['Write the report','Isolate the host from the network','Patch next Tuesday','Update the risk register'],a:1},
    {q:'Data being exfiltrated through DNS beaconing primarily harms…',o:['Availability','Confidentiality','Integrity','Likelihood'],a:1}
  ]
};

/* ---------- quiz (C5) ---------- */
function quizHTML(){
  const qs=S.mode==='medium'?QUIZ.medium:QUIZ.hard;
  const n=qs.length;
  return '<section class="card" id="quiz-card" aria-labelledby="c5"><h2 id="c5">Knowledge Quiz ('+n+' questions · '+n*10+' pts)</h2>'+
  (S.quizDone?'<div class="feedback ok">✔ Quiz complete — all answers correct. '+n*10+' points awarded.</div>'+quizLocked()
   :qs.map((q,i)=>'<div class="field"><span class="lbl">Q'+(i+1)+'. '+h(q.q)+'</span>'+
     '<div role="radiogroup" aria-label="Question '+(i+1)+'">'+q.o.map((o,oi)=>'<div class="chk"><input type="radio" name="qz'+i+'" id="qz'+i+'-'+oi+'" class="ans-quiz" value="'+oi+'"><label for="qz'+i+'-'+oi+'">'+h(o)+'</label></div>').join('')+'</div></div>').join('')+
   '<div class="feedback" id="quiz-fb" role="status" aria-live="polite"></div>'+
   '<button class="btn primary" data-act="quizcheck">Check quiz</button>')+'</section>';
}
function quizLocked(){
  const qs=S.mode==='medium'?QUIZ.medium:QUIZ.hard;
  return qs.map((q,i)=>'<div class="field"><span class="lbl">Q'+(i+1)+'. '+h(q.q)+'</span><div style="color:var(--ok);font-size:.92rem">Answer: '+h(q.o[q.a])+'</div></div>').join('');
}
function checkQuiz(){
  const qs=S.mode==='medium'?QUIZ.medium:QUIZ.hard;
  const fb=document.getElementById('quiz-fb');
  const wrong=[]; const answered=[];
  qs.forEach((q,i)=>{ const selEl=document.querySelector('input[name="qz'+i+'"]:checked');
    if(!selEl){answered.push(i+1);return;}
    if(Number(selEl.value)!==q.a)wrong.push(i+1); });
  if(answered.length){ fb.className='feedback bad'; fb.textContent='Answer all questions first: Q'+answered.join(', Q'); return; }
  if(wrong.length){ fb.className='feedback bad'; fb.textContent='✘ Not yet. Re-read the Knowledge Core and re-check question(s) Q'+wrong.join(', Q'); return; }
  S.quizDone=true; save();
  document.getElementById('quiz-card').outerHTML=quizHTML();
  refreshTracker();
  if(allDone()&&!S.completed)completeLab();
}
