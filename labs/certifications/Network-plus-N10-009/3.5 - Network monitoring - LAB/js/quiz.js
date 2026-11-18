// SIGNALPATH lab — quiz bay (C5).
// Contract preserved from the original (R2/R3): pick an answer (reversible) →
// CHECK locks the choice and shows the explanation → NEXT is the only way forward
// → finish screen → FINISH QUIZ grades the bank → read-only review.
// Only the SELECTED option is colored (green if it was correct, red if wrong);
// the correct answer is never revealed green on a wrong submission.
window.SP_QUIZ = (function () {
  "use strict";

  var UI = window.SP_UI;
  var CONTENT = window.SP_CONTENT;
  var el = UI.el;
  var icon = UI.icon;
  var cn = UI.cn;

  // transient pager state (component-local in the original React version)
  var mountedMode = null;
  var viewIdx = 0;
  var finishScreen = false;
  var picked = null;

  function computeQuizCorrect(mode, answers) {
    var items = mode === "hard" ? CONTENT.QUIZ_HARD : CONTENT.QUIZ_MEDIUM;
    var n = 0;
    items.forEach(function (q) {
      if (answers[q.id] === String(q.answer)) n++;
    });
    return n;
  }

  function itemsFor(state) {
    return state.mode === "hard" ? CONTENT.QUIZ_HARD : CONTENT.QUIZ_MEDIUM;
  }

  function answeredCount(items, answers) {
    var fu = -1;
    for (var i = 0; i < items.length; i++) {
      if (answers[items[i].id] === undefined) { fu = i; break; }
    }
    return items.length - (fu === -1 ? 0 : items.length - fu);
  }

  function render(state, dispatch) {
    var items = itemsFor(state);
    var submitted = state.quizSubmitted;
    var answers = state.quizAnswers;

    // remount semantics: when the bay first mounts for a mode (or after a reset,
    // which unmounts it), resume at the first unanswered item
    var mode = state.mode || "medium";
    if (mountedMode !== mode + ":" + (state.gateSeen ? "1" : "0")) {
      mountedMode = mode + ":" + (state.gateSeen ? "1" : "0");
      finishScreen = false;
      picked = null;
      var fu0 = -1;
      for (var i = 0; i < items.length; i++) {
        if (answers[items[i].id] === undefined) { fu0 = i; break; }
      }
      viewIdx = Math.max(0, fu0);
    }

    var quizCorrect = submitted ? computeQuizCorrect(mode, answers) : 0;
    var quizTotal = items.length;
    var ac = answeredCount(items, answers);
    var allAnswered = ac === items.length;
    var current = allAnswered ? items.length - 1 : Math.min(viewIdx, items.length - 1);

    var section = el("section", {
      class: "sp-rack panel-pad",
      attrs: { id: "quiz-bay", "aria-labelledby": "quiz-heading" },
    });

    section.appendChild(el("div", { class: "quiz-head" },
      icon("list-checks", "ico-16"),
      el("h2", {
        class: "panel-title",
        attrs: { id: "quiz-heading" },
      }, "KNOWLEDGE CHECK — " + (state.mode === "hard" ? "scenario triage (analyze & justify)" : "concept check (understand & apply)")),
      el("span", { class: "q-count" },
        ac + "/" + items.length + " checked" + (submitted ? " · " + quizCorrect + "/" + quizTotal + " correct" : ""))
    ));

    section.appendChild(el("p", { class: "quiz-sub" },
      "Pick an answer, press ", el("span", { class: "code" }, "CHECK"),
      " — it locks and explains. Then NEXT moves you forward. Wrong answers cost nothing except stars at the end."
    ));

    if (submitted) {
      section.appendChild(renderReview(items, answers, quizCorrect, quizTotal));
    } else if (allAnswered && finishScreen) {
      var fb = el("div", { class: "finish-box" },
        el("span", { class: "badge-solid-lime" }, "ALL ITEMS CHECKED"),
        el("span", null, "Every item is locked in. Finish to grade the bank and bank the quiz part of your score."),
        el("button", {
          class: "btn btn-lime minh-44",
          on: { click: function () { dispatch({ type: "SUBMIT_QUIZ" }); } },
        }, "FINISH QUIZ")
      );
      section.appendChild(fb);
    } else {
      section.appendChild(renderItemCard(items[current], current, items.length, ac, state, dispatch));
    }
    return section;
  }

  function renderItemCard(item, index, total, ac, state, dispatch) {
    var chosen = state.quizAnswers[item.id]; // set only by CHECK — locked
    var checked = chosen !== undefined;
    var isCorrectPick = checked && chosen === String(item.answer);

    var card = el("div", { class: cn("quiz-card", checked && "checked") });

    card.appendChild(el("div", { class: "quiz-q-row" },
      el("span", { class: "q-num" }, "Q" + (index + 1) + "/" + total),
      el("p", { class: "q-prompt" }, item.prompt)
    ));
    card.appendChild(el("div", { class: "quiz-lock-note" },
      checked ? "checked — answer locked (R2)" : "select an answer, then press CHECK"
    ));

    var group = el("div", {
      class: "quiz-options",
      attrs: { role: "radiogroup", "aria-label": "Question " + (index + 1) + " answers" },
    });
    item.options.forEach(function (opt, oi) {
      var isPickedOption = checked ? chosen === String(oi) : picked === String(oi);
      var revealCorrect = checked && isPickedOption && chosen === String(item.answer);
      var revealWrong = checked && isPickedOption && chosen !== String(item.answer);
      var cls = "quiz-opt";
      if (checked) {
        if (revealCorrect) cls += " reveal-correct";
        else if (revealWrong) cls += " reveal-wrong";
        else cls += " dimmed";
      } else if (isPickedOption) {
        cls += " picked";
      }
      var btn = el("button", {
        class: cls,
        attrs: {
          role: "radio",
          "aria-checked": String(checked ? chosen === String(oi) : picked === String(oi)),
          disabled: checked || null,
        },
        on: {
          click: function () {
            if (!checked) { picked = String(oi); rerender(); }
          },
        },
      },
        el("span", { class: "opt-letter" }, String.fromCharCode(65 + oi) + "."),
        opt,
        revealCorrect ? el("span", { class: "opt-flag ok" }, "✓ correct — your pick") : null,
        revealWrong ? el("span", { class: "opt-flag bad" }, "✗ your pick — wrong") : null
      );
      group.appendChild(btn);
    });
    card.appendChild(group);

    if (!checked) {
      var actions = el("div", { class: "quiz-actions" });
      var checkBtn = el("button", {
        class: picked !== null ? "btn btn-flow minh-44 fw-600" : "btn btn-ghost-disabled minh-44",
        attrs: { disabled: picked === null || null },
        on: {
          click: function () {
            if (picked !== null) {
              dispatch({ type: "SET_QUIZ_ANSWER", id: item.id, value: picked });
            }
          },
        },
      }, "CHECK ANSWER");
      actions.appendChild(checkBtn);
      actions.appendChild(el("span", { class: "hint" }, "you can change your pick until you check"));
      card.appendChild(actions);
    } else {
      var explain = el("p", {
        class: "quiz-explain",
        attrs: { role: "status", "aria-live": "polite" },
      },
        el("span", { class: cn("e-flag", isCorrectPick ? "ok" : "bad") },
          isCorrectPick ? "CORRECT ✓ — WHY" : "WRONG ✗ — WHY THE ANSWER IS RIGHT"),
        item.explanation
      );
      card.appendChild(explain);

      var nextRow = el("div", { class: "quiz-next-row" });
      nextRow.appendChild(el("button", {
        class: "btn btn-lime minh-44 fw-600",
        attrs: { "aria-label": "Go to the next question (mandatory)" },
        on: {
          click: function () {
            picked = null;
            var fu = -1;
            for (var i = 0; i < total2().length; i++) {
              if (state.quizAnswers[total2()[i].id] === undefined) { fu = i; break; }
            }
            if (fu === -1) finishScreen = true;
            else viewIdx = fu;
            rerender();
          },
        },
      },
        ac >= total ? "NEXT · FINISH SCREEN" : "NEXT QUESTION",
        icon("chevron-right", "ico-14")
      ));
      nextRow.appendChild(el("span", { class: "hint" }, "the checked answer stays locked — NEXT is the only way forward"));
      card.appendChild(nextRow);
    }
    return card;

    function total2() { return itemsFor(state); }
  }

  function renderReview(items, answers, quizCorrect, quizTotal) {
    var list = el("div", { class: "review-list" });
    items.forEach(function (q, idx) {
      var chosen = answers[q.id];
      var locked = chosen !== undefined;
      var correct = locked && chosen === String(q.answer);
      var item = el("div", { class: cn("review-item", locked ? (correct ? "correct" : "missed") : "") });

      item.appendChild(el("div", { class: "r-head" },
        el("span", { class: "q-num" }, "Q" + (idx + 1)),
        el("p", { class: "q-prompt" }, q.prompt),
        locked ? el("span", { class: cn("r-verdict", correct ? "ok" : "bad") },
          correct ? "✓ yours was correct" : "✗ missed") : null
      ));

      var opts = el("div", { class: "quiz-options" });
      q.options.forEach(function (opt, oi) {
        var isChosen = locked && chosen === String(oi);
        var cls = "review-opt";
        if (isChosen) cls += correct ? " chosen-correct" : " chosen-wrong";
        opts.appendChild(el("div", { class: cls, attrs: { "aria-current": isChosen ? "true" : null } },
          el("span", { class: "opt-letter" }, String.fromCharCode(65 + oi) + "."),
          opt,
          isChosen ? el("span", { class: cn("opt-flag", correct ? "ok" : "bad") },
            correct ? "✓ your pick" : "✗ your pick") : null
        ));
      });
      item.appendChild(opts);

      if (locked) {
        item.appendChild(el("p", { class: "review-explain", attrs: { role: "status" } },
          el("span", { class: "why" }, "WHY"),
          q.explanation
        ));
      }
      list.appendChild(item);
    });

    list.appendChild(el("div", { class: "quiz-complete", attrs: { role: "status" } },
      el("span", { class: "badge-solid-lime" }, "QUIZ COMPLETE"),
      el("span", null,
        quizCorrect + "/" + quizTotal + " correct — " +
        (quizCorrect === quizTotal
          ? "flawless. You know this material."
          : "re-read the explanations above; every miss is a free lesson (see FOCUS AREAS in your final report)."))
    ));
    return list;
  }

  // rerender hook — wired by app.js (renders the whole page on demand)
  var rerender = function () {};

  return {
    render: render,
    computeQuizCorrect: computeQuizCorrect,
    setRerender: function (fn) { rerender = fn; },
  };
})();
