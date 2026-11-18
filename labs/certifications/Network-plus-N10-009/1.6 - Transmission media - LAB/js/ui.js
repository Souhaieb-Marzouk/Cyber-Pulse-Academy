/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · ui
   UI — rendering of every bench surface: signal scopes, media rack and spec modules, orders board and forms, live readouts, matrix, field notes, cert card + hints, header meter, completion modal and the generic modal primitive.
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

/* ---------------- signal visualization ---------------- */

function sinePath(x0, x1, y0, amp, period, phase){
  var d = "", step = 8;
  for(var x = x0; x <= x1; x += step){
    var y = y0 + Math.sin((x - x0) / period * Math.PI * 2 + (phase||0)) * amp;
    d += (x === x0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  }
  return d;
}
function squarePath(x0, x1, y0, amp, period){
  var d = "", up = true;
  for(var x = x0; x <= x1; x += period/2){
    var x2 = Math.min(x + period/2, x1);
    d += (x === x0 ? "M" : "L") + x + " " + (up ? y0-amp : y0+amp) + " L" + x2 + " " + (up ? y0-amp : y0+amp) + " ";
    up = !up;
    if(x2 === x1) break;
  }
  return d;
}
function buildSig(sig, label){
  SIG_UID++;
  var uid = "sig" + SIG_UID;
  var x0 = 52, x1 = 588, y0 = 60;
  var inner = "";
  var endpoints = '<rect x="6" y="38" width="46" height="44" rx="6" fill="#182334" stroke="#2c3d5c"/>' +
    '<text x="29" y="63" text-anchor="middle" font-size="10" fill="#7f93b3" font-family="monospace">TX</text>' +
    '<rect x="588" y="38" width="46" height="44" rx="6" fill="#182334" stroke="#2c3d5c"/>' +
    '<text x="611" y="63" text-anchor="middle" font-size="10" fill="#7f93b3" font-family="monospace">RX</text>';
  var legend = label || "";
  if(sig === "fiber"){
    inner = '<line x1="52" y1="60" x2="588" y2="60" stroke="#155e4b" stroke-width="2"/>' +
      '<line class="sig-pulse" x1="52" y1="60" x2="588" y2="60" stroke="#4ade80" stroke-width="3" stroke-dasharray="14 118"/>' +
      '<circle cx="52" cy="60" r="4" fill="#4ade80" class="sig-flick"/>' +
      '<circle cx="588" cy="60" r="4" fill="#4ade80" class="sig-flick"/>';
    legend = legend || "LIGHT IN GLASS — no EMI, no leakage";
  } else if(sig === "wireless" || sig === "sat"){
    var slow = sig === "sat" ? 5.5 : 2.6;
    var amp = sig === "sat" ? 14 : 22;
    inner = '<clipPath id="' + uid + '"><rect x="52" y="16" width="536" height="88"/></clipPath>' +
      '<g clip-path="url(#' + uid + ')"><g class="sig-sine-g" style="animation-duration:' + slow + 's">' +
      '<path d="' + sinePath(40, 900, y0, amp, 200, 0) + '" fill="none" stroke="#ffb454" stroke-width="2.5"/>' +
      '<path d="' + sinePath(40, 900, y0, amp, 200, Math.PI/2) + '" fill="none" stroke="#ffb454" stroke-width="1.2" opacity="0.45"/>' +
      '</g></g>' +
      '<path d="M40 30 Q52 16 64 30" fill="none" stroke="#2c3d5c" stroke-width="2"/>' +
      '<path d="M600 30 Q612 16 624 30" fill="none" stroke="#2c3d5c" stroke-width="2"/>';
    legend = legend || (sig === "sat" ? "RF OVER 36,000 KM (GEO class) — long path, weather-sensitive" : "RF IN AIR — shared, interceptable, EMI-exposed");
  } else if(sig === "coax"){
    inner = '<clipPath id="' + uid + '"><rect x="52" y="16" width="536" height="88"/></clipPath>' +
      '<g clip-path="url(#' + uid + ')"><g class="sig-sine-g" style="animation-duration:3.4s">' +
      '<path d="' + sinePath(40, 900, y0, 18, 200, 0) + '" fill="none" stroke="#ffb454" stroke-width="2.5"/>' +
      '</g>' +
      '<path class="sig-flick" d="' + sinePath(52, 588, y0, 5, 23, 0.7) + '" fill="none" stroke="#ff8787" stroke-width="1.3" opacity="0.8"/></g>';
    legend = legend || "SHIELDED COPPER — noise shows at bends, splitters, cheap F-terminations";
  } else if(sig === "dac"){
    inner = '<clipPath id="' + uid + '"><rect x="52" y="16" width="536" height="88"/></clipPath>' +
      '<g clip-path="url(#' + uid + ')"><g class="sig-sine-g" style="animation-duration:2.2s">' +
      '<path d="' + squarePath(40, 900, y0, 22, 200) + '" fill="none" stroke="#4ade80" stroke-width="2.5"/>' +
      '</g></g>';
    legend = legend || "TWINAX COPPER — clean, short, cheap";
  } else {
    inner = "";
    endpoints = "";
  }
  return '<svg viewBox="0 0 640 120" role="img" aria-label="Animated signal trace: ' + esc(legend) + '">' +
    endpoints + inner +
    '<text x="10" y="112" font-size="9" fill="#7f93b3" font-family="monospace" letter-spacing="1.5">' + esc(legend.toUpperCase()) + '</text></svg>';
}


/* ---------------- media rack ---------------- */

function renderRack(){
  var host = $id("rackList");
  host.innerHTML = "";
  LIB.forEach(function(mod){
    var open = !!S.shared.libOpen[mod.id];
    var art = el("article", "rack-mod" + (open ? " open" : ""));
    art.id = "mod-" + mod.id;
    var head = el("button", "rack-head");
    head.type = "button";
    head.setAttribute("aria-expanded", open ? "true" : "false");
    head.innerHTML = '<span class="rack-code" style="background:' + mod.accent + '">' + esc(mod.code) + '</span>' +
      '<span class="rn">' + esc(mod.name) + '</span><span class="chev" aria-hidden="true">▾</span>';
    head.addEventListener("click", function(){
      var now = !art.classList.contains("open");
      art.classList.toggle("open", now);
      head.setAttribute("aria-expanded", now ? "true" : "false");
      S.shared.libOpen[mod.id] = now;
      save();
    });
    var body = el("div", "rack-body");
    var rowsHtml = mod.spec.map(function(r){
      return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>";
    }).join("");
    var html = '<table class="spec-table"><tbody>' + rowsHtml + '</tbody></table>';
    html += '<ul class="lib-notes">' + mod.notes.map(function(n){ return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>";
    if(mod.traps && mod.traps.length){
      html += '<div class="lib-traps"><b>Field traps:</b><ul class="lib-notes" style="margin:.3rem 0 0 .9rem">' +
        mod.traps.map(function(t){ return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }
    if(mod.widget) html += widgetHtml(mod.widget);
    body.innerHTML = html;
    art.appendChild(head); art.appendChild(body);
    host.appendChild(art);
  });
}

function widgetHtml(w){
  var html = '<div class="mini-widget" id="widget-' + w.id + '"><h4>⧉ ' + esc(w.title) + '</h4>';
  w.rows.forEach(function(row, i){
    var key = "r" + i;
    if(w.twoCol){
      html += '<div class="mw-row"><code>' + esc(row.std) + '</code>' +
        selHtml(w.id, key + "-b", row.o1, row.a1, undefined, row.std + " band") +
        selHtml(w.id, key + "-s", row.o2, row.a2, undefined, row.std + " speed") + '</div>';
    } else {
      html += '<div class="mw-row one"><code>' + esc(row.std) + '</code>' +
        selHtml(w.id, key, row.o, row.a, undefined, row.std + " match") + '</div>';
    }
  });
  return html + "</div>";
}
function selHtml(wid, fkey, opts, ansIdx, chosen, label){
  var v = (chosen === undefined || chosen === null) ? "" : String(chosen);
  var o = ['<option value="">— select —</option>'];
  opts.forEach(function(op, i){ o.push('<option value="' + i + '"' + (v === String(i) ? " selected" : "") + '>' + esc(op) + '</option>'); });
  return '<select aria-label="' + esc(label || "select") + '" data-act="field" data-kind="widget" data-wid="' + wid + '" data-f="' + fkey + '">' + o.join("") + '</select>';
}

function openModule(id){
  var mod = $id("mod-" + id);
  if(!mod) return;
  mod.classList.add("open");
  var btn = mod.querySelector(".rack-head");
  if(btn) btn.setAttribute("aria-expanded", "true");
  S.shared.libOpen[id] = true; save();
  onMobileView("rack");
  mod.scrollIntoView({behavior:"smooth", block:"start"});
  mod.style.boxShadow = "0 0 0 3px #c2410c55";
  setTimeout(function(){ mod.style.boxShadow = ""; }, 1600);
}


/* ---------------- orders board ---------------- */

function renderBoard(){
  if(currentOrder){ openOrder(currentOrder); return; }
  var panel = $id("panel-orders");
  panel.innerHTML = "";
  var head = el("div", "panel-head");
  var mode = S.mode;
  head.innerHTML = '<h2>Order board</h2><span class="ph-sub">' +
    (mode === "medium" ? "Free-roam: certify in any order. Live readouts teach; the cert card tracks the 11 objectives." :
    "Field mode: strict multi-part checking, no coaching readouts, one scoring nudge total. Two evidence cards lie.") + '</span>';
  panel.appendChild(head);
  var list = el("div", "board-list");
  ordersFor().forEach(function(ord){
    var oState = st().orders[ord.id];
    var done = oState && oState.certified;
    var t = el("div", "ticket" + (done ? " done" : ""));
    t.innerHTML = '<span class="t-id">' + esc(ord.code) + '</span>' +
      '<span class="t-title">' + esc(ord.title) + '</span>' +
      '<span class="t-obj">' + esc(ord.obj) + '</span>' +
      '<span class="stamp ' + (done ? "ok" : "no") + '">' + (done ? "CERTIFIED" : "OPEN") + '</span>';
    var b = el("button", "btn");
    b.type = "button";
    b.textContent = done ? "Review" : "Open";
    b.setAttribute("aria-label", (done ? "Review order " : "Open order ") + ord.code);
    b.addEventListener("click", function(){ openOrder(ord.id); });
    t.appendChild(b);
    list.appendChild(t);
  });
  panel.appendChild(list);
}

function openOrder(id){
  var ord = ordersFor().filter(function(x){ return x.id === id; })[0];
  if(!ord) return;
  currentOrder = id;
  onMobileView("stage");
  var panel = $id("panel-orders");
  panel.innerHTML = "";
  var wrap = el("div", "order-view");
  var back = el("button", "btn back");
  back.type = "button";
  back.textContent = "← Order board";
  back.addEventListener("click", function(){ currentOrder = null; renderBoard(); });
  wrap.appendChild(back);
  var head = el("div", "order-head");
  head.innerHTML = '<h3><span class="mono" style="color:var(--orange2)">' + esc(ord.code) + '</span> ' + esc(ord.title) + '</h3>' +
    '<span class="oblink">' + esc(ord.obj) + '</span>';
  wrap.appendChild(head);
  wrap.appendChild(el("p", "order-brief", esc(ord.brief)));
  if(ord.evidence) wrap.appendChild(el("div", "evidence", esc(ord.evidence)));
  if(ord.reqs){
    wrap.appendChild(el("div", "reqs", ord.reqs.map(function(r){ return '<span class="req">' + esc(r) + '</span>'; }).join("")));
  }
  var form = el("div", "form-grid");
  buildForm(ord, form);
  form.setAttribute("data-oid", ord.id);
  wrap.appendChild(form);
  if(ord.sig){
    var sigbox = el("div", "sig-box");
    sigbox.innerHTML = buildSig(ord.sig);
    var lbl = el("div", "sig-label");
    lbl.textContent = "LINK UNDER TEST — SIGNAL TRACE (SIMPLIFIED MODEL)";
    sigbox.appendChild(lbl);
    wrap.appendChild(sigbox);
  }
  var live = el("div", "readouts");
  live.id = "live-readouts";
  wrap.appendChild(live);
  var warn = el("div");
  warn.id = "live-warn";
  wrap.appendChild(warn);
  var act = el("div", "action-row");
  var btn = el("button", "btn btn-primary");
  btn.type = "button";
  btn.id = "btn-certify";
  btn.textContent = "CERTIFY LINK";
  btn.addEventListener("click", function(){ certifyOrder(ord.id); });
  act.appendChild(btn);
  var res = el("div", "certify-result");
  res.id = "certify-result";
  res.setAttribute("role", "status");
  act.appendChild(res);
  wrap.appendChild(act);
  panel.appendChild(wrap);
  updateLive(id);
}

/* form builders per order kind */
function fld(labelText, selHtmlFull, hint){
  return '<div class="field"><label>' + esc(labelText) + '</label>' + selHtmlFull + (hint ? '<div class="hintline">' + esc(hint) + '</div>' : "") + '</div>';
}
function optSel(opts, chosen, attrs){
  var v = (chosen === undefined || chosen === null) ? "" : String(chosen);
  var o = ['<option value="">— select —</option>'];
  opts.forEach(function(op, i){ o.push('<option value="' + i + '"' + (v === String(i) ? " selected" : "") + '>' + esc(op) + '</option>'); });
  return '<select data-act="field" data-kind="order"' + (attrs||"") + '>' + o.join("") + '</select>';
}
function chkBox(label, key, checked){
  return '<label><input type="checkbox" data-act="chk" data-kind="order" data-f="' + key + '"' + (checked ? " checked" : "") + '> <span>' + esc(label) + '</span></label>';
}
function numInput(labelText, key, value, attrs, hint){
  return '<div class="field"><label>' + esc(labelText) + '</label><input type="number" inputmode="decimal" step="0.1" value="' +
    (value === undefined || value === null ? "" : esc(value)) + '" data-act="field" data-kind="order" data-f="' + key + '" ' + (attrs||"") + '>' +
    (hint ? '<div class="hintline">' + esc(hint) + '</div>' : "") + '</div>';
}
function getF(oid, key){ var o = st().orders[oid]; return (o && o.fields) ? o.fields[key] : undefined; }

function buildForm(ord, form){
  var f = st().orders[ord.id] ? st().orders[ord.id].fields : {};
  if(!f) f = {};
  var html = "";
  switch(ord.kind){
    case "channels":
      for(var i = 0; i < 3; i++){
        var opts = [];
        for(var c = 1; c <= 11; c++) opts.push("Channel " + c);
        html += '<div class="field"><label>' + esc("AP-L" + (i+1) + " channel (2.4 GHz)") + '</label><select aria-label="AP-L' + (i+1) + ' channel" data-act="field" data-kind="order" data-f="ch' + (i+1) + '">' +
          '<option value="">— select —</option>' + opts.map(function(op, ix){ return '<option value="' + (ix+1) + '"' + (String(f["ch"+(i+1)]) === String(ix+1) ? " selected" : "") + '>' + op + '</option>'; }).join("") +
          '</select></div>';
      }
      html += '<div class="field"><label>Channel width</label><select aria-label="Channel width" data-act="field" data-kind="order" data-f="width">' +
        '<option value="">— select —</option>' + ["20 MHz","40 MHz","80 MHz","160 MHz"].map(function(w){ return '<option value="' + w + '"' + (f.width === w ? " selected" : "") + '>' + w + '</option>'; }).join("") +
        '</select></div>';
      form.innerHTML = html;
      break;
    case "fiber":
      form.innerHTML =
        fld("Medium", optSel(ord.form.type, f.type, ' data-f="type"')) +
        fld("Cable grade", optSel(ord.form.grade, f.grade, ' data-f="grade"')) +
        fld("Patch connector", optSel(ord.form.conn, f.conn, ' data-f="conn"')) +
        fld("Optics / transceiver", optSel(ord.form.optics, f.optics, ' data-f="optics"'));
      break;
    case "orbit":
      html = "";
      ord.missions.forEach(function(m){
        html += fld(m.label, optSel(ord.options, f[m.key], ' data-f="' + m.key + '"'));
      });
      form.innerHTML = html;
      break;
    case "coax":
      form.innerHTML =
        fld("Cable type", optSel(ord.options.rg, f.rg, ' data-f="rg"')) +
        fld("Connector", optSel(ord.options.conn, f.conn, ' data-f="conn"')) +
        numInput("Loss of the 2-way splitter (dB, positive number)", "loss", f.loss, 'data-f="loss"', "Hint: a 2-way split divides power across two legs.");
      break;
    case "dac":
      html = "";
      ord.links.forEach(function(l){
        html += fld(l.label, optSel(ord.linkOpts, f[l.key], ' data-f="' + l.key + '"'));
      });
      html += '<div class="field" style="grid-column:1/-1"><label>Justification for the pair</label><select data-act="field" data-kind="order" data-f="reason">' +
        '<option value="">— select —</option>' + ord.reasons.map(function(r, i){ return '<option value="' + i + '"' + (String(f.reason) === String(i) ? " selected" : "") + '>' + esc(r) + '</option>'; }).join("") +
        '</select></div>';
      form.innerHTML = html;
      break;
    case "diag":
      html = "";
      ord.tickets.forEach(function(t, i){
        html += '<div class="field" style="grid-column:1/-1"><label>' + esc("Ticket " + (i+1) + " root cause") + '</label>' +
          '<div class="evidence" style="margin:.3rem 0 .4rem">' + esc(t.ev) + '</div>' +
          optSel(ord.options, f[t.key], ' data-f="' + t.key + '"') + '</div>';
      });
      form.innerHTML = html;
      break;
    case "audit":
      html = '<div class="field" style="grid-column:1/-1"><label>Evidence cards — pick the REAL medium and flag lying tags</label></div>';
      ord.items.forEach(function(it){
        html += '<div class="field" style="grid-column:1/-1;border:1px dashed var(--line2);border-radius:8px;padding:.5rem">' +
          '<div class="evidence" style="margin:0 0 .4rem"><span class="ev-tag">TAG: ' + esc(it.tag) + '</span>\n' + esc(it.text) + '</div>' +
          '<div class="form-grid two">' +
          fld("Real medium — " + it.id, optSel(ord.options, f["m-"+it.id], ' data-f="m-' + it.id + '"')) +
          '<div class="checks" style="margin-top:1.4rem">' + chkBox("Printed tag is WRONG", "w-" + it.id, f["w-"+it.id] === true) + '</div>' +
          '</div></div>';
      });
      form.innerHTML = html;
      break;
    case "feas":
      html = "";
      ord.rows.forEach(function(r){
        html += '<div class="field" style="grid-column:1/-1;border:1px dashed var(--line2);border-radius:8px;padding:.5rem">' +
          '<div class="mono" style="font-size:.8rem;margin-bottom:.4rem">' + esc(r.text) + '</div>' +
          '<div class="form-grid two">' +
          fld("Verdict", optSel(ord.verdictOpts, f["v-"+r.id], ' data-f="v-' + r.id + '"')) +
          fld("Certified fix", optSel(r.fixes, f["x-"+r.id], ' data-f="x-' + r.id + '"')) +
          '</div></div>';
      });
      form.innerHTML = html;
      break;
    case "lat":
      form.innerHTML =
        numInput("GEO round-trip latency (ms, typical planning value)", "geo", f.geo, 'data-f="geo"') +
        numInput("LEO round-trip latency (ms, typical planning value)", "leo", f.leo, 'data-f="leo"') +
        fld("GEO verdict vs the " + ord.sla + " ms RTT SLA", optSel(ord.verdictOpts, f.vgeo, ' data-f="vgeo"')) +
        fld("LEO verdict vs the " + ord.sla + " ms RTT SLA", optSel(ord.verdictOpts, f.vleo, ' data-f="vleo"')) +
        fld("NOC recommendation", optSel(ord.recOpts, f.rec, ' data-f="rec"'));
      break;
    case "spec":
      html = "";
      ord.aps.forEach(function(ap, i){
        var opts = [];
        for(var c = 1; c <= 11; c++) opts.push("Channel " + c);
        html += fld(ap + " — new channel", '<select data-act="field" data-kind="order" data-f="ch-' + i + '"><option value="">— select —</option>' +
          opts.map(function(op, ix){ return '<option value="' + (ix+1) + '"' + (String(f["ch-"+i]) === String(ix+1) ? " selected" : "") + '>' + op + '</option>'; }).join("") + '</select>');
      });
      html += fld("Interferer", optSel(ord.interfererOpts, f.interferer, ' data-f="interferer"')) +
        fld("2.4 GHz channel width", optSel(ord.widthOpts, f.width, ' data-f="width"')) +
        fld("Density strategy", optSel(ord.strategyOpts, f.strategy, ' data-f="strategy"'));
      form.innerHTML = html;
      break;
    case "fibfix":
      form.innerHTML =
        fld("Root cause", optSel(ord.causeOpts, f.cause, ' data-f="cause"')) +
        numInput("10GBASE-SR distance limit on OM1 (meters)", "limit", f.limit, 'data-f="limit"') +
        '<div class="field" style="grid-column:1/-1"><label>Remediation set — tick every certified action</label><div class="checks">' +
        chkBox(ord.actions[0], "a-0", f["a-0"] === true) + chkBox(ord.actions[1], "a-1", f["a-1"] === true) + chkBox(ord.actions[2], "a-2", f["a-2"] === true) +
        '</div></div>';
      break;
    case "kit":
      form.innerHTML =
        fld("Primary connectivity", optSel(ord.primaryOpts, f.primary, ' data-f="primary"')) +
        fld("Fallback connectivity", optSel(ord.fallbackOpts, f.fallback, ' data-f="fallback"')) +
        '<div class="field" style="grid-column:1/-1"><label>Rejections — tick every option you are rejecting and its reason</label><div class="checks">' +
        chkBox(ord.rejects[0], "rj-0", f["rj-0"] === true) + chkBox(ord.rejects[1], "rj-1", f["rj-1"] === true) + chkBox(ord.rejects[2], "rj-2", f["rj-2"] === true) +
        '</div></div>';
      break;
    case "amp":
      html = "";
      ord.rows.forEach(function(rowLabel, i){
        html += fld(rowLabel + " — feature card", '<select data-act="field" data-kind="order" data-f="amp-' + i + '"><option value="">— place a card —</option>' +
          ord.pool.map(function(card, ix){ return '<option value="' + ix + '"' + (String(f["amp-"+i]) === String(ix) ? " selected" : "") + '>' + esc(card) + '</option>'; }).join("") +
          '</select>');
      });
      form.innerHTML = html;
      break;
    case "coaxplant":
      form.innerHTML =
        numInput("Total passive splitter loss (dB, positive number)", "total", f.total, 'data-f="total"', "2-way then 3-way, in series.") +
        fld("Drop cable", optSel(ord.rgOpts, f.rg, ' data-f="rg"')) +
        fld("Termination", optSel(ord.connOpts, f.conn, ' data-f="conn"')) +
        fld("Amplifier policy", optSel(ord.ampOpts, f.amp, ' data-f="amp"'));
      break;
    case "rackpower":
      html = "";
      ord.rows.forEach(function(r){
        html += fld(r.label, optSel(ord.linkOpts, f["lnk-" + r.id], ' data-f="lnk-' + r.id + '"'));
      });
      html += numInput("Total power saved on 8 links (watts)", "power", f.power, 'data-f="power"', ord.powerNote) +
        '<div class="field" style="grid-column:1/-1"><label>Policy line</label><select data-act="field" data-kind="order" data-f="reason">' +
        '<option value="">— select —</option>' + ord.reasons.map(function(r, i){ return '<option value="' + i + '"' + (String(f.reason) === String(i) ? " selected" : "") + '>' + esc(r) + '</option>'; }).join("") +
        '</select></div>';
      form.innerHTML = html;
      break;
    default:
      form.innerHTML = "";
  }
}


/* ---------------- live readouts (Medium = coaching; Hard = none) ---------------- */

function updateLive(oid){
  var live = $id("live-readouts"), warn = $id("live-warn");
  if(!live) return;
  var ord = ordersFor().filter(function(x){ return x.id === oid; })[0];
  if(!ord) return;
  var html = "", whtml = "";
  var f = st().orders[oid] ? st().orders[oid].fields : {};
  if(S.mode === "hard"){
    html = ro("MODE", "STRICT FIELD MODE", "") + ro("COACHING", "NONE — judge from evidence", "bad");
  } else if(ord.kind === "channels"){
    var chs = [f.ch1, f.ch2, f.ch3].map(function(x){ return parseInt(x,10); });
    var nSet = chs.filter(function(c){ return c === 1 || c === 6 || c === 11; }).length;
    var coCh = 0, adjacent = 0;
    for(var i = 0; i < 3; i++) for(var j = i+1; j < 3; j++){
      if(!isNaN(chs[i]) && !isNaN(chs[j])){
        if(chs[i] === chs[j]) coCh++;
        else if(Math.abs(chs[i] - chs[j]) <= 4) adjacent++;
      }
    }
    html = ro("NON-OVERLAPPING SET", nSet + " / 3 APs", nSet === 3 ? "good" : (nSet > 0 ? "" : "bad")) +
      ro("CO-CHANNEL PAIRS", String(coCh), coCh === 0 ? "good" : "bad") +
      ro("OVERLAPPING PAIRS (Δ≤4)", String(adjacent), adjacent === 0 ? "good" : "bad") +
      ro("WIDTH", f.width ? esc(f.width) : "—", f.width === "20 MHz" ? "good" : (f.width ? "bad" : ""));
    if(coCh > 0 || adjacent > 0) whtml = '<div class="obj-fb no">Live check: ' + (coCh > 0 ? "two APs share a channel (co-channel overlap). " : "") + (adjacent > 0 ? "two APs sit within 4 channels of each other — 20 MHz carriers bleed across. " : "") + '</div>';
    else if(f.width && f.width !== "20 MHz") whtml = '<div class="obj-fb no">Live check: bonding 40+ MHz on 2.4 GHz overlaps the neighbors — fine on 5/6 GHz, costly here.</div>';
    else if(nSet === 3) whtml = '<div class="obj-fb ok">Live check: clean plan. Certify when ready.</div>';
  } else if(ord.kind === "fiber"){
    var reach = "—", meet = "", cost = "—", pairOk = true;
    var isSMF = f.type !== undefined && f.type !== "" && ord.form.type[parseInt(f.type,10)] === "Single-mode (SMF)";
    var oName = (f.optics !== undefined && f.optics !== "") ? ord.form.optics[parseInt(f.optics,10)] : "";
    var gName = (f.grade !== undefined && f.grade !== "") ? ord.form.grade[parseInt(f.grade,10)] : "";
    if(isSMF && oName === "10GBASE-LR (SFP+)"){ reach = "10 km (LR)"; meet = "8.6 km — PASS"; cost = "$$$ optics + SMF"; }
    else if(isSMF && oName === "10GBASE-SR (SFP+)"){ pairOk = false; reach = "invalid pairing"; meet = "SR optics are multimode-only"; }
    else if(!isSMF && f.type !== undefined && f.type !== "" && oName === "10GBASE-LR (SFP+)"){ pairOk = false; reach = "invalid pairing"; meet = "LR needs single-mode glass"; }
    else if(oName === "40GBASE-SR4 (QSFP+)"){
      reach = gName === "OM3" ? "100 m" : (gName === "OM4" ? "150 m" : "not supported");
      meet = "40G — overkill, wrong form factor";
    } else if(f.type !== undefined && f.type !== "" && oName){
      reach = {"OM1":"33 m","OM3":"300 m","OM4":"400 m"}[gName] || "—";
      meet = "8.6 km — FAIL";
    }
    html = ro("REACH OF THIS COMBO", esc(reach), meet.indexOf("PASS") >= 0 ? "good" : "bad") +
      ro("VS ROUTE (8.6 km)", esc(meet), meet.indexOf("PASS") >= 0 ? "good" : "bad") +
      ro("EMI AT SUBSTATION", f.type !== undefined && f.type !== "" ? "immune (glass)" : "—", "good") +
      ro("COST CLASS", esc(cost));
    if(meet.indexOf("FAIL") >= 0) whtml = '<div class="obj-fb no">Live check: this combination cannot span 8.6 km — read the reach table in MDL-FO.</div>';
    else if(!pairOk) whtml = '<div class="obj-fb no">Live check: SR and LR optics bind to specific glass types — check the transceiver row in MDL-FO.</div>';
    else if(meet.indexOf("PASS") >= 0) whtml = '<div class="obj-fb ok">Live check: reach clears the route with margin. Certify when ready.</div>';
  } else if(ord.kind === "orbit"){
    var names = ["LEO","MEO","GEO"];
    var rtts = ["25-60 ms","130-250 ms","480-700 ms"];
    var parts = [];
    for(var k = 0; k < 3; k++){
      var v = f[ord.missions[k].key];
      parts.push(ro("M" + (k+1), v === undefined || v === "" ? "—" : names[v] + " · RTT " + rtts[v], v === undefined || v === "" ? "" : ""));
    }
    html = parts.join("");
    if(f.m1 !== undefined && f.m2 !== undefined && f.m3 !== undefined && f.m1 !== "" && f.m2 !== "" && f.m3 !== ""){
      whtml = '<div class="obj-fb hint">Readouts only — the certification check decides. GEO physics: ~72,000 km round trip at light speed.</div>';
    }
  } else if(ord.kind === "coax"){
    var rgInfo = {"RG-6":"18 AWG, quad shield, 75 Ω","RG-59":"20 AWG, thin, 75 Ω","RG-58":"50 Ω legacy Thinnet"}[ord.options.rg[parseInt(f.rg,10)]] || "—";
    html = ro("CABLE", esc(rgInfo)) + ro("YOUR LOSS ENTRY", f.loss ? esc(f.loss) + " dB" : "—", "") ;
    if(ord.options.rg[parseInt(f.rg,10)] === "RG-59") whtml = '<div class="obj-fb no">Live check: RG-59 thins out at high frequency — 60 m of DOCSIS carriers is its classic failure.</div>';
    if(ord.options.rg[parseInt(f.rg,10)] === "RG-58") whtml = '<div class="obj-fb no">Live check: RG-58 is 50 Ω legacy Ethernet — wrong impedance for TV plant.</div>';
  } else if(ord.kind === "dac"){
    var l1 = f.l1, l2 = f.l2;
    var l1n = (l1 !== undefined && l1 !== "") ? ord.linkOpts[parseInt(l1,10)] : "";
    var l2n = (l2 !== undefined && l2 !== "") ? ord.linkOpts[parseInt(l2,10)] : "";
    var l1txt = {"Passive DAC":"passive OK","Active DAC":"active OK (overkill)","AOC":"AOC (overkill)","SMF + LR optics":"optics (1 W+)"}[l1n] || "—";
    var l2txt = {"Passive DAC":"FAILS: > ~5 m passive limit","Active DAC":"active OK","AOC":"AOC OK","SMF + LR optics":"optics OK"}[l2n] || "—";
    html = ro("1.5 m LINK", esc(l1txt), l1n === "Passive DAC" ? "good" : "") +
      ro("6 m LINK", esc(l2txt), (l2n === "Active DAC" || l2n === "AOC") ? "good" : (l2n === "Passive DAC" ? "bad" : "")) +
      ro("POWER CLASS", "DAC 0.1-0.5 W vs optics ~1 W+", "good");
    if(l2n === "Passive DAC") whtml = '<div class="obj-fb no">Live check: 6 m exceeds the ~5 m passive limit — passive DAC has no electronics to drive it.</div>';
  } else {
    html = ro("TICKETS", "3", "") + ro("METHOD", "evidence → medium physics → cause", "good");
  }
  live.innerHTML = html;
  warn.innerHTML = whtml;
}
function ro(l, v, cls){ return '<div class="readout"><div class="ro-l">' + esc(l) + '</div><div class="ro-v ' + (cls||"") + '">' + v + '</div></div>'; }


var PILLARS = { P1:["UNDERSTAND","#475569"], P2:["RECOGNIZE","#0e7490"], P3:["DETECT","#b45309"], P4:["MITIGATE","#c2410c"] };


/* ---------------- matrix panel ---------------- */

function renderMatrix(){
  var host = $id("panel-matrix");
  host.innerHTML = "";
  var h = el("div", "panel-head");
  h.innerHTML = '<h2>Selection & properties matrices</h2><span class="ph-sub">The compare-and-contrast heart of objective 1.5 — every row is graded.</span>';
  host.appendChild(h);
  [MATRIX.sel, MATRIX.prop].forEach(function(mx){
    var sec = el("div");
    sec.innerHTML = '<h3 style="margin:.4rem 0 .2rem">' + esc(mx.title) + ' <span class="oblink">' + esc(mx.obj) + '</span></h3><p class="ph-sub" style="margin-bottom:.4rem">' + esc(mx.intro) + '</p>';
    var tbl = document.createElement("table");
    tbl.className = "mtable";
    var mstate = st().matrix[mx === MATRIX.sel ? "sel" : "prop"];
    var rows = mx.rows.map(function(r){
      var v = mstate[r.id];
      var opts = ['<option value="">— select —</option>'];
      r.opts.forEach(function(op, i){ opts.push('<option value="' + i + '"' + (String(v) === String(i) ? " selected" : "") + '>' + esc(op) + '</option>'); });
      return '<tr><td class="sc">' + esc(r.text) + '</td><td><select aria-label="' + esc(r.text) + '" data-act="field" data-kind="matrix" data-f="' + (mx === MATRIX.sel ? "sel" : "prop") + '" data-fid="' + r.id + '">' + opts.join("") + '</select></td></tr>';
    }).join("");
    tbl.innerHTML = '<thead><tr><th>Ask / property</th><th style="width:34%">Your call</th></tr></thead><tbody>' + rows + '</tbody>';
    sec.appendChild(tbl);
    var b = el("button", "btn btn-primary");
    b.type = "button";
    b.textContent = "CHECK " + mx.obj;
    b.addEventListener("click", function(){
      var res = checkObjective(mx.obj);
      toast(mx.obj + ": " + (res.pass ? "all rows correct" : "rows still wrong — see cert card"));
    });
    sec.appendChild(b);
    host.appendChild(sec);
  });
}


/* ---------------- field notes panel ---------------- */

function renderNotes(){
  var host = $id("panel-notes");
  host.innerHTML = "";
  var h = el("div", "panel-head");
  h.innerHTML = '<h2>Field notes — the defender&rsquo;s summary</h2><span class="ph-sub">Everything the bench taught, in hand-off form.</span>';
  host.appendChild(h);
  var det = el("div", "note-sec");
  var rows = NOTES.detection.map(function(r){
    return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>";
  }).join("");
  det.innerHTML = '<h3>Detection opportunities</h3><table><thead><tr><th>Medium</th><th>What to monitor</th><th>Example trigger</th></tr></thead><tbody>' + rows + '</tbody></table>';
  host.appendChild(det);
  var mit = el("div", "note-sec");
  mit.innerHTML = '<h3>Mitigation playbook</h3><table><thead><tr><th>Area</th><th>Control (with official anchors)</th></tr></thead><tbody>' +
    NOTES.mitigation.map(function(r){ return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("") +
    '</tbody></table><p class="ph-sub" style="margin-top:.4rem">Anchors: Wi-Fi channel/WPA practice per Wi-Fi Alliance &amp; IEEE 802.11; DOCSIS plant per CableLabs DOCSIS 3.x; fiber reach per IEEE 802.3 clause tables (10GBASE-SR/LR, 40GBASE-SR4) — figures as taught in N10-009 objective 1.5.</p>';
  host.appendChild(mit);
  var blue = el("div", "note-sec");
  blue.innerHTML = "<h3>Blue-team takeaways</h3><ul>" + NOTES.blue.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  host.appendChild(blue);
  var red = el("div", "note-sec");
  red.innerHTML = "<h3>Red-team mindset (defensive use)</h3><ul>" + NOTES.red.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  host.appendChild(red);
  var links = el("div", "note-sec");
  links.innerHTML = "<h3>Official references (open in a new tab)</h3><ul>" +
    NOTES.links.map(function(l){ return '<li><a href="' + l[1] + '" target="_blank" rel="noopener noreferrer">' + esc(l[0]) + "</a></li>"; }).join("") +
    '</ul><p class="ph-sub">All orgs, evidence and readings in this lab are synthetic training data. Simplified models: reach/latency figures are spec-sheet values, not guarantees.</p>';
  host.appendChild(links);
}


/* ---------------- cert card ---------------- */

function renderCard(){
  var host = $id("objList");
  host.innerHTML = "";
  var objs = objListFor();
  var doneCount = objs.filter(function(o){ var r = st().objectives[o.id]; return r && r.done; }).length;
  $id("cardCount").textContent = doneCount + " / " + objs.length + " DONE";
  var nextMarked = false;
  objs.forEach(function(o){
    var rec = st().objectives[o.id] || {done:false, attempts:0, firstTry:null, last:null, passed:false};
    var p = PILLARS[o.pillar];
    var row = el("div", "obj-row" + (!rec.done && !nextMarked ? " next" : ""));
    if(!rec.done) nextMarked = true;
    row.innerHTML =
      '<div class="obj-top"><span class="pillar" style="background:' + p[1] + '">' + o.pillar + " " + p[0] + '</span>' +
      '<span class="obj-id">' + o.id + '</span>' +
      '<span class="obj-status" aria-hidden="true">' + (rec.done ? "✔" : "○") + '</span></div>' +
      '<div class="obj-text">' + esc(o.text) + '</div>' +
      '<span class="obj-anchor">' + esc(o.anchor) + (rec.done ? " · first attempt: " + (rec.firstTry ? "clean" : "after retries") : "") + '</span>';
    var actions = el("div", "obj-actions");
    var hc = hintsCount(o.id);
    var bchk = el("button", "btn");
    bchk.type = "button"; bchk.textContent = "CHECK RESULTS";
    bchk.addEventListener("click", function(){
      var res = checkObjective(o.id);
      toast(o.id + ": " + (res.pass ? "PASS" : "not yet"));
    });
    actions.appendChild(bchk);
    var bhint = el("button", "btn btn-ghost");
    bhint.type = "button";
    bhint.textContent = S.mode === "hard" ? "NUDGE (costs score)" : "HINT " + Math.min(hc + 1, o.hints.length) + "/3";
    bhint.addEventListener("click", function(){ hintObjective(o.id); });
    actions.appendChild(bhint);
    var bgo = el("button", "btn btn-ghost");
    bgo.type = "button";
    bgo.textContent = o.go.type === "module" ? "Open module →" : (o.go.type === "order" ? "Open order →" : "Open panel →");
    bgo.addEventListener("click", function(){ goObjective(o); });
    actions.appendChild(bgo);
    var lamp = el("span", "hintlamp");
    lamp.textContent = "hints used: " + hc + (S.mode === "hard" ? " (each nudge costs a star point)" : "");
    actions.appendChild(lamp);
    row.appendChild(actions);
    if(rec.last){
      var fb = el("div", "obj-fb " + (rec.passed ? "ok" : (rec.lastIsHint ? "hint" : "no")));
      fb.textContent = rec.last;
      row.appendChild(fb);
    } else if(rec.done){
      var fb2 = el("div", "obj-fb ok");
      fb2.textContent = o.fbOk;
      row.appendChild(fb2);
    }
    host.appendChild(row);
  });
  renderFinishBox();
}
function hintsCount(id){ return st().hints[id] || 0; }
function hintObjective(id){
  var o = objListFor().filter(function(x){ return x.id === id; })[0];
  if(!o) return;
  var n = hintsCount(id);
  if(n >= o.hints.length){
    toast("No more hints for " + id + " — everything is on the bench");
    return;
  }
  var rec = st().objectives[id] || (st().objectives[id] = {done:false, attempts:0, firstTry:null, last:null, passed:false});
  rec.last = "HINT " + (n+1) + " — " + o.hints[n];
  rec.lastIsHint = true;
  st().hints[id] = n + 1;
  save(); renderCard();
  toast("Hint revealed" + (S.mode === "hard" ? " — this costs score" : ""));
  sr("Hint revealed for " + id);
}
function goObjective(o){
  if(o.go.type === "module"){ selectPanel("orders"); openModule(o.go.id); }
  else if(o.go.type === "order"){ selectPanel("orders"); openOrder(o.go.id); }
  else { selectPanel(o.go.id); }
  if(window.innerWidth < 1200) closeCard();
}


/* ---------------- meter / header ---------------- */

function updateMeter(){
  var objs = objListFor();
  var d = doneCount();
  var quiz = st().quiz.answers;
  var qc = 0;
  quizFor().forEach(function(q, i){ if(quiz[i] !== undefined && quiz[i] === q.ans) qc++; });
  $id("readout").textContent = d + "/" + objs.length + " objectives · quiz " + qc + "/" + quizFor().length;
  var frac = (d + qc * 0.5) / (objs.length + quizFor().length * 0.5);
  $id("meterFill").style.width = Math.round(frac * 100) + "%";
  $id("modeBadge").textContent = S.mode.toUpperCase();
  $id("modeBadge").className = "mode-badge " + S.mode;
  renderFinishBox();
}


/* ---------------- completion ---------------- */

function finishEligible(){
  var objs = objListFor();
  if(objs.some(function(o){ var r = st().objectives[o.id]; return !r || !r.done; })) return false;
  return st().quiz.done;
}
function calcStars(){
  var objs = objListFor();
  var first = 0;
  objs.forEach(function(o){ var r = st().objectives[o.id]; if(r && r.done && r.firstTry) first++; });
  var ft = first / objs.length;
  var qc = 0, total = quizFor().length;
  var ans = st().quiz.answers;
  quizFor().forEach(function(q, i){ if(ans[i] === q.ans) qc++; });
  var qq = qc / total;
  var base = 0.6 * ft + 0.4 * qq;
  var stars = 1 + Math.round(4 * base);
  var hintsTotal = 0;
  Object.keys(st().hints).forEach(function(k){ hintsTotal += st().hints[k]; });
  if(hintsTotal > (S.mode === "hard" ? 2 : 6)) stars = Math.max(1, stars - 1);
  return Math.max(1, Math.min(5, stars));
}
function renderFinishBox(){
  var host = $id("finishBox");
  if(!host) return;
  var d = doneCount(), n = objListFor().length;
  if(finishEligible()){
    if(st().finished){
      host.innerHTML = '<div class="finish-box"><strong>Lab complete — ' + "★".repeat(st().stars || 1) + "☆".repeat(5 - (st().stars || 1)) + '</strong><p>All objectives certified and the knowledge check done.</p><button class="btn" id="btn-view-results" type="button">View results again</button></div>';
      var v = $id("btn-view-results");
      if(v) v.addEventListener("click", openCompletion);
    } else {
      host.innerHTML = '<div class="finish-box"><strong>All ' + n + ' objectives certified + knowledge check done.</strong><p>Ready to grade: stars reflect first-attempt accuracy and hint usage.</p><button class="btn btn-primary" id="btn-finish" type="button">FINISH &amp; GRADE</button></div>';
      var f = $id("btn-finish");
      if(f) f.addEventListener("click", openCompletion);
    }
  } else {
    host.innerHTML = '<div class="finish-box"><strong>' + d + " / " + n + ' objectives certified</strong><p>' +
      (st().quiz.done ? "Knowledge check done. Certify the remaining orders to unlock grading." : "Certify every order, then complete the knowledge check on the QUIZ panel to unlock grading.") + '</p></div>';
  }
}
/* R8: focus areas derived from the student's own evidence —
   objectives that took retries or hints, plus missed quiz items. */
function focusAreas(){
  var out = [];
  var ans = st().quiz.answers;
  quizFor().forEach(function(q, i){
    if(ans[i] !== undefined && ans[i] !== q.ans){
      out.push({t:"Quiz Q" + (i+1) + " — " + q.q, why:"missed on the knowledge check — the explanation is on the QUIZ panel", quiz:true});
    }
  });
  var objs = objListFor();
  objs.forEach(function(o){
    var r = st().objectives[o.id];
    if(!r || !r.done) return;
    var h = st().hints[o.id] || 0;
    if(!r.firstTry || h > 0){
      var bits = [];
      if(!r.firstTry) bits.push("took " + r.attempts + " attempts");
      if(h) bits.push(h + " hint" + (h > 1 ? "s" : "") + " used");
      out.push({t:o.text, why:bits.join(" · "), go:o});
    }
  });
  return out;
}
function openCompletion(){
  var stars = calcStars();
  st().finished = true;
  st().stars = stars;
  save();
  renderFinishBox();
  var objs = objListFor();
  var first = objs.filter(function(o){ var r = st().objectives[o.id]; return r && r.done && r.firstTry; }).length;
  var qc = 0, total = quizFor().length;
  var ans = st().quiz.answers;
  quizFor().forEach(function(q, i){ if(ans[i] === q.ans) qc++; });
  var byP = {P1:[], P2:[], P3:[], P4:[]};
  objs.forEach(function(o){
    if(st().objectives[o.id] && st().objectives[o.id].done) byP[o.pillar].push(o.id);
  });
  var recap = Object.keys(byP).map(function(k){
    return "<h4>" + k + " " + PILLARS[k][0] + "</h4><ul>" + byP[k].map(function(id){ return "<li>" + esc(id) + "</li>"; }).join("") + "</ul>";
  }).join("");
  var focus = focusAreas();
  var focusHtml;
  if(focus.length === 0){
    focusHtml = '<h4>Focus areas for your next session</h4><p class="ph-sub">None flagged — first-attempt clean on every objective and the full knowledge check. Stretch goal: re-run HARD mode on exam eve.</p>';
  } else {
    focusHtml = '<h4>Focus areas for your next session</h4><ul class="focus-list">' +
      focus.slice(0, 8).map(function(fx){
        return "<li><strong>" + esc(fx.t) + "</strong> — " + esc(fx.why) + ".</li>";
      }).join("") + "</ul>";
  }
  var next = S.mode === "medium" ?
    "Next: run HARD mode — same bench, strict grading, two lying evidence tags. Then Chapter 1.7 (network devices) and Ethernet standards build directly on media properties." :
    "Next: re-run any failed first-attempts in MEDIUM (each mode keeps its own progress), then practice subnetting (objective 1.4) and routing (Domain 2) — media choices keep showing up there.";
  showModal(
    '<h3>Bench certification complete</h3>' +
    '<div class="stars" aria-label="' + stars + ' of 5 stars">' + "★".repeat(stars) + "☆".repeat(5 - stars) + '</div>' +
    '<p><strong>' + doneCount() + "/" + objs.length + ' objectives · knowledge check ' + qc + '/' + total + ' · first-attempt clean on ' + first + '/' + objs.length + '</strong></p>' +
    '<p class="ph-sub">Stars weigh first-attempt accuracy (60%) and quiz accuracy (40%); heavy hint use costs a point. ' + (S.mode === "hard" ? "Hard mode: one nudge allowed." : "") + '</p>' +
    '<div class="recap">' + focusHtml + '</div>' +
    '<div class="recap">' + recap + '</div>' +
    '<p class="ph-sub">' + esc(next) + '</p>' +
    '<p class="ph-sub">You can now: explain each medium and its trade-offs, recognize media in real evidence, plan channels and dB budgets, and defend a media selection — the full N10-009 objective 1.5 skill.</p>',
    [{label:"Back to the bench", cls:"btn btn-primary", fn:closeModal}]
  );
  sr("Lab complete. " + stars + " of 5 stars.");
}


/* ---------------- modals ---------------- */

var lastFocusEl = null;
function showModal(html, actions){
  var root = $id("modalRoot");
  root.innerHTML = "";
  lastFocusEl = document.activeElement;
  var m = el("div", "modal");
  m.setAttribute("role", "dialog");
  m.setAttribute("aria-modal", "true");
  m.innerHTML = html;
  var act = el("div", "m-actions");
  (actions || []).forEach(function(a){
    var b = el("button", a.cls || "btn");
    b.type = "button";
    b.textContent = a.label;
    b.addEventListener("click", function(){ if(a.fn) a.fn(); });
    act.appendChild(b);
  });
  m.appendChild(act);
  root.appendChild(m);
  root.hidden = false;
  var fb = m.querySelector("button");
  if(fb) fb.focus();
}
function closeModal(){
  $id("modalRoot").hidden = true;
  $id("modalRoot").innerHTML = "";
  if(lastFocusEl && lastFocusEl.focus) lastFocusEl.focus();
  lastFocusEl = null;
}
