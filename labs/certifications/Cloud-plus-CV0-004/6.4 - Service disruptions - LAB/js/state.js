/* ===================
   The Network Clinic — CV0-004 Lesson 6.4 static port — state + persistence + shared helpers
   Vanilla ES2020+, classic scripts, load order: data -> state -> objectives -> quiz -> ui -> app.
   Bodies are verbatim from the audited build; only code motion, no logic edits.
   ============================================================ */
"use strict";

const LS_KEY = "cv0004_l64_lab_v1";
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (v) => String(v == null ? "" : v).trim().toLowerCase().replace(/\.$/, "");

function defaultState() {
  return {
    v: 1, mode: null, started: false, admitted: [], active: null, tab: "vitals",
    tool: { tool: "dig", target: "portal" },
    env: {
      dnsA: "", dnsTtl: "", dnsPrivName: "", dnsPrivIp: "", dnsApplied: false,
      poolAFix: "", poolAFixApplied: false, poolBOption: "", poolBOptionApplied: false, dhcpRenewed: false,
      ntpSources: [], ntpResynced: false,
      rechecked: { portal: false, vmpool: false, batch: false },
      prev_dns: [], prev_dhcp: [], prev_ntp: [],
      roles: {}, symptoms: {}, alerts: {}, anatomy: {}, mon_dns: false, mon_dhcp: "", mon_ntp: "",
      seq: SEQ.init.slice(), timeline: TL.init.slice()
    },
    obj: {}, log: [], quiz: { a: {}, submitted: false, correct: 0 }, done: false, logN: 0
  };
}
let S = defaultState();
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable — lab still works in-session */ } }
function load() { try { const raw = localStorage.getItem(LS_KEY); if (raw) { const d = JSON.parse(raw); if (d && d.v === 1) { S = Object.assign(defaultState(), d); S.env = Object.assign(defaultState().env, d.env); S.quiz = Object.assign({ a: {}, submitted: false, correct: 0 }, d.quiz); S.tool = Object.assign({ tool: "dig", target: "portal" }, d.tool); } } } catch (e) { S = defaultState(); } }
function logAdd(txt) { S.logN = (S.logN || 0) + 1; S.log.unshift({ n: S.logN, txt: txt }); if (S.log.length > 60) S.log.pop(); }

function ensureObj(id) { if (!S.obj[id]) S.obj[id] = { a: {}, attempts: 0, hintsUsed: 0, solved: false, fb: "", fbOk: false, firstAttempt: false }; return S.obj[id]; }

function modeObjs() { return OBJECTIVES.filter((o) => o.mode === (S.mode === "medium" ? "M" : "H")); }
