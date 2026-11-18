/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Shared DOM helpers, rail/station views, board, glossary, instructor key.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const opt = (v,t,sel) => `<option value="${esc(v)}"${sel===v?" selected":""}>${esc(t)}</option>`;
const announce = t => { const el=$("#srLive"); if(el){ el.textContent=""; setTimeout(()=>{ el.textContent=t; },30); } };
function renderRail(){
  const rail=$("#rail");
  const done = st => { const defs=OBJ_DEFS.filter(o=>{
      if(o.mode!==state.mode) return false;
      if(st==="binder") return ["OBJ-M5","OBJ-M6","OBJ-H1"].includes(o.id);
      if(st==="meter")  return ["OBJ-M7","OBJ-M8","OBJ-H3","OBJ-H4"].includes(o.id);
      if(st==="bench")  return ["OBJ-M9","OBJ-M10","OBJ-H2","OBJ-H5","OBJ-H6","OBJ-H7","OBJ-H8","OBJ-H9","OBJ-H10"].includes(o.id);
      if(st==="dispatch") return ["OBJ-M1","OBJ-M2","OBJ-M3","OBJ-M4","OBJ-M11","OBJ-H10"].includes(o.id);
      return false; });
    return defs.some(o=>{ const s=state.objs[state.mode]&&state.objs[state.mode][o.id]; return s&&s.done; }) ? "✓" : ""; };
  rail.innerHTML = `<div class="rail-h">Floor plan</div>` +
    STATIONS.map(s=>`<button class="door" data-station="${s.id}" aria-current="false"><span class="n">${s.n}</span><span class="t">${s.t}</span><span class="done-dot">${done(s.id)}</span></button>`).join("")
    + (state.mode==="medium" ? `<div class="ribbon">Recommended route: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08</div>` : "");
  $$("#rail .door").forEach(b=>b.addEventListener("click",()=>showStation(b.dataset.station)));
  syncRail();
}
function syncRail(){
  $$("#rail .door").forEach(b=>b.setAttribute("aria-current", b.dataset.station===state.seen.lastStation ? "true":"false"));
  $$("#rail .door").forEach(b=>b.classList.toggle("active", b.dataset.station===state.seen.lastStation));
}
function showStation(id){
  state.seen.lastStation=id; save();
  STATIONS.forEach(s=>{ $("#st-"+s.id).hidden = s.id!==id; });
  syncRail();
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------- board (SVG hall) ---------- */
function boardClasses(){
  const cls={};
  const d = lastD(state);
  if(d){ cls.tx=d.src; (d.receivers||[]).forEach(r=>cls[r]="rx");
    if(d.verdict==="BLOCKED") cls.R1="blk";
    if(d.mode==="multicast"&&d.dest==="G-OSPF") cls.R1="rx";
    if(d.dest==="WEB") cls.R1="rx"; }
  return cls;
}
function renderBoard(){
  const cls=boardClasses();
  const lines=BOARD_LINES.map(l=>`<line class="ndline" x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}"/>`).join("");
  const nodes=BOARD_NODES.map(n=>{
    let k=cls[n.id]||"";
    let style="";
    if(state.env.edgeDown[n.id]) style=' style="opacity:.45"';
    const labelY = n.kind==="router"?n.y+21 : n.h>=40?n.y+16 : n.y+15;
    const nipY   = n.kind==="router"?n.y+37 : n.h>=40?n.y+31 : n.y+28;
    return `<g class="nd ${k}" data-kind="${n.kind}" data-id="${n.id}"${style}><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="7"></rect>`+
      `<text x="${n.x+n.w/2}" y="${labelY}" text-anchor="middle">${esc(n.label)}</text>`+
      `<text class="nip" x="${n.x+n.w/2}" y="${nipY}" text-anchor="middle">${esc(n.nip)}</text></g>`;
  }).join("");
  const note=`<text x="628" y="158" style="fill:var(--ink2);font-family:var(--mono);font-size:9.5px">CDN anycast ${CDN_IP} — one IP, three twins</text>`;
  $("#board").innerHTML = lines+nodes+note;
}

/* ---------- composer ---------- */
/* ---------- glossary / reset / instructor key ---------- */
function renderGlossary(){
  $("#glossList").innerHTML=GLOSSARY.map(g=>`<dt>${esc(g[0])}</dt><dd>${esc(g[1])}</dd>`).join("");
}
function buildInstrKey(){
  const rows=OBJ_DEFS.map(o=>{
    let key="";
    if(o.id==="OBJ-M5"||o.id==="OBJ-H1") key=FRAMES.map(f=>`${f.id}=${f.type}`).join(", ")+(o.id==="OBJ-H1"?"; anomaly=F9 (directed-broadcast sweep)":"");
    else if(o.id==="OBJ-M6") key=MATCHER.map(x=>`${x.id}=${x.ans}`).join(", ");
    else if(o.id==="OBJ-H2") key="① 2 domains ② all10 ③ no ④ directed 10.20.30.255 (denied by default)";
    else if(o.id==="OBJ-M7") key="VLAN10 — L2 loop/broadcast storm";
    else if(o.id==="OBJ-H3") key="VLAN10=loop · VLAN20=multicast flood · VLAN30=ARP sweep · peak=1320 pps";
    else if(o.id==="OBJ-H4") key="thr ∈ {400,800} AND win ∈ {1,2}";
    else if(o.id==="OBJ-H7") key="failover EDGE-SIN→EDGE-FRA; true set = s2,s3,s5";
    else if(o.id==="OBJ-H8") key=Object.entries(H8_ANSWERS).map(([k,v])=>`${k}=${v}`).join(", ");
    else if(o.id==="OBJ-H9") key="order: stop-loop → stormctl → segment → snooping → monitor; apply; clean re-run";
    else if(o.id==="OBJ-H10") key="dispatch ND (IPv6); ① ff02::2 ② NDP replaces ARP";
    else if(o.id==="OBJ-M9") key="control=vlan; reason=b";
    else if(o.id==="OBJ-M11") key="dispatch ND-SOLICIT; answer=mcast";
    else if(o.id==="OBJ-H5") key="snooping SW1+SW2+querier ON; h5mode=sparse; dispatch members-only";
    else if(o.id==="OBJ-H6") key="wolException ON, directedFwd OFF; WoL payload → 10.20.30.255 forwarded; reason=smurf";
    else key="see objective feedback text";
    return `<tr><td>${o.id}</td><td>${esc(o.title)}</td><td>${esc(key)}</td></tr>`;
  }).join("");
  $("#instrKey").innerHTML=`<table class="tbl"><tr><th>ID</th><th>Objective</th><th>Key</th></tr>${rows}</table>
  <p style="font-size:.8rem">Quiz keys — ${Object.keys(QUIZ).map(m=>`${m}: ${QUIZ[m].map((q,i)=>`Q${i+1}=${q.correct+1}/${q.opts[q.correct].slice(0,32)}…`).join("; ")}`).join(" · ")}</p>`;
}
