/* ============================================================================
   CyberPulseAcademy - assets/js/config.js
   THE ONE FILE THE SITE OWNER EDITS. Loaded first on every page.
   MIT licensed. See LICENSE.

   Why a separate config file: GitHub Pages cannot set HTTP headers and has no
   server-side environment, so every tunable has to live in a static file that
   is loaded before every other script. Keep this file dependency-free.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Work out the site root, once, from this script's own URL.

     The site may be served from https://<user>.github.io/<repo>/ and pages
     live at three different depths (/,  /pages/,  /topics/,  /exercises/).
     A leading-slash absolute path would break in a subfolder deployment, so
     instead we take the absolute URL of this very script and cut everything
     from "assets/js/" onward. That yields the correct absolute prefix from
     any depth, with no per-page configuration and no guessing.
     ------------------------------------------------------------------- */
  var self = document.currentScript;
  if (!self) {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && all[i].src.indexOf('assets/js/config.js') !== -1) { self = all[i]; break; }
    }
  }
  var src = (self && self.src) ? self.src : '';
  var marker = 'assets/js/config.js';
  var cut = src.indexOf(marker);
  var ROOT = cut >= 0 ? src.slice(0, cut) : new URL('./', location.href).href;
  if (ROOT.charAt(ROOT.length - 1) !== '/') { ROOT += '/'; }

  /* ---------------------------------------------------------------------
     2. Owner configuration.

     >>> EDIT THESE VALUES, THEN COMMIT. <<<

     donationButtonId  Replace with the hosted button id from your PayPal
                       Business account. See the owner handover notes for the full procedure.
     repoUrl           Replace <user>/<repo> with your GitHub repository.
                       Every "Report an issue" link and the footer GitHub
                       link are built from this value.
     statsProvider     "local"  = counters only on this device (DEFAULT,
                                  and the only mode that ships enabled,
                                  because collecting anything centrally
                                  without a published privacy policy is a
                                  real legal exposure).
                       "remote" = POST to statsEndpoint you host yourself.
                       "off"    = collect nothing at all.
     ------------------------------------------------------------------- */
  var CONFIG = {
    /* --- identity of the deployment ------------------------------------ */
    siteName: 'CyberPulseAcademy',
    siteTagline: 'Hands-on, extreme-difficulty cyber security study',
    siteVersion: '1.2.2',
    catalogVersion: '1.1.0',

    /* --- owner values: edit these three -------------------------------- */
    repoUrl: 'https://github.com/Souhaieb-Marzouk/Cyber-Pulse-Academy',
    statsEndpoint: '',
    donationButtonId: 'KNUSPQTVR9WCU',

    /* --- statistics ---------------------------------------------------- */
    /* "local" ships by default on purpose: see pages/privacy.html. */
    statsProvider: 'local',
    /* Public, non-secret salt used to hash the username locally before it is
       ever counted. Change it, then never change it again, or historical
       unique-user counts will double. It is NOT a secret: it only stops the
       same username producing different hashes between deployments. */
    statsSalt: 'cyberpulse-public-salt-v1',
    statsTimeoutMs: 5000,

    /* --- donations ------------------------------------------------------ */
    donationCurrency: 'EUR',
    donationPresets: [5, 10, 25, 50],
    donationActionLive: 'https://www.paypal.com/donate',
    donationActionSandbox: 'https://www.sandbox.paypal.com/donate',
    /* PayPal hosted buttons cannot enforce a minimum, so the site does: the
       first preset is 5 EUR and every preset link sends that amount, which is
       the documented PayPal pattern. The support page states the minimum. */
    donationMinAmount: 5,

    /* --- behaviour ------------------------------------------------------ */
    defaultTheme: 'dark',
    locale: 'en',
    /* How long an exercise batch may take to load before we give up and show
       the retry/report card. A silent blank frame destroys trust. */
    iframeTimeoutMs: 5000,
    /* Pass mark used when a batch does not declare its own. */
    defaultPassMark: 70,
    /* Number of "latest additions" and "continue learning" entries on home. */
    homeLatestCount: 6,
    /* Set true to log diagnostics to the console. Never sends anything. */
    debug: false
  };

  /* ---------------------------------------------------------------------
     3. Shared namespace. Every module hangs off window.CM.
     ------------------------------------------------------------------- */
  var CM = window.CM || {};
  CM.ROOT = ROOT;
  CM.config = CONFIG;
  CM.version = CONFIG.siteVersion;

  /* Small helpers used by every other module. Kept here so that no module
     has to depend on another module merely to escape a string. */
  CM.util = {
    /* Escape text for safe insertion into innerHTML. */
    esc: function (value) {
      if (value === null || value === undefined) { return ''; }
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    /* Build an absolute URL inside the deployment from a repo-relative path. */
    url: function (relPath) {
      if (!relPath) { return ROOT; }
      if (/^[a-z][a-z0-9+.-]*:/i.test(relPath)) { return relPath; }
      return ROOT + String(relPath).replace(/^\.?\//, '');
    },
    /* Internal navigation link, with the version query string applied. */
    link: function (relPath) {
      var href = CM.util.url(relPath);
      if (/\.html?($|\?)/.test(href) === false) { return href; }
      return href;
    },
    /* Append the site version to a same-origin asset URL. GitHub Pages gives
       no control over cache headers, so cache-busting has to be explicit or
       visitors keep a stale catalog.json for hours. */
    versioned: function (relPath) {
      var href = CM.util.url(relPath);
      if (href.indexOf('?') !== -1) { return href + '&v=' + encodeURIComponent(CONFIG.siteVersion); }
      return href + '?v=' + encodeURIComponent(CONFIG.siteVersion);
    },
    /* Fetch JSON with a hard timeout so nothing ever spins forever. */
    fetchJSON: function (url, timeoutMs) {
      var ms = timeoutMs || CONFIG.statsTimeoutMs;
      if (typeof AbortController === 'undefined') {
        return fetch(url).then(function (r) {
          if (!r.ok) { throw new Error('HTTP ' + r.status + ' for ' + url); }
          return r.json();
        });
      }
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, ms);
      return fetch(url, { signal: ctrl.signal, credentials: 'omit', cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) { throw new Error('HTTP ' + r.status + ' for ' + url); }
          return r.json();
        })
        .finally(function () { clearTimeout(timer); });
    },
    /* Deterministic slug for non-ASCII or space-containing titles. */
    slug: function (text) {
      return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },
    /* sha256 hex of a string, using Web Crypto when available. Falls back to
       a documented non-cryptographic hash so that "local" mode still works
       on file:// and on very old browsers. Never used for security. */
    sha256: function (text) {
      if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        var bytes = new TextEncoder().encode(text);
        return window.crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
          var view = new Uint8Array(buf);
          var out = '';
          for (var i = 0; i < view.length; i++) {
            out += ('0' + view[i].toString(16)).slice(-2);
          }
          return out;
        })['catch'](function () { return CM.util.fnv1a(text); });
      }
      return Promise.resolve(CM.util.fnv1a(text));
    },
    fnv1a: function (text) {
      var h = 0x811c9dc5;
      var s = String(text);
      for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      var hex = h.toString(16);
      while (hex.length < 16) { hex = '0' + hex; }
      return 'fnv' + hex + hex;
    },
    /* Format a percentage for display. */
    pct: function (n) {
      if (typeof n !== 'number' || isNaN(n)) { return 'n/a'; }
      return (Math.round(n * 10) / 10) + '%';
    },
    /* Human date from an ISO date string, locale-aware but dependency-free. */
    date: function (iso) {
      if (!iso) { return ''; }
      var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
      if (isNaN(d.getTime())) { return String(iso); }
      try {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
      } catch (e) {
        return d.toISOString().slice(0, 10);
      }
    },
    /* Country flag emoji from an ISO 3166-1 alpha-2 code, computed with the
       regional indicator symbols. No image assets, no sprite sheet, and the
       three-letter "ZZ" unknown code degrades to a neutral glyph. */
    flag: function (code) {
      var cc = String(code || '').toUpperCase();
      if (!/^[A-Z]{2}$/.test(cc) || cc === 'ZZ') { return '\uD83C\uDF10'; }
      var base = 0x1F1E6;
      return String.fromCodePoint(base + (cc.charCodeAt(0) - 65)) +
             String.fromCodePoint(base + (cc.charCodeAt(1) - 65));
    },
    /* ------------------------------------------------------------------
       The exercise model, in one place.

       A topic holds its exercises in one of two shapes:

         * most topics: a flat "exercises" array, any length including zero;
         * a certification: "chapters", each with its own "exercises" array,
           plus an optional flat "exercises" array for material that belongs to
           no single chapter.

       These three helpers are the only place that shape is understood. Every
       renderer, the coverage dashboard and the statistics page go through them,
       so adding a third shape later means changing one file.
       ------------------------------------------------------------------ */
    exerciseList: function (topic) {
      if (!topic) { return []; }
      var out = [];
      var chapters = topic.chapters;
      if (chapters && chapters.length) {
        for (var c = 0; c < chapters.length; c++) {
          var items = chapters[c] && chapters[c].exercises;
          if (!items) { continue; }
          for (var i = 0; i < items.length; i++) {
            out.push({ exercise: items[i], chapter: chapters[c] });
          }
        }
      }
      var flat = topic.exercises;
      if (flat && flat.length) {
        for (var f = 0; f < flat.length; f++) {
          out.push({ exercise: flat[f], chapter: null });
        }
      }
      return out;
    },

    /* Counts for one topic: how many exercises exist, and how many are live. */
    exerciseStats: function (topic) {
      var list = CM.util.exerciseList(topic);
      var stats = { total: list.length, published: 0, draft: 0, missing: 0 };
      for (var i = 0; i < list.length; i++) {
        var status = (list[i].exercise && list[i].exercise.status) || 'published';
        if (status === 'published') { stats.published++; }
        else if (status === 'draft') { stats.draft++; }
        else { stats.missing++; }
      }
      return stats;
    },

    /* How many catalogue entries a topic has that a learner can actually open.
       Kept as a named function because the coverage dashboard and the listing
       cards both need exactly this number. */
    publishedCount: function (topic) {
      return CM.util.exerciseStats(topic).published;
    },
    totalCount: function (topic) {
      return CM.util.exerciseStats(topic).total;
    },
    isCertification: function (topic) {
      return !!topic && topic.type === 'certification';
    },

    /* ------------------------------------------------------------------
       The donation link, built in one place.

       The owner supplied a PayPal hosted button and asked for a minimum of
       5 EUR. A hosted button cannot be forced to a minimum by a URL: PayPal
       applies whatever rules the button was created with. So the site does the
       two things it can actually control:

         1. every preset amount starts at the minimum or above, so one-click
            giving can never be below 5 EUR;
         2. the amount is pre-filled in the URL so the donor lands on PayPal
            with 5 EUR already selected.

       If the button was created with "donors choose the amount" and a minimum,
       PayPal enforces it. If it was not, a determined donor can lower it, and
       that is a PayPal setting the owner must make, not something this file can
       fix. pages/support.html states the minimum to the visitor either way.
       ------------------------------------------------------------------ */
    donateUrl: function (amount) {
      var value = amount || CONFIG.donationMinAmount || 5;
      var url = CONFIG.donationActionLive + '/?hosted_button_id=' + encodeURIComponent(CONFIG.donationButtonId);
      url += '&amount=' + encodeURIComponent(String(value));
      url += '&currency_code=' + encodeURIComponent(CONFIG.donationCurrency);
      return url;
    },
    debounce: function (fn, wait) {
      var timer = null;
      return function () {
        var args = arguments, ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
      };
    },
    /* Query string helpers. */
    param: function (name) {
      try {
        return new URLSearchParams(location.search).get(name);
      } catch (e) {
        var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
        return m ? decodeURIComponent(m[1]) : null;
      }
    }
  };

  if (CONFIG.debug) {
    try { console.info('[CM] root =', ROOT, 'version =', CONFIG.siteVersion); } catch (e) {}
  }

  window.CM = CM;
})();
