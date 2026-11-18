/* ── UI renderer ──────────────────────────────────────────────────────────────
 * Template functions producing the same DOM the original React components
 * render: ModeSelect, TopStrip, bay tabs, the six bays, assignment sheet,
 * glossary/reset dialogs and the shift-report completion modal.
 * Pure string templates — js/app.js owns transient UI state + event dispatch.
 */
(function () {
  'use strict';

  const LAB = window.LAB;
  const Obj = window.LabObjectives;
  const A = () => window.LabState.actions;

  /* ── helpers ──────────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const escA = esc;

  function icon(name, cls) {
    const nodes = LAB_ICONS[name];
    if (!nodes) return '';
    const inner = nodes.map(([tag, attrs]) => {
      const a = Object.keys(attrs).map((k) => k + '="' + escA(attrs[k]) + '"').join(' ');
      return '<' + tag + ' ' + a + '></' + tag + '>';
    }).join('');
    return '<svg class="' + (cls || 'ic-16') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  const icSvgs = {
    radar: 'radar', grad: 'graduation-cap', flame: 'flame', shieldCheck: 'shield-check',
    book: 'book-open', bug: 'bug', fileKey: 'file-key-2', key: 'key-round', globe: 'globe-2',
    snail: 'snail', fence: 'fence', shieldAlert: 'shield-alert', server: 'server',
    eye: 'eye', eyeOff: 'eye-off', lock: 'lock', lockOpen: 'lock-open', play: 'play',
    chev: 'chevron-down', check2: 'check-circle-2', xc: 'x-circle', target: 'target',
    bulb: 'lightbulb', dot: 'circle-dot', up: 'arrow-up', down: 'arrow-down', right: 'arrow-right',
    listChecks: 'list-checks', clip: 'clipboard-check', ext: 'external-link', badge: 'badge-check',
    swords: 'swords', cross: 'crosshair', trophy: 'trophy', star: 'star', starHalf: 'star-half',
    rotate: 'rotate-ccw',
  };
  const I = (name, cls) => icon(icSvgs[name] || name, cls || 'ic-16');

  const PILLAR_NAME = { understand: 'UNDERSTAND', recognize: 'RECOGNIZE', detect: 'DETECT', mitigate: 'MITIGATE' };
  const PILLAR_LABEL = Obj.PILLAR_LABEL;

  function pillarChip(pillar) {
    return '<span class="pillar-chip pillar-' + pillar + '">' + PILLAR_NAME[pillar] + '</span>';
  }

  const SEV_CLASS = { info: 'sev-info', warn: 'sev-warn', alert: 'sev-alert' };
  const SEV_LABEL = { info: 'INFO', warn: 'WARNING', alert: 'ALERT' };

  function severityDot(sev) {
    return '<span class="sev-dot ' + SEV_CLASS[sev] + '" aria-hidden="true"></span>';
  }

  function bayLabel(id) {
    const b = LAB.bays.find((x) => x.id === id);
    return b ? b.label : id;
  }

  const pad2 = (n) => String(n).padStart(2, '0');

  /* form controls */
  function switchEl(id, checked, label, extra, disabled) {
    return '<button type="button" role="switch" aria-checked="' + (checked ? 'true' : 'false') + '" id="' + id +
      '" class="switch" ' + (disabled ? 'disabled ' : '') + (extra || '') + ' aria-label="' + escA(label) + '">' +
      '<span class="knob"></span></button>';
  }

  function selectEl(opts) {
    const hasVal = opts.value !== '' && opts.value !== undefined && opts.value !== null;
    let html = '<select id="' + opts.id + '" class="select ' + (opts.cls || '') + (!hasVal && opts.placeholder ? ' is-placeholder' : '') + '"';
    if (opts.disabled) html += ' disabled';
    if (opts.attrs) html += ' ' + opts.attrs;
    if (opts.aria) html += ' aria-label="' + escA(opts.aria) + '"';
    html += '>';
    if (opts.placeholder) html += '<option value="" disabled' + (hasVal ? '' : ' selected') + '>' + esc(opts.placeholder) + '</option>';
    for (const o of opts.options) {
      html += '<option value="' + escA(o.id) + '"' + (o.id === opts.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }
    html += '</select>';
    return html;
  }

  function choiceList(opts) {
    // { name, options, value (str|arr), multi, changeAttrs(fn(id)->attrs) }
    const arr = Array.isArray(opts.value);
    const checked = (id) => (arr ? opts.value.includes(id) : opts.value === id);
    return '<div class="choice-group" role="' + (opts.multi ? 'group' : 'radiogroup') + '" aria-label="' + escA(opts.name) + '">' +
      opts.options.map((o) =>
        '<label class="choice' + (checked(o.id) ? ' checked' : '') + '">' +
        '<input type="' + (opts.multi ? 'checkbox' : 'radio') + '" name="' + opts.name + '" value="' + escA(o.id) + '"' +
        (checked(o.id) ? ' checked' : '') + ' ' + opts.attrs(o.id) + '>' +
        '<span>' + esc(o.label) + '</span></label>'
      ).join('') + '</div>';
  }

  function orderBuilder(opts) {
    // { items, order, defaultOrder, key, aria }
    const cur = opts.order.length === opts.items.length ? opts.order : opts.defaultOrder;
    const rows = cur.map((id, idx) => {
      const item = opts.items.find((i) => i.id === id);
      return '<li class="order-item">' +
        '<span class="order-num">' + (idx + 1) + '</span>' +
        '<span class="order-label">' + esc(item ? item.label : id) + '</span>' +
        '<span class="order-btns">' +
        '<button type="button" class="order-btn" data-action="order-move" data-key="' + opts.key + '" data-idx="' + idx + '" data-dir="-1"' +
        (idx === 0 ? ' disabled' : '') + ' aria-label="Move item ' + (idx + 1) + ' up">' + I('up', 'ic-14') + '</button>' +
        '<button type="button" class="order-btn" data-action="order-move" data-key="' + opts.key + '" data-idx="' + idx + '" data-dir="1"' +
        (idx === cur.length - 1 ? ' disabled' : '') + ' aria-label="Move item ' + (idx + 1) + ' down">' + I('down', 'ic-14') + '</button>' +
        '</span></li>';
    }).join('');
    return '<ol class="order-list" aria-label="' + escA(opts.aria) + '">' + rows + '</ol>';
  }

  function checkResult(result) {
    if (!result) return '';
    return '<div class="' + (result.pass ? 'status-pass' : 'status-fail') + '" role="status">' +
      '<span class="status-tag">' + (result.pass ? 'PASS ▸' : 'CHECK ▸') + '</span>' + esc(result.text) + '</div>';
  }

  function term(t, ui) {
    const all = [...LAB.glossary, ...LAB.termExtra];
    const hit = all.find((g) => g.term.toLowerCase() === t.toLowerCase());
    const open = ui && ui.openTerm === t;
    return '<span class="term-wrap">' +
      '<button type="button" class="term-btn" data-action="toggle-term" data-term="' + escA(t) + '" aria-label="Glossary: ' + escA(t) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' + esc(t) + '</button>' +
      (open ? '<div class="term-pop"><p class="head">' + I('book', 'ic-12') + ' Field manual glossary</p>' +
        '<p class="term-name">' + esc(t) + '</p><p class="def">' +
        esc(hit ? hit.def : 'A deception-operations term — see the Field Manual bay.') + '</p></div>' : '') +
      '</span>';
  }

  /* ── objective card ───────────────────────────────────────────────────────── */
  function objectiveCard(def, session, ui, upNext, benchHtml) {
    const prog = session.objProgress[def.id];
    const result = session.objResults[def.id];
    const done = !!(prog && prog.done);
    const open = ui.cardOpen[def.id] !== undefined ? ui.cardOpen[def.id] : !done;
    const isMedium = def.mode === 'medium';
    const hintsTotal = isMedium ? def.hints.length : 1;
    const hintsUsedN = (prog && prog.hintsUsed) || 0;
    const hintsShown = isMedium ? hintsUsedN : (hintsUsedN > 0 ? def.hints.length : 0);
    const hintExhausted = hintsShown >= hintsTotal;

    const meta =
      '<span class="badge">' + def.id + '</span>' +
      pillarChip(def.pillar) +
      (upNext && !done ? '<span class="upnext-chip">UP NEXT</span>' : '') +
      (done ? '<span class="obj-passed">PASSED' + (prog && prog.attempts > 1 ? ' · ' + prog.attempts + ' tries' : ' · first try') + '</span>' : '');

    let hintsHtml = '';
    if (!done) {
      if (hintsShown === 0) {
        hintsHtml = '<div class="hints-block"><button type="button" class="btn btn-outline btn-sm hint-btn' + (isMedium ? '' : ' hard') + '" data-action="hint" data-obj="' + def.id + '">' +
          I('bulb', 'ic-14') + (isMedium ? ' Reveal hint 1/' + hintsTotal : ' Take the nudge — costs a star') + '</button></div>';
      } else {
        hintsHtml = '<div class="hints-block hints" role="list" aria-label="Revealed hints">' +
          def.hints.slice(0, hintsShown).map((h, i) =>
            '<p class="hint-row" role="listitem">' + I('bulb', 'ic-14') + '<span><span class="hn">H' + (i + 1) + ' ▸</span>' + esc(h) + '</span></p>'
          ).join('') +
          (isMedium && !hintExhausted ? '<button type="button" class="btn btn-outline hint-btn" style="min-height:28px" data-action="hint" data-obj="' + def.id + '">' + I('dot', 'ic-12') + ' Reveal hint ' + (hintsShown + 1) + '/' + hintsTotal + '</button>' : '') +
          '</div>';
      }
    }

    return '<div class="obj-card' + (done ? ' done' : upNext ? ' next' : '') + '">' +
      '<button type="button" class="obj-trigger" data-action="toggle-card" data-obj="' + def.id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="obj-ic' + (done ? ' done' : upNext ? ' next' : '') + '">' + (done ? I('check2', 'ic-18') : I('target', 'ic-18')) + '</span>' +
      '<span class="obj-meta">' + meta + '<span class="obj-title">' + esc(def.title) + '</span></span>' +
      '<span class="obj-chevron' + (open ? ' open' : '') + '">' + I('chev', 'ic-16') + '</span>' +
      '</button>' +
      (open ?
        '<div class="obj-body">' +
        '<p class="context-line">' + esc(def.context) + '</p>' +
        '<p class="anchor-box"><span class="tag">SYLLABUS ▸</span> ' + esc(def.anchor) + '</p>' +
        hintsHtml +
        (benchHtml ? '<div style="margin-top:12px">' + benchHtml + '</div>' : '') +
        (!done ? '<button type="button" class="btn btn-solid" style="margin-top:12px;min-height:36px" data-action="check-obj" data-obj="' + def.id + '">Check objective ' + def.id + '</button>' : '') +
        checkResult(result) +
        '</div>' : '') +
      '</div>';
  }

  /* ── bay 01: field manual ─────────────────────────────────────────────────── */
  const LINKED_TERMS = {
    why: ['honeypot', 'false positive', 'dwell time', 'risk'],
    family: ['honeynet', 'honeyfile', 'honeytoken', 'canary token', 'dns sinkhole', 'tarpit', 'interaction level'],
    place: ['segmentation', 'cia triad'],
  };

  function manualParagraph(sectionId, pIndex, text, ui) {
    const terms = pIndex === 0 ? (LINKED_TERMS[sectionId] || []) : [];
    let hit = null;
    for (const t of terms) {
      const idx = text.toLowerCase().indexOf(t);
      if (idx !== -1 && (hit === null || idx < hit.index)) {
        hit = { word: text.slice(idx, idx + t.length), index: idx };
      }
    }
    if (!hit) return '<p>' + esc(text) + '</p>';
    return '<p>' + esc(text.slice(0, hit.index)) + term(hit.word, ui) + esc(text.slice(hit.index + hit.word.length)) + '</p>';
  }

  function renderFieldManual(ui) {
    const sections = LAB.manualSections.map((s, si) =>
      '<section class="card card-scan manual-sec" aria-labelledby="manual-' + s.id + '">' +
      '<h3 id="manual-' + s.id + '"><span class="n">' + pad2(si + 1) + '</span>' + esc(s.title) + '</h3>' +
      '<div class="manual-body">' + s.body.map((p, pi) => manualParagraph(s.id, pi, p, ui)).join('') + '</div>' +
      '</section>'
    ).join('');

    const proof = '<section class="card" aria-labelledby="field-proof">' +
      '<h3 id="field-proof" style="display:flex;align-items:center;gap:8px">' + I('shieldCheck', 'ic-16') + ' Field proof — this technology in the real world</h3>' +
      '<div class="proof-grid">' + LAB.fieldProof.map((f) =>
        '<div class="proof-tile"><p class="proof-name">' + esc(f.name) + '</p><p class="proof-text">' + esc(f.text) + '</p></div>'
      ).join('') + '</div></section>';

    const anchor = '<p class="exam-anchor">' + I('book', 'ic-16') +
      ' Exam anchor: CompTIA Network+ N10-009, Domain 4.0 → 4.1 — deception technologies (honeypot, honeynet) and common security terminology (risk, vulnerability, exploit, threat, CIA triad).</p>';

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">01 · Field Manual — Knowledge Core</h2>' +
      '<p>Everything the night shift runs on. Read it before your first deployment — every drill on the deck traces back to a paragraph here. Dotted-underlined words open glossary definitions.</p></header>' +
      sections + proof + anchor + '</div>';
  }

  /* ── bay 02: trap rack ────────────────────────────────────────────────────── */
  function rackCard(opts) {
    return '<section class="card card-scan rack-card' + (opts.armed ? ' armed' : '') + '" aria-label="' + escA(opts.title) + '">' +
      '<div class="card-head">' +
      '<span class="card-ic ' + opts.accent + '" aria-hidden="true">' + I(opts.icon, 'ic-16') + '</span>' +
      '<div style="min-width:0;flex:1"><h3 class="card-title">' + esc(opts.title) + '</h3><p class="card-sub">' + esc(opts.subtitle) + '</p></div>' +
      '<span class="armed-chip' + (opts.armed ? ' on' : '') + '">' + (opts.armed ? 'ARMED' : 'OFF') + '</span>' +
      '</div><div class="rack-body">' + opts.body + '</div></section>';
  }

  function row(label, htmlFor, control) {
    return '<div class="field-row"><label class="field-label" for="' + htmlFor + '">' + esc(label) + '</label><div style="flex-shrink:0">' + control + '</div></div>';
  }

  const SEG_OPTIONS = [
    { id: 'prod-core', label: 'Production core (VLAN 10)' },
    { id: 'dmz', label: 'DMZ (VLAN 20)' },
    { id: 'decoy-yard', label: 'Decoy yard (VLAN 66)' },
  ];

  function renderTrapRack(state, session, ui) {
    const t = session.traps;
    const mode = state.activeMode;
    const A1 = 'data-action="trap-switch"';

    const hpArmed = t.honeypot.deployed && t.honeypot.monitoring;
    const hfArmed = t.honeyfile.host !== 'none' && t.honeyfile.file !== 'none';

    const hpCard = rackCard({
      icon: 'bug', title: 'HP-01 · Honeypot', subtitle: 'One decoy system with a fake service facade.',
      armed: hpArmed, accent: 'honeypot-accent',
      body:
        row('Deploy the decoy', 'hp-deploy', switchEl('hp-deploy', t.honeypot.deployed, 'Deploy honeypot HP-01', A1 + ' data-trap="honeypot" data-field="deployed"')) +
        row('Placement segment', 'hp-seg', selectEl({
          id: 'hp-seg', value: t.honeypot.segment, options: SEG_OPTIONS, disabled: !t.honeypot.deployed,
          attrs: 'data-change="trap" data-trap="honeypot" data-field="segment"', cls: 'w260',
        })) +
        row('Open fake services', 'hp-ssh',
          '<div class="services-group">' +
          ['ssh', 'http', 'rdp'].map((s) =>
            '<label class="service-toggle" for="hp-' + s + '">' + switchEl('hp-' + s, t.honeypot.services[s], 'Toggle ' + s + ' service on the honeypot', A1 + ' data-trap="honeypot" data-field="services" data-sub="' + s + '"') + s + '</label>'
          ).join('') + '</div>') +
        row('Wire alerts to the SOC (monitoring)', 'hp-mon', switchEl('hp-mon', t.honeypot.monitoring, 'Honeypot monitoring', A1 + ' data-trap="honeypot" data-field="monitoring"')),
    });

    const hfCard = rackCard({
      icon: 'fileKey', title: 'Honeyfile + canary', subtitle: 'Bait planted among REAL files on a real server.',
      armed: hfArmed, accent: 'honeypot-accent',
      body:
        row('Plant on host', 'hf-host', selectEl({
          id: 'hf-host', value: t.honeyfile.host, disabled: false,
          options: [{ id: 'none', label: '— none —' }, { id: 'filesrv-01', label: 'FileSrv-01 (production)' }, { id: 'hp-01', label: 'HP-01 (the decoy itself)' }],
          attrs: 'data-change="trap" data-trap="honeyfile" data-field="host"', cls: 'w260',
        })) +
        row('Bait document', 'hf-file', selectEl({
          id: 'hf-file', value: t.honeyfile.file, disabled: t.honeyfile.host === 'none',
          options: [{ id: 'none', label: '— none —' }, { id: 'passwords.txt', label: 'passwords.txt' }, { id: 'payroll_2026_final.xlsx', label: 'payroll_2026_final.xlsx' }, { id: 'network-diagram.pdf', label: 'network-diagram.pdf' }],
          attrs: 'data-change="trap" data-trap="honeyfile" data-field="file"', cls: 'w260',
        })) +
        row('Attach canary token (silent webhook)', 'hf-canary', switchEl('hf-canary', t.honeyfile.canary, 'Honeyfile canary token', A1 + ' data-trap="honeyfile" data-field="canary"')),
    });

    const htCard = rackCard({
      icon: 'key', title: 'Honeytoken', subtitle: 'Bait in identity space: an account no human should use.',
      armed: t.honeytoken.enabled, accent: 'honeypot-accent',
      body:
        row('Seed the bait identity', 'ht-on', switchEl('ht-on', t.honeytoken.enabled, 'Enable honeytoken', A1 + ' data-trap="honeytoken" data-field="enabled"')) +
        row('Bait type', 'ht-kind', selectEl({
          id: 'ht-kind', value: t.honeytoken.kind, disabled: !t.honeytoken.enabled,
          options: [
            { id: 'svc-acct', label: 'Canary account "svc_backup"' },
            { id: 'api-key', label: 'Decoy cloud API key' },
            { id: 'web-beacon', label: 'Hidden web beacon in a decoy PDF' },
          ],
          attrs: 'data-change="trap" data-trap="honeytoken" data-field="kind"', cls: 'w260',
        })),
    });

    const skCard = rackCard({
      icon: 'globe', title: 'DNS sinkhole', subtitle: 'Answers malicious domains with a controlled IP.',
      armed: t.sinkhole.enabled, accent: 'teal-accent',
      body:
        row('Enable sinkholing', 'sk-on', switchEl('sk-on', t.sinkhole.enabled, 'Enable DNS sinkhole', A1 + ' data-trap="sinkhole" data-field="enabled"')) +
        row('Log queries (visibility)', 'sk-log', switchEl('sk-log', t.sinkhole.logQueries, 'Sinkhole query logging', A1 + ' data-trap="sinkhole" data-field="logQueries"', !t.sinkhole.enabled)) +
        row('Domain under sinkhole', 'sk-dom', selectEl({
          id: 'sk-dom', value: t.sinkhole.domain, disabled: !t.sinkhole.enabled,
          options: [{ id: 'cdn-metrics-sync.com', label: 'cdn-metrics-sync.com (watched C2)' }, { id: 'update-partner.net', label: 'update-partner.net (benign, for contrast)' }],
          attrs: 'data-change="trap" data-trap="sinkhole" data-field="domain"', cls: 'w260',
        })),
    });

    const tpCard = rackCard({
      icon: 'snail', title: 'Tarpit', subtitle: 'Answers port scans with molasses on the edge.',
      armed: t.tarpit.enabled, accent: 'teal-accent',
      body:
        row('Enable tarpit', 'tp-on', switchEl('tp-on', t.tarpit.enabled, 'Enable tarpit', A1 + ' data-trap="tarpit" data-field="enabled"')) +
        row('Bind to port', 'tp-port', selectEl({
          id: 'tp-port', value: t.tarpit.port, disabled: !t.tarpit.enabled,
          options: [{ id: '22', label: ':22 — SSH (what scanners expect)' }, { id: '23', label: ':23 — Telnet (legacy bait)' }],
          attrs: 'data-change="trap" data-trap="tarpit" data-field="port"', cls: 'w260',
        })) +
        row('Stall profile', 'tp-prof', selectEl({
          id: 'tp-prof', value: t.tarpit.profile, disabled: !t.tarpit.enabled,
          options: [{ id: 'mild', label: 'Mild — slow drip, low visibility' }, { id: 'aggressive', label: 'Aggressive — endless banner, hard stall' }],
          attrs: 'data-change="trap" data-trap="tarpit" data-field="profile"', cls: 'w260',
        })),
    });

    const fnCard = rackCard({
      icon: 'fence', title: 'Isolation fence', subtitle: 'VLAN 66 (decoy) → VLAN 10 (production): the rule that outranks all.',
      armed: t.fence.closed, accent: 'green-accent',
      body:
        row('Enforce DENY decoy → production', 'fence-sw', switchEl('fence-sw', t.fence.closed, 'Isolation fence closed', A1 + ' data-trap="fence" data-field="closed"')) +
        (!t.fence.closed ? '<p class="fence-open-note">' + I('shieldAlert', 'ic-16') +
          ' FENCE OPEN — a compromised decoy currently has a live path into production. Nothing from VLAN 66 should ever be able to reach VLAN 10.</p>' : ''),
    });

    const rackObjectives = Obj.objectivesFor(mode).filter((o) => o.bay === 'rack');
    const upNextId = (rackObjectives.find((o) => !(session.objProgress[o.id] && session.objProgress[o.id].done)) || {}).id;

    const bench = (o) => {
      if (o.id === 'M10') {
        return '<div><label class="field-label" for="fence-why">In one line: why must a decoy never reach production?</label>' +
          '<textarea id="fence-why" class="textarea" data-input="fenceWhy" placeholder="e.g. A compromised decoy could be used to…">' + esc(session.drills.fenceWhy) + '</textarea></div>';
      }
      if (o.id === 'H5') {
        return '<div><p class="field-label" style="margin-bottom:6px">Pick the justification the evidence supports:</p>' +
          choiceList({
            name: 'fence-justify', options: LAB.fenceJustifyOptions, value: session.drills.fenceJustify,
            attrs: (id) => 'data-change="drill" data-key="fenceJustify"',
          }) + '</div>';
      }
      return '';
    };

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">02 · Trap Rack — Deployment Bench</h2>' +
      '<p>Six deception controls, each with real configuration trade-offs. The rack is where placement, exposure, logging and isolation are decided — every choice here changes what the Sensor Wall sees.</p></header>' +
      '<div class="rack-grid">' + hpCard + hfCard + htCard + skCard + tpCard + fnCard + '</div>' +
      '<div class="stack-sm"><h2 class="section-title">Rack objectives</h2>' +
      rackObjectives.map((o) => objectiveCard(o, session, ui, o.id === upNextId, bench(o))).join('') +
      '</div></div>';
  }

  /* ── bay 03: the yard ─────────────────────────────────────────────────────── */
  function renderYardMap(session, ui) {
    const t = session.traps;
    const prod = LAB.yardAssets.filter((a) => a.segment === 'prod');
    const decoy = LAB.yardAssets.filter((a) => a.segment === 'decoy');

    const coverage = [
      { id: 'hp', label: 'HONEYPOT', on: t.honeypot.deployed && t.honeypot.monitoring, detail: t.honeypot.deployed ? (t.honeypot.monitoring ? 'armed + monitored' : 'deployed, unmonitored') : 'off' },
      { id: 'hf', label: 'HONEYFILE', on: t.honeyfile.host !== 'none' && t.honeyfile.file !== 'none', detail: t.honeyfile.host !== 'none' ? 'on ' + (t.honeyfile.host === 'filesrv-01' ? 'FileSrv-01' : 'HP-01') + (t.honeyfile.canary ? ' + canary' : ' (no canary)') : 'not planted' },
      { id: 'ht', label: 'HONEYTOKEN', on: t.honeytoken.enabled, detail: t.honeytoken.enabled ? t.honeytoken.kind : 'off' },
      { id: 'sk', label: 'SINKHOLE', on: t.sinkhole.enabled, detail: t.sinkhole.enabled ? (t.sinkhole.logQueries ? 'redirect + logging' : 'redirect, no logging') : 'off' },
      { id: 'tp', label: 'TARPIT', on: t.tarpit.enabled, detail: t.tarpit.enabled ? ':' + t.tarpit.port + ' ' + t.tarpit.profile : 'off' },
      { id: 'fn', label: 'FENCE', on: t.fence.closed, detail: t.fence.closed ? 'DENY vlan66→vlan10' : 'OPEN — pivot path live' },
    ];

    const asset = (a, wing) =>
      '<div class="asset-row"><span class="ic">' + I('server', 'ic-16') + '</span><div style="min-width:0">' +
      '<p class="asset-name">' + esc(a.name) + ' <span>· ' + esc(a.ip) + '</span></p>' +
      '<p class="asset-role">' + esc(a.role) + '</p></div></div>';

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">03 · The Yard — Live Asset Map</h2>' +
      '<p>The network as the night shift sees it. Teal wing: production. Rose wing: the decoy yard — everything rose exists to betray. Between them sits the fence, the one control that makes it safe to let attackers &ldquo;win&rdquo; on bait.</p></header>' +
      '<div class="coverage" aria-label="Coverage badges">' + coverage.map((c) =>
        '<span class="coverage-chip' + (c.on ? ' on' : '') + '" title="' + escA(c.detail) + '">' + I(c.on ? 'eye' : 'eyeOff', 'ic-12') + esc(c.label) +
        '<span class="d">· ' + esc(c.detail) + '</span></span>'
      ).join('') + '</div>' +
      '<div class="yard-grid">' +
      '<section class="yard-wing prod" aria-label="Production wing"><h3>Production wing · VLAN 10</h3>' + prod.map((a) => asset(a, 'prod')).join('') + '</section>' +
      '<div class="fence-col" aria-label="Isolation fence state"><div class="fence-box ' + (t.fence.closed ? 'closed' : 'open') + '">' +
      (t.fence.closed ? I('lock', 'ic-20') : I('lockOpen', 'ic-20')) +
      '<p class="fence-label">' + (t.fence.closed ? 'Fence closed · DENY' : 'Fence open') + '</p>' +
      term('Segmentation', ui) + '</div></div>' +
      '<section class="yard-wing decoy" aria-label="Decoy wing"><h3>Decoy yard · VLAN 66</h3>' + decoy.map((a) => asset(a, 'decoy')).join('') + '</section>' +
      '</div>' +
      '<p class="verdict-strip ' + (t.fence.closed ? 'closed' : 'open') + '" role="status">' +
      (t.fence.closed ? I('shieldCheck', 'ic-16') : I('shieldAlert', 'ic-16')) +
      (t.fence.closed
        ? 'Fence closed: the decoy yard can be lost in total — attacker, root kit and all — and production never feels it. This is what makes high-interaction decoys safe.'
        : 'Fence open: any decoy compromised right now is a staging point against VLAN 10. Close the fence on the Trap Rack — the sensor wall will show what leaks while it stays open.') +
      '</p></div>';
  }

  /* ── bay 04: sensor wall ──────────────────────────────────────────────────── */
  const TRIAGE_OPTIONS = [
    { value: 'decoy', label: 'DECOY EVIDENCE', hint: 'something touched bait' },
    { value: 'prod', label: 'PROD ALERT', hint: 'hostile, but no bait touched' },
    { value: 'benign', label: 'BENIGN NOISE', hint: 'has an alibi' },
  ];

  function feedItem(e, session, ui, isMedium) {
    const open = ui.rawOpen[e.id] === true;
    const bait = isMedium && session.waveRun
      ? '<label class="bait-flag"><input type="checkbox"' +
        (session.drills.reconSelected.includes(e.id) ? ' checked' : '') +
        ' data-change="drill-multi" data-key="reconSelected" data-id="' + escA(e.id) + '"' +
        ' aria-label="Flag ' + escA(e.id) + ' as deception-produced">BAIT</label>'
      : '';

    const triage = !isMedium
      ? '<fieldset class="triage-group"><legend class="sr-only">Classify event ' + esc(e.id) + '</legend>' +
        '<div class="triage-opts">' + TRIAGE_OPTIONS.map((opt) => {
          const sel = session.drills.triage[e.id] === opt.value;
          return '<label class="triage-opt' + (sel ? ' checked' : '') + '">' +
            '<input type="radio" name="triage-' + escA(e.id) + '" value="' + opt.value + '" class="sr-only"' +
            (sel ? ' checked' : '') + ' data-change="triage" data-eid="' + escA(e.id) + '">' +
            opt.label + '<span class="h">· ' + opt.hint + '</span></label>';
        }).join('') + '</div></fieldset>'
      : '';

    return '<article class="feed-item sev-' + e.severity + '">' +
      '<div class="feed-head">' +
      '<span class="feed-when">' + severityDot(e.severity) + '<span class="feed-time">' + esc(e.time) + '</span></span>' +
      '<div class="feed-main"><p class="feed-title">' + esc(e.title) + '</p>' +
      '<p class="feed-meta">' + esc(e.sensor) + ' · <span class="lc">' + esc(e.source) + ' → ' + esc(e.dest) + '</span> · ' + SEV_LABEL[e.severity] + '</p></div>' +
      '<div class="feed-actions">' + bait +
      '<button type="button" class="btn btn-outline btn-sm raw-btn" data-action="toggle-raw" data-eid="' + escA(e.id) + '"' +
      ' aria-expanded="' + (open ? 'true' : 'false') + '" aria-label="Expand raw log for ' + escA(e.id) + '">RAW' +
      '<span class="chev' + (open ? ' open' : '') + '">' + I('chev', 'ic-14') + '</span></button></div>' +
      '</div>' +
      (open ? '<pre class="raw-log">' + esc(e.raw) + '</pre>' : '') +
      triage +
      '</article>';
  }

  function renderSensorWall(state, session, ui) {
    const mode = state.activeMode;
    const isMedium = mode === 'medium';
    const wallObjectives = Obj.objectivesFor(mode).filter((o) => o.bay === 'wall');
    const upNextId = (wallObjectives.find((o) => !(session.objProgress[o.id] && session.objProgress[o.id].done)) || {}).id;

    const runner = isMedium
      ? '<div class="drill-runner card-scan"><p>' + I('radar', 'ic-16') + '<span>Recon drill: a simulated intruder will scan, brute-force, browse shares, beacon and attempt a pivot — <strong>once</strong>, against whatever is armed right now.</span></p>' +
        '<button type="button" class="btn btn-solid" data-action="run-wave">' + I('play', 'ic-16') + ' ' + (session.waveRun ? 'Re-run recon drill' : 'Run recon drill') + '</button></div>'
      : '';

    const empty = isMedium && session.feed.length === 0
      ? '<div class="feed-empty">' + I('eyeOff', 'ic-24') +
        '<p>Feed dark — no sensors reporting</p>' +
        '<p class="lede">Arm traps on the rack, then run the recon drill. Without bait, tonight&rsquo;s intruder walks past your network and the only evidence you will ever have is the breach itself.</p></div>'
      : '';

    const blind = isMedium && session.waveRun
      ? '<section class="blind-spot ' + (session.blindSpots.length > 0 ? 'bad' : 'clean') + '" aria-labelledby="blind-spots">' +
        '<h3 id="blind-spots">' + I('eye', 'ic-16') + ' Blind-spot report — what the drill did with nobody watching</h3>' +
        (session.blindSpots.length === 0
          ? '<p class="blind-clean">No blind spots — every phase of the recon pass landed on a sensor you armed. That is full coverage of this attacker&rsquo;s playbook.</p>'
          : '<ul>' + session.blindSpots.map((b, i) =>
              '<li><span class="tag">VOID ▸</span>' + esc(b) + '</li>').join('') + '</ul>') +
        '</section>'
      : '';

    const bench = (o) => {
      if (o.id === 'M9') {
        return '<div class="bench-grid">' +
          '<div><label class="field-label" for="cmd-a">First profiling command</label>' +
          '<input id="cmd-a" class="input mono-input" data-input="cmdA" placeholder="e.g. whoami" value="' + escA(session.drills.cmdA) + '"></div>' +
          '<div><label class="field-label" for="cmd-b">Second profiling command</label>' +
          '<input id="cmd-b" class="input mono-input" data-input="cmdB" placeholder="e.g. ls /var/www" value="' + escA(session.drills.cmdB) + '"></div>' +
          '</div>';
      }
      return '';
    };

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">04 · Sensor Wall — Live Evidence Feed</h2>' +
      '<p>' + (isMedium
        ? 'The simulated intruder drill fires one scripted recon pass against your current deployment. Events appear ONLY for traps that can see them — what slips past unobserved lands in the blind-spot report.'
        : 'The previous shift went home at 06:00 and left you their full overnight capture — 14 events from eight sensors, two of which are red herrings. Classify everything.') + '</p></header>' +
      runner +
      '<section class="feed" aria-label="Evidence feed">' + empty + session.feed.map((e) => feedItem(e, session, ui, isMedium)).join('') + '</section>' +
      blind +
      '<div class="stack-sm"><h2 class="section-title">Wall objectives</h2>' +
      wallObjectives.map((o) => objectiveCard(o, session, ui, o.id === upNextId, bench(o))).join('') +
      '</div></div>';
  }

  /* ── bay 05: drill deck ───────────────────────────────────────────────────── */
  function benchSelect(o) {
    // { id, value, options, placeholder, aria, key, slot }
    const attrs = 'data-change="drill" data-key="' + o.key + '"' + (o.slot ? ' data-slot="' + o.slot + '"' : '');
    return selectEl({ id: o.id, value: o.value, options: o.options, placeholder: o.placeholder, aria: o.aria, attrs, cls: 'w-full' });
  }

  const HT_EVENT_OPTIONS = [
    { id: 'E-0014', label: '00:14 — credential-guessing burst on the VPN' },
    { id: 'E-0217', label: '02:17 — honeyfile opened on FileSrv-01' },
    { id: 'E-0241', label: '02:41 — canary account logs in to the VPN' },
    { id: 'E-0444', label: '04:44 — RDP brute force against AppSrv-01' },
  ];

  function renderDrillDeck(state, session, ui) {
    const mode = state.activeMode;
    const d = session.drills;
    const isMedium = mode === 'medium';
    const deckObjectives = Obj.objectivesFor(mode).filter((o) => o.bay === 'deck');
    const upNextId = (deckObjectives.find((o) => !(session.objProgress[o.id] && session.objProgress[o.id].done)) || {}).id;
    const multi = (key) => (id) => 'data-change="drill-multi" data-key="' + key + '" data-id="' + id + '"';
    const radio = (key) => () => 'data-change="drill" data-key="' + key + '"';

    const benches = {
      M1: () => '<div>' + LAB.matchDefs.map((def, i) =>
        '<div class="bench-def"><p>&ldquo;' + esc(def.text) + '&rdquo;</p>' +
        benchSelect({ id: 'match-' + def.id, value: d.matchTech[def.id] || '', options: LAB.matchTechs, placeholder: 'Name the technology…', aria: 'Technology for definition ' + (i + 1), key: 'matchTech', slot: def.id }) +
        '</div>').join('') + '</div>',
      M2: () => '<div>' + LAB.vocabSentenceOrder.map((sid, si) => {
        const s = LAB.vocabSentences.find((x) => x.id === sid);
        return '<div class="bench-def"><p>' + esc(s.text) + '</p>' +
          benchSelect({ id: 'vocab-' + s.id, value: d.vocabAssign[s.id] || '', options: LAB.vocabTerms, placeholder: 'Assign the term…', aria: 'Term for sentence ' + (si + 1), key: 'vocabAssign', slot: s.id }) +
          '</div>';
      }).join('') + '</div>',
      M3: () => '<div class="stack-sm">' +
        '<div><p class="bench-q">Q1 — What type of control is deception?</p>' +
        choiceList({ name: 'func-choice', options: LAB.funcOptions, value: d.funcChoice, attrs: radio('funcChoice') }) + '</div>' +
        '<div><p class="bench-q">Q2 — Why does tripping a decoy expose almost no real CIA?</p>' +
        choiceList({ name: 'cia-choice', options: LAB.ciaOptions, value: d.ciaChoice, attrs: radio('ciaChoice') }) + '</div></div>',
      M4: () => '<div class="stack-sm">' +
        '<div><p class="bench-q">Mission A — ' + esc(LAB.hiLoContextA) + '</p>' +
        choiceList({ name: 'hi-choice', options: LAB.hiOptions, value: d.hiChoice, attrs: radio('hiChoice') }) + '</div>' +
        '<div><p class="bench-q">Mission B — ' + esc(LAB.hiLoContextB) + '</p>' +
        choiceList({ name: 'lo-choice', options: LAB.hiOptions, value: d.loChoice, attrs: radio('loChoice') }) + '</div></div>',
      M11: () => orderBuilder({ items: LAB.irItems, order: d.irOrder, defaultOrder: ['scope', 'report', 'rotate', 'contain'], key: 'irOrder', aria: 'Incident response sequence builder' }),
      M12: () => choiceList({ name: 'limitations', options: LAB.limitationOptions, value: d.limitations, multi: true, attrs: multi('limitations') }),
      H2: () => orderBuilder({ items: LAB.chainItems, order: d.chainOrder, defaultOrder: LAB.chainDisplayOrder, key: 'chainOrder', aria: 'Attack chain reconstruction builder' }),
      H3: () => '<div><label class="field-label" for="vector-input">One line: the initial access vector, with the service and method.</label>' +
        '<input id="vector-input" class="input mono-input" data-input="vectorInput" placeholder="e.g. brute force against …" value="' + escA(d.vectorInput) + '"></div>',
      H4: () => '<div class="stack-sm">' +
        '<div><p class="bench-q">Part 1 — Which event proves the credential reuse?</p>' +
        choiceList({ name: 'ht-event', options: HT_EVENT_OPTIONS, value: d.htEvent, attrs: radio('htEvent') }) + '</div>' +
        '<div><p class="bench-q">Part 2 — What does that event prove?</p>' +
        choiceList({ name: 'ht-proof', options: LAB.htProofOptions, value: d.htProof, attrs: radio('htProof') }) + '</div></div>',
      H6: () => '<div class="stack-sm">' +
        '<div><p class="bench-q">Part 1 — Acquit BOTH red herrings (pick two):</p>' +
        choiceList({ name: 'herrings', options: LAB.herringEventOptions, value: d.herrings, multi: true, attrs: multi('herrings') }) + '</div>' +
        '<div><p class="bench-q">Part 2 — The rationale that acquits them:</p>' +
        choiceList({ name: 'herring-why', options: LAB.herringWhyOptions, value: d.herringWhy, attrs: radio('herringWhy') }) + '</div></div>',
      H7: () => '<div>' + LAB.attackBehaviors.map((b, i) =>
        '<div class="bench-def"><p>' + esc(b.label) + '</p>' +
        benchSelect({ id: 'attack-' + b.id, value: d.attackMap[b.id] || '', options: LAB.attackOptions, placeholder: 'Map the technique…', aria: 'Technique for behavior ' + (i + 1), key: 'attackMap', slot: b.id }) +
        '</div>').join('') + '</div>',
      H8: () => '<div class="bench-grid">' +
        '<div><label class="field-label" for="rule-source">Data source</label><div style="margin-top:6px">' + benchSelect({ id: 'rule-source', value: d.rule.source, options: LAB.ruleSourceOptions, placeholder: 'Pick the source…', key: 'rule', slot: 'source' }) + '</div></div>' +
        '<div><label class="field-label" for="rule-cond">Trigger condition</label><div style="margin-top:6px">' + benchSelect({ id: 'rule-cond', value: d.rule.condition, options: LAB.ruleConditionOptions, placeholder: 'Pick the trigger…', key: 'rule', slot: 'condition' }) + '</div></div>' +
        '<div><label class="field-label" for="rule-thresh">Threshold</label><div style="margin-top:6px">' + benchSelect({ id: 'rule-thresh', value: d.rule.threshold, options: LAB.ruleThresholdOptions, placeholder: 'Pick the threshold…', key: 'rule', slot: 'threshold' }) + '</div></div>' +
        '<div><label class="field-label" for="rule-resp">Response</label><div style="margin-top:6px">' + benchSelect({ id: 'rule-resp', value: d.rule.response, options: LAB.ruleResponseOptions, placeholder: 'Pick the response…', key: 'rule', slot: 'response' }) + '</div></div>' +
        '</div>',
      H9: () => '<div class="stack-sm">' +
        '<div><p class="bench-q">Part 1 — Select every TRUE residual risk:</p>' +
        choiceList({ name: 'residual', options: LAB.residualOptions, value: d.residual, multi: true, attrs: multi('residual') }) + '</div>' +
        '<div><p class="bench-q">Part 2 — Next control investment:</p>' +
        choiceList({ name: 'next-invest', options: LAB.nextInvestOptions, value: d.nextInvest, attrs: radio('nextInvest') }) + '</div></div>',
      H10: () => {
        const sentence = LAB.riskSlots.map((slot) =>
          esc(slot.prefix || '') +
          (slot.correct !== ''
            ? '<select class="risk-slot" aria-label="Slot ' + slot.id + '" data-change="drill" data-key="riskFill" data-slot="' + slot.id + '">' +
              '<option value="" disabled' + (d.riskFill[slot.id] ? '' : ' selected') + '>___</option>' +
              LAB.riskBank.map((b) => '<option value="' + b.id + '"' + (d.riskFill[slot.id] === b.id ? ' selected' : '') + '>' + esc(b.label) + '</option>').join('') +
              '</select>' : '') +
          esc(slot.suffix || '')
        ).join('');
        return '<div class="risk-sentence"><p class="sentence">' + sentence + '</p>' +
          '<p class="risk-note">Five slots, each takes exactly one term. Bank: ' + LAB.riskBank.map((b) => esc(b.label)).join(' · ') + '.</p></div>';
      },
    };

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">05 · Drill Deck — Skill Benches</h2>' +
      '<p>' + (isMedium
        ? 'Concept benches for the guided shift: taxonomy, vocabulary, control theory, sequencing and honest limitations. Each bench feeds one assignment-sheet objective.'
        : 'Challenge benches for the silent alarm: chain reconstruction, vector naming, honeytoken proofing, herring acquittals, ATT&amp;CK mapping, rule engineering and the exec risk memo. Exact values only.') + '</p></header>' +
      '<div class="stack-sm">' +
      deckObjectives.map((o) => objectiveCard(o, session, ui, o.id === upNextId, benches[o.id] ? benches[o.id]() : '')).join('') +
      '</div></div>';
  }

  /* ── bay 06: debrief board ────────────────────────────────────────────────── */
  function renderDebriefBoard(state, session) {
    const mode = state.activeMode;
    const quiz = window.LabQuiz.render(session, mode);

    const table = '<section class="card" aria-labelledby="detection-playbook">' +
      '<h3 class="debrief-h3">The deception detection playbook</h3>' +
      '<p class="debrief-sub">Why these alerts need no baseline tuning: every rule below fires on an event that has no legitimate reason to exist.</p>' +
      '<div class="table-scroll"><table class="playbook-table"><thead><tr>' +
      '<th>Evidence source</th><th>Detection logic</th></tr></thead><tbody>' +
      LAB.detectionTable.map((r) => '<tr><td>' + esc(r.source) + '</td><td>' + esc(r.logic) + '</td></tr>').join('') +
      '</tbody></table></div></section>';

    const recs = '<section class="card" aria-labelledby="mitigation-recs">' +
      '<h3 class="debrief-h3">' + I('shieldAlert', 'ic-16') + ' Hardening recommendations for Borealis Freight</h3>' +
      '<ul class="rec-list">' + LAB.mitigationRecs.map((r) =>
        '<li><span class="ic">' + I('badge', 'ic-16') + '</span><span>' + esc(r) + '</span></li>').join('') +
      '</ul></section>';

    const takeaways = '<div class="takeaway-grid">' +
      '<section class="card takeaway blue" aria-labelledby="blue-takeaways"><h3 id="blue-takeaways">' + I('bulb', 'ic-16') + ' Blue-side takeaways</h3>' +
      '<ul>' + LAB.blueTakeaways.map((t, i) => '<li><span class="tag">B' + (i + 1) + ' ▸</span><span>' + esc(t) + '</span></li>').join('') + '</ul></section>' +
      '<section class="card takeaway red" aria-labelledby="red-takeaways"><h3 id="red-takeaways">' + I('swords', 'ic-16') + ' Red-side lens — know the other side</h3>' +
      '<ul>' + LAB.redTakeaways.map((t, i) => '<li><span class="tag">R' + (i + 1) + ' ▸</span><span>' + esc(t) + '</span></li>').join('') + '</ul></section></div>';

    const links = '<section class="card" aria-labelledby="official-links">' +
      '<h3 class="debrief-h3">Primary sources &amp; further study</h3>' +
      '<ul class="links-grid">' + LAB.officialLinks.map((l) =>
        '<li><a href="' + escA(l.url) + '" target="_blank" rel="noopener noreferrer" class="link-tile">' +
        '<span class="ic">' + I('ext', 'ic-14') + '</span>' + esc(l.label) + '</a></li>').join('') +
      '</ul></section>';

    const badge = '<span class="badge badge-rose synth-footer">SYNTHETIC TRAINING ENVIRONMENT · DEFENSIVE FRAMING ONLY · NO LIVE TECHNIQUES</span>';

    return '<div class="stack">' +
      '<header class="bay-header"><h2 class="section-title">06 · Debrief Board — Knowledge Check &amp; Takeaways</h2>' +
      '<p>The end-of-shift debrief: a scenario quiz first, then the detection playbook, the mitigation recommendations and the takeaways both sides of the fence should leave with.</p></header>' +
      quiz + table + recs + takeaways + links + badge +
      (mode === 'medium' ? '<p class="debrief-tip">Tip: the completion modal unlocks when all 12 objectives pass and every quiz question is locked in. Hard mode\'s report waits on its own 10 challenges and 7-question scenario quiz.</p>' : '') +
      '</div>';
  }

  /* ── assignment sheet ─────────────────────────────────────────────────────── */
  function renderAssignmentSheet(state, session, mode) {
    const objs = Obj.objectivesFor(mode);
    const passed = Obj.objectivesPassed(session, mode);
    const quizChecked = Obj.quizCheckedCount(session, mode);
    const quizTotal = Obj.quizFor(mode).length;
    const done = Obj.labComplete(session, mode);
    const upNext = objs.find((o) => !(session.objProgress[o.id] && session.objProgress[o.id].done));

    const rows = objs.map((o) => {
      const isDone = !!(session.objProgress[o.id] && session.objProgress[o.id].done);
      const isNext = upNext && upNext.id === o.id;
      return '<button type="button" class="sheet-row' + (isDone ? ' done' : isNext ? ' next' : '') + '" data-action="jump-bay" data-bay="' + o.bay + '" title="Go to ' + escA(bayLabel(o.bay)) + '">' +
        '<span class="ic ' + (isDone ? 'done' : isNext ? 'next' : 'idle') + '">' + (isDone ? I('check2', 'ic-16') : I('target', 'ic-16')) + '</span>' +
        '<span class="flex1"><span class="meta"><span class="oid">' + o.id + '</span>' + pillarChip(o.pillar) +
        (isNext ? '<span class="upnext">UP NEXT</span>' : '') + '</span>' +
        '<span class="t">' + esc(o.title) + '</span>' +
        '<span class="bay">→ ' + esc(bayLabel(o.bay)) + '</span></span></button>';
    }).join('');

    const quizRow = '<button type="button" class="sheet-row' + (quizChecked === quizTotal ? ' done' : '') + '" data-action="jump-bay" data-bay="debrief" title="Go to the Debrief Board">' +
      '<span class="ic ' + (quizChecked === quizTotal ? 'done' : 'idle') + '">' + I('clip', 'ic-16') + '</span>' +
      '<span class="flex1"><span class="meta"><span class="oid">KNOWLEDGE CHECK</span></span>' +
      '<span class="t">' + quizChecked + '/' + quizTotal + ' locked in — take the debrief quiz</span>' +
      '<span class="bay">→ DEBRIEF BOARD</span></span></button>';

    return '<div class="sheet">' +
      '<div class="sheet-card"><p class="sheet-title">' + I('listChecks', 'ic-16') + ' Assignment sheet</p>' +
      '<p class="sheet-mode">' + (mode === 'medium' ? 'Guided night shift' : 'Silent alarm') + ' · ' + objs.length + ' objectives</p>' +
      '<div class="sheet-stats" aria-label="Progress summary">' +
      '<div><div class="sheet-stat-row"><span>OBJECTIVES</span><b>' + passed + '/' + objs.length + '</b></div>' +
      '<div class="progress sheet-stat"><div style="width:' + (passed / objs.length) * 100 + '%"></div></div></div>' +
      '<div><div class="sheet-stat-row"><span>KNOWLEDGE CHECK</span><b>' + quizChecked + '/' + quizTotal + '</b></div>' +
      '<div class="progress sheet-stat"><div style="width:' + (quizChecked / quizTotal) * 100 + '%"></div></div></div>' +
      '<p class="sheet-mastery">MASTERY <b>' + Obj.computeScore(session, mode) + '%</b>' +
      (done ? '<span class="complete">· SHIFT COMPLETE</span>' : '') + '</p>' +
      '</div></div>' +
      '<nav class="sheet-list" aria-label="Assignment objectives">' + rows + quizRow + '</nav>' +
      (upNext ? '<button type="button" class="btn btn-solid btn-block" data-action="jump-bay" data-bay="' + upNext.bay + '">Continue: ' + upNext.id + ' ' + I('right', 'ic-14') + '</button>' : '') +
      '</div>';
  }

  /* ── top strip ────────────────────────────────────────────────────────────── */
  function pillarMeter(p, passed, total) {
    const pct = total === 0 ? 0 : Math.round((passed / total) * 100);
    const color = { understand: 'var(--amber)', recognize: 'var(--rose)', detect: 'var(--teal)', mitigate: 'var(--green)' }[p];
    return '<div class="meter" title="' + escA(PILLAR_LABEL[p] + ': ' + passed + '/' + total) + '">' +
      '<div class="meter-head"><span class="meter-name">' + PILLAR_LABEL[p] + '</span><span class="meter-count">' + passed + '/' + total + '</span></div>' +
      '<div class="meter-bar"><div style="width:' + pct + '%;background:' + color + '"></div></div></div>';
  }

  function renderTopStrip(state, session, ui) {
    const mode = state.activeMode;
    const other = mode === 'medium' ? 'hard' : 'medium';
    const objs = Obj.objectivesFor(mode);
    const passed = objs.filter((o) => session.objProgress[o.id] && session.objProgress[o.id].done).length;
    const quizChecked = Obj.quizCheckedCount(session, mode);
    const quizTotal = Obj.quizFor(mode).length;
    const score = Obj.computeScore(session, mode);
    const complete = Obj.labComplete(session, mode);
    const pillarStats = ['understand', 'recognize', 'detect', 'mitigate'].map((p) => ({
      p,
      passed: objs.filter((o) => o.pillar === p && session.objProgress[o.id] && session.objProgress[o.id].done).length,
      total: objs.filter((o) => o.pillar === p).length,
    }));

    return '<header class="top-strip"><div class="top-inner">' +
      '<div class="identity"><span class="radar">' + I('radar', 'ic-20') + '</span><div>' +
      '<p class="identity-name">Tripwire Room</p><p class="identity-sub">Borealis Freight · Deception Ops</p></div></div>' +
      '<span class="badge badge-rose synth-badge">SYNTHETIC DATA</span>' +
      '<button type="button" class="mode-btn" data-action="switch-mode" data-mode="' + other + '" title="Switch shift (progress is kept per shift)"' +
      ' aria-label="Current shift: ' + mode + '. Switch to ' + other + ' mode">' +
      (mode === 'medium' ? '<span class="ic-amber">' + I('grad', 'ic-14') + '</span>MEDIUM' : '<span class="ic-red">' + I('flame', 'ic-14') + '</span>HARD') +
      '<span class="sw">⇄</span></button>' +
      '<div class="meters" aria-label="Pillar progress meters">' + pillarStats.map((s) => pillarMeter(s.p, s.passed, s.total)).join('') + '</div>' +
      '<div class="counters" aria-live="polite">OBJ <b>' + passed + '/' + objs.length + '</b><span class="sep">|</span>' +
      'QUIZ <b>' + quizChecked + '/' + quizTotal + '</b><span class="sep">|</span><span class="score">' + score + '%</span>' +
      '<button type="button" class="btn ' + (complete ? 'btn-green' : 'btn-solid') + ' btn-sm" style="margin-left:8px" data-action="open-report" aria-label="Open shift debrief summary" data-fid="shift-report-btn">' +
      I('trophy', 'ic-14') + ' Shift report</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-action="open-glossary" aria-label="Open field manual glossary" data-fid="glossary-btn">' +
      I('book', 'ic-14') + ' <span class="hide-sm">Glossary</span></button>' +
      '</div>' +
      '<div class="reset-row"><button type="button" class="btn btn-red-outline btn-xs" data-action="open-reset" data-fid="reset-btn">' + I('rotate', 'ic-14') + ' Reset</button></div>' +
      '</div>' +
      (window.LabState.persisted ? '' : '<p class="persist-note">Persistence unavailable — progress will last only for this session</p>') +
      '</header>';
  }

  /* ── dialogs ──────────────────────────────────────────────────────────────── */
  function renderGlossaryDialog() {
    return '<div class="overlay" data-overlay="glossary"><div class="dialog md" role="dialog" aria-modal="true" aria-labelledby="glossary-title">' +
      '<div class="dialog-head"><h2 class="dialog-title" id="glossary-title">' + I('book', 'ic-16') + ' Field manual glossary</h2>' +
      '<p class="dialog-desc">15 terms the night shift runs on. Dotted-underlined words in the bays open the same definitions.</p>' +
      '<button type="button" class="dialog-x" data-action="close-glossary" aria-label="Close glossary">' + I('xc', 'ic-16') + '</button></div>' +
      '<div class="dialog-body"><ul class="glossary-list">' + LAB.glossary.map((g) =>
        '<li class="glossary-item"><p class="term-name">' + esc(g.term) + '</p><p class="def">' + esc(g.def) + '</p></li>').join('') +
      '</ul></div></div></div>';
  }

  function renderResetDialog() {
    return '<div class="overlay" data-overlay="reset"><div class="dialog md" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<div class="dialog-head"><h2 class="dialog-title" id="reset-title">Reset the station?</h2>' +
      '<p class="dialog-desc" id="reset-desc">This wipes progress for BOTH shifts — objectives, traps, sensor-wall flags, quiz answers and stars — and returns the lab to its pristine state. This cannot be undone.</p></div>' +
      '<div class="dialog-body"><div class="reset-actions">' +
      '<button type="button" class="btn btn-outline" data-action="cancel-reset">Keep my shift</button>' +
      '<button type="button" class="btn btn-red-solid" data-action="confirm-reset">Wipe and restart</button>' +
      '</div></div></div></div>';
  }

  function renderCompletionModal(state, session, mode) {
    const objs = Obj.objectivesFor(mode);
    const passed = Obj.objectivesPassed(session, mode);
    const quiz = Obj.quizFor(mode);
    const correct = Obj.quizCorrect(session, mode);
    const score = Obj.computeScore(session, mode);
    const stars = Obj.computeStars(session, mode);
    const hints = Obj.hintsUsed(session, mode);
    const misses = Obj.firstTryMisses(session, mode);
    const complete = Obj.labComplete(session, mode);
    const isMedium = mode === 'medium';

    const full = Math.floor(stars);
    const half = stars - full >= 0.5;
    let starHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) starHtml += '<span class="star-full">' + I('star', 'ic-28') + '</span>';
      else if (i === full && half) starHtml += '<span class="star-full">' + I('starHalf', 'ic-28') + '</span>';
      else starHtml += '<span class="star-empty">' + I('star', 'ic-28') + '</span>';
    }

    const verdict = stars >= 4.5
      ? 'Lead-deceptor material: bait placed with intent, evidence read like a book.'
      : stars >= 3.5
        ? 'Solid watch. The traps spoke and you understood most of what they said.'
        : stars >= 2.5
          ? 'Competent shift with a few lessons taken the hard way — rerun the shaky benches.'
          : 'The yard holds. Review the field manual, re-arm, and take another pass.';

    const pillars = ['understand', 'recognize', 'detect', 'mitigate'].map((p) => {
      const pPassed = objs.filter((o) => o.pillar === p && session.objProgress[o.id] && session.objProgress[o.id].done).length;
      const pTotal = objs.filter((o) => o.pillar === p).length;
      const pct = pTotal === 0 ? 0 : Math.round((pPassed / pTotal) * 100);
      const color = { understand: 'var(--amber)', recognize: 'var(--rose)', detect: 'var(--teal)', mitigate: 'var(--green)' }[p];
      return '<div class="pillar-row"><span class="name">' + PILLAR_LABEL[p] + '</span>' +
        '<div class="progress bar"><div style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="n">' + pPassed + '/' + pTotal + '</span></div>';
    }).join('');

    // focus areas derived from ACTUAL performance evidence — never generic filler
    const retried = objs.filter((o) => {
      const p = session.objProgress[o.id];
      return p && p.done && p.firstTry === false;
    });
    const missedQuiz = quiz.filter((q) => session.quizChecked[q.id] && session.quizAnswers[q.id] !== q.correct);
    const hasFocus = retried.length > 0 || missedQuiz.length > 0;

    let focusHtml;
    if (hasFocus) {
      focusHtml = '<ul class="focus-list" aria-label="Focus areas">' +
        retried.map((o) =>
          '<li><span class="oid">' + o.id + ' ▸ </span>Needed a second attempt. <span class="hl">Re-read the &ldquo;' + esc(o.anchor) + '&rdquo; anchor</span> on the <span class="bay">' + esc(bayLabel(o.bay)) + '</span> bay, then rerun the bench until it passes first try.</li>'
        ).join('') +
        missedQuiz.map((q) => {
          const n = quiz.indexOf(q) + 1;
          return '<li><span class="oid">Q' + pad2(n) + ' ▸ </span>Missed on the knowledge check. <span class="hl">Re-read the explanation under question ' + n + '</span> on the <span class="bay">Debrief Board</span> — it names why the right answer is right and why the tempting ones fail.</li>';
        }).join('') +
        '</ul>';
    } else {
      focusHtml = '<p class="focus-clean">Clean run — every objective passed first try and every quiz question was answered correctly. No focus areas to report; for a harder workout, switch modes or rerun for pace.</p>';
    }

    const other = isMedium ? 'hard' : 'medium';

    return '<div class="overlay" data-overlay="report"><div class="dialog lg" role="dialog" aria-modal="true" aria-labelledby="report-title">' +
      '<div class="dialog-head"><h2 class="dialog-title" id="report-title">' + I('trophy', 'ic-20') + ' Shift report — ' + (isMedium ? 'guided night shift' : 'silent alarm') + '</h2>' +
      '<p class="dialog-desc">' + (complete
        ? 'All objectives passed and the knowledge check is locked in. Here is how the shift went.'
        : 'Progress snapshot — the modal becomes a full debrief once every objective and quiz question is done.') + '</p>' +
      '<button type="button" class="dialog-x" data-action="close-report" aria-label="Close shift report">' + I('xc', 'ic-16') + '</button></div>' +
      '<div class="dialog-body stack-sm">' +
      '<div class="report-stars"><div class="star-row" role="img" aria-label="' + stars + ' out of 5 stars">' + starHtml +
      '<span class="num">' + stars.toFixed(1) + '</span></div>' +
      '<p class="verdict">' + verdict + '</p>' +
      '<p class="penalty-note">' + (isMedium ? 'penalties: 0.4★ per retried objective · 0.25★ per hint' : 'penalties: 0.6★ per retried challenge · 1.0★ per nudge') + '</p></div>' +
      '<div class="report-stats">' +
      '<div class="stat-box"><p class="v v-amber">' + score + '%</p><p class="l">MASTERY</p></div>' +
      '<div class="stat-box"><p class="v v-green">' + passed + '/' + objs.length + '</p><p class="l">OBJECTIVES</p></div>' +
      '<div class="stat-box"><p class="v v-teal">' + correct + '/' + quiz.length + '</p><p class="l">QUIZ</p></div>' +
      '<div class="stat-box"><p class="v v-rose">' + hints + '</p><p class="l">HINTS</p></div>' +
      '</div>' +
      '<div class="pillars-box"><p class="cap">Mastery pillars</p><div class="pillar-rows">' + pillars + '</div>' +
      (misses > 0 ? '<p class="misses-note">' + misses + ' objective' + (misses > 1 ? 's' : '') + ' needed a second attempt — the focus areas below name exactly which ones.</p>' : '') +
      '</div>' +
      '<div class="focus-box"><p class="focus-cap">' + I('cross', 'ic-14') + ' Focus areas — sharpen these next</p>' + focusHtml + '</div>' +
      '<div class="report-actions">' +
      '<button type="button" class="btn btn-outline" data-action="close-report">Back on shift</button>' +
      '<button type="button" class="btn btn-rose-outline" data-action="modal-switch" data-mode="' + other + '">' +
      (isMedium ? I('flame', 'ic-14') : I('grad', 'ic-14')) + ' Take the ' + (isMedium ? 'silent alarm' : 'guided shift') + '</button>' +
      '<button type="button" class="btn btn-red-outline" data-action="modal-reset">' + I('rotate', 'ic-14') + ' Reset station</button>' +
      '</div></div></div></div>';
  }

  /* ── mode select ──────────────────────────────────────────────────────────── */
  function renderModeSelect() {
    const card = (hard) =>
      '<div class="mode-card' + (hard ? ' hard' : '') + '">' +
      '<h3>' + (hard ? I('flame', 'ic-16') : I('grad', 'ic-16')) + (hard ? 'Hard — silent alarm' : 'Medium — guided night shift') + '</h3>' +
      '<ul>' + (hard
        ? ['The previous shift already armed everything — and missed exactly one critical thing',
           '14 overnight events wait in the sensor wall, including two red herrings',
           '10 multi-step challenges: triage, timeline, ATT&amp;CK mapping, rule engineering',
           'One optional nudge — it visibly costs a star',
           'Strict checks: exact values, exact IDs, near-misses rejected with reasons']
        : ['12 granular objectives, taken in order, each with &ldquo;where to look&rdquo;',
           'You arm every trap yourself, then run the recon drill',
           'Three-tier hints, freely available (costs stars, never blocks)',
           'Tolerant checks — wrong answers teach, never punish',
           '7-question concept quiz with explanations']
      ).map((li) => '<li>▸ ' + li + '</li>').join('') + '</ul>' +
      '<p class="mode-note">' + esc(LAB.manualQuizNote[hard ? 'hard' : 'medium']) + '</p>' +
      '<button type="button" class="btn ' + (hard ? 'btn-outline' : 'btn-solid') + '" data-action="enter-mode" data-mode="' + (hard ? 'hard' : 'medium') + '">' +
      (hard ? 'Take the silent alarm' : 'Start the guided shift') + '</button></div>';

    return '<div class="lab-root lab-grid"><main class="mode-wrap">' +
      '<p class="mode-kicker"><span class="ic">' + I('radar', 'ic-16') + '</span>Borealis Freight &amp; Logistics — Deception Ops</p>' +
      '<h1 class="mode-title">The Tripwire Room</h1>' +
      '<p class="mode-sub">An interactive practice lab for <strong>CompTIA Network+ (N10-009)</strong>, Domain 4 — Network Security · objective 4.1: <em>deception technologies</em> (honeypot, honeynet) and the security terminology <em>risk, vulnerability, exploit, threat</em> and the <em>CIA triad</em>.</p>' +
      '<div class="mode-synthetic"><span class="badge badge-rose">SYNTHETIC TRAINING ENVIRONMENT — every host, IP, domain, credential and log line on this page is fictional</span></div>' +
      '<section class="briefing" aria-labelledby="briefing"><h2 id="briefing">Scenario briefing — night shift at Borealis Freight</h2>' +
      '<div class="briefing-body"><p>Borealis Freight moves perishable cargo across three countries — and ransomware crews have been hitting logistics firms all year. Last quarter a contractor laptop sat compromised on Borealis&rsquo; network for <strong> 19 days</strong> before anyone noticed. The CISO has approved a deception program: decoy systems in a fenced &ldquo;decoy yard&rdquo;, bait files on real servers, a fake account that no human should ever use, a DNS sinkhole, and a tarpit on the edge.</p>' +
      '<p>You are the <strong>night-shift deception-ops engineer</strong>. Tonight you will arm the traps yourself, run a simulated intruder drill against them, watch what trips and what slips past unseen, and learn the playbook for when a tripwire fires. Master it and you can explain, recognize, detect and mitigate exactly what objective 4.1 of the exam tests.</p></div></section>' +
      '<section aria-labelledby="choose-mode"><h2 id="choose-mode" class="sr-only">Choose your shift</h2>' +
      '<div class="mode-cards">' + card(false) + card(true) + '</div></section>' +
      '<p class="mode-foot"><span class="ic">' + I('shieldCheck', 'ic-14') + '</span>Both shifts share the same environment core; your progress is saved per shift on this device only. Everything is simulated for defense-focused learning — nothing here is operational attack tooling.</p>' +
      '</main></div>';
  }

  /* ── shell ────────────────────────────────────────────────────────────────── */
  function renderBay(bay, state, session, ui) {
    switch (bay) {
      case 'manual': return renderFieldManual(ui);
      case 'rack': return renderTrapRack(state, session, ui);
      case 'yard': return renderYardMap(session, ui);
      case 'wall': return renderSensorWall(state, session, ui);
      case 'deck': return renderDrillDeck(state, session, ui);
      case 'debrief': return renderDebriefBoard(state, session);
      default: return '';
    }
  }

  function renderShell(state, ui) {
    const mode = state.activeMode;
    const session = state.sessions[mode];
    const complete = Obj.labComplete(session, mode);
    const modalOpen = ui.reportOpenRaw || (complete && !session.completedShown);
    const objTotal = Obj.objectivesFor(mode).length;
    const quizTotal = Obj.quizFor(mode).length;
    const passed = Obj.objectivesPassed(session, mode);
    const quizChecked = Obj.quizCheckedCount(session, mode);

    const tabs = LAB.bays.map((b) =>
      '<button type="button" class="bay-tab' + (ui.bay === b.id ? ' active' : '') + '" data-action="jump-bay" data-bay="' + b.id + '"' +
      (ui.bay === b.id ? ' aria-current="page"' : '') + '><span class="num">' + b.num + '</span>' + b.label + '</button>'
    ).join('');

    return renderTopStrip(state, session, ui) +
      '<div class="content">' +
      '<nav class="bay-tabs" aria-label="Station bays">' + tabs + '</nav>' +
      '<div class="layout">' +
      '<main aria-label="Active bay"><div class="bay-body" data-bay="' + ui.bay + '">' + renderBay(ui.bay, state, session, ui) + '</div></main>' +
      '<aside class="sheet-col" aria-label="Assignment sheet dock"><div class="sheet-sticky">' + renderAssignmentSheet(state, session, mode) + '</div></aside>' +
      '</div></div>' +
      '<div class="dock-bar"><button type="button" class="btn btn-solid dock-btn" data-action="open-dock" aria-label="Open assignment sheet">' +
      I('listChecks', 'ic-16') + ' Assignment sheet · OBJ ' + passed + '/' + objTotal + ' · QUIZ ' + quizChecked + '/' + quizTotal + '</button></div>' +
      (ui.dockOpen ? '<div class="overlay" data-overlay="dock" style="align-items:flex-end;padding:0"><div class="dialog" role="dialog" aria-modal="true" aria-label="Assignment sheet" style="max-width:none;border-radius:16px 16px 0 0;max-height:85dvh">' +
        '<div class="dialog-head"><h2 class="dialog-title">Assignment sheet — ' + (mode === 'medium' ? 'guided night shift' : 'silent alarm') + '</h2>' +
        '<button type="button" class="dialog-x" data-action="close-dock" aria-label="Close assignment sheet">' + I('xc', 'ic-16') + '</button></div>' +
        '<div class="dialog-body" style="max-height:70dvh;overflow-y:auto">' + renderAssignmentSheet(state, session, mode) + '</div>' +
        '</div></div>' : '') +
      (ui.glossaryOpen ? renderGlossaryDialog() : '') +
      (ui.resetOpen ? renderResetDialog() : '') +
      (modalOpen ? renderCompletionModal(state, session, mode) : '');
  }

  window.LabUI = {
    esc, escA, icon, I, pillarChip, severityDot, term, bayLabel, pad2,
    switchEl, selectEl, choiceList, orderBuilder, checkResult,
    renderModeSelect, renderShell, renderBay, renderAssignmentSheet,
    renderGlossaryDialog, renderResetDialog, renderCompletionModal,
    renderTopStrip,
  };
})();
