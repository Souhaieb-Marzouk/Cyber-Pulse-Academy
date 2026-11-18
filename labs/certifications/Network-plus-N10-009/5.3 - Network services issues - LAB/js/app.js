/* =====================================================================
   Atlas NOC Command Deck — js/app.js
   Bootstrap: Lab facade, tabs, mode select + briefing, per-mode
   persistence, reset, completion modal (once-only + Shift report),
   focus management, event wiring.
   ===================================================================== */

/* ================= boot: mode select, briefing, tabs, persistence, completion ================= */

const Lab = {
  openDevice(dev) {
    if (!DEVICES[dev]) return;
    curDev = dev; curTab = DEVICES[dev].tabs[0]; cmdOut = '';
    renderDrawer();
    if (window.innerWidth < 1180) $('drawer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  onEndpointClick(end) {
    const map = { brpc: 'brrtr', train: 'swtr', whscan: 'swwh1', ship: 'swwh1', hqpc: 'swhq', fin: 'swhq', srv: 'dhcp' };
    this.openDevice(map[end] || 'swwh1');
  },
  goToObjective(oId) {
    document.querySelector('[role=tab][id=tabObj]').click();
    renderMissionBoard();
    const card = $('obj-' + oId);
    if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.style.outline = '2px solid var(--amber)'; setTimeout(() => card.style.outline = '', 1600); }
  },
  scrollToStage() { $('topo').scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  rerender() {
    renderGauges(); renderTickets(); updateTopology(); updateHeader();
    if (S.mode) renderMissionBoard();
    renderDrawer();
  },
  showCompletion() { modalOpener = document.activeElement; S.doneShown = true; save(); buildCompletion(); $('ovDone').hidden = false; $('btnDoneClose').focus(); }
};
window.Lab = Lab;
let modalOpener = null;
function closeDone() { $('ovDone').hidden = true; if (modalOpener && modalOpener.focus) modalOpener.focus(); }

function renderAll() {
  renderGauges(); renderTickets(); renderTopology(); renderEvlog(); updateHeader();
  fillProbeSelectors();
  if (S.mode) { renderMissionBoard(); renderManual(); renderQuiz(); renderDebrief(); }
  renderDrawer();
}

/* ---------- tabs ---------- */
const TABS = [['tabObj', 'panObj'], ['tabKb', 'panKb'], ['tabQuiz', 'panQuiz'], ['tabDeb', 'panDeb']];
TABS.forEach(([tid, pid]) => {
  $(tid).addEventListener('click', () => {
    if (tid === 'tabQuiz' && S.mode) renderQuiz();
    if (tid === 'tabKb') renderManual();
    if (tid === 'tabDeb') renderDebrief();
    TABS.forEach(([t2, p2]) => {
      $(t2).setAttribute('aria-selected', String(t2 === tid));
      $(p2).hidden = (p2 !== pid);
    });
  });
});

/* ---------- mode select + briefing (per-mode persistence: audit B1) ---------- */
function modeObjCount(m) { return Object.keys(OBJ_DEFS).filter(k => OBJ_DEFS[k].mode === m).length; }
function resumeCheck() {
  S = freshState();
  const savedM = loadFor('M'), savedH = loadFor('H');
  const notes = [];
  if (savedM) notes.push(`Medium — ${Object.values(savedM.obj).filter(o => o.done).length}/${modeObjCount('M')} work orders saved`);
  if (savedH) notes.push(`Hard — ${Object.values(savedH.obj).filter(o => o.done).length}/${modeObjCount('H')} work orders saved`);
  $('resumeNote').innerHTML = notes.length
    ? `Saved sessions found (each mode keeps its own progress): ${notes.join(' · ')}. Pick a mode to resume it.`
    : 'Progress auto-saves per mode in this browser.';
  $('btnModeM').textContent = savedM ? 'Resume Medium shift' : 'Start Medium shift';
  $('btnModeH').textContent = savedH ? 'Resume Hard shift' : 'Start Hard shift';
}
function startMode(m) {
  const saved = loadFor(m);
  S = saved || freshState();
  S.mode = m;
  if (!S.env.acl.counters) S.env.acl.counters = {};
  save();
  $('ovMode').hidden = true;
  if (S.briefingSeen) { enterDeck(); } else { $('ovBrief').hidden = false; }
}
function enterDeck() {
  $('ovBrief').hidden = true;
  $('ovMode').hidden = true;
  renderAll();
}

$('btnModeM').addEventListener('click', () => startMode('M'));
$('btnModeH').addEventListener('click', () => startMode('H'));
$('btnBriefGo').addEventListener('click', () => { S.briefingSeen = true; save(); enterDeck(); });

/* ---------- reset ---------- */
$('btnReset').addEventListener('click', () => { modalOpener = $('btnReset'); $('ovReset').hidden = false; });
$('btnResetNo').addEventListener('click', () => { $('ovReset').hidden = true; if (modalOpener && modalOpener.focus) modalOpener.focus(); });
$('btnResetYes').addEventListener('click', () => {
  try { localStorage.removeItem(lsKeyFor(S.mode)); localStorage.removeItem(LS_LEGACY); } catch (e) {}
  location.reload();
});
$('btnReport').addEventListener('click', () => Lab.showCompletion());

/* ---------- completion modal (C7) ---------- */
/* R8: focus areas derived from ACTUAL performance evidence — attempts, hints, open orders, wrong drill items. */
function focusAreas() {
  const out = [];
  const ids = currentObjectives();
  const set = S.mode === 'M' ? QUIZ_M : QUIZ_H;
  ids.forEach(i => {
    const st = S.obj[i] || {};
    const d = OBJ_DEFS[i];
    if (!st.done) out.push({ a: `${d.title} (${i})`, w: 'still open', r: `finish work order ${i} on the Mission Board` });
    else if ((st.attempts || 1) > 1) out.push({ a: `${d.title} (${i})`, w: `solved on attempt ${st.attempts}`, r: `re-run ${i} cold; revisit its Field Manual family` });
    if ((st.hints || 0) > 0) out.push({ a: `${d.title} (${i})`, w: `used ${st.hints} hint${st.hints > 1 ? 's' : ''}`, r: `re-run ${i} hint-free to prove recall` });
  });
  Object.keys(S.quiz).forEach(q => {
    if (!S.quiz[q].correct) {
      const idx = parseInt(q.slice(1), 10);
      out.push({ a: `Cert Drill Q${idx + 1} — ${set[idx].t}`, w: 'answered incorrectly', r: `review Field Manual → "${set[idx].t}"` });
    }
  });
  const seen = new Set();
  return out.filter(x => (seen.has(x.a + x.w) ? false : (seen.add(x.a + x.w), true)));
}
function buildCompletion() {
  const ids = currentObjectives();
  const doneIds = ids.filter(i => S.obj[i] && S.obj[i].done);
  const pct = computePct();
  const stars = starsFor(pct);
  const pillars = ['P1', 'P2', 'P3', 'P4'].map(p => {
    const rel = ids.filter(i => OBJ_DEFS[i].pillar === p);
    const dn = rel.filter(i => S.obj[i] && S.obj[i].done).length;
    return `<div class="briefbox"><b>${PILLAR_NAMES[p]}</b><br>${dn}/${rel.length} complete</div>`;
  }).join('');
  const quizSet = S.mode === 'M' ? QUIZ_M : QUIZ_H;
  const quizDone = Object.keys(S.quiz).length;
  const firstTry = doneIds.filter(i => S.obj[i].doneFirstTry).length;
  const hintsUsed = ids.reduce((n, i) => n + ((S.obj[i] && S.obj[i].hints) || 0), 0);
  const fa = focusAreas();
  const faHtml = fa.length
    ? `<div class="briefbox" style="margin-bottom:12px"><b>Focus areas for your next run</b> <span class="tag amber">${fa.length}</span><br>
       <ul style="margin:6px 0 0 18px">${fa.map(f => `<li style="margin:4px 0"><b style="color:var(--ink)">${esc(f.a)}</b> — ${esc(f.w)}. ${esc(f.r)}.</li>`).join('')}</ul></div>`
    : `<div class="briefbox" style="margin-bottom:12px"><b>Focus areas for your next run</b><br>No weak areas detected: every work order solved first-try without hints and every drill item correct. Chase the other difficulty mode, or reset the deck and run it cold as a timed exercise.</div>`;
  $('doneBox').innerHTML = `
    <span class="stencil">SHIFT COMPLETE</span>
    <h1 id="doneTitle" style="margin-top:12px">Deck secured — ${S.mode === 'M' ? 'Medium' : 'Hard'} shift</h1>
    <div class="scorebig">${Math.round(pct * 100)}%</div>
    <div class="bigstars" role="img" aria-label="${(stars.match(/★/g) || []).length} of 5 stars">${stars}</div>
    <p class="sub" style="text-align:center">${doneIds.length}/${ids.length} work orders · quiz ${quizDone}/${quizSet.length} · first-attempt solves ${firstTry} · hints used ${hintsUsed}
    <br>Stars reflect accuracy on first attempts and hint usage.</p>
    <div class="pillarrecap">${pillars}</div>
    ${faHtml}
    <div class="briefbox" style="margin-bottom:12px"><b>You can now…</b><br>
    explain the seven fault families of N10-009 5.3 and their chain position (frames → routes → addresses); recognize each in raw logs, show-commands and ipconfig output; localize faults with ping/traceroute/DHCP evidence; and choose, apply and verify the correct mitigation — including what to monitor so the shift never repeats.</div>
    <div class="briefbox" style="margin-bottom:12px"><b>Next up</b><br>
    ${pct < 1 ? 'Replay the other difficulty mode for the contrasting experience, and chase the 5-star run (few hints, first-attempt solves). ' : 'Flawless run — try the other difficulty mode. '}
    Then move to Field Manual → "What to learn next", or reset the deck and run it cold as a timed exercise.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn primary" id="btnDoneClose">Back to the deck</button>
      <button class="btn" id="btnDoneQuiz">Review Cert Drill</button>
      <button class="btn" id="btnDoneDeb">Read After-Action Report</button>
    </div>`;
  $('btnDoneClose').addEventListener('click', closeDone);
  $('btnDoneQuiz').addEventListener('click', () => { closeDone(); $('tabQuiz').click(); $('panQuiz').scrollIntoView({ behavior: 'smooth' }); });
  $('btnDoneDeb').addEventListener('click', () => { closeDone(); $('tabDeb').click(); });
  save();
}

/* ---------- keyboard niceties ---------- */
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    let closed = false;
    ['ovReset', 'ovDone'].forEach(id => { if (!$(id).hidden) { $(id).hidden = true; closed = true; } });
    if (closed && modalOpener && modalOpener.focus) modalOpener.focus(); /* R7: keyboard dismissal returns focus */
  }
});

/* ---------- go ---------- */
resumeCheck();
if (S.mode && S.briefingSeen) {
  $('ovMode').hidden = true;
  enterDeck();
} else {
  renderTopology(); // behind the overlay so the deck is never blank
  renderEvlog();
}
