/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/instruments.js — the four bench instruments + hard-mode boards:
   terminal, PacketLens analyzer, CableCheck tester, AirView Wi-Fi, pairing, method.
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
/* ================= terminal ================= */
function runCommand(raw){
  raw = raw.trim();
  if(!raw) return;
  termLine('cmd','WS-BILL03> ' + raw);
  const tokens = raw.split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const arg = tokens.slice(1).join(' ');
  const low = raw.toLowerCase();
  S.cmds.push({cmd:cmd, raw:low});
  if(cmd === 'clear' || cmd === 'cls'){ S.term.hist = []; $('#termOut').innerHTML = ''; save(); return; }
  if(cmd === 'help'){
    ['Available commands (simulated shell, training data):',
     '  ipconfig [/all]         Windows IP configuration',
     '  ifconfig [-a]           Linux-style interface configuration',
     '  ping <host|ip>          ICMP echo test',
     '  tracert <ip>            trace the route hop by hop',
     '  nslookup <name> [srv]   DNS lookup (optionally via a server)',
     '  dig [@server] <name>    DNS lookup, Linux style',
     '  arp -a                  LAN IP-to-MAC cache',
     '  netstat -n              open TCP sessions',
     '  route print             routing table',
     '  clear | cls             clear the screen'].forEach(l => termLine('', l));
  }
  else if(cmd === 'ipconfig'){
    if(/\/?all/.test(arg)){
      ['Windows IP Configuration','Host Name . . . . . . . . . . . . : WS-BILL03',
       'Ethernet adapter Ethernet0:','   Connection-specific DNS Suffix . : lakeshore.local',
       '   DHCP Enabled. . . . . . . . . . . : No',
       '   IPv4 Address. . . . . . . . . . . : 10.20.40.57 (Preferred)',
       '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
       '   Default Gateway . . . . . . . . . : 10.20.40.1',
       '   DNS Servers . . . . . . . . . . . : 203.0.113.53',
       '   Physical Address. . . . . . . . . : 54-E1-AD-3C-92-B7',
       'Note: DHCP is OFF and the DNS server is an EXTERNAL address (the retired ISP resolver 203.0.113.53).'].forEach(l => termLine(l.startsWith('Note') ? 'attn' : '', l));
    } else {
      ['Windows IP Configuration','Ethernet adapter Ethernet0:','   IPv4 Address. . . . . . . . . . . : 10.20.40.57','   Subnet Mask . . . . . . . . . . . : 255.255.255.0','   Default Gateway . . . . . . . . . : 10.20.40.1'].forEach(l => termLine('', l));
    }
  }
  else if(cmd === 'ifconfig'){
    if(/-a|all/.test(arg)){
      ['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500','      inet 10.20.40.57  netmask 255.255.255.0  broadcast 10.20.40.255','      ether 54:e1:ad:3c:92:b7  txqueuelen 1000  (Ethernet)','','Note: no DHCP lease — this station is statically configured (training note).'].forEach((l,i) => termLine(l.startsWith('Note') ? 'attn' : '', l));
    } else {
      ['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500','      inet 10.20.40.57  netmask 255.255.255.0  broadcast 10.20.40.255','      ether 54:e1:ad:3c:92:b7  txqueuelen 1000  (Ethernet)'].forEach(l => termLine('', l));
    }
  }
  else if(cmd === 'ping'){
    const target = (arg || '').toLowerCase().replace(/^-n\s+\d+\s*/,'');
    if(!target){ termLine('sys','Usage: ping <host|ip>'); }
    else if(/^(filesrv|filesrv\.lakeshore\.local)$/.test(target)){
      termLine('attn','Ping request could not find host ' + target + '. Please check the name and try again.');
      termLine('sys','Name lookup failed BEFORE any packet was sent — try the same target by IP.');
    }
    else if(/^(svr-core|svr-core\.lakeshore\.local)$/.test(target)){
      termLine('attn','Ping request could not find host ' + target + '. Please check the name and try again.');
    }
    else if(/^10\.\d+\.\d+\.\d+$|^\d{1,3}(\.\d{1,3}){3}$/.test(target)){
      const info = PING_OK[target];
      if(info){
        termLine('','Pinging ' + target + ' [' + (target==='8.8.8.8'?'8.8.8.8':target) + '] with 32 bytes of data:');
        for(let i=0;i<4;i++) termLine('','Reply from ' + target + ': bytes=32 time=' + (1+i%2) + 'ms TTL=' + info.ttl);
        termLine('sys','Ping statistics for ' + target + ': Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)');
      } else {
        termLine('','Pinging ' + target + ' with 32 bytes of data:');
        for(let i=0;i<4;i++) termLine('attn','Request timed out.');
        termLine('sys','Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)');
      }
    }
    else if(/^www\./.test(target)){
      termLine('','Pinging ' + target + ' [142.250.72.196] with 32 bytes of data:');
      for(let i=0;i<4;i++) termLine('','Reply from 142.250.72.196: bytes=32 time=12ms TTL=115');
      termLine('sys','The retired ISP resolver still answers PUBLIC names — only internal names fail.');
    }
    else { termLine('attn','Ping request could not find host ' + target + '. Please check the name and try again.'); }
  }
  else if(cmd === 'tracert'){
    const target = (arg || '8.8.8.8').toLowerCase();
    if(/10\.20\.40\.20/.test(target)){
      termLine('','Tracing route to 10.20.40.20 over a maximum of 30 hops:');
      termLine('','  1     1 ms     1 ms     1 ms  10.20.40.20');
      termLine('sys','Trace complete — the file server is one L2/L3 hop away on the same subnet.');
    } else {
      termLine('','Tracing route to 8.8.8.8 over a maximum of 30 hops:');
      [['  1     1 ms     1 ms     1 ms  10.20.40.1',''],['  2     4 ms     4 ms     5 ms  100.64.10.1',''],['  3     7 ms     6 ms     7 ms  203.0.113.2',''],['  4    11 ms    10 ms    12 ms  198.51.100.9',''],['  5    12 ms    12 ms    13 ms  8.8.8.8','']].forEach(h => termLine('', h[0]));
      termLine('sys','Trace complete — the ISP path is healthy, which argues against an ISP outage.');
    }
  }
  else if(cmd === 'nslookup'){
    const parts = tokens.slice(1);
    const name = (parts[0] || '').toLowerCase();
    const srv = (parts[1] || '').toLowerCase();
    if(!name){ termLine('sys','Default Server: UnKnown'); termLine('sys','Address: 203.0.113.53'); termLine('attn','This workstation is asking 203.0.113.53 — an external resolver.'); }
    else if(srv === '10.20.40.10'){
      termLine('sys','Server:  svr-core.lakeshore.local'); termLine('sys','Address:  10.20.40.10','');
      if(/filesrv/.test(name)){ termLine('','Name:    filesrv.lakeshore.local'); termLine('','Address:  10.20.40.20'); termLine('sys','The internal server answers instantly when asked directly.'); }
      else { termLine('','Name:    ' + name); termLine('attn','*** No A record for ' + name); }
    }
    else if(/filesrv|svr-core|\.lakeshore\.local/.test(name)){
      termLine('sys','Server:  UnKnown'); termLine('sys','Address:  203.0.113.53'); termLine('');
      termLine('attn','*** UnKnown can\'t find ' + name + ': Non-existent domain');
      termLine('sys','The external resolver has no view of the internal lakeshore.local zone.');
    }
    else {
      termLine('sys','Server:  UnKnown'); termLine('sys','Address:  203.0.113.53'); termLine('');
      termLine('','Non-authoritative answer:'); termLine('','Name:    ' + name); termLine('','Address:  142.250.72.196');
    }
  }
  else if(cmd === 'dig'){
    let name = tokens[1] || '', srv = '';
    if(name.startsWith('@')){ srv = name.slice(1); name = tokens[2] || ''; }
    if(!name){ termLine('sys','Usage: dig [@server] <name>'); }
    else {
      termLine('','; <<>> DiG 9.18 (simulated) <<>> ' + (srv ? '@' + srv + ' ' : '') + name);
      termLine('sys',';; SERVER: ' + (srv ? srv + '#53(' + srv + ')' : '203.0.113.53#53(203.0.113.53)'));
      if(/filesrv|svr-core|lakeshore\.local/.test(name) && srv !== '10.20.40.10'){
        termLine('attn',';; status: NXDOMAIN'); termLine('sys',';; The external resolver knows nothing about the internal zone.');
      } else if(/filesrv/.test(name)){
        termLine('',';; status: NOERROR'); termLine('',';; ANSWER SECTION:'); termLine('','filesrv.lakeshore.local. 300  IN  A  10.20.40.20');
      } else {
        termLine('',';; status: NOERROR'); termLine('',';; ANSWER SECTION:'); termLine('','' + name + '. 300  IN  A  142.250.72.196');
      }
    }
  }
  else if(cmd === 'arp' && /-a/.test(arg)){
    ['Interface: 10.20.40.57 --- 0x4','  Internet Address      Physical Address      Type',
     '  10.20.40.1            00-1b-21-7c-44-01     dynamic',
     '  10.20.40.10           3c-2a-f4-0d-19-e8     dynamic',
     '  10.20.40.20           00-15-5d-9b-3e-22     dynamic',
     '  10.20.40.30           8c-16-45-d2-70-aa     dynamic',
     '  10.20.40.255          ff-ff-ff-ff-ff-ff     static'].forEach(l => termLine('', l));
  }
  else if(cmd === 'netstat'){
    ['Active Connections','  Proto  Local Address          Foreign Address        State',
     '  TCP    10.20.40.57:51820      10.20.40.20:445        ESTABLISHED',
     '  TCP    10.20.40.57:51900      10.20.40.10:88         ESTABLISHED',
     '  TCP    10.20.40.57:52044      10.20.40.30:5060       ESTABLISHED',
     '  TCP    10.20.40.57:52100      10.20.40.30:5060       SYN_SENT'].forEach(l => termLine('', l));
    termLine('sys','A session sits in SYN_SENT toward the PBX — consistent with lost SYNs (see PacketLens, hard shift).');
  }
  else if(cmd === 'route' && /print/.test(arg)){
    ['IPv4 Route Table','  Destination        Netmask          Gateway         Interface',
     '  0.0.0.0            0.0.0.0          10.20.40.1      10.20.40.57',
     '  10.20.40.0         255.255.255.0    On-link         10.20.40.57',
     '  127.0.0.0          255.0.0.0        On-link         127.0.0.1'].forEach(l => termLine('', l));
    termLine('sys','Default gateway 10.20.40.1 — routing is not the problem here.');
  }
  else { termLine('sys', "'" + cmd + "' is not recognized. Type help for the command list."); }
  save();
  autoCheck();
}

/* ================= analyzer ================= */
function packetsFor(){ return S.mode === 'hard' ? PACKETS_M.concat(PACKETS_H) : PACKETS_M; }
function pktById(id){ return packetsFor().find(p => p.id === id); }
function renderPkts(){
  const body = $('#pktBody'); body.innerHTML = '';
  if(!S.an.captured){
    const tr = document.createElement('tr'); tr.className = 'pkt placeholder';
    const td = document.createElement('td'); td.colSpan = 6; td.style.color = 'var(--dim)'; td.textContent = 'No capture yet — press CAPTURE.';
    tr.appendChild(td); body.appendChild(tr); return;
  }
  const f = S.an.filter.trim().toLowerCase();
  let shown = 0;
  packetsFor().forEach(p => {
    const hay = (p.proto + ' ' + p.src + ' ' + p.dst + ' ' + p.info).toLowerCase();
    if(f && !hay.includes(f)) return;
    shown++;
    const tr = document.createElement('tr'); tr.className = 'pkt'; tr.tabIndex = 0;
    tr.setAttribute('role','button'); tr.setAttribute('aria-selected', S.an.opened === p.id ? 'true' : 'false');
    const isRetrans = p.info.indexOf('Retransmission') >= 0;
    const pb = isRetrans ? 'pb-retrans' : ({DNS:'pb-dns',TCP:'pb-tcp',UDP:'pb-udp',ICMP:'pb-icmp',ARP:'pb-arp'}[p.proto] || '');
    const cells = [p.id.toUpperCase(), p.t, p.src, p.dst];
    cells.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
    const tdP = document.createElement('td'); const sp = document.createElement('span');
    sp.className = 'protoBadge ' + pb; sp.textContent = p.proto; tdP.appendChild(sp); tr.appendChild(tdP);
    const tdI = document.createElement('td'); tdI.textContent = p.info; tr.appendChild(tdI);
    const open = () => {
      S.an.opened = p.id; save(); renderPkts();
      const det = $('#pktDetail'); det.textContent = p.det.join('\n'); det.classList.add('show');
      autoCheck();
    };
    tr.addEventListener('click', open);
    tr.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
    body.appendChild(tr);
  });
  if(!shown){
    const tr = document.createElement('tr'); tr.className = 'pkt placeholder';
    const td = document.createElement('td'); td.colSpan = 6; td.style.color = 'var(--dim)'; td.textContent = 'No frames match the filter.';
    tr.appendChild(td); body.appendChild(tr);
  }
}

/* ================= cable tester ================= */
function renderCables(){
  const list = $('#cableList'); list.innerHTML = '';
  Object.keys(CABLES).forEach(id => {
    const c = CABLES[id];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cable' + (S.cable.sel === id ? ' sel' : '');
    b.setAttribute('role','radio'); b.setAttribute('aria-checked', S.cable.sel === id ? 'true' : 'false');
    b.innerHTML = '<b>' + c.name + '</b><span>' + c.sub + '</span>';
    b.addEventListener('click', () => { S.cable.sel = id; save(); renderCables(); });
    list.appendChild(b);
  });
}
function renderCableResult(){
  const box = $('#cableResult');
  const id = S.cable.sel;
  if(!id || !S.cable.tested.includes(id)){ box.innerHTML = '<p class="note">Select a cable, then RUN TEST. The bench keeps results for every cable you test.</p>'; return; }
  const c = CABLES[id];
  let html = '<span class="verdictBadge vb-' + c.vb + '">' + c.verdict + '</span> <span class="tag">LENGTH ' + c.length + '</span>';
  html += '<div class="wiremap">';
  c.map.forEach(m => {
    html += '<div class="row"><span class="num">Pin ' + m[0] + '</span><span class="wirebar" style="background:' + PINCOL[m[0]] + '"></span><span class="' + (m[1] === 'ok' ? 'wm-ok' : 'wm-split') + '">' + (m[1] === 'ok' ? 'OK' : 'SPLIT') + '</span></div>';
  });
  html += '</div><p class="sub" style="margin-top:10px;font-size:.9rem">' + c.note + '</p>';
  box.innerHTML = html;
}
function updateCableForms(){
  const t = S.cable.tested;
  $('#c1Form').classList.toggle('hidden', !t.includes('c1'));
  $('#c2Form').classList.toggle('hidden', !t.includes('c2'));
}

/* ================= wifi ================= */
function renderWifi(){
  const body = $('#wifiBody'); body.innerHTML = '';
  WIFI.forEach(w => {
    const tr = document.createElement('tr');
    const sigClass = w.dbm <= -70 ? 's-weak' : (w.dbm <= -58 ? 's-mid' : 's-strong');
    tr.innerHTML = '<td><b>' + w.ssid + '</b></td><td style="font-family:var(--mono);font-size:.78rem">' + w.ap + '</td><td>' + w.band + '</td><td style="font-family:var(--mono)">' + w.ch + '</td><td class="sig ' + sigClass + '">' + w.dbm + ' dBm</td><td><span class="chip ' + (w.sec === 'Open' ? 'open' : 'sec') + '">' + w.sec + '</span></td>';
    body.appendChild(tr);
  });
}

/* ================= pairing (hard) ================= */
let pairSelL = null;
function renderPair(){
  const grid = $('#pairGrid'); grid.innerHTML = '';
  const p = S.pair; if(!p) return;
  const usedR = Object.values(p.made);
  for(let i = 0; i < PAIRS.length; i++){
    const li = p.lo[i], ri = p.ro[i];
    const left = document.createElement('button');
    left.type = 'button';
    left.className = 'pairItem' + (p.made[li] !== undefined ? ' done' : '') + (pairSelL === li ? ' selA' : '') + (p.checked ? ' locked' : '');
    left.textContent = PAIRS[li].symptom;
    left.setAttribute('aria-label', 'Symptom: ' + PAIRS[li].symptom);
    left.addEventListener('click', () => {
      if(p.checked) return;
      if(p.made[li] !== undefined){ delete p.made[li]; pairSelL = null; save(); renderPair(); return; }
      pairSelL = (pairSelL === li) ? null : li;
      renderPair();
    });
    const mid = document.createElement('div'); mid.className = 'pairLink';
    mid.textContent = p.made[li] !== undefined ? '— P' + (i + 1) + ' —' : '·';
    const right = document.createElement('button');
    right.type = 'button';
    right.className = 'pairItem' + (usedR.includes(ri) ? ' done' : '') + (p.checked ? ' locked' : '');
    right.textContent = PAIRS[ri].tool;
    right.setAttribute('aria-label', 'Instrument: ' + PAIRS[ri].tool);
    right.addEventListener('click', () => {
      if(p.checked || usedR.includes(ri)) return;
      if(pairSelL === null){ const f = $('#pairFb'); f.className = 'fb show info'; f.textContent = 'Pick a symptom first, then its instrument.'; return; }
      p.made[pairSelL] = ri; pairSelL = null; save(); renderPair();
      const f = $('#pairFb'); f.className = 'fb'; f.textContent = '';
    });
    grid.appendChild(left); grid.appendChild(mid); grid.appendChild(right);
  }
}
function bindPair(){
  $('#pairCheck').addEventListener('click', () => {
    const p = S.pair; if(p.checked) return;
    const f = $('#pairFb');
    const n = Object.keys(p.made).length;
    if(n < PAIRS.length){ f.className = 'fb show info'; f.textContent = n + ' of ' + PAIRS.length + ' pairs made — complete the board, then CHECK RESULTS.'; return; }
    let ok = true;
    Object.keys(p.made).forEach(li => { if(Number(p.made[li]) !== Number(li)) ok = false; }); // made maps symptom original idx -> tool original idx
    p.checked = true; p.ok = ok;
    if(ok){ p.made && Object.keys(p.made).length && passObjective('h-pair', true); toast('Objective validated — ' + OBJ['h-pair'].title); }
    else { p.attempts++; const st = S.obj['h-pair'] || (S.obj['h-pair'] = {status:'pending', attempts:0, fb:null, fbOk:false}); st.attempts++; st.status = 'failed'; }
    f.className = 'fb show ' + (ok ? 'ok' : 'bad');
    f.innerHTML = ok ? OBJ['h-pair'].fbOk : OBJ['h-pair'].fbBad;
    save(); renderPair(); updateTracker();
  });
  $('#pairReset').addEventListener('click', () => {
    const attempts = S.pair ? S.pair.attempts : 0;
    S.pair = shufflePair(); S.pair.attempts = attempts; pairSelL = null;
    const f = $('#pairFb'); f.className = 'fb show info'; f.textContent = 'Board cleared and reshuffled — make your pairs again.';
    save(); renderPair();
  });
}

/* ================= method ordering (hard) ================= */
function renderSteps(){
  const pool = $('#stepsPool'), seqBox = $('#stepsSeq');
  const st = S.steps; if(!st) return;
  pool.innerHTML = ''; seqBox.innerHTML = '';
  st.order.forEach(idx => {
    if(st.seq.includes(idx)) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'stepBtn';
    b.textContent = STEPS[idx].txt;
    b.setAttribute('aria-label', 'Step option: ' + STEPS[idx].txt);
    b.addEventListener('click', () => {
      if(st.checked) return;
      st.seq.push(idx); save(); renderSteps();
    });
    pool.appendChild(b);
  });
  if(!pool.children.length){
    const d = document.createElement('p'); d.className = 'note'; d.textContent = 'All seven placed — press CHECK RESULTS.';
    pool.appendChild(d);
  }
  st.seq.forEach((idx, i) => {
    const c = document.createElement('span'); c.className = 'seqChip';
    c.textContent = (i + 1) + '. ' + STEPS[idx].txt.split(' — ')[0];
    seqBox.appendChild(c);
  });
  if(!st.seq.length){ const d = document.createElement('span'); d.className = 'note'; d.textContent = 'Your sequence appears here as you click.'; seqBox.appendChild(d); }
}
function bindSteps(){
  $('#stepsCheck').addEventListener('click', () => {
    const st = S.steps; if(st.checked) return;
    const f = $('#stepsFb');
    if(st.seq.length < STEPS.length){ f.className = 'fb show info'; f.textContent = st.seq.length + ' of ' + STEPS.length + ' steps placed — complete the sequence first.'; return; }
    const ok = st.seq.every((v, i) => v === i);
    st.checked = true; st.ok = ok;
    if(ok){ passObjective('h-steps', true); toast('Objective validated — ' + OBJ['h-steps'].title); }
    else { st.attempts++; const o = S.obj['h-steps'] || (S.obj['h-steps'] = {status:'pending', attempts:0, fb:null, fbOk:false}); o.attempts++; o.status = 'failed'; }
    f.className = 'fb show ' + (ok ? 'ok' : 'bad');
    f.innerHTML = ok ? OBJ['h-steps'].fbOk : OBJ['h-steps'].fbBad;
    save(); renderSteps(); updateTracker();
  });
  $('#stepsReset').addEventListener('click', () => {
    const attempts = S.steps ? S.steps.attempts : 0;
    S.steps = shuffleSteps(); S.steps.attempts = attempts;
    const f = $('#stepsFb'); f.className = 'fb show info'; f.textContent = 'Board cleared and reshuffled — rebuild the sequence.';
    save(); renderSteps();
  });
}
