// ─── SKYSCAN objectives: validation engine, star rating, quiz scoring ────────
// 1:1 port of the original framework lab's src/lib/lab/engine.ts
// (checkObjective, starRating, quizScore, allObjectivesDone, quizAllChecked).
// Every check rule, gate and feedback message is identical to the original.

(function (SKY) {
  'use strict';

  SKY.checkObjective = function (objId, state, env) {
    var obj = SKY.OBJECTIVES_BY_ID[objId];
    var mode = state.mode || 'medium';
    if (!obj) return { pass: false, msg: 'Unknown objective.' };
    var d = SKY.getDrill(state, objId);
    var fail = function (msg) { return { pass: false, msg: msg }; };

    switch (objId) {
      case 'OBJ-M1': {
        if (!state.scanInitial) return fail('Run the initial assessment first — the report must exist before it can be analyzed.');
        var sel = d.sel || [];
        var exp = (obj.drill && obj.drill.kind === 'multi' && obj.drill.correct) || [];
        var pass = sel.length === exp.length && exp.every(function (x) { return sel.indexOf(x) !== -1; });
        return pass
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Pick exactly two. The report\u2019s Layer column shows two values: application/instance vulnerabilities and platform configuration misconfigurations. Device health and email reputation are not assessed by this platform tool.');
      }
      case 'OBJ-M2': {
        var ans = d.cls || {};
        var exp2 = (obj.drill && obj.drill.kind === 'classify' && obj.drill.answer) || {};
        var all = Object.keys(exp2).every(function (k) { return ans[k] === exp2[k]; });
        return all
          ? { pass: true, msg: obj.feedbackPass }
          : fail(
              Object.keys(exp2).filter(function (k) { return ans[k] !== exp2[k]; }).some(function (k) { return k === 'F-APP-04'; })
                ? 'Almost — re-check the TLS finding: the LB listener policy is a configuration of the platform\u2019s edge component, but it is assessed by the app-scan layer and fixed in the app\u2019s delivery settings — treat it as application/instance layer.'
                : 'Some classifications are off. Ask for each: is this about code/packages running on a machine (app/instance), or a setting on a cloud resource such as a bucket policy, audit trail or metadata service (platform)?'
            );
      }
      case 'OBJ-M3': {
        var flagged = state.flags.indexOf('bucket-nimbusstack-exports') !== -1;
        var dtype = SKY.norm(d.dataType);
        var okData =
          dtype.indexOf('pii') !== -1 ||
          dtype.indexOf('personally') !== -1 ||
          dtype.indexOf('personal data') !== -1 ||
          dtype.indexOf('customer data') !== -1 ||
          dtype.indexOf('customer record') !== -1 ||
          dtype.indexOf('customer information') !== -1 ||
          dtype.indexOf('ppi') !== -1;
        if (!flagged) return fail('You have not flagged the right resource yet. Compare public_read and public_access_block across the two buckets in the Estate tab.');
        if (!okData) return fail('Flagging is right, but the data classification is off. Open the bucket\u2019s evidence: it holds nightly customer PII export files (names, emails, order history).');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-M4': {
        return state.flags.indexOf('iam-svc-reporting') !== -1
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Not flagged yet. In Estate \u2192 Identity & Access, find the identity with mfa=DISABLED AND AdministratorAccess attached — then flag it for triage.');
      }
      case 'OBJ-M5': {
        var flagged5 = state.flags.indexOf('sg-database') !== -1;
        var port = SKY.norm(d.port);
        if (!flagged5) return fail('Not flagged yet. Look at each security group\u2019s ingress source: 0.0.0.0/0 means the entire internet.');
        if (port !== '3306') return fail('Right group, wrong port — the ingress line reads 3306/tcp from 0.0.0.0/0.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-M6': {
        return state.flags.indexOf('vm-web-prod-01') !== -1
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Not flagged yet. Compare security_patches_missing and agent findings across Compute — one internet-facing instance collects four findings.');
      }
      case 'OBJ-M7': {
        var idOk = SKY.normId(d.findingId) === 'FPLT01';
        var scoreOk = SKY.norm(d.score) === '9 1' || SKY.norm(d.score) === '9.1';
        if (!idOk) return fail('Sort or scan the Score column — the top value is 9.1 on a Storage-domain finding (hint tier 3 says which if you are stuck).');
        if (!scoreOk) return fail('The finding ID is right; re-read its Score cell — two digits before the decimal.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-M8':
      case 'OBJ-H2': {
        var ansM = d.match || {};
        var expM = (obj.drill && obj.drill.kind === 'match' && obj.drill.answer) || {};
        var wrong = Object.keys(expM).filter(function (k) { return ansM[k] !== expM[k]; });
        return wrong.length === 0
          ? { pass: true, msg: obj.feedbackPass }
          : fail(
              mode === 'hard'
                ? 'Incorrect mappings: ' + wrong.join(', ') + '. Exact technique IDs are required — check the Debrief technique table (sub-technique suffixes matter) and re-derive from what each misconfig actually lets an attacker DO.'
                : 'Incorrect mapping(s): ' + wrong.join(', ') + '. Read each technique name in the Debrief — it describes what the misconfig lets an attacker do.'
            );
      }
      case 'OBJ-M9': {
        var need = [
          ['F-PLT-01', 'restrict'],
          ['F-PLT-02', 'mfa'],
          ['F-PLT-03', 'restrictsg'],
        ];
        var missing = need.filter(function (pair) { return ((state.applied[pair[0]] || []).indexOf(pair[1]) === -1); });
        return missing.length === 0
          ? { pass: true, msg: obj.feedbackPass }
          : fail('The deck shows these three findings as not yet remediated with the report\u2019s first recommendation (' + missing.map(function (p) { return p[0]; }).join(', ') + '). Open the Remediation tab — each card quotes the report recommendation at the top.');
      }
      case 'OBJ-M10': {
        var ansR = d.resp || {};
        var expR = (obj.drill && obj.drill.kind === 'resp' && obj.drill.answer) || {};
        var wrongR = Object.keys(expR).filter(function (k) { return ansR[k] !== expR[k]; });
        return wrongR.length === 0
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Re-check ' + wrongR.join(', ') + ': do YOU operate that layer? Buckets and guest libraries are customer-operated; a managed database engine and provider edge firmware are not.');
      }
      case 'OBJ-M11': {
        var order = d.order || [];
        var ok = order.join('|') === 'F-PLT-01|F-APP-02|F-PLT-05';
        return ok
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Order them by severity \u00d7 public exposure \u00d7 data sensitivity: internet-exposed PII first, the public-facing unpatched VM second, internal encryption-at-rest last.');
      }
      case 'OBJ-M12': {
        if (!state.scanRescan) return fail('Run RUN RE-ASSESSMENT in the Assessment tab — verification is the point of this objective.');
        var clearedOk = env.clearedCount >= 5 && env.posture > SKY.initialPosture() + 10;
        if (!clearedOk) return fail('The re-scan ran, but not enough has changed: remediate at least five findings (deck tab), then re-scan again.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H1': {
        var raw = String(d.chSet == null ? '' : d.chSet);
        var ids = new Set(
          raw
            .split(/[\s,;]+/)
            .map(function (x) { return SKY.normId(x); })
            .filter(Boolean)
        );
        if (ids.size === 0) return fail('Enter the finding IDs from the report (comma or space separated).');
        var expected = new Set(['FPLT01', 'FPLT02', 'FAPP01', 'FPLT03', 'FPLT07', 'FAPP02', 'FPLT04']);
        var extras = Array.from(ids).filter(function (x) { return !expected.has(x); });
        var missingH = Array.from(expected).filter(function (x) { return !ids.has(x); });
        if (extras.indexOf('FFP01') !== -1) return fail('F-FP-01 rejected: the backups bucket is NOT public — raw config shows public_read=false and public_access_block=ON. The rule misread the policy.');
        if (extras.indexOf('FFP02') !== -1) return fail('F-FP-02 rejected: installed kernel 5.15.0-1032 already contains the fix (fixed in 5.15.0-1029, simplified advisory). Version comparison disproves it.');
        if (extras.length) return fail('Rejected: ' + extras.join(', ') + ' — not genuine Critical/High findings (wrong severity or contradicted by evidence).');
        if (missingH.length) return fail('Incomplete: you are missing ' + missingH.join(', ') + '. Nine lines are rated Critical/High; two are false — the remaining seven are the answer.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H3': {
        var entry = SKY.norm(d.entry);
        var okEntry = entry.indexOf('nimbusstack exports') !== -1 || entry.indexOf('nimbusstackexports') !== -1;
        var fA = SKY.normId(d.fA);
        var fB = SKY.normId(d.fB);
        if (!okEntry) return fail('Wrong entry point. What did the scanner read first — which resource held the 1,204 export files?');
        if (fA !== 'FPLT01') return fail('Finding A is wrong: the door itself was the public export bucket — F-PLT-01.');
        if (fB !== 'FPLT07') return fail('Finding B is wrong: the credentials came from the PUBLIC SNAPSHOT containing the database dump — F-PLT-07.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H4': {
        var b = state.applied['F-PLT-01'] || [];
        var i = state.applied['F-PLT-02'] || [];
        var seqOk = b[0] === 'restrict' && b[1] === 'scrub';
        var idOk4 = i.indexOf('mfa') !== -1 && i.indexOf('lpa') !== -1;
        if (!seqOk && !idOk4) return fail('Neither remediation is complete. Bucket: restrict access FIRST, then scrub/rotate. Identity: both MFA and the least-privilege policy are required.');
        if (!seqOk) return fail('Bucket sequence wrong or incomplete: contain first (restrict), correct second (scrub exposed files). Order matters because restriction stops NEW collection.');
        if (!idOk4) return fail('Identity incomplete: the report requires BOTH enforcing MFA and replacing AdministratorAccess with least privilege.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H5': {
        var must = ['F-PLT-01', 'F-PLT-02', 'F-APP-01', 'F-PLT-03', 'F-PLT-07', 'F-APP-02', 'F-PLT-04'];
        var notCleared = must.filter(function (fid) {
          var f = SKY.FINDING_BY_ID[fid];
          return !f || env.statusOf(f) === 'open';
        });
        if (notCleared.length) return fail('Not verified yet: ' + notCleared.join(', ') + ' are still open. Remediate every customer-owned Critical/High finding, then RUN RE-ASSESSMENT.');
        if (!state.scanRescan) return fail('Run RUN RE-ASSESSMENT to verify before answering.');
        var s = d.s2 || {};
        var remainsOk = SKY.norm(s.remains).indexOf('prv 01') !== -1 || SKY.norm(s.remains).indexOf('prv01') !== -1;
        var partyOk = SKY.norm(s.party) === 'provider';
        var actOk = SKY.norm(s.custAction).indexOf('track') !== -1 || SKY.norm(s.custAction).indexOf('advisory') !== -1;
        if (!remainsOk) return fail('Wrong finding — after full customer remediation, exactly one finding remains: the managed DB engine CVE (F-PRV-01), which you cannot patch.');
        if (!partyOk) return fail('Owner is wrong: the engine layer is provider-operated — the provider must remediate it.');
        if (!actOk) return fail('Your action is wrong: you cannot patch or re-image the engine. The correct move is tracking the provider advisory and verifying the engine upgrade.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H6': {
        var ansP = d.pairs || {};
        var expP = (obj.drill && obj.drill.kind === 'pairs' && obj.drill.answer) || {};
        var wrongA = (ansP.fp1 == null) || (ansP.fp1.finding !== expP.fp1.finding) || (ansP.fp1.field !== expP.fp1.field);
        var wrongB = (ansP.fp2 == null) || (ansP.fp2.finding !== expP.fp2.finding) || (ansP.fp2.field !== expP.fp2.field);
        if (!wrongA && !wrongB) return { pass: true, msg: obj.feedbackPass };
        var parts = [];
        if (wrongA) parts.push('Claim A dies on public_access_block=ON (not public_read — that only repeats the claim\u2019s subject).');
        if (wrongB) parts.push('Claim B dies on kernel_installed — installed 5.15.0-1032 \u2265 fixed 5.15.0-1029 (simplified advisory).');
        return fail('Not quite. ' + parts.join(' ') + ' Select the finding AND the single attribute that contradicts it.');
      }
      case 'OBJ-H7': {
        var selH = d.sel || [];
        var expH = (obj.drill && obj.drill.kind === 'multi' && obj.drill.correct) || [];
        var passH = selH.length === expH.length && expH.every(function (x) { return selH.indexOf(x) !== -1; });
        return passH
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Exactly three statements are defensible. Reject any contradicted by the report (instances are NOT fully patched), by the shared responsibility model (you cannot re-image a managed engine), or by topology (3306 feeds the database, not the public site).');
      }
      case 'OBJ-H8': {
        var s8 = d.s2 || {};
        var reasonOk = SKY.norm(s8.reason).indexOf('provider') !== -1 && SKY.norm(s8.reason).indexOf('not customer') !== -1;
        var compOk = SKY.norm(s8.compensate).indexOf('advisor') !== -1 || SKY.norm(s8.compensate).indexOf('attestation') !== -1;
        if (!reasonOk) return fail('Reason is off: the tool cannot assess a layer that is provider-operated and not customer-visible — licensing, "databases can\u2019t be scanned" and encryption are distractors.');
        if (!compOk) return fail('Compensating practice is off: where you cannot scan, you substitute provider advisories, attestations and status pages — not port scans from home.');
        return { pass: true, msg: obj.feedbackPass };
      }
      case 'OBJ-H9': {
        var sel9 = d.pick || [];
        var ok9 = sel9.length === 2 && sel9.indexOf('F-PLT-01') !== -1 && sel9.indexOf('F-PLT-02') !== -1;
        return ok9
          ? { pass: true, msg: obj.feedbackPass }
          : fail('Not the highest combined reduction. Only two findings are Critical: the actively-exposed PII bucket and the full-control no-MFA identity. Both are quick, decisive fixes.');
      }
      default:
        return fail('Validation not configured for this objective.');
    }
  };

  // ── star rating ──

  SKY.starRating = function (state) {
    var modeObjs = state.mode === 'hard' ? SKY.HARD_OBJECTIVES : SKY.MEDIUM_OBJECTIVES;
    var total = 0;
    var n = 0;
    modeObjs.forEach(function (o) {
      var s = state.objectives[o.id];
      if (!s) return;
      n += 1;
      var penalty = state.mode === 'hard' ? 0.25 * s.wrong + 1.0 * s.hints : 0.2 * s.wrong + 0.25 * s.hints;
      total += Math.max(state.mode === 'hard' ? 0.3 : 0.25, 1 - penalty);
    });
    if (n === 0) return 0;
    var q = total / n;
    var quiz = SKY.QUIZ_BY_MODE(state.mode || 'medium');
    var quizCorrect = quiz.filter(function (q2) {
      var a = state.quizAnswers[q2.id] || [];
      return q2.correct.length === a.length && q2.correct.every(function (c) { return a.indexOf(c) !== -1; });
    }).length;
    var quizBonus = quiz.length ? (quizCorrect / quiz.length) * 1.0 : 0;
    return Math.max(1, Math.min(5, Math.round(q * 4 + Math.min(quizBonus, 1))));
  };

  SKY.quizScore = function (state) {
    var quiz = SKY.QUIZ_BY_MODE(state.mode || 'medium');
    var correct = 0;
    quiz.forEach(function (q) {
      var a = state.quizAnswers[q.id] || [];
      if (q.correct.length === a.length && q.correct.every(function (c) { return a.indexOf(c) !== -1; })) correct += 1;
    });
    return { correct: correct, total: quiz.length };
  };

  SKY.allObjectivesDone = function (state) {
    var env = SKY.deriveEnv(state);
    return env.doneCount === env.totalObjectives;
  };

  SKY.quizAllChecked = function (state) {
    var quiz = SKY.QUIZ_BY_MODE(state.mode || 'medium');
    return quiz.every(function (q) { return state.quizChecked[q.id]; });
  };
})(window.SKY);
