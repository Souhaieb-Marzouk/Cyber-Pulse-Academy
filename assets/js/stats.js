/* ============================================================================
   CyberPulseAcademy - assets/js/stats.js
   Pluggable statistics provider. Three modes, chosen in config.js:

     "local"  (default) counters live only in this browser. The Stats page says
              so plainly. This is the shipped default because collecting
              anything centrally without a published privacy policy is a real
              legal exposure, not a formality.
     "remote" POST {statsEndpoint}/event, and read {statsEndpoint}/stats.
              The endpoint is owner-hosted. See cloudflare-worker/README.md.
     "off"    no collection at all. Nothing leaves the page, nothing is kept.

   What is never sent: the raw username. What is sent in remote mode is
   sha256(statsSalt + username) truncated to 16 hex characters, a country
   code, a topic id, a batch number, and a score. There is no cookie, no
   device fingerprint, and no third-party script.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  var ATTEMPTS_KEY = 'cm.attempts.v1';
  var USERS_KEY = 'cm.stats.users.v1';
  var USER_SENT_KEY = 'cm.stats.userSent.v1';
  var OFFLINE_QUEUE_KEY = 'cm.stats.queue.v1';

  var MODE = (function () {
    var m = String(CM.config.statsProvider || 'local').toLowerCase();
    return (m === 'remote' || m === 'off' || m === 'local') ? m : 'local';
  })();

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }

  /* ------------------------------------------------------------- hashing */
  /* Deterministic per-username identifier. Never reversible in practice.
     Truncated to 16 hex characters: enough to count distinct users, far too
     little to be a rainbow-table target. */
  function userHashFor(username) {
    if (!username) { return 'anonymous'; }
    return CM.util.sha256(String(CM.config.statsSalt) + '|' + String(username).toLowerCase())
      .then(function (full) { return String(full).slice(0, 16); });
  }

  /* --------------------------------------------------------- local writes */
  function readAttempts() {
    var list = CM.store.storage.get(ATTEMPTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function writeAttempt(record) {
    var list = readAttempts();
    list.push(record);
    /* Keep the file small: 500 attempts is far more than any single device
       will accumulate, and it keeps localStorage well under quota. */
    if (list.length > 500) { list = list.slice(list.length - 500); }
    CM.store.storage.set(ATTEMPTS_KEY, list);
  }

  function rememberUser(hash, country) {
    var users = CM.store.storage.get(USERS_KEY, {});
    if (!users || typeof users !== 'object') { users = {}; }
    var now = new Date().toISOString();
    if (!users[hash]) { users[hash] = { country: country || 'ZZ', firstSeen: now, lastSeen: now }; }
    else { users[hash].lastSeen = now; if (country) { users[hash].country = country; } }
    CM.store.storage.set(USERS_KEY, users);
  }

  /* ------------------------------------------------------------ aggregate */
  function buildRows(attempts) {
    var byKey = {};
    var order = [];
    for (var i = 0; i < attempts.length; i++) {
      var a = attempts[i];
      var key = a.topicId + '#' + a.batch;
      if (!byKey[key]) {
        byKey[key] = { topicId: a.topicId, batch: a.batch, runs: 0, users: {}, countryCounts: {}, scoreSum: 0, scored: 0, passes: 0, decided: 0 };
        order.push(key);
      }
      var row = byKey[key];
      row.runs++;
      if (a.userHash) { row.users[a.userHash] = true; }
      if (a.country) { row.countryCounts[a.country] = (row.countryCounts[a.country] || 0) + 1; }
      if (typeof a.percent === 'number') {
        row.scoreSum += a.percent; row.scored++;
        row.decided++;
        if (a.passed) { row.passes++; }
      }
    }
    return order.map(function (key) {
      var row = byKey[key];
      var countries = Object.keys(row.countryCounts).map(function (code) {
        return { code: code, count: row.countryCounts[code] };
      }).sort(function (x, y) { return y.count - x.count; });
      return {
        topicId: row.topicId,
        batch: row.batch,
        runs: row.runs,
        uniqueUsers: Object.keys(row.users).length,
        avgScore: row.scored ? (Math.round((row.scoreSum / row.scored) * 10) / 10) : null,
        passRate: row.decided ? (Math.round((row.passes / row.decided) * 1000) / 10) : null,
        topCountries: countries.slice(0, 10)
      };
    });
  }

  function buildLocalSnapshot() {
    var attempts = readAttempts();
    var users = CM.store.storage.get(USERS_KEY, {});
    if (!users || typeof users !== 'object') { users = {}; }

    var countryCounts = {};
    var userCodes = Object.keys(users);
    for (var i = 0; i < userCodes.length; i++) {
      var code = users[userCodes[i]].country || 'ZZ';
      countryCounts[code] = (countryCounts[code] || 0) + 1;
    }
    var usersByCountry = Object.keys(countryCounts).map(function (c) {
      return { code: c, count: countryCounts[c] };
    }).sort(function (a, b) { return b.count - a.count; });

    var rows = buildRows(attempts);

    var examsTaken = attempts.length;
    var scored = attempts.filter(function (a) { return typeof a.percent === 'number'; });
    var avg = scored.length ? (scored.reduce(function (s, a) { return s + a.percent; }, 0) / scored.length) : null;
    var passes = scored.filter(function (a) { return a.passed; }).length;

    /* Most attempted topic, and hardest topic with a floor of 10 attempts so
       a single bad run cannot crown a topic "hardest". */
    var topicRuns = {}, topicScoreSum = {}, topicScoreN = {};
    for (var j = 0; j < attempts.length; j++) {
      var a = attempts[j];
      topicRuns[a.topicId] = (topicRuns[a.topicId] || 0) + 1;
      if (typeof a.percent === 'number') {
        topicScoreSum[a.topicId] = (topicScoreSum[a.topicId] || 0) + a.percent;
        topicScoreN[a.topicId] = (topicScoreN[a.topicId] || 0) + 1;
      }
    }
    var mostAttempted = null;
    Object.keys(topicRuns).forEach(function (id) {
      if (!mostAttempted || topicRuns[id] > mostAttempted.runs) { mostAttempted = { topicId: id, runs: topicRuns[id] }; }
    });
    var hardest = null;
    Object.keys(topicScoreN).forEach(function (id) {
      if (topicScoreN[id] < 10) { return; }
      var mean = topicScoreSum[id] / topicScoreN[id];
      if (!hardest || mean < hardest.avgScore) { hardest = { topicId: id, avgScore: Math.round(mean * 10) / 10, runs: topicScoreN[id] }; }
    });

    return {
      mode: 'local',
      generatedAt: new Date().toISOString(),
      localOnly: true,
      totals: {
        users: userCodes.length,
        countries: usersByCountry.length,
        examsTaken: examsTaken,
        passRate: scored.length ? Math.round((passes / scored.length) * 1000) / 10 : null,
        avgScore: avg === null ? null : Math.round(avg * 10) / 10,
        mostAttempted: mostAttempted,
        hardest: hardest
      },
      usersByCountry: usersByCountry,
      rows: rows
    };
  }

  /* --------------------------------------------------------- remote calls */
  function endpoint(pathPart) {
    var base = String(CM.config.statsEndpoint || '').replace(/\/+$/, '');
    if (!base) { return ''; }
    return base + pathPart;
  }

  function postEvent(payload) {
    var url = endpoint('/event');
    if (!url) { return Promise.resolve({ ok: false, reason: 'no-endpoint' }); }
    var body = JSON.stringify(payload);
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, CM.config.statsTimeoutMs) : null;
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) { clearTimeout(timer); }
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return { ok: true };
    })['catch'](function (err) {
      if (timer) { clearTimeout(timer); }
      /* Queue it so a flaky connection does not silently lose a legitimate
         attempt. The queue is drained on the next successful submit. */
      var queue = CM.store.storage.get(OFFLINE_QUEUE_KEY, []);
      if (!Array.isArray(queue)) { queue = []; }
      queue.push(payload);
      if (queue.length > 50) { queue = queue.slice(queue.length - 50); }
      CM.store.storage.set(OFFLINE_QUEUE_KEY, queue);
      return { ok: false, reason: 'queued', error: String(err && err.message || err) };
    });
  }

  function drainQueue() {
    var queue = CM.store.storage.get(OFFLINE_QUEUE_KEY, []);
    if (!Array.isArray(queue) || queue.length === 0) { return Promise.resolve(0); }
    var pending = queue.slice();
    return pending.reduce(function (chain, payload) {
      return chain.then(function (count) {
        return postEvent(payload).then(function (result) {
          return count + (result.ok ? 1 : 0);
        });
      });
    }, Promise.resolve(0)).then(function (sent) {
      if (sent > 0) {
        var remaining = pending.slice(sent);
        if (remaining.length) { CM.store.storage.set(OFFLINE_QUEUE_KEY, remaining); }
        else { CM.store.storage.remove(OFFLINE_QUEUE_KEY); }
      }
      return sent;
    });
  }

  var lastRemoteSnapshot = null;

  /* --------------------------------------------------------------- public */
  var Stats = {
    mode: MODE,

    /* Human-readable description used on the Stats page and the support page so
       a visitor always knows exactly what is and is not being collected. */
    describe: function () {
      if (MODE === 'off') { return t('stats.offNotice'); }
      if (MODE === 'remote') { return t('stats.remoteNotice'); }
      return t('stats.localNotice');
    },

    /* Record one completed exercise attempt. This is the only entry point the
       UI uses: ExamHub and the topic page both call Store.submitStat, which
       lands here. */
    submit: function (event) {
      var payload = event || {};
      var identity = CM.identity ? CM.identity.get() : null;
      var username = identity ? identity.name : '';
      var country = payload.country || (identity ? identity.country : 'ZZ') || 'ZZ';

      return userHashFor(username).then(function (hash) {
        var record = {
          topicId: String(payload.topicId || ''),
          batch: parseInt(payload.batch, 10) || 1,
          score: (typeof payload.score === 'number') ? payload.score : null,
          total: (typeof payload.total === 'number') ? payload.total : null,
          percent: (typeof payload.percent === 'number') ? payload.percent : null,
          passed: !!payload.passed,
          country: country,
          userHash: hash,
          ts: Date.now()
        };

        /* Local attempt history is kept in every mode except "off". It is the
           user's own data on their own device and it powers "Continue where
           you left off". It is never transmitted. */
        if (MODE !== 'off') {
          writeAttempt(record);
          rememberUser(hash, country);
          document.dispatchEvent(new CustomEvent('cm:stats-updated', { detail: record }));
        }

        if (MODE !== 'remote') {
          return { ok: true, mode: MODE, recorded: MODE === 'local', hash: hash };
        }

        var wire = {
          type: 'run',
          topicId: record.topicId,
          batch: record.batch,
          country: record.country,
          userHash: record.userHash,
          score: record.score,
          total: record.total,
          percent: record.percent,
          passed: record.passed,
          ts: new Date(record.ts).toISOString(),
          siteVersion: CM.config.siteVersion
        };

        return drainQueue().then(function () {
          return postEvent(wire);
        }).then(function (result) {
          return { ok: !!result.ok, mode: 'remote', queued: result.reason === 'queued', hash: hash };
        });
      });
    },

    /* Announce this visitor once per deployment so the country breakdown has a
       denominator even before anyone finishes an exercise. */
    announceUser: function () {
      if (MODE !== 'remote') { return Promise.resolve({ ok: false, mode: MODE }); }
      var identity = CM.identity ? CM.identity.get() : null;
      if (!identity) { return Promise.resolve({ ok: false, reason: 'no-identity' }); }

      return userHashFor(identity.name).then(function (hash) {
        var alreadySent = CM.store.storage.get(USER_SENT_KEY, null);
        if (alreadySent === hash) { return { ok: true, skipped: true }; }
        return postEvent({
          type: 'user',
          country: identity.country,
          userHash: hash,
          ts: new Date().toISOString(),
          siteVersion: CM.config.siteVersion
        }).then(function (result) {
          if (result.ok) { CM.store.storage.set(USER_SENT_KEY, hash); }
          return result;
        });
      });
    },

    /* Aggregate snapshot for the Stats page. Never any personal data. */
    getSnapshot: function () {
      if (MODE === 'off') {
        return Promise.resolve({
          mode: 'off',
          generatedAt: new Date().toISOString(),
          localOnly: false,
          totals: { users: 0, countries: 0, examsTaken: 0, passRate: null, avgScore: null, mostAttempted: null, hardest: null },
          usersByCountry: [],
          rows: []
        });
      }

      if (MODE === 'local') {
        return Promise.resolve(buildLocalSnapshot());
      }

      /* Remote mode. Hard timeout, then an honest error card. Never a spinner
         that runs forever. */
      var url = endpoint('/stats');
      if (!url) {
        return Promise.reject(new Error('stats-endpoint-not-configured'));
      }
      return CM.util.fetchJSON(url, CM.config.statsTimeoutMs)
        .then(function (data) {
          var snapshot = data || {};
          snapshot.mode = 'remote';
          snapshot.generatedAt = snapshot.generatedAt || new Date().toISOString();
          snapshot.totals = snapshot.totals || { users: 0, countries: 0, examsTaken: 0, passRate: null, avgScore: null, mostAttempted: null, hardest: null };
          snapshot.usersByCountry = Array.isArray(snapshot.usersByCountry) ? snapshot.usersByCountry : [];
          snapshot.rows = Array.isArray(snapshot.rows) ? snapshot.rows : [];
          lastRemoteSnapshot = snapshot;
          return snapshot;
        })
        ['catch'](function (err) {
          /* If the network fails we still have the visitor's own numbers. Show
             them rather than an error, and label it honestly. */
          if (lastRemoteSnapshot) { return lastRemoteSnapshot; }
          var local = buildLocalSnapshot();
          local.mode = 'remote-offline';
          local.error = String(err && err.message || err);
          local.localOnly = true;
          return local;
        });
    },

    /* Local attempt history, used by the topic page and the home page. */
    getAttempts: function () { return readAttempts(); },

    deleteMyData: function () {
      var removed = CM.store.storage.clearAll();
      document.dispatchEvent(new CustomEvent('cm:identity-deleted', { detail: { removed: removed } }));
      return removed;
    },

    /* True when the browser could not persist anything. The UI shows a
       non-blocking notice in that case, never a hard failure. */
    isDegraded: function () { return CM.store.storage.isDegraded(); }
  };

  CM.stats = Stats;
  CM.Stats = Stats;
})();
