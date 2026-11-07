// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/objectives.js
// CHECK RESULTS engine: machine-checkable rules + educational feedback.
// Ported 1:1 from the framework lab's checks.ts — identical rules, identical
// pass/fail wording, identical star rubric.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  function mainTipId(st) {
    return st.repo.branches['main'];
  }
  function mainTipTree(st) {
    var c = st.repo.commits[mainTipId(st)];
    return (c && c.tree) || {};
  }
  function ancestryHas(st, target) {
    var tip = mainTipId(st);
    var seen = new Set();
    var stack = [tip];
    while (stack.length) {
      var c = stack.pop();
      if (!c || seen.has(c)) continue;
      seen.add(c);
      var cm = st.repo.commits[c];
      if (!cm) continue;
      if (c === target) return true;
      stack.push.apply(stack, cm.parents);
    }
    return false;
  }
  function lastCommitOn(st, branch) {
    var tip = st.repo.branches[branch];
    return tip ? st.repo.commits[tip] : undefined;
  }

  LAB.checkObjective = function (id, st) {
    var r = st.repo;
    switch (id) {
      case 'OBJ-M1':
        return {
          pass: st.registryAnswers['northgate'] === 'centralized' && st.registryAnswers['southside'] === 'distributed',
          ok: 'Correct on both counts. One manifest office = centralized; a full ledger in every clone = distributed. Git\'s distributed model is why branching, offline work and redundancy are cheap — and why every clone also carries every secret ever committed.',
          fail: 'Check the cards again: NORTHGATE commits against a single central server (centralized); SOUTHSIDE clones carry the complete history locally (distributed).'
        };
      case 'OBJ-M2': {
        var inc = r.incidents.find(function (i) { return i.id === 'inc-live'; });
        return {
          pass: !!(inc && inc.flagged),
          ok: 'Hazmat flagged. config/service.env holds a live cloud credential pair — committed by a contractor and still tracked. Every clone of this repo carries it (MITRE ATT&CK T1552.001: Credentials In Files). A defender\'s next move: confirm exposure scope, then plan rotation.',
          fail: 'Inspect the tracked files before flagging: only ONE holds a live production credential. Placeholders and revoked keys are noise, not hazmat.'
        };
      }
      case 'OBJ-M3':
        return {
          pass: st.forms['m3-commit'] === 'd4e5f6a',
          ok: 'Found it: d4e5f6a "chore: add CI service credentials for deploy job" by M. Renner (contractor), Sept 21. This is history forensics — the log answers who/what/when without touching production, and it anchors every remediation decision.',
          fail: 'Not the introducing commit. Follow the file, not the noise: which commit\'s diff ADDED config/service.env to the tree?'
        };
      case 'OBJ-M4':
        return {
          pass: !!r.branches['hotfix/nf-142'] && r.head === 'hotfix/nf-142',
          ok: 'Track laid: hotfix/nf-142 now exists and HEAD rides it. Branches are just movable pointers — they isolate work while main stays deployable. This is the precondition for every safe hotfix.',
          fail: 'The branch must be named exactly hotfix/nf-142 AND the HEAD locomotive must stand on it (create + switch).'
        };
      case 'OBJ-M5': {
        // tolerant to progress: fix staged now, or already landed in a commit on hotfix/nf-142
        var stagedOk = ('infra/main.tf' in r.staged) && !('docs/runbook.md' in r.staged);
        var cFix = lastCommitOn(st, 'hotfix/nf-142');
        var committedOk = !!cFix && ((cFix.tree['infra/main.tf'] ?? '').includes('t3.large'));
        // atomic = the hotfix commit's parent tree still holds the same runbook
        // (i.e. the commit carried ONLY the main.tf fix)
        var parentTree = (cFix && cFix.parents[0] && r.commits[cFix.parents[0]]) ? r.commits[cFix.parents[0]].tree : null;
        var atomic = !!cFix && !!parentTree && (cFix.tree['docs/runbook.md'] ?? null) === (parentTree['docs/runbook.md'] ?? null);
        return {
          pass: stagedOk || committedOk,
          ok: stagedOk ? 'Siding holds exactly the right railcar. The staging area is how you compose ATOMIC commits — one logical change each — so history stays readable, revertible and bisectable. The runbook edit waits for its own commit.'
            : atomic ? 'The fix landed as a clean atomic commit — the staging area used exactly as intended.'
            : 'The fix landed, but that commit also carried unrelated changes — in a real yard keep commits atomic (one logical change each) so history stays revertible and bisectable.',
          fail: 'Stage the t3.large fix (infra/main.tf) — and only that file; the runbook edit is noise for a different commit.'
        };
      }
      case 'OBJ-M6': {
        var c = lastCommitOn(st, 'hotfix/nf-142');
        var msg = (c && c.message) || '';
        var goodMsg = /nf-142/i.test(msg) && msg.trim().length > 10;
        var goodTree = !!c && (c.tree['infra/main.tf'] ?? '').includes('t3.large');
        return {
          pass: !!c && goodMsg && goodTree,
          ok: 'Committed and searchable. A message like this lets the next engineer (and the audit trail) understand the change in five seconds. Commit messages are documentation with a timestamp.',
          fail: !c || !((c.tree['infra/main.tf'] ?? '').includes('t3.large'))
            ? 'The commit must carry the staged t3.large fix on hotfix/nf-142. Is the fix still on the siding?'
            : 'The message must reference ticket NF-142 and describe the change (e.g. "fix: raise instance to t3.large (NF-142)").'
        };
      }
      case 'OBJ-M7': {
        var tree = mainTipTree(st);
        var vy = tree['deploy/values.yaml'] ?? '';
        // find a merge commit in main ancestry (survives later commits on main)
        var mergedOk = false;
        var seenM = new Set();
        var stackM = [mainTipId(st)];
        while (stackM.length) {
          var cmId = stackM.pop();
          if (!cmId || seenM.has(cmId)) continue;
          seenM.add(cmId);
          var cm = r.commits[cmId];
          if (!cm) continue;
          if (cm.parents.length === 2) {
            var mvy = cm.tree['deploy/values.yaml'] ?? '';
            if (/replicas:\s*5\b/.test(mvy) && !LAB.hasMarkers(mvy)) mergedOk = true;
          }
          stackM.push.apply(stackM, cm.parents);
        }
        var contentOk = /replicas:\s*5\b/.test(vy) && /eu-west-1/.test(vy) && /livenessProbe/.test(vy) && !LAB.hasMarkers(vy);
        var tagOk = !!r.tags['v1.4.0'] && !!r.commits[r.tags['v1.4.0']];
        return {
          pass: mergedOk && contentOk && tagOk,
          ok: 'Junction cleared: a true merge commit couples both tracks, the peak-season values survived (replicas 5, eu-west-1, probe intact) and tag v1.4.0 pins the release. Tags give cloud teams an exact, immutable answer to what is running.',
          fail: !mergedOk ? 'Main needs a MERGE commit (two parents) whose values.yaml keeps replicas: 5 — resolve the conflict, stage, then commit while the merge is in progress.'
            : !contentOk ? 'The current values.yaml must keep replicas: 5, deploymentRegion: eu-west-1 and the livenessProbe — with no conflict markers left.'
            : 'Stamp tag v1.4.0 from the Tag desk while on main.'
        };
      }
      case 'OBJ-M8': {
        var pr = r.prs.find(function (p) { return p.head === 'hotfix/nf-142' && p.base === 'main'; });
        return {
          pass: r.pushedBranches.includes('hotfix/nf-142') && !!pr && pr.approvals >= 1,
          ok: 'Dispatched and gated: the branch went to origin, the PR proposes it into main, and a review approval is recorded. Push → PR → review is the collaboration spine of CV0-004\'s source-control objective.',
          fail: !r.pushedBranches.includes('hotfix/nf-142') ? 'Push the branch to origin first — a PR needs a dispatched track.'
            : !pr ? 'Open the pull request FROM hotfix/nf-142 INTO main.'
            : 'Record one approving review on the PR — review is the gate, not a formality.'
        };
      }
      case 'OBJ-M9': {
        if (!r.scannerRun || r.scannerRun.length === 0) {
          return { pass: false, ok: '', fail: 'Run the secret sweep first, then triage every finding.' };
        }
        var allClassified = r.scannerRun.every(function (f) { return r.scannerVerdicts[f.key]; });
        if (!allClassified) return { pass: false, ok: '', fail: 'Every finding needs a verdict: TP or FP.' };
        var right = r.scannerRun.every(function (f) {
          var v = r.scannerVerdicts[f.key];
          return f.path === 'config/service.env' ? v === 'TP' : v === 'FP';
        });
        return {
          pass: right,
          ok: 'Clean triage: only the live pair in config/service.env is a true positive; template placeholders and the revoked sandbox key are noise. Precision matters — teams stop trusting a scanner that cries wolf.',
          fail: 'Ask of each finding: could this open a REAL door today? Placeholders (<REPLACE-ME>) and the revoked sandbox key are FPs — and remember BOTH flagged lines of config/service.env (the key ID line and the secret line) are parts of the same live pair: mark each of them TP.'
        };
      }
      case 'OBJ-M10': {
        var tree10 = mainTipTree(st);
        var gone = !('config/service.env' in tree10);
        var gi = tree10['.gitignore'] ?? '';
        var ignored = /(^|\n)\s*(\*\.env|config\/\*\.env)\s*(\n|$)/.test(gi);
        return {
          pass: gone && ignored,
          ok: 'The next commits no longer carry the secret, and *.env can never be tracked again. But note what did NOT happen: history still holds the key — d4e5f6a keeps it. That is why rotation (next objective) is not optional.',
          fail: !gone ? 'The remediation must land on MAIN: switch the HEAD locomotive to main first (checkout), then untrack config/service.env, stage your edited .gitignore, and commit.'
            : 'Add a *.env pattern to .gitignore and commit that too — prevention for every future .env.'
        };
      }
      case 'OBJ-M11': {
        var inc11 = r.incidents.find(function (i) { return i.id === 'inc-live'; });
        return {
          pass: !!(inc11 && inc11.revoked && inc11.replaced),
          ok: 'Key revoked, replacement issued. The old value is dead everywhere — every clone, every fork, every forgotten laptop. This is the response that actually closes the exposure (T1552.001); file hygiene only shrinks the surface.',
          fail: 'Rotation has two halves: revoke the old credential AND issue its replacement. One without the other is either an outage or an open door.'
        };
      }
      case 'OBJ-M12': {
        var p = r.protections;
        var okRoles = r.roles['m.renner'] === 'Reader';
        return {
          pass: p.directPushBlocked && p.requireReview && p.approvalsRequired >= 1 && r.ciBotToken && okRoles,
          ok: 'Mainline locked: no direct pushes, review required, the bot authenticates with a scoped deploy token, and the offboarded contractor holds only Reader. Four doors, four controls — least privilege in practice.',
          fail: 'Four switches on the Governance desk are still open. Walk them one by one: protection, review, bot credential, contractor role.'
        };
      }
      // ── HARD ──
      case 'OBJ-H1':
        return {
          pass: st.forms['h1-commit'] === 'd4e5f6a' && st.forms['h1-author'] === 'M. Renner (contractor)' && st.forms['h1-file'] === 'config/service.env',
          ok: 'Triple confirmed: d4e5f6a · M. Renner (contractor) · config/service.env. You saw past the decoys — placeholders, the revoked sandbox key and the untracked notes are noise. Only one credential in this yard opens a real door.',
          fail: 'One of the three is wrong. Remember: it must be LIVE (usable today), TRACKED in history, and you must name the commit that introduced it.'
        };
      case 'OBJ-H2': {
        var incH2 = r.incidents.find(function (i) { return i.id === 'inc-live'; });
        var rotated = !!(incH2 && incH2.revoked && incH2.replaced);
        var rotSeq = r.seq['rotate'];
        var treeH2 = mainTipTree(st);
        var goneH2 = !('config/service.env' in treeH2);
        var giH2 = treeH2['.gitignore'] ?? '';
        var ignoredH2 = /(^|\n)\s*\*\.env\s*(\n|$)/.test(giH2);
        // find the remediation commit: the one whose PARENT still carries the file
        // and whose own tree has dropped it (the commit that actually removed it)
        var remSeq;
        var tip = mainTipId(st);
        var seen = new Set();
        var stack = [tip];
        while (stack.length) {
          var cid = stack.pop();
          if (!cid || seen.has(cid)) continue;
          seen.add(cid);
          var cmH2 = r.commits[cid];
          if (!cmH2) continue;
          var parentH2 = cmH2.parents.length === 1 ? r.commits[cmH2.parents[0]] : undefined;
          if (parentH2 && !('config/service.env' in cmH2.tree) && ('config/service.env' in parentH2.tree)) {
            var seq = r.seq['commit:' + cid];
            if (seq !== undefined) remSeq = seq; // only in-session commits carry a seq entry
          }
          stack.push.apply(stack, cmH2.parents);
        }
        var ordered = rotated && rotSeq !== undefined && remSeq !== undefined && remSeq > rotSeq;
        var pass = rotated && goneH2 && ignoredH2;
        var orderNote = ordered ? '' : ' SEQUENCE NOTE: in a real incident the rotation must be recorded BEFORE the remediation commit — the exposure was already live. Noted for your after-action report.';
        return {
          pass: pass,
          ok: 'Protocol executed: rotation first (the exposure was already live), untrack + .gitignore + remediation commit second.' + orderNote,
          fail: !rotated ? 'Step one is rotation: revoke + replace BEFORE touching the repo.'
            : 'Finish the repo hygiene: *.env in .gitignore, untrack the file, commit it on main.'
        };
      }
      case 'OBJ-H3':
        return {
          pass: st.forms['h3-strategy'] === 'trunk' && st.forms['h3-cadence'] === 'daily' && st.forms['h3-lifetime'] === 'short' && !!r.branches['feat/nf-201'],
          ok: 'Trunk-based with short-lived branches fits a six-engineer team shipping daily: integration pain scales with branch age, so merge daily and keep branches under two days. feat/nf-201 demonstrates the pattern.',
          fail: 'Re-read the constraint: SIX engineers, DAILY deploys. Long-lived branches (GitFlow) would stack integration risk. Then create feat/nf-201 to demonstrate.'
        };
      case 'OBJ-H4': {
        var treeH4 = mainTipTree(st);
        var vyH4 = treeH4['deploy/values.yaml'] ?? '';
        var tfH4 = treeH4['infra/main.tf'] ?? '';
        var sg = ancestryHas(st, 'e9f0a1b');
        var feat = ancestryHas(st, 'd0e1f2a');
        var contentOkH4 = /replicas:\s*5\b/.test(vyH4) && /eu-west-1/.test(vyH4) && /livenessProbe/.test(vyH4) && !LAB.hasMarkers(vyH4)
          && /t3\.large/.test(tfH4) && /10\.40\.7\.0\/24/.test(tfH4) && !/0\.0\.0\.0\/0/.test(tfH4) && !LAB.hasMarkers(tfH4);
        return {
          pass: sg && feat && contentOkH4,
          ok: 'Both tracks coupled into main and the semantics survived: egress locked to the broker CIDR, t3.large kept, replicas 5 in eu-west-1, probes intact. You also saw Git auto-merge disjoint edits — conflicts only bite in overlapping regions.',
          fail: !sg || !feat ? 'Both branch tips must be in main\'s ancestry — merge hotfix/security-group AND feature/replica-scale.'
            : 'Content check failed. Expected: main.tf with t3.large AND 10.40.7.0/24 (no 0.0.0.0/0); values.yaml with replicas 5, eu-west-1, probe, no markers. Hint: merge refuses while main.tf is dirty — commit it first.'
        };
      }
      case 'OBJ-H5':
        return {
          pass: (r.scannerPattern ?? '').trim() === 'AKIA[A-Z0-9]{16}' && !!r.scannerRun && r.scannerRun.length === 1 && r.scannerRun[0] && r.scannerRun[0].path === 'config/service.env',
          ok: 'Pattern locked: AKIA[A-Z0-9]{16} — vendor key format, zero false positives, one true positive. That is detection engineering: precision high enough that every alert deserves a rotation.',
          fail: 'Run all three candidates against the corpus and compare. The winner must flag the live key ONLY — no placeholders, no dead test keys, and then be left as the final pattern.'
        };
      case 'OBJ-H6':
        return {
          pass: r.auditFindings.forcedPush === 'e4' && r.auditFindings.patToRevoke === 'pat_renner_7f3' && r.auditActions.patRevoked && r.auditActions.protectionRestored,
          ok: 'Contained: the force-push identified (e4), the offboarded contractor\'s PAT revoked, protection restored. The audit stream told the whole story — repeated off-hours access with one stale token, escalation to settings, then a direct push.',
          fail: 'Select the force-push entry, name the token that recurs across the suspicious events, then execute BOTH containment actions.'
        };
      case 'OBJ-H7':
        return {
          pass: r.ciStages.length === LAB.CI_STAGE_CORRECT.length && r.ciStages.every(function (s, i) { return s === LAB.CI_STAGE_CORRECT[i]; }) && r.protections.directPushBlocked && r.protections.requireReview,
          ok: 'Gate built: verify-shaped stages before terraform apply (the point of no return), and main is protected on both counts. This pipeline is a supply-chain control (T1195.002) as much as a quality gate.',
          fail: 'The sequence must be: lint → secret scan → unit tests → terraform plan → policy check → terraform apply. Then enable both main protections.'
        };
      case 'OBJ-H8': {
        var treeH8 = mainTipTree(st);
        var noScale = !('infra/autoscale.tf' in treeH8);
        var df = treeH8['app/api/Dockerfile'] ?? '';
        var nodeOk = /node:20-alpine/.test(df) && !/node:22-alpine/.test(df);
        var tagOkH8 = !!r.tags['v2.0.1'] && !!r.commits[r.tags['v2.0.1']];
        return {
          pass: noScale && nodeOk && tagOkH8 && !r.forcePushUsed,
          ok: 'Recovered without rewriting history: two revert commits undo the bad release, v2.0.1 pins the recovered state, and every crew\'s clone is still valid. The red button stayed untouched — force-push would have broken every clone and every audit trail.',
          fail: !noScale || !nodeOk ? 'Revert BOTH bad commits (autoscaling + node bump) on main — revert adds undo commits, it does not erase history.'
            : !tagOkH8 ? 'Stamp tag v2.0.1 on main\'s recovered tip.'
            : 'The force-push must NOT be used — it is the trap. Use reverts only.'
        };
      }
      case 'OBJ-H9':
        return {
          pass: r.roles['n.okafor'] === 'Maintainer' && r.roles['l.varga'] === 'Developer' && r.roles['t.achebe'] === 'Developer' && r.roles['m.renner'] === 'Remove' && r.roles['j.pipeline'] === 'Bot' && r.ciBotToken,
          ok: 'Least privilege restored: the lead can govern, developers develop, the bot runs on a scoped token, and the offboarded contractor holds nothing at all. Removal is a privilege decision — the audit log showed you why.',
          fail: 'Map each identity to its real need. The contractor is offboarded (and the audit showed abuse) — the right role is Remove. The bot needs a token, not a human role with shared credentials.'
        };
      default:
        return { pass: false, ok: '', fail: 'Unknown objective.' };
    }
  };

  LAB.starFor = function (attempts, hintsUsed) {
    if (attempts <= 1 && hintsUsed === 0) return 3;
    if (attempts <= 2 && hintsUsed <= 1) return 2;
    return 1;
  };
})(window.LAB = window.LAB || {});
