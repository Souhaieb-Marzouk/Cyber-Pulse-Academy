// ── The Access Bureau — the five desk stations + objective blocks ─────────
// Vanilla re-implementation of the original lab's stations.tsx: identical
// widgets, wording, difficulty gating and interaction semantics.
// Renders HTML strings; the delegated handlers in app.js dispatch the
// data-action attributes to the update helpers at the bottom of this file.
'use strict';
(function (global) {
  const D = global.ABData;
  const OBJ = global.ABObjectives;
  const ui = global.ABUI;

  // transient UI state (never persisted — mirrors React local state)
  let openDossierId = null;   // expanded dossier card in the Intake Desk
  let railHtmlCache = {};     // last rendered rail markup per kind (for focus restore)

  function toggleIn(arr, id) {
    return arr.includes(id) ? arr.filter(function (x) { return x !== id; }) : arr.concat([id]);
  }

  // ══════════════ OBJECTIVE BLOCK (check + hints + educational feedback) ══════════════

  function objBlockInner(id) {
    const store = global.ABStore;
    const mode = store.state.mode;
    if (!mode) return '';
    const obj = OBJ.objectivesFor(mode).find(function (o) { return o.id === id; });
    if (!obj) return '';
    const st = store.state.objState[id];
    const fb = store.state.feedback[id];
    const passed = !!(st && st.passed);
    const hintsShown = st ? st.hints : 0;

    let html = '';
    html += '<div class="objblock-head">';
    html += '<span class="obj-id">' + ui.esc(obj.id) + '</span>';
    html += '<span class="obj-pillar">' + ui.esc(obj.pillar) + '</span>';
    html += '<h4 class="obj-title">' + ui.esc(obj.title) + '</h4>';
    if (passed) html += '<span class="ml-auto">' + ui.stampMark('ok') + '</span>';
    html += '</div>';
    html += '<p class="obj-task"><span class="strong">Work order:</span> ' + ui.esc(obj.task) + '</p>';
    html += '<p class="obj-context">' + ui.esc(obj.context) + '</p>';
    html += '<div class="obj-actions">';
    html += ui.stampButton({ action: 'stamp', id: id, disabled: passed });
    if (!passed && hintsShown < obj.hints.length) {
      html += '<button type="button" data-action="hint" data-id="' + ui.esc(id) + '" data-focus-key="hint-' + ui.esc(id) + '" class="btn-hint">' +
        ui.icon('Lightbulb', 'ic-16') + '<span>' +
        (mode === 'hard' ? 'Nudge (costs stars)' : 'Hint ' + (hintsShown + 1) + '/' + obj.hints.length) +
        '</span></button>';
    }
    if (st && st.attempts > 0 && !passed) {
      html += '<span class="attempts">attempts: ' + st.attempts + '</span>';
    }
    html += '</div>';
    if (hintsShown > 0) {
      html += '<ul class="hint-list" aria-label="Hints revealed">' +
        obj.hints.slice(0, hintsShown).map(function (h) {
          return '<li>' + ui.icon('Lightbulb', 'ic-16') + '<span>' + ui.esc(h) + '</span></li>';
        }).join('') + '</ul>';
    }
    if (fb) {
      html += '<div role="status" aria-live="polite" class="obj-feedback ' + (fb.pass ? 'obj-feedback--pass' : 'obj-feedback--no') + '">' +
        ui.esc(fb.feedback) + '</div>';
    }
    return html;
  }

  function renderObjBlock(id) {
    if (!objBlockInner(id)) return '';
    return '<div class="objblock" data-obj="' + ui.esc(id) + '" aria-label="Objective ' + ui.esc(id) + '">' + objBlockInner(id) + '</div>';
  }

  /** Re-render one objective block in place (keeps scroll, restores focus). */
  function updateObjBlock(id) {
    const el = document.querySelector('[data-obj="' + id + '"]');
    if (!el) return;
    const hadFocus = el.contains(document.activeElement)
      ? (document.activeElement.getAttribute('data-focus-key') || null) : null;
    el.innerHTML = objBlockInner(id);
    if (hadFocus) {
      const again = el.querySelector('[data-focus-key="' + hadFocus + '"]');
      if (again) again.focus();
    }
  }

  function updateAllObjBlocks() {
    const mode = global.ABStore.state.mode;
    if (!mode) return;
    for (const o of OBJ.objectivesFor(mode)) updateObjBlock(o.id);
  }

  // ══════════════ STATION 1 — INTAKE DESK ══════════════

  function dossierCard(d, mode, env) {
    const isOpen = openDossierId === d.id;
    let html = '<article class="dossier' + (isOpen ? ' dossier--open' : '') + '" data-dossier="' + ui.esc(d.id) + '">';
    html += '<button type="button" class="dossier-head" data-action="dossier-toggle" data-id="' + ui.esc(d.id) + '" aria-expanded="' + isOpen + '">' +
      '<span class="dossier-avatar">' + ui.icon('Fingerprint', 'ic-16') + '</span>' +
      '<span class="dossier-names"><span class="dossier-name">' + ui.esc(d.name) + '</span>' +
      '<span class="dossier-login">' + ui.esc(d.login) + '</span></span>' +
      ui.icon('ChevronDown', 'ic-16 dossier-chevron') + '</button>';
    if (isOpen) {
      html += '<div class="dossier-body"><ul class="dossier-attrs">' +
        d.attrs.map(function (a) { return '<li><span aria-hidden="true">&bull;</span> ' + ui.esc(a) + '</li>'; }).join('') +
        '</ul>';
      html += '<div>' + ui.selectHtml({
        id: 'sel-' + d.id, labelHtml: 'Account type', ariaLabel: 'Account type for ' + d.login,
        action: 'dossier-class', dataId: d.id, value: env.dossier[d.id] || '',
        placeholder: '— assign type —', options: D.ACCOUNT_TYPES,
      }) + '</div>';
      if (mode === 'hard') {
        const flagged = env.dossierRisky.includes(d.id);
        html += '<label class="risk-row"><input type="checkbox" class="tick tick--red" data-action="dossier-risk" data-id="' + ui.esc(d.id) + '" aria-label="Flag ' + ui.esc(d.login) + ' as top audit risk"' + (flagged ? ' checked' : '') + '> Flag as top-3 audit risk</label>';
      }
      html += '</div>';
    }
    html += '</article>';
    return html;
  }

  function renderIntake() {
    const store = global.ABStore;
    const mode = store.state.mode;
    const env = store.state.env;
    const dossiers = mode === 'hard' ? D.DOSSIERS_HARD : D.DOSSIERS_MEDIUM;

    let html = '<p class="station-intro">Every file in the tray is an identity. Read the attribute lines, then assign each dossier its account type — the type decides the controls. ' +
      (mode === 'hard' ? '<span class="strong">Also flag the three identities that pose the highest audit risk.</span>' : '') + '</p>';
    html += '<div class="grid-dossiers">' + dossiers.map(function (d) { return dossierCard(d, mode, env); }).join('') + '</div>';
    if (mode === 'medium') html += renderObjBlock('OBJ-M1');

    html += '<div class="sub-section"><h4 class="sub-title">' + ui.icon('BookMarked', 'ic-20 gold') + ' Lifecycle ledger — joiner, mover, leaver</h4>' +
      '<p class="sub-desc">One employee joins Meridian, transfers departments, then resigns. Assemble the eight controls in the order a defender executes them.</p>';
    const pool = D.LIFECYCLE_STEPS.filter(function (s) { return !env.lifecycle.includes(s.id); })
      .map(function (s) { return { id: s.id, label: s.phase + ' \u25B8 ' + s.label }; });
    const rail = env.lifecycle.map(function (id) {
      const s = D.LIFECYCLE_STEPS.find(function (x) { return x.id === id; });
      return { id: id, label: s.phase + ' \u25B8 ' + s.label };
    });
    html += '<div data-rail-kind="lifecycle">' + ui.orderRail({ kind: 'lifecycle', pool: pool, ordered: rail }) + '</div>';
    html += renderObjBlock(mode === 'medium' ? 'OBJ-M2' : 'OBJ-H10');
    html += '</div>';

    if (mode === 'hard') html += renderObjBlock('OBJ-H1');
    return html;
  }

  // ══════════════ STATION 2 — EVIDENCE LOCKER ══════════════

  function artifactPanel(a) {
    return '<article class="artifact"><header class="artifact-head">' + ui.icon('FileWarning', 'ic-16 gold') +
      '<h4 class="artifact-title">' + ui.esc(a.title) + '</h4>' +
      '<span class="artifact-tag">' + ui.esc(a.tag) + '</span></header>' +
      '<pre class="artifact-pre">' + ui.esc(a.lines.join('\n')) + '</pre></article>';
  }

  function renderEvidence() {
    const store = global.ABStore;
    const mode = store.state.mode;
    const env = store.state.env;
    const evIds = mode === 'hard'
      ? ['a-authlog', 'a-script', 'a-consent', 'a-email', 'a-hr', 'a-credage', 'a-scan']
      : ['a-authlog', 'a-script', 'a-consent', 'a-email', 'a-hr'];
    const claims = mode === 'hard' ? D.FINDING_OPTIONS : D.VIOLATION_CLAIMS;
    const sel = mode === 'hard' ? env.findings : env.violations;

    let html = '<p class="station-intro">Evidence on loan from the SOC — <span class="mono-strong">TRAINING DATA, SYNTHETIC</span>. Open each envelope, read the raw lines, then mark the statements that hold up as real identity &amp; access findings.</p>';
    html += '<div class="grid-artifacts">' + D.ARTIFACTS.filter(function (a) { return evIds.includes(a.id); })
      .map(artifactPanel).join('') + '</div>';
    html += '<fieldset class="findings"><legend class="sub-title">Findings ledger — tick only the real findings</legend>' +
      '<div class="grid-ticks">' + claims.map(function (c) {
        return ui.checkboxRow({ action: mode === 'hard' ? 'finding' : 'violation', id: c.id, label: c.label, selected: sel.includes(c.id) });
      }).join('') + '</div></fieldset>';
    html += renderObjBlock(mode === 'medium' ? 'OBJ-M5' : 'OBJ-H2');
    return html;
  }

  // ══════════════ STATION 3 — PROTOCOL DESK ══════════════

  function renderProtocol() {
    const store = global.ABStore;
    const mode = store.state.mode;
    const env = store.state.env;
    const trace = D.ARTIFACTS.find(function (a) { return a.id === 'a-trace'; });

    let html = artifactPanel(trace);

    if (mode === 'medium') {
      html += '<div class="sub-section"><h4 class="sub-title">Replay the SAML handshake</h4>' +
        '<p class="sub-desc">Build the six messages in the order the browser actually produces them. Who authenticates the user — and who only validates?</p>';
      const pool = D.SAML_STEPS.filter(function (s) { return !env.saml.includes(s.id); });
      const rail = env.saml.map(function (id) {
        return D.SAML_STEPS.find(function (x) { return x.id === id; });
      });
      html += '<div data-rail-kind="saml">' + ui.orderRail({ kind: 'saml', pool: pool, ordered: rail }) + '</div>';
      html += renderObjBlock('OBJ-M4') + '</div>';

      html += '<div class="sub-section"><h4 class="sub-title">Repair the InvoiceMailPro flow</h4>' +
        '<p class="sub-desc">Three dials turn a consent trap into a legitimate login. Set each one.</p>' +
        '<div class="grid-3">' + D.OAUTH_QUESTIONS.map(function (q) {
          return '<div>' + ui.selectHtml({
            id: 'oq-' + q.key, labelHtml: ui.esc(q.prompt), ariaLabel: q.prompt,
            action: 'oauth-select', dataId: q.key, value: env.oauth[q.key] || '',
            placeholder: '— choose —', options: q.options,
          }) + '</div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-M6') + '</div>';
    }

    if (mode === 'hard') {
      html += '<div class="sub-section"><h4 class="sub-title">Incident A — broken partner SSO &middot; Incident B — consent sign-in</h4>' +
        '<p class="sub-desc">Two exact verdicts are required. Read the trace lines literally.</p>' +
        '<div class="grid-2">' +
        '<div>' + ui.selectHtml({
          id: 'fed-saml', labelHtml: 'Why is the SP denying the SAML assertion?', ariaLabel: 'Why is the SP denying the SAML assertion?',
          action: 'fed-select', dataId: 'samlCause', value: env.fed.samlCause,
          placeholder: '— choose —', options: D.FED_SAML_OPTS,
        }) + '</div>' +
        '<div>' + ui.selectHtml({
          id: 'fed-oauth', labelHtml: 'Verdict on "Sign in with OAuth"?', ariaLabel: 'Verdict on Sign in with OAuth?',
          action: 'fed-select', dataId: 'oauthFix', value: env.fed.oauthFix,
          placeholder: '— choose —', options: D.FED_OAUTH_OPTS,
        }) + '</div></div>' + renderObjBlock('OBJ-H3') + '</div>';

      html += '<div class="sub-section"><h4 class="sub-title">Protocol selection — four projects</h4>' +
        '<div class="grid-2">' + D.PROTOCOL_SCENARIOS.map(function (p) {
          return '<div class="panel-card"><p class="scenario-text">' + ui.esc(p.text) + '</p>' +
            '<div class="choice-row">' + p.opts.map(function (o) {
              return ui.choice({ selected: (env.protocolPicks[p.id] || '') === o.id, action: 'protocol-pick', dataId: p.id + ':' + o.id, label: o.label });
            }).join('') + '</div></div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-H4') + '</div>';
    }
    return html;
  }

  // ══════════════ STATION 4 — VAULT ROOM ══════════════

  function vaultSwitch(on, id, label) {
    return '<button type="button" role="switch" aria-checked="' + on + '" data-action="vault-switch" data-id="' + id + '" class="vault-switch ' + (on ? 'vault-switch--on' : '') + '">' +
      ui.esc(label) +
      '<span aria-hidden="true" class="switch-pill ' + (on ? 'switch-pill--on' : '') + '">' +
      ui.icon(on ? 'Unlock' : 'Lock', 'ic-14') + '</span></button>';
  }

  function renderVault() {
    const store = global.ABStore;
    const mode = store.state.mode;
    const env = store.state.env;
    const v = env.vault;

    let html = '<div class="station-vault-wrap">' +
      '<p class="station-intro station-intro--dark">Brass, steel and one sealed envelope. Every switch here is a control the CISO signs. <span class="gold">TRAINING DATA — SYNTHETIC.</span></p>';

    if (mode === 'medium') {
      html += '<div class="stack">';
      html += '<section aria-label="Factor assignment"><h4 class="sub-title sub-title--dark">' + ui.icon('Fingerprint', 'ic-20 gold') + ' Factor bench — know &middot; have &middot; are</h4>' +
        '<div class="grid-factors">' + D.FACTOR_METHODS.map(function (m) {
          return '<div class="factor-card"><p class="factor-label">' + ui.esc(m.label) + '</p>' +
            '<p class="factor-hint">' + ui.esc(m.hint) + '</p>' +
            '<div class="factor-btns">' + ['know', 'have', 'are'].map(function (f) {
              const on = (env.factors[m.id] || '') === f;
              return '<button type="button" data-action="factor" data-id="' + m.id + ':' + f + '" aria-pressed="' + on + '" aria-label="' + ui.esc(m.label) + ' is something you ' + f + '" class="factor-btn ' + (on ? 'factor-btn--on' : '') + '">' + f + '</button>';
            }).join('') + '</div></div>';
        }).join('') + '</div></section>';

      html += '<section aria-label="True MFA pairs"><h4 class="sub-title sub-title--dark">Which pairs are TRUE MFA?</h4>' +
        '<div class="grid-2">' + D.MFA_PAIRS.map(function (p) {
          const on = env.mfaPairs.includes(p.id);
          return '<label class="tick-row tick-row--dark ' + (on ? 'tick-row--on-dark' : '') + '">' +
            '<input type="checkbox" class="tick" data-action="mfa-pair" data-id="' + p.id + '" aria-label="' + ui.esc(p.label) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + ui.esc(p.label) + '</span></label>';
        }).join('') + '</div></section>';

      html += renderObjBlock('OBJ-M3');

      html += '<section aria-label="Organization MFA policy" class="bordered-section"><h4 class="sub-title sub-title--dark">' + ui.icon('ShieldCheck', 'ic-20 gold') + ' CISO policy sheet — tick exactly 4 options</h4>' +
        '<div class="grid-2">' + D.MFA_POLICY_OPTS.map(function (o) {
          const on = env.mfaPolicy.includes(o.id);
          return '<label class="tick-row tick-row--dark ' + (on ? 'tick-row--on-dark' : '') + '">' +
            '<input type="checkbox" class="tick" data-action="mfa-policy" data-id="' + o.id + '" aria-label="' + ui.esc(o.label) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + ui.esc(o.label) + '</span></label>';
        }).join('') + '</div>' + renderObjBlock('OBJ-M9') + '</section>';
      html += '</div>';
    }

    html += '<section aria-label="PAM vault controls" class="' + (mode === 'medium' ? 'bordered-section' : '') + '">' +
      '<h4 class="sub-title sub-title--dark">' + ui.icon('UserCog', 'ic-20 gold') + ' Privileged access vault — set the safe state</h4>' +
      '<div class="grid-2">' +
      vaultSwitch(v.vaulted, 'vaulted', 'Credential vaulting (brokers all admin passwords)') +
      vaultSwitch(v.jit, 'jit', 'Just-in-time elevation with approval') +
      vaultSwitch(v.standing, 'standing', 'Standing admin sessions allowed') +
      vaultSwitch(v.bgSealed, 'bgSealed', 'Break-glass envelope sealed (two-person integrity)') +
      vaultSwitch(v.bgAlert, 'bgAlert', 'Alerting on break-glass use') +
      '<div>' + ui.selectHtml({
        id: 'laps', labelHtml: 'Windows LAPS rotation', ariaLabel: 'Windows LAPS rotation', labelClass: 'lbl lbl--gold',
        action: 'laps-select', value: v.laps, options: D.LAPS_OPTIONS, dark: true,
      }) + '</div></div>';
    if (mode === 'hard') {
      html += '<div class="mt-4">' + ui.selectHtml({
        id: 'postbg', labelHtml: 'Close-out after last night&#39;s break-glass use', ariaLabel: "Close-out after last night's break-glass use", labelClass: 'lbl lbl--gold',
        action: 'postbg-select', value: env.postBg, placeholder: '— choose —', options: D.POST_BG_OPTS, dark: true,
      }) + '</div>';
    }
    html += renderObjBlock(mode === 'medium' ? 'OBJ-M10' : 'OBJ-H7') + '</section>';

    if (mode === 'hard') {
      html += '<section aria-label="MFA rollout sequencing" class="bordered-section"><h4 class="sub-title sub-title--dark">Sequenced MFA rollout — risk first</h4>';
      const pool = D.ROLLOUT_STEPS.filter(function (s) { return !env.rollout.includes(s.id); });
      const rail = env.rollout.map(function (id) {
        return D.ROLLOUT_STEPS.find(function (s) { return s.id === id; });
      });
      html += '<div data-rail-kind="rollout">' + ui.orderRail({ kind: 'rollout', pool: pool, ordered: rail }) + '</div>';
      html += renderObjBlock('OBJ-H5') + '</section>';
    }
    return html + '</div>';
  }

  // ══════════════ STATION 5 — REVIEW BOARD ══════════════

  function verdictSelect(r, env) {
    const opts = [{ id: 'keep', label: 'Keep' }, { id: 'revoke', label: 'Revoke' }, { id: 'jit', label: 'Convert to JIT' }];
    let html = '<select aria-label="Verdict for ' + ui.esc(r.who) + '" class="sel" data-action="review-verdict" data-id="' + ui.esc(r.id) + '">';
    html += '<option value="">—</option>';
    for (const o of opts) html += '<option value="' + o.id + '"' + ((env.review[r.id] || '') === o.id ? ' selected' : '') + '>' + o.label + '</option>';
    html += '</select>';
    return html;
  }

  function renderBoard() {
    const store = global.ABStore;
    const mode = store.state.mode;
    const env = store.state.env;
    const rows = mode === 'hard' ? D.REVIEW_ROWS_HARD : D.REVIEW_ROWS_MEDIUM;

    let html = '<p class="station-intro">The recertification ledger. Three verdicts exist: ' + ui.term('Least privilege', '<strong>keep</strong>') +
      ' only what is scoped and used, <strong>revoke</strong> what is not, and convert standing power to ' + ui.term('JIT', 'just-in-time') + '.</p>';
    html += '<div class="table-scroll"><table class="ledger"><thead><tr>' +
      '<th>Identity</th><th>Entitlement</th><th>Auditor note</th><th class="th-verdict">Verdict</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td class="td-who">' + ui.esc(r.who) + '</td><td class="td-ent">' + ui.esc(r.ent) + '</td>' +
          '<td class="td-why">' + ui.esc(r.why) + '</td><td>' + verdictSelect(r, env) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    html += renderObjBlock(mode === 'medium' ? 'OBJ-M7' : 'OBJ-H6');

    if (mode === 'medium') {
      html += '<div class="sub-section"><h4 class="sub-title">' + ui.icon('Scale', 'ic-20 gold') + ' Six teams, six models</h4>' +
        '<p class="sub-desc">Name the authorization model each scenario describes.</p>' +
        '<div class="grid-2">' + D.MODEL_SCENARIOS.map(function (m) {
          return '<div class="panel-card"><p class="scenario-text">' + ui.esc(m.text) + '</p>' +
            '<div class="choice-row">' + m.opts.map(function (o) {
              return ui.choice({ selected: (env.models[m.id] || '') === o, action: 'model-pick', dataId: m.id + ':' + o, label: D.MODEL_LABELS[o] });
            }).join('') + '</div></div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-M8') + '</div>';

      html += '<div class="sub-section"><h4 class="sub-title">' + ui.icon('BadgeCheck', 'ic-20 gold') + ' Pending requests — duty officer</h4>' +
        '<div class="grid-2">' + D.REQUESTS.map(function (q) {
          return '<div class="panel-card"><p class="req-from">Request from: ' + ui.esc(q.from) + '</p>' +
            '<p class="scenario-text">' + ui.esc(q.asks) + '</p>' +
            '<div class="choice-row">' +
            ui.choice({ tone: 'good', selected: (env.requests[q.id] || '') === 'approve', action: 'request-pick', dataId: q.id + ':approve', label: 'Approve' }) +
            ui.choice({ tone: 'bad', selected: (env.requests[q.id] || '') === 'deny', action: 'request-pick', dataId: q.id + ':deny', label: 'Deny' }) +
            '</div></div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-M11') + '</div>';
    }

    if (mode === 'hard') {
      html += '<div class="sub-section"><h4 class="sub-title">Incident chain — pair each step with the weakness</h4>' +
        '<div class="stack-sm">' + D.CHAIN_ROWS.map(function (c) {
          return '<div class="panel-card chain-row"><p class="chain-step">' + ui.esc(c.step) + '</p>' +
            ui.selectHtml({
              id: 'chain-' + c.id, ariaLabel: 'Weakness enabling: ' + c.step,
              action: 'chain-select', dataId: c.id, value: env.chain[c.id] || '',
              placeholder: '— which weakness opened this door? —', options: D.CHAIN_WEAKNESSES,
            }) + '</div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-H8') + '</div>';

      html += '<div class="sub-section"><h4 class="sub-title">Audit committee — choose the BEST control</h4>' +
        '<div class="grid-2">' + D.BEST_QS.map(function (q) {
          return '<div class="panel-card"><p class="scenario-text">' + ui.esc(q.text) + '</p>' +
            '<div class="choice-row">' + q.opts.map(function (o) {
              return ui.choice({ selected: (env.best[q.id] || '') === o.id, action: 'best-pick', dataId: q.id + ':' + o.id, label: o.label });
            }).join('') + '</div></div>';
        }).join('') + '</div>' + renderObjBlock('OBJ-H9') + '</div>';
    }
    return html;
  }

  // ══════════════ WIRING: delegated-action update helpers ══════════════

  const STATION_HTML = { intake: renderIntake, evidence: renderEvidence, protocol: renderProtocol, vault: renderVault, board: renderBoard };

  function renderStation(id) {
    return STATION_HTML[id]();
  }

  function updateRail(kind) {
    const store = global.ABStore;
    const env = store.state.env;
    const wrap = document.querySelector('[data-rail-kind="' + kind + '"]');
    if (!wrap) return;
    let pool, ordered;
    if (kind === 'lifecycle') {
      pool = D.LIFECYCLE_STEPS.filter(function (s) { return !env.lifecycle.includes(s.id); })
        .map(function (s) { return { id: s.id, label: s.phase + ' \u25B8 ' + s.label }; });
      ordered = env.lifecycle.map(function (id) {
        const s = D.LIFECYCLE_STEPS.find(function (x) { return x.id === id; });
        return { id: id, label: s.phase + ' \u25B8 ' + s.label };
      });
    } else if (kind === 'saml') {
      pool = D.SAML_STEPS.filter(function (s) { return !env.saml.includes(s.id); });
      ordered = env.saml.map(function (id) { return D.SAML_STEPS.find(function (x) { return x.id === id; }); });
    } else {
      pool = D.ROLLOUT_STEPS.filter(function (s) { return !env.rollout.includes(s.id); });
      ordered = env.rollout.map(function (id) { return D.ROLLOUT_STEPS.find(function (s) { return s.id === id; }); });
    }
    wrap.innerHTML = ui.orderRail({ kind: kind, pool: pool, ordered: ordered });
  }

  /** Update the visual state of a pressable choice group after a pick. */
  function refreshChoiceGroup(btn) {
    const card = btn.closest('.choice-row');
    if (!card) return;
    card.querySelectorAll('.choice').forEach(function (c) {
      c.classList.remove('choice--selected', 'choice--good', 'choice--bad', 'choice--amber');
      c.classList.add('choice--idle');
      c.setAttribute('aria-pressed', 'false');
    });
    btn.classList.remove('choice--idle');
    btn.classList.add('choice--selected', btn.getAttribute('data-tone') || 'choice--amber');
    btn.setAttribute('aria-pressed', 'true');
  }

  function refreshFactorGroup(btn) {
    const card = btn.closest('.factor-btns');
    card.querySelectorAll('.factor-btn').forEach(function (b) {
      b.classList.remove('factor-btn--on');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('factor-btn--on');
    btn.setAttribute('aria-pressed', 'true');
  }

  function refreshVaultSwitch(btn) {
    const store = global.ABStore;
    const on = store.state.env.vault[btn.getAttribute('data-id')];
    btn.classList.toggle('vault-switch--on', on);
    btn.setAttribute('aria-checked', String(on));
    const pill = btn.querySelector('.switch-pill');
    pill.classList.toggle('switch-pill--on', on);
    pill.innerHTML = ui.icon(on ? 'Unlock' : 'Lock', 'ic-14');
  }

  function refreshTickRow(input, dark) {
    input.closest('.tick-row').classList.toggle(dark ? 'tick-row--on-dark' : 'tick-row--on', input.checked);
  }

  global.ABStations = {
    renderStation: renderStation,
    renderObjBlock: renderObjBlock,
    updateObjBlock: updateObjBlock,
    updateAllObjBlocks: updateAllObjBlocks,
    updateRail: updateRail,
    refreshChoiceGroup: refreshChoiceGroup,
    refreshFactorGroup: refreshFactorGroup,
    refreshVaultSwitch: refreshVaultSwitch,
    refreshTickRow: refreshTickRow,
    get openDossierId() { return openDossierId; },
    set openDossierId(v) { openDossierId = v; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
