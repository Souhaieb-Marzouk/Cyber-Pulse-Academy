/* ============================================================================
 * Indicator Bay 02 - analyst deskwork (js/desk.js)
 * ----------------------------------------------------------------------------
 * Beacon board + match clipboards, ported from src/components/lab/Deskwork.tsx.
 * The pairing shuffle fix (R6) is carried over: rows and options are shuffled
 * per session so the display order never reveals the correct pairs.
 * ========================================================================== */

'use strict';

window.LAB_DESK = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;

  function Deskwork(deps) {
    var state = deps.state;
    var mode = deps.mode;
    var objs = ENGINE.objectivesFor(mode);

    var beaconTarget = null;
    for (var i = 0; i < objs.length; i++) {
      if (objs[i].kind === 'beacon') { beaconTarget = objs[i]; break; }
    }
    var visibleBeacons = beaconTarget
      ? DATA.BEACON_SCENARIOS.filter(function (s) { return beaconTarget.items.indexOf(s.id) !== -1; })
      : DATA.BEACON_SCENARIOS;
    var taggedCount = visibleBeacons.filter(function (s) { return state.beacon[s.id] === s.answer; }).length;
    var beaconDone = taggedCount === visibleBeacons.length;

    var beaconTiles = visibleBeacons.map(function (s, i) {
      var ok = state.beacon[s.id] === s.answer;
      var dimmed = mode === 'medium' && i >= 6; // carried over: medium tiles sit dimmed on the night board
      var tileClass = 'beacon-tile';
      if (dimmed) tileClass += ' beacon-dimmed';
      else if (ok) tileClass += ' beacon-ok';
      return h(
        'li',
        { class: tileClass },
        h(
          'div',
          { class: 'beacon-top' },
          h('span', { class: 'evidence-id' }, s.id),
          ok ? h('span', { class: 'beacon-tagged' }, 'tagged') : null,
        ),
        h('p', { class: 'beacon-scenario' }, s.scenario),
        UI.Select({
          value: state.beacon[s.id] || '',
          placeholder: '- IoC category -',
          ariaLabel: 'IoC category for observation ' + s.id,
          groups: [
            {
              label: 'Indicators of compromise',
              options: ENGINE.CONST.IOC_NAMES.map(function (n) { return { value: n, label: n }; }),
            },
          ],
          onChange: function (val) { deps.actions.onBeacon(s.id, val); },
        }),
      );
    });

    var children = [
      h(
        'div',
        { class: 'beacon-board' },
        h(
          'div',
          { class: 'beacon-head' },
          h(
            'h3',
            { class: 'desk-title' },
            icon('Radio', 'i-base i-amber'),
            'Beacon board - tag each observation with its IoC category',
          ),
          h(
            'span',
            { class: 'desk-count ' + (beaconDone ? 'text-emerald' : 'text-dim') },
            taggedCount + '/' + visibleBeacons.length + ' tagged',
          ),
        ),
        h('ul', { class: 'beacon-grid' }, beaconTiles),
        h(
          'p',
          { class: 'beacon-foot' },
          'Tiles 7-12 sit on the night-shift board (advanced detection objective)',
        ),
      ),
    ];

    // Match clipboards - medium only (hard mode covers these via racks + quiz)
    if (mode === 'medium') {
      Object.keys(DATA.MATCH_PANELS).forEach(function (pid) {
        var panel = DATA.MATCH_PANELS[pid];
        var owner = null;
        for (var j = 0; j < objs.length; j++) {
          if (objs[j].matchPanelId === pid) { owner = objs[j]; break; }
        }
        var done = panel.pairs.every(function (p) {
          return state.match[pid + ':' + p.leftId] === p.answer;
        });
        children.push(MatchPanel(pid, panel, owner ? owner.id : undefined, done, deps));
      });
    }

    return UI.SectionShell('deskwork', 'Analyst deskwork', 'Beacon board & clipboards', 'Radar', 'amber', children);
  }

  function MatchPanel(pid, panel, owner, done, deps) {
    var state = deps.state;
    var ui = deps.ui;
    var actions = deps.actions;

    // R6 shuffle: stable for the session, generated on first render (the
    // equivalent of the original per-mount useState initializer).
    if (!ui.matchShuffles[pid]) {
      ui.matchShuffles[pid] = UI.shuffle(panel.pairs).map(function (p) {
        return { leftId: p.leftId, left: p.left, options: UI.shuffle(p.options), answer: p.answer };
      });
    }

    var rows = ui.matchShuffles[pid].map(function (p) {
      var chosen = state.match[pid + ':' + p.leftId] || '';
      var ok = chosen === p.answer;
      return h(
        'li',
        { class: 'match-row' },
        h(
          'span',
          { class: 'match-left ' + (ok ? 'match-left-ok' : 'match-left-pending') },
          p.left,
        ),
        UI.Select({
          value: chosen,
          placeholder: '- pair it -',
          ariaLabel: 'Definition for ' + p.left,
          options: p.options.map(function (o) { return { value: o, label: o }; }),
          onChange: function (val) { actions.onMatch(pid, p.leftId, val); },
        }),
      );
    });

    return h(
      'div',
      { class: 'match-panel' },
      h(
        'div',
        { class: 'beacon-head' },
        h(
          'h3',
          { class: 'desk-title' },
          icon('ClipboardList', 'i-base i-amber'),
          panel.title,
          owner ? h('span', { class: 'text-dim' }, ' (' + owner + ')') : null,
        ),
        h(
          'span',
          { class: 'desk-count ' + (done ? 'text-emerald' : 'text-dim') },
          done ? 'complete' : 'pending',
        ),
      ),
      h('ul', { class: 'match-list' }, rows),
    );
  }

  return { Deskwork: Deskwork };
})();
