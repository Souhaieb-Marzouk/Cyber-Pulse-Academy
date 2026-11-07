// ============================================================================
// App bootstrap + event wiring. Port of the React component tree's behavior:
// stage routing, console layers (drawers/modals/overlays), event delegation,
// keyboard support (ESC to close, arrow keys on the tab list, focus trap),
// focus restoration after re-render, and the completion-modal auto-open.
// ============================================================================
'use strict';

(function () {
  const Store = window.LabStore;
  const UI = window.LabUIState;
  const U = window.LabUI;
  const D = window.LAB_DATA;
  const E = window.LAB_ENGINE;

  const appEl = document.getElementById('app');

  // ---------------------------------------------------------------------------
  // Rendering: #main holds the current stage; #layers holds transient overlays.
  // Stable layer nodes are re-used so open/close animations only play on
  // mount/unmount (matching the framer-motion AnimatePresence behavior).
  // ---------------------------------------------------------------------------
  function renderMain() {
    const st = Store.getState();
    const main = document.getElementById('main');
    const html =
      st.stage === 'mode' ? U.renderModeSelect()
        : st.stage === 'brief' ? U.renderBriefing(false)
          : st.stage === 'knowledge' ? U.renderKnowledge(false)
            : st.stage === 'console' ? U.renderConsole(st.mode)
              : '';
    if (main.innerHTML !== html) main.innerHTML = html;
  }

  function layerHtml(name) {
    switch (name) {
      case 'brief':
        return `<div class="overlay-shell" data-layer-shell="brief">${U.renderBriefing(true)}</div>`;
      case 'concepts':
        return `${U.renderKnowledge(true)}
          <button class="overlay-close" data-action="overlay-close" aria-label="Close concepts">✕</button>`;
      case 'obj':
        return `<div class="backdrop" data-action="close-obj" aria-hidden="true"></div>
          <aside class="drawer" role="dialog" aria-label="Objectives tracker">${U.renderObjDrawerInner(Store.getState().mode)}</aside>`;
      case 'gloss':
        return `<div class="backdrop" data-action="close-gloss" aria-hidden="true"></div>
          <aside class="drawer" role="dialog" aria-label="Glossary" style="max-width:24rem;">${U.renderGlossInner()}</aside>`;
      case 'quiz':
        return `<div class="modal-backdrop" data-action="close-quiz" aria-hidden="true"></div>
          <div class="modal-wrap"><div class="modal w-lg" role="dialog" aria-modal="true" aria-label="Knowledge check">${U.renderQuizInner(Store.getState().mode)}</div></div>`;
      case 'comp':
        return `<div class="modal-backdrop" data-action="close-comp" aria-hidden="true"></div>
          <div class="modal-wrap"><div class="modal w-md" role="dialog" aria-modal="true" aria-label="Completion report">${U.renderCompInner(Store.getState().mode)}</div></div>`;
      case 'reset':
        return `<div class="modal-backdrop" data-action="close-reset" aria-hidden="true"></div>
          <div class="modal-wrap"><div class="modal w-sm" role="dialog" aria-modal="true" aria-label="Reset the lab">${U.renderResetInner()}</div></div>`;
      default:
        return '';
    }
  }

  function desiredLayers() {
    const out = [];
    if (UI.overlay === 'brief') out.push('brief');
    if (UI.overlay === 'concepts') out.push('concepts');
    if (UI.objOpen) out.push('obj');
    if (UI.glossOpen) out.push('gloss');
    if (UI.quizOpen) out.push('quiz');
    if (UI.compOpen) out.push('comp');
    if (UI.resetOpen) out.push('reset');
    return out;
  }

  let animating = {}; // layer -> true while closing

  function syncLayers() {
    const root = document.getElementById('layers');
    const want = desiredLayers();
    // Remove layers that are no longer desired (animate out when possible).
    Array.from(root.children).forEach((child) => {
      const name = child.getAttribute('data-layer');
      if (want.includes(name)) return;
      if (animating[name]) return;
      animating[name] = true;
      const closables = child.querySelectorAll('.drawer, .modal, .overlay-shell');
      closables.forEach((el) => {
        el.classList.add(name === 'quiz' || name === 'comp' || name === 'reset' ? 'closing' : 'closing');
      });
      const bd = child.querySelector('.backdrop, .modal-backdrop');
      if (bd) bd.classList.add('closing');
      setTimeout(() => {
        child.remove();
        delete animating[name];
      }, 200);
    });
    // Add or refresh desired layers.
    want.forEach((name) => {
      if (animating[name]) { // re-opened during close: force re-create
        const stale = root.querySelector(`[data-layer="${name}"]`);
        if (stale) stale.remove();
        delete animating[name];
      }
      let layer = root.querySelector(`:scope > [data-layer="${name}"]`);
      if (!layer) {
        layer = document.createElement('div');
        layer.setAttribute('data-layer', name);
        root.appendChild(layer);
      }
      layer.innerHTML = layerHtml(name);
    });
  }

  function restoreFocus(prevFk) {
    if (!prevFk) return;
    const target = document.querySelector(`[data-fk="${CSS.escape(prevFk)}"]`);
    if (target) {
      try { target.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
    }
  }

  function render() {
    const active = document.activeElement;
    const prevFk = active && active.getAttribute ? active.getAttribute('data-fk') : null;
    renderMain();
    syncLayers();
    restoreFocus(prevFk);
    checkEligibility();
  }

  // Completion modal auto-opens once when all objectives + quiz are done (C7).
  function checkEligibility() {
    const st = Store.getState();
    if (!st.mode || UI.completionShown) return;
    const defs = E.objectivesFor(st.mode);
    const done = defs.filter((o) => st.objectiveState[o.id] && st.objectiveState[o.id].done).length;
    if (done === defs.length && st.quizSubmitted) {
      UI.completionShown = true;
      setTimeout(() => {
        UI.compOpen = true;
        render();
      }, 400);
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation ("Where to look") — mirrors console.tsx navigate(g).
  // ---------------------------------------------------------------------------
  function navigate(g) {
    UI.objOpen = false;
    if (g.tab) UI.tab = g.tab;
    if (g.concepts) UI.overlay = 'concepts';
    render();
    if (g.directory) {
      UI.dirOpen = true;
      render();
      setTimeout(() => {
        const el = document.getElementById('directory-zone');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
    if (g.sim) {
      setTimeout(() => {
        const el = document.querySelector('.dock-zone');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }

  // ---------------------------------------------------------------------------
  // Action handlers (event delegation)
  // ---------------------------------------------------------------------------
  function env() { return Store.getState().env; }

  const clickActions = {
    'mode': (el) => Store.actions.setMode(el.dataset.mode),
    'stage': (el) => {
      // Inside the console stage this button belongs to a full-screen overlay.
      if (Store.getState().stage === 'console') { UI.overlay = 'none'; render(); }
      else Store.actions.setStage(el.dataset.stage);
    },
    'overlay-open': (el) => { UI.overlay = el.dataset.overlay; render(); },
    'overlay-close': () => { UI.overlay = 'none'; render(); },
    'tab': (el) => { UI.tab = el.dataset.tab; render(); },
    'dir-toggle': () => { UI.dirOpen = !UI.dirOpen; render(); },
    'dir-expand': (el) => { UI.openIdentity = UI.openIdentity === el.dataset.id ? null : el.dataset.id; render(); },
    'identity-status': (el) => {
      const id = el.dataset.id;
      const cur = env().identities;
      Store.actions.patchEnv({ identities: Object.assign({}, cur, { [id]: cur[id] === 'active' ? 'disabled' : 'active' }) });
    },
    'aaa-pick': (el) => {
      const cur = Store.getState().env.aaaOrder; // fresh read: rapid picks never drop one (QA-19)
      if (!cur.includes(el.dataset.id)) Store.actions.patchEnv({ aaaOrder: [...cur, el.dataset.id] });
    },
    'aaa-reset': () => Store.actions.patchEnv({ aaaOrder: [] }),
    'saml-pick': (el) => {
      const cur = Store.getState().env.samlOrder;
      Store.actions.patchEnv({ samlOrder: [...cur, D.SAML_STEPS[parseInt(el.dataset.i, 10)]] });
    },
    'saml-reset': () => Store.actions.patchEnv({ samlOrder: [] }),
    'chain-pick': (el) => {
      const cur = Store.getState().env.h2Order;
      Store.actions.patchEnv({ h2Order: [...cur, el.dataset.id] });
    },
    'chain-reset': () => Store.actions.patchEnv({ h2Order: [] }),
    'attach': (el) => {
      const pid = el.dataset.pid;
      const principal = UI.attachPick[pid];
      if (!principal) return;
      const cur = env().attachments;
      Store.actions.patchEnv({
        attachments: Object.assign({}, cur, { [pid]: [...(cur[pid] || []), principal] }),
        actionLog: [...env().actionLog, `attach:${pid}:${principal}`],
      });
      UI.attachPick[pid] = '';
    },
    'detach': (el) => {
      const pid = el.dataset.pid;
      const principal = el.dataset.principal;
      const cur = env().attachments;
      Store.actions.patchEnv({
        attachments: Object.assign({}, cur, { [pid]: (cur[pid] || []).filter((x) => x !== principal) }),
        actionLog: [...env().actionLog, `detach:${pid}:${principal}`],
      });
    },
    'ca-toggle': (el) => {
      const key = el.dataset.key;
      const cur = Store.getState().env.ca; // fresh read (QA-19)
      Store.actions.patchEnv({ ca: Object.assign({}, cur, { [key]: el.checked }) });
    },
    'gk-mfa': (el) => { UI.gk.mfa = el.checked; },
    'sim-mfa': (el) => { UI.sim.mfa = el.checked; },
    'run-login-test': () => {
      const gk = UI.gk;
      const verdict = E.loginVerdict(env(), gk.user, gk.ip, gk.mfa, gk.protocol);
      const at = new Date().toLocaleTimeString('en-GB', { hour12: false });
      Store.actions.patchEnv({ loginRuns: [{ user: gk.user, ip: gk.ip, mfa: gk.mfa, protocol: gk.protocol, verdict, at }, ...env().loginRuns].slice(0, 12) });
    },
    'sim-evaluate': () => {
      const sim = UI.sim;
      const r = E.evaluatePolicies(env(), sim.principal, sim.action, sim.resource, sim.ip, sim.mfa);
      sim.result = r;
      const at = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const newLog = [`sim:${sim.principal}:${sim.action}:${sim.resource}`,
      ...(r.verdict === 'deny-implicit' && sim.principal === 'svc-reporting' && sim.action === 'store:object:Put' && sim.resource === 'payroll-export/summary.csv'
        ? [`verify:svc-reporting:store:object:Put:payroll-export`] : [])];
      Store.actions.patchEnv({
        simRuns: [{ principal: sim.principal, action: sim.action, resource: sim.resource, ip: sim.ip, mfa: sim.mfa, verdict: r.verdict, at }, ...env().simRuns].slice(0, 30),
        actionLog: [...env().actionLog, ...newLog],
      });
    },
    'key-act': (el) => {
      const kid = el.dataset.kid;
      const kind = el.dataset.kind;
      const cur = env().keys;
      const status = cur[kid];
      if (kind === 'revoke') {
        if (status === 'revoked') return;
        Store.actions.patchEnv({ keys: Object.assign({}, cur, { [kid]: 'revoked' }), actionLog: [...env().actionLog, `revoke:${kid}`] });
      } else {
        if (status === 'rotated') return;
        const replacement = kid.replace(/-1$/, '-2');
        const nextKeys = Object.assign({}, cur, { [kid]: status === 'revoked' ? 'revoked' : 'rotated' });
        if (replacement !== kid) nextKeys[replacement] = 'active';
        Store.actions.patchEnv({ keys: nextKeys, actionLog: [...env().actionLog, `rotate:${kid}`] });
      }
    },
    'flag': (el) => {
      const id = el.dataset.id;
      const cur = Store.getState().env.flagged; // fresh read (QA-19)
      const has = cur.includes(id);
      Store.actions.patchEnv({ flagged: has ? cur.filter((f) => f !== id) : [...cur, id] });
    },
    'audit-filter': () => { UI.onlyFlagged = !UI.onlyFlagged; render(); },
    'check': (el) => Store.actions.checkObjective(el.dataset.id),
    'hint': (el) => Store.actions.revealHint(el.dataset.id),
    'goto': (el) => { try { navigate(JSON.parse(el.dataset.goto)); } catch (e) { /* malformed */ } },
    'open-obj': () => { UI.objOpen = true; render(); },
    'close-obj': () => { UI.objOpen = false; render(); },
    'open-gloss': () => { UI.glossOpen = true; render(); },
    'close-gloss': () => { UI.glossOpen = false; render(); },
    'open-quiz': () => { UI.quizOpen = true; render(); },
    'close-quiz': () => { UI.quizOpen = false; render(); },
    'open-comp': () => { UI.compOpen = true; render(); },
    'close-comp': () => { UI.compOpen = false; render(); },
    'open-reset': () => { UI.resetOpen = true; render(); },
    'close-reset': () => { UI.resetOpen = false; render(); },
    'confirm-reset': () => {
      Store.actions.resetAll();
      // Transient UI state returns to pristine, like unmounted React state.
      Object.assign(UI, {
        tab: 'policies', objOpen: false, glossOpen: false, quizOpen: false,
        compOpen: false, resetOpen: false, overlay: 'none', dirOpen: false,
        attachPick: {}, sim: { principal: 'role-devops', action: 'store:object:Get', resource: 'payroll-export/summary.csv', ip: D.SIM_IPS[0], mfa: true, result: null },
        gk: { user: 'alex.kim', ip: '10.0.4.12 (corporate HQ)', mfa: false, protocol: 'modern' },
        onlyFlagged: false, openIdentity: null, glossQuery: '', completionShown: false,
      });
      render();
    },
    'submit-quiz': () => Store.actions.submitQuiz(),
    'term': (el) => openTermPop(el),
  };

  document.addEventListener('click', (ev) => {
    // Close term popovers on any outside click.
    if (!ev.target.closest('.term-pop') && !ev.target.closest('.term-btn')) closeTermPops();
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = clickActions[el.dataset.action];
    if (fn) {
      ev.preventDefault();
      fn(el, ev);
    }
  });

  // ---------------------------------------------------------------------------
  // change events: selects + radios
  // ---------------------------------------------------------------------------
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.matches('input[type="checkbox"][data-action]')) {
      const fn = clickActions[t.dataset.action];
      if (fn) fn(t, ev);
      return;
    }
    if (t.matches('select[data-select]')) {
      const kind = t.dataset.select;
      const key = t.dataset.key;
      const v = t.value;
      switch (kind) {
        case 'factor': Store.actions.patchEnv({ factorAssign: Object.assign({}, env().factorAssign, { [key]: v }) }); break;
        case 'authz': Store.actions.patchEnv({ authzMatch: Object.assign({}, env().authzMatch, { [key]: v }) }); break;
        case 'protocol': Store.actions.patchEnv({ protocolMatch: Object.assign({}, env().protocolMatch, { [key]: v }) }); break;
        case 'rc': Store.actions.patchEnv({ review: Object.assign({}, env().review, { ['rc:' + key]: v }) }); break;
        case 'rv': Store.actions.patchEnv({ review: Object.assign({}, env().review, { ['rv:' + key]: v }) }); break;
        case 'h1Identity': Store.actions.patchEnv({ h1Identity: v }); break;
        case 'h1Event': Store.actions.patchEnv({ h1Event: v }); break;
        case 'h1Vector': Store.actions.patchEnv({ h1Vector: v }); break;
        case 'h2Mitre-theft': Store.actions.patchEnv({ h2Mitre: Object.assign({}, env().h2Mitre, { theft: v }) }); break;
        case 'h2Mitre-use': Store.actions.patchEnv({ h2Mitre: Object.assign({}, env().h2Mitre, { use: v }) }); break;
        case 'h2Mitre-escalation': Store.actions.patchEnv({ h2Mitre: Object.assign({}, env().h2Mitre, { escalation: v }) }); break;
        case 'attach-pick': UI.attachPick[key] = v; render(); break;
        case 'gk-user': UI.gk.user = v; break;
        case 'gk-ip': UI.gk.ip = v; break;
        case 'gk-protocol': UI.gk.protocol = v; break;
        case 'sim-principal': UI.sim.principal = v; break;
        case 'sim-action': UI.sim.action = v; break;
        case 'sim-resource': UI.sim.resource = v; break;
        case 'sim-ip': UI.sim.ip = v; break;
        default: break;
      }
      return;
    }
    if (t.matches('input[type="radio"][data-radio]')) {
      const group = t.dataset.radio;
      const v = t.value;
      switch (group) {
        case 'aaaRecordQ': Store.actions.patchEnv({ aaaRecordQ: v }); break;
        case 'h5Justify': Store.actions.patchEnv({ h5Justify: v }); break;
        case 'h9': Store.actions.patchEnv({ h9: v }); break;
        case 'quiz': Store.actions.setQuizAnswer(t.dataset.quizId, parseInt(v, 10)); break;
        default:
          if (group.startsWith('h4-')) Store.actions.patchEnv({ h4: Object.assign({}, env().h4, { [group.slice(3)]: v }) });
          else if (group.startsWith('h8-')) Store.actions.patchEnv({ h8: Object.assign({}, env().h8, { [group.slice(3)]: v }) });
          break;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // input events: policy JSON editors (silent save) + glossary search
  // ---------------------------------------------------------------------------
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.matches('textarea[data-policy-editor]')) {
      const pid = t.dataset.policyEditor;
      // Persist each keystroke WITHOUT re-rendering (caret must survive).
      Store.actions.patchEnvSilent({ policies: Object.assign({}, env().policies, { [pid]: t.value }) });
      const badge = document.querySelector(`[data-pjson-badge="${pid}"]`);
      if (badge) {
        const ok = E.parsePolicy(t.value).statements ? true : false;
        badge.textContent = ok ? 'valid JSON' : 'invalid JSON';
        badge.classList.toggle('status-active', ok);
        badge.classList.toggle('status-revoked', !ok);
      }
      return;
    }
    if (t.matches('[data-gloss-search]')) {
      UI.glossQuery = t.value;
      const listRoot = document.getElementById('gloss-list');
      if (listRoot) {
        const q = UI.glossQuery.toLowerCase();
        const list = D.GLOSSARY.filter((g) => (g.term + ' ' + g.def).toLowerCase().includes(q));
        listRoot.innerHTML = list.map((g) => `<div class="gloss-item"><p class="term">${U.esc(g.term)}</p><p class="def">${U.esc(g.def)}</p></div>`).join('')
          + (list.length === 0 ? '<p class="gloss-empty">No matching terms.</p>' : '');
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Keyboard: ESC closes topmost layer; arrow keys move the workbench tabs;
  // Tab is trapped inside the topmost modal/drawer (a11y parity with Radix).
  // ---------------------------------------------------------------------------
  const ESC_ORDER = ['reset', 'comp', 'quiz', 'gloss', 'obj'];
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (closeTermPops()) return;
      for (const name of ESC_ORDER) {
        if (UI[name + 'Open'] === true) {
          UI[name + 'Open'] = false;
          render();
          return;
        }
      }
      if (UI.overlay !== 'none') { UI.overlay = 'none'; render(); }
      return;
    }
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      const trigger = ev.target.closest && ev.target.closest('.tab-trigger');
      if (trigger) {
        const triggers = Array.from(document.querySelectorAll('.tab-trigger'));
        const i = triggers.indexOf(trigger);
        const dir = ev.key === 'ArrowRight' ? 1 : -1;
        const next = triggers[(i + dir + triggers.length) % triggers.length];
        next.focus();
        next.click();
        ev.preventDefault();
      }
      return;
    }
    if (ev.key === 'Tab') {
      const topLayer = topmostOpenLayer();
      if (!topLayer) return;
      const focusables = topLayer.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!topLayer.contains(document.activeElement)) { first.focus(); ev.preventDefault(); }
      else if (ev.shiftKey && document.activeElement === first) { last.focus(); ev.preventDefault(); }
      else if (!ev.shiftKey && document.activeElement === last) { first.focus(); ev.preventDefault(); }
    }
  });

  function topmostOpenLayer() {
    const order = ['reset', 'comp', 'quiz', 'gloss', 'obj', 'concepts', 'brief'];
    for (const name of order) {
      const open = name === 'concepts' || name === 'brief' ? UI.overlay === name : UI[name + 'Open'];
      if (open) {
        const layer = document.querySelector(`#layers > [data-layer="${name}"]`);
        if (layer) return layer;
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Term popovers (ui-bits Term → anchored popover; ESC / outside click close)
  // ---------------------------------------------------------------------------
  function openTermPop(trigger) {
    const t = trigger.dataset.term;
    const entry = D.GLOSSARY.find((g) => g.term === t);
    if (!entry) return;
    closeTermPops();
    const pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.setAttribute('role', 'dialog');
    pop.innerHTML = `<p class="t">${U.esc(entry.term)}</p><p class="d">${U.esc(entry.def)}</p>`;
    document.body.appendChild(pop);
    const r = trigger.getBoundingClientRect();
    const pw = Math.min(320, window.innerWidth - 24);
    let left = Math.min(Math.max(12, r.left), window.innerWidth - pw - 12);
    pop.style.width = pw + 'px';
    const ph = pop.offsetHeight;
    let top = r.bottom + 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.dataset.termPop = '1';
  }

  function closeTermPops() {
    const pops = document.querySelectorAll('.term-pop');
    pops.forEach((p) => p.remove());
    return pops.length > 0;
  }

  // ---------------------------------------------------------------------------
  // Boot: hydrate from localStorage, then render. The boot screen in
  // index.html mirrors the original's hydration gate.
  // ---------------------------------------------------------------------------
  function boot() {
    appEl.setAttribute('aria-busy', 'false');
    appEl.innerHTML = '<div id="main"></div><div id="layers"></div>';
    Store.hydrate();
    Store.subscribe(() => render());
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(boot));
  } else {
    requestAnimationFrame(boot);
  }
})();
