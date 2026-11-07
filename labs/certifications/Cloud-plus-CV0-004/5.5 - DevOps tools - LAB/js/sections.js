// ─────────────────────────────────────────────────────────────────────────────
// js/sections.js — section renderers for the static lab port.
// 1:1 translation of the original React components (mode-select, line-board,
// dispatch, workbench, signal-check, handover, field-manual, departure) into
// plain DOM-builder functions. All copy, colors and ARIA labels are carried
// over verbatim. Dynamic regions expose update functions used by app.js.
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  const { esc, el, icon, bookIcon, PILLAR_META, STATION_ICONS, term } = Lab.ui;
  const D = window.LAB_DATA;
  const E = () => Lab.engine;
  const S = () => Lab.store;

  const stationById = (id) => D.stations.find((s) => s.id === id);
  const pillarIconName = (iconKey) => ({ brain: 'brain', scan: 'scan-search', radar: 'radar', shield: 'shield-check' }[iconKey] || iconKey);

  // ════════════════════════════ MODE SELECT ══════════════════════════════════
  // Port of ModeSelect (mode-select.tsx) — the difficulty-choice screen.
  function renderModeSelect() {
    return el(`
    <div class="mode-select">
      <div class="mode-select-inner">
        <header class="mode-header">
          <div class="mode-eyebrow">
            ${icon('train-front', 's14 text-amber')}
            <span>NimbusCart release-train control room</span>
          </div>
          <h1 class="mode-title">DevOps Tools — the automation line</h1>
          <p class="mode-subtitle">CompTIA Cloud+ CV0-004 · Lesson 5.5 · Kubernetes · Ansible · Jenkins · CI/CD</p>
          <p class="mode-lede">One fictional retail platform, one automated release train, one night that goes wrong.
            Pick your shift: learn the tools on a <span class="text-amber">guided day shift</span>, or prove
            you can run the line alone during a <span class="text-teal">night-shift incident</span>. All
            evidence is synthetic training data.</p>
        </header>

        <div class="mode-grid" role="group" aria-label="Choose difficulty mode">
          <section class="mode-card anim-rise" aria-label="Day shift — guided learning mode">
            <div class="mode-card-head text-amber">
              ${icon('sun', 's20')}
              <h2 class="mode-card-title">DAY SHIFT</h2>
              <span class="mode-badge text-amber">Medium · learn</span>
            </div>
            <p class="mode-card-body">A guided tour of the whole line. 12 short objectives walk you station by station —
              each with context, a 3-tier hint ladder and tolerant answers that explain themselves.</p>
            <ul class="mode-card-list">
              <li>· Objectives appear in order with “where to look” context</li>
              <li>· Hints available any time (they cost stars, never progress)</li>
              <li>· Concept quiz after practice · supportive feedback on every check</li>
            </ul>
            <button type="button" data-mode-btn="medium" class="btn btn-primary mode-start">
              Start day shift ${icon('chevron-right', 's16')}
            </button>
          </section>

          <section class="mode-card mode-card-hard anim-rise anim-delay" aria-label="Night shift — challenge mode">
            <div class="mode-card-head text-teal">
              ${icon('moon-star', 's20')}
              <h2 class="mode-card-title">NIGHT SHIFT</h2>
              <span class="mode-badge text-teal">Hard · test</span>
            </div>
            <p class="mode-card-body">Same line, worst night of the quarter. 10 broad challenges across noisy evidence with
              red herrings planted in it. No guided context; one optional nudge that visibly costs score.</p>
            <ul class="mode-card-list">
              <li>· Extra incident + noise files appear at the stations</li>
              <li>· Strict validation: exact values, exact sets, exact sequences</li>
              <li>· Scenario quiz requires justification · efficiency drives the rating</li>
            </ul>
            <button type="button" data-mode-btn="hard" class="btn btn-hard mode-start">
              Take the night shift ${icon('chevron-right', 's16')}
            </button>
          </section>
        </div>
      </div>

      <footer class="mode-footer">
        <p>Educational simulation · defensive framing · fictional organization “NimbusCart”, synthetic
          tokens and RFC-5737 IPs. Progress auto-saves in your browser.</p>
      </footer>
    </div>`);
  }

  // ════════════════════════════ CONTROL STRIP ════════════════════════════════
  // Port of ControlStrip — sticky in-fiction header with ident, mode badge,
  // counters, animated progress ring and the two global buttons.
  function progressRingHtml(pct) {
    const size = 38;
    const r = (size - 6) / 2;
    const c = 2 * Math.PI * r;
    const filled = (Math.min(100, Math.max(0, pct)) / 100) * c;
    return `<svg width="${size}" height="${size}" role="img" aria-label="Lab progress ${pct} percent" class="progress-ring" data-ring>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#2A3446" stroke-width="5"></circle>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#F5A623" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${filled} ${c - filled}" transform="rotate(-90 ${size / 2} ${size / 2})" data-ring-arc></circle>
      <text x="50%" y="54%" text-anchor="middle" font-size="11" fill="#E8EDF4" font-weight="600" data-ring-text>${pct}%</text>
    </svg>`;
  }

  function renderControlStrip() {
    const mode = S().getState().mode;
    return el(`
    <header class="control-strip" id="control-strip">
      <div class="control-strip-inner">
        <div class="control-ident">
          <span class="control-logo">${icon('train-front', 's16 text-amber')}</span>
          <div class="control-ident-text">
            <div class="control-title">RELEASE-TRAIN CONTROL ROOM</div>
            <div class="control-subtitle">CV0-004 · L5.5 DevOps tools</div>
          </div>
        </div>
        <span class="mode-chip ${mode === 'hard' ? 'chip-teal' : 'chip-amber'}" data-mode-chip>${mode === 'hard' ? 'Night shift' : 'Day shift'}</span>
        <div class="control-counters" data-header-counters>
          <div>Objectives <span class="mono-strong" data-hc-obj>0/0</span></div>
          <div>Signal check <span class="mono-strong" data-hc-quiz>0/0</span></div>
        </div>
        ${progressRingHtml(0)}
        <div class="control-actions">
          <button type="button" data-open-manual class="btn btn-chip">${bookIcon('s14')} Field manual</button>
          <button type="button" data-open-reset class="btn btn-chip" aria-label="Reset lab to pristine state">${icon('rotate-ccw', 's14')} Reset</button>
        </div>
      </div>
    </header>`);
  }

  // ════════════════════════════ LINE BOARD ═══════════════════════════════════
  // Port of LineBoard — five stations on one track (the page's in-fiction nav).
  function renderLineBoard() {
    const ol = el('<nav class="lineboard" aria-label="Release train line board — stations"><div class="lineboard-scroll"><ol class="lineboard-track"></ol></div></nav>');
    const track = ol.querySelector('ol');
    for (const s of D.stations) {
      const li = el(`<li class="lineboard-item">
        <button type="button" data-station-btn="${esc(s.id)}" class="station-btn">
          <span class="station-icon" style="border-color:${s.color}55;background:${s.color}14;color:${s.color}" aria-hidden="true">
            ${icon(STATION_ICONS[s.icon], 's16')}
          </span>
          <span class="station-text">
            <span class="station-top"><span class="station-code">${esc(s.code)}</span><span class="lamp" data-lamp></span></span>
            <span class="station-name">${esc(s.name)}</span>
            <span class="station-tool">${esc(s.tool)}</span>
          </span>
          <span class="station-count" data-station-count>0/0</span>
          <span class="station-connector" aria-hidden="true">${icon('chevron-right', 's14')}</span>
        </button>
      </li>`);
      track.appendChild(li);
    }
    return ol;
  }

  function updateLineBoard() {
    const state = S().getState();
    const counts = E().perStation(state, state.mode);
    const btns = document.querySelectorAll('[data-station-btn]');
    btns.forEach((btn) => {
      const s = stationById(btn.getAttribute('data-station-btn'));
      const st = counts[s.id];
      const active = state.ui.station === s.id;
      const done = st.total > 0 && st.done === st.total;
      btn.classList.toggle('is-active', active);
      btn.style.borderColor = active ? `${s.color}99` : '';
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
      btn.setAttribute('aria-label', `${s.name} station — ${s.tool} — ${st.done} of ${st.total} objectives complete`);
      const count = btn.querySelector('[data-station-count]');
      if (count) count.textContent = `${st.done}/${st.total}`;
      const lamp = btn.querySelector('[data-lamp]');
      if (lamp) {
        const on = active || done;
        lamp.style.background = on ? s.color : '#2A3446';
        lamp.style.boxShadow = on ? `0 0 8px ${s.color}, 0 0 2px ${s.color}` : 'none';
      }
    });
  }

  // ════════════════════════════ BRIEFING CARD ════════════════════════════════
  // Port of BriefingCard (C1 — scenario briefing), collapsible.
  function renderBriefing() {
    const node = el(`
    <section class="briefing" aria-label="Scenario briefing">
      <div class="card briefing-card">
        <button type="button" class="briefing-toggle" aria-expanded="true" data-briefing-toggle>
          ${icon('train-front', 's16 text-amber')}
          <span class="briefing-title">Shift briefing — read once, then run the line</span>
          <span class="briefing-chevron is-open">${icon('chevron-right', 's16 text-muted')}</span>
        </button>
        <div class="briefing-body" data-briefing-body>
          <div class="briefing-col">
            <p class="briefing-head">The situation</p>
            <p><span class="text-muted">Fictional</span> retailer NimbusCart ships its storefront
              with an automated release train: <strong class="text-strong">Jenkins</strong> builds and
              tests every commit, <strong class="text-strong">Ansible</strong> keeps the host fleet at
              desired state, <strong class="text-strong">Kubernetes</strong> runs and heals the
              containers. Last night release v1.4.2 stalled — and the audit feed shows more than a stalled train.</p>
          </div>
          <div class="briefing-col">
            <p class="briefing-head">Your job</p>
            <p>You are the on-call platform engineer. Work the stations on the line board: read the evidence,
              complete the objectives in your Dispatch panel, pass the Signal Check, and read the Handover
              Notes before you clock out. Every check explains itself — that is the point.</p>
          </div>
          <div class="briefing-col">
            <p class="briefing-head">Why this matters (CV0-004)</p>
            <p>Domain 5 of Cloud+ (DevOps Fundamentals) expects you to know what Kubernetes, Ansible and
              Jenkins each do, how CI/CD stages interlock, and how these tools fail or get abused —
              which bleeds straight into the Security and Troubleshooting domains.</p>
          </div>
        </div>
      </div>
    </section>`);
    return node;
  }

  // ════════════════════════════ DISPATCH ═════════════════════════════════════
  // Port of Dispatch + ObjectiveCard — the objectives panel.
  function pillarBadgeHtml(pillar) {
    const meta = PILLAR_META[pillar];
    return `<span class="pillar-badge" style="color:${meta.color};border-color:${meta.color}55;background:${meta.color}14">${meta.label}</span>`;
  }

  function renderObjectiveCard(obj, state) {
    const rt = Lab.cardRuntime[obj.id] || { hintsShown: 0, check: null };
    const rec = state.objectives[obj.id];
    const isHard = obj.mode === 'hard';
    const maxHints = isHard ? 1 : 3;
    const hints = obj.hints.slice(0, maxHints);

    const context = !isHard && obj.context ? `<p class="obj-context">${esc(obj.context)}</p>` : '';

    const widgets = obj.widgets.map((w) => Lab.ui.renderWidget(w, state)).join('');

    const hintRows = rt.hintsShown > 0
      ? `<div class="hint-list" aria-live="polite">${hints
          .slice(0, rt.hintsShown)
          .map(
            (h, i) => `<p class="hint-row">${icon('lightbulb', 's12 text-amber hint-bulb')}
              ${isHard ? 'Nudge (costs rating): ' : `Hint ${i + 1}/3: `}${esc(h)}</p>`
          )
          .join('')}</div>`
      : '';

    const hintLabel = isHard ? (rt.hintsShown ? 'Nudge used' : 'Use nudge') : rt.hintsShown ? `Hint ${rt.hintsShown}/${maxHints}` : 'Hint';

    let feedback = '';
    if (rt.check) {
      const c = rt.check;
      feedback = `<div class="feedback ${c.pass ? 'fb-pass' : 'fb-fail'} anim-rise-sm" role="status" aria-live="polite" data-feedback>
        <p class="fb-head ${c.pass ? 'text-green' : 'text-red'}">${c.pass ? '✓ Correct — objective complete' : '✗ Not yet — check again'}</p>
        ${!c.pass && c.note ? `<p class="fb-revisit">Revisit: ${esc(c.note)}.</p>` : ''}
        <p class="fb-body"><span class="text-strong">Why it matters: </span>${esc(obj.why)}</p>
        <p class="fb-body fb-body-mt"><span class="text-strong">What a defender does next: </span>${esc(obj.next)}</p>
      </div>`;
    }

    return el(`
    <article data-obj="${esc(obj.id)}" class="obj-card ${rec && rec.completed ? 'obj-complete' : ''}" aria-label="Objective ${esc(obj.id)}: ${esc(obj.title)}">
      <div class="obj-card-head">
        <span class="obj-status" data-obj-status>${icon(rec && rec.completed ? 'check-circle-2' : 'circle-dashed', 's18 ' + (rec && rec.completed ? 'text-green' : 'text-faint'))}</span>
        <div class="obj-card-titlebox">
          <div class="obj-card-tags">
            <span class="obj-id">${esc(obj.id)}</span>
            ${pillarBadgeHtml(obj.pillar)}
          </div>
          <h3 class="obj-title">${esc(obj.title)}</h3>
        </div>
      </div>
      <div class="obj-card-body">
        ${context}
        ${widgets}
        ${hintRows}
        <div class="obj-controls">
          <button type="button" data-check-btn="${esc(obj.id)}" class="btn btn-primary btn-check">
            ${icon('list-checks', 's16')}<span data-check-label>${rec && rec.completed ? 'Check again' : 'Check results'}</span>
          </button>
          <button type="button" data-hint-btn="${esc(obj.id)}" class="btn btn-ghost btn-hint" ${rt.hintsShown >= maxHints ? 'disabled' : ''}>
            ${icon('lightbulb', 's14 text-amber')}<span data-hint-label>${hintLabel}</span>
          </button>
        </div>
        ${feedback}
        <p class="obj-covers">covers: ${esc(obj.anchor)}</p>
      </div>
    </article>`);
  }

  function renderDispatch() {
    const state = S().getState();
    const station = stationById(state.ui.station);
    const objs = E().objectivesAt(state.ui.station, state.mode);
    const wrap = el(`<section aria-label="Dispatch — objectives for ${esc(station.name)} station" class="dispatch" id="dispatch">
      <div class="panel-head">
        ${icon('list-checks', 's16 text-amber')}
        <h2 class="panel-title">Dispatch · ${esc(station.name)}</h2>
        <span class="panel-counters" data-dispatch-counters></span>
      </div>
      <div class="pillar-row" data-pillar-row></div>
      <div data-obj-list class="obj-list"></div>
      <div data-dispatch-footer></div>
    </section>`);
    fillDispatchDynamic(wrap, objs, state);
    return wrap;
  }

  function fillDispatchDynamic(wrap, objs, state) {
    const prog = E().computeProgress(state);
    const counters = wrap.querySelector('[data-dispatch-counters]');
    counters.textContent = `${prog.completed}/${prog.total} objectives · ${prog.quizCorrect}/${prog.quizTotal} signal check`;

    // Pillar progress badges (F5) — same four, with done/total counts.
    const pillarTotals = E().perPillar(state, state.mode);
    const row = wrap.querySelector('[data-pillar-row]');
    row.innerHTML = ['P1', 'P2', 'P3', 'P4']
      .map((p) => {
        const st = pillarTotals[p] || { done: 0, total: 0 };
        const full = st.total > 0 && st.done === st.total;
        return `<span class="pillar-pill ${full ? 'is-full' : ''}" title="${PILLAR_META[p].label}: ${st.done}/${st.total} objectives">
          ${icon(pillarIconName(PILLAR_META[p].icon), 's12')}
          ${p} · ${PILLAR_META[p].label} ${st.done}/${st.total}
        </span>`;
      })
      .join('');

    const list = wrap.querySelector('[data-obj-list]');
    if (objs.length === 0) {
      list.innerHTML = '<p class="obj-empty">No objectives filed at this station — switch stations on the line board.</p>';
    } else {
      list.innerHTML = '';
      objs.forEach((o) => list.appendChild(renderObjectiveCard(o, state)));
    }

    const footer = wrap.querySelector('[data-dispatch-footer]');
    if (!prog.allObjectivesDone) {
      footer.innerHTML = '<p class="dispatch-foot-hint">Stations advance via the line board above — work them in order for the full route.</p>';
    } else if (!prog.allQuizDone) {
      footer.innerHTML = '<p class="dispatch-foot-cta">All objectives complete — pass the Signal Check below, then clock out.</p>';
    } else {
      footer.innerHTML = '';
    }
  }

  function rerenderDispatch() {
    const wrap = document.getElementById('dispatch');
    if (!wrap) return;
    const fresh = renderDispatch();
    wrap.replaceWith(fresh);
  }

  // In-place card refresh after a check/hint (keeps widget DOM & focus).
  function updateObjectiveCard(objId) {
    const state = S().getState();
    const obj = D.objectives.find((o) => o.id === objId);
    const card = document.querySelector(`[data-obj="${CSS.escape(objId)}"]`);
    if (!obj || !card) return;
    const rec = state.objectives[objId];
    const rt = Lab.cardRuntime[objId] || { hintsShown: 0, check: null };
    const isHard = obj.mode === 'hard';
    const maxHints = isHard ? 1 : 3;

    card.classList.toggle('obj-complete', Boolean(rec && rec.completed));
    const status = card.querySelector('[data-obj-status]');
    if (status) {
      status.innerHTML = icon(rec && rec.completed ? 'check-circle-2' : 'circle-dashed', 's18 ' + (rec && rec.completed ? 'text-green' : 'text-faint'));
    }
    const checkLabel = card.querySelector('[data-check-label]');
    if (checkLabel) checkLabel.textContent = rec && rec.completed ? 'Check again' : 'Check results';

    const hintLabel = card.querySelector('[data-hint-label]');
    if (hintLabel) hintLabel.textContent = isHard ? (rt.hintsShown ? 'Nudge used' : 'Use nudge') : rt.hintsShown ? `Hint ${rt.hintsShown}/${maxHints}` : 'Hint';
    const hintBtn = card.querySelector('[data-hint-btn]');
    if (hintBtn) hintBtn.disabled = rt.hintsShown >= maxHints;

    // Hints block
    const oldHints = card.querySelector('.hint-list');
    if (rt.hintsShown > 0) {
      const hints = obj.hints.slice(0, maxHints);
      const html = `<div class="hint-list" aria-live="polite">${hints
        .slice(0, rt.hintsShown)
        .map((h, i) => `<p class="hint-row">${icon('lightbulb', 's12 text-amber hint-bulb')}${isHard ? 'Nudge (costs rating): ' : `Hint ${i + 1}/3: `}${esc(h)}</p>`)
        .join('')}</div>`;
      if (oldHints) oldHints.replaceWith(el(html));
      else card.querySelector('.obj-controls').insertAdjacentHTML('beforebegin', html);
    }

    // Feedback block (replace → re-runs the entrance animation, like AnimatePresence)
    const oldFb = card.querySelector('[data-feedback]');
    if (rt.check) {
      const c = rt.check;
      const html = `<div class="feedback ${c.pass ? 'fb-pass' : 'fb-fail'} anim-rise-sm" role="status" aria-live="polite" data-feedback>
        <p class="fb-head ${c.pass ? 'text-green' : 'text-red'}">${c.pass ? '✓ Correct — objective complete' : '✗ Not yet — check again'}</p>
        ${!c.pass && c.note ? `<p class="fb-revisit">Revisit: ${esc(c.note)}.</p>` : ''}
        <p class="fb-body"><span class="text-strong">Why it matters: </span>${esc(obj.why)}</p>
        <p class="fb-body fb-body-mt"><span class="text-strong">What a defender does next: </span>${esc(obj.next)}</p>
      </div>`;
      if (oldFb) oldFb.replaceWith(el(html));
      else card.querySelector('.obj-controls').insertAdjacentHTML('afterend', html);
    } else if (oldFb) {
      oldFb.remove();
    }
  }

  // ════════════════════════════ WORKBENCH ════════════════════════════════════
  // Port of Workbench — station header + tabbed evidence viewer (F-8/F-9).
  function filesForStation(stationId, mode) {
    return D.evidence.filter((f) => f.station === stationId && (!f.modes || f.modes.includes(mode)));
  }

  function renderWorkbench() {
    const state = S().getState();
    const mode = state.mode || 'medium';
    const station = stationById(state.ui.station);
    const files = filesForStation(station.id, mode);
    const active = files.find((f) => f.id === state.ui.file) || files[0];

    const tabs = files
      .map((f) => {
        const on = active && active.id === f.id;
        const moon = f.modes && f.modes.includes('hard') ? icon('moon-star', 's12 text-teal') : '';
        return `<button type="button" role="tab" aria-selected="${on}" data-file-tab="${esc(f.id)}" class="file-tab ${on ? 'is-on' : ''}">
          ${moon}${esc(f.name)}</button>`;
      })
      .join('');

    return el(`<section aria-label="Workbench — ${esc(station.name)} station evidence" class="workbench" id="workbench">
      <div class="card workbench-head">
        <div class="workbench-head-row">
          <span class="station-code">${esc(station.code)}</span>
          <h2 class="panel-title">${esc(station.name)} <span class="workbench-sub">workbench</span></h2>
          <span class="tool-chip" style="color:${station.color};border-color:${station.color}55;background:${station.color}14">${esc(station.tool)}</span>
        </div>
        <p class="workbench-blurb">${esc(station.blurb)}</p>
      </div>
      <div role="tablist" aria-label="Evidence files at this station" class="file-tabs">${tabs}</div>
      <div data-file-viewer></div>
    </section>`);
  }

  function renderFileViewer() {
    const state = S().getState();
    const mode = state.mode || 'medium';
    const station = stationById(state.ui.station);
    const files = filesForStation(station.id, mode);
    const active = files.find((f) => f.id === state.ui.file) || files[0];
    const host = document.querySelector('[data-file-viewer]');
    if (!host) return;

    // Sync tab selection state
    document.querySelectorAll('[data-file-tab]').forEach((t) => {
      const on = active && t.getAttribute('data-file-tab') === active.id;
      t.setAttribute('aria-selected', String(on));
      t.classList.toggle('is-on', on);
    });

    if (!active) {
      host.innerHTML = '';
      return;
    }
    const lines = active.content.split('\n');
    host.innerHTML = `<div class="file-viewer" role="tabpanel" aria-label="Evidence: ${esc(active.name)}">
      <div class="file-viewer-head">
        <span class="file-viewer-name">${esc(active.name)}</span>
        <span class="file-viewer-desc">${esc(active.desc)}</span>
        <span class="file-viewer-badge">training data</span>
      </div>
      <div class="file-viewer-scroll lab-scrollbar">
        <table class="file-lines"><tbody>
          ${lines.map((line, i) => `<tr class="file-line"><td class="file-linenum">${i + 1}</td><td class="file-linecontent">${esc(line) || ' '}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>`;
  }

  function rerenderWorkbench() {
    const wrap = document.getElementById('workbench');
    if (!wrap) return;
    const fresh = renderWorkbench();
    wrap.replaceWith(fresh);
    renderFileViewer();
  }

  // ════════════════════════════ HANDOVER ═════════════════════════════════════
  // Port of Handover (C6 — debrief): detection table, ATT&CK mitigations,
  // technique chips, blue/red takeaways, official references.
  function renderHandover() {
    const detectionRows = [
      ['Kubernetes API-server audit logs', 'Rogue workloads; privileged pods; unusual SA behavior', 'pod.create where subject=ci-bot AND src ∉ agent subnet AND pod not owned by a Deployment'],
      ['Jenkins build logs & audit', 'Secret values in output; anonymous/odd triggers', 'log line matches (token|password) pattern OR build.started by=anonymous'],
      ['Git repository scanning', 'Committed credentials & keys', 'push-time scan matches credential patterns (e.g., ^nc-cip-, AKIA…)'],
      ['Config drift scans', 'Manual edits bypassing the pipeline', 'host file hash ≠ template hash → open drift ticket'],
      ['Network exposure scans', 'Unauthenticated consoles/dashboards (8080, 10250, dashboard)', 'external reachability of management ports without auth'],
      ['CI plugin/dependency audit', 'Unexpected plugin installs or version drift', 'diff installed plugin list vs pinned approved list (anti-T1195.001)'],
    ];
    const mitigations = [
      ['M1032 · Multi-factor Authentication', 'Auth on Jenkins/dashboard consoles; kills the anonymous-access finding (JEN-05).'],
      ['M1018 / M1026 · User & Privileged Account Management', 'Least privilege: namespaced RoleBindings for ci-bot, no cluster-admin, no wildcards (K8S-06).'],
      ['M1030 / M1035 · Network Segmentation / Limit Access over Network', 'Restrict 8080 & management planes to agent/admin networks; disable unauthenticated API access (T1613 guidance).'],
      ['M1041 · Encrypt Sensitive Information', 'etcd encryption at rest for Secrets; vaults for IaC secrets (PLA-01).'],
      ['M1045 · Code Signing / provenance verification', 'Verify plugin & image provenance; combine with pinning (anti-T1195.001).'],
      ['M1051 · Update Software', 'Patch Jenkins/controller/agents deliberately — after pinning, not instead of it.'],
      ['M1054 · Software Configuration', 'Secure pipeline config: mask secrets in logs (JEN-03), no privileged debug flags (K8S-04).'],
      ['M1047 · Audit', 'K8s audit logs + admission-controlled image scanning; the 02:14 event was visible here.'],
      ['M1042 · Disable or Remove Feature or Program', 'Remove unnecessary components (debug shell flags, unused plugins) from the stack.'],
    ];
    const techniques = [
      ['T1195.001', 'Compromise Software Dependencies & Dev Tools'],
      ['T1078.004', 'Valid Accounts: Cloud Accounts'],
      ['T1610', 'Deploy Container'],
      ['T1613', 'Container and Resource Discovery'],
      ['T1609', 'Container Administration Command'],
    ];
    const blueTakeaways = [
      'Treat the CI server as a privileged production system — its credentials open every door it builds for.',
      'Secrets have one home: a vault or a K8s Secret with RBAC + encryption at rest. Git history is forever; rotate anything that touched it.',
      'Detect both ends: pipeline misbehavior (leaks, anonymous access) and platform misbehavior (rogue pods, drift).',
      'Reconcile, don’t hand-edit: absorb fixes into the pipeline and re-apply — drift tickets, not hotfixes.',
      'Alert narrowly on correlated signals (identity + object + source) to stay low-noise.',
    ];
    const redTakeaways = [
      'If you were on the train: the committed credentials file is the master key — clone, authenticate, deploy (T1078.004 → T1610).',
      'An unauthenticated Jenkins is a free compute-and-credentials machine; you would trigger builds, read logs, steal tokens.',
      'Auto-updating plugins are a supply-chain delivery channel — one poisoned update runs on every build.',
      'Privileged containers exist “for debugging” on almost every real cluster — that is your host-escape ticket.',
      'Defenders: run these what-ifs yourself, report the gap, then close it — that is exactly what this lab exercised.',
    ];

    return el(`
    <section class="handover" aria-label="Handover notes — debrief">
      <div class="panel-head">
        ${icon('compass', 's16 text-green')}
        <h2 class="panel-title">Handover notes</h2>
        <span class="panel-counters">synthesis for the next shift</span>
      </div>

      <div class="handover-grid">
        <div class="card handover-card">
          <h3 class="handover-h3">${icon('radar', 's16 text-teal')} Detection opportunities</h3>
          <div class="handover-scroll-x">
            <table class="detect-table">
              <thead><tr><th>Data source</th><th>Alert on</th><th>Example logic</th></tr></thead>
              <tbody>
                ${detectionRows.map((r) => `<tr><td class="detect-src">${esc(r[0])}</td><td>${esc(r[1])}</td><td class="detect-logic">${esc(r[2])}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card handover-card">
          <h3 class="handover-h3">${icon('shield-check', 's16 text-green')} Mitigations (official ATT&amp;CK IDs)</h3>
          <ul class="mitigation-list">
            ${mitigations.map((m) => `<li class="mitigation-item"><span class="mitigation-id">${esc(m[0].split(' · ')[0])}</span><span><span class="text-strong">${esc(m[0].split(' · ')[1])}</span> — ${esc(m[1])}</span></li>`).join('')}
          </ul>
        </div>

        <div class="card handover-card">
          <h3 class="handover-h3">ATT&amp;CK techniques seen in this lab</h3>
          <p class="handover-note">Simplified training mappings of the security facets of this chapter (verified against attack.mitre.org, Nov 2026).</p>
          <div class="tech-chips">
            ${techniques
              .map((t) => `<a href="https://attack.mitre.org/techniques/${esc(t[0].replace('.', '/'))}/" target="_blank" rel="noopener noreferrer" class="tech-chip">
                <span class="tech-id">${esc(t[0])}</span>${esc(t[1])}${icon('external-link', 's10')}
              </a>`)
              .join('')}
          </div>
        </div>

        <div class="handover-takeaways">
          <div class="card handover-card">
            <h3 class="handover-h3">${icon('eye', 's16 text-teal')} Blue-team takeaways</h3>
            <ul class="takeaway-list">${blueTakeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
          <div class="card handover-card">
            <h3 class="handover-h3">${icon('radar', 's16 text-red')} Red-team mindset (defensive)</h3>
            <ul class="takeaway-list">${redTakeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="card handover-card handover-refs">
        <h3 class="handover-h3">Official references (open in new tab)</h3>
        <ul class="ref-list">
          <li><a class="ref-link" href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer">CompTIA Cloud+ (CV0-004) — official page${icon('external-link', 's12')}</a></li>
          <li><a class="ref-link" href="https://kubernetes.io/docs/concepts/" target="_blank" rel="noopener noreferrer">Kubernetes concepts (official docs)${icon('external-link', 's12')}</a></li>
          <li><a class="ref-link" href="https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html" target="_blank" rel="noopener noreferrer">Ansible playbook guide (official docs)${icon('external-link', 's12')}</a></li>
          <li><a class="ref-link" href="https://www.jenkins.io/doc/book/pipeline/" target="_blank" rel="noopener noreferrer">Jenkins pipeline (official docs)${icon('external-link', 's12')}</a></li>
          <li><a class="ref-link" href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer">MITRE ATT&amp;CK${icon('external-link', 's12')}</a></li>
        </ul>
        <p class="handover-disclaimer">${term('MITRE ATT&CK is a public knowledge base of adversary tactics and techniques, maintained by MITRE.', 'ATT&amp;CK')}
          terminology is used for defensive education only; all scenario data in this lab is synthetic. Mapping simplifications are labeled
          where used.</p>
      </div>
    </section>`);
  }

  // ════════════════════════════ FIELD MANUAL ═════════════════════════════════
  // Port of FieldManual (C2 — Knowledge Core): right-side sheet with 4 tabs.
  const MANUAL_DEFS = {
    webhook: 'An HTTP push notification between systems — a Git push webhooks the CI server to start the pipeline.',
    ssh: 'Secure Shell — the standard encrypted remote administration protocol; Ansible’s transport.',
    manifests: 'A YAML file describing a Kubernetes object — the declared state controllers enforce.',
    pods: 'The smallest Kubernetes unit: one or more containers sharing network/storage.',
    iac: 'Infrastructure as Code — infrastructure and configuration defined as versioned, reviewable files that tools apply.',
  };

  function manualToolsTab() {
    const toolCard = (name, accent, kind, body, artifacts, exam) => `
      <div class="manual-card">
        <div class="manual-card-head">
          <span class="dot" style="background:${accent}" aria-hidden="true"></span>
          <h3 class="manual-card-name">${esc(name)}</h3>
          <span class="manual-card-kind" style="color:${accent}">${esc(kind)}</span>
        </div>
        <p class="manual-card-body">${body}</p>
        <div class="manual-artifacts">${artifacts.map((a) => `<span class="artifact-chip">${esc(a)}</span>`).join('')}</div>
        <p class="manual-exam">Exam lens: ${esc(exam)}</p>
      </div>`;
    return `
      ${toolCard('Jenkins', '#F59E0B', 'CI/CD automation server',
        `The build robot: on every commit (via ${term(MANUAL_DEFS.webhook, 'webhook')}) it
        checks out code, runs lint/tests, packages a container image, pushes it to a registry and triggers rollout.
        Pipeline logic lives in the repo as a <strong class="text-strong">Jenkinsfile</strong> (pipeline-as-code). Plugins extend it; agents run its jobs.`,
        ['Jenkinsfile', 'build console', 'plugins', 'credential store'],
        'Know: stages, triggers, agents, credentials handling, why unauthenticated consoles are dangerous.')}
      ${toolCard('Ansible', '#A78BFA', 'Agentless configuration management',
        `Enforces desired state on hosts over ${term(MANUAL_DEFS.ssh, 'SSH')} with no
        resident agent: an <strong class="text-strong">inventory</strong> lists targets, a <strong class="text-strong">playbook</strong> lists tasks calling idempotent
        modules (apt, template, lineinfile, service). Re-runs change nothing when reality already matches — that is idempotency.`,
        ['inventory.ini', 'site.yml playbook', 'modules', 'Ansible Vault'],
        'Know: agentless model, inventory vs playbook, idempotency, secrets via Vault.')}
      ${toolCard('Kubernetes', '#2DD4BF', 'Container orchestration',
        `You declare desired state in ${term(MANUAL_DEFS.manifests, 'manifests')} (Deployments
        with ${term(MANUAL_DEFS.pods, 'pods')}, Services, ConfigMaps, Secrets); controllers continuously
        reconcile reality toward it — restarting failed pods, scaling replicas, rolling out updates with maxSurge/maxUnavailable.`,
        ['deployment.yaml', 'pods & services', 'ConfigMaps/Secrets', 'RBAC', 'kubectl events'],
        'Know: desired state, replicas/probes/rolling update, Secret ≠ ConfigMap, base64 ≠ encryption, RBAC least privilege.')}
      ${toolCard('Git', '#8FA3B8', 'Source control — the train’s source of truth',
        `Holds the app code, the Jenkinsfile, the playbooks and the manifests. A push fires the webhook that starts the whole
        train — and it is also where secrets most often leak. Treat history as permanent.`,
        ['commits', 'branches & PRs', 'webhooks'],
        'Know: source control as pipeline trigger; secret hygiene in repositories.')}
    `;
  }

  function manualConceptsTab() {
    const block = (title, body) => `<div class="manual-card"><h3 class="manual-concept-title">${esc(title)}</h3><p class="manual-concept-body">${body}</p></div>`;
    return `
      ${block('Automation vs orchestration', '<strong class="text-strong">Automation</strong> is one repeated task done by machine (build on push, patch a host).<strong class="text-strong"> Orchestration</strong> coordinates many automated parts into one managed whole — Kubernetes orchestrating hundreds of containers, or a pipeline coordinating build→test→deploy. Exam wording: orchestration = coordination at scale.')}
      ${block('The CI/CD family', '<strong class="text-strong">CI</strong>: every push built + tested. <strong class="text-strong">Continuous Delivery</strong>: passing changes packaged/staged, human approves prod. <strong class="text-strong">Continuous Deployment</strong>: no gate — every passing change ships. The only boundary between delivery and deployment is the approval gate.')}
      ${block('IaC, desired state, idempotency, drift', `${term(MANUAL_DEFS.iac, 'IaC')} means infrastructure
        exists as code: versioned, reviewable, re-appliable. Tools reconcile <strong class="text-strong">desired state</strong> (declared) against
        live state. <strong class="text-strong">Idempotency</strong> makes re-runs safe (no change when compliant). When someone edits prod by hand,
        reality diverges from the declaration — that is <strong class="text-strong">drift</strong>; the cure is to change the code and re-apply (GitOps),
        never to hand-edit.`)}
      ${block('Where each tool sits on the line', `<pre class="pipeline-pre lab-scrollbar">commit ─▶ BUILD ─▶ PUBLISH ─▶ CONFIGURE ─▶ ORCHESTRATE ─▶ OPERATE
(Git)   (Jenkins)  (registry)  (Ansible)    (Kubernetes)   (logs/audit)</pre>`)}
      ${block('Pipeline security in one breath', 'The CI server holds credentials and runs code — protect it like a prod box: auth + MFA, restricted network, pinned/verified plugins, masked secrets in logs, least-privilege pipeline identities, secrets in vaults/Secrets (never in git), audit everything.')}
    `;
  }

  function manualThreatsTab() {
    const threat = (t, name, body) => `
      <div class="manual-card">
        <div class="manual-threat-head">
          <span class="threat-id">${esc(t)}</span>
          <span class="threat-name">${esc(name)}</span>
          <a href="https://attack.mitre.org/techniques/${esc(t.replace('.', '/'))}/" target="_blank" rel="noopener noreferrer"
            class="threat-link" aria-label="Open MITRE page for ${esc(t)} in a new tab">MITRE ${icon('external-link', 's12')}</a>
        </div>
        <p class="manual-concept-body">${esc(body)}</p>
      </div>`;
    return `
      <p class="threat-intro">Defensive context — how the exact tools in this chapter appear in MITRE ATT&amp;CK’s documented examples.
        Mappings used in this lab are <strong class="text-strong">simplified for training</strong>.</p>
      ${threat('T1195.001', 'Compromise Software Dependencies and Development Tools', 'ATT&CK explicitly calls out CI/CD components as targets: a poisoned plugin/dependency can collect runtime credentials or infect every downstream build. This lab’s “plugin auto-update: ON” note is that anti-pattern.')}
      ${threat('T1078.004', 'Valid Accounts: Cloud Accounts', 'The leaked ci-bot service-account token in the committed file is exactly this: an attacker using legitimate cloud/workload credentials. Rotation + short-lived tokens + least-privilege RBAC blunt it.')}
      ${threat('T1610', 'Deploy Container', 'Rogue workloads — the crypto-miner pod created outside any pipeline. Documented examples include TeamTNT deploying containers to mine cryptocurrency in Kubernetes clusters, and Kinsing run through an Ubuntu container.')}
      ${threat('T1613', 'Container and Resource Discovery', 'Enumerating pods/nodes via API or an exposed dashboard — MITRE’s guidance: disable unauthenticated API/dashboard access, segment networks, limit dashboard visibility (M1035/M1030/M1018).')}
      ${threat('T1609', 'Container Administration Command', 'Abusing the administration service (Kubernetes API/kubelet, docker exec) to run commands inside containers — why the management plane must never be unauthenticated.')}
    `;
  }

  function manualGlossaryTab() {
    return `<dl class="glossary">${window.LAB_DATA.glossary
      .map((g) => `<div class="glossary-item"><dt class="glossary-term">${esc(g.term)}</dt><dd class="glossary-def">${esc(g.def)}</dd></div>`)
      .join('')}</dl>`;
  }

  function openFieldManual() {
    const content = el(`
    <div class="sheet" data-slot="sheet-content">
      <div class="sheet-head">
        <div>
          <h2 class="sheet-title" id="manual-title">FIELD MANUAL</h2>
          <p class="sheet-desc">The chapter’s knowledge core — read it before, during or after the shift.</p>
        </div>
        <button type="button" class="overlay-close" data-close-overlay aria-label="Close field manual">${icon('x', 's16')}</button>
      </div>
      <div class="sheet-body">
        <div class="manual-tabs" role="tablist" aria-label="Field manual sections">
          <button type="button" role="tab" class="manual-tab is-on" aria-selected="true" data-manual-tab="tools">Tools</button>
          <button type="button" role="tab" class="manual-tab" aria-selected="false" data-manual-tab="concepts">Concepts</button>
          <button type="button" role="tab" class="manual-tab" aria-selected="false" data-manual-tab="threats">Threats</button>
          <button type="button" role="tab" class="manual-tab" aria-selected="false" data-manual-tab="glossary">Glossary</button>
        </div>
        <div class="manual-panel" data-manual-panel>${manualToolsTab()}</div>
      </div>
    </div>`);
    Lab.ui.openOverlay({ id: 'manual', content, variant: 'sheet', labelId: 'manual-title', onClose: () => {} });
  }

  // ════════════════════════════ DEPARTURE MODAL ══════════════════════════════
  // Port of Departure (C7 — end-of-shift report): score, stars, pillar recap,
  // R8 focus areas derived from actual performance, next steps.
  function starRowHtml(stars) {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      const filled = stars >= i - 0.25;
      const half = !filled && stars >= i - 0.75;
      if (half) out += icon('star-half', 's20 text-amber');
      else if (filled) out += icon('star', 's20 text-amber', { fill: 'currentColor' });
      else out += icon('star', 's20 text-star-empty');
    }
    return out;
  }

  function departureContent() {
    const state = S().getState();
    const prog = E().computeProgress(state);
    const stars = E().computeStars(state);
    const mode = state.mode || 'medium';

    // R8 focus areas — same derivation and strings as the original.
    const focusAreas = [];
    const quiz = D.quiz[mode] || [];
    quiz.forEach((q, i) => {
      const rec = state.quiz[q.id];
      if (rec && rec.revealed && !rec.correct) {
        const t = D.quizTopics[q.id];
        focusAreas.push({
          title: `Signal check ${String(i + 1).padStart(2, '0')} — ${t.topic}`,
          detail: `Answered incorrectly. Re-read: ${t.where}.`,
        });
      }
    });
    for (const o of prog.objs) {
      const rec = state.objectives[o.id];
      const st = stationById(o.station) ? stationById(o.station).name : '';
      if (!rec || !rec.completed) {
        focusAreas.push({ title: `${o.id} is still open — ${o.title.replace(/\.$/, '')}`, detail: `Work it at the ${st} station, then check results.` });
        continue;
      }
      if (rec.attempts > 1) {
        focusAreas.push({ title: `${o.id} needed ${rec.attempts} checks — ${o.title.replace(/\.$/, '')}`, detail: `Redo it at the ${st} station from scratch, without reading the feedback first.` });
      }
      if (rec.hintsUsed > 0) {
        focusAreas.push({ title: `${o.id} — used ${rec.hintsUsed} hint${rec.hintsUsed > 1 ? 's' : ''} or nudges`, detail: `Re-run it at the ${st} station with hints hidden to prove the skill.` });
      }
    }

    // Pillar recap
    const byPillar = { P1: { done: [], open: [] }, P2: { done: [], open: [] }, P3: { done: [], open: [] }, P4: { done: [], open: [] } };
    for (const o of prog.objs) {
      const st = stationById(o.station) ? stationById(o.station).name : '';
      const label = `${o.id} · ${o.title.replace(/\.$/, '')} (${st})`;
      if (state.objectives[o.id] && state.objectives[o.id].completed) byPillar[o.pillar].done.push(label);
      else byPillar[o.pillar].open.push(label);
    }

    const focusBlock = focusAreas.length === 0
      ? `<p class="focus-clean">Clean run — every objective landed first try without hints, and the Signal Check came back perfect (${prog.quizCorrect}/${prog.quizTotal}).
          Stretch yourself next: explain the rolling-update strategy block aloud, then write one idempotent Ansible task from memory.</p>`
      : `<ul class="focus-list">${focusAreas
          .map((f) => `<li class="focus-item"><p class="focus-title">${esc(f.title)}</p><p class="focus-detail">${esc(f.detail)}</p></li>`)
          .join('')}</ul>`;

    return el(`
    <div class="dialog" data-slot="dialog-content">
      <div class="dialog-head">
        <h2 class="dialog-title">${icon('train-front', 's20 text-amber')} TRAIN DEPARTED — end of shift</h2>
        <button type="button" class="overlay-close" data-close-overlay aria-label="Close end-of-shift report">${icon('x', 's16')}</button>
      </div>
      <p class="dialog-desc">${mode === 'hard' ? 'Night shift complete. You ran the line alone through the incident.' : 'Day shift complete. You walked every station of the line.'}</p>

      <div class="card score-card">
        <div class="score-row">
          <div>
            <div class="score-stars-num">${stars.toFixed(1)}</div>
            <div class="score-caption">star rating (of 5)</div>
          </div>
          <div class="score-detail">
            <div>Objectives: <span class="mono-strong">${prog.completed}/${prog.total}</span> · Signal check: <span class="mono-strong">${prog.quizCorrect}/${prog.quizTotal}</span></div>
            <div class="score-note">Rating reflects first-attempt accuracy and hint/nudge usage.</div>
          </div>
          <div class="star-row" aria-label="${stars} out of 5 stars">${starRowHtml(stars)}</div>
        </div>
      </div>

      <div class="recap">
        <h3 class="recap-title">Objective recap by mastery pillar</h3>
        ${['P1', 'P2', 'P3', 'P4']
          .map((p) => `<div class="card recap-card">
            <div class="recap-head">
              <span class="recap-pillar" style="color:${PILLAR_META[p].color}">${p} · ${PILLAR_META[p].label}</span>
              <span class="recap-count">${byPillar[p].done.length}/${byPillar[p].done.length + byPillar[p].open.length}</span>
            </div>
            <ul class="recap-list">
              ${byPillar[p].done.map((d) => `<li class="recap-item"><span class="recap-check text-green">✓</span>${esc(d)}</li>`).join('')}
              ${byPillar[p].open.map((d) => `<li class="recap-item recap-open"><span class="recap-circle">○</span>${esc(d)}</li>`).join('')}
            </ul>
          </div>`)
          .join('')}
      </div>

      <div class="focus-box">
        <h3 class="focus-head">${icon('target', 's14')} Focus areas for your next shift</h3>
        ${focusBlock}
      </div>

      <div class="next-box">
        <h3 class="next-head">${icon('compass', 's14')} What to learn next (CV0-004)</h3>
        <ul class="next-list">
          <li>The rest of Domain 5: source-control concepts (branching, PRs) and deeper CI/CD pipeline design.</li>
          <li>Domain 4 (Security): identity &amp; access, secrets management, container security controls.</li>
          <li>Domain 6 (Troubleshooting): deployment, connectivity and performance triage — the stations you just diagnosed.</li>
          <li>Hands-on: kubectl basics, writing one idempotent Ansible playbook, standing up a Jenkins pipeline in a sandbox.</li>
          <li>Defensive depth: read the ATT&amp;CK technique pages linked in the Handover Notes.</li>
        </ul>
      </div>

      <div class="dialog-actions">
        <button type="button" data-departure-stay class="btn btn-ghost btn-flex">Stay &amp; review the lab</button>
        <button type="button" data-departure-reset class="btn btn-primary btn-flex">${icon('rotate-ccw', 's14')} Reset for another run</button>
      </div>
    </div>`);
  }

  function openDeparture() {
    const content = departureContent();
    Lab.ui.openOverlay({ id: 'departure', content, variant: 'dialog', label: 'End-of-shift report', onClose: () => {} });
  }

  // ════════════════════════════ RESET DIALOG ═════════════════════════════════
  // Port of the reset AlertDialog — confirm returns the lab to pristine state.
  function openResetDialog(onConfirm) {
    const content = el(`
    <div class="dialog dialog-alert" data-slot="dialog-content">
      <h2 class="dialog-title-sm">Reset the lab to pristine state?</h2>
      <p class="dialog-desc">This clears your mode, every objective, quiz answers and workbench state from browser
        storage, and returns you to shift selection. This cannot be undone.</p>
      <div class="dialog-actions dialog-actions-end">
        <button type="button" data-reset-cancel class="btn btn-ghost">Keep my progress</button>
        <button type="button" data-reset-confirm class="btn btn-danger">Reset everything</button>
      </div>
    </div>`);
    Lab.ui.openOverlay({ id: 'reset', content, variant: 'alert', label: 'Reset the lab to pristine state?', onClose: () => {} });
  }

  // ════════════════════════════ MAIN LAYOUT ══════════════════════════════════
  function renderMainLayout() {
    const state = S().getState();
    const frag = document.createDocumentFragment();
    const root = el(`<div class="lab-root" data-mode="${esc(state.mode)}"></div>`);

    root.appendChild(el(`<div aria-live="polite" role="status" class="sr-only" data-station-live></div>`));

    if (!S().storageOk) {
      root.appendChild(el(`<div class="storage-warning-wrap"><p class="storage-warning">${icon('database', 's14')} Browser storage is unavailable — progress will not survive a reload, but everything else still works.</p></div>`));
    }

    root.appendChild(renderControlStrip());
    root.appendChild(renderLineBoard());
    root.appendChild(renderBriefing());

    const main = el('<main class="lab-main"><div id="dispatch"></div><div id="workbench"></div></main>');
    root.appendChild(main);

    root.appendChild(el('<div id="signal-check" class="signal-check-wrap"></div>'));
    root.appendChild(renderHandover());
    root.appendChild(el('<div id="departure-btn-wrap" class="departure-btn-wrap" hidden></div>'));
    root.appendChild(el('<div class="breathing-room" aria-hidden="true"></div>'));

    frag.appendChild(root);
    return frag;
  }

  function updateStationLive() {
    const state = S().getState();
    const station = stationById(state.ui.station);
    const live = document.querySelector('[data-station-live]');
    if (live && station) live.textContent = `Now at ${station.name} station — ${station.tool}`;
  }

  function updateDepartureButton() {
    const prog = E().computeProgress(S().getState());
    const wrap = document.getElementById('departure-btn-wrap');
    if (!wrap) return;
    if (prog.allObjectivesDone && prog.allQuizDone) {
      wrap.hidden = false;
      if (!wrap.firstChild) {
        wrap.innerHTML = `<button type="button" data-open-departure class="btn btn-departure">${icon('train-front', 's16')} View end-of-shift report</button>`;
      }
    } else {
      wrap.hidden = true;
    }
  }

  function updateProgressUI() {
    const state = S().getState();
    const prog = E().computeProgress(state);
    const set = (sel, text) => {
      const n = document.querySelector(sel);
      if (n) n.textContent = text;
    };
    set('[data-hc-obj]', `${prog.completed}/${prog.total}`);
    set('[data-hc-quiz]', `${prog.quizCorrect}/${prog.quizTotal}`);

    // progress ring
    const ring = document.querySelector('[data-ring]');
    if (ring) {
      const size = 38;
      const r = (size - 6) / 2;
      const c = 2 * Math.PI * r;
      const filled = (Math.min(100, Math.max(0, prog.pct)) / 100) * c;
      ring.setAttribute('aria-label', `Lab progress ${prog.pct} percent`);
      const arc = ring.querySelector('[data-ring-arc]');
      if (arc) arc.setAttribute('stroke-dasharray', `${filled} ${c - filled}`);
      const txt = ring.querySelector('[data-ring-text]');
      if (txt) txt.textContent = `${prog.pct}%`;
    }

    const dc = document.querySelector('[data-dispatch-counters]');
    if (dc) {
      dc.textContent = `${prog.completed}/${prog.total} objectives · ${prog.quizCorrect}/${prog.quizTotal} signal check`;
    }
    const pillarTotals = E().perPillar(state, state.mode);
    const row = document.querySelector('[data-pillar-row]');
    if (row) {
      row.innerHTML = ['P1', 'P2', 'P3', 'P4']
        .map((p) => {
          const st = pillarTotals[p] || { done: 0, total: 0 };
          const full = st.total > 0 && st.done === st.total;
          return `<span class="pillar-pill ${full ? 'is-full' : ''}" title="${PILLAR_META[p].label}: ${st.done}/${st.total} objectives">
            ${icon(pillarIconName(PILLAR_META[p].icon), 's12')}
            ${p} · ${PILLAR_META[p].label} ${st.done}/${st.total}
          </span>`;
        })
        .join('');
    }

    updateLineBoard();
    updateDepartureButton();

    const footer = document.querySelector('[data-dispatch-footer]');
    if (footer) {
      if (!prog.allObjectivesDone) {
        footer.innerHTML = '<p class="dispatch-foot-hint">Stations advance via the line board above — work them in order for the full route.</p>';
      } else if (!prog.allQuizDone) {
        footer.innerHTML = '<p class="dispatch-foot-cta">All objectives complete — pass the Signal Check below, then clock out.</p>';
      } else {
        footer.innerHTML = '';
      }
    }
  }

  Lab.sections = {
    renderModeSelect,
    renderMainLayout,
    renderDispatch,
    rerenderDispatch,
    renderObjectiveCard,
    updateObjectiveCard,
    renderWorkbench,
    rerenderWorkbench,
    renderFileViewer,
    renderHandover,
    openFieldManual,
    openDeparture,
    openResetDialog,
    updateLineBoard,
    updateProgressUI,
    updateStationLive,
    filesForStation,
    stationById,
    departureContent,
    manualToolsTab,
    manualConceptsTab,
    manualThreatsTab,
    manualGlossaryTab,
  };
})(window.Lab);
