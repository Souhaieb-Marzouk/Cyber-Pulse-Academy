'use strict';
/* =====================================================================
   DATA — every piece of lab content: faults, nodes, config, hosts,
   knowledge core, glossary, widget data, quiz bank, objectives, debrief
   ===================================================================== */
/* =====================================================================
   DATA — OrbitCart NOC bench (all synthetic; Cumulus Cloud is fictional)
   ===================================================================== */

const FAULT_SETS = {
  medium: { sgDb:true, routeNat:true, naclEphemeral:true, dnsApi:true, lbHealth:true,
            vpnMtu:false, peering:false, certExpired:false, dhcpPod:false, dnsPayments:false, sgPayPod:false, vlanBridge:false },
  hard:   { sgDb:false, routeNat:false, naclEphemeral:true, dnsApi:false, lbHealth:true,
            vpnMtu:true, peering:true, certExpired:true, dhcpPod:true, dnsPayments:true, sgPayPod:true, vlanBridge:true }
};
// vlanBridge = hybrid bridge VLAN-tag fault (OBJ-H10); in Medium it is covered at recognize-level by drill case 6.

const NODES = {
  users:    { label:'Shoppers',        sub:'public internet',            x:85,  y:78,  kind:'ext' },
  igw:      { label:'igw',             sub:'internet gateway',           x:245, y:78,  kind:'gw' },
  natgw:    { label:'nat-gw-a',        sub:'NAT gateway · public-a',     x:245, y:205, kind:'gw' },
  corp:     { label:'Corp office',     sub:'10.50.0.0/16',               x:85,  y:330, kind:'ext' },
  vgw:      { label:'vgw-corp',        sub:'site-to-site VPN',           x:245, y:330, kind:'gw' },
  dns:      { label:'dns-res',         sub:'resolver · 10.20.0.10',      x:420, y:150, kind:'svc' },
  alb:      { label:'alb-store',       sub:'VIP 203.0.113.10',           x:560, y:95,  kind:'lb' },
  web1:     { label:'web-01',          sub:'10.20.1.47 · :8080',         x:450, y:230, kind:'inst' },
  web2:     { label:'web-02',          sub:'10.20.1.48 · :8080',         x:450, y:310, kind:'inst' },
  app1:     { label:'app-01',          sub:'10.20.2.47 · :8080/:8443',   x:620, y:230, kind:'inst' },
  pod1:     { label:'pod-01',          sub:'pods · 10.20.8.0/24',        x:620, y:330, kind:'inst' },
  db1:      { label:'db-01',           sub:'10.20.3.20 · :5432',         x:770, y:230, kind:'inst' },
  pay1:     { label:'pay-01',          sub:'10.20.3.54 · :8443',         x:770, y:330, kind:'inst' },
  bridge:   { label:'bridge-01',       sub:'hybrid bridge · VLAN 40/50', x:450, y:415, kind:'inst' },
  legacy:   { label:'legacy-crm',      sub:'10.20.9.12 · VLAN access',   x:620, y:415, kind:'inst' },
  tgw:      { label:'tgw-1',           sub:'transit gateway (idle)',     x:925, y:95,  kind:'gw' },
  stage:    { label:'vpc-stage-b',     sub:'10.30.0.0/16',               x:925, y:230, kind:'vpc' },
  analytics:{ label:'vpc-analytics-c', sub:'10.40.0.0/16 · analytics-01',x:925, y:330, kind:'vpc' }
};

const EDGES = [
  { a:'users', b:'igw',   lbl:'HTTP/HTTPS', solid:true },
  { a:'igw',   b:'alb',   lbl:'0.0.0.0/0 → igw', solid:true },
  { a:'natgw', b:'app1',  lbl:'egress 0.0.0.0/0' },
  { a:'natgw', b:'pod1',  lbl:'' },
  { a:'corp',  b:'vgw',   lbl:'IPsec ×2', solid:true },
  { a:'vgw',   b:'web1',  lbl:'10.50/16 ↔ BGP' },
  { a:'alb',   b:'web1',  lbl:':80/443', solid:true },
  { a:'alb',   b:'web2',  lbl:'', solid:true },
  { a:'web1',  b:'app1',  lbl:':8443' },
  { a:'app1',  b:'db1',   lbl:':5432', solid:true },
  { a:'app1',  b:'pay1',  lbl:':8443' },
  { a:'pod1',  b:'app1',  lbl:'' },
  { a:'dns',   b:'web1',  lbl:'DNS' },
  { a:'dns',   b:'app1',  lbl:'' },
  { a:'bridge',b:'legacy',lbl:'access port', solid:true },
  { a:'tgw',   b:'stage', lbl:'attach?' },
  { a:'tgw',   b:'analytics', lbl:'attach?' },
  { a:'tgw',   b:'alb',   lbl:'' },
  { a:'stage', b:'analytics', lbl:'peering', solid:true }
];

/* ---------------- initial config (per fault set, adjusted at start) --------------- */
function initialConfig(f){
  const c = {
    sgs: {
      'sg-lb':  { title:'sg-lb — alb-store', rules:[
        {d:'in', p:'tcp', a:80,  b:80,  s:'0.0.0.0/0', note:'shoppers → store'},
        {d:'in', p:'tcp', a:443, b:443, s:'0.0.0.0/0', note:'shoppers → store'} ] },
      'sg-web': { title:'sg-web — web tier', rules:[
        {d:'in', p:'tcp', a:8080, b:8080, s:'sg-lb',        note:'LB → targets'},
        {d:'in', p:'tcp', a:22,   b:22,   s:'10.50.0.0/16', note:'corp bastion'},
        {d:'in', p:'tcp', a:443,  b:443,  s:'0.0.0.0/0',    note:'leftover CDN rule ⚠'},
        {d:'in', p:'icmp',a:8,    b:0,    s:'10.50.0.0/16', note:'corp admin ping'} ] },
      'sg-app': { title:'sg-app — app tier', rules:[
        {d:'in', p:'tcp', a:8080, b:8080, s:'sg-lb',        note:''},
        {d:'in', p:'tcp', a:8443, b:8443, s:'10.20.7.0/24', note:'OLD pod CIDR'},
        {d:'in', p:'tcp', a:22,   b:22,   s:'10.50.0.0/16', note:''} ] },
      'sg-db':  { title:'sg-db — db-01 (Postgres)', rules:[
        {d:'in', p:'tcp',  a:5432, b:5432, s:'10.20.3.0/24', note:'data subnet only'},
        {d:'in', p:'icmp', a:8,    b:0,    s:'10.20.0.0/16', note:'ping (echo/Reply)'} ] },
      'sg-pay': { title:'sg-pay — pay-01 (payments API)', rules:[
        {d:'in', p:'tcp',  a:8443, b:8443, s:'sg-app',       note:'app tier'},
        {d:'in', p:'icmp', a:8,    b:0,    s:'10.20.0.0/16', note:''} ] },
      'sg-pod': { title:'sg-pod — pod fleet', rules:[
        {d:'in', p:'tcp', a:22, b:22, s:'10.50.0.0/16', note:''} ] },
      'sg-legacy': { title:'sg-legacy — bridge VMs', rules:[
        {d:'in', p:'tcp', a:80,  b:80,  s:'10.20.0.0/16', note:'legacy CRM web'},
        {d:'in', p:'icmp',a:8,   b:0,   s:'10.20.0.0/16', note:'VPC ping'} ] }
    },
    nacls: {
      'nacl-public': { title:'nacl-public (10.20.1.0/24)', inR:[
          {n:100,p:'tcp',a:80,b:80,s:'0.0.0.0/0'},{n:107,p:'tcp',a:8080,b:8080,s:'10.20.0.0/16',note:'LB probes/targets'},
          {n:110,p:'tcp',a:443,b:443,s:'0.0.0.0/0'},
          {n:120,p:'tcp',a:1024,b:65535,s:'0.0.0.0/0',note:'ephemeral return'},{n:130,p:'icmp',a:8,b:65535,s:'0.0.0.0/0'}], outR:[{n:100,p:'all',a:0,b:65535,s:'0.0.0.0/0'}] },
      'nacl-app': { title:'nacl-app (10.20.2.0/24)', inR:[
          {n:100,p:'tcp',a:443,b:443,s:'0.0.0.0/0'},{n:105,p:'tcp',a:80,b:80,s:'0.0.0.0/0'},
          {n:110,p:'tcp',a:8080,b:8080,s:'0.0.0.0/0'},{n:115,p:'tcp',a:8443,b:8443,s:'0.0.0.0/0'},
          {n:120,p:'tcp',a:32768,b:33433,s:'0.0.0.0/0',note:'ephemeral — TOO NARROW'},
          {n:130,p:'icmp',a:8,b:65535,s:'0.0.0.0/0'}], outR:[{n:100,p:'all',a:0,b:65535,s:'0.0.0.0/0'}] },
      'nacl-data': { title:'nacl-data (10.20.3.0/24)', inR:[
          {n:100,p:'tcp',a:5432,b:5432,s:'10.20.0.0/16'},{n:105,p:'tcp',a:8443,b:8443,s:'10.20.0.0/16'},
          {n:110,p:'icmp',a:8,b:65535,s:'10.20.0.0/16'}], outR:[{n:100,p:'all',a:0,b:65535,s:'0.0.0.0/0'}] },
      'nacl-pods': { title:'nacl-pods (10.20.8.0/24)', inR:[{n:100,p:'all',a:0,b:65535,s:'0.0.0.0/0'}], outR:[{n:100,p:'all',a:0,b:65535,s:'0.0.0.0/0'}] }
    },
    routes: {
      'rt-public':   { title:'rt-public — public subnet 10.20.1.0/24', rows:[ {d:'10.20.0.0/16',t:'local'},{d:'0.0.0.0/0',t:'igw'} ] },
      'rt-private':  { title:'rt-private — app subnet 10.20.2.0/24',   rows:[ {d:'10.20.0.0/16',t:'local'} ] },
      'rt-data':     { title:'rt-data — data subnet 10.20.3.0/24',     rows:[ {d:'10.20.0.0/16',t:'local'} ] },
      'rt-pods':     { title:'rt-pods — pod subnet 10.20.8.0/24',      rows:[ {d:'10.20.0.0/16',t:'local'},{d:'0.0.0.0/0',t:'nat-gw-a'} ] },
      'rt-corp':     { title:'rt-corp — corp office 10.50.0.0/16',     rows:[ {d:'10.50.0.0/16',t:'local'},{d:'10.20.0.0/16',t:'vgw-corp'},{d:'0.0.0.0/0',t:'isp'} ] },
      'rt-stage':    { title:'rt-stage — vpc-stage-b',                 rows:[ {d:'10.30.0.0/16',t:'local'},{d:'10.20.0.0/16',t:'pcx-prod-stage'} ] },
      'rt-analytics':{ title:'rt-analytics — vpc-analytics-c',         rows:[ {d:'10.40.0.0/16',t:'local'},{d:'10.30.0.0/16',t:'pcx-stage-analytics'} ] }
    },
    dns: { records: {
      'api.orbitcart.internal':'10.20.2.11',        // stale (fault dnsApi)
      'app.orbitcart.internal':'10.20.2.47',        // correct (control)
      'payments.orbitcart.internal':'10.20.3.19',   // stale (fault dnsPayments)
      'db.orbitcart.internal':'10.20.3.20' } },
    dhcp: { def:{dns:'10.20.0.10',ntp:'10.20.0.20'},
            pods:{dns:'198.51.100.53',poolStart:50,poolEnd:100} },   // pods: public resolver + tight pool (fault dhcpPod)
    lb:  { hcPort:8443, hcPath:'/api/status', proto:'HTTP', healthy:2 },  // correct: 8080 + /healthz (fault lbHealth)
    vpn: { mtu:1500 },                                                    // correct: 1436 (fault vpnMtu)
    tgw: { attach:{prod:false,stage:false,analytics:false}, propagate:false },  // fault peering
    cert:{ renewed:false },                                               // fault certExpired
    bridge:{ vlan:42 }                                                    // correct: 40 (map flavor; covered in quiz/debrief)
  };
  // Hard-only: app subnet route table comes pre-broken-free; medium-only faults get fixed configs in hard
  if(!f.routeNat){ c.routes['rt-private'].rows.push({d:'0.0.0.0/0',t:'nat-gw-a'}); }
  if(!f.sgDb){ c.sgs['sg-db'].rules.push({d:'in',p:'tcp',a:5432,b:5432,s:'sg-app',note:'app tier'}); }
  if(!f.dnsApi){ c.dns.records['api.orbitcart.internal']='10.20.2.47'; }
  return c;
}

/* ---------------- hosts / vantage points ---------------- */
const HOSTS = {
  shoppers: { name:'shoppers (browser)', ip:'203.0.113.90', subnet:'internet', vpc:'internet', resolve:'public', quick:['curl -I http://store[.]orbitcart.net/','curl -I https://api[.]orbitcart.net/','dig store[.]orbitcart.net'] },
  web1:     { name:'web-01',   ip:'10.20.1.47', subnet:'public', nacl:'nacl-public', sg:'sg-web', vpc:'prod', resolve:'internal', quick:['nc -zv db-01 5432','ping db-01','curl -I http://store[.]orbitcart.net/','dig api.orbitcart.internal'] },
  web2:     { name:'web-02',   ip:'10.20.1.48', subnet:'public', nacl:'nacl-public', sg:'sg-web', vpc:'prod', resolve:'internal', quick:['nc -zv db-01 5432','ping db-01'] },
  app1:     { name:'app-01',   ip:'10.20.2.47', subnet:'app', nacl:'nacl-app', sg:'sg-app', vpc:'prod', resolve:'internal', quick:['ping 8.8.8.8','curl -I http://mirror[.]cumuluspkgs.net/','nc -zv analytics-01 5432','dig api.orbitcart.internal'] },
  pod1:     { name:'pod-01',   ip:'10.20.8.33', subnet:'pods', nacl:'nacl-pods', sg:'sg-pod', vpc:'prod', resolve:'podDhcp', quick:['dig payments.orbitcart.internal','nc -zv payments.orbitcart.internal 8443','ping 8.8.8.8'] },
  db1:      { name:'db-01',    ip:'10.20.3.20', subnet:'data', nacl:'nacl-data', sg:'sg-db', vpc:'prod', resolve:'internal', quick:['ss -tlnp','ping web-01'] },
  pay1:     { name:'pay-01',   ip:'10.20.3.54', subnet:'data', nacl:'nacl-data', sg:'sg-pay', vpc:'prod', resolve:'internal', quick:['ss -tlnp'] },
  legacy:   { name:'legacy-crm', ip:'10.20.9.12', subnet:'bridge', nacl:'nacl-public', sg:'sg-legacy', vpc:'prod', resolve:'internal', quick:['ping web-01'] },
  corp:     { name:'corp-vm',  ip:'10.50.0.5', subnet:'corp', nacl:'nacl-corp', sg:'sg-corp', vpc:'corp', resolve:'public', quick:['ping web-01','ping -M do -s 1450 web-01','scp big-dump.tar.gz web-01:/tmp/'] },
  analytics:{ name:'analytics-01', ip:'10.40.0.20', subnet:'analytics', nacl:'nacl-analytics', sg:'sg-ana', vpc:'analytics', resolve:'internal', quick:['ping app-01'] },
  alb:      { name:'alb-store (VIP)', ip:'203.0.113.10', subnet:'public', vpc:'prod', resolve:'internal', quick:['curl -I http://localhost:80/'], isLb:true }
};

const DNS_NAMES = {
  'db.orbitcart.internal':'db1', 'app.orbitcart.internal':'app1', 'legacy-crm.orbitcart.internal':'legacy',
  'api.orbitcart.internal':'APP_STALE', 'payments.orbitcart.internal':'PAY_STALE',
  'mirror[.]cumuluspkgs.net':'EXT_MIRROR', 'store[.]orbitcart.net':'EXT_VIP', 'api[.]orbitcart.net':'EXT_VIP',
  'analytics-01':'analytics', 'analytics-01.orbitcart.internal':'analytics'
};

/* ---------------- knowledge core (Learn tab) ---------------- */
const LEARN_HTML = `
<h2>What you're troubleshooting today</h2>
<p><b>CompTIA Cloud+ CV0-004 · Domain 6.0 Troubleshooting (12% of the exam) · objective 6.2 — “Given a scenario, troubleshoot network issues.”</b>
The exam hands you a messy scenario and expects you to find the broken layer, pick the right tool, apply a least-privilege fix, and verify. This bench trains exactly that loop on the OrbitCart network.</p>
<div class="callout exam"><b>Exam framing:</b> objective 6.2's official bullets are — network service unavailability (DHCP, DNS, NTP, NAT, HTTP status codes) · latency · bandwidth/throughput · network device misconfiguration · outages (full/partial) · resource limits (API throttling, service quotas) · regional service availability · protocol incompatibility · protocol deprecations · IP addressing issues (scope exhaustion, network overlap) · routing issues (missing/misconfigured routes) · switching issues (VLANs, misconfigured tags, access vs. trunk). Every one of them appears on this bench.</div>

<h2>The method: seven steps, always in order</h2>
<p>Cloud troubleshooting fails when people skip to “fix something.” CompTIA's method keeps you honest — practice it below; it is objective OBJ-M1.</p>
<ol>
<li><b>Identify the problem</b> — symptoms, scope, what changed (deploys, quota emails, new CIDRs).</li>
<li><b>Establish a theory of probable cause</b> — work layers: name resolution → routing → filtering → service.</li>
<li><b>Test the theory</b> — one cheap command that proves or kills it.</li>
<li><b>Establish a plan</b> — least-privilege change, blast radius, rollback.</li>
<li><b>Implement</b> — or escalate if the theory was wrong (back to step 1).</li>
<li><b>Verify functionality</b> — re-test from the <i>original source</i>, not from your memory.</li>
<li><b>Document</b> — the fix, the why, the monitoring so it stays fixed.</li>
</ol>

<h2>The cloud network layer cake</h2>
<p>Every “connectivity” symptom lives on one of these layers. Top-down or bottom-up — just be systematic.</p>
<table><thead><tr><th>Layer / construct</th><th>What it does</th><th>Classic failure</th><th>How to check here</th></tr></thead><tbody>
<tr><td><b>DNS</b></td><td>Names → IPs (internal zone <code>orbitcart.internal</code> served by 10.20.0.10)</td><td>Stale A record after failover; wrong resolver handed out by DHCP; split-horizon misses</td><td><code>dig</code> / <code>nslookup</code>, compare against the host's real IP</td></tr>
<tr><td><b>DHCP</b></td><td>Leases IP + options (resolver, NTP) to instances/pods</td><td>Scope exhaustion → 169.254.x.x APIPA; wrong DNS option</td><td>Inspect the lease/options card; ping the resolver</td></tr>
<tr><td><b>NTP</b></td><td>Keeps clocks sane for auth/TLS</td><td>Egress rule blocks UDP/123 → clock skew breaks authentication</td><td><code>ntpstat</code>-style checks; skew alarms</td></tr>
<tr><td><b>Route tables</b></td><td>Per-subnet <code>destination → target</code> map (local, igw, nat-gw, peering, TGW, VPN)</td><td>Missing <code>0.0.0.0/0 → nat</code> on private subnets; misconfigured/absent peer routes; non-transitive peering</td><td><code>route -n</code> from a host, or the route-table card</td></tr>
<tr><td><b>NAT gateway</b></td><td>Private subnets open <i>outbound-only</i> internet sessions</td><td>Route points at it but it's down / wrong AZ; expect <i>no</i> inbound initiation</td><td>Route table + NAT metrics</td></tr>
<tr><td><b>Security groups (stateful)</b></td><td>Instance-level allow-list; replies auto-allowed</td><td>Missing inbound port from the right source; port/proto typos; <code>0.0.0.0/0</code> over-exposure</td><td>SG card; <code>nc -zv</code> → <i>timeout</i></td></tr>
<tr><td><b>Network ACLs (stateless)</b></td><td>Subnet-level numbered rules, first match wins, <i>both directions</i></td><td>Ephemeral-port hole → return traffic dropped → “works sometimes”</td><td>NACL card; flow-log REJECTs on random high ports</td></tr>
<tr><td><b>Load balancer health checks</b></td><td>Probe port+path+expected code decides who gets traffic</td><td>Wrong port/path → 0/2 healthy → <code>502</code> even though apps run</td><td>Target-group card; <code>curl</code> the VIP</td></tr>
<tr><td><b>VPN / transit gateway</b></td><td>Site-to-site tunnels; hub for many VPCs</td><td>MTU mismatch stalls big transfers; peering is <i>non-transitive</i> — TGW fixes that</td><td>Tunnel status, BGP routes, <code>ping -M do -s</code>, <code>mtr</code></td></tr>
<tr><td><b>Virtual switching / VLAN</b></td><td>L2 segments on hybrid bridges: access = 1 VLAN, trunk = many tagged</td><td>Misconfigured tag → VM isolated although IP/routes are perfect</td><td>Bridge card; ping the isolated guest</td></tr>
<tr><td><b>IP addressing</b></td><td>CIDR plan per subnet/VPC</td><td>Scope exhaustion (APIPA); network overlap (two sites claim the same CIDR → routes break)</td><td>Lease state; compare CIDR plans</td></tr>
<tr><td><b>Provider limits</b></td><td>Quotas, API throttling, regional availability</td><td><code>429</code> on automation; “can't attach 6th VPC”; feature absent in your region</td><td>Error codes + provider quota panel</td></tr>
</tbody></table>

<h2>The #1 exam trap: stateful vs. stateless</h2>
<p>A <b>security group</b> is stateful: allow inbound 5432 and the reply traffic flows back automatically. A <b>NACL</b> is stateless: the return packet is a brand-new decision, and it comes back on an <b>ephemeral port</b> (client-side, typically 1024–65535). If your subnet's NACL only allows, say, 32768–33433 inbound, most replies die — connections fail <i>intermittently</i>, exactly the kind of “works sometimes” story the exam loves.</p>
<div class="callout"><b>Timeout vs. refused:</b> a <i>timeout</i> means packets vanished — firewall silently dropping (SG/NACL) or no route. A <i>refused</i> means the host answered “nothing listens on that port” — the network works, the service doesn't. Read the error like a detective.</div>

<h2>HTTP status codes you must read fluently (6.2 bullet)</h2>
<table><thead><tr><th>Code</th><th>Meaning on the bench</th></tr></thead><tbody>
<tr><td><code>200 OK</code></td><td>Healthy path end-to-end.</td></tr>
<tr><td><code>301/302</code></td><td>Redirect — health checkers that expect <code>200</code> will mark targets unhealthy. Check the check.</td></tr>
<tr><td><code>404</code></td><td>Wrong health-check <i>path</i> (or deleted endpoint).</td></tr>
<tr><td><code>429</code></td><td>API throttling — resource limit, back off / request a quota increase.</td></tr>
<tr><td><code>502 Bad Gateway</code></td><td>LB reached… nothing healthy. Classic health-check misconfig or dead targets.</td></tr>
<tr><td><code>503/504</code></td><td>No healthy targets / upstream timed out (latency!).</td></tr>
</tbody></table>

<h2>Latency, bandwidth, throughput, MTU</h2>
<ul>
<li><b>Latency</b> = round-trip time (<code>ping</code> RTT). High RTT makes chatty protocols crawl even on fat pipes.</li>
<li><b>Bandwidth</b> = pipe capacity; <b>throughput</b> = what you actually get (always less).</li>
<li><b>MTU</b> = largest packet on a path. VPN/tunnel overhead shrinks it; if a path silently drops oversized “don't fragment” packets you get a <b>PMTUD black hole</b>: small pings pass, big transfers stall. Common cure: set tunnel MTU ≈ 1436 (value varies by provider — this bench uses the simplified Cumulus number).</li>
</ul>

<h2>Outages, limits, and protocol drift</h2>
<ul>
<li><b>Full outage</b>: every target unhealthy, whole service down. <b>Partial</b>: one AZ/target gone — degraded, intermittent errors.</li>
<li><b>API throttling / quotas</b>: automation hitting <code>429</code>s needs backoff + quota increase; “service quota exceeded” blocks new attachments/sizes. <b>Regional availability</b>: some instance types/features simply don't exist in your region — pick another region or design.</li>
<li><b>Protocol incompatibility</b>: both sides speak IP but disagree on parameters (MTU, fragmentation). <b>Protocol deprecation</b>: one side turned an old version off — e.g., TLS 1.0/1.1 were formally deprecated (RFC 8996, 2021); legacy clients fail handshakes with “protocol version” errors. The fix is upgrading the client, not weakening the server.</li>
</ul>

<h2>The operator's toolkit</h2>
<table><thead><tr><th>Tool</th><th>Answers</th><th>Bench syntax</th></tr></thead><tbody>
<tr><td><code>ping</code></td><td>L3 reachable? RTT? (<code>-M do -s N</code> probes MTU with DF set)</td><td><code>ping db-01</code> · <code>ping -M do -s 1450 web-01</code></td></tr>
<tr><td><code>traceroute</code></td><td>Which path, where does it die?</td><td><code>traceroute db-01</code></td></tr>
<tr><td><code>nc -zv</code></td><td>Is that TCP port open? (timeout vs. refused!)</td><td><code>nc -zv db-01 5432</code></td></tr>
<tr><td><code>dig</code> / <code>nslookup</code></td><td>What IP does the name resolve to, via which server?</td><td><code>dig api.orbitcart.internal</code></td></tr>
<tr><td><code>curl -I</code></td><td>Does the app answer? Which status code?</td><td><code>curl -I http://store[.]orbitcart.net/</code></td></tr>
<tr><td><code>openssl s_client</code></td><td>TLS handshake + certificate dates</td><td><code>openssl s_client -connect api[.]orbitcart.net:443</code></td></tr>
<tr><td><code>tcpdump</code></td><td>Who actually replied? (SYN with no SYN-ACK = filtering)</td><td><code>tcpdump -i any host db-01</code></td></tr>
<tr><td><code>mtr</code></td><td>Loss/latency per hop</td><td><code>mtr analytics-01</code></td></tr>
<tr><td><code>ss -tlnp</code> / <code>route -n</code></td><td>Is my listener up? What are my routes?</td><td>run on the source host</td></tr>
<tr><td><b>Flow logs</b></td><td>ACCEPT/REJECT evidence at subnet level</td><td>“Flow logs” button on the map</td></tr>
</tbody></table>
<div class="callout"><b>Blue-team note (defensive):</b> every misconfiguration here is also exposure. An SG rule opened to <code>0.0.0.0/0</code> “just for troubleshooting” that survives the incident is a standing invitation — sg-web still carries one. Close what you open, alert on REJECT spikes, and write the runbook while it's fresh.</div>
`;

/* ---------------- glossary ---------------- */
const GLOSSARY = [
  ['CIDR','Address block written base/prefix-length — 10.20.0.0/16 is 65,536 addresses.'],
  ['VPC','Virtual private cloud: your isolated IP space inside a provider region.'],
  ['Route table','Per-subnet list of destination CIDR → target rules that decide where packets go.'],
  ['Internet gateway','VPC attachment that routes traffic to and from the public internet.'],
  ['NAT gateway','Lets private-subnet hosts open outbound internet sessions without allowing inbound initiation.'],
  ['Security group','Stateful instance-level firewall; allowed inbound rules auto-allow reply traffic.'],
  ['Network ACL','Stateless subnet firewall: numbered rules, first match wins, return traffic must be allowed explicitly.'],
  ['Ephemeral ports','Temporary client-side source ports (typically 1024–65535) that reply traffic comes back on.'],
  ['Stateful vs stateless','Stateful = replies auto-allowed (SG). Stateless = each packet judged alone (NACL).'],
  ['APIPA','169.254.x.x link-local self-address a host gives itself when DHCP fails — useless beyond its own link.'],
  ['DNS split-horizon','Internal names resolve differently (or not at all) depending on which resolver asks.'],
  ['Health check','LB probe (port + path + expected code) deciding which targets receive traffic.'],
  ['MTU / PMTUD','Maximum packet size on a path; Path-MTU Discovery failures silently stall oversized packets.'],
  ['API throttling / quota','Provider rate limit (HTTP 429) or hard cap on resources in an account/region.'],
  ['VLAN / access vs trunk','L2 segment tag: access ports carry one VLAN, trunk ports carry many tagged VLANs.']
];

/* ---------------- interactive widget data ---------------- */
const METHOD_STEPS = [
  'Identify the problem & symptoms','Establish a theory of probable cause','Test the theory',
  'Establish a plan of action','Implement the solution (or escalate)','Verify functionality from the source','Document findings & monitoring'];
const METHOD_CORRECT = [0,1,2,3,4,5,6];

const TOOL_PAIRS = {
  tools: ['ping','traceroute','dig / nslookup','nc -zv','curl -I','openssl s_client'],
  purposes: ['Is the host reachable at L3, and what is the RTT?','Which path do packets take, and where do they stop?','Which IP does this name resolve to, and via which resolver?','Is that specific TCP port accepting connections?','Does the application answer — and with which HTTP status?','Is the TLS certificate valid and the handshake successful?']
};
const TOOL_CORRECT = [0,1,2,3,4,5]; // tools[i] ↔ purposes[TOOL_CORRECT[i]] — identity mapping, arrays shuffled at render

const OPTS_IN_META_NOTE = null; /* MC option sets live in engine C (OPTS) — audited there */
const FLOW_ROWS_M = [
  { txt:'2 ACCEPT TCP 203.0.113.90:49152 → 203.0.113.10:443  (shoppers → alb-store VIP)', cat:'normal', hint:'Shoppers reaching the store VIP — healthy baseline traffic.' },
  { txt:'2 REJECT TCP 10.20.1.47:51844 → 10.20.3.20:5432  (web-01 → db-01, SYN only)', cat:'sg', hint:'SYN silently dropped at the instance firewall — sg-db has no rule for the web/app tier.' },
  { txt:'2 REJECT TCP 198.51.100.20:80 → 10.20.2.47:51377  (mirror → app-01, SYN-ACK)', cat:'nacl', hint:'Return traffic to a random ephemeral port — the stateless NACL hole.' },
  { txt:'2 ACCEPT UDP 10.20.2.47:123 → 10.20.0.20:123  (app-01 → internal NTP)', cat:'normal', hint:'NTP to the internal time service — healthy.' },
  { txt:'2 REJECT TCP 10.20.2.47:51401 → 34.11.0.5:443  (app-01 → ads.telemetry.example)', cat:'unrelated', hint:'Marketing tracker — noise, not part of these incidents.' }
];

const FLOW_ROWS_H = [
  { txt:'2 ACCEPT TCP 10.30.4.11:44300 → 151.101.1.9:443  (stage → CDN, 84,201 pkts)', cat:'unrelated', hint:'Big but benign CDN traffic from staging — volume is a distraction, not a fault.' },
  { txt:'2 REJECT TCP 198.51.100.20:80 → 10.20.2.47:51377  (mirror → app-01, SYN-ACK)', cat:'nacl', hint:'Inbound to a random ephemeral port — the stateless hole in nacl-app.' },
  { txt:'2 REJECT TCP 198.51.100.20:80 → 10.20.2.47:51502  (mirror → app-01, SYN-ACK)', cat:'nacl', hint:'Same signature, different ephemeral port — a pattern, not a one-off.' },
  { txt:'2 ACCEPT ICMP 10.20.2.47 → 198.51.100.20  (app-01 → mirror, echo)', cat:'normal', hint:'ICMP allowed — that is why ping works while TCP dies. Classic.' },
  { txt:'2 REJECT TCP 10.20.8.33:51900 → 10.20.3.54:8443  (pod-01 → pay-01, SYN)', cat:'sg', hint:'SYN dropped inbound on pay-01 — sg-pay knows nothing about the pod CIDR.' },
  { txt:'2 ACCEPT TCP 203.0.113.90:49152 → 203.0.113.10:443  (shoppers → alb-store VIP)', cat:'normal', hint:'Pre-existing healthy traffic — keep your eyes on the REJECT pattern.' },
  { txt:'ALARM CPU 92% 5 min — pay-01 (HighCPUAlarm)', cat:'unrelated', hint:'An alarm, not a flow. CPU pain, not a packet drop.' },
  { txt:'2 REJECT TCP 198.51.100.20:80 → 10.20.2.47:51648  (mirror → app-01, SYN-ACK)', cat:'nacl', hint:'Third strike on ephemeral return ports.' },
  { txt:'2 ACCEPT TCP 10.50.0.5:50122 → 10.20.1.47:443  (corp-vm → web-01, admin over the leftover 443 rule)', cat:'normal', hint:'Corp admin riding the leftover 0.0.0.0/0 443 rule — works, and exactly why that rule must die.' },
  { txt:'DEPLOY annotation 08:55 — payments-svc v2.31 rolled to pay-01', cat:'unrelated', hint:'Change-record noise. Tempting, but the drops are network-layer.' }
];

const DRILL_CASES = [
  { q:'web-01 pings db-01 fine, but SSH on port 22 times out. Flow logs show REJECT lines tagged sg-db on the SYN only.',
    opts:['A route-table entry missing on web-01','The stateful security group missing a rule','The stateless NACL missing a return rule','A stale DNS record for db-01'], correct:1,
    why:'ICMP works + SYN-only REJECT at the instance firewall = a stateful SG missing the port. NACL trouble would hit return traffic, not the first SYN.' },
  { q:'app-01 reaches the package mirror for most requests, but a random fraction hang. The service port is allowed everywhere; the failures land on random high ports.',
    opts:['A security group on the mirror side','A missing route to the mirror','The NACL missing ephemeral return ports','An MTU mismatch to the mirror'], correct:2,
    why:'Stateless NACLs judge each packet alone: replies to ephemeral ports that are not allow-listed get dropped. Intermittent = ephemeral.' },
  { q:'A new branch office tunnel uses CIDR 10.20.0.0/16 — the same range as vpc-prod-a. The tunnel is up, routes exist, but traffic vanishes.',
    opts:['Scope exhaustion in the branch pool','Network overlap — re-address one side','A security group blocking the tunnel','Protocol deprecation on the peers'], correct:1,
    why:'Two sites claiming one CIDR makes routes ambiguous. The fix is re-addressing (or NAT overlap), not more routes.' },
  { q:'Fresh pods in 10.20.8.0/24 boot with 169.254.3.14-style addresses and never get workloads.',
    opts:['DHCP scope exhaustion on the pods','A NACL blocking the pod subnet','A stale DNS record for the registry','API throttling from the CNI provider'], correct:0,
    why:'169.254.x.x is APIPA: the host could not lease an address — the DHCP scope is full. Widen the pool.' },
  { q:'Cross-region database sync crawls at 3 MB/s. ping RTT is 84 ms; large single transfers of the same data move 60 MB/s.',
    opts:['Bandwidth saturation on the WAN','Latency hurting a chatty protocol','MTU black hole on the path','VLAN mismatch en route'], correct:1,
    why:'High RTT + many small round trips = latency-bound, not bandwidth-bound. Batch/parallelize or move the data closer.' },
  { q:'A VM behind hybrid bridge-01 cannot reach anything. IP and routes are perfect; the uplink trunk carries VLANs 40 and 50; the guest port shows VLAN 42.',
    opts:['A misconfigured VLAN tag on the port','A missing route to the guest subnet','A security group blocking the guest','DHCP exhaustion in the guest pool'], correct:0,
    why:'Trunk carries 40/50, the access port says 42 — a one-digit typo isolates the guest at L2 before any L3 logic runs.' }
];

/* ---------------- quiz ---------------- */
const QUIZ_M = [
  { q:'web-01 opens a TCP session to db-01:5432. The inbound security-group rule allows it, and replies flow automatically. What does the equivalent NACL need?',
    opts:['Nothing — NACLs are stateful like security groups','An explicit inbound allow for the ephemeral ports','A mirror-image outbound deny for port 5432','An outbound-only rule for source port 5432'], correct:1,
    exp:'NACLs are stateless: the SYN-ACK is a fresh inbound packet to a random ephemeral port (1024–65535). Without an explicit allow, return traffic dies — the classic “works sometimes” pattern.' },
  { q:'nc -zv db-01 5432 prints “Connection timed out”. Another host gets “Connection refused”. Which reading is right?',
    opts:['Both mean the service on db-01 is down','Timeout: packets filtered in flight; refused: nothing listening','Refused is worse — the host has crashed','Timeout always points to a DNS failure'], correct:1,
    exp:'Silent drops (SG/NACL/routing) produce timeouts. A refusal means the packet made it and the host answered “no listener” — a service problem, not a network problem.' },
  { q:'Why does a private subnet route table point 0.0.0.0/0 at a NAT gateway instead of the internet gateway?',
    opts:['NAT costs less per gigabyte than the IGW','NAT allows outbound sessions but blocks unsolicited inbound','The IGW cannot carry IPv4 packets at all','It makes internal DNS resolve faster'], correct:1,
    exp:'The NAT gateway is one-way by design: instances can pull packages and call APIs, but nothing on the internet can open a session to them. Pointing private subnets at an IGW would need public IPs on the hosts.' },
  { q:'You must prove whether api.orbitcart.internal still resolves to a retired address. Which tool answers fastest?',
    opts:['Run ping and compare round-trip times','Ask the resolver directly with dig','Run a traceroute toward the name','Probe port 8443 with nc -zv'], correct:1,
    exp:'dig/nslookup interrogates the resolver directly and prints the record — separating name resolution from connectivity. ping after dig: if the name resolves but ping dies, you have moved from the DNS layer to L3.' },
  { q:'A subnet NACL evaluates numbered rules 100–130 and a final deny. Inbound rule 120 allows TCP 32768–33433 only. What follows?',
    opts:['All TCP keeps working — one range suffices','Returns to other ephemeral ports get dropped','The final deny never gets evaluated','Outbound traffic is blocked as well'], correct:1,
    exp:'First match wins, then the catch-all deny. Client sockets pick ephemeral source ports across 1024–65535; only replies landing inside the allowed sliver survive. Widen the ephemeral allow.' },
  { q:'Both web targets run fine on 8080, yet the load balancer reports 0/2 healthy and shoppers get 502. The health check shows port 8443, path /api/status, expecting 200. First fix?',
    opts:['Restart both web servers to clear the state','Probe what targets serve: 8080 on /healthz','Open 0.0.0.0/0 on the web security group','Raise the healthy threshold to ten'], correct:1,
    exp:'The LB probes a port/path combination the targets do not serve. Fix the check to match reality (8080 + /healthz → 200); targets flip healthy and 502 clears. 502 = LB found nothing healthy to talk to.' },
  { q:'A legacy monitoring host fails its HTTPS connection to api[.]orbitcart.net with a “protocol version” error right after you renewed a valid certificate. What is happening?',
    opts:['The renewed certificate was issued by the wrong CA','Upgrade the monitor — TLS 1.0/1.1 deprecated','DNS now returns a stale address','A security group blocks TLS handshakes'], correct:1,
    exp:'A valid cert plus a “protocol version” handshake error = protocol deprecation. Servers disabled TLS 1.0/1.1 years ago (RFC 8996, 2021); the fix is upgrading the client, never weakening the endpoint.' }
];

const QUIZ_H = [
  { q:'Flow logs show: ACCEPT ICMP app-01 → mirror, but REJECT TCP mirror:80 → app-01 on ephemeral ports 51377/51502/51648 (SYN-ACKs). nc to the mirror times out about 85% of the time. Diagnosis?',
    opts:['nacl-app lacks the full ephemeral inbound range','sg-app blocks the mirror — add an outbound allow','The mirror rate-limits app-01 — throttling','The NAT gateway is saturated at peak'], correct:0,
    exp:'ICMP allowed + TCP SYN-ACKs rejected on random high ports + partial success = the stateless NACL ephemeral hole. SG would show no such per-port pattern, and throttling would answer, not vanish.' },
  { q:'Over the corp VPN: small pings pass at 45 ms, scp of a 2 GB dump stalls at 12% forever, ping -M do -s 1450 dies silently. BGP is stable. What do you apply?',
    opts:['Raise the tunnel bandwidth to 10 Gbps','Clamp the tunnel MTU to 1436 for PMTUD','Reboot both peers to reset the BGP sessions','Add a second redundant tunnel'], correct:1,
    exp:'Small packets OK + big packets with DF dropped = PMTUD black hole from tunnel overhead. Setting the tunnel MTU to 1436 (Cumulus example — provider-specific) makes TCP segment below the real limit; transfers complete.' },
  { q:'vpc-prod-a ↔ vpc-stage-b and vpc-stage-b ↔ vpc-analytics-c are peered with routes on both sides. app-01 still cannot reach analytics-01. Why, and what is the durable fix?',
    opts:['A route is missing in rt-private for the analytics VPC','Peering is non-transitive — hub the VPCs on tgw-1','Prod and analytics CIDRs overlap somewhere','A third-peering quota is exhausted'], correct:1,
    exp:'Peering connects two VPCs, never chains: prod cannot ride stage’s peering to analytics. A transit gateway is the hub that makes routing transitive (attachments + route propagation).' },
  { q:'Your automation playbook starts failing with HTTP 429 from the Cumulus API, and a new VPC attachment is refused with “service quota exceeded”. Another feature you planned exists only in other regions. Classify all three.',
    opts:['All three are network device misconfigurations','Provider limits: throttling, quota, regional availability','DNS, DHCP and NTP unavailability','Latency, bandwidth and throughput degradation'], correct:1,
    exp:'429 = API throttling (add backoff), quota exceeded = service quota (request increase / clean up), missing feature = regional availability (design around it). All three are 6.2 “resource limits / regional availability” failures — no packet will ever show them.' },
  { q:'After a network change, instances can no longer authenticate to the identity provider: tokens drift, clocks are 14 minutes fast, and UDP/123 egress to 10.20.0.20 is rejected. Which 6.2 bullet is this?',
    opts:['Protocol deprecation on the IdP side','Network service unavailability — NTP','IP scope exhaustion in the pod subnet','A health-check failure on the LB'], correct:1,
    exp:'Time is a network service: when NTP is unreachable, TLS and token auth fail in confusing ways. Restore UDP/123 egress to the time source — then re-verify the auth failures, they usually evaporate.' },
  { q:'Corp re-IPs a branch to 10.20.0.0/16 “temporarily” and the VPN to prod goes half-dead. Which remediation is correct?',
    opts:['Add more-specific routes on both sides to paper over it','Re-address the branch — overlap is unfixable by routing','Disable the branch firewall to let tunnels pass','Switch the tunnel to BGP immediately'], correct:1,
    exp:'Two sites claiming the same CIDR makes routing ambiguous; more routes only hide the collision. Network overlap (6.2) is fixed by re-addressing (or permanent NAT overlap, a last resort).' },
  { q:'During a change window: (1) apply fix, (2) verify from the original source, (3) reproduce & scope the symptom, (4) document, (5) test a cheap hypothesis, (6) plan a least-privilege change. The correct order is:',
    opts:['1→2→3→4→5→6','3→5→6→1→2→4','5→3→1→2→6→4','3→1→5→6→2→4'], correct:1,
    exp:'Method first: scope → hypothesis → plan → implement → verify from the source → document. Jumping straight to the fix (1 first) is how outages get longer and repeat.' }
];

/* ---------------- objectives metadata (checks live in engine C) ---------------- */
const OBJ_META_M = [
  { id:'OBJ-M1', pillar:'P1', title:'Order the seven-step troubleshooting method',
    body:'In the Learn tab, arrange the troubleshooting method into the correct order — this is the spine of every incident you will work on the bench.',
    anchor:'Domain 6.0 framing — CompTIA troubleshooting methodology', where:{tab:'learn', sel:'#seqWidget'},
    hints:['It is the standard CompTIA seven-step method used across their certs.','Starts with understanding the problem, ends with writing it down — implementing comes late.','Identify → theory → test → plan → implement → verify → document.'] },
  { id:'OBJ-M2', pillar:'P1', title:'Match each diagnostic tool to the question it answers',
    body:'In the Learn tab, pair all six tools with the question they answer. Tools are your eyes on every layer — know which eye to use.',
    anchor:'Objective 6.2 — diagnostic toolset', where:{tab:'learn', sel:'#matchWidget'},
    hints:['Think in layers: name resolution, path, reachability, port, application, TLS.','dig resolves names; nc tests one port; curl reads the app answer.','ping=L3 · traceroute=path · dig=DNS · nc=port · curl=HTTP · openssl s_client=TLS.'] },
  { id:'OBJ-M3', pillar:'P2', title:'INC-1042 — read the evidence: web-01 cannot reach Postgres',
    body:'On the Bench, set the vantage to <b>web-01</b> and run <code>nc -zv db-01 5432</code>, then <code>ping db-01</code>. Answer: which layer is failing?',
    anchor:'6.2 network device misconfiguration — stateful SG vs. L3', where:{tab:'bench', node:'db1'},
    hints:['One command answers L3, another answers L4. Compare them.','If ping works but the port times out, the host is alive — something is filtering.','Timeout with ICMP passing = silent drop at a stateful firewall: the security group.'] },
  { id:'OBJ-M4', pillar:'P4', title:'INC-1042 — apply the least-privilege fix and verify',
    body:'Open db-01’s <b>sg-db</b> on the map, add the missing inbound rule for Postgres from the app/web tier, then re-run <code>nc -zv db-01 5432</code> from web-01 to verify.',
    anchor:'6.2 network device misconfiguration — SG rule add (stateful)', where:{tab:'bench', node:'db1', sel:'.sgAddForm'},
    hints:['Postgres listens on TCP 5432.','Reference a source that covers the web tier: sg-web, or the whole VPC CIDR 10.20.0.0/16. 0.0.0.0/0 would work but fails least privilege.','Stateful = one inbound rule is enough; replies flow automatically. Verify with a fresh nc from web-01.'] },
  { id:'OBJ-M5', pillar:'P3', title:'INC-1043 — diagnose dead egress from app-01',
    body:'On the Bench from <b>app-01</b>: <code>curl -I http://mirror[.]cumuluspkgs.net/</code>, then <code>ping 8.8.8.8</code> (by IP!), then inspect <b>rt-private</b>. Name the missing piece.',
    anchor:'6.2 routing issues — missing route / NAT', where:{tab:'bench', node:'natgw'},
    hints:['Pinging an IP skips DNS — if that also dies, the problem is below the name layer.','Private subnets do not use the IGW directly — what is the one-way door to the internet?','Compare rt-public and rt-private: one has 0.0.0.0/0 → a gateway, the other does not.'] },
  { id:'OBJ-M6', pillar:'P4', title:'INC-1043 — add the missing route and verify',
    body:'Edit <b>rt-private</b> (inspect app-01 or nat-gw-a): add the default route to the NAT gateway, then re-run <code>curl -I http://mirror[.]cumuluspkgs.net/</code> from app-01.',
    anchor:'6.2 routing issues — missing route fix', where:{tab:'bench', node:'app1'},
    hints:['Destination 0.0.0.0/0, target nat-gw-a.','NAT, not IGW — private hosts have no public IPs.','After adding it, curl should answer HTTP 200 from the mirror.'] },
  { id:'OBJ-M7', pillar:'P3', title:'Read flow logs like a defender',
    body:'Open <b>Flow logs</b> from the map header and classify all five excerpts: normal traffic, security-group reject, NACL reject, or unrelated noise.',
    anchor:'6.2 detection evidence — flow-log ACCEPT/REJECT reading', where:{tab:'bench', focusBtn:'#evFlowBtn'},
    hints:['Look at which packet died: a first SYN, or a reply to a high port?','REJECT on SYN to 5432 = instance firewall (SG). REJECT inbound on random ephemeral = subnet NACL.','One row is marketing noise and one is healthy NTP — not every line is your incident.'] },
  { id:'OBJ-M8', pillar:'P2', title:'INC-1043b — explain the “works sometimes” egress',
    body:'Egress now works for some requests and hangs for others. Inspect <b>nacl-app</b> (from app-01) and identify the offending rule.',
    anchor:'6.2 network device misconfiguration — stateless NACL + ephemeral ports', where:{tab:'bench', node:'app1', sel:'.naclCard'},
    hints:['Stateless = every packet judged alone, including replies.','Replies arrive on ephemeral ports (1024–65535). Which rule covers them?','Rule 120 allows only 32768–33433 — most return traffic falls outside it.'] },
  { id:'OBJ-M9', pillar:'P4', title:'INC-1043b — widen the ephemeral allow and verify',
    body:'Edit <b>nacl-app</b>: add an inbound TCP rule covering the full ephemeral range, then run <code>curl -I http://mirror[.]cumuluspkgs.net/</code> twice from app-01 — both must land.',
    anchor:'6.2 network device misconfiguration — NACL ephemeral fix', where:{tab:'bench', node:'app1', sel:'.naclAddForm'},
    hints:['Inbound, TCP, start-port 1024, end-port 65535.','Source 0.0.0.0/0 is normal here — return traffic can come from any internet peer.','Verify twice: the old behavior was intermittent, so one success proves nothing.'] },
  { id:'OBJ-M10', pillar:'P3', title:'INC-1044 — catch the stale internal DNS record',
    body:'From <b>web-01</b>: <code>dig api.orbitcart.internal</code>, then <code>ping 10.20.2.47</code>. Compare, then fix the record in the DNS card (inspect dns-res).',
    anchor:'6.2 network service unavailability — DNS', where:{tab:'bench', node:'dns'},
    hints:['dig shows the A record the resolver holds; ping by IP tests the real host.','If the name lands on a dead IP but the live IP answers, the record is stale.','api.orbitcart.internal should point at app-01’s real address: 10.20.2.47.'] },
  { id:'OBJ-M11', pillar:'P4', title:'INC-1045 — repair the store’s health checks',
    body:'Inspect <b>alb-store</b>: both targets are unhealthy and shoppers get 502. Correct the health-check port and path, then verify with <code>curl -I http://store[.]orbitcart.net/</code> from shoppers.',
    anchor:'6.2 HTTP status codes / outages (full vs partial) — LB health check', where:{tab:'bench', node:'alb', sel:'.hcForm'},
    hints:['Targets serve on 8080 and return 200 on /healthz — make the probe agree with reality.','A 404 means right port, wrong path; a 502 usually means nothing healthy behind the LB.','Full outage = 0/2 healthy. After the fix you want 2/2 and a 200.'] },
  { id:'OBJ-M12', pillar:'P2', title:'Triage drill — name the culprit six times',
    body:'Six mini-cases from the 6.2 bullet list. For each, pick the failing construct. No tools — pattern recognition only.',
    anchor:'6.2 bullets — SG · NACL · overlap · scope exhaustion · latency · VLAN tags', where:{tab:'objectives'},
    hints:['Timeout-vs-refused, stateful-vs-stateless, and “what changed” solve most of these.','Case 3: two sites claiming one CIDR is overlap. Case 4: 169.254.x.x is APIPA.','Case 5: RTT high, big transfers fine → latency, not bandwidth. Case 6: trunk carries 40/50, port says 42.'] }
];

const OBJ_META_H = [
  { id:'OBJ-H1', pillar:'P2/P3', title:'CASE-2201 — restore checkout (full outage)',
    body:'Shoppers get 502 on http://store[.]orbitcart.net/. Work it end-to-end: reproduce from <b>shoppers</b>, inspect <b>alb-store</b> (note: sg-web shows a matching 8443 rule — do not be convinced by it), fix the health check, and verify a <code>200</code> from the VIP.',
    anchor:'6.2 HTTP status codes · full vs partial outage · device misconfiguration', where:{tab:'bench', node:'alb'},
    hints:['The 8443 rule in sg-web only proves the probe port was changed deliberately once. What do the targets actually serve?','Targets: 8080, path /healthz, expecting 200. Fix the check, not the targets.'] },
  { id:'OBJ-H2', pillar:'P3/P4', title:'CASE-2202 — flow-log forensics (stateless hole)',
    body:'Open <b>Flow logs</b>. Ignore the noise (CDN burst, CPU alarm, deploy note). Identify the drop pattern — direction AND offending rule — then fix nacl-app so egress stops flapping.',
    anchor:'6.2 detection evidence + stateless NACL ephemeral range', where:{tab:'bench', focusBtn:'#evFlowBtn'},
    hints:['ICMP succeeds while TCP dies — what does that say about which layer?','Direction: inbound; the victims are SYN-ACKs to random ephemeral ports. Rule 120 is the sliver.'] },
  { id:'OBJ-H3', pillar:'P2', title:'CASE-2203 — VPN: fast pings, stalled transfers',
    body:'From <b>corp-vm</b>: ping web-01, then <code>ping -M do -s 1450 web-01</code>, then <code>scp big-dump.tar.gz web-01:/tmp/</code>. Diagnose, then fix <b>vgw-corp</b> and make the scp complete.',
    anchor:'6.2 protocol incompatibility — MTU / PMTUD black hole', where:{tab:'bench', node:'vgw', sel:'.mtuForm'},
    hints:['Everything small works; only big packets with DF vanish — that is a path-MTU black hole.','Tunnel overhead eats headroom: Cumulus recommends MTU 1436 on this tunnel (simplified vendor number).'] },
  { id:'OBJ-H4', pillar:'P2/P4', title:'CASE-2204 — analytics is unreachable (peering maze)',
    body:'From <b>app-01</b>: <code>nc -zv analytics-01 5432</code>. Routes to both peers exist in every table — explain the real cause, then make prod→analytics work durably via <b>tgw-1</b> and re-verify.',
    anchor:'6.2 misconfigured routes — non-transitive peering → transit gateway', where:{tab:'bench', node:'tgw', sel:'.tgwCard'},
    hints:['Peering connects two VPCs. Can prod ride stage’s peering?','Hub-and-spoke: attach all three VPCs to tgw-1 AND propagate routes into the VPC route tables.'] },
  { id:'OBJ-H5', pillar:'P3/P4', title:'CASE-2205 — the API that stopped shaking hands',
    body:'From <b>shoppers</b>: <code>curl -I https://api[.]orbitcart.net/</code>, then <code>openssl s_client -connect api[.]orbitcart.net:443</code>. Fix what the handshake proves broken, verify a 200 — then answer the legacy-monitor question.',
    anchor:'6.2 protocol deprecations (TLS 1.0/1.1, RFC 8996) + certificate lifecycle', where:{tab:'bench', node:'alb', sel:'.certCard'},
    hints:['Read notAfter on the certificate. Has a date passed?','After renewal, a “protocol version” error from an old client is not a cert problem — TLS 1.0/1.1 are dead (RFC 8996). Upgrade the client.'] },
  { id:'OBJ-H6', pillar:'P2/P4', title:'CASE-2206 — the pod fleet that never joined',
    body:'Inspect <b>pod-01</b>: note its address and resolver. Prove name resolution is broken with <code>dig</code>, then fix the pod subnet’s DHCP options and pool so pods lease real IPs and resolve <code>orbitcart.internal</code>.',
    anchor:'6.2 network service unavailability (DHCP/DNS) · IP scope exhaustion', where:{tab:'bench', node:'pod1', sel:'.dhcpCard'},
    hints:['169.254.x.x is APIPA — the pool had nothing left to lease.','Two fixes: widen the pool (end ≥ 200) and point domain-name-servers at the internal resolver 10.20.0.10.'] },
  { id:'OBJ-H7', pillar:'P1', title:'Triage order under pressure',
    body:'Six actions for a brand-new “service unreachable” incident are shuffled. Sequence them the way a NOC senior would — exactly.',
    anchor:'Domain 6.0 methodology applied under time pressure', where:{tab:'objectives'},
    hints:['You cannot plan a change before you have a tested theory.','Scope first, cheap tests next, change last, paperwork always at the end.'] },
  { id:'OBJ-H8', pillar:'P4', title:'Hardening selection — kill the repeat outage class',
    body:'Select the <b>six</b> measures that actually prevent this incident class, and reject the three that are traps. Exact set required.',
    anchor:'6.2 mitigation planning — control selection with trade-offs', where:{tab:'objectives'},
    hints:['Each correct item maps to one fault you met: SG-by-reference, ephemeral hygiene, NAT HA, health-check truth, transitive hub, REJECT alerting.','Traps: deleting NACLs “for simplicity”, opening 0.0.0.0/0 everywhere, disabling certificate verification. All three trade real security for fake uptime.'] },
  { id:'OBJ-H9', pillar:'P2/P3', title:'CASE-2207 — capstone: payments, from the pods',
    body:'From <b>pod-01</b>: <code>dig payments.orbitcart.internal</code> and <code>nc -zv 10.20.3.54 8443</code> (by IP). Two independent faults are hiding behind noisy metrics — find both, fix both, verify by name from pod-01.',
    anchor:'6.2 DNS + network device misconfiguration (SG) — multi-fault synthesis', where:{tab:'bench', node:'pay1'},
    hints:['The dig answer and the by-IP nc answer tell different stories — split name resolution from filtering.','Fault A: a stale A record (.19 is retired; pay-01 is 10.20.3.54). Fault B: sg-pay has no rule for the pod CIDR 10.20.8.0/24.'] },
  { id:'OBJ-H10', pillar:'P2', title:'CASE-2208 — the VM that L2 forgot',
    body:'legacy-crm (10.20.9.12) answers nothing although IP and routes are perfect. From <b>web-01</b> ping it, inspect <b>bridge-01</b>, explain it, and reconnect it.',
    anchor:'6.2 switching issues — VLAN tag, access vs. trunk', where:{tab:'bench', node:'bridge', sel:'.vlanForm'},
    hints:['Trunk carries VLANs 40 and 50. What is the guest access port tagged with?','A one-digit typo isolates a host below every L3 tool. Set the access tag to 40.'] }
];

/* ---------------- debrief static content ---------------- */
const DEBRIEF_HTML = `
<div class="prose">
<h2>Detection playbook — symptom → first move → confirming evidence</h2>
<table><thead><tr><th>Symptom</th><th>First command / card</th><th>Confirms</th><th>Fix (6.2 bullet)</th></tr></thead><tbody>
<tr><td>Port times out, ping fine</td><td><code>nc -zv</code> + SG card</td><td>SYN-only REJECT in flows</td><td>Least-privilege SG rule (device misconfiguration)</td></tr>
<tr><td>“Works sometimes”</td><td>Flow logs: REJECT on random high ports</td><td>Stateless ephemeral hole</td><td>Widen NACL ephemeral allow (device misconfiguration)</td></tr>
<tr><td>Private host: no internet</td><td><code>ping 8.8.8.8</code> + <code>route -n</code></td><td>No 0.0.0.0/0 → NAT</td><td>Add NAT route (missing route)</td></tr>
<tr><td>Name resolves dead / never</td><td><code>dig</code> vs. real IP</td><td>Stale A record / wrong resolver</td><td>Fix record · DHCP options (DNS/DHCP unavailability)</td></tr>
<tr><td>New hosts stuck on 169.254.x.x</td><td>Lease/DHCP card</td><td>Scope exhausted</td><td>Widen pool (scope exhaustion)</td></tr>
<tr><td>502 from the LB</td><td>Target-group card</td><td>0/N healthy, wrong probe</td><td>Correct port+path (HTTP status codes)</td></tr>
<tr><td>Big transfers stall over VPN</td><td><code>ping -M do -s 1450</code></td><td>PMTUD black hole</td><td>Tunnel MTU ≈1436 (protocol incompatibility)</td></tr>
<tr><td>TLS “protocol version” error</td><td><code>openssl s_client</code></td><td>Deprecated TLS 1.0/1.1</td><td>Upgrade the client (protocol deprecation)</td></tr>
<tr><td>Peer VPC unreachable, routes “exist”</td><td>Topology + TGW card</td><td>Peering is non-transitive</td><td>Transit gateway + propagation (misconfigured routes)</td></tr>
<tr><td>One host dead, everything perfect</td><td>Bridge card</td><td>VLAN tag typo (L2)</td><td>Fix access tag (switching issues)</td></tr>
</tbody></table>

<h2>Fix library applied on this bench</h2>
<div id="fixRecap" class="callout">No fixes recorded yet — your applied fixes will be listed here with their 6.2 mapping.</div>

<h2>What the exam will ask (and how this maps)</h2>
<ul>
<li>Expect <b>“Given a scenario…”</b> performance-based items: pick the tool, read flow logs, choose the fix <i>in order</i>. Practicing the loop — evidence → theory → cheap test → least-privilege change → verify — is the transferable skill.</li>
<li><b>Stateful vs. stateless</b> is the most-tested distinction in this domain. If return traffic is the victim, think NACL + ephemeral ports.</li>
<li><b>HTTP status codes</b> are diagnosis data: 502 = nothing healthy behind the LB; 429 = throttling; 301 on a health check = broken probe.</li>
<li><b>Resource limits</b> (429s, quotas, regional availability) never appear in packet captures — recognize them from error messages.</li>
<li><b>IP addressing</b>: 169.254.x.x = scope exhaustion; two sites claiming one CIDR = overlap → re-address.</li>
</ul>

<h2>Operator takeaways (blue team)</h2>
<ul>
<li><b>Least privilege survives the incident.</b> Reference security groups, not “any”; never 0.0.0.0/0 while troubleshooting — sg-web’s leftover 443 rule is exactly how exposure is born.</li>
<li><b>HA the boring things:</b> one NAT gateway in one AZ is a single point of failure — second-AZ NAT + routes is standard.</li>
<li><b>Make health checks tell the truth:</b> probe the port/path that returns 200 on the real app, not a port someone hoped existed.</li>
<li><b>Alert on REJECT spikes</b> in flow logs — the stateless ephemeral hole announced itself for hours before anyone looked.</li>
<li><b>Document and monitor</b> (step 7): every fix on this bench should end with an alarm and a runbook line.</li>
</ul>

<h2>Think like the outage (adversarial view, defensive use)</h2>
<ul>
<li>Misconfiguration is the widest attack surface in cloud networking: an over-open SG or a forgotten public subnet is reconnaissance-free entry. Audit rule drift with IaC diffs, not memory.</li>
<li>Attackers love “temporary” rules and stale DNS — stale records pointing at retired IPs can be re-registered (IP takeover). Treat DNS as configuration-as-code with review.</li>
<li>Latency and MTU blind spots hide exfiltration debates too: know your normal RTT/throughput baselines so anomalies stand out.</li>
</ul>

<h2>Keep going</h2>
<ul>
<li><b>Next lesson:</b> CV0-004 6.1 (deployment issues) and 6.3 (security issues) complete the Troubleshooting domain (12% of the exam).</li>
<li><b>Related:</b> objective 1.3 (cloud networking) holds the constructs you just fixed — re-read it after this lab and it will feel easy.</li>
<li><b>Official references:</b> <a href="https://www.comptia.org/certifications/cloud" target="_blank" rel="noopener noreferrer">CompTIA Cloud+ certification page</a> · <a href="https://www.comptia.org/training/resources/exam-objectives" target="_blank" rel="noopener noreferrer">CompTIA exam objectives downloads</a>.</li>
</ul>
<p class="dossierNote">All data on this bench is synthetic training data. OrbitCart, Cumulus Cloud, GlobeDNS and every person named are fictional. Simplifications (single-region topology, canned provider numbers like MTU 1436) are deliberate and labeled.</p>
</div>
`;
