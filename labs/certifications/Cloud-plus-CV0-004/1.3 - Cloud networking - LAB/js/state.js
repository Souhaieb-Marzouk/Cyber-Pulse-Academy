/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* State store, persistence (localStorage), toasts/announcements, overlay helpers, mode switching, DOM/escape utilities */
const LS_KEY = "cyberlab-cv0004-l13-v1";
/* ============================ CORE (state, persistence) ============================ */
function pristineWorld(){
  return {
    vpc:{cidr:null, igw:false},
    subnets:{
      "PUBLIC-WEB-A":{cidr:null,az:null,type:null},
      "PUBLIC-WEB-B":{cidr:null,az:null,type:null},
      "APP-A":{cidr:null,az:null,type:null},
      "DB-A":{cidr:null,az:null,type:null}
    },
    rts:{
      "PUBLIC-RT":{routes:[]},
      "APP-RT":{routes:[]},
      "DB-RT":{routes:[]},
      "STAGE-RT":{routes:[{dst:"0.0.0.0/0",tgt:"NAT-GW-STAGE"}]}
    },
    nat:{deployed:false, subnet:null},
    cgw:{ip:null},
    vgw:{attached:false},
    vpn:{exists:false, ike:null, routing:null, asn:null, tunnelA:"DISABLED", tunnelB:"DISABLED"},
    peer:{requested:false, accepted:false},
    sg:{
      "SG-WEB":{rules:[]},
      "SG-APP":{rules:[]},
      "SG-DB":{rules:[]},
      "SG-STAGE":{rules:[{port:"0-65535",src:"SG-STAGE"}]}
    },
    nacl:{
      "NACL-PUBLIC":{in:[],out:[]},
      "NACL-APP":{in:[],out:[]}
    },
    dns:{zone:null, assoc:false, records:[]},
    monitor:{flowLogs:false, vpnAlarms:false},
    edge:{routes:[]}
  };
}
function hardWorld(){
  const w = pristineWorld();
  w.vpc = {cidr:"10.10.0.0/16", igw:true};
  w.subnets = {
    "PUBLIC-WEB-A":{cidr:"10.10.1.0/24", az:"AZ-1", type:"public"},
    "PUBLIC-WEB-B":{cidr:"10.10.2.0/24", az:"AZ-2", type:"public"},
    "APP-A":{cidr:"10.10.11.0/24", az:"AZ-1", type:"private"},
    "DB-A":{cidr:"10.10.21.0/24", az:"AZ-1", type:"isolated"}
  };
  w.rts["PUBLIC-RT"].routes = [{dst:"0.0.0.0/0", tgt:"IGW"}];
  w.rts["APP-RT"].routes = [{dst:"0.0.0.0/0", tgt:"NAT-GW"}, {dst:"192.168.50.0/24", tgt:"VGW"}, {dst:"10.20.0.0/16", tgt:"PEER"}];
  w.rts["DB-RT"].routes = [];                       // FAULT: replication route missing
  w.nat = {deployed:true, subnet:"PUBLIC-WEB-A"};
  w.cgw = {ip:"203.0.113.10"};
  w.vgw = {attached:true};
  w.vpn = {exists:true, ike:"IKEv2", routing:"STATIC", asn:null, tunnelA:"UP", tunnelB:"DISABLED"}; // FAULTS
  w.peer = {requested:true, accepted:true};
  w.rts["STAGE-RT"].routes = [{dst:"0.0.0.0/0", tgt:"NAT-GW-STAGE"}]; // FAULT: peer route missing
  w.sg["SG-WEB"].rules = [{port:"22",src:"0.0.0.0/0"},{port:"3389",src:"0.0.0.0/0"},{port:"443",src:"0.0.0.0/0"}]; // FAULT
  w.sg["SG-APP"].rules = [{port:"8443",src:"SG-WEB"},{port:"8443",src:"SG-APP"},{port:"8443",src:"SG-STAGE"}];
  w.sg["SG-DB"].rules = [{port:"5432",src:"10.20.0.0/16"}]; // FAULT
  w.nacl["NACL-PUBLIC"] = {in:[{rule:"100",act:"ALLOW",port:"443"}], out:[{rule:"120",act:"ALLOW",port:"1024-65535"}]};
  w.nacl["NACL-APP"] = {in:[{rule:"100",act:"ALLOW",port:"8443"}], out:[]}; // FAULT: no ephemeral out
  w.dns = {zone:"meridian.internal", assoc:true, records:[{name:"db", type:"A", ip:"10.10.21.99"}]}; // FAULT stale
  w.monitor = {flowLogs:false, vpnAlarms:false};
  w.edge.routes = [{dst:"10.10.0.0/16", tgt:"VPN"}];
  return w;
}

let S = null;
let toastTimer = null;
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){ /* degrade gracefully */ }
}
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    if(!s || !s.mode || !s.world) return null;
    return s;
  }catch(e){ return null; }
}
function toast(msg){
  const t = document.getElementById("toast");
  t.innerHTML = `<span>${esCape(msg)}</span><button type="button" aria-label="Dismiss notification">✕</button>`;
  t.style.display = "flex";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.display = "none"; }, 2600);
}
function announce(msg){
  const el = document.getElementById("live");
  el.textContent = "";
  setTimeout(()=>{ el.textContent = msg; }, 30);
}
function restoreFocus(){
  const op = window.__opener;
  if(op && document.body.contains(op)){ try{ op.focus(); }catch(e){} }
  window.__opener = null;
}
function closeTopOvl(){
  const on = document.querySelectorAll(".ovl.on");
  const top = on.length ? on[on.length-1] : null;
  if(!top || top.id === "ovlGate") return false;
  top.classList.remove("on");
  restoreFocus();
  return true;
}
function setMode(mode, fresh){
  S.mode = mode;
  S.world = (mode === "H") ? hardWorld() : pristineWorld();
  S.objs = {}; S.quiz = {i:0, answers:[], done:false};
  S.ui = {sel:null, tab:"traffic", gateDismissed:true};
  S.finished = false;
  save();
  renderAll();
  if(fresh) announce(mode === "M" ? "Medium mode started. Guided deployment, 12 objectives." : "Hard mode started. Break-fix investigation, 9 objectives, noisy alerts.");
}

/* ---------- small helpers ---------- */
function esCape(s){ return (s||"").toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function $id(x){ return document.getElementById(x); }
