/* ===== js/objectives.js — objective registry + CHECK RESULTS engine =====
   Field rules (exact/norm/oneOf/set/seq/range), environment-state rules,
   the 2.4 GHz plan validator, pillar metadata and progress counters. */

'use strict';

/* ---------- check engine ---------- */
function checkField(rule, val){
  const m=rule.mode;
  if(m==='exact'||m==='norm'){ return norm(val)===norm(rule.v); }
  if(m==='oneOf'){ return (rule.v||[]).some(x=>norm(x)===norm(val)); }
  if(m==='set'){
    const got=(val||[]).map(norm).sort(); const want=(rule.v||[]).map(norm).sort();
    return got.length===want.length && got.every((x,i)=>x===want[i]);
  }
  if(m==='seq'){ const got=(val||[]).map(norm); const want=(rule.v||[]).map(norm); return got.length===want.length && got.every((x,i)=>x===want[i]); }
  if(m==='range'){ const n=parseFloat(val); return !isNaN(n) && n>=rule.v[0] && n<=rule.v[1]; }
  return false;
}


function checkEnvK(s){
  const val=env[s.k];
  if(s.mode==='eq') return norm(val)===norm(s.v);
  if(s.mode==='oneOf') return (s.v||[]).some(x=>norm(x)===norm(val));
  if(s.mode==='range'){ const n=parseFloat(val); return !isNaN(n)&&n>=s.v[0]&&n<=s.v[1]; }
  if(s.mode==='plan24') return plan24Check().ok;
  return false;
}


function plan24Check(){
  const names=['CAFE1','CAFE2','ROAST1','ROAST2','ROAST3'];
  const ch={}; const bad=[];
  names.forEach(n=>{ const c=parseInt(env['apChan_'+n],10); ch[n]=c; if(!(c>=1&&c<=11)) bad.push(n); });
  const pairs=[['CAFE1','CAFE2'],['ROAST1','ROAST2'],['ROAST1','ROAST3'],['ROAST2','ROAST3']];
  pairs.forEach(p=>{ if(Math.abs(ch[p[0]]-ch[p[1]])<5) { bad.push(p[0]); bad.push(p[1]); } });
  if(env.width24!=='20') bad.push('WIDTH');
  if(!env.bandSteer) bad.push('STEER');
  return { ok:bad.length===0, bad:bad };
}


function runCheck(obj){
  const st=objState(obj.id);
  const bad=[];
  const c=obj.check||{};
  if(c.fields){ Object.keys(c.fields).forEach(fid=>{ if(!checkField(c.fields[fid], st.answers[fid])) bad.push(fid); }); }
  if(c.state){ c.state.forEach(s=>{ if(!checkEnvK(s)) bad.push('state:'+s.k); }); }
  return {ok:bad.length===0, bad:bad};
}


/* ===== CKCR SIGNAL BENCH — app shell: bays, objectives, quiz, clipboard, modals ===== */'use strict';
const PILLARS={P1:['UNDERSTAND','#b18cf0'], P2:['RECOGNIZE','#ffb347'], P3:['DETECT','#5aa7e8'], P4:['MITIGATE','#43d98c']};


function order(){ return state.mode==='medium'? ORDER_MED : ORDER_HARD; }


function list(){ return state.mode==='medium'? OBJ_MED : OBJ_HARD; }


function allPassed(){ return order().every(id=>objState(id).passed); }


function hintsUsed(){ return order().reduce((a,id)=>a+(objState(id).hints||0),0); }


function failedChecks(){ return order().reduce((a,id)=>a+(objState(id).attempts||0),0); }
