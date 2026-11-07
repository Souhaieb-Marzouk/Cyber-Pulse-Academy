// ─── Blueprint Studio · Sheet 03 workbench drawers (static port) ────────────
// Vanilla-JS translations of DraftingBoard, PlanStudio, DriftBoard,
// ScanBench and PipelineConsole. Copy is carried over 1:1; interactions go
// through data-act / data-env attributes handled in app.js.
// Transient panel state (topology highlight, scanning flag) lives on the
// `ui` object passed in by the renderer — it is never persisted, exactly
// like the React useState hooks in the original.

(function () {
  'use strict';

  var Store = window.LabStore;
  var P = window.BP;
  var icon = P.icon;
  var esc = P.esc;
  var attr = P.attr;

  /** Icon with an inline color (mirrors lucide-react className text-[#…]). */
  function colIcon(name, cls, color) {
    return icon(name, cls).replace('class="lucide', 'style="color:' + color + '" class="lucide');
  }

  // ════════════════════════════════════════════════════════════════════════
  // DRAWER 1 · Drafting Board — code ⇄ topology
  // ════════════════════════════════════════════════════════════════════════

  var LINE_ROLE = {};
  ANATOMY_TARGETS.forEach(function (a) { LINE_ROLE[a.line] = a.kind; });

  function draftingBoard(anim, ui) {
    var s = Store.getState();
    var mode = s.mode;
    var env = s.env;
    var hl = ui.draftHighlight; // [a, b] | null
    var inRange = function (n) { return hl && n >= hl[0] && n <= hl[1]; };
    var flagged = env.flaggedLines.length;

    var lines = TEMPLATE_LINES.map(function (l) {
      var isHeader = !!l.blockId;
      var clicked = env.clickedLines.indexOf(l.n) >= 0;
      var secretHit = l.n === SECRET_LINE && env.secretLineFound;
      var flaggedNow = env.flaggedLines.indexOf(l.n) >= 0;
      var rowCls = 'code-line' + (inRange(l.n) ? ' hl' : '');

      var html = '<div class="' + rowCls + '" data-line="' + l.n + '" role="listitem">';
      html += '<span class="ln">' + l.n + '</span>';

      if (isHeader || l.n === SECRET_LINE) {
        var btnCls = 'code-btn' + (secretHit ? ' secret-hit' : clicked ? ' clicked' : '');
        var title = LINE_ROLE[l.n] || 'Hardcoded credential — click to mark';
        html +=
          '<button type="button" class="' + btnCls + '" data-act="line-click" data-line="' + l.n + '"' +
          ' data-fid="line-' + l.n + '" aria-pressed="' + (clicked || secretHit) + '"' +
          ' title="' + attr(title) + '">' + esc(l.code) + '</button>';
      } else {
        var txtCls = 'code-txt ' + ((l.note && l.note.indexOf('flaw') === 0) ? 'is-flaw' : 'is-plain');
        html += '<span class="' + txtCls + '">' + esc(l.code) + '</span>';
      }

      if (mode === 'hard' && l.code.trim() !== '' && l.code.charAt(0) !== '#') {
        html +=
          '<button type="button" class="flag-btn' + (flaggedNow ? ' flagged' : '') + '"' +
          ' data-act="flag-line" data-line="' + l.n + '" data-fid="flag-' + l.n + '"' +
          ' aria-pressed="' + flaggedNow + '" aria-label="Flag line ' + l.n + '">' +
          icon('flag', 'ic-14') + '</button>';
      }

      html += '</div>';
      return html;
    }).join('');

    // M5 remedy question (medium, after the secret is found)
    var m5 = '';
    if (env.secretLineFound && mode === 'medium') {
      var opts = [
        { v: 'base64', t: 'Base64-encode the password inside the template file' },
        { v: 'vault', t: 'Reference a secrets manager and inject the value at runtime' },
        { v: 'rename', t: 'Rename the variable to something obscure and commit that' },
      ];
      var rows = opts.map(function (o) {
        return (
          '<label class="radio-row">' +
          '<input type="radio" name="secret-fix" value="' + attr(o.v) + '"' +
          (env.secretFixChoice === o.v ? ' checked' : '') + ' />' +
          esc(o.t) + '</label>'
        );
      }).join('');
      m5 =
        '<fieldset class="m5-box">' +
        '<legend>SPEC M5 · THE REMEDY</legend>' +
        '<p class="q">You marked line ' + SECRET_LINE + '. What is the correct fix?</p>' +
        rows +
        '</fieldset>';
    }

    var hardRules =
      mode === 'hard'
        ? '<p class="hard-rules">AUDIT RULES ▸ flag a line only if it leaks, exposes, or destroys data. The environment’s accepted front door (:443 world-open) is NOT a flaw — flagging it means the scanner’s over-match fooled you.</p>'
        : '';

    // Topology SVG
    var nodes = TOPOLOGY.map(function (nd) {
      var active = ui.draftNode === nd.id;
      return (
        '<g class="topo-node" tabindex="0" role="button"' +
        ' aria-label="' + attr(nd.label + ' ' + nd.sub + ' — highlight lines ' + nd.lines[0] + ' to ' + nd.lines[1] + ' in the template') + '"' +
        ' data-act="topo-node" data-node="' + attr(nd.id) + '" data-fid="topo-' + attr(nd.id) + '">' +
        '<rect x="' + nd.x + '" y="' + nd.y + '" width="' + nd.w + '" height="' + nd.h + '"' +
        ' fill="' + (active ? '#E9B44C' : 'transparent') + '"' +
        ' fill-opacity="' + (active ? '0.12' : '0') + '"' +
        ' stroke="' + (active ? '#E9B44C' : '#A7C7E8') + '"' +
        ' stroke-opacity="' + (active ? '1' : '0.6') + '"' +
        ' stroke-width="' + (active ? '2' : '1') + '" />' +
        '<text x="' + (nd.x + 8) + '" y="' + (nd.y + 18) + '" font-size="9" font-family="monospace"' +
        ' fill="' + (active ? '#E9B44C' : '#D8E9FA') + '">' + esc(nd.label) + '</text>' +
        '<text x="' + (nd.x + 8) + '" y="' + (nd.y + 32) + '" font-size="8" font-family="monospace"' +
        ' fill="#A7C7E8" fill-opacity="0.75">' + esc(nd.sub) + '</text>' +
        '</g>'
      );
    }).join('');

    var topo =
      '<div class="db-col db-topo">' +
      '<p class="topo-caption">ELEVATION · KESTREL-STAGING (CLICK A BLOCK)</p>' +
      '<div class="topo-box">' +
      '<svg viewBox="0 0 520 180" role="img" aria-label="Blueprint elevation of the stack: provider, variables, output, web instance, security group, S3 bucket, database">' +
      '<defs>' +
      '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
      '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#A7C7E8" stroke-opacity="0.08" stroke-width="0.5" />' +
      '</pattern></defs>' +
      '<rect width="520" height="180" fill="url(#grid)" />' +
      '<text x="8" y="172" font-size="8" fill="#A7C7E8" fill-opacity="0.4" font-family="monospace">SCALE 1:1 · SHEET 03 · MERIDIAN RETAIL (FICTIONAL)</text>' +
      '<g stroke="#A7C7E8" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="4 3">' +
      '<line x1="138" y1="54" x2="190" y2="54" />' +
      '<line x1="322" y1="54" x2="356" y2="54" />' +
      '<line x1="256" y1="78" x2="256" y2="92" />' +
      '<line x1="322" y1="116" x2="356" y2="116" />' +
      '<line x1="138" y1="134" x2="190" y2="116" />' +
      '</g>' +
      nodes +
      '</svg></div>' +
      '<p class="topo-note">The drawing and the code are the same artifact in two projections. Click a block here and its template lines light up — that linkage is what “infrastructure as code” means operationally.</p>' +
      '</div>';

    var kicker =
      mode === 'hard'
        ? 'HARD AUDIT · SPEC H1 — FLAG EXACTLY THE 5 FLAW LINES (flagged: ' + flagged + '/5)'
        : 'SPEC M4 · M5 — CLICK BLOCK HEADERS TO LEARN THE ANATOMY; FIND THE LEAKED SECRET';

    return (
      '<div class="db-grid">' +
      '<div class="db-col db-code">' +
      '<div class="db-caption"><p>' + icon('mouse-pointer-click', 'ic-14') + ' ' + esc(kicker) + '</p></div>' +
      '<div class="code-pane" id="code-pane" role="list" aria-label="main.tf template, synthetic training data">' + lines + '</div>' +
      m5 +
      hardRules +
      '</div>' +
      topo +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // DRAWER 2 · Plan Studio — diff ledger
  // ════════════════════════════════════════════════════════════════════════

  var SYM_CLASS = { '+': 'add', '~': 'change', '-/+': 'replace', '-': 'remove' };

  function planStudio(anim, ui) {
    var s = Store.getState();
    var mode = s.mode;
    var env = s.env;

    var rows = PLAN_ROWS.map(function (r) {
      return (
        '<div class="ledger-row">' +
        '<div class="ledger-symrow">' +
        '<span class="ledger-sym ' + SYM_CLASS[r.symbol] + '">' + esc(r.symbol) + '</span>' +
        '<span class="ledger-res">' + esc(r.resource) + '</span>' +
        '<span class="ledger-act">' + esc(r.action) + '</span>' +
        '</div>' +
        '<pre class="ledger-detail">' + esc(r.detail.join('\n')) + '</pre>' +
        '</div>'
      );
    }).join('');

    var ledger =
      '<div>' +
      '<p class="topo-caption">SIMULATED PLAN · R8 DRAFT — READ THE DIFF BEFORE ANYONE TYPES “YES”</p>' +
      '<div class="ledger">' +
      '<div class="ledger-bar">$ terraform plan · kestrel-staging · 5 resources under management (register R7)</div>' +
      rows +
      '<div class="ledger-summary">' + esc(PLAN_SUMMARY) + '</div>' +
      '</div></div>';

    // M6 (medium)
    var m6 = '';
    if (mode === 'medium') {
      var nums = [0, 1, 2, 3, 4, 5].map(function (n) { return { value: String(n), label: String(n) }; });
      m6 =
        '<div class="qbox">' +
        '<p class="qkicker">SPEC M6 · PLAN READING (3 PARTS)</p>' +
        '<div class="sel-grid-3">' +
        P.fieldSelect({ label: 'TO ADD (+)', value: env.planAnswers.add === null ? '' : String(env.planAnswers.add), options: nums, envPath: 'planAnswers.add', ariaLabel: 'How many resources to add' }) +
        P.fieldSelect({ label: 'TO CHANGE IN-PLACE (~)', value: env.planAnswers.change === null ? '' : String(env.planAnswers.change), options: nums, envPath: 'planAnswers.change', ariaLabel: 'How many resources change in place' }) +
        P.fieldSelect({ label: 'TO DESTROY (-)', value: env.planAnswers.destroy === null ? '' : String(env.planAnswers.destroy), options: nums, envPath: 'planAnswers.destroy', ariaLabel: 'How many resources are destroyed' }) +
        '</div>' +
        '<div class="sel-grid-2">' +
        P.fieldSelect({ label: 'WHICH RESOURCE IS REPLACED (-/+) ?', value: env.planAnswers.replaced == null ? '' : env.planAnswers.replaced, envPath: 'planAnswers.replaced', options: [
          { value: 'web', label: 'aws_instance.web' },
          { value: 'bucket', label: 'aws_s3_bucket.audit_logs' },
          { value: 'sg', label: 'aws_security_group.web_sg' },
          { value: 'db', label: 'aws_db_instance.orders_db' },
          { value: 'none', label: 'None — no replacement in this plan' },
        ] }) +
        P.fieldSelect({ label: 'WHY?', value: env.planAnswers.reason == null ? '' : env.planAnswers.reason, envPath: 'planAnswers.reason', options: [
          { value: 'ami', label: 'The new AMI — it "forces replacement"' },
          { value: 'tags', label: 'A tag changed, and tags force replacement' },
          { value: 'drift', label: 'The instance_type drifted to t3.large' },
          { value: 'state', label: 'The resource is missing from state' },
        ] }) +
        '</div></div>';
    }

    // H3 (hard): replacement triage
    var h3 = '';
    if (mode === 'hard') {
      h3 =
        '<div class="qbox qbox-red">' +
        '<p class="qkicker">SPEC H3 · REPLACEMENT TRIAGE — DRAFT PLAN R9 (ENGINE UPGRADE)</p>' +
        '<pre class="h3-plan">' + esc(
          '  # aws_db_instance.orders_db must be replaced\n' +
          '-/+ resource "aws_db_instance" "orders_db" {\n' +
          '      ~ engine         = "postgres" -> "postgres16"   # forces replacement\n' +
          '      ~ instance_class = "db.t3.small" -> "db.t3.medium"\n' +
          '        skip_final_snapshot = true          # ← still in the template\n' +
          '    }\n' +
          'Plan: 0 to add, 1 to change, 1 to destroy.'
        ) + '</pre>' +
        '<div class="sel-grid-3">' +
        P.fieldSelect({ label: '1 · WHAT FORCES REPLACEMENT?', value: env.h3Cause == null ? '' : env.h3Cause, envPath: 'h3Cause', options: [
          { value: 'class', label: 'The instance_class change' },
          { value: 'engine', label: 'The engine change — marked "forces replacement"' },
          { value: 'nothing', label: 'Nothing — the plan is an in-place update' },
        ] }) +
        P.fieldSelect({ label: '2 · IMMEDIATE RISK OF APPLYING?', value: env.h3Risk == null ? '' : env.h3Risk, envPath: 'h3Risk', options: [
          { value: 'cost', label: 'Slightly higher monthly cost' },
          { value: 'downtime', label: 'A few seconds of downtime' },
          { value: 'dataloss', label: 'Permanent data loss — no final snapshot' },
        ] }) +
        P.fieldSelect({ label: '3 · THE SAFEST PATH?', value: env.h3Fix == null ? '' : env.h3Fix, envPath: 'h3Fix', options: [
          { value: 'fast', label: 'Apply fast at night to shrink the window' },
          { value: 'snapshot', label: 'Disable the flag, snapshot / migrate, then apply' },
          { value: 'state', label: 'Remove the resource from state first' },
        ] }) +
        '</div></div>';
    }

    // H6 (hard): recovery ordering
    var h6 = '';
    if (mode === 'hard') {
      var order = env.h6StepOrder.map(function (sid) {
        var o = H6_STEPS.find(function (x) { return x.id === sid; });
        var idx = env.h6Order.indexOf(o.id);
        var decoy = ['console', 'statewipe', 'snapflag'].indexOf(o.id) >= 0;
        return (
          '<button type="button" class="order-btn' + (idx >= 0 ? ' ordered' : '') + '"' +
          ' data-act="order-toggle" data-key="h6Order" data-id="' + attr(o.id) + '"' +
          ' data-decoy="' + (decoy ? '1' : '') + '" data-max="3" data-fid="h6-' + attr(o.id) + '"' +
          ' aria-pressed="' + (idx >= 0) + '">' +
          (idx >= 0 ? '<span class="badge">' + (idx + 1) + '▸</span>' : '') +
          esc(o.t) +
          '</button>'
        );
      }).join('');
      h6 =
        '<div class="qbox qbox-red">' +
        '<p class="qkicker">SPEC H6 · ROLLBACK DRILL</p>' +
        '<p class="rubric">Scenario: run #417 applied a broken R9; the orders DB was recreated empty and the store is down. Order the THREE correct recovery steps (click in order); leave the three decoys untouched.</p>' +
        '<div class="order-grid">' + order + '</div>' +
        '</div>';
    }

    return '<div class="stack-4">' + ledger + m6 + h3 + h6 + '</div>';
  }

  // ════════════════════════════════════════════════════════════════════════
  // DRAWER 3 · Drift Board — desired vs as-built
  // ════════════════════════════════════════════════════════════════════════

  function driftBoard(anim, ui) {
    var s = Store.getState();
    var mode = s.mode;
    var env = s.env;

    var headRows = ['MARK', 'RESOURCE', 'ATTRIBUTE', 'DESIRED (CODE)', 'AS-BUILT (REALITY)', 'CHANGE LOG'];
    if (mode === 'hard') headRows.push('CLASSIFY (H2)');
    var thead = '<thead><tr>' + headRows.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';

    var body = DRIFT_ROWS.map(function (r) {
      var marked = env.driftMarks.indexOf(r.id) >= 0;
      var row =
        '<tr' + (marked ? ' class="marked"' : '') + '>' +
        '<td><button type="button" class="mark-btn' + (marked ? ' marked' : '') + '"' +
        ' data-act="drift-mark" data-row="' + r.id + '" data-fid="dmark-' + r.id + '"' +
        ' aria-pressed="' + marked + '" aria-label="Mark row ' + r.id + ' (' + attr(r.resource) + ') as a violation to revert"' +
        ' title="Red-pencil circle: mark as violation to revert">' + icon('pencil-line', 'ic-14') + '</button></td>' +
        '<td class="res">' + esc(r.resource) + '</td>' +
        '<td class="attr">' + esc(r.attribute) + '</td>' +
        '<td class="desired">' + esc(r.desired) + '</td>' +
        '<td class="asbuilt">' + esc(r.asBuilt) + '</td>' +
        '<td class="clog">' + esc(r.changeLog) + '</td>';
      if (mode === 'hard') {
        var cls = env.driftClass[r.id] == null ? '' : env.driftClass[r.id];
        var opts = '<option value="" disabled' + (cls === '' ? ' selected' : '') + '>— class —</option>';
        DRIFT_CLASSES.forEach(function (c) {
          opts += '<option value="' + attr(c.id) + '"' + (cls === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>';
        });
        row += '<td><select class="sel sel-panel sel-mono10" style="width:176px" data-env="driftClass:' + r.id + '"' +
          ' aria-label="Classification for row ' + r.id + '">' + opts + '</select></td>';
      }
      row += '</tr>';
      return row;
    }).join('');

    var table =
      '<div class="table-wrap">' +
      '<table class="drift-table">' +
      '<caption class="sr-only">Desired versus as-built comparison for the kestrel-staging stack</caption>' +
      thead + '<tbody>' + body + '</tbody>' +
      '</table></div>';

    // H2 part 2 (hard)
    var h2 = '';
    if (mode === 'hard') {
      h2 =
        '<div class="qbox qbox-red">' +
        '<p class="qkicker">SPEC H2 · PART 2 — THE UNTRACKED TOPIC (ROW 5)</p>' +
        P.fieldSelect({ label: 'CORRECT ACTION FOR aws_sns_topic.alerts', value: env.driftActionD5 == null ? '' : env.driftActionD5, envPath: 'driftActionD5', options: [
          { value: 'import', label: 'Import / codify it through review' },
          { value: 'leave', label: 'Leave it — untracked is harmless' },
          { value: 'delete', label: 'Delete it by hand in the console' },
        ] }) +
        '</div>';
    }

    var reconcile =
      '<div class="qbox">' +
      '<p class="qkicker">' + (mode === 'hard' ? 'RECONCILIATION RUBRIC (USED BY SPEC H2)' : 'SPEC M12 · PART 1 — RECONCILE THE t3.large DRIFT') + '</p>' +
      (mode === 'medium'
        ? P.fieldSelect({ label: 'THE IAC-NATIVE ACTION FOR ROW 1', value: env.reconcileChoice == null ? '' : env.reconcileChoice, envPath: 'reconcileChoice', options: [
            { value: 'apply-code', label: 'Review, then apply the code — reality returns to t3.micro' },
            { value: 'adopt', label: 'Change the code to t3.large to match reality' },
            { value: 'delete', label: 'Delete the instance and rebuild it by hand' },
            { value: 'ignore', label: 'Nothing — drift is cosmetic if the store works' },
          ] })
        : '<p class="rubric">VIOLATION rows → revert to code through the pipeline. IMPROVEMENT rows → adopt into code through review. GHOST rows → refresh state; recreate through the pipeline. UNTRACKED rows → import or codify — never hand-delete.</p>') +
      '</div>';

    return (
      '<div class="stack-4">' +
      '<div class="board-head">' +
      '<p class="t">' + icon('radar', 'ic-16') + ' DRIFT SENTINEL — scheduled comparison of code vs reality</p>' +
      '<label class="switch-label">' +
      P.switchEl(env.sentinelOn, 'sentinelOn', 'Enable nightly drift detection') +
      'NIGHTLY DRIFT CHECK ' + (env.sentinelOn ? '· ARMED' : '· OFF') +
      '</label>' +
      '</div>' +
      table + h2 + reconcile +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // DRAWER 4 · Scan Bench + policy bench
  // ════════════════════════════════════════════════════════════════════════

  function scanBench(anim, ui) {
    var s = Store.getState();
    var mode = s.mode;
    var env = s.env;

    var head =
      '<div class="board-head">' +
      '<p class="t">' + icon('scan-search', 'ic-16') + ' POLICY-AS-CODE SCAN · kestrel-staging/main.tf</p>' +
      '<button type="button" class="btn btn-scan" data-act="run-scan" data-fid="run-scan"' +
      (ui.scanning ? ' disabled' : '') + '>' +
      (ui.scanning ? 'SCANNING…' : env.scanRun ? 'RE-RUN SCAN' : 'RUN SCAN') +
      '</button>' +
      '</div>';

    var body = '';
    if (env.scanRun) {
      var visible = FINDINGS.filter(function (f) { return mode === 'hard' || !f.hardOnly; });
      var cards = visible.map(function (f) {
        var cur = env.scanClass[f.id];
        var html =
          '<div class="finding">' +
          '<div class="finding-head">' +
          '<span class="sev sev-' + esc(f.severity) + '">' + esc(f.severity) + '</span>' +
          '<span class="finding-rule">' + esc(f.rule) + ' · ' + esc(f.id) + '</span>' +
          '</div>' +
          '<p class="finding-title">' + esc(f.title) + '</p>' +
          '<p class="finding-detail">' + esc(f.detail) + '</p>' +
          '<div class="triage-row">' +
          '<span class="triage-label">TRIAGE:</span>' +
          '<button type="button" class="triage-btn' + (cur === 'tp' ? ' on-tp' : '') + '"' +
          ' data-act="triage" data-finding="' + attr(f.id) + '" data-v="tp" data-fid="tp-' + attr(f.id) + '"' +
          ' aria-pressed="' + (cur === 'tp') + '">TRUE POSITIVE</button>' +
          '<button type="button" class="triage-btn' + (cur === 'fp' ? ' on-fp' : '') + '"' +
          ' data-act="triage" data-finding="' + attr(f.id) + '" data-v="fp" data-fid="fp-' + attr(f.id) + '"' +
          ' aria-pressed="' + (cur === 'fp') + '">FALSE POSITIVE</button>' +
          '</div>';

        if (cur === 'fp' && f.fpWhy) {
          html += '<p class="tuning-note">TUNING NOTE ▸ ' + esc(f.fpWhy) + '</p>';
        }

        // M10 remediation checklist under F1 (medium)
        if (f.id === 'F1' && mode === 'medium') {
          var actions = [
            { id: 'vault', t: 'Move the secret to a secrets manager and reference it from the template at runtime' },
            { id: 'rotate', t: 'Rotate the exposed password immediately' },
            { id: 'purge', t: 'Purge the credential from git history where feasible' },
            { id: 'rename', t: 'Rename the password variable to something obscure' },
            { id: 'recommit', t: 'Delete the line and commit "removed password"' },
          ];
          html +=
            '<fieldset class="m10-box">' +
            '<legend>SPEC M10 · SELECT ALL ACTIONS OF A COMPLETE FIX</legend>' +
            actions.map(function (a) {
              return (
                '<label class="check-row">' +
                '<input type="checkbox" data-check="' + attr(a.id) + '"' +
                (env.f1Actions.indexOf(a.id) >= 0 ? ' checked' : '') + ' />' +
                esc(a.t) + '</label>'
              );
            }).join('') +
            '</fieldset>';
        }

        html += '</div>';
        return html;
      }).join('');

      var h8 = '';
      var h5 = '';
      if (mode === 'hard') {
        h8 =
          '<div class="qbox qbox-red">' +
          '<p class="qkicker">SPEC H8 · PART 2 — WHAT DO YOU FIX FIRST?</p>' +
          P.fieldSelect({ label: 'FIRST REMEDIATION (FOLLOW SEVERITY)', value: env.firstFix == null ? '' : env.firstFix, envPath: 'firstFix', options: [
            { value: 'F1', label: 'F1 — the hardcoded credential (CRITICAL)' },
            { value: 'F2', label: 'F2 — the public audit bucket (HIGH)' },
            { value: 'F3', label: 'F3 — world-open SSH (HIGH)' },
            { value: 'F4', label: 'F4 — unencrypted volume (MEDIUM)' },
          ] }) +
          '</div>';

        var ruleBlock = function (key, label) {
          var rule = env[key];
          var selects =
            P.fieldSelect({ label: 'RESOURCE', value: rule.resource == null ? '' : rule.resource, envPath: key + '.resource', options: [
              { value: 'aws_s3_bucket', label: 'aws_s3_bucket' },
              { value: 'aws_security_group', label: 'aws_security_group' },
              { value: 'aws_db_instance', label: 'aws_db_instance' },
              { value: 'aws_instance', label: 'aws_instance' },
            ] }) +
            P.fieldSelect({ label: 'ATTRIBUTE', value: rule.attribute == null ? '' : rule.attribute, envPath: key + '.attribute', options: [
              { value: 'acl', label: 'acl' },
              { value: 'cidr_blocks', label: 'cidr_blocks' },
              { value: 'versioning', label: 'versioning' },
              { value: 'encrypted', label: 'encrypted' },
            ] }) +
            (key === 'ruleB'
              ? P.fieldSelect({ label: 'PORT', value: rule.port == null ? '' : rule.port, envPath: key + '.port', options: [
                  { value: '22', label: '22 (SSH)' },
                  { value: '443', label: '443 (HTTPS)' },
                  { value: '3389', label: '3389 (RDP)' },
                ] })
              : '') +
            P.fieldSelect({ label: 'OPERATOR', value: rule.operator == null ? '' : rule.operator, envPath: key + '.operator', options: [
              { value: 'equals', label: 'equals' },
              { value: 'contains', label: 'contains' },
              { value: 'not_equals', label: 'not_equals' },
            ] }) +
            P.fieldSelect({ label: 'VALUE', value: rule.value == null ? '' : rule.value, envPath: key + '.value', options: [
              { value: 'public-read', label: 'public-read' },
              { value: '0.0.0.0/0', label: '0.0.0.0/0' },
              { value: 'false', label: 'false' },
              { value: 'disabled', label: 'disabled' },
            ] }) +
            P.fieldSelect({ label: 'EFFECT', value: rule.effect == null ? '' : rule.effect, envPath: key + '.effect', options: [
              { value: 'deny', label: 'DENY' },
              { value: 'allow', label: 'ALLOW' },
            ] });

          var preview =
            'policy "custom-' + (key === 'ruleA' ? 's3-public-acl' : 'ssh-world') + '" {\n' +
            '  resource   = ' + (rule.resource == null ? '"…"' : rule.resource) + '\n' +
            '  attribute  = ' + (rule.attribute == null ? '"…"' : rule.attribute) + '\n' +
            (key === 'ruleB' ? '  port       = ' + (rule.port == null ? '"…"' : rule.port) + '\n' : '') +
            '  operator   = ' + (rule.operator == null ? '"…"' : rule.operator) + '\n' +
            '  value      = ' + (rule.value == null ? '"…"' : rule.value) + '\n' +
            '  effect     = ' + (rule.effect == null ? '"…"' : rule.effect.toUpperCase()) + '\n' +
            '}';

          return (
            '<div class="policy-rule">' +
            '<p class="rule-label">' + label + '</p>' +
            '<div class="policy-grid">' + selects + '</div>' +
            '<pre class="policy-preview">' + esc(preview) + '</pre>' +
            '</div>'
          );
        };

        h5 =
          '<div class="qbox qbox-green">' +
          '<p class="qkicker">' + colIcon('save', 'ic-14', 'var(--green)') + ' SPEC H5 · POLICY BENCH — TURN THE AUDIT INTO GUARDRAILS</p>' +
          '<p class="h5-intro">Author exactly: <strong>Rule A</strong> — deny any S3 bucket whose ACL equals public-read. <strong>Rule B</strong> — deny any security-group ingress on port 22 from 0.0.0.0/0. Saved rules run in the pipeline before plan.</p>' +
          ruleBlock('ruleA', 'RULE A · PUBLIC BUCKET') +
          ruleBlock('ruleB', 'RULE B · WORLD-OPEN SSH') +
          '</div>';
      }

      body = '<div class="findings-list" aria-live="polite">' + cards + h8 + h5 + '</div>';
    } else {
      body =
        '<p class="scan-pending">The scanner has not run yet on this session. Run it — findings appear instantly (simulated latency is opt-in, not default).</p>';
    }

    return '<div class="stack-4">' + head + body + '</div>';
  }

  // ════════════════════════════════════════════════════════════════════════
  // DRAWER 5 · Pipeline Console + drawing register (state)
  // ════════════════════════════════════════════════════════════════════════

  var STATUS_DEF = {
    ok:    { ic: 'circle-check-big', color: '#7BC796', label: 'passed',      st: 'ok' },
    fail:  { ic: 'circle-x',        color: '#F08A85', label: 'failed',      st: 'fail' },
    skip:  { ic: 'circle-minus',    color: '#E9B44C', label: 'skipped',     st: 'other' },
    warn:  { ic: 'triangle-alert',  color: '#E9B44C', label: 'warning',     st: 'other' },
    retry: { ic: 'rotate-ccw',      color: '#E9B44C', label: 'retried',     st: 'other' },
    'n/a': { ic: 'circle-minus',    color: 'rgba(167,199,232,0.3)', label: 'not reached', st: 'na' },
  };

  function pipelineConsole(anim, ui) {
    var s = Store.getState();
    var mode = s.mode;
    var env = s.env;
    var run = PIPELINE_RUNS.find(function (r) { return r.id === s.pipelineRun; }) || PIPELINE_RUNS[0];

    var runTabs = PIPELINE_RUNS.map(function (r) {
      var active = s.pipelineRun === r.id;
      return (
        '<button type="button" class="run-tab' + (active ? ' active' : '') + '" role="tab"' +
        ' aria-selected="' + active + '" data-act="set-run" data-run="' + attr(r.id) + '"' +
        ' data-fid="run-' + attr(r.id) + '">' +
        (r.id === 'run412' ? 'RUN #412 · honest halt' : 'RUN #415 · the cheat') +
        '</button>'
      );
    }).join('');

    var stages = run.stages.map(function (st) {
      var def = STATUS_DEF[st.status] || STATUS_DEF['n/a'];
      return (
        '<div class="stage">' +
        '<div class="stage-head">' +
        colIcon(def.ic, 'ic-14', def.color).replace('class="lucide', 'role="img" aria-label="' + def.label + '" class="lucide') +
        '<span class="stage-name">' + esc(st.name) + '</span>' +
        '<span class="stage-status st-' + def.st + '">' + esc(st.status.toUpperCase()) + '</span>' +
        '</div>' +
        '<pre>' + esc(st.lines.join('\n')) + '</pre>' +
        '</div>'
      );
    }).join('');

    var consoleBox =
      '<div class="console">' +
      '<div class="console-head">' +
      '<p class="console-title">' + esc(run.title) + '</p>' +
      '<p class="console-meta">' + esc(run.meta) + '</p>' +
      '</div>' +
      '<div class="stage-list" aria-live="polite" aria-label="Pipeline stage log">' + stages + '</div>' +
      '</div>';

    var m9 = '';
    if (mode === 'medium') {
      m9 =
        '<div class="qbox">' +
        '<p class="qkicker">SPEC M9 · WHERE DID RUN #412 HALT, AND WHY DOES IT MATTER?</p>' +
        '<div class="sel-grid-2">' +
        P.fieldSelect({ label: 'FAILED STAGE', value: env.pipelineStage == null ? '' : env.pipelineStage, envPath: 'pipelineStage', options: [
          { value: 'lint', label: '02 lint (fmt)' },
          { value: 'validate', label: '03 validate' },
          { value: 'secret-scan', label: '04 secret-scan' },
          { value: 'plan', label: '05 plan' },
          { value: 'apply', label: '07 apply' },
        ] }) +
        P.fieldSelect({ label: 'WHY IT MATTERS', value: env.pipelineReason == null ? '' : env.pipelineReason, envPath: 'pipelineReason', options: [
          { value: 'credential', label: 'A hardcoded credential was caught before apply' },
          { value: 'format', label: 'The file was not formatted correctly' },
          { value: 'network', label: 'A network outage interrupted the run' },
          { value: 'quota', label: 'The provider rejected a quota request' },
        ] }) +
        '</div></div>';
    }

    var h4 = '';
    if (mode === 'hard') {
      var order = env.h4StepOrder.map(function (sid) {
        var o = H4_STEPS.find(function (x) { return x.id === sid; });
        var idx = env.h4Order.indexOf(o.id);
        var decoy = ['allow', 'provider'].indexOf(o.id) >= 0;
        return (
          '<button type="button" class="order-btn' + (idx >= 0 ? ' ordered' : '') + '"' +
          ' data-act="order-toggle" data-key="h4Order" data-id="' + attr(o.id) + '"' +
          ' data-decoy="' + (decoy ? '1' : '') + '" data-max="4" data-fid="h4-' + attr(o.id) + '"' +
          ' aria-pressed="' + (idx >= 0) + '">' +
          (idx >= 0 ? '<span class="badge">' + (idx + 1) + '▸</span>' : '') +
          esc(o.t) +
          '</button>'
        );
      }).join('');
      h4 =
        '<div class="qbox qbox-red">' +
        '<p class="qkicker">SPEC H4 · BREACH ANALYSIS (RUN #415) — 3 PARTS</p>' +
        '<div class="sel-grid-2">' +
        P.fieldSelect({ label: '1 · BYPASSED SAFEGUARD', value: env.h4Bypass == null ? '' : env.h4Bypass, envPath: 'h4Bypass', options: [
          { value: 'skipscan', label: 'Secret-scan — skipped via the [skip-scan] commit tag' },
          { value: 'lint', label: 'Lint — it failed silently' },
          { value: 'approval', label: 'Approval — nobody approved the run' },
          { value: 'none', label: 'Nothing was bypassed' },
        ] }) +
        P.fieldSelect({ label: '2 · CREDENTIAL CLASS IN USE', value: env.h4Cred == null ? '' : env.h4Cred, envPath: 'h4Cred', options: [
          { value: 'static', label: 'A long-lived static access key, used off-pipeline' },
          { value: 'oidc', label: 'A short-lived OIDC federation token' },
          { value: 'mfa', label: 'An MFA-protected human session' },
          { value: 'none', label: 'No credential was involved at all' },
        ] }) +
        '</div>' +
        '<p class="order-label">3 · ORDER THE REMEDIATION (CLICK IN ORDER):</p>' +
        '<div class="order-grid">' + order + '</div>' +
        '</div>';
    }

    var registerRows = [
      'aws_instance.web',
      'aws_security_group.web_sg',
      'aws_s3_bucket.audit_logs',
      'aws_db_instance.orders_db',
      'output.web_public_ip',
    ].map(function (r) {
      return '<li><span>' + esc(r) + '</span><span class="tracked">TRACKED</span></li>';
    }).join('');

    var toggles = [
      ['remoteBackend', 'REMOTE BACKEND', 'one authoritative copy (S3+DynamoDB / Blob+lease)'],
      ['stateLocking', 'STATE LOCKING', 'blocks concurrent applies'],
      ['stateEncryption', 'STATE ENCRYPTION', 'state can hold plaintext secrets'],
    ].map(function (t) {
      return (
        '<div class="toggle-row">' +
        '<span><span class="tt">' + t[1] + '</span><span class="tw">' + esc(t[2]) + '</span></span>' +
        P.switchEl(env[t[0]], t[0], t[1]) +
        '</div>'
      );
    }).join('');

    var secure = env.remoteBackend && env.stateLocking;
    var register =
      '<div class="pipe-col pipe-right">' +
      '<div class="register">' +
      '<div class="register-head">' +
      '<p class="register-title">' + icon('database', 'ic-16 c-amber') + ' DRAWING REGISTER (STATE)</p>' +
      '<p class="register-sub">revision R7 · 5 resources · engine-managed</p>' +
      '</div>' +
      '<ul class="register-list">' + registerRows + '</ul>' +
      '<div class="register-toggles">' +
      toggles +
      '<p class="register-msg ' + (secure ? 'ok' : 'warn') + '" aria-live="polite">' +
      (secure
        ? 'REGISTER SECURE ▸ shared, locked, encrypted-capable. Spec M11 satisfied.'
        : 'WARNING ▸ register currently lives on ENG-LAP-17 (local terraform.tfstate). One laptop failure or two concurrent applies away from corruption.') +
      '</p>' +
      '</div></div>' +
      '<p class="pipe-note">A drawing register indexes every sheet and its revision; the state file indexes every resource the engine manages. Lose it or corrupt it and nobody knows what is real.</p>' +
      '</div>';

    return (
      '<div class="pipe-grid">' +
      '<div class="pipe-col pipe-left stack-4">' +
      '<div class="run-tabs" role="tablist" aria-label="Pipeline runs">' + runTabs + '</div>' +
      consoleBox + m9 + h4 +
      '</div>' +
      register +
      '</div>'
    );
  }

  window.BPanels = {
    draftingBoard: draftingBoard,
    planStudio: planStudio,
    driftBoard: driftBoard,
    scanBench: scanBench,
    pipelineConsole: pipelineConsole,
  };
})();
