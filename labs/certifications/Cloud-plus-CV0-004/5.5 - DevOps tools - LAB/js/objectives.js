// ─────────────────────────────────────────────────────────────────────────────
// js/objectives.js — CHECK RESULTS validation engine + derived progress math.
// 1:1 port of the engine in src/lib/lab/objectives.ts and the selectors in
// src/lib/lab/store.tsx (useProgress / computeStars). Pure functions, no DOM.
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  const D = window.LAB_DATA;

  function asRecord(v) {
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  }
  function asArray(v) {
    return Array.isArray(v) ? v : [];
  }
  // Text/select answers are normalized before comparison (same as original).
  const norm = (s) => String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');

  function checkWidget(w, env) {
    switch (w.kind) {
      case 'pair': {
        const m = asRecord(env[w.key]);
        return Object.keys(w.solution).every((l) => m[l] === w.solution[l]);
      }
      case 'order': {
        const a = asArray(env[w.key]).map(String);
        return a.length === w.solution.length && a.every((x, i) => x === w.solution[i]);
      }
      case 'sort': {
        const m = asRecord(env[w.key]);
        return Object.keys(w.solution).every((i) => m[i] === w.solution[i]);
      }
      case 'multi': {
        const a = asArray(env[w.key]).map(String).sort();
        const s = w.solution.slice().sort();
        return a.length === s.length && a.every((x, i) => x === s[i]);
      }
      case 'select':
        return norm(env[w.key]) === norm(w.solution);
      case 'text':
        return w.fields.every((f) => {
          const v = asRecord(env[w.key])[f.key];
          return f.answers.map(norm).includes(norm(v));
        });
      case 'toggles': {
        const m = asRecord(env[w.key]);
        return Object.keys(w.solution).every((id) => Boolean(m[id]) === w.solution[id]);
      }
      default:
        return false;
    }
  }

  function checkObjective(o, env) {
    return o.widgets.every((w) => checkWidget(w, env));
  }

  // Human label of the first widget that fails — drives the "Revisit:" note.
  function firstUnsatisfiedLabel(o, env) {
    for (const w of o.widgets) {
      if (!checkWidget(w, env)) {
        if (w.kind === 'text') return (w.fields[0] && w.fields[0].label) || 'a text field';
        if (w.kind === 'select') return w.label;
        if (w.kind === 'multi') return w.label || 'the selection';
        if (w.kind === 'order') return w.label;
        return 'one of the assignments';
      }
    }
    return null;
  }

  // ── selectors (ported from useProgress / computeStars) ────────────────────
  function objectivesFor(mode) {
    return D.objectives.filter((o) => o.mode === mode);
  }
  function objectivesAt(station, mode) {
    return objectivesFor(mode).filter((o) => o.station === station);
  }

  function computeProgress(state) {
    const mode = state.mode || 'medium';
    const objs = objectivesFor(mode);
    const quiz = D.quiz[mode] || [];
    const completed = objs.filter((o) => state.objectives[o.id] && state.objectives[o.id].completed).length;
    const quizAnswered = quiz.filter((q) => state.quiz[q.id] && state.quiz[q.id].revealed).length;
    const quizCorrect = quiz.filter((q) => state.quiz[q.id] && state.quiz[q.id].correct).length;
    const allObjectivesDone = objs.length > 0 && completed === objs.length;
    const allQuizDone = quiz.length > 0 && quizAnswered === quiz.length;
    const pct = Math.round((completed / Math.max(objs.length, 1)) * 80 + (quizAnswered / Math.max(quiz.length, 1)) * 20);
    return { objs, quiz, completed, total: objs.length, quizAnswered, quizCorrect, quizTotal: quiz.length, allObjectivesDone, allQuizDone, pct };
  }

  function perStation(state, mode) {
    const map = {};
    for (const s of D.stations) map[s.id] = { done: 0, total: 0 };
    for (const o of objectivesFor(mode)) {
      map[o.station].total += 1;
      if (state.objectives[o.id] && state.objectives[o.id].completed) map[o.station].done += 1;
    }
    return map;
  }

  function perPillar(state, mode) {
    const t = {};
    for (const o of objectivesFor(mode)) {
      t[o.pillar] = t[o.pillar] || { done: 0, total: 0 };
      t[o.pillar].total += 1;
      if (state.objectives[o.id] && state.objectives[o.id].completed) t[o.pillar].done += 1;
    }
    return t;
  }

  // Star rating: −0.5 for every objective that needed a re-check, −0.5 per
  // hint/nudge; rounded to the nearest half star, clamped to 1–5.
  function computeStars(state) {
    const objs = objectivesFor(state.mode);
    if (objs.length === 0) return 0;
    let penalty = 0;
    for (const o of objs) {
      const rec = state.objectives[o.id];
      if (!rec || !rec.completed) continue;
      if (!rec.firstTry) penalty += 0.5;
      penalty += rec.hintsUsed * 0.5;
    }
    return Math.max(1, Math.min(5, Math.round((5 - penalty) * 2) / 2));
  }

  Lab.engine = {
    norm,
    checkWidget,
    checkObjective,
    firstUnsatisfiedLabel,
    objectivesFor,
    objectivesAt,
    computeProgress,
    perStation,
    perPillar,
    computeStars,
  };
})(window.Lab);
