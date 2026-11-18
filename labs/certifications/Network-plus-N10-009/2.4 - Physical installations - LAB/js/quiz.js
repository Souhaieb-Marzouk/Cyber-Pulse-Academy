/* ============================================================
   js/quiz.js — knowledge check (per-mode banks, locked answers,
   best-score-kept), glossary, debrief and completion modal renderers
   (incl. evidence-based focus areas).
   ============================================================ */
"use strict";
/* ================= QUIZ / GLOSSARY / DEBRIEF / COMPLETION / WIRING ================= */

function quizBank(){ return S.mode==="H" ? QUIZ_H : QUIZ_M; }

function renderQuiz(){
  const body=document.getElementById("quizBody");
  const bank=quizBank();
  if(!S.mode){ body.innerHTML="<p>Pick a mode first.</p>"; return; }
  if(S.quiz.i>=bank.length){
    const correct=bank.filter((q,i)=>S.quiz.answers[i]===q.ans).length;
    const pct=Math.round(correct/bank.length*100);
    if(S.quizBest==null || pct>S.quizBest) S.quizBest=pct;
    S.quiz.done=true;
    body.innerHTML=`<div class="card"><h4>Knowledge check complete</h4>
      <p><strong>${correct} / ${bank.length} correct (${pct} %).</strong> ${pct>=80?"Sign-off quality.":"Review the debrief and retake any time — your best score is kept."}</p>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" data-action="quiz-restart">Retake</button>
        <button class="btn" data-action="debrief-open">Open the debrief</button>
        <button class="btn amber" data-action="close-modal">Back to the room</button></div></div>`;
    save(); return;
  }
  const q=bank[S.quiz.i];
  const picked=S.quiz.answers[S.quiz.i];
  const revealed = picked!=null;
  document.getElementById("quizT").textContent = `Knowledge check — ${S.mode==="H"?"Hard":"Medium"} · Q${S.quiz.i+1}/${bank.length}`;
  body.innerHTML=`<div class="q-prog">QUESTION ${S.quiz.i+1} OF ${bank.length}</div>
    <div class="card"><h4>${esc(q.q)}</h4>
    ${q.opts.map((o,i)=>{
      let cls="", mark="";
      if(revealed && i===picked){ cls = (picked===q.ans) ? "right" : "wrong"; mark = cls==="right" ? "✓ " : "✕ "; }
      return `<button class="q-opt ${cls}" data-action="quiz-pick" data-i="${i}" ${revealed?"disabled":""}>${mark}${esc(o)}</button>`;
    }).join("")}
    ${revealed?`<div class="q-expl"><strong>${picked===q.ans?"Correct.":"Not quite."}</strong> ${esc(q.expl)}</div>`:""}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn sm" data-action="quiz-prev" ${S.quiz.i===0?"disabled":""}>◀ Previous</button>
      <button class="btn sm amber" data-action="quiz-next" ${!revealed?"disabled":""}>${S.quiz.i===bank.length-1?"See score":"Next ▶"}</button>
    </div>`;
  save();
}

function renderGlossary(){
  document.getElementById("glossBody").innerHTML =
    `<p class="fine">One-line definitions used throughout Room 104.</p>
     <div class="gloss">${GLOSSARY.map(g=>`<div class="g-card"><b>${esc(g.t)}</b><p>${esc(g.d)}</p></div>`).join("")}</div>`;
}

function renderDebrief(){
  const objLink = "https://www.comptia.org/en-us/certifications/network";
  document.getElementById("debBody").innerHTML = `
    <div class="card"><h4>Detection opportunities (what a defender monitors)</h4>
      <p><strong>Environmental:</strong> cold-aisle intake temp/RH trend with alerts at the band edges (18–27 °C, 40–60 % RH, simplified) — example logic: <span class="evidence" style="display:block;margin-top:4px">alert when intake_temp &gt; 27 °C for 5 min OR intake_rh &lt; 40 % OR intake_rh &gt; 60 %</span></p>
      <p><strong>Power:</strong> UPS transfer/battery events, breaker trips, CRAC fault codes, generator/ATS test results — example logic: <span class="evidence" style="display:block;margin-top:4px">alert on ups_on_battery OR breaker_trip OR crac_fault_code</span></p>
      <p><strong>Physical:</strong> under-floor leak rope, door contact, smoke — and a quarterly SPOF + rack-elevation audit.</p></div>
    <div class="card"><h4>Mitigation recommendations (with the standards behind them)</h4>
      <p>SPD at the service entrance · UPS sized load × 1.25 (PF 0.8, simplified) · generator + ATS for long outages · dual PSUs on independent A/B feeds · circuits ≤ 80 % continuous (simplified) · lockable racks · blanking panels + sealed cutouts · hot/cold aisles with perforated tiles · CRAC N+1 · tuned temp/RH alarms · under-floor leak detection with auto shutoff · clean-agent suppression (simplified) · position-based labeling (TIA-606-style, simplified).</p>
      <p class="fine">Standards referenced in simplified teaching form: ASHRAE TC 9.9 thermal guidelines · TIA-942 (datacenter) · NEC branch-circuit practice · TIA-606 (labeling).</p></div>
    <div class="card"><h4>Blue-team takeaways</h4>
      <p>1) Monitor the air gear breathes, not the room average. 2) Alarms at band edges turn a thermal excursion into a work order instead of an outage. 3) Redundancy only counts when paths are independent — audit for shared strips and unsplit PSUs. 4) A noisy log is normal; your thresholds decide what deserves a human. 5) Recovery is confirmed by measurement (intake back in band), not by hope.</p></div>
    <div class="card"><h4>Builder / red-team-mindset takeaways</h4>
      <p>1) The cheapest place to fail a room is the work order — heavy-high racks, shared power strips and open cutouts all look harmless on paper. 2) Every blank you skip and every cutout you leave open quietly raises intake temperature. 3) “Same strip for both PSUs” is the classic false redundancy. 4) Kinked copper and mislabeled ports are tomorrow's troubleshooting tax. 5) Sprinklers protect the building, not the gear.</p></div>
    <div class="card"><h4>References (open in a new tab)</h4>
      <p><a href="${objLink}" target="_blank" rel="noopener">CompTIA Network+ N10-009 certification &amp; objectives (official)</a></p>
      <p class="fine">This lab covers objective 2.4 “Explain important factors of physical installations” — installation implications, power considerations, environmental factors.</p></div>`;
}

function renderDone(){
  const p=updateProgress();
  const pctAll = p.total? Math.round(p.done/p.total*100) : 0;
  const score = p.score;
  const stars = score>=90?5:score>=75?4:score>=60?3:score>=40?2:1;
  const starStr = "★".repeat(stars)+"<span class='off'>"+"★".repeat(5-stars)+"</span>";
  const ids=curObjs();
  const recap={U:[0,0],R:[0,0],D:[0,0],M:[0,0]};
  ids.forEach(id=>{const m=OBJMETA[id]; recap[m.pillar][1]++; if(objState(id).done) recap[m.pillar][0]++;});
  const names={U:"Understand",R:"Recognize / Analyze",D:"Detect",M:"Mitigate / Install"};
  const missed=ids.filter(id=>!objState(id).done);
  // R8: focus areas derived from actual performance evidence (hints, failed checks, star losses, quiz misses)
  const fa=(()=>{
    const items=[];
    ids.forEach(id=>{
      const st=objState(id), m=OBJMETA[id];
      if(!st.done) return;
      const why=[];
      if(st.hints>0) why.push(S.mode==="H" ? "emergency nudge used" : st.hints+" hint"+(st.hints>1?"s":"")+" used");
      if(st.attempts>1) why.push((st.attempts-1)+" failed check"+(st.attempts>2?"s":""));
      if(st.stars>0 && st.stars<3) why.push(st.stars+"★ of 3");
      if(why.length) items.push({id, title:m.title, tab:m.console, why:why.join(" · ")});
    });
    const bank=quizBank();
    const missQ=[]; bank.forEach((q,i)=>{ if(S.quiz.answers[i]!=null && S.quiz.answers[i]!==q.ans) missQ.push(i+1); });
    return {items, missQ, quizTaken:S.quiz.answers.some(a=>a!=null)};
  })();
  const conName={briefing:"Briefing",rack:"Rack Works",power:"Power Works",climate:"Climate Works",signoff:"Sign-off Desk"};
  const focusCard=`<div class="card"><h4>Focus areas — where to sharpen up</h4>${
    (fa.items.length||fa.missQ.length||!fa.quizTaken)?`
    ${fa.items.length?`<ul>${fa.items.map(f=>`<li style="margin-bottom:6px"><strong>OBJ ${f.id} — ${esc(f.title)}</strong> <span class="fine">(${esc(f.why)})</span><br>
      <button class="btn sm" data-action="set-tab" data-tab="${f.tab}">Reopen ${conName[f.tab]}</button></li>`).join("")}</ul>`:""}
    ${fa.missQ.length?`<p>Knowledge check: missed Q${fa.missQ.map(n=>"&nbsp;"+n).join(", Q")} — reread the matching console sections above, then retake the quiz (your best score is kept).</p>`:""}
    ${!fa.quizTaken?`<p>The knowledge check is untaken — it carries 30 % of the sign-off score.</p>`:""}`
    :`<p>Evidence-backed clean run: every objective signed first-try with no hints, and no quiz misses recorded on this attempt. Nothing to revisit — continue to lesson 2.3.</p>`}
  </div>`;
  document.getElementById("doneBody").innerHTML=`
    <div class="done-score">
      <div class="big-stars" aria-label="${stars} of 5 stars">${starStr}</div>
      <div><div style="font-family:var(--mono);font-size:26px;font-weight:800">${score} / 100</div>
      <div class="fine">objectives stars ${p.stars}/${p.maxS} (70 %) · quiz best ${p.quizPct} % (30 %)</div></div>
      <div class="chip ${p.quizPct>0?"green":""}">quiz ${p.quizBest==null?"not taken":p.quizPct+" %"}</div>
    </div>
    <div class="pillar-recap">${Object.keys(recap).map(k=>`<div class="pr-card"><span class="pillar ${k}" style="display:inline-block;margin-bottom:4px">${names[k]}</span><b>${recap[k][0]}/${recap[k][1]}</b></div>`).join("")}</div>
    ${focusCard}
    <div class="card"><h4>Where to go next</h4>
      <p>${missed.length? "Revisit: "+missed.map(id=>OBJMETA[id].title+" ("+id+")").join(" · ")+".":""}
      Then continue the N10-009 path: <strong>2.3</strong> (cabling &amp; termination testing) is the natural sequel to this lesson, followed by Domain 3 operations. Deep-dive the real standards when ready: ASHRAE TC 9.9 thermal guidelines and TIA-942. The debrief modal holds the defender's summary.</p>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn" data-action="debrief-open">Open debrief</button>
        <button class="btn" data-action="quiz-open">Retake quiz</button>
        <button class="btn amber" data-action="close-modal">Back to Room 104</button></div></div>`;
  announce(`Commissioning complete. Score ${score} of 100, ${stars} of 5 stars.`);
  if(!S.finished){ S.finished=true; save(); }
}
