/* ============================================================================
   CyberPulseAcademy - assets/js/exam-hub.js
   The exercise hub. Loads an exercise page inside a same-origin iframe,
   hands it the student's identity, listens for a score, and never shows a
   silent blank frame.

   The contract an exercise page may implement:

     parent -> batch   { type: "CYBERPULSE_INIT", username, country, batch,
                         topicId, locale, theme }
     batch  -> parent   { type: "CYBERPULSE_SCORE", topicId, batch, score,
                         passed, total, percent }

   Batch files are generated separately and may predate this contract, so the
   hub ALSO injects a small bridge script into the iframe on load. The iframe
   is same-origin, so iframe.contentDocument is legitimately reachable. The
   bridge is purely additive: it observes for a results screen, watches
   localStorage writes, and stays silent if it finds nothing.

   Failure handling is the point of this file:
     * a missing batch file is detected by preflight, not by hoping onerror
       fires (it does not fire for a 404);
     * a slow load trips a 5 second timeout;
     * both cases produce a friendly card with Retry and a prefilled GitHub
       issue, never an empty frame.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }
  function esc(v) { return CM.util.esc(v); }

  var INJECTED_FLAG = '__cmBridgeInstalled';
  var active = { iframe: null, topicId: '', batch: 0, timer: null, scoredFor: '' };

  /* ------------------------------------------------------------ reporting */
  function reportUrl(topicId, batch) {
    var base = String(CM.config.repoUrl || '').replace(/\/+$/, '');
    return base + '/issues/new' +
           '?title=' + encodeURIComponent('Broken batch: ' + topicId + ' batch ' + batch) +
           '&labels=bug';
  }

  function accuracyUrl(topicId, title) {
    var base = String(CM.config.repoUrl || '').replace(/\/+$/, '');
    return base + '/issues/new' +
           '?title=' + encodeURIComponent('Content accuracy: ' + title) +
           '&labels=content';
  }

  /* ------------------------------------------------------- bridge script */
  /* A string, injected as a <script> into the iframe document. It must be
     ES5-safe and completely self-contained: it cannot reference anything from
     this file. */
  function bridgeSource(topicId, batch) {
    return '(function(){' +
      'if(window.' + INJECTED_FLAG + '){return;}window.' + INJECTED_FLAG + '=true;' +
      'var TOPIC=' + JSON.stringify(String(topicId)) + ';' +
      'var BATCH=' + JSON.stringify(Number(batch)) + ';' +
      'var last="";' +
      /* --- number harvesting from the visible results text --- */
      'function pctFrom(text){' +
        'var m=/\\b(\\d{1,3})\\s?%/.exec(text||"");' +
        'if(m){var n=parseInt(m[1],10);if(n>=0&&n<=100){return n;}}' +
        'return null;}' +
      'function ratioFrom(text){' +
        'var m=/\\b(\\d{1,3})\\s*\\/\\s*(\\d{1,3})\\b/.exec(text||"");' +
        'if(m){var a=parseInt(m[1],10),b=parseInt(m[2],10);' +
        'if(b>=3&&a<=b){return {score:a,total:b,percent:Math.round(a/b*100)};}}' +
        'return null;}' +
      /* --- find something that looks like a results panel --- */
      'function findResults(){' +
        'var sel=["[data-cm-results]","#results",".results",".cm-results","#score",".score-screen",' +
          '"[class*=result]","[id*=result]","[class*=scoreboard]","[data-testid*=result]"];' +
        'for(var i=0;i<sel.length;i++){' +
          'var nodes=document.querySelectorAll(sel[i]);' +
          'for(var j=0;j<nodes.length;j++){' +
            'var el=nodes[j];' +
            'if(!el||el.offsetParent===null){continue;}' +
            'var txt=(el.innerText||el.textContent||"");' +
            'if(txt&&(pctFrom(txt)!==null||ratioFrom(txt)!==null)){return {el:el,text:txt,specific:true};}' +
          '}}' +
        /* Last resort: the whole visible page, but only when it mentions a
           pass or fail verdict, so we do not fire on a mid-exam progress bar. */
        'var body=(document.body&&(document.body.innerText||document.body.textContent))||"";' +
        'if(/\\b(passed|failed|your score|final score|results?)\\b/i.test(body)){' +
          'return {el:document.body,text:body,specific:false};}' +
        'return null;}' +
      /* --- emit once per distinct outcome --- */
      'function emit(percent,score,total,specific,verdictText){' +
        'if(percent===null||percent===undefined){return;}' +
        'var key=percent+"|"+score+"|"+total;' +
        'if(key===last){return;}last=key;' +
        /* The verdict is only inferred from text when a real results panel was
           found. The whole-page fallback is never trusted for this: an exam
           whose questions talk about a failed sign-in contains the word
           "failed" all over the page, and scanning it marked a 89% pass as a
           fail. With no reliable panel, the percentage decides. */
        'var passed=null;' +
        'if(specific){' +
          'var txt=String(verdictText||"");' +
          'if(/\\bnot passed\\b|\\bnot a pass\\b|\\bunsuccessful\\b/i.test(txt)){passed=false;}' +
          'else if(/\\bpass(?:ed)?\\b|\\bcongratulations\\b|\\bwell done\\b/i.test(txt)){passed=true;}' +
        '}' +
        'if(passed===null){passed=percent>=70;}' +
        'try{parent.postMessage({type:"CYBERPULSE_SCORE",topicId:TOPIC,batch:BATCH,' +
          'score:(score===null?null:score),total:(total===null?null:total),' +
          'percent:percent,passed:passed},location.origin);}catch(e){}}' +
      'function scan(){' +
        'var found=findResults();' +
        'if(!found){return;}' +
        'var p=pctFrom(found.text);' +
        'var r=ratioFrom(found.text);' +
        'if(r){emit(r.percent,r.score,r.total,!!found.specific,found.text);return;}' +
        'if(p!==null){' +
          'var m=/\\b(\\d{1,3})\\s*(?:of|\\/)\\s*(\\d{1,3})\\b/.exec(found.text);' +
          'emit(p,m?parseInt(m[1],10):null,m?parseInt(m[2],10):null,!!found.specific,found.text);}}' +
      /* --- watch the DOM for the results screen appearing --- */
      'var scheduled=false;' +
      'function schedule(){if(scheduled){return;}scheduled=true;' +
        'setTimeout(function(){scheduled=false;try{scan();}catch(e){}},400);}' +
      'if(window.MutationObserver&&document.body){' +
        'try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}}' +
      /* --- watch localStorage writes, which is how many quiz shells store a score --- */
      'try{' +
        'var proto=window.localStorage;' +
        'var original=proto.setItem;' +
        'proto.setItem=function(k,v){' +
          'var out=original.apply(this,arguments);' +
          'try{var key=String(k||""),val=String(v||"");' +
            'if(/score|result|quiz|exam|attempt/i.test(key)){' +
              'var p=pctFrom(val);var r=ratioFrom(val);' +
              'if(r){emit(r.percent,r.score,r.total,false,"");}' +
              'else if(p!==null){emit(p,null,null,false,"");}}}catch(e){}' +
          'return out;};' +
      '}catch(e){}' +
      /* --- respond to the parent handshake --- */
      'window.addEventListener("message",function(ev){' +
        'if(!ev||!ev.data||ev.data.type!=="CYBERPULSE_INIT"){return;}' +
        'try{window.dispatchEvent(new CustomEvent("cyber-pulse-academy:init",{detail:ev.data}));}catch(e){}' +
        'schedule();});' +
      /* --- also re-check when the user returns to the tab or clicks around --- */
      'document.addEventListener("click",schedule,true);' +
      'document.addEventListener("visibilitychange",schedule,true);' +
      'setInterval(schedule,2000);' +
      'schedule();' +
    '})();';
  }

  function installBridge(iframe) {
    var doc = null;
    try { doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document); } catch (e) { doc = null; }
    if (!doc || !doc.documentElement) { return false; }
    /* Same-origin, so this is allowed. If it is ever not same-origin the
       throw is caught above and the bridge is simply skipped: the hub still
       counts scores from batches that emit the message themselves. */
    try {
      var script = doc.createElement('script');
      script.textContent = bridgeSource(active.topicId, active.batch);
      (doc.head || doc.documentElement).appendChild(script);
      return true;
    } catch (e) {
      if (CM.config.debug) { console.warn('[CM] bridge injection skipped', e); }
      return false;
    }
  }

  function sendInit(iframe) {
    var identity = CM.identity ? CM.identity.get() : null;
    var payload = {
      type: 'CYBERPULSE_INIT',
      username: identity ? identity.name : '',
      country: identity ? identity.country : 'ZZ',
      batch: active.batch,
      topicId: active.topicId,
      locale: (CM.i18n && CM.i18n.locale) || 'en',
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    };
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(payload, location.origin);
        /* Send the legacy protocol name too, so an exercise file written before
           the site was renamed still receives its handshake. Two messages cost
           nothing and remove a whole class of "why is my exercise blank". */
        var legacy = {};
        for (var key in payload) {
          if (Object.prototype.hasOwnProperty.call(payload, key)) { legacy[key] = payload[key]; }
        }
        legacy.type = 'CYBERMASTERY_INIT';
        iframe.contentWindow.postMessage(legacy, location.origin);
      }
    } catch (e) {
      if (CM.config.debug) { console.warn('[CM] postMessage failed', e); }
    }
  }

  /* ----------------------------------------------------- message listener */
  function onMessage(event) {
    /* Only same-origin messages are considered. A cross-origin frame cannot
       write statistics into this site. */
    if (event.origin !== location.origin) { return; }
    var data = event.data;
    if (!data) { return; }
    /* Accept both protocol names, for the same backwards-compatibility reason. */
    if (data.type !== 'CYBERPULSE_SCORE' && data.type !== 'CYBERMASTERY_SCORE') { return; }
    if (String(data.topicId) !== String(active.topicId)) { return; }
    /* An exercise file that is not one of the numbered batches may omit the batch
       number entirely. Treat that as "any batch" rather than dropping the score. */
    var incomingBatch = parseInt(data.batch, 10);
    if (!isNaN(incomingBatch) && incomingBatch !== parseInt(active.batch, 10)) { return; }

    var percent = (typeof data.percent === 'number') ? Math.max(0, Math.min(100, data.percent)) : null;
    if (percent === null) { return; }

    /* De-duplicate: the bridge can legitimately observe the same results
       screen more than once (mutation + interval + click). */
    var key = active.batch + '|' + percent + '|' + (data.total === undefined ? '' : data.total);
    if (active.scoredFor === key) { return; }

    var passed = (typeof data.passed === 'boolean') ? data.passed : (percent >= CM.config.defaultPassMark);

    /* Hold the score until it stops changing, then record it once.
     *
     * Several exercise results screens count the score up: 68, then 74, then 78,
     * then 89. The bridge fires on every one of those mutations, so recording
     * immediately wrote four separate attempts for a single exam and pushed the
     * "exams taken" total far above the number of exams actually sat. Waiting
     * for the value to settle records the real, final score exactly once. */
    active.pending = {
      key: key,
      score: (typeof data.score === 'number') ? data.score : null,
      total: (typeof data.total === 'number') ? data.total : null,
      percent: percent,
      passed: passed
    };
    if (active.recordTimer) { clearTimeout(active.recordTimer); }
    active.recordTimer = setTimeout(flushScore, 1600);
  }

  /* Write the settled score. Called only once the numbers have stopped moving. */
  function flushScore() {
    active.recordTimer = null;
    var settled = active.pending;
    if (!settled) { return; }
    active.pending = null;
    active.scoredFor = settled.key;

    var percent = settled.percent;
    var passed = settled.passed;

    CM.Store.submitStat({
      topicId: active.topicId,
      batch: active.batch,
      score: settled.score,
      total: settled.total,
      percent: percent,
      passed: passed
    }).then(function () {
      var summary = t('batch.returned', {
        score: (settled.score === null ? '?' : settled.score),
        total: (settled.total === null ? '?' : settled.total),
        pct: CM.util.pct(percent)
      });
      CM.a11y.toast(summary + ' \u00B7 ' + (passed ? t('batch.pass') : t('batch.fail')), passed ? 'ok' : 'warn');
      CM.a11y.announce(summary, false);
      renderAttempts();
      if (passed) { showCelebration(); }
      document.dispatchEvent(new CustomEvent('cm:score-recorded', { detail: { percent: percent, passed: passed } }));
    });
  }
  window.addEventListener('message', onMessage);
  document.addEventListener('cm:score-recorded', function () {
    document.dispatchEvent(new CustomEvent('cm-score-updated'));
  });

  /* ------------------------------------------------------------- rendering */
  /* The exercise list itself is rendered as static HTML by
     scripts/generate_pages.py. That keeps every exercise crawlable and readable
     with JavaScript switched off. This function only attaches behaviour to the
     buttons, so there is exactly one place that knows a topic's exercises exist
     and exactly one place that makes them clickable. */
  function wireExercises(topic) {
    var buttons = document.querySelectorAll('[data-cm-exercise]');
    for (var i = 0; i < buttons.length; i++) {
      (function (button) {
        if (button.getAttribute('data-cm-wired') === '1') { return; }
        button.setAttribute('data-cm-wired', '1');
        button.addEventListener('click', function () {
          var index = parseInt(button.getAttribute('data-cm-exercise'), 10);
          var path = button.getAttribute('data-cm-path') || '';
          start(topic, index, path);
        });
      })(buttons[i]);
    }

    /* Show the best score already recorded on this device for each exercise. */
    var bestNodes = document.querySelectorAll('[data-cm-best]');
    for (var b = 0; b < bestNodes.length; b++) {
      (function (node) {
        var path = node.getAttribute('data-cm-best');
        var attempts = CM.Store.getRecentAttempts(400).filter(function (a) {
          return a.topicId === topic.id;
        });
        /* Match on the stored path when the record has one, otherwise fall back
           to matching by exercise index taken from the DOM order. */
        var match = null;
        for (var a = 0; a < attempts.length; a++) {
          if (attempts[a].path && path && attempts[a].path === path) {
            if (!match || (attempts[a].percent || 0) > (match.percent || 0)) { match = attempts[a]; }
          }
        }
        if (!match) {
          var buttons = document.querySelectorAll('[data-cm-exercise]');
          for (var j = 0; j < buttons.length; j++) {
            if (buttons[j].getAttribute('data-cm-path') === path) {
              var idx = parseInt(buttons[j].getAttribute('data-cm-exercise'), 10);
              match = CM.Store.getBestFor(topic.id, idx);
              break;
            }
          }
        }
        if (match && typeof match.percent === 'number') {
          node.hidden = false;
          node.innerHTML = CM.nav.svg('check') + ' ' +
            esc('Your best score on this device: ' + CM.util.pct(match.percent));
        }
      })(bestNodes[b]);
    }
  }

  function renderShell(mount, topic) {
    mount.innerHTML =
      '<div class="cm-frame-shell">' +
        '<div class="cm-frame-shell__bar">' +
          '<span class="cm-frame-shell__label" id="cm-frame-label">' + esc('Exercise') + '</span>' +
          '<span class="cm-frame-shell__meta" id="cm-frame-meta"></span>' +
          '<span class="cm-frame-shell__actions">' +
            '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-frame-newtab" hidden>' +
              CM.nav.svg('external') + esc(t('exam.openNewTab')) + '</button>' +
            '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-frame-reload" hidden>' +
              esc(t('exam.reload')) + '</button>' +
            '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-frame-exit" hidden>' +
              esc(t('exam.exit')) + '</button>' +
          '</span>' +
        '</div>' +
        '<div class="cm-frame-overlay" id="cm-frame-overlay" hidden></div>' +
        '<iframe class="cm-frame" id="cm-frame" title="' + esc('Exercise for ' + topic.title) + '" ' +
          'hidden referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>' +
        '<p class="cm-frame-note cm-vh" id="cm-frame-live" role="status" aria-live="polite"></p>' +
      '</div>';
  }

  function showOverlay(kind, topic, batch) {
    var overlay = document.getElementById('cm-frame-overlay');
    if (!overlay) { return; }
    var isTimeout = kind === 'timeout';
    overlay.hidden = false;
    overlay.innerHTML =
      CM.nav.svg(isTimeout ? 'info' : 'alert') +
      '<h3>' + esc(isTimeout ? t('batch.timeout.title') : t('batch.loadError.title')) + '</h3>' +
      '<p>' + esc(isTimeout ? t('batch.timeout.body') : t('batch.loadError.body')) + '</p>' +
      '<div class="cm-frame-overlay__actions">' +
        '<button type="button" class="cm-btn cm-btn--primary" id="cm-frame-retry">' + esc(t('action.retry')) + '</button>' +
        '<a class="cm-btn cm-btn--ghost" href="' + esc(reportUrl(topic.id, batch)) + '" target="_blank" rel="noopener noreferrer">' +
          CM.nav.svg('bug') + esc(t('action.report')) + '</a>' +
      '</div>';
    var retry = overlay.querySelector('#cm-frame-retry');
    if (retry) {
      retry.addEventListener('click', function () {
        overlay.hidden = true;
        loadExercise(topic, batch, active.path);
      });
    }
    CM.a11y.announce(isTimeout ? t('batch.timeout.title') : t('batch.loadError.title'), true);
  }

  function hideOverlay() {
    var overlay = document.getElementById('cm-frame-overlay');
    if (overlay) { overlay.hidden = true; overlay.innerHTML = ''; }
  }

  function setLoading(message) {
    var overlay = document.getElementById('cm-frame-overlay');
    if (!overlay) { return; }
    overlay.hidden = false;
    overlay.innerHTML = '<div class="cm-spinner" role="presentation"></div>' +
      '<h3>' + esc(t('batch.loading')) + '</h3>' +
      '<p>' + esc(message || t('batch.loadingHint')) + '</p>';
  }

  /* Read the optional <script type="application/json" id="cm-exercise-meta">
     block. Batches generated before the contract existed simply do not have
     one, and everything still works. */
  function readMeta(html) {
    var match = /<script[^>]+id=["']cm-exercise-meta["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
    if (!match) { return null; }
    try { return JSON.parse(match[1]); } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ loading */
  /* Load one exercise into the frame.

     `index` is the 1-based position of the exercise in this topic's list, which
     is also what gets recorded as the attempt number. `pathOverride` is the path
     straight from the button's data attribute, so the hub works even if the
     manifest is briefly out of step with the rendered page. */
  function loadExercise(topic, index, pathOverride) {
    var iframe = document.getElementById('cm-frame');
    if (!iframe) { return; }

    var list = CM.util.exerciseList(topic);
    var entry = list[index - 1] ? list[index - 1].exercise : null;
    var path = String(pathOverride || (entry && entry.path) || '').replace(/^\.?\//, '');
    if (!path) { return; }
    var url = CM.util.url(path);

    active.iframe = iframe;
    active.topicId = topic.id;
    active.batch = index;
    active.path = path;
    active.scoredFor = '';

    if (active.timer) { clearTimeout(active.timer); }

    label(index, entry, null);
    setLoading();
    iframe.hidden = true;
    iframe.removeAttribute('src');

    /* Preflight. A 404 does NOT fire iframe onerror in any browser, so the
       only reliable way to distinguish "missing file" from "slow network" is
       to ask for it first. */
    var preflight;
    try {
      preflight = fetch(url, { credentials: 'omit', cache: 'no-cache' });
    } catch (e) {
      preflight = Promise.reject(e);
    }

    if (typeof AbortController !== 'undefined') {
      var ctrl = new AbortController();
      preflight = fetch(url, { credentials: 'omit', cache: 'no-cache', signal: ctrl.signal });
      active.timer = setTimeout(function () {
        ctrl.abort();
        showOverlay('timeout', topic, index);
      }, CM.config.iframeTimeoutMs);
    } else {
      active.timer = setTimeout(function () { showOverlay('timeout', topic, index); }, CM.config.iframeTimeoutMs);
    }

    preflight.then(function (response) {
      if (!response.ok) { throw new Error('HTTP ' + response.status); }
      return response.text();
    }).then(function (html) {
      if (active.timer) { clearTimeout(active.timer); }
      var meta = readMeta(html);
      label(index, entry, meta);

      /* Loading through the same URL the preflight just fetched means this
         second request is served from the HTTP cache. */
      iframe.onload = function () {
        if (active.timer) { clearTimeout(active.timer); }
        installBridge(iframe);
        sendInit(iframe);
        iframe.hidden = false;
        hideOverlay();
        var newtab = document.getElementById('cm-frame-newtab');
        if (newtab) { newtab.hidden = false; newtab.setAttribute('data-href', url); }
        var reload = document.getElementById('cm-frame-reload');
        if (reload) { reload.hidden = false; }
        var exit = document.getElementById('cm-frame-exit');
        if (exit) { exit.hidden = false; }
        var live = document.getElementById('cm-frame-live');
        if (live) { live.textContent = 'Exercise ' + index + ' is ready.'; }
        CM.a11y.announce('Exercise ' + index + ' loaded.', false);
        try { iframe.contentWindow.focus(); } catch (e) { /* ignore */ }
      };
      iframe.onerror = function () {
        if (active.timer) { clearTimeout(active.timer); }
        showOverlay('error', topic, index);
      };

      /* A second guard: some browsers fire load for an error page. Compare the
         document we actually got against the one we asked for. */
      active.timer = setTimeout(function () {
        var doc = null;
        try { doc = iframe.contentDocument; } catch (e) { doc = null; }
        if (!doc || !doc.body || doc.body.childElementCount === 0) {
          showOverlay('timeout', topic, index);
        }
      }, CM.config.iframeTimeoutMs);

      iframe.src = url;

      /* Deep link, so an exercise can be shared or opened on its own. */
      try {
        var params = new URLSearchParams(location.search);
        params.set('exercise', String(index));
        params.delete('batch');
        history.replaceState(null, '', location.pathname + '?' + params.toString() + location.hash);
      } catch (e) { /* ignore */ }

      /* The frame is now the live region for assistive technology. */
      var shell = document.querySelector('.cm-frame-shell');
      if (shell) { shell.scrollIntoView({ block: 'start', behavior: CM.a11y.reduceMotion ? 'auto' : 'smooth' }); }
    })['catch'](function (err) {
      if (active.timer) { clearTimeout(active.timer); }
      if (CM.config.debug) { console.warn('[CM] exercise preflight failed', err); }
      /* Abort means our own timeout already handled it. */
      if (err && err.name === 'AbortError') { return; }
      showOverlay('error', topic, index);
    });
  }

  function label(index, entry, meta) {
    var labelEl = document.getElementById('cm-frame-label');
    var metaEl = document.getElementById('cm-frame-meta');
    if (labelEl) {
      labelEl.textContent = entry && entry.title ? entry.title : ('Exercise ' + index);
    }
    if (metaEl) {
      var bits = [];
      if (meta && meta.questionCount) { bits.push(meta.questionCount + ' questions'); }
      if (meta && meta.estimatedMinutes) { bits.push(meta.estimatedMinutes + ' min'); }
      if (meta && meta.passMark) { bits.push(t('batch.passMark', { pct: meta.passMark + '%' })); }
      metaEl.innerHTML = bits.map(function (b) {
        return '<span class="cm-badge cm-badge--sm">' + esc(b) + '</span>';
      }).join('');
    }
  }

  /* ------------------------------------------------------- celebration */
  function showCelebration() {
    var mount = document.getElementById('cm-celebrate');
    if (!mount) { return; }
    mount.hidden = false;
    mount.innerHTML =
      '<h2>' + CM.nav.svg('check') + esc('You passed.') + '</h2>' +
      '<p>' + esc('That is a genuinely hard exercise to pass. If this platform helped, supporting it keeps new exercises coming. This card only appears after a pass, it never interrupts an exercise, and nothing is gated behind it.') + '</p>' +
      '<div class="cm-celebrate__actions">' +
        '<a class="cm-btn cm-btn--primary" href="' + CM.util.url('pages/support.html') + '">' +
          CM.nav.svg('heart') + esc(t('footer.donate')) + '</a>' +
        '<button type="button" class="cm-btn cm-btn--ghost" id="cm-celebrate-share">' +
          esc(t('action.share')) + '</button>' +
        '<button type="button" class="cm-btn cm-btn--ghost" id="cm-celebrate-dismiss">' +
          esc(t('action.close')) + '</button>' +
      '</div>';
    var share = mount.querySelector('#cm-celebrate-share');
    if (share && CM.share) {
      share.addEventListener('click', function () { CM.share.open(); });
    }
    var dismiss = mount.querySelector('#cm-celebrate-dismiss');
    if (dismiss) {
      dismiss.addEventListener('click', function () {
        mount.hidden = true;
        CM.store.storage.set('cm.celebrate.dismissed.' + active.topicId, true);
      });
    }
    CM.a11y.announce('You passed this exercise.', false);
  }

  /* ----------------------------------------------------------- attempts */
  function renderAttempts() {
    var mount = document.getElementById('cm-attempts');
    if (!mount) { return; }
    var attempts = CM.Store.getRecentAttempts(40).filter(function (a) {
      return a.topicId === active.topicId;
    });
    if (!attempts.length) {
      mount.innerHTML = '<p class="cm-small cm-dim">' + esc(t('exam.noAttempts')) + '</p>';
      return;
    }
    mount.innerHTML =
      '<h2 class="cm-h3">' + esc(t('exam.recent')) + '</h2>' +
      '<ul class="cm-attempts">' + attempts.slice(0, 8).map(function (a) {
        return '<li>' +
          '<span class="cm-badge cm-badge--sm">' + esc('Exercise ' + a.batch) + '</span>' +
          '<time class="cm-dim cm-tiny" datetime="' + esc(new Date(a.ts).toISOString()) + '">' +
            esc(CM.util.date(new Date(a.ts).toISOString().slice(0, 10))) + '</time>' +
          '<span class="cm-batchresult cm-batchresult--' + (a.passed ? 'pass' : 'fail') + '">' +
            (a.passed ? CM.nav.svg('check') + t('batch.pass') : CM.nav.svg('alert') + t('batch.fail')) + '</span>' +
          '<span class="cm-attempts__score">' + esc(CM.util.pct(a.percent)) + '</span>' +
        '</li>';
      }).join('') + '</ul>';
  }

  /* ---------------------------------------------------------------- init */
  function init(options) {
    var opts = options || {};
    var topicId = opts.topicId || (document.body && document.body.getAttribute('data-cm-topic'));
    if (!topicId) { return Promise.resolve(); }

    var shellMount = document.getElementById('cm-hub');
    var hasExerciseButtons = document.querySelectorAll('[data-cm-exercise]').length > 0;
    if (!shellMount && !hasExerciseButtons && !document.getElementById('cm-attempts')) {
      return Promise.resolve();
    }

    return CM.Store.getTopic(topicId).then(function (topic) {
      if (!topic) {
        if (shellMount) {
          shellMount.innerHTML = '<div class="cm-state">' + CM.nav.svg('alert') +
            '<h3>' + esc('Topic not found') + '</h3>' +
            '<p>' + esc('No topic with the id "' + topicId + '" exists in the catalog manifest.') + '</p></div>';
        }
        return;
      }

      if (shellMount) { renderShell(shellMount, topic); }
      wireExercises(topic);
      renderAttempts();

      /* "Surprise me" button, when the page provides one. */
      var randomBtn = document.getElementById('cm-random-exercise');
      if (randomBtn) {
        randomBtn.addEventListener('click', function () {
          var available = CM.util.exerciseList(topic).filter(function (item) {
            return (item.exercise.status || 'published') !== 'missing';
          });
          if (!available.length) {
            CM.a11y.toast('No exercise is ready for this topic yet. The coverage page shows what is planned.', 'warn');
            return;
          }
          var pick = available[Math.floor(Math.random() * available.length)];
          start(topic, CM.util.exerciseList(topic).indexOf(pick) + 1, pick.exercise.path);
        });
      }

      if (shellMount) {
        shellMount.addEventListener('click', function (event) {
          var target = event.target.closest('button, a');
          if (!target) { return; }
          if (target.id === 'cm-frame-reload') { loadExercise(topic, active.batch, active.path); return; }
          if (target.id === 'cm-frame-newtab') {
            window.open(target.getAttribute('data-href') || CM.util.url(active.path || ''), '_blank', 'noopener');
            return;
          }
          if (target.id === 'cm-frame-exit') {
            var iframe = document.getElementById('cm-frame');
            if (iframe) { iframe.hidden = true; iframe.removeAttribute('src'); }
            ['cm-frame-newtab', 'cm-frame-reload', 'cm-frame-exit'].forEach(function (id) {
              var el = document.getElementById(id);
              if (el) { el.hidden = true; }
            });
            hideOverlay();
            var first = document.querySelector('[data-cm-exercise]');
            if (first) {
              first.scrollIntoView({ block: 'center', behavior: CM.a11y.reduceMotion ? 'auto' : 'smooth' });
              first.focus();
            }
            return;
          }
        });
      }

      /* Deep link: ?exercise=3 opens that exercise straight away. The older
         ?batch= form is still accepted so existing shared links keep working. */
      var requested = parseInt(CM.util.param('exercise') || CM.util.param('batch'), 10);
      var list = CM.util.exerciseList(topic);
      if (requested && list[requested - 1] && (list[requested - 1].exercise.status || 'published') !== 'missing') {
        start(topic, requested, list[requested - 1].exercise.path);
      }
    });
  }

  /* Starting an exercise always requires an identity. Reading never does. */
  function start(topic, index, path) {
    CM.Identity.require().then(function (identity) {
      if (!identity) {
        CM.a11y.toast(t('identity.needFirst'), 'warn');
        return;
      }
      loadExercise(topic, index, path);
    });
  }

  CM.examHub = {
    init: init,
    loadExercise: loadExercise,
    loadBatch: loadExercise,
    reportUrl: reportUrl,
    accuracyUrl: accuracyUrl,
    readMeta: readMeta,
    bridgeSource: bridgeSource
  };

  /* Auto-initialise any page whose body declares data-cm-topic. */
  function autoBoot() {
    if (document.body && document.body.hasAttribute('data-cm-topic')) {
      init({ topicId: document.body.getAttribute('data-cm-topic') });
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', autoBoot); }
  else { autoBoot(); }
})();
