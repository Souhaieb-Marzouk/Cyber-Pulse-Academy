/* ─────────────────────────────────────────────────────────────────────────────
 * engine.js — replay engine, posture score, scoring/star math, quiz stats and
 * completion focus areas. Ported 1:1 from src/lib/lab/engine.ts.
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── replay engine ──────────────────────────────────────────────────────────
 * Verdict is a pure function of current environment state. */

function computeRun(id, s) {
  var deployed = s.deployed;
  var sgFixed = _sgOpenClosed(s);
  var lines = [];
  var now = Date.now();
  function stamp() {
    return new Date(now).toISOString().slice(11, 19);
  }
  function result(verdict, deck) {
    lines.push(stamp() + " verdict → " + verdict.toUpperCase());
    return { id: id, verdict: verdict, deck: deck, log: lines, ts: now };
  }

  if (id === "sqli") {
    lines.push(stamp() + " replay/SQLi → GET /bookings/search?q=' OR 1=1 --");
    lines.push(stamp() + " edge/lb-01 → forward to app tier (TLS terminated)");
    var waf = deployed["waf"];
    if (waf && waf.mode === "block") {
      lines.push(stamp() + " waf → signature SQLI-942-BLOCK matched · action=BLOCK");
      return result("blocked", "edge");
    }
    if (waf && waf.mode === "detect")
      lines.push(stamp() + " waf → signature SQLI-942-BLOCK matched · action=LOG");
    var ips = deployed["ips"];
    if (ips && ips.mode === "block") {
      lines.push(stamp() + " ips → pattern match on flow · action=DROP");
      return result("blocked", "network");
    }
    if (ips && ips.mode === "detect")
      lines.push(stamp() + " ips → pattern match on flow · action=ALERT");
    if (deployed["siem"])
      lines.push(stamp() + " siem → alert raised: “SQLi signature observed on lb-01”");
    lines.push(stamp() + " app/booking-api → query executed · rows leaked");
    var v1 =
      (waf && waf.mode === "detect") || (ips && ips.mode === "detect") || deployed["siem"]
        ? "detected"
        : "passed";
    return result(v1, null);
  }

  if (id === "ssh") {
    lines.push(stamp() + " replay/SSH → 1200 auth attempts vs 10.0.1.0/24:22");
    if (sgFixed) {
      lines.push(stamp() + " sg-app → no rule permits source · flow DROPPED");
      return result("blocked", "network");
    }
    lines.push(stamp() + " sg-app → rule r1 (0.0.0.0/0 tcp/22) matched · flow ALLOWED");
    var ips2 = deployed["ips"];
    if (ips2 && ips2.mode === "block") {
      lines.push(stamp() + " ips → ssh-bruteforce signature · action=DROP");
      return result("blocked", "network");
    }
    if (ips2 && ips2.mode === "detect")
      lines.push(stamp() + " ips → ssh-bruteforce signature · action=ALERT");
    if (deployed["honeypot"])
      lines.push(stamp() + " honeypot → decoy touched (near-zero FP confirmation signal)");
    if (deployed["siem"])
      lines.push(stamp() + " siem → alert raised: “SSH brute force burst”");
    lines.push(stamp() + " app-vm-01/sshd → 3 weak passwords accepted");
    var v2 = (ips2 && ips2.mode === "detect") || deployed["siem"] ? "detected" : "passed";
    return result(v2, null);
  }

  if (id === "creds") {
    lines.push(stamp() + " replay/creds → 900 breached passwords vs admin-02");
    lines.push(stamp() + " edge/lb-01 → console login page · forwarded");
    var mfa = deployed["mfa"];
    if (mfa) {
      lines.push(stamp() + " iam → MFA challenge required · attacker holds password only");
      lines.push(stamp() + " iam → 900/900 challenges failed");
      return result("blocked", "identity");
    }
    if (deployed["siem"])
      lines.push(stamp() + " siem → alert raised: “credential-stuffing burst on console”");
    lines.push(stamp() + " iam → admin-02 session ESTABLISHED (password only)");
    var v3 = deployed["siem"] ? "detected" : "passed";
    return result(v3, null);
  }

  // exfil
  lines.push(stamp() + " replay/exfil → bulk export HR-PII via file-share public links");
  lines.push(stamp() + " edge/lb-01 → HTTPS to known CDN-like service · looks normal");
  lines.push(stamp() + " network/sg → rule r2 (443) matched · flow ALLOWED");
  lines.push(stamp() + " compute/edr → no malware binary involved · silent");
  var dlp = deployed["dlp"];
  if (dlp && dlp.mode === "block") {
    lines.push(stamp() + " dlp → PII pattern match (content-aware) · action=BLOCK export");
    return result("blocked", "data");
  }
  if (dlp && dlp.mode === "monitor")
    lines.push(stamp() + " dlp → PII pattern match · action=ALERT (monitor mode)");
  if (deployed["siem"])
    lines.push(stamp() + " siem → alert raised: “bulk PII export via share links”");
  lines.push(stamp() + " file-share → 4.2 GB left the tenancy · 'authorized'");
  var v4 = (dlp && dlp.mode === "monitor") || deployed["siem"] ? "detected" : "passed";
  return result(v4, null);
}

/* ─── posture score ─────────────────────────────────────────────────────────── */

var GAP_CHECKS = [
  function (s) {
    return _sgOpenClosed(s);
  },
  function (s) {
    return !!s.deployed["waf"];
  },
  function (s) {
    return !!s.deployed["ips"];
  },
  function (s) {
    return !!s.deployed["edr"] && (s.deployed["edr"].targets || []).indexOf("app-vm-01") > -1;
  },
  function (s) {
    return !!s.deployed["patch"];
  },
  function (s) {
    return !!s.deployed["kms"];
  },
  function (s) {
    return !!s.deployed["backups"];
  },
  function (s) {
    return !!s.deployed["dlp"];
  },
  function (s) {
    return !!s.deployed["mfa"];
  },
  function (s) {
    return !!s.deployed["siem"];
  },
];

var POSTURE_BASE = 42;

function postureScore(s) {
  var fixed = GAP_CHECKS.reduce(function (n, fn) {
    return n + (fn(s) ? 1 : 0);
  }, 0);
  return Math.round(POSTURE_BASE + fixed * 5.8);
}

/* ─── objectives / scoring helpers ──────────────────────────────────────────── */

function objectivesFor(mode) {
  return mode === "hard" ? OBJECTIVES_HARD : OBJECTIVES_MEDIUM;
}

function passedCount(s) {
  var objs = objectivesFor(s.mode);
  return objs.filter(function (o) {
    return s.results[o.id] && s.results[o.id].pass;
  }).length;
}

function hintPenalty(s) {
  var total = Object.keys(s.hintsUsed).reduce(function (a, k) {
    return a + s.hintsUsed[k];
  }, 0);
  return total * 0.4;
}

function retryPenalty(s) {
  var objs = objectivesFor(s.mode);
  var retries = objs.reduce(function (n, o) {
    var r = s.results[o.id];
    return n + (r && r.attempts > 1 ? r.attempts - 1 : 0);
  }, 0);
  return retries * 0.3;
}

function starRating(s) {
  var base = 5 - hintPenalty(s) - retryPenalty(s);
  return Math.max(1, Math.round(base * 2) / 2);
}

function quizStats(s) {
  var qs = s.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  var checked = qs.filter(function (q) {
    return s.quizChecked[q.id];
  });
  var correct = checked.filter(function (q) {
    return s.quizAnswers[q.id] === q.correct;
  }).length;
  return { total: qs.length, answered: checked.length, correct: correct };
}

/* ─── completion-report focus areas (audit fix QA-5 / requirement R8) ────────
 * Derived STRICTLY from the student's actual evidence: objective retries, hint
 * usage and wrong quiz answers. Never generic filler. */

function focusAreas(s) {
  var areas = [];
  var seen = {};
  function push(a) {
    if (!seen[a.topic] && areas.length < 5) {
      seen[a.topic] = true;
      areas.push(a);
    }
  }

  objectivesFor(s.mode).forEach(function (o) {
    var r = s.results[o.id];
    var study = LAB.OBJ_STUDY[o.id];
    if (!r || !r.pass || !study) return;
    var hints = s.hintsUsed[o.id] || 0;
    if (!r.firstAttempt && hints > 0) {
      push({
        topic: study.topic,
        evidence: "needed " + r.attempts + " attempts and " + hints + " hint" + (hints > 1 ? "s" : ""),
        action: study.action,
      });
    } else if (!r.firstAttempt) {
      push({ topic: study.topic, evidence: "needed " + r.attempts + " attempts", action: study.action });
    } else if (hints > 0) {
      push({
        topic: study.topic,
        evidence: "relied on " + hints + " hint" + (hints > 1 ? "s" : ""),
        action: study.action,
      });
    }
  });

  var qs = s.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  qs.forEach(function (q) {
    var study = LAB.QUIZ_STUDY[q.id];
    if (s.quizChecked[q.id] && s.quizAnswers[q.id] !== q.correct && study) {
      push({ topic: study.topic, evidence: "probe answer missed", action: study.action });
    }
  });

  return areas;
}
