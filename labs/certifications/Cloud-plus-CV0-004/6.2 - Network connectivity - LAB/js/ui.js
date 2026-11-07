'use strict';
/* =====================================================================
   UI — topology map rendering + inspector cards + inspector actions
   ===================================================================== */
/* ---------------- topology map ---------------- */
function buildMap(){
  const svg = $('#mapSvg');
  let h = '';
  // VPC boundary
  h += '<rect class="vpcBox" x="360" y="42" width="520" height="420" rx="12"></rect>';
  h += '<text class="vpcBoxLbl" x="372" y="478">vpc-prod-a · 10.20.0.0/16 · AZ a/b (simplified)</text>';
  const cx = n => NODES[n].x, cy = n => NODES[n].y;
  EDGES.forEach((e,i) => {
    const x1=cx(e.a), y1=cy(e.a), x2=cx(e.b), y2=cy(e.b);
    h += `<line class="edge ${e.solid?'solid':''}" id="edge-${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
    if(e.lbl){
      h += `<text class="edgeLbl" x="${(x1+x2)/2}" y="${(y1+y2)/2 - 4}" text-anchor="middle">${esc(e.lbl)}</text>`;
    }
  });
  Object.keys(NODES).forEach(id => {
    const n = NODES[id];
    h += `<g class="node" id="node-${id}" data-node="${id}" role="button" tabindex="0"
          aria-label="Inspect ${esc(n.label)} — ${esc(n.sub)}" transform="translate(${n.x},${n.y})">
      <rect class="nRect" x="-62" y="-24" width="124" height="48" rx="9"></rect>
      <text class="nLabel" text-anchor="middle" y="-3">${esc(n.label)}</text>
      <text class="nSub" text-anchor="middle" y="13">${esc(n.sub)}</text></g>`;
  });
  svg.innerHTML = h;
  svg.addEventListener('click', ev => {
    const g = ev.target.closest('.node');
    if(g) selectNode(g.dataset.node);
  });
  svg.addEventListener('keydown', ev => {
    const g = ev.target.closest('.node');
    if(g && (ev.key === 'Enter' || ev.key === ' ')){ ev.preventDefault(); selectNode(g.dataset.node); }
  });
  updateMapStatus();
}
function updateMapStatus(){
  const st = {
    db1: F.sgDb() ? 'ok' : 'fail', natgw: F.nat() ? 'ok' : 'fail', app1: (F.nacl() && F.nat()) ? 'ok' : 'warn',
    alb: F.lb() ? 'ok' : 'fail', dns: (F.dnsApi() && F.dnsPay() && F.dhcp()) ? 'ok' : 'warn',
    vgw: F.mtu() ? 'ok' : 'fail', analytics: F.tgw() ? 'ok' : 'fail',
    bridge: F.vlan() ? 'ok' : 'fail', legacy: F.vlan() ? 'ok' : 'fail',
    pay1: (F.dnsPay() && F.sgPay()) ? 'ok' : 'warn',
    pod1: F.dhcp() ? 'ok' : 'fail'
  };
  Object.keys(NODES).forEach(id => {
    const g = $('#node-' + id); if(!g) return;
    g.classList.remove('st-ok','st-warn','st-fail');
    const s = st[id] || 'ok';
    g.classList.add('st-' + s);
  });
  const ring = $('#ringFg'), num = $('#ringNum');
  if(ring && num){ /* updated by tracker */ }
}

/* ---------------- inspector ---------------- */
function recordCurl(url, status){ S.activity.curls[url + '|' + status] = Date.now(); }
function curlStatusFor(url){ // latest recorded status for a URL, or null
  let best = null, bestT = -1;
  Object.keys(S.activity.curls).forEach(k => {
    const [u, st] = k.split('|');
    if(u === url && S.activity.curls[k] > bestT){ bestT = S.activity.curls[k]; best = st; }
  });
  return best;
}

const SG_SRC_OPTIONS = ['sg-lb','sg-app','sg-web','sg-pod','10.20.2.0/24','10.20.8.0/24','10.20.0.0/16','0.0.0.0/0'];
function cardSG(sgId){
  const sg = S.config.sgs[sgId];
  let rows = sg.rules.map((r,i) => `<tr class="${r.s === '0.0.0.0/0' ? 'badRow' : ''}">
    <td>${r.d}</td><td>${r.p}</td><td>${r.a === 8 && r.p === 'icmp' ? 'echo' : r.a + (r.b !== r.a ? '-' + r.b : '')}</td>
    <td>${esc(r.s)}</td><td>${esc(r.note || '')}</td></tr>`).join('');
  return `<div class="rackCard sgCard" id="card-${sgId}">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>${esc(sg.title)}</h4><span class="rcState">stateful · replies auto-allowed</span></div>
    <div class="rcBody">
      <table class="ruleTbl"><thead><tr><th>Dir</th><th>Proto</th><th>Port</th><th>Source</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="miniForm sgAddForm" data-sg="${sgId}">
        <label>Add inbound rule
          <span style="display:flex;gap:6px">
            <select data-f="proto" aria-label="Protocol"><option value="tcp">TCP</option><option value="icmp">ICMP</option></select>
            <input data-f="port" type="number" min="1" max="65535" placeholder="port" style="width:86px" aria-label="Port">
            <select data-f="src" aria-label="Source">${SG_SRC_OPTIONS.map(o => `<option value="${o}">${o}</option>`).join('')}</select>
            <button class="applyBtn" data-act="sgAdd" data-sg="${sgId}">Add rule</button>
          </span>
        </label>
      </div>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Rules marked red expose the host to the whole internet — flagged for the hardening review (OBJ-H8 / debrief).</p>
    </div></div>`;
}
function cardNACL(naclId){
  const n = S.config.nacls[naclId];
  const rows = n.inR.map(r => `<tr class="${(r.a === 32768) ? 'badRow' : ''}">
    <td>${r.n}</td><td>${r.p}</td><td>${r.p === 'icmp' ? 'echo' : r.a + '-' + r.b}</td><td>${esc(r.s)}</td><td>${esc(r.note || '')}</td></tr>`).join('');
  return `<div class="rackCard naclCard" id="card-${naclId}">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>${esc(n.title)}</h4><span class="rcState warn">stateless · first match wins</span></div>
    <div class="rcBody">
      <p style="font-size:11.5px;color:var(--mut);margin:2px 0 4px">Inbound rules — return traffic to ephemeral ports must be explicitly allowed.</p>
      <table class="ruleTbl"><thead><tr><th>#</th><th>Proto</th><th>Ports</th><th>Source</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="miniForm naclAddForm">
        <label>Start port <input data-f="a" type="number" value="1024" style="width:80px"></label>
        <label>End port <input data-f="b" type="number" value="65535" style="width:80px"></label>
        <label>Source <select data-f="src"><option>0.0.0.0/0</option><option>10.20.0.0/16</option></select></label>
        <button class="applyBtn" data-act="naclAdd">Add inbound rule</button>
      </div>
    </div></div>`;
}
function cardROUTE(rtId){
  const rt = S.config.routes[rtId];
  const rows = rt.rows.map(r => `<tr><td>${esc(r.d)}</td><td>${esc(r.t)}</td></tr>`).join('');
  return `<div class="rackCard routeCard" id="card-${rtId}">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>${esc(rt.title)}</h4></div>
    <div class="rcBody">
      <table class="ruleTbl"><thead><tr><th>Destination</th><th>Target</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="miniForm">
        <label>Destination CIDR <input data-f="dest" value="0.0.0.0/0" style="width:120px" aria-label="Destination CIDR"></label>
        <label>Target <select data-f="target"><option value="nat-gw-a">nat-gw-a</option><option value="igw">igw</option><option value="tgw-1">tgw-1</option><option value="pcx-prod-stage">pcx-prod-stage</option></select></label>
        <button class="applyBtn" data-act="routeAdd" data-rt="${rtId}">Add route</button>
      </div>
    </div></div>`;
}
function cardDNS(){
  const recs = S.config.dns.records;
  const rows = Object.keys(recs).map(k => `<tr class="${k === 'db.orbitcart.internal' ? 'goodRow' : ''}"><td>${esc(k)}</td><td>A</td><td>${esc(recs[k])}</td><td>60s</td></tr>`).join('');
  return `<div class="rackCard dnsCard" id="card-dns">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>dns-res — private zone orbitcart.internal</h4><span class="rcState warn">split-horizon: internal names only here</span></div>
    <div class="rcBody">
      <table class="ruleTbl"><thead><tr><th>Record</th><th>Type</th><th>Value</th><th>TTL</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="miniForm">
        <label>Record <select data-f="rec">${Object.keys(recs).map(k => `<option>${k}</option>`).join('')}</select></label>
        <label>New value <input data-f="val" placeholder="10.20.x.x" style="width:110px" aria-label="New record value"></label>
        <button class="applyBtn" data-act="dnsSet">Update record</button>
      </div>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Stale records pointing at retired IPs are a classic failover hangover — and a takeover risk if the old IP is reused.</p>
    </div></div>`;
}
function cardDHCP(){
  const d = S.config.dhcp;
  return `<div class="rackCard dhcpCard" id="card-dhcp">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>DHCP options — pod subnet 10.20.8.0/24</h4><span class="rcState ${F.dhcp() ? '' : 'bad'}">${F.dhcp() ? 'leases OK' : 'faulty options'}</span></div>
    <div class="rcBody">
      <dl class="kv"><dt>Default set (VPC)</dt><dd>dns ${esc(d.def.dns)} · ntp ${esc(d.def.ntp)}</dd>
      <dt>Pod set — dns</dt><dd>${esc(d.pods.dns)} ${d.pods.dns === '10.20.0.10' ? '' : '← public resolver, cannot see the private zone'}</dd>
      <dt>Pod pool</dt><dd>10.20.8.${d.pods.poolStart} – 10.20.8.${d.pods.poolEnd} (${d.pods.poolEnd - d.pods.poolStart + 1} addresses)</dd></dl>
      <div class="miniForm">
        <label>domain-name-servers <select data-f="dns"><option value="10.20.0.10">10.20.0.10 (internal)</option><option value="198.51.100.53">198.51.100.53 (GlobeDNS public)</option></select></label>
        <label>Pool end <input data-f="end" type="number" value="${d.pods.poolEnd}" min="60" max="250" style="width:80px"></label>
        <button class="applyBtn" data-act="dhcpSet">Apply options</button>
      </div>
    </div></div>`;
}
function cardLB(){
  const lb = S.config.lb, healthy = lbHealthyCount();
  return `<div class="rackCard lbCard" id="card-lb">
    <div class="rcHead"><span class="dot ${healthy ? '' : 'rcState bad'}" aria-hidden="true"></span><h4>alb-store — target group tg-store</h4><span class="rcState ${healthy ? '' : 'bad'}">${healthy}/2 healthy</span></div>
    <div class="rcBody">
      <dl class="kv"><dt>Listeners</dt><dd>:80 → tg-store · :443 (TLS) → tg-store</dd>
      <dt>Targets</dt><dd><span class="${healthy ? 'ok' : 'bad'}">web-01:8080 ${healthy ? 'healthy' : 'unhealthy'}</span> · <span class="${healthy ? 'ok' : 'bad'}">web-02:8080 ${healthy ? 'healthy' : 'unhealthy'}</span></dd></dl>
      <div class="miniForm hcForm">
        <label>Check port <input data-f="port" type="number" value="${lb.hcPort}" style="width:86px"></label>
        <label>Check path <input data-f="path" value="${esc(lb.hcPath)}" style="width:120px"></label>
        <label>Expect <select data-f="code"><option>200</option><option>301</option><option>404</option></select></label>
        <button class="applyBtn" data-act="lbSet">Apply check</button>
      </div>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Targets serve HTTP on <b>8080</b> and answer <b>200</b> on <b>/healthz</b>. A probe that expects 301 will also flip them unhealthy.</p>
    </div></div>`;
}
function cardCERT(){
  const ok = F.cert();
  return `<div class="rackCard certCard" id="card-cert">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>TLS certificate — api[.]orbitcart.net</h4><span class="rcState ${ok ? '' : 'bad'}">${ok ? 'VALID' : 'EXPIRED'}</span></div>
    <div class="rcBody"><dl class="kv">
      <dt>Issuer</dt><dd>CumulusCM (fictional)</dd>
      <dt>SANs</dt><dd>api[.]orbitcart.net, store[.]orbitcart.net</dd>
      <dt>notBefore</dt><dd>Sep 2, 2025</dd>
      <dt>notAfter</dt><dd>${ok ? 'Nov 6, 2027' : 'Aug 30, 2026'} ${ok ? '' : '← in the past (today: Nov 6, 2026)'}</dd></dl>
      <div class="miniForm"><button class="applyBtn" data-act="certRenew">Renew certificate</button></div>
    </div></div>`;
}
function cardVPN(){
  return `<div class="rackCard vpnCard" id="card-vpn">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>vgw-corp — site-to-site VPN</h4><span class="rcState ${F.mtu() ? '' : 'warn'}">${F.mtu() ? 'healthy' : 'PMTUD black hole'}</span></div>
    <div class="rcBody">
      <dl class="kv"><dt>Tunnels</dt><dd>tunnel-a UP · tunnel-b UP</dd>
      <dt>BGP</dt><dd>10.50.0.0/16 advertised · session established</dd>
      <dt>Tunnel MTU</dt><dd>${S.config.vpn.mtu} bytes ${F.mtu() ? '' : '← too large for tunnel overhead (Cumulus recommends 1436)'}</dd></dl>
      <div class="miniForm mtuForm">
        <label>Tunnel MTU <input data-f="mtu" type="number" value="${S.config.vpn.mtu}" min="1200" max="1500" style="width:90px"></label>
        <button class="applyBtn" data-act="mtuSet">Apply MTU</button>
      </div>
    </div></div>`;
}
function cardTGW(){
  const t = S.config.tgw;
  const row = (key, label) => `<div class="tgRow"><span>${label}</span><span class="tgState ${t.attach[key] ? 'on' : 'off'}">${t.attach[key] ? 'attached' : 'not attached'}</span>
    <button class="toggleBtn" data-act="tgwAttach" data-k="${key}">${t.attach[key] ? 'Detach' : 'Attach'}</button></div>`;
  return `<div class="rackCard tgwCard" id="card-tgw">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>tgw-1 — transit gateway</h4><span class="rcState ${F.tgw() ? '' : 'warn'}">${F.tgw() ? 'hub active' : 'idle'}</span></div>
    <div class="rcBody">
      ${row('prod','vpc-prod-a')}${row('stage','vpc-stage-b')}${row('analytics','vpc-analytics-c')}
      <div class="tgRow"><span>Route propagation into VPC route tables</span><span class="tgState ${t.propagate ? 'on' : 'off'}">${t.propagate ? 'enabled' : 'disabled'}</span>
        <button class="toggleBtn" data-act="tgwProp">${t.propagate ? 'Disable' : 'Enable'}</button></div>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Peering connects two VPCs — it is never transitive. A transit gateway hub (attach + propagate) is the durable fix.</p>
    </div></div>`;
}
function cardBRIDGE(){
  return `<div class="rackCard vlanForm" id="card-bridge">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>bridge-01 — hybrid bridge host</h4><span class="rcState ${F.vlan() ? '' : 'bad'}">${F.vlan() ? 'guest connected' : 'guest isolated'}</span></div>
    <div class="rcBody">
      <dl class="kv"><dt>Uplink (trunk)</dt><dd>carries VLANs 40 (prod), 50 (staging)</dd>
      <dt>Guest legacy-crm</dt><dd>access port, VLAN tag ${S.config.bridge.vlan}</dd>
      <dt>Guest IP</dt><dd>10.20.9.12/24 · gw 10.20.9.1 (correct)</dd></dl>
      <div class="miniForm">
        <label>Access-port VLAN tag <input data-f="vlan" type="number" value="${S.config.bridge.vlan}" min="1" max="4094" style="width:90px"></label>
        <button class="applyBtn" data-act="vlanSet">Apply tag</button>
      </div>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Access port carries exactly one VLAN; trunk ports carry many tagged VLANs. A typo here isolates the guest below every L3 tool.</p>
    </div></div>`;
}
function cardFLOWLOGS(){
  const isM = S.mode === 'medium';
  const m7 = objState('OBJ-M7');
  const m7locked = isM && (m7.locked || m7.done);
  const rows = (isM ? FLOW_ROWS_M : FLOW_ROWS_H).map((r,i) => {
    let sel = '';
    if(isM){
      const cur = S.flowClass[i];
      sel = `<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
        ${[['normal','Normal'],['sg','SG reject'],['nacl','NACL reject'],['unrelated','Unrelated']].map(([v,l]) =>
          `<button class="chip ${cur === v ? 'on' : ''}" data-act="flowClass" data-i="${i}" data-v="${v}" aria-pressed="${cur === v}" ${m7locked ? 'disabled' : ''}>${l}</button>`).join('')}
      </div>`;
    }
    return `<div class="flowRow"><span>${esc(r.txt)}</span></div>${sel}`;
  }).join('');
  return `<div class="rackCard flowCard" id="card-flowlogs">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>VPC flow logs — vpc-prod-a (excerpt, 09:12–09:40)</h4><span class="rhTag">synthetic evidence</span></div>
    <div class="rcBody">${rows}
    ${m7locked ? '<p style="font-size:11.5px;color:var(--amber);margin-top:8px">Classifications are locked after a check — use “Try again” on OBJ-M7 to start a fresh attempt.</p>'
          : isM ? '<p style="font-size:11.5px;color:var(--dim);margin-top:8px">Classify each line for OBJ-M7: normal · SG reject · NACL reject · unrelated noise.</p>' : ''}
    ${!isM ? '<p style="font-size:11.5px;color:var(--dim);margin-top:8px">Find the drop <i>pattern</i>, not the loudest line. CLASSIFY in CASE-2202 (Objectives tab).</p>' : ''}
    </div></div>`;
}
function cardMETRICS(){
  return `<div class="rackCard" id="card-metrics">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>Metrics & alarms — last hour</h4><span class="rhTag">includes red herrings</span></div>
    <div class="rcBody">
      <dl class="kv">
        <dt>pay-01 CPU</dt><dd>ALARM HighCPUAlarm — 92% five-min avg (payments-svc v2.31, deployed 08:55)</dd>
        <dt>NAT gateway</dt><dd>egress 412 Mbps (usual sale-day peak: 380 Mbps)</dd>
        <dt>Cumulus API</dt><dd>429 throttled requests: 3,412/hr (automation playbook, backoff advised)</dd>
        <dt>alb-store 5xx</dt><dd>${F.lb() ? '0.0%' : '31% — all 502'} </dd>
        <dt>alb healthy hosts</dt><dd>${lbHealthyCount()}/2</dd>
      </dl>
      <p style="font-size:11.5px;color:var(--dim);margin-top:6px">Not every datapoint is your incident. CPU pain is not packet loss; a busy NAT is not a broken NAT.</p>
    </div></div>`;
}
function cardHELP(){
  return `<div class="rackCard" id="card-help"><div class="rcHead"><h4>How to read the map</h4></div>
  <div class="rcBody" style="font-size:13px;color:#c9d3df">
    <p>Green edge-boxes are healthy; <span style="color:var(--amber)">amber</span> warns; <span style="color:var(--red)">red</span> is where packets currently die — but the map only knows what you have proven. Dashed lines are policy-dependent paths (NAT egress, peering, attachments); solid lines are always-on.</p>
    <p>Click any node to open its configuration here. The console below runs real diagnostic commands from the selected vantage point — outputs change as you fix things.</p>
  </div></div>`;
}
function cardINFO(id){
  const inf = {
    users: ['Shoppers — external vantage','Public internet clients hitting store[.]orbitcart.net and api[.]orbitcart.net. Use them in the console to reproduce what customers see.'],
    igw: ['igw — internet gateway','The VPC’s door to the internet. Only subnets with a 0.0.0.0/0 → igw route (here: the public subnet) use it directly; private subnets must ride the NAT gateway.'],
    corp: ['Corp office — 10.50.0.0/16','Site network behind vgw-corp. corp-vm (10.50.0.5) is your vantage for VPN experiments.'],
    vgw: ['vgw-corp — VPN gateway','Two IPsec tunnels to the corp office, BGP session established. MTU is this tunnel’s Achilles heel.'],
    stage: ['vpc-stage-b — 10.30.0.0/16','Pre-production VPC, peered with prod and (via stage) with analytics.'],
    analytics: ['vpc-analytics-c — 10.40.0.0/16','Analytics VPC hosting analytics-01 (10.40.0.20, Postgres). Peered only with stage.'],
    natgw: ['nat-gw-a — NAT gateway','One-way door: private subnets open outbound sessions; nothing on the internet can initiate inbound. Subnets that need it must have 0.0.0.0/0 → nat-gw-a.'],
    dns: ['dns-res — internal resolver 10.20.0.10','Serves the private zone orbitcart.internal. Hosts only use it if their DHCP options say so.'],
    tgw: ['tgw-1 — transit gateway (idle)','A hub that makes routing transitive across many VPCs. Attachments + route propagation are both required.'],
    bridge: ['bridge-01 — hybrid bridge','Extends the VPC to a legacy hypervisor. Uplink trunk: VLANs 40/50.'],
    legacy: ['legacy-crm — VLAN guest','Old CRM VM at 10.20.9.12 behind bridge-01.']
  }[id];
  if(!inf) return '';
  return `<div class="rackCard" id="card-info-${id}"><div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>${esc(inf[0])}</h4></div>
    <div class="rcBody" style="font-size:13px;color:#c9d3df"><p>${inf[1]}</p></div></div>`;
}
function instanceCard(h){
  const host = HOSTS[h];
  const ip = h === 'pod1' ? podIp() : host.ip;
  const sgs = host.sg ? `<dt>Security group</dt><dd><button class="chip" data-act="jumpSg" data-sg="${host.sg}">${host.sg} — open rules</button></dd>` : '';
  return `<div class="rackCard" id="card-inst-${h}">
    <div class="rcHead"><span class="dot" aria-hidden="true"></span><h4>${esc(host.name)}</h4><span class="rcState">compute</span></div>
    <div class="rcBody"><dl class="kv">
      <dt>Address</dt><dd>${esc(ip)}</dd>
      <dt>Subnet</dt><dd>${esc(host.subnet)}${host.nacl ? ` · ${host.nacl}` : ''}</dd>
      ${sgs}
      ${h === 'pod1' ? `<dt>Resolver</dt><dd>${esc(S.config.dhcp.pods.dns)} ${F.dhcp() ? '' : '← public — cannot resolve orbitcart.internal'}</dd>` : ''}
    </dl></div></div>`;
}
const INSPECTORS = {
  web1: () => [instanceCard('web1'), cardSG('sg-web')],
  web2: () => [instanceCard('web2'), cardSG('sg-web')],
  db1:  () => [instanceCard('db1'), cardSG('sg-db')],
  pay1: () => [instanceCard('pay1'), cardSG('sg-pay')],
  app1: () => [instanceCard('app1'), cardSG('sg-app'), cardNACL('nacl-app'), cardROUTE('rt-private')],
  pod1: () => [instanceCard('pod1'), cardDHCP(), cardSG('sg-pod')],
  legacy: () => [instanceCard('legacy'), cardBRIDGE()],
  bridge: () => [cardBRIDGE()],
  corp: () => [cardINFO('corp'), cardVPN()],
  vgw: () => [cardVPN()],
  alb: () => [cardLB(), cardCERT()],
  dns: () => [cardDNS()],
  natgw: () => [cardINFO('natgw'), cardROUTE('rt-private')],
  igw: () => [cardINFO('igw')],
  users: () => [cardINFO('users')],
  tgw: () => [cardTGW()],
  stage: () => [cardINFO('stage'), cardROUTE('rt-stage')],
  analytics: () => [cardINFO('analytics'), cardROUTE('rt-analytics'), cardTGW()]
};
function selectNode(id){
  S.ui.selNode = id;
  const body = $('#inspBody'), title = $('#inspTitle');
  const n = NODES[id];
  title.textContent = 'Inspector — ' + n.label;
  const parts = (INSPECTORS[id] ? INSPECTORS[id]() : [cardINFO(id)]).filter(Boolean);
  if(id === 'web1' || id === 'web2') markInspected('sg-web');
  if(id === 'db1') markInspected('sg-db');
  if(id === 'app1'){ markInspected('sg-app'); markInspected('nacl-app'); markInspected('rt-private'); }
  if(id === 'pod1') markInspected('dhcp-pods');
  if(id === 'alb'){ markInspected('lb'); markInspected('cert'); }
  if(id === 'dns') markInspected('dns');
  if(id === 'vgw' || id === 'corp') markInspected('vpn');
  if(id === 'tgw') markInspected('tgw');
  if(id === 'bridge') markInspected('bridge');
  if(id === 'pay1') markInspected('sg-pay');
  body.innerHTML = parts.join('');
  body.classList.remove('flashTarget'); void body.offsetWidth; body.classList.add('flashTarget');
  save();
}

/* ---------------- inspector actions ---------------- */
function applyFix(msg, ok){
  toast(msg); announce(msg);
  updateMapStatus();
  const sel = S.ui.selNode;
  if(sel) selectNode(sel); // re-render cards with new state
  save();
  if(ok) flashBench();
}
function flashBench(){ /* visual acknowledgment hook */ }

document.addEventListener('click', ev => {
  const btn = ev.target.closest('[data-act]'); if(!btn) return;
  const act = btn.dataset.act;
  if(act === 'sgAdd'){
    const wrap = btn.closest('.sgAddForm');
    const proto = $('[data-f="proto"]', wrap).value;
    const port = parseInt($('[data-f="port"]', wrap).value, 10);
    const src = $('[data-f="src"]', wrap).value;
    if(!port || port < 1 || port > 65535){ toast('Enter a valid port (1–65535).'); return; }
    S.config.sgs[btn.dataset.sg].rules.push({ d:'in', p:proto, a:port, b:port, s:src, note:'added by NOC' });
    applyFix(`sg rule added: inbound ${proto}/${port} from ${src}`, true);
  } else if(act === 'naclAdd'){
    const wrap = btn.closest('.naclAddForm');
    const a = parseInt($('[data-f="a"]', wrap).value, 10), b = parseInt($('[data-f="b"]', wrap).value, 10);
    const src = $('[data-f="src"]', wrap).value;
    if(!a || !b || a > b){ toast('Port range must run low → high.'); return; }
    const nr = S.config.nacls['nacl-app'].inR;
    let num = Math.max.apply(null, nr.map(r => r.n)) + 10;
    nr.push({ n:num, p:'tcp', a, b, s:src, note:'ephemeral return fix' });
    applyFix(`nacl-app: inbound TCP ${a}-${b} from ${src} added as rule ${num}`, true);
  } else if(act === 'routeAdd'){
    const wrap = btn.closest('.miniForm');
    const dest = $('[data-f="dest"]', wrap).value.trim();
    const target = $('[data-f="target"]', wrap).value;
    if(!/^\d+\.\d+\.\d+\.\d+\/\d+$/.test(dest)){ toast('Destination must be a CIDR like 0.0.0.0/0.'); return; }
    const rt = S.config.routes[btn.dataset.rt];
    rt.rows = rt.rows.filter(r => r.d !== dest);
    rt.rows.push({ d:dest, t:target });
    applyFix(`route added: ${dest} → ${target} in ${btn.dataset.rt}`, true);
  } else if(act === 'dnsSet'){
    const wrap = btn.closest('.miniForm');
    const rec = $('[data-f="rec"]', wrap).value;
    const val = $('[data-f="val"]', wrap).value.trim();
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(val)){ toast('Value must be an IPv4 address.'); return; }
    S.config.dns.records[rec] = val;
    applyFix(`DNS: ${rec} → ${val} (TTL 60s)`, true);
  } else if(act === 'dhcpSet'){
    const wrap = btn.closest('.miniForm');
    S.config.dhcp.pods.dns = $('[data-f="dns"]', wrap).value;
    const end = parseInt($('[data-f="end"]', wrap).value, 10);
    if(end > 60 && end <= 250) S.config.dhcp.pods.poolEnd = end;
    applyFix(`DHCP pod options: dns=${S.config.dhcp.pods.dns}, pool end .${S.config.dhcp.pods.poolEnd}`, F.dhcp());
  } else if(act === 'lbSet'){
    const wrap = btn.closest('.hcForm');
    S.config.lb.hcPort = parseInt($('[data-f="port"]', wrap).value, 10) || S.config.lb.hcPort;
    S.config.lb.hcPath = $('[data-f="path"]', wrap).value.trim() || S.config.lb.hcPath;
    applyFix(`health check → ${S.config.lb.hcPort}${S.config.lb.hcPath} (expect 200) — targets: ${lbHealthyCount()}/2 healthy`, F.lb());
  } else if(act === 'certRenew'){
    S.config.cert.renewed = true;
    applyFix('certificate renewed — notAfter Nov 6, 2027', true);
  } else if(act === 'mtuSet'){
    const wrap = btn.closest('.mtuForm');
    const v = parseInt($('[data-f="mtu"]', wrap).value, 10);
    S.config.vpn.mtu = v;
    applyFix(`tunnel MTU set to ${v}`, F.mtu());
  } else if(act === 'tgwAttach'){
    const k = btn.dataset.k;
    S.config.tgw.attach[k] = !S.config.tgw.attach[k];
    applyFix(`tgw-1: vpc-${k} ${S.config.tgw.attach[k] ? 'attached' : 'detached'}`, F.tgw());
  } else if(act === 'tgwProp'){
    S.config.tgw.propagate = !S.config.tgw.propagate;
    applyFix(`tgw-1 route propagation ${S.config.tgw.propagate ? 'enabled' : 'disabled'}`, F.tgw());
  } else if(act === 'vlanSet'){
    const wrap = btn.closest('.miniForm');
    const v = parseInt($('[data-f="vlan"]', wrap).value, 10);
    S.config.bridge.vlan = v;
    applyFix(`bridge-01 access tag → VLAN ${v}`, F.vlan());
  } else if(act === 'jumpSg'){
    const card = $('#card-' + btn.dataset.sg);
    if(card){ card.classList.remove('flashTarget'); void card.offsetWidth; card.classList.add('flashTarget'); card.scrollIntoView({ block:'nearest', behavior:'smooth' }); }
  } else if(act === 'flowClass'){
    const m7 = objState('OBJ-M7');
    if(m7.locked || m7.done){ toast('Locked after the check — use “Try again” on OBJ-M7 to re-classify.'); return; }
    S.flowClass[btn.dataset.i] = btn.dataset.v;
    save();
    $$('#card-flowlogs [data-act="flowClass"]').forEach(b => {
      b.classList.toggle('on', S.flowClass[b.dataset.i] === b.dataset.v);
      b.setAttribute('aria-pressed', S.flowClass[b.dataset.i] === b.dataset.v);
    });
  }
});
