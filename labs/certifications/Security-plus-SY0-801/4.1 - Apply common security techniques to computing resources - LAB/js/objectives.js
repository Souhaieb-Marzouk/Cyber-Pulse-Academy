// Northwind Hardening Yard - validation engine (static port of engine.ts).
// Machine-checkable rules, posture computation, star scoring.
'use strict';

(function () {
  var DATA = window.LAB_DATA;

  function norm(v) {
    return String(v == null ? '' : v).trim().toLowerCase();
  }

  // deterministic seeded shuffle (R6: pairing display order must not reveal pairs)
  function stableShuffle(arr, seed) {
    var a = arr.slice();
    var s = seed;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) % 2147483648;
      var j = s % (i + 1);
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function objectivesFor(mode) {
    return mode === 'hard' ? DATA.HARD_OBJECTIVES : DATA.MEDIUM_OBJECTIVES;
  }

  // ---- validation ----

  function checkToggles(required, env) {
    return Object.keys(required).every(function (key) {
      var want = required[key];
      var parts = key.split('.');
      var got = env[parts[0]] ? env[parts[0]][parts[1]] : undefined;
      if (typeof want === 'boolean') return got === want;
      return norm(got) === norm(want);
    });
  }

  function exercisePassed(ex, answer, env) {
    var k;
    switch (ex.type) {
      case 'toggles':
        return checkToggles(ex.required, env);
      case 'match': {
        var a = answer || {};
        return Object.keys(ex.solution).every(function (item) {
          return item in a && norm(a[item]) === norm(ex.solution[item]);
        });
      }
      case 'multi': {
        var arr = Array.isArray(answer) ? answer : [];
        var want = ex.solution.slice().sort();
        var got = arr.slice().sort();
        return (
          want.length === got.length &&
          want.every(function (v, i) {
            return norm(v) === norm(got[i]);
          })
        );
      }
      case 'radio':
        return norm(answer) === norm(ex.solution);
      case 'sequence': {
        var seq = Array.isArray(answer) ? answer : [];
        return (
          seq.length === ex.solution.length &&
          ex.solution.every(function (v, i) {
            return norm(seq[i]) === norm(v);
          })
        );
      }
    }
    return false;
  }

  // per-option correctness for match exercises (drives per-item highlighting)
  function matchItemState(ex, answer, revealed) {
    var a = answer || {};
    var out = {};
    ex.items.forEach(function (item) {
      if (!a[item.id]) out[item.id] = 'blank';
      else if (!revealed) out[item.id] = 'correct'; // neutral until revealed
      else out[item.id] = norm(a[item.id]) === norm(ex.solution[item.id]) ? 'correct' : 'wrong';
    });
    return out;
  }

  // ---- posture ----

  function computePosture(env) {
    var applied = 0;
    var total = 0;
    var byZone = {};
    DATA.ASSETS.forEach(function (asset) {
      var zoneTotal = ((byZone[asset.zone] && byZone[asset.zone].total) || 0) + asset.controls.length;
      var zoneApplied = (byZone[asset.zone] && byZone[asset.zone].applied) || 0;
      asset.controls.forEach(function (c) {
        total += 1;
        var got = env[asset.id] ? env[asset.id][c.id] : undefined;
        var ok = typeof c.good === 'boolean' ? got === c.good : norm(got) === norm(c.good);
        if (ok) {
          applied += 1;
          zoneApplied += 1;
        }
      });
      byZone[asset.zone] = {
        applied: zoneApplied,
        total: zoneTotal,
        pct: Math.round((zoneApplied / zoneTotal) * 100),
      };
    });
    return { applied: applied, total: total, pct: Math.round((applied / total) * 100), byZone: byZone };
  }

  // ---- scoring / stars ----

  function computeScore(mode, state) {
    var objs = objectivesFor(mode);
    var passed = objs.filter(function (o) {
      return state.checks[o.id] && state.checks[o.id].passed;
    }).length;
    var firstTry = objs.filter(function (o) {
      return state.checks[o.id] && state.checks[o.id].firstTry;
    }).length;
    var items = DATA.QUIZZES[mode];
    var quizCorrect = items.filter(function (q) {
      return state.quizAnswers[q.id] === q.answer;
    }).length;
    var hintUses = Object.keys(state.hints).reduce(function (s, k) {
      return s + state.hints[k];
    }, 0);

    // objective stars: 3 base, minus retries/hints
    var obj = 0;
    if (passed === objs.length) {
      obj = 3;
      if (firstTry < objs.length) obj -= 1;
      if (hintUses > Math.ceil(objs.length / 4)) obj -= 1;
      if (hintUses > objs.length) obj = Math.max(obj, 1);
    } else {
      obj = passed >= objs.length * 0.7 ? 2 : passed > 0 ? 1 : 0;
    }

    // quiz stars: 2 base
    var quizRatio = items.length ? quizCorrect / items.length : 0;
    var quiz = 0;
    if (state.quizSubmitted) {
      quiz = quizRatio >= 0.8 ? 2 : quizRatio >= 0.5 ? 1 : 0;
    }

    var stars = Math.max(0, Math.min(5, obj + quiz));
    return {
      objectivesPassed: passed,
      objectivesTotal: objs.length,
      quizCorrect: quizCorrect,
      quizTotal: items.length,
      stars: stars,
      starParts: { obj: obj, quiz: quiz, penalty: 0 },
      hintUses: hintUses,
      firstTryRate: objs.length ? Math.round((firstTry / objs.length) * 100) : 0,
    };
  }

  function allObjectivesPassed(mode, state) {
    return objectivesFor(mode).every(function (o) {
      return state.checks[o.id] && state.checks[o.id].passed;
    });
  }

  // R2 answer lock: explicit "new attempt" resets the answer + shown result while
  // preserving attempt history (attempts / firstTry) so stars cannot be inflated.
  function retakeObjective(state, id) {
    var prev = state.checks[id];
    if (!prev) return state;
    var answers = Object.assign({}, state.answers);
    delete answers[id];
    var checks = Object.assign({}, state.checks);
    checks[id] = { passed: false, attempts: prev.attempts, firstTry: prev.firstTry, revealed: false };
    return Object.assign({}, state, { answers: answers, checks: checks });
  }

  // Integrity: when a yard control changes, any PASSED toggles objective that
  // depends on that exact control is invalidated (its answer IS the live state).
  function invalidateTogglesChecks(state, mode, assetId, controlId) {
    var key = assetId + '.' + controlId;
    var touched = objectivesFor(mode).filter(function (o) {
      return (
        o.exercise.type === 'toggles' &&
        key in o.exercise.required &&
        state.checks[o.id] &&
        state.checks[o.id].passed
      );
    });
    if (touched.length === 0) return state;
    var checks = Object.assign({}, state.checks);
    touched.forEach(function (o) {
      checks[o.id] = Object.assign({}, checks[o.id], { passed: false, revealed: false });
    });
    return Object.assign({}, state, { checks: checks });
  }

  window.LabEngine = {
    norm: norm,
    stableShuffle: stableShuffle,
    objectivesFor: objectivesFor,
    checkToggles: checkToggles,
    exercisePassed: exercisePassed,
    matchItemState: matchItemState,
    computePosture: computePosture,
    computeScore: computeScore,
    allObjectivesPassed: allObjectivesPassed,
    retakeObjective: retakeObjective,
    invalidateTogglesChecks: invalidateTogglesChecks,
  };
})();
