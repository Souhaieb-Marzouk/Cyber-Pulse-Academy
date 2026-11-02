/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/objectives.js
   CHECK RESULTS validation engine. Pure functions:
     - validateObjective(id, env, answers)      → typed-answer objectives
     - validateStateObjective(id, env)          → environment-state objectives
   Answer rules are identical to the original lab (normalization, regexes,
   per-field feedback). Medium checks are tolerant; Hard checks are strict.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const SEQUENCE = ['isolate', 'quarantine', 'block', 'escalate'];

function norm(s) {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

function normPath(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[\\/]+/g, '\\');
}

function validateObjective(id, env, answers) {
  answers = answers || {};
  switch (id) {
    /* ------------------------------- MEDIUM ------------------------------- */
    case 'M1': {
      const v = norm(answers.conn);
      const pass = /^185\.199\.72\.44(:443)?$/.test(v);
      return {
        pass,
        feedback: pass
          ? 'Correct — 185.199.72.44:443, ESTABLISHED from 02:17. Every other row talks to internal 10.4.x.x infrastructure; this one leaves the building. A defender’s next question is always: which process owns that socket?'
          : 'Not the one. Look again at the Foreign Address column: everything points at internal 10.4.x.x hosts except one row with a public IP in state ESTABLISHED. Enter it as IP:port.',
      };
    }
    case 'M2': {
      const v = norm(answers.proc);
      const pass = /^svch0st\.exe$/.test(v);
      return {
        pass,
        feedback: pass
          ? 'Correct — svch0st.exe, with a zero. That is masquerading: the name mimics the legitimate svchost.exe, and its home is a user-writable Temp directory where system binaries never live. (MITRE calls this T1036.)'
          : 'Close, but read PID 8212 character by character — the image name mimics a Windows system binary with one swapped character, and its path should look impossible for a real system binary.',
      };
    }
    case 'M4': {
      const v = norm(answers.age);
      const pass = /^[1-4]$/.test(v);
      return {
        pass,
        feedback: pass
          ? 'Correct — 2 days old. Legitimate brands run domains for years (the real portal: 9+). A brand-token domain registered this week is phishing infrastructure until proven otherwise.'
          : 'Check the age badge on the WHOIS record — it is computed against the incident date (Nov 18). The answer is a single-digit number of days.',
      };
    }
    case 'M7': {
      const v = norm(answers.host);
      const pass = /^ws-eng-014$/.test(v);
      return {
        pass,
        feedback: pass
          ? 'Correct — WS-ENG-014, the same host that spawned the mimic process. That is correlation by hand: DNS telemetry + endpoint telemetry pointing at one machine. It also tells you the user likely clicked the phishing link.'
          : 'Search the DNS stream for "alderwood" and read the Client column of the matching rows — one workstation queried the lookalike domain twice.',
      };
    }
    /* -------------------------------- HARD -------------------------------- */
    case 'H2': {
      const proc = /^svch0st\.exe$/i.test((answers.proc ?? '').trim());
      const remote = /^185\.199\.72\.44:443$/.test(norm(answers.remote));
      const pid = (answers.pid ?? '').trim() === '8212';
      const path = /users\\j\.rivera\\appdata\\local\\temp\\svch0st\.exe$/.test(normPath(answers.path));
      const missing = [];
      if (!proc) missing.push('process name');
      if (!remote) missing.push('remote IP:port');
      if (!pid) missing.push('PID');
      if (!path) missing.push('binary path');
      return {
        pass: missing.length === 0,
        feedback:
          missing.length === 0
            ? 'Full tuple accepted: svch0st.exe · 185.199.72.44:443 · PID 8212 · C:\\Users\\j.rivera\\AppData\\Local\\Temp\\svch0st.exe. This is what a usable escalation note looks like — another analyst can act on it without redoing your work.'
            : `Rejected — incomplete or inaccurate tuple. Missing/incorrect: ${missing.join(', ')}. netstat -ano gives remote endpoint + PID; tasklist /v gives name + path.`,
      };
    }
    case 'H3': {
      const age = /^[1-3]$/.test(norm(answers.age));
      const privacy = /redacted|privacy|shield|proxy/i.test(answers.privacy ?? '');
      const verdict = /malicious|phish|hostile|bad/i.test(answers.verdict ?? '');
      const missing = [];
      if (!age) missing.push('age (days)');
      if (!privacy) missing.push('privacy indicator');
      if (!verdict) missing.push('verdict');
      return {
        pass: missing.length === 0,
        feedback:
          missing.length === 0
            ? 'Accepted: 2 days old · REDACTED FOR PRIVACY · malicious (phishing). Fresh registration + hidden registrant + brand-token anatomy is the canonical lookalike pattern. Near-misses like "suspicious" were rejected on purpose: dispositions need commitment.'
            : `Rejected — ${missing.join(', ')} missing or not specific. The record literally displays the privacy indicator; the verdict must name what the domain is.`,
      };
    }
    case 'H5': {
      const feed = /^hashvault(essentials)?$/.test(norm(answers.feed));
      const family = /^fleetloader$/.test(norm(answers.family));
      return {
        pass: feed && family,
        feedback:
          feed && family
            ? 'Accepted — HashVault Essentials, family FleetLoader. The note says three partner SOCs reported the same hash: that is the value of shared blocklists, and also their limit — someone had to be victimized first.'
            : 'Rejected — run sha256sum /evidence/svch0st.exe, look the digest up in the BLOCKLIST instrument, and copy the Feed and Category fields exactly.',
      };
    }
    default:
      return { pass: false, feedback: 'No validator for this objective.' };
  }
}

/* State-based objectives: validated purely from environment state. */
function validateStateObjective(id, env) {
  switch (id) {
    case 'M3':
      return {
        pass: env.edr.detectionTypeAnswer === 'behavioral',
        feedback:
          'Behavioral detection. No signature existed for this binary — the engine flagged the pattern: mimic name, Temp path, browser parent, sudden TLS egress. Behavioral engines catch novel threats but need analyst judgment because they also cry wolf more often.',
      };
    case 'M5':
      return {
        pass: env.drills.blockVerdict === 'c2' && env.blocklist.lastLookup?.value === '185.199.72.44',
        feedback:
          'CobaltWatch C2 Feed: command-and-control, HIGH confidence, first seen 9 days ago, still active at 02:51. One lookup replaced hours of infrastructure research — that is what reputation feeds are for. And note the flip side: a clean result would not have proven innocence.',
      };
    case 'M6': {
      const want = ['auth_fail_burst', 'auth_success_after'].sort().join('|');
      const got = [...env.siem.correlationSelected].sort().join('|');
      const pass = want === got && env.siem.correlationSelected.length === 2;
      return {
        pass,
        feedback:
          'Exactly: a failed-login burst (×47, 02:20–02:34) plus a subsequent success (02:34:52). Correlation rules turn dozens of raw rows into one prioritized alert — and the analyst’s job is to decompose them again before trusting them.',
      };
    }
    case 'M8': {
      const d = env.drills.toolMatch;
      const pass = d.a === 'cli' && d.b === 'registry' && d.c === 'siem';
      return {
        pass,
        feedback:
          'Tool thinking unlocked: "which process owns this?" → command line. "who owns this domain?" → registry. "fuse 40,000 events?" → SIEM. The other two families slot in just as cleanly: EPP/EDR for endpoint verdicts and actions, blocklists for reputation.',
      };
    }
    case 'M9':
      return {
        pass: env.edr.quarantined && env.edr.isolated,
        feedback:
          'Contained on the endpoint: the binary is in quarantine and WS-ENG-014 is off the network (the EDR sensor stays connected, so you keep visibility). Isolate-first is common practice — it cuts the C2 channel before anything else can happen.',
      };
    case 'M10':
      return {
        pass: env.siem.dispositions['A-1047'] === 'tp' && env.siem.dispositions['A-1055'] === 'fp',
        feedback:
          'A-1047 escalated as a true positive; A-1055 closed as a false positive (approved scan, change CHG-2214). That is the daily rhythm of a SOC: most alerts die young, and the ones that do not get everything you have.',
      };
    case 'M12': {
      const d = env.drills.siemDrill;
      const pass = d.a === 'aggregation' && d.b === 'correlation' && d.c === 'dashboard';
      return {
        pass,
        feedback:
          'Aggregation collects, correlation connects, dashboards communicate. Every SIEM demo you will ever see is those three verbs wearing different clothes.',
      };
    }
    case 'M11':
      return {
        pass:
          env.blocklist.hashConfirmed &&
          env.blocklist.lastLookup?.type === 'hash' &&
          env.blocklist.lastLookup.value === C2_HASH,
        feedback:
          'Fingerprint matched: sha256sum on the host, HashVault Essentials on the feed — FleetLoader, first seen Nov 10, shared by three partner SOCs. That is the verify-and-enrich chain of the lesson working end to end: CLI produces the artifact, the blocklist gives it a name, and the case file gets a provable IOC.',
      };
    case 'H1': {
      const d = env.siem.dispositions;
      const pass =
        d['A-1047'] === 'tp' &&
        d['A-1051'] === 'tp' &&
        d['A-1061'] === 'tp' &&
        d['A-1042'] === 'fp' &&
        d['A-1055'] === 'fp' &&
        d['A-1058'] === 'fp';
      return {
        pass,
        feedback:
          'Perfect queue disposition: A-1047/A-1051/A-1061 escalated (process chain, beaconing, lookalike DNS — one coherent intrusion), A-1042/A-1055/A-1058 closed with documented rationales. Three red herrings correctly ignored is as valuable as one true positive found.',
      };
    }
    case 'H4':
      return {
        pass:
          env.siem.causeAnswer === 'svc_retry' && env.siem.dispositions['A-1042'] === 'fp',
        feedback:
          'Root-caused and closed: the backup server’s nightly job retried an expired svc_backup password 47 times until the 02:34 credential rotation succeeded. One user, one internal source, rotation-timed success — spraying looks nothing like this. This is why you read the events behind a rule before trusting its label.',
      };
    case 'H6': {
      const log = env.responseLog;
      const pass =
        log.length >= 4 && SEQUENCE.every((step, i) => log[i] === step);
      return {
        pass,
        feedback:
          pass
            ? 'Sequence accepted: isolate (cut C2) → quarantine (remove implant) → block (protect the other 1,199 hosts) → escalate (human expertise + deeper hunt). defenders who sequence well contain fast and lose little.'
            : 'Sequence rejected. Practical order: first stop the implant’s communications (isolate host), then remove the binary (quarantine), then protect everyone else (perimeter block), then bring in the humans (escalate).',
      };
    }
    case 'H7':
      return {
        pass: env.siem.tuningChoice === 'b',
        feedback:
          'Rule B: new registration (<30 days) AND brand token. It encodes the actual attacker pattern, so it stays quiet during normal business while catching the campaign. Rule A drowns you, Rule C breaks the business, Rule D is evaded by any hyphen placement.',
      };
    case 'H8':
      return {
        pass: env.siem.residualChoice === 'a',
        feedback:
          'Right: the file was never seen before, so no signature existed — and unknown families remain invisible until someone, somewhere, is victim zero. Residual risk means hunting sibling binaries, watching the phishing path (mail → browser → Temp), and not declaring victory when one hash dies.',
      };
    case 'H9': {
      const d = env.drills.toolFit;
      const pass =
        d.s1 === 'cli' && d.s2 === 'blocklist' && d.s3 === 'registry' && d.s4 === 'siem' && d.s5 === 'sandbox';
      return {
        pass,
        feedback:
          'Full inventory: CLI for live endpoint questions, blocklists for reputation, registries for ownership, SIEM for fusion at scale — and sandbox detonation (one of the lesson’s "many others") for safely watching an unknown binary run. OSINT covers the rest of the public-source toolkit.',
      };
    }
    case 'H10': {
      const want = 'dns|phishconn|spawn|beacon';
      const got = env.drills.timeline.join('|');
      const pass = want === got;
      return {
        pass,
        feedback:
          'Timeline locked: 02:14:19 DNS query → 02:14:22 HTTPS to the phishing site → 02:17:47 process spawn (EDR process event) → 02:17:48 first C2 beacon, repeating every ~15 min through 03:03. Note the nuance: the EDR ALERT stamped 02:17:51 fired three seconds after the beacon connection — alert time is detection time, not event time. Reconstructing order across data sources is what turns isolated alerts into an incident narrative.',
      };
    }
    default:
      return { pass: false, feedback: 'No validator for this objective.' };
  }
}
