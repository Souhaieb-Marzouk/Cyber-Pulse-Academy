/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   State store, persistence (localStorage key unchanged), mode selection.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

/* ---------- state ---------- */
function defaultState(){
  return {
    ver:1, mode:null,
    objs:{ medium:{}, hard:{} },
    quiz:{ medium:{answers:{},submitted:false,score:null}, hard:{answers:{},submitted:false,score:null} },
    env:{
      snoopingSW1:false, snoopingSW2:false, querier:false, directedFwd:false, wolException:false,
      stormCtrl:false, anymon:false,
      edgeDown:{ "EDGE-SIN":false, "EDGE-FRA":false, "EDGE-NYC":false },
      groups:{ "G-IPTV":[], "G-TICK":[] },
      flagIndex:{}, history:[]
    },
    noc:{ runs:{}, hardApplied:false },
    bench:{ m7vlan:"",m7cause:"",m9control:"",m9reason:"",
      h2domains:"",h2recipients:"",h2crosses:"",h2reach:"",
      h3v10:"",h3v20:"",h3v30:"",h3peak:"",h4thr:"",h4win:"",h4Tested:false,
      h5mode:"",h6reason:"",h7:{},h8s1:"",h8s2:"",h8s3:"",h8s4:"",h9order:[],
      h10group:"",h10purpose:"",m11:"" },
    match:{}, ev:{ cls:{}, anomaly:"", anomalyReason:"" },
    seen:{ modeSelected:false, lastStation:"briefing", certSeen:{} },
    lsOk:true, savedAt:null
  };
}
let state = defaultState();
function save(){ try{ state.savedAt=Date.now(); localStorage.setItem(LAB_KEY, JSON.stringify(state)); state.lsOk=true; }
  catch(e){ state.lsOk=false; } }
function load(){ try{ const raw=localStorage.getItem(LAB_KEY); if(raw){ const p=JSON.parse(raw);
    const d=defaultState(); state={...d,...p, env:{...d.env,...(p.env||{})}, noc:{...d.noc,...(p.noc||{})},
      bench:{...d.bench,...(p.bench||{})}, ev:{...d.ev,...(p.ev||{})}, seen:{...d.seen,...(p.seen||{})},
      objs:{medium:(p.objs&&p.objs.medium)||{},hard:(p.objs&&p.objs.hard)||{}},
      quiz:{medium:{...d.quiz.medium,...(p.quiz&&p.quiz.medium||{})},hard:{...d.quiz.hard,...(p.quiz&&p.quiz.hard||{})}}};
    state.env.flagIndex = state.env.flagIndex||{}; state.env.history = state.env.history||[];
    // migrate pre-audit saves: certSeen was a single boolean shared by both shifts
    if(typeof state.seen.certSeen==="boolean") state.seen.certSeen = state.seen.certSeen ? {medium:true} : {};
  } }catch(e){ state=defaultState(); state.lsOk=false; } }

/* ---------- mode handling ---------- */
function applyMode(){
  const m = state.mode;
  document.documentElement.setAttribute("data-theme", m==="hard" ? "night" : "day");
  const plate=$("#shiftPlate");
  plate.textContent = "SHIFT: " + (m==="hard" ? "NIGHT" : m==="medium" ? "DAY" : "—");
  $$("[data-only-medium]").forEach(el=>el.hidden = (m!=="medium"));
  $$("[data-only-hard]").forEach(el=>el.hidden = (m!=="hard"));
  const bank = m ? QUIZ[m] : [];
  $("#quizLede").textContent = m==="hard"
    ? "Seven scenario items — application, not recall. Pick, submit, then read why. Efficiency and accuracy drive the stars."
    : "Seven concept checks in exam style. Answer, submit, and read the explanation after each — the “why” is the point.";
  renderRail(); renderOrders(); renderQuiz(); renderBinder(); renderMatcher(); updateMeter();
}
function openModeOverlay(){ $("#modeOverlay").hidden=false; const c=$("#modeOverlay .modecard.day"); if(c) c.focus(); }
function pickMode(m){
  state.mode=m; state.seen.modeSelected=true;
  applyMode(); save(); $("#modeOverlay").hidden=true;
  showStation(state.seen.lastStation||"briefing");
  announce((m==="hard"?"Night shift":"Day shift")+" started. Work orders loaded.");
}

/* ---------- rail / stations ---------- */
