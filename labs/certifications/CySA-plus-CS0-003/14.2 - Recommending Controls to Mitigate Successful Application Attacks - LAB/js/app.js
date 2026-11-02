/* ==========================================================================
   GATEHOUSE lab — js/app.js
   Application shell and stage renderers. Ported 1:1 from the original
   framework lab (lab.tsx, rails.tsx, stage-*.tsx): same checkpoints, same
   interactions, same wording, same validation flow, same persistence and
   reset semantics.
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});
  var D = GH.DATA;
  var el = GH.el;
  var icon = GH.icon;
  var A = GH.actions;

  var root = document.getElementById("root");
  var app = (GH.app = {});
  app.goStage = goStage;

  var STAGES = [
    { id: "brief", label: "Briefing", icon: "ScrollText" },
    { id: "doctrine", label: "Doctrine", icon: "BookMarked" },
    { id: "evidence", label: "Evidence", icon: "ClipboardList" },
    { id: "gates", label: "Gates", icon: "SlidersHorizontal" },
    { id: "triage", label: "Triage", icon: "Siren" },
    { id: "quiz", label: "Knowledge check", icon: "GraduationCap" },
    { id: "debrief", label: "Debrief", icon: "FileCheck2" },
  ];

  var CHECKPOINTS = [
    ["brief", "Briefing — the incident and your mission"],
    ["doctrine", "Doctrine — attacks, controls, real-world cases"],
    ["evidence", "Evidence locker — logs, uploads, config, memos"],
    ["gates", "Gates — configure controls, run the request pipeline"],
    ["triage", "Triage — alerts, hunting rules, response sequencing"],
    ["quiz", "Knowledge check"],
    ["debrief", "Debrief — field notes & completion report"],
  ];

  var PILLARS = ["all", "understand", "recognize", "detect", "mitigate"];

  /* ==========================================================================
     MODE SELECT (boot screen)
     ========================================================================== */

  function renderModeSelect() {
    GH.offScope("shell");
    GH.offScope("stage");
    root.textContent = "";
    var s = GH.state;
    var hasSave = s.booted && !!s.mode;

    var mediumCard = el(
      "button",
      {
        type: "button",
        class: "ms-card ms-card--medium fade-up fade-up--1",
        onclick: function () {
          A.chooseMode("medium");
        },
      },
      el(
        "div",
        { class: "ms-card__eyebrow-row" },
        icon("Compass", "icon--amber"),
        el("span", { class: "ms-card__eyebrow ms-card__eyebrow--medium" }, "Medium")
      ),
      el("h2", { class: "ms-card__title" }, "Guided hardening shift"),
      el(
        "ul",
        { class: "ms-card__list" },
        el("li", null, "· 12 granular objectives, introduced in order"),
        el("li", null, "· Three-tier hints, always available (they trim your stars)"),
        el("li", null, "· Tolerant checks — wrong answers teach, never punish"),
        el("li", null, "· Concept quiz after practice")
      ),
      el(
        "p",
        { class: "ms-card__hint ms-card__hint--medium" },
        "Best first run — you will never be lost about what to do next."
      )
    );

    var hardCard = el(
      "button",
      {
        type: "button",
        class: "ms-card ms-card--hard fade-up fade-up--2",
        onclick: function () {
          A.chooseMode("hard");
        },
      },
      el(
        "div",
        { class: "ms-card__eyebrow-row" },
        icon("Flame", "icon--rose"),
        el("span", { class: "ms-card__eyebrow ms-card__eyebrow--hard" }, "Hard")
      ),
      el("h2", { class: "ms-card__title" }, "Red-team re-test"),
      el(
        "ul",
        { class: "ms-card__list" },
        el("li", null, "· 10 broad multi-step challenges, discovery-first"),
        el("li", null, "· Noisy evidence with deliberate red herrings"),
        el("li", null, "· Strict validation — exact values, exact sequences"),
        el("li", null, "· One optional nudge, and it costs stars")
      ),
      el(
        "p",
        { class: "ms-card__hint ms-card__hint--hard" },
        "For analysts who already know the doctrine and want the exam to feel easy."
      )
    );

    var wrap = el(
      "div",
      { class: "ms-wrap" },
      el(
        "div",
        { class: "ms-head fade-up" },
        el("p", { class: "ms-eyebrow" }, "Veridian Health · Security Operations"),
        el("h1", { class: "ms-title" }, "GATEHOUSE"),
        el(
          "p",
          { class: "ms-sub" },
          "An application-controls lab for ",
          el("span", { class: "ms-sub__em" }, D.ORG.cert),
          ". You will investigate a successful application attack, then recommend and configure the controls that defeat it — input validation and sanitization, access control, encryption — and prove your configuration against live simulated traffic."
        ),
        el(
          "p",
          { class: "ms-legal" },
          "Synthetic training data only · fictional organization · defensive framing"
        )
      ),
      el("div", { class: "ms-grid" }, mediumCard, hardCard),
      hasSave
        ? el(
            "p",
            { class: "ms-save" },
            "A saved shift was found — picking a mode resumes it; RESET in the header wipes it."
          )
        : null
    );
    root.appendChild(wrap);
  }

  /* ==========================================================================
     SHELL — header, checkpoint nav, stage host, objectives rail
     ========================================================================== */

  var stageHost = null;
  var navButtons = []; // [{btn, id}] — both nav instances

  function goStage(id) {
    if (GH.state.activeStage === id) return;
    A.setActiveStage(id);
  }

  function refreshHeader() {
    var s = GH.state;
    if (!s.mode) return;
    var defs = GH.OBJECTIVES[s.mode];
    var doneCount = defs.filter(function (d) {
      return s.objState[d.id] && s.objState[d.id].done;
    }).length;
    headerCount.textContent = doneCount + "/" + defs.length;
    headerBtnCount.textContent = doneCount + "/" + defs.length;
  }

  var headerCount = null;
  var headerBtnCount = null;

  function renderHeader() {
    var s = GH.state;
    var defs = GH.OBJECTIVES[s.mode];
    var doneCount = defs.filter(function (d) {
      return s.objState[d.id] && s.objState[d.id].done;
    }).length;

    headerCount = el(
      "span",
      { class: "hdr-count hide-below-sm", "aria-live": "polite" },
      icon("ListChecks", "icon--emerald icon--tiny"),
      String(doneCount) + "/" + defs.length
    );
    headerBtnCount = el("span", { class: "hide-below-md" }, doneCount + "/" + defs.length);

    var inner = el(
      "div",
      { class: "hdr-inner" },
      el(
        "div",
        { class: "brand" },
        el("span", { class: "brand__g", "aria-hidden": "true" }, "G"),
        el(
          "div",
          { class: "brand__text" },
          el("p", { class: "brand__name" }, "GATEHOUSE"),
          el(
            "p",
            { class: "brand__sub hide-below-sm" },
            "CySA+ CS0-003 · Lesson 14.2 · application attack controls"
          )
        )
      ),
      el("span", { class: "mode-badge mode-badge--" + s.mode }, s.mode),
      el(
        "div",
        { class: "hdr-actions" },
        headerCount,
        el(
          "button",
          {
            type: "button",
            class: "btn btn--ghost btn--sm",
            "aria-label": "Open glossary",
            onclick: function () {
              openGlossary();
            },
          },
          icon("BookMarked"),
          el("span", { class: "hide-below-md" }, "Glossary")
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn btn--ghost btn--sm hide-on-xl",
            "aria-label": "Open objectives tracker",
            onclick: function () {
              openObjectivesSheet();
            },
          },
          icon("ListChecks"),
          headerBtnCount
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn btn--ghost btn--btn-reset",
            "aria-label": "Reset the lab",
            onclick: function () {
              confirmReset();
            },
          },
          icon("RotateCcw"),
          el("span", { class: "hide-below-md" }, "Reset")
        )
      )
    );
    return el("header", { class: "hdr" }, inner);
  }

  function buildCheckpointNav(vertical) {
    var s = GH.state;
    var nav = el("nav", {
      class: "ckpt-nav" + (vertical ? " ckpt-nav--vertical" : ""),
      "aria-label": "Lab checkpoints",
    });
    STAGES.forEach(function (st, i) {
      var active = s.activeStage === st.id;
      var b = el(
        "button",
        {
          type: "button",
          class: "ckpt-btn" + (active ? " ckpt-btn--active" : ""),
          "aria-current": active ? "page" : null,
          onclick: function () {
            goStage(st.id);
          },
        },
        el(
          "span",
          { class: "ckpt-num" + (active ? " ckpt-num--active" : "") },
          String(i + 1)
        ),
        icon(st.icon, "ckpt-icon hide-below-sm"),
        el("span", { class: vertical ? "" : "nowrap" }, st.label)
      );
      b.__stageId = st.id;
      navButtons.push({ btn: b, id: st.id });
      nav.appendChild(b);
    });
    return nav;
  }

  function refreshNav() {
    var s = GH.state;
    navButtons.forEach(function (n) {
      var active = s.activeStage === n.id;
      n.btn.classList.toggle("ckpt-btn--active", active);
      n.btn.querySelector(".ckpt-num").classList.toggle("ckpt-num--active", active);
      if (active) n.btn.setAttribute("aria-current", "page");
      else n.btn.removeAttribute("aria-current");
    });
  }

  /* ------------------------------- stage switch ---------------------------- */

  function onStageChanged() {
    refreshNav();
    window.scrollTo({ top: 0 });
    if (!stageHost) return;
    stageHost.classList.add("stage-exit");
    window.setTimeout(function () {
      renderStage();
      stageHost.classList.remove("stage-exit");
    }, 130);
  }

  function renderStage() {
    GH.offScope("stage");
    stageHost.textContent = "";
    var main = el("main", { class: "stage", id: "stage" });
    var body;
    switch (GH.state.activeStage) {
      case "brief":
        body = StageBrief();
        break;
      case "doctrine":
        body = StageDoctrine();
        break;
      case "evidence":
        body = StageEvidence();
        break;
      case "gates":
        body = StageGates();
        break;
      case "triage":
        body = StageTriage();
        break;
      case "quiz":
        body = StageQuiz();
        break;
      case "debrief":
        body = StageDebrief();
        break;
      default:
        body = el("div");
    }
    main.appendChild(body);
    stageHost.appendChild(main);
  }

  /* ==========================================================================
     STAGE 1 — BRIEFING
     ========================================================================== */

  function StageBrief() {
    var s = GH.state;
    var modeP =
      s.mode === "medium"
        ? "Guided hardening shift. Objectives arrive in order, hints are always available (they trim stars, never block you), wrong answers teach. Follow the tracker — you will never be lost."
        : "Red-team re-test. The evidence is noisy, two artifacts are deliberate red herrings, validation is strict and exact. Hints cost stars. Work like it is 02:00 and you are alone.";

    var mission = el(
      "div",
      { class: "card fade-up" },
      el(
        "div",
        { class: "card__head-row" },
        icon("Building2", "icon--amber icon--lg"),
        el(
          "span",
          { class: "mono-label" },
          D.ORG.org + " · " + D.ORG.app + " patient portal · incident " + D.ORG.incident
        )
      ),
      el("h1", { class: "h1" }, "Fourteen hours ago, somebody's patient data walked out of a web form."),
      el(
        "div",
        { class: "stack" },
        el(
          "p",
          { class: "p" },
          "Attackers probed the " +
            D.ORG.app +
            " portal all morning. SQL injection attempts crashed against syntax errors, a script probe bounced through a search page — and then one quiet POST to the document-upload endpoint put a web shell on the server. It ran under a service account that holds ",
          el("em", null, "superadmin"),
          ". 2,300 patient records were exported before anyone noticed."
        ),
        el(
          "p",
          { class: "p" },
          "You are the incident-response analyst on shift. The CISO wants more than a patch: she wants ",
          el("strong", { class: "text-amber" }, "recommended application controls"),
          " — input validation and sanitization, access control, encryption — actually configured in the staging pipeline before a red-team re-test in 48 hours."
        ),
        el(
          "p",
          { class: "mode-of-play" },
          el("strong", { class: "text-zinc" }, "Mode of play: "),
          modeP
        )
      ),
      el(
        "div",
        { class: "chip-row" },
        el(
          "span",
          { class: "chip" },
          icon("FileWarning", "icon--emerald icon--tiny"),
          "All data synthetic & labeled — fictional org, no real PII"
        ),
        el(
          "span",
          { class: "chip" },
          icon("ShieldCheck", "icon--emerald icon--tiny"),
          "Defensive framing only"
        )
      )
    );

    var route = el(
      "div",
      { class: "card" },
      GH.sectionLabel("Your route through the floor"),
      (function () {
        var ol = el("ol", { class: "route-list" });
        CHECKPOINTS.forEach(function (cp, i) {
          ol.appendChild(
            el(
              "li",
              null,
              el(
                "button",
                {
                  type: "button",
                  class: "route-btn",
                  onclick: function () {
                    goStage(cp[0]);
                  },
                },
                el("span", { class: "route-num" }, String(i + 1)),
                el("span", { class: "route-label" }, cp[1])
              )
            )
          );
        });
        return ol;
      })()
    );

    var anchor = el(
      "div",
      { class: "card card--amber" },
      el(
        "div",
        { class: "anchor-row" },
        icon("BadgeCheck", "icon--amber icon--tiny anchor-row__icon"),
        el(
          "div",
          { class: "anchor-row__text" },
          el("p", { class: "anchor-row__title" }, "Certification anchor"),
          el(
            "p",
            { class: "anchor-row__body" },
            D.ORG.cert +
              " — this lab exercises exam objective ",
            el("span", { class: "mono-inline" }, "2.4"),
            " (“Given a scenario, recommend controls to mitigate attacks and software vulnerabilities”) and ",
            el("span", { class: "mono-inline" }, "3.2"),
            " (incident response activities, including compensating controls)."
          )
        )
      )
    );

    var cta = el(
      "div",
      { class: "cta-row" },
      el(
        "button",
        {
          type: "button",
          class: "btn btn--amber btn--xl",
          onclick: function () {
            goStage("doctrine");
          },
        },
        icon("Layers"),
        "Walk the floor — start at Doctrine"
      )
    );

    return el("div", { class: "stage-body stage-body--narrow stack-lg" }, mission, route, anchor, cta);
  }

  /* ==========================================================================
     STAGE 2 — DOCTRINE
     ========================================================================== */

  function shuffle(arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  function attackCardItem(card) {
    var open = false;
    var root = el("div", { class: "attack-card" });
    var body = el("div", { class: "attack-card__body-clip" });
    var bodyInner = el(
      "div",
      { class: "attack-card__body" },
      el(
        "p",
        { class: "p" },
        el("span", { class: "text-dim" }, "Mechanism — "),
        card.mechanism
      ),
      el(
        "p",
        { class: "p p--dim" },
        el("span", { class: "text-dim" }, "Example — "),
        el("code", { class: "mono-inline mono-inline--amber" }, card.example)
      ),
      (function () {
        var wrap = el("div");
        wrap.appendChild(el("p", { class: "text-dim" }, "Controls that defeat it:"));
        var ul = el("ul", { class: "controls-list" });
        card.controls.forEach(function (c) {
          ul.appendChild(
            el("li", { class: "controls-list__item" }, icon("Globe2", "icon--tiny controls-list__icon"), c)
          );
        });
        wrap.appendChild(ul);
        return wrap;
      })()
    );
    body.appendChild(bodyInner);
    var chevron = icon("ChevronDown", "attack-card__chevron");
    var headBtn = el(
      "button",
      {
        type: "button",
        class: "attack-card__head",
        "aria-expanded": "false",
        onclick: function () {
          open = !open;
          root.classList.toggle("attack-card--open", open);
          headBtn.setAttribute("aria-expanded", open ? "true" : "false");
        },
      },
      icon("ShieldAlert", "attack-card__icon"),
      el(
        "span",
        { class: "attack-card__titles" },
        el("span", { class: "attack-card__name" }, card.name),
        el("span", { class: "attack-card__aka" }, card.aka)
      ),
      card.mitre ? el("span", { class: "mitre-chip" }, card.mitre) : null,
      chevron
    );
    root.appendChild(headBtn);
    root.appendChild(body);
    return root;
  }

  function StageDoctrine() {
    var s = GH.state;
    var buckets = [
      { id: "prevent", label: "Prevent" },
      { id: "detect", label: "Detect" },
      { id: "respond", label: "Respond" },
    ];
    var body = el("div", { class: "stage-body stack-xl" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "Doctrine reader"),
        el(
          "p",
          { class: "p p--dim" },
          "The lesson in four decks: what the attacks are, what the controls are, who really does this, and where each control breaks the chain. Glossary terms are defined on first use — open the ",
          el(
            "button",
            {
              type: "button",
              class: "link-glossary",
              onclick: function () {
                openGlossary();
              },
            },
            "glossary"
          ),
          " for the full list."
        )
      )
    );

    if (s.mode === "medium") {
      /* R6: mechanism column shuffled so display order never mirrors attacks */
      var warmup = el("div", { class: "stack-md" });
      warmup.appendChild(GH.sectionLabel("Warm-up — objective workbench"));
      warmup.appendChild(GH.objectiveCard("OBJ-M1", [
        GH.matchPairs(D.MATCH_ATTACKS, shuffle(D.MATCH_MECHS)),
        el(
          "p",
          { class: "muted-note" },
          "Click an attack on the left, then the mechanism it belongs to. Redo any time before checking."
        ),
      ]));
      var bucketList = el("div", { class: "stack-sm" });
      D.BUCKET_CHIPS.forEach(function (chip) {
        bucketList.appendChild(
          el(
            "div",
            { class: "bucket-row" },
            el("span", { class: "bucket-row__label" }, chip.label),
            GH.segGroup({
              options: buckets,
              value: s.buckets[chip.id] || "",
              onChange: function (b) {
                A.setBucket(chip.id, b);
              },
              ariaLabel: "Classify " + chip.label,
              compact: true,
            })
          )
        );
      });
      warmup.appendChild(GH.objectiveCard("OBJ-M2", [bucketList]));
      body.appendChild(warmup);
    }

    /* Deck 1 — attack shelf */
    var deck1 = el("div");
    deck1.appendChild(GH.sectionLabel("Deck 1 — the attack shelf (13 cards, full lesson scope)"));
    var deck1Grid = el("div", { class: "attack-grid" });
    D.ATTACK_CARDS.forEach(function (card) {
      deck1Grid.appendChild(attackCardItem(card));
    });
    deck1.appendChild(deck1Grid);
    body.appendChild(deck1);

    /* Deck 2 — control families */
    var deck2 = el("div");
    deck2.appendChild(GH.sectionLabel("Deck 2 — the control families"));
    var famGrid = el("div", { class: "family-grid" });
    var families = [
      {
        t: "Prevent",
        cls: "family-card--prevent",
        items: [
          "Server-side input validation (allow-lists, type/length/range/format)",
          "Sanitization + context-aware output encoding",
          "Parameterized queries / stored procedures",
          "Least privilege, RBAC, MFA",
          "Session flags: HttpOnly · Secure · SameSite + short timeouts",
          "TLS 1.2+, at-rest encryption, salted slow KDFs (bcrypt/Argon2)",
          "Memory protections: ASLR · DEP · stack canaries",
          "WAF (blocking), CSP & security headers, hardened upload handling",
          "Patching, SAST/DAST code review (design-time controls)",
        ],
      },
      {
        t: "Detect",
        cls: "family-card--detect",
        items: [
          "Full application audit logging",
          "WAF monitoring mode — alerts even when not blocking",
          "SIEM correlation across edge, app, DB telemetry",
          "File-integrity monitoring on web directories",
          "Vulnerability scanning (M1016) to see what attackers see",
        ],
      },
      {
        t: "Respond",
        cls: "family-card--respond",
        items: [
          "IR playbook: containment → eradication → recovery",
          "Evidence preservation before destructive action",
          "Session revocation + credential rotation",
          "Restore from clean backups, verify controls",
          "Lessons learned → updated baseline → re-test",
        ],
      },
    ];
    families.forEach(function (f) {
      var card = el("div", { class: "card family-card " + f.cls });
      card.appendChild(el("h3", { class: "family-card__title" }, f.t));
      var ul = el("ul", { class: "family-card__list" });
      f.items.forEach(function (i) {
        ul.appendChild(el("li", null, "· " + i));
      });
      card.appendChild(ul);
      famGrid.appendChild(card);
    });
    deck2.appendChild(famGrid);
    body.appendChild(deck2);

    /* Deck 3 — chain */
    var deck3 = el("div");
    deck3.appendChild(GH.sectionLabel("Deck 3 — where it sits in the chain"));
    var chainCard = el("div", { class: "card" });
    var chainOl = el("ol", { class: "chain-list" });
    D.CHAIN.forEach(function (c, i) {
      chainOl.appendChild(
        el(
          "li",
          { class: "chain-item" },
          i < D.CHAIN.length - 1 ? el("span", { class: "chain-item__line", "aria-hidden": "true" }) : null,
          el("span", { class: "chain-item__dot", "aria-hidden": "true" }),
          el(
            "div",
            null,
            el(
              "p",
              { class: "chain-item__stage" },
              c.stage + " ",
              el("span", { class: "mono-inline mono-inline--dim" }, c.ttp)
            ),
            el("p", { class: "chain-item__break" }, "Break it with: " + c.break)
          )
        )
      );
    });
    chainCard.appendChild(chainOl);
    deck3.appendChild(chainCard);
    body.appendChild(deck3);

    /* Deck 4 — real-world attribution */
    var deck4 = el("div");
    deck4.appendChild(GH.sectionLabel("Deck 4 — real-world attribution (verified ATT&CK procedure examples)"));
    var rwGrid = el("div", { class: "attack-grid" });
    D.REAL_WORLD.forEach(function (r) {
      rwGrid.appendChild(
        el(
          "div",
          { class: "card" },
          el(
            "div",
            { class: "rw-head" },
            icon("Users", "rw-head__icon"),
            el("h3", { class: "rw-head__name" }, r.name),
            el("span", { class: "rw-head__ids" }, r.ids)
          ),
          el("p", { class: "p p--dim rw-story" }, r.story),
          el("p", { class: "rw-lesson" }, r.lesson),
          el(
            "a",
            {
              href: r.link,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "rw-link",
            },
            "ATT&CK group page ",
            icon("ExternalLink", "icon--tiny")
          )
        )
      );
    });
    deck4.appendChild(rwGrid);
    body.appendChild(deck4);

    return body;
  }

  /* ==========================================================================
     STAGE 3 — EVIDENCE
     ========================================================================== */

  function uploadsTable() {
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table", { class: "data-table data-table--mono" });
    table.appendChild(
      el(
        "thead",
        { class: "data-table__head" },
        el(
          "tr",
          null,
          ["ID", "Time", "User", "File", "Declared type", "Content", "Verdict"].map(function (h) {
            return el("th", { scope: "col" }, h);
          })
        )
      )
    );
    var tbody = el("tbody");
    D.UPLOAD_RECORDS.forEach(function (r) {
      tbody.appendChild(
        el(
          "tr",
          { class: "data-table__row" },
          el("td", { class: "text-dim" }, r.id),
          el("td", { class: "text-dim" }, r.ts),
          el("td", { class: "text-dim-2" }, r.user),
          el("td", { class: "text-zinc" }, r.name),
          el("td", { class: "text-dim-2" }, r.declared),
          el("td", { class: "text-dim-2" }, r.content),
          el(
            "td",
            { class: r.verdict === "benign" ? "text-emerald" : "text-rose" },
            r.verdict
          )
        )
      );
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function configSnapshotGrid() {
    var grid = el("div", { class: "config-grid" });
    D.CONFIG_SNAPSHOT.forEach(function (c) {
      grid.appendChild(
        el(
          "div",
          { class: "config-cell" + (c.gap ? " config-cell--gap" : "") },
          el("p", { class: "config-cell__k" }, c.k),
          el("p", { class: "config-cell__v" }, c.v)
        )
      );
    });
    return el("div", { class: "config-outer" }, grid);
  }

  function memosList() {
    var wrap = el("div", { class: "stack-sm" });
    D.MEMOS.forEach(function (m) {
      wrap.appendChild(
        el(
          "article",
          { class: "memo" },
          el(
            "header",
            { class: "memo__head" },
            el("span", { class: "mono-inline mono-inline--dim" }, m.id),
            el("span", { class: "memo__from" }, "From: " + m.from),
            el("span", { class: "memo__subject" }, "— " + m.subject)
          ),
          el("p", { class: "p p--dim" }, m.body)
        )
      );
    });
    return wrap;
  }

  function evidenceTabs() {
    var tabs = [
      { id: "access", label: "Access log", icon: "Terminal", build: function () { return GH.logView(D.ACCESS_LOG); } },
      { id: "app", label: "App log", icon: "FileText", build: function () { return GH.logView(D.APP_LOG); } },
      { id: "uploads", label: "Uploads", icon: "Table2", build: uploadsTable },
      { id: "config", label: "Config snapshot", icon: "Settings2", build: configSnapshotGrid },
      { id: "memos", label: "Memos", icon: "Mail", build: memosList },
    ];
    var active = "access";
    var root = el("div", { class: "tabs" });
    var tablist = el("div", { class: "tabs-list", role: "tablist", "aria-label": "Evidence drawers" });
    var panelWrap = el("div");
    var tabButtons = [];

    function activate(id) {
      active = id;
      tabButtons.forEach(function (t) {
        var on = t.__id === active;
        t.btn.classList.toggle("tab--active", on);
        t.btn.setAttribute("aria-selected", on ? "true" : "false");
        t.btn.setAttribute("tabindex", on ? "0" : "-1");
      });
      panelWrap.textContent = "";
      var panel = el("div", {
        class: "tab-panel",
        role: "tabpanel",
        "aria-label": id,
      });
      tabs.forEach(function (t) {
        if (t.id === id) panel.appendChild(t.build());
      });
      panelWrap.appendChild(panel);
    }

    tabs.forEach(function (t) {
      var b = el(
        "button",
        {
          type: "button",
          class: "tab",
          role: "tab",
          onclick: function () {
            activate(t.id);
          },
          onkeydown: function (e) {
            var idx = tabButtons.findIndex(function (x) {
              return x.__id === t.id;
            });
            var next = null;
            if (e.key === "ArrowRight") next = tabButtons[(idx + 1) % tabButtons.length];
            if (e.key === "ArrowLeft")
              next = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
            if (next) {
              activate(next.__id);
              next.btn.focus();
            }
          },
        },
        icon(t.icon, "icon--tiny"),
        t.label
      );
      b.__id = t.id;
      tabButtons.push({ btn: b, __id: t.id });
      tablist.appendChild(b);
    });
    root.appendChild(tablist);
    root.appendChild(panelWrap);
    activate("access");
    return root;
  }

  function StageEvidence() {
    var s = GH.state;
    var body = el("div", { class: "stage-body stack-lg" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "Evidence locker — IR-2417"),
        el(
          "p",
          { class: "p p--dim" },
          "Five drawers of synthetic artifacts. Everything you need to attribute the breach — and to dismiss what did not cause it — is in here."
        )
      )
    );

    body.appendChild(evidenceTabs());

    body.appendChild(GH.sectionLabel("Objective workbench"));
    var bench = el("div", { class: "stack-md" });

    if (s.mode === "medium") {
      var m3fields = el("div", { class: "two-col-grid" });
      var m3param = el("input", {
        type: "text",
        id: "m3param",
        class: "input input--mono",
        placeholder: "e.g. q",
        value: s.matchPairs.__param || "",
        oninput: function (e) {
          A.setPair("__param", e.target.value);
        },
      });
      var m3snip = el("input", {
        type: "text",
        id: "m3snip",
        class: "input input--mono",
        placeholder: "e.g. 1=1",
        value: s.matchPairs.__snippet || "",
        oninput: function (e) {
          A.setPair("__snippet", e.target.value);
        },
      });
      m3fields.appendChild(
        el(
          "div",
          null,
          el("label", { htmlFor: "m3param", class: "field-label" }, "Targeted parameter (exact name)"),
          m3param
        )
      );
      m3fields.appendChild(
        el(
          "div",
          null,
          el("label", { htmlFor: "m3snip", class: "field-label" }, "Hallmark snippet (copy from the log)"),
          m3snip
        )
      );
      bench.appendChild(GH.objectiveCard("OBJ-M3", [m3fields]));

      bench.appendChild(
        GH.objectiveCard("OBJ-M4", [
          el(
            "div",
            { class: "stack-sm" },
            el(
              "div",
              null,
              el("p", { class: "field-label" }, "Attack type (AL-008)"),
              GH.segGroup({
                options: [
                  { id: "sqli", label: "SQL injection" },
                  { id: "xss", label: "Cross-site scripting" },
                  { id: "csrf", label: "CSRF" },
                  { id: "overflow", label: "Buffer overflow" },
                ],
                value: s.matchPairs.__attack || "",
                onChange: function (v) {
                  A.setPair("__attack", v);
                },
                ariaLabel: "Attack type",
                compact: true,
              })
            ),
            el(
              "div",
              null,
              el("p", { class: "field-label" }, "Missing control that made it dangerous"),
              GH.segGroup({
                options: [
                  { id: "output-encoding", label: "Output encoding / CSP" },
                  { id: "tls", label: "TLS" },
                  { id: "mfa", label: "MFA" },
                  { id: "param", label: "Parameterized queries" },
                ],
                value: s.matchPairs.__missing || "",
                onChange: function (v) {
                  A.setPair("__missing", v);
                },
                ariaLabel: "Missing control",
                compact: true,
              })
            )
          ),
        ])
      );
    } else {
      var h1fields = el("div", { class: "three-col-grid" });
      [
        ["endpoint", "Entry endpoint (the POST path)"],
        ["file", "Planted file name"],
        ["account", "Abused service account"],
      ].forEach(function (pair) {
        var k = pair[0];
        h1fields.appendChild(
          el(
            "div",
            null,
            el("label", { htmlFor: "h1-" + k, class: "field-label" }, pair[1]),
            el("input", {
              type: "text",
              id: "h1-" + k,
              class: "input input--mono",
              value: s.h1[k],
              oninput: function (e) {
                A.setH1(k, e.target.value);
              },
            })
          )
        );
      });
      bench.appendChild(
        GH.objectiveCard("OBJ-H1", [
          h1fields,
          el(
            "p",
            { class: "muted-note" },
            "Exact values only — this block feeds the incident record."
          ),
        ])
      );

      bench.appendChild(
        GH.objectiveCard("OBJ-H2", [
          el(
            "div",
            { class: "stack" },
            el(
              "div",
              null,
              el("p", { class: "field-label" }, "Disposition — SQL injection campaign (AL-006/007)"),
              GH.segGroup({
                options: [
                  { id: "failed", label: "Failed on its own — 400/500s, no data returned" },
                  { id: "succeeded-data", label: "Succeeded — dumped the users table" },
                  { id: "succeeded-dos", label: "Succeeded — took the DB offline" },
                ],
                value: s.h2.sqli,
                onChange: function (v) {
                  A.setH2("sqli", v);
                },
                ariaLabel: "SQLi disposition",
                compact: true,
              })
            ),
            el(
              "div",
              null,
              el("p", { class: "field-label" }, "Disposition — AcmeScan Enterprise activity (AL-001..004)"),
              GH.segGroup({
                options: [
                  { id: "authorized", label: "Authorized — contracted scanner (ticket SC-88)" },
                  { id: "malicious", label: "Malicious — attacker reconnaissance" },
                  { id: "irrelevant", label: "Ignore without review" },
                ],
                value: s.h2.scan,
                onChange: function (v) {
                  A.setH2("scan", v);
                },
                ariaLabel: "Scanner disposition",
                compact: true,
              })
            )
          ),
        ])
      );

      var h3list = el("div", { class: "stack-sm" });
      D.H3_OPTIONS.forEach(function (o) {
        var cb = el("input", {
          type: "checkbox",
          class: "checkbox checkbox--amber",
          "aria-label": o.label,
          checked: s.h3.includes(o.id) ? true : null,
          onchange: function (e) {
            e.target.checked = s.h3.includes(o.id);
            A.toggleH3(o.id);
            e.target.checked = s.h3.includes(o.id);
          },
        });
        h3list.appendChild(
          el(
            "label",
            { class: "check-row" },
            cb,
            o.label
          )
        );
      });
      bench.appendChild(
        GH.objectiveCard("OBJ-H3", [
          el(
            "p",
            { class: "muted-note", style: "margin-bottom:8px" },
            "Exactly three failures are causal for this breach chain. Cross-reference AP-104/105/107 and UR-331 before choosing."
          ),
          h3list,
        ])
      );
    }

    body.appendChild(bench);
    return body;
  }

  /* ==========================================================================
     STAGE 4 — GATES (control board + request simulator)
     ========================================================================== */

  var GROUPS = [
    {
      title: "Gate 1 — Input validation",
      note: "The front gate. Reject the class, not the instance.",
      segs: [
        {
          k: "patientIdValidation",
          label: "Refill lookup: patientId parameter",
          help:
            "Server-side rule applied before the query is built. Client-side checks are bypassable by construction.",
          options: [
            { id: "none", label: "Off — trust the client" },
            { id: "numeric-strict", label: "Numeric allow-list (1–6 digits)" },
          ],
        },
      ],
      switches: [],
    },
    {
      title: "Gate 2 — Encoding & CSP",
      note: "Render-time defense: data must come out inert.",
      segs: [
        {
          k: "outputEncoding",
          label: "Output encoding mode",
          help:
            "Context-aware covers element, attribute and JavaScript sinks — one global filter cannot.",
          options: [
            { id: "none", label: "None" },
            { id: "html-body", label: "HTML body only" },
            { id: "context-aware", label: "Context-aware (all sinks)" },
          ],
        },
      ],
      switches: [
        {
          k: "cspHeader",
          label: "Content-Security-Policy header",
          help: "Limits which scripts may load — containment for anything that slips past encoding.",
        },
      ],
    },
    {
      title: "Gate 3 — Access control",
      note: "Authentication × authorization × session hygiene.",
      segs: [
        {
          k: "roleSvcWeb",
          label: "svc_veriweb (service account) role",
          help: "Runs the app — it should never administer it.",
          options: [
            { id: "superadmin", label: "superadmin" },
            { id: "app-runtime", label: "app-runtime (least privilege)" },
            { id: "auditor", label: "auditor" },
          ],
        },
        {
          k: "roleSLim",
          label: "s.lim (helpdesk analyst) role",
          help: "Watch for privilege creep — the role should match the job.",
          options: [
            { id: "pharmacist", label: "pharmacist" },
            { id: "support-tier1", label: "support-tier1" },
          ],
        },
        {
          k: "sessionTimeout",
          label: "Session timeout",
          help: "Long sessions keep stolen tokens alive.",
          options: [
            { id: "720", label: "12 hours" },
            { id: "30", label: "30 minutes" },
          ],
        },
      ],
      switches: [
        { k: "mfaAdmin", label: "MFA for the rx-admin account", help: "Second factor on the privileged account." },
        { k: "cookieHttpOnly", label: "Cookie flag: HttpOnly", help: "JavaScript cannot read the session cookie." },
        { k: "cookieSecure", label: "Cookie flag: Secure", help: "Cookie travels over HTTPS only." },
        { k: "cookieSameSite", label: "Cookie flag: SameSite", help: "Cookie is not sent on cross-site requests — the CSRF killer." },
        {
          k: "sessionsRevoked",
          label: "Revoke all live sessions (containment action)",
          help: "Use after credential exposure — config alone leaves stolen tokens valid.",
        },
      ],
    },
    {
      title: "Gate 4 — Data layer",
      note: "Where injection becomes theft — or stops being possible.",
      segs: [
        {
          k: "dbQueryStyle",
          label: "Query construction",
          help:
            "Prepared statements send structure and data separately — input cannot rewrite the query.",
          options: [
            { id: "concatenated", label: "String concatenation" },
            { id: "parameterized", label: "Parameterized (prepared)" },
          ],
        },
        {
          k: "dbAccount",
          label: "Database account privileges",
          help:
            "Blast-radius cap: the app account needs SELECT/INSERT on its tables — not DBA.",
          options: [
            { id: "dba-equivalent", label: "DBA-equivalent" },
            { id: "app-least-priv", label: "Least privilege" },
          ],
        },
      ],
      switches: [],
    },
    {
      title: "Gate 5 — Cryptography",
      note: "Three layers: transport, storage, credentials.",
      segs: [
        {
          k: "tlsMode",
          label: "Transport security",
          help: "'Any TLS' still negotiates obsolete, broken protocol versions.",
          options: [
            { id: "http", label: "Plain HTTP" },
            { id: "tls-any", label: "TLS, any version" },
            { id: "tls12", label: "TLS 1.2+ only" },
          ],
        },
        {
          k: "atRest",
          label: "Encryption at rest",
          help: "A stolen disk or dump file should be unreadable.",
          options: [
            { id: "none", label: "None" },
            { id: "aes-256", label: "AES-256" },
          ],
        },
        {
          k: "passwordHash",
          label: "Password storage",
          help: "Slow + salted beats fast + naked, every time.",
          options: [
            { id: "md5", label: "MD5 (unsalted)" },
            { id: "sha1", label: "SHA-1 (unsalted)" },
            { id: "bcrypt-salt", label: "bcrypt + per-user salt" },
          ],
        },
      ],
      switches: [],
    },
    {
      title: "Gate 6 — File handling",
      note: "The IR-2417 hole. Admission, execution, and scanning.",
      segs: [
        {
          k: "uploadValidation",
          label: "Upload validation",
          help:
            "Allow-list + magic bytes verifies what the file IS; deny-lists only block what it is called.",
          options: [
            { id: "client-only", label: "Client-side only" },
            { id: "extension-blocklist", label: "Server-side deny-list" },
            { id: "allowlist-magic", label: "Server-side allow-list + magic bytes" },
          ],
        },
        {
          k: "uploadStorage",
          label: "Upload storage",
          help:
            "Outside the webroot and non-executable, or a bad file becomes running code.",
          options: [
            { id: "webroot-exec", label: "Inside webroot (executable)" },
            { id: "outside-nonexec", label: "Outside webroot, non-executable" },
          ],
        },
      ],
      switches: [
        { k: "uploadScan", label: "Anti-malware scan on arrival", help: "Defense behind the validation gate." },
      ],
    },
    {
      title: "Gate 7 — Detection & response",
      note: "See it, alert it, prove it.",
      segs: [
        {
          k: "wafMode",
          label: "Web Application Firewall",
          help:
            "Monitor raises alerts without blocking; block adds a compensating layer — never the primary fix.",
          options: [
            { id: "off", label: "Off" },
            { id: "monitor", label: "Monitor (alert only)" },
            { id: "block", label: "Block" },
          ],
        },
        {
          k: "appLogging",
          label: "Application logging",
          help:
            "Full audit feeds the SIEM the story: who did what, from where, with which role.",
          options: [
            { id: "errors-only", label: "Errors only" },
            { id: "full-audit", label: "Full audit trail" },
          ],
        },
      ],
      switches: [
        { k: "siemForward", label: "Forward logs to the SIEM", help: "Correlation across edge, app and DB telemetry." },
      ],
    },
  ];

  function buildSwitch(f) {
    var sw = el("button", {
      type: "button",
      class: "switch" + (GH.state.controls[f.k] ? " switch--on" : ""),
      role: "switch",
      "aria-checked": GH.state.controls[f.k] ? "true" : "false",
      "aria-label": f.label,
      onclick: function () {
        var next = !GH.state.controls[f.k];
        sw.classList.toggle("switch--on", next);
        sw.setAttribute("aria-checked", next ? "true" : "false");
        A.setControl(f.k, next);
      },
    });
    sw.__knob = el("span", { class: "switch__knob" });
    sw.appendChild(sw.__knob);
    return sw;
  }

  function controlsBoard() {
    var wrap = el("div", { class: "stack-sm" });
    GROUPS.forEach(function (g) {
      var section = el("section", { class: "card board-section" });
      section.appendChild(
        el(
          "header",
          { class: "board-section__head" },
          el("h3", { class: "board-section__title" }, g.title),
          el("p", { class: "board-section__note" }, g.note)
        )
      );
      var fields = el("div", { class: "stack" });
      g.segs.forEach(function (f) {
        var seg = GH.segGroup({
          options: f.options,
          value: String(GH.state.controls[f.k]),
          onChange: function (v) {
            A.setControl(f.k, v);
          },
          ariaLabel: f.label,
          compact: true,
        });
        fields.appendChild(
          el(
            "div",
            null,
            el("div", { class: "field-label" }, f.label),
            el("div", { class: "field-control" }, seg),
            el("p", { class: "field-help" }, f.help)
          )
        );
      });
      g.switches.forEach(function (f) {
        fields.appendChild(
          el(
            "div",
            { class: "switch-row" },
            el(
              "div",
              null,
              el("div", { class: "field-label" }, f.label),
              el("p", { class: "field-help" }, f.help)
            ),
            buildSwitch(f)
          )
        );
      });
      section.appendChild(fields);
      wrap.appendChild(section);
    });
    return wrap;
  }

  function simulator() {
    var simWrap = el("div", { class: "stack-sm" });
    var head = el(
      "div",
      { class: "sim-head" },
      el(
        "p",
        { class: "mono-label" },
        "Request library — " + GH.REQUESTS.length + " samples"
      ),
      el(
        "button",
        {
          type: "button",
          class: "btn btn--outline btn--sm",
          onclick: function () {
            GH.REQUESTS.forEach(function (r) {
              A.runRequest(r.id);
            });
          },
        },
        icon("Radar", "icon--tiny"),
        " Run entire library"
      )
    );
    simWrap.appendChild(head);

    var cards = {};
    GH.REQUESTS.forEach(function (r) {
      var card = el("div", { class: "sim-card" });
      var outcomeWrap = el("div");
      var runBtn = el(
        "button",
        {
          type: "button",
          class: "btn btn--amber btn--sm",
          "aria-label": "Run request: " + r.label,
          onclick: function () {
            A.runRequest(r.id);
          },
        },
        icon("Play", "icon--tiny"),
        " Run"
      );
      card.appendChild(
        el(
          "div",
          { class: "sim-card__row" },
          el(
            "span",
            { class: "sim-badge " + (r.kind === "malicious" ? "sim-badge--atk" : "sim-badge--ok") },
            r.kind === "malicious" ? "ATK" : "OK"
          ),
          el(
            "div",
            { class: "sim-card__meta" },
            el("p", { class: "sim-card__label" }, r.label),
            el(
              "p",
              { class: "mono-inline mono-inline--dim sim-target" },
              r.method + " " + r.target + (r.origin ? " · origin: " + r.origin : "")
            )
          ),
          runBtn
        )
      );
      card.appendChild(outcomeWrap);
      cards[r.id] = { card: card, outcomeWrap: outcomeWrap };
      simWrap.appendChild(card);
    });

    function refreshOutcome(r) {
      var entry = cards[r.id];
      var out = GH.state.sim[r.id];
      var c = GH.state.controls;
      entry.outcomeWrap.textContent = "";
      entry.card.classList.remove("sim-card--blocked", "sim-card--leak", "sim-card--benign");
      if (!out) return;
      if (out.blocked) entry.card.classList.add("sim-card--blocked");
      else if (r.kind === "malicious") entry.card.classList.add("sim-card--leak");
      else entry.card.classList.add("sim-card--benign");

      var chips = el("div", { class: "gate-chip-row" });
      GH.GATES.forEach(function (g) {
        var isBlocked = out.blocked && out.blockedAt === g.id;
        var passed =
          !out.blocked ||
          GH.GATES.findIndex(function (x) {
            return x.id === out.blockedAt;
          }) >
            GH.GATES.findIndex(function (x) {
              return x.id === g.id;
            });
        chips.appendChild(
          el(
            "span",
            {
              class:
                "gate-chip " +
                (isBlocked ? "gate-chip--block" : passed ? "gate-chip--pass" : "gate-chip--idle"),
            },
            (isBlocked ? "⛔" : passed ? "✓" : "·") + " " + g.label
          )
        );
      });
      if (out.detected) {
        chips.appendChild(el("span", { class: "alert-chip" }, "◉ alert raised"));
      }
      var box = el("div", { class: "sim-outcome", "aria-live": "polite" }, chips);
      box.appendChild(
        el(
          "p",
          {
            class:
              "sim-reason " +
              (out.blocked
                ? "sim-reason--blocked"
                : r.kind === "malicious"
                  ? "sim-reason--leak"
                  : "sim-reason--benign"),
          },
          el(
            "span",
            { class: "mono-inline" },
            (out.blocked ? "BLOCKED at " + out.blockedAt : "DELIVERED") + " — "
          ),
          out.reason
        )
      );
      if (out.warning) box.appendChild(el("p", { class: "sim-warning" }, "⚠ " + out.warning));
      if (!out.blocked && r.kind === "malicious") {
        box.appendChild(
          el(
            "p",
            { class: "sim-hint" },
            "Current config: " +
              (c.wafMode === "monitor" ? "WAF in monitor mode only logged it" : "no layer stopped it") +
              " — harden the gate that owns this attack."
          )
        );
      }
      entry.outcomeWrap.appendChild(box);
    }

    function refreshAll() {
      GH.REQUESTS.forEach(refreshOutcome);
    }
    refreshAll();
    GH.on(["sim", "controls"], refreshAll, "stage");
    return simWrap;
  }

  function encContextsWidget() {
    var wrap = el("div", { class: "stack-md" });
    D.ENC_CONTEXTS.forEach(function (c) {
      wrap.appendChild(
        el(
          "div",
          { class: "enc-box" },
          el("p", { class: "mono-inline mono-inline-- zinc" }, c.label),
          GH.segGroup({
            options: c.options,
            value: GH.state.encChoices[c.id] || "",
            onChange: function (v) {
              A.setEnc(c.id, v);
            },
            ariaLabel: "Encoding for " + c.label,
            compact: true,
          })
        )
      );
    });
    return wrap;
  }

  function StageGates() {
    var s = GH.state;
    var body = el("div", { class: "stage-body stack-lg" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "The gates — configure, then prove"),
        el(
          "p",
          { class: "p p--dim" },
          "Left: the control board (the staging pipeline of VeriScript Rx). Right: the request simulator — run benign and malicious traffic through your current configuration and watch which gate stops what. Green everywhere is not the goal: benign traffic must flow, malicious traffic must die, and you should know ",
          el("em", null, "which gate"),
          " killed it."
        )
      )
    );

    var grid = el("div", { class: "gates-grid" });
    var leftCol = el("div");
    leftCol.appendChild(GH.sectionLabel("Control board"));
    leftCol.appendChild(controlsBoard());
    var rightCol = el("div", { class: "sim-col" });
    rightCol.appendChild(GH.sectionLabel("Request pipeline simulator"));
    rightCol.appendChild(simulator());
    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    body.appendChild(grid);

    body.appendChild(GH.sectionLabel("Objective workbench — hardening tasks"));
    var bench = el("div", { class: "stack-md" });
    if (s.mode === "medium") {
      bench.appendChild(GH.objectiveCard("OBJ-M5", []));
      bench.appendChild(GH.objectiveCard("OBJ-M6", [encContextsWidget()]));
      bench.appendChild(GH.objectiveCard("OBJ-M7", []));
      bench.appendChild(GH.objectiveCard("OBJ-M8", []));
      bench.appendChild(GH.objectiveCard("OBJ-M9", []));
    } else {
      bench.appendChild(GH.objectiveCard("OBJ-H4", []));
      bench.appendChild(GH.objectiveCard("OBJ-H5", []));
    }
    body.appendChild(bench);

    body.appendChild(
      el(
        "div",
        { class: "nav-hint" },
        icon("ShieldCheck", "icon--emerald"),
        el(
          "span",
          null,
          "When you are confident in the config, head to ",
          el("strong", { class: "text-zinc" }, "TRIAGE"),
          " — detection work and response sequencing are next."
        )
      )
    );
    return body;
  }

  /* ==========================================================================
     STAGE 5 — TRIAGE
     ========================================================================== */

  function alertsPanel(count) {
    var wrap = el("div", { class: "stack-sm" });
    D.ALERTS.slice(0, count).forEach(function (a) {
      wrap.appendChild(
        el(
          "div",
          { class: "alert-item" },
          el(
            "div",
            { class: "alert-item__row" },
            icon("Siren", "alert-item__icon"),
            el(
              "div",
              { class: "alert-item__meta" },
              el("p", { class: "alert-item__title" }, a.title),
              el("p", { class: "alert-item__detail" }, a.detail)
            ),
            GH.segGroup({
              options: [
                { id: "tp", label: "True positive" },
                { id: "fp", label: "False positive" },
              ],
              value: GH.state.triage[a.id] || "",
              onChange: function (v) {
                A.setTriage(a.id, v);
              },
              ariaLabel: "Classify: " + a.title,
              compact: true,
            })
          )
        )
      );
    });
    return wrap;
  }

  function dataSourcesPanel() {
    var root = el("div");
    var grid = el("div", { class: "ds-grid" });
    var countLine = el("p", { class: "ds-count" });
    root.appendChild(grid);
    root.appendChild(countLine);

    function render() {
      var sources = GH.state.dataSources;
      grid.textContent = "";
      D.DATA_SOURCE_OPTIONS.forEach(function (o) {
        var on = sources.includes(o.id);
        var cb = el("input", {
          type: "checkbox",
          class: "checkbox checkbox--lime",
          "aria-label": o.label,
          checked: on ? true : null,
          onchange: function () {
            A.toggleDataSource(o.id);
          },
        });
        grid.appendChild(
          el("label", { class: "check-row check-row--lime" + (on ? " check-row--on" : "") }, cb, o.label)
        );
      });
      countLine.textContent = "selected: " + sources.length + " / 4 allowed";
    }
    render();
    GH.on(["dataSources"], render, "stage");
    return root;
  }

  function ruleEditor() {
    var root = el("div", { class: "stack" });
    var rowsWrap = el("div", { class: "stack-md" });
    var resultSpan = el("span");
    var runRow = el(
      "div",
      { class: "run-row" },
      el(
        "button",
        {
          type: "button",
          class: "btn btn--amber btn--sm",
          onclick: function () {
            A.testRules();
          },
        },
        icon("FlaskConical", "icon--tiny"),
        " Run against sample set"
      ),
      resultSpan
    );
    var tableWrap = el("div", { class: "table-wrap" });
    root.appendChild(rowsWrap);
    root.appendChild(runRow);
    root.appendChild(tableWrap);

    function flagFor(sample) {
      return GH.state.rules.some(function (r) {
        return GH.ruleMatches(sample, r);
      });
    }

    function renderRows() {
      rowsWrap.textContent = "";
      GH.state.rules.forEach(function (r, i) {
        var valueInput = el("input", {
          type: "text",
          class: "input input--mono rule-value",
          placeholder: "value (e.g. .php or <?php)",
          "aria-label": "Rule " + (i + 1) + " value",
          value: r.value,
          oninput: function (e) {
            A.setRule(i, { value: e.target.value });
          },
        });
        rowsWrap.appendChild(
          el(
            "div",
            { class: "rule-row" },
            el("p", { class: "mono-label" }, "rule " + (i + 1)),
            el(
              "div",
              { class: "rule-row__fields" },
              GH.segGroup({
                options: [
                  { id: "filename", label: "filename" },
                  { id: "content", label: "content" },
                ],
                value: r.field,
                onChange: function (v) {
                  A.setRule(i, { field: v });
                },
                ariaLabel: "Rule " + (i + 1) + " field",
                compact: true,
              }),
              GH.segGroup({
                options: [
                  { id: "ends_with", label: "ends with" },
                  { id: "contains", label: "contains" },
                ],
                value: r.op,
                onChange: function (v) {
                  A.setRule(i, { op: v });
                },
                ariaLabel: "Rule " + (i + 1) + " operator",
                compact: true,
              }),
              valueInput
            )
          )
        );
      });
    }

    function renderResult() {
      var rt = GH.state.ruleTest;
      resultSpan.textContent = "";
      resultSpan.className = "";
      if (rt && rt.ran) {
        resultSpan.className =
          "rule-result " + (rt.mal === 3 && rt.ben === 0 ? "rule-result--ok" : "rule-result--bad");
        resultSpan.setAttribute("aria-live", "polite");
        resultSpan.textContent =
          "flagged " + rt.mal + "/3 planted · " + rt.ben + "/2 legitimate";
      }
    }

    function renderTable() {
      tableWrap.textContent = "";
      var table = el("table", { class: "data-table data-table--mono" });
      table.appendChild(
        el(
          "thead",
          { class: "data-table__head" },
          el(
            "tr",
            null,
            ["File", "Declared", "Content", "Sample note"].map(function (h) {
              return el("th", { scope: "col" }, h);
            })
          )
        )
      );
      var tbody = el("tbody");
      GH.UPLOAD_SAMPLES.forEach(function (sm) {
        var flagged = flagFor(sm);
        tbody.appendChild(
          el(
            "tr",
            {
              class:
                "data-table__row" +
                (flagged ? (sm.malicious ? " row-flagged-ok" : " row-flagged-bad") : ""),
            },
            el(
              "td",
              { class: "text-zinc" },
              flagged
                ? el(
                    "span",
                    { class: sm.malicious ? "text-emerald" : "text-rose" },
                    "⚑ "
                  )
                : null,
              sm.name
            ),
            el("td", { class: "text-dim" }, sm.declared),
            el("td", { class: "text-dim-2" }, sm.content),
            el("td", { class: "text-dim" }, sm.note)
          )
        );
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }

    function refresh() {
      renderResult();
      renderTable();
    }
    renderRows();
    refresh();
    GH.on(["rules"], function () {
      /* rows contain the focused value input — refresh only previews */
      refresh();
    }, "stage");
    GH.on(["ruleTest"], renderResult, "stage");
    return root;
  }

  function h8Panel() {
    var root = el("div", { class: "stack-md" });
    root.appendChild(
      el(
        "p",
        { class: "p p--dim" },
        "BillFlo 7 (legacy billing integration) carries known injection flaws and cannot be recompiled for 60 days. Assemble the compensating-control package — then state the residual risk you will put your name on."
      )
    );
    var list = el("div", { class: "stack-sm" });
    D.H8_CONTROLS.forEach(function (o) {
      var cb = el("input", {
        type: "checkbox",
        class: "checkbox checkbox--amber",
        "aria-label": o.label,
        checked: GH.state.h8.controls.includes(o.id) ? true : null,
        onchange: function () {
          A.toggleH8(o.id);
        },
      });
      list.appendChild(el("label", { class: "check-row" }, cb, o.label));
    });
    root.appendChild(list);
    root.appendChild(
      el(
        "div",
        null,
        el("p", { class: "field-label", style: "margin-bottom:6px" }, "Residual risk statement"),
        GH.segGroup({
          options: D.H8_RESIDUAL,
          value: GH.state.h8.residual,
          onChange: function (v) {
            A.setH8Residual(v);
          },
          ariaLabel: "Residual risk",
          compact: true,
        })
      )
    );
    return root;
  }

  function StageTriage() {
    var s = GH.state;
    var alertCount = s.mode === "medium" ? 4 : 6;
    var body = el("div", { class: "stage-body stack-lg" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "Triage floor"),
        el(
          "p",
          { class: "p p--dim" },
          s.mode === "medium"
            ? "Four alerts, four dispositions, one data-source decision, one response sequence. The memos in the evidence locker hold the context."
            : "Six alerts — two are planted red herrings. Build the hunting rule set, disposition everything, package compensating controls for the legacy app, and sequence the full response."
        )
      )
    );

    body.appendChild(GH.sectionLabel("Alert queue"));
    body.appendChild(
      GH.objectiveCard(s.mode === "medium" ? "OBJ-M11" : "OBJ-H7", [alertsPanel(alertCount)])
    );

    if (s.mode === "medium") {
      body.appendChild(GH.objectiveCard("OBJ-M10", [dataSourcesPanel()]));
    } else {
      var ruleCard = el(
        "div",
        { class: "card" },
        el(
          "div",
          { class: "rule-card-head" },
          icon("ScanLine", "icon--lime"),
          el("h2", { class: "rule-card-head__title" }, "Hunting-rule editor"),
          el("span", { class: "mono-inline mono-inline--dim" }, "upload queue export — 5 samples")
        ),
        ruleEditor()
      );
      body.appendChild(ruleCard);
      body.appendChild(GH.objectiveCard("OBJ-H6", []));
    }

    body.appendChild(GH.sectionLabel("Response sequencing"));
    if (s.mode === "medium") {
      body.appendChild(
        GH.objectiveCard("OBJ-M12", [
          GH.orderList(D.SEQ_MEDIUM, "Append the phases in the order you would run them; arrows to reorder."),
        ])
      );
    } else {
      body.appendChild(
        GH.objectiveCard("OBJ-H9", [
          GH.orderList(
            D.SEQ_HARD,
            "Eight steps. One canonical order. Volatility decides the start; the review closes."
          ),
        ])
      );
      body.appendChild(GH.objectiveCard("OBJ-H8", [h8Panel()]));
    }

    body.appendChild(
      el(
        "div",
        { class: "nav-hint" },
        icon("ListChecks", "icon--amber"),
        el(
          "span",
          null,
          "Triage complete? Take the ",
          el("strong", { class: "text-zinc" }, "knowledge check"),
          ", then file your field notes in the debrief."
        )
      )
    );
    return body;
  }

  /* ==========================================================================
     STAGE 6 — KNOWLEDGE CHECK
     ========================================================================== */

  function StageQuiz() {
    var s = GH.state;
    var items = s.mode === "medium" ? D.QUIZ_MEDIUM : D.QUIZ_HARD;
    var body = el("div", { class: "stage-body stage-body--narrow stack" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "Knowledge check"),
        el(
          "p",
          { class: "p p--dim" },
          s.mode === "medium"
            ? "Six concept questions. Pick an answer and the explanation appears immediately — the why matters more than the score. Scoring locks your answers in."
            : "Eight scenario items, each an application of the lesson. Choose deliberately — scoring locks every answer and unlocks the explanations."
        )
      )
    );

    body.appendChild(GH.sectionLabel(items.length + " questions"));

    var list = el("div", { class: "stack-md" });
    var scorebar = el("div", { class: "card quiz-scorebar" });
    body.appendChild(list);
    body.appendChild(scorebar);

    function optionClasses(item, oi) {
      var chosen = s.quizAnswers[item.id];
      var isChosen = chosen === oi;
      var correctPicked = s.quizScored && isChosen && oi === item.answer;
      var wrongPicked = s.quizScored && isChosen && oi !== item.answer;
      var cls = "opt-btn";
      if (correctPicked) cls += " opt-btn--correct";
      else if (wrongPicked) cls += " opt-btn--wrong";
      else if (isChosen) cls += " opt-btn--chosen";
      if (s.quizScored) cls += " opt-btn--locked";
      return cls;
    }

    function buildQuestionCard(item, qi) {
      var chosen = s.quizAnswers[item.id];
      var explanationVisible =
        s.mode === "medium" ? chosen !== undefined : s.quizScored && chosen !== undefined;
      var card = el("div", { class: "card quiz-card", "data-q": item.id });
      var optionsWrap = el("div", { class: "stack-sm quiz-options" });
      item.options.forEach(function (opt, oi) {
        var b = el(
          "button",
          {
            type: "button",
            class: optionClasses(item, oi),
            "aria-pressed": s.quizAnswers[item.id] === oi ? "true" : "false",
            "aria-disabled": s.quizScored ? "true" : null,
            disabled: s.quizScored ? true : null,
            "data-oi": String(oi),
            onclick: function () {
              if (GH.state.quizScored) return;
              lastAnswer = { itemId: item.id, oi: oi };
              A.setQuizAnswer(item.id, oi);
            },
          },
          el("span", { class: "opt-letter" }, String.fromCharCode(65 + oi)),
          el("span", { class: "opt-text" }, opt),
          s.quizScored && chosen === oi && oi === item.answer
            ? icon("CheckCircle2", "opt-mark", { label: "correct answer" })
            : null,
          s.quizScored && chosen === oi && oi !== item.answer
            ? icon("XCircle", "opt-mark", { label: "incorrect answer" })
            : null
        );
        optionsWrap.appendChild(b);
      });
      card.appendChild(
        el(
          "div",
          { class: "quiz-q-row" },
          icon("CircleHelp", "quiz-q-row__icon"),
          el(
            "p",
            { class: "quiz-q" },
            el("span", { class: "mono-inline mono-inline--dim quiz-qnum" }, "Q" + (qi + 1)),
            item.q
          )
        )
      );
      card.appendChild(optionsWrap);
      if (explanationVisible) {
        var wrong = s.quizScored && chosen !== item.answer;
        card.appendChild(
          el(
            "div",
            {
              class: "quiz-expl " + (wrong ? "quiz-expl--wrong" : "quiz-expl--ok"),
              "aria-live": "polite",
            },
            wrong ? el("span", { class: "quiz-expl__lead" }, "Not quite — your pick is flagged red. Read why below.") : null,
            item.explanation
          )
        );
      }
      return card;
    }

    function buildScorebar() {
      scorebar.textContent = "";
      var answeredAll = items.every(function (i) {
        return s.quizAnswers[i.id] !== undefined;
      });
      var pct = GH.quizPct({ quizAnswers: s.quizAnswers }, s.mode);
      var btn = el(
        "button",
        {
          type: "button",
          class: "btn btn--amber btn--lg",
          disabled: !answeredAll || s.quizScored ? true : null,
          onclick: function () {
            A.scoreQuiz();
          },
        },
        icon("GraduationCap"),
        s.quizScored ? "Answers locked" : "Score the check"
      );
      scorebar.appendChild(btn);
      if (s.quizScored) {
        scorebar.appendChild(
          el(
            "span",
            { class: "quiz-score-line", "aria-live": "polite" },
            icon("BadgeCheck"),
            pct + "% — " + (pct >= 80 ? "field-ready" : pct >= 50 ? "solid; review the misses" : "re-run the doctrine decks"),
            el("span", { class: "quiz-score-note" }, "answers are locked")
          )
        );
      }
      if (!answeredAll) {
        scorebar.appendChild(
          el(
            "span",
            { class: "muted-note" },
            "Answer every question to enable scoring — " +
              (s.mode === "medium"
                ? "explanations appear as you answer."
                : "explanations unlock after scoring.")
          )
        );
      }
    }

    var lastAnswer = null;

    function rebuildAll() {
      list.textContent = "";
      items.forEach(function (item, qi) {
        list.appendChild(buildQuestionCard(item, qi));
      });
      buildScorebar();
    }

    rebuildAll();

    /* Answer-click refreshes: the score bar always updates; in medium mode the
       answered question's card is rebuilt (explanation appears immediately)
       with focus restored to the chosen option — mirroring React's DOM
       reconciliation in the original. Hard mode repaints the chosen option in
       place and reveals nothing else until scoring. */
    function refreshAfterAnswer() {
      buildScorebar();
      if (!lastAnswer) return;
      var target = lastAnswer.itemId;
      var refocusOi = lastAnswer.oi;
      lastAnswer = null;
      var idx = items.findIndex(function (i) {
        return i.id === target;
      });
      if (idx === -1) return;
      var card = list.querySelector('[data-q="' + target + '"]');
      if (!card) return;
      var item = items[idx];
      if (s.mode === "medium") {
        var fresh = buildQuestionCard(item, idx);
        list.replaceChild(fresh, card);
        var btn = fresh.querySelector('[data-oi="' + refocusOi + '"]');
        if (btn) btn.focus();
      } else {
        var chosen = GH.state.quizAnswers[item.id];
        card.querySelectorAll(".opt-btn").forEach(function (b) {
          var oi = parseInt(b.getAttribute("data-oi"), 10);
          b.className = optionClasses(item, oi);
          b.setAttribute("aria-pressed", chosen === oi ? "true" : "false");
        });
      }
    }

    GH.on(["quizAnswers"], refreshAfterAnswer, "stage");
    GH.on(["quizScored"], rebuildAll, "stage");
    return body;
  }

  /* ==========================================================================
     STAGE 7 — DEBRIEF
     ========================================================================== */

  function StageDebrief() {
    var s = GH.state;
    var body = el("div", { class: "stage-body stage-body--narrow stack-xl" });

    body.appendChild(
      el(
        "header",
        { class: "card" },
        el("h1", { class: "h2" }, "Field notes — what you now know"),
        el(
          "p",
          { class: "p p--dim" },
          "The synthesis page: detection opportunities, mitigation recommendations with official IDs, and both sides of the story. Everything here maps back to " +
            D.ORG.cert +
            "."
        )
      )
    );

    /* Detection opportunities */
    var detSection = el("section");
    detSection.appendChild(GH.sectionLabel("Detection opportunities"));
    var detWrap = el("div", { class: "table-wrap" });
    var detTable = el("table", { class: "data-table" });
    detTable.appendChild(
      el(
        "thead",
        { class: "data-table__head" },
        el(
          "tr",
          null,
          el("th", { scope: "col" }, "Data source"),
          el("th", { scope: "col" }, "Example detection logic (simplified)")
        )
      )
    );
    var detBody = el("tbody");
    D.DETECTION_ROWS.forEach(function (r) {
      detBody.appendChild(
        el(
          "tr",
          { class: "data-table__row" },
          el("td", { class: "det-source" }, r.source),
          el("td", { class: "mono-cell" }, r.logic)
        )
      );
    });
    detTable.appendChild(detBody);
    detWrap.appendChild(detTable);
    detSection.appendChild(detWrap);
    body.appendChild(detSection);

    /* Mitigation recommendations */
    var mitSection = el("section");
    mitSection.appendChild(GH.sectionLabel("Mitigation recommendations (with ATT&CK mitigation IDs)"));
    var mitWrap = el("div", { class: "table-wrap" });
    var mitTable = el("table", { class: "data-table" });
    mitTable.appendChild(
      el(
        "thead",
        { class: "data-table__head" },
        el(
          "tr",
          null,
          el("th", { scope: "col" }, "Recommendation"),
          el("th", { scope: "col" }, "Maps to")
        )
      )
    );
    var mitBody = el("tbody");
    D.MITIGATION_ROWS.forEach(function (r) {
      mitBody.appendChild(
        el(
          "tr",
          { class: "data-table__row" },
          el("td", { class: "text-dim-2" }, r.rec),
          el("td", { class: "mono-cell mono-cell--emerald" }, r.mid)
        )
      );
    });
    mitTable.appendChild(mitBody);
    mitWrap.appendChild(mitTable);
    mitSection.appendChild(mitWrap);
    mitSection.appendChild(
      el(
        "p",
        { class: "footnote" },
        "Verified against attack.mitre.org (ATT&CK v20). The WAF/input-validation recommendation has no dedicated MITRE mitigation — it is mapped to Software Configuration (M1054) as a labeled simplification."
      )
    );
    body.appendChild(mitSection);

    /* Takeaways */
    var takeaways = el("div", { class: "takeaway-grid" });
    var blue = el("section", { class: "takeaway-card takeaway-card--blue" });
    blue.appendChild(
      el(
        "div",
        { class: "takeaway-head" },
        icon("Wrench", "icon--emerald"),
        el("h2", { class: "takeaway-head__title takeaway-head__title--blue" }, "Blue-team takeaways")
      )
    );
    var blueUl = el("ul", { class: "takeaway-list" });
    D.BLUE_TAKEAWAYS.forEach(function (t) {
      blueUl.appendChild(el("li", null, "· " + t));
    });
    blue.appendChild(blueUl);
    var red = el("section", { class: "takeaway-card takeaway-card--red" });
    red.appendChild(
      el(
        "div",
        { class: "takeaway-head" },
        icon("Swords", "icon--rose"),
        el("h2", { class: "takeaway-head__title takeaway-head__title--red" }, "Red-team mindset (defensive use)")
      )
    );
    var redUl = el("ul", { class: "takeaway-list" });
    D.RED_TAKEAWAYS.forEach(function (t) {
      redUl.appendChild(el("li", null, "· " + t));
    });
    red.appendChild(redUl);
    takeaways.appendChild(blue);
    takeaways.appendChild(red);
    body.appendChild(takeaways);

    /* Hard mode: defense-in-depth mapping objective */
    if (s.mode === "hard") {
      var h10wrap = el("div", { class: "stack-md" });
      D.H10_STAGES.forEach(function (st) {
        h10wrap.appendChild(
          el(
            "div",
            { class: "h10-box" },
            el("p", { class: "h10-box__label" }, st.label),
            GH.segGroup({
              options: D.H10_DEFENSES,
              value: s.h10[st.id] || "",
              onChange: function (v) {
                A.setH10(st.id, v);
              },
              ariaLabel: "Defense for " + st.label,
              compact: true,
            })
          )
        );
      });
      body.appendChild(GH.objectiveCard("OBJ-H10", [h10wrap]));
    }

    /* Official references */
    var linksSection = el("section");
    linksSection.appendChild(GH.sectionLabel("Official references"));
    var linksGrid = el("div", { class: "links-grid" });
    D.LINKS.forEach(function (l) {
      linksGrid.appendChild(
        el(
          "a",
          {
            href: l.url,
            target: "_blank",
            rel: "noopener noreferrer",
            class: "link-btn",
          },
          icon("BookOpen", "icon--tiny link-btn__icon"),
          el("span", { class: "link-btn__label" }, l.label),
          icon("ExternalLink", "icon--tiny link-btn__ext")
        )
      );
    });
    linksSection.appendChild(linksGrid);
    body.appendChild(linksSection);

    /* Completion CTA */
    body.appendChild(
      el(
        "div",
        { class: "complete-card" },
        icon("ClipboardList", "complete-card__icon"),
        el("h2", { class: "complete-card__title" }, "Ready to file the completion report?"),
        el(
          "p",
          { class: "complete-card__sub" },
          "Your star rating reflects first-attempt accuracy and hint discipline. Finish the remaining objectives first if you want the full three stars."
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn btn--amber btn--xl",
            onclick: function () {
              A.completeLab();
              openCompletionModal();
            },
          },
          icon("FileCheck2"),
          "File completion report"
        )
      )
    );
    return body;
  }

  /* ==========================================================================
     OBJECTIVES RAIL (desktop aside + mobile/tablet sheet)
     ========================================================================== */

  var railFilter = "all";

  function railContent(scope) {
    var s = GH.state;
    var defs = GH.OBJECTIVES[s.mode];
    var doneCount = defs.filter(function (d) {
      return s.objState[d.id] && s.objState[d.id].done;
    }).length;
    var countSpan = el("span", {
      class: "rail__count" + (doneCount === defs.length ? " rail__count--done" : ""),
    });
    var barFill = el("div", { class: "rail__bar-fill" });
    var filters = el("div", { class: "rail-filters" });
    var list = el("div", { class: "rail-list" });

    function renderMeta() {
      var sd = GH.state;
      var dd = GH.OBJECTIVES[sd.mode];
      var done = dd.filter(function (d) {
        return sd.objState[d.id] && sd.objState[d.id].done;
      }).length;
      countSpan.textContent = done + "/" + dd.length;
      countSpan.classList.toggle("rail__count--done", done === dd.length);
      barFill.style.width = (done / dd.length) * 100 + "%";
    }

    function renderFilters() {
      filters.textContent = "";
      PILLARS.forEach(function (p) {
        filters.appendChild(
          el(
            "button",
            {
              type: "button",
              class: "rail-filter" + (railFilter === p ? " rail-filter--on" : ""),
              "aria-pressed": railFilter === p ? "true" : "false",
              onclick: function () {
                railFilter = p;
                renderFilters();
                renderList();
              },
            },
            p
          )
        );
      });
    }

    function renderList() {
      var sd = GH.state;
      var dd = GH.OBJECTIVES[sd.mode];
      var visible = dd.filter(function (d) {
        return railFilter === "all" || d.pillar === railFilter;
      });
      list.textContent = "";
      visible.forEach(function (d) {
        var st = sd.objState[d.id];
        var res = sd.checkResults[d.id];
        var stage = GH.stageForObjective(d.id, sd.mode);
        var maxHints = sd.mode === "medium" ? 3 : 1;
        var done = !!(st && st.done);
        var item = el("div", {
          class: "rail-item" + (done ? " rail-item--done" : ""),
        });
        var btns = el("div", { class: "rail-item__btns" });
        if (!done) {
          btns.appendChild(
            el(
              "button",
              {
                type: "button",
                class: "rail-check-btn",
                onclick: function () {
                  A.check(d.id);
                },
              },
              "CHECK"
            )
          );
          if ((st && st.hints ? st.hints : 0) < maxHints) {
            btns.appendChild(
              el(
                "button",
                {
                  type: "button",
                  class: "rail-hint-btn",
                  onclick: function () {
                    A.revealHint(d.id);
                  },
                },
                "HINT " + ((st && st.hints ? st.hints : 0) + 1) + "/" + maxHints
              )
            );
          }
        }
        var resP = el("p");
        if (res) {
          resP.className = "rail-result " + (res.pass ? "rail-result--pass" : "rail-result--fail");
          resP.setAttribute("aria-live", "polite");
          resP.textContent = res.message;
        }
        item.appendChild(
          el(
            "div",
            { class: "rail-item__row" },
            done
              ? icon("CheckCircle2", "rail-item__check")
              : icon("Circle", "rail-item__circle"),
            el(
              "div",
              { class: "rail-item__main" },
              el(
                "p",
                { class: "rail-item__id" },
                d.id + " · ",
                el("span", { class: GH.PILLAR_META[d.pillar].cls }, GH.PILLAR_META[d.pillar].label)
              ),
              el("p", { class: "rail-item__title" }, d.title),
              stage
                ? el(
                    "button",
                    {
                      type: "button",
                      class: "rail-item__stage",
                      onclick: function () {
                        goStage(stage);
                      },
                    },
                    "→ open " + stage
                  )
                : null
            )
          )
        );
        item.appendChild(btns);
        if (st && st.hints > 0 && !done) {
          var hintBox = el("div", { class: "hint-box hint-box--rail" });
          d.hints.slice(0, st.hints).forEach(function (h) {
            hintBox.appendChild(el("p", { class: "hint-box__line" }, h));
          });
          item.appendChild(hintBox);
        }
        if (res) item.appendChild(resP);
        list.appendChild(item);
      });
    }

    function refresh() {
      renderMeta();
      renderList();
    }
    renderMeta();
    renderFilters();
    renderList();
    GH.on(["objState", "checkResults", "mode"], refresh, scope);
    /* mode changes also alter the filter labels' meaning — rebuild filters too */
    GH.on(["mode"], renderFilters, scope);

    return el(
      "div",
      { class: "rail" },
      el(
        "div",
        { class: "rail__head" },
        el(
          "div",
          { class: "rail__head-row" },
          el("p", { class: "mono-label" }, "Objectives tracker"),
          countSpan
        ),
        el("div", { class: "rail__bar" }, barFill),
        filters
      ),
      list
    );
  }

  function openObjectivesSheet() {
    A.setObjectivesOpen(true);
    GH.mountSheet({
      labelledBy: "sheet-title",
      onClose: function () {
        A.setObjectivesOpen(false);
      },
      build: function (panel) {
        panel.appendChild(
          el(
            "div",
            { class: "sr-only" },
            el("h2", { id: "sheet-title" }, "Objectives tracker"),
            el("p", null, "Live objective progress and checks")
          )
        );
        panel.appendChild(railContent("sheet"));
      },
    });
    /* sheet listeners must die with the sheet */
    var overlay = document.querySelector(".modal-overlay:last-child");
    if (overlay) {
      var obs = new MutationObserver(function () {
        if (!document.body.contains(overlay)) {
          GH.offScope("sheet");
          obs.disconnect();
        }
      });
      obs.observe(document.body, { childList: true });
    }
  }

  /* ==========================================================================
     GLOSSARY DIALOG
     ========================================================================== */

  function openGlossary() {
    A.setGlossaryOpen(true);
    var q = "";
    var listWrap = el("div", { class: "glossary-list" });
    function renderList() {
      listWrap.textContent = "";
      var filtered = D.GLOSSARY.filter(function (g) {
        return (
          !q ||
          g.term.toLowerCase().includes(q.toLowerCase()) ||
          g.def.toLowerCase().includes(q.toLowerCase())
        );
      });
      filtered.forEach(function (g) {
        listWrap.appendChild(
          el(
            "div",
            { class: "glossary-item" },
            el("p", { class: "glossary-item__term" }, g.term),
            el("p", { class: "glossary-item__def" }, g.def)
          )
        );
      });
      if (filtered.length === 0) {
        listWrap.appendChild(el("p", { class: "glossary-empty" }, "No terms match."));
      }
    }
    GH.mountModal({
      labelledBy: "glossary-title",
      panelClass: "modal-panel--glossary",
      onClose: function () {
        A.setGlossaryOpen(false);
      },
      build: function (panel) {
        panel.appendChild(
          el(
            "div",
            { class: "modal-head" },
            el(
              "div",
              { class: "modal-head__title-wrap" },
              el(
                "h2",
                { id: "glossary-title", class: "modal-title" },
                icon("BookMarked", "icon--amber icon--tiny"),
                "Glossary — 15 terms"
              ),
              el(
                "p",
                { class: "modal-desc" },
                "Every jargon term from the lesson, one line each."
              )
            )
          )
        );
        var input = el("input", {
          type: "text",
          class: "input",
          placeholder: "Filter terms…",
          "aria-label": "Filter glossary",
          oninput: function (e) {
            q = e.target.value;
            renderList();
          },
        });
        panel.appendChild(input);
        renderList();
        panel.appendChild(listWrap);
      },
    });
  }

  /* ==========================================================================
     COMPLETION MODAL
     ========================================================================== */

  function openCompletionModal() {
    var s = GH.state;
    if (!s.mode || !s.completed || !s.lastCompletion) return;
    A.setCompletionOpen(true);
    var defs = GH.OBJECTIVES[s.mode];
    var pillars = ["understand", "recognize", "detect", "mitigate"];
    var stars = GH.starRating(s.objState, defs.length);
    var last = s.lastCompletion;
    var totalDone = defs.filter(function (d) {
      return s.objState[d.id] && s.objState[d.id].done;
    }).length;

    /* R8: focus areas derived from actual performance evidence */
    var quizItems = s.mode === "medium" ? D.QUIZ_MEDIUM : D.QUIZ_HARD;
    var missedTopics = s.quizScored
      ? quizItems
          .filter(function (i) {
            return s.quizAnswers[i.id] !== undefined && s.quizAnswers[i.id] !== i.answer;
          })
          .map(function (i) {
            return i.topic;
          })
      : [];
    var unfinished = defs.filter(function (d) {
      return !(s.objState[d.id] && s.objState[d.id].done);
    });
    var retried = defs.filter(function (d) {
      return s.objState[d.id] && s.objState[d.id].done && (s.objState[d.id].attempts || 0) > 1;
    });
    var hinted = defs.filter(function (d) {
      return (s.objState[d.id] && (s.objState[d.id].hints || 0) > 0) || false;
    });
    var focusAreas = [];
    if (unfinished.length)
      focusAreas.push({
        area:
          "Unfinished objectives: " +
          unfinished
            .map(function (d) {
              return d.id.replace("OBJ-", "");
            })
            .join(", "),
        action: "Open the objectives tracker and clear them — each has hints and a stage link.",
      });
    if (missedTopics.length)
      focusAreas.push({
        area:
          "Knowledge-check misses: " +
          Array.from(new Set(missedTopics)).join("; "),
        action: "Re-read the matching doctrine deck, then re-run the check in the other mode.",
      });
    if (retried.length)
      focusAreas.push({
        area:
          "Needed multiple attempts: " +
          retried
            .map(function (d) {
              return d.id.replace("OBJ-", "");
            })
            .join(", "),
        action: "Redo these slowly in a fresh run — aim for first-try passes.",
      });
    if (hinted.length)
      focusAreas.push({
        area:
          "Hints used on " + hinted.length + " objective" + (hinted.length > 1 ? "s" : "") + ": " +
          hinted
            .map(function (d) {
              return d.id.replace("OBJ-", "");
            })
            .join(", "),
        action: "Try a no-hint re-run of those objectives to prove the recall is yours.",
      });

    GH.mountModal({
      labelledBy: "completion-title",
      panelClass: "modal-panel--completion",
      onClose: function () {
        A.setCompletionOpen(false);
      },
      build: function (panel) {
        panel.appendChild(
          el(
            "div",
            { class: "modal-head" },
            el(
              "h2",
              { id: "completion-title", class: "modal-title modal-title--lg" },
              icon("Star", "icon--amber"),
              "Shift report — IR-2417"
            ),
            el(
              "p",
              { class: "modal-desc" },
              D.ORG.cert + " · " + (s.mode === "medium" ? "Guided hardening shift" : "Red-team re-test")
            )
          )
        );

        var starMsg =
          stars.stars === 3
            ? "Outstanding — examiner-grade discipline."
            : stars.stars === 2
              ? "Strong shift — fewer hints, more first-try hits next time."
              : "Mission complete. Re-run for accuracy: mastery is showing, polish is pending.";

        var starRow = el(
          "div",
          { class: "cm-stars", "aria-label": stars.stars + " of 3 stars" }
        );
        [1, 2, 3].forEach(function (i) {
          starRow.appendChild(
            icon("Star", "cm-star" + (i <= stars.stars ? " cm-star--lit" : ""), {
              filled: i <= stars.stars,
            })
          );
        });

        panel.appendChild(
          el(
            "div",
            { class: "cm-summary" },
            starRow,
            el("p", { class: "cm-msg" }, starMsg),
            el(
              "div",
              { class: "cm-stats" },
              el("div", { class: "cm-stat" }, el("span", { class: "cm-stat__num" }, last.objPct + "%"), "objectives"),
              el("div", { class: "cm-stat" }, el("span", { class: "cm-stat__num" }, last.quizPct + "%"), "knowledge check"),
              el("div", { class: "cm-stat" }, el("span", { class: "cm-stat__num cm-stat__num--emerald" }, stars.firstTryPct + "%"), "first-try rate")
            ),
            el(
              "p",
              { class: "cm-star-rules" },
              "Stars: 3★ = ≥80% first-try and ≤25% hints · 2★ = ≥50% first-try · hints used: " + stars.hintPct + "% of objectives"
            )
          )
        );

        var recap = el("div");
        recap.appendChild(
          el(
            "p",
            { class: "mono-label cm-recap-label" },
            "Objective recap by pillar — " + totalDone + "/" + defs.length + " complete"
          )
        );
        var recapList = el("div", { class: "stack-sm" });
        pillars.forEach(function (p) {
          var pd = defs.filter(function (d) {
            return d.pillar === p;
          });
          var done = pd.filter(function (d) {
            return s.objState[d.id] && s.objState[d.id].done;
          }).length;
          recapList.appendChild(
            el(
              "div",
              { class: "cm-recap-row" },
              el("span", { class: "pillar-badge " + GH.PILLAR_META[p].cls }, GH.PILLAR_META[p].label),
              el("span", { class: "cm-recap-count" }, done + "/" + pd.length),
              el("span", { class: "cm-recap-ids" }, pd.map(function (d) { return d.id.replace("OBJ-", ""); }).join(" · "))
            )
          );
        });
        recap.appendChild(recapList);
        panel.appendChild(recap);

        var focus = el("div", { class: "cm-focus" });
        focus.appendChild(
          el(
            "p",
            { class: "mono-label mono-label--amber cm-focus__label" },
            icon("Target", "icon--tiny"),
            "Focus areas — from your actual run"
          )
        );
        if (focusAreas.length === 0) {
          focus.appendChild(
            el(
              "p",
              { class: "cm-focus__clean" },
              "Clean sweep: every objective first-try, no hints, full knowledge-check score. For depth, re-run the other difficulty mode."
            )
          );
        } else {
          var ul = el("ul", { class: "stack-sm cm-focus__list" });
          focusAreas.forEach(function (f) {
            ul.appendChild(
              el(
                "li",
                null,
                el("span", { class: "cm-focus__area" }, f.area),
                el("span", { class: "cm-focus__action" }, "→ " + f.action)
              )
            );
          });
          focus.appendChild(ul);
        }
        panel.appendChild(focus);

        panel.appendChild(
          el(
            "div",
            { class: "cm-next" },
            el("p", { class: "mono-label mono-label--amber" }, "Where to go next"),
            el(
              "ul",
              { class: "cm-next__list" },
              el("li", null, "· CySA+ CS0-003 companion topics: 14A (secure software development) and 14C (implementing the controls you just recommended)"),
              el("li", null, "· Read the ATT&CK pages for T1190, T1505.003 and the mitigation IDs from the debrief — you can now map them to real controls"),
              el("li", null, "· Re-run the other difficulty mode: Medium teaches the mechanics, Hard proves you can operate under noise")
            )
          )
        );

        panel.appendChild(
          el(
            "div",
            { class: "modal-footer" },
            el(
              "button",
              {
                type: "button",
                class: "btn btn--amber",
                onclick: function () {
                  GH.app.closeCompletion();
                  goStage("brief");
                },
              },
              "Back to the floor"
            ),
            el(
              "button",
              {
                type: "button",
                class: "btn btn--outline",
                onclick: function () {
                  A.resetAll();
                },
              },
              icon("RotateCcw", "icon--tiny"),
              " Reset lab"
            )
          )
        );
      },
    });
  }

  GH.app.closeCompletion = null;

  /* ==========================================================================
     RESET CONFIRM (alert-dialog semantics: no backdrop close, no X)
     ========================================================================== */

  function confirmReset() {
    GH.mountModal({
      labelledBy: "reset-title",
      panelClass: "modal-panel--reset",
      closeOnBackdrop: false,
      showClose: false,
      build: function (panel, close) {
        panel.appendChild(
          el(
            "div",
            null,
            el("h2", { id: "reset-title", class: "modal-title" }, "Reset the lab to pristine state?"),
            el(
              "p",
              { class: "modal-desc" },
              "Wipes your mode, objective progress, control configuration, triage decisions and quiz results from this browser. This cannot be undone."
            )
          )
        );
        panel.appendChild(
          el(
            "div",
            { class: "modal-footer modal-footer--end" },
            el(
              "button",
              { type: "button", class: "btn btn--outline", onclick: close },
              "Keep my shift"
            ),
            el(
              "button",
              {
                type: "button",
                class: "btn btn--danger",
                onclick: function () {
                  A.resetAll();
                },
              },
              "Reset everything"
            )
          )
        );
      },
    });
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */

  function renderShell() {
    GH.offScope("shell");
    GH.offScope("sheet");
    navButtons = [];
    root.textContent = "";

    var skip = el(
      "a",
      { href: "#stage", class: "skip-link" },
      "Skip to stage content"
    );

    var leftRail = el(
      "div",
      { class: "rail-left hide-below-md" },
      el("div", { class: "rail-left__inner" }, buildCheckpointNav(true))
    );

    var mobileChips = el(
      "div",
      { class: "mobile-chips hide-on-md" },
      buildCheckpointNav(false)
    );

    stageHost = el("div", { class: "stage-host" });
    var contentCol = el("div", { class: "content-col" }, mobileChips, stageHost);

    var shell = el(
      "div",
      { class: "shell" },
      skip,
      renderHeader(),
      el("div", { class: "shell-inner" }, leftRail, contentCol)
    );
    root.appendChild(shell);

    /* the right objectives rail (desktop xl+) */
    var rail = railContent("rail");
    rail.classList.add("rail-right", "hide-below-xl");
    rail.setAttribute("aria-label", "Objectives tracker");
    shell.querySelector(".shell-inner").appendChild(rail);

    renderStage();

    GH.on(["activeStage"], onStageChanged, "shell");
    GH.on(["objState", "mode"], refreshHeader, "shell");
  }

  /* mode / booted transitions swap the whole view (chooseMode, post-reset) */
  GH.on(["mode", "booted"], function () {
    var s = GH.state;
    if (s.booted && s.mode) {
      if (!document.querySelector(".shell")) renderShell();
    } else {
      renderModeSelect();
    }
  }, "root");

  /* patch the completion modal close bridge */
  (function () {
    var origMount = GH.mountModal;
    GH.mountModal = function (opts) {
      var close = origMount(opts);
      if (opts.panelClass && opts.panelClass.includes("modal-panel--completion")) {
        GH.app.closeCompletion = close;
      }
      return close;
    };
  })();

  function boot() {
    var s = GH.state;
    if (s.booted && s.mode) renderShell();
    else renderModeSelect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
