// ── Cloud Ward · examination bay instruments ──────────────────────────────────
// Faithful port of src/components/lab/instruments.tsx into 8 builder functions.
// Each builder receives a fresh container per bay activation (matching the
// original's React unmount semantics: local state resets on bay switch).
(function (global) {
  'use strict';

  const D = global.CW_DATA;
  const U = global.CW_UI;
  const store = global.CW_store;
  const act = global.CW_actions;
  const el = U.el;
  const icon = U.icon;

  const inputCls = 'input-cls';
  const selCls = 'input-cls sel-cls';

  function label(text, cls) { return U.wardLabel(text, cls); } // returns an element

  function card(attrs, children) {
    return el('section', Object.assign({ class: 'card' }, attrs || {}), children);
  }

  function cardHead(iconName, title) {
    return el('div', { class: 'card-head' }, [
      el('span', { class: 'card-head-icon teal', html: icon(iconName, 16) }),
      el('div', { class: 'card-title serif', text: title }),
    ]);
  }

  // ══ 1. WARD MAP ═══════════════════════════════════════════════════════════
  function wardBay(root) {
    const s = store.get();
    const mode = s.mode;
    const fixed = s.env.batchFix;
    const list = D.wardPatients(fixed);
    const m1 = (s.answers.m1 && typeof s.answers.m1 === 'object') ? s.answers.m1 : {};
    const m2 = (s.answers.m2 && typeof s.answers.m2 === 'object') ? s.answers.m2 : {};
    const m3 = (s.answers.m3 && typeof s.answers.m3 === 'object') ? s.answers.m3 : {};
    const h1 = (s.answers.h1 && typeof s.answers.h1 === 'object') ? s.answers.h1 : {};
    let openDoc = null; // local state, resets on bay switch (React parity)

    // Rounds intake — concept check
    const intake = card(null, [
      cardHead('Stethoscope', 'Rounds intake — concept check'),
      el('div', {}, [label('Monitoring or observability? (6 statements)', 'mt3 mb1')]),
    ]);

    D.M1_ITEMS.forEach(function (it) {
      const row = el('div', { class: 'rounded-box' }, [
        el('p', { class: 'stmt-text', text: '“' + it.text + '”' }),
        el('div', { html: U.segRow('m1-' + it.id, 'Classify: ' + it.text, [{ value: 'monitoring', label: 'Monitoring' }, { value: 'observability', label: 'Observability' }], m1[it.id], 'sm') }),
      ]);
      intake.appendChild(row);
    });

    intake.appendChild(label('Pillar intake — sort 4 raw samples', 'mt4 mb1'));
    D.M2_ITEMS.forEach(function (it) {
      const row = el('div', { class: 'rounded-box' }, [
        el('p', { class: 'mono stmt-text', text: it.text }),
        el('div', { class: 'split-between' }, [
          el('span', { class: 'kind-caption', text: it.kind }),
          el('div', { html: U.segRow('m2-' + it.id, 'Pillar of: ' + it.text, [{ value: 'metrics', label: 'Metrics' }, { value: 'logs', label: 'Logs' }, { value: 'traces', label: 'Traces' }], m2[it.id], 'sm') }),
        ]),
      ]);
      intake.appendChild(row);
    });
    root.appendChild(intake);

    U.wireSegs(intake, function (group, value) {
      const parts = group.split('-');
      if (parts[0] === 'm1') act.setAnswerField('m1', parts[1], value);
      if (parts[0] === 'm2') act.setAnswerField('m2', parts[1], value);
    });

    // Patient cards
    const grid = el('div', { class: 'patient-grid' });
    list.forEach(function (p, i) {
      const flagged = m3.svc === p.id;
      const cardEl = card({ class: 'patient-card fade-up' + (flagged ? ' patient-flagged' : '') }, [
        el('div', { class: 'split-between' }, [
          el('div', {}, [
            el('div', {}, [label('Bed ' + String(i + 1).padStart(2, '0'))]),
            el('div', { class: 'mono patient-name', text: p.label }),
            el('div', { class: 'patient-role', text: p.role }),
          ]),
          el('div', { html: U.statusChip(p.status) }),
        ]),
        el('div', { class: 'vitals-grid' }, [
          ['CPU', p.vitals.cpu + '%'], ['MEM', p.vitals.mem + '%'], ['p95', p.vitals.p95 + 'ms'], ['err', p.vitals.err + '%'],
        ].map(function (kv) {
          return el('div', { class: 'vital-tile' }, [
            el('div', { class: 'vital-k', text: kv[0] }),
            el('div', { class: 'mono vital-v', text: kv[1] }),
          ]);
        })),
        el('div', { html: U.spark(p.spark, { baseline: p.baseline, color: p.status === 'critical' ? '#B91C1C' : '#0E7C6B', incidentFrom: p.status === 'critical' ? 16 : undefined }) }),
        el('p', { class: 'patient-note', text: p.note }),
      ]);
      const flagBtn = el('button', {
        type: 'button',
        'aria-pressed': flagged ? 'true' : 'false',
        class: 'flag-btn' + (flagged ? ' flag-active' : ''),
        text: flagged ? 'Flagged as deviating patient' : 'Flag as deviating patient',
        onclick: function () {
          act.setAnswerField('m3', 'svc', p.id);
          // patch the grid in place (aria-pressed + ring highlight), like React re-render
          grid.querySelectorAll('.flag-btn').forEach(function (b) {
            const on = b === flagBtn;
            b.classList.toggle('flag-active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.textContent = on ? 'Flagged as deviating patient' : 'Flag as deviating patient';
            const pc = b.closest('.patient-card');
            if (pc) pc.classList.toggle('patient-flagged', on);
          });
        },
      });
      cardEl.appendChild(flagBtn);
      grid.appendChild(cardEl);
    });
    root.appendChild(grid);

    // Evidence folder
    const evCard = card(null, [
      el('div', { class: 'card-head' }, [
        el('span', { class: 'card-head-icon teal', html: icon('FolderOpen', 16) }),
        el('div', { class: 'card-title serif', text: 'Evidence folder' }),
        el('span', { class: 'ev-hint', text: '(open both documents before filing a night-shift verdict)' }),
      ]),
    ]);
    const docBtns = {};
    const docs = {
      runbook: {
        title: 'Runbook — scheduled jobs', icon: 'BookOpenCheck',
        text: 'RUNBOOK §4.2 — ORDERS-DB MAINTENANCE\n· Nightly snapshot job: 02:00–02:10 window, stream-formatted, peak disk I/O ≈ 90 MB/s (expected).\n· Do NOT page on disk I/O alarms inside the snapshot window. Annotate dashboards.\n· Escalate only if I/O persists > 30 min past window end, or outside the window entirely.',
        strong: ['02:00–02:10 window'],
      },
      calendar: {
        title: 'Change calendar — CHG-1187', icon: 'CalendarClock',
        text: 'CHANGE CHG-1187 · Recurring · approved by Storage on-call\norders-db snapshot 02:00 nightly · owner: dba-oncall@nimbuscart.example\nlast 14 executions: success ×14, mean duration 7 m 42 s, peak I/O 88–95 MB/s.\nNext window: tonight 02:00. No overlap with the 09:00–10:00 flash sale.',
        strong: ['Recurring'],
      },
    };
    const docWrap = el('div', { class: 'ev-docs-grid' });
    const docPanels = el('div', {});

    Object.keys(docs).forEach(function (key) {
      const d = docs[key];
      const opened = (Array.isArray(h1.evidence) ? h1.evidence : []).indexOf(key) !== -1;
      const btn = el('button', {
        type: 'button',
        'aria-expanded': 'false',
        class: 'ev-btn' + (opened ? ' ev-open' : ''),
        onclick: function () {
          openDoc = openDoc === key ? null : key;
          act.addEvidence(key); // atomic append (fixes-ledger QA-12)
          refreshDocs();
        },
      }, [
        el('span', { class: 'ev-btn-label', html: icon(d.icon, 15) + '<span>' + d.title + '</span>' }),
        el('span', { class: 'ev-chevron', html: icon('ChevronDown', 15) }),
      ]);
      docBtns[key] = btn;
      docWrap.appendChild(btn);
    });

    function refreshDocs() {
      Object.keys(docBtns).forEach(function (k) {
        const on = openDoc === k;
        const evidence = (store.get().answers.h1 && Array.isArray(store.get().answers.h1.evidence)) ? store.get().answers.h1.evidence : [];
        docBtns[k].classList.toggle('ev-open', evidence.indexOf(k) !== -1);
        docBtns[k].setAttribute('aria-expanded', on ? 'true' : 'false');
        docBtns[k].querySelector('.ev-chevron').classList.toggle('rot-180', on);
      });
      docPanels.innerHTML = '';
      if (openDoc && docs[openDoc]) {
        const d = docs[openDoc];
        const pre = el('div', { class: 'doc-mono' });
        d.text.split('\n').forEach(function (line, li) {
          const row = el('div', {});
          let htmlLine = U.esc(line);
          d.strong.forEach(function (sPart) { htmlLine = htmlLine.replace(U.esc(sPart), '<strong>' + U.esc(sPart) + '</strong>'); });
          row.innerHTML = htmlLine;
          if (li < d.text.split('\n').length - 1) row.appendChild(document.createElement('br'));
          pre.appendChild(row);
        });
        docPanels.appendChild(pre);
      }
    }
    evCard.appendChild(docWrap);
    evCard.appendChild(docPanels);

    if (mode === 'hard') {
      const filing = el('div', { class: 'rounded-box mt4' }, [
        label('File the night-shift verdict (both docs must be open)', 'mb2'),
        el('div', { class: 'form-grid-2' }, [
          el('div', {}, [
            label('Verdict', 'mb1'),
            el('div', { html: U.segRow('h1-verdict', 'Spike verdict', [{ value: 'benign', label: 'benign — scheduled' }, { value: 'incident', label: 'active incident' }], h1.verdict, 'sm') }),
          ]),
          el('div', {}, [
            label('Action', 'mb1'),
            el('div', { html: U.segRow('h1-action', 'Filing action', [{ value: 'close', label: 'close as known-change' }, { value: 'page', label: 'open incident & page' }], h1.action, 'sm') }),
          ]),
        ]),
      ]);
      evCard.appendChild(filing);
      U.wireSegs(filing, function (group, value) {
        act.setAnswerField('h1', group === 'h1-verdict' ? 'verdict' : 'action', value);
      });
    }
    refreshDocs();
    root.appendChild(evCard);
  }

  // ══ 2. CHART REVIEW ═══════════════════════════════════════════════════════
  function chartsBay(root) {
    const s = store.get();
    const env = s.env;
    const m4 = (s.answers.m4 && typeof s.answers.m4 === 'object') ? s.answers.m4 : {};
    const m6 = (s.answers.m6 && typeof s.answers.m6 === 'object') ? s.answers.m6 : {};
    let sel = 'checkout_p95';  // local state (React parity)
    let svc = 'all';
    let levels = ['ERROR', 'WARN'];

    const SERIES = {
      checkout_p95: function () { return D.checkoutP95(store.get().env.poolFix, store.get().env.batchFix, store.get().env.scaleFix); },
      payment_p95: function () { return D.paymentP95; },
      gateway_cpu: function () { return D.gatewayCpu; },
      checkout_err: function () { return D.checkoutErrRate; },
      orders_diskio: function () { return D.ordersDiskIO; },
      req_rate: function () { return D.saleReqRate; },
      capacity: function () { return D.capacityTrend; },
    };

    // Vitals monitor
    const chartHost = el('div', { class: 'chart-host' });
    const diskNote = el('div', { class: 'mt2', hidden: true, html: U.docNote('Spike window is <strong>02:00</strong>, every night. Cross-check Chart review logs at 02:00 and the evidence folder in the Ward map.') });
    const fixNote = el('div', { class: 'fix-note mt2', hidden: true });
    function renderChart() {
      const st = store.get();
      const series = SERIES[sel]();
      U.mountVitalsChart(chartHost, series, { slo: sel === 'checkout_p95' ? 800 : undefined });
      diskNote.hidden = sel !== 'orders_diskio';
      fixNote.hidden = !(st.env.batchFix && sel === 'checkout_p95');
      if (st.env.batchFix && sel === 'checkout_p95') {
        fixNote.innerHTML = '<span class="teal-text">' + icon('CheckCircle2', 14) + '</span> Post-treatment trace: p95 back under the 800 ms SLO.';
      }
    }
    const seriesOpts = [
      { value: 'checkout_p95', label: 'Checkout p95' },
      { value: 'payment_p95', label: 'payment p95' },
      { value: 'gateway_cpu', label: 'gateway CPU' },
      { value: 'checkout_err', label: '5xx rate' },
      { value: 'orders_diskio', label: 'db disk I/O' },
      { value: 'req_rate', label: 'request rate' },
      { value: 'capacity', label: 'capacity trend' },
    ];
    const monitorCard = card(null, [
      el('div', { class: 'split-between wrap' }, [
        el('div', { class: 'card-head' }, [
          el('span', { class: 'card-head-icon teal', html: icon('Activity', 16) }),
          el('div', { class: 'card-title serif', text: 'Vitals monitor' }),
        ]),
        el('div', { html: U.segRow('series', 'Select metric series', seriesOpts, sel, 'sm') }),
      ]),
      chartHost,
      diskNote,
      fixNote,
    ]);
    root.appendChild(monitorCard);
    U.wireSegs(monitorCard, function (group, value) {
      if (group === 'series') { sel = value; renderChart(); }
    });
    renderChart();

    // Aggregated log stream
    const partialBadge = el('span', { class: 'partial-badge', text: '⚠ Partial stream — logs are scattered on hosts. Enable central aggregation in Records desk.' });
    const logList = el('div', { class: 'log-list', role: 'log', 'aria-label': 'Log stream' });
    function renderLogs() {
      const st = store.get();
      const aggregated = st.env.aggregation === 'central';
      partialBadge.hidden = aggregated;
      const visible = D.LOGS.filter(function (l) {
        return (svc === 'all' || l.service === svc) &&
          levels.indexOf(l.level) !== -1 &&
          (aggregated || ['api-gateway', 'storefront-web'].indexOf(l.service) !== -1);
      });
      logList.innerHTML = '';
      if (visible.length === 0) {
        logList.appendChild(el('div', { class: 'log-empty', text: 'No entries match the current filters.' }));
      }
      visible.forEach(function (l) {
        const row = el('div', { class: 'log-line' });
        row.innerHTML =
          '<span class="log-ts">' + U.esc(l.ts) + '</span> ' +
          '<span class="log-level lv-' + l.level + '">' + U.esc(l.level.padEnd(5)) + '</span> ' +
          '<span class="log-svc">' + U.esc(l.service) + '</span> ' +
          '<span class="log-msg">' + U.esc(l.msg) + '</span>' +
          (l.fields ? '<span class="log-fields"> · ' + U.esc(l.fields) + '</span>' : '');
        logList.appendChild(row);
      });
    }
    const svcSelect = el('select', { class: selCls + ' svc-select', 'aria-label': 'Filter by service', onchange: function () { svc = this.value; renderLogs(); } });
    svcSelect.appendChild(el('option', { value: 'all', text: 'All services' }));
    ['api-gateway', 'storefront-web', 'cart-svc', 'inventory-svc', 'payment-svc', 'orders-db', 'cache-redis', 'marketing-tracker'].forEach(function (sv) {
      svcSelect.appendChild(el('option', { value: sv, text: sv }));
    });
    const levelWrap = el('div', { class: 'level-chips' });
    const levelBtns = {};
    ['ERROR', 'WARN', 'INFO', 'DEBUG'].forEach(function (lv) {
      const b = el('button', {
        type: 'button',
        'aria-pressed': levels.indexOf(lv) !== -1 ? 'true' : 'false',
        class: 'level-chip lv-' + lv + (levels.indexOf(lv) !== -1 ? ' chip-on' : ' chip-off'),
        text: lv,
        onclick: function () {
          const i = levels.indexOf(lv);
          if (i !== -1) levels.splice(i, 1); else levels.push(lv);
          b.classList.toggle('chip-on', levels.indexOf(lv) !== -1);
          b.classList.toggle('chip-off', levels.indexOf(lv) === -1);
          b.setAttribute('aria-pressed', levels.indexOf(lv) !== -1 ? 'true' : 'false');
          renderLogs();
        },
      });
      levelBtns[lv] = b;
      levelWrap.appendChild(b);
    });
    root.appendChild(card(null, [
      el('div', { class: 'split-between wrap' }, [
        el('div', { class: 'card-head' }, [
          el('span', { class: 'card-head-icon teal', html: icon('ScrollText', 16) }),
          el('div', { class: 'card-title serif', text: 'Aggregated log stream' }),
        ]),
        partialBadge,
      ]),
      el('div', { class: 'filter-row' }, [
        el('span', { class: 'muted-icon', html: icon('Filter', 14) }),
        svcSelect,
        levelWrap,
      ]),
      logList,
    ]));
    renderLogs();

    // Case intake
    const codeInput = el('input', { class: inputCls, 'aria-label': 'Payment failure error code', placeholder: 'e.g. ABC-0000', value: String(m4.code == null ? '' : m4.code), oninput: function () { act.setAnswerField('m4', 'code', this.value); } });
    const poolInput = el('input', { class: inputCls, 'aria-label': 'Pool occupancy', placeholder: 'e.g. 0/10', value: String(m4.pool == null ? '' : m4.pool), oninput: function () { act.setAnswerField('m4', 'pool', this.value); } });
    const caseCard = card(null, [
      el('div', { class: 'card-head' }, [
        el('span', { class: 'card-head-icon teal', html: icon('FileText', 16) }),
        el('div', { class: 'card-title serif', text: 'Case intake — read the charts, file the finding' }),
      ]),
      el('div', { class: 'form-grid-2 mt3' }, [
        el('div', {}, [label('Payment failure error code (from the structured log field)', 'mb1'), codeInput]),
        el('div', {}, [label('Pool occupancy at failure (e.g. n/n in use)', 'mb1'), poolInput]),
      ]),
      el('div', { class: 'rounded-box mt4' }, [
        label('Deviation verdict — orders-db nightly spike', 'mb2'),
        el('div', { class: 'form-grid-2' }, [
          el('div', {}, [
            label('Which metric deviates from baseline?', 'mb1'),
            el('div', { html: U.segRow('m6-metric', 'Deviating metric', [{ value: 'cpu', label: 'CPU' }, { value: 'mem', label: 'Memory' }, { value: 'diskio', label: 'Disk I/O' }, { value: 'net', label: 'Network' }], m6.metric, 'sm') }),
          ]),
          el('div', {}, [
            label('Classification', 'mb1'),
            el('div', { html: U.segRow('m6-kind', 'Deviation classification', [{ value: 'scheduled', label: 'scheduled change' }, { value: 'incident', label: 'active incident' }], m6.kind, 'sm') }),
          ]),
        ]),
      ]),
    ]);
    root.appendChild(caseCard);
    U.wireSegs(caseCard, function (group, value) {
      if (group === 'm6-metric') act.setAnswerField('m6', 'metric', value);
      if (group === 'm6-kind') act.setAnswerField('m6', 'kind', value);
    });
  }

  // ══ 3. IMAGING SUITE ══════════════════════════════════════════════════════
  function imagingBay(root) {
    const s = store.get();
    const mode = s.mode;
    const m5 = (s.answers.m5 && typeof s.answers.m5 === 'object') ? s.answers.m5 : {};
    const h2 = (s.answers.h2 && typeof s.answers.h2 === 'object') ? s.answers.h2 : {};
    let which = 'slow';
    let selSpan = null;

    const spanKey = { s1: 'gateway', s2: 'cart', s3: 'inventory', s4: 'payment', s5: 'payment-pool', s6: 'db-insert', s7: 'orders-db', h1: 'gateway', h2: 'cart', h3: 'inventory', h4: 'payment', h5: 'payment-pool', h6: 'orders-db' };

    const traceHeader = el('div', { class: 'trace-header mono' });
    const spanList = el('div', { class: 'span-list', role: 'list', 'aria-label': 'Trace spans' });
    const detail = el('div', {});

    function renderTrace() {
      const trace = which === 'slow' ? D.MAIN_TRACE : D.HEALTHY_TRACE;
      traceHeader.innerHTML =
        'trace_id=<span class="strong-ink">' + U.esc(trace.id) + '</span> · ' + U.esc(trace.name) + ' · root <span class="strong-ink">' + trace.rootMs + ' ms</span> · status ' +
        '<span class="' + (trace.status === 'degraded' ? 'strong-ink crimson' : 'strong-ink green') + '">' + trace.status + '</span>';
      spanList.innerHTML = '';
      detail.innerHTML = '';
      trace.spans.forEach(function (sp) {
        const left = (sp.startMs / trace.rootMs) * 100;
        const width = Math.max(1.2, (sp.durMs / trace.rootMs) * 100);
        const slow = sp.durMs / trace.rootMs > 0.5;
        const rowBtn = el('button', {
          type: 'button',
          role: 'listitem',
          class: 'span-row' + (selSpan === sp.id ? ' span-selected' : ''),
          'aria-label': sp.service + ' ' + sp.op + ', ' + sp.durMs + ' milliseconds',
          onclick: function () {
            selSpan = sp.id;
            act.setAnswerField('m5', 'span', spanKey[sp.id]);
            renderTrace();
            renderDetail();
          },
        });
        rowBtn.innerHTML =
          '<span class="span-svc mono" style="padding-left:' + (sp.depth * 10) + 'px">' + U.esc(sp.service) + '</span>' +
          '<span class="span-track">' +
            '<span class="span-bar' + (slow ? ' span-slow' : '') + (sp.repeated ? ' span-repeated' : '') + '" style="left:' + left.toFixed(1) + '%;width:' + width.toFixed(1) + '%"></span>' +
            '<span class="span-dur mono" style="left:calc(' + Math.min(left + width, 92).toFixed(1) + '% + 4px)">' + sp.durMs + ' ms' + (sp.repeated ? ' ×' + sp.repeated : '') + '</span>' +
          '</span>';
        spanList.appendChild(rowBtn);
      });
      if (selSpan) renderDetail();
    }

    function renderDetail() {
      const trace = which === 'slow' ? D.MAIN_TRACE : D.HEALTHY_TRACE;
      const sp = trace.spans.find(function (x) { return x.id === selSpan; });
      detail.innerHTML = '';
      if (!sp) return;
      detail.appendChild(el('div', { class: 'span-detail fade-in' }, [
        el('div', { class: 'mono strong-ink', text: sp.service + ' · ' + sp.op }),
        el('div', { class: 'mono span-meta', html: 'start +' + sp.startMs + ' ms · duration <strong class="strong-ink">' + sp.durMs + ' ms</strong>' + (sp.repeated ? ' · repeats ×' + sp.repeated + ' (hatched)' : '') }),
        sp.self ? el('div', { class: 'span-obs', text: 'Observation: ' + sp.self }) : null,
      ]));
    }

    const durInput = el('input', { type: 'number', class: inputCls, 'aria-label': 'Slowest span duration in milliseconds', placeholder: 'e.g. 240', value: String(m5.dur == null ? '' : m5.dur), oninput: function () { act.setAnswerField('m5', 'dur', Number(this.value)); } });

    const imagingCard = card(null, [
      el('div', { class: 'split-between wrap' }, [
        el('div', { class: 'card-head' }, [
          el('span', { class: 'card-head-icon teal', html: icon('GitBranch', 16) }),
          el('div', { class: 'card-title serif', text: 'Imaging suite — span waterfall' }),
        ]),
        el('div', { html: U.segRow('trace-which', 'Select trace', [{ value: 'slow', label: 'Exhibit trace (09:06)' }, { value: 'healthy', label: 'Baseline sample' }], which, 'sm') }),
      ]),
      traceHeader,
      spanList,
      detail,
      el('div', { class: 'mt3' }, [label('Report the slowest span’s duration (ms)', 'mb1'), durInput]),
    ]);
    root.appendChild(imagingCard);
    U.wireSegs(imagingCard, function (group, value) {
      if (group === 'trace-which') { which = value; selSpan = null; renderTrace(); }
    });
    renderTrace();

    if (mode === 'hard') {
      const svcSel = el('select', { class: selCls, 'aria-label': 'Culprit service', onchange: function () { act.setAnswerField('h2', 'service', this.value); } });
      [['', 'select…'], ['gateway', 'api-gateway'], ['cart', 'cart-svc'], ['inventory', 'inventory-svc'], ['payment', 'payment-svc'], ['orders-db', 'orders-db']].forEach(function (o) {
        const opt = el('option', { value: o[0], text: o[1] });
        if (String(h2.service || '') === o[0]) opt.setAttribute('selected', '');
        svcSel.appendChild(opt);
      });
      const countIn = el('input', { type: 'number', class: inputCls, 'aria-label': 'Repeated span count', placeholder: 'count', value: String(h2.count == null ? '' : h2.count), oninput: function () { act.setAnswerField('h2', 'count', Number(this.value)); } });
      const tidIn = el('input', { class: inputCls, 'aria-label': 'Exhibit trace id', placeholder: 'trace_id', value: String(h2.traceId == null ? '' : h2.traceId), oninput: function () { act.setAnswerField('h2', 'traceId', this.value); } });
      const causeSel = el('select', { class: selCls, 'aria-label': 'Root cause class', onchange: function () { act.setAnswerField('h2', 'cause', this.value); } });
      [['', 'select…'], ['n1', 'N+1 query access pattern'], ['db', 'Undersized database server'], ['net', 'Network latency between services'], ['agent', 'Broken tracing agent']].forEach(function (o) {
        const opt = el('option', { value: o[0], text: o[1] });
        if (String(h2.cause || '') === o[0]) opt.setAttribute('selected', '');
        causeSel.appendChild(opt);
      });
      root.appendChild(card(null, [
        el('div', { class: 'rounded-box' }, [
          label('Root-cause report — file the full diagnosis', 'mb2'),
          el('div', { class: 'form-grid-2' }, [
            el('div', {}, [label('Culprit service', 'mb1'), svcSel]),
            el('div', {}, [label('Repeated db.query span count (the N+1 signature)', 'mb1'), countIn]),
            el('div', {}, [label('Exhibit trace id (from the header or log fields)', 'mb1'), tidIn]),
            el('div', {}, [label('Root-cause class', 'mb1'), causeSel]),
          ]),
        ]),
      ]));
    }

    root.appendChild(el('div', { class: 'mt3', html: U.docNote('A ' + U.glossaryTip('trace') + ' is the X-ray of one request: every bar is a ' + U.glossaryTip('span') + '. The hatched bar repeats 47 times — count it. Trace id comes from the header (and from <code>err_code=PAY-5033</code> log fields).') }));
  }

  // ══ 4. TRIAGE BOARD ═══════════════════════════════════════════════════════
  function triageBay(root) {
    const mode = store.get().mode;
    const alerts = mode === 'hard' ? D.HARD_ALERTS : D.MEDIUM_ALERTS;

    root.appendChild(el('div', { class: 'card-head plain' }, [
      el('span', { class: 'card-head-icon teal', html: icon('Stethoscope', 16) }),
      el('div', { class: 'card-title serif', html: 'Triage board <span class="tri-count">— ' + alerts.length + ' alerts awaiting disposition</span>' }),
    ]));

    const wrap = el('div', { class: 'space-y3' });
    alerts.forEach(function (a) {
      const triage = mode === 'hard' ? store.get().env.hardTriage : store.get().env.triage;
      const fired = a.startedMin < 60 ? a.startedMin + ' min ago' : Math.round(a.startedMin / 60) + ' h ago';
      wrap.appendChild(card(null, [
        el('div', { class: 'alert-top' }, [
          el('div', {}, [
            el('div', { class: 'alert-id-row', html: U.sevChip(a.sev) + '<span class="mono alert-id">' + U.esc(a.id) + '</span><span class="alert-fired">· fired ' + fired + '</span>' }),
            el('div', { class: 'alert-title', text: a.title }),
            el('div', { class: 'alert-detail', text: a.detail }),
          ]),
        ]),
        el('div', { class: 'mt3' }, [
          label('Disposition', 'mb1'),
          el('div', { html: U.segRow('tri-' + a.id, 'Disposition for ' + a.id, D.DISPOSITIONS, triage[a.id], 'sm') }),
        ]),
      ]));
    });
    root.appendChild(wrap);
    U.wireSegs(wrap, function (group, value) {
      const id = group.replace('tri-', '');
      if (mode === 'hard') act.setHardTriage(id, value); else act.setTriage(id, value);
    });
  }

  // ══ 5. ALERT WORKBENCH ════════════════════════════════════════════════════
  function alertLabBay(root) {
    const mode = store.get().mode;
    const h4 = (store.get().answers.h4 && typeof store.get().answers.h4 === 'object') ? store.get().answers.h4 : {};

    // simulated pages-per-shift based on rule quality (educational model) — exact formulas
    function pagesModel() {
      if (mode === 'hard') {
        const th = Number(h4.threshold == null ? 2 : h4.threshold);
        const dur = Number(h4.dur == null ? 0 : h4.dur);
        const scoped = h4.source === 'checkout';
        const dbgOff = h4.debug === true;
        if (!scoped) return 46;
        let p = 0;
        if (th < 3) p += 18;
        if (dur < 5) p += 14;
        if (!dbgOff) p += 12;
        return p;
      }
      const r = store.get().env.alertRule;
      if (r.threshold <= 800) return r.dur === 0 ? 46 : 31;
      if (r.threshold < 1000) return r.dur >= 4 ? 9 : 17;
      if (r.threshold <= 2000) return r.dur >= 4 ? 1 : 5;
      return 0;
    }

    const preview = el('div', { class: 'rule-preview mono' });
    const barFill = el('div', { class: 'pager-fill' });
    const pagerNum = el('span', { class: 'mono pager-num' });
    const pagerCaption = el('p', { class: 'pager-caption' });
    const previewWrap = el('div', { class: 'pager-preview-box' }, [
      label('Simulated pager load last shift (rule preview)', 'mb1'),
      el('div', { class: 'pager-row' }, [
        el('div', { class: 'pager-track' }, [barFill]),
        pagerNum,
      ]),
      pagerCaption,
    ]);

    function refreshPager() {
      const p = pagesModel();
      barFill.style.width = Math.min(100, p * 2.2) + '%';
      barFill.className = 'pager-fill ' + (p > 15 ? 'fill-red' : p > 3 ? 'fill-amber' : 'fill-green');
      pagerNum.textContent = p + ' pages/shift';
      pagerNum.className = 'mono pager-num ' + (p > 15 ? 'crimson' : p > 3 ? 'amber' : 'green');
      pagerCaption.textContent = p > 15
        ? 'Alert fatigue territory — the on-call will start ignoring this rule.'
        : p > 3
          ? 'Better — but still noisy enough to erode trust.'
          : 'Tuned: rare, meaningful pages.';
    }

    const builderHost = el('div', { class: 'mt4' });
    let fields = {};

    if (mode === 'hard') {
      builderHost.appendChild(label('Scope (which service does the rule watch?)', 'mb1'));
      const scopeHost = el('div', { html: U.segRow('h4-source', 'Rule scope', [{ value: 'all', label: 'ALL services' }, { value: 'checkout', label: 'checkout only' }, { value: 'marketing', label: 'marketing-tracker only' }], h4.source) });
      builderHost.appendChild(scopeHost);
      fields.threshold = el('input', { type: 'number', min: 1, max: 20, class: inputCls, 'aria-label': 'Error rate threshold percent', value: String(h4.threshold == null ? '' : h4.threshold), oninput: function () { h4.threshold = Number(this.value); act.setAnswerField('h4', 'threshold', Number(this.value)); refresh(); } });
      fields.dur = el('input', { type: 'number', min: 0, max: 30, class: inputCls, 'aria-label': 'Duration minutes', value: String(h4.dur == null ? '' : h4.dur), oninput: function () { h4.dur = Number(this.value); act.setAnswerField('h4', 'dur', Number(this.value)); refresh(); } });
      fields.sev = el('select', { class: selCls, 'aria-label': 'Alert severity', onchange: function () { h4.sev = this.value; act.setAnswerField('h4', 'sev', this.value); refresh(); } });
      ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
        const opt = el('option', { text: p });
        if (String(h4.sev || 'P1') === p) opt.setAttribute('selected', '');
        fields.sev.appendChild(opt);
      });
      const dbg = el('input', { type: 'checkbox', role: 'switch', 'aria-label': 'Stop DEBUG collection on marketing-tracker', onchange: function () { h4.debug = this.checked; act.setAnswerField('h4', 'debug', this.checked); refresh(); } });
      dbg.checked = h4.debug === true;
      builderHost.appendChild(el('div', { class: 'form-grid-3' }, [
        el('div', {}, [label('Threshold ≥ (%)', 'mb1'), fields.threshold]),
        el('div', {}, [label('Duration ≥ (min)', 'mb1'), fields.dur]),
        el('div', {}, [label('Severity', 'mb1'), fields.sev]),
      ]));
      builderHost.appendChild(el('label', { class: 'switch-row' }, [
        el('span', { class: 'strong-ink', text: 'Stop DEBUG collection on marketing-tracker (treat at the source)' }),
        dbg,
      ]));
      function refresh() {
        const src = h4.source === 'all' || !h4.source ? '*' : String(h4.source);
        preview.textContent = 'rule: error_rate{svc=' + src + '} > ' + String(h4.threshold == null ? '?' : h4.threshold) + '% for ' + String(h4.dur == null ? '?' : h4.dur) + 'm → ' + String(h4.sev == null ? '?' : h4.sev);
        refreshPager();
      }
      U.wireSegs(scopeHost, function (g, v) { h4.source = v; act.setAnswerField('h4', 'source', v); refresh(); });
      refresh();
      root.appendChild(card(null, [
        cardHead('Radio', 'Alert workbench — rule builder'),
        el('p', { class: 'card-sub', text: 'Night shift: retune the marketing-tracker error-rate rule. Scope, threshold, duration, severity — and treat the flood at the source.' }),
        builderHost,
        preview,
        previewWrap,
      ]));
    } else {
      const r0 = store.get().env.alertRule;
      fields.metric = el('select', { class: selCls, 'aria-label': 'Alert metric', onchange: function () { act.setAlertRule({ metric: this.value }); refresh(); } });
      [['checkout_p95', 'checkout p95 latency'], ['checkout_err', 'checkout 5xx rate'], ['gateway_cpu', 'api-gateway CPU']].forEach(function (o) {
        const opt = el('option', { value: o[0], text: o[1] });
        if (r0.metric === o[0]) opt.setAttribute('selected', '');
        fields.metric.appendChild(opt);
      });
      fields.threshold = el('input', { type: 'number', min: 100, max: 5000, step: 50, class: inputCls, 'aria-label': 'Threshold milliseconds', value: r0.threshold, oninput: function () { act.setAlertRule({ threshold: Number(this.value) }); refresh(); } });
      fields.dur = el('select', { class: selCls, 'aria-label': 'Duration minutes', onchange: function () { act.setAlertRule({ dur: Number(this.value) }); refresh(); } });
      [[0, 'no window (pages instantly)'], [1, '1 min'], [2, '2 min'], [4, '4 min'], [5, '5 min'], [10, '10 min'], [15, '15 min']].forEach(function (o) {
        const opt = el('option', { value: String(o[0]), text: o[1] });
        if (String(r0.dur) === String(o[0])) opt.setAttribute('selected', '');
        fields.dur.appendChild(opt);
      });
      const sevHost = el('div', { html: U.segRow('m8-sev', 'Alert severity', [{ value: 'P1', label: 'P1 · full outage' }, { value: 'P2', label: 'P2 · act now' }, { value: 'P3', label: 'P3 · same day' }, { value: 'P4', label: 'P4 · whenever' }], r0.sev) });
      builderHost.appendChild(el('div', { class: 'form-grid-3' }, [
        el('div', {}, [label('Metric', 'mb1'), fields.metric]),
        el('div', {}, [label('Threshold (ms)', 'mb1'), fields.threshold]),
        el('div', {}, [label('Duration (min)', 'mb1'), fields.dur]),
      ]));
      builderHost.appendChild(el('div', {}, [label('Severity', 'mb1'), sevHost]));
      function refresh() {
        const r = store.get().env.alertRule;
        preview.textContent = 'rule: ' + r.metric + ' > ' + r.threshold + ' ms for ' + (r.dur === 0 ? '0 m (instant)' : r.dur + ' m') + ' → page at ' + r.sev;
        refreshPager();
      }
      U.wireSegs(sevHost, function (g, v) { act.setAlertRule({ sev: v }); refresh(); });
      refresh();
      root.appendChild(card(null, [
        cardHead('Radio', 'Alert workbench — rule builder'),
        el('p', { class: 'card-sub', text: 'Rebuild the checkout latency rule so it pages once, for real breaches, at an honest severity.' }),
        builderHost,
        preview,
        previewWrap,
      ]));
    }
  }

  // ══ 6. RECORDS DESK ═══════════════════════════════════════════════════════
  function recordsBay(root) {
    const mode = store.get().mode;

    // day readouts live at bay scope so the slider handlers can reach them
    const hotOut = el('span', { class: 'mono teal-text', text: store.get().env.retentionHot + ' days' });
    const arcOut = el('span', { class: 'mono teal-text', text: store.get().env.retentionArchive + ' days' });
    function refreshHot() { hotOut.textContent = store.get().env.retentionHot + ' days'; }
    function refreshArc() { arcOut.textContent = store.get().env.retentionArchive + ' days'; }

    const agentCard = card(null, [
      cardHead('FileText', 'Records desk — logging pipeline'),
      el('div', { class: 'records-grid' }, [
        el('div', { class: 'space-y3' }, [
          el('div', {}, [
            label('Collection — agents', 'mb1'),
            (function () {
              const rows = el('div', { class: 'space-y2' });
              [{ id: 'api-gateway', fixed: true }, { id: 'cart-svc', fixed: true }, { id: 'payment-svc', fixed: false }, { id: 'orders-db', fixed: true }].forEach(function (sv) {
                if (sv.fixed) {
                  rows.appendChild(el('label', { class: 'agent-row' }, [
                    el('span', { class: 'mono', text: sv.id }),
                    el('span', { class: 'agent-on', text: 'agent ON' }),
                  ]));
                } else {
                  const cb = el('input', { type: 'checkbox', role: 'switch', 'aria-label': 'Agent for ' + sv.id, onchange: function () { act.setEnv({ agentPayment: this.checked }); } });
                  cb.checked = store.get().env.agentPayment;
                  rows.appendChild(el('label', { class: 'agent-row' }, [
                    el('span', { class: 'mono', text: sv.id }),
                    cb,
                  ]));
                }
              });
              return rows;
            })(),
            el('p', { class: 'agent-note', html: 'The ' + U.glossaryTip('Agent') + ' ships telemetry off-host — without it, payment logs never leave the instance.' }),
          ]),
          el('div', {}, [
            label('Aggregation destination', 'mb1'),
            el('div', { html: U.segRow('aggregation', 'Aggregation destination', [{ value: 'local', label: 'local host files' }, { value: 'central', label: 'Nimbus central platform' }], store.get().env.aggregation) }),
          ]),
        ]),
        el('div', { class: 'space-y3' }, [
          el('div', {}, [
            label('Log levels', 'mb1'),
            (function () {
              const wrap = el('div', { class: 'space-y2' });
              [['payment-svc', 'logLevelPayment'], ['marketing-tracker', 'logLevelTracker']].forEach(function (pair) {
                const sel = el('select', { class: selCls + ' level-select', 'aria-label': pair[0] + ' log level', onchange: function () { const p = {}; p[pair[1]] = this.value; act.setEnv(p); } });
                ['DEBUG', 'INFO', 'WARN', 'ERROR'].forEach(function (l) {
                  const opt = el('option', { text: l });
                  if (store.get().env[pair[1]] === l) opt.setAttribute('selected', '');
                  sel.appendChild(opt);
                });
                wrap.appendChild(el('label', { class: 'level-row' }, [
                  el('span', { class: 'mono', text: pair[0] }),
                  sel,
                ]));
              });
              return wrap;
            })(),
          ]),
          el('div', {}, [
            el('div', {}, [label(U.glossaryTip('Retention') + ' policy', 'mb1')]),
            (function () {
              const box = el('div', { class: 'retention-box' });
              const hot = el('input', { type: 'range', min: 0, max: 90, step: 1, value: store.get().env.retentionHot, 'aria-label': 'Hot retention days', oninput: function () { act.setEnv({ retentionHot: Number(this.value) }); refreshHot(); } });
              const arc = el('input', { type: 'range', min: 0, max: 365, step: 5, value: store.get().env.retentionArchive, 'aria-label': 'Archive retention days', oninput: function () { act.setEnv({ retentionArchive: Number(this.value) }); refreshArc(); } });
              box.appendChild(el('label', { class: 'slider-label' }, [
                el('span', { html: 'Hot (searchable): ' }), hotOut, hot,
              ]));
              box.appendChild(el('label', { class: 'slider-label' }, [
                el('span', { html: 'Archive (cold): ' }), arcOut, arc,
              ]));
              return box;
            })(),
          ]),
        ]),
      ]),
    ]);
    U.wireSegs(agentCard, function (g, v) { if (g === 'aggregation') act.setEnv({ aggregation: v }); });
    root.appendChild(agentCard);

    if (mode === 'hard') {
      // Design board (H5)
      const designCard = card(null, [
        cardHead('Scale', 'Design board — inventory-svc v2 goes live Thursday'),
        el('p', { class: 'card-sub', html: 'Constraints: <strong>hard budget cap</strong> on ingest · <strong>SLO requires p99 visibility</strong>. Configure the whole stack.' }),
        el('div', { class: 'records-grid mt3' }, [
          el('div', { class: 'space-y3' }, [
            el('div', {}, [
              label('Collection', 'mb1'),
              el('div', { html: U.segRow('h5-collect', 'Collection method', [{ value: 'agentless', label: 'agentless (infra only)' }, { value: 'agent', label: 'agent (host + app)' }], store.get().env.h5.collect) }),
            ]),
            el('div', {}, [
              label('Log level', 'mb1'),
              el('div', { html: U.segRow('h5-level', 'Design log level', [{ value: 'DEBUG', label: 'DEBUG' }, { value: 'INFO', label: 'INFO' }, { value: 'ERROR', label: 'ERROR only' }], store.get().env.h5.level) }),
            ]),
            el('div', {}, [
              label('Sampling of high-volume signals', 'mb1'),
              (function () {
                const slider = el('input', { type: 'range', min: 0, max: 100, step: 5, value: store.get().env.h5.sampling, 'aria-label': 'Sampling percent', oninput: function () { act.setH5({ sampling: Number(this.value) }); out.textContent = this.value + '% sampled'; } });
                const out = el('div', { class: 'mono teal-text', text: store.get().env.h5.sampling + '% sampled' });
                return el('div', {}, [slider, out]);
              })(),
            ]),
          ]),
          el('div', { class: 'space-y3' }, [
            el('div', {}, [
              label('Retention', 'mb1'),
              el('div', { html: U.segRow('h5-retention', 'Design retention', [{ value: 'short', label: '7 d flat' }, { value: 'tiered', label: 'tiered hot/archive' }, { value: 'long', label: '13 mo all-hot' }], store.get().env.h5.retention) }),
            ]),
            el('div', {}, [
              label('Dashboard widgets', 'mb1'),
              (function () {
                const wrap = el('div', { class: 'space-y1' });
                D.H5_WIDGETS.forEach(function (w) {
                  const cb = el('input', { type: 'checkbox', 'aria-label': w.label, onchange: function () { act.toggleWidget(w.id); } });
                  cb.checked = store.get().env.h5.widgets.indexOf(w.id) !== -1;
                  wrap.appendChild(el('label', { class: 'widget-row' }, [cb, w.label]));
                });
                return wrap;
              })(),
            ]),
          ]),
        ]),
      ]);
      U.wireSegs(designCard, function (g, v) {
        if (g === 'h5-collect') act.setH5({ collect: v });
        if (g === 'h5-level') act.setH5({ level: v });
        if (g === 'h5-retention') act.setH5({ retention: v });
      });
      root.appendChild(designCard);

      // Retention tuner (H9)
      const ingestBar = el('div', { class: 'ingest-fill' });
      const ingestNum = el('span', { class: 'mono ingest-num' });
      function refreshIngest() {
        const h9 = store.get().env.h9;
        let c = 160;
        if (h9.debug === 'drop') c -= 60;
        if (h9.info === 'cold') c -= 25;
        if (h9.error === '365') c += 15;
        else if (h9.error === '90') c += 5;
        if (h9.sampling) c -= 8;
        ingestBar.style.width = Math.min(100, c / 1.8) + '%';
        ingestBar.className = 'ingest-fill ' + (c > 105 ? 'fill-red' : 'fill-green');
        ingestNum.textContent = c + '% of current spend';
        ingestNum.className = 'mono ingest-num ' + (c > 105 ? 'crimson' : 'green');
      }
      const groups = [
        { key: 'debug', label: 'DEBUG (tracker)', aria: 'DEBUG policy', opts: [{ value: 'keep', label: 'keep hot' }, { value: 'drop', label: 'drop at source' }], set: 'debug' },
        { key: 'info', label: 'INFO', aria: 'INFO policy', opts: [{ value: 'hot', label: 'hot' }, { value: 'cold', label: 'cold tier' }], set: 'info' },
        { key: 'error', label: 'ERROR retention', aria: 'ERROR retention', opts: [{ value: '30', label: '30 d' }, { value: '90', label: '90 d' }, { value: '365', label: '365 d' }], set: 'error' },
        { key: 'sampling', label: 'Sampling', aria: 'Sampling', opts: [{ value: 'off', label: 'off' }, { value: 'on', label: 'on' }], set: 'sampling' },
      ];
      const tunerCard = card(null, [
        cardHead('Wallet', 'Retention tuner — ingest is 60% over budget'),
        el('div', { class: 'tuner-grid mt3' }, groups.map(function (g) {
          const h9 = store.get().env.h9;
          const val = g.key === 'sampling' ? (h9.sampling ? 'on' : 'off') : String(h9[g.key]);
          return el('div', {}, [
            label(g.label, 'mb1'),
            el('div', { html: U.segRow('h9-' + g.key, g.aria, g.opts, val, 'sm') }),
          ]);
        })),
        el('div', { class: 'mt4' }, [
          label('Projected ingest vs budget', 'mb1'),
          el('div', { class: 'ingest-track' }, [ingestBar, el('div', { class: 'ingest-budget-line', 'aria-hidden': 'true' })]),
          el('div', { class: 'split-between mono ingest-meta' }, [
            ingestNum,
            el('span', { class: 'muted', text: '▎budget line (100%)' }),
          ]),
        ]),
      ]);
      U.wireSegs(tunerCard, function (g, v) {
        if (g === 'h9-debug') act.setH9({ debug: v });
        if (g === 'h9-info') act.setH9({ info: v });
        if (g === 'h9-error') act.setH9({ error: v });
        if (g === 'h9-sampling') act.setH9({ sampling: v === 'on' });
        refreshIngest();
      });
      refreshIngest();
      root.appendChild(tunerCard);
    }
  }

  // ══ 7. TREATMENT BOARD ════════════════════════════════════════════════════
  function treatmentBay(root) {
    const mode = store.get().mode;
    const m11 = (store.get().answers.m11 && typeof store.get().answers.m11 === 'object') ? store.get().answers.m11 : {};

    const p95Out = el('div', { class: 'mono p95-readout' });
    function refreshP95() {
      const e = store.get().env;
      const series = D.checkoutP95(e.poolFix, e.batchFix, e.scaleFix);
      const currentP95 = series.data[series.data.length - 1];
      p95Out.textContent = currentP95 + ' ms';
      p95Out.className = 'mono p95-readout ' + (currentP95 <= 800 ? 'green' : 'crimson');
    }

    const fixGrid = el('div', { class: 'fix-grid mt3' });
    const fixButtons = {};

    function fixCardEl(f) {
      const dead = f.id === 'cache';
      const isApplied = f.envKey ? store.get().env[f.envKey] : false;
      const cardEl = el('div', { class: 'fix-card' + (isApplied ? ' fix-applied' : dead ? ' fix-dead' : '') }, [
        el('div', { class: 'split-between' }, [
          el('div', { class: 'strong-ink fix-label', text: f.label }),
          isApplied ? el('span', { class: 'green', html: icon('CheckCircle2', 16) }) : null,
        ]),
        el('p', { class: 'fix-effect', text: f.effect }),
      ]);
      const applyBtn = el('button', {
        type: 'button',
        disabled: dead || isApplied ? true : null,
        class: 'fix-apply-btn' + (isApplied ? ' btn-applied' : dead ? ' btn-dead' : ' btn-apply'),
        text: isApplied ? 'Applied — watch the vitals' : dead ? 'Apply (simulated: refused)' : 'Apply treatment',
        onclick: dead || isApplied ? null : function () { applyFix(f.id); },
      });
      cardEl.appendChild(applyBtn);
      fixButtons[f.id] = { cardEl: cardEl, applyBtn: applyBtn };
      return cardEl;
    }

    function applyFix(id) {
      const f = D.FIXES.find(function (x) { return x.id === id; });
      if (!f || !f.envKey) return;
      const p = {};
      p[f.envKey] = true;
      act.setEnv(p);
      refreshFixes();
      refreshP95();
      refreshVerify();
    }

    function refreshFixes() {
      fixGrid.innerHTML = '';
      D.FIXES.forEach(function (f) { fixGrid.appendChild(fixCardEl(f)); });
    }
    refreshFixes();

    function refreshVerify() {
      const e = store.get().env;
      verifyBtn.disabled = !e.batchFix || e.verified ? true : null;
      verifyBtn.className = 'verify-btn' + (e.verified ? ' btn-verified' : e.batchFix ? ' btn-verify-ready' : ' btn-dead');
      verifyBtn.textContent = e.verified ? '✓ Recovery verified — p95 under SLO on the ward board' : 'Verify recovery (re-run trace + watch p95)';
    }
    const verifyBtn = el('button', { type: 'button', class: 'verify-btn', text: 'Verify recovery (re-run trace + watch p95)', onclick: function () { act.setEnv({ verified: true }); refreshVerify(); } });

    const treatmentCard = card(null, [
      el('div', { class: 'split-between wrap' }, [
        el('div', { class: 'card-head' }, [
          el('span', { class: 'card-head-icon teal', html: icon('Stethoscope', 16) }),
          el('div', { class: 'card-title serif', text: 'Treatment board — pick the therapy' }),
        ]),
        el('div', { class: 'p95-box' }, [
          label('modeled checkout p95'),
          p95Out,
        ]),
      ]),
      fixGrid,
      verifyBtn,
    ]);
    refreshP95();
    refreshVerify();
    root.appendChild(treatmentCard);

    // Capacity panel
    const capChart = el('div', { class: 'chart-host' });
    U.mountVitalsChart(capChart, D.capacityTrend, { height: 130 });
    root.appendChild(card(null, [
      cardHead('CalendarClock', 'Capacity panel — orders-db'),
      capChart,
      el('div', { class: 'cap-stats mono' }, [
        el('span', { html: 'ceiling <strong class="strong-ink">1.5 TB</strong>' }),
        el('span', { html: 'current <strong class="strong-ink">1.24 TB</strong>' }),
        el('span', { html: 'growth <strong class="strong-ink">≈8%/month</strong> (compounding)' }),
      ]),
      el('div', { class: 'form-grid-3 mt3' }, [
        el('div', {}, [label('Breach forecast (weeks)', 'mb1'), el('input', { type: 'number', min: 1, max: 52, class: inputCls, 'aria-label': 'Forecast weeks until breach', value: String(m11.weeks == null ? '' : m11.weeks), oninput: function () { act.setAnswerField('m11', 'weeks', Number(this.value)); } })]),
        (function () {
          const sel = el('select', { class: selCls, 'aria-label': 'Scaling trigger type', onchange: function () { act.setAnswerField('m11', 'trigger', this.value); } });
          [['', 'select…'], ['trending', 'triggered — trending'], ['load', 'triggered — load'], ['event', 'triggered — event'], ['scheduled', 'scheduled'], ['manual', 'manual']].forEach(function (o) {
            const opt = el('option', { value: o[0], text: o[1] });
            if (String(m11.trigger || '') === o[0]) opt.setAttribute('selected', '');
            sel.appendChild(opt);
          });
          return el('div', {}, [label('Scaling trigger', 'mb1'), sel]);
        })(),
        (function () {
          const sel = el('select', { class: selCls, 'aria-label': 'Scaling type', onchange: function () { act.setAnswerField('m11', 'type', this.value); } });
          [['', 'select…'], ['vertical', 'vertical (bigger instance)'], ['horizontal', 'horizontal (more instances)']].forEach(function (o) {
            const opt = el('option', { value: o[0], text: o[1] });
            if (String(m11.type || '') === o[0]) opt.setAttribute('selected', '');
            sel.appendChild(opt);
          });
          return el('div', {}, [label('Scaling type', 'mb1'), sel]);
        })(),
      ]),
    ]));

    if (mode === 'hard') {
      // Response sequencer (H6) — renders from the deterministic display shuffle
      const pool = el('div', { class: 'seq-pool grid-2' });
      const seqList = el('ol', { class: 'seq-list', 'aria-label': 'Response sequence' });

      function renderSeq() {
        const h6 = store.get().env.h6;
        pool.innerHTML = '';
        D.H6_DISPLAY_ORDER.map(function (id) {
          return D.H6_CARDS.find(function (c) { return c.id === id; });
        }).filter(function (c) { return c && h6.indexOf(c.id) === -1; }).forEach(function (c) {
          pool.appendChild(el('button', {
            type: 'button',
            class: 'seq-card',
            text: c.text,
            onclick: function () { act.addToH6(c.id); renderSeq(); }, // atomic add (QA-13)
          }));
        });
        seqList.innerHTML = '';
        h6.forEach(function (id, i) {
          const c = D.H6_CARDS.find(function (x) { return x.id === id; });
          if (!c) return;
          seqList.appendChild(el('li', { class: 'seq-item' }, [
            el('span', { class: 'seq-num mono', text: String(i + 1) }),
            el('span', { class: 'seq-text', text: c.text }),
            el('button', { type: 'button', class: 'seq-remove', 'aria-label': 'Remove step ' + (i + 1), text: 'remove', onclick: function () { act.removeFromH6(id); renderSeq(); } }),
          ]));
        });
        if (h6.length === 0) {
          seqList.appendChild(el('li', { class: 'seq-empty', text: 'Sequence empty — add the first step.' }));
        }
      }
      renderSeq();

      root.appendChild(card(null, [
        cardHead('ScrollText', 'Response sequencer — build the runbook'),
        el('p', { class: 'card-sub', text: 'Eight cards, five belong in the runbook, in order. Click to add; remove to re-order.' }),
        pool,
        seqList,
      ]));
    }
  }

  // ══ 8. FINANCES & SLO LEDGER (hard) ═══════════════════════════════════════
  function ledgerBay(root) {
    const h7 = (store.get().answers.h7 && typeof store.get().answers.h7 === 'object') ? store.get().answers.h7 : {};
    const h8 = (store.get().answers.h8 && typeof store.get().answers.h8 === 'object') ? store.get().answers.h8 : {};

    root.appendChild(card(null, [
      cardHead('Activity', 'Percentile ledger — the tail'),
      el('div', { class: 'stat-grid mt3' }, [
        ['avg latency', '380 ms', 'green'],
        ['p99 latency', '2600 ms', 'crimson'],
        ['traffic', '42,000 req/h', ''],
      ].map(function (s) {
        return el('div', { class: 'stat-card' }, [
          el('div', { class: 'mb1' }, [label(s[0])]),
          el('div', { class: 'mono stat-v ' + s[2], text: s[1] }),
        ]);
      })),
      el('div', { class: 'form-grid-2 mt3' }, [
        (function () {
          const sel = el('select', { class: selCls, 'aria-label': 'SLO metric choice', onchange: function () { act.setAnswerField('h7', 'metric', this.value); } });
          [['', 'select…'], ['avg', 'average latency'], ['p95', 'p95 latency'], ['p99', 'p99 latency']].forEach(function (o) {
            const opt = el('option', { value: o[0], text: o[1] });
            if (String(h7.metric || '') === o[0]) opt.setAttribute('selected', '');
            sel.appendChild(opt);
          });
          return el('div', {}, [label('Which metric guards the user experience?', 'mb1'), sel]);
        })(),
        el('div', {}, [label('Requests/hour in the tail (compute)', 'mb1'), el('input', { type: 'number', min: 0, max: 42000, class: inputCls, 'aria-label': 'Tail requests per hour', value: String(h7.cohort == null ? '' : h7.cohort), oninput: function () { act.setAnswerField('h7', 'cohort', Number(this.value)); } })]),
      ]),
    ]));

    root.appendChild(card(null, [
      cardHead('Wallet', 'SLO ledger — error budget'),
      el('div', { class: 'slo-block mono mt3', html: 'SLO: checkout availability <strong class="strong-ink">99.9%</strong> · window: <strong class="strong-ink">30-day month</strong> (= 43,200 min)<br/>budget burned this month: <strong class="crimson">38.2 min</strong> (incident + maintenance)' }),
      el('div', { class: 'form-grid-2 mt3' }, [
        el('div', {}, [label('Monthly error budget (minutes)', 'mb1'), el('input', { type: 'number', min: 0, max: 600, step: 0.1, class: inputCls, 'aria-label': 'Error budget minutes', value: String(h8.budget == null ? '' : h8.budget), oninput: function () { act.setAnswerField('h8', 'budget', Number(this.value)); } })]),
        (function () {
          const host = el('div', {});
          host.innerHTML = label('Deploy decision for today’s risky release', 'mb1') + U.segRow('h8-decision', 'Deploy decision', [{ value: 'continue', label: 'ship it' }, { value: 'freeze', label: 'freeze risky deploys' }], h8.decision);
          U.wireSegs(host, function (g, v) { act.setAnswerField('h8', 'decision', v); });
          return el('div', {}, [host]);
        })(),
      ]),
    ]));
  }

  global.CW_BAYS = {
    ward: wardBay,
    charts: chartsBay,
    imaging: imagingBay,
    triage: triageBay,
    alertlab: alertLabBay,
    records: recordsBay,
    treatment: treatmentBay,
    ledger: ledgerBay,
  };
})(this);
