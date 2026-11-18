/* == js/app.js — bootstrap, global event wiring, mode gate, RESET. */
function renderModeGate(){
  const host=document.getElementById('modeCards'); host.innerHTML='';
  const foot=document.getElementById('gateFoot');
  const saved=(S&&S.mode)?S:null;
  Object.values(MODES).forEach(m=>{
    const c=elc('button','modecard');
    c.type='button';
    c.innerHTML='<span class="tag">'+esc(m.label)+'</span><h2>'+esc(m.name)+'</h2><p style="color:var(--dim);font-size:.88rem;margin:.2em 0 .4em">'+esc(m.desc)+'</p><ul>'+m.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>';
    c.addEventListener('click',()=>startLab(m.key,false));
    host.appendChild(c);
  });
  if(saved){
    const ids=objectivesOfMode(), done=ids.filter(id=>orec(id).solved).length;
    const r=elc('button','modecard resume');
    r.type='button';
    r.innerHTML='<span class="tag" style="border-color:var(--green);color:var(--green-text)">SAVED PROGRESS</span><h2>Resume the case</h2><p style="color:var(--dim);font-size:.88rem">'+esc(MODES[saved.mode].name)+' shift · '+done+'/'+ids.length+' objectives solved · rating '+starsNow().toFixed(1)+'</p>';
    r.addEventListener('click',()=>startLab(saved.mode,true));
    host.insertBefore(r,host.firstChild);
  }
  foot.textContent='No nav bars, no footers, no tracking — one page, one case, everything saves to this browser only.';
}
function startLab(mode,resume){
  if(!resume||!S.mode){ S.mode=mode; S.obj=S.obj||{}; }
  save();
  document.getElementById('modeGate').style.display='none';
  document.getElementById('caseHead').hidden=false;
  document.getElementById('wall').hidden=false;
  _lastUnlocked=null;
  buildActs(); renderLedger(); paintCloseButton();
  announce('Case opened on the '+(S.mode==='hard'?'night':'day')+' shift.');
}
function boot(){
  S=load()||freshState();
  const gl=document.getElementById('glossList');
  gl.innerHTML=GLOSSARY.map(g=>'<dt>'+esc(g[0])+'</dt><dd>'+esc(g[1])+'</dd>').join('');
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') document.querySelectorAll('.modal.open').forEach(m=>closeModal(m.id));
  });
  /* R7: click-outside (backdrop) closes any open modal */
  document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('mousedown',e=>{ if(e.target===m) closeModal(m.id); });
  });
  document.getElementById('ledgerToggle').addEventListener('click',()=>{
    const l=document.getElementById('ledger'); const open=l.classList.toggle('open');
    document.getElementById('ledgerToggle').setAttribute('aria-expanded',open?'true':'false');
  });
  document.getElementById('resetBtn').addEventListener('click',()=>openModal('resetModal'));
  document.getElementById('resetYes').addEventListener('click',()=>{
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    S=freshState();
    closeModal('resetModal');
    document.getElementById('caseHead').hidden=true;
    document.getElementById('wall').hidden=true;
    document.getElementById('modeGate').style.display='flex';
    renderModeGate();
    announce('Case wiped — board is pristine.');
  });
  if(S.mode){ document.getElementById('modeGate').style.display='none'; document.getElementById('caseHead').hidden=false; document.getElementById('wall').hidden=false; _lastUnlocked=null; buildActs(); renderLedger(); paintCloseButton(); }
  else renderModeGate();
}
document.addEventListener('DOMContentLoaded',boot);
