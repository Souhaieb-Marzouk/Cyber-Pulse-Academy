/**
 * HarborOps Lab — state + persistence (static port).
 * Faithful re-implementation of the original zustand store (src/lib/lab/store.ts):
 *  - single source of truth for mode, objectives, quiz and environment state
 *  - same localStorage key, same partialized fields, same {state, version} envelope
 *    (zustand-persist compatible — a student can even swap between the two builds)
 *  - same save/restore/RESET semantics, including the self-heal timeout guard
 * Adds a tiny subscribe/notify so the UI re-renders only what changes.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "harborops-cv0-004-lab-v1";

  function pristineEnv() {
    return {
      // Berth
      berthPicked: [],
      kernelAnswer: null,
      h1Class: {},
      // Build
      dockerfile: [],
      imageBuilt: false,
      // Registry
      pulled: [],
      m3Answer: null,
      h10Tag: null,
      h10Reason: null,
      // Crane
      deployed: false,
      replicas: 0,
      killCount: 0,
      healedSeen: false,
      updatedTag: null,
      availability: 100, // 100 = full
      pvBound: false,
      restartDone: false,
      ordersDataIntact: null,
      discoveryOn: false,
      fixes: {},
      fixOrder: [],
      h6Picks: [],
      h5Storage: null,
      h5Latency: null,
      // Office
      placement: {},
      justify: {},
      // Customs
      srMap: {},
      residualPick: null,
      // Incident
      incidentPicks: [],
      h3Module: "",
      h3Fix: null,
    };
  }

  function pristine() {
    return {
      mode: null,
      objectives: {},
      env: pristineEnv(),
      quiz: { answers: {}, finished: false },
      feed: [],
      feedSeq: 0,
      clearanceSeen: false,
      hintsOpen: {},
    };
  }

  /** Fields persisted — identical to the original's partialize(). */
  function partialize(s) {
    return {
      mode: s.mode,
      objectives: s.objectives,
      env: s.env,
      quiz: s.quiz,
      feed: s.feed,
      feedSeq: s.feedSeq,
      clearanceSeen: s.clearanceSeen,
      hintsOpen: s.hintsOpen,
    };
  }

  function deepMergeDefaults(base, saved) {
    // Restores saved data while guaranteeing every field exists (forward-compat).
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!saved || typeof saved !== "object") return out;
    Object.keys(saved).forEach(function (k) {
      var b = base ? base[k] : undefined;
      var v = saved[k];
      if (v === null || typeof v !== "object" || Array.isArray(v) || b === null || typeof b !== "object" || Array.isArray(b)) {
        out[k] = v;
      } else {
        out[k] = deepMergeDefaults(b, v);
      }
    });
    return out;
  }

  function fakeClock() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  /* ---------------- store core ---------------- */

  var state = pristine();
  var listeners = new Set();
  var scheduled = false;

  // Restore persisted state (same envelope zustand-persist writes).
  try {
    var raw = global.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      var saved = parsed && typeof parsed === "object" ? (parsed.state || parsed) : null;
      if (saved) {
        state.mode = saved.mode ?? null;
        state.objectives = saved.objectives ?? {};
        state.env = deepMergeDefaults(pristineEnv(), saved.env ?? {});
        state.quiz = { answers: (saved.quiz && saved.quiz.answers) || {}, finished: !!(saved.quiz && saved.quiz.finished) };
        state.feed = Array.isArray(saved.feed) ? saved.feed : [];
        state.feedSeq = typeof saved.feedSeq === "number" ? saved.feedSeq : state.feed.length;
        state.clearanceSeen = !!saved.clearanceSeen;
        state.hintsOpen = saved.hintsOpen ?? {};
      }
    }
  } catch (e) {
    // Corrupt storage → start pristine (same recovery behavior as a fresh visit).
    state = pristine();
  }

  function persist() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: partialize(state), version: 0 }));
    } catch (e) {
      /* storage unavailable (private mode) — lab still runs for the session */
    }
  }

  function getState() {
    return state;
  }

  function notify() {
    listeners.forEach(function (fn) {
      try {
        fn(state);
      } catch (e) {
        // One bad subscriber must not break the rest — but the failure must be
        // visible (a silent catch here once masked a rendering bug).
        if (typeof console !== "undefined" && console.error) {
          console.error("HarborOps subscriber failed:", e);
        }
      }
    });
  }

  /** Batched update: mutate via fn(state), then persist + notify once. */
  function update(fn) {
    fn(state);
    persist();
    if (!scheduled) {
      scheduled = true;
      // Microtask batching mirrors React's automatic batching (burst-safe clicks).
      Promise.resolve().then(function () {
        scheduled = false;
        notify();
      });
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function () { listeners.delete(fn); };
  }

  /* ---------------- actions (1:1 with the original store) ---------------- */

  var actions = {
    setMode: function (m) { update(function (s) { s.mode = m; }); },

    pushFeed: function (text, kind) {
      kind = kind || "info";
      update(function (s) {
        s.feed = s.feed.slice(-80).concat([{ id: s.feedSeq + 1, t: fakeClock(), text: text, kind: kind }]);
        s.feedSeq = s.feedSeq + 1;
      });
    },

    revealHint: function (id) {
      update(function (s) {
        var cur = s.hintsOpen[id] ?? 0;
        var obj = s.objectives[id] ?? { attempts: 0, solved: false, hintsUsed: 0, firstTry: true };
        var used = Math.max(cur, obj.hintsUsed);
        s.hintsOpen = Object.assign({}, s.hintsOpen, (function () { var o = {}; o[id] = cur + 1; return o; })());
        s.objectives = Object.assign({}, s.objectives, (function () { var o = {}; o[id] = Object.assign({}, obj, { hintsUsed: used + 1 }); return o; })());
      });
    },

    markCheck: function (id, pass) {
      update(function (s) {
        var prev = s.objectives[id] ?? { attempts: 0, solved: false, hintsUsed: 0, firstTry: true };
        if (prev.solved) return; // solved objectives are locked
        var next = Object.assign({}, prev, {
          attempts: prev.attempts + 1,
          solved: pass,
          firstTry: pass && prev.attempts === 0,
        });
        var o = {}; o[id] = next;
        s.objectives = Object.assign({}, s.objectives, o);
      });
    },

    setClearanceSeen: function () { update(function (s) { s.clearanceSeen = true; }); },

    // env actions — Berth
    toggleBerthPick: function (id) {
      update(function (s) {
        s.env.berthPicked = s.env.berthPicked.includes(id)
          ? s.env.berthPicked.filter(function (x) { return x !== id; })
          : s.env.berthPicked.concat([id]);
      });
    },
    setKernelAnswer: function (v) { update(function (s) { s.env.kernelAnswer = v; }); },
    setH1Class: function (chip, cls) {
      update(function (s) {
        var o = {}; o[chip] = cls;
        s.env.h1Class = Object.assign({}, s.env.h1Class, o);
      });
    },

    // env actions — Build
    addDfChip: function (id) {
      update(function (s) {
        if (s.env.dockerfile.includes(id)) return;
        s.env.dockerfile = s.env.dockerfile.concat([id]);
      });
    },
    removeDfChip: function (idx) {
      update(function (s) {
        s.env.dockerfile = s.env.dockerfile.filter(function (_, i) { return i !== idx; });
      });
    },
    moveDfChip: function (idx, dir) {
      update(function (s) {
        var arr = s.env.dockerfile.slice();
        var j = idx + dir;
        if (j < 0 || j >= arr.length) return;
        var tmp = arr[idx]; arr[idx] = arr[j]; arr[j] = tmp;
        s.env.dockerfile = arr;
      });
    },
    buildImage: function () {
      update(function (s) {
        if (!s.env.imageBuilt) s.env.imageBuilt = true;
      });
    },

    // env actions — Registry
    pullImage: function (id, name, tag, alreadyExisting) {
      var s = state;
      if (s.env.pulled.includes(id)) return;
      var imgLayers = { "portal-140": 5, "orders-db": 4, "portal-beta": 5, "portal-latest": 0 };
      var total = imgLayers[id] ?? 4;
      actions.pushFeed("Pulling " + name + ":" + tag + " from harbor-registry.internal…", "info");
      if (alreadyExisting > 0) {
        actions.pushFeed(alreadyExisting + " layer(s) ALREADY EXISTS — reusing shared base", "info");
      }
      actions.pushFeed("Downloaded " + Math.max(0, total - alreadyExisting) + " new layer(s) — " + name + ":" + tag + " ready", "good");
      update(function (st) {
        st.env.pulled = st.env.pulled.concat([id]);
      });
    },
    setM3Answer: function (n) { update(function (s) { s.env.m3Answer = n; }); },
    setH10: function (tag, reason) { update(function (s) { s.env.h10Tag = tag; s.env.h10Reason = reason; }); },
    setH10Tag: function (v) { update(function (s) { s.env.h10Tag = v; }); },
    setH10Reason: function (v) { update(function (s) { s.env.h10Reason = v; }); },

    // env actions — Crane
    deploy: function () {
      update(function (s) {
        if (s.env.deployed) return;
        actions.pushFeed("Declared state: cargo-portal, image from pinned tag, replicas pending", "info");
        actions.pushFeed("Cranes scheduled initial replicas across node-01…node-03", "good");
        s.env.deployed = true;
        s.env.replicas = Math.max(1, s.env.replicas || 1);
      });
    },
    setReplicas: function (n) {
      update(function (s) {
        if (!s.env.deployed || n === s.env.replicas) return;
        actions.pushFeed("Scaled cargo-portal to " + n + " replica(s)", n >= 2 ? "good" : "warn");
        if (n < 2) actions.pushFeed("Availability risk: fewer than 2 replicas — a failure now is an outage", "warn");
        s.env.replicas = n;
      });
    },
    /** Delta-nudge reading fresh state — component-scope arithmetic goes stale in bursts. */
    nudgeReplicas: function (delta) {
      update(function (s) {
        if (!s.env.deployed) return;
        var n = Math.min(6, Math.max(0, s.env.replicas + delta));
        if (n === s.env.replicas) return;
        actions.pushFeed("Scaled cargo-portal to " + n + " replica(s)", n >= 2 ? "good" : "warn");
        if (n < 2) actions.pushFeed("Availability risk: fewer than 2 replicas — a failure now is an outage", "warn");
        s.env.replicas = n;
      });
    },
    injectFailure: function () {
      update(function (s) {
        var c = s.env.killCount + 1;
        actions.pushFeed("FAULT INJECTION: cargo-portal-" + (7 + c) + "f9d EXITED (code 1)", "bad");
        // Self-healing arrives ~0.9 s later; if the lab was RESET meanwhile, do not
        // resurrect state (same guard as the original's setTimeout closure).
        global.setTimeout(function () {
          if (state.env.killCount < c) return;
          actions.pushFeed("Self-healing: declared=actual mismatch detected", "info");
          actions.pushFeed("Rescheduled replacement cargo-portal-k2" + c + "vx on node-0" + ((c % 3) + 1), "good");
          update(function (st) { st.env.healedSeen = true; });
        }, 900);
        s.env.killCount = c;
      });
    },
    rollingUpdate: function (tag) {
      update(function (s) {
        // A rollout can be re-run while the previous one degraded capacity (QA-4:
        // otherwise a single-replica update locks the lab out of M12/H9 forever).
        if (s.env.updatedTag === tag && s.env.availability === 100) return;
        var dip = s.env.replicas >= 2 ? 0 : 4;
        var avail = 100 - dip;
        actions.pushFeed("Rolling update: replacing replicas one by one with cargo-portal:" + tag, "info");
        if (dip > 0) {
          actions.pushFeed("Availability dipped to " + avail + "% — single replica stopped before replacement served", "bad");
        } else {
          actions.pushFeed("Zero-downtime: new replicas started before old ones stopped", "good");
        }
        actions.pushFeed("Rollout complete — cargo-portal:" + tag + " live", "good");
        s.env.updatedTag = tag;
        s.env.availability = avail;
      });
    },
    bindPv: function () {
      update(function (s) {
        if (s.env.pvBound) return;
        actions.pushFeed("Persistent volume pv-orders-01 bound to orders-db", "good");
        s.env.pvBound = true;
        var f = {}; f["bind-pv"] = true;
        s.env.fixes = Object.assign({}, s.env.fixes, f);
        s.env.fixOrder = s.env.fixOrder.concat(["bind-pv"]);
      });
    },
    restartOrders: function () {
      update(function (s) {
        var intact = s.env.pvBound;
        actions.pushFeed("orders-db container replaced (restart)", "info");
        if (intact) {
          actions.pushFeed("Data check: cart sessions INTACT — volume re-attached automatically", "good");
        } else {
          actions.pushFeed("Data check: cart sessions LOST — container storage is ephemeral, no volume bound", "bad");
        }
        s.env.restartDone = true;
        s.env.ordersDataIntact = intact;
      });
    },
    toggleDiscovery: function () {
      update(function (s) {
        var on = !s.env.discoveryOn;
        actions.pushFeed(
          on
            ? "Service discovery ON: portal.internal → resolves to live replica IPs via DNS"
            : "Service discovery OFF",
          "info"
        );
        s.env.discoveryOn = on;
      });
    },
    toggleFix: function (id) {
      update(function (s) {
        var cur = !!s.env.fixes[id];
        var next = Object.assign({}, s.env.fixes);
        next[id] = !cur;
        var order = cur ? s.env.fixOrder.filter(function (x) { return x !== id; }) : s.env.fixOrder.concat([id]);
        actions.pushFeed(cur ? "Amendment reverted: " + id : "Amendment applied: " + id, cur ? "warn" : "good");
        s.env.fixes = next;
        s.env.fixOrder = order;
      });
    },
    toggleH6Pick: function (n) {
      update(function (s) {
        s.env.h6Picks = s.env.h6Picks.includes(n)
          ? s.env.h6Picks.filter(function (x) { return x !== n; })
          : s.env.h6Picks.concat([n]);
      });
    },
    setH5: function (storage, latency) { update(function (s) { s.env.h5Storage = storage; s.env.h5Latency = latency; }); },
    setH5Storage: function (v) { update(function (s) { s.env.h5Storage = v; }); },
    setH5Latency: function (v) { update(function (s) { s.env.h5Latency = v; }); },

    // env actions — Office
    setPlacement: function (wid, model) {
      update(function (s) {
        var o = {}; o[wid] = model;
        s.env.placement = Object.assign({}, s.env.placement, o);
      });
    },
    setJustify: function (wid, rid) {
      update(function (s) {
        var o = {}; o[wid] = rid;
        s.env.justify = Object.assign({}, s.env.justify, o);
      });
    },

    // env actions — Customs
    setSr: function (sid, val) {
      update(function (s) {
        var o = {}; o[sid] = val;
        s.env.srMap = Object.assign({}, s.env.srMap, o);
      });
    },
    setResidual: function (v) { update(function (s) { s.env.residualPick = v; }); },

    // env actions — Incident
    toggleIncidentPick: function (id) {
      update(function (s) {
        s.env.incidentPicks = s.env.incidentPicks.includes(id)
          ? s.env.incidentPicks.filter(function (x) { return x !== id; })
          : s.env.incidentPicks.concat([id]);
      });
    },
    setH3Module: function (v) { update(function (s) { s.env.h3Module = v; }); },
    setH3Fix: function (v) { update(function (s) { s.env.h3Fix = v; }); },

    // quiz
    answerQuiz: function (qid, opt) {
      update(function (s) {
        var a = {}; a[qid] = opt;
        s.quiz.answers = Object.assign({}, s.quiz.answers, a);
      });
    },
    finishQuiz: function () { update(function (s) { s.quiz.finished = true; }); },

    resetLab: function () {
      state = pristine();
      persist();
      notify();
    },
  };

  /** Star rating (1–5): first-try accuracy + quiz accuracy − hint cost (F3/C7). */
  function computeStars(objectives, quizCorrect, quizTotal, maxHints) {
    var objs = Object.values(objectives);
    if (objs.length === 0) return 0;
    var solvedRatio = objs.filter(function (o) { return o.solved; }).length / objs.length;
    var firstTryRatio = objs.filter(function (o) { return o.solved && o.firstTry; }).length / Math.max(1, objs.length);
    var quizRatio = quizTotal > 0 ? quizCorrect / quizTotal : 0;
    var hintRatio = Math.min(1, objs.reduce(function (a, o) { return a + o.hintsUsed; }, 0) / Math.max(1, maxHints));
    var score = solvedRatio * 0.4 + firstTryRatio * 0.25 + quizRatio * 0.25 + (1 - hintRatio) * 0.1;
    return Math.max(1, Math.min(5, Math.round(score * 5)));
  }

  global.HarborStore = {
    STORAGE_KEY: STORAGE_KEY,
    getState: getState,
    subscribe: subscribe,
    computeStars: computeStars,
  };
  // Expose every action directly on the store facade.
  Object.keys(actions).forEach(function (k) { global.HarborStore[k] = actions[k]; });
})(window);
