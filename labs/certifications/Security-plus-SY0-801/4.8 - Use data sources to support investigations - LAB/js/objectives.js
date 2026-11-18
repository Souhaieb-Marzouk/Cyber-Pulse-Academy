"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · objectives.js
Objective engine: shell/hints/CHECK RESULTS flow and the validation rules
for every objective in both modes, plus the SIEM query model helpers.
   ====================================================== */
const ALL_SHEETS=LOCKER_LOGS.concat(LOCKER_SRC,ARTIFACTS);
const PILLARS={P1:"Understand",P2:"Recognize & analyze",P3:"Detect",P4:"Mitigate / readiness"};
function shuffleIdx(n,ui,field){if(!ui[field]){const a=[];for(let i=0;i<n;i++)a.push(i);
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}ui[field]=a}return ui[field]}

function feedbackNode(st){if(!st.lastMsg)return null;
 return h("div",{class:"feedback "+(st.lastOk?"ok":"no"),"role":"status"},h("p",{},st.lastMsg))}
function objShell(o,inner){
 const st=getO(o.id);
 const isHard=S.mode==="hard";
 const hintBtn=h("button",{class:"btn",onclick:()=>useHint(o.id)},
   isHard?"Use the one nudge (costs score)":"Reveal hint "+((S.ui[o.id]&&S.ui[o.id].hintLevel||0)+1)+" of 3");
 return h("article",{class:"sheet",tabindex:"-1"},
  h("h2",{},o.id+" — "+o.title),
  h("div",{class:"meta"},h("span",{class:"tag pillar"},o.pillar+" · "+PILLARS[o.pillar]),
    h("span",{class:"tag state"},st.done?"VALIDATED":"to do"),
    h("span",{class:"tag"},"checks: "+st.attempts+(st.attempts===1?" pass":st.attempts===0?" passed":" passes")),
    h("span",{class:"tag"},"hints used: "+st.hints)),
  h("p",{class:"lead",style:"white-space:pre-line"},o.prompt),
  inner,
  h("div",{class:"obj-actions"},
    hintBtn,
    h("button",{class:"btn primary",onclick:()=>checkObj(o.id)},"CHECK RESULTS")),
  h("div",{id:"hintbox-"+o.id,class:"hintbox",hidden:true}),
  feedbackNode(st))}
function useHint(id){
 const o=objById(id),st=getO(id),ui=getUI(id,{});
 const lvl=ui.hintLevel||0;
 const max=S.mode==="hard"?1:3;
 if(lvl>=max)return;
 st.hints++;ui.hintLevel=lvl+1;save();
 const box=document.getElementById("hintbox-"+id);
 box.hidden=false;box.textContent="Hint "+(lvl+1)+": "+o.hints[Math.min(lvl,o.hints.length-1)];
 announce("Hint revealed.");renderBoard()}
function checkObj(id){
 const o=objById(id),st=getO(id);
 const res=validateObj(o);
 st.lastOk=res.ok;st.lastMsg=res.msg;st.checked=true;
 if(res.ok){if(!st.done){st.done=true;st.firstTry=st.attempts===0;st.attempts++;
   announce(o.id+" validated. "+o.title);}
  st.done=true}
 else{st.attempts++;st.firstTry=false;announce(o.id+" check failed.")}
 save();renderBoard();updateMeter();
 openCard("obj",id)}

/* --- validators --- */
function normTxt(s){return String(s||"").trim().toLowerCase().replace(/^["']|["']$/g,"")}
function validateObj(o){
 const st=getO(o.id),ui=getUI(o.id,{});
 switch(o.ui){
 case "match":{const pairs=ui.pairs||{};
  const allDone=o.data.pairs.every((p,i)=>pairs[i]!=null);
  if(!allDone)return{ok:false,msg:"Not every label is paired yet. Pair all "+o.data.pairs.length+" before checking."};
  const wrong=o.data.pairs.findIndex((p,i)=>normTxt(o.data.pairs[i][1])!==normTxt(o.data.pairs[pairs[i]][1]));
  if(wrong>=0)return{ok:false,msg:"One or more pairings are off — pair "+(wrong+1)+" ('"+o.data.pairs[wrong][0]+"') is not matched to its true description. Re-read the sheet lead lines, then unpair (click a paired chip) and retry."};
  return{ok:true,msg:o.fb}}
 case "order":{const pl=ui.placed||[];
  if(pl.length<o.data.events.length)return{ok:false,msg:"The rope has empty slots — place all "+o.data.events.length+" events first."};
  const okOrder=o.data.events.every((e,i)=>pl[i]===e[0]);
  if(!okOrder){const firstWrong=o.data.events.findIndex((e,i)=>pl[i]!==e[0]);
   return{ok:false,msg:"Slot "+(firstWrong+1)+" holds the wrong event — a later event is sitting earlier (or vice versa). Cross-check the timestamps on the source sheets; near-misses rejected."}}
  return{ok:true,msg:o.fb}}
 case "fields":{const vals=ui.vals||{};
  for(const f of o.data.fields){
   const v=String(vals[f.key]||"").trim();
   if(!v)return{ok:false,msg:"Field '"+f.label+"' is empty."};
   if(f.accept==="reqs"){
    const toks=v.toLowerCase().split(/[\s,;]+/).filter(Boolean).sort();
    const want=["req-8841","req-8842","req-8843"];
    if(toks.join(",")!==want.join(","))return{ok:false,msg:"The request-ID list is not the three bulk reads. Pull them from the API transactions sheet (status=200, records=10000)."}
   }else if(!f.accept.test(v))return{ok:false,msg:"'"+v+"' is not the value for '"+f.label+"'. Near-misses are rejected — go back to the sheet and read the exact record."}}
  return{ok:true,msg:o.fb}}
 case "multi":{const sel=new Set(ui.sel||[]);
  const want=new Set(o.data.ans);
  const missing=[...want].filter(k=>!sel.has(k)),extra=[...sel].filter(k=>!want.has(k));
  if(missing.length||extra.length)return{ok:false,msg:"Selection is off."+(missing.length?" Missing: "+missing.map(k=>(o.data.items.find(it=>it[0]===k)||["",""])[1]).join("; "):"")+(extra.length?" Should NOT be selected: "+extra.map(k=>(o.data.items.find(it=>it[0]===k)||["",""])[1]).join("; "):"")};
  if(o.data.field){const v=String((ui.fvalue||"")).trim();
   if(!o.data.field.accept.test(v))return{ok:false,msg:"Retention answer '"+v+"' is not right. Count from record time: purge day = record date + retention. (Medium accepts 19–21; the exact figure is "+o.data.field.exact+".)"}}
  return{ok:true,msg:o.fb}}
 case "triage":{const cls=ui.cls||{},rs=ui.reason||{};
  for(const a of o.data.alerts){
   const c=cls[a[0]];
   if(!c)return{ok:false,msg:"Alert "+a[0]+" has no verdict yet."};
   if(c!==a[2])return{ok:false,msg:"Alert "+a[0]+" verdict is wrong. Cross-reference: the scanner schedule (vuln sheet), the change ticket (automated reports), and the attacker IP's history."};
   if(o.data.reasons){const r=rs[a[0]];
    if(!r)return{ok:false,msg:"Alert "+a[0]+" needs a reason code — a verdict without a reason is an opinion."};
    if(normTxt(r)!==normTxt(a[3]))return{ok:false,msg:"Reason code for "+a[0]+" does not match the evidence trail. Pick the code the other sheets actually support."}}}
  return{ok:true,msg:o.fb}}
 case "sel4":{const picks=ui.picks||[];
  for(let i=0;i<o.data.qs.length;i++){const p=picks[i];
   if(p==null)return{ok:false,msg:"Question "+(i+1)+" is unanswered."};
   if(p!==o.data.qs[i].ans)return{ok:false,msg:"Question "+(i+1)+" — '"+o.data.qs[i].opts[p]+"' is not the most appropriate source. Keywords decide it: content / volume / per-request facts / weaknesses."}}
  return{ok:true,msg:o.fb}}
 case "query":{const clauses=ui.clauses||[];
  for(const m of o.data.must){
   const hit=clauses.some(c=>c&&c.f===m.f&&c.op==="equals"&&normTxt(c.v)===normTxt(m.v));
   if(!hit)return{ok:false,msg:"The query must include the clause "+m.f+" equals "+m.v+" — build it on the bench, run it, then check."}}
  const n=runQuery(clauses).length;
  if(String(ui.count||"").trim()!==String(o.data.count))
   return{ok:false,msg:"Row count mismatch: your query as built returns "+n+" row(s), you entered '"+(ui.count||"nothing")+"'. "+(n<o.data.count?"Over-filtering hides rows — drop clauses and go breadth-first.":"Check the result table again.")}
  return{ok:true,msg:o.fb}}
 case "sweep":{const unset=ALL_SHEETS.filter(id=>!S.stamps[id]);
  if(unset.length)return{ok:false,msg:"Not every sheet is stamped yet ("+unset.length+" left). Open each locker card and stamp it."};
  const inc=ALL_SHEETS.filter(id=>S.stamps[id]==="inc").sort();
  const want=o.data.include.slice().sort();
  const extra=inc.filter(id=>!want.includes(id)),missing=want.filter(id=>!inc.includes(id));
  if(extra.length||missing.length)return{ok:false,msg:"The case file is off."+(missing.length?" Missing direct evidence: "+missing.map(id=>SHEETS[id].title).join("; ")+".":"")+(extra.length?" These are context/tooling/negative evidence, not direct attacker actions: "+extra.map(id=>SHEETS[id].title).join("; ")+".":"")}
  return{ok:true,msg:o.fb}}
 case "srcfield":{const rows=ui.rows||[];
  for(let i=0;i<o.data.qs.length;i++){const q=o.data.qs[i],r=rows[i]||{};
   if(!r.src)return{ok:false,msg:"Question "+(i+1)+": pick a source."};
   if(r.src!==q.src)return{ok:false,msg:"Question "+(i+1)+": '"+r.src+"' is not the best source for that question — pick the one whose records actually contain the fact."};
   const f=normTxt(r.field);
   if(!f)return{ok:false,msg:"Question "+(i+1)+": type the exact field name."};
   if(!q.field.map(normTxt).includes(f))return{ok:false,msg:"Question "+(i+1)+": '"+r.field+"' is not a field on that sheet. Exact field names only — read the table header or the raw line."}}
  return{ok:true,msg:o.fb}}
 case "acq":{const pl=ui.acqOrder||[];
  if(pl.length<o.data.order.length)return{ok:false,msg:"Order both acquisitions first."};
  if(!(pl[0]==="mem"&&pl[1]==="disk"))return{ok:false,msg:"Acquisition order is wrong. Ask: what is destroyed the moment the machine powers off? Near-misses rejected."};
  if(ui.why==null||Number(ui.why)!==o.data.whyq.ans)return{ok:false,msg:"The principle is wrong — pick the one about volatility, not convenience."};
  if(ui.bad!==o.data.bad)return{ok:false,msg:"The unverifiable file choice is wrong. Compare the Hash tool's output with the manifest — one file never had a hash recorded."};
  if(!ui.computed||ui.computed.file!==o.data.bad)return{ok:false,msg:"Run the Hash tool on the problem file before concluding — the tool is right there on the desk."};
  return{ok:true,msg:o.fb}}
 case "verdict":{const sel=new Set(ui.sel||[]);
  if(ui.v==null)return{ok:false,msg:"Pick a verdict first."};
  if(ui.v!==1)return{ok:false,msg:"Verdict mismatch. Compare bytes_out with the staged volume and compute the share that left."};
  const v=String(ui.bytes||"").trim();
  if(!o.data.bytesAccept.test(v))return{ok:false,msg:"Byte figure '"+v+"' is not the exact firewall bytes_out value."};
  const sv=String(ui.staged||"").trim();
  if(!o.data.stagedAccept.test(sv))return{ok:false,msg:"Staged volume should read '3 GB' — as recorded in the staging metadata."};
  const want=new Set(o.data.multi.ans);
  const extra=[...sel].filter(k=>!want.has(k)),missing=[...want].filter(k=>!sel.has(k));
  if(missing.length||extra.length)return{ok:false,msg:"Proof-source selection off. Volume has one authoritative counter; content lives in only one source. "+o.data.multi.why};
  return{ok:true,msg:o.fb}}
 case "query+multi":{const clauses=ui.clauses||[];
  for(const m of o.data.must){
   const hit=clauses.some(c=>c&&c.f===m.f&&c.op==="equals"&&normTxt(c.v)===normTxt(m.v));
   if(!hit)return{ok:false,msg:"The query needs both clauses: "+o.data.must.map(m=>m.f+" = "+m.v).join(" AND ")+"."}}
  const n=runQuery(clauses).length;
  if(String(ui.count||"").trim()!==String(o.data.count))
   return{ok:false,msg:"Row count mismatch: the query as built returns "+n+" row(s), you entered '"+(ui.count||"nothing")+"'. Read the result table."}
  const sel=new Set(ui.sel||[]);const want=new Set(o.data.multi.ans);
  const extra=[...sel].filter(k=>!want.has(k)),missing=[...want].filter(k=>!sel.has(k));
  if(missing.length||extra.length)return{ok:false,msg:"Corroboration is off. Independent = a different telemetry system counting the same bytes. "+o.data.multi.why}
  return{ok:true,msg:o.fb}}
 case "multi+field":{const sel=new Set(ui.sel||[]);
  const want=new Set(o.data.ans);
  const missing=[...want].filter(k=>!sel.has(k)),extra=[...sel].filter(k=>!want.has(k));
  if(missing.length||extra.length)return{ok:false,msg:"Selection is off."+(missing.length?" Missing: "+missing.map(k=>(o.data.items.find(it=>it[0]===k)||["",""])[1]).join("; "):"")+(extra.length?" Should NOT be selected: "+extra.map(k=>(o.data.items.find(it=>it[0]===k)||["",""])[1]).join("; "):"")};
  if(o.data.field){const v=String((ui.fvalue||"")).trim();
   if(!o.data.field.accept.test(v))return{ok:false,msg:"Retention answer '"+v+"' is not right. Count from record time: purge day = record date + retention. (Tolerance 19–21; the exact figure is "+o.data.field.exact+".)"}}
  return{ok:true,msg:o.fb}}
 }
 return{ok:false,msg:"Unknown objective type."}}

/* --- UI builders --- */
const SIEM_FIELDS=["ts","host","source","user","src_ip","action","event"];
const SF_LABEL={ts:"time",host:"host",source:"source",user:"user",src_ip:"src_ip",action:"action",event:"event"};
function fieldVals(f){return [...new Set(SIEM_ROWS.map(r=>r[f]))].sort()}
function runQuery(clauses){return SIEM_ROWS.filter(r=>(clauses||[]).every(c=>{
 if(!c||!c.f||!c.v)return true;const cell=String(r[c.f]||"");
 if(c.op==="equals")return cell===c.v;
 if(c.op==="not equals")return cell!==c.v;
 return cell.toLowerCase().includes(String(c.v).toLowerCase())}))}
