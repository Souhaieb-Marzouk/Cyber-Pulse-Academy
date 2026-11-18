'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — objectives engine (duty board + CHECK RESULTS)
   The per-objective validation RULES live in js/data.js (they are
   authored content: each objective's check is part of its answer key).
   This module is the ENGINE around them: attempt counting, hint tiers,
   sign-off + lock, feedback rendering, and the duty-board chrome
   (shift lead, pillar tallies, progress lamp, finish gate).
   ===================================================================== */

/* ---------- small template helpers used by objective ui() ---------- */
const sel=(act,val,opts,k,lbl)=>`<select data-act="${act}" ${k?`data-k="${k}"`:''} aria-label="${esc(lbl||act)}">
  <option value="">— select —</option>${opts.map(o=>`<option value="${esc(o.v)}" ${val===o.v?'selected':''}>${esc(o.t)}</option>`).join('')}</select>`;
const stamps=(act,r,val)=>['auth','unauth'].map(v=>`<button class="stampbtn ${val===v?(v==='auth'?'picked ok-pick':'picked bad-pick'):'picked-none'}"
  data-act="${act}" data-r="${r}" data-v="${v}" aria-pressed="${val===v}">${v==='auth'?'Authorized':'Unauthorized'}</button>`).join('');
function seqUI(key,pool,chosen){
  const inBank=pool.filter(p=>!chosen.includes(p));
  return `<div class="obj-ui"><div class="seqpool" aria-label="chosen order">
    ${chosen.map((id,i)=>{const s=SEQ_STEPS[key+'_'+id]||SEQ_STEPS[id];
      return `<div class="seqitem"><span class="ord">${i+1}</span><span class="txt">${esc(s)}</span>
      <span class="mv"><button data-act="seqmv" data-key="${key}" data-i="${i}" data-d="-1" aria-label="move up">▲</button>
      <button data-act="seqmv" data-key="${key}" data-i="${i}" data-d="1" aria-label="move down">▼</button></span>
      <button class="stampbtn seqrm" data-act="seqrm" data-key="${key}" data-id="${id}" aria-label="remove step">×</button></div>`;}).join('')
    ||'<p class="hintline">Empty — click steps from the bank below in the order you would perform them.</p>'}</div>
  <div class="bank" aria-label="step bank">${inBank.map(id=>{const s=SEQ_STEPS[key+'_'+id]||SEQ_STEPS[id];
    return `<div class="seqitem" role="button" tabindex="0" data-act="seqadd" data-key="${key}" data-id="${id}">
      <span class="txt">+ ${esc(s)}</span></div>`;}).join('')}</div></div>`;
}

/* ---------- per-objective progress record ---------- */
function objState(id){ if(!S.obj[id])S.obj[id]={done:false,attempts:0,hints:0,everFailed:false,feed:null};
  return S.obj[id]; }

/* ---------- duty-board objective card ---------- */
function renderObjCard(o){
  const st=objState(o.id); const open=S.openObj===o.id;
  const pill=`pill-${o.pillar}`;
  let hintsHtml='';
  const maxH=S.mode==='medium'?3:1;
  if(open&&st.hints<maxH&&!st.done){
    hintsHtml=`<div class="hints"><button class="hbtn" data-act="hint" data-oid="${o.id}">
      ${S.mode==='medium'?`Hint lamp ${st.hints+1}/3`:'Use the one nudge (−score)'}</button>
      <span class="attempt-note">${S.mode==='medium'?'each lamp costs stars, never blocks':'visibly costs score'}</span></div>`;
  }
  const hintText=st.hints>0?`<div class="hint-txt">${o.hints.slice(0,st.hints).map(esc).join('<br><br>')}</div>`:'';
  return `<div class="obj ${st.done?'done':''} ${open?'open':''}" id="objcard-${o.id}">
    <button class="obj-head" data-act="objopen" data-oid="${o.id}" aria-expanded="${open}">
      <span class="num">${o.id}</span><span class="ot">${st.done?'✓ ':''}${esc(o.title)}</span>
      <span class="plate ${pill}">${o.pillar}</span></button>
    <div class="obj-body">${open?`
      <div class="ctx">${esc(o.ctx)}${S.mode==='medium'?`<br><b style="color:var(--amber)">Where to look:</b> ${esc(o.where)}`:''}</div>
      ${st.done?`<fieldset class="done-lock" disabled style="border:0;padding:0;margin:0;min-inline-size:0">${o.ui(S.env)}</fieldset>`:o.ui(S.env)}
      ${hintsHtml}${hintText}
      ${st.done?`<div class="feed ok" style="display:block">${st.feed}</div>`
        :`<div class="checkrow"><button class="ckbtn" data-act="check" data-oid="${o.id}">Check results</button>
          <span class="attempt-note">${st.attempts?`attempts: ${st.attempts}`:'unchecked'}</span></div>
          ${st.feed?`<div class="feed bad" style="display:block">${st.feed}</div>`:''}`}
    </div>`:''}</div>`;
}

function renderDuty(){
  const set=OBJSETS[S.mode];
  $('objlist').innerHTML=set.map(o=>renderObjCard(o)).join('');
  const done=set.filter(o=>objState(o.id).done).length;
  $('duty-count').textContent=`${done} / ${set.length} signed off`;
  $('score-num').textContent=`${done}/${set.length}`;
  $('score-quiz').textContent=S.quiz.submitted?`${S.quiz.score}/${QUIZ[S.mode].length}`:'—';
  $('lamp-progress').className='lamp '+(done===set.length?'on-g':done>0?'on-a':'');
  $('btn-finish').disabled=!(done===set.length&&S.quiz.submitted);
  const per={P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]};
  set.forEach(o=>{per[o.pillar][1]++;if(objState(o.id).done)per[o.pillar][0]++;});
  $('pillar-row').innerHTML=Object.entries(per).map(([p,[d,t]])=>
    `<div class="pillar-cell"><b>${p} ${PILLARS[p]}</b><span>${d}/${t}</span></div>`).join('');
  if(S.mode==='medium'){
    const next=set.find(o=>!objState(o.id).done);
    $('shiftlead').innerHTML=next
      ?`<span class="who">Shift lead</span>Next duty: <b>${esc(next.title)}</b> — ${esc(next.where)}`
      :`<span class="who">Shift lead</span>All duties signed off. Run the <b>knowledge check</b>, then end your shift.`;
  }else{
    $('shiftlead').innerHTML=`<span class="who">Duty phone — quiet</span>No shift lead tonight. The evidence is on the bench; two alarms and one ticket are lying. ${done}/${set.length} items signed off.`;
  }
}

/* ---------- CHECK RESULTS ----------
   Runs the objective's authored rule, records the attempt, signs off or
   keeps the item open with teaching feedback, then re-renders and
   scrolls the card into view. */
function runCheck(id){
  const o=OBJSETS[S.mode].find(x=>x.id===id); if(!o)return;
  const st=objState(id); const r=o.check(S.env); st.attempts++;
  if(r.ok){ st.done=true; announce(`Objective ${id} signed off`); }
  else st.everFailed=true;
  st.feed=r.msg; save(); renderDuty(); renderBench();
  const card=document.getElementById('objcard-'+id);
  if(card)card.scrollIntoView({block:'nearest',behavior:'smooth'});
}
