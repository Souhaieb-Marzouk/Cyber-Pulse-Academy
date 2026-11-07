'use strict';
/* ui.js — rendering and interaction: DOM helpers, live-region announcer,
// artifact composers, section builder, the six exercise widgets, the
// check/hint engine, stage / ledger / seal rendering, navigation and the
// completion modal (score, stars, focus areas, certificate).
 */
const $=(s,el)=>(el||document).querySelector(s);
const $$=(s,el)=>Array.prototype.slice.call((el||document).querySelectorAll(s));
let live=null;
function say(m){if(!live)return;live.textContent='';window.setTimeout(function(){live.textContent=m;},40);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function emailsArt(){let s='';ART.emails.forEach(function(em){s+='FROM    '+em.from+'\nSUBJ    '+em.subj+'\n\n  '+em.body+'\n\n--------------------------------------------------------------\n\n';});return art('emails','mail','Intake inbox — three requests (synthetic)','<pre>'+esc(s)+'</pre>');}
function memoArt(){return art('memo','mail','Internal memo — D. Okafor, CFO','<pre>'+
'TO        GRC team (new analyst: welcome)\n'+
'FROM      D. Okafor, CFO, StratusPay\n'+
'DATE      2025-10-06\n\n'+
'Checkout runs on CumuloCloud for ~40 merchants; we store, process and\n'+
'transmit account data, so we carry PCI DSS obligations as a service\n'+
'provider. This quarter, three engagements land at once:\n\n'+
'  1. PCI DSS   — First Meridian Bank: AOC (ROC by QSA) due Nov 15\n'+
'  2. SOC 2     — Grandview Retail vendor review: Type II requested\n'+
'  3. ISO 27001 — Helvetia CB: Stage 1 on Nov 4, Stage 2 on Nov 25\n\n'+
'I want us walking in with evidence, not apologies. The room is yours.\n'+
'  — D.O.</pre>');}

/* ---------- section content ---------- */
function SECT(id){
 if(id==='briefing'){return '<p class="kicker">Engagement briefing · Q3 audit season</p><h2>'+ic('mail')+'Three audits land on one desk</h2>'+
  memoArt()+
  '<div class="noteblocks">'+
  '<div class="noteblock"><h4>'+ic('archive')+'The evidence desk</h4><ul><li>Every folder holds <b>artifacts</b> — configs, logs, reports, emails — all synthetic training data.</li><li>In Medium mode, objectives carry <b>Look</b> pointers; in Hard mode you hunt.</li></ul></div>'+
  '<div class="noteblock"><h4>'+ic('listchecks')+'The findings ledger</h4><ul><li>Right side: every objective with a <b>Check results</b> stamp.</li><li>Progress seal fills as the ledger stamps.</li></ul></div>'+
  '<div class="noteblock"><h4>'+ic('stamp')+'How verdicts work</h4><ul><li>Stamps, matches, orderings and picks all autosave.</li><li>Medium: 3-tier hints. Hard: one nudge, and it costs stars.</li></ul></div>'+
  '</div>'+
  '<div class="callout">Everything here is <b>fictional training data</b> — StratusPay, CumuloCloud, every host, person and finding. The frameworks, though, are real and exam-accurate for Cloud+ CV0-004 Lesson 4.4.</div>'+
  '<div class="mount" data-obj="OBJ-M1"></div><div class="mount" data-obj="OBJ-M10"></div><div class="mount" data-obj="OBJ-H9"></div>';}
 if(id==='pci'){return '<p class="kicker">Case folder · PCI DSS v4.x</p><h2>'+ic('card')+'The payment assessment</h2>'+
  '<p>StratusPay stores, processes and transmits account data on CumuloCloud — a <b>PCI service provider</b>. The bank wants the AOC by Nov 15, produced from a ROC by a QSA, backed by quarterly ASV scans. The evidence for scoping and gap analysis lives on this desk.</p>'+
  '<div class="callout green"><b>Scope rule:</b> the CDE is data <i>and</i> connectivity. Anything with a route into cardholder-data systems stays in scope until isolation is proven by testing.</div>'+
  art('assets',ART.assets.icon,ART.assets.title,'<pre>'+esc(ART.assets.pre)+'</pre>')+
  art('rules',ART.rules.icon,ART.rules.title,'<pre>'+esc(ART.rules.pre)+'</pre>')+
  art('storage',ART.storage.icon,ART.storage.title,'<pre>'+esc(ART.storage.pre)+'</pre>')+
  art('vaultlog',ART.vaultlog.icon,ART.vaultlog.title,'<pre>'+esc(ART.vaultlog.pre)+'</pre>')+
  art('access',ART.access.icon,ART.access.title,'<pre>'+esc(ART.access.pre)+'</pre>')+
  art('asv',ART.asv.icon,ART.asv.title,'<pre>'+esc(ART.asv.pre)+'</pre>')+
  '<div class="mount" data-obj="OBJ-M4"></div><div class="mount" data-obj="OBJ-M5"></div><div class="mount" data-obj="OBJ-M8"></div><div class="mount" data-obj="OBJ-M9"></div><div class="mount" data-obj="OBJ-M11"></div><div class="mount" data-obj="OBJ-H1"></div><div class="mount" data-obj="OBJ-H2"></div><div class="mount" data-obj="OBJ-H5"></div><div class="mount" data-obj="OBJ-H8"></div>';}
 if(id==='soc2'){return '<p class="kicker">Case folder · SOC 2</p><h2>'+ic('file')+'The customer attestation</h2>'+
  '<p>Grandview Retail\u2019s auditors want proof your controls <b>operated</b> over the past 12 months — SOC 2 Type II language. On this desk: the intake inbox, StratusPay\u2019s own report, the CSP\u2019s report, and the bridge letter that covers everything after a period ends.</p>'+
  '<div class="callout green"><b>Vocabulary guard:</b> SOC 2 is an <b>attestation</b> by a CPA firm — nobody is \u201cSOC 2 certified\u201d. Security criteria are mandatory; the rest ride along as committed.</div>'+
  emailsArt()+
  art('spsoc2',ART.spsoc2.icon,ART.spsoc2.title,'<pre>'+esc(ART.spsoc2.pre)+'</pre>')+
  art('cspsoc2',ART.cspsoc2.icon,ART.cspsoc2.title,'<pre>'+esc(ART.cspsoc2.pre)+'</pre>')+
  art('bridge',ART.bridge.icon,ART.bridge.title,'<pre>'+esc(ART.bridge.pre)+'</pre>')+
  '<div class="mount" data-obj="OBJ-M2"></div><div class="mount" data-obj="OBJ-M6"></div><div class="mount" data-obj="OBJ-M7"></div><div class="mount" data-obj="OBJ-M12"></div><div class="mount" data-obj="OBJ-H3"></div><div class="mount" data-obj="OBJ-H6"></div>';}
 if(id==='iso'){return '<p class="kicker">Case folder · ISO/IEC 27001:2022</p><h2>'+ic('badge')+'The certification audit</h2>'+
  '<p>Helvetia (an accredited certification body) runs <b>Stage 1</b> on Nov 4 and <b>Stage 2</b> on Nov 25. What they certify is the <b>ISMS</b> — clauses 4–10 — sampled against the <b>93 Annex A controls</b> listed in your Statement of Applicability.</p>'+
  '<div class="callout"><b>Certificate mechanics:</b> 3-year cycle, annual surveillance audits, major nonconformities block certification, minors ride corrective action plans.</div>'+
  art('soa',ART.soa.icon,ART.soa.title,'<pre>'+esc(ART.soa.pre)+'</pre>')+
  art('internal',ART.internal.icon,ART.internal.title,'<pre>'+esc(ART.internal.pre)+'</pre>')+
  '<div class="mount" data-obj="OBJ-M3"></div><div class="mount" data-obj="OBJ-H4"></div><div class="mount" data-obj="OBJ-H7"></div>';}
 if(id==='evidence'){return '<p class="kicker">Records hall · complete index</p><h2>'+ic('archive')+'Evidence index</h2>'+
  '<p>Every artifact in the room, including the material that <b>should not</b> be filed to any of the three audits. Click a card to jump to the artifact.</p>'+
  '<div class="evindex">'+EVLIST.map(function(e){return '<button type="button" class="evcard" data-art="'+e.id+'">'+ic(ART[e.id]&&ART[e.id].icon?ART[e.id].icon:'file')+'<span><b>'+e.t+'</b><small>'+e.s+'</small></span></button>';}).join('')+'</div>'+
  '<hr class="rule"><p class="kicker">Unrelated material — filed for reference only</p>'+
  art('hipaa',ART.hipaa.icon,ART.hipaa.title,'<pre>'+esc(ART.hipaa.pre)+'</pre>')+
  art('soc2023',ART.soc2023.icon,ART.soc2023.title,'<pre>'+esc(ART.soc2023.pre)+'</pre>')+
  art('pentest',ART.pentest.icon,ART.pentest.title,'<pre>'+esc(ART.pentest.pre)+'</pre>');}
 if(id==='quiz'){return '<p class="kicker">Knowledge check · '+QUIZ[S.mode].length+' questions · explanation after each answer</p><h2>'+ic('cap')+'Oral examination</h2>'+
  '<p>Answer each card — the explanation appears immediately. Your latest pass counts toward the certificate.</p><div id="quizcards">'+quizCards()+'</div><div class="quizfoot" id="quizfoot">'+quizFoot()+'</div>';}
 if(id==='notes'){return '<p class="kicker">Field notes · debrief</p><h2>'+ic('book')+'What this season taught the room</h2>'+
  '<div class="noteblocks">'+
  '<div class="noteblock"><h4>'+ic('eye')+'Detection opportunities</h4><ul>'+
  '<li><b>Logging on the logging itself</b> — alert when audit logging or its forwarding is disabled (the E1 gap was caught by a config-diff sweep).</li>'+
  '<li><b>Firewall rule review</b> — every new allow-rule into the CDE needs a business-need ticket and an expiry; \u201ctemporary\u201d rules from 2024 are exactly what assessors sample.</li>'+
  '<li><b>Scan deltas</b> — quarterly ASV scans only count when scope matches the current estate.</li>'+
  '<li><b>Review exceptions</b> — an access review is a detector: k.osei\u2019s pending MFA was found there, not by a scanner.</li>'+
  '<li><b>Evidence freshness</b> — a period-end calendar for CSP reports, bridge letters and your own report cycle.</li></ul></div>'+
  '<div class="noteblock"><h4>'+ic('wrench')+'Mitigation map (with IDs)</h4><ul>'+
  '<li><b>PCI Req 1</b> least-privilege network controls — kill R2/R4-class rules; <b>Req 3</b> encrypt/tokenize stored data; <b>Req 8</b> MFA into the CDE; <b>Req 10</b> log &amp; monitor all access; <b>Req 11</b> quarterly ASV + segmentation testing; <b>Req 12</b> policy &amp; targeted risk analysis.</li>'+
  '<li><b>ISO 27001:2022</b> — A.5.9 asset inventory, A.8.15 logging, A.8.24 cryptography, A.8.32 change management, clause 9.3 management review.</li>'+
  '<li><b>SOC 2 (TSC)</b> — CC6 logical &amp; physical access, CC7 operations &amp; monitoring, CC8 change management.</li></ul></div>'+
  '<div class="noteblock"><h4>'+ic('shield')+'Blue-team takeaways</h4><ul>'+
  '<li><b>Scope = data + connectivity</b>, re-proven whenever the estate or the rules change.</li>'+
  '<li><b>Evidence has a shelf life</b> — system-generated and current, or it is decoration.</li>'+
  '<li><b>Inheritance requires reading</b> — CSP reports, CUECs, and your side of the split.</li>'+
  '<li><b>Fix, then verify</b> — a remediation without a verification artifact is a claim.</li>'+
  '<li><b>Sequence</b> — majors first, evidence for working controls, internal audit before the external one.</li></ul></div>'+
  '<div class="noteblock"><h4>'+ic('alert')+'Red-team mindset (defensive use)</h4><ul>'+
  '<li>Attackers love the <b>silent vault</b> — a system whose logging was \u201ctemporarily\u201d disabled during troubleshooting.</li>'+
  '<li><b>Stale allow-rules</b> are standing doors: R2 and R4 survived because nobody re-asked \u201cwhy does this exist?\u201d</li>'+
  '<li><b>Shared-responsibility gaps</b> — both sides assume the other patched the guest.</li>'+
  '<li><b>Checkbox compliance</b> — a 2023 report on the wall does not watch 2025 traffic.</li></ul></div>'+
  '</div>'+
  '<hr class="rule"><p class="kicker">Official references (open in a new tab)</p>'+
  '<ul style="font-size:.93rem">'+
  '<li>'+ic('ext')+' <a href="https://www.pcisecuritystandards.org/document_library/" target="_blank" rel="noopener">PCI Security Standards Council — document library (PCI DSS v4.x)</a></li>'+
  '<li>'+ic('ext')+' <a href="https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" target="_blank" rel="noopener">AICPA &amp; CIMA — SOC 2 / Trust Services Criteria</a></li>'+
  '<li>'+ic('ext')+' <a href="https://www.iso.org/standard/27001" target="_blank" rel="noopener">ISO — ISO/IEC 27001 (information security management)</a></li>'+
  '<li>'+ic('ext')+' <a href="https://www.comptia.org/certifications/cloud" target="_blank" rel="noopener">CompTIA Cloud+ (CV0-004) — official certification page</a></li>'+
  '</ul>'+
  '<div class="callout">Study note: the exam expects exactly the discriminations practiced here — who issues each framework, what artifact each produces, how scope is set, and how shared responsibility splits the evidence.</div>';}
 return '';
}

/* ---------- widgets ---------- */
function shuf(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function wAssign(box,cfg){
 let sel=null;
 const order=shuf(cfg.chips);
 function build(){
  const envObj=aget(cfg.key)||{};
  const wrap=document.createElement('div');wrap.className='matchwrap';
  wrap.innerHTML='<div class="chips" role="group" aria-label="Options">'+order.map(function(c){
   const used=Object.keys(envObj).some(function(ch){return envObj[ch]===c.id;});
   return '<button type="button" class="chipbtn'+(sel===c.id?' sel':'')+'" data-chip="'+c.id+'" aria-pressed="'+(sel===c.id)+'"'+(WLOCK?' disabled':'')+'><span><b>'+c.t+'</b><small>'+c.s+'</small></span></button>';}).join('')+'</div>'+
  '<div class="slots" role="group" aria-label="Folders">'+cfg.slots.map(function(s){
   const got=Object.keys(envObj).filter(function(ch){return envObj[ch]===s.id;});
   const labels=got.map(function(ch){const cc=cfg.chips.find(function(x){return x.id===ch;});return cc?cc.t:ch;}).join(' · ');
   return '<div class="slot'+(got.length?' filled':'')+'" data-slot="'+s.id+'" tabindex="0" role="button" aria-label="Folder: '+s.t+'"'+(WLOCK?' aria-disabled="true"':'')+'><span><b>'+s.t+'</b><small>'+(got.length?esc(labels):'select a chip, then click here')+'</small></span></div>';}).join('')+'</div>';
  wrap.addEventListener('click',function(ev){
   if(WLOCK)return;
   const cb=ev.target.closest('.chipbtn');const sl=ev.target.closest('.slot');
   if(cb){sel=(sel===cb.dataset.chip)?null:cb.dataset.chip;rerender();return;}
   if(sl){
    const envObj2=aget(cfg.key)||{};
    if(sel){const e2=Object.assign({},envObj2);e2[sel]=sl.dataset.slot;put(cfg.key,e2);say('Filed.');sel=null;rerender();}
    else{const e3=Object.assign({},envObj2);Object.keys(e3).forEach(function(ch){if(e3[ch]===sl.dataset.slot)delete e3[ch];});put(cfg.key,e3);rerender();}
   }});
  wrap.addEventListener('keydown',function(ev){
   if(ev.key!=='Enter'&&ev.key!==' ')return;
   if(WLOCK)return;
   const cb=ev.target.closest('.chipbtn');const sl=ev.target.closest('.slot');
   if(cb||sl){ev.preventDefault();ev.target.click();}});
  return wrap;
 }
 function rerender(){const n=build();box.replaceChild(n,wrap);wrap=n;}
 let wrap=build();box.appendChild(wrap);
}
function wChoice(box,cfg){
 const wrap=document.createElement('div');
 wrap.innerHTML=cfg.rows.map(function(r){
  const cur=aget(cfg.key+'.'+r.id);
  return '<fieldset style="border:0;margin:0 0 16px;padding:0"><legend style="font-weight:600;font-size:.92rem;margin-bottom:7px;padding:0">'+r.q+'</legend>'+
  '<div class="qopts">'+r.opts.map(function(o){
   return '<label class="qopt"><input type="radio" name="'+cfg.key+'.'+r.id+'" value="'+o.id+'"'+(cur===o.id?' checked':'')+(WLOCK?' disabled':'')+'><span>'+o.t+'</span></label>';}).join('')+'</div></fieldset>';}).join('');
 wrap.addEventListener('change',function(ev){if(ev.target&&ev.target.name&&ev.target.value!==undefined){putRow(cfg.key,ev.target.name.slice(cfg.key.length+1),ev.target.value);}});
 box.appendChild(wrap);
}
function wStamp(box,cfg){
 let wrap=document.createElement('div');
 function build(){
  const w=document.createElement('div');
  w.innerHTML=(cfg.legend?'<p style="font-weight:600;margin:2px 0 8px">'+cfg.legend+'</p>':'')+cfg.rows.map(function(r){
   const cur=aget(cfg.key+'.'+r.id);
   return '<div class="stamprow"><div class="who"><b>'+r.t+'</b><small>'+r.s+'</small></div>'+
   '<button type="button" class="stampbtn ok" data-row="'+r.id+'" data-v="ok" aria-pressed="'+(cur==='ok')+'"'+(WLOCK?' disabled':'')+'>'+cfg.okLabel+'</button>'+
   '<button type="button" class="stampbtn gap" data-row="'+r.id+'" data-v="gap" aria-pressed="'+(cur==='gap')+'"'+(WLOCK?' disabled':'')+'>'+cfg.gapLabel+'</button></div>';}).join('');
  w.addEventListener('click',function(ev){
   if(WLOCK)return;
   const b=ev.target.closest('.stampbtn');if(!b)return;
   const cur=aget(cfg.key+'.'+b.dataset.row);
   putRow(cfg.key,b.dataset.row,cur===b.dataset.v?null:b.dataset.v);
   say('Marked '+(b.dataset.v==='ok'?cfg.okLabel:cfg.gapLabel)+'.');
   rerender();});
  return w;
 }
 function rerender(){const n=build();box.replaceChild(n,wrap);wrap=n;}
 wrap=build();box.appendChild(wrap);
}
function wPick(box,cfg){
 const wrap=document.createElement('div');
 wrap.innerHTML=(cfg.legend?'<p style="font-weight:600;margin:2px 0 8px">'+cfg.legend+'</p>':'')+cfg.rows.map(function(r){
  const cur=(aget(cfg.key)||[]).indexOf(r.id)>=0;
  return '<div class="pickrow"><input type="checkbox" id="'+cfg.key+'--'+r.id+'" data-id="'+r.id+'"'+(cur?' checked':'')+(WLOCK?' disabled':'')+'><label for="'+cfg.key+'--'+r.id+'"><b>'+r.t+'</b><small>'+r.s+'</small></label></div>';}).join('');
 wrap.addEventListener('change',function(ev){
  if(!ev.target.matches('input[type=checkbox]'))return;
  const arr=(aget(cfg.key)||[]).slice();const i=arr.indexOf(ev.target.dataset.id);
  if(ev.target.checked&&i<0)arr.push(ev.target.dataset.id);
  if(!ev.target.checked&&i>=0)arr.splice(i,1);
  put(cfg.key,arr);});
 box.appendChild(wrap);
}
function wOrder(box,cfg){
 const def=cfg.items.map(function(i){return i.id;});
 /* shuffled starting order so the list never opens pre-solved (R6) */
 let start=def.slice();
 if(!aget(cfg.key)){let tries=0;do{start=shuf(def);tries++;}while(start.join()===def.join()&&tries<25);}
 function build(){
  const ids=aget(cfg.key)||start;
  const w=document.createElement('div');
  w.innerHTML='<ul class="orderlist">'+ids.map(function(id,idx){
   const it=cfg.items.find(function(x){return x.id===id;});
   return '<li><span class="ordnum">'+(idx+1)+'</span><span class="txt"><b>'+it.t+'</b><small>'+it.s+'</small></span><span class="mvbtns">'+
   '<button type="button" class="mv" data-i="'+idx+'" data-d="-1" aria-label="Move up"'+((idx===0||WLOCK)?' disabled':'')+'>'+ic('up')+'</button>'+
   '<button type="button" class="mv" data-i="'+idx+'" data-d="1" aria-label="Move down"'+((idx===ids.length-1||WLOCK)?' disabled':'')+'>'+ic('down')+'</button></span></li>';}).join('')+'</ul>';
  w.addEventListener('click',function(ev){
   if(WLOCK)return;
   const b=ev.target.closest('.mv');if(!b||b.disabled)return;
   const ids2=(aget(cfg.key)||def.slice()).slice();const i=parseInt(b.dataset.i,10);const d=parseInt(b.dataset.d,10);
   const tmp=ids2[i];ids2[i]=ids2[i+d];ids2[i+d]=tmp;
   put(cfg.key,ids2);say('Moved to position '+(i+d+1)+'.');rerender();});
  return w;
 }
 function rerender(){const n=build();box.replaceChild(n,wrap);wrap=n;}
 let wrap=build();box.appendChild(wrap);
}
function wMatrix(box,cfg){
 const wrap=document.createElement('div');
 wrap.innerHTML=cfg.rows.map(function(r){
  const cur=aget(cfg.key+'.'+r.id)||{};
  return '<div class="trow"><div class="who"><b>'+r.t+'</b></div>'+cfg.fields.map(function(f){
   return '<label style="display:flex;flex-direction:column;gap:2px;font-size:.72rem;font-weight:700;letter-spacing:.4px;color:var(--ink-soft)">'+f.label+
   '<select data-row="'+r.id+'" data-f="'+f.k+'"'+(WLOCK?' disabled':'')+' style="min-height:44px;border:2px solid var(--ink);border-radius:6px;background:var(--card);color:var(--ink);padding:6px 8px;font:inherit;font-weight:400">'+
   '<option value="">— choose —</option>'+f.opts.map(function(o){return '<option value="'+o.id+'"'+(cur[f.k]===o.id?' selected':'')+'>'+o.t+'</option>';}).join('')+'</select></label>';}).join('')+'</div>';}).join('');
 wrap.addEventListener('change',function(ev){
  if(!ev.target.matches('select'))return;
  const row=ev.target.dataset.row,f=ev.target.dataset.f;
  const o=Object.assign({},aget(cfg.key)||{});
  const r=Object.assign({},o[row]||{});r[f]=ev.target.value||null;o[row]=r;
  S.env[cfg.key]=o;
  put(cfg.key+'.'+row+'.'+f,ev.target.value||null);});
 box.appendChild(wrap);
}
function appendWidget(box,cfg){
 if(cfg.kind==='assign')wAssign(box,cfg);
 else if(cfg.kind==='choice')wChoice(box,cfg);
 else if(cfg.kind==='stamp')wStamp(box,cfg);
 else if(cfg.kind==='pick')wPick(box,cfg);
 else if(cfg.kind==='order')wOrder(box,cfg);
 else if(cfg.kind==='matrix')wMatrix(box,cfg);
 else if(cfg.kind==='compound')cfg.parts.forEach(function(p){appendWidget(box,p);});
}

/* ---------- objective workspace ---------- */
function hintLabel(o,c){const max=S.mode==='hard'?1:3;const used=c.hints||0;
 return S.mode==='hard'?(used?('Nudge used · costs stars'):'Nudge (costs stars)'):('Hint '+used+'/'+max);}
function objHTML(o){
 const c=S.checks[o.id]||{};
 return '<div class="ows" id="ows-'+o.id+'">'+
 '<div class="owh"><span class="num">'+o.id+'</span><h3>'+o.title+'</h3>'+
 '<span class="pillar '+o.pillar+'">'+PL[o.pillar]+'</span>'+
 '<span id="st-'+o.id+'">'+(c.done?'<span class="donebadge">'+ic('check')+' stamped</span>':'')+'</span></div>'+
 '<div class="owb"><p class="prompt">'+o.prompt+'</p>'+
 (S.mode==='medium'&&o.look?'<div style="margin-bottom:10px">'+o.look.map(function(l){
   return '<button type="button" class="look" data-go="'+(l.a||'')+'">'+ic('search')+l.t+'</button>';}).join('')+'</div>':'')+
 '<div id="wbox-'+o.id+'"></div>'+
 '<div class="owactions">'+
 '<button type="button" class="btn primary small" data-act="check" data-obj="'+o.id+'">'+ic('stamp')+'Check results</button>'+
 '<button type="button" class="btn small" data-act="hint" data-obj="'+o.id+'"'+((S.mode==='hard'&&(c.hints||0)>=1)?' disabled':'')+'>'+ic('bulb')+hintLabel(o,c)+'</button>'+
 '</div><div class="fb" id="fb-'+o.id+'" role="status"></div></div></div>';
}
function doCheck(oid){
 const o=OBJ_BY[oid];if(!o)return;
 const c=S.checks[oid]||(S.checks[oid]={attempts:0,hints:0,done:false});
 const r=o.validate(S.env);
 if(!c.done)c.attempts++;
 const fb=$('#fb-'+oid);
 if(r.ok){const first=!c.done;c.done=true;
  if(fb){fb.className='fb show good';fb.innerHTML='<b>'+ic('check')+' Stamped.</b> '+o.win;}
  c.last={cls:'fb show good',html:'<b>'+ic('check')+' Stamped.</b> '+o.win};
  say(first?('Objective stamped: '+o.title):'Objective already stamped — still correct.');
  if(first)fillMounts();
 }else{
  if(fb){fb.className='fb show bad';fb.innerHTML='<b>Not yet.</b> '+r.msg;}
  c.last={cls:'fb show bad',html:'<b>Not yet.</b> '+r.msg};
  say('Not yet: '+o.title);
 }
 save();renderLedger();renderSeal();
 const st=$('#st-'+oid);if(st)st.innerHTML=c.done?'<span class="donebadge">'+ic('check')+' stamped</span>':'';
 const hb=$('[data-act="hint"][data-obj="'+oid+'"]');if(hb&&S.mode==='hard'&&c.hints>=1)hb.disabled=true;
}
function doHint(oid){
 const o=OBJ_BY[oid];if(!o)return;
 const max=S.mode==='hard'?1:3;
 const c=S.checks[oid]||(S.checks[oid]={attempts:0,hints:0,done:false});
 if(c.hints>=max)return;
 const txt=o.hints[c.hints];c.hints++;
 const fb=$('#fb-'+oid);
 if(fb){fb.className='fb show hint';fb.innerHTML='<b>Hint '+c.hints+'/'+max+(S.mode==='hard'?' · stars reduced':'')+'.</b> '+txt;}
 c.last={cls:'fb show hint',html:'<b>Hint '+c.hints+'/'+max+'.</b> '+txt};
 save();say('Hint '+c.hints+' shown.');
 const hb=$('[data-act="hint"][data-obj="'+oid+'"]');
 if(hb){hb.innerHTML=ic('bulb')+hintLabel(o,c);if(S.mode==='hard'&&c.hints>=1)hb.disabled=true;}
}

/* ---------- rail / stage / ledger / seal ---------- */
function modeName(){return S.mode==='medium'?'Medium · Audit Prep':'Hard · Field Audit';}
function renderRail(){
 const rail=$('#rail');
 rail.innerHTML='<div class="raillabel">Case folders</div>'+TABS.map(function(t){
  return '<button type="button" class="ftab" data-tab="'+t.id+'" aria-current="'+(S.tab===t.id)+'">'+ic(t.icon)+'<span>'+t.tab+'<small>'+t.sub+'</small></span></button>';}).join('');
}
function fillMounts(){
 $$('.mount',$('#stage')).forEach(function(m){
  const o=OBJ_BY[m.dataset.obj];
  if(!o||o.mode!==S.mode){m.style.display='none';return;}
  m.style.display='';
  m.innerHTML=objHTML(o);
  const box=$('#wbox-'+o.id);
  WLOCK=!!(S.checks[o.id]||{}).done;
  if(box&&o.widget)appendWidget(box,o.widget);
  WLOCK=false;
  const c=S.checks[o.id]||{};
  if(c.last){const fb=$('#fb-'+o.id);if(fb){fb.className=c.last.cls;fb.innerHTML=c.last.html;}}
 });
}
function renderStage(){
 const st=$('#stage');
 st.innerHTML=SECT(S.tab)||'<p>Nothing filed here yet.</p>';
 if(S.tab!=='quiz')fillMounts();
}
function renderLedger(){
 const lg=$('#ledger');if(!lg)return;
 const list=OBJ.filter(function(o){return o.mode===S.mode;});
 const done=list.filter(function(o){return (S.checks[o.id]||{}).done;}).length;
 lg.innerHTML='<div class="lh"><h2>'+ic('listchecks')+'Findings ledger</h2><p>'+modeName()+' · '+list.length+' objectives · stamp them all</p></div>'+
 '<ol>'+list.map(function(o){
  const c=S.checks[o.id]||{};
  return '<li role="button" tabindex="0" class="ljmp" data-obj="'+o.id+'" aria-label="Open objective '+o.title+'">'+
  '<div class="objtop"><span class="id">'+o.id.replace('OBJ-','')+'</span><span class="t">'+o.title+'</span>'+
  '<span class="st'+(c.done?' done':'')+'" aria-hidden="true">'+(c.done?ic('check'):'')+'</span></div>'+
  '<div style="margin-top:4px"><span class="pillar '+o.pillar+'">'+PL[o.pillar]+'</span></div></li>';}).join('')+'</ol>'+
 '<div class="lfoot"><div class="pbar"><span>'+done+'/'+list.length+'</span><div class="track" role="img" aria-label="Progress '+Math.round(done/list.length*100)+' percent"><div class="fill" style="width:'+(done/list.length*100)+'%"></div></div></div>'+
 '<button type="button" class="btn primary" id="btn-cert" style="width:100%">'+ic('award')+'File engagement summary</button></div>';
}
function renderSeal(){
 const sw=$('#sealwrap');if(!sw)return;
 const list=OBJ.filter(function(o){return o.mode===S.mode;});
 const done=list.filter(function(o){return (S.checks[o.id]||{}).done;}).length;
 const pct=list.length?done/list.length:0;const C=2*Math.PI*24;
 sw.setAttribute('aria-label','Progress: '+Math.round(pct*100)+' percent');
 sw.innerHTML='<svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="24" fill="none" stroke="var(--line-d)" stroke-width="5"/><circle cx="29" cy="29" r="24" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-pct)).toFixed(1)+'"/></svg><span class="num">'+Math.round(pct*100)+'%</span>';
}
function goTab(id){
 S.tab=id;save();renderStage();renderRail();
 const main=$('#main');if(main)window.scrollTo({top:0,behavior:'smooth'});
}
function goArt(id){
 const sec=ARTSEC[id];
 if(sec&&sec!==S.tab){S.tab=sec;renderStage();renderRail();}
 const el=document.getElementById('art-'+id);
 if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');window.setTimeout(function(){el.classList.remove('flash');},1900);}
}
function goLook(a){
 if(!a){goTab('evidence');return;}
 if(a.indexOf('m-')===0){openSheet('#manual-overlay');const el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return;}
 goArt(a);
}

/* ---------- quiz ---------- */
function focusAreas(m){
 const list=OBJ.filter(function(o){return o.mode===S.mode;});
 const out=[];
 const weakP=['u','r','d','m'].filter(function(p){
  const l=list.filter(function(o){return o.pillar===p;});
  const d=l.filter(function(o){return (S.checks[o.id]||{}).done;}).length;
  return d<l.length;});
 weakP.forEach(function(p){
  const l=list.filter(function(o){return o.pillar===p&&!((S.checks[o.id]||{}).done);});
  out.push('<b>'+PL[p]+' pillar incomplete</b> — still open: '+l.map(function(o){return o.id.replace('OBJ-','')+' ('+o.title+')';}).join(', ')+'.');});
 list.forEach(function(o){
  const c=S.checks[o.id]||{};
  if(c.done&&(c.attempts||0)>1)out.push('<b>'+o.id.replace('OBJ-','')+' · '+o.title+'</b> took '+c.attempts+' checks — rework the matching Manual section ('+({u:'§1–4',r:'§2–3 & §7',d:'§6',m:'§5–6'})[o.pillar]+') until you can explain the verdict aloud.');});
 const hinted=list.filter(function(o){return (S.checks[o.id]||{}).hints>0;});
 if(hinted.length)out.push((S.mode==='hard'?'A nudge was used on ':'Hints were used on ')+hinted.map(function(o){return o.id.replace('OBJ-','');}).join(', ')+' — '+(S.mode==='hard'?'Field Audit standard is zero nudges; re-run those cold.':'aim to solve the next run unaided.'));
 const qs=QUIZ[S.mode];
 const un=qs.filter(function(q){return !S.quiz.locked[q.id];});
 if(un.length)out.push('<b>Knowledge check</b>: '+un.length+' question'+(un.length>1?'s':'')+' still unanswered on the Oral exam desk.');
 qs.forEach(function(q){
  if(S.quiz.locked[q.id]&&S.quiz.ans[q.id]!==q.a)out.push('<b>Knowledge check · '+q.topic+'</b> — answered wrong. Re-read that card\u2019s explanation, then state the rule back in one sentence without looking.');});
 if(!out.length)return '<p class="mini" style="text-align:left;margin:.4em 0 0">No weak areas detected: every objective stamped first try, no hints, and a clean knowledge check. Stretch goal: run the other mode cold and compare.</p>';
 return '<ul style="text-align:left;padding-left:1.2em;margin:.4em 0 0">'+out.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
}
function openCert(){
 const m=scoring();
 const stars=[1,2,3,4,5].map(function(i){return '<span class="star'+(i<=m.stars?'':' off')+'">'+ic('star')+'</span>';}).join('');
 const recap=['u','r','d','m'].map(function(p){
  const l=OBJ.filter(function(o){return o.mode===S.mode&&o.pillar===p;});
  const d=l.filter(function(o){return (S.checks[o.id]||{}).done;}).length;
  return '<span class="pr">'+PL[p]+': '+d+'/'+l.length+'</span>';}).join('');
 $('#certbody').innerHTML='<div class="cert"><span class="wax">'+ic('badge')+'</span>'+
 '<p class="kicker" style="font:700 .74rem var(--mono);letter-spacing:1.6px;text-transform:uppercase;color:var(--brass)">StratusPay Evidence Room · training record</p>'+
 '<h2>Engagement summary</h2>'+
 '<p>'+modeName()+' · Objectives: '+m.done+'/'+m.total+' stamped · Knowledge check: '+m.corr+'/'+m.qs+'</p>'+
 '<div class="sealrow" role="img" aria-label="'+m.stars+' of 5 stars">'+stars+'</div>'+
 '<p class="qscore" style="font-size:1.3rem">Score '+m.score+' / 100</p>'+
 '<div class="pillrecap">'+recap+'</div>'+
 '<div class="next" style="margin-top:10px"><b>Focus areas — from this run\u2019s evidence</b>'+focusAreas(m)+'</div>'+
 (m.complete?'':'<p class="mini" style="margin-bottom:8px">Provisional — stamp every objective to finalize the record.</p>')+
 '<div class="next"><b>Where to next</b><ul style="padding-left:1.2em;margin:.4em 0 0">'+
 '<li>Explain the three frameworks aloud: issuer → artifact → validation cycle (PCI: AOC/ROC · SOC 2: CPA attestation · ISO: accredited certificate).</li>'+
 '<li>Re-walk a real CDE: inventory + rules + data flow — scope is a living fact, not a document.</li>'+
 '<li>Read a real SOC 2 report\u2019s exceptions and CUECs; skim an ISO Statement of Applicability.</li>'+
 '<li>Next Cloud+ stop: Domain 4.0 Security — vulnerability management and security controls.</li>'+
 '</ul></div></div>';
 openSheet('#cert-overlay');
}

/* ---------- sheets ---------- */
let lastFocus=null;
function openSheet(sel){
 const ov=$(sel);if(!ov)return;
 lastFocus=document.activeElement;
 ov.classList.add('show');
 const b=$('.btn',ov);if(b)b.focus();
}
function closeSheet(sel){
 const ov=$(sel);if(!ov)return;
 ov.classList.remove('show');
 if(lastFocus&&lastFocus.focus)lastFocus.focus();
}

/* ---------- render all / init ---------- */
function renderAll(){
 const ms=$('#modeselect'),desk=$('#desk');
 const chip=$('#modechip-label');
 if(!S.mode){ms.hidden=false;desk.hidden=true;chip.textContent='No mode';return;}
 ms.hidden=true;desk.hidden=false;
 chip.textContent=modeName();
 renderRail();renderStage();renderLedger();renderSeal();
}
