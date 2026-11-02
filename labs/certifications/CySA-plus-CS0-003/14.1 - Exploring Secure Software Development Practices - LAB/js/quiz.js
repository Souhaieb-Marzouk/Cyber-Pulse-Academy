// ─── RELEASE TRACK · knowledge check (quiz) engine (static port of quiz.tsx) ──
// Contract (audit R2/R3/D10): one question at a time; the chosen answer locks
// the moment it is submitted; the student MUST move forward via NEXT; only the
// submitted answer is highlighted (green = correct pick, red = wrong pick) and
// the correct answer is NEVER revealed after a wrong submission.
(function () {
  'use strict';

  const LAB = (window.LAB = window.LAB || {});

  LAB.QuizEngine = {
    _cursor: 0,
    _container: null,
    _questions: null,
    _progress: null,
    _hardMode: false,
    _onAnswer: null,

    /** Mount (or resume) the quiz. Cursor = first unanswered question. */
    mount: function (container, questions, progress, hardMode, onAnswer) {
      this._container = container;
      this._questions = questions;
      this._hardMode = hardMode;
      this._onAnswer = onAnswer;
      this._progress = progress;
      let first = -1;
      for (let i = 0; i < questions.length; i++) {
        if (!progress.quiz[questions[i].id]) {
          first = i;
          break;
        }
      }
      // original semantics: resume at the first unanswered question; when every
      // question is answered the review starts back at question 1.
      this._cursor = first === -1 ? 0 : first;
      this._render();
    },

    /** Re-render after an external state change (answer submitted). */
    refresh: function (progress) {
      this._progress = progress;
      this._render();
    },

    _goto: function (i) {
      const n = this._questions.length;
      this._cursor = Math.max(0, Math.min(n - 1, i));
      this._render();
    },

    _render: function () {
      const self = this;
      const questions = this._questions;
      const progress = this._progress;
      const hardMode = this._hardMode;
      const container = this._container;
      const idx = Math.min(this._cursor, questions.length - 1);
      const q = questions[idx];

      const answered = Object.keys(progress.quiz).length;
      const correct = questions.filter(function (x) {
        return progress.quiz[x.id] === x.correct;
      }).length;
      const allDone = answered === questions.length;
      const chosen = progress.quiz[q.id];
      const isAnswered = !!chosen;
      const isRight = chosen === q.correct;
      const isLast = idx === questions.length - 1;

      container.replaceChildren();
      container.className = 'space-list-lg';

      // score bar
      const bar = LAB.el('div', { class: 'quiz-bar' });
      bar.appendChild(
        LAB.el('p', { class: 'mono', text: 'QUESTION ' + (idx + 1) + ' OF ' + questions.length + ' — ' + answered + ' answered' })
      );
      const scoreP = LAB.el('p', {
        class: 'mono quiz-score' + (hardMode ? ' hard' : ''),
        text: 'score ' + correct + '/' + questions.length,
        attrs: { 'data-testid': 'quiz-score' },
      });
      bar.appendChild(scoreP);
      container.appendChild(bar);

      // review chips: answered questions can be revisited read-only (locked);
      // future questions stay locked until reached — progression is enforced.
      const nav = LAB.el('div', { class: 'quiz-nav', attrs: { role: 'tablist', 'aria-label': 'Question navigator' } });
      questions.forEach(function (x, i) {
        const done = !!progress.quiz[x.id];
        const current = i === idx;
        const chip = LAB.el('button', {
          class: 'quiz-chip mono' + (current ? ' current' : done ? ' done' : ' locked'),
          attrs: {
            type: 'button',
            role: 'tab',
            'aria-selected': current ? 'true' : 'false',
            'aria-label': 'Question ' + (i + 1) + (done ? ' (answered)' : i > idx ? ' (locked)' : ''),
            disabled: !done && i > idx ? '' : null,
          },
          events: { click: function () { self._goto(i); } },
        });
        if (done) {
          chip.appendChild(LAB.icon(progress.quiz[x.id] === x.correct ? 'check-circle' : 'x-circle'));
        } else {
          chip.appendChild(LAB.icon('lock'));
        }
        chip.appendChild(document.createTextNode(String(i + 1)));
        nav.appendChild(chip);
      });
      container.appendChild(nav);

      // question card
      const card = LAB.el('section', {
        class: 'quiz-card',
        attrs: { 'aria-label': 'Question ' + (idx + 1), 'data-quiz': q.id },
      });
      const qhead = LAB.el('header', { class: 'quiz-qhead' }, [
        LAB.el('span', { class: 'quiz-qnum mono', text: String(idx + 1) }),
      ]);
      const qTitle = LAB.el('h3', { class: 'quiz-q' });
      qTitle.appendChild(LAB.icon('help-circle'));
      qTitle.appendChild(document.createTextNode(q.q));
      qhead.appendChild(qTitle);
      card.appendChild(qhead);
      if (q.scenario) {
        card.appendChild(LAB.el('p', { class: 'quiz-scenario', text: q.scenario }));
      }

      const opts = LAB.el('div', { class: 'quiz-opts', attrs: { role: 'radiogroup', 'aria-label': 'Answers for question ' + (idx + 1) } });
      q.options.forEach(function (o) {
        const picked = chosen === o.id;
        let cls = 'quiz-opt';
        if (picked && isRight) cls += ' picked-right';
        else if (picked) cls += ' picked-wrong';
        else if (isAnswered) cls += ' dimmed';
        else cls += ' idle';
        const btn = LAB.el('button', {
          class: cls,
          attrs: { type: 'button', role: 'radio', 'aria-checked': picked ? 'true' : 'false', disabled: isAnswered ? '' : null },
          events: {
            click: function () {
              self._onAnswer(q.id, o.id);
            },
          },
        });
        if (picked && isRight) btn.appendChild(LAB.icon('check-circle'));
        if (picked && !isRight) btn.appendChild(LAB.icon('x-circle'));
        btn.appendChild(LAB.el('span', { class: 'opt-id mono', text: o.id.toUpperCase() }));
        btn.appendChild(document.createTextNode(' — ' + o.label));
        opts.appendChild(btn);
      });
      card.appendChild(opts);

      if (isAnswered) {
        const explain = LAB.el('div', { class: 'quiz-explain ' + (isRight ? 'right' : 'wrong'), attrs: { role: 'status' } });
        explain.appendChild(
          LAB.el('p', { class: 'explain-title mono', text: isRight ? 'Correct' : 'Incorrect — here is why' })
        );
        explain.appendChild(LAB.el('p', { class: 'explain-text', text: q.explanation }));
        card.appendChild(explain);
      }
      container.appendChild(card);

      // footer
      const foot = LAB.el('div', { class: 'quiz-foot' });
      if (allDone) {
        foot.appendChild(
          LAB.el('p', {
            class: 'quiz-note done mono',
            text:
              'KNOWLEDGE CHECK COMPLETE — score ' + correct + '/' + questions.length + '. Return to the control room if any objective is still open, then press FINISH.',
            attrs: { role: 'status' },
          })
        );
      } else {
        foot.appendChild(
          LAB.el('p', {
            class: 'quiz-note mono',
            text: isAnswered ? 'Answer locked. Continue to the next question.' : 'Select an answer and it will lock on submit.',
          })
        );
      }
      if (!isLast) {
        foot.appendChild(
          LAB.el('button', {
            class: 'btn btn-emerald-solid',
            text: 'NEXT QUESTION',
            attrs: {
              type: 'button',
              disabled: !isAnswered ? '' : null,
              'aria-label': 'Next question (' + (idx + 2) + ' of ' + questions.length + ')',
            },
            events: { click: function () { self._goto(idx + 1); } },
          })
        );
      }
      container.appendChild(foot);
    },
  };
})();
