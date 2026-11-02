// CyberLab 12.1 — application shell (static port of CyberLab.tsx, ControlStrip,
// ModeSelect, Briefing, Workbench, Ledger, Quiz, Debrief, CompletionModal, Manual)
// Rendering is full-app from state; events are delegated through data-action.
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';
  const { ui, ICONS } = CL;
  const { esc, SectionLabel, Bezel, PillarBadge, FeedbackBlock, CheckButton, HintBlock, TrainingChip, Stars, RadioList, Sel, renderWithGlossary, LED } = ui;
  const D = CL.DATA;
  const store = CL.store;
  const A = () => CL.actions;
  const DEBUG_ORDER = ['idle', 'attached', 'breakpoint', 'running', 'hit', 'stepped', 'revealed'];

  // ---- bench-local view state (mirrors Workbench useState; resets on remount) ----
  let activeInst = 'target';
  let ledgerOpenId = null;
  let sheet = null; // 'ledger' | 'manual' | null (mobile slide-overs)
  let manualOpen = false; // desktop slide-over
  let resetDialog = false;

  const INSTRUMENT_LABEL = {
    target: 'Target browser', sast: 'SAST unit', dast: 'DAST unit', fuzz: 'Fuzzer',
    debug: 'Debugger', config: 'Config probe', triage: 'Triage board', toolrack: 'Tool rack',
  };

  // Silent side-effects that mirror the instruments' mount effects (visit/markTab).
  function syncMountEffects() {
    const s = store.state;
    if (s.phase === 'bench' && s.mode) {
      if (!s.visitedInstruments.includes(activeInst)) {
        store.setSilent({ visitedInstruments: [...s.visitedInstruments, activeInst] });
      }
      if (activeInst === 'config' && !s.configTabsSeen.includes('headers')) {
        store.setSilent({ configTabsSeen: [...s.configTabsSeen, 'headers'] });
      }
    }
  }

  // ================================================================ CHROME
  function ControlStrip() {
    const lab = store.state;
    const mode = lab.mode;
    if (!mode) return '';
    const progress = CL.progressOf(lab);
    const score = CL.scoreOf(lab);
    const gate = CL.allObjectivesDone(lab);
    const STEPS = [
      { id: 'briefing', label: 'Briefing' },
      { id: 'bench', label: 'Bench' },
      { id: 'quiz', label: 'Check' },
      { id: 'debrief', label: 'Debrief' },
    ];
    const canGo = (id) => {
      if (id === 'briefing') return true;
      if (id === 'bench') return lab.briefingSeen;
      if (id === 'quiz') return gate;
      if (id === 'debrief') return lab.quizSubmitted;
      return false;
    };
    return `
      <header class="control-strip">
        <div class="control-inner">
          <div class="row-flex gap-2">
            <span class="bench-logo" aria-hidden="true">${ICONS.Power('h-3.5 w-3.5')}</span>
            <span class="bench-name">BENCH-01</span>
            <span class="mode-badge ${mode === 'medium' ? 'mode-medium' : 'mode-hard'}">${mode === 'medium' ? 'Training shift' : 'Redline audit'}</span>
          </div>
          <nav aria-label="Bench phases" class="row-flex gap-1 stepper">
            ${STEPS.map((s, i) => {
              const allowed = canGo(s.id);
              const isCurrent = lab.phase === s.id;
              return `<span class="row-flex gap-1">
                <button type="button" ${allowed ? '' : 'disabled'} data-action="goto" data-phase="${s.id}"
                  aria-current="${isCurrent ? 'step' : 'false'}"
                  class="step-btn${isCurrent ? ' step-current' : allowed ? '' : ' step-locked'}">${s.label}</button>
                ${i < STEPS.length - 1 ? '<span class="step-dot" aria-hidden="true">·</span>' : ''}
              </span>`;
            }).join('')}
          </nav>
          <div class="row-flex gap-3 ml-auto">
            <button type="button" class="btn btn-outline btn-manual" data-action="open-manual">${ICONS.BookOpen('h-4 w-4')} Field manual</button>
            <div class="progress-text hidden-sm" aria-live="polite">
              <div class="micro-label">objectives</div>
              <div class="progress-num">${progress.done}/${progress.total} · score ${score.score}%</div>
            </div>
            <svg width="38" height="38" viewBox="0 0 38 38" role="img" aria-label="Objectives progress: ${progress.pct}%">
              <circle cx="19" cy="19" r="15" fill="none" stroke="var(--ring-track)" stroke-width="4"></circle>
              <circle cx="19" cy="19" r="15" fill="none" stroke="var(--amber-400)" stroke-width="4"
                stroke-dasharray="${(progress.pct / 100) * 94.2} 94.2" stroke-linecap="round" transform="rotate(-90 19 19)"></circle>
              <text x="19" y="22.5" text-anchor="middle" class="ring-num">${progress.pct}</text>
            </svg>
            <button type="button" class="btn btn-outline btn-reset" data-action="open-reset" aria-label="Reset lab">
              ${ICONS.RotateCcw('h-3.5 w-3.5')} Reset
            </button>
          </div>
        </div>
        ${!gate && lab.phase !== 'briefing' ? `
          <div class="control-inner">
            <p class="gate-note">knowledge check unlocks when all ${progress.total} objectives are complete — ${progress.total - progress.done} remaining</p>
          </div>` : ''}
      </header>`;
  }

  // ================================================================ MODE SELECT
  function ModeSelect() {
    const MODES = [
      {
        id: 'medium',
        icon: 'GraduationCap',
        name: 'MEDIUM — Training Shift',
        tag: 'Understand & learn',
        accent: 'mode-card-medium',
        bullets: [
          '12 guided objectives, introduced in order',
          'Tiered hints (nudge → direction → demo) — hints cost stars, never progress',
          'Forgiving retries: adjust and re-check as often as you need',
          'Knowledge check after practice, with an explanation on every answer',
        ],
        cta: 'Start the training shift',
      },
      {
        id: 'hard',
        icon: 'Flame',
        name: 'HARD — Redline Audit',
        tag: 'Test & stretch',
        accent: 'mode-card-hard',
        bullets: [
          '9 broad, multi-step challenges across noisy evidence',
          'Red herrings and out-of-scope alerts mixed into the queue',
          'Strict validation: exact values, exact mappings — near-misses rejected with rationale',
          'One optional nudge, and it visibly costs score',
        ],
        cta: 'Start the redline audit',
      },
    ];
    return `
      <div class="mode-select">
        <div class="mode-head fade-in">
          <div class="eyebrow">CyberLab · BENCH-01</div>
          <h1 class="mode-title">Analyzing Web Vulnerabilities</h1>
          <p class="mode-sub">CompTIA CySA+ CS0-003 · Lesson 12.1. One bench, eight instruments, one staging target:
            static analysis, dynamic scanning, fuzzing, debugging, configuration review and triage —
            the full arc from “I read about this” to “I can prove it and fix it”.</p>
          <div class="row-flex center mt-4">${TrainingChip()}</div>
        </div>
        <div class="mode-grid">
          ${MODES.map((m, i) => `
            <button type="button" class="mode-card ${m.accent} fade-in" style="animation-delay:${0.08 * (i + 1)}s"
              data-action="start" data-mode="${m.id}" aria-label="${esc(m.cta)}: ${esc(m.name)}">
              <div class="row-flex gap-3">
                ${ICONS[m.icon]('h-6 w-6 mode-icon')}
                <div>
                  <div class="mode-name">${esc(m.name)}</div>
                  <div class="mode-tag">${esc(m.tag)}</div>
                </div>
              </div>
              <ul class="mode-bullets">
                ${m.bullets.map((b) => `<li><span class="bullet-dot" aria-hidden="true"></span>${esc(b)}</li>`).join('')}
              </ul>
              <div class="mode-foot">
                <span class="autosave-note">${ICONS.Save('h-3.5 w-3.5')} progress autosaves</span>
                <span class="mode-cta">${esc(m.cta)} ${ICONS.ArrowRight('h-4 w-4')}</span>
              </div>
            </button>`).join('')}
        </div>
        <p class="mode-disclaimer">DEFENSIVE TRAINING ONLY — every target, credential and log on this bench is synthetic.
          Techniques are taught at the depth CompTIA and OWASP document them for defenders.</p>
      </div>`;
  }

  // ================================================================ BRIEFING
  function Briefing() {
    const mode = store.state.mode;
    return `
      <div class="briefing">
        <div class="fade-in">
          ${SectionLabel('Scenario briefing · case MLR-2417 · ' + (mode === 'hard' ? 'Redline Audit' : 'Training Shift'))}
          <h1 class="briefing-title">Ten days to launch. The pen test is booked for <span class="text-amber">after</span> launch.</h1>
          <div class="briefing-body">
            ${D.BRIEFING.lines.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <div class="panel-elevated mt-6">
            ${SectionLabel('Your mission on the bench', 'mb-3')}
            <ul class="stack">
              ${D.BRIEFING.objectives.map((o) => `<li class="row-flex mission-item">${ICONS.CheckCircle2('h-4 w-4 mission-check')} ${esc(o)}</li>`).join('')}
            </ul>
          </div>
          <div class="grid-2 mt-4">
            <div class="panel-elevated">
              <div class="mono-label row-flex gap-2">${ICONS.Target('h-4 w-4 text-amber')} Assigned target</div>
              <div class="mono-dim mt-2 target-meta">
                ${esc(D.TARGET.app)} ${esc(D.TARGET.version)}<br />
                ${esc(D.TARGET.host)} — ${esc(D.TARGET.ip)}<br />
                binary: ${esc(D.TARGET.binary)}
              </div>
            </div>
            <div class="panel-amber-soft">
              <div class="mono-label text-amber row-flex gap-2">${ICONS.FileWarning('h-4 w-4')} Authorization</div>
              <p class="text-xs mt-2 amber-text">${esc(D.TRAINING_NOTICE)}</p>
            </div>
          </div>
          <div class="row-flex end mt-8">
            <button type="button" class="btn btn-primary btn-lg" data-action="briefing-proceed">
              Power on the bench ${ICONS.ArrowRight('h-4 w-4')}
            </button>
          </div>
        </div>
      </div>`;
  }

  // ================================================================ LEDGER
  function Ledger() {
    const lab = store.state;
    const mode = lab.mode;
    if (!mode) return '';
    const objs = CL.objectivesFor(mode);
    const done = objs.filter((o) => lab.completed[o.id]).length;
    const allDone = done === objs.length;
    return `
      <div class="ledger">
        <div class="ledger-head">
          <div class="row-between">
            ${SectionLabel('Mission ledger')}
            <span class="ledger-count" aria-live="polite">${done}/${objs.length} objectives</span>
          </div>
          <div class="pillar-bars" aria-hidden="true">
            ${['P1', 'P2', 'P3', 'P4'].map((p) => {
              const list = objs.filter((o) => o.pillar === p);
              const d = list.filter((o) => lab.completed[o.id]).length;
              const pct = list.length ? (d / list.length) * 100 : 0;
              return `<div class="pillar-bar" title="${esc(CL.PILLAR_META[p].label)}: ${d}/${list.length}">
                <div class="pillar-track"><div class="pillar-fill fill-${p}" style="width:${pct}%"></div></div>
                <div class="pillar-tag">${p}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="ledger-list">
          <ul class="ledger-rows">
            ${objs.map((o) => {
              const isOpen = ledgerOpenId === o.id;
              const complete = !!lab.completed[o.id];
              return `
                <li>
                  <button type="button" data-action="ledger-toggle" data-obj="${o.id}" aria-expanded="${isOpen}" class="ledger-row">
                    ${complete ? ICONS.CircleCheck('h-4 w-4 obj-done') : ICONS.CircleDashed('h-4 w-4 obj-todo')}
                    <span class="ledger-row-text">
                      <span class="ledger-title${complete ? ' obj-complete' : ''}">${esc(o.title)}</span>
                      <span class="ledger-sub">${o.id} · ${INSTRUMENT_LABEL[o.instrument]}</span>
                    </span>
                    ${PillarBadge(o.pillar)}
                    ${ICONS.ChevronDown('h-3.5 w-3.5 chev' + (isOpen ? ' chev-open' : ''))}
                  </button>
                  ${isOpen ? `
                    <div class="ledger-detail">
                      <p class="ledger-task">${esc(o.task)}</p>
                      <p class="ledger-anchor">maps to: ${esc(o.anchor)}</p>
                      ${mode === 'medium' ? HintBlock(o.id) : ''}
                      ${mode === 'hard' ? HintBlock(o.id, 1) : ''}
                      <div class="row-flex gap-2 mt-3">
                        ${CheckButton(o.id)}
                        <button type="button" class="btn btn-ghost btn-nav" data-action="ledger-nav" data-inst="${o.instrument}">
                          ${ICONS.FlaskConical('h-3.5 w-3.5')} open ${INSTRUMENT_LABEL[o.instrument]}
                        </button>
                      </div>
                      ${lab.lastResult[o.id] ? FeedbackBlock(lab.lastResult[o.id]) : ''}
                    </div>` : ''}
                </li>`;
            }).join('')}
          </ul>
        </div>
        ${allDone ? `
          <div class="ledger-done">
            <div class="row-flex gap-2 ledger-done-text">${ICONS.CircleCheck('h-4 w-4')} Bench cleared — every objective complete.</div>
            <button type="button" class="btn btn-success btn-block" data-action="goto" data-phase="quiz">
              Proceed to the knowledge check ${ICONS.ArrowRight('h-4 w-4')}
            </button>
          </div>` : ''}
      </div>`;
  }

  // ================================================================ WORKBENCH
  function Workbench() {
    const lab = store.state;
    const progress = CL.progressOf(lab);
    const meta = CL.INSTRUMENTS.find((i) => i.id === activeInst);
    return `
      <div class="workbench">
        <div class="bench-grid">
          <nav aria-label="Instrument rack" class="rail">
            ${CL.INSTRUMENTS.map((inst) => {
              const status = CL.instrumentStatus(lab, inst.id);
              const isActive = activeInst === inst.id;
              return `
                <button type="button" data-action="inst" data-inst="${inst.id}" aria-pressed="${isActive}"
                  class="rail-btn${isActive ? ' rail-active' : ''}">
                  ${ICONS[inst.icon]('h-4 w-4 rail-icon' + (isActive ? ' rail-icon-active' : ''))}
                  <span class="rail-label">${inst.label}</span>
                  <span class="rail-led">${LED(status, isActive)}</span>
                </button>`;
            }).join('')}
            <div class="rail-manual">${''}</div>
          </nav>
          <main aria-label="Instrument stage" class="stage-col">
            <div class="stage fade-fast" id="stage">
              <div class="stage-head hidden-sm">
                <h2 class="stage-title">${meta.label} unit</h2>
                <p class="stage-desc">${esc(meta.desc)}</p>
              </div>
              <div class="stage-frame">${CL.renderInstrument(activeInst)}</div>
            </div>
          </main>
          <aside aria-label="Mission ledger" class="ledger-col">
            ${Ledger()}
          </aside>
        </div>

        <div class="fab fab-right">
          <button type="button" class="btn btn-primary btn-fab" data-action="open-sheet" data-sheet="ledger"
            aria-label="Open objectives — ${progress.done}/${progress.total} complete">
            ${ICONS.ListChecks('h-4 w-4')} ${progress.done}/${progress.total}
          </button>
        </div>
        <div class="fab fab-left">
          <button type="button" class="btn btn-outline btn-manual" data-action="open-sheet" data-sheet="manual">${ICONS.BookOpen('h-4 w-4')} Manual</button>
        </div>

        <div class="ticker" role="status" aria-live="polite">
          <div class="ticker-inner">
            ${SectionLabel('BENCH-01', 'hidden-sm shrink-0')}
            <p class="ticker-text">${esc(lab.ticker)}</p>
          </div>
        </div>

        ${sheet === 'ledger' ? `
          <div class="overlay" data-action="close-sheet"></div>
          <div class="sheet sheet-bottom" role="dialog" aria-modal="true" aria-label="Mission ledger">
            <div class="sheet-head">
              <div class="sheet-title">Mission ledger</div>
              <button type="button" class="btn-close" data-action="close-sheet" aria-label="Close objectives">${ICONS.X('h-4 w-4')}</button>
            </div>
            <div class="sheet-body">${Ledger()}</div>
          </div>` : ''}
      </div>`;
  }

  // ================================================================ MANUAL
  function ManualContent() {
    return `
      <div class="manual">
        <div class="manual-head">
          <div class="sheet-title row-flex gap-2">${ICONS.BookOpen('h-4 w-4 text-amber')} Field manual — Lesson 12.1</div>
          <p class="manual-sub">The explainer behind every instrument on the bench. Reopen it any time.</p>
        </div>
        <div class="manual-body">
          ${D.MANUAL_SECTIONS.map((sec) => `
            <section aria-label="${esc(sec.title)}">
              <h3 class="manual-h3">${esc(sec.title)}</h3>
              <div class="stack">
                ${sec.body.map((p) => `<p class="manual-p">${renderWithGlossary(p)}</p>`).join('')}
              </div>
            </section>`).join('')}
          <section aria-label="Real-world cases">
            ${SectionLabel('Real-world cases (public, defensive reading)')}
            <div class="stack mt-2">
              ${D.REAL_CASES.map((c) => `
                <div class="panel-elevated">
                  <div class="text-xs font-semibold">${esc(c.title)}</div>
                  <p class="micro-note mt-1">${esc(c.text)}</p>
                </div>`).join('')}
            </div>
          </section>
          <section aria-label="Glossary">
            ${SectionLabel('Glossary — 16 terms')}
            <dl class="stack mt-2">
              ${D.GLOSSARY.map((g) => `
                <div class="gloss-entry"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('')}
            </dl>
          </section>
          <p class="manual-end">end of manual — close and return to the bench</p>
        </div>
      </div>`;
  }

  function ManualSheet() {
    return `
      <div class="overlay" data-action="close-manual"></div>
      <div class="sheet sheet-right" role="dialog" aria-modal="true" aria-label="Field manual">
        <button type="button" class="btn-close sheet-close" data-action="close-manual" aria-label="Close field manual">${ICONS.X('h-4 w-4')}</button>
        ${ManualContent()}
      </div>`;
  }

  // ================================================================ QUIZ
  function Quiz() {
    const lab = store.state;
    const mode = lab.mode;
    const items = CL.QUIZ[mode];
    if (lab.quizSubmitted) return QuizReview(items);
    const idx = Math.min(lab.quizIndex, items.length - 1);
    const q = items[idx];
    const lockedCount = items.filter((it) => lab.quizLocked[it.id]).length;
    const isLast = idx === items.length - 1;
    const currentLocked = !!lab.quizLocked[q.id];
    const chosen = lab.quizAnswers[q.id];
    return `
      <div class="quiz">
        ${SectionLabel('Knowledge check · ' + (mode === 'hard' ? 'analysis under pressure' : 'concepts with coaching'))}
        <h1 class="phase-title">${mode === 'hard' ? 'Seven calls to defend' : 'Six concepts to lock in'}</h1>
        <p class="phase-sub">${mode === 'hard'
          ? 'Scenario-based. Each one is a decision you will make in a real SOC. Pick an answer, press Check answer to commit — a committed answer is locked, and only then does the next item open.'
          : 'Pick an answer, press Check answer to commit — the explanation appears the moment you commit, and every question teaches. Committed answers are locked, so choose carefully.'}</p>
        <div class="quiz-progress" aria-label="Progress: ${lockedCount} of ${items.length} committed">
          ${items.map((it, i) => {
            const done = !!lab.quizLocked[it.id];
            const isCur = i === idx;
            return `<span class="qp-bar ${done ? 'qp-done' : isCur ? 'qp-cur' : ''}" aria-hidden="true"></span>`;
          }).join('')}
          <span class="qp-count" aria-live="polite">${lockedCount}/${items.length} committed</span>
        </div>
        <div class="mt-4">
          ${Bezel({
            title: 'Item ' + (idx + 1) + '/' + items.length,
            sub: currentLocked ? (chosen === q.correct ? 'committed — correct' : 'committed — missed') : 'awaiting your call',
            icon: currentLocked ? ICONS.Lock('h-3.5 w-3.5') : undefined,
            body: `
              <p class="quiz-prompt">${esc(q.prompt)}</p>
              <div class="stack mt-3" role="radiogroup" aria-label="${esc(q.prompt)}">
                ${q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  let cls = 'quiz-opt';
                  if (currentLocked && isChosen) cls += chosen === q.correct ? ' quiz-opt-right' : ' quiz-opt-wrong';
                  else if (isChosen && !currentLocked) cls += ' quiz-opt-chosen';
                  const badge = currentLocked && isChosen && chosen === q.correct
                    ? ICONS.CheckCircle2('h-4 w-4 icon-right')
                    : currentLocked && isChosen ? ICONS.XCircle('h-4 w-4 icon-wrong') : '<span class="opt-dot" aria-hidden="true"></span>';
                  return `<button type="button" role="radio" aria-checked="${isChosen}" ${currentLocked ? 'disabled' : ''}
                      class="${cls}" data-action="quiz-answer" data-qid="${q.id}" data-idx="${oi}">${badge}<span>${esc(opt)}</span></button>`;
                }).join('')}
              </div>
              ${currentLocked ? `
                <div class="quiz-explain ${chosen === q.correct ? 'explain-right' : 'explain-miss'}" role="note">${esc(q.explain)}</div>` : ''}
              <div class="row-between mt-4">
                <span class="micro-note">${currentLocked ? 'answer locked' : chosen === undefined ? 'select an answer to enable the check' : 'committed answers cannot be changed'}</span>
                ${!currentLocked
                  ? `<button type="button" class="btn btn-primary btn-lg" data-action="quiz-check" data-qid="${q.id}"${chosen === undefined ? ' disabled' : ''} aria-label="Check answer for item ${idx + 1}">Check answer</button>`
                  : isLast
                    ? `<button type="button" class="btn btn-success btn-lg" data-action="quiz-submit"${lockedCount !== items.length ? ' disabled' : ''} aria-label="Submit the knowledge check">Submit knowledge check ${ICONS.ArrowRight('h-4 w-4')}</button>`
                    : `<button type="button" class="btn btn-primary btn-lg" data-action="quiz-next" aria-label="Continue to item ${idx + 2}">Next question ${ICONS.ArrowRight('h-4 w-4')}</button>`}
              </div>`,
          })}
        </div>
      </div>`;
  }

  function QuizReview(items) {
    const lab = store.state;
    return `
      <div class="quiz">
        ${SectionLabel('Knowledge check · submitted')}
        <h1 class="phase-title">Score ${lab.quizScore}/${items.length} — answers locked</h1>
        <p class="phase-sub">The check has been submitted and every answer is sealed. Review the explanations below, then continue to the debrief.</p>
        <div class="stack-lg mt-6">
          ${items.map((q, qi) => {
            const chosen = lab.quizAnswers[q.id];
            const right = chosen === q.correct;
            return Bezel({
              title: 'Item ' + (qi + 1) + '/' + items.length,
              sub: right ? 'correct' : 'missed',
              icon: ICONS.Lock('h-3.5 w-3.5'),
              body: `
                <p class="quiz-prompt">${esc(q.prompt)}</p>
                <div class="stack mt-3" role="radiogroup" aria-label="${esc(q.prompt)}">
                  ${q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    let cls = 'quiz-opt quiz-opt-sealed';
                    if (isChosen) cls += right ? ' quiz-opt-right' : ' quiz-opt-wrong';
                    const badge = isChosen && right
                      ? ICONS.CheckCircle2('h-4 w-4 icon-right')
                      : isChosen ? ICONS.XCircle('h-4 w-4 icon-wrong') : '<span class="opt-dot opt-dot-dim" aria-hidden="true"></span>';
                    return `<div aria-current="${isChosen ? 'true' : 'false'}" class="${cls}">${badge}<span>${esc(opt)}</span></div>`;
                  }).join('')}
                </div>
                <div class="quiz-explain ${right ? 'explain-right' : 'explain-miss'}" role="note">${esc(q.explain)}</div>`,
            });
          }).join('')}
        </div>
        <div class="row-flex end mt-6">
          <button type="button" class="btn btn-primary btn-lg" data-action="goto" data-phase="debrief">Continue to the debrief ${ICONS.ArrowRight('h-4 w-4')}</button>
        </div>
      </div>`;
  }

  // ================================================================ DEBRIEF
  function Debrief() {
    const lab = store.state;
    const score = CL.scoreOf(lab);
    const sections = [
      { icon: 'Radar', title: 'Detection opportunities', items: D.DEBRIEF.detection },
      { icon: 'Wrench', title: 'Mitigation recommendations', items: D.DEBRIEF.mitigations },
      { icon: 'ShieldAlert', title: 'Blue-team takeaways', items: D.DEBRIEF.blue },
      { icon: 'Swords', title: 'Red-team mindset (defensive value)', items: D.DEBRIEF.red },
    ];
    return `
      <div class="debrief">
        ${SectionLabel('Debrief · field notes')}
        <h1 class="phase-title">What the bench taught you</h1>
        <p class="phase-sub">Objective score ${score.objPct}% · quiz ${score.quizPct}% · overall ${score.score}%. Before the
          completion card, walk the notes below — they are the version of this lesson you will want in six months.</p>
        <div class="grid-2 mt-6">
          ${sections.map((s) => `
            <section class="panel-elevated" aria-label="${esc(s.title)}">
              <h2 class="panel-h2">${ICONS[s.icon]('h-4 w-4')} ${esc(s.title)}</h2>
              <ul class="stack mt-3">
                ${s.items.map((it) => `<li class="row-flex bullet-li"><span class="bullet-dot" aria-hidden="true"></span>${esc(it)}</li>`).join('')}
              </ul>
            </section>`).join('')}
        </div>
        <section class="panel-elevated mt-4" aria-label="Official references">
          <h2 class="panel-h2">${ICONS.ExternalLink('h-4 w-4')} Official references (open in a new tab)</h2>
          <ul class="grid-2 mt-3">
            ${D.DEBRIEF.links.map((l) => `
              <li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="link-card">
                ${esc(l.label)} ${ICONS.ExternalLink('h-3.5 w-3.5 link-ext')}
              </a></li>`).join('')}
          </ul>
        </section>
        <section class="panel-emerald mt-4" aria-label="What to learn next">
          <h2 class="panel-h2 text-emerald">${ICONS.Eye('h-4 w-4')} What to learn next</h2>
          <ul class="stack mt-3">
            ${D.DEBRIEF.next.map((n) => `<li class="row-flex next-li">${ICONS.ArrowRight('h-3.5 w-3.5 next-arrow')} ${esc(n)}</li>`).join('')}
          </ul>
        </section>
        <div class="row-flex end mt-8">
          <button type="button" class="btn btn-primary btn-lg" data-action="open-completion">Open my completion card</button>
        </div>
      </div>`;
  }

  // ================================================================ COMPLETION
  function focusAreasOf(lab) {
    const mode = lab.mode;
    const objs = CL.objectivesFor(mode);
    const quizItems = CL.QUIZ[mode];
    const pillars = ['P1', 'P2', 'P3', 'P4'];
    const focusAreas = [];
    // 1) incomplete objectives, grouped by mastery pillar
    for (const p of pillars) {
      const missed = objs.filter((o) => o.pillar === p && !lab.completed[o.id]);
      if (missed.length) {
        focusAreas.push({
          area: CL.PILLAR_META[p].label + ' (' + missed.map((o) => o.id).join(', ') + ')',
          detail: 'Re-run on the bench: ' + missed.map((o) => o.title.toLowerCase()).join('; ') + '.',
        });
      }
    }
    // 2) wrong knowledge-check answers → their study topics
    const missedTopics = quizItems
      .filter((q) => lab.quizAnswers[q.id] !== undefined && lab.quizAnswers[q.id] !== q.correct)
      .map((q) => q.topic);
    if (lab.quizSubmitted && missedTopics.length) {
      focusAreas.push({
        area: 'Knowledge check',
        detail: 'Review ' + [...new Set(missedTopics)].join(', ') + ' in the field manual, then retake the mode.',
      });
    }
    // 3) objectives that needed hints or multiple attempts
    const shaky = objs.filter((o) => (lab.hintsUsed[o.id] ?? 0) > 0 || (lab.attempts[o.id] ?? 0) > 1);
    if (shaky.length) {
      focusAreas.push({
        area: 'First-attempt accuracy',
        detail: 'You needed hints or re-checks on ' + shaky.map((o) => o.title.toLowerCase()).join(', ') + '. Reset the bench and redo ' + (shaky.length > 1 ? 'them' : 'it') + ' with zero hints to confirm the skill.',
      });
    }
    // 4) nothing shaky → say so explicitly
    if (!focusAreas.length) {
      focusAreas.push({
        area: 'No weak spots detected',
        detail: 'Every objective passed first-try with no hints and the knowledge check was clean. Run the other difficulty mode to stretch further.',
      });
    }
    return focusAreas;
  }

  function CompletionModal() {
    const lab = store.state;
    if (!lab.showCompletion) return '';
    const mode = lab.mode;
    const objs = CL.objectivesFor(mode);
    const progress = CL.progressOf(lab);
    const score = CL.scoreOf(lab);
    const { stars, penalty } = CL.starsOf(lab);
    const quizItems = CL.QUIZ[mode];
    const pillars = ['P1', 'P2', 'P3', 'P4'];
    const perfect = CL.allObjectivesDone(lab) && stars === 5;
    const focusAreas = focusAreasOf(lab);
    return `
      <div class="overlay overlay-modal" data-action="close-completion-overlay"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Completion card">
        <div class="dialog-head">
          <div class="dialog-title">${ICONS.Trophy('h-4 w-4')} ${perfect ? 'Bench mastery — flawless audit' : 'Bench cleared'}</div>
          <p class="dialog-sub">${mode === 'hard' ? 'Redline audit' : 'Training shift'} · ${lab.completedAt ? new Date(lab.completedAt).toLocaleString() : ''}</p>
        </div>
        <div class="dialog-body">
          <div class="score-grid">
            <div class="score-card"><div class="score-num text-amber">${score.score}%</div><div class="micro-label">overall</div></div>
            <div class="score-card"><div class="score-num text-emerald">${progress.done}/${progress.total}</div><div class="micro-label">objectives</div></div>
            <div class="score-card"><div class="score-num">${lab.quizScore}/${quizItems.length}</div><div class="micro-label">knowledge check</div></div>
          </div>
          <div class="center">
            ${Stars(stars)}
            <p class="micro-note mt-2">stars −${penalty.toFixed(2)} from hints &amp; re-checks · 5★ requires first-attempt accuracy with zero hints</p>
          </div>
          <div>
            <h3 class="micro-label mb-2">Objective recap by mastery pillar</h3>
            <div class="stack">
              ${pillars.map((p) => {
                const list = objs.filter((o) => o.pillar === p);
                const passed = list.filter((o) => lab.completed[o.id]).length;
                return `
                  <div class="pillar-recap">
                    <div class="row-between">
                      <span class="pillar-badge pillar-${p}">${esc(CL.PILLAR_META[p].label)}</span>
                      <span class="mono-dim">${passed}/${list.length}</span>
                    </div>
                    <ul class="mt-1 stack-tight">
                      ${list.map((o) => `<li class="recap-li"><span class="${lab.completed[o.id] ? 'text-emerald' : 'text-rose'}">${lab.completed[o.id] ? '✓' : '✗'}</span> ${esc(o.title)}</li>`).join('')}
                    </ul>
                  </div>`;
              }).join('')}
            </div>
          </div>
          <div class="panel-amber-soft">
            <h3 class="mono-label text-amber row-flex gap-2">${ICONS.Target('h-3.5 w-3.5')} Focus areas — where to push harder</h3>
            <ul class="stack mt-2">
              ${focusAreas.map((f) => `<li class="focus-li"><span class="focus-area">${esc(f.area)}:</span> ${esc(f.detail)}</li>`).join('')}
            </ul>
          </div>
          <div class="panel-emerald">
            <h3 class="mono-label text-emerald row-flex gap-2">${ICONS.BookOpen('h-3.5 w-3.5')} keep going</h3>
            <ul class="stack-tight mt-2">
              ${D.DEBRIEF.next.map((n) => `<li class="next-li-soft">· ${esc(n)}</li>`).join('')}
            </ul>
          </div>
          <div class="row-flex end wrap gap-2">
            <button type="button" class="btn btn-outline" data-action="close-completion">Back to debrief</button>
            <button type="button" class="btn btn-primary" data-action="reset-from-modal" aria-label="Restart the lab">
              ${ICONS.RotateCcw('h-4 w-4')} Run the other mode
            </button>
          </div>
        </div>
      </div>`;
  }

  // ================================================================ RESET DIALOG
  function ResetDialog() {
    if (!resetDialog) return '';
    return `
      <div class="overlay overlay-modal" data-action="close-reset-overlay"></div>
      <div class="dialog dialog-small" role="alertdialog" aria-modal="true" aria-label="Reset the bench?">
        <div class="dialog-body">
          <h2 class="dialog-title-sm">Reset the bench?</h2>
          <p class="dialog-sub left">This wipes saved progress, objectives, quiz results and environment state, and returns
            BENCH-01 to its pristine power-off state. There is no undo.</p>
          <div class="row-flex end gap-2 mt-4">
            <button type="button" class="btn btn-outline" data-action="close-reset">Keep my progress</button>
            <button type="button" class="btn btn-danger" data-action="confirm-reset">Reset everything</button>
          </div>
        </div>
      </div>`;
  }

  // ================================================================ RENDER
  function render() {
    const s = store.state;
    const app = document.getElementById('app');
    if (!app) return;
    let html = '';
    if (s.phase === 'mode') {
      html = ModeSelect();
    } else {
      html = ControlStrip();
      if (s.phase === 'briefing') html += `<div class="phase-wrap">${Briefing()}</div>`;
      if (s.phase === 'bench') html += Workbench();
      if (s.phase === 'quiz') html += `<div class="phase-wrap">${Quiz()}</div>`;
      if (s.phase === 'debrief') html += `<div class="phase-wrap">${Debrief()}</div>`;
      html += ManualSheetIfOpen() + CompletionModal() + ResetDialog();
    }
    const focusKey = captureFocus();
    app.innerHTML = html;
    restoreFocus(focusKey);
  }

  function ManualSheetIfOpen() {
    return manualOpen ? ManualSheet() : '';
  }

  function captureFocus() {
    const el = document.activeElement;
    if (el && el.dataset && el.dataset.fk) return el.dataset.fk;
    return null;
  }
  function restoreFocus(key) {
    if (!key) return;
    const el = document.querySelector('[data-fk="' + key + '"]');
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
  }

  function renderStage() {
    const stage = document.getElementById('stage');
    if (!stage) { render(); return; }
    const meta = CL.INSTRUMENTS.find((i) => i.id === activeInst);
    stage.innerHTML = `
      <div class="stage-head hidden-sm">
        <h2 class="stage-title">${meta.label} unit</h2>
        <p class="stage-desc">${esc(meta.desc)}</p>
      </div>
      <div class="stage-frame">${CL.renderInstrument(activeInst)}</div>`;
  }
  CL.renderStage = renderStage;

  // ================================================================ EVENTS
  function answerFromControl(el) {
    const obj = el.dataset.obj;
    const field = el.dataset.field || '';
    const value = el.value;
    if (obj === 'OBJ-M3' && field === 'flaw') { sastPickFlaw(value); return; }
    if (!field) { A().setAnswer(obj, value); return; }
    const base = store.state.answers[obj] ?? {};
    if (field.includes('.')) {
      const [a, b] = field.split('.');
      const cur = base[a] ?? {};
      A().setAnswer(obj, { ...base, [a]: { ...cur, [b]: value } });
    } else if (field.includes(':')) {
      const [a, i] = field.split(':');
      const arr = Array.isArray(base[a]) ? base[a].slice() : [];
      arr[Number(i)] = value;
      A().setAnswer(obj, { ...base, [a]: arr });
    } else {
      A().setAnswer(obj, { ...base, [field]: value });
    }
  }

  function sastPickFlaw(v) {
    const vst = CL.instrumentViews.sast;
    const answer = store.state.answers['OBJ-M3'];
    const current = answer || { file: vst.selected ? vst.selected.file : '', line: vst.selected ? vst.selected.line : 0, flaw: vst.flaw };
    vst.flaw = v;
    A().setAnswer('OBJ-M3', { file: current.file, line: current.line, flaw: v });
  }

  function toggleFromControl(el, checked) {
    const obj = el.dataset.obj;
    const field = el.dataset.field || '';
    const item = el.dataset.item;
    const base = store.state.answers[obj];
    if (!field) {
      const list = Array.isArray(base) ? base : [];
      const next = checked ? [...list, item] : list.filter((x) => x !== item);
      A().setAnswer(obj, next);
    } else {
      const rec = base && typeof base === 'object' ? base : {};
      const list = Array.isArray(rec[field]) ? rec[field] : [];
      const next = checked ? [...list, item] : list.filter((x) => x !== item);
      A().setAnswer(obj, { ...rec, [field]: next });
    }
  }

  function boolFromControl(el, checked) {
    const obj = el.dataset.obj;
    const item = el.dataset.item;
    const base = store.state.answers[obj] ?? {};
    A().setAnswer(obj, { ...base, [item]: checked });
  }

  function verdictClick(el) {
    const obj = el.dataset.obj;
    const item = el.dataset.item;
    const v = el.dataset.v;
    const base = store.state.answers[obj] ?? {};
    A().setAnswer(obj, { ...base, [item]: v });
  }

  // ---- timed flows (crawl / scan / fuzz / debugger run) ----
  let timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; }

  function runCrawl() {
    const v = CL.instrumentViews.dast;
    D.CRAWL_LOG.forEach((line, i) => {
      timers.push(setTimeout(() => {
        v.crawlLines.push(line);
        if (i === D.CRAWL_LOG.length - 1) A().setCrawlDone();
        else renderStage();
      }, 160 * (i + 1)));
    });
  }

  function runScan() {
    const v = CL.instrumentViews.dast;
    let p = 0;
    const iv = setInterval(() => {
      p += 7;
      v.scanPct = Math.min(100, p);
      if (p >= 100) {
        clearInterval(iv);
        A().setScanDone();
      } else {
        renderStage();
      }
    }, 90);
    timers.push(iv);
  }

  function runFuzz() {
    const v = CL.instrumentViews.fuzz;
    v.running = true;
    renderStage();
    timers.push(setTimeout(() => {
      v.running = false;
      A().recordFuzzRun();
    }, 750));
  }

  function debugStep() {
    const i = CL.DEBUG_ORDER.indexOf(store.state.debugState);
    if (i < CL.DEBUG_ORDER.length - 1) {
      const next = CL.DEBUG_ORDER[i + 1];
      A().setDebugState(next);
      if (next === 'running') {
        timers.push(setTimeout(() => {
          if (store.state.debugState === 'running') A().setDebugState('hit');
        }, 800));
      }
    }
  }

  function closeAllFloating() {
    sheet = null;
    manualOpen = false;
    resetDialog = false;
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'start':
        activeInst = 'target';
        ledgerOpenId = null;
        A().start(el.dataset.mode);
        window.scrollTo(0, 0);
        break;
      case 'goto':
        A().goto(el.dataset.phase);
        window.scrollTo(0, 0);
        break;
      case 'briefing-proceed':
        store.set({ briefingSeen: true });
        A().goto('bench');
        break;
      case 'open-manual': manualOpen = true; render(); break;
      case 'close-manual': manualOpen = false; render(); break;
      case 'open-sheet':
        if (el.dataset.sheet === 'manual') { manualOpen = true; sheet = null; }
        else { sheet = 'ledger'; manualOpen = false; }
        render();
        break;
      case 'close-sheet': sheet = null; render(); break;
      case 'open-reset': resetDialog = true; render(); break;
      case 'close-reset': resetDialog = false; render(); break;
      case 'close-reset-overlay': if (e.target === el) { resetDialog = false; render(); } break;
      case 'confirm-reset':
        clearTimers();
        activeInst = 'target';
        ledgerOpenId = null;
        closeAllFloating();
        CL.resetInstrumentView(activeInst);
        A().reset();
        window.scrollTo(0, 0);
        break;
      case 'inst':
        if (activeInst !== el.dataset.inst) {
          activeInst = el.dataset.inst;
          CL.resetInstrumentView(activeInst);
          store.setSilent({ visitedInstruments: [...new Set([...store.state.visitedInstruments, activeInst])] });
          render();
        }
        break;
      case 'ledger-toggle':
        ledgerOpenId = ledgerOpenId === el.dataset.obj ? null : el.dataset.obj;
        render();
        break;
      case 'ledger-nav': {
        const inst = el.dataset.inst;
        if (CL.INSTRUMENTS.some((i) => i.id === inst)) {
          if (activeInst !== inst) {
            activeInst = inst;
            CL.resetInstrumentView(inst);
            store.setSilent({ visitedInstruments: [...new Set([...store.state.visitedInstruments, inst])] });
          }
          sheet = null;
          render();
        }
        break;
      }
      case 'target-page': CL.instrumentViews.target.page = el.dataset.page; renderStage(); break;
      case 'records-id': CL.instrumentViews.target.id = el.dataset.n; renderStage(); break;
      case 'api-id': CL.instrumentViews.target.apiId = el.dataset.n; renderStage(); break;
      case 'login-submit': {
        const t = CL.instrumentViews.target;
        if (t.u.trim().toLowerCase() === 'admin' && t.p === 'admin123') {
          t.msg = { ok: true, text: 'Login successful — welcome, site admin. (Factory credentials accepted — that is itself a finding.)' };
        } else {
          t.msg = { ok: false, text: 'Authentication failed — invalid credentials.' };
        }
        renderStage();
        break;
      }
      case 'search-submit': {
        e.preventDefault();
        const t = CL.instrumentViews.target;
        t.submitted = t.q;
        renderStage();
        break;
      }
      case 'sast-file': CL.instrumentViews.sast.fileId = el.dataset.file; renderStage(); break;
      case 'sast-line': {
        const v = CL.instrumentViews.sast;
        const answer = store.state.answers['OBJ-M3'];
        const current = answer || { file: v.selected ? v.selected.file : '', line: v.selected ? v.selected.line : 0, flaw: v.flaw };
        v.selected = { file: v.fileId, line: Number(el.dataset.line) };
        A().setAnswer('OBJ-M3', { ...current, file: v.fileId, line: Number(el.dataset.line), flaw: answer ? answer.flaw : v.flaw });
        break;
      }
      case 'config-tab': {
        CL.instrumentViews.config.tab = el.dataset.tab;
        store.setSilent({ configTabsSeen: [...new Set([...store.state.configTabsSeen, el.dataset.tab])] });
        renderStage();
        break;
      }
      case 'triage-tab': CL.instrumentViews.triage.tab = el.dataset.tab; renderStage(); break;
      case 'crawl': runCrawl(); break;
      case 'scan': runScan(); break;
      case 'fuzz-run': runFuzz(); break;
      case 'debug-step': debugStep(); break;
      case 'check': A().checkObjective(el.dataset.obj); break;
      case 'hint': A().useHint(el.dataset.obj); break;
      case 'verdict': verdictClick(el); break;
      case 'bool': boolFromControl(el, !store.state.answers[el.dataset.obj]?.[el.dataset.item]); break;
      case 'quiz-answer': A().setQuizAnswer(el.dataset.qid, Number(el.dataset.idx)); break;
      case 'quiz-check': A().checkQuizItem(el.dataset.qid); break;
      case 'quiz-next': A().nextQuizItem(); break;
      case 'quiz-submit': A().submitQuiz(); window.scrollTo(0, 0); break;
      case 'open-completion': A().openCompletion(); break;
      case 'close-completion': A().closeCompletion(); break;
      case 'close-completion-overlay': if (e.target === el) A().closeCompletion(); break;
      case 'reset-from-modal':
        clearTimers();
        activeInst = 'target';
        ledgerOpenId = null;
        closeAllFloating();
        CL.resetInstrumentView(activeInst);
        A().reset();
        window.scrollTo(0, 0);
        break;
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('select[data-action="answer"], input[type="radio"][data-action="answer"]')) {
      answerFromControl(el);
    } else if (el.matches('input[type="checkbox"][data-action="toggle"]')) {
      toggleFromControl(el, el.checked);
    }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('[data-input]')) {
      // silent write while typing (no re-render → no focus loss)
      if (el.dataset.inputTarget) {
        CL.instrumentViews.target[el.dataset.inputTarget] = el.value;
      } else if (el.dataset.inputObj) {
        const obj = el.dataset.inputObj;
        const field = el.dataset.inputField;
        if (field) {
          const base = store.state.answers[obj] ?? {};
          store.setSilent({ answers: { ...store.state.answers, [obj]: { ...base, [field]: el.value } } });
        } else {
          store.setSilent({ answers: { ...store.state.answers, [obj]: el.value } });
        }
      }
      return;
    }
    if (el.matches('select[data-action="answer"], input[type="radio"][data-action="answer"]')) {
      // keyboard-driven changes on radios/selects fire `input` before `change`;
      // let the `change` handler own the commit to avoid double writes.
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resetDialog) { resetDialog = false; render(); return; }
      if (store.state.showCompletion) { A().closeCompletion(); return; }
      if (sheet || manualOpen) { sheet = null; manualOpen = false; render(); return; }
    }
  });

  // glossary tooltip (hover + keyboard focus)
  let tipEl = null;
  function showTip(target) {
    const term = target.dataset.term;
    const entry = D.GLOSSARY.find((g) => g.term === term);
    if (!entry) return;
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'gloss-tip';
      tipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tipEl);
    }
    tipEl.innerHTML = '<span class="gloss-tip-term">' + esc(entry.term) + ':</span> ' + esc(entry.def);
    const r = target.getBoundingClientRect();
    tipEl.style.display = 'block';
    const tw = tipEl.offsetWidth;
    let left = r.left + window.scrollX;
    if (left + tw > window.scrollX + window.innerWidth - 12) left = window.scrollX + window.innerWidth - tw - 12;
    tipEl.style.left = left + 'px';
    tipEl.style.top = r.bottom + window.scrollY + 6 + 'px';
  }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }
  document.addEventListener('mouseover', (e) => {
    const g = e.target.closest('.gloss');
    if (g) showTip(g); else hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const g = e.target.closest && e.target.closest('.gloss');
    if (g) showTip(g);
  });
  document.addEventListener('focusout', hideTip);

  // ================================================================ BOOT
  function boot() {
    CL.hydrate();
    if (store.state.phase === 'bench') CL.resetInstrumentView('target');
    render();
    store.subscribe(() => render());
  }

  CL.DEBUG_ORDER = DEBUG_ORDER;
  CL.boot = boot;
  CL.renderApp = render;
})(window.CyberLab);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.CyberLab.boot);
} else {
  window.CyberLab.boot();
}
