/* =========================================================================
   Night Dispatch — js/objectives.js
   The CHECK RESULTS validation engine. Pure functions of (state) →
   { pass, feedback }. Objective metadata (titles, hints, anchors) lives in
   data.js; this file binds each objective to its check and assembles the
   per-mode objective lists — identical semantics to lib/lab/objectives.ts.
   ========================================================================= */

"use strict";

/* ---------- validation helpers ---------- */

const con = (id) => CONSIGNMENTS.find((c) => c.id === id);

const stampOf = (s, id) => s.stamps[id];

function vectorOk(s, id) {
  const c = con(id);
  const st = stampOf(s, id);
  if (!st || !st.stamped) return false;
  return c.benign ? st.vectorId === BENIGN_ID : st.vectorId === c.vectorId;
}

function districtOk(s, id) {
  const c = con(id);
  if (c.benign) return true; // benign consignments carry no district
  const st = stampOf(s, id);
  return !!st && !!st.stamped && st.districtId === c.districtId;
}

function stampOk(s, id) {
  return vectorOk(s, id) && districtOk(s, id);
}

const match = (s, key) => s.matchers[key] ?? {};

function matchAllOk(s, key) {
  const m = match(s, key);
  return Object.entries(m).every(([, opt]) => opt !== "" && opt !== undefined);
}

function matchExact(s, key, expected) {
  const m = match(s, key);
  return Object.entries(expected).every(([row, opt]) => m[row] === opt);
}

const seqOf = (s, key) => s.sequences[key] ?? [];

function seqExact(s, key, expected) {
  const q = seqOf(s, key);
  return q.length === expected.length && expected.every((id, i) => q[i] === id);
}

const signalsOn = (s, ids) => ids.every((id) => s.signals[id]);

const vectors = (s, ids) => ids.filter((id) => vectorOk(s, id)).length;
const districts = (s, ids) => ids.filter((id) => districtOk(s, id)).length;

const wrongStampIds = (s, ids) =>
  ids.filter((id) => stampOf(s, id)?.stamped && !stampOk(s, id));

const unstampedIds = (s, ids) => ids.filter((id) => !stampOf(s, id)?.stamped);

function list(ids) {
  return ids.length <= 4 ? ids.join(", ") : `${ids.slice(0, 4).join(", ")} +${ids.length - 4} more`;
}

/* matcher answer maps (kept next to the objectives that validate them) */
const MATCHER_BRW_EP = {
  "ex-ext": "brw", "ex-js": "brw", "ex-pwm": "brw", "ex-cookie": "brw",
  "ex-tablet": "ep", "ex-server": "ep", "ex-trusted": "ep", "ex-ps": "ep", "ex-lol": "ep",
};
const MATCHER_NET = {
  "ex-switch": "net", "ex-vfw": "net", "ex-keys": "net",
  "ex-rdp": "rmt", "ex-vnc": "rmt", "ex-vpn": "rmt",
  "ex-ble": "sig", "ex-rf": "sig", "ex-nfc": "sig",
};
const MATCHER_HUM_PHY = {
  "ex-imp": "hum", "ex-con": "hum", "ex-vis": "hum", "ex-bio": "hum", "ex-water": "hum",
  "ex-lock": "phy", "ex-vest": "phy", "ex-badge": "phy",
};
const MATCHER_IOT_OT = {
  "ex-cam": "iot", "ex-sens": "iot", "ex-prn": "iot", "ex-plc": "ot", "ex-hmi": "ot", "ex-scada": "ot",
};
const MATCHER_CLOUD = {
  "cx-bucket": "opt-pubstore", "cx-saas": "opt-saas", "cx-idp": "opt-idp", "cx-shadow": "opt-shadow", "cx-repo": "opt-repo",
};
const MATCHER_LOG_MED = {
  "vec-msg": "seg", "vec-usb": "usb", "vec-rmt": "idp", "vec-sup": "hash", "vec-ot": "ndr",
};
const MATCHER_APT = { a1: "on", a2: "on", a3: "on", a4: "off", a5: "off", a6: "off" };

/* ---------- per-objective check functions (1:1 from objectives.ts) ---------- */

const OBJECTIVE_CHECKS = {
  "OBJ-M1": (s) => {
    const ok = matchExact(s, "defs-bench", { "term-vector": "def-route", "term-source": "def-origin", "term-surface": "def-surface" });
    const set = Object.values(match(s, "defs-bench")).filter((v) => v).length;
    return {
      pass: ok,
      feedback: ok
        ? "Bench set. The distinction is the whole chapter: APT (source) rides many vectors (routes) and lands on surfaces. Every classification tonight depends on keeping the three apart."
        : `Not set yet — ${set}/3 plates placed. Route = vector; origin = source; reachable = surface.`,
    };
  },
  "OBJ-M2": (s) => {
    const ok = matchExact(s, "family-msg", {
      "ex-email": "msg",
      "ex-qr": "img",
      "ex-rtf": "att",
      "ex-usb": "usb",
    });
    const done = matchAllOk(s, "family-msg");
    return {
      pass: ok,
      feedback: ok
        ? "Four lines inducted. Notice the pattern: each family is named for HOW it travels, not what it steals — that is what makes it a vector."
        : done
          ? "Some assignments are off — a QR sticker travels as an image, not as a message; a USB stick is external media even when it claims to be a keyboard."
          : "Assign every row to a line, then check again.",
    };
  },
  "OBJ-M3": (s) => {
    const SET_A = ["W-1041", "W-1042", "W-1043"];
    const okCount = vectors(s, SET_A);
    const bad = wrongStampIds(s, SET_A);
    const missing = unstampedIds(s, SET_A).filter((id) => !stampOf(s, id)?.stamped);
    return {
      pass: okCount === 3,
      feedback:
        okCount === 3
          ? "Three lures, three different lines — email, image, document. Same desk, three families: that is why 'phishing' alone is not a vector vocabulary."
          : `${okCount}/3 lines correct.${missing.length ? ` Not yet stamped: ${missing.join(", ")}.` : ""}${bad.length ? ` Wrong line on: ${list(bad)} — re-inspect sender domain, sticker type and attachment format.` : ""}`,
    };
  },
  "OBJ-M4": (s) => {
    const SET_B = ["W-1044", "W-1045", "W-1046"];
    const okCount = vectors(s, SET_B);
    const bad = wrongStampIds(s, SET_B);
    const missing = unstampedIds(s, SET_B).filter((id) => !stampOf(s, id)?.stamped);
    return {
      pass: okCount === 3,
      feedback:
        okCount === 3
          ? "Clean. Text, stick and browser — three channels an attacker can hold without ever touching your firewall."
          : `${okCount}/3 correct.${missing.length ? ` Not yet stamped: ${missing.join(", ")}.` : ""}${bad.length ? ` Wrong line on: ${list(bad)}. SMS is Message-based; a stick is External media; an extension + cookie is Browser-based.` : ""}`,
    };
  },
  "OBJ-M5": (s) => {
    const DISTRICT_SET = ["W-1041", "W-1042", "W-1043", "W-1044", "W-1045", "W-1046", "W-1047"];
    const okCount = districts(s, DISTRICT_SET);
    const missing = unstampedIds(s, DISTRICT_SET);
    return {
      pass: okCount === DISTRICT_SET.length,
      feedback:
        okCount === DISTRICT_SET.length
          ? "Full surface map for the first wave. The line says HOW they came; the district says WHAT THEY TOUCH — vector × surface is the chapter's core skill."
          : `${okCount}/${DISTRICT_SET.length} districts correct.${missing.length ? ` Not stamped yet: ${list(missing)}.` : ""}`,
    };
  },
  "OBJ-M6": (s) => {
    const ok = matchExact(s, "family-brw-ep", MATCHER_BRW_EP);
    const done = matchAllOk(s, "family-brw-ep");
    return {
      pass: ok,
      feedback: ok
        ? "Nine items sorted. Remember W-1046: the extension stole a session cookie — browser-based vector, application surface."
        : done
          ? "Close — check the boundary: the cookie and the extension ride the browser line even though the machine hosts them."
          : "Sort all nine rows first, then check.",
    };
  },
  "OBJ-M7": (s) => {
    const ok = matchExact(s, "family-net", MATCHER_NET);
    const done = matchAllOk(s, "family-net");
    return {
      pass: ok,
      feedback: ok
        ? "Fabric, door, air — three distinct lines. W-1048 rode the remote door; W-1053 rode the air; both landed on the network surface."
        : done
          ? "Near the mark — the VPN belongs to Remote access even though it is a network device; the switch management panel is Network-based."
          : "Assign all nine rows, then check.",
    };
  },
  "OBJ-M8": (s) => {
    const ok1 = matchExact(s, "family-hum-phy", MATCHER_HUM_PHY);
    const ok2 = matchExact(s, "family-iot-ot", MATCHER_IOT_OT);
    const d1 = Object.values(match(s, "family-hum-phy")).filter(Boolean).length;
    const d2 = Object.values(match(s, "family-iot-ot")).filter(Boolean).length;
    return {
      pass: ok1 && ok2,
      feedback:
        ok1 && ok2
          ? "All fourteen inducted — the full 14-line vocabulary. Tonight's board now reads like a timetable."
          : `Almost: bench 1 has ${d1}/8 placed (${ok1 ? "correct" : "errors"}), bench 2 has ${d2}/6 (${ok2 ? "correct" : "errors"}). Cameras are IoT; a poisoned forum is Human.`,
    };
  },
  "OBJ-M9": (s) => {
    const ok = matchExact(s, "cloud-vs", MATCHER_CLOUD);
    const done = matchAllOk(s, "cloud-vs");
    return {
      pass: ok,
      feedback: ok
        ? "Five cloud surfaces named. Misconfiguration is the cheapest attack surface an org ever opens — and the cheapest to close."
        : done
          ? "Some rows are off: the unapproved drive app is Shadow IT; the repo leak is a Public repository surface."
          : "Place all five findings first.",
    };
  },
  "OBJ-M10": (s) => {
    const ok1 = matchExact(s, "logmatch-medium", MATCHER_LOG_MED);
    const d1 = Object.values(match(s, "logmatch-medium")).filter(Boolean).length;
    return {
      pass: ok1,
      feedback: ok1
        ? "Detection bench wired. A detection is only as good as the data source feeding it — email evidence lands at the gateway, identity evidence at the IdP, OT chatter in flow records."
        : `Bench: ${d1}/5 set — email→gateway, USB→device control, VPN→IdP, vendor packages→hash records, OT→flow records.`,
    };
  },
  "OBJ-M11": (s) => {
    const need = ["mfa-idp", "mail-filter", "seal-usb", "vendor-sign", "seg-ot"];
    const on = need.filter((id) => s.signals[id]);
    const off = need.filter((id) => !s.signals[id]);
    return {
      pass: on.length === need.length,
      feedback:
        on.length === need.length
          ? "All five levers pulled. Each closes the exact door evidence showed open: M1032/M1027, M1021/M1049, M1034, M1045/M1051, M1030 — verified MITRE mitigation IDs."
          : `Still open: ${off.map((id) => CONTROLS.find((c) => c.id === id).name).join(" · ")}.`,
    };
  },
  "OBJ-M12": (s) => {
    const ok = seqExact(s, "rollout-ot", SEQUENCERS["rollout-ot"].correct);
    const q = seqOf(s, "rollout-ot");
    return {
      pass: ok,
      feedback: ok
        ? "Rollout sequenced: containment (M1030), then intake (M1034), then hardening (M1051). Defenders sequence by blast radius, not by convenience."
        : `Sequence holds ${q.length}/3 steps. Ask: which step limits the damage of the other two if they fail?`,
    };
  },
  "OBJ-M13": (s) => {
    const ok2 = matchExact(s, "apt-attr", MATCHER_APT);
    return {
      pass: ok2,
      feedback: ok2
        ? "Source profiled. An APT is defined by patience and dwell — the counter is monitoring that survives months, not heroics on night one."
        : "Profile: dwell + multi-vector patience + valid credentials are the APT signature. A loud day-one blast is the opposite of persistent.",
    };
  },
  "OBJ-H1": (s) => {
    const ids = boardFor("hard").map((c) => c.id);
    const ok = ids.filter((id) => stampOk(s, id)).length;
    const missing = unstampedIds(s, ids);
    const bad = wrongStampIds(s, ids);
    return {
      pass: ok === ids.length,
      feedback:
        ok === ids.length
          ? "Board clear — 18 for 18, decoys included. You just walked all 14 vector families and all 9 districts in one shift."
          : `${ok}/${ids.length} fully correct.${missing.length ? ` Unstamped: ${list(missing)}.` : ""}${bad.length ? ` Wrong on: ${list(bad)} — re-inspect line AND district.` : ""}`,
    };
  },
  "OBJ-H2": (s) => {
    const ok = seqExact(s, "apt-chain", ["W-1057", "W-1058", "W-1059"]);
    const q = seqOf(s, "apt-chain");
    return {
      pass: ok,
      feedback: ok
        ? "Chain reconstructed: USB bait → LOL tooling → valid credentials with MFA fatigue. Three vector families, one operator, hours apart — the APT signature you will be tested on."
        : `Chain holds ${q.length}/3 links. Ask which consignments share a host, a timeline and an escalation.`,
    };
  },
  "OBJ-H3": (s) => {
    const exp = EXPOSURE_EXPECTED;
    let ok = true;
    for (const [d, v] of Object.entries(exp)) {
      if (s.exposure[d]?.level !== v.level || s.exposure[d]?.tag !== v.tag) ok = false;
    }
    for (const d of Object.keys(s.exposure)) {
      if (!exp[d] && s.exposure[d]?.level === "HIGH") ok = false;
    }
    const highs = Object.entries(s.exposure).filter(([, v]) => v.level === "HIGH").map(([k]) => k);
    return {
      pass: ok,
      feedback: ok
        ? "Exposure board honest: the remote door, the trusted lane, the unwatched fleet. Those three explain the entire night — and every repeat of it."
        : `HIGH currently: ${highs.length ? highs.join(", ") : "none"}. Exactly three: Interlocking (no-MFA tag), Goods Inward (unsigned updates tag), Yard fleet (default-credentials tag).`,
    };
  },
  "OBJ-H4": (s) => {
    const ok = seqExact(s, "vendor-update", SEQUENCERS["vendor-update"].correct);
    const q = seqOf(s, "vendor-update");
    return {
      pass: ok,
      feedback: ok
        ? "Textbook supply-chain response: containment, cryptographic verification, out-of-band confirmation, remediation. SolarWinds began exactly where you just stopped it."
        : `Sequence holds ${q.length}/4 steps. The first move is containment, and out-of-band confirmation comes AFTER cryptographic verification.`,
    };
  },
  "OBJ-H5": (s) => {
    const expected = {
      "vec-msg": "seg", "vec-img": "url", "vec-att": "sand", "vec-usb": "usb", "vec-phy": "acl", "vec-sig": "ble",
    };
    const m = match(s, "logmatch-hard");
    const wrong = Object.entries(expected).filter(([r, v]) => m[r] && m[r] !== v);
    const missing = Object.keys(expected).filter((r) => !m[r]);
    return {
      pass: matchExact(s, "logmatch-hard", expected),
      feedback: matchExact(s, "logmatch-hard", expected)
        ? "Six for six. A detection is only as good as the data source feeding it — this bench is the exam's 'which log would you check' in one card."
        : `${missing.length ? `Unset: ${missing.join(", ")}.` : ""} ${wrong.length ? `Rejected: ${wrong.map(([r]) => r).join(", ")} — near miss is still a miss on this bench.` : ""}`,
    };
  },
  "OBJ-H6": (s) => {
    const allOn = CONTROLS.every((c) => s.signals[c.id]);
    const off = CONTROLS.filter((c) => !s.signals[c.id]).map((c) => c.name);
    const seqOk = seqExact(s, "ctl-critical", SEQUENCERS["ctl-critical"].correct);
    return {
      pass: allOn && seqOk,
      feedback:
        allOn && seqOk
          ? "Cabinet fully armed and sequenced: identity (M1032/M1027) → containment (M1030) → supply chain (M1045/M1051). Justify it in one line: stop what is actively burning, cut the paths, close the intake."
          : `${allOn ? "All levers pulled." : `Still down: ${off.join(" · ")}.`} ${seqOk ? "Order correct." : "Order: identity, then segmentation, then signing."}`,
    };
  },
  "OBJ-H7": (s) => {
    const ok1 = matchExact(s, "estate-id", { "as-cam": "iot", "as-plc": "ot", "as-badge": "phy", "as-ble": "sig" });
    const ok2 = matchExact(s, "estate-expo", { "xp-cam": "op-def", "xp-plc": "op-unpatch", "xp-badge": "op-clone", "xp-ble": "op-pair" });
    return {
      pass: ok1 && ok2,
      feedback: ok1 && ok2
        ? "Estates classified and exposures named in the objectives' exact terms. Specialized surfaces have specialized consequences: production, safety, physical access."
        : `${ok1 ? "" : "Register 1 has errors. "}${ok2 ? "" : "Register 2 needs the exact exposure terms."} Cameras→IoT/default creds; PLC→OT/unpatchable; readers→Physical/cloneable; sensors→Signal/fixed pairing.`,
    };
  },
  "OBJ-H8": (s) => {
    const ok1 = matchExact(s, "cloud-actions", { "ca-acl": "on", "ca-log": "on", "ca-rot": "on", "ca-del": "off", "ca-prem": "off", "ca-hv": "off" });
    const ok2 = matchExact(s, "cloud-resp", { resp: "rr-cust" });
    return {
      pass: ok1 && ok2,
      feedback: ok1 && ok2
        ? "Configured, logged, rotated — and owned. Misconfiguration is a customer-side surface: no exploit ever ran, the door was just left open."
        : `${ok1 ? "" : "Action set wrong: the evidence supports private ACL + audit logging + key rotation only. "} ${ok2 ? "" : "The integration key that opened the bucket was MVTF's — that makes the responsibility call customer-side."}`,
    };
  },
  "OBJ-H9": (s) => {
    const ok1 = matchExact(s, "human-id", { "hw-vis": "h-imp", "hw-ins": "h-ins", "hw-unwit": "h-unwit" });
    const ok2 = matchExact(s, "byod-bundle", { byod: "bd1" });
    return {
      pass: ok1 && ok2,
      feedback: ok1 && ok2
        ? "Three verdicts, one policy. The human surface needs three different controls: verification for impostors, DLP/access reviews for insiders, training for the unwitting — and containers for personal devices."
        : `${ok1 ? "" : "Tribunal: fake identity vs real access misused vs tricked real person. "} ${ok2 ? "" : "BYOD: containment and conditional access beat bans and passcode-trust."}`,
    };
  },
};

/* ---------- assemble the per-mode objective lists ---------- */

const MEDIUM_OBJECTIVES = OBJECTIVE_META
  .filter((o) => o.mode === "medium")
  .map((o) => ({ ...o, check: OBJECTIVE_CHECKS[o.id] }));

const HARD_OBJECTIVES = OBJECTIVE_META
  .filter((o) => o.mode === "hard")
  .map((o) => ({ ...o, check: OBJECTIVE_CHECKS[o.id] }));

const OBJECTIVES = { medium: MEDIUM_OBJECTIVES, hard: HARD_OBJECTIVES };
