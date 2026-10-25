/**
 * CyberLab — "The Leadership Ledger" — INTERACTION WIDGETS
 *
 * Vanilla-JS port of widgets.tsx: the six machine-validated archetypes
 * (classify · choice · multiselect · sequence · match · decision) plus the
 * teaching results list. All keyboard-operable; class updates happen in place
 * (no focus loss); only the sequence widget re-renders (its DOM reorders).
 */
'use strict';

/* ------------------------------------------------------------------ */
/* Small DOM helpers                                                   */
/* ------------------------------------------------------------------ */

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* focus-ring fallback for browsers without :has() — toggled via delegation */
function wireFocusRing(container) {
  container.addEventListener('focusin', function (e) {
    var chip = e.target.closest('.chip, .choice-row, .checkbox-row');
    if (chip) chip.classList.add('kb-focus');
  });
  container.addEventListener('focusout', function (e) {
    var chip = e.target.closest('.chip, .choice-row, .checkbox-row');
    if (chip) chip.classList.remove('kb-focus');
  });
}

/* ------------------------------------------------------------------ */
/* classify                                                            */
/* ------------------------------------------------------------------ */

function buildClassify(spec, ctx) {
  var wrap = el('div');
  wrap.appendChild(el('p', 'part-prompt', spec.prompt));
  var list = el('ul');
  spec.items.forEach(function (it) {
    var li = el('li', 'classify-item');
    li.appendChild(el('p', 'ci-text', it.text));
    var group = el('div', 'chip-row');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Classify: ' + it.text);
    spec.buckets.forEach(function (b) {
      var chip = el('label', 'chip');
      if (ctx.value && ctx.value[it.id] === b.id) chip.classList.add('selected');
      if (ctx.disabled) chip.classList.add('disabled');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = ctx.objId + '-' + ctx.partIdx + '-' + it.id;
      input.value = b.id;
      input.className = 'sr-only';
      input.checked = ctx.value ? ctx.value[it.id] === b.id : false;
      input.disabled = !!ctx.disabled;
      input.addEventListener('change', function () {
        if (input.disabled) return;
        var chips = group.querySelectorAll('.chip');
        for (var i = 0; i < chips.length; i++) chips[i].classList.remove('selected');
        chip.classList.add('selected');
        /* merge the new bucket for this item into the answer record */
        var next = Object.assign({}, ctx.get());
        next[it.id] = b.id;
        ctx.onChange(next);
      });
      chip.appendChild(input);
      chip.appendChild(document.createTextNode(b.label));
      group.appendChild(chip);
    });
    li.appendChild(group);
    list.appendChild(li);
  });
  wrap.appendChild(list);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* choice (main + optional second)                                     */
/* ------------------------------------------------------------------ */

function buildChoiceGroup(prompt, options, name, current, ctx, key) {
  var box = el('div');
  box.appendChild(el('p', 'part-prompt', prompt));
  options.forEach(function (o) {
    var row = el('label', 'choice-row');
    var selected = current === o.id;
    if (selected) row.classList.add('selected');
    if (ctx.disabled) row.classList.add('disabled');
    var visual = el('span', 'radio-visual');
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = o.id;
    input.checked = selected;
    input.disabled = !!ctx.disabled;
    input.addEventListener('change', function () {
      if (input.disabled) return;
      var rows = box.querySelectorAll('.choice-row');
      for (var i = 0; i < rows.length; i++) rows[i].classList.remove('selected');
      row.classList.add('selected');
      var next = Object.assign({}, ctx.get());
      next[key] = o.id;
      ctx.onChange(next);
    });
    visual.appendChild(input);
    row.appendChild(visual);
    row.appendChild(el('span', 'ink', o.label));
    box.appendChild(row);
  });
  return box;
}

function buildChoice(spec, ctx) {
  var wrap = el('div');
  var rec = ctx.value || {};
  wrap.appendChild(
    buildChoiceGroup(spec.prompt, spec.options, ctx.objId + '-' + ctx.partIdx + '-main', rec.main, ctx, 'main')
  );
  if (spec.second) {
    wrap.appendChild(
      buildChoiceGroup(spec.second.prompt, spec.second.options, ctx.objId + '-' + ctx.partIdx + '-second', rec.second, ctx, 'second')
    );
  }
  return wrap;
}

/* ------------------------------------------------------------------ */
/* multiselect                                                         */
/* ------------------------------------------------------------------ */

function buildMultiSelect(spec, ctx) {
  var wrap = el('div');
  var promptP = el('p', 'part-prompt');
  promptP.appendChild(document.createTextNode(spec.prompt + ' '));
  promptP.appendChild(el('span', 'soft', '(select exactly ' + spec.pick + ')'));
  wrap.appendChild(promptP);
  var group = el('div');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', spec.prompt);
  var arr = Array.isArray(ctx.value) ? ctx.value : [];
  spec.items.forEach(function (it) {
    var checked = arr.indexOf(it.id) >= 0;
    var row = el('label', 'checkbox-row');
    if (checked) row.classList.add('selected');
    if (ctx.disabled) row.classList.add('disabled');
    var visual = el('span', 'checkbox-visual');
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.disabled = !!ctx.disabled;
    input.setAttribute('aria-label', it.text);
    input.addEventListener('change', function () {
      if (input.disabled) return;
      var current = Array.isArray(ctx.get()) ? ctx.get().slice() : [];
      var idx = current.indexOf(it.id);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(it.id);
      if (current.length) row.classList.add('selected');
      else row.classList.remove('selected');
      ctx.onChange(current);
    });
    visual.appendChild(input);
    row.appendChild(visual);
    row.appendChild(el('span', 'ink', it.text));
    group.appendChild(row);
  });
  wrap.appendChild(group);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* sequence                                                            */
/* ------------------------------------------------------------------ */

function buildSequence(spec, ctx) {
  var wrap = el('div');
  wrap.appendChild(el('p', 'part-prompt', spec.prompt));
  var byId = {};
  spec.items.forEach(function (i) { byId[i.id] = i; });

  var listBox = el('div');
  listBox.setAttribute('aria-label', 'Current sequence');
  var poolBox = null;

  function currentSeq() {
    var v = ctx.get();
    return Array.isArray(v) ? v.slice() : [];
  }

  function rerender() {
    var seq = currentSeq();
    listBox.textContent = '';
    if (seq.length === 0) {
      listBox.appendChild(
        el(
          'p',
          'seq-empty',
          'Sequence is empty — add steps from the pool below in the order you would issue them.'
        )
      );
    }
    seq.forEach(function (id, idx) {
      var row = el('div', 'seq-row');
      row.appendChild(el('span', 'seq-num', String(idx + 1)));
      row.appendChild(el('span', 'seq-text', byId[id] ? byId[id].text : id));
      if (!ctx.disabled) {
        var controls = el('span', 'seq-controls');
        var up = el('button', 'seq-btn');
        up.type = 'button';
        up.appendChild(icon('ArrowUp', { px: 14 }));
        up.setAttribute('aria-label', 'Move step ' + (idx + 1) + ' up');
        up.disabled = idx === 0;
        up.addEventListener('click', function () { move(idx, -1, up); });
        var down = el('button', 'seq-btn');
        down.type = 'button';
        down.appendChild(icon('ArrowDown', { px: 14 }));
        down.setAttribute('aria-label', 'Move step ' + (idx + 1) + ' down');
        down.disabled = idx === seq.length - 1;
        down.addEventListener('click', function () { move(idx, 1, down); });
        var remove = el('button', 'seq-btn');
        remove.type = 'button';
        remove.appendChild(icon('X', { px: 14 }));
        remove.setAttribute('aria-label', 'Remove step ' + (idx + 1));
        remove.addEventListener('click', function () {
          commit(currentSeq().filter(function (x) { return x !== id; }), null);
        });
        controls.appendChild(up);
        controls.appendChild(down);
        controls.appendChild(remove);
        row.appendChild(controls);
      }
      listBox.appendChild(row);
    });

    /* pool */
    if (poolBox) {
      poolBox.textContent = '';
      wrap.removeChild(poolBox);
      poolBox = null;
    }
    if (!ctx.disabled) {
      var remaining = spec.items.filter(function (i) { return seq.indexOf(i.id) < 0; });
      if (remaining.length > 0) {
        poolBox = el('div');
        poolBox.appendChild(el('p', 'pool-label', 'Pool — click to add to the sequence'));
        var chips = el('div', 'pool-chips');
        remaining.forEach(function (it) {
          var chip = el('button', 'pool-chip');
          chip.type = 'button';
          chip.setAttribute('aria-label', 'Add: ' + it.text);
          chip.appendChild(document.createTextNode('+ ' + it.text));
          chip.addEventListener('click', function () {
            commit(currentSeq().concat([it.id]), chip);
          });
          chips.appendChild(chip);
        });
        poolBox.appendChild(chips);
        wrap.appendChild(poolBox);
      }
    }
  }

  function move(idx, dir, focusTarget) {
    var seq = currentSeq();
    var j = idx + dir;
    if (j < 0 || j >= seq.length) return;
    var tmp = seq[idx];
    seq[idx] = seq[j];
    seq[j] = tmp;
    commit(seq, focusTarget);
  }

  /** Push a new value through the store, then re-render from it. */
  function commit(next, focusTarget) {
    ctx.onChange(next.slice()); /* updates ctx.get() and persists */
    rerender();
    if (focusTarget && wrap.contains(focusTarget)) focusTarget.focus();
  }

  rerender();
  wrap.appendChild(listBox);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* match (native select — see Conversion Notes)                        */
/* ------------------------------------------------------------------ */

function buildMatch(spec, ctx) {
  var wrap = el('div');
  wrap.appendChild(el('p', 'part-prompt', spec.prompt));
  var list = el('ul');
  spec.rows.forEach(function (r) {
    var li = el('li', 'match-row');
    li.appendChild(el('span', 'mr-text', r.text));
    var select = document.createElement('select');
    select.className = 'match-select' + (ctx.value && ctx.value[r.id] ? '' : ' placeholder');
    select.setAttribute('aria-label', 'Select for ' + r.text);
    select.disabled = !!ctx.disabled;
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select\u2026';
    ph.disabled = true;
    ph.selected = !(ctx.value && ctx.value[r.id]);
    select.appendChild(ph);
    spec.options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.label;
      if (ctx.value && ctx.value[r.id] === o.id) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () {
      select.classList.toggle('placeholder', select.value === '');
      var next = Object.assign({}, ctx.get());
      next[r.id] = select.value;
      ctx.onChange(next);
    });
    li.appendChild(select);
    list.appendChild(li);
  });
  wrap.appendChild(list);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* decision                                                            */
/* ------------------------------------------------------------------ */

var DECISION_CLASS = { approve: 'c-approve', defer: 'c-defer', reject: 'c-reject' };

function buildDecision(spec, ctx) {
  var wrap = el('div');
  wrap.appendChild(el('p', 'part-prompt', spec.prompt));
  var list = el('ul');
  spec.rows.forEach(function (r) {
    var li = el('li', 'classify-item');
    li.appendChild(el('p', 'ci-text', r.text));
    var group = el('div', 'chip-row');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Decision for: ' + r.text);
    spec.actions.forEach(function (a) {
      var selected = ctx.value && ctx.value[r.id] === a.id;
      var chip = el('label', 'chip');
      if (selected) {
        chip.classList.add('selected');
        if (DECISION_CLASS[a.id]) chip.classList.add(DECISION_CLASS[a.id]);
      }
      if (ctx.disabled) chip.classList.add('disabled');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = ctx.objId + '-' + ctx.partIdx + '-' + r.id;
      input.value = a.id;
      input.className = 'sr-only';
      input.checked = !!selected;
      input.disabled = !!ctx.disabled;
      input.addEventListener('change', function () {
        if (input.disabled) return;
        var chips = group.querySelectorAll('.chip');
        for (var i = 0; i < chips.length; i++) chips[i].className = 'chip';
        chip.classList.add('selected');
        if (DECISION_CLASS[a.id]) chip.classList.add(DECISION_CLASS[a.id]);
        var next = Object.assign({}, ctx.get());
        next[r.id] = a.id;
        ctx.onChange(next);
      });
      chip.appendChild(input);
      chip.appendChild(document.createTextNode(a.label));
      group.appendChild(chip);
    });
    li.appendChild(group);
    list.appendChild(li);
  });
  wrap.appendChild(list);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */

/**
 * Build one widget part.
 * @param {object} spec PartSpec from data.js
 * @param {{objId: string, partIdx: number, value: any, disabled: boolean,
 *          onChange: function(any): void}} ctx
 * ctx.get() must return the widget's CURRENT answer value (live).
 */
function buildWidget(spec, ctx) {
  var container = el('div', 'widget');
  var external = ctx.onChange; /* app-provided sink (persist + touched refresh) */
  var local = ctx.value;
  ctx.get = function () { return local; };
  ctx.onChange = function (v) {
    local = v;
    external(v);
  };
  switch (spec.kind) {
    case 'classify':
      container.appendChild(buildClassify(spec, ctx));
      break;
    case 'choice':
      container.appendChild(buildChoice(spec, ctx));
      break;
    case 'multiselect':
      container.appendChild(buildMultiSelect(spec, ctx));
      break;
    case 'sequence':
      container.appendChild(buildSequence(spec, ctx));
      break;
    case 'match':
      container.appendChild(buildMatch(spec, ctx));
      break;
    case 'decision':
      container.appendChild(buildDecision(spec, ctx));
      break;
  }
  wireFocusRing(container);
  return container;
}

/* ------------------------------------------------------------------ */
/* Results list (teaching feedback)                                    */
/* ------------------------------------------------------------------ */

function renderResults(results) {
  var ul = el('ul', 'results');
  ul.setAttribute('role', 'list');
  results.forEach(function (r) {
    var li = el('li', r.ok ? 'ok' : 'bad');
    var label = el('p', 'r-label', (r.ok ? '\u2713 ' : '\u2717 ') + r.label);
    var explain = el('p', 'r-explain', r.explain);
    li.appendChild(label);
    li.appendChild(explain);
    ul.appendChild(li);
  });
  return ul;
}
