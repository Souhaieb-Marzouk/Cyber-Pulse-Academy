// ─── RELEASE TRACK · ui kit (static port of components/lab/widgets+track) ─────
// Inline lucide-style SVG icons, DOM builder, evidence reader, the nine task
// widgets, the objective card and the track board — same structure, same
// classes of behavior, same accessibility affordances as the framework lab.
(function () {
  'use strict';

  const LAB = (window.LAB = window.LAB || {});
  const D = window.LAB_DATA;

  // ── dom builder ─────────────────────────────────────────────────────────────
  /** el('div', { class, text, html, attrs, events }, [children]) */
  LAB.el = function (tag, opts, children) {
    const node = document.createElement(tag);
    opts = opts || {};
    if (opts.class) node.className = opts.class;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.html !== undefined) node.innerHTML = opts.html; // trusted: icons only
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        const v = opts.attrs[k];
        if (v !== null && v !== undefined) node.setAttribute(k, v);
      });
    }
    if (opts.events) {
      Object.keys(opts.events).forEach(function (k) {
        node.addEventListener(k, opts.events[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  };

  // ── icons (lucide-style inline SVG, stroke = currentColor) ──────────────────
  const ICONS = {
    'git-branch':
      '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'book-open':
      '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'shield-check':
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'shield-alert':
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'switch-camera':
      '<path d="M3 8V6a2 2 0 0 1 2-2h2"/><path d="M17 4h2a2 2 0 0 1 2 2v2"/><path d="M21 16v2a2 2 0 0 1-2 2h-2"/><path d="M7 20H5a2 2 0 0 1-2-2v-2"/><path d="M8 12h4l2-2"/><path d="M16 12h-4l-2 2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    'file-text':
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'flask-conical':
      '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    headphones:
      '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    rocket:
      '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    wrench:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'external-link':
      '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    star:
      '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.123 2.123 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.123 2.123 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.123 2.123 0 0 0 1.597-1.16z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };

  LAB.icon = function (name, cls) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    svg.innerHTML = ICONS[name] || '';
    return svg;
  };

  LAB.pillarClass = function (pillar) {
    return 'chip-pillar ' + pillar;
  };

  LAB.resultIcon = function (result) {
    if (result === 'pass') return LAB.icon('check-circle', 'r-pass');
    if (result === 'fail') return LAB.icon('x-circle', 'r-fail');
    const dot = LAB.el('span', {
      attrs: { role: 'img', 'aria-label': 'not started', class: 'dot-idle' },
    });
    return dot;
  };

  // ── evidence reader ─────────────────────────────────────────────────────────
  function evidenceReader(docs) {
    const wrap = LAB.el('div', { class: 'evidence', attrs: { role: 'group', 'aria-label': 'Evidence documents' } });
    wrap.appendChild(LAB.el('p', { class: 'evidence-note mono', text: D.SYNTHETIC_BANNER }));
    docs.forEach(function (d) {
      const summary = LAB.el('summary', null, [
        LAB.icon('file-text'),
        LAB.el('span', { class: 'doc-title mono', text: d.title, attrs: { 'data-testid': 'doc-title-' + d.id } }),
        LAB.el('span', { class: 'doc-kind mono', text: d.kind }),
        LAB.icon('chevron-down', 'chev'),
      ]);
      const body = LAB.el('pre', { class: 'doc-body', text: d.body });
      wrap.appendChild(LAB.el('details', { class: 'doc' }, [summary, body]));
    });
    return wrap;
  }
  LAB.evidenceReader = evidenceReader;

  // ── small helpers ───────────────────────────────────────────────────────────
  function selectEl(opts) {
    // opts: {id, ariaLabel, value, placeholder, options, disabled, onChange, extraClass}
    const sel = LAB.el('select', { class: 'sel' + (opts.extraClass ? ' ' + opts.extraClass : '') });
    if (opts.id) sel.id = opts.id;
    if (opts.ariaLabel) sel.setAttribute('aria-label', opts.ariaLabel);
    sel.disabled = !!opts.disabled;
    sel.appendChild(LAB.el('option', { text: opts.placeholder, attrs: { value: '' } }));
    opts.options.forEach(function (o) {
      const label = o.sub ? o.label + ' — ' + o.sub : o.label;
      sel.appendChild(LAB.el('option', { text: label, attrs: { value: o.id } }));
    });
    sel.value = opts.value || '';
    if (opts.onChange) sel.addEventListener('change', function (e) {
      opts.onChange(e.target.value);
    });
    return sel;
  }
  LAB.selectEl = selectEl;

  // ── sequence (ordered list via move up / down) ──────────────────────────────
  function sequenceWidget(task, answer, locked, commit) {
    let order = answer && answer.order ? answer.order.slice() : task.items.map(function (i) { return i.id; });
    const byId = new Map(task.items.map(function (i) { return [i.id, i]; }));
    const root = LAB.el('div');
    const list = LAB.el('ol', { class: 'seq-list', attrs: { 'aria-label': 'Ordered items' } });

    function renderList() {
      list.replaceChildren();
      order.forEach(function (id, idx) {
        const item = byId.get(id);
        if (!item) return;
        const upBtn = LAB.el('button', {
          class: 'btn btn-icon',
          attrs: {
            type: 'button',
            'aria-label': 'Move ' + item.label + ' up',
            disabled: locked || idx === 0 ? '' : null,
          },
          events: { click: function () { move(idx, -1); } },
        });
        upBtn.appendChild(LAB.icon('arrow-up'));
        const downBtn = LAB.el('button', {
          class: 'btn btn-icon',
          attrs: {
            type: 'button',
            'aria-label': 'Move ' + item.label + ' down',
            disabled: locked || idx === order.length - 1 ? '' : null,
          },
          events: { click: function () { move(idx, 1); } },
        });
        downBtn.appendChild(LAB.icon('arrow-down'));
        list.appendChild(
          LAB.el('li', { class: 'seq-item' }, [
            LAB.el('span', { class: 'seq-num', text: String(idx + 1) }),
            LAB.el('div', { class: 'seq-main' }, [
              LAB.el('p', { class: 'seq-label', text: item.label }),
              item.sub ? LAB.el('p', { class: 'seq-sub', text: item.sub }) : null,
            ]),
            LAB.el('div', { class: 'seq-btns' }, [upBtn, downBtn]),
          ])
        );
      });
    }

    function renumber() {
      Array.prototype.forEach.call(list.children, function (li, i) {
        li.querySelector('.seq-num').textContent = String(i + 1);
      });
    }

    function move(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= order.length) return;
      const tmp = order[idx];
      order[idx] = order[target];
      order[target] = tmp;
      commit(function (latest) {
        const next = { t: 'sequence', order: order.slice() };
        if (task.extra) next.extra = (latest && latest.extra) || '';
        return next;
      });
      renderList(); // re-render keeps disabled edge states correct
      renumber();
    }

    renderList();
    root.appendChild(list);

    if (task.extra) {
      const extraSelect = selectEl({
        ariaLabel: task.extra.label,
        value: (answer && answer.extra) || '',
        placeholder: 'Select the missing control',
        options: task.extra.options,
        disabled: locked,
        onChange: function (v) {
          commit(function () {
            return { t: 'sequence', order: order.slice(), extra: v };
          });
        },
      });
      root.appendChild(
        LAB.el('div', { class: 'extra-box' }, [
          LAB.el('label', { class: 'field-label mono', text: task.extra.label }),
          extraSelect,
        ])
      );
    }
    return root;
  }

  // ── assign (dropdown per item; seeded shuffle hides the pairing) ────────────
  function assignWidget(task, answer, locked, commit) {
    const map = (answer && answer.map) || {};
    const bucketById = new Map(task.buckets.map(function (b) { return [b.id, b]; }));
    const items = LAB.shufflePairingItems(
      task.items,
      task.correct,
      task.buckets,
      task.items.map(function (i) { return i.id; }).join('|')
    );
    const root = LAB.el('div', { class: 'space-list' });
    items.forEach(function (item) {
      const chosen = bucketById.get(map[item.id] || '');
      const sel = selectEl({
        ariaLabel: 'Assign: ' + item.label.slice(0, 60),
        value: map[item.id] || '',
        placeholder: chosen ? chosen.label : 'File under…',
        options: task.buckets,
        disabled: locked,
        onChange: function (v) {
          commit(function (latest) {
            const nextMap = Object.assign({}, (latest && latest.map) || {});
            nextMap[item.id] = v;
            return { t: 'assign', map: nextMap };
          });
        },
      });
      root.appendChild(
        LAB.el('div', { class: 'assign-item' }, [
          LAB.el('p', { class: 'assign-prompt', text: item.label }),
          sel,
        ])
      );
    });
    return root;
  }

  // ── choice (single-select cards) ────────────────────────────────────────────
  function choiceWidget(task, answer, locked, commit) {
    let value = answer ? answer.value : '';
    const root = LAB.el('div', {
      class: 'choice-list',
      attrs: { role: 'radiogroup', 'aria-label': 'Options' },
    });
    function paint() {
      Array.prototype.forEach.call(root.children, function (btn) {
        const on = btn.getAttribute('data-opt') === value;
        btn.classList.toggle('selected', on);
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }
    task.options.forEach(function (o) {
      const btn = LAB.el('button', {
        class: 'opt-card',
        attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', disabled: locked ? '' : null, 'data-opt': o.id },
        events: {
          click: function () {
            if (locked) return;
            value = o.id;
            commit(function () {
              return { t: 'choice', value: o.id };
            });
            paint();
          },
        },
      }, [
        LAB.el('p', { class: 'opt-label', text: o.label }),
        o.sub ? LAB.el('p', { class: 'opt-sub', text: o.sub }) : null,
      ]);
      root.appendChild(btn);
    });
    paint();
    return root;
  }

  // ── multiselect (checkbox cards) ────────────────────────────────────────────
  function multiSelectWidget(task, answer, locked, commit) {
    let values = answer && answer.values ? answer.values.slice() : [];
    const root = LAB.el('div');
    if (task.evidence) root.appendChild(evidenceReader(task.evidence));
    const list = LAB.el('div', { class: 'factor-list', attrs: { role: 'group', 'aria-label': 'Select all that apply' } });
    task.options.forEach(function (o) {
      const cbx = LAB.el('input', {
        class: 'cbx',
        attrs: { type: 'checkbox', 'aria-label': o.label, disabled: locked ? '' : null },
        events: {
          change: function () {
            commit(function (latest) {
              const base = (latest && latest.values) || [];
              values = cbx.checked ? base.concat([o.id]) : base.filter(function (v) { return v !== o.id; });
              return { t: 'multiselect', values: values };
            });
            item.classList.toggle('checked', cbx.checked);
          },
        },
      });
      const item = LAB.el('label', { class: 'ms-item' + (locked ? ' locked' : '') }, [cbx, LAB.el('span', { class: 'ms-text', text: o.label })]);
      if (values.includes(o.id)) {
        cbx.checked = true;
        item.classList.add('checked');
      }
      list.appendChild(item);
    });
    root.appendChild(list);
    return root;
  }

  // ── code fix (choose the compliant patch) ───────────────────────────────────
  function codeFixWidget(task, answer, locked, commit) {
    const parts = (answer && answer.parts) || {};
    const root = LAB.el('div', { class: 'space-list' });
    task.parts.forEach(function (p) {
      const card = LAB.el('div', { class: 'codefix-part' });
      card.appendChild(LAB.el('p', { class: 'codefix-caption mono', text: p.caption }));

      const codeBlock = LAB.el('pre', { class: 'code-block' });
      p.code.split('\n').forEach(function (line, i) {
        const lineEl = LAB.el('span', { class: 'code-line' + (p.flawLine === i + 1 ? ' flaw' : '') });
        lineEl.appendChild(LAB.el('span', { class: 'ln', text: String(i + 1) }));
        lineEl.appendChild(document.createTextNode(line));
        codeBlock.appendChild(lineEl);
      });
      card.appendChild(codeBlock);

      const current = parts[p.id] || {};
      const fixList = LAB.el('div', { class: 'fix-list', attrs: { role: 'radiogroup', 'aria-label': 'Fix options for ' + p.caption } });
      function paintFix() {
        Array.prototype.forEach.call(fixList.children, function (btn) {
          const on = btn.getAttribute('data-opt') === (parts[p.id] || {}).fix;
          btn.classList.toggle('selected', on);
          btn.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      }
      p.options.forEach(function (o) {
        const btn = LAB.el('button', {
          class: 'fix-opt',
          attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', disabled: locked ? '' : null, 'data-opt': o.id },
          events: {
            click: function () {
              if (locked) return;
              commit(function (latest) {
                const pp = (latest && latest.parts) || {};
                pp[p.id] = { fix: o.id, tool: (pp[p.id] || {}).tool };
                return { t: 'codefix', parts: pp };
              });
              paintFix();
            },
          },
        }, [
          LAB.el('p', { class: 'opt-label', text: o.label }),
          LAB.el('pre', { class: 'fix-snippet', text: o.snippet }),
        ]);
        fixList.appendChild(btn);
      });
      paintFix();
      card.appendChild(fixList);

      if (p.toolOptions && p.toolLabel) {
        const toolSel = selectEl({
          id: 'tool-' + p.id,
          ariaLabel: p.toolLabel,
          value: current.tool || '',
          placeholder: 'Select the tool',
          options: p.toolOptions,
          disabled: locked,
          onChange: function (v) {
            commit(function (latest) {
              const pp = (latest && latest.parts) || {};
              pp[p.id] = { fix: (pp[p.id] || {}).fix || '', tool: v };
              return { t: 'codefix', parts: pp };
            });
          },
        });
        card.appendChild(
          LAB.el('div', { class: 'tool-box' }, [
            LAB.el('label', { class: 'field-label violet mono', text: p.toolLabel, attrs: { for: 'tool-' + p.id } }),
            toolSel,
          ])
        );
      }
      root.appendChild(card);
    });
    return root;
  }

  // ── triage (evidence + exact selects) ───────────────────────────────────────
  function triageWidget(task, answer, locked, commit) {
    const map = (answer && answer.map) || {};
    const root = LAB.el('div');
    root.appendChild(evidenceReader(task.evidence));
    const list = LAB.el('div', { class: 'space-list' });
    task.selects.forEach(function (s) {
      list.appendChild(
        LAB.el('div', { class: 'tri-item' }, [
          LAB.el('label', { class: 'tri-label', text: s.label, attrs: { for: 'tri-' + s.id } }),
          selectEl({
            id: 'tri-' + s.id,
            ariaLabel: s.label,
            value: map[s.id] || '',
            placeholder: 'Select…',
            options: s.options,
            disabled: locked,
            onChange: function (v) {
              commit(function (latest) {
                const nextMap = Object.assign({}, (latest && latest.map) || {});
                nextMap[s.id] = v;
                return { t: 'triage', map: nextMap };
              });
            },
          }),
        ])
      );
    });
    root.appendChild(list);
    return root;
  }

  // ── SCA verdict (report + verdict + risk factors) ───────────────────────────
  function scaWidget(task, answer, locked, commit) {
    let verdict = (answer && answer.verdict) || '';
    let factors = answer && answer.factors ? answer.factors.slice() : [];
    const root = LAB.el('div', { class: 'space-list-lg' });

    const report = LAB.el('div', { class: 'sca-report' });
    const head = LAB.el('div', { class: 'sca-head' });
    const title = LAB.el('p', { class: 'sca-head-title mono' });
    title.appendChild(document.createTextNode('SCA REPORT — '));
    title.appendChild(LAB.el('span', { class: 'pkg', text: task.report.name }));
    title.appendChild(LAB.el('span', { class: 'ver', text: ' v' + task.report.version }));
    head.appendChild(title);
    head.appendChild(LAB.el('span', { class: 'scan-tag mono', text: 'SCANNER' }));
    report.appendChild(head);
    report.appendChild(LAB.el('p', { class: 'sca-ctx', text: task.report.context }));
    const table = LAB.el('table', { class: 'sca-table' });
    const tbody = LAB.el('tbody');
    task.report.rows.forEach(function (r) {
      tbody.appendChild(
        LAB.el('tr', null, [
          LAB.el('td', { class: 'sca-field', text: r.field }),
          LAB.el('td', { class: 'sca-value' + (r.flag === 'bad' ? ' bad' : r.flag === 'good' ? ' good' : ''), text: r.value }),
        ])
      );
    });
    table.appendChild(tbody);
    report.appendChild(table);
    root.appendChild(report);

    const verdictGrid = LAB.el('div', { class: 'verdict-grid', attrs: { role: 'radiogroup', 'aria-label': 'Verdict' } });
    function paintVerdict() {
      Array.prototype.forEach.call(verdictGrid.children, function (btn) {
        const on = btn.getAttribute('data-opt') === verdict;
        btn.classList.toggle('selected', on);
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }
    task.verdictOptions.forEach(function (v) {
      const btn = LAB.el('button', {
        class: 'opt-card',
        attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', disabled: locked ? '' : null, 'data-opt': v.id },
        events: {
          click: function () {
            if (locked) return;
            verdict = v.id;
            commit(function (latest) {
              return { t: 'sca', verdict: verdict, factors: (latest && latest.factors) || [] };
            });
            paintVerdict();
          },
        },
      }, [
        LAB.el('p', { class: 'verdict-label mono', text: v.label }),
        v.sub ? LAB.el('p', { class: 'verdict-sub', text: v.sub }) : null,
      ]);
      verdictGrid.appendChild(btn);
    });
    paintVerdict();
    root.appendChild(verdictGrid);

    const factorList = LAB.el('div', { class: 'factor-list', attrs: { role: 'group', 'aria-label': 'Risk factors' } });
    task.factors.forEach(function (f) {
      const cbx = LAB.el('input', {
        class: 'cbx',
        attrs: { type: 'checkbox', 'aria-label': f.label, disabled: locked ? '' : null },
        events: {
          change: function () {
            commit(function (latest) {
              const base = (latest && latest.factors) || [];
              factors = cbx.checked ? base.concat([f.id]) : base.filter(function (x) { return x !== f.id; });
              return { t: 'sca', verdict: (latest && latest.verdict) || verdict, factors: factors };
            });
            item.classList.toggle('checked', cbx.checked);
          },
        },
      });
      const item = LAB.el('label', { class: 'ms-item' + (locked ? ' locked' : '') }, [cbx, LAB.el('span', { class: 'ms-text', text: f.label })]);
      if (factors.includes(f.id)) {
        cbx.checked = true;
        item.classList.add('checked');
      }
      factorList.appendChild(item);
    });
    root.appendChild(factorList);
    return root;
  }

  // ── pipeline (place tools into gates) ───────────────────────────────────────
  function pipelineWidget(task, answer, locked, commit) {
    const slots = {};
    task.slots.forEach(function (s) {
      const saved = answer && answer.slots ? answer.slots[s.id] : null;
      slots[s.id] = saved ? saved.slice() : [];
    });
    const root = LAB.el('div');
    task.stages.forEach(function (stage, i) {
      const row = LAB.el('div', { class: 'pipe-stage' });
      const stageRow = LAB.el('div', { class: 'pipe-stage-row' }, [
        LAB.el('span', { class: 'pipe-num', text: String(i + 1) }),
        LAB.el('span', { class: 'pipe-name mono', text: stage.label }),
        LAB.el('span', { class: 'pipe-line', attrs: { 'aria-hidden': 'true' } }),
      ]);
      row.appendChild(stageRow);
      const slot = task.slots.find(function (s) { return s.afterStage === stage.id; });
      if (slot) {
        const tools = LAB.el('div', { class: 'pipe-tools' });
        task.tools.forEach(function (tool) {
          const chip = LAB.el('button', {
            class: 'tool-chip mono' + (slots[slot.id].includes(tool) ? ' on' : ''),
            attrs: { type: 'button', 'aria-pressed': slots[slot.id].includes(tool) ? 'true' : 'false', disabled: locked ? '' : null },
            events: {
              click: function () {
                commit(function (latest) {
                  const base = (latest && latest.slots) || slots;
                  const cur = base[slot.id] || [];
                  const next = cur.includes(tool) ? cur.filter(function (t) { return t !== tool; }) : cur.concat([tool]);
                  const merged = Object.assign({}, base);
                  merged[slot.id] = next;
                  slots[slot.id] = next;
                  return { t: 'pipeline', slots: merged };
                });
                chip.classList.toggle('on', slots[slot.id].includes(tool));
                chip.setAttribute('aria-pressed', slots[slot.id].includes(tool) ? 'true' : 'false');
              },
            },
          });
          chip.textContent = tool;
          tools.appendChild(chip);
        });
        row.appendChild(
          LAB.el('div', { class: 'pipe-slot', attrs: { role: 'group', 'aria-label': slot.label } }, [
            LAB.el('p', { class: 'pipe-slot-label mono', text: slot.label }),
            tools,
          ])
        );
      }
      root.appendChild(row);
    });
    return root;
  }

  // ── RTM (requirement → control → verification) ──────────────────────────────
  function rtmWidget(task, answer, locked, commit) {
    const cells = (answer && answer.cells) || {};
    const root = LAB.el('div');
    root.appendChild(LAB.el('p', { class: 'rtm-head mono', text: 'RTM — REQUIREMENT → CONTROL → VERIFICATION' }));
    task.rows.forEach(function (r) {
      const cell = cells[r.id] || {};
      const controlSel = selectEl({
        id: 'ctl-' + r.id,
        ariaLabel: 'Implementing control for ' + r.requirement,
        value: cell.control || '',
        placeholder: 'Select control…',
        options: r.controlOptions,
        disabled: locked,
        onChange: function (v) {
          commit(function (latest) {
            const base = (latest && latest.cells) || {};
            const next = Object.assign({}, base);
            next[r.id] = { control: v, test: (base[r.id] || {}).test || '' };
            return { t: 'rtm', cells: next };
          });
        },
      });
      const testSel = selectEl({
        id: 'tst-' + r.id,
        ariaLabel: 'Verifying test for ' + r.requirement,
        value: cell.test || '',
        placeholder: 'Select verification…',
        options: r.testOptions,
        disabled: locked,
        onChange: function (v) {
          commit(function (latest) {
            const base = (latest && latest.cells) || {};
            const next = Object.assign({}, base);
            next[r.id] = { control: (base[r.id] || {}).control || '', test: v };
            return { t: 'rtm', cells: next };
          });
        },
      });
      root.appendChild(
        LAB.el('div', { class: 'tri-item' }, [
          LAB.el('p', { class: 'rtm-req', text: r.requirement }),
          LAB.el('div', { class: 'rtm-grid' }, [
            LAB.el('div', null, [
              LAB.el('label', { class: 'field-label rose mono', text: 'Implementing control', attrs: { for: 'ctl-' + r.id } }),
              controlSel,
            ]),
            LAB.el('div', null, [
              LAB.el('label', { class: 'field-label violet mono', text: 'Verifying test', attrs: { for: 'tst-' + r.id } }),
              testSel,
            ]),
          ]),
        ])
      );
    });
    return root;
  }

  // ── dispatcher ──────────────────────────────────────────────────────────────
  LAB.renderTask = function (task, answer, locked, commit) {
    const effective = answer || LAB.emptyAnswer(task);
    switch (task.type) {
      case 'sequence':
        return sequenceWidget(task, effective, locked, commit);
      case 'assign':
        return assignWidget(task, effective, locked, commit);
      case 'choice':
        return choiceWidget(task, effective, locked, commit);
      case 'multiselect':
        return multiSelectWidget(task, effective, locked, commit);
      case 'codefix':
        return codeFixWidget(task, effective, locked, commit);
      case 'triage':
        return triageWidget(task, effective, locked, commit);
      case 'sca':
        return scaWidget(task, effective, locked, commit);
      case 'pipeline':
        return pipelineWidget(task, effective, locked, commit);
      case 'rtm':
        return rtmWidget(task, effective, locked, commit);
    }
    return LAB.el('div');
  };

  // ── objective card (widget + hints + check + feedback) ──────────────────────
  // R2: once CHECK RESULTS has been pressed, the submitted answer is locked —
  // no active control may edit an already-checked answer. A failed objective
  // offers RETRY ATTEMPT, which starts a fresh attempt instead of editing.
  LAB.objectiveCard = function (objective, state, hardMode, handlers, nextLabel) {
    const passed = state.result === 'pass';
    const failed = state.result === 'fail';
    const checked = state.result !== null;
    const hints = hardMode ? objective.hints.slice(0, 1) : objective.hints;

    const card = LAB.el('section', {
      class: 'obj-card' + (passed ? ' pass' : failed ? ' fail' : ''),
      attrs: {
        'aria-label': 'Objective ' + objective.id + ': ' + objective.title,
        'data-objective': objective.id,
      },
    });

    const head = LAB.el('header', { class: 'obj-head' }, [
      LAB.el('span', { class: 'chip-id mono', text: objective.id }),
      LAB.el('span', { class: LAB.pillarClass(objective.pillar), text: objective.pillar }),
      LAB.el('h3', { class: 'obj-title', text: objective.title }),
    ]);
    if (passed) {
      const badge = LAB.el('span', { class: 'cleared-badge mono' });
      badge.appendChild(LAB.icon('check-circle'));
      badge.appendChild(document.createTextNode(' CLEARED'));
      head.appendChild(badge);
    }
    card.appendChild(head);

    card.appendChild(LAB.el('p', { class: 'obj-sentence', text: objective.sentence }));
    card.appendChild(
      LAB.renderTask(objective.task, state.answer, checked, function (patch) {
        handlers.onAnswerPatch(objective.id, patch);
      })
    );

    const actions = LAB.el('div', { class: 'obj-actions' });
    if (!checked) {
      actions.appendChild(
        LAB.el('button', {
          class: 'btn btn-emerald-solid',
          text: 'CHECK RESULTS',
          attrs: { type: 'button' },
          events: { click: function () { handlers.onCheck(objective.id); } },
        })
      );
    }
    if (failed) {
      const retry = LAB.el('button', {
        class: 'btn btn-rose-outline',
        text: ' RETRY ATTEMPT',
        attrs: {
          type: 'button',
          'aria-label': 'Retry attempt for ' + objective.id + ' — starts a fresh answer',
        },
        events: { click: function () { handlers.onRetry(objective.id); } },
      });
      retry.insertBefore(LAB.icon('rotate-ccw'), retry.firstChild);
      actions.appendChild(retry);
    }
    if (!passed && hints.length > 0) {
      const hintBtn = LAB.el('button', {
        class: 'btn btn-hint',
        text: state.hintsUsed >= hints.length ? 'NO MORE HINTS' : 'HINT ' + (state.hintsUsed + 1) + '/' + hints.length,
        attrs: {
          type: 'button',
          disabled: state.hintsUsed >= hints.length ? '' : null,
          'aria-label': 'Reveal hint ' + Math.min(state.hintsUsed + 1, hints.length) + ' of ' + hints.length,
        },
        events: { click: function () { handlers.onHint(objective.id); } },
      });
      actions.appendChild(hintBtn);
    }
    if (passed && nextLabel) {
      actions.appendChild(
        LAB.el('button', {
          class: 'btn btn-emerald-ghost',
          text: nextLabel + ' →',
          attrs: { type: 'button' },
          events: { click: function () { handlers.onNext(); } },
        })
      );
    }
    if (state.attempts > 0 && !passed) {
      actions.appendChild(LAB.el('span', { class: 'attempts-note mono', text: 'attempts: ' + state.attempts }));
    }
    card.appendChild(actions);

    if (state.hintsUsed > 0) {
      const box = LAB.el('div', { class: 'hint-box', attrs: { 'aria-label': 'Hints revealed' } });
      hints.slice(0, state.hintsUsed).forEach(function (h, i) {
        const p = LAB.el('p');
        p.appendChild(LAB.el('span', { class: 'hint-label', text: 'HINT ' + (i + 1) }));
        p.appendChild(document.createTextNode(h));
        box.appendChild(p);
      });
      card.appendChild(box);
    }
    if (failed) {
      card.appendChild(
        LAB.el('p', {
          class: 'locked-note mono',
          text:
            'Answer locked after checking. RETRY ATTEMPT clears the answer and starts a new attempt — previous attempts and hints stay counted.',
        })
      );
    }
    if (state.result) {
      const box = LAB.el('div', { class: 'result-box ' + (passed ? 'pass' : 'fail'), attrs: { role: 'status' } });
      const title = LAB.el('p', { class: 'result-title mono' });
      title.appendChild(LAB.icon(passed ? 'shield-check' : 'shield-alert'));
      title.appendChild(document.createTextNode(passed ? 'Signal green — objective cleared' : 'Signal red — not yet'));
      box.appendChild(title);
      box.appendChild(LAB.el('p', { class: 'result-text', text: passed ? objective.feedbackPass : objective.feedbackFail }));
      card.appendChild(box);
    }
    return card;
  };

  // ── track board (desktop rail) ──────────────────────────────────────────────
  LAB.trackBoard = function (stations, objectivesByStation, progress, activeStationId, nextStationId, mode, onSelect) {
    const accentHard = mode === 'hard';
    const nav = LAB.el('nav', { class: 'track-board', attrs: { 'aria-label': 'Release track stations' } });
    nav.appendChild(LAB.el('p', { class: 'board-title mono', text: '◍ RELEASE TRACK — ' + stations.length + ' stations' }));
    const ol = LAB.el('ol', { class: 'board-list' });
    stations.forEach(function (st) {
      const objs = objectivesByStation[st.id] || [];
      const passedCount = objs.filter(function (o) {
        return progress.objectives[o.id] && progress.objectives[o.id].result === 'pass';
      }).length;
      const isActive = st.id === activeStationId;
      const isNext = st.id === nextStationId;
      const complete = objs.length > 0 && passedCount === objs.length;

      const dot = LAB.el('span', {
        class: 'board-dot' + (complete ? ' complete' : passedCount > 0 ? ' partial' : ''),
        text: st.code.replace('STN-', ''),
      });
      const nameRow = LAB.el('span', { class: 'board-name-row' }, [
        LAB.el('span', { class: 'board-name', text: st.name }),
      ]);
      if (isNext) nameRow.appendChild(LAB.el('span', { class: 'board-next mono', text: 'NEXT' }));

      const main = LAB.el('span', { class: 'board-main' }, [nameRow]);
      if (objs.length > 0) {
        const chips = LAB.el('span', { class: 'board-chips' });
        objs.forEach(function (o) {
          const chip = LAB.el('span', { class: 'board-chip mono' });
          chip.appendChild(LAB.resultIcon(progress.objectives[o.id] ? progress.objectives[o.id].result : null));
          chip.appendChild(document.createTextNode(o.id.replace('OBJ-', '')));
          chips.appendChild(chip);
        });
        main.appendChild(chips);
      } else {
        main.appendChild(
          LAB.el('span', { class: 'board-empty', text: 'no direct task — covered via other stations' })
        );
      }

      const btn = LAB.el('button', {
        class: 'board-item' + (isActive ? ' active' : '') + (accentHard ? ' hard' : ''),
        attrs: { type: 'button', 'aria-current': isActive ? 'true' : null },
        events: { click: function () { onSelect(st.id); } },
      });
      btn.appendChild(LAB.el('span', { class: 'board-row' }, [dot, main]));
      ol.appendChild(LAB.el('li', null, [btn]));
    });
    nav.appendChild(ol);
    return nav;
  };

  // ── track rail (mobile chips) ───────────────────────────────────────────────
  LAB.trackRail = function (stations, activeStationId, nextStationId, onSelect) {
    const rail = LAB.el('div', { class: 'track-rail', attrs: { role: 'tablist', 'aria-label': 'Stations quick rail' } });
    stations.forEach(function (st) {
      const isActive = st.id === activeStationId;
      const isNext = st.id === nextStationId;
      rail.appendChild(
        LAB.el('button', {
          class: 'rail-chip mono' + (isActive ? ' active' : ''),
          attrs: { type: 'button', role: 'tab', 'aria-selected': isActive ? 'true' : 'false' },
          text: st.code.replace('STN-', '') + '·' + st.name.split(' ')[0] + (isNext ? ' ◂' : ''),
          events: { click: function () { onSelect(st.id); } },
        })
      );
    });
    return rail;
  };
})();
