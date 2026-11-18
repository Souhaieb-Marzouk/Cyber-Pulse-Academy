/* The Flat Net Incident — static build (N10-009 4.6).
   js/completion.js — Station 7 handover + completion report modal.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= STATION 7 — HANDOVER ================= */
function stHandover(){
  var h='<div class="panel"><h3><span class="n">07</span> Handover — field notes for the next shift</h3>'
    +'<p class="lead">Synthesis time. This is what you should carry out of Objective 4.6 — and what a real network engineer writes into the runbook.</p>'
    +'<div class="panel" style="background:var(--panel2)"><h3 style="color:var(--violet)">DETECTION OPPORTUNITIES</h3><div class="tblwrap"><table class="ev"><thead><tr><th>Data source</th><th>Example detection logic</th></tr></thead><tbody>'
    +'<tr><td>Zone-gate firewall / NetFlow</td><td class="wrap" style="white-space:normal">alert on src_zone ∈ {IoT, IIoT, Guest, BYOD} AND dst_zone internal — any cross from an untrusted class is a finding</td></tr>'
    +'<tr><td>NAC / 802.1X admission</td><td class="wrap" style="white-space:normal">alert on new MAC not in inventory, or any device failing posture on the BYOD WLAN</td></tr>'
    +'<tr><td>NetFlow behavioral</td><td class="wrap" style="white-space:normal">alert on internal host touching &gt; 5 distinct internal peers in 5 min (the camera sweep pattern)</td></tr>'
    +'<tr><td>OT protocol audit</td><td class="wrap" style="white-space:normal">alert on Modbus fc5/fc6 write where src ≠ eng-ws, and on any BACnet write to fire-panel</td></tr>'
    +'</tbody></table></div></div>'
    +'<div class="panel" style="background:var(--panel2)"><h3 style="color:var(--amber)">MITIGATION RECOMMENDATIONS</h3>'
    +'<p class="lead">Anchored on <b>MITRE M1030 Network Segmentation</b>: segment critical systems by function and risk; broker IT/OT through a DMZ; deny-by-default ACLs in both directions; monitor flows; and periodically <b>test effectiveness</b>. Per class: IoT → own zone + egress allow-list · IIoT → one monitored northbound path · SCADA/ICS → L1-L2 with write-restricted engineering access · OT → L3 with passive monitoring and patch windows · Guest → internet-only portal · BYOD → MDM + 802.1X + dedicated zone. M1030\'s official technique coverage includes T1046, T1210, T1021.001 and T1565.003 — every one of them dies at a properly built gate.</p></div>'
    +'<div class="grid2">'
    +'<div class="mcard"><h4 style="color:var(--steel)">Blue-team takeaways</h4><ul>'
    +'<li>Flat nets make every alert ambiguous; zones make violations one-line detections.</li>'
    +'<li>Admission before reach: NAC/802.1X/MDM decide who gets on the wire at all.</li>'
    +'<li>Protocol-aware beats port-aware in OT: watch WHO writes, not just which port.</li>'
    +'<li>Broker, don\u2019t bridge: guest, BYOD and corporate reach OT only through DMZ paths.</li>'
    +'<li>Test the gates periodically — a segmentation design you have not traced is a rumor.</li></ul></div>'
    +'<div class="mcard"><h4 style="color:var(--red)">Red-team mindset takeaways</h4><ul>'
    +'<li>Default-credential IoT devices are doors; flatness decides how far they open.</li>'
    +'<li>The juiciest pivot target is usually a dual-purpose host (HMI with SMB open).</li>'
    +'<li>Benign telemetry (brewers, backups) is camouflage — live in it, don\u2019t create it.</li>'
    +'<li>One broad allow rule can silently rebuild every highway the design removed.</li></ul></div>'
    +'</div>'
    +'<div class="panel" style="background:var(--panel2)"><h3 style="color:var(--teal)">OFFICIAL REFERENCES (open in new tab)</h3>'
    +'<ul style="margin-left:18px;font-size:13.5px">';
  LINKS.forEach(function(l){ h+='<li style="margin:4px 0"><a href="'+l[1]+'" target="_blank" rel="noopener noreferrer">'+l[0]+' ↗</a></li>'; });
  h+='</ul><p class="lead" style="font-size:12.5px;margin-top:6px">MITRE IDs verified against attack.mitre.org on 2026-11-09. D3FEND is referenced at concept level (Isolate tactic) only.</p></div>'
    +'<div class="nextrow">'+backBtn(6,"Exam")
    +'<button class="btn" id="btn-report">'+icon("flask")+' File shift report</button></div>'
    +'<div class="note">The report button activates when every objective in this mode is checked off and the exam is finished. Stars reflect first-attempt accuracy and hint discipline.</div></div>';
  return h;
}
function bindHandover(){
  var b=document.getElementById("btn-report"); if(!b) return;
  var allDone = objDoneCount()===activeObjs().length && S.quiz.done;
  if(allDone){ b.addEventListener("click",showCompletion); }
  else {
    b.disabled=true;
    var missing=activeObjs().filter(function(id){return !(S.obj[id]&&S.obj[id].done);});
    b.title="Missing: "+missing.join(", ")+(S.quiz.done?"":" + exam");
    b.addEventListener("click",function(){ toast("Not yet: "+(missing.length? missing.length+" objective(s) open":"exam unfinished")+"."); });
  }
}

/* ================= COMPLETION ================= */
function showCompletion(){
  var done=objDoneCount(), tot=activeObjs().length;
  var byP={U:[0,0],R:[0,0],D:[0,0],M:[0,0]};
  activeObjs().forEach(function(id){
    var o=OBJ(id); byP[o.p][1]++;
    if(S.obj[id]&&S.obj[id].done) byP[o.p][0]++;
  });
  var correct=S.quiz.answers.filter(function(a){return a&&a.ok;}).length;
  /* focus areas derived from this student's actual evidence (audit R8) */
  var focus=[];
  activeObjs().forEach(function(id){
    var st=S.obj[id];
    if(st&&st.done&&(st.attempts>1||st.hints>0))
      focus.push("Replay station "+OBJ(id).st+" — "+OBJ(id).title+" ("+(st.attempts>1?st.attempts+" checks":"")+(st.attempts>1&&st.hints>0?", ":"")+(st.hints>0?st.hints+" hint"+(st.hints>1?"s":"")+" used":"")+")");
  });
  (S.quiz.answers||[]).forEach(function(a,i){
    if(a&&!a.ok){ var f=(S.mode==="hard"?FOCUS_H:FOCUS_M)[i]; if(f) focus.push("Re-read the manual on "+f+" (exam Q"+(i+1)+" was missed)"); }
  });
  if(!focus.length) focus.push("None. Flawless shift: every objective fell on the first check with no hints, and the exam was clean. Go deeper anyway: ATT&CK for ICS and M1030's full technique table.");
  var h='<h3>Shift report — '+(S.mode==="hard"?"rough shift":"guided shift")+'</h3>'
    +'<div style="text-align:center;margin:10px 0"><div class="stars" role="img" aria-label="'+starCount()+' of 5 stars">'+starStr()+'</div>'
    +'<div class="lead" style="margin-top:6px">Mastery <b>'+mastery()+'%</b> · objectives <b>'+done+'/'+tot+'</b> · exam <b>'+correct+'/'+quizBank().length+'</b> · hints used <b>'+hintCostTotal()+'</b></div></div>'
    +'<div class="pillarbox">';
  Object.keys(byP).forEach(function(p){
    h+='<div class="mcard" style="text-align:center"><span class="pill '+p+'" style="border-color:'+PILLAR[p][2]+';color:'+PILLAR[p][2]+'">'+PILLAR[p][1]+'</span><div class="mono" style="margin-top:6px;font-size:16px">'+byP[p][0]+'/'+byP[p][1]+'</div></div>';
  });
  h+='</div>'
    +'<div class="panel" style="background:var(--panel2);margin-top:10px"><h3 style="color:var(--red)">FOCUS AREAS FOR YOUR NEXT SHIFT</h3>'
    +'<ul style="margin-left:18px;font-size:13px">'+focus.map(function(f){return '<li style="margin:4px 0">'+f+'</li>';}).join('')+'</ul>'
    +'<p class="lead" style="font-size:12px;margin-top:6px">Derived from your own checks and exam answers on this shift — start your next session there.</p></div>'
    +'<p class="lead"><b>You can now:</b> explain why each device class demands its own zone and where segmentation sits in the attack chain (M1030); classify real devices and spot the four-plus misconfigurations that betray them; reconstruct and trace a cross-zone attack chain; choose detection sources and tune true vs false positives; and design, justify and sequence zone policy with honest residual risk.</p>'
    +'<p class="lead"><b>Next steps:</b> replay the other mode — the environment is the same, the thinking is not. Then go deeper: M1030\u2019s full technique table, ATT&CK for ICS, and the N10-009 objective list around 4.6 (hardening 4.3 and attacks 4.7 interlock with this lesson).</p>'
    +'<div class="nextrow"><button class="btn ghost" onclick="closeModal()">Stay on the range</button><button class="btn" onclick="document.getElementById(\'btn-reset\').click()">Reset for a fresh shift</button></div>';
  S.reportFiled=true; save();
  showModal(h);
}

