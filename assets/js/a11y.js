/* ============================================================================
   CyberPulseAcademy - assets/js/a11y.js
   Accessibility layer. Loaded on every page, before the feature modules.

     * prefers-reduced-motion is respected both in CSS and by suppressing
       animated scroll behaviour here.
     * A polite aria-live region is provided for score and feedback updates, so
       a screen reader hears results without the page stealing focus.
     * a11y.dragToKeyboard() gives every drag interaction a click-to-select /
       click-to-place fallback. Pointer Events do not help a keyboard-only
       user, and drag and drop is exactly the kind of feature that silently
       excludes people.
     * Storage degradation and the storage notice are handled here, because
       every module needs them and none of them should crash.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key) { return CM.i18n ? CM.i18n.t(key) : key; }

  var A11y = {
    reduceMotion: false,

    /* ---------------------------------------------------------- announce */
    /* Write a message to the shared live region. `assertive` is reserved for
       genuine failures; scores and confirmations stay polite so they do not
       interrupt whatever the user is reading. */
    announce: function (message, assertive) {
      var region = document.getElementById(assertive ? 'cm-live-assertive' : 'cm-live-polite');
      if (!region) { return; }
      /* Clearing first guarantees repeat announcements are still spoken. */
      region.textContent = '';
      setTimeout(function () { region.textContent = String(message); }, 40);
    },

    /* -------------------------------------------------------- live regions */
    ensureLiveRegions: function () {
      if (!document.getElementById('cm-live-polite')) {
        var polite = document.createElement('div');
        polite.id = 'cm-live-polite';
        polite.className = 'cm-vh';
        polite.setAttribute('role', 'status');
        polite.setAttribute('aria-live', 'polite');
        polite.setAttribute('aria-atomic', 'true');
        document.body.appendChild(polite);
      }
      if (!document.getElementById('cm-live-assertive')) {
        var assertive = document.createElement('div');
        assertive.id = 'cm-live-assertive';
        assertive.className = 'cm-vh';
        assertive.setAttribute('role', 'alert');
        assertive.setAttribute('aria-live', 'assertive');
        assertive.setAttribute('aria-atomic', 'true');
        document.body.appendChild(assertive);
      }
    },

    /* ------------------------------------------------------------- toasts */
    toast: function (message, kind, timeoutMs) {
      var host = document.getElementById('cm-toasts');
      if (!host) {
        host = document.createElement('div');
        host.id = 'cm-toasts';
        host.className = 'cm-toasts';
        host.setAttribute('aria-live', 'polite');
        host.setAttribute('aria-atomic', 'false');
        document.body.appendChild(host);
      }
      var node = document.createElement('div');
      node.className = 'cm-toast' + (kind ? ' cm-toast--' + kind : '');
      node.innerHTML = CM.util.esc(message);
      host.appendChild(node);
      var life = timeoutMs || 6000;
      setTimeout(function () {
        node.style.opacity = '0';
        setTimeout(function () { if (node.parentNode) { node.parentNode.removeChild(node); } }, 250);
      }, life);
      return node;
    },

    /* ----------------------------------------------- keyboard drag helper */
    /* Usage:
         A11y.dragToKeyboard({
           container: el,          // holds the draggable items and drop zones
           itemSelector: '[data-drag]',
           zoneSelector: '[data-drop]',
           onDrop: function (itemEl, zoneEl) { ... }
         });
       Behaviour: pressing Enter or Space on an item selects it (aria-pressed
       becomes true and a live announcement is made). Moving focus to a zone
       and pressing Enter or Space places it. Escape cancels. This is the
       accessible equivalent of the Pointer Events drag, and it is the path
       that must be tested on a phone as well as with a keyboard. */
    dragToKeyboard: function (options) {
      var opts = options || {};
      var container = opts.container;
      if (!container) { return null; }
      var itemSel = opts.itemSelector || '[data-drag]';
      var zoneSel = opts.zoneSelector || '[data-drop]';
      var selected = null;

      function setSelected(node) {
        var previous = container.querySelectorAll(itemSel + '[aria-pressed="true"]');
        for (var i = 0; i < previous.length; i++) { previous[i].setAttribute('aria-pressed', 'false'); }
        selected = node;
        if (node) {
          node.setAttribute('aria-pressed', 'true');
          A11y.announce('Selected ' + (node.getAttribute('data-label') || node.textContent.trim()) + '. Move to a target and press Enter to place it.');
        }
      }

      function onKeydown(event) {
        var item = event.target.closest ? event.target.closest(itemSel) : null;
        var zone = event.target.closest ? event.target.closest(zoneSel) : null;

        if (event.key === 'Escape' && selected) {
          setSelected(null);
          A11y.announce('Selection cancelled.');
          return;
        }
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') { return; }

        if (item && item === event.target) {
          event.preventDefault();
          if (selected === item) { setSelected(null); }
          else { setSelected(item); }
          return;
        }
        if (zone && selected) {
          event.preventDefault();
          var moved = selected;
          setSelected(null);
          if (typeof opts.onDrop === 'function') { opts.onDrop(moved, zone); }
          A11y.announce('Placed ' + (moved.getAttribute('data-label') || moved.textContent.trim()) +
                        ' in ' + (zone.getAttribute('data-label') || zone.textContent.trim()) + '.');
        }
      }

      container.addEventListener('keydown', onKeydown);
      return { cancel: function () { setSelected(null); }, getSelected: function () { return selected; } };
    },

    /* -------------------------------------------------- reduced motion ---- */
    applyReduceMotion: function () {
      A11y.reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (A11y.reduceMotion) {
        document.documentElement.setAttribute('data-reduce-motion', 'true');
      }
      if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        var handler = function (event) {
          A11y.reduceMotion = event.matches;
          if (event.matches) { document.documentElement.setAttribute('data-reduce-motion', 'true'); }
          else { document.documentElement.removeAttribute('data-reduce-motion'); }
        };
        if (mq.addEventListener) { mq.addEventListener('change', handler); }
        else if (mq.addListener) { mq.addListener(handler); }
      }
    },

    /* --------------------------------------------------- focus management */
    /* Move focus to a heading or container without scrolling the page wildly.
       Used after in-page navigation such as switching an exercise batch. */
    focusHeading: function (node) {
      if (!node) { return; }
      if (!node.hasAttribute('tabindex')) { node.setAttribute('tabindex', '-1'); }
      node.focus({ preventScroll: false });
    },

    /* ----------------------------------------------------- skip link ------ */
    ensureSkipLink: function () {
      var main = document.getElementById('cm-main');
      if (main && !main.hasAttribute('tabindex')) { main.setAttribute('tabindex', '-1'); }
    },

    /* ----------------------------------------- storage + consent notices -- */
    notices: function () {
      var host = document.getElementById('cm-notices');
      if (!host) { return; }

      function makeNotice(id, message, actionHtml) {
        if (document.getElementById(id)) { return null; }
        var node = document.createElement('div');
        node.className = 'cm-notice';
        node.id = id;
        node.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>' +
          '<div>' + message + (actionHtml || '') + '</div>' +
          '<button type="button" class="cm-notice__close" aria-label="' + CM.util.esc(t('action.close')) + '">&times;</button>';
        node.querySelector('.cm-notice__close').addEventListener('click', function () {
          node.hidden = true;
          CM.store.storage.set('cm.notice.dismissed.' + id, true);
        });
        host.appendChild(node);
        return node;
      }

      /* (a) Local storage is unavailable. Non-blocking, once per session. */
      if (CM.store.storage.isDegraded() && !CM.store.storage.get('cm.notice.dismissed.cm-notice-storage', false)) {
        makeNotice('cm-notice-storage', CM.util.esc(t('storage.warning')));
      }

      /* (b) Consent notice on first visit. Dismissible and non-blocking: it
             never covers content and it never gates a page. */
      var consentChoice = CM.store.storage.get('cm.consent.v1', null);
      if (!consentChoice && !CM.store.storage.get('cm.notice.dismissed.cm-notice-consent', false)) {
        var node = makeNotice(
          'cm-notice-consent',
          '<strong>' + CM.util.esc(t('consent.title')) + '.</strong> ' + CM.util.esc(t('consent.body')),
          ' <a href="' + CM.util.url('pages/cookies.html') + '">' + CM.util.esc(t('consent.more')) + '</a>'
        );
        if (node) {
          var accept = document.createElement('button');
          accept.type = 'button';
          accept.className = 'cm-btn cm-btn--ghost cm-btn--sm cm-mt1';
          accept.textContent = t('consent.accept');
          accept.addEventListener('click', function () {
            CM.store.storage.set('cm.consent.v1', { accepted: true, at: new Date().toISOString(), version: 'v1' });
            node.hidden = true;
          });
          node.querySelector('div').appendChild(document.createElement('br'));
          node.querySelector('div').appendChild(accept);
        }
      }
    }
  };

  CM.a11y = A11y;

  A11y.applyReduceMotion();
  A11y.ensureLiveRegions();
  A11y.ensureSkipLink();

  document.addEventListener('DOMContentLoaded', function () {
    /* The notices are built from translated strings, and the dictionary is
       fetched asynchronously. Building them before it arrives makes every
       string fall back to its raw key, which is why the consent notice showed
       "consent.accept" on its button. nav.js already waits the same way; this
       block was the one place that did not. CM.i18n.ready runs the callback
       immediately when the bundle is already loaded, so nothing is delayed on
       a warm cache. */
    CM.i18n.ready(function () {
      A11y.notices();
    });
  });

  /* A storage failure detected later in the session still gets a notice. */
  document.addEventListener('cm:storage-degraded', function () {
    CM.i18n.ready(function () {
      A11y.notices();
    });
  });
})();
