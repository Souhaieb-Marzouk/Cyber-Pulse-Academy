/**
 * HarborOps Lab — bootstrap + app shell (static port).
 * Renders the mode-select or the full lab world, wires delegated events,
 * runs the objectives rail, dialogs (Port Clearance + Reset confirm) and the
 * mobile manifest sheet. Mirrors LabRoot/ModeSelect/ManifestRail/Clearance.
 */
(function (global) {
  "use strict";

  var U = global.HarborUI, D = global.HarborData, S = global.HarborStore;
  var esc = U.esc, icon = U.icon;
  var doc = global.document;
  var app = doc.getElementById("app");
  var Z = global.HarborZones;

  var ZONE_LABEL = {
    berth: "Architecture Berth",
    build: "Build Bay",
    registry: "Registry Yard",
    crane: "Crane Deck",
    office: "Manifest Office",
    customs: "Customs Desk",
    incident: "Incident File",
  };

  function state() { return S.getState(); }
  function isHard() { return state().mode === "hard"; }
  function modeObjs() { return isHard() ? D.HARD_OBJECTIVES : D.MEDIUM_OBJECTIVES; }
  function modeQuiz() { return isHard() ? D.HARD_QUIZ : D.MEDIUM_QUIZ; }
  function solvedCount() {
    var objs = modeObjs();
    return objs.filter(function (o) { var st = state().objectives[o.id]; return st && st.solved; }).length;
  }
  function allSolved() { return solvedCount() === modeObjs().length; }

  /* ================================================================
     Mode select (Phase E screen)
     ================================================================ */

  function modeSelectHtml() {
    return '<div class="mode-select"><main class="mode-main">' +
      '<header class="mode-header">' +
        '<p class="badge mode-tag">' + icon("anchor", "icon xs") + " Training simulation — synthetic data only</p>" +
        "<h1>PORT MERIDIAN <span class=\"accent\">HARBOR OPERATIONS</span></h1>" +
        '<p class="mode-sub">CompTIA Cloud+ CV0-004 · Lesson 1.4 — Containerization</p>' +
        '<p class="mode-blurb">One harbor, two watches. Choose how you want to work the deck — RESET returns you here at any time, and switching watches starts a fresh run.</p>' +
      "</header>" +
      '<div class="mode-grid">' +
        '<button type="button" class="mode-card" data-action="choose-mode" data-mode="medium" aria-label="Medium mode: Dockhand onboarding">' +
          '<div class="mode-glyph">' + icon("compass") + "</div>" +
          "<h2>MEDIUM · Dockhand Onboarding</h2>" +
          '<p class="mode-kicker">' + D.MEDIUM_OBJECTIVES.length + " guided objectives · understand &amp; apply</p>" +
          "<ul>" +
            "<li>• Objectives appear in a recommended route, each with context and where-to-look guidance.</li>" +
            "<li>• Up to 3 tiered hints per task (nudge → direction → demonstration); hints cost stars, never progress.</li>" +
            "<li>• Tolerant grading: wrong answers give teaching feedback, never penalties.</li>" +
            "<li>• Concept quiz after practice — every answer explains itself.</li>" +
          "</ul>" +
          '<p class="mode-cta">Take this watch →</p></button>' +
        '<button type="button" class="mode-card hard" data-action="choose-mode" data-mode="hard" aria-label="Hard mode: Harbormaster drill">' +
          '<div class="mode-glyph">' + icon("gauge") + "</div>" +
          "<h2>HARD · Harbormaster Drill</h2>" +
          '<p class="mode-kicker">' + D.HARD_OBJECTIVES.length + " deep challenges · analyze, evaluate, create</p>" +
          "<ul>" +
            "<li>• Scenario-first: noisy evidence with red herrings — you find what matters.</li>" +
            "<li>• Broad multi-step challenges; strict grading with exact values, sequences and end-states.</li>" +
            "<li>• Near-misses are explicitly rejected with a rationale.</li>" +
            "<li>• At most ONE optional nudge, and it visibly costs score.</li>" +
          "</ul>" +
          '<p class="mode-cta">Take this watch →</p></button>' +
      "</div>" +
      '<p class="mode-footnote">Port Meridian Freight Authority is fictional. Every log, image and incident in this lab is synthetic training data. Defensive/educational purpose only.</p>' +
      "</main></div>";
  }

  /* ================================================================
     Lab shell
     ================================================================ */

  function mastheadHtml() {
    var mode = state().mode;
    return '<header class="masthead"><div class="masthead-inner">' +
      '<div class="masthead-left">' +
        '<span class="masthead-glyph" aria-hidden="true">' + icon("anchor") + "</span>" +
        "<div><h1>Port Meridian · Harbor Operations Board</h1>" +
        '<p class="masthead-sub">CompTIA Cloud+ CV0-004 · Lesson 1.4 — Containerization &amp; its role in cloud environments</p></div>' +
      "</div>" +
      '<div class="masthead-badges">' +
        '<span class="badge outline mono badge-amber">' + (isHard() ? "Harbormaster drill" : "Dockhand onboarding") + "</span>" +
        '<span class="badge outline mono badge-stone">training simulation</span>' +
      "</div></div></header>";
  }

  function labHtml() {
    return mastheadHtml() +
      '<div class="lab-body">' +
        '<aside class="rail-shell rail-desktop" aria-label="Operations manifest — objectives tracker"><div id="rail-desktop"></div></aside>' +
        '<main class="lab-main">' +
          Z.briefingHtml() +
          Z.knowledgeHtml() +
          Z.berthHtml() +
          Z.buildHtml() +
          Z.registryHtml() +
          Z.craneHtml() +
          Z.officeHtml() +
          Z.customsHtml() +
          Z.incidentHtml() +
          Z.quizHtml() +
          Z.logbookHtml() +
          '<p class="lab-footer">HarborOps Training Simulation · Port Meridian Freight Authority is fictional · all data synthetic · defensive/educational only</p>' +
        "</main>" +
      "</div>" +
      '<div class="manifest-fab-wrap"><button type="button" class="manifest-fab" id="manifest-fab" data-action="open-rail">MANIFEST</button></div>' +
      '<div id="sheet-root"></div>' +
      '<div id="dialog-root"></div>';
  }

  /* ================================================================
     Operations Manifest rail (C4)
     ================================================================ */

  function railHtml() {
    var s = state();
    var objs = modeObjs();
    var done = solvedCount(), total = objs.length;
    var maxHints = isHard() ? 1 : 3;

    var pillarCounts = { P1: { done: 0, total: 0 }, P2: { done: 0, total: 0 }, P3: { done: 0, total: 0 }, P4: { done: 0, total: 0 } };
    objs.forEach(function (o) {
      pillarCounts[o.pillar].total += 1;
      var st = s.objectives[o.id];
      if (st && st.solved) pillarCounts[o.pillar].done += 1;
    });
    var meters = Object.keys(pillarCounts).map(function (p) {
      var m = pillarCounts[p];
      return '<div class="pillar-meter">' + U.pillarBadge(p) +
        U.progress((m.done / m.total) * 100, D.PILLAR_META[p].label + " progress", "thin") +
        '<span class="count">' + m.done + "/" + m.total + "</span></div>";
    }).join("");

    return '<div class="rail">' +
      '<div class="rail-head" style="padding:0.75rem 0.75rem 0">' + icon("clipboardList") +
        '<div style="flex:1"><p class="rail-title">Operations Manifest</p><p class="rail-sub">Objectives tracker — live progress</p></div></div>' +
      '<div class="rail-progress" style="padding:0.75rem 0.75rem 0">' +
        '<div class="rail-progress-row"><span class="label">progress</span><span class="value">' + done + "/" + total + "</span></div>" +
        U.progress((done / total) * 100, "Objectives progress " + done + " of " + total) +
        '<div class="pillar-meters">' + meters + "</div></div>" +
      '<hr class="rail-sep">' +
      '<div class="rail-list"><ul id="rail-list"></ul></div>' +
      '<hr class="rail-sep">' +
      '<div class="rail-foot">' +
        '<button type="button" class="btn clearance-go" data-action="request-clearance"' + (!allSolved() ? " disabled" : "") + ">" +
          icon("trophy", "icon sm") + " REQUEST CLEARANCE</button>" +
        (!allSolved() ? '<p class="rail-foot-hint">Complete every objective to request clearance.</p>' : "") +
        '<button type="button" class="btn ghost sm reset w-full" data-action="reset-lab" style="justify-content:center">' +
          icon("rotateCcw", "icon xs") + " RESET LAB (erases progress)</button>" +
      "</div></div>";
  }

  function railCardHtml(o) {
    var s = state();
    var st = s.objectives[o.id];
    var maxHints = isHard() ? 1 : 3;
    var revealed = Math.min(s.hintsOpen[o.id] ?? 0, Math.min(o.hints.length, maxHints));
    var rr = Z.results[o.id];
    var hintCap = Math.min(o.hints.length, maxHints);

    var html = '<li class="rail-card' + (st && st.solved ? " solved" : "") + '">' +
      '<div class="rail-card-head">' +
        (st && st.solved ? icon("checkCircle2", "icon sm") : icon("circle", "icon sm")) +
        '<span class="rail-card-id">' + o.id + "</span>" + U.pillarBadge(o.pillar) +
        (st && st.solved && !st.firstTry ? '<span class="badge retry">retry</span>' : "") +
      "</div>" +
      '<p class="rail-card-text">' + esc(o.text) + "</p>" +
      '<p class="rail-card-anchor">covers: ' + esc(o.anchor) + "</p>" +
      (revealed > 0
        ? '<ul class="hint-inline">' + o.hints.slice(0, revealed).map(function (h) {
            return "<li>" + icon("lightbulb", "icon xs") + "<span>" + esc(h) + "</span></li>";
          }).join("") + "</ul>"
        : "") +
      (revealed < hintCap && !(st && st.solved)
        ? '<button type="button" class="btn ghost sm hint-btn" data-action="hint" data-obj="' + o.id + '" data-fr="hint-' + o.id + '" style="min-height:2.75rem;min-width:2.75rem">' +
          icon("lightbulb", "icon xs") + " hint " + revealed + "/" + hintCap + "</button>"
        : "") +
      (!(st && st.solved)
        ? '<div class="rail-check-row"><button type="button" class="btn stamp sm" style="min-height:2rem;padding:0.25rem 0.625rem;font-size:10px" data-action="check" data-obj="' + o.id + '" data-fr="check-' + o.id + '">CHECK</button></div>'
        : "") +
      (rr && !(st && st.solved)
        ? '<p class="rail-result ' + (rr.pass ? "pass" : "fail") + '" role="status">' + (rr.pass ? "✓ " : "✗ ") + esc(rr.title) + "</p>"
        : "") +
      "</li>";
    return html;
  }

  function updateRail() {
    var containers = [doc.getElementById("rail-desktop"), doc.getElementById("rail-mobile")].filter(Boolean);
    containers.forEach(function (c) {
      var temp = doc.createElement("template");
      temp.innerHTML = railHtml().trim();
      var fresh = temp.content.firstElementChild;
      var oldListWrapper = c.querySelector(".rail-list");
      if (!oldListWrapper) {
        c.innerHTML = "";
        c.appendChild(fresh);
      } else {
        // Replace the shell only when its non-list content actually changed —
        // rebuilding every notify would swap nodes under in-flight gestures.
        // The existing list wrapper is re-inserted at the exact slot it came from.
        var newListWrapper = fresh.querySelector(".rail-list");
        var nextSib = newListWrapper.nextSibling;
        newListWrapper.remove();
        var shellH = U.hashHtml(fresh.outerHTML);
        if (c.__shellH !== shellH) {
          fresh.insertBefore(oldListWrapper, nextSib);
          c.innerHTML = "";
          c.appendChild(fresh);
          c.__shellH = shellH;
        }
        // else: keep the current shell (and its list) untouched
      }
      var list = c.querySelector("#rail-list");
      if (list) {
        U.patchList(list, modeObjs(), function (o) { return o.id; }, railCardHtml);
      }
    });
    // FAB label
    var fab = doc.getElementById("manifest-fab");
    if (fab) fab.textContent = "MANIFEST " + solvedCount() + "/" + modeObjs().length;
  }

  /* ================================================================
     Dialogs — Port Clearance (C7) + Reset confirm
     ================================================================ */

  var openDialog = null; // "clearance" | "reset" | null
  var lastFocused = null;

  function computeClearance() {
    var s = state();
    var objs = modeObjs(), quizQs = modeQuiz();
    var quizCorrect = quizQs.filter(function (q) { return s.quiz.answers[q.id] === q.answer; }).length;
    var maxHints = isHard() ? objs.length : objs.length * 3;
    var stars = S.computeStars(s.objectives, quizCorrect, quizQs.length, maxHints);
    var solvedN = objs.filter(function (o) { var st = s.objectives[o.id]; return st && st.solved; }).length;
    var scorePct = Math.round(((solvedN / objs.length) * 0.6 + (quizCorrect / quizQs.length) * 0.4) * 100);
    var recap = ["P1", "P2", "P3", "P4"].map(function (p) {
      return {
        pillar: p,
        done: objs.filter(function (o) { return o.pillar === p && s.objectives[o.id] && s.objectives[o.id].solved; }).length,
        total: objs.filter(function (o) { return o.pillar === p; }).length,
      };
    });

    /* focus areas derived from ACTUAL evidence (R8) */
    var areas = [];
    quizQs.forEach(function (q, i) {
      if (s.quiz.answers[q.id] !== q.answer) {
        areas.push("Board of Inquiry Q" + (i + 1) + " went sideways (" + q.topic + "). Re-read the Knowledge Core section that covers " + q.topic + ", then re-answer the case and compare it against the feedback you got.");
      }
    });
    objs.forEach(function (o) {
      var st = s.objectives[o.id];
      if (st && st.solved && !st.firstTry) {
        areas.push((ZONE_LABEL[o.zone] || o.zone) + " (" + o.id + ", " + D.PILLAR_META[o.pillar].label + ") took more than one attempt. Rerun it once more and articulate WHY the first attempt failed — that reasoning is what the exam grades.");
      }
    });
    var hintUsers = objs.filter(function (o) { return ((s.objectives[o.id] || {}).hintsUsed ?? 0) > 0; });
    if (hintUsers.length > 0) {
      areas.push("Hints were used on " + hintUsers.length + " objective" + (hintUsers.length > 1 ? "s" : "") + " (" + hintUsers.map(function (o) { return o.id; }).join(", ") + "). Replay the lab aiming for zero nudges — self-directed recall is the exam-day skill.");
    }
    var ranked = recap.filter(function (r) { return r.total > 0; }).sort(function (a, b) { return a.done / a.total - b.done / b.total; });
    var weakest = ranked[0];
    if (weakest && weakest.done < weakest.total) {
      areas.push("Weakest pillar: " + D.PILLAR_META[weakest.pillar].label + " (" + weakest.done + "/" + weakest.total + "). Study its " + weakest.pillar + " objectives' \"covers:\" anchors in the Operations Manifest before the exam.");
    }
    if (areas.length === 0) {
      areas.push("Flawless run: every objective first-try, no hints, and a clean board. Focus shifts to retention — replay the OTHER difficulty mode, where the same concepts arrive with noise and red herrings.");
    }
    return { stars: stars, scorePct: scorePct, quizCorrect: quizCorrect, quizTotal: quizQs.length, recap: recap, areas: areas };
  }

  function clearanceHtml() {
    var c = computeClearance();
    var starsHtml = [1, 2, 3, 4, 5].map(function (i) {
      return '<span class="' + (i <= c.stars ? "star-on" : "star-off") + '">' + icon("star", "icon") + "</span>";
    }).join("");
    return '<div class="dialog-backdrop" data-dialog="clearance"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="clearance-title" aria-describedby="clearance-desc">' +
      '<button type="button" class="dialog-close" data-action="clearance-close" aria-label="Close">' + icon("x") + "</button>" +
      '<div class="clearance-glyph">' + icon("award") + "</div>" +
      '<h2 class="dialog-title" id="clearance-title">Port Clearance Granted</h2>' +
      '<p class="dialog-desc" id="clearance-desc">' + (isHard() ? "Harbormaster drill" : "Dockhand onboarding") + " — Lesson 1.4 Containerization (CV0-004). You can now explain it, recognize it in evidence, verify it live, and control it.</p>" +
      '<div class="stars" aria-label="Star rating: ' + c.stars + " of 5" + '">' + starsHtml + "</div>" +
      '<p class="stars-caption">stars = first-attempt accuracy + quiz accuracy − hint cost</p>' +
      '<div class="stat-grid">' +
        '<div class="stat-card"><p class="stat-value">' + c.scorePct + '%</p><p class="stat-label">lab score</p></div>' +
        '<div class="stat-card"><p class="stat-value">' + c.quizCorrect + "/" + c.quizTotal + '</p><p class="stat-label">board of inquiry</p></div>' +
      "</div>" +
      '<hr class="dialog-sep">' +
      '<p class="recap-kicker">Mastery recap by pillar</p>' +
      '<ul class="recap-list">' + c.recap.map(function (r) {
        return '<li class="recap-row"><span class="badge">' + r.pillar + '</span><span class="pillar-label">' + esc(D.PILLAR_META[r.pillar].label) +
          '</span><span class="count">' + r.done + "/" + r.total + "</span></li>";
      }).join("") + "</ul>" +
      '<hr class="dialog-sep">' +
      '<p class="focus-kicker">' + icon("crosshair", "icon xs") + " Focus areas — from your own run</p>" +
      '<ul class="focus-list">' + c.areas.map(function (a, i) {
        return '<li class="focus-item"><span class="n">' + (i + 1) + ".</span><span>" + esc(a) + "</span></li>";
      }).join("") + "</ul>" +
      '<hr class="dialog-sep">' +
      '<p class="next-kicker">' + icon("bookOpen", "icon xs") + " Next steps</p>" +
      '<ul class="next-list">' +
        "<li>• Replay the other difficulty mode — same harbor, harder water.</li>" +
        "<li>• Continue with the next CV0-004 lesson (storage resources &amp; tiers).</li>" +
        "<li>• Read MITRE T1610 on the official page and map its mitigations to controls you now understand.</li>" +
      "</ul>" +
      '<p class="dialog-footnote">Port Meridian Freight Authority is fictional. All evidence is synthetic training data.</p>' +
      "</div></div>";
  }

  function resetDialogHtml() {
    return '<div class="dialog-backdrop" data-dialog="reset"><div class="dialog confirm" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<h2 class="dialog-title" id="reset-title" style="font-size:1rem">Reset the whole lab?</h2>' +
      '<p class="dialog-desc" id="reset-desc">This wipes mode selection, all objective progress, quiz answers and every environment change, restoring the pristine state. This cannot be undone.</p>' +
      '<div class="confirm-actions">' +
        '<button type="button" class="btn confirm-cancel" data-action="reset-cancel">Keep my progress</button>' +
        '<button type="button" class="btn confirm-reset" data-action="reset-confirm">Reset everything</button>' +
      "</div></div></div>";
  }

  function showDialog(kind) {
    closeDialog(false);
    lastFocused = doc.activeElement;
    var root = doc.getElementById("dialog-root");
    root.innerHTML = kind === "clearance" ? clearanceHtml() : resetDialogHtml();
    openDialog = kind;
    var first = root.querySelector("button, input, select, textarea");
    if (first) first.focus();
  }

  function closeDialog(restoreFocus) {
    var root = doc.getElementById("dialog-root");
    if (root) root.innerHTML = "";
    openDialog = null;
    if (restoreFocus !== false && lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /** Port Clearance auto-open contract: once, when everything is complete. */
  var clearanceShownThisRun = false;
  function maybeAutoClearance() {
    var s = state();
    if (!s.mode) return;
    var complete = s.quiz.finished && allSolved();
    if (complete && !s.clearanceSeen && !clearanceShownThisRun && openDialog !== "clearance") {
      clearanceShownThisRun = true;
      showDialog("clearance");
    }
  }

  /* ================================================================
     Mobile manifest sheet
     ================================================================ */

  var sheetOpen = false;
  function openSheet() {
    var root = doc.getElementById("sheet-root");
    lastFocused = doc.activeElement;
    root.innerHTML = '<div class="sheet-backdrop" data-action="sheet-close"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="Operations manifest — objectives tracker">' +
      '<p class="sr-only">Operations manifest — objectives tracker</p>' +
      '<div class="rail-shell rail-mobile" id="rail-mobile" style="flex:1;min-height:0;border:0;border-radius:0"></div></div>';
    sheetOpen = true;
    updateRail();
    var first = root.querySelector("button, input, select, textarea");
    if (first) first.focus();
  }
  function closeSheet() {
    var root = doc.getElementById("sheet-root");
    if (root) root.innerHTML = "";
    sheetOpen = false;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ================================================================
     Rendering + subscriptions
     ================================================================ */

  function structuralRender() {
    var s = state();
    if (!s.mode) {
      app.innerHTML = modeSelectHtml();
      return;
    }
    app.innerHTML = labHtml();
    Z.resetResults(); // check results are component-scoped, like the original
    updateRail();
    updateAllZones();
  }

  function updateAllZones() {
    if (!state().mode || !doc.getElementById("zone-berth")) return;
    Z.updateBerth();
    Z.updateBuild();
    Z.updateRegistry();
    Z.updateCrane();
    Z.updateOffice();
    Z.updateCustoms();
    Z.updateIncident();
    Z.updateQuiz();
  }

  function onNotify() {
    if (!state().mode) {
      // back at mode select (after reset) — structural swap
      if (!doc.querySelector(".mode-select")) structuralRender();
      return;
    }
    if (doc.querySelector(".mode-select")) structuralRender();
    updateRail();
    updateAllZones();
    updateFABState();
    maybeAutoClearance();
  }

  function updateFABState() {
    var fab = doc.getElementById("manifest-fab");
    if (fab) {
      var label = "MANIFEST " + solvedCount() + "/" + modeObjs().length;
      if (fab.textContent !== label) fab.textContent = label;
      fab.setAttribute("aria-label", "Open operations manifest — " + solvedCount() + " of " + modeObjs().length + " objectives complete");
    }
  }

  /* ================================================================
     Event wiring (delegated)
     ================================================================ */

  function handleChange(target) {
    var s = state();
    if (!s.mode) return;
    var t = target;
    var change = t.getAttribute("data-change");
    var env = s.env;
    if (!change && t.name) {
      // radios without explicit data-change: derive from name
      if (t.name === "kernel-answer") { S.setKernelAnswer(t.value); return; }
      if (t.name.indexOf("h1-") === 0) { S.setH1Class(t.name.slice(3), t.value); return; }
      if (t.name.indexOf("place-") === 0) { S.setPlacement(t.name.slice(6), t.value); return; }
      if (t.name.indexOf("just-") === 0) { S.setJustify(t.name.slice(5), t.value); return; }
      if (t.name.indexOf("sr-") === 0) { S.setSr(t.name.slice(3), t.value); return; }
      if (t.name === "h10-tag") { S.setH10Tag(t.value); return; }
      if (t.name === "h10-reason") { S.setH10Reason(t.value); return; }
      if (t.name === "h5-storage") { S.setH5Storage(t.value); return; }
      if (t.name === "h5-latency") { S.setH5Latency(t.value); return; }
      if (t.name === "h3-fix") { S.setH3Fix(t.value); return; }
      if (t.name === "residual") { S.setResidual(t.value); return; }
      return;
    }
    switch (change) {
      case "m3": S.setM3Answer(t.value === "" ? null : Number(t.value)); break;
      case "replicas": S.setReplicas(Number(t.value)); break;
      case "discovery": S.toggleDiscovery(); break;
      case "fix": S.toggleFix(t.getAttribute("data-fix")); break;
      case "h6": S.toggleH6Pick(Number(t.getAttribute("data-line"))); break;
      case "h3-module": S.setH3Module(t.value); break;
    }
  }

  function handleClick(target) {
    var btn = target.closest("[data-action]");
    if (!btn) {
      // accordion triggers
      var acc = target.closest(".acc-trigger");
      if (acc) {
        var item = acc.closest(".acc-item");
        var open = item.getAttribute("data-open") === "true";
        item.setAttribute("data-open", open ? "false" : "true");
        acc.setAttribute("aria-expanded", open ? "false" : "true");
      }
      return;
    }
    var action = btn.getAttribute("data-action");
    switch (action) {
      case "choose-mode": S.setMode(btn.getAttribute("data-mode")); break;
      case "hint": S.revealHint(btn.getAttribute("data-obj")); break;
      case "check": Z.runCheck(btn.getAttribute("data-obj")); break;
      case "berth-pick": S.toggleBerthPick(btn.getAttribute("data-chip")); break;
      case "df-add": S.addDfChip(btn.getAttribute("data-chip")); break;
      case "df-up": S.moveDfChip(Number(btn.getAttribute("data-idx")), -1); break;
      case "df-down": S.moveDfChip(Number(btn.getAttribute("data-idx")), 1); break;
      case "df-remove": S.removeDfChip(Number(btn.getAttribute("data-idx"))); break;
      case "pull": {
        var id = btn.getAttribute("data-image");
        var img = D.YARD_IMAGES.find(function (i2) { return i2.id === id; });
        S.pullImage(img.id, img.name, img.tag, Z.sharedCount(img.id, state().env.pulled));
        break;
      }
      case "deploy": S.deploy(); break;
      case "inject": S.injectFailure(); break;
      case "rolling": S.rollingUpdate(D.M12_TAG); break;
      case "bind-pv": S.bindPv(); break;
      case "restart": S.restartOrders(); break;
      case "repl-down": S.nudgeReplicas(-1); break;
      case "repl-up": S.nudgeReplicas(1); break;
      case "evidence": S.toggleIncidentPick(btn.getAttribute("data-ev")); break;
      case "quiz-answer": S.answerQuiz(btn.getAttribute("data-qid"), btn.getAttribute("data-opt")); break;
      case "submit-quiz": S.finishQuiz(); break;
      case "request-clearance": if (allSolved()) showDialog("clearance"); break;
      case "clearance-close": closeDialog(); S.setClearanceSeen(); break;
      case "reset-lab": showDialog("reset"); break;
      case "reset-cancel": closeDialog(); break;
      case "reset-confirm": closeDialog(false); S.resetLab(); clearanceShownThisRun = false; break;
      case "open-rail": openSheet(); break;
      case "sheet-close": closeSheet(); break;
    }
  }

  app.addEventListener("click", function (e) {
    handleClick(e.target);
  });
  app.addEventListener("change", function (e) {
    handleChange(e.target);
  });
  app.addEventListener("input", function (e) {
    var t = e.target;
    if (t.type === "range" || t.type === "text" || t.type === "number") handleChange(t);
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (openDialog) {
      if (openDialog === "clearance") { closeDialog(); S.setClearanceSeen(); }
      else closeDialog();
    } else if (sheetOpen) {
      closeSheet();
    }
  });

  S.subscribe(onNotify);

  /* boot */
  structuralRender();
  if (state().mode) {
    updateRail();
    updateAllZones();
    updateFABState();
  }
})(window);
