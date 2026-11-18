/* ============================================================
 * CONTROLS BRIDGE — CHECK RESULTS Validation Engine
 * Supports: exact, select-one, select-many, classify, sequence,
 *           bridge-state, free-text-regex, composite.
 * Same validation logic as the original Next.js lab.
 * ============================================================ */

var Lab = window.Lab || {};

Lab.objectives = (function() {
  "use strict";

  var data = Lab.data;
  var state = Lab.state;

  // ---- Check a single validation spec ----
  function checkSpec(spec, objId) {
    var s = state.getState();

    switch (spec.kind) {

      case "select-one": {
        var sel = s.selections[objId] || [];
        if (sel.length === 0) return { passed:false, message:"Select an option." };
        return sel[0] === spec.correct
          ? { passed:true, message:"Correct selection." }
          : { passed:false, message:'Expected "' + spec.correct + '".' };
      }

      case "select-many": {
        var sel2 = s.selections[objId] || [];
        if (sel2.length === 0) return { passed:false, message:"Select at least one option." };
        var correctSet = {};
        spec.correct.forEach(function(c) { correctSet[c] = true; });
        var selSet = {};
        sel2.forEach(function(c) { selSet[c] = true; });
        var missing = spec.correct.filter(function(c) { return !selSet[c]; });
        var extra = sel2.filter(function(c) { return !correctSet[c]; });
        if (missing.length === 0 && extra.length === 0) {
          return { passed:true, message:"All correct, no extras." };
        }
        var parts = [];
        if (missing.length) parts.push("missing: " + missing.join(", "));
        if (extra.length) parts.push("should not be selected: " + extra.join(", "));
        return { passed:false, message: parts.join(" | ") };
      }

      case "classify": {
        var ctl = data.CONTROLS.find(function(c) { return c.id === spec.controlId; });
        if (!ctl) return { passed:false, message:"Unknown control." };
        var cls = s.classifications[spec.controlId];
        if (!cls) return { passed:false, message:"Classify the control first." };
        var catOk = cls.category === ctl.category;
        var fnOk = cls.function === ctl.function;
        if (catOk && fnOk) {
          return { passed:true, message:"Category: " + ctl.category + " ✓  Function: " + ctl.function + " ✓" };
        }
        var parts2 = [];
        if (!catOk) parts2.push('category should be "' + ctl.category + '"');
        if (!fnOk) parts2.push('function should be "' + ctl.function + '"');
        return { passed:false, message: parts2.join("; ") };
      }

      case "sequence": {
        var got = s.sequences[objId] || [];
        if (got.length === 0) return { passed:false, message:"Arrange the sequence." };
        if (got.length !== spec.steps.length) {
          return { passed:false, message:"Sequence incomplete: " + got.length + "/" + spec.steps.length + "." };
        }
        var wrongIdx = -1;
        for (var i = 0; i < spec.steps.length; i++) {
          if (got[i] !== spec.steps[i]) { wrongIdx = i; break; }
        }
        if (wrongIdx === -1) return { passed:true, message:"Correct order." };
        return {
          passed:false,
          message:"Wrong at position " + (wrongIdx + 1) + ".",
          detail:'Expected "' + data.SEQUENCE_LABELS[spec.steps[wrongIdx]] + '", got "' + (data.SEQUENCE_LABELS[got[wrongIdx]] || got[wrongIdx]) + '".',
        };
      }

      case "bridge-state": {
        var req = spec.require;
        if (req.requireControlId) {
          var ctl2 = data.CONTROLS.find(function(c) { return c.id === req.requireControlId; });
          if (!ctl2) return { passed:false, message:"Unknown control." };
          var cls2 = s.classifications[req.requireControlId];
          if (!cls2 || !cls2.function) {
            return { passed:false, message:"Set the control's function first." };
          }
          var expectedFn = ctl2.function;
          return cls2.function === expectedFn
            ? { passed:true, message: ctl2.name + " correctly set to " + expectedFn + "." }
            : { passed:false, message:"Set " + ctl2.name + " to its correct function." };
        }
        if (req.requireCount) {
          var correct2 = 0;
          data.CONTROLS.forEach(function(ctl3) {
            if (ctl3.isRedHerring) return;
            var cls3 = s.classifications[ctl3.id];
            if (cls3 && cls3.category === ctl3.category) correct2++;
          });
          return correct2 >= req.requireCount
            ? { passed:true, message: correct2 + " controls correctly categorized." }
            : { passed:false, message: correct2 + "/" + req.requireCount + " controls correctly categorized." };
        }
        return { passed:false, message:"Bridge state requirement not met." };
      }

      case "free-text-regex": {
        var text = (s.freeText[objId] || "").trim();
        if (text.length < (spec.minLength || 0)) {
          return { passed:false, message:"Answer too short (min " + (spec.minLength||0) + " chars)." };
        }
        var re = new RegExp(spec.pattern, spec.flags || "i");
        return re.test(text)
          ? { passed:true, message:"Justification accepted." }
          : { passed:false, message:"Justification must reference the relevant concept." };
      }

      case "composite": {
        var results = spec.specs.map(function(sub, i) {
          return checkCompositeChild(sub, objId, i);
        });
        for (var j = 0; j < results.length; j++) {
          if (!results[j].passed) {
            return { passed:false, message:"Part " + (j+1) + ": " + results[j].message };
          }
        }
        return { passed:true, message:"All parts correct." };
      }

      default:
        return { passed:false, message:"Unknown validation kind." };
    }
  }

  // ---- Check a composite child spec ----
  // Composite children use compositeSelections/compositeFreeText keyed by "objId--specIndex".
  function checkCompositeChild(subSpec, objId, specIndex) {
    var s = state.getState();
    var subKey = objId + "--" + specIndex;

    if (subSpec.kind === "select-one") {
      var val = s.compositeSelections[subKey];
      if (!val) return { passed:false, message:"Select an option." };
      return val === subSpec.correct
        ? { passed:true, message:"Correct." }
        : { passed:false, message:'Expected "' + subSpec.correct + '".' };
    }
    if (subSpec.kind === "select-many") {
      // Composite select-many uses selections[objId] (not composite).
      var sel = s.selections[objId] || [];
      if (sel.length === 0) return { passed:false, message:"Select at least one." };
      var correctSet = {};
      subSpec.correct.forEach(function(c) { correctSet[c] = true; });
      var selSet = {};
      sel.forEach(function(c) { selSet[c] = true; });
      var missing = subSpec.correct.filter(function(c) { return !selSet[c]; });
      var extra = sel.filter(function(c) { return !correctSet[c]; });
      if (missing.length === 0 && extra.length === 0) return { passed:true, message:"All correct." };
      var parts = [];
      if (missing.length) parts.push("missing: " + missing.join(", "));
      if (extra.length) parts.push("extra: " + extra.join(", "));
      return { passed:false, message: parts.join(" | ") };
    }
    if (subSpec.kind === "free-text-regex") {
      var text = (s.compositeFreeText[subKey] || "").trim();
      if (text.length < (subSpec.minLength || 0)) {
        return { passed:false, message:"Too short (min " + (subSpec.minLength||0) + " chars)." };
      }
      var re = new RegExp(subSpec.pattern, subSpec.flags || "i");
      return re.test(text)
        ? { passed:true, message:"Justification accepted." }
        : { passed:false, message:"Must reference the relevant concept." };
    }
    // For other kinds in composite, delegate to checkSpec with temp state mapping.
    return checkSpec(subSpec, objId);
  }

  // ---- Check an objective (public) ----
  function checkObjective(objective) {
    return checkSpec(objective.validation, objective.id);
  }

  // ---- Scoring helpers ----
  function computeScore(objectives, objStates, quizList, quizState) {
    var earned = 0, possible = 0;
    objectives.forEach(function(obj) {
      possible += obj.points;
      if (objStates[obj.id] && objStates[obj.id].status === "correct") earned += obj.points;
    });
    quizList.forEach(function() { possible += 5; });
    return { earned: earned, possible: possible };
  }

  function computeStars(objectiveList, objStates, hintsUsedTotal, quizCorrect, quizTotal) {
    var totalObjs = objectiveList.length;
    var correctObjs = objectiveList.filter(function(o) {
      return objStates[o.id] && objStates[o.id].status === "correct";
    }).length;
    var objRatio = correctObjs / totalObjs;
    var quizRatio = quizTotal > 0 ? quizCorrect / quizTotal : 0;
    var overall = objRatio * 0.7 + quizRatio * 0.3;
    var hintPenalty = hintsUsedTotal > 6 ? 1 : 0;
    var stars = 1;
    if (overall >= 0.9) stars = 3;
    else if (overall >= 0.7) stars = 2;
    return Math.max(1, stars - hintPenalty);
  }

  return {
    checkObjective: checkObjective,
    computeScore: computeScore,
    computeStars: computeStars,
  };
})();
