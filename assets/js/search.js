/* ============================================================================
   CyberPulseAcademy - assets/js/search.js
   Client-side search over catalog.json. No server, no index file to rebuild,
   no external search service. Powers pages/search.html and the "no results"
   state everywhere else.

   Query syntax that is supported without a parser library:
     t1059            free text, ranked by which field matched
     "exact phrase"   quoted phrases
     type:technique   restrict to one catalog
     theme:crypto*    prefix match on theme
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function t(key, vars) { return CM.i18n ? CM.i18n.t(key, vars) : key; }
  function esc(v) { return CM.util.esc(v); }

  /* Wrap every matched term so the result list shows why it matched. */
  function highlight(text, terms) {
    var safe = esc(text);
    if (!terms.length) { return safe; }
    var pattern = terms
      .filter(function (term) { return term.length >= 2; })
      .map(function (term) { return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
      .join('|');
    if (!pattern) { return safe; }
    try {
      return safe.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) {
      return safe;
    }
  }

  function parseQuery(raw) {
    var text = String(raw || '');
    var filters = { type: null, theme: null };
    var phrases = [];
    text = text.replace(/"([^"]+)"/g, function (match, phrase) {
      phrases.push(phrase.toLowerCase());
      return ' ';
    });
    text = text.replace(/\btype:([a-z]+)/gi, function (match, value) {
      filters.type = value.toLowerCase();
      return ' ';
    });
    text = text.replace(/\btheme:([a-z0-9*+.-]+)/gi, function (match, value) {
      filters.theme = value.toLowerCase().replace(/\*$/, '');
      return ' ';
    });
    var terms = text.split(/\s+/).filter(Boolean).map(function (word) { return word.toLowerCase(); });
    return { terms: terms, phrases: phrases, filters: filters };
  }

  function scoreTopic(topic, parsed) {
    var title = String(topic.title || '').toLowerCase();
    var shortTitle = String(topic.shortTitle || '').toLowerCase();
    var id = String(topic.id || '').toLowerCase();
    var externalId = String(topic.externalId || '').toLowerCase();
    var theme = String(topic.theme || '').toLowerCase();
    var tags = (topic.tags || []).join(' ').toLowerCase();
    var objectives = (topic.objectives || []).join(' ').toLowerCase();
    var summary = String(topic.summary || '').toLowerCase();

    if (parsed.filters.type && topic.type !== parsed.filters.type) { return -1; }
    if (parsed.filters.theme && theme.indexOf(parsed.filters.theme) === -1) { return -1; }

    var score = 0;
    var i;

    for (i = 0; i < parsed.phrases.length; i++) {
      var phrase = parsed.phrases[i];
      if (title.indexOf(phrase) !== -1) { score += 60; }
      else if (summary.indexOf(phrase) !== -1) { score += 20; }
      else { return -1; }
    }

    for (i = 0; i < parsed.terms.length; i++) {
      var term = parsed.terms[i];
      var hit = false;
      if (externalId === term || externalId.replace('.', '-') === term) { score += 90; hit = true; }
      if (id === term) { score += 80; hit = true; }
      else if (id.indexOf(term) !== -1) { score += 30; hit = true; }
      if (title.indexOf(term) === 0) { score += 45; hit = true; }
      else if (title.indexOf(term) !== -1) { score += 28; hit = true; }
      if (shortTitle.indexOf(term) !== -1) { score += 18; hit = true; }
      if (tags.indexOf(term) !== -1) { score += 14; hit = true; }
      if (theme.indexOf(term) !== -1) { score += 10; hit = true; }
      if (objectives.indexOf(term) !== -1) { score += 5; hit = true; }
      if (summary.indexOf(term) !== -1) { score += 2; hit = true; }
      if (!hit) { return -1; }
    }
    return score;
  }

  /* ------------------------------------------------------------ the page */
  function mountSearch(options) {
    var opts = options || {};
    var mount = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!mount) { return Promise.resolve(); }

    mount.setAttribute('aria-busy', 'true');
    mount.innerHTML = '<div class="cm-state"><div class="cm-spinner" role="presentation"></div>' +
      '<p class="cm-mt2">' + esc(t('a11y.loading')) + '</p></div>';

    return CM.Store.getCatalog().then(function (catalog) {
      var initial = CM.util.param('q') || '';
      var state = { q: initial, type: 'all', sort: 'relevance' };

      var typeCounts = {};
      catalog.topics.forEach(function (tp) { typeCounts[tp.type] = (typeCounts[tp.type] || 0) + 1; });

      mount.innerHTML =
        '<form class="cm-toolbar" role="search" id="cm-search-form" onsubmit="return false">' +
          '<div class="cm-toolbar__search">' +
            '<label class="cm-vh" for="cm-search-input">' + esc(t('search.label')) + '</label>' +
            '<input class="cm-input" id="cm-search-input" type="search" autocomplete="off" ' +
              'placeholder="' + esc(t('search.placeholder')) + '" value="' + esc(initial) + '" ' +
              'aria-describedby="cm-search-hint">' +
            '<span class="cm-hint" id="cm-search-hint">' +
              esc('Tip: try T1059, "process injection", type:mitigation, theme:crypto') + '</span>' +
          '</div>' +
          '<label class="cm-vh" for="cm-search-type">' + esc(t('filter.catalog')) + '</label>' +
          '<select class="cm-select" id="cm-search-type" style="width:auto;min-width:210px">' +
            '<option value="all">' + esc('All catalogs') + ' (' + catalog.topics.length + ')</option>' +
            /* The conditional MUST be parenthesised. Without the parentheses,
               "+" binds tighter than "&&", so the whole expression is read as
               (everything built so far) && (this list), and because CATALOG_META
               is a truthy object the entire form, input and results container
               were thrown away and the search box never rendered. */
            (CM.render.CATALOG_META ? Object.keys(CM.render.CATALOG_META).map(function (type) {
              return '<option value="' + esc(type) + '">' + esc(t(CM.render.CATALOG_META[type].labelKey)) +
                     ' (' + (typeCounts[type] || 0) + ')</option>';
            }).join('') : '') +
          '</select>' +
          '<button type="button" class="cm-btn cm-btn--ghost cm-btn--sm" id="cm-search-clear">' +
            esc(t('search.clear')) + '</button>' +
        '</form>' +
        '<p class="cm-small cm-muted" id="cm-search-count" role="status" aria-live="polite"></p>' +
        '<div id="cm-search-results" class="cm-stack"></div>';

      var input = mount.querySelector('#cm-search-input');
      var typeSelect = mount.querySelector('#cm-search-type');
      var results = mount.querySelector('#cm-search-results');
      var countEl = mount.querySelector('#cm-search-count');

      function render() {
        var parsed = parseQuery(state.q);
        var pool = state.type === 'all'
          ? catalog.topics
          : catalog.topics.filter(function (tp) { return tp.type === state.type; });

        var scored = [];
        /* An empty query is a browse, not a search: show the pool in a stable
           order rather than nothing. */
        if (!parsed.terms.length && !parsed.phrases.length && !state.q.trim()) {
          scored = pool.slice(0, 40).map(function (tp) { return { topic: tp, score: 0 }; });
        } else {
          for (var i = 0; i < pool.length; i++) {
            var s = scoreTopic(pool[i], parsed);
            if (s >= 0) { scored.push({ topic: pool[i], score: s }); }
          }
          scored.sort(function (a, b) {
            if (b.score !== a.score) { return b.score - a.score; }
            return String(a.topic.title).localeCompare(String(b.topic.title));
          });
        }

        var terms = parsed.terms.concat(parsed.phrases);
        countEl.textContent = t('search.results', { count: scored.length });

        if (!scored.length) {
          var suggestions = catalog.topics.slice(0, 5).map(function (tp) {
            return '<li><a href="' + CM.render.topicHref(tp.id) + '">' + esc(tp.title) + '</a></li>';
          }).join('');
          results.innerHTML =
            '<div class="cm-state">' + CM.nav.svg('search') +
              '<h3>' + esc(t('search.noResults')) + '</h3>' +
              '<p>' + esc(t('search.noResultsHint')) + '</p>' +
              '<div class="cm-mt2"><p class="cm-small cm-muted">' + esc('Try one of these instead:') + '</p>' +
              '<ul class="cm-chips" style="justify-content:center">' + suggestions + '</ul></div>' +
            '</div>';
          return;
        }

        results.innerHTML =
          '<ul class="cm-searchlist">' + scored.map(function (item) {
            var topic = item.topic;
            var excerpt = String(topic.summary || '');
            if (excerpt.length > 200) { excerpt = excerpt.slice(0, 197).replace(/\s+\S*$/, '') + '...'; }
            var published = CM.util.publishedCount(topic);
            var total = CM.util.totalCount(topic);
            /* "Complete" is now "every slot this topic has is ready", not the
               fixed three the old batch model assumed. */
            var badge = total === 0 ? 'bad' : (published === total ? 'ok' : (published === 0 ? 'bad' : 'warn'));
            return '<li class="cm-card cm-card--hover">' +
              '<div class="cm-card__head"><h2 class="cm-card__title">' +
                '<a href="' + CM.render.topicHref(topic.id) + '">' + highlight(topic.title, terms) + '</a>' +
              '</h2></div>' +
              '<div class="cm-row cm-mb1">' +
                (topic.externalId ? '<span class="cm-badge cm-badge--id">' + esc(topic.externalId) + '</span>' : '') +
                '<span class="cm-badge cm-badge--theme">' + esc(topic.theme) + '</span>' +
                '<span class="cm-badge">' + esc(topic.type) + '</span>' +
                '<span class="cm-badge cm-badge--' + badge + '">' +
                  esc(published + ' of ' + total + ' batches ready') + '</span>' +
              '</div>' +
              '<p>' + highlight(excerpt, terms) + '</p>' +
            '</li>';
          }).join('') + '</ul>';
      }

      input.addEventListener('input', CM.util.debounce(function () {
        state.q = input.value;
        render();
        try {
          var params = new URLSearchParams(location.search);
          if (state.q) { params.set('q', state.q); } else { params.delete('q'); }
          history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params.toString() : ''));
        } catch (e) { /* ignore */ }
      }, 160));

      typeSelect.addEventListener('change', function () { state.type = typeSelect.value; render(); });

      mount.querySelector('#cm-search-clear').addEventListener('click', function () {
        state.q = ''; state.type = 'all';
        input.value = ''; typeSelect.value = 'all';
        input.focus();
        render();
      });

      /* "/" focuses the search field from anywhere on this page. */
      document.addEventListener('keydown', function (event) {
        var tag = (event.target && event.target.tagName) || '';
        if (event.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
          event.preventDefault(); input.focus(); input.select();
        }
      });

      mount.removeAttribute('aria-busy');
      render();
      if (initial) { input.focus(); }
    })['catch'](function () {
      mount.removeAttribute('aria-busy');
      mount.innerHTML = '<div class="cm-state">' + CM.nav.svg('alert') +
        '<h3>' + esc(t('error.catalog.title')) + '</h3><p>' + esc(t('error.catalog.body')) + '</p></div>';
    });
  }

  CM.search = { mount: mountSearch, scoreTopic: scoreTopic, parseQuery: parseQuery, highlight: highlight };
})();
