/* js/ui.js — DOM helpers, icons (inline SVG) and every rendering function:
 * draft builders, console/map, audit bench, remedy, ledger, completion modal, header, toast. */
'use strict';
/* ================= helpers ================= */
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
var ICONS={
 clipboard:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
 folder:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>',
 listchecks:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
 ruler:'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m7.5 4.5 1.5 1.5"/><path d="m10.5 7.5 1.5 1.5"/><path d="m13.5 10.5 1.5 1.5"/><path d="m16.5 13.5 1.5 1.5"/>',
 coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
 play:'<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/>',
 clipboardcheck:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
 map:'<path d="M9 3 3.6 5.4a1 1 0 0 0-.6.9v13.2a.5.5 0 0 0 .7.5L9 17l6 3 5.4-2.4a1 1 0 0 0 .6-.9V3.5a.5.5 0 0 0-.7-.5L15 6 9 3Z"/><path d="M9 3v14"/><path d="M15 6v14"/>',
 gitbranch:'<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
 shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/>',
 book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
 radar:'<circle cx="12" cy="12" r="2"/><path d="M13.4 10.6 19 5"/><path d="M7 7a7 7 0 1 0 10 0"/><path d="M4.5 4.5A11 11 0 1 0 19.5 4.5"/>',
 checkcircle:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
 eye:'<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
 refresh:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
 award:'<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
 chevup:'<path d="m18 15-6-6-6 6"/>',
 chevdown:'<path d="m6 9 6 6 6-6"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
 zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
 server:'<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
 database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
 lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 stamp:'<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 1 17.5 13h-11A2.5 2.5 0 0 1 4 10.5 6.5 6.5 0 0 1 10.5 4a6.5 6.5 0 0 1 6.5 6.5c0 1.33.47 2.55 1.27 3.23Z"/><path d="M5 17h14"/>'
};
function icon(n,s){s=s||16;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(ICONS[n]||'')+'</svg>'}
/* ================= DRAFT UI ================= */
function optHtml(list,val){return list.map(function(o){return '<option value="'+o.id+'"'+(o.id===val?' selected':'')+'>'+o.label+'</option>'}).join('')}
function buildSubnets(){var v=state.env.vpc,base=v?(v.split('.').slice(0,2).join('.')+'.'):'',pub='<option value="">— choose —</option>',priv=pub;
 if(v){pub+='<option value="'+base+'1.0/24"'+(state.env.subPub===base+'1.0/24'?' selected':'')+'>'+base+'1.0/24 (AZ-A)</option><option value="'+base+'3.0/24"'+(state.env.subPub===base+'3.0/24'?' selected':'')+'>'+base+'3.0/24 (AZ-B)</option>';
 priv+='<option value="'+base+'2.0/24"'+(state.env.subPriv===base+'2.0/24'?' selected':'')+'>'+base+'2.0/24 (AZ-A)</option><option value="'+base+'4.0/24"'+(state.env.subPriv===base+'4.0/24'?' selected':'')+'>'+base+'4.0/24 (AZ-B)</option>';}
 $('#selSubPub').innerHTML=pub;$('#selSubPriv').innerHTML=priv;}
function buildInstGrid(){var e=state.env;$('#instGrid').innerHTML=INSTANCES.map(function(i){
 return '<label class="instopt'+(e.compSize===i.id?' sel':'')+'"><input type="radio" name="inst" value="'+i.id+'"'+(e.compSize===i.id?' checked':'')+' aria-label="'+i.id+'">'
 +'<div class="in">'+i.id+'</div><div class="is">'+i.vcpu+' vCPU · '+i.ram+' GB RAM'+(i.gpu?' · GPU':'')+'</div><div class="ip">CHF '+i.price+'/mo</div></label>'}).join('')}
function buildSg(){var e=state.env;$('#sgList').innerHTML=SG.map(function(r){
 return '<label class="sgrule'+(e.sg[r.id]?' on':'')+'"><input type="checkbox" data-sg="'+r.id+'"'+(e.sg[r.id]?' checked':'')+'><span class="sl">'+r.label+'<div class="srisk">'+r.risk+'</div></span></label>'}).join('')}
function buildTags(){var e=state.env;$('#tagRows').innerHTML=Object.keys(TAGDEF).map(function(k){
 return '<div class="tagrow"><span class="tk">'+k+'</span><select data-tag="'+k+'" aria-label="Tag value for '+k+'">'+TAGDEF[k].map(function(v){return '<option value="'+v+'"'+(e.tags[k]===v?' selected':'')+'>'+v+'</option>'}).join('')+'</select></div>'}).join('')}
function buildIac(){var t=state.env.iac;
 $('#iacSheet').innerHTML=
 '# platform-main.cf — Meridian EU analytics platform<br>'+
 '<span class="kw">provider</span> <span class="str">"cloudforge"</span> {<br>'+
 '&nbsp;&nbsp;region = <input id="iacRegion" data-iac="region" type="text" value="'+esc(t.region)+'" aria-label="template region value" placeholder="…"> <span class="cm"># eu region, lowest latency</span><br>'+
 '}<br>'+
 '<span class="kw">resource</span> <span class="str">"compute_cluster"</span> <span class="str">"analytics"</span> {<br>'+
 '&nbsp;&nbsp;count        = <input id="iacCount" data-iac="count" type="text" value="'+esc(t.count)+'" aria-label="template node count" placeholder="…"><br>'+
 '&nbsp;&nbsp;machine_type = <input id="iacMachine" data-iac="machine" type="text" value="'+esc(t.machine)+'" aria-label="template machine type" placeholder="…"><br>'+
 '&nbsp;&nbsp;tags = { environment = <input id="iacEnv" data-iac="env" type="text" value="'+esc(t.env)+'" aria-label="template environment tag" placeholder="…">,<br>'+
 '&nbsp;&nbsp;&nbsp;&nbsp;owner = <span class="str">"platform"</span>, cost-center = <span class="str">"CC-2847"</span>, data-class = <span class="str">"confidential"</span> }<br>'+
 '}'}
function syncDraft(){var e=state.env;
 $('#selRegion').value=e.region;$('#selVpc').value=e.vpc;buildSubnets();
 $('#ckIgw').checked=e.igw;$('#ckNat').checked=e.nat;buildInstGrid();
 $('#cntVal').textContent=e.count;$('#ckAuto').checked=e.auto;
 $('#selStoreType').value=e.storeType;$('#selStoreTier').value=e.storeTier;
 $('#rgIops').value=e.iops;$('#iopsVal').textContent=e.iops;
 $('#selDb').value=e.db;$('#ckMultiAz').checked=e.multiAz;buildSg();
 $('#selIam').value=e.iam;buildTags();buildIac();}
function updateEnvUI(){renderReq();renderBom();save()}
function renderReq(){var rs=reqStatus();
 $('#reqBoard').innerHTML=rs.map(function(r){
  return '<div class="reqrow '+(r.ok?'ok':'bad')+'"><span class="rmark">'+(r.ok?icon('check',13):icon('x',13))+'</span><span><span class="rt">'+r.t+'</span><br><span class="rd">'+r.d+'</span></span></div>'}).join('')}
function renderBom(){var c=monthlyCost(),pct=Math.min(100,Math.round(c.total/BUDGET*100));
 $('#bomBody').innerHTML=(c.lines.length?c.lines.map(function(l){return '<div class="bomline"><span class="n">'+l[0]+'</span><span>CHF '+l[1]+'</span></div>'}).join(''):'<div class="bomcap">Nothing selected yet — choose resources in the Draft stage.</div>')
 +'<div class="bomtotal'+(c.total>BUDGET?' bomover':'')+'"><span>Total / month</span><span>CHF '+c.total.toLocaleString('en-US')+'</span></div>'
 +'<div class="bombar'+(c.total>BUDGET?' over':'')+'"><i style="width:'+pct+'%"></i></div>'
 +'<div class="bomcap">Budget cap CHF '+BUDGET.toLocaleString('en-US')+'/mo · synthetic prices · autoscaling may add short-lived peak nodes on top.</div>'}

/* ================= BUILD ================= */
function runProvision(){var e=state.env,log=[];
 log.push('<span class="lg">$ cloudforge apply --template platform-main.cf --region '+(e.region||'?')+'</span>');
 var need=[['region','region'],['vpc','VPC CIDR'],['subPub','public subnet'],['subPriv','private subnet'],['compSize','instance type'],['storeType','data store type'],['db','database engine']];
 var missing=need.filter(function(p){return!e[p[0]]}).map(function(p){return p[1]});
 if(missing.length){
  log.push('<span class="lstep">PLAN</span> 8 resources declared');
  log.push('<span class="lerr">ERROR BlueprintError: incomplete blueprint — not specified: '+missing.join(', ')+'</span>');
  log.push('<span class="lg">No resources were created. Complete the Draft sheets and apply again.</span>');
  e.provisioned=false;e.testsRun=false;
 }else{
  log.push('<span class="lstep">PLAN</span> 8 resources to create in '+e.region);
  log.push('<span class="lg">EVALUATE</span> igw: <span class="lok">created/verified</span>'+(e.igw?'':' <span class="lwarn">(skipped — none declared)</span>'));
  log.push('<span class="lg">EVALUATE</span> subnet public '+e.subPub+': <span class="lok">created</span>');
  log.push('<span class="lg">EVALUATE</span> subnet private '+e.subPriv+': <span class="lok">created</span>');
  log.push(e.nat?'<span class="lg">EVALUATE</span> nat-gateway (public subnet): <span class="lok">created</span>':'<span class="lwarn">WARN no NAT gateway — private instances cannot download patches</span>');
  log.push('<span class="lg">EVALUATE</span> compute_cluster analytics ×'+e.count+' '+e.compSize+(e.auto?' (autoscaling)':'')+(e.auto?'':' <span class="lwarn">WARN single-node: no elasticity at peak</span>'));
  log.push('<span class="lg">EVALUATE</span> data store '+e.storeType+(e.storeType==='block'?' @ '+e.iops+' IOPS':'')+(e.storeType==='block'&&e.iops<3000?' <span class="lwarn">WARN below the 3,000 IOPS analytics profile</span>':''));
  log.push('<span class="lg">EVALUATE</span> database '+e.db+(e.multiAz?' <span class="lok">Multi-AZ standby in AZ-B</span>':' <span class="lwarn">WARN single-AZ: availability risk (99.9% at risk)</span>'));
  var open=SG.filter(function(r){return(r.id==='r22any'||r.id==='r5432any'||r.id==='r80')&&e.sg[r.id]});
  if(open.length)log.push('<span class="lwarn">WARN security group allows world-open access ('+open.map(function(r){return r.id}).join(', ')+') — violates the exposure requirement</span>');
  if(!tagsOk())log.push('<span class="lwarn">WARN some resources untagged — tagging policy violated</span>');
  log.push('<span class="lg">EVALUATE</span> iam role: '+(e.iam||'—')+(e.iam==='admin-full'?' <span class="lwarn">WARN wildcard admin on the runtime role</span>':''));
  log.push('<span class="lok">APPLY COMPLETE</span> 8 resources provisioned. Run the validation gate before go-live.');
  e.provisioned=true;
 }
 $('#provLogWrap').innerHTML='<div class="console" role="log" aria-live="polite">'+log.join('\n')+'</div>';
 $('#provState').textContent=e.provisioned?('Provisioned at '+new Date().toLocaleTimeString()+' — see the log, then Verify.'):'Provisioning blocked — see the log.';
 renderMap(e.provisioned&&missing.length===0);updateEnvUI();}
function renderMap(on){var e=state.env,w=$('#mapWrap');
 if(!on){w.hidden=true;return}
 w.hidden=false;var t=e.multiAz?'db (Multi-AZ)':'db (single-AZ!)';
 var dbCol=e.multiAz?'#047857':'#b45309';
 $('#svgMap').innerHTML=
 '<rect x="10" y="10" width="880" height="310" rx="8" fill="none" stroke="#0e7490" stroke-dasharray="6 5"/>'+
 '<text x="26" y="34" font-size="14" font-weight="bold" fill="#0e7490">REGION '+esc(e.region)+'</text>'+
 '<ellipse cx="90" cy="165" rx="52" ry="24" fill="#e7dfca" stroke="#1f2937"/><text x="90" y="169" font-size="12" text-anchor="middle" fill="#1f2937">Internet</text>'+
 '<rect x="180" y="140" width="86" height="50" rx="6" fill="'+(e.igw?'#d9edf3':'#f3d9d9')+'" stroke="'+(e.igw?'#0e7490':'#b91c1c')+'"/><text x="223" y="162" font-size="11" text-anchor="middle" fill="#1f2937">IGW</text><text x="223" y="178" font-size="10" text-anchor="middle" fill="'+(e.igw?'#047857':'#b91c1c')+'">'+(e.igw?'attached':'none')+'</text>'+
 '<line x1="142" y1="165" x2="180" y2="165" stroke="#1f2937" stroke-width="2"/>'+
 '<rect x="310" y="60" width="250" height="210" rx="8" fill="#eaf4f7" stroke="#0e7490"/><text x="322" y="84" font-size="12" font-weight="bold" fill="#155e75">PUBLIC SUBNET '+esc(e.subPub||'—')+'</text>'+
 '<rect x="330" y="100" width="210" height="44" rx="6" fill="#fff" stroke="#0e7490"/><text x="435" y="126" font-size="12" text-anchor="middle" fill="#1f2937">Load balancer :443</text>'+
 (e.nat?'<rect x="330" y="160" width="210" height="44" rx="6" fill="#fff" stroke="#0e7490"/><text x="435" y="186" font-size="12" text-anchor="middle" fill="#1f2937">NAT gateway (egress)</text>':'<text x="435" y="188" font-size="11" text-anchor="middle" fill="#b45309">no NAT — private egress broken</text>')+
 '<rect x="600" y="60" width="270" height="210" rx="8" fill="#f3efe4" stroke="#92400e"/><text x="612" y="84" font-size="12" font-weight="bold" fill="#92400e">PRIVATE SUBNET '+esc(e.subPriv||'—')+'</text>'+
 '<rect x="620" y="100" width="230" height="44" rx="6" fill="#fff" stroke="#6b7280"/><text x="735" y="126" font-size="12" text-anchor="middle" fill="#1f2937">analytics ×'+e.count+' · '+esc(e.compSize||'—')+'</text>'+
 '<rect x="620" y="160" width="230" height="44" rx="6" fill="#fff" stroke="'+dbCol+'"/><text x="735" y="186" font-size="12" text-anchor="middle" fill="'+dbCol+'">'+esc(e.db?e.db:'db —')+' · '+t+'</text>'+
 '<rect x="620" y="216" width="230" height="36" rx="6" fill="#fff" stroke="#6b7280"/><text x="735" y="239" font-size="11" text-anchor="middle" fill="#1f2937">'+esc(e.storeType?e.storeType+' data store':'data store —')+(e.storeTier?' · '+e.storeTier:'')+'</text>'+
 '<line x1="560" y1="165" x2="600" y2="165" stroke="#1f2937" stroke-width="2"/>'}
function runTests(){var e=state.env;
 if(!e.provisioned){$('#testList').innerHTML='<div class="emptystate">Nothing to validate — provision the blueprint first (Build stage). A validation gate only means something for a build that ran.</div>';$('#testState').textContent='Blocked: provision first.';e.testsRun=false;updateEnvUI();return}
 e.testsRun=true;var ts=testsCompute(),n=ts.filter(function(t){return t.ok}).length;
 $('#testList').innerHTML=ts.map(function(t){
  return '<div class="testrow '+(t.ok?'ok':'bad')+'"><span class="tmark">'+(t.ok?icon('check',15):icon('x',15))+'</span><span><span class="tt">'+t.id+' · '+t.t+'</span> — <span class="td">'+t.d+'</span>'+(t.ok?'':'<div class="tfix">Fix: '+t.fix+'</div>')+'</span></div>'}).join('');
 $('#testState').textContent=n+'/5 passed'+(n===5?' — Go for launch.':' — fix the flagged blueprint and re-run.');
 var live=$('#provLogWrap .console');if(live)live.insertAdjacentHTML('beforeend','\n<span class="lstep">VALIDATE</span> '+n+'/5 tests passed');
 updateEnvUI()}

/* ================= inject method + storage drills ================= */
function injectDrills(){
 var card=$$('.refcard').filter(function(c){return c.textContent.indexOf('Four ways to provision')>-1})[0];
 if(card&&!$('#cardMethods')){card.id='cardMethods';
  card.insertAdjacentHTML('beforeend','<div style="margin-top:12px;border-top:1px dashed var(--line);padding-top:10px"><p class="eyebrow" style="margin-bottom:8px">Drill — match situation to method (Objective M1)</p>'+
  SITUATIONS.map(function(s){return '<div class="tagrow" style="grid-template-columns:1fr 190px"><span style="font-size:12.5px;color:var(--ink2)">'+s.t+'</span><select data-method="'+s.id+'" aria-label="Provisioning method for situation '+s.id.slice(3)+'">'+optHtml(METHOD_OPTS,state.audit.method[s.id])+'</select></div>'}).join('')+'</div>')}
 var sg=$('#sub-storage .fgrid');
 if(sg&&!$('#storMatch')){sg.insertAdjacentHTML('afterend','<div style="margin-top:12px;border-top:1px dashed var(--line);padding-top:10px" id="storMatch"><p class="eyebrow" style="margin-bottom:8px">Drill — match workload to storage type (Objective M5)</p>'+
  STOR_WORK.map(function(s){return '<div class="tagrow" style="grid-template-columns:1fr 190px"><span style="font-size:12.5px;color:var(--ink2)">'+s.t+'</span><select data-stor="'+s.id+'" aria-label="Storage type for workload '+s.id.slice(2)+'">'+optHtml(STOR_OPTS,state.audit.stor[s.id])+'</select></div>'}).join('')+'</div>')}}
/* ================= AUDIT BENCH ================= */
function renderAudit(){var hard=state.mode==='hard';
 $$('.audtabs button').forEach(function(b){var k=b.getAttribute('data-aud');b.hidden=!hard&&k!=='findings';});
 ['forensics','drift','telemetry','events'].forEach(function(k){var p=$('#aud-'+k);if(p)p.hidden=!hard;});
 var c=state.audit;
 $('#aud-findings').innerHTML='<p style="margin:0 0 12px;font-size:13px;color:var(--ink2)">A config scan returned six findings for the legacy stack. Classify each: is it <strong>real mis-provisioning</strong> or <strong>benign, documented behavior</strong>?</p>'+
 FINDINGS.map(function(f){return '<div class="findcard" data-fc="'+f.id+'"><div class="fh"><span class="fid">'+f.id+'</span><span class="ft">'+f.t+'</span></div><div class="fdesc">'+f.d+'</div><div class="fctl"><label style="font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--ink2)" for="cls-'+f.id+'">CLASSIFY</label><select id="cls-'+f.id+'" data-kind="classify" data-id="'+f.id+'"><option value="">— verdict —</option><option value="real"'+(c.classify[f.id]==='real'?' selected':'')+'>Real mis-provisioning</option><option value="benign"'+(c.classify[f.id]==='benign'?' selected':'')+'>Benign / by design</option></select></div></div>'}).join('');
 $('#aud-forensics').innerHTML='<p style="margin:0 0 12px;font-size:13px;color:var(--ink2)">A partner team’s deployment run failed. Read each ERROR block and assign the root cause.</p>'+
 '<div class="causegrid">'+FORENSICS.map(function(f){return '<div class="causecard"><div style="font-weight:800;font-size:13px;margin-bottom:7px">'+f.label+'</div><div class="clog">'+f.lines.map(function(l){return l.indexOf('ERROR')>-1?'<span class="e">'+esc(l)+'</span>':'<span class="i">'+esc(l)+'</span>'}).join('\n')+'</div><label for="cause-'+f.id+'">ROOT CAUSE</label><select id="cause-'+f.id+'" data-kind="cause" data-id="'+f.id+'">'+CAUSES.map(function(o){return '<option value="'+o.id+'"'+(c.cause[f.id]===o.id?' selected':'')+'>'+o.label+'</option>'}).join('')+'</select></div>'}).join('')+'</div>';
 $('#aud-drift').innerHTML='<p style="margin:0 0 12px;font-size:13px;color:var(--ink2)">Scheduled comparison of the template (<span class="mono">platform-main.cf</span>) against live config. Flag only meaningful configuration drift and rate its severity.</p>'+
 '<div class="tblscroll"><table class="drifttable"><thead><tr><th>Resource / setting</th><th>Template</th><th>Live config</th><th>Drift?</th><th>Severity</th></tr></thead><tbody>'+
 DRIFT.map(function(r){var fl=c.drift[r.id]||'';
  return '<tr'+(r.chg?' class="chg"':'')+'><td>'+r.item+'</td><td>'+esc(r.tpl)+'</td><td>'+esc(r.live)+'</td><td class="plain"><label class="driftchk"><input type="checkbox" aria-label="Flag drift on '+esc(r.item)+'" data-kind="driftflag" data-id="'+r.id+'"'+(fl?' checked':'')+'></label></td><td class="plain"><select aria-label="Severity for '+esc(r.item)+'" data-kind="driftsev" data-id="'+r.id+'"'+(fl?'':' disabled')+'><option value=""'+(fl===''?' selected':'')+'>—</option><option value="high"'+(fl==='high'?' selected':'')+'>high</option><option value="medium"'+(fl==='medium'?' selected':'')+'>medium</option></select></td></tr>'}).join('')+'</tbody></table></div>';
 $('#aud-telemetry').innerHTML='<p style="margin:0 0 12px;font-size:13px;color:var(--ink2)">Two weeks of utilization for four resources of the legacy stack. Decide the right-sizing action for each.</p>'+
 '<div class="telgrid">'+TELE.map(function(t){return '<div class="telcard"><div class="tn">'+t.id+'</div><div class="tm">CPU '+t.cpu+'<br>RAM '+t.ram+'</div><div style="font-size:12px;color:var(--ink3);margin-top:5px">'+t.note+'</div><div class="tact"><select aria-label="Action for '+t.id+'" data-kind="telo" data-id="'+t.id+'">'+TELOPTS.map(function(o){return '<option value="'+o.id+'"'+(c.telo[t.id]===o.id?' selected':'')+'>'+o.label+'</option>'}).join('')+'</select></div></div>'}).join('')+'</div>';
 $('#aud-events').innerHTML='<p style="margin:0 0 12px;font-size:13px;color:var(--ink2)">Raw provisioning events (one afternoon, synthetic). Complete the three alert rules so the next bad change pages someone.</p>'+
 '<div class="evstream" role="log">'+EVENTS.join('\n')+'</div>'+
 RULEDEFS.map(function(rd){return '<div class="rulebuilder"><div class="rh">'+icon('zap',14)+rd.name+'</div><div class="rg"><div><label for="rev-'+rd.id+'">TRIGGERING EVENT</label><select id="rev-'+rd.id+'" data-kind="ruleEv" data-id="'+rd.id+'">'+RULEEV.map(function(v){return '<option value="'+v+'"'+(c.ruleEv[rd.id]===v?' selected':'')+'>'+(v||'— choose event —')+'</option>'}).join('')+'</select></div><div><label for="rcd-'+rd.id+'">ALERT CONDITION</label><select id="rcd-'+rd.id+'" data-kind="ruleCond" data-id="'+rd.id+'">'+RULECOND[rd.id].map(function(v){return '<option value="'+v+'"'+(c.ruleCond[rd.id]===v?' selected':'')+'>'+(v||'— choose condition —')+'</option>'}).join('')+'</select></div></div></div>'}).join('');
}
/* ================= REMEDY STAGE ================= */
function renderRemedy(){var hard=state.mode==='hard',c=state.audit,h=[];
 h.push('<div id="fixBlock"><p class="eyebrow" style="margin-bottom:8px">1 · Fix selection — one correct action per real finding (Objective '+(hard?'—':'M11')+')</p>');
 FINDINGS.filter(function(f){return f.real}).forEach(function(f,idx){
  h.push('<div class="findcard"><div class="fh"><span class="fid">'+f.id+'</span><span class="ft">'+f.t+'</span></div><div class="fixgrid" role="radiogroup" aria-label="Fix for '+f.id+'">');
  f.fixes.forEach(function(o){var checked=c.fix[f.id]===o.id;
   h.push('<label class="fixopt"><input type="radio" name="fix-'+f.id+'" data-kind="fix" data-id="'+f.id+'" value="'+o.id+'"'+(checked?' checked':'')+'><span>'+o.t+'</span></label>')});
  h.push('</div></div>')});
 h.push('</div>');
 h.push('<div id="seqBlock" style="margin-top:18px"><p class="eyebrow" style="margin-bottom:8px">2 · Response plan order — contain → assess → fix → verify (Objectives '+(hard?'H5':'M11 · H5')+')</p>');
 c.seq.forEach(function(stepIdx,pos){h.push('<div class="seqrow"><span class="sq">'+(pos+1)+'</span><span class="st">'+esc(SEQSTEPS[stepIdx])+'</span><span class="updown"><button type="button" data-act="sequp" data-i="'+pos+'" aria-label="Move step up">'+icon('chevup',14)+'</button><button type="button" data-act="seqdown" data-i="'+pos+'" aria-label="Move step down">'+icon('chevdown',14)+'</button></span></div>')});
 h.push('</div>');
 h.push('<div id="governBlock" style="margin-top:18px"><p class="eyebrow" style="margin-bottom:8px">3 · Govern — purchasing & budget guardrails (Objectives '+(hard?'H7':'M12 · H7')+')</p><div class="fgrid">');
 PURCH_WORKLOADS.forEach(function(w){h.push('<div class="field"><label for="purch-'+w.id+'">'+w.t+'</label><select id="purch-'+w.id+'" data-kind="purch" data-id="'+w.id+'">'+PURCHOPTS.map(function(o){return '<option value="'+o.id+'"'+(c.purch[w.id]===o.id?' selected':'')+'>'+o.label+'</option>'}).join('')+'</select></div>')});
 h.push('<div class="field"><label for="rgBudget">Budget alert threshold</label><div class="rangewrap"><input type="range" id="rgBudget" data-kind="budget" min="0" max="100" step="5" value="'+c.budgetAlert+'"><span class="rv" id="budgetVal">'+c.budgetAlert+'%</span></div><div class="fdesc">Notify before the cap is breached — 80% leaves reaction time.</div></div>');
 h.push('<div class="field"><label>Region guardrail</label><label class="togglerow"><input type="checkbox" data-kind="deny"'+(c.regionDeny?' checked':'')+'><span><span class="tl">Deny provisioning outside EU regions</span><br><span class="td">Platform-level enforcement of the residency rule.</span></span></label></div>');
 h.push('</div></div>');
 if(hard){h.push('<div id="verifyBlock" style="margin-top:18px"><p class="eyebrow" style="margin-bottom:8px">4 · Verification protocol — prove the fix (Objective H9)</p><p style="font-size:13px;color:var(--ink2);margin:0 0 10px">Rank the five steps that produce real evidence the exposure is closed (1 = first). Distractors stay unranked.</p>');
  VSTEPS.forEach(function(s){var v=c.verify[s.id]||0;h.push('<div class="verifyrow"><span class="vt">'+s.t+'</span><select aria-label="Rank for: '+esc(s.t.slice(0,60))+'" data-kind="verify" data-id="'+s.id+'">'+VRANKS.map(function(o){return '<option value="'+o.id+'"'+(v===o.id?' selected':'')+'>'+o.label+'</option>'}).join('')+'</select></div>')});
  h.push('</div>')}
 $('#remedyBody').innerHTML=h.join('');
}
/* ================= LEDGER ================= */
function renderLedger(){var L=$('#ledger'),mode=state.mode;L.innerHTML='';
 var unlockedIdx=mode==='medium'?objList().findIndex(function(o){return !(state.obj[o.id]&&state.obj[o.id].passed)}):-1;
 ['P1','P2','P3','P4'].forEach(function(p){
  var items=objList().filter(function(o){return o.p===p});if(!items.length)return;
  var done=items.filter(function(o){return state.obj[o.id]&&state.obj[o.id].passed}).length;
  var g=document.createElement('div');g.className='ledger-group'+(done===items.length?' collapsed':'');
  g.innerHTML='<h4 role="button" tabindex="0" aria-expanded="'+(done===items.length?'false':'true')+'"><span class="dot" style="background:'+PCOL[p]+'"></span>'+PILLARS[p]+'<span class="cnt">'+done+'/'+items.length+'</span></h4><div class="gwrap"></div>';
  var wrap=g.querySelector('.gwrap');
  items.forEach(function(o){var idx=objList().indexOf(o);var rec=state.obj[o.id]||{};var locked=mode==='medium'&&unlockedIdx>-1&&idx>unlockedIdx;
   var lvl=state.hints[o.id]||0;
   var d=document.createElement('div');d.className='objcard'+(rec.passed?' passed':'')+(locked?' locked':'');d.id='card-'+o.id;
   d.style.borderLeftColor=PCOL[o.p];
   d.innerHTML='<div class="otop"><span class="oid">'+o.id+'</span><span class="pillbadge" style="background:'+PCOL[o.p]+'">'+o.p+'</span><span class="statechip'+(rec.passed?' pass':'')+'">'+(rec.passed?'PASSED'+(rec.first?' · 1st':''):locked?'LOCKED':'OPEN')+'</span></div>'
    +'<div class="otitle">'+o.t+'</div>'+(locked?'<p>Complete the previous objective to unlock.</p>':'<p>'+o.b+'</p>')
    +(locked?'':'<div class="obtns"><button class="mini primary" data-act="check" data-obj="'+o.id+'">'+icon('stamp',13)+' Check results</button>'
    +'<button class="mini jumpto" data-act="jump" data-obj="'+o.id+'">'+icon('search',13)+' Show me where</button>'
    +(mode==='hard'?'<button class="mini ghost" data-act="hint" data-obj="'+o.id+'">'+icon('info',13)+' Nudge (−score)</button>':'<button class="mini ghost" data-act="hint" data-obj="'+o.id+'"'+(lvl>=3?' disabled':'')+'>'+icon('info',13)+' Hint '+(lvl?lvl+'/3':'(3 tiers)')+'</button>')
    +'</div><div class="feed" id="feed-'+o.id+'" role="status"></div><div class="hintbox" id="hint-'+o.id+'"></div>');
   wrap.appendChild(d)});
  L.appendChild(g);
  g.querySelector('h4').addEventListener('click',function(){g.classList.toggle('collapsed');var h4=g.querySelector('h4');h4.setAttribute('aria-expanded',g.classList.contains('collapsed')?'false':'true')});
  g.querySelector('h4').addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();this.click()}});
 });
}
function showFeed(id,res){var f=$('#feed-'+id);if(!f)return;f.className='feed show '+(res.ok?'ok':res.near?'near':'bad');f.innerHTML=(res.ok?'<b>'+icon('check',13)+' Correct</b>':'<b>'+(res.near?icon('alert',13)+' Near-miss':icon('x',13)+' Not yet')+'</b>')+esc(res.msg)}
function checkObj(id){var def=objDef(id);if(!def)return;var rec=state.obj[id]||{attempts:0,passed:false};rec.attempts++;
 var res=VALS[id]();if(res.ok&&!rec.passed){rec.passed=true;rec.first=rec.attempts===1}
 state.obj[id]=rec;save();renderLedger();showFeed(id,res);updateHeader();
 if(res.ok){toast('Objective '+id+' passed — '+objDef(id).t);maybeDone()}}
function doHint(id){var def=objDef(id);if(!def)return;var lvl=state.hints[id]||0,max=state.mode==='hard'?1:3;
 if(lvl>=max)return;lvl++;state.hints[id]=lvl;state.hintsUsed++;
 save();renderLedger();updateHeader();
 var box=$('#hint-'+id);if(box){box.className='hintbox show';box.innerHTML='<span class="hl">Hint '+lvl+'/'+max+'</span> — '+esc(def.hints[lvl-1])}}
function doJump(id){var def=objDef(id);if(!def)return;var j=def.jump||{};
 if(j.stage)showStage(j.stage);if(j.sub)showSub(j.sub);if(j.aud)showAud(j.aud);
 if(j.sel){var t=$(j.sel);if(t){t.scrollIntoView({behavior:'smooth',block:'center'});t.classList.remove('pulse');void t.offsetWidth;t.classList.add('pulse')}}}
function maybeDone(){var all=objList().every(function(o){return state.obj[o.id]&&state.obj[o.id].passed});
 $('#btnFinish').hidden=!all;if(all&&!state.seenDone){state.seenDone=true;save();openDone()}}
function starCount(){var os=objList(),passed=os.filter(function(o){return state.obj[o.id]&&state.obj[o.id].passed});
 var fa=passed.filter(function(o){return state.obj[o.id].first}).length,frac=passed.length?fa/passed.length:0;
 var qt=QUIZ[state.mode],qc=qt.filter(function(q){return state.quiz[q.id]&&state.quiz[q.id].ok}).length,qf=qt.length?qc/qt.length:0;
 var h=state.hintsUsed;
 if(frac>=0.9&&h<=2&&qf>=0.8)return 5;if(frac>=0.75&&h<=4&&qf>=0.6)return 4;if(frac>=0.6)return 3;if(frac>=0.4)return 2;return 1}
function starSvg(n){var s='';for(var i=0;i<5;i++){var fill=i<n?'#d97706':'#d8d0bd';s+='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="'+fill+'" d="M12 2l2.9 6.26L21.5 9.3l-4.9 4.5 1.3 6.7L12 17.2l-5.9 3.3 1.3-6.7L2.5 9.3l6.6-1.04L12 2z"/></svg>'}return '<div class="starfield" role="img" aria-label="'+n+' of 5 stars">'+s+'</div>'}
function buildFocusAreas(){var os=objList(),qt=QUIZ[state.mode]||[],items=[];
 os.forEach(function(o){var rec=state.obj[o.id]||{},r=[];
  if(rec.passed&&rec.first===false)r.push('needed more than one check — re-run that step once and read the checker’s guidance again');
  var lvl=state.hints[o.id]||0;if(lvl)r.push('used '+lvl+' hint'+(lvl>1?'s':'')+' — retry it cold to confirm it stuck');
  if(r.length)items.push({t:o.id+' · '+o.t,w:r.join('; ')})});
 var wrong=qt.filter(function(q){var r=state.quiz[q.id];return r&&r.pick!==undefined&&!r.ok});
 wrong.forEach(function(q){items.push({t:'Quiz · '+q.tag,w:'answer missed — re-read the explanation under the question, then the matching Draft sheet'})});
 var unanswered=qt.filter(function(q){var r=state.quiz[q.id];return !(r&&r.pick!==undefined)}).length;
 if(unanswered)items.push({t:'Certification drill',w:(qt.length-unanswered)+' of '+qt.length+' quiz questions committed — finish the quiz to check your recall'});
 if(items.length)return {html:'<p style="margin:16px 0 0;font-weight:800;font-size:13.5px">Focus areas for your next study session</p><ul class="nextlist">'+items.map(function(f){return '<li><b>'+esc(f.t)+'</b> — '+esc(f.w)+'.</li>'}).join('')+'</ul>',count:items.length};
 return {html:'<p style="margin:16px 0 0;font-weight:800;font-size:13.5px">Focus areas</p><p style="font-size:13.5px;color:var(--ink2);margin:6px 0 0">No weak spots in this run: every objective passed on the first check, no hints needed, and the full quiz answered correctly. Use the reinforcement pointers below to keep it fresh.</p>',count:0}}
function openDone(){var all=objList(),passed=all.filter(function(o){return state.obj[o.id]&&state.obj[o.id].passed}),n=starCount();
 var recap=['P1','P2','P3','P4'].map(function(p){var items=all.filter(function(o){return o.p===p});if(!items.length)return '';
  return '<div class="rg"><div class="rgh" style="background:'+PCOL[p]+'">'+PILLARS[p]+'</div><div class="rgb">'+items.map(function(o){return (state.obj[o.id]&&state.obj[o.id].passed?'✓ ':'○ ')+o.id+' '+o.t}).join('<br>')+'</div></div>'}).join('');
 var qt=QUIZ[state.mode],qc=qt.filter(function(q){return state.quiz[q.id]&&state.quiz[q.id].ok}).length;
 $('#doneBody').innerHTML='<p style="text-align:center;font-size:14px;color:var(--ink2)">All '+all.length+' objectives passed — you can explain, configure, validate and govern resource provisioning (CV0-004 · 2.4).</p>'
 +starSvg(n)
 +'<p style="text-align:center;font-family:var(--mono);font-weight:800">Objectives '+passed.length+'/'+all.length+' · Quiz '+qc+'/'+qt.length+' · Hints used '+state.hintsUsed+'</p>'
 +buildFocusAreas().html
 +'<div class="recap">'+recap+'</div>'
 +'<p style="margin:14px 0 0;font-weight:800;font-size:13.5px">Where to go next</p><ul class="nextlist"><li>Deep-dive <b>objective 2.2 (IaC)</b>: template modules, state, policy-as-code.</li><li>Practice CV0-004 performance-based questions (PBQs) — ordering steps and filling config values (that is what this lab simulated).</li><li>Rebuild this exact stack in a real provider’s sandbox; read its equivalent of every log line you saw here.</li><li>Study the three real incidents on the Reference Shelf as case studies.</li></ul>';
 $('#modalDoneBack').classList.add('show');$('#btnDoneClose').focus()}
/* ================= HEADER / TOAST / STAGE NAV ================= */
function updateHeader(){var all=objList(),passed=all.filter(function(o){return state.obj[o.id]&&state.obj[o.id].passed});
 var frac=all.length?passed.length/all.length:0;
 $('#tbObj').textContent=passed.length+'/'+all.length;
 var fa=passed.filter(function(o){return state.obj[o.id].first}).length;
 $('#tbFirst').textContent=passed.length?('first-attempt '+Math.round(fa/passed.length*100)+'%'):'';
 var qt=QUIZ[state.mode]||[],qc=qt.filter(function(q){return state.quiz[q.id]&&state.quiz[q.id].ok}).length;
 $('#tbQuiz').textContent=qc+'/'+qt.length;
 $('#tbScore').textContent=Math.round(frac*100)+'%';
 $('#tbHints').textContent=String(state.hintsUsed);
 $('#ringN').textContent=Math.round(frac*100)+'%';
 $('#ringArc').style.strokeDashoffset=String(113*(1-frac));
 maybeDone()}
var toastTimer=null;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show')},2600)}
function showStage(k){$$('.stagebar button').forEach(function(b){b.setAttribute('aria-selected',String(b.id==='tab-'+k))});
 $$('.stagepanel').forEach(function(p){p.classList.toggle('active',p.id==='stage-'+k)})}
function showSub(k){$$('.subtabs button').forEach(function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-sub')===k))});
 $$('#stage-draft .subpanel').forEach(function(p){p.classList.toggle('active',p.id==='sub-'+k)})}
function showAud(k){$$('.audtabs button').forEach(function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-aud')===k))});
 $$('.audpanel').forEach(function(p){p.classList.toggle('active',p.id==='aud-'+k)})}
function renderConstraints(){var g=$('#constraintGrid');if(!g)return;
 g.innerHTML=CONSTRAINTS.map(function(k){return '<label class="citem"><input type="checkbox" data-kind="constraint" data-id="'+k.id+'"'+(state.audit.constraints[k.id]?' checked':'')+'><span><span>'+k.t+'</span><br><span class="src">source: '+k.src+'</span></span></label>'}).join('')}
function renderGlossary(){$('#glossList').innerHTML=GLOSSARY.map(function(t){return '<dt>'+t[0]+'</dt><dd>'+t[1]+'</dd>'}).join('')}
function resumeRender(){var e=state.env;
 if(e.provisioned){$('#provLogWrap').innerHTML='<div class="console" role="log" aria-live="polite"><span class="lg">— session resumed: the blueprint was provisioned in a previous session. Re-run provision any time to print a fresh log. —</span></div>';renderMap(true)}
 else{$('#provLogWrap').innerHTML='<div class="emptystate">No provisioning run yet. Configure the Draft sheets, then run provision here — the log it prints is your evidence.</div>'}
 if(e.testsRun)runTestsQuiet();}
function runTestsQuiet(){var ts=testsCompute(),n=ts.filter(function(t){return t.ok}).length;
 $('#testList').innerHTML=ts.map(function(t){return '<div class="testrow '+(t.ok?'ok':'bad')+'"><span class="tmark">'+(t.ok?icon('check',15):icon('x',15))+'</span><span><span class="tt">'+t.id+' · '+t.t+'</span> — <span class="td">'+t.d+'</span>'+(t.ok?'':'<div class="tfix">Fix: '+t.fix+'</div>')+'</span></div>'}).join('');
 $('#testState').textContent=n+'/5 passed'+(n===5?' — Go for launch.':' — fix the flagged blueprint and re-run.')}
