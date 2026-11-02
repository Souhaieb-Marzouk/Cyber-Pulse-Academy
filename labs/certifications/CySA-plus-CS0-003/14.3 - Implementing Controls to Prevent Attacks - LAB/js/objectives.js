/**
 * objectives.js — Validation + coverage engine for the CySA+ 14.3 lab (static port).
 * ---------------------------------------------------------------------------
 * 1:1 port of the original framework lab's src/lib/lab/cysa143/logic.ts.
 * Every objective is machine-checked against environment state (F2). TypeScript
 * types were stripped; every rule, string and threshold is identical.
 */

/* ================================ STATE ================================ */

const LAB_VERSION = 1;
const STORAGE_KEY = 'cysa143-lab-v1';

const MEDIUM_IDS = [
  'OBJ-M1', 'OBJ-M2', 'OBJ-M3', 'OBJ-M4', 'OBJ-M5', 'OBJ-M6',
  'OBJ-M7', 'OBJ-M8', 'OBJ-M9', 'OBJ-M10', 'OBJ-M11', 'OBJ-M12',
];
const HARD_IDS = ['OBJ-H1', 'OBJ-H2', 'OBJ-H3', 'OBJ-H4', 'OBJ-H5', 'OBJ-H6', 'OBJ-H7', 'OBJ-H8', 'OBJ-H9'];

function freshEnv() {
  return {
    focusedClass: 'malware',
    selected: {},
    estate: Object.assign({}, ESTATE_INITIAL),
    scanRun: 0,
    flagged: [],
    matched: {},
    mfaMid: '',
    variantApp: {},
    variantCrypto: {},
    dnsSource: '',
    worstClass: '',
    residual: '',
    incidents: [],
    claims: {},
    phases: {},
    verify: {},
    budget: [],
    budgetWhy: '',
    crosswalk: {},
    signRisk: '',
    signVerify: '',
    signMid: '',
  };
}

function freshState(mode) {
  const objectives = {};
  for (const o of mode === 'medium' ? MEDIUM_IDS : HARD_IDS) {
    objectives[o] = { attempts: 0, hintsUsed: 0, done: false, result: null };
  }
  return {
    version: LAB_VERSION,
    mode: mode,
    section: 'briefing',
    deskTab: 'register',
    objectives: objectives,
    quizAnswers: {},
    env: freshEnv(),
    completed: false,
    startedAt: Date.now(),
  };
}

function objectiveIds(mode) {
  return mode === 'medium' ? MEDIUM_IDS : HARD_IDS;
}

function sanitize(raw) {
  try {
    if (!raw || typeof raw !== 'object') return null;
    const s = raw;
    if (s.version !== LAB_VERSION || (s.mode !== 'medium' && s.mode !== 'hard')) return null;
    const base = freshState(s.mode);
    const merged = Object.assign({}, base, s, {
      env: Object.assign({}, base.env, s.env || {}),
      objectives: Object.assign({}, base.objectives),
      quizAnswers: s.quizAnswers || {},
    });
    // Only keep objectives valid for this mode
    for (const id of objectiveIds(s.mode)) {
      const o = s.objectives && s.objectives[id];
      if (o) merged.objectives[id] = { attempts: o.attempts || 0, hintsUsed: o.hintsUsed || 0, done: !!o.done, result: o.result || null };
    }
    return merged;
  } catch (e) {
    return null;
  }
}

/* ================================ COVERAGE ENGINE ================================ */

function classCoverage(classId, estate) {
  const cls = ATTACK_CLASSES.find(function (c) { return c.id === classId; });
  if (!cls) return { pct: 0, have: [], missing: [] };
  const denom = cls.primary.length + 0.5 * cls.acceptable.length;
  let num = 0;
  const have = [];
  const missing = [];
  for (const id of cls.primary) {
    if (estate[id]) {
      num += 1;
      have.push(id);
    } else missing.push(id);
  }
  for (const id of cls.acceptable) if (estate[id]) num += 0.5;
  return { pct: Math.round((num / denom) * 100), have: have, missing: missing };
}

function allCoverage(estate) {
  const out = {};
  for (const c of ATTACK_CLASSES) out[c.id] = classCoverage(c.id, estate);
  return out;
}

function worstClassOf(estate) {
  let worst = ATTACK_CLASSES[0].id;
  let worstPct = 101;
  for (const c of ATTACK_CLASSES) {
    const pct = classCoverage(c.id, estate).pct;
    if (pct < worstPct) {
      worstPct = pct;
      worst = c.id;
    }
  }
  return worst;
}

/* Mapping completeness grid: does the student's mapping touch each family for each class? */
function mappingGrid(selected) {
  const out = {};
  for (const cls of ATTACK_CLASSES) {
    const sel = selected[cls.id] || [];
    const row = {};
    for (const fam of FAMILIES) {
      row[fam] = sel.some(function (id) {
        const ctl = CONTROLS.find(function (c) { return c.id === id; });
        return ctl && ctl.family === fam;
      });
    }
    out[cls.id] = row;
  }
  return out;
}

function classMappingIssues(classId, selected) {
  const cls = ATTACK_CLASSES.find(function (c) { return c.id === classId; });
  if (!cls) return { missing: [], wrong: [] };
  const missing = cls.primary.filter(function (id) { return !selected.includes(id); });
  // A control "belongs" on a class row only if it is in the class's primary set
  // (full credit) or acceptable set (partial credit). Anything else the student
  // marked is an over-map — false comfort — and must be rejected, matching the
  // objective contract "every defending control, none that don't belong".
  const wrong = selected.filter(function (id) { return !cls.primary.includes(id) && !cls.acceptable.includes(id); });
  return { missing: missing, wrong: wrong };
}

/* ================================ VALIDATION ================================ */

const nameOf = function (id) {
  const c = CONTROLS.find(function (x) { return x.id === id; });
  return c ? c.name : id;
};

function fail(title, body) {
  return { pass: false, title: title, body: body, ts: Date.now() };
}
function pass(title, body) {
  return { pass: true, title: title, body: body, ts: Date.now() };
}

function mappingCheck(classId, selected) {
  const issues = classMappingIssues(classId, selected);
  const bits = [];
  if (issues.missing.length) bits.push('missing: ' + issues.missing.map(nameOf).join(', '));
  if (issues.wrong.length) bits.push('doesn’t belong: ' + issues.wrong.map(nameOf).join(', '));
  return { ok: issues.missing.length === 0 && issues.wrong.length === 0, detail: bits.join(' · ') || 'checklist complete, no red flags' };
}

function checkObjective(id, env, mode) {
  switch (id) {
    /* ---------- MEDIUM ---------- */
    case 'OBJ-M1': {
      const wrong = ATTACK_CLASSES.filter(function (c) { return env.matched[c.id] !== c.id; });
      if (wrong.length === 0)
        return pass(
          'Register reconciled',
          'You can now name and define all eight CS0-003 attack classes — the row headers of every checklist you will ever build. Next: map the first checklist.'
        );
      const names = wrong.map(function (c) { return c.name; }).join(', ');
      return fail('Match-up incomplete', wrong.length + ' of 8 definitions misplaced (' + names + '). Re-read the attack cards in the Register — the variants on each card mirror its definition.');
    }
    case 'OBJ-M2': {
      const check = mappingCheck('malware', env.selected['malware'] || []);
      if (check.ok)
        return pass(
          'Malware checklist verified',
          'Patching (M1051) removes the delivery flaws, allowlisting (M1038) stops unknown code from running, code signing (M1045) rejects untrusted binaries, and AV/EDR (M1049) catches what gets through. Backups (M1053) limit impact but never prevent infection — that distinction is exam gold.'
        );
      return fail('Malware checklist has gaps', 'Malware & Ransomware — ' + check.detail + '. Think: prevention of execution (allowlist/signing), removal of flaws (patching), detection (EDR).');
    }
    case 'OBJ-M3': {
      const midOk = /^m?-?1032$/i.test(env.mfaMid.trim());
      const check = mappingCheck('password', env.selected['password'] || []);
      if (check.ok && midOk)
        return pass(
          'Credential checklist verified',
          'MFA (M1032) breaks password replay, policy (M1027) shrinks the guessable space, lockout (M1036) throttles brute force, and credential protection (M1043) blocks pass-the-hash. That’s the full answer to T1110-style attacks.'
        );
      if (!check.ok) return fail('Credential checklist has gaps', 'Password & Credential Attacks — ' + check.detail + '. Look in the Identity family.');
      return fail('M-ID mismatch', 'The MITRE mitigation ID for Multi-Factor Authentication is M1032 — enter it in the M-ID field on the checklist panel.');
    }
    case 'OBJ-M4': {
      const drillOk = APP_DRILL.variants.every(function (v) { return env.variantApp[v.id] === v.answer; });
      const check = mappingCheck('application', env.selected['application'] || []);
      if (check.ok && drillOk)
        return pass(
          'Application drill + checklist verified',
          'Each variant has its own fix: injection → parameterized queries, hostile input → validation, memory corruption → exploit protection (M1050), plus a WAF as the compensating layer. Mapping at variant level is what makes the checklist actionable.'
        );
      if (!check.ok) return fail('Application checklist has gaps', 'Application Attacks — ' + check.detail + '. Do not include output encoding — that is the XSS fix, not the SQLi fix.');
      return fail('Variant drill incomplete', 'Each application variant needs its specific control. SQLi → prepared statements; command injection → input validation; heap overflow → exploit protection.');
    }
    case 'OBJ-M5': {
      const check = mappingCheck('web', env.selected['web'] || []);
      if (check.ok)
        return pass(
          'Web checklist verified',
          'Output encoding + CSP neutralizes XSS, anti-CSRF tokens (with SameSite) kill forged requests, the WAF filters the remainder, and patching keeps the browser itself off the exploit menu. Client-side attacks get client-and-server answers.'
        );
      return fail('Web checklist has gaps', 'Web Client & Session Attacks — ' + check.detail + '. Parameterized queries do nothing for XSS — that is a server-side SQLi fix.');
    }
    case 'OBJ-M6': {
      const drillOk = CRYPTO_DRILL.variants.every(function (v) { return env.variantCrypto[v.id] === v.answer; });
      const check = mappingCheck('crypto', env.selected['crypto'] || []);
      if (check.ok && drillOk)
        return pass(
          'Crypto drill + checklist verified',
          'Downgrades die when legacy TLS is disabled (M1054), stale keys die under rotation/HSM management, interception dies under TLS in transit (M1041). And note the trap: encryption at rest protects stolen media — it does nothing for a broken cipher config.'
        );
      if (!check.ok) return fail('Crypto checklist has gaps', 'Cryptographic Attacks — ' + check.detail + '.');
      return fail('Variant drill incomplete', 'Pair each crypto variant: downgrades → strong config; stale keys → key management; interception → TLS in transit.');
    }
    case 'OBJ-M7': {
      const check = mappingCheck('wireless', env.selected['wireless'] || []);
      if (check.ok)
        return pass(
          'Wireless checklist verified',
          'WPA3-Enterprise/802.1X replaces the shared passphrase with per-user identity, WIDS spots the evil twin, and disabling WPS removes a brute-forceable side door. NAC adds device screening as partial credit.'
        );
      return fail('Wireless checklist has gaps', 'Wireless Attacks — ' + check.detail + '. Application-security controls cannot hear a rogue access point.');
    }
    case 'OBJ-M8': {
      const check = mappingCheck('protocol', env.selected['protocol'] || []);
      const dnsOk = env.dnsSource === DNS_SOURCE_ANSWER;
      if (check.ok && dnsOk)
        return pass(
          'Protocol checklist + detection verified',
          'Filtering (M1037) constrains what DNS and email may carry, DMARC/SPF/DKIM stop spoofing, and disabling SMBv1 (M1042) removes the legacy foothold. And your detection instinct is right: resolver logs expose tunneling before any host alarm does.'
        );
      if (!check.ok) return fail('Protocol checklist has gaps', 'Protocol Abuse — ' + check.detail + '.');
      return fail('Wrong data source', 'DNS tunneling is invisible to USB histories and CPU graphs. It is loud in DNS resolver telemetry: TXT floods, NXDOMAIN spikes, long subdomains.');
    }
    case 'OBJ-M9': {
      const check = mappingCheck('infrastructure', env.selected['infrastructure'] || []);
      if (check.ok)
        return pass(
          'Infrastructure checklist verified',
          'Segmentation (M1030) contains lateral movement, a true blocking IPS (M1031) stops exploit traffic on the wire, rate limiting absorbs floods, and NAC screens new devices. Fabric attacks get fabric answers.'
        );
      return fail('Infrastructure checklist has gaps', 'Network & Infrastructure Attacks — ' + check.detail + '.');
    }
    case 'OBJ-M10': {
      const worst = worstClassOf(env.estate);
      const pct = classCoverage(worst, env.estate).pct;
      const worstCls = ATTACK_CLASSES.find(function (c) { return c.id === worst; });
      const worstName = worstCls ? worstCls.name : worst;
      if (env.scanRun < 1) return fail('Run the scan first', 'Open the Estate tab and press Run Coverage Scan before naming the worst class.');
      if (env.worstClass === worst)
        return pass(
          'Gap identified',
          'Coverage scan verdict: ' + worstName + ' at ' + pct + '% — the estate deploys nothing from its prevention checklist. This is the checklist method doing its job: the "obvious shortfall" becomes a number.'
        );
      return fail('Not the worst class', 'Re-check the bars: the lowest coverage currently belongs to ' + worstName + ' at ' + pct + '%. Coverage = deployed controls ÷ that class\'s checklist.');
    }
    case 'OBJ-M11': {
      const enabled = ['input-validation', 'param-queries', 'waf'].filter(function (c) { return env.estate[c]; });
      const appPct = classCoverage('application', env.estate).pct;
      if (enabled.length === 3 && env.scanRun >= 2 && appPct >= 75)
        return pass(
          'Remediation verified',
          'Application coverage rose to ' + appPct + '%: input validation and parameterized queries fix the root cause, the WAF (M1021, compensating) filters what the code still misses — then the re-scan proves it. Root cause first, compensating layer second, always verify.'
        );
      if (enabled.length < 3) return fail('Remediation incomplete', 'Enable the three missing Application-attack controls in the Estate (' + (3 - enabled.length) + ' left). Root cause first: input validation + parameterized queries, then the WAF.');
      return fail('Re-scan to verify', 'The toggles are set — now press Run Coverage Scan again. A remediation is not a remediation until it is verified (M1047 audit mindset).');
    }
    case 'OBJ-M12': {
      if (env.residual === RESIDUAL_ANSWER)
        return pass(
          'Residual risk understood',
          'Exactly. Controls misconfigure and decay (you just met an MFA exception group in spirit), and attackers chain classes. Defense in depth is a property of LAYERS plus VERIFICATION — the checklist is a living document, not a one-time compliance art.'
        );
      return fail('Reconsider the statement', 'Look for the statement that combines two ideas: controls can silently fail or decay, AND attackers combine techniques. "Risk eliminated" is never an audit conclusion.');
    }

    /* ---------- HARD ---------- */
    case 'OBJ-H1': {
      const ok = INCIDENT_ANSWER.every(function (i) { return env.incidents.includes(i); }) && env.incidents.length === 3;
      if (ok)
        return pass(
          'Triage confirmed',
          'The VPN stuffing with successful logins, live SQLi probing of the WAF-less portal, and the DNS-tunneling beacon are confirmed hostile activity. The spooler bug, the expired staging cert, and the single blocked email are noise — flagging those would have sent the remediation budget in the wrong direction.'
        );
      return fail('Triage rejected', 'You flagged ' + env.incidents.length + ' brief(s). Ask of each: is there confirmed hostile ACTION (successes, live exploitation, active C2)? A firmware bug, an expired cert, and a blocked one-off email are not attacks.');
    }
    case 'OBJ-H2': {
      const issues = ATTACK_CLASSES
        .map(function (c) {
          const r = classMappingIssues(c.id, env.selected[c.id] || []);
          return { cls: c, missing: r.missing, wrong: r.wrong };
        })
        .filter(function (r) { return r.missing.length || r.wrong.length; });
      if (issues.length === 0)
        return pass(
          'Full defense checklist complete',
          'All eight classes mapped with full primary sets and zero red flags — the complete Lesson 14.3 deliverable. This matrix is the checklist the client can now audit against, line by line.'
        );
      const lines = issues.slice(0, 4).map(function (r) {
        const parts = r.missing.map(nameOf).map(function (n) { return 'missing ' + n; })
          .concat(r.wrong.map(nameOf).map(function (n) { return n + ' doesn’t belong'; }));
        return r.cls.short + ' — ' + parts.join(', ');
      });
      return fail('Mapping issues remain', issues.length + ' class(es) need work. ' + lines.join(' · ') + (issues.length > 4 ? ' · …' : ''));
    }
    case 'OBJ-H3': {
      const allOk = CLAIMS.every(function (c) { return env.claims[c.id] === c.answer; });
      if (allOk)
        return pass(
          'Claims audited',
          'The two rejects were the overstatements: code signing proves provenance, not safety (certs get stolen — T1553.002), and DLP limits exfiltration — it never touches ransomware’s encryption step. Accepting overstated guarantees is how phantom controls enter an estate.'
        );
      const wrong = CLAIMS.filter(function (c) { return env.claims[c.id] !== c.answer; }).length;
      return fail('Claims rejected incorrectly', wrong + ' claim(s) misjudged. Test each guarantee: does the control claim to PREVENT the attack, or only limit an impact? And can its guarantee be defeated upstream?');
    }
    case 'OBJ-H4': {
      const allOk = PHASE_ITEMS.every(function (p) { return env.phases[p.id] === p.answer; });
      if (allOk)
        return pass(
          'Sequencing approved',
          'Correct: MFA cleanup, IPS blocking and SMBv1 removal are configuration-only and stop active bleeding now; the WAF and the code fix need procurement/release cycles; segmentation is an architecture program. Sequencing is where mitigation planning becomes reality.'
        );
      const wrong = PHASE_ITEMS.filter(function (p) { return env.phases[p.id] !== p.answer; }).map(function (p) { return p.id; }).length;
      return fail('Sequencing rejected', wrong + ' work order(s) misplaced. Heuristic: what is configuration-only and stops an ACTIVE attack goes immediate; code and procurement are 30-day; multi-quarter architecture is 90-day.');
    }
    case 'OBJ-H5': {
      const allOk = VERIFY_CONTROLS.every(function (c) { return env.verify[c] === VERIFY_ANSWER[c]; });
      if (allOk)
        return pass(
          'Verification design approved',
          'Each control now has falsifiable evidence: if MFA enforcement broke tomorrow, auth logs would show challenge-less logins; if the WAF failed open, block counts go to zero. A control without a verification signal is a gap wearing a green badge.'
        );
      const wrong = VERIFY_CONTROLS.filter(function (c) { return env.verify[c] !== VERIFY_ANSWER[c]; }).length;
      return fail('Verification mapping rejected', wrong + ' mapping(s) wrong. Match each control to the data source that would visibly CHANGE if it silently failed. A CPU dashboard changes for a thousand reasons — that is why it proves nothing.');
    }
    case 'OBJ-H6': {
      const setOk = BUDGET_ANSWER.every(function (b) { return env.budget.includes(b); }) && env.budget.length === 3;
      const whyOk = env.budgetWhy === BUDGET_RATIONALE_ANSWER;
      if (setOk && whyOk)
        return pass(
          'Budget triage approved',
          'Input validation (application), password policy (credential), DNS filtering (protocol) — one root-cause control per actively-attacked class. The WAF would have been a fine second layer, but with three slots you buy breadth and root causes first. DLP and segmentation protect classes that are not under active attack.'
        );
      if (!setOk) {
        const active = BUDGET_ACTIVE_CLASSES
          .map(function (a) {
            const c = ATTACK_CLASSES.find(function (x) { return x.id === a; });
            return c ? c.short : a;
          })
          .join(', ');
        return fail('Budget triage rejected', 'Pick exactly 3. The active classes are ' + active + '. Which three candidates cover them — and which of those are root-cause fixes rather than compensating layers?');
      }
      return fail('Rationale rejected', 'The set is right, the reasoning must match it: breadth-first coverage with root-cause fixes, not cheapest-three, not DLP-first.');
    }
    case 'OBJ-H7': {
      const ok = env.flagged.includes('mfa') && env.flagged.includes('nips') && env.flagged.length === 2;
      if (ok)
        return pass(
          'Phantom controls exposed',
          'MFA "enforced" — except for an All-Staff-Bypass group of 312 users. IPS "enabled" — but blocking disabled per change #4471. Both would have shown green on any checklist that trusts status badges. This is why verification (OBJ-H5) exists.'
        );
      return fail('Flagging rejected', 'You flagged ' + env.flagged.length + ' control(s); exactly two deployed controls are not functioning as intended. Read every config line of every ENABLED control: exceptions groups, modes, and pilot scopes. The DLP monitor-only pilot is approved and functioning — mode is not misconfiguration.');
    }
    case 'OBJ-H8': {
      const items = ['x1', 'x2', 'x3', 'x4', 'x5'];
      const answers = { x1: 'T1110.004', x2: 'T1190', x3: 'T1071.004', x4: 'T1557.002', x5: 'T1486' };
      const allOk = items.every(function (i) { return env.crosswalk[i] === answers[i]; });
      if (allOk)
        return pass(
          'Crosswalk verified',
          'T1110.004 credential stuffing, T1190 exploit public-facing app, T1071.004 DNS, T1557.002 ARP cache poisoning, T1486 data encrypted for impact. Speaking ATT&CK fluently lets your checklists interoperate with detection engineering and threat intel.'
        );
      const wrong = items.filter(function (i) { return env.crosswalk[i] !== answers[i]; }).length;
      return fail('Crosswalk rejected', wrong + ' mapping(s) wrong. Careful with sub-techniques: stuffing is .004 under T1110 — and T1566 (phishing) / T1040 (sniffing) are distractors, not answers here.');
    }
    case 'OBJ-H9': {
      const midOk = /^m?-?1030$/i.test(env.signMid.trim());
      const allOk = env.signRisk === RESIDUAL_ANSWER && env.signVerify === SIGNOFF_VERIFY_ANSWER && midOk;
      if (allOk)
        return pass(
          'Audit signed off',
          'The file is closed the way a professional closes it: residual risk stated honestly, a first verification that targets the control you just found broken (MFA auth logs), and M1030 — network segmentation — recalled from memory. You can explain, map, detect, mitigate and verify. That is mastery of Lesson 14.3.'
        );
      if (!midOk) return fail('Sign-off rejected', 'The MITRE mitigation ID for Network Segmentation is M1030 — a two-second recall, but it must be exact on a sign-off page.');
      if (env.signRisk !== RESIDUAL_ANSWER) return fail('Sign-off rejected', 'Pick the residual-risk statement that combines decaying controls with chained attacker techniques — never "risk eliminated".');
      return fail('Sign-off rejected', 'First verification should target the control you found broken in the Estate: pull the VPN auth logs and confirm zero exception-group logins.');
    }
    default:
      return fail('Unknown objective', 'No validation rule for this objective.');
  }
}

/* ================================ SCORING ================================ */

function quizQuestions(mode) {
  return QUIZ.filter(function (q) { return q.mode === mode; });
}

function computeScore(state) {
  const ids = objectiveIds(state.mode);
  let objPts = 0;
  let firstTry = 0;
  let hints = 0;
  let done = 0;
  for (const id of ids) {
    const o = state.objectives[id];
    if (!o) continue;
    hints += o.hintsUsed;
    if (o.done) {
      done++;
      objPts += o.attempts <= 1 ? 10 : 7;
      if (o.attempts <= 1) firstTry++;
    }
  }
  const qs = quizQuestions(state.mode);
  let quizCorrect = 0;
  for (const q of qs) if (state.quizAnswers[q.id] === q.answer) quizCorrect++;
  const quizPts = quizCorrect * 10;
  const hintPenalty = hints;
  const max = ids.length * 10 + qs.length * 10;
  const raw = Math.max(0, objPts + quizPts - hintPenalty);
  const pct = Math.round((raw / max) * 100);
  const stars = pct >= 90 ? 5 : pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 50 ? 2 : 1;
  return { objPts: objPts, quizPts: quizPts, hintPenalty: hintPenalty, score: raw, max: max, pct: pct, stars: stars, firstTry: firstTry, quizCorrect: quizCorrect, quizCount: qs.length, done: done };
}

function allObjectivesDone(state) {
  return objectiveIds(state.mode).every(function (id) { return state.objectives[id] && state.objectives[id].done; });
}

function quizComplete(state) {
  return quizQuestions(state.mode).every(function (q) { return state.quizAnswers[q.id] !== undefined; });
}
