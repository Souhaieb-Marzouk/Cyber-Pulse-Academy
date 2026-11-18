// ── Knowledge check quiz (C5) + End-of-shift report modal (C7) ─────────────
// Vanilla ports of the Quiz component in DebriefZone.tsx and EndOfShift.tsx.
// Mechanics preserved exactly: one item at a time, pick → CHECK ANSWER locks,
// explanation follows, forward-only progression, only the selected option is
// highlighted (green iff correct / red iff wrong) with a ✓/✗ icon.
"use strict";

var Quiz = (function () {
  const { esc, icon } = UI;
  const S = () => LabStore.state;

  const quizBank = () => (S().mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD);

  function render() {
    const st = S();
    const quiz = quizBank();
    const q = quiz[Math.min(st.quizCurrent, quiz.length - 1)];
    const isChecked = !!st.quizChecked[q.id];
    const myPick = st.quizPicked[q.id];
    const score = quiz.filter((x) => st.quizAnswers[x.id] === x.answer).length;
    const answeredCount = quiz.filter((x) => st.quizChecked[x.id]).length;

    const intro = S().mode === "medium"
      ? "One item at a time: pick an answer, press CHECK ANSWER to lock it and get the explanation, then move on. Answers cannot be changed after checking."
      : "Scenario items, one at a time. Pick, CHECK ANSWER (locks the answer), read the explanation, then next. Explanations follow each check.";

    let body;
    if (st.quizSubmitted) {
      body = `<p class="quiz-filed">Knowledge check filed — ${score}/${quiz.length}. Scroll on for the field notes.</p>`;
    } else {
      const optionsHtml = q.options.map((opt, oi) => {
        const isPicked = myPick === oi;
        let cls = "quiz-opt";
        if (isChecked && isPicked) {
          // only the SELECTED answer is highlighted — green if correct, red if wrong
          cls += oi === q.answer ? " quiz-opt-correct" : " quiz-opt-wrong";
        } else if (isChecked) {
          cls += " quiz-opt-dim";
        }
        const mark = isChecked && isPicked
          ? (oi === q.answer
            ? icon("CheckCircle2", "icon-14 quiz-mark-ok", false, "correct")
            : icon("XCircle", "icon-14 quiz-mark-bad", false, "incorrect"))
          : "";
        return `
          <button type="button" ${isChecked ? "disabled" : ""} data-action="quiz-pick" data-qid="${q.id}" data-idx="${oi}"
            aria-pressed="${isPicked}" data-fid="quiz-opt-${q.id}-${oi}" class="${cls}">
            <span class="quiz-letter">${String.fromCharCode(65 + oi)}</span>
            <span class="quiz-opt-text">${esc(opt)}</span>${mark}
          </button>`;
      }).join("");

      const explain = isChecked
        ? `<div role="status" aria-live="polite" class="quiz-explain ${myPick === q.answer ? "quiz-explain-ok" : "quiz-explain-warn"}">
            <span class="quiz-explain-label">${myPick === q.answer
              ? "Correct — why it matters"
              : "Why your answer differs — the correct choice is " + String.fromCharCode(65 + q.answer)}</span>
            ${esc(q.explain)}
          </div>`
        : "";

      const action = !isChecked
        ? `<button type="button" data-action="quiz-check" data-qid="${q.id}" ${myPick === undefined ? "disabled" : ""}
            class="btn btn-primary btn-quiz ${myPick === undefined ? "btn-disabled" : ""}">
            ${myPick === undefined ? "Pick an answer to check" : "Check answer"}
          </button>`
        : `<button type="button" data-action="quiz-next" data-total="${quiz.length}"
            class="btn btn-primary btn-quiz">
            ${st.quizCurrent + 1 < quiz.length ? `Next question ${icon("ArrowRight", "icon-16")}` : `File knowledge check ${icon("ArrowRight", "icon-16")}`}
          </button>`;

      body = `
        <div class="quiz-card" aria-live="polite">
          <p class="quiz-q"><span class="quiz-num">${st.quizCurrent + 1}.</span>${esc(q.q)}</p>
          <div class="quiz-opts">${optionsHtml}</div>
          ${explain}
          <div class="quiz-action-row">${action}</div>
          ${!isChecked && answeredCount > 0
            ? `<p class="quiz-progress">${answeredCount}/${quiz.length} items checked — earlier answers are locked</p>`
            : ""}
        </div>`;
    }

    return `
    <section aria-label="Knowledge check" class="panel">
      <div class="quiz-head">
        <h3 class="panel-title">${icon("ClipboardCheck", "icon-16 icon-amber")} Knowledge check — ${quiz.length} items</h3>
        <span class="quiz-counter">${st.quizSubmitted ? `scored ${score}/${quiz.length}` : `item ${Math.min(st.quizCurrent + 1, quiz.length)} / ${quiz.length}`}</span>
      </div>
      <p class="quiz-intro">${intro}</p>
      ${body}
    </section>`;
  }

  // ── End-of-shift report modal (C7) ─────────────────────────────────────────
  const PILLAR_ORDER = ["P1", "P2", "P3", "P4"];
  const NEXT_STEPS = [
    { icon: "BookOpen", text: "Next lesson in Domain 1: IPv6 addressing — same anatomy, 128 bits." },
    { icon: "Route", text: "Drill subnetting speed: network/broadcast/usable for any /20–/30 in under 30 seconds." },
    { icon: "Wrench", text: "Then N10-009 Domain 5 (Troubleshooting) — this lesson's diagnose skills are its foundation." },
  ];

  function endOfShiftHTML() {
    const st = S();
    const list = LabStore.objectivesForMode(st.mode);
    const doneList = list.filter((o) => (st.objectives[o.id] || {}).done);
    const stars = LabStore.starsOf(st.objectives, st.mode);
    const quiz = st.mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
    const quizScore = quiz.filter((q) => st.quizAnswers[q.id] === q.answer).length;

    const fullStar = Math.floor(stars);
    const halfStar = stars - fullStar >= 0.5;

    // focus areas derived from the student's ACTUAL evidence
    const struggled = list
      .map((o) => ({ def: o, prog: st.objectives[o.id] }))
      .filter(({ prog }) => prog && (prog.fails > 0 || prog.hintsUsed > 0) && prog.done);
    const quizMissed = quiz.filter((q) => st.quizAnswers[q.id] !== undefined && st.quizAnswers[q.id] !== q.answer);
    const focusItems = [
      ...quizMissed.map((q) => ({
        title: q.topic,
        detail: `Knowledge check item missed — re-read “${q.wall}” on the Training Wall, then retake the debrief quiz.`,
      })),
      ...struggled.map(({ def, prog }) => ({
        title: def.anchor,
        detail: `“${def.title}” took ${prog.fails} extra check${prog.fails === 1 ? "" : "s"}${prog.hintsUsed > 0 ? ` and ${prog.hintsUsed} hint${prog.hintsUsed === 1 ? "" : "s"}` : ""} — revisit it in ${ZONES_LABELS[def.zone] || def.zone} and re-derive it once more without help.`,
      })),
    ];

    const starIcons = [0, 1, 2, 3, 4].map((i) => {
      let cls = "star-empty";
      if (i < fullStar) cls = "star-full";
      else if (i === fullStar && halfStar) cls = "star-half";
      return icon("Star", `icon-16 ${cls}`);
    }).join("");

    const focusBlock = focusItems.length === 0
      ? `<div class="focus-clean">Clean sweep — no misses, no hints, no rejected checks in this shift. Next stretch: do the other shift mode, then drill subnetting speed (any /20–/30 in under 30 seconds).</div>`
      : `<ul class="focus-list">${focusItems.map((f) => `
          <li class="focus-item">
            <p class="focus-title">${esc(f.title)}</p>
            <p class="focus-detail">${esc(f.detail)}</p>
          </li>`).join("")}</ul>`;

    const pillarRecap = PILLAR_ORDER.map((p) => {
      const items = list.filter((o) => o.pillar === p);
      const doneItems = items.filter((o) => (st.objectives[o.id] || {}).done);
      return `
        <div class="pillar-recap">
          <div class="pillar-recap-head">
            <span class="pillar-badge ${UI.PILLAR_META[p].cls}">${UI.PILLAR_META[p].label}</span>
            <span class="pillar-recap-count">${doneItems.length}/${items.length}</span>
          </div>
          <ul class="pillar-recap-list">
            ${items.map((o) => `
              <li class="${(st.objectives[o.id] || {}).done ? "recap-done" : "recap-todo"}">${(st.objectives[o.id] || {}).done ? "✓" : "·"} ${esc(o.title)}</li>`).join("")}
          </ul>
        </div>`;
    }).join("");

    return `
      <div class="eos-motion">
        <div class="eos-head">
          <h2 id="eos-title" class="eos-title">${icon("Trophy", "icon-20")} End-of-shift report</h2>
          <p class="eos-sub">${st.mode === "medium" ? "Day shift" : "Night shift"} complete at The Octet Works — every work order stamped.</p>
        </div>

        <div class="eos-score">
          <div>
            <p class="eos-score-label">Work orders</p>
            <p class="eos-score-value">${doneList.length}/${list.length}</p>
          </div>
          <div class="eos-score-center">
            <p class="eos-score-label">Knowledge check</p>
            <p class="eos-score-value">${st.quizSubmitted ? `${quizScore}/${quiz.length}` : "—"}</p>
          </div>
          <div>
            <p class="eos-score-label">Stars</p>
            <p class="eos-stars" aria-label="${stars} out of 5 stars">${starIcons}</p>
            <p class="eos-stars-num">${stars.toFixed(2)} / 5.00</p>
          </div>
        </div>

        <p class="eos-section-label">Focus areas for your next shift</p>
        ${focusBlock}

        <p class="eos-section-label">Mastery recap by pillar</p>
        <div class="eos-pillars">${pillarRecap}</div>

        <p class="eos-section-label">Your next shifts</p>
        <ul class="eos-next">
          ${NEXT_STEPS.map((n) => `<li>${icon(n.icon, "icon-14 icon-amber")} <span>${esc(n.text)}</span></li>`).join("")}
        </ul>

        <div class="eos-refs">
          <p class="eos-section-label">Official references</p>
          <ul class="eos-ref-list">
            ${REF_LINKS.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer" class="ref-link inline">${esc(l.label)} ${icon("ArrowUpRight", "icon-12")}</a></li>`).join("")}
          </ul>
        </div>

        <button type="button" data-action="close-report" data-autofocus class="btn btn-primary btn-eos">Clock out</button>
      </div>`;
  }

  // zone labels for focus-area copy (from PlantChrome ZONES)
  const ZONES_LABELS = {
    dock: "Receiving Dock",
    floor: "Machining Floor",
    loadout: "Dispatch / Loadout",
    bench: "Test Bench",
    wall: "Training Wall",
    debrief: "Shift Debrief",
  };

  return { render, endOfShiftHTML, ZONES_LABELS };
})();
