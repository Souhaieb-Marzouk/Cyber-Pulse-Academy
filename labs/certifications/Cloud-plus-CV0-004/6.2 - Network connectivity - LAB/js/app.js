'use strict';
/* =====================================================================
   APP — ticket rail, tabs, debrief, completion report, glossary/reset/toast
   wiring, mode select, bootstrap (init)
   ===================================================================== */
/* ---------------- ticket rail + brief ---------------- */
const TICKETS = () => {
  if(S.mode === 'medium') return [
    { id:'INC-1042', t:'web-01 cannot reach Postgres', s:'checkout writes failing', node:'db1', fixed:F.sgDb() },
    { id:'INC-1043', t:'app-01 has no internet egress', s:'package installs dead', node:'natgw', fixed:F.nat() },
    { id:'INC-1043b', t:'egress flaps — “works sometimes”', s:'intermittent mirror timeouts', node:'app1', fixed:F.nacl() },
    { id:'INC-1044', t:'api.orbitcart.internal is stale', s:'name → retired address', node:'dns', fixed:F.dnsApi() },
    { id:'INC-1045', t:'store 502 — nothing healthy', s:'Flash Sale is dark', node:'alb', fixed:F.lb() }
  ];
  return [
    { id:'CASE-2201', t:'Checkout: full 502 outage', s:'shoppers blocked at the LB', node:'alb', fixed:F.lb() },
    { id:'CASE-2202', t:'Flow-log forensics', s:'stateless drop pattern', node:null, flow:true, fixed:F.nacl() },
    { id:'CASE-2203', t:'VPN: transfers stall', s:'corp → prod big packets', node:'vgw', fixed:F.mtu() },
    { id:'CASE-2204', t:'Analytics unreachable', s:'peering maze', node:'tgw', fixed:F.tgw() },
    { id:'CASE-2205', t:'API TLS handshake dead', s:'certificate / protocols', node:'alb', fixed:F.cert() },
    { id:'CASE-2206', t:'Pod fleet never joined', s:'DHCP options + pool', node:'pod1', fixed:F.dhcp() },
    { id:'CASE-2207', t:'Triage order', s:'method under pressure', node:null, seq:true, fixed:!!objState('OBJ-H7').done },
    { id:'CASE-2208', t:'Hardening selection', s:'controls vs. traps', node:null, fixed:!!objState('OBJ-H8').done },
    { id:'CASE-2209', t:'Payments, from the pods', s:'two hidden faults', node:'pay1', fixed:F.dnsPay() && F.sgPay() },
    { id:'CASE-2210', t:'legacy-crm isolated', s:'L2 VLAN typo', node:'bridge', fixed:F.vlan() }
  ];
};
function renderRail(){
  const rb = $('#railBody');
  rb.dataset.built = '1';
  const ts = TICKETS();
  rb.innerHTML = ts.map(t => `<div class="ticket ${t.fixed ? '' : 'open'}" data-ticket="${t.id}" data-node="${t.node || ''}" role="button" tabindex="0"
      aria-label="Ticket ${t.id}: ${t.t}, ${t.fixed ? 'resolved' : 'open'}">
      <span class="tId">${t.id}</span> <span class="tState ${t.fixed ? 'fixed' : 'open'}">${t.fixed ? '● resolved' : '● open'}</span>
      <h4>${t.t}</h4><p>${t.s}</p></div>`).join('');
}
function renderBrief(){
  $('#briefBody').innerHTML = `
    <p><b>Flash Sale Friday, 06 Nov 2026, 09:12.</b> Doors open in 40 minutes. OrbitCart’s NOC queue is lighting up: checkout writes fail, packages won’t install, the storefront throws 502s.</p>
    <p>You are the new NOC engineer; <b>Priya Raman</b> hands you the bench: “Work the method — evidence, theory, cheap test, least-privilege fix, verify from the source. And document.”</p>
    <p style="margin-top:8px"><span class="rhTag">synthetic training data</span> Everything here is fictional and safe: OrbitCart, Cumulus Cloud, every host, IP and log line.</p>
    ${S.mode === 'hard' ? '<p style="margin-top:8px"><b>Hard mode:</b> ten cases are open at once and the metrics panel contains red herrings. At most one hint, and it costs stars.</p>' : ''}`;
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('.ticket');
  if(!t) return;
  if(t.dataset.node){ switchTab('bench'); selectNode(t.dataset.node); return; }
  if(t.dataset.ticket === 'CASE-2202'){ switchTab('bench'); $('#evFlowBtn').click(); return; }
  switchTab('objectives');
});
document.addEventListener('keydown', ev => {
  const t = ev.target.closest && ev.target.closest('.ticket');
  if(t && (ev.key === 'Enter' || ev.key === ' ')){ ev.preventDefault(); t.click(); }
});

/* ---------------- tabs ---------------- */
function switchTab(name){
  S.ui.tab = name; save();
  ['bench','learn','objectives','quiz','debrief'].forEach(t => {
    const sec = $('#tab-' + t), btn = $('#tabBtn-' + t);
    const on = t === name;
    sec.hidden = !on;
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if(name === 'learn'){ renderLearnWidgetsOnly(); }
  if(name === 'objectives'){ renderTracker(); }
  if(name === 'quiz'){ renderQuiz(); }
  if(name === 'debrief'){ renderDebrief(); }
}

/* ---------------- debrief ---------------- */
function renderDebrief(){
  $('#debriefBody').innerHTML = DEBRIEF_HTML;
  const fixes = [];
  if(F.sgDb()) fixes.push('sg-db: least-privilege TCP/5432 for the web/app tier — <i>network device misconfiguration</i>');
  if(F.nat()) fixes.push('rt-private: 0.0.0.0/0 → nat-gw-a — <i>missing route / NAT</i>');
  if(F.nacl()) fixes.push('nacl-app: ephemeral return range 1024–65535 — <i>stateless NACL hygiene</i>');
  if(F.dnsApi()) fixes.push('api.orbitcart.internal → 10.20.2.47 — <i>DNS unavailability</i>');
  if(F.lb()) fixes.push('alb-store health check → 8080 /healthz (200) — <i>HTTP status codes / outage</i>');
  if(F.mtu()) fixes.push('vgw-corp tunnel MTU → 1436 — <i>protocol incompatibility (MTU/PMTUD)</i>');
  if(F.tgw()) fixes.push('tgw-1: three attachments + propagation — <i>misconfigured routes / non-transitive peering</i>');
  if(F.cert()) fixes.push('api[.]orbitcart.net certificate renewed — <i>certificate lifecycle</i>');
  if(F.dhcp()) fixes.push('pod subnet: internal resolver + wider pool — <i>DHCP/DNS unavailability · scope exhaustion</i>');
  if(F.dnsPay()) fixes.push('payments.orbitcart.internal → 10.20.3.54 — <i>DNS unavailability</i>');
  if(F.sgPay()) fixes.push('sg-pay: TCP/8443 for the pod CIDR — <i>network device misconfiguration</i>');
  if(F.vlan()) fixes.push('bridge-01 access tag → VLAN 40 — <i>switching issues (VLAN tags)</i>');
  const el = $('#fixRecap');
  if(el) el.innerHTML = fixes.length ? '<b>Fixes you applied on this bench:</b><ul style="margin:8px 0 0 18px">' + fixes.map(f => `<li>${f}</li>`).join('') + '</ul>' : 'No fixes recorded yet — your applied fixes will be listed here with their 6.2 mapping.';
}

/* ---------------- completion ---------------- */
function computeStars(){
  const list = OBJ_LIST();
  const firstTry = list.filter(o => objState(o.id).firstTry).length;
  const rate = firstTry / list.length;
  const hints = list.reduce((a,o) => a + objState(o.id).hintLevel, 0);
  const pen = S.mode === 'medium' ? Math.max(0.6, 1 - 0.04 * hints) : Math.max(0.5, 1 - 0.12 * hints);
  const quizScore = S.quiz.answers.filter(a => a.pick === a.correct).length;
  const quizPct = Math.round(100 * quizScore / QUIZ_LIST().length);
  return { rate, hints, quizPct, stars: Math.max(1, Math.round(5 * rate * pen)) };
}
function openCompletion(){
  const c = computeStars();
  S.finish = { done:true, stars:c.stars, firstTryRate:Math.round(c.rate*100), quizPct:c.quizPct, hintsUsed:c.hints }; save();
  const list = OBJ_LIST();
  $('#doneStars').innerHTML = '★★★★★'.split('').map((s,i) => `<span class="${i < c.stars ? '' : 'off'}">★</span>`).join('');
  $('#doneStars').setAttribute('aria-label', `${c.stars} of 5 stars`);
  $('#doneExp').textContent = S.mode === 'medium'
    ? 'You worked the whole 6.2 surface in guided mode — from stateful vs. stateless to VLAN tags. Every check explained itself; carry the method into Hard mode next.'
    : 'Ten cases, noisy evidence, strict validation — and the sale went ahead. This is the “given a scenario” exam experience.';
  $('#doneScores').innerHTML = `<b>Objectives:</b> ${list.filter(o => objState(o.id).done).length}/${list.length} · first-attempt accuracy <b>${Math.round(c.rate*100)}%</b> · hints used <b>${c.hints}</b> · quiz <b>${c.quizPct}%</b><br>
    <span style="font-size:12.5px;color:var(--dim)">Stars = 5 × first-attempt accuracy × hint penalty (Medium: −4%/hint, floor ×0.6; Hard: −12%/hint, floor ×0.5).</span>`;
  const pillars = ['P1','P2','P3','P4'].map(p => {
    const tot = list.filter(o => o.pillar.startsWith(p)).length;
    const got = list.filter(o => o.pillar.startsWith(p) && objState(o.id).done).length;
    return `<div class="pRecap"><b>${got}/${tot}</b><span>${p === 'P1' ? 'Understand' : p === 'P2' ? 'Recognize' : p === 'P3' ? 'Detect' : 'Mitigate'}</span></div>`;
  }).join('');
  $('#pillarRecap').innerHTML = pillars;
  // R8: focus areas derived from this student's actual evidence — attempts, hints, quiz misses
  const weak = list.filter(o => { const s = objState(o.id); return s.done && (!s.firstTry || s.hintLevel > 0); });
  const quizMiss = S.quiz.answers.map((a,i) => ({ i, ok: a.pick === a.correct })).filter(x => !x.ok);
  let focusHtml;
  if(!weak.length && !quizMiss.length){
    focusHtml = '<p style="color:#c9d3df">None — every objective on the first attempt and a clean quiz. Your next focus is <b>the other mode</b>: same bench, no guardrails.</p>';
  } else {
    focusHtml = '<ul style="margin:8px 0 0 18px;color:#c9d3df">' +
      weak.map(o => {
        const s = objState(o.id); const bits = [];
        if(!s.firstTry) bits.push(s.attempts + ' attempts');
        if(s.hintLevel) bits.push(s.hintLevel + ' hint' + (s.hintLevel > 1 ? 's' : ''));
        return `<li><b>${esc(o.title)}</b> — needed ${bits.join(' · ')}. Review <i>${esc(o.anchor)}</i>, re-run the matching bench card, and verify from the original source.</li>`;
      }).join('') +
      quizMiss.map(x => `<li><b>Quiz Q${x.i + 1}</b> — missed. Re-read its explanation above, then rehearse the matching bench case before the exam.</li>`).join('') +
      '</ul>';
  }
  $('#doneFocus').innerHTML = focusHtml;
  $('#doneRecap').innerHTML = 'Strongest next move: rerun any failed case in the other mode — the environment is shared, the pressure is not.';
  $('#doneNext').innerHTML = '<b>What to learn next:</b> CV0-004 objective 6.1 (deployment issues) and 6.3 (security issues) complete Domain 6.0; objective 1.3 (cloud networking) deepens today’s constructs. ' +
    '<a href="https://www.comptia.org/certifications/cloud" target="_blank" rel="noopener noreferrer">CompTIA Cloud+ official page</a>.';
  openModal('completionModal', '#doneReview');
  announce('Lab complete. ' + c.stars + ' of 5 stars.');
}

/* ---------------- glossary / reset / toast wiring ---------------- */
const MODAL_FOCUS_RETURN = { glossaryModal:'#glossaryBtn', resetModal:'#resetBtn', completionModal:'#finishBtn' };
function openModal(id, focusSel){
  const m = document.getElementById(id);
  if(!m) return;
  m.classList.remove('hidden');
  if(focusSel && $(focusSel)) $(focusSel).focus();
}
function closeModal(id){
  const m = document.getElementById(id);
  if(!m || m.classList.contains('hidden')) return;
  m.classList.add('hidden');
  const back = MODAL_FOCUS_RETURN[id];
  if(back && $(back)) $(back).focus();
}
function wireChrome(){
  $('#glossaryBtn').addEventListener('click', () => openModal('glossaryModal', '#glossClose'));
  $('#glossClose').addEventListener('click', () => closeModal('glossaryModal'));
  $('#resetBtn').addEventListener('click', () => openModal('resetModal', '#resetConfirm'));
  $('#resetCancel').addEventListener('click', () => closeModal('resetModal'));
  $('#resetConfirm').addEventListener('click', () => {
    try { localStorage.removeItem(STORE_KEY); } catch(e){}
    location.reload();
  });
  $('#finishBtn').addEventListener('click', openCompletion);
  $('#doneReview').addEventListener('click', () => closeModal('completionModal'));
  $('#doneRestart').addEventListener('click', () => {
    try { localStorage.removeItem(STORE_KEY); } catch(e){}
    location.reload();
  });
  $('#evFlowBtn').addEventListener('click', () => { markInspected('flowlogs'); $('#inspTitle').textContent = 'Inspector — evidence'; $('#inspBody').innerHTML = cardFLOWLOGS() + cardMETRICS(); });
  $('#evMetricsBtn').addEventListener('click', () => { markInspected('metrics'); $('#inspTitle').textContent = 'Inspector — evidence'; $('#inspBody').innerHTML = cardMETRICS(); });
  $('#mapHelpBtn').addEventListener('click', () => { $('#inspTitle').textContent = 'Inspector — help'; $('#inspBody').innerHTML = cardHELP(); });
  $('#glossList').innerHTML = GLOSSARY.map(g => `<p><span class="gTerm">${esc(g[0])}</span> — ${esc(g[1])}</p>`).join('');
  document.addEventListener('keydown', ev => {
    if(ev.key === 'Escape'){
      ['glossaryModal','resetModal','completionModal'].forEach(closeModal);
    }
  });
  // R7: every dialog closes from its X button and from a click on the backdrop
  document.addEventListener('click', ev => {
    const x = ev.target.closest('[data-close]');
    if(x){ closeModal(x.dataset.close); return; }
    ['glossaryModal','resetModal','completionModal'].forEach(id => {
      const m = document.getElementById(id);
      if(m && !m.classList.contains('hidden') && ev.target === m) closeModal(id);
    });
  });
  ['tabBtn-bench','tabBtn-learn','tabBtn-objectives','tabBtn-quiz','tabBtn-debrief'].forEach(id => {
    $('#' + id).addEventListener('click', () => switchTab(id.replace('tabBtn-','')));
  });
}

/* ---------------- mode select / init ---------------- */
function startMode(mode){
  S = freshState(mode);
  OBJ_LIST().forEach(o => objState(o.id));
  renderAll();
  $('#modeScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#modeChip').textContent = (mode === 'medium' ? 'Medium mode — guided' : 'Hard mode — challenge');
  switchTab(S.ui.tab);
  toast(mode === 'medium' ? 'Medium mode started — begin with OBJ-M1 in the Objectives tab.' : 'Hard mode started — ten cases are open. Evidence first.');
  announce('Lab started in ' + mode + ' mode.');
}
function resumeMode(){
  S = loadSaved();
  OBJ_LIST().forEach(o => objState(o.id));
  renderAll();
  $('#modeScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#modeChip').textContent = (S.mode === 'medium' ? 'Medium mode — guided (resumed)' : 'Hard mode — challenge (resumed)');
  switchTab(S.ui.tab || 'bench');
  toast('Session resumed — progress restored.');
}
function renderAll(){
  buildMap();
  renderSrcOptions();
  renderQuick();
  wireConsole();
  cline('c-info', 'OrbitCart diagnostics console — synthetic training data. Type help for tools. Outputs change as you fix the network.');
  renderLearn();
  renderTracker();
  renderQuiz();
  renderRail();
  renderBrief();
  renderDebrief();
  refreshProgress();
}
function init(){
  wireChrome();
  $('#pickMedium').addEventListener('click', () => startMode('medium'));
  $('#pickHard').addEventListener('click', () => startMode('hard'));
  $('#pickResume').addEventListener('click', resumeMode);
  const saved = loadSaved();
  if(saved){ $('#pickResume').classList.remove('hidden'); }
}
init();
