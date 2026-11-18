/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/objectives.js — objective engine: auto-validation, tracker, CHECK RESULTS forms.
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
/* ================= objectives engine ================= */
function passObjective(id, quietToast){
  const o = S.obj[id] || (S.obj[id] = {status:'pending', attempts:0, fb:null, fbOk:false});
  o.status = 'passed'; save(); updateTracker();
  if(!quietToast) toast('Objective validated — ' + OBJ[id].title);
}
function autoCheck(){
  if(!S.mode) return;
  OBJ_ORDER[S.mode].forEach(id => {
    const o = OBJ[id];
    let st = S.obj[id];
    if(!o.auto || (st && st.status === 'passed')) return;
    let pass = false;
    if(id === 'm-ipconfig') pass = S.cmds.some(c => /^ipconfig\s+\/?all/.test(c.raw) || /^ifconfig\s+-a/.test(c.raw));
    else if(id === 'm-pingpair') pass = S.cmds.some(c => c.cmd === 'ping' && /10\.20\.40\.20/.test(c.raw)) && S.cmds.some(c => c.cmd === 'ping' && /filesrv/.test(c.raw));
    else if(id === 'm-nslookup') pass = S.cmds.some(c => (c.cmd === 'nslookup' || c.cmd === 'dig') && /filesrv/.test(c.raw) && !/10\.20\.40\.10/.test(c.raw));
    else if(id === 'h-dig') pass = S.cmds.some(c => ((c.cmd === 'dig' && /@10\.20\.40\.10/.test(c.raw)) || (c.cmd === 'nslookup' && /10\.20\.40\.10/.test(c.raw))) && /filesrv/.test(c.raw));
    else if(id === 'm-capture') pass = S.an.captured && S.an.opened === 'p3' && /dns/.test(S.an.filter.trim().toLowerCase());
    if(pass){ st = S.obj[id] || (S.obj[id] = {status:'pending', attempts:0, fb:null, fbOk:false}); st.fb = o.fbOk; st.fbOk = true; passObjective(id); }
  });
}

/* ================= tracker ================= */
function updateTracker(){
  const ids = OBJ_ORDER[S.mode] || [];
  const list = $('#objList'); list.innerHTML = '';
  let passed = 0;
  ids.forEach(id => {
    const o = OBJ[id], st = S.obj[id] || {status:'pending', attempts:0};
    if(st.status === 'passed') passed++;
    const card = document.createElement('div');
    card.className = 'objCard ' + (st.status === 'passed' ? 'passed' : st.status === 'failed' ? 'failed' : '');
    const led = document.createElement('span');
    led.className = 'led ' + (st.status === 'passed' ? 'on' : st.status === 'failed' ? 'warn' : '');
    const main = document.createElement('div'); main.className = 'objMain';
    const t = document.createElement('div'); t.className = 'objTitle'; t.textContent = o.title; main.appendChild(t);
    const meta = document.createElement('div'); meta.className = 'objMeta';
    const ptag = document.createElement('span'); ptag.className = 'tag ' + o.pillar.toLowerCase(); ptag.textContent = o.pillar + ' · ' + ({P1:'Understand',P2:'Identify',P3:'Detect',P4:'Mitigate'}[o.pillar]);
    const ttag = document.createElement('span'); ttag.className = 'tag'; ttag.textContent = o.topic;
    const mtag = document.createElement('span'); mtag.className = 'tag'; mtag.textContent = o.auto ? 'AUTO-VALIDATED BY THE BENCH' : 'CHECK RESULTS';
    meta.appendChild(ptag); meta.appendChild(ttag); meta.appendChild(mtag);
    if(st.attempts > 0){ const atag = document.createElement('span'); atag.className = 'tag'; atag.textContent = st.attempts + ' failed check' + (st.attempts > 1 ? 's' : ''); meta.appendChild(atag); }
    main.appendChild(meta);
    if(st.fb){
      const fbd = document.createElement('div'); fbd.className = 'objFb show'; fbd.textContent = st.fb; main.appendChild(fbd);
    }
    card.appendChild(led); card.appendChild(main);
    const go = document.createElement('button'); go.className = 'gotoBtn'; go.textContent = 'GO TO';
    go.setAttribute('aria-label', 'Go to ' + o.title);
    go.addEventListener('click', () => { const el = $(o.goto); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); });
    card.appendChild(go);
    list.appendChild(card);
  });
  const total = ids.length;
  const qres = Object.keys(S.quiz.results).length;
  $('#objSummary').textContent = total + ' hands-on objectives on this shift · ' + passed + ' validated so far. Auto objectives pass the moment the bench sees the right evidence; FINDING forms validate on CHECK RESULTS.';
  $('#progressFill').style.width = (total ? Math.round(passed / total * 100) : 0) + '%';
  $('#progressLabel').textContent = passed + '/' + total + ' obj · quiz ' + qres + '/' + (QUIZ[S.mode] ? QUIZ[S.mode].length : 0);
  checkCompletion();
}

/* ================= finding forms ================= */
function saveFormInputs(form){
  S.inputs[form.id] = $$('input,select', form).map(el => ({n: el.name || el.id, v: el.value, c: el.checked}));
}
function lockForm(form, locked){
  $$('input,select', form).forEach(i => { i.disabled = locked; });
  $$('.choice', form).forEach(l => l.classList.toggle('locked', locked));
  const cb = $('.checkBtn', form); if(cb) cb.disabled = locked;
}
function clearFormVisuals(form){
  $$('.choice', form).forEach(l => { l.classList.remove('is-right','is-wrong'); const v = $('.verdict', l); if(v) v.textContent = ''; });
}
function bindForms(){
  $$('.finding').forEach(form => {
    const fid = form.id, objId = form.dataset.obj, kind = form.dataset.kind;
    const sol = (form.dataset.sol || '').split(',').filter(Boolean);
    const check = $('.checkBtn', form), retry = $('.retryBtn', form), fb = $('.fb', form);
    form.addEventListener('change', () => saveFormInputs(form));
    check.addEventListener('click', () => {
      if(check.disabled) return;
      let vals;
      if(kind === 'plan') vals = ['planEAST','planWING','planGST'].map(id => document.getElementById(id).value);
      else vals = $$('input:checked', form).map(i => i.value);
      const empty = !vals.length || (kind === 'plan' && vals.some(v => !v));
      if(empty){
        fb.className = 'fb show info';
        fb.textContent = 'Select an answer first — with nothing selected nothing is judged and nothing is highlighted.';
        return;
      }
      let ok;
      if(kind === 'plan') ok = vals.slice().sort().join(',') === '1,11,6';
      else if(kind === 'multi'){ const a = vals.slice().sort(), b = sol.slice().sort(); ok = a.length === b.length && a.every((v,i) => v === b[i]); }
      else ok = vals.length === 1 && sol.includes(vals[0]);
      lockForm(form, true);
      if(kind !== 'plan'){
        $$('input:checked', form).forEach(inp => {
          const lab = inp.closest('.choice');
          lab.classList.add(ok ? 'is-right' : 'is-wrong');
          const v = $('.verdict', lab); if(v) v.textContent = ok ? 'CORRECT' : 'INCORRECT';
        });
      }
      S.formChecked[fid] = {ok: ok, values: vals};
      const o = S.obj[objId] || (S.obj[objId] = {status:'pending', attempts:0, fb:null, fbOk:false});
      if(ok){
        o.fb = OBJ[objId].fbOk; o.fbOk = true;
        fb.className = 'fb show ok'; fb.innerHTML = OBJ[objId].fbOk;
        passObjective(objId, true);
        toast('Objective validated — ' + OBJ[objId].title);
        retry.classList.add('hidden');
      } else {
        o.attempts++; o.status = 'failed'; o.fb = OBJ[objId].fbBad; o.fbOk = false;
        fb.className = 'fb show bad'; fb.innerHTML = OBJ[objId].fbBad;
        retry.classList.remove('hidden');
      }
      save(); updateTracker();
    });
    retry.addEventListener('click', () => {
      unlockForm(form);
      S.formChecked[fid] = null;
      saveFormInputs(form);
      fb.className = 'fb show info';
      fb.textContent = 'Attempt cleared — make a fresh choice and CHECK RESULTS. The earlier check still counts as an attempt.';
      retry.classList.add('hidden');
      save();
    });
  });
}
function unlockForm(form){
  lockForm(form, false);
  clearFormVisuals(form);
  $$('input[type="radio"],input[type="checkbox"]', form).forEach(i => { i.checked = false; });
  $$('select', form).forEach(s => { s.value = ''; });
  const fb = $('.fb', form); if(fb){ fb.className = 'fb'; fb.textContent = ''; }
}
function restoreForms(){
  $$('.finding').forEach(form => {
    const fid = form.id, objId = form.dataset.obj, kind = form.dataset.kind;
    const fc = S.formChecked[fid];
    if(fc && fc.values && fc.values.length){
      if(kind === 'plan'){
        const map = {planEAST:0, planWING:1, planGST:2};
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if(el) el.value = fc.values[map[id]] || ''; });
      } else {
        $$('input', form).forEach(i => { i.checked = fc.values.includes(i.value); });
      }
      lockForm(form, true);
      if(kind !== 'plan'){
        $$('input:checked', form).forEach(inp => {
          const lab = inp.closest('.choice');
          lab.classList.add(fc.ok ? 'is-right' : 'is-wrong');
          const v = $('.verdict', lab); if(v) v.textContent = fc.ok ? 'CORRECT' : 'INCORRECT';
        });
      }
      const fb = $('.fb', form);
      if(fb){ fb.className = 'fb show ' + (fc.ok ? 'ok' : 'bad'); fb.innerHTML = fc.ok ? OBJ[objId].fbOk : OBJ[objId].fbBad; }
      const retry = $('.retryBtn', form);
      if(retry && !fc.ok) retry.classList.remove('hidden');
    } else if(S.inputs[fid]){
      S.inputs[fid].forEach(sv => {
        const el = $('input[name="' + sv.n + '"]', form) || document.getElementById(sv.n);
        if(el){ el.checked = !!sv.c; if(el.tagName === 'SELECT') el.value = sv.v || ''; }
      });
    }
  });
}
