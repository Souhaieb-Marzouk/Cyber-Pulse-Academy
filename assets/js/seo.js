/* ============================================================================
   CyberPulseAcademy - assets/js/seo.js
   Injects per-topic structured data and social metadata at runtime.

   The static <title>, meta description, canonical and Open Graph tags are
   written into each generated topic page by scripts/generate_pages.py, because
   crawlers and link unfurlers must see them without executing JavaScript.
   This module adds the JSON-LD graph, which is richer than a template can
   reasonably be, and repairs the tags if a page is ever served from an
   unexpected host.

   JSON-LD emitted per topic:
     Quiz      with educationalLevel, typicalAgeRange, assesses, numberOfQuestions
     FAQPage   with 4 real questions derived from the topic's own data
     Course    when the topic is a certification, because that genuinely is
               course-like study material
     BreadcrumbList for the topic's position in the catalog
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  function absolute(relPath) {
    /* og:url and @id values must be absolute. CM.util.url already returns an
       absolute URL because it is built from this deployment's own root. */
    return CM.util.url(relPath);
  }

  /* Keep whatever the build script chose. If the page already names a PNG
     preview, leave it alone; only fall back to the SVG when no image tag was
     generated at all. This avoids silently downgrading a raster preview to an
     SVG that LinkedIn will ignore. */
  function previewImage(topicId) {
    var existing = document.head.querySelector('meta[property="og:image"]');
    if (existing && /\/assets\/img\/og\/[^"?]+\.(png|svg)$/.test(existing.getAttribute('content') || '')) {
      return existing.getAttribute('content');
    }
    return absolute('assets/img/og/' + topicId + '.svg');
  }

  function firstSentences(text, count) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) { return ''; }
    var parts = clean.match(/[^.!?]+[.!?]+/g);
    if (!parts || !parts.length) { return clean; }
    return parts.slice(0, count || 2).join(' ').trim();
  }

  function buildFaqs(topic) {
    var faqs = [];
    var isMitre = ['tactic', 'technique', 'mitigation', 'detection', 'group'].indexOf(topic.type) !== -1;
    var isCert = topic.type === 'certification';
    var difficulty = String(topic.difficulty || 'extreme').replace('-', ' ');

    faqs.push({
      q: 'What is ' + topic.title + '?',
      a: firstSentences(topic.summary, 2)
    });

    faqs.push({
      q: 'How hard are the ' + topic.title + ' practice exercises on CyberPulseAcademy?',
      a: 'The exercises are graded ' + difficulty + '. Each topic has three independent batches: one focused on detection and triage, one on hands-on response and configuration, and one adversarial batch written from the attacker perspective with ATT&CK mapping and report drafting. You need roughly 70 percent to pass a batch.'
    });

    faqs.push({
      q: 'How many ' + topic.title + ' practice questions are there?',
      a: 'Three separate exercise batches are reserved for this topic, each a standalone interactive exam with its own question set, terminal or query tasks and a scored results screen. The coverage dashboard on this site shows exactly which of the three are published today.'
    });

    faqs.push({
      q: 'Is CyberPulseAcademy official ' + (isCert ? topic.theme + ' study material' : isMitre ? 'MITRE ATT&CK content' : 'training') + '?',
      a: isCert
        ? 'No. CyberPulseAcademy is an independent, community-run study resource. It is not affiliated with, endorsed by, or sponsored by ' + topic.theme + ' or any other vendor, and no vendor logo appears anywhere on this site. Objective summaries are paraphrased from publicly available exam objectives.'
        : isMitre
          ? 'No. ATT&CK is a registered trademark of The MITRE Corporation. Content here is derived from the publicly available ATT&CK knowledge base and from community-authored detection guidance. It is not official MITRE material and MITRE has not reviewed or approved it.'
          : 'No. CyberPulseAcademy is independent and community-run. It is a free study resource and is not affiliated with any vendor, certification body or training provider.'
    });

    faqs.push({
      q: 'Does CyberPulseAcademy track me?',
      a: 'No tracking cookies, no third-party scripts and no fingerprinting. The name and country you enter are stored only in your own browser, and the statistics page states plainly which mode the site is running in and what that means for your data.'
    });

    return faqs;
  }

  function buildGraph(topic, catalog) {
    var pageUrl = absolute('topics/' + topic.id + '.html');
    var siteUrl = CM.ROOT;
    var graph = [];

    graph.push({
      '@type': 'BreadcrumbList',
      '@id': pageUrl + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: topic.theme, item: siteUrl + 'pages/' + catalogPageFor(topic.type) },
        { '@type': 'ListItem', position: 3, name: topic.title, item: pageUrl }
      ]
    });

    var quiz = {
      '@type': 'Quiz',
      '@id': pageUrl + '#quiz',
      name: topic.title + ' practice exam',
      description: firstSentences(topic.summary, 2),
      url: pageUrl,
      inLanguage: 'en',
      educationalLevel: topic.difficulty === 'hard' ? 'Intermediate' : 'Expert',
      typicalAgeRange: '16-',
      learningResourceType: 'Practice exam',
      numberOfQuestions: 3,
      isAccessibleForFree: true,
      assesses: (topic.objectives && topic.objectives.length
        ? topic.objectives.slice(0, 6)
        : [topic.title + ' concepts and their real-world application']),
      about: (topic.tags || []).slice(0, 8).map(function (tag) {
        return { '@type': 'Thing', name: tag };
      }),
      provider: {
        '@type': 'Organization',
        name: 'CyberPulseAcademy',
        url: siteUrl
      },
      isPartOf: { '@type': 'WebSite', name: 'CyberPulseAcademy', url: siteUrl }
    };
    if (topic.externalId) {
      quiz.alternateName = topic.externalId + ' ' + topic.title;
    }
    graph.push(quiz);

    graph.push({
      '@type': 'FAQPage',
      '@id': pageUrl + '#faq',
      mainEntity: buildFaqs(topic).map(function (item) {
        return {
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        };
      })
    });

    /* Only certifications are genuinely course-like, so only they get Course. */
    if (topic.type === 'certification') {
      graph.push({
        '@type': 'Course',
        '@id': pageUrl + '#course',
        name: topic.title + ' study track',
        description: firstSentences(topic.summary, 1),
        url: pageUrl,
        inLanguage: 'en',
        isAccessibleForFree: true,
        educationalCredentialAwarded: topic.externalId || topic.title,
        teaches: (topic.objectives || []).slice(0, 10),
        provider: { '@type': 'Organization', name: 'CyberPulseAcademy', url: siteUrl },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT20H'
        }
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function catalogPageFor(type) {
    var meta = CM.render && CM.render.CATALOG_META && CM.render.CATALOG_META[type];
    return meta ? meta.path : 'pages/search.html';
  }

  function injectJSONLD(graph, id) {
    var nodeId = 'cm-jsonld-' + id;
    var existing = document.getElementById(nodeId);
    if (existing && existing.parentNode) { existing.parentNode.removeChild(existing); }
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = nodeId;
    script.textContent = JSON.stringify(graph);
    document.head.appendChild(script);
  }

  function setMeta(selector, attr, value) {
    if (value === undefined || value === null) { return; }
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      var match = /\[(name|property)="([^"]+)"\]/.exec(selector);
      if (match) { node.setAttribute(match[1], match[2]); }
      document.head.appendChild(node);
    }
    node.setAttribute(attr, value);
  }

  /* ------------------------------------------------------------------ run */
  function run() {
    var host = document.querySelector('[data-cm-topic-page]');
    var topicId = host ? host.getAttribute('data-cm-topic-page')
                       : (document.body && document.body.getAttribute('data-cm-topic'));
    if (!topicId) { return; }

    CM.Store.getTopic(topicId).then(function (topic) {
      if (!topic) { return; }
      return CM.Store.getCatalog().then(function (catalog) {
        /* scripts/generate_pages.py already wrote a static Quiz + FAQPage +
           BreadcrumbList graph into the page, exactly so that crawlers and
           link unfurlers see it without running JavaScript. This module only
           adds what cannot be known at build time (the Course node) and
           repairs absolute URLs if the site has moved hostname. */
        injectJSONLD(
          { '@context': 'https://schema.org', '@graph': courseNodes(topic, catalog) },
          'course-' + topic.id
        );

        /* Repair social metadata at runtime. The static tags written by
           generate_pages.py are the primary source; this guarantees the
           absolute URL is right even if the site moves to a new hostname. */
        var pageUrl = absolute('topics/' + topic.id + '.html');
        var canonical = document.head.querySelector('link[rel="canonical"]');
        if (canonical) { canonical.setAttribute('href', pageUrl); }
        setMeta('meta[property="og:url"]', 'content', pageUrl);
        setMeta('meta[property="og:title"]', 'content', topic.title + ' practice exam');
        setMeta('meta[property="og:type"]', 'content', 'article');
        setMeta('meta[property="og:image"]', 'content', previewImage(topic.id));
        setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
        setMeta('meta[name="twitter:title"]', 'content', topic.title + ' practice exam');

        /* Only fill the FAQ block if the static one is absent. Never overwrite
           server-rendered content with a client-side approximation of it. */
        var faqMount = document.getElementById('cm-faq');
        if (faqMount && faqMount.childElementCount === 0) {
          faqMount.innerHTML = buildFaqs(topic).map(function (item, index) {
            return '<details class="cm-details"' + (index === 0 ? ' open' : '') + '>' +
              '<summary>' + CM.util.esc(item.q) + '</summary>' +
              '<div class="cm-details__body"><p>' + CM.util.esc(item.a) + '</p></div>' +
            '</details>';
          }).join('');
        }
      });
    })['catch'](function (err) {
      if (CM.config.debug) { console.warn('[CM] seo injection skipped', err); }
    });
  }

  /* The one node the build script does not emit: Course, and only for
     certifications, because only they are genuinely course-like. */
  function courseNodes(topic, catalog) {
    var nodes = [];
    if (topic.type === 'certification') {
      var pageUrl = absolute('topics/' + topic.id + '.html');
      nodes.push({
        '@type': 'Course',
        '@id': pageUrl + '#course',
        name: topic.title + ' study track',
        description: firstSentences(topic.summary, 1),
        url: pageUrl,
        inLanguage: 'en',
        isAccessibleForFree: true,
        educationalCredentialAwarded: topic.externalId || topic.title,
        teaches: (topic.objectives || []).slice(0, 10),
        provider: { '@type': 'Organization', name: 'CyberPulseAcademy', url: CM.ROOT },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT20H'
        }
      });
    }
    return nodes;
  }

  CM.seo = { run: run, buildGraph: buildGraph, buildFaqs: buildFaqs };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', run); }
  else { run(); }
})();
