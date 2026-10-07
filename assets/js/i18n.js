/* ============================================================================
   CyberPulseAcademy - assets/js/i18n.js
   Tiny translation helper. All UI strings live in assets/i18n/<locale>.json as
   flat dotted keys. Adding fr.json is a drop-in: no code changes at all.
   Retrofitting i18n after the HTML is written is painful, so it exists from
   the first commit even though only English ships.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  var strings = {};
  var loaded = false;
  var waiters = [];
  var LOCALE_KEY = 'cm.locale.v1';

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function resolveLocale() {
    var wanted = safeGet(LOCALE_KEY) || CM.config.locale || 'en';
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(wanted)) { wanted = 'en'; }
    return wanted;
  }

  var I18N = {
    locale: resolveLocale(),

    /* Load a locale bundle. Resolves even if the file is missing, because a
       missing translation must never break a page: the key is shown instead. */
    load: function (locale) {
      var target = locale || I18N.locale;
      return CM.util.fetchJSON(CM.util.versioned('assets/i18n/' + target + '.json'), 4000)
        .then(function (data) {
          strings = (data && typeof data === 'object') ? data : {};
          I18N.locale = target;
          loaded = true;
          return strings;
        })
        ['catch'](function () {
          if (target !== 'en') {
            return CM.util.fetchJSON(CM.util.versioned('assets/i18n/en.json'), 4000)
              .then(function (data) { strings = data || {}; I18N.locale = 'en'; loaded = true; return strings; })
              ['catch'](function () { strings = {}; loaded = true; return strings; });
          }
          strings = {};
          loaded = true;
          return strings;
        });
    },

    isLoaded: function () { return loaded; },

    /* Translate a key, with {placeholder} interpolation.
       t('batch.best', { pct: '92%' }) */
    t: function (key, vars) {
      var out = Object.prototype.hasOwnProperty.call(strings, key) ? strings[key] : null;
      if (out === null || out === undefined) { return key; }
      if (vars) {
        out = String(out).replace(/\{(\w+)\}/g, function (match, name) {
          return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
        });
      }
      return out;
    },

    /* Apply translations to any element carrying data-i18n="key".
       data-i18n-attr="aria-label:some.key" sets attributes instead of text. */
    apply: function (rootNode) {
      var scope = rootNode || document;
      var nodes = scope.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = I18N.t(nodes[i].getAttribute('data-i18n'));
      }
      var attrNodes = scope.querySelectorAll('[data-i18n-attr]');
      for (var j = 0; j < attrNodes.length; j++) {
        var spec = attrNodes[j].getAttribute('data-i18n-attr').split(',');
        for (var k = 0; k < spec.length; k++) {
          var parts = spec[k].split(':');
          if (parts.length === 2) {
            attrNodes[j].setAttribute(parts[0].trim(), I18N.t(parts[1].trim()));
          }
        }
      }
      return scope;
    },

    /* Run a callback once strings are available, then again never. */
    ready: function (fn) {
      if (loaded) { fn(strings); return; }
      waiters.push(fn);
    },

    setLocale: function (locale) {
      safeSet(LOCALE_KEY, locale);
      return I18N.load(locale);
    },

    available: ['en']
  };

  /* Global shorthand used throughout the HTML templates. */
  window.t = I18N.t;

  CM.i18n = I18N;

  /* Kick off the load immediately and flush any queued callbacks. */
  I18N.load().then(function () {
    var queue = waiters.slice();
    waiters.length = 0;
    for (var i = 0; i < queue.length; i++) {
      try { queue[i](strings); } catch (e) { if (CM.config.debug) { console.error(e); } }
    }
    I18N.apply(document);
    document.dispatchEvent(new CustomEvent('cm:i18n-ready', { detail: { locale: I18N.locale } }));
  });
})();
