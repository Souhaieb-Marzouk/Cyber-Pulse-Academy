/* ============================================================
   The Assurance Bureau — js/quiz.js
   Knowledge check (07), result sheet, completion field report
   modal and the sidebar finish panel. Quiz CONTENT lives in
   js/data.js; this file is the quiz UI + flow.
   ============================================================ */

var QUIZ_UI = (function () {
  "use strict";

  var el = UI.el;
  var ICON_X = UI.ICON_X;

  function defsFor(mode) {
    return mode === "hard" ? LAB_DATA.QUIZ_HARD : LAB_DATA.QUIZ_MEDIUM;
  }

  function Stars(n) {
    return el("div", { class: "stars", "aria-label": n + " of 5 stars" }, [1, 2, 3, 4, 5].map(function (i) {
      return el("span", { class: i <= n ? "lit" : "", "aria-hidden": "true", text: "★" });
    }));
  }

  // ---------- result sheet (after finishing) ----------
  function ResultSheet() {
    var state = STORE.getState();
    var mode = state.mode || "medium";
    var defs = defsFor(mode);
    var quizCorrect = defs.reduce(function (acc, d, i) {
      return acc + (state.quiz.picked[i] === d.answer ? 1 : 0);
    }, 0);
    return UI.DeskSection("07 · Knowledge check", "Result sheet", [
      el("p", { style: { marginBottom: "8px", fontSize: "14px" } }, [
        "You answered ",
        el("strong", { text: quizCorrect + "/" + defs.length }),
        " correctly. ",
        quizCorrect === defs.length
          ? "A clean sheet — the committee is impressed."
          : "Read the explanations below the fold of each question when you revisit.",
      ]),
      el("ol", { class: "rs-list" }, defs.map(function (d, i) {
        var ok = state.quiz.picked[i] === d.answer;
        return el("li", { class: "rs-item" }, [
          el("p", { class: "rs-q" }, [
            el("span", { class: ok ? "rs-mark-ok" : "rs-mark-bad", "aria-hidden": "true", text: ok ? "✓" : "✗" }),
            d.q,
          ]),
          el("p", { class: "rs-explain", text: d.explain }),
        ]);
      })),
      el("p", { style: { marginTop: "12px", fontSize: "14px" } }, [
        "All worksheets and the knowledge check are done — head to the ledger column and ",
        el("strong", { text: "close the engagement" }),
        " to receive your field report.",
      ]),
    ]);
  }

  // ---------- live quiz panel ----------
  function QuizPanel() {
    var state = STORE.getState();
    var mode = state.mode || "medium";
    var defs = defsFor(mode);
    if (state.quiz.finished) {
      return ResultSheet();
    }
    var idx = Math.min(state.quiz.idx, defs.length - 1);
    var q = defs[idx];
    var picked = state.quiz.picked[idx];
    var answered = picked !== undefined;
    var correct = answered && picked === q.answer;
    var pickedCount = Object.keys(state.quiz.picked).length;

    var section = UI.DeskSection("07 · Knowledge check", "Question " + (idx + 1) + " of " + defs.length, []);
    var live = el("div", { "aria-live": "polite" });

    if (q.scenario) {
      live.appendChild(
        el("p", { class: "quiz-scenario" }, [
          el("span", { class: "kicker", text: "scenario · " }),
          q.scenario,
        ])
      );
    }
    live.appendChild(el("p", { class: "quiz-q", text: q.q }));
    live.appendChild(
      el("div", { class: "quiz-opts", role: "radiogroup", "aria-label": q.q }, q.options.map(function (opt, i) {
        var selected = picked === i;
        // R3: only the SELECTED option is highlighted after submission —
        // green when correct, red when wrong; the correct answer is never
        // revealed in green on a wrong submission; color never rides alone.
        var isCorrectPick = selected && answered && i === q.answer;
        var isWrongPick = selected && answered && i !== q.answer;
        var cls = "quiz-opt";
        if (isCorrectPick) cls += " correct-pick";
        else if (isWrongPick) cls += " wrong-pick";
        else if (selected && !answered) cls += " selected-ink";
        return el("button", {
          type: "button",
          class: cls,
          disabled: answered,
          "aria-pressed": selected ? "true" : "false",
          "data-action": "quiz-pick",
          "data-idx": String(idx),
          "data-opt": String(i),
        }, [
          el("span", { class: "opt-letter", "aria-hidden": "true", text: String.fromCharCode(65 + i) + "." }),
          el("span", { style: { flex: "1" }, text: opt }),
          isCorrectPick
            ? el("span", { class: "mark-ok" }, [ "✓", el("span", { class: "sr-only", text: " — correct selection" }) ])
            : null,
          isWrongPick
            ? el("span", { class: "mark-bad" }, [ "✗", el("span", { class: "sr-only", text: " — wrong selection" }) ])
            : null,
        ]);
      }))
    );
    if (answered) {
      live.appendChild(
        el("div", { class: "quiz-explain " + (correct ? "good" : "bad") }, [
          el("p", { class: "why-label", style: { color: correct ? "var(--green)" : "var(--red)" }, text: correct ? "Correct — here is why" : "Not quite — here is why" }),
          el("p", { class: "body", text: q.explain }),
        ])
      );
    }
    section.appendChild(live);
    section.appendChild(
      el("div", { class: "quiz-footer" }, [
        el("span", { class: "obj-counter", text: pickedCount + "/" + defs.length + " answered" }),
        idx < defs.length - 1
          ? el("button", { type: "button", class: "btn btn-ink", disabled: !answered, "data-action": "quiz-next", text: "Next question →" })
          : el("button", { type: "button", class: "btn btn-green", disabled: !answered, "data-action": "quiz-finish", text: "Finish knowledge check" }),
      ])
    );
    return section;
  }

  // ---------- sidebar finish panel ----------
  function FinishPanel() {
    var state = STORE.getState();
    var mode = state.mode || "medium";
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    var allDone = objs.every(function (o) {
      return state.checks[o.id] && state.checks[o.id].done;
    });
    var eligible = allDone && state.quiz.finished;

    if (state.completed) {
      return el("div", { class: "finish-box" }, [
        UI.Stamp(true, "FILED"),
        el("p", { text: "Engagement closed. Reopen the field report from here, or reset for a new run." }),
        el("button", { type: "button", class: "btn-link btn-link-green", "data-action": "show-report", text: "Show field report again" }),
      ]);
    }
    var missing = objs.filter(function (o) {
      return !(state.checks[o.id] && state.checks[o.id].done);
    });
    return el("div", {}, [
      el("button", { type: "button", class: "btn btn-green", disabled: !eligible, "data-action": "close-engagement", text: "Close the engagement →" }),
      !eligible
        ? el("p", {
            class: "finish-missing",
            text: allDone
              ? "Knowledge check pending (tab 07)."
              : missing.length + " worksheet(s) left: " + missing.map(function (m) { return m.id; }).join(", ") + ".",
          })
        : null,
    ]);
  }

  // ---------- completion modal (field report) ----------
  var lastFocused = null;

  function CompletionModal() {
    var state = STORE.getState();
    var mode = state.mode || "medium";
    var defs = defsFor(mode);
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    var score = ENGINE.computeScore(state.checks, state.quiz, defs, mode);
    var focusAreas = ENGINE.computeFocusAreas(state.checks, state.quiz, defs, objs);

    var modal = el("div", { class: "dialog-box", role: "dialog", "aria-modal": "true", "aria-labelledby": "report-title", tabindex: "-1" });
    modal.appendChild(el("button", { type: "button", class: "dialog-close", "data-action": "report-close", "aria-label": "Close", html: ICON_X }));
    modal.appendChild(el("p", { class: "kicker dialog-kicker", text: "The Assurance Bureau · field report" }));
    modal.appendChild(el("p", { class: "dialog-title", id: "report-title", text: "Engagement closed" }));
    modal.appendChild(el("p", { class: "dialog-desc", text: "Case AUD-2026-114 (" + (mode === "hard" ? "solo" : "guided") + ") · Halcyon Credit Union ITGC audit. You participated in the audit end to end — charter, sampling, interviews, control testing, findings, remediation, validation, attestation." }));

    modal.appendChild(
      el("div", { class: "score-box" }, [
        el("div", {}, [
          el("p", { class: "score-sub", style: { textTransform: "uppercase", letterSpacing: "0.1em" }, text: "Field report score" }),
          el("p", { class: "score-num", text: score.score + "/100" }),
          el("p", { class: "score-sub", text: score.objectivesFirstTry + "/" + score.objectivesTotal + " worksheets first-try · " + score.quizCorrect + "/" + score.quizTotal + " quiz · −" + score.hintsUsed + " hint penalty" }),
        ]),
        Stars(score.stars),
      ])
    );

    var pillarWrap = el("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } });
    ["P1", "P2", "P3", "P4"].forEach(function (p) {
      var items = objs.filter(function (o) { return o.pillar === p; });
      var doneCount = items.filter(function (o) {
        return state.checks[o.id] && state.checks[o.id].done;
      }).length;
      pillarWrap.appendChild(
        el("div", { class: "pillar-recap" }, [
          el("p", { class: "pr-head", text: p + " · " + LAB_DATA.PILLAR_LABEL[p] + " — " + doneCount + "/" + items.length }),
          el("ul", {}, items.map(function (o) {
            var ft = state.checks[o.id] && state.checks[o.id].firstTry;
            return el("li", {}, [
              el("span", { class: ft ? "pr-star" : "pr-check", "aria-hidden": "true", text: ft ? "★" : "✓" }),
              el("span", { class: "pr-id", text: o.id }),
              " " + o.title,
            ]);
          })),
        ])
      );
    });
    modal.appendChild(pillarWrap);

    // R8: focus areas derived from the student's actual evidence
    modal.appendChild(
      el("div", { class: "focus-box" }, [
        el("p", { class: "focus-label", text: "Focus areas for your next study block" }),
        el("ul", {}, focusAreas.map(function (f) {
          return el("li", {}, [
            el("p", { class: "fa-title" }, [
              el("span", { class: "arrow", "aria-hidden": "true", text: "▸" }),
              f.title,
            ]),
            el("p", { class: "fa-body", text: f.detail + ". " + f.action }),
          ]);
        })),
      ])
    );

    modal.appendChild(
      el("div", { class: "next-note" }, [
        el("strong", { text: "Where to go next:" }),
        " SY0-801 objective 5.4 (compliance mechanics), 5.6 (security awareness) — and objective 4.3, where penetration-test report review now lives. Re-run this lab in the other mode to test the same ground without scaffolding.",
      ])
    );

    modal.appendChild(
      el("div", { class: "dialog-actions" }, [
        el("button", { type: "button", class: "btn btn-ink", "data-action": "report-review", text: "Review the binder" }),
        el("button", { type: "button", class: "btn btn-outline-red", style: { fontSize: "12px", fontWeight: "700" }, "data-action": "report-reset", text: "New engagement (reset)" }),
      ])
    );

    return el("div", { class: "dialog-overlay", "data-action": "report-overlay" }, [modal]);
  }

  // open/close helpers — focus moved into the dialog, restored on close (R7)
  function openDialog(node) {
    lastFocused = document.activeElement;
    document.getElementById("app").appendChild(node);
    var box = node.querySelector('[role="dialog"], [role="alertdialog"]');
    if (box) box.focus();
  }

  function closeDialogs() {
    document.querySelectorAll(".dialog-overlay").forEach(function (n) {
      n.remove();
    });
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function hasOpenDialog() {
    return document.querySelector(".dialog-overlay") !== null;
  }

  return {
    defsFor: defsFor,
    ResultSheet: ResultSheet,
    QuizPanel: QuizPanel,
    FinishPanel: FinishPanel,
    CompletionModal: CompletionModal,
    openDialog: openDialog,
    closeDialogs: closeDialogs,
    hasOpenDialog: hasOpenDialog,
  };
})();
