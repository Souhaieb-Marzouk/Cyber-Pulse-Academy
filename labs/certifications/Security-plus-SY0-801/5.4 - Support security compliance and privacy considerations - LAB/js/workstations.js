// ============================================================================
// Meridian Atelier — Workstation renderers
// Each function returns an HTML string for one workstation + objective block.
// Event handling is delegated in app.js.
// ============================================================================

(function (global) {
  'use strict';

  const { h, raw, esc, ICONS, pillarBadge, glossaryTerm } = global.AtelierUI;
  const Data = global.AtelierData;
  const State = global.AtelierState;
  const { OBJECTIVES, WORKSTATIONS } = global.AtelierObjectives;

  // Lookup helpers
  const obj = (id) => OBJECTIVES.find((o) => o.id === id);
  const wsMeta = (id) => WORKSTATIONS.find((w) => w.id === id);

  // --------------------------------------------------------------------------
  // Workstation shell + Objective block
  // --------------------------------------------------------------------------
  function workstationShell(wsId, bodyHtml, introHtml) {
    const meta = wsMeta(wsId);
    return `
      <section class="atelier-card workstation scroll-mt-4" id="${esc(wsId)}" aria-labelledby="${esc(wsId)}-title">
        <div class="workstation-icon-row">
          <span class="workstation-icon" aria-hidden="true">${workstationIconSvg(wsId)}</span>
          <div>
            <div class="atelier-stamp sienna">Workstation</div>
            <h2 class="atelier-serif workstation-title" id="${esc(wsId)}-title">${esc(meta.label)}</h2>
            <p class="muted small">${esc(meta.hint)}</p>
          </div>
        </div>
        ${introHtml ? `<div class="workstation-intro atelier-serif">${introHtml}</div>` : ''}
        <div class="workstation-body">
          ${bodyHtml}
        </div>
      </section>`;
  }

  function workstationIconSvg(wsId) {
    const map = {
      'ws-reg': ICONS.map(16), 'ws-fw': ICONS.library(16), 'ws-class': ICONS.boxes(16),
      'ws-priv': ICONS.mail(16), 'ws-pers': ICONS.users(16), 'ws-vendor': ICONS.building2(16),
      'ws-audit': ICONS.fileSearch(16), 'ws-penalty': ICONS.gavel(16), 'ws-ret': ICONS.clock(16),
      'ws-inv': ICONS.boxes(16),
    };
    return map[wsId] || ICONS.scrollText(16);
  }

  function objectiveBlock(o, bodyHtml) {
    const st = State.getState().objectives[o.id];
    const status = st?.status || 'pending';
    const statusPill = status === 'correct'
      ? `<span class="atelier-pill ok">${ICONS.checkCircle(12)} Complete</span>`
      : status === 'incorrect'
        ? `<span class="atelier-pill no">${ICONS.alert(12)} Reconsider</span>`
        : '';
    return `
      <article class="objective-block scroll-mt-4" id="${esc(o.id)}" aria-labelledby="${esc(o.id)}-title">
        <div class="objective-header">
          <span class="atelier-pill muted">${esc(o.id)}</span>
          ${pillarBadge(o.pillar)}
          ${statusPill}
        </div>
        <h3 class="atelier-serif objective-title" id="${esc(o.id)}-title">${esc(o.title)}</h3>
        <p class="muted small objective-detail">${esc(o.detail)}</p>
        <div class="objective-body">${bodyHtml}</div>
      </article>`;
  }

  // --------------------------------------------------------------------------
  // Check Results component (Check button + hints + feedback)
  // --------------------------------------------------------------------------
  function checkResults(o) {
    const st = State.getState().objectives[o.id];
    const status = st?.status || 'pending';
    const attempts = st?.attempts || 0;
    const hintsUsed = st?.hintsUsed || 0;
    const isMedium = o.mode === 'medium';

    const hintBtn = isMedium ? `
      <button type="button" class="btn btn-hint atelier-focus ${hintsUsed >= 3 ? 'disabled' : ''}"
              data-action="use-hint" data-obj="${esc(o.id)}"
              ${hintsUsed >= 3 ? 'disabled aria-disabled="true"' : ''} aria-label="Reveal next hint">
        ${ICONS.lightbulb(14)}
        ${hintsUsed === 0 ? 'Reveal a nudge' : hintsUsed === 1 ? 'Reveal direction' : hintsUsed === 2 ? 'Reveal demonstration' : 'No hints left'}
      </button>` : '';

    // Hard mode: single optional nudge
    const hardNudge = !isMedium && o.hintLevel1 ? `
      <div class="hard-nudge-wrap">
        ${hintsUsed === 0 ? `
          <button type="button" class="btn-link atelier-focus" data-action="use-hint" data-obj="${esc(o.id)}">Reveal one optional nudge (costs score)</button>
        ` : `
          <div class="hint-reveal amber small">
            <div class="atelier-stamp amber">Optional nudge (score penalty applied)</div>
            ${esc(o.hintLevel1)}
          </div>
        `}
      </div>` : '';

    // Hint reveals (medium)
    let hintRevealHtml = '';
    if (isMedium && hintsUsed > 0) {
      const hints = [o.hintLevel1, o.hintLevel2, o.hintLevel3];
      hintRevealHtml = `
        <div class="hint-reveal warn">
          <div class="atelier-stamp amber">${ICONS.lightbulb(11)} Hint ${hintsUsed} of 3</div>
          <ol class="hint-list">
            ${hints.slice(0, hintsUsed).filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join('')}
          </ol>
        </div>`;
    }

    // Feedback
    let feedbackHtml = '';
    if (status !== 'pending') {
      const ok = status === 'correct';
      feedbackHtml = `
        <div class="feedback ${ok ? 'ok' : 'no'} atelier-serif" role="status" aria-live="polite">
          <div class="atelier-stamp ${ok ? 'sage' : 'crimson'}">${ok ? 'Why this matters' : 'Reconsider'}</div>
          ${esc(ok ? o.feedbackOk : o.feedbackNo)}
        </div>`;
    }

    const statusPill = status === 'correct'
      ? `<span class="atelier-pill ok">${ICONS.checkCircle(12)} Correct</span>`
      : status === 'incorrect'
        ? `<span class="atelier-pill no">${ICONS.alert(12)} Not yet · attempt #${attempts}</span>`
        : '';

    return `
      <div class="check-results">
        <div class="check-results-controls">
          <button type="button" class="btn btn-primary atelier-focus" data-action="check" data-obj="${esc(o.id)}">
            ${ICONS.checkCircle(14)} Check results
          </button>
          ${hintBtn}
          ${statusPill}
        </div>
        ${hardNudge}
        ${hintRevealHtml}
        ${feedbackHtml}
      </div>`;
  }

  // --------------------------------------------------------------------------
  // Workstation 1: Regulatory Map (M1, M2, H1)
  // --------------------------------------------------------------------------
  function regulatoryWstation(mode) {
    const m1 = obj('OBJ-M1');
    const m2 = obj('OBJ-M2');
    const h1 = obj('OBJ-H1');

    const intro = `<p>Meridian operates five distinct business units. Each unit handles a different mix of data, which determines which regulations apply. Map them correctly, and every other compliance decision follows.</p>`;

    let body;
    if (mode === 'medium') {
      body = objectiveBlock(m1, m1Body()) + objectiveBlock(m2, m2Body());
    } else {
      body = objectiveBlock(h1, h1Body());
    }
    return workstationShell('ws-reg', body, intro);
  }

  function m1Body() {
    const m1 = obj('OBJ-M1');
    const saved = State.getState().objectives[m1.id]?.payload?.selected || {};
    const buRows = Data.BUSINESS_UNITS.map((bu) => {
      const sel = saved[bu.id] || [];
      const chips = sel.map((rid) => {
        const r = Data.REGULATIONS.find((x) => x.id === rid);
        return r ? `<button type="button" class="atelier-pill p2 chip" data-action="m1-toggle" data-bu="${esc(bu.id)}" data-reg="${esc(rid)}" aria-pressed="true">${esc(r.code)} <span aria-hidden="true">×</span></button>` : '';
      }).join('');
      const addMenu = Data.REGULATIONS.map((r) => {
        const isSel = sel.includes(r.id);
        return `<li><button type="button" class="m1-add-item ${isSel ? 'disabled' : ''}" data-action="m1-toggle" data-bu="${esc(bu.id)}" data-reg="${esc(r.id)}" ${isSel ? 'disabled' : ''}><span class="atelier-pill p2">${esc(r.code)}</span> ${esc(r.name)}</button></li>`;
      }).join('');
      return `
        <div class="atelier-card bu-row">
          <div class="bu-row-head">
            <div class="atelier-serif forest">${esc(bu.name)}</div>
            <div class="muted small">${sel.length} selected</div>
          </div>
          <p class="muted small">${esc(bu.description)}</p>
          <div class="chip-row">${chips || '<span class="muted small italic">No regulations tagged yet.</span>'}</div>
          <details class="m1-add-menu"><summary class="m1-add-trigger forest">+ Add a regulation</summary><ul class="m1-add-list">${addMenu}</ul></details>
        </div>`;
    }).join('');

    const regList = Data.REGULATIONS.map((r) => `
      <li class="small">
        <details><summary class="reg-summary"><span class="atelier-pill p2">${esc(r.code)}</span> <span>${esc(r.name)}</span></summary>
        <div class="reg-detail muted"><div><b>Applies if:</b> ${esc(r.appliesIf)}</div><div class="mt-1"><b>Penalties:</b> ${esc(r.penaltyBlurb)}</div></div></details>
      </li>`).join('');

    return `
      <div class="grid-2-1">
        <div class="bu-list">${buRows}</div>
        <div class="atelier-card paper2 reg-side"><div class="atelier-stamp forest mb-2">Regulation chips</div><p class="small muted mb-2">Click a chip under a unit to remove it. Use the + Add a regulation menu on each unit.</p><ul class="reg-list">${regList}</ul></div>
      </div>
      ${checkResults(obj('OBJ-M1'))}`;
  }

  function m2Body() {
    const m2 = obj('OBJ-M2');
    const saved = State.getState().objectives[m2.id]?.payload?.answers || {};
    // R6: shuffled defs (same permutation applied for all dropdowns)
    const shuffledDefs = Data.DEFS_PERMUTATION.map((i) => Data.TERM_PAIRS[i].def);
    const rows = Data.TERM_PAIRS.map((p) => {
      const opts = ['<option value="">— pick the matching definition —</option>']
        .concat(shuffledDefs.map((d) => `<option value="${esc(d)}" ${saved[p.term] === d ? 'selected' : ''}>${esc(d)}</option>`)).join('');
      return `
        <li class="atelier-card m2-row">
          <div class="atelier-serif forest">${esc(p.term)}</div>
          <select class="atelier-focus" aria-label="Definition for ${esc(p.term)}" data-action="m2-set" data-term="${esc(p.term)}">${opts}</select>
        </li>`;
    }).join('');
    return `
      <p class="small muted mb-2">Match each governance term on the left to its correct definition. Each definition is used exactly once.</p>
      <ul class="m2-list">${rows}</ul>
      ${checkResults(m2)}`;
  }

  function h1Body() {
    const h1 = obj('OBJ-H1');
    const saved = State.getState().objectives[h1.id]?.payload?.answers || {};

    const rows = Data.BUSINESS_UNITS.map((bu) => {
      const raw = (saved[bu.id] || '').toUpperCase().split(/[,\s]+/).map((s) => s.trim().replace(/\.$/, '')).filter(Boolean).map((s) => s === 'PCI' ? 'PCI DSS' : s);
      const expected = bu.applicableRegulations.map((rid) => (Data.REGULATIONS.find((r) => r.id === rid)?.code || '').toUpperCase());
      const acceptedCount = raw.filter((g) => expected.includes(g)).length;
      const extraCount = raw.length - acceptedCount;
      return `
        <li class="atelier-card h1-bu">
          <div class="atelier-serif forest">${esc(bu.name)}</div>
          <p class="muted small">${esc(bu.description)}</p>
          <label class="muted small" for="h1-${esc(bu.id)}">Regulations that apply (comma-separated codes):</label>
          <input id="h1-${esc(bu.id)}" type="text" class="atelier-focus mono" data-action="h1-set" data-bu="${esc(bu.id)}" value="${esc(saved[bu.id] || '')}" placeholder="e.g. HIPAA, GDPR, SOX" autocomplete="off" spellcheck="false">
          <div class="muted small mt-1">${raw.length === 0 ? '0 codes entered.' : `${raw.length} code${raw.length > 1 ? 's' : ''} entered · ${acceptedCount} recognized · ${extraCount > 0 ? extraCount + ' not applicable' : 'no extras'}.`}</div>
        </li>`;
    }).join('');

    return `
      <div class="atelier-card paper2 mb-3 small">
        <span class="atelier-stamp sienna mb-1">Architect mode — exact codes required</span>
        Type the regulation <b>codes</b> that apply to each business unit, separated by commas. Accepted codes:
        <code class="code-inline">HIPAA, GLBA, SOX, GDPR, PCI (or PCI DSS), FISMA, FedRAMP</code>.
        Near-misses (e.g. <code class="code-inline">SOA</code>, <code class="code-inline">PCIDSS</code>) will be rejected.
      </div>
      <ul class="h1-list">${rows}</ul>
      ${checkResults(h1)}`;
  }

  // --------------------------------------------------------------------------
  // Workstation 2: Framework Library (M6, H2)
  // --------------------------------------------------------------------------
  function frameworkWstation(mode) {
    const intro = `<p>Meridian needs a primary compliance framework. The four candidates below are not laws — they are voluntary control catalogs. Choose one as primary (and, for Hard mode, an overlay) and justify the trade-off.</p>`;

    const fwCards = Data.FRAMEWORKS.map((f) => `
      <article class="atelier-card fw-card">
        <div class="fw-card-head"><span class="atelier-pill p3">${esc(f.code)}</span><a href="${esc(f.referenceUrl)}" target="_blank" rel="noopener noreferrer" class="atelier-link ml-auto small">official ${ICONS.externalLink(11)}</a></div>
        <h3 class="atelier-serif fw-name">${esc(f.name)}</h3>
        <p class="muted small mb-2">${esc(f.origin)}</p>
        <p class="small mb-2"><b>Best for:</b> ${esc(f.bestFor)}</p>
        <div class="grid-2 small">
          <div><div class="atelier-stamp sage mb-1">Pros</div><ul class="disc">${f.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
          <div><div class="atelier-stamp crimson mb-1">Cons</div><ul class="disc">${f.cons.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
        </div>
      </article>`).join('');

    const objBlock = mode === 'medium' ? m6Picker() : h2Picker();
    const body = `<div class="grid-2-sm">${fwCards}</div>${objBlock}`;
    return workstationShell('ws-fw', body, intro);
  }

  function m6Picker() {
    const m6 = obj('OBJ-M6');
    const saved = State.getState().objectives[m6.id]?.payload || {};
    const primary = saved.primary || '';
    const justifications = saved.justifications || [];

    const options = [
      { id: 'j-fed', text: 'Meridian handles federal data; NIST aligns directly with FISMA/FedRAMP.', correct: true },
      { id: 'j-free', text: 'NIST is free and publicly available, lowering adoption cost.', correct: true },
      { id: 'j-intl', text: 'ISO 27001 is the most internationally recognized certification; add it as an overlay for customer trust.', correct: true },
      { id: 'j-cis', text: 'CIS Controls are too short to be a primary framework for a regulated company.', correct: true },
      { id: 'j-cobit', text: 'COBIT alone is sufficient because it covers everything.', correct: false },
      { id: 'j-iso-only', text: 'ISO 27001 alone is best because it is the cheapest option.', correct: false },
      { id: 'j-none', text: 'No framework is needed because Meridian already complies with HIPAA.', correct: false },
    ];

    const fwOpts = Data.FRAMEWORKS.map((f) => `<option value="${esc(f.id)}" ${primary === f.id ? 'selected' : ''}>${esc(f.code)}</option>`).join('');
    const justList = options.map((o) => `
      <li><label class="m6-just-label atelier-card ${justifications.includes(o.id) ? 'checked' : ''}">
        <input type="checkbox" data-action="m6-toggle-just" data-id="${esc(o.id)}" ${justifications.includes(o.id) ? 'checked' : ''} class="atelier-focus">
        <span>${esc(o.text)}</span>
      </label></li>`).join('');

    return objectiveBlock(m6, `
      <div class="atelier-card">
        <label class="atelier-stamp forest mb-2" for="m6-primary">Primary framework</label>
        <select id="m6-primary" class="atelier-focus" data-action="m6-set-primary"><option value="">— pick a primary —</option>${fwOpts}</select>
        <div class="atelier-stamp forest mt-4 mb-2">Justifications (select all that apply)</div>
        <ul class="m6-just-list">${justList}</ul>
      </div>
      ${checkResults(m6)}`);
  }

  function h2Picker() {
    const h2 = obj('OBJ-H2');
    const saved = State.getState().objectives[h2.id]?.payload || {};
    const primary = saved.primary || '';
    const overlay = saved.overlay || '';
    const rationale = saved.rationale || '';

    const fwOpts = (sel) => Data.FRAMEWORKS.map((f) => `<option value="${esc(f.id)}" ${sel === f.id ? 'selected' : ''}>${esc(f.code)}</option>`).join('');

    return objectiveBlock(h2, `
      <div class="atelier-card paper2 mb-3 small">
        <span class="atelier-stamp sienna mb-1">Architect mode — exact pair required</span>
        Choose primary + overlay, then write a one-sentence rationale (min 30 chars) that mentions BOTH federal alignment AND international credibility.
      </div>
      <div class="grid-2">
        <div class="atelier-card"><label class="atelier-stamp forest mb-2" for="h2-primary">Primary</label><select id="h2-primary" class="atelier-focus" data-action="h2-set" data-field="primary"><option value="">— pick —</option>${fwOpts(primary)}</select></div>
        <div class="atelier-card"><label class="atelier-stamp forest mb-2" for="h2-overlay">Certification overlay</label><select id="h2-overlay" class="atelier-focus" data-action="h2-set" data-field="overlay"><option value="">— pick —</option>${fwOpts(overlay)}</select></div>
      </div>
      <div class="atelier-card mt-3"><label class="atelier-stamp forest mb-2" for="h2-rationale">Trade-off rationale (1 sentence)</label>
        <textarea id="h2-rationale" rows="3" class="atelier-focus" data-action="h2-set" data-field="rationale" placeholder="e.g. NIST is the best primary because it aligns directly with FISMA/FedRAMP for Meridian's federal data, and ISO 27001 is layered on top as an internationally recognized certification for customer trust.">${esc(rationale)}</textarea>
        <div class="muted small mt-1">${esc(rationale.trim().length)} chars</div>
      </div>
      ${checkResults(h2)}`);
  }

  // --------------------------------------------------------------------------
  // Workstation 3: Classification Bench (M4, M5) + Workstation 10: Inventory Map (M12, H5)
  // --------------------------------------------------------------------------
  function classificationWstation(mode) {
    const intro = `<p>The bench holds 12 sample data items drawn from across Meridian. Classify each one by <b>sensitivity</b> (M4) and by <b>data kind</b> (M5). Hard mode jumps to the data inventory map below.</p>`;
    const body = mode === 'medium'
      ? objectiveBlock(obj('OBJ-M4'), m4Body()) + objectiveBlock(obj('OBJ-M5'), m5Body())
      : `<div class="muted small atelier-serif italic">Hard mode: skip directly to the Data Inventory Map workstation below for OBJ-H5.</div>`;
    return workstationShell('ws-class', body, intro);
  }

  function m4Body() {
    const m4 = obj('OBJ-M4');
    const saved = State.getState().objectives[m4.id]?.payload?.classes || {};
    const st = State.getState().objectives[m4.id];
    const revealRationale = st && (st.status === 'incorrect' || st.status === 'correct');
    const bins = [
      { id: 'public', label: 'Public', desc: 'Approved for public release.' },
      { id: 'internal', label: 'Internal', desc: 'Employees; no customer data.' },
      { id: 'confidential', label: 'Confidential', desc: 'Limited employees + NDA.' },
      { id: 'restricted', label: 'Restricted', desc: 'Highest sensitivity; regulated.' },
    ];
    const items = Data.DATA_SAMPLES.map((s) => {
      const chosen = saved[s.id] || '';
      const opts = ['<option value="">— class —</option>'].concat(bins.map((b) => `<option value="${esc(b.id)}" ${chosen === b.id ? 'selected' : ''}>${esc(b.label)}</option>`)).join('');
      return `
        <li class="atelier-card class-item">
          <div class="class-item-head"><div class="atelier-serif forest">${esc(s.label)}</div>
            <select class="atelier-focus" data-action="m4-set" data-id="${esc(s.id)}" aria-label="Classification for ${esc(s.label)}">${opts}</select></div>
          <p class="muted small">${esc(s.detail)}</p>
          ${revealRationale ? `<p class="class-rationale atelier-serif"><b>Expected:</b> ${esc(s.correctClass)}. ${esc(s.rationale)}</p>` : ''}
        </li>`;
    }).join('');
    const binRef = bins.map((b) => `<li><div class="atelier-pill p4">${esc(b.label)}</div><div class="muted small">${esc(b.desc)}</div></li>`).join('');
    return `
      <div class="grid-2-1">
        <ul class="class-list">${items}</ul>
        <div class="atelier-card paper2 bin-ref"><div class="atelier-stamp forest mb-2">Classification bins</div><ul class="bin-list">${binRef}</ul></div>
      </div>
      ${checkResults(m4)}`;
  }

  function m5Body() {
    const m5 = obj('OBJ-M5');
    const saved = State.getState().objectives[m5.id]?.payload?.kinds || {};
    const kinds = ['PII', 'PHI', 'financial', 'operational', 'public-info', 'secret'];
    const items = Data.DATA_SAMPLES.map((s) => {
      const chosen = saved[s.id] || '';
      const opts = ['<option value="">— kind —</option>'].concat(kinds.map((k) => `<option value="${esc(k)}" ${chosen === k ? 'selected' : ''}>${esc(k)}</option>`)).join('');
      return `
        <li class="atelier-card class-item-sm">
          <div class="class-item-head"><div class="atelier-serif forest small">${esc(s.label)}</div>
            <select class="atelier-focus small" data-action="m5-set" data-id="${esc(s.id)}" aria-label="Data kind for ${esc(s.label)}">${opts}</select></div>
          <p class="muted small">${esc(s.detail)}</p>
        </li>`;
    }).join('');
    return `<ul class="grid-2-sm class-list-sm">${items}</ul>${checkResults(m5)}`;
  }

  function inventoryWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M12' : 'OBJ-H5';
    const o = obj(objId);
    const intro = `<p>The data inventory map records every dataset Meridian holds. For each record, identify the <b>controller</b>, the <b>processor</b>, the <b>third parties</b> data is shared with, and the <b>classification</b>. ${mode === 'hard' ? 'Two distractor vendor names appear in the processor dropdown — neither is correct.' : ''}</p>`;

    const saved = State.getState().objectives[o.id]?.payload?.records || {};
    const hard = mode === 'hard';
    const processorOptions = hard
      ? [
          { id: 'v-cloudvista', label: 'CloudVista Analytics' },
          { id: 'v-bielefeld', label: 'Bielefeld Billing Co.' },
          { id: 'v-paxroster', label: 'PaxRoster HR' },
          { id: 'none', label: 'None (Meridian processes itself)' },
          { id: 'd-atlas', label: 'AtlasCRM (distractor)' },
          { id: 'd-northwind', label: 'NorthwindPay (distractor)' },
        ]
      : [
          { id: 'v-cloudvista', label: 'CloudVista Analytics' },
          { id: 'v-bielefeld', label: 'Bielefeld Billing Co.' },
          { id: 'v-paxroster', label: 'PaxRoster HR' },
          { id: 'none', label: 'None (Meridian processes itself)' },
        ];

    const bins = ['public', 'internal', 'confidential', 'restricted'];

    const rows = Data.INVENTORY_RECORDS.map((r) => {
      const got = saved[r.id] || { controller: '', processor: '', sharing: [], class: '' };
      const procOpts = ['<option value="">— pick —</option>'].concat(processorOptions.map((p) => `<option value="${esc(p.id)}" ${got.processor === p.id ? 'selected' : ''}>${esc(p.label)}</option>`)).join('');
      const classOpts = ['<option value="">— pick —</option>'].concat(bins.map((b) => `<option value="${esc(b)}" ${got.class === b ? 'selected' : ''}>${esc(b)}</option>`)).join('');
      const shareBtns = processorOptions.filter((p) => p.id !== 'none').map((p) => {
        const on = (got.sharing || []).includes(p.id);
        return `<button type="button" class="atelier-pill ${on ? 'p2' : 'muted'} atelier-focus" data-action="inv-toggle-share" data-rec="${esc(r.id)}" data-vid="${esc(p.id)}" aria-pressed="${on}">${esc(p.label)}</button>`;
      }).join('');
      return `
        <li class="atelier-card inv-row">
          <div class="atelier-serif forest">${esc(r.dataType)}</div>
          <p class="muted small mb-2">${esc(r.source)}</p>
          <div class="grid-2 inv-grid">
            <div><label class="muted small mb-1" for="inv-c-${esc(r.id)}">Controller</label><input id="inv-c-${esc(r.id)}" type="text" class="atelier-focus" data-action="inv-set" data-rec="${esc(r.id)}" data-field="controller" value="${esc(got.controller)}" placeholder="e.g. Meridian Health Finance"></div>
            <div><label class="muted small mb-1" for="inv-p-${esc(r.id)}">Processor</label><select id="inv-p-${esc(r.id)}" class="atelier-focus" data-action="inv-set" data-rec="${esc(r.id)}" data-field="processor">${procOpts}</select></div>
            <div class="inv-share-cell"><div class="muted small mb-1">Shared with (multi-select)</div><div class="share-row">${shareBtns}</div></div>
            <div><label class="muted small mb-1" for="inv-cl-${esc(r.id)}">Classification</label><select id="inv-cl-${esc(r.id)}" class="atelier-focus" data-action="inv-set" data-rec="${esc(r.id)}" data-field="class">${classOpts}</select></div>
          </div>
        </li>`;
    }).join('');

    const body = objectiveBlock(o, `<ul class="inv-list">${rows}</ul>${checkResults(o)}`);
    return workstationShell('ws-inv', body, intro);
  }

  // --------------------------------------------------------------------------
  // Workstation 4: Privacy Request Desk (M9, H3)
  // --------------------------------------------------------------------------
  function privacyWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M9' : 'OBJ-H3';
    const o = obj(objId);
    const intro = `<p>The privacy desk receives <b>GDPR data subject rights requests</b> from EU customers. Sequence the handling steps in the correct order. In Hard mode, handle two requests simultaneously — one with a legal hold, one without.</p>`;
    const requests = mode === 'medium' ? Data.DSR_REQUESTS.slice(0, 1) : Data.DSR_REQUESTS;

    const body = objectiveBlock(o, privacyHandler(o, requests, mode === 'hard'));
    return workstationShell('ws-priv', body, intro);
  }

  function privacyHandler(o, requests, hard) {
    const saved = State.getState().objectives[o.id]?.payload?.orders || {};
    const blocks = requests.map((r) => {
      const order = saved[r.id] || [];
      const remaining = Data.ALL_DSR_STEPS.filter((s) => !order.includes(s.id));
      const pool = remaining.map((s) => `
        <li><button type="button" class="dsr-pool-item atelier-focus" data-action="dsr-add" data-req="${esc(r.id)}" data-step="${esc(s.id)}"><span class="bold">${esc(s.label)}</span><span class="muted block">${esc(s.desc)}</span></button></li>`).join('');
      const queue = order.map((stepId, idx) => {
        const s = Data.ALL_DSR_STEPS.find((x) => x.id === stepId);
        if (!s) return '';
        return `
          <li class="dsr-queue-item">
            <span class="atelier-pill p3">${idx + 1}</span>
            <span class="dsr-queue-text"><span class="bold">${esc(s.label)}</span><span class="muted block">${esc(s.desc)}</span></span>
            <span class="dsr-queue-controls">
              <button type="button" class="dsr-move atelier-focus" data-action="dsr-move" data-req="${esc(r.id)}" data-step="${esc(s.id)}" data-dir="-1" ${idx === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>
              <button type="button" class="dsr-move atelier-focus" data-action="dsr-move" data-req="${esc(r.id)}" data-step="${esc(s.id)}" data-dir="1" ${idx === order.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>
              <button type="button" class="dsr-remove atelier-focus" data-action="dsr-remove" data-req="${esc(r.id)}" data-step="${esc(s.id)}" aria-label="Remove">✕</button>
            </span>
          </li>`;
      }).join('');

      const holdPill = r.legalHold ? `<span class="atelier-pill warn">Legal hold active</span>` : '';
      const procPills = r.processorsInvolved.map((vid) => {
        const v = Data.VENDORS.find((x) => x.id === vid);
        return v ? `<span class="atelier-pill muted">${esc(v.name)}</span>` : '';
      }).join('');

      return `
        <div class="atelier-card dsr-card">
          <header class="dsr-card-head">
            <div class="dsr-meta"><span class="atelier-pill p2">${esc(r.requestType.toUpperCase())}</span><span class="atelier-serif forest">${esc(r.customerName)} · ${esc(r.customerCountry)}</span><span class="muted small">received ${esc(r.receivedDate)}</span></div>
            <p class="small mt-1">${esc(r.detail)}</p>
            <div class="share-row mt-2">${holdPill}${procPills}</div>
          </header>
          <div class="grid-2 dsr-grid">
            <div class="atelier-card paper2 dsr-pool"><div class="atelier-stamp forest mb-1">Step pool — click to append</div><ul class="dsr-pool-list">${pool || '<li class="muted small italic">All steps added.</li>'}</ul></div>
            <div class="atelier-card dsr-queue"><div class="atelier-stamp sienna mb-1">Your sequence</div><ol class="dsr-queue-list">${queue || '<li class="muted small italic">Empty — add steps from the pool.</li>'}</ol></div>
          </div>
        </div>`;
    }).join('');

    const tip = hard
      ? 'Both requests share some steps but differ in the middle. Sequence must match the expected order exactly.'
      : 'Order matters — verify identity before any disclosure or action.';

    return `<div class="dsr-blocks">${blocks}</div><p class="muted small mt-2 atelier-serif">Tip: ${esc(tip)}</p>${checkResults(o)}`;
  }

  // --------------------------------------------------------------------------
  // Workstation 5: Personnel Lifecycle Board (M8, H4)
  // --------------------------------------------------------------------------
  function personnelWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M8' : 'OBJ-H4';
    const o = obj(objId);
    const intro = `<p>The lifecycle board shows the 12 required compliance steps across onboarding, role-change, and offboarding. Each ticket below was filed with some steps marked complete. Spot what is missing.</p>`;
    const body = objectiveBlock(o, personnelBoard(o, mode === 'hard'));
    return workstationShell('ws-pers', body, intro);
  }

  function personnelBoard(o, hard) {
    const saved = State.getState().objectives[o.id]?.payload || {};
    const picks = saved.picks || {};
    const fixes = saved.fixes || {};

    // lifecycle reference
    const phases = ['onboarding', 'role-change', 'offboarding'];
    const ref = phases.map((phase) => {
      const steps = Data.PERSONNEL_STEPS.filter((s) => s.phase === phase);
      return `<div><div class="atelier-pill p3 mb-1">${esc(phase)}</div><ul class="pers-ref-list small">${steps.map((s) => `<li><span class="mono forest">${esc(s.id.replace('ps-', ''))}</span> · ${esc(s.label)}</li>`).join('')}</ul></div>`;
    }).join('');

    const tickets = Data.PERSONNEL_TICKETS.map((t) => {
      const hasGap = t.missingStep !== null;
      const completed = t.completedSteps.map((sid) => {
        const s = Data.PERSONNEL_STEPS.find((x) => x.id === sid);
        return s ? `<span class="atelier-pill ok">${esc(s.label)}</span>` : '';
      }).join('');
      const cleanPill = !hasGap ? `<span class="atelier-pill ok">Clean ticket</span>` : '';

      const stepOpts = ['<option value="">— pick the missing step —</option>'].concat(
        Data.PERSONNEL_STEPS.map((s) => `<option value="${esc(s.id)}" ${picks[t.id] === s.id ? 'selected' : ''}>${esc(s.label)}</option>`)
      ).join('');

      const fixInput = hard && hasGap ? `
        <div><label class="muted small mb-1" for="fix-${esc(t.id)}">SOP fix (one sentence, must address root cause):</label>
          <input id="fix-${esc(t.id)}" type="text" class="atelier-focus" data-action="pers-set-fix" data-tid="${esc(t.id)}" value="${esc(fixes[t.id] || '')}" placeholder="e.g. Block data access until NDA is signed; add NDA gate to onboarding checklist."></div>` : '';

      return `
        <li class="atelier-card pers-ticket">
          <header class="mb-2">
            <div class="dsr-meta"><span class="atelier-pill muted">${esc(t.id)}</span><span class="atelier-serif forest">${esc(t.employee)}</span><span class="muted small">${esc(t.role)} · ${esc(t.phase)}</span>${cleanPill}</div>
            <p class="muted small mt-1">${esc(t.scenarioNotes)}</p>
          </header>
          <div class="small mb-2"><span class="atelier-stamp forest mb-1">Completed steps</span><div class="share-row">${completed}</div></div>
          ${hasGap ? `
            <div class="grid-2-sm pers-fix-grid">
              <div><label class="muted small mb-1" for="missing-${esc(t.id)}">Missing step (pick one):</label>
                <select id="missing-${esc(t.id)}" class="atelier-focus" data-action="pers-set-pick" data-tid="${esc(t.id)}">${stepOpts}</select></div>
              ${fixInput}
            </div>` : ''}
        </li>`;
    }).join('');

    return `
      <div class="atelier-card paper2 pers-ref"><div class="atelier-stamp forest mb-2">Required lifecycle steps (reference)</div><div class="grid-3">${ref}</div></div>
      <ul class="pers-list">${tickets}</ul>
      ${checkResults(o)}`;
  }

  // --------------------------------------------------------------------------
  // Workstation 6: Vendor Risk Wall (M11, H7)
  // --------------------------------------------------------------------------
  function vendorWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M11' : 'OBJ-H7';
    const o = obj(objId);
    const intro = `<p>The vendor wall displays Meridian's three highest-risk third parties. For each, assign a risk treatment. In Hard mode, also select the minimum set of remediation conditions that must be in place before data flows.</p>`;
    const body = objectiveBlock(o, vendorBoard(o, mode === 'hard'));
    return workstationShell('ws-vendor', body, intro);
  }

  function vendorBoard(o, hard) {
    const saved = State.getState().objectives[o.id]?.payload || {};
    const treatments = saved.treatments || {};
    const remediation = saved.remediation || {};

    const cards = Data.VENDORS.map((v) => {
      const certPills = v.certifications.map((c) => `<span class="atelier-pill p3">${esc(c)}</span>`).join('');
      const redFlags = v.redFlags.length > 0
        ? `<div class="sm-col-span-2"><dt class="atelier-stamp crimson">Red flags</dt><dd class="crimson"><ul class="disc">${v.redFlags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></dd></div>`
        : '';
      const adequacyPill = v.adequacyIssue ? `<span class="atelier-pill no">Adequacy issue</span>` : `<span class="atelier-pill ok">No adequacy issue</span>`;

      const treatOpts = ['<option value="">— pick a treatment —</option>'].concat(
        ['approve', 'approve-with-conditions', 'reject'].map((t) => `<option value="${esc(t)}" ${treatments[v.id] === t ? 'selected' : ''}>${esc(t === 'approve' ? 'Approve' : t === 'approve-with-conditions' ? 'Approve with conditions' : 'Reject')}</option>`)
      ).join('');

      const remedList = hard ? `
        <div class="mt-3">
          <div class="atelier-stamp forest mb-1">Minimum remediation conditions</div>
          <ul class="remed-list">
            ${Data.REMEDIATION[v.id].map((r) => {
              const on = (remediation[v.id] || []).includes(r.id);
              return `<li><label class="remed-label atelier-card ${on ? 'checked' : ''}"><input type="checkbox" data-action="vendor-toggle-rem" data-vid="${esc(v.id)}" data-rid="${esc(r.id)}" ${on ? 'checked' : ''} class="atelier-focus"><span>${esc(r.text)}</span></label></li>`;
            }).join('')}
          </ul>
        </div>` : '';

      return `
        <li class="atelier-card vendor-card">
          <header class="vendor-head"><div class="atelier-serif forest vendor-name">${esc(v.name)}</div>${adequacyPill}</header>
          <dl class="vendor-dl small">
            <div><dt class="atelier-stamp muted">Role</dt><dd>${esc(v.role)}</dd></div>
            <div><dt class="atelier-stamp muted">Jurisdiction</dt><dd>${esc(v.jurisdiction)}</dd></div>
            <div class="sm-col-span-2"><dt class="atelier-stamp muted">Data touched</dt><dd>${esc(v.dataTouched)}</dd></div>
            <div class="sm-col-span-2"><dt class="atelier-stamp muted">Breach history</dt><dd>${esc(v.breachHistory)}</dd></div>
            <div class="sm-col-span-2"><dt class="atelier-stamp muted">Certifications</dt><dd><div class="share-row mt-1">${certPills}</div></dd></div>
            ${redFlags}
          </dl>
          <div class="mb-2"><label class="muted small mb-1" for="t-${esc(v.id)}">Risk treatment</label>
            <select id="t-${esc(v.id)}" class="atelier-focus" data-action="vendor-set-treatment" data-vid="${esc(v.id)}">${treatOpts}</select>
          </div>
          ${remedList}
        </li>`;
    }).join('');

    return `<ul class="vendor-list">${cards}</ul>${checkResults(o)}`;
  }

  // --------------------------------------------------------------------------
  // Workstation 7: Audit Evidence Vault (M7, H8)
  // --------------------------------------------------------------------------
  function auditWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M7' : 'OBJ-H8';
    const o = obj(objId);
    const intro = `<p>The vault contains the evidence pulled for an upcoming compliance audit. In Medium mode, mark each item as valid evidence or not. In Hard mode, classify each as <b>real-evidence</b>, <b>gap</b>, or <b>red-herring</b> — and prescribe the corrective action for each gap. Two items are red herrings; three are real evidence; three are gaps.</p>`;
    const body = objectiveBlock(o, mode === 'medium' ? m7Triage(o) : h8Triage(o));
    return workstationShell('ws-audit', body, intro);
  }

  function m7Triage(o) {
    const saved = State.getState().objectives[o.id]?.payload?.verdicts || {};
    const items = Data.AUDIT_EVIDENCE.map((it) => {
      const v = saved[it.id] || '';
      return `
        <li class="atelier-card audit-item">
          <div class="atelier-serif forest small">${esc(it.title)}</div>
          <p class="muted small mt-1 mb-2">${esc(it.detail)}</p>
          <div class="audit-btns">
            ${['valid', 'invalid'].map((opt) => `
              <button type="button" class="atelier-pill ${v === opt ? (opt === 'valid' ? 'ok' : 'no') : 'muted'} atelier-focus"
                data-action="m7-set" data-id="${esc(it.id)}" data-verdict="${esc(opt)}" aria-pressed="${v === opt}">${opt === 'valid' ? 'Valid evidence' : 'Not evidence'}</button>`).join('')}
          </div>
        </li>`;
    }).join('');
    return `<ul class="grid-2-sm audit-list">${items}</ul>${checkResults(o)}`;
  }

  function h8Triage(o) {
    const saved = State.getState().objectives[o.id]?.payload || {};
    const classes = saved.classes || {};
    const actions = saved.actions || {};
    const st = State.getState().objectives[o.id];
    const reveal = st && st.status && st.status !== 'pending';

    const items = Data.AUDIT_EVIDENCE.map((it) => {
      const c = classes[it.id] || '';
      const isGap = c === 'gap' || (it.id === 'ae-2' && (c === 'gap' || c === 'red-herring'));
      const opts = ['real-evidence', 'gap', 'red-herring'].map((opt) => `
        <button type="button" class="atelier-pill ${c === opt ? (opt === 'real-evidence' ? 'ok' : opt === 'gap' ? 'no' : 'warn') : 'muted'} atelier-focus"
          data-action="h8-set-class" data-id="${esc(it.id)}" data-class="${esc(opt)}" aria-pressed="${c === opt}">${esc(opt)}</button>`).join('');
      const actInput = isGap ? `
        <div class="mt-2">
          <label class="muted small mb-1" for="act-${esc(it.id)}">Corrective action (one sentence, min 15 chars, must describe remediation):</label>
          <input id="act-${esc(it.id)}" type="text" class="atelier-focus" data-action="h8-set-action" data-id="${esc(it.id)}" value="${esc(actions[it.id] || '')}" placeholder="e.g. Renew PCI DSS AOC before expiry; track in vendor risk register.">
        </div>` : '';
      const explain = reveal ? `<p class="audit-explain mt-2 atelier-serif"><b>Reality:</b> ${esc(it.explanation)}</p>` : '';
      return `
        <li class="atelier-card audit-item">
          <div class="atelier-serif forest">${esc(it.title)}</div>
          <p class="muted small mt-1 mb-2">${esc(it.detail)}</p>
          <div class="audit-btns">${opts}</div>
          ${actInput}
          ${explain}
        </li>`;
    }).join('');
    return `<ul class="audit-list">${items}</ul>${checkResults(o)}`;
  }

  // --------------------------------------------------------------------------
  // Workstation 8: Penalty Tribunal (M3, H9)
  // Workstation 9: Retention & Destruction Bench (M10, H6)
  // --------------------------------------------------------------------------
  const TIER_OPTIONS = [
    { id: 'civil-1',    label: 'Civil Tier 1 — no knowledge · $100–$50K per violation' },
    { id: 'civil-2',    label: 'Civil Tier 2 — reasonable cause · $1K–$50K' },
    { id: 'civil-3',    label: 'Civil Tier 3 — willful neglect, corrected · $10K–$50K' },
    { id: 'civil-4',    label: 'Civil Tier 4 — willful neglect, uncorrected · $50K–$1.5M per category/year' },
    { id: 'criminal-a', label: 'Criminal Tier A — $50K + up to 1 year' },
    { id: 'criminal-b', label: 'Criminal Tier B — $100K + up to 5 years' },
    { id: 'criminal-c', label: 'Criminal Tier C — $250K + up to 10 years (sale / profit)' },
  ];
  const NON_FIN_CONSEQUENCES = ['none', 'reputational damage', 'loss of license', 'contract breach', 'imprisonment'];

  function penaltyWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M3' : 'OBJ-H9';
    const o = obj(objId);
    const intro = `<p>The tribunal triages HIPAA violations. Tier depends on the actor's intent and whether the willful neglect was corrected. ${mode === 'hard' ? 'Hard mode also requires you to identify the most likely non-financial consequence.' : ''}</p>`;
    const body = objectiveBlock(o, penaltyBoard(o, mode === 'hard'));
    return workstationShell('ws-penalty', body, intro);
  }

  function penaltyBoard(o, hard) {
    const saved = State.getState().objectives[o.id]?.payload || {};
    const tiers = saved.tiers || {};
    const nonfin = saved.nonfin || {};
    const st = State.getState().objectives[o.id];
    const reveal = st && st.status && st.status !== 'pending';

    const items = Data.PENALTY_SCENARIOS.map((s) => {
      const tierOpts = ['<option value="">— pick a tier —</option>'].concat(
        TIER_OPTIONS.map((t) => `<option value="${esc(t.id)}" ${tiers[s.id] === t.id ? 'selected' : ''}>${esc(t.label)}</option>`)
      ).join('');
      const nfOpts = ['<option value="">— pick —</option>'].concat(
        NON_FIN_CONSEQUENCES.map((c) => `<option value="${esc(c)}" ${nonfin[s.id] === c ? 'selected' : ''}>${esc(c)}</option>`)
      ).join('');
      const explain = reveal ? `<p class="audit-explain mt-2 atelier-serif"><b>Expected:</b> ${esc(s.correctTierLabel)}. ${esc(s.rationale)}</p>` : '';
      return `
        <li class="atelier-card penalty-item">
          <div class="atelier-stamp sienna mb-1">Scenario · ${esc(s.recordsAffected)} records</div>
          <p class="mb-3 atelier-serif">${esc(s.scenario)}</p>
          <div class="grid-2">
            <div><label class="muted small mb-1" for="pt-${esc(s.id)}">Penalty tier</label><select id="pt-${esc(s.id)}" class="atelier-focus" data-action="pen-set-tier" data-sid="${esc(s.id)}">${tierOpts}</select></div>
            ${hard ? `<div><label class="muted small mb-1" for="nf-${esc(s.id)}">Most likely non-financial consequence</label><select id="nf-${esc(s.id)}" class="atelier-focus" data-action="pen-set-nonfin" data-sid="${esc(s.id)}">${nfOpts}</select></div>` : ''}
          </div>
          ${explain}
        </li>`;
    }).join('');
    return `<ul class="penalty-list">${items}</ul>${checkResults(o)}`;
  }

  function retentionWstation(mode) {
    const objId = mode === 'medium' ? 'OBJ-M10' : 'OBJ-H6';
    const o = obj(objId);
    const intro = `<p>The bench holds 3 data types. For each, pick the correct retention period and destruction method. ${mode === 'hard' ? 'Hard mode also asks: what overrides scheduled destruction when a legal hold is active?' : ''}</p>`;
    const body = objectiveBlock(o, retentionBoard(o, mode === 'hard'));
    return workstationShell('ws-ret', body, intro);
  }

  function retentionBoard(o, hard) {
    const saved = State.getState().objectives[o.id]?.payload || {};
    const retention = saved.retention || {};
    const destruction = saved.destruction || {};
    const holdAnswer = saved.holdAnswer || '';

    const items = Data.RETENTION_RULES.map((r) => {
      const retOpts = ['<option value="">— pick retention —</option>'].concat(
        r.options.map((o) => `<option value="${esc(o)}" ${retention[r.id] === o ? 'selected' : ''}>${esc(o)}</option>`)
      ).join('');
      const destOpts = ['<option value="">— pick destruction —</option>'].concat(
        r.destructionOptions.map((o) => `<option value="${esc(o)}" ${destruction[r.id] === o ? 'selected' : ''}>${esc(o)}</option>`)
      ).join('');
      return `
        <li class="atelier-card ret-item">
          <div class="atelier-serif forest">${esc(r.dataType)}</div>
          <p class="muted small mb-2">Regulation: ${esc(r.regulation)}</p>
          <div class="grid-2">
            <div><label class="muted small mb-1" for="ret-${esc(r.id)}">Retention</label><select id="ret-${esc(r.id)}" class="atelier-focus" data-action="ret-set-retention" data-rid="${esc(r.id)}">${retOpts}</select></div>
            <div><label class="muted small mb-1" for="des-${esc(r.id)}">Destruction method</label><select id="des-${esc(r.id)}" class="atelier-focus" data-action="ret-set-destruction" data-rid="${esc(r.id)}">${destOpts}</select></div>
          </div>
        </li>`;
    }).join('');

    const holdBlock = hard ? `
      <div class="atelier-card mt-3">
        <label class="muted small mb-1" for="hold-ans">If a legal hold exists on a data type, what overrides the scheduled destruction? (one short sentence)</label>
        <input id="hold-ans" type="text" class="atelier-focus" data-action="ret-set-hold" value="${esc(holdAnswer)}" placeholder="e.g. The legal hold overrides scheduled destruction for all data types until released.">
      </div>` : '';

    return `<ul class="ret-list">${items}</ul>${holdBlock}${checkResults(o)}`;
  }

  // --------------------------------------------------------------------------
  // Knowledge Check Quiz
  // --------------------------------------------------------------------------
  function quizPanel(mode) {
    const questions = Data.QUIZ.filter((q) => q.mode === mode);
    const answered = State.getState().quiz.answered;
    const correctCount = questions.filter((q) => answered[q.id]?.correct).length;
    const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

    const items = questions.map((q, i) => {
      const chosen = answered[q.id]?.index;
      const isAnswered = chosen !== undefined;
      const isCorrect = isAnswered && chosen === q.correctIndex;

      const opts = q.options.map((opt, idx) => {
        const isChosen = chosen === idx;
        const isCorrectOpt = idx === q.correctIndex;
        // R3: ONLY selected option gets green/red.
        let cls = 'neutral';
        if (isAnswered && isChosen && isCorrectOpt) cls = 'ok';
        else if (isAnswered && isChosen && !isCorrectOpt) cls = 'no';
        const icon = isAnswered && isChosen && isCorrectOpt ? ICONS.checkCircle(14)
                   : isAnswered && isChosen && !isCorrectOpt ? ICONS.xCircle(14) : '';
        return `<li><button type="button" class="quiz-opt atelier-focus ${cls} ${isAnswered ? 'locked' : ''}" data-action="quiz-answer" data-qid="${esc(q.id)}" data-idx="${idx}" ${isAnswered ? 'disabled aria-disabled="true"' : ''} aria-pressed="${isChosen}">
          <span class="mono small forest shrink-0">${String.fromCharCode(65 + idx)}</span>
          <span class="flex-1">${esc(opt)}</span>
          ${icon ? icon : ''}
        </button></li>`;
      }).join('');

      const statusPill = isAnswered
        ? (isCorrect ? `<span class="atelier-pill ok">${ICONS.checkCircle(12)} Correct</span>` : `<span class="atelier-pill no">${ICONS.xCircle(12)} Incorrect</span>`)
        : '';

      const feedback = isAnswered ? `
        <div class="quiz-feedback atelier-serif">
          <div class="atelier-stamp brass mb-1">${ICONS.lightbulb(11)} Explanation</div>
          ${esc(q.explanation)}
        </div>` : '';

      return `
        <li class="atelier-card quiz-item">
          <div class="quiz-item-head"><span class="atelier-pill muted">Q${i + 1}</span>${pillarBadge(q.pillar)}${statusPill}</div>
          <p class="atelier-serif quiz-question">${esc(q.question)}</p>
          <ul class="quiz-opts">${opts}</ul>
          ${feedback}
        </li>`;
    }).join('');

    return `
      <section class="atelier-card workstation scroll-mt-4" id="ws-quiz" aria-labelledby="quiz-title">
        <div class="workstation-icon-row">
          <span class="workstation-icon brass-bg" aria-hidden="true">${ICONS.brain(18)}</span>
          <div>
            <div class="atelier-stamp sienna">Knowledge Check</div>
            <h2 class="atelier-serif workstation-title" id="quiz-title">${mode === 'medium' ? 'Concept Quiz' : 'Architect Scenario Quiz'}</h2>
            <p class="muted small">${mode === 'medium' ? '5–7 concept questions. Pick the best answer; an explanation follows each.' : '7 scenario-based questions that require application, not recall. Choose carefully — your first answer is scored.'}</p>
          </div>
        </div>
        <div class="quiz-progress mb-4">
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width: ${pct}%"></div></div>
          <span class="quiz-progress-text forest">${correctCount} / ${questions.length}</span>
        </div>
        <ol class="quiz-list">${items}</ol>
      </section>`;
  }

  // --------------------------------------------------------------------------
  // Debrief / Field Notes
  // --------------------------------------------------------------------------
  function debriefSection() {
    const detectList = Data.DEBRIEF.detectionOpportunities.map((d) => `
      <li><div class="atelier-stamp forest">${esc(d.source)}</div><div><b>Signal:</b> ${esc(d.signal)}</div><div class="muted"><b>Action:</b> ${esc(d.action)}</div></li>`).join('');
    const mitList = Data.DEBRIEF.mitigationRecommendations.map((m) => `
      <li><div>${esc(m.text)}</div><div class="muted small atelier-stamp brass">Ref: ${esc(m.ref)}</div></li>`).join('');
    const blueList = Data.DEBRIEF.blueTeamTakeaways.map((t) => `<li>${esc(t)}</li>`).join('');
    const redList = Data.DEBRIEF.redTeamMindsetTakeaways.map((t) => `<li>${esc(t)}</li>`).join('');
    const links = Data.DEBRIEF.officialLinks.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="atelier-link">${esc(l.label)} ${ICONS.externalLink(11)}</a></li>`).join('');

    return `
      <section class="atelier-card workstation scroll-mt-4" id="ws-debrief" aria-labelledby="debrief-title">
        <div class="workstation-icon-row">
          <span class="workstation-icon forest-2-bg" aria-hidden="true">${ICONS.notebookPen(18)}</span>
          <div>
            <div class="atelier-stamp sienna">Field Notes</div>
            <h2 class="atelier-serif workstation-title" id="debrief-title">Debrief</h2>
            <p class="muted small">What a defender takes away from this lab — detection opportunities, mitigation recommendations, blue-team and red-team takeaways, and official references.</p>
          </div>
        </div>
        <div class="grid-2-lg debrief-grid">
          <article class="atelier-card debrief-card"><div class="atelier-stamp forest mb-2 debrief-icon-row">${ICONS.swordAlert(14)} Detection opportunities</div><ul class="debrief-list">${detectList}</ul></article>
          <article class="atelier-card debrief-card"><div class="atelier-stamp sienna mb-2 debrief-icon-row">${ICONS.swordAlert(14)} Mitigation recommendations</div><ul class="debrief-list">${mitList}</ul></article>
          <article class="atelier-card debrief-card"><div class="atelier-stamp sage mb-2 debrief-icon-row">${ICONS.lightbulb(14)} Blue-team takeaways</div><ul class="disc debrief-list">${blueList}</ul></article>
          <article class="atelier-card debrief-card"><div class="atelier-stamp crimson mb-2 debrief-icon-row">${ICONS.swordAlert(14)} Red-team mindset takeaways</div><ul class="disc debrief-list">${redList}</ul></article>
        </div>
        <div class="atelier-card paper2 mt-4 debrief-links"><div class="atelier-stamp forest mb-2 debrief-icon-row">${ICONS.bookMarked(12)} Official references</div><ul class="grid-2-sm debrief-link-list">${links}</ul></div>
      </section>`;
  }

  // --------------------------------------------------------------------------
  // Studio layout (main render)
  // --------------------------------------------------------------------------
  function studioLayout(mode) {
    const brief = `
      <section class="atelier-card scenario-briefing" aria-labelledby="scenario-title">
        <div class="atelier-stamp sienna mb-1">Scenario Briefing</div>
        <h2 class="atelier-serif scenario-title" id="scenario-title">Meridian Health Finance — Your First Day as Junior GRC Analyst</h2>
        <p class="mt-2 atelier-serif brief-text">You have just been hired as the first Junior GRC Analyst at Meridian Health Finance — a fictional fintech-health hybrid company that finances patient medical treatments, issues prepaid health cards, serves EU customers, and operates a federal health-subsidy platform on behalf of HHS. Meridian filed for an IPO last quarter. The CCO, <b>Eleanor Reyes</b>, has walked you to your drafting table in the Atelier and said: "Build me a compliance program that satisfies every obligation we have. Document the gaps. Recommend fixes."</p>
        <p class="mt-2 atelier-serif brief-text">${mode === 'medium'
          ? 'In Apprentice mode you will be guided workstation-by-workstation through the seven drafting tables. Use hints freely. Every check explains why your answer is right or wrong.'
          : 'In Architect mode every workstation is unlocked from the start. You receive a noisy scenario dossier with red herrings. Near-misses are explicitly rejected. Use the optional nudge only as a last resort — it costs score.'}</p>
        <div class="grid-3 mt-3 small">
          <div class="atelier-card paper2 brief-meta"><div class="atelier-stamp forest">Certification</div><div>CompTIA Security+ SY0-801</div></div>
          <div class="atelier-card paper2 brief-meta"><div class="atelier-stamp forest">Lesson</div><div>5.4 — Support security compliance and privacy considerations</div></div>
          <div class="atelier-card paper2 brief-meta"><div class="atelier-stamp forest">Framing</div><div>Synthetic data · defensive · educational</div></div>
        </div>
      </section>`;

    const stations = [
      regulatoryWstation(mode),
      frameworkWstation(mode),
      mode === 'medium' ? classificationWstation(mode) : '',
      privacyWstation(mode),
      personnelWstation(mode),
      vendorWstation(mode),
      auditWstation(mode),
      penaltyWstation(mode),
      retentionWstation(mode),
      inventoryWstation(mode),
    ].filter(Boolean).join('');

    const progress = State.getProgress(mode);
    const done = progress.correct === progress.total && progress.total > 0;

    const exitBlock = `
      <div class="atelier-card exit-block ${done ? 'done' : ''}">
        <div>
          <div class="atelier-stamp sienna">Atelier exit</div>
          <div class="atelier-serif exit-text">${done ? 'All objectives complete.' : `${progress.correct} / ${progress.total} objectives complete.`}</div>
          ${done ? `<p class="muted small mt-1">View your score, star rating, and pillar recap.</p>` : ''}
        </div>
        <div class="exit-controls">
          <button type="button" class="btn ${done ? 'btn-primary' : 'btn-outline'} atelier-focus" data-action="open-completion" ${!done ? 'disabled' : ''}>${done ? 'View completion ★' : 'View completion'}</button>
          <button type="button" class="btn btn-outline atelier-focus" data-action="reset-confirm">Reset progress</button>
        </div>
      </div>`;

    return brief + stations + quizPanel(mode) + debriefSection() + exitBlock;
  }

  // --------------------------------------------------------------------------
  // Hero / Mode picker
  // --------------------------------------------------------------------------
  function hero(hasProgress) {
    const progressNote = hasProgress ? `
      <div class="hero-progress-row">
        <span class="atelier-serif italic forest small">Your saved progress will be restored when you pick a mode.</span>
        <button type="button" class="btn btn-outline atelier-focus" data-action="reset-confirm">Reset all progress</button>
      </div>` : '';

    return `
      <section class="hero atelier-paper" aria-labelledby="atelier-hero-title">
        <div class="hero-inner">
          <div class="atelier-stamp sienna mb-4 hero-stamp">${ICONS.scale(14)} Meridian Health Finance · GRC Atelier · Lesson 5.4</div>
          <h1 class="atelier-serif hero-title forest" id="atelier-hero-title">The Compliance Architect's Atelier</h1>
          <p class="atelier-serif hero-sub">You are the newly-hired Junior GRC Analyst at Meridian Health Finance — a fictional fintech-health hybrid that handles patient data, prepaid cards, EU customers, and a federal platform, all post-IPO. Your task: design and operate a compliance program that satisfies <span class="forest bold">HIPAA</span>, <span class="forest bold">GLBA</span>, <span class="forest bold">SOX</span>, <span class="forest bold">GDPR</span>, <span class="forest bold">PCI DSS</span>, and federal frameworks end-to-end.</p>
          <div class="hero-meta">
            <div class="atelier-pill muted">${ICONS.bookOpen(12)} CompTIA Security+ SY0-801 · Lesson 5.4</div>
            <div class="atelier-pill muted">${ICONS.shield(12)} All synthetic data · defensive framing only</div>
          </div>
          <h2 class="atelier-serif hero-mode-title forest mt-8 mb-3">${ICONS.scrollText(18)} Choose a drafting mode</h2>
          <div class="mode-card-grid">
            ${modeCard('medium', 'Apprentice · Medium', '10–12 granular objectives · guided progression', 'forest', [
              'Guided progression through 7 workstations in pedagogical order.',
              'Tiered hints (3 levels) freely available; using them only costs stars.',
              'Tolerant validation — synonyms accepted, teaching feedback on every check.',
              'Best for first exposure to the material (Bloom: Understand / Apply).',
            ])}
            ${modeCard('hard', 'Architect · Hard', '9 broad multi-step challenges · free-roam studio', 'sienna', [
              'All workstations unlocked from the start; minimal guidance.',
              'No hints by default — one optional nudge per objective that visibly costs score.',
              'Strict validation — exact IDs, multi-part answers, near-misses explicitly rejected.',
              'Two red herrings in the audit evidence vault. Best for evaluation (Bloom: Analyze / Evaluate / Create).',
            ])}
          </div>
          ${progressNote}
        </div>
      </section>`;
  }

  function modeCard(mode, title, subtitle, tone, bullets) {
    const cls = tone === 'forest' ? 'forest' : 'sienna';
    return `
      <button type="button" class="mode-card ${cls} atelier-focus" data-action="pick-mode" data-mode="${esc(mode)}" aria-label="Start ${esc(title)} mode">
        <div class="atelier-stamp mb-2 ${cls}">${tone === 'forest' ? 'Apprentice track' : 'Architect track'}</div>
        <div class="atelier-serif mode-card-title forest">${esc(title)}</div>
        <div class="muted small mb-3">${esc(subtitle)}</div>
        <ul class="mode-card-bullets">${bullets.map((b) => `<li><span class="brass mt-1" aria-hidden="true">▸</span><span>${esc(b)}</span></li>`).join('')}</ul>
      </button>`;
  }

  // --------------------------------------------------------------------------
  // Objectives rail (right sidebar)
  // --------------------------------------------------------------------------
  function objectivesRail() {
    const mode = State.getState().mode;
    if (!mode) return '';
    const progress = State.getProgress(mode);
    const objs = State.objectivesForMode(mode);

    // group by workstation
    const byWs = {};
    const wsOrder = [];
    for (const o of objs) {
      if (!byWs[o.workstation]) { byWs[o.workstation] = []; wsOrder.push(o.workstation); }
      byWs[o.workstation].push(o);
    }

    // stats
    let firstTry = 0, withHints = 0;
    for (const o of objs) {
      const s = State.getState().objectives[o.id];
      if (s?.status === 'correct') {
        if (s.attempts === 1 && s.hintsUsed === 0) firstTry++;
        else withHints++;
      }
    }
    const totalCorrect = firstTry + withHints;
    const ratio = totalCorrect === 0 ? 0 : (firstTry + 0.5 * withHints) / totalCorrect;
    const stars = totalCorrect === 0 ? 0 : ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;

    const wsItems = wsOrder.map((wsId) => {
      const meta = wsMeta(wsId);
      const list = byWs[wsId].map((o) => {
        const s = State.getState().objectives[o.id];
        const status = s?.status || 'pending';
        const icon = status === 'correct' ? ICONS.checkCircle(14)
                   : status === 'incorrect' ? ICONS.alert(14)
                   : ICONS.x(14);
        const iconCls = status === 'correct' ? 'sage' : status === 'incorrect' ? 'crimson' : 'muted-rule';
        const hintPill = s && s.hintsUsed > 0 ? `<span class="atelier-pill warn">${ICONS.lightbulb(10)} ${s.hintsUsed} hint${s.hintsUsed > 1 ? 's' : ''}</span>` : '';
        return `
          <li class="rail-obj">
            <a href="#${esc(o.id)}" class="rail-obj-link atelier-focus">
              <span class="rail-obj-icon ${iconCls}">${icon}</span>
              <span class="rail-obj-body">
                <span class="muted small rail-obj-id">${esc(o.id)}</span>
                <span class="rail-obj-title">${esc(o.title)}</span>
                <span class="rail-obj-pills mt-1">${pillarBadge(o.pillar)}${hintPill}</span>
              </span>
            </a>
          </li>`;
      }).join('');
      return `<div class="rail-ws"><div class="atelier-stamp forest mb-1">${esc(meta.label)}</div><ul class="rail-obj-list">${list}</ul></div>`;
    }).join('');

    return `
      <aside class="atelier-card objectives-rail" aria-label="Objectives tracker">
        <div>
          <div class="atelier-stamp sienna">${mode === 'medium' ? 'Apprentice · Objectives' : 'Architect · Objectives'}</div>
          <div class="atelier-serif rail-title forest mt-1">Studio Progress</div>
          <div class="rail-progress mt-2"><div class="rail-progress-bar" style="width: ${progress.pct}%"></div></div>
          <div class="muted small mt-1">${progress.correct} of ${progress.total} objectives complete · ${progress.pct}%</div>
        </div>
        <div class="atelier-card paper2 rail-stats">
          <div class="rail-stars">
            ${[1, 2, 3].map((n) => `<span class="rail-star ${n <= stars ? 'filled' : ''}">${ICONS.star(18)}</span>`).join('')}
          </div>
          <span class="muted small">${firstTry} perfect · ${withHints} with hints</span>
        </div>
        <nav class="rail-nav" aria-label="Workstation objectives">${wsItems}</nav>
        <button type="button" class="btn btn-outline atelier-focus rail-reset" data-action="reset-confirm">${ICONS.x(12)} Reset all progress</button>
      </aside>`;
  }

  // --------------------------------------------------------------------------
  // Completion modal (with R8 focus areas + R7 ESC listener)
  // --------------------------------------------------------------------------
  function completionModal(open) {
    const mode = State.getState().mode;
    if (!mode || !open) return '';

    const objs = State.objectivesForMode(mode);
    const byPillar = { P1: { total: 0, correct: 0 }, P2: { total: 0, correct: 0 }, P3: { total: 0, correct: 0 }, P4: { total: 0, correct: 0 } };
    let firstTry = 0, withHints = 0;
    for (const o of objs) {
      const s = State.getState().objectives[o.id];
      byPillar[o.pillar].total++;
      if (s?.status === 'correct') {
        byPillar[o.pillar].correct++;
        if (s.attempts === 1 && s.hintsUsed === 0) firstTry++;
        else withHints++;
      }
    }
    const correct = firstTry + withHints;
    const total = objs.length;
    const ratio = correct === 0 ? 0 : (firstTry + 0.5 * withHints) / correct;
    const stars = correct === 0 ? 0 : ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    const scorePct = total ? Math.round((correct / total) * 100) : 0;

    const quizAnswered = Object.values(State.getState().quiz.answered);
    const quizCorrect = quizAnswered.filter((a) => a.correct).length;
    const quizTotal = quizAnswered.length;

    // R8: focus areas derived from actual performance
    const PILLAR_GUIDANCE = {
      P1: 'Re-read the regulatory map and the definitions of due diligence, due care, attestation, and CCO in the glossary.',
      P2: 'Re-do the Classification Bench and the Data Inventory Map workstations; practice distinguishing PII vs PHI vs financial data.',
      P3: 'Re-do the Audit Evidence Vault and review the framework selection logic; the "Detect" pillar here is compliance monitoring.',
      P4: 'Re-do the Privacy Request Desk, Personnel Lifecycle Board, Vendor Risk Wall, and Retention Bench in order.',
    };
    const focusAreas = [];
    for (const o of objs) {
      const s = State.getState().objectives[o.id];
      if (!s) continue;
      if (s.status === 'incorrect') {
        focusAreas.push({ kind: 'objective', label: `${o.id} — ${o.title}`, detail: `Still incorrect after ${s.attempts} attempt${s.attempts > 1 ? 's' : ''}.`, guidance: o.feedbackOk });
      } else if (s.status === 'correct' && (s.hintsUsed > 0 || s.attempts > 1)) {
        focusAreas.push({ kind: 'objective', label: `${o.id} — ${o.title}`, detail: `Passed with ${s.hintsUsed} hint${s.hintsUsed === 1 ? '' : 's'} and ${s.attempts} attempt${s.attempts > 1 ? 's' : ''}.`, guidance: 'Review the underlying concept so you can answer it first-try next time.' });
      }
    }
    const modeQuestions = Data.QUIZ.filter((q) => q.mode === mode);
    for (const q of modeQuestions) {
      const ans = State.getState().quiz.answered[q.id];
      if (ans && !ans.correct) {
        const shortQ = q.question.length > 60 ? q.question.slice(0, 60) + '…' : q.question;
        focusAreas.push({ kind: 'quiz', label: `Quiz ${q.id.replace('q-', 'Q')} — ${shortQ}`, detail: 'Answered incorrectly.', guidance: q.explanation });
      }
    }
    for (const [p, c] of Object.entries(byPillar)) {
      if (c.total > 0 && c.correct < c.total) {
        focusAreas.push({ kind: 'pillar', label: `${p} · ${PILLAR_LABEL_4(p)} pillar — ${c.correct}/${c.total} objectives complete`, detail: `${c.total - c.correct} objective${c.total - c.correct > 1 ? 's' : ''} in this pillar need${c.total - c.correct === 1 ? 's' : ''} attention.`, guidance: PILLAR_GUIDANCE[p] });
      }
    }

    const focusHtml = focusAreas.length > 0 ? `
      <div class="atelier-card modal-focus mb-3 sienna-border-l">
        <div class="atelier-stamp sienna mb-2">${ICONS.target(11)} Focus areas — where to study more</div>
        <p class="muted small mb-2">Derived from your actual attempts, hint usage, and quiz answers.</p>
        <ul class="focus-list">
          ${focusAreas.map((fa) => `
            <li class="focus-item">
              <div class="focus-item-head">
                <span class="atelier-pill ${fa.kind === 'objective' ? 'p2' : fa.kind === 'quiz' ? 'p3' : 'p1'}">${esc(fa.kind)}</span>
                <span class="atelier-serif forest focus-item-label">${esc(fa.label)}</span>
              </div>
              <div class="muted small mt-1">${esc(fa.detail)}</div>
              <div class="small italic mt-1"><b>Next:</b> ${esc(fa.guidance)}</div>
            </li>`).join('')}
        </ul>
      </div>` : `
      <div class="atelier-card modal-focus mb-3 sage-border-l">
        <div class="atelier-stamp sage mb-1">${ICONS.target(11)} Focus areas</div>
        <p class="small">No focus areas flagged — you completed every objective first-try with no hints and answered every quiz question correctly. Consider trying ${mode === 'medium' ? 'Architect (Hard)' : 'a deeper certification like CySA+'} next.</p>
      </div>`;

    const pillarRecap = Object.entries(byPillar).map(([p, c]) => `
      <li class="pillar-recap-item">
        ${pillarBadge(p)}
        <span class="muted small">${c.correct} / ${c.total} complete</span>
      </li>`).join('');

    const quizBlock = quizTotal > 0 ? `
      <div class="atelier-card paper2 mb-3 modal-quiz">
        <div class="atelier-stamp forest mb-2">${ICONS.sparkles(11)} Knowledge check</div>
        <div class="small">${quizCorrect} / ${quizTotal} correct (${quizTotal ? Math.round((quizCorrect / quizTotal) * 100) : 0}%)</div>
      </div>` : '';

    const nextSteps = mode === 'medium' ? `
      <li>Try <b>Architect (Hard)</b> mode for scenario-based objectives with strict validation and red herrings.</li>
      <li>Read the official NIST CSF 2.0 — Meridian's chosen primary framework.</li>
      <li>Skim the GDPR articles cited (Art. 5, 17, 24, 28, 30) — they anchor every privacy decision.</li>` : `
      <li>Move to SY0-801 <b>Lesson 5.5</b> (Security awareness and training) — it directly extends the personnel lifecycle.</li>
      <li>Take a deeper dive into <b>NIST SP 800-53</b> control families (AC, AU, RA, PS) referenced throughout this lab.</li>
      <li>Practice <b>vendor risk assessments</b> on real-world SOC 2 reports — every page should map to a control family.</li>`;

    return `
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="completion-title" data-action="modal-close-backdrop">
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <div class="atelier-stamp sienna mb-1">${ICONS.trophy(12)} Atelier Completion</div>
              <h2 class="atelier-serif modal-title forest" id="completion-title">${mode === 'medium' ? 'Apprentice' : 'Architect'} Studio Complete</h2>
            </div>
            <button type="button" class="modal-x atelier-focus" data-action="modal-close" aria-label="Close completion dialog">${ICONS.x(18)}</button>
          </div>
          <div class="modal-stats">
            <div class="modal-stars" aria-label="${stars} of 3 stars">${[1, 2, 3].map((n) => `<span class="modal-star ${n <= stars ? 'filled' : ''}">${ICONS.star(32)}</span>`).join('')}</div>
            <div class="modal-score">${scorePct}%</div>
            <div class="muted small">${correct} / ${total} objectives · ${firstTry} perfect · ${withHints} with hints</div>
          </div>
          <div class="atelier-card paper2 modal-pillar-recap mb-3">
            <div class="atelier-stamp forest mb-2">Recap by mastery pillar</div>
            <ul class="grid-2 modal-pillar-list">${pillarRecap}</ul>
          </div>
          ${quizBlock}
          ${focusHtml}
          <div class="atelier-card modal-next">
            <div class="atelier-stamp sienna mb-2">Where to go next</div>
            <ul class="disc small modal-next-list">${nextSteps}</ul>
          </div>
          <div class="modal-controls">
            <button type="button" class="btn btn-outline atelier-focus" data-action="modal-close">Back to studio</button>
            <button type="button" class="btn btn-primary atelier-focus" data-action="modal-reset">Reset all progress</button>
          </div>
        </div>
      </div>`;
  }

  function PILLAR_LABEL_4(p) {
    return { P1: 'Understand', P2: 'Recognize / Analyze', P3: 'Detect', P4: 'Mitigate' }[p] || p;
  }

  // Expose
  global.AtelierWorkstations = {
    hero, studioLayout, objectivesRail, completionModal,
    // exposed for re-render of just-check-results after a check:
    checkResults,
  };
})(window);
