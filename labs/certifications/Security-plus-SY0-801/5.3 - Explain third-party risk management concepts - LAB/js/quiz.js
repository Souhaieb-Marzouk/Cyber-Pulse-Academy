"use strict";
/* =========================================================================
   js/quiz.js — knowledge checks (C5) + board-resolution completion modal
   Scoring contract (v4 audit): first-try scoring; a checked question is
   LOCKED (validator idempotent, inputs disabled, persisted); only the
   selected answer is highlighted (green correct / red wrong — the correct
   answer is never revealed on a wrong submission); completion gate requires
   all objectives stamped and all quiz items answered; the completion report
   derives focus areas from the student's actual performance evidence.
   ========================================================================= */

function quizHTML(){
  var set = state.mode === "medium" ? QUIZ.medium : QUIZ.hard;
  var h = '<div class="quiz" id="doc-quiz"><div class="quiz-head"><h3>'+(state.mode==="medium"?"Knowledge check — 7 concepts":"War room quiz — 7 decisions")+'</h3>'+
    '<span class="qmeta" id="quiz-meta">'+quizCheckedCount()+'/'+set.length+' answered</span></div><div class="quiz-body">';
  for (var i=0;i<set.length;i++){ h += quizCardHTML(set[i]); }
  h += '</div></div>';
  return h;
}
function quizCardHTML(q){
  var opts = "";
  for (var i=0;i<q.opts.length;i++){
    opts += '<label class="choice"><input type="radio" name="g_q.'+q.id+'" data-env="q.'+q.id+'" value="'+q.opts[i][0]+'"><span>'+q.opts[i][1]+'</span></label>';
  }
  return '<div class="qq" id="qq-'+q.id+'">'+
    '<div style="font-size:15px;font-weight:600">'+q.q+'</div><div role="group" aria-label="Answer options">'+opts+'</div>'+
    '<button type="button" class="check-btn" data-quiz-check="'+q.id+'">Check answer</button>'+
    '<div class="explain" id="qx-'+q.id+'" aria-live="polite"></div></div>';
}
function quizSet(){ return state.mode === "medium" ? QUIZ.medium : QUIZ.hard; }
function quizCheckedCount(){ var s = quizSet(), n = 0; for (var i=0;i<s.length;i++){ if (state.quiz.checked[s[i].id]) n++; } return n; }

function concludeHTML(){
  var total = modeObjs().length, done = 0;
  for (var i=0;i<total;i++){ if (objState(modeObjs()[i].id).done) done++; }
  return '<div class="doc fiction" id="doc-conclude"><div class="doc-head"><h3>Board resolution — conclude the '+(state.mode==="medium"?"review cycle":"war room")+'</h3><span class="doc-kind">completion</span></div>'+
    '<div class="doc-body"><p style="font-size:14.5px;color:var(--ink-soft)">Stamp all '+total+' objectives and answer all 7 knowledge-check items, then sign the board resolution.</p>'+
    '<p style="font-size:14px;color:var(--muted)" id="conclude-status">'+concludeStatusText()+'</p>'+
    '<button type="button" class="check-btn" id="btn-conclude">✒ Sign the board resolution</button></div></div>';
}
function concludeStatusText(){
  var total = modeObjs().length, done = 0;
  for (var i=0;i<total;i++){ if (objState(modeObjs()[i].id).done) done++; }
  var qc = quizCheckedCount(), qt = quizSet().length;
  return "Objectives: "+done+"/"+total+" stamped · Knowledge check: "+qc+"/"+qt+" answered";
}

/* ---------- Quiz ---------- */
function checkQuiz(qid){
  var set = quizSet(), q = null;
  for (var i=0;i<set.length;i++){ if (set[i].id === qid) q = set[i]; }
  /* QA fix (R2): a checked question is locked — re-checking is impossible */
  if (!q || state.quiz.checked[qid]) return;
  var picked = state.env["q."+qid];
  if (!picked){
    var x0 = $("qx-"+qid); x0.className = "explain bad"; x0.style.display = "block";
    x0.textContent = "Pick an answer first — every option here is plausible, which is the point.";
    return;
  }
  var correct = picked === q.ans;
  state.quiz.tried[qid] = (state.quiz.tried[qid] || 0) + 1;
  state.quiz.checked[qid] = true;
  state.quiz.picked[qid] = picked;
  if (correct && state.quiz.tried[qid] === 1) state.quiz.answers[qid] = "first";
  else state.quiz.answers[qid] = correct ? "later" : "wrong";
  if (!state.lastQz) state.lastQz = {};
  state.lastQz[qid] = { ok: correct, html: "<b>"+(correct?"Correct.":"Not quite.")+"</b> "+q.ex };
  applyQuizCardState(qid);
  $("quiz-meta").textContent = quizCheckedCount()+"/"+quizSet().length+" answered";
  announce(correct ? "Quiz answer correct — answer locked." : "Quiz answer incorrect — answer locked; read the explanation.");
  save();
  var st = $("conclude-status"); if (st) st.textContent = concludeStatusText();
}
/* QA fix (R3): only the SELECTED answer is colored — green if it was correct, red if wrong;
   the correct answer is never revealed on a wrong submission. Locked inputs stay disabled. */
function applyQuizCardState(qid){
  var card = $("qq-"+qid); if (!card) return;
  var q = null, set = quizSet();
  for (var i=0;i<set.length;i++){ if (set[i].id === qid) q = set[i]; }
  if (!q) return;
  var checked = !!state.quiz.checked[qid];
  var picked = state.quiz.picked[qid];
  var pickedWasCorrect = checked && picked === q.ans;
  var labels = card.querySelectorAll(".choice");
  for (var j=0;j<labels.length;j++){
    var inp = labels[j].querySelector("input");
    if (checked){
      inp.disabled = true;
      if (picked && inp.value === picked){
        labels[j].classList.add(pickedWasCorrect ? "sel-ok" : "sel-no");
        labels[j].classList.remove(pickedWasCorrect ? "sel-no" : "sel-ok");
      }
    } else {
      inp.disabled = false;
      labels[j].classList.remove("sel-ok"); labels[j].classList.remove("sel-no");
    }
  }
  var btn = card.querySelector("[data-quiz-check]");
  if (btn) btn.disabled = checked;
  var x = $("qx-"+qid);
  if (checked && state.lastQz && state.lastQz[qid]){
    x.className = "explain" + (state.lastQz[qid].ok ? "" : " bad"); x.style.display = "block";
    x.innerHTML = state.lastQz[qid].html;
  }
}
function restoreQuizStates(){
  var set = quizSet();
  for (var i=0;i<set.length;i++){ applyQuizCardState(set[i].id); }
}

/* ---------- Conclude & completion ---------- */
function allDone(){
  var objs = modeObjs();
  for (var i=0;i<objs.length;i++){ if (!objState(objs[i].id).done) return false; }
  return true;
}
function quizAllChecked(){
  var s = quizSet();
  for (var i=0;i<s.length;i++){ if (!state.quiz.checked[s[i].id]) return false; }
  return true;
}
function starCount(){
  var objs = modeObjs(), first = 0, misses = 0, hints = 0;
  for (var i=0;i<objs.length;i++){
    var os = objState(objs[i].id);
    if (os.done && os.first) first++; else if (os.done) misses++;
    hints += os.hint;
  }
  var quizFirst = 0;
  var s = quizSet();
  for (var j=0;j<s.length;j++){ if (state.quiz.answers[s[j].id] === "first") quizFirst++; }
  var penalty = (objs.length - first) * 0.3 + hints * (state.mode === "medium" ? 0.2 : 0.5) + (s.length - quizFirst) * 0.15;
  var stars = Math.round(5 - penalty);
  return Math.max(1, Math.min(5, stars));
}
function openCompletion(){
  state.completed = true;
  var stars = starCount(), objs = modeObjs();
  var first = 0, misses = 0;
  for (var i=0;i<objs.length;i++){ var os = objState(objs[i].id); if (os.done && os.first) first++; else if (os.done) misses++; }
  var starsHTML = "";
  for (var s=0;s<5;s++){ starsHTML += '<span class="star'+(s<stars?"":" off")+'" aria-hidden="true">★</span>'; }
  $("done-stars").innerHTML = starsHTML;
  $("stars-note").textContent = stars+" of 5 stars — from first-attempt accuracy ("+first+"/"+objs.length+" objectives, quiz included) and hint usage.";
  var quizFirst = 0; var qs = quizSet();
  for (var j=0;j<qs.length;j++){ if (state.quiz.answers[qs[j].id] === "first") quizFirst++; }
  $("done-stats").innerHTML =
    '<div class="m-stat"><b>'+objs.length+'/'+objs.length+'</b><span>objectives stamped</span></div>'+
    '<div class="m-stat"><b>'+Math.round(first/objs.length*100)+'%</b><span>first-attempt objectives</span></div>'+
    '<div class="m-stat"><b>'+quizFirst+'/'+qs.length+'</b><span>quiz correct first try</span></div>';
  var pillars = {P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]}, names = {P1:"Understand",P2:"Recognize / analyze",P3:"Detect / monitor",P4:"Mitigate"};
  for (var k=0;k<objs.length;k++){ var o = objs[k]; pillars[o.pillar][1]++; if (objState(o.id).done) pillars[o.pillar][0]++; }
  var recap = "";
  ["P1","P2","P3","P4"].forEach(function(pk){
    var d = pillars[pk][0], t = pillars[pk][1];
    recap += '<div class="pr-row"><span class="pillar '+pk+'">'+pk+'</span><span style="min-width:150px">'+names[pk]+'</span><span class="bar"><i style="width:'+Math.round(d/t*100)+'%"></i></span><span class="pr-n">'+d+'/'+t+'</span></div>';
  });
  $("done-recap").innerHTML = recap;
  /* QA fix (R8): focus areas derived from the student's actual performance evidence */
  var primerFor = {
    "OBJ-M1":"§1 Vendor selection","OBJ-M2":"§1 Vendor selection","OBJ-M3":"§1 Vendor selection",
    "OBJ-M4":"§2 Agreement types","OBJ-M5":"§2 Agreement types","OBJ-M6":"§3 Vendor monitoring",
    "OBJ-M7":"§3 Vendor monitoring","OBJ-M8":"§3 Vendor monitoring","OBJ-M9":"§3 Vendor monitoring",
    "OBJ-M10":"§5 Rules of engagement","OBJ-M11":"§4 Limitations","OBJ-M12":"§4 Limitations",
    "OBJ-H1":"evidence triage on the war-room desk","OBJ-H2":"§1 Vendor selection · the registry","OBJ-H3":"§2 Agreement types",
    "OBJ-H4":"§1 Vendor selection","OBJ-H5":"incident response · §3 Vendor monitoring","OBJ-H6":"§3 Vendor monitoring",
    "OBJ-H7":"§4 Limitations","OBJ-H8":"§2 Agreement types","OBJ-H9":"§3 Vendor monitoring","OBJ-H10":"§3 Vendor monitoring"
  };
  var quizTopic = {
    mq1:"RFx documents", mq2:"MSA vs SOW", mq3:"SLA vs SLO", mq4:"MOU vs MOA", mq5:"SOC 2 types",
    mq6:"Vendor lock-in", mq7:"Conflicts of interest", hq1:"Questionnaires vs attestations", hq2:"RFx selection",
    hq3:"Measurable SLOs", hq4:"Right-to-audit alternatives", hq5:"ROE out-of-scope findings",
    hq6:"Fourth-party jurisdiction", hq7:"ROI-proportionate controls"
  };
  var focus = [];
  for (var fi=0;fi<objs.length;fi++){
    var fo = objs[fi], fos = objState(fo.id);
    if (fos.done && !fos.first){ focus.push("<li><b>Revisit:</b> "+fo.title+" — needed "+fos.tries+" checks. Re-read Background readings "+(primerFor[fo.id]||"§1")+" and redo this exercise.</li>"); }
    else if (fos.done && fos.hint > 0){ focus.push("<li><b>Hint-supported:</b> "+fo.title+" — try it again cold tomorrow without hints.</li>"); }
  }
  for (var qi=0;qi<qs.length;qi++){
    var qq = qs[qi];
    if (state.quiz.answers[qq.id] !== "first"){ focus.push("<li><b>Knowledge gap:</b> "+(quizTopic[qq.id]||qq.id)+" — re-read the explanation under this quiz item, then the matching reading.</li>"); }
  }
  $("done-focus").innerHTML = focus.length
    ? "<h3>Focus areas — from your own results</h3><ul>"+focus.join("")+"</ul>"
    : "<h3>Focus areas — from your own results</h3><p>Clean first pass: no weak areas detected. Advance to <b>5.4 effective security compliance</b> and <b>5.2 risk management</b> next.</p>";
  openOverlay("done-overlay");
  announce("Review cycle complete. "+stars+" of 5 stars.");
  save();
}
function conclude(){
  if (!allDone() || !quizAllChecked()){
    var st = $("conclude-status");
    if (st) st.textContent = concludeStatusText() + " — finish both before signing.";
    announce("Not ready to conclude: stamp all objectives and answer the knowledge check first.");
    return;
  }
  openCompletion();
}
