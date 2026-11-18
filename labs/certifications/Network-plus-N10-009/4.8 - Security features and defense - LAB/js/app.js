// ── Red-Line Room · app bootstrap, ledger, quiz, debrief, modals ───────
// Vanilla-JS re-creation of SpecLedger, Quiz, Debrief, CompletionModal and
// LabRoot (behavioral parity with the original React implementation).
"use strict";

(function () {
  var D = window.RL_DATA;
  var C = window.RL_CONTENT;
  var U = window.RL.ui;
  var P = window.RL_PANELS;
  var store = window.RL_STORE;
  var H = window.RL_STATE_HELPERS;
  var OBJ = window.RL_OBJECTIVES;
  var esc = U.esc, icon = U.icon, btn = U.btn;

  // ── UI-local (non-persisted) state ────────────────────────────────────
  var ui = {
    tab: "draw",
    catTab: "hard",
    popoverDev: null,
    hardDev: "gw1",
    aclBrief: false,
    openTrace: null,
    openLog: null,
    accOpen: null,
    matchPicked: null,
    matchFlash: null,
    matchShuffle: null,
    nacPicked: null,
    nacNudge: false,
    quizIdx: 0,
    quizPicked: null,
    quizNudge: false,
    signoffOpen: false,
    resetOpen: false,
  };
  var flashTimer = null;

  function objectivesFor(mode) {
    return mode === "hard" ? OBJ.HARD : OBJ.MEDIUM;
  }
  function quizFor(mode) {
    return mode === "hard" ? C.QUIZ_HARD : C.QUIZ_MEDIUM;
  }

  // ── toasts (limit 1, dismiss-only — same as the original toaster) ─────
  var toastEl = null;
  function showToast(title, description) {
    if (!toastEl) return;
    toastEl.innerHTML =
      '<div class="toast" role="status">' +
      '<div><p class="toast-title">' + esc(title) + "</p>" +
      (description ? '<p class="toast-desc">' + esc(description) + "</p>" : "") +
      "</div>" +
      '<button type="button" class="toast-close" aria-label="Dismiss notification" data-act="toast-close">' + icon("x", 14) + "</button>" +
      "</div>";
  }
  function clearToast() {
    if (toastEl) toastEl.innerHTML = "";
  }

  // ── modals ────────────────────────────────────────────────────────────
  function renderResetModal() {
    return (
      '<div class="modal-overlay" data-act="overlay-close" data-modal="reset">' +
      '<div class="modal narrow" data-stop role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<button type="button" class="modal-close modal-close-x" aria-label="Close" data-act="modal-close" data-modal="reset">' + icon("x", 16) + "</button>" +
      '<h2 id="reset-title" class="modal-title" style="font-size:16px">Wipe the sheet and start over?</h2>' +
      '<p id="reset-desc" class="modal-desc" style="margin-top:8px">This clears every stamp, config, prediction and quiz answer in this lab, and restores the pristine state. The saved sitting in this browser is erased.</p>' +
      '<div class="modal-actions">' +
      btn('data-act="modal-close" data-modal="reset"', "Keep working", "btn-outline") +
      btn('data-act="reset-confirm" class="btn-destructive"', "Reset the lab") +
      "</div></div></div>"
    );
  }

  // R8: focus areas strictly from evidence (same algorithm as the original)
  var TOPIC_LABELS = {
    hard: "Device hardening",
    nac: "NAC",
    keys: "Key management",
    acl: "ACLs",
    filter: "URL/content filtering",
    zones: "Trusted vs. untrusted zones",
    dmz: "Screened subnet",
    verify: "Verification & detection work",
  };

  function buildFocusAreas(state, objectives, quizQuestions, mode) {
    var areas = [];
    var quizBank = mode === "hard" ? C.QUIZ_HARD : C.QUIZ_MEDIUM;
    var quizById = {};
    quizBank.forEach(function (q) { quizById[q.id] = q; });
    var missedTopics = {};
    var missedOrder = [];
    quizQuestions.forEach(function (q) {
      var full = quizById[q.id];
      if (full && state.quiz[q.id] !== undefined && state.quiz[q.id] !== q.correct) {
        if (!missedTopics[full.topic]) {
          missedTopics[full.topic] = [];
          missedOrder.push(full.topic);
        }
        missedTopics[full.topic].push(q.id);
      }
    });
    missedOrder.forEach(function (topic) {
      var ids = missedTopics[topic];
      areas.push({
        tag: topic === "verify" ? "QUIZ" : TOPIC_LABELS[topic].toUpperCase(),
        text:
          "Knowledge-check miss" + (ids.length > 1 ? "es" : "") + " (" + ids.join(", ") + ") touch " + TOPIC_LABELS[topic] +
          " — re-read the Field Manual's " + (topic === "verify" ? "seven-family overview" : "'" + TOPIC_LABELS[topic] + "'") +
          " section, then re-derive the answer before re-reading its explanation.",
      });
    });
    var undone = objectives.filter(function (o) { return !(state.objectives[o.id] && state.objectives[o.id].done); });
    if (undone.length) {
      var byTopic = {};
      var topicOrder = [];
      undone.forEach(function (o) {
        if (!byTopic[o.topic]) {
          byTopic[o.topic] = [];
          topicOrder.push(o.topic);
        }
        byTopic[o.topic].push(o);
      });
      topicOrder.forEach(function (topic) {
        var objs = byTopic[topic];
        areas.push({
          tag: topic === "verify" ? "SPECS" : TOPIC_LABELS[topic].toUpperCase(),
          text:
            objs.length + " spec" + (objs.length > 1 ? "s" : "") + " still open (" +
            objs.map(function (o) { return o.id.replace("OBJ-", mode === "medium" ? "M" : "H"); }).join(", ") + ") — " + objs[0].focus,
        });
      });
    }
    var rocky = objectives.filter(function (o) {
      var p = state.objectives[o.id];
      return p && p.done && (!p.firstTry || p.hints > 0);
    });
    if (rocky.length && !undone.length) {
      var extraChecks = rocky.some(function (o) { return !state.objectives[o.id].firstTry; });
      var hintAssisted = rocky.some(function (o) { return (state.objectives[o.id].hints || 0) > 0; });
      areas.push({
        tag: "REVIEW",
        text:
          "Stamped but shaky (" + rocky.map(function (o) { return o.id.replace("OBJ-", mode === "medium" ? "M" : "H"); }).join(", ") +
          "): needed " + (extraChecks ? "extra checks " : "") + (hintAssisted ? "or hint stamps " : "") +
          "— re-do " + rocky[0].focus.charAt(0).toLowerCase() + rocky[0].focus.slice(1),
      });
    }
    return areas.slice(0, 6);
  }

  function renderSignOffModal(state, objectives, quizQuestions, mode) {
    var doneIds = objectives.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; });
    var quizCorrect = quizQuestions.filter(function (q) { return state.quiz[q.id] === q.correct; }).length;
    var complete = doneIds.length === objectives.length && quizCorrect === quizQuestions.length;
    var stars = H.starsFor(state, objectives.map(function (o) { return o.id; }));
    var hintsUsed = doneIds.reduce(function (acc, o) { return acc + ((state.objectives[o.id] && state.objectives[o.id].hints) || 0); }, 0);
    var penalty = mode === "hard" ? hintsUsed * 2 : 0;
    var baseScore = doneIds.length + quizCorrect;
    var score = Math.max(0, baseScore - penalty);
    var maxScore = objectives.length + quizQuestions.length;

    var groups = { P1: [], P2: [], P3: [], P4: [] };
    objectives.forEach(function (o) { groups[o.pillar].push(o); });

    // star icons (fill via style — var() is invalid in SVG presentation attributes)
    var starHtml = [1, 2, 3, 4, 5]
      .map(function (i) {
        var lit = i <= stars;
        return (
          '<svg class="pop-in' + (lit ? " lit" : "") + '" width="28" height="28" viewBox="0 0 24 24" style="animation-delay:' + 0.08 * i + 's;' +
          'fill:' + (lit ? "var(--amber)" : "none") + ';stroke:' + (lit ? "var(--amber)" : "var(--border)") + '" ' +
          'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          (window.RL_ICONS.star || "") + "</svg>"
        );
      })
      .join("");

    var pillarBlocks = ["P1", "P2", "P3", "P4"]
      .map(function (p) {
        var chips = groups[p]
          .map(function (o) {
            var done = state.objectives[o.id] && state.objectives[o.id].done;
            return (
              '<span class="badge draft-mono ' + (done ? "done" : "open") + '">' + (done ? "✓ " : "○ ") +
              o.id.replace("OBJ-", mode === "medium" ? "M" : "H") + "</span>"
            );
          })
          .join("");
        return (
          '<div class="pillar-block"><p class="pillar-label stencil">' + p + " · " + U.PILLAR_META[p].label + '</p><div class="pillar-chips">' + chips + "</div></div>"
        );
      })
      .join("");

    var focusAreas = buildFocusAreas(state, objectives, quizQuestions, mode);
    var focusHtml;
    if (focusAreas.length === 0) {
      focusHtml =
        '<ul class="focus-list">' +
        '<li><span class="arrow">' + icon("arrowright", 14) + '</span><span style="color:var(--muted-foreground)">Every spec stamped first-try, every quiz answer defensible — no weak spot to chase.</span></li>' +
        '<li><span class="arrow">' + icon("arrowright", 14) + '</span><span style="color:var(--muted-foreground)">Keep it fresh: re-run the audit rig after changing ONE rule and predict the diff before running.</span></li>' +
        '<li><span class="arrow">' + icon("arrowright", 14) + '</span><span style="color:var(--muted-foreground)">Take the other sitting — Audit Trial / Guided Draft plays the same network as a different mission.</span></li>' +
        "</ul>";
    } else {
      focusHtml =
        '<ul class="focus-list">' +
        focusAreas
          .map(function (f) {
            return (
              '<li><span class="arrow">' + icon("arrowright", 14) + '</span><span style="color:rgba(232,228,216,0.9)"><span class="focus-tag stencil">' +
              esc(f.tag) + "</span>" + esc(f.text) + "</span></li>"
            );
          })
          .join("") +
        "</ul>";
    }

    return (
      '<div class="modal-overlay" data-act="overlay-close" data-modal="signoff">' +
      '<div class="modal" data-stop role="dialog" aria-modal="true" aria-labelledby="signoff-title" aria-describedby="signoff-desc">' +
      '<button type="button" class="modal-close" aria-label="Close" data-act="modal-close" data-modal="signoff">' + icon("x", 16) + "</button>" +
      '<h2 id="signoff-title" class="modal-title">' + icon("stamp", 20, "text-amber") + ' SHEET SIGN-OFF — ' + (mode === "medium" ? "GUIDED DRAFT" : "AUDIT TRIAL") + "</h2>" +
      '<p id="signoff-desc" class="modal-desc">' +
      (complete
        ? "The reviewer stamps the drawing. Every family held under load — this is what mastery of Lesson 4.8 feels like."
        : "Current standing on this sheet. The focus areas below are computed from your own evidence — close what they name.") +
      "</p>" +
      '<div class="signoff-stars">' +
      '<div class="row" role="img" aria-label="' + stars + ' of 5 stars">' + starHtml + "</div>" +
      '<div class="signoff-stats draft-mono"><p>SCORE <span class="score">' + score + "/" + maxScore + "</span> · SPECS " + doneIds.length + "/" + objectives.length + " · QUIZ " + quizCorrect + "/" + quizQuestions.length + "</p>" +
      '<p class="fine">stars = first-attempt accuracy &amp; hint frugality' +
      (mode === "hard" && hintsUsed > 0 ? " · nudges taken: " + hintsUsed + " (−" + penalty + " from score)" : "") +
      "</p></div></div>" +
      pillarBlocks +
      '<div class="focus-box"><p class="focus-head stencil">' + icon("crosshair", 14) + " FOCUS AREAS — FROM THIS SITTING'S EVIDENCE</p>" + focusHtml + "</div>" +
      '<div class="modal-actions">' +
      btn('data-act="reset-open"', icon("rotateccw", 16) + " Reset lab", "btn-outline") +
      btn('data-act="modal-close" data-modal="signoff" class="btn-primary"', "Back to the bench") +
      "</div></div></div>"
    );
  }

  // ── Spec Ledger ───────────────────────────────────────────────────────
  function renderProgressRing(pct) {
    var r = 14;
    var c = 2 * Math.PI * r;
    var filled = (pct / 100) * c;
    return (
      '<svg width="38" height="38" viewBox="0 0 38 38" role="img" aria-label="Progress: ' + Math.round(pct) + ' percent">' +
      '<circle cx="19" cy="19" r="' + r + '" fill="none" stroke="#24384c" stroke-width="4" />' +
      '<circle cx="19" cy="19" r="' + r + '" fill="none" stroke="#f0a832" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + filled + " " + (c - filled) + '" transform="rotate(-90 19 19)" style="transition:stroke-dasharray 0.4s ease" />' +
      '<text x="19" y="23" text-anchor="middle" font-size="10" fill="#e8e4d8" style="font-family:\'Geist Mono\',ui-monospace,monospace">' + Math.round(pct) + "</text></svg>"
    );
  }

  function renderLedger(state, objectives, mode) {
    var done = objectives.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length;
    var nextUp = null;
    for (var i = 0; i < objectives.length; i++) {
      if (!(state.objectives[objectives[i].id] && state.objectives[objectives[i].id].done)) { nextUp = objectives[i]; break; }
    }
    var items = objectives
      .map(function (o, idx) {
        var prog = state.objectives[o.id];
        var isDone = !!(prog && prog.done);
        var isNext = mode === "medium" && nextUp && nextUp.id === o.id;
        var fb = prog ? prog.lastFeedback : null;
        var body = "";
        if (!isDone) {
          var hintsUsed = prog ? prog.hints || 0 : 0;
          var hintControl;
          if (mode === "medium") {
            hintControl =
              hintsUsed >= Math.min(3, o.hints.length)
                ? '<span class="badge stencil" style="font-size:9px;border-color:rgba(127,184,216,0.5);color:var(--blue-text)">' + hintsUsed + " hints used</span>"
                : btn('class="btn-ghost minh-11" style="font-size:11px;padding:0.25rem 0.75rem;color:var(--blue-text)" aria-label="Reveal hint ' + (hintsUsed + 1) + ' of 3" data-act="hint" data-id="' + o.id + '"', icon("lightbulb", 12) + " Hint " + (hintsUsed + 1) + "/3");
          } else {
            hintControl =
              hintsUsed > 0
                ? '<span class="badge stencil" style="font-size:9px;border-color:rgba(239,107,94,0.5);color:var(--red-text)">nudge taken</span>'
                : btn('class="btn-ghost minh-11" style="font-size:11px;padding:0.25rem 0.75rem;color:var(--red-text)" aria-label="Take the one allowed nudge — costs score" data-act="hint" data-id="' + o.id + '"', icon("lightbulb", 12) + " Nudge (−score)");
          }
          var failLine = fb && !fb.ok
            ? '<p class="obj-fail" aria-live="polite"><span class="x">' + icon("xcircle", 14) + "</span><span>" + esc(fb.body) + "</span></p>"
            : "";
          var shownHints = "";
          if (prog && hintsUsed > 0) {
            shownHints =
              '<div class="obj-hints">' +
              o.hints
                .slice(0, hintsUsed)
                .map(function (h) {
                  return "<p>" + icon("lightbulb", 12) + " " + esc(h) + "</p>";
                })
                .join("") +
              "</div>";
          }
          body =
            '<p class="obj-how">' + esc(o.how) + "</p>" +
            '<div class="obj-actions">' +
            btn('class="btn-primary minh-11" style="font-size:11px;padding:0.25rem 0.75rem" aria-label="Check result for: ' + esc(o.title) + '" data-act="check-obj" data-id="' + o.id + '"', icon("stamp", 12) + " Check result") +
            hintControl +
            "</div>" +
            failLine + shownHints;
        } else {
          body = '<p class="obj-feedback">' + icon("checkcircle2", 14) + "<span>" + esc(o.feedback) + "</span></p>";
        }
        return (
          '<li><article class="obj-card ' + (isDone ? "done" : isNext ? "next" : "") + '" aria-label="Objective ' + (idx + 1) + ": " + esc(o.title) + '">' +
          '<div class="obj-row">' +
          '<span class="obj-id draft-mono ' + (isDone ? "done" : "") + '">' + o.id.replace("OBJ-", "") + "</span>" +
          '<div class="obj-main">' +
          '<p class="obj-title ' + (isDone ? "done" : "") + '">' + esc(o.title) + "</p>" +
          '<div class="obj-badges">' + U.pillarBadge(o.pillar) + (isNext ? '<span class="badge badge-solid stencil" style="font-size:9px">NEXT SPEC</span>' : "") + "</div>" +
          body +
          "</div>" +
          (isDone ? '<span class="stamp-in stamped-chip stencil draft-mono" aria-hidden="true">STAMPED</span>' : "") +
          "</div></article></li>"
        );
      })
      .join("");
    var pct = objectives.length ? (done / objectives.length) * 100 : 0;
    return (
      '<div class="ledger-head">' +
      U.sectionTitle("SPEC LEDGER", mode === "medium" ? "Each spec is one learning bite — stamp them in order (or roam freely)." : "Broad missions. No spotlight, no free hints.") +
      '<div class="ledger-progress">' + renderProgressRing(pct) + '<div class="ledger-count draft-mono">' + done + "/" + objectives.length + " stamped</div></div>" +
      "</div>" +
      '<div class="ledger-scroll thin-scroll"><ol class="ledger-list" aria-label="Learning objectives">' + items + "</ol></div>" +
      '<div class="ledger-foot">' +
      btn('class="w-full minh-11 ' + (done === objectives.length ? "btn-primary" : "btn-outline") + '" data-act="signoff"', icon("stamp", 16) + " Sign off the sheet") +
      "</div>"
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  function renderQuiz(state, questions, label) {
    var answered = questions.filter(function (q) { return state.quiz[q.id] !== undefined; }).length;
    var correct = questions.filter(function (q) { return state.quiz[q.id] === q.correct; }).length;
    // first question the student has not answered yet (locked answers are reviewable in place)
    var firstOpen = questions.length - 1;
    for (var fi = 0; fi < questions.length; fi++) {
      if (state.quiz[questions[fi].id] === undefined) { firstOpen = fi; break; }
    }
    var clamped = Math.min(ui.quizIdx, firstOpen);
    var q = questions[clamped];
    var checked = state.quiz[q.id] !== undefined;
    var chosen = state.quiz[q.id];
    var ok = chosen === q.correct;
    var allDone = answered === questions.length;
    var isLast = clamped === questions.length - 1;

    var chips = questions
      .map(function (qq, qi) {
        var done = state.quiz[qq.id] !== undefined;
        var good = state.quiz[qq.id] === qq.correct;
        var cls = "quiz-chip draft-mono";
        if (done) cls += good ? " pass" : " fail";
        if (qi === clamped) cls += " current";
        return '<span class="' + cls + '" aria-current="' + (qi === clamped ? "step" : "false") + '">Q' + (qi + 1) + "</span>";
      })
      .join("");

    var body;
    if (allDone) {
      body =
        '<div class="quiz-complete">' +
        '<p class="big">' + icon("checkcircle2", 16) + " Knowledge check complete — " + correct + "/" + questions.length + " correct.</p>" +
        "<p>Every answer is locked. Sign off from the Spec Ledger when the bench is done.</p>" +
        "</div>";
    } else {
      var options = q.options
        .map(function (o, oi) {
          var isChosen = checked ? chosen === oi : ui.quizPicked === oi;
          var isCorrect = oi === q.correct;
          var cls = "opt-btn";
          if (checked && isChosen && ok) cls += " judged-correct";
          else if (checked && isChosen && !ok) cls += " judged-wrong";
          else if (checked && !isChosen) cls += " dimmed";
          else if (!checked && isChosen) cls += " picked";
          else cls += " hoverable";
          var mark = "";
          if (checked && isChosen && ok) mark = '<span style="color:var(--mint);flex-shrink:0;display:inline-flex">' + icon("checkcircle2", 14) + "</span>";
          if (checked && isChosen && !ok) mark = '<span style="color:var(--red);flex-shrink:0;display:inline-flex">' + icon("xcircle", 14) + "</span>";
          return (
            '<button type="button" role="radio" aria-checked="' + isChosen + '"' + (checked ? " disabled" : "") + ' class="' + cls + '" data-act="quiz-pick" data-i="' + oi + '">' +
            mark + "<span>" + esc(o) + "</span></button>"
          );
        })
        .join("");
      var after = "";
      if (checked) {
        after =
          '<div class="mt-3"><p class="explain-block ' + (ok ? "ok" : "warn") + '" aria-live="polite">' + icon("listchecks", 14) +
          (ok ? " Correct. " : " Not quite — the defensible answer is: ") + esc(q.explain) + "</p>" +
          '<div class="flex-between" style="margin-top:12px;align-items:center">' +
          '<span class="lock-note draft-mono" style="margin-top:0">answer locked — it cannot be changed</span>' +
          btn('data-act="quiz-next" class="btn-primary minh-11" style="font-size:12px" aria-label="' + (isLast ? "Finish the knowledge check" : "Go to question " + (clamped + 2)) + '">',
            isLast ? "Finish the knowledge check" : 'Next question ' + icon("arrowright", 14)) +
          "</div></div>";
      } else {
        after =
          (ui.quizNudge ? '<p class="nudge" aria-live="polite">Select an answer first — nothing is highlighted until you check one.</p>' : "") +
          '<div class="mt-3">' + btn('data-act="quiz-check" class="btn-primary minh-11" style="font-size:12px" aria-label="Check answer for question ' + (clamped + 1) + '"', icon("listchecks", 16) + " Check answer") + "</div>";
      }
      body =
        '<p class="quiz-prompt"><span class="quiz-num draft-mono">Question ' + (clamped + 1) + " of " + questions.length + "</span>" + esc(q.prompt) + "</p>" +
        '<div role="radiogroup" aria-label="Question ' + (clamped + 1) + ' options">' + options + "</div>" +
        after;
    }

    return (
      '<div class="spacer-4">' +
      '<div class="flex-between">' +
      U.sectionTitle("KNOWLEDGE CHECK", label) +
      '<p class="draft-mono" style="font-size:11px;color:var(--muted-foreground)" aria-live="polite">' + answered + "/" + questions.length + " answered · " + correct + " correct</p>" +
      "</div>" +
      '<div class="panel" style="padding:14px">' +
      '<div class="quiz-chips" aria-label="Quiz progress">' + chips + "</div>" +
      body +
      "</div></div>"
    );
  }

  // ── Debrief ───────────────────────────────────────────────────────────
  function renderDebrief() {
    var rows = D.DETECTION_TABLE
      .map(function (d) {
        return (
          "<tr>" +
          '<td class="src draft-mono">' + esc(d.source) + "</td>" +
          '<td class="draft-mono">' + esc(d.logic) + "</td>" +
          '<td class="note">' + esc(d.note) + "</td>" +
          "</tr>"
        );
      })
      .join("");
    var mit = [
      ["Device hardening", "M1027 · M1051 · M1054", "unique creds, updates, services off"],
      ["NAC / admission", "M1030 · M1037 (mapped, simplified)", "802.1X + posture + quarantine"],
      ["Key management", "M1041 · M1047 · M1032", "lifecycle: renew, rotate, revoke, vault"],
      ["ACLs", "M1037", "ordered least-privilege rules, implicit deny"],
      ["URL/content filtering", "M1021 · M1037", "categories + lists; name the TLS blind spot"],
      ["Zones & screened subnet", "M1030", "trust labels; public services in the buffer"],
    ]
      .map(function (m) {
        return (
          '<li class="mit-card"><p class="mit-fam">' + esc(m[0]) + '</p><p class="mit-ids draft-mono">' + esc(m[1]) + '</p><p class="mit-note">' + esc(m[2]) + "</p></li>"
        );
      })
      .join("");
    var blue = D.BLUE_TAKEAWAYS
      .map(function (t) {
        return '<li><span style="color:var(--mint)" aria-hidden="true">▪</span><span>' + esc(t) + "</span></li>";
      })
      .join("");
    var red = D.RED_TAKEAWAYS
      .map(function (t) {
        return '<li><span style="color:var(--red)" aria-hidden="true">▪</span><span>' + esc(t) + "</span></li>";
      })
      .join("");
    var links = D.MITRE_LINKS
      .map(function (l) {
        return '<a class="ext-chip draft-mono" href="' + l.url + '" target="_blank" rel="noopener noreferrer">' + l.id + " " + esc(l.label) + " " + icon("externallink", 12) + "</a>";
      })
      .join("");
    return (
      '<div class="spacer-6">' +
      "<div>" +
      U.sectionTitle("DETECTION OPPORTUNITIES", "What signal each control emits when it (or an attacker) works — the raw material of real detection.", icon("radar", 16, "text-amber")) +
      '<div class="det-table-wrap thin-scroll"><table class="det-table">' +
      "<thead><tr><th>Data source</th><th>Example detection logic (simplified)</th><th>Why it matters</th></tr></thead>" +
      '<tbody class="draft-mono">' + rows + "</tbody></table></div></div>" +
      "<div>" +
      U.sectionTitle("MITIGATION RECOMMENDATIONS", "Each family with its official ATT&CK mitigation anchor — the IDs the industry files these under.", icon("shieldcheck", 16, "text-amber")) +
      '<ul class="mit-grid">' + mit + "</ul></div>" +
      '<div class="takeaway-grid">' +
      '<div class="takeaway-blue"><p class="takeaway-head stencil">' + icon("shieldcheck", 14) + " BLUE-TEAM TAKEAWAYS</p><ul class=\"takeaway-list\">" + blue + "</ul></div>" +
      '<div class="takeaway-red"><p class="takeaway-head stencil">' + icon("swords", 14) + " RED-TEAM MINDSET (know the other side)</p><ul class=\"takeaway-list\">" + red + "</ul></div>" +
      "</div>" +
      "<div>" +
      U.sectionTitle("OFFICIAL REFERENCES", "Official sources for everything referenced in this lab (opens in a new tab).") +
      '<div class="link-row">' + links +
      '<a class="ext-chip draft-mono" href="https://www.comptia.org/en-us/certifications/network/" target="_blank" rel="noopener noreferrer">CompTIA Network+ N10-009 ' + icon("externallink", 12) + "</a></div>" +
      '<div class="mt-3"><span class="badge stencil" style="font-size:9px;color:var(--dim)">Domain 4.0 Network Security — 14% of the N10-009 exam</span></div>' +
      "</div></div>"
    );
  }

  // ── bench layout ──────────────────────────────────────────────────────
  function renderBench(state) {
    var mode = state.mode;
    var objectives = objectivesFor(mode);
    var quizQuestions = quizFor(mode);
    var quizLabel =
      mode === "medium"
        ? "6 concept questions — an explanation follows every answer."
        : "7 scenario items — justify every call by picking the defensible answer.";

    var ledgerHtml = renderLedger(state, objectives, mode);
    var catalogHtml = P.renderCatalog(state, ui, ui.catTab);

    var tabs = [
      { id: "draw", label: "Drawing Board", always: true },
      { id: "catalog", label: "Catalog", mobile: true },
      { id: "rig", label: "Traffic Bay", always: true },
      { id: "manual", label: "Field Manual", always: true },
      { id: "evidence", label: "Evidence Pack", hard: true },
      { id: "specs", label: "Specs " + objectives.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length + "/" + objectives.length, mobile: true },
      { id: "quiz", label: "Quiz", always: true },
      { id: "debrief", label: "Debrief", always: true },
    ];
    var tabsHtml = tabs
      .filter(function (t) { return t.always || (t.mobile && true) || (t.hard && mode === "hard"); })
      .map(function (t) {
        var cls = "tab draft-mono" + (t.mobile ? " mobile-only" : "");
        return (
          '<button type="button" role="tab" class="' + cls + '" aria-selected="' + (ui.tab === t.id) + '" data-act="tab" data-tab="' + t.id + '">' +
          esc(t.label) + "</button>"
        );
      })
      .join("");

    var panelBody;
    if (ui.tab === "draw") {
      panelBody =
        '<div class="mb-3"><p class="stencil" style="font-size:12px;color:var(--amber)">THE DRAWING · NORTHLAKE CC NETWORK AS-BUILT</p>' +
        '<p style="font-size:12px;color:var(--muted-foreground);margin-top:4px">Stamp each dashed (movable) device with its zone. The trust labels you choose here are inherited by every rule and decision downstream.</p></div>' +
        U.renderBlueprint(state, ui);
    } else if (ui.tab === "catalog") {
      panelBody = catalogHtml;
    } else if (ui.tab === "rig") {
      panelBody = P.renderTrafficBay(state, ui);
    } else if (ui.tab === "manual") {
      panelBody = P.renderFieldManual(state, ui);
    } else if (ui.tab === "evidence") {
      panelBody = P.renderEvidencePack(state, ui);
    } else if (ui.tab === "specs") {
      panelBody = '<div class="panel" style="padding:0">' + ledgerHtml.replace('<div class="ledger-head">', '<div class="ledger-head" style="padding:12px 12px 8px">') + "</div>";
    } else if (ui.tab === "quiz") {
      panelBody = renderQuiz(state, quizQuestions, quizLabel);
    } else {
      panelBody = renderDebrief();
    }

    var modal = "";
    if (ui.resetOpen) modal += renderResetModal();
    if (ui.signoffOpen) modal += renderSignOffModal(state, objectives, quizQuestions, mode);

    return (
      '<div class="app">' +
      U.renderHeader(state, objectives, quizQuestions) +
      '<div class="bench">' +
      '<aside class="bench-side bench-side-left desktop-only" aria-label="Spec ledger">' + ledgerHtml + "</aside>" +
      '<main class="bench-main">' +
      '<div class="tabs-list" role="tablist" aria-label="Bench sections">' + tabsHtml + "</div>" +
      '<div class="tab-content" role="tabpanel">' + panelBody + "</div>" +
      "</main>" +
      '<aside class="bench-side bench-side-right desktop-only thin-scroll" aria-label="Control catalog">' + catalogHtml + "</aside>" +
      "</div>" +
      modal +
      "</div>"
    );
  }

  // ── render loop ───────────────────────────────────────────────────────
  var root = null;
  function render() {
    var state = store.state;
    var html;
    if (!state.mode) html = U.renderModeGate();
    else if (!state.started) html = U.renderBriefing(state.mode);
    else html = renderBench(state);
    root.innerHTML = html;
  }

  function rerender() {
    render();
  }

  // ── actions ───────────────────────────────────────────────────────────
  function handleCheckObj(o) {
    var state = store.state;
    var ok = o.check(state);
    var feedback = ok
      ? { ok: true, title: "Spec stamped", body: o.feedback }
      : {
          ok: false,
          title: "Not yet",
          body:
            (o.nearMiss && o.nearMiss(state)) ||
            "Not yet — re-read the spec text and inspect the related panel. Wrong checks cost nothing but a try; hint stamps are there if you want direction.",
        };
    store.dispatch({ type: "CHECK_OBJ", id: o.id, feedback: feedback });
    if (ok) {
      showToast(
        o.id.replace("OBJ-", "OBJ ") + " — stamped ✓",
        o.feedback.slice(0, 140) + (o.feedback.length > 140 ? "…" : "")
      );
    }
  }

  function handleReset() {
    store.reset();
    ui.tab = "draw";
    ui.signoffOpen = false;
    ui.resetOpen = false;
    ui.openTrace = null;
    ui.openLog = null;
    ui.popoverDev = null;
    ui.quizIdx = 0;
    ui.quizPicked = null;
    ui.nacPicked = null;
    ui.matchPicked = null;
    ui.matchFlash = null;
    ui.matchShuffle = null;
    showToast("Sheet wiped", "The lab is back to its pristine state.");
  }

  // ── event delegation ──────────────────────────────────────────────────
  function findAction(el) {
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute("data-act")) return el;
      if (el.hasAttribute && el.hasAttribute("data-stop")) return null; // modal body: don't bubble to overlay
      el = el.parentNode;
    }
    return null;
  }

  function onClick(e) {
    var el = findAction(e.target);
    if (!el) {
      // click outside any control: close an open zone popover (Radix-like outside-close)
      if (ui.popoverDev) {
        ui.popoverDev = null;
        render();
      }
      return;
    }
    var act = el.getAttribute("data-act");
    var state = store.state;
    var mode = state.mode;

    switch (act) {
      case "set-mode":
        store.dispatch({ type: "SET_MODE", mode: el.getAttribute("data-mode") });
        break;
      case "start":
        store.dispatch({ type: "START" });
        break;
      case "tab": {
        var t = el.getAttribute("data-tab");
        // desktop guard: mobile-only tabs would leave the main pane empty on lg
        if (window.matchMedia("(min-width: 1024px)").matches && (t === "catalog" || t === "specs")) t = "draw";
        ui.tab = t;
        if (t === "manual") ui.matchShuffle = fisherYates(D.MATCH_PAIRS.map(function (p) { return p.id; }));
        render();
        break;
      }
      case "cat-tab":
        ui.catTab = el.getAttribute("data-tab");
        render();
        break;
      case "reset-open":
        ui.resetOpen = true;
        render();
        break;
      case "reset-confirm":
        handleReset();
        break;
      case "modal-close":
        if (el.getAttribute("data-modal") === "signoff") ui.signoffOpen = false;
        else ui.resetOpen = false;
        render();
        break;
      case "overlay-close":
        // direct click on the dimmed overlay (never reached from inside the modal — data-stop)
        if (el.getAttribute("data-modal") === "signoff") ui.signoffOpen = false;
        else ui.resetOpen = false;
        render();
        break;
      case "zone-menu":
        ui.popoverDev = ui.popoverDev === el.getAttribute("data-device") ? null : el.getAttribute("data-device");
        render();
        break;
      case "set-zone":
        store.dispatch({ type: "SET_ZONE", device: el.getAttribute("data-device"), zone: el.getAttribute("data-zone") });
        ui.popoverDev = null;
        render();
        break;
      case "hard-dev":
        ui.hardDev = el.getAttribute("data-dev");
        render();
        break;
      case "toggle-hard":
        store.dispatch({ type: "TOGGLE_HARD", id: el.getAttribute("data-id"), value: el.getAttribute("aria-checked") !== "true" });
        break;
      case "set-nac": {
        var patch = {};
        patch[el.getAttribute("data-field")] = el.getAttribute("aria-checked") !== "true";
        store.dispatch({ type: "SET_NAC", patch: patch });
        break;
      }
      case "fix-key":
        store.dispatch({ type: "FIX_KEY", id: el.getAttribute("data-id") });
        break;
      case "acl-add":
        store.dispatch({ type: "ACL_ADD" });
        break;
      case "acl-del":
        store.dispatch({ type: "ACL_REMOVE", id: el.getAttribute("data-id") });
        break;
      case "acl-move":
        store.dispatch({ type: "ACL_MOVE", id: el.getAttribute("data-id"), dir: Number(el.getAttribute("data-dir")) });
        break;
      case "acl-log":
        store.dispatch({ type: "ACL_UPDATE", id: el.getAttribute("data-id"), patch: { log: el.getAttribute("aria-checked") !== "true" } });
        break;
      case "acl-brief":
        ui.aclBrief = !ui.aclBrief;
        render();
        break;
      case "set-filter": {
        var fp = {};
        fp[el.getAttribute("data-field")] = el.getAttribute("aria-checked") !== "true";
        store.dispatch({ type: "SET_FILTER", patch: fp });
        break;
      }
      case "toggle-cat":
        store.dispatch({ type: "TOGGLE_CAT", network: el.getAttribute("data-net"), cat: el.getAttribute("data-cat"), value: el.getAttribute("aria-checked") !== "true" });
        break;
      case "toggle-site":
        store.dispatch({ type: "TOGGLE_SITE", list: el.getAttribute("data-list"), site: el.getAttribute("data-site"), value: el.getAttribute("aria-checked") !== "true" });
        break;
      case "run-audit":
        store.dispatch({ type: "RUN_AUDIT" });
        break;
      case "run-sample":
        ui.openTrace = el.getAttribute("data-sample");
        store.dispatch({ type: "RUN_SAMPLE", sample: el.getAttribute("data-sample") });
        break;
      case "trace": {
        var sid = el.getAttribute("data-sample");
        ui.openTrace = ui.openTrace === sid ? null : sid;
        render();
        break;
      }
      case "predict":
        store.dispatch({ type: "PREDICT", sample: el.getAttribute("data-sample"), value: el.getAttribute("data-value") });
        break;
      case "nac-pick":
        ui.nacPicked = Number(el.getAttribute("data-i"));
        ui.nacNudge = false;
        render();
        break;
      case "nac-check":
        if (ui.nacPicked === null) {
          ui.nacNudge = true;
          render();
        } else {
          store.dispatch({ type: "RECORD_NACQUIZ", answer: String(ui.nacPicked) });
        }
        break;
      case "acc":
        ui.accOpen = ui.accOpen === el.getAttribute("data-id") ? null : el.getAttribute("data-id");
        render();
        break;
      case "match-pick":
        ui.matchPicked = ui.matchPicked === el.getAttribute("data-id") ? null : el.getAttribute("data-id");
        render();
        break;
      case "match-purpose": {
        var purposeId = el.getAttribute("data-id");
        if (!ui.matchPicked) break;
        if (ui.matchPicked === purposeId) {
          store.dispatch({ type: "RECORD_MATCH", control: ui.matchPicked, purpose: purposeId });
          ui.matchFlash = null;
        } else {
          ui.matchFlash = purposeId;
          if (flashTimer) clearTimeout(flashTimer);
          flashTimer = setTimeout(function () {
            if (ui.matchFlash === purposeId) {
              ui.matchFlash = null;
              render();
            }
          }, 900);
        }
        ui.matchPicked = null;
        render();
        break;
      }
      case "tag":
        store.dispatch({ type: "RECORD_TAG", snippet: el.getAttribute("data-snippet"), family: el.getAttribute("data-family") });
        break;
      case "memo":
        store.dispatch({ type: "RECORD_MEMO", item: el.getAttribute("data-item"), call: el.getAttribute("data-call") });
        break;
      case "log-toggle": {
        var eid = el.getAttribute("data-entry");
        ui.openLog = ui.openLog === eid ? null : eid;
        render();
        break;
      }
      case "log-tag": {
        var entry = el.getAttribute("data-entry");
        var family = el.getAttribute("data-family");
        store.dispatch({ type: "RECORD_LOGHUNT", entry: entry, family: state.records.loghunt[entry] === family ? "" : family });
        break;
      }
      case "rollout-append":
        store.dispatch({ type: "RECORD_ROLLOUT", order: state.records.rollout.concat([el.getAttribute("data-id")]) });
        break;
      case "rollout-move": {
        var idx = Number(el.getAttribute("data-idx"));
        var dir = Number(el.getAttribute("data-dir"));
        var to = idx + dir;
        var order = state.records.rollout.slice();
        if (to < 0 || to >= order.length) break;
        var moved = order.splice(idx, 1)[0];
        order.splice(to, 0, moved);
        store.dispatch({ type: "RECORD_ROLLOUT", order: order });
        break;
      }
      case "rollout-clear":
        store.dispatch({ type: "RECORD_ROLLOUT", order: [] });
        break;
      case "det-toggle": {
        var rid = el.getAttribute("data-id");
        var enabled = state.records.detection;
        store.dispatch({ type: "RECORD_DETECTION", enabled: enabled.includes(rid) ? enabled.filter(function (x) { return x !== rid; }) : enabled.concat([rid]) });
        break;
      }
      case "residual-stmt": {
        var st = el.getAttribute("data-id");
        store.dispatch({
          type: "RECORD_RESIDUAL",
          statement: state.records.residualStatement === st ? null : st,
          family: state.records.residualFamily,
        });
        break;
      }
      case "residual-fam": {
        var fm = el.getAttribute("data-id");
        store.dispatch({
          type: "RECORD_RESIDUAL",
          statement: state.records.residualStatement,
          family: state.records.residualFamily === fm ? null : fm,
        });
        break;
      }
      case "check-obj": {
        var objectives = objectivesFor(mode);
        var o = objectives.find(function (x) { return x.id === el.getAttribute("data-id"); });
        if (o) handleCheckObj(o);
        break;
      }
      case "hint":
        store.dispatch({ type: "USE_HINT", id: el.getAttribute("data-id") });
        break;
      case "signoff":
        ui.signoffOpen = true;
        render();
        break;
      case "quiz-pick":
        ui.quizPicked = Number(el.getAttribute("data-i"));
        ui.quizNudge = false;
        render();
        break;
      case "quiz-check":
        if (ui.quizPicked === null) {
          ui.quizNudge = true;
          render();
        } else {
          var quizQuestions = quizFor(mode);
          var firstOpen = questions.firstOpenFor(state, quizQuestions);
          var clamped = Math.min(ui.quizIdx, firstOpen);
          store.dispatch({ type: "QUIZ_ANSWER", qid: quizQuestions[clamped].id, index: ui.quizPicked });
        }
        break;
      case "quiz-next": {
        var qq = quizFor(mode);
        var fo = questions.firstOpenFor(state, qq);
        var cl = Math.min(ui.quizIdx, fo);
        if (cl + 1 < qq.length) {
          ui.quizIdx = cl + 1;
          ui.quizPicked = null;
          ui.quizNudge = false;
        }
        render();
        break;
      }
      case "toast-close":
        clearToast();
        break;
    }
  }

  function onChange(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var act = el.getAttribute("data-act");
    if (act === "set-nac-select") {
      var patch = {};
      patch[el.getAttribute("data-field")] = el.value;
      store.dispatch({ type: "SET_NAC", patch: patch });
    } else if (act === "acl-set") {
      var patch2 = {};
      patch2[el.getAttribute("data-field")] = el.value;
      store.dispatch({ type: "ACL_UPDATE", id: el.getAttribute("data-id"), patch: patch2 });
    }
  }

  function onKeyDown(e) {
    var el = e.target;
    // mode cards: Enter / Space activate (original had the same handler)
    if (el && el.getAttribute && el.getAttribute("data-act") === "set-mode" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      store.dispatch({ type: "SET_MODE", mode: el.getAttribute("data-mode") });
      return;
    }
    if (e.key === "Escape") {
      if (ui.resetOpen || ui.signoffOpen) {
        ui.resetOpen = false;
        ui.signoffOpen = false;
        render();
      } else if (ui.popoverDev) {
        ui.popoverDev = null;
        render();
      }
    }
  }

  // helper: first unanswered quiz question
  var questions = {
    firstOpenFor: function (state, quizQuestions) {
      for (var i = 0; i < quizQuestions.length; i++) {
        if (state.quiz[quizQuestions[i].id] === undefined) return i;
      }
      return quizQuestions.length - 1;
    },
  };

  function fisherYates(arr) {
    var ids = arr.slice();
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
    }
    return ids;
  }

  // ── boot ──────────────────────────────────────────────────────────────
  function boot() {
    root = document.getElementById("app");
    toastEl = document.getElementById("toast-region");
    store.subscribe(rerender);
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("keydown", onKeyDown);
    // desktop guard: mobile-only tabs (Catalog/Specs) would leave the main pane empty on lg
    var mql = window.matchMedia("(min-width: 1024px)");
    var onMq = function () {
      if (mql.matches && (ui.tab === "catalog" || ui.tab === "specs")) {
        ui.tab = "draw";
        render();
      }
    };
    if (mql.addEventListener) mql.addEventListener("change", onMq);
    else mql.addListener(onMq);
    store.hydrate(); // resume exactly where this browser left off
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
