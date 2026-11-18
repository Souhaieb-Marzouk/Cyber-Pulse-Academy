/* ============================================================================
 * Indicator Bay 02 - rendering helpers (js/ui.js)
 * ----------------------------------------------------------------------------
 * Small building blocks shared by every section renderer: an element factory
 * (template functions instead of JSX), the inline icon bridge, chips, badges,
 * stamp buttons, selects and section shells - all mirroring the original
 * src/components/lab/ui.tsx one-to-one.
 * ========================================================================== */

'use strict';

window.LAB_UI = (function () {
  var ICONS = window.ICONS;

  /* --------------------------- element factory ------------------------ */

  /**
   * h('div', { class: 'x', onClick: fn, ... }, child, child, ...)
   * Children: strings become text nodes; nodes pass through; arrays flatten.
   */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var key in props) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
        var val = props[key];
        if (val === undefined || val === null || val === false) continue;
        if (key === 'class') {
          el.className = val;
        } else if (key === 'html') {
          el.innerHTML = val;
        } else if (key.slice(0, 2) === 'on' && typeof val === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), val);
        } else if (key === 'dataset') {
          for (var d in val) el.dataset[d] = val[d];
        } else if (val === true) {
          el.setAttribute(key, '');
        } else {
          el.setAttribute(key, String(val));
        }
      }
    }
    for (var i = 2; i < arguments.length; i++) appendChild(el, arguments[i]);
    return el;
  }

  function appendChild(el, child) {
    if (child === undefined || child === null || child === false) return;
    if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++) appendChild(el, child[i]);
      return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
      return;
    }
    if (typeof child === 'object') el.appendChild(child);
  }

  /* ------------------------------ icons ------------------------------- */

  function icon(name, cls, ariaLabel) {
    var span = h('span', { class: 'icon' + (cls ? ' ' + cls : '') });
    span.innerHTML = ICONS.icon(name, '', ariaLabel);
    return span;
  }

  /* ------------------------------ chips ------------------------------- */

  var CHIP_TONES = {
    stone: 'chip chip-stone',
    amber: 'chip chip-amber',
    green: 'chip chip-green',
    red: 'chip chip-red',
  };

  function Chip(children, tone) {
    return h('span', { class: CHIP_TONES[tone || 'stone'] }, children);
  }

  var PILLAR_LABELS = {
    P1: 'UNDERSTAND',
    P2: 'RECOGNIZE',
    P3: 'DETECT',
    P4: 'MITIGATE',
    'P1·P4': 'CHAIN+RESPOND',
  };

  function PillarBadge(pillar) {
    return h(
      'span',
      { class: 'pillar-badge', title: 'Mastery pillar ' + pillar },
      pillar + ' ' + (PILLAR_LABELS[pillar] || 'CHAIN+RESPOND'),
    );
  }

  function StampButton(active, children, onClick, ariaLabel) {
    return h(
      'button',
      {
        type: 'button',
        class: 'stamp-btn' + (active ? ' stamp-btn-active' : ''),
        'aria-pressed': active ? 'true' : 'false',
        'aria-label': ariaLabel || undefined,
        onClick: onClick,
      },
      children,
    );
  }

  /** Styled select mirroring the original selectClass() utility. */
  function Select(opts) {
    // opts: { value, onChange, ariaLabel, id, options: [{value,label}], groups: [{label,options}], disabled }
    var sel = h('select', {
      class: 'sel',
      id: opts.id || undefined,
      'aria-label': opts.ariaLabel || undefined,
      disabled: opts.disabled || undefined,
    });
    sel.value = opts.value || '';
    sel.addEventListener('change', function (e) {
      opts.onChange(e.target.value);
    });
    if (opts.groups) {
      opts.groups.forEach(function (g) {
        var og = h('optgroup', { label: g.label });
        g.options.forEach(function (o) {
          og.appendChild(h('option', { value: o.value }, o.label));
        });
        sel.appendChild(og);
      });
    } else {
      if (opts.placeholder) {
        sel.appendChild(h('option', { value: '' }, opts.placeholder));
      }
      (opts.options || []).forEach(function (o) {
        sel.appendChild(h('option', { value: o.value }, o.label));
      });
    }
    sel.value = opts.value || '';
    return sel;
  }

  /* --------------------------- section shell -------------------------- */

  var TONE_TEXT = {
    amber: 'tone-amber',
    green: 'tone-green',
    red: 'tone-red',
    slate: 'tone-slate',
  };

  function HazardStripe() {
    return h('div', { class: 'hazard-stripe', 'aria-hidden': 'true' });
  }

  function SectionShell(id, kicker, title, iconName, tone, children) {
    var toneClass = TONE_TEXT[tone || 'amber'];
    return h(
      'section',
      { id: id, class: 'section-shell', 'aria-labelledby': id + '-title' },
      h(
        'header',
        { class: 'section-header' },
        HazardStripe(),
        h(
          'div',
          { class: 'section-header-inner' },
          iconName ? icon(iconName, 'section-icon ' + toneClass) : null,
          h(
            'div',
            null,
            h('p', { class: 'kicker ' + toneClass }, kicker),
            h('h2', { id: id + '-title', class: 'section-title' }, title),
          ),
        ),
      ),
      h('div', { class: 'section-body' }, children),
    );
  }

  /* --------------------- focus + scroll preservation ------------------- */

  /** Remember the focused element (by stable key) and scroll positions. */
  function snapshot() {
    var active = document.activeElement;
    return {
      key: active && active !== document.body ? focusKey(active) : null,
      scrolls: Array.prototype.map.call(document.querySelectorAll('[data-keep-scroll]'), function (el) {
        return { key: focusKey(el), top: el.scrollTop };
      }),
    };
  }

  function focusKey(el) {
    return el.id || el.getAttribute('aria-label') || el.getAttribute('data-key') || null;
  }

  function restore(snap) {
    if (snap.key) {
      var el =
        document.getElementById(snap.key) ||
        document.querySelector('[aria-label="' + cssEscape(snap.key) + '"]') ||
        document.querySelector('[data-key="' + cssEscape(snap.key) + '"]');
      if (el && typeof el.focus === 'function') {
        try {
          el.focus();
        } catch (e) {
          /* not focusable anymore - fine */
        }
      }
    }
    snap.scrolls.forEach(function (s) {
      var el =
        document.getElementById(s.key) ||
        document.querySelector('[aria-label="' + cssEscape(s.key) + '"]') ||
        document.querySelector('[data-key="' + cssEscape(s.key) + '"]');
      if (el) el.scrollTop = s.top;
    });
  }

  function cssEscape(s) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(s);
    return s.replace(/"/g, '\\"');
  }

  /* ------------------------- shuffle utility -------------------------- */

  /** Fisher-Yates (same algorithm the original uses for pairing shuffles). */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  return {
    h: h,
    icon: icon,
    Chip: Chip,
    PillarBadge: PillarBadge,
    StampButton: StampButton,
    Select: Select,
    SectionShell: SectionShell,
    HazardStripe: HazardStripe,
    snapshot: snapshot,
    restore: restore,
    shuffle: shuffle,
  };
})();
