// ============================================================================
// Meridian Atelier — Bootstrap + event wiring + CHECK RESULTS validation
// All objective validation rules live here, mirroring the original React lab.
// ============================================================================

(function (global) {
  'use strict';

  const Data = global.AtelierData;
  const State = global.AtelierState;
  const { OBJECTIVES } = global.AtelierObjectives;
  const W = global.AtelierWorkstations;

  const obj = (id) => OBJECTIVES.find((o) => o.id === id);

  // --------------------------------------------------------------------------
  // Validation rules (CHECK RESULTS engine)
  // --------------------------------------------------------------------------
  const validators = {
    // =============== MEDIUM ===============
    'OBJ-M1': () => {
      const sel = State.getState().objectives['OBJ-M1']?.payload?.selected || {};
      return Data.BUSINESS_UNITS.every((bu) => {
        const expected = new Set(bu.applicableRegulations);
        const got = new Set(sel[bu.id] || []);
        if (expected.size !== got.size) return false;
        for (const r of expected) if (!got.has(r)) return false;
        return true;
      });
    },
    'OBJ-M2': () => {
      const ans = State.getState().objectives['OBJ-M2']?.payload?.answers || {};
      return Data.TERM_PAIRS.every((p) => ans[p.term] === p.def);
    },
    'OBJ-M3': () => {
      const tiers = State.getState().objectives['OBJ-M3']?.payload?.tiers || {};
      return Data.PENALTY_SCENARIOS.every((s) => tiers[s.id] === s.correctTier);
    },
    'OBJ-M4': () => {
      const classes = State.getState().objectives['OBJ-M4']?.payload?.classes || {};
      return Data.DATA_SAMPLES.every((s) => classes[s.id] === s.correctClass);
    },
    'OBJ-M5': () => {
      const kinds = State.getState().objectives['OBJ-M5']?.payload?.kinds || {};
      return Data.DATA_SAMPLES.every((s) => kinds[s.id] === s.correctKind);
    },
    'OBJ-M6': () => {
      const p = State.getState().objectives['OBJ-M6']?.payload || {};
      if (p.primary !== 'f-nist') return false;
      const correct = new Set(['j-fed', 'j-free', 'j-intl', 'j-cis']);
      const chosen = new Set(p.justifications || []);
      if (correct.size !== chosen.size) return false;
      for (const id of correct) if (!chosen.has(id)) return false;
      return true;
    },
    'OBJ-M7': () => {
      const v = State.getState().objectives['OBJ-M7']?.payload?.verdicts || {};
      // real-evidence → valid; gap → invalid; red-herring → invalid
      return Data.AUDIT_EVIDENCE.every((it) => v[it.id] === (it.kind === 'real-evidence' ? 'valid' : 'invalid'));
    },
    'OBJ-M8': () => {
      const picks = State.getState().objectives['OBJ-M8']?.payload?.picks || {};
      return Data.PERSONNEL_TICKETS.filter((t) => t.missingStep !== null)
        .every((t) => picks[t.id] === t.missingStep);
    },
    'OBJ-M9': () => {
      const orders = State.getState().objectives['OBJ-M9']?.payload?.orders || {};
      const r = Data.DSR_REQUESTS[0]; // medium uses only the first
      const got = orders[r.id] || [];
      if (got.length !== r.expectedAnswer.length) return false;
      for (let i = 0; i < got.length; i++) if (got[i] !== r.expectedAnswer[i]) return false;
      for (const h of r.redHerrings) if (got.includes(h)) return false;
      return true;
    },
    'OBJ-M10': () => {
      const p = State.getState().objectives['OBJ-M10']?.payload || {};
      const ret = p.retention || {}, des = p.destruction || {};
      return Data.RETENTION_RULES.every((r) => ret[r.id] === r.correctRetention && des[r.id] === r.correctDestruction);
    },
    'OBJ-M11': () => {
      const treatments = State.getState().objectives['OBJ-M11']?.payload?.treatments || {};
      return Data.VENDORS.every((v) => treatments[v.id] === v.recommendation);
    },
    'OBJ-M12': () => {
      const records = State.getState().objectives['OBJ-M12']?.payload?.records || {};
      return Data.INVENTORY_RECORDS.every((r) => {
        const got = records[r.id];
        if (!got) return false;
        if ((got.controller || '').trim().toLowerCase() !== r.correctController.toLowerCase()) return false;
        if (got.processor !== r.correctProcessor) return false;
        const expShare = new Set(r.correctSharing);
        const gotShare = new Set(got.sharing || []);
        if (expShare.size !== gotShare.size) return false;
        for (const s of expShare) if (!gotShare.has(s)) return false;
        if (got.class !== r.correctClass) return false;
        return true;
      });
    },

    // =============== HARD ===============
    'OBJ-H1': () => {
      const ans = State.getState().objectives['OBJ-H1']?.payload?.answers || {};
      const normalize = (s) => s.split(/[,\s]+/).map((x) => x.trim().toUpperCase().replace(/\.$/, '')).filter(Boolean).map((x) => x === 'PCI' ? 'PCI DSS' : x);
      return Data.BUSINESS_UNITS.every((bu) => {
        const exp = bu.applicableRegulations.map((id) => (Data.REGULATIONS.find((r) => r.id === id)?.code || '').toUpperCase()).slice().sort();
        const got = normalize(ans[bu.id] || '').slice().sort();
        if (exp.length !== got.length) return false;
        return exp.every((c, i) => c === got[i]);
      });
    },
    'OBJ-H2': () => {
      const p = State.getState().objectives['OBJ-H2']?.payload || {};
      if (p.primary !== 'f-nist') return false;
      if (p.overlay !== 'f-iso') return false;
      const r = (p.rationale || '').trim().toLowerCase();
      if (r.length < 30) return false;
      const fed = r.includes('federal') || r.includes('fisma') || r.includes('fedramp');
      const intl = r.includes('international') || r.includes('iso') || r.includes('customer trust') || r.includes('credibility');
      return fed && intl;
    },
    'OBJ-H3': () => {
      const orders = State.getState().objectives['OBJ-H3']?.payload?.orders || {};
      return Data.DSR_REQUESTS.every((r) => {
        const got = orders[r.id] || [];
        if (got.length !== r.expectedAnswer.length) return false;
        for (let i = 0; i < got.length; i++) if (got[i] !== r.expectedAnswer[i]) return false;
        for (const h of r.redHerrings) if (got.includes(h)) return false;
        return true;
      });
    },
    'OBJ-H4': () => {
      const p = State.getState().objectives['OBJ-H4']?.payload || {};
      const picks = p.picks || {}, fixes = p.fixes || {};
      return Data.PERSONNEL_TICKETS.filter((t) => t.missingStep !== null).every((t) => {
        if (picks[t.id] !== t.missingStep) return false;
        const got = (fixes[t.id] || '').trim().toLowerCase();
        if (t.id === 'pt-1') {
          const hasBlock = got.includes('block') && got.includes('nda');
          const hasGate = got.includes('checklist') || got.includes('gate') || got.includes('sop');
          return hasBlock && hasGate;
        }
        if (t.id === 'pt-2') {
          const hasRot = got.includes('token') || got.includes('ssh') || got.includes('service-account') || got.includes('credential');
          const hasSop = got.includes('sop') || got.includes('offboarding') || got.includes('rotation');
          return hasRot && hasSop;
        }
        return false;
      });
    },
    'OBJ-H5': () => {
      const records = State.getState().objectives['OBJ-H5']?.payload?.records || {};
      return Data.INVENTORY_RECORDS.every((r) => {
        const got = records[r.id];
        if (!got) return false;
        if ((got.controller || '').trim().toLowerCase() !== r.correctController.toLowerCase()) return false;
        if (got.processor !== r.correctProcessor) return false;
        const expShare = new Set(r.correctSharing);
        const gotShare = new Set(got.sharing || []);
        if (expShare.size !== gotShare.size) return false;
        for (const s of expShare) if (!gotShare.has(s)) return false;
        if (got.class !== r.correctClass) return false;
        return true;
      });
    },
    'OBJ-H6': () => {
      const p = State.getState().objectives['OBJ-H6']?.payload || {};
      const ret = p.retention || {}, des = p.destruction || {};
      const retOk = Data.RETENTION_RULES.every((r) => ret[r.id] === r.correctRetention);
      const destOk = Data.RETENTION_RULES.every((r) => des[r.id] === r.correctDestruction);
      if (!retOk || !destOk) return false;
      const h = (p.holdAnswer || '').trim().toLowerCase();
      return h.includes('legal hold') && (h.includes('overrid') || h.includes('suspend') || h.includes('stop') || h.includes('prevent'));
    },
    'OBJ-H7': () => {
      const p = State.getState().objectives['OBJ-H7']?.payload || {};
      const treatments = p.treatments || {}, remediation = p.remediation || {};
      return Data.VENDORS.every((v) => {
        if (treatments[v.id] !== v.recommendation) return false;
        const expected = Data.REMEDIATION[v.id].filter((r) => r.correct).map((r) => r.id).sort();
        const got = (remediation[v.id] || []).slice().sort();
        if (expected.length !== got.length) return false;
        for (let i = 0; i < expected.length; i++) if (expected[i] !== got[i]) return false;
        return true;
      });
    },
    'OBJ-H8': () => {
      const p = State.getState().objectives['OBJ-H8']?.payload || {};
      const classes = p.classes || {}, actions = p.actions || {};
      return Data.AUDIT_EVIDENCE.every((it) => {
        if (it.id === 'ae-2') {
          // dual-nature: accept 'gap' OR 'red-herring' as classification, but require an action
          const c = classes[it.id];
          if (c !== 'gap' && c !== 'red-herring') return false;
          const act = (actions[it.id] || '').trim().toLowerCase();
          const ok = act.includes('renew') || act.includes('remediat') || act.includes('replace') || act.includes('re-certif') || act.includes('aoc');
          return ok && act.length > 15;
        }
        if (classes[it.id] !== it.kind) return false;
        if (it.kind === 'gap') {
          const act = (actions[it.id] || '').trim().toLowerCase();
          if (act.length < 15) return false;
          const ok = act.includes('remediat') || act.includes('fix') || act.includes('correct') || act.includes('execute') || act.includes('sign') || act.includes('rotate') || act.includes('update') || act.includes('add');
          return ok;
        }
        return true;
      });
    },
    'OBJ-H9': () => {
      const p = State.getState().objectives['OBJ-H9']?.payload || {};
      const tiers = p.tiers || {}, nonfin = p.nonfin || {};
      return Data.PENALTY_SCENARIOS.every((s) => {
        if (tiers[s.id] !== s.correctTier) return false;
        const expected = Data.H9_EXPECTED_NONFIN[s.id] || '';
        const got = (nonfin[s.id] || '').trim().toLowerCase();
        if (expected === 'none') return got === 'none' || got === '' || got === 'no non-financial consequence' || got === 'n/a';
        return got.includes(expected);
      });
    },
  };

  // --------------------------------------------------------------------------
  // Render pipeline
  // --------------------------------------------------------------------------
  function render() {
    const root = document.getElementById('app-root');
    const state = State.getState();
    if (!state.mode) {
      const hasProgress = Object.keys(state.objectives).length > 0 || Object.keys(state.quiz.answered).length > 0;
      root.innerHTML = `<main class="min-h-screen">${W.hero(hasProgress)}</main>`;
    } else {
      root.innerHTML = `
        <main class="min-h-screen atelier-paper pb-16">
          ${studioHeader(state.mode)}
          <div class="studio-container">
            <div class="studio-grid">
              <div class="studio-main" id="studio-main">${W.studioLayout(state.mode)}</div>
              <div class="studio-rail-wrap">${W.objectivesRail()}</div>
            </div>
          </div>
        </main>`;
    }
    // completion modal (if open)
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = window.__atelierCompletionOpen ? W.completionModal(true) : '';

    // reset confirmation dialog (if open)
    const dialogRoot = document.getElementById('dialog-root');
    dialogRoot.innerHTML = window.__atelierResetOpen ? resetDialogHtml() : '';
  }

  function studioHeader(mode) {
    return `
      <div class="studio-header">
        <div class="studio-header-inner">
          <div class="atelier-serif studio-header-title">${'<span aria-hidden="true">✦</span> Meridian Atelier'}</div>
          <div class="studio-header-sub atelier-stamp">Security+ SY0-801 · Lesson 5.4 · ${mode === 'medium' ? 'Apprentice' : 'Architect'} mode</div>
          <div class="studio-header-controls">
            <button type="button" class="btn btn-outline-dark atelier-focus lg-hide" data-action="open-rail" aria-label="Open objectives tracker">${global.AtelierUI.ICONS.menu(16)}</button>
            <button type="button" class="btn btn-outline-dark atelier-focus" data-action="switch-mode" aria-label="Switch mode">Switch mode</button>
          </div>
        </div>
      </div>`;
  }

  function resetDialogHtml() {
    return `
      <div class="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" data-action="reset-close-backdrop">
        <div class="modal-card reset-card">
          <h2 class="atelier-serif forest" id="reset-title">Reset all Atelier progress?</h2>
          <p class="small mt-2">This will clear every objective completion, hint usage, and quiz answer from your browser's localStorage. The lab will return to its pristine initial state. This cannot be undone.</p>
          <div class="modal-controls">
            <button type="button" class="btn btn-outline atelier-focus" data-action="reset-cancel">Cancel</button>
            <button type="button" class="btn btn-primary atelier-focus" data-action="reset-confirm-yes">Yes, reset everything</button>
          </div>
        </div>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // Event delegation — single click handler on document
  // --------------------------------------------------------------------------
  function onAction(action, el, e) {
    const objId = el.getAttribute('data-obj');

    switch (action) {
      case 'pick-mode': {
        State.setMode(el.getAttribute('data-mode'));
        render();
        break;
      }
      case 'switch-mode': {
        State.clearMode();
        render();
        break;
      }
      case 'open-rail': {
        openMobileRail();
        break;
      }

      case 'check': {
        if (!objId) return;
        const o = obj(objId);
        const ok = validators[objId] ? validators[objId]() : false;
        // capture current payload snapshot for persistence on the objective
        const payload = capturePayload(objId);
        State.setObjectiveStatus(objId, ok ? 'correct' : 'incorrect', payload);
        render();
        break;
      }
      case 'use-hint': {
        if (!objId) return;
        State.useHint(objId);
        render();
        break;
      }

      // M1: toggle regulation on business unit
      case 'm1-toggle': {
        const bu = el.getAttribute('data-bu');
        const reg = el.getAttribute('data-reg');
        m1Toggle(bu, reg);
        break;
      }
      // M2: set term definition
      case 'm2-set': {
        // dispatched on change instead; no-op here
        break;
      }

      // H1: set regulation codes text
      // (handled by 'input' event, not click)

      // M4 / M5 / M6 / M7 / etc.: handled by change event

      // DSR step add/remove/move
      case 'dsr-add': {
        const req = el.getAttribute('data-req');
        const step = el.getAttribute('data-step');
        const o = obj('OBJ-M9'); // or H3
        const oid = State.getState().mode === 'medium' ? 'OBJ-M9' : 'OBJ-H3';
        dsrAdd(oid, req, step);
        break;
      }
      case 'dsr-remove': {
        const req = el.getAttribute('data-req');
        const step = el.getAttribute('data-step');
        const oid = State.getState().mode === 'medium' ? 'OBJ-M9' : 'OBJ-H3';
        dsrRemove(oid, req, step);
        break;
      }
      case 'dsr-move': {
        const req = el.getAttribute('data-req');
        const step = el.getAttribute('data-step');
        const dir = parseInt(el.getAttribute('data-dir'), 10);
        const oid = State.getState().mode === 'medium' ? 'OBJ-M9' : 'OBJ-H3';
        dsrMove(oid, req, step, dir);
        break;
      }

      // Vendor toggle remediation
      case 'vendor-toggle-rem': {
        const vid = el.getAttribute('data-vid');
        const rid = el.getAttribute('data-rid');
        vendorToggleRem(vid, rid);
        break;
      }
      // Inventory toggle share
      case 'inv-toggle-share': {
        const rec = el.getAttribute('data-rec');
        const vid = el.getAttribute('data-vid');
        invToggleShare(rec, vid);
        break;
      }
      // M7 verdict
      case 'm7-set': {
        const id = el.getAttribute('data-id');
        const verdict = el.getAttribute('data-verdict');
        m7Set(id, verdict);
        break;
      }
      // H8 set class
      case 'h8-set-class': {
        const id = el.getAttribute('data-id');
        const cls = el.getAttribute('data-class');
        h8SetClass(id, cls);
        break;
      }

      // Quiz answer (R3 strict: lock immediately, no green reveal on wrong)
      case 'quiz-answer': {
        const qid = el.getAttribute('data-qid');
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        const q = Data.QUIZ.find((x) => x.id === qid);
        if (!q) return;
        // lock check: if already answered, ignore
        if (State.getState().quiz.answered[qid] !== undefined) return;
        State.answerQuiz(qid, idx, idx === q.correctIndex);
        render();
        break;
      }

      // Modal controls
      case 'open-completion': {
        window.__atelierCompletionOpen = true;
        render();
        break;
      }
      case 'modal-close': {
        window.__atelierCompletionOpen = false;
        render();
        break;
      }
      case 'modal-close-backdrop': {
        // only close if the click was on the backdrop itself (not inside the card)
        if (e.target === el) {
          window.__atelierCompletionOpen = false;
          render();
        }
        break;
      }
      case 'modal-reset': {
        window.__atelierCompletionOpen = false;
        State.reset();
        render();
        break;
      }

      // Reset dialog
      case 'reset-confirm': {
        window.__atelierResetOpen = true;
        render();
        break;
      }
      case 'reset-cancel': {
        window.__atelierResetOpen = false;
        render();
        break;
      }
      case 'reset-close-backdrop': {
        if (e.target === el) {
          window.__atelierResetOpen = false;
          render();
        }
        break;
      }
      case 'reset-confirm-yes': {
        window.__atelierResetOpen = false;
        window.__atelierCompletionOpen = false;
        State.reset();
        render();
        break;
      }
    }
  }

  // Capture the current payload for an objective from the live DOM (since the
  // state we render from is the saved payload, but the user may have edited
  // inputs since the last save). For simplicity we re-read inputs by data-action.
  function capturePayload(objId) {
    const o = obj(objId);
    if (!o) return undefined;
    const mode = State.getState().mode;
    // Read from the state we already have (it was updated by input handlers below)
    const existing = State.getState().objectives[objId]?.payload || {};
    return existing;
  }

  // --------------------------------------------------------------------------
  // Per-objective payload mutators (called from input/change events)
  // --------------------------------------------------------------------------
  function m1Toggle(buId, regId) {
    const oid = 'OBJ-M1';
    const p = State.getState().objectives[oid]?.payload || {};
    const selected = Object.assign({}, p.selected || {});
    const arr = selected[buId] || [];
    selected[buId] = arr.includes(regId) ? arr.filter((r) => r !== regId) : arr.concat([regId]);
    State.setObjectivePayload(oid, { selected });
    render();
  }

  function m2Set(term, def) {
    const oid = 'OBJ-M2';
    const p = State.getState().objectives[oid]?.payload || {};
    const answers = Object.assign({}, p.answers || {}, { [term]: def });
    State.setObjectivePayload(oid, { answers });
    // no re-render needed (select keeps its own value); but save state silently
  }

  function h1Set(buId, val) {
    const oid = 'OBJ-H1';
    const p = State.getState().objectives[oid]?.payload || {};
    const answers = Object.assign({}, p.answers || {}, { [buId]: val });
    State.setObjectivePayload(oid, { answers });
    // we DO re-render here to update the "X codes entered · Y recognized" feedback
    render();
  }

  function m4Set(id, cls) {
    const oid = 'OBJ-M4';
    const p = State.getState().objectives[oid]?.payload || {};
    const classes = Object.assign({}, p.classes || {}, { [id]: cls });
    State.setObjectivePayload(oid, { classes });
  }
  function m5Set(id, k) {
    const oid = 'OBJ-M5';
    const p = State.getState().objectives[oid]?.payload || {};
    const kinds = Object.assign({}, p.kinds || {}, { [id]: k });
    State.setObjectivePayload(oid, { kinds });
  }

  function m6SetPrimary(fid) {
    const oid = 'OBJ-M6';
    const p = State.getState().objectives[oid]?.payload || {};
    State.setObjectivePayload(oid, Object.assign({}, p, { primary: fid }));
  }
  function m6ToggleJust(id) {
    const oid = 'OBJ-M6';
    const p = State.getState().objectives[oid]?.payload || {};
    const justs = (p.justifications || []).slice();
    const idx = justs.indexOf(id);
    if (idx >= 0) justs.splice(idx, 1); else justs.push(id);
    State.setObjectivePayload(oid, Object.assign({}, p, { justifications: justs }));
    render();
  }

  function h2Set(field, val) {
    const oid = 'OBJ-H2';
    const p = State.getState().objectives[oid]?.payload || {};
    State.setObjectivePayload(oid, Object.assign({}, p, { [field]: val }));
    if (field === 'rationale') {
      // update char count
      const el = document.getElementById('h2-rationale');
      if (el) {
        const count = el.parentElement.querySelector('.muted.small.mt-1');
        if (count) count.textContent = `${val.trim().length} chars`;
      }
    }
  }

  function m7Set(id, verdict) {
    const oid = 'OBJ-M7';
    const p = State.getState().objectives[oid]?.payload || {};
    const verdicts = Object.assign({}, p.verdicts || {}, { [id]: verdict });
    State.setObjectivePayload(oid, { verdicts });
    render();
  }

  function h8SetClass(id, cls) {
    const oid = 'OBJ-H8';
    const p = State.getState().objectives[oid]?.payload || {};
    const classes = Object.assign({}, p.classes || {}, { [id]: cls });
    State.setObjectivePayload(oid, { classes });
    render();
  }
  function h8SetAction(id, val) {
    const oid = 'OBJ-H8';
    const p = State.getState().objectives[oid]?.payload || {};
    const actions = Object.assign({}, p.actions || {}, { [id]: val });
    State.setObjectivePayload(oid, { actions });
  }

  function dsrAdd(oid, reqId, stepId) {
    const p = State.getState().objectives[oid]?.payload || {};
    const orders = Object.assign({}, p.orders || {});
    const arr = orders[reqId] || [];
    if (arr.includes(stepId)) return;
    orders[reqId] = arr.concat([stepId]);
    State.setObjectivePayload(oid, { orders });
    render();
  }
  function dsrRemove(oid, reqId, stepId) {
    const p = State.getState().objectives[oid]?.payload || {};
    const orders = Object.assign({}, p.orders || {});
    orders[reqId] = (orders[reqId] || []).filter((s) => s !== stepId);
    State.setObjectivePayload(oid, { orders });
    render();
  }
  function dsrMove(oid, reqId, stepId, dir) {
    const p = State.getState().objectives[oid]?.payload || {};
    const orders = Object.assign({}, p.orders || {});
    const arr = (orders[reqId] || []).slice();
    const idx = arr.indexOf(stepId);
    const ni = idx + dir;
    if (ni < 0 || ni >= arr.length) return;
    const tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
    orders[reqId] = arr;
    State.setObjectivePayload(oid, { orders });
    render();
  }

  function vendorSetTreatment(vid, treatment) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M11' : 'OBJ-H7';
    const p = State.getState().objectives[oid]?.payload || {};
    const treatments = Object.assign({}, p.treatments || {}, { [vid]: treatment });
    State.setObjectivePayload(oid, Object.assign({}, p, { treatments }));
  }
  function vendorToggleRem(vid, rid) {
    const oid = 'OBJ-H7';
    const p = State.getState().objectives[oid]?.payload || {};
    const remediation = Object.assign({}, p.remediation || {});
    const arr = (remediation[vid] || []).slice();
    const idx = arr.indexOf(rid);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(rid);
    remediation[vid] = arr;
    State.setObjectivePayload(oid, Object.assign({}, p, { remediation }));
    render();
  }

  function invSet(recId, field, val) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M12' : 'OBJ-H5';
    const p = State.getState().objectives[oid]?.payload || {};
    const records = Object.assign({}, p.records || {});
    const rec = Object.assign({}, records[recId] || { controller: '', processor: '', sharing: [], class: '' });
    rec[field] = val;
    records[recId] = rec;
    State.setObjectivePayload(oid, { records });
  }
  function invToggleShare(recId, vid) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M12' : 'OBJ-H5';
    const p = State.getState().objectives[oid]?.payload || {};
    const records = Object.assign({}, p.records || {});
    const rec = Object.assign({}, records[recId] || { controller: '', processor: '', sharing: [], class: '' });
    const arr = (rec.sharing || []).slice();
    const idx = arr.indexOf(vid);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(vid);
    rec.sharing = arr;
    records[recId] = rec;
    State.setObjectivePayload(oid, { records });
    render();
  }

  function persSetPick(tid, val) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M8' : 'OBJ-H4';
    const p = State.getState().objectives[oid]?.payload || {};
    const picks = Object.assign({}, p.picks || {}, { [tid]: val });
    State.setObjectivePayload(oid, Object.assign({}, p, { picks }));
  }
  function persSetFix(tid, val) {
    const oid = 'OBJ-H4';
    const p = State.getState().objectives[oid]?.payload || {};
    const fixes = Object.assign({}, p.fixes || {}, { [tid]: val });
    State.setObjectivePayload(oid, Object.assign({}, p, { fixes }));
  }

  function penSetTier(sid, val) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M3' : 'OBJ-H9';
    const p = State.getState().objectives[oid]?.payload || {};
    const tiers = Object.assign({}, p.tiers || {}, { [sid]: val });
    State.setObjectivePayload(oid, Object.assign({}, p, { tiers }));
  }
  function penSetNonfin(sid, val) {
    const oid = 'OBJ-H9';
    const p = State.getState().objectives[oid]?.payload || {};
    const nonfin = Object.assign({}, p.nonfin || {}, { [sid]: val });
    State.setObjectivePayload(oid, Object.assign({}, p, { nonfin }));
  }

  function retSetRetention(rid, val) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M10' : 'OBJ-H6';
    const p = State.getState().objectives[oid]?.payload || {};
    State.setObjectivePayload(oid, Object.assign({}, p, { retention: Object.assign({}, p.retention || {}, { [rid]: val }) }));
  }
  function retSetDestruction(rid, val) {
    const oid = State.getState().mode === 'medium' ? 'OBJ-M10' : 'OBJ-H6';
    const p = State.getState().objectives[oid]?.payload || {};
    State.setObjectivePayload(oid, Object.assign({}, p, { destruction: Object.assign({}, p.destruction || {}, { [rid]: val }) }));
  }
  function retSetHold(val) {
    const oid = 'OBJ-H6';
    const p = State.getState().objectives[oid]?.payload || {};
    State.setObjectivePayload(oid, Object.assign({}, p, { holdAnswer: val }));
  }

  // --------------------------------------------------------------------------
  // Mobile rail drawer
  // --------------------------------------------------------------------------
  function openMobileRail() {
    const drawer = document.getElementById('mobile-rail');
    if (!drawer) return;
    drawer.classList.add('open');
  }
  function closeMobileRail() {
    const drawer = document.getElementById('mobile-rail');
    if (!drawer) return;
    drawer.classList.remove('open');
  }

  // --------------------------------------------------------------------------
  // Event wiring
  // --------------------------------------------------------------------------
  function wireEvents() {
    // click delegation
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      onAction(action, el, e);
    });

    // change delegation (selects + checkboxes + textareas that don't re-render on each keystroke)
    document.addEventListener('change', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      switch (action) {
        case 'm2-set': m2Set(el.getAttribute('data-term'), el.value); break;
        case 'm4-set': m4Set(el.getAttribute('data-id'), el.value); break;
        case 'm5-set': m5Set(el.getAttribute('data-id'), el.value); break;
        case 'm6-set-primary': m6SetPrimary(el.value); break;
        case 'm6-toggle-just': m6ToggleJust(el.getAttribute('data-id')); break;
        case 'h2-set': h2Set(el.getAttribute('data-field'), el.value); break;
        case 'h8-set-action': h8SetAction(el.getAttribute('data-id'), el.value); break;
        case 'vendor-set-treatment': vendorSetTreatment(el.getAttribute('data-vid'), el.value); break;
        case 'pers-set-pick': persSetPick(el.getAttribute('data-tid'), el.value); break;
        case 'pers-set-fix': persSetFix(el.getAttribute('data-tid'), el.value); break;
        case 'pen-set-tier': penSetTier(el.getAttribute('data-sid'), el.value); break;
        case 'pen-set-nonfin': penSetNonfin(el.getAttribute('data-sid'), el.value); break;
        case 'ret-set-retention': retSetRetention(el.getAttribute('data-rid'), el.value); break;
        case 'ret-set-destruction': retSetDestruction(el.getAttribute('data-rid'), el.value); break;
        case 'ret-set-hold': retSetHold(el.value); break;
        case 'inv-set': invSet(el.getAttribute('data-rec'), el.getAttribute('data-field'), el.value); break;
      }
    });

    // input delegation (text inputs that update feedback live)
    document.addEventListener('input', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      switch (action) {
        case 'h1-set': h1Set(el.getAttribute('data-bu'), el.value); break;
        case 'h2-set': h2Set(el.getAttribute('data-field'), el.value); break;
        case 'h8-set-action': h8SetAction(el.getAttribute('data-id'), el.value); break;
        case 'pers-set-fix': persSetFix(el.getAttribute('data-tid'), el.value); break;
        case 'ret-set-hold': retSetHold(el.value); break;
        case 'inv-set': invSet(el.getAttribute('data-rec'), el.getAttribute('data-field'), el.value); break;
      }
    });

    // ESC closes modal OR reset dialog (R7)
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (window.__atelierCompletionOpen) {
        e.preventDefault();
        window.__atelierCompletionOpen = false;
        render();
      } else if (window.__atelierResetOpen) {
        e.preventDefault();
        window.__atelierResetOpen = false;
        render();
      } else if (document.getElementById('mobile-rail')?.classList.contains('open')) {
        closeMobileRail();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Boot
  // --------------------------------------------------------------------------
  function boot() {
    wireEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for debugging
  global.AtelierApp = { render, validators };
})(window);
