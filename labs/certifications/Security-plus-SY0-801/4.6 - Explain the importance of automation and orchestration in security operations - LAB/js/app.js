/* =====================================================================
 * app.js — bootstrap, event delegation, keyboard handling
 * Classic script (no modules) so it also works via file://.
 * ===================================================================== */

(function () {
  const D = window.LAB_DATA;
  const S = window.LAB_STORE;
  const UI = window.LAB_UI;

  /* Re-render the whole app on every state change (slider uses a silent path). */
  S.subscribe(() => UI.render());

  /* ---------- helper: find action target ---------- */
  function actionEl(target) {
    return target.closest ? target.closest("[data-action]") : null;
  }

  /* ---------- click delegation ---------- */
  document.addEventListener("click", function (e) {
    const el = actionEl(e.target);
    if (!el) {
      // click on an overlay backdrop closes it (click-outside)
      if (e.target && e.target.classList && e.target.classList.contains("overlay")) {
        const which = e.target.getAttribute("data-overlay");
        if (which === "completion") S.setState({ completionSeen: true });
        else if (which === "glossary") S.setState({ glossaryOpen: false });
        else if (which === "reset") S.setState({ resetDialogOpen: false });
      }
      return;
    }
    const a = el.getAttribute("data-action");
    const st = S.getState();
    switch (a) {
      case "set-mode": S.setMode(el.getAttribute("data-mode")); break;
      case "toggle-briefing": S.setState({ briefingOpen: !st.briefingOpen }); break;
      case "toggle-knowledge": S.setState({ knowledgeOpen: !st.knowledgeOpen }); break;

      /* M1 matching */
      case "select-term": S.setState({ selectedTerm: st.selectedTerm === el.getAttribute("data-term") ? null : el.getAttribute("data-term") }); break;
      case "assign-def": {
        const def = el.getAttribute("data-def");
        if (!st.selectedTerm) return;
        S.setEnv(env => {
          const matches = Object.assign({}, env.matches);
          Object.keys(matches).forEach(k => { if (matches[k] === def) delete matches[k]; });
          matches[st.selectedTerm] = def;
          return Object.assign({}, env, { matches });
        });
        S.setState({ selectedTerm: null });
        break;
      }

      /* categorize / classify */
      case "set-cat": S.setEnv(env => Object.assign({}, env, { categories: Object.assign({}, env.categories, { [el.getAttribute("data-item")]: el.getAttribute("data-cat") }) })); break;
      case "set-uc": S.setEnv(env => Object.assign({}, env, { useCases: Object.assign({}, env.useCases, { [el.getAttribute("data-uc")]: el.getAttribute("data-val") }) })); break;
      case "set-method": S.setEnv(env => Object.assign({}, env, { detectionMethods: Object.assign({}, env.detectionMethods, { [el.getAttribute("data-d")]: el.getAttribute("data-val") }) })); break;
      case "set-disp": S.setEnv(env => Object.assign({}, env, { triage: Object.assign({}, env.triage, { [el.getAttribute("data-alert")]: el.getAttribute("data-disp") }) })); break;

      /* integrations */
      case "toggle-int": {
        const id = el.getAttribute("data-int");
        S.setEnv(env => Object.assign({}, env, { integrations: Object.assign({}, env.integrations, { [id]: !env.integrations[id] }) }));
        break;
      }
      case "flag-int": {
        const id = el.getAttribute("data-int");
        S.setEnv(env => Object.assign({}, env, { brokenIntegration: env.brokenIntegration === id ? null : id }));
        break;
      }

      /* AI */
      case "toggle-ai": {
        const k = el.getAttribute("data-key");
        S.setEnv(env => Object.assign({}, env, { ai: Object.assign({}, env.ai, { [k]: !env.ai[k] }) }));
        break;
      }

      /* playbook */
      case "pb-add": S.setEnv(env => Object.assign({}, env, { playbook: { nodes: [...env.playbook.nodes, el.getAttribute("data-node")] } })); break;
      case "pb-remove": {
        const idx = +el.getAttribute("data-idx");
        S.setEnv(env => Object.assign({}, env, { playbook: { nodes: env.playbook.nodes.filter((_, i) => i !== idx) } }));
        break;
      }
      case "pb-move": {
        const idx = +el.getAttribute("data-idx"), dir = +el.getAttribute("data-dir");
        S.setEnv(env => {
          const arr = [...env.playbook.nodes]; const ni = idx + dir;
          if (ni < 0 || ni >= arr.length) return env;
          const tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
          return Object.assign({}, env, { playbook: { nodes: arr } });
        });
        break;
      }
      case "pb-clear": S.setEnv(env => Object.assign({}, env, { playbook: { nodes: [] } })); break;
      case "pb-filter": S.setEnv(env => Object.assign({}, env, { _pbFilter: el.getAttribute("data-filter") })); break;

      /* tabs */
      case "set-tab": S.setState({ activeTab: el.getAttribute("data-tab") }); break;
      case "jump": {
        const tab = el.getAttribute("data-tab");
        if (tab === "knowledge") document.getElementById("knowledge-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
        else {
          S.setState({ activeTab: tab });
          requestAnimationFrame(() => document.getElementById("console-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }
        break;
      }

      /* objectives */
      case "check": S.runObjectiveCheck(el.getAttribute("data-obj")); break;
      case "hint": S.revealHint(el.getAttribute("data-obj")); break;

      /* quiz (R2 per-question lock/next) */
      case "quiz-answer": S.setQuizAnswer(el.getAttribute("data-q"), el.getAttribute("data-o")); break;
      case "quiz-check": S.lockQuestion(el.getAttribute("data-q")); break;
      case "quiz-next": {
        const qs = D.QUIZ.filter(q => q.mode === st.mode);
        if (st.quizStep >= qs.length - 1) S.setQuizFinished(true);
        else S.setQuizStep(st.quizStep + 1);
        break;
      }
      case "quiz-restart": S.resetQuiz(); break;

      /* metrics */
      case "ack-metrics": S.setEnv(env => Object.assign({}, env, { metricsRead: true })); break;

      /* post-mortem */
      case "set-rc": S.setEnv(env => Object.assign({}, env, { postmortem: Object.assign({}, env.postmortem, { rootCause: el.getAttribute("data-rc") }) })); break;
      case "toggle-risk": {
        const id = el.getAttribute("data-risk");
        S.setEnv(env => {
          const has = env.postmortem.residualRisks.includes(id);
          return Object.assign({}, env, { postmortem: Object.assign({}, env.postmortem, { residualRisks: has ? env.postmortem.residualRisks.filter(x => x !== id) : [...env.postmortem.residualRisks, id] }) });
        });
        break;
      }
      case "toggle-fix": {
        const id = el.getAttribute("data-fix");
        S.setEnv(env => {
          const has = env.postmortem.fixes.includes(id);
          return Object.assign({}, env, { postmortem: Object.assign({}, env.postmortem, { fixes: has ? env.postmortem.fixes.filter(x => x !== id) : [...env.postmortem.fixes, id] }) });
        });
        break;
      }

      /* roadmap */
      case "road-move": {
        const idx = +el.getAttribute("data-idx"), dir = +el.getAttribute("data-dir");
        S.setEnv(env => {
          let roadmap = env.roadmap;
          if (Object.keys(roadmap).length === 0) { roadmap = {}; D.ROADMAP_PROCESSES.forEach((p, i) => roadmap[p.id] = i + 1); }
          const ordered = D.ROADMAP_PROCESSES.map(p => ({ p, rank: roadmap[p.id] })).sort((a, b) => a.rank - b.rank);
          const ni = idx + dir; if (ni < 0 || ni >= ordered.length) return env;
          const a = ordered[idx].p.id, b = ordered[ni].p.id;
          const ra = roadmap[a], rb = roadmap[b];
          roadmap = Object.assign({}, roadmap, { [a]: rb, [b]: ra });
          return Object.assign({}, env, { roadmap });
        });
        break;
      }

      /* overlays */
      case "open-glossary": S.setState({ glossaryOpen: true }); break;
      case "close-glossary": S.setState({ glossaryOpen: false }); break;
      case "open-reset": S.setState({ resetDialogOpen: true }); break;
      case "close-reset": S.setState({ resetDialogOpen: false }); break;
      case "reset-all": S.resetAll(); break;
      case "close-completion": S.setState({ completionSeen: true }); break;
      case "reopen-report": S.setState({ completionSeen: false }); break;
    }
  });

  /* ---------- input/change delegation (slider + glossary search) ---------- */
  document.addEventListener("input", function (e) {
    const t = e.target;
    if (t.matches && t.matches('input[type=range][data-action="set-threshold"]')) {
      const v = +t.value;
      // Silent update (no full re-render) to keep drag smooth; refresh readout directly.
      S.setThreshold(v);
      UI.updateDetectionReadout();
      return;
    }
    if (t.id === "gloss-search") {
      const q = t.value.trim().toLowerCase();
      const list = document.getElementById("gloss-list");
      if (!list) return;
      [...list.querySelectorAll(".gloss-item")].forEach(item => {
        const txt = item.textContent.toLowerCase();
        item.style.display = q === "" || txt.includes(q) ? "" : "none";
      });
    }
  });

  /* ---------- keyboard: ESC closes topmost overlay; restore focus ---------- */
  let lastFocusedBeforeOverlay = null;
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const st = S.getState();
      if (st.resetDialogOpen) { S.setState({ resetDialogOpen: false }); return; }
      if (st.glossaryOpen) { S.setState({ glossaryOpen: false }); return; }
      if (st.completionSeen === false && (S.getState().mode && D.objectivesFor(st.mode).every(o => st.objectiveStates[o.id]?.completed) && st.quizFinished)) { S.setState({ completionSeen: true }); return; }
    }
  });

  /* initial render */
  UI.render();
})();
