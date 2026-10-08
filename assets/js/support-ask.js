/* Support ask on the home page.
 *
 * A one-time, dismissible panel that states the funding promise plainly. It is
 * not a modal and it does not gate anything: it sits above the hero, and the
 * page is fully usable whether it is shown or dismissed.
 *
 * The panel is hidden in the markup and revealed here, so a browser without
 * JavaScript never sees a call to action it cannot act on, and a returning
 * visitor who dismissed it never sees it again.
 *
 * Nothing about the visitor is stored except the single fact that they dismissed
 * this panel. No identifier, no counter, nothing that leaves the browser.
 */
(function () {
  'use strict';

  var DISMISS_KEY = 'cm.ask.support.dismissed';

  function start() {
    var panel = document.getElementById('cm-support-ask');
    if (!panel || !CM.store || !CM.store.storage) {
      return;
    }

    /* Already dismissed, or storage is unusable so we cannot remember a
       dismissal. Showing it again on every page load in that case would be
       worse than not showing it at all. */
    if (CM.store.storage.get(DISMISS_KEY, false) || CM.store.storage.isDegraded()) {
      return;
    }

    /* Point the button at the configured donation page. Support is asked for in
       whole euros, so five is the smallest amount that clears the minimum. */
    var donate = document.getElementById('cm-ask-donate');
    if (donate) {
      var url = null;
      try {
        if (CM.util && CM.util.donateUrl) {
          url = CM.util.donateUrl(CM.config.donationMinAmount || 5);
        }
      } catch (error) {
        url = null;
      }
      if (url) {
        donate.href = url;
        donate.target = '_blank';
        donate.rel = 'noopener noreferrer';
      } else {
        /* Without a configured donation URL, send the visitor to the support
           page rather than to a dead link. */
        donate.href = CM.util.url('pages/support.html');
      }
    }

    panel.hidden = false;

    var dismiss = document.getElementById('cm-ask-dismiss');
    if (dismiss) {
      dismiss.addEventListener('click', function () {
        panel.hidden = true;
        CM.store.storage.set(DISMISS_KEY, true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
