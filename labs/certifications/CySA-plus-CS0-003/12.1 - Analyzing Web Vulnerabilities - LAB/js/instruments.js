// CyberLab 12.1 — the eight bench instruments
// Static port of the original instrument components. Rendering is template
// strings; events are delegated (app.js). Local (non-persisted) view state
// mirrors the original React useState (reset when an instrument mounts).
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';
  const { ui, ICONS } = CL;
  const { esc, SectionLabel, Bezel, CheckButton, FeedbackBlock, Sel, RadioList, CheckRow, SwitchRow, TrainingChip } = ui;
  const D = CL.DATA;
  const store = CL.store;
  const A = () => CL.actions;

  // ---------------------------------------------------------------- view state
  // Mirrors the instruments' React useState — reset whenever they mount.
  const V = {
    target: { page: 'login', id: '1001', apiId: '1001', u: '', p: '', msg: null, q: '', submitted: '' },
    sast: { fileId: D.CODE_FILES[0].id, selected: null, flaw: '' },
    dast: { crawlLines: null, scanPct: null }, // null → derive from store on mount
    fuzz: { running: false },
    config: { tab: 'headers' },
    triage: { tab: 'queue' },
  };
  function resetView(inst) {
    if (inst === 'target') V.target = { page: 'login', id: '1001', apiId: '1001', u: '', p: '', msg: null, q: '', submitted: '' };
    if (inst === 'sast') V.sast = { fileId: D.CODE_FILES[0].id, selected: null, flaw: '' };
    if (inst === 'dast') V.dast = { crawlLines: store.state.crawlDone ? D.CRAWL_LOG.slice() : [], scanPct: store.state.scanDone ? 100 : 0 };
    if (inst === 'fuzz') V.fuzz = { running: false };
    if (inst === 'config') V.config = { tab: 'headers' };
    if (inst === 'triage') V.triage = { tab: 'queue' };
  }
  CL.instrumentViews = V;
  CL.resetInstrumentView = resetView;

  const SEV_STYLE = {
    high: 'sev-high',
    medium: 'sev-medium',
    low: 'sev-low',
    info: 'sev-info',
  };

  function ans(objId) {
    const a = store.state.answers[objId];
    return a && typeof a === 'object' ? a : {};
  }

  // ================================================================ TARGET
  const PAGES = [
    { id: 'login', url: '/login', label: 'Login' },
    { id: 'records', url: '/records?id=1001', label: 'Records' },
    { id: 'search', url: '/search?q=', label: 'Search' },
    { id: 'admin', url: '/admin', label: 'Admin' },
    { id: 'uploads', url: '/uploads/', label: 'Uploads' },
    { id: 'api', url: '/api/records?id=1001', label: 'API' },
    { id: 'error404', url: '/definitely-not-a-page', label: '404' },
    { id: 'robots', url: '/robots.txt', label: 'robots' },
  ];

  const PATIENTS = {
    r1001: { name: 'Dana Whitfield', mrn: 'MC-771204 (synthetic)', note: 'Follow-up: cardiology, 14 Mar. Vitals stable.' },
    r1002: { name: 'Marcus Bell', mrn: 'MC-883911 (synthetic)', note: 'Prescription renewal pending pharmacist review.' },
    r1003: { name: 'Elena Sousa', mrn: 'MC-902245 (synthetic)', note: 'Imaging results released to portal.' },
  };

  function TargetPage(page) {
    const t = V.target;
    switch (page) {
      case 'login':
        return `
          <div class="target-login">
            <h2 class="target-login-title">Staff sign-in</h2>
            <div class="stack">
              <div>
                <label for="t-u" class="field-label">Username</label>
                <input id="t-u" class="input" value="${esc(t.u)}" placeholder="username" autocomplete="off" data-input data-input-target="u" />
              </div>
              <div>
                <label for="t-p" class="field-label">Password</label>
                <input id="t-p" type="password" class="input" value="${esc(t.p)}" placeholder="password" autocomplete="off" data-input data-input-target="p" />
              </div>
              <button type="button" class="btn btn-primary btn-block" data-action="login-submit">Sign in</button>
            </div>
            ${t.msg ? `<div class="note ${t.msg.ok ? 'note-pass' : 'note-fail'}" role="status">${esc(t.msg.text)}</div>` : ''}
          </div>`;
      case 'records': {
        const pt = PATIENTS['r' + t.id];
        return `
          <div>
            ${SectionLabel('Patient record lookup — try the id parameter', 'mb-2')}
            <div class="chip-row">
              ${['1001', '1002', '1003'].map((n) => `<button type="button" class="chip${t.id === n ? ' chip-active' : ''}" data-action="records-id" data-n="${n}">id=${n}</button>`).join('')}
            </div>
            <div class="panel-elevated mt-3">
              <div class="text-sm font-semibold">${esc(pt.name)}</div>
              <div class="mono-dim">MRN ${esc(pt.mrn)}</div>
              <p class="mt-2 text-xs">${esc(pt.note)}</p>
              <p class="micro-note">Notice: changing id in the URL switches records — no ownership check fires. (Synthetic patients.)</p>
            </div>
          </div>`;
      }
      case 'search': {
        const xss = t.submitted.includes('<');
        return `
          <div>
            ${SectionLabel('Search notes', 'mb-2')}
            <form class="search-form" data-action="search-submit">
              <input class="input" value="${esc(t.q)}" placeholder="try: cardiology  or  &lt;script&gt;alert(1)&lt;/script&gt;" aria-label="Search query" data-input data-input-target="q" />
              <button type="submit" class="btn btn-outline">Search</button>
            </form>
            ${t.submitted ? `
              <div class="mt-3">
                <div class="mono-dim">GET /search?q=<span class="text-amber">${esc(t.submitted)}</span></div>
                <div class="panel-elevated mt-2">Results for ${xss
                  ? '<span class="xss-chip">&lt;script&gt; executed — payload rendered unencoded (training marker)</span>'
                  : `<span class="font-semibold">${esc(t.submitted)}</span>`}
                </div>
                ${xss ? '<p class="micro-note mt-2">Sandboxed marker only — nothing executes here; the chip represents what a real browser would do with unencoded reflection.</p>' : ''}
              </div>` : ''}
          </div>`;
      }
      case 'admin':
        return `<pre class="pre">${esc(D.CONFIG_ADMIN.join('\n'))}</pre>`;
      case 'uploads':
        return `
          <div>
            ${SectionLabel('Index of /uploads/', 'mb-2')}
            <ul class="uploads-list">
              <li>📄 marketing_q4_launch.pdf — 1.2 MB</li>
              <li>📄 logo_flat.png — 84 KB</li>
              <li>📄 team_photo_2024.jpg — 3.4 MB</li>
              <li>📁 assets/</li>
            </ul>
            <p class="micro-note mt-2">autoindex renders a browsable index — benign files here, but listing is a misconfiguration with real blast radius.</p>
          </div>`;
      case 'api': {
        const p = PATIENTS['r' + V.target.apiId];
        const json = JSON.stringify({ id: Number(V.target.apiId), name: p.name, mrn: p.mrn, scope: 'self' }, null, 2);
        return `
          <div>
            ${SectionLabel('API endpoint — no Authorization header required', 'mb-2')}
            <div class="chip-row">
              ${['1001', '1002', '1003'].map((n) => `<button type="button" class="chip${V.target.apiId === n ? ' chip-active' : ''}" data-action="api-id" data-n="${n}">id=${n}</button>`).join('')}
            </div>
            <pre class="pre pre-json mt-3">${esc(json)}</pre>
            <p class="micro-note mt-2">Sequential ids 1001–1003 all resolve without a session — the object-level check the scanner heuristically flagged.</p>
          </div>`;
      }
      case 'error404':
        return `<pre class="pre pre-error">${esc(`Traceback (most recent call last):
  File "/srv/app/router.py", line 214, in dispatch
  File "/srv/app/views/patient.py", line 58, in lookup
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.SyntaxError)
syntax error at or near "'1001'" at character 92

--- environment ---
APP_ENV=staging   DEBUG=True   DB=pg13@10.30.4.21:5432/portal`)}</pre>`;
      case 'robots':
        return `<pre class="pre">${esc('User-agent: *\nDisallow: /admin\nDisallow: /internal\nDisallow: /backup')}</pre>`;
      default:
        return '';
    }
  }

  function IdorAssessment() {
    const value = ans('OBJ-H3');
    const lastResult = store.state.lastResult['OBJ-H3'];
    return `
      <div class="task-card amber mt-4">
        ${SectionLabel('Analyst assessment — OBJ-H3 · the silent logic flaw', 'text-amber mb-1')}
        <p class="task-text mb-3">You just walked the id sequence on the API page. Decide the three questions below, then check results.</p>
        <div class="grid-3">
          ${Sel({ label: '1 · The control that actually stops IDOR', value: value.control, objId: 'OBJ-H3', field: 'control', options: [
            { id: 'ctl_authz', label: 'Server-side ownership check on every access' },
            { id: 'ctl_uuid', label: 'Random UUIDs instead of sequential ids' },
            { id: 'ctl_waf', label: 'WAF rule blocking sequential patterns' },
          ] })}
          ${Sel({ label: '2 · Why scanners only flag it heuristically', value: value.missed, objId: 'OBJ-H3', field: 'missed', options: [
            { id: 'miss_logic', label: 'Business-logic flaw — humans judge exploitability' },
            { id: 'miss_enc', label: 'The payload was URL-encoded incorrectly' },
            { id: 'miss_scope', label: 'The endpoint was outside the crawl scope' },
          ] })}
          ${Sel({ label: '3 · The verification a human must run', value: value.verify, objId: 'OBJ-H3', field: 'verify', options: [
            { id: 'ver_twoacct', label: 'Two-account test: A must not read B' },
            { id: 'ver_nmap', label: 'Re-run the network scanner on the API host' },
            { id: 'ver_header', label: 'Inspect caching response headers' },
          ] })}
        </div>
        <div class="row-flex mt-3">
          ${CheckButton('OBJ-H3')}
          ${lastResult ? '<span class="micro-note">validated on the bench</span>' : ''}
        </div>
        ${lastResult ? FeedbackBlock(lastResult) : ''}
      </div>`;
  }

  function targetInstrument() {
    const mode = store.state.mode;
    return Bezel({
      title: 'Target browser',
      sub: D.TARGET.app + ' ' + D.TARGET.version,
      icon: ICONS.Globe('h-4 w-4'),
      actions: TrainingChip(),
      body: `
        <div class="chip-row mb-3" role="tablist" aria-label="Target pages">
          ${PAGES.map((p) => `<button type="button" role="tab" aria-selected="${V.target.page === p.id}" class="chip${V.target.page === p.id ? ' chip-active' : ''}" data-action="target-page" data-page="${p.id}">${p.label}</button>`).join('')}
        </div>
        <div class="target-window">
          <div class="urlbar"><span class="status-200">200 OK</span><span class="url-text break-all">https://${esc(D.TARGET.host)}${esc(PAGES.find((p) => p.id === V.target.page)?.url || '')}</span></div>
          <div class="p-4">${TargetPage(V.target.page)}</div>
        </div>
        ${mode === 'hard' ? IdorAssessment() : ''}
        <p class="micro-note mt-4">${esc(D.TRAINING_NOTICE)}</p>`,
    });
  }

  // ================================================================ TOOL RACK
  function M1Widget() {
    const value = ans('OBJ-M1');
    const lastResult = store.state.lastResult['OBJ-M1'];
    return `
      <section aria-label="Sort the tool rack">
        ${SectionLabel('OBJ-M1 · sort the tool rack', 'text-amber mb-1')}
        <p class="instr-intro">Eight instruments ship with this bench. Assign each to its category — the lane a tool drives in determines what it can and cannot see.</p>
        <div class="grid-2">
          ${D.TOOLS.map((t) => `
            <div class="panel-elevated">
              <div class="text-sm font-semibold">${esc(t.name)}</div>
              <p class="micro-note mb-2">${esc(t.blurb)}</p>
              ${Sel({ label: 'Category — ' + t.name, value: value[t.id], objId: 'OBJ-M1', field: t.id, options: D.TOOL_CATS })}
            </div>`).join('')}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-M1')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function M2Widget() {
    const selected = Array.isArray(store.state.answers['OBJ-M2']) ? store.state.answers['OBJ-M2'] : [];
    const lastResult = store.state.lastResult['OBJ-M2'];
    return `
      <section aria-label="General versus specialized coverage">
        ${SectionLabel('OBJ-M2 · general vs specialized coverage', 'text-amber mb-1')}
        <p class="instr-intro">Six findings arrived this week. Check the three the <strong>generalized network scanner</strong> already reported — the rest are what only a web application scanner could surface.</p>
        <ul class="check-list">
          ${D.M2_FINDINGS.map((f) => CheckRow({ id: 'm2-' + f.id, checked: selected.includes(f.id), objId: 'OBJ-M2', item: f.id, text: f.text })).join('')}
        </ul>
        <div class="mt-3">
          ${CheckButton('OBJ-M2')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function M8Widget() {
    const value = ans('OBJ-M8');
    const lastResult = store.state.lastResult['OBJ-M8'];
    const opts = D.TOOL_CATS.filter((c) => c.id !== 'general');
    return `
      <section aria-label="Right technique for the job">
        ${SectionLabel('OBJ-M8 · right technique for the job', 'text-amber mb-1')}
        <p class="instr-intro">Three requests landed on your desk. For each, which technique do you deploy first?</p>
        <div class="grid-3">
          ${D.M8_SCENARIOS.map((s) => `
            <div class="panel-elevated">
              <p class="micro-note mb-2">${esc(s.text)}</p>
              ${Sel({ label: 'Technique — ' + s.id.toUpperCase(), value: value[s.id], objId: 'OBJ-M8', field: s.id, options: opts })}
            </div>`).join('')}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-M8')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function H7Widget() {
    const a = store.state.answers['OBJ-H7'] || {};
    const gaps = Array.isArray(a.gaps) ? a.gaps : [];
    const lastResult = store.state.lastResult['OBJ-H7'];
    return `
      <section aria-label="Coverage gap analysis">
        ${SectionLabel('OBJ-H7 · coverage gap analysis', 'text-rose mb-1')}
        <p class="instr-intro">The campaign so far: unauthenticated DAST pass + generalized host scan + config probe. Mark the three areas it did NOT cover, then choose the follow-up that closes the most gaps at once.</p>
        <ul class="check-list">
          ${D.COVERAGE_ITEMS.map((c) => CheckRow({ id: 'h7-' + c.id, checked: gaps.includes(c.id), objId: 'OBJ-H7', field: 'gaps', item: c.id, text: c.text })).join('')}
        </ul>
        <div class="mt-3">
          ${Sel({ label: 'Follow-up technique', value: a.next, objId: 'OBJ-H7', field: 'next', options: D.COVERAGE_NEXT })}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H7')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function toolrackInstrument() {
    const mode = store.state.mode;
    return Bezel({
      title: 'Tool rack',
      sub: 'know your instruments',
      icon: ICONS.Wrench('h-4 w-4'),
      body: `<div class="stack-lg">${mode === 'medium' ? M1Widget() + M2Widget() + M8Widget() : H7Widget()}</div>`,
    });
  }

  // ================================================================ SAST
  function sastInstrument() {
    const mode = store.state.mode;
    const v = V.sast;
    const file = D.CODE_FILES.find((f) => f.id === v.fileId);
    const answer = store.state.answers['OBJ-M3'];
    const current = answer || { file: v.selected ? v.selected.file : '', line: v.selected ? v.selected.line : 0, flaw: v.flaw };
    const lastResult = store.state.lastResult['OBJ-M3'];
    return Bezel({
      title: 'SAST unit — static analysis',
      sub: 'source-level pattern review',
      icon: ICONS.FileCode2('h-4 w-4'),
      body: `
        <p class="instr-intro mb-3">Static analysis reads the code without running it. Review all three files — one is the remediated reference pattern — then complete the task card below.</p>
        <div class="chip-row mb-2" role="tablist" aria-label="Source files">
          ${D.CODE_FILES.map((f) => `<button type="button" role="tab" aria-selected="${v.fileId === f.id}" class="chip${v.fileId === f.id ? ' chip-active' : ''}" data-action="sast-file" data-file="${f.id}">${esc(f.name)}</button>`).join('')}
        </div>
        <div class="code-window">
          <div class="code-note">${esc(file.note)}</div>
          <div class="code-lines">
            ${file.lines.map((ln, i) => {
              const n = i + 1;
              const isSel = v.selected && v.selected.file === v.fileId && v.selected.line === n;
              return `<button type="button" aria-pressed="${isSel}" aria-label="Line ${n}" class="code-line${isSel ? ' code-line-active' : ''}" data-action="sast-line" data-line="${n}">
                <span class="code-num${isSel ? ' code-num-active' : ''}">${n}</span>
                <span class="code-src">${esc(ln || ' ')}</span>
              </button>`;
            }).join('')}
          </div>
        </div>
        ${mode === 'medium' ? `
          <div class="task-card amber mt-4">
            ${SectionLabel('Task — OBJ-M3 · static analysis pass', 'text-amber mb-1')}
            <p class="task-text mb-3">Click the exact line where untrusted input is concatenated into a SQL statement (in the right file), then classify the flaw.</p>
            <div class="row-flex wrap">
              <div class="mono-dim">Selected: <span class="text-amber">${current.file ? esc(current.file) + ':' + esc(current.line) : '— click a line —'}</span></div>
              ${Sel({ label: 'Flaw classification', value: v.flaw || answer?.flaw, objId: 'OBJ-M3', field: 'flaw', options: D.M3_FLAW_OPTIONS, className: 'sel-w56' })}
              ${CheckButton('OBJ-M3')}
            </div>
            ${lastResult ? FeedbackBlock(lastResult) : ''}
          </div>` : ''}`,
    });
  }

  // ================================================================ DAST
  function Preflight() {
    const mode = store.state.mode;
    const value = ans('OBJ-M12');
    const lastResult = store.state.lastResult['OBJ-M12'];
    if (mode !== 'medium') return '';
    return `
      <section aria-label="Scan pre-flight plan">
        ${SectionLabel('Pre-flight — OBJ-M12 · plan a safe scan', 'mb-2')}
        <p class="instr-intro mb-3">A web scanner is a loaded tool. Configure the quarterly plan: four safe practices ON, three unsafe ones OFF.</p>
        <ul class="check-list">
          ${D.SCAN_PLAN.map((s) => SwitchRow({ text: s.text, checked: !!value[s.id], objId: 'OBJ-M12', item: s.id })).join('')}
        </ul>
        <div class="mt-3">
          ${CheckButton('OBJ-M12')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function ScanRig() {
    const s = store.state;
    const v = V.dast;
    if (v.crawlLines === null) v.crawlLines = s.crawlDone ? D.CRAWL_LOG.slice() : [];
    if (v.scanPct === null) v.scanPct = s.scanDone ? 100 : 0;
    const pctText = s.scanDone
      ? '14 plugins — complete. Alerts posted to triage board.'
      : v.scanPct > 0
        ? 'attacking ' + Math.min(9, Math.ceil(v.scanPct / 11)) + '/9 URLs…'
        : 'idle — crawl first';
    return `
      <section aria-label="Crawl and active scan">
        ${SectionLabel('Scan rig', 'mb-2')}
        <div class="grid-2">
          <div class="panel-elevated">
            <div class="row-between">
              <span class="mono-label">1 · Crawler</span>
              <button type="button" class="btn btn-outline mono-btn" data-action="crawl"${s.crawlDone ? ' disabled' : ''}>${s.crawlDone ? 'crawled ✓' : 'Run crawl'}</button>
            </div>
            <div class="term" aria-live="polite" aria-label="Crawler log">
              ${v.crawlLines.length === 0 ? '<span class="term-idle">$ waiting…</span>' : v.crawlLines.map((l) => '<div>' + esc(l) + '</div>').join('')}
            </div>
          </div>
          <div class="panel-elevated">
            <div class="row-between">
              <span class="mono-label">2 · Active scan</span>
              <button type="button" class="btn btn-outline mono-btn" data-action="scan"${!s.crawlDone || s.scanDone ? ' disabled' : ''}>${s.scanDone ? 'scanned ✓' : 'Run active scan'}</button>
            </div>
            <div class="mt-3">
              <div class="progress" role="progressbar" aria-valuenow="${v.scanPct}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-fill" style="width:${v.scanPct}%"></div>
              </div>
              <div class="micro-note mt-1">${esc(pctText)}</div>
            </div>
            ${s.scanDone ? '<p class="micro-note mt-2">The scanner attacked every crawled parameter and header it knew. Judgment is still yours — open the <span class="text-amber">Triage board</span>.</p>' : ''}
          </div>
        </div>
        ${s.scanDone ? `
          <div class="mt-4">
            ${SectionLabel('Alert table', 'mb-2')}
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Severity</th><th>Finding</th><th>Location</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  ${D.ALERTS.filter((a) => a.origin === 'web-scan').map((a) => `
                    <tr>
                      <td><span class="sev ${SEV_STYLE[a.sev]}">${a.sev}</span></td>
                      <td class="text-strong">${esc(a.title)}</td>
                      <td class="mono-dim">${esc(a.loc)}</td>
                      <td class="text-dim">${esc(a.detail)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
            ${M4Picker()}
          </div>` : ''}
      </section>`;
  }

  function M4Picker() {
    const mode = store.state.mode;
    if (mode !== 'medium') return '';
    const answer = store.state.answers['OBJ-M4'];
    const lastResult = store.state.lastResult['OBJ-M4'];
    const options = D.ALERTS.filter((a) => a.origin === 'web-scan' && (a.sev === 'high' || a.sev === 'medium'));
    return `
      <div class="task-card amber mt-4">
        ${SectionLabel('Task — OBJ-M4 · dynamic scan pass', 'text-amber mb-1')}
        <p class="task-text mb-3">One of these alerts is the highest-severity <em>confirmed application flaw</em>. Select it, then check.</p>
        ${RadioList({ name: 'obj-m4', value: answer, objId: 'OBJ-M4', options: options.map((o) => ({ id: o.id, label: o.title + ' — ' + o.loc + ' (' + o.sev + ')' })) })}
        <div class="mt-3">
          ${CheckButton('OBJ-M4')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function dastInstrument() {
    return Bezel({
      title: 'DAST unit — dynamic scan',
      sub: 'crawl → attack the running app',
      icon: ICONS.Radar('h-4 w-4'),
      body: `<div class="stack-lg">${Preflight()}${ScanRig()}</div>`,
    });
  }

  // ================================================================ FUZZER
  function M6Widget() {
    const answer = store.state.answers['OBJ-M6'];
    const lastResult = store.state.lastResult['OBJ-M6'];
    return `
      <div class="task-card amber">
        ${SectionLabel('Task — OBJ-M6 · fuzz the parameter', 'text-amber mb-1')}
        <p class="task-text mb-3">Which single payload proves the endpoint is returning data it should not?</p>
        ${RadioList({ name: 'obj-m6', value: answer, objId: 'OBJ-M6', options: D.FUZZ_ROWS.map((r) => ({ id: r.id, label: r.payload + ' — ' + r.status + ' / ' + r.len + ' B' })) })}
        <div class="mt-3">
          ${CheckButton('OBJ-M6')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function H2Widget() {
    const value = ans('OBJ-H2');
    const lastResult = store.state.lastResult['OBJ-H2'];
    const payloadOpts = D.FUZZ_ROWS.map((r) => ({ id: r.id, label: r.id + ' — ' + r.payload }));
    return `
      <div class="task-card rose">
        ${SectionLabel('Task — OBJ-H2 · prove the injection', 'text-rose mb-1')}
        <p class="task-text mb-3">Build the full proof from the table: error-based, boolean-true, boolean-false, data-exposure — then select the only fix that removes the flaw class.</p>
        <div class="grid-3">
          ${Sel({ label: '1 · Error-based payload', value: value.error, objId: 'OBJ-H2', field: 'error', options: payloadOpts })}
          ${Sel({ label: '2 · Boolean-true probe', value: value.pairTrue, objId: 'OBJ-H2', field: 'pairTrue', options: payloadOpts })}
          ${Sel({ label: '3 · Boolean-false probe', value: value.pairFalse, objId: 'OBJ-H2', field: 'pairFalse', options: payloadOpts })}
          ${Sel({ label: '4 · Data-exposure payload', value: value.exposure, objId: 'OBJ-H2', field: 'exposure', options: payloadOpts })}
          ${Sel({ label: '5 · The fix that removes the class', value: value.fix, objId: 'OBJ-H2', field: 'fix', options: D.FIX_OPTIONS })}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H2')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function fuzzInstrument() {
    const s = store.state;
    const running = V.fuzz.running;
    return Bezel({
      title: 'Fuzzer',
      sub: 'malformed input → anomalous behavior',
      icon: ICONS.FlaskConical('h-4 w-4'),
      body: `
        <p class="instr-intro mb-3">The fuzzer replays a payload set against one parameter and records every response. Read the table like an analyst: status, length, and note — always against the baseline row.</p>
        <div class="row-flex wrap gap-3 panel-elevated">
          <div class="mono-dim">Target: <span class="text-amber">${esc(D.FUZZ_TARGET)}</span></div>
          <div class="micro-note">payload set: SQL injection metacharacters</div>
          <button type="button" class="btn btn-primary btn-ml" data-action="fuzz-run"${running ? ' disabled' : ''}>${running ? 'fuzzing…' : s.fuzzRuns > 0 ? 'Re-run' : 'Run fuzzer'}</button>
        </div>
        ${s.fuzzRuns > 0 ? `
          <div class="table-wrap mt-4" aria-live="polite">
            <table class="data-table">
              <thead><tr><th>#</th><th>Payload</th><th>Status</th><th>Length</th><th>Time</th><th>Note</th></tr></thead>
              <tbody>
                ${D.FUZZ_ROWS.map((r) => {
                  const anomaly = r.len > 4000 || r.status >= 500 || r.id === 'p5';
                  return `<tr${anomaly ? ' class="row-anomaly"' : ''}>
                    <td class="mono-dim">${r.id}</td>
                    <td class="mono-amber">${esc(r.payload)}</td>
                    <td class="${r.status >= 500 ? 'text-rose' : ''}">${r.status}</td>
                    <td class="${r.len > 4000 ? 'text-amber' : r.len !== 1187 && r.id !== 'p1' ? 'text-dim' : ''}">${r.len}</td>
                    <td class="mono-dim">${r.ms} ms</td>
                    <td class="text-dim">${esc(r.note)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>` : ''}
        ${s.fuzzRuns > 0 ? `<div class="stack-lg mt-4">${s.mode === 'medium' ? M6Widget() : H2Widget()}</div>` : ''}`,
    });
  }

  // ================================================================ DEBUGGER
  const DEBUG_ORDER = ['idle', 'attached', 'breakpoint', 'running', 'hit', 'stepped', 'revealed'];

  function DebugControls() {
    const state = store.state.debugState;
    const disabled = state === 'revealed';
    const label =
      state === 'idle' ? 'Attach to PID 4171'
      : state === 'attached' ? 'Set breakpoint on auth_check'
      : state === 'breakpoint' ? 'Run (F9)'
      : state === 'running' ? 'running…'
      : state === 'hit' ? 'Step into handle_migrate (F11)'
      : state === 'stepped' ? 'Dump executed strings'
      : 'session complete';
    const Icon = state === 'idle' ? 'Link2' : state === 'attached' ? 'Pause' : state === 'hit' ? 'StepForward' : 'Play';
    const hint =
      state === 'idle' ? 'The debugger needs a process. portal-agent (PID 4171) is the authorized training target.'
      : state === 'attached' ? 'Choose a breakpoint where a decision is made — auth_check is the natural gate.'
      : state === 'breakpoint' ? 'Run the process; it will freeze the instant auth_check is entered.'
      : state === 'running' ? 'waiting for breakpoint…'
      : state === 'hit' ? 'Frozen mid-flight. Read the locals, then step into the maintenance handler.'
      : state === 'stepped' ? 'The step landed inside handle_migrate. Now dump the strings touched by executed paths.'
      : 'Runtime secrets extracted. Report them below.';
    return `
      <div class="panel-elevated">
        ${SectionLabel('Controls', 'mb-2')}
        <button type="button" class="btn btn-primary btn-block" data-action="debug-step"${disabled || state === 'running' ? ' disabled' : ''}>
          ${ICONS[Icon]('h-4 w-4')} ${esc(label)}
        </button>
        <p class="micro-note mt-2">${esc(hint)}</p>
      </div>`;
  }

  function M7Widget() {
    const debugState = store.state.debugState;
    const answer = store.state.answers['OBJ-M7'];
    const lastResult = store.state.lastResult['OBJ-M7'];
    return `
      <div class="task-card amber">
        ${SectionLabel('Task — OBJ-M7 · debug the binary', 'text-amber mb-1')}
        <p class="task-text mb-3">Enter the hidden route the debugger revealed (exact value).</p>
        <div class="row-flex wrap">
          <input class="input input-mono w-64" value="${esc(answer ?? '')}" ${debugState !== 'revealed' ? 'disabled' : ''}
            placeholder="${debugState === 'revealed' ? '/…' : 'drive the debugger first…'}"
            aria-label="Hidden route" data-input data-input-obj="OBJ-M7" />
          ${CheckButton('OBJ-M7', debugState !== 'revealed')}
        </div>
        ${lastResult ? FeedbackBlock(lastResult) : ''}
      </div>`;
  }

  function H4Widget() {
    const debugState = store.state.debugState;
    const value = ans('OBJ-H4');
    const lastResult = store.state.lastResult['OBJ-H4'];
    return `
      <div class="task-card rose">
        ${SectionLabel('Task — OBJ-H4 · break it open', 'text-rose mb-1')}
        <p class="task-text mb-3">Report all three extracted artifacts — exact values required.</p>
        <div class="grid-3">
          <div>
            <div class="sel-label">1 · Embedded service credential</div>
            <input class="input input-mono" value="${esc(value.cred ?? '')}" ${debugState !== 'revealed' ? 'disabled' : ''}
              placeholder="user:pass" aria-label="Embedded credential" data-input data-input-obj="OBJ-H4" data-input-field="cred" />
          </div>
          <div>
            <div class="sel-label">2 · Hidden route</div>
            <input class="input input-mono" value="${esc(value.route ?? '')}" ${debugState !== 'revealed' ? 'disabled' : ''}
              placeholder="/…" aria-label="Hidden route" data-input data-input-obj="OBJ-H4" data-input-field="route" />
          </div>
          ${Sel({ label: '3 · Operational impact of DBG_MODE=1', value: value.impact, objId: 'OBJ-H4', field: 'impact', options: D.DEBUG_IMPACT_OPTIONS })}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H4', debugState !== 'revealed')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function debugInstrument() {
    const mode = store.state.mode;
    const debugState = store.state.debugState;
    const showLocals = debugState === 'hit' || debugState === 'stepped' || debugState === 'revealed';
    return Bezel({
      title: 'Debugger',
      sub: 'runtime inspection — authorized training binary',
      icon: ICONS.Cpu('h-4 w-4'),
      actions: `<span class="micro-note hidden-sm">${esc(D.TARGET.binary)}</span>`,
      body: `
        <p class="instr-intro mb-3">Walk the debugger through a real analyst workflow: attach, break on <span class="mono-amber">auth_check</span>, run, inspect, step. The binary is a stripped training copy — safe, synthetic, authorized.</p>
        <div class="chip-row mb-3" aria-label="Debugger state">
          ${DEBUG_ORDER.map((st, i) => {
            const reached = DEBUG_ORDER.indexOf(debugState) >= i;
            return `<span class="chip-seq">
              <span class="chip ${st === debugState ? 'chip-current' : reached ? 'chip-reached' : 'chip-off'}">${st}</span>
              ${i < DEBUG_ORDER.length - 1 ? '<span class="seq-arrow">→</span>' : ''}
            </span>`;
          }).join('')}
        </div>
        <div class="grid-2">
          <div class="term term-tall">
            ${SectionLabel('Disassembly', 'mb-2')}
            <pre class="pre pre-term" aria-live="polite">${esc((D.DEBUG_DISASM[debugState] || D.DEBUG_DISASM.idle).join('\n'))}</pre>
          </div>
          <div class="stack">
            ${DebugControls()}
            ${showLocals ? `
              <div class="panel-elevated">
                ${SectionLabel('Locals at breakpoint', 'mb-2')}
                <dl class="locals">
                  ${Object.entries(D.DEBUG_LOCALS).map(([k, v]) => `<div class="locals-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
                </dl>
              </div>` : ''}
            ${debugState === 'revealed' ? `
              <div class="panel-amber">
                <div class="mono-label text-amber mb-2">${ICONS.Braces('h-3.5 w-3.5')} strings portal-agent — executed paths</div>
                <ul class="strings-list">
                  ${D.DEBUG_STRINGS.map((s) => `<li class="${s.hit ? 'text-amber' : 'text-dim'}">${s.hit ? '★ ' : '  '}${esc(s.text)}</li>`).join('')}
                </ul>
              </div>` : ''}
          </div>
        </div>
        <div class="stack-lg mt-4">${mode === 'medium' ? M7Widget() : H4Widget()}</div>`,
    });
  }

  // ================================================================ CONFIG
  const CONFIG_TABS = [
    { id: 'headers', label: 'HTTP headers', content: D.CONFIG_HEADERS },
    { id: 'nginx', label: 'nginx.conf', content: D.CONFIG_NGINX },
    { id: 'admin', label: 'Admin console', content: D.CONFIG_ADMIN },
  ];

  function H5Ranking() {
    const a = store.state.answers['OBJ-H5'] || {};
    const top3 = Array.isArray(a.top3) ? a.top3 : [];
    const opts = D.CONFIG_ITEMS.filter((c) => c.misconfig).map((c) => ({ id: c.id, label: c.text }));
    const positions = ['1st — most exploitable', '2nd', '3rd'];
    return `
      <div class="mt-4 border-top pt-3">
        ${SectionLabel('Rank the top three by exploitability', 'text-amber mb-2')}
        <div class="grid-3">
          ${positions.map((p, i) => Sel({ label: p, value: top3[i], objId: 'OBJ-H5', field: 'top3:' + i, options: opts })).join('')}
        </div>
      </div>`;
  }

  function configInstrument() {
    const mode = store.state.mode;
    const tab = V.config.tab;
    const objId = mode === 'hard' ? 'OBJ-H5' : 'OBJ-M9';
    const a = store.state.answers[objId] || {};
    const ids = Array.isArray(a.configs) ? a.configs : [];
    const lastResult = store.state.lastResult[objId];
    const active = CONFIG_TABS.find((t) => t.id === tab);
    return Bezel({
      title: 'Config probe',
      sub: 'configuration issues & misconfigurations',
      icon: ICONS.Settings2('h-4 w-4'),
      body: `
        <p class="instr-intro mb-3">Misconfigurations are findings you ship by forgetting. Read all three evidence tabs — then complete the audit checklist from what you actually observed.</p>
        <div class="chip-row mb-2" role="tablist" aria-label="Config evidence tabs">
          ${CONFIG_TABS.map((t) => `<button type="button" role="tab" aria-selected="${tab === t.id}" class="chip${tab === t.id ? ' chip-active' : ''}" data-action="config-tab" data-tab="${t.id}">${t.label}</button>`).join('')}
        </div>
        <div class="code-window">
          <div class="code-note">${active.label} — staging.meridiancare.example</div>
          <pre class="pre pre-pad">${esc(active.content.join('\n'))}</pre>
        </div>
        <div class="task-card amber mt-4">
          ${SectionLabel('Audit — ' + (mode === 'hard' ? 'OBJ-H5 · select ALL seven real misconfigurations' : 'OBJ-M9 · flag every real configuration issue'), 'text-amber mb-1')}
          <p class="task-text mb-3">${mode === 'hard'
            ? 'Select exactly the seven real issues (the Medium six plus one hiding in the headers tab), then rank the top three by exploitability.'
            : 'Cross-check every statement against the three tabs. Distractors describe settings that are present and healthy — or not present at all.'}</p>
          <ul class="check-list">
            ${D.CONFIG_ITEMS.map((c) => CheckRow({ id: 'cfg-' + c.id, checked: ids.includes(c.id), objId, field: 'configs', item: c.id, text: c.text })).join('')}
          </ul>
          ${mode === 'hard' ? H5Ranking() : ''}
          <div class="row-flex mt-3">
            ${CheckButton(objId)}
            ${mode !== 'hard' ? '<p class="micro-note">(The absent security headers are a valid extra finding in Medium — flagging them costs nothing.)</p>' : ''}
          </div>
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>`,
    });
  }

  // ================================================================ TRIAGE
  function TriageRow(id) {
    const alert = D.ALERTS.find((a) => a.id === id);
    const mode = store.state.mode;
    const objId = mode === 'hard' ? 'OBJ-H1' : 'OBJ-M5';
    const verdict = ans(objId)[id];
    return `
      <li class="panel-elevated">
        <div class="row-flex wrap gap-2">
          <span class="sev ${SEV_STYLE[alert.sev]}">${alert.sev}</span>
          <span class="text-sm font-semibold">${esc(alert.title)}</span>
          <span class="mono-dim">${esc(alert.loc)}</span>
          ${alert.origin === 'imported' ? '<span class="imported-chip">imported report</span>' : ''}
          <div class="row-flex ml-auto" role="group" aria-label="Verdict for ${esc(alert.title)}">
            ${['TP', 'FP'].map((v) => `<button type="button" class="verdict ${verdict === v ? (v === 'TP' ? 'verdict-tp' : 'verdict-fp') : ''}" aria-pressed="${verdict === v}" data-action="verdict" data-obj="${objId}" data-item="${alert.id}" data-v="${v}">${v}</button>`).join('')}
          </div>
        </div>
        <p class="micro-note mt-2">${esc(alert.detail)}</p>
      </li>`;
  }

  function Queue(objId, taskTitle, taskText, rose) {
    const ids = D.ALERTS.filter((a) => a.modes.includes(store.state.mode)).map((a) => a.id);
    const marked = Object.keys(ans(objId)).length;
    const lastResult = store.state.lastResult[objId];
    return `
      <div>
        <div class="task-card ${rose ? 'rose' : 'amber'} mb-3">
          ${SectionLabel(taskTitle, (rose ? 'text-rose' : 'text-amber') + ' mb-1')}
          <p class="task-text">${esc(taskText)}</p>
        </div>
        <div class="mono-label mb-3" aria-live="polite">marked ${marked}/${ids.length}</div>
        <ul class="stack">
          ${ids.map((id) => TriageRow(id)).join('')}
        </ul>
        <div class="mt-3">
          ${CheckButton(objId)}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function M10Widget() {
    const value = ans('OBJ-M10');
    const lastResult = store.state.lastResult['OBJ-M10'];
    return `
      <section aria-label="Map findings to fixes">
        ${SectionLabel('OBJ-M10 · map findings to fixes', 'text-amber mb-1')}
        <p class="instr-intro mb-3">Pick the fix that removes each flaw’s root cause — not the one that hides it.</p>
        <div class="grid-2">
          ${D.M10_ITEMS.map((i) => Sel({ label: i.text, value: value[i.id], objId: 'OBJ-M10', field: i.id, options: D.FIX_OPTIONS })).join('')}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-M10')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function M11Widget() {
    const value = ans('OBJ-M11');
    const lastResult = store.state.lastResult['OBJ-M11'];
    return `
      <section aria-label="Assign remediation ownership">
        ${SectionLabel('OBJ-M11 · assign remediation ownership', 'text-amber mb-1')}
        <p class="instr-intro mb-3">Who owns the change? Code → Dev. Settings → Infra. Recurring program work → Process.</p>
        <div class="grid-2">
          ${D.M11_ITEMS.map((i) => Sel({ label: i.text, value: value[i.id], objId: 'OBJ-M11', field: i.id, options: D.OWNER_OPTIONS })).join('')}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-M11')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function H6Widget() {
    const value = ans('OBJ-H6');
    const lastResult = store.state.lastResult['OBJ-H6'];
    return `
      <section aria-label="Contain then fix">
        ${SectionLabel('OBJ-H6 · contain, then fix', 'text-rose mb-1')}
        <p class="instr-intro mb-3">The SQLi code fix is two sprints out. Put the four containment steps in the order you would execute them (position selects), then choose the only acceptable compensating-control arrangement.</p>
        <div class="grid-2">
          ${['Position 1', 'Position 2', 'Position 3', 'Position 4'].map((p, i) => Sel({ label: p, value: value['s' + (i + 1)], objId: 'OBJ-H6', field: 's' + (i + 1), options: D.SEQ_STEPS.map((s) => ({ id: s.id, label: s.text })) })).join('')}
        </div>
        <div class="mt-4">
          ${Sel({ label: 'Compensating-control arrangement', value: value.compensating, objId: 'OBJ-H6', field: 'compensating', options: D.SEQ_COMPENSATING })}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H6')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function H8Widget() {
    const value = ans('OBJ-H8');
    const lastResult = store.state.lastResult['OBJ-H8'];
    return `
      <section aria-label="Defensible triage">
        ${SectionLabel('OBJ-H8 · defensible triage', 'text-rose mb-1')}
        <p class="instr-intro mb-3">Five contested alerts. For each: verdict AND the one piece of bench evidence that proves it.</p>
        <div class="stack">
          ${D.H8_ITEMS.map((i) => `
            <div class="panel-elevated">
              <div class="mb-2 text-sm font-semibold">${esc(i.alert)}</div>
              <div class="grid-2-130">
                ${Sel({ label: 'Verdict — ' + i.id.toUpperCase(), value: (value[i.id] || {}).v, objId: 'OBJ-H8', field: i.id + '.v', options: [{ id: 'TP', label: 'True positive' }, { id: 'FP', label: 'False positive' }] })}
                ${Sel({ label: 'Proof — ' + i.id.toUpperCase(), value: (value[i.id] || {}).p, objId: 'OBJ-H8', field: i.id + '.p', options: D.PROOF_OPTIONS })}
              </div>
            </div>`).join('')}
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H8')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </section>`;
  }

  function LaunchDecision() {
    const value = ans('OBJ-H9');
    const blocked = Array.isArray(value.blocked) ? value.blocked : [];
    const lastResult = store.state.lastResult['OBJ-H9'];
    return `
      <div>
        <div class="task-card rose mb-3">
          ${SectionLabel('Task — OBJ-H9 · go / no-go call', 'text-rose mb-1')}
          <p class="task-text">The launch board meets in one hour. Mark the launch-blocking findings, choose the verdict, and pick the rationale that will survive scrutiny.</p>
        </div>
        ${SectionLabel('Launch-blocking findings', 'mb-2')}
        <ul class="check-list">
          ${D.GO_CANDIDATES.map((g) => CheckRow({ id: 'go-' + g.id, checked: blocked.includes(g.id), objId: 'OBJ-H9', field: 'blocked', item: g.id, text: g.text })).join('')}
        </ul>
        <div class="grid-2 mt-4">
          <div>
            ${SectionLabel('Verdict', 'mb-2')}
            ${RadioList({ name: 'go-verdict', value: value.verdict, objId: 'OBJ-H9', field: 'verdict', options: D.GO_VERDICTS })}
          </div>
          <div>
            ${SectionLabel('Rationale', 'mb-2')}
            ${RadioList({ name: 'go-rationale', value: value.rationale, objId: 'OBJ-H9', field: 'rationale', options: D.GO_RATIONALES })}
          </div>
        </div>
        <div class="mt-3">
          ${CheckButton('OBJ-H9')}
          ${lastResult ? FeedbackBlock(lastResult) : ''}
        </div>
      </div>`;
  }

  function triageInstrument() {
    const mode = store.state.mode;
    const tab = V.triage.tab;
    const tabs = [
      { id: 'queue', label: 'Queue', icon: 'ClipboardList' },
      { id: 'remediation', label: 'Remediation', icon: 'Wrench' },
      { id: 'decision', label: 'Launch decision', icon: 'Scale', show: mode === 'hard' },
    ].filter((t) => t.show !== false);
    return Bezel({
      title: 'Triage board',
      sub: 'verdicts, fixes, ownership',
      icon: ICONS.ClipboardList('h-4 w-4'),
      body: `
        <div class="chip-row mb-4" role="tablist" aria-label="Triage tabs">
          ${tabs.map((t) => `<button type="button" role="tab" aria-selected="${tab === t.id}" class="chip chip-wide${tab === t.id ? ' chip-active' : ''}" data-action="triage-tab" data-tab="${t.id}">${ICONS[t.icon]('h-3.5 w-3.5')} ${t.label}</button>`).join('')}
        </div>
        ${tab === 'queue' ? (mode === 'hard'
          ? Queue('OBJ-H1', 'Task — OBJ-H1 · signal from noise', '14 alerts, imported reports mixed in, red herrings included. Every verdict must be right — scope first, then evidence.', true)
          : Queue('OBJ-M5', 'Task — OBJ-M5 · triage the queue', 'Mark every alert TP or FP. Both verdicts need to hold up: the details on each row are your evidence trail — cross-check against the SAST unit when in doubt.', false)) : ''}
        ${tab === 'remediation' ? (mode === 'medium' ? M10Widget() + M11Widget() : H6Widget() + H8Widget()) : ''}
        ${tab === 'decision' && mode === 'hard' ? LaunchDecision() : ''}`,
    });
  }

  // ---------------------------------------------------------------- registry
  CL.INSTRUMENTS = [
    { id: 'target', label: 'Target', icon: 'Globe', desc: 'The staging application under authorized assessment' },
    { id: 'toolrack', label: 'Tool rack', icon: 'Wrench', desc: 'The instruments themselves — what each lane covers' },
    { id: 'sast', label: 'SAST', icon: 'FileCode2', desc: 'Static analysis — read the source before it runs' },
    { id: 'dast', label: 'DAST', icon: 'Radar', desc: 'Dynamic analysis — crawl and attack the running app' },
    { id: 'fuzz', label: 'Fuzzer', icon: 'FlaskConical', desc: 'Malformed input hunting — prove what parsers really do' },
    { id: 'debug', label: 'Debugger', icon: 'Cpu', desc: 'Runtime inspection — breakpoints, locals, strings' },
    { id: 'config', label: 'Config probe', icon: 'Settings2', desc: 'Headers, server config, console state' },
    { id: 'triage', label: 'Triage board', icon: 'ClipboardList', desc: 'Verdicts, remediation mapping, launch decision' },
  ];

  CL.renderInstrument = (id) => {
    switch (id) {
      case 'target': return targetInstrument();
      case 'toolrack': return toolrackInstrument();
      case 'sast': return sastInstrument();
      case 'dast': return dastInstrument();
      case 'fuzz': return fuzzInstrument();
      case 'debug': return debugInstrument();
      case 'config': return configInstrument();
      case 'triage': return triageInstrument();
      default: return '';
    }
  };
})(window.CyberLab);
