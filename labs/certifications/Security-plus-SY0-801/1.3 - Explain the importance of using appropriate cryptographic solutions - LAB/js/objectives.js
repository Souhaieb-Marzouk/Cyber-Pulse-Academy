"use strict";

/* ============================================================================
   js/objectives.js — objective engine: ledger rendering, hint ladder (3 tiers
   Medium / 1 nudge Hard), CHECK RESULTS validation, post-pass answer lock (R2).
   ============================================================================ */

function objState(id){ return state.obj[id] || {attempts:0,hints:0,firstTry:null,done:false}; }

function renderLedger(){
  const list = $("#ledgerList");
  list.innerHTML = "";
  MODE_DEFS[state.mode].forEach(o=>{
    const st = objState(o.id);
    const card = document.createElement("div");
    card.className = "objCard" + (st.done ? " done" : "");
    card.id = "led-"+o.id;
    const fb = document.createElement("div");
    fb.className = "objFb"; fb.id = "ledfb-"+o.id;
    const pillar = {P1:"p1",P2:"p2",P3:"p3",P4:"p4"}[o.pillar];
    card.innerHTML =
      '<div class="ocTop"><span class="pillar '+pillar+'">'+o.pillar+'</span><span class="oTitle"><b>'+o.id+'</b> · '+escapeHtml(o.title)+'</span></div>'+
      '<div class="ocState"><button class="btn btn-sm" data-check="'+o.id+'">Check results</button>'+
      '<button class="btn-ghost btn-sm" data-hint="'+o.id+'">'+(state.mode==="medium" ? "Hint (3 tiers)" : "Nudge (costs score)")+'</button>'+
      '<span class="stateTxt">'+(st.done ? "✓ completed" : (st.attempts ? st.attempts+" attempt"+(st.attempts>1?"s":"") : "unchecked"))+'</span></div>';
    card.appendChild(fb);
    list.appendChild(card);
  });
  list.querySelectorAll("[data-check]").forEach(b=>b.addEventListener("click", ()=>checkObjective(b.dataset.check)));
  list.querySelectorAll("[data-hint]").forEach(b=>b.addEventListener("click", ()=>showHint(b.dataset.hint)));
}

function objFeedback(id, ok, msg){
  const fb = $("#ledfb-"+id);
  if(fb){ fb.className = "objFb " + (ok ? "ok" : "bad"); fb.textContent = msg; }
  announce((ok? "Objective passed: " : "Check failed: ") + msg);
}

function showHint(id){
  const o = MODE_DEFS[state.mode].find(x=>x.id===id);
  if(!state.obj[id]) state.obj[id] = {attempts:0,hints:0,firstTry:null,done:false};
  const st = state.obj[id];
  if(st.done){ objFeedback(id, true, "Already completed — no hints needed."); return; }
  const maxHints = state.mode==="medium" ? 3 : 1;
  if(st.hints >= maxHints){
    objFeedback(id, false, state.mode==="medium" ? "Hint ladder exhausted for this objective. Re-read the station panel; the answer is in the evidence." : "No more nudges in Hard mode. Work the dossier and station evidence.");
    return;
  }
  st.hints++;
  const h = o.hints[Math.min(st.hints-1, o.hints.length-1)];
  save(); renderLedger();
  objFeedback(id, false, "HINT " + st.hints + "/" + maxHints + ": " + h);
}

function checkObjective(id){
  const o = MODE_DEFS[state.mode].find(x=>x.id===id);
  if(!o) return;
  if(!state.obj[id]) state.obj[id] = {attempts:0,hints:0,firstTry:null,done:false};
  const st = state.obj[id];
  const res = o.check(state.env);
  st.attempts++;
  if(res.pass && !st.done){
    st.done = true;
    st.firstTry = (st.attempts===1 && st.hints===0);
    renderLedger();
    applyLocks(id);
  }
  objFeedback(id, res.pass, res.msg);
  refreshLamps(); refreshDial(); refreshGuidance(); save();
}

/* ---------- glossary drawer ---------- */

const LOCK_MSG="This answer is locked after validation — use Reset lab to practice again.";

const KEY_OWNER={lane:["M1"],escrow:["M2"],escrowWhy:["M2"],ca:["M3"],ctype:["M4","H4"],rev:["M5"],symasym:["M6"],levels:["M7","H4"],proto:["M8"],kx:["M8"],kxwhy:["M8"],verdict:["M9"],halgo:["M9"],saltOn:["M10"],saltwhy:["M10"],sign:["M11"],props:["M11"],cal:["M12"],dossier:["H1"],h1class:["H1"],h2serial:["H2"],h2check:["H2"],h2root:["H2"],h2seq:["H2"],posture:["H3"],postwhy:["H3"],h5verdict:["H5"],h5ctrl:["H5"],h6vuln:["H6"],h6fix:["H6"],h7seq:["H7"],mitre:["H8"],props9:["H9"]};

const LOCK_SELECTORS={M1:[".taskCard .assign button"],M2:["[data-escrow]","[data-escrowwhy]"],M3:["[data-ca]"],M4:["[data-type]"],M5:["[data-rev]"],M6:["[data-symasym]"],M7:["#levelBoard select"],M8:["[data-proto]","[data-kx]","[data-kxwhy]"],M9:["[data-verdict]","[data-halgo]"],M10:["#saltToggle","[data-saltwhy]"],M11:["#signPool button",".propsGrid input"],M12:["#calBoard select","#calEscrowBtn"],H1:["[data-finding]","[data-h1class]"],H2:["#h2serial","[data-h2check]","[data-h2root]","#h2pool button"],H3:["#postureBoard select","[data-postwhy]"],H4:["#levelBoard select","[data-type]"],H5:["[data-h5verdict]","[data-h5ctrl]"],H6:["[data-h6vuln]","[data-h6fix]"],H7:["#h7pool button"],H8:["#mitreBoard select"],H9:["#propBoard select"]};

function isKeyLocked(key){ return (KEY_OWNER[key]||[]).some(id=>state.obj[id]&&state.obj[id].done); }

function applyLocks(objId){ (LOCK_SELECTORS[objId]||[]).forEach(sel=>$$(sel).forEach(elm=>{ elm.disabled=true; elm.classList.add("locked"); })); }
