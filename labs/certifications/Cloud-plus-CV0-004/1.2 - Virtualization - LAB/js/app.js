// THE ISOLATION FOUNDRY — js/app.js
// Single-page lab shell (no site nav, no footer — in-lab chrome only).
// Boot + persistence restore + region renderer + header / mode gate /
// briefing / work-order dock / ops log / wrap-up debrief / completion forge.
(function (F) {
  "use strict";

  var h = F.h, cn = F.cn, iconEl = F.iconEl;
  var state = function () { return F.getState(); };

  /* ---------------- UI-only state (React useState equivalents; NOT persisted) ---------------- */
  var ui = {
    benchTab: "calibration",        // LabProvider useState (session-only)
    dockCollapsed: false,           // WorkOrders collapse
    dockOpenId: null,               // WorkOrders open card
    logOpen: false,                 // OpsLog expand
    forgeOpen: false,               // completion modal open
    accordionOpen: ["what"],        // CoreTabs accordion default
    refTab: "core",                 // CoreTabs active tab
  };

  F.benchTabValue = function () { return ui.benchTab; };
  F.setBenchTab = function (t) { ui.benchTab = t; };

  function resetUiState() {
    ui.benchTab = "calibration";
    ui.dockCollapsed = false;
    ui.dockOpenId = null;
    ui.logOpen = false;
    ui.forgeOpen = false;
    ui.accordionOpen = ["what"];
    ui.refTab = "core";
    F.floorUi.deckSel = null;
    F.floorUi.mold = null;
    F.floorUi.selected = { fl01: null, fl02: null };
  }

  var STAGES = [
    { id: "brief", n: 1, label: "Intake brief", icon: "ScrollText" },
    { id: "floor", n: 2, label: "Foundry floor", icon: "Factory" },
    { id: "audit", n: 3, label: "Readiness audit", icon: "ClipboardCheck" },
    { id: "wrap", n: 4, label: "Wrap-up", icon: "Hammer" },
  ];

  /* ============================ render pipeline ============================ */

  var mainEl, headerEl, dockEl, swapping = false;

  function renderHeader() {
    var s = state();
    if (!s.mode) { headerEl.replaceChildren(); headerEl.hidden = true; return; }
    headerEl.hidden = false;
    F.rebuildRegion(headerEl, buildHeader);
  }

  function renderDock() {
    var s = state();
    if (!s.mode || s.stage === "brief") { dockEl.replaceChildren(); return; }
    F.rebuildRegion(dockEl, function () {
      return h("div", { class: "dock-stack" }, opsLog(), workOrders());
    });
  }

  function renderMainContents() {
    var s = state();
    if (!s.mode) return modeGate();
    if (s.stage === "brief") return briefing(s.mode);
    if (s.stage === "floor") return F.renderFloor(benchPanelFor(s.mode));
    if (s.stage === "audit") return F.renderQuiz(auditDone);
    if (s.stage === "wrap") return debrief();
    return h("div", null);
  }

  function benchPanelFor(mode) {
    // build the bench panel fresh (tabs controlled by ui.benchTab)
    var tabs = mode === "medium"
      ? [["calibration", "Calibration", "Layers"], ["artifacts", "Artifacts", "FileCode2"],
         ["telemetry", "Telemetry", "Gauge"], ["ops", "Floor ops", "Wrench"], ["concepts", "Concepts", "ScrollText"]]
      : [["rfp", "RFP", "ClipboardList"], ["survey", "Site survey", "Server"],
         ["evidence", "Night evidence", "FileCode2"], ["runbook", "Runbook", "Wrench"],
         ["audit-iso", "Isolation audit", "ShieldCheck"], ["scale", "Scale call", "Gauge"],
         ["faas", "FaaS fit", "Zap"], ["tenancy", "Tenancy design", "Boxes"]];
    var ids = tabs.map(function (t) { return t[0]; });
    var active = ids.indexOf(ui.benchTab) !== -1 ? ui.benchTab : ids[0];
    var contents = {
      calibration: F.benchContent("calibration"), artifacts: F.benchContent("artifacts"),
      telemetry: F.benchContent("telemetry"), ops: F.benchContent("ops"),
      concepts: F.benchContent("concepts"), rfp: F.benchContent("rfp"),
      survey: F.benchContent("survey"), evidence: F.benchContent("evidence"),
      runbook: F.benchContent("runbook"), "audit-iso": F.benchContent("audit-iso"),
      scale: F.benchContent("scale"), faas: F.benchContent("faas"),
      tenancy: F.benchContent("tenancy"),
    };
    return F.panel({
      title: "Triage bench", sub: "Workspaces for the bench-side work orders", className: "bench-panel",
      children: F.tabs({
        ariaLabel: "Bench workspaces", wrap: true, value: active,
        onChange: function (id) { ui.benchTab = id; },
        items: tabs.map(function (t) {
          return { id: t[0], label: t[1], icon: t[2], content: contents[t[0]] };
        }),
      }),
    });
  }

  F.buildBenchPanel = benchPanelFor; // used by floor.js rerenderBench

  function renderMain(instant) {
    if (instant || !supportsAnimation()) {
      F.rebuildRegion(mainEl, renderMainContents);
      return;
    }
    if (swapping) { F.rebuildRegion(mainEl, renderMainContents); return; }
    swapping = true;
    mainEl.classList.add("stage-exit");
    window.setTimeout(function () {
      F.rebuildRegion(mainEl, renderMainContents);
      mainEl.classList.remove("stage-exit");
      mainEl.classList.add("stage-enter");
      window.setTimeout(function () {
        mainEl.classList.remove("stage-enter");
        swapping = false;
      }, 240);
    }, 150);
  }
  F.renderMain = renderMain;

  function supportsAnimation() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  F.render = function (region) {
    if (region === "header") renderHeader();
    else if (region === "dock") renderDock();
    else if (region === "main") renderMain(true);
  };

  /* ---------------- store subscription: action → affected regions ---------------- */

  F.subscribe(function (s, action) {
    var t = action.t;
    if (t === "mode") {
      resetUiState();
      renderMain(false); renderDock(); renderHeader();
    } else if (t === "stage") {
      if (s.stage === "audit") F.resetQuizPos();
      renderMain(false); renderDock(); renderHeader();
    } else if (t === "reset") {
      resetUiState();
      renderMain(false); renderDock(); renderHeader();
    } else if (t === "place" || t === "remove" || t === "migrate") {
      F.rerenderFloorPanels(); renderDock(); renderHeader();
    } else if (t === "toggleOp") {
      F.rerenderFloorPanels();
    } else if (t === "check" || t === "hint") {
      renderDock(); renderHeader(); // header counter + stage gating update live
    } else if (t === "quizAnswer" || t === "quizCheck" || t === "quizDone") {
      renderMain(true);
      if (t === "quizDone") renderDock();
    } else if (t === "seqMed" || t === "seqMedClear" || t === "seqHard" || t === "seqHardClear" ||
               t === "runbook" || t === "runbookClear" || t === "setTf" || t === "toggleLine" ||
               t === "toggleFaas" || t === "setScale") {
      F.rerenderBench();
    }
    // remaining actions only write state that validators read at CHECK time
  });

  /* ============================ header ============================ */

  function buildHeader() {
    var s = state();
    var mode = s.mode;
    var stars = F.computeStars(s.objs, mode);
    var list = F.objectivesFor(mode);
    var doneCount = list.filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length;
    var total = list.length;

    function unlocked(id) {
      if (id === "brief" || id === "floor") return true;
      if (id === "audit") return stars.complete;
      if (id === "wrap") return s.quizDone;
      return false;
    }

    var nav = h("nav", { class: "stage-nav foundry-scroll", "aria-label": "Shift stages" },
      STAGES.map(function (st) {
        var active = s.stage === st.id;
        var open = unlocked(st.id);
        return F.button({
          variant: "outline", disabled: !open, fk: "stage-" + st.id,
          ariaLabel: st.label,
          className: cn("stage-btn", active && "stage-btn-active", !active && open && "stage-btn-open", !open && "stage-btn-locked"),
          onClick: function () { if (open) F.dispatch({ t: "stage", stage: st.id }); },
          children: [iconEl(st.icon, 11), h("span", { class: "stage-btn-num" }, st.n + "·"), st.label],
          ariaCurrent: active ? "page" : null,
        });
      }));

    return h("div", { class: "header-inner" },
      h("div", { class: "header-brand" },
        iconEl("Flame", 16, "text-ember"),
        h("div", { class: "header-titles" },
          h("div", { class: "header-title" }, F.LAB_TITLE),
          h("div", { class: "header-sub" }, F.LAB_SUB))),
      nav,
      h("div", { class: "header-actions" },
        h("span", {
          class: "mode-badge " + (mode === "medium" ? "mode-badge-medium" : "mode-badge-hard"),
          "aria-label": "Difficulty mode: " + mode,
        }, mode),
        h("span", { class: "header-counter", "aria-live": "polite" }, doneCount + "/" + total + " orders"),
        F.button({
          variant: "outline", size: "sm", fk: "reset", className: "header-reset",
          onClick: function () {
            F.confirmReset(function () { F.clearState(); F.dispatch({ t: "reset" }); });
          },
          children: [iconEl("RotateCcw", 11), "Reset"],
        })));
  }

  /* ============================ mode gate ============================ */

  var PILLAR_DESC = {
    P1: "Explain what virtualization is, how hypervisors work, and why clouds are built on them.",
    P2: "Recognize each technology in manifests, intake cards and trade-off calls — VM vs container vs microVM vs function vs VDI.",
    P3: "Read the floor's telemetry: CPU ready time, ballooning, snapshot sprawl, replica drift — and diagnose what they mean.",
    P4: "Govern the floor: reservations, limits, anti-affinity, patch runbooks, isolation boundaries — and name residual risk.",
  };

  function modeGate() {
    var cards = ["medium", "hard"].map(function (m) {
      var c = F.MODE_CARDS[m];
      return F.panel({
        title: m === "medium" ? "Difficulty · Medium" : "Difficulty · Hard",
        sub: c.tagline,
        tone: m === "medium" ? "#3ED6C0" : "#F07E5A",
        right: h("span", { class: "badge-outline " + (m === "medium" ? "badge-teal" : "badge-coral") },
          m === "medium" ? "guided path" : "open floor"),
        children: [
          h("div", { class: "mode-card-title" }, c.title),
          h("ul", { class: "mode-card-bullets" },
            c.bullets.map(function (b) {
              return h("li", null, h("span", { class: "mode-card-dot", "aria-hidden": "true" }), b);
            })),
          F.button({
            className: "mode-card-cta", ariaLabel: c.cta + " — " + c.title + " difficulty",
            onClick: function () { F.dispatch({ t: "mode", mode: m }); },
            children: [c.cta, iconEl("ArrowRight", 14)],
          }),
        ],
      });
    });

    var pillars = Object.keys(F.PILLARS).map(function (p) {
      return h("div", { class: "pillar-card" },
        F.pillarBadge(p),
        h("div", { class: "pillar-label" }, F.PILLARS[p].label),
        h("p", { class: "pillar-desc" }, PILLAR_DESC[p]));
    });

    return h("div", { class: "gate" },
      h("div", { class: "gate-hero anim-rise" },
        h("div", { class: "eyebrow" }, iconEl("Factory", 14, "text-ember"),
          "Cloud+ CV0-004 · Domain 1 · Lesson 1.2 · interactive field lab"),
        h("h1", { class: "gate-title" }, "THE ISOLATION", h("br"), h("span", { class: "text-ember" }, "FOUNDRY")),
        h("p", { class: "gate-sub" },
          F.LAB_SUB + ". Cast tenant workloads into the right isolation molds, keep a shared floor healthy, and pass the readiness audit — from “I read about virtualization” to “I can run it.”"),
        h("div", { class: "gate-notes" },
          F.syntheticNote(),
          h("span", { class: "gate-note-line" }, "defensive · educational · no real systems touched"))),
      h("div", { class: "gate-cards anim-rise-slow" }, cards),
      h("div", { class: "gate-pillars anim-fade" },
        F.panel({
          title: "What mastery looks like", sub: "Four pillars — every work order feeds one of them",
          children: h("div", { class: "pillar-grid" }, pillars),
        })));
  }

  /* ============================ briefing (stage 1) ============================ */

  function briefing(mode) {
    var scenario = F.panel({
      title: "Scenario · your first shift",
      sub: "Fictional organization: " + F.SCENARIO.org + " (regional cloud provider)",
      children: [
        h("div", { class: "scenario-lines" }, F.SCENARIO.lines.map(function (l) { return h("p", null, l); })),
        h("div", { class: "cert-box" },
          h("div", { class: "cert-box-head" }, iconEl("Lightbulb", 12), "Certification relevance"),
          h("p", null,
            "Cloud+ CV0-004 expects you to ", h("strong", { class: "text-foreground" },
            "explain virtualization technologies and their role in cloud environments"),
            ": hypervisor types, VM anatomy and lifecycle, containers/microVMs/serverless, VDI — and how pooling, multitenancy and elasticity rest on all of it. Every work order on this floor trains one of those.")),
        F.button({
          className: "brief-cta",
          onClick: function () { F.dispatch({ t: "stage", stage: "floor" }); },
          children: [iconEl("Flame", 14), "Step onto the foundry floor", iconEl("ArrowRight", 14)],
        }),
      ],
    });

    var forge = F.panel({
      title: "The reference forge",
      sub: "Knowledge core — five reads that unlock every work order (reopens anytime from the floor)",
      children: coreTabs(),
    });

    var catalog = F.panel({
      title: "Mold catalog", sub: "Five casts you will make today",
      children: h("ul", { class: "catalog-list" },
        [
          ["Full Enclosure — Virtual Machine", "Guest OS + virtual hardware. Strongest boundary, heaviest."],
          ["Shared Frame — Container", "Host kernel via namespaces/cgroups. Tiny and fast."],
          ["Slim Shell — MicroVM", "VM-grade isolation, ~125 ms boots (simplified)."],
          ["Disposable Stamp — Function/FaaS", "Event-driven, scale-to-zero, per-call billing."],
          ["Deck Lease — VDI pool", "Centralized desktops streamed to endpoints."],
        ].map(function (pair) {
          return h("li", { class: "catalog-item" },
            h("div", { class: "catalog-title" }, pair[0]),
            h("div", { class: "catalog-desc" }, pair[1]));
        })),
    });

    var rules = F.panel({
      title: "Floor rules", sub: "How the shift runs",
      children: h("ul", { class: "rules-list" },
        [
          ["BookOpenText", "Work orders live in the dock at the bottom — open their workspace, act, then hit CHECK RESULTS."],
          ["Boxes", "The forge refuses pours that would overcommit a host — capacity is a design constraint, not a suggestion."],
          ["ShieldCheck", "Every check teaches: accepted answers explain why it matters; rejected ones show the fix."],
        ].map(function (pair) {
          return h("li", null, iconEl(pair[0], 14, "text-container"), pair[1]);
        })),
    });

    return h("div", { class: "brief" },
      h("div", { class: "stage-topline" },
        h("div", { class: "eyebrow" }, "Shift stage 1/4 · Intake brief · " + (mode === "medium" ? "Apprentice shift" : "Night shift")),
        F.syntheticNote()),
      h("div", { class: "brief-grid" },
        h("div", { class: "brief-left" }, scenario, forge),
        h("div", { class: "brief-right" }, catalog, rules)));
  }

  function coreTabs() {
    var coreContent = F.accordion({
      items: F.CORE.map(function (sec) {
        return {
          id: sec.id, title: sec.title,
          content: h("div", { class: "core-body" },
            sec.body.map(function (p) { return h("p", null, p); }),
            sec.tip ? h("p", { class: "exam-tip" },
              h("span", { class: "exam-tip-label" }, "Exam tip · "), sec.tip) : null),
        };
      }),
      openIds: ui.accordionOpen,
      onToggle: function (id) {
        var i = ui.accordionOpen.indexOf(id);
        if (i === -1) ui.accordionOpen.push(id); else ui.accordionOpen.splice(i, 1);
        F.rerenderCoreTabs();
      },
    });
    var wallContent = h("div", null,
      h("div", { class: "wall-grid" },
        F.INDUSTRY_EXAMPLES.map(function (e) {
          return h("div", { class: "bench-card" },
            h("div", { class: "wall-item-top" },
              h("div", { class: "wall-item-title" }, e.title),
              h("span", { class: "badge-outline badge-mono" }, e.tag)),
            h("p", { class: "wall-item-body" }, e.body));
        })),
      h("p", { class: "wall-foot" }, "All examples are real-world industry patterns, simplified for training."));
    var glossContent = h("ul", { class: "gloss-list foundry-scroll", "data-scrollkeep": "gloss" },
      F.GLOSSARY.map(function (g) {
        return h("li", { class: "bench-card gloss-item" },
          h("div", { class: "gloss-item-top" },
            h("span", { class: "gloss-term" }, g.term),
            h("span", { class: "gloss-ring" }, g.ring)),
          h("p", { class: "gloss-def" }, g.def));
      }));

    return F.tabs({
      ariaLabel: "Reference sections", wrap: true, value: ui.refTab,
      onChange: function (id) { ui.refTab = id; },
      items: [
        { id: "core", label: "Knowledge core", icon: "BookOpenText", content: coreContent },
        { id: "wall", label: "Industry wall", icon: "Factory", content: wallContent },
        { id: "gloss", label: "Glossary", icon: "Boxes", content: glossContent },
      ],
    });
  }
  F.rerenderCoreTabs = function () {
    // re-render the accordion in place (briefing stage)
    var main = document.getElementById("main");
    var panelBodies = main.querySelectorAll(".panel-body");
    if (panelBodies.length >= 2) {
      F.rebuildRegion(panelBodies[1], coreTabs);
    }
  };
  F.benchContent = function (id) {
    // bridge: floor.js owns the bench workspace builders
    return F.benchBuilders[id]();
  };

  /* ============================ work orders dock ============================ */

  function workOrders() {
    var s = state();
    var mode = s.mode || "medium";
    var list = F.objectivesFor(mode);
    var doneCount = list.filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length;
    var stars = F.computeStars(s.objs, mode);
    var allDone = stars.complete;
    var nudgesTaken = list.reduce(function (n, o) { return n + ((s.objs[o.id] && s.objs[o.id].hints) || 0); }, 0);

    function byPillar(p) {
      var sub = list.filter(function (o) { return o.pillar === p; });
      return {
        done: sub.filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length,
        total: sub.length,
      };
    }
    var pillarBars = Object.keys(F.PILLARS).map(function (p) {
      var b = byPillar(p);
      var ticks = [];
      for (var i = 0; i < b.total; i++) {
        ticks.push(h("span", { class: "pillar-tick", style: "background:" + (i < b.done ? F.PILLARS[p].color : "#3A331F") }));
      }
      return h("span", { class: "pillar-bar", title: F.PILLARS[p].label + ": " + b.done + "/" + b.total },
        h("span", { class: "pillar-ticks", "aria-hidden": "true" }, ticks));
    });

    var cards = list.map(function (o, idx) {
      return workOrderCard(o, idx, mode, nudgesTaken >= 1 && mode === "hard");
    });

    var bodyChildren = [
      h("ul", { class: "wo-list foundry-scroll", "aria-label": "Work order list", "data-scrollkeep": "wo" }, cards),
      allDone ? h("div", { class: "wo-allclear" }, "all work orders closed — proceed to the audit stage") : null,
    ];

    return h("div", { class: "wo-dock" },
      h("button", {
        class: "wo-dock-toggle", onClick: function () { ui.dockCollapsed = !ui.dockCollapsed; renderDock(); },
        "aria-expanded": !ui.dockCollapsed, fk: "dock-toggle",
      },
        h("div", { class: "wo-dock-toggle-left" },
          h("span", { class: "wo-dock-title" }, "Work orders"),
          h("span", { class: cn("wo-dock-count", allDone && "text-container") },
            doneCount + "/" + list.length + " closed" + (allDone ? " · floor clear" : "")),
          h("span", { class: "wo-pillars", "aria-label": "Pillar progress" }, pillarBars)),
        h("div", { class: "wo-dock-toggle-right" },
          allDone ? iconEl("CheckCircle2", 15, "text-container") : null,
          iconEl("ChevronDown", 15, cn("wo-chevron", ui.dockCollapsed && "chevron-open")))),
      !ui.dockCollapsed ? h("div", { class: "wo-dock-body" }, bodyChildren) : null);
  }

  function workOrderCard(o, idx, mode, nudgeBudgetUsed) {
    var s = state();
    var prog = s.objs[o.id];
    var fb = s.feedback[o.id];
    var done = !!(prog && prog.done);
    var hintsShown = (prog && prog.hints) || 0;
    var open = ui.dockOpenId === o.id;

    var head = h("button", {
      class: "wo-card-toggle", onClick: function () {
        ui.dockOpenId = open ? null : o.id; renderDock();
      },
      "aria-expanded": open, fk: "wo-" + o.id,
    },
      done ? iconEl("CheckCircle2", 16, "text-container") : iconEl("Circle", 16, "text-muted"),
      h("span", { class: "wo-index" }, String(idx + 1).padStart(2, "0")),
      F.pillarBadge(o.pillar, true),
      h("span", { class: cn("wo-title", done && "wo-title-done") }, o.title),
      iconEl("ChevronDown", 13, cn("wo-chevron", open && "chevron-open")));

    var body = null;
    if (open) {
      body = h("div", { class: "wo-card-body" },
        h("p", { class: "wo-detail" }, o.detail),
        h("div", { class: "wo-actions" },
          F.button({
            variant: "outline", size: "sm", className: "wo-open-panel", fk: "wo-open-" + o.id,
            onClick: function () { openPanel(o.panel); },
            children: [iconEl("Crosshair", 11), F.PANEL_LABEL[o.panel] || o.panel],
          }),
          F.button({
            size: "sm", disabled: done, fk: "wo-check-" + o.id,
            className: done ? "wo-check-done" : "wo-check",
            onClick: function () { F.dispatch({ t: "check", objId: o.id }); },
            children: done ? "Accepted ✓" : "Check results",
          }),
          !done ? hintButton(mode, hintsShown, o.hints.length, nudgeBudgetUsed, o.id) : null),
        hintsShown > 0 ? h("ol", { class: "wo-hints", "aria-label": "Hints" },
          o.hints.slice(0, hintsShown).map(function (hint, i) {
            return h("li", { class: "wo-hint" },
              iconEl("Lightbulb", 11, "text-ember"),
              h("span", null, h("span", { class: "wo-hint-num" }, "hint " + (i + 1) + " · "), hint));
          })) : null,
        fb ? F.checkFeedback(fb) : null,
        h("p", { class: "wo-covers" }, "covers · " + o.anchor));
    }

    return h("li", { class: cn("wo-card", done && "wo-card-done", open && "wo-card-open") }, head, body);
  }

  function hintButton(mode, shown, total, budgetUsed, objId) {
    if (mode === "hard") {
      return shown > 0 || budgetUsed
        ? h("span", { class: "hint-spent" }, iconEl("Lock", 9), shown > 0 ? "nudge taken" : "nudge budget spent")
        : F.button({
            variant: "outline", size: "sm", className: "wo-hint-btn", fk: "wo-hint-" + objId,
            onClick: function () { F.dispatch({ t: "hint", objId: objId, costNote: true }); },
            children: [iconEl("Lightbulb", 11), "Nudge (−stars)"],
          });
    }
    return shown >= total
      ? h("span", { class: "hint-spent" }, "all hints shown")
      : F.button({
          variant: "outline", size: "sm", className: "wo-hint-btn", fk: "wo-hint-" + objId,
          onClick: function () { F.dispatch({ t: "hint", objId: objId }); },
          children: [iconEl("Lightbulb", 11), "Hint " + (shown + 1) + "/" + total],
        });
  }

  function openPanel(tab) {
    var s = state();
    ui.benchTab = tab;
    if (s.stage !== "floor") F.dispatch({ t: "stage", stage: "floor" });
    else F.rerenderBench();
  }

  /* ============================ ops log ============================ */

  function opsLog() {
    var s = state();
    var last = s.log[s.log.length - 1];
    return h("div", { class: "ops-log", "aria-live": "polite", role: "log", "aria-label": "Floor operations log" },
      h("button", {
        class: "ops-log-toggle", onClick: function () { ui.logOpen = !ui.logOpen; renderDock(); },
        "aria-expanded": ui.logOpen, fk: "log-toggle",
      },
        iconEl("Wrench", 11, "text-ember"),
        h("span", { class: "ops-log-last" },
          last ? "T+" + String(last.n).padStart(3, "0") + " · " + last.text
               : "floor log ready — actions will stream here"),
        h("span", { class: "ops-log-meta" }, ui.logOpen ? "hide log" : "log · " + s.log.length)),
      ui.logOpen ? h("ul", { class: "ops-log-list foundry-scroll", "data-scrollkeep": "log" },
        s.log.slice().reverse().map(function (l) {
          return h("li", {
            class: cn("ops-log-line",
              l.kind === "good" ? "ops-log-good" : l.kind === "bad" ? "ops-log-bad" : ""),
          }, "T+" + String(l.n).padStart(3, "0") + " · " + l.text);
        })) : null);
  }

  /* ============================ audit done → wrap ============================ */

  function auditDone() {
    // completion modal opens when the audit is submitted with every order closed
    F.dispatch({ t: "stage", stage: "wrap" });
    var s = state();
    if (!s.completedShown) {
      var stars = F.computeStars(s.objs, s.mode || "medium");
      if (stars.complete) {
        ui.forgeOpen = true;
        openForge();
        F.dispatch({ t: "completedShown" });
      }
    }
  }

  /* ============================ wrap-up debrief (stage 4) ============================ */

  function debrief() {
    var s = state();
    var mode = s.mode || "medium";
    var stars = F.computeStars(s.objs, mode);
    var res = F.quizResult(s.quizAnswers, mode);
    var doneCount = F.objectivesFor(mode).filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length;
    var total = F.objectivesFor(mode).length;

    function listOf(items, icon, cls) {
      return h("ul", { class: "debrief-list" },
        items.map(function (b, i) {
          return h("li", null, iconEl(icon, 13, cls), b);
        }));
    }

    var grid = h("div", { class: "debrief-grid" },
      F.panel({
        title: "Observability — what the floor tells you", sub: "Detection opportunities: signal → meaning → move",
        children: h("ul", { class: "debrief-cards" },
          F.DEBRIEF.observability.map(function (o) {
            return h("li", { class: "bench-card" },
              h("div", { class: "debrief-card-head" }, iconEl("Radar", 12, "text-container"), o.signal),
              h("p", { class: "debrief-card-body" }, o.meaning));
          })),
      }),
      F.panel({
        title: "Mitigations — the governance toolbox", sub: "What a defender applies, in order of need",
        children: h("ul", { class: "debrief-cards" },
          F.DEBRIEF.mitigations.map(function (m) {
            return h("li", { class: "bench-card" },
              h("div", { class: "debrief-card-head" }, iconEl("ShieldAlert", 12, "text-ember"), m.control),
              h("p", { class: "debrief-card-body" }, m.note));
          })),
      }),
      F.panel({ title: "Blue-team takeaways", sub: "Habits that keep floors healthy", children: listOf(F.DEBRIEF.blue, "CheckCircle2", "text-container") }),
      F.panel({ title: "Red-team mindset", sub: "Know the attack surface to defend it — defensive framing only", children: listOf(F.DEBRIEF.red, "Swords", "text-microvm") }),
      F.panel({ title: "Exam map", sub: "What this lab covered — and where the domain goes next", children: listOf(F.DEBRIEF.examMap, "BookMarked", "text-ember") }),
      F.panel({
        title: "Official references", sub: "Open in a new tab — verify against the source",
        children: h("ul", { class: "debrief-list" },
          F.DEBRIEF.links.map(function (l) {
            return h("li", null, h("a", {
              class: "ref-link", href: l.url, target: "_blank", rel: "noopener noreferrer",
            }, iconEl("ExternalLink", 12), l.label));
          })),
      }));

    var result = h("div", { class: "shift-result" },
      h("div", { class: "shift-result-label" }, "Shift result"),
      h("div", { class: "shift-result-strip" },
        h("span", { class: "shift-result-stat" }, iconEl("Hammer", 14, "text-ember"), " work orders " + doneCount + "/" + total),
        h("span", { class: "shift-result-stat" }, iconEl("BookMarked", 14, "text-ember"), " audit " + res.correct + "/" + res.total),
        F.stars(stars.stars)),
      F.button({
        className: "shift-result-cta",
        onClick: function () { ui.forgeOpen = true; openForge(); },
        children: [iconEl("Flame", 14), "Close the shift — forge the report"],
      }));

    return h("div", { class: "stage-wrap stage-wrap-debrief" },
      h("div", { class: "stage-topline" },
        h("div", { class: "eyebrow" }, "Shift stage 4/4 · Wrap-up · field notes"),
        F.syntheticNote()),
      grid, result);
  }

  /* ============================ completion forge (modal) ============================ */

  var PILLAR_PANEL_LABEL = {
    calibration: "calibration", artifacts: "artifacts", telemetry: "telemetry", ops: "floor ops",
    concepts: "concepts", floor: "floor", rfp: "RFP", survey: "survey", evidence: "evidence",
    runbook: "runbook", "audit-iso": "isolation audit", scale: "scale call", faas: "FaaS fit", tenancy: "tenancy",
  };

  function openForge() {
    var s = state();
    var mode = s.mode || "medium";
    var list = F.objectivesFor(mode);
    var stars = F.computeStars(s.objs, mode);
    var res = F.quizResult(s.quizAnswers, mode);
    var hintsUsed = list.reduce(function (n, o) { return n + ((s.objs[o.id] && s.objs[o.id].hints) || 0); }, 0);
    var firstTry = list.filter(function (o) { return s.objs[o.id] && s.objs[o.id].firstTry === true; }).length;
    var doneCount = list.filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length;

    /* pillar recap */
    var recap = h("ul", { class: "forge-recap" },
      Object.keys(F.PILLARS).map(function (p) {
        var sub = list.filter(function (o) { return o.pillar === p; });
        var doneSub = sub.filter(function (o) { return s.objs[o.id] && s.objs[o.id].done; }).length;
        return h("li", { class: "bench-card" },
          h("div", { class: "forge-recap-top" }, F.pillarBadge(p),
            h("span", { class: "forge-recap-count" }, doneSub + "/" + sub.length)),
          h("p", { class: "forge-recap-ids" },
            sub.map(function (o) {
              var d = s.objs[o.id] && s.objs[o.id].done;
              return h("span", { class: cn("forge-recap-id", d ? "text-foreground" : "forge-recap-open") },
                o.id + "·" + (PILLAR_PANEL_LABEL[o.panel] || o.panel) + (d ? " ✓" : " ·"));
            })));
      }));

    /* focus areas (R8) — derived from THIS student's evidence */
    var items = [];
    var seen = {};
    list.forEach(function (o) {
      var prog = s.objs[o.id];
      if (!prog) return;
      if (prog.firstTry === false) {
        seen[o.id] = true;
        items.push({ id: o.id, label: o.id + " · " + o.title, reason: "closed on attempt " + prog.attempts,
          action: "Re-run it from the " + (PILLAR_PANEL_LABEL[o.panel] || o.panel) + " workspace and re-read: " + o.anchor });
      } else if ((prog.hints || 0) > 0) {
        seen[o.id] = true;
        items.push({ id: o.id, label: o.id + " · " + o.title, reason: "used " + (prog.hints === 1 ? "a nudge" : prog.hints + " hints"),
          action: "Retry it unaided from the " + (PILLAR_PANEL_LABEL[o.panel] || o.panel) + " workspace — anchor: " + o.anchor });
      }
    });
    F.QUIZ[mode].forEach(function (q) {
      if (s.quizAnswers[q.id] && s.quizAnswers[q.id] !== q.answer && !seen[q.obj]) {
        items.push({ id: q.obj, label: q.obj + " · quiz call", reason: "answered incorrectly in the audit",
          action: "Re-read the matching work order and knowledge core, then retell the why in one sentence" });
        seen[q.obj] = true;
      }
    });
    var focusList = h("ul", { class: "forge-focus" },
      items.length === 0
        ? h("li", { class: "forge-focus-clean" },
            "No weak signals recorded — every check passed first try and the audit came back clean. Stay sharp: redo any work order unaided tomorrow and verify you still hit 5/5 first-try.")
        : items.slice(0, 6).map(function (it) {
            return h("li", { class: "forge-focus-item" },
              h("div", { class: "forge-focus-label" }, it.label),
              h("div", { class: "forge-focus-signal" }, "signal · " + it.reason),
              h("p", { class: "forge-focus-action" }, it.action));
          }));

    var next = h("ul", { class: "forge-next" },
      F.NEXT_STEPS.map(function (t) { return h("li", null, iconEl("ArrowRight", 12, "text-ember"), t); }));

    var content = h("div", null,
      h("div", { class: "forge-hero" },
        F.stars(stars.stars, 26),
        h("div", { class: "forge-hero-line" },
          "star rating · " + firstTry + "/" + list.length + " first-attempt checks · " + hintsUsed + " hint" + (hintsUsed === 1 ? "" : "s") + " used"),
        h("div", { class: "forge-stats" },
          h("div", { class: "forge-stat" }, h("div", { class: "forge-stat-num text-container" }, doneCount + "/" + list.length), "work orders"),
          h("div", { class: "forge-stat" }, h("div", { class: "forge-stat-num text-ember" }, res.correct + "/" + res.total), "audit score"),
          h("div", { class: "forge-stat" }, h("div", { class: "forge-stat-num" }, stars.stars || "—"), "stars"))),
      h("div", null, h("h4", { class: "forge-h4" }, "Pillar recap"), recap),
      h("div", null, h("h4", { class: "forge-h4" }, "Focus areas — where to push next"), focusList),
      h("div", null, h("h4", { class: "forge-h4" }, "What to learn next"), next));

    F.dialog({
      variant: "dialog",
      titleNode: h("span", { class: "forge-title" }, iconEl("Flame", 22, "text-ember"), "Shift complete"),
      description: "The " + (mode === "medium" ? "apprentice" : "night") + " shift at Cirrusworks Foundry is closed. Here is what the forge recorded.",
      content: content,
      actions: [
        F.button({ className: "forge-keep", children: "Keep reviewing the floor" }),
        F.button({
          variant: "outline", className: "forge-reset",
          children: "Reset the lab",
          onClick: function () { F.closeDialog(); F.dispatch({ t: "reset" }); },
        }),
      ],
    });
    // wire "Keep reviewing" after mount (close only)
    var keep = document.querySelector(".dialog-forge .forge-keep");
    if (keep) keep.addEventListener("click", function () { F.closeDialog(); });
  }

  /* ============================ boot ============================ */

  function boot() {
    mainEl = document.getElementById("main");
    headerEl = document.getElementById("lab-header");
    dockEl = document.getElementById("lab-dock");
    F.restore(); // synchronous persistence resume (framework hydrated async)
    var s = state();
    if (s.mode && s.stage === "audit") F.resetQuizPos();
    renderHeader();
    F.rebuildRegion(mainEl, renderMainContents);
    renderDock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Foundry = window.Foundry || {});
