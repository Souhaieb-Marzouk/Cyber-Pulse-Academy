'use strict';
/* =====================================================================
   STATE — the lab store
   ===================================================================== */
/* =====================================================================
   STATE — lab state, persistence (same STORE_KEY as the original),
   DOM helpers, derived fault state. Topology map & inspector cards live in ui.js.
   ===================================================================== */
const STORE_KEY = 'cyberlab-cv0004-62-v1';
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let S = null;           // lab state
let currentObjIdx = 0;  // guided ladder pointer (Medium)

function freshState(mode){
  const faults = Object.assign({}, FAULT_SETS[mode]);
  return {
    v: 1, mode, startedAt: Date.now(),
    config: initialConfig(faults),
    objs: {}, learn: { methodOrder: [], toolPairs: {} },
    flowClass: {}, drill: {},
    quiz: { idx: 0, answers: [], done: false, picked: null },
    activity: { cmds: [], inspected: {}, curls: {}, pingByIp: false, scpOk: false },
    finish: { done: false, stars: null, firstTryRate: 0, quizPct: 0, hintsUsed: 0 },
    ui: { tab: mode === 'medium' ? 'objectives' : 'bench', src: mode === 'hard' ? 'shoppers' : 'web1', selNode: null }
  };
}
function objState(id){
  if(!S.objs[id]) S.objs[id] = { done:false, attempts:0, firstTry:false, hintLevel:0, locked:false, ans:{} };
  return S.objs[id];
}
/* Deterministic permutation for option-order rotation (R4): same seed → same order,
   so persisted answers (stored by original index) stay valid across reloads. */
function seededPerm(seed, n){
  let h = 2166136261;
  for(let i = 0; i < seed.length; i++){ h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const rand = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const arr = Array.from({ length: n }, (_, i) => i);
  for(let i = n - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
  return arr; // arr[displayPosition] = original index
}
function save(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch(e){ /* degrade gracefully */ }
}
function loadSaved(){
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    return (s && s.v === 1 && s.mode) ? s : null;
  } catch(e){ return null; }
}
function announce(msg){ const el = $('#sr'); if(el){ el.textContent = msg; } }
let toastTimer = null;
function toast(msg){
  const t = $('#toast'); if(!t) return;
  t.innerHTML = `<span>${esc(msg)}</span><button class="toastX" type="button" aria-label="Dismiss notification">×</button>`;
  t.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 4200);
}
function markInspected(key){ S.activity.inspected[key] = true; save(); }

/* ---------------- derived fault state (single source of truth) ---------------- */
function sgHas(sgId, dir, proto, port, sources){
  const sg = S.config.sgs[sgId]; if(!sg) return false;
  return sg.rules.some(r => r.d === dir && r.p === proto && r.a <= port && r.b >= port &&
    (sources === null || sources.some(x => r.s === x)));
}
function routeHas(rtId, dest, target){
  const rt = S.config.routes[rtId]; if(!rt) return false;
  return rt.rows.some(r => r.d === dest && (target === null || r.t === target));
}
function naclEphemeralWide(){
  return S.config.nacls['nacl-app'].inR.some(r => r.p === 'tcp' && r.a <= 1024 && r.b >= 65535);
}
const F = {
  sgDb:   () => sgHas('sg-db','in','tcp',5432,['sg-web','10.20.0.0/16']),
  nat:    () => routeHas('rt-private','0.0.0.0/0','nat-gw-a'),
  nacl:   () => naclEphemeralWide(),
  dnsApi: () => S.config.dns.records['api.orbitcart.internal'] === '10.20.2.47',
  lb:     () => S.config.lb.hcPort === 8080 && S.config.lb.hcPath === '/healthz',
  mtu:    () => S.config.vpn.mtu === 1436,
  tgw:    () => S.config.tgw.attach.prod && S.config.tgw.attach.stage && S.config.tgw.attach.analytics && S.config.tgw.propagate,
  cert:   () => !!S.config.cert.renewed,
  dhcp:   () => S.config.dhcp.pods.dns === '10.20.0.10' && S.config.dhcp.pods.poolEnd >= 200,
  dnsPay: () => S.config.dns.records['payments.orbitcart.internal'] === '10.20.3.54',
  sgPay:  () => sgHas('sg-pay','in','tcp',8443,['sg-pod','10.20.8.0/24','10.20.0.0/16']),
  vlan:   () => S.config.bridge.vlan === 40
};
function lbHealthyCount(){
  const n = F.lb() ? 2 : 0;
  return n;
}
function podIp(){
  return F.dhcp() ? '10.20.8.33' : '169.254.3.14';
}
