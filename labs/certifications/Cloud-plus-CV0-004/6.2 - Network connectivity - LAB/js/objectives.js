'use strict';
/* =====================================================================
   OBJECTIVES engine
   ===================================================================== */
/* =====================================================================
   OBJECTIVES — CHECK RESULTS engine, tracker widgets, learn widgets.
   Quiz rendering lives in quiz.js; page flow (tabs, completion) in app.js.
   ===================================================================== */
const OBJ_LIST = () => S.mode === 'medium' ? OBJ_META_M : OBJ_META_H;
function ran(sigRe){ return S.activity.cmds.some(c => sigRe.test(c.sig)); }
function ranOk(sigRe){ return S.activity.cmds.some(c => sigRe.test(c.sig) && c.ok); }
function ranCountOk(sigRe, n){ return S.activity.cmds.filter(c => sigRe.test(c.sig) && c.ok).length >= n; }
function curlHas(urlPrefix, status){
  return Object.keys(S.activity.curls).some(k => k.startsWith(urlPrefix) && k.endsWith('|' + status));
}

const CHECKS = {
  'OBJ-M1': () => {
    const ok = S.learn.methodOrder.length === 7 && S.learn.methodOrder.every((v,i) => v === i);
    return { pass: ok, fb: ok ? 'Method locked in. Every incident on this bench (and every “given a scenario” exam item) rewards scoping before fixing — and documenting after verifying.' : 'Not the canonical order yet — the method runs identify → theory → test → plan → implement → verify → document.' };
  },
  'OBJ-M2': () => {
    const pairs = S.learn.toolPairs || {};
    const ok = TOOL_PAIRS.tools.every((_, i) => pairs[i] === i);
    return { pass: ok, fb: ok ? 'Six tools, six layers, no wasted commands. On the exam, tool choice is usually the first elimination step.' : 'Some pairs are crossed — re-read the tool table: ping=L3, traceroute=path, dig=DNS, nc=port, curl=HTTP, openssl s_client=TLS.' };
  },
  'OBJ-M3': () => {
    const a = objState('OBJ-M3');
    const ok = ran(/web1\|nc\|db-01\|5432/) && ran(/web1\|ping\|db-01/) && a.ans.layer === 1;
    return { pass: ok, fb: ok ? 'ICMP alive + TCP 5432 timing out = a stateful filter dropping the port, not a dead host. On sg-db the Postgres rule only covers the data subnet — the web/app tier was never added.' : 'Compare your two commands: if ping works, L3 is fine. A silent timeout on a port means filtering — pick the layer that matches “packets vanish”.' };
  },
  'OBJ-M4': () => {
    const ok = F.sgDb() && ranOk(/web1\|nc\|db-01\|5432/);
    return { pass: ok, fb: ok ? 'Fixed and verified from the original source — step 6 of the method. Note what you did NOT do: open 0.0.0.0/0. Stateful also means one inbound rule was enough; replies flow free.' : 'The rule must actually cover the verifier: TCP 5432 inbound from sg-web (the web tier you are testing from) or 10.20.0.0/16 (the whole VPC). A 0.0.0.0/0 rule would “fix” it while exposing Postgres to the internet — least privilege fails. Then re-run nc from web-01 and get a success.' };
  },
  'OBJ-M5': () => {
    const a = objState('OBJ-M5');
    const ok = ran(/app1\|curl\|http:\/\/mirror[.]cumuluspkgs.net\//) && ran(/app1\|ping\|8\.8\.8\.8/) && !!S.activity.inspected['rt-private'] && a.ans.cause === 1;
    return { pass: ok, fb: ok ? 'Pinging by IP proved DNS was innocent; the route table showed the real gap. Private subnets ride NAT — the IGW is only for public subnets.' : 'Evidence order: curl fails → ping 8.8.8.8 (by IP!) also fails → inspect rt-private. Missing piece: 0.0.0.0/0 → nat-gw-a. DNS, SGs and the mirror itself were never the problem.' };
  },
  'OBJ-M6': () => {
    const ok = F.nat() && ranOk(/app1\|curl\|http:\/\/mirror[.]cumuluspkgs.net\//);
    return { pass: ok, fb: ok ? 'Route added, egress restored, verified with a real 200. NAT gateways are one-way doors: app-01 can now pull packages, but nothing outside can start a session inbound.' : 'Add 0.0.0.0/0 → nat-gw-a in rt-private, then verify with curl from app-01. NAT (not IGW) keeps app-01 private.' };
  },
  'OBJ-M7': () => {
    const ok = FLOW_ROWS_M.every((r,i) => S.flowClass[i] === r.cat);
    return { pass: ok, fb: ok ? 'You read flows like a defender: REJECT on a first SYN = instance firewall (SG); REJECT inbound on random ephemeral ports = stateless NACL; and you ignored the noise.' : 'Key tells: line 2 dies on the FIRST SYN to 5432 (SG). Line 3 is a SYN-ACK coming BACK to a random high port (NACL, stateless). Lines 1/4 are healthy, line 5 is marketing noise.' };
  },
  'OBJ-M8': () => {
    const a = objState('OBJ-M8');
    const ok = !!S.activity.inspected['nacl-app'] && a.ans.rule === 1;
    return { pass: ok, fb: ok ? 'Stateless rules judge every packet alone. Replies land on ephemeral ports 1024–65535 — rule 120 covers only 32768–33433, so most return traffic dies. Intermittent by design.' : 'The service ports are all allowed — the victims are the REPLIES. Which inbound rule is supposed to catch ephemeral ports, and what range does it really cover?' };
  },
  'OBJ-M9': () => {
    const ok = F.nacl() && ranCountOk(/app1\|curl\|http:\/\/mirror[.]cumuluspkgs.net\//, 2);
    return { pass: ok, fb: ok ? 'Two clean requests — the flapping is gone. NACL hygiene note: allow the full ephemeral range; connection-tracking is the security group’s job, not the NACL’s.' : 'Add inbound TCP 1024–65535 to nacl-app, then curl the mirror twice — the old failure rate means a single success proves nothing.' };
  },
  'OBJ-M10': () => {
    const ok = ran(/web1\|dig\|api\.orbitcart\.internal/) && ran(/web1\|ping\|10\.20\.2\.47/) && F.dnsApi();
    return { pass: ok, fb: ok ? 'dig caught the record pointing at the retired 10.20.2.11; the live host answered on 10.20.2.47. You fixed data, not symptoms — TTL 60 means the correction propagates fast.' : 'Sequence: dig the name (see the stale address), ping the REAL host by IP (proves it lives), then correct the A record in the DNS card.' };
  },
  'OBJ-M11': () => {
    const ok = F.lb() && curlHas('http://store[.]orbitcart.net/', '200') && !!S.activity.inspected['lb'];
    return { pass: ok, fb: ok ? '2/2 healthy, VIP answering 200. Read the codes you met: 502 = nothing healthy behind the LB, 404 = wrong path, 301 = a redirect your probe never expected.' : 'The probe must match what targets actually serve: port 8080, path /healthz, expecting 200. Then verify from shoppers — full outage ends when 2/2 flip green.' };
  },
  'OBJ-M12': () => {
    const a = objState('OBJ-M12').ans;
    const ok = DRILL_CASES.every((c,i) => a['d' + i] === c.correct);
    return { pass: ok, fb: ok ? 'Six for six: stateful vs stateless, overlap, APIPA, latency vs bandwidth, and an L2 VLAN typo — the full 6.2 spread, recognized on sight.' : 'Re-read the wrong ones: SG kills first SYNs · NACL kills returns · overlap = two sites, one CIDR · 169.254.x.x = scope exhaustion · high RTT + small transfers = latency · tag typo = L2 isolation.' };
  },
  'OBJ-H1': () => {
    const ok = F.lb() && ran(/shoppers\|curl\|http:\/\/store\.orbitcart\.net\//) && curlHas('http://store[.]orbitcart.net/', '200') && !!S.activity.inspected['lb'];
    return { pass: ok, fb: ok ? 'Reproduced from the customer vantage, root-caused despite the sg-web red herring, fixed, verified 200. The 8443 rule only proved someone changed the probe port once — the targets never served it.' : 'Work the chain: reproduce (curl from shoppers → 502), inspect tg-store (0/2, probe on 8443/api-status), notice the sg-web 8443 rule is a decoy, fix probe to 8080 + /healthz, verify 200.' };
  },
  'OBJ-H2': () => {
    const a = objState('OBJ-H2');
    const ok = a.ans.dir === 1 && a.ans.rule === 1 && F.nacl();
    return { pass: ok, fb: ok ? 'Pattern identified (inbound SYN-ACKs to ephemeral ports), rule named (120), hole closed. ICMP kept working throughout — that asymmetry was the tell.' : 'Direction: inbound (the victims are return SYN-ACKs). Rule: 120 — a 665-port sliver of the 64k ephemeral range. Fix: allow TCP 1024–65535 inbound on nacl-app.' };
  },
  'OBJ-H3': () => {
    const a = objState('OBJ-H3');
    const ok = a.ans.diag === 1 && F.mtu() && ranOk(/corp\|scp\|big-dump/);
    return { pass: ok, fb: ok ? 'Small packets passed while DF-set 1478-byte probes vanished: a PMTUD black hole. MTU 1436 (Cumulus example) lets TCP segment below the real limit — the scp completed.' : 'Symptoms only fit MTU: BGP stable, pings small-pass, scp stalls, oversized DF probes die silently. Set the tunnel MTU to 1436 and re-run the scp until it completes.' };
  },
  'OBJ-H4': () => {
    const a = objState('OBJ-H4');
    const ok = F.tgw() && a.ans.why === 1 && ranOk(/app1\|nc\|analytics-01\|5432/);
    return { pass: ok, fb: ok ? 'Attachments + propagation make tgw-1 a real hub. Peering links pairs; it never chains — that is why “routes exist” everywhere and packets still died.' : 'Why: non-transitive peering (pick it). Durable fix: attach prod, stage and analytics to tgw-1 AND enable route propagation, then verify nc from app-01 succeeds.' };
  },
  'OBJ-H5': () => {
    const a = objState('OBJ-H5');
    const ok = F.cert() && curlHas('https://api[.]orbitcart.net/', '200') && ran(/shoppers\|ossl\|api\.orbitcart\.net/) && a.ans.legacy === 1;
    return { pass: ok, fb: ok ? 'openssl proved expiry (notAfter Aug 30 2026), renewal restored the handshake, and you refused to “fix” the legacy monitor by weakening TLS — RFC 8996 killed 1.0/1.1; upgrade the client.' : 'Chain: curl shows error 60 → openssl shows notAfter in the past → renew → verify 200. The monitor’s “protocol version” error is TLS deprecation, not certificates.' };
  },
  'OBJ-H6': () => {
    const ok = F.dhcp() && ran(/pod1\|dig\|payments\.orbitcart\.internal/);
    return { pass: ok, fb: ok ? 'Two DHCP wounds closed: the pool had nothing left to lease (APIPA) and the options pointed pods at a public resolver that cannot see orbitcart.internal.' : 'Evidence: pod-01 held 169.254.3.14 (APIPA = exhausted pool) and dig NXDOMAIN (public resolver). Fix both: pool end ≥ 200 and dns = 10.20.0.10.' };
  },
  'OBJ-H7': () => {
    const ok = (S.learn.triageOrder || []).length === 6 && S.learn.triageOrder.every((v,i) => v === i);
    return { pass: ok, fb: ok ? 'Scope → cheap tests → policy inspection → least-privilege fix → verify → document. Under pressure, the method IS the speed.' : 'Order the six: reproduce & scope first; ping (L3) before nc (L4); inspect policy before touching it; change only after a tested theory; verify from the source; document last, always.' };
  },
  'OBJ-H8': () => {
    const set = objState('OBJ-H8').ans.set || [];
    const need = [0,1,2,3,4,5];
    const ok = need.every(i => set.includes(i)) && set.every(i => need.includes(i));
    return { pass: ok, fb: ok ? 'All six real controls selected, all three traps rejected — that is control selection the exam rewards: fixes with trade-offs, not superstition.' : 'Correct set: SG-by-reference · NACL ephemeral hygiene · second-AZ NAT HA · truthful health checks · TGW hub · flow-log REJECT alerting. Traps (never): delete NACLs, open 0.0.0.0/0 “while troubleshooting”, disable certificate verification.' };
  },
  'OBJ-H9': () => {
    const ok = F.dnsPay() && F.sgPay() && ran(/pod1\|dig\|payments\.orbitcart\.internal/) && ran(/pod1\|nc\|10\.20\.3\.54\|8443/) && ranOk(/pod1\|nc\|payments\.orbitcart\.internal\|8443/);
    return { pass: ok, fb: ok ? 'Two independent faults, cleanly separated: dig → stale A record; nc by IP → SG missing the pod CIDR. Fixed both, verified by NAME from pod-01. The CPU alarm and NAT spike never mattered.' : 'Split the evidence: dig answers the name layer (stale .19 → set .54); nc by IP answers policy (sg-pay needs TCP 8443 from 10.20.8.0/24). Verify by name from pod-01 after both.' };
  },
  'OBJ-H10': () => {
    const a = objState('OBJ-H10');
    const ok = F.vlan() && ranOk(/web1\|ping\|legacy-crm/) && a.ans.why === 1;
    return { pass: ok, fb: ok ? 'L2 before L3: a one-digit tag typo isolated the guest below every routing tool. Access = one VLAN; trunk = many. Set 42 → 40 and the host simply reappears.' : 'Perfect IP + perfect routes + zero replies = look lower. The trunk carries 40/50; the access port said 42. Fix the tag, verify with a ping from web-01.' };
  }
};

/* ---------------- tracker widgets ---------------- */
/* R2/R3/R4 contract: options render in a seeded rotated order (value = original index,
   so checks and saved answers are unaffected); after Check the widget locks, the picked
   option alone turns green (correct) or red (wrong), and “Try again” starts a fresh
   blank attempt instead of allowing the checked answer to be edited. */
const ANS_KEY = { 'OBJ-M3|layer':1, 'OBJ-M5|cause':1, 'OBJ-M8|rule':1, 'OBJ-H2|dir':1, 'OBJ-H2|rule':1,
                  'OBJ-H3|diag':1, 'OBJ-H4|why':1, 'OBJ-H5|legacy':1, 'OBJ-H10|why':1 };
function ansCorrect(id, key, oi){
  if(key.charAt(0) === 'd' && /^d\d+$/.test(key)) return DRILL_CASES[parseInt(key.slice(1), 10)].correct === oi;
  return ANS_KEY[id + '|' + key] === oi;
}
const WIDGET_OBJS = ['OBJ-M1','OBJ-M2','OBJ-M3','OBJ-M5','OBJ-M7','OBJ-M8','OBJ-M12','OBJ-H2','OBJ-H3','OBJ-H4','OBJ-H5','OBJ-H7','OBJ-H8','OBJ-H10'];
const MC = (id, key, opts, picked) => {
  const st = objState(id);
  const locked = st.locked || st.done;
  const perm = seededPerm(id + '|' + key, opts.length);
  return `<div class="qOptWrap" role="radiogroup" aria-label="${esc(id)} answer">
  ${perm.map(oi => {
    const sel = picked === oi;
    const verdict = locked && sel ? (ansCorrect(id, key, oi) ? 'correct' : 'wrong') : '';
    return `<label class="qOpt ${sel ? 'picked' : ''} ${verdict}"><input type="radio" name="${id}-${key}" value="${oi}" data-obj="${id}" data-key="${key}" ${sel ? 'checked' : ''} ${locked ? 'disabled' : ''}> <span>${opts[oi]}</span></label>`;
  }).join('')}
  </div>`;
};
const OPTS = {
  M3layer: ['Layer 3 — the routing is broken','Layer 4 — TCP filtering, host alive','Layer 7 — the service crashed'],
  M5cause: ['The internet gateway is down','rt-private lacks 0.0.0.0/0 → nat-gw-a','sg-app blocks outbound DNS','The mirror is rate-limiting app-01'],
  M8rule:  ['Rule 100 — the inbound 443 allow','Rule 120 — the narrow ephemeral range','The final implicit deny','The outbound rule set'],
  H2dir:   ['Outbound — the SYNs never leave app-01','Inbound — the ephemeral return SYN-ACKs die'],
  H2rule:  ['Rule 100 (allow 443)','Rule 120 (allow 32768–33433)','Rule 130 (ICMP)','The catch-all deny'],
  H3diag:  ['Bandwidth saturation on the VPN tunnel link','MTU / PMTUD black hole on the tunnel','A BGP flap dropping the advertised routes','Latency above 45 ms on round-trips'],
  H4why:   ['A route missing in rt-private for analytics','Peering is non-transitive between the VPCs','CIDR overlap prod ↔ analytics','Cumulus API throttling'],
  H5legacy:['Renew the certificate again with a longer validity','Upgrade the monitor — TLS 1.0/1.1 deprecated','Point the monitor at port 8443 instead','Disable certificate verification on the monitor'],
  H10why:  ['The trunk is blocking VLAN 40','The access-port tag has a typo','A route to 10.20.9.0/24 is missing','A security group blocks ICMP'],
  H8set:   ['Reference security groups instead of loose CIDRs','Allow the full ephemeral range on stateless NACLs','Second-AZ NAT gateway + routes (HA)','Health checks that match what targets truly serve','Transit-gateway hub for multi-VPC routing','Flow-log REJECT-spike alerting','Delete all NACLs for simplicity','Open 0.0.0.0/0 everywhere while troubleshooting','Disable TLS certificate verification']
};
function widgetFor(id){
  const st = objState(id), a = st.ans;
  if(id === 'OBJ-M3') return MC(id,'layer',OPTS.M3layer,a.layer);
  if(id === 'OBJ-M5') return MC(id,'cause',OPTS.M5cause,a.cause);
  if(id === 'OBJ-M8') return MC(id,'rule',OPTS.M8rule,a.rule);
  if(id === 'OBJ-M12') return DRILL_CASES.map((c,i) => `<div style="border-top:1px dashed var(--edge);margin-top:10px;padding-top:10px">
      <p style="font-size:13px;margin-bottom:6px"><b style="color:var(--amber)">Case ${i+1}.</b> ${c.q}</p>${MC(id,'d'+i,c.opts,a['d'+i])}</div>`).join('');
  if(id === 'OBJ-H2') return MC(id,'dir',OPTS.H2dir,a.dir) + MC(id,'rule',OPTS.H2rule,a.rule);
  if(id === 'OBJ-H3') return MC(id,'diag',OPTS.H3diag,a.diag);
  if(id === 'OBJ-H4') return MC(id,'why',OPTS.H4why,a.why);
  if(id === 'OBJ-H5') return MC(id,'legacy',OPTS.H5legacy,a.legacy);
  if(id === 'OBJ-H8') return `<div role="group" aria-label="Select the six real controls">${OPTS.H8set.map((o,i) =>
      `<label class="qOpt ${a.set && a.set.includes(i) ? 'picked' : ''}"><input type="checkbox" data-obj="OBJ-H8" data-key="set" value="${i}" ${a.set && a.set.includes(i) ? 'checked' : ''} ${st.locked || st.done ? 'disabled' : ''}> <span>${o}</span></label>`).join('')}</div>`;
  if(id === 'OBJ-H7') return '<div id="seqWidget2"></div>';
  if(id === 'OBJ-H10') return MC(id,'why',OPTS.H10why,a.why);
  return '';
}
function renderTracker(){
  const list = OBJ_LIST();
  const done = list.filter(o => objState(o.id).done).length;
  $('#objCount').textContent = `${done} / ${list.length} complete`;
  const cur = S.mode === 'medium' ? list.findIndex(o => !objState(o.id).done) : -1;
  $('#objList').innerHTML = list.map((o,i) => {
    const st = objState(o.id);
    const maxHints = S.mode === 'medium' ? 3 : 1;
    const hintBtn = st.done ? '' : (st.hintLevel >= maxHints
      ? `<button class="hintBtn" disabled>No hints left</button>`
      : `<button class="hintBtn" data-objhint="${o.id}">Hint (${maxHints - st.hintLevel} left${S.mode === 'hard' ? ' · costs score' : ''})</button>`);
    const whereBtn = (S.mode === 'medium' && o.where && !st.done) ? `<button class="whereBtn" data-objwhere="${o.id}">Show me where</button>` : '';
    const tryAgain = (!st.done && st.locked && WIDGET_OBJS.includes(o.id)) ? `<button class="whereBtn" data-objreset="${o.id}">Try again — clears this attempt</button>` : '';
    return `<article class="objCard rise ${st.done ? 'passed' : (i === cur ? 'current' : '')} ${S.mode === 'medium' && i > cur && !st.done ? 'locked' : ''}" id="ocard-${o.id}">
      <div class="ocTop"><span class="ocId">${o.id}</span><span class="pb ${o.pillar[0] === 'P' ? 'p' + o.pillar[1] : 'p2'}">${o.pillar}</span><h4>${o.title}</h4>
        <span class="ocStatus ${st.done ? 'pass' : (st.attempts ? 'try' : '')}">${st.done ? '✓ PASSED' : (st.attempts ? `attempt ${st.attempts}` : 'pending')}</span></div>
      <div class="ocBody">${o.body}<span class="anchor">Maps to: ${esc(o.anchor)}</span></div>
      ${widgetFor(o.id)}
      <div class="ocBtns">${st.done ? '' : `<button class="chkBtn" data-objcheck="${o.id}">Check results</button>`}${tryAgain}${hintBtn}${whereBtn}</div>
      <div id="fb-${o.id}">${st.lastFb ? `<div class="fbBox ${st.lastFb.pass ? 'ok' : 'no'}" role="status"><b>${st.lastFb.pass ? '✓ Correct' : '✗ Not yet'}</b>${esc(st.lastFb.text)}</div>` : ''}</div>
      <div id="hint-${o.id}">${st.hintLevel ? `<div class="hintBox"><b>Hint ${st.hintLevel}:</b> ${o.hints[st.hintLevel-1]}</div>` : ''}</div>
    </article>`;
  }).join('');
  refreshProgress();
  if(S.mode === 'hard') renderSeqH7();
}
function refreshProgress(){
  const list = OBJ_LIST();
  const done = list.filter(o => objState(o.id).done).length;
  const frac = done / list.length;
  $('#ringFg').style.strokeDashoffset = String(100.5 * (1 - frac));
  $('#ringNum').textContent = String(done);
  const allDone = done === list.length && S.quiz.done;
  $('#finishBtn').disabled = !allDone;
  $('#finishHint').textContent = allDone ? '' :
    (done < list.length ? `${list.length - done} objective${list.length - done > 1 ? 's' : ''} left` : 'Finish the quiz');
  $('#railCnt').textContent = `${done}/${list.length}`;
  updateMapStatus();
  const rb = $('#railBody');
  if(rb && rb.dataset.built === '1') renderRail();
  save();
}
function showFeedback(id, pass, text){
  const box = $('#fb-' + id);
  if(!box) return;
  box.innerHTML = `<div class="fbBox ${pass ? 'ok' : 'no'}" role="status"><b>${pass ? '✓ Correct' : '✗ Not yet'}</b>${esc(text)}</div>`;
  announce((pass ? 'Correct: ' : 'Not yet: ') + text);
}
function runCheck(id){
  const st = objState(id);
  if(st.done) return;
  if(st.lastCheck && Date.now() - st.lastCheck < 400) return; // double-click guard (cleared by any new interaction)
  st.lastCheck = Date.now();
  st.attempts++;
  const res = CHECKS[id]();
  st.lastFb = { pass: !!res.pass, text: res.fb };
  if(res.pass){
    st.done = true;
    st.locked = true;
    st.firstTry = st.attempts === 1;
    showFeedback(id, true, res.fb);
    toast(`${id} passed${st.firstTry ? ' on the first attempt' : ''}`);
  } else {
    st.locked = true; // R2: the submitted answer is locked; “Try again” starts a fresh attempt
    showFeedback(id, false, res.fb);
  }
  if(id === 'OBJ-M1' || id === 'OBJ-M2' || id === 'OBJ-H7') renderLearnWidgetsOnly(); // apply locked visuals immediately
  if(id === 'OBJ-M7'){ const fc = $('#card-flowlogs'); if(fc){ $('#inspTitle').textContent = 'Inspector — evidence'; $('#inspBody').innerHTML = cardFLOWLOGS() + cardMETRICS(); } }
  renderTracker();
  if(S.mode === 'medium'){
    const list = OBJ_LIST();
    const nxt = list.findIndex(o => !objState(o.id).done);
    if(nxt >= 0) currentObjIdx = nxt;
  }
  save();
}
function useHint(id){
  const st = objState(id);
  const maxHints = S.mode === 'medium' ? 3 : 1;
  if(st.hintLevel >= maxHints) return;
  st.hintLevel++;
  save();
  renderTracker();
  if(S.mode === 'hard') toast('Hint used — it will cost star rating at the finish.');
  announce('Hint ' + st.hintLevel + ' revealed.');
}
function useWhere(id){
  const o = OBJ_LIST().find(x => x.id === id);
  if(!o || !o.where) return;
  switchTab(o.where.tab);
  if(o.where.node){
    selectNode(o.where.node);
    switchTab('bench');
  } else if(o.where.focusBtn){
    const b = $(o.where.focusBtn);
    if(b){ b.classList.add('flashTarget'); setTimeout(() => b.classList.remove('flashTarget'), 3500); }
  }
  if(o.where.sel){
    setTimeout(() => { const el = $(o.where.sel); if(el){ el.classList.remove('flashTarget'); void el.offsetWidth; el.classList.add('flashTarget'); el.scrollIntoView({ block:'nearest', behavior:'smooth' }); } }, 150);
  } else if(o.where.sel === '#seqWidget' || o.where.sel === '#matchWidget'){
    setTimeout(() => { const el = $(o.where.sel); if(el){ el.scrollIntoView({ block:'center', behavior:'smooth' }); el.classList.add('flashTarget'); } }, 150);
  }
}

/* tracker interaction delegation */
document.addEventListener('change', ev => {
  const inp = ev.target.closest('input[data-obj]');
  if(!inp) return;
  const id = inp.dataset.obj, key = inp.dataset.key;
  const st = objState(id);
  if(st.locked || st.done) return; // R2: no editing after the validating press
  st.lastCheck = 0; // any new interaction re-arms the check button
  if(inp.type === 'radio'){ st.ans[key] = parseInt(inp.value, 10); }
  else {
    st.ans.set = st.ans.set || [];
    const v = parseInt(inp.value, 10);
    st.ans.set = st.ans.set.includes(v) ? st.ans.set.filter(x => x !== v) : st.ans.set.concat(v);
  }
  save();
  if(inp.type === 'radio'){
    const wrap = inp.closest('.qOptWrap');
    if(wrap) $$('.qOpt', wrap).forEach(l => l.classList.remove('picked'));
    inp.closest('.qOpt').classList.add('picked');
  } else {
    inp.closest('.qOpt').classList.toggle('picked', inp.checked);
  }
});
document.addEventListener('click', ev => {
  const chk = ev.target.closest('[data-objcheck]');
  if(chk){ runCheck(chk.dataset.objcheck); return; }
  const rst = ev.target.closest('[data-objreset]');
  if(rst){
    const id = rst.dataset.objreset, st = objState(id);
    st.locked = false; st.ans = {}; st.lastCheck = 0;
    if(id === 'OBJ-M7'){ S.flowClass = {}; }
    if(id === 'OBJ-M1'){ S.learn.methodOrder = []; rerenderSeqFor('methodOrder'); }
    if(id === 'OBJ-M2'){ S.learn.toolPairs = {}; matchSel = null; S.learn.matchEpoch = (S.learn.matchEpoch || 0) + 1; }
    if(id === 'OBJ-H7'){ S.learn.triageOrder = []; rerenderSeqFor('triageOrder'); }
    save(); renderTracker();
    announce('Fresh attempt started for ' + id + '.');
    return;
  }
  const hint = ev.target.closest('[data-objhint]');
  if(hint){ useHint(hint.dataset.objhint); return; }
  const where = ev.target.closest('[data-objwhere]');
  if(where){ useWhere(where.dataset.objwhere); return; }
});

/* ---------------- Learn widgets (sequence + match) ---------------- */
const METHOD_DISP = [3,0,6,2,5,1,4];
const PURPOSE_DISP = [2,5,0,3,1,4];
function renderLearn(){
  $('#learnBody').innerHTML = LEARN_HTML;
  renderSeq('#seqWidget', 'OBJ-M1 · Sequence the seven-step method',
    'Click the steps in the order a NOC senior works them.', METHOD_STEPS, METHOD_DISP, 'methodOrder');
  renderMatch();
}
function renderSeq(sel, title, sub, steps, disp, key){
  const used = S.learn[key] || [];
  const seqObj = objState(key === 'methodOrder' ? 'OBJ-M1' : 'OBJ-H7');
  const locked = seqObj.locked || seqObj.done;
  const bank = disp.filter(i => !used.includes(i)).map(i => `<button class="seqChip" data-seq="${key}" data-i="${i}" ${locked ? 'disabled' : ''}>${esc(steps[i])}</button>`).join('');
  const ans = used.map((idx,pos) => `<span class="seqChip"><span class="seqNum">${pos+1}</span>${esc(steps[idx])}</span>`).join('');
  const wd = locked
    ? `<span style="align-self:center;font-size:12.5px;color:var(--amber)">Locked after the check — use “Try again” on ${key === 'methodOrder' ? 'OBJ-M1' : 'OBJ-H7'} for a fresh attempt.</span>`
    : `<button class="rbtn" data-sequndo="${key}">Undo last</button><button class="rbtn" data-seqclear="${key}">Clear</button>
    <span style="align-self:center;font-size:12.5px;color:var(--mut)">Checked with ${S.mode === 'medium' ? 'OBJ-M1' : 'OBJ-H7'} in the Objectives tab.</span>`;
  $(sel).innerHTML = `<h3>${esc(title)}</h3><p class="wh">${esc(sub)}</p>
    <p class="placard">Answer — click in order</p><div class="seqAns" id="seqAns-${key}">${ans || '<span style="color:var(--dim);font-size:13px">(empty — pick from the bank below)</span>'}</div>
    <p class="placard">Step bank</p><div class="seqBank">${bank}</div>
    <div class="wdBtns">${wd}</div>`;
}
function renderMatch(){
  const pairs = S.learn.toolPairs || {};
  const m2 = objState('OBJ-M2');
  const locked = m2.locked || m2.done;
  const disp = seededPerm('match|' + (S ? S.startedAt : 0) + '|' + (S.learn.matchEpoch || 0), TOOL_PAIRS.purposes.length); // R6: shuffled; re-rolled when the board resets (matchEpoch bumps on Try again)
  const tHtml = TOOL_PAIRS.tools.map((t,i) => `<button class="matchBtn ${pairs[i] !== undefined ? 'paired' : ''}" data-mtool="${i}" ${locked ? 'disabled' : ''}>${esc(t)}</button>`).join('');
  const pHtml = disp.map(i => `<button class="matchBtn ${Object.values(pairs).includes(i) ? 'paired' : ''}" data-mpurp="${i}" ${locked ? 'disabled' : ''}>${esc(TOOL_PAIRS.purposes[i])}</button>`).join('');
  const lines = Object.keys(pairs).map(ti => `<div class="pairLine">✓ ${esc(TOOL_PAIRS.tools[ti])} → ${esc(TOOL_PAIRS.purposes[pairs[ti]])}</div>`).join('');
  $('#matchWidget').innerHTML = `<h3>OBJ-M2 · Match tools to the questions they answer</h3>
    <p class="wh">Click a tool, then the question it answers. Pairs lock in green; check with OBJ-M2 in the Objectives tab.</p>
    <div class="matchGrid"><div class="matchCol">${tHtml}</div><div class="matchCol">${pHtml}</div></div>
    ${lines}
    ${locked ? '<p style="font-size:12.5px;color:var(--amber);margin-top:6px">Locked after the check — use “Try again” on OBJ-M2 for a fresh, reshuffled board.</p>'
             : '<div class="wdBtns"><button class="rbtn" id="matchReset">Reset pairs</button></div>'}`;
}
let matchSel = null;
function matchLocked(){ const m2 = objState('OBJ-M2'); return m2.locked || m2.done; }
document.addEventListener('click', ev => {
  const seq = ev.target.closest('[data-seq]');
  if(seq){
    const key = seq.dataset.seq;
    const seqObjId = key === 'methodOrder' ? 'OBJ-M1' : 'OBJ-H7';
    const seqObj = objState(seqObjId);
    if(seqObj.locked || seqObj.done){ toast('Locked after the check — use “Try again” on ' + seqObjId + '.'); return; }
    seqObj.lastCheck = 0;
    S.learn[key] = (S.learn[key] || []).concat(parseInt(seq.dataset.i,10));
    save(); rerenderSeqFor(key);
    return;
  }
  const undo = ev.target.closest('[data-sequndo]');
  if(undo){ const k = undo.dataset.sequndo; const seqObj = objState(k === 'methodOrder' ? 'OBJ-M1' : 'OBJ-H7'); if(seqObj.locked || seqObj.done) return; seqObj.lastCheck = 0; S.learn[k] = (S.learn[k] || []).slice(0,-1); save(); rerenderSeqFor(k); return; }
  const clr = ev.target.closest('[data-seqclear]');
  if(clr){ const k = clr.dataset.seqclear; const seqObj = objState(k === 'methodOrder' ? 'OBJ-M1' : 'OBJ-H7'); if(seqObj.locked || seqObj.done) return; seqObj.lastCheck = 0; S.learn[k] = []; save(); rerenderSeqFor(k); return; }
  const mt = ev.target.closest('[data-mtool]');
  if(mt){
    if(matchLocked()){ toast('Locked after the check — use “Try again” on OBJ-M2 for a fresh board.'); return; }
    objState('OBJ-M2').lastCheck = 0;
    matchSel = parseInt(mt.dataset.mtool,10); $$('#matchWidget [data-mtool]').forEach(b => b.classList.toggle('sel', b === mt)); return;
  }
  const mp = ev.target.closest('[data-mpurp]');
  if(mp){
    if(matchLocked()){ toast('Locked after the check — use “Try again” on OBJ-M2 for a fresh board.'); return; }
    if(matchSel === null){ toast('Pick a tool first, then its purpose.'); return; }
    objState('OBJ-M2').lastCheck = 0;
    S.learn.toolPairs[matchSel] = parseInt(mp.dataset.mpurp,10);
    matchSel = null; save(); renderMatch(); return;
  }
  if(ev.target.closest('#matchReset')){ if(matchLocked()) return; objState('OBJ-M2').lastCheck = 0; S.learn.toolPairs = {}; matchSel = null; save(); renderMatch(); return; }
  const tx = ev.target.closest('.toastX');
  if(tx){ $('#toast').classList.add('hidden'); return; }
});
function renderLearnWidgetsOnly(){ renderSeq('#seqWidget','OBJ-M1 · Sequence the seven-step method','Click the steps in the order a NOC senior works them.',METHOD_STEPS,METHOD_DISP,'methodOrder'); renderMatch(); }
function rerenderSeqFor(key){
  if(key === 'methodOrder') renderSeq('#seqWidget','OBJ-M1 · Sequence the seven-step method','Click the steps in the order a NOC senior works them.',METHOD_STEPS,METHOD_DISP,key);
  else renderSeq('#seqWidget2','OBJ-H7 · Triage order under pressure','Six actions for “service unreachable” — order them exactly.',TRIAGE_STEPS,TRIAGE_DISP,key);
}
const TRIAGE_STEPS = ['Reproduce & scope the symptom','Test L3 reachability with ping','Test the service port with nc','Inspect SG / NACL / route tables','Apply the least-privilege fix & re-test','Document & set monitoring'];
const TRIAGE_DISP = [2,5,0,4,1,3];
function renderSeqH7(){
  const host = $('#seqWidget2');
  if(host) renderSeq('#seqWidget2','OBJ-H7 · Triage order under pressure','Six actions for “service unreachable” — order them exactly.',TRIAGE_STEPS,TRIAGE_DISP,'triageOrder');
}
