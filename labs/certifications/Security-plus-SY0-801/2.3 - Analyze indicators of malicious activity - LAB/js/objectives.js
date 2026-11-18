/* ============================================================================
 * Indicator Bay 02 - objective engine (js/objectives.js)
 * ----------------------------------------------------------------------------
 * The CHECK RESULTS validation engine, scoring and unlock rules, ported 1:1
 * from src/lib/lab/engine.ts. No validation was weakened or tightened during
 * the port: every rule, message and threshold is identical.
 * ========================================================================== */

'use strict';

window.LAB_ENGINE = (function () {
  var DATA = window.LAB_DATA;
  var CONST = window.LAB_CONST;

  function objectivesFor(mode) {
    return mode === 'medium' ? DATA.MEDIUM_OBJECTIVES : DATA.HARD_OBJECTIVES;
  }

  function evidenceById(id) {
    return DATA.EVIDENCE_BY_ID[id];
  }

  function matchPanel(pid) {
    return DATA.MATCH_PANELS[pid];
  }

  function beaconScenario(sid) {
    for (var i = 0; i < DATA.BEACON_SCENARIOS.length; i++) {
      if (DATA.BEACON_SCENARIOS[i].id === sid) return DATA.BEACON_SCENARIOS[i];
    }
    return null;
  }

  /* ---------------------- per-objective validation ------------------- */

  function validateObjective(state, obj) {
    var detail = [];
    var wrong = 0;
    var i, id, item, s, chosen;

    if (obj.kind === 'stamps') {
      for (i = 0; i < obj.items.length; i++) {
        id = obj.items[i];
        item = evidenceById(id);
        s = state.stamps[id];
        if (!s || !s.family || !s.type) {
          wrong++;
          detail.push(id + ': not fully stamped yet.');
          continue;
        }
        var okFamily = s.family === item.family;
        var okType = s.type === item.type;
        if (!okFamily || !okType) {
          wrong++;
          detail.push(id + ': stamp does not match the evidence. Re-read the artifact and try again.');
        }
      }
      if (wrong === 0) return { pass: true, detail: [] };
      return {
        pass: false,
        detail: [
          obj.items.length > 4
            ? wrong + ' of ' + obj.items.length + ' items would not hold up in a debrief. Wrong stamps are flagged in the racks.'
            : wrong + ' of ' + obj.items.length + ' items stamped incorrectly.',
        ],
      };
    }

    if (obj.kind === 'match' && obj.matchPanelId) {
      var panel = matchPanel(obj.matchPanelId);
      for (i = 0; i < panel.pairs.length; i++) {
        var p = panel.pairs[i];
        chosen = state.match[obj.matchPanelId + ':' + p.leftId];
        if (chosen !== p.answer) {
          wrong++;
          detail.push('"' + p.left + '" is not paired correctly yet.');
        }
      }
      return {
        pass: wrong === 0,
        detail: wrong === 0 ? [] : [wrong + ' pairing' + (wrong > 1 ? 's' : '') + ' still wrong.'],
      };
    }

    if (obj.kind === 'beacon') {
      for (i = 0; i < obj.items.length; i++) {
        var sid = obj.items[i];
        var sc = beaconScenario(sid);
        if (!sc) continue;
        if (state.beacon[sid] !== sc.answer) {
          wrong++;
          detail.push('Board tile ' + sid + ' tagged incorrectly.');
        }
      }
      return {
        pass: wrong === 0,
        detail: wrong === 0 ? [] : [wrong + ' tile' + (wrong > 1 ? 's' : '') + ' tagged incorrectly.'],
      };
    }

    if (obj.kind === 'benign') {
      for (i = 0; i < obj.items.length; i++) {
        id = obj.items[i];
        item = evidenceById(id);
        s = state.stamps[id];
        if (!s || s.disposition !== 'Cleared - benign, tune the alert') {
          wrong++;
          detail.push(id + ': disposition is not "Cleared - benign".');
          continue;
        }
        if (state.benignRationale[id] !== item.benign.rationale) {
          wrong++;
          detail.push(id + ': the rationale does not match the evidence on file.');
        }
      }
      if (obj.extraIocPick) {
        if (state.iocPick[obj.extraIocPick.itemId] !== obj.extraIocPick.answer) {
          wrong++;
          detail.push('The decisive IoC question is answered incorrectly.');
        }
      }
      if (wrong === 0) return { pass: true, detail: [] };
      return {
        pass: false,
        detail: [
          wrong + ' part' + (wrong > 1 ? 's' : '') + ' of the triage decision ' + (wrong > 1 ? 'are' : 'is') + ' wrong.',
        ],
      };
    }

    if (obj.kind === 'plan') {
      var correct = DATA.RESPONSE_STEPS.map(function (st) { return st.id; });
      if (
        state.sequence.length !== correct.length ||
        state.sequence.some(function (sid, idx) { return sid !== correct[idx]; })
      ) {
        wrong++;
        detail.push('The response sequence is out of order. Think contain, preserve, revoke, block, escalate, improve.');
      }
      var routeItems = obj.routeItems || [];
      for (i = 0; i < routeItems.length; i++) {
        var r = routeItems[i];
        if (!state.stamps[r.itemId] || state.stamps[r.itemId].disposition !== r.answer) {
          wrong++;
          detail.push(r.itemId + ': disposition does not match the incident playbook.');
        }
      }
      if (wrong === 0) return { pass: true, detail: [] };
      return {
        pass: false,
        detail: [
          wrong + ' part' + (wrong > 1 ? 's' : '') + ' of the response plan ' + (wrong > 1 ? 'are' : 'is') + ' wrong.',
        ],
      };
    }

    return { pass: false, detail: ['Unknown objective kind.'] };
  }

  /* ------------------------------ scoring ---------------------------- */

  function scoreLab(state, mode) {
    var objs = objectivesFor(mode);
    var passed = 0;
    var firstTry = 0;
    var hintsUsed = 0;
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      var r = state.results[o.id];
      if (r && r.passed) {
        passed++;
        if (r.firstTry) firstTry++;
      }
      if ((state.hints[o.id] || 0) > 0) hintsUsed++;
      if (state.nudgeUsed[o.id]) hintsUsed++;
    }
    var total = objs.length;
    var firstTryRate = total ? firstTry / total : 0;
    var hintRate = total ? hintsUsed / total : 0;
    var stars = Math.max(1, Math.round(1 + 4 * (0.75 * firstTryRate + 0.25 * (1 - hintRate))));
    var quizList = mode === 'medium' ? DATA.MEDIUM_QUIZ : DATA.HARD_QUIZ;
    var quizCorrect = 0;
    for (var q = 0; q < quizList.length; q++) {
      if (state.quiz[quizList[q].id] === quizList[q].correct) quizCorrect++;
    }
    return { passed: passed, total: total, firstTry: firstTry, hintsUsed: hintsUsed, stars: stars, quizCorrect: quizCorrect, quizQuestions: quizList.length };
  }

  function allObjectivesPassed(state, mode) {
    var objs = objectivesFor(mode);
    for (var i = 0; i < objs.length; i++) {
      var r = state.results[objs[i].id];
      if (!r || !r.passed) return false;
    }
    return true;
  }

  /* Unlock rule: hard mode is free-roam; medium introduces objectives one by
     one - an objective unlocks when every earlier one has passed. */
  function isObjectiveUnlocked(state, obj, mode) {
    var objs = objectivesFor(mode);
    var idx = -1;
    for (var i = 0; i < objs.length; i++) {
      if (objs[i].id === obj.id) { idx = i; break; }
    }
    if (mode === 'hard') return true;
    if (idx <= 0) return true;
    for (var j = 0; j < idx; j++) {
      var r = state.results[objs[j].id];
      if (!r || !r.passed) return false;
    }
    return true;
  }

  return {
    objectivesFor: objectivesFor,
    evidenceById: evidenceById,
    matchPanel: matchPanel,
    beaconScenario: beaconScenario,
    validateObjective: validateObjective,
    scoreLab: scoreLab,
    allObjectivesPassed: allObjectivesPassed,
    isObjectiveUnlocked: isObjectiveUnlocked,
    CONST: CONST,
  };
})();
