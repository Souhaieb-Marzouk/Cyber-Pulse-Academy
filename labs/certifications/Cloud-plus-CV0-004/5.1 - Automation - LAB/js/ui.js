/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/ui.js — widget component engines + targeted refresh (template functions)

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
const STAR_SVG = '<svg class="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

/* ===== WIDGET ENGINES ===== */
/* ================= WIDGET ENGINES ================= */
function wSort(w){
  const st = getE(w.key); st.sel = st.sel || {};
  if(!st.disp) st.disp = shuffle(w.items.map(i=>i.id));
  const rows = st.disp.map(id => w.items.find(x=>x.id===id)).map(it => {
    const btns = w.b.map(b => `<button type="button" class="bkt ${b.alt?"alt":""}" data-w="${w.key}" data-i="${it.id}" data-b="${b.id}" aria-pressed="${st.sel[it.id]===b.id}">${esc(b.label)}</button>`).join("");
    return `<div class="sortRow"><span class="stmt">${esc(it.t)}</span>${btns}</div>`;
  }).join("");
  return `<div class="sortList" role="group" aria-label="${esc(w.key)}">${rows}</div>`;
}
function wAssign(w){
  const st = getE(w.key); st.place = st.place || {}; st.picked = st.picked || "";
  const placed = Object.values(st.place);
  if(!st.cdisp) st.cdisp = shuffle(w.chips.map(c=>c.id));
  const chips = st.cdisp.map(cid => {
    const c = w.chips.find(x=>x.id===cid);
    const isPlaced = placed.includes(c.id);
    return `<button type="button" class="chip ${isPlaced?"used":""}" data-w="${w.key}" data-c="${c.id}" aria-pressed="${st.picked===c.id}" ${isPlaced?'title="Placed — tap to return it to the pool"':""}>${esc(c.t)}</button>`;
  }).join("");
  const socks = w.socks.map(s => {
    const cid = st.place[s.id];
    const chip = w.chips.find(c=>c.id===cid);
    const armed = st.picked && !cid;
    return `<div class="socket ${cid?"filled":""}" role="button" tabindex="0" data-w="${w.key}" data-s="${s.id}" aria-pressed="${armed}"><span class="socketLabel">${esc(s.t)}</span><span class="socketVal">${chip?esc(chip.t):'<span class="empty">— empty socket —</span>'}</span></div>`;
  }).join("");
  return `<div class="assignBoard" role="group" aria-label="${esc(w.key)}"><span class="wLabel">Tool bin — tap a chip, then tap its socket (tap again to return)</span><div class="chipPool">${chips}</div><div class="socketGrid">${socks}</div></div>`;
}
function wSeq(w){
  const st = getE(w.key);
  if(!st.disp) st.disp = shuffle(w.items.map(i=>i.id));
  st.order = st.order || [];
  const items = st.disp.map(id => {
    const it = w.items.find(x=>x.id===id);
    const used = st.order.includes(id);
    return `<button type="button" class="seqItem ${used?"used":""} ${it.hazard?"hazard":""}" data-w="${w.key}" data-i="${id}" ${used?"disabled":""}>${esc(it.t)}</button>`;
  }).join("");
  const ans = st.order.map((id,i) => {
    const it = w.items.find(x=>x.id===id);
    return `<button type="button" class="seqAns" data-w="${w.key}" data-rm="${id}"><span class="idx">${i+1}</span><span>${esc(it.t)}</span></button>`;
  }).join("");
  return `<div class="seqWrap" role="group" aria-label="${esc(w.key)}"><div class="seqItems">${items}</div><div class="seqAnswer" aria-label="Your sequence">${ans||'<span class="seqHintText">Sequence empty — tap the steps above in the order they should run.</span>'}</div><span class="seqHintText">Tap a step to add it (steps stay available if not yet used). Tap an answer line to remove it. <button type="button" class="ghostBtn" style="min-height:34px" data-w="${w.key}" data-clear="1">Clear sequence</button></span></div>`;
}
function wPick(w){
  const st = getE(w.key); st.sel = st.sel || [];
  const opts = w.opts.map(o => `<button type="button" class="opt" data-w="${w.key}" data-o="${o.id}" aria-pressed="${st.sel.includes(o.id)}">${esc(o.t)}</button>`).join("");
  return `<div class="pickOpts" role="group" aria-label="${esc(w.key)}">${opts}</div>`;
}
function wMark(w){
  const st = getE(w.key); st.flagged = st.flagged || []; st.converged = !!st.converged;
  const head = w.cols.map(c=>`<th scope="col">${esc(c)}</th>`).join("") + '<th scope="col">Flag drift</th>';
  const rows = w.rows.map(r => {
    const on = st.flagged.includes(r.id);
    return `<tr class="driftRow ${on?"flagged":""}" data-row="${r.id}">${r.cells.map(c=>`<td>${esc(c)}</td>`).join("")}<td><button type="button" class="flagBtn" data-w="${w.key}" data-f="${r.id}" aria-pressed="${on}">FLAG</button></td></tr>`;
  }).join("");
  let machine = "";
  if(w.machine){
    machine = `<div class="machineBtns" style="margin-top:12px"><button type="button" class="mBtn go" data-w="${w.key}" data-m="${w.machine.id}" ${st.converged?"disabled":""}>${esc(w.machine.label)}</button><span class="seqHintText" id="drift-${w.key}-state">${st.converged?"CONVERGED — live state now matches the code of record.":"Live state differs from desired."}</span></div>`;
  }
  return `<div style="overflow-x:auto"><table class="dataT" role="group" aria-label="${esc(w.key)}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>${machine}`;
}
function wLog(w){
  const st = getE(w.key); st.picked = st.picked || "";
  const lines = w.lines.map(l => `<button type="button" class="logline ${l.c||""} ${st.picked===l.id?"sel":""}" data-w="${w.key}" data-l="${l.id}" aria-pressed="${st.picked===l.id}">${esc(l.t)}</button>`).join("");
  return `<div class="logFeed" role="group" aria-label="${esc(w.key)}" aria-label="pipeline log">${lines}</div>`;
}
function wMachine(w){
  const st = getE(w.key); st.log = st.log || [];
  const btns = w.btns.map(b => `<button type="button" class="mBtn ${b.cls||""} ${st.log[st.log.length-1]===b.id?"on":""}" data-w="${w.key}" data-m="${b.id}">${esc(b.t)}</button>`).join("");
  return `<div class="machineBtns" role="group" aria-label="${esc(w.key)}">${btns}</div><div id="mv-${w.key}" style="margin-top:10px"></div>`;
}

const ENGINES = { sort:wSort, assign:wAssign, seq:wSeq, pick:wPick, mark:wMark, log:wLog, machine:wMachine };

/* ===== WIDGET REFRESH (targeted, keeps focus sane) ===== */
/* ================= WIDGET REFRESH (targeted, keeps focus sane) ================= */
let _focus = null;
function findWidget(key){
  for(const w of WOS()){ const f = w.widgets.find(x=>x.key===key); if(f) return {wodef:w, w:f}; }
  return null;
}
function refreshWidget(key){
  const host = document.querySelector(`[data-widget="${key}"]`);
  const f = findWidget(key);
  if(host && f){ host.innerHTML = ENGINES[f.w.type](f.w); }
  if(_focus){ const t = document.querySelector(_focus); if(t) t.focus(); _focus = null; }
}

/* ===== CONVEYOR HOOK (machine jam/reset view logic) ===== */
function cvHook(pairs, jamMsg){
  return (k, log) => {
    let bad = -1;
    for(let i=0;i<log.length;i++){ if(log[i]!==pairs[i][0]){ bad=i; break; } }
    if(bad>=0){
      getE(k).log = []; refreshWidget(k);
      const mv2 = $("mv-"+k);
      if(mv2) mv2.innerHTML = `<div class="fb show bad">${jamMsg} The conveyor resets — order the steps by the pipeline workflow and run again.</div>`;
    } else {
      const mv = $("mv-"+k);
      if(mv) mv.innerHTML = pairs.map((p,i)=>`<span class="cvBox ${log[i]!==undefined?"on":""}">${esc(p[1])}</span>`).join('<span class="cvArrow">→</span>') + (log.length===pairs.length ? ' <span class="tag teal">RUN COMPLETE</span>' : "");
    }
  };
}
