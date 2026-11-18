/* ============================================================================
 * Indicator Bay 02 - static sections (js/sections.js)
 * ----------------------------------------------------------------------------
 * Briefing, field guide (knowledge core) and debrief (field notes), ported
 * from src/components/lab/Sections.tsx. All copy is carried over 1:1.
 * ========================================================================== */

'use strict';

window.LAB_SECTIONS = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var DATA = window.LAB_DATA;

  /* ------------------------------ Briefing --------------------------- */

  function Briefing(mode, onAccept, collapsible, ui) {
    if (collapsible && !ui.briefingOpen) {
      return h(
        'button',
        {
          type: 'button',
          class: 'briefing-reopen',
          onClick: function () {
            ui.briefingOpen = true;
            onAccept('rerender');
          },
        },
        'Re-read the shift briefing',
      );
    }
    return h(
      'div',
      { class: 'briefing' },
      h(
        'div',
        { class: 'briefing-head' },
        h('p', { class: 'kicker' }, 'Shift briefing · confidential'),
        h('h2', { class: 'briefing-title' }, 'Night auditor duty - Meridian Freight & Haulage'),
      ),
      h(
        'div',
        { class: 'briefing-body' },
        h(
          'p',
          null,
          h('strong', { class: 'text-strong' }, 'The scene.'),
          ' You are the overnight analyst for Meridian Freight & Haulage (MFH), a fictional mid-size freight company: 800 staff, two depots, a booking portal, badge-controlled warehouses, and a CFO who hates surprises. Monday morning\u2019s triage queue is overflowing, and the day-shift lead left you one instruction: ',
          h('em', null, '\u201CEverything in the racks shows an indicator. Find the signal, stamp the threat, and route it.\u201D'),
        ),
        h(
          'p',
          null,
          h('strong', { class: 'text-strong' }, 'The mission.'),
          ' This lab covers CompTIA Security+ SY0-801 Domain 2, ',
          h('strong', { class: 'text-strong' }, 'Lesson: Analyze indicators of malicious activity'),
          ' (official objective 2.5, exam weight: Domain 2 carries 24%). You will screen ',
          h('strong', { class: 'text-strong' }, '41 threat items across six racks plus a noise bin of false positives'),
          ' - malware, physical, network, social engineering, application and credential attacks - then tag the indicators of compromise they leave behind and choose the right response. That is exactly what the exam verb \u201Cgiven a scenario, analyze\u201D asks of you.',
        ),
        h(
          'p',
          null,
          h('strong', { class: 'text-strong' }, 'Why it matters.'),
          ' These seven families are the backbone of Domain 2 and the daily bread of every SOC. Miss one family and an attacker walks straight past you. Master the shapes here and the certification scenarios become pattern-matching.',
        ),
        h(
          'div',
          { class: 'obj-panel' },
          h('p', { class: 'panel-label panel-label-amber' }, 'Ground rules'),
          h(
            'ul',
            { class: 'bullet-list' },
            h('li', null, 'All evidence is synthetic training data (fictional .example domains, TEST-NET addresses, invented staff).'),
            h('li', null, 'Defensive framing only: recognition, detection and response - no attack instructions.'),
            h('li', null, 'Your shift is saved automatically. The RESET control wipes the board back to a pristine shift.'),
          ),
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-primary btn-accept',
            onClick: function () { onAccept('accept'); },
          },
          collapsible ? 'Back to the dock' : 'Accept shift - start screening',
        ),
      ),
    );
  }

  /* ---------------------------- Field guide -------------------------- */

  function FieldGuide(ui, render) {
    var familyCards = DATA.GUIDE.map(function (fam) {
      return h(
        'div',
        { class: 'guide-card' },
        h(
          'div',
          { class: 'guide-card-head' },
          h('h3', { class: 'guide-name' }, fam.name),
          UI.Chip(fam.chainRole),
        ),
        h(
          'ul',
          { class: 'guide-types' },
          fam.types.map(function (t) {
            return h(
              'li',
              null,
              h('span', { class: 'text-strong' }, t.type),
              h('span', { class: 'text-dim' }, ' - ' + t.sign),
            );
          }),
        ),
      );
    });

    var exampleCards = DATA.REAL_WORLD_EXAMPLES.map(function (ex) {
      return h(
        'div',
        { class: 'guide-card' },
        h(
          'h3',
          { class: 'example-title' },
          icon('ShieldAlert', 'i-sm i-red'),
          ex.title,
        ),
        h('p', { class: 'example-body' }, ex.body),
      );
    });

    var glossaryChips = DATA.GLOSSARY.map(function (g) {
      var open = ui.openTerm === g.term;
      return h(
        'li',
        null,
        h(
          'button',
          {
            type: 'button',
            class: 'glossary-chip' + (open ? ' glossary-open' : ''),
            'aria-pressed': open ? 'true' : 'false',
            onClick: function () {
              ui.openTerm = open ? null : g.term;
              render();
            },
          },
          g.term,
        ),
      );
    });

    var def = null;
    if (ui.openTerm) {
      var found = null;
      for (var i = 0; i < DATA.GLOSSARY.length; i++) {
        if (DATA.GLOSSARY[i].term === ui.openTerm) found = DATA.GLOSSARY[i];
      }
      if (found) {
        def = h(
          'p',
          { class: 'glossary-def', 'aria-live': 'polite' },
          h('strong', { class: 'text-amber' }, ui.openTerm + ': '),
          found.def,
        );
      }
    }

    return UI.SectionShell('guide', 'Knowledge core', 'Field guide - the seven families', 'BookOpen', 'amber', [
      h(
        'p',
        { class: 'guide-intro' },
        'Seven threat families, each with its signature shapes. Study the signs first, then screen the racks - every stamp you make should be a match against this guide. Family placement on the attack chain: social engineering and physical attacks are classic ',
        h('strong', { class: 'text-strong' }, 'Initial Access'),
        '; malware spans ',
        h('strong', { class: 'text-strong' }, 'Execution, Persistence and Impact'),
        '; credential attacks live in ',
        h('strong', { class: 'text-strong' }, 'Credential Access'),
        '; network attacks cover everything from ',
        h('strong', { class: 'text-strong' }, 'Collection'),
        ' (sniffing) to ',
        h('strong', { class: 'text-strong' }, 'Impact'),
        ' (DDoS); application attacks ride ',
        h('strong', { class: 'text-strong' }, 'Exploitation'),
        ' toward ',
        h('strong', { class: 'text-strong' }, 'Privilege Escalation'),
        '.',
      ),
      h('div', { class: 'guide-grid' }, familyCards),
      h('div', { class: 'example-grid' }, exampleCards),
      h(
        'div',
        { class: 'glossary-box' },
        h('h3', { class: 'glossary-title' }, icon('GraduationCap', 'i-base i-amber'), 'Glossary - tap a term'),
        h('ul', { class: 'glossary-list' }, glossaryChips),
        def,
      ),
    ]);
  }

  /* ----------------------------- Debrief ----------------------------- */

  var DETECTION_ROWS = [
    ['Identity / IdP logs', 'Alert on failed-auth SHAPE: many accounts + few attempts each = spraying; one account + huge volume = brute force; same session from two geos = replay'],
    ['EDR / process telemetry', 'Office apps spawning PowerShell/cmd; drivers from user-writable paths; OS process list differing from kernel view (rootkit)'],
    ['File integrity + mail sandbox', 'Hash changes on host binaries; double extensions; attachment hashes matched against threat feeds'],
    ['DNS / TLS proxy logs', 'Downgrade handshakes (SSLv3/RC4); resolver answer divergence between sites (cache poisoning); registrar record changes'],
    ['NetFlow / firewall', 'Volumetric floods from thousands of sources; sequential SMB sweeps; promiscuous capture sources'],
    ['Badge / camera systems', 'Duplicate badge reads at impossible distances (skimming); badge auths vs headcount on camera (tailgating); alarm-zone bypasses'],
    ['API / WAF logs', 'SQL-shaped errors in responses; identical requests replayed; paths escaping the webroot; tokens signed by retired keys'],
  ];

  function Debrief() {
    var mitigationCards = DATA.MITRE_MITIGATIONS.map(function (m) {
      return h(
        'div',
        { class: 'obj-panel' },
        h('p', { class: 'mitre-id' }, m.id + ' · ' + m.name),
        h('p', { class: 'mitre-covers' }, m.covers),
      );
    });

    var blueTakeaways = [
      'Shape beats single events: the STATISTICS of failures (per-account vs per-password) separate spraying from brute force.',
      'Identity is the perimeter: impossible travel and concurrent sessions catch what passwords cannot.',
      'Baselines make anomalies visible - no baseline, no logic-bomb or backup false-positive call.',
      'Clearing a false positive is a detection-engineering task: record the rationale, then tune the rule.',
      'Physical and cyber evidence interlock: badge logs are identity logs.',
    ].map(function (li) { return h('li', null, li); });

    var redTakeaways = [
      'Every family here is entry or escalation: the chains stack (phish \u2192 fileless \u2192 rootkit \u2192 ransomware).',
      'Trusted channels are the attack surface: SMS, voice, QR, badge, a manager\u2019s voice and face.',
      'Volume discipline: staying under thresholds is what makes quiet attacks quiet.',
      'Forgetting to remove a trigger - or a retired signing key - is the gift that keeps giving.',
    ].map(function (li) { return h('li', null, li); });

    var referenceLinks = DATA.MITRE_LINKS.map(function (l) {
      return h(
        'li',
        null,
        h('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'ext-link' }, 'ATT&CK ' + l.id + ' · ' + l.name),
      );
    });
    referenceLinks.push(
      h(
        'li',
        null,
        h('a', { href: 'https://www.comptia.org/en-us/certifications/security/v8', target: '_blank', rel: 'noopener noreferrer', class: 'ext-link' }, 'CompTIA Security+ V8 (SY0-801) - official objectives'),
      ),
    );

    return UI.SectionShell('debrief', 'End-of-shift report', 'Debrief & field notes', 'BadgeCheck', 'green', [
      h(
        'div',
        null,
        h('h3', { class: 'debrief-heading' }, 'Detection opportunities'),
        h(
          'div',
          { class: 'table-wrap' },
          h(
            'table',
            { class: 'detection-table' },
            h(
              'thead',
              { class: 'table-head' },
              h(
                'tr',
                null,
                h('th', null, 'Data source'),
                h('th', null, 'Example detection logic'),
              ),
            ),
            h(
              'tbody',
              { class: 'table-body' },
              DETECTION_ROWS.map(function (row) {
                return h(
                  'tr',
                  null,
                  h('td', { class: 'table-src' }, row[0]),
                  h('td', null, row[1]),
                );
              }),
            ),
          ),
        ),
      ),
      h(
        'div',
        null,
        h('h3', { class: 'debrief-heading' }, 'Mitigation recommendations (ATT&CK mitigation IDs)'),
        h('div', { class: 'mitre-grid' }, mitigationCards),
      ),
      h(
        'div',
        { class: 'takeaway-grid' },
        h(
          'div',
          { class: 'takeaway takeaway-blue' },
          h('h3', { class: 'takeaway-title takeaway-title-blue' }, 'Blue-team takeaways'),
          h('ul', { class: 'bullet-list' }, blueTakeaways),
        ),
        h(
          'div',
          { class: 'takeaway takeaway-red' },
          h('h3', { class: 'takeaway-title takeaway-title-red' }, 'Red-team mindset takeaways'),
          h('ul', { class: 'bullet-list' }, redTakeaways),
        ),
      ),
      h(
        'div',
        null,
        h('h3', { class: 'debrief-heading' }, 'Official references'),
        h('ul', { class: 'ref-list' }, referenceLinks),
      ),
    ]);
  }

  return { Briefing: Briefing, FieldGuide: FieldGuide, Debrief: Debrief };
})();
