// ═══════════════════════════════════════════════════════════════════════════
// The Central Exchange — bootstrap + event wiring (static port)
// Replaces page.tsx + the ambient useEffect in TapeRoom.tsx:
//   • restores persisted state (same key / shape / semantics)
//   • builds every region once, then re-renders ONLY regions whose state
//     slices actually changed (dirty checks keep dropdowns/focus stable
//     across ambient teleprinter ticks — same net effect as React
//     reconciliation keeping DOM nodes alive)
//   • runs the ambient tape ticker (6.5 s, hidden-tab guard, same mix)
//   • auto-opens the sign-off report when the last objective is signed off
// ═══════════════════════════════════════════════════════════════════════════

let prevMode = null;
const lastRegionKeys = {};

// Objectives whose sign-off locks discrete answers (drill bench / tape room).
const DRILL_LOCK_OBJS = ["OBJ-M1", "OBJ-M2", "OBJ-H1", "OBJ-H6"];
const ROLL_LOCK_OBJS = ["OBJ-M4", "OBJ-M6", "OBJ-M8", "OBJ-M9", "OBJ-M10", "OBJ-H2", "OBJ-H5", "OBJ-H6", "OBJ-H7", "OBJ-H8"];
const lockFlags = (ids) => ids.map(objDone).join(",");

function regionKeys(s) {
  return {
    briefing: String(s.briefingSeen),
    runsheet: JSON.stringify([s.mode, s.obj, s.nudged]),
    crossbar: JSON.stringify([s.patched, s.cord, s.active, s.cfg]),
    workbench: JSON.stringify([s.cfg, s.mode, lockFlags(DRILL_LOCK_OBJS)]),
    taperoom: JSON.stringify([s.mode, s.active, s.found, s.cfg, s.alertM, s.alertH, s.alertClass, s.controls, s.keyOrder, lockFlags(ROLL_LOCK_OBJS)]),
    quiz: JSON.stringify([s.mode, s.quiz, s.quizDone]),
  };
}

function renderRegion(name, key, fn) {
  if (lastRegionKeys[name] === key) return;
  lastRegionKeys[name] = key;
  fn();
}

function renderAll() {
  const s = Lab.state;

  // chrome visibility: mode gate vs lab application
  if (!s.mode) {
    $id("mode-gate").hidden = false;
    $id("lab-app").hidden = true;
    prevMode = null;
    updateFab();
    return;
  }
  $id("mode-gate").hidden = true;
  $id("lab-app").hidden = false;

  // full mount-style rebuild when the mode changes (Bay/RunSheet/TapeRoom/Quiz
  // remount in React; wbSel resets to ch1, key steps re-shuffle, quiz re-binds)
  if (prevMode !== s.mode) {
    prevMode = s.mode;
    Object.keys(lastRegionKeys).forEach((k) => delete lastRegionKeys[k]);
    wbSel = "ch1";
    buildRunsheet();
    buildBay();       // includes workbench + sweep wiring
    buildTapeRoom();  // re-shuffles key-step order per mount (R6)
    buildQuiz();
  }

  updateMasthead();
  renderRegion("briefing", String(s.briefingSeen), renderBriefing);
  renderRegion("runsheet", regionKeys(s).runsheet, updateRunsheet);
  renderRegion("crossbar", regionKeys(s).crossbar, updateCrossbar);
  renderRegion("workbench", regionKeys(s).workbench, updateWorkbench);
  renderRegion("taperoom", regionKeys(s).taperoom, updateTapeRoom);
  updateGauges();
  updateTape();
  renderRegion("quiz", regionKeys(s).quiz, updateQuiz);
  updateFab();

  // completion modal auto-open: when the last objective is signed off and the
  // report has not been seen yet (derived state — no effect, same as original)
  const d = signOffData();
  if (d.allDone && !s.completedSeen && !Modal.openEl) openSignOff();
}

// ── ambient teleprinter (TapeRoom.tsx useEffect) ──
let ambientTimer = null;
let ambientKey = "";

function restartAmbientIfChanged() {
  const s = Lab.state;
  const key = `${s.mode}|${Object.keys(s.active).filter((k) => s.active[k]).join(",")}`;
  if (key === ambientKey) return;
  ambientKey = key;
  if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
  if (!s.mode) return;
  ambientTimer = setInterval(() => {
    if (document.hidden) return; // same hidden-tab guard as the original
    const st = Lab.state;
    const act = Object.keys(st.active).filter((k) => st.active[k]);
    if (act.length > 0 && Math.random() < 0.45) {
      const inc = act[Math.floor(Math.random() * act.length)];
      const evs = TAPE_FAULT[inc];
      if (evs) {
        const ev = evs[Math.floor(Math.random() * evs.length)];
        Actions.pushTape(fill(ev.text), ev.level);
        return;
      }
    }
    if (st.mode === "hard" && Math.random() < 0.35) {
      Actions.pushTape(fill(TAPE_NOISE[Math.floor(Math.random() * TAPE_NOISE.length)]), "warn");
      return;
    }
    Actions.pushTape(fill(TAPE_OK[Math.floor(Math.random() * TAPE_OK.length)]), "ok");
  }, 6500);
}

// ── boot ──
(function boot() {
  loadPersisted();      // zustand-compatible restore: { state: {...}, version: 0 }
  renderModeGate();
  buildMasthead();
  buildKnowledge();
  buildDebrief();
  buildFab();
  renderAll();          // renders the persisted state if a shift was in progress
  Lab.subscribe(() => {
    renderAll();
    restartAmbientIfChanged();
  });
  restartAmbientIfChanged();
})();
