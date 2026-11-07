// ============================================================================
// Engine: policy evaluation, login simulation, objective validators, scoring.
// Verbatim logic port of src/lib/lab/engine.ts (pure functions, no DOM).
// ============================================================================
'use strict';

window.LAB_ENGINE = (function () {
  const D = window.LAB_DATA;

  const QUIZ_BANK = { medium: D.QUIZ_MEDIUM, hard: D.QUIZ_HARD };

  // --- helpers ---------------------------------------------------------------
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function globMatch(pattern, value) {
    if (!pattern) return false;
    const re = new RegExp('^' + pattern.split('*').map(escapeRe).join('.*') + '$');
    return re.test(value);
  }

  function ipToInt(ip) {
    const p = ip.split('.').map((x) => parseInt(x, 10));
    if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255)) return -1;
    return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
  }

  function ipInCidr(ip, cidr) {
    const parts = cidr.split('/');
    const base = parts[0], bitsRaw = parts[1];
    const bits = parseInt(bitsRaw, 10);
    const a = ipToInt(ip);
    const b = ipToInt(base);
    if (a < 0 || b < 0 || isNaN(bits) || bits < 0 || bits > 32) return false;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (a & mask) === (b & mask);
  }

  function extractIp(label) {
    const m = label.match(/^(\d+\.\d+\.\d+\.\d+)/);
    return m ? m[1] : label;
  }

  function parsePolicy(json) {
    try {
      const doc = JSON.parse(json);
      const stmts = doc && doc.Statement;
      if (!Array.isArray(stmts) || stmts.length === 0) return { error: 'no Statement array' };
      const statements = stmts.map((s) => {
        const acts = Array.isArray(s.Action) ? s.Action : s.Action ? [String(s.Action)] : [];
        const ress = Array.isArray(s.Resource) ? s.Resource : s.Resource ? [String(s.Resource)] : [];
        let condIp;
        let condMfa;
        const cond = s.Condition;
        if (cond && cond.IpAddress && cond.IpAddress['stratus:SourceIp']) condIp = cond.IpAddress['stratus:SourceIp'];
        if (cond && cond.Bool && cond.Bool['stratus:MFA'] !== undefined) condMfa = cond.Bool['stratus:MFA'] === 'true';
        return { sid: String(s.Sid != null ? s.Sid : ''), effect: (s.Effect === 'Deny' ? 'Deny' : 'Allow'), actions: acts, resources: ress, condIp, condMfa };
      });
      return { statements };
    } catch (e) {
      return { error: 'invalid JSON' };
    }
  }

  // --- request evaluation ------------------------------------------------------
  function evaluatePolicies(env, principal, action, resource, ip, mfa) {
    const attached = Object.entries(env.attachments)
      .filter(([pid, prins]) => prins.includes(principal) && env.policies[pid])
      .map(([pid]) => ({ pid, parsed: parsePolicy(env.policies[pid]) }));
    const trace = [
      `IDENTIFY  principal ${principal} presents a credential`,
      `AUTHENTICATE  ${mfa ? 'MFA token verified' : 'credential verified (no MFA)'} from ${ip}`,
      `AUTHORIZE  evaluating ${attached.length} attached policy document(s)…`,
    ];
    let allowMatched = false;
    for (const { pid, parsed } of attached) {
      if (parsed.error) {
        trace.push(`  ⚠ ${pid}: ${parsed.error} — skipped (defaults still apply)`);
        continue;
      }
      for (const st of parsed.statements) {
        const actMatch = st.actions.some((a) => globMatch(a, action));
        const resMatch = st.resources.some((r) => globMatch(r, resource));
        if (!actMatch || !resMatch) continue;
        const condParts = [];
        if (st.condIp) {
          const ok = ipInCidr(extractIp(ip), st.condIp);
          condParts.push(`SourceIp in ${st.condIp}: ${ok ? 'ok' : 'FAILED'}`);
          if (!ok) continue;
        }
        if (st.condMfa !== undefined) {
          const ok = mfa === st.condMfa;
          condParts.push(`MFA=${st.condMfa}: ${ok ? 'ok' : 'FAILED'}`);
          if (!ok) continue;
        }
        const condTxt = condParts.length ? ` (Condition ${condParts.join(', ')})` : '';
        if (st.effect === 'Deny') {
          trace.push(`  ✖ ${pid}${st.sid ? '[' + st.sid + ']' : ''}: Deny matched${condTxt} → decision locked`);
          trace.push('DECISION  DENY (explicit) — an explicit Deny overrides every Allow.');
          return { verdict: 'deny-explicit', trace };
        }
        allowMatched = true;
        trace.push(`  ✓ ${pid}${st.sid ? '[' + st.sid + ']' : ''}: Allow matched${condTxt}`);
      }
    }
    if (allowMatched) {
      trace.push('DECISION  ALLOW — at least one statement allows this request and no Deny matched.');
      return { verdict: 'allowed', trace };
    }
    trace.push('DECISION  DENY (implicit) — no statement matched. Cloud IAM denies by default.');
    return { verdict: 'deny-implicit', trace };
  }

  function loginVerdict(env, user, ip, mfa, protocol) {
    if (env.identities[user] === 'disabled') return 'blocked-account-disabled';
    if (protocol === 'legacy' && env.ca.blockLegacy) return 'blocked-legacy-protocol';
    if (env.ca.restrictCidr && !ipInCidr(extractIp(ip), '10.0.0.0/16')) return 'blocked-outside-corporate-range';
    const groupMfa =
      env.ca.mfaAll ||
      (env.ca.mfaAdmins && user === 'alex.kim') ||
      (env.ca.mfaFinance && (user === 'dana.wells'));
    if (groupMfa && !mfa) return 'blocked-mfa-required';
    return 'allowed';
  }

  // --- validators -------------------------------------------------------------
  function simHit(env, principal, action, resource, verdict) {
    return env.simRuns.some(
      (r) => r.principal === principal && r.action === action && (resource ? r.resource === resource : true) && (verdict ? r.verdict === verdict : true)
    );
  }

  function loginHit(env, user, ip, mfa, protocol, verdictPrefix) {
    return env.loginRuns.some((r) => r.user === user && r.ip === ip && r.mfa === mfa && r.protocol === protocol && r.verdict.startsWith(verdictPrefix));
  }

  function seqOrder(log, steps) {
    let idx = -1;
    for (const s of steps) {
      const i = log.indexOf(s, idx + 1);
      if (i === -1) return false;
      idx = i;
    }
    return true;
  }

  const VALIDATORS = {
    'OBJ-M1': (env) => {
      const ok = env.aaaOrder.join(',') === 'identification,authentication,authorization,accounting' && env.aaaRecordQ === 'accounting';
      return {
        pass: ok,
        msg: ok
          ? 'Correct pipeline: claim → prove → decide → record. Every request you simulated walked exactly these stages — the trace in the Simulator labels them.'
          : 'Not quite. Order: Identification (claim) → Authentication (prove) → Authorization (decide) → Accounting (record). And the audit-trail question answer is Accounting.',
      };
    },
    'OBJ-M2': (env) => {
      const all = ['password', 'securityq', 'totp', 'hkey', 'fingerprint', 'face'];
      const map = { password: 'know', securityq: 'know', totp: 'have', hkey: 'have', fingerprint: 'are', face: 'are' };
      const ok = all.every((k) => env.factorAssign[k] && env.factorAssign[k] === map[k]);
      return {
        pass: ok,
        msg: ok
          ? 'All six classified. An MFA pair must draw from DIFFERENT categories — password + TOTP (know+have) is MFA; password + PIN is not.'
          : 'Some factors are misplaced. know = memorized (password, security questions); have = possessed (authenticator app, hardware key); are = biometric (fingerprint, face).',
      };
    },
    'OBJ-M3': (env) => {
      const ok = simHit(env, 'role-qa', 'store:object:Put', 'customer-analytics/events.json', 'deny-implicit');
      return {
        pass: ok,
        msg: ok
          ? 'You met the implicit deny: QA had no matching Allow for Put, and cloud IAM denies by default. No Deny statement needed — absence of Allow is denial.'
          : 'Run the probe in the Simulator (role-qa / store:object:Put / customer-analytics/events.json) and confirm the verdict reads DENY (implicit).',
      };
    },
    'OBJ-M4': (env) => {
      const ok = simHit(env, 'role-finops', 'store:object:Get', 'payroll-export/summary.csv', 'deny-explicit');
      return {
        pass: ok,
        msg: ok
          ? 'Explicit deny demonstrated: finance-read allowed it, but payroll-guard’s Deny locked the decision. Order of attachment never matters — Deny always wins.'
          : 'Run the probe (role-finops / store:object:Get / payroll-export/summary.csv) and watch the trace: the guard’s Deny locks the decision as deny-explicit.',
      };
    },
    'OBJ-M5': (env) => {
      const parsed = parsePolicy(env.policies['pol-devops-wildcard']);
      if (parsed.error || !parsed.statements) return { pass: false, msg: 'The policy JSON does not parse. Fix the JSON first (checker needs valid Effect/Action/Resource).' };
      const allow = parsed.statements.find((s) => s.effect === 'Allow');
      if (!allow) return { pass: false, msg: 'Keep an Allow statement — least privilege narrows it, it does not delete it.' };
      const badActions = allow.actions.some((a) => a.includes('Delete') || a.includes('Put') || a === 'store:*' || a === '*');
      const okActions = allow.actions.length === 2 && allow.actions.includes('store:object:Get') && allow.actions.includes('store:object:List');
      const okRes = allow.resources.length > 0 && allow.resources.every((r) => r.includes('dev-') || r.includes('dev-*')) && !allow.resources.includes('*');
      const t1 = evaluatePolicies(env, 'role-devops', 'store:object:Get', 'dev-sandbox/build.log', D.IP_CORP, true).verdict === 'allowed';
      const t2 = evaluatePolicies(env, 'role-devops', 'store:object:Get', 'payroll-export/summary.csv', D.IP_CORP, true).verdict === 'deny-implicit';
      const t3 = evaluatePolicies(env, 'role-devops', 'store:object:Delete', 'dev-sandbox/build.log', D.IP_CORP, true).verdict === 'deny-implicit';
      const pass = okActions && okRes && t1 && t2 && t3;
      return {
        pass,
        msg: pass
          ? 'Least privilege achieved: Get+List only, dev buckets only. Probe 1 (Get dev) → Allow; probe 2 (Get payroll) → deny-implicit; probe 3 (Delete dev) → deny-implicit. Payroll is out of reach.'
          : `Not there yet. ${badActions ? 'Remove destructive/wildcard actions (store:*, Put, Delete). ' : ''}${!okRes ? 'Resources must be limited to dev-sandbox/* and dev-ml-experiments/* — no bare *. ' : ''}Checker probes: Get dev=${t1 ? 'allow ✓' : 'must allow'}, Get payroll=${t2 ? 'deny ✓' : 'must deny'}, Delete dev=${t3 ? 'deny ✓' : 'must deny'}.`,
      };
    },
    'OBJ-M6': (env) => {
      const ok = env.authzMatch['az1'] === 'RBAC' && env.authzMatch['az2'] === 'GBAC' && env.authzMatch['az3'] === 'DAC';
      return {
        pass: ok,
        msg: ok
          ? 'RBAC (role assigned), GBAC (group membership), DAC (owner decides). Exam items love these three — you can now tell them apart in a scenario.'
          : 'Role assigned to a person = RBAC; access through group membership = GBAC; resource owner sets permissions personally = DAC.',
      };
    },
    'OBJ-M7': (env) => {
      const expected = ['User opens the StratusForge console (service provider) and is redirected to sign in', 'Console sends a SAML authentication request to the corporate identity provider', 'IdP authenticates the user (directory credentials + MFA)', 'IdP returns a signed SAML assertion asserting who the user is and their group/role attributes', 'Console validates the assertion signature and audience, then grants a federated console session'];
      const orderOk = env.samlOrder.length === 5 && env.samlOrder.every((s, i) => s === expected[i]);
      const protoOk = env.protocolMatch['pm1'] === 'OAuth 2.0' && env.protocolMatch['pm2'] === 'OIDC' && env.protocolMatch['pm3'] === 'SAML';
      return {
        pass: orderOk && protoOk,
        msg: orderOk && protoOk
          ? 'Handshake ordered and protocols mapped: OAuth 2.0 delegates authorization, OIDC adds authentication on top, SAML carries XML assertions for enterprise SSO.'
          : `${!orderOk ? 'Re-order the five steps (user always starts at the console; the IdP never initiates). ' : ''}${!protoOk ? 'Protocol picks: delegated authorization=OAuth 2.0, identity layer on OAuth=OIDC, XML enterprise SSO=SAML.' : ''}`,
      };
    },
    'OBJ-M8': (env) => {
      const pass = env.h1Identity === 'svc-reporting' && env.h1Event === 'ev05';
      return {
        pass,
        msg: pass
          ? 'Correct triage: svc-reporting’s static key was replayed from 198.51.100.23 at 02:41 — its baseline is 10.0.8.5 and daytime hours. First malicious event = 2026-11-04 02:41 (store:object:List on payroll-export).'
          : 'Look for the identity whose key acted from a NEW network outside its baseline. The earliest event from 198.51.100.23 is the intrusion start.',
      };
    },
    'OBJ-M9': (env) => {
      const expected = ['ev05', 'ev06', 'ev07', 'ev09', 'ev10'].sort();
      const got = [...env.flagged].sort();
      const pass = expected.length === got.length && expected.every((e, i) => e === got[i]);
      return {
        pass,
        msg: pass
          ? 'Detection tuned like an analyst: three svc-reporting events from the unknown network + the departed employee’s sign-in and secret read. Scanner noise, scheduled CI and vendor sign-ins stay unflagged — alert fatigue is a real cost.'
          : `Expected exactly the five true positives: ev05, ev06, ev07 (svc-reporting from 198.51.100.23) and ev09, ev10 (dana.wells, a departed employee, active after Oct 31). Currently flagged: ${got.length ? got.join(', ') : 'none'}.`,
      };
    },
    'OBJ-M10': (env) => {
      const stateOk = env.ca.mfaAdmins && env.ca.mfaFinance && env.ca.blockLegacy;
      const testOk = loginHit(env, 'alex.kim', D.IP_UNKNOWN, false, 'modern', 'blocked');
      return {
        pass: stateOk && testOk,
        msg: stateOk && testOk
          ? 'Verified: MFA enforced for Admins + Finance, legacy protocols blocked, and the probe from an unrecognized network without MFA was Blocked. These switches implement MITRE M1032 (MFA) and M1036 (account use policies).'
          : `${!stateOk ? 'Set the two MFA switches (Admins, Finance) and block legacy protocols. ' : ''}${!testOk ? 'Record the test: alex.kim / unrecognized IP / MFA off / modern protocol → must end Blocked.' : ''}`,
      };
    },
    'OBJ-M11': (env) => {
      const k1 = env.keys['key-svc-reporting-1'];
      const pass = env.identities['dana.wells'] === 'disabled' && env.keys['key-dana-1'] === 'revoked' && (k1 === 'rotated' || (k1 === 'revoked' && env.keys['key-svc-reporting-2'] === 'active'));
      return {
        pass,
        msg: pass
          ? 'Lifecycle closed: departed account disabled, her key revoked, and the 664-day-old service key replaced with a fresh secret. Disabling alone is never enough — programmatic keys keep working.'
          : 'Needed: dana.wells disabled (Directory), key-dana-1 revoked (Vault), key-svc-reporting-1 rotated (Vault). All three states are checked.',
      };
    },
    'OBJ-M12': (env) => {
      const want = {
        rc1: 'Rotate/revoke keys; vault future secrets',
        rc2: 'Individual accounts + privileged access mgmt',
        rc3: 'Require multi-factor authentication (M1032)',
        rc4: 'Least privilege: narrow actions and scope',
      };
      const ok = Object.keys(want).every((k) => env.review['rc:' + k] === want[k]);
      return {
        pass: ok,
        msg: ok
          ? 'All four risks matched to root-cause controls. Notice how each wrong option treats a symptom — the exam tests exactly this discrimination.'
          : 'Match by root cause: leaked key→rotation/vaulting; shared login→individual identities+PAM; password-only→MFA; wildcard policy→least privilege.',
      };
    },
    // ---- HARD ----
    'OBJ-H1': (env) => {
      const pass = env.h1Identity === 'svc-reporting' && env.h1Event === 'ev05' && env.h1Vector === 'leaked-key';
      return {
        pass,
        msg: pass
          ? 'Clean triage despite the noise: identity svc-reporting, first malicious event 2026-11-04 02:41 (key use from 198.51.100.23), vector = leaked static API key. The scanner failures, the 03:10 CI job and the contractor’s untidy policy attach were all red herrings.'
          : 'Exact answers required. Hint path: one identity acted from a network it had NEVER used before — start there, then identify how the attacker got in (the key’s history matters).',
      };
    },
    'OBJ-H2': (env) => {
      const orderOk = seqOrder(env.h2Order, ['ev05', 'ev06', 'ev07', 'ev16']);
      const mitreOk = env.h2Mitre.theft === 'T1528' && env.h2Mitre.use === 'T1078' && env.h2Mitre.escalation === 'T1098';
      return {
        pass: orderOk && mitreOk,
        msg: orderOk && mitreOk
          ? 'Chain reconstructed: key used (02:41) → self-granted IAM full control (02:43, T1098 Account Manipulation) → payroll read (02:44) → analytics read (02:45). Theft = T1528 Steal Application Access Token; use of the stolen identity = T1078 Valid Accounts; escalation = T1098.'
          : `${!orderOk ? 'Chronology: 02:41 List payroll → 02:43 attach admin policy → 02:44 read payroll → 02:45 read analytics. ' : ''}${!mitreOk ? 'M-IDs: obtaining the key = T1528; acting as the stolen identity = T1078; granting itself permissions = T1098.' : ''}`,
      };
    },
    'OBJ-H3': (env) => {
      const parsed = parsePolicy(env.policies['pol-finops-guarded']);
      if (parsed.error || !parsed.statements) return { pass: false, msg: 'pol-finops-guarded JSON does not parse yet.' };
      const attachedOk = (env.attachments['pol-finops-guarded'] || []).includes('role-finops');
      const guardDetached = !(env.attachments['pol-payroll-guard'] || []).includes('role-finops');
      const financeDetached = !(env.attachments['pol-finance-ro'] || []).includes('role-finops');
      const allowGated = parsed.statements.find((s) => s.effect === 'Allow' && s.condIp !== undefined);
      const allowPlain = parsed.statements.find((s) => s.effect === 'Allow' && s.condIp === undefined);
      const deny = parsed.statements.find((s) => s.effect === 'Deny');
      if (!allowGated || !allowPlain || !deny) return { pass: false, msg: 'Need THREE statements: a conditioned Allow (Get on payroll-export/*), a plain Allow (Get on customer-analytics/*), and an explicit Deny (Put on payroll-export/*).' };
      const allowGatedOk = allowGated.actions.includes('store:object:Get') && allowGated.resources.includes('payroll-export/*') && allowGated.condIp === '10.0.0.0/16' && allowGated.condMfa === true;
      const allowPlainOk = allowPlain.actions.includes('store:object:Get') && allowPlain.resources.includes('customer-analytics/*');
      const denyOk = deny.actions.includes('store:object:Put') && deny.resources.includes('payroll-export/*');
      const t1 = evaluatePolicies(env, 'role-finops', 'store:object:Get', 'payroll-export/summary.csv', D.IP_CORP, true).verdict === 'allowed';
      const t2 = evaluatePolicies(env, 'role-finops', 'store:object:Get', 'payroll-export/summary.csv', D.IP_UNKNOWN, true).verdict === 'deny-implicit';
      const t3 = evaluatePolicies(env, 'role-finops', 'store:object:Put', 'payroll-export/summary.csv', D.IP_CORP, true).verdict === 'deny-explicit';
      const t4 = evaluatePolicies(env, 'role-finops', 'store:object:Get', 'customer-analytics/events.json', D.IP_CORP, true).verdict === 'allowed';
      const pass = allowGatedOk && allowPlainOk && denyOk && attachedOk && guardDetached && financeDetached && t1 && t2 && t3 && t4;
      return {
        pass,
        msg: pass
          ? 'Production-grade policy: corporate-IP + MFA gated Allow for payroll reads, unconditioned Allow for analytics, explicit Deny for writes, and BOTH legacy policies detached. All four probes behaved as designed — this is condition-based least privilege, the Cloud+ answer to “implement IAM”.'
          : `Probes: 1 Get payroll (corp+MFA)=${t1 ? 'allow ✓' : 'should ALLOW'} · 2 Get payroll (unknown IP)=${t2 ? 'deny-implicit ✓' : 'should deny-implicit (condition fails)'} · 3 Put payroll=${t3 ? 'deny-explicit ✓' : 'should deny-explicit'} · 4 Get analytics=${t4 ? 'allow ✓' : 'should ALLOW (plain statement)'}. ${!allowGatedOk ? 'Gated Allow must be Get on payroll-export/* with Condition IpAddress stratus:SourceIp=10.0.0.0/16 and Bool stratus:MFA=true. ' : ''}${!allowPlainOk ? 'Plain Allow must cover Get on customer-analytics/*. ' : ''}${!denyOk ? 'Deny must cover store:object:Put on payroll-export/*. ' : ''}${!attachedOk ? 'Attach pol-finops-guarded to role-finops. ' : ''}${!guardDetached || !financeDetached ? 'Detach BOTH payroll-guard and finance-read from role-finops — finance-read’s unconditioned payroll Allow defeats your condition gate.' : ''}`,
      };
    },
    'OBJ-H4': (env) => {
      const ok = env.h4.q1 === 'deny-explicit' && env.h4.q2 === 'deny-implicit' && env.h4.q3 === 'allow';
      return {
        pass: ok,
        msg: ok
          ? 'You predicted the engine exactly: explicit Deny beats Allow (probe 1); no Allow → implicit deny (probe 2); unconditioned Allow matches → allowed (probe 3).'
          : 'Reason like the engine: explicit Deny > matching Allow > default deny. Probe 1 hits payroll-guard; probe 2 matches nothing; probe 3 matches devops-wide.',
      };
    },
    'OBJ-H5': (env) => {
      const seqOk = seqOrder(env.actionLog, ['revoke:key-svc-reporting-1', 'rotate:key-svc-reporting-1', 'detach:pol-iam-full-access:svc-reporting', 'verify:svc-reporting:store:object:Put:payroll-export']);
      const k1 = env.keys['key-svc-reporting-1'] === 'revoked';
      const k2 = env.keys['key-svc-reporting-2'] === 'active';
      const detached = !(env.attachments['pol-iam-full-access'] || []).includes('svc-reporting');
      const justified = env.h5Justify === 'correct';
      const pass = seqOk && k1 && k2 && detached && justified;
      return {
        pass,
        msg: pass
          ? 'Containment sequenced like an incident responder: kill the stolen credential FIRST (revoke), restore service with a NEW secret (rotate), remove attacker persistence (detach), then verify the blast radius is gone (Put probe now deny-implicit). Revoking before rotating stops the bleeding before service restoration.'
          : `Sequence required: revoke key → rotate replacement → detach pol-iam-full-access from svc-reporting → verify with simulator probe (svc-reporting / store:object:Put / payroll-export → deny). ${!justified ? 'Also select the correct justification for revoke-before-rotate.' : ''} Current: k1=${k1 ? 'revoked ✓' : 'not revoked'}, k2=${k2 ? 'active ✓' : 'no replacement'}, detached=${detached ? '✓' : 'no'}, sequence=${seqOk ? '✓' : 'wrong order'}.`,
      };
    },
    'OBJ-H6': (env) => {
      const stateOk = env.ca.mfaAll && env.ca.blockLegacy && env.ca.restrictCidr;
      const t1 = loginHit(env, 'alex.kim', D.IP_CORP, true, 'modern', 'allowed');
      const t2 = loginHit(env, 'alex.kim', D.IP_UNKNOWN, true, 'modern', 'blocked');
      return {
        pass: stateOk && t1 && t2,
        msg: stateOk && t1 && t2
          ? 'Zero-trust sign-in proven both ways: compliant request from the corporate range with MFA → Allowed; the same identity from an unrecognized range → Blocked. That asymmetry IS conditional access.'
          : `${!stateOk ? 'Turn on all three switches (MFA for ALL, block legacy, restrict to corporate range). ' : ''}${!t1 || !t2 ? 'Record both tests with alex.kim and modern protocol: corporate IP + MFA → allowed; unrecognized IP → blocked.' : ''}`,
      };
    },
    'OBJ-H7': (env) => {
      const want = { 'dana.wells': 'disable', 'minnie.alvarez': 'disable', 'carlos.mendes': 'scope', 'alex.kim': 'keep', 'svc-reporting': 'keep' };
      const ok = Object.keys(want).every((k) => env.review['rv:' + k] === want[k]);
      return {
        pass: ok,
        msg: ok
          ? 'Recertification complete: leaver and dormant → disable; over-permissioned contractor → scope-down; active admin and business-needed service → keep (svc-reporting’s containment is the incident plan’s job, not the review’s).'
          : 'Expected: dana=disable, minnie=disable, carlos=scope-down, alex=keep, svc-reporting=keep. Do not confuse "compromised" with "unnecessary" — the review keeps it, the containment plan remediates it.',
      };
    },
    'OBJ-H8': (env) => {
      const ok = env.h8.q1 === 'M1032' && env.h8.q2 === 'M1018' && env.h8.q3 === 'M1047';
      return {
        pass: ok,
        msg: ok
          ? 'Mapped to the official catalogue: password-only sign-ins → M1032 Multi-factor Authentication; unmanaged lifecycle → M1018 User Account Management; silent privilege escalation → M1047 Audit.'
          : 'Use the official IDs: MFA = M1032; account lifecycle (offboarding, reviews) = M1018; audit/alerting = M1047.',
      };
    },
    'OBJ-H9': (env) => {
      const ok = env.h9 === 'residual-keys';
      return {
        pass: ok,
        msg: ok
          ? 'Exactly: interactive MFA never challenges a service presenting a static API key — secrets hygiene, rotation windows and short-lived/managed credentials remain essential even after perfect MFA coverage.'
          : 'Think about the svc-reporting path: when a job presents a key, there is no human to answer an MFA challenge. MFA protects INTERACTIVE access; programmatic access needs secret management.',
      };
    },
  };

  function validateObjective(id, env) {
    const v = VALIDATORS[id];
    if (!v) return { pass: false, msg: 'Validator not found.' };
    return v(env);
  }

  // --- scoring ----------------------------------------------------------------
  function objectivesFor(mode) {
    return mode === 'medium' ? D.OBJECTIVES_MEDIUM : D.OBJECTIVES_HARD;
  }

  function computeScore(s) {
    if (!s.mode) return { done: 0, totalObj: 0, quizCorrect: 0, quizTotal: 0, stars: 0, firstTryRate: 0, hints: 0 };
    const objs = objectivesFor(s.mode);
    const done = objs.filter((o) => s.objectiveState[o.id] && s.objectiveState[o.id].done).length;
    const quizTotal = s.mode === 'medium' ? 6 : 7;
    let quizCorrect = 0;
    if (s.quizSubmitted) {
      const bank = s.mode === 'medium' ? QUIZ_BANK.medium : QUIZ_BANK.hard;
      quizCorrect = Object.entries(s.quizAnswers).filter(([id, v]) => {
        const item = bank.find((q) => q.id === id);
        return item && item.correct === v;
      }).length;
    }
    const firstTry = objs.filter((o) => s.objectiveState[o.id] && s.objectiveState[o.id].done && s.objectiveState[o.id].firstTry).length;
    const hints = objs.reduce((acc, o) => acc + ((s.objectiveState[o.id] && s.objectiveState[o.id].hintsUsed) || 0), 0);
    const firstTryRate = done ? firstTry / done : 0;
    const stars = done === objs.length ? (firstTryRate >= 0.9 && hints <= 2 ? 3 : firstTryRate >= 0.65 || hints <= 5 ? 2 : 1) : 0;
    return { done, totalObj: objs.length, quizCorrect, quizTotal, stars, firstTryRate, hints };
  }

  // --- completion-report focus areas (evidence-derived) -------------------------
  const QUIZ_TOPIC = {
    qm1: 'the AAA pipeline order (identification → authentication → authorization → accounting)',
    qm2: 'MFA factor categories — true MFA combines DIFFERENT categories (know / have / are)',
    qm3: 'policy evaluation order — an explicit Deny always beats a matching Allow',
    qm4: 'authorization models — RBAC vs group-based (GBAC) vs discretionary (DAC)',
    qm5: 'the federation protocol trio — SAML vs OAuth 2.0 vs OpenID Connect',
    qm6: 'least privilege — narrow actions AND resources instead of wildcards',
    qh1: 'audit triage — baseline deviation (new network, odd hours) vs known noise',
    qh2: 'remediation of leaked programmatic credentials (rotate/revoke, vault)',
    qh3: 'explicit deny precedence over any matching Allow',
    qh4: 'federation troubleshooting — the SP validates assertions against the IdP certificate',
    qh5: 'identity lifecycle — disabling an account does not kill its API keys',
    qh6: 'secure management-plane access — bastion, SSH keys, source restrictions',
    qh7: 'zero trust — verify every request continuously, regardless of origin',
  };

  function computeFocusAreas(s) {
    if (!s.mode) return [];
    const objs = objectivesFor(s.mode);
    const areas = [];
    for (const o of objs) {
      const st = s.objectiveState[o.id];
      if (!st || !st.done) continue;
      if (!st.firstTry || st.hintsUsed > 0) {
        const bits = [];
        if (!st.firstTry) bits.push(`took ${st.attempts} check${st.attempts > 1 ? 's' : ''}`);
        if (st.hintsUsed > 0) bits.push(`used ${st.hintsUsed} hint${st.hintsUsed > 1 ? 's' : ''}`);
        areas.push({ label: `${o.id} — ${o.title}`, tip: `You ${bits.join(' and ')} here. Re-run this task in a fresh session and aim for a first-attempt pass; the underlying exam detail is ${o.coverage} (${o.anchor}).` });
      }
    }
    if (s.quizSubmitted) {
      const bank = s.mode === 'medium' ? QUIZ_BANK.medium : QUIZ_BANK.hard;
      for (const q of bank) {
        if (s.quizAnswers[q.id] !== undefined && s.quizAnswers[q.id] !== q.correct) {
          areas.push({ label: `Knowledge check — ${q.id.toUpperCase()}`, tip: `Revisit ${QUIZ_TOPIC[q.id] || q.q}; the explanation under your answer shows why your pick did not hold.` });
        }
      }
    } else {
      areas.push({ label: 'Knowledge check not submitted', tip: 'Open the Quiz from the mission bar and complete it — the exam-style items consolidate everything the objectives practiced.' });
    }
    if (areas.length === 0) {
      areas.push({ label: 'No weak spots detected', tip: 'First-attempt passes on every objective and a clean quiz. Stretch next: re-do the lab in the other difficulty mode, then read ATT&CK T1078.004 (Cloud Accounts) for how adversaries abuse cloud identities.' });
    }
    return areas;
  }

  return {
    globMatch, ipInCidr, parsePolicy, evaluatePolicies, loginVerdict,
    validateObjective, objectivesFor, computeScore, computeFocusAreas,
  };
})();
