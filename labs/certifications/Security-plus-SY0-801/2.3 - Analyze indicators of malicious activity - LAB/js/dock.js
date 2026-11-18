/* ============================================================================
 * Indicator Bay 02 - screening dock (js/dock.js)
 * ----------------------------------------------------------------------------
 * Evidence racks + the loupe inspector, ported from src/components/lab/Dock.tsx.
 * ========================================================================== */

'use strict';

window.LAB_DOCK = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;
  var CONST = ENGINE.CONST;

  var RACK_ICONS = {
    malware: 'Bug',
    physical: 'DoorOpen',
    network: 'Network',
    social: 'Mail',
    application: 'FileCode',
    credential: 'KeyRound',
    noise: 'Recycle',
  };

  var FAMILY_ORDER = ['malware', 'physical', 'network', 'social', 'application', 'credential', 'benign'];

  var FAMILY_ABbr = {
    malware: 'MW',
    physical: 'PH',
    network: 'NW',
    social: 'SE',
    application: 'AP',
    credential: 'CR',
    benign: 'BN',
  };

  function Dock(deps) {
    var state = deps.state;
    var ui = deps.ui;

    var racks = DATA.RACKS.map(function (rack) {
      var items = DATA.EVIDENCE.filter(function (e) { return e.rack === rack.id; });
      var stampedCount = items.filter(function (e) { return state.stamps[e.id] && state.stamps[e.id].type; }).length;
      return h(
        'div',
        { class: 'rack' },
        h(
          'div',
          { class: 'rack-head' },
          h(
            'div',
            { class: 'rack-head-left' },
            icon(RACK_ICONS[rack.id] || 'Bug', 'i-base i-amber'),
            h('h3', { class: 'rack-name' }, rack.name),
          ),
          h('span', { class: 'rack-count' }, stampedCount + '/' + items.length + ' stamped'),
        ),
        h(
          'ul',
          { class: 'rack-items' },
          items.map(function (item) { return evidenceCard(item, deps); }),
        ),
      );
    });

    return UI.SectionShell(
      'dock',
      'Screening dock',
      'Evidence racks',
      'Search',
      'amber',
      [
        h(
          'div',
          { class: 'dock-chips' },
          UI.Chip('All data synthetic - Meridian Freight & Haulage training exercise', 'amber'),
          UI.Chip('Click an item, inspect it in the loupe, stamp it'),
        ),
        h(
          'div',
          { class: 'dock-grid' },
          h('div', { class: 'rack-stack' }, racks),
          h('div', { class: 'loupe-slot', 'data-keep-scroll': 'true' }, Loupe(deps)),
        ),
      ],
    );
  }

  function evidenceCard(item, deps) {
    var state = deps.state;
    var ui = deps.ui;
    var activeObj = deps.activeObj;
    var s = state.stamps[item.id];
    var locateIds = deps.locateIds || {};
    var isLocated = !!locateIds[item.id];
    var isFlagged = !!deps.flagged[item.id];
    var isRevealed = !!deps.revealed[item.id];

    var chips = [];
    if (s && s.family) chips.push(UI.Chip(FAMILY_ABbr[s.family], isRevealed ? 'green' : 'amber'));
    if (s && s.type) chips.push(UI.Chip(s.type.length > 26 ? s.type.slice(0, 26) + '...' : s.type, isRevealed ? 'green' : 'stone'));
    if (s && s.disposition) chips.push(UI.Chip(s.disposition.slice(0, 24)));

    var cardClass = 'evidence-card';
    if (ui.selectedId === item.id) cardClass += ' evidence-selected';
    else if (isLocated) cardClass += ' evidence-located';

    return h(
      'li',
      null,
      h(
        'button',
        {
          type: 'button',
          class: cardClass,
          'data-key': 'card-' + item.id,
          'aria-label': 'Open evidence ' + item.id + ': ' + item.title,
          onClick: function () { deps.actions.onSelect(item.id); },
        },
        h(
          'div',
          { class: 'evidence-top' },
          h('span', { class: 'evidence-id' }, item.id),
          h(
            'span',
            { class: 'evidence-flags' },
            isFlagged ? icon('TriangleAlert', 'i-sm i-red', 'Flagged as incorrect') : null,
            isRevealed ? icon('CheckCircle2', 'i-sm i-emerald', 'Correctly stamped') : null,
          ),
        ),
        h('p', { class: 'evidence-title' }, item.title),
        h('div', { class: 'evidence-chips' }, chips),
      ),
    );
  }

  function Loupe(deps) {
    var state = deps.state;
    var ui = deps.ui;
    var actions = deps.actions;
    var item = ui.selectedId ? ENGINE.evidenceById(ui.selectedId) : null;

    if (!item) {
      return h(
        'div',
        { class: 'loupe loupe-empty', 'aria-live': 'polite' },
        icon('Search', 'loupe-idle-icon'),
        h('p', { class: 'loupe-idle' }, 'Loupe idle'),
        h(
          'p',
          { class: 'loupe-idle-help' },
          'Select any evidence item from the racks. Inspect the raw artifact, then stamp the family and attack type.',
        ),
      );
    }

    var activeObj = deps.activeObj;
    var objItems = activeObj && activeObj.kind === 'stamps' ? activeObj.items : [];
    var pos = objItems.indexOf(item.id);
    var stamps = state.stamps[item.id] || {};
    var isRevealed = !!deps.revealed[item.id];
    var benignMode = item.benign !== undefined && stamps.disposition === 'Cleared - benign, tune the alert';

    var nav = null;
    if (objItems.length > 1 && pos >= 0) {
      nav = h(
        'div',
        { class: 'loupe-nav' },
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-ghost',
            onClick: function () { actions.onSelect(objItems[(pos - 1 + objItems.length) % objItems.length]); },
          },
          'prev',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-amber-soft',
            onClick: function () { actions.onSelect(objItems[(pos + 1) % objItems.length]); },
          },
          'next in objective',
          icon('ArrowRight', 'i-sm'),
        ),
      );
    }

    var blocks = item.evidence.map(function (block) {
      return h(
        'div',
        null,
        h('p', { class: 'evidence-block-label' }, block.label),
        h('pre', { class: 'evidence-pre' }, block.lines.join('\n')),
      );
    });

    var familyBtns = FAMILY_ORDER.map(function (f) {
      return UI.StampButton(
        stamps.family === f,
        CONST.FAMILY_LABELS[f],
        function () { actions.onStamp(item.id, { family: f }); },
        'Stamp family ' + CONST.FAMILY_LABELS[f],
      );
    });

    var revealBox = null;
    if (isRevealed) {
      revealBox = h(
        'div',
        { class: 'reveal-box' },
        h('p', { class: 'reveal-title' }, 'Debrief · ' + item.type),
        h('p', { class: 'reveal-feedback' }, item.feedback),
        h('p', { class: 'reveal-key' }, 'Key indicator: ' + item.keyIndicator),
        item.mitre
          ? h(
              'p',
              { class: 'reveal-mitre' },
              'ATT&CK ' + item.mitre.id + ' · ' + item.mitre.name + (item.mitre.simplified ? ' (simplified mapping)' : ''),
            )
          : null,
      );
    }

    return h(
      'div',
      { class: 'loupe', 'aria-live': 'polite' },
      h(
        'div',
        { class: 'loupe-head' },
        h(
          'div',
          { class: 'loupe-head-left' },
          icon('Stamp', 'i-base i-amber'),
          h('span', { class: 'loupe-title' }, 'Loupe · ' + item.id),
        ),
        objItems.length > 0 && pos >= 0
          ? h('span', { class: 'loupe-pos' }, 'item ' + (pos + 1) + '/' + objItems.length)
          : null,
      ),
      h(
        'div',
        { class: 'loupe-evidence', 'data-keep-scroll': 'true' },
        h('h4', { class: 'loupe-item-title' }, item.title),
        h('p', { class: 'loupe-source' }, item.source),
        nav,
        h('div', { class: 'loupe-blocks' }, blocks),
      ),
      h(
        'div',
        { class: 'loupe-stamp' },
        h('p', { class: 'loupe-step' }, '1 · Stamp the family'),
        h('div', { class: 'family-btns' }, familyBtns),
        h('p', { class: 'loupe-step loupe-step-2' }, '2 · Stamp the attack type'),
        UI.Select({
          value: stamps.type || '',
          placeholder: '- select type -',
          ariaLabel: 'Attack type for ' + item.id,
          groups: DATA.RACKS.map(function (r) {
            return {
              label: r.name,
              options: r.types.map(function (t) { return { value: t, label: t }; }),
            };
          }),
          onChange: function (val) { actions.onStamp(item.id, { type: val || undefined }); },
        }),
        h(
          'p',
          { class: 'loupe-step loupe-step-2' },
          '3 · Disposition ',
          h('span', { class: 'text-dim' }, '(checked in detection / response objectives)'),
        ),
        UI.Select({
          value: stamps.disposition || '',
          placeholder: '- route this evidence -',
          ariaLabel: 'Disposition for ' + item.id,
          options: CONST.DISPOSITIONS.map(function (d) { return { value: d, label: d }; }),
          onChange: function (val) { actions.onStamp(item.id, { disposition: val || undefined }); },
        }),
        benignMode
          ? h(
              'div',
              { class: 'obj-panel rationale-panel' },
              h(
                'label',
                { class: 'panel-label panel-label-green', 'for': 'rat-' + item.id },
                'Clearance rationale (pick the evidence-backed one)',
              ),
              UI.Select({
                id: 'rat-' + item.id,
                value: state.benignRationale[item.id] || '',
                placeholder: '- justify the clearance -',
                ariaLabel: 'Clearance rationale for ' + item.id,
                options: [
                  { value: item.benign.rationale, label: item.benign.rationale },
                  { value: 'looks safe', label: 'It looks benign - no further verification needed' },
                  { value: 'verbal-ok', label: 'A senior analyst verbally said this one is safe to dismiss' },
                ],
                onChange: function (val) { actions.onRationale(item.id, val); },
              }),
            )
          : null,
        revealBox,
      ),
    );
  }

  return { Dock: Dock };
})();
