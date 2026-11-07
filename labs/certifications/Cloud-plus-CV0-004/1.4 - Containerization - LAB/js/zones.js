/**
 * HarborOps Lab — zone renderers (static port).
 * Faithful re-implementation of the original zone components:
 *   BerthDiagram, BuildBay, RegistryYard, CraneDeck, ManifestOffice,
 *   CustomsDesk, IncidentFile (+ static Briefing / Knowledge / Logbook bodies).
 *
 * Rendering strategy mirrors React's model with vanilla means:
 *  - static skeletons render once per structural change (mode switch / reset)
 *  - dynamic controls are SYNCED by property writes (class/checked/disabled),
 *    so keyboard focus is never destroyed by a re-render
 *  - list-shaped regions (feed, draft, rail cards, quiz cases) are synced with
 *    a keyed patcher that only swaps nodes whose content actually changed
 */
(function (global) {
  "use strict";

  var U = global.HarborUI, D = global.HarborData, S = global.HarborStore, V = global.HarborValidation;
  var esc = U.esc, icon = U.icon;
  var doc = global.document;

  /** Component-scoped check results (like the original's useState) — not persisted. */
  var results = {};

  function state() { return S.getState(); }
  function obj(id) { return state().objectives[id]; }
  function isSolved(id) { var o = obj(id); return !!(o && o.solved); }
  function modeObjs() { return state().mode === "hard" ? D.HARD_OBJECTIVES : D.MEDIUM_OBJECTIVES; }
  function isHard() { return state().mode === "hard"; }

  /* ------------- shared actions ------------- */

  function runCheck(id) {
    var r = V.validateObjective(id, state());
    results[id] = r;
    S.markCheck(id, r.pass);
    // Build Bay contract: only a PASSING spec "builds" — the success log is a
    // reward, not a giveaway (original BuildBay.runCheck + QA-1).
    if ((id === "M4" || id === "H2") && r.pass) S.buildImage();
    paintBanner(id);
  }

  /** Clear component-scoped results (called on structural re-render, like a remount).
      Clears in place so the exported Z.results reference stays valid. */
  function resetResults() {
    Object.keys(results).forEach(function (k) { delete results[k]; });
  }

  function paintBanner(id) {
    doc.querySelectorAll('[data-banner="' + id + '"]').forEach(function (el) {
      el.innerHTML = U.checkBanner(results[id] || null);
    });
  }

  /* ------------- property-sync helpers ------------- */

  function syncBtn(el, o) {
    if (!el) return;
    if (o.disabled !== undefined) el.disabled = !!o.disabled;
    if (o.selected !== undefined) el.classList.toggle("selected", !!o.selected);
    if (o.correct !== undefined) el.classList.toggle("correct", !!o.correct);
    if (o.pressed !== undefined) el.setAttribute("aria-pressed", o.pressed ? "true" : "false");
    if (o.dim !== undefined) el.classList.toggle("unused-dim", !!o.dim);
    if (o.label !== undefined && el.textContent !== o.label) el.innerHTML = o.label;
  }

  /** Sync every radio input inside container to the selected value. */
  function syncRadios(container, selected, o) {
    if (!container) return;
    o = o || {};
    container.querySelectorAll('input[type="radio"]').forEach(function (input) {
      var val = input.value;
      if (selected !== undefined && val === selected) input.checked = true;
      if (o.disabled !== undefined) input.disabled = !!o.disabled;
      var label = input.closest(".btn, label");
      if (label) {
        if (o.correctId !== undefined) label.classList.toggle("correct", !!o.solved && val === o.correctId);
        label.classList.toggle("selected", val === selected && !o.softSelected);
        if (o.softClass && val === selected) label.classList.add(o.softClass);
      }
    });
  }

  /* ================================================================
     ZONE 0 — scenario briefing (C1) + knowledge core (C2) + logbook (C6)
     ================================================================ */

  function briefingHtml() {
    return '<section class="brief-card" aria-labelledby="briefing-title">' +
      '<div class="brief-head">' +
        '<span class="brief-glyph" aria-hidden="true">' + icon("mapPin") + "</span>" +
        '<div><h2 id="briefing-title">Scenario Briefing — Storm Season at Port Meridian</h2>' +
        '<p>Fictional incident · synthetic data · CV0-004 relevance below</p></div>' +
      "</div>" +
      '<div class="brief-body">' +
        "<p><strong>The situation.</strong> The Port Meridian Freight Authority runs <span class=\"mono\">CargoPortal</span> — a freight-scheduling monolith — plus a fleet of internal tools. Storm season floods the scheduling API with traffic exactly when the legacy billing engine cannot fall over. Your team, HarborOps Cloud Engineering, has one mandate: <em>cloud-native-first</em> — containerize what can be containerized, and know precisely why the rest stays put.</p>" +
        "<p><strong>Your berth today.</strong> You will dissect the VM-vs-container architecture, build and pull images in the registry yard, run the crane deck (orchestrator) through scale-out, self-healing, rolling updates and persistent volumes, route six workloads, stamp the shared-responsibility split, and close incident #1042 — the classic &ldquo;works on my machine&rdquo; case.</p>" +
        "<p><strong>Why it matters for the exam.</strong> CV0-004 weighs Cloud Architecture at 23%. Containerization powers its cloud-native concepts — images, registries, orchestration, persistent volumes, microservices — and this lesson is exactly where candidates lose easy points by mixing up shared kernels, mutable tags and stateless-vs-stateful rules.</p>" +
        '<p class="brief-note">' + icon("info", "icon xs") +
          "<span>Everything here is simulated: fictional domains (<span class=\"mono\">harbor-registry.internal</span>), synthetic IPs, invented tools. Defensive/educational framing throughout — the awareness card in the Logbook cites MITRE ATT&amp;CK for context only.</span></p>" +
      "</div></section>";
  }

  var CORE_SECTIONS = [
    {
      id: "what", title: "What containerization is — and what it is not",
      body:
        "<p>A container packages an application with everything it needs to run — runtime, libraries, config — into an isolated process on the host. The packaged template is the <strong>image</strong>; the running instance is the <strong>container</strong>. It is <em>not</em> a VM: there is no guest OS and no per-workload hypervisor — containers share the host OS kernel and isolate with kernel primitives (namespaces, cgroups — simplified).</p>" +
        "<p>Images are built in <strong>layers</strong> (each Dockerfile instruction is one), stored in <strong>registries</strong>, and referenced by <strong>tags</strong> (mutable labels) or <strong>digests</strong> (immutable hashes). That layering is why pulls are fast and fleets stay small.</p>",
    },
    {
      id: "why", title: "Why cloud teams containerize (and why attackers care)",
      body:
        "<p><strong>Operator value:</strong> portability (the same image runs on dev, staging, prod, any cloud), density (no guest-OS tax → more workloads per host), speed (millisecond starts → elastic scaling), and fit with microservices (small, loosely coupled, independently deployable services — each ships as its own container).</p>" +
        "<p><strong>Attacker value (awareness):</strong> the same properties attract abuse. MITRE documents Deploy Container (T1610 — Execution) for running tooling or evading defenses, Build Image on Host (T1612 — Defense Evasion), Container Administration Command (T1609 — Execution), Container and Resource Discovery (T1613 — Discovery) and Escape to Host (T1611 — Privilege Escalation). Examples documented on the official pages: TeamTNT (G0139), Kinsing (S0599), Doki (S0600), Hildegard (S0601). Full awareness card with mitigations lives in the Logbook.</p>",
    },
    {
      id: "variants", title: "Variants, tooling and chain position",
      body:
        "<p><strong>Ecosystem (examples, vendor-neutral exam):</strong> Docker and OCI-compatible images; containerd and Podman as engines/runtimes; registries public (Docker Hub) or private/cloud-managed (ECR, Artifact Registry, ACR); orchestration by Kubernetes-style control planes, often managed (EKS, AKS, GKE).</p>" +
        "<p><strong>Chain position:</strong> in the cloud-native flow, this lesson sits at the very start — <span class=\"mono\">build (Dockerfile → image) → ship (registry) → run (orchestrator: schedule, scale, heal, roll) → observe</span>. Get the image contract right and everything downstream inherits it. In CV0-004 the concepts continue into Deployment, Operations and DevOps Fundamentals domains.</p>" +
        "<p><strong>Compare-and-contrast anchors:</strong> VM when you need full OS control, legacy stacks, GPU pass-through or multi-day jobs; serverless/FaaS for short event-driven bursts billed per invocation; SaaS when buying beats building; containers for portable, dense, fast-scaling services — stateful ones with persistent volumes.</p>",
    },
  ];

  function knowledgeHtml() {
    var items = CORE_SECTIONS.map(function (s) {
      return '<div class="acc-item" data-acc="' + s.id + '" data-open="false">' +
        '<button type="button" class="acc-trigger" aria-expanded="false" aria-controls="acc-' + s.id + '">' +
        esc(s.title) + '<span class="chev" aria-hidden="true">' + icon("chevronDown", "icon sm") + "</span></button>" +
        '<div class="acc-body" id="acc-' + s.id + '" role="region"><div class="acc-body-inner"><div class="acc-content">' + s.body + "</div></div></div></div>";
    }).join("");
    var glossary = D.GLOSSARY.map(function (g) {
      return '<div class="glossary-item"><dt class="glossary-term">' + esc(g.term) + '</dt><dd class="glossary-def">' + esc(g.def) + "</dd></div>";
    }).join("");
    items += '<div class="acc-item" data-acc="glossary" data-open="false">' +
      '<button type="button" class="acc-trigger" aria-expanded="false" aria-controls="acc-glossary">' +
      "Glossary — " + D.GLOSSARY.length + ' terms (Cheat-sheet)<span class="chev" aria-hidden="true">' + icon("chevronDown", "icon sm") + "</span></button>" +
      '<div class="acc-body" id="acc-glossary" role="region"><div class="acc-body-inner"><dl class="acc-content glossary-grid">' + glossary + "</dl></div></div></div>";

    return '<section id="zone-core">' +
      '<div class="core-heading"><h2>Orientation Board — Knowledge Core</h2>' +
      '<p>Read once, then work the berths. Jargon terms have dotted underlines — hover or tap them anywhere.</p></div>' +
      '<div class="accordion">' + items + "</div>" +
      '<p class="route-hint">' + icon("chevronDown", "icon xs") +
      " Recommended route (Medium): Berth 01 → 02 → 03 → 04 → 05 → 06 → 07, then the Board of Inquiry. Hard mode: free order — the evidence is everywhere.</p>" +
      "</section>";
  }

  function logbookHtml() {
    var D2 = D.DEBRIEF;
    function list(items, icon2, tone) {
      return '<ul class="logbook-list ' + tone + '">' + items.map(function (t) {
        return "<li>" + icon(icon2, "icon sm") + "<span>" + esc(t) + "</span></li>";
      }).join("") + "</ul>";
    }
    return '<section id="zone-logbook" aria-labelledby="logbook-title">' +
      '<div id="logbook-header"></div>' +
      '<h2 id="logbook-title" class="sr-only">Debrief and field notes</h2>' +
      '<div class="logbook-grid">' +
        U.panel("Observability & verification", list(D2.observe.items, "eye", "li-teal")) +
        U.panel("Control plan (official mitigation IDs)", list(D2.plan.items, "wrench", "li-amber")) +
        U.panel("Blue-team takeaways", list(D2.blue, "hardHat", "li-stone")) +
        U.panel("Red-team mindset — awareness card (defensive framing)",
          '<p class="logbook-kicker">MITRE ATT&amp;CK® container techniques — studied for defense only; this lab contains no tradecraft.</p>' +
          list(D2.red, "shieldAlert", "li-red")) +
      "</div>" +
      '<div class="logbook-grid mt-4">' +
        U.panel("Official references (open in a new tab)",
          '<ul class="link-list">' + D2.links.map(function (l) {
            return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
              icon("externalLink", "icon xs") + esc(l.label) + "</a></li>";
          }).join("") + "</ul>") +
        U.panel("What to learn next", list(D2.next, "bookOpen", "li-amber")) +
      "</div></section>";
  }

  /* ================================================================
     ZONE 1 — Architecture Berth (M1, M2 / H1)
     ================================================================ */

  function berthObjectiveIds() { return isHard() ? ["H1"] : ["M1", "M2"]; }

  function berthHtml() {
    var solved = berthObjectiveIds().filter(isSolved);
    var head = U.zoneHeader(1, "Architecture Berth", "The shared-kernel truth — dissect both stacks before you pack anything", berthObjectiveIds(), solved);
    var vmStack = ["① Application code", "② App runtime + libraries", "③ Guest OS — full copy per VM", "④ Hypervisor", "⑤ Host OS", "⑥ Physical hardware"]
      .map(function (label) {
        var tone = label.indexOf("Guest OS") === 0 || label.indexOf("④ Hypervisor") === 0 ? "vm" : "both";
        return '<div class="stack-row ' + tone + '" role="listitem"><span>' + esc(label) + "</span></div>";
      }).join("");
    var ctStack = ["① Application code", "② App runtime + libraries (from image)", "③ Container engine", "④ Host OS — kernel shared by ALL containers", "⑤ Physical hardware"]
      .map(function (label) {
        var tone = label.indexOf("③ Container engine") === 0 || label.indexOf("④ Host OS") === 0 ? "ct" : "both";
        return '<div class="stack-row ' + tone + '" role="listitem"><span>' + esc(label) + "</span></div>";
      }).join("");

    var tasks = isHard() ? berthHardHtml() : berthMediumHtml();

    return '<section id="zone-berth" aria-labelledby="berth-title">' +
      '<div id="berth-header">' + head + "</div>" +
      '<h2 id="berth-title" class="sr-only">Architecture Berth — VM vs container</h2>' +
      '<div class="grid-2">' +
        "<div>" + U.panel("Conventional berth — Virtual Machine stack", '<div class="stack-rows" role="list" aria-label="Virtual machine stack layers">' + vmStack + "</div>") +
          '<p class="stack-note">Heavy but hermetic: every workload drags its own licensed, patchable OS behind a hypervisor wall.</p></div>' +
        "<div>" + U.panel("Container berth — shared kernel stack", '<div class="stack-rows" role="list" aria-label="Container stack layers">' + ctStack + "</div>") +
          '<p class="stack-note">No guest OS, no per-workload hypervisor. Isolation comes from kernel ' + U.gchip("Namespace") + "s and " + U.gchip("cgroup") + 's (<span class="mono" style="font-size:10px">simplified</span>) — containers start in milliseconds and run dense.</p></div>' +
      "</div>" +
      '<div class="mt-4 grid-2" id="berth-tasks">' + tasks + "</div>" +
      "</section>";
  }

  function berthMediumHtml() {
    var chips = D.BERTH_COMPONENTS.filter(function (c) { return c.id !== "hardware"; }).map(function (c) {
      return '<button type="button" class="btn chip" data-action="berth-pick" data-chip="' + c.id + '" aria-pressed="false">' + esc(c.label) + "</button>";
    }).join("");
    var m1 = U.panel("Task M1 — tag the VM-only components",
      '<p class="lead-text">Tap the <strong>two</strong> components a VM stack needs but a container stack does not carry:</p>' +
      '<div class="palette" id="m1-chips">' + chips + "</div>" +
      '<div class="mt-3">' + U.stampCheck("M1", "CHECK RESULTS — M1") + "</div>" +
      '<div data-banner="M1"></div>');
    var m2opts = D.M2_OPTIONS.map(function (o) {
      return '<label class="btn radio"><input type="radio" name="kernel-answer" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
    }).join("");
    var m2 = U.panel("Task M2 — the shared component",
      '<p class="lead-text">Every container on the same host shares exactly one fundamental piece. Pick it:</p>' +
      '<div class="quiz-options" role="radiogroup" aria-label="Shared component" id="m2-options">' + m2opts + "</div>" +
      '<div class="mt-3">' + U.stampCheck("M2", "CHECK RESULTS — M2") + "</div>" +
      '<div data-banner="M2"></div>');
    return m1 + m2;
  }

  function berthHardHtml() {
    var rows = D.H1_CHIPS.map(function (chip) {
      var radios = ["vm", "ct", "both"].map(function (cls) {
        var lbl = cls === "vm" ? "VM-only" : cls === "ct" ? "Container-only" : "Both";
        return '<label class="btn radio"><input type="radio" name="h1-' + chip.id + '" value="' + cls + '"><span>' + lbl + "</span></label>";
      }).join("");
      return '<div class="stack-4" style="flex-direction:row;align-items:center;justify-content:space-between;border:1px solid var(--stone-200);border-radius:var(--radius);padding:0.5rem">' +
        '<span class="mono" style="font-size:0.75rem;color:var(--stone-800)">' + esc(chip.label) + "</span>" +
        '<div class="chip-row" role="radiogroup" aria-label="Classify ' + esc(chip.label) + '" data-h1-group="' + chip.id + '">' + radios + "</div></div>";
    }).join("");
    return U.panel("Task H1 — classify all six components (strict)",
      '<p class="lead-text">Assign each chip to ' +
        '<span class="badge h1-vm mono">VM-only</span> <span class="badge h1-ct mono">Container-only</span> <span class="badge h1-both mono">Both stacks</span>' +
        " — the grader rejects any misplacement.</p>" +
      '<div class="stack-6" id="h1-rows">' + rows + "</div>" +
      '<div class="mt-3">' + U.stampCheck("H1", "CHECK RESULTS — H1") + "</div>" +
      '<div data-banner="H1"></div>');
  }

  function updateBerth() {
    var s = state().env, ids = berthObjectiveIds();
    var solved = ids.filter(isSolved);
    var head = U.zoneHeader(1, "Architecture Berth", "The shared-kernel truth — dissect both stacks before you pack anything", ids, solved);
    var h = doc.getElementById("berth-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    if (isHard()) {
      var solvedH1 = isSolved("H1");
      D.H1_CHIPS.forEach(function (chip) {
        var group = doc.querySelector('[data-h1-group="' + chip.id + '"]');
        syncRadios(group, s.h1Class[chip.id] || null, { disabled: solvedH1, solved: solvedH1, correctId: chip.cls });
      });
      var btnH1 = doc.querySelector('[data-obj="H1"][data-action="check"]');
      if (btnH1) btnH1.disabled = Object.keys(s.h1Class).length < D.H1_CHIPS.length;
      paintBanner("H1");
      return;
    }

    // M1 chips
    var m1Solved = isSolved("M1");
    doc.querySelectorAll("#m1-chips [data-chip]").forEach(function (btn) {
      var id = btn.getAttribute("data-chip");
      syncBtn(btn, {
        pressed: s.berthPicked.includes(id),
        selected: s.berthPicked.includes(id),
        correct: m1Solved && D.M1_ANSWER.includes(id),
        disabled: m1Solved,
      });
    });
    var btnM1 = doc.querySelector('[data-obj="M1"][data-action="check"]');
    if (btnM1) btnM1.disabled = s.berthPicked.length === 0;

    // M2 radios
    syncRadios(doc.getElementById("m2-options"), s.kernelAnswer, { disabled: isSolved("M2"), solved: isSolved("M2"), correctId: D.M2_ANSWER });
    var btnM2 = doc.querySelector('[data-obj="M2"][data-action="check"]');
    if (btnM2) btnM2.disabled = !s.kernelAnswer;

    paintBanner("M1"); paintBanner("M2");
  }

  /* ================================================================
     ZONE 2 — Build Bay (M4 / H2)
     ================================================================ */

  function buildObjId() { return isHard() ? "H2" : "M4"; }

  function buildHtml() {
    var objId = buildObjId();
    var solved = isSolved(objId);
    var head = U.zoneHeader(2, "Build Bay", "Assemble the Dockerfile — the manifest every environment will trust", [objId], solved ? [objId] : []);
    var palette = D.DF_PALETTE.map(function (chip) {
      return '<button type="button" class="btn chip" data-action="df-add" data-chip="' + chip.id + '" aria-label="Add instruction ' + esc(chip.text) + '">' + esc(chip.text) + "</button>";
    }).join("");
    return '<section id="zone-build" aria-labelledby="build-title">' +
      '<div id="build-header">' + head + "</div>" +
      '<h2 id="build-title" class="sr-only">Build Bay — Dockerfile assembly</h2>' +
      '<div class="build-grid">' +
        U.panel("Instruction palette — tap to add, in the right order",
          '<div class="palette" id="df-palette">' + palette + "</div>" +
          '<p class="palette-note" id="palette-note"></p>') +
        U.panel("Draft Dockerfile", '<span id="draft-count"></span>' +
          '<div class="draft" aria-live="polite" id="df-draft"></div>' +
          '<div class="mt-3 row-wrap" id="build-controls"></div>' +
          '<div data-banner="' + objId + '"></div>' +
          '<div id="build-reject"></div><div id="build-log"></div>') +
      "</div></section>";
  }

  function draftLineHtml(id, i, solved) {
    var chip = D.DF_PALETTE.find(function (c) { return c.id === id; });
    return '<div class="draft-line" data-fr="line-' + i + '">' +
      '<span class="ln">' + (i + 1) + "</span>" +
      '<span class="txt">' + esc(chip.text) + "</span>" +
      '<span class="row-btns">' +
        '<button type="button" class="btn row-btn" data-action="df-up" data-idx="' + i + '" aria-label="Move line ' + (i + 1) + ' up"' + (solved ? " disabled" : "") + ">" + icon("arrowUp", "icon xs") + "</button>" +
        '<button type="button" class="btn row-btn" data-action="df-down" data-idx="' + i + '" aria-label="Move line ' + (i + 1) + ' down"' + (solved ? " disabled" : "") + ">" + icon("arrowDown", "icon xs") + "</button>" +
        '<button type="button" class="btn row-btn danger" data-action="df-remove" data-idx="' + i + '" aria-label="Remove line ' + (i + 1) + '"' + (solved ? " disabled" : "") + ">" + icon("x", "icon xs") + "</button>" +
      "</span></div>";
  }

  function updateBuild() {
    var s = state().env, objId = buildObjId(), solved = isSolved(objId), r = results[objId];
    var head = U.zoneHeader(2, "Build Bay", "Assemble the Dockerfile — the manifest every environment will trust", [objId], solved ? [objId] : []);
    var h = doc.getElementById("build-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    // palette chips
    doc.querySelectorAll("#df-palette [data-chip]").forEach(function (btn) {
      var chip = D.DF_PALETTE.find(function (c) { return c.id === btn.getAttribute("data-chip"); });
      var used = s.dockerfile.includes(chip.id);
      var flaggedTrap = !!chip.trap && !isHard();
      btn.title = flaggedTrap ? chip.trap : "";
      syncBtn(btn, { disabled: used || solved, dim: used || solved });
      btn.classList.toggle("trap", flaggedTrap);
    });
    var note = doc.getElementById("palette-note");
    if (note) {
      var noteHtml = (!isHard()
        ? "Dashed red chips are traps — production specs reject them for cause. "
        : "Nothing here is labeled — deciding what belongs is part of the drill. ") +
        "The artifact you build here is the " + U.gchip("Image") + " contract: pin it, keep it minimal, make it reproducible.";
      if (note.__h !== U.hashHtml(noteHtml)) { note.innerHTML = noteHtml; note.__h = U.hashHtml(noteHtml); }
    }

    // draft list (keyed patch)
    var draft = doc.getElementById("df-draft");
    if (draft) {
      var items = s.dockerfile.map(function (id, i) { return { id: id, i: i }; });
      U.patchList(draft, items,
        function (it) { return it.id + "-" + it.i; },
        function (it) { return draftLineHtml(it.id, it.i, solved); });
      if (items.length === 0 && !draft.querySelector(".draft-empty")) {
        draft.innerHTML = '<p class="draft-empty"># tap palette chips to compose the build manifest</p>';
      } else if (items.length > 0) {
        var emp = draft.querySelector(".draft-empty");
        if (emp) emp.remove();
      }
    }
    var count = doc.getElementById("draft-count");
    if (count) {
      var kicker = count.closest(".panel") ? count.closest(".panel").querySelector(".panel-title") : null;
      if (kicker) kicker.textContent = "Draft Dockerfile — " + s.dockerfile.length + " line(s)";
    }

    // controls
    var controls = doc.getElementById("build-controls");
    if (controls) {
      var html = U.stampCheck(objId, isHard() ? "BUILD & CHECK — H2" : "BUILD & CHECK — M4", s.dockerfile.length === 0 || solved) +
        (solved && s.imageBuilt ? '<span class="badge built">' + icon("hammer", "icon xs") + " image built</span>" : "");
      if (controls.__h !== U.hashHtml(html)) { controls.innerHTML = html; controls.__h = U.hashHtml(html); }
    }
    paintBanner(objId);

    var rej = doc.getElementById("build-reject");
    if (rej) {
      var rejHtml = r && !r.pass
        ? '<div class="build-reject" aria-label="Build rejection log"><p>build rejected — spec does not match the production contract</p><p class="dim">review the check feedback, adjust the draft, and rebuild</p></div>'
        : "";
      if (rej.__h !== U.hashHtml(rejHtml)) { rej.innerHTML = rejHtml; rej.__h = U.hashHtml(rejHtml); }
    }
    var log = doc.getElementById("build-log");
    if (log) {
      var logHtml = solved && s.imageBuilt
        ? '<div class="build-log" aria-label="Build log">' +
          "<p>Step 1/" + s.dockerfile.length + "  build steps validated in canonical order</p>" +
          "<p>" + (isHard() ? "USER node — non-root runtime layer accepted" : "production contract satisfied") + "</p>" +
          "<p>Successfully built cargo-portal:1.4.0 — " + s.dockerfile.length + " instructions, 84 MB</p></div>"
        : "";
      if (log.__h !== U.hashHtml(logHtml)) { log.innerHTML = logHtml; log.__h = U.hashHtml(logHtml); }
    }
  }

  /* ================================================================
     ZONE 3 — Registry Yard (M3 / H10)
     ================================================================ */

  function registryObjId() { return isHard() ? "H10" : "M3"; }

  function yardCardHtml(img) {
    var pulled = state().env.pulled.includes(img.id);
    return '<div class="yard-card' + (img.mutable ? " mutable-card" : "") + '">' +
      '<div class="yard-head"><div class="yard-name">' + icon("packageOpen", "icon xs") +
        "<span>" + esc(img.name) + ':<span class="tag' + (img.mutable ? " bad" : "") + '">' + esc(img.tag) + "</span></span></div>" +
        (img.mutable ? '<span class="badge mutable">MUTABLE POINTER</span>' : "") +
      "</div>" +
      '<p class="yard-digest">digest ' + esc(img.digest) + "</p>" +
      (img.layers.length > 0
        ? '<ul class="yard-layers" aria-label="Layers of ' + esc(img.name + ":" + img.tag) + '">' + img.layers.map(function (l) {
            return '<li><span class="layer-sha">' + esc(l.sha) + "</span>" + esc(l.label) + (l.shared ? '<span class="badge shared">shared</span>' : "") + "</li>";
          }).join("") + "</ul>"
        : '<p class="yard-nolayers">No layers of its own — it is just a name pointing at another build.</p>') +
      (img.note ? '<p class="yard-note">' + esc(img.note) + "</p>" : "") +
      '<button type="button" class="btn ' + (pulled ? "done-teal w-full" : "stamp w-full") + '" data-action="pull" data-image="' + img.id + '"' +
        (pulled || img.mutable ? " disabled" : "") + ">" + (pulled ? "IN THE YARD ✓" : "PULL TO YARD") + "</button>" +
      "</div>";
  }

  function registryHtml() {
    var objId = registryObjId(), solved = isSolved(objId);
    var head = U.zoneHeader(3, "Registry Yard", "The harbor-registry.internal warehouse — where boxed cargo waits", [objId], solved ? [objId] : []);
    var task = isHard() ? registryHardHtml() : registryMediumHtml();
    return '<section id="zone-registry" aria-labelledby="yard-title">' +
      '<div id="registry-header">' + head + "</div>" +
      '<h2 id="yard-title" class="sr-only">Registry Yard — images, tags and layers</h2>' +
      '<div class="yard-grid" id="yard-grid"></div>' +
      '<div class="mt-4" id="registry-task">' + task + "</div>" +
      '<p class="yard-footnote" id="yard-note"></p>' +
      "</section>";
  }

  function registryMediumHtml() {
    return U.panel("Task M3 — layer reuse math",
      '<p class="lead-text">Pull <span class="mono">cargo-portal:1.4.0</span> first, then <span class="mono">orders-db:16.2</span>, then record: how many <strong>new</strong> layers did the second pull download? Watch the event feed for <span class="mono">ALREADY EXISTS</span>.</p>' +
      '<div class="row-wrap"><input type="number" min="0" max="8" class="num-input" data-change="m3" aria-label="Number of new layers downloaded by the second pull">' +
      '<span class="small-text">new layer(s)</span>' + U.stampCheck("M3", "CHECK RESULTS — M3") + "</div>" +
      '<div data-banner="M3"></div>');
  }

  function registryHardHtml() {
    var tags = D.YARD_IMAGES.map(function (img) {
      return '<label class="btn radio"><input type="radio" name="h10-tag" value="' + img.id + '"><span>' + esc(img.name) + ":" + esc(img.tag) + "</span></label>";
    }).join("");
    var reasons = D.H10_REASON_OPTIONS.map(function (o) {
      return '<label class="btn radio"><input type="radio" name="h10-reason" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
    }).join("");
    return U.panel("Task H10 — pick the production tag (strict)",
      '<p class="lead-text">One of these tags is fit for production. Select the tag, then the reason you would put in the change ticket.</p>' +
      '<div class="row-wrap mb-3" role="radiogroup" aria-label="Production tag choice" id="h10-tags">' + tags + "</div>" +
      '<div class="quiz-options mb-3" role="radiogroup" aria-label="Justification" id="h10-reasons">' + reasons + "</div>" +
      U.stampCheck("H10", "CHECK RESULTS — H10") +
      '<div data-banner="H10"></div>');
  }

  /** already-shared layers, per image, given the currently pulled set (QA-14) */
  function sharedCount(imageId, pulled) {
    var portal = pulled.includes("portal-140");
    var beta = pulled.includes("portal-beta");
    if (imageId === "orders-db") return portal || beta ? 1 : 0; // shares the alpine base
    if (imageId === "portal-140") return beta ? 3 : 0;          // alpine + node runtime + npm deps
    if (imageId === "portal-beta") return portal ? 3 : 0;
    return 0;
  }

  function updateRegistry() {
    var s = state().env, objId = registryObjId(), solved = isSolved(objId), r = results[objId];
    var head = U.zoneHeader(3, "Registry Yard", "The harbor-registry.internal warehouse — where boxed cargo waits", [objId], solved ? [objId] : []);
    var h = doc.getElementById("registry-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    U.patchList(doc.getElementById("yard-grid"), D.YARD_IMAGES, function (img) { return img.id; }, yardCardHtml);

    var note = doc.getElementById("yard-note");
    if (note) {
      var noteHtml = "The yard is your " + U.gchip("Registry") + ": push builds here, pull from here to run. A " + U.gchip("Tag") +
        " is a label; a " + U.gchip("Digest") + ' is a fingerprint. Production trusts pinned tags and digests — <span class="mono">latest</span> is a rumor.';
      if (note.__h !== U.hashHtml(noteHtml)) { note.innerHTML = noteHtml; note.__h = U.hashHtml(noteHtml); }
    }

    if (isHard()) {
      syncRadios(doc.getElementById("h10-tags"), s.h10Tag, { disabled: solved, solved: solved, correctId: D.H10_TAG_ANSWER });
      syncRadios(doc.getElementById("h10-reasons"), s.h10Reason, { disabled: solved, solved: solved, correctId: D.H10_REASON_ANSWER });
      var btn = doc.querySelector('[data-obj="H10"][data-action="check"]');
      if (btn) btn.disabled = !s.h10Tag || !s.h10Reason || solved;
    } else {
      var input = doc.querySelector('[data-change="m3"]');
      if (input) {
        if (doc.activeElement !== input && String(s.m3Answer ?? "") !== input.value) input.value = s.m3Answer ?? "";
        input.disabled = solved;
      }
      var btnM3 = doc.querySelector('[data-obj="M3"][data-action="check"]');
      if (btnM3) btnM3.disabled = s.m3Answer === null;
    }
    paintBanner(objId);
  }

  /* ================================================================
     ZONE 4 — Crane Deck (M7–M10, M12 / H5, H6, H7, H9)
     ================================================================ */

  var MEDIUM_TASKS = ["M7", "M8", "M9", "M10", "M12"];
  var HARD_TASKS = ["H5", "H6", "H7", "H9"];

  function craneObjectiveIds() { return isHard() ? HARD_TASKS : MEDIUM_TASKS; }

  function craneHtml() {
    var ids = craneObjectiveIds(), solved = ids.filter(isSolved);
    var head = U.zoneHeader(4, "Crane Deck", "Orchestration console — cranes keep the declared state true", ids, solved);
    return '<section id="zone-crane" aria-labelledby="crane-title">' +
      '<div id="crane-header">' + head + "</div>" +
      '<h2 id="crane-title" class="sr-only">Crane Deck — orchestration console</h2>' +
      '<div class="crane-grid">' +
        '<div class="stack-col">' + craneControlsHtml() + craneOrdersHtml() + "</div>" +
        '<div class="stack-col">' + craneNodesHtml() + craneFeedHtml() + craneAmendmentsHtml() + "</div>" +
      "</div>" +
      '<div class="mt-4 grid-2" id="crane-tasks"></div>' +
      "</section>";
  }

  function craneControlsHtml() {
    return U.panel("Deployment controls",
      '<div class="control-row">' +
        '<button type="button" class="btn stamp" data-action="deploy">' + icon("ship", "icon sm") + '<span id="deploy-label">DEPLOY CARGO-PORTAL</span></button>' +
        '<button type="button" class="btn danger-outline" data-action="inject">' + icon("zap", "icon sm") + " INJECT FAILURE</button>" +
      "</div>" +
      '<div class="slider-block"><label class="slider-label">' + icon("scale", "icon xs") +
        " Replicas (horizontal " + U.gchip("Replica") + " scale)</label>" +
        '<div class="slider-row">' +
          '<button type="button" class="btn stepper" data-action="repl-down" aria-label="Decrease replicas by one">−</button>' +
          '<input type="range" min="0" max="6" step="1" data-change="replicas" aria-label="Number of cargo-portal replicas">' +
          '<button type="button" class="btn stepper" data-action="repl-up" aria-label="Increase replicas by one">+</button>' +
          '<span class="replica-readout" aria-live="polite" id="replica-readout">0</span>' +
        "</div>" +
        '<p class="slider-help">Scale out = more copies of the same image; the orchestrator spreads them across nodes. Use − / + or the slider.</p></div>' +
      '<div class="mt-4 control-row" id="rolling-row"></div>' +
      '<div class="mt-4 stack-4" style="flex-direction:row;align-items:center;justify-content:space-between;border:1px solid var(--stone-200);border-radius:var(--radius);padding:0.75rem">' +
        '<div style="display:flex;align-items:center;gap:0.5rem">' + icon("radioTower", "icon sm") +
          '<div><p style="font-size:0.875rem;font-weight:600;color:var(--stone-800)">Service discovery</p>' +
          '<p style="font-size:11px;color:var(--stone-500)">DNS names track live replicas automatically</p></div></div>' +
        '<span data-switch="discovery">' + U.switchEl(false, 'data-change="discovery" aria-label="Toggle service discovery"') + "</span>" +
      "</div>" +
      '<div id="discovery-box"></div>');
  }

  function craneOrdersHtml() {
    return U.panel("Orders DB — stateful service card",
      '<div class="stack-6">' +
        '<div class="orders-card-row"><div><p class="orders-name">orders-db:16.2</p>' +
          '<p class="orders-desc">Stateful — keeps cart sessions on local disk (ephemeral unless a volume is bound)</p></div>' +
          '<span class="badge orders-badge" id="pv-badge"></span></div>' +
        '<div class="control-row">' +
          '<button type="button" class="btn stamp grow" data-action="bind-pv"><span id="pv-label"></span></button>' +
          '<button type="button" class="btn plain-line grow" data-action="restart">' + icon("rotateCcw", "icon sm") + " RESTART CONTAINER</button>" +
        "</div>" +
        '<div id="data-check"></div>' +
      "</div>");
  }

  function craneNodesHtml() {
    return U.panel("Node grid", '<div class="node-grid" aria-label="Cluster node grid" id="node-grid"></div>' +
      '<div id="node-warn"></div>');
  }

  function craneFeedHtml() {
    return U.panel("Cluster event feed — live operational evidence",
      '<div class="feed" aria-live="polite" aria-label="Cluster event feed" id="feed"></div>');
  }

  function craneAmendmentsHtml() {
    var rows = D.AMENDMENTS.map(function (a) {
      return '<li class="amendment" data-amendment="' + a.id + '">' +
        '<div><p class="amendment-label">' + esc(a.label) + '</p><p class="amendment-prevents">prevents: ' + esc(a.prevents) + "</p></div>" +
        "<span>" + U.switchEl(false, 'data-change="fix" data-fix="' + a.id + '" aria-label="Amendment: ' + esc(a.label) + '"') + "</span></li>";
    }).join("");
    return U.panel("Amendments panel — harden the manifest",
      '<p class="palette-note" id="amendments-note"></p>' +
      '<div class="row-wrap" style="margin-bottom:0.5rem">' + icon("wrench", "icon sm") + '<span class="badge fixcount" id="fix-count"></span></div>' +
      '<ul class="amendments" id="amendments">' + rows + "</ul>" +
      '<div class="mt-3" id="m10-check"></div>');
  }

  function nodeCardHtml(n, i, slots, deployed) {
    var chips = slots[i].map(function (c) {
      return '<span class="slot-chip ' + (c === "orders-db" ? "db" : "portal") + '">' + icon("circleDot", "icon") + " " + esc(c) + "</span>";
    }).join("");
    return '<div class="node-card"><p class="node-name">' + esc(n) + '</p><div class="node-slots">' +
      (chips || '<span class="slot-idle">idle berth</span>') + "</div></div>";
  }

  function craneTasksHtml() {
    if (!isHard()) {
      return U.panel("Tasks M7 · M8 — scale & heal",
        '<p class="lead-text">Deploy, scale to exactly <strong>5 replicas</strong>, then inject one failure and watch self-healing restore the declared state. The event feed is your evidence.</p>' +
        '<div class="row-wrap">' + U.stampCheck("M7", "CHECK — M7") + U.stampCheck("M8", "CHECK — M8") + "</div>" +
        '<div data-banner="M7"></div><div data-banner="M8"></div>') +
        U.panel("Tasks M9 · M12 — state & ship",
        '<p class="lead-text">Make Orders DB survive a restart (volume first, then restart), and ship <span class="mono">1.5.0</span> with <strong>zero availability dip</strong> (≥2 replicas before you ship).</p>' +
        '<div class="row-wrap">' + U.stampCheck("M9", "CHECK — M9") + U.stampCheck("M12", "CHECK — M12") + "</div>" +
        '<div data-banner="M9"></div><div data-banner="M12"></div>');
    }
    var lines = D.MANIFEST_LINES.map(function (l) {
      return '<li><label class="manifest-line mono-check" data-fr="line-' + l.n + '">' +
        '<input type="checkbox" data-change="h6" data-line="' + l.n + '" aria-label="Line ' + l.n + ': ' + esc(l.text) + '">' +
        '<span class="n">' + l.n + "</span><span class=\"ml-text\">" + esc(l.text) + "</span></label>" +
        '<p class="manifest-why" data-why="' + l.n + '" hidden>▲ ' + esc(l.why) + "</p></li>";
    }).join("");
    return U.panel("Task H6 — audit the 8-line manifest (strict)",
      '<p class="lead-text">Select <strong>exactly the 5 misconfigured lines</strong>. Selecting a healthy line rejects the whole audit.</p>' +
      '<ul class="manifest-list" id="h6-lines">' + lines + "</ul>" +
      U.stampCheck("H6", "CHECK RESULTS — H6") + '<div data-banner="H6"></div>') +
      U.panel("Task H5 — diagnose both production symptoms",
      '<p class="lead-text"><strong>Symptom A:</strong> every Orders DB replacement wipes cart sessions. <strong>Symptom B:</strong> portal latency spikes whenever one container gets busy — its node-mates crawl.</p>' +
      '<div class="stack-4"><div><p class="diag-label">Symptom A root cause</p><div class="chip-row" role="radiogroup" aria-label="Symptom A cause" id="h5-a">' +
        [{ id: "nopv", label: "no persistent volume" }, { id: "tag", label: "unpinned tag" }, { id: "dns", label: "DNS misroute" }].map(function (o) {
          return '<label class="btn radio"><input type="radio" name="h5-storage" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
        }).join("") + "</div></div>" +
      '<div><p class="diag-label">Symptom B root cause</p><div class="chip-row" role="radiogroup" aria-label="Symptom B cause" id="h5-b">' +
        [{ id: "nolimits", label: "no resource limits set" }, { id: "kernel", label: "kernel contention" }, { id: "replicas", label: "too many replicas" }].map(function (o) {
          return '<label class="btn radio"><input type="radio" name="h5-latency" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
        }).join("") + "</div></div></div>" +
      '<div class="mt-3">' + U.stampCheck("H5", "CHECK RESULTS — H5") + "</div>" +
      '<div data-banner="H5"></div>') +
      U.panel("Task H7 — sequenced remediation (strict)",
      '<p class="lead-text">Apply all six amendments — but <strong>bind-pv must be applied BEFORE raise-replicas</strong>. The grader reads your action history, not your intent.</p>' +
      '<p class="fix-seq" id="fix-seq"></p>' +
      U.stampCheck("H7", "CHECK RESULTS — H7") + '<div data-banner="H7"></div>') +
      U.panel("Task H9 — release under constraint",
      '<p class="lead-text">End-state grading: <span class="mono">1.5.0</span> live, availability <strong>100%</strong>, exactly <strong>5 replicas</strong>. Scale before you ship.</p>' +
      U.stampCheck("H9", "CHECK RESULTS — H9") + '<div data-banner="H9"></div>');
  }

  function updateCrane() {
    var s = state().env, ids = craneObjectiveIds(), solved = ids.filter(isSolved);
    var head = U.zoneHeader(4, "Crane Deck", "Orchestration console — cranes keep the declared state true", ids, solved);
    var h = doc.getElementById("crane-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    var liveReplicas = s.deployed ? s.replicas : 0;
    var slots = [[], [], []];
    for (var i = 0; i < liveReplicas; i++) slots[i % 3].push("portal-" + (i + 1));
    if (s.deployed) slots[2].push("orders-db");

    // deployment controls
    syncBtn(doc.querySelector('[data-action="deploy"]'), {
      disabled: s.deployed,
      label: icon("ship", "icon sm") + (s.deployed ? "DEPLOYED ✓" : "DEPLOY CARGO-PORTAL"),
    });
    doc.querySelector('[data-action="deploy"]').classList.toggle("done-teal", s.deployed);
    doc.querySelector('[data-action="deploy"]').classList.toggle("stamp", !s.deployed);
    syncBtn(doc.querySelector('[data-action="inject"]'), { disabled: !s.deployed });
    var slider = doc.querySelector('[data-change="replicas"]');
    if (slider) {
      if (doc.activeElement !== slider && String(s.replicas) !== slider.value) slider.value = String(s.replicas);
      slider.disabled = !s.deployed;
    }
    syncBtn(doc.querySelector('[data-action="repl-down"]'), { disabled: !s.deployed || s.replicas <= 0 });
    syncBtn(doc.querySelector('[data-action="repl-up"]'), { disabled: !s.deployed || s.replicas >= 6 });
    var readout = doc.getElementById("replica-readout");
    if (readout && readout.textContent !== String(s.replicas)) readout.textContent = String(s.replicas);

    // rolling update row
    var rolling = doc.getElementById("rolling-row");
    if (rolling) {
      var dipLabel = s.updatedTag === D.M12_TAG
        ? (s.availability < 100 ? "RE-ROLL 1.5.0 — fix availability (" + s.availability + "%)" : "LIVE: " + D.M12_TAG + " ✓")
        : "ROLLING UPDATE → " + D.M12_TAG;
      var html = '<button type="button" class="btn plain-line" data-action="rolling"' +
        (!s.deployed || (s.updatedTag === D.M12_TAG && s.availability === 100) ? " disabled" : "") + ">" +
        icon("boxes", "icon sm") + " " + dipLabel + "</button>" +
        '<span class="badge ' + (s.availability === 100 ? "avail-ok" : "avail-bad") + '">availability ' + s.availability + "%</span>";
      if (rolling.__h !== U.hashHtml(html)) { rolling.innerHTML = html; rolling.__h = U.hashHtml(html); }
    }

    // discovery
    var discInput = doc.querySelector('[data-change="discovery"]');
    if (discInput) { discInput.checked = s.discoveryOn; }
    var dbox = doc.getElementById("discovery-box");
    if (dbox) {
      var dHtml = s.discoveryOn
        ? '<div class="discovery-box" aria-label="Service discovery resolution">portal.internal      → 10.42.0.' + (5 + s.replicas) + "  (live VIP)<br>portal.internal:3000 → round-robins across " + Math.max(s.replicas, 1) + " replica(s)<br>orders-db.internal   → 10.42.0.9 (stateful, singleton)</div>"
        : "";
      if (dbox.__h !== U.hashHtml(dHtml)) { dbox.innerHTML = dHtml; dbox.__h = U.hashHtml(dHtml); }
    }

    // orders-db card
    var pvBadge = doc.getElementById("pv-badge");
    if (pvBadge) {
      pvBadge.className = "badge orders-badge " + (s.pvBound ? "bound" : "unbound");
      pvBadge.textContent = s.pvBound ? "pv-orders-01 bound" : "NO VOLUME";
    }
    syncBtn(doc.querySelector('[data-action="bind-pv"]'), {
      disabled: s.pvBound,
      label: icon("volume2", "icon sm") + (s.pvBound ? " PERSISTENT VOLUME BOUND ✓" : " BIND PERSISTENT VOLUME"),
    });
    var bindBtn = doc.querySelector('[data-action="bind-pv"]');
    if (bindBtn) { bindBtn.classList.toggle("done-teal", s.pvBound); bindBtn.classList.toggle("stamp", !s.pvBound); }
    var dc = doc.getElementById("data-check");
    if (dc) {
      var dcHtml = s.ordersDataIntact === null ? "" :
        '<p class="data-check ' + (s.ordersDataIntact ? "ok" : "lost") + '" role="status">' +
        (s.ordersDataIntact
          ? "DATA CHECK: cart sessions INTACT — the volume re-attached to the replacement container."
          : "DATA CHECK: cart sessions LOST — container storage is ephemeral; no volume was bound.") + "</p>";
      if (dc.__h !== U.hashHtml(dcHtml)) { dc.innerHTML = dcHtml; dc.__h = U.hashHtml(dcHtml); }
    }

    // node grid + warning
    U.patchList(doc.getElementById("node-grid"), D.NODES, function (n) { return n; }, function (n) {
      return nodeCardHtml(n, D.NODES.indexOf(n), slots, s.deployed);
    });
    var warn = doc.getElementById("node-warn");
    if (warn) {
      var wHtml = !s.deployed
        ? '<p class="node-warn">' + icon("alertTriangle", "icon xs") + " Nothing deployed — the cranes have no cargo yet.</p>"
        : "";
      if (warn.__h !== U.hashHtml(wHtml)) { warn.innerHTML = wHtml; warn.__h = U.hashHtml(wHtml); }
    }
    var nodePanelTitle = doc.querySelector("#node-grid") ? doc.querySelector("#node-grid").closest(".panel").querySelector(".panel-title") : null;
    if (nodePanelTitle) nodePanelTitle.textContent = "Node grid — " + D.NODES.length + " nodes, " + liveReplicas + " live container(s)";

    // feed (append-only patch)
    var feed = doc.getElementById("feed");
    if (feed) {
      var lines = state().feed;
      U.patchList(feed, lines, function (f) { return f.id; }, function (f) {
        return '<p class="feed-line ' + f.kind + '"><span class="t">' + esc(f.t) + "</span> " + esc(f.text) + "</p>";
      });
      if (lines.length === 0 && !feed.querySelector(".feed-empty")) {
        feed.innerHTML = '<p class="feed-empty">— quiet deck. Actions here will be logged as evidence —</p>';
      } else if (lines.length > 0) {
        var emp = feed.querySelector(".feed-empty");
        if (emp) emp.remove();
        feed.scrollTop = feed.scrollHeight;
      }
    }

    // amendments
    var noteEl = doc.getElementById("amendments-note");
    if (noteEl) {
      var nHtml = "Each switch removes a named risk. " + (isHard() ? "Sequence is graded (H7): storage before stateful scale-out." : "");
      if (noteEl.__h !== U.hashHtml(nHtml)) { noteEl.innerHTML = nHtml; noteEl.__h = U.hashHtml(nHtml); }
    }
    var fixCount = D.AMENDMENTS.filter(function (a) { return s.fixes[a.id]; }).length;
    var fc = doc.getElementById("fix-count");
    if (fc) {
      fc.className = "badge fixcount " + (fixCount === D.AMENDMENTS.length ? "done" : "pending");
      fc.textContent = fixCount + "/" + D.AMENDMENTS.length + " applied";
    }
    doc.querySelectorAll("#amendments [data-fix]").forEach(function (input) {
      var id = input.getAttribute("data-fix");
      input.checked = !!s.fixes[id];
    });
    var m10 = doc.getElementById("m10-check");
    if (m10) {
      var m10Html = !isHard() ? U.stampCheck("M10", "CHECK RESULTS — M10") + '<div data-banner="M10"></div>' : "";
      if (m10.__h !== U.hashHtml(m10Html)) { m10.innerHTML = m10Html; m10.__h = U.hashHtml(m10Html); }
    }

    // task panels (static per mode) + syncs
    var tasksEl = doc.getElementById("crane-tasks");
    var tasksHtml = craneTasksHtml();
    if (tasksEl && tasksEl.__h !== U.hashHtml(tasksHtml)) { tasksEl.innerHTML = tasksHtml; tasksEl.__h = U.hashHtml(tasksHtml); }

    if (isHard()) {
      var h6Solved = isSolved("H6");
      doc.querySelectorAll('#h6-lines [data-change="h6"]').forEach(function (input) {
        var n = Number(input.getAttribute("data-line"));
        input.checked = s.h6Picks.includes(n);
        input.disabled = h6Solved;
        var label = input.closest(".manifest-line");
        label.classList.toggle("picked", s.h6Picks.includes(n) && !h6Solved);
        label.classList.toggle("correct", h6Solved && D.H6_ANSWER.includes(n));
        var span = label.querySelector(".ml-text");
        span.classList.toggle("bad-text", h6Solved && D.H6_ANSWER.includes(n));
        var why = doc.querySelector('[data-why="' + n + '"]');
        if (why) why.hidden = !(s.h6Picks.includes(n) && h6Solved && D.H6_ANSWER.includes(n));
      });
      var btnH6 = doc.querySelector('[data-obj="H6"][data-action="check"]');
      if (btnH6) btnH6.disabled = s.h6Picks.length === 0 || h6Solved;
      syncRadios(doc.getElementById("h5-a"), s.h5Storage, { disabled: isSolved("H5"), solved: isSolved("H5"), correctId: "nopv" });
      syncRadios(doc.getElementById("h5-b"), s.h5Latency, { disabled: isSolved("H5"), solved: isSolved("H5"), correctId: "nolimits" });
      var btnH5 = doc.querySelector('[data-obj="H5"][data-action="check"]');
      if (btnH5) btnH5.disabled = !s.h5Storage || !s.h5Latency || isSolved("H5");
      var seq = doc.getElementById("fix-seq");
      if (seq) seq.textContent = "Your sequence so far: " + (s.fixOrder.length ? s.fixOrder.join(" → ") : "(none)");
    }
    ["M7", "M8", "M9", "M10", "M12", "H5", "H6", "H7", "H9"].forEach(paintBanner);
  }

  /* ================================================================
     ZONE 5 — Manifest Office (M6 / H4)
     ================================================================ */

  var MODELS = ["vm", "container", "serverless", "saas"];

  function officeHtml() {
    var objId = isHard() ? "H4" : "M6", solved = isSolved(objId);
    var head = U.zoneHeader(5, "Manifest Office", "Workload intake — route every cargo to the right compute model", [objId], solved ? [objId] : []);
    var cards = D.WORKLOADS.map(function (w, idx) { return workloadCardHtml(w, idx); }).join("");
    return '<section id="zone-office" aria-labelledby="office-title">' +
      '<div id="office-header">' + head + "</div>" +
      '<h2 id="office-title" class="sr-only">Manifest Office — workload placement</h2>' +
      '<p class="office-intro">Six intake cards have arrived from the fleet. Route each one to its compute model — the CV0-004 compare-and-contrast skill: ' + U.gchip("Microservices") + "-style services love containers, legacy OS dependencies stay on VMs, event-driven bursts go serverless, buy-not-build becomes SaaS.</p>" +
      '<div class="workload-list" id="workloads">' + cards + "</div>" +
      '<div class="mt-4" id="office-check"></div>' +
      '<p class="office-footnote">' + icon("clipboardList", "icon xs") + " W5 is stateful: containers are still right under the cloud-native-first mandate — you handled its " + U.gchip("Persistent volume") + " requirement on the Crane Deck.</p>" +
      "</section>";
  }

  function workloadCardHtml(w, idx) {
    var solved = isSolved(isHard() ? "H4" : "M6");
    var chosen = state().env.placement[w.id] ?? null;
    var correct = solved && chosen === w.answer;
    var modelBtns = MODELS.map(function (m) {
      return '<label class="btn radio" title="' + esc(D.MODEL_META[m].hint) + '">' +
        '<input type="radio" name="place-' + w.id + '" value="' + m + '"><span>' + esc(D.MODEL_META[m].label) + "</span></label>";
    }).join("");
    var justifyBox = "";
    if (isHard() && w.justify) {
      justifyBox = '<div class="justify-box" data-justify="' + w.id + '"' + (chosen ? "" : " hidden") + ">" +
        '<p class="justify-prompt">' + esc(w.justify.prompt) + "</p>" +
        '<div class="stack-4" role="radiogroup" aria-label="' + esc(w.justify.prompt) + '">' +
        w.justify.options.map(function (o) {
          return '<label class="btn opt"><input type="radio" name="just-' + w.id + '" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
        }).join("") + "</div></div>";
    }
    return '<div class="workload-card' + (correct ? " correct" : "") + '" data-workload="' + w.id + '">' +
      '<div class="workload-inner"><div class="workload-info">' +
        '<div class="workload-name-row"><span class="w-plate">W' + (idx + 1) + '</span><h3 class="workload-name">' + esc(w.name) + "</h3>" +
        '<span class="pkg-check" hidden>' + icon("packageCheck", "icon sm") + "</span></div>" +
        '<p class="workload-desc">' + esc(w.desc) + "</p>" +
        '<p class="workload-correct-berth" data-correct-berth hidden></p>' +
        justifyBox +
      "</div>" +
      '<div class="berth-picker" role="radiogroup" aria-label="Route ' + esc(w.name) + '">' +
        '<p class="berth-picker-kicker">assign berth</p>' + modelBtns + "</div>" +
      "</div></div>";
  }

  function updateOffice() {
    var env = state().env, objId = isHard() ? "H4" : "M6", solved = isSolved(objId);
    var head = U.zoneHeader(5, "Manifest Office", "Workload intake — route every cargo to the right compute model", [objId], solved ? [objId] : []);
    var h = doc.getElementById("office-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    D.WORKLOADS.forEach(function (w) {
      var card = doc.querySelector('[data-workload="' + w.id + '"]');
      if (!card) return;
      var chosen = env.placement[w.id] ?? null;
      var correct = solved && chosen === w.answer;
      card.classList.toggle("correct", correct);
      card.querySelector(".pkg-check").hidden = !(solved && chosen === w.answer);
      var berth = card.querySelector("[data-correct-berth]");
      if (solved && chosen && chosen !== w.answer) {
        berth.hidden = false;
        berth.textContent = "✓ correct berth: " + D.MODEL_META[w.answer].label;
      } else berth.hidden = true;
      syncRadios(card.querySelector(".berth-picker"), chosen, { disabled: solved, solved: solved, correctId: w.answer });
      if (isHard() && w.justify) {
        var box = card.querySelector("[data-justify]");
        if (box) {
          box.hidden = !chosen;
          syncRadios(box, env.justify[w.id] ?? null, { disabled: solved, solved: solved, correctId: w.justify.answer, softSelected: true });
          box.querySelectorAll("label.btn").forEach(function (l) {
            l.classList.toggle("selected-soft", l.querySelector("input").checked);
          });
        }
      }
    });

    var allPlaced = D.WORKLOADS.every(function (w) { return env.placement[w.id]; });
    var allJustified = D.WORKLOADS.filter(function (w) { return w.justify; }).every(function (w) { return env.justify[w.id]; });
    var checkWrap = doc.getElementById("office-check");
    if (checkWrap) {
      var html = U.stampCheck(objId, isHard() ? "CHECK RESULTS — H4" : "CHECK RESULTS — M6",
        !allPlaced || (isHard() && !allJustified) || solved) + '<div data-banner="' + objId + '"></div>';
      if (checkWrap.__h !== U.hashHtml(html)) { checkWrap.innerHTML = html; checkWrap.__h = U.hashHtml(html); }
    }
    paintBanner(objId);
  }

  /* ================================================================
     ZONE 6 — Customs Desk (M11 / H8)
     ================================================================ */

  function customsHtml() {
    var objId = isHard() ? "H8" : "M11", solved = isSolved(objId);
    var head = U.zoneHeader(6, "Customs Desk", "Who owns what? Stamp the shared-responsibility split", [objId], solved ? [objId] : []);
    var statements = isHard() ? D.SR_STATEMENTS : D.SR_STATEMENTS.filter(function (st) { return D.M11_STATEMENTS.includes(st.id); });
    var rows = statements.map(function (st) {
      return '<li class="sr-row" data-sr="' + st.id + '"><div class="sr-row-inner">' +
        '<p class="sr-text">' + icon("landmark", "icon sm") + "<span>" + esc(st.text) + '</span><span class="sr-stamp" hidden>' + icon("stamp", "icon sm") + "</span></p>" +
        '<div class="sr-stamps" role="radiogroup" aria-label="Stamp: ' + esc(st.text) + '">' +
          '<label class="btn radio"><input type="radio" name="sr-' + st.id + '" value="provider"><span>PROVIDER</span></label>' +
          '<label class="btn radio"><input type="radio" name="sr-' + st.id + '" value="customer"><span>CUSTOMER</span></label>' +
        "</div></div></li>";
    }).join("");
    var residual = isHard()
      ? '<div class="mt-4">' + U.panel("Task H8b — name the residual risk",
          '<p class="residual-intro">' + icon("shieldAlert", "icon sm") + "<span>Every control is now applied — pinning, limits, healthchecks, replicas, non-root, volumes, scanning. Which risk <strong>legitimately remains</strong>?</span></p>" +
          '<div class="residual-list" role="radiogroup" aria-label="Residual risk" id="residual">' +
          D.RESIDUAL_RISK_OPTIONS.map(function (o) {
            return '<label class="btn opt"><input type="radio" name="residual" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
          }).join("") + "</div>") + "</div>"
      : "";
    return '<section id="zone-customs" aria-labelledby="customs-title">' +
      '<div id="customs-header">' + head + "</div>" +
      '<h2 id="customs-title" class="sr-only">Customs Desk — shared responsibility</h2>' +
      U.panel("Responsibility stamping — managed container service",
        '<p class="lead-text">For every duty arriving at customs, stamp <span class="badge sr-provider mono">PROVIDER</span> (the cloud platform runs it) or <span class="badge sr-customer mono">CUSTOMER</span> (you own it in a managed container service). Mis-stamping is how unpatched images slip through while everyone assumes somebody else had it.</p>' +
        '<ul class="sr-list" id="sr-list">' + rows + "</ul>") +
      residual +
      '<div class="mt-4" id="customs-check"></div>' +
      "</section>";
  }

  function updateCustoms() {
    var env = state().env, objId = isHard() ? "H8" : "M11", solved = isSolved(objId);
    var head = U.zoneHeader(6, "Customs Desk", "Who owns what? Stamp the shared-responsibility split", [objId], solved ? [objId] : []);
    var h = doc.getElementById("customs-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    doc.querySelectorAll("#sr-list [data-sr]").forEach(function (row) {
      var st = D.SR_STATEMENTS.find(function (x) { return x.id === row.getAttribute("data-sr"); });
      var val = env.srMap[st.id] ?? null;
      var correct = solved && val === st.answer;
      row.classList.toggle("correct", correct);
      row.querySelector(".sr-stamp").hidden = !correct;
      var group = row.querySelector(".sr-stamps");
      syncRadios(group, val, { disabled: solved });
      group.querySelectorAll("label.btn").forEach(function (l) {
        var input = l.querySelector("input");
        l.classList.toggle("correct", correct && st.answer === input.value);
        l.classList.toggle("sr-provider-selected", input.checked && input.value === "provider" && !correct);
        l.classList.toggle("sr-customer-selected", input.checked && input.value === "customer" && !correct);
      });
    });

    if (isHard()) {
      syncRadios(doc.getElementById("residual"), env.residualPick, { disabled: solved, solved: solved, correctId: D.RESIDUAL_RISK_ANSWER, softSelected: true });
      doc.querySelectorAll("#residual label.btn").forEach(function (l) {
        l.classList.toggle("selected-soft", l.querySelector("input").checked);
      });
    }

    var statements = isHard() ? D.SR_STATEMENTS : D.SR_STATEMENTS.filter(function (st) { return D.M11_STATEMENTS.includes(st.id); });
    var allStamped = statements.every(function (st) { return env.srMap[st.id]; });
    var checkWrap = doc.getElementById("customs-check");
    if (checkWrap) {
      var html = U.stampCheck(objId, isHard() ? "CHECK RESULTS — H8" : "CHECK RESULTS — M11",
        !allStamped || (isHard() && !env.residualPick) || solved) + '<div data-banner="' + objId + '"></div>';
      if (checkWrap.__h !== U.hashHtml(html)) { checkWrap.innerHTML = html; checkWrap.__h = U.hashHtml(html); }
    }
    paintBanner(objId);
  }

  /* ================================================================
     ZONE 7 — Incident File #1042 (M5 / H3)
     ================================================================ */

  function incidentHtml() {
    var objId = isHard() ? "H3" : "M5", solved = isSolved(objId);
    var head = U.zoneHeader(7, "Incident File #1042", "“It works on my machine” — staging crashes, dev is fine", [objId], solved ? [objId] : []);
    var task = isHard() ? incidentHardHtml() : incidentMediumHtml();
    return '<section id="zone-incident" aria-labelledby="incident-title">' +
      '<div id="incident-header">' + head + "</div>" +
      '<h2 id="incident-title" class="sr-only">Incident file — portability forensics</h2>' +
      '<div class="incident-brief"><strong>Briefing:</strong> CargoPortal builds and serves perfectly on the lead engineer&#39;s laptop. On staging, the container crashes at boot. Six evidence items are in the file — some <span class="badge neutral">red herrings</span>. Find the truth about ' + U.gchip("Portability") + ": the image — not the host — is the contract.</div>" +
      '<div class="evidence-grid" id="evidence"></div>' +
      '<div class="mt-4 grid-2" id="incident-tasks">' + task +
        U.panel("Field note — why this incident matters",
          '<p class="field-note">Dependencies installed by hand on a laptop are invisible to the build. When the image is finally deployed somewhere clean, the gap surfaces as a crash — or worse, as silent behavior change. The professional reflex on the exam and on the job: <strong>bake it into the image, pin it, and let the registry carry it everywhere</strong>.</p>') +
      "</div></section>";
  }

  function incidentMediumHtml() {
    return U.panel("Task M5 — select the TWO root-cause snippets",
      '<p class="lead-text">Exactly two evidence items, together, prove why staging fails while dev works. The rest is noise.</p>' +
      U.stampCheck("M5", "CHECK RESULTS — M5") + '<div data-banner="M5"></div>');
  }

  function incidentHardHtml() {
    return U.panel("Task H3 — name the module, choose the durable fix (strict)",
      '<p class="lead-text">Type the exact missing module name (as it appears in the logs), then pick the fix that removes the <em>class</em> of failure.</p>' +
      '<div class="row-wrap mb-3"><input type="text" class="text-input" data-change="h3-module" placeholder="module name" aria-label="Exact missing module name"></div>' +
      '<div class="stack-4 mb-3" role="radiogroup" aria-label="Durable fix" id="h3-fix">' +
      D.H3_FIX_OPTIONS.map(function (o) {
        return '<label class="btn opt"><input type="radio" name="h3-fix" value="' + o.id + '"><span>' + esc(o.label) + "</span></label>";
      }).join("") + "</div>" +
      U.stampCheck("H3", "CHECK RESULTS — H3") + '<div data-banner="H3"></div>');
  }

  function evidenceCardHtml(e) {
    var s = state().env;
    var solved = isSolved(isHard() ? "H3" : "M5");
    var picked = s.incidentPicks.includes(e.id);
    var highlight = solved && ["e1", "e2"].includes(e.id);
    return '<button type="button" class="btn evidence-card' +
      (highlight ? " highlight" : picked ? " picked" : e.redHerring ? " herring" : "") +
      '" data-action="evidence" data-ev="' + e.id + '" data-fr="ev-' + e.id + '" aria-pressed="' + picked + '"' + (solved ? " disabled" : "") + ">" +
      '<span class="evidence-head"><span class="evidence-label">' + icon("fileSearch", "icon xs") + " " + esc(e.label) + "</span>" +
      (e.redHerring && solved ? '<span class="badge herring">' + icon("fish", "icon xs") + " herring</span>" : "") +
      "</span><span class=\"evidence-body\">" + esc(e.body) + "</span></button>";
  }

  function updateIncident() {
    var env = state().env, objId = isHard() ? "H3" : "M5", solved = isSolved(objId);
    var head = U.zoneHeader(7, "Incident File #1042", "“It works on my machine” — staging crashes, dev is fine", [objId], solved ? [objId] : []);
    var h = doc.getElementById("incident-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    U.patchList(doc.getElementById("evidence"), D.INCIDENT_EVIDENCE, function (e) { return e.id; }, evidenceCardHtml);

    if (isHard()) {
      var input = doc.querySelector('[data-change="h3-module"]');
      if (input) {
        if (doc.activeElement !== input && input.value !== env.h3Module) input.value = env.h3Module;
        input.disabled = solved;
      }
      syncRadios(doc.getElementById("h3-fix"), env.h3Fix, { disabled: solved, solved: solved, correctId: D.H3_FIX_ANSWER, softSelected: true });
      doc.querySelectorAll("#h3-fix label.btn").forEach(function (l) {
        l.classList.toggle("selected-soft", l.querySelector("input").checked);
      });
      var btn = doc.querySelector('[data-obj="H3"][data-action="check"]');
      if (btn) btn.disabled = !env.h3Module || !env.h3Fix || solved;
    } else {
      var btnM5 = doc.querySelector('[data-obj="M5"][data-action="check"]');
      if (btnM5) btnM5.disabled = env.incidentPicks.length === 0 || solved;
    }
    paintBanner(objId);
  }

  /* ================================================================
     ZONE 8 — Board of Inquiry quiz (C5)
     ================================================================ */

  function quizData() { return isHard() ? D.HARD_QUIZ : D.MEDIUM_QUIZ; }

  function quizHtml() {
    return '<section id="zone-quiz" aria-labelledby="quiz-title">' +
      '<div id="quiz-header"></div>' +
      '<h2 id="quiz-title" class="sr-only">Knowledge check quiz</h2>' +
      '<div class="quiz-toolbar" id="quiz-toolbar"></div>' +
      '<ol class="quiz-list" id="quiz-list"></ol>' +
      "</section>";
  }

  function quizItemHtml(q, idx, s) {
    var answers = s.quiz.answers, finished = s.quiz.finished;
    var given = answers[q.id] ?? null;
    var isRight = given === q.answer;
    var activeIdx = (function () {
      var i = quizData().findIndex(function (qq) { return !answers[qq.id]; });
      return i === -1 ? quizData().length - 1 : i;
    })();
    var isLockedFuture = !finished && !given && idx > activeIdx;
    var verdict = given ? (isRight ? "Correct." : "Not it.") : null;

    if (isLockedFuture) {
      return '<li><div class="panel">' +
        '<h3 class="panel-title">Question ' + (idx + 1) + " of " + quizData().length + "</h3>" +
        '<p class="quiz-lock">' + icon("lock", "icon sm") +
        " This case unlocks after you answer Question " + idx + ". Answer the active question above to proceed.</p></div></li>";
    }
    if (given) {
      var chosen = q.options.find(function (o) { return o.id === given; });
      return '<li><div class="panel">' +
        '<h3 class="panel-title">Question ' + (idx + 1) + " of " + quizData().length + "</h3>" +
        '<p class="quiz-q">' + esc(q.q) + "</p>" +
        '<p class="quiz-given"><span class="letter">' + esc(given.toUpperCase()) + '.</span> ' + esc(chosen ? chosen.label : "") + "</p>" +
        '<div class="quiz-verdict-row">' +
          '<span class="badge ' + (isRight ? "verdict-pass" : "verdict-fail") + ' mono">' + icon(isRight ? "checkCircle2" : "xCircle", "icon xs") + " " + verdict + "</span>" +
          '<span class="quiz-topic">topic: ' + esc(q.topic) + "</span></div>" +
        '<p class="quiz-feedback ' + (isRight ? "pass" : "fail") + '" role="status">' + icon("info", "icon xs") + "<span><strong>" + verdict + "</strong> " + esc(q.why) +
          (!isRight && q.wrong && q.wrong[given] ? "<em style=\"display:block\">Your pick: " + esc(q.wrong[given]) + "</em>" : "") + "</span></p>" +
        "</div></li>";
    }
    // active case
    return '<li><div class="panel">' +
      '<h3 class="panel-title">Question ' + (idx + 1) + " of " + quizData().length + " — active</h3>" +
      (q.scenario ? '<p class="quiz-scenario">' + esc(q.scenario) + "</p>" : "") +
      '<p class="quiz-q">' + esc(q.q) + "</p>" +
      '<div class="quiz-options" role="group" aria-label="' + esc(q.q) + '">' +
      q.options.map(function (o) {
        return '<button type="button" class="btn quiz-opt" data-action="quiz-answer" data-qid="' + q.id + '" data-opt="' + o.id + '" aria-pressed="false">' +
          '<span class="opt-letter">' + o.id.toUpperCase() + "</span>" + esc(o.label) + "</button>";
      }).join("") + "</div>" +
      '<p class="quiz-help">' + icon("chevronDown", "icon xs") + " Picking an option stamps your verdict immediately — answers lock once stamped, and the next case opens.</p>" +
      "</div></li>";
  }

  function updateQuiz() {
    var s = state();
    var quiz = quizData();
    var head = U.zoneHeader(8, "Board of Inquiry",
      isHard() ? "Scenario-based knowledge check — apply, don't recall" : "Concept check — every answer explains itself", [], []);
    var h = doc.getElementById("quiz-header");
    if (h && h.__h !== U.hashHtml(head)) { h.innerHTML = head; h.__h = U.hashHtml(head); }

    var answeredCount = quiz.filter(function (q) { return s.quiz.answers[q.id]; }).length;
    var correctCount = quiz.filter(function (q) { return s.quiz.answers[q.id] === q.answer; }).length;
    var allAnswered = answeredCount === quiz.length;

    var toolbar = doc.getElementById("quiz-toolbar");
    if (toolbar) {
      var html = '<span class="badge outline mono sm" style="border-color:var(--stone-300);background:#fff;color:var(--stone-700)">' +
        answeredCount + "/" + quiz.length + " answered</span>" +
        (s.quiz.finished ? '<span class="badge verdict-pass mono sm">' + correctCount + "/" + quiz.length + " correct</span>" : "") +
        '<button type="button" class="btn stamp" data-action="submit-quiz"' + (!allAnswered || s.quiz.finished ? " disabled" : "") + ">" +
        icon("gavel", "icon sm") + " SUBMIT BOARD</button>";
      if (toolbar.__h !== U.hashHtml(html)) { toolbar.innerHTML = html; toolbar.__h = U.hashHtml(html); }
    }
    U.patchList(doc.getElementById("quiz-list"), quiz, function (q) { return q.id; }, function (q) {
      return quizItemHtml(q, quiz.indexOf(q), s);
    });
  }

  /* ================================================================
     exports
     ================================================================ */

  global.HarborZones = {
    briefingHtml: briefingHtml,
    knowledgeHtml: knowledgeHtml,
    logbookHtml: logbookHtml,
    berthHtml: berthHtml, updateBerth: updateBerth,
    buildHtml: buildHtml, updateBuild: updateBuild,
    registryHtml: registryHtml, updateRegistry: updateRegistry,
    craneHtml: craneHtml, updateCrane: updateCrane,
    officeHtml: officeHtml, updateOffice: updateOffice,
    customsHtml: customsHtml, updateCustoms: updateCustoms,
    incidentHtml: incidentHtml, updateIncident: updateIncident,
    quizHtml: quizHtml, updateQuiz: updateQuiz,
    runCheck: runCheck,
    resetResults: resetResults,
    results: results,
    sharedCount: sharedCount,
  };
})(window);
