/* =====================================================================
   Atlas NOC Command Deck — js/quiz.js
   Field Manual + glossary renderers, Cert Drill (gated sequential quiz
   with the R2/R3 answer-lock + color contract), After-Action Report.
   Question banks live in js/data.js.
   ===================================================================== */
'use strict';

/* ================= knowledge core (field manual + glossary), quiz, debrief, completion ================= */

function renderManual() {
  const pane = $('panKb');
  pane.innerHTML = `<div class="stagehead"><h2>Field Manual — the seven fault families of N10-009 5.3</h2>
    <span class="tag grey">simplified · exam-accurate concepts</span></div>
    <div class="kbgrid">` +
    MANUAL.map(m => `<div class="kb"><h3>${m.t}</h3><p>${m.b}</p>
      <p class="sig"><b>Exam signature:</b> ${m.sig}</p>
      <p class="sig fix"><b>Standard fix:</b> ${m.fix}</p></div>`).join('') +
    `</div>
    <h3 style="margin:18px 0 4px;color:var(--amber)">Glossary</h3>
    <div class="glossgrid">${GLOSSARY.map(g => `<div class="gloss"><b>${g[0]}</b> — ${g[1]}</div>`).join('')}</div>
    <p class="drawernote" style="margin-top:14px">Security cross-links (conceptual alignment, not official mappings): a forced broadcast storm is a denial-of-service pattern (MITRE ATT&CK T1498 · Network Denial of Service family); a rogue/abused DHCP server is a man-in-the-middle pattern (T1557 · Adversary-in-the-Middle family). The hardening you practiced here (storm control, BPDU guard, DHCP alerts, config backups) doubles as defense against both.</p>`;
  pane.querySelectorAll('dfn').forEach(d => d.setAttribute('title', glossText(d.getAttribute('data-g'))));
}
function glossText(t) { const g = GLOSSARY.find(g => g[0] === t); return g ? `${t} — ${g[1]}` : t; }

/* ---------------- quiz ---------------- */
let quizRendered = false;
function renderQuiz() {
  const pane = $('panQuiz');
  const set = S.mode === 'M' ? QUIZ_M : QUIZ_H;
  const correct = Object.keys(S.quiz).filter(q => S.quiz[q].correct).length;
  /* R2: mandatory progression — item i unlocks only after item i-1 is answered (gating) */
  pane.innerHTML = `<div class="stagehead"><h2>Cert Drill — ${S.mode === 'M' ? 'concept check' : 'scenario triage'}</h2>
    <span class="tag ${correct === set.length ? 'green' : 'amber'}">${correct}/${set.length} correct</span></div>
    <p class="obrief">${S.mode === 'M' ? 'Concept questions with an explanation after every answer — wrong answers cost nothing but teach.' : 'Scenario questions: pick the action a senior would take. Near-misses are graded as wrong, with the reason.'}
    Each answer locks once submitted and unlocks the next question.</p>` +
    set.map((item, i) => {
      const st = S.quiz['q' + i];
      const locked = !!st;
      const prevAnswered = i === 0 || !!S.quiz['q' + (i - 1)]; /* item i is open iff first, or predecessor answered */
      const gated = !locked && !prevAnswered;
      return `<div class="q" id="q-${i}"><div class="qtext"><b>Q${i + 1}.</b> ${esc(item.q)}${gated ? ' <span class="tag grey">answer Q' + i + ' to unlock</span>' : ''}</div>
      <div class="qopts">${item.o.map((o, j) => {
        const picked = st && j === st.pick;
        const cls = picked ? (st.correct ? 'correct' : 'wrong') : '';
        const mark = picked ? (st.correct ? '✓ ' : '✗ ') : '';
        return `<button data-q="${i}" data-o="${j}" ${locked || gated ? 'disabled' : ''} class="${cls}">${mark}${esc(o)}</button>`;
      }).join('')}</div>
      ${st ? `<div class="qexp show"><b>${st.correct ? 'Correct.' : 'Not quite — the correct choice is: "' + esc(item.o[item.c]) + '".'}</b> ${esc(item.e)}</div>` : '<div class="qexp"><b></b></div>'}</div>`;
    }).join('');
  pane.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
    if (b.disabled) return;
    const qi = b.getAttribute('data-q'), oi = parseInt(b.getAttribute('data-o'), 10);
    const item = set[qi];
    S.quiz['q' + qi] = { pick: oi, correct: oi === item.c }; /* R2: lock persisted in state */
    logEv(`QUIZ Q${+qi + 1}: ${oi === item.c ? 'correct' : 'wrong'}`, oi === item.c ? 'ok' : 'bad');
    save(); renderQuiz(); updateHeader();
    const nxt = $('q-' + (+qi + 1));
    if (nxt) nxt.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  quizRendered = true;
}

/* ---------------- debrief (C6) ---------------- */
function renderDebrief() {
  const pane = $('panDeb');
  pane.innerHTML = `<div class="stagehead"><h2>After-Action Report — shift synthesis</h2><span class="tag amber">N10-009 5.3</span></div>
  <h3 style="margin:10px 0 4px;color:var(--amber)">Symptom → root cause → evidence → fix</h3>
  <table><thead><tr><th>As reported</th><th>Root cause</th><th>Evidence that proved it</th><th>Fix</th></tr></thead><tbody>
  ${[
    ['Scanners crawling, switch fans loud', 'L2 loop via a switch with STP disabled + root in a closet', 'MACFLAP + storm-control syslog; show spanning-tree root = SW-TR-1; no spanning-tree vlan 30 in vendor config', 'Restore STP, CORE-1 priority 24576, shut rogue patch'],
    ['Shipping PCs on 169.254.x.x', 'Ports in deprecated VLAN 2 — no SVI, no scope', 'show vlan brief; CDP native-VLAN mismatch on the trunk', 'Ports → VLAN 30; align trunk native VLAN'],
    ['Finance locked out of payroll', 'FINLOCK seq 10 denies finance (meant to permit)', 'ACL hit counters climbing on seq 10', 'Change seq 10 to permit; keep intended denies'],
    ['Branch cannot reach HQ', 'Missing static route on RTR-CORE (asymmetric return path)', 'Traceroute dies after core; show ip route lacks 10.20.10.0/24', 'ip route 10.20.10.0 255.255.255.0 10.255.0.6'],
    ['Internet down, internal fine', 'Default route lost in an EDGE-RTR rollback', '"Gateway of last resort is not set"', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1'],
    ['Late-joining laptops APIPA', 'POOL-TRAIN /25 (125 assignable) < 130 laptops, 7-day lease', 'DHCP utilization 100%; scope-full log lines', 'Expand to /24; lease ≤ 24 h; alert at 85%'],
    ['CFO + WMS terminal dead', 'Wrong gateway (.254 dead) on WMS; /28 mask excludes gateway on CFO-PC', 'ipconfig comparison; same-subnet-OK / cannot-ARP-gateway signatures', 'Gateway → 10.10.50.1; mask → 255.255.255.0; DHCP-first policy']
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
  </tbody></table>
  <div class="debgrid">
    <div class="kb"><h3>Detection opportunities</h3><p>• Syslog analytics on MACFLAP / storm-control events — alert on ANY occurrence.</p>
    <p>• DHCP utilization telemetry with an 85% threshold per scope.</p>
    <p>• ACL hit-counter review: any deny entry whose counters climb during business hours deserves a policy check.</p>
    <p>• Post-change route audits: diff show ip route against the pre-change backup; alert on "gateway of last resort not set".</p>
    <p>• CDP/LLDP consistency checks for native-VLAN and unexpected neighbors (vendor switches).</p></div>
    <div class="kb"><h3>Blue-team takeaways</h3><p>• Frame-rate controls (storm control), BPDU guard and root guard make loops and root-theft structurally hard.</p>
    <p>• Config backups + change review turn rollbacks from mysteries into diffs.</p>
    <p>• An IP/VLAN register plus DHCP-first for user devices removes the static-typo failure class.</p>
    <p>• Security cross-links (conceptual, not official mappings): flooding abuse ≈ ATT&CK <b>T1498</b> (Network DoS family); rogue/abused DHCP ≈ <b>T1557</b> (Adversary-in-the-Middle family).</p></div>
    <div class="kb"><h3>Attacker-mindset notes (defensive awareness only)</h3><p>• The faults you fixed are also attack primitives: forcing a topology change (spoofed superior BPDUs) or flooding broadcasts can DoS a VLAN; a rogue DHCP server can reroute a segment through an attacker. This lab deliberately teaches the DETECTION and HARDENING side only.</p>
    <p>• Hit counters, syslog, and utilization graphs are your side's tripwires — instrument them before you need them.</p></div>
    <div class="kb"><h3>What to learn next</h3><p>• N10-009 5.1 troubleshooting methodology drills (you practiced step 1–7 in M11).</p>
    <p>• 5.2 wiring/physical issues and 5.4+ service-specific troubleshooting (DNS, DHCP rogue-server detection).</p>
    <p>• Hands-on: rebuild this topology in a network simulator and break it again yourself.</p>
    <p>• References: <a href="https://www.comptia.org/certifications/network" target="_blank" rel="noopener">CompTIA Network+ N10-009 (official)</a> · <a href="https://www.professormesser.com/network-plus/n10-009/n10-009-video/switching-issues-n10-009" target="_blank" rel="noopener">Professor Messer — Switching Issues 5.3</a> · <a href="a developer blog/andrew_despres/comptia-network-n10-009-53-study-guide-routing-switching-and-ip-issues-28i6" target="_blank" rel="noopener">N10-009 5.3 study guide</a></p></div>
  </div>`;
}
