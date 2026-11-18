/* ============================================================
   The Assurance Bureau — js/objectives.js
   Validation engine, scoring and focus areas. Pure functions —
   no DOM access. Ported 1:1 from the original lab engine.
   ============================================================ */

var ENGINE = (function () {
  "use strict";

  // ---------- normalization ----------
  function normText(s) {
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[.,;!?]+$/g, "")
      .replace(/\s*%\s*$/, "%");
  }

  function valuesEqual(part, raw) {
    var n = normText(raw);
    return (part.accept || []).some(function (a) {
      return normText(a) === n;
    });
  }

  // ---------- per-part validation ----------
  function validatePart(part, value, flags) {
    switch (part.kind) {
      case "choice": {
        var ok = typeof value === "string" && value === part.solution;
        if (ok) return { ok: true };
        var reason =
          (typeof value === "string" && part.rejects && part.rejects[value]) ||
          "Re-read the document this question points to, then choose again.";
        return { ok: false, reason: reason };
      }
      case "choices": {
        if (!value || typeof value === "string") return { ok: false };
        var sol = part.itemSolution || {};
        var wrong = Object.keys(sol).filter(function (k) {
          return value[k] !== sol[k];
        });
        if (wrong.length === 0) return { ok: true };
        var first = wrong[0];
        var picked = value[first];
        var rejectKey = first + ":" + picked;
        var item = (part.items || []).find(function (i) {
          return i.id === first;
        });
        var reason2 =
          (part.rejects && (part.rejects[rejectKey] || part.rejects[picked])) ||
          "Re-check \u201C" + ((item && item.label) || first) + "\u201D.";
        return { ok: false, reason: reason2 };
      }
      case "order": {
        if (!Array.isArray(value)) return { ok: false };
        var solO = part.solutionOrder || [];
        var same = solO.length === value.length && solO.every(function (id, i) {
          return value[i] === id;
        });
        if (same) return { ok: true };
        return { ok: false, reason: (part.rejects && part.rejects["sequence"]) || "The sequence still has steps out of order." };
      }
      case "set": {
        if (!Array.isArray(value)) return { ok: false };
        var solS = (part.solutionSet || []).slice().sort();
        var got = value.slice().sort();
        var sameS = solS.length === got.length && solS.every(function (id, i) {
          return got[i] === id;
        });
        if (sameS) return { ok: true };
        var missing = solS.filter(function (id) {
          return got.indexOf(id) === -1;
        });
        var extra = got.filter(function (id) {
          return solS.indexOf(id) === -1;
        });
        var reason3 = (part.rejects && part.rejects["set"]) || "The selection does not match the rule yet.";
        if (missing.length) reason3 = "Missing from your selection: " + missing.join(", ") + ". " + reason3;
        if (extra.length) reason3 = extra.join(", ") + " should not be selected. " + reason3;
        return { ok: false, reason: reason3 };
      }
      case "text": {
        var okT = typeof value === "string" && valuesEqual(part, value);
        if (okT) return { ok: true };
        var reason4 =
          (typeof value === "string" && part.rejects && part.rejects[normText(value)]) ||
          (part.rejects && part.rejects["*"]) ||
          "Not the value the evidence supports — check the exact wording, then retry.";
        return { ok: false, reason: reason4 };
      }
      case "state": {
        var okF = (part.flags || []).every(function (f) {
          return !!flags[f];
        });
        return okF
          ? { ok: true }
          : { ok: false, reason: "Required engagement steps have not been completed yet." };
      }
      default:
        return { ok: false };
    }
  }

  function validateObjective(obj, answers, flags) {
    var parts = {};
    var ok = true;
    for (var i = 0; i < obj.parts.length; i++) {
      var p = obj.parts[i];
      var r = validatePart(p, answers[obj.id + "." + p.id], flags);
      parts[p.id] = r;
      if (!r.ok) ok = false;
    }
    return { ok: ok, parts: parts };
  }

  // ---------- focus areas (R8: derived from actual performance evidence) ----------
  var STUDY_POINTER = {
    briefing: "re-open tab 01 (Briefing) — the Knowledge Core cards",
    charter: "re-read the Audit Charter and the reference-source cards in tab 02",
    fieldwork: "re-open the evidence-room documents in tab 03",
    testing: "re-run both control tests in the rig (tab 04)",
    closeout: "re-read the attestation letter and the findings ledger in tab 05",
  };

  function computeFocusAreas(checks, quiz, quizDefs, objectives) {
    var areas = [];
    objectives.forEach(function (o) {
      var rec = checks[o.id];
      if (!rec || !rec.done) return;
      if (rec.attempts > 1) {
        areas.push({
          title: o.id + " · " + o.title,
          detail: "needed " + rec.attempts + " full checks before verifying",
          action: "Revisit: " + (STUDY_POINTER[o.phase] || "the binder phase it lives in") + ".",
        });
      }
      if (rec.hintsUsed > 0) {
        areas.push({
          title: o.id + " · " + o.title,
          detail: "used " + rec.hintsUsed + " hint" + (rec.hintsUsed > 1 ? "s" : "") + " before verifying",
          action: "Retry this worksheet in the other mode without hints to prove the recall.",
        });
      }
    });
    quizDefs.forEach(function (d, i) {
      if (quiz.picked[i] !== undefined && quiz.picked[i] !== d.answer) {
        var low = d.topic.toLowerCase();
        var pointer = STUDY_POINTER[low.indexOf("attestation") !== -1 ? "closeout" : low.indexOf("sampl") !== -1 ? "charter" : "briefing"];
        areas.push({
          title: "Knowledge check Q" + (i + 1) + " · " + d.topic,
          detail: "answered incorrectly on the check",
          action: "Re-read the explanation on the result sheet, then revisit " + pointer + ".",
        });
      }
    });
    if (areas.length === 0) {
      areas.push({
        title: "Clean sweep — no weak spots recorded",
        detail: "every worksheet verified first-try and the knowledge check answered in full",
        action:
          "Push further: run the other difficulty mode without scaffolding, and read SY0-801 objective 4.3 (where penetration-test report review now lives).",
      });
    }
    return areas;
  }

  // ---------- scoring ----------
  function computeScore(checks, quiz, quizDefs, mode) {
    var objs = Object.keys(checks).map(function (k) {
      return checks[k];
    });
    var total = objs.filter(function (c) {
      return c.done;
    }).length;
    var firstTry = objs.filter(function (c) {
      return c.done && c.firstTry;
    }).length;
    var hints = objs.reduce(function (acc, c) {
      return acc + c.hintsUsed;
    }, 0);
    var quizTotal = quizDefs.length;
    var quizCorrect = quizDefs.reduce(function (acc, _q, i) {
      var p = quiz.picked[i];
      return p === undefined ? acc : acc + (p === quizDefs[i].answer ? 1 : 0);
    }, 0);
    var quizAcc = quizTotal > 0 ? quizCorrect / quizTotal : 0;
    var objRatio = total > 0 ? firstTry / total : 0;
    var penalty = mode === "hard" ? 3 : 2;
    var score = Math.max(0, Math.min(100, Math.round(60 * objRatio + 40 * quizAcc - penalty * hints)));
    var stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;
    return {
      objectivesTotal: total,
      objectivesFirstTry: firstTry,
      hintsUsed: hints,
      quizCorrect: quizCorrect,
      quizTotal: quizTotal,
      score: score,
      stars: stars,
    };
  }

  return {
    normText: normText,
    validatePart: validatePart,
    validateObjective: validateObjective,
    computeFocusAreas: computeFocusAreas,
    computeScore: computeScore,
  };
})();
