// ─── RELEASE TRACK · objectives engine (static port of lib/lab-logic.ts) ──────
// Validation rules, star rating and the deterministic pairing shuffle — 1:1
// with the framework lab. Data (correct answers etc.) lives in js/data.js.
(function () {
  'use strict';

  const LAB = (window.LAB = window.LAB || {});

  /** Initial answer for a task type (mirrors emptyAnswer in lab-logic.ts). */
  LAB.emptyAnswer = function (task) {
    switch (task.type) {
      case 'sequence':
        return task.extra
          ? { t: 'sequence', order: task.items.map(function (i) { return i.id; }), extra: '' }
          : { t: 'sequence', order: task.items.map(function (i) { return i.id; }) };
      case 'assign':
        return { t: 'assign', map: {} };
      case 'choice':
        return { t: 'choice', value: '' };
      case 'multiselect':
        return { t: 'multiselect', values: [] };
      case 'codefix':
        return { t: 'codefix', parts: {} };
      case 'triage':
        return { t: 'triage', map: {} };
      case 'sca':
        return { t: 'sca', verdict: '', factors: [] };
      case 'pipeline': {
        const slots = {};
        task.slots.forEach(function (s) {
          slots[s.id] = [];
        });
        return { t: 'pipeline', slots: slots };
      }
      case 'rtm':
        return { t: 'rtm', cells: {} };
    }
    return null;
  };

  function setEqual(a, b) {
    return (
      a.length === b.length &&
      a
        .slice()
        .sort()
        .join('\u0000') ===
        b
          .slice()
          .sort()
          .join('\u0000')
    );
  }
  LAB.setEqual = setEqual;

  /** CHECK RESULTS rules — identical acceptance criteria to the framework lab. */
  LAB.validateTask = function (task, answer) {
    if (!answer || answer.t !== task.type) return false;
    switch (task.type) {
      case 'sequence': {
        if (!answer.order || answer.order.length !== task.correctOrder.length) return false;
        const orderOk = task.correctOrder.every(function (id, i) {
          return answer.order[i] === id;
        });
        if (!orderOk) return false;
        if (task.extra) return answer.extra === task.extra.correct;
        return true;
      }
      case 'assign':
        return (
          !!answer.map &&
          task.items.every(function (it) {
            return answer.map[it.id] === task.correct[it.id];
          })
        );
      case 'choice':
        return answer.value === task.correct;
      case 'multiselect':
        return !!answer.values && setEqual(answer.values, task.correct);
      case 'codefix':
        return (
          !!answer.parts &&
          task.parts.every(function (p) {
            const got = answer.parts[p.id];
            if (!got || got.fix !== p.correct) return false;
            if (p.toolOptions && p.correctTool) return got.tool === p.correctTool;
            return true;
          })
        );
      case 'triage':
        return (
          !!answer.map &&
          task.selects.every(function (s) {
            return answer.map[s.id] === s.correct;
          })
        );
      case 'sca':
        return answer.verdict === task.correctVerdict && !!answer.factors && setEqual(answer.factors, task.correctFactors);
      case 'pipeline':
        return (
          !!answer.slots &&
          task.slots.every(function (s) {
            return setEqual(answer.slots[s.id] || [], task.correct[s.id] || []);
          })
        );
      case 'rtm':
        return (
          !!answer.cells &&
          task.rows.every(function (r) {
            const c = answer.cells[r.id];
            return !!c && c.control === r.correctControl && c.test === r.correctTest;
          })
        );
    }
    return false;
  };

  /** Star rating out of 5 — rewards first-attempt accuracy, dings hint usage. */
  LAB.computeStars = function (total, firstTry, hints) {
    if (total === 0) return 0;
    const base = (firstTry / total) * 0.8 + Math.max(0, 1 - hints / (total * 1.5)) * 0.2;
    return Math.max(1, Math.min(5, Math.round(base * 5)));
  };

  // ── pairing shuffle (R6) — deterministic, stable across reloads ─────────────

  /** Deterministic 32-bit hash of a string. */
  LAB.hashSeed = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  /** Seeded in-place Fisher–Yates (returns a new array; never mutates input). */
  LAB.seededShuffle = function (items, seed) {
    const arr = items.slice();
    let s = seed || 1;
    const rand = function () {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  };

  /**
   * Shuffle pairing items so the display order never reveals the correct pairs.
   * Rejection-samples the seeded permutation until it is not perfectly aligned
   * with the correct bucket positions (the identity leak).
   */
  LAB.shufflePairingItems = function (items, correct, buckets, seedKey) {
    if (!correct || !buckets || items.length < 2) return items;
    const bucketPos = new Map(buckets.map(function (b, i) {
      return [b.id, i];
    }));
    const aligned = function (order) {
      return order.every(function (id, i) {
        return bucketPos.get(correct[id]) === i;
      });
    };
    let seed = LAB.hashSeed(seedKey);
    for (let attempt = 0; attempt < 8; attempt++) {
      const shuffled = LAB.seededShuffle(items, seed);
      if (!aligned(shuffled.map(function (it) {
        return it.id;
      }))) return shuffled;
      seed = seed + 1 >>> 0;
    }
    return LAB.seededShuffle(items, seed + 7919);
  };
})();
