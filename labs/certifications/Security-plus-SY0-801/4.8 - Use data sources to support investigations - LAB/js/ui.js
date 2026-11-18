"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · ui.js
Rendering: DOM helper, case board, evidence sheets, objective panels,
SIEM bench, field notes, completion modal, glossary/reset modals, meter.
   ====================================================== */
function h(tag,attrs,...kids){const e=document.createElement(tag);
 for(const k in (attrs||{})){const v=attrs[k];
  if(k==="class")e.className=v; else if(k==="html")e.innerHTML=v;
  else if(k.slice(0,2)==="on")e.addEventListener(k.slice(2),v);
  else if(v!==false&&v!=null)e.setAttribute(k,v)}
 for(const kid of kids.flat(9)){if(kid==null||kid===false)continue;
  e.append(kid.nodeType?kid:document.createTextNode(String(kid)))}
 return e}
const $=s=>document.querySelector(s);
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

/* ---- block renderer ---- */
function renderBlocks(blocks){return blocks.map(b=>{
 if(b.t==="table"){return h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},b.head.map(x=>h("th",{},x)))),
   h("tbody",{},b.rows.map(r=>h("tr",{},r.map(c=>h("td",{},c)))))))}
 if(b.t==="pre"){return h("pre",{class:"raw"},b.text.join("\n"))}
 if(b.t==="callout"){return h("div",{class:"callout"+(b.gap?" gap":"")},b.text)}
 if(b.t==="doc"){return h("div",{class:"doc"},h("h4",{},b.h),renderBlocks(b.blocks))}
 return h("div")})}

/* ---- board ---- */
function clusterCards(){
 const c=[{title:"Start here",cards:[["sheet","briefing","Case briefing — the scenario"],["sheet","primer","Case primer — knowledge core"],["glossary","glossary","Glossary of terms"]]}];
 c.push({title:"Evidence locker · log data",cards:LOCKER_LOGS.map(id=>["sheet",id,SHEETS[id].title])});
 c.push({title:"Evidence locker · data sources",cards:LOCKER_SRC.map(id=>["sheet",id,SHEETS[id].title])});
 c.push({title:"Artifacts & records",cards:ARTIFACTS.map(id=>["sheet",id,SHEETS[id].title])});
 const byCluster={};curObj().forEach(o=>{(byCluster[o.cluster]=byCluster[o.cluster]||[]).push(o)});
 const order=["Understand the locker","Reconstruction desk","Cold-case desk","Query & triage bench","Evidence handling room"];
 order.forEach(cl=>{if(byCluster[cl])c.push({title:cl+(S.mode==="hard"?" · cold case":""),cards:byCluster[cl].map(o=>["obj",o.id,o.id+" — "+o.title])})});
 c.push({title:"Case review",cards:[["quiz","quiz","Knowledge check ("+(S.mode==="medium"?"6 concept questions":"7 scenario items")+")"],["notes","notes","Field notes — debrief"],["close","close","Close the case — completion & stars"]]});
 return c}
function cardStatus(kind,id){
 if(kind==="obj"){const st=getO(id).done;return st?["DONE","done"]:["TO CHECK","todo"]}
 if(kind==="sheet"&&S.mode==="medium"){const st=S.stamps[id];
  return st==="inc"?["INCLUDED","done"]:st==="dis"?["DISMISSED","dismiss"]:null}
 if(kind==="quiz"){return S.quiz.done?[S.quiz.correct+" / "+(S.mode==="medium"?6:7),"done"]:null}
 if(kind==="notes"){return S.seen.notes?["READ","done"]:null}
 return null}
function renderBoard(){
 const b=$("#board");b.textContent="";
 clusterCards().forEach(cl=>{
  const sec=h("section",{class:"cluster"},h("h2",{},cl.title));
  cl.cards.forEach(([kind,id,label])=>{
   const st=cardStatus(kind,id);
   const card=h("button",{class:"card",onclick:()=>openCard(kind,id)},
     h("span",{class:"cbadge"},kind==="obj"?"objective":kind==="sheet"?SHEETS[id]?SHEETS[id].tag:"tool":kind),
     h("h3",{},label),
     st?h("span",{class:"cstamp stamp "+st[1]},st[0]):null);
   sec.append(card)});
  b.append(sec)})}

/* ---- desk ---- */
function openCard(kind,id){
 if(kind==="glossary"){return openGlossary()}
 const body=$("#deskBody");body.textContent="";
 if(kind==="sheet")body.append(renderSheet(id));
 else if(kind==="obj")body.append(renderObj(id));
 else if(kind==="quiz")body.append(renderQuiz());
 else if(kind==="notes"){S.seen.notes=true;body.append(renderNotes())}
 else if(kind==="close")body.append(renderClose());
 if(S.mode==="medium")renderRibbon();
 document.body.classList.add("desk-open");
 $("#desk").scrollTop=0;$("#desk").focus({preventScroll:true});
 renderBoard();save()}
$("#backBtn")&&($("#backBtn").onclick=()=>{document.body.classList.remove("desk-open")});

function stampButtons(id){
 if(S.mode!=="medium")return null;
 const st=S.stamps[id];
 return h("div",{class:"stampbtns"},
  h("button",{class:"stampbtn inc"+(st==="inc"?" active-inc":""),onclick:()=>setStamp(id,"inc")},"INCLUDE IN CASE"),
  h("button",{class:"stampbtn dis"+(st==="dis"?" active-dis":""),onclick:()=>setStamp(id,"dis")},"DISMISS"),
  h("span",{class:"sr-only",role:"status"},""))}
function setStamp(id,val){
 if(S.mode==="medium"&&getO("OBJ-M3").done){announce("Evidence sweep validated — stamps are locked.");return}
 if(S.stamps[id]===val)delete S.stamps[id];else S.stamps[id]=val;
 announce((S.stamps[id]==="inc"?"Included in case: ":"Dismissed: ")+(SHEETS[id]?SHEETS[id].title:id));
 renderBoard();save();
 const body=$("#deskBody");const cur=body.querySelector(".sheet");if(cur){openCard("sheet",id)}}

function renderSheet(id){
 const sh=SHEETS[id];if(!sh)return h("div",{class:"desk-empty"},"Sheet unavailable.");
 const frag=h("article",{class:"sheet",tabindex:"-1"},

   h("h2",{},sh.title),
   h("div",{class:"meta"},h("span",{class:"tag"},sh.tag),h("span",{class:"tag"},"synthetic training data")),
   h("p",{class:"lead"},sh.lead),
   renderBlocks(sh.blocks||[]));
 if(id==="siembench"){frag.append(h("p",{class:"lead"},SIEMBENCH_NOTE),renderBench("bench",null),stampButtons(id))}
 else frag.append(stampButtons(id)||"");
 return frag}

/* ---- ribbon (guided next step) ---- */
function renderRibbon(){
 const r=$("#ribbon");if(S.mode!=="medium"){r.hidden=true;return}
 const next=OBJM.find(o=>!getO(o.id).done);
 r.textContent="";
 if(next){r.hidden=false;
  r.append(h("span",{class:"rlab"},"Senior analyst says:"),
   h("button",{onclick:()=>openCard("obj",next.id)},"Next: "+next.id+" — "+next.title))}
 else{r.hidden=false;r.append(h("span",{class:"rlab"},"All objectives complete — run the knowledge check, then close the case."),
   h("button",{onclick:()=>openCard("quiz","quiz")},"Open knowledge check"))}}
/* ===== ENGINE: objective panels, validators ===== */
function uiMatch(o,id){
 const ui=getUI(id,{pairs:{},hintLevel:0});
 const shuf=shuffleIdx(o.data.pairs.length,ui,"shuf");
 const shufL=shuffleIdx(o.data.pairs.length,ui,"shufL");
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 const selL=ui.selL;
 const left=shufL.map(li=>{const i=li;const p=o.data.pairs[i];
  const paired=ui.pairs[i]!=null;
  return h("button",{class:"mchip"+(paired?" paired":"")+(selL===i?" sel":""),disabled:locked,onclick:()=>{
    if(locked){announce(lockMsg);return}
    if(paired){delete ui.pairs[i];save();openCard("obj",id);return}
    ui.selL=(selL===i?null:i);save();openCard("obj",id)}},p[0],paired?h("div",{class:"cbadge"},"→ "+o.data.pairs[ui.pairs[i]][1]):null)});
 const right=shuf.map(ri=>h("button",{class:"mchip",disabled:locked,onclick:()=>{
   if(locked){announce(lockMsg);return}
   if(selL==null){announce("Select a label on the left first.");return}
   ui.pairs[selL]=ri;ui.selL=null;save();openCard("obj",id)}},o.data.pairs[ri][1]));
 return h("div",{class:"matchgrid"},h("div",{class:"mcol"},left),h("div",{class:"mcol"},right))}
function uiOrder(o,id,key){
 const ui=getUI(id,{});const store=(typeof key==="string")?key:"placed";
 const evs=store==="acqOrder"?o.data.order:o.data.events;
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 const placed=ui[store]||[];
 const shuf=shuffleIdx(evs.length,ui,(store+"Shuf"));
 const pool=shuf.map(k=>evs[k][0]).filter(k=>!placed.includes(k));
 const slots=evs.map((e,i)=>{
  const p=placed[i];
  return h("div",{class:"slot"},h("span",{class:"n","aria-hidden":"true"},i+1),
   h("span",{class:"pl"},p?evs.find(x=>x[0]===p)[1]:"— empty —"),
   p?h("button",{class:"rm",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}placed.splice(i,1);save();openCard("obj",id)}},"remove"):null)});
 return h("div",{},
  h("div",{class:"rope",role:"group","aria-label":"Ordered slots"},slots),
  h("div",{class:"pool",role:"group","aria-label":"Events to place"},pool.length?evs.filter(e=>pool.includes(e[0])).map(e=>
    h("button",{class:"evtag",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}placed.push(e[0]);save();announce("Placed: "+e[1]);openCard("obj",id)}},e[1])):h("span",{class:"cbadge"},"all placed — CHECK RESULTS when satisfied")))}
function uiFields(o,id){
 const ui=getUI(id,{vals:{},hintLevel:0});
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{},o.data.fields.map(f=>{
  const v=ui.vals[f.key]||"";
  return h("div",{},h("label",{class:"flab",for:"f-"+id+"-"+f.key},f.label),
   h("input",{class:"ans wide",id:"f-"+id+"-"+f.key,value:v,placeholder:f.ph||"",readOnly:locked,
    oninput:e=>{if(locked){announce(lockMsg);return}ui.vals[f.key]=e.target.value;save()}}))}))}
function uiMulti(o,id,items){
 const ui=getUI(id,{sel:[],hintLevel:0});
 const sel=ui.sel||[];
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{class:"pool"},(items||o.data.items).map(it=>{
  const on=sel.includes(it[0]);
  return h("button",{class:"evtag"+(on?" used":""),"aria-pressed":on,disabled:locked,onclick:()=>{
    if(locked){announce(lockMsg);return}
    const i=sel.indexOf(it[0]);if(i>=0)sel.splice(i,1);else sel.push(it[0]);save();openCard("obj",id)}},
   (on?"✓ ":"")+it[1])}))}
function uiMultiField(o,id){
 const ui=getUI(id,{sel:[],fvalue:"",hintLevel:0});
 return h("div",{},h("h4",{},"Part 1 — select every source that applies"),
  uiMulti(o,id),
  h("h4",{},"Part 2 — "+o.data.field.label),
  h("input",{class:"ans",value:ui.fvalue||"",placeholder:o.data.field.ph,readOnly:getO(id).done,
   oninput:e=>{if(getO(id).done){announce("Validated — this objective's answers are locked.");return}ui.fvalue=e.target.value;save()}}))}
function uiTriage(o,id){
 const ui=getUI(id,{cls:{},reason:{},hintLevel:0});
 const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{},o.data.alerts.map(a=>{
  return h("div",{class:"alert"},h("strong",{},a[0]+" — "),a[1],
   h("div",{class:"selrow"},
    h("select",{disabled:getO(id).done,"aria-label":"Verdict for "+a[0],onchange:e=>{ui.cls[a[0]]=e.target.value;save();openCard("obj",id)}},
     h("option",{value:"",selected:ui.cls[a[0]]==null},"verdict…"),
     h("option",{value:"TP",selected:ui.cls[a[0]]==="TP"},"TRUE POSITIVE"),
     h("option",{value:"FP",selected:ui.cls[a[0]]==="FP"},"FALSE POSITIVE")),
    o.data.reasons?h("select",{disabled:getO(id).done,"aria-label":"Reason code for "+a[0],onchange:e=>{ui.reason[a[0]]=e.target.value;save();openCard("obj",id)}},
     h("option",{value:"",selected:ui.reason[a[0]]==null},"reason code…"),o.data.reasons.map(r=>h("option",{value:r,selected:ui.reason[a[0]]===r},r))):null))}))}
function uiSel4(o,id){
 const ui=getUI(id,{picks:[],hintLevel:0});
 return h("div",{},o.data.qs.map((q,i)=>{
  return h("div",{class:"alert"},h("strong",{},"Q"+(i+1)+" — "),q.q,
   h("div",{class:"selrow"},q.opts.map((op,oi)=>{
    const on=(ui.picks[i]===oi);
    return h("button",{class:"opt"+(on?" picked":""),"aria-pressed":on,disabled:getO(id).done,onclick:()=>{
      if(getO(id).done){announce("Validated — this objective's answers are locked.");return}
      ui.picks[i]=oi;save();openCard("obj",id)}},op)})))}))}
/* SIEM bench */
function uiQuery(o,id,opts){
 const ui=getUI(id,{clauses:[],count:"",hintLevel:0,lastRes:null});
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 const max=3;
 function clauseRow(i){
  const c=ui.clauses[i]||{f:"",op:"equals",v:""};
  return h("div",{class:"clause"},
   h("select",{disabled:locked,"aria-label":"Field "+(i+1),onchange:e=>{c.f=e.target.value;c.v="";save();openCard("obj",id)}},
    h("option",{value:""},"field…"),SIEM_FIELDS.map(f=>h("option",{value:f,selected:c.f===f},SF_LABEL[f]))),
   h("select",{disabled:locked,"aria-label":"Operator "+(i+1),onchange:e=>{c.op=e.target.value;save();openCard("obj",id)}},
    ["equals","not equals","contains"].map(op=>h("option",{value:op,selected:(c.op||"equals")===op},op))),
   h("select",{disabled:locked,"aria-label":"Value "+(i+1),onchange:e=>{c.v=e.target.value;save();openCard("obj",id)}},
    h("option",{value:""},"value…"),c.f?fieldVals(c.f).map(v=>h("option",{value:v,selected:c.v===v},v)):null),
   h("button",{class:"rm",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}ui.clauses.splice(i,1);ui.lastRes=null;save();openCard("obj",id)}},"×"))}
 function resTable(){
  if(!ui.lastRes)return null;
  if(!ui.lastRes.length)return h("p",{class:"callout gap"},"0 rows matched.");
  return h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},["time","host","source","user","src_ip","action","event"].map(x=>h("th",{},x)))),
   h("tbody",{},ui.lastRes.rows.map(r=>h("tr",{},SIEM_FIELDS.map(f=>h("td",{},r[f])))))))}
 return h("div",{},
  h("div",{},ui.clauses.map((c,i)=>clauseRow(i))),
  ui.clauses.length<max?h("button",{class:"btn",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}ui.clauses.push({f:"",op:"equals",v:""});save();openCard("obj",id)}},"+ add clause"):null,
  h("button",{class:"btn primary",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}ui.lastRes={n:runQuery(ui.clauses).length,rows:runQuery(ui.clauses)};save();announce("Query run: "+ui.lastRes.n+" rows.");openCard("obj",id)}},"RUN QUERY"),
  h("div",{class:"qout","aria-live":"polite"},"query: "+(ui.clauses.filter(c=>c.f&&c.v).map(c=>SF_LABEL[c.f]+" "+c.op+" '"+c.v+"'").join(" AND ")||"—")+"  →  "+(ui.lastRes?ui.lastRes.n+" rows":"not run")),
  resTable(),
  opts&&opts.countInput?h("div",{},h("label",{class:"flab"},"Rows returned — enter the number"),
   h("input",{class:"ans",value:ui.count||"",readOnly:locked,oninput:e=>{if(locked){announce(lockMsg);return}ui.count=e.target.value;save()}})):null)}
function uiSweep(o,id){
 const ui=getUI(id,{hintLevel:0});
 return h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},["sheet","stamp","open"].map(x=>h("th",{},x)))),
  h("tbody",{},ALL_SHEETS.map(sid=>{
   const st=S.stamps[sid];
   return h("tr",{},h("td",{},SHEETS[sid].title),
    h("td",{},st?h("span",{class:"stamp "+(st==="inc"?"done":"dismiss")},st==="inc"?"INCLUDED":"DISMISSED"):"—"),
    h("td",{},h("button",{class:"btn",onclick:()=>openCard("sheet",sid)},"open")))}))))}
function uiSrcField(o,id){
 const ui=getUI(id,{rows:[],hintLevel:0});
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{},o.data.qs.map((q,i)=>{
  const r=ui.rows[i]||{};
  return h("div",{class:"alert"},h("strong",{},"Q"+(i+1)+" — "),q.q,
   h("div",{class:"selrow"},
    h("select",{disabled:locked,"aria-label":"Source "+(i+1),onchange:e=>{r.src=e.target.value;save();openCard("obj",id)}},
     h("option",{value:""},"source…"),LOGSRC.map(s=>h("option",{value:s,selected:r.src===s},s))),
    h("input",{class:"ans","aria-label":"Field name "+(i+1),placeholder:"exact field name",value:r.field||"",readOnly:locked,
     oninput:e=>{if(locked){announce(lockMsg);return}r.field=e.target.value;save()}})))}))}
function uiAcq(o,id){
 const ui=getUI(id,{acqOrder:[],why:null,computed:null,bad:"",hintLevel:0});
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{},
  h("h4",{},"Part 1 — order the acquisitions (click to place)"),
  uiOrder(o,id,"acqOrder"),
  h("h4",{},"Part 2 — the principle that dictates the order"),
  h("select",{class:"ans",disabled:locked,"aria-label":"Principle",onchange:e=>{ui.why=e.target.value===""?null:Number(e.target.value);save();openCard("obj",id)}},
   h("option",{value:""},"choose…"),o.data.whyq.opts.map((op,i)=>h("option",{value:i,selected:ui.why===i},op))),
  h("h4",{},"Part 3 — verify integrity with the Hash tool (simulated SHA-256)"),
  h("div",{class:"clause"},
   h("select",{disabled:locked,"aria-label":"File to hash",onchange:e=>{ui.hashFile=e.target.value;save()}},
    h("option",{value:""},"file…"),o.data.files.map(f=>h("option",{value:f,selected:ui.hashFile===f},f))),
   h("button",{class:"btn",disabled:locked,onclick:()=>{if(locked){announce(lockMsg);return}if(ui.hashFile){ui.computed={file:ui.hashFile,hash:o.data.hashmap[ui.hashFile]};save();announce("Hash computed.");openCard("obj",id)}}},"COMPUTE SHA-256")),
  ui.computed?h("div",{class:"qout"},"SHA-256 (simulated) · "+ui.computed.file+" = "+ui.computed.hash):null,
  h("label",{class:"flab"},"Which file CANNOT be integrity-verified?"),
  h("select",{class:"ans",disabled:locked,"aria-label":"Unverifiable file",onchange:e=>{ui.bad=e.target.value;save();openCard("obj",id)}},
   h("option",{value:""},"choose…"),o.data.files.map(f=>h("option",{value:f,selected:ui.bad===f},f))))}
function uiVerdict(o,id){
 const ui=getUI(id,{v:null,bytes:"",staged:"",sel:[],hintLevel:0});
 const locked=getO(id).done;const lockMsg="Validated — this objective's answers are locked.";
 return h("div",{},
  h("label",{class:"flab"},"Verdict on the 443 session"),
  h("select",{class:"ans",disabled:locked,"aria-label":"Verdict",onchange:e=>{ui.v=e.target.value===""?null:Number(e.target.value);save();openCard("obj",id)}},
   h("option",{value:""},"choose…"),o.data.verdicts.map((v,i)=>h("option",{value:i,selected:ui.v===i},v))),
  h("label",{class:"flab"},"Firewall bytes_out (exact)"),
  h("input",{class:"ans",value:ui.bytes||"",readOnly:locked,oninput:e=>{if(locked){announce(lockMsg);return}ui.bytes=e.target.value;save()}}),
  h("label",{class:"flab"},"Staged volume"),
  h("input",{class:"ans",value:ui.staged||"",placeholder:"e.g. 3 GB",readOnly:locked,oninput:e=>{if(locked){announce(lockMsg);return}ui.staged=e.target.value;save()}}),
  h("h4",{},"The TWO sources that together prove volume AND content"),
  uiMulti(o,id,o.data.multi.items))}
function renderObj(id){
 const o=objById(id);
 const map={match:uiMatch,order:uiOrder,fields:uiFields,multi:uiMulti,"multi+field":uiMultiField,
  triage:uiTriage,sel4:uiSel4,sweep:uiSweep,srcfield:uiSrcField,acq:uiAcq,verdict:uiVerdict,
  query:(oo,ii)=>uiQuery(oo,ii,{countInput:true}),"query+multi":(oo,ii)=>h("div",{},
    h("h4",{},"Part 1 — build and run the correlation query, enter the row count"),uiQuery(oo,ii,{countInput:true}),
    h("h4",{},"Part 2 — independent corroboration of the byte figure"),uiMulti(oo,ii,oo.data.multi.items))
  }[o.ui];
 const inner=map?map(o,id,o):h("p",{},"UI missing for "+o.ui);
 return objShell(o,inner)}
/* ===== ENGINE: bench, quiz, field notes, completion, modals, init ===== */
function renderBench(key){
 const B=S.bench;
 function row(i){const c=B.clauses[i]||{f:"",op:"equals",v:""};
  return h("div",{class:"clause"},
   h("select",{"aria-label":"Field",onchange:e=>{c.f=e.target.value;c.v="";save();openCard("sheet","siembench")}},
    h("option",{value:""},"field…"),SIEM_FIELDS.map(f=>h("option",{value:f,selected:c.f===f},SF_LABEL[f]))),
   h("select",{"aria-label":"Operator",onchange:e=>{c.op=e.target.value;save();openCard("sheet","siembench")}},
    ["equals","not equals","contains"].map(op=>h("option",{value:op,selected:(c.op||"equals")===op},op))),
   h("select",{"aria-label":"Value",onchange:e=>{c.v=e.target.value;save();openCard("sheet","siembench")}},
    h("option",{value:""},"value…"),c.f?fieldVals(c.f).map(v=>h("option",{value:v,selected:c.v===v},v)):null),
   h("button",{class:"rm",onclick:()=>{B.clauses.splice(i,1);B.res=null;save();openCard("sheet","siembench")}},"×"))}
 const res=B.res;
 return h("div",{},
  h("div",{},B.clauses.map((c,i)=>row(i))),
  B.clauses.length<3?h("button",{class:"btn",onclick:()=>{B.clauses.push({f:"",op:"equals",v:""});save();openCard("sheet","siembench")}},"+ add clause"):null,
  h("button",{class:"btn primary",onclick:()=>{B.res=runQuery(B.clauses);save();announce("Bench query run: "+B.res.length+" rows.");openCard("sheet","siembench")}},"RUN QUERY"),
  h("div",{class:"qout","aria-live":"polite"},"query: "+(B.clauses.filter(c=>c.f&&c.v).map(c=>SF_LABEL[c.f]+" "+c.op+" '"+c.v+"'").join(" AND ")||"—")+"  →  "+(res?res.length+" rows":"not run")),
  res?(res.length?h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},["time","host","source","user","src_ip","action","event"].map(x=>h("th",{},x)))),
   h("tbody",{},res.map(r=>h("tr",{},SIEM_FIELDS.map(f=>h("td",{},r[f]))))))):h("p",{class:"callout gap"},"0 rows matched.")):null)}

function renderNotes(){
 return h("article",{class:"sheet",tabindex:"-1"},

  h("h2",{},"Field notes — what this case taught the floor"),
  h("p",{class:"lead"},"Distilled from the twelve locker sheets and the five artifacts. Simplified for training; every mapping below follows the source sheets."),
  h("div",{class:"doc"},h("h4",{},"Detection opportunities — data source → example detection logic"),h("div",{class:"tscroll"},
   h("table",{},h("thead",{},h("tr",{},["data source","example detection logic"].map(x=>h("th",{},x)))),
   h("tbody",{},[
    ["Application log","Alert on service-account logins with script User-Agents (python-requests) or internet source IPs"],
    ["Firewall log","Alert on egress sessions > 100 MB from non-standard hosts; alert on new external destinations from server VLANs"],
    ["OS-specific security logs","Alert on 4624 type 3 for service accounts outside backup windows; 5140 access to sensitive shares from VPN pool IPs"],
    ["IPS/IDS","Correlate SIG-7712-class alerts with asset criticality; suppress known scanner IPs with documentation"],
    ["API transactions","Alert on bulk reads (limit≥1000) for accounts whose baseline is outbound sync; failed-token clusters from one source"],
    ["SIEM","Correlate failed→successful token auth from one source IP within 7 days; new ASN + service account = priority 1"]].map(r=>h("tr",{},r.map(c=>h("td",{},c)))))))),
  h("div",{class:"doc"},h("h4",{},"Mitigation & readiness recommendations"),
   h("ul",{},
    h("li",{},"Extend API-gateway log retention to ≥ 20 days and hash before rotation (integrity + coverage)"),
    h("li",{},"Deploy EDR to the server tier (coverage) — the staging is invisible today"),
    h("li",{},"Add packet capture / tap on the FS VLAN (visibility)"),
    h("li",{},"Tune IDS: documented allowlist for the scanner IP; keep severity changes alerting"),
    h("li",{},"Baseline service accounts: alert when svc_backup deviates from outbound-sync behavior"),
    h("li",{},"Gate bulk API reads behind step-up auth or tighter scopes"))),
  h("div",{class:"doc"},h("h4",{},"Blue-team takeaways"),
   h("ul",{},
    h("li",{},"No single source could close this case: the app log found the login, the API rows scoped it, the OS events located it, the firewall sized it, the capture proved it"),
    h("li",{},"Context sources (scan schedule, change tickets) are what turn six false positives into one tuning ticket"),
    h("li",{},"Retention and integrity decisions made months earlier determined what evidence still existed"),
    h("li",{},"Negative evidence (CCTV: no entry) is evidence — it eliminates hypotheses"))),
  h("div",{class:"doc"},h("h4",{},"Red-team mindset (defensive)"),
   h("ul",{},
    h("li",{},"A stolen service token looks like the service working — behavior baselines catch what AV cannot"),
    h("li",{},"Dressing exfil infrastructure up as a telemetry CDN works until captures are inspected"),
    h("li",{},"The 8443 denial was a free alarm: attackers test, so denials deserve the same triage as alerts"),
    h("li",{},"Volumes near backup windows are camouflage; byte-count baselines per host expose it"))),
  h("div",{class:"doc"},h("h4",{},"Reference links (open in a new tab)"),
   h("ul",{},
    h("li",{},h("a",{href:"https://www.comptia.org/en-us/certifications/security",target:"_blank",rel:"noopener"},"CompTIA Security+ certification & objectives page")),
    h("li",{},h("a",{href:"https://attack.mitre.org/datasources/",target:"_blank",rel:"noopener"},"MITRE ATT&CK — data sources model")),
    h("li",{},h("a",{href:"https://d3fend.mitre.org/",target:"_blank",rel:"noopener"},"MITRE D3FEND — defensive countermeasures")))))}

/* ---- modal helpers: open/close with focus return (QA fix R7) ---- */
let lastFocus=null;
function openModal(node){lastFocus=document.activeElement;const root=$("#modalRoot");root.textContent="";root.append(node);return node}
function closeModal(){const root=$("#modalRoot");root.textContent="";if(lastFocus&&lastFocus.focus){try{lastFocus.focus()}catch(e){}}}
/* ---- stats & completion (C7) ---- */
function stats(){
 const list=curObj(),N=list.length;
 const done=list.filter(o=>getO(o.id).done).length;
 const clean=list.filter(o=>{const st=getO(o.id);return st.done&&st.firstTry&&st.hints===0}).length;
 const total=S.mode==="medium"?6:7;
 const qa=S.quiz.done?S.quiz.correct/total:0;
 const score=0.55*(done/N)+0.2*(clean/N)+0.25*qa;
 const stars=Math.min(5,Math.max(1,Math.round((1+4*score)*2)/2));
 return{N,done,clean,qa,scorePct:Math.round(score*100),stars}}
function focusAreas(){
 const out=[];
 curObj().forEach(o=>{const st=getO(o.id);
  if(!st.done)out.push(o.id+" — "+o.title+" is still open: work it before closing the case.");
  else if(st.attempts>1)out.push(o.id+" — "+o.title+" needed "+st.attempts+" checks. Re-read the matching Field-notes section, then redo it cleanly.");
  else if(st.hints>0)out.push(o.id+" — you used "+st.hints+" hint(s) on "+o.title+". Redo it without hints to confirm mastery.");});
 const qs=S.mode==="medium"?QUIZM:QUIZH;
 qs.forEach((q,i)=>{const a=S.quiz.ans[i];if(a&&!a.ok)out.push("Knowledge check Q"+(i+1)+" ("+q.topic+") was missed — review that topic in the Field notes, then retake.");});
 if(!S.quiz.done)out.push("Knowledge check not finished — run it to validate recall against the chapter.");
 if(!out.length)out.push("Clean first pass — no weak areas detected. Deepen with the Field-notes reference links and the next-step list below.");
 return out}
function pillarRecap(){
 const rows=[];
 ["P1","P2","P3","P4"].forEach(p=>{
  const items=curObj().filter(o=>o.pillar===p);
  const done=items.filter(o=>getO(o.id).done);
  rows.push([p+" · "+PILLARS[p],done.length+" / "+items.length,items.map(o=>getO(o.id).done?"✓ "+o.title:"· "+o.title)])});
 return rows}
function completionModal(){
 const st=stats(),closed=st.done===st.N;
 const back=h("div",{class:"modal-back",onclick:e=>{if(e.target===back)closeModal()}},
  h("div",{class:"modal",role:"dialog","aria-modal":"true","aria-label":"Completion report"},
   h("h2",{},closed?"CASE CLOSED — HLX-2026-1112":"Completion report"),
   h("p",{class:"lead"},closed?
    "Every objective validated, the knowledge check behind you. The evidence room goes quiet — file it.":
    "Some objectives are still open — the report below shows exactly which."),
   h("p",{class:"stars","aria-label":st.stars+" of 5 stars"},"★".repeat(Math.floor(st.stars))+"☆".repeat(5-Math.floor(st.stars))+" "+st.stars+"/5"),
   h("p",{},"Score "+st.scorePct+"% · formula: 55% objectives validated + 20% first-attempt-clean + 25% knowledge check. Hints and failed checks reduce the first-attempt share — never progress."),
   h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},["pillar","progress","objectives"].map(x=>h("th",{},x)))),
    h("tbody",{},pillarRecap().map(r=>h("tr",{},h("td",{},r[0]),h("td",{},r[1]),h("td",{},r[2])))))),
   h("p",{},"Knowledge check: "+(S.quiz.done?S.quiz.correct+" / "+(S.mode==="medium"?6:7)+" correct":"not finished")),
   h("h3",{style:"font-family:var(--serif)"},"Focus areas for your next study block"),
   h("p",{class:"lead",style:"font-size:.85rem"},"Derived from your own run: objectives that needed repeats or hints, open items, and missed check questions."),
   h("ul",{},focusAreas().map(f=>h("li",{},f))),
   h("h3",{style:"font-family:var(--serif)"},"What to learn next"),
   h("ul",{},
    h("li",{},"SY0-801 4.4 — alerting and monitoring (dashboards, packet analyzers, network management systems)"),
    h("li",{},"SY0-801 4.7 — incident response activities: playbooks, roles, PIR"),
    h("li",{},"MITRE ATT&CK data sources & D3FEND countermeasures — the mapping behind every detection you wrote here")),
   h("div",{class:"obj-actions"},
    h("button",{class:"btn primary",onclick:closeModal},"Back to the evidence room"))));
 openModal(back);
 announce(closed?"Case closed. Completion report opened.":"Completion report opened.")}
function renderClose(){
 const st=stats();
 return h("article",{class:"sheet",tabindex:"-1"},

  h("h2",{},"Close the case"),
  h("p",{class:"lead"},"Objectives validated: "+st.done+"/"+st.N+" · knowledge check: "+(S.quiz.done?S.quiz.correct+" correct":"not started")),
  h("div",{class:"obj-actions"},
   h("button",{class:"btn primary",onclick:completionModal},"OPEN COMPLETION REPORT")))}
function openGlossary(){
 const back=h("div",{class:"modal-back",onclick:e=>{if(e.target===back)closeModal()}},
  h("div",{class:"modal",role:"dialog","aria-modal":"true","aria-label":"Glossary"},
   h("h2",{},"Glossary"),
   h("dl",{class:"glossary"},GLOSS.map(g=>[h("dt",{},g[0]),h("dd",{},g[1])]).flat(9)),
   h("div",{class:"obj-actions"},h("button",{class:"btn primary",onclick:closeModal},"Close"))));
 openModal(back);announce("Glossary opened.")}
function confirmReset(){
 const back=h("div",{class:"modal-back",onclick:e=>{if(e.target===back)closeModal()}},
  h("div",{class:"modal",role:"dialog","aria-modal":"true","aria-label":"Reset lab"},
   h("h2",{},"Reset the lab?"),
   h("p",{},"This wipes your mode, every validated objective, stamps, quiz answers and saved progress — restoring the pristine lab. There is no undo."),
   h("div",{class:"obj-actions"},
    h("button",{class:"btn danger",onclick:()=>{try{localStorage.removeItem(LSKEY)}catch(e){}location.reload()}},"YES — RESET EVERYTHING"),
    h("button",{class:"btn",onclick:closeModal},"Cancel"))));
 openModal(back)}

function updateMeter(){const st=stats();
 $("#meterLabel").textContent=st.done+"/"+st.N+" objectives";
 $("#meterFill").style.width=(st.N?Math.round(100*st.done/st.N):0)+"%"}
