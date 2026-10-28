/**
 * UI helpers & reusable widgets — vanilla ports of the original lab's
 * src/components/lab/widgets.tsx primitives (Stamp, PillarChip, ProgressRing,
 * Term, Sequencer, AssignRow, ResultLine) plus small DOM/HTML helpers and a
 * minimal accessible dialog framework replacing Radix Dialog/AlertDialog/Sheet.
 *
 * Rendering philosophy: template functions return HTML strings; interactive
 * widgets (Sequencer) attach behavior to a mounted element so reordering is
 * done surgically on the DOM (no re-render → no focus loss, no animation
 * replay). Field inputs (selects, checkboxes, radios) commit to the store on
 * change and need no re-render at all — the store is the source of truth and
 * the check engine reads it on demand.
 */

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* shadcn "cn"-style conditional class helper for template strings */
function cx() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    var a = arguments[i];
    if (!a) continue;
    if (typeof a === 'string') out.push(a);
    else if (typeof a === 'object') for (var k in a) if (a[k]) out.push(k);
  }
  return out.join(' ');
}

var LabUI = (function () {

  /* ---------------------------------------------------------------- */
  /* Stamp — the signature approval slam (widgets.tsx Stamp)           */
  /* ---------------------------------------------------------------- */

  function stamp(opts) {
    var tone = opts.tone === 'fail' ? 'fail' : 'pass';
    var extra = opts.className ? ' ' + opts.className : '';
    var animate = opts.animate === false ? '' : ' stamp-animate';
    return '<div class="stamp stamp--' + tone + animate + extra + '" role="status" aria-live="polite">' +
      labIcon('Stamp', 'stamp-icon') +
      '<span>' + esc(opts.label) + '</span>' +
      '</div>';
  }

  /** Replay the slam animation on an existing stamp element. */
  function replayStamp(el) {
    if (!el) return;
    el.classList.remove('stamp-animate');
    void el.offsetWidth; /* reflow restarts the CSS animation */
    el.classList.add('stamp-animate');
  }

  /* ---------------------------------------------------------------- */
  /* Progress ring (widgets.tsx ProgressRing)                          */
  /* ---------------------------------------------------------------- */

  function progressRing(value, label, size, stroke) {
    size = size || 40;
    stroke = stroke || 4;
    var r = (size - stroke) / 2;
    var c = 2 * Math.PI * r;
    var v = Math.min(1, Math.max(0, value || 0));
    var off = c * (1 - v);
    return '<div class="ring" role="img" aria-label="' + esc(label || ('Progress ' + Math.round(v * 100) + ' percent')) + '">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" class="ring-svg">' +
      '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" class="ring-track"></circle>' +
      '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" stroke-linecap="round" class="ring-arc" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"></circle>' +
      '</svg>' +
      '<span class="ring-label" aria-hidden="true">' + Math.round(v * 100) + '</span>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- */
  /* Pillar chip (widgets.tsx PillarChip)                              */
  /* ---------------------------------------------------------------- */

  function pillarChip(pillar) {
    var p = PILLARS[pillar];
    return '<span class="pillar-chip ' + p.chip + '">' +
      labIcon(p.icon, 'pillar-chip-icon') + esc(p.label) +
      '</span>';
  }

  /* ---------------------------------------------------------------- */
  /* Glossary tooltip term (widgets.tsx Term)                          */
  /* ---------------------------------------------------------------- */

  function term(t, childrenHtml) {
    var needle = t.toLowerCase();
    var entry = null;
    for (var i = 0; i < GLOSSARY.length; i++) {
      var gt = GLOSSARY[i].term.toLowerCase();
      if (gt.indexOf(needle) === 0 || needle.indexOf(gt) !== -1) { entry = GLOSSARY[i]; break; }
    }
    var label = childrenHtml != null ? childrenHtml : esc(t);
    return '<span class="term-wrap">' +
      '<button type="button" class="term" aria-label="Definition of ' + esc(t) + '">' + label + '</button>' +
      '<span class="term-tip" role="tooltip">' + esc(entry ? entry.def : t) + '</span>' +
      '</span>';
  }

  /* ---------------------------------------------------------------- */
  /* Result line (widgets.tsx ResultLine)                              */
  /* ---------------------------------------------------------------- */

  function resultLine(pass, innerHtml) {
    return '<div class="result-line ' + (pass ? 'result-line--pass' : 'result-line--fail') + '" role="status">' +
      labIcon(pass ? 'CheckCircle2' : 'XCircle', 'result-line-icon') +
      '<div>' + innerHtml + '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- */
  /* AssignRow (widgets.tsx AssignRow) — label + one native select     */
  /* ---------------------------------------------------------------- */

  /**
   * opts: { index?, labelHtml?, sub?, options, value, onChange(v), ariaLabel, placeholder?, id?, locked? }
   * Returns an element. The select commits via onChange; no re-render needed.
   * `locked` (Audit v3 R2) renders the row read-only once its objective is filed.
   */
  function assignRow(opts) {
    var placeholder = opts.placeholder || 'Select…';
    var el = document.createElement('div');
    el.className = 'assign-row';
    var indexHtml = typeof opts.index === 'number'
      ? '<span class="assign-index" aria-hidden="true">' + opts.index + '</span>' : '';
    var labelHtml = opts.labelHtml ? '<p class="assign-label">' + opts.labelHtml + '</p>' : '';
    var subHtml = opts.sub ? '<p class="assign-sub">' + esc(opts.sub) + '</p>' : '';
    var optsHtml = '<option value="" disabled selected hidden>' + esc(placeholder) + '</option>';
    for (var i = 0; i < opts.options.length; i++) {
      var o = opts.options[i];
      var sel = opts.value === o.id ? ' selected' : '';
      optsHtml += '<option value="' + esc(o.id) + '"' + sel + '>' + esc(o.label) + '</option>';
    }
    var selId = opts.id ? ' id="' + esc(opts.id) + '"' : '';
    el.innerHTML =
      (indexHtml || labelHtml || subHtml
        ? '<div class="assign-main">' + indexHtml + '<div class="assign-main-text">' + labelHtml + subHtml + '</div></div>'
        : '') +
      '<div class="assign-field">' +
      '<select' + selId + ' aria-label="' + esc(opts.ariaLabel) + '" class="select' + (opts.locked ? ' select--locked' : '') + '"' + (opts.locked ? ' disabled' : '') + '>' + optsHtml + '</select>' +
      '</div>';
    if (opts.fieldKey) el.setAttribute('data-field', opts.fieldKey); /* Audit v3: lock refresh hook */
    if (!opts.value) {
      /* keep the placeholder grey until a real value is chosen */
      var sel = el.querySelector('select');
      sel.classList.add('select--empty');
      sel.addEventListener('change', function () { sel.classList.remove('select--empty'); }, { once: true });
    }
    if (opts.onChange) {
      el.querySelector('select').addEventListener('change', function (e) {
        opts.onChange(e.target.value);
      });
    }
    return el;
  }

  /* ---------------------------------------------------------------- */
  /* Checkbox / radio rows                                             */
  /* ---------------------------------------------------------------- */

  function checkboxRow(opts) {
    /* opts: { id, labelHtml, checked, onChange, ariaLabel?, name?, locked?, fieldKey? } */
    var row = '<div class="choice-row' + (opts.locked ? ' choice-row--locked' : '') + '">' +
      '<input type="checkbox" class="choice-input" id="' + esc(opts.id) + '"' +
      (opts.checked ? ' checked' : '') + (opts.locked ? ' disabled' : '') + ' aria-label="' + esc(opts.ariaLabel || '') + '">' +
      '<label class="choice-label" for="' + esc(opts.id) + '">' + opts.labelHtml + '</label>' +
      '</div>';
    return opts.fieldKey ? row.replace('class="choice-row', 'data-field="' + esc(opts.fieldKey) + '" class="choice-row') : row;
  }

  function radioRow(opts) {
    /* opts: { name, id, labelHtml, checked, ariaLabel?, wrapClass?, locked?, fieldKey? } */
    var row = '<div class="' + (opts.wrapClass || 'choice-row') + (opts.locked ? ' choice-row--locked' : '') + '">' +
      '<input type="radio" class="choice-input" name="' + esc(opts.name) + '" id="' + esc(opts.id) + '" value="' + esc(opts.value) + '"' +
      (opts.checked ? ' checked' : '') + (opts.locked ? ' disabled' : '') + ' aria-label="' + esc(opts.ariaLabel || '') + '">' +
      '<label class="choice-label" for="' + esc(opts.id) + '">' + opts.labelHtml + '</label>' +
      '</div>';
    return opts.fieldKey ? row.replace('class="choice-row', 'data-field="' + esc(opts.fieldKey) + '" class="choice-row') : row;
  }

  /* ---------------------------------------------------------------- */
  /* Sequencer (widgets.tsx Sequencer) — ordered list, drag + arrows   */
  /* ---------------------------------------------------------------- */

  /**
   * opts: { items: [{id,label,desc?,chip?}], value: string[], onChange(order), idPrefix, hint?, locked? }
   * Returns an <ol> element that reorders ITSELF surgically (arrow moves splice
   * the DOM <li> in place; drag uses HTML5 DnD) and calls onChange with the
   * new order — no re-render, so focus survives keyboard moves.
   * `locked` (Audit v3 R2) makes the sequence read-only once its objective is filed.
   */
  function sequencer(opts) {
    var byId = {};
    opts.items.forEach(function (i) { byId[i.id] = i; });
    var locked = !!opts.locked;

    var ol = document.createElement('ol');
    ol.className = 'seq';
    ol.setAttribute('aria-label', opts.hint || 'Ordered list');
    if (opts.fieldKey) ol.setAttribute('data-field', opts.fieldKey); /* Audit v3: lock refresh hook */
    if (opts.hint) ol.setAttribute('aria-describedby', opts.idPrefix + '-hint');

    function buildItems() {
      ol.innerHTML = (opts.hint
        ? '<p id="' + esc(opts.idPrefix) + '-hint" class="seq-hint">' + esc(opts.hint) + '</p>' : '');
      opts.value.forEach(function (id, idx) {
        var item = byId[id];
        if (!item) return;
        var li = document.createElement('li');
        li.className = 'seq-item' + (locked ? ' seq-item--locked' : '');
        li.draggable = !locked;
        li.dataset.id = id;
        li.innerHTML =
          '<span class="seq-num" aria-hidden="true">' + (idx + 1) + '</span>' +
          '<div class="seq-text">' +
          '<p class="seq-label">' +
          (item.chip ? '<span class="seq-chip">' + esc(item.chip) + '</span>' : '') +
          esc(item.label) + '</p>' +
          (item.desc ? '<p class="seq-desc">' + esc(item.desc) + '</p>' : '') +
          '</div>' +
          '<span class="seq-btns">' +
          '<button type="button" class="seq-btn" data-dir="up" aria-label="Move ' + esc(item.label) + ' up to position ' + idx + '"' + (locked || idx === 0 ? ' disabled' : '') + '>' + labIcon('ArrowUp') + '</button>' +
          '<button type="button" class="seq-btn" data-dir="down" aria-label="Move ' + esc(item.label) + ' down to position ' + (idx + 2) + '"' + (locked || idx === opts.value.length - 1 ? ' disabled' : '') + '>' + labIcon('ArrowDown') + '</button>' +
          '</span>';
        ol.appendChild(li);
      });
    }

    function readOrder() {
      var order = [];
      ol.querySelectorAll('.seq-item').forEach(function (li) { order.push(li.dataset.id); });
      return order;
    }

    function syncList() {
      /* renumber + fix disabled states + fix aria-labels after a surgical move */
      var items = ol.querySelectorAll('.seq-item');
      items.forEach(function (li, idx) {
        var item = byId[li.dataset.id];
        li.querySelector('.seq-num').textContent = String(idx + 1);
        var up = li.querySelector('[data-dir="up"]');
        var down = li.querySelector('[data-dir="down"]');
        up.disabled = idx === 0;
        down.disabled = idx === items.length - 1;
        up.setAttribute('aria-label', 'Move ' + item.label + ' up to position ' + idx);
        down.setAttribute('aria-label', 'Move ' + item.label + ' down to position ' + (idx + 2));
      });
    }

    function move(from, to) {
      if (locked) return; /* Audit v3 (R2) */
      if (to < 0 || to >= opts.value.length || from === to) return;
      var lis = ol.querySelectorAll('.seq-item');
      var movedLi = lis[from];
      var ref = lis[to];
      if (to > from) ref.parentNode.insertBefore(movedLi, ref.nextSibling);
      else ref.parentNode.insertBefore(movedLi, ref);
      opts.value = readOrder();
      syncList();
      opts.onChange(opts.value.slice());
    }

    ol.addEventListener('click', function (e) {
      var btn = e.target.closest('.seq-btn');
      if (!btn || btn.disabled) return;
      var li = btn.closest('.seq-item');
      var lis = Array.prototype.slice.call(ol.querySelectorAll('.seq-item'));
      var idx = lis.indexOf(li);
      move(idx, btn.dataset.dir === 'up' ? idx - 1 : idx + 1);
      /* keep focus on the pressed button — it stayed mounted (surgical move) */
    });

    /* HTML5 drag & drop, same model as the original */
    var dragFrom = null;
    ol.addEventListener('dragstart', function (e) {
      var li = e.target.closest('.seq-item');
      if (!li) return;
      dragFrom = Array.prototype.slice.call(ol.querySelectorAll('.seq-item')).indexOf(li);
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', li.dataset.id); } catch (err) { /* IE */ }
    });
    ol.addEventListener('dragover', function (e) { e.preventDefault(); });
    ol.addEventListener('drop', function (e) {
      e.preventDefault();
      var li = e.target.closest('.seq-item');
      if (li && dragFrom !== null) {
        var to = Array.prototype.slice.call(ol.querySelectorAll('.seq-item')).indexOf(li);
        move(dragFrom, to);
      }
      dragFrom = null;
    });

    buildItems();
    return ol;
  }

  /* ---------------------------------------------------------------- */
  /* Dialog framework (replaces Radix Dialog / AlertDialog / Sheet)     */
  /* ---------------------------------------------------------------- */

  var dlgState = { opener: null, overlay: null, keydownHandler: null };

  function getFocusables(root) {
    return Array.prototype.slice.call(
      root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  /**
   * openDialog({ titleHtml, descHtml, bodyHtml, footerHtml, variant, titleId, labelledBy,
   *              onClose, wide })
   * variant: 'dialog' | 'alert' | 'sheet'
   */
  function openDialog(opts) {
    closeDialog(true);
    dlgState.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    var overlay = document.createElement('div');
    overlay.className = 'dlg-overlay dlg-overlay--' + (opts.variant || 'dialog');
    var cardClass = cx('dlg-card',
      opts.variant === 'sheet' ? 'dlg-card--sheet' : '',
      opts.wide ? 'dlg-card--wide' : '',
      opts.cardClass || '');
    overlay.innerHTML =
      '<div class="' + cardClass + '" role="' + (opts.variant === 'alert' ? 'alertdialog' : 'dialog') + '" aria-modal="true" ' +
      'aria-labelledby="' + esc(opts.labelledBy || 'dlg-title') + '" tabindex="-1">' +
      (opts.variant !== 'sheet'
        ? '<button type="button" class="dlg-close" aria-label="Close"><span class="dlg-close-x" aria-hidden="true">×</span></button>'
        : '<button type="button" class="dlg-close dlg-close--sheet" aria-label="Close"><span class="dlg-close-x" aria-hidden="true">×</span></button>') +
      (opts.titleHtml ? '<div class="dlg-header">' + (opts.eyebrowHtml ? '<p class="dlg-eyebrow">' + opts.eyebrowHtml + '</p>' : '') +
        '<' + (opts.variant === 'alert' ? 'h2' : 'h2') + ' id="' + esc(opts.labelledBy || 'dlg-title') + '" class="dlg-title">' + opts.titleHtml + '</' + 'h2>' +
        (opts.descHtml ? '<p class="dlg-desc">' + opts.descHtml + '</p>' : '') + '</div>' : '') +
      '<div class="dlg-body' + (opts.bodyClass ? ' ' + opts.bodyClass : '') + '">' + (opts.bodyHtml || '') + '</div>' +
      (opts.footerHtml ? '<div class="dlg-footer">' + opts.footerHtml + '</div>' : '') +
      '</div>';

    document.body.appendChild(overlay);
    document.body.classList.add('dlg-open');
    dlgState.overlay = overlay;

    function close() {
      LabUI.closeDialog();
      if (opts.onClose) opts.onClose();
    }
    overlay.__close = close;

    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector('.dlg-close').addEventListener('click', close);

    /* focus trap + ESC */
    var card = overlay.querySelector('.dlg-card');
    dlgState.keydownHandler = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var focusables = getFocusables(card);
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!card.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', dlgState.keydownHandler, true);

    /* initial focus: first focusable (or the card itself) */
    var f = getFocusables(card);
    if (f.length) f[0].focus(); else card.focus();

    return overlay;
  }

  function closeDialog(silent) {
    var overlay = dlgState.overlay;
    if (overlay) {
      if (dlgState.keydownHandler) document.removeEventListener('keydown', dlgState.keydownHandler, true);
      overlay.parentNode.removeChild(overlay);
      dlgState.overlay = null;
      document.body.classList.remove('dlg-open');
    }
    if (!silent && dlgState.opener && dlgState.opener.isConnected) {
      dlgState.opener.focus(); /* focus returns to the trigger — verified behavior */
    }
    if (silent) dlgState.opener = null;
  }

  /* confirm helper for the RESET alert dialog */
  function confirmReset(onConfirm, onCancel) {
    openDialog({
      variant: 'alert',
      labelledBy: 'dlg-reset-title',
      titleHtml: 'Return the binder to Day One?',
      descHtml: 'This wipes all progress — mode selection, stamps, hints, quiz and saved state — and restores the pristine binder. You will pick a track again.',
      bodyHtml: '',
      footerHtml:
        '<button type="button" class="btn btn--outline btn--dialog" data-x="cancel">Keep working</button>' +
        '<button type="button" class="btn btn--danger btn--dialog" data-x="confirm">Reset everything</button>',
      onClose: function (viaAction) { /* no-op */ },
      cardClass: 'dlg-card--paper',
    });
    var overlay = dlgState.overlay;
    overlay.querySelector('[data-x="cancel"]').addEventListener('click', function () { LabUI.closeDialog(); if (onCancel) onCancel(); });
    overlay.querySelector('[data-x="confirm"]').addEventListener('click', function () {
      LabUI.closeDialog();
      onConfirm();
    });
  }

  return {
    esc: esc, cx: cx,
    stamp: stamp, replayStamp: replayStamp,
    progressRing: progressRing,
    pillarChip: pillarChip,
    term: term,
    resultLine: resultLine,
    assignRow: assignRow,
    checkboxRow: checkboxRow,
    radioRow: radioRow,
    sequencer: sequencer,
    openDialog: openDialog,
    closeDialog: closeDialog,
    confirmReset: confirmReset,
  };
})();
