/**
 * CVSS v3.1 Base + Environmental score calculator (static port).
 *
 * Source: src/lib/cvss.ts (266 lines). Implements the official FIRST.org
 * CVSS v3.1 specification, including the "Roundup" function (round to 1
 * decimal via integer-math trick that avoids floating-point drift).
 *
 * Spec: https://www.first.org/cvss/v3.1/specification-document
 *
 * Exposed on the global Lab namespace as Lab.CVSS.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var CVSS = (Lab.CVSS = {});

  // --- Metric catalogues (rendered as <select>s by ui.js) -------------------

  CVSS.BASE_METRICS = [
    { key: "AV", label: "Attack Vector", options: [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]] },
    { key: "AC", label: "Attack Complexity", options: [["L", "Low"], ["H", "High"]] },
    { key: "PR", label: "Privileges Required", options: [["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "UI", label: "User Interaction", options: [["N", "None"], ["R", "Required"]] },
    { key: "S", label: "Scope", options: [["U", "Unchanged"], ["C", "Changed"]] },
    { key: "C", label: "Confidentiality", options: [["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "I", label: "Integrity", options: [["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "A", label: "Availability", options: [["N", "None"], ["L", "Low"], ["H", "High"]] },
  ];

  CVSS.ENV_METRICS = [
    { key: "CR", label: "Confidentiality Requirement", options: [["X", "Not Defined (M)"], ["L", "Low"], ["M", "Medium"], ["H", "High"]] },
    { key: "IR", label: "Integrity Requirement", options: [["X", "Not Defined (M)"], ["L", "Low"], ["M", "Medium"], ["H", "High"]] },
    { key: "AR", label: "Availability Requirement", options: [["X", "Not Defined (M)"], ["L", "Low"], ["M", "Medium"], ["H", "High"]] },
    { key: "MAV", label: "Modified Attack Vector", options: [["X", "Not Defined"], ["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]] },
    { key: "MAC", label: "Modified Attack Complexity", options: [["X", "Not Defined"], ["L", "Low"], ["H", "High"]] },
    { key: "MPR", label: "Modified Privileges Required", options: [["X", "Not Defined"], ["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "MUI", label: "Modified User Interaction", options: [["X", "Not Defined"], ["N", "None"], ["R", "Required"]] },
    { key: "MS", label: "Modified Scope", options: [["X", "Not Defined"], ["U", "Unchanged"], ["C", "Changed"]] },
    { key: "MC", label: "Modified Confidentiality", options: [["X", "Not Defined"], ["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "MI", label: "Modified Integrity", options: [["X", "Not Defined"], ["N", "None"], ["L", "Low"], ["H", "High"]] },
    { key: "MA", label: "Modified Availability", options: [["X", "Not Defined"], ["N", "None"], ["L", "Low"], ["H", "High"]] },
  ];

  // --- Lookup tables (numeric values) ---

  var AV_VALUES = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  var AC_VALUES = { L: 0.77, H: 0.44 };
  // PR value depends on Scope. [unchanged, changed].
  var PR_VALUES = {
    N: [0.85, 0.85],
    L: [0.62, 0.68],
    H: [0.27, 0.5],
  };
  var UI_VALUES = { N: 0.85, R: 0.62 };
  var CIA_VALUES = { N: 0, L: 0.22, H: 0.56 };
  // Requirements: X -> Medium (1).
  var REQ_VALUES = { X: 1, L: 0.5, M: 1, H: 1.5 };

  /**
   * Official CVSS v3.1 Roundup: the smallest number, specified to one decimal
   * place, that is equal to or higher than its input. Implemented with integer
   * math to avoid floating-point drift (e.g. 4.02 -> 4.1).
   */
  CVSS.roundup = function (input) {
    var intInput = Math.round(input * 100000);
    if (intInput % 10000 === 0) {
      return intInput / 100000;
    }
    return Math.ceil(intInput / 10000) / 10;
  };

  function computeBase(m) {
    var scope = m.S === "C" ? "C" : "U";
    var c = CIA_VALUES[m.C] != null ? CIA_VALUES[m.C] : 0;
    var i = CIA_VALUES[m.I] != null ? CIA_VALUES[m.I] : 0;
    var a = CIA_VALUES[m.A] != null ? CIA_VALUES[m.A] : 0;
    var impact = 1 - (1 - c) * (1 - i) * (1 - a);

    var impactSub =
      scope === "U"
        ? 6.42 * impact
        : 7.52 * (impact - 0.029) - 3.25 * Math.pow(impact - 0.02, 15);

    var av = AV_VALUES[m.AV] != null ? AV_VALUES[m.AV] : 0;
    var ac = AC_VALUES[m.AC] != null ? AC_VALUES[m.AC] : 0;
    var prPair = PR_VALUES[m.PR] || [0, 0];
    var pr = scope === "U" ? prPair[0] : prPair[1];
    var ui = UI_VALUES[m.UI] != null ? UI_VALUES[m.UI] : 0;
    var exploitability = 8.22 * av * ac * pr * ui;

    var baseScore = 0;
    if (impactSub <= 0) {
      baseScore = 0;
    } else if (scope === "U") {
      baseScore = CVSS.roundup(Math.min(impactSub + exploitability, 10));
    } else {
      baseScore = CVSS.roundup(Math.min(1.08 * (impactSub + exploitability), 10));
    }
    return { baseScore: baseScore, impactSub: impactSub, exploitability: exploitability };
  }

  /** Environmental score. Falls back to base when no env metrics are defined. */
  CVSS.computeEnvironmental = function (m) {
    var base = computeBase(m);

    // Resolve "modified" metrics — fall back to base metric when "X"/undefined.
    var scopeRaw = m.MS && m.MS !== "X" ? m.MS : m.S;
    var scope = scopeRaw === "C" ? "C" : "U";
    var avRaw = m.MAV && m.MAV !== "X" ? m.MAV : m.AV;
    var acRaw = m.MAC && m.MAC !== "X" ? m.MAC : m.AC;
    var prRaw = m.MPR && m.MPR !== "X" ? m.MPR : m.PR;
    var uiRaw = m.MUI && m.MUI !== "X" ? m.MUI : m.UI;

    var av = AV_VALUES[avRaw] != null ? AV_VALUES[avRaw] : 0;
    var ac = AC_VALUES[acRaw] != null ? AC_VALUES[acRaw] : 0;
    var prPair = PR_VALUES[prRaw] || [0, 0];
    var pr = scope === "U" ? prPair[0] : prPair[1];
    var ui = UI_VALUES[uiRaw] != null ? UI_VALUES[uiRaw] : 0;
    var exploitability = 8.22 * av * ac * pr * ui;

    var cRaw = m.MC && m.MC !== "X" ? m.MC : m.C;
    var iRaw = m.MI && m.MI !== "X" ? m.MI : m.I;
    var aRaw = m.MA && m.MA !== "X" ? m.MA : m.A;
    var c = CIA_VALUES[cRaw] != null ? CIA_VALUES[cRaw] : 0;
    var i = CIA_VALUES[iRaw] != null ? CIA_VALUES[iRaw] : 0;
    var a = CIA_VALUES[aRaw] != null ? CIA_VALUES[aRaw] : 0;
    var cr = REQ_VALUES[m.CR != null ? m.CR : "X"] != null ? REQ_VALUES[m.CR != null ? m.CR : "X"] : 1;
    var ir = REQ_VALUES[m.IR != null ? m.IR : "X"] != null ? REQ_VALUES[m.IR != null ? m.IR : "X"] : 1;
    var ar = REQ_VALUES[m.AR != null ? m.AR : "X"] != null ? REQ_VALUES[m.AR != null ? m.AR : "X"] : 1;

    // Modified Impact Sub (with the 0.915 cap).
    var mic = Math.min(1 - (1 - c * cr) * (1 - i * ir) * (1 - a * ar), 0.915);
    var impactSub =
      scope === "U"
        ? 6.42 * mic
        : 7.52 * (mic - 0.029) - 3.25 * Math.pow(mic - 0.02, 15);

    var environmentalScore = 0;
    if (impactSub <= 0) {
      environmentalScore = 0;
    } else if (scope === "U") {
      environmentalScore = CVSS.roundup(Math.min(impactSub + exploitability, 10));
    } else {
      environmentalScore = CVSS.roundup(
        Math.min(1.08 * (impactSub + exploitability), 10)
      );
    }

    return {
      environmentalScore: environmentalScore,
      baseScore: base.baseScore,
      impactSub: impactSub,
      exploitability: exploitability,
    };
  };

  CVSS.bandForScore = function (score) {
    if (score <= 0) return "None";
    if (score <= 3.9) return "Low";
    if (score <= 6.9) return "Medium";
    if (score <= 8.9) return "High";
    return "Critical";
  };

  /** Build the canonical CVSS:3.1 vector string from base (+ optional env) metrics. */
  CVSS.buildVectorString = function (m) {
    var parts = ["CVSS:3.1"];
    var order = ["AV", "AC", "PR", "UI", "S", "C", "I", "A", "CR", "IR", "AR", "MAV", "MAC", "MPR", "MUI", "MS", "MC", "MI", "MA"];
    for (var i = 0; i < order.length; i++) {
      var k = order[i];
      var v = m[k];
      if (v && v !== "") {
        parts.push(k + ":" + v);
      }
    }
    return parts.join("/");
  };

  /** Parse a partial vector like "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" into metrics. */
  CVSS.parseVectorString = function (vector) {
    var out = {
      AV: "",
      AC: "",
      PR: "",
      UI: "",
      S: "",
      C: "",
      I: "",
      A: "",
    };
    if (!vector) return out;
    var trimmed = String(vector).replace(/^CVSS:3\.1\//, "").trim();
    var tokens = trimmed.split("/");
    for (var i = 0; i < tokens.length; i++) {
      var parts = tokens[i].split(":");
      var k = parts[0];
      var v = parts[1];
      if (!k || !v) continue;
      var key = k.toUpperCase();
      out[key] = v.toUpperCase();
    }
    return out;
  };

  CVSS.EMPTY_METRICS = {
    AV: "",
    AC: "",
    PR: "",
    UI: "",
    S: "",
    C: "",
    I: "",
    A: "",
    CR: "X",
    IR: "X",
    AR: "X",
    MAV: "X",
    MAC: "X",
    MPR: "X",
    MUI: "X",
    MS: "X",
    MC: "X",
    MI: "X",
    MA: "X",
  };

  /** Deep clone of EMPTY_METRICS so each session gets its own object. */
  CVSS.cloneEmpty = function () {
    var e = CVSS.EMPTY_METRICS;
    var out = {};
    for (var k in e) {
      if (Object.prototype.hasOwnProperty.call(e, k)) out[k] = e[k];
    }
    return out;
  };
})(typeof window !== "undefined" ? window : globalThis);
