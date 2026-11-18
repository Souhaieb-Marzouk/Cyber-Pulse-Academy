'use strict';
/* =====================================================================
   UI — DOM helpers and every panel renderer (intake bay, hard feed, harbor chart,
ledger, signal bench, briefing composer, review desk, exception desk, glossary,
orders board, completion modal). Rendering only; validation lives in objectives.js.
   ===================================================================== */

function $(id){return document.getElementById(id)}

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function zoneOf(sc){return sc<=4?'Low':sc<=9?'Moderate':sc<=14?'High':'Critical'}

function zoneKey(sc){return sc<=4?'low':sc<=9?'mod':sc<=10?'high':sc<=14?'high':'crit'}

function zClass(sc){return sc<=4?'zp-low':sc<=9?'zp-mod':sc<=14?'zp-high':'zp-crit'}

function fmtMoney(n){return '$'+Number(n).toLocaleString('en-US')}

function L_I(name,cur){return '<div class="row2"><div>'+selHtml(name+'L','Likelihood',[1,2,3,4,5],cur?cur[name+'L']:'')+'</div><div>'+selHtml(name+'I','Impact',[1,2,3,4,5],cur?cur[name+'I']:'')+'</div></div>'}

function riskCardHtml(r){
 var filed=S.reg&&S.reg[r.id]&&S.reg[r.id].filed;
 return '<article class="riskCard" data-risk="'+r.id+'"><h4><span class="rid">'+r.id+'</span> '+esc(r.name)+'</h4>'+
 '<ul class="ev"><li><b>Asset</b><span>'+esc(r.asset)+'</span></li>'+
 '<li><b>Threat</b><span>'+esc(r.threat)+'</span></li>'+
 '<li><b>Vulnerability</b><span>'+esc(r.vuln)+'</span></li>'+
 '<li><b>Impact if hit</b><span>'+esc(r.evI)+'</span></li>'+
 '<li><b>Likelihood sign</b><span>'+esc(r.evL)+'</span></li>'+
 '<li><b>Current mitigation</b><span>'+esc(r.cur)+'</span></li></ul>'+
 '<div class="files">'+(filed?'<span class="filedTag"><svg class="icon"><use href="#i-check"/></svg> In the ledger</span>':'<button class="fileBtn" data-file="'+r.id+'" type="button">File to ledger</button>')+'</div></article>';
}

function renderIntake(){var el=$('intakeList');el.innerHTML=RISKS.map(riskCardHtml).join('');}

function fileRisk(id){if(!S.reg)S.reg={};if(!S.reg[id])S.reg[id]={};S.reg[id].filed=true;if(!S.chart[id])S.chart[id]={inh:null,res:null};log('Vessel <strong>'+id+'</strong> reported in — file it on the chart.');renderAll();save()}

function feedItemHtml(f){
 var st=S.feed[f.id]||{filed:false};
 var h1done=S.mode==='hard'&&S.obj.H1&&S.obj.H1.done;
 if(f.kind!=='file'){return '<article class="riskCard" data-feed="'+f.id+'" style="opacity:.92"><h4><span class="rid" style="background:#5E6B74">'+f.id+'</span> Intake channel</h4><p style="font-size:.85rem;color:#33424C;margin-top:6px">'+esc(f.txt)+'</p></article>';}
 var dis=h1done?' disabled':'';
 var mini=st.filed?'<div class="miniForm"><div class="row3"><div><label>Category</label><select data-feedf="cat" data-feedid="'+f.id+'"'+dis+'>'+CATS.map(function(c){return '<option'+(st.cat===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select></div><div><label>Likelihood 1–5</label><select data-feedf="L" data-feedid="'+f.id+'"'+dis+'><option value="">–</option>'+[1,2,3,4,5].map(function(n){return '<option'+(String(st.L)===String(n)?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div><div><label>Impact 1–5</label><select data-feedf="I" data-feedid="'+f.id+'"'+dis+'><option value="">–</option>'+[1,2,3,4,5].map(function(n){return '<option'+(String(st.I)===String(n)?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div></div></div>':'';
 return '<article class="riskCard" data-feed="'+f.id+'"><h4><span class="rid">'+f.id+'</span> Unfiled report</h4><p style="font-size:.85rem;color:#33424C;margin-top:6px">'+esc(f.txt)+'</p><div class="files">'+(st.filed?'<span class="filedTag"><svg class="icon"><use href="#i-check"/></svg> Filed</span>':'<button class="fileBtn" data-feedfile="'+f.id+'" type="button"'+dis+'>File this report</button>')+'</div>'+mini+'</article>';
}

function renderFeed(){var el=$('hardFeed');if(!S.mode||S.mode!=='hard'){el.innerHTML='';return}el.innerHTML=FEED.map(feedItemHtml).join('')}

function fileFeed(id){if(!S.feed[id])S.feed[id]={filed:false};S.feed[id].filed=true;log('Report <strong>'+id+'</strong> taken aboard — complete its row.');renderAll();save()}

function carriedChip(){return S.carry||null}

function chipBtn(id,kind,sel){var cls='chip'+(kind==='res'?' res':'')+(sel?' sel':'');var extra=kind==='res'?' ✦':'';return '<button class="chipBtn" data-chip="'+id+'" data-kind="'+kind+'" type="button" aria-label="Vessel marker '+id+(kind==='res'?' residual':' inherent')+' — select to move"><span class="'+cls+'">'+id+extra+'</span></button>'}

function renderChart(){
 var c=$('chart');var html='<div class="axisY">';
 for(var L=5;L>=1;L--){html+='<span aria-hidden="true">L'+L+'<br><span style="font-weight:400">'+LBL_L[L]+'</span></span>'}
 html+='</div>';
 for(var L2=5;L2>=1;L2--){
  for(var I=1;I<=5;I++){
   var sc=L2*I,zk=zoneKey(sc);
   var chips='';
   var markerIds=RISKS.map(function(r){return r.id}).concat(S.mode==='hard'?FEED.filter(function(f){return f.kind==='file'}).map(function(f){return f.id}):[]);
   markerIds.forEach(function(id){var m=S.chart[id];if(m&&m.inh&&m.inh[0]===L2&&m.inh[1]===I){chips+=chipBtn(id,'inh',carriedChip()&&carriedChip().id===id&&carriedChip().kind==='inh')}});
   markerIds.forEach(function(id){var m=S.chart[id];if(m&&m.res&&m.res[0]===L2&&m.res[1]===I){chips+=chipBtn(id,'res',carriedChip()&&carriedChip().id===id&&carriedChip().kind==='res')}});
   html+='<div class="cell" data-z="'+zk+'" style="grid-row:'+(6-L2)+';grid-column:'+(I+1)+'">'+
     '<button class="cellBtn" data-cell="'+L2+'-'+I+'" type="button" aria-label="Chart cell likelihood '+L2+' '+LBL_L[L2]+', impact '+I+' '+LBL_I[I]+', score '+sc+' '+zoneOf(sc)+'"></button>'+chips+
     '<span class="scoreN" aria-hidden="true">'+sc+'</span></div>';
  }
 }
 html+='<div style="grid-row:6;grid-column:2/7;display:grid;grid-template-columns:repeat(5,1fr);gap:3px">';
 for(var I2=1;I2<=5;I2++){html+='<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:var(--sea);background:rgba(243,237,223,.06);border-radius:5px;text-align:center;line-height:1.05">I'+I2+'<br><span style="font-weight:400">'+LBL_I[I2]+'</span></span>'}
 html+='</div>';
 c.innerHTML=html;
 var docked=RISKS.filter(function(r){return S.reg&&S.reg[r.id]&&S.reg[r.id].filed&&(!S.chart[r.id]||!S.chart[r.id].inh)})
  .concat(S.mode==='hard'?FEED.filter(function(f){return f.kind==='file'&&S.feed[f.id]&&S.feed[f.id].filed&&(!S.chart[f.id]||!S.chart[f.id].inh)}).map(function(f){return {id:f.id,name:'Unfiled report '+f.id}}):[]);
 var dock= $('dockStrip');
 if(!dock){dock=document.createElement('div');dock.id='dockStrip';dock.style.cssText='margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center';$('towerLog').parentNode.insertBefore(dock,$('towerLog'))}
 var dockHtml=docked.length?'<span style="font-size:.8rem;color:#33424C;font-weight:700">Docked vessels waiting to be plotted:</span> ':'<span style="font-size:.8rem;color:#5E6B74;font-style:italic;font-family:var(--serif)">All filed vessels are on the chart.</span> ';
 docked.forEach(function(r){
  var isF=RISKS.some(function(x){return x.id===r.id});
  var m=isF?S.chart[r.id]:S.feed[r.id];
  dockHtml+='<button class="chipBtn" data-dock="'+r.id+'" type="button" aria-label="Select docked vessel '+r.id+' for plotting"><span class="chip'+(carriedChip()&&carriedChip().id===r.id?' sel':'')+'">'+r.id+'</span></button>';
 });
 dock.innerHTML=dockHtml;
 var ch=$('chartHint');
 var car=carriedChip();
 ch.innerHTML=car?'<b>'+car.id+(car.kind==='res'?' residual':'')+'</b> is in hand — click a chart cell to plot it.':(docked.length?'Docked vessels: click a vessel, then its cell.':'Select any marker on the chart to move it; click its cell again to keep it.');
}

function setChart(id,kind,L,I){if(!S.chart[id])S.chart[id]={inh:null,res:null};S.chart[id][kind]=[L,I];S.carry=null;log('Marker <strong>'+id+(kind==='res'?' (residual)':'')+'</strong> plotted at L'+L+' × I'+I+' — score '+(L*I)+', '+zoneOf(L*I)+'.');renderAll();save()}

function pickChip(id,kind){S.carry={id:id,kind:kind};renderChart();var h=$('chartHint');}

function plotDock(id){if(RISKS.some(function(x){return x.id===id})){S.carry={id:id,kind:'inh'}}else{if(!S.feed[id])S.feed[id]={};S.feed[id].filed=true;S.carry={id:id,kind:'inh'}}renderAll()}

function renderLedger(){
 var body=$('ledgerBody');var rows='';
 RISKS.forEach(function(r){
  if(!S.reg||!S.reg[r.id]||!S.reg[r.id].filed)return;
  var sc=r.L*r.I;var res=S.res[r.id];var tr=S.treat[r.id];
  rows+='<tr><td><b>'+r.id+'</b></td><td>'+esc(r.name)+'</td><td>'+esc(S.owners[r.id]||'—')+'</td><td>'+r.L+'×'+r.I+'</td><td class="score">'+sc+'</td><td><span class="zonePill '+zClass(sc)+'">'+zoneOf(sc)+'</span></td><td>'+esc(tr||'—')+'</td><td>'+(res?res[0]+'×'+res[1]+' ('+(res[0]*res[1])+')':'—')+'</td><td style="font-size:.7rem">'+esc(r.review)+'</td></tr>';
 });
 if(S.mode==='hard'){FEED.forEach(function(f){
  if(f.kind!=='file'||!S.feed[f.id]||!S.feed[f.id].filed)return;
  var st=S.feed[f.id];if(!st.L||!st.I)return;
  var sc=st.L*st.I;var res=S.res[f.id];var tr=S.treat[f.id];
  rows+='<tr><td><b>'+f.id+'</b></td><td>New intake report — '+esc(st.cat||'uncategorized')+'</td><td>'+(S.owners[f.id]?'Assigned':'—')+'</td><td>'+st.L+'×'+st.I+'</td><td class="score">'+sc+'</td><td><span class="zonePill '+zClass(sc)+'">'+zoneOf(sc)+'</span></td><td>'+esc(tr||'—')+'</td><td>'+(res?res[0]+'×'+res[1]+' ('+(res[0]*res[1])+')':'—')+'</td><td style="font-size:.7rem">New — assign owner &amp; treatment</td></tr>';
 })}
 body.innerHTML=rows;$('ledgerEmpty').style.display=rows?'none':'block';
}

function controlsFor(id){var r=RISKS.filter(function(x){return x.id===id})[0];return r?r.controls:null}

function renderBench(){
 var sel=$('benchRisk');var cur=S.bench.risk;var opts='<option value="">— select a filed risk —</option>';
 RISKS.forEach(function(r){if(S.reg&&S.reg[r.id]&&S.reg[r.id].filed)opts+='<option value="'+r.id+'"'+(cur===r.id?' selected':'')+'>'+r.id+' — '+esc(r.name)+'</option>'});
 if(S.mode==='hard'){FEED.forEach(function(f){if(f.kind==='file'&&S.feed[f.id]&&S.feed[f.id].filed)opts+='<option value="'+f.id+'"'+(cur===f.id?' selected':'')+'>'+f.id+' — new intake report</option>'})}
 sel.innerHTML=opts;
 var flags=document.querySelectorAll('input[name="treat"]');
 flags.forEach?flags.forEach(function(f){f.checked=(S.bench.treat===f.value)}):Array.prototype.forEach.call(flags,function(f){f.checked=(S.bench.treat===f.value)});
 $('resL').value=S.bench.resL||'';$('resI').value=S.bench.resI||'';
 var cb=$('controlsBox');
 if(!cur){cb.innerHTML='<p class="subhint">Select a risk above to see its control options.</p>'}
 else{var cl=controlsFor(cur);
  if(cl){var got=S.controls[cur]||[];cb.innerHTML=cl.map(function(c){return '<label class="checkboxRow"><input type="checkbox" data-ctl="'+cur+'" value="'+esc(c.t)+'"'+(got.indexOf(c.t)>=0?' checked':'')+'><span>'+esc(c.t)+'</span></label>'}).join('')}
  else{cb.innerHTML='<p class="subhint">No predefined control list for this new report — pick the treatment signal and residual score.</p>'}
 }
}

function plotResidual(){
 var r=S.bench.risk;if(!r){benchFb('no','Select a risk under the halyard first.');return}
 if(!S.bench.treat){benchFb('no','Hoist a treatment signal first.');return}
 if(!S.bench.resL||!S.bench.resI){benchFb('no','Set both residual likelihood and impact.');return}
 var ctlBoxes=document.querySelectorAll('input[data-ctl="'+r+'"]');
 var got=[];Array.prototype.forEach.call(ctlBoxes,function(b){if(b.checked)got.push(b.value)});
 S.controls[r]=got;S.treat[r]=S.bench.treat;S.res[r]=[parseInt(S.bench.resL,10),parseInt(S.bench.resI,10)];
 setChart(r,'res',S.res[r][0],S.res[r][1]);
 benchFb('ok','Residual marker plotted for <b>'+r+'</b>: L'+S.res[r][0]+' × I'+S.res[r][1]+' = <b>'+(S.res[r][0]*S.res[r][1])+'</b> ('+zoneOf(S.res[r][0]*S.res[r][1])+'). Above 9 the board needs an exception.');
}

function benchFb(kind,msg){var f=$('benchFb');f.className='fb show '+kind;f.innerHTML=(kind==='ok'?'<b><svg class="icon"><use href="#i-check"/></svg> Logged</b>':'<b><svg class="icon"><use href="#i-alert"/></svg> Hold on</b>')+'<span>'+msg+'</span>'}

function renderGloss(){$('glossGrid').innerHTML=GLOSS.map(function(g){return '<div class="glossItem"><b>'+g[0]+'</b>'+esc(g[1])+'</div>'}).join('')}

function optList(name,options,current){return options.map(function(o){return '<option'+(String(current)===String(o)?' selected':'')+'>'+esc(o)+'</option>'}).join('')}

function selHtml(name,label,options,current,cls){return '<div class="'+(cls||'')+'"><label style="font-size:.78rem;font-weight:700;color:#4A5860;display:block;margin-bottom:3px">'+label+'</label><select data-f="'+name+'"><option value="">–</option>'+optList(name,options,current)+'</select></div>'}

function chkHtml(name,label,current){return '<label class="checkboxRow" style="color:#2E3B44"><input type="checkbox" data-f="'+name+'"'+(current?' checked':'')+'><span>'+label+'</span></label>'}

function renderBrief(){
 var b=$('briefBody');
 if(S.mode==='medium'){
  b.innerHTML='<p class="subhint">Order M9 — the board pack. Tick exactly the four items leaders need; the engineering noise must stay out.</p>'+
  shuf(['Portfolio heat-map summary against appetite|q1','Top inherent risks with named owners|q2','Treatment costs compared to quantified ALE|q3','Register review schedule and overdue reviews|q4','Full per-host CVE dump with CVSS scores|q5','Raw firewall session logs with byte counts|q6','Packet captures from the fleet uplink|q7'],'M9').map(function(s){var p=s.split('|');return chkHtml(p[1],p[0],S.ans.M9&&S.ans.M9[p[1]])}).join('');
 }else{
  var rows=shuf([['route1','Posture summary vs board appetite'],['route2','Licensing remediation task list'],['route3','Carrier SLA renegotiation status'],['route4','Triggered-review action list for phishing'],['route5','Regulator inquiry response']],'H8');
  var who=['Board / CFO','IT Manager','Head of Procurement','Security Manager','General Counsel'];
  b.innerHTML='<p class="subhint">Order H8 — route each register communication to the stakeholder who must receive it.</p>'+rows.map(function(r,i){return selHtml(r[0],r[1],who,S.ans.H8&&S.ans.H8[r[0]])}).join('');
 }
}

function renderReview(){
 var b=$('reviewBody');
 if(S.mode==='medium'){
  var stages=shuf([['identify','Identify'],['assess','Assess (score)'],['analyze','Analyze'],['treat','Treat'],['communicate','Communicate'],['review','Review &amp; monitor']],'M12s');
  var seqHtml=stages.map(function(st,i){var idx=S.seq.indexOf(st[0]);return '<button class="btn ghost" data-stage="'+st[0]+'" type="button" style="'+(idx>=0?'background:var(--flag-t);color:#fff;border-color:var(--flag-t)':'')+';min-height:44px">'+(idx>=0?(idx+1)+'. ':'')+st[1]+'</button>'}).join('');
  b.innerHTML='<p class="subhint">Order M12 — click the six stages of the risk management cycle in the correct order (click again to unstage).</p><div class="loopFlow" style="margin-top:8px">'+seqHtml+'</div>'+
  '<p class="subhint" style="margin-top:12px">And tick every event that must <b>trigger</b> a register review before the next scheduled one:</p>'+
  shuf([['tr1','A ransomware crew hit a competitor logistics firm'],['tr2','The quarterly review cadence falls due'],['tr3','The HQ kitchen renovation was completed'],['tr4','A mile-long traffic jam formed near HQ']],'M12t').map(function(t){return chkHtml(t[0],t[1],S.ans.M12&&S.ans.M12[t[0]])}).join('');
 }else{
  b.innerHTML='<p class="subhint">Order H5 — mark which events force a register review THIS month, then tick the three correct outputs of any review.</p>'+
  '<h4 style="font-size:.9rem;margin:8px 0 4px;color:var(--ink)">Events</h4>'+
  shuf([['e1','Phishing wave targeting the logistics sector (threat intel)'],['e2','The scheduled quarterly cadence falls due'],['e3','WMS-7 is still end-of-life (no change since last review)'],['e4','A new coffee machine was installed in HQ'],['e5','Carrier partner reported a breach (new intel)']],'H5e').map(function(t){return chkHtml(t[0],t[1],S.ans.H5&&S.ans.H5[t[0]])}).join('')+
  '<h4 style="font-size:.9rem;margin:12px 0 4px;color:var(--ink)">Outputs of a review</h4>'+
  shuf([['o1','Update residual scores against current mitigations'],['o2','Confirm each risk owner is still the right stakeholder'],['o3','Escalate any breach of the appetite (exception or treatment)'],['o4','Publish the raw register to every staff member'],['o5','Archive last year\u2019s scores without touching them']],'H5o').map(function(t){return chkHtml(t[0],t[1],S.ans.H5&&S.ans.H5[t[0]])}).join('');
 }
}

function renderException(){
 var b=$('exceptionBody');
 if(S.mode!=='hard'){b.innerHTML='<p class="subhint">Exception governance is exercised on the Hard watch. Medium covers the rule inside Order M11\u2019s briefing.</p>';return}
 var cards=shuf([
  '<div style="border:1px solid var(--rule2);border-radius:8px;padding:10px;margin-top:8px"><b style="font-size:.9rem">E-1 — Carrier partner API breach (from HF-A)</b><p class="subhint">Residual 3×4 = 12, above appetite. Manual booking runbook documented as compensating control. Expiry 30 days. Signed by Head of Procurement + CISO.</p>'+
  '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex1" data-f="ex1" value="Approve"'+(S.ans.H6&&S.ans.H6.ex1==='Approve'?' checked':'')+'><span>Approve the exception</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex1" data-f="ex1" value="Reject"'+(S.ans.H6&&S.ans.H6.ex1==='Reject'?' checked':'')+'><span>Reject the exception</span></label></div>',
  '<div style="border:1px solid var(--rule2);border-radius:8px;padding:10px;margin-top:8px"><b style="font-size:.9rem">E-2 — Fleet telemetry encryption (R-106)</b><p class="subhint">Residual 1×3 = 3, comfortably within appetite. Exception requested anyway "for paperwork".</p>'+
  '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex2" data-f="ex2" value="Approve"'+(S.ans.H6&&S.ans.H6.ex2==='Approve'?' checked':'')+'><span>Approve the exception</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex2" data-f="ex2" value="Reject"'+(S.ans.H6&&S.ans.H6.ex2==='Reject'?' checked':'')+'><span>Reject — not needed</span></label></div>',
  '<div style="border:1px solid var(--rule2);border-radius:8px;padding:10px;margin-top:8px"><b style="font-size:.9rem">E-3 — WMS-7 segmentation gap (R-103)</b><p class="subhint">Residual 2×3 = 6, within appetite — but the requester wants a formal exception with an <b>expiry of 180 days</b> while the replacement project slips.</p>'+
  '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex3" data-f="ex3" value="Approve"'+(S.ans.H6&&S.ans.H6.ex3==='Approve'?' checked':'')+'><span>Approve the exception</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="hex3" data-f="ex3" value="Reject"'+(S.ans.H6&&S.ans.H6.ex3==='Reject'?' checked':'')+'><span>Reject — term exceeds policy</span></label></div>'],'H6');
 b.innerHTML='<p class="subhint">Order H6 — rule on each request against board policy: residual ≤ 9 is within appetite; exceptions need compensating controls, expiry ≤ 90 days, owner + CISO sign-off.</p>'+cards.join('');
}

function renderOrders(){
 var defs=currentDefs();var ol=$('orderList');var html='';
 defs.forEach(function(o,i){
  var st=objSt(o.id);var a=ansGet(o.id);
  html+='<li class="order'+(st.done?' done':'')+'" data-obj="'+o.id+'" id="ord-'+o.id+'">'+
   '<div class="orderTop"><span class="orderState">'+(st.done?'✓':(i+1))+'</span><div class="orderText">'+
   '<p class="obj">'+o.text+'</p>'+
   '<div class="pillRow"><span class="pillar p'+o.pillar+'">'+PILLARS[o.pillar]+'</span><span class="anchor">'+o.anchor+'</span></div>'+
   '<div class="objAns" style="margin-top:9px">'+o.build()+'</div>'+
   '<div class="orderTools"><button class="chkBtn" data-check="'+o.id+'" type="button">Check results</button>'+
   (S.mode==='medium'?'<button class="nudgeBtn" data-hint="'+o.id+'" type="button">Reveal hint ('+Math.min(st.hints,3)+'/3 used)</button>':'<button class="nudgeBtn" data-hint="'+o.id+'" type="button">Reveal nudge (costs score)</button>')+
   '</div><div class="hintBox" id="hint-'+o.id+'"></div><div class="fb" id="fb-'+o.id+'" role="status" aria-live="polite"></div>'+
   '</div></div></li>';
 });
 ol.innerHTML=html;
 defs.forEach(function(o){
  var st=objSt(o.id);var hb=$('hint-'+o.id);
  if(hb&&st.hints>0){
   if(S.mode==='medium'){for(var hi=0;hi<Math.min(st.hints,3);hi++){var d=document.createElement('div');d.className='hintBody';d.innerHTML='<b>'+['Nudge','Direction','Demonstration'][hi]+':</b> '+esc(o.hints[hi]);hb.appendChild(d)}}
   else{var d2=document.createElement('div');d2.className='hintBody';d2.innerHTML='<b>Costly nudge:</b> '+esc(o.nudge);hb.appendChild(d2)}
  }
 });
 // R2 answer lock: once an order passes, its answer fields render disabled
 defs.forEach(function(o){
  var st=objSt(o.id);var card=$('ord-'+o.id);
  if(st.done&&card){Array.prototype.forEach.call(card.querySelectorAll('[data-f]'),function(el){el.disabled=true});
   var aa=card.querySelector('.objAns');if(aa)aa.classList.add('locked')}
 });
 updateLocks();
 updateStats();updateFocus();
}

function updateLocks(){ // lock container fields for checked objectives + hard feed rows
 if(S.mode==='hard'&&objSt('H1').done){
  Array.prototype.forEach.call(document.querySelectorAll('#hardFeed [data-feedf],#hardFeed [data-feedfile]'),function(el){el.disabled=true});
 }
 [['briefPanel','M9','medium'],['briefPanel','H8','hard'],['reviewPanel','M12','medium'],['reviewPanel','H5','hard'],['exceptionPanel','H6','hard']].forEach(function(p){
  if(S.mode===p[2]&&objSt(p[1]).done){var panel=$(p[0]);if(panel)Array.prototype.forEach.call(panel.querySelectorAll('[data-f]'),function(el){el.disabled=true})}
 });
}

function updateStats(){
 var defs=currentDefs();var done=defs.filter(function(o){return objSt(o.id).done}).length;
 $('statObj').textContent=done+'/'+defs.length;$('ordersDone').textContent=done;$('ordersTotal').textContent=defs.length;
 var pct=defs.length?Math.round(done/defs.length*100):0;$('ringPct').textContent=pct+'%';
 $('ringArc').setAttribute('stroke-dasharray',(pct*113/100)+' 200');
 var hints=0;defs.forEach(function(o){hints+=objSt(o.id).hints});$('hintCount').textContent=hints;
 var plotted=0;Object.keys(S.chart).forEach(function(k){if(S.chart[k].inh)plotted++;if(S.chart[k].res)plotted++});
 $('statPlot').textContent=plotted;
 var rb=$('reportBtn');if(rb){var q=S.quiz;rb.disabled=!(done===defs.length&&q.scored&&defs.length>0);}
 var act='';
 if(S.mode==='medium'){
  var first=defs.filter(function(o){return !objSt(o.id).done})[0];
  if(!first)act='Watch complete — report to the harbor master';
  else if(['M1','M2','M3'].indexOf(first.id)>=0)act='Watch shift 1 — Intake &amp; Identify';
  else if(['M4','M5','M6','M7','M8'].indexOf(first.id)>=0)act='Watch shift 2 — Assess &amp; Plot';
  else if(['M9','M10','M11'].indexOf(first.id)>=0)act='Watch shift 3 — Treat &amp; Communicate';
  else act='Watch shift 4 — Review &amp; Monitor';
 }else{act='Free watch — the whole tower is open'}
 $('actTag').innerHTML=act;
 updateQuizLock();
}

function updateFocus(){
 var defs=currentDefs();
 document.querySelectorAll('.panel.spot').forEach?document.querySelectorAll('.panel.spot').forEach(function(p){p.classList.remove('spot')}):Array.prototype.forEach.call(document.querySelectorAll('.panel.spot'),function(p){p.classList.remove('spot')});
 document.querySelectorAll('.order.now').forEach?document.querySelectorAll('.order.now').forEach(function(o){o.classList.remove('now')}):Array.prototype.forEach.call(document.querySelectorAll('.order.now'),function(o){o.classList.remove('now')});
 if(S.mode!=='medium')return;
 var first=defs.filter(function(o){return !objSt(o.id).done})[0];if(!first)return;
 var ord=$('ord-'+first.id);if(ord){ord.classList.add('now');ord.style.boxShadow='inset 3px 0 0 var(--amber)';}
 if(first.focus){var p=document.querySelector(first.focus);if(p)p.classList.add('spot')}
}

function starCount(){
 var defs=currentDefs();var n=defs.length;var fp=0,hints=0;
 defs.forEach(function(o){var st=objSt(o.id);if(st.firstPass)fp++;hints+=st.hints});
 var q=S.mode==='medium'?QUIZ_M.length:QUIZ_H.length;var qp=S.quiz.correct/q;
 var score=100-hints*4-Math.round((1-fp/n)*30)-(qp<0.8?8:0);score=Math.max(0,Math.min(100,score));
 var stars=score>=95?5:score>=85?4:score>=70?3:score>=50?2:1;
 return {stars:stars,score:score,fp:fp,n:n,hints:hints,qp:qp};
}

function buildFocusAreas(){
 var defs=currentDefs();var out=[];
 defs.forEach(function(o){var st=objSt(o.id);
  if(st.done&&st.attempts>1)out.push('<b>'+o.id+'</b> needed '+st.attempts+' checks — re-read anchor '+o.anchor+' in the Chart Room Reference.');
  if(st.done&&st.hints>0)out.push('<b>'+o.id+'</b> used '+st.hints+' hint'+(st.hints>1?'s':'')+' — brush up anchor '+o.anchor+'.');
 });
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;
 (S.quiz.wrongIds||[]).forEach(function(i){out.push('<b>Drill item '+(i+1)+'</b> — '+qs[i].topic+'. Study the matching entry in the Chart Room Reference, then re-run the drill via Reset.')});
 if(!out.length)out.push('Clean first-attempt pass with no hints and a full drill score — no weak areas logged. Push on: objectives 5.1, 5.3 and 5.5.');
 return out;
}

function openCompletion(){
 var defs=currentDefs();var c=starCount();
 var sv='';for(var i=1;i<=5;i++){sv+='<svg class="icon '+(i<=c.stars?'star-on':'star-off')+'"><use href="#i-star"/></svg>'}
 $('starsBox').innerHTML=sv;
 $('starCalc').textContent='Rating: '+c.score+'/100 — first-attempt checks '+c.fp+'/'+c.n+' (−'+Math.round((1-c.fp/c.n)*30)+'), hints used '+c.hints+' (−'+(c.hints*4)+'), drill '+(S.quiz.correct+'/'+(S.mode==='medium'?QUIZ_M.length:QUIZ_H.length))+(c.qp<0.8?' (−8)':' (no penalty)')+'.';
 $('doneScore').innerHTML='All <b>'+c.n+'</b> orders complete on the <b>'+(S.mode==='medium'?'Medium — Watch Officer':'Hard — Harbor Master')+'</b> watch. The register is plotted, treated, reviewed and briefed — that is the whole of SY0-801 Objective 5.2 in your hands.';
 var groups={1:[],2:[],3:[],4:[]};defs.forEach(function(o){if(objSt(o.id).done)groups[o.pillar].push(o.id)});
 $('recapBox').innerHTML=[1,2,3,4].map(function(p){return '<div class="rRow"><b>'+PILLARS[p]+'</b><span>'+groups[p].join(', ')+(p===1?' — you can explain the process and its parts.':p===2?' — you can score, categorize and quantify real evidence.':p===3?' — you can communicate the register and run its reviews.':p===4?' — you can choose, apply and verify treatments against appetite.':'')+'</span></div>'}).join('');
 $('focusBox').innerHTML='<b class="fbTitle">Focus areas — from your own evidence (attempts, hints, drill misses):</b><ul>'+buildFocusAreas().map(function(f){return '<li>'+f+'</li>'}).join('')+'</ul>';
 $('nextBox').innerHTML='<b>What to learn next:</b> Objective 5.1 — governance documents (policies, standards, procedures); 5.3 — assessing and managing third-party risk (your R-105 skill deepens there); 5.5 — audits and assessments that check this register. Then take the other watch: '+(S.mode==='medium'?'Hard — Harbor Master':'Medium — Watch Officer')+' reshapes the same tower into a different challenge.';
 $('doneModal').hidden=false;var btn=$('closeDoneBtn');if(btn)btn.focus();
}

function renderAll(){
 if(!S.mode)return;
 renderIntake();renderFeed();renderChart();renderLedger();renderBench();renderBrief();renderReview();renderException();renderGloss();renderOrders();renderQuiz();
}
