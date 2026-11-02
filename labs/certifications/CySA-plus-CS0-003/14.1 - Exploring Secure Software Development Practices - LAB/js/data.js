// ─── RELEASE TRACK · lab content corpus (static port) ────────────────────────
// Subject: CompTIA CySA+ CS0-003 · Lesson 14.1 — Exploring Secure Software
// Development Practices. This file is the 1:1 content export of the framework
// lab's src/data/sdlc-lab.ts: identical objectives, quiz items, evidence
// documents, hint tiers, feedback strings and correct answers.
// All organizations, tickets, CVEs and artifacts are SYNTHETIC training data.
//
// Contents: LAB_TITLE, LAB_SUBTITLE, SYNTHETIC_BANNER, STATIONS (8 SDLC
// stations), MEDIUM_OBJECTIVES (12), MEDIUM_QUIZ (6), HARD_QUIZ (7),
// HARD_OBJECTIVES (9), GLOSSARY (15 terms), BRIEFING, CORE_* knowledge
// sections, DEBRIEF_* field notes sections, NEXT_STEPS.

window.LAB_DATA = {
  "LAB_TITLE": "RELEASE TRACK",
  "LAB_SUBTITLE": "Secure Software Development Practices · CySA+ CS0-003 · Lesson 14.1",
  "SYNTHETIC_BANNER": "SYNTHETIC TRAINING DATA — Northwind Clinics is a fictional organization. All artifacts are simulated for defensive education.",
  "STATIONS": [
    {
      "id": "stn-01",
      "code": "STN-01",
      "name": "PLANNING",
      "tagline": "Business case, scope, risk assessment, security requirements kickoff."
    },
    {
      "id": "stn-02",
      "code": "STN-02",
      "name": "REQUIREMENTS",
      "tagline": "Functional + security requirements, traceability via the RTM."
    },
    {
      "id": "stn-03",
      "code": "STN-03",
      "name": "DESIGN",
      "tagline": "Architecture, threat modeling, security controls by design."
    },
    {
      "id": "stn-04",
      "code": "STN-04",
      "name": "DEVELOPMENT",
      "tagline": "Version control, secure coding, peer review."
    },
    {
      "id": "stn-05",
      "code": "STN-05",
      "name": "TESTING",
      "tagline": "SAST · DAST · IAST · SCA · fuzzing · pentest."
    },
    {
      "id": "stn-06",
      "code": "STN-06",
      "name": "INTEGRATION & DEPLOYMENT",
      "tagline": "CI/CD, code promotion, change control, staging."
    },
    {
      "id": "stn-07",
      "code": "STN-07",
      "name": "MAINTENANCE",
      "tagline": "Patching, dependency health, hotfixes, monitoring."
    },
    {
      "id": "stn-08",
      "code": "STN-08",
      "name": "RETIREMENT",
      "tagline": "Decommissioning, certified data disposal, license cleanup."
    }
  ],
  "MEDIUM_OBJECTIVES": [
    {
      "id": "OBJ-M1",
      "stationId": "stn-01",
      "title": "Orient the track",
      "sentence": "Arrange the eight SDLC phases in the order a release travels.",
      "pillar": "P1",
      "anchor": "Lesson 14.1 — SDLC phase sequence (planning → retirement/disposal)",
      "task": {
        "type": "sequence",
        "prompt": "Building software is a relay race with a canonical leg order. Rearrange the eight SDLC phases into the sequence CompTIA expects. Use the arrows on each row.",
        "items": [
          {
            "id": "design",
            "label": "DESIGN",
            "sub": "architecture & threat modeling"
          },
          {
            "id": "planning",
            "label": "PLANNING",
            "sub": "business case & risk assessment"
          },
          {
            "id": "testing",
            "label": "TESTING",
            "sub": "verify against requirements"
          },
          {
            "id": "requirements",
            "label": "REQUIREMENTS ANALYSIS",
            "sub": "define what must be built"
          },
          {
            "id": "maintenance",
            "label": "MAINTENANCE",
            "sub": "operate, patch, support"
          },
          {
            "id": "development",
            "label": "DEVELOPMENT",
            "sub": "write the code"
          },
          {
            "id": "retirement",
            "label": "RETIREMENT & DISPOSAL",
            "sub": "decommission & wipe data"
          },
          {
            "id": "integration",
            "label": "INTEGRATION & DEPLOYMENT",
            "sub": "assemble, stage, ship"
          }
        ],
        "correctOrder": [
          "planning",
          "requirements",
          "design",
          "development",
          "testing",
          "integration",
          "maintenance",
          "retirement"
        ]
      },
      "hints": [
        "Security is not one phase — but the FIRST phase is where the business case and risk appetite are set.",
        "You write code only after you know WHAT to build (requirements) and HOW (design). Disposal comes last.",
        "Order: Planning → Requirements → Design → Development → Testing → Integration & deployment → Maintenance → Retirement & disposal."
      ],
      "feedbackPass": "Locked in. Every leg is a security checkpoint: risk at planning, traceable security requirements, threat modeling at design, secure coding, security testing, controlled promotion, monitored operation — and certified disposal. That is what \"security throughout the SDLC\" means.",
      "feedbackFail": "Not the dispatch order CompTIA expects. You cannot test what was never designed, and you cannot design without requirements. Start from Planning and end at Retirement & disposal."
    },
    {
      "id": "OBJ-M2",
      "stationId": "stn-01",
      "title": "Pick the delivery model",
      "sentence": "File each Northwind project under the SDLC model it describes.",
      "pillar": "P1",
      "anchor": "Lesson 14.1 — Waterfall vs Agile vs DevSecOps; shift-left",
      "task": {
        "type": "assign",
        "prompt": "Three Northwind teams, three delivery models. Assign each project to the model it describes. The feedback explains where \"shift-left\" fits.",
        "items": [
          {
            "id": "ds",
            "label": "Payments platform: SAST, SCA and DAST gates run automatically in CI/CD on every commit; security is a shared responsibility"
          },
          {
            "id": "wf",
            "label": "Core-banking rewrite: fixed contractual milestones, one release per year, each phase fully signed off before the next begins"
          },
          {
            "id": "ag",
            "label": "Patient app squad: ships every two weeks, security champions in each squad, welcomes changing requirements late in development"
          }
        ],
        "buckets": [
          {
            "id": "waterfall",
            "label": "WATERFALL",
            "sub": "sequential phases, heavy documentation, change is expensive"
          },
          {
            "id": "agile",
            "label": "AGILE",
            "sub": "iterative sprints, working software over comprehensive docs"
          },
          {
            "id": "devsecops",
            "label": "DEVSECOPS",
            "sub": "security automated and shared across Dev + Sec + Ops"
          }
        ],
        "correct": {
          "wf": "waterfall",
          "ag": "agile",
          "ds": "devsecops"
        }
      },
      "hints": [
        "Look for the cadence: once-a-year sequential sign-offs vs two-week sprints vs automated gates on every commit.",
        "\"Shared responsibility\" and \"pipeline gates on every commit\" are DevSecOps signatures.",
        "Waterfall = fixed milestones; Agile = iterative squads; DevSecOps = automated security built into CI/CD."
      ],
      "feedbackPass": "Filed correctly. Note the trend: the industry shifted LEFT — moving security earlier and automating it. DevSecOps does not replace Agile; it bolts continuous security onto iterative delivery. In the exam, \"shift-left\" always means moving security activities to earlier, cheaper phases.",
      "feedbackFail": "Misrouted. Key tells: fixed milestone sign-offs = Waterfall; iterative sprints with changing requirements = Agile; automated security gates + shared responsibility in the pipeline = DevSecOps. Re-file and check again."
    },
    {
      "id": "OBJ-M3",
      "stationId": "stn-02",
      "title": "Route the security work",
      "sentence": "Route each security activity to the SDLC phase where it is performed.",
      "pillar": "P1",
      "anchor": "Lesson 14.1 — security controls & activities per phase incl. RTM",
      "task": {
        "type": "assign",
        "prompt": "Building security in means every phase owns specific security work. Route all eight activities to their phase.",
        "items": [
          {
            "id": "pt",
            "label": "Full adversarial penetration test before go-live"
          },
          {
            "id": "wipe",
            "label": "Certified data-wipe of decommissioned build servers"
          },
          {
            "id": "rtm",
            "label": "Build the requirements traceability matrix (RTM) linking each security requirement to a control"
          },
          {
            "id": "dep",
            "label": "SCA scan + staging validation inside the release pipeline"
          },
          {
            "id": "tm",
            "label": "Threat-model the new patient-records module (STRIDE)"
          },
          {
            "id": "patch",
            "label": "Quarterly dependency patching of the production app"
          },
          {
            "id": "cr",
            "label": "Peer code review of the authentication patch"
          },
          {
            "id": "risk",
            "label": "Executive risk assessment & business-case sign-off"
          }
        ],
        "buckets": [
          {
            "id": "stn-01",
            "label": "PLANNING"
          },
          {
            "id": "stn-02",
            "label": "REQUIREMENTS"
          },
          {
            "id": "stn-03",
            "label": "DESIGN"
          },
          {
            "id": "stn-04",
            "label": "DEVELOPMENT"
          },
          {
            "id": "stn-05",
            "label": "TESTING"
          },
          {
            "id": "stn-06",
            "label": "INTEGRATION & DEPLOYMENT"
          },
          {
            "id": "stn-07",
            "label": "MAINTENANCE"
          },
          {
            "id": "stn-08",
            "label": "RETIREMENT"
          }
        ],
        "correct": {
          "risk": "stn-01",
          "rtm": "stn-02",
          "tm": "stn-03",
          "cr": "stn-04",
          "pt": "stn-05",
          "dep": "stn-06",
          "patch": "stn-07",
          "wipe": "stn-08"
        }
      },
      "hints": [
        "The RTM is written when requirements are written — not later. Threat modeling happens on the architecture, before code exists.",
        "Review touches source code; pipeline validation ships the build; quarterly patching keeps the running service healthy.",
        "Pairs: risk→Planning, RTM→Requirements, threat model→Design, review→Development, pentest→Testing, SCA+staging→Integration, patching→Maintenance, wipe→Retirement."
      ],
      "feedbackPass": "All eight routed. This is the exam objective in one picture: every phase has security work, and the RTM (Requirements) plus threat modeling (Design) are the two artifacts auditors ask for first. Non-developer forces — business risk, cost, schedule, security requirements — shape these decisions too.",
      "feedbackFail": "Some activities landed in the wrong phase. Remember: artifacts made from text (RTM) live in Requirements; artifacts made from architecture (threat model) live in Design; anything done to source code is Development; anything done to a running build is Testing or Integration; anything done to the live service is Maintenance."
    },
    {
      "id": "OBJ-M4",
      "stationId": "stn-04",
      "title": "Spot the injection risk",
      "sentence": "Select EVERY code snippet that contains an injection risk.",
      "pillar": "P2",
      "anchor": "Lesson 14.1 secure coding — input validation; CWE-89 / CWE-79 (MITRE mapping)",
      "task": {
        "type": "multiselect",
        "prompt": "Three snippets from the VitalsPortal codebase. Select every snippet where user input can be interpreted as code. Compliant snippets must NOT be selected.",
        "options": [
          {
            "id": "a",
            "label": "Snippet A — login query: db.exec(\"SELECT * FROM users WHERE email = '\" + req.body.email + \"'\")"
          },
          {
            "id": "b",
            "label": "Snippet B — login query: db.exec(\"SELECT * FROM users WHERE email = ?\", [req.body.email])"
          },
          {
            "id": "c",
            "label": "Snippet C — comment wall: commentEl.innerHTML = userComment  // userComment comes from the POST body"
          }
        ],
        "correct": [
          "a",
          "c"
        ]
      },
      "hints": [
        "Injection = input changing the MEANING of code. Ask of each snippet: can user data become SQL, HTML or script?",
        "The \"?\" placeholder in B is a parameter marker — the driver sends data separately, so it can never execute.",
        "A concatenates user input into SQL (SQL injection). C injects user input into HTML (XSS). B is safe."
      ],
      "feedbackPass": "A is classic SQL injection (CWE-89): user input becomes SQL. C is cross-site scripting (CWE-79): user input becomes HTML/JS. B is safe because query and data travel separately — data can never be parsed as code. Recognizing these two shapes on sight is a core CySA+ skill.",
      "feedbackFail": "Not the right set. B is the safe one: the \"?\" is a parameter placeholder, so user data is never parsed as SQL. A (string concatenation into SQL) and C (raw innerHTML) are both exploitable. Select exactly A and C."
    },
    {
      "id": "OBJ-M5",
      "stationId": "stn-04",
      "title": "Patch the SQL injection",
      "sentence": "Choose the one fix for Snippet A that meets the secure-coding standard.",
      "pillar": "P4",
      "anchor": "Lesson 14.1 secure coding — parameterized queries / stored procedures",
      "task": {
        "type": "codefix",
        "prompt": "Snippet A is exploitable. Pick the single remediation Northwind’s standard allows, then check.",
        "language": "js",
        "parts": [
          {
            "id": "p1",
            "caption": "Snippet A — auth login handler",
            "code": "// flaw: user input concatenated into SQL\nconst email = req.body.email;\nconst q = \"SELECT * FROM users WHERE email = '\" + email + \"'\";\ndb.exec(q);",
            "flawLine": 3,
            "options": [
              {
                "id": "o1",
                "label": "Parameterized query (prepared statement)",
                "snippet": "db.exec(\"SELECT * FROM users WHERE email = ?\", [email]);"
              },
              {
                "id": "o2",
                "label": "Strip dangerous characters from the input",
                "snippet": "const safe = email.replace(/'|--|;/g, \"\");\ndb.exec(\"SELECT ... WHERE email = '\" + safe + \"'\");"
              },
              {
                "id": "o3",
                "label": "Validate the email format in the browser form",
                "snippet": "// client-side only:\nif (!form.email.matches(emailPattern)) return showError();"
              },
              {
                "id": "o4",
                "label": "Base64-encode the email before querying",
                "snippet": "const enc = Buffer.from(email).toString(\"base64\");\ndb.exec(\"SELECT ... WHERE email = '\" + enc + \"'\");"
              }
            ],
            "correct": "o1"
          }
        ]
      },
      "hints": [
        "The fix must guarantee user input can NEVER be parsed as SQL — for any input, not just input matching a pattern.",
        "Denylists and client-side checks are bypassable; encoding changes data but not how the query is parsed.",
        "The parameterized query sends SQL and data separately; the driver treats the email purely as data."
      ],
      "feedbackPass": "Parameterization separates code from data at the driver level, so the database can never reinterpret a parameter as SQL — for any payload. Character-stripping is bypassable, client-side validation is not a control at all (it runs on the attacker’s machine), and Base64 changes the bytes but not the parse. SAST flags exactly this pattern in source.",
      "feedbackFail": "That patch does not meet the standard. Stripping characters (denylist) and client-side checks are bypassable; encoding is not parsing. Only a parameterized query / stored procedure makes the data structurally unable to become code."
    },
    {
      "id": "OBJ-M6",
      "stationId": "stn-04",
      "title": "Patch the XSS",
      "sentence": "Choose the compliant fix for Snippet C (formatting must be preserved).",
      "pillar": "P4",
      "anchor": "Lesson 14.1 secure coding — output encoding; server-side validation",
      "task": {
        "type": "codefix",
        "prompt": "The comment wall must keep basic formatting (<b>, <i>), so plain textContent would break the feature. Pick the remediation that satisfies the standard.",
        "language": "js",
        "parts": [
          {
            "id": "p1",
            "caption": "Snippet C — comment wall renderer",
            "code": "// flaw: raw user input rendered as HTML\nconst userComment = req.body.comment;\ncommentEl.innerHTML = userComment;",
            "flawLine": 3,
            "options": [
              {
                "id": "o1",
                "label": "Sanitize with the approved context-aware encoder, then render",
                "snippet": "commentEl.innerHTML = Sanitizer.cleanHTML(userComment);\n// allowlist: <b>, <i> — everything else is encoded"
              },
              {
                "id": "o2",
                "label": "Keep innerHTML, add client-side form validation on the comment field",
                "snippet": "// client-side only:\nif (comment.length > 500) return showError();"
              },
              {
                "id": "o3",
                "label": "Strip all \"<\" characters with a regex before rendering",
                "snippet": "commentEl.innerHTML = userComment.replace(/</g, \"\");"
              },
              {
                "id": "o4",
                "label": "URL-encode the whole comment before rendering",
                "snippet": "commentEl.innerHTML = encodeURIComponent(userComment);"
              }
            ],
            "correct": "o1"
          }
        ]
      },
      "hints": [
        "There are two distinct controls: validation (input side) and output encoding (render side). This flaw needs the render-side one.",
        "Ad-hoc regexes lose to encodings and event handlers; URL-encoding is the wrong context for HTML content.",
        "The approved sanitizer allowlists safe tags and encodes everything else — that is context-aware output encoding."
      ],
      "feedbackPass": "Output encoding with the approved context-aware library is the standard defense (CWE-79). Validation happens on input, encoding on output — different controls; client-side validation does nothing here because the attacker submits requests directly. Regex stripping is bypassable; URL-encoding is the wrong context. DAST against the running staging build catches the original flaw.",
      "feedbackFail": "That does not close the hole. Client-side validation is bypassable and is not output encoding. Regex stripping loses to encodings and attribute tricks, and URL-encoding mangles HTML into the wrong context. Use the approved sanitizer that allowlists safe tags and encodes the rest."
    },
    {
      "id": "OBJ-M7",
      "stationId": "stn-05",
      "title": "Match the test to the mission",
      "sentence": "File each mission under the application security technique that performs it.",
      "pillar": "P3",
      "anchor": "Lesson 14.1 — SAST, DAST, IAST, fuzzing, SCA characteristics",
      "task": {
        "type": "assign",
        "prompt": "Northwind licenses five automated security tests. Read each mission statement and file it under the correct technique.",
        "items": [
          {
            "id": "i4",
            "label": "Fire 10,000 malformed JSON payloads at the API parser and watch for crashes"
          },
          {
            "id": "i5",
            "label": "Scan package-lock.json and flag a dependency with a known RCE vulnerability"
          },
          {
            "id": "i2",
            "label": "Attack the RUNNING staging build from outside with an authenticated scanner; find reflected XSS"
          },
          {
            "id": "i3",
            "label": "Instrumentation inside the running QA app reports the exact request that reached a dangerous sink"
          },
          {
            "id": "i1",
            "label": "Analyze source code WITHOUT running it; flag a tainted dataflow from req.body into a SQL sink"
          }
        ],
        "buckets": [
          {
            "id": "sast",
            "label": "SAST",
            "sub": "static — reads source, no execution"
          },
          {
            "id": "dast",
            "label": "DAST",
            "sub": "dynamic — attacks the running app from outside"
          },
          {
            "id": "iast",
            "label": "IAST",
            "sub": "interactive — instrumented agent inside the app"
          },
          {
            "id": "fuzz",
            "label": "FUZZING",
            "sub": "malformed / random input bombardment"
          },
          {
            "id": "sca",
            "label": "SCA",
            "sub": "software composition — third-party dependencies"
          }
        ],
        "correct": {
          "i1": "sast",
          "i2": "dast",
          "i3": "iast",
          "i4": "fuzz",
          "i5": "sca"
        }
      },
      "hints": [
        "Two clues decide everything: does the tool READ CODE or RUN THE APP? And where does it observe from — outside, or inside?",
        "\"Without executing\" is SAST. \"From outside\" is DAST. \"Instrumentation inside\" is IAST. Lockfiles are SCA.",
        "i1→SAST, i2→DAST, i3→IAST, i4→Fuzzing, i5→SCA."
      ],
      "feedbackPass": "Clean sweep. Remember the exam framing: SAST and SCA are static (they read code/lockfiles); DAST is dynamic from the outside; IAST is dynamic from the inside (agent instrumentation); fuzzing is generative/mutation input bombardment. A mature pipeline uses several, each where it is strongest.",
      "feedbackFail": "Some missions landed wrong. Re-read the verb: analyzing source = SAST; attacking from outside = DAST; observing from inside via instrumentation = IAST; malformed input bombardment = fuzzing; dependency/lockfile analysis = SCA."
    },
    {
      "id": "OBJ-M8",
      "stationId": "stn-06",
      "title": "The promotion path",
      "sentence": "Arrange the five environments in the approved code-promotion order.",
      "pillar": "P4",
      "anchor": "Lesson 14.1 — code promotion: sandbox → dev → test → staging → production",
      "task": {
        "type": "sequence",
        "prompt": "A build may only travel the approved route to production. Order the environments from first (developer machine) to last (live patients).",
        "items": [
          {
            "id": "prod",
            "label": "PRODUCTION",
            "sub": "live patients — monitoring & rollback on standby"
          },
          {
            "id": "staging",
            "label": "STAGING",
            "sub": "production mirror — final DAST & change approval"
          },
          {
            "id": "sandbox",
            "label": "SANDBOX",
            "sub": "developer’s isolated machine"
          },
          {
            "id": "test",
            "label": "TEST / QA",
            "sub": "integration + automated security scans"
          },
          {
            "id": "dev",
            "label": "DEVELOPMENT",
            "sub": "shared dev environment, unit tests"
          }
        ],
        "correctOrder": [
          "sandbox",
          "dev",
          "test",
          "staging",
          "prod"
        ]
      },
      "hints": [
        "The first stop is the only one-person environment. The last is the only one with real patients.",
        "Environments mirror production more and more closely as you approach the end — the final mirror is where human sign-off happens.",
        "Sandbox → Development → Test/QA → Staging → Production. Skipping straight to production is never acceptable."
      ],
      "feedbackPass": "Path locked. Each hop is a narrowing gate: isolation (sandbox) → shared dev → automated verification (QA) → production-mirror sign-off (staging) → live. Promoting from dev or QA straight to production — even under schedule pressure — is the classic audit finding this track exists to stop.",
      "feedbackFail": "Wrong routing. The order is Sandbox → Development → Test/QA → Staging → Production. Staging is never optional: it is the production mirror where the final scan and change approval happen."
    },
    {
      "id": "OBJ-M9",
      "stationId": "stn-06",
      "title": "Wire the security gates",
      "sentence": "Load the two empty CI/CD gates with the right tools.",
      "pillar": "P3",
      "anchor": "Lesson 14.1 — security automation in CI/CD; where each scan belongs",
      "task": {
        "type": "pipeline",
        "prompt": "The VitalsPortal pipeline has two empty security gates. Toggle the tool(s) that belong in each. Gate 1 runs after the build, before any deployment. Gate 2 runs after staging deployment, before release.",
        "stages": [
          {
            "id": "commit",
            "label": "COMMIT"
          },
          {
            "id": "build",
            "label": "BUILD"
          },
          {
            "id": "unit",
            "label": "UNIT TESTS"
          },
          {
            "id": "deploy",
            "label": "DEPLOY STAGING"
          },
          {
            "id": "release",
            "label": "RELEASE"
          }
        ],
        "slots": [
          {
            "id": "gate1",
            "afterStage": "unit",
            "label": "GATE 1 — post-build, pre-deploy"
          },
          {
            "id": "gate2",
            "afterStage": "deploy",
            "label": "GATE 2 — pre-release"
          }
        ],
        "tools": [
          "SAST",
          "SCA",
          "DAST",
          "Fuzzing"
        ],
        "correct": {
          "gate1": [
            "SAST",
            "SCA"
          ],
          "gate2": [
            "DAST"
          ]
        }
      },
      "hints": [
        "One gate runs when there is code but no environment; the other runs when a production-mirror app is live.",
        "Static tools need no running app. Dynamic tools do. Fuzzing is targeted, not a broad pipeline gate here.",
        "Gate 1 = SAST + SCA (static, fast, on the artifact). Gate 2 = DAST (needs the running staging app)."
      ],
      "feedbackPass": "Gates wired. Static checks (SAST on source, SCA on the dependency tree) belong right after the build — cheap, no environment needed, fail the pipeline early. DAST needs a running application, so it fires against staging before release. Secret scanning would also live pre-build; fuzzing runs as a targeted job on parsers, not as a general gate.",
      "feedbackFail": "Not the wiring the dispatcher expects. Think \"static vs dynamic\": SAST + SCA read code and lockfiles and belong in the post-build gate; DAST needs a running app, so it belongs after staging deployment. Fuzzing belongs in neither general gate here."
    },
    {
      "id": "OBJ-M10",
      "stationId": "stn-06",
      "title": "Change-control triage",
      "sentence": "Find the ticket that bypassed change control and name the missing control.",
      "pillar": "P4",
      "anchor": "Lesson 14.1 — change control process; expedited vs skipped approval",
      "task": {
        "type": "triage",
        "prompt": "Three change tickets from the v2.5 cycle are in the reader. Identify the one that violated change control, then name the most critical missing element.",
        "evidence": [
          {
            "id": "cc-114",
            "title": "CHANGE TICKET CC-114 — SSO login page",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-114 — Feature: SSO login page\nRequested by: identity team   |   Risk: medium   |   Window: 14 Mar 02:00-04:00\n[x] CAB review — SCHEDULED 12 Mar (security lead + product owner present)\n[x] Test evidence attached: SAST report, staging DAST report, unit tests green\n[x] Rollback plan: revert to v2.5.0 image; DNS unchanged\n[x] Staging validation run 13 Mar — PASS\nStatus: APPROVED, awaiting window"
          },
          {
            "id": "cc-115",
            "title": "CHANGE TICKET CC-115 — payment form hotfix",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-115 — Hotfix: payment form XSS (CVE-2025-1337*)\nRequested by: payments squad   |   Risk: high   |   Window: NONE RECORDED\n[ ] CAB review — NOT PERFORMED\n[ ] Test evidence — NONE (fix deployed from a local build)\n[ ] Rollback plan — NONE\nTimeline: deployed to PRODUCTION at 02:10 by lead developer after a Slack\n\"ship it\" from a teammate; this ticket was created 3 DAYS LATER for audit.\nStatus: DEPLOYED (undocumented at time of change)\n* fictional ID for training"
          },
          {
            "id": "cc-116",
            "title": "CHANGE TICKET CC-116 — brand logo update",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-116 — Cosmetic: update brand logo SVG\nRequested by: marketing   |   Risk: low   |   Window: 09 Mar 23:00-23:30\n[x] CAB review — APPROVED 08 Mar (quorum met, 2-minute review)\n[x] Test evidence: visual regression suite green on staging\n[x] Rollback plan: redeploy previous asset bundle\n[x] Staging validation — PASS\nStatus: DEPLOYED per window"
          }
        ],
        "selects": [
          {
            "id": "violator",
            "label": "Which ticket violated change control?",
            "options": [
              {
                "id": "cc-114",
                "label": "CC-114 (SSO login page)"
              },
              {
                "id": "cc-115",
                "label": "CC-115 (payment form hotfix)"
              },
              {
                "id": "cc-116",
                "label": "CC-116 (brand logo update)"
              }
            ],
            "correct": "cc-115"
          },
          {
            "id": "missing",
            "label": "Most critical missing element in that ticket:",
            "options": [
              {
                "id": "approval",
                "label": "Approval obtained BEFORE production deployment"
              },
              {
                "id": "stakeholders",
                "label": "More stakeholders on the Slack thread"
              },
              {
                "id": "title",
                "label": "A more detailed ticket title"
              },
              {
                "id": "commit",
                "label": "A nicer commit message"
              }
            ],
            "correct": "approval"
          }
        ]
      },
      "hints": [
        "Two of the three tickets follow the same healthy skeleton: review → evidence → rollback plan → window. One does not.",
        "A Slack message is not a CAB. Check which ticket reached production with zero recorded approval or evidence.",
        "CC-115 deployed to production with no CAB review, no test evidence and no rollback plan — and was documented three days late."
      ],
      "feedbackPass": "CC-115 is the violation: production deploy with no approval, no evidence, no rollback — documented after the fact. CC-116 proves an important nuance: even a trivial logo change followed the process. Emergencies use EXPEDITED (e-CAB) approval with ratification and evidence afterward — they never skip the control. Missing rollback + evidence is what turns an incident into an unrecoverable one.",
      "feedbackFail": "Look again at the skeleton of each ticket: CAB review, test evidence, rollback plan, window. The violating one reached production through a chat message with none of those, and its paperwork was created three days later. The most critical gap is the missing pre-deployment approval."
    },
    {
      "id": "OBJ-M11",
      "stationId": "stn-07",
      "title": "Supply-chain check: json-flatten",
      "sentence": "Vet the third-party library and select every risk factor that justifies the verdict.",
      "pillar": "P2",
      "anchor": "Lesson 14.1 — third-party libraries, extension packs, SCA review",
      "task": {
        "type": "sca",
        "prompt": "A dependency report for the patient-export feature is on the bench. Read it, choose the verdict, and select EVERY risk factor that justifies it (skip anything that is not a real risk).",
        "report": {
          "name": "json-flatten",
          "version": "2.3.0",
          "context": "Imported by: patient-report export feature (handles clinician data)",
          "rows": [
            {
              "field": "Latest security advisory",
              "value": "CVE-2024-3117* — deserialization RCE — CVSS 9.8 CRITICAL",
              "flag": "bad"
            },
            {
              "field": "License",
              "value": "GPL-3.0 — Northwind policy allows proprietary licenses only",
              "flag": "bad"
            },
            {
              "field": "Maintenance",
              "value": "Last release 4 YEARS ago; repository archived; issues closed as \"won’t fix\"",
              "flag": "bad"
            },
            {
              "field": "Popularity",
              "value": "High weekly download count; widely used",
              "flag": "good"
            }
          ]
        },
        "verdictOptions": [
          {
            "id": "accept",
            "label": "ACCEPT as-is — it is popular and works",
            "sub": "ship with the current version"
          },
          {
            "id": "reject",
            "label": "REJECT & REPLACE with a maintained, MIT-licensed alternative",
            "sub": "schedule substitution work this sprint"
          },
          {
            "id": "pin",
            "label": "PIN the vulnerable version and move on",
            "sub": "revisit next quarter"
          }
        ],
        "correctVerdict": "reject",
        "factors": [
          {
            "id": "f1",
            "label": "Critical CVE (CVSS 9.8, remote code execution) in the shipped version"
          },
          {
            "id": "f2",
            "label": "License (GPL-3.0) conflicts with the proprietary product policy"
          },
          {
            "id": "f3",
            "label": "Project is unmaintained — archived, no releases in four years"
          },
          {
            "id": "f4",
            "label": "High weekly downloads prove the library is secure"
          },
          {
            "id": "f5",
            "label": "It is only used in one feature, so no review is needed"
          }
        ],
        "correctFactors": [
          "f1",
          "f2",
          "f3"
        ]
      },
      "hints": [
        "Supply-chain risk has three axes: known vulnerabilities, license compatibility, maintenance health. Score each.",
        "Popularity measures usage, not safety — Log4j was everywhere too.",
        "Verdict: reject & replace. Factors: the CVE, the license conflict, the unmaintained status — not popularity."
      ],
      "feedbackPass": "Correct verdict, correct factors. Supply-chain review weighs vulnerability (9.8 RCE), license (GPL-3.0 vs proprietary policy) and maintenance (archived repo = no patches ever). Popularity is not a security control — Log4Shell proved that in 2021 when a ubiquitous library carried a CVSS 10 RCE. SCA in the pipeline automates exactly this check.",
      "feedbackFail": "That verdict or factor set would not survive review. The library has a critical RCE, a license that conflicts with policy, and a dead upstream — any one alone justifies replacement. High download counts measure popularity, not security, and \"used in one feature\" is scope, not exemption."
    },
    {
      "id": "OBJ-M12",
      "stationId": "stn-07",
      "title": "Hotfix drill: 2.5.1",
      "sentence": "Order the eight steps of a compliant emergency release.",
      "pillar": "P4",
      "anchor": "Lesson 14.1 — hotfixes/emergency releases, secure environments, versioning",
      "task": {
        "type": "sequence",
        "prompt": "A critical XSS is being exploited in the production payment form — right now. Order the eight steps of a compliant emergency release.",
        "items": [
          {
            "id": "ecab",
            "label": "Obtain EXPEDITED e-CAB approval",
            "sub": "emergency ≠ exemption"
          },
          {
            "id": "prodv",
            "label": "Promote to PRODUCTION; version becomes 2.5.1",
            "sub": "tag the release"
          },
          {
            "id": "patch",
            "label": "Patch only the vulnerable code path",
            "sub": "smallest possible change"
          },
          {
            "id": "branch",
            "label": "Create hotfix/2.5.1 from the PRODUCTION tag (not from main)",
            "sub": "isolates the fix from unreleased work"
          },
          {
            "id": "doc",
            "label": "Update the change ticket + run the post-incident review",
            "sub": "close the loop"
          },
          {
            "id": "smoke",
            "label": "Staging smoke test of the fixed path",
            "sub": "even hotfixes touch staging"
          },
          {
            "id": "backport",
            "label": "Backport / merge the fix into the mainline branch",
            "sub": "so it survives the next release"
          },
          {
            "id": "gates",
            "label": "Run minimum gates: SAST + SCA + unit tests",
            "sub": "speed matters, evidence still matters"
          }
        ],
        "correctOrder": [
          "branch",
          "patch",
          "gates",
          "ecab",
          "smoke",
          "prodv",
          "backport",
          "doc"
        ]
      },
      "hints": [
        "First question of any emergency: which code is actually running in production? The fix branches from THAT, not from main.",
        "Approval is expedited, never skipped — and it comes after the technical gates, before the deploy.",
        "branch → patch → minimum gates → e-CAB → staging smoke → production 2.5.1 → backport → ticket + PIR."
      ],
      "feedbackPass": "Drill complete. The two steps teams most often skip are the backport (the fix then silently vanishes in the next release, re-opening the hole) and the post-incident review. Also note versioning: the hotfix bumps 2.5.0 → 2.5.1 from the production tag — you never ship an unversioned artifact.",
      "feedbackFail": "Sequence is off. Anchor points: branch from the PRODUCTION tag first (main may contain unreleased, untested work); minimum gates before approval; approval before deploy; backport and documentation after deploy. Emergencies compress the process — they never skip it."
    }
  ],
  "MEDIUM_QUIZ": [
    {
      "id": "mq1",
      "q": "Which SDLC approach embeds security as a shared responsibility, enforced by automated gates on every commit?",
      "options": [
        {
          "id": "a",
          "label": "Waterfall"
        },
        {
          "id": "b",
          "label": "Agile (Scrum only)"
        },
        {
          "id": "c",
          "label": "DevSecOps"
        },
        {
          "id": "d",
          "label": "Ad hoc"
        }
      ],
      "correct": "c",
      "explanation": "DevSecOps integrates Development, Security and Operations: security is every team member’s responsibility and is enforced automatically by pipeline gates (SAST/SCA/DAST) on each commit.",
      "topic": "SDLC delivery models",
      "review": "Knowledge Core → Three ways to build"
    },
    {
      "id": "mq2",
      "q": "A lead engineer says: \"We always run our security testing the week before release.\" Which principle is he violating?",
      "options": [
        {
          "id": "a",
          "label": "Shift-left — moving security work earlier, where fixes are cheaper"
        },
        {
          "id": "b",
          "label": "Obfuscation — hiding implementation details from reverse engineers"
        },
        {
          "id": "c",
          "label": "Tamper resistance — protecting code from unauthorized modification"
        },
        {
          "id": "d",
          "label": "Defense in depth — layered controls that survive single failures"
        }
      ],
      "correct": "a",
      "explanation": "Shift-left says security activities belong in the earliest phases — threat modeling at design, SAST at commit — where defects are cheapest to fix. Obfuscation, tamper resistance and defense in depth are all real practices, but none of them describes WHEN testing happens; testing only the week before release is the opposite of shifting left.",
      "topic": "Shift-left principle",
      "review": "Knowledge Core → Three ways to build (shift-left callout)"
    },
    {
      "id": "mq3",
      "q": "Which technique analyzes application SOURCE CODE without executing it?",
      "options": [
        {
          "id": "a",
          "label": "DAST"
        },
        {
          "id": "b",
          "label": "SAST"
        },
        {
          "id": "c",
          "label": "Fuzzing"
        },
        {
          "id": "d",
          "label": "Penetration testing"
        }
      ],
      "correct": "b",
      "explanation": "SAST = Static Application Security Testing: it reads source (or bytecode) without running it, finding patterns like tainted dataflow into SQL sinks. DAST and pentesting attack a running app; fuzzing feeds it malformed input.",
      "topic": "SAST vs dynamic testing",
      "review": "Knowledge Core → The testing arsenal"
    },
    {
      "id": "mq4",
      "q": "Which promotion path is compliant?",
      "options": [
        {
          "id": "a",
          "label": "Sandbox → Development → Production → Staging → Test/QA"
        },
        {
          "id": "b",
          "label": "Sandbox → Development → Test/QA → Staging → Production"
        },
        {
          "id": "c",
          "label": "Development → Test/QA → Production → Staging → Sandbox"
        },
        {
          "id": "d",
          "label": "Sandbox → Staging → Development → Test/QA → Production"
        }
      ],
      "correct": "b",
      "explanation": "The approved route is sandbox → development → test/QA → staging → production. Each hop mirrors production more closely, and staging is the production mirror where the final DAST scan and change approval happen — it is never optional. The other routes all visit the wrong environment at the wrong time; reaching production before staging means testing on live patients.",
      "topic": "Code promotion environments",
      "review": "Knowledge Core → Security throughout the SDLC (integration & deployment)"
    },
    {
      "id": "mq5",
      "q": "What is the PRIMARY purpose of change control?",
      "options": [
        {
          "id": "a",
          "label": "Speeding up deployments by automating the pipeline"
        },
        {
          "id": "b",
          "label": "Tracking who wrote each line of production code"
        },
        {
          "id": "c",
          "label": "Ensuring changes are reviewed, tested, approved, documented"
        },
        {
          "id": "d",
          "label": "Documenting every application function for auditors"
        }
      ],
      "correct": "c",
      "explanation": "Change control guarantees every production change carries review (CAB), test evidence, an approval record and a rollback plan — emergencies compress this into expedited e-CAB ratification, they never skip it. Pipeline speed is a DevSecOps goal, line attribution belongs to version control, and generic documentation alone proves nothing was reviewed or approved.",
      "topic": "Change control",
      "review": "Debrief → Mitigation recommendations (change control row)"
    },
    {
      "id": "mq6",
      "q": "Certified data-wipe of old build servers happens at retirement. When must the disposal REQUIREMENT be defined?",
      "options": [
        {
          "id": "a",
          "label": "In planning, with every other security requirement"
        },
        {
          "id": "b",
          "label": "At retirement, when the servers are racked out"
        },
        {
          "id": "c",
          "label": "During maintenance, one sprint before decommissioning"
        },
        {
          "id": "d",
          "label": "During integration, inside the release checklist"
        }
      ],
      "correct": "a",
      "explanation": "Security throughout the SDLC means disposal, retention and data-handling requirements are captured in planning and traced in the RTM. Executing the wipe at retirement is correct — inventing the requirement there is the audit finding. Maintenance and integration own other controls; neither is where requirements are born.",
      "topic": "Security requirements timing",
      "review": "Knowledge Core → Security throughout the SDLC (planning + retirement)"
    }
  ],
  "HARD_OBJECTIVES": [
    {
      "id": "OBJ-H1",
      "stationId": "stn-01",
      "title": "Release dossier audit",
      "sentence": "Audit the outgoing lead’s dossier: select every document recording a process violation.",
      "pillar": "P2",
      "anchor": "Obj 4.1 — secure environments, version control, threat modeling, promotion, testing integration",
      "task": {
        "type": "multiselect",
        "prompt": "The previous release lead left this dossier for VitalsPortal v2.5. Select EVERY document that records a skipped or bypassed secure-SDLC control. Compliant documents and noise must NOT be selected.",
        "evidence": [
          {
            "id": "memo-a",
            "title": "MEMO — v2.5 design sign-off (12 Jan)",
            "kind": "MEMO",
            "body": "MEMO — V2.5 DESIGN SIGN-OFF (12 Jan)\nScope: new patient-records module.\nThreat modeling: SKIPPED this cycle — release date fixed, security\narchitecture review deferred. Product owner signed off alone.\nNote added: \"SAST will catch design issues later.\""
          },
          {
            "id": "log-b",
            "title": "GIT AUDIT EXTRACT — vitalsportal-web",
            "kind": "LOG",
            "body": "GIT AUDIT EXTRACT (repo: vitalsportal-web)\n2025-01-18 22:41  m.reyes  PUSH -> main  commit 8f3d2a\n  message: \"quick fix, will document later\"\n  bypassed: branch workflow, pull request, code review (0 reviewers)"
          },
          {
            "id": "memo-c",
            "title": "REQUIREMENTS HANDOFF (14 Jan)",
            "kind": "MEMO",
            "body": "REQUIREMENTS HANDOFF (14 Jan)\n22 functional requirements captured from stakeholder workshops.\nSecurity requirements: DEFERRED to a later sprint per PM decision.\nRTM: not maintained for v2.5 (\"we will backfill before the audit\")."
          },
          {
            "id": "ticket-d",
            "title": "DEPLOY RECORD DP-88 (02 Feb)",
            "kind": "TICKET",
            "body": "DEPLOY RECORD DP-88 (02 Feb)\nPromotion: TEST/QA -> PRODUCTION\nReason given: staging cluster occupied by a marketing demo environment.\nCAB: notified AFTER go-live (no pre-approval on record).\nRollback plan: none attached."
          },
          {
            "id": "report-e",
            "title": "TESTING SOP — VITALSPORTAL v3",
            "kind": "SOP",
            "body": "TESTING SOP — VITALSPORTAL (current, v3)\nDAST: monthly schedule, PRODUCTION only (staging \"not representative\").\nFindings triage: reviewed at the next release planning meeting.\nSCA: not wired into the pipeline; dependencies reviewed annually."
          },
          {
            "id": "note-f",
            "title": "SUPPLY-CHAIN NOTE — locked deps",
            "kind": "NOTE",
            "body": "SUPPLY-CHAIN NOTE (locked deps)\nAll runtime dependencies pinned via package-lock.json.\nSCA gate: active on every build; blocks on critical findings.\nSBOM: generated per release and diffed against the previous release."
          },
          {
            "id": "noise-1",
            "title": "ALL-HANDS BROADCAST",
            "kind": "BROADCAST",
            "body": "ALL-HANDS BROADCAST\nStandup moves to 09:30 from Monday. Badge photo re-takes in Lobby B\non Thursday. (No engineering impact.)"
          }
        ],
        "options": [
          {
            "id": "memo-a",
            "label": "Memo A — design sign-off"
          },
          {
            "id": "log-b",
            "label": "Log B — git audit extract"
          },
          {
            "id": "memo-c",
            "label": "Memo C — requirements handoff"
          },
          {
            "id": "ticket-d",
            "label": "Ticket D — deploy record DP-88"
          },
          {
            "id": "report-e",
            "label": "Report E — testing SOP"
          },
          {
            "id": "note-f",
            "label": "Note F — supply-chain note"
          },
          {
            "id": "noise-1",
            "label": "Broadcast — all-hands notice"
          }
        ],
        "correct": [
          "memo-a",
          "log-b",
          "memo-c",
          "ticket-d",
          "report-e"
        ]
      },
      "hints": [
        "Five documents describe skipped controls. Note F is compliant — pinned deps + SCA gate + SBOM diffing is exactly what good looks like. The broadcast is noise.",
        "Skipped threat model, direct push to main, deferred security requirements/RTM, QA→prod jump with post-hoc approval, prod-only monthly DAST with no SCA.",
        "Violations: A, B, C, D, E. F and the broadcast are clean."
      ],
      "feedbackPass": "Full audit — five violations found. A skipped threat modeling (a design-phase control SAST cannot replace), B bypassed version-control review, C deferred security requirements with no RTM (an audit finding by itself), D jumped QA→production without pre-approval or rollback, and E pushed dynamic testing to production-only/monthly — far too late and on live patients. Note F is the control set every one of them needed.",
      "feedbackFail": "Not the full violation set. Walk each document against its phase control: design needs threat modeling, mainline needs reviewed pull requests, requirements need security items + an RTM, promotion needs staging + pre-approval, testing needs DAST on staging every release plus SCA in the pipeline. Note F (pinned deps, SCA, SBOM) is compliant, and the broadcast is noise."
    },
    {
      "id": "OBJ-H9",
      "stationId": "stn-02",
      "title": "Complete the traceability matrix",
      "sentence": "Complete the RTM: pick the implementing control and the verifying test for each requirement.",
      "pillar": "P4",
      "anchor": "Obj 4.1/4.2 — requirements traceability matrix; security requirements",
      "task": {
        "type": "rtm",
        "prompt": "Four security requirements from the v2.5 register are missing their traceability rows. For each, select the control that IMPLEMENTS it and the verification that PROVES it.",
        "rows": [
          {
            "id": "r1",
            "requirement": "R1 — Patient records are encrypted at rest",
            "controlOptions": [
              {
                "id": "c1",
                "label": "AES-256 at-rest encryption on database volumes"
              },
              {
                "id": "c2",
                "label": "Output encoding on all rendered fields"
              },
              {
                "id": "c3",
                "label": "SCA gate in the build pipeline"
              },
              {
                "id": "c4",
                "label": "RASP tamper protection"
              }
            ],
            "testOptions": [
              {
                "id": "t1",
                "label": "Configuration review + unit test asserting ciphertext on disk"
              },
              {
                "id": "t2",
                "label": "DAST injection suite against staging"
              },
              {
                "id": "t3",
                "label": "SCA report + SBOM diff"
              },
              {
                "id": "t4",
                "label": "Parser fuzzing campaign"
              }
            ],
            "correctControl": "c1",
            "correctTest": "t1"
          },
          {
            "id": "r2",
            "requirement": "R2 — All user input is validated server-side",
            "controlOptions": [
              {
                "id": "c1",
                "label": "Output encoding on all rendered fields"
              },
              {
                "id": "c2",
                "label": "Server-side schema validation + parameterized queries"
              },
              {
                "id": "c3",
                "label": "AES-256 at-rest encryption on database volumes"
              },
              {
                "id": "c4",
                "label": "Code signing of release artifacts"
              }
            ],
            "testOptions": [
              {
                "id": "t1",
                "label": "SCA report + SBOM diff"
              },
              {
                "id": "t2",
                "label": "Configuration review of disk volumes"
              },
              {
                "id": "t3",
                "label": "SAST tainted-flow scan + DAST injection suite"
              },
              {
                "id": "t4",
                "label": "APK decompilation review"
              }
            ],
            "correctControl": "c2",
            "correctTest": "t3"
          },
          {
            "id": "r3",
            "requirement": "R3 — Session tokens expire after 15 minutes",
            "controlOptions": [
              {
                "id": "c1",
                "label": "RASP tamper protection"
              },
              {
                "id": "c2",
                "label": "Output encoding on rendered fields"
              },
              {
                "id": "c3",
                "label": "Server-side session timeout policy"
              },
              {
                "id": "c4",
                "label": "SCA gate in the build pipeline"
              }
            ],
            "testOptions": [
              {
                "id": "t1",
                "label": "Automated session test + DAST session check"
              },
              {
                "id": "t2",
                "label": "Parser fuzzing campaign"
              },
              {
                "id": "t3",
                "label": "SBOM license diff"
              },
              {
                "id": "t4",
                "label": "Unit test asserting ciphertext on disk"
              }
            ],
            "correctControl": "c3",
            "correctTest": "t1"
          },
          {
            "id": "r4",
            "requirement": "R4 — Third-party libraries carry no critical CVEs",
            "controlOptions": [
              {
                "id": "c1",
                "label": "Server-side session timeout policy"
              },
              {
                "id": "c2",
                "label": "SCA gate blocking builds on critical findings"
              },
              {
                "id": "c3",
                "label": "Output encoding on rendered fields"
              },
              {
                "id": "c4",
                "label": "AES-256 at-rest encryption"
              }
            ],
            "testOptions": [
              {
                "id": "t1",
                "label": "DAST session check"
              },
              {
                "id": "t2",
                "label": "Configuration review of disk volumes"
              },
              {
                "id": "t3",
                "label": "Parser fuzzing campaign"
              },
              {
                "id": "t4",
                "label": "SCA report + SBOM diff per release"
              }
            ],
            "correctControl": "c2",
            "correctTest": "t4"
          }
        ]
      },
      "hints": [
        "Trace each requirement to the control that IMPLEMENTS it in the product, then to the verification that OBSERVES it. Encryption requirement → encryption control → evidence that encryption exists.",
        "Dependency requirements are implemented by pipeline gates (SCA) and verified by their reports + SBOM diffs; input rules are verified by SAST + DAST together.",
        "R1→c1/t1 · R2→c2/t3 · R3→c3/t1 · R4→c2/t4."
      ],
      "feedbackPass": "RTM complete. This matrix is what auditors sample first: every security requirement traces to a control that implements it and a verification that proves it — closing the loop between requirements, code and evidence. \"Backfilling the RTM before the audit\" (Memo C) is the failure mode this artifact prevents.",
      "feedbackFail": "Some rows broke the chain. The control must actually implement the requirement in the running system (encryption → encryption, sessions → session policy, dependencies → SCA gate), and the test must be able to OBSERVE that control working — an SBOM diff cannot prove disk encryption, and a volume review cannot prove session expiry."
    },
    {
      "id": "OBJ-H8",
      "stationId": "stn-03",
      "title": "Deploy-time protection plan",
      "sentence": "Match each distribution/runtime threat to the control that counters it.",
      "pillar": "P4",
      "anchor": "Obj 4.2 — security controls in architecture: signing, obfuscation, encryption, RASP",
      "task": {
        "type": "assign",
        "prompt": "VitalsPortal ships as a mobile app for clinicians. Match each threat to its countermeasure. Two buckets are test-time tools — a correctly planned release maps NO threats to them.",
        "items": [
          {
            "id": "local",
            "label": "Device thief extracts cached patient records from local storage"
          },
          {
            "id": "hook",
            "label": "A hooking framework tampers with app memory to bypass license checks"
          },
          {
            "id": "repack",
            "label": "Attacker repackages the APK with injected code and redistributes it"
          },
          {
            "id": "decomp",
            "label": "Competitor decompiles the app to steal the proprietary triage algorithm"
          }
        ],
        "buckets": [
          {
            "id": "signing",
            "label": "CODE SIGNING",
            "sub": "verify publisher & integrity of the artifact"
          },
          {
            "id": "obfusc",
            "label": "CODE OBFUSCATION",
            "sub": "raise the cost of reverse engineering"
          },
          {
            "id": "encrypt",
            "label": "ENCRYPTION AT REST",
            "sub": "protect stored data on the device"
          },
          {
            "id": "rasp",
            "label": "RASP",
            "sub": "runtime self-protection against tampering"
          },
          {
            "id": "fuzzt",
            "label": "FUZZING",
            "sub": "TEST-TIME tool"
          },
          {
            "id": "dastt",
            "label": "DAST",
            "sub": "TEST-TIME tool"
          }
        ],
        "correct": {
          "repack": "signing",
          "decomp": "obfusc",
          "local": "encrypt",
          "hook": "rasp"
        }
      },
      "hints": [
        "Two buckets are labeled TEST-TIME — no deployment threat maps to them. Ask: which control is present when the threat happens?",
        "Repackaging breaks artifact integrity; memory tampering needs a defense that runs INSIDE the app.",
        "repack→Code signing · decomp→Obfuscation · local theft→Encryption at rest · hooking→RASP."
      ],
      "feedbackPass": "All four mapped — and the two test-time buckets stayed empty, which is the point: SAST/DAST/fuzzing find vulnerabilities BEFORE release; signing, obfuscation, encryption and RASP protect the artifact and its runtime AFTER release. A hardened release needs both families.",
      "feedbackFail": "A threat landed on a test-time tool (or the wrong control). Fuzzing and DAST run in your pipeline, not on the patient’s phone. Counters: repackaging → code signing (invalidates tampered artifacts), reverse engineering → obfuscation, local data theft → encryption at rest, runtime tampering → RASP."
    },
    {
      "id": "OBJ-H3",
      "stationId": "stn-04",
      "title": "Review: three flaws, three fixes",
      "sentence": "For each finding choose the compliant fix AND the tool that should have caught it automatically.",
      "pillar": "P4",
      "anchor": "Obj 4.2 — secure coding (SQLi, XSS, hardcoded secrets) + Obj 4.3 tool mapping",
      "task": {
        "type": "codefix",
        "prompt": "Three findings from the pre-release review of VitalsPortal. For EACH: select the compliant fix, then the tool that should have flagged it in the pipeline.",
        "language": "js",
        "parts": [
          {
            "id": "f1",
            "caption": "Finding 1 — patient search handler",
            "code": "// finding 1: user input concatenated into SQL\nconst name = req.body.patientName;\nconst q = \"SELECT * FROM patients WHERE name = '\" + name + \"'\";\ndb.exec(q);",
            "flawLine": 3,
            "options": [
              {
                "id": "o1",
                "label": "Parameterized query / stored procedure",
                "snippet": "db.exec(\"SELECT * FROM patients WHERE name = ?\", [name]);"
              },
              {
                "id": "o2",
                "label": "Blacklist quotes and semicolons in the input",
                "snippet": "const safe = name.replace(/'|;/g, \"\");"
              },
              {
                "id": "o3",
                "label": "Add a maxlength attribute to the search box",
                "snippet": "<input name=\"patientName\" maxlength=\"60\">"
              },
              {
                "id": "o4",
                "label": "Wrap the query in a try/catch",
                "snippet": "try { db.exec(q); } catch (e) { log(e); }"
              }
            ],
            "correct": "o1",
            "toolLabel": "Tool that should have caught it:",
            "toolOptions": [
              {
                "id": "sast",
                "label": "SAST"
              },
              {
                "id": "dast",
                "label": "DAST"
              },
              {
                "id": "secrets",
                "label": "Secret scanning"
              },
              {
                "id": "fuzz",
                "label": "Fuzzing"
              }
            ],
            "correctTool": "sast"
          },
          {
            "id": "f2",
            "caption": "Finding 2 — clinician directory renderer",
            "code": "// finding 2: raw user input rendered as HTML\nrowEl.innerHTML = clinicianNote;",
            "flawLine": 2,
            "options": [
              {
                "id": "o1",
                "label": "Context-aware output encoding with the approved library",
                "snippet": "rowEl.innerHTML = Encoder.forHTML(clinicianNote);"
              },
              {
                "id": "o2",
                "label": "Block \"<script>\" with a regex filter",
                "snippet": "note = note.replace(/<script>/gi, \"\");"
              },
              {
                "id": "o3",
                "label": "Move the input field to a hidden form",
                "snippet": "<input type=\"hidden\" name=\"clinicianNote\">"
              },
              {
                "id": "o4",
                "label": "Log the input and monitor for abuse",
                "snippet": "logger.info({ note: clinicianNote });"
              }
            ],
            "correct": "o1",
            "toolLabel": "Tool that should have caught it:",
            "toolOptions": [
              {
                "id": "sast",
                "label": "SAST"
              },
              {
                "id": "dast",
                "label": "DAST"
              },
              {
                "id": "sca",
                "label": "SCA"
              },
              {
                "id": "iast",
                "label": "IAST"
              }
            ],
            "correctTool": "dast"
          },
          {
            "id": "f3",
            "caption": "Finding 3 — deployment configuration",
            "code": "// finding 3: committed to the repository\nconst DB_PASS = \"nw-prod-2024!\";\nconst db = connect({ host: \"10.20.0.11\", password: DB_PASS });",
            "flawLine": 2,
            "options": [
              {
                "id": "o1",
                "label": "Move the secret to a secret manager, reference via environment variable — and ROTATE the exposed credential",
                "snippet": "const db = connect({ host: cfg.host,\n  password: process.env.DB_PASS }); // value from vault\n// + rotation of the exposed credential is MANDATORY"
              },
              {
                "id": "o2",
                "label": "Base64-encode the password in the file",
                "snippet": "const DB_PASS = Buffer.from(\"nw-prod-2024!\").toString(\"base64\");"
              },
              {
                "id": "o3",
                "label": "Rename the variable to something less obvious",
                "snippet": "const cfgValue7 = \"nw-prod-2024!\";"
              },
              {
                "id": "o4",
                "label": "Delete the file from the repository",
                "snippet": "git rm config.js  // history still contains every commit"
              }
            ],
            "correct": "o1",
            "toolLabel": "Tool that should have caught it:",
            "toolOptions": [
              {
                "id": "sast",
                "label": "SAST"
              },
              {
                "id": "dast",
                "label": "DAST"
              },
              {
                "id": "secrets",
                "label": "Secret scanning"
              },
              {
                "id": "sca",
                "label": "SCA"
              }
            ],
            "correctTool": "secrets"
          }
        ]
      },
      "hints": [
        "Match tool to observability: the flaw visible in SOURCE is static; the flaw visible only in the RUNNING app is dynamic; a credential sitting in the repo is a secret-scanning find.",
        "For fixes: parameterize SQL, encode at output, and never \"hide\" a secret — a committed credential is burned and must be rotated.",
        "F1: parameterize + SAST · F2: context-aware encoding + DAST · F3: vault + rotation + secret scanning."
      ],
      "feedbackPass": "Three for three. SQL injection dies to parameterization (SAST sees the tainted concat in source), XSS dies to context-aware output encoding (DAST proves it against the running app), and the hardcoded credential is a secret-scanning find whose remediation ALWAYS includes rotation — deleting or renaming the variable is not enough, because git history keeps it forever. That credential maps to MITRE ATT&CK T1552 (Unsecured Credentials).",
      "feedbackFail": "At least one answer would not survive review. Check both halves per finding: the fix must remove the flaw CLASS (not hide it), and the tool must observe where the flaw lives — source (SAST), running app (DAST), or repository contents (secret scanning). Rotation is mandatory for any exposed credential."
    },
    {
      "id": "OBJ-H4",
      "stationId": "stn-05",
      "title": "Six missions, six tools",
      "sentence": "File all six missions under the correct technique — exact matches required.",
      "pillar": "P3",
      "anchor": "Obj 4.3 — SAST, DAST, IAST, SCA, fuzzing, penetration testing",
      "task": {
        "type": "assign",
        "prompt": "The compliance package requires the right technique for each mission. File all six. Two pairs are deliberately confusable — read the vantage point (\"from outside\" vs \"from inside\").",
        "items": [
          {
            "id": "m5",
            "label": "Lockfile scan flags a transitive dependency four versions behind, with a known RCE CVE"
          },
          {
            "id": "m6",
            "label": "Contractual go-live requires a time-boxed HUMAN adversarial engagement simulating a full attack"
          },
          {
            "id": "m3",
            "label": "Authenticated scanner attacks the running staging build FROM OUTSIDE and finds reflected XSS"
          },
          {
            "id": "m1",
            "label": "Tainted dataflow from req.body into a SQL sink, found while analyzing source WITHOUT executing it"
          },
          {
            "id": "m4",
            "label": "50 MB XML bombs and malformed headers crash the invoice parser service"
          },
          {
            "id": "m2",
            "label": "Instrumentation INSIDE the running QA build identifies the exact request that reaches a dangerous sink"
          }
        ],
        "buckets": [
          {
            "id": "sast",
            "label": "SAST",
            "sub": "static, source-level"
          },
          {
            "id": "dast",
            "label": "DAST",
            "sub": "dynamic, from outside"
          },
          {
            "id": "iast",
            "label": "IAST",
            "sub": "instrumented, from inside"
          },
          {
            "id": "sca",
            "label": "SCA",
            "sub": "dependencies & licenses"
          },
          {
            "id": "fuzz",
            "label": "FUZZING",
            "sub": "mutation / generative input"
          },
          {
            "id": "pentest",
            "label": "PENTEST",
            "sub": "human adversarial engagement"
          }
        ],
        "correct": {
          "m1": "sast",
          "m2": "iast",
          "m3": "dast",
          "m4": "fuzz",
          "m5": "sca",
          "m6": "pentest"
        }
      },
      "hints": [
        "IAST sees the request from INSIDE the running app (agent instrumentation); DAST sees it from OUTSIDE. The pentest is the only human one.",
        "\"Without executing\" = SAST. Lockfiles = SCA. Malformed input bombardment = fuzzing.",
        "m1→SAST · m2→IAST · m3→DAST · m4→Fuzzing · m5→SCA · m6→Pentest."
      ],
      "feedbackPass": "Perfect filing. The confusable pair resolved on vantage point: IAST = instrumentation inside the process, DAST = black-box from the network. Note pentest is the only technique with a HUMAN in the loop — automation complements it, never replaces it (and fuzzing is mutation/generative automation, not a pentest).",
      "feedbackFail": "Some missions are misfiled. Re-read the vantage: source without execution → SAST; inside the process → IAST; outside against the running app → DAST; lockfile/CVE → SCA; malformed input bombardment → fuzzing; human adversarial engagement → pentest."
    },
    {
      "id": "OBJ-H2",
      "stationId": "stn-06",
      "title": "Change-control forensics",
      "sentence": "Identify the bypassed ticket, the first missing control, and the correct remediation.",
      "pillar": "P2",
      "anchor": "Obj 4.1 — change control process & expedited (e-CAB) handling",
      "task": {
        "type": "triage",
        "prompt": "Three tickets reached the change system this week. One bypassed change control. Answer all three questions below — exact selections required.",
        "evidence": [
          {
            "id": "cc-201",
            "title": "CHANGE TICKET CC-201 — e-CAB emergency: API rate-limit bypass",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-201 — e-CAB EMERGENCY: API rate-limit bypass fix\nRisk: high | Deployed 03:40 after EXPEDITED e-CAB approval\n   (two engineers + security on-call, recorded pre-deploy)\n[x] Test evidence: unit + SAST on hotfix build (attached; e-CAB\n    ratified 08:15 within the 24h SLA)\n[x] Rollback: previous image retained, rehearsed\n[x] Follow-up: backport to main filed as PR #4412\nStatus: DEPLOYED — e-CAB RATIFIED within 24h"
          },
          {
            "id": "cc-202",
            "title": "CHANGE TICKET CC-202 — config change: log level",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-202 — Config change: log level to DEBUG\nRisk: \"TRIVIAL (config-only)\" per requester | Window: none\n[ ] CAB review — SKIPPED (\"config changes need no approval\")\n[ ] Test evidence — SKIPPED (same reasoning)\n[ ] Rollback plan — none\nSide effect (undocumented): the audit-log shipper was disabled in the\nsame commit \"to reduce noise\". Not yet reverted.\nStatus: DEPLOYED"
          },
          {
            "id": "cc-203",
            "title": "CHANGE TICKET CC-203 — dependency bump",
            "kind": "TICKET",
            "body": "CHANGE TICKET CC-203 — Dependency bump: jstr-utils 3.2.1 -> 3.3.0\nRisk: low | Window: 21 Mar 01:00\n[x] CAB review — APPROVED 20 Mar\n[x] Test evidence: SCA diff clean, regression suite green\n[x] Rollback plan: pin back to 3.2.1\nStatus: DEPLOYED per window"
          }
        ],
        "selects": [
          {
            "id": "violator",
            "label": "Which ticket bypassed change control?",
            "options": [
              {
                "id": "cc-201",
                "label": "CC-201 — e-CAB emergency rate-limit fix"
              },
              {
                "id": "cc-202",
                "label": "CC-202 — log-level config change"
              },
              {
                "id": "cc-203",
                "label": "CC-203 — dependency bump"
              }
            ],
            "correct": "cc-202"
          },
          {
            "id": "firstgap",
            "label": "FIRST control missing in that ticket:",
            "options": [
              {
                "id": "cab",
                "label": "CAB review before deployment"
              },
              {
                "id": "pass",
                "label": "A stronger password on the change system"
              },
              {
                "id": "docs",
                "label": "A longer ticket description"
              },
              {
                "id": "cicd",
                "label": "A faster CI/CD runner"
              }
            ],
            "correct": "cab"
          },
          {
            "id": "remediation",
            "label": "Correct remediation now:",
            "options": [
              {
                "id": "r1",
                "label": "Revert the side effect, file an expedited e-CAB with rollback plan, ratify within 24h"
              },
              {
                "id": "r2",
                "label": "Nothing — config-only changes are exempt from change control"
              },
              {
                "id": "r3",
                "label": "Delete the ticket and re-create it with correct dates"
              },
              {
                "id": "r4",
                "label": "Roll back the entire fix immediately — undocumented deploys are always invalid"
              }
            ],
            "correct": "r1"
          }
        ]
      },
      "hints": [
        "CC-201 is the model emergency: EXPEDITED approval, evidence, rollback, ratification inside the SLA. Look for the ticket that skipped controls while claiming to be trivial.",
        "The bypassing ticket also smuggled in an undocumented side effect that weakens audit logging.",
        "Violator: CC-202. First gap: CAB review before deployment. Remediation: revert side effect + expedited e-CAB + ratify in 24h."
      ],
      "feedbackPass": "Forensics correct. CC-202 shows the classic \"trivial change\" bypass — and its undocumented side effect (disabling the audit-log shipper) is exactly why small changes go through review: the review would have caught the second change hiding in the same commit. CC-201 is the contrast case: emergency handled with expedited approval and ratification. Rewriting or deleting tickets is falsification — never the remediation.",
      "feedbackFail": "One or more selections are off. CC-201 is compliant (expedited ≠ skipped); CC-203 is a routine approved change. The bypass is the \"trivial\" config change with no CAB, no evidence, no rollback — and its remediation is to restore the controls (revert the side effect, file expedited e-CAB, ratify in 24h), not to destroy paperwork."
    },
    {
      "id": "OBJ-H6",
      "stationId": "stn-06",
      "title": "Engineer the pipeline",
      "sentence": "Order all eight pipeline steps exactly, then name the still-missing control.",
      "pillar": "P1",
      "anchor": "Obj 4.3 — integrating automated security testing into CI/CD end-to-end",
      "task": {
        "type": "sequence",
        "prompt": "The release-engineering checklist for v2.5 lost its order during a tooling migration. Restore the exact sequence from first step to last, then identify the control the checklist is still missing.",
        "items": [
          {
            "id": "s5",
            "label": "Deploy STAGING + full DAST scan",
            "sub": "production mirror"
          },
          {
            "id": "s1",
            "label": "Pre-commit hooks + secret scanning",
            "sub": "developer machines, before anything is shared"
          },
          {
            "id": "s7",
            "label": "PRODUCTION deploy",
            "sub": "version bump + release tag"
          },
          {
            "id": "s3",
            "label": "SAST scan of the source tree",
            "sub": "block on high severity findings"
          },
          {
            "id": "s8",
            "label": "Monitoring + RASP + post-release verification",
            "sub": "runtime protection active"
          },
          {
            "id": "s2",
            "label": "Build + SCA gate",
            "sub": "dependency & license check; block on critical CVE"
          },
          {
            "id": "s6",
            "label": "CAB review & approval",
            "sub": "change record + rollback plan"
          },
          {
            "id": "s4",
            "label": "Unit tests + IAST runs",
            "sub": "instrumented QA environment"
          }
        ],
        "correctOrder": [
          "s1",
          "s2",
          "s3",
          "s4",
          "s5",
          "s6",
          "s7",
          "s8"
        ],
        "extra": {
          "label": "Which control is STILL missing from this checklist?",
          "options": [
            {
              "id": "rb",
              "label": "Rollback plan documented and rehearsed before go-live"
            },
            {
              "id": "linter",
              "label": "A second code-style linter"
            },
            {
              "id": "retro",
              "label": "Longer sprint retrospectives"
            },
            {
              "id": "manual",
              "label": "Manual regression of every feature by the whole team"
            }
          ],
          "correct": "rb"
        }
      },
      "hints": [
        "Static gates run while there is still no environment; DAST needs the running staging app; the human approval comes after all technical gates; runtime protection is the last thing switched on.",
        "Secrets leak earliest — pre-commit. Production deploy is second-to-last only because verification follows it.",
        "s1→s2→s3→s4→s5→s6→s7→s8, and the missing control is the rehearsed rollback plan."
      ],
      "feedbackPass": "Pipeline engineered. The order encodes the economics: cheapest checks first (hooks/secrets), static gates on the artifact (SCA+SAST), behavioral gates on instrumented environments (IAST, DAST), human accountability (CAB) before the irreversible step, and runtime protection + verification after. And yes — no go-live without a rehearsed rollback plan; that was DP-88’s fatal gap.",
      "feedbackFail": "The sequence or the gap is wrong. Anchor on causality: hooks precede the build; SCA/SAST gate the artifact; IAST runs in QA; DAST needs staging; CAB approves before production; monitoring+RASP verify after. The missing control is the one DP-88 also lacked: a rehearsed rollback plan."
    },
    {
      "id": "OBJ-H5",
      "stationId": "stn-07",
      "title": "Supply-chain verdict: xml-speed-parser",
      "sentence": "Issue the verdict and select every real risk factor.",
      "pillar": "P4",
      "anchor": "Obj 4.1/4.2 — third-party libraries, transitive dependencies, SCA judgment",
      "task": {
        "type": "sca",
        "prompt": "The dependency board flags a transitive library in the patient-report export path. Read the report, issue the verdict, and select EVERY factor that is a genuine supply-chain risk (not a rationalization).",
        "report": {
          "name": "xml-speed-parser",
          "version": "0.9.2",
          "context": "Transitive dependency of docx-export · used in patient report export (handles clinician-uploaded XML)",
          "rows": [
            {
              "field": "Security advisory",
              "value": "CVE-2024-2998* — XML External Entity (XXE) — CVSS 7.5 HIGH",
              "flag": "bad"
            },
            {
              "field": "License",
              "value": "LGPL-2.1 — restrictions conflict with closed-source distribution",
              "flag": "bad"
            },
            {
              "field": "Maintenance",
              "value": "Last upstream commit 14 MONTHS ago; 3 security PRs open 8+ months",
              "flag": "bad"
            },
            {
              "field": "Exposure",
              "value": "Parses clinician-uploaded XML on a public endpoint",
              "flag": "bad"
            },
            {
              "field": "Popularity",
              "value": "120k weekly downloads",
              "flag": "good"
            }
          ]
        },
        "verdictOptions": [
          {
            "id": "accept",
            "label": "ACCEPT — transitive dependencies carry no real risk",
            "sub": "keep as-is"
          },
          {
            "id": "replace",
            "label": "REJECT & REPLACE with xml-secure-x (MIT, actively maintained, no CVEs)",
            "sub": "substitution this sprint"
          },
          {
            "id": "waf",
            "label": "ACCEPT but add a WAF rule and revisit next year",
            "sub": "compensating control only"
          }
        ],
        "correctVerdict": "replace",
        "factors": [
          {
            "id": "f1",
            "label": "Known high-severity CVE (XXE, CVSS 7.5) reachable from uploaded files"
          },
          {
            "id": "f2",
            "label": "License terms conflict with the closed-source product"
          },
          {
            "id": "f3",
            "label": "Unmaintained upstream with ignored security PRs"
          },
          {
            "id": "f4",
            "label": "Transitive dependencies are risk-free because we did not choose them"
          },
          {
            "id": "f5",
            "label": "A WAF rule alone is a complete long-term fix"
          }
        ],
        "correctFactors": [
          "f1",
          "f2",
          "f3"
        ]
      },
      "hints": [
        "Score three axes: vulnerability (and whether the exposure path reaches it), license compatibility, maintenance health. Transitive ≠ risk-free.",
        "\"It parses attacker-uploaded XML\" is exactly the XXE exposure path — the CVE is not theoretical here.",
        "Verdict: replace. Factors: the CVE, the license conflict, the unmaintained upstream — the WAF rationalization and the \"transitive is free\" myth are denials, not factors."
      ],
      "feedbackPass": "Verdict stands. A reachable CVSS 7.5 XXE on attacker-controlled XML, a license that blocks closed-source distribution, and a dead upstream with ignored security PRs — replace. Log4Shell taught the industry that ubiquitous \"someone else’s dependency\" is where supply-chain attacks live (MITRE ATT&CK T1195); SBOMs and SCA exist precisely to see these layers. A WAF rule is a compensating control, not a remediation.",
      "feedbackFail": "That call would not survive review. The CVE is reachable from uploaded files (the exposure row matters), the license conflicts with distribution, and upstream is dead. Transitive dependencies are attackers’ favorite hiding place, and a WAF is mitigation to buy time — not a fix. Reject and replace."
    },
    {
      "id": "OBJ-H7",
      "stationId": "stn-07",
      "title": "Hotfix under fire: 3.1.1",
      "sentence": "Order the eight steps of the emergency release exactly.",
      "pillar": "P4",
      "anchor": "Obj 4.1 — emergency releases, secure environments, versioning, RTM upkeep",
      "task": {
        "type": "sequence",
        "prompt": "Attackers are actively redirecting payments on the production site (open redirect on the payment form). Restore the exact eight-step emergency sequence.",
        "items": [
          {
            "id": "c4",
            "label": "Minimum gates: SAST + SCA + unit tests on the hotfix build",
            "sub": "evidence, even at 3 a.m."
          },
          {
            "id": "c1",
            "label": "CONFIRM & SCOPE the incident (versions affected, data touched)",
            "sub": "you cannot hotfix what you have not verified"
          },
          {
            "id": "c6",
            "label": "Staging smoke test + instrumented DAST on the fixed path",
            "sub": "the fix must demonstrably work"
          },
          {
            "id": "c2",
            "label": "Create hotfix/3.1.1 from the production tag v3.1.0",
            "sub": "not from main"
          },
          {
            "id": "c8",
            "label": "Backport to mainline + post-incident review + RTM update",
            "sub": "close the loop for the next release"
          },
          {
            "id": "c3",
            "label": "Patch the redirect validation SERVER-SIDE",
            "sub": "client-side checks do not count"
          },
          {
            "id": "c7",
            "label": "PRODUCTION deploy as 3.1.1, rollback tag verified ready",
            "sub": "version bump + escape hatch"
          },
          {
            "id": "c5",
            "label": "e-CAB emergency approval (expedited — never skipped)",
            "sub": "ratified within the 24h SLA"
          }
        ],
        "correctOrder": [
          "c1",
          "c2",
          "c3",
          "c4",
          "c5",
          "c6",
          "c7",
          "c8"
        ]
      },
      "hints": [
        "The first step is confirming and scoping — an unverified \"incident\" wastes the e-CAB and can mask a bogus report. The last is backport + review.",
        "Approval sits between your technical gates and your staging verification; production always bumps the version and keeps a rollback tag.",
        "c1→c2→c3→c4→c5→c6→c7→c8."
      ],
      "feedbackPass": "Clean execution under pressure. You confirmed before fixing (scope drives everything), branched from the production tag, fixed server-side, kept evidence flowing through the gates, used expedited-but-real approval, proved the fix on staging, shipped 3.1.1 with a ready rollback — and the two steps that prevent recurrence: backport and post-incident review with RTM upkeep.",
      "feedbackFail": "Sequence broken. Anchor points: confirm & scope FIRST; branch from the production tag (main is contaminated with unreleased work); server-side patch; minimum gates BEFORE approval; e-CAB before deploy; staging verification before production; backport + PIR + RTM update LAST."
    }
  ],
  "HARD_QUIZ": [
    {
      "id": "hq1",
      "scenario": "02:10 — a lead developer deployed an XSS fix straight to production after a Slack \"ship it\". The ticket was created three days later, with no evidence and no rollback plan.",
      "q": "As the release engineer, what is the correct next action?",
      "options": [
        {
          "id": "a",
          "label": "Delete the ticket and redeploy from a clean pipeline run"
        },
        {
          "id": "b",
          "label": "Declare the deployment exempt because the fix already works"
        },
        {
          "id": "c",
          "label": "File an expedited e-CAB with evidence and a rollback plan"
        },
        {
          "id": "d",
          "label": "Ship the next hotfix the same way, but document it first"
        }
      ],
      "correct": "c",
      "explanation": "Emergencies compress change control — they never skip it. The remediation restores the missing controls after the fact: expedited e-CAB ratification inside the 24h SLA, test evidence, a rollback plan. Deleting paperwork is falsification, “it worked” removes the evidence the next incident needs, and shipping undocumented again repeats the violation.",
      "topic": "Emergency change control",
      "review": "Debrief → Blue-team takeaways (e-CAB rule)"
    },
    {
      "id": "hq2",
      "scenario": "The product owner wants threat modeling dropped from the design phase of the payments rewrite: \"the schedule is fixed, and SAST will catch it.\"",
      "q": "Which response is the strongest?",
      "options": [
        {
          "id": "a",
          "label": "Agree — SAST plus DAST give equivalent coverage at design level"
        },
        {
          "id": "b",
          "label": "Refuse — threat modeling is a design control SAST cannot replace"
        },
        {
          "id": "c",
          "label": "Compromise — run threat modeling after the first release"
        },
        {
          "id": "d",
          "label": "Proceed — schedule pressure is an accepted SDLC justification"
        }
      ],
      "correct": "b",
      "explanation": "Shift-left economics: SAST inspects code for implementation flaws, but it cannot evaluate trust boundaries, abuse cases or missing controls in an architecture — threat modeling (e.g., STRIDE) is the design-phase control for that. A threat model costs a workshop; the same gap in production costs an incident response. Deferring it and shipping under schedule pressure are exactly how Memo A happened.",
      "topic": "Threat modeling & shift-left",
      "review": "Knowledge Core → Design phase + shift-left callout"
    },
    {
      "id": "hq3",
      "scenario": "You must guarantee no build ships with a vulnerable transitive dependency carrying a known CVE.",
      "q": "Which gate do you wire into CI/CD?",
      "options": [
        {
          "id": "a",
          "label": "SCA gate failing builds on critical CVEs"
        },
        {
          "id": "b",
          "label": "DAST scan of staging on every release"
        },
        {
          "id": "c",
          "label": "Secret scanning of the repo and history"
        },
        {
          "id": "d",
          "label": "Manual quarterly dependency and license review"
        }
      ],
      "correct": "a",
      "explanation": "SCA reads the lockfile and dependency tree — direct AND transitive — and matches known CVEs and licenses; gating the build on it enforces the policy automatically on every commit. DAST tests a running app, secret scanning finds credentials, and a manual quarterly review is periodic and leaky — none of them can GUARANTEE a vulnerable dependency never ships.",
      "topic": "SCA & supply chain",
      "review": "Knowledge Core → The testing arsenal (SCA row)"
    },
    {
      "id": "hq4",
      "scenario": "A junior analyst asks why the team runs both IAST and DAST: \"they both test the running app.\"",
      "q": "Which statement is correct?",
      "options": [
        {
          "id": "a",
          "label": "DAST observes from inside the app; IAST attacks from outside"
        },
        {
          "id": "b",
          "label": "IAST is static source analysis; DAST executes the application"
        },
        {
          "id": "c",
          "label": "They are the same capability packaged under different names"
        },
        {
          "id": "d",
          "label": "IAST instruments the running app; DAST attacks from outside"
        }
      ],
      "correct": "d",
      "explanation": "Both are dynamic — the difference is the vantage point. IAST instruments the application (or runtime) and sees exactly which request reached which sink with what data, giving low false positives; DAST probes externally like an attacker and needs no source access. Option A is the two vantage points swapped, which is the classic exam trap.",
      "topic": "IAST vs DAST",
      "review": "Knowledge Core → The testing arsenal (IAST/DAST rows)"
    },
    {
      "id": "hq5",
      "scenario": "A build has passed unit tests. Engineering wants to ship it to production tonight \"just this once\" to hit a contractual date, skipping staging.",
      "q": "What is the compliant decision?",
      "options": [
        {
          "id": "a",
          "label": "Ship — unit tests green are sufficient evidence tonight"
        },
        {
          "id": "b",
          "label": "Ship tonight and backfill the skipped gates tomorrow"
        },
        {
          "id": "c",
          "label": "Hold the release: staging, DAST and CAB come first"
        },
        {
          "id": "d",
          "label": "Ship to production and run DAST against live traffic"
        }
      ],
      "correct": "c",
      "explanation": "Promotion runs sandbox → dev → test/QA → staging → production: staging is where the production-mirror DAST scan and change approval happen. Shipping first means testing on live patients (the DP-88 pattern), backfilled gates still mean tonight’s deploy carried no evidence, and running DAST on production is monitoring an incident, not preventing one.",
      "topic": "Code promotion & staging",
      "review": "Knowledge Core → Security throughout the SDLC (integration & deployment)"
    },
    {
      "id": "hq6",
      "q": "Which pair of techniques are BOTH static (they analyze without executing the application)?",
      "options": [
        {
          "id": "a",
          "label": "SAST and SCA"
        },
        {
          "id": "b",
          "label": "DAST and IAST"
        },
        {
          "id": "c",
          "label": "Fuzzing and DAST"
        },
        {
          "id": "d",
          "label": "SAST and penetration testing"
        }
      ],
      "correct": "a",
      "explanation": "SAST reads source/bytecode; SCA reads the dependency tree and licenses. Neither executes the app. DAST, IAST, fuzzing and pentesting all involve the running application or service in some way.",
      "topic": "Static vs dynamic techniques",
      "review": "Knowledge Core → The testing arsenal"
    },
    {
      "id": "hq7",
      "scenario": "An auditor asks why the team maintains a requirements traceability matrix (RTM) at all.",
      "q": "What is the best justification?",
      "options": [
        {
          "id": "a",
          "label": "It documents which developer wrote each line of code"
        },
        {
          "id": "b",
          "label": "It traces each requirement to a control and proof"
        },
        {
          "id": "c",
          "label": "It replaces security testing with cheaper paperwork"
        },
        {
          "id": "d",
          "label": "It lists the features still waiting in the backlog"
        }
      ],
      "correct": "b",
      "explanation": "The RTM closes the loop requirement → control → verification: it is how you PROVE “input is validated server-side” or “data is encrypted at rest” is actually implemented and actually tested. Line attribution belongs to version control, paperwork never replaces testing, and the backlog is not traceability — Memo C skipping the RTM is an immediate audit finding.",
      "topic": "Requirements traceability (RTM)",
      "review": "Knowledge Core → Requirements analysis phase"
    }
  ],
  "GLOSSARY": [
    {
      "term": "SDLC",
      "def": "Software Development Life Cycle — the phased process (planning → requirements → design → development → testing → integration/deployment → maintenance → retirement) that turns an idea into operated software."
    },
    {
      "term": "Shift-left",
      "def": "Moving security activities earlier (\"left\") in the SDLC, where fixes are cheapest — e.g., threat modeling at design instead of patching after release."
    },
    {
      "term": "DevSecOps",
      "def": "Delivery model integrating security as a shared responsibility across Development, Security and Operations, enforced by automated gates in CI/CD."
    },
    {
      "term": "Change control",
      "def": "The process ensuring changes are requested, reviewed (CAB), tested, approved and documented before deployment. Emergencies use expedited (e-CAB) approval — never skipped."
    },
    {
      "term": "Code promotion",
      "def": "The controlled movement of a build through environments: sandbox → development → test/QA → staging → production."
    },
    {
      "term": "Version control",
      "def": "A system (e.g., Git) tracking every change; enforced via branches and reviewed pull requests so no unreviewed code reaches the mainline."
    },
    {
      "term": "SCA",
      "def": "Software Composition Analysis — scans dependencies/lockfiles for known CVEs and license risks in third-party and transitive code."
    },
    {
      "term": "SAST",
      "def": "Static Application Security Testing — analyzes source code without executing it (e.g., tainted dataflow into a SQL sink)."
    },
    {
      "term": "DAST",
      "def": "Dynamic Application Security Testing — attacks the RUNNING application from outside (e.g., an authenticated scanner finding XSS)."
    },
    {
      "term": "IAST",
      "def": "Interactive Application Security Testing — instrumentation inside the running app reveals which requests actually reach dangerous code, with low false positives."
    },
    {
      "term": "Fuzzing",
      "def": "Feeding malformed or randomized inputs to a program to find parser crashes and unhandled errors (mutation- or generative-based)."
    },
    {
      "term": "Parameterized query",
      "def": "A database call that sends SQL and data separately, so user input can never be executed as code. The structural fix for SQL injection."
    },
    {
      "term": "Output encoding",
      "def": "Transforming data at render time into the safe form of its context (HTML, attribute, JS, URL) so it cannot execute — the fix for XSS."
    },
    {
      "term": "RTM",
      "def": "Requirements Traceability Matrix — links each requirement (including security) to the control that implements it and the test that verifies it."
    },
    {
      "term": "RASP",
      "def": "Runtime Application Self-Protection — controls embedded in the running application that detect and block attacks (tampering, hooking) in real time."
    }
  ],
  "BRIEFING": {
    "headline": "The release engineer who left in a hurry",
    "paragraphs": [
      "Northwind Clinics — a fictional healthcare network — runs VitalsPortal, the patient portal used by 40,000 patients for records, messaging and bill pay. Tonight, version 2.5 enters its final release cycle: new SSO login, a rebuilt patient-records module, and a dependency refresh.",
      "Yesterday, the release engineer resigned mid-cycle and left behind a control room full of half-labeled tickets, an unordered pipeline, and a dependency report nobody has read. The change advisory board (CAB) meets in three days. Leadership wants the release shipped.",
      "You are the incoming DevSecOps release engineer. Your job: walk the release track station by station, restore the security controls to their proper places, fix what the previous lead skipped, and certify VitalsPortal 2.5 as safe to promote — or stop it.",
      "Everything here is practice: every ticket, code snippet, CVE and log line is synthetic training data. But the decisions you make map one-to-one to CompTIA CySA+ CS0-003 Domain 4 (Software Development Security) — secure development practices (4.1), secure coding (4.2), and automated security testing in the SDLC (4.3) — the same judgment calls real AppSec and SOC-adjacent engineers make every release."
    ]
  },
  "CORE_PHASES": [
    {
      "name": "Planning",
      "text": "Business case, scope, executive risk assessment. Security requirements and disposal requirements are born here."
    },
    {
      "name": "Requirements analysis",
      "text": "Define functional AND security requirements; start the RTM so every requirement stays traceable."
    },
    {
      "name": "Design",
      "text": "Architecture, trust boundaries, threat modeling (STRIDE). Choose controls before code exists."
    },
    {
      "name": "Development",
      "text": "Secure coding standards, version control with reviewed branches, peer review, secret hygiene."
    },
    {
      "name": "Testing",
      "text": "SAST, DAST, IAST, SCA, fuzzing, penetration testing — evidence against the requirements."
    },
    {
      "name": "Integration & deployment",
      "text": "CI/CD automation, code promotion through environments, change control, staging sign-off."
    },
    {
      "name": "Maintenance",
      "text": "Patch management, dependency health, hotfixes (expedited change control), monitoring, RASP."
    },
    {
      "name": "Retirement & disposal",
      "text": "Decommission, certified data wipe, license cleanup — requirements defined back in planning."
    }
  ],
  "CORE_MODELS": [
    {
      "name": "Waterfall",
      "tag": "sequential",
      "text": "Fixed phases signed off in order; heavy documentation; change is expensive. Fits regulated, milestone-contracted work."
    },
    {
      "name": "Agile",
      "tag": "iterative",
      "text": "Short sprints, working software, changing requirements. Security needs champions and sprint-sized activities to keep up."
    },
    {
      "name": "DevSecOps",
      "tag": "automated",
      "text": "Security as shared responsibility, enforced by automated gates in CI/CD on every commit. The \"shift-left\" model."
    }
  ],
  "CORE_TESTS": [
    {
      "name": "SAST",
      "kind": "static · source",
      "text": "Reads code without running it; finds tainted dataflows, weak crypto, injection patterns. Fast, early, some false positives."
    },
    {
      "name": "SCA",
      "kind": "static · dependencies",
      "text": "Reads lockfiles and manifests; matches CVEs and licenses across direct AND transitive libraries. Fail builds on critical findings."
    },
    {
      "name": "DAST",
      "kind": "dynamic · outside",
      "text": "Attacks the running app like an external attacker (authenticated crawls, injection probes). Needs an environment — staging, not production."
    },
    {
      "name": "IAST",
      "kind": "dynamic · inside",
      "text": "Agent instrumentation inside the running app; sees the exact request that reached a sink. Low false positives; needs instrumented test runs."
    },
    {
      "name": "Fuzzing",
      "kind": "dynamic · input",
      "text": "Bombards parsers with malformed/random input (mutation or generative) to trigger crashes and unhandled errors."
    },
    {
      "name": "Pentest",
      "kind": "human",
      "text": "Time-boxed human adversarial engagement simulating a full attack. Automation complements it; it never replaces it."
    }
  ],
  "CORE_RUNTIME": [
    {
      "name": "Code signing",
      "text": "Cryptographically signs artifacts so tampered/repackaged builds fail verification."
    },
    {
      "name": "Obfuscation",
      "text": "Raises the cost of reverse engineering proprietary logic. (Simplified: slows analysis, does not prevent it.)"
    },
    {
      "name": "Encryption at rest",
      "text": "Protects stored data on servers and devices even if storage is stolen."
    },
    {
      "name": "RASP",
      "text": "Embedded runtime protection that detects/blocks tampering, hooking and exploitation attempts while the app runs."
    }
  ],
  "CORE_WARSTORIES": [
    {
      "title": "Equifax (2017) — unpatched third-party framework",
      "text": "Attackers exploited a known Apache Struts vulnerability (CVE-2017-5638) that had a patch available for two months. 147 million records. Lesson: SCA + fast patch management is not paperwork — it is the difference between a vulnerability and a breach."
    },
    {
      "title": "Log4Shell (2021) — the invisible dependency",
      "text": "A CVSS 10.0 RCE (CVE-2021-44228) in Log4j — a library most organizations did not know they ran — made SBOMs and SCA overnight necessities. Lesson: you cannot patch what you cannot see; composition analysis makes the invisible visible."
    },
    {
      "title": "SolarWinds SUNBURST (2020) — the poisoned pipeline",
      "text": "Attackers compromised the build/CI environment and trojanized legitimate, correctly signed updates. Lesson: the pipeline itself is production. Protect build systems, control who can touch them, and treat artifact integrity (signing, SBOM diffing) as a security control."
    }
  ],
  "CORE_MITRE": [
    {
      "label": "CWE-89 · SQL injection",
      "note": "what OBJ-M5 / OBJ-H3 train you to kill"
    },
    {
      "label": "CWE-79 · XSS",
      "note": "OBJ-M6 / OBJ-H3 finding 2"
    },
    {
      "label": "CWE-798 · hardcoded credentials",
      "note": "OBJ-H3 finding 3"
    },
    {
      "label": "ATT&CK T1195 · Supply Chain Compromise",
      "note": "why SCA + signed artifacts exist"
    },
    {
      "label": "ATT&CK T1190 · Exploit Public-Facing Application",
      "note": "what unpatched SDLC gaps invite"
    },
    {
      "label": "ATT&CK T1552 · Unsecured Credentials",
      "note": "committed secrets become attacker material"
    }
  ],
  "DEBRIEF_SIGNALS": [
    {
      "source": "CI/CD build logs",
      "signal": "SCA/SAST gate results on every build",
      "logic": "FAIL build IF SCA finds CVE with CVSS ≥ 9.0 OR license ∉ approved list"
    },
    {
      "source": "Git audit log",
      "signal": "Direct pushes to main, force-pushes, unreviewed merges",
      "logic": "ALERT on push-to-main WITHOUT merge-commit evidence of review"
    },
    {
      "source": "Change-management system",
      "signal": "Deployments without a linked approved ticket",
      "logic": "CORRELATE deploy events ↔ approved change IDs; alert on orphan deploys"
    },
    {
      "source": "Change tickets at closure",
      "signal": "Missing test evidence or rollback plan",
      "logic": "FLAG any closed change with no evidence attachment"
    },
    {
      "source": "Dependency registries / SBOM diff",
      "signal": "New CVE against a pinned version between releases",
      "logic": "DIFF SBOM release N-1 → N; alert on new advisory for any component"
    },
    {
      "source": "Production runtime",
      "signal": "RASP tamper alerts; artifact hash mismatch",
      "logic": "ALERT when prod artifact hash ≠ signed staging hash"
    }
  ],
  "DEBRIEF_MITIGATIONS": [
    {
      "control": "Written secure-SDLC policy with phase gates (threat modeling at design, RTM at requirements)",
      "ids": "NIST SSDF PO.1–PO.3 · CySA+ 4.1"
    },
    {
      "control": "Protected mainline: branches + reviewed pull requests; no direct pushes",
      "ids": "SSDF PS.1 · CySA+ 4.1"
    },
    {
      "control": "Automated SAST + SCA gates in CI; DAST on staging every release; block on severity",
      "ids": "SSDF PW.7–PW.8 · CySA+ 4.2/4.3"
    },
    {
      "control": "Change control with expedited e-CAB + 24h ratification SLA and rollback plans",
      "ids": "SSDF PO/PW change mgmt · CySA+ 4.1"
    },
    {
      "control": "Signed artifacts + per-release SBOM, diffed between versions",
      "ids": "SSDF PS.1–PS.3 · CySA+ 4.1"
    },
    {
      "control": "RASP + monitoring + rehearsed rollback in production; dependency patching SLA",
      "ids": "SSDF RV.1–RV.2 · CySA+ 4.1"
    }
  ],
  "DEBRIEF_BLUE": [
    "Security is a property of the PROCESS, not a phase you can bolt on at the end — every phase you audited owned at least one control.",
    "The RTM is your audit anchor: requirement → control → verification. If a control has no verification, it is a wish, not a control.",
    "Emergencies compress change control into e-CAB + 24h ratification — skipping it creates the very outages it pretends to prevent.",
    "Static gates (SAST/SCA) run on the artifact before anything deploys; dynamic gates (DAST/IAST) need a running environment — staging, never production-first.",
    "Transitive dependencies are attackers’ favorite real estate: SBOM-diff every release and gate builds on SCA findings."
  ],
  "DEBRIEF_RED": [
    "Attackers do not need a 0-day if your pipeline ships one for them — supply-chain injection (T1195) beats exploits for effort-to-impact.",
    "A committed credential is a permanent gift: git history remembers every secret ever pushed (T1552). Rotation is the only undo.",
    "The \"trivial change\" bypass is the social-engineering vector of change management — hide a second change inside an approved-looking one.",
    "Skipping staging does not save a day; it moves DAST onto live users and removes your rehearsal space for rollback.",
    "Every gap you found here — no threat model, no RTM, prod-only testing — is a named TTP-enabler on the ATT&CK side of the story."
  ],
  "DEBRIEF_LINKS": [
    {
      "label": "CompTIA CySA+ CS0-003 exam objectives",
      "href": "https://www.comptia.org/certifications/cysa",
      "note": "official Domain 4 objectives"
    },
    {
      "label": "NIST SP 800-218 — Secure Software Development Framework (SSDF)",
      "href": "https://csrc.nist.gov/pubs/sp/800/218/final",
      "note": "the PO/PW/PS/RV practice IDs used above"
    },
    {
      "label": "OWASP Top 10",
      "href": "https://owasp.org/Top10/",
      "note": "the vulnerability classes your fixes target"
    },
    {
      "label": "MITRE CWE-89 — SQL Injection",
      "href": "https://cwe.mitre.org/data/definitions/89.html",
      "note": "parameterization is the countermeasure"
    },
    {
      "label": "MITRE ATT&CK T1195 — Supply Chain Compromise",
      "href": "https://attack.mitre.org/techniques/T1195/",
      "note": "why SCA, signing and SBOMs exist"
    }
  ],
  "NEXT_STEPS": [
    "Lesson 14.2 — secure coding deep dive: run the CWE Top 25 against VitalsPortal snippets.",
    "Lesson 14.3 — automated security testing integration: write and tune a SAST rule, then wire gates into a real pipeline config.",
    "OWASP SAMM: score Northwind’s SDLC maturity per business function.",
    "NIST SSDF v1.1: map the six mitigations above to every PO/PW/PS/RV practice."
  ]
};
