/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* Traffic simulation, schematic canvas, inspector panel, title/brief, drawer panes, Field Notes, glossary, mode gate, confirm dialog */
/* ============================ TRAFFIC SIM ============================ */
function tunnelStatus(){
  const v = S.world.vpn;
  if(!v.exists) return {up:false, note:"VPN connection not created"};
  const a = v.tunnelA === "UP", b = v.tunnelB === "UP";
  if(!a && !b) return {up:false, note:"both tunnels are down"};
  return {up:true, which: a ? "Tunnel A" : "Tunnel B (failover)",
          note: (a && b) ? "both tunnels UP — redundancy in place" : "single tunnel UP — no redundancy (HA gap)"};
}
function naclOfSubnet(sub){ return sub==="APP-A" ? "NACL-APP" : sub==="STAGE-A" ? null : (sub && sub.startsWith("PUBLIC") ? "NACL-PUBLIC" : null); }

function simulate(src, dst, port){
  const w = S.world;
  const hops = [];
  const push = (name, ok, note) => hops.push({name, ok, note});
  if(dst === "db.meridian.internal") return dnsSim(src);
  const srcH = HOSTS[src], dstH = HOSTS[dst];
  if(!srcH || !dstH) return {ok:false, hops:[{name:"resolve endpoints", ok:false, note:"unknown endpoint"}], summary:"Unknown endpoint."};
  const dstRT = RT_OF_SUBNET[dstH.subnet];
  push("endpoints", true, `${srcH.label} ${srcH.ip} → ${dstH.label} ${dstH.ip} tcp/${port}`);

  if(srcH.net === "INTERNET" && dstH.net === "PROD"){
    push("internet gateway", !!w.vpc.igw, w.vpc.igw ? "IGW attached to VPC-PROD" : "IGW not attached — internet traffic cannot enter");
    push(`return route in ${dstRT}`, rtHasRoute(dstRT,"0.0.0.0/0","IGW"), rtHasRoute(dstRT,"0.0.0.0/0","IGW") ? "0.0.0.0/0 → IGW present (replies can leave)" : `no 0.0.0.0/0 → IGW route in ${dstRT}`);
    const na = naclEval("NACL-PUBLIC", port, "in"); push("NACL-PUBLIC IN", na.ok, na.note);
    const sg = sgAllows(dstH.sg, port, srcH.ip, null); push("security group", sg.ok, sg.note);
    const na2 = naclEval("NACL-PUBLIC", 51222, "out"); push("NACL-PUBLIC OUT (return)", na2.ok, na2.note);
  } else if(srcH.net === "HQDC" && dstH.net === "PROD"){
    const er = w.edge.routes.find(r => norm(r.dst) === "10.10.0.0/16");
    push("HQ-EDGE route", !!er, er ? `10.10.0.0/16 → ${er.tgt} on the on-prem edge` : "HQ-EDGE has no route to 10.10.0.0/16 — packets never leave HQ");
    const t = tunnelStatus(); push("VPN tunnel", t.up, t.note);
    if(t.up) push("VPN path detail", true, `traffic uses ${t.which}; IKE ${w.vpn.ike||"—"}, ${w.vpn.routing||"—"} routing`);
    push("VGW", !!w.vgw.attached, w.vgw.attached ? "VGW attached to VPC-PROD" : "VGW not attached — tunnel terminates nowhere");
    push(`return route in ${dstRT}`, rtHasRoute(dstRT,"192.168.50.0/24","VGW"), rtHasRoute(dstRT,"192.168.50.0/24","VGW") ? "192.168.50.0/24 → VGW present (replies reach HQ)" : `no 192.168.50.0/24 → VGW route in ${dstRT} — reply path broken`);
    const naName = naclOfSubnet(dstH.subnet);
    if(naName){ const na = naclEval(naName, port, "in"); push(`${naName} IN`, na.ok, na.note); }
    const sg = sgAllows(dstH.sg, port, srcH.ip, null); push("security group", sg.ok, sg.note);
    if(naName){ const na2 = naclEval(naName, 51222, "out"); push(`${naName} OUT (return)`, na2.ok, na2.note); }
  } else if(srcH.net === "STAGE" && dstH.net === "PROD"){
    push("peering", !!w.peer.accepted, w.peer.accepted ? "peering ACCEPTED" : "peering not established");
    push("STAGE-RT route", rtHasRoute("STAGE-RT","10.10.0.0/16","PEER"), rtHasRoute("STAGE-RT","10.10.0.0/16","PEER") ? "10.10.0.0/16 → PEER present" : "STAGE-RT has no route to 10.10.0.0/16 via PEER");
    push(`return route in ${dstRT}`, rtHasRoute(dstRT,"10.20.0.0/16","PEER"), rtHasRoute(dstRT,"10.20.0.0/16","PEER") ? "10.20.0.0/16 → PEER present" : `${dstRT} has no route back to 10.20.0.0/16 via PEER`);
    const naName = naclOfSubnet(dstH.subnet);
    if(naName){ const na = naclEval(naName, port, "in"); push(`${naName} IN`, na.ok, na.note); }
    const sg = sgAllows(dstH.sg, port, srcH.ip, srcH.sg); push("security group", sg.ok, sg.note);
    if(naName){ const na2 = naclEval(naName, 51222, "out"); push(`${naName} OUT (return)`, na2.ok, na2.note); }
  } else if(srcH.net === "PROD" && dstH.net === "PROD"){
    push("local route", true, "VPC local route always present (simplified)");
    const naName = naclOfSubnet(dstH.subnet);
    if(naName){ const na = naclEval(naName, port, "in"); push(`${naName} IN`, na.ok, na.note); }
    const sg = sgAllows(dstH.sg, port, srcH.ip, srcH.sg); push("security group", sg.ok, sg.note);
  } else {
    return {ok:false, hops:[{name:"path class", ok:false, note:"this path is not part of the designed topology — check the requirements doc"}], summary:"Unsupported path for this exercise."};
  }
  const ok = hops.every(h => h.ok);
  return {ok, hops, summary: ok ? "FLOW PASSES ✓" : "FLOW BLOCKED ✗ — first failing hop is highlighted"};
}
function dnsSim(src){
  const w = S.world, hops = [];
  const push = (name, ok, note) => hops.push({name, ok, note});
  push("private zone", !!w.dns.zone, w.dns.zone ? `zone ${w.dns.zone} exists` : "no private hosted zone created");
  push("VPC association", !!w.dns.assoc, w.dns.assoc ? "associated with VPC-PROD" : "zone not associated — names do not resolve in the VPC");
  const rec = w.dns.records.find(r => norm(r.name) === "db");
  push("record db", !!rec, rec ? `db.${w.dns.zone||""} → ${rec.ip||"(no value)"}` : "no record named db");
  const recOk = rec && norm(rec.ip) === "10.10.21.10";
  push("resolution check", !!recOk, rec ? (recOk ? "resolves to the approved data-tier address 10.10.21.10" : `WRONG/stale value ${rec.ip} — approved address is 10.10.21.10`) : "nothing to resolve");
  const ok = hops.every(h => h.ok);
  return {ok, hops, summary: ok ? "DNS RESOLUTION ✓ → 10.10.21.10" : "DNS RESOLUTION FAILED ✗"};
}

/* ============================ CANVAS ============================ */
function nodeStatus(id){
  const w = S.world;
  switch(id){
    case "CGW": return {ghost:!w.cgw.ip, sub:w.cgw.ip ? w.cgw.ip : "not configured"};
    case "VPN": {
      const v=w.vpn;
      const dot = s => s==="UP" ? "#1b6e43" : s==="DOWN" ? "#a53127" : "#9aa7b4";
      return {ghost:!v.exists, sub: v.exists ? `IKE ${v.ike||"—"} · ${v.routing||"—"}` : "not deployed",
              dots: v.exists ? [{x:10,c:dot(v.tunnelA),t:"Tunnel A "+v.tunnelA},{x:26,c:dot(v.tunnelB),t:"Tunnel B "+v.tunnelB}] : []};
    }
    case "VGW": return {ghost:!w.vgw.attached, sub:w.vgw.attached ? "attached" : "not attached"};
    case "IGW": return {ghost:!w.vpc.igw, sub:w.vpc.igw ? "attached" : "not attached"};
    case "VPC": return {ghost:false, sub:"CIDR " + (w.vpc.cidr||"— not set —")};
    case "SUB_WA": case "SUB_WB": case "SUB_APP": case "SUB_DB": {
      const key = {"SUB_WA":"PUBLIC-WEB-A","SUB_WB":"PUBLIC-WEB-B","SUB_APP":"APP-A","SUB_DB":"DB-A"}[id];
      const s = w.subnets[key];
      return {ghost:!s.cidr, sub: s.cidr ? `${s.cidr} · ${s.az||"—"} · ${s.type||"—"}` : "not configured"};
    }
    case "NAT": return {ghost:!w.nat.deployed, sub:w.nat.deployed ? "in " + (w.nat.subnet||"—") : "not deployed"};
    case "DNS": return {ghost:!w.dns.zone, sub:w.dns.zone ? w.dns.zone + (w.dns.assoc ? " · assoc" : " · NOT assoc") : "no private zone"};
    case "MON": return {ghost:false, sub:`logs ${w.monitor.flowLogs?"ON":"OFF"} · alarms ${w.monitor.vpnAlarms?"ON":"OFF"}`};
    case "RT_PUB": return {ghost:false, sub:w.rts["PUBLIC-RT"].routes.length + " routes"};
    case "RT_APP": return {ghost:false, sub:w.rts["APP-RT"].routes.length + " routes"};
    case "RT_DB": return {ghost:false, sub:w.rts["DB-RT"].routes.length + " routes"};
    case "RT_STAGE": return {ghost:false, sub:w.rts["STAGE-RT"].routes.length + " routes"};
    case "SG_WEB": return {ghost:false, sub:w.sg["SG-WEB"].rules.length + " rules"};
    case "SG_APP": return {ghost:false, sub:w.sg["SG-APP"].rules.length + " rules"};
    case "SG_DB": return {ghost:false, sub:w.sg["SG-DB"].rules.length + " rules"};
    case "PEER": return {ghost:false, sub:w.peer.accepted ? "ACCEPTED" : w.peer.requested ? "PENDING" : "not requested"};
    case "NACL_P": return {ghost:false, sub:`IN ${w.nacl["NACL-PUBLIC"].in.length} · OUT ${w.nacl["NACL-PUBLIC"].out.length}`};
    case "NACL_A": return {ghost:false, sub:`IN ${w.nacl["NACL-APP"].in.length} · OUT ${w.nacl["NACL-APP"].out.length}`};
    case "HQEDGE": return {ghost:false, sub:w.edge.routes.length + " static routes"};
    case "STAGE": return {ghost:false, sub:"10.20.0.0/16 · pre-existing"};
    case "SUB_STAGE": return {ghost:false, sub:"10.20.1.0/24 · AZ-1"};
    case "INTERNET": return {ghost:false, sub:"synthetic 192.0.2.0/24"};
    case "CRM": return {ghost:false, sub:"192.168.50.20"};
    case "LDB": return {ghost:false, sub:"192.168.50.35"};
    default: return {ghost:false, sub:""};
  }
}
function renderCanvas(){
  const w = S.world;
  const line = (x1,y1,x2,y2,cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="edge ${cls}"/>`;
  let edges = "";
  edges += line(640,72,742,96, w.vpc.igw ? "live" : "ghost");
  edges += line(765,146,765,170, w.vpc.igw ? "live" : "ghost");
  edges += line(194,151,238,154, w.cgw.ip ? "live" : "ghost");
  const ta = w.vpn.tunnelA==="UP" ? "tunnel anim" : w.vpn.tunnelA==="DOWN" ? "bad" : "ghost";
  const tb = w.vpn.tunnelB==="UP" ? "tunnel anim" : w.vpn.tunnelB==="DOWN" ? "bad" : "ghost";
  edges += line(356,146,378,140, w.vpn.exists ? ta : "ghost");
  edges += line(356,166,378,164, w.vpn.exists ? tb : "ghost");
  edges += line(504,146,526,150, w.vpn.exists ? "tunnel" : "ghost");
  edges += line(644,154,650,170, w.vgw.attached ? "live" : "ghost");
  edges += line(115,184,115,236, "live");
  edges += line(115,290,115,308, "live");
  edges += line(700,598,847,650, w.peer.accepted ? "live" : "ghost");
  let svg = `<rect x="${REGION.x}" y="${REGION.y}" width="${REGION.w}" height="${REGION.h}" fill="none" stroke="#7f92ab" stroke-dasharray="10 6" stroke-width="1.5" rx="8"/>
    <text class="region-t" x="${REGION.x+10}" y="${REGION.y+22}">NIMBUSCLOUD · REGION US-CENTRAL</text>`;
  svg += `<text class="region-t" x="36" y="106" style="fill:#8a5a00">MERIDIAN HQ-DC · ON-PREMISES</text>`;
  svg += edges;
  for(const id in N){
    const n = N[id], st = nodeStatus(id);
    const sel = S.ui.sel === id ? "sel" : "";
    const h = n.h, wdt = n.w;
      const dots = (st.dots||[]).map(d=>`<circle cx="${n.x+wdt-d.x}" cy="${n.y+h-8}" r="4" fill="${d.c}"><title>${d.t}</title></circle>`).join("");
    svg += `<g class="node ${sel}" data-node="${id}" tabindex="0" role="button" aria-label="${esCape(n.label)} — ${esCape(st.sub)}">
      <title>${esCape(n.label)}: ${esCape(st.sub)} — select to configure</title>
      <rect class="frame ${st.ghost?"ghost":""}" x="${n.x}" y="${n.y}" width="${wdt}" height="${h}" rx="5"/>
      <text class="nlabel" x="${n.x+10}" y="${n.y+18}">${esCape(n.label)}</text>
      <text class="nsub" x="${n.x+10}" y="${n.y+34}">${esCape(st.sub)}</text>
      <text class="ntag" x="${n.x+10}" y="${n.y+h-9}" fill="#8a5a00" style="fill:#8a5a00">${esCape(n.tag)}</text>
      ${dots}</g>`;
  }
  $id("board").innerHTML = svg;
}

/* ============================ INSPECTOR ============================ */
function renderInspector(){
  const sel = S.ui.sel;
  const box = $id("inspector");
  if(!sel){ box.innerHTML = `<h3>Inspector</h3><p class="hinttext">Select any element on the drawing — a subnet, a route table, the VPN, a security group — to configure it here. Ghosted (dashed) elements are not deployed yet.</p>`; return; }
  const n = N[sel], kind = NODE_KIND[sel];
  let html = `<h3>${esCape(n.label)}</h3><p class="hinttext" style="margin:2px 0 8px">${BLURB[kind]||""}</p>`;
  if(kind==="vpc"){
    html += `<label>VPC CIDR block</label><input id="inVpcCidr" value="${esCape(S.world.vpc.cidr||"")}" placeholder="10.10.0.0/16" aria-label="VPC CIDR block">
      <div class="row mt"><button class="btn ${S.world.vpc.igw?"danger":""}" id="btnIgw">${S.world.vpc.igw?"Detach internet gateway":"Attach internet gateway"}</button>
      <span class="stamp ${S.world.vpc.igw?"green":"amber"}">${S.world.vpc.igw?"IGW attached":"no IGW"}</span></div>`;
  } else if(kind==="subnet"){
    const key = SUBNET_KEY[sel], s = S.world.subnets[key];
    html += `<label>Subnet CIDR</label><input id="inSubCidr" value="${esCape(s.cidr||"")}" placeholder="10.10.x.0/24" aria-label="subnet CIDR">
      <div class="row mt"><div style="flex:1;min-width:110px"><label>Availability zone</label><select id="inSubAz" aria-label="availability zone"><option value="">—</option><option>AZ-1</option><option>AZ-2</option></select></div>
      <div style="flex:1;min-width:120px"><label>Subnet type</label><select id="inSubType" aria-label="subnet type"><option value="">—</option><option>public</option><option>private</option><option>isolated</option></select></div></div>
      <p class="hinttext mt">Host in this subnet: <b class="mono">${key==="PUBLIC-WEB-A"?"PROD-WEB 10.10.1.10":key==="PUBLIC-WEB-B"?"— (spare web node)":key==="APP-A"?"PROD-APP 10.10.11.10":"PROD-DB 10.10.21.10"}</b></p>`;
  } else if(kind==="rt"){
    const key = RT_KEY[sel], rt = S.world.rts[key];
    html += `<div class="ledger-head">Routes · associated: ${SUBNET_OF_RT[key].join(", ")}</div><div id="rtLedger" class="ledger">`;
    rt.routes.forEach((r,i)=>{
      html += `<div class="ledger-row" style="grid-template-columns:1fr 1fr auto">
        <input class="lr-mono rt-dst" data-i="${i}" value="${esCape(r.dst)}" aria-label="destination CIDR" placeholder="0.0.0.0/0">
        <select class="rt-tgt" data-i="${i}" aria-label="target">${TARGET_OPTS.map(t=>`<option ${t===r.tgt?"selected":""}>${t}</option>`).join("")}</select>
        <button class="btn small danger rt-del" data-i="${i}" aria-label="remove route">✕</button></div>`;
    });
    html += `</div><button class="btn small mt" id="rtAdd">+ Add route</button>`;
  } else if(kind==="sg"){
    const key = SG_KEY[sel], sg = S.world.sg[key];
    html += `<div class="ledger-head">Inbound rules (stateful — no return rules needed)</div><div id="sgLedger" class="ledger">`;
    sg.rules.forEach((r,i)=>{
      html += `<div class="ledger-row" style="grid-template-columns:80px 1fr auto">
        <input class="lr-mono sg-port" data-i="${i}" value="${esCape(r.port)}" aria-label="port or range" placeholder="443">
        <input class="lr-mono sg-src" data-i="${i}" value="${esCape(r.src)}" aria-label="source CIDR or SG reference" list="srcSuggest" placeholder="0.0.0.0/0 or SG-APP">
        <button class="btn small danger sg-del" data-i="${i}" aria-label="remove rule">✕</button></div>`;
    });
    html += `</div><button class="btn small mt" id="sgAdd">+ Add rule</button>
      <datalist id="srcSuggest"><option>0.0.0.0/0</option><option>192.168.50.0/24</option><option>10.20.0.0/16</option><option>SG-WEB</option><option>SG-APP</option><option>SG-STAGE</option></datalist>
      <p class="hinttext mt">Source can be a CIDR (e.g. 192.168.50.0/24) or a security-group reference (e.g. SG-APP).</p>`;
  } else if(kind==="nacl"){
    const key = NACL_KEY[sel], na = S.world.nacl[key];
    const rowsOf = (dir) => na[dir].map((r,i)=>`<div class="ledger-row" style="grid-template-columns:56px 90px 1fr auto">
        <input class="lr-mono ${dir}-rule" data-dir="${dir}" data-i="${i}" value="${esCape(r.rule)}" aria-label="rule number" placeholder="100">
        <select class="${dir}-act" data-dir="${dir}" data-i="${i}" aria-label="action"><option ${r.act==="ALLOW"?"selected":""}>ALLOW</option><option ${r.act==="DENY"?"selected":""}>DENY</option></select>
        <input class="lr-mono ${dir}-port" data-dir="${dir}" data-i="${i}" value="${esCape(r.port)}" aria-label="port range" placeholder="443 or 1024-65535">
        <button class="btn small danger ${dir}-del" data-dir="${dir}" data-i="${i}" aria-label="remove rule">✕</button></div>`).join("");
    html += `<div class="ledger-head">INBOUND (requests entering the subnet)</div><div class="ledger">${rowsOf("in")||'<p class="hinttext">empty — simplified default allow; add explicit rules per requirements</p>'}</div>
      <button class="btn small mt in-add" data-dir="in">+ Add inbound rule</button>
      <div class="ledger-head">OUTBOUND (including RETURN traffic!)</div><div class="ledger">${rowsOf("out")||'<p class="hinttext">empty — simplified default allow; remember ephemeral ports 1024-65535</p>'}</div>
      <button class="btn small mt out-add" data-dir="out">+ Add outbound rule</button>`;
  } else if(kind==="vpn"){
    const v = S.world.vpn;
    if(!v.exists){
      html += `<label>IKE version</label><select id="inIke"><option>IKEv1</option><option selected>IKEv2</option></select>
        <label>Routing over the tunnel</label><select id="inRouting"><option selected>STATIC</option><option>BGP</option></select>
        <label id="lblAsn">BGP ASN (ours)</label><input id="inAsn" placeholder="65010">
        <div class="row mt"><button class="btn primary" id="btnVpnCreate">Create site-to-site connection</button></div>
        <p class="hinttext mt">Creating the connection brings up Tunnel A. Tunnel B stays disabled until you enable it — that is your HA gap.</p>`;
    } else {
      html += `<div class="ledger-head">Tunnel status</div>
        <div class="row mt"><span class="stamp ${v.tunnelA==="UP"?"green":"red"}">Tunnel A ${v.tunnelA}</span>
        <span class="stamp ${v.tunnelB==="UP"?"green":"red"}">Tunnel B ${v.tunnelB}</span></div>
        <label>Tunnel A state</label><select id="inTunnelA"><option ${v.tunnelA==="UP"?"selected":""}>UP</option><option ${v.tunnelA==="DOWN"?"selected":""}>DOWN</option><option ${v.tunnelA==="DISABLED"?"selected":""}>DISABLED</option></select>
        <label>Tunnel B state</label><select id="inTunnelB"><option ${v.tunnelB==="UP"?"selected":""}>UP</option><option ${v.tunnelB==="DOWN"?"selected":""}>DOWN</option><option ${v.tunnelB==="DISABLED"?"selected":""}>DISABLED</option></select>
        <label>IKE version</label><select id="inIke2"><option ${v.ike==="IKEv1"?"selected":""}>IKEv1</option><option ${v.ike==="IKEv2"?"selected":""}>IKEv2</option></select>
        <label>Routing over the tunnel</label><select id="inRouting2"><option ${v.routing==="STATIC"?"selected":""}>STATIC</option><option ${v.routing==="BGP"?"selected":""}>BGP</option></select>
        <label>BGP ASN (ours)</label><input id="inAsn2" value="${esCape(v.asn||"")}" placeholder="65010">
        <p class="hinttext mt">Requirements: IKEv2 · BGP ASN 65010 · BOTH tunnels UP.</p>`;
    }
  } else if(kind==="peer"){
    const p = S.world.peer;
    html += `<p>Status: <span class="stamp ${p.accepted?"green":p.requested?"amber":"red"}">${p.accepted?"ACCEPTED":p.requested?"PENDING — needs acceptance":"NOT REQUESTED"}</span></p>
      <div class="row mt"><button class="btn" id="btnPeerReq" ${p.requested?"disabled":""}>Request peering</button>
      <button class="btn" id="btnPeerAcc" ${p.requested&&!p.accepted?"":"disabled"}>Accept peering</button></div>
      <p class="hinttext mt">Acceptance alone routes nothing — add peer routes on BOTH route tables (see NET-CHG-2411 §4).</p>`;
  } else if(kind==="dns"){
    const d = S.world.dns;
    html += `<label>Private zone name</label><input id="inZone" value="${esCape(d.zone||"")}" placeholder="meridian.internal">
      <div class="row mt"><button class="btn ${d.assoc?"danger":""}" id="btnAssoc" ${d.zone?"":"disabled"}>${d.assoc?"Disassociate from VPC-PROD":"Associate with VPC-PROD"}</button></div>
      <div class="ledger-head">Records</div><div id="dnsLedger" class="ledger">`;
    d.records.forEach((r,i)=>{
      html += `<div class="ledger-row" style="grid-template-columns:1fr 60px 1fr auto">
        <input class="lr-mono dns-name" data-i="${i}" value="${esCape(r.name)}" aria-label="record name" placeholder="db">
        <input class="lr-mono dns-type" data-i="${i}" value="${esCape(r.type||"A")}" aria-label="record type">
        <input class="lr-mono dns-ip" data-i="${i}" value="${esCape(r.ip||"")}" aria-label="record value IP" placeholder="10.10.21.10">
        <button class="btn small danger dns-del" data-i="${i}" aria-label="remove record">✕</button></div>`;
    });
    html += `</div><div class="row mt"><button class="btn small" id="dnsAdd">+ Add record</button>
      <button class="btn small primary" id="dnsTest">Test resolution</button></div><div id="dnsTestOut" class="mt"></div>`;
  } else if(kind==="monitor"){
    const m = S.world.monitor;
    html += `<div class="row mt"><button class="btn ${m.flowLogs?"danger":""}" id="btnFlow">${m.flowLogs?"Disable VPC flow logs":"Enable VPC flow logs"}</button>
      <span class="stamp ${m.flowLogs?"green":"red"}">flow logs ${m.flowLogs?"ON":"OFF"}</span></div>
      <div class="row mt"><button class="btn ${m.vpnAlarms?"danger":""}" id="btnAlarm">${m.vpnAlarms?"Disable tunnel alarms":"Enable tunnel alarms"}</button>
      <span class="stamp ${m.vpnAlarms?"green":"red"}">alarms ${m.vpnAlarms?"ON":"OFF"}</span></div>
      <p class="hinttext mt">Tunnel health: A ${S.world.vpn.tunnelA||"—"} · B ${S.world.vpn.tunnelB||"—"}. Raw flow-log exports live in the Flow Logs tab below.</p>`;
  } else if(kind==="nat"){
    const nt = S.world.nat;
    html += `<p>${nt.deployed?"Deployed in <b class='mono'>"+esCape(nt.subnet||"—")+"</b>":"Not deployed"}</p>
      <label>Place in subnet</label><select id="inNatSub"><option value="">—</option><option ${nt.subnet==="PUBLIC-WEB-A"?"selected":""}>PUBLIC-WEB-A</option><option ${nt.subnet==="PUBLIC-WEB-B"?"selected":""}>PUBLIC-WEB-B</option></select>
      <div class="row mt"><button class="btn primary" id="btnNatDeploy">${nt.deployed?"Re-deploy":"Deploy NAT gateway"}</button>
      ${nt.deployed?'<button class="btn danger" id="btnNatDel">Remove</button>':""}</div>`;
  } else if(kind==="cgw"){
    html += `<label>Public IP of HQ-EDGE</label><input id="inCgwIp" value="${esCape(S.world.cgw.ip||"")}" placeholder="203.0.113.10">
      <p class="hinttext mt">Synthetic documentation range (RFC 5737) stands in for the real edge device address.</p>`;
  } else if(kind==="vgw"){
    html += `<div class="row mt"><button class="btn primary" id="btnVgw">${S.world.vgw.attached?"Detach from VPC-PROD":"Attach to VPC-PROD"}</button>
      <span class="stamp ${S.world.vgw.attached?"green":"amber"}">${S.world.vgw.attached?"attached":"detached"}</span></div>`;
  } else if(kind==="edge"){
    html += `<div class="ledger-head">Static routes on HQ-EDGE</div><div id="edgeLedger" class="ledger">`;
    S.world.edge.routes.forEach((r,i)=>{
      html += `<div class="ledger-row" style="grid-template-columns:1fr 110px auto">
        <input class="lr-mono ed-dst" data-i="${i}" value="${esCape(r.dst)}" aria-label="destination CIDR" placeholder="10.10.0.0/16">
        <select class="ed-tgt" data-i="${i}" aria-label="target"><option ${r.tgt==="VPN"?"selected":""}>VPN</option></select>
        <button class="btn small danger ed-del" data-i="${i}" aria-label="remove route">✕</button></div>`;
    });
    html += `</div><button class="btn small mt" id="edAdd">+ Add route</button>`;
  } else if(kind==="host"){
    const h = HOSTS[sel==="CRM"?"CRM-ONPREM":"LEGACY-DB"];
    html += `<p><b class="mono">${h.ip}</b> — ${h.label}</p><p class="hinttext mt">On-premises host in HQ-DC (192.168.50.0/24). Uses HQ-EDGE static routes to reach cloud CIDRs.</p>`;
  } else if(kind==="internet"){
    html += `<p>Synthetic internet client <b class="mono">192.0.2.55</b> (RFC 5737 range).</p><p class="hinttext mt">Reaches the VPC only through the IGW — and only if the web tier's SG/NACL allow it.</p>`;
  } else if(sel === "IGW"){
    html += `<p>The internet gateway is the VPC's door to the internet. Detached, nothing from the internet can enter — and public subnets have no exit for replies.</p>
      <div class="row mt"><span class="stamp ${S.world.vpc.igw?"green":"amber"}">${S.world.vpc.igw?"attached to VPC-PROD":"not attached"}</span></div>
      <p class="hinttext mt">Attach/detach it from the VPC-PROD inspector.</p>`;
  } else {
    html += `<p class="hinttext">Pre-existing staging network (10.20.0.0/16, subnet STAGE-A 10.20.1.0/24 with STAGE-APP 10.20.1.20). Read-only in this exercise; connect it with peering + routes.</p>`;
  }
  box.innerHTML = html;
  bindInspector(sel, kind);
}
function bindInspector(sel, kind){
  const w = S.world;
  const rerender = () => { save(); renderCanvas(); renderTitle(); };
  const B = (id, fn) => { const el = $id(id); if(el) el.addEventListener("click", fn); };
  const C = (id, fn) => { const el = $id(id); if(el) el.addEventListener("change", fn); };
  if(kind==="vpc"){
    C("inVpcCidr", e => { w.vpc.cidr = e.target.value.trim() || null; rerender(); renderInspector(); });
    B("btnIgw", () => { w.vpc.igw = !w.vpc.igw; rerender(); renderInspector(); });
  } else if(kind==="subnet"){
    const key = SUBNET_KEY[sel], s = w.subnets[key];
    $id("inSubAz").value = s.az||""; $id("inSubType").value = s.type||"";
    C("inSubCidr", e => { s.cidr = e.target.value.trim()||null; rerender(); });
    C("inSubAz", e => { s.az = e.target.value||null; rerender(); });
    C("inSubType", e => { s.type = e.target.value||null; rerender(); });
  } else if(kind==="rt"){
    const key = RT_KEY[sel], rt = w.rts[key];
    document.querySelectorAll(".rt-dst").forEach(el => el.addEventListener("change", e => { rt.routes[+el.dataset.i].dst = el.value.trim(); rerender(); }));
    document.querySelectorAll(".rt-tgt").forEach(el => el.addEventListener("change", () => { rt.routes[+el.dataset.i].tgt = el.value; rerender(); }));
    document.querySelectorAll(".rt-del").forEach(el => el.addEventListener("click", () => { rt.routes.splice(+el.dataset.i,1); rerender(); renderInspector(); }));
    B("rtAdd", () => { rt.routes.push({dst:"", tgt:"IGW"}); save(); renderCanvas(); renderInspector(); });
  } else if(kind==="sg"){
    const key = SG_KEY[sel], sg = w.sg[key];
    document.querySelectorAll(".sg-port").forEach(el => el.addEventListener("change", () => { sg.rules[+el.dataset.i].port = el.value.trim(); rerender(); }));
    document.querySelectorAll(".sg-src").forEach(el => el.addEventListener("change", () => { sg.rules[+el.dataset.i].src = el.value.trim(); rerender(); }));
    document.querySelectorAll(".sg-del").forEach(el => el.addEventListener("click", () => { sg.rules.splice(+el.dataset.i,1); rerender(); renderInspector(); }));
    B("sgAdd", () => { sg.rules.push({port:"", src:""}); save(); renderCanvas(); renderInspector(); });
  } else if(kind==="nacl"){
    const key = NACL_KEY[sel], na = w.nacl[key];
    ["in","out"].forEach(dir=>{
      const list = na[dir];
      document.querySelectorAll(`.${dir}-rule`).forEach(el => el.addEventListener("change", () => { list[+el.dataset.i].rule = el.value.trim(); save(); }));
      document.querySelectorAll(`.${dir}-act`).forEach(el => el.addEventListener("change", () => { list[+el.dataset.i].act = el.value; save(); }));
      document.querySelectorAll(`.${dir}-port`).forEach(el => el.addEventListener("change", () => { list[+el.dataset.i].port = el.value.trim(); save(); }));
      document.querySelectorAll(`.${dir}-del`).forEach(el => el.addEventListener("click", () => { list.splice(+el.dataset.i,1); save(); renderInspector(); }));
      const addBtn = document.querySelector("." + dir + "-add");
      if(addBtn) addBtn.addEventListener("click", () => { list.push({rule:"", act:"ALLOW", port:""}); save(); renderInspector(); });
    });
    rerender();
  } else if(kind==="vpn"){
    const v = w.vpn;
    if(!v.exists){
      C("inRouting", e => { $id("lblAsn").style.display = e.target.value==="BGP" ? "block" : "none"; });
      B("btnVpnCreate", () => {
        v.exists = true; v.ike = $id("inIke").value; v.routing = $id("inRouting").value; v.asn = $id("inAsn").value.trim()||null;
        v.tunnelA = "UP"; v.tunnelB = "DISABLED";
        save(); renderCanvas(); renderInspector(); announce("Site-to-site VPN created. Tunnel A up, Tunnel B disabled.");
      });
    } else {
      C("inTunnelA", e => { v.tunnelA = e.target.value; rerender(); });
      C("inTunnelB", e => { v.tunnelB = e.target.value; rerender(); });
      C("inIke2", e => { v.ike = e.target.value; save(); });
      C("inRouting2", e => { v.routing = e.target.value; rerender(); renderInspector(); });
      C("inAsn2", e => { v.asn = e.target.value.trim()||null; save(); });
    }
  } else if(kind==="peer"){
    B("btnPeerReq", () => { w.peer.requested = true; save(); renderCanvas(); renderInspector(); toast("Peering requested — now accept it."); });
    B("btnPeerAcc", () => { w.peer.accepted = true; save(); renderCanvas(); renderInspector(); announce("Peering accepted."); });
  } else if(kind==="dns"){
    const d = w.dns;
    C("inZone", e => { d.zone = e.target.value.trim()||null; if(!d.zone) d.assoc=false; rerender(); renderInspector(); });
    B("btnAssoc", () => { if(!d.zone) return; d.assoc = !d.assoc; rerender(); renderInspector(); });
    document.querySelectorAll(".dns-name").forEach(el => el.addEventListener("change", () => { d.records[+el.dataset.i].name = el.value.trim(); save(); }));
    document.querySelectorAll(".dns-ip").forEach(el => el.addEventListener("change", () => { d.records[+el.dataset.i].ip = el.value.trim(); save(); }));
    document.querySelectorAll(".dns-del").forEach(el => el.addEventListener("click", () => { d.records.splice(+el.dataset.i,1); save(); renderInspector(); }));
    B("dnsAdd", () => { d.records.push({name:"", type:"A", ip:""}); save(); renderInspector(); });
    B("dnsTest", () => { const r = dnsSim("PROD-APP"); $id("dnsTestOut").innerHTML = simTraceHtml(r); announce(r.summary); });
  } else if(kind==="monitor"){
    B("btnFlow", () => { w.monitor.flowLogs = !w.monitor.flowLogs; rerender(); renderInspector(); announce("Flow logs "+(w.monitor.flowLogs?"enabled":"disabled")); });
    B("btnAlarm", () => { w.monitor.vpnAlarms = !w.monitor.vpnAlarms; rerender(); renderInspector(); announce("Tunnel alarms "+(w.monitor.vpnAlarms?"enabled":"disabled")); });
  } else if(kind==="nat"){
    B("btnNatDeploy", () => { w.nat.deployed = true; w.nat.subnet = $id("inNatSub").value||null; rerender(); renderInspector(); });
    B("btnNatDel", () => { w.nat.deployed = false; w.nat.subnet = null; rerender(); renderInspector(); });
    C("inNatSub", e => { w.nat.subnet = e.target.value||null; rerender(); });
  } else if(kind==="cgw"){
    C("inCgwIp", e => { w.cgw.ip = e.target.value.trim()||null; rerender(); });
  } else if(kind==="vgw"){
    B("btnVgw", () => { w.vgw.attached = !w.vgw.attached; rerender(); renderInspector(); });
  } else if(kind==="edge"){
    const ed = w.edge;
    document.querySelectorAll(".ed-dst").forEach(el => el.addEventListener("change", () => { ed.routes[+el.dataset.i].dst = el.value.trim(); rerender(); }));
    document.querySelectorAll(".ed-tgt").forEach(el => el.addEventListener("change", () => { ed.routes[+el.dataset.i].tgt = el.value; rerender(); }));
    document.querySelectorAll(".ed-del").forEach(el => el.addEventListener("click", () => { ed.routes.splice(+el.dataset.i,1); rerender(); renderInspector(); }));
    B("edAdd", () => { ed.routes.push({dst:"", tgt:"VPN"}); save(); renderCanvas(); renderInspector(); });
  }
}
function simTraceHtml(r){
  let h = r.hops.map(x => `<div class="hop"><span class="hic ${x.ok?"trace-ok":"trace-no"}">${x.ok?"✓":"✗"}</span><span><b>${esCape(x.name)}</b> — ${esCape(x.note)}</span></div>`).join("");
  return `<div class="${r.ok?"passmsg":"failmsg"}" role="status"><b>${esCape(r.summary)}</b>${h}</div>`;
}

/* ============================ UI: title, drawer, quiz, overlays, init ============================ */
function renderTitle(){
  const done = OBJ_DONE(), total = OBJ_LIST().length;
  $id("tbModeChip").textContent = S.mode === "M" ? "MEDIUM · GUIDED BUILD" : "HARD · BREAK-FIX";
  $id("tbScore").textContent = `${done} / ${total}`;
  $id("tbGauge").style.width = total ? (100*done/total)+"%" : "0%";
}
function renderBrief(){
  const m = S.mode === "M";
  $id("briefCard").innerHTML = `
    <h3>${m ? "Deployment briefing — NET-CHG-2411" : "Incident briefing — 07:00, three teams paged"}</h3>
    <p class="hinttext" style="margin-top:4px">${m
      ? "Meridian Analytics is cutting over to hybrid cloud. As the network deployment engineer, you build VPC-PROD on the NimbusCloud drawing, wire the site-to-site VPN to HQ-DC, peer staging, harden the tiers and arm monitoring — following the approved deployment order (tray → Requirements). Twelve objectives walk the full lifecycle; each CHECK explains the why. Hints cost stars, nothing else."
      : "Overnight, replication, staging transfers and tunnel B broke. The board reflects the network AS IT IS — with several planted faults and noisy alerts from other teams. Triage the Alert Board, use the Traffic Lab to attribute each failure to the exact control, repair the approved design, and defend your choices. No guided steps: evidence first."}</p>
    <p class="hinttext" style="margin-top:6px"><b>CompTIA Cloud+ CV0-004</b> — Lesson 1.3 Cloud networking (Domain 1.0: virtual private networks, dedicated connections, VPCs/peering/transit; reinforced by Domain 4 SGs/NACLs and Domain 6 network troubleshooting). All data is synthetic training material — RFC 5737 addresses, fictional organizations.</p>`;
}
let drawerCollapsed = false;
function applyDrawerState(){
  ["paneTraffic","paneReq","paneAlerts","paneLogs"].forEach(id => { $id(id).style.display = drawerCollapsed ? "none" : ""; });
  $id("btnDrawer").setAttribute("aria-expanded", String(!drawerCollapsed));
  $id("btnDrawer").textContent = drawerCollapsed ? "Expand tray ▾" : "Collapse tray ▴";
}
function switchTab(name){
  S.ui.tab = name;
  ["traffic","req","alerts","logs"].forEach(t=>{
    $id("pane"+({traffic:"Traffic",req:"Req",alerts:"Alerts",logs:"Logs"}[t])).classList.toggle("on", t===name);
    $id("tab"+({traffic:"Traffic",req:"Req",alerts:"Alerts",logs:"Logs"}[t])).setAttribute("aria-selected", t===name);
  });
  applyDrawerState();
  save();
}
function renderDrawer(){
  // Traffic Lab
  const trafficSel = (id, label) => `<div style="flex:1;min-width:150px"><label>${label}</label><select id="${id}" aria-label="${label}">
    ${Object.keys(HOSTS).map(h=>`<option value="${h}">${h} — ${HOSTS[h].label} (${HOSTS[h].ip})</option>`).join("")}
    <option value="db.meridian.internal">db.meridian.internal — DNS test</option></select></div>`;
  $id("paneTraffic").innerHTML = `
    <p class="hinttext">Trace a synthetic flow through the live board: edge routes → VPN tunnel → route tables → NACL → security group. Every hop is evaluated against your current configuration (simplified model: NACL evaluated on the destination subnet; local VPC route implicit).</p>
    <div class="row mt">${trafficSel("simSrc","Source")}${trafficSel("simDst","Destination")}
      <div style="min-width:110px"><label>Port</label><input id="simPort" value="443" aria-label="port"></div>
      <div style="align-self:flex-end"><button class="btn primary" id="simRun">RUN TEST</button></div></div>
    <div class="row mt">
      <button class="btn small" data-flow="ITX-CLIENT|PROD-WEB|443">Internet → Web :443</button>
      <button class="btn small" data-flow="CRM-ONPREM|PROD-APP|8443">HQ CRM → App :8443</button>
      <button class="btn small" data-flow="STAGE-APP|PROD-APP|8443">STAGE → PROD App :8443</button>
      <button class="btn small" data-flow="LEGACY-DB|PROD-DB|5432">HQ DB → PROD DB :5432</button>
      <button class="btn small" data-flow="PROD-APP|db.meridian.internal|53">DNS resolution test</button>
    </div>
    <div id="simOut" class="mt"></div>`;
  // Requirements
  $id("paneReq").innerHTML = `<div class="doc">${esCape(REQ_DOC)}</div>`;
  // Alerts
  if(S.mode === "H"){
    const marks = (S.objs.H1 && S.objs.H1.ans) || {};
    const h1done = S.objs.H1 && S.objs.H1.done;
    $id("paneAlerts").innerHTML = `<p class="hinttext">Classify each alert: <b>network fault</b> (fix it in this incident) or <b>unrelated noise</b> (other team's queue). This feeds objective H1.</p>` +
      ALERTS.map(a=>`<div class="alertcard ${a.sev}"><span class="aid">${a.id}</span> ${esCape(a.text)}
        <div class="row mt">
          <button class="btn small ${marks[a.id]==="fault"?"primary":""}" data-mark="${a.id}|fault" ${h1done?"disabled":""}>⚑ Network fault</button>
          <button class="btn small ${marks[a.id]==="noise"?"primary":""}" data-mark="${a.id}|noise" ${h1done?"disabled":""}>◯ Unrelated noise</button>
        </div></div>`).join("");
  } else {
    $id("paneAlerts").innerHTML = `<p class="hinttext">No open alerts — the deployment is running clean. In Hard mode this board fills with noisy incident alerts, some of them red herrings.</p>`;
  }
  // Flow logs
  const logs = S.mode === "H" ? FLOWLOGS_HARD : FLOWLOGS_MED;
  $id("paneLogs").innerHTML = `<p class="hinttext">${S.mode==="H"
    ? "Current VPC flow-log export (VPC-PROD, this morning). REJECT lines are the controls refusing traffic — your diagnostic gold."
    : "Historical export captured BEFORE hardening — used by objective M12: one line shows traffic that should never have succeeded."}</p>
    <table class="log"><thead><tr><th>time</th><th>source</th><th>destination</th><th>proto/port</th><th>action</th></tr></thead><tbody>
    ${logs.map(l=>`<tr><td>${l[0]}</td><td>${l[1]}</td><td>${l[2]}</td><td>${l[3]}</td><td class="${l[4].startsWith("ACCEPT")?"acc":"rej"}">${l[4]}</td></tr>`).join("")}
    </tbody></table>`;
  // bind
  $id("simRun").addEventListener("click", runSim);
  document.querySelectorAll("[data-flow]").forEach(b => b.addEventListener("click", () => {
    const [s,d,p] = b.dataset.flow.split("|");
    $id("simSrc").value = s; $id("simDst").value = d; $id("simPort").value = p;
    runSim();
  }));
  document.querySelectorAll("[data-mark]").forEach(b => b.addEventListener("click", () => {
    const [id, mark] = b.dataset.mark.split("|");
    const st = objState("H1"); st.ans = st.ans || {}; st.ans[id] = mark; save(); renderDrawer();
  }));
}
function runSim(){
  const src = $id("simSrc").value, dst = $id("simDst").value, port = ($id("simPort").value||"443").trim();
  const r = simulate(src, dst, port || "443");
  $id("simOut").innerHTML = simTraceHtml(r);
  announce(r.summary);
}

/* ---------- quiz ---------- */
function openNotes(){
  const ovl = $id("ovlNotes");
  window.__opener = document.activeElement;
  ovl.innerHTML = `<div class="modal" role="document">
    <div class="row" style="justify-content:space-between"><h2>Field Notes — Cloud Networking (CV0-004 L1.3)</h2>
      <button class="btn small" id="notesClose">Close</button></div>
    <div class="card mt"><h3>Detection opportunities (data source → example logic)</h3>
      <ul class="hinttext" style="margin:6px 0 0;padding-left:18px">
        <li><b>Flow logs</b> — <span class="mono">action = REJECT AND dstPort NOT IN (443, 8443, 5432)</span> → exposure attempts; unexpected ACCEPTs on management ports → policy violations.</li>
        <li><b>VPN tunnel metrics</b> — <span class="mono">TunnelState == 0</span> on either tunnel → HA gap; alarm before failover is needed.</li>
        <li><b>Route-table config audit</b> — diff against the approved order: missing return routes are silent blackholes.</li>
        <li><b>DNS query logs</b> — lookups resolving to stale addresses (e.g. .99) mimic routing outages.</li>
      </ul></div>
    <div class="card mt"><h3>Mitigation recommendations (with residual risk)</h3>
      <ul class="hinttext" style="margin:6px 0 0;padding-left:18px">
        <li>Least-privilege security groups with SG references — residual risk: a permissive rule added later; audit regularly.</li>
        <li>Dual tunnels + BGP (ASN 65010) — residual risk: same-device CGW; true HA needs diverse on-prem equipment.</li>
        <li>Stateless NACL segmentation with ephemeral return ranges — residual risk: rule-order mistakes; keep rules numbered and reviewed.</li>
        <li>Private hosted zones (split-horizon DNS) — residual risk: records go stale; sync them with the address plan.</li>
        <li>Dedicated private connection for SLA bandwidth, VPN as encrypted backup — residual risk: cost; right-size the circuit.</li>
        <li>Transit gateway hub for many networks — residual risk: hub is a shared failure domain; monitor it.</li>
      </ul></div>
    <div class="card mt"><h3>Blue-team takeaways</h3>
      <p class="hinttext">Routing must exist in BOTH directions; acceptance of a peering routes nothing; stateless filters need return-port rules; a stale DNS record impersonates a routing outage; the fastest discriminator is testing IP vs name, then hop-by-hop attribution. Detection = flow logs + tunnel metrics + config drift audits.</p></div>
    <div class="card mt"><h3>Red-team mindset (defensive use)</h3>
      <p class="hinttext">Attackers read your misconfigurations like a map: an SG with 22/3389 from 0.0.0.0/0 is an unlocked side door; a peering with one-sided routes invites "temporary" public-IP workarounds; over-broad SG sources (10.20.0.0/16 instead of SG references) quietly widen trust. Think like the person who inherits your rules, then remove what you cannot justify.</p></div>
    <div class="card mt"><h3>References</h3>
      <p class="hinttext"><a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer">CompTIA Cloud+ (CV0-004) — official page</a> · Lesson 1.3 sits in Domain 1.0 Cloud Architecture (23%); SGs/NACLs reinforce Domain 4, network troubleshooting Domain 6.<br>
      All lab data is synthetic: fictional organizations (Meridian Analytics, NimbusCloud), RFC 5737 documentation addresses, RFC 1918 private ranges. Cloud-provider semantics are AWS-style and labeled <b>simplified</b> for training.</p></div>
    <div class="row mt"><button class="btn primary" id="notesClose2">Close</button></div>
  </div>`;
  ovl.classList.add("on");
  ["notesClose","notesClose2"].forEach(id => $id(id).addEventListener("click", () => { ovl.classList.remove("on"); restoreFocus(); }));
  const first = ovl.querySelector("button"); if(first) first.focus();
}

/* ---------- glossary ---------- */
function openGlossary(){
  const ovl = $id("ovlGloss");
  window.__opener = document.activeElement;
  ovl.innerHTML = `<div class="modal" role="document">
    <div class="row" style="justify-content:space-between"><h2>Glossary — Lesson 1.3 vocabulary</h2>
      <button class="btn small" id="glossClose">Close</button></div>
    <input id="glossFilter" placeholder="filter terms…" aria-label="filter glossary">
    <div id="glossList">${GLOSSARY.map(g=>`<div class="gterm" data-term="${esCape((g[0]+g[1]).toLowerCase())}"><b>${g[0]}</b> — ${g[1]}</div>`).join("")}</div>
  </div>`;
  ovl.classList.add("on");
  $id("glossFilter").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    ovl.querySelectorAll(".gterm").forEach(el => el.style.display = el.dataset.term.includes(q) ? "" : "none");
  });
  ["glossClose"].forEach(id => $id(id).addEventListener("click", () => { ovl.classList.remove("on"); restoreFocus(); }));
  $id("glossFilter").focus();
}

/* ---------- mode gate + confirm ---------- */
function openGate(){
  const ovl = $id("ovlGate");
  ovl.innerHTML = `<div class="modal" role="document">
    <h2>Choose your deployment experience</h2>
    <p class="hinttext">Same board, same knowledge — two ways to work it. CompTIA Cloud+ CV0-004 · Lesson 1.3 Cloud networking (VPNs & virtual networks).</p>
    <div class="modes">
      <button class="modecard" id="pickM">
        <span class="stamp amber">Medium · Guided build</span>
        <h3 style="margin:8px 0 2px">Deploy & Learn</h3>
        <p class="hinttext" style="margin:4px 0">Build the hybrid network from a blank drawing, following the approved order.</p>
        <ul><li>12 guided objectives, in order, with "where to look"</li><li>3-level hints (cost stars, never block)</li><li>Tolerant checks — wrong answers teach</li><li>Quiz: 6 concept questions</li></ul>
      </button>
      <button class="modecard" id="pickH">
        <span class="stamp red">Hard · Break-fix</span>
        <h3 style="margin:8px 0 2px">Triage & Recover</h3>
        <p class="hinttext" style="margin:4px 0">The board is already built — and broken. Find what matters and restore the design.</p>
        <ul><li>9 broad multi-step challenges</li><li>Noisy alert board with red herrings</li><li>One optional nudge, −8% score</li><li>Strict checks · quiz: 7 scenario items</li></ul>
      </button>
    </div>
    <p class="hinttext mt">Progress autosaves in this browser. Training data only — synthetic networks, fictional organizations.</p>
  </div>`;
  ovl.classList.add("on");
  $id("pickM").addEventListener("click", () => { ovl.classList.remove("on"); setMode("M", true); });
  $id("pickH").addEventListener("click", () => { ovl.classList.remove("on"); setMode("H", true); });
  $id("pickM").focus();
}
function confirmDialog(title, body, yesLabel, cb){
  const ovl = $id("ovlConfirm");
  window.__opener = document.activeElement;
  ovl.innerHTML = `<div class="modal" role="document">
    <h2>${esCape(title)}</h2><p class="hinttext">${esCape(body)}</p>
    <div class="row mt"><button class="btn danger" id="cfYes">${esCape(yesLabel)}</button><button class="btn" id="cfNo">Cancel</button></div>
  </div>`;
  ovl.classList.add("on");
  $id("cfYes").addEventListener("click", () => { ovl.classList.remove("on"); cb(); restoreFocus(); });
  $id("cfNo").addEventListener("click", () => { ovl.classList.remove("on"); restoreFocus(); });
  $id("cfYes").focus();
}
