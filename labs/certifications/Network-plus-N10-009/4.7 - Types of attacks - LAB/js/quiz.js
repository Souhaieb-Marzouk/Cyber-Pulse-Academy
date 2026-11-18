/*!
 * js/quiz.js - knowledge check: rendering, answer locking, the
 * selected-option color contract (green/red on the selected option only)
 * and scoring. The question banks live in data.js.
 */
/* ============ Quiz ============ */
function renderQuiz(){
 const bank=QUIZ[S.mode]; const q=ensureQuiz();
 $('#quizSub').textContent = S.mode==='hard'
  ? 'C5 · Night Watch — scenario items; application, not recall'
  : 'C5 · Day Watch — concept items; explanation after every answer';
 $('#quizBody').innerHTML = bank.map((b,i)=>{
  const sel=q.ans[i]; const ch=!!q.checked[i];
  const ok=sel===b.ans;
  const warn=!!(q.warn&&q.warn[i]);
  return `<div class="qcard"><div class="qn">Question ${i+1} / ${bank.length}</div><div class="qtext">${esc(b.q)}</div>
   <div class="qopts">${b.opts.map((op,j)=>`<label class="${ch&&j===sel?(ok?'sel-ok':'sel-bad'):''}"><input type="radio" name="q${i}" value="${j}" data-qi="${i}" ${sel===j?'checked':''} ${ch?'disabled':''}><span>${esc(op)}</span></label>`).join('')}</div>
   <div class="fbtns"><button class="btn amber" data-qcheck="${i}" type="button" ${ch?'disabled':''}>${ch?'Answered ✓':'Check answer'}</button></div>
   <div class="qres ${ch?'show '+(ok?'good':'badf'):(warn?'show warnmsg':'')}" id="qres-${i}">${ch?((ok?'✔ Correct. ':'✘ Not quite. ')+esc(b.exp)):(warn?'Choose an answer first — then press Check answer.':'')}</div>
  </div>`;
 }).join('');
}
