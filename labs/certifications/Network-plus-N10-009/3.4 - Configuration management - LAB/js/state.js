'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — state + persistence
   Single plain-JS state object `S`, saved wholesale to localStorage under
   LSKEY on every mutation. load() merges a saved payload over a fresh
   state so new fields never break old saves. Same key and same
   save/restore/reset semantics as the original lab.
   ===================================================================== */
const LSKEY = 'kvta-cfglab-v1';

const freshEnv = () => ({
  selDev:'KV-EDGE-RTR-01', openFile:null, viewed:{}, rsCompare:{},
  comp:{dev:'KV-EDGE-RTR-01', a:'edge-gold', b:'edge-run'}, compRuns:{},
  tags:{'edge-gold':'','edge-b1':'','edge-b2':'','edge-rog':''},
  classify:{}, m1:{p:'',b:'',g:''},
  monitor:{dev:'',ref:'',freq:'',act:'',watch:false},
  fwJob:{sched:'',dest:'',ret:'',test:'',alert:false},
  polJob:{freq:'',alert:'',retry:'',storage:'',test:''},
  storage:'', seq:{m9:[],m11:[],h5:[]}, h5why:'',
  m4:{count:'',name:''}, m7:'',
  h1:{dev:'',cause:'',clue:''}, h2:{user:'',log:'',subnet:''},
  h3:{file:'',why:''}, h7:{d:{},r:{}}, h8:[], h9:{lessons:[],risk:''}
});

const freshState = () => ({ mode:null, obj:{}, env:freshEnv(),
  quiz:{answers:{},submitted:false,score:0}, finished:false, openObj:null });

let S = freshState();

function save(){ try{ localStorage.setItem(LSKEY, JSON.stringify(S)); }catch(e){} }

function load(){ try{ const raw=localStorage.getItem(LSKEY); if(!raw) return false;
  const p=JSON.parse(raw); if(p && p.mode && p.env){ S=Object.assign(freshState(),p);
    S.env=Object.assign(freshEnv(),p.env); return true; } }catch(e){} return false; }

/* Wipe saved progress (used by RESET and by "Run the other mode"). */
function clearSaved(){ try{ localStorage.removeItem(LSKEY); }catch(e){} }
