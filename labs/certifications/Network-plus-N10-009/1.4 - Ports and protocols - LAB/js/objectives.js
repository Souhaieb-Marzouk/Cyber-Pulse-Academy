// ============================================================================
// The Grand Exchange — js/objectives.js
// CHECK RESULTS validation engine.
// Faithful port of src/lib/lab/objectives.ts: every validator, every feedback
// message, every near-miss condition is byte-identical to the original.
// ============================================================================
"use strict";

// ---------- helpers ----------
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
const digits = (s) => (String(s).match(/\d+/g) ?? []).join(",");
const numSet = (s) => (String(s).match(/\d+/g) ?? []).sort().join(",");
const setEq = (a, b) => [...a].sort().join("|") === [...b].sort().join("|");

function isRecord(a) {
  return typeof a === "object" && a !== null && !Array.isArray(a);
}

// ---------- validators per widget kind ----------
function checkSort(o, a) {
  if (!o.config.sort || !isRecord(a)) return { ok: false, msg: "Place every tag in a bucket, then check again." };
  const s = o.config.sort.solution;
  for (const [item, bucket] of Object.entries(s)) {
    if (a[item] !== bucket) {
      const it = o.config.sort.items.find((i) => i.id === item);
      return { ok: false, msg: `Not yet — “${it ? it.label : item}” is on the wrong ${o.config.sort.noun ?? "range"}. Re-sort and check again.` };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkMatch(o, a) {
  if (!o.config.match || !isRecord(a)) return { ok: false, msg: "Connect every service before checking." };
  const s = o.config.match.solution;
  for (const [left, right] of Object.entries(s)) {
    if (a[left] !== right) {
      return { ok: false, msg: `Not yet — one or more patch cords land on the wrong jack. A wrong pairing is teaching you something: re-read both sides and re-check.` };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkSequence(o, a) {
  const cfg = o.config.sequence;
  if (!cfg || !isRecord(a) || !Array.isArray(a["order"])) return { ok: false, msg: "Tap the messages in the order they occur, then check." };
  const order = a["order"];
  if (order.length !== cfg.solution.length) return { ok: false, msg: "Use every message exactly once." };
  for (let i = 0; i < cfg.solution.length; i++) {
    if (order[i] !== cfg.solution[i]) {
      return { ok: false, msg: "The order is off. Walk the exchange again: the client starts with a question, the server answers, the client confirms, the server seals it." };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkSequenceFull(o, a) {
  const base = checkSequence(o, a);
  if (!base.ok || !o.config.sequence || !o.config.sequence.followUp) return base;
  const fu = o.config.sequence.followUp;
  // the follow-up questions are part of the objective — an empty record must
  // fail (never let the check pass while required answers are missing)
  if (!isRecord(a) || !isRecord(a["followUp"])) {
    return { ok: false, msg: "The exchange order is right — now answer the port questions below the wire, then check again." };
  }
  const answers = a["followUp"];
  for (const f of fu) {
    const got = (answers && answers[f.id]) ?? "";
    if (!f.accept.some((x) => norm(x) === norm(got))) {
      return { ok: false, msg: "Sequence is right, but the ports aren't — think about which side LISTENS (server) and which side dials out (client)." };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkRecall(o, a) {
  if (!o.config.recall || !isRecord(a)) return { ok: false, msg: "Fill in the jack numbers, then check." };
  for (const f of o.config.recall.fields) {
    const got = String((a && a[f.id]) ?? "");
    const okVal = f.accept.some((set) => numSet(got) === set.map((x) => String(x)).sort().join(","));
    if (!okVal) {
      return { ok: false, msg: `Not yet — “${f.label}” is mislabeled. Re-check the board (the Inspector shows each jack's number) and re-enter.` };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkTriage(o, a) {
  const cfg = o.config.triage;
  if (!cfg || !isRecord(a)) return { ok: false, msg: "Select the matching log lines, then check." };
  const rows = Array.isArray(a["rows"]) ? a["rows"] : [];
  if (!setEq(rows, cfg.solution)) {
    const missed = cfg.solution.filter((x) => !rows.includes(x)).length;
    const extra = rows.filter((x) => !cfg.solution.includes(x)).length;
    return {
      ok: false,
      msg: missed
        ? `You missed ${missed} line${missed > 1 ? "s" : ""} that match the criterion.`
        : `You flagged ${extra} line${extra > 1 ? "s" : ""} that don't match — re-read the criterion (destination port!).`,
    };
  }
  const fu = cfg.followUp;
  if (fu) {
    const got = String(((a["followUp"] ?? {})[fu.id]) ?? "");
    if (!fu.accept.some((x) => norm(x) === norm(got))) {
      return { ok: false, msg: "The flagged set is right, but the follow-up answer is off. Look at the SOURCE side of the connection." };
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkInspect(o, a) {
  const cfg = o.config.inspect;
  if (!cfg || !isRecord(a)) return { ok: false, msg: "Answer every part, then check." };
  for (const part of cfg.parts) {
    const got = a[part.id];
    if (part.kind === "text") {
      const strict = o.id === "OBJ-H2";
      const okVal = strict
        ? part.accept.some((x) => x === String(got ?? "").trim())
        : part.accept.some((x) => norm(x) === norm(String(got ?? "")));
      if (!okVal) {
        const nm = nearMissInspect(o, part.id, String(got ?? ""));
        if (nm) return { ok: false, msg: nm };
        return { ok: false, msg: `“${part.prompt}” isn't right yet. Re-read the tapped line — the answer is on the wire.` };
      }
    } else if (part.kind === "choice") {
      if (Number(got) !== part.solution) {
        const nm = nearMissInspect(o, part.id, String(got));
        if (nm) return { ok: false, msg: nm };
        return { ok: false, msg: `“${part.prompt}” — that choice doesn't hold up. Weigh the others and re-check.` };
      }
    } else {
      const arr = Array.isArray(got) ? got.map(Number).sort() : [];
      if (arr.join("|") !== [...part.solution].sort().join("|")) {
        return { ok: false, msg: `“${part.prompt}” — you flagged a different set. Ask: what would an eavesdropper actually REUSE?` };
      }
    }
  }
  return { ok: true, msg: o.feedback };
}

function nearMissInspect(o, partId, got) {
  if (o.id === "OBJ-H2" && partId === "x2" && got.trim().toLowerCase() === "public" && got.trim() !== "public") {
    return "Close — but SNMP community strings are case-sensitive. The wire shows lowercase “public”; that exact string is what an attacker would replay.";
  }
  if (o.id === "OBJ-H1") {
    if (partId === "h1a" && ["ssh", "sftp"].includes(norm(got))) {
      return "Near miss — SSH banners begin “SSH-2.0-…” and encrypt everything after the handshake. A plain “login:” prompt that echoes passwords is Telnet.";
    }
    if (partId === "h1e" && got === "1") return "SSH lines are sealed — nothing readable crosses after the banner. Don't flag encryption itself; flag EXPOSURE.";
    if (partId === "h1k" && got === "1") return "Near miss — RDP traffic is encrypted, so the tap shows no keystrokes. The finding on that line is the external SOURCE, not the content.";
  }
  if (o.id === "OBJ-H7") {
    if (partId === "a1" && got === "0") return "8080 is a registered alternative port, commonly used by internal apps. It's a misfit worth inventorying, not an attack.";
    if (partId === "c1" && got === "1") return "2222 is a very common deliberate admin choice for SSH. It reduces casual noise only — but it isn't an attack. The mismatch you should hunt is Flow B.";
  }
  return undefined;
}

function checkFirewall(o, a, fw) {
  const cfg = o.config.firewall;
  if (!cfg) return { ok: false, msg: "No configuration." };
  for (const [portS, want] of Object.entries(cfg.solution)) {
    const port = Number(portS);
    if ((fw[port] ?? "allow") !== want) {
      const row = cfg.ports.find((x) => x.port === port);
      const svc = row ? row.service : String(port);
      const cur = fw[port] ?? "allow";
      return { ok: false, msg: `Jack ${port} (${svc}) is still ${cur === "allow" ? "OPEN" : "CLOSED"} — that contradicts the policy. Set it and re-apply.` };
    }
  }
  if (cfg.extras && isRecord(a) && isRecord(a["extras"])) {
    for (const e of cfg.extras) {
      if (Number(a["extras"][e.id]) !== e.solution) {
        return { ok: false, msg: `The board is set, but “${e.prompt}” — that call wouldn't hold in an audit. Re-weigh the options.` };
      }
    }
  }
  return { ok: true, msg: o.feedback };
}

function checkHardening(o, a, services) {
  const cfg = o.config.hardening;
  if (!cfg) return { ok: false, msg: "No configuration." };
  const legacy = cfg.services.filter((s) => services[s.key] !== "secure");
  if (legacy.length) {
    return { ok: false, msg: `${legacy.length} line${legacy.length > 1 ? "s are" : " is"} still on the legacy patch: ${legacy.map((l) => l.legacy).join(", ")}. Re-patch, then re-check.` };
  }
  if (isRecord(a) && isRecord(a["reasons"])) {
    for (const r of cfg.reasons) {
      if (Number(a["reasons"][r.key]) !== r.solution) {
        return { ok: false, msg: `The board is re-patched, but your justification for “${r.prompt}” won't survive review. Re-weigh.` };
      }
    }
  }
  return { ok: true, msg: o.feedback };
}

/** Entry point — same dispatch table as the original validateObjective. */
function validateObjective(o, answer, env) {
  switch (o.config.kind) {
    case "sort": return checkSort(o, answer);
    case "match": return checkMatch(o, answer);
    case "sequence": return checkSequenceFull(o, answer);
    case "recall": return checkRecall(o, answer);
    case "triage": return checkTriage(o, answer);
    case "inspect": return checkInspect(o, answer);
    case "firewall": return checkFirewall(o, answer, env.fw);
    case "hardening": return checkHardening(o, answer, env.services);
    default: return { ok: false, msg: "No configuration." };
  }
}
