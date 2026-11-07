/**
 * HarborOps Lab — CHECK RESULTS engine (static port, F2).
 * 1:1 transcription of the original src/lib/lab/validation.ts — pure validators
 * over store state; every check returns educational feedback.
 */
(function (global) {
  "use strict";

  var D = global.HarborData;

  function ok(title, body) { return { pass: true, title: title, body: body }; }
  function no(title, body) { return { pass: false, title: title, body: body }; }

  function eqSorted(a, b) {
    return a.length === b.length && a.slice().sort().join("|") === b.slice().sort().join("|");
  }

  function validateObjective(id, s) {
    var env = s.env;
    switch (id) {
      /* ---------------- MEDIUM ---------------- */
      case "M1": {
        var pass1 = eqSorted(env.berthPicked, D.M1_ANSWER);
        return pass1
          ? ok("Correct — no hypervisor, no guest OS.",
            "A VM must virtualize hardware (hypervisor) and boot a full guest OS per workload. Containers run directly on the host OS via its kernel, which is why they start in milliseconds and pack densely. What a defender does next: when sizing cloud workloads, ask 'does this need its own OS?' — if not, containerize.")
          : no("Not quite — look again at the VM stack.",
            "You need exactly the two layers that exist for every VM but are absent from the container stack. Hint of the mechanics: containers replace 'hardware slicing + private OS' with 'shared kernel + isolated views'.");
      }
      case "M2": {
        var pass2 = env.kernelAnswer === D.M2_ANSWER;
        return pass2
          ? ok("Correct — the host OS kernel.",
            "Every container on a host shares one kernel; isolation comes from kernel namespaces (private views) and cgroups (resource caps) — simplified here. Attack value: that shared kernel is also why container escape (MITRE T1611, Privilege Escalation) is the technique defenders keep mitigating with sandboxing (M1048).")
          : no("Not the shared piece.",
            "Containers do NOT boot their own OS and have no hypervisor of their own. Ask: what single component of the host must exist before any container can run?");
      }
      case "M3": {
        var pass3 = env.pulled.includes("portal-140") && env.pulled.includes("orders-db") && env.m3Answer === D.M3_ANSWER;
        return pass3
          ? ok("Correct — 3 new layers, 1 reused.",
            "Layer reuse is the registry's superpower: images sharing a base (here alpine 3.19, layer fa3c1b) download only what differs. That is why container fleets stay small and pulls stay fast. Defender note: pull logs full of 'ALREADY EXISTS' are healthy — a registry that never dedupes deserves a second look.")
          : no("Check the pull log again.",
            "Both images must be pulled, then count only the layers the second pull actually downloaded — the log literally prints ALREADY EXISTS for the shared one.");
      }
      case "M4": {
        // imageBuilt is set only on a PASSING build (see BuildBay.runCheck) so failed
        // attempts no longer print the canonical success log (QA-1).
        var pass4 = env.dockerfile.join("|") === D.M4_ANSWER.join("|");
        return pass4
          ? ok("Image built — pinned, ordered, minimal.",
            "FROM leads and pins an exact version so upstream cannot change under you; COPY before dependency install lets the cache work; EXPOSE documents the port; CMD declares the default process. This Dockerfile is the artifact your whole pipeline will trust — reproducibility starts here (CI-3).")
          : no("Build not accepted yet.",
            "The expected chain is: pinned FROM → WORKDIR → COPY → RUN deps → EXPOSE → CMD. 'node:latest' is the trap: latest is a mutable pointer, not a version.");
      }
      case "M5": {
        var pass5 = eqSorted(env.incidentPicks, D.M5_ANSWER);
        return pass5
          ? ok("Root cause pinned: a dependency lived on the laptop, not in the image.",
            "Dev machines accumulate hand-installed modules; a clean build host reproduces only what the image declares. That is the 'works on my machine' class of failure (CI-10). Defender move: the image is the contract — declare and pin every dependency in the build, never on the host. (The DNS blip, firewall ticket and timezone note were red herrings — classic noise you must triage past.)")
          : no("Two snippets expose the cause — the rest is noise.",
            "One snippet must show what the dev machine HAS, the other must prove the build machine never had it. Notice how the red-herring evidence is plausible but unrelated to module resolution.");
      }
      case "M6": {
        var allSet6 = D.WORKLOADS.every(function (w) { return env.placement[w.id]; });
        var pass6 = allSet6 && D.WORKLOADS.every(function (w) { return env.placement[w.id] === w.answer; });
        return pass6
          ? ok("All six workloads routed correctly.",
            "Decision logic: stateless, spiky, cloud-native-first → containers (orchestrated). Legacy OS/driver/GPU constraints → VM. 400 ms event-driven bursts → serverless/FaaS. Buy-not-build → SaaS. Stateful DB under the cloud-native mandate → containers plus a persistent volume. This is the CV0-004 compare-and-contrast skill in one board (CI-5/CI-8).")
          : no("Some cargo is on the wrong vessel.",
            "Re-read each intake card for three signals: OS control needs (VM), event-driven short bursts (serverless), buy vs build (SaaS), portable scalable service (containers). W5 is stateful — containers are right under the mandate, but note the volume requirement you handled on the Crane Deck.");
      }
      case "M7": {
        var pass7 = env.deployed && env.replicas === D.M7_REPLICAS;
        return pass7
          ? ok("Scaled to 5 replicas.",
            "Horizontal scaling adds copies of the same image instead of growing one box. The orchestrator spreads replicas across nodes so no single failure is fatal. Watch the feed: every change is an auditable event — live operational evidence (CI-6).")
          : no("Deployment state not there yet.",
            "Deploy first, then move the slider. The feed must read 'Scaled cargo-portal to 5 replicas'.");
      }
      case "M8": {
        var pass8 = env.killCount > 0 && env.healedSeen;
        return pass8
          ? ok("Failure injected — orchestrator healed it.",
            "Self-healing is reconciliation: the controller compares desired state (N replicas) with actual state and replaces what died. This is why cloud-native teams sleep at night. Defender note: an EXITED event with no Rescheduled follow-up is your alert signature.")
          : no("The deck did not observe a heal.",
            "Press 'Inject failure' once and watch the feed for EXITED → Rescheduled. If nothing reschedules, the orchestrator would not be doing its one job.");
      }
      case "M9": {
        var pass9 = env.pvBound && env.restartDone && env.ordersDataIntact === true;
        return pass9
          ? ok("Data survived the restart — persistent volume bound first.",
            "Container filesystems are ephemeral: replace the container, lose the data — unless a persistent volume is bound. Stateful ≠ impossible in containers; it just demands volumes (CI-7). Try restarting WITHOUT the volume once to feel the difference — that is the exam trap.")
          : no("Orders DB would not survive this yet.",
            "Sequence matters: bind the persistent volume, then restart, then read the data check line. If you restarted before binding, you saw the loss the hard way — reset the restart by binding now.");
      }
      case "M10": {
        var pass10 = D.AMENDMENTS.every(function (a) { return env.fixes[a.id]; });
        return pass10
          ? ok("All six amendments applied — manifest hardened.",
            "Each switch removes a named risk: pinned tags (reproducibility), limits (noisy neighbor), healthcheck (wedged containers detected), replicas (no single point), non-root (blast radius), persistent volume (state survives). This is the hands-on half of CV0-004's container hygiene story (CI-10).")
          : no("The panel is not at 6/6 yet.",
            "Every amendment names the risk it prevents — read them as you flip. Six are required; the Orders DB volume is one of them.");
      }
      case "M11": {
        var pass11 = D.M11_STATEMENTS.every(function (sid) { return env.srMap[sid] === (D.SR_STATEMENTS.find(function (x) { return x.id === sid; }) || {}).answer; });
        return pass11
          ? ok("Responsibility stamps correct.",
            "Managed container service: the provider runs datacenter, hardware, control plane; you own images, libraries, scanning and access policy (CI-9). Mis-stamping this split is how unpatched app images slip through while everyone assumes 'the provider patches'.")
          : no("Some stamps landed on the wrong desk.",
            "Rule of thumb: infrastructure & platform uptime = provider; anything inside your images or your access decisions = customer.");
      }
      case "M12": {
        var pass12 = env.updatedTag === D.M12_TAG && env.availability === 100 && env.replicas >= D.M12_REPLICAS_MIN;
        return pass12
          ? ok("1.5.0 shipped with zero downtime.",
            "Rolling updates replace replicas gradually; with ≥2 replicas new pods serve before old ones stop, so capacity never drops. With 1 replica you saw the meter dip — that dip is the incident ticket you just avoided (CI-6).")
          : no("The release window was not clean.",
            "Requirements: replicas ≥ 2 BEFORE the rolling update, then update to 1.5.0, then the availability meter must still read 100%. If it dipped, you shipped with a single replica.");
      }
      /* ---------------- HARD ---------------- */
      case "H1": {
        var passH1 = D.H1_CHIPS.every(function (c) { return env.h1Class[c.id] === c.cls; });
        return passH1
          ? ok("Perfect dissection.",
            "VM-only: hypervisor, guest OS. Container-only: engine, namespaces+cgroups. Shared: app code/libs, physical hardware. This is the entire architecture argument for containerization in one classification — density without the guest-OS tax, isolation from kernel primitives rather than virtualization (CI-1/CI-2).")
          : no("Classification rejected — some chips are in the wrong crate.",
            "Careful: the host OS belongs to BOTH stories (VMs virtualize above it, containers run on its kernel) — but the chips here split cleanly: think 'what does the hypervisor add?' vs 'what does the kernel give containers for free?'");
      }
      case "H2": {
        var traps = env.dockerfile.includes("from-latest") || env.dockerfile.includes("env-dev");
        var extras = env.dockerfile.length !== D.H2_ANSWER.length;
        var passH2 = env.dockerfile.join("|") === D.H2_ANSWER.join("|");
        return passH2
          ? ok("Exact minimal spec — pinned, non-root, no traps.",
            "USER after dependencies means the app never runs as root; the pinned FROM keeps builds reproducible; ENV NODE_ENV=development and FROM node:latest were the traps — one ships dev config, the other invites silent upstream change. Minimal + explicit is the production-grade artifact (CI-3).")
          : no("Spec mismatch.",
            traps
              ? "A trap chip is in the stack: latest is mutable, ENV NODE_ENV=development ships dev mode to prod."
              : extras
                ? "The spec is minimal — 7 instructions exactly, in the canonical order (FROM → WORKDIR → COPY → RUN → USER → EXPOSE → CMD)."
                : "Follow the canonical order; check the nudge for where USER belongs.");
      }
      case "H3": {
        var passH3 = env.h3Module.trim().toLowerCase() === D.H3_MODULE_ANSWER && env.h3Fix === D.H3_FIX_ANSWER;
        return passH3
          ? ok("Forensics accepted: sharpix-codec, baked into the build.",
            "Exact module name from two independent evidence lines + the durable fix: declare and pin the dependency in the image so every environment gets it. Manual host installs and retry-until-green are how flaky pipelines are born (CI-10/CI-3).")
          : no("Near-miss — the grader wants precision.",
            "The module name must match the logs exactly (it appears in both the dev sheet and the staging error). The fix must remove the class of failure, not the instance: only one option bakes the dependency into the artifact itself.");
      }
      case "H4": {
        var placeOk = D.WORKLOADS.every(function (w) { return env.placement[w.id] === w.answer; });
        var justOk = D.WORKLOADS.filter(function (w) { return w.justify; }).every(function (w) { return env.justify[w.id] === w.justify.answer; });
        var passH4 = placeOk && justOk;
        return passH4
          ? ok("Routing AND reasoning accepted.",
            "Justifications are what the exam grades in scenario questions: full OS control + legacy drivers → VM; per-invocation short bursts → serverless. Placement without justification is guessing; justification without placement is theory (CI-5/CI-8).")
          : no("Routing or reasoning incomplete.",
            "All six workloads plus the two justification chips (W2 and W6) must be correct. Wrong justifications are written to sound plausible — anchor on OS control and GPU pass-through.");
      }
      case "H5": {
        var passH5 = env.h5Storage === "nopv" && env.h5Latency === "nolimits";
        return passH5
          ? ok("Both symptoms diagnosed.",
            "Orders DB: no persistent volume → every replacement drops local data (stateful needs volumes). Portal latency: no resource limits → one container starves node-01's neighbors (noisy neighbor). Two different subsystems, same root discipline: declare what the workload needs (CI-6/CI-7/CI-10).")
          : no("Diagnosis incomplete or mismatched.",
            "Pick one cause per symptom from the diagnosis chips. One symptom is about storage lifecycle, the other about CPU/memory caps. Exact pairing is graded.");
      }
      case "H6": {
        var passH6 = eqSorted(env.h6Picks.map(String), D.H6_ANSWER.map(String));
        return passH6
          ? ok("Audit clean: exactly the five real misconfigurations.",
            "Unpinned tag, single replica, unset limits, root user, no healthcheck. You correctly left labels and the port declaration alone — flagging harmless lines is how audit fatigue starts. Each of the five maps to a concrete failure mode you produced on this deck today (CI-10).")
          : no("Rejected — the set is not exactly the five.",
            "Count: exactly 5 lines. Two lines are perfectly normal (labels metadata, ports declaration) — selecting them rejects the whole set. Ask of each line: 'what incident does this cause?' If you cannot name one, it is not a finding.");
      }
      case "H7": {
        var allOn = D.AMENDMENTS.every(function (a) { return env.fixes[a.id]; });
        var ord = env.fixOrder;
        var seqOk = ord.indexOf(D.H7_ORDER_RULE.before) !== -1 &&
          ord.indexOf(D.H7_ORDER_RULE.after) !== -1 &&
          ord.indexOf(D.H7_ORDER_RULE.before) < ord.indexOf(D.H7_ORDER_RULE.after);
        var passH7 = allOn && seqOk;
        return passH7
          ? ok("Remediation sequenced like an operator.",
            "All six applied AND the persistent volume preceded the replica increase — storage must exist before stateful replicas consume it. Sequencing is the difference between a change window and an outage (CI-10/CI-7).")
          : no("Sequence or completeness failed.",
            allOn
              ? "All six are on, but the ORDER is graded: bind-pv must appear in your action history BEFORE raise-replicas. Flip raise-replicas off, bind the volume if needed, then re-raise."
              : "Not all six amendments are applied. Apply all, and make sure the volume binding happens before replicas scale up.");
      }
      case "H8": {
        var passH8 = D.SR_STATEMENTS.every(function (st) { return env.srMap[st.id] === st.answer; }) &&
          env.residualPick === D.RESIDUAL_RISK_ANSWER;
        return passH8
          ? ok("Full responsibility map + correct residual risk.",
            "Six duties stamped, and the honest residual named: kernel sharing means escape (T1611) is never zero — isolation and sandboxing (M1048) shrink it. Naming residual risk is the mark of an operator, not a checkbox (CI-9/CI-12).")
          : no("Map or residual risk incorrect.",
            "All six statements plus the residual-risk pick are graded. The correct residual is about what no amount of hygiene removes: the shared kernel. Registry outages and YAML typos are operational, not the platform's inherent risk.");
      }
      case "H9": {
        var passH9 = env.updatedTag === D.M12_TAG && env.availability === 100 && env.replicas === D.M7_REPLICAS;
        return passH9
          ? ok("Zero-dip release, 5 replicas on 1.5.0.",
            "Scale first, ship second — the meter never blinked. End-state validation (5 replicas on the new tag) mirrors how change tickets are actually closed (CI-6).")
          : no("End-state does not match the change ticket.",
            "Graded on the end state: availability 100% (needs ≥2 replicas during the update) AND final replica count exactly 5 AND tag 1.5.0. Scale before shipping.");
      }
      case "H10": {
        var passH10 = env.h10Tag === D.H10_TAG_ANSWER && env.h10Reason === D.H10_REASON_ANSWER;
        return passH10
          ? ok("Production tag chosen with the right argument.",
            "cargo-portal:1.4.0 — pinned and immutable; 'latest' aliased a beta in this very yard. The justification matters as much as the pick: immutability is what makes rollbacks and audits possible (CI-4).")
          : no("Near-miss rejected.",
            "Exactly one tag is fit for production, and only one reason survives scrutiny. 'Newest' and 'convention' are how beta code reaches prod on a Friday.");
      }
      default:
        return no("Unknown objective.", "No validator registered for this id.");
    }
  }

  global.HarborValidation = { validateObjective: validateObjective };
})(window);
