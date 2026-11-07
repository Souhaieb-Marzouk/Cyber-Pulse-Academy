/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* Review Board quiz: render, submit/lock, scoring, stars, focus areas, completion seal */
function openQuiz(){
  const q = S.quiz;
  const ovl = $id("ovlQuiz");
  const total = OBJ_LIST().length;
  if(S.quiz.done){ openDone(); return; }
  const list = S.mode === "M" ? MQUIZ : HQUIZ;
  if(q.i >= list.length){ finishQuiz(); return; }
  const item = list[q.i];
  const picked = q.answers[q.i];
  window.__opener = document.activeElement;
  ovl.innerHTML = `<div class="modal" role="document">
    <div class="row" style="justify-content:space-between"><h2>Review Board — ${S.mode==="M"?"Concept check":"Scenario check"}</h2>
      <button class="btn small" id="quizClose">Close</button></div>
    <p class="hinttext">Question ${q.i+1} of ${list.length} · ${total} objectives passed first. ${S.mode==="M"?"Pick the best answer — every answer is explained.":"Apply the lesson: justify from evidence."}</p>
    <div class="card mt"><h3 style="font-size:14.5px">${esCape(item.q)}</h3>
      <div class="optlist mt" role="radiogroup" aria-label="answers">
        ${item.o.map((o,i)=>`<label class="opt${picked&&picked.pick===i?(picked.correct?" sel-ok":" sel-no"):""}"><input type="radio" name="qz" value="${i}" ${picked&&picked.pick===i?"checked":""} ${picked?"disabled":""}> <span>${esCape(o)}</span></label>`).join("")}
      </div>
      ${picked ? `<div class="${picked.correct?"passmsg":"failmsg"}">${picked.correct?"✅ Correct.":"✗ Not this one."} ${esCape(item.e)}</div>` : ""}
      <div class="row mt">
        ${!picked ? `<button class="btn primary" id="quizSubmit">Submit answer</button>`
                  : q.i+1 < list.length ? `<button class="btn primary" id="quizNext">Next question</button>`
                  : `<button class="btn primary" id="quizFinish">Finish review</button>`}
      </div>
    </div></div>`;
  ovl.classList.add("on");
  const sub = $id("quizSubmit");
  if(sub) sub.addEventListener("click", () => {
    const sel = document.querySelector('input[name="qz"]:checked');
    if(sel === null){ toast("Select an answer first"); return; }
    const pick = +sel.value;
    S.quiz.answers[q.i] = {pick, correct: pick === item.a};
    save(); openQuiz(); announce(pick === item.a ? "Correct." : "Incorrect — read the explanation.");
  });
  const nxt = $id("quizNext"); if(nxt) nxt.addEventListener("click", () => { S.quiz.i++; save(); openQuiz(); });
  const fin = $id("quizFinish"); if(fin) fin.addEventListener("click", () => { finishQuiz(); });
  $id("quizClose").addEventListener("click", () => { ovl.classList.remove("on"); restoreFocus(); });
  const first = ovl.querySelector("input:not(:disabled), button"); if(first) first.focus();
}
function quizScore(){
  const list = S.mode === "M" ? MQUIZ : HQUIZ;
  const ans = S.quiz.answers.slice(0, list.length);
  const correct = ans.filter(x => x && x.correct).length;
  return list.length ? correct / list.length : 0;
}
function objScore(){
  const list = OBJ_LIST();
  const vals = list.map(o => {
    const st = S.objs[o.id];
    if(!st || !st.done) return 0;
    const base = st.firstTry ? 1 : 0.6;
    return Math.max(0.2, base - 0.04 * (st.hints||0));
  });
  return list.length ? vals.reduce((a,b)=>a+b,0)/list.length : 0;
}
function finishQuiz(){
  S.quiz.done = true; save();
  const ovl = $id("ovlQuiz"); ovl.classList.remove("on");
  announce("Review board finished. Computing deployment certification.");
  openDone();
}
function starCount(){
  const pct = 0.7 * objScore() + 0.3 * quizScore();
  return {pct, stars: Math.max(1, Math.min(5, Math.round(pct * 5)))};
}
function focusAreas(){
  const lines = [];
  OBJ_LIST().forEach(o => {
    const st = S.objs[o.id]; if(!st || !st.done) return;
    if(!st.firstTry) lines.push(`<b>${esCape(o.title)}</b> — took ${(st.attempts||2)} checks. Re-run it on a reset board and name the failing control aloud before touching the inspector.`);
    else if(st.hints > 0) lines.push(`<b>${esCape(o.title)}</b> — solved with ${S.mode==="M" ? st.hints+" hint"+(st.hints>1?"s":"") : "the nudge"}. Rebuild it without hints to prove mastery.`);
  });
  const qlist = S.mode === "M" ? MQUIZ : HQUIZ;
  (S.quiz.answers||[]).forEach((a,i) => {
    if(a && !a.correct && qlist[i]) lines.push(`<b>Review Board Q${i+1} (${esCape(qlist[i].tag||"review")})</b> — answered wrong. Reread its explanation, then re-derive the answer from the Traffic Lab before exam day.`);
  });
  if(!lines.length) lines.push(`None — every objective passed first attempt and the Review Board was clean. Keep sharp: run the other difficulty mode and re-explain each fault from the Alert Board evidence.`);
  return `<ul class="hinttext" style="margin:6px 0 0;padding-left:18px">${lines.slice(0,8).map(l=>`<li>${l}</li>`).join("")}</ul>`;
}
function openDone(){
  const ovl = $id("ovlDone");
  const {pct, stars} = starCount();
  const pillars = {P1:"UNDERSTAND", P2:"RECOGNIZE / ANALYZE", P3:"DETECT", P4:"MITIGATE"};
  const doneList = OBJ_LIST().filter(o => S.objs[o.id] && S.objs[o.id].done);
  window.__opener = document.activeElement;
  ovl.innerHTML = `<div class="modal" role="document">
    <div class="row" style="justify-content:space-between"><h2>Deployment Certification — NET-DEP-113</h2>
      <button class="btn small" id="doneClose">Close</button></div>
    <div class="seal anim" aria-hidden="true"><span style="font-size:11px">MERIDIAN · NIMBUSCLOUD</span><span class="stars">${"★".repeat(stars)}${"☆".repeat(5-stars)}</span><span style="font-size:10px">HYBRID CUTOVER ${S.mode==="M"?"MEDIUM":"HARD"} PASS</span></div>
    <p style="text-align:center"><b>Score ${(100*pct).toFixed(0)}% · ${doneList.length}/${OBJ_LIST().length} objectives · quiz ${(100*quizScore()).toFixed(0)}%</b><br>
    <span class="hinttext">Stars: 70% objectives (first-attempt accuracy, hints −4% each) + 30% quiz first-attempt accuracy.</span></p>
    <div class="card mt"><h3>Focus areas — from your actual run</h3>${focusAreas()}</div>
    <div class="pillrecap">
      ${Object.keys(pillars).map(p=>`<div><span class="pchip ${p.toLowerCase()}">${p}</span></div>
        <div>${doneList.filter(o=>o.pillar===p).map(o=>`✓ ${esCape(o.title)}`).join("<br>")||"—"}</div>`).join("")}
    </div>
    <div class="card mt"><h3>What to master next</h3>
      <p class="hinttext">You can now explain, recognize, detect and mitigate Lesson 1.3 end to end. Next: Cloud+ CV0-004 Lesson 1.4 (identity and access) and Domain 6 troubleshooting drills — practice naming the failing CONTROL from a symptom, exactly like the Traffic Lab taught. Then reread the Field Notes and try the other difficulty mode: the Hard board is a different experience of the same knowledge.</p></div>
    <div class="row mt"><button class="btn primary" id="doneNotes">Open Field Notes</button><button class="btn" id="doneClose2">Close</button></div>
  </div>`;
  ovl.classList.add("on");
  ["doneClose","doneClose2"].forEach(id => $id(id).addEventListener("click", () => { ovl.classList.remove("on"); restoreFocus(); }));
  $id("doneNotes").addEventListener("click", () => { ovl.classList.remove("on"); openNotes(); });
  const first = ovl.querySelector("button"); if(first) first.focus();
}

/* ---------- field notes (debrief) ---------- */
