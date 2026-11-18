// ============================================================================
// CyberLab Architect — Static Port — UI Panels
// ----------------------------------------------------------------------------
// Vanilla-JS ports of:
//   - src/components/lab/ModeSelection.tsx
//   - src/components/lab/MissionBriefing.tsx
//   - src/components/lab/LogStreamPanel.tsx
//   - src/components/lab/AlertPanels.tsx   (AlertQueue + AlertDetail)
//   - src/components/lab/DashboardWidgets.tsx
//   - src/components/lab/ToolDock.tsx
//   - src/components/lab/severity-utils.ts
//
// Public API (window.UI):
//   renderModeSelection(containerEl)
//   renderBriefing(containerEl)
//   renderLogStream(containerEl)
//   renderAlertQueue(containerEl)
//   renderAlertDetail(containerEl)
//   renderDashboards(containerEl)
//   renderToolDock(containerEl)
//
// Each panel subscribes to LabStore and re-renders itself on changes.
// ============================================================================

(function () {
  'use strict';

  var LAB_DATA = window.LAB_DATA;
  var LabStore = window.LabStore;
  var Icons = window.Icons;

  // -------------------------------------------------------------------------
  // HTML escape
  // -------------------------------------------------------------------------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -------------------------------------------------------------------------
  // Severity colors (mirrors severity-utils.ts)
  // -------------------------------------------------------------------------
  function severityColor(sev) {
    switch (sev) {
      case 'critical': return { bar: 'bg-rose-500', badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40', text: 'text-rose-300', bg: 'bg-rose-950/30 border-rose-500/30' };
      case 'error':    return { bar: 'bg-rose-500', badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40', text: 'text-rose-300', bg: 'bg-rose-950/30 border-rose-500/30' };
      case 'warn':     return { bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', text: 'text-amber-300', bg: 'bg-amber-950/20 border-amber-500/30' };
      case 'info':     return { bar: 'bg-sky-500', badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/40', text: 'text-sky-300', bg: 'bg-sky-950/20 border-sky-500/30' };
      case 'debug':    return { bar: 'bg-slate-500', badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/40', text: 'text-slate-400', bg: 'bg-slate-900/40 border-slate-700/40' };
      default:         return { bar: 'bg-slate-500', badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/40', text: 'text-slate-400', bg: 'bg-slate-900/40 border-slate-700/40' };
    }
  }
  function alertSeverityColor(sev) {
    switch (sev) {
      case 'critical':      return { dot: 'bg-rose-500', bg: 'bg-rose-950/30', border: 'border-rose-500/40', text: 'text-rose-300' };
      case 'high':          return { dot: 'bg-orange-500', bg: 'bg-orange-950/25', border: 'border-orange-500/40', text: 'text-orange-300' };
      case 'medium':        return { dot: 'bg-amber-500', bg: 'bg-amber-950/20', border: 'border-amber-500/40', text: 'text-amber-300' };
      case 'low':           return { dot: 'bg-sky-500', bg: 'bg-sky-950/20', border: 'border-sky-500/40', text: 'text-sky-300' };
      case 'informational':
      default:              return { dot: 'bg-slate-500', bg: 'bg-slate-900/40', border: 'border-slate-600/40', text: 'text-slate-400' };
    }
  }

  var VERDICT_META = {
    tp: { label: 'True Positive', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', abbr: 'TP' },
    fp: { label: 'False Positive', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', abbr: 'FP' },
    tn: { label: 'True Negative', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', abbr: 'TN' },
    fn: { label: 'False Negative', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', abbr: 'FN' },
  };
  var STATUS_META = {
    new: { label: 'New', color: 'text-slate-400' },
    acknowledged: { label: 'Acknowledged', color: 'text-sky-300' },
    investigated: { label: 'Investigated', color: 'text-amber-300' },
    resolved: { label: 'Resolved', color: 'text-emerald-300' },
    escalated: { label: 'Escalated', color: 'text-rose-300' },
  };

  // =========================================================================
  // 1) MODE SELECTION  (full-screen landing)
  // =========================================================================
  function renderModeSelection(containerEl) {
    var modes = [
      {
        id: 'medium', icon: 'graduationCap', name: 'Foundations',
        subtitle: 'Medium · Learn the workflow', tag: 'Guided',
        tone: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 hover:border-emerald-400/70',
        glow: 'shadow-[0_0_50px_-15px_rgba(16,185,129,0.6)]',
        iconColor: 'text-emerald-300', accentColor: 'text-emerald-300',
        points: [
          { icon: 'activity', text: '12 guided objectives walked through in order' },
          { icon: 'shieldCheck', text: 'Tiered hints: nudge → direction → demonstration' },
          { icon: 'trophy', text: 'Tolerant validation — synonyms accepted' },
          { icon: 'alertTriangle', text: 'Every wrong answer teaches WHY' },
        ],
        commit: 'Begin as a Tier-1 analyst on the watch floor',
        cta: 'Start Foundations',
      },
      {
        id: 'hard', icon: 'swords', name: 'Triage Under Fire',
        subtitle: 'Hard · Test & stretch', tag: 'Challenge',
        tone: 'from-amber-500/20 to-rose-500/5 border-amber-500/40 hover:border-amber-400/70',
        glow: 'shadow-[0_0_50px_-15px_rgba(245,158,11,0.6)]',
        iconColor: 'text-amber-300', accentColor: 'text-amber-300',
        points: [
          { icon: 'activity', text: '9 multi-step challenges; no hand-holding' },
          { icon: 'shieldCheck', text: 'Noisy evidence with red herrings; near-misses rejected' },
          { icon: 'trophy', text: 'Strict validation — exact IDs, sequences, multi-field answers' },
          { icon: 'alertTriangle', text: 'One optional nudge; using it costs score' },
        ],
        commit: 'Step in as the on-call analyst — 5 alerts, 40 minutes, no mistakes',
        cta: 'Accept the Challenge',
      },
    ];

    var cards = modes.map(function (m, idx) {
      var points = m.points.map(function (p) {
        return ''
          + '<li class="flex items-start gap-2.5 text-sm text-slate-300">'
          +   Icons[p.icon]('w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0')
          +   '<span>' + esc(p.text) + '</span>'
          + '</li>';
      }).join('');
      return ''
        + '<button data-action="pick-mode" data-mode="' + m.id + '" '
        +   'class="group relative text-left rounded-xl border bg-gradient-to-br ' + m.tone + ' p-6 transition-all duration-200 ' + m.glow + ' hover:scale-[1.01]" '
        +   'aria-label="Start ' + m.name + ' mode">'
        +   '<div class="flex items-start justify-between mb-5">'
        +     Icons[m.icon]('w-10 h-10 ' + m.iconColor)
        +     '<span class="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-slate-900/70 border border-slate-700 text-slate-300">' + esc(m.tag) + '</span>'
        +   '</div>'
        +   '<h2 class="text-2xl font-bold text-slate-100 mb-1">' + esc(m.name) + '</h2>'
        +   '<p class="text-xs font-mono ' + m.accentColor + ' mb-5">' + esc(m.subtitle) + '</p>'
        +   '<ul class="space-y-2.5 mb-6">' + points + '</ul>'
        +   '<div class="pt-4 border-t border-slate-700/60">'
        +     '<p class="text-xs text-slate-400 italic mb-3">&ldquo;' + esc(m.commit) + '&rdquo;</p>'
        +     '<div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 group-hover:border-slate-600 text-sm font-medium transition-colors ' + m.accentColor + '">'
        +       esc(m.cta) + '<span aria-hidden="true">→</span>'
        +     '</div>'
        +   '</div>'
        + '</button>';
    }).join('');

    var html = ''
      + '<div class="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden mode-selection-root">'
      +   '<div class="absolute inset-0 opacity-[0.08] pointer-events-none mode-grid-bg"></div>'
      +   '<div class="relative z-10 max-w-4xl w-full text-center mb-10">'
      +     '<div class="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-mono text-amber-300 tracking-wider">'
      +       '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>'
      +       'WATCH FLOOR · LIVE'
      +     '</div>'
      +     '<h1 class="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-slate-100 mb-3">'
      +       'Security Monitoring<span class="block text-amber-400">&amp; Alerting Concepts</span>'
      +     '</h1>'
      +     '<p class="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">'
      +       'CompTIA Security+ (SY0-801) · Lesson 4.4 — Use logs, alerts, dashboards, and security tools to identify potential threats.'
      +     '</p>'
      +     '<div class="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 font-mono">'
      +       '<span class="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700">Northwind Credit Union</span>'
      +       '<span class="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700">Tier-1 SOC Analyst</span>'
      +       '<span class="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700">Shift B</span>'
      +     '</div>'
      +   '</div>'
      +   '<div class="relative z-10 grid md:grid-cols-2 gap-6 w-full max-w-4xl">' + cards + '</div>'
      +   '<p class="relative z-10 mt-10 text-center text-xs text-slate-600 max-w-xl">'
      +     'Both modes share the same evidence — pick whichever fits your level. You can switch later by resetting the lab.'
      +   '</p>'
      + '</div>';

    containerEl.innerHTML = html;
    containerEl.querySelectorAll('[data-action="pick-mode"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.setMode(btn.getAttribute('data-mode'));
      });
    });
  }

  // =========================================================================
  // 2) MISSION BRIEFING  (collapsible + glossary + data sources + MITRE chips)
  // =========================================================================
  var _briefingState = { open: true, glossaryOpen: false, activeCategory: 'all' };
  var _briefingContainer = null;

  function renderBriefing(containerEl) {
    _briefingContainer = containerEl;
    drawBriefing();
    if (!_briefingSubscribed) {
      _briefingSubscribed = true;
      // Briefing is mostly static; only re-renders if we add dynamic content later.
    }
  }
  var _briefingSubscribed = false;

  function drawBriefing() {
    if (!_briefingContainer) return;
    var S = LAB_DATA.SCENARIO;
    var open = _briefingState.open;
    var glossaryOpen = _briefingState.glossaryOpen;
    var categories = ['all'].concat(Array.from(new Set(LAB_DATA.GLOSSARY.map(function (g) { return g.category; }))));
    var filtered = _briefingState.activeCategory === 'all'
      ? LAB_DATA.GLOSSARY
      : LAB_DATA.GLOSSARY.filter(function (g) { return g.category === _briefingState.activeCategory; });

    var catBtns = categories.map(function (c) {
      var active = _briefingState.activeCategory === c;
      var cls = active
        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
        : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200';
      return ''
        + '<button data-action="gloss-cat" data-cat="' + esc(c) + '" class="px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wide transition-colors ' + cls + '">'
        +   esc(c)
        + '</button>';
    }).join('');

    var glossaryItems = filtered.map(function (g) {
      return ''
        + '<div class="rounded-md bg-slate-900/60 border border-slate-800 p-2.5">'
        +   '<div class="flex items-center gap-2 mb-1">'
        +     '<span class="text-sm font-mono font-semibold text-amber-300">' + esc(g.term) + '</span>'
        +     '<span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">' + esc(g.category) + '</span>'
        +   '</div>'
        +   '<p class="text-xs text-slate-300 leading-relaxed">' + esc(g.definition) + '</p>'
        + '</div>';
    }).join('');

    var dsRows = LAB_DATA.DATA_SOURCE_SUMMARY.map(function (d) {
      return ''
        + '<tr class="border-b border-slate-900/60">'
        +   '<td class="py-1.5 pr-3 font-mono text-amber-300 whitespace-nowrap">' + esc(d.source) + '</td>'
        +   '<td class="py-1.5 pr-3 text-slate-300">' + esc(d.whatItTellsYou) + '</td>'
        +   '<td class="py-1.5 pr-3 text-slate-400 font-mono hidden md:table-cell">' + esc(d.keyFields) + '</td>'
        +   '<td class="py-1.5 text-slate-400 hidden lg:table-cell">' + esc(d.tipForTriage) + '</td>'
        + '</tr>';
    }).join('');

    var mitreChips = LAB_DATA.MITRE_MAPPING_USED.map(function (m) {
      var href = 'https://attack.mitre.org/techniques/' + m.id.replace('.', '/');
      return ''
        + '<a href="' + href + '" target="_blank" rel="noopener noreferrer" '
        +   'class="group px-2 py-1 rounded-md bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors" '
        +   'title="' + esc(m.tactic + ' → ' + m.technique + ' (' + m.usedIn + ')') + '">'
        +   '<span class="font-mono text-xs text-amber-300 mr-1.5">' + esc(m.id) + '</span>'
        +   '<span class="text-xs text-slate-400 group-hover:text-slate-200">' + esc(m.technique) + '</span>'
        + '</a>';
    }).join('');

    var html = ''
      + '<section class="rounded-xl border border-slate-800 bg-[#0c1322]/80 backdrop-blur-sm overflow-hidden mission-briefing">'
      +   '<button data-action="toggle-brief" class="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-800/30 transition-colors" aria-expanded="' + open + '">'
      +     '<div class="flex items-center gap-3">'
      +       '<div class="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">'
      +         Icons.scrollText('w-5 h-5 text-amber-300')
      +       '</div>'
      +       '<div>'
      +         '<h2 class="text-base font-semibold text-slate-100">Shift Handover — Mission Briefing</h2>'
      +         '<p class="text-xs text-slate-400">Read this before touching the console</p>'
      +       '</div>'
      +     '</div>'
      +     Icons.chevronDown('w-5 h-5 text-slate-400 transition-transform ' + (open ? 'rotate-180' : ''))
      +   '</button>'
      +   (open ? ''
        +   '<div class="p-4 sm:p-5 pt-0 space-y-4">'
        +     '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">'
        +       metaCard('building2', 'Organization', S.org, S.sector)
        +       metaCard('network', 'Environment', S.network, 'Hybrid deployment')
        +       metaCard('user', 'Your Role', S.analystRole, 'Watch floor')
        +       metaCard('clock', 'Shift', S.shift, 'Handover in progress')
        +     '</div>'
        +     '<div class="rounded-lg bg-slate-900/60 border border-slate-700/60 p-4">'
        +       '<p class="text-xs font-mono text-amber-300 uppercase tracking-wider mb-2">Situation</p>'
        +       '<p class="text-sm text-slate-200 leading-relaxed">' + esc(S.situation) + '</p>'
        +     '</div>'
        +     '<div class="grid sm:grid-cols-2 gap-3">'
        +       '<div class="rounded-lg bg-emerald-900/15 border border-emerald-700/30 p-4">'
        +         '<div class="flex items-center gap-2 mb-2">'
        +           Icons.bookOpen('w-4 h-4 text-emerald-300')
        +           '<p class="text-xs font-mono text-emerald-300 uppercase tracking-wider">Certification Mapping</p>'
        +         '</div>'
        +         '<p class="text-xs text-slate-300 leading-relaxed">' + esc(S.certRelevance) + '</p>'
        +       '</div>'
        +       '<div class="rounded-lg bg-sky-900/15 border border-sky-700/30 p-4">'
        +         '<div class="flex items-center gap-2 mb-2">'
        +           Icons.lightbulb('w-4 h-4 text-sky-300')
        +           '<p class="text-xs font-mono text-sky-300 uppercase tracking-wider">Real-World Relevance</p>'
        +         '</div>'
        +         '<p class="text-xs text-slate-300 leading-relaxed">' + esc(S.realWorld) + '</p>'
        +       '</div>'
        +     '</div>'
        +     '<button data-action="toggle-gloss" class="w-full mt-2 px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 transition-colors flex items-center justify-between" aria-expanded="' + glossaryOpen + '">'
        +       '<span class="text-sm text-slate-200 font-medium flex items-center gap-2">'
        +         Icons.bookOpen('w-4 h-4 text-slate-400')
        +         'Knowledge Core — Glossary &amp; References'
        +       '</span>'
        +       Icons.chevronDown('w-4 h-4 text-slate-400 transition-transform ' + (glossaryOpen ? 'rotate-180' : ''))
        +     '</button>'
        +     (glossaryOpen ? ''
        +       '<div class="rounded-lg bg-slate-950/60 border border-slate-700 p-4 space-y-4">'
        +         '<div class="flex flex-wrap gap-2">' + catBtns + '</div>'
        +         '<div class="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">' + glossaryItems + '</div>'
        +         '<div class="pt-3 border-t border-slate-800">'
        +           '<p class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Log Sources — what each tells you</p>'
        +           '<div class="overflow-x-auto">'
        +             '<table class="w-full text-xs">'
        +               '<thead><tr class="text-left text-slate-400 border-b border-slate-800">'
        +                 '<th class="py-1.5 pr-3 font-medium">Source</th>'
        +                 '<th class="py-1.5 pr-3 font-medium">What it tells you</th>'
        +                 '<th class="py-1.5 pr-3 font-medium hidden md:table-cell">Key fields</th>'
        +                 '<th class="py-1.5 font-medium hidden lg:table-cell">Triage tip</th>'
        +               '</tr></thead>'
        +               '<tbody>' + dsRows + '</tbody>'
        +             '</table>'
        +           '</div>'
        +         '</div>'
        +         '<div class="pt-3 border-t border-slate-800">'
        +           '<p class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">MITRE ATT&amp;CK techniques used in this lab</p>'
        +           '<div class="flex flex-wrap gap-2">' + mitreChips + '</div>'
        +         '</div>'
        +       '</div>'
        : '')
        +   '</div>'
        : '')
      + '</section>';

    _briefingContainer.innerHTML = html;
    wireBriefing();
  }

  function metaCard(icon, label, value, sub) {
    return ''
      + '<div class="rounded-lg bg-slate-900/60 border border-slate-700/60 p-3">'
      +   '<div class="flex items-center gap-1.5 mb-1.5">'
      +     Icons[icon]('w-3.5 h-3.5 text-slate-500')
      +     '<p class="text-[10px] font-mono uppercase tracking-wider text-slate-500">' + esc(label) + '</p>'
      +   '</div>'
      +   '<p class="text-sm font-medium text-slate-100 leading-tight">' + esc(value) + '</p>'
      +   '<p class="text-xs text-slate-500 mt-0.5">' + esc(sub) + '</p>'
      + '</div>';
  }

  function wireBriefing() {
    if (!_briefingContainer) return;
    _briefingContainer.querySelectorAll('[data-action="toggle-brief"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _briefingState.open = !_briefingState.open;
        drawBriefing();
      });
    });
    _briefingContainer.querySelectorAll('[data-action="toggle-gloss"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _briefingState.glossaryOpen = !_briefingState.glossaryOpen;
        drawBriefing();
      });
    });
    _briefingContainer.querySelectorAll('[data-action="gloss-cat"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _briefingState.activeCategory = btn.getAttribute('data-cat');
        drawBriefing();
      });
    });
  }

  // =========================================================================
  // 3) LOG STREAM PANEL  (filterable by source + text search)
  // =========================================================================
  var _logContainer = null;
  var _logSubscribed = false;

  function renderLogStream(containerEl) {
    _logContainer = containerEl;
    drawLogStream();
    if (!_logSubscribed) {
      _logSubscribed = true;
      LabStore.subscribe(function () { drawLogStream(); });
    }
  }

  function drawLogStream() {
    if (!_logContainer) return;
    var state = LabStore.getState();
    var filters = state.logFilters;
    var q = (filters.query || '').trim().toLowerCase();

    var visible = LAB_DATA.LOG_ENTRIES.filter(function (e) {
      if (filters.sources.length > 0 && filters.sources.indexOf(e.source) < 0) return false;
      if (q) {
        var haystack = (e.id + ' ' + e.host + ' ' + e.message + ' ' + e.source + ' ' + JSON.stringify(e.fields || {})).toLowerCase();
        if (haystack.indexOf(q) < 0) return false;
      }
      return true;
    });

    // Count auth failures from 10.20.0.14 (for the OBJ-M7 footer hint)
    var authFailCount = LAB_DATA.LOG_ENTRIES.filter(function (e) {
      return e.source === 'authentication' && e.severity === 'warn'
        && e.fields && e.fields.src_ip === '10.20.0.14';
    }).length;

    var srcBtns = LAB_DATA.LOG_SOURCES.map(function (s) {
      var active = filters.sources.indexOf(s.id) >= 0;
      var cls = active
        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700';
      return ''
        + '<button data-action="toggle-src" data-src="' + esc(s.id) + '" class="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors border ' + cls + '" title="' + esc(s.description) + '" aria-pressed="' + active + '">'
        +   esc(s.label)
        + '</button>';
    }).join('');

    var entriesHtml;
    if (visible.length === 0) {
      entriesHtml = ''
        + '<div class="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">'
        +   Icons.alertCircle('w-5 h-5')
        +   'No log entries match your filters.'
        + '</div>';
    } else {
      entriesHtml = '<ul class="divide-y divide-slate-900">' + visible.map(function (entry) {
        var src = LAB_DATA.LOG_SOURCES.find(function (s) { return s.id === entry.source; });
        var sc = severityColor(entry.severity);
        var tsPart = (entry.ts.split('T')[1] || '').replace('Z', '');
        var fieldsHtml = '';
        if (entry.fields) {
          var keys = Object.keys(entry.fields);
          if (keys.length > 0) {
            fieldsHtml = '<div class="mt-1 flex flex-wrap gap-1">'
              + keys.map(function (k) {
                  return ''
                    + '<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-400">'
                    +   '<span class="text-slate-600">' + esc(k) + '=</span>'
                    +   '<span class="text-slate-300">' + esc(String(entry.fields[k])) + '</span>'
                    + '</span>';
                }).join('')
              + '</div>';
          }
        }
        return ''
          + '<li class="px-3 py-2 hover:bg-slate-900/40 transition-colors ' + (entry.severity === 'critical' ? 'bg-rose-950/20' : '') + '">'
          +   '<div class="flex items-start gap-2.5">'
          +     '<div class="w-0.5 self-stretch rounded-full ' + sc.bar + '"></div>'
          +     '<div class="flex-1 min-w-0">'
          +       '<div class="flex items-center gap-2 mb-0.5 flex-wrap">'
          +         '<span class="text-[10px] font-mono text-slate-600">' + esc(entry.id) + '</span>'
          +         '<span class="text-[10px] font-mono text-slate-500">' + esc(tsPart) + '</span>'
          +         '<span class="text-[10px] font-mono uppercase tracking-wider ' + (src ? src.color : 'text-slate-400') + '">' + esc(src ? src.label : entry.source) + '</span>'
          +         '<span class="text-[10px] font-mono text-slate-600">' + esc(entry.host) + '</span>'
          +         '<span class="text-[10px] font-mono uppercase tracking-wider px-1 rounded ' + sc.badge + '">' + esc(entry.severity) + '</span>'
          +       '</div>'
          +       '<p class="text-xs font-mono text-slate-200 leading-relaxed break-words">' + esc(entry.message) + '</p>'
          +       fieldsHtml
          +     '</div>'
          +   '</div>'
          + '</li>';
      }).join('') + '</ul>';
    }

    var html = ''
      + '<div class="h-full flex flex-col rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden log-stream-panel">'
      +   '<div class="px-3 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-2">'
      +     '<div class="flex items-center gap-2 min-w-0">'
      +       Icons.database('w-4 h-4 text-cyan-400 flex-shrink-0')
      +       '<span class="text-sm font-mono text-slate-200">log_stream</span>'
      +       '<span class="text-[10px] text-slate-500 hidden sm:inline">| ' + visible.length + ' of ' + LAB_DATA.LOG_ENTRIES.length + ' entries</span>'
      +     '</div>'
      +     (filters.sources.length > 0 || filters.query
        ?   '<button data-action="clear-logs" class="text-xs text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1" aria-label="Clear log filters">'
          +   Icons.x('w-3 h-3') + ' Clear'
          + '</button>'
        :   '')
      +   '</div>'
      +   '<div class="px-3 py-2 border-b border-slate-800 space-y-2">'
      +     '<div class="relative">'
      +       Icons.search('absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500')
      +       '<input type="text" data-action="log-query" value="' + esc(filters.query) + '" placeholder="Search: 10.20.0.14, Failed login, ALR-002, T1071..." class="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-md text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50" aria-label="Search log entries" />'
      +     '</div>'
      +     '<div class="flex items-center gap-1 flex-wrap">'
      +       Icons.filter('w-3 h-3 text-slate-500 flex-shrink-0')
      +       srcBtns
      +     '</div>'
      +   '</div>'
      +   '<div class="flex-1 overflow-y-auto min-h-[200px] max-h-[440px] sm:max-h-[520px]">' + entriesHtml + '</div>'
      +   '<div class="px-3 py-2 border-t border-slate-800 bg-slate-950/60">'
      +     '<p class="text-[10px] font-mono text-slate-500">'
      +       '<span class="text-cyan-300">tip:</span> filter to <span class="text-amber-300">authentication</span> + search <span class="text-amber-300">10.20.0.14</span> = ' + authFailCount + ' failed-login entries'
      +     '</p>'
      +   '</div>'
      + '</div>';

    _logContainer.innerHTML = html;
    wireLogStream();
  }

  function wireLogStream() {
    if (!_logContainer) return;
    _logContainer.querySelectorAll('[data-action="toggle-src"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.toggleLogSource(btn.getAttribute('data-src'));
      });
    });
    _logContainer.querySelectorAll('[data-action="clear-logs"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.clearLogFilters();
      });
    });
    var queryInput = _logContainer.querySelector('[data-action="log-query"]');
    if (queryInput) {
      // Debounce query updates so we don't thrash the store on every keystroke.
      var t = null;
      queryInput.addEventListener('input', function () {
        var v = queryInput.value;
        if (t) clearTimeout(t);
        t = setTimeout(function () { LabStore.setLogQuery(v); }, 150);
      });
    }
  }

  // =========================================================================
  // 4) ALERT QUEUE
  // =========================================================================
  var _alertQueueContainer = null;
  var _alertQueueSubscribed = false;

  function renderAlertQueue(containerEl) {
    _alertQueueContainer = containerEl;
    drawAlertQueue();
    if (!_alertQueueSubscribed) {
      _alertQueueSubscribed = true;
      LabStore.subscribe(function () { drawAlertQueue(); });
    }
  }

  function drawAlertQueue() {
    if (!_alertQueueContainer) return;
    var state = LabStore.getState();
    var order = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
    var sorted = LAB_DATA.ALERTS.slice().sort(function (a, b) { return order[a.severity] - order[b.severity]; });
    var triagedCount = LAB_DATA.ALERTS.filter(function (a) { return state.alertVerdicts[a.id]; }).length;

    var items = sorted.map(function (a) {
      var colors = alertSeverityColor(a.severity);
      var isSelected = state.selectedAlertId === a.id;
      var verdict = state.alertVerdicts[a.id];
      var status = state.alertStatus[a.id] || 'new';
      var statusMeta = STATUS_META[status] || STATUS_META.new;
      var dotPulse = !verdict ? 'animate-pulse' : '';
      var leftBorder = isSelected
        ? 'bg-slate-900/70 border-l-2 ' + colors.border.replace('border-', 'border-l-')
        : 'border-l-2 border-transparent';
      var verdictChip = verdict
        ? '<span class="text-[10px] font-mono px-1.5 py-0.5 rounded border ' + (VERDICT_META[verdict] ? VERDICT_META[verdict].color : '') + '">' + (VERDICT_META[verdict] ? VERDICT_META[verdict].abbr : verdict) + '</span>'
        : Icons.chevronRight('w-4 h-4 text-slate-600 mt-1 flex-shrink-0');
      var tsPart = (a.ts.split('T')[1] || '').replace('Z', '');
      return ''
        + '<li>'
        +   '<button data-action="select-alert" data-id="' + esc(a.id) + '" class="w-full text-left px-3 py-2.5 hover:bg-slate-900/50 transition-colors flex items-start gap-2 ' + leftBorder + '" aria-pressed="' + isSelected + '">'
        +     '<span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' + colors.dot + ' ' + dotPulse + '"></span>'
        +     '<div class="flex-1 min-w-0">'
        +       '<div class="flex items-center gap-2 mb-0.5 flex-wrap">'
        +         '<span class="text-[10px] font-mono text-slate-600">' + esc(a.id) + '</span>'
        +         '<span class="text-[10px] font-mono uppercase tracking-wider px-1 rounded ' + colors.bg + ' ' + colors.text + ' border ' + colors.border + '">' + esc(a.severity) + '</span>'
        +         '<span class="text-[10px] font-mono ' + statusMeta.color + '">' + esc(statusMeta.label) + '</span>'
        +       '</div>'
        +       '<p class="text-xs text-slate-200 leading-snug truncate">' + esc(a.title) + '</p>'
        +       '<p class="text-[10px] text-slate-500 font-mono mt-0.5">' + esc(tsPart) + ' · ' + esc(a.source) + '</p>'
        +     '</div>'
        +     verdictChip
        +   '</button>'
        + '</li>';
    }).join('');

    var html = ''
      + '<div class="flex flex-col rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden h-full alert-queue-panel">'
      +   '<div class="px-3 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-2">'
      +     '<div class="flex items-center gap-2">'
      +       Icons.bell('w-4 h-4 text-amber-400 flex-shrink-0')
      +       '<span class="text-sm font-mono text-slate-200">alert_queue</span>'
      +       '<span class="text-[10px] text-slate-500 hidden sm:inline">| ' + LAB_DATA.ALERTS.length + ' active</span>'
      +     '</div>'
      +     '<span class="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">'
      +       triagedCount + '/' + LAB_DATA.ALERTS.length + ' triaged'
      +     '</span>'
      +   '</div>'
      +   '<ul class="divide-y divide-slate-900 overflow-y-auto max-h-[260px] sm:max-h-[320px]">' + items + '</ul>'
      + '</div>';

    _alertQueueContainer.innerHTML = html;
    _alertQueueContainer.querySelectorAll('[data-action="select-alert"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.setSelectedAlert(btn.getAttribute('data-id'));
      });
    });
  }

  // =========================================================================
  // 5) ALERT DETAIL  (verdict picker, status changer, feedback)
  // =========================================================================
  var _alertDetailContainer = null;
  var _alertDetailSubscribed = false;

  function renderAlertDetail(containerEl) {
    _alertDetailContainer = containerEl;
    drawAlertDetail();
    if (!_alertDetailSubscribed) {
      _alertDetailSubscribed = true;
      LabStore.subscribe(function () { drawAlertDetail(); });
    }
  }

  function drawAlertDetail() {
    if (!_alertDetailContainer) return;
    var state = LabStore.getState();
    var id = state.selectedAlertId;
    if (!id) {
      _alertDetailContainer.innerHTML = ''
        + '<div class="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 text-center h-full flex flex-col items-center justify-center alert-detail-empty">'
        +   Icons.shieldAlert('w-8 h-8 text-slate-700 mb-3')
        +   '<p class="text-sm text-slate-400 mb-1">No alert selected</p>'
        +   '<p class="text-xs text-slate-600">Pick an alert from the queue to view its full triage context.</p>'
        + '</div>';
      return;
    }
    var alert = LAB_DATA.ALERTS.find(function (a) { return a.id === id; });
    if (!alert) return;
    var colors = alertSeverityColor(alert.severity);
    var verdict = state.alertVerdicts[alert.id];
    var status = state.alertStatus[alert.id] || 'new';
    var supportingLogs = LAB_DATA.LOG_ENTRIES.filter(function (l) { return alert.logRefs.indexOf(l.id) >= 0; });
    var verdicts = ['tp', 'fp', 'tn', 'fn'];
    var tsPart = (alert.ts.split('T')[1] || '').replace('Z', '');

    var verdictBtns = verdicts.map(function (v) {
      var sel = verdict === v;
      var m = VERDICT_META[v];
      var cls = sel ? m.color + ' scale-105' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200';
      return ''
        + '<button data-action="verdict" data-id="' + esc(alert.id) + '" data-v="' + v + '" class="px-3 py-2 rounded-md text-xs font-mono border transition-all ' + cls + '" aria-pressed="' + sel + '">'
        +   '<span class="block font-semibold">' + esc(m.abbr) + '</span>'
        +   '<span class="block text-[10px] mt-0.5">' + esc(m.label) + '</span>'
        + '</button>';
    }).join('');

    var statusBtns = (['new', 'acknowledged', 'investigated', 'resolved', 'escalated']).map(function (st) {
      var sel = status === st;
      var cls = sel
        ? 'bg-slate-700 border-slate-600 text-slate-100'
        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300';
      return ''
        + '<button data-action="status" data-id="' + esc(alert.id) + '" data-st="' + st + '" class="px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ' + cls + '">'
        +   esc(st)
        + '</button>';
    }).join('');

    var supportingLogsHtml = supportingLogs.map(function (l) {
      var lts = (l.ts.split('T')[1] || '').replace('Z', '');
      return ''
        + '<li class="rounded-md bg-slate-950/70 border border-slate-800 p-2 font-mono text-[11px] leading-relaxed">'
        +   '<div class="flex items-center gap-2 mb-0.5 text-slate-500">'
        +     '<span>' + esc(l.id) + '</span>'
        +     '<span>' + esc(lts) + '</span>'
        +     '<span class="uppercase">' + esc(l.source) + '</span>'
        +   '</div>'
        +   '<p class="text-slate-300">' + esc(l.message) + '</p>'
        + '</li>';
    }).join('');

    var mitreHtml = alert.mitre ? ''
      + '<div class="rounded-md bg-slate-950/60 border border-slate-800 p-2.5">'
      +   '<div class="flex items-center gap-2 mb-1">'
      +     '<span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">MITRE ATT&amp;CK</span>'
      +   '</div>'
      +   '<div class="flex items-center gap-2 flex-wrap text-xs">'
      +     '<a href="https://attack.mitre.org/techniques/' + alert.mitre.id.replace('.', '/') + '" target="_blank" rel="noopener noreferrer" class="font-mono text-amber-300 hover:underline">' + esc(alert.mitre.id) + '</a>'
      +     '<span class="text-slate-400">·</span>'
      +     '<span class="text-slate-300">' + esc(alert.mitre.tactic) + '</span>'
      +     '<span class="text-slate-600">→</span>'
      +     '<span class="text-slate-200">' + esc(alert.mitre.technique) + '</span>'
      +   '</div>'
      + '</div>' : '';

    var feedbackHtml = verdict ? (function () {
      var isCorrect = verdict === alert.correctVerdict;
      var cls = isCorrect ? 'bg-emerald-950/20 border-emerald-700/40' : 'bg-rose-950/20 border-rose-700/40';
      var textCls = isCorrect ? 'text-emerald-300' : 'text-rose-300';
      var label = isCorrect ? '✓ Correct verdict' : '✗ Reconsider — see rationale';
      var disc = alert.discriminatingEvidence
        ? '<p class="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800"><span class="font-mono text-amber-300">discriminating evidence: </span>' + esc(alert.discriminatingEvidence) + '</p>'
        : '';
      return ''
        + '<div class="overflow-hidden">'
        +   '<div class="rounded-md border p-3 ' + cls + '">'
        +     '<p class="text-xs font-mono mb-1 ' + textCls + '">' + esc(label) + '</p>'
        +     '<p class="text-xs text-slate-300 leading-relaxed">' + esc(alert.verdictRationale) + '</p>'
        +     disc
        +   '</div>'
        + '</div>';
    })() : '';

    var html = ''
      + '<div class="rounded-xl border ' + colors.border + ' bg-[#0a0f1c] overflow-hidden h-full flex flex-col alert-detail-panel">'
      +   '<div class="px-3 py-2.5 border-b ' + colors.border + ' ' + colors.bg + ' flex items-center justify-between">'
      +     '<div class="flex items-center gap-2">'
      +       '<span class="w-2 h-2 rounded-full ' + colors.dot + ' animate-pulse"></span>'
      +       '<span class="text-sm font-mono text-slate-100">' + esc(alert.id) + '</span>'
      +       '<span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ' + colors.bg + ' ' + colors.text + ' ' + colors.border + '">' + esc(alert.severity) + '</span>'
      +     '</div>'
      +     '<div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">'
      +       Icons.clock('w-3 h-3') + esc(tsPart)
      +     '</div>'
      +   '</div>'
      +   '<div class="flex-1 overflow-y-auto max-h-[460px] sm:max-h-[520px]">'
      +     '<div class="p-4 space-y-3">'
      +       '<div>'
      +         '<h3 class="text-base font-semibold text-slate-100 mb-1">' + esc(alert.title) + '</h3>'
      +         '<div class="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-2">'
      +           Icons.tag('w-3 h-3')
      +           '<span>' + esc(alert.source) + '</span>'
      +           '<span>·</span>'
      +           '<span>tool: ' + esc(alert.relatedTool) + '</span>'
      +         '</div>'
      +         '<p class="text-xs text-slate-300 leading-relaxed">' + esc(alert.description) + '</p>'
      +       '</div>'
      +       mitreHtml
      +       '<div>'
      +         '<div class="flex items-center gap-1.5 mb-1.5">'
      +           Icons.fileText('w-3.5 h-3.5 text-slate-500')
      +           '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Supporting logs (' + supportingLogs.length + ')</p>'
      +         '</div>'
      +         '<ul class="space-y-1.5">' + supportingLogsHtml + '</ul>'
      +       '</div>'
      +       '<div>'
      +         '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Triage verdict</p>'
      +         '<div class="grid grid-cols-2 gap-2">' + verdictBtns + '</div>'
      +       '</div>'
      +       '<div class="flex items-center gap-1.5 flex-wrap pt-1">'
      +         '<span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Status:</span>'
      +         statusBtns
      +       '</div>'
      +       feedbackHtml
      +     '</div>'
      +   '</div>'
      + '</div>';

    _alertDetailContainer.innerHTML = html;
    _alertDetailContainer.querySelectorAll('[data-action="verdict"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var aid = btn.getAttribute('data-id');
        var v = btn.getAttribute('data-v');
        LabStore.setAlertVerdict(aid, v);
        // Mirrors React behavior: setting a verdict on a 'new' alert promotes to 'acknowledged'
        if ((LabStore.getState().alertStatus[aid] || 'new') === 'new') {
          LabStore.setAlertStatus(aid, 'acknowledged');
        }
      });
    });
    _alertDetailContainer.querySelectorAll('[data-action="status"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.setAlertStatus(btn.getAttribute('data-id'), btn.getAttribute('data-st'));
      });
    });
  }

  // =========================================================================
  // 6) DASHBOARD WIDGETS  (KPI, list, bars, heatmap)
  // =========================================================================
  function renderDashboards(containerEl) {
    var widgets = LAB_DATA.DASHBOARD_WIDGETS;
    var html = ''
      + '<div class="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden h-full flex flex-col dashboards-panel">'
      +   '<div class="px-3 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">'
      +     Icons.barChart3('w-4 h-4 text-cyan-400')
      +     '<span class="text-sm font-mono text-slate-200">soc_dashboards</span>'
      +     '<span class="text-[10px] text-slate-500 hidden sm:inline">| live widgets</span>'
      +   '</div>'
      +   '<div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[440px] sm:max-h-[520px]">'
      +     widgets.map(function (w) { return renderWidget(w); }).join('')
      +   '</div>'
      + '</div>';
    containerEl.innerHTML = html;
  }

  function renderWidget(w) {
    var body = '';
    if (w.type === 'kpi' && w.kpi) {
      var trendIcon = w.kpi.trend === 'up' ? Icons.trendingUp('w-3 h-3')
                    : w.kpi.trend === 'down' ? Icons.trendingDown('w-3 h-3')
                    : w.kpi.trend === 'flat' ? Icons.minus('w-3 h-3') : '';
      var trendCls = w.kpi.trend === 'up' ? 'text-rose-300'
                  : w.kpi.trend === 'down' ? 'text-emerald-300'
                  : 'text-slate-400';
      body = ''
        + '<div class="flex items-end gap-2">'
        +   '<span class="text-2xl font-mono font-semibold text-slate-100">' + esc(w.kpi.value) + '</span>'
        +   (w.kpi.unit ? '<span class="text-xs text-slate-400 mb-1">' + esc(w.kpi.unit) + '</span>' : '')
        +   (w.kpi.trend ? '<span class="flex items-center gap-0.5 text-[10px] font-mono mb-1 ml-auto ' + trendCls + '">' + trendIcon + esc(w.kpi.trendNote || '') + '</span>' : '')
        + '</div>';
    } else if (w.type === 'list' && w.list) {
      var rows = w.list.map(function (item) {
        var dotCls = item.flag === 'critical' ? 'bg-rose-500'
                   : item.flag === 'warn' ? 'bg-amber-500' : 'bg-slate-600';
        var valCls = item.flag === 'critical' ? 'text-rose-300'
                   : item.flag === 'warn' ? 'text-amber-300' : 'text-slate-400';
        return ''
          + '<li class="flex items-center gap-2 text-[11px]">'
          +   '<span class="w-1.5 h-1.5 rounded-full flex-shrink-0 ' + dotCls + '"></span>'
          +   '<span class="font-mono text-slate-300 flex-1 truncate">' + esc(item.label) + '</span>'
          +   '<span class="font-mono ' + valCls + '">' + esc(item.value) + '</span>'
          + '</li>';
      }).join('');
      body = '<ul class="space-y-1 mt-1">' + rows + '</ul>';
    } else if (w.type === 'bars' && w.bars) {
      var max = Math.max.apply(null, w.bars.map(function (x) { return x.value; }));
      var barCells = w.bars.map(function (b) {
        var h = max > 0 ? (b.value / max) * 100 : 0;
        return ''
          + '<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end">'
          +   '<span class="text-[10px] font-mono text-slate-400">' + esc(b.value) + '</span>'
          +   '<div class="w-full rounded-t ' + (b.color || 'bg-cyan-500') + '" style="height:' + h + '%"></div>'
          +   '<span class="text-[9px] font-mono text-slate-500 truncate w-full text-center">' + esc(b.label) + '</span>'
          + '</div>';
      }).join('');
      body = '<div class="flex items-end gap-1.5 h-16 mt-1">' + barCells + '</div>';
    } else if (w.type === 'heatmap' && w.heatmap) {
      var maxV = Math.max.apply(null, w.heatmap.values.flat());
      var head = w.heatmap.cols.map(function (c) {
        return '<th class="px-1 text-slate-500 font-normal">' + esc(c) + '</th>';
      }).join('');
      var bodyRows = w.heatmap.rows.map(function (r, ri) {
        var cells = w.heatmap.values[ri].map(function (v, ci) {
          var intensity = maxV > 0 ? v / maxV : 0;
          var bg = intensity > 0.75 ? 'bg-rose-500/70'
                 : intensity > 0.5 ? 'bg-amber-500/60'
                 : intensity > 0.25 ? 'bg-sky-500/40'
                 : intensity > 0 ? 'bg-slate-700/60' : 'bg-slate-900/60';
          var tcls = v > 0 ? 'text-slate-100' : 'text-slate-600';
          return '<td class="px-1.5 py-1 text-center ' + bg + ' rounded-sm ' + tcls + '" title="' + esc(r + ' @ ' + w.heatmap.cols[ci] + ': ' + v) + '">' + esc(v) + '</td>';
        }).join('');
        return ''
          + '<tr>'
          +   '<td class="pr-2 text-slate-500 whitespace-nowrap">' + esc(r) + '</td>'
          +   cells
          + '</tr>';
      }).join('');
      body = ''
        + '<div class="overflow-x-auto mt-1">'
        +   '<table class="text-[10px] font-mono">'
        +     '<thead><tr><th></th>' + head + '</tr></thead>'
        +     '<tbody>' + bodyRows + '</tbody>'
        +   '</table>'
        + '</div>';
    }

    return ''
      + '<div class="rounded-lg bg-slate-950/60 border border-slate-800 p-3">'
      +   '<p class="text-xs font-medium text-slate-200 mb-0.5">' + esc(w.title) + '</p>'
      +   (w.subtitle ? '<p class="text-[10px] text-slate-500 font-mono mb-2">' + esc(w.subtitle) + '</p>' : '')
      +   body
      + '</div>';
  }

  // =========================================================================
  // 7) TOOL DOCK  (6 tools; modal with details; R7 ESC + click-outside)
  // =========================================================================
  var _toolDockContainer = null;
  var _toolModalRoot = null;
  var _toolEscHandler = null;
  var _toolShowDetail = false;

  function renderToolDock(containerEl) {
    _toolDockContainer = containerEl;
    drawToolDock();
  }

  function drawToolDock() {
    if (!_toolDockContainer) return;
    var state = LabStore.getState();
    var cards = LAB_DATA.TOOLS.map(function (t) {
      var isSelected = state.selectedToolId === t.id;
      var sub = t.acronym === 'IDS/IPS' ? 'Intrusion Detection / Prevention' : t.name.split('&')[0].trim();
      var cls = isSelected
        ? 'bg-amber-500/15 border-amber-500/50 scale-105'
        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60';
      return ''
        + '<button data-action="pick-tool" data-id="' + esc(t.id) + '" class="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-md border transition-all min-h-[80px] ' + cls + '" aria-pressed="' + isSelected + '" aria-label="' + esc(t.name + ' (' + t.acronym + ')') + '">'
        +   '<span class="text-base font-mono font-bold ' + (isSelected ? 'text-amber-300' : 'text-slate-200') + '">' + esc(t.acronym) + '</span>'
        +   '<span class="text-[9px] text-slate-500 leading-tight text-center">' + esc(sub) + '</span>'
        + '</button>';
    }).join('');

    var html = ''
      + '<div class="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden tool-dock-panel">'
      +   '<div class="px-3 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">'
      +     '<div class="flex items-center gap-2">'
      +       Icons.wrench('w-4 h-4 text-amber-400')
      +       '<span class="text-sm font-mono text-slate-200">tool_dock</span>'
      +       '<span class="text-[10px] text-slate-500 hidden sm:inline">| click to inspect</span>'
      +     '</div>'
      +   '</div>'
      +   '<div class="p-3 grid grid-cols-3 sm:grid-cols-6 gap-2">' + cards + '</div>'
      + '</div>';

    _toolDockContainer.innerHTML = html;
    _toolDockContainer.querySelectorAll('[data-action="pick-tool"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.setSelectedTool(btn.getAttribute('data-id'));
        _toolShowDetail = true;
        openToolModal();
      });
    });
  }

  function openToolModal() {
    if (_toolModalRoot) closeToolModal();
    var state = LabStore.getState();
    var tool = LAB_DATA.TOOLS.find(function (t) { return t.id === state.selectedToolId; });
    if (!tool) return;
    _toolModalRoot = document.createElement('div');
    _toolModalRoot.className = 'tool-modal-root';
    _toolModalRoot.setAttribute('role', 'dialog');
    _toolModalRoot.setAttribute('aria-modal', 'true');
    _toolModalRoot.setAttribute('aria-label', tool.name + ' details');
    document.body.appendChild(_toolModalRoot);

    var vendors = tool.exampleVendors.map(function (v) {
      return '<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300">' + esc(v) + '</span>';
    }).join('');
    var useCases = tool.useCases.map(function (u) {
      return ''
        + '<li class="flex items-start gap-2 text-xs text-slate-300">'
        +   Icons.checkCircle2('w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0')
        +   '<span>' + esc(u) + '</span>'
        + '</li>';
    }).join('');

    _toolModalRoot.innerHTML = ''
      + '<div class="tool-backdrop" data-action="tool-backdrop"></div>'
      + '<div class="tool-panel max-w-lg w-full rounded-xl border border-slate-700 bg-[#0c1322] p-5 relative">'
      +   '<button data-action="tool-close" class="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-800 transition-colors" aria-label="Close">'
      +     Icons.x('w-4 h-4 text-slate-400')
      +   '</button>'
      +   '<div class="flex items-center gap-3 mb-3">'
      +     '<div class="w-12 h-12 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">'
      +       '<span class="text-sm font-mono font-bold text-amber-300">' + esc(tool.acronym) + '</span>'
      +     '</div>'
      +     '<div>'
      +       '<h3 class="text-lg font-semibold text-slate-100">' + esc(tool.name) + '</h3>'
      +       '<p class="text-xs text-slate-400 font-mono">' + esc(tool.acronym) + '</p>'
      +     '</div>'
      +   '</div>'
      +   '<div class="space-y-3">'
      +     '<div>'
      +       '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Primary Function</p>'
      +       '<p class="text-sm text-slate-200">' + esc(tool.primaryFunction) + '</p>'
      +     '</div>'
      +     '<div>'
      +       '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Description</p>'
      +       '<p class="text-xs text-slate-300 leading-relaxed">' + esc(tool.description) + '</p>'
      +     '</div>'
      +     '<div>'
      +       '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Example Vendors</p>'
      +       '<div class="flex flex-wrap gap-1.5">' + vendors + '</div>'
      +     '</div>'
      +     '<div>'
      +       '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Use Cases</p>'
      +       '<ul class="space-y-1">' + useCases + '</ul>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    _toolModalRoot.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!el) return;
      var action = el.getAttribute('data-action');
      if (action === 'tool-backdrop' || action === 'tool-close') closeToolModal();
    });

    _toolEscHandler = function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        closeToolModal();
      }
    };
    window.addEventListener('keydown', _toolEscHandler, true);
  }

  function closeToolModal() {
    if (_toolEscHandler) {
      window.removeEventListener('keydown', _toolEscHandler, true);
      _toolEscHandler = null;
    }
    if (_toolModalRoot) {
      _toolModalRoot.remove();
      _toolModalRoot = null;
    }
    _toolShowDetail = false;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  window.UI = {
    renderModeSelection: renderModeSelection,
    renderBriefing: renderBriefing,
    renderLogStream: renderLogStream,
    renderAlertQueue: renderAlertQueue,
    renderAlertDetail: renderAlertDetail,
    renderDashboards: renderDashboards,
    renderToolDock: renderToolDock,
    closeToolModal: closeToolModal,
  };
})();
