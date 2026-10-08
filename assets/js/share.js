/* ============================================================================
   CyberPulseAcademy - assets/js/share.js
   Dynamic share text with the Web Share API and three fallbacks. A specific
   share outperforms a generic one by a wide margin, so the text names the
   topic, the question count and the score the student actually achieved.

     "I scored 92% on the T1059 Command and Scripting Interpreter exam,
      20 questions, extreme difficulty."

   Privacy note: nothing is shared automatically. The student presses the
   button, every time, and they see the exact text first.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }
  function esc(v) { return CM.util.esc(v); }

  var context = { topicId: '', title: '', difficulty: 'extreme', questionCount: 20, percent: null };

  /* Question count comes from the attempt that was actually recorded. When it
     is genuinely unknown the wording simply omits it: the old code printed a
     hard-coded "20 questions", which was wrong for any exercise that did not
     happen to have twenty. */
  function describe() {
    var hasScore = typeof context.percent === 'number';
    var hasCount = typeof context.questionCount === 'number' && context.questionCount > 0;
    var key = hasScore
      ? (hasCount ? 'share.template' : 'share.templateNoCount')
      : 'share.templateNoScore';
    return t(key, {
      pct: hasScore ? CM.util.pct(context.percent) : '',
      title: context.title,
      count: hasCount ? context.questionCount : '',
      exercises: context.exerciseCount || 0,
      difficulty: context.difficulty.replace('-', ' ')
    });
  }

  function topicUrl() {
    return CM.util.url('topics/' + context.topicId + '.html');
  }

  function shareLinks(text) {
    var url = topicUrl();
    return {
      x: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
      reddit: 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(text)
    };
  }

  /* ---------------------------------------------------------- the button */
  function render(mount, options) {
    var opts = options || {};
    var host = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!host) { return; }

    var text = describe();
    var native = typeof navigator.share === 'function';

    /* The message is a real text field rather than a paragraph, so a visitor can
       rewrite it before sharing. Every link is rebuilt from whatever is in the
       field at the moment it is clicked, which is what makes the edit stick. */
    host.innerHTML =
      '<label class="cm-share__label" for="cm-share-text">' + esc(t('share.editLabel')) + '</label>' +
      '<textarea class="cm-share__text" id="cm-share-text" rows="3" spellcheck="false">' + esc(text) + '</textarea>' +
      '<div class="cm-share">' +
        (native
          ? '<button type="button" class="cm-btn cm-btn--primary cm-btn--sm" id="cm-share-native">' +
              CM.nav.svg('external') + esc(t('action.share')) + '</button>'
          : '') +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-x" href="#" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.x')) + '</a>' +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-linkedin" href="#" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.linkedin')) + '</a>' +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-reddit" href="#" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.reddit')) + '</a>' +
        '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-discord">' +
          esc(t('share.openDiscord')) + '</button>' +
        '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-copy">' +
          esc(t('action.copyLink')) + '</button>' +
      '</div>' +
      '<p class="cm-small cm-dim cm-mt1">' + esc(t('share.discordHint')) + '</p>' +
      (native ? '' : '<p class="cm-small cm-dim">' + esc(t('share.unsupported')) + '</p>');

    var field = host.querySelector('#cm-share-text');

    function currentText() {
      return (field && field.value) ? field.value : text;
    }

    function refreshLinks() {
      var links = shareLinks(currentText());
      var pairs = [['#cm-share-x', links.x],
                   ['#cm-share-linkedin', links.linkedin],
                   ['#cm-share-reddit', links.reddit]];
      for (var i = 0; i < pairs.length; i++) {
        var node = host.querySelector(pairs[i][0]);
        if (node) { node.setAttribute('href', pairs[i][1]); }
      }
    }
    if (field) { field.addEventListener('input', refreshLinks); }
    refreshLinks();

    var nativeBtn = host.querySelector('#cm-share-native');
    if (nativeBtn) {
      nativeBtn.addEventListener('click', function () {
        navigator.share({
          title: context.title + ' on CyberPulseAcademy',
          text: currentText(),
          url: topicUrl()
        })['catch'](function () {
          /* The user cancelled, or the platform refused. Neither is an error
             worth shouting about. */
        });
      });
    }

    /* Discord has no public share endpoint for arbitrary text, so the honest
       behaviour is to put the message on the clipboard and open Discord for the
       visitor to paste it. Pretending otherwise would ship a broken button. */
    var discordBtn = host.querySelector('#cm-share-discord');
    if (discordBtn) {
      discordBtn.addEventListener('click', function () {
        var payload = currentText() + '\n' + topicUrl();
        function open() {
          CM.a11y.toast(t('share.copiedForDiscord'), 'ok');
          CM.a11y.announce(t('share.copiedForDiscord'), false);
          window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(payload).then(open)['catch'](function () { legacyCopy(payload, open); });
        } else {
          legacyCopy(payload, open);
        }
      });
    }

    host.querySelector('#cm-share-copy').addEventListener('click', function () {
      var payload = currentText() + ' ' + topicUrl();
      function done() {
        CM.a11y.toast(t('share.copied'), 'ok');
        CM.a11y.announce(t('share.copied'), false);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(done)['catch'](function () { legacyCopy(payload, done); });
      } else {
        legacyCopy(payload, done);
      }
    });
  }

  /* document.execCommand is deprecated but remains the only option in some
     embedded and older mobile browsers. */
  function legacyCopy(text, done) {
    try {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      done();
    } catch (e) {
      CM.a11y.toast('Copying failed. Select the text above and copy it manually.', 'warn');
    }
  }

  /* Configure from the current topic once the catalog is available. */
  function init(topicId) {
    return CM.Store.getTopic(topicId).then(function (topic) {
      if (!topic) { return; }
      context.topicId = topic.id;
      context.title = topic.title;
      context.difficulty = topic.difficulty || 'extreme';
      context.questionCount = null;
      context.exerciseCount = Array.isArray(topic.exercises) ? topic.exercises.length : 0;
      var best = CM.Store.getBestFor(topic.id);
      if (best && typeof best.percent === 'number') { context.percent = best.percent; }
      /* Describe the exercise that was actually attempted. Using the topic's own
         difficulty printed "very hard difficulty" after an easy paper, because
         the topic is rated very hard overall while its easy exercise is not. */
      if (best) {
        if (typeof best.total === 'number' && best.total > 0) {
          context.questionCount = best.total;
        }
        var attempted = null;
        if (best.batch && Array.isArray(topic.exercises)) {
          attempted = topic.exercises[best.batch - 1];
        }
        if (attempted && attempted.difficulty) { context.difficulty = attempted.difficulty; }
      }
      var mount = document.getElementById('cm-share');
      if (mount) { render(mount); }
      return context;
    });
  }

  CM.share = {
    init: init,
    render: render,
    describe: describe,
    setScore: function (percent) { context.percent = percent; var mount = document.getElementById('cm-share'); if (mount) { render(mount); } },
    open: function () {
      var mount = document.getElementById('cm-share');
      if (mount) {
        mount.scrollIntoView({ block: 'center', behavior: CM.a11y.reduceMotion ? 'auto' : 'smooth' });
        mount.querySelector('button, a').focus();
      }
    }
  };

  /* Refresh the share text the moment a new score is recorded. */
  document.addEventListener('cm:score-recorded', function (event) {
    if (event.detail && typeof event.detail.percent === 'number') {
      CM.share.setScore(event.detail.percent);
    }
  });

  document.addEventListener('cm-score-updated', function () {
    if (!context.topicId) { return; }
    var best = CM.Store.getBestFor(context.topicId);
    if (best && typeof best.percent === 'number' && best.percent !== context.percent) {
      CM.share.setScore(best.percent);
    }
  });
})();
