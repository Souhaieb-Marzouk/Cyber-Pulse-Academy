/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/app.js — bootstrap: mode selection, applyMode, event wiring, init.
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
/* ================= mode + init ================= */
let pendingMode = null;
function setMode(mode){
  S = freshState(mode);
  S.pair = shufflePair(); S.steps = shuffleSteps();
  save(); applyMode();
  window.scrollTo({top: 0});
  toast('Shift started — ' + mode.toUpperCase() + '. Good hunting.');
}
function applyMode(){
  document.body.dataset.mode = S.mode;
  $('#modeChip').textContent = S.mode.toUpperCase() + ' SHIFT';
  $('#modeChip').style.display = 'inline-flex';
  $('#modeSection').classList.add('hidden');
  $('#labContent').classList.remove('hidden');
  $('#progressWrap').style.display = 'flex';
  if(!S.pair) S.pair = shufflePair();
  if(!S.steps) S.steps = shuffleSteps();
  const cap = $('#capBtn');
  if(S.an.captured){ cap.disabled = true; cap.textContent = 'CAPTURED'; }
  else { cap.disabled = false; cap.textContent = 'CAPTURE'; }
  $('#filterIn').value = S.an.filter;
  const det = $('#pktDetail');
  if(S.an.opened){ const p = pktById(S.an.opened); if(p){ det.textContent = p.det.join('\n'); det.classList.add('show'); } }
  else { det.classList.remove('show'); }
  restoreForms();
  renderCables(); updateCableForms(); renderCableResult();
  renderWifi(); renderPair(); renderSteps();
  const out = $('#termOut'); out.innerHTML = '';
  if(!S.term.hist.length){
    termLine('sys', 'Meridian clinic net — simulated shell (training data).');
    termLine('sys', 'You are on WS-BILL03 in the billing office. Type help for the command list.');
  } else {
    S.term.hist.forEach(h => termLine(h.k, h.s, true));
  }
  renderQuiz();
  updateTracker();
}
function init(){
  bindForms(); bindPair(); bindSteps(); bindQuiz();
  bindHint('hintTerm','hintTermPop'); bindHint('hintAn','hintAnPop');
  bindHint('hintCb','hintCbPop'); bindHint('hintWf','hintWfPop');
  $('#termRun').addEventListener('click', () => { const v = $('#termIn').value; $('#termIn').value = ''; runCommand(v); });
  $('#termIn').addEventListener('keydown', e => { if(e.key === 'Enter'){ const v = $('#termIn').value; $('#termIn').value = ''; runCommand(v); } });
  $('#capBtn').addEventListener('click', () => {
    if(S.an.captured) return;
    S.an.captured = true; save();
    $('#capBtn').disabled = true; $('#capBtn').textContent = 'CAPTURED';
    renderPkts();
    toast('Capture complete — ' + packetsFor().length + ' frames buffered (training data).');
  });
  $('#filterIn').addEventListener('input', e => { S.an.filter = e.target.value; save(); renderPkts(); });
  $('#testBtn').addEventListener('click', () => {
    if(!S.cable.sel){ toast('Select a cable first.', true); return; }
    if(!S.cable.tested.includes(S.cable.sel)) S.cable.tested.push(S.cable.sel);
    save(); renderCableResult(); updateCableForms();
  });
  $$('[data-choose]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.choose;
    if(S.mode && S.mode !== t){
      pendingMode = t;
      $('#modeModalText').textContent = 'Switching to the ' + t.toUpperCase() + ' shift starts a clean run: your current progress is cleared and the new shift begins fresh.';
      openModal('modeModal');
    } else if(S.mode === t){
      applyMode(); window.scrollTo({top: 0});
    } else setMode(t);
  }));
  $('#modeConfirm').addEventListener('click', () => { closeModal(); if(pendingMode){ setMode(pendingMode); pendingMode = null; } });
  $('#modeChip').addEventListener('click', () => {
    if(!S.mode) return;
    $('#labContent').classList.add('hidden');
    $('#modeSection').classList.remove('hidden');
    window.scrollTo({top: 0});
  });
  $('#resetBtn').addEventListener('click', () => openModal('resetModal'));
  $('#resetConfirm').addEventListener('click', () => { try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); });
  $$('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  $('#viewReportBtn').addEventListener('click', () => { renderDone(); openModal('doneModal'); });
  $('#modalRoot').addEventListener('click', e => { if(e.target === $('#modalRoot')) closeModal(); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      if($('#modalRoot').classList.contains('show')) closeModal();
      else $$('.hintPop.show').forEach(p => closeHint(p));
    }
    trapFocus(e);
  });
  document.addEventListener('click', e => {
    $$('.hintPop.show').forEach(p => {
      const btn = document.querySelector('[aria-controls="' + p.id + '"]');
      if(!p.contains(e.target) && !(btn && btn.contains(e.target))) closeHint(p);
    });
  });
  const loaded = load();
  if(loaded){ S = loaded; applyMode(); }
  else { $('#modeChip').style.display = 'none'; }
}
document.addEventListener('DOMContentLoaded', init);
window.__TOOLBENCH__ = {version: '1.0', get state(){ return S; }, OBJ: OBJ, QUIZ: QUIZ};
