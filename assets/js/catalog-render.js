/* ============================================================================
   CyberPulseAcademy - assets/js/catalog-render.js
   Renders every listing page from data/catalog.json. No page hard-codes a
   topic, a count, or a theme: if it appears on screen it came from the
   manifest.

   Public API:
     CM.render.catalogList(options)   the searchable, filterable card grid
     CM.render.coverage(options)      the coverage dashboard
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

  /* difficultyBadge() lived here. It rendered the topic's own "difficulty"
     field (Extreme / Very hard / Hard) as a badge on every card. It was removed
     from the cards because that field describes the exercise batches rather than
     the topic, and the batches already report their own tiers through the
     exercise badge. The sort-by-difficulty control still reads topic.difficulty,
     so the field itself is unchanged. */

  /* Exercise readiness badge.

     Shows a small bar plus a written count, because colour and shape must never
     be the only signal. The bar is capped at eight segments so a topic with forty
     exercises does not overflow the card, and the number next to it is always the
     truth. */
  function exerciseBadge(topic) {
    var stats = CM.util.exerciseStats(topic);
    var ready = stats.published;
    var total = stats.total;
    var segments = Math.max(total, 1);
    if (segments > 8) { segments = 8; }
    var filled = total === 0 ? 0 : Math.round((ready / total) * segments);
    var pips = '';
    for (var i = 0; i < segments; i++) {
      pips += '<span class="cm-batchdot__pip' + (i < filled ? ' cm-batchdot__pip--on' : '') + '"></span>';
    }
    var label;
    if (total === 0) {
      label = t('coverage.noExercises');
    } else if (ready === 0) {
      label = t('coverage.noPublished');
    } else if (ready === total) {
      label = t('exercise.countMany', { n: ready }) + ', ' + t('coverage.completeBucket').toLowerCase();
    } else {
      label = ready + ' / ' + total + ' ready';
    }
    return '<span class="cm-batchdot" title="' + esc(label) + '">' +
             '<span class="cm-batchdot__pips" aria-hidden="true">' + pips + '</span>' +
             '<span class="cm-batchdot__label">' + esc(label) + '</span>' +
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
    /* The topic-level difficulty badge is deliberately NOT rendered here.
       It read as a property of the topic, but it is a rating of the topic's
       exercise batches, and those carry their own four tiers (EASY, MEDIUM,
       HARD, EXTREMELY HARD) which the exercise badge below reports properly.
       Showing a second, differently-scaled difficulty next to the readiness
       badge invited the reader to conflate the two. */
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

    /* A topic is "ready" when at least one of its exercises has a real file.
       The card then draws a green border, so a visitor scanning a listing can
       see at a glance which topics they can actually start on. The border is a
       second signal only: the exercise badge in the card footer already states
       the readiness in words, so nothing here depends on colour alone. */
    var readyCount = 0;
    try {
      readyCount = CM.util.exerciseStats(topic).published;
    } catch (error) {
      readyCount = 0;
    }
    var readyClass = readyCount > 0 ? ' cm-card--ready' : '';

    var html =
      '<article class="cm-card cm-card--hover cm-card--link' + readyClass + '" data-id="' + esc(topic.id) + '">' +
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
          exerciseBadge(topic) +
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
      readiness: null,
      sort: options.defaultSort || 'title'
    };
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('q')) { defaults.q = params.get('q'); }
      if (params.get('theme')) { defaults.themes = String(params.get('theme')).split(',').filter(Boolean); }
      if (params.get('ready')) { defaults.readiness = String(params.get('ready')); }
      /* The old ?batches= links are mapped onto the closest new filter so a
         bookmarked URL does not silently show everything. */
      if (!defaults.readiness && params.get('batches')) {
        defaults.readiness = params.get('batches') === '0' ? 'none' : 'partial';
      }
      if (params.get('sort')) { defaults.sort = params.get('sort'); }
    } catch (e) { /* no query string support: use defaults */ }
    return defaults;
  }

  function writeState(state) {
    try {
      var params = new URLSearchParams();
      if (state.q) { params.set('q', state.q); }
      if (state.themes.length) { params.set('theme', state.themes.join(',')); }
      if (state.readiness) { params.set('ready', state.readiness); }
      if (state.sort && state.sort !== 'title') { params.set('sort', state.sort); }
      var qs = params.toString();
      var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
      history.replaceState(null, '', url);
    } catch (e) { /* ignore: filters still work, they just are not shareable */ }
  }

  /* Which readiness bucket a topic falls into. Kept as one function so the card
     badge, the filter and the coverage page can never disagree with each other. */
  /* The four readiness states, in one place: the table badge, the filter options and the
     legend all read from this, so they cannot describe the same topic differently. */
  var READINESS = {
    none:     { key: 'coverage.state.noBatches', cls: 'cm-badge--bad',   sym: '\u2014' },
    notReady: { key: 'coverage.state.reserved',  cls: 'cm-badge--warn',  sym: '\u25CB' },
    partial:  { key: 'coverage.state.partial',   cls: 'cm-badge--info',  sym: '\u25D0' },
    complete: { key: 'coverage.state.complete',  cls: 'cm-badge--ok',    sym: '\u2713' }
  };

  /* When a topic's exercises last changed. scripts/sync_exercises.py writes
     exercisesAdded as it records a batch; topics that predate the field fall back to their
     review date rather than dropping out of the ordering altogether. */
  function topicDate(topic) {
    return String(topic.exercisesAdded || topic.lastReviewed || '');
  }

  /* "15 Oct" from an ISO date, parsed by hand: new Date('2026-10-15') is UTC midnight,
     which renders as the day before in any negative offset. */
  function shortDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) { return ''; }
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Number(m[3]) + ' ' + months[Number(m[2]) - 1];
  }

  function readiness(topic) {
    var stats = CM.util.exerciseStats(topic);
    var chapters = topic.chapters || [];
    var emptyChapters = 0;
    for (var i = 0; i < chapters.length; i++) {
      /* A chapter's exercises arrive EITHER as an array of entries OR as a plain
         count, depending on which projection produced the catalog. Reading
         .length off a number yields undefined, which made every chapter look
         empty and pushed every certification into "partial" - so "All ready"
         matched nothing on the certifications page. Both shapes are handled. */
      var held = chapters[i].exercises;
      var count = Array.isArray(held) ? held.length : (typeof held === 'number' ? held : 0);
      if (!count) { emptyChapters++; }
    }
    if (stats.total === 0) { return 'none'; }
    if (stats.published === 0) { return 'notReady'; }
    if (emptyChapters || stats.published < stats.total) { return 'partial'; }
    return 'complete';
  }

  function applyFilters(topics, state) {
    var q = state.q.trim().toLowerCase();
    var terms = q ? q.split(/\s+/).filter(Boolean) : [];

    var out = topics.filter(function (topic) {
      if (state.themes.length && state.themes.indexOf(topic.theme) === -1) { return false; }
      if (state.readiness) {
        if (readiness(topic) !== state.readiness) { return false; }
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
      if (state.sort === 'exercises') {
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
                '<option value="exercises">' + esc(t('filter.sortBatches')) + '</option>' +
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

        /* The readiness labels come from the same table the coverage dashboard and the
           badges use, so this list cannot drift from them again - it previously named
           coverage.need0-3, keys that were deleted with the three-batch model. */
        themeHtml += '<fieldset><legend>' + esc(t('filter.batches')) + '</legend>';
        [['', 'filter.anyReadiness']].concat(Object.keys(READINESS).map(function (name) {
          return [name, READINESS[name].key];
        })).forEach(function (pair) {
          var checked = String(state.readiness || '') === pair[0] ? ' checked' : '';
          themeHtml += '<label><input type="radio" name="cm-readiness" value="' + pair[0] + '"' + checked + '>' +
                       '<span>' + esc(t(pair[1])) + '</span></label>';
        });
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
          } else if (input.type === 'radio' && input.name === 'cm-readiness') {
            state.readiness = input.value === '' ? null : input.value;
          }
          render();
        });
      }

      function clearAll() {
        state.q = ''; state.themes = []; state.readiness = null; state.sort = 'title';
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
      var state = { type: 'all', readiness: null, q: '' };

      /* The summary figures are part of the page, injected at build time from this same
         manifest, so they are already correct before this script runs - and they stay
         correct for a visitor without JavaScript. Only the searchable table needs the
         manifest in the browser, so that is all this renders. */
      mount.innerHTML =
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
          '<label class="cm-vh" for="cm-cov-ready">' + esc(t('filter.batches')) + '</label>' +
          '<select class="cm-select" id="cm-cov-ready" style="width:auto;min-width:210px">' +
            '<option value="">' + esc(t('filter.anyReadiness')) + '</option>' +
            Object.keys(READINESS).map(function (name) {
              return '<option value="' + esc(name) + '">' + esc(t(READINESS[name].key)) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<ul class="cm-legend cm-mb2">' +
          '<li><i class="cm-cov__cell--0" aria-hidden="true"></i> ' + esc(t('coverage.state.noBatches')) + '</li>' +
          '<li><i class="cm-cov__cell--1" aria-hidden="true"></i> ' + esc(t('coverage.state.reserved')) + '</li>' +
          '<li><i class="cm-cov__cell--2" aria-hidden="true"></i> ' + esc(t('coverage.state.partial')) + '</li>' +
          '<li><i class="cm-cov__cell--3" aria-hidden="true"></i> ' + esc(t('coverage.state.complete')) + '</li>' +
        '</ul>' +
        '<div class="cm-tablewrap" id="cm-cov-tablewrap"></div>';

      var tableWrap = mount.querySelector('#cm-cov-tablewrap');
      var searchInput = mount.querySelector('#cm-cov-search');
      var typeSelect = mount.querySelector('#cm-cov-type');
      var readySelect = mount.querySelector('#cm-cov-ready');

      function renderTable() {
        var q = state.q.trim().toLowerCase();
        var rows = catalog.topics.filter(function (topic) {
          if (state.type !== 'all' && topic.type !== state.type) { return false; }
          if (state.readiness && readiness(topic) !== state.readiness) { return false; }
          if (q && (topic.title + ' ' + topic.id + ' ' + (topic.externalId || '')).toLowerCase().indexOf(q) === -1) { return false; }
          return true;
        });
        rows.sort(function (a, b) {
          var diff = CM.util.publishedCount(a) - CM.util.publishedCount(b);
          if (diff !== 0) { return diff; }
          return String(a.title).localeCompare(String(b.title));
        });

        var body = rows.map(function (topic) {
          var stats = CM.util.exerciseStats(topic);
          var bucket = READINESS[readiness(topic)];
          var chapters = (topic.chapters || []).length;
          return '<tr>' +
            '<td><strong><a href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a></strong>' +
              (topic.externalId ? ' <span class="cm-badge cm-badge--id cm-badge--sm">' + esc(topic.externalId) + '</span>' : '') + '</td>' +
            '<td>' + esc(topic.theme) + '</td>' +
            '<td><span class="cm-badge ' + bucket.cls + '">' + bucket.sym + ' ' + esc(t(bucket.key)) + '</span></td>' +
            '<td class="cm-num">' + stats.published + ' / ' + stats.total + '</td>' +
            '<td class="cm-num">' + (chapters || '\u2014') + '</td>' +
          '</tr>';
        }).join('');

        tableWrap.innerHTML =
          '<table class="cm-table"><caption class="cm-vh">' + esc(t('coverage.title')) + '</caption>' +
          '<thead><tr><th scope="col">' + esc(t('coverage.col.topic')) + '</th>' +
          '<th scope="col">' + esc(t('coverage.col.catalog')) + '</th>' +
          '<th scope="col">' + esc(t('coverage.col.readiness')) + '</th>' +
          '<th scope="col">' + esc(t('coverage.col.batches')) + '</th>' +
          '<th scope="col">' + esc(t('coverage.col.chapters')) + '</th></tr></thead>' +
          '<tbody>' + (body || '<tr><td colspan="5">' + esc(t('filter.none')) + '</td></tr>') + '</tbody></table>';
      }

      searchInput.addEventListener('input', CM.util.debounce(function () {
        state.q = searchInput.value; renderTable();
      }, 180));
      typeSelect.addEventListener('change', function () { state.type = typeSelect.value; renderTable(); });
      readySelect.addEventListener('change', function () { state.readiness = readySelect.value || null; renderTable(); });

      mount.removeAttribute('aria-busy');
      renderTable();
    })['catch'](function () {
      mount.removeAttribute('aria-busy');
      mount.innerHTML = '<div class="cm-state">' + CM.nav.svg('alert') +
        '<h3>' + esc(t('error.catalog.title')) + '</h3><p>' + esc(t('error.catalog.body')) + '</p></div>';
    });
  }

  /* ----------------------------------------------------------- stats ----- */
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
    var requestMount = document.querySelector(opts.requestMount || '#cm-home-request');

    return CM.store.getCatalog().then(function (catalog) {
      var totals = catalog.totals || {};
      var ready = totals.exercisesPublished || 0;
      var totalExercises = totals.exercisesTotal || 0;

      /* Whole numbers with thin separators, so 9753 reads as 9,753 without
         depending on the browser locale. */
      function fmtInt(n) {
        return String(n === null || n === undefined ? 0 : n)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      function statBox(num, label, sub, mod) {
        return '<div class="cm-stat' + (mod ? ' ' + mod : '') + '">' +
          '<span class="cm-stat__num">' + fmtInt(num) + '</span>' +
          '<span class="cm-stat__label">' + esc(label) + '</span>' +
          (sub ? '<span class="cm-stat__sub">' + esc(sub) + '</span>' : '') +
          '</div>';
      }

      /* How far one catalog has come, said three ways: the bar length, the percentage
         and the tier colour. The thresholds are duplicated in scripts/generate_pages.py,
         which paints the same colours into the static markup, so the strip does not
         change colour the moment this script loads. */
      function coverageTier(pct, readyCount) {
        if (!readyCount) { return 'none'; }
        if (pct >= 100) { return 'complete'; }
        if (pct >= 50) { return 'strong'; }
        if (pct >= 20) { return 'building'; }
        if (pct >= 5) { return 'early'; }
        return 'starting';
      }

      /* One catalog: how much of it a learner can start today, against how much is
         documented. The bar and the chip repeat what the two figures already say, so
         both are hidden from assistive technology; the tier is announced in words
         instead, because colour is the one thing a screen reader cannot read. */
      function coverageCard(key, label, href) {
        var readyCount = totals[key + 'Ready'] || 0;
        var documented = totals[key] || 0;
        var pct = documented > 0 ? Math.round((readyCount / documented) * 100) : 0;
        var tier = coverageTier(pct, readyCount);
        return '<a class="cm-stat' + (readyCount ? '' : ' cm-stat--zero') +
          '" data-cm-catalog="' + esc(key) + '" data-cm-tier="' + tier + '" href="' + esc(href) + '">' +
          '<span class="cm-stat__pct" aria-hidden="true">' + pct + '%</span>' +
          '<span class="cm-stat__num">' + fmtInt(readyCount) + '</span>' +
          '<span class="cm-stat__label">' + esc(label) + '</span>' +
          '<span class="cm-stat__sub">' + esc(t('home.stats.coveredOf', { total: fmtInt(documented) })) + '</span>' +
          '<span class="cm-meter" aria-hidden="true"><span class="cm-meter__fill" style="width:' + pct + '%"></span></span>' +
          '<span class="cm-vh">' + esc(t('home.stats.tier.' + tier)) + '</span>' +
          '</a>';
      }

      function paintStats(snapshot) {
        var exams = snapshot && snapshot.totals ? (snapshot.totals.examsTaken || 0) : 0;
        var mode = snapshot ? snapshot.mode : 'local';

        if (!statsMount) { return; }
        var questions = totals.batchQuestions || 0;
        var counted = totals.batchesCounted || 0;

        /* The groups are deliberately ordered scale -> progress -> coverage ->
           activity. Library and exercise figures come from the manifest and are
           identical for every visitor; the activity block comes from the statistics
           provider and is the learner's own number in local mode, which the notice
           underneath says out loud. */
        statsMount.innerHTML =
          '<div class="cm-stats">' +
            '<section class="cm-stats__group">' +
              '<h2 class="cm-stats__head">' + esc(t('home.stats.head.library')) + '</h2>' +
              '<div class="cm-stats__grid cm-stats__grid--wide">' +
                statBox(totals.topics, t('home.stats.topics'), '') +
                statBox(totals.catalogs || 7, t('home.stats.catalogs'), '') +
                statBox(0, t('home.stats.ads'), '') +
              '</div>' +
            '</section>' +
            '<section class="cm-stats__group">' +
              '<h2 class="cm-stats__head">' + esc(t('home.stats.head.exercises')) + '</h2>' +
              '<div class="cm-stats__grid cm-stats__grid--wide">' +
                statBox(ready, t('home.stats.exercisesReady'),
                        t('home.stats.planned', { total: fmtInt(totalExercises) })) +
                statBox(questions, t('home.stats.batchQuestions'),
                        t('home.stats.countedIn', { counted: fmtInt(counted), ready: fmtInt(ready) })) +
              '</div>' +
            '</section>' +
            '<section class="cm-stats__group cm-stats__group--coverage">' +
              '<h2 class="cm-stats__head">' + esc(t('home.stats.head.coverage')) +
                ' <span class="cm-stats__note">' + esc(t('home.stats.head.coverageHint')) + '</span></h2>' +
              '<div class="cm-stats__grid">' +
                coverageCard('keywords', t('home.stats.keywords'), 'pages/keywords.html') +
                coverageCard('certifications', t('home.stats.certifications'), 'pages/certifications.html') +
                coverageCard('tactics', t('home.stats.tactics'), 'pages/mitre-tactics.html') +
                coverageCard('techniques', t('home.stats.techniques'), 'pages/mitre-techniques.html') +
                coverageCard('mitigations', t('home.stats.mitigations'), 'pages/mitre-mitigations.html') +
                coverageCard('detections', t('home.stats.detections'), 'pages/mitre-detections.html') +
                coverageCard('groups', t('home.stats.groups'), 'pages/mitre-groups.html') +
              '</div>' +
              '<p class="cm-small cm-dim">' + esc(t('home.stats.coverageNote')) + '</p>' +
              '<ul class="cm-legend" aria-hidden="true">' +
                '<li data-cm-tier="complete"><i></i>' + esc(t('home.stats.tier.complete')) + '</li>' +
                '<li data-cm-tier="strong"><i></i>' + esc(t('home.stats.tier.strong')) + '</li>' +
                '<li data-cm-tier="building"><i></i>' + esc(t('home.stats.tier.building')) + '</li>' +
                '<li data-cm-tier="early"><i></i>' + esc(t('home.stats.tier.early')) + '</li>' +
                '<li data-cm-tier="starting"><i></i>' + esc(t('home.stats.tier.starting')) + '</li>' +
              '</ul>' +
            '</section>' +
            '<section class="cm-stats__group">' +
              '<h2 class="cm-stats__head">' + esc(t('home.stats.head.you')) + '</h2>' +
              /* The learner's own figure gets the whole row and a taller card: it is the
                 only number in the strip that is about them rather than about the site. */
              '<div class="cm-stats__grid cm-stats__grid--full">' +
                statBox(exams, t('home.stats.exams'), '', 'cm-stat--wide') +
              '</div>' +
              (mode === 'local'
                ? '<p class="cm-small cm-dim">' + esc(t('stats.localNotice')) + '</p>'
                : (mode === 'off'
                  ? '<p class="cm-small cm-dim">' + esc(t('stats.offNotice')) + '</p>'
                  : '<p class="cm-small cm-dim">' + esc(t('stats.remoteNotice')) + '</p>')) +
            '</section>' +
          '</div>';

        /* The mount ships as aria-busy="true" in index.html. Clearing it once the
           strip has been painted stops assistive technology from treating the
           statistics as permanently loading. The guard keeps the renderer usable
           outside a browser, where the mount is a stub. */
        if (statsMount && statsMount.removeAttribute) { statsMount.removeAttribute('aria-busy'); }
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
                '<span class="cm-badge cm-badge--sm">' + esc('Exercise ' + a.batch) + '</span>' +
                '<span class="cm-batchresult cm-batchresult--' + (a.passed ? 'pass' : 'fail') + '">' +
                  (a.passed ? t('batch.pass') : t('batch.fail')) + '</span>' +
                '<span class="cm-attempts__score">' + esc(CM.util.pct(a.percent)) + '</span>' +
              '</li>';
            }).join('') + '</ul></div>';
        }
      }

      /* 3. Recently covered: the topics whose exercises were recorded most recently,
            newest first, capped at CM.config.homeLatestCount (five). A ranked snapshot
            rather than a list, because five is enough to show what is new. The date is
            stamped by sync_exercises.py, so publishing a batch moves a topic to the top on
            the next build without anyone touching a page. */
      if (latestMount) {
        var covered = catalog.topics.slice().sort(function (a, b) {
          var cmp = topicDate(b).localeCompare(topicDate(a));
          if (cmp !== 0) { return cmp; }
          return String(a.title).localeCompare(String(b.title));
        }).slice(0, opts.latestCount || CM.config.homeLatestCount);

        latestMount.innerHTML =
          '<ol class="cm-covered" aria-label="' + esc(t('home.covered.label')) + '">' +
            covered.map(function (topic, index) {
              var stats = CM.util.exerciseStats(topic);
              var pct = stats.total ? Math.round((stats.published / stats.total) * 100) : 0;
              return '<li class="cm-covered__item" data-state="' + readiness(topic) + '">' +
                '<span class="cm-covered__rank" aria-hidden="true">' + (index + 1) + '</span>' +
                '<span class="cm-covered__body">' +
                  '<a class="cm-covered__title" href="' + topicHref(topic.id) + '">' + esc(topic.title) + '</a>' +
                  '<span class="cm-covered__meta">' +
                    (topic.externalId
                      ? '<span class="cm-badge cm-badge--id cm-badge--sm">' + esc(topic.externalId) + '</span>' : '') +
                    '<span class="cm-covered__theme">' + esc(topic.theme || '') + '</span>' +
                    '<span class="cm-covered__prog" title="' + esc(t('home.covered.ready', { ready: stats.published, total: stats.total })) + '">' +
                      '<span class="cm-meter" aria-hidden="true">' +
                        '<span class="cm-meter__fill" style="width:' + pct + '%"></span></span>' +
                      '<span class="cm-vh">' + esc(t('home.covered.ready', { ready: stats.published, total: stats.total })) + '</span>' +
                      '<span class="cm-covered__count" aria-hidden="true">' + stats.published + '/' + stats.total + '</span>' +
                    '</span>' +
                  '</span>' +
                '</span>' +
                '<time class="cm-covered__when" datetime="' + esc(topicDate(topic)) + '">' +
                  esc(shortDate(topicDate(topic))) + '</time>' +
              '</li>';
            }).join('') +
          '</ol>' +
          '<p class="cm-small cm-mb0"><a class="cm-covered__cta" href="' + CM.util.url('pages/coverage.html') + '">' +
            esc(t('home.covered.cta')) + '</a></p>';
      }

      /* 4. Ask for a topic. The old "Still being written" report becomes an invitation:
            the catalog is documented ahead of the exercises, so the topics still waiting are
            exactly the ones a learner can ask for. The five most recently documented of them
            are one-click requests that open a prefilled GitHub issue, and the count comes
            from the manifest, so the ask stays honest as batches land. */
      if (requestMount) {
        var waiting = [];
        catalog.topics.forEach(function (topic) {
          var bucket = readiness(topic);
          if (bucket === 'none' || bucket === 'notReady') { waiting.push(topic); }
        });
        waiting.sort(function (a, b) {
          var cmp = topicDate(b).localeCompare(topicDate(a));
          if (cmp !== 0) { return cmp; }
          return String(a.title).localeCompare(String(b.title));
        });

        /* The repository link is an editable value in config.js. Until it is a real URL,
           the panel still explains itself and simply does not offer the links. */
        var repo = String(CM.config.repoUrl || '').replace(/\/+$/, '');
        var canAsk = repo !== '' && repo.indexOf('<') === -1;

        function requestUrl(topic) {
          if (!canAsk) { return ''; }
          var body = '**Topic:** ' + (topic ? topic.title : '') +
            '\n**Catalog:** ' + (topic ? (topic.type || '') : '') +
            '\n**Why I want it:** \n';
          return repo + '/issues/new?title=' +
            encodeURIComponent('Topic request: ' + (topic ? topic.title : '')) +
            '&body=' + encodeURIComponent(body);
        }

        var picks = waiting.slice(0, 5).map(function (topic) {
          var label = esc(topic.title) +
            ' <span class="cm-tiny cm-dim">' + esc(topic.externalId || topic.theme || '') + '</span>';
          return '<li>' + (canAsk
            ? '<a class="cm-request__pick" href="' + esc(requestUrl(topic)) + '" target="_blank" ' +
                'rel="noopener noreferrer" aria-label="' +
                esc(t('home.request.pick', { title: topic.title })) + '">' + label + '</a>'
            : '<span class="cm-request__pick">' + label + '</span>') + '</li>';
        }).join('');

        requestMount.innerHTML =
          '<div class="cm-card cm-request">' +
            '<h3 class="cm-card__title cm-request__title">' + CM.nav.svg('target') +
              esc(t('home.request.title')) + '</h3>' +
            '<p class="cm-request__lede">' + esc(t('home.request.lede', { waiting: waiting.length })) + '</p>' +
            (picks
              ? '<p class="cm-small cm-dim cm-request__label">' + esc(t('home.request.picks')) + '</p>' +
                '<ul class="cm-request__picks">' + picks + '</ul>'
              : '') +
            (canAsk
              ? '<div class="cm-request__actions">' +
                  '<a class="cm-btn cm-btn--primary cm-btn--sm" href="' + esc(requestUrl(null)) + '" ' +
                    'target="_blank" rel="noopener noreferrer">' + esc(t('home.request.cta')) + '</a>' +
                  '<a class="cm-btn cm-btn--ghost cm-btn--sm" href="' + esc(repo + '/issues?q=is%3Aissue') + '" ' +
                    'target="_blank" rel="noopener noreferrer">' + esc(t('home.request.existing')) + '</a>' +
                '</div>'
              : '') +
            '<p class="cm-small cm-dim cm-mb0">' + esc(t('home.request.note')) + '</p>' +
          '</div>';
      }
    })['catch'](function (err) {
      if (CM.config.debug) { console.error('[CM] home render failed', err); }
      [statsMount, continueMount, latestMount, requestMount].forEach(function (mount) {
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
    related: related,
    home: home,
    renderCard: renderCard,
    /* Exported so pages with their own filter controls - the technique and
       mitigation browsers - can bucket topics exactly as the shared listing
       does. Without this they had no way to offer an "All ready" filter, which
       is why the filter menu on mitre-techniques.html lacked one. */
    readiness: readiness,
    topicHref: topicHref,
    CATALOG_META: CATALOG_META,
    stripVendorLogos: stripVendorLogos
  };
})();
