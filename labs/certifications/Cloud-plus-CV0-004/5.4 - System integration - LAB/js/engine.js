// ═══════════════════════════════════════════════════════════════════════════
// The Central Exchange — validation engine + health derivation (static port)
// 1:1 transcription of src/lib/lab/engine.ts. Pure functions over the engine
// state slice; no DOM, no persistence.
// ═══════════════════════════════════════════════════════════════════════════

const sel = (s, k, v) => s.cfg[k] === v;
const sw = (s, k) => s.cfg[k] === true;

// ── derived incident fix state ──
function incidentFixed(s, inc) {
  const found = (c) => s.found[inc] === c;
  switch (inc) {
    case "inc1":
      return found("dup-retry") && sw(s, "ch1.idem") && sel(s, "ch1.retry", "exp") && sel(s, "ch1.maxRetries", "3");
    case "inc2":
      return found("dead-dep") && sel(s, "ch1.depTimeout", "2s") && sw(s, "ch1.cb") && sw(s, "ch1.fallback");
    case "inc3":
      return found("endpoint-drift") && sel(s, "ch2.endpoint", "current") && sw(s, "ch2.sig") && sw(s, "ch2.replay") && sw(s, "ch2.rateCap");
    case "inc4":
      return (
        found("poison-msg") &&
        sw(s, "ch3.dlq") &&
        sel(s, "ch3.dlqAfter", "3") &&
        sel(s, "ch3.acks", "explicit") &&
        sel(s, "ch3.schemaFix", "producerDefault") &&
        sel(s, "ch3.replay", "afterFix")
      );
    case "inc5":
      return found("committed-key") && keyOrderOk(s) && sel(s, "ch1.auth", "vault");
    default:
      return false;
  }
}

function keyOrderOk(s) {
  return KEY_ORDER_CORRECT.length === s.keyOrder.length && KEY_ORDER_CORRECT.every((v, i) => s.keyOrder[i] === v);
}

// ── channel lamp derivation ──
function chHealth(s, ch) {
  if (ch === "ch1") {
    if (s.active.inc1 && !incidentFixed(s, "inc1")) return "red";
    if (s.active.inc2 && !incidentFixed(s, "inc2")) return "red";
    const base = s.patched.ch1 && s.cord.ch1 === "api";
    const ok =
      base &&
      sel(s, "ch1.auth", "vault") &&
      sel(s, "ch1.timeout", "3s") &&
      sw(s, "ch1.idem") &&
      sel(s, "ch1.retry", "exp") &&
      sel(s, "ch1.maxRetries", "3") &&
      sel(s, "ch1.depTimeout", "2s") &&
      sw(s, "ch1.cb") &&
      sw(s, "ch1.fallback");
    if (ok) return "green";
    return base ? "amber" : "idle";
  }
  if (ch === "ch2") {
    if (s.active.inc3 && !incidentFixed(s, "inc3")) return "red";
    const base = s.patched.ch2 && s.cord.ch2 === "webhook";
    const ok = base && sel(s, "ch2.endpoint", "current") && sw(s, "ch2.sig") && sw(s, "ch2.replay") && sw(s, "ch2.rateCap");
    if (ok) return "green";
    return base ? "amber" : "idle";
  }
  if (ch === "ch3") {
    if (s.active.inc4 && !incidentFixed(s, "inc4")) return "red";
    const base = s.patched.ch3 && s.cord.ch3 === "queue";
    const ok =
      base &&
      sel(s, "ch3.delivery", "atLeast") &&
      sel(s, "ch3.acks", "explicit") &&
      sw(s, "ch3.dlq") &&
      sel(s, "ch3.dlqAfter", "3") &&
      sel(s, "ch3.schemaFix", "producerDefault") &&
      sel(s, "ch3.replay", "afterFix");
    if (ok) return "green";
    return base ? "amber" : "idle";
  }
  if (ch === "ch4") {
    const ok =
      sw(s, "ch4.probeApi") && sel(s, "ch4.thrApi", "2") &&
      sw(s, "ch4.probeHook") && sel(s, "ch4.thrHook", "98") &&
      sw(s, "ch4.probeLag") && sel(s, "ch4.thrLag", "300") &&
      sw(s, "ch4.probeDlq") && sel(s, "ch4.thrDlq", "0");
    const partial = sw(s, "ch4.probeApi") || sw(s, "ch4.probeHook") || sw(s, "ch4.probeLag") || sw(s, "ch4.probeDlq");
    if (ok) return "green";
    return partial ? "amber" : "idle";
  }
  return "idle";
}

function allGreen(s) {
  return ["ch1", "ch2", "ch3", "ch4"].every((c) => chHealth(s, c) === "green");
}

// ── gauges ──
function gauges(s) {
  const g1 = chHealth(s, "ch1");
  const g2 = chHealth(s, "ch2");
  const g3 = chHealth(s, "ch3");
  const api = g1 === "red" ? (s.active.inc2 && !incidentFixed(s, "inc2") ? 62.4 : 97.1) : g1 === "amber" ? 99.2 : 99.94;
  const hook = g2 === "red" ? 91.0 : g2 === "amber" ? 99.1 : 100;
  const depth = g3 === "red" ? 12480 : g3 === "amber" ? 214 : 12;
  return { api, hook, depth };
}

// ── objective validation ──
const ch1All = (s) =>
  sel(s, "ch1.auth", "vault") && sel(s, "ch1.timeout", "3s") && sw(s, "ch1.idem") && sel(s, "ch1.retry", "exp") &&
  sel(s, "ch1.maxRetries", "3") && sel(s, "ch1.depTimeout", "2s") && sw(s, "ch1.cb") && sw(s, "ch1.fallback");
const ch2All = (s) =>
  sel(s, "ch2.endpoint", "current") && sw(s, "ch2.sig") && sw(s, "ch2.replay") && sw(s, "ch2.rateCap");
const ch3All = (s) =>
  sel(s, "ch3.delivery", "atLeast") && sel(s, "ch3.acks", "explicit") && sw(s, "ch3.dlq") && sel(s, "ch3.dlqAfter", "3") &&
  sel(s, "ch3.schemaFix", "producerDefault") && sel(s, "ch3.replay", "afterFix");
const probesAll = (s) =>
  sw(s, "ch4.probeApi") && sel(s, "ch4.thrApi", "2") && sw(s, "ch4.probeHook") && sel(s, "ch4.thrHook", "98") &&
  sw(s, "ch4.probeLag") && sel(s, "ch4.thrLag", "300") && sw(s, "ch4.probeDlq") && sel(s, "ch4.thrDlq", "0");

const VALIDATORS = {
  // Medium
  "OBJ-M1": (s) => sel(s, "m1.a", "api") && sel(s, "m1.b", "webhook") && sel(s, "m1.c", "queue"),
  "OBJ-M2": (s) => sel(s, "m2.a", "sync") && sel(s, "m2.b", "push") && sel(s, "m2.c", "async") && sel(s, "m2.d", "sync"),
  "OBJ-M3": (s) => s.patched.ch1 && s.cord.ch1 === "api" && s.patched.ch2 && s.cord.ch2 === "webhook" && s.patched.ch3 && s.cord.ch3 === "queue",
  "OBJ-M4": (s) => s.active.inc1 === true && s.found.inc1 === "dup-retry",
  "OBJ-M5": (s) => sel(s, "ch1.timeout", "3s") && sw(s, "ch1.idem") && sel(s, "ch1.retry", "exp") && sel(s, "ch1.maxRetries", "3"),
  "OBJ-M6": (s) => s.active.inc2 === true && s.found.inc2 === "dead-dep" && sel(s, "ch1.depTimeout", "2s") && sw(s, "ch1.cb") && sw(s, "ch1.fallback"),
  "OBJ-M7": probesAll,
  "OBJ-M8": (s) => s.alertM === "b" && sel(s, "ch2.endpoint", "current") && sw(s, "ch2.sig") && sw(s, "ch2.replay") && sw(s, "ch2.rateCap"),
  "OBJ-M9": (s) => s.active.inc4 === true && incidentFixed(s, "inc4"),
  "OBJ-M10": (s) => s.active.inc5 === true && s.found.inc5 === "committed-key" && keyOrderOk(s) && sel(s, "ch1.auth", "vault"),
  "OBJ-M11": (s) => s.drills && allGreen(s),
  // Hard
  "OBJ-H1": (s) =>
    sel(s, "h1.sc1", "queue") && sel(s, "h1.sc1r", "scale") && sel(s, "h1.sc2", "webhook") &&
    sel(s, "h1.sc2r", "verify") && sel(s, "h1.sc3", "api") && sel(s, "h1.sc3r", "breaker"),
  "OBJ-H2": (s) =>
    s.found.inc1 === "dup-retry" && s.found.inc2 === "dead-dep" && s.found.inc3 === "endpoint-drift" && s.found.noise === "batch-loadtest",
  "OBJ-H3": (s) => ch1All(s) && ch2All(s) && ch3All(s) && s.patched.ch1 && s.cord.ch1 === "api" && s.patched.ch2 && s.cord.ch2 === "webhook" && s.patched.ch3 && s.cord.ch3 === "queue",
  "OBJ-H4": probesAll,
  "OBJ-H5": (s) =>
    ALERT_HARD_CORRECT.every((a) => s.alertH.includes(a)) && s.alertH.length === ALERT_HARD_CORRECT.length &&
    s.alertClass.ha === "dup" && s.alertClass.hb === "cascade" && s.alertClass.hc === "storm",
  "OBJ-H6": (s) => s.found.inc4 === "poison-msg" && sel(s, "h6.fix", "producerDefault") && sel(s, "h6.replay", "afterFix") && sel(s, "h6.prev", "contract"),
  "OBJ-H7": (s) => s.found.inc5 === "committed-key" && keyOrderOk(s) && sel(s, "ch1.auth", "vault"),
  "OBJ-H8": (s) => CONTROLS_CORRECT.every((c) => s.controls.includes(c)) && s.controls.length === CONTROLS_CORRECT.length,
  "OBJ-H9": (s) => s.drills && allGreen(s),
};

function validate(id, s) {
  const fn = VALIDATORS[id];
  if (!fn) return false;
  return fn(s);
}

// ── scoring ──
function stars(objDone, objTotal, hints, attempts, nudges) {
  if (objTotal === 0) return 0;
  const completion = objDone / objTotal;
  const penalty = hints * 0.25 + Math.min(10, Math.max(0, attempts - objDone)) * 0.1 + nudges * 0.5;
  const raw = completion * 5 - penalty * (completion > 0 ? 1 : 0);
  return Math.max(1, Math.min(5, Math.round(raw * 2) / 2));
}
