/* ============================================================================
   CyberPulseAcademy - assets/js/identity.js
   The identity gate. Collects a username and a country before an exercise,
   never before reading. Writes to localStorage under cm.identity.v1 through
   Store.storage, so Safari private mode degrades instead of crashing.
   MIT licensed. See LICENSE.
   ========================================================================== */
(function () {
  'use strict';
  var CM = window.CM;
  if (!CM) { return; }

  var KEY = 'cm.identity.v1';

  /* --------------------------------------------------------------------
     Full ISO 3166-1 alpha-2 list, name only. The flag emoji is COMPUTED
     from the two-letter code (regional indicator symbols), so there is no
     image sprite, no emoji table to keep in sync, and roughly 4 KB instead
     of 40 KB. "ZZ" is the ISO 3166-1 user-assigned code used here for a
     deliberate "prefer not to say" choice; the statistics code treats it as
     a real bucket, so the totals still add up.
     ------------------------------------------------------------------ */
  var ISO_RAW =
    'AD:Andorra|AE:United Arab Emirates|AF:Afghanistan|AG:Antigua and Barbuda|AI:Anguilla|AL:Albania|' +
    'AM:Armenia|AO:Angola|AQ:Antarctica|AR:Argentina|AS:American Samoa|AT:Austria|AU:Australia|AW:Aruba|' +
    'AX:Aland Islands|AZ:Azerbaijan|BA:Bosnia and Herzegovina|BB:Barbados|BD:Bangladesh|BE:Belgium|' +
    'BF:Burkina Faso|BG:Bulgaria|BH:Bahrain|BI:Burundi|BJ:Benin|BL:Saint Barthelemy|BM:Bermuda|' +
    'BN:Brunei Darussalam|BO:Bolivia|BQ:Bonaire, Sint Eustatius and Saba|BR:Brazil|BS:Bahamas|' +
    'BT:Bhutan|BV:Bouvet Island|BW:Botswana|BY:Belarus|BZ:Belize|CA:Canada|CC:Cocos (Keeling) Islands|' +
    'CD:Congo, Democratic Republic of the|CF:Central African Republic|CG:Congo|CH:Switzerland|' +
    'CI:Cote d Ivoire|CK:Cook Islands|CL:Chile|CM:Cameroon|CN:China|CO:Colombia|CR:Costa Rica|CU:Cuba|' +
    'CV:Cabo Verde|CW:Curacao|CX:Christmas Island|CY:Cyprus|CZ:Czechia|DE:Germany|DJ:Djibouti|' +
    'DK:Denmark|DM:Dominica|DO:Dominican Republic|DZ:Algeria|EC:Ecuador|EE:Estonia|EG:Egypt|' +
    'EH:Western Sahara|ER:Eritrea|ES:Spain|ET:Ethiopia|FI:Finland|FJ:Fiji|FK:Falkland Islands|' +
    'FM:Micronesia|FO:Faroe Islands|FR:France|GA:Gabon|GB:United Kingdom|GD:Grenada|GE:Georgia|' +
    'GF:French Guiana|GG:Guernsey|GH:Ghana|GI:Gibraltar|GL:Greenland|GM:Gambia|GN:Guinea|' +
    'GP:Guadeloupe|GQ:Equatorial Guinea|GR:Greece|GS:South Georgia and the South Sandwich Islands|' +
    'GT:Guatemala|GU:Guam|GW:Guinea-Bissau|GY:Guyana|HK:Hong Kong|HM:Heard Island and McDonald Islands|' +
    'HN:Honduras|HR:Croatia|HT:Haiti|HU:Hungary|ID:Indonesia|IE:Ireland|IL:Israel|IM:Isle of Man|' +
    'IN:India|IO:British Indian Ocean Territory|IQ:Iraq|IR:Iran|IS:Iceland|IT:Italy|JE:Jersey|' +
    'JM:Jamaica|JO:Jordan|JP:Japan|KE:Kenya|KG:Kyrgyzstan|KH:Cambodia|KI:Kiribati|KM:Comoros|' +
    'KN:Saint Kitts and Nevis|KP:Korea, Democratic People s Republic of|KR:Korea, Republic of|' +
    'KW:Kuwait|KY:Cayman Islands|KZ:Kazakhstan|LA:Lao People s Democratic Republic|LB:Lebanon|' +
    'LC:Saint Lucia|LI:Liechtenstein|LK:Sri Lanka|LR:Liberia|LS:Lesotho|LT:Lithuania|LU:Luxembourg|' +
    'LV:Latvia|LY:Libya|MA:Morocco|MC:Monaco|MD:Moldova|ME:Montenegro|MF:Saint Martin (French part)|' +
    'MG:Madagascar|MH:Marshall Islands|MK:North Macedonia|ML:Mali|MM:Myanmar|MN:Mongolia|MO:Macao|' +
    'MP:Northern Mariana Islands|MQ:Martinique|MR:Mauritania|MS:Montserrat|MT:Malta|MU:Mauritius|' +
    'MV:Maldives|MW:Malawi|MX:Mexico|MY:Malaysia|MZ:Mozambique|NA:Namibia|NC:New Caledonia|NE:Niger|' +
    'NF:Norfolk Island|NG:Nigeria|NI:Nicaragua|NL:Netherlands|NO:Norway|NP:Nepal|NR:Nauru|NU:Niue|' +
    'NZ:New Zealand|OM:Oman|PA:Panama|PE:Peru|PF:French Polynesia|PG:Papua New Guinea|PH:Philippines|' +
    'PK:Pakistan|PL:Poland|PM:Saint Pierre and Miquelon|PN:Pitcairn|PR:Puerto Rico|PS:Palestine, State of|' +
    'PT:Portugal|PW:Palau|PY:Paraguay|QA:Qatar|RE:Reunion|RO:Romania|RS:Serbia|RU:Russian Federation|' +
    'RW:Rwanda|SA:Saudi Arabia|SB:Solomon Islands|SC:Seychelles|SD:Sudan|SE:Sweden|SG:Singapore|' +
    'SH:Saint Helena, Ascension and Tristan da Cunha|SI:Slovenia|SJ:Svalbard and Jan Mayen|SK:Slovakia|' +
    'SL:Sierra Leone|SM:San Marino|SN:Senegal|SO:Somalia|SR:Suriname|SS:South Sudan|' +
    'ST:Sao Tome and Principe|SV:El Salvador|SX:Sint Maarten (Dutch part)|SY:Syrian Arab Republic|' +
    'SZ:Eswatini|TC:Turks and Caicos Islands|TD:Chad|TF:French Southern Territories|TG:Togo|' +
    'TH:Thailand|TJ:Tajikistan|TK:Tokelau|TL:Timor-Leste|TM:Turkmenistan|TN:Tunisia|TO:Tonga|' +
    'TR:Turkiye|TT:Trinidad and Tobago|TV:Tuvalu|TW:Taiwan|TZ:Tanzania|UA:Ukraine|UG:Uganda|' +
    'UM:United States Minor Outlying Islands|US:United States|UY:Uruguay|UZ:Uzbekistan|' +
    'VA:Holy See|VC:Saint Vincent and the Grenadines|VE:Venezuela|VG:Virgin Islands, British|' +
    'VI:Virgin Islands, U.S.|VN:Viet Nam|VU:Vanuatu|WF:Wallis and Futuna|WS:Samoa|YE:Yemen|' +
    'YT:Mayotte|ZA:South Africa|ZM:Zambia|ZW:Zimbabwe|ZZ:Prefer not to say';

  /* Some entries above are written name:code rather than code:name purely to
     keep very long official names readable; normalise both forms here so the
     array is always a clean, correctly sorted code/name pair. */
  var COUNTRIES = (function () {
    var parts = ISO_RAW.split('|');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var bits = parts[i].split(':');
      if (bits.length !== 2) { continue; }
      var a = bits[0], b = bits[1];
      var code, name;
      if (/^[A-Z]{2}$/.test(a)) { code = a; name = b; }
      else { code = b; name = a; }
      out.push({ code: code, name: name, flag: CM.util.flag(code) });
    }
    /* "Prefer not to say" belongs at the very end, after the alphabetical
       list, and never sorts into the middle of it. */
    out = out.filter(function (c) { return c.code !== 'ZZ'; });
    out.sort(function (x, y) { return x.name.localeCompare(y.name); });
    out.push({ code: 'ZZ', name: 'Prefer not to say', flag: CM.util.flag('ZZ') });
    return out;
  })();

  var COUNTRY_BY_CODE = (function () {
    var map = {};
    for (var i = 0; i < COUNTRIES.length; i++) { map[COUNTRIES[i].code] = COUNTRIES[i]; }
    return map;
  })();

  /* A deliberately short, conservative local list. It exists to stop obvious
     abuse of the public statistics, not to police language. The check runs
     entirely on the device and the input is never sent anywhere. Only exact
     word matches are rejected, so ordinary names containing these strings as
     substrings are still allowed. */
  var BLOCKED_WORDS = [
    'admin', 'administrator', 'root', 'moderator', 'official', 'cyberpulseacademy',
    'mitre', 'comptia', 'isc2', 'isaca', 'offsec', 'eccouncil', 'giac',
    'fuck', 'shit', 'cunt', 'bitch', 'asshole', 'bastard', 'dick', 'piss',
    'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut'
  ];

  function isBlocked(name) {
    var lowered = String(name).toLowerCase();
    var words = lowered.split(/[^a-z0-9]+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      if (BLOCKED_WORDS.indexOf(words[i]) !== -1) { return true; }
    }
    /* Also catch the whole-field case, e.g. a name of exactly "admin1". */
    var collapsed = lowered.replace(/[^a-z]/g, '');
    for (var j = 0; j < BLOCKED_WORDS.length; j++) {
      var w = BLOCKED_WORDS[j];
      if (w.length >= 5 && collapsed === w) { return true; }
    }
    return false;
  }

  var NAME_RE = /^[A-Za-z0-9_.-]{2,32}$/;

  var state = { name: '', country: '', consented: false };

  var Identity = {
    countries: COUNTRIES,
    countryByCode: function (code) { return COUNTRY_BY_CODE[String(code || '').toUpperCase()] || null; },

    get: function () {
      var raw = CM.store.storage.get(KEY, null);
      if (!raw || typeof raw !== 'object') { return null; }
      if (!raw.name || !raw.country) { return null; }
      return raw;
    },

    exists: function () { return Identity.get() !== null; },

    /* Validate before saving so the modal can show field-level errors. */
    validate: function (candidate) {
      var errors = {};
      var name = String(candidate.name || '').trim();
      if (name.length < 2) { errors.name = 'identity.nameRequired'; }
      else if (!NAME_RE.test(name)) { errors.name = 'identity.nameInvalid'; }
      else if (isBlocked(name)) { errors.name = 'identity.nameBlocked'; }
      var code = String(candidate.country || '').toUpperCase();
      if (!COUNTRY_BY_CODE[code]) { errors.country = 'identity.countryRequired'; }
      if (!candidate.consented) { errors.consent = 'identity.consentRequired'; }
      return { ok: Object.keys(errors).length === 0, errors: errors, name: name, country: code };
    },

    save: function (candidate) {
      var result = Identity.validate(candidate);
      if (!result.ok) { return result; }
      var existing = Identity.get() || {};
      var record = {
        name: result.name,
        country: result.country,
        consented: true,
        consentedAt: existing.consentedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      CM.store.storage.set(KEY, record);
      state.name = record.name;
      state.country = record.country;
      state.consented = true;
      document.dispatchEvent(new CustomEvent('cm:identity-changed', { detail: record }));
      return { ok: true, identity: record };
    },

    /* Delete every key this site owns, not just the identity. */
    deleteAll: function () {
      var removed = CM.store.storage.clearAll();
      state = { name: '', country: '', consented: false };
      document.dispatchEvent(new CustomEvent('cm:identity-deleted', { detail: { removed: removed } }));
      return removed;
    },

    /* ------------------------------------------------------------------
       The gate. Reading pages is never blocked. A batch start calls
       Identity.require() which either resolves with the identity or opens
       the modal and resolves once the user completes it.
       ------------------------------------------------------------------ */
    require: function () {
      var existing = Identity.get();
      if (existing) { return Promise.resolve(existing); }
      return Identity.openModal({ mandatory: true });
    },

    openModal: function (options) {
      var opts = options || {};
      return new Promise(function (resolve) {
        buildModal(opts, function (identity) {
          closeModal();
          resolve(identity);
        }, function () {
          closeModal();
          resolve(null);
        });
      });
    },

    /* Render the read-only chip in the header. */
    renderChip: function (mount) {
      if (!mount) { return; }
      var id = Identity.get();
      var country = id ? COUNTRY_BY_CODE[id.country] : null;
      if (!id) {
        mount.innerHTML = '<span class="cm-chip-id__name">' + CM.util.esc(CM.i18n ? CM.i18n.t('identity.title') : 'Set identity') + '</span>';
        mount.setAttribute('aria-label', 'Set your name and country');
      } else {
        mount.innerHTML =
          '<span aria-hidden="true">' + (country ? country.flag : '\uD83C\uDF10') + '</span>' +
          '<span class="cm-chip-id__name">' + CM.util.esc(id.name) + '</span>' +
          '<span class="cm-dim" aria-hidden="true">\u00B7</span>' +
          '<span class="cm-mono cm-tiny">' + CM.util.esc(id.country) + '</span>';
        mount.setAttribute('aria-label', 'Identity: ' + id.name + ' from ' + (country ? country.name : id.country) + '. Select to edit.');
      }
      if (!mount.getAttribute('data-bound')) {
        mount.setAttribute('data-bound', '1');
        mount.addEventListener('click', function () { Identity.openModal({}); });
      }
    },

    open: function () { return Identity.openModal({}); },
    isBlockedName: isBlocked
  };

  /* -------------------------------------------------------------- modal UI */
  var modalEl = null;
  var lastFocused = null;

  function closeModal() {
    if (!modalEl) { return; }
    modalEl.hidden = true;
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === 'function') { lastFocused.focus(); }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      /* A mandatory gate must not be dismissible by Escape, but a voluntary
         edit of an existing identity must be. */
      if (modalEl && modalEl.getAttribute('data-mandatory') === 'true') { return; }
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab' || !modalEl) { return; }
    /* Simple focus trap: keep keyboard focus inside the dialog. */
    var focusables = modalEl.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) { return; }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function t(key) { return CM.i18n ? CM.i18n.t(key) : key; }

  function buildModal(opts, onSaved, onCancel) {
    var existing = Identity.get() || { name: '', country: '', consented: false };
    lastFocused = document.activeElement;

    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'cm-modal';
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.setAttribute('aria-labelledby', 'cm-id-title');
      document.body.appendChild(modalEl);
    }

    modalEl.setAttribute('data-mandatory', opts.mandatory ? 'true' : 'false');
    modalEl.hidden = false;

    var editable = !opts.mandatory;
    var countryLabel = existing.country && COUNTRY_BY_CODE[existing.country]
      ? COUNTRY_BY_CODE[existing.country].flag + ' ' + COUNTRY_BY_CODE[existing.country].name + ' (' + existing.country + ')'
      : '';

    modalEl.innerHTML =
      '<div class="cm-modal__panel" role="document">' +
        '<div class="cm-modal__head">' +
          '<h2 id="cm-id-title">' + CM.util.esc(t('identity.title')) + '</h2>' +
          (editable ? '<button type="button" class="cm-modal__close" data-act="cancel" aria-label="' + CM.util.esc(t('action.close')) + '">&times;</button>' : '') +
        '</div>' +
        '<p class="cm-small cm-muted">' + CM.util.esc(t('identity.intro')) + '</p>' +
        '<form novalidate>' +
          '<div class="cm-field">' +
            '<label class="cm-label" for="cm-id-name">' + CM.util.esc(t('identity.nameLabel')) + '</label>' +
            '<input class="cm-input" id="cm-id-name" name="name" type="text" autocomplete="nickname" ' +
              'maxlength="32" required aria-describedby="cm-id-name-hint cm-id-name-err" ' +
              'value="' + CM.util.esc(existing.name || '') + '">' +
            '<span class="cm-hint" id="cm-id-name-hint">' + CM.util.esc(t('identity.nameHint')) + '</span>' +
            '<span class="cm-error" id="cm-id-name-err" role="alert" hidden></span>' +
          '</div>' +
          '<div class="cm-field">' +
            '<label class="cm-label" for="cm-id-country-search">' + CM.util.esc(t('identity.countryLabel')) + '</label>' +
            '<input class="cm-input" id="cm-id-country-search" type="text" autocomplete="off" ' +
              'placeholder="' + CM.util.esc(t('identity.countrySearch')) + '" value="' + CM.util.esc(countryLabel) + '" ' +
              'aria-describedby="cm-id-country-err" role="combobox" aria-expanded="false" aria-controls="cm-id-country-list">' +
            '<div class="cm-country__list" id="cm-id-country-list" role="listbox" ' +
              'aria-label="' + CM.util.esc(t('identity.countryLabel')) + '" hidden></div>' +
            '<span class="cm-error" id="cm-id-country-err" role="alert" hidden></span>' +
          '</div>' +
          '<div class="cm-field">' +
            '<label class="cm-check">' +
              '<input type="checkbox" id="cm-id-consent" ' + (existing.consented ? 'checked' : '') + '>' +
              '<span>' + CM.util.esc(t('identity.consent')) + ' ' +
                '<a href="' + CM.util.url('pages/privacy.html') + '">' + CM.util.esc(t('footer.privacy')) + '</a>' +
              '</span>' +
            '</label>' +
            '<span class="cm-error" id="cm-id-consent-err" role="alert" hidden></span>' +
          '</div>' +
          '<div class="cm-modal__foot cm-modal__foot--split">' +
            (existing.name ? '<button type="button" class="cm-btn cm-btn--danger cm-btn--sm" data-act="delete">' + CM.util.esc(t('identity.delete')) + '</button>' : '<span></span>') +
            '<span class="cm-row">' +
              (editable ? '<button type="button" class="cm-btn cm-btn--ghost" data-act="cancel">' + CM.util.esc(t('action.cancel')) + '</button>' : '') +
              '<button type="submit" class="cm-btn cm-btn--primary">' + CM.util.esc(t('identity.save')) + '</button>' +
            '</span>' +
          '</div>' +
        '</form>' +
      '</div>';

    var form = modalEl.querySelector('form');
    var nameInput = modalEl.querySelector('#cm-id-name');
    var searchInput = modalEl.querySelector('#cm-id-country-search');
    var listBox = modalEl.querySelector('#cm-id-country-list');
    var consent = modalEl.querySelector('#cm-id-consent');
    var nameErr = modalEl.querySelector('#cm-id-name-err');
    var countryErr = modalEl.querySelector('#cm-id-country-err');
    var consentErr = modalEl.querySelector('#cm-id-consent-err');

    var selected = existing.country && COUNTRY_BY_CODE[existing.country] ? existing.country : '';

    function renderCountries(filter) {
      var q = String(filter || '').trim().toLowerCase();
      /* Never treat the pre-filled country label as a filter term. */
      if (q.indexOf('(') !== -1) { q = ''; }
      var html = '';
      var shown = 0;
      for (var i = 0; i < COUNTRIES.length; i++) {
        var c = COUNTRIES[i];
        if (q && c.name.toLowerCase().indexOf(q) === -1 && c.code.toLowerCase().indexOf(q) === -1) { continue; }
        shown++;
        if (shown > 400) { break; }
        html += '<button type="button" class="cm-country__opt" role="option" data-code="' + c.code + '" ' +
                'aria-selected="' + (c.code === selected ? 'true' : 'false') + '">' +
                '<span class="cm-country__flag" aria-hidden="true">' + c.flag + '</span>' +
                '<span>' + CM.util.esc(c.name) + '</span>' +
                '<span class="cm-country__code">' + c.code + '</span></button>';
      }
      listBox.innerHTML = html || '<p class="cm-small cm-muted" style="padding:.6rem">No country matches that filter.</p>';
    }

    function openList() {
      listBox.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
      renderCountries('');
    }
    function closeList() {
      listBox.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
    }

    searchInput.addEventListener('focus', openList);
    searchInput.addEventListener('input', function () {
      selected = '';
      listBox.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
      renderCountries(searchInput.value);
    });
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' && listBox.hidden) { openList(); }
    });

    listBox.addEventListener('click', function (event) {
      var btn = event.target.closest('.cm-country__opt');
      if (!btn) { return; }
      selected = btn.getAttribute('data-code');
      var c = COUNTRY_BY_CODE[selected];
      searchInput.value = c.flag + ' ' + c.name + ' (' + c.code + ')';
      countryErr.hidden = true;
      closeList();
    });

    /* Close the list when focus or a click leaves the combobox. */
    document.addEventListener('click', function onDocClick(event) {
      if (!modalEl || modalEl.hidden) { document.removeEventListener('click', onDocClick); return; }
      if (!modalEl.contains(event.target)) { closeList(); }
    });

    modalEl.querySelectorAll('[data-act="cancel"]').forEach(function (btn) {
      btn.addEventListener('click', function () { onCancel(); });
    });
    var delBtn = modalEl.querySelector('[data-act="delete"]');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        Identity.deleteAll();
        onSaved(null);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      nameErr.hidden = true; countryErr.hidden = true; consentErr.hidden = true;
      nameInput.removeAttribute('aria-invalid');
      searchInput.removeAttribute('aria-invalid');

      var candidate = { name: nameInput.value, country: selected, consented: consent.checked };
      var result = Identity.validate(candidate);
      if (!result.ok) {
        if (result.errors.name) {
          nameErr.textContent = t(result.errors.name); nameErr.hidden = false;
          nameInput.setAttribute('aria-invalid', 'true'); nameInput.focus();
        } else if (result.errors.country) {
          countryErr.textContent = t(result.errors.country); countryErr.hidden = false;
          searchInput.setAttribute('aria-invalid', 'true'); searchInput.focus();
        } else if (result.errors.consent) {
          consentErr.textContent = t(result.errors.consent); consentErr.hidden = false; consent.focus();
        }
        return;
      }
      var saved = Identity.save(candidate);
      if (saved.ok) { onSaved(saved.identity); }
    });

    document.addEventListener('keydown', onKeydown, true);
    setTimeout(function () { nameInput.focus(); }, 30);
  }

  CM.identity = Identity;
  CM.Identity = Identity;
})();
