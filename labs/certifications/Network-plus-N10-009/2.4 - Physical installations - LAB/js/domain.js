/* ============================================================
   js/domain.js — derived rules and math shared by the renderers and
   the CHECK RESULTS validators (loads, SPOF counter, rack rules,
   environment band, airflow state).
   ============================================================ */
"use strict";
/* ---------- derived environment math ---------- */
function DEV(id){ return DEVICES.find(d=>d.id===id); }
function itLoad(){ return IT_DEVICE_IDS.reduce((s,id)=>s+DEV(id).w,0); }
function feedLoad(feed){
  let sum=0;
  DUAL_IDS.forEach(id=>{
    const w = S.power.wiring[id]||{};
    const a = w.a, b = w.b;
    if(a===feed && b===feed) sum += DEV(id).w;
    else if(a===feed || b===feed) sum += DEV(id).w/2;
  });
  SINGLE_IDS.forEach(id=>{ const w=S.power.wiring[id]||{}; if(w.s===feed) sum+=DEV(id).w; });
  return Math.round(sum);
}
function spofCount(){
  let n=0;
  DUAL_IDS.forEach(id=>{ const w=S.power.wiring[id]||{}; if(w.a!=="" && w.a===w.b) n++; });
  SINGLE_IDS.forEach(id=>{ const w=S.power.wiring[id]||{}; if(!w.s) n++; });
  if(!S.power.spd) n++;
  if(!S.power.gen || !S.power.ats) n++;
  if(!S.power.upsModel) n++;
  return n;
}
function rackRanges(){
  const s=S.rack.slots, out={};
  s.forEach((id,i)=>{ if(id && id!=="blank"){ if(!out[id]) out[id]=[i,i]; else out[id][1]=i; } });
  return out;
}
function rackRules(){
  const s=S.rack.slots, rr=rackRanges();
  const required=["ups2","srv1","srv2","stor","sw","rtr","kvm","pp","fdp","cm"];
  const allPl = required.every(id=>rr[id]);
  const r1 = s[0]==="ups2";
  const heavyLow = ["srv1","srv2","stor"].every(id=>rr[id] && rr[id][1]<=7);
  const adj = rr.sw && rr.pp && Math.abs(rr.sw[0]-rr.pp[0])===1;
  let top=-1; s.forEach((id,i)=>{ if(id) top=i; });
  let contig = top>=0; for(let i=0;i<=top;i++){ if(!s[i]){contig=false;break;} }
  return [
    {k:"all", label:"All 10 required devices placed (2 blanking panels fill the remainder)", ok:allPl},
    {k:"r1",  label:"UPS sits on the floor (bottom of the rack)", ok:r1},
    {k:"r2",  label:"Servers & storage live in the bottom 8U (heavy-low rule)", ok:heavyLow},
    {k:"r3",  label:"Patch panel is directly adjacent to the core switch", ok:!!adj},
    {k:"r4",  label:"No open gaps — every U below the top device is filled", ok:contig},
    {k:"r5",  label:"Lockable doors enabled", ok:!!S.rack.lockable}
  ];
}
function envInBand(){
  return S.env.therm>=18 && S.env.therm<=27 && S.env.rh>=40 && S.env.rh<=60;
}
function aisleOk(){
  return S.env.rowA==="right" && S.env.rowB==="left" && S.env.aisle==="cold" && S.env.tilesOpen && S.env.cutoutsSealed;
}
