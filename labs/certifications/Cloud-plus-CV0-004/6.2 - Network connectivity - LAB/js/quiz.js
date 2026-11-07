'use strict';
/* =====================================================================
   QUIZ — knowledge check rendering, submit/next/retake, R3 color contract
   ===================================================================== */
/* ---------------- quiz ---------------- */
const QUIZ_LIST = () => S.mode === 'medium' ? QUIZ_M : QUIZ_H;
function renderQuiz(){
  const q = S.quiz, list = QUIZ_LIST();
  const body = $('#quizBody');
  if(!q.done && q.idx >= list.length){ q.done = true; }
  if(q.done){
    const score = q.answers.filter(a => a.pick === a.correct).length;
    body.innerHTML = `<div class="quizCard rise"><span class="qNum">KNOWLEDGE CHECK — ${S.mode === 'medium' ? 'CONCEPTS' : 'SCENARIOS'}</span>
      <h2 style="margin:8px 0">Quiz complete</h2>
      <div class="scoreBig">${score} / ${list.length}</div>
      <p style="color:var(--mut);margin:8px 0">${score === list.length ? 'Flawless. The bench has nothing left to hide from you.' : 'Every explanation below the fold is exam-grade — revisit the ones you missed, then re-run the related bench case.'}</p>
      ${q.answers.map((a,i) => `<div style="border-top:1px dashed var(--edge);margin-top:10px;padding-top:10px">
        <p style="font-size:13.5px"><b style="color:${a.pick === a.correct ? 'var(--green)' : 'var(--red)'}">Q${i+1} ${a.pick === a.correct ? '✓' : '✗'}</b> ${esc(list[i].q)}</p>
        <p style="font-size:13px;color:var(--mut);margin-top:4px">${esc(list[i].exp)}</p></div>`).join('')}
      <div class="quizFoot"><button class="rbtn" id="quizRetake">Retake quiz</button></div></div>`;
    $('#quizRetake').addEventListener('click', () => { S.quiz = { idx:0, answers:[], done:false, picked:null }; save(); renderQuiz(); refreshProgress(); });
    refreshProgress(); return;
  }
  const item = list[q.idx];
  const picked = q.picked;
  const submitted = picked !== null;
  const perm = seededPerm('quiz|' + S.mode + '|' + q.idx, item.opts.length); // R4: rotated per item, deterministic across reloads
  body.innerHTML = `<div class="quizCard rise"><span class="qNum">QUESTION ${q.idx+1} / ${list.length}</span>
    <h3>${esc(item.q)}</h3>
    <div role="radiogroup" aria-label="Quiz answers">
    ${perm.map(oi => {
      const sel = picked === oi;
      const cls = submitted
        ? (sel ? (oi === item.correct ? 'correct' : 'wrong') : '') // R3: only the selected answer is colored; the right answer is never revealed in green on a wrong pick
        : (sel ? 'picked' : '');
      return `<label class="qOpt ${cls}"><input type="radio" name="quizOpt" value="${oi}" ${sel ? 'checked' : ''} ${submitted ? 'disabled' : ''}> <span>${esc(item.opts[oi])}</span></label>`;
    }).join('')}
    </div>
    ${submitted ? `<div class="qExp"><b>${picked === item.correct ? '✓ Correct.' : '✗ The stronger answer:'}</b> ${esc(item.exp)}</div>` : ''}
    <div class="quizFoot">
      ${submitted ? `<button class="rbtn finish" id="quizNext">${q.idx + 1 === list.length ? 'See results' : 'Next question'}</button>` : `<button class="rbtn finish" id="quizSubmit" disabled>Submit answer</button>`}
      <span style="font-size:12.5px;color:var(--mut)">${S.mode === 'hard' ? 'Scenario mode — justify from evidence, not recall.' : 'One try per question; explanations after every answer.'}</span>
    </div></div>`;
  $$('input[name="quizOpt"]', body).forEach(r => r.addEventListener('change', () => {
    q.picked = parseInt(r.value,10); save();
    $$('.qOpt', body).forEach(l => l.classList.remove('picked'));
    r.closest('.qOpt').classList.add('picked');
    $('#quizSubmit').disabled = false;
  }));
  const sub = $('#quizSubmit');
  if(sub) sub.addEventListener('click', () => {
    if(q.picked === null) return;
    q.answers[q.idx] = { pick: q.picked, correct: item.correct };
    save(); renderQuiz();
  });
  const nx = $('#quizNext');
  if(nx) nx.addEventListener('click', () => {
    q.idx++; q.picked = null;
    if(q.idx >= list.length){ q.done = true; }
    save(); renderQuiz(); refreshProgress();
  });
}
