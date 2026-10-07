/* ============================================================================
   CyberPulseAcademy - assets/js/store.js
   THE DATA FACADE. Every read of catalog data in the whole site goes through
   this file. No UI module is allowed to fetch data/catalog.json itself.

   Why this exists: today the data layer is a static JSON file on GitHub Pages.
   Tomorrow it may be a REST API, a Supabase table, or a search index. Because
   the surface is exactly four methods, that swap is a change to this one file:

     Store.getCatalog()            -> Promise<Catalog>
     Store.getTopic(id)            -> Promise<Topic|null>
     Store.getStats()              -> Promise<StatsSnapshot>   (delegates)
     Store.submitStat(event)       -> Promise<Result>          (delegates)

   Also provides Store.storage: a localStorage wrapper that survives Safari
   private mode, where any write can throw. On failure it degrades to an
   in-memory map and raises a one-time flag so the UI can show a non-blocking
   notice instead of crashing or silently losing the user's work.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  /* ---------------------------------------------------------------- storage */
  var memory = {};
  var storageDegraded = false;
  var degradedNotified = false;

  function canUseLocalStorage() {
    try {
      var probe = '__cm_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  }

  var localStorageWorks = canUseLocalStorage();
  if (!localStorageWorks) { storageDegraded = true; }

  function noticeDegraded() {
    if (degradedNotified) { return; }
    degradedNotified = true;
    document.dispatchEvent(new CustomEvent('cm:storage-degraded'));
  }

  var storage = {
    /* Read and JSON-parse a key. Returns fallback on any failure. */
    get: function (key, fallback) {
      var raw = null;
      if (localStorageWorks) {
        try { raw = window.localStorage.getItem(key); } catch (e) { raw = null; }
      }
      if (raw === null || raw === undefined) {
        raw = Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
      }
      if (raw === null || raw === undefined) { return fallback === undefined ? null : fallback; }
      try { return JSON.parse(raw); } catch (e) { return raw; }
    },

    /* JSON-stringify and write a key. Never throws. Returns true on success,
       false when the value only made it into the in-memory fallback. */
    set: function (key, value) {
      var raw;
      try { raw = JSON.stringify(value); } catch (e) { return false; }
      memory[key] = raw;
      if (localStorageWorks) {
        try {
          window.localStorage.setItem(key, raw);
          return true;
        } catch (e) {
          /* Quota exceeded, or private mode revoked permission mid-session. */
          localStorageWorks = false;
          storageDegraded = true;
          noticeDegraded();
          return false;
        }
      }
      noticeDegraded();
      return false;
    },

    remove: function (key) {
      delete memory[key];
      if (localStorageWorks) {
        try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
      }
      return true;
    },

    /* Return every key this site owns. Only cm.* keys are ever touched, so a
       "delete my data" action can never remove anything that is not ours. */
    keys: function () {
      var out = [];
      if (localStorageWorks) {
        try {
          for (var i = 0; i < window.localStorage.length; i++) {
            var k = window.localStorage.key(i);
            if (k && k.indexOf('cm.') === 0) { out.push(k); }
          }
        } catch (e) { /* ignore */ }
      }
      for (var key in memory) {
        if (Object.prototype.hasOwnProperty.call(memory, key) && out.indexOf(key) === -1) { out.push(key); }
      }
      return out;
    },

    clearAll: function () {
      var owned = storage.keys();
      for (var i = 0; i < owned.length; i++) { storage.remove(owned[i]); }
      memory = {};
      return owned;
    },

    isDegraded: function () { return storageDegraded; },
    isPersistent: function () { return localStorageWorks; }
  };

  /* -------------------------------------------------------------- catalog */
  var catalogCache = null;
  var catalogPromise = null;

  function normaliseCatalog(raw) {
    var cat = raw || {};
    cat.version = cat.version || CM.config.catalogVersion;
    cat.siteVersion = cat.siteVersion || CM.config.siteVersion;
    cat.topics = Array.isArray(cat.topics) ? cat.topics : [];
    cat.themes = Array.isArray(cat.themes) ? cat.themes : [];
    cat.totals = cat.totals || {};
    cat.coverage = cat.coverage || { with0Batches: [], with1Batch: [], with2Batches: [], with3Batches: [] };

    /* Reserved module slots. The renderer ignores unknown and empty fields, so
       these can be filled in a later release without touching any UI code. */
    cat.courses = Array.isArray(cat.courses) ? cat.courses : [];
    cat.labs = Array.isArray(cat.labs) ? cat.labs : [];
    cat.glossary = Array.isArray(cat.glossary) ? cat.glossary : [];
    cat.quizzes = Array.isArray(cat.quizzes) ? cat.quizzes : [];

    var index = {};
    for (var i = 0; i < cat.topics.length; i++) {
      var topic = cat.topics[i];
      if (!topic || !topic.id) { continue; }
      index[topic.id] = topic;
    }
    cat.index = index;
    return cat;
  }

  var Store = {
    storage: storage,

    /* Fetch and cache the manifest. Cache-busted with the site version because
       GitHub Pages will not let us send Cache-Control headers. */
    getCatalog: function (force) {
      if (catalogCache && !force) { return Promise.resolve(catalogCache); }
      if (catalogPromise && !force) { return catalogPromise; }
      var url = CM.util.versioned('data/catalog.json');
      catalogPromise = CM.util.fetchJSON(url, 8000)
        .then(function (raw) {
          catalogCache = normaliseCatalog(raw);
          return catalogCache;
        })
        ['catch'](function (err) {
          catalogPromise = null;
          var wrapped = new Error('catalog-unavailable');
          wrapped.cause = err;
          throw wrapped;
        });
      return catalogPromise;
    },

    /* Synchronous accessor for code that already awaited getCatalog(). */
    getCatalogSync: function () { return catalogCache; },

    getTopic: function (id) {
      if (catalogCache) { return Promise.resolve(catalogCache.index[id] || null); }
      return Store.getCatalog().then(function (cat) { return cat.index[id] || null; });
    },

    /* All topics of one catalog type, e.g. "technique". */
    getTopicsByType: function (type) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) { return t.type === type; });
      });
    },

    /* Sub-techniques of a parent technique, resolved through parentTechnique. */
    getSubTechniques: function (parentId) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) {
          return t.type === 'technique' && t.parentTechnique === parentId;
        });
      });
    },

    /* Techniques belonging to a tactic, for the tactics page. */
    getTechniquesForTactic: function (tacticId) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) {
          return t.type === 'technique' && t.parentTactic === tacticId;
        });
      });
    },

    /* Mitigations that declare they address a given technique. This is what
       makes "How to defend against this" appear automatically on a technique
       page without any hand-maintained cross-reference table. */
    getMitigationsForTechnique: function (techniqueId) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) {
          return t.type === 'mitigation' && Array.isArray(t.mitigatesTechniques) &&
                 t.mitigatesTechniques.indexOf(techniqueId) !== -1;
        });
      });
    },

    /* Detection strategies that observe a given technique. */
    getDetectionsForTechnique: function (techniqueId) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) {
          if (t.type !== 'detection') { return false; }
          if (t.techniqueId === techniqueId) { return true; }
          return Array.isArray(t.detectsTechniques) && t.detectsTechniques.indexOf(techniqueId) !== -1;
        });
      });
    },

    /* Groups whose reporting is linked to a technique. */
    getGroupsForTechnique: function (techniqueId) {
      return Store.getCatalog().then(function (cat) {
        return cat.topics.filter(function (t) {
          return t.type === 'group' && Array.isArray(t.linkedTechniques) &&
                 t.linkedTechniques.indexOf(techniqueId) !== -1;
        });
      });
    },

    /* Resolve relatedTopics ids to full topic objects, dropping dead ids. */
    getRelated: function (topic) {
      if (!topic || !Array.isArray(topic.relatedTopics) || topic.relatedTopics.length === 0) {
        return Promise.resolve([]);
      }
      return Store.getCatalog().then(function (cat) {
        var out = [];
        for (var i = 0; i < topic.relatedTopics.length; i++) {
          var found = cat.index[topic.relatedTopics[i]];
          if (found) { out.push(found); }
        }
        return out;
      });
    },

    /* Themes available within a catalog type, with counts. */
    getThemesForType: function (type) {
      return Store.getCatalog().then(function (cat) {
        var counts = {};
        var order = [];
        for (var i = 0; i < cat.topics.length; i++) {
          var t = cat.topics[i];
          if (type && t.type !== type) { continue; }
          if (!counts[t.theme]) { counts[t.theme] = 0; order.push(t.theme); }
          counts[t.theme]++;
        }
        order.sort(function (a, b) { return a.localeCompare(b); });
        return order.map(function (label) {
          return { id: CM.util.slug(label), label: label, count: counts[label], type: type || 'all' };
        });
      });
    },

    /* Search across title, id, externalId, tags, theme and objectives. */
    search: function (query, options) {
      var opts = options || {};
      var q = String(query || '').trim().toLowerCase();
      return Store.getCatalog().then(function (cat) {
        var pool = cat.topics;
        if (opts.type) { pool = pool.filter(function (t) { return t.type === opts.type; }); }
        if (!q) { return pool.slice(0, opts.limit || pool.length); }
        var terms = q.split(/\s+/).filter(Boolean);

        var scored = [];
        for (var i = 0; i < pool.length; i++) {
          var t = pool[i];
          var haystack = [
            t.title, t.shortTitle, t.id, t.externalId, t.theme,
            (t.tags || []).join(' '),
            (t.objectives || []).join(' ')
          ].join(' ').toLowerCase();

          var score = 0;
          var matchedAll = true;
          for (var j = 0; j < terms.length; j++) {
            var term = terms[j];
            var idx = haystack.indexOf(term);
            if (idx === -1) { matchedAll = false; break; }
            /* Rank strong fields above incidental matches in objectives. */
            if (String(t.id).toLowerCase().indexOf(term) === 0) { score += 60; }
            if (String(t.externalId || '').toLowerCase() === term) { score += 80; }
            if (String(t.title).toLowerCase().indexOf(term) === 0) { score += 40; }
            else if (String(t.title).toLowerCase().indexOf(term) !== -1) { score += 25; }
            if ((t.tags || []).join(' ').toLowerCase().indexOf(term) !== -1) { score += 12; }
            if (String(t.theme || '').toLowerCase().indexOf(term) !== -1) { score += 8; }
            score += 2;
          }
          if (matchedAll) { scored.push({ topic: t, score: score }); }
        }
        scored.sort(function (a, b) {
          if (b.score !== a.score) { return b.score - a.score; }
          return String(a.topic.title).localeCompare(String(b.topic.title));
        });
        var results = scored.map(function (s) { return s.topic; });
        return opts.limit ? results.slice(0, opts.limit) : results;
      });
    },

    /* Coverage buckets, recomputed from batch status so the dashboard never
       lies even if catalog.json is briefly stale. */
    getCoverage: function () {
      return Store.getCatalog().then(function (cat) {
        var buckets = { 0: [], 1: [], 2: [], 3: [] };
        for (var i = 0; i < cat.topics.length; i++) {
          var n = CM.util.publishedCount(cat.topics[i]);
          buckets[n].push(cat.topics[i]);
        }
        return buckets;
      });
    },

    /* Recent attempts written by Stats, used by "Continue where you left off". */
    getRecentAttempts: function (limit) {
      var attempts = storage.get('cm.attempts.v1', []);
      if (!Array.isArray(attempts)) { return []; }
      attempts.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
      return limit ? attempts.slice(0, limit) : attempts;
    },

    getBestFor: function (topicId, batch) {
      var attempts = storage.get('cm.attempts.v1', []);
      if (!Array.isArray(attempts)) { return null; }
      var best = null;
      for (var i = 0; i < attempts.length; i++) {
        var a = attempts[i];
        if (a.topicId !== topicId) { continue; }
        if (batch && a.batch !== batch) { continue; }
        if (!best || (a.percent || 0) > (best.percent || 0)) { best = a; }
      }
      return best;
    },

    /* Delegated to stats.js so that UI code never needs to know which module
       actually implements counting. Swapping the backend is a stats.js change. */
    getStats: function () {
      if (!CM.stats) { return Promise.reject(new Error('stats module missing')); }
      return CM.stats.getSnapshot();
    },

    submitStat: function (event) {
      if (!CM.stats) { return Promise.resolve({ ok: false, reason: 'stats-unavailable' }); }
      return CM.stats.submit(event);
    }
  };

  CM.store = Store;
  CM.Store = Store;
})();
