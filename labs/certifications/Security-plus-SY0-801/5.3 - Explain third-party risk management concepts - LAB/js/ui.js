"use strict";
/* =========================================================================
   js/ui.js — DOM helpers and rendering (templates as string builders)
   Every rendering function is carried over verbatim from the original
   engine; the only change is file organization. The CompTIA link below is
   an outbound content citation (user-clicked anchor), not a loaded
   resource — the lab makes zero runtime network requests.
   ========================================================================= */

/* ---------- DOM helpers ---------- */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s); }
function announce(msg){ var n = $("sr-announcer"); if (n) n.textContent = msg; }
function stampHTML(text){ return '<span class="stamp">'+(text||"Verified")+'</span>'; }

/* Objective framework helpers (moved here from the original objectives file — shared rendering) */
/* QA fix (R4/R6): rotate an option list by n so display order never mirrors the correct mapping */
function rotateArr(arr, n){
  var copy = arr.slice();
  for (var r=0;r<n;r++){ copy.push(copy.shift()); }
  return copy;
}
function optHTML(key, opts, type, ariaLabel){
  var html = "";
  for (var i=0;i<opts.length;i++){
    var v = opts[i][0], lbl = opts[i][1];
    if (type === "check"){
      html += '<label class="choice"><input type="checkbox" data-env="'+key+'.'+v+'" value="'+v+'"><span>'+lbl+'</span></label>';
    } else {
      html += '<label class="choice"><input type="radio" name="g_'+key+'" data-env="'+key+'" value="'+v+'"><span>'+lbl+'</span></label>';
    }
  }
  return '<div role="group" aria-label="'+(ariaLabel||key)+'">'+html+'</div>';
}
function selHTML(key, opts, ariaLabel){
  var html = '<select data-env="'+key+'" aria-label="'+(ariaLabel||key)+'"><option value="">Choose…</option>';
  for (var i=0;i<opts.length;i++){ html += '<option value="'+opts[i][0]+'">'+opts[i][1]+'</option>'; }
  html += '</select>';
  return html;
}
function docOpen(o, kind, hookTarget){
  var hook = o.look ? '<div class="obj-hook">Look at: <button type="button" class="look" data-look="'+o.look+'">'+o.lookLabel+'</button></div>' : '';
  return '<div class="doc fiction" id="doc-'+o.id+'"><div class="doc-head"><h3>'+o.title+'</h3>'+
    '<span class="doc-kind">'+(kind||"training data — fictional")+'</span></div>'+
    '<div class="doc-body">'+hook;
}
function docClose(){ return '</div></div>'; }

function renderRail(){
  var h = "";
  for (var i=0;i<MED.railPhases.length;i++){
    var p = MED.railPhases[i];
    var objs = phaseObjs(p.n);
    var done = 0;
    for (var j=0;j<objs.length;j++){ if (objState(objs[j].id).done) done++; }
    var complete = objs.length > 0 && done === objs.length;
    h += '<button type="button" class="rail-btn" role="listitem" data-phase="'+p.n+'" '+(state.phase===p.n?'aria-current="step"':'')+'>'+
      '<span class="num">'+p.n+'</span><span class="lbl"><b>'+p.name+'</b><span>'+p.blurb+'</span></span>'+
      (complete ? '<span class="tick" aria-label="phase complete">✓</span>' : '')+'</button>';
  }
  $("rail").innerHTML = h;
}

function objDocId(o){ return "doc-" + o.id.replace("OBJ-","").toLowerCase(); }
function objCardHTML(o, withStamp){
  var os = objState(o.id);
  var html = o.render(state.env);
  var inject = (os.done && withStamp !== false ? stampHTML("Verified") : "") +
    '<p style="font-size:14.5px;color:var(--ink-soft)">'+o.desc+'</p>';
  html = html.replace('<div class="doc-body">', '<div class="doc-body">'+inject);
  return html;
}

function primerHTML(){
  var g = TXT.primer.glossary, gh = "";
  for (var i=0;i<g.length;i++){ gh += '<li><b>'+g[i][0]+'</b> — '+g[i][1]+'</li>'; }
  var cards = "";
  for (var j=0;j<TXT.primer.cards.length;j++){ cards += '<div class="note-card" id="primer-card-'+(j+1)+'"><h3>'+TXT.primer.cards[j].t+'</h3><p style="font-size:14.5px;color:var(--ink-soft)">'+TXT.primer.cards[j].b+'</p></div>'; }
  return '<details class="doc" id="doc-primer" style="padding:14px 16px"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;font-size:17px;min-height:44px;display:flex;align-items:center">📖 Background readings — the five process groups (open me first)</summary>'+
    '<div class="doc-body" style="padding:14px 0 0">'+cards+
    '<div class="note-card"><h3>Glossary — 18 terms this binder uses</h3><ul style="columns:2;column-gap:26px" class="gl-list">'+gh+'</ul></div>'+
    '</div></details>';
}

function briefingHTML(){
  var b = TXT.briefing[0], ps = "";
  for (var i=0;i<b.p.length;i++){ ps += '<p style="margin-top:8px;font-size:15px;color:var(--ink-soft)">'+b.p[i]+'</p>'; }
  return '<div class="doc fiction" id="doc-brief"><div class="doc-head"><h3>Scenario briefing — why this binder exists</h3><span class="doc-kind">training data — fictional</span></div><div class="doc-body">'+ps+
    '<p class="fiction-note">FICTIONAL TRAINING DATA — Meridian Vale Health Network, its vendors, people, documents and figures are invented for practice.</p></div></div>';
}

function notesHTML(){
  var n = TXT.notes;
  function card(k, icon){ var items = ""; for (var i=0;i<n[k].items.length;i++){ items += "<li>"+n[k].items[i]+"</li>"; }
    return '<div class="note-card"><h3>'+icon+' '+n[k].h+'</h3><ul>'+items+'</ul></div>'; }
  return '<div class="notes-grid">' + card("detection","🔎") + card("mitigation","🛡") + card("blue","🟦") + card("red","🟥") +
    '<div class="note-card"><h3>Reference</h3><p class="links">Objective 5.3 lives in <b>Domain 5 — Security Program Management &amp; Oversight (20% of the SY0-801 exam)</b>. Official source: <a href="https://www.comptia.org/certifications/security" target="_blank" rel="noopener">comptia.org/certifications/security</a> (opens in a new tab). All training data in this binder is fictional and simplified for teaching.</p></div></div>';
}

function renderStage(){
  var stage = $("stage"), h = "";
  if (state.mode === "medium"){
    var p = MED.railPhases[state.phase-1];
    h += '<div class="phase-head"><div class="ph-kicker">Phase '+p.n+' of 5 · the Q3 review cycle</div><h2>'+p.name+'</h2><p>'+p.blurb+'. '+phaseObjs(p.n).length+' objectives in this phase — check each in the Objectives Ledger (right side, or the ledger button on small screens).</p></div>';
    if (state.phase === 1){ h += briefingHTML() + primerHTML(); }
    var objs = phaseObjs(state.phase);
    for (var i=0;i<objs.length;i++){ h += objCardHTML(objs[i]); }
    if (state.phase === 5){
      h += notesHTML() + quizHTML() + concludeHTML();
    } else {
      var nextName = MED.railPhases[state.phase] ? MED.railPhases[state.phase].name : null;
      h += '<div class="doc" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 18px"><span style="font-size:14.5px;color:var(--ink-soft)">Progress is saved automatically as you work.</span>'+
        (nextName?'<button type="button" class="check-btn" data-goto-phase="'+(state.phase+1)+'">Advance to phase '+(state.phase+1)+' — '+nextName+' →</button>':'')+'</div>';
    }
  } else {
    var hb = HARD.banner;
    h += '<div class="war-banner"><div class="ph-kicker">'+hb.kicker+'</div><h2>'+hb.title+'</h2>';
    for (var j=0;j<hb.p.length;j++){ h += '<p>'+hb.p[j]+'</p>'; }
    h += '<p class="fiction-note">FICTIONAL TRAINING DATA — all organizations, vendors and documents are invented for practice.</p></div>';
    var hobjs = OBJ_HARD;
    for (var k=0;k<hobjs.length;k++){ h += objCardHTML(hobjs[k]); }
    h += notesHTML() + quizHTML() + concludeHTML();
  }
  stage.innerHTML = h;
  if (state.mode === "medium") renderRail();
  restoreEnvControls();
  restoreQuizStates();
  lockStampedDocs();
}

/* ---------- Ledger ---------- */
function renderLedger(){
  var objs = modeObjs(), done = 0, h = "";
  var pillarNames = {P1:"Understand",P2:"Recognize",P3:"Detect / monitor",P4:"Mitigate"};
  for (var i=0;i<objs.length;i++){
    var o = objs[i], os = objState(o.id);
    if (os.done) done++;
    h += '<div class="obj-item'+(os.done?" done":"")+'" id="li-'+o.id+'">'+
      '<div class="obj-top"><span class="pillar '+o.pillar+'" title="'+pillarNames[o.pillar]+'">'+o.pillar+'</span><span class="obj-title">'+o.title+'</span></div>'+
      '<div class="obj-status">'+(os.done ? "Stamped ✓"+(os.first?"":" (after "+os.tries+" tries)") : (os.tries ? os.tries+" check"+(os.tries>1?"s":"")+" so far" : "Not yet checked"))+'</div>';
    if (!os.done){
      h += '<div class="obj-actions"><button type="button" class="check-btn" data-check="'+o.id+'">Check result</button>';
      if (state.mode === "medium"){ h += '<button type="button" class="mini-btn" data-hint="'+o.id+'">Hint'+(os.hint?" ("+os.hint+"/3)":"")+'</button>'; }
      else if (os.hint === 0){ h += '<button type="button" class="mini-btn" data-hint="'+o.id+'">Nudge (costs ★)</button>'; }
      h += '</div>';
      if (os.hint > 0) h += hintBoxHTML(o, os);
    }
    h += '</div>';
    if (state.lastFb && state.lastFb[o.id]){
      var fb = state.lastFb[o.id];
      h += '<div class="feedback '+fb.cls+'">'+fb.html+'</div>';
    } else {
      h += '<div class="feedback" id="fb-'+o.id+'"></div>';
    }
    h += '</div>';
  }
  $("ledger-list").innerHTML = h;
  $("ledger-count").textContent = done+"/"+objs.length+" stamped";
  $("fab-count").textContent = done+"/"+objs.length;
}
function hintBoxHTML(o, os){
  var level = Math.min(os.hint, state.mode === "medium" ? 3 : 1);
  var h = '<div class="hint-box"><span class="hint-lvl">'+(state.mode==="medium"?("Hint level "+level+" of 3"):"Nudge — costs score")+'</span><span>'+(state.mode==="medium"?o.hints[level-1]:o.nudge)+'</span></div>';
  return h;
}

/* ---------- Stats ---------- */
function updateStats(){
  var objs = modeObjs(), done = 0;
  for (var i=0;i<objs.length;i++){ if (objState(objs[i].id).done) done++; }
  $("stat-obj").textContent = done+"/"+objs.length;
  $("prog-fill").style.width = Math.round(done/objs.length*100)+"%";
}

/* ---------- Look / scroll ---------- */
function lookAt(target){
  var el = target === "primer" ? $("doc-primer") : $("doc-"+target);
  if (el){
    if (el.tagName === "DETAILS") el.open = true;
    el.scrollIntoView({behavior:"smooth", block:"start"});
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }
}

/* ---------- Sequence builder (H5) ---------- */
function getSeq(){ try { return state.env["h5.order"] ? JSON.parse(state.env["h5.order"]) : []; } catch(e){ return []; } }
function setSeq(arr){ state.env["h5.order"] = JSON.stringify(arr); save(); }
function seqAction(kind, id){
  var arr = getSeq();
  if (kind === "add"){ if (arr.indexOf(id) < 0) arr.push(id); }
  else if (kind === "remove"){ var ix = arr.indexOf(id); if (ix >= 0) arr.splice(ix,1); }
  else if (kind === "up"){ var i2 = arr.indexOf(id); if (i2 > 0){ arr.splice(i2,1); arr.splice(i2-1,0,id); } }
  else if (kind === "down"){ var i3 = arr.indexOf(id); if (i3 >= 0 && i3 < arr.length-1){ arr.splice(i3,1); arr.splice(i3+1,0,id); } }
  setSeq(arr);
  var obj = OBJMAP["OBJ-H5"];
  var doc = $("doc-h5");
  if (doc){ doc.outerHTML = obj.render(state.env); var nd = $("doc-h5"); if (nd) nd.scrollIntoView({block:"nearest"}); }
}

/* ---------- Overlay helpers (R7: easy close — X, Cancel, ESC, click-outside; focus returns) ---------- */
var lastOverlayTrigger = null;
function openOverlay(id){
  lastOverlayTrigger = document.activeElement;
  var o = $(id);
  o.hidden = false; o.classList.add("open");
  var f = o.querySelector("button:not([disabled])");
  if (f) f.focus();
}
function closeOverlay(id){
  var o = $(id);
  o.classList.remove("open"); o.hidden = true;
  if (lastOverlayTrigger && lastOverlayTrigger.focus){ try { lastOverlayTrigger.focus(); } catch(e){} }
  lastOverlayTrigger = null;
}
