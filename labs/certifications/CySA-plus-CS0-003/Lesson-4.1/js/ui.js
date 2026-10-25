/* ======================================================================
   js/ui.js — rendering (all lab components as template functions)
   1:1 visual port of the original src/components/lab/*.tsx tree:
   ModeSelect, LabHeader, ObjectivesRail/Mobile, ObjectiveCard, Day1–Day5,
   QuizSection, Debrief, CompletionModal, and the shared "bits".
   Every text, placeholder, aria-label and conditional is carried over
   unchanged. Interactions are wired by js/app.js via data-* attributes.
   ====================================================================== */
(function () {
  'use strict';

  var D = window.LAB_DATA;

  /* ------------------------------- helpers ------------------------------- */

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function cn() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (a) out.push(a);
    }
    return out.join(' ');
  }

  /* Inline SVG icon (exact lucide path data from js/icons.js). size in px. */
  function icon(name, size, cls) {
    var node = window.LAB_ICONS[name];
    if (!node) return '';
    var inner = node.map(function (part) {
      var attrs = Object.keys(part[1]).map(function (k) {
        return ' ' + k + '="' + esc(part[1][k]) + '"';
      }).join('');
      return '<' + part[0] + attrs + '></' + part[0] + '>';
    }).join('');
    return '<svg class="' + cn('ic ic-' + (size || 16), cls) + '" viewBox="0 0 24 24" width="' + (size || 16) +
      '" height="' + (size || 16) + '" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var PILLAR_META = {
    P1: { label: 'P1 · Understand', cls: 'pill pill-violet' },
    P2: { label: 'P2 · Recognize', cls: 'pill pill-amber' },
    P3: { label: 'P3 · Detect', cls: 'pill pill-emerald' },
    P4: { label: 'P4 · Lead &amp; Mitigate', cls: 'pill pill-teal' },
  };

  function PillarBadge(p) {
    var m = PILLAR_META[p];
    return '<span class="' + m.cls + '">' + m.label + '</span>';
  }

  function Kicker(text) {
    return '<p class="kicker">' + text + '</p>';
  }

  /* Glossary tooltip term (F4 — jargon defined at first use). */
  function Term(k) {
    var def = null;
    for (var i = 0; i < D.GLOSSARY.length; i++) {
      if (D.GLOSSARY[i].term.toLowerCase() === k.toLowerCase()) { def = D.GLOSSARY[i]; break; }
    }
    return '<button type="button" class="term" aria-label="' + esc(k + ' — ' + (def ? def.def : 'glossary term')) + '">' +
      '<span class="term-bubble" role="tooltip">' + esc(def ? def.def : 'See glossary.') + '</span>' + esc(k) + '</button>';
  }

  function SectionHead(num, title, sub, right) {
    return '<div class="section-head">' +
      '<div class="section-head-l">' +
      '<span class="section-num" aria-hidden="true">' + num + '</span>' +
      '<div><h2 class="section-title">' + esc(title) + '</h2><p class="section-sub">' + esc(sub) + '</p></div>' +
      '</div>' + (right || '') + '</div>';
  }

  function SyntheticNote(cls) {
    return '<p class="' + cn('synthetic-note', cls || '') + '">Synthetic training data · fictional org “Corvus Logistics” · no real PII</p>';
  }

  function objDef(id) {
    var list = D.OBJECTIVES;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    throw new Error('Missing objective def: ' + id);
  }

  function arr(env, key) { return env[key] || []; }
  function mapv(env, key, id) { return env[key] ? (env[key][id] || '') : ''; }

  /* Radio card: hidden native input wrapped in a label (same interaction surface
     as the original RadioGroup + sr-only RadioGroupItem). */
  function radioCard(name, key, value, text, id, small) {
    return '<label class="' + cn('radio-card', small && 'radio-card-sm') + '" for="' + id + '" data-for="' + key + '">' +
      '<input class="sr-only" type="radio" name="' + name + '" value="' + esc(value) + '" id="' + id + '" data-key="' + esc(key) + '">' +
      '<span class="radio-card-txt">' + esc(text) + '</span></label>';
  }

  /* Two-state classifier (Playbook/Runbook, TP/FP) — same aria-pressed semantics. */
  function duoToggle(map, id, a, b, aLabel, bLabel, value, bold) {
    return '<span class="duo" role="group" aria-label="' + esc(aLabel) + '">' +
      '<button type="button" data-duo="' + esc(map) + '" data-k="' + esc(id) + '" data-val="' + esc(a) + '" aria-pressed="' + (value === a) + '"' +
      ' class="' + cn('duo-btn', bold && 'duo-btn-bold') + '">' + aLabel + '</button>' +
      '<button type="button" data-duo="' + esc(map) + '" data-k="' + esc(id) + '" data-val="' + esc(b) + '" aria-pressed="' + (value === b) + '"' +
      ' class="' + cn('duo-btn duo-btn-r', bold && 'duo-btn-bold') + '">' + bLabel + '</button></span>';
  }

  function checkRow(inputId, arrKey, id, text, picked, aria) {
    return '<div class="' + cn('check-row', picked && 'check-row-on') + '" data-checkrow="' + esc(arrKey) + ':' + esc(id) + '">' +
      '<input type="checkbox" id="' + inputId + '" data-arr="' + esc(arrKey) + '" data-k="' + esc(id) + '"' +
      (picked ? ' checked' : '') + ' aria-label="' + esc(aria || text) + '" class="cbx">' +
      '<label class="check-label" for="' + inputId + '">' + esc(text) + '</label></div>';
  }

  /* Click-to-reorder list (playbook builders) — arrow buttons move one slot. */
  function ReorderList(listKey, items, order) {
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var lis = order.map(function (id, idx) {
      var item = byId[id];
      if (!item) return '';
      var short = item.text.slice(0, 24);
      return '<li class="reorder-item">' +
        '<span class="reorder-n">' + String(idx + 1).padStart(2, '0') + '</span>' +
        '<span class="reorder-txt">' + esc(item.text) + '</span>' +
        '<span class="reorder-btns">' +
        '<button type="button" class="btn btn-icon" data-order="' + esc(listKey) + '" data-idx="' + idx + '" data-dir="-1"' +
        ' aria-label="Move &quot;' + esc(short) + '…" up"' + (idx === 0 ? ' disabled' : '') + '>' + icon('chevron-up', 16) + '</button>' +
        '<button type="button" class="btn btn-icon" data-order="' + esc(listKey) + '" data-idx="' + idx + '" data-dir="1"' +
        ' aria-label="Move &quot;' + esc(short) + '…" down"' + (idx === order.length - 1 ? ' disabled' : '') + '>' + icon('chevron-down', 16) + '</button>' +
        '</span></li>';
    }).join('');
    return '<ol class="reorder">' + lis + '</ol>';
  }

  /* Terminal-style log feed with screen-reader announcement. */
  function LogFeed(id, lines, label, empty) {
    return '<div class="terminal" id="' + id + '">' +
      '<div class="terminal-head">' + esc(label) + '</div>' +
      '<div class="terminal-body lab-scroll" role="log">' +
      (lines.length === 0 ? '<p class="term-empty">' + esc(empty) + '</p>' : '') +
      lines.map(function (l) { return logLine(l); }).join('') +
      '</div>' +
      '<div class="sr-only" aria-live="polite" data-live>' +
      (lines.length ? esc(lines[lines.length - 1].t + ' — ' + lines[lines.length - 1].msg) : '') + '</div>' +
      '</div>';
  }

  function logLine(l) {
    return '<p class="log-line tone-' + l.t + '"><span class="term-t">' + esc(l.t) + '</span> ' + esc(l.msg) + '</p>';
  }

  /* Native select styled to match the original Select trigger. */
  function SelectBox(id, attrs, placeholder, options) {
    var opts = '<option value="" disabled hidden' + (attrs.value ? '' : ' selected') + '>' + esc(placeholder) + '</option>';
    opts += options.map(function (o) {
      return '<option value="' + esc(o.v) + '"' + (String(attrs.value) === String(o.v) ? ' selected' : '') + '>' + esc(o.t) + '</option>';
    }).join('');
    var attrStr = Object.keys(attrs).filter(function (k) { return k !== 'value'; }).map(function (k) {
      return ' ' + k + '="' + esc(attrs[k]) + '"';
    }).join(' ');
    return '<select class="select" id="' + id + '" data-value="' + esc(attrs.value === undefined ? '' : attrs.value) + '"' +
      (attrs.value ? '' : ' data-empty="1"') + attrStr + '>' + opts + '</select>';
  }

  var BENEFIT_ICONS = {
    b1: 'sparkles', b2: 'heart-pulse', b3: 'cpu', b4: 'handshake', b5: 'shield-check', b6: 'gauge',
  };

  /* ======================================================================
     SCREEN 1 — Mode select + C1 Scenario Briefing
     ====================================================================== */
  function renderModeSelect() {
    var badge = function (cls, txt) { return '<span class="' + cls + '">' + txt + '</span>'; };
    return '<div class="mode-screen"><div class="mode-wrap">' +
      '<div class="fade-up">' +
      '<div class="mode-badges">' +
      badge('pill pill-amber-solid', 'CompTIA CySA+ CS0-003') +
      badge('pill pill-outline-mono', 'LESSON 4.1') +
      badge('pill pill-emerald-outline', 'Defensive · 100% synthetic') +
      '</div>' +
      '<h1 class="mode-h1">SOC Modernization Sprint</h1>' +
      '<p class="mode-sub">Exploring Leadership in Security Operations — automation, metrics, and the data-driven SOC.</p>' +
      '</div>' +

      '<div class="fade-up d1 card briefing-card">' +
      '<div class="card-body space-4">' +
      '<div class="briefing-kicker">' + icon('building-2', 16) + '<span class="kicker">Scenario briefing · fictional</span></div>' +
      '<div class="prose">' +
      '<p>You lead security operations at <strong>Corvus Logistics</strong>, a freight company whose 8-analyst SOC is drowning: duplicate phishing reports burn entire afternoons, nights go unwatched, SLA clocks slip, and every audit is a scramble. Leadership has approved a <strong>5-day Modernization Sprint</strong> to introduce automation the right way — and to prove its value with data, not vibes.</p>' +
      '<p>Across five days you will diagnose the floor, encode a playbook, run the automation against a live (simulated) queue, prove compliance coverage in real time, and close the week by briefing the VP with metrics that justify the budget. Every alert, host and metric in this lab is <strong>synthetic training data</strong>.</p>' +
      '</div>' +
      '<ul class="briefing-list">' +
      '<li>' + icon('calendar-clock', 16) + ' 5 sprint days, one workbench each</li>' +
      '<li>' + icon('list-checks', 16) + ' Machine-checked objectives with teaching feedback</li>' +
      '<li>' + icon('gauge', 16) + ' Live SOAR run you control</li>' +
      '<li>' + icon('badge-check', 16) + ' Progress auto-saves in your browser</li>' +
      '</ul>' +
      '<p class="briefing-map">' + icon('graduation-cap', 16) +
      ' Maps to CySA+ security-automation and reporting concepts; alerts reference real MITRE ATT&amp;CK technique IDs (T1566, T1003, T1110, T1078) for context.</p>' +
      '</div></div>' +

      '<div class="mode-grid">' +
      /* MEDIUM card */
      '<div class="fade-up d2"><div class="card mode-card mode-card-medium">' +
      '<div class="card-body mode-card-body">' +
      '<div class="mode-card-top">' +
      '<span class="mode-ico mode-ico-medium">' + icon('graduation-cap', 20) + '</span>' +
      '<span class="pill pill-emerald-solid">MEDIUM · GUIDED</span></div>' +
      '<h2 class="mode-h2">Deputy Lead</h2>' +
      '<p class="mode-p">12 granular objectives introduced in order, each with “where to look” pointers and up to three tiered hints. Tolerant checking accepts equivalent formats; every result teaches. Quiz after practice, supportive tone throughout.</p>' +
      '<ul class="mode-ul">' +
      '<li>' + icon('clipboard-list', 14) + ' Learn the concepts while doing the work</li>' +
      '<li>' + icon('shield-check', 14) + ' Hints available freely (they only affect stars)</li>' +
      '</ul>' +
      '<button type="button" class="btn btn-primary btn-emerald" data-action="choose-mode" data-mode="medium">Start as Deputy Lead</button>' +
      '</div></div></div>' +
      /* HARD card */
      '<div class="fade-up d3"><div class="card mode-card mode-card-hard">' +
      '<div class="card-body mode-card-body">' +
      '<div class="mode-card-top">' +
      '<span class="mode-ico mode-ico-hard">' + icon('mountain', 20) + '</span>' +
      '<span class="pill pill-amber-ghost">HARD · COLD OPEN</span></div>' +
      '<h2 class="mode-h2 mode-h2-dark">Acting Lead</h2>' +
      '<p class="mode-p mode-p-dark">9 deep, multi-step challenges. You inherit a noisy weekend handover, a naive playbook run with two buried red herrings, and a board that wants a defensible recommendation. Strict validation — exact values, exact IDs, near-misses rejected with rationale. Hints: one nudge, and it costs stars.</p>' +
      '<ul class="mode-ul mode-ul-dark">' +
      '<li>' + icon('clipboard-list', 14) + ' Analyze, evaluate, and defend every call</li>' +
      '<li>' + icon('shield-check', 14) + ' Distractors and red herrings throughout</li>' +
      '</ul>' +
      '<button type="button" class="btn btn-primary btn-amber" data-action="choose-mode" data-mode="hard">Take the Acting Lead seat</button>' +
      '</div></div></div>' +
      '</div>' +

      '<div class="mode-foot"><div>' + SyntheticNote() + '</div>' +
      '<p class="mode-foot-note">CyberLab · no nav · no footer · one page · progress stays in this browser</p></div>' +
      '</div></div>';
  }

  /* ======================================================================
     Knowledge core (Day 1, both modes) — C2
     ====================================================================== */
  function KnowledgeCore() {
    var benefits = D.BENEFITS.map(function (b) {
      return '<li class="benefit">' +
        '<span class="benefit-ico">' + icon(BENEFIT_ICONS[b.id] || 'sparkles', 14) + '</span>' +
        '<span><strong>' + esc(b.id.toUpperCase()) + '</strong> · ' + esc(b.label) + '</span></li>';
    }).join('');
    return '<div class="card"><div class="card-body space-5">' +
      '<div>' + Kicker('Knowledge core · read once, use all week') + '<h3 class="card-title-lg">The terms on the board</h3></div>' +
      '<div class="kc-grid">' +
      '<div class="kc-box"><p class="kc-t">' + icon('cable', 16, 'ic-violet') + ' Orchestration</p><p class="kc-d">Makes separate tools — SIEM, sandbox, ticketing, mail gateway — act as <em>one ordered flow</em>. The conductor.</p></div>' +
      '<div class="kc-box"><p class="kc-t">' + icon('bot', 16, 'ic-violet') + ' Automation</p><p class="kc-d">Executes tasks with no human click — at machine speed, overnight, identically every time. The engine.</p></div>' +
      '<div class="kc-box"><p class="kc-t">' + icon('shield-check', 16, 'ic-violet') + ' ' + Term('SOAR') + '</p><p class="kc-d">Security Orchestration, Automation and Response — the platform that unifies both under ' + Term('playbook') + 's and ' + Term('runbook') + 's.</p></div>' +
      '</div>' +
      '<div><p class="kc-h">Playbook vs runbook — know the difference cold</p>' +
      '<p class="kc-d">A <strong>playbook</strong> is the encoded decision-tree the SOAR engine executes: trigger → steps → branches → actions. A <strong>runbook</strong> is a manual procedure a trained human follows. Mature teams automate the repeatable (playbooks) and document the judgment-heavy (runbooks).</p></div>' +
      '<div><p class="kc-h">Why the SOC automates — the six benefits from the lesson</p>' +
      '<ul class="benefit-grid">' + benefits + '</ul></div>' +
      '<div><p class="kc-h">Where this sits in the SOC pipeline</p>' +
      '<p class="kc-d">Telemetry lands → ' + Term('triage') + ' sorts signal from noise → playbooks act in seconds → humans resolve ambiguity. The adversary techniques your playbooks respond to are documented in MITRE ATT&amp;CK (this week&#39;s floor will show ' +
      '<span class="chip">T1566</span> <span class="chip">T1003</span> <span class="chip">T1110</span> <span class="chip">T1078</span> in the wild). Leadership sees the outcome as metrics: ' + Term('MTTD') + ', ' + Term('MTTR') + ', ' + Term('SLA') + ' adherence, false-positive rate.</p></div>' +
      '<div class="kc-box kc-note"><p class="kc-t">' + icon('lightbulb', 16, 'ic-amber') + ' Industry practice, labeled “typical”</p>' +
      '<p class="kc-d">Managed security providers typically auto-triage the majority of user-reported phishing with SOAR playbooks before a human looks; IR teams standardize containment in runbooks; CISOs track detection/response trends on executive dashboards. This lab simulates that operating model end-to-end so you can run it yourself.</p></div>' +
      '</div></div>';
  }

  /* ======================================================================
     Objective card (C4/F2) — prompt, hints, CHECK RESULTS, feedback
     ====================================================================== */
  function ObjectiveCard(def, bodyHtml, opts) {
    opts = opts || {};
    var st = window.LAB_STORE.getState().obj[def.id];
    var done = !!(st && st.done);
    var medium = def.mode === 'medium';
    var stShow = st && st.attempts > 0;
    return '<article class="card obj-card' + (done ? ' obj-done' : '') + '" id="obj-' + def.id + '" data-obj-card="' + def.id + '">' +
      '<div class="card-body space-4">' +
      '<div class="obj-badges">' +
      PillarBadge(def.pillar) +
      '<span class="pill pill-outline-mono">' + def.id + '</span>' +
      '<span class="pill pill-pass obj-pass-badge" data-obj-passed' + (done ? '' : ' hidden') + '>' + icon('check-circle-2', 12) + ' PASSED</span>' +
      '</div>' +
      '<h3 class="obj-title">' + esc(def.title) + '</h3>' +
      '<p class="obj-prompt">' + esc(def.prompt) + '</p>' +
      '<p class="obj-anchor">covers · ' + esc(def.anchor) + '</p>' +
      '<p class="obj-look" data-obj-look' + (medium && def.look && !done ? '' : ' hidden') + '>' + icon('map-pin', 14) + ' Where to look: ' + esc(def.look) + '</p>' +
      bodyHtml +
      '<div class="obj-actions">' +
      '<button type="button" class="btn btn-primary btn-zinc" data-action="check" data-obj="' + def.id + '"' +
      (done ? ' hidden' : (opts.disabled ? ' disabled' : '')) + ' aria-label="Check results for ' + esc(def.title) + '">' +
      icon('play', 16) + ' CHECK RESULTS</button>' +
      '<button type="button" class="btn btn-outline" data-action="hint" data-obj="' + def.id + '"' +
      (done || (st && st.hints >= def.hints.length) ? ' disabled' : '') + (done ? ' hidden' : '') + '>' +
      icon('lightbulb', 16) + ' <span data-hint-label>' +
      (medium ? 'Hint (' + (st ? st.hints : 0) + '/' + def.hints.length + ')' : 'Reveal nudge (costs stars)') + '</span></button>' +
      '<span class="obj-attempts" data-obj-attempts' + (stShow ? '' : ' hidden') + '>' +
      (stShow ? 'attempts ' + st.attempts + (st.hints > 0 ? ' · hints ' + st.hints : '') : '') + '</span>' +
      '</div>' +
      '<p class="obj-disabled-note" data-obj-disabled-note' + (opts.disabled && !done && opts.disabledNote ? '' : ' hidden') + '>' +
      (opts.disabledNote ? esc(opts.disabledNote) : '') + '</p>' +
      '<div class="hint-box" data-obj-hints' + (st && st.hints > 0 ? '' : ' hidden') + '>' +
      (st ? def.hints.slice(0, st.hints).map(function (h, i) {
        return '<p class="hint-line"><span class="hint-strong">Hint ' + (i + 1) + ':</span> ' + esc(h) + '</p>';
      }).join('') : '') +
      '</div>' +
      '<div data-obj-fail' + (stShow && !done ? '' : ' hidden') + ' class="fail-box res-in">' +
      '<p class="fail-t">' + icon('rotate-ccw', 16) + ' NOT YET — teaching moment</p>' +
      '<p class="fail-d">' + esc(def.feedbackFail) + '</p>' +
      (st && st.note ? '<p class="fail-note">Validator: ' + esc(st.note) + '</p>' : '') +
      '</div>' +
      '<div data-obj-passbox' + (done ? '' : ' hidden') + ' class="pass-box res-in">' +
      '<p class="pass-t">' + icon('check-circle-2', 16) + ' PASSED — objective complete</p>' +
      '<p class="pass-d">' + esc(def.feedbackPass) + '</p>' +
      '</div>' +
      '</div></article>';
  }

  /* ======================================================================
     DAY 1
     ====================================================================== */
  function MediumDay1() {
    var m1 = D.TERM_OPTIONS.map(function (t, i) {
      return radioCard('term-m1', 'termPick', t.id, t.text, 'term-' + t.id);
    }).join('');
    var m2 = D.PAINS.map(function (p) {
      return '<div class="pain-row"><p class="pain-txt"><strong class="mono-tag">' + esc(p.id) + '</strong> · ' + esc(p.text) + '</p>' +
        SelectBox('pain-' + p.id, { 'data-map': 'painPairs', 'data-k': p.id, 'aria-label': 'Benefit fixing pain ' + p.id, value: mapv(window.LAB_STORE.getState().env, 'painPairs', p.id) }, 'Assign benefit B1–B6…',
          D.BENEFITS.map(function (b) { return { v: b.id, t: b.id.toUpperCase() + ' · ' + b.short }; })) +
        '</div>';
    }).join('');
    var m3 = D.CLASSIFY.map(function (c) {
      return '<div class="classify-row"><p class="row-txt">' + esc(c.text) + '</p>' +
        duoToggle('classify', c.id, 'playbook', 'runbook', 'Classify statement ' + c.id, 'Classify statement ' + c.id,
        mapv(window.LAB_STORE.getState().env, 'classify', c.id)) + '</div>';
    }).join('');
    return KnowledgeCore() +
      ObjectiveCard(objDef('OBJ-M1'),
        '<div class="radio-grid-2" role="radiogroup" aria-label="Which capability coordinates tools into one flow">' + m1 + '</div>') +
      ObjectiveCard(objDef('OBJ-M2'), '<div class="space-3">' + m2 + '</div>') +
      ObjectiveCard(objDef('OBJ-M3'), '<div class="space-2">' + m3 + '</div>');
  }

  function HardDay1() {
    var env = window.LAB_STORE.getState().env;
    var rows = D.HANDOVER.map(function (h) {
      var picked = arr(env, 'handoverPicks').indexOf(h.id) !== -1;
      return '<div class="handover-row" data-horow="' + h.id + '">' +
        '<input type="checkbox" id="ho-' + h.id + '" data-arr="handoverPicks" data-k="' + h.id + '"' + (picked ? ' checked' : '') +
        ' aria-label="Mark item as systemic: ' + esc(h.text) + '" class="cbx">' +
        '<label class="check-label" for="ho-' + h.id + '">' + esc(h.text) + '</label>' +
        SelectBox('hob-' + h.id, { 'data-map': 'handoverBenefits', 'data-k': h.id, 'aria-label': 'Benefit for item ' + h.id, value: mapv(env, 'handoverBenefits', h.id) }, picked ? 'Benefit B1–B6…' : '—',
          D.BENEFITS.map(function (b) { return { v: b.id, t: b.id.toUpperCase() + ' · ' + b.short }; })) +
        '</div>';
    }).join('');
    return KnowledgeCore() +
      ObjectiveCard(objDef('OBJ-H1'),
        '<div class="handover">' +
        '<div class="handover-head">' +
        '<span class="handover-kicker">' + icon('notebook-pen', 12) + ' shift handover</span>' +
        '<span>Fri 18:00 · SOC Corvus Logistics</span>' +
        '<span class="text-stone-500">8 items · noise included — read critically</span>' +
        '</div><div class="handover-body">' + rows + '</div></div>');
  }

  function Day1(mode) {
    return '<section id="section-day1" class="lab-section">' +
      SectionHead('01', 'Diagnose the floor',
        mode === 'medium' ? 'Read the core, then map the pain to what automation fixes.' : 'The weekend handover is on your desk. Separate signal from noise.',
        SyntheticNote('hidden-sm')) +
      '<div class="space-5">' + (mode === 'medium' ? MediumDay1() : HardDay1()) + '</div></section>';
  }

  /* ======================================================================
     DAY 2
     ====================================================================== */
  function BuilderBoard(title) {
    return '<div class="card"><div class="card-body">' +
      Kicker('Playbook builder · draft on the board') +
      '<h3 class="card-title-lg">' + esc(title) + '</h3></div></div>';
  }

  function MediumDay2() {
    var env = window.LAB_STORE.getState().env;
    var m5trig = D.TRIGGERS.map(function (t) {
      return radioCard('trg-m5', 'triggerPick', t.id, t.text, 'trg-' + t.id);
    }).join('');
    var conns = D.CONNECTORS.map(function (c) {
      var on = env.connectors ? env.connectors[c.id] === true : false;
      return '<div class="connector"><input type="checkbox" id="cn-' + c.id + '" data-map="connectors" data-k="' + c.id + '"' +
        (on ? ' checked' : '') + ' aria-label="Toggle connector: ' + esc(c.text) + '" class="cbx">' +
        '<label class="check-label" for="cn-' + c.id + '"><span class="conn-t">' + esc(c.text) + '</span>' +
        '<span class="conn-why">' + esc(c.why) + '</span></label></div>';
    }).join('');
    return BuilderBoard('Use case #1 — “Phishing-report triage”') +
      ObjectiveCard(objDef('OBJ-M4'),
        ReorderList('phishOrder', D.PHISH_STEPS, env.phishOrder || D.PHISH_INIT) +
        '<p class="reorder-note">Use the arrows to arrange the six steps into the exact execution order.</p>') +
      ObjectiveCard(objDef('OBJ-M5'),
        '<div class="space-4">' +
        '<div><p class="mini-head">' + icon('plug-zap', 14) + ' Trigger — when does this playbook fire?</p>' +
        '<div class="space-2" role="radiogroup" aria-label="Playbook trigger">' + m5trig + '</div></div>' +
        '<div><p class="mini-head">' + icon('cable', 14) + ' Connectors — which systems must be wired in?</p>' +
        '<div class="conn-grid">' + conns + '</div></div></div>');
  }

  function HardDay2() {
    var env = window.LAB_STORE.getState().env;
    var branches = D.CRED_BRANCHES.map(function (b) {
      var key = b.id === 'branchIntel' ? 'branchIntel' : 'branchAccounts';
      return '<div class="branch-box"><p class="row-medium">' + esc(b.q) + '</p>' +
        SelectBox('br-' + b.id, { 'data-key': key, 'aria-label': b.q, value: env[key] || '' }, 'Choose the branch action…',
          b.options.map(function (o) { return { v: o, t: o }; })) + '</div>';
    }).join('');
    return BuilderBoard('Use case #2 — “Credential-stuffing response” (cold open)') +
      ObjectiveCard(objDef('OBJ-H2'),
        '<div class="space-5">' +
        '<div><p class="mini-head">Workflow order — 7 steps, no pointer cards</p>' +
        ReorderList('credOrder', D.CRED_STEPS, env.credOrder || D.CRED_INIT) + '</div>' +
        '<div class="space-3">' + branches + '</div></div>');
  }

  function Day2(mode) {
    return '<section id="section-day2" class="lab-section">' +
      SectionHead('02', 'Build the playbook',
        mode === 'medium' ? 'Encode the phishing-triage use case: order, trigger, connectors.' : 'Engineer the credential-stuffing playbook — order and branches, exact.') +
      '<div class="space-5">' + (mode === 'medium' ? MediumDay2() : HardDay2()) + '</div></section>';
  }

  /* ======================================================================
     DAY 3 — live SOAR run
     ====================================================================== */
  var PRI_CLS = { P1: 'chip-pri-p1', P2: 'chip-pri-p2', P3: 'chip-pri-p3', P4: 'chip-pri-p4' };

  function AlertCard(a, children) {
    return '<div class="alert-card">' +
      '<div class="alert-meta">' +
      '<span class="mono-tag-bold">' + esc(a.id) + '</span>' +
      '<span class="chip chip-sm ' + PRI_CLS[a.pri] + '">' + esc(a.pri) + '</span>' +
      '<span class="chip chip-sm chip-src">' + esc(a.src) + '</span>' +
      (a.mitre !== '—' ? '<span class="chip chip-sm chip-mitre">ATT&amp;CK ' + esc(a.mitre) + '</span>' : '') +
      '</div>' +
      '<p class="alert-title">' + esc(a.title) + '</p>' +
      '<div class="alert-body">' + children + '</div></div>';
  }

  function MediumDay3() {
    var env = window.LAB_STORE.getState().env;
    var alerts = D.ALERTS.map(function (a) {
      var val = mapv(env, 'dispositions', a.id);
      var opts = D.DISPOSITIONS.map(function (d) {
        return radioCard('disp-' + a.id, 'map:dispositions:' + a.id, d.id, d.text, a.id + '-' + d.id, true);
      }).join('');
      return AlertCard(a, '<div class="radio-grid-2" role="radiogroup" aria-label="Disposition for alert ' + a.id + '">' + opts + '</div>');
    }).join('');

    var soar = '<div class="card card-zinc" id="soar-control"><div class="card-body space-4">' +
      '<div class="soar-head">' +
      '<div>' + Kicker('Operations floor · automation control') +
      '<h3 class="card-title-lg soar-title">' + icon('zap', 20, 'ic-amber-500') + ' Phish-triage automation</h3></div>' +
      '<div class="soar-ctl">' +
      '<span class="soar-flag soar-flag-ok" data-soar-flag="ok"' + (canEnable() ? '' : ' hidden') + '>' + icon('check-check', 14) + ' queue cleared to enable</span>' +
      '<span class="soar-flag" data-soar-flag="lock"' + (canEnable() ? ' hidden' : '') + '>' + icon('lock', 14) + ' finish the manual shift first</span>' +
      '<button type="button" class="switch" role="switch" id="soar-switch" aria-checked="' + (env.soarOn === true) + '"' +
      ' aria-label="Enable phish-triage automation" data-action="run-toggle"' +
      ((env.soarOn !== true) && !canEnable() ? ' disabled' : '') + (env.runDone === true ? ' disabled' : '') + '><span class="switch-knob"></span></button>' +
      '<span class="soar-status" data-soar-status>' + (env.soarOn ? (env.runDone ? 'RUN COMPLETE' : 'RUNNING…') : 'OFF') + '</span>' +
      '</div></div>' +
      LogFeed('soar-feed', env.soarOn ? D.RUN_SCRIPT.slice(0, (env.runStep === undefined ? -1 : env.runStep) + 1) : [],
        'playbook run log — phish-triage v1',
        canEnable() ? 'Automation armed. Flip the switch to run 12 queued reports through the playbook.' : 'Offline. Work the manual shift above — then the floor is yours to automate.') +
      '<div class="receipt-grid" data-receipt' + (env.runDone === true ? '' : ' hidden') + '>' +
      '<div class="receipt receipt-manual"><p class="receipt-k">Yesterday · manual</p><p class="receipt-v">5 alerts ≈ 12 analyst-minutes</p></div>' +
      '<div class="receipt receipt-auto"><p class="receipt-k">Today · automated</p><p class="receipt-v">12 reports · 10 auto-closed · 28 s</p></div>' +
      '</div>' +
      '</div></div>';

    var escs = D.ESCALATIONS.map(function (e, i) {
      var key = i === 0 ? 'esc1' : 'esc2';
      var val = env[key] || '';
      var opts = e.options.map(function (o) {
        return radioCard('esc-' + e.id, key, o.id, o.text, e.id + '-' + o.id, true);
      }).join('');
      return '<div class="esc-card"><p class="esc-k">Escalated to your tray · ' + esc(e.id) + '</p>' +
        '<p class="esc-t">' + esc(e.title) + '</p>' +
        '<div class="space-15" role="radiogroup" aria-label="Decision for ' + e.id + '">' + opts + '</div></div>';
    }).join('');

    return ObjectiveCard(objDef('OBJ-M6'), '<div class="space-25">' + alerts + '</div>') +
      soar +
      ObjectiveCard(objDef('OBJ-M7'),
        '<div class="input-grid">' +
        '<div><label class="input-label" for="auto-count">Auto-closed with zero human touch</label>' +
        '<input class="input" id="auto-count" inputmode="numeric" placeholder="e.g. 7" data-key="autoCount" value="' + esc(env.autoCount || '') + '"' + (env.runDone !== true ? ' disabled' : '') + '></div>' +
        '<div><label class="input-label" for="auto-time">Time of FIRST auto-close (log timestamp)</label>' +
        '<input class="input input-mono" id="auto-time" placeholder="hh:mm:ss" data-key="autoTime" value="' + esc(env.autoTime || '') + '"' + (env.runDone !== true ? ' disabled' : '') + '></div>' +
        '</div>',
        { disabled: env.runDone !== true, disabledNote: 'The receipt prints after the automation run completes.' }) +
      ObjectiveCard(objDef('OBJ-M8'), '<div class="space-3">' + escs + '</div>',
        { disabled: env.runDone !== true, disabledNote: 'Escalations appear once the automation has run.' });
  }

  function canEnable() {
    var env = window.LAB_STORE.getState().env;
    return D.ALERTS.every(function (a) { return (mapv(env, 'dispositions', a.id)) !== ''; });
  }

  function HardDay3() {
    var env = window.LAB_STORE.getState().env;
    var qs = D.TIMELINE_QS.map(function (q, qi) {
      var cur = env[q.id];
      return '<div class="branch-box"><p class="row-medium"><span class="mono-tag">' + String.fromCharCode(97 + qi) + ')</span> ' + esc(q.q) + '</p>' +
        SelectBox('tl-' + q.id, { 'data-key': q.id, 'aria-label': q.q, value: cur === undefined ? '' : String(cur) }, 'Choose your finding…',
          q.options.map(function (o, i) { return { v: String(i), t: o }; })) + '</div>';
    }).join('');
    var fp = D.FP_ALERTS.map(function (a) {
      return '<div class="classify-row"><p class="row-txt"><span class="mono-tag-bold">' + esc(a.id) + '</span>' + esc(a.text) + '</p>' +
        duoToggle('fpLabels', a.id, 'TP', 'FP', 'Label alert ' + a.id, 'Label alert ' + a.id,
          mapv(env, 'fpLabels', a.id), true) + '</div>';
    }).join('');
    return ObjectiveCard(objDef('OBJ-H3'),
      LogFeed('timeline-feed', D.TIMELINE, 'overnight transcript — naive playbook v0 (02:01–07:30)', '—') +
      '<div class="space-3">' + qs + '</div>') +
      ObjectiveCard(objDef('OBJ-H5'),
        '<div class="space-25">' + fp +
        '<div class="human-box"><p class="human-t">' + icon('radio', 16) + ' Exactly ONE alert must always go to human review instead of automated handling. Which?</p>' +
        SelectBox('esc-pick', { 'data-key': 'escPick', 'aria-label': 'Alert requiring human review', value: env.escPick || '' }, 'Pick the alert ID…',
          D.FP_ALERTS.map(function (a) { return { v: a.id, t: a.id + ' · ' + a.text.slice(0, 48) + '…' }; })) + '</div></div>');
  }

  function Day3(mode) {
    return '<section id="section-day3" class="lab-section">' +
      SectionHead('03', 'Run the floor',
        mode === 'medium' ? 'Work the queue by hand — then flip the switch and watch the machine work.' : 'An autopsy of a naive run, then six live calls with no safety net.') +
      '<div class="space-5">' + (mode === 'medium' ? MediumDay3() : HardDay3()) + '</div>' +
      '<p class="day3-foot">floor log simulated · Power icon armed by you</p></section>';
  }

  /* ======================================================================
     DAY 4 — continuous compliance + night watch (medium) / tuning (hard)
     ====================================================================== */
  function ComplianceGrid() {
    var env = window.LAB_STORE.getState().env;
    var ran = env.compRun === true;
    var table = '';
    if (ran) {
      var head = D.CONTROLS.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('');
      var rows = D.HOSTS.map(function (h) {
        var tds = h.checks.map(function (ok, i) {
          return ok
            ? '<td>' + icon('check-circle-2', 16, 'ic-emerald-600') + '<span class="sr-only">' + esc(D.CONTROLS[i] + ' pass') + '</span></td>'
            : '<td>' + icon('x-circle', 16, 'ic-rose-600') + '<span class="sr-only">' + esc(D.CONTROLS[i] + ' FAIL') + '</span></td>';
        }).join('');
        return '<tr class="' + (h.host === 'WH-KS-07' ? 'row-fail' : '') + '">' +
          '<th scope="row" class="mono-cell">' + esc(h.host) + '</th>' + tds + '</tr>';
      }).join('');
      table = '<div class="table-wrap comp-table fade-in"><table class="table"><caption class="sr-only">Automated control check results per host</caption>' +
        '<thead><tr class="table-head"><th scope="col">Host</th>' + head + '</tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '<p class="table-foot">machine evidence saved · next scheduled check in 60 min · this scan is what auditors receive</p>';
    }
    return '<div class="card"><div class="card-body space-4">' +
      '<div>' + Kicker('Continuous control checks · fleet scan') + '<h3 class="card-title-lg">Compliance surface</h3></div>' +
      '<button type="button" class="btn btn-primary btn-zinc" data-action="comp-run"' + (ran ? ' disabled' : '') +
      ' aria-label="Run automated control checks">' + icon('scan-line', 16) + ' <span data-comp-run-label>' + (ran ? 'CHECKS COMPLETE' : 'RUN AUTOMATED CONTROL CHECKS') + '</span></button>' +
      '<div data-comp-table>' + table + '</div>' +
      '</div></div>';
  }

  function MediumDay4() {
    var env = window.LAB_STORE.getState().env;
    var watchLive = env.watchStarted === true;
    var anomaly = env.anomalyVisible === true;
    var watchLines = watchLive ? D.WATCH_LINES.slice(0, anomaly ? 4 : 3) : [];

    var hosts = SelectBox('comp-host', { 'data-key': 'compHost', 'aria-label': 'Failing host', value: env.compHost || '' }, 'Pick host…',
      D.HOSTS.map(function (h) { return { v: h.host, t: h.host }; }));
    var ctrls = SelectBox('comp-ctrl', { 'data-key': 'compControl', 'aria-label': 'Failing control', value: env.compControl || '' }, 'Pick control…',
      D.CONTROLS.map(function (c) { return { v: c, t: c }; }));
    var pris = D.PRIORITIES.map(function (p) {
      return radioCard('pri-m9', 'compPriority', p.id, p.text, 'pri-' + p.id);
    }).join('');

    var routes = D.ANOMALY_ROUTES.map(function (r) {
      return radioCard('rt-m10', 'anomalyRoute', r.id, r.text, 'rt-' + r.id, true);
    }).join('');

    var anomalyCard = '<div class="siren-box pop-in" role="alert" data-anomaly' + (anomaly ? '' : ' hidden') + '>' +
      '<p class="siren-t">' + icon('siren', 20) + ' REAL-TIME ALERT · 03:12 · FIN-DB-01</p>' +
      '<p class="siren-d">Outbound transfer of <strong>4.2 GB</strong> to a first-seen foreign ASN. Automation detected it in real time — it needs a human decision now.</p>' +
      '<div class="siren-actions"><button type="button" class="btn btn-outline btn-rose" data-action="ack"' + (env.anomalyAck === true ? ' disabled' : '') + '>' +
      icon('alert-triangle', 16) + ' <span data-ack-label>' + (env.anomalyAck ? 'ACKNOWLEDGED ✓' : 'ACKNOWLEDGE') + '</span></button></div>' +
      '<div class="siren-route"><p class="route-head">Route this alert</p>' +
      '<div class="space-15" role="radiogroup" aria-label="Alert routing">' + routes + '</div></div></div>';

    return ComplianceGrid() +
      ObjectiveCard(objDef('OBJ-M9'),
        '<div class="input-grid">' +
        '<div><p class="input-label">Failing host</p>' + hosts + '</div>' +
        '<div><p class="input-label">Failing control</p>' + ctrls + '</div></div>' +
        '<div><p class="input-label">Ticket priority (SLA)</p>' +
        '<div class="radio-grid-2" role="radiogroup" aria-label="Ticket priority">' + pris + '</div></div>' +
        '<div class="ticket-row">' +
        '<button type="button" class="btn btn-primary btn-teal" data-action="open-ticket"' +
        (!(env.compHost && env.compControl && env.compPriority) || env.ticketOpened === true ? ' disabled' : '') + '>' +
        icon('file-check-2', 16) + ' <span data-ticket-label>' + (env.ticketOpened ? 'TICKET OPENED ✓' : 'OPEN REMEDIATION TICKET') + '</span></button>' +
        '<span class="pill pill-pass" data-ticket-badge' + (env.ticketOpened === true ? '' : ' hidden') + '>Ticket RM-0412 filed · audit evidence attached automatically</span>' +
        '</div>',
        { disabled: env.compRun !== true, disabledNote: 'Run the automated control checks first — the gap will surface itself.' }) +
      ObjectiveCard(objDef('OBJ-M10'),
        '<div class="space-3">' +
        '<button type="button" class="btn btn-primary btn-zinc" data-action="start-watch"' + (watchLive ? ' disabled' : '') +
        ' aria-label="Start simulated overnight watch">' + icon('bell-ring', 16) + ' <span data-watch-label>' +
        (watchLive ? 'WATCH LIVE — 22:00 → 06:00' : 'START SIMULATED 22:00 WATCH') + '</span></button>' +
        '<div data-watch-feed>' + (watchLive ? LogFeed('watch-feed', watchLines, 'continuous monitoring feed — overnight', '—') : '') + '</div>' +
        anomalyCard +
        '</div>');
  }

  function HardDay4() {
    var env = window.LAB_STORE.getState().env;
    var tiles = [
      { k: 'FP rate (auto-close)', v: '34 %' }, { k: 'Analyst re-opens', v: '31 %' },
      { k: 'Avg close time', v: '22 s' }, { k: 'SLA met', v: '91 %' },
    ].map(function (s) {
      return '<div class="stat-tile"><p class="stat-v">' + esc(s.v) + '</p><p class="stat-k">' + esc(s.k) + '</p></div>';
    }).join('');
    var fixes = D.TUNE_FIX_OPTIONS.map(function (o) {
      return radioCard('tf-h4', 'tuneFix', o.id, o.text, 'tf-' + o.id, true);
    }).join('');
    var preds = D.TUNE_PREDICT_OPTIONS.map(function (o) {
      return radioCard('tp-h4', 'tunePredict', o.id, o.text, 'tp-' + o.id, true);
    }).join('');
    var evid = D.EVIDENCE.map(function (e) {
      var picked = arr(env, 'evidencePicks').indexOf(e.id) !== -1;
      return checkRow('ev-' + e.id, 'evidencePicks', e.id, e.text, picked, 'Select evidence: ' + e.text);
    }).join('');
    var slaOrder = ReorderList('slaOrder', D.SLA_TICKETS.map(function (t) { return { id: t.id, text: t.text }; }),
      env.slaOrder || D.SLA_TICKETS.map(function (t) { return t.id; }));
    var assigns = D.SLA_TICKETS.map(function (t) {
      return '<div class="classify-row"><p class="row-txt">' + esc(t.text) + '</p>' +
        SelectBox('sla-' + t.id, { 'data-map': 'slaAssign', 'data-k': t.id, 'aria-label': 'Assignment for ' + t.id, value: mapv(env, 'slaAssign', t.id) }, 'Assign…',
          [{ v: 'auto', t: 'Automation (playbook)' }, { v: 'manual', t: 'Manual escalation' }]) + '</div>';
    }).join('');
    return ObjectiveCard(objDef('OBJ-H4'),
      '<div class="stat-grid">' + tiles + '</div>' +
      '<div class="space-3">' +
      '<div class="branch-box"><p class="row-medium">Choose the tuning change:</p>' +
      '<div class="space-15" role="radiogroup" aria-label="Tuning change">' + fixes + '</div></div>' +
      '<div class="branch-box"><p class="row-medium">Predict the outcome:</p>' +
      '<div class="space-15" role="radiogroup" aria-label="Predicted outcome">' + preds + '</div></div></div>') +
      ObjectiveCard(objDef('OBJ-H6'),
        '<div class="space-2"><p class="row-medium">Auditor demand: <em>“Prove EDR coverage ≥ 98 % and privileged-account MFA were enforced continuously last quarter.”</em></p>' +
        evid + '</div>') +
      ObjectiveCard(objDef('OBJ-H7'),
        '<div class="space-4">' +
        '<div><p class="mini-head">Handling order — arrows to sequence</p>' + slaOrder + '</div>' +
        '<div class="space-2"><p class="mini-head">Assignment — automation or manual</p>' + assigns + '</div></div>');
  }

  function Day4(mode) {
    return '<section id="section-day4" class="lab-section">' +
      SectionHead('04', 'Prove it',
        mode === 'medium' ? 'Continuous checks, a real catch, and the proof for auditors.' : 'Tune the machine, defend the evidence, beat the clocks.') +
      '<div class="space-5">' + (mode === 'medium' ? MediumDay4() : HardDay4()) + '</div></section>';
  }

  /* ======================================================================
     DAY 5 — leadership reporting
     ====================================================================== */
  function DashboardBoard() {
    var rows = D.METRICS.map(function (m) {
      var trend;
      if (m.id === 'coffee') trend = '<span class="trend-ic">' + icon('minus', 16, 'ic-stone-300') + '<span class="sr-only">no change</span></span>';
      else if (m.before !== m.after) {
        trend = m.good === 'down'
          ? '<span class="trend-ic">' + icon('arrow-down-right', 16, 'ic-emerald-600') + '<span class="sr-only">improved downward</span></span>'
          : '<span class="trend-ic">' + icon('arrow-up-right', 16, 'ic-emerald-600') + '<span class="sr-only">improved upward</span></span>';
      } else trend = '<span class="trend-ic">' + icon('minus', 16, 'ic-stone-300') + '<span class="sr-only">no change</span></span>';
      return '<tr class="' + (m.id === 'coffee' ? 'row-muted' : '') + '">' +
        '<th scope="row">' + esc(m.label) + '</th>' +
        '<td class="mono-cell-muted">' + esc(m.before) + '</td>' +
        '<td class="mono-cell-strong">' + esc(m.after) + '</td>' +
        '<td>' + trend + '</td></tr>';
    }).join('');
    return '<div class="card"><div class="card-body">' +
      Kicker('Executive dashboard · 30-day window · automation ON') +
      '<h3 class="card-title-lg">Before → after</h3>' +
      '<div class="table-wrap"><table class="table"><caption class="sr-only">Security operations metrics before and after automation</caption>' +
      '<thead><tr class="table-head"><th scope="col">Metric</th><th scope="col">Before</th><th scope="col">Now</th><th scope="col">Trend</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div></div>';
  }

  function MediumDay5() {
    var env = window.LAB_STORE.getState().env;
    var kpis = D.METRICS.map(function (m) {
      var sel = arr(env, 'kpiPicks').indexOf(m.id) !== -1;
      return '<button type="button" class="kpi-card' + (sel ? ' kpi-on' : '') + '" aria-pressed="' + sel + '"' +
        ' data-action="kpi" data-k="' + m.id + '"><span class="kpi-id">' + esc(m.id) + '</span>' + esc(m.label) + '</button>';
    }).join('');
    var budget = D.BUDGET_OPTIONS.map(function (o) {
      return radioCard('bd-m12', 'budgetPick', o.id, o.text, 'bd-' + o.id);
    }).join('');
    var cites = D.BUDGET_CITES.map(function (c) {
      var picked = arr(env, 'budgetCites').indexOf(c.id) !== -1;
      return checkRow('bc-' + c.id, 'budgetCites', c.id, c.text, picked, 'Cite: ' + c.text);
    }).join('');
    return DashboardBoard() +
      ObjectiveCard(objDef('OBJ-M11'),
        '<div class="space-4">' +
        '<div class="input-grid">' +
        '<div><label class="input-label" for="mttd-in">Current MTTD (minutes)</label>' +
        '<input class="input input-mono" id="mttd-in" inputmode="numeric" placeholder="e.g. 90" data-key="mttdIn" value="' + esc(env.mttdIn || '') + '"></div>' +
        '<div><label class="input-label" for="mttr-in">Current MTTR (e.g. “9h 40m”)</label>' +
        '<input class="input input-mono" id="mttr-in" placeholder="hh hm / h:mm" data-key="mttrIn" value="' + esc(env.mttrIn || '') + '"></div></div>' +
        '<div><p class="mini-head">The VP asks: “are we responding faster?” — pick the 3 KPI cards that answer it</p>' +
        '<div class="kpi-grid">' + kpis + '</div></div></div>') +
      ObjectiveCard(objDef('OBJ-M12'),
        '<div class="space-4">' +
        '<div class="vp-box"><p class="vp-t">VP of Engineering, budget call, Friday 16:00:</p>' +
        '<p class="vp-d">“We can fund ONE path next quarter. The sprint data is on the dashboard above. What do you recommend — and show me the numbers behind it.”</p></div>' +
        '<div class="space-15" role="radiogroup" aria-label="Budget recommendation">' + budget + '</div>' +
        '<div><p class="mini-head">Justify it — tick every data point that supports your recommendation</p>' +
        '<div class="space-2">' + cites + '</div></div></div>');
  }

  function HardDay5() {
    var env = window.LAB_STORE.getState().env;
    var tiles = [
      { k: 'MTTD', v: '58 m', tone: 'good' }, { k: 'MTTR', v: '9 h 40', tone: 'good' },
      { k: 'Coverage', v: '40 %', tone: 'warn' }, { k: 'Over-alerting KRI', v: '+31 %', tone: 'bad' },
      { k: 'FP rate', v: '19 %', tone: 'warn' },
    ].map(function (s) {
      return '<div class="stat-tile stat-dark"><p class="stat-v stat-v-' + s.tone + '">' + esc(s.v) + '</p>' +
        '<p class="stat-k">' + esc(s.k) + '</p></div>';
    }).join('');
    var strategy = D.STRATEGY_OPTIONS.map(function (o) {
      return radioCard('st-h8', 'strategyPick', o.id, o.text, 'st-' + o.id);
    }).join('');
    var cites = D.STRATEGY_CITES.map(function (c) {
      var picked = arr(env, 'strategyCites').indexOf(c.id) !== -1;
      return checkRow('sc-' + c.id, 'strategyCites', c.id, c.text, picked, 'Cite: ' + c.text);
    }).join('');
    var notes = D.ADVERSARY_NOTES.map(function (n, i) {
      return '<li class="adv-note"><span class="adv-n">note-' + String(i + 1).padStart(2, '0') + '</span> · ' + esc(n) + '</li>';
    }).join('');
    var counters = D.COUNTERS.map(function (c) {
      var picked = arr(env, 'counterPicks').indexOf(c.id) !== -1;
      return checkRow('ct-' + c.id, 'counterPicks', c.id, c.text, picked, 'Countermeasure: ' + c.text);
    }).join('');
    return '<div class="card card-zinc"><div class="card-body">' +
      Kicker('Board pack · quarterly review') +
      '<h3 class="card-title-lg title-white">The metric set the board will judge you on</h3>' +
      '<div class="stat-grid stat-grid-5">' + tiles + '</div></div></div>' +
      ObjectiveCard(objDef('OBJ-H8'),
        '<div class="space-4">' +
        '<div class="space-15" role="radiogroup" aria-label="Strategic recommendation">' + strategy + '</div>' +
        '<div><p class="mini-head">Justify with data — tick every supporting data point</p>' +
        '<div class="space-2">' + cites + '</div></div></div>') +
      ObjectiveCard(objDef('OBJ-H9'),
        '<div class="space-4">' +
        '<div class="redteam-box"><p class="redteam-t">' + icon('bug', 16) + ' Red-team review · defensive exercise — how an adversary reads your automation</p>' +
        '<ul class="adv-list">' + notes + '</ul></div>' +
        '<div><p class="mini-head">' + icon('target', 14) + ' Select the TWO hardening moves that counter them — and nothing that over-automates</p>' +
        '<div class="space-2">' + counters + '</div></div>' +
        '<span class="pill pill-outline-mono">defensive framing only · adversary notes are fictional</span></div>');
  }

  function Day5(mode) {
    return '<section id="section-day5" class="lab-section">' +
      SectionHead('05', 'Report to leadership',
        mode === 'medium' ? 'Turn the sprint into numbers the VP can fund.' : 'One recommendation for the board — then think like the adversary.') +
      '<div class="space-5">' + (mode === 'medium' ? MediumDay5() : HardDay5()) + '</div></section>';
  }

  /* ======================================================================
     QUIZ (C5)
     ====================================================================== */
  function QuizSection() {
    var st = window.LAB_STORE.getState();
    var der = window.LAB_STORE.get();
    var quiz = der.quiz;
    var answered = quiz.filter(function (q) { return st.quiz[q.id]; }).length;
    var correct = quiz.filter(function (q) { return st.quiz[q.id] && st.quiz[q.id].correct; }).length;
    var cards = quiz.map(function (q, qi) {
      var ans = st.quiz[q.id];
      var locked = !!ans;
      var opts = q.options.map(function (o, oi) {
        var isPicked = ans && ans.pick === oi;
        var isCorrect = oi === q.correct;
        var cls = 'radio-card quiz-opt' +
          (!locked ? '' : isCorrect ? ' quiz-correct' : isPicked ? ' quiz-wrong' : ' quiz-dim');
        return '<label class="' + cls + '" for="' + q.id + '-' + oi + '">' +
          '<input class="sr-only" type="radio" name="quiz-' + q.id + '" value="' + oi + '" id="' + q.id + '-' + oi + '"' +
          ' data-quiz="' + q.id + '" data-pick="' + oi + '"' + (locked ? ' disabled' : '') + (ans && ans.pick === oi ? ' checked' : '') + '>' +
          '<span class="radio-card-txt">' + esc(o) + '</span>' +
          (locked && isCorrect ? icon('check-circle-2', 16, 'ic-emerald-600') : '') +
          (locked && isPicked && !isCorrect ? icon('x-circle', 16, 'ic-rose-600') : '') +
          '</label>';
      }).join('');
      return '<div class="card quiz-card' + (locked ? (ans.correct ? ' quiz-card-ok' : ' quiz-card-miss') : '') + '" data-quiz-card="' + q.id + '">' +
        '<div class="card-body space-25">' +
        Kicker('Question ' + (qi + 1) + ' of ' + quiz.length) +
        '<h3 class="quiz-q">' + icon('help-circle', 16) + ' ' + esc(q.q) + '</h3>' +
        '<div class="space-15" role="radiogroup" aria-label="' + esc(q.q) + '">' + opts + '</div>' +
        '<div class="' + (ans ? (ans.correct ? 'quiz-expl quiz-expl-ok' : 'quiz-expl quiz-expl-no') : 'quiz-expl') + '" data-quiz-expl' + (ans ? '' : ' hidden') + '>' +
        '<p class="' + (ans && ans.correct ? 'quiz-expl-t-ok' : 'quiz-expl-t-no') + '">' +
        (ans ? (ans.correct ? 'Correct — here is why it matters' : 'Not this one — here is the lesson') : '') + '</p>' +
        '<p class="quiz-expl-d">' + (ans ? esc(q.expl) : '') + '</p></div>' +
        '</div></div>';
    }).join('');
    return '<section id="section-quiz" class="lab-section">' +
      SectionHead('06', 'Knowledge check',
        'Every answer explains itself — the point is the why, not the checkmark.',
        '<span class="pill pill-outline-mono" data-quiz-badge>' + answered + '/' + quiz.length + ' answered · ' + correct + ' correct · score ' + der.score + '/100</span>') +
      '<div class="space-4">' + cards + '</div></section>';
  }

  /* ======================================================================
     DEBRIEF (C6)
     ====================================================================== */
  var DEBRIEF_SOURCES = [
    ['Email gateway logs', 'reports, gateway tags, quarantine actions — the phish-triage trigger'],
    ['Sandbox verdicts', 'attachment/URL detonation results — the score gate'],
    ['Reputation feeds', 'sender/URL/IP standing — corroboration for auto-decisions'],
    ['Identity / IdP logs', 'sign-ins, MFA events, impossible-travel context'],
    ['EDR telemetry', 'tool hashes, agent health — feeds control checks and response'],
    ['NetFlow / proxy logs', 'volume anomalies like the 03:12 exfil pattern'],
  ];
  var DEBRIEF_CONTROLS = [
    ['Automate the mundane first', 'Start with high-volume, low-judgment work (verified-benign closings, evidence collection). Human-in-the-loop stays on ambiguous and high-stakes actions.', 'CySA+ CS0-003 · security operations &amp; automation'],
    ['Gate every consequential action', 'Auto-close and quarantine only after a verdict gate (sandbox + reputation majority). Never act on raw report volume alone.', 'playbook engineering discipline'],
    ['Measure like a leader', 'Report MTTD/MTTR/SLA trends plus KRIs (over-alerting, FP rate) — performance and risk together, or the story is half-told.', 'reporting &amp; communication domain'],
    ['Tune on a cadence', 'FP rate and re-open rate get a weekly review; every tuning change is itself logged and auditable.', 'continuous improvement loop'],
    ['Prove compliance continuously', 'Control checks run on schedule; logs, signed snapshots and remediation tickets are the audit evidence — produced as a by-product.', 'compliance automation'],
  ];
  var DEBRIEF_SPL = '# example detection logic (simplified, pseudo-SPL)\nindex=mail event=phish-report\n| stats count(report_id) as reports by sender, url\n| lookup reputation url OUTPUT verdict, engines_hit\n| where reports >= 3 OR verdict = "unknown"\n| sendalert → playbook phish-triage';

  function Debrief() {
    var src = DEBRIEF_SOURCES.map(function (s) {
      return '<li class="src-row"><span class="pill pill-outline-mono">' + esc(s[0]) + '</span><span class="src-why">' + esc(s[1]) + '</span></li>';
    }).join('');
    var ctrls = DEBRIEF_CONTROLS.map(function (c, i) {
      return '<li class="ctrl-box"><p class="ctrl-t">' + (i + 1) + '. ' + c[0] + '</p>' +
        '<p class="ctrl-d">' + esc(c[1]) + '</p><p class="ctrl-m">maps to · ' + c[2] + '</p></li>';
    }).join('');
    return '<section id="section-debrief" class="lab-section">' +
      SectionHead('07', 'Debrief · field notes', 'What to instrument, what to control, what to remember.') +
      '<div class="card"><div class="card-body">' +
      Kicker('Synthesis') + '<h3 class="card-title-lg">From sprint to program</h3>' +
      '<div class="acc">' +
      accItem('db-1', true, 'Instrument for detection — data sources this program leans on',
        '<ul class="space-2">' + src + '</ul>' +
        '<pre class="spl lab-scroll"><code>' + esc(DEBRIEF_SPL) + '</code></pre>' +
        '<p class="acc-foot">simplified for training — production logic needs tuning and peer review</p>') +
      accItem('db-2', false, 'Control recommendations — with the frameworks they map to',
        '<ol class="space-3">' + ctrls + '</ol>') +
      accItem('db-3', false, 'Blue-team takeaways',
        '<ul class="dotlist">' +
        '<li>Automation is a <strong>capacity multiplier, not a strategy</strong>: it absorbs volume so humans can hunt, analyze and improve detections.</li>' +
        '<li>Every auto-action needs a <strong>verdict gate and an audit trail</strong> — the naive-run autopsy is what happens without one.</li>' +
        '<li>Track <strong>both</strong> KPIs (MTTD, MTTR, SLA) and KRIs (FP rate, over-alerting); a program that only shows wins is hiding its tuning debt.</li>' +
        '<li>Human-in-the-loop is a <strong>design feature</strong>: ambiguity (5/10 sandbox) and high stakes (exfil-sized transfers) always route to people.</li>' +
        '<li>Compliance evidence should be a <strong>by-product</strong> of continuous checks, not a two-week pre-audit scramble.</li>' +
        '</ul>') +
      accItem('db-4', false, 'Red-team mindset (defensive exercise)',
        '<ul class="dotlist">' +
        '<li>Automations are <strong>predictable</strong>: fixed thresholds and on-the-hour reviews let adversaries operate low-and-slow or time their actions. Counter with baseline tuning, randomized sampling and scheduled hunts.</li>' +
        '<li>Attackers <strong>blend into noise</strong>: a phish timed like the 09:00 newsletter wave rides the auto-close current. Verdict gates and volume anomalies break the camouflage.</li>' +
        '<li>Every automation exposes its <strong>trust boundary</strong>: whatever the machine does without a human is the adversary&#39;s cheapest probe surface — study it exactly like that.</li>' +
        '</ul>' +
        '<p class="acc-foot">defensive framing only — used here to harden the SOC, never to attack one</p>') +
      accItem('db-5', false, 'Official references (open in a new tab)',
        '<ul class="reflist">' +
        '<li><a class="reflink" href="https://www.comptia.org/certifications/cybersecurity-analyst" target="_blank" rel="noopener noreferrer">CompTIA CySA+ (CS0-003) — official exam page ↗</a><span class="refwhy">this lab supports the security-automation and reporting concepts</span></li>' +
        '<li><a class="reflink" href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer">MITRE ATT&amp;CK® — adversary techniques &amp; detections ↗</a><span class="refwhy">what your playbooks respond to</span></li>' +
        '<li><a class="reflink" href="https://attack.mitre.org/techniques/T1566/" target="_blank" rel="noopener noreferrer">ATT&amp;CK T1566 — Phishing ↗</a><span class="refwhy">the floor&#39;s #1 auto-triaged technique</span></li>' +
        '<li><a class="reflink" href="https://attack.mitre.org/techniques/T1003/" target="_blank" rel="noopener noreferrer">ATT&amp;CK T1003 — OS Credential Dumping ↗</a><span class="refwhy">contain-first alert from Day 3</span></li>' +
        '<li><a class="reflink" href="https://attack.mitre.org/techniques/T1110/" target="_blank" rel="noopener noreferrer">ATT&amp;CK T1110 — Brute Force ↗</a><span class="refwhy">credential-stuffing playbook context</span></li>' +
        '<li><a class="reflink" href="https://attack.mitre.org/techniques/T1078/" target="_blank" rel="noopener noreferrer">ATT&amp;CK T1078 — Valid Accounts ↗</a><span class="refwhy">impossible-travel context</span></li>' +
        '</ul>') +
      '</div></div></div></section>';
  }

  function accItem(id, open, title, body) {
    return '<details class="acc-item"' + (open ? ' open' : '') + '>' +
      '<summary class="acc-trigger">' + title + '<span class="acc-chevron" aria-hidden="true">' + icon('chevron-down', 16) + '</span></summary>' +
      '<div class="acc-content">' + body + '</div></details>';
  }

  /* ======================================================================
     Finish line + end marker
     ====================================================================== */
  function FinishLine() {
    return '<section id="section-finish" aria-label="Finish line">' +
      '<div class="finish-box" data-finish>' + finishInner() + '</div></section>';
  }

  function finishInner() {
    var der = window.LAB_STORE.get();
    var st = window.LAB_STORE.getState();
    if (der.allDone) {
      return '<p class="finish-kicker finish-kicker-done">' + icon('flag', 16) + ' finish line</p>' +
        '<div class="finish-row">' +
        '<div><p class="finish-title finish-title-done">Every objective passed — the floor is modernized.</p>' +
        '<p class="finish-sub finish-sub-done">Claim your score, stars and mastery recap.</p></div>' +
        '<button type="button" class="btn btn-primary btn-emerald" data-action="open-results">' + icon('flag', 16) + ' Claim sprint results</button></div>';
    }
    var remaining = der.totalCount - der.doneCount;
    var next = null;
    for (var i = 0; i < der.objectives.length; i++) {
      var o = der.objectives[i];
      if (!(st.obj[o.id] && st.obj[o.id].done)) { next = o; break; }
    }
    return '<p class="finish-kicker">' + icon('flag', 16) + ' finish line</p>' +
      '<div class="finish-row">' +
      '<div><p class="finish-title">' + remaining + ' objective' + (remaining === 1 ? '' : 's') + ' between you and the brief.</p>' +
      '<p class="finish-sub">The tracker on the right (or the round button on mobile) shows what is left.</p></div>' +
      (next ? '<button type="button" class="btn btn-primary btn-amber" data-action="jump" data-obj="' + next.id + '">Jump to ' + next.id + ' ' + icon('arrow-right', 16) + '</button>' : '') +
      '</div>';
  }

  /* ======================================================================
     Objectives tracker — desktop rail + mobile sheet (C4)
     ====================================================================== */
  function ObjectiveList(onNavigateAttr) {
    var st = window.LAB_STORE.getState();
    var der = window.LAB_STORE.get();
    return '<ol class="objlist">' + der.objectives.map(function (o) {
      var os = st.obj[o.id];
      var done = !!(os && os.done);
      return '<li><button type="button" class="objlist-item' + (done ? ' objlist-done' : '') + '"' +
        ' data-action="jump" data-obj="' + o.id + '"' + (onNavigateAttr || '') +
        ' aria-label="' + o.id + ': ' + esc(o.title) + (done ? ' — passed' : '') + '">' +
        (done ? icon('check-circle-2', 16, 'ic-emerald-600 objcheck')
              : icon('circle', 16, 'ic-stone-300 objcheck')) +
        '<span class="objlist-txt">' +
        '<span class="objlist-id">' + o.id + '</span>' +
        '<span class="objlist-title' + (done ? ' objlist-title-done' : '') + '">' + esc(o.title) + '</span>' +
        '<span class="objlist-pill">' + PillarBadge(o.pillar) + '</span>' +
        '</span>' +
        icon('chevron-right', 14, 'ic-stone-300') +
        '</button></li>';
    }).join('') + '</ol>';
  }

  function ObjectivesRail() {
    var der = window.LAB_STORE.get();
    return '<aside class="rail hidden-lg-down" aria-label="Objectives tracker">' +
      '<div class="rail-sticky">' +
      '<div class="rail-count card-zinc-inner">' +
      '<p class="rail-kicker">Objectives tracker</p>' +
      '<div class="rail-nums"><p class="rail-count-big"><span data-rail-done>' + der.doneCount + '</span><span class="rail-count-sub">/' + der.totalCount + '</span></p>' +
      '<p class="rail-score">score <span data-rail-score>' + der.score + '</span>/100</p></div>' +
      '<span class="pill pill-emerald-ghost rail-alldone" data-rail-alldone' + (der.allDone ? '' : ' hidden') + '>All objectives passed — run the debrief &amp; claim results</span>' +
      '</div>' +
      '<div class="rail-list lab-scroll" data-rail-list>' + ObjectiveList('') + '</div>' +
      '</div></aside>';
  }

  function ObjectivesMobile() {
    var der = window.LAB_STORE.get();
    return '<div class="mob-fab-wrap hidden-lg-up">' +
      '<button type="button" class="mob-fab" data-action="toggle-sheet" aria-haspopup="dialog"' +
      ' aria-label="Open objectives tracker, ' + der.doneCount + ' of ' + der.totalCount + ' done"' +
      ' aria-expanded="false" data-fab>' +
      icon('list-checks', 16, 'ic-amber') +
      '<span class="fab-count" data-fab-count>' + der.doneCount + '/' + der.totalCount + '</span></button>' +
      '<div class="sheet-overlay" data-sheet-overlay hidden></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="Objectives tracker" data-sheet hidden>' +
      '<div class="sheet-head"><p class="sheet-title">Objectives · <span data-sheet-count>' + der.doneCount + '/' + der.totalCount + '</span></p>' +
      '<button type="button" class="btn btn-icon sheet-close" data-action="close-sheet" aria-label="Close objectives tracker">' + icon('chevron-down', 16) + '</button></div>' +
      '<div class="sheet-body lab-scroll" data-sheet-list>' + ObjectiveList(' data-close-sheet') + '</div>' +
      '</div></div>';
  }

  /* ======================================================================
     Completion modal (C7) + Reset dialog
     ====================================================================== */
  function Stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="star' + (i <= n ? ' star-on' : '') + '" viewBox="0 0 24 24" width="28" height="28" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        window.LAB_ICONS.star.map(function (p) {
          return '<' + p[0] + ' ' + Object.keys(p[1]).map(function (k) { return k + '="' + esc(p[1][k]) + '"'; }).join(' ') + '></' + p[0] + '>';
        }).join('') + '</svg>';
    }
    return '<div class="stars" role="img" aria-label="' + n + ' of 5 stars">' + out + '</div>';
  }

  function CompletionModal() {
    return '<div class="overlay" data-modal-overlay hidden></div>' +
      '<div class="dialog lab-scroll" role="dialog" aria-modal="true" aria-labelledby="cm-title" data-modal hidden>' +
      '<div class="dialog-head">' +
      '<div class="trophy-circle">' + icon('trophy', 24) + '</div>' +
      '<h2 class="dialog-title" id="cm-title" data-cm-title>Sprint complete</h2>' +
      '<p class="dialog-sub" data-cm-sub></p>' +
      '</div>' +
      '<div class="dialog-body">' +
      '<div class="cm-score-wrap"><p class="cm-score"><span data-cm-score>0</span><span class="cm-score-sub">/100</span></p>' +
      '<div data-cm-stars>' + Stars(0) + '</div>' +
      '<p class="cm-caption" data-cm-caption></p></div>' +
      '<div class="cm-recap"><p class="cm-recap-kicker">Mastery recap by pillar</p>' +
      '<div class="cm-recap-list" data-cm-recap></div></div>' +
      '<div class="cm-next">' +
      '<p class="cm-next-kicker">' + icon('graduation-cap', 16) + ' What to learn next</p>' +
      '<ul class="cm-next-list dotlist">' +
      '<li>Re-run the <strong>other difficulty mode</strong> — Hard shows you the same floor with the training wheels off.</li>' +
      '<li>Continue with the next CySA+ lesson (reporting &amp; communication) — you now own the metrics it builds on.</li>' +
      '<li>Read the ATT&amp;CK technique pages linked in the Debrief and trace how a SOAR playbook would respond to each.</li>' +
      '<li>Try writing one pseudo-SPL detection for your own environment — detection engineering starts at home.</li>' +
      '</ul></div>' +
      '<div class="cm-foot">' + icon('book-open', 14) + ' <span>Progress stays in this browser — use Reset on the board header to rebuild the floor.</span></div>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-zinc cm-close" data-action="close-results">Back to the floor</button>' +
      '</div>';
  }

  function ResetDialog() {
    return '<div class="overlay" data-reset-overlay hidden></div>' +
      '<div class="dialog dialog-reset" role="alertdialog" aria-modal="true" aria-labelledby="rd-title" aria-describedby="rd-desc" data-reset-dialog hidden>' +
      '<div class="dialog-body space-2">' +
      '<h2 class="dialog-title dialog-title-sm" id="rd-title">Reset the sprint?</h2>' +
      '<p class="dialog-sub dialog-sub-left" id="rd-desc">This wipes all objectives, quiz answers, automation state and the saved mode from this browser. The lab returns to the pristine mode-selection screen.</p>' +
      '</div>' +
      '<div class="dialog-footer">' +
      '<button type="button" class="btn btn-outline" data-action="reset-cancel">Keep my progress</button>' +
      '<button type="button" class="btn btn-primary btn-rose" data-action="reset-confirm">Reset everything</button>' +
      '</div></div>';
  }

  /* ======================================================================
     Header (sticky program board)
     ====================================================================== */
  function ProgressRing(value) {
    var r = 15;
    var c = 2 * Math.PI * r;
    var off = c * (1 - value / 100);
    return '<div class="ring" role="img" aria-label="Sprint progress ' + value + ' percent" data-ring-wrap>' +
      '<svg viewBox="0 0 40 40" class="ring-svg">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="currentColor" class="ring-track" stroke-width="4"></circle>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="currentColor" class="ring-bar" stroke-width="4" stroke-linecap="round"' +
      ' stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '" data-ring></circle>' +
      '</svg><span class="ring-label" data-ring-label>' + value + '%</span></div>';
  }

  function dayRailItems() {
    var st = window.LAB_STORE.getState();
    var der = window.LAB_STORE.get();
    var items = [];
    for (var d = 1; d <= 5; d++) {
      var list = der.objectives.filter(function (o) { return o.day === d; });
      var done = list.filter(function (o) { return st.obj[o.id] && st.obj[o.id].done; }).length;
      items.push({ id: 'section-day' + d, label: 'Day ' + d, count: done + '/' + list.length, active: done === list.length && list.length > 0 });
    }
    var quizDone = der.quiz.filter(function (q) {
      return (st.quiz[q.id] && st.quiz[q.id].correct !== undefined) || st.quiz[q.id];
    }).length;
    items.push({ id: 'section-quiz', label: 'Quiz', count: quizDone + '/' + der.quiz.length, active: quizDone === der.quiz.length && der.quiz.length > 0 });
    items.push({ id: 'section-debrief', label: 'Debrief', count: '', active: false });
    return items;
  }

  function renderHeader() {
    var der = window.LAB_STORE.get();
    var st = window.LAB_STORE.getState();
    var modePct = der.totalCount === 0 ? 0 : Math.round((der.doneCount / der.totalCount) * 100);
    var glossary = D.GLOSSARY.map(function (g) {
      return '<div><dt class="gloss-t">' + esc(g.term) + '</dt><dd class="gloss-d">' + esc(g.def) + '</dd></div>';
    }).join('');
    var railBtns = dayRailItems().map(function (r) {
      return '<button type="button" class="railbtn' + (r.active ? ' railbtn-on' : '') + '" data-action="scroll" data-target="' + r.id + '"' +
        ' data-railbtn="' + r.id + '">' + r.label +
        (r.count ? '<span class="railbtn-count">' + r.count + '</span>' : '') + '</button>';
    }).join('');
    return '<header class="lab-header">' +
      '<div class="lab-header-in">' +
      '<div class="lab-header-row">' +
      '<div class="lab-header-title">' +
      '<p class="lab-kicker">Program office · Corvus Logistics · synthetic training env</p>' +
      '<h1 class="lab-h1">SOC Modernization Sprint <span class="lab-h1-sub">— CySA+ CS0-003 · 4.1</span></h1>' +
      '</div>' +
      '<div class="lab-header-ctl">' +
      '<span class="pill ' + (st.mode === 'medium' ? 'pill-mode-medium' : 'pill-mode-hard') + '" data-mode-badge>' +
      (st.mode === 'medium' ? 'Deputy · Medium' : 'Acting · Hard') + '</span>' +
      '<div class="glossary">' +
      '<button type="button" class="btn btn-ghost" data-action="glossary" aria-label="Open glossary" aria-expanded="false" data-glossary-btn>' +
      icon('book-open', 16) + ' <span class="hide-sm">Glossary</span></button>' +
      '<div class="gloss-pop lab-scroll" data-glossary-pop hidden>' +
      '<p class="gloss-head">Field glossary · 15 terms</p><dl class="gloss-list">' + glossary + '</dl></div>' +
      '</div>' +
      '<button type="button" class="btn btn-ghost btn-emerald-txt" data-action="open-results" data-results-btn hidden aria-label="View completion results">' +
      icon('trophy', 16) + ' <span class="hide-sm">Results</span></button>' +
      '<span class="score-chip hide-sm-flex" aria-label="Score ' + der.score + ' percent" data-score-wrap>' +
      '<span class="score-v" data-score>' + der.score + '</span><span class="score-sub">/100</span></span>' +
      ProgressRing(modePct) +
      '<button type="button" class="btn btn-ghost btn-rose-txt" data-action="reset-ask" aria-label="Reset the sprint">' +
      icon('rotate-ccw', 16) + ' <span class="hide-sm">Reset</span></button>' +
      '</div></div>' +
      '<nav aria-label="Sprint sections" class="dayrail">' + railBtns + '</nav>' +
      '</div></header>';
  }

  /* ======================================================================
     Board skeleton (rendered once per mode entry)
     ====================================================================== */
  function renderBoard() {
    var st = window.LAB_STORE.getState();
    var mode = st.mode;
    return '<div class="board-bg">' +
      renderHeader() +
      '<main class="lab-main" aria-label="Sprint workbenches">' +
      '<div class="lab-grid">' +
      '<div class="lab-col-main">' +
      Day1(mode) + Day2(mode) + Day3(mode) + Day4(mode) + Day5(mode) +
      QuizSection() + Debrief() + FinishLine() +
      '<p class="end-mark">■ end of sprint · synthetic training environment · corvus logistics is fictional</p>' +
      '</div>' +
      ObjectivesRail() +
      '</div></main>' +
      ObjectivesMobile() +
      CompletionModal() +
      ResetDialog() +
      '</div>';
  }

  window.LAB_UI = {
    esc: esc, cn: cn, icon: icon,
    renderModeSelect: renderModeSelect,
    renderBoard: renderBoard,
    finishInner: finishInner,
    ObjectiveList: ObjectiveList,
    Stars: Stars,
    canEnable: canEnable,
    dayRailItems: dayRailItems,
  };
})();
