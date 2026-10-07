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
                       Business account. See docs/paypal-setup.md.
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
    siteVersion: '1.0.0',
    catalogVersion: '1.0.0',

    /* --- owner values: edit these three -------------------------------- */
    repoUrl: 'https://github.com/<user>/<repo>',
    statsEndpoint: '',
    donationButtonId: 'XXXXXXXXXXXXX',

    /* --- statistics ---------------------------------------------------- */
    /* "local" ships by default on purpose: see pages/privacy.html. */
    statsProvider: 'local',
    /* Public, non-secret salt used to hash the username locally before it is
       ever counted. Change it, then never change it again, or historical
       unique-user counts will double. It is NOT a secret: it only stops the
       same username producing different hashes between deployments. */
    statsSalt: 'cyberpulseacademy-public-salt-v1',
    statsTimeoutMs: 5000,

    /* --- donations ------------------------------------------------------ */
    donationCurrency: 'EUR',
    donationPresets: [5, 10, 25],
    donationActionLive: 'https://www.paypal.com/donate',
    donationActionSandbox: 'https://www.sandbox.paypal.com/donate',

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
    /* Turn a topic JSON object into the 0-3 published-batch count. */
    publishedCount: function (topic) {
      if (!topic || !topic.batches) { return 0; }
      var n = 0;
      for (var i = 0; i < topic.batches.length; i++) {
        if (topic.batches[i] && topic.batches[i].status === 'published') { n++; }
      }
      return n;
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
