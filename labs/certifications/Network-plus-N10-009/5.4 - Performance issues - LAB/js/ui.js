/* ===== js/ui.js — bench panels, SVG instruments, objective widgets =====
   Deterministic shuffles (R6), charts (utilization, spectrum, channel view,
   traceroute ladder), bay panels and every objective widget builder. */

'use strict';

/* ---------- deterministic shuffle (R6: display order must never reveal answers) ---------- */
function hashStr(str){ let h=7; const s=String(str); for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } return (h%997)+13; }


function seededShuffle(arr, seed){
  const a=arr.slice(); let s=seed>>>0 || 1;
  const rnd=()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; };
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}


function shufOpts(key, opts){
  const head=opts.filter(o=>o[0]===''); const rest=opts.filter(o=>o[0]!=='');
  return head.concat(seededShuffle(rest, hashStr(key)));
}


/* ---------- SVG builders ---------- */
function bump(h,c,w,a){ return a*Math.exp(-Math.pow(h-c,2)/(2*w*w)); }


function utilVal(link,h){
  const day=Math.exp(-Math.pow(h-12.2,2)/14);
  switch(link){
    case 'HQ-INET':   return Math.min(99, 22+33*day+bump(h,10,.3,44)+bump(h,18,1.5,6));
    case 'WAN-1':     return Math.min(99, 12+26*day+bump(h,12.5,.8,10));
    case 'DC-LINK':   return Math.min(99, 6+7*day+bump(h,2.25,.75,79));
    case 'ROAST-INET':return Math.min(99, 10+26*day+bump(h,12.5,.9,9));
    case 'KIOSK-LINK':return Math.min(99, 18+26*day+bump(h,12,3.2,52));
  }
  return 20;
}


function utilChart(){
  const W=760,H=250,P={l:44,r:10,t:14,b:26};
  const xs=h=>P.l+(h/24)*(W-P.l-P.r), ys=v=>H-P.b-(v/100)*(H-P.t-P.b);
  let grid='';
  for(let v=0;v<=100;v+=25){ grid+='<line x1="'+P.l+'" y1="'+ys(v)+'" x2="'+(W-P.r)+'" y2="'+ys(v)+'" stroke="#1d242e" stroke-width="1"/>'+'<text x="'+(P.l-6)+'" y="'+(ys(v)+3)+'" fill="#8d8778" font-size="9" font-family="ui-monospace,monospace" text-anchor="end">'+v+'%</text>'; }
  for(let h=0;h<=24;h+=3){ grid+='<text x="'+xs(h)+'" y="'+(H-8)+'" fill="#8d8778" font-size="9" font-family="ui-monospace,monospace" text-anchor="middle">'+String(h).padStart(2,'0')+':00</text>'; }
  const zones=[[1.5,3,'#5aa7e8','backup window'],[9.75,10.25,'#ffb347','congestion event'],[11.5,13,'#43d98c','lunch RF window']];
  let zoneRects='';
  zones.forEach(z=>{ zoneRects+='<rect x="'+xs(z[0])+'" y="'+P.t+'" width="'+(xs(z[1])-xs(z[0]))+'" height="'+(H-P.t-P.b)+'" fill="'+z[2]+'" opacity="0.07"/><text x="'+((xs(z[0])+xs(z[1]))/2)+'" y="'+(P.t+11)+'" fill="'+z[2]+'" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle" opacity="0.8">'+z[3]+'</text>'; });
  const series=[['HQ-INET','#ffb347',2],['KIOSK-LINK','#ff6b6b',1.6],['DC-LINK','#5aa7e8',1.6],['WAN-1','#43d98c',1.2],['ROAST-INET','#b18cf0',1]];
  let paths='';
  series.forEach(s=>{ let d=''; for(let i=0;i<=288;i++){ const h=i/12; const v=utilVal(s[0],h); d+=(i===0?'M':'L')+xs(h).toFixed(1)+' '+ys(v).toFixed(1)+' '; } paths+='<path d="'+d+'" fill="none" stroke="'+s[1]+'" stroke-width="'+s[2]+'" opacity="0.9"/>'; });
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="24-hour synthetic utilization chart: HQ-INET spikes to about 97 percent between 09:45 and 10:15; DC-LINK spikes to about 91 percent during the 01:30 to 03:00 backup window; KIOSK-LINK runs at about 96 percent from 09:00 to 15:00.">'+grid+zoneRects+paths+'</svg>';
}


function chCenter(ch){ return 2412+(parseInt(ch,10)-1)*5; }


function spectrumSVG(lunch){
  const W=520,H=150,P={l:34,r:8,t:10,b:22};
  const x=m=>P.l+((m-2400)/100)*(W-P.l-P.r);
  const y=v=>H-P.b-Math.max(0,(v+100)/60)*(H-P.t-P.b);
  let grid='';
  [2412,2437,2462,2484].forEach(m=>{ grid+='<line x1="'+x(m)+'" y1="'+P.t+'" x2="'+x(m)+'" y2="'+(H-P.b)+'" stroke="#1d242e"/><text x="'+x(m)+'" y="'+(H-6)+'" fill="#8d8778" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle">'+m+'</text>'; });
  grid+='<text x="'+(P.l-4)+'" y="'+(P.t+8)+'" fill="#8d8778" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="end">dBm</text>';
  const aps=APS.map(a=>({ch:parseInt(env['apChan_'+a.n.replace('AP-','')],10)||a.ch, rssi:a.rssi, n:a.n}));
  let curves='';
  aps.forEach(a=>{ const c=chCenter(a.ch); const amp=8+((a.rssi+100)/60)*34; let d='M '+x(2400)+' '+y(-88)+' ';
    for(let m=2400;m<=2500;m+=2){ const w=10; const v=-88+amp*Math.exp(-Math.pow(m-c,2)/(2*w*w)); d+='L '+x(m).toFixed(1)+' '+y(v).toFixed(1)+' '; }
    curves+='<path d="'+d+'" fill="none" stroke="#43d98c" stroke-width="1.4" opacity="0.85"/><text x="'+x(c)+'" y="'+(P.t+9)+'" fill="#43d98c" font-size="8" font-family="ui-monospace,monospace" text-anchor="middle">'+a.n.replace('AP-','')+'·ch'+a.ch+'</text>'; });
  let noise='';
  if(lunch){
    let d='M '+x(2400)+' '+y(-86)+' ';
    for(let m=2400;m<=2500;m+=2){ const v=-86+bump(m,2458,14,52)+bump(m,2430,4,6); d+='L '+x(m).toFixed(1)+' '+y(v).toFixed(1)+' '; }
    noise='<path d="'+d+'" fill="none" stroke="#ff6b6b" stroke-width="1.4" stroke-dasharray="3 2"/><text x="'+x(2458)+'" y="'+(P.t+22)+'" fill="#ff6b6b" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle">MICROWAVE BURSTS 2.45 GHz</text>';
  } else {
    let d='M '+x(2400)+' '+y(-86)+' ';
    for(let m=2400;m<=2500;m+=2){ const v=-86+bump(m,2458,8,4); d+='L '+x(m).toFixed(1)+' '+y(v).toFixed(1)+' '; }
    noise='<path d="'+d+'" fill="none" stroke="#5aa7e8" stroke-width="1.2" opacity="0.8"/>';
  }
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Synthetic 2.4 GHz spectrum sweep'+(lunch?' during lunch: strong burst energy around 2.45 GHz from the microwave':' at idle: quiet noise floor')+'">'+grid+noise+curves+'</svg>';
}


function chanBars(){
  const W=560,H=170,P={l:14,r:8,t:16,b:24};
  const x=ch=>P.l+((chCenter(ch)-2412)/72)*(W-P.l-P.r);
  const h=r=>Math.max(6,(r+100)/60)*(H-P.t-P.b);
  let g='';
  for(let c=1;c<=13;c++){ g+='<line x1="'+x(c)+'" y1="'+P.t+'" x2="'+x(c)+'" y2="'+(H-P.b)+'" stroke="#1a212b"/><text x="'+x(c)+'" y="'+(H-7)+'" fill="#8d8778" font-size="9" font-family="ui-monospace,monospace" text-anchor="middle">'+c+'</text>'; }
  const y0=H-P.b;
  const sites={CAFE1:'cafe',CAFE2:'cafe',ROAST1:'roast',ROAST2:'roast',ROAST3:'roast'};
  const chans={}; APS.forEach(a=>{ chans[a.n.replace('AP-','')]=parseInt(env['apChan_'+a.n.replace('AP-','')],10)||a.ch; });
  function apColor(key){
    for(const other in chans){ if(other===key||sites[other]!==sites[key]) continue;
      if(Math.abs(chans[key]-chans[other])<5 || chans[key]>11) return '#ff6b6b'; }
    const a=APS.find(x=>x.n==='AP-'+key);
    return (a&&a.snr<15)? '#ffb347' : '#43d98c';
  }
  APS.forEach(a=>{ const key=a.n.replace('AP-',''); const ch=chans[key];
    const col=apColor(key);
    const w=18;
    g+='<rect x="'+(x(ch)-w/2)+'" y="'+(y0-h(a.rssi))+'" width="'+w+'" height="'+h(a.rssi)+'" rx="2" fill="'+col+'" opacity="0.75"/>';
    g+='<text x="'+x(ch)+'" y="'+(y0-h(a.rssi)-4)+'" fill="'+col+'" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle">'+a.n.replace('AP-','')+' '+a.rssi+'dBm</text>'; });
  g+='<text x="'+P.l+'" y="'+(P.t-2)+'" fill="#8d8778" font-size="8.5" font-family="ui-monospace,monospace">2.4 GHz · channel → · bar height = RSSI</text>';
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Synthetic Wi-Fi analyzer view: APs plotted per channel; overlaps visible between AP-CAFE1 on channel 6 and AP-CAFE2 on channel 10, and co-channel AP-ROAST1 and AP-ROAST2 both on channel 1.">'+g+'</svg>';
}


function ladderHTML(list, scale){
  const max=scale||Math.max.apply(null,list.map(r=>r.rtt));
  return '<div class="ladder">'+list.map(r=>'<div class="ladder-row'+(r.badge?' bad':'')+'">'+
    '<span class="ladder-hop">'+r.hop+'</span><span class="ladder-host">'+r.host+'<span class="dim"> '+r.ip+'</span>'+(r.badge?'<span class="badge-hop">'+r.badge.toUpperCase()+'</span>':'')+'</span>'+
    '<span class="ladder-bar"><i style="width:'+Math.max(3,(r.rtt/max)*100)+'%"></i></span>'+
    '<span class="ladder-rtt">'+r.rtt+' ms</span></div>').join('')+'</div>';
}


/* ---------- widget builders ---------- */
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }


function optList(id, opts, val){ return '<div class="opt-list">'+opts.map(o=>'<label class="opt"><input type="radio" name="'+id+'" value="'+o[0]+'"'+(String(val)===String(o[0])?' checked':'')+'><span>'+o[1]+'</span></label>').join('')+'</div>'; }


function bindField(inp, objId, fid, kind){
  const st=objState(objId);
  const ev=kind==='text'?'input':'change';
  inp.addEventListener(ev, ()=>{
    if(inp.disabled) return;
    if(kind==='multi'){ st.answers[fid]=Array.from(inp.querySelectorAll('input:checked')).map(i=>i.value); }
    else if(kind==='radio'){ const r=inp.querySelector('input:checked'); if(r&&r.disabled) return; st.answers[fid]= r? r.value : undefined; }
    else { st.answers[fid]=inp.value; }
    inp.classList.remove('ok','bad'); save();
  });
}


function wSelectGrid(obj, w){
  const st=objState(obj.id);
  const sameBank=w.rows.length>1 && w.rows.every(r=>r.opts===w.rows[0].opts);
  const viewRows=(sameBank && obj.id!=='OBJ-H1') ? seededShuffle(w.rows, hashStr(obj.id)) : w.rows; // R6: no answer runs; alarm feed keeps chronology
  const bank=sameBank ? shufOpts(obj.id, w.rows[0].opts) : null;
  const rows=viewRows.map(r=>{
    const cur=st.answers[r.id]||'';
    const lbl=r.raw? r.label : '<b>'+r.label+'</b>'+(r.src?' <span class="synth-tag">'+r.src+'</span>':'');
    const opts=bank || shufOpts(obj.id+'_'+r.id, r.opts);
    const sel='<select data-field="'+r.id+'" aria-label="'+r.label.replace(/<[^>]*>/g,'').slice(0,60)+'">'+opts.map(o=>'<option value="'+o[0]+'"'+(String(cur)===String(o[0])?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
    return '<div class="tri-row"><div class="sym">'+lbl+'</div>'+sel+'</div>';
  }).join('');
  const root=el('<div class="tri-grid">'+rows+'</div>');
  root.querySelectorAll('select').forEach(s=>bindField(s, obj.id, s.dataset.field, 'select'));
  return root;
}


function wOrder(obj, w){
  const st=objState(obj.id);
  const bankItems=seededShuffle(w.items, hashStr(obj.id)); // R6: bank order ≠ answer order
  const root=el('<div><div class="order-slots">'+Array.from({length:w.slots}).map((_,i)=>'<div class="slot" data-i="'+i+'"><span class="slot-no">'+(i+1)+'</span><span class="slot-t">— empty —</span><button class="slot-clear" aria-label="clear slot '+(i+1)+'" hidden>✕</button></div>').join('')+'</div><div class="order-bank">'+bankItems.map(it=>'<button type="button" class="chip" data-id="'+it.id+'">'+it.t+'</button>').join('')+'</div><p class="kv" style="margin-top:8px">'+w.caption+'</p></div>');
  const seq=st.answers[w.field]||[];
  const slots=Array.from(root.querySelectorAll('.slot'));
  const chips={}; root.querySelectorAll('.chip').forEach(c=>{chips[c.dataset.id]=c;});
  function paint(){
    slots.forEach((s,i)=>{ const id=seq[i]; const it=w.items.find(x=>x.id===id);
      s.classList.toggle('filled', !!it);
      s.querySelector('.slot-t').textContent= it? it.t+(it.n?' — '+it.n:'') : '— empty —';
      const cb=s.querySelector('.slot-clear'); cb.hidden=!it;
      cb.onclick=()=>{ seq.splice(i,1); st.answers[w.field]=seq.slice(); save(); paint(); };
    });
    Object.keys(chips).forEach(id=>{ chips[id].disabled=seq.indexOf(id)>=0; });
  }
  root.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{ if(seq.length>=w.slots) return; seq.push(c.dataset.id); st.answers[w.field]=seq.slice(); save(); paint(); }));
  paint();
  return root;
}


function wMixed(obj, w){
  const st=objState(obj.id);
  const parts=w.fields.map(f=>{
    const cur=st.answers[f.id];
    const fopts=f.opts? shufOpts(f.id, f.opts) : null; // R6: shuffle option lists (text fields have none)
    if(f.kind==='select'){ const s='<div class="fld"><label class="fld-label" for="fld-'+f.id+'">'+f.label+'</label><select id="fld-'+f.id+'" data-field="'+f.id+'">'+fopts.map(o=>'<option value="'+o[0]+'"'+(String(cur)===String(o[0])?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'; return s; }
    if(f.kind==='text'){ return '<div class="fld"><label class="fld-label" for="fld-'+f.id+'">'+f.label+'</label><input type="text" id="fld-'+f.id+'" data-field="'+f.id+'" placeholder="'+(f.placeholder||'')+'" value="'+(cur?String(cur).replace(/"/g,'&quot;'):'')+'" autocomplete="off"></div>'; }
    if(f.kind==='multi'){ return '<div class="fld"><span class="fld-label">'+f.label+'</span><div class="opt-list" data-field="'+f.id+'">'+fopts.map(o=>'<label class="opt"><input type="checkbox" value="'+o[0]+'"'+((cur||[]).indexOf(o[0])>=0?' checked':'')+'><span>'+o[1]+'</span></label>').join('')+'</div></div>'; }
    return '';
  }).join('');
  const root=el('<div>'+parts+'</div>');
  root.querySelectorAll('select').forEach(s=>bindField(s, obj.id, s.dataset.field, 'select'));
  root.querySelectorAll('input[type="text"]').forEach(t=>bindField(t, obj.id, t.dataset.field, 'text'));
  root.querySelectorAll('.opt-list[data-field]').forEach(d=>bindField(d, obj.id, d.dataset.field, 'multi'));
  return root;
}


function wToggles(list){
  return '<div class="toggle-stack">'+list.map(t=>'<button type="button" class="sw" role="switch" aria-checked="'+(!!env[t.id])+'" data-env="'+t.id+'"><span class="track" aria-hidden="true"></span><span class="sw-label">'+t.label+'<span class="sw-note">'+(t.note||'')+'</span></span></button>').join('')+'</div>';
}


function bindToggles(root){
  root.querySelectorAll('.sw[data-env]').forEach(b=>{
    b.addEventListener('click',()=>{
      const k=b.dataset.env; env[k]=!env[k];
      if(k==='width20'){ env.width24=env[k]?'20':'40'; }
      b.setAttribute('aria-checked', String(!!env[k]));
      save(); refreshBayDynamic(); updateProgress();
    });
  });
}


function wConsole(obj, w){
  const root=el('<div><div class="console">'+wToggles(w.toggles)+'</div><div class="obj-actions" style="margin-top:10px"><button type="button" class="btn" data-apply="'+w.apply.fn+'">'+w.apply.label+'</button></div><div class="afterbox" data-after="'+w.apply.fn+'" hidden></div></div>');
  bindToggles(root);
  root.querySelector('[data-apply]').addEventListener('click',()=>{ APPLY[w.apply.fn](); const box=root.querySelector('[data-after]'); paintAfter(box, w.apply.fn); toast('Applied — verification readout updated below.'); });
  const fn=w.apply.fn; if(env.after[fn]){ paintAfter(root.querySelector('[data-after]'), fn); }
  return root;
}


function paintAfter(box, fn){
  const a=env.after[fn]; if(!a||!box) return;
  box.hidden=false;
  box.innerHTML='<div class="panel" style="border-color:#2f7d55"><div class="panel-head"><span class="dot"></span>'+a.title+'</div><div class="panel-body" style="padding-top:6px"><table class="ev">'+a.rows.map(r=>'<tr><td>'+r[0]+'</td><td><b class="td-ok">'+r[1]+'</b></td></tr>').join('')+'</table></div></div>';
}


function wAlarmEng(obj, w){
  const st=objState(obj.id);
  const sliders=w.sliders.map(s=>'<div class="fld"><span class="fld-label">'+s.label+'</span><div class="slider-row"><input type="range" id="sl-'+s.id+'-'+obj.id+'" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'" value="'+env[s.id]+'" aria-label="'+s.label+'"><span class="slider-val" id="sv-'+s.id+'-'+obj.id+'">'+env[s.id]+s.unit+'</span></div></div>').join('');
  const radio=w.radio? '<div class="fld"><span class="fld-label">'+w.radio.label+'</span><div class="opt-list" data-field="'+w.radio.id+'">'+shufOpts(w.radio.id, w.radio.opts).map(o=>'<label class="opt"><input type="radio" name="'+w.radio.id+'" value="'+o[0]+'"'+(String(st.answers[w.radio.id])===String(o[0])?' checked':'')+'><span>'+o[1]+'</span></label>').join('')+'</div></div>':'';
  const sim=w.simulate? '<div class="obj-actions"><button type="button" class="btn" id="btn-sim-'+obj.id+'">'+w.simulate.btn+'</button><span class="hint-cost">'+(w.simulate.note||'')+'</span></div><div class="simbox" id="simbox-'+obj.id+'" hidden></div>':'';
  const root=el('<div>'+sliders+wToggles(w.toggles||[])+radio+sim+'</div>');
  root.querySelectorAll('input[type="range"]').forEach(r=>{
    const id=r.id.split('-')[1];
    r.addEventListener('input',()=>{ env[id]=parseFloat(r.value); root.querySelector('#sv-'+id+'-'+obj.id).textContent=r.value+(w.sliders.find(s=>s.id===id).unit); save(); updateProgress(); });
  });
  bindToggles(root);
  if(w.radio) bindField(root.querySelector('.opt-list[data-field="'+w.radio.id+'"]'), obj.id, w.radio.id, 'radio');
  if(w.simulate){
    root.querySelector('#btn-sim-'+obj.id).addEventListener('click',()=>{ simulateDay(root.querySelector('#simbox-'+obj.id)); });
    if(env.flag_10!=null) paintSim(root.querySelector('#simbox-'+obj.id));
  }
  return root;
}


function simulateDay(box){
  const EVENTS=[{key:'backup', name:'02:00 DC-LINK backup window (91%, 90 min)', util:91, dur:90, win:true},
                {key:'10', name:'10:00 HQ-INET congestion event (97%, 30 min)', util:97, dur:30, win:false}];
  const fired={};
  EVENTS.forEach(e=>{
    const excluded=e.win&&env.alarmWin;
    const cond=!excluded && e.util>=env.alarmTh && e.dur>=env.alarmMin;
    fired[e.key]=cond;
  });
  env.flag_10=fired['10']; env.flag_02=fired['backup']; save();
  paintSim(box);
  toast('Simulation complete — see fired/missed table.');
}


function paintSim(box){
  if(!box) return; box.hidden=false;
  const rows=[
    ['02:00 DC-LINK — backup window (91% × 90 min)', env.flag_02?'FIRED':'silent', env.flag_02?'bad':'ok'],
    ['10:00 HQ-INET — congestion event (97% × 30 min)', env.flag_10?'FIRED':'MISSED', env.flag_10?'bad':'ok']
  ];
  box.innerHTML='<table class="ev">'+rows.map(r=>'<tr><td>'+r[0]+'</td><td><b class="td-'+(r[2]==='ok'?'ok':'hot')+'">'+r[1]+'</b></td></tr>').join('')+'</table><p class="kv">Goal: 10:00 FIRES · 02:00 silent.</p>';
}


function wChanPlan(obj, w){
  const editable=obj.id==='OBJ-M7'? ['CAFE2','ROAST2'] : ['CAFE1','CAFE2','ROAST1','ROAST2','ROAST3'];
  const rows=APS.map(a=>{
    const key=a.n.replace('AP-','');
    const cur=env['apChan_'+key];
    if(editable.indexOf(key)>=0){
      return '<div class="chan-row" data-ap="'+key+'"><b>'+a.n+'</b><span class="kv">'+a.loc+'</span><select data-ap="'+key+'" aria-label="channel for '+a.n+'">'+PLAN_OPTS.map(c=>'<option value="'+c+'"'+(String(cur)===c?' selected':'')+'>'+c+'</option>').join('')+'</select><span class="kv plan-note"></span></div>';
    }
    return '<div class="chan-row" data-ap="'+key+'"><b>'+a.n+'</b><span class="kv">'+a.loc+'</span><span class="kv">fixed: ch <b>'+cur+'</b></span><span class="kv plan-note"></span></div>';
  }).join('');
  const widthSel='<div class="fld" style="margin-top:10px"><span class="fld-label">2.4 GHz channel width</span><select data-width aria-label="2.4 GHz channel width">'+[['40','40 MHz (bonded)'],['20','20 MHz']].map(o=>'<option value="'+o[0]+'"'+(env.width24===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';
  const steer=(obj.id==='OBJ-H5')? '<div style="margin-top:8px">'+wToggles([{id:'bandSteer', label:'Band steering — dual-band clients → 5 GHz', note:'plan requirement'}])+'</div>':'';
  const root=el('<div><div class="chan-grid">'+rows+'</div>'+widthSel+steer+'<p class="kv" style="margin-top:8px">'+w.caption+'</p></div>');
  root.querySelectorAll('select[data-ap]').forEach(s=>{
    s.value=String(env['apChan_'+s.dataset.ap]);
    s.addEventListener('change',()=>{ env['apChan_'+s.dataset.ap]=s.value; save(); refreshBayDynamic(); updateProgress(); });
  });
  const ws=root.querySelector('select[data-width]');
  if(ws) ws.addEventListener('change',()=>{ env.width24=ws.value; save(); refreshBayDynamic(); updateProgress(); });
  bindToggles(root);
  return root;
}


function wPlan(obj, w){
  const st=objState(obj.id);
  const parts=w.fields.map(f=>'<div class="fld"><label class="fld-label" for="fld-'+f.id+'">'+f.label+'</label><select id="fld-'+f.id+'" data-field="'+f.id+'">'+shufOpts(f.id, f.opts).map(o=>'<option value="'+o[0]+'"'+(String(st.answers[f.id])===String(o[0])?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>').join('');
  const grid=wChanPlan(obj, {caption:'Plan constraints: channels 1–11, pairwise spacing ≥ 5 channels (1/6/11 discipline), width 20 MHz, steering armed. Rows turn red on violation.'});
  const root=el('<div>'+parts+'<div style="margin-top:8px"></div></div>');
  root.insertBefore(grid, root.querySelector('div[style]'));
  root.querySelectorAll('select[data-field]').forEach(s=>bindField(s, obj.id, s.dataset.field, 'select'));
  return root;
}


/* ---------- bench verification readouts ---------- */
const APPLY={
  fixCongest(){ env.after.fixCongest={title:'BENCH VERIFICATION — CONGESTION FIX', rows:[
    ['HQ-INET morning peak (09:45–10:15)','97% → 62%'],
    ['Voice one-way delay','48 ms → 28 ms'],
    ['Voice jitter','38 ms → 6 ms'],
    ['Voice loss','2.5% → 0.1%'],
    ['MKT-STUDIO-01 loop','380 Mbps → 60 Mbps (rate-limited)']]}; },
  fixLoss(){ env.after.fixLoss={title:'BENCH VERIFICATION — LOSS PATH', rows:[
    ['CRC delta · Gi1/0/14','+38/hr → 0/hr'],
    ['Capture retransmissions','present → none'],
    ['Ping × 100 (to FILE-SRV-01)','3% loss → 0%'],
    ['iperf TCP (HQ → FILE-SRV-01)','420 Mbps → 942 Mbps']]}; },
  fixRF(){ env.after.fixRF={title:'BENCH VERIFICATION — RF REMEDIATION', rows:[
    ['Warehouse retransmissions (lunch window)','24% → 6%'],
    ['Café retransmissions (ACI pair)','31% → 4%'],
    ['AP-ROAST3 retransmissions','38% → 15% — residual: motor-room placement'],
    ['Dual-band clients','steered to 5 GHz, out of the 2.4 GHz noise']]}; }
};


/* ---------- small helpers ---------- */
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'), 2600); }


function live(msg){ const l=document.getElementById('live'); l.textContent=''; setTimeout(()=>{l.textContent=msg;},30); }


/* ---------- bay panels ---------- */
function pUtilScope(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Utilization scope — synthetic 24 h, 15-min samples</div><div class="panel-body"><div class="scope">'+utilChart()+'</div><div class="legend">'+
  '<span class="lg"><span class="swatch" style="background:#ffb347"></span>HQ-INET</span>'+
  '<span class="lg"><span class="swatch" style="background:#ff6b6b"></span>KIOSK-LINK</span>'+
  '<span class="lg"><span class="swatch" style="background:#5aa7e8"></span>DC-LINK</span>'+
  '<span class="lg"><span class="swatch" style="background:#43d98c"></span>WAN-1</span>'+
  '<span class="lg"><span class="swatch" style="background:#b18cf0"></span>ROAST-INET</span></div>'+
  '<p class="kv" style="margin-top:8px">Read it like the N+ wants: which line flat-tops, at what time, and against which baseline.</p></div></div>'; }


function pLinks(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Link inventory — capacity vs demand</div><div class="panel-body" style="padding-top:6px"><table class="ev"><thead><tr><th>Link</th><th>Rated</th><th>Now</th><th>Peak (last 24 h)</th><th>Baseline</th></tr></thead><tbody>'+
  LINKS.map(l=>'<tr><td><b>'+l.name+'</b></td><td>'+l.rated+'</td><td class="'+(l.hot?'td-hot':'td-ok')+'">'+l.cur+'%</td><td class="'+(l.hot?'td-hot':'')+'">'+l.peak+'</td><td>'+l.base+'</td></tr>').join('')+'</tbody></table></div></div>'; }


function pTalkers(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Top talkers — last 24 h (SNMP/flow)</div><div class="panel-body" style="padding-top:6px"><table class="ev"><thead><tr><th>Host</th><th>What it does</th><th>Link</th><th>Rate</th><th>Note</th></tr></thead><tbody>'+
  TOP_TALKERS.map(t=>'<tr><td><b>'+t.h+'</b></td><td>'+t.d+'</td><td>'+t.link+'</td><td class="'+(t.rate==='380 Mbps'?'td-hot':'')+'">'+t.rate+'</td><td>'+t.note+'</td></tr>').join('')+'</tbody></table></div></div>'; }


function pAlarms(){ return '<div class="panel"><div class="panel-head"><span class="dot off"></span>Alarm feed — last 24 h (noisy on purpose)</div><div class="panel-body" style="padding-top:4px">'+
  ALERTS.map(a=>'<div class="alert-row"><div><span class="alert-ts">'+a.ts+'</span> <span class="alert-name">'+a.src+'</span><span class="alert-det">'+a.det+'</span></div></div>').join('')+
  '<p class="kv" style="margin-top:8px">Three of these eight are noise. Cross-check the memo baseline and each detail line.</p></div></div>'; }


function pAlarmNote(){ return '<div class="panel"><div class="panel-head"><span class="dot off"></span>Alarm engine — threshold policy</div><div class="panel-body"><p class="kv">Current policy fires at 90% instantaneous — which is why it pages every night at 02:00 and misses nothing at 10:00 only by luck. Configure it in the objectives below.</p></div></div>'; }


function pLatency(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>ICMP & voice readouts — synthetic</div><div class="panel-body"><div class="grid3">'+
  '<div><div class="read-label">RTT → kiosk (avg 20)</div><div class="big-read warn">178 ms</div><div class="kv">baseline 22 ms</div></div>'+
  '<div><div class="read-label">Jitter (RTP stream)</div><div class="big-read amber">38 ms</div><div class="kv">rule of thumb ≲30 ms</div></div>'+
  '<div><div class="read-label">Loss to kiosk</div><div class="big-read good">0%</div><div class="kv">pure slowness, no damage</div></div></div>'+
  '<div class="grid3" style="margin-top:12px">'+
  '<div><div class="read-label">VoIP one-way (10:00)</div><div class="big-read warn">62 ms</div><div class="kv">rule of thumb ≲150 ms</div></div>'+
  '<div><div class="read-label">MOS (10:00)</div><div class="big-read warn">3.1</div><div class="kv">users say “underwater”</div></div>'+
  '<div><div class="read-label">HQ → roastery RTT</div><div class="big-read good">3 ms</div><div class="kv">healthy path for contrast</div></div></div></div></div>'; }


function pTrace(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Traceroute — HQ → Harbor Kiosk (10.20.0.10)</div><div class="panel-body">'+ladderHTML(TRACE_KIOSK,180)+
  '<p class="kv" style="margin-top:8px">RTT 178 ms vs 22 ms baseline · loss 0%. The ladder tells you WHERE; the link inventory tells you WHY.</p></div></div>'+
  '<div class="panel" style="margin-top:14px"><div class="panel-head"><span class="dot"></span>Traceroute — HQ → roastery core (healthy reference)</div><div class="panel-body">'+ladderHTML(TRACE_ROAST,10)+'</div></div>'; }


function pCounters(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Interface counters — IDF-B-SW01 (24 h deltas)</div><div class="panel-body" style="padding-top:6px"><table class="ev aptable"><thead><tr><th>Port</th><th>Peer</th><th>CRC</th><th>CRC delta</th><th>Input err</th><th>Output drops</th><th>Duplex</th></tr></thead><tbody>'+
  COUNTERS.map(c=>'<tr><td><b>'+c.p+'</b></td><td>'+c.peer+'</td><td class="'+(c.flag==='bad'?'td-hot':(c.flag==='warn'?'td-warn':'td-ok'))+'">'+c.crc.toLocaleString('en-US')+'</td><td class="'+(c.flag==='bad'?'td-hot':'')+'">'+c.crcd+'</td><td>'+c.inerr.toLocaleString('en-US')+'</td><td>'+c.outd+'</td><td>'+c.duplex+'</td></tr>').join('')+
  '</tbody></table><p class="kv" style="margin-top:8px">Fingerprints: CRC/input climbing with FLAT output drops = physical-layer corruption. Output drops with high utilization = congestion. Different diseases, different cures.</p></div></div>'; }


function pCapture(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Protocol analyzer — file-server flow excerpt (synthetic)</div><div class="panel-body"><div class="capture">'+
  CAPTURE_LINES.map(l=>'<span class="'+l.c+'">'+l.t+'</span>').join('\n')+'</div></div></div>'; }


function pTests(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Throughput & reachability tests</div><div class="panel-body"><div class="grid2">'+
  '<div><div class="read-label">iperf TCP · HQ → FILE-SRV-01</div><div class="big-read warn">420 Mbps</div><div class="kv">on a rated 1 Gbps path</div></div>'+
  '<div><div class="read-label">iperf UDP (offered 1 Gbps)</div><div class="big-read amber">611 Mbps · 3.9% loss</div><div class="kv">'+IPERF.udpLoss+' received loss</div></div></div>'+
  '<p class="kv" style="margin-top:10px">'+IPERF.ping+'</p></div></div>'; }


function pChanView(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Wi-Fi analyzer — 2.4 GHz (live: reflects your channel plan)</div><div class="panel-body"><div class="scope" id="dyn-chanbars">'+chanBars()+'</div>'+
  '<p class="kv" style="margin-top:8px">Bars on the same channel share airtime (CCI). Bars ≤4 channels apart corrupt each other’s frames (ACI).</p></div></div>'; }


function pApTable(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>AP survey — RSSI · noise floor · SNR · retransmissions</div><div class="panel-body" id="dyn-aptab">'+aptabInner()+'</div></div>'; }


function aptabInner(){
  return '<table class="ev aptable"><thead><tr><th>AP</th><th>Location</th><th>Ch</th><th>Width</th><th>RSSI</th><th>Noise</th><th>SNR</th><th>Clients</th><th>Retrans</th></tr></thead><tbody>'+
  APS.map(a=>{const ch=parseInt(env['apChan_'+a.n.replace('AP-','')],10)||a.ch; return '<tr><td><b>'+a.n+'</b></td><td>'+a.loc+'</td><td>'+ch+'</td><td>'+a.w+' MHz</td><td>'+a.rssi+' dBm</td><td>'+a.nf+' dBm</td><td class="'+(a.snr<15?'td-hot':(a.snr<20?'td-warn':'td-ok'))+'">'+a.snr+' dB</td><td>'+a.cl+'</td><td class="'+(a.retx>25?'td-hot':(a.retx>12?'td-warn':'td-ok'))+'">'+a.retx+'%</td></tr>';}).join('')+
  '</tbody></table><p class="kv" style="margin-top:8px">SNR = RSSI − noise floor. AP-ROAST3’s 8 dB SNR is a placement problem (motor room), not a channel problem.</p>';
}


function pSpectrum(){ return '<div class="panel"><div class="panel-head"><span class="dot"></span>Spectrum analyzer — sees what Wi-Fi can’t</div><div class="panel-body">'+
  '<div class="scope" id="dyn-spec-idle">'+spectrumSVG(false)+'</div><p class="kv" style="margin:6px 0 10px">Idle sweep (06:00)</p>'+
  '<div class="scope" id="dyn-spec-lunch">'+spectrumSVG(true)+'</div><p class="kv" style="margin-top:6px">Lunch sweep (12:30) — burst energy around 2.45 GHz: the kitchen microwave. No Wi-Fi analyzer will ever show you this.</p></div></div>'; }


function pTimeline(){ return '<div class="panel"><div class="panel-head"><span class="dot off"></span>Warehouse retransmissions by hour (2.4 GHz)</div><div class="panel-body">'+
  '<div class="scope">'+(function(){ const W=560,H=140,P={l:30,r:8,t:12,b:24}; const hrs=[6,8,10,11,12,13,14,16,18,20]; const vals=[8,9,10,14,41,38,12,9,8,8]; const x=i=>P.l+i*((W-P.l-P.r)/(hrs.length-1)); const y=v=>H-P.b-(v/50)*(H-P.t-P.b);
  let g=''; [0,10,20,30,40,50].forEach(v=>{ g+='<line x1="'+P.l+'" y1="'+y(v)+'" x2="'+(W-P.r)+'" y2="'+y(v)+'" stroke="#1d242e"/><text x="'+(P.l-5)+'" y="'+(y(v)+3)+'" fill="#8d8778" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="end">'+v+'%</text>'; });
  hrs.forEach((h,i)=>{ g+='<text x="'+x(i)+'" y="'+(H-7)+'" fill="#8d8778" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle">'+String(h).padStart(2,'0')+':00</text>'; });
  let d=''; hrs.forEach((h,i)=>{ d+=(i===0?'M':'L')+x(i).toFixed(1)+' '+y(vals[i]).toFixed(1)+' '; });
  g+='<rect x="'+x(2.5)+'" y="'+P.t+'" width="'+(x(4.5)-x(2.5))+'" height="'+(H-P.t-P.b)+'" fill="#ff6b6b" opacity="0.08"/><text x="'+((x(2.5)+x(4.5))/2)+'" y="'+(P.t+11)+'" fill="#ff6b6b" font-size="8.5" font-family="ui-monospace,monospace" text-anchor="middle">lunch prep 11:30–13:00</text>';
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Warehouse retransmission percentage by hour: jumps from about 14 percent to 41 percent during the 11:30 to 13:00 lunch prep window, matching the microwave schedule.">'+g+'<path d="'+d+'" fill="none" stroke="#ffb347" stroke-width="1.8"/></svg>'; })()+'</div>'+
  '<p class="kv" style="margin-top:8px">Time-of-day fingerprint = an appliance, not a broken radio. Motors keep AP-ROAST3’s floor high all day (see survey).</p></div></div>'; }


const BAYS=[
  {id:'bay-1', no:'BAY 01', title:'Utilization & Alarm', accent:'Scope', sub:'congestion / contention · bottlenecking · detection hygiene',
   panels:[pUtilScope, pLinks, pTalkers, pAlarms, pAlarmNote],
   med:['OBJ-M4','OBJ-M9','OBJ-M10'], hard:['OBJ-H2','OBJ-H9'], after:'fixCongest'},
  {id:'bay-2', no:'BAY 02', title:'Latency', accent:'Ladder', sub:'RTT · delay components · jitter · per-hop timing',
   panels:[pLatency, pTrace],
   med:['OBJ-M2','OBJ-M3','OBJ-M5'], hard:['OBJ-H3','OBJ-H7'], after:null},
  {id:'bay-3', no:'BAY 03', title:'Loss Counters &', accent:'Capture', sub:'packet loss · CRC forensics · throughput proof',
   panels:[pCounters, pCapture, pTests],
   med:['OBJ-M6','OBJ-M11'], hard:['OBJ-H4','OBJ-H6'], after:'fixLoss'},
  {id:'bay-4', no:'BAY 04', title:'RF', accent:'Spectrum', sub:'wireless interference · CCI/ACI · SNR · channel planning',
   panels:[pChanView, pApTable, pSpectrum, pTimeline],
   med:['OBJ-M7','OBJ-M12'], hard:['OBJ-H5','OBJ-H10'], after:'fixRF'},
];


function buildBays(){
  const host=document.getElementById('bays');
  host.innerHTML='';
  const perBay = state.mode==='medium' ? 'med' : 'hard';
  BAYS.forEach(b=>{
    const bay=el('<article class="bay" id="'+b.id+'" aria-labelledby="'+b.id+'-h">'+
      '<div class="bay-head"><span class="bay-no">'+b.no+'</span><h3 class="bay-name" id="'+b.id+'-h">'+b.title+' <span class="bay-accent">'+b.accent+'</span></h3><span class="bay-sub">'+b.sub+'</span><span class="next-badge" data-next="'+b.id+'" hidden>RECOMMENDED NEXT</span></div>'+
      '<div class="bay-body">'+b.panels.map(p=>p()).join('')+(b.after?'<div data-afterbox="'+b.after+'"></div>':'')+'<div class="objs" data-objs="'+b.id+'"></div></div></article>');
    host.appendChild(bay);
    if(b.after && env.after[b.after]) paintAfter(bay.querySelector('[data-afterbox]'), b.after);
  });
  refreshBayDynamic();
}


function refreshBayDynamic(){
  const cb=document.getElementById('dyn-chanbars'); if(cb) cb.innerHTML=chanBars();
  const si=document.getElementById('dyn-spec-idle'); if(si) si.innerHTML=spectrumSVG(false);
  const sl=document.getElementById('dyn-spec-lunch'); if(sl) sl.innerHTML=spectrumSVG(true);
  const at=document.getElementById('dyn-aptab'); if(at) at.innerHTML=aptabInner();
}
