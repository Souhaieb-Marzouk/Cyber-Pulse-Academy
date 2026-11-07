/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* Validation primitives (CIDR/port/SG/NACL/route matching) + objective state machine, CHECK RESULTS engine, hints, task rail */
/* ============================ OBJECTIVES + CHECK ENGINE ============================ */
const norm = s => (s||"").toString().trim().toLowerCase().replace(/\s+/g,"");
function cidrMatch(ip, cidr){
  if(!ip || !cidr) return false;
  const m = cidr.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/); if(!m) return false;
  const pl = parseInt(m[2],10); if(pl<0||pl>32) return false;
  const toInt = a => a.split(".").reduce((acc,o)=>((acc<<8)+ (parseInt(o,10)&255))>>>0, 0);
  const mask = pl===0 ? 0 : (0xFFFFFFFF << (32-pl))>>>0;
  const base = (toInt(m[1]) & mask)>>>0;
  const iip = toInt(ip);
  return (iip>>>0) >= base && (iip>>>0) < (base + (2**(32-pl)));
}
function portMatch(rulePort, port){
  const rp = norm(rulePort), p = String(port).trim();
  if(!rp || !p) return false;
  if(rp.includes("-")){
    const [a,b] = rp.split("-").map(Number);
    const n = Number(p); return n>=a && n<=b;
  }
  return Number(rp) === Number(p);
}
function ruleFind(rules, port, dir){ // dir: 'in'/'out' unused; NACL rule lookup
  return rules.find(r => portMatch(r.port, port));
}
function sgAllows(sgName, port, srcIp, srcSg){
  const sg = S.world.sg[sgName]; if(!sg) return {ok:false, note:"no security group"};
  const hit = sg.rules.find(r => portMatch(r.port, port) && (
    norm(r.src) === "0.0.0.0/0" ||
    (r.src.includes("/") && cidrMatch(srcIp, r.src)) ||
    (norm(r.src).startsWith("sg-") && srcSg && norm(r.src) === norm(srcSg))
  ));
  return hit ? {ok:true, note:`${sgName} allows ${hit.port} from ${hit.src}`} : {ok:false, note:`${sgName} has no rule for tcp/${port} from ${srcSg||srcIp}`};
}
function naclEval(name, port, dir){
  const na = S.world.nacl[name];
  if(!na) return {ok:true, note:"no NACL on subnet (simplified)"};
  const rules = na[dir];
  if(!rules || rules.length===0) return {ok:true, note:"no custom rules — default allow (simplified)"};
  const hit = rules.find(r => portMatch(r.port, port) && norm(r.act)==="allow");
  return hit ? {ok:true, note:`${name} ${dir.toUpperCase()} allow ${hit.port}`} : {ok:false, note:`${name} ${dir.toUpperCase()} has no ALLOW for port ${port} (stateless: ${dir==="in"?"request":"return"} dropped)`};
}
function rtHasRoute(rt, dst, tgt){
  const t = S.world.rts[rt]; if(!t) return false;
  return t.routes.some(r => norm(r.dst)===norm(dst) && (!tgt || norm(r.tgt)===norm(tgt)));
}
function sgRulesEq(name, expected){
  const rules = S.world.sg[name].rules.map(r=>({port:norm(r.port), src:norm(r.src)}));
  const exp = expected.map(r=>Array.isArray(r) ? {port:norm(r[0]), src:norm(r[1])} : {port:norm(r.port), src:norm(r.src)});
  if(rules.length !== exp.length) return false;
  const k = r => r.port+"|"+r.src;
  const a = rules.map(k).sort().join(","), b = exp.map(k).sort().join(",");
  return a === b && rules.every(r=>r.port && r.src);
}
function sgHas(name, port, src){ return S.world.sg[name].rules.some(r=>norm(r.port)===norm(port) && norm(r.src)===norm(src)); }
function naclHas(name, dir, act, port){ return S.world.nacl[name][dir].some(r=>norm(r.act)===norm(act) && norm(r.port)===norm(port)); }

const OBJ_LIST = () => S.mode === "M" ? OBJ_M : OBJ_H;
const OBJ_DONE = () => OBJ_LIST().filter(o => S.objs[o.id] && S.objs[o.id].done).length;

function objState(id){
  if(!S.objs[id] || typeof S.objs[id] !== "object" || Array.isArray(S.objs[id])) S.objs[id] = {};
  const st = S.objs[id];
  if(st.done === undefined) st.done = false;
  if(st.attempts === undefined) st.attempts = 0;
  if(st.hints === undefined) st.hints = 0;
  if(st.ans === undefined) st.ans = null;
  if(st.firstTry === undefined) st.firstTry = false;
  if(st.feedback === undefined) st.feedback = null;
  return st;
}
function checkObjective(id){
  const O = OBJ_ALL[id], st = objState(id);
  st.attempts++;
  const res = O.validate();
  if(res.pass){
    st.done = true;
    if(st.attempts === 1) st.firstTry = true;
    st.feedback = {pass:true, msg:res.msg};
    S.lastChecked = id;
    announce("Objective "+id+" passed. "+res.msg);
    save();
    renderTasks(); renderTitle(); renderDrawer();
    if(OBJ_DONE() === OBJ_LIST().length && !S.quiz.done){
      toast("All objectives complete — opening the Review Board");
      setTimeout(openQuiz, 700);
    }
  } else {
    st.feedback = {pass:false, msg:res.msg};
    S.lastChecked = id;
    announce("Objective "+id+" not complete yet. "+res.msg);
    save(); renderTasks();
  }
}
function useHint(id){
  const O = OBJ_ALL[id], st = objState(id);
  const max = S.mode === "M" ? 3 : 1;
  if(st.hints >= max) return;
  st.hints++;
  S.lastChecked = id;
  save(); renderTasks();
}
function renderTasks(){
  const rail = $id("tasks");
  const list = OBJ_LIST();
  const firstOpen = list.findIndex(o => !(S.objs[o.id] && S.objs[o.id].done));
  let html = "";
  list.forEach((o,i)=>{
    const st = objState(o.id);
    const active = i === firstOpen;
    const open = active || S.lastChecked === o.id || ($id("task-"+o.id) && $id("task-"+o.id).classList.contains("open"));
    const hintsShown = [];
    if(S.mode === "M"){ (o.hints||[]).slice(0, st.hints).forEach(h => hintsShown.push(h)); }
    else if(st.hints > 0 && o.nudge){ hintsShown.push(o.nudge); }
    let widget = "";
    if(o.widget && (st.done === false || true)) widget = `<div class="mt2" id="w-${o.id}">${o.widget.html()}</div>`;
    const checkDisabled = st.done;
    html += `<div class="task ${st.done?"done":""} ${active?"active":""} ${open?"open":""}" id="task-${o.id}">
      <div class="task-head" role="button" tabindex="0" aria-expanded="${open}" data-t="${o.id}">
        <span class="idx">${st.done?"✓":i+1}</span>
        <span class="pchip ${o.pillar.toLowerCase()}">${o.pillar}</span>
        <span class="task-title">${esCape(o.title)}</span>
      </div>
      <div class="task-body">
        <p class="brief">${esCape(o.brief)}</p>
        ${S.mode==="M" && o.look ? `<p class="hinttext"><b>Where to look:</b> ${esCape(o.look)}</p>`:""}
        ${widget}
        ${hintsShown.map(h=>`<div class="hintbox">💡 ${esCape(h)}</div>`).join("")}
        ${st.feedback ? (st.feedback.pass ? `<div class="passmsg">✅ <b>Check passed.</b> ${esCape(st.feedback.msg)}</div>`
                                          : `<div class="failmsg">✗ <b>Not yet.</b> ${esCape(st.feedback.msg)}</div>`) : ""}
        <div class="row mt">
          <button class="btn small primary" data-check="${o.id}" ${checkDisabled?"disabled":""}>${st.done?"PASSED":"CHECK RESULTS"}</button>
          ${!st.done && S.mode==="M" ? `<button class="btn small amber" data-hint="${o.id}" ${st.hints>=3?"disabled":""}>Hint (${st.hints}/3)</button>`:""}
          ${!st.done && S.mode==="H" && o.nudge ? `<button class="btn small amber" data-hint="${o.id}" ${st.hints>=1?"disabled":""}>Nudge −8% (${st.hints}/1)</button>`:""}
        </div>
      </div>
    </div>`;
  });
  if(S.quiz.done){
    html += `<div class="task"><div class="task-head"><span class="idx" style="background:var(--stamp)">✓</span><span class="task-title">Review Board completed</span></div>
      <div class="task-body"><p class="brief">Quiz score recorded. Open the completion seal from the Field Notes or reload to see it.</p>
      <div class="row mt"><button class="btn small primary" id="btnOpenDone">Show completion seal</button></div></div></div>`;
  } else if(list.length && OBJ_DONE() === list.length){
    html += `<div class="task active"><div class="task-head" role="button" tabindex="0" aria-expanded="true"><span class="idx" style="background:var(--stamp)">✓</span><span class="task-title">All objectives passed — finish the deployment</span></div>
      <div class="task-body"><p class="brief">Every objective on the sheet is done. The Review Board is the last step: ${S.mode==="M"?"6 concept questions":"7 scenario questions"} with explanations.</p>
      <div class="row mt"><button class="btn small primary" id="btnOpenQuiz">Open Review Board</button></div></div></div>`;
  }
  rail.innerHTML = html;
  // bindings
  rail.querySelectorAll(".task-head").forEach(h => {
    const toggle = () => { const card = $id("task-"+h.dataset.t); card.classList.toggle("open"); h.setAttribute("aria-expanded", card.classList.contains("open")); };
    h.addEventListener("click", toggle);
    h.addEventListener("keydown", e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });
  });
  rail.querySelectorAll("[data-check]").forEach(b => b.addEventListener("click", () => checkObjective(b.dataset.check)));
  rail.querySelectorAll("[data-hint]").forEach(b => b.addEventListener("click", () => useHint(b.dataset.hint)));
  list.forEach(o => { if(o.widget) o.widget.bind(); });
  const od = $id("btnOpenDone"); if(od) od.addEventListener("click", openDone);
  const oq = $id("btnOpenQuiz"); if(oq) oq.addEventListener("click", openQuiz);
}

/*__SIM__*/
