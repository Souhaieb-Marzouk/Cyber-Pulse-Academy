/*!
 * js/objectives.js - mission cards, ledger, and the CHECK RESULTS
 * engine (validation, lock-on-solve, attempts, stars, progress ring).
 */
/* ============ Mission ledger ============ */
function fieldHTML(o,f,a){
 const val=a.v;
 const attr=`data-f="${o.id}|${f.k}"`;
 const lock=a.solved?'disabled':'';
 if(f.t==='select'){
  return `<div class="f-row"><label>${esc(f.label)}</label><select ${attr} ${lock}>${f.opts.map(op=>`<option value="${op.v}" ${val[f.k]===op.v?'selected':''}>${esc(op.l)}</option>`).join('')}</select></div>`;
 }
 if(f.t==='text'){
  return `<div class="f-row"><label>${esc(f.label)}</label><input type="text" ${attr} ${lock} value="${esc(val[f.k]||'')}" placeholder="${esc(f.ph||'')}"></div>`;
 }
 if(f.t==='multi'){
  const sel=val[f.k]||[];
  return `<div class="f-row"><label>${esc(f.label)}</label><div class="multi">${f.opts.map(op=>`<label><input type="checkbox" ${attr} data-mv="${op.v}" ${sel.includes(op.v)?'checked':''} ${lock}><span>${esc(op.l)}</span></label>`).join('')}</div></div>`;
 }
 if(f.t==='order'){
  const ranks=val[f.k]||[];
  return `<div class="f-row"><label>${esc(f.label)}</label>${f.items.map((it,i)=>`
   <div class="orderrow"><select ${attr} data-oi="${i}" ${lock} aria-label="Rank for step ${i+1}">
    ${f.items.map((_,r)=>`<option value="${r+1}" ${String(r+1)===String(ranks[i])?'selected':''}>${r+1}</option>`).join('')}
   </select><span>${esc(it)}</span></div>`).join('')}</div>`;
 }
 if(f.t==='duo'){
  const idx=f.k.slice(1);
  return `<div class="f-row"><label>${esc(f.label)}</label>
   <select data-f="${o.id}|fc${idx}" ${lock} aria-label="Console for ${esc(f.label)}">${CONS_OPTS.map(op=>`<option value="${op.v}" ${val['fc'+idx]===op.v?'selected':''}>${esc(op.l)}</option>`).join('')}</select>
   <select data-f="${o.id}|fa${idx}" ${lock} aria-label="Attack for ${esc(f.label)}" style="margin-top:6px">${ATK_OPTS.map(op=>`<option value="${op.v}" ${val['fa'+idx]===op.v?'selected':''}>${esc(op.l)}</option>`).join('')}</select>
  </div>`;
 }
 return '';
}
function objCard(o){
 const a=ensureAns(o.id);
 const solved=a.solved;
 const hard=S.mode==='hard';
 const fh=o.fields.length ? o.fields.map(f=>fieldHTML(o,f,a)).join('')
  : `<p class="evtags">This objective reads console state directly — set the controls in ${o.cons?consoleById(o.cons).name:'the console'}, then check here.</p>`;
 const hintBtn = hard
  ? `<button class="btn" data-nudge="${o.id}" type="button" ${a.nudge?'disabled':''}>${a.nudge?'Nudge used (−1 star)':'Request nudge (costs score)'}</button>`
  : `<button class="btn" data-hint="${o.id}" type="button" ${a.hintShown>=3?'disabled':''}>${a.hintShown>=3?'Hints used 3/3':'Hint ('+a.hintShown+'/3 used)'}</button>`;
 const shownHint = (!hard && a.hintShown>0) ? `<div class="hintbox show"><b>Hint ${a.hintShown}/3:</b> ${esc(o.hints[a.hintShown-1]||'')}</div>` : '';
 const shownNudge = (hard && a.nudge) ? `<div class="hintbox show"><b>Nudge:</b> ${esc(o.nudge||'')}</div>` : '';
 return `<div class="mcard ${solved?'done':''}" id="card-${o.id}">
  <div class="mcard-head"><span class="oid">OBJ-${o.id}</span><span class="pillar ${o.pillar}" title="${o.pillar} mastery pillar">${o.pillar}</span>
   <span class="mstat ${solved?'done':''}" id="st-${o.id}">${solved?'SOLVED ✓':'OPEN'}</span></div>
  <div class="mtitle">${esc(o.title)}</div>
  <p class="mbrief">${esc(o.brief)}</p>
  <div class="manchor">Evidence: ${o.cons?`<button type="button" data-go="${o.cons}">${consoleById(o.cons).name} →</button>`:'Field Manual / this form'} · ${esc(o.anchor)}</div>
  ${fh}
  <div class="fbtns"><button class="btn amber" data-check="${o.id}" type="button" ${solved?'disabled':''}>Check results</button>${solved?'':hintBtn}</div>
  <div class="fb" id="fb-${o.id}" role="status"></div>
  ${shownHint}${shownNudge}
 </div>`;
}
function renderLedger(){
 const objs=OBJS_BY_MODE(S.mode);
 $('#ledgerSub').textContent = S.mode==='medium' ? 'Day Watch · '+objs.length+' missions · guided' : 'Night Watch · '+objs.length+' challenges · discovery';
 $('#ledgerList').innerHTML = objs.map(objCard).join('');
 $('#ledgerFoot').textContent = S.mode==='medium'
  ? 'Hints are free to open — they cost stars, never progress. Wrong answers get teaching feedback.'
  : 'Strict validation: exact values, exact order. One paid nudge per challenge (−1 star each). Red herrings are intentional.';
}
function refreshCardStatus(id){
 const o=OBJ_DEFS.find(x=>x.id===id); if(!o) return;
 const solved=!!(S.ans[id]&&S.ans[id].solved);
 const card=$('#card-'+id), st=$('#st-'+id);
 if(card) card.classList.toggle('done',solved);
 if(st){ st.textContent=solved?'SOLVED ✓':'OPEN'; st.classList.toggle('done',solved); }
}
function allSolved(){ return OBJS_BY_MODE(S.mode).every(o=>S.ans[o.id]&&S.ans[o.id].solved); }
function checkObjective(id){
 const o=OBJ_DEFS.find(x=>x.id===id); if(!o) return;
 const a=ensureAns(id);
 const fb=$('#fb-'+id);
 if(a.solved){
  if(fb){ fb.className='fb show good'; fb.textContent='Already solved and locked — the answer cannot change. (RESET returns the whole watch to pristine.)'; }
  announce('Objective '+id+' is already solved and locked.');
  return;
 }
 let res;
 try{ res=o.check(a.v,S); }
 catch(err){ res={ok:false,msg:'Validation error: '+err.message}; }
 if(res.ok && !a.solved){ a.solved=true; }
 if(!res.ok){ a.attempts++; }
 if(fb){ fb.className='fb show '+(res.ok?'good':'bad'); fb.textContent=res.msg; }
 if(res.ok){
  const card=$('#card-'+id);
  if(card) card.querySelectorAll('select,input,button[data-check]').forEach(el=>{el.disabled=true;});
  if(o.envPanel) renderConsole(o.envPanel);
 }
 save(); updateProgress(); refreshCardStatus(id);
 announce(res.ok?('Objective '+id+' solved — its answers are now locked. '+res.msg):('Objective '+id+' not yet: '+res.msg));
 if(allSolved()){ announce('All missions solved — press Finish Watch for your change-over report.'); }
}
/* ============ Progress & stars ============ */
function updateProgress(){
 const objs=OBJS_BY_MODE(S.mode);
 const done=objs.filter(o=>S.ans[o.id]&&S.ans[o.id].solved).length;
 const frac=objs.length?done/objs.length:0;
 $('#ringFg').style.strokeDashoffset=String(88*(1-frac));
 $('#progObj').textContent=done+'/'+objs.length;
 const bank=QUIZ[S.mode]; const q=ensureQuiz();
 const checked=bank.filter((b,i)=>q.checked[i]).length;
 $('#progQuiz').textContent='quiz '+checked+'/'+bank.length;
}
function starScore(){
 let extra=0,hints=0,nudges=0;
 OBJS_BY_MODE(S.mode).forEach(o=>{ const a=S.ans[o.id]; if(!a) return;
  extra+=Math.max(0,a.attempts||0); hints+=a.hintShown||0; nudges+=(a.nudge?1:0); });
 let s=5-0.25*extra-0.75*hints-1*nudges;
 return Math.max(1,Math.min(5,Math.round(s*2)/2));
}
function quizScore(){ const bank=QUIZ[S.mode]; const q=ensureQuiz();
 return bank.filter((b,i)=>q.checked[i]&&q.ans[i]===b.ans).length; }
