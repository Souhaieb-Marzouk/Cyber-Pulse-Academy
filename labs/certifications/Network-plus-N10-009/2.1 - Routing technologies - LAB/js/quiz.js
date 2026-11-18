// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/quiz.js
// C5 — Comms Check (quiz modal). Ported from CommsCheck.tsx with all
// behaviors intact:
//   R2  the chosen answer locks the moment Check is pressed
//   R3  only the SELECTED option is highlighted (green hit / red miss) —
//       the correct answer is never revealed in green on a miss
//   R7  closes via the X button (44 px, autofocused), ESC and click-outside
//   +   enforced progression: next question auto-loads 3400 ms after a check
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var ADVANCE_MS = 3400;

  var pinned = null; // question index held on screen after a check
  var timer = null;

  function items() {
    return root.GocStore.quizFor(root.GocStore.state.mode);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function onOpen() {
    // every (re)open starts from the first unanswered question
    pinned = null;
  }

  function goNext() {
    clearTimer();
    var st = root.GocStore.state;
    var list = items();
    var next = -1;
    for (var i = 0; i < list.length; i++) {
      if (!st.quizChecked[list[i].id]) { next = i; break; }
    }
    pinned = next === -1 ? null : next;
    update();
  }

  function onCheck(qi) {
    var st = root.GocStore.state;
    var q = items()[qi];
    if (st.quizAnswers[q.id] === undefined || st.quizChecked[q.id]) return;
    root.GocStore.actions.checkQuizItem(q.id);
    pinned = qi;
    clearTimer();
    if (root.GocApp) root.GocApp.autoDebrief(); // quiz completion can complete the whole lab
    // enforced progression: the next question loads automatically
    timer = setTimeout(goNext, ADVANCE_MS);
    update();
  }

  function close() {
    clearTimer();
    root.GocStore.actions.setModal("none");
  }

  // ── rendering ──────────────────────────────────────────────────────────────
  function render() {
    onOpen();
    return '<div id="quiz-root">' + inner() + "</div>";
  }

  function update() {
    var el = document.getElementById("quiz-root");
    if (!el) return;
    // keep radio focus across the re-render (controlled-input parity)
    var active = document.activeElement;
    var focusName = null;
    if (active && el.contains(active) && active.name) focusName = active.name;
    el.innerHTML = inner();
    if (focusName) {
      var again = el.querySelector('input[name="' + focusName + '"]');
      if (again) again.focus({ preventScroll: true });
    }
  }

  function inner() {
    var U = root.GocUI.esc;
    var ic = root.GocUI.icon;
    var st = root.GocStore.state;
    var hard = st.mode === "hard";
    var list = items();
    var correct = 0;
    var allDone = true;
    list.forEach(function (q) {
      if (st.quizChecked[q.id]) {
        if (st.quizAnswers[q.id] === q.correct) correct++;
      } else {
        allDone = false;
      }
    });

    var firstOpen = -1;
    for (var i = 0; i < list.length; i++) {
      if (!st.quizChecked[list[i].id]) { firstOpen = i; break; }
    }
    var viewIdx = pinned !== null ? pinned : firstOpen;
    var showSummary = allDone && pinned === null;

    var h =
      '<div class="overlay center" id="overlay" role="dialog" aria-modal="true" aria-label="Comms check quiz" data-overlay="comms">' +
      '<div class="modal">' +
      '<div class="overlay-head">' +
      '<span class="overlay-title">' + ic("radio") +
      "<span class=\"goc-board\">COMMS CHECK · " + (hard ? "8 SCENARIO CALLS" : "7 CONCEPT QUESTIONS") + "</span></span>" +
      '<span style="display:flex;align-items:center;gap:12px">' +
      '<span class="mono-note" aria-live="polite">' + correct + "/" + list.length + " correct</span>" +
      '<button type="button" class="close-btn" id="quiz-close" data-quiz="close" aria-label="Close comms check" autofocus>' +
      ic("x") + "</button></span></div>" +
      '<div class="overlay-body stack">';

    if (!showSummary && viewIdx !== -1 && viewIdx !== null) {
      var q = list[viewIdx];
      var picked = st.quizAnswers[q.id];
      var isChecked = !!st.quizChecked[q.id];
      var isRight = picked === q.correct;

      h += '<div class="quiz-progress"><span class="which">question ' + (viewIdx + 1) + " of " + list.length + "</span>";
      h += '<div class="dots" aria-hidden="true">';
      list.forEach(function (it, di) {
        var cls = "d";
        if (st.quizChecked[it.id]) {
          cls += st.quizAnswers[it.id] === it.correct ? " d-hit" : " d-miss";
        } else if (di === viewIdx) {
          cls += " d-cur";
        }
        h += '<span class="' + cls + '"></span>';
      });
      h += "</div></div>";

      h += '<div class="quiz-card">';
      if (q.scenario) {
        h += '<p class="quiz-scenario">' + U(q.scenario) + "</p>";
      }
      h += '<p class="quiz-q"><span class="qn">Q' + (viewIdx + 1) + '.</span>' + U(q.q) + "</p>";

      h += '<div class="quiz-opts" role="radiogroup" aria-label="answers for question ' + (viewIdx + 1) + '">';
      q.options.forEach(function (opt, oi) {
        var isPicked = picked === oi;
        var cls = "quiz-opt";
        if (isChecked) {
          cls += " locked";
          if (isPicked && isRight) cls += " right";
          else if (isPicked && !isRight) cls += " wrong";
          else cls += " dim";
        } else if (isPicked) {
          cls += " picked";
        }
        h +=
          '<label class="' + cls + '"><input type="radio" name="' + q.id + '" data-quiz-pick="' + viewIdx + ":" + oi + '"' +
          (isPicked ? " checked" : "") + (isChecked ? " disabled" : "") + ' aria-label="' + U(opt) + '"><span>' + U(opt);
        if (isChecked && isPicked) {
          h += '<span class="pick-tag ' + (isRight ? "hit" : "miss") + '">' + (isRight ? "your pick · hit" : "your pick · miss") + "</span>";
        }
        h += "</span></label>";
      });
      h += "</div>";

      h += '<div class="quiz-actions">';
      if (!isChecked) {
        h +=
          '<button type="button" class="btn btn-check" data-quiz="check:' + viewIdx + '"' +
          (picked === undefined ? " disabled" : "") + ' aria-label="check answer ' + (viewIdx + 1) + '">Check</button>';
        if (picked === undefined) {
          h += '<span class="mono-note">pick an answer first</span>';
        }
      } else {
        h += '<button type="button" class="btn btn-primary" data-quiz="next" aria-label="go to the next question">Next question ' + ic("arrow-right") + "</button>";
      }
      h += "</div>";

      if (isChecked) {
        h +=
          '<div class="quiz-explain ' + (isRight ? "right" : "wrong") + '" role="status" aria-live="polite">' +
          (isRight ? "✓ HIT — " : "✗ MISS — ") + U(q.explanation) +
          '<span class="lock-note">answer locked · next question loads automatically</span></div>';
      }
      h += "</div>";
    }

    if (showSummary) {
      var perfect = correct === list.length;
      h +=
        '<div class="quiz-summary-box"><p class="line">Comms check complete — <span class="score">' + correct + "/" + list.length + "</span>. " +
        (perfect ? "Flawless transmission." : "Every miss is explained below — the debrief turns them into focus areas.") +
        "</p>" +
        '<div class="mt-3"><button type="button" class="btn btn-primary" data-quiz="close" aria-label="Return to ops floor">Back to the floor</button></div></div>';
      h += '<div class="quiz-review">';
      list.forEach(function (qq, qi) {
        var right = st.quizAnswers[qq.id] === qq.correct;
        h +=
          '<div class="quiz-review-item"><span class="hm-chip ' + (right ? "hit" : "miss") + '">' + (right ? "hit" : "miss") + "</span>" +
          "<div><p class=\"rq\"><span class=\"qn\">Q" + (qi + 1) + ".</span>" + U(qq.q) + "</p>" +
          '<p class="re">' + U(qq.explanation) + "</p></div></div>";
      });
      h += "</div>";
    }

    h += "</div></div></div>";
    return h;
  }

  // ── event hooks (called from the delegated handlers in app.js) ─────────────
  function onClick(action, target) {
    if (action === "close") { close(); return true; }
    if (action === "next") { goNext(); return true; }
    if (action.indexOf("check:") === 0) { onCheck(parseInt(action.slice(6), 10)); return true; }
    return false;
  }

  function onChange(value, target) {
    // data-quiz-pick="qi:oi"
    var parts = value.split(":");
    var qi = parseInt(parts[0], 10);
    var oi = parseInt(parts[1], 10);
    var q = items()[qi];
    if (q) {
      root.GocStore.actions.setQuizAnswer(q.id, oi);
      update();
    }
  }

  root.GocQuiz = {
    render: render,
    onClick: onClick,
    onChange: onChange,
    onOpen: onOpen,
    clearTimer: clearTimer,
  };
})(typeof window !== "undefined" ? window : globalThis);
