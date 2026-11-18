/*!
 * js/ui.js - shared DOM/format helpers, the six consoles
 * (SWITCH-01, NETCORE, WAPCTL, HOSTDESK, MAILGATE, ACCESS-CTRL), the tab
 * strip, in-world hardening controls, and the Field Manual / Debrief views.
 */
/* ============ Manual / debrief ============ */
function renderManual(){
 $('#manualBody').innerHTML =
 `<p>The ten families of Lesson 4.7 / objective 4.2, each with its mechanism, impact, detection and mitigation. <span class="term" title="All examples are documented public incidents, summarized conservatively.">Real-world references</span> are documented public incidents, summarized conservatively.</p>`
 + ATTACKS.map(a=>`
  <details class="acc"><summary>${esc(a.name)} <span class="acc-tag">${esc(a.layer)}</span></summary>
  <div class="acc-body">
   <dl class="kv">
    <dt>What</dt><dd>${esc(a.def)}</dd>
    <dt>How</dt><dd>${a.how}</dd>
    <dt>Why attackers use it</dt><dd>${esc(a.why)}</dd>
    <dt>Chain position</dt><dd>${a.chain}</dd>
    <dt>Primary impact</dt><dd>${esc(a.cia)}</dd>
    <dt>Detect via</dt><dd>${esc(a.detect)}</dd>
    <dt>Mitigate with</dt><dd>${esc(a.mitigate)}</dd>
    <dt>Real-world</dt><dd>${esc(a.real)}</dd>
    <dt>In this lab</dt><dd>${esc(a.lab)}</dd>
   </dl>
  </div></details>`).join('')
 + `<details class="acc"><summary>Glossary — ${GLOSSARY.length} terms</summary><div class="acc-body"><dl class="kv">${GLOSSARY.map(g=>`<dt>${esc(g[0])}</dt><dd>${esc(g[1])}</dd>`).join('')}</dl></div></details>
  <p class="evtags">Adjacent concept for exam completeness: objective 4.2 also lists <strong>malware</strong> — it has its own lesson; this lab’s scope is the attack list given in Lesson 4.7.</p>`;
}
function renderDebrief(){
 $('#debriefBody').innerHTML = `
 <p><strong>Detection opportunities</strong> — what to collect, and starter logic (illustrative, not production syntax):</p>
 <table class="ev"><thead><tr><th>Attack</th><th>Data source</th><th>Example detection logic</th></tr></thead><tbody>
 <tr><td>MAC flooding</td><td>Switch port-security traps, CAM counters</td><td>alert when new_MACs_per_port_60s &gt; 20</td></tr>
 <tr><td>ARP poisoning</td><td>DAI violation logs, ARP monitor</td><td>alert when ARP_reply maps gateway_IP to non-gateway_MAC</td></tr>
 <tr><td>Rogue DHCP</td><td>DHCP snooping blocked offers</td><td>alert when offer_server ≠ authorized_servers</td></tr>
 <tr><td>DNS poisoning</td><td>DNSSEC validation, record-change monitor</td><td>alert when critical_A_record changes AND TTL &lt; 300</td></tr>
 <tr><td>Evil twin / rogue AP</td><td>WIPS, spectrum survey, client joins</td><td>alert when known_SSID advertises unknown_BSSID</td></tr>
 <tr><td>DoS / DDoS</td><td>NetFlow / edge meters</td><td>alert when pps &gt; 10×baseline AND syn_backlog &gt; 80%</td></tr>
 <tr><td>Phishing</td><td>Mail headers (SPF/DKIM/DMARC), link inspection</td><td>flag when spf=fail OR link_text ≠ href</td></tr>
 <tr><td>Tailgating &amp; physical</td><td>Badge log vs camera reconciliation</td><td>alert when door_opens &gt; badge_swipes</td></tr>
 </tbody></table>
 <p><strong>Mitigation recommendations</strong> (objective 4.3 vocabulary, mapped to this incident): port security + disable unused ports (Gi1/0/7 was live); DHCP snooping with trusted uplink only; Dynamic ARP Inspection on the snooping bindings; disable auto-trunking/DTP + native VLAN moved to an unused ID (992); DNSSEC on harborview zones; WPA3-Enterprise/802.1X + WIPS on staff SSID; rate limiting + upstream scrubbing + CDN/anycast + SYN cookies for the portal; mantrap + escort policy + shred-all + privacy film + awareness training for the human vector.</p>
 <p><strong>Blue-team takeaways:</strong> the chain broke at the door, not at the firewall — reconcile badge logs with cameras; “spare” ports are an inventory problem; a strong SSID is not an authenticated SSID; and every poisoned record had a tell (TTL, spf=fail, MAC duplication) that a baseline would have caught.</p>
 <p><strong>Red-team mindset (defensive use):</strong> the attacker needed exactly one unwatched moment and one unconfigured default. Walk your own campus: which door closes in 8 seconds? Which trunk still auto-negotiates? Which bin is unlocked?</p>
 <p><strong>Cross-references</strong> (open in a new tab): <a href="https://www.comptia.org/certifications/network" target="_blank" rel="noopener">CompTIA Network+ N10-009</a> · <a href="https://attack.mitre.org/techniques/T1557/" target="_blank" rel="noopener">MITRE ATT&amp;CK T1557 — Adversary-in-the-Middle</a> · <a href="https://attack.mitre.org/techniques/T1498/" target="_blank" rel="noopener">T1498 — Network DoS</a> · <a href="https://attack.mitre.org/techniques/T1566/" target="_blank" rel="noopener">T1566 — Phishing</a></p>`;
}
/* ============ Consoles ============ */
const CONSOLES = [
 {id:'switch',  name:'SWITCH-01',   loc:'IDF-2 / dock office', render:()=>renderSwitch()},
 {id:'netcore', name:'NETCORE',     loc:'core room',           render:()=>renderNetcore()},
 {id:'wireless',name:'WAPCTL',      loc:'campus RF',           render:()=>renderWireless()},
 {id:'hostdesk',name:'HOSTDESK',    loc:'WH-PC-31 (your desk)',render:()=>renderHostdesk()},
 {id:'mail',    name:'MAILGATE',    loc:'mail gateway',        render:()=>renderMail()},
 {id:'access',  name:'ACCESS-CTRL', loc:'security office',     render:()=>renderAccess()}
];
function consoleById(id){ return CONSOLES.find(c=>c.id===id); }

function renderTabstrip(){
 $('#tabstrip').innerHTML = CONSOLES.map(c =>
  `<button class="tab" role="tab" id="tab-${c.id}" aria-controls="con-${c.id}" aria-selected="${S.tab===c.id}" data-tab="${c.id}">${c.name} <span class="loc">· ${c.loc}</span></button>`).join('');
}
function renderConsoles(){
 renderTabstrip();
 $('#consoles').innerHTML = CONSOLES.map(c =>
  `<section class="console" id="con-${c.id}" role="tabpanel" aria-labelledby="tab-${c.id}" ${S.tab===c.id?'':'hidden'}></section>`).join('');
 CONSOLES.forEach(c => { try{ c.render(); }catch(err){ console.error('console render failed: '+c.id, err); } });
}
function renderConsole(id){ const c=consoleById(id); if(c){ try{ c.render(); }catch(err){ console.error('console render failed: '+id, err); } } }
function activateTab(id){
 S.tab=id; save();
 CONSOLES.forEach(c=>{
  const t=$('#tab-'+c.id), p=$('#con-'+c.id);
  if(t){ t.setAttribute('aria-selected', String(c.id===id)); }
  if(p){ if(c.id===id) p.removeAttribute('hidden'); else p.setAttribute('hidden',''); }
 });
}
function goConsole(id){ activateTab(id); const el=$('#tab-'+id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }

function envLocked(consId){
 const list=OBJ_DEFS.filter(o=>o.envPanel===consId && o.modes.includes(S.mode));
 return list.length>0 && list.every(o=>S.ans[o.id]&&S.ans[o.id].solved);
}
function ledRow(path, label, small, checked, lock){
 return `<div class="ledrow"><div class="lt">${esc(label)}${small?`<small>${esc(small)}</small>`:''}</div>
  <button class="led" role="switch" aria-checked="${checked?'true':'false'}" data-path="${path}" ${lock?'disabled':''} aria-label="${esc(label)}"></button></div>`;
}
function chip(cls,txt){ return `<span class="chip ${cls}">${esc(txt)}</span>`; }

/* ---- SWITCH-01 ---- */
function renderSwitch(){
 const e=S.env.switch;
 const lk=envLocked('switch');
 let camHtml='';
 if(!S.camSnap){
  camHtml = `<div class="subpanel"><h3>CAM / MAC address table — live</h3>
   <p class="con-note">Press the button to snapshot the table as it is right now.</p>
   <table class="ev"><thead><tr><th>Port</th><th>MAC</th><th>Learned as</th></tr></thead><tbody>
   ${EVID.camNormal.map(r=>`<tr><td>${r.p}</td><td class="mac">${r.m}</td><td>${r.d}</td></tr>`).join('')}
   </tbody></table>
   <button class="btn amber" id="camBtn" type="button">Snapshot CAM table now</button></div>`;
 } else {
  const fakeRows = EVID.camFloodFakes.map((m,i)=>`<tr class="bad"><td>Gi1/0/7</td><td class="mac">${m}</td><td>unknown device ${String(i+1).padStart(2,'0')}</td></tr>`).join('');
  const flap = (S.mode==='hard') ? `<tr class="stale"><td>Gi1/0/3</td><td class="mac">00:1b:63:9f:22:7a</td><td>PR-2 re-learned ×14 in 30 min (NIC aging — see port errors)</td></tr>` : '';
  camHtml = `<div class="subpanel"><h3>CAM / MAC address table — snapshot 19:07</h3>
   <p>${chip('warn','CAM utilization 97%')} ${chip('warn','3,217 MACs learned in 40 s')} ${chip('amberc','storm source: Gi1/0/7')}</p>
   <table class="ev"><thead><tr><th>Port</th><th>MAC</th><th>Learned as</th></tr></thead><tbody>
   ${EVID.camNormal.filter(r=>r.p!=='Gi1/0/7').map(r=>`<tr><td>${r.p}</td><td class="mac">${r.m}</td><td>${r.d}</td></tr>`).join('')}
   ${fakeRows}${flap}
   <tr><td colspan="3">…and 3,201 more MACs on Gi1/0/7 (truncated)</td></tr>
   </tbody></table></div>`;
 }
 const trunkNative = e.nativeVlan;
 const hardHtml = `
  <div class="subpanel"><h3>Hardening — in-world controls (feeds mission ${S.mode==='hard'?'H4':'M9'})</h3>
   ${ledRow('switch.portSec','Enable port security (limit MACs per port)','Stops MAC flooding — violation action: restrict/shutdown',e.portSec,lk)}
   ${ledRow('switch.snooping','Enable DHCP snooping','Builds the IP→MAC binding table',e.snooping,lk)}
   ${ledRow('switch.trustUplink','Trust uplink Gi1/0/1 only for DHCP snooping','Untrusted ports are blocked from DHCP offers',e.trustUplink,lk)}
   ${ledRow('switch.dai','Enable Dynamic ARP Inspection','Drops ARP replies that contradict the snooping bindings',e.dai,lk)}
   ${ledRow('switch.noDtp','Disable auto-trunking (DTP) on access ports','Stops an attacker negotiating a trunk',e.noDtp,lk)}
   <div class="ledrow"><div class="lt">Native VLAN on trunks<small>VLAN 1 is default and should be unused</small></div>
    <select data-envsel="switch.nativeVlan" aria-label="Native VLAN" ${lk?'disabled':''}>
     <option value="1" ${trunkNative==='1'?'selected':''}>1 (default)</option>
     <option value="992" ${trunkNative==='992'?'selected':''}>992 (unused)</option>
    </select></div>
   ${ledRow('switch.shutUnused','Administratively shut unused ports','Gi1/0/7 was a live spare — dark ports cannot be stormed',e.shutUnused,lk)}
  </div>`;
 $('#con-switch').innerHTML = `
  <div class="con-head"><h2>SWITCH-01</h2><span class="sub">HCCF-ACC-SW1 · access layer · IDF-2</span>
   ${S.camSnap?chip('warn','CAM storm') : chip('info','nominal')}</div>
  <p class="con-note">The access switch learns source MACs per port (CAM table), forwards frames, and carries your VLAN segmentation — every layer-2 attack in this lesson lands here first.</p>
  ${camHtml}
  <div class="subpanel"><h3>Ports &amp; trunks</h3>
   <table class="ev"><thead><tr><th>Port</th><th>Role</th><th>VLAN</th><th>Status</th></tr></thead><tbody>
   ${EVID.ports.map(r=>`<tr class="${r.bad?'bad':(r.ok?'':'')}"><td>${r.p}</td><td>${r.role}</td><td>${r.vlan}</td><td>${r.st}</td></tr>`).join('')}
   </tbody></table>
   <p class="evtags">Trunk Gi1/0/24: DTP auto-negotiation ${e.noDtp?'OFF (hardened)':'ON (default)'} · native VLAN ${esc(trunkNative)} · trunk Gi1/0/1 (uplink) is the authorized DHCP path.</p>
  </div>
  ${hardHtml}`;
}

/* ---- NETCORE ---- */
function renderNetcore(){
 const d=EVID.dos;
 const bw=98, pps=99, syn=94;
 $('#con-netcore').innerHTML = `
  <div class="con-head"><h2>NETCORE</h2><span class="sub">DNS · DHCP · edge metering</span> ${chip('warn','active flood')}</div>
  <p class="con-note">The core serves names, leases, and the edge meter. Three views: traffic (DoS), resolver cache (DNS poisoning), lease audit (rogue DHCP).</p>
  <div class="subpanel"><h3>Traffic meter — booking portal edge ${esc(d.edge)} (synthetic address)</h3>
   <div class="meter"><div class="mlabel"><span>Bandwidth</span><b>${esc(d.cur)} vs baseline ${esc(d.base)}</b></div><div class="bar"><i style="width:${bw}%"></i></div></div>
   <div class="meter"><div class="mlabel"><span>SYN backlog</span><b>${esc(d.syn)}</b></div><div class="bar"><i style="width:${syn}%"></i></div></div>
   <p class="evtags">${esc(d.src)} · window ${esc(d.window)}</p>
   <table class="ev"><thead><tr><th>Source pattern</th><th>Observation</th></tr></thead><tbody>
   ${d.talkers.map(t=>`<tr class="bad"><td>${t.s}</td><td>${t.note}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>DNS resolver cache</h3>
   <p>${chip('warn','unsigned zone — DNSSEC not deployed')}</p>
   <table class="ev"><thead><tr><th>Hostname</th><th>Type</th><th>Value</th><th>TTL</th><th>Note</th></tr></thead><tbody>
   ${EVID.dns.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.h}</td><td>${r.t}</td><td class="mac">${r.v}</td><td>${r.ttl}</td><td>${r.flag}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>DHCP lease audit — VoIP VLAN 20</h3>
   <p class="con-note">${esc(EVID.leaseNote)}</p>
   <table class="ev"><thead><tr><th>Client</th><th>Server that leased it</th><th>Gateway option</th><th>DNS option</th></tr></thead><tbody>
   ${EVID.leases.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.c}</td><td>${r.srv}</td><td>${r.gw}</td><td>${r.dns}</td></tr>`).join('')}
   </tbody></table>
  </div>`;
}

/* ---- WAPCTL ---- */
function renderWireless(){
 const w=S.env.wifi;
 const lk=envLocked('wireless');
 $('#con-wireless').innerHTML = `
  <div class="con-head"><h2>WAPCTL</h2><span class="sub">wireless controller · RF survey</span> ${chip('warn','2 foreign radios')}</div>
  <p class="con-note">Compare SSID, BSSID, channel, signal and auth. A clone shares the SSID but not the BSSID — and usually shouts louder.</p>
  <div class="subpanel"><h3>Access points in range</h3>
   <table class="ev"><thead><tr><th>SSID</th><th>BSSID</th><th>Channel</th><th>Signal</th><th>Auth</th><th>Assessment</th></tr></thead><tbody>
   ${EVID.aps.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.ssid}</td><td class="mac">${r.b}</td><td>${r.ch}</td><td>${r.sig}</td><td>${r.auth}</td><td>${r.flag}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>Client associations — flagged</h3>
   <table class="ev"><thead><tr><th>Client</th><th>IP</th><th>Joined</th></tr></thead><tbody>
   ${EVID.wcli.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.c}</td><td>${r.ip}</td><td>${r.j}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>Wireless hardening — in-world controls</h3>
   ${ledRow('wifi.wpa3','Move staff SSID to WPA3-Enterprise (802.1X)','Clients then demand the network’s server certificate',w.wpa3,lk)}
   ${ledRow('wifi.noLegacy','Disable legacy PSK / open association on staff SSID','Removes the clone’s easiest entry',w.noLegacy,lk)}
   ${ledRow('wifi.wips','Enable WIPS rogue/clone containment','Detects and de-authenticates clients from clones',w.wips,lk)}
  </div>`;
}

/* ---- HOSTDESK ---- */
function renderHostdesk(){
 $('#con-hostdesk').innerHTML = `
  <div class="con-head"><h2>HOSTDESK</h2><span class="sub">WH-PC-31 · warehouse VLAN 30</span> ${chip('warn','gateway conflict')}</div>
  <p class="con-note">Your own workstation’s view: the ARP cache and a short packet capture. This is where an on-path position becomes visible.</p>
  <div class="subpanel"><h3>ARP table (ip neigh)</h3>
   <p class="con-note">${esc(EVID.arpNote)}</p>
   <table class="ev"><thead><tr><th>Internet address</th><th>Physical (MAC)</th><th>Type</th></tr></thead><tbody>
   ${EVID.arp.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.ip}</td><td class="mac">${r.mac}</td><td>${r.typ}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>Packet capture — summary</h3>
   <table class="ev"><thead><tr><th>Time</th><th>Observation</th></tr></thead><tbody>
   ${EVID.pcap.map(r=>`<tr class="${r.bad?'bad':(r.ok?'':'')}"><td>${r.t}</td><td>${r.line}</td></tr>`).join('')}
   </tbody></table>
  </div>`;
}

/* ---- MAILGATE ---- */
function renderMail(){
 const cur = EVID.emails.find(e=>e.id===S.mailSel) || EVID.emails[0];
 const list = EVID.emails.filter(e=>S.mode==='hard' || !e.hard);
 $('#con-mail').innerHTML = `
  <div class="con-head"><h2>MAILGATE</h2><span class="sub">mail gateway · quarantine queue</span> ${chip('info','headers included')}</div>
  <p class="con-note">Five (Day Watch: four) messages from this week. Open one; the full header block is shown for header-analysis practice.</p>
  <div class="mailgrid">
   <div class="mail-list" role="group" aria-label="Message list">
   ${list.map(e=>`<button class="mail-item" type="button" data-mail="${e.id}" aria-pressed="${e.id===cur.id}">
     <div class="mf">${esc(e.from.split('<')[0].trim().replace(/"/g,''))}</div>
     <div class="ms2">${esc(e.subj)}</div><div class="md">${esc(e.dt)}${e.phish?' · ⚠ flagged by user report':''}</div></button>`).join('')}
   </div>
   <div class="mail-view">
    <h3>${esc(cur.subj)}</h3>
    <p class="mline">From: ${esc(cur.from)}</p><p class="mline">Received: ${esc(cur.dt)}</p>
    <div class="headers" aria-label="Message headers">${esc(cur.headers)}</div>
    <div>${cur.body}</div>
    ${cur.linkhref?`<p class="linkhint">${esc(cur.linktext)}<br>${esc(cur.linkhref)}</p>`:''}
   </div>
  </div>`;
}

/* ---- ACCESS-CTRL ---- */
function renderAccess(){
 const p=S.env.phys;
 const lk=envLocked('access');
 $('#con-access').innerHTML = `
  <div class="con-head"><h2>ACCESS-CTRL</h2><span class="sub">security office · badges, visitors, facility notes</span> ${chip('amberc','1 anomaly logged')}</div>
  <p class="con-note">Social engineering leaves physical evidence: badge swipes that don’t match cameras, bins that should hold shreds, screens that face the wrong way.</p>
  <div class="subpanel"><h3>Badge access log — this week</h3>
   <table class="ev"><thead><tr><th>When</th><th>Event</th></tr></thead><tbody>
   ${EVID.badge.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.t}</td><td>${r.line}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>Visitor registry</h3>
   <table class="ev"><tbody>${EVID.visitors.map(r=>`<tr><td>${r.line}</td></tr>`).join('')}</tbody></table>
  </div>
  <div class="subpanel"><h3>Facility notes &amp; audits</h3>
   <table class="ev"><thead><tr><th>Note</th><th>Detail</th></tr></thead><tbody>
   ${EVID.notes.map(r=>`<tr class="${r.bad?'bad':''}"><td>${r.t}</td><td>${r.line}</td></tr>`).join('')}
   </tbody></table>
  </div>
  <div class="subpanel"><h3>Physical controls — in-world (feeds mission ${S.mode==='hard'?'H7':'M8'})</h3>
   ${ledRow('phys.mantrap','Install mantrap/turnstile at IDF-2 and lobby','One badged person at a time',p.mantrap,lk)}
   ${ledRow('phys.escort','Enforce escort policy + visitor badges','Visitors are escorted and reconciled',p.escort,lk)}
   ${ledRow('phys.shred','Shred-all policy + locked document bins','Closes the dumpster-diving finding',p.shred,lk)}
   ${ledRow('phys.film','Privacy film / reposition dispatch monitors','Closes the shoulder-surfing finding',p.film,lk)}
   ${ledRow('phys.aware','Run security-awareness training','Challenge tailgaters politely; report anomalies',p.aware,lk)}
  </div>`;
}
