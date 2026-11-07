'use strict';
/* =====================================================================
   SIMULATION — packet-path engine + diagnostics console (tool outputs,
   command dispatch, console wiring)
   ===================================================================== */
/* =====================================================================
   ENGINE B — packet-path simulation + diagnostics console
   ===================================================================== */
const SHORT_NAMES = { 'db-01':'db1','app-01':'app1','web-01':'web1','web-02':'web2','pay-01':'pay1',
  'pod-01':'pod1','legacy-crm':'legacy','analytics-01':'analytics','corp-vm':'corp' };
const DEAD_IPS = ['10.20.2.11','10.20.3.19']; // stale DNS targets — nothing listens there
const attemptMemo = {};
function synthEphemeral(key){
  attemptMemo[key] = (attemptMemo[key] || 0) + 1;
  const ports = [33400, 51377, 51502, 51648, 51844, 51401, 51320, 51710]; // first hit lands in the narrow allow range → "works sometimes"
  return ports[(attemptMemo[key] - 1) % ports.length];
}
function cidrMatch(ip, cidr){
  if(cidr === '0.0.0.0/0') return true;
  const m = cidr.match(/^(\d+\.\d+\.\d+)\.(\d+)\/(\d+)$/);
  if(!m) return false;
  const pre = parseInt(m[3], 10);
  const base = m[1] + '.' + m[2];
  const ipO = ip.split('.'), bO = base.split('.');
  if(pre <= 8)  return ipO[0] === bO[0];
  if(pre <= 16) return ipO[0] === bO[0] && ipO[1] === bO[1];
  if(pre <= 24) return ipO[0] === bO[0] && ipO[1] === bO[1] && ipO[2] === bO[2];
  return ip === cidr.split('/')[0];
}

function classifyIp(ip){
  if(/^10\.20\./.test(ip)) return 'prod';
  if(/^10\.30\./.test(ip)) return 'stage';
  if(/^10\.40\./.test(ip)) return 'analytics';
  if(/^10\.50\./.test(ip)) return 'corp';
  return 'external';
}
function resolveName(srcId, name){
  const src = HOSTS[srcId];
  const isInternal = /\.orbitcart\.internal$/.test(name) || SHORT_NAMES[name];
  if(/^\d+\.\d+\.\d+\.\d+$/.test(name)) return { ok:true, ip:name, server:'(literal IP)' };
  const podBroken = srcId === 'pod1' && !F.dhcp();
  const publicResolv = (src && src.resolve === 'public') || podBroken;
  if(isInternal){
    if(srcId === 'shoppers') return { ok:false, err:'NXDOMAIN — public resolvers cannot see the private zone orbitcart.internal' };
    if(podBroken) return { ok:false, err:`NXDOMAIN — resolver 198.51.100.53 (public, from DHCP options) has no view of orbitcart.internal` };
    const shortKey = SHORT_NAMES[name];
    if(shortKey && NODES[shortKey]) return { ok:true, ip: shortKey === 'pod1' ? podIp() : HOSTS[shortKey].ip, server:'10.20.0.10' };
    const rec = S.config.dns.records[name];
    if(rec) return { ok:true, ip:rec, server:'10.20.0.10' };
    return { ok:false, err:'NXDOMAIN — no record in orbitcart.internal' };
  }
  if(DNS_NAMES[name] === 'EXT_MIRROR') return { ok:true, ip:'198.51.100.20', server:'198.51.100.53' };
  if(DNS_NAMES[name] === 'EXT_VIP')    return { ok:true, ip:'203.0.113.10', server:'198.51.100.53' };
  if(name === '8.8.8.8' || name === 'store[.]orbitcart.net' || name === 'api[.]orbitcart.net' || name === 'mirror[.]cumuluspkgs.net'){
    return { ok:true, ip: name === '8.8.8.8' ? '8.8.8.8' : (DNS_NAMES[name] === 'EXT_VIP' ? '203.0.113.10' : '198.51.100.20'), server:'198.51.100.53' };
  }
  return { ok:false, err:`NXDOMAIN — no such name: ${name}` };
}
// Returns {ok, hop, why} for L3 (routes / L2 quirks). hop = NODES id for map emphasis.
function routeTest(srcId, dstIp){
  const src = HOSTS[srcId] || {};
  const dstClass = classifyIp(dstIp);
  if(DEAD_IPS.includes(dstIp)) return { ok:true }; // routable, just dead — handled at host layer
  if(srcId === 'shoppers'){
    if(dstClass === 'external') return { ok:true };
    if(dstIp === '203.0.113.10') return { ok:true };
    return { ok:false, hop:'igw', why:'no inbound path from the internet to a private address — only the NAT gateway opens sessions outward' };
  }
  if(srcId === 'legacy' || dstIdLegacy(dstIp)){
    if(!F.vlan()) return { ok:false, hop:'bridge', why:'legacy-crm sits on an access port tagged VLAN 42 while the trunk carries 40/50 — L2 isolation before routing even runs' };
  }
  const srcVpc = src.vpc;
  if(srcVpc === 'prod' && dstClass === 'prod') return { ok:true };
  if(srcVpc === 'corp' && dstClass === 'prod') return { ok:true };
  if(srcVpc === 'prod' && dstClass === 'corp') return { ok:true };
  if(srcVpc === 'prod' && dstClass === 'stage'){
    return { ok:true }; // prod↔stage peering with routes on both sides (labeled simplification: stage SGs unmodeled)
  }
  if(srcVpc === 'prod' && dstClass === 'analytics'){
    return F.tgw() ? { ok:true } : { ok:false, hop:'tgw', why:'no route to 10.40.0.0/16 — peering is pairwise (prod↔stage, stage↔analytics) and never transitive' };
  }
  if(srcVpc === 'analytics' && (dstClass === 'prod' || dstClass === 'stage')){
    return F.tgw() ? { ok:true } : { ok:false, hop:'tgw', why:'vpc-analytics-c has no route back to the source VPC (non-transitive peering)' };
  }
  if(dstClass === 'external'){
    if(srcId === 'app1') return F.nat() ? { ok:true } : { ok:false, hop:'natgw', why:'rt-private has no 0.0.0.0/0 route — packets leave app-01 with nowhere to go' };
    return { ok:true }; // public subnet / pods (NAT) / corp VPN
  }
  return { ok:true };
}
function dstIdLegacy(ip){ return ip === '10.20.9.12'; }
// Stateless NACL return-path check for TCP sessions where srcHost is the client.
// Simplification (labeled): the ephemeral-hole fault is only simulated on EXTERNAL destinations
// (the package-mirror story). Intra-VPC and peer return paths are treated as pre-allowed.
function naclReturnTest(srcId, dstIp, port, key){
  const src = HOSTS[srcId];
  if(!src || !src.nacl) return { ok:true };
  if(srcId === 'shoppers') return { ok:true };
  if(classifyIp(dstIp) !== 'external') return { ok:true };
  if(src.nacl === 'nacl-app' && !F.nacl()){
    const ep = synthEphemeral(key + '|' + srcId + '|' + dstIp + '|' + port);
    if(ep < 32768 || ep > 33433) return { ok:false, ep, hop:'app1', why:`return SYN-ACK to ephemeral port ${ep} dropped by nacl-app (inbound allow stops at 32768–33433 — stateless, first match wins)` };
  }
  return { ok:true };
}
// Destination security-group check. (Peer-VPC SGs are not modeled — labeled simplification.)
function sgTest(dstHostId, proto, port, srcId){
  const dstHost = HOSTS[dstHostId];
  if(!dstHost || !dstHost.sg) return { ok:true };
  const sg = S.config.sgs[dstHost.sg];
  if(!sg) return { ok:true };
  const srcIp = srcId === 'shoppers' ? '203.0.113.90' : (HOSTS[srcId] ? HOSTS[srcId].ip : '0.0.0.0');
  const srcSg = srcId === 'shoppers' ? null : (HOSTS[srcId] ? HOSTS[srcId].sg : null);
  const srcOk = r => r.s === '0.0.0.0/0' || cidrMatch(srcIp, r.s) || (r.s.startsWith('sg-') && r.s === srcSg);
  const hit = proto === 'icmp'
    ? sg.rules.find(r => r.d === 'in' && r.p === 'icmp' && srcOk(r))
    : sg.rules.find(r => r.d === 'in' && r.p === 'tcp' && r.a <= port && r.b >= port && srcOk(r));
  return hit ? { ok:true } : { ok:false, hop: dstHostId, why:`${dstHost.sg} has no inbound ${proto === 'icmp' ? 'ICMP' : proto + '/' + port} rule covering ${srcSg || srcIp} — silent drop` };
}
// Full L3→L4 chain. size: ICMP payload bytes (for MTU probes). kind: 'icmp'|'tcp'
function pathTest(srcId, dstIp, port, kind, size, key){
  const vpnPair = ((HOSTS[srcId] && HOSTS[srcId].vpc === 'corp') && classifyIp(dstIp) === 'prod') ||
                  ((HOSTS[srcId] && HOSTS[srcId].vpc === 'prod') && classifyIp(dstIp) === 'corp');
  const r = routeTest(srcId, dstIp);
  if(!r.ok) return Object.assign({ stage:'route' }, r);
  if(kind === 'icmp' && size && vpnPair){
    const pkt = size + 28;
    if(pkt > 1436){
      if(F.mtu()) return { ok:false, stage:'mtu', hop:'vgw', why:`message too long — path MTU is 1436 (interface now knows, PMTUD replies instead of silently dying)` };
      return { ok:false, stage:'mtu', hop:'vgw', why:`packet ${pkt}B > tunnel path MTU with DF set — silently dropped (PMTUD black hole)` };
    }
  }
  if(kind === 'tcp'){
    const nret = naclReturnTest(srcId, dstIp, port, key || 'k');
    if(!nret.ok) return Object.assign({ stage:'nacl' }, nret);
  }
  const dstId = hostForIp(dstIp);
  if(dstId && HOSTS[dstId]){
    const sg = sgTest(dstId, kind, kind === 'icmp' ? 0 : port, srcId);
    if(!sg.ok) return Object.assign({ stage:'sg' }, sg);
  }
  return { ok:true };
}
function listenerOn(hostId, port){
  const map = { web1:[8080], web2:[8080], app1:[8080,8443], db1:[5432], pay1:[8443], analytics:[5432], alb:[80,443], legacy:[80,3389], corp:[22], pod1:[8080] };
  return (map[hostId] || []).includes(port);
}
function firstListener(hostId){
  const map = { web1:8080, web2:8080, app1:8080, db1:5432, pay1:8443, analytics:5432, alb:443, legacy:80, corp:22, pod1:8080 };
  return map[hostId] || null;
}
function hostForIp(ip){
  const ids = Object.keys(HOSTS);
  for(const id of ids){
    const h = HOSTS[id];
    const hIp = id === 'pod1' ? podIp() : h.ip;
    if(hIp === ip) return id;
  }
  if(DEAD_IPS.includes(ip)) return 'DEAD';
  return null;
}

/* ---------------- tool outputs ---------------- */
const CONSOLE_MAX = 220;
let consoleLines = [];
function cline(cls, txt){ consoleLines.push({ cls, txt }); if(consoleLines.length > CONSOLE_MAX) consoleLines = consoleLines.slice(-CONSOLE_MAX); renderConsole(); }
function renderConsole(){
  const el = $('#consoleOut');
  el.innerHTML = consoleLines.map(l => `<span class="${l.cls}">${esc(l.txt)}</span>`).join('\n');
  el.scrollTop = el.scrollHeight;
  $('#cmdCnt').textContent = S.activity.cmds.length + ' commands';
}
function recordCmd(sig, ok){ S.activity.cmds.push({ sig, ok: !!ok }); save(); }

function outPing(srcId, host, opts){
  const src = HOSTS[srcId];
  const res = resolveName(srcId, host);
  if(!res.ok){ cline('c-err', `ping: ${host}: ${res.err}`); recordCmd(`${srcId}|ping|${host}`, false); return; }
  const ip = res.ip;
  const dstId = hostForIp(ip);
  const size = opts.size || 56;
  if(opts.df && size){ /* MTU probe path below */ }
  const rt = routeTest(srcId, ip);
  const key = 'ping';
  if(!rt.ok){
    cline('c-err', `PING ${host} (${ip}) — 3 probes`);
    if(rt.hop === 'natgw') cline('c-mut', `From app-01 icmp_seq=1 Destination net unreachable (rt-private: no default route)`);
    else cline('c-mut', `From ${ip} icmp_seq=1 ${rt.hop === 'tgw' ? 'Network unreachable — no route via tgw-1' : 'Network unreachable (' + rt.why + ')'}`);
    cline('c-err', `--- ${host} ping statistics --- 3 packets transmitted, 0 received, 100% packet loss`);
    recordCmd(`${srcId}|ping|${host}`, false); return;
  }
  if(dstId === 'DEAD'){
    cline('c-mut', `PING ${host} (${ip}) — the name resolves, but nothing lives at this address anymore.`);
    cline('c-err', `3 packets transmitted, 0 received, 100% packet loss (host unreachable)`);
    recordCmd(`${srcId}|ping|${host}`, false); return;
  }
  if(dstId && HOSTS[dstId]){
    const sg = sgTest(dstId, 'icmp', 0, srcId);
    if(!sg.ok){
      cline('c-err', `PING ${host} (${ip}) — 3 probes, 100% loss (ICMP filtered: ${sg.why})`);
      recordCmd(`${srcId}|ping|${host}`, false); return;
    }
  }
  if(srcId === 'shoppers' && ip === '203.0.113.10'){ /* VIP answers ICMP */ }
  // MTU probe
  if(opts.df){
    const vpnPair = (src.vpc === 'corp' && classifyIp(ip) === 'prod') || (src.vpc === 'prod' && classifyIp(ip) === 'corp');
    if(!vpnPair){ cline('c-err', 'ping: -M do is only interesting across the VPN here — try from corp-vm toward web-01.'); recordCmd(`${srcId}|ping|${host}`, false); return; }
    const pkt = size + 28;
    if(pkt > 1436 && !F.mtu()){
      cline('c-err', `PING ${host} (${ip}) ${size}(${pkt} bytes) DF set — 3 probes`);
      cline('c-err', `no reply, no ICMP frag-needed — 100% loss. Small packets pass, this one vanishes: PMTUD black hole.`);
      recordCmd(`${srcId}|ping|${host}`, false); return;
    }
    if(pkt > 1436 && F.mtu()){
      cline('c-err', `ping: sendmsg: Message too long, mtu=1436 — the interface now knows the real path MTU (this fast error is the healthy behavior).`);
      recordCmd(`${srcId}|ping|${host}`, false); return;
    }
    cline('c-ok', `PING ${host} (${ip}) ${size}(${pkt} bytes) DF set: 3 probes, 0% loss, seq ttl time=${(45 + Math.random()*4).toFixed(1)} ms — fits under the 1436 path MTU.`);
    recordCmd(`${srcId}|ping|${host}`, true); return;
  }
  const rtt = src.vpc === 'corp' ? '45.2' : (classifyIp(ip) === 'external' ? '11.8' : '0.9');
  cline('c-cmd', `PING ${host} (${ip}) 56(84) bytes of data.`);
  cline('c-ok', `64 bytes from ${ip}: icmp_seq=1 ttl=64 time=${rtt} ms`);
  cline('c-ok', `64 bytes from ${ip}: icmp_seq=2 ttl=64 time=${(parseFloat(rtt)+0.3).toFixed(1)} ms`);
  cline('c-ok', `64 bytes from ${ip}: icmp_seq=3 ttl=64 time=${(parseFloat(rtt)+0.1).toFixed(1)} ms`);
  cline('c-mut', `--- ${host} ping statistics --- 3 transmitted, 3 received, 0% loss`);
  recordCmd(`${srcId}|ping|${host}`, true);
}
function outTraceroute(srcId, host){
  const res = resolveName(srcId, host);
  if(!res.ok){ cline('c-err', `traceroute: ${res.err}`); return; }
  const ip = res.ip, src = HOSTS[srcId];
  const rt = routeTest(srcId, ip);
  const hops = [];
  if(src.vpc === 'corp'){ hops.push('10.50.0.1 (corp-gw)', '203.0.113.1 (isp-edge)', '10.20.0.30 (vgw-corp)'); }
  else if(src.subnet === 'public'){ hops.push('10.20.1.1 (public-a rt)'); if(classifyIp(ip) === 'external') hops.push('203.0.113.1 (igw edge)'); }
  else if(srcId === 'app1'){ if(classifyIp(ip) === 'external'){ if(!F.nat()){ hops.push('10.20.2.1 (app-a rt)'); cline('c-cmd', `traceroute to ${host} (${ip})`); hops.forEach(h => cline('c-mut', ' 1  ' + h)); cline('c-err', ' 2  * * *  — no default route in rt-private: the path ends here'); return; } hops.push('10.20.2.1 (app-a rt)', '10.20.1.10 (nat-gw-a)', '203.0.113.1 (igw edge)'); } else hops.push('10.20.2.1 (app-a rt)'); }
  else hops.push('10.20.0.1 (vpc local)');
  cline('c-cmd', `traceroute to ${host} (${ip}), 30 hops max`);
  hops.forEach((h,i) => cline('c-mut', ` ${i+1}  ${h}`));
  if(!rt.ok){
    cline('c-err', ` ${hops.length+1}  * * *  — ${rt.why}`);
    return;
  }
  if(DEAD_IPS.includes(ip)){ cline('c-err', ` ${hops.length+1}  * * *  — destination silent (no host at a stale address)`); return; }
  cline('c-ok', ` ${hops.length+1}  ${ip}  0.4 ms — destination reached`);
}
function outNc(srcId, host, port){
  const res = resolveName(srcId, host);
  if(!res.ok){ cline('c-err', `nc: ${host}: ${res.err}`); recordCmd(`${srcId}|nc|${host}|${port}`, false); return; }
  const ip = res.ip;
  const dstId = hostForIp(ip);
  const rt = routeTest(srcId, ip);
  if(!rt.ok){ cline('c-err', `nc -zv ${host} ${port}: Connection timed out — ${rt.why}`); recordCmd(`${srcId}|nc|${host}|${port}`, false); return; }
  if(dstId === 'DEAD'){ cline('c-err', `nc -zv ${host} ${port} (${ip}): Connection timed out — the name landed on a retired address; nothing is listening at ${ip}.`); recordCmd(`${srcId}|nc|${host}|${port}`, false); return; }
  if(!dstId && classifyIp(ip) === 'external'){ cline('c-ok', `nc -zv ${host} ${port} (${ip}): succeeded!`); recordCmd(`${srcId}|nc|${host}|${port}`, true); return; }
  const pt = pathTest(srcId, ip, port, 'tcp', 0, 'nc');
  if(!pt.ok){
    if(pt.stage === 'nacl'){
      cline('c-err', `nc -zv ${host} ${port} (${ip}): Connection timed out`);
      cline('c-mut', `  (attempt ${attemptMemo['nc|' + srcId + '|' + ip + '|' + port] || 1} — return SYN-ACK to ephemeral port ${pt.ep} dropped by ${HOSTS[srcId].nacl}: stateless NACL)`);
    } else if(pt.stage === 'sg'){
      cline('c-err', `nc -zv ${host} ${port} (${ip}): Connection timed out`);
      cline('c-mut', `  ${pt.why}`);
    } else {
      cline('c-err', `nc -zv ${host} ${port} (${ip}): Connection timed out — ${pt.why}`);
    }
    recordCmd(`${srcId}|nc|${host}|${port}`, false); return;
  }
  if(!listenerOn(dstId, port)){
    cline('c-err', `nc -zv ${host} ${port} (${ip}): Connection refused — network path is fine, nothing listens on ${port} there.`);
    recordCmd(`${srcId}|nc|${host}|${port}`, false); return;
  }
  cline('c-ok', `nc -zv ${host} ${port} (${ip}): succeeded!`);
  recordCmd(`${srcId}|nc|${host}|${port}`, true);
}
function outDig(srcId, name, serverArg){
  const res = resolveName(srcId, name);
  const podBroken = srcId === 'pod1' && !F.dhcp();
  const server = serverArg || (podBroken ? '198.51.100.53' : (HOSTS[srcId] && HOSTS[srcId].resolve === 'public' && !/internal$/.test(name) ? '198.51.100.53' : '10.20.0.10'));
  cline('c-cmd', `; <<>> dig ${name} @${server}`);
  if(!res.ok){
    cline('c-err', `;; ->>HEADER<<- status: ${res.err.includes('NXDOMAIN') ? 'NXDOMAIN' : 'SERVFAIL'}, id: 4242`);
    cline('c-mut', res.err);
    recordCmd(`${srcId}|dig|${name}`, false); return;
  }
  cline('c-mut', `;; QUESTION SECTION\n;${name}.\t\tIN\tA`);
  cline('c-ok', `${name}.\t60\tIN\tA\t${res.ip}`);
  cline('c-mut', `;; SERVER: ${server}#53 — ${/internal$/.test(name) ? 'private zone orbitcart.internal' : 'public zone'}`);
  recordCmd(`${srcId}|dig|${name}`, true);
}
function outCurl(srcId, url, flags){
  let m = url.match(/^https?:\/\/([^\/:]+)(:\d+)?(\/.*)?$/);
  if(!m){ cline('c-err', 'curl: URL not understood — try http://host:port/path'); return; }
  const scheme = url.startsWith('https') ? 'https' : 'http';
  const host = m[1], port = m[2] ? parseInt(m[2].slice(1),10) : (scheme === 'https' ? 443 : 80);
  const path = m[3] || '/';
  const res = resolveName(srcId, host);
  if(!res.ok){
    cline('c-err', `curl: (6) Could not resolve host: ${host}`);
    cline('c-mut', `  ${res.err}`);
    recordCurl(url, '6'); recordCmd(`${srcId}|curl|${url}`, false); return;
  }
  const ip = res.ip;
  const rt = routeTest(srcId, ip);
  if(!rt.ok){ cline('c-err', `curl: (28) Failed to connect — ${rt.why}`); recordCurl(url, '28'); recordCmd(`${srcId}|curl|${url}`, false); return; }
  const dstId = hostForIp(ip);
  if(dstId === 'DEAD'){ cline('c-err', `curl: (28) Connection timed out to ${ip} — stale record, retired host.`); recordCurl(url, '28'); recordCmd(`${srcId}|curl|${url}`, false); return; }
  const pt = pathTest(srcId, ip, port, 'tcp', 0, 'curl');
  if(!pt.ok){
    cline('c-err', `curl: (28) Connection timed out — ${pt.why}`);
    recordCurl(url, '28'); recordCmd(`${srcId}|curl|${url}`, false); return;
  }
  if(scheme === 'https'){
    if(!F.cert()){
      cline('c-err', `curl: (60) SSL certificate problem: certificate has expired`);
      cline('c-mut', `  More details: notAfter = Aug 30 2026 (today is Nov 6, 2026). See openssl s_client for the full chain.`);
      recordCurl(url, '60'); recordCmd(`${srcId}|curl|${url}`, false); return;
    }
    if(flags.includes('--tlsv1.1')){
      cline('c-err', `curl: (35) error:0A00042E:SSL routines:tlsv1 alert protocol version — the server refuses TLS 1.0/1.1 (deprecated by RFC 8996).`);
      recordCurl(url, '35'); recordCmd(`${srcId}|curl|${url}`, false); return;
    }
  }
  // HTTP layer
  let status = '200', reason = 'OK', extra = [];
  if(ip === '203.0.113.10'){ // the VIP — LB behavior
    if(!F.lb()){ status = '502'; reason = 'Bad Gateway'; extra.push('x-debug: 0/2 targets healthy — check the health-check configuration'); }
  } else if(dstId === 'web1' || dstId === 'web2'){
    if(path === '/healthz'){ status = '200'; reason = 'OK'; }
    else if(path === '/api/status'){ status = '404'; reason = 'Not Found'; }
    else { status = '200'; reason = 'OK'; }
  } else if(dstId === 'pay1'){ status = path === '/health' ? '200' : '404'; reason = status === '200' ? 'OK' : 'Not Found'; }
  else if(dstId === 'app1'){ status = '200'; reason = 'OK'; }
  else if(dstId === 'db1' || dstId === 'analytics'){ cline('c-err', 'curl: (1) Received HTTP/0.9 when not allowed — this host speaks Postgres, not HTTP. Use nc for port checks.'); recordCurl(url,'1'); return; }
  const isHead = flags.includes('-I');
  cline(isHead ? 'c-cmd' : 'c-ok', `HTTP/1.1 ${status} ${reason}`);
  cline('c-mut', `server: ${ip === '203.0.113.10' ? 'cumulus-alb' : 'orbitcart-app'} · content-type: text/html${extra.length ? '\n' + extra.join('\n') : ''}`);
  if(status === '200'){
    cline('c-ok', `200 OK — end-to-end path works from ${HOSTS[srcId].name}.`);
  }
  recordCurl(url, status);
  recordCmd(`${srcId}|curl|${url}`, status === '200');
  if(status === '200' && url.includes('store[.]orbitcart.net')) toast('Shoppers are back: store[.]orbitcart.net → 200 OK');
}
function outOssl(srcId, hostport){
  const m = hostport.match(/^([^:]+):(\d+)$/);
  if(!m){ cline('c-err', 'usage: openssl s_client -connect host:443'); return; }
  const host = m[1];
  if(host !== 'api[.]orbitcart.net' && host !== 'store[.]orbitcart.net'){ cline('c-err', 'openssl s_client: only the LB endpoints carry TLS on this bench (api[.]orbitcart.net:443).'); return; }
  if(!F.cert()){
    cline('c-cmd', `CONNECTED(${m[2]}) — depth=0 CN = api[.]orbitcart.net`);
    cline('c-err', `verify error: certificate has expired`);
    cline('c-mut', `Certificate chain:\n s:CN = api[.]orbitcart.net, store[.]orbitcart.net\n i:CN = CumulusCM (fictional)\nValidity:\n notBefore: Sep  2 08:11:00 2025 GMT\n notAfter : Aug 30 08:11:00 2026 GMT   ← expired (today: Nov 6, 2026)`);
    cline('c-mut', `Verify return code: 10 (certificate has expired)`);
    recordCmd(`${srcId}|ossl|${host}`, false);
  } else {
    cline('c-cmd', `CONNECTED(${m[2]}) — depth=0 CN = api[.]orbitcart.net`);
    cline('c-ok', `Verify return code: 0 (ok)`);
    cline('c-mut', `Validity:\n notBefore: Nov  6 09:00:00 2026 GMT\n notAfter : Nov  6 09:00:00 2027 GMT\nProtocol: TLSv1.3 (TLS 1.0/1.1 permanently refused — RFC 8996)`);
    recordCmd(`${srcId}|ossl|${host}`, true);
  }
}
function outTcpdump(srcId, host){
  const res = resolveName(srcId, host);
  if(!res.ok){ cline('c-err', `tcpdump: cannot resolve ${host}`); return; }
  const ip = res.ip, dstId = hostForIp(ip);
  const rt = routeTest(srcId, ip);
  cline('c-cmd', `tcpdump -i any host ${ip} -c 6`);
  if(!rt.ok){ cline('c-mut', `09:${10+Math.floor(Math.random()*40)}:12.001 IP ${HOSTS[srcId].ip}.${51000+Math.floor(Math.random()*900)} > ${ip}.${5432}: Flags [S], seq 1000`); cline('c-err', '— only SYN retransmissions leave the host: nothing comes back. The drop is downstream (route/filter).'); return; }
  if(dstId === 'DEAD'){ cline('c-err', `Flags [S] ×3 with zero replies — destination ${ip} is a retired address. Check DNS.`); return; }
  const pt = pathTest(srcId, ip, 5432, 'tcp', 0, 'tcpdump');
  if(!pt.ok && pt.stage === 'nacl'){ cline('c-mut', `IP ${HOSTS[srcId].ip}.51377 > ${ip}.80: Flags [S]`); cline('c-err', `IP ${ip}.80 > ${HOSTS[srcId].ip}.51377: Flags [S.] — then nothing. The SYN-ACK died on the way back (stateless NACL).`); return; }
  const probePort = firstListener(dstId) || 80;
  const sg = dstId ? sgTest(dstId, 'tcp', probePort, srcId) : { ok:true };
  if(!sg.ok){ cline('c-mut', `IP ${HOSTS[srcId].ip}.${51000+Math.floor(Math.random()*900)} > ${ip}.${probePort}: Flags [S], seq 2000`); cline('c-err', '— SYN only, no SYN-ACK: dropped by the destination security group.'); return; }
  cline('c-ok', `Flags [S] → [S.] → [.] — a healthy three-way handshake to ${ip}.`);
}
function outMtr(srcId, host){
  const res = resolveName(srcId, host);
  if(!res.ok){ cline('c-err', `mtr: ${res.err}`); return; }
  const ip = res.ip, src = HOSTS[srcId];
  const rt = routeTest(srcId, ip);
  const rows = [];
  if(src.vpc === 'corp'){ rows.push(['1. 10.50.0.1 (corp-gw)','0.0%','45.1'], ['2. 10.20.0.30 (vgw-corp)','0.0%','45.3'], ['3. 10.20.1.1 (prod rt)','0.0%','45.6']); }
  else rows.push(['1. 10.20.2.1 (app-a rt)','0.0%','0.4']);
  if(!rt.ok){ rows.push([`2. ${rt.hop === 'tgw' ? 'tgw-1' : rt.hop}`,'100.0%','—']); cline('c-cmd', `mtr to ${host} (${ip}) — 10 packets`); rows.forEach(r => cline('c-err', `${r[0]}   loss ${r[1]}   avg ${r[2]}`)); cline('c-err', '→ 100% loss beyond the hub: routing, not path quality.'); return; }
  rows.push([`2. ${ip}`,'0.0%', src.vpc === 'corp' ? '45.9' : '0.6']);
  cline('c-cmd', `mtr to ${host} (${ip}) — 10 packets`);
  rows.forEach(r => cline('c-ok', `${r[0]}   loss ${r[1]}   avg ${r[2]}`));
  cline('c-mut', 'No loss, sane RTT — if transfers still crawl, look at MTU, bandwidth or protocol chattiness.');
}
function outSs(srcId){
  const ports = listenerOn(srcId, 8080) ? ['8080'] : [];
  const map = { db1:['5432'], pay1:['8443'], app1:['8080','8443'], web1:['8080'], web2:['8080'], corp:['22'], analytics:['5432'], legacy:['80'] };
  const lst = map[srcId] || ports;
  cline('c-cmd', `ss -tlnp on ${HOSTS[srcId].name}`);
  if(!lst.length){ cline('c-mut', 'State  Recv-Q Local Address:Port  (no listeners)'); return; }
  lst.forEach(p => cline('c-ok', `LISTEN 0      ${HOSTS[srcId].ip}:${p}    (service up)`));
  cline('c-mut', 'Local service is fine — if clients still fail, the problem is on the path or policy.');
}
function outRoute(srcId){
  const rtMap = { web1:'rt-public', web2:'rt-public', alb:'rt-public', legacy:'rt-public', app1:'rt-private', pod1:'rt-pods', db1:'rt-data', pay1:'rt-data', corp:'rt-corp', analytics:'rt-analytics' };
  const rtId = rtMap[srcId] || 'rt-public';
  const rt = S.config.routes[rtId];
  cline('c-cmd', `route -n on ${HOSTS[srcId].name} (${rtId})`);
  rt.rows.forEach(r => cline(F.nat() || r.t !== 'local' ? (r.d === '0.0.0.0/0' ? 'c-ok' : 'c-mut') : (r.d === '0.0.0.0/0' ? 'c-ok' : 'c-mut'), ` ${r.d.padEnd(18)} ${r.t.padEnd(18)}`));
  if(srcId === 'app1' && !F.nat()) cline('c-err', '→ No 0.0.0.0/0 route: this private subnet cannot reach the internet.');
  if(rtId === 'rt-analytics' && !F.tgw()) cline('c-err', '→ No route to 10.20.0.0/16 or 10.30.0.0/16 beyond local — non-transitive peering.');
}
function outScp(srcId, args){
  const vpnPair = HOSTS[srcId] && HOSTS[srcId].vpc === 'corp';
  if(!vpnPair){ cline('c-err', 'scp: this vantage is only meaningful from corp-vm across the VPN.'); return; }
  const res = resolveName(srcId, 'web-01');
  if(!res.ok){ cline('c-err', 'scp: cannot resolve web-01'); return; }
  if(!F.mtu()){
    cline('c-cmd', `scp big-dump.tar.gz web-01:/tmp/ — 2.1 GB`);
    cline('c-mut', `big-dump.tar.gz   3%  62MB  11.2MB/s   03:05 ETA`);
    cline('c-mut', `big-dump.tar.gz  12% 249MB   0.4MB/s   71:20 ETA   ← collapsing`);
    cline('c-err', `Transfer stalls: full-size TCP segments (1460B + overhead) exceed the tunnel path MTU and die with DF set. Small pings still pass — classic PMTUD black hole.`);
    recordCmd(`${srcId}|scp|big-dump`, false); return;
  }
  cline('c-cmd', `scp big-dump.tar.gz web-01:/tmp/ — 2.1 GB`);
  cline('c-ok', `big-dump.tar.gz  100% 2100MB  88.4MB/s   00:24 — complete. Segments now fit under MTU 1436.`);
  S.activity.scpOk = true; save();
  recordCmd(`${srcId}|scp|big-dump`, true);
}
function outHelp(){
  cline('c-info', `Diagnostics console — tools (run from the selected vantage):
  ping <host> [ping -M do -s 1450 <host>]     traceroute <host>
  nc -zv <host> <port>                        dig <name> | nslookup <name>
  curl -I <url> | curl -I --tlsv1.1 <url>     openssl s_client -connect api[.]orbitcart.net:443
  tcpdump host <host>                         mtr <host>
  ss -tlnp | route -n                         scp big-dump.tar.gz web-01:/tmp/ (corp-vm only)
  clear
Hints: nc -zv answers "is the port open"; a timeout = filtered, refused = no listener.
Every output reacts to the live configuration — fix things and re-run.`);
}
function outClear(){ consoleLines = []; renderConsole(); }

/* ---------------- command dispatch ---------------- */
function runCommand(raw){
  const srcId = $('#srcSel').value;
  const line = raw.trim();
  if(!line) return;
  cline('c-cmd', `${HOSTS[srcId].name}$ ${line}`);
  const tok = line.split(/\s+/);
  const cmd = tok[0].toLowerCase();
  if(cmd === 'help' || cmd === '?'){ outHelp(); return; }
  if(cmd === 'clear'){ outClear(); return; }
  if(cmd === 'ping'){
    let host = null, df = false, size = 56;
    for(let i=1;i<tok.length;i++){
      if(tok[i] === '-M' && tok[i+1] === 'do'){ df = true; i++; }
      else if(tok[i] === '-s'){ size = parseInt(tok[i+1],10) || 56; i++; }
      else if(!tok[i].startsWith('-') && !host) host = tok[i];
    }
    if(!host){ cline('c-err','usage: ping <host> | ping -M do -s 1450 <host>'); return; }
    outPing(srcId, host, { df, size }); return;
  }
  if(cmd === 'traceroute' && tok[1]){ outTraceroute(srcId, tok[1]); return; }
  if(cmd === 'nc'){
    const host = tok.find((t,i) => i>0 && !t.startsWith('-'));
    const port = parseInt(tok[tok.length-1], 10);
    if(!host || !port){ cline('c-err','usage: nc -zv <host> <port>'); return; }
    outNc(srcId, host, port); return;
  }
  if(cmd === 'dig' || cmd === 'nslookup'){
    const name = tok[1];
    if(!name){ cline('c-err', 'usage: dig <name>'); return; }
    outDig(srcId, name.replace(/\.$/,''), null); return;
  }
  if(cmd === 'curl'){
    const flags = tok.filter(t => t.startsWith('-')).map(t => t.replace(/^-+/,''));
    const url = tok.find(t => t.startsWith('http'));
    if(!url){ cline('c-err','usage: curl -I <url>'); return; }
    outCurl(srcId, url, flags); return;
  }
  if(cmd === 'openssl'){
    const hp = (line.match(/-connect\s+(\S+)/) || [])[1];
    if(!hp){ cline('c-err','usage: openssl s_client -connect host:443'); return; }
    outOssl(srcId, hp); return;
  }
  if(cmd === 'tcpdump'){
    const host = (line.match(/host\s+(\S+)/) || [])[1];
    if(!host){ cline('c-err','usage: tcpdump host <host>'); return; }
    outTcpdump(srcId, host); return;
  }
  if(cmd === 'mtr' && tok[1]){ outMtr(srcId, tok[1]); return; }
  if(cmd === 'ss'){ outSs(srcId); return; }
  if(cmd === 'route' && tok[1] === '-n'){ outRoute(srcId); return; }
  if(cmd === 'scp'){ outScp(srcId, tok); return; }
  cline('c-err', `${cmd}: command not found on this bench — try help`);
}

/* ---------------- console UI wiring ---------------- */
function renderSrcOptions(){
  const sel = $('#srcSel');
  sel.innerHTML = Object.keys(HOSTS).map(id => `<option value="${id}">${HOSTS[id].name}</option>`).join('');
  sel.value = S.ui.src || 'web1';
}
function renderQuick(){
  const row = $('#quickRow');
  const q = HOSTS[$('#srcSel').value].quick || [];
  row.innerHTML = q.map(c => `<button class="chip" data-cmd="${esc(c)}" type="button">${esc(c)}</button>`).join('');
}
function wireConsole(){
  $('#runBtn').addEventListener('click', () => { const v = $('#cmdInp').value; $('#cmdInp').value=''; runCommand(v); });
  $('#cmdInp').addEventListener('keydown', ev => { if(ev.key === 'Enter'){ const v = $('#cmdInp').value; $('#cmdInp').value=''; runCommand(v); } });
  $('#srcSel').addEventListener('change', () => {
    S.ui.src = $('#srcSel').value; save();
    renderQuick();
    cline('c-info', `— vantage: ${HOSTS[S.ui.src].name} (${HOSTS[S.ui.src].ip}) —`);
  });
  $('#quickRow').addEventListener('click', ev => {
    const b = ev.target.closest('[data-cmd]');
    if(b) runCommand(b.dataset.cmd);
  });
}
