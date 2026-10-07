/* ============================================================================
   CyberPulseAcademy - assets/js/catalog-render.js
   Renders every listing page from data/catalog.json. No page hard-codes a
   topic, a count, or a theme: if it appears on screen it came from the
   manifest.

   Public API:
     CM.render.catalogList(options)   the searchable, filterable card grid
     CM.render.coverage(options)      the coverage dashboard
     CM.render.stats(options)         the statistics page
     CM.render.related(options)       relation blocks on a topic page

   Two rules are enforced here rather than merely documented:

   1. NO VENDOR LOGOS, EVER. renderCard() refuses to emit an <img>, <picture>
      or <object> inside a certification card. Certification logos imply an
      affiliation that does not exist, and that is the single most common
      trigger for a takedown request against a project like this. The guard
      runs on the generated markup, so a future contributor cannot reintroduce
      one by editing a template.
   2. Colour is never the only signal. Every status carries an icon or a text
      label as well as a colour.

   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }
  function esc(v) { return CM.util.esc(v); }

  /* Highest-contrast path to a topic's own page, correct at any depth. */
  function topicHref(id) { return CM.util.url('topics/' + id + '.html'); }

  var CATALOG_META = {
    keyword: { path: 'pages/keywords.html', labelKey: 'nav.keywords' },
    certification: { path: 'pages/certifications.html', labelKey: 'nav.certifications' },
    tactic: { path: 'pages/mitre-tactics.html', labelKey: 'nav.tactics' },
    technique: { path: 'pages/mitre-techniques.html', labelKey: 'nav.techniques' },
    mitigation: { path: 'pages/mitre-mitigations.html', labelKey: 'nav.mitigations' },
    detection: { path: 'pages/mitre-detections.html', labelKey: 'nav.detections' },
    group: { path: 'pages/mitre-groups.html', labelKey: 'nav.groups' }
  };

  /* ------------------------------------------------------------ helpers -- */

  function difficultyBadge(topic) {
    var d = topic.difficulty || 'extreme';
    var label = t('status.difficulty.' + d);
    return '<span class="cm-badge cm-badge--' + esc(d) + '">' +
           CM.nav.svg('alert') + esc(label) + '</span>';
  }

  function batchDots(topic) {
    var published = CM.util.publishedCount(topic);
    var pips = '';
    for (var i = 0; i < 3; i++) {
      var b = (topic.batches && topic.batches[i]) ? topic.batches[i] : null;
      var cls = 'cm-batchdot__pip';
      if (b && b.status === 'published') { cls += ' cm-batchdot__pip--on'; }
      else if (b && b.status === 'draft') { cls += ' cm-batchdot__pip--draft'; }
      pips += '<span class="' + cls + '"></span>';
    }
    /* Text label alongside the pips: the colour is never the only signal. */
    var text = published === 3
      ? t('status.publishedCount', { n: 3 })
      : t('status.batchPips', { n: published });
    return '<span class="cm-batchdot" title="' + esc(text) + '">' +
             '<span class="cm-batchdot__pips" aria-hidden="true">' + pips + '</span>' +
             '<span class="cm-batchdot__label">' + esc(published + '/3 batches') + '</span>' +
           '</span>';
  }

  /* The certification logo guard. Documented at the top of this file. A fresh
     regex is built per call so that the global flag cannot leak state between
     invocations through lastIndex. */
  function stripVendorLogos(html, topic) {
    var pattern = /<\s*(img|picture|object|embed)[^>]*>/gi;
    if (!pattern.test(html)) { return html; }
    if (CM.config.debug) {
      console.warn('[CM] Vendor logo markup removed from certification card:', topic && topic.id);
    }
    return html.replace(/<\s*(img|picture|object|embed)[^>]*>/gi, '');
  }

  function renderCard(topic, options) {
    var opts = options || {};
    var isCert = topic.type === 'certification';
    var meta = CATALOG_META[topic.type] || CATALOG_META.keyword;

    var badges = '';
    if (topic.externalId) {
      badges += '<span class="cm-badge cm-badge--id">' + esc(topic.externalId) + '</span> ';
    }
    badges += '<span class="cm-badge cm-badge--theme">' + esc(topic.theme) + '</span> ';
    badges += difficultyBadge(topic);
    /* Certification cards carry the unofficial badge permanently. */
    if (isCert) {
      badges += ' <span class="cm-badge cm-badge--unofficial">' + esc(t('status.unofficial')) + '</span>';
    }
    if (topic.severity) {
      badges += ' <span class="cm-badge cm-badge--warn">' + esc(topic.severity) + '</span>';
    }

    var tags = '';
    if (Array.isArray(topic.tags) && topic.tags.length) {
      tags = '<ul class="cm-chips cm-mt1" aria-label="Tags">' + topic.tags.slice(0, 5).map(function (tag) {
        return '<li><a href="' + CM.util.url('pages/search.html') + '?q=' + encodeURIComponent(tag) + '">' + esc(tag) + '</a></li>';
      }).join('') + '</ul>';
    }

    /* A short excerpt from the summary. Certifications get one extra line of
       the attribution note so the disclaimer travels with the card. */
    var excerpt = String(topic.summary || '');
    if (excerpt.length > 165) { excerpt = excerpt.slice(0, 162).replace(/\s+\S*$/, '') + '...'; }

    var extra = '';
    if (isCert && topic.objectives && topic.objectives.length) {
      extra = '<p class="cm-tiny cm-dim cm-mt1">' + esc(topic.objectives.length + ' exam domains summarised') + '</p>';
    }
    if (topic.type === 'technique' && topic.parentTactic) {
      extra = '<p class="cm-tiny cm-dim cm-mt1">' + esc('Parent tactic: ' + String(topic.parentTactic).toUpperCase()) +
              (topic.isSubTechnique ? ' \u00B7 sub-technique' : '') + '</p>';
    }
    if (topic.type === 'detection' && topic.techniqueId) {
      extra = '<p class="cm-tiny cm-dim cm-mt1">' + esc('Primary technique: ' + String(topic.techniqueId).toUpperCase()) + '</p>';
    }
    if (topic.type === 'mitigation' && Array.isArray(topic.mitigatesTechniques)) {
      extra = '<p class="cm-tiny cm-dim cm-mt1">' + esc('Covers ' + topic.mitigatesTechniques.length + ' techniques') + '</p>';
    }
    if (topic.type === 'group' && Array.isArray(topic.aliases) && topic.aliases.length) {
      extra = '<p class="cm-tiny cm-dim cm-mt1">' + esc('Also tracked as: ' + topic.aliases.slice(0, 3).join(', ')) + '</p>';
    }

    var html =
      '<article class="cm-card cm-card--hover cm-card--link" data-id="' + esc(topic.id) + '">' +
        '<div class="cm-card__head">' +
          '<h3 class="cm-card__title"><a href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a></h3>' +
        '</div>' +
        '<div class="cm-card__body">' +
          '<div class="cm-row cm-mb1">' + badges + '</div>' +
          '<p>' + esc(excerpt) + '</p>' +
          extra +
          tags +
        '</div>' +
        '<div class="cm-card__foot">' +
          batchDots(topic) +
          '<span class="cm-spacer"></span>' +
          '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + topicHref(topic.id) + '">' +
            esc(t('action.start')) + '</a>' +
        '</div>' +
      '</article>';

    /* Enforced, not merely intended. */
    if (isCert) { html = stripVendorLogos(html, topic); }
    return html;
  }

  /* --------------------------------------------------------- filtering --- */
  function readState(options) {
    var defaults = {
      q: '',
      themes: [],
      batches: null,
      sort: options.defaultSort || 'title'
    };
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('q')) { defaults.q = params.get('q'); }
      if (params.get('theme')) { defaults.themes = String(params.get('theme')).split(',').filter(Boolean); }
      if (params.get('batches')) { defaults.batches = parseInt(params.get('batches'), 10); }
      if (params.get('sort')) { defaults.sort = params.get('sort'); }
    } catch (e) { /* no query string support: use defaults */ }
    return defaults;
  }

  function writeState(state) {
    try {
      var params = new URLSearchParams();
      if (state.q) { params.set('q', state.q); }
      if (state.themes.length) { params.set('theme', state.themes.join(',')); }
      if (state.batches !== null && state.batches !== undefined) { params.set('batches', String(state.batches)); }
      if (state.sort && state.sort !== 'title') { params.set('sort', state.sort); }
      var qs = params.toString();
      var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
      history.replaceState(null, '', url);
    } catch (e) { /* ignore: filters still work, they just are not shareable */ }
  }

  function applyFilters(topics, state) {
    var q = state.q.trim().toLowerCase();
    var terms = q ? q.split(/\s+/).filter(Boolean) : [];

    var out = topics.filter(function (topic) {
      if (state.themes.length && state.themes.indexOf(topic.theme) === -1) { return false; }
      if (state.batches !== null && state.batches !== undefined) {
        if (CM.util.publishedCount(topic) !== state.batches) { return false; }
      }
      if (terms.length) {
        var haystack = [topic.title, topic.shortTitle, topic.id, topic.externalId, topic.theme]
          .concat(topic.tags || [])
          .join(' ').toLowerCase();
        for (var i = 0; i < terms.length; i++) {
          if (haystack.indexOf(terms[i]) === -1) { return false; }
        }
      }
      return true;
    });

    out.sort(function (a, b) {
      if (state.sort === 'batches') {
        var diff = CM.util.publishedCount(b) - CM.util.publishedCount(a);
        if (diff !== 0) { return diff; }
      } else if (state.sort === 'reviewed') {
        var cmp = String(b.lastReviewed || '').localeCompare(String(a.lastReviewed || ''));
        if (cmp !== 0) { return cmp; }
      } else if (state.sort === 'difficulty') {
        var order = { extreme: 0, 'very-hard': 1, hard: 2 };
        var da = order[a.difficulty] === undefined ? 3 : order[a.difficulty];
        var db = order[b.difficulty] === undefined ? 3 : order[b.difficulty];
        if (da !== db) { return da - db; }
      }
      return String(a.title).localeCompare(String(b.title));
    });

    return out;
  }

  /* ------------------------------------------------------ main entry ----- */
  function catalogList(options) {
    var opts = options || {};
    var mount = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!mount) { return Promise.resolve(); }

    mount.setAttribute('aria-busy', 'true');
    mount.innerHTML = '<div class="cm-state"><div class="cm-spinner" role="presentation"></div>' +
      '<p class="cm-mt2">' + esc(t('a11y.loading')) + '</p></div>';

    return CM.store.getCatalog().then(function (catalog) {
      var topics = catalog.topics.filter(function (topic) {
        return !opts.type || topic.type === opts.type;
      });

      if (topics.length === 0) {
        mount.innerHTML = '<div class="cm-state">' + CM.nav.svg('info') +
          '<h3>' + esc('Nothing here yet') + '</h3>' +
          '<p>' + esc('This catalog has no entries in the manifest. Run scripts/build_catalog.py after adding data files.') + '</p></div>';
        return;
      }

      var allThemes = [];
      var themeCounts = {};
      topics.forEach(function (topic) {
        if (!themeCounts[topic.theme]) { themeCounts[topic.theme] = 0; allThemes.push(topic.theme); }
        themeCounts[topic.theme]++;
      });
      allThemes.sort(function (a, b) { return a.localeCompare(b); });

      var state = readState(opts);

      /* ---- shell ---- */
      mount.innerHTML =
        '<div class="cm-split' + (opts.hideSidebar ? '' : ' cm-split--sidebar') + '">' +
          (opts.hideSidebar ? '' : '<aside class="cm-filters" aria-label="' + esc(t('filter.theme')) + '" id="cm-filter-mount"></aside>') +
          '<div>' +
            '<div class="cm-toolbar" role="search">' +
              '<div class="cm-toolbar__search">' +
                '<label class="cm-vh" for="cm-list-search">' + esc(t('search.label')) + '</label>' +
                '<input class="cm-input" id="cm-list-search" type="search" autocomplete="off" ' +
                  'placeholder="' + esc(t('search.placeholder')) + '" value="' + esc(state.q) + '">' +
              '</div>' +
              '<label class="cm-vh" for="cm-list-sort">' + esc(t('filter.sort')) + '</label>' +
              '<select class="cm-select" id="cm-list-sort" style="width:auto;min-width:190px">' +
                '<option value="title">' + esc(t('filter.sortTitle')) + '</option>' +
                '<option value="batches">' + esc(t('filter.sortBatches')) + '</option>' +
                '<option value="difficulty">' + esc(t('status.difficulty')) + '</option>' +
                '<option value="reviewed">' + esc(t('filter.sortReviewed')) + '</option>' +
              '</select>' +
              '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-clear-filters">' +
                esc(t('action.clearFilters')) + '</button>' +
            '</div>' +
            '<p class="cm-small cm-muted" id="cm-list-count" role="status" aria-live="polite"></p>' +
            '<div class="cm-grid cm-grid--3" id="cm-list-grid"></div>' +
          '</div>' +
        '</div>';

      var sidebar = mount.querySelector('#cm-filter-mount');
      var grid = mount.querySelector('#cm-list-grid');
      var countEl = mount.querySelector('#cm-list-count');
      var searchInput = mount.querySelector('#cm-list-search');
      var sortSelect = mount.querySelector('#cm-list-sort');

      sortSelect.value = state.sort;

      if (sidebar) {
        var themeHtml = '<fieldset><legend>' + esc(t('filter.theme')) + '</legend>';
        allThemes.forEach(function (theme) {
          var checked = state.themes.indexOf(theme) !== -1 ? ' checked' : '';
          themeHtml += '<label><input type="checkbox" value="' + esc(theme) + '"' + checked + '>' +
                       '<span>' + esc(theme) + '</span>' +
                       '<span class="cm-filters__count">' + themeCounts[theme] + '</span></label>';
        });
        themeHtml += '</fieldset>';

        themeHtml += '<fieldset><legend>' + esc(t('filter.batches')) + '</legend>';
        ['0', '1', '2', '3'].forEach(function (n) {
          var checked = String(state.batches) === n ? ' checked' : '';
          themeHtml += '<label><input type="radio" name="cm-batches" value="' + n + '"' + checked + '>' +
                       '<span>' + esc(t('coverage.need' + n)) + '</span></label>';
        });
        themeHtml += '<label><input type="radio" name="cm-batches" value=""' +
                     (state.batches === null ? ' checked' : '') + '><span>' + esc('Any') + '</span></label>';
        themeHtml += '</fieldset>';

        themeHtml += '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm cm-btn--block" id="cm-clear-filters-2">' +
                     esc(t('action.clearFilters')) + '</button>';
        sidebar.innerHTML = themeHtml;
      }

      function render() {
        var visible = applyFilters(topics, state);
        grid.innerHTML = visible.map(function (topic) { return renderCard(topic, opts); }).join('');
        countEl.textContent = t('filter.results', { shown: visible.length, total: topics.length });
        if (visible.length === 0) {
          grid.innerHTML = '<div class="cm-state" style="grid-column:1/-1">' + CM.nav.svg('search') +
            '<h3>' + esc(t('search.noResults')) + '</h3><p>' + esc(t('search.noResultsHint')) + '</p>' +
            '<p class="cm-mt2"><button type="button" class="cm-btn cm-btn--primary" id="cm-clear-filters-3">' +
            esc(t('action.clearFilters')) + '</button></p></div>';
        }
        writeState(state);
        wireInternal(grid);
      }

      function wireInternal(root) {
        var links = root.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
          (function (a) {
            a.addEventListener('mouseenter', function () { CM.nav.prefetch(a.href); }, { once: true, passive: true });
          })(links[i]);
        }
      }

      searchInput.addEventListener('input', CM.util.debounce(function () {
        state.q = searchInput.value;
        render();
      }, 180));

      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        render();
      });

      if (sidebar) {
        sidebar.addEventListener('change', function (event) {
          var input = event.target;
          if (input.type === 'checkbox') {
            var value = input.value;
            var idx = state.themes.indexOf(value);
            if (input.checked && idx === -1) { state.themes.push(value); }
            else if (!input.checked && idx !== -1) { state.themes.splice(idx, 1); }
          } else if (input.type === 'radio' && input.name === 'cm-batches') {
            state.batches = input.value === '' ? null : parseInt(input.value, 10);
          }
          render();
        });
      }

      function clearAll() {
        state.q = ''; state.themes = []; state.batches = null; state.sort = 'title';
        searchInput.value = ''; sortSelect.value = 'title';
        if (sidebar) {
          sidebar.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
          var any = sidebar.querySelector('input[value=""]');
          if (any) { any.checked = true; }
        }
        render();
        CM.a11y.announce('Filters cleared. Showing all ' + topics.length + ' topics.');
      }

      mount.addEventListener('click', function (event) {
        if (event.target.id && event.target.id.indexOf('cm-clear-filters') === 0) { clearAll(); }
      });

      mount.removeAttribute('aria-busy');
      render();
    })['catch'](function (err) {
      mount.removeAttribute('aria-busy');
      mount.innerHTML =
        '<div class="cm-state">' + CM.nav.svg('alert') +
          '<h3>' + esc(t('error.catalog.title')) + '</h3>' +
          '<p>' + esc(t('error.catalog.body')) + '</p>' +
          '<p class="cm-mt2"><button type="button" class="cm-btn cm-btn--primary" id="cm-catalog-retry">' +
            esc(t('action.retry')) + '</button></p>' +
        '</div>';
      var retry = mount.querySelector('#cm-catalog-retry');
      if (retry) {
        retry.addEventListener('click', function () { catalogList(opts); });
      }
      if (CM.config.debug) { console.error('[CM] catalog load failed', err); }
    });
  }

  /* -------------------------------------------------------- coverage ----- */
  function coverage(options) {
    var opts = options || {};
    var mount = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!mount) { return Promise.resolve(); }

    mount.setAttribute('aria-busy', 'true');
    mount.innerHTML = '<div class="cm-state"><div class="cm-spinner" role="presentation"></div>' +
      '<p class="cm-mt2">' + esc(t('a11y.loading')) + '</p></div>';

    return CM.store.getCatalog().then(function (catalog) {
      var totals = { topics: catalog.topics.length, published: 0, missing: 0, complete: 0 };
      var byType = {};

      catalog.topics.forEach(function (topic) {
        var n = CM.util.publishedCount(topic);
        totals.published += n;
        totals.missing += (3 - n);
        if (n === 3) { totals.complete++; }
        if (!byType[topic.type]) { byType[topic.type] = { total: 0, published: 0 }; }
        byType[topic.type].total++;
        byType[topic.type].published += n;
      });

      var state = { type: 'all', batches: null, q: '' };

      mount.innerHTML =
        '<div class="cm-grid cm-grid--4 cm-mb2">' +
          '<div class="cm-stat"><div class="cm-stat__num">' + totals.topics + '</div>' +
            '<div class="cm-stat__label">' + esc(t('coverage.totalTopics')) + '</div></div>' +
          '<div class="cm-stat"><div class="cm-stat__num">' + totals.published + '</div>' +
            '<div class="cm-stat__label">' + esc(t('coverage.totalBatches')) + '</div></div>' +
          '<div class="cm-stat"><div class="cm-stat__num">' + totals.missing + '</div>' +
            '<div class="cm-stat__label">' + esc(t('coverage.remaining')) + '</div></div>' +
          '<div class="cm-stat"><div class="cm-stat__num">' + totals.complete + '</div>' +
            '<div class="cm-stat__label">' + esc(t('coverage.complete')) + '</div></div>' +
        '</div>' +
        '<div class="cm-toolbar">' +
          '<div class="cm-toolbar__search">' +
            '<label class="cm-vh" for="cm-cov-search">' + esc(t('search.label')) + '</label>' +
            '<input class="cm-input" id="cm-cov-search" type="search" placeholder="' + esc(t('search.placeholder')) + '">' +
          '</div>' +
          '<label class="cm-vh" for="cm-cov-type">' + esc(t('filter.catalog')) + '</label>' +
          '<select class="cm-select" id="cm-cov-type" style="width:auto;min-width:200px">' +
            '<option value="all">' + esc('All catalogs') + '</option>' +
            Object.keys(CATALOG_META).map(function (type) {
              return '<option value="' + esc(type) + '">' + esc(t(CATALOG_META[type].labelKey)) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<p class="cm-legend cm-mb2">' +
          '<span><i class="cm-cov__cell--0"></i> ' + esc(t('coverage.need0')) + '</span>' +
          '<span><i class="cm-cov__cell--1"></i> ' + esc(t('coverage.need1')) + '</span>' +
          '<span><i class="cm-cov__cell--2"></i> ' + esc(t('coverage.need2')) + '</span>' +
          '<span><i class="cm-cov__cell--3"></i> ' + esc(t('coverage.need3')) + '</span>' +
        '</p>' +
        '<div class="cm-tablewrap" id="cm-cov-tablewrap"></div>' +
        '<div class="cm-banner cm-banner--accent cm-mt2">' + CM.nav.svg('heart') +
          '<div><span class="cm-banner__title">' + esc(t('contribute.title')) + '</span>' +
          '<p>' + esc(t('coverage.cta')) + '</p>' +
          '<p class="cm-mb0"><a class="cm-btn cm-btn--primary cm-btn--sm" ' +
            'href="' + esc(CM.config.repoUrl) + '/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">' +
            esc(t('contribute.link')) + '</a></p></div>' +
        '</div>';

      var tableWrap = mount.querySelector('#cm-cov-tablewrap');
      var searchInput = mount.querySelector('#cm-cov-search');
      var typeSelect = mount.querySelector('#cm-cov-type');

      function renderTable() {
        var q = state.q.trim().toLowerCase();
        var rows = catalog.topics.filter(function (topic) {
          if (state.type !== 'all' && topic.type !== state.type) { return false; }
          if (q && (topic.title + ' ' + topic.id + ' ' + (topic.externalId || '')).toLowerCase().indexOf(q) === -1) { return false; }
          return true;
        });
        rows.sort(function (a, b) {
          var diff = CM.util.publishedCount(a) - CM.util.publishedCount(b);
          if (diff !== 0) { return diff; }
          return String(a.title).localeCompare(String(b.title));
        });

        var body = rows.map(function (topic) {
          var n = CM.util.publishedCount(topic);
          var cells = '';
          for (var i = 0; i < 3; i++) {
            var b = topic.batches && topic.batches[i] ? topic.batches[i] : null;
            var status = b ? b.status : 'missing';
            var symbol = status === 'published' ? '\u2713' : (status === 'draft' ? '\u25CB' : '\u2014');
            var text = status === 'published' ? t('status.published') : (status === 'draft' ? t('status.draft') : t('status.missing'));
            cells += '<td><span class="cm-badge ' + (status === 'published' ? 'cm-badge--ok' : (status === 'draft' ? 'cm-badge--warn' : 'cm-badge--bad')) +
                     '">' + symbol + ' ' + esc('Batch ' + (i + 1)) + ': ' + esc(text) + '</span></td>';
          }
          return '<tr>' +
            '<td><strong><a href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a></strong>' +
              (topic.externalId ? ' <span class="cm-badge cm-badge--id cm-badge--sm">' + esc(topic.externalId) + '</span>' : '') + '</td>' +
            '<td>' + esc(topic.theme) + '</td>' +
            '<td class="cm-num">' + n + '/3</td>' +
            cells +
          '</tr>';
        }).join('');

        tableWrap.innerHTML =
          '<table class="cm-table"><caption class="cm-vh">' + esc(t('coverage.title')) + '</caption>' +
          '<thead><tr><th scope="col">' + esc(t('stats.topic')) + '</th>' +
          '<th scope="col">' + esc(t('filter.theme')) + '</th>' +
          '<th scope="col">' + esc(t('filter.batches')) + '</th>' +
          '<th scope="col">' + esc(t('batch.1.label')) + '</th>' +
          '<th scope="col">' + esc(t('batch.2.label')) + '</th>' +
          '<th scope="col">' + esc(t('batch.3.label')) + '</th></tr></thead>' +
          '<tbody>' + (body || '<tr><td colspan="6">' + esc(t('filter.none')) + '</td></tr>') + '</tbody></table>';
      }

      searchInput.addEventListener('input', CM.util.debounce(function () {
        state.q = searchInput.value; renderTable();
      }, 180));
      typeSelect.addEventListener('change', function () { state.type = typeSelect.value; renderTable(); });

      mount.removeAttribute('aria-busy');
      renderTable();
    })['catch'](function () {
      mount.removeAttribute('aria-busy');
      mount.innerHTML = '<div class="cm-state">' + CM.nav.svg('alert') +
        '<h3>' + esc(t('error.catalog.title')) + '</h3><p>' + esc(t('error.catalog.body')) + '</p></div>';
    });
  }

  /* ----------------------------------------------------------- stats ----- */
  function stats(options) {
    var opts = options || {};
    var mount = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!mount) { return Promise.resolve(); }

    mount.setAttribute('aria-busy', 'true');
    mount.innerHTML = '<div class="cm-state"><div class="cm-spinner" role="presentation"></div>' +
      '<p class="cm-mt2">' + esc(t('a11y.loading')) + '</p></div>';

    /* Hard 5 second ceiling: an infinite spinner destroys trust faster than an
       honest error card does. */
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      renderError();
    }, CM.config.statsTimeoutMs);

    function renderError() {
      clearTimeout(timer);
      mount.removeAttribute('aria-busy');
      mount.innerHTML =
        '<div class="cm-state">' + CM.nav.svg('alert') +
          '<h3>' + esc(t('stats.error.title')) + '</h3>' +
          '<p>' + esc(t('stats.error.body')) + '</p>' +
          '<p class="cm-mt2"><button type="button" class="cm-btn cm-btn--primary" id="cm-stats-retry">' +
            esc(t('action.retry')) + '</button></p></div>';
      var retry = mount.querySelector('#cm-stats-retry');
      if (retry) { retry.addEventListener('click', function () { stats(opts); }); }
      CM.a11y.announce(t('stats.error.title'), true);
    }

    return CM.store.getCatalog().then(function (catalog) {
      return CM.store.getStats().then(function (snapshot) {
        if (timedOut) { return; }
        clearTimeout(timer);
        mount.removeAttribute('aria-busy');
        renderStats(mount, snapshot, catalog);
      });
    })['catch'](function (err) {
      if (CM.config.debug) { console.error('[CM] stats failed', err); }
      renderError();
    });
  }

  function renderStats(mount, snapshot, catalog) {
    var mode = snapshot.mode || 'local';
    var noticeKey = mode === 'off' ? 'stats.offNotice' : (mode === 'remote' ? 'stats.remoteNotice' : 'stats.localNotice');
    var totals = snapshot.totals || {};

    function topicTitle(id) {
      var topic = catalog.index[id];
      return topic ? topic.title : id;
    }

    /* ---- users by country: vanilla SVG bar chart, no chart library ---- */
    var countries = (snapshot.usersByCountry || []).slice(0, 20);
    var maxCount = countries.reduce(function (m, c) { return Math.max(m, c.count); }, 0) || 1;
    var chartRows = countries.map(function (c) {
      var pctWidth = Math.max(2, Math.round((c.count / maxCount) * 100));
      var name = CM.identity.countryByCode(c.code);
      var label = name ? name.name : c.code;
      return '<tr>' +
        '<th scope="row" style="text-transform:none;letter-spacing:0;font-size:.85rem;color:var(--cm-text)">' +
          '<span aria-hidden="true">' + CM.util.flag(c.code) + '</span> ' + esc(label) +
          ' <span class="cm-badge cm-badge--id cm-badge--sm">' + esc(c.code) + '</span></th>' +
        '<td style="width:55%"><span class="cm-meter"><span class="cm-meter__fill" style="width:' + pctWidth + '%"></span></span></td>' +
        '<td class="cm-num">' + c.count + '</td>' +
      '</tr>';
    }).join('');

    /* ---- per-exercise table ---- */
    var rows = (snapshot.rows || []).slice().sort(function (a, b) { return b.runs - a.runs; });
    var exerciseRows = rows.map(function (row, index) {
      var rowId = 'cm-stats-row-' + index;
      var topCountries = (row.topCountries || []).map(function (c) {
        var name = CM.identity.countryByCode(c.code);
        var max = (row.topCountries[0] && row.topCountries[0].count) || 1;
        return '<span class="cm-countrybar">' +
          '<span aria-hidden="true">' + CM.util.flag(c.code) + '</span>' +
          '<span class="cm-tiny">' + esc(name ? name.name : c.code) + '</span>' +
          '<span class="cm-countrybar__track"><span class="cm-countrybar__fill" style="width:' +
            Math.max(4, Math.round((c.count / max) * 100)) + '%"></span></span>' +
          '<span class="cm-tiny cm-mono">' + c.count + '</span></span>';
      }).join(' ') || '<span class="cm-dim">' + esc('No country data.') + '</span>';

      return '<tr>' +
        '<td><strong><a href="' + topicHref(row.topicId) + '">' + esc(topicTitle(row.topicId)) + '</a></strong></td>' +
        '<td>' + esc('Batch ' + row.batch) + '</td>' +
        '<td class="cm-num">' + row.runs + '</td>' +
        '<td class="cm-num">' + row.uniqueUsers + '</td>' +
        '<td class="cm-num">' + (row.avgScore === null ? '\u2014' : esc(CM.util.pct(row.avgScore))) + '</td>' +
        '<td class="cm-num">' + (row.passRate === null ? '\u2014' : esc(CM.util.pct(row.passRate))) + '</td>' +
        '<td><button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" aria-expanded="false" ' +
          'aria-controls="' + rowId + '">' + esc(t('stats.topCountries')) + '</button></td>' +
      '</tr>' +
      '<tr class="cm-subrow" id="' + rowId + '" hidden><td colspan="7"><div class="cm-countrybars">' +
        topCountries + '</div></td></tr>';
    }).join('');

    var emptyState =
      '<div class="cm-state">' + CM.nav.svg('chart') +
        '<h3>' + esc(t('stats.empty.title')) + '</h3>' +
        '<p>' + esc(t('stats.empty.body')) + '</p>' +
        (mode === 'off' ? '' : '<p class="cm-mt2"><a class="cm-btn cm-btn--primary" href="' +
          CM.util.url('pages/mitre-techniques.html') + '">' + esc('Browse techniques') + '</a></p>') +
      '</div>';

    mount.innerHTML =
      '<div class="cm-banner cm-banner--' + (mode === 'off' ? 'warn' : (mode === 'remote' ? 'info' : 'accent')) + '">' +
        CM.nav.svg('info') +
        '<div><span class="cm-banner__title">' + esc(mode === 'local' ? 'Local mode' : (mode === 'off' ? 'Collection off' : 'Remote mode')) + '</span>' +
        '<p class="cm-mb0">' + esc(t(noticeKey)) + '</p></div>' +
      '</div>' +

      '<div class="cm-grid cm-grid--4 cm-mb2">' +
        '<div class="cm-stat"><div class="cm-stat__num">' + (totals.examsTaken || 0) + '</div>' +
          '<div class="cm-stat__label">' + esc(t('stats.examsTaken')) + '</div></div>' +
        '<div class="cm-stat"><div class="cm-stat__num">' + (totals.users || 0) + '</div>' +
          '<div class="cm-stat__label">' + esc(t('stats.totalUsers')) + '</div></div>' +
        '<div class="cm-stat"><div class="cm-stat__num">' + (totals.countries || 0) + '</div>' +
          '<div class="cm-stat__label">' + esc(t('stats.countriesRepresented')) + '</div></div>' +
        '<div class="cm-stat"><div class="cm-stat__num">' +
          (totals.passRate === null || totals.passRate === undefined ? '\u2014' : esc(CM.util.pct(totals.passRate))) + '</div>' +
          '<div class="cm-stat__label">' + esc(t('stats.overallPassRate')) + '</div></div>' +
      '</div>' +

      (snapshot.rows && snapshot.rows.length ? '' : emptyState) +

      (countries.length ?
        '<section class="cm-section"><h2>' + esc(t('stats.usersByCountry')) + '</h2>' +
        '<div class="cm-tablewrap"><table class="cm-table"><caption class="cm-vh">' + esc(t('stats.usersByCountry')) + '</caption>' +
        '<thead><tr><th scope="col">' + esc(t('identity.countryLabel')) + '</th>' +
        '<th scope="col">' + esc('Share') + '</th><th scope="col">' + esc(t('stats.totalUsers')) + '</th></tr></thead>' +
        '<tbody>' + chartRows + '</tbody></table></div></section>' : '') +

      (rows.length ?
        '<section class="cm-section"><h2>' + esc(t('stats.perExercise')) + '</h2>' +
        '<div class="cm-tablewrap"><table class="cm-table"><caption class="cm-vh">' + esc(t('stats.perExercise')) + '</caption>' +
        '<thead><tr><th scope="col">' + esc(t('stats.topic')) + '</th><th scope="col">' + esc(t('stats.batch')) + '</th>' +
        '<th scope="col">' + esc(t('stats.runs')) + '</th><th scope="col">' + esc(t('stats.uniqueUsers')) + '</th>' +
        '<th scope="col">' + esc(t('stats.avgScore')) + '</th><th scope="col">' + esc(t('stats.passRate')) + '</th>' +
        '<th scope="col">' + esc(t('stats.detail')) + '</th></tr></thead><tbody>' + exerciseRows + '</tbody></table></div></section>' : '') +

      '<section class="cm-section"><h2>' + esc(t('stats.globalCounters')) + '</h2>' +
        '<div class="cm-grid cm-grid--3">' +
          '<div class="cm-card"><h3 class="cm-card__title">' + esc(t('stats.mostAttempted')) + '</h3>' +
            '<p class="cm-mb0">' + (totals.mostAttempted ?
              '<a href="' + topicHref(totals.mostAttempted.topicId) + '">' + esc(topicTitle(totals.mostAttempted.topicId)) + '</a> ' +
              '<span class="cm-dim">(' + totals.mostAttempted.runs + ' ' + esc(t('stats.runs').toLowerCase()) + ')</span>' : '<span class="cm-dim">' + esc('Not enough data yet.') + '</span>') + '</p></div>' +
          '<div class="cm-card"><h3 class="cm-card__title">' + esc(t('stats.hardest')) + '</h3>' +
            '<p class="cm-mb0">' + (totals.hardest ?
              '<a href="' + topicHref(totals.hardest.topicId) + '">' + esc(topicTitle(totals.hardest.topicId)) + '</a> ' +
              '<span class="cm-dim">(' + esc(CM.util.pct(totals.hardest.avgScore)) + ')</span>' : '<span class="cm-dim">' + esc('Needs at least 10 attempts on a topic.') + '</span>') + '</p></div>' +
          '<div class="cm-card"><h3 class="cm-card__title">' + esc(t('stats.overallAvgScore')) + '</h3>' +
            '<p class="cm-mb0">' + (totals.avgScore === null || totals.avgScore === undefined ? '<span class="cm-dim">' + esc('No scores yet.') + '</span>' : esc(CM.util.pct(totals.avgScore))) + '</p></div>' +
        '</div>' +
      '</section>' +

      '<p class="cm-small cm-muted cm-mt2">' + esc(t('stats.privacyNote')) + ' ' +
        '<a href="' + CM.util.url('pages/privacy.html') + '">' + esc(t('footer.privacy')) + '</a></p>';

    /* Expandable per-country breakdown rows. */
    mount.querySelectorAll('[aria-controls]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('aria-controls'));
        if (!target) { return; }
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        target.hidden = open;
      });
    });
  }

  /* --------------------------------------------------------- relations --- */
  /* Renders a "related topics" block. Used on topic pages for relatedTopics,
     and for the automatic reverse links (mitigations for a technique, groups
     that use it, detections that observe it). */
  function related(options) {
    var opts = options || {};
    var mount = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!mount) { return Promise.resolve(); }
    var topics = opts.topics || [];
    if (!topics.length) {
      mount.innerHTML = opts.emptyHtml === undefined
        ? '<p class="cm-small cm-dim">' + esc('None cross-referenced yet.') + '</p>'
        : opts.emptyHtml;
      return Promise.resolve();
    }
    mount.innerHTML = '<ul class="cm-chips">' + topics.map(function (topic) {
      var label = topic.externalId ? topic.externalId + ' ' + topic.shortTitle : topic.title;
      return '<li><a href="' + topicHref(topic.id) + '">' + esc(label) + '</a></li>';
    }).join('') + '</ul>';
    return Promise.resolve();
  }

  /* ------------------------------------------------------------- home ---- */
  /* The home page needs the manifest in four small places. Keeping the logic
     here rather than inline in index.html means the page stays readable and
     the same rendering rules apply as everywhere else. */
  function home(options) {
    var opts = options || {};

    /* 1. Stat strip. Topics and batches come from the manifest; distinct users
          and exams taken come from the stats provider, which is the only thing
          that knows them. */
    var statsMount = document.querySelector(opts.statsMount || '#cm-home-stats');
    var continueMount = document.querySelector(opts.continueMount || '#cm-home-continue');
    var latestMount = document.querySelector(opts.latestMount || '#cm-home-latest');
    var gapsMount = document.querySelector(opts.gapsMount || '#cm-home-gaps');

    return CM.store.getCatalog().then(function (catalog) {
      var totals = catalog.totals || {};
      var published = totals.batchesPublished || 0;
      var totalBatches = totals.batchesTotal || (catalog.topics.length * 3);

      function paintStats(snapshot) {
        var users = snapshot && snapshot.totals ? (snapshot.totals.users || 0) : 0;
        var countries = snapshot && snapshot.totals ? (snapshot.totals.countries || 0) : 0;
        var exams = snapshot && snapshot.totals ? (snapshot.totals.examsTaken || 0) : 0;
        var mode = snapshot ? snapshot.mode : 'local';

        if (!statsMount) { return; }
        statsMount.innerHTML =
          '<div class="cm-grid cm-grid--4">' +
            '<div class="cm-stat"><div class="cm-stat__num">' + totals.topics + '</div>' +
              '<div class="cm-stat__label">' + esc(t('home.stats.topics')) + '</div></div>' +
            '<div class="cm-stat"><div class="cm-stat__num">' + published + '</div>' +
              '<div class="cm-stat__label">' + esc(t('home.stats.batches')) + '</div>' +
              '<div class="cm-tiny cm-dim">' + esc('of ' + totalBatches + ' planned') + '</div></div>' +
            '<div class="cm-stat"><div class="cm-stat__num">' + countries + '</div>' +
              '<div class="cm-stat__label">' + esc(t('home.stats.countries')) + '</div></div>' +
            '<div class="cm-stat"><div class="cm-stat__num">' + exams + '</div>' +
              '<div class="cm-stat__label">' + esc(t('home.stats.exams')) + '</div></div>' +
          '</div>' +
          (mode === 'local'
            ? '<p class="cm-small cm-dim cm-mt1">' + esc(t('stats.localNotice')) + '</p>'
            : (mode === 'off'
              ? '<p class="cm-small cm-dim cm-mt1">' + esc(t('stats.offNotice')) + '</p>'
              : '<p class="cm-small cm-dim cm-mt1">' + esc(t('stats.remoteNotice')) + '</p>'));
      }

      /* Paint immediately from the manifest so the strip is never empty, then
         upgrade the two stats-driven numbers when the provider answers. */
      paintStats(null);
      CM.store.getStats().then(paintStats)['catch'](function () { paintStats(null); });

      /* 2. Continue where you left off. */
      if (continueMount) {
        var attempts = CM.store.getRecentAttempts(4);
        if (!attempts.length) {
          continueMount.innerHTML =
            '<div class="cm-card"><h2 class="cm-card__title">' + esc(t('home.continue')) + '</h2>' +
            '<p class="cm-mb0 cm-muted">' + esc(t('home.continueNone')) + '</p></div>';
        } else {
          continueMount.innerHTML =
            '<div class="cm-card"><h2 class="cm-card__title">' + esc(t('home.continue')) + '</h2>' +
            '<ul class="cm-attempts">' + attempts.map(function (a) {
              var topic = catalog.index[a.topicId];
              var label = topic ? topic.title : a.topicId;
              return '<li>' +
                '<a href="' + topicHref(a.topicId) + '">' + esc(label) + '</a>' +
                '<span class="cm-badge cm-badge--sm">' + esc('Batch ' + a.batch) + '</span>' +
                '<span class="cm-batchresult cm-batchresult--' + (a.passed ? 'pass' : 'fail') + '">' +
                  (a.passed ? t('batch.pass') : t('batch.fail')) + '</span>' +
                '<span class="cm-attempts__score">' + esc(CM.util.pct(a.percent)) + '</span>' +
              '</li>';
            }).join('') + '</ul></div>';
        }
      }

      /* 3. Latest additions, newest review date first. */
      if (latestMount) {
        var sorted = catalog.topics.slice().sort(function (a, b) {
          var cmp = String(b.lastReviewed || '').localeCompare(String(a.lastReviewed || ''));
          if (cmp !== 0) { return cmp; }
          return String(a.title).localeCompare(String(b.title));
        }).slice(0, opts.latestCount || CM.config.homeLatestCount);

        latestMount.innerHTML =
          '<ul class="cm-stack" style="list-style:none;padding:0;margin:0">' + sorted.map(function (topic) {
            return '<li class="cm-row" style="justify-content:space-between">' +
              '<span><a href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a> ' +
                (topic.externalId ? '<span class="cm-badge cm-badge--id cm-badge--sm">' + esc(topic.externalId) + '</span>' : '') +
              '</span>' +
              '<span class="cm-small cm-dim">' + esc(topic.theme) + '</span>' +
            '</li>';
          }).join('') + '</ul>';
      }

      /* 4. Coverage gaps teaser. This is the contribution roadmap in miniature:
          name the real number, do not imply more is done than there is. */
      if (gapsMount) {
        var buckets = { 0: [], 1: [], 2: [], 3: [] };
        catalog.topics.forEach(function (topic) {
          buckets[CM.util.publishedCount(topic)].push(topic);
        });
        var missing = totals.batchesMissing || 0;
        var examples = buckets[0].slice(0, 5).map(function (topic) {
          return '<li><a href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a></li>';
        }).join('');

        gapsMount.innerHTML =
          '<div class="cm-card">' +
            '<h2 class="cm-card__title">' + esc(t('home.gaps')) + '</h2>' +
            '<p>' + esc(missing + ' exercise batches are still to be written across ' +
              (buckets[0].length + buckets[1].length + buckets[2].length) + ' topics.') + '</p>' +
            '<p class="cm-small cm-muted">' + esc('Topics still waiting for their first batch:') + '</p>' +
            '<ul class="cm-chips">' + examples + '</ul>' +
            '<div class="cm-card__foot">' +
              '<a class="cm-btn cm-btn--primary cm-btn--sm" href="' + CM.util.url('pages/coverage.html') + '">' +
                esc(t('home.gapsCta')) + '</a>' +
              '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + CM.util.url('pages/support.html') + '">' +
                esc(t('nav.support')) + '</a>' +
            '</div>' +
          '</div>';
      }
    })['catch'](function (err) {
      if (CM.config.debug) { console.error('[CM] home render failed', err); }
      [statsMount, continueMount, latestMount, gapsMount].forEach(function (mount) {
        if (mount && !mount.innerHTML.trim()) {
          mount.innerHTML = '<div class="cm-state">' + CM.nav.svg('alert') +
            '<h3>' + esc(t('error.catalog.title')) + '</h3>' +
            '<p>' + esc(t('error.catalog.body')) + '</p>' +
            '<p class="cm-mt2"><button type="button" class="cm-btn cm-btn--primary" ' +
            'onclick="location.reload()">' + esc(t('action.retry')) + '</button></p></div>';
        }
      });
    });
  }

  CM.render = {
    catalogList: catalogList,
    coverage: coverage,
    stats: stats,
    related: related,
    home: home,
    renderCard: renderCard,
    topicHref: topicHref,
    CATALOG_META: CATALOG_META,
    stripVendorLogos: stripVendorLogos
  };
})();
