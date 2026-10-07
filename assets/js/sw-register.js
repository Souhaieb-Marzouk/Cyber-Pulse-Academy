/* ============================================================================
   CyberPulseAcademy - assets/js/sw-register.js
   Registers the service worker and offers an "Install app" button when the
   browser says the site is installable.

   Studying on a commute with no signal is a real use case for this site, and
   offline shell support is cheap on GitHub Pages. Registration is skipped on
   file:// because service workers require a secure context.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key) { return CM.i18n ? CM.i18n.t(key) : key; }

  var deferredPrompt = null;

  function register() {
    if (!('serviceWorker' in navigator)) { return; }
    if (location.protocol === 'file:') { return; }
    if (location.hostname === 'localhost' && location.port === '0') { return; }

    window.addEventListener('load', function () {
      navigator.serviceWorker.register(CM.util.url('service-worker.js'), { scope: CM.ROOT })
        .then(function (registration) {
          if (CM.config.debug) { console.info('[CM] service worker scope:', registration.scope); }

          /* When a new version is waiting, tell the user rather than leaving
             them on stale content with no explanation. */
          registration.addEventListener('updatefound', function () {
            var installing = registration.installing;
            if (!installing) { return; }
            installing.addEventListener('statechange', function () {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                CM.a11y.toast('A new version of CyberPulseAcademy is ready. Reload to use it.', 'ok', 12000);
              }
            });
          });
        })
        ['catch'](function (err) {
          if (CM.config.debug) { console.warn('[CM] service worker registration failed', err); }
        });
    });
  }

  function installButton() {
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      var host = document.getElementById('cm-install');
      if (!host) { return; }
      host.hidden = false;
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest || !event.target.closest('#cm-install')) { return; }
      if (!deferredPrompt) {
        CM.a11y.toast('Use your browser menu and choose "Install app" or "Add to Home Screen".', 'ok');
        return;
      }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') {
          CM.a11y.toast('Installed. CyberPulseAcademy will now open like an app.', 'ok');
          var host = document.getElementById('cm-install');
          if (host) { host.hidden = true; }
        }
        deferredPrompt = null;
      });
    });
  }

  function offlineNotice() {
    window.addEventListener('offline', function () {
      CM.a11y.toast('You are offline. Cached pages and the catalog still work.', 'warn');
    });
    window.addEventListener('online', function () {
      CM.a11y.toast('Back online.', 'ok');
    });
  }

  register();
  installButton();
  offlineNotice();

  CM.pwa = { isStandalone: function () { return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches; } };
})();
