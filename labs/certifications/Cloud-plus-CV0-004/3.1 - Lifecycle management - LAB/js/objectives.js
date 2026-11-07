// ORBIT static port — CHECK RESULTS validation engine (F2), scoring (F7).
// 1:1 port of the original src/lib/lab/store.ts validate() and scoring helpers:
// same sequences, same pass conditions, same failure messages, same penalties.
//
// Depends on: ORBIT.DATA (loaded first).
var ORBIT = window.ORBIT || {};
window.ORBIT = ORBIT;

ORBIT.ENGINE = (function () {
  "use strict";

  var D = ORBIT.DATA;

  // ---------- sequences (correct orders) ----------
  var SEQ_LIFECYCLE = ["provision", "operate", "maintain", "deprov"];
  var SEQ_DECOM = ["deps", "snap", "revoke", "del", "cmdb"];
  var SEQ_LAUNCH = ["template", "change", "staging", "canary", "rollout", "monitor", "drain", "closeout"];
  var SEQ_CUTOVER = ["build", "prove", "switch", "soak", "retire", "closeout"];
  var SEQ_BUCKET = ["quiesce", "verify", "snap", "revoke", "delete", "cmdb"];
  var SEQ_CONTAIN = ["cap", "isolate", "revoke", "reimage"];

  var MEDIUM_IDS = D.OBJECTIVES.MEDIUM.map(function (o) { return o.id; });
  var HARD_IDS = D.OBJECTIVES.HARD.map(function (o) { return o.id; });

  function idsFor(mode) {
    return mode === "HARD" ? HARD_IDS : MEDIUM_IDS;
  }

  function sameSet(a, b) {
    return a.length === b.length && a.slice().sort().join("|") === b.slice().sort().join("|");
  }
  function sameSeq(a, b) {
    return a.join("|") === b.join("|");
  }

  // ---------- validation ----------
  function FA(t) {
    return { pass: false, fail: t };
  }

  function validate(id, s) {
    switch (id) {
      case "M1":
        return sameSeq(s.lifecycleSeq, SEQ_LIFECYCLE)
          ? { pass: true, fail: "" }
          : FA("Not the lifecycle arc. The four phases run create → run/grow → care → retire; nothing is retired before it exists.");
      case "M2": {
        var want2 = {
          "web-prod-01": "ACTIVE", "green-test-01": "PROVISIONING", "hlcy-web-01": "RETIRED", "hlcy-lb": "ORPHANED",
        };
        var ok2 = Object.keys(want2).every(function (k) { return s.classified[k] === want2[k]; });
        return ok2 ? { pass: true, fail: "" } : FA("Some states are off. Re-read the dossier notes: mid-build (46%), healthy prod node, retired 2024, and an LB with no targets that still bills.");
      }
      case "M3":
        if (s.provision.method !== "iac")
          return FA("Console clicks cannot be replayed across three regions next month — and reviewers cannot read a click. Reconsider.");
        return s.provision.reasons.length >= 3
          ? { pass: true, fail: "" }
          : FA("IaC is right, but justify it: at least three of the four reasons must be ticked.");
      case "M4":
        return sameSet(s.flaggedDrift, ["web-prod-04"])
          ? { pass: true, fail: "" }
          : FA(s.flaggedDrift.length === 0
            ? "Nothing flagged yet. Cross-check dossiers with telemetry TL-09: one instance was console-launched, untagged, outside the pipeline."
            : "That is not the drift offender. The pipeline-built nodes all carry tags and GI-2026.09; look for the one launched on 2026-06-02.");
      case "M5": {
        var a = s.asg;
        var ok = a.min >= 2 && a.min <= 3 && a.desired >= Math.max(2, a.min) && a.desired <= 4
          && a.max >= 12 && a.max <= 16 && a.threshold >= 60 && a.threshold <= 70
          && a.windowMin >= 5 && a.windowMin <= 10 && a.cooldown >= 5 && a.cooldown <= 10;
        return ok ? { pass: true, fail: "" } : FA("Still not survivable for 6x. Check each knob: HA baseline (min ~3), ceiling that fits the surge (max 12-16), trigger 60-70%, short window and cooldown (5-10 min).");
      }
      case "M6":
        if (s.simOutcome !== "ok")
          return FA("Run the simulation with a policy that survives first — the check needs a green run to judge.");
        return s.scaleApproach === "horizontal"
          ? { pass: true, fail: "" }
          : FA("Watch again: identical nodes appear behind edge-lb — that is not a resize, it is a family growing.");
      case "M7": {
        var want7 = {
          "p-premiere": "scheduled", "p-cpu": "dynamic", "p-forecast": "predictive", "p-incident": "manual",
        };
        var ok7 = Object.keys(want7).every(function (k) { return s.triggerMatch[k] === want7[k]; });
        return ok7 ? { pass: true, fail: "" } : FA("Two pairings are swapped. Calendar = scheduled, live metric = dynamic, forecast = predictive, human = manual.");
      }
      case "M8": {
        if (s.updateChoice.version !== "v3.7")
          return FA(s.updateChoice.version === "v4.1"
            ? "4.1 is a major version 48 hours before your biggest night — breaking-change risk with no staging cycle. Not this window."
            : "Pick one of the two offered versions.");
        return s.updateChoice.window === "sun-0200"
          ? { pass: true, fail: "" }
          : FA("Right version, wrong slot: Friday 19:00 is one hour before the premiere, and \"no window\" is not change management.");
      }
      case "M9": {
        var p = s.patch;
        if (p.strategy === "inplace") return FA("In-place reboots the whole tier together — capacity dips to zero. Not for a stateless fleet mid-season.");
        if (p.strategy === "bluegreen") return FA("Blue-green works for stateless tiers but doubles transient cost for no benefit here — the rolling pattern fits better.");
        if (!(p.strategy === "rolling" || p.strategy === "canary")) return FA("Choose a strategy first.");
        if (p.batch === "all") return FA("All at once defeats the point: capacity goes to zero and a bad patch hits everything simultaneously.");
        if (!p.healthCheck || !p.rollback) return FA("Turn on the safety rails: health checks decide who rejoins the LB, auto-rollback pulls a bad batch.");
        return p.window === "sun-0200"
          ? { pass: true, fail: "" }
          : FA("Schedule it properly — the quiet Sunday 02:00 window.");
      }
      case "M10":
        return sameSet(s.halcyonSel, D.HALCYON_ORPHANS)
          ? { pass: true, fail: "" }
          : FA(s.halcyonSel.indexOf("hlcy-web-01") !== -1
            ? "hlcy-web-01 was already retired in 2024 — retired resources cost $0. Select only what still bills."
            : "Not the full set yet. Filter by the halcyon project tag and cross-check TL-07 ($34/day = 5 resources).");
      case "M11":
        return sameSeq(s.decomSeq, SEQ_DECOM)
          ? { pass: true, fail: "" }
          : FA(s.decomSeq.indexOf("del") !== -1 && s.decomSeq.indexOf("del") < s.decomSeq.indexOf("revoke")
            ? "Terminating before revoking leaves credentials that outlive the resource — revoke access FIRST, then delete."
            : "Order matters: dependencies → snapshot → revoke credentials → deprovision → update CMDB.");
      case "M12":
        return s.storagePolicy.archiveAfter === 90 && s.storagePolicy.deleteAfter === 365 && s.storagePolicy.tagEnforce
          ? { pass: true, fail: "" }
          : FA("Match the retention story: archive after ~90 days (access drops), delete after the 365-day retention year, and enforce tags at provisioning.");
      case "H1": {
        var t = s.triage;
        var okV = sameSet(t.vuln, ["web-prod-04"]);
        var okM = sameSet(t.manual, ["web-prod-04", "dev-sandbox"]);
        var okO = sameSet(t.orphan, D.HALCYON_ORPHANS);
        if (!okV) return FA(t.vuln.indexOf("staging-02") !== -1 ? "staging-02 runs the old image, but its VPC is network-isolated — no production path, dramatically lower exploitability. The exposed path is the prod node named in TL-12/TL-09." : "Board 1 (production-path vulns) is off — reread TL-12 and the dossier network notes.");
        if (!okM) return FA("Board 2 (non-IaC): TL-09 names one console launch; the developer sandbox was also launched by hand. Pipeline-built nodes do not count.");
        return okO ? { pass: true, fail: "" } : FA("Board 3 (orphans): the halcyon tag marks five billing resources. hlcy-web-01 was properly retired — it costs nothing and is not an orphan.");
      }
      case "H2":
        return sameSeq(s.launchSeq, SEQ_LAUNCH)
          ? { pass: true, fail: "" }
          : FA("A governance arc is violated. Nothing ships before it is in source control; canary precedes full rollout; the CMDB closes last.");
      case "H3": {
        var c = s.finaleCfg;
        if (!(c.scheduled && c.preTime === "1930"))
          return FA("The 20:00 ramp needs headroom BEFORE it: schedule a pre-scale to 8 at 19:30 — dynamic triggers alone start reacting after the spike hurts.");
        if (!(c.dynamic && c.threshold >= 60 && c.threshold <= 70))
          return FA("Keep the dynamic trigger for the noise, with a threshold in the 60-70% band.");
        if (c.max < 12) return FA("Max below 12 cannot hold a 6x premiere — raise the ceiling.");
        if (c.max > 16) return FA("That ceiling is a cost weapon: the 22:40 anomaly would fabricate CPU and your autoscaler would buy it instances. Cap max at 14-16.");
        if (c.cooldown < 5 || c.cooldown > 10) return FA("Cooldown 5-10 min: fast enough for the ramp, calm enough not to thrash.");
        return s.finaleOutcome === "ok"
          ? { pass: true, fail: "" }
          : FA("Config looks right — run the finale-night simulation to prove it survives both hazards.");
      }
      case "H4": {
        var okW = s.tierStrategy.web === "rolling" || s.tierStrategy.web === "canary";
        var okD = s.tierStrategy.db === "bluegreen";
        var okWr = sameSet(s.tierReasons.web, ["stateless", "zerodowntime"]);
        var okDr = sameSet(s.tierReasons.db, ["stateful", "instantrollback"]);
        if (!okW) return FA("Web tier: in-place violates zero-downtime; blue-green doubles fleet cost for stateless machines that can simply be replaced one-by-one.");
        if (!okD) return FA("DB tier: rolling a single-writer stateful DB still interrupts writes; blue-green with replica promotion is the zero-downtime pattern.");
        if (!okWr) return FA("Justify the web choice with its two real reasons: stateless nodes + LB keeps downtime at zero.");
        return okDr ? { pass: true, fail: "" } : FA("Justify the DB choice: stateful data + the warm replica gives instant switch-back.");
      }
      case "H5":
        return sameSeq(s.cutoverSeq, SEQ_CUTOVER)
          ? { pass: true, fail: "" }
          : FA(s.cutoverSeq.indexOf("retire") !== -1 && s.cutoverSeq.indexOf("retire") < s.cutoverSeq.indexOf("soak")
            ? "Blue never retires before green has soaked — blue IS your instant rollback until the soak window closes."
            : "Sequence: build green → prove green → switch once → soak (blue warm) → retire blue → close out credentials/CMDB.");
      case "H6":
        return sameSeq(s.bucketSeq, SEQ_BUCKET)
          ? { pass: true, fail: "" }
          : FA(s.bucketSeq.indexOf("delete") !== -1 && s.bucketSeq.indexOf("delete") < s.bucketSeq.indexOf("quiesce")
            ? "Deleting before quiescing the archive-pull job breaks the media team\u2019s monthly run — pause the consumer with its owner FIRST."
            : s.bucketSeq.indexOf("delete") !== -1 && s.bucketSeq.indexOf("delete") < s.bucketSeq.indexOf("revoke")
              ? "The deploy key must be revoked before the bucket it can reach disappears — kill the credential first."
              : "Order: quiesce the job (with sign-off) → re-verify quiet → snapshot → revoke key → delete → CMDB.");
      case "H7": {
        var wantPack = {
          prod: { cadence: "monthly+critical", stop: "none", ttl: "none" },
          staging: { cadence: "weekly", stop: "nights", ttl: "90d" },
          bucket: { hot: "30", archive: "90", del: "365", eol: "delete" },
        };
        var okPack = Object.keys(wantPack).every(function (k) {
          return Object.keys(wantPack[k]).every(function (f) {
            return s.policyPack[k] && s.policyPack[k][f] === wantPack[k][f];
          });
        });
        return okPack ? { pass: true, fail: "" } : FA("One or more classes are misconfigured. Prod = conservative (monthly + critical within 72h, no stop, no TTL). Staging = weekly, off at night, expires at 90d. Bucket = hot 30d, archive at 90d, delete at 365d, EOL action = delete.");
      }
      case "H8": {
        if (!sameSet(s.costCut, D.HALCYON_ORPHANS))
          return FA(s.costCut.indexOf("db-orders-replica") !== -1
            ? "The \"idle\" replica is the DR failover target protected by DR-07 — deleting it trades a real capability for fake savings. Cut the orphans instead."
            : s.costCut.indexOf("dev-sandbox") !== -1
              ? "dev-sandbox should be right-sized (auto-stop at night), not deleted — the team still uses it daily. The orphans alone exceed the target."
              : "The cut list is off: the five Halcyon orphans are $34/day = 53% of spend, the entire target with zero SLA impact.");
        var okP = s.costProtect.indexOf("db-orders-replica") !== -1 && s.costProtect.indexOf("asg-web-prod") !== -1;
        return okP ? { pass: true, fail: "" } : FA("Protect list incomplete: the premiere fleet (asg-web-prod) and the DR replica must both be explicitly protected.");
      }
      case "H9": {
        var okL = sameSet(s.anomalyLines, ["TA-1", "TA-2", "TA-3"]);
        if (!okL)
          return FA(s.anomalyLines.indexOf("TA-4") !== -1 || s.anomalyLines.indexOf("TA-5") !== -1
            ? "TA-4/TA-5 are consequences (the autoscaler reacting, the bill rising), not proof of compromise. The proof: CPU without traffic, the pool endpoint, the cron implant."
            : "Pick exactly the three lines that prove compromise on the node itself.");
        return sameSeq(s.containmentSeq, SEQ_CONTAIN)
          ? { pass: true, fail: "" }
          : FA("Containment order: cap the autoscaler (stop the amplification) → isolate the node → revoke the leaked key (persistence) → re-image from the golden image.");
      }
      default:
        return { pass: false, fail: "Unknown objective." };
    }
  }

  // ---------- scoring (F2/C7) ----------
  function objScore(s, id) {
    if (!s.passed[id]) return 0;
    var a = s.passedOn[id] ?? 1;
    var h = s.hintsUsed[id] ?? 0;
    var attPen = s.mode === "HARD" ? 18 : 15;
    var hintPen = s.mode === "HARD" ? 22 : 12;
    return Math.max(25, 100 - (a - 1) * attPen - h * hintPen);
  }

  function labStats(s) {
    var ids = idsFor(s.mode);
    var solved = ids.filter(function (i) { return s.passed[i]; }).length;
    var pct = Math.round(ids.reduce(function (acc, i) { return acc + objScore(s, i); }, 0) / ids.length);
    var stars = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 55 ? 3 : pct >= 35 ? 2 : 1;
    var allDone = solved === ids.length;
    return { ids: ids, solved: solved, total: ids.length, pct: pct, stars: stars, allDone: allDone };
  }

  function pillarStats(s) {
    var ids = idsFor(s.mode);
    var out = { P1: { done: 0, total: 0 }, P2: { done: 0, total: 0 }, P3: { done: 0, total: 0 }, P4: { done: 0, total: 0 } };
    ids.forEach(function (id) {
      var obj = null;
      D.OBJECTIVES[s.mode].forEach(function (o) { if (o.id === id) obj = o; });
      if (!obj) return;
      out[obj.pillar].total += 1;
      if (s.passed[id]) out[obj.pillar].done += 1;
    });
    return out;
  }

  function quizStats(s) {
    var list = D.QUIZ[s.mode];
    var correct = list.filter(function (q) { return s.quizAnswers[q.id] === q.answer; }).length;
    return { correct: correct, total: list.length, done: s.quizDone };
  }

  // fleet totals (used by cost boards)
  var FLEET_TOTAL_COST = D.FLEET.reduce(function (a, r) { return a + r.costPerDay; }, 0);
  var HALCYON_COST = D.FLEET
    .filter(function (r) { return D.HALCYON_ORPHANS.indexOf(r.id) !== -1; })
    .reduce(function (a, r) { return a + r.costPerDay; }, 0);

  return {
    SEQ_LIFECYCLE: SEQ_LIFECYCLE,
    SEQ_DECOM: SEQ_DECOM,
    SEQ_LAUNCH: SEQ_LAUNCH,
    SEQ_CUTOVER: SEQ_CUTOVER,
    SEQ_BUCKET: SEQ_BUCKET,
    SEQ_CONTAIN: SEQ_CONTAIN,
    MEDIUM_IDS: MEDIUM_IDS,
    HARD_IDS: HARD_IDS,
    idsFor: idsFor,
    validate: validate,
    objScore: objScore,
    labStats: labStats,
    pillarStats: pillarStats,
    quizStats: quizStats,
    FLEET_TOTAL_COST: FLEET_TOTAL_COST,
    HALCYON_COST: HALCYON_COST,
  };
})();
