/* The Flat Net Incident — static build (N10-009 4.6).
   js/stations.js — Station renderers 1-5: briefing, field manual, evidence locker,
   zone board, commissioning.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= STATION 1 — BRIEFING ================= */
function stBriefing(){
  var h='<div class="panel"><h3><span class="n">01</span> Scenario briefing — read-only world</h3>'
    +'<div class="kicker">Fictional org · synthetic incident · certification anchor</div>'
    +'<p class="lead"><b>Cascadia Beverage Co.</b> runs the Cedar Falls bottling plant beside its HQ office. One flat network serves everything: <b>31 devices, all 48 switch ports on VLAN 1</b>. '+termSpan("IoT")+' cameras watch the dock, '+termSpan("IIoT")+' sensors feed the '+termSpan("historian")+', the '+termSpan("SCADA")+' stack runs the pasteurizer, '+termSpan("OT")+' keeps the cold room cold, guests and BYOD phones ride the same air. Last night, one default-credential camera turned that flatness into a '+termSpan("Modbus")+' pen.</p>'
    +'<div class="note"><b>Why this matters for the exam:</b> CompTIA Network+ N10-009 Objective 4.6 — <i>Explain the importance of network segmentation</i> — names exactly the classes you will zone here: IoT, IIoT, SCADA/ICS, OT, guest and BYOD. MITRE anchors the defense as mitigation <b>M1030</b>.</p></div>'
    +'<div class="tline" role="img" aria-label="Incident timeline from 02:11 to 03:20">';
  TIMELINE.forEach(function(t){ h+='<div class="tstep"><div class="tt">'+t[0]+'</div><div class="td">'+t[1]+'</div></div>'; });
  h+='</div>'
    +'<p class="lead"><b>Your mission on this shift:</b> classify the estate, reconstruct the chain, rebuild the network into Purdue-style zones, write the gate policy, tune the detection, and sequence the fixes — then argue the trade-offs a defender actually carries.</p>'
    +'<div class="grid3" style="margin-top:10px">'
    +'<div class="mcard"><h4>Hard rule of this range</h4><p>Everything here is synthetic. The attacker is fictional; the MITRE IDs are real and verified. Learn the pattern, not a target.</p></div>'
    +'<div class="mcard"><h4>Where you work</h4><p>Evidence Locker for artifacts, Zone Board for the redesign, Commissioning for detection and mitigation, Handover for the debrief.</p></div>'
    +'<div class="mcard"><h4>How you are graded</h4><p>First-attempt checks and sparse hints drive a 1–5 star mastery rating. Wrong answers only cost stars, never progress.</p></div>'
    +'</div>'
    +'<div class="panel" style="background:var(--panel2)"><h3><span class="n">Q</span> Sales pitch triage — what does segmentation actually deliver?</h3>'
    +'<p class="lead">Seven cards, four real outcomes. Select exactly the promises a zone boundary can keep.</p><div class="grid2" role="group" aria-label="Segmentation benefits picker">';
  perm(BENEFITS,P_BEN).forEach(function(b){
    h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-ben="'+b.id+'" '+(S.picks.M1&&S.picks.M1.indexOf(b.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-size:12.5px">'+b.n+'</span></label>';
  });
  h+='</div>'+objCardInline("M1")+'</div>';
  if(S.mode==="hard"){ h+= '<div class="note warn"><b>Rough shift:</b> objectives H1–H9 wait across the stations. No where-to-look, one nudge each — and three of the flows you will judge are deliberately innocent.</div>'; }
  h+= nextBtn("Open the Field Manual",2);
  return h;
}

/* ================= STATION 2 — FIELD MANUAL ================= */
function stManual(){
  var h='<div class="panel"><h3><span class="n">02</span> Field manual — segmentation core</h3>'
    +'<p class="lead">The exam expects you to explain <b>why</b> segmentation matters, name its <b>enforcement toolbox</b>, and know the <b>seven device classes</b> by heart. This manual is also the glossary — any dotted term opens it.</p>'
    +'<div class="grid2">'
    +'<div class="mcard"><h4>1 · Why segment at all</h4><p>One flat network gives every compromise a highway: any host can reach any host, so one weak camera becomes a plant-wide incident. Segmentation buys <b>containment</b> (blast radius of one zone), <b>attack-surface reduction</b> (untrusted classes never hold routes to crown jewels), <b>performance</b> (chatter stays local) and <b>compliance</b> (audit scope shrinks to the zones that hold regulated data). It does not patch, filter phishing, or replace inventory.</p></div>'
    +'<div class="mcard"><h4>2 · Where it sits in the chain</h4><p>MITRE mitigation <b>M1030 Network Segmentation</b> officially addresses post-compromise behavior: '+termSpan("T1046")+' discovery scans, T1210 exploitation of remote services, T1021.001 RDP pivots, T1565.003 runtime data manipulation. Delivery still needs its own controls — that is why phishing (T1566) and removable media (T1091) are NOT in M1030\'s table.</p></div>'
    +'</div>'
    +'<h3 style="margin:14px 0 8px;font-size:12px;letter-spacing:.2em;color:var(--faint)">ENFORCEMENT TOOLBOX</h3>'
    +'<div class="grid3">'
    +'<div class="mcard"><h4>VLAN / subnet</h4><p>Logical compartments: layer-2 isolation ('+termSpan("VLAN")+') plus layer-3 addressing so all cross-zone traffic must route.</p></div>'
    +'<div class="mcard"><h4>Firewall / ACL</h4><p>Policy at every gate: deny by default, allow only named protocol paths ('+termSpan("ACL")+').</p></div>'
    +'<div class="mcard"><h4>NAC / 802.1X</h4><p>Admission control: unknown devices are profiled or quarantined before they touch the wire.</p></div>'
    +'<div class="mcard"><h4>MDM / containerization</h4><p>BYOD answers: enroll the device, split work from personal, report posture.</p></div>'
    +'<div class="mcard"><h4>Captive portal</h4><p>The guest answer: terms first, internet-only, no internal routes.</p></div>'
    +'<div class="mcard"><h4>'+termSpan("DMZ")+' / '+termSpan("jump server")+'</h4><p>Broker between trust levels: corporate reaches OT data only through the level 3.5 DMZ.</p></div>'
    +'<div class="mcard"><h4>'+termSpan("Data diode")+'</h4><p>Physical one-way path out of a control zone — no return route, ever.</p></div>'
    +'<div class="mcard"><h4>'+termSpan("Egress filtering")+'</h4><p>Outbound allow-lists: cameras may talk to their vendor cloud and nothing else.</p></div>'
    +'<div class="mcard"><h4>'+termSpan("Microsegmentation")+'</h4><p>Zone-per-workload: the fire panel example — read-mostly visibility, zero remote writes.</p></div>'
    +'</div>'
    +'<h3 style="margin:14px 0 8px;font-size:12px;letter-spacing:.2em;color:var(--faint)">THE SEVEN CLASSES OF OBJECTIVE 4.6</h3>'
    +'<div class="grid3">'
    +'<div class="mcard"><h4 style="color:var(--teal)">IoT</h4><p>Smart end devices — cameras, TVs, printers, thermostats. Weak firmware, default credentials, always-on vendor telemetry. <b>Zone it:</b> own VLAN, no lateral routes, egress allow-list.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--olive)">IIoT</h4><p>Industrial instrumentation bridging plant data to IT — meters, vibration and flow sensors. <b>Zone it:</b> sensor zone with one monitored northbound path to the historian.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--rust)">SCADA / ICS</h4><p>The supervisory control stack: PLCs, RTUs, HMIs, engineering workstation, historian. Safety-critical; protocol writes change physical reality. <b>Zone it:</b> Purdue L1-L2, writes only from eng-ws.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--bronze)">OT</h4><p>Anything acting on physical processes beyond the control stack: HVAC, refrigeration, fire, badge, BMS. Legacy, availability-first, patch-window-bound. <b>Zone it:</b> L3 behind a brokered boundary, passive monitoring.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--violet)">Guest</h4><p>Visitors and vendors, posture unknown. <b>Zone it:</b> internet-only — captive portal, client isolation, zero internal routes.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--pink)">BYOD</h4><p>Employee-owned phones and laptops mixing work and life. <b>Zone it:</b> MDM + containerization, 802.1X admission, dedicated zone.</p></div>'
    +'<div class="mcard"><h4 style="color:var(--steel)">Corporate (context)</h4><p>Managed IT endpoints and servers. <b>Zone it:</b> L4; OT data only via the DMZ jump server.</p></div>'
    +'</div>'
    +'<h3 style="margin:14px 0 8px;font-size:12px;letter-spacing:.2em;color:var(--faint)">THE '+termSpan("PURDUE MODEL")+' RISER — how the plant stacks</h3>'
    +'<div class="mcard">'+purdueSVG()+'</div>'
    +'<h3 style="margin:14px 0 8px;font-size:12px;letter-spacing:.2em;color:var(--faint)">ATTACKER\u2019S VIEW — case files</h3>'
    +'<div class="grid3">';
  CASES.forEach(function(c){ h+='<div class="mcard"><h4><span class="tag warn">'+c.id+'</span> '+c.n+'</h4><p>'+c.d+'</p></div>'; });
  h+='</div>'
    +'<div class="nextrow">'+backBtn(1,"Briefing")+ '<button class="btn ghost" onclick="openGlossary()">Open glossary</button>' +nextBtn("Enter the Evidence Locker",3).replace('<div class="nextrow">','').replace('</div>','')+'</div>'
    +'<div class="panel" style="background:var(--panel2)"><h3><span class="n">V</span> Vocabulary drill — match the six classes</h3>'
    +'<p class="lead">Assign each term its exam definition. The OT-vs-SCADA pair is the classic trap.</p><div class="grid2">';
  DEFS.forEach(function(d){
    h+='<div class="mcard"><div class="kicker">'+(CLASSES.filter(function(c){return c[0]===d[0];})[0]||["","?"])[1]+'</div>'
      +'<select data-def="'+d[0]+'" aria-label="Definition for '+d[0]+'" style="width:100%;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px"><option value="">— choose the matching definition —</option>';
    perm(DEFS,P_DEFS).forEach(function(d2){
      h+='<option value="'+d2[0]+'"'+(S.defMatch[d[0]]===d2[0]?" selected":"")+'>'+d2[1]+'</option>';
    });
    h+='</select></div>';
  });
  h+='</div>'+objCardInline("M3")
    +'<div class="panel" style="background:var(--panel2)"><h3><span class="n">W</span> MITRE anchoring — what does M1030 officially cover?</h3>'
    +'<p class="lead">Mark every attacker behavior that mitigation <b>M1030 Network Segmentation</b> officially addresses, then type the mitigation ID. Verified against attack.mitre.org, 2026-11-09.</p><div class="grid2" role="group" aria-label="Technique selector">';
  perm(TECHS,P_TECH).forEach(function(t){
    h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-tech="'+t.id+'" '+(S.picks.M2&&S.picks.M2.indexOf(t.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-family:var(--mono);font-size:12px">'+t.n+'</span></label>';
  });
  h+='</div><div class="mcard" style="margin-top:10px"><div class="kicker">MITIGATION ID (exact)</div>'
    +'<input type="text" data-mid="1" value="'+(S.midInput||"")+'" placeholder="e.g. M1050" aria-label="MITRE mitigation ID" style="width:180px;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px;font-family:var(--mono)"></div>'
    +objCardInline("M2")+'</div>';
  return h;
}
function purdueSVG(){
  var rows=[[5,"Enterprise / internet"],[4,"Corporate IT (ERP, mail)"],["3.5","IT/OT DMZ — jump server, patch staging"],[3,"Site operations / OT (BMS, historian feeds)"],[2,"Supervisory (HMI, SCADA)"],[1,"Basic control (PLCs, RTUs)"],[0,"Physical process (valves, motors, sensors)"]];
  var colors=["#6f9fc8","#6f9fc8","#7aa7e8","#c98a4b","#e3a23c","#e0685a","#78838f"];
  var y=8, out='<svg class="purdue" viewBox="0 0 560 '+(rows.length*34+16)+'" role="img" aria-label="Purdue model levels from enterprise to physical process">';
  rows.forEach(function(r,i){
    out+='<rect x="30" y="'+y+'" width="500" height="28" rx="4" fill="'+colors[i]+'" fill-opacity="0.18" stroke="'+colors[i]+'" stroke-opacity="0.7"/>'
      +'<text x="44" y="'+(y+19)+'" font-family="monospace" font-size="12" fill="#ece7db">L'+r[0]+' — '+r[1]+'</text>';
    y+=34;
  });
  out+='<text x="4" y="'+(rows.length*17)+'" font-family="monospace" font-size="11" fill="#a9b2bc" transform="rotate(-90 12 '+(rows.length*17)+')">IT ↑ / OT ↓</text></svg>';
  return out;
}

/* ================= STATION 3 — EVIDENCE LOCKER ================= */
function stEvidence(){
  var curTab = S.etab || "inv";
  var h='<div class="panel"><h3><span class="n">03</span> Evidence locker — all artifacts synthetic</h3>'
    +'<p class="lead">Seven artifacts from the incident window. '+(S.mode==="hard"?"In Hard mode nothing is flagged for you and the flow table mixes violations with herrings.":"Medium flags the 12 devices you must classify and the 4 config lines to tag.")+'</p>'
    +'<div class="tabs" role="tablist">'
    +'<button class="tab'+(curTab==="inv"?" active":"")+'" data-etab="inv" role="tab" aria-selected="'+(curTab==="inv")+'">Device inventory</button>'
    +'<button class="tab'+(curTab==="cfg"?" active":"")+'" data-etab="cfg" role="tab" aria-selected="'+(curTab==="cfg")+'">Configs &amp; audit</button>'
    +'<button class="tab'+(curTab==="flow"?" active":"")+'" data-etab="flow" role="tab" aria-selected="'+(curTab==="flow")+'">NetFlow / alerts</button>'
    +(S.mode==="hard"?'<button class="tab'+(curTab==="noisy"?" active":"")+'" data-etab="noisy" role="tab" aria-selected="'+(curTab==="noisy")+'">Noisy flow table</button>':'')
    +'</div>';
  /* inventory */
  h+='<div id="etab-inv" style="display:'+(curTab==="inv"?"":"none")+'"><div class="tblwrap"><table class="ev"><thead><tr><th>Host</th><th>IP</th><th>Protocol</th><th>Location</th><th>Notes</th><th>'+(S.mode==="hard"?"Class (H2 support)":"Class — assign for M4")+'</th></tr></thead><tbody>';
  DEVICES.forEach(function(d){
    var sel='<select data-tag="'+d.id+'" aria-label="Class for '+d.n+'" '+(d.locked?"disabled":"")+'>'
      +'<option value="">— class —</option>';
    CLASSES.forEach(function(c){ sel+='<option value="'+c[0]+'"'+((S.tags[d.id]||"")===c[0]?" selected":"")+'>'+c[1]+'</option>'; });
    sel+='</select>';
    h+='<tr><td><b>'+d.n+'</b>'+(d.locked?' <span class="tag">pre-placed</span>':'')+'</td><td>'+d.ip+'</td><td>'+d.p+'</td><td>'+d.loc+'</td><td class="wrap" style="white-space:normal;color:var(--dim)">'+d.note+'</td><td>'+sel+'</td></tr>';
  });
  h+='</tbody></table></div>'
    +(S.mode==="medium"?objCardInline("M4"):'<div class="note">Classification feeds H1 and the zoning exam — no separate check, but wrong classes will betray you on the Zone Board.</div>')
    +'</div>';
  /* configs */
  h+='<div id="etab-cfg" style="display:'+(curTab==="cfg"?"":"none")+'"><div class="note">Click a line to tag it as a policy violation ('+(S.mode==="hard"?"H2 — exactly 6":"M6 — exactly 4")+'). Click again to untag.</div>';
  CONFIGS.forEach(function(c){
    h+='<div class="cfg"><div class="cfghead">'+c.title+'</div>';
    c.lines.forEach(function(l){
      var t=S.tagged[l.id];
      h+='<div class="cfgline'+(t?" tagged":"")+'" data-cline="'+l.id+'" role="button" tabindex="0" aria-pressed="'+(!!t)+'" aria-label="Config line: '+l.tx.replace(/"/g,"")+'">'
        +'<span class="ln">'+l.id+'</span><span class="tx">'+l.tx.replace(/</g,"&lt;")+'</span><span class="fl">'+(t?'<span class="tag bad">VIOLATION</span>':'')+'</span></div>';
    });
    h+='</div>';
  });
  h+=(S.mode==="medium"?objCardInline("M6"):objCardInline("H2"))+'</div>';
  /* breach form */
  h+='<div style="margin-top:4px">'+breachForm()+'</div>';
  /* flows */
  h+='<div id="etab-flow" style="display:'+(curTab==="flow"?"":"none")+'"><div class="tblwrap"><table class="ev"><thead><tr><th>Time</th><th>Source</th><th>Destination</th><th>Observation</th></tr></thead><tbody>';
  ALERTS.forEach(function(a){
    h+='<tr><td>'+a.t+'</td><td>'+DEV[a.src].n+' <span style="color:var(--faint)">'+DEV[a.src].ip+'</span></td><td>'+a.dst+'</td><td class="wrap" style="white-space:normal">'+a.info+'</td></tr>';
  });
  h+='</tbody></table></div><div class="note">The same six alerts await triage in Commissioning (M8) — verdicts there must match what you conclude here.</div></div>';
  /* noisy (hard) */
  if(S.mode==="hard"){
    h+='<div id="etab-noisy" style="display:'+(curTab==="noisy"?"":"none")+'"><div class="note warn">Combined flow table — six of these rows are real violations, two are legitimate operations. Verdict every row for '+termSpan("H9")+' in Commissioning, or right here.</div><div class="tblwrap"><table class="ev"><thead><tr><th>#</th><th>Flow</th><th>Verdict</th></tr></thead><tbody>';
    NOISY.forEach(function(r){
      h+='<tr><td>'+r.id+'</td><td class="wrap" style="white-space:normal">'+r.f+'</td><td><select data-noisy="'+r.id+'" aria-label="Verdict for flow '+r.id+'"><option value="">—</option><option value="v"'+(S.noisy[r.id]==="v"?" selected":"")+'>VIOLATION</option><option value="b"'+(S.noisy[r.id]==="b"?" selected":"")+'>BENIGN</option></select></td></tr>';
    });
    h+='</tbody></table></div>'+objCardInline("H9")+'</div>';
  }
  h+= '<div class="nextrow">'+backBtn(2,"Manual")+nextBtn("To the Zone Board",4)+'</div></div>';
  return h;
}
function breachForm(){
  var o=OBJ(S.mode==="hard"?"H1":"M5");
  var h='<div class="panel"><h3><span class="n">B</span> Breach reconstruction — '+(S.mode==="hard"?"H1, seven fields, strict":"M5, five fields")+'</h3>'
    +'<p class="lead">'+o.why+'</p><div class="grid2">';
  BREACH_Q.forEach(function(q){
    if(q.hard && S.mode!=="hard") return;
    var cur=S.breach[q.id]||"";
    h+='<div class="mcard"><div class="kicker">'+q.q+'</div><select data-breach="'+q.id+'" aria-label="'+q.q+'" style="width:100%;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px">'
      +'<option value="">— select —</option>';
    q.opts.forEach(function(op){
      var val=op; var show=q.label? q.label(op):op;
      h+='<option value="'+val.replace(/"/g,"&quot;")+'"'+(cur===val?" selected":"")+'>'+show+'</option>';
    });
    h+='</select></div>';
  });
  h+='</div><div class="obtns" style="margin-top:12px"><button class="btn sm" onclick="doCheck(\''+(S.mode==="hard"?"H1":"M5")+'\')">Check</button>'
    +'<button class="btn ghost sm" onclick="useHint(\''+(S.mode==="hard"?"H1":"M5")+'\')">'+icon("bulb",14)+' '+(S.mode==="hard"?"Nudge":"Hint")+'</button></div>'
    +'<div class="ofb" id="fb-'+(S.mode==="hard"?"H1":"M5")+'" data-ofb="'+(S.mode==="hard"?"H1":"M5")+'" role="status"></div></div>';
  return h;
}
function bindEvidence(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-etab]"),function(b){
    b.addEventListener("click",function(){
      var t=b.getAttribute("data-etab"); S.etab=t; save();
      Array.prototype.forEach.call(document.querySelectorAll("[data-etab]"),function(x){x.classList.remove("active");x.setAttribute("aria-selected","false");});
      b.classList.add("active"); b.setAttribute("aria-selected","true");
      ["inv","cfg","flow","noisy"].forEach(function(t2){
        var el=document.getElementById("etab-"+t2); if(el) el.style.display=(t2===t)?"":"none";
      });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-tag]"),function(sel){
    sel.addEventListener("change",function(){ S.tags[sel.getAttribute("data-tag")]=sel.value||undefined; save(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cline]"),function(el){
    function flip(){ var id=el.getAttribute("data-cline"); S.tagged[id]=!S.tagged[id]; if(!S.tagged[id]) delete S.tagged[id]; save(); renderAll();
      var again=document.querySelector('[data-cline="'+id+'"]'); if(again) again.focus(); }
    el.addEventListener("click",flip);
    el.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); flip(); } });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-breach]"),function(sel){
    sel.addEventListener("change",function(){ S.breach[sel.getAttribute("data-breach")]=sel.value||undefined; save(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-noisy]"),function(sel){
    sel.addEventListener("change",function(){ S.noisy[sel.getAttribute("data-noisy")]=sel.value||undefined; save(); });
  });
}
/* ================= STATION 4 — ZONE BOARD ================= */
var SVC = [["any","any"],["modbus","Modbus/TCP 502"],["mqtt","MQTT 1883"],["bacnet","BACnet 47808"],["https","HTTPS 443"],["smb","SMB 445"],["dnp3","DNP3 20000"],["rdp","RDP 3389"]];
function stZoneBoard(){
  var h='<div class="panel"><h3><span class="n">04</span> Zone board — the IT/OT convergence riser</h3>'
    +'<p class="lead">Every tile currently lives in the red <b>FLATNET trunk</b> — that is the whole vulnerability. Give each device a home in the zone bays below (the two DMZ hosts are pre-placed), then hang <b>gate rules</b> on the boundaries. When you are done, trace the attacker\u2019s chain against your design.</p>';
  /* flatnet tray */
  var flatLeft=MOVESET.filter(function(id){return (S.zones[id]||"FLAT")==="FLAT";});
  h+='<div class="flatnet"><h4><span class="tag bad">FLATNET</span> VLAN 1 trunk — '+(flatLeft.length)+' device(s) still unsegmented</h4><div class="tiles">';
  flatLeft.forEach(function(id){ h+=tileHTML(id,"FLAT"); });
  if(!flatLeft.length) h+='<span class="rrempty" style="width:100%">Trunk empty — blast radius contained.</span>';
  h+='</div></div>';
  /* bays */
  h+='<div class="bays">';
  ZOPTS.forEach(function(zid){
    var z=ZONE[zid];
    var inside=DEVICES.filter(function(d){ return (S.zones[d.id]||"FLAT")===zid || (d.locked && d.z===zid); });
    h+='<div class="bay'+(z.hazard?" hazard":"")+'" style="--zc:'+z.color+'"><h4 style="color:'+z.color+'">'+z.name+'</h4><div class="bayd">'+z.desc+'</div><div class="tiles">';
    if(!inside.length) h+='<span style="font-size:11.5px;color:var(--faint)">empty bay</span>';
    inside.forEach(function(d){ h+=tileHTML(d.id,zid); });
    h+='</div></div>';
  });
  h+='</div>';
  h+=objCardInline(S.mode==="hard"?"H3":"M10");
  if(S.mode==="medium") h+='<div class="note">Zoning is checked live by M10 once every tile is placed. Rules (M9) have their own check.</div>';
  /* rule builder */
  h+='<div class="gates"><h3 style="font-size:13px;letter-spacing:.2em;color:var(--amber);text-transform:uppercase">Gate rules — deny by default, allow by exception</h3>'
    +'<p class="lead" style="margin-bottom:8px">Anything not allowed here is denied by default (M1030). Sources and destinations are zones; <b>ALL</b> means every internal zone; <b>INTERNET</b> means outbound. '+(S.mode==="medium"?"The core policy needs 8 rules (M9).":"The full commissioning policy needs 11 rules (H3) — including the brokered corporate path.")+'</p>'
    +'<div id="rulelist">';
  if(!(S.rules||[]).length) h+='<div class="rrempty">No gates built yet — the flat net is still wide open.</div>';
  (S.rules||[]).forEach(function(r,i){ h+=ruleRowHTML(r,i); });
  h+='</div>'
    +'<div class="nextrow"><button class="btn ghost" id="addrule">'+icon("zones")+' Add gate rule</button>'
    +(S.mode==="medium"?objCardInlineInline("M9"):objCardInlineInline("H4"))+'</div>';
  /* trace */
  h+='<div class="panel" style="margin-top:16px"><h3><span class="n">T</span> Trace the breach — replay the incident against your design</h3>'
    +'<p class="lead">Runs the real chain from the briefing through your zones and gates. In the flat net every step lands; after a correct redesign every step dies.</p>'
    +'<button class="btn ghost" id="btn-trace">'+icon("eye")+' Run trace</button><div class="trace" id="traceout" aria-live="polite"></div></div>';
  h+='<div class="nextrow">'+backBtn(3,"Evidence")+'</div></div>';
  return h;
}
function objCardInlineInline(id){ return objCardInline(id); } /* inline card for the gate-policy objective */
function tileHTML(id,zid){
  var d=DEV[id];
  var opts='<option value="FLAT">FLATNET</option>';
  ZOPTS.forEach(function(z){ opts+='<option value="'+z+'"'+(zid===z?" selected":"")+'>'+ZONE[z].name+'</option>'; });
  var clsTag = S.tags[id] ? '<span class="cls-tag">'+(CLASSES.filter(function(c){return c[0]===S.tags[id];})[0]||["","?"])[1]+'</span>' : (d.cls && S.mode==="hard" ? '<span class="cls-tag">'+(CLASSES.filter(function(c){return c[0]===d.cls;})[0]||["","?"])[1]+'</span>' : "");
  return '<span class="tile'+(zid!=="FLAT"?" inplace":"")+'" style="--zc:'+(zid!=="FLAT"?ZONE[zid].color:"#e2695e")+'" title="'+d.n+' — '+d.p+'">'
    +(d.locked?icon("lock",12):"")
    +'<span class="tn">'+d.n+'</span>'+clsTag
    +(d.locked?'<span class="ti">'+d.ip+'</span>':'<select data-zone="'+id+'" aria-label="Zone for '+d.n+'">'+opts+'</select>')
    +'</span>';
}
function ruleRowHTML(r,i){
  var zopts=function(sel,extra){
    var o='<option value="">src/dst</option>';
    ZOPTS.forEach(function(z){ o+='<option value="'+z+'"'+(sel===z?" selected":"")+'>'+ZONE[z].name+'</option>'; });
    (extra||[]).forEach(function(e){ o+='<option value="'+e[0]+'"'+(sel===e[0]?" selected":"")+'>'+e[1]+'</option>'; });
    return o;
  };
  var sopts=""; SVC.forEach(function(s2){ sopts+='<option value="'+s2[0]+'"'+(r.v===s2[0]?" selected":"")+'>'+s2[1]+'</option>'; });
  var dstExtra=[["ALL","ALL INTERNAL ZONES"],["INT","INTERNET"]];
  var srcExtra=[];
  return '<div class="rrow">'
    +'<select data-rp="'+i+'" data-rf="a" aria-label="Action of rule '+(i+1)+'"><option value="allow"'+(r.a==="allow"?" selected":"")+'>ALLOW</option><option value="deny"'+(r.a==="deny"?" selected":"")+'>DENY</option></select>'
    +'<select data-rp="'+i+'" data-rf="s" aria-label="Source zone of rule '+(i+1)+'">'+zopts(r.s,srcExtra)+'</select>'
    +'<span class="mono" style="color:var(--faint)">→</span>'
    +'<select data-rp="'+i+'" data-rf="d" aria-label="Destination zone of rule '+(i+1)+'">'+zopts(r.d,dstExtra)+'</select>'
    +'<select data-rp="'+i+'" data-rf="v" aria-label="Service of rule '+(i+1)+'">'+sopts+'</select>'
    +'<button class="rr-x" data-rdel="'+i+'" aria-label="Delete rule '+(i+1)+'">×</button>'
    +'</div>';
}
function bindZoneBoard(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-zone]"),function(sel){
    sel.addEventListener("change",function(){ S.zones[sel.getAttribute("data-zone")]=sel.value||"FLAT"; save(); renderAll(); });
  });
  var add=document.getElementById("addrule");
  if(add) add.addEventListener("click",function(){ S.rules.push({a:"deny",s:"",d:"",v:"any"}); save(); renderAll(); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-rp]"),function(sel){
    sel.addEventListener("change",function(){
      var i=parseInt(sel.getAttribute("data-rp"),10), f=sel.getAttribute("data-rf");
      S.rules[i][f]=sel.value; save();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-rdel]"),function(b){
    b.addEventListener("click",function(){ S.rules.splice(parseInt(b.getAttribute("data-rdel"),10),1); save(); renderAll(); });
  });
  var tr=document.getElementById("btn-trace");
  if(tr) tr.addEventListener("click",runTrace);
}
function evalStep(srcId,dstId){
  var sz=S.zones[srcId]||"FLAT";
  var dz = dstId==="INT" ? "INT" : (S.zones[dstId]||"FLAT");
  var internal={"IoT":1,"IIoT":1,"L1":1,"L2":1,"L3":1,"L35":1,"GST":1,"BYD":1,"CRP":1};
  if(sz==="FLAT"||dz==="FLAT"||sz===dz) return {p:true,why: sz===dz? "same segment":"flat net — no gate exists"};
  var allowed=null, denied=null;
  (S.rules||[]).forEach(function(r){
    if(!r.s||!r.d) return;
    var smatch = r.s===sz || (r.d==="ALL"&&false);
    var dmatch = r.d===dz || (r.d==="ALL"&&internal[dz]) || (r.d==="INT"&&!internal[dz]);
    if(r.s===sz && dmatch){ if(r.a==="allow") allowed=r; if(r.a==="deny") denied=r; }
    if(r.d==="ALL"&&internal[dz]&&r.s===sz){ if(r.a==="allow") allowed=r; if(r.a==="deny") denied=r; }
  });
  if(denied) return {p:false,why:"DENY rule "+denied.s+"→"+denied.d+" fires at the gate"};
  if(allowed) return {p:true,why:"ALLOW rule "+allowed.s+"→"+allowed.d+" ("+allowed.v+")"};
  return {p:false,why:"no allow rule — default-deny at the "+sz+"/"+dz+" gate"};
}
function runTrace(){
  var steps=[
    ["cam-lobby","cam-lobby","02:13 — camera authenticates attacker (default credentials)","This step is credential hygiene — segmentation cannot stop the login itself, only what the device can reach next."],
    ["cam-lobby","hmi-line","02:47 — camera → HMI workstation (SMB)",""],
    ["cam-lobby","historian","02:31 — camera sweep → historian ports",""],
    ["hmi-line","plc-pasteur","03:02 — HMI → pasteurizer PLC (Modbus fc6 write)",""],
    ["hmi-line","fridge-ctl","03:05 — attacker attempts refrigeration controller",""],
    ["plc-line1","INT","03:12 — PLC-initiated internet egress",""]
  ];
  var out="";
  steps.forEach(function(st){
    var e=evalStep(st[0],st[1]);
    var extra = st[3] ? " "+st[3] : "";
    out+='<div class="tr-step '+(e.p?"passed":"blocked")+'"><span class="mono" style="color:var(--faint)">'+st[2]+'</span>'
      +'<span class="verdict" style="color:'+(e.p?"var(--red)":"var(--green)")+'">'+(e.p?"REACHED":"BLOCKED")+'</span>'
      +'<div style="width:100%;color:var(--dim);font-size:12px">'+DEV[st[0]].n+' → '+(st[1]==="INT"?"INTERNET":DEV[st[1]].n)+' — '+e.why+'.'+extra+'</div></div>';
  });
  var pass=steps.filter(function(st){return evalStep(st[0],st[1]).p;}).length;
  out+='<div class="note'+(pass>2?" warn":"")+'"><b>Trace summary:</b> '+pass+' of '+steps.length+' attacker steps got through'+(pass>2?" — tighten zoning and gates (note: the first step is credentials, which no gate stops; only reach matters).":" — the flat net highway is closed.")+'</div>';
  document.getElementById("traceout").innerHTML=out;
}

/* ================= STATION 5 — COMMISSIONING ================= */
function stCommission(){
  var h='<div class="panel"><h3><span class="n">05</span> Commissioning — detection &amp; mitigation</h3>'
    +'<p class="lead">Zones and gates exist on paper. Now make them observable (detection) and durable (mitigation), and argue the trade-offs.</p>'
    /* M7 sources */
    +'<div class="panel"><h3><span class="n">D1</span> Detection data sources</h3><p class="lead">Which four sources actually see zone-policy violations? D3FEND\'s Isolate tactic covers exactly this ground — its Broadcast Domain Isolation countermeasure (D3-BDI) is the formal name for VLAN-style zoning — but only some telemetry makes violations visible.</p><div class="grid2">';
  perm(SOURCES,P_SRC).forEach(function(x){
    h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-src="'+x.id+'" '+(S.sources.indexOf(x.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-family:var(--mono);font-size:12.5px">'+x.n+'</span></label>';
  });
  h+='</div>'+objCardInline("M7")+'</div>';
  /* M8 triage */
  h+='<div class="panel"><h3><span class="n">D2</span> Alert triage</h3><p class="lead">Six alerts from the incident window. Verdict each: true policy violation or false positive — and pick the reason. Feedback teaches, stars tolerate.</p>';
  ALERTS.forEach(function(a){
    var cur=S.alerts[a.id]||{};
    h+='<div class="mcard" style="margin-bottom:10px"><div class="kicker">'+a.t+' · '+DEV[a.src].n+' → '+a.dst+'</div>'
      +'<p style="font-family:var(--mono);font-size:12.5px;margin-bottom:8px">'+a.info+'</p>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">'
      +'<label style="display:flex;gap:6px;align-items:center"><input type="radio" name="vd-'+a.id+'" data-vd="'+a.id+'" value="true" '+(cur.verdict===true?"checked":"")+'><span>TRUE violation</span></label>'
      +'<label style="display:flex;gap:6px;align-items:center"><input type="radio" name="vd-'+a.id+'" data-vd="'+a.id+'" value="false" '+(cur.verdict===false?"checked":"")+'><span>FALSE positive</span></label>'
      +'<select data-ars="'+a.id+'" aria-label="Reason for alert '+a.id+'" style="flex:1;min-width:200px;min-height:40px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:7px">'
      +'<option value="">— reason —</option>';
    perm(REASONS,P_REASONS).forEach(function(r){ h+='<option value="'+r[0]+'"'+(cur.reason===r[0]?" selected":"")+'>'+r[1]+'</option>'; });
    h+='</select></div></div>';
  });
  h+=objCardInline("M8")+'</div>';
  /* M11 controls */
  h+='<div class="panel"><h3><span class="n">M1</span> Control matching</h3><p class="lead">Seven zone needs, one best-fit control each.</p><div class="grid2">';
  perm(NEEDS,P_NEEDS).forEach(function(n){
    h+='<div class="mcard"><div class="kicker">'+n.need+'</div><select data-ctl="'+n.id+'" aria-label="Control for: '+n.need+'" style="width:100%;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px"><option value="">— control —</option>';
    perm(CONTROLS,P_CONTROLS).forEach(function(c){ h+='<option value="'+c.id+'"'+(S.controls[n.id]===c.id?" selected":"")+'>'+c.n+'</option>'; });
    h+='</select></div>';
  });
  h+='</div>'+objCardInline("M11")+'</div>';
  /* M12 fridge */
  h+='<div class="panel"><h3><span class="n">M2</span> OT trade-off — the refrigeration controller</h3>'
    +'<p class="lead"><b>fridge-ctl</b>: legacy firmware, food-safety critical, and the attacker\u2019s attempted final target. Availability-first does not mean do-nothing. Pick the correct treatment bundle (four of six).</p><div class="grid2">';
  perm(FRIDGE,P_FRIDGE).forEach(function(f){
    h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-fr="'+f.id+'" '+(S.fridge.indexOf(f.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-size:12.5px">'+f.n+'</span></label>';
  });
  h+='</div>'+objCardInline("M12")+'</div>';
  /* HARD extras */
  if(S.mode==="hard"){
    /* H5 sequence */
    h+='<div class="panel"><h3><span class="n">H5</span> Legacy-PLC rollout sequencing</h3><p class="lead">plc-line1 runs 2011 firmware. Choose the four correct moves and put them in order — the other three must stay unused.</p><div class="grid2">';
    for(var i=1;i<=4;i++){
      h+='<div class="mcard"><div class="kicker">STEP '+i+'</div><select data-seq="'+i+'" aria-label="Rollout step '+i+'" style="width:100%;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px"><option value="">— step —</option>';
      perm(SEQSTEPS,P_SEQ).forEach(function(s2){ h+='<option value="'+s2.id+'"'+(S.seq[String(i)]===s2.id?" selected":"")+'>'+s2.n+'</option>'; });
      h+='</select></div>';
    }
    h+='</div>'+objCardInline("H5")+'</div>';
    /* H6 detection builder */
    h+='<div class="panel"><h3><span class="n">H6</span> Detection engineering — build &amp; tune</h3><p class="lead">Pick the conditions that catch violations without flooding the SOC, then whitelist the two known-benign flows.</p><div class="grid2">';
    perm(CONDS,P_CONDS).forEach(function(c){
      h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-cond="'+c.id+'" '+(S.conds.indexOf(c.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-family:var(--mono);font-size:12px">'+c.n+'</span></label>';
    });
    h+='</div><div class="kicker" style="margin-top:10px">WHITELIST (known-benign, keep the SOC quiet)</div><div class="grid2">';
    perm(ALERTS.filter(function(a){return !a.verdict;}),P_WL).forEach(function(a){
      h+='<label class="mcard" style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-wl="'+a.id+'" '+(S.whitelist.indexOf(a.id)>=0?"checked":"")+' style="width:20px;height:20px;accent-color:var(--amber)"><span style="font-size:12.5px">'+a.t+' · '+DEV[a.src].n+' → '+a.dst+'</span></label>';
    });
    h+='</div>'+objCardInline("H6")+'</div>';
    /* H7 wireless */
    h+='<div class="panel"><h3><span class="n">H7</span> Wireless hardening — guest &amp; BYOD</h3><p class="lead">Set every switch and VLAN to its hardened state. The OFF switches matter as much as the ON ones.</p><div class="grid2">';
    h+='<div class="mcard"><h4 style="color:var(--violet)">GUEST WLAN</h4>';
    WLAN.guest.concat(WLAN.guestOff).forEach(function(t){ h+=toggleHTML(t,"g"); });
    h+='<div class="tglrow"><span class="tl">'+WLAN.guestSel.n+'</span><select data-wl-sel="'+WLAN.guestSel.id+'" aria-label="'+WLAN.guestSel.n+'"><option value=""></option>';
    WLAN.guestSel.opts.forEach(function(o2){ h+='<option value="'+o2+'"'+(S.wlan[WLAN.guestSel.id]===o2?" selected":"")+'>'+ZONE[o2].name+'</option>'; });
    h+='</select></div></div>';
    h+='<div class="mcard"><h4 style="color:var(--pink)">BYOD WLAN</h4>';
    WLAN.byod.concat(WLAN.byodOff).forEach(function(t){ h+=toggleHTML(t,"b"); });
    h+='<div class="tglrow"><span class="tl">'+WLAN.byodSel.n+'</span><select data-wl-sel="'+WLAN.byodSel.id+'" aria-label="'+WLAN.byodSel.n+'"><option value=""></option>';
    WLAN.byodSel.opts.forEach(function(o2){ h+='<option value="'+o2+'"'+(S.wlan[WLAN.byodSel.id]===o2?" selected":"")+'>'+ZONE[o2].name+'</option>'; });
    h+='</select></div></div>';
    h+='</div>'+objCardInline("H7")+'</div>';
    /* H8 picks */
    h+='<div class="panel"><h3><span class="n">H8</span> Control selection under constraints</h3><p class="lead">Three scenarios, one best control each — the constraint names the mechanism.</p><div class="grid2">';
    PICKS.forEach(function(p){
      h+='<div class="mcard"><div class="kicker">'+p.sc+'</div><select data-pick="'+p.id+'" aria-label="Control for scenario '+p.id+'" style="width:100%;min-height:44px;background:var(--panel3);color:var(--ink);border:1px solid var(--line2);border-radius:6px;padding:8px"><option value="">— control —</option>';
      perm(CONTROLS,P_CONTROLS).forEach(function(c){ h+='<option value="'+c.id+'"'+(S.picksH8[p.id]===c.id?" selected":"")+'>'+c.n+'</option>'; });
      h+='</select></div>';
    });
    h+='</div>'+objCardInline("H8")+'</div>';
  }
  h+='<div class="nextrow">'+backBtn(4,"Zone Board")+nextBtn("Take the Shift Exam",6)+'</div></div>';
  return h;
}
function toggleHTML(t,grp){
  var on=S.wlan[t.id]===true;
  return '<div class="tglrow"><span style="flex:1"><span class="tl">'+t.n+'</span><br><span class="td2">'+t.d+'</span></span>'
    +'<span class="switch"><input type="checkbox" data-wl-t="'+t.id+'" '+(on?"checked":"")+' aria-label="'+t.n+'"><span class="sl"></span></span></div>';
}
function bindCommission(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-src]"),function(el){ el.addEventListener("change",function(){ syncArr("sources",el.getAttribute("data-src"),el.checked); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-fr]"),function(el){ el.addEventListener("change",function(){ syncArr("fridge",el.getAttribute("data-fr"),el.checked); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cond]"),function(el){ el.addEventListener("change",function(){ syncArr("conds",el.getAttribute("data-cond"),el.checked); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-wl]"),function(el){ el.addEventListener("change",function(){ syncArr("whitelist",el.getAttribute("data-wl"),el.checked); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-vd]"),function(el){
    el.addEventListener("change",function(){
      var id=el.getAttribute("data-vd"); S.alerts[id]=S.alerts[id]||{};
      S.alerts[id].verdict = el.value==="true"; save();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ars]"),function(el){
    el.addEventListener("change",function(){ var id=el.getAttribute("data-ars"); S.alerts[id]=S.alerts[id]||{}; S.alerts[id].reason=el.value||undefined; save(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ctl]"),function(el){ el.addEventListener("change",function(){ S.controls[el.getAttribute("data-ctl")]=el.value||undefined; save(); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-seq]"),function(el){ el.addEventListener("change",function(){ S.seq[el.getAttribute("data-seq")]=el.value||undefined; save(); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-wl-t]"),function(el){ el.addEventListener("change",function(){ S.wlan[el.getAttribute("data-wl-t")]=el.checked; save(); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-wl-sel]"),function(el){ el.addEventListener("change",function(){ S.wlan[el.getAttribute("data-wl-sel")]=el.value||undefined; save(); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-pick]"),function(el){ el.addEventListener("change",function(){ S.picksH8[el.getAttribute("data-pick")]=el.value||undefined; save(); }); });
}
function syncArr(key,id,on){
  var a=S[key]; var i=a.indexOf(id);
  if(on && i<0) a.push(id);
  if(!on && i>=0) a.splice(i,1);
  save();
}
