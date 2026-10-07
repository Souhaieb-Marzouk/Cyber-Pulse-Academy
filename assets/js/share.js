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

  /* Question count is not in the manifest, so read it from the batch meta if
     the hub managed to read it, and fall back to a neutral phrasing. */
  function describe() {
    var hasScore = typeof context.percent === 'number';
    var key = hasScore ? 'share.template' : 'share.templateNoScore';
    return t(key, {
      pct: hasScore ? CM.util.pct(context.percent) : '',
      title: context.title,
      count: context.questionCount,
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
    var links = shareLinks(text);
    var native = typeof navigator.share === 'function';

    host.innerHTML =
      '<p class="cm-share__preview" id="cm-share-text">' + esc(text) + '</p>' +
      '<div class="cm-share">' +
        (native
          ? '<button type="button" class="cm-btn cm-btn--primary cm-btn--sm" id="cm-share-native">' +
              CM.nav.svg('external') + esc(t('action.share')) + '</button>'
          : '') +
        '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-share-copy">' +
          esc(t('action.copyLink')) + '</button>' +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + links.x + '" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.x')) + '</a>' +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + links.linkedin + '" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.linkedin')) + '</a>' +
        '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + links.reddit + '" target="_blank" rel="noopener noreferrer">' +
          esc(t('share.reddit')) + '</a>' +
      '</div>' +
      (native ? '' : '<p class="cm-small cm-dim cm-mt1">' + esc(t('share.unsupported')) + '</p>');

    var nativeBtn = host.querySelector('#cm-share-native');
    if (nativeBtn) {
      nativeBtn.addEventListener('click', function () {
        navigator.share({
          title: context.title + ' on CyberPulseAcademy',
          text: text,
          url: topicUrl()
        })['catch'](function () {
          /* The user cancelled, or the platform refused. Neither is an error
             worth shouting about. */
        });
      });
    }

    host.querySelector('#cm-share-copy').addEventListener('click', function () {
      var payload = text + ' ' + topicUrl();
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
      var best = CM.Store.getBestFor(topic.id);
      if (best && typeof best.percent === 'number') { context.percent = best.percent; }
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
