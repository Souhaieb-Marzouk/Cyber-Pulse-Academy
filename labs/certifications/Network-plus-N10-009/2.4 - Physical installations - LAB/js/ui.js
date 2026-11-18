/* ============================================================
   js/ui.js — DOM helpers and every rendering path: live room map,
   console router, punch list, progress ring, and the five console
   screens (Briefing, Rack, Power, Climate, Sign-off).
   ============================================================ */
"use strict";
function announce(msg){ const el=document.getElementById("live"); if(el) el.textContent = msg; }

function openModal(id){ closeModals(); const m=document.getElementById(id); if(m) m.hidden=false;
  const f=m.querySelector("button,select,input"); if(f) f.focus(); }
function closeModals(){ document.querySelectorAll(".modal").forEach(m=>m.hidden=true); }

/* ---------- map render ---------- */
function renderMap(){
  const $ = id=>document.getElementById(id);
  if(!$("roommap")) return;
  const aisleOkNow = S.env.aisle==="cold" && S.env.tilesOpen;
  const ar=$("aisleRect");
  ar.classList.toggle("cold-ok", aisleOkNow);
  ar.classList.toggle("hot-mark", S.env.aisle==="hot");
  document.querySelectorAll("#tiles .tile").forEach(t=>t.classList.toggle("lit", aisleOkNow));
  $("aisleLbl").textContent = "AISLE — " + (S.env.aisle==="cold"?"COLD":"HOT") + (S.env.tilesOpen?" · tiles open":" · tiles shut");
  const arrA=$("arrA"), arrB=$("arrB");
  const aOk = S.env.rowA==="right";           // Row A front faces aisle (right)
  const bOk = S.env.rowB==="left";            // Row B front faces aisle (left)
  arrA.setAttribute("points", aOk ? "204,340 204,368 222,354" : "204,340 204,368 186,354");
  arrB.setAttribute("points", bOk ? "342,340 342,368 324,354" : "342,340 342,368 360,354");
  arrA.classList.toggle("ok", aOk); arrB.classList.toggle("ok", bOk);
  $("lockA").setAttribute("opacity", S.rack.lockable?1:0);
  $("lockB").setAttribute("opacity", S.rack.lockable?1:0);
  $("cut1").classList.toggle("sealed", S.env.cutoutsSealed);
  $("cut2").classList.toggle("sealed", S.env.cutoutsSealed);
  const spots={cold:"spotCold",hot:"spotHot",floor:"spotLeak",ceiling:"spotCeil"};
  Object.keys(spots).forEach(k=>$(spots[k]).classList.toggle("placed", !!S.env.sensors[k]));
  $("eqCrac1").classList.toggle("on", S.env.crac1);
  $("eqCrac1").setAttribute("opacity", S.env.crac1?1:0.35);
  $("eqCrac2").setAttribute("opacity", S.env.crac2?1:0.35);
  $("eqCrac2").classList.toggle("on", S.env.crac2);
  $("ledTemp").classList.toggle("on", envInBand());
  $("ledTemp").classList.toggle("err", !envInBand());
  const spo = spofCount();
  $("ledSpo").classList.toggle("err", spo>0);
  $("ledSpo").classList.toggle("on", spo===0);
  $("eqUps").classList.toggle("on", !!S.power.upsModel);
  $("eqGen").classList.toggle("on", S.power.gen && S.power.ats);
  document.querySelectorAll("#roommap .noz").forEach(n=>n.classList.toggle("armed", S.env.fire==="clean"));
  const t = S.env.therm + (aisleOk()?0:3.2);
  $("mapTemp").textContent = t.toFixed(1)+" °C · "+S.env.rh+" % RH"+(aisleOk()?"":" ⚠ airflow");
}

/* ---------- console router ---------- */
function renderConsole(){
  const host = document.getElementById("consolePanel");
  if(!host || !S || !S.mode) return;
  const fns = {briefing:cBriefing, rack:cRack, power:cPower, climate:cClimate, signoff:cSignoff};
  const fn = fns[S.tab] || cBriefing;
  const titles = {briefing:"Briefing & site board", rack:"Rack Works", power:"Power Works", climate:"Climate Works", signoff:"Sign-off Desk"};
  host.innerHTML = `<div class="console panel">
    <div class="panel-h"><span class="tick"></span><h2>${titles[S.tab]}</h2>
      <span class="ph-note">${S.mode==="H"?"NIGHT SHIFT · strict validation":"DAY SHIFT · guided"}</span></div>
    <div class="panel-b">${fn()}</div></div>`;
}

/* ---------- punch list ---------- */
function renderPunch(){
  const host=document.getElementById("punchList"); if(!host) return;
  const ids=curObjs();
  const isH = S.mode==="H";
  host.innerHTML = ids.map(id=>{
    const m=OBJMETA[id], st=objState(id);
    const stars = st.done ? "★".repeat(st.stars)+"☆".repeat(3-st.stars) : "";
    const hintBtn = !isH
      ? `<button class="btn sm" data-action="hint" data-id="${id}" ${st.done?"disabled":""}>Hint (${3-st.hints} left)</button>`
      : (st.hints===0 && !st.done ? `<button class="btn sm" data-action="hint" data-id="${id}">Emergency nudge (−1 star)</button>` : "");
    const parts = st.parts ? `<div class="o-parts">${st.parts.map(p=>
        `<div class="pp"><span class="pm ${p.ok?"ok":"no"}">${p.ok?"✓":"✗"}</span><span>${esc(p.label)}</span></div>`).join("")}</div>` : "";
    return `<div class="obj-card ${st.done?"done":""}" id="punch-${id}">
      <div class="o-top"><span class="pillar ${m.pillar}">${{U:"UNDERSTAND",R:"RECOGNIZE",D:"DETECT",M:"MITIGATE"}[m.pillar]}</span>
        <span class="o-title">${esc(m.title)}</span>
        ${st.done?`<span class="chip green">${stars}</span>`:`<span class="chip">open</span>`}</div>
      <div class="o-desc">${esc(m.desc)}</div>
      <div class="o-act">
        <button class="btn sm amber" data-action="set-tab" data-tab="${m.console}">Open ${ {briefing:"Briefing",rack:"Rack Works",power:"Power Works",climate:"Climate Works",signoff:"Sign-off Desk"}[m.console] }</button>
        <button class="btn sm" data-action="check" data-id="${id}" ${st.done?"disabled":""}>Check results</button>
        ${hintBtn}</div>
      ${hintHtml(id)}
      ${st.fb?`<div class="o-fb">${esc(st.fb)}</div>`:""}
      ${parts}</div>`;
  }).join("");
  const doneCount = ids.filter(id=>objState(id).done).length;
  const t=document.getElementById("punchTitle");
  if(t) t.textContent = `Punch list — ${doneCount}/${ids.length} signed`;
  const allDone = doneCount===ids.length;
  const fin = document.getElementById("finishWrap");
  if(fin) fin.hidden = !allDone;
}

/* ---------- progress ---------- */
function updateProgress(){
  const ids=curObjs(); const done=ids.filter(id=>objState(id).done).length;
  const pct = ids.length? Math.round(done/ids.length*100):0;
  const C=119.4;
  document.getElementById("ringFg").style.strokeDashoffset = String(C*(1-pct/100));
  document.getElementById("ringTxt").textContent = pct+"%";
  document.getElementById("objCount").textContent = `OBJECTIVES ${done}/${ids.length}`;
  document.getElementById("punchBadge").textContent = done;
  document.getElementById("punchBadge2").textContent = done;
  if(lastDoneCount>=0 && done!==lastDoneCount){
    announce(done===ids.length ? `All ${ids.length} objectives complete. Sign-off is unlocked on the Sign-off Desk.` : `Objective progress: ${done} of ${ids.length} complete.`);
  }
  lastDoneCount = done;
  const stars=ids.reduce((s,id)=>s+(objState(id).done?objState(id).stars:0),0);
  const maxS=ids.length*3;
  const quizPct = (S.quizBest==null)?0:Math.round(S.quizBest);
  const score = Math.round((maxS? stars/maxS*70:0) + quizPct*0.30);
  return {done, total:ids.length, stars, maxS, quizPct, quizBest:S.quizBest, score};
}

/* ---------- refresh ---------- */
function refresh(){ renderMap(); renderConsole(); renderPunch(); updateProgress(); save(); }

/* ---------- boot / mode entry ---------- */
function enterLab(){
  document.getElementById("splash").hidden = true;
  document.getElementById("lab").hidden = false;
  const chip=document.getElementById("modeChip");
  chip.textContent = S.mode==="H" ? "HARD · NIGHT SHIFT" : "MEDIUM · DAY SHIFT";
  chip.className = "chip " + (S.mode==="H"?"red":"amber");
  document.getElementById("punchTitle").textContent = S.mode==="H" ? "Punch list — night shift" : "Punch list";
  lastDoneCount = curObjs().filter(id=>objState(id).done).length;
  refresh();
}
function selectMode(mode){
  S = defaultState();
  S.mode = mode; S.startedAt = Date.now();
  save(); enterLab();
  announce(mode==="H" ? "Hard mode started: night-shift sign-off under strict validation." : "Medium mode started: guided commissioning.");
}
/* ================= CONSOLE RENDERERS ================= */

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function sel(field, opts, val, label){
  return `<select class="sel" data-field="${field}" aria-label="${esc(label||field)}">` +
    opts.map(o=>`<option value="${esc(o[0])}" ${String(val)===String(o[0])?"selected":""}>${esc(o[1])}</option>`).join("") + `</select>`;
}
function tglBtn(action, attrs, pressed, title, sub){
  return `<button class="tgl" role="switch" aria-pressed="${pressed?"true":"false"}" data-action="${action}" ${attrs}>
    <span class="sw" aria-hidden="true"></span><span class="tl">${title}${sub?`<small>${sub}</small>`:""}</span></button>`;
}
function objChips(ids){
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:2px">` + ids.map(id=>{
    const st=objState(id);
    return `<span class="chip ${st.done?"green":""}" title="${esc(OBJMETA[id].title)}">OBJ ${id} ${st.done?"✓":""}</span>`;
  }).join("") + `</div>`;
}
function punchNudge(){ return `<button class="btn sm" data-action="open-punch">Open punch list to check results</button>`; }
function meter(pct, cls, cap){
  return `<div class="meter ${cls||""}">${cap!=null?`<span class="cap" style="left:${cap}%"></span>`:""}<i style="width:${Math.max(0,Math.min(100,pct))}%"></i></div>`;
}

/* ---------------- BRIEFING ---------------- */
function cBriefing(){
  const hard = S.mode==="H";
  ensureMatchOrder(false);
  const scenario = hard
    ? `<p><strong>02:00, Sunday.</strong> Go-live is Monday 06:00 and the contractor's punch list doesn't match reality. The CRAC just logged a compressor fault. You have the room, the consoles below, and nobody to ask — commission Room 104 and clear the night's tickets. Validation is strict: exact values, no hints (one emergency nudge costs a star).</p>`
    : `<p><strong>Thursday, day shift.</strong> Ridgeline Utilities Cooperative (fictional) finishes Building C this week. Room C-104 must pass <em>commissioning sign-off</em> before Monday 06:00 go-live. Work the consoles below in any order — the punch list tracks 12 objectives with hints and coaching feedback.</p>`;
  const terms = S.matchOrder.terms.map(tid=>{
    const t = MATCH_TERMS.find(x=>x.id===tid);
    const matched = S.match[t.id];
    return `<button class="tm ${matched?"matched":""} ${PICK.matchTerm===t.id?"picked":""}" data-action="match-term" data-id="${t.id}" ${matched?"":''}>
      <span class="t-key">${esc(t.term)}</span>${matched?" ✓":""}</button>`;
  }).join("");
  const defs = S.matchOrder.defs.map(did=>{
    const owner = Object.keys(S.match).find(k=>S.match[k]===did);
    const t = MATCH_TERMS.find(x=>x.id===did);
    return `<button class="tm ${owner?"matched":""}" data-action="match-def" data-id="${did}">
      ${owner?`<span class="t-key">${esc(MATCH_TERMS.find(x=>x.id===owner).term)}</span> = `:""}${esc(t.def)}</button>`;
  }).join("");
  return `
  ${objChips(S.mode==="H"?["H1"]:["M1"])}
  <div class="card"><h4>Scenario briefing</h4>${scenario}
    <p class="fine">Training data notice: organization, tickets and readings are fictional. Simplified teaching figures: 1U = 1.75 in; 80 % circuit rule; PF 0.8; 18–27 °C / 40–60 % RH band; Cat6 bend radius ≈ 4× outside diameter.</p></div>

  <div class="card"><h4>Knowledge core — the three facets of objective 2.4</h4>
    <div class="kv"><dt>Installation implications</dt><dd><strong>Where and how you install.</strong> The MDF is the primary comms room where service entrances land; IDFs are downstream closets that home to it. Rack size is planned in rack units (1U = 1.75 in). Gear breathes front-to-back (port-side intake/exhaust), so orientation and panel placement matter. Copper lands on a patch panel, fiber on a fiber distribution panel, and the rack itself should be lockable.</dd>
    <dt>Power</dt><dd><strong>Keeping energized gear energized.</strong> The UPS bridges outages instantly on battery; the PDU distributes that power to rack outlets. Power load (watts) decides circuit counts — keep each circuit at ≤80 % continuous load (simplified) — and voltage (typically 120 V rack circuits in North America, simplified) decides the math.</dd>
    <dt>Environmental factors</dt><dd><strong>The room as a system.</strong> Temperature (simplified band 18–27 °C) and humidity (40–60 % RH: below = ESD, above = condensation) are monitored at the air the gear breathes. Fire suppression in occupied equipment rooms favors clean agents (simplified) over water. Hot/cold-aisle arrangement, blanking panels and sealed cutouts keep conditioned air moving through gear instead of around it.</dd></div>
    <p class="fine" style="margin-top:8px">Real-world anchors: ASHRAE TC 9.9 thermal guidelines, TIA-942 datacenter standard, NEC branch-circuit practice, TIA-606 labeling — all used here in simplified form.</p></div>

  <div class="card"><h4>Site vocabulary board ${S.mode==="M"?"(OBJ M1)":"(reference)"}</h4>
    <p>Pick a term, then its definition. Matched pairs lock green.</p>
    <div class="match-grid"><div class="match-col">${terms}</div><div class="match-col">${defs}</div></div>
    <div style="margin-top:10px;display:flex;gap:8px"><button class="btn sm" data-action="match-reset">Clear matches</button>${punchNudge()}</div></div>`;
}

/* ---------------- RACK WORKS ---------------- */
function cRack(){
  const rr = rackRules();
  const slots = [];
  for(let i=14;i>=0;i--){
    const id = S.rack.slots[i];
    const d = id?DEV(id):null;
    slots.push(`<button class="slot" data-dev="${id||""}" data-action="slot" data-i="${i}"
      aria-label="Rack unit ${i+1}${d?": "+esc(d.name)+", click to remove":" empty, click to place selected device"}">
      <span class="u-tag">U${i+1}</span><span class="d-name">${d?esc(d.name)+(d.u>1?" ▼":""):"— empty —"}</span>
      ${d?`<span class="u-tag">✕</span>`:""}</button>`);
  }
  const pal = DEVICES.map(d=>`<button class="dev-chip ${PICK.dev===d.id?"picked":""}" data-action="pick-dev" data-id="${d.id}"
      aria-pressed="${PICK.dev===d.id?"true":"false"}" aria-label="Select ${esc(d.name)}">
      <span class="dn">${esc(d.name)}</span>
      <span class="ds">${d.u}U · ${d.w}W · ${d.psu===2?"dual PSU":d.psu===1?"single PSU":"no PSU"} · ${d.kg} kg</span></button>`).join("");
  const rules = `<ul class="rules">${rr.map(r=>`<li class="${r.ok?"ok":""}"><span class="dot">${r.ok?"✓":"…"}</span>${esc(r.label)}</li>`).join("")}</ul>`;
  const drill = DRILL.map(d=>`<div style="margin-bottom:10px"><p style="margin-bottom:6px">${esc(d.q)}</p>
    ${sel("drill."+d.k, d.opts, S.drill[d.k]||"", d.q)}</div>`).join("");
  return `
  ${objChips(S.mode==="H"?["H2"]:["M4","M7"])}
  <div class="card"><h4>Rack elevation editor</h4>
    <p>${S.mode==="H"?"The work order you audited got several of these rules wrong — build it right.":"Click a device chip to select it, then click a rack slot to place it. Click placed gear to remove it."}</p>
    <div class="rack-flex">
      <div><div class="rack-head">15U WALL-MOUNT RACK · ROOM C-104</div><div class="rack-col">${slots.join("")}</div></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><div class="rack-head">DEVICE PALETTE</div><div class="palette">${pal}</div>
          <div style="margin-top:10px;display:flex;gap:8px"><button class="btn sm" data-action="clear-rack">Unrack everything</button>
          ${tglBtn("toggle-lock","",S.rack.lockable,"Lockable doors","physical security for the rack")}</div></div>
        <div class="note amber"><strong>Elevation rules (live):</strong>${""}</div>${rules}
      </div></div></div>
  <div class="card"><h4>Cable &amp; standards drill (OBJ M7)</h4>
    <div class="note">Floor-plan evidence: “Room C-104 is the building's only comms room; wiring closets on floors 2–5 home-run to it. ISP fiber entrance lands in C-104.”</div>
    <div style="margin-top:10px">${drill}</div>${punchNudge()}</div>`;
}

/* ---------------- POWER WORKS ---------------- */
function cPower(){
  const isH = S.mode==="H";
  const rem = SEQ_POWER.filter(x=>!S.seq.power.includes(x.id));
  const steps = S.seq.power.map((id,i)=>`<div class="seq-step"><span class="num">${i+1}</span>${esc(SEQ_POWER.find(x=>x.id===id).label)}
    <button class="btn sm ghost" data-action="seq-remove" data-list="power" data-i="${i}" aria-label="Remove step ${i+1}">✕</button></div>`);
  const slots = SEQ_POWER.map((x,i)=>`<div class="seq-slot">${steps[i]||`<span class="fine">slot ${i+1}</span>`}</div>`).join("");
  const ledger = IT_DEVICE_IDS.map(id=>`<tr><td style="padding:2px 8px">${esc(DEV(id).name)}</td><td style="padding:2px 8px;text-align:right;font-family:var(--mono)">${DEV(id).w} W</td><td style="padding:2px 8px;font-family:var(--mono)">${DUAL_IDS.includes(id)?"A + B":"A or B"}</td></tr>`).join("");
  const upsW = S.power.upsModel? Number(UPS_MODELS.find(m=>m.v===S.power.upsModel).label.match(/(\d+) W/)[1]) : 0;
  const upsPct = upsW? upsW/2600*100 : 0;
  const needPct = UPS_MIN_W/2600*100;
  const la = feedLoad("A"), lb = feedLoad("B");
  const clsA = la>CIRCUIT_USABLE?"over":(la>CIRCUIT_USABLE*0.9?"warn":"");
  const clsB = lb>CIRCUIT_USABLE?"over":(lb>CIRCUIT_USABLE*0.9?"warn":"");
  const spo = spofCount();
  const psuCards = DUAL_IDS.map(id=>`<div class="psu-card"><div class="pn">${esc(DEV(id).name)}</div><div class="pw">${DEV(id).w} W · dual PSU — split across feeds</div>
    <div class="psu-row"><span>PSU-A</span>${sel("power.wiring."+id+".a",[["","—"],["A","Feed A"],["B","Feed B"]],(S.power.wiring[id]||{}).a||"","PSU A feed for "+DEV(id).name)}</div>
    <div class="psu-row"><span>PSU-B</span>${sel("power.wiring."+id+".b",[["","—"],["A","Feed A"],["B","Feed B"]],(S.power.wiring[id]||{}).b||"","PSU B feed for "+DEV(id).name)}</div></div>`).join("") +
    SINGLE_IDS.map(id=>`<div class="psu-card"><div class="pn">${esc(DEV(id).name)}</div><div class="pw">${DEV(id).w} W · single PSU — assign one feed</div>
    <div class="psu-row"><span>Feed</span>${sel("power.wiring."+id+".s",[["","—"],["A","Feed A"],["B","Feed B"]],(S.power.wiring[id]||{}).s||"","Feed for "+DEV(id).name)}</div></div>`).join("");
  return `
  ${objChips(isH?["H3","H7"]:["M2","M5","M11"])}
  <div class="card"><h4>Power chain builder ${isH?"(inside OBJ H3)":"(OBJ M2)"}</h4>
    <p>Order the path from the utility to a device's power supply. Click a tray item to place it in the next slot; click a placed step to remove it.</p>
    <div class="seq-tray" style="margin:8px 0">${rem.length?rem.map(x=>`<button class="btn sm" data-action="seq-add" data-list="power" data-id="${x.id}">${esc(x.label)}</button>`).join(""):"<span class='fine'>tray empty — all steps placed</span>"}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">${slots}</div></div>

  <div class="card"><h4>Load ledger (auto-computed)</h4>
    <table style="width:100%;font-size:13px"><thead><tr><th style="text-align:left">Device</th><th style="text-align:right">Draw</th><th style="text-align:left">PSUs</th></tr></thead><tbody>${ledger}</tbody>
    <tfoot><tr><td style="padding:4px 8px"><strong>IT load total</strong></td><td style="padding:4px 8px;text-align:right;font-family:var(--mono)"><strong>${itLoad()} W</strong></td><td></td></tr></tfoot></table></div>

  <div class="card"><h4>UPS &amp; circuit sizing ${isH?"(OBJ H3)":"(OBJ M5)"}</h4>
    <div class="note amber">Simplified sizing rules: UPS watts = VA × 0.8 · leave ≥25 % headroom (load × 1.25) · circuits carry ≤80 % continuously (15 A × 120 V × 0.8).</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:10px">
      <label>IT load in watts (type the number)<input type="number" inputmode="numeric" data-field="power.loadW" value="${esc(S.power.loadW)}" aria-label="Total IT load in watts"></label>
      <label>UPS model${sel("power.upsModel",[["","— select —"]].concat(UPS_MODELS.map(m=>[m.v,m.label])),S.power.upsModel,"UPS model")}</label>
      <label>Usable watts on ONE 15 A / 120 V circuit<input type="number" inputmode="numeric" data-field="power.circuitW" value="${esc(S.power.circuitW)}" aria-label="Usable watts per circuit"></label>
      <label>Circuit voltage${sel("power.volt",[["","— select —"],["120","120 V"],["208","208 V three-phase"],["24","−48 VDC"]],S.power.volt,"Circuit voltage")}</label>
    </div>
    <div style="margin-top:10px"><div class="meter-row"><span>UPS W</span>${meter(upsPct,"",needPct)}<span>${upsW} / need ${UPS_MIN_W} W</span></div>
    <p class="fine">Marker line = load × 1.25 headroom requirement.</p></div></div>

  <div class="card"><h4>Feeds A/B, PSUs &amp; redundancy ${isH?"(OBJ H3 + H7)":"(OBJ M11)"}</h4>
    <div class="spo ${spo===0?"zero":"some"}"><span class="cnt">${spo}</span><span>single points of failure ${spo===0?"— room can survive any one loss":"— eliminate them all"}</span></div>
    <div class="meter-row" style="margin-top:10px"><span>FEED A</span>${meter(la/1800*100,clsA,80)}<span>${la} / ${CIRCUIT_USABLE} W</span></div>
    <div class="meter-row" style="margin-top:6px"><span>FEED B</span>${meter(lb/1800*100,clsB,80)}<span>${lb} / ${CIRCUIT_USABLE} W</span></div>
    <p class="fine">Bar cap line = 80 % guideline (1440 W). Split gear draws half its watts from each feed.</p>
    <div class="psu-grid" style="margin-top:10px">${psuCards}</div>
    <div class="tgl-grid" style="margin-top:10px">
      ${tglBtn("toggle-power","data-k=\"spd\"",S.power.spd,"Surge protection (SPD) at service entrance","clamps voltage transients")}
      ${tglBtn("toggle-power","data-k=\"gen\"",S.power.gen,"Standby generator","minutes-to-hours outages")}
      ${tglBtn("toggle-power","data-k=\"ats\"",S.power.ats,"Automatic transfer switch","switches to generator automatically")}
    </div>${punchNudge()}</div>`;
}

/* ---------------- CLIMATE WORKS ---------------- */
function cClimate(){
  const isH = S.mode==="H";
  const airOk = aisleOk();
  const rows = [["A","rowA"],["B","rowB"]].map(([n,k])=>`
    <div class="card" style="background:var(--panel3)"><h4>Row ${n} front</h4>
      <p>${S.env[k]===(k==="rowA"?"right":"left")?"facing the aisle ✓":"facing the wall ✗"}</p>
      <button class="btn sm" data-action="toggle-row" data-row="${k}">Flip row ${n} front</button></div>`).join("");
  const logRows = (isH? LOG_CONTEXT_HARD.concat(LOG_EVENTS, LOG_CONTEXT_HARD2) : LOG_EVENTS);
  const classifiable = isH ? LOG_CONTEXT_HARD.length : 0; // hard: classification starts after 2 context lines
  const log = `<ul class="loglist">${logRows.map((e,idx)=>{
    const ci = idx-classifiable;
    if(e.ctx) return `<li><span class="lt">${e.t}</span><span>${esc(e.txt)}</span><span class="fine" style="text-align:right">context — no action</span></li>`;
    return `<li id="tri-li-${ci}"><span class="lt">${e.t}</span><span>${esc(e.txt)}</span>
      ${sel("triage.c"+ci, TRIAGE_OPTS, S.triage["c"+ci]||"", "Classify event "+e.t)}</li>`;
  }).join("")}</ul>`;
  const recov = isH ? `<div class="card"><h4>Night incident — CRAC-1 down (OBJ H6)</h4>
    <div class="note red"><strong>02:00 — CRAC-1 compressor fault.</strong> Intake reads 31.2 °C and climbing. The failed unit stays offline; bring the room back into spec with CRAC-2 and the airflow/setpoint state, then run the recovery simulation.</div>
    <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="btn amber" data-action="run-recovery">Run recovery simulation</button>
      <span class="chip ${S.env.recovered?"green":""}">${S.env.recovered?"RECOVERED — intake back in band":"NOT YET RECOVERED"}</span></div></div>` : "";
  return `
  ${objChips(isH?["H4","H5","H6"]:["M6","M8","M9","M10"])}
  <div class="card"><h4>Airflow &amp; aisle arrangement ${isH?"":"(OBJ M6)"}</h4>
    <p>Air travels front-to-back through gear. Fronts must face the aisle; the aisle must be COLD with vent tiles open; cutouts sealed so cold air doesn't escape under the floor.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:8px">${rows}</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <span class="fine">Aisle mode:</span>
      <button class="btn sm ${S.env.aisle==="hot"?"amber":""}" data-action="set-aisle" data-v="hot">HOT aisle</button>
      <button class="btn sm ${S.env.aisle==="cold"?"amber":""}" data-action="set-aisle" data-v="cold">COLD aisle</button>
      ${tglBtn("toggle-env","data-k=\"tilesOpen\"",S.env.tilesOpen,"Perforated vent tiles","feed conditioned air into the aisle")}
      ${tglBtn("toggle-env","data-k=\"cutoutsSealed\"",S.env.cutoutsSealed,"Seal cable cutouts","stop under-floor bypass")}
    </div>
    <p style="margin-top:8px" class="${airOk?"fine":"note red"}">${airOk?"Intake path complete: fronts → cold aisle → through gear → hot aisle → CRAC.":"Airflow path incomplete — fix rows / aisle / tiles / cutouts (watch the map arrows)."} CRAC-1 ${S.env.crac1?"running":"OFFLINE"} · CRAC-2 ${S.env.crac2?"running (N+1 engaged)":"standby"}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      ${tglBtn("toggle-crac","data-k=\"crac1\"",S.env.crac1,"CRAC-1","primary cooling unit")}
      ${tglBtn("toggle-crac","data-k=\"crac2\"",S.env.crac2,"CRAC-2","redundant (N+1) unit")}</div></div>

  <div class="card"><h4>Setpoints &amp; thresholds ${isH?"(OBJ H5)":"(OBJ M9)"}</h4>
    <div class="meter-row"><span>THERM</span><input type="range" min="16" max="32" step="0.5" data-field="env.therm" value="${S.env.therm}" aria-label="Thermostat setpoint"><span id="readTherm">${S.env.therm.toFixed(1)} °C</span></div>
    <div class="meter-row" style="margin-top:6px"><span>RH %</span><input type="range" min="25" max="75" step="1" data-field="env.rh" value="${S.env.rh}" aria-label="Relative humidity setpoint"><span id="readRh">${S.env.rh} %</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px">
      <label>Alert if temp BELOW (°C)<input type="number" step="0.5" data-field="env.tLo" value="${esc(S.env.tLo)}" aria-label="Low temperature alert threshold"></label>
      <label>Alert if temp ABOVE (°C)<input type="number" step="0.5" data-field="env.tHi" value="${esc(S.env.tHi)}" aria-label="High temperature alert threshold"></label>
      <label>Alert if RH BELOW (%)<input type="number" step="1" data-field="env.hLo" value="${esc(S.env.hLo)}" aria-label="Low humidity alert threshold"></label>
      <label>Alert if RH ABOVE (%)<input type="number" step="1" data-field="env.hHi" value="${esc(S.env.hHi)}" aria-label="High humidity alert threshold"></label></div>
    <p class="fine" style="margin-top:6px">Simplified guidance band: 18–27 °C, 40–60 % RH. Current setpoints ${envInBand()?"are inside the band ✓":"are OUTSIDE the band ⚠"}.</p></div>

  <div class="card"><h4>Sensors &amp; fire suppression ${isH?"":"(OBJ M8)"}</h4>
    <p>Place sensors on the map (dashed circles) or here: monitor the air the gear breathes, where water gathers, and the ceiling.</p>
    <div class="tgl-grid">
      ${tglBtn("toggle-sensor","data-k=\"cold\"",S.env.sensors.cold,"Temp/RH sensor — cold-aisle intake","what the gear breathes")}
      ${tglBtn("toggle-sensor","data-k=\"hot\"",S.env.sensors.hot,"Temp sensor — hot aisle","optional (return-air view)")}
      ${tglBtn("toggle-sensor","data-k=\"floor\"",S.env.sensors.floor,"Leak sensor — under floor near CRAC","catches water before gear does")}
      ${tglBtn("toggle-sensor","data-k=\"ceiling\"",S.env.sensors.ceiling,"Smoke sensor — ceiling","early fire detection")}</div>
    <div style="margin-top:10px"><p>Fire suppression for this OCCUPIED equipment room (simplified):</p>
      ${sel("env.fire",[["","— select —"],["wet","Wet sprinklers over the racks"],["clean","Clean-agent system"],["none","No suppression, insurance only"]],S.env.fire,"Fire suppression type")}</div></div>

  ${recov}
  <div class="card"><h4>Sensor &amp; UPS event log ${isH?"(OBJ H4)":"(OBJ M10)"}</h4>
    ${isH?`<div class="note red">Night log — noisy on purpose. Lines marked “context” are informational; classify the six monitored events. Three of the six are routine noise.</div>`:""}
    <div style="margin-top:8px">${log}</div>
    <div style="margin-top:10px"><p><strong>Root cause of the temperature climb:</strong></p>
      ${sel("triage.cause", CAUSE_OPTS, S.triage.cause, "Root cause of temperature climb")}</div>
    ${isH?`<div style="margin-top:10px"><label for="justBox">One-line justification for the shift lead (mention what failed):</label>
      <textarea id="justBox" class="evidence" style="width:100%;min-height:60px;margin-top:6px" data-field="hardJust" aria-label="Justification for shift lead">${esc(S.hardJust)}</textarea></div>`:""}
    ${punchNudge()}</div>`;
}

/* ---------------- SIGN-OFF DESK ---------------- */
function cSignoff(){
  const isH = S.mode==="H";
  const rem = SEQ_PLAN.filter(x=>!S.seq.plan.includes(x.id));
  const steps = S.seq.plan.map((id,i)=>`<div class="seq-step"><span class="num">${i+1}</span>${esc(SEQ_PLAN.find(x=>x.id===id).label)}
    <button class="btn sm ghost" data-action="seq-remove" data-list="plan" data-i="${i}" aria-label="Remove plan step ${i+1}">✕</button></div>`);
  const slots = SEQ_PLAN.map((x,i)=>`<div class="seq-slot">${steps[i]||`<span class="fine">slot ${i+1}</span>`}</div>`).join("");
  const incs = INCIDENTS.filter(x=>isH||!x.hard).map(x=>{
    const v = S.incidents[x.id]||"";
    // Medium = coaching (instant right/wrong on the card); Hard = strict (no reveal — check via punch list)
    const okCls = (!isH && v) ? (v===x.ans?"sel-ok":"sel-bad") : "";
    return `<div class="inc-card ${okCls}"><h5>${esc(x.title)}</h5><p>${esc(x.txt)}</p>
      ${sel("incidents."+x.id, [["","— choose the control —"]].concat(x.opts), v, "Mitigation for "+x.title)}</div>`;
  }).join("");
  const wo = WORKORDER.map((l,i)=>`<label class="wo-line ${S.wo.includes(i)?"picked":""}">
      <input type="checkbox" data-action="wo-toggle" data-line="${i}" ${S.wo.includes(i)?"checked":""} aria-label="Mark line ${i+1} as a violation">
      <span class="ln">L${i+1}</span><span>${esc(l.txt)}</span></label>`).join("");
  const exam = EXAM.map(e=>{
    if(e.type==="num") return `<div style="margin-bottom:10px"><p style="margin-bottom:6px">${esc(e.q)}</p>
      <input type="number" step="any" data-field="exam.${e.k}" value="${esc(S.exam[e.k]||"")}" aria-label="${esc(e.q)}"></div>`;
    return `<div style="margin-bottom:10px"><p style="margin-bottom:6px">${esc(e.q)}</p>${sel("exam."+e.k, [["","— select —"]].concat(e.opts), S.exam[e.k]||"", e.q)}</div>`;
  }).join("");
  const prog = updateProgress();
  return `
  ${objChips(isH?["H1","H8","H9"]:["M3","M12"])}
  <div class="card"><h4>Commissioning plan ${isH?"":"(OBJ M3)"}</h4>
    <p>Order the six steps from site verification to sign-off. Click a tray item to place it; click a placed step to remove it.</p>
    <div class="seq-tray" style="margin:8px 0">${rem.length?rem.map(x=>`<button class="btn sm" data-action="seq-add" data-list="plan" data-id="${x.id}">${esc(x.label)}</button>`).join(""):"<span class='fine'>tray empty — all steps placed</span>"}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px">${slots}</div></div>
  ${isH?`
  <div class="card"><h4>OBJ H1 — audit the contractor work order</h4>
    <div class="note red">Six of the ten lines violate good installation practice. Two more are CORRECT but look suspicious (red herrings). Check only the violating lines.</div>
    <div style="margin-top:10px">${wo}</div></div>
  <div class="card"><h4>OBJ H9 — sign-off exam (exact answers)</h4>${exam}</div>`:""}
  <div class="card"><h4>Incident tickets ${isH?"(OBJ H8 — 6 tonight)":"(OBJ M12)"}</h4>
    <p>Pick the correct control for each ticket. ${isH?"One of them cannot be fixed with hardware.":""}</p>
    <div class="inc-grid" style="margin-top:8px">${incs}</div></div>
  <div class="card" id="finishWrap"><h4>Sign-off</h4>
    <p>${prog.done===prog.total? "Every objective on the punch list is signed. Open the commissioning certificate.":"Punch list: "+prog.done+" / "+prog.total+" objectives signed. Finish them all to unlock the certificate."}</p>
    <div style="margin-top:8px"><button class="btn amber" data-action="finish-open" ${prog.done===prog.total?"":"disabled"}>Sign off &amp; finish</button>
    <button class="btn" data-action="quiz-open">Take the knowledge check</button></div></div>`;
}
