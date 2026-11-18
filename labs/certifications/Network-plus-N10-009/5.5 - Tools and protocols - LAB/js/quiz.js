/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/quiz.js — knowledge check + completion report (stars, focus areas).
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
/* ================= quiz ================= */
function quizLocked(){ const r = S.quiz.results[S.quiz.idx]; return !!(r && r.locked); }
function renderQuiz(){
  const bank = QUIZ[S.mode]; if(!bank) return;
  const box = $('#quizBox'), sum = $('#quizSummary');
  if(S.quiz.done){
    box.classList.add('hidden'); sum.classList.remove('hidden');
    const n = bank.length;
    const okN = bank.filter((_, i) => S.quiz.results[i] && S.quiz.results[i].ok).length;
    const ftN = bank.filter((_, i) => S.quiz.results[i] && S.quiz.results[i].firstTry).length;
    const missed = bank.filter((_, i) => S.quiz.results[i] && !S.quiz.results[i].ok).map(q => q.topic);
    const uniq = Array.from(new Set(missed));
    sum.innerHTML = '<h3>Knowledge check complete</h3><p class="sub" style="margin-top:6px">' + okN + ' of ' + n + ' correct · ' + ftN + ' on the first attempt.' + (uniq.length ? ' Revisit: ' + uniq.join(', ') + '.' : ' Nothing missed — sharp work.') + '</p>';
    updateTracker();
    return;
  }
  box.classList.remove('hidden'); sum.classList.add('hidden');
  const qi = S.quiz.idx, q = bank[qi], res = S.quiz.results[qi];
  const prog = $('#quizProg'); prog.innerHTML = '';
  bank.forEach((_, j) => {
    const d = document.createElement('span'); d.className = 'qdot';
    const r = S.quiz.results[j];
    if(r && r.locked) d.classList.add(r.ok ? 'done-ok' : 'done-no');
    else if(j === qi) d.classList.add('cur');
    prog.appendChild(d);
  });
  $('#quizQ').textContent = 'Question ' + (qi + 1) + ' of ' + bank.length + ' — ' + q.q;
  $('#quizAlign').textContent = 'Maps to: ' + q.align;
  const opts = $('#quizOpts'); opts.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'qopt'; b.dataset.i = i;
    b.innerHTML = '<b>' + 'ABCD'[i] + '.</b><span>' + opt + '</span><span class="vtag"></span>';
    if(res && res.locked){
      b.disabled = true; b.classList.add('locked');
      if(res.choice === i){
        b.classList.add(res.ok ? 'is-right' : 'is-wrong');
        $('.vtag', b).textContent = res.ok ? 'CORRECT' : 'INCORRECT';
      }
    } else {
      b.addEventListener('click', () => {
        $$('.qopt', opts).forEach(x => x.classList.remove('selOpt'));
        b.classList.add('selOpt');
        $('#quizCheck').disabled = false;
        $('#quizCheck').setAttribute('aria-label', 'Check answer ' + 'ABCD'[i]);
      });
    }
    opts.appendChild(b);
  });
  const fb = $('#quizFb');
  if(res && res.locked){
    fb.className = 'fb show ' + (res.ok ? 'ok' : 'bad');
    fb.innerHTML = '<b>' + (res.ok ? 'Correct. ' : 'Incorrect. ') + '</b>' + q.why + '<br><b>Why the others tempt:</b> ' + q.whyNot.join(' ');
  } else { fb.className = 'fb'; fb.innerHTML = ''; }
  $('#quizCheck').disabled = true; // enabled only when an option is selected (no false highlight on empty submit)
  $('#quizNext').disabled = !(res && res.locked);
  $('#quizNext').textContent = (qi === bank.length - 1) ? 'FINISH QUIZ' : 'NEXT →';
  $('#quizRetry').classList.toggle('hidden', !(res && res.locked && !res.ok));
}
function bindQuiz(){
  $('#quizCheck').addEventListener('click', () => {
    if(quizLocked()) return;
    const sel = $('.qopt.selOpt'); if(!sel) return;
    const qi = S.quiz.idx, bank = QUIZ[S.mode], q = bank[qi];
    const choice = Number(sel.dataset.i);
    const prev = S.quiz.results[qi];
    const attempts = (prev && prev.attempts ? prev.attempts : 0) + 1;
    const ok = choice === q.correct;
    S.quiz.results[qi] = {choice: choice, ok: ok, attempts: attempts, firstTry: attempts === 1 && ok, locked: true};
    $$('.qopt', $('#quizOpts')).forEach(b => {
      const i = Number(b.dataset.i);
      b.disabled = true; b.classList.add('locked'); b.classList.remove('selOpt');
      if(i === choice){
        b.classList.add(ok ? 'is-right' : 'is-wrong');
        $('.vtag', b).textContent = ok ? 'CORRECT' : 'INCORRECT';
      }
    });
    const fb = $('#quizFb');
    fb.className = 'fb show ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = '<b>' + (ok ? 'Correct. ' : 'Incorrect. ') + '</b>' + q.why + '<br><b>Why the others tempt:</b> ' + q.whyNot.join(' ');
    $('#quizNext').disabled = false;
    $('#quizRetry').classList.toggle('hidden', ok);
    save(); updateTracker();
    if(Object.keys(S.quiz.results).length === bank.length && bank.every((_, i) => S.quiz.results[i] && S.quiz.results[i].locked)) finishQuiz();
  });
  $('#quizRetry').addEventListener('click', () => {
    const r = S.quiz.results[S.quiz.idx];
    if(r && r.locked){ r.locked = false; save(); renderQuiz(); }
  });
  $('#quizNext').addEventListener('click', () => {
    if(!quizLocked()) return;
    const bank = QUIZ[S.mode];
    if(S.quiz.idx < bank.length - 1){ S.quiz.idx++; save(); renderQuiz(); }
    else finishQuiz();
  });
}
function finishQuiz(){
  if(S.quiz.done) return;
  S.quiz.done = true; save(); renderQuiz(); checkCompletion();
}

/* ================= completion ================= */
function starSvg(on){
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z');
  p.setAttribute('class', on ? 'starOn' : 'starOff');
  svg.appendChild(p);
  return svg;
}
function starCount(){
  const ids = OBJ_ORDER[S.mode] || [];
  const objFirst = ids.filter(id => S.obj[id] && S.obj[id].status === 'passed' && !(S.obj[id].attempts > 0)).length;
  const bank = QUIZ[S.mode] || [];
  const quizFirst = bank.filter((_, i) => S.quiz.results[i] && S.quiz.results[i].firstTry).length;
  const pct = (objFirst + quizFirst) / (ids.length + bank.length);
  return pct >= 0.8 ? 3 : (pct >= 0.55 ? 2 : 1);
}
function focusAreas(){
  const bank = QUIZ[S.mode] || [];
  const areas = [];
  bank.forEach((q, i) => {
    const r = S.quiz.results[i];
    if(r && r.locked && !r.ok){
      areas.push({topic: q.topic, txt: 'Knowledge check: missed “' + q.q.slice(0, 58) + '…” — re-read the <b>' + q.topic + '</b> card in the knowledge core, then redo the matching instrument.'});
    }
  });
  (OBJ_ORDER[S.mode] || []).forEach(id => {
    const st = S.obj[id];
    if(st && st.status === 'passed' && st.attempts > 0){
      areas.push({topic: OBJ[id].topic, txt: 'Took ' + (st.attempts + 1) + ' checks on “' + OBJ[id].title + '” — run the ' + OBJ[id].topic + ' workflow once more to lock it in.'});
    }
  });
  const seen = new Set(), out = [];
  areas.forEach(a => { if(!seen.has(a.topic + a.txt.slice(0, 20))){ seen.add(a.topic + a.txt.slice(0, 20)); out.push(a); } });
  return out.slice(0, 6);
}
function renderDone(){
  const stars = starCount();
  const row = $('#starRow'); row.innerHTML = '';
  for(let i = 0; i < 3; i++) row.appendChild(starSvg(i < stars));
  row.setAttribute('aria-label', stars + ' of 3 stars');
  const ids = OBJ_ORDER[S.mode] || [];
  const passed = ids.filter(id => S.obj[id] && S.obj[id].status === 'passed').length;
  const bank = QUIZ[S.mode] || [];
  const okN = bank.filter((_, i) => S.quiz.results[i] && S.quiz.results[i].ok).length;
  $('#doneStats').innerHTML = '<p><b>' + passed + '/' + ids.length + '</b> objectives validated · <b>' + okN + '/' + bank.length + '</b> quiz questions correct.</p><p class="sub" style="margin-top:4px">Mode: ' + S.mode.toUpperCase() + ' shift · rating: ' + stars + '/3 stars (first-attempt accuracy).</p>';
  const list = $('#focusList'); list.innerHTML = '';
  const fa = focusAreas();
  if(!fa.length){
    const li = document.createElement('li');
    li.innerHTML = '<b>Clean shift.</b> No weak spots detected from your evidence. Stretch goal: rerun the bench in the other mode — the harder set changes the questions and the interpretation depth.';
    list.appendChild(li);
  } else {
    fa.forEach(a => { const li = document.createElement('li'); li.innerHTML = '<b>' + a.topic + ':</b> ' + a.txt; list.appendChild(li); });
  }
  $('#doneFoot').textContent = 'Field notes (section 6) hold the full root-cause table, the command cheat sheet and the N10-009 objective map for review.';
}
function checkCompletion(){
  if(!S.mode) return;
  const ids = OBJ_ORDER[S.mode] || [];
  const ready = ids.every(id => S.obj[id] && S.obj[id].status === 'passed') && S.quiz.done;
  const btn = $('#viewReportBtn');
  btn.classList.toggle('hidden', !ready);
  if(ready && !S.doneShown){
    S.doneShown = true; save();
    renderDone(); openModal('doneModal');
  }
}
