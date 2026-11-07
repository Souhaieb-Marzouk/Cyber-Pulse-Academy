/* =========================================================================
   The Engagement Desk — static port (js/objectives.js)
   -------------------------------------------------------------------------
   CHECK RESULTS validation engine — faithful port of src/lib/lab/objectives.ts.
   Same answer keys, same tolerant/smart near-miss notes, same eqSet semantics.
   ========================================================================= */

(function () {
  "use strict";

  // ---------------- answer keys (1:1 from objectives.ts) ----------------

  var MATCH_KEY = { d1: "public", d2: "private", d3: "hybrid", d4: "multi", d5: "community" };
  var MATCH_H_KEY = { e1: "multi", e2: "hybrid", e3: "community", e4: "private", e5: "public" };
  var TENANCY_KEY = { "q-own": "o-provider", "q-control": "o-private", "q-variant": "o-hosted" };
  var LADDER_KEY = { s1: "iaas", s2: "paas", s3: "saas", s4: "faas" };
  var SHARED_KEY = { "q-saas": "sr-data", "q-iaas": "sr-you" };
  var CLASSIFY_KEY = { c1: "hybrid", c2: "multi", c3: "multi" };
  var PLACE_M_KEY = { w1: "t-onprem", w2: "t-pub", w3: "t-hosted", w4: "t-saas", w5: "t-burst" };
  var FLAGS_KEY = ["r1", "r2", "r3", "r4", "r7"];
  var COST_KEY = { "q-cost1": "c1b", "q-cost2": "c2b" };
  var CASES_KEY = {
    mc1: { model: "private", driver: "mc1a" },
    mc2: { model: "multi", driver: "mc2b" },
    mc3: { model: "hybrid", driver: "mc3a" },
  };
  var RISK_M_KEY = { rk1: "mt-exit", rk2: "mt-finops", rk3: "mt-cspm", rk4: "mt-managed" };
  var MEMO_M_KEY = { model: "hybrid", mappings: ["map1", "map2", "map3", "map6"], tradeoff: "to1" };

  var TRIAGE_KEY = ["r1", "r2", "r3", "r4", "r7", "i1", "i2"];
  var PLACE_H_KEY = {
    w1: "t-onprem",
    w2: "t-pubus",
    w3: "t-hosted",
    w4: "t-saas",
    w5: "t-pubus",
    w6: "t-pubue",
    w7: "t-pubus",
  };
  var SERVICE_KEY = { "s-store": "paas", "s-cde": "iaas", "s-mail": "saas", "s-thumb": "faas" };
  var RISK_H_TOP = ["rkB", "rkC", "rkE"];
  var RISK_H_MAP = { rkB: "mh-finops", rkC: "mh-cspm", rkE: "mh-managed" };
  var MEMO_H_KEY = { model: "hybrid", mappings: ["hm1", "hm2", "hm3", "hm4"], tradeoff: "to1", exit: "ex1" };

  function eqSet(a, b) {
    if (!Array.isArray(a)) return false;
    return a.length === b.length && a.every(function (x) {
      return b.includes(x);
    });
  }

  function badKeys(env, record, key) {
    return Object.keys(key).filter(function (k) {
      return (env[record] || {})[k] !== key[k];
    });
  }

  // ---------------- validation (1:1 port of validateObjective) ----------------

  function validateObjective(objectiveId, env) {
    switch (objectiveId) {
      case "OBJ-M1": {
        var bad = badKeys(env, "match", MATCH_KEY);
        return { pass: bad.length === 0 };
      }
      case "OBJ-H10": {
        var badH = badKeys(env, "matchH", MATCH_H_KEY);
        return { pass: badH.length === 0 };
      }
      case "OBJ-M2": {
        var badT = badKeys(env, "tenancy", TENANCY_KEY);
        return { pass: badT.length === 0 };
      }
      case "OBJ-M3": {
        var badL = badKeys(env, "ladder", LADDER_KEY);
        return { pass: badL.length === 0 };
      }
      case "OBJ-M4": {
        var badS = badKeys(env, "shared", SHARED_KEY);
        return { pass: badS.length === 0 };
      }
      case "OBJ-M5": {
        var modelOk = env.kestrelModel === "public";
        var linesOk = eqSet(env.kestrelLines, ["k1", "k3", "k4"]);
        if (modelOk && linesOk) return { pass: true };
        if (modelOk && !linesOk)
          return { pass: false, note: "Model is right — now prove it: tag the lines showing no infra staff, unpredictable global growth, and pay-while-running." };
        return { pass: false };
      }
      case "OBJ-M6": {
        var badC = badKeys(env, "classify", CLASSIFY_KEY);
        return { pass: badC.length === 0 };
      }
      case "OBJ-M7": {
        var badP = badKeys(env, "placementM", PLACE_M_KEY);
        return { pass: badP.length === 0 };
      }
      case "OBJ-M8":
        return { pass: eqSet(env.redFlags, FLAGS_KEY) };
      case "OBJ-M9": {
        var badQ = badKeys(env, "costQ", COST_KEY);
        return { pass: badQ.length === 0 };
      }
      case "OBJ-M10": {
        var keys = Object.keys(CASES_KEY);
        for (var i = 0; i < keys.length; i++) {
          var caseId = keys[i];
          var key = CASES_KEY[caseId];
          var c = env.miniCases[caseId];
          if (!c || c.model !== key.model || c.driver !== key.driver) return { pass: false };
        }
        return { pass: true };
      }
      case "OBJ-M11": {
        var badR = badKeys(env, "riskPairs", RISK_M_KEY);
        return { pass: badR.length === 0 };
      }
      case "OBJ-M12": {
        var m = env.memo;
        var ok = m && m.model === MEMO_M_KEY.model && eqSet(m.mappings, MEMO_M_KEY.mappings) && m.tradeoff === MEMO_M_KEY.tradeoff;
        if (ok) return { pass: true };
        if (!m || m.model !== "hybrid")
          return { pass: false, note: "Re-test candidates against ALL five binding constraints — only one model keeps ERP on-prem, dedicates the CDE, and bursts to public." };
        if (!eqSet(m.mappings, MEMO_M_KEY.mappings))
          return { pass: false, note: "Mappings incomplete: EU→EU regions, CDE→hosted private, peaks→burst, CapEx freeze→OpEx. The ERP-to-SaaS and private-email options are sabotaged." };
        return { pass: false, note: "Only one trade-off is true: integration complexity + two skill sets. The others misstate the model." };
      }
      // ---------- Hard ----------
      case "OBJ-H1": {
        if (eqSet(env.triage, TRIAGE_KEY)) return { pass: true };
        var missing = TRIAGE_KEY.filter(function (k) {
          return !env.triage.includes(k);
        });
        var extra = env.triage.filter(function (k) {
          return !TRIAGE_KEY.includes(k);
        });
        if (extra.length > 0 && missing.length === 0)
          return { pass: false, note: "You tagged noise. The CIO memo, the outage article and the “nicer dashboards” line carry no authority over the design." };
        if (extra.includes("r5") || extra.includes("r6") || extra.includes("r8"))
          return { pass: false, note: "R5 (enthusiasm), R6 (someday) and R8 (old anecdote) are preferences/history, not binding constraints." };
        return { pass: false, note: "Binding set incomplete: " + missing.length + " required statement(s) still untagged. R1–R4 and R7, plus the two evidence-backed facts in D7." };
      }
      case "OBJ-H2": {
        var pub = env.elim["public"];
        var priv = env.elim["private"];
        var pubOk = !!pub && pub.on && pub.reason === "r2";
        var privOk = !!priv && priv.on && (priv.reason === "r4" || priv.reason === "r7");
        if (pubOk && privOk) return { pass: true };
        if (pub && pub.on && pub.reason === "r3")
          return { pass: false, note: "Close — R3 pushes toward on-prem, but a public IaaS VM still gives OS-level access. The hard stop for public-only is R2: the QSA-dedicated, physically isolated CDE." };
        if (pub && pub.on && pub.reason === "r1")
          return { pass: false, note: "R1 (EU residency) can be met with EU public regions. The hard stop for public-only is R2: dedicated, physically isolated CDE." };
        return { pass: false };
      }
      case "OBJ-H3":
        return { pass: env.pattern === "p3" };
      case "OBJ-H4": {
        var badPH = badKeys(env, "placementH", PLACE_H_KEY);
        if (badPH.length === 0) return { pass: true };
        var specific = {
          w3: "W3 breaks R2 — the CDE must sit on dedicated, physically isolated (hosted private) infrastructure.",
          w6: "W6 breaks R1 — EU personal data must be processed in EU regions.",
          w1: "W1 breaks R3/D7 — the ERP needs sub-50 ms to the scanners and OS-level access; it stays on-premises.",
          w2: "W2 needs elastic public capacity to absorb 6–8× peaks at 99.9%+ (R7).",
          w5: "W5 is overflow by definition — elastic public US capacity, paid only while bursting (R7/R4).",
          w4: "W4 is commodity — a nine-person team should not patch email servers; SaaS it.",
          w7: "W7 is ephemeral dev/test with no EU data — cheap public US capacity fits.",
        };
        return { pass: false, note: specific[badPH[0]] || "One or more placements violate a binding constraint." };
      }
      case "OBJ-H5": {
        var badSV = badKeys(env, "serviceH", SERVICE_KEY);
        return { pass: badSV.length === 0 };
      }
      case "OBJ-H6":
        if (env.plan === "pb") return { pass: true };
        if (env.plan === "pa")
          return { pass: false, note: "Plan A is cheapest — and illegal for this estate: US-only regions breach R1 (EU residency)." };
        if (env.plan === "pc")
          return { pass: false, note: "Plan C's 99.99% and EU regions look great, but the 3-year minimum spend + up-front reservation contradicts R4's variable-spend directive; 99.95% already clears the 99.9% bar." };
        return { pass: false };
      case "OBJ-H7": {
        var topOk = eqSet(env.riskTop, RISK_H_TOP);
        if (!topOk)
          return { pass: false, note: "The evidence signals exactly three: compliance drift (R1+R2 span a boundary), burst-driven spend (R4+R7), and the skills gap (D7). Lock-in and shadow spend aren't evidenced here; single-region outage is already mitigated by the DR runbook." };
        var badMap = RISK_H_TOP.filter(function (r) {
          return env.riskMapH[r] !== RISK_H_MAP[r];
        });
        return { pass: badMap.length === 0 };
      }
      case "OBJ-H8": {
        var mh = env.memoH;
        var okH =
          mh &&
          mh.model === MEMO_H_KEY.model &&
          eqSet(mh.mappings, MEMO_H_KEY.mappings) &&
          mh.tradeoff === MEMO_H_KEY.tradeoff &&
          mh.exit === MEMO_H_KEY.exit;
        if (okH) return { pass: true };
        if (!mh || mh.model !== "hybrid") return { pass: false, note: "The pattern stamp must match your H3 selection: hybrid." };
        if (!eqSet(mh.mappings, MEMO_H_KEY.mappings))
          return { pass: false, note: "Four mappings are correct (EU→EU regions, CDE→hosted private, ERP→on-prem until FY28, peaks→OpEx burst); the community-storefront and self-patched-email options are sabotaged." };
        if (mh.tradeoff !== "to1") return { pass: false, note: "The only true trade-off: integration complexity + skills across both environments." };
        return { pass: false, note: "The exit control is the anti-lock-in clause: documented exit strategy + portable workloads." };
      }
      case "OBJ-H9": {
        var okD = env.drill.length === 3 && env.drill[0] === "a1" && env.drill[1] === "a2" && env.drill[2] === "a3";
        if (okD) return { pass: true };
        if (env.drill.includes("a4") || env.drill.includes("a5"))
          return { pass: false, note: "Re-platforming the ERP mid-incident or buying hardware is panic, not procedure — the runbook restores, verifies, then communicates." };
        return { pass: false, note: "Sequence matters: fail over the storefront first, verify EU obligations second, communicate and log third." };
      }
      default:
        return { pass: false };
    }
  }

  function isObjectiveComplete(id, env) {
    // Used for live progress hints: has the student interacted enough to allow a check?
    return validateObjective(id, env).pass;
  }

  window.LabEngine = {
    validateObjective: validateObjective,
    isObjectiveComplete: isObjectiveComplete,
  };
})();
