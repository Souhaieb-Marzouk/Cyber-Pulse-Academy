/* ============================================================
 * CONTROLS BRIDGE — Client-side Tutor (degraded from backend API)
 * The original lab used a z-ai-web-dev-sdk backend route for the
 * AI tutor. This static version replaces it with a local,
 * rule-based helper that matches keywords to pre-written guidance.
 *
 * It maintains the same educational tone: never gives direct
 * answers, only Socratic guidance, definitions, and worked examples.
 * Clearly labeled as a built-in offline helper.
 * ============================================================ */

var Lab = window.Lab || {};

Lab.tutor = (function() {
  "use strict";

  var data = Lab.data;

  // Knowledge base: keyword patterns → guidance responses.
  // Each entry: { keywords: [strings], response: "guidance text" }
  var KNOWLEDGE_BASE = [
    {
      keywords: ["category", "categories", "technical", "managerial", "operational", "physical", "how is it implemented", "implementation"],
      response: "Categories answer 'how is the control implemented?'. The four CompTIA categories are Technical (hardware/software), Managerial (policies/governance), Operational (people/day-to-day), and Physical (locks/fences/CCTV). Look at the Knowledge Core 'Categories' card, then try to classify a control by asking: is this a thing, a document, a person's action, or a physical barrier?",
    },
    {
      keywords: ["function", "functions", "preventive", "detective", "corrective", "deterrent", "compensating", "directive", "mitigating", "what does it do"],
      response: "Functions answer 'what does the control do?'. Preventive blocks before; Detective alerts during/after; Corrective restores after; Deterrent discourages; Compensating substitutes when primary fails; Directive instructs behavior; Mitigating limits impact. Try to classify a control by asking: does this stop the attack, find the attack, fix the damage, or something else?",
    },
    {
      keywords: ["layered", "layer", "defense in depth", "depth", "onion", "perimeter", "network", "host", "application", "data"],
      response: "Defense in depth places controls at 5 layers: Perimeter (edge) → Network (internal routing) → Host (machines) → Application (software) → Data (the asset). Each layer assumes the one outside it failed. Look at the Controls Bridge — the 5 spans are these layers. An attacker must defeat controls at every layer to reach the data.",
    },
    {
      keywords: ["cia", "confidentiality", "integrity", "availability", "triad"],
      response: "The CIA triad: Confidentiality (secrecy), Integrity (unalterability), Availability (accessibility). Every control primarily protects one. Encryption → C. Hashing → I. Backups → A. Ask yourself: if this control failed, what would be lost — secrecy, correctness, or access?",
    },
    {
      keywords: ["classify", "classification", "ngfw", "firewall", "edr", "how do i classify"],
      response: "To classify a control: (1) read its artifacts (click the document icon on the plate), (2) ask 'how is it built?' for the category, (3) ask 'what does it do?' for the function. For example, a firewall is built in hardware/software (Technical) and blocks traffic before it succeeds (Preventive). Try this approach on the control you're stuck on.",
    },
    {
      keywords: ["compensating", "compensate", "when primary fails", "backup", "failover", "substitute"],
      response: "A compensating control SUBSTITUTES for a primary control that is unavailable or has failed. The key test: does this control exist BECAUSE the primary cannot be guaranteed? Example: a secondary ISP link is compensating because the primary link cannot be guaranteed 100%. Ask: what would happen if the primary control went down — does this control take over?",
    },
    {
      keywords: ["detective", "detect", "alert", "log", "monitor", "ids", "audit"],
      response: "A detective control ALERTS on activity that has already begun or has occurred. Logs, IDS alerts, EDR alerts, CCTV review — all detective. The key question: does this control tell you something happened AFTER it happened? If yes, it's detective. If it stops the thing from happening, it's preventive.",
    },
    {
      keywords: ["audit logging", "audit log", "logging", "log is what", "preventive or detective"],
      response: "Audit logging is DETECTIVE, not preventive. It tells you what happened after the fact. A common exam trap is calling logs 'preventive' — they're not. The preventive sibling of logging is INPUT VALIDATION (which stops bad input before it's processed). If you're on OBJ-M7, this is the key: CTL-018 is mislabeled as preventive; correct it to detective.",
    },
    {
      keywords: ["stress test", "disable", "offline", "what happens when", "ngfw fails"],
      response: "The stress test lets you take a control offline and see what compensates. For OBJ-M8: toggle CTL-001 (NGFW) offline using the stress-test switch on the Perimeter span. Then look for which control compensates — it's the one that exists BECAUSE the NGFW can't be guaranteed 100%. That's the SD-WAN secondary ISP link (CTL-004).",
    },
    {
      keywords: ["gap", "missing", "coverage", "what's missing", "incomplete"],
      response: "To find coverage gaps: list the functions present on a layer (walk each control plate and note its function tag), then compare to the 7 possible functions. Whatever's not there is the gap. For OBJ-M9: the Host layer has preventive, detective, and corrective — but no compensating. A defender would add one.",
    },
    {
      keywords: ["sequence", "order", "arrange", "timeline", "first", "drag"],
      response: "For sequence objectives: read the brief carefully, then click items from the pool to add them in order. Use the up/down arrows to reorder. The pool is shuffled so the order doesn't reveal the answer. Think about what happens FIRST in the attack timeline — that goes at position 1.",
    },
    {
      keywords: ["quiz", "check answer", "locked", "next question", "can't change"],
      response: "The quiz works one question at a time: select an answer, press 'Check Answer' to lock it (you can't change it after), read the explanation, then press 'Next Question'. Your answer is locked after checking — choose carefully. You can navigate between questions using the numbered dots above.",
    },
    {
      keywords: ["hint", "stuck", "help", "don't know", "confused", "lost"],
      response: "I can give you definitions, walk through analogous examples, or ask you a guiding question — but I won't give the direct answer. Try telling me which objective you're on and what you've tried so far. You can also use the tiered hint buttons (3 levels) in the Objective Tracker — they get more specific with each level.",
    },
    {
      keywords: ["residual risk", "capstone", "redesign", "design a control"],
      response: "For the capstone (OBJ-H10): pick a corrective control for the Application layer (e.g., a CI/CD redeploy pipeline that reverts to a known-good build). Classify it (Technical, Corrective), name the CIA component it protects (Availability), and CRITICALLY — name a residual risk (what does this control NOT fix?). The residual risk is what separates a strong answer from a rote one.",
    },
    {
      keywords: ["hello", "hi", "hey", "start", "what can you do"],
      response: "Hi — I'm your built-in offline tutor for Medium mode. I can give definitions, walk through analogous examples, or ask you a guiding question. I won't give direct answers — that would defeat the practice. What are you stuck on? Tell me the objective ID or the concept you're working on.",
    },
  ];

  // Default response when no keywords match.
  var DEFAULT_RESPONSE =
    "I can help with: control categories (Technical/Managerial/Operational/Physical), control functions (Preventive/Detective/Corrective/Deterrent/Compensating/Directive/Mitigating), defense in depth (the 5 layers), the CIA triad, or specific objectives. Tell me which concept you're working on, or ask 'what is [concept]?' and I'll guide you toward the answer without giving it away.";

  // ---- Match a question to a knowledge base entry ----
  function findResponse(question) {
    var q = question.toLowerCase();
    var bestMatch = null;
    var bestScore = 0;

    KNOWLEDGE_BASE.forEach(function(entry) {
      var score = 0;
      entry.keywords.forEach(function(kw) {
        if (q.indexOf(kw) !== -1) {
          // Longer keyword matches score higher.
          score += kw.length;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    });

    return bestMatch ? bestMatch.response : DEFAULT_RESPONSE;
  }

  // ---- Public API ----
  // Returns a Promise to maintain the same async interface as the original.
  function ask(question, context) {
    return new Promise(function(resolve) {
      // Simulate brief "thinking" delay for UX consistency with the original.
      setTimeout(function() {
        var response = findResponse(question);
        resolve(response);
      }, 400 + Math.random() * 300);
    });
  }

  return {
    ask: ask,
    KNOWLEDGE_BASE_SIZE: KNOWLEDGE_BASE.length,
  };
})();
