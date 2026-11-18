/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Dispatch simulation engine, composer, ledger, switchboard, binder, matcher.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

const DEST_LABELS = {
  limited:"Everyone here — 255.255.255.255 (limited broadcast)",
  "dir-vlan20":"Studio VLAN — 10.20.30.255 (directed broadcast)",
  "dir-vlan10":"Office VLAN — 10.10.10.255 (directed broadcast)",
  allnodes:"IPv6 all-nodes multicast ff02::1 (broadcast's replacement)",
  "G-IPTV":"IPTV channel 4 — 239.10.1.10",
  "G-TICK":"Market ticker — 239.20.2.20",
  "G-OSPF":"OSPF routers — 224.0.0.5",
  CDN:"CDN edge cluster — 198.51.100.7 (twins: SIN / FRA / NYC)",
  WEB:"WEB-SRV — 203.0.113.20 (internet)",
  "WEB6":"WEB-SRV — 2001:db8:20::20 (internet)",
  "ND-SOLICIT":"Neighbor Solicitation — who has WKS-02? (ff02::1:ff00:0012)"
};
function dLabel(dest){ return DEST_LABELS[dest] || (HOSTS[dest] ? `${dest} — ${HOSTS[dest].ip}` : dest); }
function destOptions(mode, ipVer, src){
  const out=[];
  if(mode==="unicast"){
    Object.keys(HOSTS).forEach(h=>{ if(h!==src) out.push([h, `${h} — ${HOSTS[h].ip} (${HOSTS[h].vlan.replace("VLAN","VLAN ")})`]); });
    out.push([ipVer==="ipv6"?"WEB6":"WEB", ipVer==="ipv6"?"WEB-SRV — 2001:db8:20::20 (internet)":"WEB-SRV — 203.0.113.20 (internet)"]);
    if(ipVer==="ipv6") out.push(["ND-SOLICIT", DEST_LABELS["ND-SOLICIT"]]);
  } else if(mode==="broadcast"){
    if(ipVer==="ipv6"){ out.push(["allnodes", DEST_LABELS.allnodes]); }
    else { out.push(["limited",DEST_LABELS.limited],["dir-vlan20",DEST_LABELS["dir-vlan20"]],["dir-vlan10",DEST_LABELS["dir-vlan10"]]); }
  } else if(mode==="multicast"){
    out.push(["G-IPTV",DEST_LABELS["G-IPTV"]],["G-TICK",DEST_LABELS["G-TICK"]],["G-OSPF",DEST_LABELS["G-OSPF"]]);
  } else if(mode==="anycast"){
    out.push(["CDN",DEST_LABELS.CDN]);
  }
  return out;
}
function renderComposer(){
  const srcSel=$("#srcSel");
  const prevSrc=srcSel.value;
  srcSel.innerHTML = Object.keys(HOSTS).map(h=>opt(h,`${h} — ${HOSTS[h].ip} (${HOSTS[h].vlan.replace("VLAN","VLAN ")})`)).join("");
  if(prevSrc && HOSTS[prevSrc]) srcSel.value=prevSrc;
  refreshDest();
}
function refreshDest(){
  const mode=($$('input[name="dmode"]').find(r=>r.checked)||{}).value||"unicast";
  const ipVer=$("#ipVerSel").value;
  const destSel=$("#destSel"); const prev=destSel.value;
  const opts=destOptions(mode,ipVer,$("#srcSel").value);
  destSel.innerHTML = opts.map(o=>opt(o[0],o[1])).join("");
  if(opts.some(o=>o[0]===prev)) destSel.value=prev;
}

/* ---------- delivery computation ---------- */
function computeDelivery(src, mode, dest, payload, ipVer){
  const env=state.env;
  const lines=[]; let verdict="DELIVERED", vclass="ok", receivers=[], blk=false, forwardedVia=null;
  const srcVlan=HOSTS[src].vlan;
  const vlanHosts=v=>Object.keys(HOSTS).filter(h=>HOSTS[h].vlan===v);
  if(mode==="unicast"){
    if(dest==="ND-SOLICIT"){
      receivers=vlanHosts(srcVlan);
      lines.push("Frame addressed to the solicited-node multicast ff02::1:ff00:0012 (MAC 33:33:FF:00:00:12) — NDP replaces ARP's broadcast.");
      lines.push("Only the target's operating system answers; other NICs filter the group in hardware (simplified).");
    } else if(HOSTS[dest] && HOSTS[dest].vlan===srcVlan){
      receivers=[dest];
      lines.push(`${VLANS[srcVlan].sw} forwards to the learned port — one copy, one recipient, no router involved.`);
    } else {
      receivers=[dest==="WEB6"?"WEB":dest];
      lines.push("R1 routes the packet toward its destination (inter-VLAN or upstream) — still unicast; TTL −1.");
    }
  } else if(mode==="broadcast"){
    if(ipVer==="ipv6"){
      receivers=vlanHosts(srcVlan);
      lines.push("IPv6 has NO broadcast — ff02::1, the all-nodes multicast group, does the “everyone on this link” job (MAC 33:33:00:00:00:01).");
    } else if(dest==="limited"){
      receivers=vlanHosts(srcVlan);
      lines.push(`${VLANS[srcVlan].sw} floods the frame to every port in ${srcVlan} — all ${receivers.length} NICs process it.`);
      lines.push("R1 holds the line: 255.255.255.255 is a limited broadcast and is never forwarded by a router.");
      blk=true;
    } else if(dest==="dir-vlan10"){
      receivers=vlanHosts(srcVlan);
      lines.push("Directed at this subnet's own all-ones host address — inside the VLAN it behaves exactly like a local flood.");
      blk=true;
    } else if(dest==="dir-vlan20"){
      if(srcVlan==="VLAN20"){
        receivers=vlanHosts("VLAN20");
        lines.push("That is this subnet's own broadcast address — local flood for the studio.");
        blk=true;
      } else if(env.directedFwd){
        forwardedVia="directedFwd"; verdict="FORWARDED"; vclass="bad";
        receivers=vlanHosts("VLAN20");
        lines.push("R1 FORWARDED the directed broadcast into VLAN 20 — one packet became a delivery to every studio NIC.");
        lines.push("This is the smurf amplification pattern; RFC 2644 made refusal the default for a reason.");
      } else if(env.wolException && payload==="wol"){
        forwardedVia="wol"; verdict="FORWARDED"; vclass="warn";
        receivers=vlanHosts("VLAN20");
        lines.push("R1 forwarded ONLY because the scoped Wake-on-LAN exception matches this payload — narrow exception, general denial intact.");
        lines.push("Sleeping NICs' WoL engines wake; everything else in VLAN 20 also heard the frame.");
      } else {
        verdict="BLOCKED"; blk=true;
        lines.push("R1 refuses the directed broadcast — the RFC 2644 default. No one-to-many amplification on this floor.");
      }
    }
  } else if(mode==="multicast"){
    if(dest==="G-OSPF"){
      receivers=["R1"];
      lines.push("224.0.0.5 sits in the link-local control block — every router on the link consumes it; switches keep it inside the VLAN and routers never forward it.");
    } else {
      const gv = dest==="G-IPTV" ? "G-IPTV":"G-TICK";
      const g = env.groups[gv]||[];
      const sn = gv==="G-IPTV" ? env.snoopingSW1 : env.snoopingSW2;
      const sw = gv==="G-IPTV" ? "SW1":"SW2";
      const vlan = GROUPS[gv].vlan;
      if(sn){
        receivers=[...g];
        if(!g.length) lines.push(`${sw} has IGMP snooping but nobody joined ${GROUPS[gv].addr} — nothing to forward; the stream stops at the switch.`);
        else lines.push(`IGMP snooping on ${sw} forwards the stream only to member ports (${g.join(", ")}).`);
        lines.push("In a real deployment snooping learns this table from a querier's IGMP queries (simplified).");
      } else {
        verdict="FLOODED"; vclass="warn";
        receivers=vlanHosts(vlan);
        lines.push(`No IGMP snooping on ${sw} — the stream floods every ${vlan} port exactly like a broadcast.`);
        lines.push(`${receivers.length} hosts received a stream none of them asked for (unless joined).`);
      }
      if(ipVer==="ipv6") lines.push("IPv6 equivalent would use ff0e:: scope multicast (address shown simplified).");
    }
  } else if(mode==="anycast"){
    const alive=EDGES.filter(e=>!env.edgeDown[e]);
    if(!alive.length){
      verdict="NO ROUTE"; vclass="mute";
      lines.push("Every twin is offline — the anycast address has no announcer left; routing has nowhere to deliver.");
    } else {
      const target=alive[0];
      receivers=[target];
      lines.push(`Routing metrics select the nearest announcer of ${CDN_IP}: ${target} serves this request.`);
      if(env.edgeDown["EDGE-SIN"] && target!=="EDGE-SIN") lines.push("SIN is offline — the next-nearest twin takes over. Transparent failover; the caller never re-addressed anything.");
      lines.push("On the wire this was a plain unicast packet — anycast is a deployment model, not an address type.");
      lines.push("Caveat: a long-lived TCP session could break if routing later shifts to a different twin.");
    }
  }
  return { src, mode, dest, payload, ipVer, verdict, vclass, receivers, lines, blk, forwardedVia,
           snoopingSW1:env.snoopingSW1, edgeDown:{...env.edgeDown} };
}
function doDispatch(){
  const src=$("#srcSel").value, mode=($$('input[name="dmode"]').find(r=>r.checked)||{}).value;
  const dest=$("#destSel").value, payload=$("#payloadSel")?$("#payloadSel").value:"data", ipVer=$("#ipVerSel").value;
  if(!src||!dest||!mode){ announce("Pick a source and destination first."); return; }
  const d=computeDelivery(src,mode,dest,payload,ipVer);
  d.n=state.env.history.length+1; d.ts=Date.now();
  // submission lock: a rapid double-click files the same dispatch twice — but a
  // re-dispatch whose OUTCOME changed (snooping flipped, twin down) is legitimate
  // training flow (M8/M4/H7 sequences), so compare computed results, not just inputs.
  const prev=lastD(state);
  if(prev && (d.ts-(prev.ts||0))<600 && prev.src===d.src && prev.mode===d.mode && prev.dest===d.dest
     && prev.payload===d.payload && prev.verdict===d.verdict && JSON.stringify(prev.receivers)===JSON.stringify(d.receivers)){ return; }
  state.env.history.push(d); if(state.env.history.length>40) state.env.history.shift();
  renderBoard(); renderDelivery(d); renderLedger();
  const stamp=$("#lastVerdict");
  stamp.innerHTML=`<span class="stamp anim ${d.vclass}">${esc(d.verdict)}</span>`;
  save(); updateMeter();
  announce(`Dispatch ${d.verdict}. ${d.receivers.length} receiver${d.receivers.length===1?"":"s"}.`);
}
function renderDelivery(d){
  const chips = d.receivers.length
    ? d.receivers.map(r=>`<span class="tagchip" style="border-color:var(--moss);color:var(--moss)">✓ ${esc(r)}</span>`).join(" ")
    : `<span class="tagchip">no receiver nodes</span>`;
  $("#deliveryPanel").innerHTML =
    `<p style="margin-top:0"><b>${esc(d.src)} → ${esc(dLabel(d.dest))}</b> · ${esc(d.mode)}${d.ipVer==="ipv6"?" · IPv6":""}${d.payload==="wol"?" · WoL payload":""}</p>
     <p>${chips}</p>
     <ul class="tight" style="font-size:.85rem">${d.lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`;
}
function renderLedger(){
  const items=state.env.history.slice(-28).reverse().map(d=>{
    const cls=d.verdict==="BLOCKED"||d.verdict==="DELIVERED"?"ok":d.verdict==="FORWARDED"||d.verdict==="FLOODED"?"warn":d.verdict==="NO ROUTE"?"mute":"ok";
    return `<li><span class="chip ${cls}">${esc(d.verdict)}</span><span><b>${esc(d.src)} → ${esc(dLabel(d.dest))}</b><br><span style="color:var(--ink2)">${esc(d.lines[0]||"")}</span></span></li>`;
  }).join("");
  $("#ledgerLog").innerHTML = items || `<li><span class="chip mute">EMPTY</span><span>No dispatches yet.</span></li>`;
}

/* ---------- plates / groups / edges ---------- */
const PLATES=[
  { id:"snoopingSW1", t:"IGMP snooping — SW1", d:"Office switch forwards multicast only to member ports (needs a querier to learn them)." },
  { id:"snoopingSW2", t:"IGMP snooping — SW2", d:"Same, for the studio switch." },
  { id:"querier", t:"IGMP querier — R1", d:"Periodic IGMP queries; snooping switches learn memberships from them." },
  { id:"directedFwd", t:"R1 forwards directed broadcasts", d:"RFC 2644 default: OFF. ON = one packet becomes a delivery to a whole remote subnet (smurf pattern)." },
  { id:"wolException", t:"WoL exception — VLAN 20", d:"Forwards ONLY Wake-on-LAN magic packets aimed at the studio subnet." },
  { id:"stormCtrl", t:"Storm control — uplinks", d:"Rate-limits broadcast surges on switch uplinks; protects CPU and airtime." },
  { id:"anymon", t:"Anycast health monitor", d:"Tracks which CDN twin serves which users; alerts when a twin dies." }
];
function renderPlates(){
  $("#platesBox").innerHTML = PLATES.map(p=>`
    <div class="plate"><button class="sw" role="switch" aria-checked="${!!state.env[p.id]}" id="sw-${p.id}" aria-label="${esc(p.t)}"></button>
    <div><div class="pt">${esc(p.t)}</div><div class="pd">${esc(p.d)}</div></div></div>`).join("");
  PLATES.forEach(p=>{
    $("#sw-"+p.id).addEventListener("click",()=>{
      state.env[p.id]=!state.env[p.id];
      state.env.flagIndex[p.id]=state.env.history.length;
      // update in place: a full re-render here would destroy the focused button
      // and drop keyboard users back to <body> on every toggle
      $("#sw-"+p.id).setAttribute("aria-checked", String(!!state.env[p.id]));
      save();
      announce(p.t+(state.env[p.id]?" ON":" OFF")+". "+p.d);
    });
  });
}
function renderEdges(){
  $("#edgeBox").innerHTML =
    `<div class="ph" style="border:0;padding:0;margin-bottom:.4rem"><span>Edge status (anycast twins)</span></div>` +
    EDGES.map(e=>`<label style="display:flex;gap:.5rem;align-items:center;font-size:.84rem;padding:.25rem 0;min-height:44px">
      <input type="checkbox" id="eg-${e}" ${state.env.edgeDown[e]?"checked":""} style="accent-color:var(--red);width:1.05rem;height:1.05rem">
      <span><b>${e}</b> offline <span class="tagchip">${e==="EDGE-SIN"?"nearest to Meridian":e==="EDGE-FRA"?"next-nearest":"farthest"}</span></span></label>`).join("");
  EDGES.forEach(e=>{
    $("#eg-"+e).addEventListener("change",ev=>{
      state.env.edgeDown[e]=ev.target.checked; renderBoard(); save();
      announce(e+(ev.target.checked?" marked offline":" back online")+".");
    });
  });
}
function renderGroups(){
  const g=state.env.groups;
  $("#groupsBox").innerHTML = ["G-IPTV","G-TICK"].map(gid=>{
    const grp=GROUPS[gid];
    return `<div style="margin-bottom:.6rem"><b style="font-size:.84rem">${esc(grp.label)}</b> <span class="tagchip">${grp.addr} · ${grp.vlan}</span><div class="radio-row" style="margin-top:.3rem">`+
      grp.joinable.map(h=>`<label><input type="checkbox" data-group="${gid}" data-host="${h}" ${g[gid]&&g[gid].includes(h)?"checked":""} style="accent-color:var(--brass);width:1rem;height:1rem"><span>${h}</span></label>`).join("")+
      `</div></div>`;
  }).join("")+`<p style="font-size:.76rem;color:var(--ink2);margin:.2rem 0 0">OSPF group 224.0.0.5: R1 is a permanent member — routers only.</p>`;
  $$("#groupsBox input[data-group]").forEach(cb=>cb.addEventListener("change",()=>{
    const gid=cb.dataset.group,h=cb.dataset.host; const arr=state.env.groups[gid]||[];
    state.env.groups[gid]= cb.checked ? (arr.includes(h)?arr:[...arr,h]) : arr.filter(x=>x!==h);
    save(); announce(`${h} ${cb.checked?"joined":"left"} ${GROUPS[gid].label}.`);
  }));
}

/* ---------- binder ---------- */
function renderBinder(){
  const list=FRAMES.filter(f=>state.mode==="hard"||f.medium);
  $("#binderBody").innerHTML=list.map(f=>`
    <tr data-frame="${f.id}" tabindex="0" aria-label="Frame ${f.id}, ${f.proto}">
      <td><span class="fid">${f.id}</span></td>
      <td><b>${esc(f.proto)}</b><br><span style="color:var(--ink2);font-size:.76rem">${esc(f.capture)}</span></td>
      <td class="mono" style="font-size:.74rem">MAC dst: ${esc(f.ethDst.split(" ")[0])}<br>IP dst: ${esc(f.ipDst.split(" : ")[0])}</td>
      <td style="font-size:.78rem">${esc(f.pattern)}</td>
      <td><select data-cls="${f.id}" aria-label="Traffic type for ${f.id}">
        ${TRAFFIC_TYPES.map(t=>opt(t,t,state.ev.cls[f.id])).join("")}
      </select></td>
    </tr>`).join("");
  $("#anomalySel").innerHTML = `<option value="">— pick —</option>`+FRAMES.filter(f=>!f.medium).map(f=>opt(f.id,`${f.id} · ${f.proto}`,state.ev.anomaly)).join("");
  $("#anomalySel").value=state.ev.anomaly||"";
  $("#anomalyReasonSel").value=state.ev.anomalyReason||"";
  $$("#binderBody tr").forEach(tr=>{
    const open=()=>{ renderInspector(tr.dataset.frame);
      $$("#binderBody tr").forEach(x=>x.classList.toggle("sel",x===tr)); };
    tr.addEventListener("click",open);
    tr.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } });
  });
  $$("#binderBody select[data-cls]").forEach(sel=>sel.addEventListener("change",()=>{
    state.ev.cls[sel.dataset.cls]=sel.value; save(); updateMeter();
    announce(`Frame ${sel.dataset.cls} marked ${sel.value}.`);
  }));
  $("#anomalySel").addEventListener("change",e=>{ state.ev.anomaly=e.target.value; save(); });
  $("#anomalyReasonSel").addEventListener("change",e=>{ state.ev.anomalyReason=e.target.value; save(); });
}
function renderInspector(fid){
  const f=FRAMES.find(x=>x.id===fid); if(!f) return;
  $("#inspector").innerHTML=`<dl>
    <dt>Frame</dt><dd>${f.id} — <b>${esc(f.proto)}</b></dd>
    <dt>Eth src</dt><dd>${esc(f.ethSrc)}</dd>
    <dt>Eth dst</dt><dd>${esc(f.ethDst)}</dd>
    <dt>IP src</dt><dd>${esc(f.ipSrc)}</dd>
    <dt>IP dst</dt><dd>${esc(f.ipDst)}</dd>
    <dt>L4 / payload</dt><dd>${esc(f.l4)}</dd>
    <dt>Captured at</dt><dd>${esc(f.capture)}</dd>
    <dt>Pattern</dt><dd>${esc(f.pattern)}</dd>
    <dt>Why it matters</dt><dd>${esc(f.why)}</dd>
  </dl>`;
}

/* ---------- matcher (M6) ---------- */
function renderMatcher(){
  $("#matcherRows").innerHTML = MATCHER.map(m=>`
    <div class="frow" style="margin:.3rem 0"><div class="field" style="flex:2"><label>${esc(m.label)}</label></div>
    <div class="field"><label aria-hidden="true">&nbsp;</label>
      <select data-match="${m.id}" aria-label="Traffic type for ${esc(m.label)}">
        ${opt("","— traffic type —",s_match(m.id))}${TRAFFIC_TYPES.map(t=>opt(t,t)).join("")}
      </select></div></div>`).join("");
  $$("select[data-match]").forEach(sel=>sel.addEventListener("change",()=>{
    state.match[sel.dataset.match]=sel.value; save();
  }));
  function s_match(id){ return state.match[id]||""; }
}

/* ---------- meter room ---------- */
