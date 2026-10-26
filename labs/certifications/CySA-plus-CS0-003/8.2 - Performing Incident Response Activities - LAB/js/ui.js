// ─── CyberLab · js/ui.js — component library of the Incident Command Deck ──
// Faithful vanilla-JS port of the React components (src/components/lab/ir/*).
// Every component follows the same pattern:
//     build(opts) → { el, update(state) }
// `update` patches ONLY classes / text / aria attributes on stable nodes, so
// focus, <details> open state and text carets survive state changes exactly
// the way React's reconciliation preserved them in the original.
// Event handlers mutate state through LAB.setState (state.js); re-rendering
// is driven centrally by app.js subscriptions.

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  // ── tiny DOM builder ─────────────────────────────────────────────────────
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (k === 'class') el.className = props[k];
        else if (k === 'text') el.textContent = props[k];
        else if (k === 'html') el.innerHTML = props[k]; // trusted static markup only
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), props[k]);
        else if (k === 'dataset') for (var d in props[k]) el.dataset[d] = props[k][d];
        else el.setAttribute(k, props[k]);
      }
    }
    for (var i = 2; i < arguments.length; i++) appendChild(el, arguments[i]);
    return el;
  }
  function appendChild(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) appendChild(el, c[i]); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function defaultProg() { return { status: 'unmet', attempts: 0, fails: 0, hintsUsed: 0 }; }
  function has(list, x) { return list.indexOf(x) !== -1; }
  function setClass(el, on, cls) { if (on) el.classList.add(cls); else el.classList.remove(cls); }
  function setDisabled(btn, dis) {
    if (dis) btn.setAttribute('disabled', '');
    else btn.removeAttribute('disabled');
  }

  // ═══ shared kit pieces (port of kit.tsx) ═════════════════════════════════

  var PILLARS = {
    P1: { cls: 'pillar-badge p1', label: 'P1 · UNDERSTAND' },
    P2: { cls: 'pillar-badge p2', label: 'P2 · ANALYZE' },
    P3: { cls: 'pillar-badge p3', label: 'P3 · DETECT' },
    P4: { cls: 'pillar-badge p4', label: 'P4 · MITIGATE' },
  };

  function pillarBadge(pillar) {
    return h('span', { class: PILLARS[pillar].cls, text: PILLARS[pillar].label });
  }

  /** Status icon slot — swaps between circle / emerald check / rose x. */
  function statusSlot() {
    var slot = h('span', { class: 'status-slot' });
    function render(status) {
      slot.innerHTML = '';
      if (status === 'passed') slot.appendChild(LAB.icon('CheckCircle2', 'h-4 w-4 icon-emerald'));
      else if (status === 'failed') slot.appendChild(LAB.icon('XCircle', 'h-4 w-4 icon-rose'));
      else slot.appendChild(LAB.icon('Circle', 'h-4 w-4 icon-slate'));
    }
    return { el: slot, render: render };
  }

  // ── objective card (C4) ──────────────────────────────────────────────────
  function objectiveCard(objId, ctx) {
    var obj = objById(objId);
    var mode = LAB.getState().mode;
    var hintMax = mode === 'medium' ? 3 : 1;
    var hintOpen = false; // component state, like the original useState(false)

    var metaRow = h('div', { class: 'obj-meta' },
      h('span', { class: 'mono obj-id', text: obj.id }),
      pillarBadge(obj.pillar),
      h('span', { class: 'mono obj-anchor', text: '↳ ' + obj.anchor }));
    var status = statusSlot();
    var card = h('div', { class: 'obj-card' },
      h('div', { class: 'obj-head' },
        h('div', { class: 'obj-min' }, metaRow,
          h('p', { class: 'obj-title', text: obj.title }),
          mode === 'medium' ? h('p', { class: 'obj-context', text: obj.context }) : null),
        status.el));
    var hintBox = h('div', { class: 'hint-box', hidden: true });
    var resBox = h('div', { class: 'result-box', role: 'status', 'aria-live': 'polite', hidden: true });
    card.appendChild(hintBox);
    card.appendChild(resBox);

    var checkBtn = h('button', { type: 'button', class: 'btn btn-amber btn-sm btn-min11', text: 'CHECK RESULTS', onclick: function () { ctx.onCheck(obj.id); } });
    var hintBtn = h('button', { type: 'button', class: 'btn btn-hint btn-sm btn-min11' });
    var doneSpan = h('span', { class: 'mono done-label', text: 'OBJECTIVE COMPLETE' });
    var attSpan = h('span', { class: 'mono attempts' });
    var actions = h('div', { class: 'obj-actions' }, checkBtn, hintBtn, doneSpan, attSpan);
    card.appendChild(actions);

    function renderHint() {
      var prog = LAB.getState().objectives[obj.id] || defaultProg();
      if (hintOpen && prog.hintsUsed > 0) {
        hintBox.hidden = false;
        hintBox.innerHTML = '';
        for (var i = 0; i < prog.hintsUsed; i++) {
          hintBox.appendChild(h('p', { class: 'hint-line' },
            h('span', { class: 'mono hint-tag', text: 'HINT ' + (i + 1) + '/' + hintMax }),
            document.createTextNode(obj.hints[i])));
        }
      } else {
        hintBox.hidden = true;
        hintBox.innerHTML = '';
      }
    }

    function renderHintBtn(prog) {
      var hintsLeft = hintMax - prog.hintsUsed;
      var show = prog.status !== 'passed' && hintsLeft > 0;
      hintBtn.hidden = !show;
      if (!show) return;
      hintBtn.innerHTML = '';
      hintBtn.appendChild(LAB.icon('Lightbulb', 'h-3.5 w-3.5 btn-ico'));
      hintBtn.appendChild(document.createTextNode(mode === 'hard' ? 'Nudge (−0.5★)' : 'Hint ' + (prog.hintsUsed + 1) + '/' + hintMax));
    }

    function update(s) {
      var prog = s.objectives[obj.id] || defaultProg();
      var res = ctx.results[obj.id] || null;
      var passed = prog.status === 'passed';

      setClass(card, passed, 'passed');
      status.render(prog.status);
      renderHint();
      renderHintBtn(prog);

      if (res) {
        resBox.hidden = false;
        setClass(resBox, res.pass, 'pass');
        setClass(resBox, !res.pass, 'fail');
        resBox.innerHTML = '';
        resBox.appendChild(h('span', { class: 'mono result-tag', text: res.pass ? '✓ CHECK PASSED' : '✗ CHECK FAILED' }));
        resBox.appendChild(document.createTextNode(res.feedback));
      } else {
        resBox.hidden = true;
        resBox.innerHTML = '';
      }

      checkBtn.hidden = passed;
      doneSpan.hidden = !passed;
      attSpan.hidden = !(prog.attempts > 0);
      if (prog.attempts > 0) attSpan.textContent = 'attempts: ' + prog.attempts + ' · hints: ' + prog.hintsUsed;
    }

    hintBtn.addEventListener('click', function () {
      hintOpen = true;
      ctx.onHint(obj.id);
    });

    update(LAB.getState());
    return { el: card, update: update };
  }

  function objById(id) {
    var list = LAB.OBJECTIVES_M.concat(LAB.OBJECTIVES_H);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    throw new Error('Unknown objective ' + id);
  }

  /** Stack of objective cards for a station (shared update loop). */
  function objCardStack(ids, ctx) {
    var cards = ids.map(function (id) { return objectiveCard(id, ctx); });
    var el = h('div', { class: 'obj-stack' }, cards.map(function (c) { return c.el; }));
    return { el: el, update: function (s) { for (var i = 0; i < cards.length; i++) cards[i].update(s); } };
  }

  // ── radio cards ──────────────────────────────────────────────────────────
  // opts: { name, options:[{id,text,sub?}], getValue(s), apply(id),
  //         getState?(s), getDisabled?(s), columns? }
  function radioCards(opts) {
    var group = h('div', { class: 'radio-group' + (opts.columns === 2 ? ' cols-2' : ''), role: 'radiogroup', 'aria-label': opts.name });
    var btns = [];
    for (var i = 0; i < opts.options.length; i++) {
      (function (o) {
        var marker = h('span', { class: 'mono radio-marker', 'aria-hidden': 'true', text: '○' });
        var b = h('button', { type: 'button', role: 'radio', 'aria-checked': 'false', class: 'radio-card', 'data-oid': o.id },
          marker, document.createTextNode(o.text),
          o.sub ? h('span', { class: 'radio-sub', text: o.sub }) : null);
        b.addEventListener('click', function () { if (!b.hasAttribute('disabled')) opts.apply(o.id); });
        group.appendChild(b);
        btns.push({ o: o, b: b, marker: marker });
      })(opts.options[i]);
    }
    function update(s) {
      var val = opts.getValue(s);
      var st = opts.getState ? opts.getState(s) : null;
      var dis = opts.getDisabled ? opts.getDisabled(s) : false;
      for (var i = 0; i < btns.length; i++) {
        var o = btns[i].o, b = btns[i].b, marker = btns[i].marker;
        var selected = val === o.id;
        var state = st ? st[o.id] : null;
        b.className = 'radio-card' + (opts.columns === 2 ? '' : '') + (state === 'correct' ? ' correct' : state === 'wrong' ? ' wrong' : selected ? ' selected' : '');
        b.setAttribute('aria-checked', selected ? 'true' : 'false');
        setDisabled(b, !!dis);
        marker.textContent = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : selected ? '◉' : '○';
      }
    }
    update(LAB.getState());
    return { el: group, update: update };
  }

  // ── order builder (warm-up / chain / runbook sequence) ───────────────────
  // opts: { pool:[{id,label,sub?}], getSeq(s), append(id), remove(id),
  //         move(id,dir), reset(), poolLabel, seqLabel, accent:'amber'|'violet' }
  function orderBuilder(opts) {
    var poolEl = h('div', { class: 'ob-pool' });
    var poolBtns = {};
    for (var i = 0; i < opts.pool.length; i++) {
      (function (p) {
        var b = h('button', { type: 'button', class: 'pool-card' },
          h('span', { class: 'pool-label', text: p.label }),
          p.sub ? h('span', { class: 'pool-sub', text: p.sub }) : null);
        b.addEventListener('click', function () { opts.append(p.id); });
        poolEl.appendChild(b);
        poolBtns[p.id] = b;
      })(opts.pool[i]);
    }
    var seqOl = h('ol', { class: 'ob-seq' });
    var emptyEl = h('div', { class: 'ob-empty', text: 'Click cards from the pool to build the sequence ↑' });
    var resetBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-seq-reset', text: '' });
    resetBtn.appendChild(LAB.icon('RotateCcw', 'h-3 w-3 btn-ico'));
    resetBtn.appendChild(document.createTextNode('RESET'));
    resetBtn.addEventListener('click', function () { opts.reset(); });
    var seqHead = h('div', { class: 'ob-seq-head' }, h('p', { class: 'mono ob-label', text: '▸ ' + opts.seqLabel }), resetBtn);
    var seqCol = h('div', { class: 'ob-col' }, seqHead, emptyEl, seqOl);
    var grid = h('div', { class: 'order-grid' },
      h('div', { class: 'ob-col' }, h('p', { class: 'mono ob-label', text: '▸ ' + opts.poolLabel }), poolEl),
      seqCol);

    var liMap = {}; // id → li (keyed reconciliation, same keying as React)

    function buildLi(item) {
      var num = h('span', { class: 'seq-num' });
      var body = h('div', { class: 'seq-body' },
        h('p', { class: 'seq-label', text: item.label }),
        item.sub ? h('p', { class: 'seq-sub', text: item.sub }) : null);
      var upBtn = h('button', { type: 'button', class: 'seq-btn up', 'aria-label': 'Move ' + item.label + ' up' });
      upBtn.appendChild(LAB.icon('ArrowUp', 'h-3.5 w-3.5'));
      var downBtn = h('button', { type: 'button', class: 'seq-btn down', 'aria-label': 'Move ' + item.label + ' down' });
      downBtn.appendChild(LAB.icon('ArrowDown', 'h-3.5 w-3.5'));
      var rmBtn = h('button', { type: 'button', class: 'seq-btn rm', 'aria-label': 'Remove ' + item.label });
      rmBtn.appendChild(LAB.icon('XCircle', 'h-3.5 w-3.5'));
      upBtn.addEventListener('click', function () { opts.move(item.id, -1); });
      downBtn.addEventListener('click', function () { opts.move(item.id, 1); });
      rmBtn.addEventListener('click', function () { opts.remove(item.id); });
      return h('li', { class: 'seq-item ' + opts.accent, dataset: { sid: item.id } }, num, body, h('div', { class: 'seq-btns' }, upBtn, downBtn, rmBtn));
    }

    function update(s) {
      var seq = opts.getSeq(s);
      for (var pid in poolBtns) {
        var used = has(seq, pid);
        setDisabled(poolBtns[pid], used);
        setClass(poolBtns[pid], used, 'used');
      }
      resetBtn.hidden = !(seq.length > 0);
      emptyEl.hidden = seq.length !== 0;
      // remove gone
      for (var id in liMap) if (!has(seq, id)) { liMap[id].remove(); delete liMap[id]; }
      // add new + reorder
      for (var i = 0; i < seq.length; i++) {
        var sid = seq[i];
        if (!liMap[sid]) {
          var item = null;
          for (var j = 0; j < opts.pool.length; j++) if (opts.pool[j].id === sid) item = opts.pool[j];
          liMap[sid] = buildLi(item);
        }
        seqOl.appendChild(liMap[sid]);
      }
      // patch numbers + button states
      for (var k = 0; k < seq.length; k++) {
        var li = liMap[seq[k]];
        li.querySelector('.seq-num').textContent = k + 1;
        var up = li.querySelector('.seq-btn.up');
        var down = li.querySelector('.seq-btn.down');
        setDisabled(up, k === 0);
        setDisabled(down, k === seq.length - 1);
      }
    }
    update(LAB.getState());
    return { el: grid, update: update };
  }

  // ── evidence stream (identify) ───────────────────────────────────────────
  // opts: { items, mode, getFlagged(s), getTriage(s),
  //         onFlag(id,on), onTriage(id,v) }
  function evidenceStream(opts) {
    var wrap = h('div', { class: 'stream', 'aria-label': 'Alert stream' });
    var rows = [];
    for (var i = 0; i < opts.items.length; i++) {
      (function (e) {
        var details = h('details', { class: 'stream-item', dataset: { eid: e.id } });
        var sum = h('summary', { class: 'stream-sum' });
        if (opts.mode === 'medium') {
          var chk = h('input', { type: 'checkbox', class: 'stream-flag', 'aria-label': 'Flag ' + e.id + ' as part of the incident' });
          chk.addEventListener('click', function (ev) { ev.stopPropagation(); });
          chk.addEventListener('change', function () { opts.onFlag(e.id, chk.checked); });
          sum.appendChild(chk);
        } else {
          var chips = h('span', { class: 'hard-chips' });
          var inc = h('button', { type: 'button', class: 'chip chip-inc', 'aria-pressed': 'false', 'aria-label': 'Mark ' + e.id + ' as part of the incident', text: 'INC' });
          var ni = h('button', { type: 'button', class: 'chip chip-ni', 'aria-pressed': 'false', 'aria-label': 'Mark ' + e.id + ' as not part of the incident', text: 'N-I' });
          inc.addEventListener('click', function (ev) { ev.preventDefault(); opts.onTriage(e.id, 'incident'); });
          ni.addEventListener('click', function (ev) { ev.preventDefault(); opts.onTriage(e.id, 'not'); });
          chips.appendChild(inc); chips.appendChild(ni);
          sum.appendChild(chips);
        }
        sum.appendChild(h('span', { class: 'mono stream-time', text: e.time }));
        sum.appendChild(h('span', { class: 'mono stream-src', text: e.source }));
        sum.appendChild(h('span', { class: 'stream-text', text: e.summary }));
        var chev = LAB.icon('ChevronDown', 'h-3.5 w-3.5 stream-chevron');
        sum.appendChild(chev);
        var body = h('div', { class: 'stream-body' }, h('p', { class: 'stream-detail', text: e.detail }));
        details.appendChild(sum); details.appendChild(body);
        wrap.appendChild(details);
        rows.push({ e: e, details: details, chk: chk, inc: inc, ni: ni });
      })(opts.items[i]);
    }
    function update(s) {
      if (opts.mode === 'medium') {
        var flagged = opts.getFlagged(s);
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var isF = has(flagged, r.e.id);
          r.chk.checked = isF;
          setClass(r.details, isF, 'flagged-m');
        }
      } else {
        var tri = opts.getTriage(s);
        for (var j = 0; j < rows.length; j++) {
          var rr = rows[j];
          var t = tri[rr.e.id];
          rr.inc.setAttribute('aria-pressed', t === 'incident' ? 'true' : 'false');
          rr.ni.setAttribute('aria-pressed', t === 'not' ? 'true' : 'false');
          setClass(rr.inc, t === 'incident', 'on');
          setClass(rr.ni, t === 'not', 'on');
          setClass(rr.details, t === 'incident', 'tri-inc');
          setClass(rr.details, t === 'not', 'tri-not');
        }
      }
    }
    update(LAB.getState());
    return { el: wrap, update: update };
  }

  // ── metric input ─────────────────────────────────────────────────────────
  function metricInput(label, hint, getValue, apply) {
    var input = h('input', { type: 'text', class: 'metric-input', placeholder: 'e.g. 7h05m · 7:05 · 425m', 'aria-label': label });
    input.addEventListener('input', function () { apply(input.value); });
    var el = h('div', { class: 'metric-field' },
      h('label', { class: 'mono metric-label', text: label }),
      input,
      h('p', { class: 'metric-hint', text: hint }));
    return {
      el: el,
      update: function (s) {
        var v = getValue(s);
        if (input.value !== v) input.value = v; // never fight the caret while typing
      },
    };
  }

  // ── classification row (hard: findings + notifications) ──────────────────
  // opts: { title, sub?, options:[{id,label}], getValue(s), apply(id), name }
  function classifyRow(opts) {
    var chips = h('div', { class: 'cr-chips', role: 'radiogroup', 'aria-label': opts.name });
    var btns = [];
    for (var i = 0; i < opts.options.length; i++) {
      (function (o) {
        var b = h('button', { type: 'button', role: 'radio', 'aria-checked': 'false', class: 'chip-opt', 'data-oid': o.id, text: o.label });
        b.addEventListener('click', function () { opts.apply(o.id); });
        chips.appendChild(b);
        btns.push({ o: o, b: b });
      })(opts.options[i]);
    }
    var el = h('div', { class: 'classify-row' },
      h('p', { class: 'cr-title', text: opts.title }),
      opts.sub ? h('p', { class: 'cr-sub', text: opts.sub }) : null,
      chips);
    function update(s) {
      var val = opts.getValue(s);
      for (var i = 0; i < btns.length; i++) {
        var sel = val === btns[i].o.id;
        btns[i].b.setAttribute('aria-checked', sel ? 'true' : 'false');
        setClass(btns[i].b, sel, 'selected');
      }
    }
    update(LAB.getState());
    return { el: el, update: update };
  }

  // ── checkbox list rows (eradication pool / recovery / correctives / plan) ─
  // opts: { items:[{id,label,desc?}], isChecked(s,id), toggle(id,on), variant:'rose'|'emerald'|'lime' }
  function checkList(opts) {
    var wrap = h('div', { class: 'check-list' + (opts.grid ? ' grid-2' : '') });
    var rows = [];
    for (var i = 0; i < opts.items.length; i++) {
      (function (c) {
        var chk = h('input', { type: 'checkbox', class: 'chk' });
        chk.addEventListener('change', function () { opts.toggle(c.id, chk.checked); });
        var textSpan = h('span', { class: 'chk-text' },
          h('span', { class: 'chk-label', text: c.label }),
          c.desc ? h('span', { class: 'chk-desc', text: c.desc }) : null);
        var row = h('label', { class: 'chk-row ' + opts.variant }, chk, textSpan);
        wrap.appendChild(row);
        rows.push({ c: c, chk: chk, row: row });
      })(opts.items[i]);
    }
    function update(s) {
      for (var i = 0; i < rows.length; i++) {
        var on = opts.isChecked(s, rows[i].c.id);
        rows[i].chk.checked = on;
        setClass(rows[i].row, on, 'on');
      }
    }
    update(LAB.getState());
    return { el: wrap, update: update };
  }

  // ── switch row (control board / watch posture) ───────────────────────────
  // opts: { label, desc, ariaLabel, isChecked(s), apply(v), variant:'amber'|'emerald',
  //         impact?, impactDangerous?, switchRight? (watch-posture layout) }
  function switchRow(opts) {
    var sw = h('button', { type: 'button', role: 'switch', 'aria-checked': 'false', class: 'switch ' + opts.variant, 'aria-label': opts.ariaLabel });
    sw.appendChild(h('span', { class: 'switch-thumb' }));
    sw.addEventListener('click', function () { opts.apply(!opts.isChecked(LAB.getState())); });
    var info = h('div', { class: 'sw-info' },
      h('p', { class: 'sw-label', text: opts.label }),
      h('p', { class: 'sw-desc', text: opts.desc }),
      opts.impact ? h('p', { class: 'sw-impact' + (opts.impactDangerous ? ' danger' : ''), text: opts.impact }) : null);
    var row = h('div', { class: 'switch-row' + (opts.switchRight ? ' switch-right' : '') },
      opts.switchRight ? [info, sw] : [sw, info]);
    function update(s) {
      var on = opts.isChecked(s);
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      setClass(row, on && !!opts.rowHighlight, 'on');
    }
    update(LAB.getState());
    return { el: row, update: update };
  }

  // ── panel + phase intro ──────────────────────────────────────────────────
  function panel(title, children, tone) {
    return h('section', { class: 'panel' },
      h('h3', { class: 'mono panel-title' + (tone === 'alert' ? ' alert' : ''), text: title }),
      children);
  }

  var PHASE_TONE = { identify: 'teal', analyze: 'violet', contain: 'amber', eradicate: 'rose', recover: 'emerald', learn: 'lime' };

  function phaseIntro(phase) {
    var meta = null;
    for (var i = 0; i < LAB.PHASES.length; i++) if (LAB.PHASES[i].id === phase) meta = LAB.PHASES[i];
    var actions = h('ul', { class: 'pi-actions' });
    for (var j = 0; j < meta.actions.length; j++) {
      actions.appendChild(h('li', null, h('span', { class: 'pi-bullet', text: '▸' }), document.createTextNode(meta.actions[j])));
    }
    return h('div', { class: 'phase-intro tone-' + PHASE_TONE[phase] },
      h('div', { class: 'pi-head' },
        h('h2', { class: 'mono pi-title', text: 'STATION ' + meta.num + ' — ' + meta.name }),
        h('span', { class: 'mono pi-tagline', text: meta.tagline.toUpperCase() })),
      h('p', { class: 'pi-what', text: meta.what }),
      actions);
  }

  // ═══ phase workspaces (port of workspaces.tsx) ═══════════════════════════

  function identifyWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;
    var items = mode === 'medium' ? LAB.MEDIUM_EVIDENCE : LAB.HARD_EVIDENCE;

    var stream = evidenceStream({
      items: items, mode: mode,
      getFlagged: function (st) { return st.evidenceFlagged; },
      getTriage: function (st) { return st.triage; },
      onFlag: function (id, on) {
        LAB.setState(function (p) {
          return { evidenceFlagged: on ? (has(p.evidenceFlagged, id) ? p.evidenceFlagged : p.evidenceFlagged.concat([id])) : p.evidenceFlagged.filter(function (x) { return x !== id; }) };
        });
      },
      onTriage: function (id, v) { LAB.setState(function (p) { var t = Object.assign({}, p.triage); t[id] = v; return { triage: t }; }); },
    });

    var triageCount = h('p', { class: 'triage-count' });
    var streamPanel = panel(
      mode === 'medium' ? 'ALERT STREAM — FLAG EVERY EVENT THAT BELONGS TO THIS INCIDENT' : 'ALERT STREAM — CLASSIFY EVERY EVENT: INCIDENT / NOT-INCIDENT',
      [stream.el, mode === 'hard' ? triageCount : null]);

    var sevRadios = radioCards({
      name: 'Severity classification',
      options: [
        { id: 'SEV-1', text: 'SEV-1 · CRITICAL', sub: 'Confirmed org-wide disruption, or safety / regulatory-critical outage.' },
        { id: 'SEV-2', text: 'SEV-2 · MAJOR', sub: 'Confirmed compromise on multiple assets, active threat, department-level impact.' },
        { id: 'SEV-3', text: 'SEV-3 · MODERATE', sub: 'Single-system issue, no active spread, limited impact.' },
        { id: 'SEV-4', text: 'SEV-4 · LOW', sub: 'Policy violation or benign anomaly, no compromise.' },
      ],
      getValue: function (st) { return st.severity; },
      apply: function (v) { LAB.setState({ severity: v }); },
    });
    var declareBtn = h('button', { type: 'button', class: 'btn btn-rose btn-min11' });
    declareBtn.appendChild(LAB.icon('Flag', 'h-4 w-4 btn-ico'));
    var declareTxt = document.createTextNode('');
    declareBtn.appendChild(declareTxt);
    declareBtn.addEventListener('click', function () { LAB.setState({ declared: true }); });
    var banner = h('span', { class: 'mono declared-banner', role: 'status', text: '◉ IR-2025-0141 OPEN · BRIDGE STOOD UP · COMMANDER: YOU' });
    banner.hidden = true;
    var declareRow = h('div', { class: 'declare-row' }, declareBtn, banner);
    var declPanel = panel('DECLARATION DESK', [
      h('p', { class: 'panel-lead', text: 'Severity drives resourcing and escalation. Use the written criteria — not adrenaline.' }),
      sevRadios.el, declareRow]);

    var cards = objCardStack(mode === 'medium' ? ['OBJ-M2', 'OBJ-M3'] : ['OBJ-H1'], ctx);

    var el = h('div', { class: 'station' }, phaseIntro('identify'), streamPanel, declPanel, cards.el);

    function update(st) {
      stream.update(st);
      sevRadios.update(st);
      if (mode === 'hard') {
        var n = 0; for (var k in st.triage) n++;
        triageCount.textContent = n + '/' + items.length + ' events triaged. Expand a row (▾) to read the full log entry before you call it.';
      }
      declareTxt.textContent = st.declared ? 'INCIDENT DECLARED' : 'DECLARE INCIDENT';
      setDisabled(declareBtn, !st.severity || st.declared);
      banner.hidden = !st.declared;
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  function analyzeWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;
    var cardsData = LAB.CHAIN_CARDS.filter(function (c) { return mode === 'medium' ? !c.distractor : true; });

    var chain = orderBuilder({
      pool: cardsData.map(function (c) { return { id: c.id, label: c.label, sub: c.attack }; }),
      getSeq: function (st) { return st.chainOrder; },
      append: function (id) { LAB.setState(function (p) { return { chainOrder: p.chainOrder.concat([id]) }; }); },
      remove: function (id) { LAB.setState(function (p) { return { chainOrder: p.chainOrder.filter(function (x) { return x !== id; }) }; }); },
      move: function (id, dir) {
        LAB.setState(function (p) {
          var arr = p.chainOrder.slice();
          var i = arr.indexOf(id);
          var j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return {};
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          return { chainOrder: arr };
        });
      },
      reset: function () { LAB.setState({ chainOrder: [] }); },
      poolLabel: 'EVIDENCE-BACKED STAGES',
      seqLabel: 'RECONSTRUCTED CHAIN',
      accent: 'violet',
    });

    var earliest = radioCards({
      name: 'Earliest detection point',
      options: LAB.EARLIEST_POINTS.map(function (e) { return { id: e.id, text: e.text }; }),
      getValue: function (st) { return st.earliest; },
      apply: function (v) { LAB.setState({ earliest: v }); },
    });
    var earliestSrc = radioCards({
      name: 'Earliest data source',
      options: LAB.EARLIEST_SOURCES.map(function (e) { return { id: e.id, text: e.label }; }),
      getValue: function (st) { return st.earliestSource; },
      apply: function (v) { LAB.setState({ earliestSource: v }); },
      columns: 2,
    });

    var cards = objCardStack(mode === 'medium' ? ['OBJ-M4', 'OBJ-M11'] : ['OBJ-H2'], ctx);

    var el = h('div', { class: 'station' },
      phaseIntro('analyze'),
      panel('ATTACK CHAIN BUILDER — PLACE THE STAGES IN ATTACKER ORDER', [
        chain.el,
        h('p', { class: 'panel-note', text: 'Each card cites its ATT&CK technique — these mappings go straight into the incident report.' })]),
      panel('DETECTION DEPTH REVIEW — HOW EARLY COULD THIS HAVE DIED?', [
        h('p', { class: 'panel-lead', text: 'With telemetry the org already owned, properly configured: at which point was this attack first detectable — and with which data source?' }),
        earliest.el,
        h('div', { class: 'mt-3' },
          h('p', { class: 'mono sub-label', text: '▸ MATCHING DATA SOURCE' }),
          earliestSrc.el)]),
      cards.el);

    function update(st) {
      chain.update(st);
      earliest.update(st);
      earliestSrc.update(st);
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  function containWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;

    var firstAction = radioCards({
      name: 'First containment action',
      options: LAB.FIRST_ACTIONS.map(function (f) { return { id: f.id, text: f.text }; }),
      getValue: function (st) { return st.firstAction; },
      apply: function (v) { LAB.setState({ firstAction: v }); },
    });

    var switches = [];
    for (var i = 0; i < LAB.CONTROLS.length; i++) {
      (function (c) {
        var dangerous = c.id === 'C-ISO-DC' || c.id === 'C-VPN' || c.id === 'C-WIPE';
        switches.push(switchRow({
          label: c.label, desc: c.desc, impact: c.impact, impactDangerous: dangerous,
          ariaLabel: c.label, variant: 'amber', rowHighlight: true,
          isChecked: function (st) { return !!st.controls[c.id]; },
          apply: function (v) { LAB.setState(function (p) { var ct = Object.assign({}, p.controls); ct[c.id] = v; return { controls: ct }; }); },
        }));
      })(LAB.CONTROLS[i]);
    }
    var doctrine = h('div', { class: 'doctrine-note' },
      LAB.icon('AlertTriangle', 'h-3.5 w-3.5 doctrine-ico'),
      h('p', null, document.createTextNode('Containment doctrine: the '), h('span', { class: 'strong', text: 'minimum effective set' }), document.createTextNode(' that stops THIS attacker. Over-containment turns one incident into an org-wide outage — and examiners grade the restraint.')));
    var boardPanel = panel('CONTROL BOARD — ENABLE THE CONTAINMENT SET (EVERY SWITCH HAS A BUSINESS COST)',
      [h('div', { class: 'switch-list' }, switches.map(function (x) { return x.el; })), doctrine]);

    var dcRadios = mode === 'hard' ? radioCards({
      name: 'DC-01 handling',
      options: LAB.DC_DECISIONS.map(function (d) { return { id: d.id, text: d.text }; }),
      getValue: function (st) { return st.dcDecision; },
      apply: function (v) { LAB.setState({ dcDecision: v }); },
    }) : null;

    var cards = objCardStack(mode === 'medium' ? ['OBJ-M5', 'OBJ-M6'] : ['OBJ-H3'], ctx);

    var el = h('div', { class: 'station' },
      phaseIntro('contain'),
      panel('FIRST ACTION — WHAT DO YOU DO IN THE FIRST MINUTE?', [firstAction.el]),
      boardPanel,
      dcRadios ? panel('CROWN JEWEL CALL — DC-01 POSTURE', [dcRadios.el]) : null,
      cards.el);

    function update(st) {
      firstAction.update(st);
      for (var k = 0; k < switches.length; k++) switches[k].update(st);
      if (dcRadios) dcRadios.update(st);
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  function eradicateWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;

    if (mode === 'medium') {
      var pool = checkList({
        items: LAB.ERADICATION_POOL.map(function (a) { return { id: a.id, label: a.label, desc: a.detail }; }),
        isChecked: function (st, id) { return has(st.eradicationSelected, id); },
        toggle: function (id, on) {
          LAB.setState(function (p) {
            return { eradicationSelected: on ? (has(p.eradicationSelected, id) ? p.eradicationSelected : p.eradicationSelected.concat([id])) : p.eradicationSelected.filter(function (x) { return x !== id; }) };
          });
        },
        variant: 'rose',
      });
      var cards = objCardStack(['OBJ-M7'], ctx);
      var el = h('div', { class: 'station' }, phaseIntro('eradicate'),
        panel('ERADICATION POOL — SELECT EVERY ACTION THIS INCIDENT REQUIRES', [pool.el]), cards.el);
      function update(st) { pool.update(st); cards.update(st); }
      update(s);
      return { el: el, update: update };
    }

    var runbook = orderBuilder({
      pool: LAB.ERADICATION_POOL.filter(function (a) { return a.correct; }).map(function (a) { return { id: a.id, label: a.label, sub: a.detail }; }),
      getSeq: function (st) { return st.eradicationOrder; },
      append: function (id) { LAB.setState(function (p) { return { eradicationOrder: p.eradicationOrder.concat([id]) }; }); },
      remove: function (id) { LAB.setState(function (p) { return { eradicationOrder: p.eradicationOrder.filter(function (x) { return x !== id; }) }; }); },
      move: function (id, dir) {
        LAB.setState(function (p) {
          var arr = p.eradicationOrder.slice();
          var i = arr.indexOf(id);
          var j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return {};
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          return { eradicationOrder: arr };
        });
      },
      reset: function () { LAB.setState({ eradicationOrder: [] }); },
      poolLabel: 'RUNBOOK ACTIONS',
      seqLabel: 'EXECUTION ORDER',
      accent: 'amber',
    });
    var gateNote = h('p', { class: 'evidence-gate', role: 'alert' });
    gateNote.appendChild(LAB.icon('Lock', 'h-3.5 w-3.5 gate-ico'));
    gateNote.appendChild(document.createTextNode('Evidence gate: reimage queued with NO memory capture (C-MEM-FIN in CONTAIN is off). Volatile evidence dies at the wipe.'));
    gateNote.hidden = true;
    var cards = objCardStack(['OBJ-H4'], ctx);
    var el = h('div', { class: 'station' }, phaseIntro('eradicate'),
      panel('ERADICATION RUNBOOK — BUILD THE EXACT EXECUTION ORDER', [runbook.el, gateNote]), cards.el);
    function update(st) {
      runbook.update(st);
      gateNote.hidden = !(has(st.eradicationOrder, 'EA-WIPE') && !st.controls['C-MEM-FIN']);
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  function recoverWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;

    var strategy = radioCards({
      name: 'Restore strategy',
      options: LAB.RECOVERY_STRATEGIES.map(function (r) { return { id: r.id, text: r.text }; }),
      getValue: function (st) { return st.recoveryStrategy; },
      apply: function (v) { LAB.setState({ recoveryStrategy: v }); },
    });
    var reconcile = mode === 'hard' ? radioCards({
      name: 'Backup reconciliation',
      options: LAB.BACKUP_RECONCILE.map(function (b) { return { id: b.id, text: b.text }; }),
      getValue: function (st) { return st.backupReconcile; },
      apply: function (v) { LAB.setState({ backupReconcile: v }); },
    }) : null;
    var checks = checkList({
      items: LAB.RECOVERY_CHECKS.map(function (c) { return { id: c.id, label: c.label, desc: c.desc }; }),
      isChecked: function (st, id) { return has(st.recoveryChecks, id); },
      toggle: function (id, on) {
        LAB.setState(function (p) {
          return { recoveryChecks: on ? (has(p.recoveryChecks, id) ? p.recoveryChecks : p.recoveryChecks.concat([id])) : p.recoveryChecks.filter(function (x) { return x !== id; }) };
        });
      },
      variant: 'emerald',
    });
    var monitor = switchRow({
      label: '30-day enhanced monitoring',
      desc: 'C2 indicators · m.rivera / svc-helpdesk account activity · Finance-share volume anomalies',
      ariaLabel: 'Enable enhanced monitoring', variant: 'emerald', switchRight: true,
      isChecked: function (st) { return st.monitorEnhanced; },
      apply: function (v) { LAB.setState({ monitorEnhanced: v }); },
    });

    var cards = objCardStack(mode === 'medium' ? ['OBJ-M8'] : ['OBJ-H5'], ctx);

    var el = h('div', { class: 'station' },
      phaseIntro('recover'),
      panel('RESTORE STRATEGY — FILESRV-01 · FINANCE SHARE', [strategy.el]),
      reconcile ? panel("BACKUP FOOTNOTE — THE JOB LOG SAYS: '2 FILES SKIPPED (LOCKED) AT 02:00'", [reconcile.el]) : null,
      panel('VALIDATION GATE — PROVE THE RESTORE BEFORE USERS RETURN', [checks.el]),
      panel('WATCH POSTURE', [monitor.el]),
      cards.el);

    function update(st) {
      strategy.update(st);
      if (reconcile) reconcile.update(st);
      checks.update(st);
      monitor.update(st);
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  function learnWorkspace(ctx) {
    var s = LAB.getState();
    var mode = s.mode;

    var rootCause = mode === 'medium' ? radioCards({
      name: 'Root cause',
      options: LAB.ROOT_CAUSES.map(function (r) { return { id: r.id, text: r.text }; }),
      getValue: function (st) { return st.rootCause; },
      apply: function (v) { LAB.setState({ rootCause: v }); },
    }) : null;

    var correctives = mode === 'medium' ? checkList({
      items: LAB.CORRECTIVES.map(function (c) { return { id: c.id, label: c.label }; }),
      isChecked: function (st, id) { return has(st.corrective, id); },
      toggle: function (id, on) {
        LAB.setState(function (p) {
          return { corrective: on ? (has(p.corrective, id) ? p.corrective : p.corrective.concat([id])) : p.corrective.filter(function (x) { return x !== id; }) };
        });
      },
      variant: 'lime', grid: true,
    }) : null;

    var findingsRows = mode === 'hard' ? LAB.FINDINGS.map(function (f) {
      return classifyRow({
        title: f.text, name: 'Classification for ' + f.id,
        options: LAB.FINDING_CLASSES,
        getValue: function (st) { return st.findingsClass[f.id] || null; },
        apply: function (v) { LAB.setState(function (p) { var fc = Object.assign({}, p.findingsClass); fc[f.id] = v; return { findingsClass: fc }; }); },
      });
    }) : null;

    var notifRows = mode === 'hard' ? LAB.STAKEHOLDERS.map(function (st2) {
      return classifyRow({
        title: st2.label, name: 'Notification timing for ' + st2.label,
        options: LAB.NOTIF_TIMINGS,
        getValue: function (st) { return st.notifMap[st2.id] || null; },
        apply: function (v) { LAB.setState(function (p) { var nm = Object.assign({}, p.notifMap); nm[st2.id] = v; return { notifMap: nm }; }); },
      });
    }) : null;

    // metrics + exercise + plan updates (same as recoverWorkspace pieces)
    var mttdIn = metricInput('MTTD', '01:58 first malicious event → 09:03 analyst detection', function (st) { return st.mttd; }, function (v) { LAB.setState({ mttd: v }); });
    var mttcIn = mode === 'hard' ? metricInput('MTTC', '09:41 declaration → 11:52 containment complete', function (st) { return st.mttc; }, function (v) { LAB.setState({ mttc: v }); }) : null;
    var mttrIn = metricInput('MTTR', '09:03 detection → 17:20 service restored', function (st) { return st.mttr; }, function (v) { LAB.setState({ mttr: v }); });
    var maturity = mode === 'hard' ? radioCards({
      name: 'Maturity metric',
      options: LAB.METRICS_MATURITY.map(function (m) { return { id: m.id, text: m.text }; }),
      getValue: function (st) { return st.maturityMetric; },
      apply: function (v) { LAB.setState({ maturityMetric: v }); },
    }) : null;
    var exercise = radioCards({
      name: 'Exercise type',
      options: LAB.EXERCISES.map(function (e) { return { id: e.id, text: e.text }; }),
      getValue: function (st) { return st.exercise; },
      apply: function (v) { LAB.setState({ exercise: v }); },
    });
    var planUpdates = mode === 'hard' ? checkList({
      items: LAB.PLAN_UPDATES.map(function (p) { return { id: p.id, label: p.label }; }),
      isChecked: function (st, id) { return has(st.planUpdates, id); },
      toggle: function (id, on) {
        LAB.setState(function (p) {
          return { planUpdates: on ? (has(p.planUpdates, id) ? p.planUpdates : p.planUpdates.concat([id])) : p.planUpdates.filter(function (x) { return x !== id; }) };
        });
      },
      variant: 'lime', grid: true,
    }) : null;

    var metricsChildren = [h('div', { class: 'metrics-grid' }, [mttdIn.el, mttcIn ? mttcIn.el : null, mttrIn.el])];
    if (mode === 'hard') {
      metricsChildren.push(h('div', { class: 'mt-4' },
        h('p', { class: 'mono sub-label', text: '▸ WHICH METRIC EXPOSES THE MATURITY GAP?' }),
        maturity.el));
    }
    var planChildren = [exercise.el];
    if (mode === 'hard') {
      planChildren.push(h('div', { class: 'mt-4' },
        h('p', { class: 'mono sub-label', text: '▸ PLAN SECTIONS TO UPDATE (SELECT ALL THAT APPLY)' }),
        planUpdates.el));
    }

    var cards = objCardStack(
      mode === 'medium' ? ['OBJ-M9', 'OBJ-M10', 'OBJ-M12'] : ['OBJ-H6', 'OBJ-H7', 'OBJ-H8', 'OBJ-H9'], ctx);

    var el = h('div', { class: 'station' }, phaseIntro('learn'));
    if (mode === 'medium') {
      el.appendChild(panel('ROOT CAUSE — THE SYSTEMIC CONDITION, NOT THE SYMPTOM', [rootCause.el]));
      el.appendChild(panel('CORRECTIVE ACTIONS — CONCRETE, OWNED, VERIFIABLE', [correctives.el]));
    } else {
      el.appendChild(panel('FINDINGS CLASSIFICATION — ROOT CAUSE / CONTRIBUTING / SYMPTOM / UNRELATED',
        [h('div', { class: 'stack-2' }, findingsRows.map(function (r) { return r.el; }))]));
      var notifPanel = panel('NOTIFICATION MATRIX — WHO LEARNS WHAT, AND WHEN', [
        h('p', { class: 'panel-note tight', text: 'Granite Retail contract: notice within 72 hours of a CONFIRMED incident. Assign every stakeholder exactly one window.' }),
        h('div', { class: 'stack-2' }, notifRows.map(function (r) { return r.el; }))]);
      el.appendChild(notifPanel);
    }
    el.appendChild(panel('RESPONSE METRICS — COMPUTE FROM THE TIMELINE', metricsChildren));
    el.appendChild(panel("PLAN TESTING — KEEP THE PLAN ALIVE (LESSON 8.2: 'TESTED AND PRACTICED')", planChildren));
    el.appendChild(cards.el);

    function update(st) {
      if (rootCause) rootCause.update(st);
      if (correctives) correctives.update(st);
      if (findingsRows) for (var i = 0; i < findingsRows.length; i++) findingsRows[i].update(st);
      if (notifRows) for (var j = 0; j < notifRows.length; j++) notifRows[j].update(st);
      mttdIn.update(st);
      if (mttcIn) mttcIn.update(st);
      mttrIn.update(st);
      if (maturity) maturity.update(st);
      exercise.update(st);
      if (planUpdates) planUpdates.update(st);
      cards.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  // ── asset bay (right rail / mobile drawer) ───────────────────────────────
  function assetBay() {
    var s = LAB.getState();
    var mode = s.mode;
    var assets = LAB.ASSETS.filter(function (a) { return a.modes.indexOf(mode) !== -1; });
    var chips = {};
    var el = h('div', { class: 'asset-bay' });
    for (var i = 0; i < assets.length; i++) {
      (function (a) {
        var chip = h('span', { class: 'mono ac-state', text: '' });
        el.appendChild(h('div', { class: 'asset-card', dataset: { aid: a.id } },
          h('div', { class: 'ac-head' },
            h('span', { class: 'mono ac-name', text: a.name }), chip),
          h('p', { class: 'ac-desc', text: a.desc })));
        chips[a.id] = chip;
      })(assets[i]);
    }
    el.appendChild(h('div', { class: 'bay-footnote' },
      LAB.icon('ShieldCheck', 'h-4 w-4 footnote-ico'),
      h('p', { class: 'footnote-text', text: 'Asset states update as you contain, eradicate and recover. Watch DC-01 if you get trigger-happy.' })));

    function update(st) {
      var order = ['identify', 'analyze', 'contain', 'eradicate', 'recover', 'learn'];
      var g = st.mode === 'medium' ? order.indexOf(st.maxStation === 'aar' ? 'learn' : st.maxStation) : 6;
      var controls = st.controls;
      function setChip(id, state, cls) {
        var chip = chips[id];
        if (!chip) return;
        chip.textContent = state;
        chip.className = 'mono ac-state ' + cls;
      }
      for (var i = 0; i < assets.length; i++) {
        var a = assets[i];
        if (a.id === 'A-FINWS04') {
          if (mode === 'hard' ? st.eradicationOrder.length >= 4 : g >= 4) setChip(a.id, 'REIMAGED · CLEAN', 'st-emerald');
          else if (controls['C-ISO-FIN']) setChip(a.id, 'ISOLATED · COMPROMISED', 'st-amber');
          else setChip(a.id, 'COMPROMISED · BEACONING', 'st-rose');
        } else if (a.id === 'A-FILESRV') {
          if (g >= 5) setChip(a.id, 'RESTORED · WATCHED', 'st-emerald');
          else if (controls['C-ISO-FS']) setChip(a.id, 'ISOLATED · PARTIAL ENCRYPTION', 'st-amber');
          else setChip(a.id, 'IMPACTED · 4,112 FILES', 'st-rose');
        } else if (a.id === 'A-DC01') {
          if (controls['C-ISO-DC']) setChip(a.id, 'ISOLATED · AUTH DOWN', 'st-rose-strong');
          else if (controls['C-BLK-C2']) setChip(a.id, 'MONITORED · PROTECTED', 'st-teal');
          else setChip(a.id, 'AT RISK · WATCH LOGS', 'st-rose');
        } else if (a.id === 'A-BKP') {
          setChip(a.id, 'HEALTHY · 02:00 BACKUP VERIFIED', 'st-emerald');
        } else if (a.id === 'A-HRWS11') {
          if (mode === 'hard' ? st.eradicationOrder.length >= 4 : false) setChip(a.id, 'REIMAGED · CLEAN', 'st-emerald');
          else setChip(a.id, 'BEACONING SINCE SUN 23:47', 'st-rose');
        }
      }
    }
    update(s);
    return { el: el, update: update };
  }

  // ═══ briefing pieces (port of briefing.tsx) ══════════════════════════════

  function modeSelect(ctx) {
    var mediumBtn = h('button', { type: 'button', class: 'ms-card ms-medium' },
      h('p', { class: 'mono ms-kick', text: 'STATION-BY-STATION · GUIDED' }),
      h('h2', { class: 'ms-h2', text: 'MEDIUM WATCH' }),
      h('ul', { class: 'ms-list' },
        h('li', null, '▸ 12 granular objectives, unlocked in lifecycle order — the deck teaches phase discipline'),
        h('li', null, '▸ 3-tier hints on every objective (costs stars, never blocks)'),
        h('li', null, '▸ Tolerant checks: wrong answers teach, progress never resets')),
      h('span', { class: 'mono ms-cta amber-cta' }));
    mediumBtn.querySelector('.amber-cta').appendChild(LAB.icon('Play', 'h-3.5 w-3.5'));
    mediumBtn.querySelector('.amber-cta').appendChild(document.createTextNode(' START GUIDED WATCH'));
    mediumBtn.addEventListener('click', function () { ctx.pickMode('medium'); });

    var hardBtn = h('button', { type: 'button', class: 'ms-card ms-hard' },
      h('p', { class: 'mono ms-kick', text: 'FREE-ROAM DECK · CHALLENGE' }),
      h('h2', { class: 'ms-h2', text: 'HARD WATCH' }),
      h('ul', { class: 'ms-list' },
        h('li', null, '▸ 9 broad multi-step challenges across the whole deck — no ordering rails'),
        h('li', null, '▸ Noisy evidence, 2 red herrings, strict validation, near-misses rejected with rationale'),
        h('li', null, '▸ At most ONE nudge per objective — and it visibly costs score')),
      h('span', { class: 'mono ms-cta rose-cta' }));
    hardBtn.querySelector('.rose-cta').appendChild(LAB.icon('Play', 'h-3.5 w-3.5'));
    hardBtn.querySelector('.rose-cta').appendChild(document.createTextNode(' START CHALLENGE WATCH'));
    hardBtn.addEventListener('click', function () { ctx.pickMode('hard'); });

    return h('div', { class: 'ms-wrap' },
      h('div', { class: 'ms-card-outer' },
        h('p', { class: 'mono ms-kicker', text: 'CYBERLAB · COMPTIA CYSA+ CS0-003 · LESSON 8.2' }),
        h('h1', { class: 'ms-title', text: 'PERFORMING INCIDENT RESPONSE ACTIVITIES' }),
        h('p', { class: 'ms-sub', text: 'One live incident. Six phases. You are the Incident Commander. Choose your watch: guided instruction or a free-roam challenge — both run on the same evidence core, both end with the same mastery bar.' }),
        h('div', { class: 'ms-grid' }, mediumBtn, hardBtn),
        h('p', { class: 'ms-disclaimer', text: 'TRAINING SIMULATION — Meridian Freight Systems, its staff, accounts and logs are fictional. IP addresses use RFC 5737 documentation ranges. Progress auto-saves to this browser.' })));
  }

  function briefingSection() {
    var how = h('ul', { class: 'brief-how' });
    for (var i = 0; i < LAB.BRIEFING.how.length; i++) {
      how.appendChild(h('li', null, h('span', { class: 'brief-bullet', text: '▸' }), document.createTextNode(LAB.BRIEFING.how[i])));
    }
    return h('section', { class: 'brief-section', 'aria-labelledby': 'briefing-h' },
      h('p', { class: 'mono brief-kicker', text: 'SITREP · CLASSIFICATION: TRAINING DATA — FICTIONAL ORG' }),
      h('h2', { id: 'briefing-h', class: 'brief-h2', text: LAB.BRIEFING.org }),
      h('p', { class: 'brief-tagline', text: LAB.BRIEFING.tagline }),
      h('div', { class: 'brief-grid' },
        h('div', { class: 'brief-box sit' },
          h('h3', { class: 'mono brief-h3 rose-h', text: 'SITUATION' }),
          h('p', { class: 'brief-p', text: LAB.BRIEFING.situation })),
        h('div', { class: 'brief-box stakes' },
          h('h3', { class: 'mono brief-h3 amber-h', text: 'STAKES' }),
          h('p', { class: 'brief-p', text: LAB.BRIEFING.stakes }))),
      h('div', { class: 'brief-box rel' },
        h('h3', { class: 'mono brief-h3 teal-h', text: 'CERTIFICATION RELEVANCE' }),
        h('p', { class: 'brief-p', text: LAB.BRIEFING.relevance })),
      h('div', { class: 'brief-box how' },
        h('h3', { class: 'mono brief-h3', text: 'HOW THE DECK WORKS' }),
        how));
  }

  function knowledgeCore(ctx) {
    var s = LAB.getState();

    var glossBtn = h('button', { type: 'button', class: 'btn btn-outline btn-sm btn-min11' });
    glossBtn.appendChild(LAB.icon('GraduationCap', 'h-4 w-4 btn-ico'));
    glossBtn.appendChild(document.createTextNode(' GLOSSARY (15)'));
    glossBtn.addEventListener('click', function () { LAB.openGlossary(glossBtn); });

    var goals = h('div', { class: 'goals-grid' });
    var GOAL_ICON = { TrendingDown: 'TrendingDown', Crosshair: 'Crosshair', ShieldHalf: 'ShieldHalf', SearchCode: 'SearchCode', HeartPulse: 'HeartPulse' };
    for (var g = 0; g < LAB.IR_GOALS.length; g++) {
      var goal = LAB.IR_GOALS[g];
      goals.appendChild(h('div', { class: 'goal-tile' },
        LAB.icon(GOAL_ICON[goal.icon] || 'ShieldHalf', 'h-4 w-4 goal-ico'),
        h('p', { class: 'goal-text', text: goal.text.replace(' of the incident', '') })));
    }

    var stations = h('div', { class: 'kc-stations' });
    for (var p = 0; p < LAB.PHASES.length; p++) {
      var meta = LAB.PHASES[p];
      stations.appendChild(h('div', { class: 'station-card tone-' + PHASE_TONE[meta.id] },
        h('p', { class: 'mono sc-head' },
          document.createTextNode(meta.num + ' · ' + meta.name + ' '),
          h('span', { class: 'sc-tagline', text: '— ' + meta.tagline })),
        h('p', { class: 'sc-what', text: meta.what })));
    }

    var cases = h('div', { class: 'case-list' });
    for (var c = 0; c < LAB.REAL_CASES.length; c++) {
      (function (rc) {
        var sum = h('summary', { class: 'case-sum' },
          h('span', { class: 'mono case-tag', text: 'CASE' }), document.createTextNode(rc.name));
        cases.appendChild(h('details', { class: 'case-item' }, sum, h('p', { class: 'case-lesson', text: rc.lesson })));
      })(LAB.REAL_CASES[c]);
    }

    var mitreRows = h('tbody');
    var nonDist = LAB.CHAIN_CARDS.filter(function (x) { return !x.distractor; });
    for (var m = 0; m < nonDist.length; m++) {
      mitreRows.appendChild(h('tr', null,
        h('td', { class: 'mt-left', text: nonDist[m].label }),
        h('td', { class: 'mono mt-right', text: nonDist[m].attack })));
    }

    var warmup = orderBuilder({
      pool: LAB.PHASES.map(function (pp) { return { id: pp.id, label: pp.num + ' · ' + pp.name, sub: pp.tagline }; }),
      getSeq: function (st) { return st.phaseOrder; },
      append: function (id) { LAB.setState(function (prev) { return { phaseOrder: prev.phaseOrder.concat([id]) }; }); },
      remove: function (id) { LAB.setState(function (prev) { return { phaseOrder: prev.phaseOrder.filter(function (x) { return x !== id; }) }; }); },
      move: function (id, dir) {
        // NOTE: original reads phaseOrder from its captured `s` here; the
        // static port uses the freshest state (identical behavior, no staleness).
        LAB.setState(function (prev) {
          var arr = prev.phaseOrder.slice();
          var i = arr.indexOf(id);
          var j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return {};
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          return { phaseOrder: arr };
        });
      },
      reset: function () { LAB.setState({ phaseOrder: [] }); },
      poolLabel: 'LIFECYCLE PHASES',
      seqLabel: 'YOUR ORDER',
      accent: 'amber',
    });

    var m1Card = s.mode === 'medium' ? objectiveCard('OBJ-M1', ctx) : null;

    var el = h('section', { class: 'kc-section', 'aria-labelledby': 'core-h' },
      h('div', { class: 'kc-head' },
        h('h2', { id: 'core-h', class: 'kc-h2' },
          LAB.icon('BookOpen', 'h-5 w-5 kc-ico'),
          document.createTextNode(' KNOWLEDGE CORE — THE IR LIFECYCLE')),
        glossBtn),
      h('p', { class: 'kc-lead' },
        h('span', { class: 'strong', text: 'Incident response activities' }),
        document.createTextNode(' are an organization\'s actions to respond to any security incident. The goal: '),
        h('span', { class: 'strong', text: 'minimize the impact' }), document.createTextNode(', '),
        h('span', { class: 'strong', text: 'identify and contain' }), document.createTextNode(' the incident, identify its '),
        h('span', { class: 'strong', text: 'root cause' }), document.createTextNode(', and '),
        h('span', { class: 'strong', text: 'restore' }), document.createTextNode(' impacted systems and services — and a plan that is not regularly '),
        h('span', { class: 'strong', text: 'tested and practiced' }),
        document.createTextNode(' is a plan that fails on contact. (CySA+ CS0-003, Lesson 8.2)')),
      goals,
      h('div', { class: 'kc-grid' },
        h('div', null,
          h('h3', { class: 'mono kc-h3', text: 'THE SIX STATIONS' }),
          stations),
        h('div', { class: 'kc-right' },
          h('div', null,
            h('h3', { class: 'mono kc-h3', text: 'REAL-WORLD IR CASES (PUBLIC RECORD)' }),
            cases),
          h('div', null,
            h('h3', { class: 'mono kc-h3', text: 'ATTACK CHAIN ↔ MITRE MAPPING (THIS INCIDENT)' }),
            h('div', { class: 'mitre-wrap' }, h('table', { class: 'mitre-table' }, mitreRows)),
            h('p', { class: 'kc-note', text: 'Mappings per MITRE ATT&CK (attack.mitre.org). Mitigations used in this lab: M1017, M1018, M1030, M1032, M1037, M1047, M1049, M1053, M1054.' })))),
      h('div', { class: 'warmup-box' },
        h('h3', { class: 'mono warmup-h', text: 'WARM-UP — LOCK IN THE LIFECYCLE ORDER' }),
        h('div', { class: 'warmup-body' }, warmup.el),
        m1Card ? h('div', { class: 'mt-3' }, m1Card.el) : null));

    function update(st) {
      warmup.update(st);
      if (m1Card) m1Card.update(st);
    }
    update(s);
    return { el: el, update: update };
  }

  // ═══ after-action wing (port of aar.tsx) ═════════════════════════════════

  function quizSection(ctx) {
    var mode = LAB.getState().mode;
    var bank = LAB.quiz.bank(mode);

    var counter = h('span', { class: 'mono quiz-counter' });
    var h2 = h('h2', { id: 'quiz-h', class: 'aar-h2' },
      LAB.icon('ListChecks', 'h-5 w-5 quiz-ico'),
      document.createTextNode(' QUALITY CONTROL — ' + (mode === 'medium' ? 'CONCEPT CHECK' : 'SCENARIO CHECK')));

    var qEls = [];
    var qWrap = h('div', { class: 'quiz-list' });
    for (var qi = 0; qi < bank.length; qi++) {
      (function (q, idx) {
        var radios = radioCards({
          name: 'Question ' + (idx + 1),
          options: q.options.map(function (o, oi) { return { id: String(oi), text: o.text }; }),
          getValue: function (st) { return st.quizAnswers[q.id] !== undefined ? String(st.quizAnswers[q.id]) : null; },
          apply: function (v) {
            if (LAB.getState().quizSubmitted) return;
            LAB.setState(function (p) { var qa = Object.assign({}, p.quizAnswers); qa[q.id] = parseInt(v, 10); return { quizAnswers: qa }; });
          },
          getState: function (st) {
            if (!st.quizSubmitted) return null;
            var chosen = st.quizAnswers[q.id];
            if (chosen === undefined) return null;
            return q.options[chosen].correct ? { [String(chosen)]: 'correct' } : { [String(chosen)]: 'wrong' };
          },
          getDisabled: function (st) { return st.quizSubmitted; },
        });
        var fb = h('div', { class: 'quiz-feedback', role: 'status', hidden: true });
        var qEl = h('div', { class: 'quiz-q' },
          h('p', { class: 'q-text' },
            h('span', { class: 'mono q-num', text: 'Q' + (idx + 1) }),
            document.createTextNode(q.scenario)),
          radios.el, fb);
        qWrap.appendChild(qEl);
        qEls.push({ q: q, radios: radios, fb: fb });
      })(bank[qi], qi);
    }

    var submitBtn = h('button', { type: 'button', class: 'btn btn-amber btn-min11', text: 'SUBMIT KNOWLEDGE CHECK' });
    submitBtn.addEventListener('click', function () {
      var st = LAB.getState();
      var sc = LAB.quiz.score(st);
      LAB.setState({ quizSubmitted: true, quizScore: sc });
    });
    var actions = h('div', { class: 'quiz-actions' }, submitBtn);

    var el = h('section', { class: 'aar-section', 'aria-labelledby': 'quiz-h' },
      h('div', { class: 'aar-head' }, h2, counter),
      qWrap, actions);

    function update(st) {
      var answered = LAB.quiz.answeredCount(st);
      counter.textContent = answered + '/' + bank.length + ' ANSWERED' + (st.quizSubmitted ? ' · SCORE ' + (st.quizScore || 0) + '/' + bank.length : '');
      for (var i = 0; i < qEls.length; i++) {
        var q = qEls[i].q, radios = qEls[i].radios, fb = qEls[i].fb;
        radios.update(st);
        var chosen = st.quizAnswers[q.id];
        if (st.quizSubmitted && chosen !== undefined) {
          var opt = q.options[chosen];
          fb.hidden = false;
          setClass(fb, opt.correct, 'pass');
          setClass(fb, !opt.correct, 'fail');
          fb.innerHTML = '';
          fb.appendChild(h('span', { class: 'mono result-tag', text: opt.correct ? '✓ CORRECT' : '✗ MISSED' }));
          fb.appendChild(document.createTextNode(opt.why));
          if (!opt.correct) {
            var correctOpt = null;
            for (var k = 0; k < q.options.length; k++) if (q.options[k].correct) correctOpt = q.options[k];
            fb.appendChild(h('span', { class: 'fb-reveal' },
              h('span', { class: 'mono fb-tag', text: '▸ CORRECT ANSWER: ' }),
              document.createTextNode(correctOpt.text + ' — ' + correctOpt.why)));
          }
        } else {
          fb.hidden = true;
          fb.innerHTML = '';
        }
      }
      setDisabled(submitBtn, answered < bank.length || st.quizSubmitted);
      if (st.quizSubmitted) {
        actions.innerHTML = '';
        actions.className = 'quiz-actions';
        var chip = h('div', { class: 'score-chip' },
          LAB.icon('Award', 'h-4 w-4 score-ico'),
          h('span', { class: 'mono score-text', text: (st.quizScore || 0) + '/' + bank.length + ' — ' + LAB.quiz.verdict(st.quizScore || 0, bank.length) }));
        var retake = h('button', { type: 'button', class: 'btn btn-outline btn-min11' });
        retake.appendChild(LAB.icon('RotateCcw', 'h-4 w-4 btn-ico'));
        retake.appendChild(document.createTextNode(' RETAKE'));
        retake.addEventListener('click', function () { LAB.setState({ quizAnswers: {}, quizSubmitted: false, quizScore: null }); });
        actions.appendChild(chip);
        actions.appendChild(retake);
      } else if (!actions.contains(submitBtn)) {
        actions.innerHTML = '';
        actions.className = 'quiz-actions';
        actions.appendChild(submitBtn);
      }
    }
    update(LAB.getState());
    return { el: el, update: update };
  }

  function debriefSection() {
    var detGrid = h('div', { class: 'det-grid' });
    for (var i = 0; i < LAB.DEBRIEF.detections.length; i++) {
      var d = LAB.DEBRIEF.detections[i];
      detGrid.appendChild(h('div', { class: 'det-card' },
        h('p', { class: 'mono det-source', text: d.source }),
        h('p', { class: 'det-look', text: d.look }),
        h('p', { class: 'det-logic', text: d.logic })));
    }
    var mitGrid = h('div', { class: 'mit-grid' });
    for (var m = 0; m < LAB.DEBRIEF.mitigations.length; m++) {
      var mit = LAB.DEBRIEF.mitigations[m];
      mitGrid.appendChild(h('div', { class: 'mit-card' },
        h('span', { class: 'mono mit-id', text: mit.id }),
        h('div', { class: 'mit-body' },
          h('p', { class: 'mit-name', text: mit.name }),
          h('p', { class: 'mit-use', text: mit.use }))));
    }
    function takeaways(items, bulletCls) {
      var ul = h('ul', { class: 'take-list' });
      for (var t = 0; t < items.length; t++) {
        ul.appendChild(h('li', null, h('span', { class: bulletCls, text: '▸' }), document.createTextNode(items[t])));
      }
      return ul;
    }
    var links = h('div', { class: 'links-row' });
    for (var l = 0; l < LAB.DEBRIEF.links.length; l++) {
      (function (lnk) {
        var a = h('a', { class: 'link-chip', href: lnk.url, target: '_blank', rel: 'noopener noreferrer' });
        a.appendChild(document.createTextNode(lnk.label + ' '));
        a.appendChild(LAB.icon('ExternalLink', 'h-3 w-3'));
        links.appendChild(a);
      })(LAB.DEBRIEF.links[l]);
    }
    return h('section', { class: 'aar-section', 'aria-labelledby': 'debrief-h' },
      h('h2', { id: 'debrief-h', class: 'aar-h2' },
        LAB.icon('CheckCircle2', 'h-5 w-5 debrief-ico'),
        document.createTextNode(' FIELD NOTES — WHAT MERIDIAN TAUGHT US')),
      h('h3', { class: 'mono deb-h teal-h', text: 'DETECTION OPPORTUNITIES — DATA SOURCE → INDICATOR → EXAMPLE LOGIC' }),
      detGrid,
      h('h3', { class: 'mono deb-h rose-h', text: 'MITIGATION RECOMMENDATIONS — OFFICIAL MITRE IDs' }),
      mitGrid,
      h('div', { class: 'takeaways-grid' },
        h('div', { class: 'brief-box rel' },
          h('h3', { class: 'mono brief-h3 teal-h', text: 'BLUE-TEAM TAKEAWAYS' }),
          takeaways(LAB.DEBRIEF.blueTakeaways, 'teal-bullet')),
        h('div', { class: 'brief-box sit' },
          h('h3', { class: 'mono brief-h3 rose-h', text: 'RED-TEAM MINDSET (KNOW THE OPPONENT)' }),
          takeaways(LAB.DEBRIEF.redTakeaways, 'rose-bullet'))),
      h('h3', { class: 'mono deb-h', text: 'OFFICIAL REFERENCES (OPEN IN NEW TAB)' }),
      links);
  }

  // ── AAR tabs + end-of-watch ──────────────────────────────────────────────
  function aarWing(ctx) {
    var quiz = quizSection(ctx);
    var debrief = debriefSection();

    var tabQuiz = h('button', { type: 'button', class: 'tab tab-quiz', role: 'tab', 'aria-selected': 'true', text: 'QUALITY CONTROL' });
    var tabDebrief = h('button', { type: 'button', class: 'tab tab-debrief', role: 'tab', 'aria-selected': 'false', text: 'FIELD NOTES' });
    var tabBar = h('div', { class: 'tabs-bar', role: 'tablist' }, tabQuiz, tabDebrief);
    var panelQuiz = h('div', { class: 'tab-panel', role: 'tabpanel' }, quiz.el);
    var panelDebrief = h('div', { class: 'tab-panel', role: 'tabpanel', hidden: true }, debrief.el);

    var active = 'quiz';
    function setTab(t) {
      active = t;
      tabQuiz.setAttribute('aria-selected', t === 'quiz' ? 'true' : 'false');
      tabDebrief.setAttribute('aria-selected', t === 'debrief' ? 'true' : 'false');
      panelQuiz.hidden = t !== 'quiz';
      panelDebrief.hidden = t !== 'debrief';
    }
    tabQuiz.addEventListener('click', function () { setTab('quiz'); });
    tabDebrief.addEventListener('click', function () { setTab('debrief'); });
    // arrow-key roving focus (Radix Tabs behavior parity)
    tabBar.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        var next = active === 'quiz' ? 'debrief' : 'quiz';
        setTab(next);
        (next === 'quiz' ? tabQuiz : tabDebrief).focus();
      }
    });

    var ewHead = h('h2', { class: 'mono ew-head' }, LAB.icon('CheckCircle2', 'h-5 w-5 ew-ico'), document.createTextNode(' END OF WATCH'));
    var ewNote = h('p', { class: 'ew-note' });
    var ewBtn = h('button', { type: 'button', class: 'btn btn-emerald btn-min11 ew-btn', text: 'COMPLETE INCIDENT IR-2025-0141' });
    ewBtn.addEventListener('click', function () {
      LAB.setState({ completed: true, completedAt: Date.now() });
      ctx.openCompletion(ewBtn);
    });
    var endwatch = h('div', { class: 'endwatch' }, ewHead, ewNote, ewBtn);

    function update(st) {
      quiz.update(st);
      var mode = st.mode;
      var total = mode === 'medium' ? 12 : 9;
      var passed = 0;
      for (var k in st.objectives) if (st.objectives[k].status === 'passed') passed++;
      var canComplete = passed === total && st.quizSubmitted;
      ewNote.textContent = canComplete
        ? 'Every objective validated and the knowledge check is in. Close the incident and see your mastery report.'
        : 'Close requirements: ' + passed + '/' + total + ' objectives validated · knowledge check ' + (st.quizSubmitted ? 'submitted' : 'not submitted') + '. The button arms itself when both are true.';
      setDisabled(ewBtn, !canComplete);
    }
    update(LAB.getState());

    return {
      el: h('div', { class: 'aar-wing' }, tabBar, panelQuiz, panelDebrief, endwatch),
      update: update,
    };
  }

  // expose kit + sections for app.js
  LAB.ui = {
    h: h, pad2: pad2, defaultProg: defaultProg, has: has, setClass: setClass, setDisabled: setDisabled,
    pillarBadge: pillarBadge, objectiveCard: objectiveCard, objCardStack: objCardStack,
    radioCards: radioCards, orderBuilder: orderBuilder, evidenceStream: evidenceStream,
    metricInput: metricInput, classifyRow: classifyRow, checkList: checkList, switchRow: switchRow,
    panel: panel, phaseIntro: phaseIntro, PHASE_TONE: PHASE_TONE,
    identifyWorkspace: identifyWorkspace, analyzeWorkspace: analyzeWorkspace,
    containWorkspace: containWorkspace, eradicateWorkspace: eradicateWorkspace,
    recoverWorkspace: recoverWorkspace, learnWorkspace: learnWorkspace,
    assetBay: assetBay, modeSelect: modeSelect, briefingSection: briefingSection,
    knowledgeCore: knowledgeCore, quizSection: quizSection, debriefSection: debriefSection,
    aarWing: aarWing,
  };
})(window.LAB);
