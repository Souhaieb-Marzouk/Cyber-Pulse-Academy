/* ─────────────────────────────────────────────────────────────────────────────
 * app.js — bootstrap, event wiring, toasts, dialogs and the render loop.
 * Vanilla-JS equivalent of the original React bootstrap (LabRoot) with the
 * same behaviors: mode gate, auto-opening completion modal, confirmed reset,
 * storage warning, focus preservation across zone re-renders.
 * ───────────────────────────────────────────────────────────────────────────── */

/* Non-persisted UI state (mirrors the original's component-local state:
 * active deck, open drawers, open trace log, drawer drafts, warnings). */
var ui = {
  deck: "edge",
  openLog: null,
  drawers: {},
  pending: {},
  warnings: {},
};

var lastMode = undefined;

function resetUiState() {
  ui.deck = "edge";
  ui.openLog = null;
  ui.drawers = {};
  ui.pending = {};
  ui.warnings = {};
}

/* ─── rendering ────────────────────────────────────────────────────────────── */

function renderModeGateInto() {
  lastMode = null;
  document.getElementById("app").innerHTML =
    '<div class="lab-root">' + renderModeGate() + "</div>";
}

function renderLabInto(s) {
  lastMode = s.mode;
  var banner = storageOk
    ? ""
    : '<div role="alert" class="storage-banner">' + icon("alert-triangle") +
      "Local storage is unavailable — progress will not survive a reload. The lab still works; avoid resetting your browser data mid-lab.</div>";
  document.getElementById("app").innerHTML =
    '<div class="lab-root lab-shell">' +
    '<a class="skip-link" href="#cutaway-h">Skip to the cutaway</a>' +
    banner +
    '<header class="missionbar" id="zone-mission">' + renderMissionBar(s) + "</header>" +
    '<main class="lab-main">' +
    renderBriefing() +
    renderCodex() +
    '<div id="zone-cutaway">' + renderCutaway(s, ui) + "</div>" +
    '<div id="zone-ledger">' + renderLedger(s, ui) + "</div>" +
    '<div id="zone-quiz">' + renderQuiz(s) + "</div>" +
    renderDebrief() +
    "</main></div>";
}

/** Capture the focus key of the currently focused element (if any). */
function captureFocus() {
  var active = document.activeElement;
  if (!active || active === document.body) return null;
  var holder = active.closest ? active.closest("[data-fkey]") : null;
  return holder ? holder.getAttribute("data-fkey") : null;
}

function restoreFocus(fkey) {
  if (!fkey) return;
  var el = document.querySelector('[data-fkey="' + fkey.replace(/"/g, '\\"') + '"]');
  if (el) {
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  }
}

/** Reconcile: called on every store publish. */
function reconcile(s) {
  if (!s || s.mode === null) {
    renderModeGateInto();
    return;
  }
  if (lastMode === undefined || lastMode === null || lastMode !== s.mode) {
    renderLabInto(s);
  } else {
    var fkey = captureFocus();
    document.getElementById("zone-mission").innerHTML = renderMissionBar(s);
    document.getElementById("zone-cutaway").innerHTML = renderCutaway(s, ui);
    document.getElementById("zone-ledger").innerHTML = renderLedger(s, ui);
    document.getElementById("zone-quiz").innerHTML = renderQuiz(s);
    restoreFocus(fkey);
  }
  /* Completion modal auto-open (original LabRoot effect): fires once when the
   * last objective verifies; completedSeen is persisted. */
  var objs = objectivesFor(s.mode);
  var allPass = objs.length > 0 && objs.every(function (o) {
    return s.results[o.id] && s.results[o.id].pass;
  });
  if (allPass && !s.completedSeen) {
    store.update(function (st) {
      return Object.assign({}, st, { completedSeen: true });
    });
    openCompletion();
  } else if (isDialogOpen("completion-dialog")) {
    document.getElementById("completion-content").innerHTML = renderCompletionContent(s);
  }
}

/* ─── dialogs, toast, glossary popover ─────────────────────────────────────── */

function isDialogOpen(id) {
  var dlg = document.getElementById(id);
  return dlg && dlg.open;
}

function openCompletion() {
  var s = store.get();
  document.getElementById("completion-content").innerHTML = renderCompletionContent(s);
  var dlg = document.getElementById("completion-dialog");
  if (!dlg.open) dlg.showModal();
}

function openReset() {
  document.getElementById("reset-dialog").showModal();
}

function doReset() {
  closeDialog("reset-dialog");
  closeDialog("completion-dialog");
  resetUiState();
  store.reset(); /* publishes → reconcile renders the mode gate */
}

function closeDialog(id) {
  var dlg = document.getElementById(id);
  if (dlg && dlg.open) dlg.close();
}

/* Toast (mirrors shadcn use-toast: TOAST_LIMIT 1 — a new toast replaces the
 * previous one; no auto-dismiss; close button; bottom-right viewport). */
function toast(title, description) {
  var vp = document.getElementById("toast-viewport");
  vp.innerHTML =
    '<div class="toast" role="status">' +
    "<div>" +
    '<p class="toast-title">' + esc(title) + "</p>" +
    (description ? '<p class="toast-desc">' + esc(description) + "</p>" : "") +
    "</div>" +
    '<button type="button" class="toast-close" data-action="toast-close" aria-label="Close toast">' + icon("x") + "</button>" +
    "</div>";
}

/* Glossary popover (single floating element, like the original Radix popover). */
var termTrigger = null;
function openTerm(trigger, termName) {
  var g = LAB.GLOSSARY.find(function (x) {
    return x.term.toLowerCase() === termName.toLowerCase();
  });
  if (!g) return;
  closeTerm();
  termTrigger = trigger;
  trigger.setAttribute("aria-expanded", "true");
  var pop = document.getElementById("term-popover");
  pop.innerHTML =
    '<p class="term-name">' + esc(g.term) + "</p>" +
    '<p class="term-def">' + esc(g.def) + "</p>";
  pop.classList.add("open");
  var r = trigger.getBoundingClientRect();
  var top = r.bottom + window.scrollY + 6;
  var left = Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 320);
  pop.style.top = top + "px";
  pop.style.left = Math.max(8, left) + "px";
}
function closeTerm() {
  var pop = document.getElementById("term-popover");
  pop.classList.remove("open");
  if (termTrigger) {
    termTrigger.setAttribute("aria-expanded", "false");
    termTrigger = null;
  }
}

/* ─── action dispatch ──────────────────────────────────────────────────────── */

function getStore() {
  return store;
}

var actions = {
  "pick-mode": function (el) {
    resetUiState();
    store.update(function (s) {
      return Object.assign({}, s, { mode: el.getAttribute("data-mode") });
    });
  },
  "deck-jump": function (el) {
    ui.deck = el.getAttribute("data-deck");
    store.update(function (s) {
      return Object.assign({}, s);
    }); /* publish → rail + console re-render */
    if (el.getAttribute("data-scroll")) {
      var target = document.getElementById("cutaway-h");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },
  finish: function () {
    openCompletion();
  },
  "open-reset": function () {
    openReset();
  },
  "reset-confirm": function () {
    doReset();
  },
  "reset-cancel": function () {
    closeDialog("reset-dialog");
  },
  "completion-close": function () {
    closeDialog("completion-dialog");
  },
  "toast-close": function () {
    document.getElementById("toast-viewport").innerHTML = "";
  },
  term: function (el) {
    if (termTrigger === el) {
      closeTerm();
    } else {
      openTerm(el, el.getAttribute("data-term"));
    }
  },

  /* cutaway */
  "control-toggle": function (el) {
    var cid = el.getAttribute("data-cid");
    ui.drawers[cid] = !ui.drawers[cid];
    if (ui.drawers[cid] && !ui.pending[cid]) ui.pending[cid] = {};
    store.update(function (s) {
      return Object.assign({}, s);
    });
  },
  "control-deploy": function (el) {
    var cid = el.getAttribute("data-cid");
    var def = LAB.CONTROLS.find(function (c) {
      return c.id === cid;
    });
    var deployed = store.get().deployed[cid];
    var pending = ui.pending[cid] || {};
    var mode =
      pending.mode !== undefined ? pending.mode : deployed && deployed.mode !== undefined ? deployed.mode : undefined;
    var targets =
      pending.targets !== undefined ? pending.targets : deployed && deployed.targets ? deployed.targets.slice() : undefined;

    if (cid === "edr") {
      if (!targets || targets.length === 0) {
        ui.warnings[cid] = "Select at least one target VM for the agent.";
        store.update(function (s) {
          return Object.assign({}, s);
        });
        return;
      }
      if (targets.indexOf("pricing-vm") > -1) {
        ui.warnings[cid] =
          "Vendor contract forbids agents on pricing-vm (legacy appliance). Deploy to the VMs you own — the legacy case needs a compensating control (see the card below).";
        store.update(function (s) {
          return Object.assign({}, s);
        });
        return;
      }
    }
    ui.warnings[cid] = null;
    var cfg = { id: cid, ts: Date.now() };
    if ((def.configs || []).some(function (c) {
      return c.key === "mode";
    })) cfg.mode = mode;
    if ((def.configs || []).some(function (c) {
      return c.key === "targets";
    })) cfg.targets = targets;
    store.update(function (s) {
      var deployedNext = Object.assign({}, s.deployed);
      deployedNext[cid] = cfg;
      return Object.assign({}, s, { deployed: deployedNext });
    });
    ui.drawers[cid] = false;
    ui.pending[cid] = undefined;
    var enforcing =
      def.types.indexOf("preventive") > -1 && (cfg.mode !== "detect" || !def.configs);
    toast(def.name + " deployed", enforcing
      ? "Deployed in enforcing mode. Run a replay to verify it actually blocks."
      : "Deployed. Run a replay to verify the control acts as expected.");
  },
  "control-remove": function (el) {
    var cid = el.getAttribute("data-cid");
    var def = LAB.CONTROLS.find(function (c) {
      return c.id === cid;
    });
    store.update(function (s) {
      var deployedNext = Object.assign({}, s.deployed);
      delete deployedNext[cid];
      return Object.assign({}, s, { deployed: deployedNext });
    });
    toast(def.name + " removed", "Environment reverted.");
  },
  "sg-restrict": function (el) {
    var rid = el.getAttribute("data-rid");
    store.update(function (s) {
      return Object.assign({}, s, {
        sgRules: s.sgRules.map(function (x) {
          return x.id === rid ? Object.assign({}, x, { src: LAB.SG_MGMT_CIDR }) : x;
        }),
      });
    });
  },
  "sg-revert": function (el) {
    var rid = el.getAttribute("data-rid");
    store.update(function (s) {
      return Object.assign({}, s, {
        sgRules: s.sgRules.map(function (x) {
          return x.id === rid ? Object.assign({}, x, { src: "0.0.0.0/0" }) : x;
        }),
      });
    });
  },
  "legacy-build": function () {
    store.update(function (s) {
      var deployedNext = Object.assign({}, s.deployed);
      deployedNext["jumphost"] = { id: "jumphost", ts: Date.now() };
      return Object.assign({}, s, { deployed: deployedNext });
    });
  },
  "siem-act": function (el) {
    var eid = el.getAttribute("data-eid");
    var value = el.getAttribute("data-value");
    var s = store.get();
    var oid = s.mode === "hard" ? "OBJ-H6" : "OBJ-M8";
    if (s.results[oid] && s.results[oid].pass) return;
    store.update(function (st) {
      var cur = Object.assign({}, asRec(st.answers[oid]));
      var prev = cur[eid] || "?-" + value;
      cur[eid] = prev.split("-")[0] + "-" + value;
      var answers = Object.assign({}, st.answers);
      answers[oid] = cur;
      var alertsHandled = Object.assign({}, st.alertsHandled);
      alertsHandled[eid] = true;
      return Object.assign({}, st, { answers: answers, alertsHandled: alertsHandled });
    });
  },
  "replay-run": function (el) {
    var rid = el.getAttribute("data-rid");
    store.update(function (s) {
      var runs = Object.assign({}, s.runs);
      runs[rid] = computeRun(rid, s);
      return Object.assign({}, s, { runs: runs });
    });
    ui.openLog = rid;
  },
  "replay-log": function (el) {
    var rid = el.getAttribute("data-rid");
    ui.openLog = ui.openLog === rid ? null : rid;
    store.update(function (s) {
      return Object.assign({}, s);
    });
  },

  /* ledger */
  "obj-check": function (el) {
    var oid = el.getAttribute("data-oid");
    var s = store.get();
    var o = objectivesFor(s.mode).find(function (x) {
      return x.id === oid;
    });
    var prev = s.results[oid];
    if (prev && prev.pass) return; /* verified objectives are locked (QA-4) */
    var r = o.validate(s, s.answers[oid]);
    store.update(function (st) {
      var p = st.results[oid];
      var attempts = p && p.pass ? p.attempts : ((p && p.attempts) || 0) + 1;
      var results = Object.assign({}, st.results);
      results[oid] = {
        pass: r.pass,
        attempts: attempts,
        ts: Date.now(),
        firstAttempt: r.pass && attempts === 1,
      };
      return Object.assign({}, st, { results: results });
    });
  },
  "obj-hint": function (el) {
    var oid = el.getAttribute("data-oid");
    var s = store.get();
    var o = objectivesFor(s.mode).find(function (x) {
      return x.id === oid;
    });
    var hard = s.mode === "hard";
    var max = hard ? 1 : o.hints.length;
    if ((s.hintsUsed[oid] || 0) >= max) return;
    store.update(function (st) {
      var hintsUsed = Object.assign({}, st.hintsUsed);
      hintsUsed[oid] = (st.hintsUsed[oid] || 0) + 1;
      return Object.assign({}, st, { hintsUsed: hintsUsed });
    });
  },
  "seq-move": function (el) {
    var oid = el.getAttribute("data-oid");
    var i = parseInt(el.getAttribute("data-idx"), 10);
    var dir = parseInt(el.getAttribute("data-dir"), 10);
    var cfg = LAB.SEQ[oid];
    setAnswer(oid, function (p) {
      var base =
        Array.isArray(p) &&
        p.filter(function (k) {
          return cfg.steps.some(function (s) {
            return s.k === k;
          });
        }).length === cfg.steps.length
          ? p
          : cfg.initial;
      var next = base.slice();
      var j = i + dir;
      if (j < 0 || j >= next.length) return next;
      var tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  },
  "h8-toggle": function (el) {
    var fid = el.getAttribute("data-fid");
    var checked = el.checked;
    setAnswer("OBJ-H8", function (p) {
      var cur = Array.isArray(p) ? p : [];
      return checked ? cur.concat([fid]) : cur.filter(function (x) {
        return x !== fid;
      });
    });
  },
  "triage-toggle": function (el) {
    var oid = el.getAttribute("data-oid");
    var fid = el.getAttribute("data-fid");
    var checked = el.checked;
    setAnswer(oid, function (p) {
      var cur = asRec(p);
      var sel = cur.sel || [];
      var next = checked ? sel.concat([fid]) : sel.filter(function (x) {
        return x !== fid;
      });
      return { sel: next, decks: cur.decks || {} };
    });
  },
  "quiz-lock": function (el) {
    var qid = el.getAttribute("data-qid");
    var s = store.get();
    if (s.quizChecked[qid] || s.quizAnswers[qid] === undefined) return;
    store.update(function (st) {
      var quizChecked = Object.assign({}, st.quizChecked);
      quizChecked[qid] = true;
      return Object.assign({}, st, { quizChecked: quizChecked });
    });
  },
  "quiz-next": function (el) {
    var qid = el.getAttribute("data-qid");
    var s = store.get();
    if (!s.quizChecked[qid]) return;
    store.update(function (st) {
      var quizAdvanced = Object.assign({}, st.quizAdvanced);
      quizAdvanced[qid] = true;
      return Object.assign({}, st, { quizAdvanced: quizAdvanced });
    });
  },
};

/* change-event actions (radios, checkboxes, selects) */
var changeActions = {
  "ans-radio": function (el) {
    var oid = el.getAttribute("data-oid");
    var key = el.getAttribute("data-key");
    var value = el.getAttribute("data-value");
    setAnswer(oid, function (p) {
      var cur = Object.assign({}, asRec(p));
      cur[key] = value;
      return cur;
    });
  },
  "ans-select": function (el) {
    var oid = el.getAttribute("data-oid");
    var key = el.getAttribute("data-key");
    var value = el.value;
    setAnswer(oid, function (p) {
      var cur = Object.assign({}, asRec(p));
      cur[key] = value;
      return cur;
    });
  },
  "ans-select2": function (el) {
    var oid = el.getAttribute("data-oid");
    var row = el.getAttribute("data-row");
    var key = el.getAttribute("data-key");
    var value = el.value;
    setAnswer(oid, function (p) {
      var cur = Object.assign({}, asRec(p));
      var r = Object.assign({}, asRec(cur[row]));
      r[key] = value;
      cur[row] = r;
      return cur;
    });
  },
  "triage-deck": function (el) {
    var oid = el.getAttribute("data-oid");
    var fid = el.getAttribute("data-fid");
    var value = el.value;
    setAnswer(oid, function (p) {
      var cur = asRec(p);
      return { sel: cur.sel || [], decks: Object.assign({}, cur.decks || {}, objPair(fid, value)) };
    });
  },
  "h9-select": function (el) {
    var key = el.getAttribute("data-key");
    var value = el.value;
    setAnswer("OBJ-H9", function (p) {
      var cur = asRec(p);
      return { table: Object.assign({}, asRec(cur.table), objPair(key, value)) };
    });
  },
  "quiz-pick": function (el) {
    var qid = el.getAttribute("data-qid");
    var idx = parseInt(el.getAttribute("data-idx"), 10);
    var s = store.get();
    if (s.quizChecked[qid]) return;
    store.update(function (st) {
      var quizAnswers = Object.assign({}, st.quizAnswers);
      quizAnswers[qid] = idx;
      return Object.assign({}, st, { quizAnswers: quizAnswers });
    });
  },
  "legacy-pick": function (el) {
    var value = el.getAttribute("data-value");
    var s = store.get();
    if (s.results["OBJ-M11"] && s.results["OBJ-M11"].pass) return; /* locked */
    store.update(function (st) {
      var answers = Object.assign({}, st.answers);
      answers["OBJ-M11"] = value;
      return Object.assign({}, st, { answers: answers });
    });
  },
  "siem-mark": function (el) {
    var eid = el.getAttribute("data-eid");
    var value = el.getAttribute("data-value");
    var s = store.get();
    var oid = s.mode === "hard" ? "OBJ-H6" : "OBJ-M8";
    if (s.results[oid] && s.results[oid].pass) return;
    store.update(function (st) {
      var cur = Object.assign({}, asRec(st.answers[oid]));
      var prev = cur[eid] || "";
      var action = prev.split("-")[1] || "none";
      cur[eid] = value + "-" + action;
      var answers = Object.assign({}, st.answers);
      answers[oid] = cur;
      return Object.assign({}, st, { answers: answers });
    });
  },
  "drawer-mode": function (el) {
    var cid = el.getAttribute("data-cid");
    ui.pending[cid] = Object.assign({}, ui.pending[cid] || {}, { mode: el.value });
  },
  "drawer-target": function (el) {
    var cid = el.getAttribute("data-cid");
    var value = el.getAttribute("data-value");
    var checked = el.checked;
    var deployed = store.get().deployed[cid];
    var pending = ui.pending[cid] || {};
    var cur =
      pending.targets !== undefined
        ? pending.targets.slice()
        : deployed && deployed.targets
          ? deployed.targets.slice()
          : [];
    cur = checked
      ? cur.concat([value])
      : cur.filter(function (t) {
          return t !== value;
        });
    ui.pending[cid] = Object.assign({}, pending, { targets: cur });
  },
};

function objPair(key, value) {
  var o = {};
  o[key] = value;
  return o;
}

/* ─── global event delegation ──────────────────────────────────────────────── */

document.addEventListener("click", function (e) {
  /* close the glossary popover on outside clicks */
  var pop = document.getElementById("term-popover");
  if (termTrigger && pop.classList.contains("open") && !pop.contains(e.target) && !e.target.closest(".term")) {
    closeTerm();
  }
  var el = e.target.closest("[data-action]");
  if (!el) return;
  var action = el.getAttribute("data-action");
  if (actions[action]) {
    e.preventDefault();
    actions[action](el);
  }
});

document.addEventListener("change", function (e) {
  var el = e.target.closest("[data-action]");
  if (!el) return;
  var action = el.getAttribute("data-action");
  if (changeActions[action]) {
    changeActions[action](el);
  }
});

/* Textareas update state silently (no re-render → caret/focus undisturbed). */
document.addEventListener("input", function (e) {
  var el = e.target;
  if (el.tagName === "TEXTAREA" && el.getAttribute("data-action") === "ans-text") {
    var oid = el.getAttribute("data-oid");
    var key = el.getAttribute("data-key");
    var value = el.value;
    store.update(function (s) {
      var cur = Object.assign({}, asRec(s.answers[oid]));
      cur[key] = value;
      var answers = Object.assign({}, s.answers);
      answers[oid] = cur;
      return Object.assign({}, s, { answers: answers });
    }, true);
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (termTrigger) closeTerm();
  }
});

/* ─── boot ─────────────────────────────────────────────────────────────────── */

(function boot() {
  store.load();
  store.subscribe(reconcile);
  reconcile(store.get());
})();
