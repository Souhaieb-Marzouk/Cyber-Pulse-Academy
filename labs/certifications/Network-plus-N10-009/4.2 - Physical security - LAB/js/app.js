/* ── app.js ──────────────────────────────────────────────────────────
   Bootstrap + event wiring for the static lab. One delegated listener
   per event type on the app root keeps behavior identical across full
   and targeted re-renders (same pattern role the React tree played).
   ──────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var ST = window.LabState;
  var A = ST.actions;
  var UI = window.LabUI;
  var root = null;
  var lastMode;
  var lastBooted = false;

  /* env-path helper: "matchCam.r1" → patchEnv({matchCam:{...env.matchCam, r1:v}}) */
  function patchPath(path, v) {
    var parts = path.split(".");
    var patch = {};
    if (parts.length === 1) {
      patch[parts[0]] = v;
    } else {
      var cur = ST.get().env[parts[0]];
      var next = Object.assign({}, cur && typeof cur === "object" && !Array.isArray(cur) ? cur : {});
      next[parts[1]] = v;
      patch[parts[0]] = next;
    }
    A.patchEnv(patch);
  }

  /* ── click actions ───────────────────────────────────────────────── */

  var CLICK = {
    "set-mode": function (t) {
      A.setMode(t.getAttribute("data-mode"));
    },
    "open-drawer": function (t) {
      UI.openDrawer(t.getAttribute("data-drawer"));
    },
    "open-reset": function () {
      UI.openModal("reset");
    },
    "confirm-reset": function () {
      A.resetAll();
    },
    "close-layer": function () {
      UI.closeLayer();
    },
    "end-shift": function () {
      UI.openModal("completion");
    },
    "toggle-obj": function (t) {
      var card = t.closest(".obj-card");
      var body = card.querySelector(".obj-body");
      var open = card.classList.toggle("open");
      t.setAttribute("aria-expanded", String(open));
    },
    "check-obj": function (t) {
      A.checkObjective(t.getAttribute("data-id"));
    },
    "hint-obj": function (t) {
      A.useHint(t.getAttribute("data-id"));
    },
    "where-obj": function (t) {
      A.goTo(t.getAttribute("data-id"));
    },
    "mount": function () {
      var env = ST.get().env;
      var zp = env.zoneCam.__pick || "";
      var cp = env.zoneCam.__caml || "";
      if (zp === "idf" && cp) {
        var rest = Object.assign({}, env.zoneCam);
        delete rest.__pick;
        delete rest.__caml;
        rest.idf = cp;
        A.patchEnv({ zoneCam: rest, mountNote: null });
        // the two selects drop their temp picks (same as the original spreading them away)
        var zSel = document.querySelector('select[data-env="zoneCam.__pick"]');
        var cSel = document.querySelector('select[data-env="zoneCam.__caml"]');
        if (zSel) zSel.value = "";
        if (cSel) cSel.value = "";
      } else if (zp && zp !== "idf") {
        var zone = window.LabData.ZONES.filter(function (z) { return z.id === zp; })[0];
        A.patchEnv({
          mountNote: "Rejected: " + (zone ? zone.name : zp) + " already has coverage. Mount the spare on the zone with NO cone.",
        });
      } else {
        A.patchEnv({ mountNote: "Pick a zone and a spare camera first." });
      }
    },
    "lockout-dec": function () {
      var cur = ST.get().env.lockout["DR-IDF-01"] || 0;
      A.patchEnv({ lockout: Object.assign({}, ST.get().env.lockout, { "DR-IDF-01": Math.max(0, Math.min(10, cur - 1)) }) });
    },
    "lockout-inc": function () {
      var cur = ST.get().env.lockout["DR-IDF-01"] || 0;
      A.patchEnv({ lockout: Object.assign({}, ST.get().env.lockout, { "DR-IDF-01": Math.max(0, Math.min(10, cur + 1)) }) });
    },
    "run-audit": function () {
      A.runAudit();
    },
    "chain-add": function (t) {
      var id = t.getAttribute("data-id");
      A.patchEnv({ chain: ST.get().env.chain.concat([id]) });
      UI.rerenderChainArea();
    },
    "chain-up": function (t, e) {
      moveChain(parseInt(t.getAttribute("data-idx"), 10), -1, e);
    },
    "chain-down": function (t, e) {
      moveChain(parseInt(t.getAttribute("data-idx"), 10), 1, e);
    },
    "pick-option": function (t) {
      if (t.disabled) return;
      var qid = t.getAttribute("data-qid");
      var idx = parseInt(t.getAttribute("data-idx"), 10);
      var fs = t.closest(".quiz-item");
      fs.querySelectorAll(".quiz-opt").forEach(function (o) {
        var picked = o === t;
        o.classList.toggle("opt-picked", picked);
        o.classList.toggle("opt-idle", !picked);
        o.setAttribute("aria-checked", String(picked));
        var dot = o.querySelector(".opt-radio");
        if (dot) dot.classList.toggle("opt-radio-on", picked);
      });
      var cb = fs.querySelector('[data-action="check-quiz"]');
      if (cb) cb.disabled = false;
      A.setQuizAnswer(qid, idx);
    },
    "check-quiz": function (t) {
      var qid = t.getAttribute("data-qid");
      A.checkQuizItem(qid);
      // re-render only this fieldset (options lock; explanation shows)
      var fsEl = document.querySelector('.quiz-item[data-quiz="' + qid + '"]');
      if (fsEl) {
        var bank = ST.get().mode === "hard" ? window.LabData.QUIZ_HARD : window.LabData.QUIZ_MEDIUM;
        var qi = bank.findIndex(function (q) { return q.id === qid; });
        var fresh = document.createElement("template");
        fresh.innerHTML = UI.quizItemHtml(bank[qi], qi).trim();
        fsEl.replaceWith(fresh.content.firstElementChild);
      }
      updateQuizBanner();
    },
  };

  function moveChain(i, dir, e) {
    var chain = ST.get().env.chain.slice();
    var j = i + dir;
    if (j < 0 || j >= chain.length) return;
    var tmp = chain[i];
    chain[i] = chain[j];
    chain[j] = tmp;
    A.patchEnv({ chain: chain });
    UI.rerenderChainArea();
  }

  function updateQuizBanner() {
    var body = document.querySelector(".quiz-body");
    if (!body || !ST.get().quiz.completed) return;
    if (body.querySelector(".quiz-complete")) return;
    var score = ST.select.quizScore(ST.get().mode, ST.get().quiz);
    var p = document.createElement("p");
    p.className = "quiz-complete";
    p.setAttribute("role", "status");
    p.textContent = "Quiz complete — " + score.correct + "/" + score.total + ". Hit END SHIFT when the checklist is done.";
    body.appendChild(p);
  }

  function onClick(e) {
    var sw = e.target.closest("[data-switch]");
    if (sw && root.contains(sw)) {
      toggleSwitch(sw);
      return;
    }
    var t = e.target.closest("[data-action]");
    if (!t || !root.contains(t)) return;
    var fn = CLICK[t.getAttribute("data-action")];
    if (fn) fn(t, e);
  }

  /* ── change/input events ─────────────────────────────────────────── */

  function onChange(e) {
    var t = e.target;
    if (!root.contains(t)) return;

    if (t.matches("select[data-env]")) {
      patchPath(t.getAttribute("data-env"), t.value);
      return;
    }

    if (t.matches("input[type=checkbox][data-keymark]")) {
      var id = t.getAttribute("data-keymark");
      var marks = Object.assign({}, ST.get().env.keyMarks);
      marks[id] = t.checked;
      A.patchEnv({ keyMarks: marks });
      return;
    }
  }

  function onInput(e) {
    var t = e.target;
    if (!root.contains(t)) return;

    if (t.matches("input[type=range][data-env]")) {
      var v = parseInt(t.value, 10);
      var lbl = document.getElementById("retention-value");
      if (lbl) lbl.textContent = v + " days";
      t.setAttribute("aria-label", "Retention in days: " + v);
      patchPath(t.getAttribute("data-env"), v);
      return;
    }

    if (t.matches("input[data-env]")) {
      patchPath(t.getAttribute("data-env"), t.value);
      return;
    }
  }

  /* switches: button[role=switch][data-switch] */
  function toggleSwitch(btn) {
    var path = btn.getAttribute("data-switch").split(".");
    var cur = ST.get().env[path[0]];
    var curVal = !!(cur && cur[path[1]]);
    var next = Object.assign({}, cur);
    next[path[1]] = !curVal;
    A.patchEnv((function () {
      var p = {};
      p[path[0]] = next;
      return p;
    })());
    btn.classList.toggle("on", !curVal);
    btn.setAttribute("aria-checked", String(!curVal));
  }

  /* ── keyboard: ESC closes layers, Tab is trapped inside them ─────── */

  function onKeyDown(e) {
    var open = UI.layerOpen();
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      UI.closeLayer();
      return;
    }
    if (e.key === "Tab") {
      var container = open.type === "drawer"
        ? document.getElementById("drawer")
        : document.getElementById("modal");
      if (container) UI.trapTab(e, container);
    }
  }

  function onOverlayClick(e) {
    if (e.target.id === "drawer-overlay" || e.target.id === "modal-overlay") {
      UI.closeLayer();
    }
  }

  /* ── store subscription: full render on mode change, sync otherwise ─ */

  function onNotify() {
    var st = ST.get();
    if (st.mode !== lastMode || st.booted !== lastBooted) {
      lastMode = st.mode;
      lastBooted = st.booted;
      UI.renderApp(root);
      UI.sync();
      return;
    }
    UI.sync();
  }

  /* ── boot ────────────────────────────────────────────────────────── */

  function boot() {
    root = document.getElementById("app");
    if (window.LabData.CHAIN_ITEMS) {
      UI.setChainDisplayOrder(UI.computeChainDisplayOrder());
    }

    // restore persisted session BEFORE first UI paint (zustand skipHydration parity).
    // The boot frame renders first — exactly one paint, like the original async rehydrate.
    try {
      ST.rehydrate();
    } catch (e) {
      /* corrupt storage → pristine */
    }
    lastMode = ST.get().mode;
    UI.renderApp(root); // boot screen (state.booted is still false)

    ST.subscribe(onNotify);
    root.addEventListener("click", onClick);
    root.addEventListener("change", onChange);
    root.addEventListener("input", onInput);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onOverlayClick, true);

    window.setTimeout(function () {
      A.setBooted(); // notify → onNotify sees booted flip → full render
    }, 30);

    // reshuffle the failure-chain shelf on RESET (remount parity with useMemo([]))
    ST.subscribe(function () {
      var st = ST.get();
      if (!st.mode) {
        UI.setChainDisplayOrder(UI.computeChainDisplayOrder());
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
