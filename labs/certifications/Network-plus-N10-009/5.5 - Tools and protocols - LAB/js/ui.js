/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/ui.js — shared UI primitives: toasts, modals, hints, terminal line writer.
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
/* ================= toasts ================= */
function toast(msg, bad){
  const root = $('#toastRoot');
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.textContent = msg;
  const x = document.createElement('button');
  x.className = 'tx'; x.setAttribute('aria-label','Dismiss notification'); x.textContent = '✕';
  x.addEventListener('click', () => t.remove());
  t.appendChild(x);
  root.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}

/* ================= modals ================= */
let lastFocus = null;
function openModal(id){
  const root = $('#modalRoot');
  $$('.modal', root).forEach(m => m.hidden = true);
  const m = document.getElementById(id);
  m.hidden = false;
  root.classList.add('show');
  lastFocus = document.activeElement;
  const x = $('.xCloseTop', m); if(x) x.focus();
}
function closeModal(){
  const root = $('#modalRoot');
  root.classList.remove('show');
  $$('.modal', root).forEach(m => m.hidden = true);
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
function trapFocus(e){
  if(e.key !== 'Tab' || !$('#modalRoot').classList.contains('show')) return;
  const f = $$('#modalRoot .modal:not([hidden]) button, #modalRoot .modal:not([hidden]) a[href]');
  if(!f.length) return;
  const first = f[0], last = f[f.length-1];
  if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
  else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
}

/* ================= hints ================= */
function closeHint(pop){ pop.classList.remove('show'); const b = document.querySelector('[aria-controls="'+pop.id+'"]'); if(b) b.setAttribute('aria-expanded','false'); }
function bindHint(btnId, popId){
  const btn = document.getElementById(btnId), pop = document.getElementById(popId);
  if(!btn || !pop) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = pop.classList.toggle('show');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  const x = pop.querySelector('.xClose');
  if(x) x.addEventListener('click', e => { e.stopPropagation(); closeHint(pop); btn.focus(); });
}

/* ================= terminal ================= */
function termLine(kind, text){
  const out = $('#termOut');
  const d = document.createElement('div');
  d.className = kind === 'cmd' ? 'cmdEcho' : kind === 'sys' ? 'sysMsg' : kind === 'attn' ? 'attn' : '';
  d.textContent = text;
  out.appendChild(d);
  while(out.children.length > 300) out.removeChild(out.firstChild);
  out.scrollTop = out.scrollHeight;
  S.term.hist.push({k:kind, s:text});
  if(S.term.hist.length > 80) S.term.hist = S.term.hist.slice(-80);
}
