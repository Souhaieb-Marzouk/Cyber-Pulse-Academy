/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/objectives.js
   Pure machine-checkable validation per objective kind (the CHECK RESULTS
   engine). Ported 1:1 from the original, including its attempt-gating
   feedback contract:
     - nothing attempted  → summary-only fail, no per-item feedback,
     - attempted item     → full teaching (including the correct answer),
     - unattempted item   → "no verdict yet", never the key.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    return b.every(function (x) { return a.includes(x); }) && a.every(function (x) { return b.includes(x); });
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  /**
   * checkObjective(obj, rawAnswer) → { pass, summary, items: [{ok,label,why}], teach }
   */
  function checkObjective(obj, rawAnswer) {
    var p = obj.payload;

    function fail(summary, items) {
      return { pass: false, summary: summary, items: items, teach: obj.teachFail };
    }
    function pass(summary, items) {
      return { pass: true, summary: summary, items: items, teach: obj.teachPass };
    }
    function truncated(text, n) {
      return text.length > n ? text.slice(0, n) + "…" : text;
    }

    switch (p.kind) {
      case "choose": {
        var answer = rawAnswer || [];
        if (answer.length === 0) return fail("Nothing selected yet.", []);
        var ok = sameSet(answer, p.correct);
        var items = p.options.map(function (o) {
          return {
            ok: o.correct ? answer.includes(o.id) : !answer.includes(o.id),
            label: o.label,
            why: o.why,
          };
        });
        var wrong = items.filter(function (i) { return !i.ok; }).length;
        return ok
          ? pass("Correct — validated.", items)
          : fail(
              p.multi
                ? "The selection doesn't match the required set exactly. Exact set required."
                : "That choice doesn't validate. Re-read the rationale and try again.",
              items,
            );
      }

      case "sort": {
        var sa = rawAnswer || {};
        var attempted = p.tiles.filter(function (t) { return sa[t.id] != null; }).length;
        if (attempted === 0) return fail("Nothing filed yet — tap a tile, then tap its bin.", []);
        var sItems = p.tiles.map(function (t) {
          var got = sa[t.id] != null ? sa[t.id] : null;
          if (got == null) {
            return { ok: false, label: t.label + " → unfiled", why: "No bin selected for this tile yet." };
          }
          return {
            ok: got === t.bin,
            label: t.label + " → " + got,
            why: got === t.bin ? t.why : t.why + " (Correct bin: " + t.bin + ".)",
          };
        });
        var sOk = sItems.every(function (i) { return i.ok; });
        var missing = p.tiles.length - attempted;
        var misfiled = sItems.filter(function (i) { return !i.ok && i.why.indexOf("No bin") !== 0; }).length;
        var sSummary = missing
          ? plural(missing, "tile") + " unfiled — place every tile before the verdict counts."
          : sOk
            ? "All six observations filed correctly."
            : misfiled + " misfiled — the categories are doing different jobs than you assigned.";
        return sOk && !missing ? pass(sSummary, sItems) : fail(sSummary, sItems);
      }

      case "match": {
        var ma = rawAnswer || {};
        var mAttempted = p.lefts.filter(function (l) { return ma[l.id] != null; }).length;
        if (mAttempted === 0) return fail("Nothing paired yet — select a term, then its definition.", []);
        var mItems = p.lefts.map(function (l) {
          var got = ma[l.id] != null ? ma[l.id] : null;
          if (got == null) {
            return { ok: false, label: l.label + " → unpaired", why: "No definition selected for this term yet." };
          }
          var ok = got === p.correct[l.id];
          var right = null;
          for (var i = 0; i < p.rights.length; i++) if (p.rights[i].id === got) { right = p.rights[i].label; break; }
          return {
            ok: ok,
            label: l.label + " → " + (right !== null ? right : "unpaired"),
            why: ok ? p.whys[l.id] : 'Paired to "' + (right !== null ? right : "unpaired") + '". ' + p.whys[l.id],
          };
        });
        var mUnpaired = p.lefts.length - mAttempted;
        var mWrong = mItems.filter(function (i) { return !i.ok && i.why.indexOf("No definition") !== 0; }).length;
        var mOk = mItems.every(function (i) { return i.ok; });
        var mSummary = mUnpaired
          ? mUnpaired + " left unpaired — pair every item before the verdict counts."
          : mOk
            ? "All pairs correct."
            : plural(mWrong, "pair") + " wrong — read the reasoning under each.";
        return mOk && !mUnpaired ? pass(mSummary, mItems) : fail(mSummary, mItems);
      }

      case "classify": {
        var ca = rawAnswer || {};
        var cAttempted = p.cards.filter(function (c) { return ((ca[c.id] || {}).cat || "") !== ""; }).length;
        if (cAttempted === 0) return fail("No verdicts recorded — pin every card first (or mark it NOT A CONTROL).", []);
        var cItems = p.cards.map(function (c) {
          var got = ca[c.id] || { cat: "", type: "" };
          if (got.cat === "") {
            return { ok: false, label: truncated(c.text, 72), why: "No verdict recorded for this card yet." };
          }
          var wantCat = c.control ? c.cat : "X";
          var wantType = c.control ? c.type : "X";
          var ok = got.cat === wantCat && got.type === wantType;
          var cellText = c.control ? c.cat + " × " + c.type : "NOT A CONTROL";
          var gotText =
            got.cat === "X" ? "NOT A CONTROL" : got.type ? got.cat + " × " + got.type : got.cat + " — type not set";
          return {
            ok: ok,
            label: truncated(c.text, 72),
            why: ok ? c.why : "Pinned to: " + gotText + " · Correct: " + cellText + ". " + c.why,
          };
        });
        var cUnpinned = p.cards.length - cAttempted;
        var cWrong = cItems.filter(function (i) { return !i.ok && i.why.indexOf("No verdict") !== 0; }).length;
        var cOk = cItems.every(function (i) { return i.ok; });
        var cSummary = cUnpinned
          ? plural(cUnpinned, "card") + " without a verdict — set every card before the check counts."
          : cOk
            ? "Every card pinned to the correct cell."
            : plural(cWrong, "card") + " in the wrong cell — study the correct cell on each.";
        return cOk && !cUnpinned ? pass(cSummary, cItems) : fail(cSummary, cItems);
      }

      case "evidence": {
        var ea = rawAnswer || {};
        var eAttempted = p.items.filter(function (it) { return ea[it.id] != null; }).length;
        if (eAttempted === 0) return fail("Nothing answered yet — pick one artifact per control.", []);
        var eItems = p.items.map(function (it) {
          var got = ea[it.id] != null ? ea[it.id] : null;
          if (got == null) {
            return { ok: false, label: it.control, why: "No artifact selected for this control yet." };
          }
          var correct = null;
          var chosen = null;
          for (var i = 0; i < it.options.length; i++) {
            if (it.options[i].correct) correct = it.options[i];
            if (it.options[i].id === got) chosen = it.options[i];
          }
          return {
            ok: !!(chosen && chosen.correct),
            label: it.control,
            why: chosen.correct
              ? chosen.why
              : chosen.why + ' The effective artifact: "' + correct.label + '".',
          };
        });
        var eUnanswered = p.items.length - eAttempted;
        var eWrong = eItems.filter(function (i) { return !i.ok && i.why.indexOf("No artifact") !== 0; }).length;
        var eOk = eItems.every(function (i) { return i.ok; });
        var eSummary = eUnanswered
          ? plural(eUnanswered, "item") + " unanswered — the verdict waits for a full pass."
          : eOk
            ? "Every artifact you picked proves the control working — not just existing."
            : plural(eWrong, "pick") + " prove existence, not effectiveness.";
        return eOk && !eUnanswered ? pass(eSummary, eItems) : fail(eSummary, eItems);
      }

      case "register": {
        var ra = rawAnswer || {};
        var rAttempted = p.findings.filter(function (f) { return ra[f.id] != null; }).length;
        if (rAttempted === 0) return fail("No verdicts yet — choose a treatment for every finding.", []);
        var rItems = p.findings.map(function (f) {
          var got = ra[f.id] != null ? ra[f.id] : null;
          var label = f.tag ? f.tag + ": " + f.text.slice(0, 60) + "…" : truncated(f.text, 72);
          if (got == null) {
            return { ok: false, label: label, why: "No verdict recorded for this finding yet." };
          }
          var correct = null;
          var chosen = null;
          for (var i = 0; i < f.options.length; i++) {
            if (f.options[i].correct) correct = f.options[i];
            if (f.options[i].id === got) chosen = f.options[i];
          }
          return {
            ok: !!(chosen && chosen.correct),
            label: label,
            why: chosen.correct
              ? chosen.why
              : chosen.why + ' The sound treatment: "' + correct.label + '".',
          };
        });
        var rUnanswered = p.findings.length - rAttempted;
        var rWrong = rItems.filter(function (i) { return !i.ok && i.why.indexOf("No verdict") !== 0; }).length;
        var rOk = rItems.every(function (i) { return i.ok; });
        var rSummary = rUnanswered
          ? plural(rUnanswered, "finding") + " without a verdict — the check waits for a full pass."
          : rOk
            ? "All treatment decisions validated."
            : plural(rWrong, "treatment decision") + " rejected — see the rationale.";
        return rOk && !rUnanswered ? pass(rSummary, rItems) : fail(rSummary, rItems);
      }

      case "depth": {
        var picks = rawAnswer || [];
        var chosen = p.pool.filter(function (o) { return picks.includes(o.id); });
        var distractorPicks = chosen.filter(function (o) { return o.distractor; });
        var coveredTypes = new Set(
          chosen.filter(function (o) { return !o.distractor; }).map(function (o) { return o.type; })
        );
        var missingRequired = p.requiredTypes.filter(function (t) { return !coveredTypes.has(t); });
        var dItems = [];
        chosen.forEach(function (o) {
          if (o.distractor) dItems.push({ ok: false, label: o.label, why: o.distractorWhy || "Off-asset distractor." });
          else dItems.push({ ok: true, label: o.label + " · " + o.type, why: o.why });
        });
        missingRequired.forEach(function (t) {
          dItems.push({
            ok: false,
            label: "Missing coverage: " + t,
            why: "The plan must include at least one " + t + " control for this asset.",
          });
        });
        if (picks.length < p.minPicks) {
          dItems.push({
            ok: false,
            label: "Only " + picks.length + " control(s) selected",
            why: "Minimum " + p.minPicks + " controls for layered depth.",
          });
        }
        if (coveredTypes.size < p.minTypes) {
          dItems.push({
            ok: false,
            label: "Only " + coveredTypes.size + " type(s) covered",
            why: "Cover at least " + p.minTypes + " distinct control types.",
          });
        }
        var dOk =
          distractorPicks.length === 0 &&
          missingRequired.length === 0 &&
          picks.length >= p.minPicks &&
          coveredTypes.size >= p.minTypes;
        var dSummary = dOk
          ? "Layered plan validated: " + picks.length + " controls across " + coveredTypes.size + " types."
          : "The plan has gaps or stowaways — see the findings below.";
        return dOk ? pass(dSummary, dItems) : fail(dSummary, dItems);
      }

      case "order": {
        var seq = rawAnswer || [];
        var placedAll = seq.length === p.correct.length;
        // Feedback is keyed to the STUDENT's sequence — never to the target order.
        var oItems = seq.map(function (id, idx) {
          var placed = null;
          for (var i = 0; i < p.steps.length; i++) if (p.steps[i].id === id) placed = p.steps[i];
          var ok = p.correct[idx] === id;
          return {
            ok: ok,
            label: "Position " + (idx + 1) + ": " + placed.label,
            why: ok
              ? placed.why
              : 'You placed "' + placed.label + '" here. ' + placed.why + " Re-check what this step depends on.",
          };
        });
        var oOk = placedAll && p.correct.every(function (id, idx) { return seq[idx] === id; });
        var oSummary = !placedAll
          ? "Sequence incomplete."
          : oOk
            ? "Sequence validated — each step enables the next."
            : (function () {
                var bad = seq.filter(function (id, i) { return id !== p.correct[i]; }).length;
                return bad + " step(s) out of position.";
              })();
        return oOk ? pass(oSummary, oItems) : fail(oSummary, oItems);
      }
    }
  }

  CG.checkObjective = checkObjective;
})();
