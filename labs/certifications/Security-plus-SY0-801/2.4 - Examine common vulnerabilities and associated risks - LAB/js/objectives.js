/**
 * Objective validation engine (static port).
 *
 * Source: src/components/lab/validators.ts (352 lines). Every objective's
 * validation rule — correct answers, near-miss rejection, feedback messages —
 * is reproduced exactly.
 *
 * Exposed on the global Lab namespace as Lab.Validators.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = Lab.Data;
  var CVSS = Lab.CVSS;

  var Validators = (Lab.Validators = {});

  var WRONG = "Not quite — re-check the evidence and the hint, then try again.";

  function has(text, needles) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    for (var i = 0; i < needles.length; i++) {
      if (t.indexOf(String(needles[i]).toLowerCase()) !== -1) return true;
    }
    return false;
  }

  function hasAll(text, needles) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    for (var i = 0; i < needles.length; i++) {
      if (t.indexOf(String(needles[i]).toLowerCase()) === -1) return false;
    }
    return true;
  }

  function setEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    var sa = a.slice().sort();
    var sb = b.slice().sort();
    for (var i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return false;
    }
    return true;
  }

  function ans(state, id) {
    var v = state.answers[id];
    return v && typeof v === "object" ? v : {};
  }

  function ok(success) { return { correct: true, message: success }; }
  function fail(message) { return { correct: false, message: message }; }

  /**
   * @param {string} id objective id (e.g. "OBJ-M1")
   * @param {object} state the LabStore.state object
   * @param {string} successFeedback the per-objective success feedback string
   * @returns {{correct: boolean, message: string}}
   */
  Validators.validateObjective = function (id, state, successFeedback) {
    var a = ans(state, id);

    switch (id) {
      // ---------- MEDIUM ----------
      case "OBJ-M1": {
        var matches = (a.matches || {});
        var m1ok = Data.FIX_AVAILABILITY_MATCH.items.every(function (it) {
          return matches[it.value] === it.answer;
        });
        return m1ok
          ? ok(successFeedback)
          : fail("One or more classes are mismatched. Think about the vendor's timeline.");
      }
      case "OBJ-M2": {
        var buckets = (a.buckets || {});
        var m2ok = Data.TYPE_SURFACE_SORT.items.every(function (item) {
          var expected = Data.TYPE_SURFACE_SORT.typeSet.indexOf(item) !== -1 ? "type" : "surface";
          return buckets[item] === expected;
        });
        return m2ok
          ? ok(successFeedback)
          : fail("A vulnerability is the weakness; a surface is where it is reached.");
      }
      case "OBJ-M3": {
        var need3 = { e1: "unsupported_system", e11: "rogue_device", e12: "shadow_it" };
        var m3ok = Object.keys(need3).every(function (eid) {
          var c = state.classifications[eid];
          return c && c.category === need3[eid];
        });
        return m3ok
          ? ok(successFeedback)
          : fail("Read each card's provenance: E1 (vendor stopped fixes), E11 (never approved), E12 (staff-adopted).");
      }
      case "OBJ-M4": {
        var need4 = {
          e2: "hardcoded_secret",
          e3: "default_credential",
          e5: "hardcoded_secret",
          e9: "misconfiguration",
        };
        var m4ok = Object.keys(need4).every(function (eid) {
          var c = state.classifications[eid];
          return c && c.category === need4[eid];
        });
        return m4ok
          ? ok(successFeedback)
          : fail("Hardcoded = embedded in source. Default = vendor-set. E9's key file is world-readable.");
      }
      case "OBJ-M5": {
        var selected = ((a.selected || []).slice() || []).sort();
        var expected5 = Data.CRYPTO_ANSWER.slice().sort();
        var m5ok = setEqual(selected, expected5);
        return m5ok
          ? ok(successFeedback)
          : fail("Exactly three things are wrong with that hash — pick all three, no extras.");
      }
      case "OBJ-M6": {
        var picks = (a.picks || {});
        var m6ok = Data.FIX_MATCH.cards.every(function (cid) {
          return picks[cid] === Data.FIX_MATCH.answer[cid];
        });
        return m6ok
          ? ok(successFeedback)
          : fail("TOCTOU -> atomic check+use. Failing security check -> fail closed (return false).");
      }
      case "OBJ-M7": {
        var v = String(a.cwe || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        var m7ok = v === "cwe89" || v === "89";
        return m7ok
          ? ok(successFeedback)
          : fail("The canonical SQL-injection CWE is CWE-89.");
      }
      case "OBJ-M8": {
        var r8 = CVSS.computeEnvironmental(state.cvss);
        var band8 = CVSS.bandForScore(r8.baseScore);
        var m8ok = Math.abs(r8.baseScore - 9.8) < 0.05 && band8 === "Critical";
        return m8ok
          ? ok(successFeedback)
          : fail("Set all of AV:N AC:L PR:N UI:N S:U C:H I:H A:H. Score should be 9.8 Critical.");
      }
      case "OBJ-M9": {
        var choice = String(a.choice || "");
        var why = String(a.why || "");
        var m9ok = choice === "CVE-B" && has(why, ["kev", "exploited", "epss", "in-the-wild"]);
        return m9ok
          ? ok(successFeedback)
          : fail("Pick CVE-B and mention KEV / exploited / EPSS in your reasoning.");
      }
      case "OBJ-M10": {
        var seq = (a.sequence || []);
        var expected10 = [
          "Revoke/rotate the secret",
          "Remove from history",
          "Audit access logs",
          "Monitor for misuse",
        ];
        var seqOk =
          seq.length === expected10.length &&
          seq.every(function (v, i) { return v === expected10[i]; });
        var readOk = a.readControl === Data.MITIGATION_CONTROLS.read[0].value;
        var writeOk = a.writeControl === Data.MITIGATION_CONTROLS.write[0].value;
        var m10ok = seqOk && readOk && writeOk;
        return m10ok
          ? ok(successFeedback)
          : fail("E5 order: rotate -> remove from history -> audit -> monitor. E4 needs BOTH a read control AND a write control.");
      }
      case "OBJ-M11": {
        var picks11 = (a.picks || {});
        var m11ok = Data.CONTROL_MATCH.scenarios.every(function (s) {
          return picks11[s.value] === s.answer;
        });
        return m11ok
          ? ok(successFeedback)
          : fail("OT = segment + passive monitor. Disable unneeded services. Shadow IT -> procurement. Stale account -> offboarding.");
      }
      case "OBJ-M12": {
        var top12 = state.queueOrder.slice(0, 3);
        var okSet = setEqual(top12, ["e9", "e2", "e5"]);
        var e9Top2 = state.queueOrder.slice(0, 2).indexOf("e9") !== -1;
        var m12ok = okSet && e9Top2 && top12.length === 3;
        return m12ok
          ? ok(successFeedback)
          : fail("Rank the top 3 in the Council Queue (right rail / Queue tab). Must be E9, E2, E5 with E9 in slot 1 or 2.");
      }

      // ---------- HARD ----------
      case "OBJ-H1": {
        var realCards = Object.keys(Data.EVIDENCE_BY_ID)
          .map(function (k) { return Data.EVIDENCE_BY_ID[k]; })
          .filter(function (e) { return !e.redHerring; });
        var classifiedOk = realCards.every(function (e) {
          var c = state.classifications[e.id];
          return c && c.category === e.category && c.surface === e.surface;
        });
        var herringsOk =
          state.redHerringFlags["rh1"] === true &&
          state.redHerringFlags["rh2"] === true;
        var sel = state.councilSelection;
        var selOk = setEqual(sel, ["e9", "e2", "e5", "e10"]);
        var h1ok = classifiedOk && herringsOk && selOk;
        return h1ok
          ? ok(successFeedback)
          : fail("Classify all 12 real cards (type + surface), flag RH1 & RH2, and select exactly {E9, E2, E5, E10} for the council.");
      }
      case "OBJ-H2": {
        // Note: original merges as {...state.cvssEnv, ...state.cvss} (base wins
        // for overlapping keys; env carries base keys as "").
        var merged2 = Object.assign({}, state.cvssEnv, state.cvss);
        var r2 = CVSS.computeEnvironmental(merged2);
        var band2 = CVSS.bandForScore(r2.baseScore);
        var baseOk = Math.abs(r2.baseScore - 10.0) < 0.05;
        var envOk = Math.abs(r2.environmentalScore - 10.0) < 0.05;
        var bandOk = band2 === "Critical";
        var envOn =
          state.cvssEnv.CR === "H" && state.cvssEnv.IR === "H" && state.cvssEnv.AR === "H";
        var why2 = String(a.why || "");
        var whyOk = hasAll(why2, ["v4.0", "not interchangeable", "environmental"]);
        var h2ok = baseOk && envOk && bandOk && envOn && whyOk;
        return h2ok
          ? ok(successFeedback)
          : fail("Base must be 10.0 (S:C with C:H/I:H). Enable env CR:H/IR:H/AR:H — env stays 10.0. Your 'Why?' must mention v4.0, 'not interchangeable', and 'Environmental'.");
      }
      case "OBJ-H3": {
        var surfaceOk = a.surface === "llm";
        var exposureOk =
          has(String(a.exposure || ""), ["pii", "personal"]) &&
          has(String(a.exposure || ""), ["phi", "health"]);
        var tools = (a.tools || []);
        var toolsOk = setEqual(tools, ["read_customer_db", "send_email", "run_sql_query"]);
        var seq3 = (a.sequence || []);
        var first3 = seq3.slice(0, 3);
        var seqOk =
          first3.length === 3 &&
          first3[0] === Data.LLM_SEQUENCE_STEPS[0] &&
          first3[1] === Data.LLM_SEQUENCE_STEPS[1] &&
          first3[2] === Data.LLM_SEQUENCE_STEPS[2];
        var h3ok = surfaceOk && exposureOk && toolsOk && seqOk;
        return h3ok
          ? ok(successFeedback)
          : fail("Surface = LLM. Exposure must mention BOTH PII and PHI. Pick all 3 tools. Sequence starts: scope -> sandbox -> log...");
      }
      case "OBJ-H4": {
        var whyOk4 =
          has(String(a.why || ""), ["origin", "who shipped"]) &&
          has(String(a.why || ""), ["not safety", "not safe", "not sufficient"]);
        var otOk = a.otControl === Data.SIGNED_UPDATE_CONTROLS.ot[0].value;
        var serverOk = a.serverControl === Data.SIGNED_UPDATE_CONTROLS.server[0].value;
        var h4ok = whyOk4 && otOk && serverOk;
        return h4ok
          ? ok(successFeedback)
          : fail("Explain origin vs safety. OT = passive monitoring + allow-listing + segmentation. Server = staged deployment + rollback.");
      }
      case "OBJ-H5": {
        var seq5 = (a.sequence || []);
        var seqOk5 =
          seq5.length === Data.IDP_SEQUENCE_STEPS.length &&
          seq5.every(function (v, i) { return v === Data.IDP_SEQUENCE_STEPS[i]; });
        var justifications = (a.justifications || {});
        var justOk = Data.IDP_SEQUENCE_STEPS.every(function (_, i) {
          var t = justifications["s" + i] || "";
          return String(t).trim().length >= 20;
        });
        var h5ok = seqOk5 && justOk;
        return h5ok
          ? ok(successFeedback)
          : fail("Order: Revoke -> Rotate -> Audit -> Monitor. Each justification needs at least 20 chars; the audit must cover since 2019.");
      }
      case "OBJ-H6": {
        var readOk6 = has(String(a.readExposure || ""), ["download", "read", "leak"]);
        var writeOk6 = has(String(a.writeExposure || ""), ["upload", "write", "overwrite", "tamper"]);
        var readCtrlOk = a.readControl === Data.MITIGATION_CONTROLS.read[0].value;
        var writeCtrlOk = a.writeControl === Data.MITIGATION_CONTROLS.write[0].value;
        var whyOk6 = has(String(a.whyWorse || ""), ["tampering", "integrity"]);
        var h6ok = readOk6 && writeOk6 && readCtrlOk && writeCtrlOk && whyOk6;
        return h6ok
          ? ok(successFeedback)
          : fail("Read=download/leak (confidentiality); Write=upload/overwrite/tamper (integrity). Pick the layered controls. 'Why worse' = tampering/integrity.");
      }
      case "OBJ-H7": {
        var picks7 = (a.picks || {});
        var h7ok = Data.LIFECYCLE_STAGES.every(function (st) {
          var p = picks7[st.id] || {};
          return p.cls === st.classAnswer && p.mit === st.mitigationAnswer;
        });
        return h7ok
          ? ok(successFeedback)
          : fail("Day0=zero-day (compensating); Day30=unpatched (patch); Day365=unsupported (upgrade/isolate); Day730=obsolete (replace).");
      }
      case "OBJ-H8": {
        var top8 = state.queueOrder.slice(0, 5);
        var setOk8 = setEqual(top8, ["e9", "e2", "e5", "e4", "e10"]) && top8.length === 5;
        var justifications8 = (a.justifications || {});
        var justOk8 = top8.every(function (eid) {
          var t = justifications8[eid] || "";
          return String(t).trim().length > 0 && has(t, ["cvss", "epss", "kev", "asset", "exposure"]);
        });
        var h8ok = setOk8 && justOk8;
        return h8ok
          ? ok(successFeedback)
          : fail("Rank the top 5 (E9, E2, E5, E4, E10) in the Council Queue. Each slot needs a justification mentioning CVSS/EPSS/KEV/asset/exposure.");
      }
      case "OBJ-H9": {
        var errors = (a.errors || {});
        var rewrites = (a.rewrites || {});
        var pr1ErrOk = has(errors["pr1"], ["atomic", "race", "toctou"]);
        var pr1RewOk = has(rewrites["pr1"], ["atomic"]);
        var pr2ErrOk = has(errors["pr2"], ["fail-open", "fail open", "open", "true"]);
        var pr2RewOk = has(rewrites["pr2"], ["fail closed", "fail-closed", "return false"]);
        var h9ok = pr1ErrOk && pr1RewOk && pr2ErrOk && pr2RewOk;
        return h9ok
          ? ok(successFeedback)
          : fail("Required: error 1 (TOCTOU not atomic -> rewrite to atomic check+use) and error 2 (fail-open -> fail closed / return false).");
      }
      default:
        return fail(WRONG);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
