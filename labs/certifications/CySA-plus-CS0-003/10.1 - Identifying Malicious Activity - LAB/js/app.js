/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/app.js
   Bootstrap, phase routing, case header, instrument rails, the case-file
   (objective tracker) rail, and the eight bench instruments.

   Local component state (caseOpen, per-card feedback/hints, terminal history,
   SIEM view/stream/filter, lookup input values, glossary expansion) is kept
   in module variables exactly like the original React local state; store
   state lives in Lab (state.js). Re-rendering is scoped per notification so
   typing and focus are never disturbed.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const App = (() => {
  /* --------------------------- local UI state ------------------------------ */
  let caseOpen = false; // mobile case-file drawer
  const cardLocal = {}; // objId -> { feedback: CheckResult|null, hintsOpen: number }
  let termHistIdx = null;
  let whoisInput = '';
  let blocklistInput = '';
  let siemView = 'alerts'; // 'alerts' | 'streams' | 'tools'
  let siemStream = 'dns';
  let siemFilter = '';
  let glossOpen = null;

  const isMedium = () => Lab.mode === 'medium';

  /* ══════════════════════════════ PHASE SCREENS ═══════════════════════════ */

  function modeSelectHTML() {
    const m = MODE_COPY;
    const card = (key, icon, cls) => `
      <button type="button" class="mode-card ${cls}" data-act="mode" data-mode="${key}" aria-label="${UI.esc(m[key].aria)}">
        <div class="mode-card-head">
          <span class="mode-ico">${UI.icon(icon)}</span>
          <div>
            <h2>${UI.esc(m[key].name)}</h2>
            ${UI.micro(m[key].micro)}
          </div>
        </div>
        <p class="mode-desc">${UI.esc(m[key].desc)}</p>
        <ul>
          <li>${UI.icon('list-checks')} ${UI.esc(m[key].bullets[0])}</li>
          <li>${UI.icon('radio')} ${UI.esc(m[key].bullets[1])}</li>
          <li>${UI.icon('lock')} ${UI.esc(m[key].bullets[2])}</li>
        </ul>
      </button>`;

    return `
      <div class="screen-center mode-select-wrap">
        <div class="mode-head">
          <div class="lab-kicker">${UI.icon('shield-alert')}${UI.micro(m.kicker, 'amber')}</div>
          <h1>${UI.esc(m.title)}</h1>
          <p class="lede">${UI.esc(m.lede)}</p>
        </div>
        <div class="mode-grid">
          ${card('medium', 'gauge', 'medium focus-amber')}
          ${card('hard', 'moon-star', 'hard focus-green')}
        </div>
        ${UI.synthBanner('mode-synth')}
        <p class="foot-note">${UI.esc(m.storageNote)}</p>
      </div>`;
  }

  function briefingHTML() {
    return `
      <div class="screen-center briefing-wrap">
        <div class="brief-card">
          <div class="brief-top">
            ${UI.micro(`Case ${CASE.id} · “${CASE.codename}”`, 'amber')}
            ${UI.micro(INCIDENT_LABEL)}
          </div>
          <h1>${UI.esc(CASE.org)}</h1>
          <p class="brief-org">${UI.esc(CASE.orgBlurb)}</p>
          <p class="brief-situation">${UI.esc(CASE.situation)}</p>
          ${Lab.mode === 'hard' ? `<p class="hard-brief">${UI.esc(MODE_COPY.hardBrief)}</p>` : ''}
          <div class="mt-4">${UI.synthBanner()}</div>
          <div class="brief-actions">
            <button type="button" class="btn-bench" data-act="phase" data-phase="active">Take the bench →</button>
            <button type="button" class="btn-ghost" style="min-height:44px;padding:10px 16px;" data-act="phase" data-phase="mode-select">Change mode</button>
          </div>
        </div>
      </div>`;
  }

  /* ══════════════════════════════ CASE HEADER ═════════════════════════════ */

  function headerHTML() {
    const stats = computeStats(Lab.objectives, Lab.mode ?? 'medium');
    const pct = Math.round((stats.passed / stats.total) * 100);
    const completionBtn = stats.complete
      ? `<button type="button" class="btn-complete" data-act="header-complete">
          ${stats.stars > 0 ? `<span class="stars" aria-hidden="true">${Array(stats.stars).fill('<svg class="icon star-filled" aria-hidden="true"><use href="#i-star"></use></svg>').join('')}</span>` : ''}
          ${UI.icon('trophy')} ${Lab.quizSubmitted ? 'Completion report' : 'Finish quiz →'}
        </button>`
      : '';
    return `
      <header class="case-header">
        <div class="case-header-inner">
          <div class="case-id">
            <span class="case-dot" aria-hidden="true"></span>
            <div class="case-titles">
              <div class="case-code">CASE ${CASE.id} · ${CASE.codename}</div>
              ${UI.micro(`${CASE.org} — SOC Bench 3`)}
            </div>
          </div>
          <span class="mode-chip">${Lab.mode === 'hard' ? 'Night Watch · Hard' : 'Guided Watch · Medium'}</span>
          <div class="header-right">
            <div class="progress-wrap" aria-label="Objectives ${stats.passed} of ${stats.total} passed, ${pct} percent">
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
              <span class="progress-count">${stats.passed}/${stats.total}</span>
            </div>
            ${completionBtn}
            <button type="button" class="btn-header btn-casefile" data-act="toggle-case" aria-expanded="${caseOpen}">
              ${UI.icon('list-checks')} Case file
            </button>
            <button type="button" class="btn-header reset" data-act="open-reset">${UI.icon('rotate-ccw')} Reset</button>
          </div>
        </div>
        <div class="mini-progress"><div style="width:${pct}%"></div></div>
      </header>`;
  }

  /* ════════════════════════════ INSTRUMENT RAILS ══════════════════════════ */

  function instrumentHasOpenWork(id) {
    const ids = INSTRUMENT_OPEN_WORK[id] ?? [];
    return ids.some((o) => {
      const def = OBJECTIVES.find((d) => d.id === o);
      return def?.mode === Lab.mode && !Lab.objectives[o]?.passed;
    });
  }

  function railHTML(compact) {
    const keys = RAIL_KEYS.map((k) => {
      const active = Lab.instrument === k.id;
      const led = instrumentHasOpenWork(k.id);
      return `
        <button type="button" class="rail-key ${active ? 'active' : ''}" data-act="instrument" data-instrument="${k.id}"
          aria-pressed="${active}" aria-label="${k.label} instrument">
          ${UI.icon(k.icon)}
          <span class="rail-label">${k.label}</span>
          ${led ? '<span class="rail-led" aria-hidden="true"></span>' : ''}
          ${active ? '<span class="rail-bar" aria-hidden="true"></span>' : ''}
        </button>`;
    }).join('');
    return `<nav aria-label="Instrument selection" class="${compact ? 'rail-compact' : 'rail-desktop'}">${keys}</nav>`;
  }

  /* ═══════════════════════════ CASE-FILE RAIL ═════════════════════════════ */

  function hintTiersFor(def) {
    return isMedium() ? def.hints.length : 1;
  }

  function objectiveCardHTML(def, isNext) {
    const prog = Lab.objectives[def.id] ?? { passed: false, attempts: 0, hintsUsed: 0 };
    const local = cardLocal[def.id] ?? {};
    const hintsOpen = local.hintsOpen ?? 0;
    const tierCount = hintTiersFor(def);
    const revealedHints = isMedium() ? def.hints.slice(0, prog.hintsUsed) : prog.hintsUsed > 0 ? [def.nudge] : [];

    /* head */
    const head = `
      <div class="obj-head">
        <span class="obj-check ${prog.passed ? 'passed' : ''}" aria-hidden="true">
          ${UI.icon(prog.passed ? 'check-circle-2' : 'minus-circle')}
        </span>
        <span class="obj-id">${def.id}</span>
        ${UI.pillarBadge(def.pillar)}
        ${isNext && !prog.passed ? '<span class="up-next">UP NEXT</span>' : ''}
      </div>`;

    /* body top */
    let html = `
      ${head}
      <h3 class="obj-title">${UI.esc(def.title)}</h3>
      ${isMedium() && def.context ? `<p class="obj-context">${UI.esc(def.context)}</p>` : ''}
      <p class="obj-anchor">ANCHOR · ${UI.esc(def.anchor)}</p>`;

    /* state objectives: live status line */
    if (def.kind === 'state') {
      html += `<div class="obj-status">`;
      if (prog.passed) {
        html += `
          <div class="status-passed">
            ${UI.micro('Satisfied — feedback', 'green')}
            <p>${UI.esc(validateStateObjective(def.id, Lab.env).feedback)}</p>
          </div>`;
      } else {
        html += `<p class="status-open">STATUS · open — perform the action in the instrument, this card ticks itself.</p>`;
      }
      if (def.id === 'H6') {
        html += `
          <div class="h6-restart">
            <p>Performed out of order? Reset the containment practice (isolation, quarantine, perimeter block and
            escalation return to undone) and run it again in the right sequence.</p>
            <button type="button" class="btn btn-orange" style="min-height:38px;margin-top:8px;padding:0 12px;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;border-radius:6px;background:transparent;" data-act="restart-seq" data-fk="restart-seq">
              Restart containment sequence
            </button>
          </div>`;
      }
      html += `</div>`;
    }

    /* answer objectives: inputs + CHECK */
    if (def.kind === 'answer') {
      const fields = (def.fields ?? [])
        .map(
          (f) => `
          <label class="obj-field">
            <span>${UI.esc(f.label)}</span>
            <input class="input" data-obj-input="${def.id}.${f.id}" data-fk="obj-${def.id}-${f.id}"
              value="${UI.esc(Lab.answers[def.id]?.[f.id] ?? '')}"
              placeholder="${UI.esc(f.placeholder)}"
              aria-label="Objective ${def.id} — ${UI.esc(f.label)}" />
          </label>`
        )
        .join('');
      const fb = local.feedback;
      html += `
        <div class="obj-fields">
          ${fields}
          <div class="obj-actions">
            <button type="button" class="btn-check" data-act="check-obj" data-obj="${def.id}" data-fk="check-${def.id}">Check results</button>
            ${def.jumpTo ? `<button type="button" class="btn-jump" data-act="jump" data-instrument="${def.jumpTo}" data-fk="jump-${def.id}">Open instrument ${UI.icon('arrow-right')}</button>` : ''}
          </div>
          ${
            fb
              ? `<div class="feedback-box ${fb.pass ? 'pass' : 'fail'} anim-expand" role="status">
                  ${UI.micro(fb.pass ? 'Correct' : 'Not yet', fb.pass ? 'green' : 'orange')}
                  <p>${UI.esc(fb.feedback)}</p>
                </div>`
              : ''
          }
        </div>`;
    }

    /* hints / nudge */
    html += `<div class="hint-box mt-3">`;
    if (isMedium()) {
      let label;
      if (hintsOpen === 0) label = `Hint (1/${tierCount}) — costs stars`;
      else if (hintsOpen < tierCount) label = `Reveal hint (${hintsOpen + 1}/${tierCount})`;
      else label = 'Hide hints';
      html += `
        <button type="button" class="hint-btn" data-act="hint" data-obj="${def.id}" aria-expanded="${hintsOpen > 0}" data-fk="hint-${def.id}">
          ${UI.icon('lightbulb')} ${label} ${UI.icon('chevron-down')}
        </button>
        ${hintsOpen > 0 ? `<div class="anim-expand"><ol>${revealedHints.map((h, i) => `<li><span class="tier">TIER ${i + 1}</span>${UI.esc(h)}</li>`).join('')}</ol></div>` : ''}`;
    } else {
      html += `
        <button type="button" class="hint-btn nudge-btn ${prog.hintsUsed > 0 ? 'used' : ''}" data-act="nudge" data-obj="${def.id}"
          ${prog.hintsUsed > 0 ? 'disabled' : ''} data-fk="nudge-${def.id}">
          ${UI.icon('lock')} ${prog.hintsUsed > 0 ? 'Nudge used (−score)' : 'Take nudge (visible score cost)'}
        </button>
        ${prog.hintsUsed > 0 ? `<p class="nudge-box">${UI.esc(def.nudge)}</p>` : ''}`;
    }
    html += `</div>`;

    /* state objective jump */
    if (def.kind === 'state' && def.jumpTo && !prog.passed) {
      html += `
        <div class="obj-goto">
          <button type="button" class="btn-jump" data-act="jump" data-instrument="${def.jumpTo}" data-fk="goto-${def.id}">
            Go to instrument ${UI.icon('arrow-right')}
          </button>
        </div>`;
    }

    return `
      <article class="obj-card ${prog.passed ? 'passed' : isNext ? 'next' : ''}" aria-label="Objective ${def.id}">
        ${html}
      </article>`;
  }

  function casefileHTML() {
    const defs = OBJECTIVES.filter((o) => o.mode === Lab.mode);
    const stats = computeStats(Lab.objectives, Lab.mode);
    const nextId = defs.find((d) => !Lab.objectives[d.id]?.passed)?.id;
    const cards = defs.map((def) => objectiveCardHTML(def, def.id === nextId)).join('');
    const allPassedNote =
      stats.complete && !Lab.quizSubmitted
        ? `<p class="all-passed-note">ALL OBJECTIVES PASSED → open the QUIZ instrument and finish the shift.</p>`
        : '';
    return `
      <aside class="objectives-rail ${caseOpen ? '' : 'hidden-mobile'}" aria-label="Case file and objectives">
        <div class="casefile-card">
          <div class="casefile-top">
            ${UI.micro(`Case file · ${CASE.id}`, 'amber')}
            <span class="casefile-count" aria-live="polite">${stats.passed}/${stats.total} · ${stats.hintCount} hints</span>
          </div>
          <p class="casefile-blurb">${UI.esc(CASE.org)} — overnight shift. Use the instruments, tick the case, close the watch.</p>
          <div class="mt-3">${UI.synthBanner()}</div>
          ${allPassedNote}
        </div>
        ${cards}
      </aside>`;
  }

  /* ═════════════════════════════ INSTRUMENTS ══════════════════════════════ */

  /* ---------- PRIMER ---------- */
  function renderPrimer() {
    const families = FAMILIES.map(
      (f) => `
      <div class="family-card">
        <div class="family-head">${UI.icon(f.icon)}<h3>${UI.esc(f.name)}</h3></div>
        <p class="what">${UI.esc(f.what)}</p>
        <p class="gotcha"><span class="g-label">Gotcha · </span>${UI.esc(f.gotcha)}</p>
      </div>`
    ).join('');

    const pipeline = PIPELINE.map(
      (p) => `<li><div class="step">${UI.esc(p.step)}</div><p>${UI.esc(p.text)}</p></li>`
    ).join('');

    const refs = REAL_WORLD.map(
      (r) => `
      <div class="ref-card">
        <a href="${UI.esc(r.url)}" target="_blank" rel="noopener noreferrer" class="ref-link">${UI.esc(r.ref)} ${UI.icon('external-link')}</a>
        <p>${UI.esc(r.text)}</p>
      </div>`
    ).join('');

    const others = `
      <div class="other-card">
        <div class="other-head">${UI.icon('search')}<h3>OSINT</h3></div>
        <p>Open-source intelligence: public registries, paste sites, vendor blogs, threat reports — free enrichment for your IOC story.</p>
      </div>
      <div class="other-card">
        <div class="other-head">${UI.icon('microscope')}<h3>Sandbox detonation</h3></div>
        <p>Run a suspicious file in an instrumented cage and watch what it does — behavior you can never get from a static hash alone.</p>
      </div>
      <div class="other-card">
        <div class="other-head">${UI.icon('box')}<h3>IDS / IPS & NetFlow</h3></div>
        <p>Network sensors pattern-match traffic inline; flow records expose beacon cadence even when payloads are encrypted.</p>
      </div>`;

    const drillRows = (slots, kind, opts) =>
      slots
        .map(
          (s) => `
          <div class="drill-row">
            <span>${UI.esc(s.text)}</span>
            <select class="input" data-drill="${kind}" data-slot="${s.id}" data-fk="drill-${kind}-${s.id}" aria-label="Match scenario ${s.id}">
              <option value="">— pick a tool —</option>
              ${opts.map((o) => `<option value="${o.value}" ${(Lab.env.drills[kind] ?? {})[s.id] === o.value ? 'selected' : ''}>${UI.esc(o.label)}</option>`).join('')}
            </select>
          </div>`
        )
        .join('');

    const matchDrill =
      Lab.mode === 'medium'
        ? UI.panel(
            {},
            `${UI.panelHeader('Tool Match drill', UI.objTag('OBJ-M8'))}
             ${UI.panelBody(`
               <p class="drills-note mb-3">Match each mini-scenario to the tool family built for it. Wrong picks can be re-chosen — the card ticks when all three are right.</p>
               <div class="gap-b">${drillRows(MATCH_SLOTS, 'toolMatch', TOOL_OPTIONS.filter((o) => o.value !== 'sandbox'))}</div>
             `)}`
          )
        : '';

    const fitDrill =
      Lab.mode === 'hard'
        ? UI.panel(
            {},
            `${UI.panelHeader('Tool-Fit matrix — five scenarios, one line each', UI.objTag('OBJ-H9'))}
             ${UI.panelBody(`
               <p class="drills-note mb-3">Two of these belong to tools this bench does not own. The lesson calls them “many others” — reach for them anyway.</p>
               <div class="gap-b">${drillRows(FIT_SLOTS, 'toolFit', TOOL_OPTIONS)}</div>
             `)}`
          )
        : '';

    const glossary = GLOSSARY.map(
      (g) => `
      <li>
        <button type="button" class="glossary-term" data-act="gloss" data-term="${UI.esc(g.term)}" aria-expanded="${glossOpen === g.term}">
          <span class="term">${UI.esc(g.term)}</span>
          ${UI.icon('book-open')}
        </button>
        ${glossOpen === g.term ? `<p class="glossary-def anim-expand">${UI.esc(g.def)}</p>` : ''}
      </li>`
    ).join('');

    return `
      <div class="stack">
        ${UI.panel(
          {},
          `${UI.panelHeader('Primer · Identifying malicious activity (Lesson 10.1)')}
           ${UI.panelBody(`
             <p class="primer-lede mb-3">Identifying malicious activity is the first job of any security operations team: noticing
             that something on a host or the network is <em>not normal</em>, deciding what it is, and knowing what to do next. No single tool sees everything — the craft is
             <span class="amber"> chaining five instrument families</span> until the evidence agrees with itself. That chain — alert → verify → enrich → act → dispose — is
             the skeleton of tonight’s case.</p>
             <div class="families-grid mb-3">${families}</div>
             <div>
               ${UI.micro('The triage pipeline — how the bench thinks', 'mb-2')}
               <ol class="pipeline">${pipeline}</ol>
             </div>
           `)}`
        )}
        ${UI.panel(
          {},
          `${UI.panelHeader('Real-world pattern · verified MITRE references', UI.micro('opens in new tab'))}
           <div class="refs-grid">${refs}</div>`
        )}
        ${UI.panel(
          {},
          `${UI.panelHeader('“…and many others” — the rest of the toolbox')}
           <div class="others-grid">${others}</div>`
        )}
        ${matchDrill}
        ${fitDrill}
        ${UI.panel({}, `${UI.panelHeader(`Glossary · ${GLOSSARY.length} terms`)}<ul class="glossary-list">${glossary}</ul>`)}
      </div>`;
  }

  /* ---------- EDR ---------- */
  function edrDetectionLabel(id, type) {
    const m3Passed = !!Lab.objectives['M3']?.passed;
    return isMedium() && id === 'E-701' && !m3Passed ? 'pending triage' : type;
  }

  function renderEdr() {
    const alert = EDR_ALERTS.find((a) => a.id === Lab.env.edr.activeAlert) ?? EDR_ALERTS[0];

    const queue = EDR_ALERTS.map(
      (a) => `
      <li>
        <button type="button" class="queue-btn sev-l-${a.severity} ${a.id === alert.id ? 'current' : ''}"
          data-act="edr-alert" data-alert="${a.id}" aria-current="${a.id === alert.id}">
          <div class="q-top">
            <span class="q-id">${a.id}</span>
            ${UI.sevBadge(a.severity)}
            <span class="q-time">${a.time}</span>
          </div>
          <p class="q-title">${UI.esc(a.title)}</p>
          <div class="q-meta">
            <span class="mini-chip">${edrDetectionLabel(a.id, a.detection)}</span>
            <span>${a.host}</span>
          </div>
        </button>
      </li>`
    ).join('');

    const indicators = alert.indicators
      .map(
        (ind) => `
        <div class="kv-row">
          <dt>${UI.esc(ind.label)}</dt>
          <dd>${UI.esc(ind.value)}</dd>
        </div>`
      )
      .join('');

    /* M3 classification exercise (medium) */
    let classify = '';
    if (alert.canAct && Lab.mode === 'medium') {
      const chips = ['signature', 'heuristic', 'behavioral']
        .map(
          (t) => `
          <button type="button" class="chip ${Lab.env.edr.detectionTypeAnswer === t ? 'amber' : ''}" data-act="classify" data-type="${t}"
            aria-pressed="${Lab.env.edr.detectionTypeAnswer === t}" data-fk="classify-${t}">${t}</button>`
        )
        .join('');
      classify = `
        <div class="exercise">
          <div class="exercise-head">${UI.objTag('OBJ-M3')}<span class="prompt">Classify this detection — which engine caught it?</span></div>
          <div class="opt-buttons">${chips}</div>
          ${
            Lab.env.edr.detectionTypeAnswer
              ? `<p class="exercise-info">${UI.icon('info')}${UI.esc(DETECTION_INFO[Lab.env.edr.detectionTypeAnswer])}</p>`
              : ''
          }
        </div>`;
    }

    /* response actions */
    const iso = Lab.env.edr.isolated;
    const quar = Lab.env.edr.quarantined;
    const responseActions = alert.canAct
      ? `
        <div class="kv-box">
          ${UI.micro('Response actions · analyst-controlled', 'mb-3 bright')}
          <div class="opt-buttons">
            <button type="button" data-act="edr-isolate" data-fk="edr-isolate"
              class="btn ${iso ? 'btn-greenline' : 'btn-redsoft'}"
              style="min-height:44px;padding:0 16px;"
              aria-pressed="${iso}">
              ${UI.icon('unplug')} ${iso ? 'Host ISOLATED ✓ (click to undo)' : 'Isolate host'}
            </button>
            <button type="button" data-act="edr-quarantine" data-fk="edr-quarantine"
              class="btn ${quar ? 'btn-greenline' : 'btn-redsoft'}"
              style="min-height:44px;padding:0 16px;"
              aria-pressed="${quar}">
              ${UI.icon('file-lock-2')} ${quar ? 'File QUARANTINED ✓ (click to undo)' : 'Quarantine file'}
            </button>
          </div>
          <p class="response-note">Isolation cuts the host from the network while keeping the sensor alive; quarantine vaults the binary
          where it cannot execute. <span class="order">Practice good order: cut comms first, remove second.</span></p>
        </div>`
      : `
        <div class="autonote">
          ${UI.icon(alert.id === 'E-703' ? 'shield-check' : 'alert-triangle')}
          <p>${UI.esc(alert.autoNote)}</p>
        </div>`;

    return `
      <div class="two-col" style="align-items:start;">
        ${UI.panel({ ariaLabel: 'EDR alert queue' }, `
          ${UI.panelHeader('SENTRY-EDR · alert queue', UI.micro('3 detections · 24h'))}
          <ul class="queue-list">${queue}</ul>`)}
        ${UI.panel({ ariaLabel: 'EDR alert detail' }, `
          ${UI.panelHeader(
            `SENTRY-EDR · ${alert.id}`,
            `<span class="row-wrap">${UI.sevBadge(alert.severity)}<span class="badge">${edrDetectionLabel(alert.id, alert.detection)}</span></span>`
          )}
          ${UI.panelBody(`
            <div class="gap-b">
              <div>
                <h2 class="detail-title">${UI.esc(alert.title)}</h2>
                <p class="detail-meta">${alert.host} · ${alert.time} · detection type: ${edrDetectionLabel(alert.id, alert.detection)}</p>
              </div>
              <p class="detail-desc">${UI.esc(alert.description)}</p>
              <div class="kv-box">
                ${UI.micro('Process tree', 'mb-2 bright')}
                <pre class="pre-box">${UI.esc(alert.processTree.join('\n'))}</pre>
              </div>
              <div>
                ${UI.micro('Indicators', 'mb-2 bright')}
                <dl class="kv-grid" style="grid-template-columns:1fr;">${indicators}</dl>
              </div>
              ${classify}
              ${responseActions}
            </div>`)}
        `)}
      </div>`;
  }

  /* ---------- SHELL ---------- */
  function renderShell() {
    const host = Lab.env.terminal.host;
    const chips = TERM_QUICK_CMDS.map((c) => `<button type="button" class="term-chip" data-act="term-cmd" data-cmd="${UI.esc(c)}">${UI.esc(c)}</button>`).join('');
    return `
      ${UI.panel(
        { ariaLabel: 'Triage console' },
        `${UI.panelHeader(
          'TRIAGE CONSOLE · simulated shell',
          `<div class="row-wrap">
            <span class="host-chip" id="term-host">${UI.esc(HOSTS[host].os)}</span>
            <button type="button" class="btn-header" style="min-height:32px;padding:0 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;" data-act="term-clear">clear</button>
          </div>`
        )}
        ${UI.panelBody(`
          ${UI.synthBanner('mb-3')}
          <div id="term-log" class="term-log lab-scroll" role="log" aria-live="polite" aria-label="Console output"></div>
          <form id="term-form" class="term-form" data-fk="term-form">
            <span class="term-prompt" id="term-prompt" aria-hidden="true">analyst@bench3[${host}]$</span>
            <span class="sr-only" aria-live="polite" id="term-sr">Terminal ready on host ${host}</span>
            <input id="term-input" class="term-input" data-fk="term-input" value="" aria-label="Console command input — type help for the command set"
              autocomplete="off" spellcheck="false" placeholder="type a command… (help)" />
            <button type="submit" class="btn-run">Run</button>
          </form>
          <div class="term-chips">${chips}</div>
          ${UI.micro('Windows commands answer on WS-ENG-014 · Linux on WEB-LNX-02 · lookups run console-side', 'mt-2')}
        `)}`
      )}`;
  }

  function updateShell() {
    const log = document.getElementById('term-log');
    if (!log) return;
    const host = Lab.env.terminal.host;
    const frag = document.createDocumentFragment();
    if (!Lab.env.terminal.lines.length) {
      const p = document.createElement('p');
      p.className = 'term-empty';
      p.textContent = '(console cleared — type  help  to begin)';
      frag.appendChild(p);
    } else {
      for (const line of Lab.env.terminal.lines) frag.appendChild(UI.termLine(line));
    }
    log.replaceChildren(frag);
    log.scrollTop = log.scrollHeight;
    const hostChip = document.getElementById('term-host');
    if (hostChip) hostChip.textContent = HOSTS[host].os;
    const prompt = document.getElementById('term-prompt');
    if (prompt) prompt.textContent = `analyst@bench3[${host}]$`;
    const sr = document.getElementById('term-sr');
    if (sr) sr.textContent = `Terminal ready on host ${host}`;
  }

  /* ---------- WHOIS ---------- */
  function renderWhois() {
    const domain = Lab.env.whois.lastDomain;
    const rec = domain ? WHOIS_RECORDS[domain] : undefined;

    const form = `
      <form id="whois-form" class="lookup-form">
        <input class="input" data-fk="whois-input" id="whois-input" value="${UI.esc(whoisInput)}"
          placeholder="domain.tld" aria-label="Domain to look up" />
        <button type="submit" class="btn-amber btn" style="min-height:44px;padding:0 20px;">
          ${UI.icon('globe')} WHOIS lookup
        </button>
      </form>
      <div class="suggest-row">
        ${WHOIS_SUGGESTIONS.map(
          (d) => `<button type="button" class="chip ${domain === d ? 'amber' : ''}" data-act="whois-chip" data-domain="${UI.esc(d)}">${UI.esc(d)}</button>`
        ).join('')}
      </div>
      ${!domain ? `<p class="mono-xs mt-4">No record loaded. Analyst lens: age, registrant identity, privacy shield, name servers.</p>` : ''}`;

    const noMatch =
      domain && !rec ? UI.panel({}, `<div class="no-record">No match for “${UI.esc(domain)}”.</div>`) : '';

    const ageCls = rec ? (rec.ageDays <= 7 ? 'fresh' : rec.ageDays <= 45 ? 'recent' : 'old') : '';
    const ageLabel = rec ? (rec.ageDays === 3522 ? 'registered 9+ years ago' : `registered ${rec.ageDays} days ago`) : '';

    const record = rec
      ? UI.panel(
          { ariaLabel: 'WHOIS record' },
          `${UI.panelHeader(`Record · ${rec.domain}`, `<span class="age-badge ${ageCls}">${ageLabel}</span>`)}
           ${UI.panelBody(`
             <dl class="kv-grid">
               ${[
                 ['Registrar', rec.registrar],
                 ['Created', `${rec.created}  (${rec.ageDays === 3522 ? '≈9.6 years' : `${rec.ageDays}d`} before ${INCIDENT_DATE})`],
                 ['Registry expiry', rec.expires],
                 ['Registrant', rec.privacy ? 'REDACTED FOR PRIVACY (privacy shield service)' : rec.registrant],
                 ['Registrant country', rec.country],
                 ['Name servers', rec.nameServers.join(' · ')],
                 ['DNSSEC', rec.dnssec],
                 ['Domain status', rec.status],
               ]
                 .map(([k, v]) => `<div class="kv"><dt>${UI.esc(k)}</dt><dd>${UI.esc(v)}</dd></div>`)
                 .join('')}
             </dl>
             ${
               domain === 'alderwoodportal-secure[.]com'
                 ? `<div class="kv-box mt-4">
                     ${UI.micro('Phishing anatomy · read the name like an analyst', 'mb-2 bright')}
                     <div class="anatomy-row">
                       ${WHOIS_ANATOMY.map((a) => `<span class="anatomy-part ${a.cls}">${UI.esc(a.part)}<span class="part-label">${a.label}</span></span>`).join('')}
                     </div>
                     <p class="anatomy-compare">Compare with the real portal: <span class="mono">portal[.]alderwoodfreight.com</span> —
                     company-controlled registrar, named registrant, nine years of history.</p>
                   </div>`
                 : ''
             }
             <div class="lens-card mt-4">
               <div class="lens-head">${UI.icon('shield-question')}${UI.objTag(Lab.mode === 'hard' ? 'OBJ-H3' : 'OBJ-M4')}<span class="lens-title">Analyst lens</span></div>
               <p>${UI.esc(rec.verdictNote)}</p>
             </div>
           `)}`
        )
      : '';

    return `
      <div class="stack">
        ${UI.panel({ ariaLabel: 'WHOIS lookup' }, `${UI.panelHeader('Domain registry · WHOIS lens', UI.micro('public registration records'))}${UI.panelBody(form)}`)}
        ${noMatch}
        ${record}
      </div>`;
  }

  /* ---------- BLOCKLIST ---------- */
  function classifyLookup(value) {
    const v = value.trim();
    if (/^[0-9a-f]{64}$/i.test(v)) return 'hash';
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) return 'ip';
    return 'domain';
  }

  const LOOKUP_TYPE_ICON = { ip: 'network', domain: 'globe-2', hash: 'fingerprint' };

  function renderBlocklist() {
    const lookup = Lab.env.blocklist.lastLookup;
    const entry = lookup ? BLOCKLIST[lookup.value] : undefined;
    const missNote = lookup ? BLOCKLIST_MISS_NOTES[lookup.value] : undefined;
    const type = lookup?.type;

    const showVerdictDrill = isMedium() && type === 'ip' && lookup?.value === '185.199.72.44' && entry?.listed;
    const wrongVerdict = showVerdictDrill && Lab.env.drills.blockVerdict !== null && Lab.env.drills.blockVerdict !== 'c2';

    const form = `
      <form id="blocklist-form" class="lookup-form">
        <input class="input" data-fk="blocklist-input" id="blocklist-input" value="${UI.esc(blocklistInput)}"
          placeholder="IP · domain · or 64-char SHA-256" aria-label="Indicator to check against feeds" />
        <button type="submit" class="btn-amber btn" style="min-height:44px;padding:0 20px;">
          ${UI.icon('ban')} Check feeds
        </button>
      </form>
      <div class="suggest-row">
        ${BLOCKLIST_SUGGESTIONS.map(
          (d) => `<button type="button" class="chip" data-act="blocklist-chip" data-value="${UI.esc(d)}">${UI.esc(d)}</button>`
        ).join('')}
      </div>
      <p class="feed-model-note">${UI.esc(BLOCKLIST_FEED_NOTE)}</p>`;

    let verdict = '';
    if (lookup) {
      let inner;
      if (entry?.listed) {
        const kv = [
          ['Category', entry.category ?? '—'],
          ['Confidence', entry.confidence ?? '—'],
          ['First seen', entry.firstSeen ?? '—'],
          ['Last seen', entry.lastSeen ?? '—'],
        ]
          .map(([k, v]) => `<div class="kv"><dt>${UI.esc(k)}</dt><dd>${UI.esc(v)}</dd></div>`)
          .join('');

        const blockAction =
          entry.recommendBlock && type === 'ip' && lookup.value === '185.199.72.44'
            ? `<div class="op-action">
                ${UI.micro('Operational action', 'mb-2 bright')}
                ${
                  Lab.env.siem.firewallBlocks.includes('185.199.72.44')
                    ? `<p class="blocked-note">${UI.icon('shield-check')} 185.199.72.44 blocked at the perimeter firewall ✓</p>`
                    : `<button type="button" class="block-ip-btn" data-act="block-ip" data-fk="block-ip">Block at perimeter firewall</button>`
                }
                <p class="response-note mt-2">One host is contained by EDR isolation — a perimeter block protects the other 1,199.</p>
              </div>`
            : '';

        const hashAction =
          type === 'hash'
            ? `<div class="op-action">
                ${UI.micro('Confirm this artifact', 'mb-2 bright')}
                ${Lab.env.blocklist.hashConfirmed ? `<p class="blocked-note mb-2">${UI.icon('shield-check')} IOC match confirmed and noted in the case file ✓</p>` : ''}
                <button type="button" class="btn-amber btn" style="min-height:44px;padding:0 16px;" data-act="confirm-hash" data-fk="confirm-hash">
                  ${Lab.env.blocklist.hashConfirmed ? 'Re-confirm IOC match' : 'Confirm IOC match'}
                </button>
              </div>`
            : '';

        inner = `
          <div class="hit-card lookup-mt">
            <div class="hit-head">
              ${UI.icon('shield-x')}
              <span class="hit-badge">HIT — listed</span>
              <span class="hit-feed">${UI.esc(entry.feed)}</span>
            </div>
            <dl class="kv-grid lookup-mt">${kv}</dl>
            ${entry.note ? `<p class="response-note mt-3">${UI.esc(entry.note)}</p>` : ''}
            ${blockAction}
            ${hashAction}
          </div>`;
      } else {
        inner = `
          <div class="nohit-card lookup-mt">
            <div class="nohit-head">
              ${UI.icon('shield-check')}
              <span class="nohit-badge">NO HIT</span>
              <span class="nohit-sub">not present on any subscribed feed</span>
            </div>
            <p class="response-note mt-2">${UI.esc(missNote ?? 'No feed entry. Remember both directions: a HIT accelerates confirmation; a NO HIT never proves innocence — feeds are reactive.')}</p>
          </div>`;
      }

      const drill = showVerdictDrill
        ? `<div class="exercise lookup-mt">
            <div class="exercise-head">${UI.objTag('OBJ-M5')}<span class="prompt">Your verdict — what is this IP?</span></div>
            <div class="opt-buttons">
              ${VERDICT_OPTIONS.map(
                (o) => `<button type="button" class="chip ${Lab.env.drills.blockVerdict === o.id ? 'amber' : ''}" data-act="verdict" data-verdict="${o.id}" aria-pressed="${Lab.env.drills.blockVerdict === o.id}">${UI.esc(o.label)}</button>`
              ).join('')}
            </div>
            ${wrongVerdict ? `<p class="verdict-hint">Re-read the Category field on the verdict card — the feed literally names it. Match your verdict to the evidence.</p>` : ''}
          </div>`
        : '';

      verdict = UI.panel(
        { ariaLabel: 'Feed verdict' },
        `${UI.panelHeader('Verdict', type ? `<span class="row-wrap mono-xs">${UI.icon(LOOKUP_TYPE_ICON[type])} ${type} lookup</span>` : '')}
         ${UI.panelBody(`<p class="lookup-value">${UI.esc(lookup.value)}</p>${inner}${drill}`)}`
      );
    }

    return `
      <div class="stack">
        ${UI.panel({ ariaLabel: 'Blocklist lookup' }, `${UI.panelHeader('Blocklist intelligence · subscribed feeds', UI.micro('3 feeds · updated 02:51'))}${UI.panelBody(form)}`)}
        ${verdict}
      </div>`;
  }

  /* ---------- SIEM ---------- */
  function siemAlertRow(a) {
    const disp = Lab.env.siem.dispositions[a.id];
    const current = Lab.env.siem.activeAlert === a.id;
    return `
      <li>
        <button type="button" class="queue-btn sev-l-${a.severity} ${current ? 'current' : ''}" data-act="siem-alert" data-alert="${a.id}" aria-current="${current}">
          <div class="q-top">
            <span class="q-id">${a.id}</span>
            ${UI.sevBadge(a.severity)}
            <span class="badge" style="font-size:9px;">${a.ruleCode}</span>
            <span class="q-time">${a.time}</span>
          </div>
          <p class="q-title">${UI.esc(a.rule)}</p>
          <p class="q-entity">${UI.esc(a.entity)}</p>
          ${disp ? `<span class="q-disp ${disp}">${disp === 'tp' ? 'escalated · TP' : 'closed · FP'}</span>` : ''}
        </button>
      </li>`;
  }

  function siemDetailHTML() {
    const alert = SIEM_ALERTS.find((a) => a.id === Lab.env.siem.activeAlert) ?? null;
    if (!alert) {
      return UI.panel({ ariaLabel: 'SIEM alert detail' }, `${UI.panelHeader('Alert detail')}<div class="panel-body"><p class="mono-xs">Select an alert from the queue to work it.</p></div>`);
    }

    /* M6 — correlation breakdown (medium) */
    let correlation = '';
    if (alert.correlation && Lab.mode === 'medium') {
      const events = [...(alert.correlation ?? []), ...(alert.correlationDistractors ?? [])];
      correlation = `
        <div class="exercise">
          <div class="exercise-head">${UI.objTag('OBJ-M6')}<span class="prompt">Correlation breakdown — select the TWO event types this rule combined:</span></div>
          <div class="opt-list">
            ${events.map((ev) => {
              const sel = Lab.env.siem.correlationSelected.includes(ev.id);
              return `<button type="button" class="opt-btn ${sel ? 'selected' : ''}" data-act="corr" data-event="${ev.id}" aria-pressed="${sel}" data-fk="corr-${ev.id}">
                  <span style="${sel ? 'color:var(--amber);' : ''}">${UI.esc(ev.label)}</span>
                  <span class="sub">${UI.esc(ev.detail)}</span>
                </button>`;
            }).join('')}
          </div>
        </div>`;
    }

    /* H4 — root-cause audit (hard) */
    let cause = '';
    if (alert.id === 'A-1042' && Lab.mode === 'hard') {
      cause = `
        <div class="exercise">
          <div class="exercise-head">${UI.objTag('OBJ-H4')}<span class="prompt">Correlation audit — what actually happened?</span></div>
          <p class="help-note">Cross-check the Auth stream (tab above) before you answer: count the users, count the sources, and
          read what the successful login follows.</p>
          <div class="opt-list">
            ${CAUSE_OPTIONS.map(
              (o) => `<button type="button" class="opt-btn ${Lab.env.siem.causeAnswer === o.id ? 'selected' : ''}" data-act="cause" data-cause="${o.id}" aria-pressed="${Lab.env.siem.causeAnswer === o.id}" data-fk="cause-${o.id}">${UI.esc(o.label)}</button>`
            ).join('')}
          </div>
        </div>`;
    }

    /* disposition */
    const disp = Lab.env.siem.dispositions[alert.id];
    const disposition = `
      <div class="disposition-box">
        ${UI.micro('Disposition', 'bright')}
        ${
          disp
            ? `<div class="disp-done">
                <p class="disp-status ${disp}">${disp === 'tp' ? 'ESCALATED as true positive — ticket opened with the evidence tuple.' : 'CLOSED as false positive — rationale documented below.'}</p>
                ${alert.fpRationale && disp === 'fp' ? `<p class="fp-rationale">${UI.esc(alert.fpRationale)}</p>` : ''}
                <button type="button" class="btn-reopen" data-act="siem-reopen" data-alert="${alert.id}" data-fk="reopen-${alert.id}">${UI.icon('rotate-ccw')} Reopen disposition</button>
              </div>`
            : `<div class="opt-buttons">
                <button type="button" class="btn-redsoft btn" style="min-height:44px;padding:0 16px;" data-act="siem-dispose" data-alert="${alert.id}" data-kind="tp" data-fk="esc-${alert.id}">${UI.icon('arrow-up-right')} Escalate (true positive)</button>
                <button type="button" class="btn-dark btn" style="min-height:44px;padding:0 16px;" data-act="siem-dispose" data-alert="${alert.id}" data-kind="fp" data-fk="close-${alert.id}">${UI.icon('circle-x')} Close (false positive)</button>
              </div>`
        }
        ${alert.truth === 'fp' && disp === 'fp' ? `<p class="response-note mt-3">The full rationale is stored in the alert record — document before you close.</p>` : ''}
      </div>`;

    return UI.panel(
      { ariaLabel: 'SIEM alert detail' },
      `${UI.panelHeader(alert ? `Alert ${alert.id} · ${alert.ruleCode}` : 'Alert detail', alert ? UI.sevBadge(alert.severity) : '')}
       ${UI.panelBody(`
          <div class="gap-b fade-in">
            <div>
              <h2 class="detail-title">${UI.esc(alert.rule)}</h2>
              <p class="detail-meta">${alert.time} · source: ${UI.esc(alert.source)} · entity: ${UI.esc(alert.entity)}</p>
            </div>
            <p class="detail-desc">${UI.esc(alert.summary)}</p>
            <div class="why-box"><span class="why-label">Why it fired · </span>${UI.esc(alert.why)}</div>
            ${correlation}
            ${cause}
            ${disposition}
          </div>`)}`
    );
  }

  function siemStreamRowsHTML() {
    const streamData = STREAMS[siemStream];
    const f = siemFilter.trim().toLowerCase();
    const rows = !f
      ? streamData.rows
      : streamData.rows.filter((r) => r.cols.some((c) => c.toLowerCase().includes(f)) || r.detail.toLowerCase().includes(f) || r.t.includes(f));
    const body = rows
      .map((r) => {
        const cells = r.cols
          .map((c) => {
            const cls = /FAILED|DENY|E-701|alderwoodportal/i.test(c) ? 'cell-bad' : /success|ALLOW/i.test(c) ? 'cell-good' : '';
            return `<td class="${cls}">${UI.esc(c)}</td>`;
          })
          .join('');
        return `<tr><td>${UI.esc(r.t)}</td>${cells}<td class="detail-cell">${UI.esc(r.detail)}</td></tr>`;
      })
      .join('');
    const emptyRow = rows.length
      ? ''
      : `<tr><td colspan="5" class="stream-empty">No rows match “${UI.esc(siemFilter)}”.</td></tr>`;
    return `
      <thead><tr>
        <th>Time</th>
        ${streamData.headers.map((h) => `<th>${UI.esc(h)}</th>`).join('')}
        <th>Detail</th>
      </tr></thead>
      <tbody>${body}${emptyRow}</tbody>`;
  }

  function siemStreamsHTML() {
    const tabs = Object.keys(STREAMS)
      .map(
        (k) => `<button type="button" class="stream-tab ${siemStream === k ? 'active' : ''}" data-act="siem-stream" data-stream="${k}" role="tab" aria-selected="${siemStream === k}">${UI.esc(STREAMS[k].label)}</button>`
      )
      .join('');
    return `
      ${UI.panel(
        { ariaLabel: 'SIEM event streams' },
        `${UI.panelHeader(
          'Event streams · raw telemetry',
          `<div class="filter-box">${UI.icon('search')}<input id="siem-filter" class="filter-input" data-fk="siem-filter" value="${UI.esc(siemFilter)}" placeholder="filter rows…" aria-label="Filter stream rows" /></div>`
        )}
        ${UI.panelBody(`
          <div class="stream-tabs" role="tablist" aria-label="Log source">${tabs}</div>
          <div class="stream-wrap lab-scroll" role="region" aria-label="${UI.esc(STREAMS[siemStream].label)} rows">
            <table class="stream-table" id="siem-stream-table">${siemStreamRowsHTML()}</table>
          </div>`)}`
      )}`;
  }

  function siemToolsHTML() {
    /* M12 — capability drill (medium) */
    const capability =
      Lab.mode === 'medium'
        ? UI.panel(
            {},
            `${UI.panelHeader('SIEM capability drill', UI.objTag('OBJ-M12'))}
             ${UI.panelBody(`
               <div class="gap-b">
                 ${SIEM_DRILL.map(
                   (d) => `
                   <div class="drill-row">
                     <span>${UI.esc(d.text)}</span>
                     <select class="input" data-drill="siemDrill" data-slot="${d.id}" data-fk="siemdrill-${d.id}" aria-label="Capability match ${d.id}" style="min-width:190px;">
                       <option value="">— pick a capability —</option>
                       ${SIEM_DRILL_OPTIONS.map((o) => `<option value="${o.value}" ${(Lab.env.drills.siemDrill ?? {})[d.id] === o.value ? 'selected' : ''}>${UI.esc(o.label)}</option>`).join('')}
                     </select>
                   </div>`
                 ).join('')}
               </div>`)}`
          )
        : '';

    /* H7 — rule tuning (hard) */
    const tuning =
      Lab.mode === 'hard'
        ? UI.panel(
            {},
            `${UI.panelHeader('Rule tuning workshop · NEWDOM/LOOKALIKE coverage', UI.objTag('OBJ-H7'))}
             ${UI.panelBody(`
               <p class="drills-note mb-3">The NEWDOM rule is noisy and the LOOKALIKE rule only knows one domain. Choose the replacement that
               catches lookalike domains with the fewest false positives.</p>
               <div class="gap-b">
                 ${TUNING_RULES.map(
                   (r) => `
                   <button type="button" class="tuning-btn ${Lab.env.siem.tuningChoice === r.id ? 'selected' : ''}" data-act="tuning" data-rule="${r.id}" aria-pressed="${Lab.env.siem.tuningChoice === r.id}" data-fk="tuning-${r.id}">
                     <span class="rule-label">${UI.esc(r.label)}</span>
                     <span class="rule-note">${UI.esc(r.note)}</span>
                   </button>`
                 ).join('')}
               </div>`)}`
          )
        : '';

    /* H10 — timeline builder (hard) */
    let timeline = '';
    if (Lab.mode === 'hard') {
      timeline = UI.panel(
        {},
        `${UI.panelHeader('Timeline reconstruction — order the compromise', UI.objTag('OBJ-H10'))}
         ${UI.panelBody(`
           <p class="drills-note">Cross-reference the DNS stream, the Firewall stream and  <span style="font-family:var(--font-mono);color:var(--text-body);">tcpdump -r /evidence/harbor.pcap</span> in the
           shell. Click the events in the order they occurred.</p>
           <div class="timeline-offers">
             ${TIMELINE_OFFER_ORDER.map((id) => {
               const ev = TIMELINE_EVENTS.find((e) => e.id === id);
               const used = Lab.env.drills.timeline.includes(id);
               return `<button type="button" data-act="timeline" data-event="${id}" ${used ? 'disabled' : ''} data-fk="tl-${id}">${UI.esc(ev.label)}</button>`;
             }).join('')}
           </div>
           <div class="timeline-built">
             ${UI.micro('Your timeline', 'mb-2 bright')}
             <ol>
               ${Lab.env.drills.timeline
                 .map((id, i) => {
                   const ev = TIMELINE_EVENTS.find((e) => e.id === id);
                   return `<li>${i + 1}. ${UI.esc(ev.label)}</li>`;
                 })
                 .join('')}
               ${Lab.env.drills.timeline.length === 0 ? '<li class="tl-empty">(empty — click events above in order)</li>' : ''}
             </ol>
           </div>
           <button type="button" class="btn-reset-order" data-act="timeline-reset" data-fk="tl-reset">${UI.icon('rotate-ccw')} Reset order</button>`)}`
      );
    }

    /* dashboard (always) */
    const bars = SIEM_DASH_BARS.map((v, i) => {
      const cls = i === 20 ? 'spike-red' : i === 21 ? 'spike-orange' : 'base';
      return `<div class="bar-col"><div class="bar ${cls}" style="height:${(v / 22) * 100}%"></div></div>`;
    }).join('');
    const dashboard = UI.panel(
      {},
      `${UI.panelHeader('24h alert volume · mini dashboard', UI.micro('aggregation view'))}
       ${UI.panelBody(`
         <div class="dash-chart" aria-hidden="true">${bars}</div>
         <div class="dash-axis"><span>00:00</span><span>12:00</span><span>23:00</span></div>
         <p class="dash-caption">${UI.esc(SIEM_DASH_CAPTION)}</p>
         <div class="kv-box mt-3">
           ${UI.micro('Data sources feeding this SIEM', 'mb-2 bright')}
           <p class="mono-xs">${UI.esc(SIEM_DASH_SOURCES)}</p>
         </div>`)}`
    );

    return `<div class="siem-grid-2">${capability}${tuning}${timeline}${dashboard}</div>`;
  }

  function renderSiem() {
    const tabs = [
      ['alerts', 'Alert queue (6)'],
      ['streams', 'Event streams'],
      ['tools', 'Rule tuning & drills'],
    ]
      .map(
        ([v, label]) => `<button type="button" class="view-tab ${siemView === v ? 'active' : ''}" role="tab" aria-selected="${siemView === v}" data-act="siem-view" data-view="${v}">${label}</button>`
      )
      .join('');
    const view = siemView === 'alerts' ? `<div class="siem-grid-alerts">${alertQueuePanel()}${siemDetailHTML()}</div>` : siemView === 'streams' ? siemStreamsHTML() : siemToolsHTML();
    return `<div class="stack">
      <div class="view-tabs" role="tablist" aria-label="SIEM views">${tabs}</div>
      ${view}
    </div>`;
  }

  function alertQueuePanel() {
    return UI.panel(
      { ariaLabel: 'SIEM alert queue' },
      `${UI.panelHeader('SIREN-SIEM · overnight queue', UI.micro('Nov 17–18 · 02:00–03:30'))}
       <ul class="queue-list">${SIEM_ALERTS.map(siemAlertRow).join('')}</ul>`
    );
  }

  /* ---------- NOTES ---------- */
  function renderNotes() {
    const detOps = DETECTION_OPS.map(
      (d) => `<div class="note-card"><h3>${UI.esc(d.source)}</h3><p>${UI.esc(d.logic)}</p></div>`
    ).join('');
    const mitigations = MITIGATIONS.map(
      (m) => `
      <li class="note-card">
        <p style="color:var(--text-body);">${UI.esc(m.label)}</p>
        <a href="${UI.esc(m.url)}" target="_blank" rel="noopener noreferrer" class="mit-link">${UI.icon('book-marked')} ${UI.esc(m.ref)} ${UI.icon('external-link')}</a>
      </li>`
    ).join('');

    const residual =
      Lab.mode === 'hard'
        ? UI.panel(
            {},
            `${UI.panelHeader('Residual risk check — containment is not a happy ending', UI.objTag('OBJ-H8'))}
             ${UI.panelBody(`
               <p class="drills-note mb-3">The C2 channel is cut and the binary is quarantined. Which statement correctly explains why the
               signature engine alone missed this threat — and names the risk that remains?</p>
               <div class="gap-b">
                 ${RESIDUAL_OPTIONS.map(
                   (o) => `<button type="button" class="tuning-btn ${Lab.env.siem.residualChoice === o.id ? 'selected' : ''}" data-act="residual" data-opt="${o.id}" aria-pressed="${Lab.env.siem.residualChoice === o.id}" data-fk="residual-${o.id}">
                     <span class="rule-label" style="font-family:var(--font-sans);font-weight:400;">${UI.esc(o.label)}</span>
                   </button>`
                 ).join('')}
               </div>`)}`
          )
        : '';

    const blue = BLUE_TEAM.map((t) => `<li class="blue">${UI.icon('shield-half')}<span>${UI.esc(t)}</span></li>`).join('');
    const red = RED_TEAM.map((t) => `<li class="red">${UI.icon('swords')}<span>${UI.esc(t)}</span></li>`).join('');
    const links = NOTES_LINKS.map(
      (l) => `<li><a class="link-item" href="${UI.esc(l.url)}" target="_blank" rel="noopener noreferrer">${UI.icon('external-link')} ${UI.esc(l.label)}</a></li>`
    ).join('');

    return `
      <div class="stack">
        ${UI.synthBanner()}
        ${UI.panel({}, `${UI.panelHeader('Field notes · detection opportunities', UI.micro('data source → detection logic'))}<div class="notes-grid">${detOps}</div>`)}
        ${UI.panel({}, `${UI.panelHeader('Mitigation recommendations', UI.micro('official IDs verified'))}<ul class="notes-grid" style="list-style:none;">${mitigations}</ul>`)}
        ${residual}
        <div class="two-col">
          ${UI.panel({}, `${UI.panelHeader('Blue-team takeaways')}<ul class="takeaway-list">${blue}</ul>`)}
          ${UI.panel({}, `${UI.panelHeader('Red-team mindset — know the adversary')}<ul class="takeaway-list">${red}</ul>`)}
        </div>
        ${UI.panel({}, `${UI.panelHeader('Official references', UI.micro('all links open in a new tab'))}<ul class="links-grid">${links}</ul>`)}
      </div>`;
  }

  /* ═══════════════════════════════ STAGE ══════════════════════════════════ */

  const INSTRUMENTS = {
    primer: { render: renderPrimer },
    edr: { render: renderEdr },
    shell: { render: renderShell, post: updateShell, update: updateShell },
    whois: { render: renderWhois },
    blocklist: { render: renderBlocklist },
    siem: { render: renderSiem },
    notes: { render: renderNotes },
    quiz: { render: () => Quiz.render() },
  };

  function renderStage(animate = true) {
    const stage = document.getElementById('instrument-stage');
    if (!stage) return;
    const inst = INSTRUMENTS[Lab.instrument] ?? INSTRUMENTS.primer;
    UI.rerenderWithFocus(stage, () => {
      stage.innerHTML = `<div class="${animate ? 'stage-enter' : ''}">${inst.render()}</div>`;
    });
    inst.post?.();
  }

  function updateStage() {
    const stage = document.getElementById('instrument-stage');
    if (!stage) return;
    const inst = INSTRUMENTS[Lab.instrument] ?? INSTRUMENTS.primer;
    if (inst.update) {
      inst.update();
    } else {
      UI.rerenderWithFocus(stage, () => {
        stage.firstElementChild.innerHTML = inst.render();
      });
    }
  }

  function renderRails() {
    const bench = document.getElementById('bench-region');
    if (!bench) return;
    UI.rerenderWithFocus(bench, () => {
      bench.innerHTML = `
        ${railHTML(false)}
        ${railHTML(true)}
        <main id="instrument-stage" class="stage" aria-label="Instrument stage"></main>
        <div class="casefile-col">${casefileHTML()}</div>`;
    });
  }

  /* ═══════════════════════════ ACTIVE-PHASE SHELL ═════════════════════════ */

  function activeHTML() {
    return `
      <a href="#instrument-stage" class="skip-link">Skip to instrument stage</a>
      <div id="header-region"></div>
      <div class="bench" id="bench-region"></div>`;
  }

  function renderActive() {
    const app = document.getElementById('app');
    app.innerHTML = activeHTML();
    document.getElementById('header-region').innerHTML = headerHTML();
    renderRails();
    renderStage(false);
  }

  /* ═══════════════════════════════ MODALS ═════════════════════════════════ */

  function openResetDialog() {
    UI.openModal({
      role: 'alertdialog',
      cls: 'narrow',
      labelledId: 'reset-title',
      closeOnOverlay: false,
      build(modalEl) {
        modalEl.innerHTML = `
          <h2 class="modal-title" id="reset-title" style="letter-spacing:0.05em;">RESET LAB?</h2>
          <p class="modal-desc">This wipes all progress — objectives, environment state, quiz results and saved
          history — and returns the bench to its pristine state. This cannot be undone.</p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" data-reset-cancel>Keep my shift</button>
            <button type="button" class="btn btn-darkred" style="min-height:44px;padding:0 16px;" data-reset-confirm>Reset everything</button>
          </div>`;
        modalEl.querySelector('[data-reset-cancel]').addEventListener('click', () => UI.closeModal());
        modalEl.querySelector('[data-reset-confirm]').addEventListener('click', () => {
          UI.closeModal();
          Actions.resetLab();
        });
      },
    });
  }

  function renderCompletionModal() {
    if (!(Lab.showCompletion && Lab.mode)) return;
    const stats = computeStats(Lab.objectives, Lab.mode);
    const set = Lab.mode === 'hard' ? HARD_QUIZ : MEDIUM_QUIZ;
    const quizScore = set.filter((q) => Lab.quizAnswers[q.id] === q.answer).length;
    const quizPct = Math.round((quizScore / set.length) * 100);
    const objPct = Math.round((stats.passed / stats.total) * 100);
    const defs = OBJECTIVES.filter((o) => o.mode === Lab.mode);

    /* focus areas derived from actual performance evidence (R8) */
    const missedQuiz = set.filter((q) => Lab.quizAnswers[q.id] !== undefined && Lab.quizAnswers[q.id] !== q.answer);
    const supported = defs.filter(
      (d) => (Lab.objectives[d.id]?.hintsUsed ?? 0) > 0 || (d.kind === 'answer' && (Lab.objectives[d.id]?.attempts ?? 0) > 1)
    );
    const focusAreas = [
      ...missedQuiz.map((q) => QUIZ_TOPICS[q.id]).filter(Boolean),
      ...supported.map((d) => `${d.anchor.split('—')[0].trim()} — objective ${d.id} needed hints or retries`),
    ];
    const focus = [...new Set(focusAreas)];

    const stars = [1, 2, 3]
      .map((s) => `<svg class="icon ${s <= stats.stars ? 'star-on' : 'star-off'}" aria-hidden="true"><use href="#i-star"></use></svg>`)
      .join('');
    const verdict =
      stats.stars === 3
        ? 'Flawless watch — first-attempt accuracy, no crutches'
        : stats.stars === 2
          ? 'Solid watch — mastery with a few retraces'
          : 'Watch closed — re-run the missed calls to sharpen';

    const pillarRows = ['P1', 'P2', 'P3', 'P4']
      .map((p) => {
        const group = defs.filter((d) => d.pillar === p);
        return `<div class="recap-row">${UI.pillarBadge(p)}${group
          .map((d) => `<span class="passed-chip">${UI.icon('check-circle-2')} ${d.id}</span>`)
          .join('')}</div>`;
      })
      .join('');

    const focusHTML =
      focus.length > 0
        ? `<ul class="focus-list">${focus.map((f) => `<li><span class="arrow" aria-hidden="true">▸</span>${UI.esc(f)}</li>`).join('')}</ul>`
        : `<p class="focus-clean">None flagged — every objective fell on the first attempt with no hints, and the knowledge check was
          clean. Push deeper: re-run the other difficulty mode on this same bench.</p>`;

    const nextItems = NEXT_STEPS.map((n) =>
      n.url
        ? `<li><a class="next-item" href="${UI.esc(n.url)}" target="_blank" rel="noopener noreferrer">${UI.icon('external-link')} ${UI.esc(n.label)}</a></li>`
        : `<li><div class="next-item" style="color:var(--text-dim);">${UI.esc(n.label)}</div></li>`
    ).join('');

    UI.openModal({
      role: 'dialog',
      cls: '',
      labelledId: 'completion-title',
      closeOnOverlay: true,
      onClose: () => {
        if (Lab.showCompletion) Actions.markCompletionSeen();
      },
      build(modalEl) {
        modalEl.innerHTML = `
          <button type="button" class="modal-close-x" aria-label="Close" data-completion-close>${UI.icon('x-circle')}</button>
          <h2 class="modal-title" id="completion-title">SHIFT COMPLETE · CASE CS-2024-0417</h2>
          <p class="modal-desc">Every objective passed and the knowledge check submitted — the watch is closed. Here is your debrief.</p>
          <div class="modal-body">
            <div class="stars-box">
              <div class="stars-row" role="img" aria-label="${stats.stars} of 3 stars">${stars}</div>
              <p class="stars-verdict">${UI.esc(verdict)}</p>
              <div class="stat-grid">
                <div class="stat-cell"><div class="num">${objPct}%</div>${UI.micro('objectives')}</div>
                <div class="stat-cell"><div class="num">${quizPct}%</div>${UI.micro('knowledge check')}</div>
                <div class="stat-cell"><div class="num">${stats.hintCount}</div>${UI.micro('hints used')}</div>
              </div>
            </div>
            <div>
              ${UI.micro('Objective recap · by mastery pillar', 'mb-2')}
              <div class="gap-b" style="gap:8px;">${pillarRows}</div>
            </div>
            <div>
              ${UI.micro('Focus areas — where to sharpen next', 'mb-2')}
              ${focusHTML}
              <p class="focus-derived">Derived from your run: missed knowledge-check topics and any objective that needed hints or retries.</p>
            </div>
            <div class="rubric-box">
              ${UI.micro('You can now…', 'mb-2')}
              <ul>${MASTERY_RUBRIC.map((r) => `<li>${UI.esc(r)}</li>`).join('')}</ul>
            </div>
            <div>
              ${UI.micro('What to learn next', 'mb-2')}
              <ul class="next-list">${nextItems}</ul>
            </div>
            <button type="button" class="btn-close-modal" data-completion-close>Keep exploring the bench</button>
          </div>`;
        modalEl.querySelectorAll('[data-completion-close]').forEach((b) => b.addEventListener('click', () => UI.closeModal()));
      },
    });
  }

  function clearCompletionModal() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  }

  /* ═══════════════════════════════ ROUTER ═════════════════════════════════ */

  function renderRoute() {
    UI.clearModals();
    const app = document.getElementById('app');
    if (Lab.phase === 'mode-select' || !Lab.mode) {
      document.body.classList.remove('in-active');
      app.innerHTML = modeSelectHTML();
    } else if (Lab.phase === 'briefing') {
      document.body.classList.remove('in-active');
      app.innerHTML = briefingHTML();
    } else {
      document.body.classList.add('in-active');
      renderActive();
    }
  }

  /* ═════════════════════════════ INTERACTIONS ═════════════════════════════ */

  function checkObjective(objId) {
    const res = Actions.checkAnswerObjective(objId);
    cardLocal[objId] = { ...(cardLocal[objId] ?? {}), feedback: res };
    refreshRailAndHeader();
  }

  function refreshRailAndHeader() {
    const bench = document.getElementById('bench-region');
    if (bench) {
      /* re-render rails + case file while preserving the stage */
      const stage = document.getElementById('instrument-stage');
      const stageHTML = stage ? stage.innerHTML : '';
      UI.rerenderWithFocus(bench, () => {
        bench.innerHTML = `
          ${railHTML(false)}
          ${railHTML(true)}
          <main id="instrument-stage" class="stage" aria-label="Instrument stage">${stageHTML}</main>
          <div class="casefile-col">${casefileHTML()}</div>`;
      });
    }
    const header = document.getElementById('header-region');
    if (header) header.innerHTML = headerHTML();
    /* some instrument rendering depends on objective state (e.g. the EDR
       E-701 detection-type mask lifts once M3 passes) — refresh it too */
    updateStage();
  }

  function onClick(e) {
    /* quiz has its own delegation namespace */
    if (Quiz.onClick(e)) return;

    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.getAttribute('data-act');

    switch (act) {
      case 'mode':
        Actions.setMode(el.getAttribute('data-mode'));
        break;
      case 'phase':
        Actions.setPhase(el.getAttribute('data-phase'));
        break;
      case 'instrument':
        Actions.setInstrument(el.getAttribute('data-instrument'));
        caseOpen = false;
        break;
      case 'jump':
        Actions.setInstrument(el.getAttribute('data-instrument'));
        break;
      case 'toggle-case':
        caseOpen = !caseOpen;
        refreshRailAndHeader();
        break;
      case 'open-reset':
        openResetDialog();
        break;
      case 'header-complete':
        if (Lab.quizSubmitted) Actions.openCompletion();
        else Actions.setInstrument('quiz');
        break;
      case 'check-obj':
        checkObjective(el.getAttribute('data-obj'));
        break;
      case 'hint': {
        const objId = el.getAttribute('data-obj');
        const def = OBJECTIVES.find((o) => o.id === objId);
        const tierCount = hintTiersFor(def);
        const open = (cardLocal[objId]?.hintsOpen ?? 0);
        if (open < tierCount) {
          Actions.spendHint(objId, tierCount);
          cardLocal[objId] = { ...(cardLocal[objId] ?? {}), hintsOpen: open + 1 };
        } else {
          cardLocal[objId] = { ...(cardLocal[objId] ?? {}), hintsOpen: 0 };
        }
        refreshRailAndHeader();
        break;
      }
      case 'nudge': {
        const objId = el.getAttribute('data-obj');
        if ((Lab.objectives[objId]?.hintsUsed ?? 0) === 0) {
          Actions.spendHint(objId, 1);
          refreshRailAndHeader();
        }
        break;
      }
      case 'restart-seq':
        Actions.restartSequence();
        break;
      case 'gloss': {
        const term = el.getAttribute('data-term');
        glossOpen = glossOpen === term ? null : term;
        updateStage();
        break;
      }
      /* EDR */
      case 'edr-alert':
        Actions.edrSelectAlert(el.getAttribute('data-alert'));
        break;
      case 'classify':
        Actions.edrClassify(el.getAttribute('data-type'));
        break;
      case 'edr-isolate':
        Actions.edrIsolate(!Lab.env.edr.isolated);
        break;
      case 'edr-quarantine':
        Actions.edrQuarantine(!Lab.env.edr.quarantined);
        break;
      /* WHOIS */
      case 'whois-chip': {
        const d = el.getAttribute('data-domain');
        whoisInput = d;
        Actions.whoisLookup(d.toLowerCase());
        break;
      }
      /* Blocklist */
      case 'blocklist-chip': {
        const v = el.getAttribute('data-value');
        blocklistInput = v;
        Actions.blocklistLookup(classifyLookup(v), v.toLowerCase());
        break;
      }
      case 'block-ip':
        Actions.blocklistBlockIp('185.199.72.44');
        break;
      case 'confirm-hash':
        Actions.blocklistConfirmHash();
        break;
      case 'verdict':
        Actions.setDrill('blockVerdict', 'v', el.getAttribute('data-verdict'));
        break;
      /* SIEM */
      case 'siem-view':
        siemView = el.getAttribute('data-view');
        updateStage();
        break;
      case 'siem-stream':
        siemStream = el.getAttribute('data-stream');
        updateStage();
        break;
      case 'siem-alert':
        Actions.siemSelectAlert(el.getAttribute('data-alert'));
        break;
      case 'siem-dispose':
        Actions.siemDispose(el.getAttribute('data-alert'), el.getAttribute('data-kind'));
        break;
      case 'siem-reopen':
        Actions.siemReopen(el.getAttribute('data-alert'));
        break;
      case 'corr':
        Actions.siemToggleCorrelation(el.getAttribute('data-event'));
        break;
      case 'cause':
        Actions.siemSetCause(el.getAttribute('data-cause'));
        break;
      case 'tuning':
        Actions.siemSetTuning(el.getAttribute('data-rule'));
        break;
      case 'residual':
        Actions.siemSetResidual(el.getAttribute('data-opt'));
        break;
      case 'timeline':
        Actions.timelinePush(el.getAttribute('data-event'));
        break;
      case 'timeline-reset':
        Actions.timelineReset();
        break;
      /* Terminal */
      case 'term-cmd': {
        const cmd = el.getAttribute('data-cmd');
        Actions.termRun(cmd);
        termHistIdx = null;
        document.getElementById('term-input')?.focus();
        break;
      }
      case 'term-clear':
        Actions.termClear();
        break;
      default:
        break;
    }
  }

  function onSubmit(e) {
    const form = e.target;
    if (form.id === 'term-form') {
      e.preventDefault();
      const input = document.getElementById('term-input');
      const value = (input?.value ?? '').trim();
      if (!value) return;
      Actions.termRun(value);
      termHistIdx = null;
      if (input) input.value = '';
    } else if (form.id === 'whois-form') {
      e.preventDefault();
      const v = (document.getElementById('whois-input')?.value ?? '').trim();
      if (!v) return;
      whoisInput = v;
      Actions.whoisLookup(v.toLowerCase());
    } else if (form.id === 'blocklist-form') {
      e.preventDefault();
      const v = (document.getElementById('blocklist-input')?.value ?? '').trim();
      if (!v) return;
      blocklistInput = v;
      Actions.blocklistLookup(classifyLookup(v), v.toLowerCase());
    }
  }

  function onInput(e) {
    const t = e.target;
    if (t.matches?.('[data-obj-input]')) {
      const [objId, fieldId] = t.getAttribute('data-obj-input').split('.');
      Actions.setAnswer(objId, fieldId, t.value);
      return;
    }
    if (t.id === 'siem-filter') {
      siemFilter = t.value;
      const table = document.getElementById('siem-stream-table');
      if (table) table.innerHTML = siemStreamRowsHTML();
      return;
    }
    if (t.id === 'whois-input') whoisInput = t.value;
    if (t.id === 'blocklist-input') blocklistInput = t.value;
  }

  function onChange(e) {
    const t = e.target;
    if (t.matches?.('[data-drill]')) {
      Actions.setDrill(t.getAttribute('data-drill'), t.getAttribute('data-slot'), t.value);
    }
  }

  function onKeyDown(e) {
    const t = e.target;
    if (t.id === 'term-input') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const history = Lab.env.terminal.lines.filter((l) => l.startsWith('$ ')).map((l) => l.slice(2));
        if (!history.length) return;
        e.preventDefault();
        if (e.key === 'ArrowUp') {
          const next = termHistIdx === null ? history.length - 1 : Math.max(0, termHistIdx - 1);
          termHistIdx = next;
          t.value = history[next] ?? '';
        } else if (termHistIdx !== null) {
          const next = Math.min(history.length - 1, termHistIdx + 1);
          termHistIdx = next;
          t.value = history[next] ?? '';
        }
      }
      return;
    }
    if (t.matches?.('[data-obj-input]') && e.key === 'Enter') {
      e.preventDefault();
      const [objId] = t.getAttribute('data-obj-input').split('.');
      checkObjective(objId);
    }
  }

  /* ═══════════════════════════ SUBSCRIPTIONS / BOOT ═══════════════════════ */

  function onStateChange(scope) {
    if (scope === 'route') {
      renderRoute();
      return;
    }
    if (Lab.phase !== 'active') return;
    switch (scope) {
      case 'instrument':
        renderRails(); /* rebuilds rails + a fresh empty stage first */
        renderStage();
        break;
      case 'env':
        updateStage();
        break;
      case 'objectives':
        refreshRailAndHeader();
        break;
      case 'quiz':
        if (Lab.instrument === 'quiz') {
          const stage = document.getElementById('instrument-stage');
          if (stage) UI.rerenderWithFocus(stage, () => { stage.firstElementChild.innerHTML = Quiz.render(); });
        }
        {
          const header = document.getElementById('header-region');
          if (header) header.innerHTML = headerHTML();
        }
        break;
      case 'completion':
        if (Lab.showCompletion) renderCompletionModal();
        else clearCompletionModal();
        break;
      default:
        break;
    }
  }

  function boot() {
    hydrate();
    renderRoute();

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeyDown);

    subscribe(onStateChange);
  }

  boot();

  return {};
})();
