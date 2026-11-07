/* ==========================================================================
   js/app.js — bootstrap, event wiring, modals (static port of the lab root)
   --------------------------------------------------------------------------
   Replaces React/Radix with:
   - a full-shell render on every store change (string templates from ui.js),
     preserving focus, text caret and drawer scroll across re-renders;
   - event delegation via data-action attributes;
   - a small dialog system with the same dismissal paths as Radix (X button,
     Escape, outside click) and a focus trap.
   ========================================================================== */

'use strict';

/* ------------------------------ focus helpers ---------------------------- */

const FOCUS_ATTRS = [
  'data-obj', 'data-id', 'data-qid', 'data-oid', 'data-station', 'data-mode',
  'data-tab', 'data-env', 'data-dir', 'data-idx', 'data-value',
];

function describeFocus(el) {
  if (!el || el === document.body) return null;
  if (el.id) return { sel: '#' + el.id };
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' && el.type === 'radio' && el.name) {
    return { sel: 'input[name="' + el.name + '"][value="' + el.value + '"]' };
  }
  if (tag === 'input' && el.type === 'checkbox' && el.hasAttribute('data-id')) {
    return { sel: 'input[data-env-list="' + el.getAttribute('data-env-list') + '"][data-id="' + el.getAttribute('data-id') + '"]' };
  }
  if (el.hasAttribute('data-action')) {
    let sel = '[data-action="' + el.getAttribute('data-action') + '"]';
    for (const a of FOCUS_ATTRS) {
      if (el.hasAttribute(a)) sel += '[' + a + '="' + el.getAttribute(a) + '"]';
    }
    const matches = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (matches.length > 1) return { sel: sel, index: matches.indexOf(el) };
    return { sel: sel };
  }
  return null;
}

function captureFocus() {
  return describeFocus(document.activeElement);
}

function restoreFocus(sig) {
  if (!sig) return;
  const el = document.querySelector(sig.sel);
  if (!el) return;
  const target = sig.index !== undefined ? document.querySelectorAll(sig.sel)[sig.index] : el;
  if (!target) return;
  target.focus({ preventScroll: true });
  if (typeof target.setSelectionRange === 'function' && target.selectionStart !== null) {
    const pos = target.selectionStart;
    try {
      target.setSelectionRange(pos, pos);
    } catch (e) {
      /* input types without selection API */
    }
  }
}

/* ------------------------------ shell render ----------------------------- */

function getMode() {
  return state.mode === null ? 'medium' : state.mode;
}

function isSealEligible() {
  const mode = getMode();
  const objs = objectivesFor(mode);
  const summary = summarize(state, mode);
  return objs.every(function (o) { return state.obj[o.id] && state.obj[o.id].passed; }) &&
    state.quizSubmitted &&
    summary.stars >= 1;
}

function render() {
  const app = document.getElementById('app');
  if (!state.mode) {
    app.innerHTML = modeGateHTML();
    return;
  }
  const mode = getMode();
  const objs = objectivesFor(mode);
  const passed = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].passed; }).length;
  const stationTitle = (STATIONS.find(function (s) { return s.id === state.station; }) || STATIONS[0]).title;

  app.innerHTML =
    '<div class="shell">' +
    '<a href="#station-stage" class="skip-link">Skip to the audit stage</a>' +
    mastheadHTML() +
    '<main class="shell-main">' +
    '<div class="mobile-only">' + stationRailHTML() + '</div>' +
    '<div class="shell-grid">' +
    '<div class="rail-side"><div class="rail-side-inner">' +
    '<p class="rail-label">' + icon('ScrollText', 'i4') + 'Case file stations</p>' +
    stationRailHTML() +
    '</div></div>' +
    '<div id="station-stage" tabindex="-1">' + stationHTML(state.station) + '</div>' +
    '<div class="tracker-side"><div class="tracker-side-inner">' + trackerHTML() + '</div></div>' +
    '</div></main>' +
    '<div class="mobile-only">' +
    '<button class="fab" data-action="open-tracker" aria-label="Open objectives tracker: ' + passed + ' of ' + objs.length + ' passed">' +
    icon('ListChecks', 'i5') + passed + '/' + objs.length + '</button></div>' +
    '<span class="sr-only" aria-live="polite">' + esc(stationTitle) + ' station, ' +
    (mode === 'medium' ? 'guided mode' : 'challenge mode') + '</span>' +
    '<div class="receipt-flourish">' + icon('ReceiptText', 'i4') + '</div>' +
    '</div>';
}

/** Re-render, then restore focus, caret and drawer scroll positions. */
function rerender() {
  const sig = captureFocus();
  const scrolls = Array.prototype.map.call(document.querySelectorAll('.drawer-scroll'), function (el) {
    return el.scrollTop;
  });
  render();
  Array.prototype.forEach.call(document.querySelectorAll('.drawer-scroll'), function (el, i) {
    el.scrollTop = scrolls[i] || 0;
  });
  restoreFocus(sig);
  // Play the objective-card reveal animation only where content just changed.
  requestAnimationFrame(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.obj-extra[data-anim="1"]'), function (el) {
      el.classList.add('open');
      el.removeAttribute('data-anim');
    });
  });
}

/* ------------------------------ modals ----------------------------------- */

let modal = null; // { kind, restoreTo }

function modalFrame(inner, labelledby, describedby, extraClass) {
  return (
    '<div class="modal-overlay" data-action="overlay-close"></div>' +
    '<div class="modal' + (extraClass ? ' ' + extraClass : '') + '" role="dialog" aria-modal="true"' +
    ' aria-labelledby="' + labelledby + '"' +
    (describedby ? ' aria-describedby="' + describedby + '"' : '') +
    ' tabindex="-1">' +
    '<button class="modal-x" data-action="close-modal"><span class="sr-only">Close</span>' + icon('X', 'i4') + '</button>' +
    inner +
    '</div>'
  );
}

function resetModalHTML() {
  const mode = getMode();
  const total = objectivesFor(mode).length;
  return modalFrame(
    '<header>' +
      '<div class="modal-title-row" id="reset-title">' + icon('AlertTriangle', 'i5') + 'Reset the audit desk?</div>' +
      '<p class="modal-desc">This shreds the case file: mode, all ' + total +
      ' objectives, quiz answers, ledger marks and every tool setting return to pristine. This cannot be undone.</p>' +
      '</header>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-outline t-ink" data-action="close-modal">Keep working</button>' +
      '<button class="btn btn-danger" data-action="reset-lab">' + icon('RotateCcw', 'i4') + 'Shred &amp; reset</button>' +
      '</div>',
    'reset-title',
    null
  );
}

function trackerModalHTML() {
  return modalFrame(
    '<p class="sr-title sr-only" id="tracker-title">Objectives tracker</p>' + trackerHTML(),
    'tracker-title',
    null,
    'cream'
  );
}

function sealModalHTML() {
  return modalFrame(completionSealHTML(), 'seal-title', 'completion-desc', 'modal-lg');
}

function openModal(kind) {
  if (modal) closeModal(true);
  modal = { kind: kind, restoreTo: document.activeElement };
  const root = document.getElementById('modal-root');
  root.innerHTML =
    kind === 'reset' ? resetModalHTML() : kind === 'tracker' ? trackerModalHTML() : sealModalHTML();
  const dlg = root.querySelector('.modal');
  if (dlg) dlg.focus({ preventScroll: true });
}

function closeModal(skipRestore) {
  if (!modal) return;
  document.getElementById('modal-root').innerHTML = '';
  const restoreTo = modal.restoreTo;
  modal = null;
  if (!skipRestore && restoreTo && document.contains(restoreTo)) {
    restoreTo.focus({ preventScroll: true });
  }
}

function syncSealModal() {
  const shouldOpen = isSealEligible() && !state.completionSeen;
  if (shouldOpen) {
    if (modal && modal.kind === 'seal') {
      document.getElementById('modal-root').innerHTML = sealModalHTML();
      const dlg = document.querySelector('#modal-root .modal');
      if (dlg) dlg.focus({ preventScroll: true });
    } else if (!modal) {
      openModal('seal');
    }
  } else if (modal && modal.kind === 'seal') {
    closeModal(true);
  }
}

/* ------------------------------ env mutation helpers --------------------- */

function patchEnvPath(path, value) {
  const dot = path.indexOf('.');
  if (dot === -1) {
    const patch = {};
    patch[path] = value;
    dispatch({ type: 'PATCH_ENV', patch: patch });
  } else {
    const parent = path.slice(0, dot);
    const key = path.slice(dot + 1);
    const patch = {};
    patch[parent] = Object.assign({}, state.env[parent]);
    patch[parent][key] = value;
    dispatch({ type: 'PATCH_ENV', patch: patch });
  }
}

function toggleEnvList(name, id, on) {
  const cur = state.env[name] || [];
  const next = on ? cur.concat([id]) : cur.filter(function (x) { return x !== id; });
  const patch = {};
  patch[name] = next;
  dispatch({ type: 'PATCH_ENV', patch: patch });
}

/* ------------------------------ event delegation ------------------------- */

function findAction(node) {
  let el = node;
  while (el && el !== document) {
    if (el.hasAttribute && el.hasAttribute('data-action')) return el;
    el = el.parentNode;
  }
  return null;
}

document.addEventListener('click', function (e) {
  const el = findAction(e.target);
  if (!el) return;
  const action = el.getAttribute('data-action');

  switch (action) {
    case 'set-mode':
      dispatch({ type: 'SET_MODE', mode: el.getAttribute('data-mode') });
      break;

    case 'set-station':
      dispatch({ type: 'SET_STATION', station: el.getAttribute('data-station') });
      break;

    case 'toggle-flag':
      dispatch({ type: 'TOGGLE_FLAG', id: el.getAttribute('data-id') });
      break;

    case 'toggle-row': {
      const id = el.getAttribute('data-id');
      uiState.invoiceOpenRow = uiState.invoiceOpenRow === id ? null : id;
      rerender();
      break;
    }

    case 'check': {
      const objId = el.getAttribute('data-obj');
      // Validate first (pure), record the visible result, then dispatch CHECK —
      // so the single re-render that follows already shows the feedback.
      const def = allObjectives().find(function (o) { return o.id === objId; });
      const ok = def ? def.validate(state.env) : false;
      uiState.lastResult[objId] = ok ? 'pass' : 'fail';
      check(objId); // dispatches CHECK → notify → rerender
      break;
    }

    case 'hint':
      dispatch({ type: 'HINT', id: el.getAttribute('data-obj') });
      break;

    case 'verdict': {
      const patch = { spikeVerdicts: Object.assign({}, state.env.spikeVerdicts) };
      patch.spikeVerdicts[el.getAttribute('data-id')] = el.getAttribute('data-value');
      dispatch({ type: 'PATCH_ENV', patch: patch });
      break;
    }

    case 'apply-tags':
      dispatch({ type: 'PATCH_ENV', patch: { tagsApplied: true } });
      break;

    case 'seq-add':
      dispatch({
        type: 'PATCH_ENV',
        patch: { responseOrder: state.env.responseOrder.concat([el.getAttribute('data-id')]) },
      });
      break;

    case 'seq-move': {
      const idx = parseInt(el.getAttribute('data-idx'), 10);
      const dir = parseInt(el.getAttribute('data-dir'), 10);
      const j = idx + dir;
      const order = state.env.responseOrder.slice();
      if (j < 0 || j >= order.length) break;
      const tmp = order[idx];
      order[idx] = order[j];
      order[j] = tmp;
      dispatch({ type: 'PATCH_ENV', patch: { responseOrder: order } });
      break;
    }

    case 'switch': {
      const name = el.getAttribute('data-env');
      const patch = {};
      patch[name] = !state.env[name];
      dispatch({ type: 'PATCH_ENV', patch: patch });
      break;
    }

    case 'submit-quiz':
      dispatch({ type: 'SUBMIT_QUIZ' });
      break;

    case 'show-completion':
      dispatch({ type: 'SHOW_COMPLETION' });
      break;

    case 'seal-revisit':
      dispatch({ type: 'SEEN_COMPLETION' });
      dispatch({ type: 'SET_STATION', station: 'briefing' });
      break;

    case 'seal-keep':
      dispatch({ type: 'SEEN_COMPLETION' });
      break;

    case 'open-reset':
      openModal('reset');
      break;

    case 'open-tracker':
      openModal('tracker');
      break;

    case 'reset-lab':
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        /* ignore */
      }
      closeModal(true);
      dispatch({ type: 'RESET' });
      break;

    case 'close-modal':
      if (modal && modal.kind === 'seal') dispatch({ type: 'SEEN_COMPLETION' });
      else closeModal();
      break;

    case 'overlay-close':
      if (e.target === el) {
        if (modal && modal.kind === 'seal') dispatch({ type: 'SEEN_COMPLETION' });
        else closeModal();
      }
      break;

    case 'drawer-tab':
      uiState.drawerTab = el.getAttribute('data-tab');
      rerender();
      break;

    case 'acc-toggle': {
      const expanded = el.getAttribute('aria-expanded') === 'true';
      const acc = el.closest('.acc');
      // Radix single-collapsible behavior: opening one closes the others.
      if (acc) {
        Array.prototype.forEach.call(acc.querySelectorAll('.acc-trigger'), function (btn) {
          if (btn !== el) {
            btn.setAttribute('aria-expanded', 'false');
            document.getElementById(btn.getAttribute('aria-controls')).classList.remove('open');
          }
        });
      }
      el.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      document.getElementById(el.getAttribute('aria-controls')).classList.toggle('open', !expanded);
      break;
    }

    default:
      break;
  }
});

document.addEventListener('change', function (e) {
  const t = e.target;
  if (t.matches && t.matches('select[data-env]')) {
    patchEnvPath(t.getAttribute('data-env'), t.value);
  } else if (t.matches && t.matches('input[type="radio"][data-action="answer"]')) {
    dispatch({ type: 'ANSWER', qid: t.getAttribute('data-qid'), oid: t.getAttribute('data-oid') });
  } else if (t.matches && t.matches('input[type="checkbox"][data-env-list]')) {
    toggleEnvList(t.getAttribute('data-env-list'), t.getAttribute('data-id'), t.checked);
  }
});

document.addEventListener('input', function (e) {
  const t = e.target;
  if (t.matches && t.matches('input[data-env-input]')) {
    patchEnvPath(t.getAttribute('data-env-input'), t.value);
  }
});

/* ------------------------------ keyboard support ------------------------- */

document.addEventListener('keydown', function (e) {
  // Escape closes any open dialog (Radix parity)
  if (e.key === 'Escape' && modal) {
    if (modal.kind === 'seal') dispatch({ type: 'SEEN_COMPLETION' });
    else closeModal();
    return;
  }

  // Focus trap inside dialogs
  if (e.key === 'Tab' && modal) {
    const focusables = Array.prototype.filter.call(
      document.querySelectorAll('#modal-root button, #modal-root [href], #modal-root input, #modal-root select'),
      function (el) {
        return !el.disabled && el.offsetParent !== null;
      }
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    return;
  }

  // Evidence-drawer tabs: arrow-key navigation with automatic activation
  const tab = e.target && e.target.closest ? e.target.closest('.tab') : null;
  if (tab) {
    const tabs = Array.prototype.slice.call(tab.parentElement.querySelectorAll('.tab'));
    const i = tabs.indexOf(tab);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j !== null) {
      e.preventDefault();
      uiState.drawerTab = tabs[j].getAttribute('data-tab');
      rerender();
      const next = document.querySelector('[data-tab="' + uiState.drawerTab + '"]');
      if (next) next.focus();
    }
  }

  // Glossary accordion: ArrowUp/Down moves between triggers (Radix parity)
  const accBtn = e.target && e.target.closest ? e.target.closest('.acc-trigger') : null;
  if (accBtn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    const triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));
    const i = triggers.indexOf(accBtn);
    const j = e.key === 'ArrowDown' ? (i + 1) % triggers.length : (i - 1 + triggers.length) % triggers.length;
    triggers[j].focus();
  }
});

/* ------------------------------ boot ------------------------------------- */

function boot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);

  hydrate();
  subscribe(function () {
    syncSealModal();
    rerender();
  });
  syncSealModal();
  rerender();
}

boot();
