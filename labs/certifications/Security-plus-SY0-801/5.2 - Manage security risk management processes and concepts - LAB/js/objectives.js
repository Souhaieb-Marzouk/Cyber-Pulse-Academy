'use strict';
/* =====================================================================
   OBJECTIVES — the CHECK engine: per-objective build/check closures, feedback,
hint reveal. Objective CONTENT (text/hints/anchors) lives in data.js as
OBJ_CONTENT_*; this file assembles content + logic into the OBJ_M / OBJ_H arrays.
   ===================================================================== */

function numP(s){var n=parseFloat(String(s).replace(/[$,\s]/g,''));return isNaN(n)?null:n}

function fbShow(id,ok,msg){var f=$('fb-'+id);if(!f)return;f.className='fb show '+(ok?'ok':'no');f.innerHTML='<b><svg class="icon"><use href="#i-'+(ok?'check':'alert')+'"/></svg> '+(ok?'Check passed':'Check result')+'</b><span>'+msg+'</span>'}

function checkObj(id){
 var defs=currentDefs();var o=defs.filter(function(x){return x.id===id})[0];if(!o)return;
 var st=objSt(id);st.attempts++;
 var res=o.check();
 if(res.ok){if(!st.done){st.done=true;st.firstPass=(st.attempts===1);log('Order <strong>'+id+'</strong> complete.');}
  renderOrders();
  fbShow(id,true,res.msg);
  if(o.fb&&st.attempts===1){var f=$('fb-'+id);var d=document.createElement('span');d.style.display='block';d.style.marginTop='6px';d.innerHTML='<b>Why it matters:</b> '+o.fb;f.appendChild(d)}
  var allDone=defs.every(function(x){return objSt(x.id).done});
  if(allDone){log('All orders complete — the harbor master awaits your report.');}
 }else{st.firstPass=false;fbShow(id,false,res.msg);}
 save();
}

function revealHint(id){
 var defs=currentDefs();var o=defs.filter(function(x){return x.id===id})[0];var st=objSt(id);
 var box=$('hint-'+id);
 if(S.mode==='medium'){
  if(st.hints>=3){return}
  st.hints++;var lvl=['Nudge','Direction','Demonstration'][st.hints-1];
  var p=document.createElement('div');p.className='hintBody';p.innerHTML='<b>'+lvl+':</b> '+esc(o.hints[st.hints-1]);box.appendChild(p);
  var btn=document.querySelector('[data-hint="'+id+'"]');if(btn)btn.textContent='Reveal hint ('+st.hints+'/3 used)';
  log('Hint revealed on <strong>'+id+'</strong> ('+st.hints+'/3).');
 }else{
  if(st.hints>=1){return}
  st.hints++;var p2=document.createElement('div');p2.className='hintBody';p2.innerHTML='<b>Costly nudge:</b> '+esc(o.nudge);
  box.appendChild(p2);var btn2=document.querySelector('[data-hint="'+id+'"]');if(btn2)btn2.disabled=true;
  log('Nudge revealed on <strong>'+id+'</strong> — star rating will reflect it.');
 }
 updateStats();save();
}

var OBJ_CONTENT_M={
 'M1':{id:'M1',
   pillar:1,
   anchor:'5.2.3.1 · 5.2.3.2',
   focus:'#intakePanel',
   text:'Sort the dispatch-incident card: label each of its four statements as the threat, the vulnerability, the impact driver, or the likelihood driver.',
   hints:['A threat does the harm; a vulnerability lets it in.','Statement 1 names an actor (threat); statement 2 names a weakness (vulnerability).','1=Threat, 2=Vulnerability, 3=Impact driver (how much harm), 4=Likelihood driver (how probable).'],
   fb:'Threat + vulnerability give you the story; likelihood + impact give you the score. This is the vocabulary every later order uses.'},
 'M2':{id:'M2',
   pillar:1,
   anchor:'5.2.1.1 asset identification',
   focus:'#intakePanel',
   text:'Risk identification starts with assets. From the eight intake cards in the bay, tick every ASSET that is actually at risk — actors are not assets.',
   hints:['An asset is a thing of value that could be harmed; an actor is the thing causing harm.','“The ransomware crew” and “departing engineers” both attack things — they are threat actors.','Tick the six: dispatch platform, WMS-7 server, algorithm code, booking portal, HQ data room, telemetry platform.'],
   fb:'Notice the spread: software, hardware, data and even a physical room. Risk management must speak the asset inventory language (5.2.1.1) — this is why risk and asset management share a home.'},
 'M3':{id:'M3',
   pillar:1,
   anchor:'5.2.1.2 stakeholder ownership',
   focus:'#intakePanel',
   text:'Every risk needs an accountable owner. Assign the right owner to these four risks — owning means answering for it, not operating it.',
   hints:['The owner is accountable for the business exposure, not the technical fix.','R-105 is a vendor contract problem — contracts are negotiated by procurement.','Operations owns dispatch, the CTO owns the algorithm, Procurement owns the portal contract, IT owns licensing.'],
   fb:'Stakeholder ownership makes risk management organizational rather than a security-team hobby. When this risk moves, the owner explains it to the board — make sure every row has that name.'},
 'M4':{id:'M4',
   pillar:2,
   anchor:'5.2.2.1 scoring by likelihood and impact',
   focus:'#intakePanel',
   text:'Score three risks on the tower\u2019s 5-point scales. Read each card\u2019s evidence lines (impact if hit, likelihood sign) before choosing. R-101 first: two patch levels behind and actively scanned.',
   hints:['Read the scale definitions table under the chart before scoring.','R-101: expected within the year (likely=4), would halt the fleet (severe=5).','R-101 = 4×5, R-107 = 2×3 (possible-ish but contained), R-108 = 2×5 (rare but catastrophic).'],
   fb:'Scoring is assessment (5.2.2.1): likelihood and impact, judged against written scale definitions — never vibes. The same scales will place these risks on the chart next.'},
 'M5':{id:'M5',
   pillar:2,
   anchor:'5.2.2.2 categorizing risks · 5.2.6.6',
   focus:'#intakePanel',
   text:'Categorize all eight risks into the tower\u2019s illustrative groups, then answer the R-106 question: which business consideration makes unencrypted driver telemetry worse?',
   hints:['External = threats from outside the company; IP theft and licensing have their own groups.','R-103 is inherited, end-of-life technology — the definition of legacy risk. R-105 travels through a third party (multiparty).','C101 External, C102 External, C103 Legacy, C104 IP theft, C105 Multiparty, C106 External, C107 Software compliance, C108 External; regulator drives R-106 impact.'],
   fb:'Grouping risks (5.2.2.2) turns a list into a picture: legacy and multiparty risks need different owners and different treatment than external attacks. Regulatory exposure (5.2.6.6) is a business-level multiplier on impact.'},
 'M6':{id:'M6',
   pillar:2,
   anchor:'5.2.3.5 · 5.2.6.8–.10',
   focus:'#chartPanel',
   text:'Go quantitative for the dispatch platform: AV $500,000, EF 40%, ARO 0.5. Compute the SLE and the ALE, then declare which kind of analysis this is.',
   hints:['Formulas live in the Chart Room Reference: SLE = AV × EF; ALE = SLE × ARO.','AV 500,000 × EF 40% = SLE. Then SLE × ARO 0.5 = ALE.','SLE = $200,000; ALE = $100,000; this is quantitative.'],
   fb:'ALE is the Security+ money formula (5.2.6.8–10): it converts a scary story into a budget line. Later (Hard watch) you will judge two control bundles against exactly this number.'},
 'M7':{id:'M7',
   pillar:2,
   anchor:'5.2.6.1 BIA · 5.2.3.1 impact',
   focus:'#biaPanel',
   text:'Justify impact with the BIA sheet: confirm the impact score for R-101 (dispatch, MTD 2 hours) and R-103 (WMS-7, MTD 4 hours), and pick the true definition of a BIA.',
   hints:['The BIA sheet sits on the Signal Bench, under the berthing plan.','Use the “Suggested impact” column — it is derived from maximum tolerable downtime.','R-101 → 5, R-103 → 4; the true definition is the one mentioning maximum tolerable downtime.'],
   fb:'BIA (5.2.6.1) is the bridge between business operations and risk scoring: it converts downtime tolerance into an impact number nobody can argue with. Keep it next to the register.'},
 'M8':{id:'M8',
   pillar:2,
   anchor:'5.2.2.1 plotted on the chart',
   focus:'#chartPanel',
   text:'Plot four inherent risks on the harbor chart: R-101, R-102, R-105, R-107 (select the docked vessel, then click its cell). Then name the zone R-101 lands in.',
   hints:['Docked vessels wait in the strip under the chart; the selected one is highlighted.','Scores: R-101 = 20, R-102 = 12, R-105 = 9, R-107 = 6.','R-101 → L4/I5, R-102 → L4/I3, R-105 → L3/I3, R-107 → L2/I3; 20 is Critical.'],
   fb:'Plotting is assessment made visual: the 5×5 harbor chart is the qualitative heat map leaders actually read. Zones (Low → Critical) turn numbers into priorities — 20 lands deep in Critical.'},
 'M9':{id:'M9',
   pillar:3,
   anchor:'5.2.4.1 · 5.2.6.4–.5',
   focus:'#briefPanel',
   text:'Compose the board pack on the Signal Bench: tick exactly the four register items leadership needs — and leave the engineering noise out.',
   hints:['Leaders decide money and priorities — what do they need to see to do that?','Four items: the chart summary, the big risks with names attached, the cost picture, and the review cadence.','Tick q1–q4; leave q5–q7 unticked.'],
   fb:'A register nobody reads is shelf-ware. The right pack turns oversight into action: the board steers appetite, funds treatments, and signs exceptions. This is the “communicate” stage of the loop.'},
 'M10':{id:'M10',
   pillar:4,
   anchor:'5.2.5.1–.4 · 5.2.3.4 · 5.2.6.7',
   focus:'#benchPanel',
   text:'Choose a treatment signal for four risks — read each card\u2019s “current mitigation” line first — then identify what is ALREADY in place for R-102.',
   hints:['Match strategy to what is changeable: software can be removed; a site cannot.','Contracts and insurance = transfer; removing the risky thing = avoid; controls = mitigate.','Mitigate, Transfer, Avoid, Transfer — and mail filtering + annual training already exist for R-102.'],
   fb:'Treatment is a portfolio of four signals, each with a distinct cost and meaning. Notice the legal consideration (5.2.6.7): unlicensed software is not “a risk to reduce” — it is a violation to end. Avoid eliminates; mitigate reduces; transfer pays; accept documents.'},
 'M11':{id:'M11',
   pillar:4,
   anchor:'5.2.6.2 appetite · 5.2.6.3 residual',
   focus:'#benchPanel',
   text:'Bring R-101 within appetite (residual ≤ 9): on the Signal Bench select R-101, apply the right TWO controls, hoist Mitigate, set residual L and I, and plot the residual marker.',
   hints:['The bench: select risk → tick controls → hoist a signal → set residual L/I → Plot residual marker.','Patching cuts likelihood (4→2); restore-tested backups cut impact (5→4).','Controls: patch cadence + restore-tested backups; residual 2×4 = 8 — Moderate, within appetite.'],
   fb:'Residual risk (5.2.6.3) is the only score that matters for appetite (5.2.6.2): inherent 20 → residual 8 is the value of the treatment. Anything still above 9 needs a signed, time-bound exception — that rule is the board\u2019s, not yours.'},
 'M12':{id:'M12',
   pillar:3,
   anchor:'5.2.4.2 scheduled & triggered reviews',
   focus:'#reviewPanel',
   text:'Close the loop at the Review Desk: order the six stages of the risk management cycle, then tick every event that must trigger a register review.',
   hints:['The six stages echo the cycle diagram in the Chart Room Reference.','Start with Identify; end with Review & monitor — the last stage feeds the first.','Sequence: Identify, Assess (score), Analyze, Treat, Communicate, Review & monitor. Triggers: competitor ransomware + quarterly cadence.'],
   fb:'With reviews in place the tower never goes stale: new scores, re-confirmed owners and escalated appetite breaches come back to you as fresh orders. That is the full lifecycle — identify what you own, score it, treat it, tell everyone, watch it, repeat.'}
};

var BUILD_M={
 'M1':{build:function(){var a=ansGet('M1');var st=shuf([['st1','“A ransomware crew is actively targeting logistics firms.”'],['st2','“Our dispatch software is two patch levels behind.”'],['st3','“A successful hit would halt dispatch for days.”'],['st4','“Sector scanning of exposed dispatch servers is rising.”']],'M1');
   return st.map(function(s){return selHtml(s[0],s[1],['Threat','Vulnerability','Impact driver','Likelihood driver'],a[s[0]])}).join('')},
    check:function(){var a=ansGet('M1');var want={st1:'Threat',st2:'Vulnerability',st3:'Impact driver',st4:'Likelihood driver'};
   for(var k in want){if(a[k]!==want[k]){if(a[k])return {ok:false,msg:'“'+a[k]+'” is not the right label for '+k.replace('st','statement ')+'. A threat is the actor/event; a vulnerability is the weakness it exploits; impact = how much harm; likelihood = how probable. Re-read the card.'};return {ok:false,msg:'Label all four statements, then check again.'}}}
   return {ok:true,msg:'Correct split. Every register row is built from exactly these elements — mislabel them and the score inherits the error.'}}},
 'M2':{build:function(){var a=ansGet('M2');var items=shuf([['a1','The fleet dispatch platform'],['a2','The WMS-7 warehouse server'],['a3','The route-optimization algorithm code'],['a4','The carrier booking portal'],['a5','The HQ data room'],['a6','The driver telemetry platform'],['a7','The ransomware crew behind the waves'],['a8','The departing engineers and supervisor']],'M2');
   return items.map(function(i){return chkHtml(i[0],i[1],a[i[0]])}).join('')},
    check:function(){var a=ansGet('M2');var need=['a1','a2','a3','a4','a5','a6'];var miss=need.filter(function(k){return !a[k]});var extra=['a7','a8'].filter(function(k){return a[k]});
   if(miss.length||extra.length){var m=[];if(extra.length)m.push('Actors (a threat crew, departing engineers) are threats, not assets.');if(miss.length)m.push('You missed '+(miss.length===1?'one asset':miss.length+' assets')+' — re-read the cards: five systems/data stores and the physical data room are all named as being at risk.');
    return {ok:false,msg:m.join(' ')}}
   return {ok:true,msg:'Six assets identified. You cannot score a risk you cannot name an asset for — asset identification is always step one.'}}},
 'M3':{build:function(){var a=ansGet('M3');var rows=shuf([['o101','R-101 dispatch ransomware — owner','full'],['o104','R-104 algorithm IP theft — owner','half'],['o105','R-105 carrier portal dependency — owner','half'],['o107','R-107 unlicensed software — owner','full']],'M3');
   return rows.map(function(r){return r[2]==='half'?'<div class="row2">'+selHtml(r[0],r[1],OWNERS,a[r[0]])+'</div>':selHtml(r[0],r[1],OWNERS,a[r[0]])}).join('')},
    check:function(){var a=ansGet('M3');var want={o101:'Director of Operations',o104:'CTO',o105:'Head of Procurement',o107:'IT Manager'};
   for(var k in want){if(a[k]!==want[k])return {ok:false,msg:'Not quite. Match the owner to the BUSINESS function exposed, not to whoever would run the fix: dispatch stops → operations; IP walks → the technology office; a vendor contract → procurement; software licensing → the IT manager.'}}
   S.owners['R-101']=a.o101;S.owners['R-104']=a.o104;S.owners['R-105']=a.o105;S.owners['R-107']=a.o107;renderLedger();
   return {ok:true,msg:'Owners assigned — the ledger now shows them. Unowned risks are unwatched risks; ownership is the exam bullet 5.2.1.2 and the first thing an auditor checks.'}}},
 'M4':{build:function(){var a=ansGet('M4');var blocks=shuf([
    ['r101','R-101 (two patch levels behind and actively scanned):'],
    ['r107','R-107 (vendor audits announced, unlicensed installs on 40 machines):'],
    ['r108','R-108 (two flood warnings in five years, nothing offsite, no insurance):']],'M4');
   return blocks.map(function(b){return '<p class="subhint" style="margin-top:6px">'+b[1]+'</p>'+L_I(b[0],a)}).join('')},
    check:function(){var a=ansGet('M4');var want={r101:[4,5],r107:[2,3],r108:[2,5]};
   for(var k in want){var v=[parseInt(a[k+'L'],10),parseInt(a[k+'I'],10)];if(!v[0]||!v[1])return {ok:false,msg:'Score all six values first.'};if(v[0]!==want[k][0]||v[1]!==want[k][1])return {ok:false,msg:k.toUpperCase()+': likelihood '+v[0]+' × impact '+v[1]+' is off. Calibrate against the scale definitions under the chart — “likely this year” is 4, and losing 380 trucks\u2019 dispatch is the top of the impact scale.'}}
   return {ok:true,msg:'Scores accepted: R-101 = 20 (Critical), R-107 = 6, R-108 = 10. Consistency against published scales is what makes scores comparable across risks.'}}},
 'M5':{build:function(){var a=ansGet('M5');var shorts={101:'Dispatch ransomware',102:'Credential phishing',103:'EOL WMS-7 server',104:'Algorithm IP theft',105:'Carrier portal',106:'Driver telemetry',107:'Unlicensed software',108:'HQ flood'};
   var rows=shuf(RISKS.map(function(r){return selHtml('c'+r.id.slice(2),'R-'+r.id.slice(2)+' — '+shorts[r.id.slice(2)],CATS,a['c'+r.id.slice(2)])}),'M5');
   return rows+'<div style="margin-top:8px">'+selHtml('reg','R-106 driver telemetry: the impact is driven mainly by…',['Regulatory requirements','Vendor SLA penalties','Staff morale','Marketing spend'],a.reg)+'</div>'},
    check:function(){var a=ansGet('M5');var want={101:'External',102:'External',103:'Legacy',104:'IP theft',105:'Multiparty',106:'External',107:'Software compliance',108:'External'};
   for(var k in want){var key='c'+k;if(a[key]!==want[k])return {ok:false,msg:'R-'+k+' is not “'+(a[key]||'—')+'”. Think about the SOURCE: from outside (external), from our own people (IP theft/internal), inherited old technology (legacy), via a third party (multiparty), or licensing/legal (software compliance).'}}
   if(a.reg!=='Regulatory requirements')return {ok:false,msg:'Driver-location data about identifiable people is regulated — a regulator, not a marketing team, makes that exposure expensive.'};
   return {ok:true,msg:'All eight categorized, and you spotted the regulatory driver. Categories let leaders see clusters — three external, one legacy, one multiparty, one IP theft, one compliance.'}}},
 'M6':{build:function(){var a=ansGet('M6');return '<div class="row2"><div><label style="font-size:.78rem;font-weight:700;color:#4A5860;display:block;margin-bottom:3px">SLE (single loss expectancy) in $</label><input type="text" inputmode="numeric" data-f="sle" value="'+esc(a.sle||'')+'" placeholder="e.g. 150000"></div><div><label style="font-size:.78rem;font-weight:700;color:#4A5860;display:block;margin-bottom:3px">ALE (annualized loss expectancy) in $</label><input type="text" inputmode="numeric" data-f="ale" value="'+esc(a.ale||'')+'" placeholder="e.g. 30000"></div></div>'+
   '<div style="margin-top:8px"><label class="qOpt" style="background:var(--paper)"><input type="radio" name="m6m" data-f="method" value="qualitative"'+(a.method==='qualitative'?' checked':'')+'><span>This was qualitative analysis</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="m6m" data-f="method" value="quantitative"'+(a.method==='quantitative'?' checked':'')+'><span>This was quantitative analysis</span></label></div>'},
    check:function(){var a=ansGet('M6');var sle=numP(a.sle),ale=numP(a.ale);
   if(sle===null||ale===null||!a.method)return {ok:false,msg:'Enter both dollar values and choose the analysis type.'};
   if(sle===100000)return {ok:false,msg:'Near-miss: $100,000 is the ALE. Compute SLE first — asset value × exposure factor — and only then multiply by ARO.'};
   if(ale===200000)return {ok:false,msg:'Near-miss: $200,000 is the SLE. ALE = SLE × ARO — one incident\u2019s loss, times how often it happens per year.'};
   if(sle!==200000||ale!==100000)return {ok:false,msg:'SLE = AV × EF = $500,000 × 40% = $200,000. ALE = SLE × ARO = $200,000 × 0.5 = $100,000. Redo with those formulas.'};
   if(a.method!=='quantitative')return {ok:false,msg:'Money in, money out — that is the definition of quantitative analysis (5.2.3.5).'};
   return {ok:true,msg:'SLE $200,000, ALE $100,000, quantitative. This is the number a treatment must beat: any control costing less than the ALE it removes pays for itself.'}}},
 'M7':{build:function(){var a=ansGet('M7');return selHtml('b101','R-101 dispatch platform impact',[1,2,3,4,5],a.b101)+'<div class="row2">'+selHtml('b103','R-103 WMS-7 impact',[1,2,3,4,5],a.b103)+'</div>'+
   '<div style="margin-top:8px">'+['A checklist that auditors tick during reviews|bidefA','The firewall rule list for the dispatch stack|bidefD','A forecast of downtime damage per function|bidefB','The insurance premium table for each site|bidefC'].map(function(s){var p=s.split('|');return '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="m7d" data-f="bidef" value="'+p[1]+'"'+(a.bidef===p[1]?' checked':'')+'><span>'+p[0]+'</span></label>'}).join('')+'</div>'},
    check:function(){var a=ansGet('M7');
   if(!a.b101||!a.b103||!a.bidef)return {ok:false,msg:'Answer all three parts.'};
   if(a.bidef!=='bidefB')return {ok:false,msg:'A BIA does not audit or price anything — it predicts disruption damage over time and sets how long each function can stay down (maximum tolerable downtime).'};
   if(parseInt(a.b101,10)!==5||parseInt(a.b103,10)!==4)return {ok:false,msg:'Follow the BIA\u2019s suggested impact column: dispatch (MTD 2h) is Severe = 5; WMS-7 (MTD 4h) is Major = 4. Impact scores must be defensible — the BIA is the defense.'};
   return {ok:true,msg:'Impact confirmed by the BIA. When a leader asks “why is dispatch a 5?”, the answer is two hours of dead fleet — evidence-based scoring survives audits.'}}},
 'M8':{build:function(){var a=ansGet('M8');return selHtml('zone','R-101 lands in which zone?',['Low','Moderate','High','Critical'],a.zone)},
    check:function(){var a=ansGet('M8');var want={'R-101':[4,5],'R-102':[4,3],'R-105':[3,3],'R-107':[2,3]};
   for(var k in want){var m=S.chart[k]&&S.chart[k].inh;if(!m)return {ok:false,msg:k+' is still docked — select it in the “docked vessels” strip, then click its cell.'};
    if(m[0]!==want[k][0]||m[1]!==want[k][1])return {ok:false,msg:k+' is plotted at L'+m[0]+'×I'+m[1]+' — its accepted score is L'+want[k][0]+'×I'+want[k][1]+'. Re-plot: click the marker, then the right cell.'}}
   if(a.zone!=='Critical')return {ok:false,msg:'4 × 5 = 20 — above 14. Which color band is that? Check the legend.'};
   return {ok:true,msg:'Four vessels plotted and the Critical zone named. The chart is now the board\u2019s picture of inherent exposure — every marker is a decision someone must make.'}}},
 'M9':{build:function(){return '<p class="subhint">The composer lives on the Signal Bench → Briefing composer. Tick there, then check here.</p>'},
    check:function(){var a=ansGet('M9');var need=['q1','q2','q3','q4'];var miss=need.filter(function(k){return !a[k]});var extra=['q5','q6','q7'].filter(function(k){return a[k]});
   if(miss.length||extra.length){var m=[];if(extra.length)m.push('CVE dumps, raw firewall logs and packet captures are operator material — boards act on aggregated exposure, not telemetry.');if(miss.length)m.push('You missed '+(miss.length)+' of: heat-map posture, top risks with owners, treatment costs vs ALE, review schedule.');
    return {ok:false,msg:m.join(' ')}}
   return {ok:true,msg:'Board pack complete. Communicating the register upward (5.2.4.1) is how risk management changes decisions — stakeholder involvement and management oversight (5.2.6.4–5) only happen when the pack is right.'}}},
 'M10':{build:function(){var a=ansGet('M10');var t=['Mitigate','Transfer','Avoid','Accept'];
   var rows=shuf([
    ['full','t101','R-101 ransomware (unpatched, untested backups)',a.t101],
    ['half','t105','R-105 carrier portal (contract lacks clauses)',a.t105],
    ['half','t107','R-107 unlicensed software (a legal violation)',a.t107],
    ['full','t108','R-108 HQ flood (site cannot move)',a.t108]],'M10');
   return rows.map(function(r){return r[0]==='half'?'<div class="row2">'+selHtml(r[1],r[2],t,r[3])+'</div>':selHtml(r[1],r[2],t,r[3])}).join('')+
   '<div style="margin-top:8px">'+selHtml('ex102','R-102: which mitigation is ALREADY in place?',['Mail filtering + annual awareness training','MFA on the legacy portal','Immutable backups','DLP on code repositories'],a.ex102)+'</div>'},
    check:function(){var a=ansGet('M10');var want={t101:'Mitigate',t105:'Transfer',t107:'Avoid',t108:'Transfer'};
   for(var k in want){if(!a[k])return {ok:false,msg:'Choose a signal for all four risks.'};if(a[k]!==want[k])return {ok:false,msg:k.toUpperCase()+': you hoisted '+a[k]+'. Think: ransomware damage you CAN reduce (mitigate); a vendor contract without clauses calls for shifting consequence to the vendor/insurer (transfer); unlicensed software is a legal violation that should cease to exist (avoid — eliminate the source); the site cannot move, so pay someone else for flood damage (transfer).'}}
   if(a.ex102!=='Mail filtering + annual awareness training')return {ok:false,msg:'5.2.3.4 — “current mitigations already in place”: R-102\u2019s card lists mail filtering + annual training. MFA is the PLANNED control; scores must reflect what exists today.'};
   S.treat['R-101']=a.t101;S.treat['R-105']=a.t105;S.treat['R-107']=a.t107;S.treat['R-108']=a.t108;renderLedger();
   return {ok:true,msg:'Signals hoisted and the ledger updated. You also honored 5.2.3.4: analysis must use current mitigations — planned controls do not count until they exist.'}}},
 'M11':{build:function(){return '<p class="subhint">All of this happens on the Signal Bench → Berthing plan. This order checks the tower\u2019s state, not a form.</p>'},
    check:function(){var ctl=S.controls['R-101']||[];var okCtl=['Vendor patch cadence for the dispatch stack','Restore-tested, immutable backups'];
   if(S.bench.risk!=='R-101'&&!ctl.length)return {ok:false,msg:'Select R-101 under the halyard on the Signal Bench, tick its two controls, hoist Mitigate, set residual 2×4 and plot.'};
   var bad=ctl.filter(function(c){return okCtl.indexOf(c)<0});var missing=okCtl.filter(function(c){return ctl.indexOf(c)<0});
   if(bad.length||missing.length||ctl.length!==2)return {ok:false,msg:'Controls: need exactly the patch cadence and the restore-tested backups. '+(missing.length?'Missing: '+missing.join(', ')+'. ':'')+(bad.length?'Not needed here: '+bad.join(', ')+'.':'')};
   if(!S.res['R-101'])return {ok:false,msg:'Set residual likelihood 2 and impact 4 on the bench, then plot the residual marker.'};
   if(S.res['R-101'][0]!==2||S.res['R-101'][1]!==4)return {ok:false,msg:'Residual '+S.res['R-101'][0]+'×'+S.res['R-101'][1]+' is not what patching + tested backups buy: likelihood drops from 4 to 2, impact from 5 to 4. Score honestly.'};
   var m=S.chart['R-101']&&S.chart['R-101'].res;if(!m)return {ok:false,msg:'Plot the residual marker (the bench button plots it automatically).'};
   if(m[0]!==2||m[1]!==4)return {ok:false,msg:'The residual marker sits at L'+m[0]+'×I'+m[1]+' — re-plot it at L2×I4 (score 8, Moderate: within appetite).'};
   return {ok:true,msg:'R-101 residual = 2×4 = 8, inside the appetite of 9. This is the assess→treat→re-assess loop closing: the chart now shows what leadership can actually rely on.'}}},
 'M12':{build:function(){return '<p class="subhint">The Review Desk sits on the Signal Bench, bottom panel. Sequence + triggers happen there.</p>'},
    check:function(){var want=['identify','assess','analyze','treat','communicate','review'];
   if(S.seq.length!==6||S.seq.join('|')!==want.join('|'))return {ok:false,msg:S.seq.length===0?'Click the six stage buttons at the Review Desk in the correct order.':S.seq.length<6?'You staged '+S.seq.length+' of 6 stages — keep going.':'Order check: it runs identify → assess (score) → analyze → treat → communicate → review & monitor, then loops. Compare with the cycle in the Chart Room Reference.'};
   var a=ansGet('M12');var bad=[];if(!a.tr1)bad.push('the competitor ransomware event (threat intel re-rates likelihood)');if(!a.tr2)bad.push('the quarterly cadence (a scheduled review is still a review)');
   if(bad.length)return {ok:false,msg:'Missed: '+bad.join(' and ')+'. Triggered reviews force an early look at the affected rows.'};
   if(a.tr3||a.tr4)return {ok:false,msg:'A kitchen renovation and a traffic jam do not touch any register row — triggering reviews on noise devalues the mechanism.'};
   return {ok:true,msg:'Cycle ordered and triggers set. Reviews are the loop\u2019s heartbeat: scheduled cadence keeps rows honest, triggered reviews catch the world changing — this is 5.2.4.2 exactly.'}}}
};

var OBJ_M=Object.keys(OBJ_CONTENT_M).map(function(k){return Object.assign({},OBJ_CONTENT_M[k],BUILD_M[k])});

var OBJ_CONTENT_H={
 'H1':{id:'H1',
   pillar:1,
   anchor:'5.2.1 · 5.2.2.1–.2',
   focus:'',
   text:'Triage the noisy intake channel: exactly three of the ten reports are genuine NEW risks. File those three with category and inherent likelihood × impact — and file nothing else. Duplicates, closed rumors and already-mitigated events must stay out.',
   nudge:'File HF-A (Multiparty 3×4), HF-B (Internal 3×3), HF-C (Internal 4×3) — and nothing else.',
   fb:'You just did 5.2.1 end-to-end: identified new risks, matched categories (5.2.2.2) and scored them (5.2.2.1) — while refusing duplicates and noise that would poison the register.'},
 'H2':{id:'H2',
   pillar:2,
   anchor:'5.2.6.8–.10 · 5.2.6.2',
   focus:'',
   text:'Cost-benefit both control bundles. Dispatch platform: AV $500,000, EF 40%, ARO 0.5, bundle $35,000/yr, residual ARO 0.2 (EF unchanged). Records database: AV $800,000, EF 25%, ARO 0.2, bundle $90,000/yr, residual ALE $30,000. Compute all four figures, then approve or reject each bundle.',
   nudge:'Dispatch: SLE 200,000, ALE 100,000 → approve. Records: SLE 200,000, ALE 40,000 → reject (costs more than the loss it removes).',
   fb:'This is security budgeting in one order: ALE before vs after, cost between them. Defenders who can run this arithmetic get their controls funded; those who cannot, buy feelings.'},
 'H3':{id:'H3',
   pillar:3,
   anchor:'5.2.4 register hygiene',
   focus:'',
   text:'Audit the ledger — four rows are wrong. Fix: (1) the stale residual (R-102\u2019s MFA rollout finished, so its true residual is lower), (2) the wrong owner (R-105), (3) the invalid treatment (R-107 currently says Accept), (4) the missed triggered review (R-106 — new regulator guidance dropped this month).',
   nudge:'Residual 2×2 for R-102; Procurement owns R-105; Avoid for R-107; triggered review for R-106.',
   fb:'Register audits close the gap between “what we wrote” and “what is true”. Each error type — stale score, wrong owner, invalid treatment, missed trigger — maps to a real audit finding.'},
 'H4':{id:'H4',
   pillar:4,
   anchor:'5.2.5.4 mitigating · 5.2.5.3 avoiding',
   focus:'',
   text:'Design R-103\u2019s treatment on the Signal Bench: hoist the right signal, apply exactly the two FEASIBLE compensating controls, set the residual score (likelihood 2, impact 3) and plot it. One tempting control does not exist — find it.',
   nudge:'Mitigate; tick segmentation + virtual patching ONLY (“vendor patches” do not exist on EOL); residual 2×3.',
   fb:'When the textbook control is impossible, you do not force it — you compensate. Segmentation shrinks the blast radius, virtual patching filters exploits, and the funded replacement retires the risk for good.'},
 'H5':{id:'H5',
   pillar:3,
   anchor:'5.2.4.2 · 5.2.6.5 management oversight',
   focus:'',
   text:'Review governance at the Review Desk: tick the events that force a review THIS month (three of five), then tick the three correct outputs of any register review.',
   nudge:'Events: e1, e2, e5. Outputs: o1, o2, o3.',
   fb:'A review that changes nothing is a meeting. The three outputs you confirmed are how oversight turns the register from a record into a control.'},
 'H6':{id:'H6',
   pillar:4,
   anchor:'5.2.6.2–.3 · 5.2.1.2',
   focus:'',
   text:'Exception board at the Exception Desk: rule on all three requests against board policy (residual ≤ 9 within appetite; exceptions need compensating controls, expiry ≤ 90 days, owner + CISO sign-off).',
   nudge:'Approve E-1 only; E-2 is within appetite; E-3 exceeds the 90-day cap.',
   fb:'Exceptions are where risk appetite meets paperwork. Time-boxed, compensated, signed: acceptable. Anything else is a slow-motion breach of the board\u2019s actual decision.'},
 'H7':{id:'H7',
   pillar:4,
   anchor:'5.2.5.1 transferring',
   focus:'',
   text:'Transfer R-108\u2019s flood exposure properly: tick the two clauses that genuinely move financial impact, and settle both true/false statements about what transfer does.',
   nudge:'Tick the insurance rider and indemnification cap; statement 1 is False, statement 2 is True.',
   fb:'A signed policy with an indemnity cap genuinely moves dollars; the rest of the contract is decoration. And because likelihood is unchanged, transfer pairs naturally with mitigation.'},
 'H8':{id:'H8',
   pillar:3,
   anchor:'5.2.4.1 · 5.2.6.4 stakeholder involvement',
   focus:'',
   text:'Route five register communications at the Briefing Composer: each row must land with the stakeholder who owns that conversation.',
   nudge:'Board gets posture; IT gets licensing tasks; Procurement gets the SLA; Security gets review actions; Counsel gets the regulator.',
   fb:'Stakeholder involvement (5.2.6.4) means each audience gets what they can act on. Misrouted communications are how risks fall between chairs.'},
 'H9':{id:'H9',
   pillar:2,
   anchor:'5.2.6.3 residual · 5.2.6.5 oversight',
   focus:'',
   text:'Portfolio synthesis: the harbor master hands you a snapshot of 11 register rows. Compute the percentage whose score is within appetite (≤ 9), then choose the two correct next actions for the outliers.',
   nudge:'9 of 11 within appetite ≈ 82%. Actions: schedule treatments + file exceptions; never move the threshold or delete rows.',
   fb:'Posture reporting closes the loop: one percentage, backed by rows you can explain. If the number moves next month, the board will ask why — that is management oversight working (5.2.6.5).'}
};

var BUILD_H={
 'H1':{build:function(){return '<p class="subhint">The reports are in the Intake Bay (below the eight cards). File the right three, complete each row, and leave the noise alone.</p>'},
    check:function(){var want={'HF-A':['Multiparty',3,4],'HF-B':['Internal',3,3],'HF-C':['Internal',4,3]};
   var filed=Object.keys(S.feed).filter(function(k){return S.feed[k].filed});
   var extra=filed.filter(function(k){return !want[k]});
   if(extra.length)return {ok:false,msg:'Over-filed: '+extra.join(', ')+'. '+(extra.indexOf('HF-D')>=0?'HF-D is a scan re-flag of R-103 — one risk, one row; update the existing entry instead. ':'')+(extra.indexOf('HF-E')>=0?'HF-E was investigated and closed as unfounded — a rumor is not a risk. ':'')+(extra.indexOf('HF-F')>=0?'HF-F\u2019s controls already worked (encryption + wipe) — residual negligible, nothing to register. ':'')+'Every noise row you file dilutes the register\u2019s credibility.'};
   var miss=Object.keys(want).filter(function(k){return !S.feed[k]||!S.feed[k].filed});
   if(miss.length)return {ok:false,msg:'Still missing genuine risks: '+miss.join(', ')+'. Re-read the channel — a partner breach, an insider\u2019s diagram leak, and a provisioning flaw are all registerable.'};
   for(var k in want){var st=S.feed[k];var v=[st.cat,parseInt(st.L,10),parseInt(st.I,10)];
    if(!st.cat||!st.L||!st.I)return {ok:false,msg:'Complete the row for '+k+' (category, likelihood, impact).'};
    if(v[0]!==want[k][0]||v[1]!==want[k][1]||v[2]!==want[k][2])return {ok:false,msg:k+': '+st.cat+' at L'+st.L+'×I'+st.I+' is off. HF-A travels through a partner (multiparty) and hits booking operations (I4); HF-B and HF-C originate inside (internal); the admin-by-default flaw is likely (L4) but so far contained to accounts (I3).'};}
   return {ok:true,msg:'Exactly three filed, correctly scored, nothing else. That is risk identification under noise: precision beats volume, and the two red herrings are the exam\u2019s favorite trap.'}}},
 'H2':{build:function(){var a=ansGet('H2');
   function money(name,label){return '<div><label style="font-size:.78rem;font-weight:700;color:#4A5860;display:block;margin-bottom:3px">'+label+'</label><input type="text" inputmode="numeric" data-f="'+name+'" value="'+esc(a[name]||'')+'" placeholder="$"></div>'}
   return '<div class="row2">'+money('sle1','Dispatch SLE')+money('ale1','Dispatch ALE')+'</div><div class="row2" style="margin-top:6px">'+money('sle2','Records-DB SLE')+money('ale2','Records-DB ALE')+'</div>'+
   '<div style="margin-top:10px"><b style="font-size:.86rem">Decisions</b><label class="qOpt" style="background:var(--paper)"><input type="radio" name="h2d1" data-f="d1" value="Approve"'+(a.d1==='Approve'?' checked':'')+'><span>Dispatch bundle ($35,000/yr) — approve</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="h2d1" data-f="d1" value="Reject"'+(a.d1==='Reject'?' checked':'')+'><span>Dispatch bundle — reject</span></label>'+
   '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="h2d2" data-f="d2" value="Approve"'+(a.d2==='Approve'?' checked':'')+'><span>Records bundle ($90,000/yr) — approve</span></label><label class="qOpt" style="background:var(--paper)"><input type="radio" name="h2d2" data-f="d2" value="Reject"'+(a.d2==='Reject'?' checked':'')+'><span>Records bundle — reject</span></label></div>'},
    check:function(){var a=ansGet('H2');var w={sle1:200000,ale1:100000,sle2:200000,ale2:40000};var got={};
   for(var k in w){got[k]=numP(a[k]);if(got[k]===null)return {ok:false,msg:'Enter all four figures.'}}
   if(got.ale1===200000||got.ale2===200000)return {ok:false,msg:'Near-miss: $200,000 is the SLE (AV × EF). ALE multiplies by ARO — dispatch: ×0.5; records: ×0.2.'};
   for(var k2 in w){if(got[k2]!==w[k2])return {ok:false,msg:k2.toUpperCase()+' is wrong. Dispatch: SLE = 500,000 × 40% = 200,000; ALE = ×0.5 = 100,000. Records: SLE = 800,000 × 25% = 200,000; ALE = ×0.2 = 40,000. Show your unit: plain dollars.'}}
   if(a.d1!=='Approve'||a.d2!=='Reject')return {ok:false,msg:'CBA: dispatch removes 100,000 − 40,000 = $60,000/yr for $35,000 → net +$25,000, approve. Records removes only $10,000 for $90,000 → net −$80,000, reject. Appetite math is ruthless on purpose.'};
   return {ok:true,msg:'Both decisions correct. One control pays for itself, one does not — quantitative analysis (5.2.3.5) is what makes that visible before the money is spent.'}}},
 'H3':{build:function(){var a=ansGet('H3');
   var parts=shuf([
    '<div class="row2">'+selHtml('f1','R-102 residual — corrected likelihood',[1,2,3,4,5],a.f1)+'</div><div class="row2">'+selHtml('f2','R-102 residual — corrected impact',[1,2,3,4,5],a.f2)+'</div>',
    selHtml('f3','R-105 — correct owner',OWNERS,a.f3),
    '<div class="row2">'+selHtml('f4','R-107 — correct treatment',['Mitigate','Transfer','Avoid','Accept'],a.f4)+'</div>',
    selHtml('f5','R-106 — review status now',['Next scheduled review 2027-Q1','Triggered review due — regulator guidance','No action needed'],a.f5)
   ],'H3');
   return parts.join('')},
    check:function(){var a=ansGet('H3');
   if(!a.f1||!a.f2||!a.f3||!a.f4||!a.f5)return {ok:false,msg:'Fix all five correction fields (residual L and I count separately).'};
   if(a.f1!=='2'||a.f2!=='2')return {ok:false,msg:'R-102: with MFA live, likelihood drops to 2 and impact to 2 — residual 4. A register that still shows 4×3 tells the board last year\u2019s story; stale residuals are audit findings.'};
   if(a.f3!=='Head of Procurement')return {ok:false,msg:'R-105 is a vendor contract exposure — the accountable stakeholder is Procurement, not Security. 5.2.1.2: ownership follows the business function.'};
   if(a.f4!=='Avoid')return {ok:false,msg:'R-107: accepting a legal violation is not a treatment — the violation should cease to exist. Remove the software (avoid), then govern licensing.'};
   if(a.f5!=='Triggered review due — regulator guidance')return {ok:false,msg:'R-106: a regulator guidance update is a textbook trigger. Waiting for the 2027-Q1 cadence means scoring against yesterday\u2019s rules.'};
   S.owners['R-105']=a.f3;S.treat['R-107']=a.f4;S.res['R-102']=[2,2];renderLedger();
   return {ok:true,msg:'Four rows corrected and the ledger re-renders with the truth. Registers decay without audits — this order is why reviews are an explicit exam bullet (5.2.4).'}}},
 'H4':{build:function(){return '<p class="subhint">Signal Bench → select R-103 → hoist the signal → tick controls → residual 2×3 → Plot residual marker.</p>'},
    check:function(){var ctl=S.controls['R-103']||[];
   if(S.bench.treat&&S.bench.risk==='R-103'&&S.bench.treat==='Avoid')return {ok:false,msg:'Avoid would mean stopping warehouse management until next FY\u2019s replacement — the business cannot. The realistic play is mitigation with compensating controls.'};
   if(S.bench.treat&&S.bench.risk==='R-103'&&S.bench.treat==='Accept')return {ok:false,msg:'Accept leaves a flat-networked, unpatchable core server — that breaches appetite 12 > 9 with no exception. Not acceptable.'};
   var imp=ctl.filter(function(c){return c==='Vendor security patches'});
   if(imp.length)return {ok:false,msg:'Near-miss — “Vendor security patches” DOES NOT EXIST: the OS is end-of-life, the vendor ships nothing. This is the classic trap; segment and replace instead.'};
   var okCtl=['Network segmentation between WMS-7 and the office VLAN','Virtual patching / IPS rules in front of WMS-7'];
   var bad=ctl.filter(function(c){return okCtl.indexOf(c)<0});var missing=okCtl.filter(function(c){return ctl.indexOf(c)<0});
   if(bad.length||missing.length)return {ok:false,msg:'Controls: need segmentation + virtual patching. '+(missing.length?'Missing: '+missing.join(', ')+'. ':'')+(bad.length?'Feasibility problems: '+bad.join(', ')+'.':'')};
   if(!S.res['R-103'])return {ok:false,msg:'Set residual 2×3 on the bench and plot it.'};
   if(S.res['R-103'][0]!==2||S.res['R-103'][1]!==3)return {ok:false,msg:'Residual 2×3: segmentation + virtual patching cut likelihood 3→2 and contain impact 4→3.'};
   var m=S.chart['R-103']&&S.chart['R-103'].res;if(!m||m[0]!==2||m[1]!==3)return {ok:false,msg:'Plot the residual marker at L2×I3 (score 6, Moderate — within appetite).'};
   return {ok:true,msg:'R-103 mitigated with feasible compensating controls, residual 6. Compensating controls are the honest answer where the preferred control cannot exist — the exam tests exactly this discrimination.'}}},
 'H5':{build:function(){return '<p class="subhint">The Review Desk sits on the Signal Bench. Both groups must be exact.</p>'},
    check:function(){var a=ansGet('H5');
   var evWant=['e1','e2','e5'];var evMiss=evWant.filter(function(k){return !a[k]});var evExtra=['e3','e4'].filter(function(k){return a[k]});
   if(evMiss.length||evExtra.length){var m=[];if(evExtra.length)m.push('“Still end-of-life, no change” and “new coffee machine” change nothing — triggering reviews on non-events trains everyone to ignore triggers.');if(evMiss.length)m.push('Missed genuine triggers: threat intel (e1), the scheduled cadence itself (e2), new partner-breach intel (e5).');
    return {ok:false,msg:m.join(' ')}}
   var oWant=['o1','o2','o3'];var oMiss=oWant.filter(function(k){return !a[k]});var oExtra=['o4','o5'].filter(function(k){return a[k]});
   if(oMiss.length||oExtra.length){var m2=[];if(oExtra.length)m2.push('Publishing the raw register to all staff and archiving scores untouched are NOT review outputs — one leaks detail, the other is shelf-ware.');if(oMiss.length)m2.push('Missed outputs: update residuals, re-confirm owners, escalate appetite breaches.');
    return {ok:false,msg:m2.join(' ')}}
   return {ok:true,msg:'Triggers and outputs exact. Management oversight (5.2.6.5) is real only if reviews produce decisions — rescoring, ownership confirmation, and escalation.'}}},
 'H6':{build:function(){return '<p class="subhint">The Exception Desk sits on the Signal Bench. Approve or reject each — exactly one is approvable.</p>'},
    check:function(){var a=ansGet('H6');
   if(!a.ex1||!a.ex2||!a.ex3)return {ok:false,msg:'Rule on all three requests.'};
   if(a.ex1!=='Approve')return {ok:false,msg:'E-1 is the model exception: above appetite, compensating control documented, 30-day expiry, both signatures. Rejecting valid exceptions forces leaders into undocumented risk.'};
   if(a.ex2!=='Reject')return {ok:false,msg:'E-2 sits at residual 3 — inside appetite. Exceptions govern ABOVE-appetite risk only; approving it creates paperwork that hides real exceptions.'};
   if(a.ex3!=='Reject')return {ok:false,msg:'E-3\u2019s 180-day term breaks the 90-day policy: long exceptions become permanent by inertia. Reject, shorten, or treat.'};
   return {ok:true,msg:'1 approved, 2 rejected, all with reasons. Exception governance is appetite enforcement — the moment exceptions blur, the appetite statement becomes decoration.'}}},
 'H7':{build:function(){var a=ansGet('H7');
   return shuf([['cl1','Flood insurance rider for the data room'],['cl2','Indemnification cap negotiated with the insurer'],['cl3','“The vendor may audit our backups at any time”'],['cl4','“Co-branded marketing clause”']],'H7').map(function(c){return chkHtml(c[0],c[1],a[c[0]])}).join('')+
   '<div style="margin-top:8px"><b style="font-size:.86rem">Statements</b>'+
   '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="h7s1" data-f="s1" value="True"'+(a.s1==='True'?' checked':'')+'><span>“After transferring, we no longer have any operational duty to respond to a flood.”</span></label>'+
   '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="h7s1" data-f="s1" value="False"'+(a.s1==='False'?' checked':'')+'><span>“Even after transferring, our operational response duty remains ours.”</span></label>'+
   '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="h7s2" data-f="s2" value="True"'+(a.s2==='True'?' checked':'')+'><span>“Transfer shifts the financial impact of the loss to another party.”</span></label>'+
   '<label class="qOpt" style="background:var(--paper)"><input type="radio" name="h7s2" data-f="s2" value="False"'+(a.s2==='False'?' checked':'')+'><span>“Transfer reduces the likelihood of the flood itself.”</span></label></div>'},
    check:function(){var a=ansGet('H7');
   if((a.cl1?1:0)+(a.cl2?1:0)+(a.cl3?1:0)+(a.cl4?1:0)!==2||!a.cl1||!a.cl2)return {ok:false,msg:'Clauses: the insurance rider and the indemnification cap move money for losses. Auditing rights and marketing clauses move nothing but paper.'};
   if(a.s1!=='False')return {ok:false,msg:'Transfer never transfers the operational duty: the pumps, the recovery, the customer calls stay yours — only the FINANCIAL consequence moves.'};
   if(a.s2!=='True')return {ok:false,msg:'That one is true: transfer = shifting financial impact (insurance, SLA credits, indemnity). The river does not care about your paperwork.'};
   S.treat['R-108']='Transfer';renderLedger();
   return {ok:true,msg:'Transfer understood precisely: consequence moves, responsibility does not. That distinction is why transfers still need your own mitigations (like offsite backups) behind them.'}}},
 'H8':{build:function(){return '<p class="subhint">The composer sits on the Signal Bench. Five rows, five different stakeholders.</p>'},
    check:function(){var a=ansGet('H8');var want={route1:'Board / CFO',route2:'IT Manager',route3:'Head of Procurement',route4:'Security Manager',route5:'General Counsel'};
   for(var k in want){if(!a[k])return {ok:false,msg:'Route all five rows.'};if(a[k]!==want[k])return {ok:false,msg:k.replace('route','Row ')+': “'+a[k]+'” is wrong. Match the conversation: posture → the board; remediation tasks → IT; contract status → procurement; review actions → security; regulator inquiries → legal counsel.'}}
   return {ok:true,msg:'All five routed correctly. Register communication (5.2.4.1) is stakeholder-specific: the same ledger produces five different conversations, and sending one memo to everyone satisfies no one.'}}},
 'H9':{build:function(){var a=ansGet('H9');
   var snap=[['R-101','residual 8'],['R-102','residual 4'],['R-103','residual 6'],['R-104','inherent 8'],['R-105','residual 6'],['R-106','inherent 9'],['R-107','inherent 6'],['R-108','residual 4'],['HF-A','inherent 12 — untreated'],['HF-B','inherent 9'],['HF-C','inherent 12 — untreated']];
   var tbl='<table class="biaTable" style="margin-bottom:10px" aria-label="Portfolio snapshot">'+snap.map(function(s){var sc=parseInt(s[1].replace(/[^0-9]/g,''),10);return '<tr><td>'+s[0]+'</td><td>'+s[1]+'</td><td>'+(sc<=9?'within appetite':'<b style="color:var(--red)">above appetite</b>')+'</td></tr>'}).join('')+'</table>';
   return tbl+'<div><label style="font-size:.78rem;font-weight:700;color:#4A5860;display:block;margin-bottom:3px">% of portfolio within appetite (whole number, no % sign)</label><input type="text" inputmode="numeric" data-f="pct" value="'+esc(a.pct||'')+'" placeholder="e.g. 75"></div>'+
   '<div style="margin-top:8px">'+
   chkHtml('n1','Schedule treatments (or treatment plans) for the outliers',a.n1)+
   chkHtml('n2','File time-bound exceptions where treatment must genuinely wait',a.n2)+
   chkHtml('n3','Lower the appetite threshold to 12 so everything passes',a.n3)+
   chkHtml('n4','Delete the outliers from the register until resolved',a.n4)+'</div>'},
    check:function(){var a=ansGet('H9');var p=numP(a.pct);
   if(p===null)return {ok:false,msg:'Enter the percentage.'};
   if(p<81||p>83)return {ok:false,msg:'Count from the snapshot: 11 rows; scores 8,4,6,8,6,9,6,4,9 are within appetite (≤9) = 9 rows; HF-A (12) and HF-C (12) breach it. 9 ÷ 11 = 81.8% → report 82.'};
   if((a.n1?1:0)+(a.n2?1:0)+(a.n3?1:0)+(a.n4?1:0)!==2||!a.n1||!a.n2)return {ok:false,msg:'Next actions: treat what you can, sign time-bound exceptions for what must wait. Lowering the appetite to make numbers fit and deleting rows to look healthy are the two classic corruptions of oversight.'};
   return {ok:true,msg:'Portfolio posture 82% within appetite, with honest next actions. That single number is what the board sees — and now you can defend it row by row.'}}}
};

var OBJ_H=Object.keys(OBJ_CONTENT_H).map(function(k){return Object.assign({},OBJ_CONTENT_H[k],BUILD_H[k])});
