/* =========================================================================
 * Continuity Bay — Bootstrap & Event Wiring
 * Initializes the store, renders the app, and wires all interactions.
 * Loaded last after data.js, state.js, objectives.js, ui.js, app.js.
 * ========================================================================= */

(function () {
  'use strict';

  const D = window.LAB_DATA;
  const Store = window.LAB_STORE;
  const App = window.LAB_APP;
  const V = window.LAB_VALIDATE;

  /* --- Modal state --- */
  let modalMode = null; // 'completion' | 'reset' | null

  /* --- Initialize --- */
  function init() {
    Store.init();
    Store.subscribe(onStateChange);
    render();
    wireEvents();
  }

  /* --- State change handler --- */
  function onStateChange() {
    render();
    // Restore modal if needed
    if (modalMode === 'completion') {
      showModal('completion');
    } else if (modalMode === 'reset') {
      showModal('reset');
    }
  }

  /* --- Render --- */
  function render() {
    App.render();
    // Inject modal if active
    if (modalMode === 'completion') {
      injectModal(App.renderCompletionModal(Store.get()));
    } else if (modalMode === 'reset') {
      injectModal(App.renderResetDialog());
    } else {
      removeModal();
    }
  }

  function injectModal(html) {
    let container = document.getElementById('modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }
    container.innerHTML = html;
  }

  function removeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }

  function showModal(mode) {
    modalMode = mode;
    render();
  }

  function closeModal() {
    modalMode = null;
    removeModal();
  }

  /* --- Event delegation --- */
  function wireEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('keydown', handleKeydown);
  }

  function handleClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');

    switch (action) {
      case 'pick-mode':
        Store.set(s => ({ ...s, mode: target.getAttribute('data-mode'), startedAt: Date.now() }));
        App.activeStation = 'briefing';
        break;

      case 'switch-station':
        App.activeStation = target.getAttribute('data-station');
        render();
        break;

      case 'jump-station':
        App.activeStation = target.getAttribute('data-station');
        render();
        break;

      case 'check-obj':
        checkObjective(target.getAttribute('data-obj'));
        break;

      case 'reveal-hint':
        revealHint(target.getAttribute('data-obj'));
        break;

      case 'pick-item': {
        const key = target.getAttribute('data-key');
        const itemId = target.getAttribute('data-item-id');
        pickItem(key, itemId);
        break;
      }

      case 'clear-order': {
        const key = target.getAttribute('data-key');
        clearOrder(key);
        break;
      }

      case 'toggle': {
        const envKey = target.getAttribute('data-env-key');
        toggleEnv(envKey);
        break;
      }

      case 'toggle-spof': {
        const spofId = target.getAttribute('data-spof-id');
        toggleSpof(spofId);
        break;
      }

      case 'toggle-artifact': {
        const artifactId = target.getAttribute('data-artifact-id');
        toggleArtifact(artifactId);
        break;
      }

      case 'run-sim':
        runSimulation();
        break;

      case 'quiz-submit': {
        const qid = target.getAttribute('data-quiz-id');
        submitQuiz(qid);
        break;
      }

      case 'reset':
        showModal('reset');
        break;

      case 'confirm-reset':
        closeModal();
        Store.reset();
        App.activeStation = 'briefing';
        break;

      case 'cancel-reset':
        closeModal();
        break;

      case 'close-modal':
        closeModal();
        break;

      case 'show-completion':
        showModal('completion');
        break;
    }
  }

  function handleChange(e) {
    const target = e.target;
    const action = target.getAttribute('data-action');
    if (!action) return;

    switch (action) {
      case 'select-change': {
        const stateKey = target.getAttribute('data-state-key');
        const fieldKey = target.getAttribute('data-field-key');
        const value = target.value;
        setEnvNested(stateKey, fieldKey, value);
        break;
      }

      case 'radio-change': {
        const stateKey = target.getAttribute('data-state-key');
        const fieldKey = target.getAttribute('data-field-key');
        const value = target.value;
        handleRadioChange(stateKey, fieldKey, value);
        break;
      }

      case 'quiz-select': {
        const qid = target.getAttribute('data-quiz-id');
        const option = target.getAttribute('data-option');
        answerQuiz(qid, option);
        break;
      }
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && modalMode) {
      closeModal();
    }
  }

  /* --- Action handlers --- */
  function checkObjective(objId) {
    const state = Store.get();
    const status = V.validateObjective(objId, state.env, state.mode);
    Store.set(s => {
      const prev = s.objectives[objId] || { status: 'idle', attempts: 0, hintsUsed: 0 };
      return {
        ...s,
        objectives: {
          ...s.objectives,
          [objId]: { status, attempts: prev.attempts + 1, hintsUsed: prev.hintsUsed },
        },
      };
    });
  }

  function revealHint(objId) {
    Store.set(s => {
      const prev = s.objectives[objId] || { status: 'idle', attempts: 0, hintsUsed: 0 };
      const cur = s.hintsRevealed[objId] || 0;
      if (cur >= 3) return s;
      return {
        ...s,
        hintsRevealed: { ...s.hintsRevealed, [objId]: cur + 1 },
        objectives: {
          ...s.objectives,
          [objId]: { ...prev, hintsUsed: cur + 1 },
        },
      };
    });
  }

  function pickItem(stateKey, itemId) {
    Store.set(s => {
      const current = s.env[stateKey] || [];
      if (current.length >= 4 && stateKey === 'hardBackupRestoreSeq') {
        return s; // max 4 for sequences
      }
      if (current.includes(itemId)) return s;
      return { ...s, env: { ...s.env, [stateKey]: [...current, itemId] } };
    });
  }

  function clearOrder(stateKey) {
    Store.updateEnv({ [stateKey]: [] });
  }

  function toggleEnv(envKey) {
    Store.set(s => ({ ...s, env: { ...s.env, [envKey]: !s.env[envKey] } }));
  }

  function toggleSpof(spofId) {
    Store.set(s => {
      const current = s.env.metricMatches[spofId] === 'yes';
      return {
        ...s,
        env: {
          ...s.env,
          metricMatches: { ...s.env.metricMatches, [spofId]: current ? '' : 'yes' },
        },
      };
    });
  }

  function toggleArtifact(artifactId) {
    Store.set(s => {
      const current = s.env.continuityPicks[artifactId] === 'BCP';
      return {
        ...s,
        env: {
          ...s.env,
          continuityPicks: { ...s.env.continuityPicks, [artifactId]: current ? '' : 'BCP' },
        },
      };
    });
  }

  function runSimulation() {
    const state = Store.get();
    const result = V.runSimulation(state.env);
    Store.updateEnv(result);
  }

  function answerQuiz(qid, optionKey) {
    Store.set(s => {
      // R2: once submitted, the answer is locked
      if (s.quizSubmitted[qid]) return s;
      return { ...s, quizAnswered: { ...s.quizAnswered, [qid]: optionKey } };
    });
  }

  function submitQuiz(qid) {
    Store.set(s => {
      if (s.quizSubmitted[qid]) return s;
      if (!s.quizAnswered[qid]) return s;
      return { ...s, quizSubmitted: { ...s.quizSubmitted, [qid]: true } };
    });
  }

  function setEnvNested(stateKey, fieldKey, value) {
    // Handle "env.backupFullFreq" or "metricMatches.M4_missing" or "domainMatches.backups" etc.
    if (stateKey.startsWith('env.')) {
      const envKey = stateKey.substring(4);
      Store.updateEnv({ [envKey]: value });
    } else {
      // It's a nested pick like metricMatches, recoverySitePicks, etc.
      Store.set(s => ({
        ...s,
        env: {
          ...s.env,
          [stateKey]: { ...s.env[stateKey], [fieldKey]: value },
        },
      }));
    }
  }

  function handleRadioChange(stateKey, fieldKey, value) {
    // For M4_missing and M9_missing: stored in metricMatches
    if (stateKey === 'metricMatches') {
      Store.set(s => ({
        ...s,
        env: {
          ...s.env,
          metricMatches: { ...s.env.metricMatches, [fieldKey]: value },
        },
      }));
    } else {
      // For recoverySitePicks, hardArtifactPicks, hardCapacityPicks, etc.
      Store.set(s => ({
        ...s,
        env: {
          ...s.env,
          [stateKey]: { ...s.env[stateKey], [fieldKey]: value },
        },
      }));
    }
  }

  /* --- Boot --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
