/* ============================================================================
   CyberPulseAcademy - assets/js/nav.js
   The single definition of the site chrome. Every page ships an empty
   <header id="cm-header"> and <footer id="cm-footer">; this file fills them.

   Why the navigation is built here instead of being pasted into 20 HTML files:
   a nav copied into 20 files drifts within a month, and a broken nav is worse
   than a nav that needs JavaScript. A <noscript> block in each page provides
   plain catalog links, and the sitemap gives crawlers the full graph, so the
   trade is deliberate and documented.

   Also handles: theme toggle with persistence, the identity chip, mobile
   drawer, active-link marking, and hover/focus prefetching of likely next
   pages so navigation feels instant on GitHub Pages.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  var THEME_KEY = 'cm.theme.v1';

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }

  /* ------------------------------------------------------------- icon set */
  /* Inline SVG only. No icon font, no sprite request, no CDN. Every icon is
     aria-hidden because it always accompanies a text label: colour and shape
     are never the only signal. */
  var ICONS = {
    shield: 'M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    menu: 'M3 6h18M3 12h18M3 18h18',
    close: 'M18 6 6 18M6 6l12 12',
    chevron: 'M6 9l6 6 6-6',
    external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
    award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    bug: 'M8 2v3M16 2v3M3 8h3M18 8h3M4 14h16M8 20a4 4 0 0 1-4-4v-2h16v2a4 4 0 0 1-4 4M12 22v-2',
    chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
    users: 'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    check: 'M20 6 9 17l-5-5',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3'
  };

  function svg(name, extraClass) {
    var path = ICONS[name] || ICONS.info;
    return '<svg class="' + (extraClass || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
           '<path d="' + path + '"/></svg>';
  }

  /* ------------------------------------------------------- nav definition */
  var NAV = [
    { key: 'nav.home', href: 'index.html' },
    { key: 'nav.keywords', href: 'pages/keywords.html' },
    { key: 'nav.certifications', href: 'pages/certifications.html' },
    {
      key: 'nav.mitre', href: 'pages/mitre-tactics.html',
      children: [
        { key: 'nav.tactics', href: 'pages/mitre-tactics.html' },
        { key: 'nav.techniques', href: 'pages/mitre-techniques.html' },
        { key: 'nav.mitigations', href: 'pages/mitre-mitigations.html' },
        { key: 'nav.detections', href: 'pages/mitre-detections.html' },
        { key: 'nav.groups', href: 'pages/mitre-groups.html' }
      ]
    },
    { key: 'nav.coverage', href: 'pages/coverage.html' },
    { key: 'nav.stats', href: 'pages/stats.html' },
    { key: 'nav.support', href: 'pages/support.html' },
    { key: 'nav.about', href: 'pages/about.html' }
  ];

  var FOOTER = {
    legal: [
      { key: 'footer.terms', href: 'pages/terms.html' },
      { key: 'footer.privacy', href: 'pages/privacy.html' },
      { key: 'footer.cookies', href: 'pages/cookies.html' },
      { key: 'footer.disclaimerLink', href: 'pages/disclaimer.html' }
    ],
    project: [
      { key: 'nav.about', href: 'pages/about.html' },
      { key: 'nav.coverage', href: 'pages/coverage.html' },
      { key: 'nav.stats', href: 'pages/stats.html' },
      { key: 'nav.contributors', href: 'pages/contributors.html' }
    ],
    catalogs: [
      { key: 'nav.keywords', href: 'pages/keywords.html' },
      { key: 'nav.certifications', href: 'pages/certifications.html' },
      { key: 'nav.tactics', href: 'pages/mitre-tactics.html' },
      { key: 'nav.techniques', href: 'pages/mitre-techniques.html' },
      { key: 'nav.mitigations', href: 'pages/mitre-mitigations.html' },
      { key: 'nav.detections', href: 'pages/mitre-detections.html' },
      { key: 'nav.groups', href: 'pages/mitre-groups.html' }
    ]
  };

  function relHref(href) {
    return CM.util.url(href);
  }

  /* Is this link the page we are on? Compare normalised tails so it works at
     any deployment depth and from an extensionless server URL. */
  function isCurrent(href) {
    var here = location.pathname.replace(/index\.html$/, '');
    var there = relHref(href).replace(location.origin, '').replace(/index\.html$/, '');
    if (here === there) { return true; }
    /* Treat /topics/x.html as current for no primary nav item; treat a topic
       page as belonging to its catalog for the MITRE dropdown only. */
    return false;
  }

  /* ----------------------------------------------------------- theme ---- */
  function currentTheme() {
    var stored = CM.store.storage.get(THEME_KEY, null);
    if (stored === 'light' || stored === 'dark') { return stored; }
    return CM.config.defaultTheme === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') { document.documentElement.setAttribute('data-theme', 'light'); }
    else { document.documentElement.removeAttribute('data-theme'); }
    CM.store.storage.set(THEME_KEY, theme);
    var btn = document.getElementById('cm-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.setAttribute('aria-label', t('theme.toggle') + ' (' + (theme === 'light' ? t('theme.light') : t('theme.dark')) + ')');
      btn.innerHTML = svg(theme === 'light' ? 'moon' : 'sun');
    }
    document.dispatchEvent(new CustomEvent('cm:theme-changed', { detail: { theme: theme } }));
  }

  /* -------------------------------------------------------- prefetch ---- */
  /* Inject <link rel="prefetch"> on hover or focus of an internal link. The
     browser fetches it at idle priority, so the next click is instant. Skips
     if the connection is metered or slow, and never prefetches twice. */
  var prefetched = {};
  function canPrefetch() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { return true; }
    if (conn.saveData) { return false; }
    if (/^(slow-2g|2g)$/.test(String(conn.effectiveType || ''))) { return false; }
    return true;
  }
  function prefetch(href) {
    if (!href || prefetched[href] || !canPrefetch()) { return; }
    if (!/\.html?($|\?)/.test(href)) { return; }
    prefetched[href] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }
  function wirePrefetch(root) {
    var links = root.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      (function (a) {
        var href = a.getAttribute('href');
        if (!href || /^https?:/i.test(href) || href.charAt(0) === '#') { return; }
        var handler = function () { prefetch(a.href); };
        a.addEventListener('mouseenter', handler, { once: true, passive: true });
        a.addEventListener('focus', handler, { once: true });
      })(links[i]);
    }
  }

  /* ------------------------------------------------------------ header -- */
  function renderHeader() {
    var host = document.getElementById('cm-header');
    if (!host) { return; }
    host.className = 'cm-header';
    host.setAttribute('role', 'banner');

    var items = '';
    for (var i = 0; i < NAV.length; i++) {
      var item = NAV[i];
      var href = relHref(item.href);
      var active = isCurrent(item.href) ? ' aria-current="page"' : '';

      if (!item.children) {
        items += '<li class="cm-nav__item"><a class="cm-nav__link" href="' + href + '"' + active + '>' +
                 CM.util.esc(t(item.key)) + '</a></li>';
      } else {
        var menu = '';
        for (var c = 0; c < item.children.length; c++) {
          var child = item.children[c];
          var childActive = isCurrent(child.href) ? ' aria-current="page"' : '';
          menu += '<li><a href="' + relHref(child.href) + '"' + childActive + '>' + CM.util.esc(t(child.key)) + '</a></li>';
        }
        items +=
          '<li class="cm-nav__item" data-open="false">' +
            '<button type="button" class="cm-nav__link cm-nav__toggle" aria-expanded="false" ' +
              'id="cm-nav-mitre">' + CM.util.esc(t(item.key)) +
              '<span class="cm-nav__caret" aria-hidden="true">' + svg('chevron', 'cm-nav__caret') + '</span>' +
            '</button>' +
            '<ul class="cm-nav__menu" aria-labelledby="cm-nav-mitre">' + menu + '</ul>' +
          '</li>';
      }
    }

    host.innerHTML =
      '<div class="cm-wrap cm-header__bar">' +
        '<a class="cm-brand" href="' + relHref('index.html') + '">' +
          '<img class="cm-brand__logo" src="' + CM.util.url('assets/img/logo.png') + '" alt="" width="34" height="34" decoding="async">' +
          '<span class="cm-brand__text">' +
            '<span class="cm-brand__name">' + CM.util.esc(t('site.name')) + '</span>' +
            '<span class="cm-brand__tag">' + CM.util.esc(t('site.brandTag')) + '</span>' +
          '</span>' +
        '</a>' +
        '<nav class="cm-nav" aria-label="' + CM.util.esc(t('nav.primary')) + '">' +
          '<ul class="cm-nav__list">' + items + '</ul>' +
        '</nav>' +
        '<span class="cm-spacer"></span>' +
        '<form class="cm-hsearch" role="search" action="' + relHref('pages/search.html') + '" method="get">' +
          '<label class="cm-vh" for="cm-hsearch-input">' + CM.util.esc(t('search.label')) + '</label>' +
          '<span class="cm-hsearch__icon" aria-hidden="true">' + svg('search') + '</span>' +
          '<input id="cm-hsearch-input" type="search" name="q" placeholder="' + CM.util.esc(t('search.placeholder')) + '" ' +
            'autocomplete="off" title="' + CM.util.esc(t('search.shortcut')) + '">' +
        '</form>' +
        '<button type="button" class="cm-chip-id" id="cm-identity-chip"></button>' +
        '<button type="button" class="cm-iconbtn" id="cm-theme-toggle" aria-pressed="false"></button>' +
        '<button type="button" class="cm-burger" id="cm-burger" aria-expanded="false" aria-controls="cm-drawer" ' +
          'aria-label="' + CM.util.esc(t('nav.openMenu')) + '">' + svg('menu') + '</button>' +
      '</div>' +
      '<div class="cm-drawer" id="cm-drawer" hidden></div>' +
      '<noscript><div class="cm-wrap cm-banner cm-banner--info cm-banner--compact">' +
        '<span>JavaScript is off, so the navigation menu is not drawn. ' +
        'The full catalog is listed in the <a href="' + CM.util.url('sitemap.xml') + '">sitemap</a>.</span>' +
      '</div></noscript>';

    /* --- dropdown behaviour: click, keyboard, and outside click --- */
    var toggle = host.querySelector('.cm-nav__toggle');
    if (toggle) {
      var parent = toggle.closest('.cm-nav__item');
      var setOpen = function (open) {
        parent.setAttribute('data-open', open ? 'true' : 'false');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        setOpen(parent.getAttribute('data-open') !== 'true');
      });
      parent.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { setOpen(false); toggle.focus(); }
      });
      document.addEventListener('click', function (event) {
        if (!parent.contains(event.target)) { setOpen(false); }
      });
      /* Arrow-down from the toggle opens the menu and enters it. */
      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setOpen(true);
          var first = parent.querySelector('.cm-nav__menu a');
          if (first) { first.focus(); }
        }
      });
    }

    /* --- theme toggle --- */
    var themeBtn = host.querySelector('#cm-theme-toggle');
    themeBtn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
    applyTheme(currentTheme());

    /* --- identity chip --- */
    CM.identity.renderChip(host.querySelector('#cm-identity-chip'));

    /* --- mobile drawer --- */
    var burger = host.querySelector('#cm-burger');
    var drawer = host.querySelector('#cm-drawer');
    var drawerHtml = '<h2>' + CM.util.esc(t('nav.primary')) + '</h2><ul>';
    for (var n = 0; n < NAV.length; n++) {
      if (NAV[n].children) {
        drawerHtml += '</ul><h2>' + CM.util.esc(t(NAV[n].key)) + '</h2><ul>';
        for (var m = 0; m < NAV[n].children.length; m++) {
          drawerHtml += '<li><a href="' + relHref(NAV[n].children[m].href) + '">' + CM.util.esc(t(NAV[n].children[m].key)) + '</a></li>';
        }
      } else {
        drawerHtml += '<li><a href="' + relHref(NAV[n].href) + '">' + CM.util.esc(t(NAV[n].key)) + '</a></li>';
      }
    }
    drawerHtml += '</ul><h2>' + CM.util.esc(t('nav.search')) + '</h2><ul>' +
      '<li><a href="' + relHref('pages/search.html') + '">' + CM.util.esc(t('search.label')) + '</a></li>' +
      '</ul>';
    drawer.innerHTML = drawerHtml;

    function setDrawer(open) {
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? t('nav.closeMenu') : t('nav.openMenu'));
      burger.innerHTML = svg(open ? 'close' : 'menu');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
    drawer.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') { setDrawer(false); }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !drawer.hidden) { setDrawer(false); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000 && !drawer.hidden) { setDrawer(false); }
    });

    wirePrefetch(host);
  }

  /* ------------------------------------------------------------ footer -- */
  function renderFooter() {
    var host = document.getElementById('cm-footer');
    if (!host) { return; }
    host.className = 'cm-footer';
    host.setAttribute('role', 'contentinfo');

    function column(title, links) {
      var out = '<h2 class="cm-footer__head">' + CM.util.esc(title) + '</h2><ul class="cm-footer__list">';
      for (var i = 0; i < links.length; i++) {
        out += '<li><a href="' + relHref(links[i].href) + '">' + CM.util.esc(t(links[i].key)) + '</a></li>';
      }
      return out + '</ul>';
    }

    var repoUrl = String(CM.config.repoUrl || '');

    host.innerHTML =
      '<div class="cm-wrap cm-footer__inner">' +
        '<div class="cm-footer__brand">' +
          '<a class="cm-brand" href="' + relHref('index.html') + '">' +
            '<img class="cm-brand__logo" src="' + CM.util.url('assets/img/logo.png') + '" alt="" width="34" height="34" decoding="async" loading="lazy">' +
            '<span class="cm-brand__text"><span class="cm-brand__name">' + CM.util.esc(t('site.name')) + '</span>' +
            '<span class="cm-brand__tag">' + CM.util.esc(t('site.brandTag')) + '</span></span>' +
          '</a>' +
          '<p class="cm-small cm-muted">' + CM.util.esc(t('site.tagline')) + '</p>' +
          '<p class="cm-small cm-dim">' + CM.util.esc(t('footer.license')) + '</p>' +
          '<div class="cm-row cm-mt1">' +
            '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-footer-identity">' +
              svg('user') + CM.util.esc(t('identity.edit')) + '</button>' +
            '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-footer-delete">' +
              CM.util.esc(t('identity.delete')) + '</button>' +
          '</div>' +
        '</div>' +
        '<div>' + column(t('nav.primary'), FOOTER.catalogs) + '</div>' +
        '<div>' + column(t('footer.project'), FOOTER.project.concat([{ key: 'nav.support', href: 'pages/support.html' }])) + '</div>' +
        '<div>' + column(t('footer.legal'), FOOTER.legal) + '</div>' +
      '</div>' +
      '<div class="cm-wrap cm-footer__bottom">' +
        '<p class="cm-small cm-muted cm-mb0">' + CM.util.esc(t('footer.disclaimer')) + ' ' +
          CM.util.esc(t('footer.attackTrademark')) + ' ' +
          '<a href="https://attack.mitre.org/resources/terms-of-use/" target="_blank" rel="noopener noreferrer">' +
            'MITRE Terms of Use' + svg('external') + '</a>' +
        '</p>' +
        '<p class="cm-small cm-mt1 cm-mb0">' +
          '<a href="' + CM.util.esc(repoUrl) + '" target="_blank" rel="noopener noreferrer">' + svg('external') + ' ' +
            CM.util.esc(t('footer.github')) + '</a>' +
          ' <span class="cm-dim" aria-hidden="true">|</span> ' +
          '<a class="cm-donate" href="' + relHref('pages/support.html') + '">' + svg('heart') + ' ' +
            CM.util.esc(t('footer.donate')) + '</a>' +
        '</p>' +
      '</div>';

    var editBtn = host.querySelector('#cm-footer-identity');
    if (editBtn) { editBtn.addEventListener('click', function () { CM.identity.open(); }); }

    var delBtn = host.querySelector('#cm-footer-delete');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        var confirmed = window.confirm(
          'Delete your name, country, theme choice and every recorded score from this browser? This cannot be undone.'
        );
        if (!confirmed) { return; }
        CM.stats.deleteMyData();
        CM.identity.renderChip(document.getElementById('cm-identity-chip'));
        CM.a11y.toast(t('identity.deleted'), 'ok');
        CM.a11y.announce(t('identity.deleted'));
        document.dispatchEvent(new CustomEvent('cm:data-deleted'));
      });
    }

    wirePrefetch(host);
  }

  /* ------------------------------------------------------- global keys -- */
  function wireGlobalShortcuts() {
    document.addEventListener('keydown', function (event) {
      var tag = (event.target && event.target.tagName) || '';
      var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;
      /* "/" focuses the header search, the way most documentation sites work. */
      if (event.key === '/' && !typing) {
        var input = document.getElementById('cm-hsearch-input');
        if (input) { event.preventDefault(); input.focus(); input.select(); }
      }
    });
  }

  function boot() {
    renderHeader();
    renderFooter();
    wireGlobalShortcuts();

    /* The theme toggle and identity chip need translated labels, so redraw
       them once the string bundle resolves. */
    if (CM.i18n) {
      CM.i18n.ready(function () {
        renderHeader();
        renderFooter();
      });
    }

    document.addEventListener('cm:identity-changed', function () {
      CM.identity.renderChip(document.getElementById('cm-identity-chip'));
      CM.stats.announceUser();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  CM.nav = { icons: ICONS, svg: svg, refresh: boot, prefetch: prefetch };
})();
