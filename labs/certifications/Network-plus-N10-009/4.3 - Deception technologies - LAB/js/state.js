/* ── State engine ─────────────────────────────────────────────────────────────
 * Plain-JS recreation of the original useLab() hook (src/lib/lab/engine.ts):
 * same persistence key, same envelope, same defensive merge, same action
 * semantics, same reactive wave engine (computeWave ported from
 * src/lib/lab/environment.ts, including its unexported HP_SESSION_RAW constant).
 *
 * Pub/sub: actions mutate the single state object, persist it, then notify —
 * js/app.js re-renders the affected UI on notify.
 */
(function () {
  'use strict';

  const LAB = window.LAB;

  /* ── persistence (identical key + envelope to the original) ───────────────── */
  const STORAGE_KEY = 'borealis-tripwire-lab-v1';
  const SCHEMA = 1;

  function probeStorage() {
    if (typeof window === 'undefined') return false;
    try {
      const k = '__tripwire_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }
  const STORAGE_OK = probeStorage();

  function emptyDrills() {
    return {
      matchTech: {}, vocabAssign: {}, funcChoice: '', ciaChoice: '', hiChoice: '', loChoice: '',
      reconSelected: [], cmdA: '', cmdB: '', fenceWhy: '', irOrder: [], limitations: [],
      triage: {}, chainOrder: [], vectorInput: '', htEvent: '', htProof: '', fenceJustify: '',
      herrings: [], herringWhy: '', attackMap: {},
      rule: { source: '', condition: '', threshold: '', response: '' },
      residual: [], nextInvest: '', riskFill: {},
    };
  }

  function cloneTraps(t) {
    return JSON.parse(JSON.stringify(t));
  }

  function initialTraps(mode) {
    return cloneTraps(mode === 'hard' ? LAB.hardPrearmed : LAB.allOffTraps);
  }

  function initialSession(mode) {
    return {
      traps: initialTraps(mode),
      feed: mode === 'hard' ? JSON.parse(JSON.stringify(LAB.hardFeed)) : [],
      waveRun: mode === 'hard',
      blindSpots: [],
      drills: emptyDrills(),
      objProgress: {},
      objResults: {},
      quizAnswers: {},
      quizChecked: {},
      completedShown: false,
    };
  }

  function defaultState() {
    return {
      entered: false,
      activeMode: 'medium',
      sessions: { medium: initialSession('medium'), hard: initialSession('hard') },
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.schema !== SCHEMA || !parsed.state) return null;
      const base = defaultState();
      const s = parsed.state;
      const sm = (s.sessions && s.sessions.medium) || {};
      const sh = (s.sessions && s.sessions.hard) || {};
      // defensive merge so older saves never crash newer code (same as original)
      return {
        entered: !!s.entered,
        activeMode: s.activeMode === 'hard' ? 'hard' : 'medium',
        sessions: {
          medium: {
            ...base.sessions.medium, ...sm,
            traps: { ...base.sessions.medium.traps, ...(sm.traps || {}) },
            drills: { ...base.sessions.medium.drills, ...(sm.drills || {}) },
          },
          hard: {
            ...base.sessions.hard, ...sh,
            traps: { ...base.sessions.hard.traps, ...(sh.traps || {}) },
            drills: { ...base.sessions.hard.drills, ...(sh.drills || {}) },
          },
        },
      };
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema: SCHEMA, state }));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ── reactive wave engine (verbatim port of computeWave) ──────────────────── */
  const HP_SESSION_RAW = [
    'sshd[2411]: Accepted password for user "admin" from 198.51.100.44 port 51144',
    'admin@hp-01:~$ whoami',
    'admin',
    'admin@hp-01:~$ uname -a',
    'Linux hp-01 5.15.0-decoy #1 SMP x86_64 GNU/Linux',
    'admin@hp-01:~$ cat /etc/passwd',
    'root:x:0:0:root:/root:/bin/bash',
    'admin:x:1000:1000:Decoy Admin:/home/admin:/bin/sh',
    'admin@hp-01:~$ ls /var/www',
    'payroll-portal  HR-login  backup-notes.txt',
    'admin@hp-01:~$ exit',
  ].join('\n');

  function computeWave(t) {
    const ev = [];
    const blind = [];

    // 22:04 — external scan meets the edge
    if (t.tarpit.enabled) {
      ev.push({
        id: 'W-TARPIT', time: '22:04', sensor: 'FW-EDGE · TARPIT', severity: 'info',
        title: 'External scan from 198.51.100.7 caught in tarpit on :' + t.tarpit.port,
        source: '198.51.100.7', dest: 'FW-EDGE :' + t.tarpit.port, deception: true,
        raw: 'tarpit[' + t.tarpit.profile + ']: connection from 198.51.100.7 held 9m41s\nbanner-stream: 0 bytes of payload delivered\nverdict: scanner gained nothing but wasted time',
      });
    } else {
      ev.push({
        id: 'W-SCAN', time: '22:04', sensor: 'FW-EDGE', severity: 'warn',
        title: 'External port sweep from 198.51.100.7 hit the edge — nothing slowed it',
        source: '198.51.100.7', dest: 'FW-EDGE :22,80,3389', deception: false,
        raw: 'firewall: 412 SYN packets accepted in 31s from 198.51.100.7\nnote: no deception control engaged; scanner finished untouched',
      });
    }

    // 22:19 — SSH brute force looks for a decoy to fall into
    const hpArmed = t.honeypot.deployed && t.honeypot.segment === 'decoy-yard' && t.honeypot.services.ssh;
    if (hpArmed && t.honeypot.monitoring) {
      ev.push({
        id: 'W-HP', time: '22:19', sensor: 'HP-01 · honeypot', severity: 'alert',
        title: 'SSH brute force succeeded on decoy HP-01 — session opened from 198.51.100.44',
        source: '198.51.100.44', dest: 'HP-01 :22', deception: true,
        raw: HP_SESSION_RAW,
      });
    } else if (hpArmed) {
      ev.push({
        id: 'W-HP-NOMON', time: '22:19', sensor: 'HP-01 · honeypot', severity: 'warn',
        title: 'SSH sessions on decoy HP-01 were logged, but no alert fired (monitoring off)',
        source: '198.51.100.44', dest: 'HP-01 :22', deception: true,
        raw: 'decoy telemetry recorded 3 sessions from 198.51.100.44\nalerting: DISABLED — nobody was paged',
      });
    } else {
      blind.push('22:19 — SSH brute-force activity left no trace: no properly armed honeypot was listening in the decoy yard.');
    }

    // 22:36 — production file server shares browsed
    const hfPlanted = t.honeyfile.host === 'filesrv-01' && t.honeyfile.file !== 'none';
    if (hfPlanted && t.honeyfile.canary) {
      ev.push({
        id: 'W-HF', time: '22:36', sensor: 'FileSrv-01 · canary', severity: 'alert',
        title: 'HONEYFILE TRIPPED — ' + t.honeyfile.file + ' opened by WS-114; canary beacon fired',
        source: 'WS-114 (10.20.3.114)', dest: '\\\\FileSrv-01\\Finance\\' + t.honeyfile.file, deception: true,
        raw: 'audit 4663: open \\FileSrv-01\\Finance\\' + t.honeyfile.file + ' by WS-114\\j.doe\ncanary: beacon POST to SOC webhook received 0.8s later\nfile note: document contains decoy credentials, incl. canary account "svc_backup"',
      });
    } else if (hfPlanted) {
      ev.push({
        id: 'W-HF-NOCANARY', time: '22:36', sensor: 'FileSrv-01 · audit', severity: 'warn',
        title: t.honeyfile.file + ' was opened by WS-114 — logged, but no canary was attached',
        source: 'WS-114 (10.20.3.114)', dest: '\\\\FileSrv-01\\Finance\\' + t.honeyfile.file, deception: true,
        raw: 'audit 4663: file opened by WS-114\\j.doe\nnote: no canary beacon configured — SOC was not notified',
      });
    } else if (t.honeyfile.host === 'hp-01') {
      blind.push('22:36 — bait was planted on the decoy itself, where no legitimate file activity happens; the production file server went uncovered.');
    } else {
      blind.push('22:36 — the production file server was browsed; no honeyfile was planted, so nothing tripped.');
    }

    // 22:58 — beacon attempt to a fake C2 domain
    const sinkArmed = t.sinkhole.enabled && t.sinkhole.domain === 'cdn-metrics-sync.com';
    if (sinkArmed && t.sinkhole.logQueries) {
      ev.push({
        id: 'W-SINK', time: '22:58', sensor: 'DNS-01 · sinkhole', severity: 'alert',
        title: 'SINKHOLE HIT — WS-114 resolved cdn-metrics-sync.com to the sinkhole IP',
        source: 'WS-114 (10.20.3.114)', dest: 'cdn-metrics-sync.com → 10.66.0.9', deception: true,
        raw: 'dns: A? cdn-metrics-sync.com from 10.20.3.114\nanswer: 10.66.0.9 (SKH-01, controlled)\nverdict: process beaconing to known-fake C2 domain',
      });
    } else if (sinkArmed) {
      ev.push({
        id: 'W-SINK-NOLOG', time: '22:58', sensor: 'DNS-01 · sinkhole', severity: 'info',
        title: 'cdn-metrics-sync.com lookup was redirected — but query logging is off',
        source: 'WS-114 (10.20.3.114)', dest: 'cdn-metrics-sync.com → 10.66.0.9', deception: true,
        raw: 'dns: redirect served\nlogging: OFF — we blocked the beacon and learned nothing about who fired it',
      });
    } else {
      blind.push('22:58 — WS-114 beaconed to its C2 domain and the lookup resolved normally: no sinkhole was listening.');
    }

    // 23:14 — a bait identity is used
    const kindTitle = {
      'svc-acct': ['HONEYTOKEN USE — canary account "svc_backup" logged in to VPN-GW', '198.51.100.44 → VPN-GW :443', 'auth: SUCCESS account=svc_backup src=198.51.100.44\nnote: account created as a honeytoken; it has never been issued to a human'],
      'api-key': ['HONEYTOKEN USE — decoy API key presented to the cloud API', 'WS-114 → cloud API', 'api: key ak_live_D0n0TuSe accepted-and-alerted\nnote: key exists only to betray whoever steals it'],
      'web-beacon': ['HONEYTOKEN USE — hidden beacon in network-diagram.pdf was fetched', 'WS-114 → beacon host', 'http: GET /b/9f2c... from 10.20.3.114\nnote: beacon embedded in a marked decoy document'],
    };
    if (t.honeytoken.enabled) {
      const hit = kindTitle[t.honeytoken.kind];
      ev.push({
        id: 'W-HT', time: '23:14', sensor: 'Honeytoken', severity: 'alert',
        title: hit[0], source: hit[1], dest: hit[1], deception: true, raw: hit[2],
      });
    } else {
      blind.push('23:14 — a harvested credential was silently replayed on the VPN: no bait identity was seeded, so nothing fired.');
    }

    // 23:40 — decoy reaches for production: the fence moment
    if (t.fence.closed) {
      ev.push({
        id: 'W-FENCE', time: '23:40', sensor: 'FW-EDGE · fence', severity: 'info',
        title: 'FENCE HELD — decoy-to-production attempt from HP-01 to DB-01 was denied',
        source: 'HP-01 (10.66.0.50)', dest: 'DB-01 :1433', deception: false,
        raw: 'firewall: DENY vlan66 → vlan10 (decoy isolation rule)\nverdict: even a fully compromised decoy cannot pivot',
      });
    } else {
      ev.push({
        id: 'W-FENCE-OPEN', time: '23:40', sensor: 'FW-EDGE · fence', severity: 'alert',
        title: 'FENCE OPEN — a connection from the decoy VLAN reached DB-01 and was ALLOWED',
        source: 'HP-01 (10.66.0.50)', dest: 'DB-01 :1433', deception: false,
        raw: 'firewall: ALLOW 10.66.0.50 → 10.20.0.30 :1433 (no rule blocks vlan66 → vlan10)\nverdict: a compromised decoy is a pivot into production',
      });
    }

    return { events: ev, blindSpots: blind };
  }

  /* ── store ────────────────────────────────────────────────────────────────── */
  let state = defaultState();
  let hydrated = false;
  const listeners = new Set();

  function subscribe(fn) { listeners.add(fn); }
  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) { /* keep other listeners alive */ } }); }
  function commit() { if (hydrated) saveState(state); notify(); }

  function init() {
    const loaded = loadState();
    if (loaded) state = loaded;
    hydrated = true;
    notify();
  }

  function currentSession() { return state.sessions[state.activeMode]; }

  /* ── actions (same semantics as the original LabApi) ──────────────────────── */
  const actions = {
    patchTraps(trap, patch) {
      const mode = state.activeMode;
      const cur = state.sessions[mode].traps[trap];
      const merged = {};
      for (const k of Object.keys(cur)) merged[k] = cur[k];
      for (const k of Object.keys(patch)) {
        const v = patch[k];
        const isNested = v !== null && typeof v === 'object' && !Array.isArray(v);
        if (isNested && cur[k] && typeof cur[k] === 'object') {
          merged[k] = { ...cur[k], ...v };
        } else {
          merged[k] = v;
        }
      }
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...state.sessions[mode], traps: { ...state.sessions[mode].traps, [trap]: merged } } } };
      commit();
    },

    runWave() {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      const { events, blindSpots } = computeWave(s.traps);
      const keptFeed = s.feed.filter((e) => !e.id.startsWith('W-'));
      state = {
        ...state,
        sessions: {
          ...state.sessions,
          [mode]: {
            ...s,
            feed: [...keptFeed, ...events],
            waveRun: true,
            blindSpots,
            drills: { ...s.drills, reconSelected: [] },
          },
        },
      };
      commit();
    },

    setDrill(key, value) {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...s, drills: { ...s.drills, [key]: value } } } };
      commit();
    },

    /** silent variant for text inputs — persists without forcing a re-render */
    setDrillSilent(key, value) {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...s, drills: { ...s.drills, [key]: value } } } };
      if (hydrated) saveState(state);
    },

    checkObjective(id) {
      const def = window.LabObjectives.objectiveById(id);
      if (!def) return;
      const mode = state.activeMode;
      const s = state.sessions[mode];
      const pass = def.validate(s);
      const prog = s.objProgress[id] || { attempts: 0, hintsUsed: 0, done: false, firstTry: false };
      const next = {
        ...prog,
        attempts: prog.attempts + 1,
        done: prog.done || pass,
        firstTry: prog.done ? prog.firstTry : pass && prog.attempts === 0,
      };
      state = {
        ...state,
        sessions: {
          ...state.sessions,
          [mode]: {
            ...s,
            objProgress: { ...s.objProgress, [id]: next },
            objResults: { ...s.objResults, [id]: { pass, text: pass ? def.success : def.fail } },
          },
        },
      };
      commit();
    },

    useHint(id) {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      const prog = s.objProgress[id] || { attempts: 0, hintsUsed: 0, done: false, firstTry: false };
      state = {
        ...state,
        sessions: {
          ...state.sessions,
          [mode]: { ...s, objProgress: { ...s.objProgress, [id]: { ...prog, hintsUsed: prog.hintsUsed + 1 } } },
        },
      };
      commit();
    },

    answerQuiz(qid, idx) {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      if (s.quizChecked[qid]) return;
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...s, quizAnswers: { ...s.quizAnswers, [qid]: idx } } } };
      commit();
    },

    checkQuiz(qid) {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      if (s.quizAnswers[qid] === undefined) return;
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...s, quizChecked: { ...s.quizChecked, [qid]: true } } } };
      commit();
    },

    markCompletionShown() {
      const mode = state.activeMode;
      const s = state.sessions[mode];
      state = { ...state, sessions: { ...state.sessions, [mode]: { ...s, completedShown: true } } };
      commit();
    },

    switchMode(mode) {
      state = { ...state, activeMode: mode, entered: true };
      commit();
    },

    enter() {
      state = { ...state, entered: true };
      commit();
    },

    resetAll() {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* degrade gracefully */ }
      state = defaultState();
      commit();
    },
  };

  window.LabState = {
    init,
    subscribe,
    notify,
    commit,
    get state() { return state; },
    get hydrated() { return hydrated; },
    get persisted() { return STORAGE_OK; },
    session: currentSession,
    computeWave,
    actions,
  };
})();
