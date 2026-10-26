/**
 * Objective validation engine + scoring — plain-JS port of the original
 * lab's src/lib/lab/validation.ts.
 *
 * One validator per objective id, plus the scoring functions used by the
 * sign-off desk (readiness, starRating) and the knowledge check
 * (quizScore, computeQuizScore). Behavior-identical to the original.
 */

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function eqArr(a, b) {
  return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
}

function eqSet(a, b) {
  return a.length === b.length && a.every(function (v) { return b.indexOf(v) !== -1; });
}

function correctIds(xs) {
  return xs.filter(function (x) { return x.correct; }).map(function (x) { return x.id; });
}

/* ------------------------------------------------------------------ */
/* validators — one per objective id                                   */
/* ------------------------------------------------------------------ */

var VALIDATORS = {
  /* ---- MEDIUM ---- */
  M1: function (s) { return eqArr(s.phaseOrder, PHASE_IDS); },
  M2: function (s) { return ACTIVITIES.every(function (a) { return (s.activityPhase[a.id] || '') === a.phase; }); },
  M3: function (s) { return ROLE_CARDS.every(function (r) { return (s.roleMatch[r.id] || '') === r.id; }); },
  M4: function (s) { return eqSet(s.crewMedium, correctIds(CREW_MEDIUM)); },
  M5: function (s) {
    return INCIDENTS_MEDIUM.every(function (i) {
      return (s.incSev[i.id] || '') === i.sev && (s.incEsc[i.id] || '') === i.esc;
    });
  },
  M6: function (s) { return PLAN_SCENARIOS_M.every(function (p) { return (s.planMatchM[p.id] || '') === p.plan; }); },
  M7: function (s) {
    return STAKEHOLDERS_M.every(function (st) {
      return (s.commsCh[st.id] || '') === st.ch &&
        (s.commsTim[st.id] || '') === st.tim &&
        (s.commsAud[st.id] || '') === st.aud;
    });
  },
  M8: function (s) {
    return EXERCISES_M.every(function (x) { return (s.exMatchM[x.id] || '') === x.type; }) &&
      eqArr(s.exOrder, EX_TYPES.map(function (t) { return t.id; }));
  },
  M9: function (s) {
    return RETENTION_M.every(function (r) { return (s.retDurM[r.id] || '') === r.dur; }) && s.holdTarget === 'ret-evd';
  },
  M10: function (s) {
    return eqSet(s.playPick, correctIds(PLAY_CANDIDATES)) &&
      eqArr(s.playOrder, PLAYBOOK_STEPS.map(function (p) { return p.id; }));
  },
  M11: function (s) { return DUTY_LOG.every(function (d) { return (s.dutyEsc[d.id] || '') === d.esc; }); },
  M12: function (s) { return eqSet(s.charterPick, correctIds(CHARTER_OPTIONS)); },

  /* ---- HARD ---- */
  H1: function (s) {
    return TIMELINE_EVENTS.every(function (e) { return (s.eventPhase[e.id] || '') === e.phase; }) &&
      eqArr(s.phaseOrder, PHASE_IDS);
  },
  H2: function (s) { return eqSet(s.crewHard, correctIds(ROSTER_HARD)); },
  H3: function (s) {
    return INCIDENTS_HARD.every(function (i) {
      return (s.incSev[i.id] || '') === i.sev && (s.incEsc[i.id] || '') === i.esc;
    }) && eqArr(s.queueOrder, ['hinc-a', 'hinc-c', 'hinc-b']);
  },
  H4: function (s) { return STAGES_H.every(function (st) { return (s.exStageH[st.id] || '') === st.type; }); },
  H5: function (s) { return PLAN_SCENARIOS_H.every(function (p) { return (s.planMatchH[p.id] || '') === p.plan; }); },
  H6: function (s) { return PARTIES_H.every(function (p) { return (s.commsActionH[p.id] || '') === p.action; }); },
  H7: function (s) {
    return RETENTION_H.every(function (r) { return (s.retActionH[r.id] || '') === r.action; }) && s.custodyPick === 'cs4';
  },
  H8: function (s) {
    return eqSet(s.auditMark, AUDIT_LINES.filter(function (l) { return l.defect; }).map(function (l) { return l.id; }));
  },
  H9: function (s) {
    return INJECTS.every(function (i) {
      var correct = '';
      for (var j = 0; j < i.options.length; j++) {
        if (i.options[j].correct) { correct = i.options[j].id; break; }
      }
      return (s.warPick[i.id] || '') === correct;
    });
  },
};

/* ------------------------------------------------------------------ */
/* scoring                                                             */
/* ------------------------------------------------------------------ */

/** The FIRST submission's score is what counts — practice retries never change it. */
function quizScore(s) {
  if (s.quizFiledScore !== null && s.quizFiledScore !== undefined) return s.quizFiledScore;
  if (!s.quizSubmitted) return 0;
  return computeQuizScore(s);
}

/** Pure answer-key ratio — no submitted gate. Used when filing the first score. */
function computeQuizScore(s) {
  var set = s.mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
  var correct = set.filter(function (q) { return s.quizAnswers[q.id] === q.answer; }).length;
  return correct / set.length;
}

function objectiveQuality(s, id) {
  var o = s.obj[id];
  if (!o || !o.done) return 0;
  if (o.firstTry && o.hints === 0) return 1;
  if (o.attempts <= 2 && o.hints <= 1) return 0.7;
  return 0.4;
}

function modeObjectiveIds(mode) {
  var prefix = mode === 'hard' ? 'H' : 'M';
  return Object.keys(VALIDATORS).filter(function (k) { return k.indexOf(prefix) === 0; });
}

function readiness(s) {
  var ids = modeObjectiveIds(s.mode === 'hard' ? 'hard' : 'medium');
  var sum = 0;
  for (var i = 0; i < ids.length; i++) sum += objectiveQuality(s, ids[i]);
  var avg = sum / ids.length;
  return 0.65 * avg + 0.35 * quizScore(s);
}

function starRating(s) {
  var r = readiness(s);
  if (r >= 0.92) return 5;
  if (r >= 0.78) return 4;
  if (r >= 0.6) return 3;
  if (r >= 0.45) return 2;
  return 1;
}

function signOffReady(s) {
  var ids = modeObjectiveIds(s.mode === 'hard' ? 'hard' : 'medium');
  return ids.every(function (id) { return s.obj[id] && s.obj[id].done; }) && s.quizSubmitted;
}

/* single global engine namespace (loaded before state.js uses it at runtime) */
var LabEngine = {
  VALIDATORS: VALIDATORS,
  quizScore: quizScore,
  computeQuizScore: computeQuizScore,
  objectiveQuality: objectiveQuality,
  readiness: readiness,
  starRating: starRating,
  signOffReady: signOffReady,
  modeObjectiveIds: modeObjectiveIds,
  eqArr: eqArr,
  eqSet: eqSet,
  correctIds: correctIds,
};
