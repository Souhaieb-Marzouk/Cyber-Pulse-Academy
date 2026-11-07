// THE ISOLATION FOUNDRY — js/quiz.js
// Readiness audit (stage 3): one question at a time, check-and-lock contract,
// only-selected highlighting, mandatory progression, submitted review view.
// Scoring (quizResult) is transpiled 1:1 from the framework's engine.ts.
(function (F) {
  "use strict";

  // eslint-disable-next-line no-unused-vars
  var OBJECTIVES = F.OBJECTIVES, QUIZ = F.QUIZ;

  /* ---------------- scoring (was engine.ts, verbatim) ---------------- */
  function quizResult(answers, mode) {
    const items = QUIZ[mode];
    const correct = items.filter((q) => answers[q.id] === q.answer).length;
    return { correct, total: items.length };
  }
  F.quizResult = quizResult;

  /* ---------------- local position state (React useState in the original) ---------------- */
  var idx = 0;

  // Entering the audit stage: land on the first unchecked question (as the
  // original's useState initializer does on mount/resume).
  F.resetQuizPos = function () {
    var state = F.getState();
    var items = QUIZ[state.mode || "medium"];
    var firstOpen = -1;
    for (var i = 0; i < items.length; i++) {
      if (!state.quizChecked[items[i].id]) { firstOpen = i; break; }
    }
    idx = firstOpen === -1 ? items.length - 1 : firstOpen;
  };

  /* ---------------- option state machine (mirrors optionState in audit.tsx) ---------------- */

  function optionState(q, picked, isChecked, oid) {
    if (!picked) return "idle";
    if (!isChecked) return oid === picked ? "pick" : "idle";
    if (oid === picked) return oid === q.answer ? "correct" : "wrong";
    return "dim";
  }

  function optionLabel(q, st, oid, text, input) {
    var marker;
    if (st === "correct") marker = F.iconEl("CheckCircle2", 14, "text-container");
    else if (st === "wrong") marker = F.iconEl("XCircle", 14, "text-destructive");
    else marker = F.h("span", { class: "radio-dot" + (st === "pick" ? " radio-picked" : "") });
    var tail = st === "correct" ? F.h("span", { class: "opt-tail text-container" }, "selected · correct")
      : st === "wrong" ? F.h("span", { class: "opt-tail text-destructive" }, "selected · wrong")
      : null;
    return F.h("label", {
      class: F.cn("opt", "opt-" + st), fk: "q-" + q.id + "-" + oid,
    }, input, F.h("span", { class: "opt-marker", "aria-hidden": "true" }, marker), F.h("span", { class: "opt-text" }, text), tail);
  }

  /* ---------------- stage renderer ---------------- */

  F.renderQuiz = function (onDone) {
    var state = F.getState();
    var mode = state.mode || "medium";
    var items = QUIZ[mode];
    var submitted = state.quizDone;

    var head = F.h("div", { class: "stage-topline" },
      F.h("div", { class: "eyebrow" }, "Shift stage 3/4 · Readiness audit · " + (mode === "medium" ? "6 concept questions" : "7 scenario calls")),
      F.syntheticNote());

    /* ----- submitted: review view ----- */
    if (submitted) {
      var res = quizResult(state.quizAnswers, mode);
      var list = F.h("ol", { class: "quiz-review" });
      items.forEach(function (qq, qi) {
        var pp = state.quizAnswers[qq.id] || null;
        var locked = !!state.quizChecked[qq.id];
        var opts = F.h("div", { class: "quiz-review-opts" });
        qq.options.forEach(function (o) {
          var st = !pp ? "idle" : !locked ? (o.id === pp ? "pick" : "idle")
            : o.id === pp ? (o.id === qq.answer ? "correct" : "wrong") : "dim";
          opts.appendChild(F.h("div", { class: F.cn("opt", "opt-" + st, "opt-static") },
            F.h("span", { class: "opt-marker", "aria-hidden": "true" },
              st === "correct" ? F.iconEl("CheckCircle2", 14, "text-container")
                : st === "wrong" ? F.iconEl("XCircle", 14, "text-destructive")
                : F.h("span", { class: "radio-dot" + (st === "pick" ? " radio-picked" : "") })),
            F.h("span", { class: "opt-text" }, o.text)));
        });
        if (pp) {
          var good = pp === qq.answer;
          opts.appendChild(F.h("p", {
            class: "quiz-why",
            style: "border-color:" + (good ? "rgba(62,214,192,0.4)" : "rgba(241,163,60,0.4)") +
              ";background:" + (good ? "rgba(62,214,192,0.05)" : "rgba(241,163,60,0.05)"),
          }, F.h("span", { class: "why-label" }, "Why · "), qq.explain));
        }
        list.appendChild(F.h("li", { class: "quiz-review-item" },
          F.h("div", { class: "quiz-q-head" },
            F.h("span", { class: "quiz-q-num" }, "Q" + (qi + 1)),
            F.h("p", { class: "quiz-q-prompt" }, qq.prompt)),
          opts));
      });

      return F.h("div", { class: "stage-wrap stage-wrap-audit" }, head,
        F.panel({
          title: "Readiness audit — submitted",
          sub: "Every choice is locked as answered. Review the calls below.",
          children: [list,
            F.h("p", { class: "quiz-score", "aria-live": "polite" },
              F.h("span", { html: F.icon("Trophy", 13), class: "icon-wrap text-container", "aria-hidden": "true" }),
              " audit submitted · " + res.correct + "/" + res.total)],
        }));
    }

    /* ----- active: one question at a time ----- */
    if (idx >= items.length) idx = items.length - 1;
    var q = items[idx];
    var picked = state.quizAnswers[q.id] || null;
    var isChecked = !!state.quizChecked[q.id];
    var checkedCount = items.filter(function (it) { return !!state.quizChecked[it.id]; }).length;
    var isLast = idx === items.length - 1;

    // progress segments
    var segs = items.map(function (it, i) {
      return F.h("span", { class: F.cn("quiz-seg", state.quizChecked[it.id] ? "seg-checked" : i === idx ? "seg-current" : "") });
    });

    // fieldset of native radios — locked after check (R2/R3 contract)
    var fieldset = F.h("fieldset", { class: "quiz-fieldset", disabled: isChecked },
      F.h("legend", { class: "sr-only" }, q.prompt));
    var optsWrap = F.h("div", { class: "quiz-opts" });
    q.options.forEach(function (o) {
      var st = optionState(q, picked, isChecked, o.id);
      var input = F.h("input", {
        type: "radio", name: q.id, value: o.id,
        checked: picked === o.id, disabled: isChecked,
        onChange: function (e) { F.dispatch({ t: "quizAnswer", qid: q.id, opt: o.id }); },
      });
      input.className = "sr-only";
      optsWrap.appendChild(optionLabel(q, st, o.id, o.text, input));
    });
    fieldset.appendChild(optsWrap);

    var card = F.h("div", { class: "quiz-card" },
      F.h("p", { class: "quiz-q-prompt-main" }, q.prompt),
      fieldset,
      isChecked ? [
        F.h("p", { class: F.cn("quiz-why", "quiz-why-live", picked === q.answer ? "why-good" : "why-miss"), "aria-live": "polite" },
          F.h("span", { class: "why-label" }, "Why · "), q.explain),
        F.h("div", { class: "quiz-next-row" },
          F.button({
            children: [isLast ? "Finish audit " : "Next question ", F.iconEl(isLast ? "Trophy" : "ArrowRight", 14)],
            onClick: function () {
              if (isLast) { F.dispatch({ t: "quizDone" }); onDone(); }
              else { idx = Math.min(idx + 1, items.length - 1); F.render("main"); }
            },
          })),
      ] : [
        F.h("div", { class: "quiz-check-row" },
          F.h("span", { class: "quiz-hintline" },
            picked ? "your call is set — check to lock it in" : "select an answer to enable the check"),
          F.button({ disabled: !picked, children: "Check answer", onClick: function () { F.dispatch({ t: "quizCheck", qid: q.id }); } })),
      ]);

    return F.h("div", { class: "stage-wrap stage-wrap-audit" }, head,
      F.panel({
        title: "Readiness audit",
        sub: mode === "medium"
          ? "Pick one answer, check it, read the why — then move on. Choices lock when checked."
          : "Scenario calls — pick one answer, check it, own the consequence. Choices lock when checked.",
        children: [
          F.h("div", { class: "quiz-meta" },
            F.h("span", null, "Question " + (idx + 1) + " of " + items.length),
            F.h("span", { "aria-live": "polite" }, checkedCount + "/" + items.length + " checked")),
          F.h("div", { class: "quiz-progress", "aria-hidden": "true" }, segs),
          card,
        ],
      }));
  };
})(window.Foundry = window.Foundry || {});
